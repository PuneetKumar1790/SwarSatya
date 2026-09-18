import React, { useState } from 'react';
import { IndianRupee, AlertOctagon, CheckCircle2, ShieldAlert, ArrowRight, Lock } from 'lucide-react';

export default function TransactionModal({
  isOpen,
  onClose,
  overallRisk = 0,
  requiresHold = false,
  activeIncidentId = null,
  onTriggerVerification
}) {
  const [amount, setAmount] = useState('2500000');
  const [recipient, setRecipient] = useState('Offshore Vendor Holdings (Acct #98421004)');
  const [remarks, setRemarks] = useState('Urgent contract clearing fee per executive phone call');
  const [resultStatus, setResultStatus] = useState(null); // 'HELD', 'APPROVED', null
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleExecuteTransfer = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/action/simulate-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: 'satya-room-1',
          amount: Number(amount),
          recipient: recipient
        })
      });
      const data = await res.json();
      setResultStatus(data.status);
    } catch (e) {
      // Fallback evaluation
      if (overallRisk >= 60 || requiresHold) {
        setResultStatus('HELD');
      } else {
        setResultStatus('APPROVED');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
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
        maxWidth: '540px',
        padding: '1.75rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              padding: '0.5rem',
              borderRadius: '8px'
            }}>
              <IndianRupee size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                Enterprise Banking Pre-Transaction Gateway
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Core Banking System (CBS) • Real-Time Voice Security Policy Interceptor
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

        {resultStatus === null ? (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Transfer Amount (INR):
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '9px', color: '#9ca3af', fontWeight: 700 }}>₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#111827',
                    border: '1px solid var(--border-card)',
                    borderRadius: '8px',
                    padding: '0.6rem 0.8rem 0.6rem 2.2rem',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'JetBrains Mono'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Beneficiary Account:
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                style={{
                  width: '100%',
                  background: '#111827',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Transaction Purpose / Voice Authorization Note:
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{
                  width: '100%',
                  background: '#111827',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Live Security Policy Check Indicator */}
            <div style={{
              background: overallRisk >= 60 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${overallRisk >= 60 ? '#f8717150' : '#10b98150'}`,
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: overallRisk >= 60 ? '#f87171' : '#10b981' }}>
                  {overallRisk >= 60 ? '⚠ HIGH RISK POLICY TRIGGERED' : '✓ SECURE CALL CONDITIONS'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Live Voice Integrity Risk: {Math.round(overallRisk)}% | Policy Limit: 60%
                </div>
              </div>
              <Lock size={18} color={overallRisk >= 60 ? '#f87171' : '#10b981'} />
            </div>

            <button
              onClick={handleExecuteTransfer}
              disabled={isLoading}
              style={{
                width: '100%',
                background: overallRisk >= 60 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #06b6d4, #2563eb)',
                color: '#fff',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isLoading ? 'Checking Security Policy...' : 'Authorize Fund Transfer'}
              <ArrowRight size={16} />
            </button>
          </div>
        ) : resultStatus === 'HELD' ? (
          <div>
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '10px',
              padding: '1.25rem',
              textAlign: 'center',
              marginBottom: '1.25rem'
            }}>
              <AlertOctagon size={40} color="#f43f5e" style={{ margin: '0 auto 0.5rem auto' }} />
              <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#fca5a5' }}>
                TRANSACTION AUTOMATICALLY HELD
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#e5e7eb', lineHeight: 1.4 }}>
                Wire transfer of <strong>₹{Number(amount).toLocaleString('en-IN')}</strong> intercepted by SwarSatya Voice Security Policy.
              </p>
              <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#f87171', fontWeight: 700 }}>
                Impersonation Risk Score: {Math.round(overallRisk)}% (Threshold: 60%)
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              <strong>Automated Security Action:</strong>
              <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0 }}>
                <li>Core Banking transfer queue locked pending secondary verification.</li>
                <li>SOC Incident logged: <code>{activeIncidentId || 'INC-2026-00418'}</code></li>
                <li>Mandatory Out-of-Band Call-back or Step-Up MFA challenge required.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  onClose();
                  if (onTriggerVerification) onTriggerVerification('mfa');
                }}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Trigger Step-Up MFA
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onTriggerVerification) onTriggerVerification('callback');
                }}
                style={{
                  flex: 1,
                  background: '#1f2937',
                  color: '#e5e7eb',
                  border: '1px solid var(--border-card)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Call-Back Registered Line
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={46} color="#10b981" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', margin: '0 0 0.5rem 0' }}>
              TRANSFER AUTHORIZED & RELEASED
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0' }}>
              Voice integrity and speaker biometrics verified within safe policy limits (Risk: {Math.round(overallRisk)}%).
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
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
