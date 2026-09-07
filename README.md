# SwarSatya (स्वर सत्य) — Real-Time Voice Security

AI-powered real-time detection of voice cloning and impersonation scam calls in live browser conversations.
Built for **Smart India Hackathon (SIH) Problem Statement #26104**.

---

## Non-Negotiable Architecture

```
Browser A <------ WebRTC Call ------> Browser B
    |                                    |
    +---- Audio Stream Fork (3-5s chunks) +
                     |
                     v
           FastAPI WebSocket Engine
                     |
      +--------------+--------------+
      |                             |
      v                             v
[Phase 3] Pretrained          [Phase 4] Multilingual ASR
Wav2Vec2 Anti-Spoofing        (faster-whisper int8 CPU)
      |                             |
      v (Synthetic Risk 0-100)      v (Transcript text)
      |                       Rule-Based Scam Signal Detector
      |                             |
      |                             v (Scam Risk 0-100)
      +--------------+--------------+
                     |
                     v
      [Phase 5] Risk Fusion Engine
     Overall Risk = 0.5*Synth + 0.4*Scam + 0.1*Other
                     |
                     v
             WebSocket Push
                     |
   Live Risk Meter + Timeline + Alert UI
```

---

## Build Status (Phased Progression)

- [x] **Phase 0**: Repo scaffold, SQLite DB schema, FastAPI WebSocket server, React + Vite frontend, verified bidirectional Ping/Pong exchange.
- [x] **Phase 1**: WebRTC P2P audio calling between two browser tabs with audio stream forking.
- [x] **Phase 2**: Audio chunking buffer (3-5s) + VAD pipeline (webrtcvad + Silero) + latency instrumentation.
- [x] **Phase 3**: Hugging Face Wav2Vec2 synthetic speech detection (`MelodyMachine/Deepfake-audio-detection-V2`).
- [x] **Phase 4**: Multilingual `faster-whisper` (int8 CPU) ASR + 5-category rule-based scam pattern detection (`scam_rules.py`).
- [x] **Phase 5**: Risk fusion engine, live dashboard (3-way risk meter, timeline chart, transcript), SQLite call logging, and 4-Scenario Fallback Demonstration Player.
- [x] **Phase 6 / Stretch**: Real-time backpressure concurrency guard (<1s latency), acoustic echo suppression, Digital India alignment roadmap (Bhashini & AIKosh).

---

## Quickstart

### 1. Backend
```powershell
# From project root
& "backend\venv\Scripts\python.exe" -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend
```powershell
# From project root
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.
