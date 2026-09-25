import asyncio
import os
import edge_tts
import soundfile as sf
import numpy as np
import scipy.signal as signal
import librosa

DEMO_DIR = os.path.abspath("D:/Puneet/Swar/demo_audio")
PUBLIC_DEMO_DIR = os.path.abspath("D:/Puneet/Swar/frontend/public/demo_audio")

os.makedirs(DEMO_DIR, exist_ok=True)
os.makedirs(PUBLIC_DEMO_DIR, exist_ok=True)

HINDI_SCENARIOS = {
    "real_normal": {
        "text": "नमस्ते, मैं राहुल शर्मा बोल रहा हूँ। कल सुबह की मीटिंग के लिए प्रेजेंटेशन और प्रोजेक्ट स्लाइड्स तैयार हैं। कृपया अपना लैपटॉप साथ ले आइएगा, हम नए प्रोजेक्ट पर चर्चा करेंगे।",
        "voice": "hi-IN-MadhurNeural",
        "rate": "+0%",
        "pitch": "+0Hz",
        "synthetic": False
    },
    "cloned_normal": {
        "text": "नमस्ते, मैं राहुल शर्मा बोल रहा हूँ। कल सुबह की मीटिंग के लिए प्रेजेंटेशन और प्रोजेक्ट स्लाइड्स तैयार हैं। कृपया अपना लैपटॉप साथ ले आइएगा, हम नए प्रोजेक्ट पर चर्चा करेंगे।",
        "voice": "hi-IN-MadhurNeural",
        "rate": "+0%",
        "pitch": "+0Hz",
        "synthetic": True
    },
    "real_scam": {
        "text": "ध्यान से सुनिए! मैं दिल्ली पुलिस क्राइम ब्रांच से इंस्पेक्टर शर्मा बोल रहा हूँ। आपके बैंक खाते के खिलाफ गैर-कानूनी मनी लॉन्ड्रिंग का गैर-जमानती अरेस्ट वारंट और एफआईआर जारी हो चुकी है। तुरंत पचास हजार रुपये वेरिफिकेशन फीस यूपीआई से हमारे सरकारी खाते में ट्रांसफर करें, वरना पुलिस टीम अभी आपके घर पहुँच रही है।",
        "voice": "hi-IN-MadhurNeural",
        "rate": "+5%",
        "pitch": "-15Hz",
        "synthetic": False
    },
    "cloned_scam": {
        "text": "मेरी बात बहुत ध्यान से सुनो और किसी को मत बताना, यह बहुत सीक्रेट है! यहाँ बहुत बड़ी इमरजेंसी आ गई है, पुलिस और कस्टम्स ने मुझे एयरपोर्ट पर डिटेन कर लिया है। तुम्हें अभी पच्चीस लाख रुपये तुरंत यूपीआई या आरटीजीएस से इस खाते में ट्रांसफर करने होंगे। फोन बिल्कुल मत काटना, जल्दी करो!",
        "voice": "hi-IN-MadhurNeural",
        "rate": "+10%",
        "pitch": "+20Hz",
        "synthetic": True
    }
}

def apply_synthetic_artifacts(audio: np.ndarray, sr: int = 16000) -> np.ndarray:
    """Injects neural vocoder phase jitter and comb filter artifacts."""
    t = np.arange(len(audio)) / sr
    carrier = 0.14 * np.sin(2 * np.pi * 140 * t)
    vocoded = audio * (1.0 + carrier)
    
    # Phase dispersion / comb filter (simulates vocoder frame stitching)
    delay_samples = int(sr * 0.0035)
    comb = np.zeros_like(vocoded)
    comb[delay_samples:] = vocoded[:-delay_samples]
    
    synthetic_audio = 0.65 * vocoded + 0.35 * comb
    return np.clip(synthetic_audio, -1.0, 1.0)

async def generate_all():
    print("Generating Hindi Scenario Audio Clips using edge-tts (hi-IN-MadhurNeural)...")
    temp_mp3 = os.path.join(DEMO_DIR, "temp.mp3")
    
    for name, config in HINDI_SCENARIOS.items():
        print(f"\n--- Generating {name}.wav ---")
        communicate = edge_tts.Communicate(
            text=config["text"],
            voice=config["voice"],
            rate=config["rate"],
            pitch=config["pitch"]
        )
        await communicate.save(temp_mp3)
        
        # Read with librosa at target 16kHz mono
        data, sr = librosa.load(temp_mp3, sr=16000, mono=True)
        data = data.astype(np.float32)
        
        # Normalize
        if np.max(np.abs(data)) > 0:
            data = data / np.max(np.abs(data)) * 0.90
            
        # Apply synthetic artifacts if cloned scenario
        if config["synthetic"]:
            print(f"  Injecting synthetic vocoder phase artifacts for {name}...")
            data = apply_synthetic_artifacts(data, 16000)
            
        # Save to demo_audio and public/demo_audio
        out_backend = os.path.join(DEMO_DIR, f"{name}.wav")
        out_frontend = os.path.join(PUBLIC_DEMO_DIR, f"{name}.wav")
        
        sf.write(out_backend, data, 16000)
        sf.write(out_frontend, data, 16000)
        print(f"  Saved backend audio: {out_backend} ({len(data)/16000:.1f}s)")
        print(f"  Saved frontend audio: {out_frontend}")
        
    if os.path.exists(temp_mp3):
        os.remove(temp_mp3)
        
    print("\nAll 4 Hindi scenarios generated successfully!")

if __name__ == "__main__":
    asyncio.run(generate_all())
