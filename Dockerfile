# SwarSatya Voice SOC Backend - Hugging Face Spaces Dockerfile
# Optimized for Hugging Face Free Tier (16 GB RAM + 2 vCPU)

FROM python:3.11-slim

# Prevent interactive prompts during apt install
ENV DEBIAN_FRONTEND=noninteractive

# Install system audio libraries (libsndfile for audio loading, ffmpeg for transcoding)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsndfile1 \
    ffmpeg \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set up user with UID 1000 (standard for Hugging Face Spaces)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

WORKDIR $HOME/app

# Install Python requirements
COPY --chown=user:user backend/requirements.txt $HOME/app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend code and demo audio datasets
COPY --chown=user:user backend $HOME/app/backend
COPY --chown=user:user demo_audio $HOME/app/demo_audio

WORKDIR $HOME/app/backend

# Hugging Face Spaces default HTTP port is 7860
EXPOSE 7860

# Launch Uvicorn on 0.0.0.0:7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
