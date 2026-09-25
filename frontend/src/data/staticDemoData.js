export const STATIC_DEMO_SCENARIOS = {
  real_normal: {
    caller_number: "+91-98110-45291",
    claimed_identity: "Rahul Sharma (CFO)",
    transaction_amount: 0,
    steps: [
      {
        timeMs: 1200,
        text: "नमस्ते, मैं राहुल शर्मा बोल रहा हूँ।",
        overall_risk: 4,
        threat_tier: "LOW",
        action_code: "ALLOW",
        recommended_action: "Normal conversation. Verified executive voiceprint. No threat detected.",
        requires_hold: false,
        transaction_held: false,
        synthetic_risk: 2.1,
        spectral_risk: 8.4,
        prosody_risk: 3.5,
        speaker_similarity: 96,
        scam_risk: 0,
        context_risk: 5,
        patterns: [],
        telemetry: {
          spectral: { spectral_risk: 8.4, rolloff_ratio: 3850, artifacts_detected: [] },
          prosody: { prosody_risk: 3.5, pitch_std_hz: 34.2, pause_ratio: 28.5, prosody_flags: [] },
          speaker: { claimed_identity: "Rahul Sharma (CFO)", similarity_pct: 96, status: "VERIFIED_BIOMETRIC_MATCH" }
        }
      },
      {
        timeMs: 5500,
        text: "कल सुबह की मीटिंग के लिए प्रेजेंटेशन और प्रोजेक्ट स्लाइड्स तैयार हैं।",
        overall_risk: 5,
        threat_tier: "LOW",
        action_code: "ALLOW",
        recommended_action: "Normal conversation. Verified executive voiceprint. No threat detected.",
        requires_hold: false,
        transaction_held: false,
        synthetic_risk: 2.4,
        spectral_risk: 9.1,
        prosody_risk: 4.2,
        speaker_similarity: 95,
        scam_risk: 0,
        context_risk: 5,
        patterns: [],
        telemetry: {
          spectral: { spectral_risk: 9.1, rolloff_ratio: 3910, artifacts_detected: [] },
          prosody: { prosody_risk: 4.2, pitch_std_hz: 35.8, pause_ratio: 29.1, prosody_flags: [] },
          speaker: { claimed_identity: "Rahul Sharma (CFO)", similarity_pct: 95, status: "VERIFIED_BIOMETRIC_MATCH" }
        }
      },
      {
        timeMs: 11000,
        text: "कृपया अपना लैपटॉप साथ ले आइएगा, हम नए प्रोजेक्ट पर चर्चा करेंगे।",
        overall_risk: 6,
        threat_tier: "LOW",
        action_code: "ALLOW",
        recommended_action: "Normal conversation. Verified executive voiceprint. Zero false alerts.",
        requires_hold: false,
        transaction_held: false,
        synthetic_risk: 2.6,
        spectral_risk: 8.7,
        prosody_risk: 4.0,
        speaker_similarity: 95,
        scam_risk: 0,
        context_risk: 5,
        patterns: [],
        telemetry: {
          spectral: { spectral_risk: 8.7, rolloff_ratio: 3880, artifacts_detected: [] },
          prosody: { prosody_risk: 4.0, pitch_std_hz: 36.1, pause_ratio: 31.0, prosody_flags: [] },
          speaker: { claimed_identity: "Rahul Sharma (CFO)", similarity_pct: 95, status: "VERIFIED_BIOMETRIC_MATCH" }
        }
      }
    ]
  },

  cloned_normal: {
    caller_number: "+91-91234-56789",
    claimed_identity: "Rahul Sharma (CFO)",
    transaction_amount: 50000,
    steps: [
      {
        timeMs: 1200,
        text: "नमस्ते, मैं राहुल शर्मा बोल रहा हूँ।",
        overall_risk: 48,
        threat_tier: "CAUTION",
        action_code: "STEP_UP_VERIFY",
        recommended_action: "MONITOR: Subtle voice anomalies or unverified line. Maintain heightened caution.",
        requires_hold: false,
        transaction_held: false,
        synthetic_risk: 92.5,
        spectral_risk: 78.4,
        prosody_risk: 68.2,
        speaker_similarity: 82,
        scam_risk: 0,
        context_risk: 35,
        patterns: [],
        telemetry: {
          spectral: { spectral_risk: 78.4, rolloff_ratio: 2840, artifacts_detected: ["Phase angle discontinuity / Vocoder dispersion"] },
          prosody: { prosody_risk: 68.2, pitch_std_hz: 11.2, pause_ratio: 8.4, prosody_flags: ["Unnatural pitch flatness (low dynamic range)", "Constrained pitch cadence"] },
          speaker: { claimed_identity: "Rahul Sharma (CFO)", similarity_pct: 82, status: "QUESTIONABLE_MATCH" }
        }
      },
      {
        timeMs: 5500,
        text: "कल सुबह की मीटिंग के लिए प्रेजेंटेशन और प्रोजेक्ट स्लाइड्स तैयार हैं।",
        overall_risk: 56,
        threat_tier: "CAUTION",
        action_code: "STEP_UP_VERIFY",
        recommended_action: "MONITOR: High synthetic acoustic anomaly detected, but zero conversational scam patterns.",
        requires_hold: false,
        transaction_held: false,
        synthetic_risk: 95.1,
        spectral_risk: 81.2,
        prosody_risk: 72.0,
        speaker_similarity: 80,
        scam_risk: 0,
        context_risk: 35,
        patterns: [],
        telemetry: {
          spectral: { spectral_risk: 81.2, rolloff_ratio: 2790, artifacts_detected: ["Phase angle discontinuity / Vocoder dispersion", "Comb filter framing artifact"] },
          prosody: { prosody_risk: 72.0, pitch_std_hz: 10.8, pause_ratio: 7.9, prosody_flags: ["Unnatural pitch flatness (low dynamic range)", "Constrained pitch cadence"] },
          speaker: { claimed_identity: "Rahul Sharma (CFO)", similarity_pct: 80, status: "QUESTIONABLE_MATCH" }
        }
      },
      {
        timeMs: 11000,
        text: "कृपया अपना लैपटॉप साथ ले आइएगा, हम नए प्रोजेक्ट पर चर्चा करेंगे।",
        overall_risk: 58,
        threat_tier: "CAUTION",
        action_code: "STEP_UP_VERIFY",
        recommended_action: "MONITOR: AI synthetic voice detected. Request secondary out-of-band confirmation before taking sensitive actions.",
        requires_hold: false,
        transaction_held: false,
        synthetic_risk: 95.8,
        spectral_risk: 82.5,
        prosody_risk: 74.5,
        speaker_similarity: 78,
        scam_risk: 0,
        context_risk: 35,
        patterns: [],
        telemetry: {
          spectral: { spectral_risk: 82.5, rolloff_ratio: 2760, artifacts_detected: ["Phase angle discontinuity / Vocoder dispersion", "Comb filter framing artifact"] },
          prosody: { prosody_risk: 74.5, pitch_std_hz: 10.5, pause_ratio: 7.5, prosody_flags: ["Unnatural pitch flatness (low dynamic range)", "Constrained pitch cadence"] },
          speaker: { claimed_identity: "Rahul Sharma (CFO)", similarity_pct: 78, status: "QUESTIONABLE_MATCH" }
        }
      }
    ]
  },

  real_scam: {
    caller_number: "+91-98765-43210",
    claimed_identity: "Inspector Sharma (Delhi Police)",
    transaction_amount: 50000,
    steps: [
      {
        timeMs: 1200,
        text: "ध्यान से सुनिए! मैं दिल्ली पुलिस क्राइम ब्रांच से इंस्पेक्टर शर्मा बोल रहा हूँ।",
        overall_risk: 52,
        threat_tier: "CAUTION",
        action_code: "FLAG_FOR_REVIEW",
        recommended_action: "MONITOR: Legal authority intimidation detected. Exercise caution.",
        requires_hold: false,
        transaction_held: false,
        synthetic_risk: 3.5,
        spectral_risk: 12.0,
        prosody_risk: 8.5,
        speaker_similarity: 40,
        scam_risk: 52.0,
        context_risk: 65,
        patterns: [
          "Fear / Legal Authority Impersonation: 'delhi police'",
          "Fear / Legal Authority Impersonation: 'crime branch'"
        ],
        telemetry: {
          spectral: { spectral_risk: 12.0, rolloff_ratio: 3740, artifacts_detected: [] },
          prosody: { prosody_risk: 8.5, pitch_std_hz: 48.2, pause_ratio: 24.1, prosody_flags: [] },
          speaker: { claimed_identity: "Inspector Sharma", similarity_pct: 40, status: "EXTERNAL_UNVERIFIED_CALLER" }
        },
        copilot: {
          smart_counter_scripts: [
            "Say: 'State your official Delhi Police badge number and station station house officer contact.'",
            "Say: 'Police does not conduct investigations or demand fee payments over telephone calls.'"
          ],
          legal_citations: [
            "Section 66D IT Act: Criminal liability for cheating by personation",
            "CrPC Section 41A: Mandatory written notice requirement prior to any detention"
          ]
        }
      },
      {
        timeMs: 7000,
        text: "आपके बैंक खाते के खिलाफ गैर-कानूनी मनी लॉन्ड्रिंग का गैर-जमानती अरेस्ट वारंट और एफआईआर जारी हो चुकी है।",
        overall_risk: 72,
        threat_tier: "HIGH",
        action_code: "HOLD_AND_VERIFY",
        recommended_action: "HOLD TRANSACTION: Severe legal intimidation extortion detected. Mandate physical verification.",
        requires_hold: true,
        transaction_held: true,
        synthetic_risk: 4.1,
        spectral_risk: 13.5,
        prosody_risk: 9.0,
        speaker_similarity: 38,
        scam_risk: 78.0,
        context_risk: 70,
        patterns: [
          "Fear / Legal Authority Impersonation: 'delhi police'",
          "Fear / Legal Authority Impersonation: 'crime branch'",
          "Fear / Legal Authority Impersonation: 'arrest warrant'",
          "Fear / Legal Authority Impersonation: 'fir'"
        ],
        telemetry: {
          spectral: { spectral_risk: 13.5, rolloff_ratio: 3710, artifacts_detected: [] },
          prosody: { prosody_risk: 9.0, pitch_std_hz: 49.5, pause_ratio: 22.8, prosody_flags: [] },
          speaker: { claimed_identity: "Inspector Sharma", similarity_pct: 38, status: "EXTERNAL_UNVERIFIED_CALLER" }
        },
        copilot: {
          smart_counter_scripts: [
            "Say: 'I am immediately walking into my local police station to physically verify this FIR.'",
            "Say: 'Indian legal warrants cannot be settled through instant monetary transfers.'"
          ],
          legal_citations: [
            "Section 66D IT Act: Up to 3 years imprisonment and fine for cyber impersonation",
            "Section 319 BNS: Extortion by putting person in fear of injury"
          ]
        }
      },
      {
        timeMs: 14000,
        text: "तुरंत पचास हजार रुपये वेरिफिकेशन फीस यूपीआई से हमारे सरकारी खाते में ट्रांसफर करें...",
        overall_risk: 80,
        threat_tier: "HIGH",
        action_code: "HOLD_AND_VERIFY",
        recommended_action: "HOLD TRANSACTION: UPI financial extortion underway under guise of police verification.",
        requires_hold: true,
        transaction_held: true,
        synthetic_risk: 4.5,
        spectral_risk: 14.0,
        prosody_risk: 9.5,
        speaker_similarity: 35,
        scam_risk: 88.0,
        context_risk: 75,
        patterns: [
          "Fear / Legal Authority Impersonation: 'delhi police'",
          "Fear / Legal Authority Impersonation: 'crime branch'",
          "Fear / Legal Authority Impersonation: 'arrest warrant'",
          "Fear / Legal Authority Impersonation: 'fir'",
          "Financial / Fund Transfer Request: 'upi'",
          "Financial / Fund Transfer Request: 'transfer'",
          "Artificial Urgency: 'turant'"
        ],
        telemetry: {
          spectral: { spectral_risk: 14.0, rolloff_ratio: 3680, artifacts_detected: [] },
          prosody: { prosody_risk: 9.5, pitch_std_hz: 51.0, pause_ratio: 21.5, prosody_flags: [] },
          speaker: { claimed_identity: "Inspector Sharma", similarity_pct: 35, status: "EXTERNAL_UNVERIFIED_CALLER" }
        },
        copilot: {
          smart_counter_scripts: [
            "Say: 'Government agencies do not possess personal UPI accounts. Refusing transaction.'",
            "Report immediately to 1930 Cybercrime National Helpline."
          ],
          legal_citations: [
            "Section 66D IT Act: Impersonation extortion offense",
            "Section 319 BNS: Statutory offense punishable with 5 years rigorous imprisonment"
          ]
        }
      },
      {
        timeMs: 20000,
        text: "...वरना पुलिस टीम अभी आपके घर पहुँच रही है।",
        overall_risk: 84,
        threat_tier: "HIGH",
        action_code: "HOLD_AND_VERIFY",
        recommended_action: "HOLD TRANSACTION: Impersonation threat verified. Immediate police referral initiated.",
        requires_hold: true,
        transaction_held: true,
        synthetic_risk: 4.8,
        spectral_risk: 14.2,
        prosody_risk: 10.0,
        speaker_similarity: 35,
        scam_risk: 94.0,
        context_risk: 80,
        patterns: [
          "Fear / Legal Authority Impersonation: 'delhi police'",
          "Fear / Legal Authority Impersonation: 'crime branch'",
          "Fear / Legal Authority Impersonation: 'arrest warrant'",
          "Fear / Legal Authority Impersonation: 'fir'",
          "Financial / Fund Transfer Request: 'upi'",
          "Financial / Fund Transfer Request: 'transfer'",
          "Artificial Urgency: 'turant'",
          "Fear / Legal Authority Impersonation: 'police team'"
        ],
        telemetry: {
          spectral: { spectral_risk: 14.2, rolloff_ratio: 3650, artifacts_detected: [] },
          prosody: { prosody_risk: 10.0, pitch_std_hz: 52.4, pause_ratio: 20.2, prosody_flags: [] },
          speaker: { claimed_identity: "Inspector Sharma", similarity_pct: 35, status: "EXTERNAL_UNVERIFIED_CALLER" }
        }
      }
    ]
  },

  cloned_scam: {
    caller_number: "+91-91234-56789",
    claimed_identity: "Rahul Sharma (CFO)",
    transaction_amount: 2500000,
    steps: [
      {
        timeMs: 1200,
        text: "मेरी बात बहुत ध्यान से सुनो और किसी को मत बताना, यह बहुत सीक्रेट है!",
        overall_risk: 72,
        threat_tier: "HIGH",
        action_code: "HOLD_AND_VERIFY",
        recommended_action: "HOLD TRANSACTION: Executive voice clone combined with psychological isolation tactics.",
        requires_hold: true,
        transaction_held: true,
        active_incident_id: "INC-2026-90412",
        synthetic_risk: 94.8,
        spectral_risk: 84.5,
        prosody_risk: 76.2,
        speaker_similarity: 38,
        scam_risk: 58.0,
        context_risk: 85,
        patterns: [
          "Secrecy & Psychological Isolation: 'kisi ko mat batana'",
          "Secrecy & Psychological Isolation: 'secret'"
        ],
        telemetry: {
          spectral: {
            spectral_risk: 84.5,
            rolloff_ratio: 2420,
            artifacts_detected: ["Phase angle discontinuity / Vocoder dispersion", "Comb filter framing artifact"]
          },
          prosody: {
            prosody_risk: 76.2,
            pitch_std_hz: 8.6,
            pause_ratio: 4.8,
            prosody_flags: [
              "Unnatural pitch flatness (low dynamic range)",
              "Absence of natural breathing pauses (continuous speech)"
            ]
          },
          speaker: {
            claimed_identity: "Rahul Sharma (CFO)",
            similarity_pct: 38,
            status: "BIOMETRIC_PROFILE_DIVERGENCE"
          },
          context: {
            caller_number: "+91-91234-56789",
            transaction_amount: 2500000,
            risk_level: "CRITICAL_HIGH_STAKES"
          }
        },
        copilot: {
          smart_counter_scripts: [
            "Say: 'I am immediately verifying this transaction with executive board via encrypted corporate channel.'",
            "Say: 'Corporate policy mandates two-party authorization for transfers exceeding ₹5,00,000.'"
          ],
          legal_citations: [
            "Section 66D IT Act: Cheating by personation using computer resource",
            "Section 319 BNS: Impersonation extortion penalty up to 5 years imprisonment"
          ]
        }
      },
      {
        timeMs: 6500,
        text: "यहाँ बहुत बड़ी इमरजेंसी आ गई है, पुलिस और कस्टम्स ने मुझे एयरपोर्ट पर डिटेन कर लिया है।",
        overall_risk: 88,
        threat_tier: "CRITICAL",
        action_code: "BLOCK_AND_HOLD",
        recommended_action: "CRITICAL ALERT: Emergency detention narrative with confirmed synthetic audio artifacts.",
        requires_hold: true,
        transaction_held: true,
        active_incident_id: "INC-2026-90412",
        synthetic_risk: 96.5,
        spectral_risk: 87.2,
        prosody_risk: 81.4,
        speaker_similarity: 36,
        scam_risk: 82.0,
        context_risk: 90,
        patterns: [
          "Secrecy & Psychological Isolation: 'kisi ko mat batana'",
          "Secrecy & Psychological Isolation: 'secret'",
          "Artificial Urgency: 'emergency'",
          "Fear / Legal Authority Impersonation: 'police'",
          "Fear / Legal Authority Impersonation: 'customs'",
          "Fear / Legal Authority Impersonation: 'detained'"
        ],
        telemetry: {
          spectral: {
            spectral_risk: 87.2,
            rolloff_ratio: 2380,
            artifacts_detected: ["Phase angle discontinuity / Vocoder dispersion", "Comb filter framing artifact", "High-frequency attenuation"]
          },
          prosody: {
            prosody_risk: 81.4,
            pitch_std_hz: 7.9,
            pause_ratio: 4.2,
            prosody_flags: [
              "Unnatural pitch flatness (low dynamic range)",
              "Absence of natural breathing pauses (continuous speech)",
              "Rigid, metronomic speaking rhythm"
            ]
          },
          speaker: {
            claimed_identity: "Rahul Sharma (CFO)",
            similarity_pct: 36,
            status: "BIOMETRIC_PROFILE_DIVERGENCE"
          },
          context: {
            caller_number: "+91-91234-56789",
            transaction_amount: 2500000,
            risk_level: "CRITICAL_HIGH_STAKES"
          }
        },
        copilot: {
          smart_counter_scripts: [
            "Say: 'Indian Customs does not collect fines on personal bank accounts. Give me the official Customs Consignment Tracking Number.'",
            "Say: 'Do NOT turn on video. Never transfer verification deposits.'"
          ],
          legal_citations: [
            "Section 66D IT Act: Criminal liability for cheating by personation",
            "Section 319 BNS: 5-year penal liability for cyber extortion"
          ]
        }
      },
      {
        timeMs: 12500,
        text: "तुम्हें अभी पच्चीस लाख रुपये तुरंत यूपीआई या आरटीजीएस से इस खाते में ट्रांसफर करने होंगे।",
        overall_risk: 94,
        threat_tier: "CRITICAL",
        action_code: "BLOCK_AND_HOLD",
        recommended_action: "CRITICAL BLOCK: High-probability synthetic impersonation combined with ₹25,00,000 extortion. Intercept transaction immediately.",
        requires_hold: true,
        transaction_held: true,
        active_incident_id: "INC-2026-90412",
        synthetic_risk: 97.4,
        spectral_risk: 89.0,
        prosody_risk: 83.5,
        speaker_similarity: 34,
        scam_risk: 95.0,
        context_risk: 95,
        patterns: [
          "Secrecy & Psychological Isolation: 'kisi ko mat batana'",
          "Secrecy & Psychological Isolation: 'secret'",
          "Artificial Urgency: 'emergency'",
          "Fear / Legal Authority Impersonation: 'police'",
          "Fear / Legal Authority Impersonation: 'customs'",
          "Fear / Legal Authority Impersonation: 'detained'",
          "Financial / Fund Transfer Request: 'pachees lakh'",
          "Financial / Fund Transfer Request: 'upi'",
          "Financial / Fund Transfer Request: 'rtgs'",
          "Financial / Fund Transfer Request: 'transfer'",
          "Artificial Urgency: 'turant'"
        ],
        telemetry: {
          spectral: {
            spectral_risk: 89.0,
            rolloff_ratio: 2350,
            artifacts_detected: ["Phase angle discontinuity / Vocoder dispersion", "Comb filter framing artifact", "High-frequency attenuation"]
          },
          prosody: {
            prosody_risk: 83.5,
            pitch_std_hz: 7.5,
            pause_ratio: 3.9,
            prosody_flags: [
              "Unnatural pitch flatness (low dynamic range)",
              "Absence of natural breathing pauses (continuous speech)",
              "Rigid, metronomic speaking rhythm"
            ]
          },
          speaker: {
            claimed_identity: "Rahul Sharma (CFO)",
            similarity_pct: 34,
            status: "BIOMETRIC_PROFILE_DIVERGENCE"
          },
          context: {
            caller_number: "+91-91234-56789",
            transaction_amount: 2500000,
            risk_level: "CRITICAL_HIGH_STAKES"
          }
        },
        copilot: {
          smart_counter_scripts: [
            "Say: 'I am immediately walking into my local police station to physically verify this with the Station House Officer.'",
            "Say: 'Transaction is physically intercepted by Voice SOC policy. Secondary MFA required.'"
          ],
          legal_citations: [
            "Section 66D IT Act: Strict liability for digital personation",
            "NCRP 1930: Immediate freezing of beneficiary payment gateway accounts"
          ]
        }
      },
      {
        timeMs: 18500,
        text: "फोन बिल्कुल मत काटना, जल्दी करो!",
        overall_risk: 96,
        threat_tier: "CRITICAL",
        action_code: "BLOCK_AND_HOLD",
        recommended_action: "CRITICAL BLOCK: Active coercion detected. Pre-action banking hold permanently engaged.",
        requires_hold: true,
        transaction_held: true,
        active_incident_id: "INC-2026-90412",
        synthetic_risk: 97.8,
        spectral_risk: 90.2,
        prosody_risk: 84.8,
        speaker_similarity: 32,
        scam_risk: 98.0,
        context_risk: 95,
        patterns: [
          "Secrecy & Psychological Isolation: 'kisi ko mat batana'",
          "Secrecy & Psychological Isolation: 'secret'",
          "Artificial Urgency: 'emergency'",
          "Fear / Legal Authority Impersonation: 'police'",
          "Fear / Legal Authority Impersonation: 'customs'",
          "Fear / Legal Authority Impersonation: 'detained'",
          "Financial / Fund Transfer Request: 'pachees lakh'",
          "Financial / Fund Transfer Request: 'upi'",
          "Financial / Fund Transfer Request: 'rtgs'",
          "Financial / Fund Transfer Request: 'transfer'",
          "Artificial Urgency: 'turant'",
          "Secrecy & Psychological Isolation: 'phone mat kaatna'",
          "Artificial Urgency: 'jaldi karo'"
        ],
        telemetry: {
          spectral: {
            spectral_risk: 90.2,
            rolloff_ratio: 2320,
            artifacts_detected: ["Phase angle discontinuity / Vocoder dispersion", "Comb filter framing artifact", "High-frequency attenuation"]
          },
          prosody: {
            prosody_risk: 84.8,
            pitch_std_hz: 7.2,
            pause_ratio: 3.5,
            prosody_flags: [
              "Unnatural pitch flatness (low dynamic range)",
              "Absence of natural breathing pauses (continuous speech)",
              "Rigid, metronomic speaking rhythm"
            ]
          },
          speaker: {
            claimed_identity: "Rahul Sharma (CFO)",
            similarity_pct: 32,
            status: "BIOMETRIC_PROFILE_DIVERGENCE"
          },
          context: {
            caller_number: "+91-91234-56789",
            transaction_amount: 2500000,
            risk_level: "CRITICAL_HIGH_STAKES"
          }
        },
        copilot: {
          smart_counter_scripts: [
            "Say: 'Call terminated. Incident reported to 1930 Cybercrime Helpline.'",
            "Say: 'This line is under active forensic surveillance by SwarSatya Security Operations.'"
          ],
          legal_citations: [
            "Section 66D IT Act: Cyber fraud complaint auto-generated",
            "Section 319 BNS: Cognizable non-bailable offense"
          ]
        }
      }
    ]
  }
};
