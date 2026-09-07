import os
import soundfile as sf
import numpy as np
from app.audio.vad import vad_detector
from app.models.deepfake import deepfake_detector
from app.models.asr import speech_recognizer
from app.models.scam_rules import scam_detector
from app.risk.fusion import risk_fusion_engine

DEMO_DIR = "D:/Puneet/Swar/demo_audio"
demo_files = ["real_normal.wav", "cloned_normal.wav", "real_scam.wav", "cloned_scam.wav"]

print("Pre-loading models...")
deepfake_detector.load_model()
speech_recognizer.load_model()
print("Models loaded.\n")

for f in demo_files:
    path = os.path.join(DEMO_DIR, f)
    data, sr = sf.read(path)
    # Take the 2nd 3-second chunk or first 6 seconds to capture key words
    chunk = data[int(sr * 1.5) : int(sr * 5.5)] # 4 second chunk
    is_speech = vad_detector.is_speech_chunk(chunk)
    df_risk = deepfake_detector.score_chunk(chunk)
    trans = speech_recognizer.transcribe_chunk(chunk)
    scam_risk, patterns = scam_detector.evaluate_text(trans)
    overall, tier, action = risk_fusion_engine.fuse(df_risk, scam_risk)
    
    print(f"=== {f} ===")
    print(f"  VAD Speech: {is_speech}")
    print(f"  ASR Transcript: '{trans}'")
    print(f"  Synthetic Risk: {df_risk}%")
    print(f"  Scam Risk: {scam_risk}% | Patterns: {patterns}")
    print(f"  Overall Risk: {overall}/100 -> Threat Tier: {tier}")
    print(f"  Recommended Action: {action}\n")
