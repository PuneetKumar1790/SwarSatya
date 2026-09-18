"""Prosody & Behavioral Analysis Module (SwarSatya Layer 2).

Extracts speech rhythm, pitch contours, pause patterns, and microvariations:
1. Pitch (F0) tracking & pitch contour variance (TTS engines exhibit reduced pitch dynamics)
2. Speech rhythm & speaking rate consistency
3. Pause-duration and cadence regularity (robotic pacing vs organic conversational pauses)
4. Prosodic anomaly score (0.0 to 100.0) with explainable flags
"""
import logging
import numpy as np
import librosa

logger = logging.getLogger("swarsatya.prosody")


class ProsodyAnalyzer:
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate

    def analyze(self, audio_chunk: np.ndarray) -> dict:
        """
        Analyzes prosodic dynamics of a 16kHz float32 audio chunk.
        Returns:
            {
                "prosody_risk": float (0-100),
                "pitch_mean_hz": float,
                "pitch_std_hz": float,
                "pause_ratio": float,
                "rhythm_regularity": float,
                "prosody_flags": list[str]
            }
        """
        if len(audio_chunk) < 8000:
            return {
                "prosody_risk": 0.0,
                "pitch_mean_hz": 0.0,
                "pitch_std_hz": 0.0,
                "pause_ratio": 0.0,
                "rhythm_regularity": 0.0,
                "prosody_flags": []
            }

        try:
            if audio_chunk.dtype != np.float32:
                audio_chunk = audio_chunk.astype(np.float32)

            flags = []
            risk_score = 0.0

            # 1. Fundamental Frequency (F0) via fast YIN algorithm
            # Human speech pitch typically lies between 65 Hz and 400 Hz
            fmin = 65.0
            fmax = 400.0
            hop_length = 512

            # Downsample slightly or use fast YIN for low latency
            f0 = librosa.yin(audio_chunk, fmin=fmin, fmax=fmax, sr=self.sample_rate, hop_length=hop_length)

            # Filter valid voiced frames (YIN outputs NaN or out-of-range for unvoiced)
            voiced = f0[np.isfinite(f0) & (f0 >= fmin) & (f0 <= fmax)]

            if len(voiced) > 10:
                pitch_mean = float(np.mean(voiced))
                pitch_std = float(np.std(voiced))

                # Human conversational speech typically has pitch std > 20-30Hz
                # Neural TTS often has artificially constrained pitch variation (std < 14Hz)
                if pitch_std < 14.0:
                    flags.append("Unnatural pitch flatness (low dynamic range)")
                    risk_score += 35.0
                elif pitch_std < 22.0:
                    flags.append("Constrained pitch variation")
                    risk_score += 15.0

                # Check for unnatural pitch jumps (vocoder glitching)
                pitch_diffs = np.abs(np.diff(voiced))
                jump_ratio = float(np.mean(pitch_diffs > 80.0))
                if jump_ratio > 0.15:
                    flags.append("Abrupt pitch discontinuity / Glitch artifact")
                    risk_score += 25.0
            else:
                pitch_mean = 0.0
                pitch_std = 0.0

            # 2. Pause and Energy Rhythm Analysis
            frame_length = 512
            energy = librosa.feature.rms(y=audio_chunk, frame_length=frame_length, hop_length=hop_length)[0]
            max_energy = np.max(energy) if len(energy) > 0 else 1e-6
            norm_energy = energy / max_energy if max_energy > 0 else energy

            # Silent / pause frames: energy < 10% peak
            silent_frames = np.sum(norm_energy < 0.10)
            total_frames = len(norm_energy)
            pause_ratio = float(silent_frames / total_frames) if total_frames > 0 else 0.0

            # Natural human speech has pause ratios between 15% and 45% in active turns
            if pause_ratio < 0.04:
                flags.append("Absence of natural breathing pauses (continuous speech)")
                risk_score += 25.0
            elif pause_ratio > 0.65:
                flags.append("Fragmented pause distribution")
                risk_score += 15.0

            # 3. Rhythm Regularity (onset envelope periodicity)
            onset_env = librosa.onset.onset_strength(y=audio_chunk, sr=self.sample_rate, hop_length=hop_length)
            onset_std = float(np.std(onset_env)) if len(onset_env) > 0 else 0.0
            
            # Very low onset variance denotes robotic, metronomic cadence
            if onset_std < 0.8:
                flags.append("Rigid, metronomic speaking rhythm")
                risk_score += 20.0

            final_prosody_risk = min(100.0, max(0.0, round(risk_score, 1)))

            return {
                "prosody_risk": final_prosody_risk,
                "pitch_mean_hz": round(pitch_mean, 1),
                "pitch_std_hz": round(pitch_std, 1),
                "pause_ratio": round(pause_ratio * 100, 1),
                "rhythm_regularity": round(onset_std, 2),
                "prosody_flags": flags
            }

        except Exception as e:
            logger.error(f"Error in prosody analysis: {e}")
            return {
                "prosody_risk": 0.0,
                "pitch_mean_hz": 0.0,
                "pitch_std_hz": 0.0,
                "pause_ratio": 0.0,
                "rhythm_regularity": 0.0,
                "prosody_flags": []
            }


prosody_analyzer = ProsodyAnalyzer()
