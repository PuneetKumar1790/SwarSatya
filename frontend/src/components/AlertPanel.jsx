import React from 'react';
import { AlertTriangle, ShieldCheck, AlertOctagon, KeyRound, PhoneForwarded, IndianRupee, ShieldAlert } from 'lucide-react';

export default function AlertPanel({
  threatTier = 'LOW',
  recommendedAction = 'Normal conversation. No threat detected.',
  requiresHold = false,
  onOpenTransferModal,
  onOpenMfaModal,
  onOpenCallbackModal,
  isStreamActive = false
}) {
  const getBannerConfig = () => {
    if (!isStreamActive) {
      return {
        icon: <ShieldCheck size={22} color="#38bdf8" />,
        bg: 'linear-gradient(90deg, rgba(56, 189, 248, 0.06) 0%, rgba(15, 23, 42, 0.75) 100%)',
        border: 'rgba(56, 189, 248, 0.18)',
        accentBorder: '#38bdf8',
        title: 'VOICE SOC MISSION CONTROL • PIPELINE ARMED & STANDBY',
        textColor: '#e2e8f0',
        badgeBg: 'rgba(56, 189, 248, 0.1)',
        badgeColor: '#38bdf8'
      };
    }
    switch (threatTier) {
      case 'CRITICAL':
        return {
          icon: <AlertOctagon size={22} color="#f43f5e" />,
          bg: 'linear-gradient(90deg, rgba(244, 63, 94, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: 'rgba(244, 63, 94, 0.3)',
          accentBorder: '#f43f5e',
          title: 'CRITICAL VOICE SECURITY THREAT DETECTED',
          textColor: '#fda4af',
          badgeBg: 'rgba(244, 63, 94, 0.15)',
          badgeColor: '#f43f5e'
        };
      case 'HIGH':
        return {
          icon: <AlertTriangle size={22} color="#f97316" />,
          bg: 'linear-gradient(90deg, rgba(249, 115, 22, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: 'rgba(249, 115, 22, 0.25)',
          accentBorder: '#f97316',
          title: 'HIGH RISK: SUSPECTED VOICE CLONE / EXTORTION',
          textColor: '#fed7aa',
          badgeBg: 'rgba(249, 115, 22, 0.15)',
          badgeColor: '#f97316'
        };
      case 'CAUTION':
        return {
          icon: <AlertTriangle size={22} color="#f59e0b" />,
          bg: 'linear-gradient(90deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: 'rgba(245, 158, 11, 0.22)',
          accentBorder: '#f59e0b',
          title: 'CAUTION: ABNORMAL VOICE OR UNREGISTERED LINE',
          textColor: '#fde68a',
          badgeBg: 'rgba(245, 158, 11, 0.15)',
          badgeColor: '#f59e0b'
        };
      default:
        return {
          icon: <ShieldCheck size={22} color="#10b981" />,
          bg: 'linear-gradient(90deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: 'rgba(16, 185, 129, 0.25)',
          accentBorder: '#10b981',
          title: 'CALL VERIFIED: AUTHENTIC HUMAN & BIOMETRIC MATCH',
          textColor: '#a7f3d0',
          badgeBg: 'rgba(16, 185, 129, 0.15)',
          badgeColor: '#10b981'
        };
    }
  };

  const config = getBannerConfig();
  const isElevated = isStreamActive && (threatTier === 'HIGH' || threatTier === 'CRITICAL' || requiresHold);

  return (
    <div
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderLeft: `4px solid ${config.accentBorder}`,
        borderRadius: '10px',
        padding: '1.15rem 1.35rem',
        marginBottom: '1.25rem',
        boxShadow: isStreamActive && threatTier === 'CRITICAL' ? '0 8px 30px rgba(244, 63, 94, 0.18)' : '0 4px 20px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(16px)',
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
              color: config.textColor
            }}>
              {config.title}
            </h4>

            {requiresHold && isStreamActive && (
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
            color: !isStreamActive ? '#94a3b8' : threatTier === 'LOW' ? '#9ca3af' : 'rgba(255, 255, 255, 0.95)',
            fontWeight: 500
          }}>
            {!isStreamActive 
              ? 'Real-time pipeline is online and listening. Trigger an automated scenario below or start live microphone capture to initiate unified voice biometric verification and scam defense.'
              : recommendedAction}
          </p>

          {/* Quick-Action Command Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              onClick={onOpenTransferModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#e2e8f0',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <IndianRupee size={13} color="#94a3b8" />
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
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    border: '1px solid rgba(129, 140, 248, 0.4)',
                    color: '#ffffff',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <KeyRound size={13} color="#ffffff" />
                  Trigger Step-Up MFA
                </button>

                <button
                  onClick={onOpenCallbackModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#e2e8f0',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <PhoneForwarded size={13} color="#94a3b8" />
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
