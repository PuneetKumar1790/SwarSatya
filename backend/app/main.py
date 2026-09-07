"""SwarSatya - Real-Time Voice Security FastAPI Backend (SIH #26104)."""
import asyncio
import base64
import json
import logging
import os
import time
import uuid
from contextlib import asynccontextmanager
from typing import Dict, List, Optional, Set

import numpy as np
import soundfile as sf
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.audio.vad import vad_detector
from app.db import create_session, end_session, init_db, log_risk_chunk
from app.models.asr import speech_recognizer
from app.models.deepfake import deepfake_detector
from app.models.scam_rules import scam_detector
from app.risk.fusion import risk_fusion_engine

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
        self.previous_scam_risk: float = 0.0
        self.previous_synthetic_risk: float = 0.0
        self.peak_synthetic_risk: float = 0.0
        self.peak_scam_risk: float = 0.0
        self.peak_overall_risk: float = 0.0
        self.final_tier: str = "LOW"
        self.chunk_count: int = 0
        self.demo_task: Optional[asyncio.Task] = None
        self.is_active: bool = True
        self.is_processing: bool = False

        # Initialize SQLite session
        create_session(self.session_id, self.room_id)


class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, RoomState] = {}

    def get_or_create_room(self, room_id: str) -> RoomState:
        if room_id not in self.rooms:
            self.rooms[room_id] = RoomState(room_id)
            logger.info(f"Created new call session {self.rooms[room_id].session_id} for room '{room_id}'")
        return self.rooms[room_id]

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
                # Stop demo task if running
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
    # Preload models in background thread so server starts promptly
    loop = asyncio.get_running_loop()
    loop.run_in_executor(None, deepfake_detector.load_model)
    loop.run_in_executor(None, speech_recognizer.load_model)
    logger.info("ML models scheduled for warm-up.")
    yield
    logger.info("SwarSatya backend shutdown.")


app = FastAPI(
    title="SwarSatya Real-Time Voice Security API",
    description="Real-Time Impersonation & Voice Cloning Detection (SIH #26104)",
    version="1.0.0",
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
        "app": "SwarSatya",
        "models_loaded": {
            "deepfake": deepfake_detector.is_loaded,
            "asr": speech_recognizer.is_loaded
        },
        "active_rooms": len(manager.rooms)
    })


@app.get("/api/demo/scenarios")
async def get_demo_scenarios():
    """Lists available pre-recorded demo clips for the fallback safety player."""
    scenarios = [
        {
            "id": "real_normal",
            "title": "Scenario 1: Real Voice, Normal Conversation",
            "expected": "LOW Threat (Synthetic: ~0%, Scam: ~0%)",
            "description": "Authentic human speech talking casually about daily projects."
        },
        {
            "id": "cloned_normal",
            "title": "Scenario 2: Cloned Voice, Normal Conversation",
            "expected": "CAUTION (Synthetic: ~95%, Scam: ~0%)",
            "description": "AI-synthesized voice discussing meeting agendas."
        },
        {
            "id": "real_scam",
            "title": "Scenario 3: Real Voice, Scam Pattern",
            "expected": "HIGH Threat (Synthetic: ~0-20%, Scam: ~70%)",
            "description": "Impersonation scam creating urgency and legal threats."
        },
        {
            "id": "cloned_scam",
            "title": "Scenario 4: Cloned Voice + Scam Pattern",
            "expected": "CRITICAL Threat (Synthetic: ~95%, Scam: ~85%)",
            "description": "Cloned family voice requesting emergency money transfer and secrecy."
        }
    ]
    return JSONResponse({"scenarios": scenarios})


