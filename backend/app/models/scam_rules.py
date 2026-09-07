"""Rule-based Scam Signal Detector (SwarSatya Phase 4).

Scans rolling transcripts for English, Hindi, and Hinglish scam indicators:
1. Financial: UPI, transfer, bank account, ₹, paisa bhejo, transfer kar do, khate mein
2. Urgency: immediately, urgently, abhi, jaldi, turant, right now, fast
3. Fear / Emergency: accident, police, arrest, jail, cbi, customs, problem mein hoon, fir
4. Credential requests: OTP, PIN, password, verification code, cvv, code batao
5. Isolation / Secrecy: kisi ko mat batana, don't tell anyone, keep this secret, phone mat kaatna

Implements a weighted scoring formula with cross-category synergy bonuses.
"""
import re
import logging
from typing import Dict, List, Tuple

logger = logging.getLogger("swarsatya.scam_rules")

SCAM_CATEGORIES: Dict[str, Dict] = {
    "credentials": {
        "weight": 35.0,
        "label": "Credential / OTP Request",
        "patterns": [
            r"\botp\b", r"\bpin\b", r"\bpassword\b", r"\bcvv\b",
            r"\bverification code\b", r"\bcode batao\b", r"\botp bhejo\b",
            r"\bsecurity code\b", r"\banydesk\b", r"\bteamviewer\b",
            r"\bscreen share\b", r"\bcard number\b", r"\bexpiry date\b"
        ]
    },
    "fear_emergency": {
        "weight": 30.0,
        "label": "Fear / Legal Authority Impersonation",
        "patterns": [
            r"\bpolice\b", r"\barrest\b", r"\bjail\b", r"\bwarrant\b",
            r"\bcbi\b", r"\bcrime branch\b", r"\bcustoms\b", r"\bparliament\b",
            r"\baccident\b", r"\bhospital\b", r"\bproblem mein hoon\b",
            r"\bkhatre mein\b", r"\bcase darj\b", r"\bfir\b", r"\bcourt order\b"
        ]
    },
    "financial": {
        "weight": 25.0,
        "label": "Financial / Fund Transfer Request",
        "patterns": [
            r"\btransfer\b", r"\bupi\b", r"\bbank account\b", r"\brupees\b",
            r"\brs\.?\s*\d+", r"₹\s*\d+", r"\bpaisa bhejo\b", r"\btransfer kar do\b",
            r"\bkhate mein\b", r"\bgpay\b", r"\bphonepe\b", r"\bpaytm\b",
            r"\bpayment\b", r"\bpenalty\b", r"\bchallan\b", r"\bprocessing fee\b"
        ]
    },
    "urgency": {
        "weight": 20.0,
        "label": "Artificial Urgency",
        "patterns": [
            r"\bimmediately\b", r"\burgently\b", r"\babhi\b", r"\bjaldi\b",
            r"\bturant\b", r"\bright now\b", r"\bfast\b", r"\bwithin \d+ minutes\b",
            r"\btime nahi hai\b", r"\bjaldi karo\b", r"\bemergency\b"
        ]
    },
    "secrecy_isolation": {
        "weight": 20.0,
        "label": "Secrecy & Psychological Isolation",
        "patterns": [
            r"\bkisi ko mat batana\b", r"\bdon't tell anyone\b", r"\bkeep this secret\b",
            r"\bphone mat kaatna\b", r"\bdon't disconnect\b", r"\bdon't hang up\b",
            r"\bshanti se suno\b", r"\bsecret\b", r"\bshh\b"
        ]
    }
}


class ScamSignalDetector:
    def __init__(self, decay_rate: float = 0.90):
        self.decay_rate = decay_rate
        self.compiled_categories = {}
        for cat, data in SCAM_CATEGORIES.items():
            self.compiled_categories[cat] = {
                "weight": data["weight"],
                "label": data["label"],
                "regexes": [re.compile(p, re.IGNORECASE) for p in data["patterns"]]
            }

    def evaluate_text(self, text: str, previous_scam_risk: float = 0.0) -> Tuple[float, List[str]]:
        """
        Evaluates text for scam indicators and updates scam risk (0-100).
        Returns (new_scam_risk, detected_pattern_labels).
        """
        if not text:
            decayed = previous_scam_risk * self.decay_rate
            return round(decayed, 2), []

        matched_categories = set()
        detected_details = []

        for cat, data in self.compiled_categories.items():
            for rgx in data["regexes"]:
                match = rgx.search(text)
                if match:
                    matched_categories.add(cat)
                    detected_details.append(f"{data['label']}: '{match.group()}'")
                    break  # Count category once per chunk

        # If no new patterns matched, apply decay
        if not matched_categories:
            decayed = previous_scam_risk * self.decay_rate
            return round(decayed, 2), []

        # Calculate base score from matched categories
        base_score = sum(self.compiled_categories[c]["weight"] for c in matched_categories)

        # Cross-category synergy bonuses
        synergy_bonus = 0.0
        if "fear_emergency" in matched_categories and "financial" in matched_categories:
            synergy_bonus += 15.0
        if "financial" in matched_categories and "credentials" in matched_categories:
            synergy_bonus += 20.0
        if "urgency" in matched_categories and "credentials" in matched_categories:
            synergy_bonus += 15.0
        if "secrecy_isolation" in matched_categories and len(matched_categories) >= 2:
            synergy_bonus += 15.0

        current_chunk_risk = base_score + synergy_bonus

        # Smooth update: current evidence blended with historical score
        new_risk = max(current_chunk_risk, previous_scam_risk * 0.85 + current_chunk_risk * 0.50)
        new_risk = max(0.0, min(100.0, new_risk))

        return round(new_risk, 2), detected_details


scam_detector = ScamSignalDetector()
