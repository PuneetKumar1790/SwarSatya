"""SwarSatya Voice SOC - Hugging Face Spaces Entrypoint (Gradio SDK).
Mounts the FastAPI multi-layer voice security engine and exposes port 7860.
"""
import os
import sys

# Ensure backend directory is in Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

import uvicorn
import gradio as gr
from app.main import app as fastapi_app

# Create a clean visual landing page for the Hugging Face Space
with gr.Blocks(title="SwarSatya Voice SOC Core") as demo:
    gr.Markdown("# 🛡️ SwarSatya — Voice Security Operations Center Core API")
    gr.Markdown("### Real-Time Multi-Layer Voice Impersonation & Cloning Defense Framework (SIH #26104)")
    gr.Markdown("""
    The SwarSatya ML Core backend is **ACTIVE** and running on Hugging Face Spaces:
    - **Acoustic & Deepfake Engine:** Wav2Vec2 + STFT Phase Irregularity Analyzer
    - **Speaker Biometric Verification:** Cosine Similarity with Registered Profiles
    - **Contextual Scam Copilot:** Real-Time Counter-Scripting & Extortion Detection
    - **REST API Documentation:** Available at `/docs` and `/api/health`
    - **WebSocket Audio Stream:** Connect to `wss://<space-host>/ws/call/{room_id}`
    """)

# Mount Gradio UI at /gradio so root API endpoints and WebSockets take precedence
app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
