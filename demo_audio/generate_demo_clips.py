"""Generates the four pre-recorded demo audio files for SwarSatya (SIH #26104)."""
import os
import subprocess
import soundfile as sf
import numpy as np
import scipy.signal as signal
import librosa

DEMO_DIR = "D:/Puneet/Swar/demo_audio"

SCENARIOS = {
    "real_normal": {
        "text": "Hello, this is Rahul calling. We are reviewing the project documentation and everything looks on track for our meeting tomorrow morning. Please bring your laptop with the latest design mockups.",
        "synthetic": False,
        "pitch_shift": 0.0,
        "rate": 0
    },
    "cloned_normal": {
        "text": "Hello, this is Rahul calling. We are reviewing the project documentation and everything looks on track for our meeting tomorrow morning. Please bring your laptop with the latest design mockups.",
        "synthetic": True,
        "pitch_shift": 0.5,
        "rate": 0
    },
    "real_scam": {
        "text": "Listen to me very carefully. This is Inspector Sharma from Delhi police crime branch. An arrest warrant and FIR has been issued against your bank account for money laundering. You must urgently transfer fifty thousand rupees penalty fee via UPI right now to our verification account, or an arrest team will reach your address immediately.",
        "synthetic": False,
        "pitch_shift": -4.0,  # Deep authority voice (different speaker profile)
        "rate": 1
    },
    "cloned_scam": {
        "text": "Please listen carefully and keep this secret, do not tell anyone! This is an emergency, police and customs have detained me at the airport. You urgently need to share the OTP verification code. Transfer eighty thousand rupees via UPI immediately to clear this case. Do not disconnect the call!",
        "synthetic": True,
        "pitch_shift": 3.0,  # Strained pitch shift + vocoder phase jitter
        "rate": 2
    }
}


def apply_synthetic_artifacts(audio: np.ndarray, sr: int = 16000) -> np.ndarray:
    """Injects neural vocoder and phase dispersion artifacts characteristic of AI voice cloning."""
    t = np.arange(len(audio)) / sr
    carrier = 0.12 * np.sin(2 * np.pi * 140 * t)
    vocoded = audio * (1.0 + carrier)
    
    # Phase dispersion / comb filter
    delay_samples = int(sr * 0.0035)
    comb = np.zeros_like(vocoded)
    comb[delay_samples:] = vocoded[:-delay_samples]
    
    synthetic_audio = 0.70 * vocoded + 0.30 * comb
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
$s.Rate = {config['rate']}
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
        if len(data.shape) > 1:
            data = np.mean(data, axis=1)
            
        target_sr = 16000
        if sr != target_sr:
            num_samples = int(len(data) * target_sr / sr)
            data = signal.resample(data, num_samples)
            
        data = data.astype(np.float32)
        if np.max(np.abs(data)) > 0:
            data = data / np.max(np.abs(data)) * 0.90

        # Apply pitch shift to create distinct speaker biometrics
        if config["pitch_shift"] != 0.0:
            data = librosa.effects.pitch_shift(y=data, sr=target_sr, n_steps=config["pitch_shift"])

        # Inject synthetic vocoder artifacts if configured
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
