"""Automatic Speech Recognition (ASR) Module (SwarSatya Phase 4).

Uses faster-whisper (multilingual int8 on CPU) for low-latency Hindi/English/Hinglish transcription.
"""
import logging
import re
import numpy as np
from faster_whisper import WhisperModel

logger = logging.getLogger("swarsatya.asr")

# Common Whisper hallucination patterns to filter out
_HALLUCINATION_RE = re.compile(
    r'thanks for watching|please subscribe|like and subscribe|'
    r'see you in the next|bye bye|thank you for listening',
    re.IGNORECASE
)


def clean_whisper_text(text: str) -> str:
    """Removes meta words like 'transcript' and eliminates repetitive word/phrase loops."""
    if not text:
        return ""
    # 1. Remove literal meta words hallucinated from prompts
    text = re.sub(r'\btranscript\b', '', text, flags=re.IGNORECASE)
    # 2. Deduplicate any word repeated with commas, spaces, dots or hyphens
    text = re.sub(r'\b(\w+)(?:[,\s\.\-]+(?:\1\b))+', r'\1', text, flags=re.IGNORECASE)
    # 3. Deduplicate multi-word phrase loops (e.g. "hello world, hello world")
    text = re.sub(r'(\b[\w\s\']{4,}\b)(?:[,\s\.\-]+(?:\1\b))+', r'\1', text, flags=re.IGNORECASE)
    # 4. Clean up dangling punctuation and spacing
    text = re.sub(r'\s*,\s*', ', ', text)
    text = re.sub(r'(?:,\s*){2,}', ', ', text)
    text = re.sub(r'\s+', ' ', text).strip(' ,.-')
    return text


class SpeechRecognizer:
    def __init__(self, model_size: str = "base", device: str = "cpu", compute_type: str = "int8"):
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

            # Check RMS energy - if near silent, don't waste model inference
            rms = np.sqrt(np.mean(audio_chunk ** 2))
            if rms < 0.005:
                return ""

            segments, info = self.model.transcribe(
                audio_chunk,
                beam_size=3,
                best_of=1,
                temperature=0.0,
                language="en",
                condition_on_previous_text=False,
                vad_filter=True,
                vad_parameters=dict(
                    min_silence_duration_ms=250,
                    speech_pad_ms=200
                ),
                no_speech_threshold=0.45,
                log_prob_threshold=-0.8,
                compression_ratio_threshold=2.2,
                initial_prompt=(
                    "Delhi Police, cyber crime division, CBI, "
                    "Inspector Sharma, arrest warrant, bank account, OTP verification code, "
                    "transfer eighty thousand rupees via UPI immediately, "
                    "keep this secret, do not tell anyone, customs detained me at the airport, "
                    "emergency, Aadhaar card, FIR, do not disconnect the call."
                )
            )

            texts = []
            for seg in segments:
                t = seg.text.strip()
                if not t or t.startswith("..."):
                    continue
                # Skip common Whisper hallucinations
                if _HALLUCINATION_RE.search(t):
                    continue
                cleaned = clean_whisper_text(t)
                if cleaned:
                    texts.append(cleaned)

            transcript = " ".join(texts).strip()
            return clean_whisper_text(transcript)

        except Exception as e:
            logger.error(f"Error during audio transcription: {e}")
            return ""


speech_recognizer = SpeechRecognizer()

