# 🛡️ SwarSatya (स्वर सत्य) — Real-Time Voice Impersonation & Clone Defense Framework

[![SIH Problem Statement](https://img.shields.io/badge/SIH%202026-Problem%20%2326104-06b6d4?style=for-the-badge)](https://www.sih.gov.in/)
[![Live Frontend](https://img.shields.io/badge/Live%20Frontend-Vercel%20Edge-10b981?style=for-the-badge&logo=vercel)](https://swar-satya.vercel.app/)
[![ZeroGPU Backend](https://img.shields.io/badge/HuggingFace-ZeroGPU%20(A10G)-ffbf00?style=for-the-badge&logo=huggingface)](https://huggingface.co/spaces/Puneetk1789/swarsatya-backend)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **SwarSatya (स्वर सत्य)** is an enterprise-grade, multi-layer **Voice Security Operations Center (Voice SOC)** that detects AI voice cloning, deepfake executive impersonation, and social engineering coercion in live browser & VoIP calls with sub-second latency.

---

## 🌐 Live Production Deployments

| Component | Platform & Tier | Production URL |
| :--- | :--- | :--- |
| **Reactive SOC Dashboard** | **Vercel** (Global Edge CDN) | [**`swar-satya.vercel.app`**](https://swar-satya.vercel.app/) |
| **AI ML Backend & WebSocket Engine** | **Hugging Face Spaces** (ZeroGPU NVIDIA A10G) | [`puneetk1789-swarsatya-backend.hf.space`](https://puneetk1789-swarsatya-backend.hf.space/soc/api/health) |
| **Interactive Standalone UI** | **Hugging Face Hub** | [`huggingface.co/spaces/Puneetk1789/swarsatya-backend`](https://huggingface.co/spaces/Puneetk1789/swarsatya-backend) |
| **Source Repository** | **GitHub** | [`github.com/PuneetKumar1790/SwarSatya`](https://github.com/PuneetKumar1790/SwarSatya) |

---

## 🎯 Problem Statement (SIH #26104)

### Context & Threat Landscape
With the advent of zero-shot neural voice cloning models (e.g. ElevenLabs, VALL-E, XTTS), bad actors can clone an executive's voice using only 3 seconds of reference audio. This enables high-velocity financial fraud:
1. **CEO / CFO Wire Fraud:** Attackers impersonate company executives ordering urgent, confidential fund transfers (e.g. ₹25 Lakhs) to fraudulent offshore accounts.
2. **Legal & Law Enforcement Extortion (Digital Arrest):** Scammers impersonate CBI, Police, or Customs officials, placing victims under extreme psychological duress.
3. **Pre-Transaction Blind Spots:** Traditional anti-fraud systems inspect transaction metadata *after* the wire is approved. They have zero visibility into the live coercive telephone call leading up to the transaction.

### The SwarSatya Solution
SwarSatya acts as an active **Voice Firewall & Cognitive Copilot**. It intercepts audio chunks concurrently across five forensic dimensions, computes real-time threat scores, dynamically halts high-value banking transfers, and auto-generates Section 66D IT Act police FIR documentation.

---

## 🏗️ Multi-Layer Forensic Architecture

```
                      LIVE CONVERSATION / WEBRTC / VOIP STREAM
                                         │
                                         ▼
                      FastAPI WebSocket Ingestion Engine
                     (16kHz Mono Audio Chunks • Sub-700ms)
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
        ▼                                ▼                                ▼
  [ LAYER 1 & 2 ]                  [ LAYER 3 ]                      [ LAYER 4 & 5 ]
Acoustic & Deepfake               Speaker Voiceprint               Context & Language
• Pretrained Wav2Vec2             Biometrics                       • Faster-Whisper ASR
  Neural Classifier               • Enrolled Cosine Similarity       (Hindi/English/Hinglish)
• STFT Spectral Rolloff &           vs Executive Voiceprint        • 5-Category Coercion &
  Bispectrum Phase Dispersion     • Identity Mismatch Detection      Scam NLP Rule Matcher
        │                                │                                │
        └────────────────────────────────┼────────────────────────────────┘
                                         │
                                         ▼
                           Dynamic Risk Fusion Engine
             Overall Risk = f(Synth, Spectral, Prosody, Biometric, Scam, Stakes)
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
       Active Defense Copilot                         Core Banking Interlock
• Real-Time Counter-Prompts (Speak to Caller)   • Automated Pre-Transaction Hold (₹25L)
• Statutory 1930 / Sec 66D FIR Complaint Draft  • Out-of-Band Secondary MFA (OTP: 739201)
```

---

## ✨ Key Hackathon Innovations (The 5 Pillars)

### 1. Metadata & Threat Enrichment
- Inspects incoming caller phone numbers against registered corporate PBX gateways.
- Models non-linear risk escalation based on financial exposure (e.g. baseline calls vs ₹25,00,000 wire transfers).
- Flags unverified VoIP origination and known fraud blacklist patterns.

### 2. Cross-Session Voice Biometrics
- Enrolls high-value executive voiceprints (`CFO Rahul Sharma`).
- Calculates cosine distance on speaker embeddings in real time during incoming calls.
- Detects voice spoofing even when acoustic speech appears natural.

### 3. In-Call Scam Defense Copilot
- Unlike passive loggers, provides active cognitive defense to call recipients under duress.
- Displays dynamic, one-click copyable counter-interrogation scripts to disarm the caller:
  - *"Could you please confirm this request through an official corporate email or registered number?"*
  - *"I will call you back on your registered office extension after checking our standard operating procedure."*
- Cites statutory legal protections and direct 1930 Helpline advice.

### 4. Automated Cybercrime FIR Generator (1930 Legal Helpdesk)
- Automatically drafts a formal police complaint pre-formatted for India's **National Cyber Crime Reporting Portal (NCRP)**.
- Pre-fills suspect telephone numbers, claimed identities, exposure amounts, cryptographic incident IDs, and full acoustic forensic telemetry.
- Cites statutory provisions: **Section 66D of the Information Technology Act 2000** and **Section 319 of the Bharatiya Nyaya Sanhita (BNS)**.

### 5. Core Banking Pre-Transaction Interlock
- Integrates directly with banking/ERP payment gateways.
- When live voice risk exceeds safety thresholds (e.g. >60%), financial transfers are automatically placed on **HOLD**.
- Releases funds only upon successful Out-of-Band Secondary Factor Authentication (Simulated OTP `739201` dispatched to registered hardware lines).

---

## 📡 Complete Public API Reference

The backend is served as a production REST & WebSocket API at `https://puneetk1789-swarsatya-backend.hf.space/soc` with CORS enabled (`allow_origins=["*"]`).

### 1. Real-Time Audio Streaming (WebSocket)

#### **Endpoint:**
```
wss://puneetk1789-swarsatya-backend.hf.space/soc/ws/call/{room_id}
```

#### **Client Messages (Send):**

##### Ingest Live Audio Chunk:
```json
{
  "type": "audio_chunk",
  "chunk_index": 1,
  "audio_base64": "<base64_encoded_16khz_pcm_bytes>"
}
```

##### Trigger Pre-Recorded Benchmark Scenario:
```json
{
  "type": "start_demo",
  "scenario": "cloned_scam"
}
```
*Supported Scenarios:* `real_normal`, `cloned_normal`, `real_scam`, `cloned_scam`.

##### Ping / Keep-Alive:
```json
{
  "type": "ping",
  "client_time": 1790273509.2
}
```

#### **Server Messages (Receive):**

##### Real-Time Risk Telemetry Update (`risk_update`):
```json
{
  "type": "risk_update",
  "room_id": "satya-room-1",
  "timestamp": 1790273510.4,
  "chunk_index": 1,
  "overall_risk": 88.4,
  "threat_tier": "CRITICAL",
  "action_code": "BLOCK_AND_ESCALATE",
  "recommended_action": "High-confidence voice clone with extortion pattern detected. Freeze fund movements.",
  "requires_hold": true,
  "transaction_held": true,
  "active_incident_id": "INC-2026-00418",
  "layer_breakdown": {
    "synthetic_model": 94.2,
    "spectral_phase": 82.5,
    "prosody_behavior": 45.0,
    "speaker_mismatch": 82.0,
    "context_stakes": 85.0,
    "conversational_scam": 88.0
  },
  "transcript_snippet": "Please listen carefully and keep this secret, transfer 25 lakhs immediately...",
  "detected_patterns": ["urgency", "secrecy_coercion", "financial_demand"],
  "detected_language": "en",
  "processing_latency_ms": 699.7
}
```

---

### 2. REST API Endpoints

#### **Health & Model Status Check**
```http
GET /soc/api/health
```
**Response (200 OK):**
```json
{
  "status": "ok",
  "app": "SwarSatya Voice SOC",
  "models_loaded": {
    "deepfake": true,
    "asr": true,
    "speaker_biometrics": true,
    "spectral_engine": true,
    "prosody_engine": true,
    "context_engine": true
  },
  "active_rooms": 1,
  "privacy": {
    "feature_only_logging": true,
    "raw_audio_retention": false,
    "edge_inference_support": true
  }
}
```

#### **Update Call Metadata Context**
```http
POST /soc/api/context/update
Content-Type: application/json

{
  "room_id": "satya-room-1",
  "caller_number": "+91-91234-56789",
  "claimed_identity_id": "cfo_rahul",
  "transaction_amount": 2500000.0,
  "action_type": "Urgent Fund Transfer"
}
```

#### **Simulate Banking Wire Transfer**
```http
POST /soc/api/action/simulate-transfer
Content-Type: application/json

{
  "room_id": "satya-room-1",
  "amount": 2500000.0,
  "recipient": "Offshore Vendor Holdings (Acct #98421004)"
}
```
**Response (Held Transfer):**
```json
{
  "status": "HELD",
  "requires_hold": true,
  "message": "CRITICAL THREAT: Transaction suspended by Voice SOC policy. Secondary Out-of-Band verification required."
}
```

#### **Dispatch Step-Up MFA OTP**
```http
POST /soc/api/action/send-mfa
Content-Type: application/json

{
  "room_id": "satya-room-1"
}
```
**Response:**
```json
{
  "status": "sent",
  "registered_phone": "+91-98110-45291",
  "message": "Secondary OTP sent to registered line: +91-98110-45291",
  "demo_hint": "Demo OTP code is: 739201"
}
```

#### **Verify Step-Up MFA OTP**
```http
POST /soc/api/action/verify-mfa
Content-Type: application/json

{
  "room_id": "satya-room-1",
  "otp_code": "739201"
}
```
**Response (200 OK):**
```json
{
  "status": "verified",
  "message": "Identity confirmed via secondary factor. Transaction released for settlement."
}
```

#### **Generate Section 66D IT Act Police FIR Draft**
```http
GET /soc/api/legal/fir-draft?room_id=satya-room-1
```
**Response (200 OK):**
```json
{
  "status": "success",
  "fir_text": "FORMAL CYBERCRIME COMPLAINT DRAFT (Under Section 66D IT Act 2000 & Section 319 BNS)\nNational Cyber Crime Reporting Portal (NCRP) - Helpline 1930\n\n1. COMPLAINANT INCIDENT ID: INC-2026-00418\n2. SUSPECT CALLER NUMBER: +91-91234-56789\n3. CLAIMED IDENTITY: Rahul Sharma (CFO)\n4. TRANSACTION EXPOSURE DEMANDED: Rs. 2,500,000.00\n5. AI VOICE FORENSIC EVIDENCE:\n   - Impersonation Threat Score: 88.4% (CRITICAL)\n   - Synthetic Voice Probability: 94.2%\n   - Speaker Biometric Match: 18.0% (Mismatch Risk: 82.0%)...\n\nPRAYER / ACTION REQUESTED: Registration of FIR under Section 66D IT Act 2000 and Section 319 BNS."
}
```

#### **Submit Human Retraining Feedback**
```http
POST /soc/api/feedback
Content-Type: application/json

{
  "room_id": "satya-room-1",
  "user_verdict": "CONFIRMED_SCAM",
  "action_requested": "BLACKLIST_VOICE",
  "comments": "Voice clone attempted ₹25L wire transfer. Verified via step-up OTP."
}
```

---

## 💻 Integration Code Snippets for External Platforms

### Python (Client Example)
```python
import asyncio
import websockets
import json

async def monitor_call():
    uri = "wss://puneetk1789-swarsatya-backend.hf.space/soc/ws/call/my-room"
    async with websockets.connect(uri) as ws:
        # Trigger demo or stream chunks
        await ws.send(json.dumps({"type": "start_demo", "scenario": "cloned_scam"}))
        
        while True:
            msg = await ws.recv()
            data = json.loads(msg)
            if data.get("type") == "risk_update":
                print(f"Threat Tier: {data['threat_tier']} | Score: {data['overall_risk']}%")
                if data["requires_hold"]:
                    print("🚨 AUTOMATED BANKING HOLD TRIGGERED!")

asyncio.run(monitor_call())
```

### JavaScript / Node.js
```javascript
import WebSocket from 'ws';

const ws = new WebSocket('wss://puneetk1789-swarsatya-backend.hf.space/soc/ws/call/room-101');

ws.on('open', () => {
  ws.send(JSON.stringify({ type: 'start_demo', scenario: 'cloned_scam' }));
});

ws.on('message', (msg) => {
  const telemetry = JSON.parse(msg);
  if (telemetry.type === 'risk_update') {
    console.log(`[RISK UPDATE] ${telemetry.threat_tier} (${telemetry.overall_risk}%)`);
  }
});
```

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.10 or 3.11
- Node.js 18+ & npm
- FFmpeg (for local audio decoding)

### 1. Clone Repository
```bash
git clone https://github.com/PuneetKumar1790/SwarSatya.git
cd SwarSatya
```

### 2. Backend Setup
```bash
python -m venv backend/venv

# Windows Powershell:
.\backend\venv\Scripts\Activate.ps1
# Linux / macOS:
# source backend/venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔒 Privacy, Security & Legal Compliance

- **DPDP Act 2023 Compliance:** SwarSatya implements a strict **Feature-Only Logging Policy**. Raw voice audio streams are processed in RAM buffers and discarded immediately after feature extraction.
- **Audit Immutability:** Forensic features and timestamps are cryptographically persisted into SQLite/PostgreSQL audit stores.
- **Zero Audio Retention Mode:** Can be toggled on/off in the **Policy Settings** modal to ensure zero audio recording compliance in sensitive financial trading desks.

---

## 👥 Contributors & Acknowledgements

- **Team SwarSatya** — Smart India Hackathon (SIH 2026)
- **Problem Statement:** #26104 (Real-Time Voice Clone & Impersonation Scam Defense)
- Built with Hugging Face ZeroGPU, Faster-Whisper, Wav2Vec2, Librosa, FastAPI, and React.
