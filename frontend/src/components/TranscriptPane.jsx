import React, { useRef, useEffect } from 'react';
import { FileText, AlertCircle } from 'lucide-react';

export default function TranscriptPane({
  transcript = '',
  detectedPatterns = []
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="var(--accent-cyan)" />
          Live Rolling Transcript (faster-whisper)
        </h3>
        {detectedPatterns.length > 0 && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <AlertCircle size={12} />
            {detectedPatterns.length} scam trigger{detectedPatterns.length > 1 ? 's' : ''} flagged
          </span>
        )}
      </div>

      {detectedPatterns.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginBottom: '0.75rem',
          padding: '0.5rem',
          background: '#0d1322',
          borderRadius: '6px',
          border: '1px solid var(--border-card)'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Flagged Signals:</span>
          {detectedPatterns.map((pat, idx) => (
            <span key={idx} style={{
              fontSize: '0.7rem',
              backgroundColor: '#ef444420',
              color: '#fca5a5',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              fontFamily: 'JetBrains Mono'
            }}>
              {pat}
            </span>
          ))}
        </div>
      )}

      <div
        ref={scrollRef}
        style={{
          minHeight: '100px',
          maxHeight: '180px',
          overflowY: 'auto',
          backgroundColor: '#0d1322',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid var(--border-card)',
          fontSize: '0.85rem',
          lineHeight: '1.6',
          color: transcript ? 'var(--text-primary)' : 'var(--text-muted)',
          fontStyle: transcript ? 'normal' : 'italic'
        }}
      >
        {transcript || "Waiting for audio speech to transcribe (Hindi, Hinglish, English supported)..."}
      </div>
    </div>
  );
}
