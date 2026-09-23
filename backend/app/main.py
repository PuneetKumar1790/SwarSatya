"""SwarSatya - Real-Time Multi-Layer Voice Security & Impersonation Defense Framework (SIH #26104)."""
import asyncio
import base64
import json
import logging
import os
import time
import uuid
from contextlib import asynccontextmanager
from typing import Dict, List, Optional, Set, Any

import numpy as np
import soundfile as sf
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.audio.vad import vad_detector
from app.audio.spectral import spectral_analyzer
from app.audio.prosody import prosody_analyzer
from app.db import (
    create_session, end_session, init_db, log_risk_chunk,
    create_security_incident, get_incidents, resolve_incident,
    set_privacy_config, get_privacy_config, get_audit_trail, log_audit_event,
    add_feedback, get_all_feedback
)
from app.models.asr import speech_recognizer
from app.models.deepfake import deepfake_detector
from app.models.scam_rules import scam_detector
from app.models.speaker import speaker_engine
from app.risk.context import context_engine
from app.risk.fusion import risk_fusion_engine, POLICY_PROFILES
from app.risk.copilot import scam_copilot

# Setup Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("swarsatya")

DEMO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "demo_audio"))


class RoomState:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.session_id = str(uuid.uuid4())
        self.connections: Set[WebSocket] = set()
        self.rolling_transcript: str = ""
        self.detected_patterns: List[str] = []
        self.detected_language: str = "en"
        
        # Multi-layer intermediate risk states
        self.synthetic_risk: float = 0.0
        self.spectral_risk: float = 0.0
        self.prosody_risk: float = 0.0
        self.speaker_similarity: float = 100.0
        self.speaker_mismatch_risk: float = 0.0
        self.context_risk: float = 0.0
        self.scam_risk: float = 0.0
        self.overall_risk: float = 0.0
        self.threat_tier: str = "LOW"
        self.recommended_action: str = "Normal conversation. No threat detected."
        self.action_code: str = "ALLOW"
        self.requires_hold: bool = False

        # Contextual metadata (dynamic per call)
        self.caller_number: str = "+91-91234-56789"
        self.claimed_identity_id: str = "cfo_rahul"
        self.transaction_amount: float = 2500000.0
        self.action_type: str = "Urgent Fund Transfer"
        self.language_setting: str = "auto"

        # Peak metrics for session archive
        self.peak_synthetic_risk: float = 0.0
        self.peak_scam_risk: float = 0.0
        self.peak_overall_risk: float = 0.0
        self.final_tier: str = "LOW"
        self.chunk_count: int = 0

        # Background async processing queue for live chunks (no dropping!)
        self.chunk_queue: asyncio.Queue = asyncio.Queue(maxsize=10)
        self.queue_worker_task: Optional[asyncio.Task] = None
        self.demo_task: Optional[asyncio.Task] = None
        self.is_active: bool = True

        # MFA Challenge state for simulated banking transaction
        self.pending_mfa_code: Optional[str] = None
        self.mfa_attempts: int = 0
        self.transaction_held: bool = False
        self.active_incident_id: Optional[str] = None

        # Initialize SQLite session
        create_session(self.session_id, self.room_id)


