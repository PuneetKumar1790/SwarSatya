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
    if (!isStreamActive) return '#818cf8';
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
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.01em' }}>
          <Activity size={17} color="#818cf8" />
          Unified Voice Threat Telemetry
        </h3>
        <span style={{
          padding: '0.2rem 0.65rem',
          borderRadius: '9999px',
          fontWeight: 700,
          fontSize: '0.7rem',
          letterSpacing: '0.04em',
          backgroundColor: isStreamActive ? `${tierColor}15` : 'rgba(99, 102, 241, 0.1)',
          color: isStreamActive ? tierColor : '#a5b4fc',
          border: `1px solid ${isStreamActive ? `${tierColor}35` : 'rgba(99, 102, 241, 0.25)'}`
        }}>
          {isStreamActive ? `${threatTier} THREAT` : 'STANDBY (AWAITING AUDIO)'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        {/* Overall Fused Risk */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: `1px solid ${isStreamActive ? `${tierColor}40` : 'rgba(99, 102, 241, 0.25)'}`,
          borderRadius: '10px',
          padding: '1rem',
          textAlign: 'center',
          boxShadow: isStreamActive && threatTier === 'CRITICAL' ? '0 0 20px rgba(244, 63, 94, 0.2)' : 'none'
        }}>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>
            Overall Fused Risk
          </div>
          <div style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            color: isStreamActive ? tierColor : '#a5b4fc',
            fontFamily: 'JetBrains Mono',
            letterSpacing: '-0.03em'
          }}>
            {isStreamActive ? Math.round(overallRisk) : 0}
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              {isStreamActive ? '/100' : ' / 100'}
            </span>
          </div>
          <div style={{
            marginTop: '0.4rem',
            width: '100%',
            height: '5px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
          background: 'rgba(15, 23, 42, 0.55)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '10px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>
            <Cpu size={13} color="#818cf8" />
            Synthetic Voice (AI)
          </div>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            color: '#818cf8',
            fontFamily: 'JetBrains Mono'
          }}>
            {isStreamActive ? `${Math.round(syntheticRisk)}%` : '--%'}
          </div>
          <div style={{
            marginTop: '0.4rem',
            width: '100%',
            height: '5px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${isStreamActive ? Math.min(100, Math.max(0, syntheticRisk)) : 0}%`,
              height: '100%',
              backgroundColor: '#818cf8',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Spectral & Phase Inconsistency */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.55)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '10px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>
            <Waves size={13} color="#38bdf8" />
            Spectral & Phase
          </div>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            color: '#38bdf8',
            fontFamily: 'JetBrains Mono'
          }}>
            {isStreamActive ? `${Math.round(spectralRisk)}%` : '--%'}
          </div>
          <div style={{
            marginTop: '0.4rem',
            width: '100%',
            height: '5px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
          background: 'rgba(15, 23, 42, 0.55)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '10px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>
            <UserCheck size={13} color={!isStreamActive ? '#94a3b8' : (speakerSimilarity >= 60 ? '#34d399' : '#f43f5e')} />
            Speaker Profile Match
          </div>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            color: !isStreamActive ? '#94a3b8' : (speakerSimilarity >= 60 ? '#34d399' : '#f43f5e'),
            fontFamily: 'JetBrains Mono'
          }}>
            {isStreamActive ? `${Math.round(speakerSimilarity)}%` : '--%'}
          </div>
          <div style={{
            marginTop: '0.4rem',
            width: '100%',
            height: '5px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${isStreamActive ? Math.min(100, Math.max(0, speakerSimilarity)) : 0}%`,
              height: '100%',
              backgroundColor: speakerSimilarity >= 60 ? '#34d399' : '#f43f5e',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Context & Scam Triggers */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.55)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '10px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>
            <ShieldAlert size={13} color="#fbbf24" />
            Scam / Context Stakes
          </div>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            color: '#fbbf24',
            fontFamily: 'JetBrains Mono'
          }}>
            {isStreamActive ? `${Math.round(Math.max(contextRisk, scamRisk))}%` : '--%'}
          </div>
          <div style={{
            marginTop: '0.4rem',
            width: '100%',
            height: '5px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, Math.max(contextRisk, scamRisk)))}%`,
              height: '100%',
              backgroundColor: '#fbbf24',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
