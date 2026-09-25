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
        bg: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.85))',
        border: 'rgba(56, 189, 248, 0.25)',
        title: 'VOICE SOC MISSION CONTROL • PIPELINE ARMED & STANDBY',
        textColor: '#38bdf8'
      };
    }
    switch (threatTier) {
      case 'CRITICAL':
        return {
          icon: <AlertOctagon size={24} color="#ffffff" />,
          bg: 'linear-gradient(135deg, #991b1b, #ef4444)',
          border: '#f87171',
          title: 'CRITICAL VOICE SECURITY THREAT DETECTED',
          textColor: '#ffffff'
        };
      case 'HIGH':
        return {
          icon: <AlertTriangle size={24} color="#ffffff" />,
          bg: 'linear-gradient(135deg, #c2410c, #f97316)',
          border: '#fb923c',
          title: 'HIGH RISK: SUSPECTED VOICE CLONE / EXTORTION',
          textColor: '#ffffff'
        };
      case 'CAUTION':
        return {
          icon: <AlertTriangle size={24} color="#ffffff" />,
          bg: 'linear-gradient(135deg, #b45309, #f59e0b)',
          border: '#fcd34d',
          title: 'CAUTION: ABNORMAL VOICE OR UNREGISTERED LINE',
          textColor: '#ffffff'
        };
      default:
        return {
          icon: <ShieldCheck size={24} color="#34d399" />,
          bg: 'linear-gradient(135deg, rgba(6, 78, 59, 0.4), rgba(5, 150, 105, 0.2))',
          border: 'rgba(52, 211, 153, 0.4)',
          title: 'CALL VERIFIED: AUTHENTIC HUMAN & BIOMETRIC MATCH',
          textColor: '#34d399'
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
        borderRadius: '12px',
        padding: '1.15rem 1.35rem',
        marginBottom: '1.25rem',
        boxShadow: isStreamActive && threatTier === 'CRITICAL' ? '0 0 30px rgba(239, 68, 68, 0.35)' : '0 4px 20px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(10px)',
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
