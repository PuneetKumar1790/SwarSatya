"""Automatic Speech Recognition (ASR) Module (SwarSatya Phase 4).

Uses faster-whisper (multilingual int8 on CPU) for low-latency Hindi/English/Hinglish transcription.
"""
import logging
import numpy as np
from faster_whisper import WhisperModel

logger = logging.getLogger("swarsatya.asr")


class SpeechRecognizer:
    def __init__(self, model_size: str = "tiny", device: str = "cpu", compute_type: str = "int8"):
        self.model_size = model_size
        self.device = device
        self.compute_type = compute_type
        self.model = None
        self.is_loaded = False

    def load_model(self):
        """Loads faster-whisper model."""
        if self.is_loaded:
            return
        try:
            logger.info(f"Loading faster-whisper '{self.model_size}' model ({self.compute_type} on {self.device})...")
            self.model = WhisperModel(
                self.model_size,
                device=self.device,
                compute_type=self.compute_type,
                cpu_threads=4
            )
            self.is_loaded = True
            logger.info("faster-whisper model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load faster-whisper model: {e}", exc_info=True)
            self.is_loaded = False

    def transcribe_chunk(self, audio_chunk: np.ndarray, sample_rate: int = 16000) -> str:
        """
        Transcribes a 16kHz float32 audio chunk to text.
        audio_chunk: 1D numpy array of float32 samples.
        """
        if not self.is_loaded:
            self.load_model()
            if not self.is_loaded:
                return ""

        try:
            if len(audio_chunk) < 8000:
                return ""

            # Ensure float32 format
            if audio_chunk.dtype != np.float32:
                audio_chunk = audio_chunk.astype(np.float32)

            # Check RMS energy - if near silent, don't feed to Whisper
            rms = np.sqrt(np.mean(audio_chunk ** 2))
            if rms < 0.008:
                return ""

            segments, info = self.model.transcribe(
                audio_chunk,
                beam_size=1,
                best_of=1,
                temperature=0.0,
                condition_on_previous_text=False,
                vad_filter=True,
                vad_parameters=dict(min_silence_duration_ms=300),
                no_speech_threshold=0.5,
                compression_ratio_threshold=2.2,
                initial_prompt="Phone call security check. Keywords: police, bank, CBI, OTP, account, transfer, arrest, urgent, credit card, money."
            )

            texts = []
            for seg in segments:
                t = seg.text.strip()
                # Skip silent artifacts, dots, and common YouTube Whisper hallucinations
                if not t or t.startswith("...") or "thanks for watching" in t.lower() or "subscribe" in t.lower():
                    continue
                # Suppress repetitive loop patterns (e.g. "I'm going to get a new car...")
                import re
                t = re.sub(r'(\b[\w\s\']{3,}\b)(?:\s+\1){2,}', r'\1', t)
                texts.append(t)

            transcript = " ".join(texts).strip()
            return transcript

        except Exception as e:
            logger.error(f"Error during audio transcription: {e}")
            return ""


speech_recognizer = SpeechRecognizer()
