"""Contextual AI Copilot & Real-Time Scam Defense Prompter (SwarSatya).

Generates dynamic counter-interrogation scripts, automated legal rebuttals,
and victim protective guidance in response to detected scam transcripts.
"""
import re
from typing import Dict, List, Any


DEFENSE_RULES = [
    {
        "category": "digital_arrest",
        "keywords": [r"\bpolice\b", r"\barrest\b", r"\bcbi\b", r"\bcustoms\b", r"\bfir\b", r"\bwarrant\b", r"\bcourt\b"],
        "legal_basis": "MHA & Supreme Court Directive: Digital Arrest has NO legal standing. Police cannot arrest or try individuals over audio/video calls.",
        "scripts": [
            "Say: 'Under Section 35(3) of Bharatiya Nagarik Suraksha Sanhita (BNSS), police must serve a physical written summon. Send it to my registered address via post.'",
            "Ask: 'Please share your Investigating Officer (IO) badge number, Police Station CCTNS FIR number, and official @gov.in email address.'",
            "Say: 'I am immediately walking to my local police station to physically verify this FIR with the Station House Officer.'"
        ],
        "action": "Do NOT turn on video. Never transfer 'verification deposits'."
    },
    {
        "category": "courier_customs",
        "keywords": [r"\bcustoms\b", r"\bairport\b", r"\bparcel\b", r"\bdrugs\b", r"\bpassport\b", r"\bdetained\b"],
        "legal_basis": "Indian Customs & Postal authorities NEVER solicit penalty or clearance fees via private UPI, GPay, or individual bank accounts.",
        "scripts": [
            "Say: 'Indian Customs does not collect fines on personal bank accounts. Give me the official Customs Consignment Tracking Number (BE Number).'",
            "Say: 'I am lodging an inquiry directly with the Indian Customs Helpdesk (1800-11-2013).'"
        ],
        "action": "Do not pay any 'customs clearing charge' or 'penalty fee'."
    },
    {
        "category": "credential_harvesting",
        "keywords": [r"\botp\b", r"\bpin\b", r"\bpassword\b", r"\bcvv\b", r"\banydesk\b", r"\bteamviewer\b", r"\bscreen share\b"],
        "legal_basis": "RBI Master Direction on Customer Protection: Financial institutions never require OTP, PIN, or remote desktop software to unblock accounts.",
        "scripts": [
            "Say: 'RBI guidelines strictly prohibit disclosing OTP or installing remote screen sharing apps. I am hanging up.'",
            "Say: 'My bank account can be handled in person at my home branch. I will not share any numeric code.'"
        ],
        "action": "IMMEDIATELY terminate call if asked to download AnyDesk, RustDesk, or TeamViewer."
    },
    {
        "category": "extortion_urgency",
        "keywords": [r"\bimmediately\b", r"\bturant\b", r"\bjaldi\b", r"\bkisi ko mat batana\b", r"\bsecret\b", r"\bdon't disconnect\b", r"\bemergency\b"],
        "legal_basis": "Coercive psychological isolation tactic to prevent consulting family, legal counsel, or bank officers.",
        "scripts": [
            "Say: 'I am putting this call on speaker with my family and legal advocate present right now.'",
            "Say: 'No authorized financial or legal process requires immediate secretive wire transfers. I will verify first.'"
        ],
        "action": "Do not panic. Disconnect and call the National Cyber Crime Helpline (1930)."
    }
]


class ScamDefenseCopilot:
    def __init__(self):
        self.compiled_rules = []
        for r in DEFENSE_RULES:
            self.compiled_rules.append({
                "category": r["category"],
                "legal_basis": r["legal_basis"],
                "scripts": r["scripts"],
                "action": r["action"],
                "regexes": [re.compile(p, re.IGNORECASE) for p in r["keywords"]]
            })

    def generate_defense_guidance(self, transcript: str, detected_patterns: List[str] = None) -> Dict[str, Any]:
        """
        Analyzes rolling transcript and returns smart counter-responses, legal citations,
        and immediate defense prompts for the victim.
        """
        matched_categories = []
        suggested_scripts = []
        legal_advisories = []
        safety_actions = []

        text = transcript or ""

        for rule in self.compiled_rules:
            matched = False
            for rgx in rule["regexes"]:
                if rgx.search(text):
                    matched = True
                    break
            
            # Also check if pattern label contains rule category keywords
            if not matched and detected_patterns:
                for pat in detected_patterns:
                    for rgx in rule["regexes"]:
                        if rgx.search(pat):
                            matched = True
                            break
                    if matched:
                        break

            if matched:
                matched_categories.append(rule["category"])
                suggested_scripts.extend(rule["scripts"])
                legal_advisories.append(rule["legal_basis"])
                safety_actions.append(rule["action"])

        # Default fallback if no specific scam category triggered
        if not suggested_scripts:
            suggested_scripts = [
                "Ask: 'Could you please confirm this request through an official corporate email or registered number?'",
                "Say: 'I will call you back on your registered office extension after checking our standard operating procedure.'"
            ]
            legal_advisories = ["Always practice Zero-Trust verification before approving privileged or financial requests."]
            safety_actions = ["Verify caller through out-of-band secondary channel."]

        return {
            "matched_categories": matched_categories,
            "smart_counter_scripts": list(dict.fromkeys(suggested_scripts))[:4],
            "legal_citations": list(dict.fromkeys(legal_advisories))[:2],
            "recommended_safety_actions": list(dict.fromkeys(safety_actions))[:3],
            "cybercrime_helpline": "1930 (National Cyber Crime Reporting Helpline - 24x7 Toll-Free)",
            "cybercrime_portal": "https://cybercrime.gov.in"
        }


scam_copilot = ScamDefenseCopilot()
