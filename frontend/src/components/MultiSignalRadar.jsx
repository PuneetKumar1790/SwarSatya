import React from 'react';
import { Cpu, Activity, UserCheck, ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export default function MultiSignalRadar({ telemetry = {}, layerBreakdown = {} }) {
  const spectral = telemetry.spectral || {};
  const prosody = telemetry.prosody || {};
  const speaker = telemetry.speaker || {};
  const context = telemetry.context || {};

  const synthScore = layerBreakdown.synthetic_model || 0;
  const spectralScore = layerBreakdown.spectral_phase || 0;
  const prosodyScore = layerBreakdown.prosody_behavior || 0;
  const speakerMismatch = layerBreakdown.speaker_mismatch || 0;
  const scamScore = layerBreakdown.conversational_scam || 0;

  const speakerSim = speaker.speaker_similarity !== undefined ? speaker.speaker_similarity : (100 - speakerMismatch);

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={18} color="var(--accent-cyan)" />
        Multi-Layer Voice Authenticity Telemetry (4 Core Detection Signals)
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {/* Signal 1: Acoustic & Spectral Analysis */}
        <div style={{ background: '#0d1322', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8' }}>
              <Cpu size={15} />
              Acoustic & Spectral AI
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: spectralScore > 40 ? '#f43f5e' : '#10b981' }}>
              {Math.round(spectralScore)}% Risk
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Vocoder rolloff: {spectral.rolloff_ratio || 0} Hz | Phase jitter: {spectral.phase_irregularity || 0}%
          </div>

          <div style={{ width: '100%', height: '5px', background: '#1f2937', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, Math.max(0, spectralScore))}%`, height: '100%', background: spectralScore > 50 ? '#f43f5e' : '#38bdf8', transition: 'width 0.3s ease' }} />
          </div>

          <div style={{ marginTop: '0.6rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {spectral.artifacts_detected && spectral.artifacts_detected.length > 0 ? (
              <span style={{ color: '#f87171' }}>⚠ {spectral.artifacts_detected[0]}</span>
            ) : (
              <span style={{ color: '#10b981' }}>✓ Coherent STFT phase progression</span>
            )}
          </div>
        </div>

        {/* Signal 2: Prosodic & Behavioral Cadence */}
        <div style={{ background: '#0d1322', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa' }}>
              <Activity size={15} />
              Prosody & Pitch Contour
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: prosodyScore > 40 ? '#f43f5e' : '#10b981' }}>
              {Math.round(prosodyScore)}% Anomaly
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Pitch Std: {prosody.pitch_std_hz || 0} Hz | Pause ratio: {prosody.pause_ratio || 0}%
          </div>

          <div style={{ width: '100%', height: '5px', background: '#1f2937', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, Math.max(0, prosodyScore))}%`, height: '100%', background: prosodyScore > 50 ? '#f43f5e' : '#a78bfa', transition: 'width 0.3s ease' }} />
          </div>

          <div style={{ marginTop: '0.6rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {prosody.prosody_flags && prosody.prosody_flags.length > 0 ? (
              <span style={{ color: '#fca5a5' }}>⚠ {prosody.prosody_flags[0]}</span>
            ) : (
              <span style={{ color: '#10b981' }}>✓ Natural human pitch dynamics</span>
            )}
          </div>
        </div>

        {/* Signal 3: Speaker Biometric Verification */}
        <div style={{ background: '#0d1322', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#34d399' }}>
              <UserCheck size={15} />
              Speaker Biometric Match
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: speakerSim < 55 ? '#f43f5e' : '#10b981' }}>
              {Math.round(speakerSim)}% Match
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Enrolled: {speaker.claimed_identity || 'CFO Rahul Sharma'}
          </div>

          <div style={{ width: '100%', height: '5px', background: '#1f2937', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, Math.max(0, speakerSim))}%`, height: '100%', background: speakerSim < 55 ? '#f43f5e' : '#10b981', transition: 'width 0.3s ease' }} />
          </div>

          <div style={{ marginTop: '0.6rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {speakerSim >= 60 ? (
              <span style={{ color: '#10b981' }}>✓ Consistent with enrolled CFO voice</span>
            ) : (
              <span style={{ color: '#f87171' }}>⚠ IDENTITY MISMATCH DETECTED</span>
            )}
          </div>
        </div>

        {/* Signal 4: Conversational Scam Detection */}
        <div style={{ background: '#0d1322', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b' }}>
              <ShieldAlert size={15} />
              Conversational Scam Rules
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: scamScore > 40 ? '#f43f5e' : '#10b981' }}>
              {Math.round(scamScore)}% Trigger
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            NLP Scanners: Extortion, Urgency, Secrecy, OTP
          </div>

          <div style={{ width: '100%', height: '5px', background: '#1f2937', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, Math.max(0, scamScore))}%`, height: '100%', background: scamScore > 50 ? '#f43f5e' : '#f59e0b', transition: 'width 0.3s ease' }} />
          </div>

          <div style={{ marginTop: '0.6rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {scamScore > 40 ? (
              <span style={{ color: '#fca5a5' }}>⚠ Urgent social engineering patterns</span>
            ) : (
              <span style={{ color: '#10b981' }}>✓ No coercive extortion language</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
