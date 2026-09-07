import React from 'react';
import { Activity, Radio, Cpu, ShieldAlert } from 'lucide-react';

export default function RiskMeter({
  syntheticRisk = 0,
  scamRisk = 0,
  overallRisk = 0,
  threatTier = 'LOW'
}) {
  const getTierColor = (tier) => {
    switch (tier) {
      case 'CRITICAL': return '#f43f5e';
      case 'HIGH': return '#f97316';
      case 'CAUTION': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const tierColor = getTierColor(threatTier);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="var(--accent-cyan)" />
          Real-Time Threat Assessment
        </h3>
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '6px',
          fontWeight: 700,
          fontSize: '0.8rem',
          backgroundColor: `${tierColor}20`,
          color: tierColor,
          border: `1px solid ${tierColor}50`
        }}>
          {threatTier} THREAT
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Overall Fused Risk */}
        <div style={{
          background: '#0d1322',
          border: `1px solid ${tierColor}40`,
          borderRadius: '10px',
          padding: '1.25rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Overall Fused Risk
          </div>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: tierColor,
            fontFamily: 'JetBrains Mono',
            letterSpacing: '-0.03em'
          }}>
            {Math.round(overallRisk)}
            <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>/100</span>
          </div>
          <div style={{
            marginTop: '0.5rem',
            width: '100%',
            height: '6px',
            backgroundColor: '#1f2937',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, overallRisk))}%`,
              height: '100%',
              backgroundColor: tierColor,
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Synthetic Voice Risk */}
        <div style={{
          background: '#0d1322',
          border: '1px solid var(--border-card)',
          borderRadius: '10px',
          padding: '1.25rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            <Cpu size={14} color="#06b6d4" />
            Synthetic Voice (Deepfake)
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#06b6d4',
            fontFamily: 'JetBrains Mono'
          }}>
            {Math.round(syntheticRisk)}%
          </div>
          <div style={{
            marginTop: '0.5rem',
            width: '100%',
            height: '6px',
            backgroundColor: '#1f2937',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, syntheticRisk))}%`,
              height: '100%',
              backgroundColor: '#06b6d4',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Scam Pattern Risk */}
        <div style={{
          background: '#0d1322',
          border: '1px solid var(--border-card)',
          borderRadius: '10px',
          padding: '1.25rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            <ShieldAlert size={14} color="#f59e0b" />
            Scam Pattern Signal
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#f59e0b',
            fontFamily: 'JetBrains Mono'
          }}>
            {Math.round(scamRisk)}%
          </div>
          <div style={{
            marginTop: '0.5rem',
            width: '100%',
            height: '6px',
            backgroundColor: '#1f2937',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, scamRisk))}%`,
              height: '100%',
              backgroundColor: '#f59e0b',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