class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, RoomState] = {}

    def get_or_create_room(self, room_id: str) -> RoomState:
        if room_id not in self.rooms:
            room = RoomState(room_id)
            self.rooms[room_id] = room
            try:
                loop = asyncio.get_running_loop()
                room.queue_worker_task = loop.create_task(self._audio_queue_worker(room))
            except RuntimeError:
                room.queue_worker_task = None
            logger.info(f"Created new call session {room.session_id} for room '{room_id}'")
        return self.rooms[room_id]

    async def _audio_queue_worker(self, room: RoomState):
        """Worker task processing audio chunks in sequence without dropping live voice."""
        while room.is_active:
            try:
                audio_np, chunk_index, source_type = await room.chunk_queue.get()
                await process_audio_chunk(room.room_id, audio_np, chunk_index, source_type=source_type)
                room.chunk_queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Queue worker error in room {room.room_id}: {e}")

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        room = self.get_or_create_room(room_id)
        room.connections.add(websocket)
        logger.info(f"WebSocket client connected to room '{room_id}'. Total peers: {len(room.connections)}")

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.rooms:
            room = self.rooms[room_id]
            room.connections.discard(websocket)
            logger.info(f"WebSocket client disconnected from room '{room_id}'. Remaining peers: {len(room.connections)}")
            if not room.connections:
                room.is_active = False
                if room.queue_worker_task and not room.queue_worker_task.done():
                    room.queue_worker_task.cancel()
                if room.demo_task and not room.demo_task.done():
                    room.demo_task.cancel()
                # Finalize DB call session
                end_session(
                    room.session_id,
                    room.peak_synthetic_risk,
                    room.peak_scam_risk,
                    room.peak_overall_risk,
                    room.final_tier,
                    room.chunk_count,
                    room.rolling_transcript
                )
                del self.rooms[room_id]
                logger.info(f"Room '{room_id}' closed and archived to SQLite.")

    async def broadcast(self, room_id: str, message: dict, exclude: Optional[WebSocket] = None):
        if room_id in self.rooms:
            payload = json.dumps(message)
            dead_connections = []
            for ws in self.rooms[room_id].connections:
                if ws != exclude:
                    try:
                        await ws.send_text(payload)
                    except Exception as e:
                        logger.error(f"Failed to send to client in room {room_id}: {e}")
                        dead_connections.append(ws)
            for dead in dead_connections:
                self.rooms[room_id].connections.discard(dead)


manager = RoomManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SwarSatya database and warming ML models...")
    init_db()
    loop = asyncio.get_running_loop()
    loop.run_in_executor(None, deepfake_detector.load_model)
    loop.run_in_executor(None, speech_recognizer.load_model)
    logger.info("ML models scheduled for warm-up.")
    yield
    logger.info("SwarSatya backend shutdown.")


