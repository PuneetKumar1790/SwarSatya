"""SwarSatya Voice SOC - Hugging Face Spaces Entrypoint (Gradio SDK).
Mounts the FastAPI multi-layer voice security engine and provides an interactive Gradio UI.
"""
import os
import sys
import soundfile as sf
import numpy as np

# Ensure backend directory is in Python path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# If this file was loaded as 'app', unregister it so 'import app.main' finds backend/app
if "app" in sys.modules and not hasattr(sys.modules["app"], "__path__"):
    del sys.modules["app"]

import uvicorn
import gradio as gr

from app.main import app as fastapi_app
from app.audio.vad import vad_detector
from app.audio.spectral import spectral_analyzer
from app.audio.prosody import prosody_analyzer
from app.models.speaker import speaker_engine
from app.models.deepfake import deepfake_detector
from app.models.asr import speech_recognizer
from app.models.scam_rules import scam_detector
from app.risk.context import context_engine
from app.risk.fusion import risk_fusion_engine
from app.risk.copilot import scam_copilot

try:
    import spaces
except ImportError:
    import types
    spaces = types.ModuleType("spaces")
    def _mock_gpu(*args, **kwargs):
        def decorator(fn):
            return fn
        if len(args) == 1 and callable(args[0]):
            return args[0]
        return decorator
    spaces.GPU = _mock_gpu


