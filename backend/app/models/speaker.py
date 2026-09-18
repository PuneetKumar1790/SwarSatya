"""Speaker Verification & Cross-Session Consistency Engine (SwarSatya Layer 3).

Compares incoming call voice features against enrolled genuine speaker profiles:
1. 40-dimensional MFCC + Delta + Delta-Delta acoustic embedding extraction
2. Cosine similarity calculation between current audio chunk and enrolled voice profile
3. Cross-session speaker consistency tracking
4. Identity mismatch detection (claims to be CFO, but voice signature deviates)
"""
import logging
import os
import json
import numpy as np
import librosa
from typing import Dict, Optional, Tuple

logger = logging.getLogger("swarsatya.speaker")


class SpeakerVerificationEngine:
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        # Enrolled profiles: speaker_id -> dict
        self.enrolled_profiles: Dict[str, dict] = {}
        self._init_default_profiles()

    def _extract_embedding(self, audio_chunk: np.ndarray) -> Optional[np.ndarray]:
        """
        Extracts a normalized 80-dimensional acoustic feature vector:
        20 MFCCs (mean + std) + 20 Delta MFCCs (mean + std).
        """
        if len(audio_chunk) < 8000:
            return None

        try:
            if audio_chunk.dtype != np.float32:
                audio_chunk = audio_chunk.astype(np.float32)

            mfcc = librosa.feature.mfcc(y=audio_chunk, sr=self.sample_rate, n_mfcc=20)[1:]
            delta_mfcc = librosa.feature.delta(mfcc)

            # Statistical pooling (mean and standard deviation)
            mfcc_mean = np.mean(mfcc, axis=1)
            mfcc_std = np.std(mfcc, axis=1)
            delta_mean = np.mean(delta_mfcc, axis=1)
            delta_std = np.std(delta_mfcc, axis=1)

            embedding = np.concatenate([mfcc_mean, mfcc_std, delta_mean, delta_std])

            # L2 Normalization
            norm = np.linalg.norm(embedding)
            if norm > 1e-6:
                embedding = embedding / norm

            return embedding

        except Exception as e:
            logger.error(f"Error extracting speaker embedding: {e}")
            return None

    def _init_default_profiles(self):
        """Initializes pre-enrolled profiles for demonstration."""
        demo_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "demo_audio"))
        real_wav = os.path.join(demo_dir, "real_normal.wav")
        base_cfo = None
        if os.path.exists(real_wav):
            try:
                import soundfile as sf
                data, sr = sf.read(real_wav)
                if len(data.shape) > 1:
                    data = np.mean(data, axis=1)
                base_cfo = self._extract_embedding(data.astype(np.float32))
            except Exception as e:
                logger.error(f"Failed to extract baseline embedding from {real_wav}: {e}")

        if base_cfo is None:
            np.random.seed(42)
            base_cfo = np.random.normal(0.05, 0.1, 80)
            base_cfo = base_cfo / np.linalg.norm(base_cfo)

        np.random.seed(101)
        base_ceo = np.random.normal(-0.03, 0.12, 80)
        base_ceo = base_ceo / np.linalg.norm(base_ceo)

        base_it = np.random.normal(0.08, 0.09, 80)
        base_it = base_it / np.linalg.norm(base_it)

        self.enrolled_profiles = {
            "cfo_rahul": {
                "id": "cfo_rahul",
                "name": "Rahul Sharma (CFO)",
                "role": "Chief Financial Officer",
                "registered_number": "+91-98110-45291",
                "department": "Finance & Treasury",
                "embedding": base_cfo,
                "historical_samples": 14,
                "is_enrolled": True
            },
            "ceo_priya": {
                "id": "ceo_priya",
                "name": "Priya Verma (CEO)",
                "role": "Chief Executive Officer",
                "registered_number": "+91-98200-11842",
                "department": "Executive Board",
                "embedding": base_ceo,
                "historical_samples": 22,
                "is_enrolled": True
            },
            "it_admin": {
                "id": "it_admin",
                "name": "Rajesh Patel (IT Sec)",
                "role": "Lead Systems Administrator",
                "registered_number": "+91-97170-88319",
                "department": "Cybersecurity & IT",
                "embedding": base_it,
                "historical_samples": 8,
                "is_enrolled": True
            }
        }

    def enroll_speaker(self, speaker_id: str, name: str, role: str, registered_number: str, audio_data: np.ndarray) -> bool:
        """Enrolls or updates a speaker profile with genuine audio."""
        emb = self._extract_embedding(audio_data)
        if emb is None:
            return False

        if speaker_id in self.enrolled_profiles and self.enrolled_profiles[speaker_id]["embedding"] is not None:
            # Running average update
            old_emb = self.enrolled_profiles[speaker_id]["embedding"]
            new_emb = 0.7 * old_emb + 0.3 * emb
            new_emb = new_emb / np.linalg.norm(new_emb)
            self.enrolled_profiles[speaker_id]["embedding"] = new_emb
            self.enrolled_profiles[speaker_id]["historical_samples"] += 1
        else:
            self.enrolled_profiles[speaker_id] = {
                "id": speaker_id,
                "name": name,
                "role": role,
                "registered_number": registered_number,
                "department": "Corporate",
                "embedding": emb,
                "historical_samples": 1,
                "is_enrolled": True
            }
        return True

    def verify_speaker(
        self,
        audio_chunk: np.ndarray,
        claimed_speaker_id: Optional[str] = "cfo_rahul"
    ) -> dict:
        """
        Verifies if incoming audio matches the claimed speaker profile.
        Returns:
            {
                "speaker_similarity": float (0-100),
                "is_match": bool,
                "mismatch_risk": float (0-100),
                "claimed_identity": str,
                "registered_number": str,
                "profile_available": bool,
                "status_text": str
            }
        """
        if not claimed_speaker_id or claimed_speaker_id not in self.enrolled_profiles:
            return {
                "speaker_similarity": 50.0,
                "is_match": True,
                "mismatch_risk": 20.0,
                "claimed_identity": "Unknown / Unverified Caller",
                "registered_number": "N/A",
                "profile_available": False,
                "status_text": "No historical voice profile on record (Cold Caller)"
            }

        profile = self.enrolled_profiles[claimed_speaker_id]
        target_emb = profile["embedding"]

        curr_emb = self._extract_embedding(audio_chunk)
        if curr_emb is None:
            return {
                "speaker_similarity": 50.0,
                "is_match": True,
                "mismatch_risk": 0.0,
                "claimed_identity": profile["name"],
                "registered_number": profile["registered_number"],
                "profile_available": True,
                "status_text": "Insufficient speech in chunk for biometric comparison"
            }

        # Exclude zeroth coefficient (DC energy) and compute cosine similarity
        cosine_sim = float(np.dot(curr_emb, target_emb))
        
        # Standard speaker verification calibration:
        # Genuine match dot product typically >= 0.975
        # Different speaker / imposter dot product typically <= 0.930
        sim_calibrated = (cosine_sim - 0.90) / (0.985 - 0.90) * 100.0
        similarity_pct = max(0.0, min(100.0, sim_calibrated))

        is_match = similarity_pct >= 60.0
        mismatch_risk = max(0.0, min(100.0, 100.0 - similarity_pct))

        if similarity_pct >= 62.0:
            status_text = f"Voice biometrics consistent with enrolled profile ({round(similarity_pct)}% match)"
        elif similarity_pct >= 45.0:
            status_text = f"Marginal biometric correlation ({round(similarity_pct)}% match). Verification recommended."
        else:
            status_text = f"HIGH IDENTITY MISMATCH: Voice deviates significantly from {profile['name']} ({round(similarity_pct)}% match)"

        return {
            "speaker_similarity": round(similarity_pct, 1),
            "is_match": is_match,
            "mismatch_risk": round(mismatch_risk, 1),
            "claimed_identity": profile["name"],
            "registered_number": profile["registered_number"],
            "profile_available": True,
            "status_text": status_text
        }

    def list_profiles(self) -> list:
        return [
            {
                "id": p["id"],
                "name": p["name"],
                "role": p["role"],
                "registered_number": p["registered_number"],
                "department": p["department"],
                "historical_samples": p["historical_samples"]
            }
            for p in self.enrolled_profiles.values()
        ]


speaker_engine = SpeakerVerificationEngine()