async def process_audio_chunk(room_id: str, audio_np: np.ndarray, chunk_index: int, source_type: str = "live"):
    """
    Unified analysis pipeline for 3-5 second audio chunks:
    1. VAD check
    2. Deepfake anti-spoofing model
    3. Multilingual faster-whisper ASR
    4. Rule-based scam detection with cross-category bonuses
    5. Risk Fusion Engine
    6. SQLite logging & WebSocket broadcast
    """
    room = manager.get_or_create_room(room_id)
    t0 = time.time()

    # 1. Voice Activity Detection (VAD)
    is_speech = vad_detector.is_speech_chunk(audio_np)
    if not is_speech:
        # Non-speech: apply slight decay, do not waste model inference
        room.previous_scam_risk *= 0.92
        overall, tier, action = risk_fusion_engine.fuse(
            room.previous_synthetic_risk,
            room.previous_scam_risk
        )
        latency_ms = (time.time() - t0) * 1000.0

        update_msg = {
            "type": "risk_update",
            "room_id": room_id,
            "timestamp": time.time(),
            "chunk_index": chunk_index,
            "is_speech": False,
            "synthetic_risk": room.previous_synthetic_risk,
            "scam_risk": room.previous_scam_risk,
            "overall_risk": overall,
            "threat_tier": tier,
            "recommended_action": action,
            "transcript_snippet": "",
            "detected_patterns": room.detected_patterns,
            "processing_latency_ms": round(latency_ms, 1),
            "source_type": source_type
        }
        await manager.broadcast(room_id, update_msg)
        return

    # 2. Run Deepfake and ASR models concurrently in worker threads
    loop = asyncio.get_running_loop()
    synthetic_risk, transcript_chunk = await asyncio.gather(
        loop.run_in_executor(None, deepfake_detector.score_chunk, audio_np, 16000),
        loop.run_in_executor(None, speech_recognizer.transcribe_chunk, audio_np, 16000)
    )

    room.previous_synthetic_risk = synthetic_risk
    if transcript_chunk:
        room.rolling_transcript = (
            f"{room.rolling_transcript} {transcript_chunk}".strip()
            if room.rolling_transcript else transcript_chunk
        )

    # 3. Rule-based Scam Signal Detection
    scam_risk, new_patterns = scam_detector.evaluate_text(
        transcript_chunk,
        room.previous_scam_risk
    )
    room.previous_scam_risk = scam_risk
    for p in new_patterns:
        if p not in room.detected_patterns:
            room.detected_patterns.append(p)

    # 4. Risk Fusion Engine
    overall_risk, threat_tier, recommended_action = risk_fusion_engine.fuse(
        synthetic_risk,
        scam_risk
    )

    # Update Peak Records
    room.chunk_count += 1
    room.peak_synthetic_risk = max(room.peak_synthetic_risk, synthetic_risk)
    room.peak_scam_risk = max(room.peak_scam_risk, scam_risk)
    room.peak_overall_risk = max(room.peak_overall_risk, overall_risk)
    room.final_tier = threat_tier

    latency_ms = (time.time() - t0) * 1000.0

    # 5. Log to SQLite
    log_risk_chunk(
        session_id=room.session_id,
        room_id=room_id,
        chunk_index=chunk_index,
        synthetic_risk=synthetic_risk,
        scam_risk=scam_risk,
        overall_risk=overall_risk,
        threat_tier=threat_tier,
        transcript_snippet=transcript_chunk,
        detected_patterns=new_patterns,
        processing_latency_ms=round(latency_ms, 1)
    )

    # 6. Push real-time update over WebSocket
    update_msg = {
        "type": "risk_update",
        "room_id": room_id,
        "timestamp": time.time(),
        "chunk_index": chunk_index,
        "is_speech": True,
        "synthetic_risk": synthetic_risk,
        "scam_risk": scam_risk,
        "overall_risk": overall_risk,
        "threat_tier": threat_tier,
        "recommended_action": recommended_action,
        "transcript_snippet": transcript_chunk,
        "detected_patterns": room.detected_patterns,
        "processing_latency_ms": round(latency_ms, 1),
        "source_type": source_type
    }
    await manager.broadcast(room_id, update_msg)


async def run_demo_audio_stream(room_id: str, scenario: str):
    """
    Streams a pre-recorded demo audio file chunk-by-chunk through the exact same
    analysis pipeline at real playback speed.
    """
    wav_file = os.path.join(DEMO_DIR, f"{scenario}.wav")
    if not os.path.exists(wav_file):
        logger.error(f"Demo file not found: {wav_file}")
        return

    logger.info(f"Starting Demo Mode '{scenario}' for room '{room_id}'...")
    data, sr = sf.read(wav_file)
    if len(data.shape) > 1:
        data = np.mean(data, axis=1)

    chunk_size = sr * 3  # 3-second chunks (48,000 samples)
    total_chunks = int(np.ceil(len(data) / chunk_size))

    for i in range(total_chunks):
        chunk = data[i * chunk_size : (i + 1) * chunk_size]
        if len(chunk) < 8000:
            break
        await process_audio_chunk(room_id, chunk, chunk_index=i + 1, source_type="demo")
        # Sleep for realistic chunk playback interval
        await asyncio.sleep(3.0)

    logger.info(f"Demo Mode '{scenario}' completed for room '{room_id}'.")
    await manager.broadcast(room_id, {
        "type": "demo_completed",
        "room_id": room_id,
        "scenario": scenario
    })


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

            # Ping-Pong health probe
            if msg_type == "ping":
                await websocket.send_text(json.dumps({
                    "type": "pong",
                    "server_time": time.time(),
                    "client_time": msg.get("client_time"),
                    "room_id": room_id
                }))

            # WebRTC Signaling Relay (offers, answers, ICE candidates)
            elif msg_type in ["join", "offer", "answer", "candidate", "leave"]:
                await manager.broadcast(room_id, msg, exclude=websocket)

            # Live Audio Chunk Ingestion
            elif msg_type == "audio_chunk":
                if room.is_processing:
                    # Drop incoming chunk while ML models are actively inferring on CPU
                    # This prevents backlog delay and maintains real-time zero-lag sync
                    continue
                audio_b64 = msg.get("audio_base64")
                chunk_index = msg.get("chunk_index", 1)
                if audio_b64:
                    raw_bytes = base64.b64decode(audio_b64)
                    # Convert 16-bit PCM to float32
                    audio_np = np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32) / 32768.0
                    room.is_processing = True

                    async def run_live_pipeline():
                        try:
                            await process_audio_chunk(room_id, audio_np, chunk_index, source_type="live")
                        except Exception as e:
                            logger.error(f"Error processing live chunk: {e}")
                        finally:
                            room.is_processing = False

                    asyncio.create_task(run_live_pipeline())

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
