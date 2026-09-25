import React, { useState } from 'react';
import { Bot, Copy, Check, MessageSquareWarning, ShieldCheck, Scale, PhoneCall } from 'lucide-react';

export default function ScamCopilotCard({ defenseCopilot = {}, detectedPatterns = [], isStreamActive = false }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  const scripts = defenseCopilot.smart_counter_scripts || [
    "Ask: 'Could you please confirm this request through an official corporate email or registered number?'",
    "Say: 'I will call you back on your registered office extension after checking our standard operating procedure.'"
  ];

  const legalCitations = defenseCopilot.legal_citations || [
    "Always practice Zero-Trust verification before approving privileged or financial requests."
  ];

  const safetyActions = defenseCopilot.recommended_safety_actions || [
    "Verify caller through out-of-band secondary channel."
  ];

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            padding: '0.45rem',
            borderRadius: '8px'
          }}>
            <Bot size={18} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f3f4f6' }}>
              Real-Time Scam Defense Copilot & Counter-Prompts
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
              Live tactical counter-interrogation scripts & legal rebuttals to neutralize coercion
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.72rem',
          color: isStreamActive ? '#10b981' : '#38bdf8',
          background: isStreamActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
          padding: '0.2rem 0.6rem',
          borderRadius: '4px',
          border: `1px solid ${isStreamActive ? '#10b98140' : 'rgba(6, 182, 212, 0.3)'}`
        }}>
          <ShieldCheck size={13} />
          <span>{isStreamActive ? 'Active In-Call Defense Co-Pilot' : 'Co-Pilot Standby (Awaiting Audio)'}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
        {/* Left Column: Smart Counter-Interrogation Scripts */}
        <div style={{ background: '#0d1322', borderRadius: '8px', padding: '0.85rem', border: '1px solid var(--border-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.6rem' }}>
            <MessageSquareWarning size={14} />
            <span>Recommended Counter-Responses (Speak to Caller):</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {!isStreamActive ? (
              <div style={{
                background: '#111827',
                border: '1px dashed #374151',
                borderRadius: '6px',
                padding: '0.9rem',
                fontSize: '0.78rem',
                color: '#9ca3af',
                textAlign: 'center',
                lineHeight: 1.4
              }}>
                🎙️ <strong>Co-Pilot Standby:</strong> Awaiting incoming call audio or scenario demo. Click <em>"Play Scenario"</em> below or speak into your microphone to generate real-time counter-interrogation scripts.
              </div>
            ) : (
              scripts.map((script, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#111827',
                    border: '1px solid #1f2937',
                    borderRadius: '6px',
                    padding: '0.6rem 0.75rem',
                    fontSize: '0.78rem',
                    color: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{ lineHeight: 1.35 }}>{script}</span>
                  <button
                    onClick={() => handleCopy(script, idx)}
                    title="Copy response to clipboard"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: copiedIdx === idx ? '#10b981' : '#9ca3af',
                      cursor: 'pointer',
                      padding: '0.2rem',
                      flexShrink: 0
                    }}
                  >
                    {copiedIdx === idx ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Legal Citations & Protection Advice */}
        <div style={{ background: '#0d1322', borderRadius: '8px', padding: '0.85rem', border: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.6rem' }}>
              <Scale size={14} />
              <span>Statutory Legal Basis & Protective Advice:</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {!isStreamActive ? (
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', background: 'rgba(245, 158, 11, 0.08)', padding: '0.85rem', borderRadius: '6px', border: '1px dashed #f59e0b30', lineHeight: 1.4 }}>
                  ⚖ <strong>Statutory Advice on Standby:</strong> Legal protections under Section 66D IT Act and Section 319 BNS will activate automatically upon detecting coercive or extortion patterns.
                </div>
              ) : (
                <>
                  {legalCitations.map((cit, idx) => (
                    <div key={idx} style={{ fontSize: '0.75rem', color: '#fcd34d', background: '#f59e0b15', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #f59e0b30', lineHeight: 1.35 }}>
                      ⚖ {cit}
                    </div>
                  ))}

                  {safetyActions.map((act, idx) => (
                    <div key={idx} style={{ fontSize: '0.75rem', color: '#f87171', background: '#ef444415', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #ef444430', lineHeight: 1.35 }}>
                      🛑 {act}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div style={{ background: '#070b14', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              National Cybercrime Helpline:
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <PhoneCall size={13} />
              1930 (Toll-Free)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
