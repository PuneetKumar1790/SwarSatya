import React from 'react';
import { Play, Square, Sparkles, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function DemoController({
  activeScenario,
  onStartDemo,
  onStopDemo,
  isPlaying
}) {
  const scenarios = [
    {
      id: 'real_normal',
      title: 'Scenario 1: Real Voice, Normal Call',
      badge: 'LOW RISK',
      color: '#10b981',
      icon: <CheckCircle2 size={16} color="#10b981" />,
      desc: 'Genuine human voice discussing everyday work slides. Verifies zero false positive alerts.',
      expected: 'Overall: ~0 / Threat: LOW'
    },
    {
      id: 'cloned_normal',
      title: 'Scenario 2: Cloned Voice, Normal Call',
      badge: 'CAUTION',
      color: '#06b6d4',
      icon: <Sparkles size={16} color="#06b6d4" />,
      desc: 'AI-synthesized voice discussing meeting agendas without scam signals. High synthetic risk.',
      expected: 'Synthetic: ~95% / Threat: CAUTION'
    },
    {
      id: 'real_scam',
      title: 'Scenario 3: Real Voice, Scam Call',
      badge: 'HIGH RISK',
      color: '#f97316',
      icon: <AlertTriangle size={16} color="#f97316" />,
      desc: 'Human voice executing police impersonation and legal threats. High scam pattern risk.',
      expected: 'Scam: ~75% / Threat: HIGH'
    },
    {
      id: 'cloned_scam',
      title: 'Scenario 4: Cloned Voice + Scam Call',
      badge: 'CRITICAL',
      color: '#f43f5e',
      icon: <AlertOctagon size={16} color="#f43f5e" />,
      desc: 'Cloned voice executing emergency urgency + secrecy extortion. Triggers critical alert.',
      expected: 'Both High / Threat: CRITICAL'
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-cyan)" />
            Judge Demonstration & Fallback Player (Demo Mode)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Streams pre-recorded scenario clips through the exact same real-time AI & fusion pipeline.
          </p>
        </div>

        {isPlaying && (
          <button
            onClick={onStopDemo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Square size={14} />
            Stop Playback
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
        {scenarios.map((sc) => {
          const isActive = isPlaying && activeScenario === sc.id;
          return (
            <div
              key={sc.id}
              style={{
                background: isActive ? 'rgba(6, 182, 212, 0.12)' : '#0d1322',
                border: `1px solid ${isActive ? '#06b6d4' : 'var(--border-card)'}`,
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: `${sc.color}20`,
                    color: sc.color,
                    border: `1px solid ${sc.color}40`
                  }}>
                    {sc.badge}
                  </span>
                  {sc.icon}
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#f9fafb' }}>
                  {sc.title}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                  {sc.desc}
                </div>

                <div style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Target: {sc.expected}
                </div>
              </div>

              <button
                onClick={() => (isActive ? onStopDemo() : onStartDemo(sc.id))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  background: isActive ? '#ef4444' : '#1f2937',
                  color: '#ffffff',
                  border: '1px solid var(--border-card)',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {isActive ? <Square size={13} /> : <Play size={13} />}
                {isActive ? 'Playing Scenario...' : 'Run Scenario'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
