"""Test script verifying all layers of SwarSatya Voice Security Pipeline."""
import os
import soundfile as sf
import numpy as np

from app.audio.vad import vad_detector
from app.audio.spectral import spectral_analyzer
from app.audio.prosody import prosody_analyzer
from app.models.speaker import speaker_engine
from app.models.deepfake import deepfake_detector
from app.models.asr import speech_recognizer
from app.models.scam_rules import scam_detector
from app.risk.context import context_engine
from app.risk.fusion import risk_fusion_engine

DEMO_DIR = "D:/Puneet/Swar/demo_audio"
demo_files = ["real_normal.wav", "cloned_normal.wav", "real_scam.wav", "cloned_scam.wav"]

print("==========================================================")
print("TESTING SWARSATYA MULTI-LAYER VOICE SECURITY PIPELINE")
print("==========================================================")
deepfake_detector.load_model()
speech_recognizer.load_model()

for f in demo_files:
    path = os.path.join(DEMO_DIR, f)
    data, sr = sf.read(path)
    chunk = data[int(sr * 1.5) : int(sr * 5.5)]  # 4 second slice

    # 1. VAD
    is_speech = vad_detector.is_speech_chunk(chunk)
    
    # 2. Deepfake
    df_risk = deepfake_detector.score_chunk(chunk)
    
    # 3. Spectral
    spectral = spectral_analyzer.analyze(chunk)
    
    # 4. Prosody
    prosody = prosody_analyzer.analyze(chunk)
    
    # 5. Speaker Verification against enrolled CFO profile
    speaker = speaker_engine.verify_speaker(chunk, "cfo_rahul")
    
    # 6. ASR & Scam Rules
    trans, lang = speech_recognizer.transcribe_chunk(chunk)
    scam_risk, patterns = scam_detector.evaluate_text(trans)
    
    # 7. Context
    is_scam_file = "scam" in f
    context = context_engine.evaluate_context(
        caller_number="+91-91234-56789" if is_scam_file else "+91-98110-45291",
        claimed_identity_id="cfo_rahul",
        transaction_amount=2500000.0 if is_scam_file else 0.0,
        action_type="Urgent Fund Transfer" if is_scam_file else "Standard Call"
    )
    
    # 8. Dynamic Fusion
    fused = risk_fusion_engine.fuse(
        synthetic_risk=df_risk,
        spectral_risk=spectral["spectral_risk"],
        prosody_risk=prosody["prosody_risk"],
        speaker_mismatch_risk=speaker["mismatch_risk"],
        context_risk=context["context_risk"],
        scam_risk=scam_risk
    )
    
    print(f"\n>>> AUDIO FILE: {f}")
    print(f"  VAD Speech: {is_speech} | Lang: {lang}")
    print(f"  ASR: \"{trans}\"")
    print(f"  Layer 1 (Synthetic): Wav2Vec2={df_risk}%, Spectral={spectral['spectral_risk']}%")
    print(f"  Layer 2 (Prosody): Anomaly={prosody['prosody_risk']}%, Pitch std={prosody['pitch_std_hz']}Hz")
    print(f"  Layer 3 (Speaker): Similarity={speaker['speaker_similarity']}%, Mismatch Risk={speaker['mismatch_risk']}%")
    print(f"  Layer 4 (Context): Risk={context['context_risk']}% | Amount=Rs. {context['transaction_amount']:,.0f}")
    print(f"  Layer 5 (Scam): {scam_risk}% | Patterns: {patterns}")
    print(f"  --> OVERALL FUSED RISK: {fused['overall_risk']}/100 [{fused['threat_tier']}]")
    print(f"  --> POLICY ACTION: {fused['action_code']} (Hold: {fused['requires_hold']})")
    print(f"  --> RECOMMENDATION: {fused['recommended_action']}")

print("\nPipeline test completed successfully!")
