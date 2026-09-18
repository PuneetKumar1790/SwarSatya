import React from 'react';
import { AlertTriangle, ShieldCheck, AlertOctagon, KeyRound, PhoneForwarded, IndianRupee, ShieldAlert } from 'lucide-react';

export default function AlertPanel({
  threatTier = 'LOW',
  recommendedAction = 'Normal conversation. No threat detected.',
  requiresHold = false,
  onOpenTransferModal,
  onOpenMfaModal,
  onOpenCallbackModal
}) {
  const getBannerConfig = () => {
    switch (threatTier) {
      case 'CRITICAL':
        return {
          icon: <AlertOctagon size={24} color="#ffffff" />,
          bg: 'linear-gradient(135deg, #991b1b, #ef4444)',
          border: '#f87171',
          title: 'CRITICAL VOICE SECURITY THREAT DETECTED'
        };
      case 'HIGH':
        return {
          icon: <AlertTriangle size={24} color="#ffffff" />,
          bg: 'linear-gradient(135deg, #c2410c, #f97316)',
          border: '#fb923c',
          title: 'HIGH RISK: SUSPECTED VOICE CLONE / EXTORTION'
        };
      case 'CAUTION':
        return {
          icon: <AlertTriangle size={24} color="#ffffff" />,
          bg: 'linear-gradient(135deg, #b45309, #f59e0b)',
          border: '#fcd34d',
          title: 'CAUTION: ABNORMAL VOICE OR UNREGISTERED LINE'
        };
      default:
        return {
          icon: <ShieldCheck size={24} color="#10b981" />,
          bg: 'rgba(16, 185, 129, 0.1)',
          border: 'rgba(16, 185, 129, 0.3)',
          title: 'PROTECTED: CALL BIOMETRICS VERIFIED'
        };
    }
  };

  const config = getBannerConfig();
  const isElevated = threatTier === 'HIGH' || threatTier === 'CRITICAL' || requiresHold;

  return (
    <div
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.25rem',
        boxShadow: threatTier === 'CRITICAL' ? '0 0 25px rgba(239, 68, 68, 0.4)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ marginTop: '2px' }}>{config.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{
              margin: '0 0 0.35rem 0',
              fontSize: '0.95rem',
              fontWeight: 800,
              letterSpacing: '0.02em',
              color: threatTier === 'LOW' ? '#10b981' : '#ffffff'
            }}>
              {config.title}
            </h4>

            {requiresHold && (
              <span style={{
                background: '#ffffff',
                color: '#b91c1c',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                letterSpacing: '0.05em'
              }}>
                PRE-ACTION HOLD ACTIVE
              </span>
            )}
          </div>

          <p style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.85rem',
            lineHeight: 1.4,
            color: threatTier === 'LOW' ? '#9ca3af' : 'rgba(255, 255, 255, 0.95)',
            fontWeight: 500
          }}>
            {recommendedAction}
          </p>

          {/* Quick-Action Command Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              onClick={onOpenTransferModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                color: '#ffffff',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <IndianRupee size={13} />
              Simulate Banking Transfer
            </button>

            {isElevated && (
              <>
                <button
                  onClick={onOpenMfaModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#ffffff',
                    border: 'none',
                    color: '#0f172a',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <KeyRound size={13} color="#0f172a" />
                  Trigger Step-Up MFA
                </button>

                <button
                  onClick={onOpenCallbackModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <PhoneForwarded size={13} />
                  Dial Registered PBX
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
