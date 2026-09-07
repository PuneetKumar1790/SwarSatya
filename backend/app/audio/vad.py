"""Voice Activity Detection (VAD) and Audio Preprocessing Module.

Uses webrtcvad and RMS energy estimation to filter silence and noise chunks.
"""
import numpy as np
import webrtcvad
import logging

logger = logging.getLogger("swarsatya.vad")


class VoiceActivityDetector:
    def __init__(self, mode: int = 2, frame_duration_ms: int = 30, sample_rate: int = 16000):
        """
        mode: 0 (least aggressive), 1, 2, 3 (most aggressive)
        frame_duration_ms: 10, 20, or 30 ms (required by webrtcvad)
        sample_rate: 8000, 16000, 32000, or 48000 Hz
        """
        self.vad = webrtcvad.Vad(mode)
        self.sample_rate = sample_rate
        self.frame_duration_ms = frame_duration_ms
        self.frame_size = int(sample_rate * (frame_duration_ms / 1000.0))  # 480 samples for 30ms @ 16kHz

    def is_speech_chunk(self, audio_data: np.ndarray, speech_ratio_threshold: float = 0.20, min_rms_threshold: float = 0.005) -> bool:
        """
        Analyzes a float32 numpy audio array (normalized -1.0 to 1.0) at 16kHz.
        Returns True if voice activity is detected above speech_ratio_threshold.
        """
        if len(audio_data) == 0:
            return False

        # 1. Quick Energy / RMS Gate
        rms = np.sqrt(np.mean(audio_data ** 2))
        if rms < min_rms_threshold:
            return False

        # Convert float32 [-1.0, 1.0] to 16-bit signed PCM bytes
        pcm16 = (np.clip(audio_data, -1.0, 1.0) * 32767).astype(np.int16)
        raw_bytes = pcm16.tobytes()

        # Split into frame_size slices (each slice is frame_size * 2 bytes)
        frame_bytes_len = self.frame_size * 2
        total_frames = len(raw_bytes) // frame_bytes_len
        if total_frames == 0:
            return False

        speech_frames = 0
        for i in range(total_frames):
            frame = raw_bytes[i * frame_bytes_len : (i + 1) * frame_bytes_len]
            try:
                if self.vad.is_speech(frame, self.sample_rate):
                    speech_frames += 1
            except Exception as e:
                logger.debug(f"VAD frame check error: {e}")
                continue

        speech_ratio = speech_frames / total_frames
        return speech_ratio >= speech_ratio_threshold


vad_detector = VoiceActivityDetector()
