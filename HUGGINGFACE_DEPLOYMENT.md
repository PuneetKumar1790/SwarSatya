# Deploying SwarSatya Backend & AI Core to Hugging Face Spaces (100% Free)

This guide walks you through deploying the **SwarSatya Voice SOC backend and ML pipeline** on **Hugging Face Spaces** using the **Gradio SDK** (which requires **NO credit card or billing**).

Hugging Face Spaces provides **16 GB RAM + 2 vCPU for FREE**, which comfortably loads PyTorch, Wav2Vec2, Faster-Whisper, and Librosa without hitting memory limits.

---

## Step 1: Create a Free Gradio Space on Hugging Face

1. Go to **[huggingface.co/new-space](https://huggingface.co/new-space)**.
2. Fill in the settings:
   - **Space name:** `swarsatya-backend`
   - **License:** `apache-2.0` (or `mit`)
   - **Select the Space SDK:** Select **`Gradio`** (the orange box) -> Choose template: **`Blank`**.
   - **Space Hardware:** Select **`CPU basic · 2 vCPU · 16 GB · FREE`** *(100% Free, NO credit card needed)*.
   - **Visibility:** **Public**.
3. Click **"Create Space"** at the bottom.

---

## Step 2: Push the SwarSatya Repository to Hugging Face

In your terminal (inside `d:\Puneet\Swar`):

### 1. Authenticate with Hugging Face (One-time)
```bash
huggingface-cli login
```
*(Paste your User Access Token from https://huggingface.co/settings/tokens with Write permissions)*

### 2. Add Your Hugging Face Space as a Remote
Replace `<YOUR_HF_USERNAME>` with your actual Hugging Face username (e.g. `Puneetk1789`):
```bash
git remote add hf https://huggingface.co/spaces/Puneetk1789/swarsatya-backend
```

### 3. Push the Code to Hugging Face
```bash
git add app.py packages.txt requirements.txt backend demo_audio
git commit -m "deploy: configure Hugging Face Spaces Gradio SDK"
git push hf main
```

---

## Step 3: What Happens in Hugging Face

1. Hugging Face automatically reads:
   - **`packages.txt`:** Installs `libsndfile1` and `ffmpeg` system audio codecs.
   - **`requirements.txt`:** Installs PyTorch, Transformers, Faster-Whisper, FastAPI, and Librosa.
   - **`app.py`:** Starts Uvicorn and loads our entire FastAPI backend on port **7860**.
2. Within 2–3 minutes, your Space turns **"Running"**.

---

## Step 4: Your Live Cloud Endpoints

- **Live Gradio Landing Page:**
  ```
  https://Puneetk1789-swarsatya-backend.hf.space/gradio
  ```
- **REST API Health Check:**
  ```
  https://Puneetk1789-swarsatya-backend.hf.space/api/health
  ```
- **Real-Time WebSocket Audio Stream:**
  ```
  wss://Puneetk1789-swarsatya-backend.hf.space/ws/call/satya-room-1
  ```

---

## Step 5: Connecting Your Frontend (Vercel)

When deploying your React frontend to **Vercel**:
1. Add an Environment Variable in your Vercel Project Settings:
   - **Key:** `VITE_BACKEND_URL`
   - **Value:** `https://Puneetk1789-swarsatya-backend.hf.space`
2. Click **Deploy**.

Your frontend is now connected to a high-memory cloud AI backend for **₹0 total cost**!
