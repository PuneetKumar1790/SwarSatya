"""Generates the four pre-recorded demo audio files for SwarSatya (SIH #26104)."""
import os
import subprocess
import soundfile as sf
import numpy as np
import scipy.signal as signal

DEMO_DIR = "D:/Puneet/Swar/demo_audio"

SCENARIOS = {
    "real_normal": {
        "text": "Hello, this is Rahul calling. We are reviewing the project documentation and everything looks on track for our meeting tomorrow morning. Please bring your laptop with the latest design mockups.",
        "synthetic": False
    },
    "cloned_normal": {
        "text": "Hello, this is Rahul calling. We are reviewing the project documentation and everything looks on track for our meeting tomorrow morning. Please bring your laptop with the latest design mockups.",
        "synthetic": True
    },
    "real_scam": {
        "text": "Listen to me very carefully. This is Inspector Sharma from Delhi police crime branch. An arrest warrant and FIR has been issued against your bank account for money laundering. You must urgently transfer fifty thousand rupees penalty fee via UPI right now to our verification account, or an arrest team will reach your address immediately.",
        "synthetic": False
    },
    "cloned_scam": {
        "text": "Please listen carefully and keep this secret, do not tell anyone! This is an emergency, police and customs have detained me at the airport. You urgently need to share the OTP verification code and transfer eighty thousand rupees via UPI immediately to clear this case. Do not disconnect the call!",
        "synthetic": True
    }
}


def apply_synthetic_artifacts(audio: np.ndarray, sr: int = 16000) -> np.ndarray:
    """Injects subtle neural vocoder and phase distortion artifacts characteristic of voice cloning/synthesis."""
    # 1. Pitch / harmonic perturbation
    t = np.arange(len(audio)) / sr
    carrier = 0.08 * np.sin(2 * np.pi * 120 * t)  # 120Hz subharmonic
    vocoded = audio * (1.0 + carrier)
    
    # 2. Phase dispersion / robotic comb filter
    delay_samples = int(sr * 0.003)  # 3ms delay comb filter
    comb = np.zeros_like(vocoded)
    comb[delay_samples:] = vocoded[:-delay_samples]
    
    synthetic_audio = 0.75 * vocoded + 0.25 * comb
    return np.clip(synthetic_audio, -1.0, 1.0)


def generate():
    os.makedirs(DEMO_DIR, exist_ok=True)
    temp_wav = os.path.join(DEMO_DIR, "temp_synth.wav")
    
    for name, config in SCENARIOS.items():
        out_path = os.path.join(DEMO_DIR, f"{name}.wav")
        print(f"Generating {name}.wav...")
        
        win_path = temp_wav.replace("/", "\\")
        ps_code = f"""
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SetOutputToWaveFile('{win_path}')
$s.Rate = 0
$s.Speak('{config["text"]}')
$s.Dispose()
"""
        ps_file = os.path.join(DEMO_DIR, "gen.ps1")
        with open(ps_file, "w", encoding="utf-8") as f:
            f.write(ps_code)
            
        subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", ps_file], check=True)
        if os.path.exists(ps_file):
            os.remove(ps_file)
            
        data, sr = sf.read(temp_wav)
        
        # Convert to mono if stereo
        if len(data.shape) > 1:
            data = np.mean(data, axis=1)
            
        # Resample to 16,000 Hz if needed
        target_sr = 16000
        if sr != target_sr:
            num_samples = int(len(data) * target_sr / sr)
            data = signal.resample(data, num_samples)
            
        data = data.astype(np.float32)
        if np.max(np.abs(data)) > 0:
            data = data / np.max(np.abs(data)) * 0.90
            
        if config["synthetic"]:
            data = apply_synthetic_artifacts(data, target_sr)
            
        sf.write(out_path, data, target_sr)
        duration = len(data) / target_sr
        print(f"Created {out_path} ({duration:.2f}s @ {target_sr}Hz)")
        
    if os.path.exists(temp_wav):
        os.remove(temp_wav)
    print("All demo clips generated successfully!")


if __name__ == "__main__":
    generate()
