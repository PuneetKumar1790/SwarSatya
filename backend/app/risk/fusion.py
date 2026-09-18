"""Unified Dynamic Risk Fusion & Policy Engine (SwarSatya Layer 5).

Fuses 4 core detection dimensions:
1. Voice Authenticity Risk (Wav2Vec2 Deepfake Model + Spectral/Phase Artifacts)
2. Prosodic / Behavioral Anomaly Risk (Pitch Dynamics + Pause/Cadence Jitter)
3. Speaker Identity Mismatch Risk (Biometric Distance from Enrolled Profile)
4. Contextual & Social Engineering Risk (Caller Origin + Transaction Stakes + Fraud History)
5. Conversational Scam Signal Risk (ASR Transcripts + Extortion Patterns)

Supports configurable enterprise risk policies with automated pre-transaction actions.
"""
from typing import Dict, List, Tuple, Any

# Policy Profile Definitions
POLICY_PROFILES = {
    "standard_call": {
        "id": "standard_call",
        "name": "Standard Communication",
        "description": "Routine corporate voice communication.",
        "thresholds": {"caution": 45.0, "high": 70.0, "critical": 85.0},
        "default_action": "MONITOR"
    },
    "high_value_transfer": {
        "id": "high_value_transfer",
        "name": "High-Value Financial Transfer (₹ > 5,00,000)",
        "description": "Sensitive treasury/vendor disbursement requiring pre-action verification.",
        "thresholds": {"caution": 35.0, "high": 60.0, "critical": 75.0},
        "default_action": "REQUIRE_SECONDARY_VERIFICATION"
    },
    "privileged_access": {
        "id": "privileged_access",
        "name": "Privileged Executive Authorization",
        "description": "Board-level approvals, credentials, or emergency overrides.",
        "thresholds": {"caution": 30.0, "high": 55.0, "critical": 70.0},
        "default_action": "MANDATORY_CALLBACK"
    }
}

DEFAULT_WEIGHTS = {
    "synthetic": 0.30,
    "spectral": 0.15,
    "prosody": 0.15,
    "speaker_mismatch": 0.20,
    "context": 0.10,
    "scam_rules": 0.10
}


class UnifiedRiskFusionEngine:
    def __init__(self, active_policy_id: str = "high_value_transfer"):
        self.active_policy_id = active_policy_id
        self.weights = dict(DEFAULT_WEIGHTS)
        self.policies = dict(POLICY_PROFILES)

    def set_policy(self, policy_id: str, custom_thresholds: Dict[str, float] = None):
        """Updates active security policy and optional custom thresholds."""
        if policy_id in self.policies:
            self.active_policy_id = policy_id
            if custom_thresholds:
                self.policies[policy_id]["thresholds"].update(custom_thresholds)

    def set_weights(self, new_weights: Dict[str, float]):
        """Adjusts fusion weights (normalized)."""
        self.weights.update(new_weights)
        total = sum(self.weights.values())
        if total > 0:
            for k in self.weights:
                self.weights[k] /= total

    def fuse(
        self,
        synthetic_risk: float,
        spectral_risk: float,
        prosody_risk: float,
        speaker_mismatch_risk: float,
        context_risk: float,
        scam_risk: float
    ) -> Dict[str, Any]:
        """
        Computes the unified dynamic impersonation risk score and determines
        the threat tier and required security response.
        """
        w = self.weights

        # Multi-layer weighted fusion
        fused_score = (
            w["synthetic"] * synthetic_risk +
            w["spectral"] * spectral_risk +
            w["prosody"] * prosody_risk +
            w["speaker_mismatch"] * speaker_mismatch_risk +
            w["context"] * context_risk +
            w["scam_rules"] * scam_risk
        )

        # Non-linear amplifier: If multiple severe anomalies co-occur, apply critical surge
        critical_count = sum([
            synthetic_risk > 70.0,
            speaker_mismatch_risk > 60.0,
            context_risk > 60.0,
            scam_risk > 65.0
        ])
        if critical_count >= 2:
            fused_score = min(100.0, fused_score * 1.18 + 5.0)

        fused_score = max(0.0, min(100.0, round(fused_score, 1)))

        # Determine Tier based on active policy
        policy = self.policies.get(self.active_policy_id, self.policies["high_value_transfer"])
        th = policy["thresholds"]

        if fused_score < th["caution"]:
            tier = "LOW"
            recommended_action = "ALLOW: Normal voice metrics. No impersonation detected."
            action_code = "ALLOW"
            requires_hold = False
        elif fused_score < th["high"]:
            tier = "CAUTION"
            recommended_action = "MONITOR: Subtle voice anomalies or unverified line. Maintain heightened caution."
            action_code = "WARN"
            requires_hold = False
        elif fused_score < th["critical"]:
            tier = "HIGH"
            recommended_action = "HOLD TRANSACTION: Voice & identity divergence exceeds safe threshold. Mandatory secondary verification required."
            action_code = "HOLD_AND_VERIFY"
            requires_hold = True
        else:
            tier = "CRITICAL"
            recommended_action = "CRITICAL BLOCK: High-probability synthetic impersonation combined with high-value financial extortion. Intercept transaction immediately."
            action_code = "BLOCK_AND_ESCALATE"
            requires_hold = True

        # Explainability summary
        contributing_factors = []
        if synthetic_risk > 50.0:
            contributing_factors.append(f"Wav2Vec2 Synthetic Speech Detector ({synthetic_risk:.0f}%)")
        if spectral_risk > 40.0:
            contributing_factors.append(f"Spectral & Phase Inconsistency ({spectral_risk:.0f}%)")
        if prosody_risk > 40.0:
            contributing_factors.append(f"Unnatural Pitch/Rhythm Cadence ({prosody_risk:.0f}%)")
        if speaker_mismatch_risk > 40.0:
            contributing_factors.append(f"Biometric Voice Deviation from Enrolled Profile ({speaker_mismatch_risk:.0f}%)")
        if context_risk > 40.0:
            contributing_factors.append(f"Unregistered Caller Line or High Financial Stakes ({context_risk:.0f}%)")
        if scam_risk > 40.0:
            contributing_factors.append(f"Urgent Extortion / Credential Harvesting Triggers ({scam_risk:.0f}%)")

        return {
            "overall_risk": fused_score,
            "threat_tier": tier,
            "action_code": action_code,
            "recommended_action": recommended_action,
            "requires_hold": requires_hold,
            "active_policy": policy["name"],
            "contributing_factors": contributing_factors,
            "layer_breakdown": {
                "synthetic_model": round(synthetic_risk, 1),
                "spectral_phase": round(spectral_risk, 1),
                "prosody_behavior": round(prosody_risk, 1),
                "speaker_mismatch": round(speaker_mismatch_risk, 1),
                "context_stakes": round(context_risk, 1),
                "conversational_scam": round(scam_risk, 1)
            }
        }


risk_fusion_engine = UnifiedRiskFusionEngine()
