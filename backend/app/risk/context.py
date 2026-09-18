"""Contextual Risk & Social Engineering Enrichment Engine (SwarSatya Layer 4).

Combines call origin, transaction stakes, and fraud intelligence:
1. Caller Origin & Number Registry verification (Registered Corporate Number vs Unknown/VoIP/Spoofed)
2. Transaction Context (High-value fund transfer vs low-risk informational query)
3. Historical Fraud Signals & Incident Intelligence
4. Computes Contextual Risk Score (0.0 to 100.0) with granular risk factor explanations
"""
import logging
from typing import Dict, List, Optional

logger = logging.getLogger("swarsatya.context")

# Known fraudulent/suspicious caller signatures or test numbers
KNOWN_FRAUD_REGISTRY = {
    "+91-91234-56789": "Flagged in 3 previous phishing reports (Delhi Cybercell database)",
    "+91-98765-43210": "Suspected virtual VoIP gateway / high spoofing risk",
    "+91-88888-99999": "Reported extortion pattern targeting banking executives"
}


class ContextRiskEngine:
    def __init__(self):
        self.corporate_directory = {
            "cfo_rahul": "+91-98110-45291",
            "ceo_priya": "+91-98200-11842",
            "it_admin": "+91-97170-88319"
        }

    def evaluate_context(
        self,
        caller_number: str = "+91-91234-56789",
        claimed_identity_id: str = "cfo_rahul",
        transaction_amount: float = 2500000.0,
        action_type: str = "Urgent Fund Transfer",
        historical_flag: bool = True
    ) -> dict:
        """
        Evaluates context metadata and returns contextual risk (0-100).
        """
        risk = 0.0
        factors = []

        # 1. Number Origin Check
        expected_number = self.corporate_directory.get(claimed_identity_id)
        if expected_number:
            if caller_number != expected_number:
                risk += 35.0
                factors.append(
                    f"CALL ORIGIN MISMATCH: Caller ID ({caller_number}) does not match registered corporate number ({expected_number})"
                )
            else:
                factors.append("Call origin matches verified corporate registered directory")
        else:
            risk += 15.0
            factors.append("Caller not registered in corporate directory (External / Unknown source)")

        # 2. Historical Fraud Database Lookup
        if caller_number in KNOWN_FRAUD_REGISTRY or historical_flag:
            risk += 25.0
            reason = KNOWN_FRAUD_REGISTRY.get(caller_number, "Previous flagged imposter attempts on this line")
            factors.append(f"REPUTATION ALERT: {reason}")

        # 3. Transaction Stakes & Amount Scaling
        # < ₹50,000 : Low stakes
        # ₹50,000 - ₹5,00,000 : Moderate stakes
        # > ₹5,00,000 : High stakes
        # > ₹20,00,000 : Critical corporate exposure
        if transaction_amount > 2000000.0:
            risk += 30.0
            factors.append(f"HIGH-VALUE EXPOSURE: Requested transfer of ₹{transaction_amount:,.0f} exceeds critical authorization limit")
        elif transaction_amount > 500000.0:
            risk += 20.0
            factors.append(f"ELEVATED TRANSACTION: Transfer of ₹{transaction_amount:,.0f} requires executive two-person rule")
        elif transaction_amount > 50000.0:
            risk += 10.0
            factors.append(f"Standard financial transfer (₹{transaction_amount:,.0f})")

        # 4. Action Type Weighting
        urgent_keywords = ["urgent", "emergency", "immediate", "secret", "extortion"]
        if any(w in action_type.lower() for w in urgent_keywords):
            risk += 15.0
            factors.append(f"HIGH-RISK WORKFLOW: '{action_type}' triggered outside scheduled payroll/clearing window")

        final_context_risk = max(0.0, min(100.0, round(risk, 1)))

        return {
            "context_risk": final_context_risk,
            "caller_number": caller_number,
            "expected_number": expected_number or "N/A",
            "is_registered_line": (caller_number == expected_number) if expected_number else False,
            "transaction_amount": transaction_amount,
            "action_type": action_type,
            "contributing_factors": factors
        }


context_engine = ContextRiskEngine()
