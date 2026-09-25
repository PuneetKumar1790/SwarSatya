import React from 'react';
import { Activity, Cpu, ShieldAlert, UserCheck, Waves } from 'lucide-react';

export default function RiskMeter({
  syntheticRisk = 0,
  spectralRisk = 0,
  prosodyRisk = 0,
  speakerSimilarity = 100,
  contextRisk = 0,
  scamRisk = 0,
  overallRisk = 0,
  threatTier = 'LOW',
  isStreamActive = false
}) {
  const getTierColor = (tier) => {
    if (!isStreamActive) return '#06b6d4';
    switch (tier) {
      case 'CRITICAL': return '#f43f5e';
      case 'HIGH': return '#f97316';
      case 'CAUTION': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const tierColor = getTierColor(threatTier);

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="var(--accent-cyan)" />
          Unified Voice Threat Telemetry
        </h3>
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '6px',
          fontWeight: 800,
          fontSize: '0.75rem',
          backgroundColor: isStreamActive ? `${tierColor}20` : 'rgba(6, 182, 212, 0.15)',
          color: isStreamActive ? tierColor : '#38bdf8',
          border: `1px solid ${isStreamActive ? `${tierColor}50` : 'rgba(6, 182, 212, 0.3)'}`
        }}>
          {isStreamActive ? `${threatTier} THREAT` : 'STANDBY (AWAITING AUDIO)'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        {/* Overall Fused Risk */}
        <div style={{
          background: '#0d1322',
          border: `1px solid ${tierColor}50`,
          borderRadius: '10px',
          padding: '1rem',
          textAlign: 'center',
          boxShadow: isStreamActive && threatTier === 'CRITICAL' ? '0 0 15px rgba(244, 63, 94, 0.2)' : 'none'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
            Overall Fused Risk
          </div>
          <div style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: isStreamActive ? tierColor : '#38bdf8',
            fontFamily: 'JetBrains Mono',
            letterSpacing: '-0.03em'
          }}>
            {isStreamActive ? Math.round(overallRisk) : 0}
            <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              {isStreamActive ? '/100' : ' / 100 (STANDBY)'}
            </span>
          </div>
          <div style={{
            marginTop: '0.4rem',
            width: '100%',
            height: '6px',
            backgroundColor: '#1f2937',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${isStreamActive ? Math.min(100, Math.max(0, overallRisk)) : 0}%`,
              height: '100%',
              backgroundColor: tierColor,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Voice Authenticity (Wav2Vec2 + Spectral) */}
        <div style={{
          background: '#0d1322',
          border: '1px solid var(--border-card)',
          borderRadius: '10px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
            <Cpu size={14} color="#06b6d4" />
            Synthetic Voice (AI)
          </div>
          <div style={{
            fontSize: '1.9rem',
            fontWeight: 700,
            color: '#06b6d4',
            fontFamily: 'JetBrains Mono'
          }}>
            {isStreamActive ? `${Math.round(syntheticRisk)}%` : '--%'}
          </div>
          <div style={{
            marginTop: '0.4rem',
            width: '100%',
            height: '6px',
            backgroundColor: '#1f2937',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${isStreamActive ? Math.min(100, Math.max(0, syntheticRisk)) : 0}%`,
              height: '100%',
              backgroundColor: '#06b6d4',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Spectral & Phase Inconsistency */}
        <div style={{
          background: '#0d1322',
          border: '1px solid var(--border-card)',
          borderRadius: '10px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
            <Waves size={14} color="#38bdf8" />
            Spectral & Phase
          </div>
          <div style={{
            fontSize: '1.9rem',
            fontWeight: 700,
            color: '#38bdf8',
            fontFamily: 'JetBrains Mono'
          }}>
            {isStreamActive ? `${Math.round(spectralRisk)}%` : '--%'}
          </div>
          <div style={{
            marginTop: '0.4rem',
            width: '100%',
            height: '6px',
            backgroundColor: '#1f2937',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${isStreamActive ? Math.min(100, Math.max(0, spectralRisk)) : 0}%`,
              height: '100%',
              backgroundColor: '#38bdf8',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Speaker Biometric Match */}
        <div style={{
          background: '#0d1322',
          border: '1px solid var(--border-card)',
          borderRadius: '10px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
            <UserCheck size={14} color={!isStreamActive ? '#9ca3af' : (speakerSimilarity >= 60 ? '#10b981' : '#f43f5e')} />
            Speaker Profile Match
          </div>
          <div style={{
            fontSize: '1.9rem',
            fontWeight: 700,
            color: !isStreamActive ? '#9ca3af' : (speakerSimilarity >= 60 ? '#10b981' : '#f43f5e'),
            fontFamily: 'JetBrains Mono'
          }}>
            {isStreamActive ? `${Math.round(speakerSimilarity)}%` : '--%'}
          </div>
          <div style={{
            marginTop: '0.4rem',
            width: '100%',
            height: '6px',
            backgroundColor: '#1f2937',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${isStreamActive ? Math.min(100, Math.max(0, speakerSimilarity)) : 0}%`,
              height: '100%',
              backgroundColor: speakerSimilarity >= 60 ? '#10b981' : '#f43f5e',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Context & Scam Triggers */}
        <div style={{
          background: '#0d1322',
          border: '1px solid var(--border-card)',
          borderRadius: '10px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
            <ShieldAlert size={14} color="#f59e0b" />
            Scam / Context Stakes
          </div>
          <div style={{
            fontSize: '1.9rem',
            fontWeight: 700,
            color: '#f59e0b',
            fontFamily: 'JetBrains Mono'
          }}>
            {isStreamActive ? `${Math.round(Math.max(contextRisk, scamRisk))}%` : '--%'}
          </div>
          <div style={{
            marginTop: '0.4rem',
            width: '100%',
            height: '6px',
            backgroundColor: '#1f2937',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, Math.max(contextRisk, scamRisk)))}%`,
              height: '100%',
              backgroundColor: '#f59e0b',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
