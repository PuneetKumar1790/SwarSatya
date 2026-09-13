# SwarSatya — AI Agent Setup & Execution Manual
> **Instruction for AI Coding Assistants (Cursor, Claude Code, Windsurf, Copilot, Antigravity):**
> Read this document completely before taking action. Execute each phase in order to set up, install dependencies, verify models, and run the SwarSatya real-time voice security system on this machine.

---

## 1. Project Overview & Architecture

**SwarSatya (स्वर सत्य)** is an AI-powered real-time voice security platform built for **Smart India Hackathon Problem Statement #26104** (AI-Powered Detection of Voice Cloning / Impersonation Scam Calls).

### System Pipeline:
1. **Source**: WebRTC audio stream captured in browser.
2. **Audio Fork**: Web Audio API slices audio into **5.0-second 16kHz mono chunks** (80,000 samples) and sends base64 PCM over WebSocket (`/ws/call/{room_id}`).
3. **VAD Pre-Filter**: `webrtcvad` + RMS energy gate filters silence and room noise to save CPU.
4. **Concurrent ML Inference** (Runs in parallel via `asyncio.gather`):
   - **Synthetic Voice Detector**: Hugging Face Wav2Vec2 (`MelodyMachine/Deepfake-audio-detection-V2`) with calibrated softmax scoring (0–100%).
   - **Multilingual ASR**: `faster-whisper` (`base` model, int8 CPU quantized) transcribes speech with Silero VAD silence removal and forced `language="en"`.
5. **Scam Intent Engine**: Evaluates 5 threat categories (Credentials, Fear/Legal, Financial, Urgency, Secrecy) with synergistic synergy bonuses.
6. **Risk Fusion Engine**: Computes overall risk (`0.50*Synth + 0.40*Scam + 0.10*Synergy`) with exponential decay and assigns threat tier (**LOW**, **CAUTION**, **HIGH**, **CRITICAL**).
7. **Storage**: Audit trail logged to local SQLite (`backend/swarsatya.db`).

---

## 2. Prerequisites Check

Before proceeding, verify that the host machine has:
- **Python**: Version 3.10, 3.11, or 3.12 (64-bit)
- **Node.js**: Version 18.x or 20.x LTS with npm
- **Git**: Installed

Run these verification commands in your shell:
```bash
python --version   # or python3 --version
node -v
npm -v
```

---

## 3. Step-by-Step Installation Instructions

### Step 3.1: Set Up Python Virtual Environment

From the project root directory:

**On Windows (PowerShell):**
```powershell
# Create venv inside backend/
python -m venv backend\venv

# Upgrade pip
& "backend\venv\Scripts\python.exe" -m pip install --upgrade pip

# Install CPU-optimized PyTorch and Torchaudio first
& "backend\venv\Scripts\python.exe" -m pip install torch==2.2.2+cpu torchaudio==2.2.2+cpu --extra-index-url https://download.pytorch.org/whl/cpu

# Install all remaining backend dependencies
& "backend\venv\Scripts\python.exe" -m pip install -r backend\requirements.txt
```

**On Linux / macOS (Bash):**
```bash
# Create venv inside backend/
python3 -m venv backend/venv

# Upgrade pip
backend/venv/bin/pip install --upgrade pip

# Install CPU-optimized PyTorch
backend/venv/bin/pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install backend dependencies
backend/venv/bin/pip install -r backend/requirements.txt
```

---

### Step 3.2: Set Up Frontend Dependencies

From the project root directory:

```bash
cd frontend
npm install
cd ..
```

---

## 4. Running the Application

Both servers must be started concurrently.

### Service 1: Backend FastAPI Server (Port 8000)

**Windows (PowerShell):**
```powershell
& "backend\venv\Scripts\python.exe" -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

**Linux / macOS (Bash):**
```bash
backend/venv/bin/python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

> **Note on First Startup**: The backend will automatically download the pretrained models from Hugging Face:
> - `MelodyMachine/Deepfake-audio-detection-V2` (~360 MB)
> - `faster-whisper` base model (~140 MB)
> Once downloaded, they are cached locally in `~/.cache/huggingface/` and subsequent boots take <3 seconds.

---

