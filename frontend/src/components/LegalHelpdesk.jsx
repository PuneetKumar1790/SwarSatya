import React, { useState, useEffect } from 'react';
import { Scale, FileText, PhoneCall, Copy, Check, ShieldCheck, AlertOctagon, ExternalLink } from 'lucide-react';
import { BACKEND_URL } from '../config.js';

export default function LegalHelpdesk({
  isOpen,
  onClose,
  callerNumber = '+91-91234-56789',
  claimedIdentity = 'Rahul Sharma (CFO)',
  transactionAmount = 2500000,
  overallRisk = 88,
  threatTier = 'CRITICAL',
  activeIncidentId = 'INC-2026-00418'
}) {
  const [copied, setCopied] = useState(false);
  const [firDraft, setFirDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFirDraft();
    }
  }, [isOpen, callerNumber, claimedIdentity, transactionAmount, overallRisk]);

  const fetchFirDraft = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/legal/fir-draft?room_id=satya-room-1`);
      if (res.ok) {
        const data = await res.json();
        setFirDraft(data.fir_text || '');
      }
    } catch (e) {
      // Fallback local template
      const fallback = `FORMAL CYBERCRIME COMPLAINT DRAFT (Under Section 66D IT Act 2000 & Section 319 BNS)
National Cyber Crime Reporting Portal (NCRP) - Helpline 1930

1. COMPLAINANT INCIDENT REFERENCE: ${activeIncidentId}
2. DATE & TIME: ${new Date().toLocaleString()}
3. SUSPECT CALLER NUMBER / ORIGIN: ${callerNumber} (Unregistered VoIP / Spoofed Gateway)
4. CLAIMED IMPERSONATED ROLE: ${claimedIdentity}
5. FINANCIAL EXPOSURE DEMANDED: Rs. ${Number(transactionAmount).toLocaleString('en-IN')}
6. AI VOICE FORENSIC EVIDENCE (SwarSatya Platform):
   - Overall Impersonation Threat Score: ${overallRisk}% (${threatTier} Threat Tier)
   - Voice Synthesis & Phase Dispersion: Flagged
   - Speaker Biometric Match: Critical Deviation from Registered Baseline
7. ACTION REQUESTED:
   Registration of FIR under Section 66D IT Act 2000 (Cheating by personation) and Section 319 BNS.
   Immediate freezing of suspect mule accounts under I4C CFCFRMS framework.`;
      setFirDraft(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(firDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: '#0d1322',
        border: '1px solid var(--border-card)',
        borderRadius: '14px',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.75rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '0.5rem', borderRadius: '8px' }}>
              <Scale size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#f3f4f6' }}>
                National Cybercrime Legal Helpdesk & FIR Generator
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Statutory protections, 1930 Helpline integration, and auto-generated FIR complaint draft
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Emergency Helplines Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#111827', padding: '0.85rem', borderRadius: '8px', border: '1px solid #10b98150' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              Citizen Financial Fraud Helpline (I4C)
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <PhoneCall size={16} />
              1930
            </div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.2rem' }}>
              24x7 Pan-India Toll-Free Hotline
            </div>
          </div>

          <div style={{ background: '#111827', padding: '0.85rem', borderRadius: '8px', border: '1px solid #38bdf850' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              Official Reporting Portal
            </div>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}
            >
              cybercrime.gov.in <ExternalLink size={13} />
            </a>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Ministry of Home Affairs (MHA), GoI
            </div>
          </div>
        </div>

        {/* Statutory Rights & Legal Clarifications */}
        <div style={{ background: '#070b14', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-card)', marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.6rem 0', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} />
            Key Statutory Provisions Under Indian Law
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.75rem', color: '#d1d5db', lineHeight: 1.4 }}>
            <div>
              <strong style={{ color: '#38bdf8' }}>1. Section 66D, Information Technology Act, 2000:</strong><br />
              Punishment for cheating by personation by using computer resource (voice cloning / VoIP spoofing). Imprisonment up to 3 years and fine up to ₹1,00,000.
            </div>

            <div>
              <strong style={{ color: '#f87171' }}>2. "Digital Arrest" is Strictly Illegal:</strong><br />
              Supreme Court and MHA circulars strictly clarify that <em>no police department, CBI, or judicial magistrate conducts arrest proceedings or demands bail bonds via WhatsApp/Skype/phone</em>. Such demands are prima facie extortion.
            </div>

            <div>
              <strong style={{ color: '#34d399' }}>3. Zero Customer Liability (RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18):</strong><br />
              In cases of third-party breach/fraud where customer notifies the bank within 3 working days, customer entitlement is 100% zero liability.
            </div>
          </div>
        </div>

        {/* Auto-Generated FIR Draft */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={15} color="#06b6d4" />
              Auto-Generated NCRP / Police FIR Complaint Draft
            </span>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: copied ? '#10b981' : '#1f2937',
                border: '1px solid var(--border-card)',
                color: '#fff',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied to Clipboard' : 'Copy FIR Draft'}
            </button>
          </div>

          <textarea
            readOnly
            value={firDraft}
            rows={10}
            style={{
              width: '100%',
              background: '#070b14',
              border: '1px solid var(--border-card)',
              borderRadius: '8px',
              padding: '0.75rem',
              color: '#9ca3af',
              fontSize: '0.75rem',
              fontFamily: 'JetBrains Mono',
              lineHeight: 1.5,
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: '#1f2937',
              color: '#e5e7eb',
              border: '1px solid var(--border-card)',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close Helpdesk
          </button>
        </div>
      </div>
    </div>
  );
}