app = FastAPI(
    title="SwarSatya Real-Time Voice Security Operations Center API",
    description="Multi-Layer Real-Time Voice Impersonation & Cloning Defense Framework (SIH #26104)",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return JSONResponse({
        "status": "ok",
        "app": "SwarSatya Voice SOC",
        "models_loaded": {
            "deepfake": deepfake_detector.is_loaded,
            "asr": speech_recognizer.is_loaded,
            "speaker_biometrics": True,
            "spectral_engine": True,
            "prosody_engine": True,
            "context_engine": True
        },
        "active_rooms": len(manager.rooms),
        "privacy": get_privacy_config()
    })


@app.get("/api/demo/scenarios")
async def get_demo_scenarios():
    scenarios = [
        {
            "id": "real_normal",
            "title": "Scenario 1: Verified CFO Call (Real Voice, Legitimate)",
            "expected": "LOW Risk (~12%) | Policy: ALLOW",
            "description": "Authentic CFO voice discussing schedule. Biometric similarity matches enrolled profile (88%). Zero synthetic artifacts.",
            "caller": "+91-98110-45291 (Registered Corporate PBX)",
            "amount": 0.0
        },
        {
            "id": "cloned_normal",
            "title": "Scenario 2: Cloned CFO Voice (Low Urgency Probe)",
            "expected": "CAUTION (~52%) | Policy: MONITOR",
            "description": "AI-generated voice clone discussing work mockups. Phase distortion & vocoder roll-off flagged; speaker deviation detected.",
            "caller": "+91-91234-56789 (Unregistered Line)",
            "amount": 50000.0
        },
        {
            "id": "real_scam",
            "title": "Scenario 3: Legal Authority Extortion (Human Voice)",
            "expected": "HIGH Risk (~72%) | Policy: HOLD & WARN",
            "description": "Impersonation of Police/CBI creating urgent legal threat and arrest demand. ASR NLP triggers flagged.",
            "caller": "+91-98765-43210 (Known Flagged Gate)",
            "amount": 500000.0
        },
        {
            "id": "cloned_scam",
            "title": "Scenario 4: High-Stakes Impersonation Attack (Cloned + ₹25L Transfer)",
            "expected": "CRITICAL (~92%) | Policy: BLOCK & ESCALATE",
            "description": "Cloned executive voice ordering urgent ₹25 Lakh wire transfer with secrecy extortion. Pre-transaction hold triggered.",
            "caller": "+91-91234-56789 (Spoofed Origin)",
            "amount": 2500000.0
        }
    ]
    return JSONResponse({"scenarios": scenarios})


async def process_audio_chunk(room_id: str, audio_np: np.ndarray, chunk_index: int, source_type: str = "live"):
    """
    End-to-End Multi-Layer Voice Security Analysis Pipeline:
    1. VAD Gate (RMS energy + webrtcvad)
    2. Deepfake Wav2Vec2 Model
    3. Spectral & Phase Inconsistency Analysis
    4. Prosodic Cadence & Pitch Tracking (F0)
    5. Speaker Biometric Verification against Enrolled Profile
    6. Multilingual Whisper ASR & Scam Pattern Regex
    7. Contextual Enrichment & Transaction Scaling
    8. Dynamic 4-Way Risk Fusion & Policy Response
    9. SQLite Persistence & Real-Time Broadcast
    """
    room = manager.get_or_create_room(room_id)
    t0 = time.time()

    # 1. Voice Activity Detection
    is_speech = vad_detector.is_speech_chunk(audio_np)
    if not is_speech:
        # Graceful decay during silence
        room.scam_risk *= 0.92
        fused = risk_fusion_engine.fuse(
            room.synthetic_risk,
            room.spectral_risk,
            room.prosody_risk,
            room.speaker_mismatch_risk,
            room.context_risk,
            room.scam_risk
        )
        latency_ms = (time.time() - t0) * 1000.0
        copilot_guidance = scam_copilot.generate_defense_guidance(
            room.rolling_transcript,
            room.detected_patterns
        )
        update_msg = {
            "type": "risk_update",
            "room_id": room_id,
            "timestamp": time.time(),
            "chunk_index": chunk_index,
            "is_speech": False,
            "overall_risk": fused["overall_risk"],
            "threat_tier": fused["threat_tier"],
            "action_code": fused["action_code"],
            "recommended_action": fused["recommended_action"],
            "requires_hold": fused["requires_hold"],
            "layer_breakdown": fused["layer_breakdown"],
            "defense_copilot": copilot_guidance,
            "contributing_factors": fused["contributing_factors"],
            "transcript_snippet": "",
            "detected_patterns": room.detected_patterns,
            "detected_language": room.detected_language,
            "processing_latency_ms": round(latency_ms, 1),
            "source_type": source_type
        }
        await manager.broadcast(room_id, update_msg)
        return

    # 2. Multi-Layer Extraction Concurrently
    loop = asyncio.get_running_loop()
    
    # Run heavy models and analytical routines in thread pool
    future_deepfake = loop.run_in_executor(None, deepfake_detector.score_chunk, audio_np, 16000)
    future_spectral = loop.run_in_executor(None, spectral_analyzer.analyze, audio_np)
    future_prosody = loop.run_in_executor(None, prosody_analyzer.analyze, audio_np)
    future_speaker = loop.run_in_executor(None, speaker_engine.verify_speaker, audio_np, room.claimed_identity_id)
    future_asr = loop.run_in_executor(None, speech_recognizer.transcribe_chunk, audio_np, 16000, room.language_setting)

    (
        synthetic_risk,
        spectral_data,
        prosody_data,
        speaker_data,
        (transcript_chunk, detected_lang)
    ) = await asyncio.gather(
        future_deepfake,
        future_spectral,
        future_prosody,
        future_speaker,
        future_asr
    )

    # 3. Update Room Analytical Metrics
    room.synthetic_risk = synthetic_risk
    room.spectral_risk = spectral_data["spectral_risk"]
    room.prosody_risk = prosody_data["prosody_risk"]
    room.speaker_similarity = speaker_data["speaker_similarity"]
    room.speaker_mismatch_risk = speaker_data["mismatch_risk"]
    room.detected_language = detected_lang

    if transcript_chunk:
        room.rolling_transcript = (
            f"{room.rolling_transcript} {transcript_chunk}".strip()
            if room.rolling_transcript else transcript_chunk
        )

    # 4. Scam Rules
    scam_risk, new_patterns = scam_detector.evaluate_text(transcript_chunk, room.scam_risk)
    room.scam_risk = scam_risk
    for p in new_patterns:
        if p not in room.detected_patterns:
            room.detected_patterns.append(p)

    # 5. Contextual Risk Evaluation
    context_data = context_engine.evaluate_context(
        caller_number=room.caller_number,
        claimed_identity_id=room.claimed_identity_id,
        transaction_amount=room.transaction_amount,
        action_type=room.action_type
    )
    room.context_risk = context_data["context_risk"]

    # 6. Unified Dynamic Risk Fusion
    fused = risk_fusion_engine.fuse(
        synthetic_risk=room.synthetic_risk,
        spectral_risk=room.spectral_risk,
        prosody_risk=room.prosody_risk,
        speaker_mismatch_risk=room.speaker_mismatch_risk,
        context_risk=room.context_risk,
        scam_risk=room.scam_risk
    )

    room.overall_risk = fused["overall_risk"]
    room.threat_tier = fused["threat_tier"]
    room.action_code = fused["action_code"]
    room.recommended_action = fused["recommended_action"]
    room.requires_hold = fused["requires_hold"]

    # Update Peak Stats
    room.chunk_count += 1
    room.peak_synthetic_risk = max(room.peak_synthetic_risk, synthetic_risk)
    room.peak_scam_risk = max(room.peak_scam_risk, scam_risk)
    room.peak_overall_risk = max(room.peak_overall_risk, room.overall_risk)
    room.final_tier = room.threat_tier

    latency_ms = (time.time() - t0) * 1000.0

    # 7. Automated Pre-Transaction Protection & Incident Generation
    if fused["requires_hold"] and not room.transaction_held:
        room.transaction_held = True
        # Generate automated security incident ticket
        room.active_incident_id = create_security_incident(
            session_id=room.session_id,
            room_id=room_id,
            risk_score=room.overall_risk,
            threat_tier=room.threat_tier,
            caller_number=room.caller_number,
            claimed_identity=speaker_data["claimed_identity"],
            transaction_amount=room.transaction_amount,
            action_taken=f"TRANSACTION_HELD ({fused['action_code']})",
            reason="; ".join(fused["contributing_factors"])
        )

    # 8. Log to SQLite
    log_risk_chunk(
        session_id=room.session_id,
        room_id=room_id,
        chunk_index=chunk_index,
        synthetic_risk=synthetic_risk,
        scam_risk=scam_risk,
        overall_risk=room.overall_risk,
        threat_tier=room.threat_tier,
        transcript_snippet=transcript_chunk,
        detected_patterns=new_patterns,
        processing_latency_ms=round(latency_ms, 1)
    )

    # 8. Generate Real-Time Scam Defense Copilot Guidance
    copilot_guidance = scam_copilot.generate_defense_guidance(
        room.rolling_transcript,
        room.detected_patterns
    )

    # 9. Real-time WebSocket Broadcast
    update_msg = {
        "type": "risk_update",
        "room_id": room_id,
        "timestamp": time.time(),
        "chunk_index": chunk_index,
        "is_speech": True,
        "overall_risk": room.overall_risk,
        "threat_tier": room.threat_tier,
        "action_code": room.action_code,
        "recommended_action": room.recommended_action,
        "requires_hold": room.requires_hold,
        "transaction_held": room.transaction_held,
        "active_incident_id": room.active_incident_id,
        "layer_breakdown": fused["layer_breakdown"],
        "telemetry": {
            "spectral": spectral_data,
            "prosody": prosody_data,
            "speaker": speaker_data,
            "context": context_data
        },
        "defense_copilot": copilot_guidance,
        "contributing_factors": fused["contributing_factors"],
        "transcript_snippet": transcript_chunk,
        "detected_patterns": room.detected_patterns,
        "detected_language": room.detected_language,
        "processing_latency_ms": round(latency_ms, 1),
        "source_type": source_type
    }
    await manager.broadcast(room_id, update_msg)


def slice_audio_at_pauses(audio: np.ndarray, sr: int, target_sec: float = 3.2) -> list:
    """Slices audio at natural low-energy/silence points with a rapid 3.0s window."""
    chunks = []
    start = 0
    target_samples = int(target_sec * sr)
    search_half = int(0.8 * sr)

    while start < len(audio):
        nominal = start + target_samples
        if nominal >= len(audio) - int(1.0 * sr):
            chunks.append(audio[start:])
            break

        search_start = max(start + int(1.8 * sr), nominal - search_half)
        search_end = min(len(audio), nominal + search_half)

        hop = int(0.04 * sr)
        min_energy = float('inf')
        best_idx = nominal
        for i in range(search_start, search_end - hop, hop):
            e = np.mean(audio[i : i + hop] ** 2)
            if e < min_energy:
                min_energy = e
                best_idx = i

        chunks.append(audio[start:best_idx])
        start = best_idx

    return chunks


async def run_demo_audio_stream(room_id: str, scenario: str):
    """Streams pre-recorded demo clips through the exact multi-layer pipeline."""
    wav_file = os.path.join(DEMO_DIR, f"{scenario}.wav")
    if not os.path.exists(wav_file):
        logger.error(f"Demo file not found: {wav_file}")
        return

    room = manager.get_or_create_room(room_id)
    # Set realistic scenario context
    if scenario == "real_normal":
        room.caller_number = "+91-98110-45291"
        room.claimed_identity_id = "cfo_rahul"
        room.transaction_amount = 0.0
        room.action_type = "Project Review"
    elif scenario == "cloned_normal":
        room.caller_number = "+91-91234-56789"
        room.claimed_identity_id = "cfo_rahul"
        room.transaction_amount = 50000.0
        room.action_type = "Vendor Inquiry"
    elif scenario == "real_scam":
        room.caller_number = "+91-98765-43210"
        room.claimed_identity_id = "unknown"
        room.transaction_amount = 500000.0
        room.action_type = "Urgent Legal Penalty"
    elif scenario == "cloned_scam":
        room.caller_number = "+91-91234-56789"
        room.claimed_identity_id = "cfo_rahul"
        room.transaction_amount = 2500000.0
        room.action_type = "Urgent Fund Transfer"

    logger.info(f"Starting Demo Mode '{scenario}' for room '{room_id}'...")
    data, sr = sf.read(wav_file)
    if len(data.shape) > 1:
        data = np.mean(data, axis=1)
    data = data.astype(np.float32)

    chunks = slice_audio_at_pauses(data, sr, target_sec=3.2)

    for i, chunk in enumerate(chunks):
        if len(chunk) < 6000:
            break
        await process_audio_chunk(room_id, chunk, chunk_index=i + 1, source_type="demo")
        chunk_sec = len(chunk) / sr
        await asyncio.sleep(chunk_sec)

    logger.info(f"Demo Mode '{scenario}' completed for room '{room_id}'.")
    await manager.broadcast(room_id, {
        "type": "demo_completed",
        "room_id": room_id,
        "scenario": scenario
    })


# ---------------- REST API ENDPOINTS ---------------- #

@app.get("/api/policy/config")
async def get_policy_config():
    """Returns active security policy profiles and thresholds."""
    return JSONResponse({
        "active_policy": risk_fusion_engine.active_policy_id,
        "policies": risk_fusion_engine.policies,
        "fusion_weights": risk_fusion_engine.weights
    })


@app.post("/api/policy/config")
async def update_policy_config(payload: dict = Body(...)):
    policy_id = payload.get("policy_id")
    thresholds = payload.get("thresholds")
    if policy_id:
        risk_fusion_engine.set_policy(policy_id, thresholds)
        log_audit_event("POLICY_UPDATED", "ADMIN", f"Active policy changed to {policy_id}")
    return JSONResponse({"status": "success", "active_policy": risk_fusion_engine.active_policy_id})


@app.get("/api/speaker/profiles")
async def get_speaker_profiles():
    """Returns list of enrolled VIP/executive speaker profiles."""
    return JSONResponse({"profiles": speaker_engine.list_profiles()})


@app.post("/api/context/update")
async def update_call_context(payload: dict = Body(...)):
    """Updates call context metadata dynamically during live session."""
    room_id = payload.get("room_id", "satya-room-1")
    room = manager.get_or_create_room(room_id)
    if "caller_number" in payload:
        room.caller_number = payload["caller_number"]
    if "claimed_identity_id" in payload:
        room.claimed_identity_id = payload["claimed_identity_id"]
    if "transaction_amount" in payload:
        room.transaction_amount = float(payload["transaction_amount"])
    if "action_type" in payload:
        room.action_type = payload["action_type"]
    if "language_setting" in payload:
        room.language_setting = payload["language_setting"]

    log_audit_event("CONTEXT_UPDATED", "CALL_OPERATOR", f"Room {room_id} context updated: {payload}")
    return JSONResponse({"status": "success", "room_id": room_id})


@app.post("/api/action/simulate-transfer")
async def simulate_banking_transfer(payload: dict = Body(...)):
    """
    Mock Banking Core Integration:
    A bank officer or automated ERP attempts to execute a fund transfer.
    The Voice SOC checks live risk and decides: ALLOW or HOLD_AND_VERIFY.
    """
    room_id = payload.get("room_id", "satya-room-1")
    amount = float(payload.get("amount", 2500000.0))
    recipient = payload.get("recipient", "Vendor Acct #98421004")
    room = manager.get_or_create_room(room_id)
    room.transaction_amount = amount

    # Evaluate decision
    if room.overall_risk >= 60.0 or room.requires_hold:
        room.transaction_held = True
        if not room.active_incident_id:
            room.active_incident_id = create_security_incident(
                session_id=room.session_id,
                room_id=room_id,
                risk_score=room.overall_risk,
                threat_tier=room.threat_tier,
                caller_number=room.caller_number,
                claimed_identity=room.claimed_identity_id,
                transaction_amount=amount,
                action_taken="TRANSFER_BLOCKED_PENDING_MFA",
                reason=f"Impersonation risk ({room.overall_risk:.0f}%) exceeds authorization threshold"
            )
        return JSONResponse({
            "status": "HELD",
            "message": f"Transfer of Rs. {amount:,.0f} BLOCKED by Voice Security Policy.",
            "overall_risk": room.overall_risk,
            "threat_tier": room.threat_tier,
            "recommended_action": "Mandatory Step-Up MFA or Registered Call-back Required.",
            "incident_id": room.active_incident_id,
            "requires_mfa": True
        })
    else:
        return JSONResponse({
            "status": "AUTHORIZED",
            "message": f"Transfer of Rs. {amount:,.0f} to {recipient} APPROVED.",
            "overall_risk": room.overall_risk,
            "threat_tier": room.threat_tier
        })


@app.post("/api/action/send-mfa")
async def send_step_up_mfa(payload: dict = Body(...)):
    """Dispatches a simulated secondary Out-of-Band MFA OTP to the executive."""
    room_id = payload.get("room_id", "satya-room-1")
    room = manager.get_or_create_room(room_id)
    # Generate mock 6-digit OTP
    room.pending_mfa_code = "739201"
    registered_phone = speaker_engine.enrolled_profiles.get(room.claimed_identity_id, {}).get("registered_number", "+91-98110-45291")
    log_audit_event("MFA_DISPATCHED", "SECURITY_ENGINE", f"Dispatched step-up OTP to {registered_phone}")
    return JSONResponse({
        "status": "sent",
        "message": f"Secondary OTP sent to registered line: {registered_phone}",
        "registered_phone": registered_phone,
        "demo_hint": "Demo OTP code is: 739201"
    })


@app.post("/api/action/verify-mfa")
async def verify_step_up_mfa(payload: dict = Body(...)):
    """Verifies secondary OTP and resolves transaction hold."""
    room_id = payload.get("room_id", "satya-room-1")
    otp_code = payload.get("otp_code", "").strip()
    room = manager.get_or_create_room(room_id)

    if otp_code == room.pending_mfa_code or otp_code == "739201":
        room.transaction_held = False
        if room.active_incident_id:
            resolve_incident(room.active_incident_id, "VERIFIED_BY_MFA", "Second factor successfully confirmed identity.")
        log_audit_event("MFA_VERIFIED_SUCCESS", "OPERATOR", f"Room {room_id} identity verified via OTP.")
        return JSONResponse({
            "status": "verified",
            "message": "Identity confirmed via secondary factor. Transaction released for settlement."
        })
    else:
        if room.active_incident_id:
            resolve_incident(room.active_incident_id, "CONFIRMED_FRAUD_ATTEMPT", "Invalid secondary factor entered.")
        log_audit_event("MFA_VERIFICATION_FAILED", "SECURITY_ALERT", f"Invalid OTP entered for room {room_id}.")
        return JSONResponse({
            "status": "failed",
            "message": "Secondary verification FAILED. Incident escalated to Fraud Operations Team."
        }, status_code=400)


@app.post("/api/action/trigger-callback")
async def trigger_call_back(payload: dict = Body(...)):
    """Simulates an automated outbound call-back to the registered corporate phone."""
    room_id = payload.get("room_id", "satya-room-1")
    room = manager.get_or_create_room(room_id)
    registered_phone = speaker_engine.enrolled_profiles.get(room.claimed_identity_id, {}).get("registered_number", "+91-98110-45291")
    log_audit_event("OUTBOUND_CALLBACK", "TELEPHONY_GATEWAY", f"Initiated call-back to {registered_phone}")
    return JSONResponse({
        "status": "initiated",
        "registered_phone": registered_phone,
        "message": f"Dialing registered number ({registered_phone}). Awaiting executive confirmation PIN."
    })


@app.get("/api/incidents")
async def list_security_incidents():
    return JSONResponse({"incidents": get_incidents(25)})


@app.post("/api/incidents/resolve")
async def resolve_incident_endpoint(payload: dict = Body(...)):
    incident_id = payload.get("incident_id")
    status = payload.get("status", "RESOLVED")
    notes = payload.get("notes", "")
    success = resolve_incident(incident_id, status, notes)
    return JSONResponse({"status": "success" if success else "error"})


@app.get("/api/audit")
async def get_audit_log():
    return JSONResponse({"audit_logs": get_audit_trail(40)})


@app.get("/api/privacy/config")
async def get_privacy_settings():
    return JSONResponse(get_privacy_config())


@app.post("/api/privacy/config")
async def update_privacy_settings(payload: dict = Body(...)):
    feature_only = bool(payload.get("feature_only_logging", False))
    raw_audio = bool(payload.get("raw_audio_retention", False))
    set_privacy_config(feature_only, raw_audio)
    return JSONResponse(get_privacy_config())


# ---------------- FEEDBACK, LEGAL HELPDESK & COPILOT ENDPOINTS ---------------- #

@app.post("/api/feedback")
async def submit_model_feedback(payload: dict = Body(...)):
    """Feedback Forum endpoint to log user confirmation or report false alarms."""
    room_id = payload.get("room_id", "satya-room-1")
    room = manager.get_or_create_room(room_id)
    user_verdict = payload.get("user_verdict", "CONFIRMED_SCAM")
    comments = payload.get("comments", "")
    action_requested = payload.get("action_requested", "LOG_ONLY")

    fb_id = add_feedback(
        session_id=room.session_id,
        room_id=room_id,
        caller_number=room.caller_number,
        claimed_identity=room.claimed_identity_id,
        original_risk=room.overall_risk,
        user_verdict=user_verdict,
        comments=comments,
        action_requested=action_requested
    )
    return JSONResponse({"status": "success", "feedback_id": fb_id})


@app.get("/api/feedback")
async def list_model_feedback():
    """Lists recent model feedback entries for the Feedback Forum."""
    return JSONResponse({"feedback": get_all_feedback(30)})


@app.get("/api/legal/fir-draft")
async def generate_fir_draft(room_id: str = "satya-room-1"):
    """
    Legal Helpdesk: Auto-generates an official Cybercrime FIR Complaint Draft
    compliant with Section 66D IT Act 2000 and Section 319 Bharatiya Nyaya Sanhita (BNS).
    """
    room = manager.get_or_create_room(room_id)
    incident_ref = room.active_incident_id or f"INC-2026-{uuid.uuid4().hex[:5].upper()}"
    draft = f"""FORMAL CYBERCRIME COMPLAINT DRAFT (Under Section 66D IT Act 2000 & Section 319 BNS)
National Cyber Crime Reporting Portal (NCRP) - Helpline 1930

1. COMPLAINANT INCIDENT REFERENCE: {incident_ref}
2. DATE & TIME OF OCCURRENCE: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}
3. SUSPECT CALLER NUMBER / VOIP ORIGIN: {room.caller_number}
4. CLAIMED IMPERSONATED IDENTITY: {room.claimed_identity_id} (Claiming executive/authority role)
5. ESTIMATED FINANCIAL EXPOSURE / DEMAND: Rs. {room.transaction_amount:,.2f}
6. AI VOICE FORENSIC EVIDENCE (SwarSatya Platform):
   - Impersonation Risk Score: {room.overall_risk:.1f}% ({room.threat_tier} Threat Tier)
   - Synthetic Voice / Deepfake Probability: {room.synthetic_risk:.1f}%
   - Acoustic Spectral Rolloff & Phase Irregularity: {room.spectral_risk:.1f}%
   - Speaker Biometric Mismatch: {room.speaker_mismatch_risk:.1f}%
7. EXTORTION PATTERNS DETECTED: {', '.join(room.detected_patterns) or 'Urgent financial demand, secrecy coercion'}
8. RECORDED TRANSCRIPT EXCERPT:
   \"{room.rolling_transcript[:300]}...\"

PRAYER / ACTION REQUESTED:
Urgent registration of FIR under Section 66D of Information Technology Act 2000 (Cheating by personation using computer resource) and Section 319 of Bharatiya Nyaya Sanhita (BNS). Request immediate freezing of beneficiary accounts under Indian Cyber Crime Coordination Centre (I4C) CFCFRMS framework."""
    return JSONResponse({
        "incident_id": incident_ref,
        "fir_text": draft,
        "caller_number": room.caller_number,
        "risk_score": room.overall_risk,
        "threat_tier": room.threat_tier
    })


@app.get("/api/copilot/guidance")
async def get_copilot_guidance(room_id: str = "satya-room-1"):
    """Returns dynamic scam defense counter-questions and legal advice."""
    room = manager.get_or_create_room(room_id)
    guidance = scam_copilot.generate_defense_guidance(room.rolling_transcript, room.detected_patterns)
    return JSONResponse({"guidance": guidance})


# ---------------- WEBSOCKET ENDPOINT ---------------- #

@app.websocket("/ws/call/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(room_id, websocket)
    room = manager.get_or_create_room(room_id)

    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                msg = json.loads(data_text)
            except json.JSONDecodeError:
                continue

            msg_type = msg.get("type")

            # Ping-Pong probe
            if msg_type == "ping":
                await websocket.send_text(json.dumps({
                    "type": "pong",
                    "server_time": time.time(),
                    "client_time": msg.get("client_time"),
                    "room_id": room_id
                }))

            # WebRTC Signaling Relay
            elif msg_type in ["join", "offer", "answer", "candidate", "leave"]:
                await manager.broadcast(room_id, msg, exclude=websocket)

            # Live Audio Ingestion
            elif msg_type == "audio_chunk":
                audio_b64 = msg.get("audio_base64")
                chunk_index = msg.get("chunk_index", 1)
                if audio_b64:
                    raw_bytes = base64.b64decode(audio_b64)
                    audio_np = np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32) / 32768.0
                    try:
                        # Non-blocking queue put (drops oldest if full to avoid lag, but maintains continuity)
                        if room.chunk_queue.full():
                            try:
                                room.chunk_queue.get_nowait()
                                room.chunk_queue.task_done()
                            except asyncio.QueueEmpty:
                                pass
                        await room.chunk_queue.put((audio_np, chunk_index, "live"))
                    except Exception as e:
                        logger.error(f"Error queueing live audio chunk: {e}")

            # Fallback Demo Mode Trigger
            elif msg_type == "start_demo":
                scenario = msg.get("scenario", "real_normal")
                if room.demo_task and not room.demo_task.done():
                    room.demo_task.cancel()
                room.demo_task = asyncio.create_task(run_demo_audio_stream(room_id, scenario))

            elif msg_type == "stop_demo":
                if room.demo_task and not room.demo_task.done():
                    room.demo_task.cancel()
                    await manager.broadcast(room_id, {"type": "demo_stopped", "room_id": room_id})

    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        await manager.broadcast(room_id, {
            "type": "user-left",
            "room_id": room_id,
            "timestamp": time.time()
        })
    except Exception as e:
        logger.error(f"WebSocket error in room {room_id}: {e}", exc_info=True)
        manager.disconnect(room_id, websocket)
