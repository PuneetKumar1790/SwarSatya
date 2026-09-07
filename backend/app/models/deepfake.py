"""Deepfake / Synthetic Voice Detection Module (SwarSatya Phase 3).

Uses pretrained Wav2Vec2 anti-spoofing classifier (MelodyMachine/Deepfake-audio-detection-V2).
Evaluates audio chunks (16kHz) and outputs synthetic voice risk probability (0.0 to 100.0).
"""
import logging
import torch
import numpy as np
from transformers import AutoModelForAudioClassification, AutoFeatureExtractor

logger = logging.getLogger("swarsatya.deepfake")

DEFAULT_MODEL_ID = "MelodyMachine/Deepfake-audio-detection-V2"


class DeepfakeDetector:
    def __init__(self, model_id: str = DEFAULT_MODEL_ID):
        self.model_id = model_id
        self.feature_extractor = None
        self.model = None
        self.is_loaded = False

    def load_model(self):
        """Loads pretrained Wav2Vec2 model and feature extractor."""
        if self.is_loaded:
            return
        try:
            logger.info(f"Loading deepfake speech classifier: {self.model_id}...")
            self.feature_extractor = AutoFeatureExtractor.from_pretrained(self.model_id)
            self.model = AutoModelForAudioClassification.from_pretrained(self.model_id)
            self.model.eval()
            self.is_loaded = True
            logger.info(f"Deepfake speech classifier loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load deepfake model {self.model_id}: {e}", exc_info=True)
            self.is_loaded = False

    def score_chunk(self, audio_chunk: np.ndarray, sample_rate: int = 16000) -> float:
        """
        Scores an audio chunk returning synthetic-voice risk (0.0 - 100.0).
        audio_chunk: 1D numpy array of float32 samples normalized [-1.0, 1.0].
        """
        if not self.is_loaded:
            self.load_model()
            if not self.is_loaded:
                return 0.0

        try:
            # Ensure minimum audio length (at least ~0.5s = 8000 samples)
            if len(audio_chunk) < 8000:
                audio_chunk = np.pad(audio_chunk, (0, 8000 - len(audio_chunk)), mode='constant')

            # Extract features
            inputs = self.feature_extractor(
                audio_chunk,
                sampling_rate=sample_rate,
                return_tensors="pt"
            )

            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probs = torch.softmax(logits, dim=-1)[0]
                
                # Calibrated temperature scaling to avoid over-saturation
                real_logit = float(logits[0][0].item())
                synth_logit = float(logits[0][1].item())
                diff = synth_logit - real_logit
                temp = 3.0
                fake_prob = 1.0 / (1.0 + np.exp(-diff / temp)) * 100.0
                return max(0.0, min(100.0, round(fake_prob, 2)))

        except Exception as e:
            logger.error(f"Error scoring audio chunk for deepfake: {e}")
            return 0.0


deepfake_detector = DeepfakeDetector()