### Service 2: Frontend Vite Dev Server (Port 5173)

**Any OS:**
```bash
cd frontend
npm run dev
```

The frontend will be accessible at: **`http://localhost:5173`**

---

## 5. Automated Verification Checklist for the AI Agent

To verify that the deployment is 100% operational, run:

### Test 1: Health Check Probe
```bash
curl http://127.0.0.1:8000/api/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "app": "SwarSatya",
  "models_loaded": {
    "deepfake": true,
    "asr": true
  },
  "active_rooms": 0
}
```

### Test 2: Run Automated Backend Pipeline Verification
```powershell
# Windows
& "backend\venv\Scripts\python.exe" backend\test_pipeline.py

# Linux / Mac
backend/venv/bin/python backend/test_pipeline.py
```
This tests VAD gating, deepfake classification, Whisper transcription, scam keyword extraction, and risk fusion on simulated audio. All tests should pass with exit code `0`.

---

## 6. How the Operational Modes Work (Judge & Demo Guide)

SwarSatya operates in two primary modes:

### Mode A: Live WebRTC Call Mode (Interactive Testing)
1. Open `http://localhost:5173` in your browser.
2. Enter room code `satya-room-1` and click **"Start WebRTC Call"**.
3. Allow browser microphone access.
4. **Single-User Mic Testing**: The system automatically forks your local microphone for AI security analysis so you can test solo without needing a second caller.
5. **Two-User P2P Calling**: Open `http://localhost:5173` in a second tab or separate device on the same network with the same room code. WebRTC establishes direct P2P audio via STUN servers, and the receiver's incoming stream is analyzed by the security engine.
6. **Try Speaking Scam Phrases**:
   > *"Hello, this is Delhi Police cyber crime unit. Transfer money immediately to avoid arrest."*
   - Live transcript updates in ~1-3 seconds.
   - Scam keywords (*Police*, *arrest*, *Transfer*, *immediately*) light up in red.
   - Threat level escalates dynamically.

### Mode B: Judge Demonstration & Fallback Player Mode (Fail-Safe Offline)
Hackathon Wi-Fi or microphone noise can be unpredictable. The right-hand panel provides a **1-Click Pre-Recorded Audio Player** that streams authentic audio clips through the exact same backend ML pipeline:

| Scenario | Audio Content | Expected AI Behavior | Target Threat Tier |
|---|---|---|---|
| **Scenario 1: Real Normal** | Authentic human casual daily speech | Low synthetic probability (~0-5%), zero scam keywords | **LOW (Green, < 30)** |
| **Scenario 2: Cloned Normal** | AI-synthesized cloned voice talking about business | Synthetic probability spikes to ~95%, zero scam keywords | **CAUTION (Yellow, 30–59)** |
| **Scenario 3: Real Scam** | Real human voice performing high-pressure legal coercion | Real voice (~0-15%), scam score spikes to ~70-85% | **HIGH (Orange, 60–84)** |
| **Scenario 4: Cloned Scam** | AI-cloned family voice demanding urgent wire transfer | Both synthetic (~95%) and scam (~85%) spike together | **CRITICAL (Red, 85–100)** |

---

## 7. Key Architecture Design Decisions & FAQ

1. **Why `127.0.0.1` instead of `localhost`?**
   - On Windows, `localhost` often resolves to IPv6 `[::1]`. If uvicorn binds to `127.0.0.1`, WebSocket handshakes can fail silently. The frontend explicitly targets `127.0.0.1:8000`.
2. **Why `faster-whisper` `base` model with `language="en"`?**
   - Setting `language="en"` skips language identification overhead, cutting inference time by 50% while capturing Indian English, legal jargon, and Hinglish scam terms with high fidelity.
3. **How is backpressure handled?**
   - In `backend/app/main.py`, `room.is_processing` locks the pipeline. If a chunk is currently being processed on CPU, incoming chunks are skipped so that queue delay NEVER accumulates. Latency stays strictly under 3.5 seconds.
4. **No Acoustic Feedback**:
   - In `frontend/src/components/CallRoom.jsx`, the Web Audio ScriptProcessor is piped through a `gain.value = 0` mute node before `audioCtx.destination`, ensuring the user's mic never echoes out of laptop speakers.
