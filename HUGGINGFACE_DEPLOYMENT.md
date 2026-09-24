# Deploying SwarSatya Backend & AI Core to Hugging Face Spaces (100% Free)

This guide walks you through deploying the **SwarSatya Voice SOC backend and ML pipeline** on **Hugging Face Spaces** using the **Docker SDK**.

Hugging Face Spaces provides **16 GB RAM + 2 vCPU for FREE**, which comfortably loads PyTorch, Wav2Vec2, Faster-Whisper, and Librosa without hitting memory limits.

---

## Step 1: Create a New Space on Hugging Face

1. Log in to [Hugging Face](https://huggingface.co/) (create a free account if you don't have one).
2. Click on your profile icon in the top right and click **"New Space"** (or visit [huggingface.co/new-space](https://huggingface.co/new-space)).
3. Fill in the Space settings:
   - **Space name:** `swarsatya-backend`
   - **License:** `apache-2.0` (or `mit`)
   - **Select the Space SDK:** Choose **`Docker`** -> **`Blank`** (Do NOT choose Gradio or Streamlit).
   - **Space Hardware:** Select **`CPU basic · 2 vCPU · 16 GB · FREE`**.
   - **Visibility:** **Public**.
4. Click **"Create Space"**.

---

## Step 2: Configure the Space `README.md` Frontmatter

Hugging Face Spaces requires a YAML header in the root `README.md` to know which port to expose.

Create or update the `README.md` in your Space with this exact header at the very top:

```yaml
---
title: SwarSatya Voice SOC ML Core
emoji: 🛡️
colorFrom: blue
colorTo: cyan
sdk: docker
app_port: 7860
pinned: false
---

# SwarSatya - Real-Time AI Voice Impersonation Defense Core (SIH #26104)
Multi-Layer Voice Security Operations Center backend powered by FastAPI, PyTorch, and Wav2Vec2.
```

---

## Step 3: Deploy via Git to Hugging Face

In your local terminal (inside `d:\Puneet\Swar`):

### 1. Authenticate with Hugging Face Git
```bash
# If not already installed:
# pip install huggingface_hub
huggingface-cli login
# Enter your Hugging Face User Access Token (from https://huggingface.co/settings/tokens with Write permissions)
```

### 2. Add Hugging Face Space as a Git Remote
Replace `<YOUR_HF_USERNAME>` with your actual Hugging Face username:
```bash
git remote add hf https://huggingface.co/spaces/<YOUR_HF_USERNAME>/swarsatya-backend
```

### 3. Push the Code to Hugging Face
```bash
git add Dockerfile README.md backend demo_audio
git commit -m "deploy: configure Hugging Face Spaces Docker container"
git push hf main
```

---

## Step 4: Verify the Backend is Live

1. Go to your Hugging Face Space page: `https://huggingface.co/spaces/<YOUR_HF_USERNAME>/swarsatya-backend`.
2. Wait 2–3 minutes for the Docker image to build and start. Once ready, the status badge will say **"Running"**.
3. Your direct API URL is:
   ```
   https://<YOUR_HF_USERNAME>-swarsatya-backend.hf.space
   ```
4. Test the health endpoint in your browser or curl:
   ```
   https://<YOUR_HF_USERNAME>-swarsatya-backend.hf.space/api/health
   ```
   You will get the response:
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
     }
   }
   ```
5. Your WebSocket endpoint for real-time audio is:
   ```
   wss://<YOUR_HF_USERNAME>-swarsatya-backend.hf.space/ws/call/satya-room-1
   ```

---

## Step 5: Connect Frontend (Vercel or Localhost) to Hugging Face

Now point your frontend to your free Hugging Face backend:

### In Local Development:
Create a `.env.local` inside `frontend/`:
```env
VITE_BACKEND_URL=https://<YOUR_HF_USERNAME>-swarsatya-backend.hf.space
```

### On Vercel (When Deploying Frontend):
1. Go to your project on Vercel dashboard.
2. Under **Settings** -> **Environment Variables**, add:
   - **Key:** `VITE_BACKEND_URL`
   - **Value:** `https://<YOUR_HF_USERNAME>-swarsatya-backend.hf.space`
3. Redeploy the frontend.

Now your entire SwarSatya application (Frontend on Vercel + AI Backend on Hugging Face Spaces) is **running 100% in the cloud for ₹0 cost!**

---

## Key Benefits of Hugging Face Spaces for Judges:
- **Zero OOM Crashes:** 16 GB of RAM gives the PyTorch and Whisper models plenty of headroom.
- **Always Free:** No credit card required, no monthly subscription.
- **Native HTTPS & WSS:** Built-in SSL certificates required for browser microphone permissions.
