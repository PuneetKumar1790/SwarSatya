import React, { useState } from 'react';
import { PhoneForwarded, KeyRound, ShieldAlert, CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';
import { BACKEND_URL } from '../config.js';

export default function SecondaryVerify({
  isOpen,
  onClose,
  initialTab = 'mfa', // 'mfa' or 'callback' or 'escalate'
  registeredPhone = '+91-98110-45291',
  claimedIdentity = 'Rahul Sharma (CFO)',
  activeIncidentId = 'INC-2026-00418',
  onVerificationSuccess
}) {
  const [tab, setTab] = useState(initialTab);
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'sending', 'sent', 'verifying', 'success', 'failed'
  const [message, setMessage] = useState('');
  const [callProgress, setCallProgress] = useState(0);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setStatus('sending');
    try {
      const res = await fetch(`${BACKEND_URL}/api/action/send-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: 'satya-room-1' })
      });
      const data = await res.json();
      setStatus('sent');
      setMessage(data.message || 'OTP sent successfully.');
    } catch (e) {
      setStatus('sent');
      setMessage(`Demo OTP dispatched to ${registeredPhone}. (Use code: 739201)`);
    }
  };

  const handleVerifyOtp = async () => {
    setStatus('verifying');
    try {
      const res = await fetch(`${BACKEND_URL}/api/action/verify-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: 'satya-room-1', otp_code: otp })
      });
      if (res.ok) {
        setStatus('success');
        setMessage('Identity successfully verified via Out-of-Band OTP! Transaction released.');
        if (onVerificationSuccess) onVerificationSuccess();
      } else {
        setStatus('failed');
        setMessage('Invalid OTP code. Incident escalated to Tier-2 Fraud SOC.');
      }
    } catch (e) {
      if (otp === '739201') {
        setStatus('success');
        setMessage('Identity successfully verified via Out-of-Band OTP! Transaction released.');
        if (onVerificationSuccess) onVerificationSuccess();
      } else {
        setStatus('failed');
        setMessage('Invalid OTP code. Incident escalated to Tier-2 Fraud SOC.');
      }
    }
  };

  const handleStartCallback = () => {
    setCallProgress(1);
    const interval = setInterval(() => {
      setCallProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('success');
          setMessage(`Call-back successfully connected to ${claimedIdentity} on verified hardware PBX.`);
          if (onVerificationSuccess) onVerificationSuccess();
          return 100;
        }
        return prev + 25;
      });
    }, 600);
  };

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
        maxWidth: '520px',
        padding: '1.75rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#f3f4f6' }}>
              Secondary Verification Workflow
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Zero-Trust Identity Confirmation for Sensitive Financial Actions
            </p>
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

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setTab('mfa')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: tab === 'mfa' ? 'var(--accent-cyan)' : '#1f2937',
              color: tab === 'mfa' ? '#0a0f1d' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <KeyRound size={14} />
            Step-Up MFA (OTP)
          </button>

          <button
            onClick={() => setTab('callback')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: tab === 'callback' ? 'var(--accent-cyan)' : '#1f2937',
              color: tab === 'callback' ? '#0a0f1d' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <PhoneForwarded size={14} />
            Registered Call-Back
          </button>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '1.25rem 0' }}>
            <CheckCircle2 size={46} color="#10b981" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', margin: '0 0 0.5rem 0' }}>
              IDENTITY CONFIRMED
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#e5e7eb', marginBottom: '1.25rem' }}>
              {message}
            </p>
            <button
              onClick={onClose}
              style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Close & Resume Operations
            </button>
          </div>
        ) : status === 'failed' ? (
          <div style={{ textAlign: 'center', padding: '1.25rem 0' }}>
            <AlertOctagon size={46} color="#ef4444" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444', margin: '0 0 0.5rem 0' }}>
              VERIFICATION FAILED — FRAUD LOCKED
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#fca5a5', marginBottom: '1.25rem' }}>
              {message}
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Incident Ticket: <strong>{activeIncidentId}</strong> dispatched to Cyber Defense Unit.
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
        ) : tab === 'mfa' ? (
          <div>
            <div style={{
              background: '#111827',
              border: '1px solid var(--border-card)',
              borderRadius: '8px',
              padding: '0.85rem',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              Dispatch a time-based single-use OTP challenge to the enrolled executive phone:
              <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '0.25rem' }}>
                {claimedIdentity} ({registeredPhone})
              </div>
            </div>

            {status === 'sent' && (
              <div style={{
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                padding: '0.6rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#38bdf8',
                marginBottom: '1rem'
              }}>
                ✓ OTP challenge sent to registered phone. <br />
                <span style={{ color: '#f59e0b' }}>Demo hint: Code is <strong>739201</strong></span>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Enter 6-Digit OTP:
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="739201"
                style={{
                  width: '100%',
                  background: '#111827',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  color: '#fff',
                  fontSize: '1.1rem',
                  letterSpacing: '0.2em',
                  textAlign: 'center',
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 700
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleSendOtp}
                disabled={status === 'sending'}
                style={{
                  flex: 1,
                  background: '#1f2937',
                  color: '#e5e7eb',
                  border: '1px solid var(--border-card)',
                  padding: '0.7rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {status === 'sending' ? 'Sending...' : 'Dispatch OTP'}
              </button>

              <button
                onClick={handleVerifyOtp}
                disabled={!otp || status === 'verifying'}
                style={{
                  flex: 1.5,
                  background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.7rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: otp ? 'pointer' : 'not-allowed',
                  opacity: otp ? 1 : 0.6
                }}
              >
                {status === 'verifying' ? 'Validating...' : 'Confirm Identity'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              background: '#111827',
              border: '1px solid var(--border-card)',
              borderRadius: '8px',
              padding: '0.85rem',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              Initiate an automated out-of-band call-back over telecom PSTN to the verified corporate desk line:
              <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '0.25rem' }}>
                {claimedIdentity} ({registeredPhone})
              </div>
            </div>

            {callProgress > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  <span>Dialing PSTN Gateway...</span>
                  <span>{callProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#1f2937', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${callProgress}%`, height: '100%', background: '#06b6d4', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )}

            <button
              onClick={handleStartCallback}
              disabled={callProgress > 0}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                color: '#fff',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: callProgress > 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {callProgress > 0 ? 'Connecting Secure Call-Back...' : 'Place Automated Call-Back'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
