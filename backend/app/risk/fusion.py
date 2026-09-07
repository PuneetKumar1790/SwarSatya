"""Risk Fusion Engine (SwarSatya Phase 5 stub / constants).

Fuses Synthetic Voice Risk and Scam Conversation Risk into an Overall Risk score.
Configurable weights and threat tier mappings.
"""
from typing import Dict, Tuple

# Configurable Risk Fusion Weights
DEFAULT_SYNTHETIC_WEIGHT = 0.50
DEFAULT_SCAM_WEIGHT = 0.40
DEFAULT_OTHER_WEIGHT = 0.10

# Threat Tier Definitions
TIER_LOW = "LOW"
TIER_CAUTION = "CAUTION"
TIER_HIGH = "HIGH"
TIER_CRITICAL = "CRITICAL"

RECOMMENDED_ACTIONS = {
    TIER_LOW: "Normal conversation. No threat detected.",
    TIER_CAUTION: "Exercise caution. Suspicious conversational patterns or audio artifacts detected.",
    TIER_HIGH: "High risk warning: Likely impersonation or financial fraud attempt. Do NOT share OTP, passwords, or initiate money transfers.",
    TIER_CRITICAL: "CRITICAL ALERT: High probability AI voice clone detected in conjunction with urgent financial extortion. Disconnect the call immediately and contact the person through a verified secondary channel."
}


class RiskFusionEngine:
    def __init__(
        self,
        synthetic_weight: float = DEFAULT_SYNTHETIC_WEIGHT,
        scam_weight: float = DEFAULT_SCAM_WEIGHT,
        other_weight: float = DEFAULT_OTHER_WEIGHT
    ):
        self.synthetic_weight = synthetic_weight
        self.scam_weight = scam_weight
        self.other_weight = other_weight

    def fuse(
        self,
        synthetic_risk: float,
        scam_risk: float,
        other_signals: float = 0.0
    ) -> Tuple[float, str, str]:
        """Calculates Overall Risk (0-100), threat tier, and recommended action."""
        overall = (
            self.synthetic_weight * synthetic_risk +
            self.scam_weight * scam_risk +
            self.other_weight * other_signals
        )
        overall = max(0.0, min(100.0, overall))

        if overall < 30.0:
            tier = TIER_LOW
        elif overall < 60.0:
            tier = TIER_CAUTION
        elif overall < 85.0:
            tier = TIER_HIGH
        else:
            tier = TIER_CRITICAL

        action = RECOMMENDED_ACTIONS[tier]
        return round(overall, 2), tier, action


# Default instance
risk_fusion_engine = RiskFusionEngine()