@spaces.GPU(duration=60)
def analyze_voice_sample(audio_filepath, caller_number, claimed_id, transaction_amount):
    """Executes the full 5-layer SwarSatya forensic voice pipeline on the uploaded audio."""
    if not audio_filepath or not os.path.exists(audio_filepath):
        return (
            {"No Audio Provided": 0.0},
            {"error": "Please record audio or select one of the demo clips below."},
            "No transcript available.",
            "Please provide audio to generate defense copilot counter-responses.",
            "No complaint draft generated."
        )

    try:
        # 1. Load Audio File
        data, sr = sf.read(audio_filepath)
        if len(data.shape) > 1:
            data = np.mean(data, axis=1)  # convert stereo to mono
        
        data = data.astype(np.float32)
        
        # Take representative slice if long
        if len(data) > sr * 8:
            slice_data = data[: int(sr * 8)]
        else:
            slice_data = data

        # Warm models if needed
        if not deepfake_detector.is_loaded:
            deepfake_detector.load_model()
        if not speech_recognizer.is_loaded:
            speech_recognizer.load_model()

        # 2. Layer 1: Synthetic Wav2Vec2 + Spectral Analysis
        df_risk = float(deepfake_detector.score_chunk(slice_data))
        spectral = spectral_analyzer.analyze(slice_data)
        spectral_risk = float(spectral.get("spectral_risk", 25.0))

        # 3. Layer 2: Prosody & Pitch Variance
        prosody = prosody_analyzer.analyze(slice_data)
        prosody_risk = float(prosody.get("prosody_risk", 0.0))

        # 4. Layer 3: Speaker Biometric Verification against CFO profile
        target_profile = "cfo_rahul" if "cfo" in claimed_id.lower() else "cfo_rahul"
        speaker_res = speaker_engine.verify_speaker(slice_data, target_profile)
        speaker_mismatch = float(speaker_res.get("mismatch_risk", 0.0))
        speaker_sim = float(speaker_res.get("similarity_pct", 100.0))

        # 5. Layer 4: Enterprise Call Context & Transaction Stakes
        context_res = context_engine.evaluate_context(
            caller_number=caller_number or "+91-91234-56789",
            claimed_identity_id=target_profile,
            transaction_amount=float(transaction_amount or 0.0),
            action_type="Urgent Fund Transfer" if float(transaction_amount or 0.0) > 0 else "Normal Call"
        )
        context_risk = float(context_res.get("context_risk", 25.0))

        # 6. Speech-to-Text & Layer 5 Scam NLP Detection
        transcript_text, detected_lang = speech_recognizer.transcribe_chunk(slice_data)
        scam_risk, scam_patterns = scam_detector.evaluate_text(transcript_text)

        # 7. Dynamic Multi-Layer Risk Fusion
        fused = risk_fusion_engine.fuse(
            synthetic_risk=df_risk,
            spectral_risk=spectral_risk,
            prosody_risk=prosody_risk,
            speaker_mismatch_risk=speaker_mismatch,
            context_risk=context_risk,
            scam_risk=scam_risk
        )

        overall_score = round(fused["overall_risk"], 1)
        threat_tier = fused["threat_tier"]
        recommended_action = fused["recommended_action"]

        # 8. Real-Time Scam Defense Copilot Guidance
        copilot_res = scam_copilot.generate_defense_guidance(transcript_text, scam_patterns)

        # Format Copilot advice
        copilot_markdown = f"""
### 🤖 In-Call Defense Guidance
**Policy Action:** `{fused["action_code"]}` — {recommended_action}

**Recommended Counter-Responses (Speak to caller):**
"""
        for script in copilot_res.get("smart_counter_scripts", [])[:3]:
            copilot_markdown += f"- **{script}**\n"

        copilot_markdown += f"\n**Statutory Protections:**\n"
        for cit in copilot_res.get("legal_citations", [])[:2]:
            copilot_markdown += f"- ⚖ *{cit}*\n"
        copilot_markdown += f"\n📞 **National Cyber Crime Helpline:** 1930 (Toll-Free 24x7)"

        # 9. Format Police FIR Complaint Draft under Section 66D IT Act
        fir_draft = f"""FORMAL CYBERCRIME COMPLAINT DRAFT (Under Section 66D IT Act 2000 & Section 319 BNS)
National Cyber Crime Reporting Portal (NCRP) - Helpline 1930

1. COMPLAINANT INCIDENT ID: INC-HF-{os.urandom(3).hex().upper()}
2. SUSPECT CALLER NUMBER: {caller_number}
3. CLAIMED IDENTITY: {claimed_id}
4. TRANSACTION EXPOSURE DEMANDED: Rs. {float(transaction_amount):,.2f}
5. AI VOICE FORENSIC EVIDENCE (SwarSatya Platform):
   - Impersonation Threat Score: {overall_score}% ({threat_tier})
   - Synthetic Voice Probability: {df_risk:.1f}%
   - Phase Irregularity: {spectral_risk:.1f}%
   - Speaker Biometric Match: {speaker_sim:.1f}% (Mismatch Risk: {speaker_mismatch:.1f}%)
6. DETECTED EXTORTION PATTERNS: {', '.join(scam_patterns) or 'Urgent financial demand, coercion'}
7. TRANSCRIPT EXCERPT:
   "{transcript_text}"

PRAYER / ACTION REQUESTED:
Registration of FIR under Section 66D IT Act 2000 (Cheating by personation) and Section 319 BNS. Request immediate account freeze under I4C CFCFRMS framework."""

        threat_label = {
            f"Overall Threat: {threat_tier} ({overall_score}%)": overall_score / 100.0,
            f"Synthetic Speech Probability": df_risk / 100.0,
            f"Speaker Biometric Mismatch": speaker_mismatch / 100.0,
            f"Scam Intent Risk": scam_risk / 100.0
        }

        telemetry_dict = {
            "overall_risk_score": overall_score,
            "threat_tier": threat_tier,
            "action_code": fused["action_code"],
            "layer_1_synthetic_model_pct": round(df_risk, 1),
            "layer_1_spectral_phase_pct": round(spectral_risk, 1),
            "layer_2_prosody_anomaly_pct": round(prosody_risk, 1),
            "layer_3_speaker_match_pct": round(speaker_sim, 1),
            "layer_3_biometric_mismatch_pct": round(speaker_mismatch, 1),
            "layer_4_context_stakes_pct": round(context_risk, 1),
            "layer_5_scam_intent_pct": round(scam_risk, 1),
            "detected_patterns": scam_patterns,
            "contributing_factors": fused.get("contributing_factors", [])
        }

        return (
            threat_label,
            telemetry_dict,
            f"Language: {detected_lang}\n\n\"{transcript_text}\"",
            copilot_markdown,
            fir_draft
        )

    except Exception as e:
        return (
            {"Error": 1.0},
            {"exception": str(e)},
            f"Processing error: {str(e)}",
            "An error occurred while evaluating voice signals.",
            ""
        )


