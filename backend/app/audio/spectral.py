"""Acoustic & Spectral Analysis Module (SwarSatya Layer 1).

Extracts frequency-domain and phase-related signatures from 16kHz audio:
1. Spectral Rolloff & High-Frequency cutoff anomalies (common in neural vocoders like HiFi-GAN)
2. STFT Phase Irregularity / Phase Derivative Variance (deepfake vocoder phase dispersion)
3. Spectral Flatness & Zero-Crossing Rate Variance (distinguishes robotic buzz from organic resonance)
4. Synthesis artifact probability score (0.0 to 100.0) with explainable tags
"""
import logging
import numpy as np
import librosa

logger = logging.getLogger("swarsatya.spectral")


class SpectralAnalyzer:
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate

    def analyze(self, audio_chunk: np.ndarray) -> dict:
        """
        Performs spectral & phase analysis on a 16kHz float32 audio chunk.
        Returns:
            {
                "spectral_risk": float (0-100),
                "phase_irregularity": float (0-100),
                "rolloff_ratio": float,
                "flatness_score": float,
                "artifacts_detected": list[str]
            }
        """
        if len(audio_chunk) < 4000:
            return {
                "spectral_risk": 0.0,
                "phase_irregularity": 0.0,
                "rolloff_ratio": 0.0,
                "flatness_score": 0.0,
                "artifacts_detected": []
            }

        try:
            # Ensure float32
            if audio_chunk.dtype != np.float32:
                audio_chunk = audio_chunk.astype(np.float32)

            artifacts = []
            risk_score = 0.0

            # 1. Short-Time Fourier Transform (STFT) for magnitude and phase
            n_fft = 1024
            hop_length = 256
            stft = librosa.stft(audio_chunk, n_fft=n_fft, hop_length=hop_length)
            magnitude, phase = librosa.magphase(stft)

            # Phase derivative variance across frequency bins
            # Natural human voice has coherent phase progression; vocoders introduce phase dispersion
            phase_angles = np.angle(stft)
            phase_diff = np.diff(phase_angles, axis=1)
            phase_dispersion = float(np.var(phase_diff))
            phase_risk = min(100.0, max(0.0, (phase_dispersion - 1.2) * 50.0))
            if phase_dispersion > 2.2:
                artifacts.append("Phase angle discontinuity / Vocoder dispersion")
                risk_score += 25.0

            # 2. Spectral Rolloff (85% energy cutoff frequency)
            # Cloned voices often cut off sharply above 7000-7500Hz or have unnatural high-band droop
            rolloff = librosa.feature.spectral_rolloff(
                y=audio_chunk, sr=self.sample_rate, roll_percent=0.85
            )
            mean_rolloff = float(np.mean(rolloff))
            if mean_rolloff < 2800.0 or mean_rolloff > 7400.0:
                artifacts.append("High-frequency spectral attenuation anomaly")
                risk_score += 20.0

            # 3. Spectral Flatness (measure of noisiness vs tonality)
            # High flatness in voiced segments flags robotic vocoder buzz
            flatness = librosa.feature.spectral_flatness(y=audio_chunk)
            mean_flatness = float(np.mean(flatness))
            if mean_flatness > 0.035:
                artifacts.append("Unnatural spectral flatness / synthetic buzz")
                risk_score += 20.0

            # 4. Spectral Flux / Centroid Variance
            centroid = librosa.feature.spectral_centroid(y=audio_chunk, sr=self.sample_rate)
            centroid_std = float(np.std(centroid))
            if centroid_std < 180.0:
                artifacts.append("Static spectral envelope (low vocal tract variation)")
                risk_score += 20.0

            # 5. Zero-Crossing Rate consistency
            zcr = librosa.feature.zero_crossing_rate(audio_chunk)
            zcr_std = float(np.std(zcr))
            if zcr_std < 0.015:
                artifacts.append("Reduced micro-transient variation")
                risk_score += 15.0

            final_spectral_risk = min(100.0, max(0.0, round(risk_score, 1)))

            return {
                "spectral_risk": final_spectral_risk,
                "phase_irregularity": round(phase_risk, 1),
                "rolloff_ratio": round(mean_rolloff, 1),
                "flatness_score": round(mean_flatness * 1000, 2),
                "artifacts_detected": artifacts
            }

        except Exception as e:
            logger.error(f"Error in spectral analysis: {e}")
            return {
                "spectral_risk": 0.0,
                "phase_irregularity": 0.0,
                "rolloff_ratio": 0.0,
                "flatness_score": 0.0,
                "artifacts_detected": []
            }


spectral_analyzer = SpectralAnalyzer()
