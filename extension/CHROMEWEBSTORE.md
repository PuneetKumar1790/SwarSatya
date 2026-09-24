# Chrome Web Store Listing — SwarSatya Voice Guard

**Extension Name:** SwarSatya - Real-Time AI Voice Impersonation Guard  
**Category:** Productivity / Security & Privacy  
**Version:** 1.0.0  
**Target Environment:** Manifest V3 (Google Chrome M116+)  
**Support URL:** https://github.com/PuneetKumar1790/SwarSatya  

---

## 1. Store Descriptions

### Short Description (Max 132 chars)
Real-time AI voice cloning and impersonation defense guard for browser calls (Google Meet, Teams, WhatsApp Web).

### Detailed Description
SwarSatya protects your online meetings and video calls against AI voice cloning, deepfake audio, and financial impersonation scams in real time.

When taking calls on Google Meet, Microsoft Teams, Zoom Web, or WhatsApp Web, SwarSatya monitors incoming voice streams and calculates a dynamic threat score across four advanced security layers:
1. **AI Voice Synthesis Detection:** Identifies unnatural synthetic speech patterns and acoustic dispersion.
2. **Phase & Spectral Analysis:** Detects vocoder phase artifacts and unnatural voice transitions.
3. **Speaker Biometric Verification:** Validates the speaker's acoustic profile against enrolled corporate baselines.
4. **Conversational Scam Detection:** Flags coercive extortion tactics, fake legal threats ("Digital Arrest"), and urgent money transfer demands.

### Key Features:
- **In-Call Companion Side Panel:** Displays live threat level and risk breakdown right alongside your meeting tab.
- **Scam Defense Copilot:** Provides tactical counter-questions to challenge suspected scammers with 1-click clipboard copy.
- **1-Click Police FIR Generator:** Instantly formats a legally structured cybercrime complaint draft compliant with Section 66D of the IT Act 2000.
- **National Cybercrime Helpline:** Direct access to India's toll-free 1930 reporting hotline.
- **Zero Audio Storage:** Audio is analyzed in volatile memory with zero persistent voice recordings for complete privacy.

---

## 2. Permissions Justification

| Permission | Review Justification (Plain English) |
|---|---|
| `tabCapture` | Required to capture incoming meeting tab audio (Google Meet, Teams, Zoom) to analyze acoustic signals for deepfake voice detection. |
| `sidePanel` | Displays the real-time threat meter, risk telemetry, and tactical scam defense scripts alongside the active meeting tab. |
| `storage` | Stores user alert preferences, threat threshold configurations, and recent feedback entries locally on device. |
| `activeTab` | Permits the extension to identify the active meeting tab when opening the side panel companion. |

### Host Permissions:
- `http://127.0.0.1:8000/*`, `ws://127.0.0.1:8000/*`: Connects the browser extension to the local SwarSatya Voice SOC ML backend for low-latency acoustic inference.

---

## 3. Privacy & Data Use Disclosure

- **Audio Data:** Volatile in-memory streaming only. No raw audio files are stored, uploaded to external cloud servers, or sold to third parties.
- **Personal Information:** Does not collect browsing history, personal identity credentials, or passwords.
- **Compliance:** Designed in alignment with the Digital Personal Data Protection (DPDP) Act 2023.

---

## 4. Version History

- **v1.0.0 (Initial Release - SIH #26104 Prototype)**
  - Real-time Manifest V3 side panel with dynamic risk gauge.
  - Multi-layer telemetry breakdown (Wav2Vec2, Phase Irregularity, Speaker Biometrics, Scam Intent).
  - Tactical counter-interrogation scripts with 1-click copy.
  - Emergency 1930 Helpline and pre-formatted Section 66D IT Act FIR draft generator.