# Build the Gradio Blocks UI
with gr.Blocks(title="SwarSatya - Voice Security Operations Center", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🛡️ SwarSatya (स्वर सत्य) — Real-Time Voice Impersonation & Clone Defense
    ### Smart India Hackathon (SIH #26104) • Multi-Layer Voice Security Operations Center
    Analyze voice samples for **AI voice cloning (Wav2Vec2)**, **vocoder phase dispersion**, **speaker biometric deviation**, and **conversational extortion scams**.
    """)

    with gr.Row():
        with gr.Column(scale=1):
            audio_in = gr.Audio(
                label="🎤 Record Voice or Upload Audio File (WAV/MP3)",
                type="filepath"
            )

            with gr.Row():
                caller_in = gr.Textbox(value="+91-91234-56789", label="Incoming Caller Number")
                identity_in = gr.Dropdown(
                    choices=["Rahul Sharma (CFO)", "Priya Iyer (CEO)", "Unverified External Gateway"],
                    value="Rahul Sharma (CFO)",
                    label="Claimed Enterprise Identity"
                )

            amount_in = gr.Number(value=2500000, label="Financial Transfer Exposure (INR ₹)")
            analyze_btn = gr.Button("🔍 Analyze Voice for Impersonation Threat", variant="primary")

            # Built-in demo audio clips
            demo_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "demo_audio"))
            examples_list = []
            for name in ["cloned_scam.wav", "real_scam.wav", "cloned_normal.wav", "real_normal.wav"]:
                p = os.path.join(demo_dir, name)
                if os.path.exists(p):
                    examples_list.append([p, "+91-91234-56789" if "scam" in name else "+91-98110-45291", "Rahul Sharma (CFO)", 2500000 if "scam" in name else 0])

            if examples_list:
                gr.Examples(
                    examples=examples_list,
                    inputs=[audio_in, caller_in, identity_in, amount_in],
                    label="📁 Click a Demo Audio Clip to Test Instantly"
                )

        with gr.Column(scale=1):
            threat_gauge = gr.Label(label="🚨 Unified Impersonation Threat Level")
            transcript_out = gr.Textbox(label="🎙️ Live Speech Transcript & Language", lines=2)
            copilot_out = gr.Markdown(label="🤖 In-Call Scam Defense Copilot & Counter-Prompts")
            fir_out = gr.Textbox(label="📋 Auto-Generated NCRP / Police FIR Draft (Section 66D IT Act)", lines=5)
            telemetry_out = gr.JSON(label="🔬 Multi-Layer Signal Breakdown (JSON Telemetry)")

    analyze_btn.click(
        fn=analyze_voice_sample,
        inputs=[audio_in, caller_in, identity_in, amount_in],
        outputs=[threat_gauge, telemetry_out, transcript_out, copilot_out, fir_out],
        api_name=False
    )

    gr.Markdown("""
    ---
    **API Endpoints:** REST API: `/api/health` • Real-Time WebSocket: `/ws/call/{room_id}` • Statutory Helpline: **1930**
    """)


# Mount the full FastAPI app under /soc for REST APIs and WebSockets
demo.app.mount("/soc", fastapi_app)

app = demo.app

if __name__ == "__main__":
    demo.queue().launch(server_name="0.0.0.0", server_port=7860, show_api=False)
