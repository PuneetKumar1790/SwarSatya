import React from 'react';
import { AlertTriangle, ShieldCheck, AlertOctagon, Info } from 'lucide-react';

export default function AlertPanel({
  threatTier = 'LOW',
  recommendedAction = 'Normal conversation. No threat detected.'
}) {
  const getBannerConfig = () => {
    switch (threatTier) {
      case 'CRITICAL':
        return {
          icon: <AlertOctagon size={24} color="#ffffff" />,
          bg: 'linear-gradient(135deg, #991b1b, #ef4444)',
          border: '#f87171',
          title: 'CRITICAL SECURITY THREAT DETECTED'
        };
      case 'HIGH':
        return {
          icon: <AlertTriangle size={24} color="#ffffff" />,
          bg: 'linear-gradient(135deg, #c2410c, #f97316)',
          border: '#fb923c',
          title: 'HIGH RISK: SUSPECTED FRAUD / IMPERSONATION'
        };
      case 'CAUTION':
        return {
          icon: <AlertTriangle size={24} color="#ffffff" />,
          bg: 'linear-gradient(135deg, #b45309, #f59e0b)',
          border: '#fcd34d',
          title: 'CAUTION: ABNORMAL CONVERSATION OR VOICE PATTERNS'
        };
      default:
        return {
          icon: <ShieldCheck size={24} color="#10b981" />,
          bg: 'rgba(16, 185, 129, 0.1)',
          border: 'rgba(16, 185, 129, 0.3)',
          title: 'PROTECTED: NO THREATS DETECTED'
        };
    }
  };

  const config = getBannerConfig();

  return (
    <div
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        boxShadow: threatTier === 'CRITICAL' ? '0 0 25px rgba(239, 68, 68, 0.4)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ marginTop: '2px' }}>{config.icon}</div>
      <div style={{ flex: 1 }}>
        <h4 style={{
          margin: '0 0 0.35rem 0',
          fontSize: '0.95rem',
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: threatTier === 'LOW' ? '#10b981' : '#ffffff'
        }}>
          {config.title}
        </h4>
        <p style={{
          margin: 0,
          fontSize: '0.85rem',
          lineHeight: 1.4,
          color: threatTier === 'LOW' ? '#9ca3af' : 'rgba(255, 255, 255, 0.95)',
          fontWeight: 500
        }}>
          {recommendedAction}
        </p>
      </div>
    </div>
  );
}
