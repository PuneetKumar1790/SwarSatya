import React, { useState, useEffect } from 'react';
import { MessageSquarePlus, Send, RefreshCw, CheckCircle, AlertTriangle, ShieldAlert, UserCheck, Ban } from 'lucide-react';

export default function FeedbackForum({
  isOpen,
  onClose,
  roomId = 'satya-room-1',
  callerNumber = '+91-91234-56789',
  claimedIdentity = 'Rahul Sharma (CFO)',
  overallRisk = 85,
  threatTier = 'HIGH'
}) {
  const [userVerdict, setUserVerdict] = useState('CONFIRMED_SCAM');
  const [actionRequested, setActionRequested] = useState('BLACKLIST_VOICE');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFeedback();
      setSubmittedStatus(null);
    }
  }, [isOpen]);

  const loadFeedback = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('http://localhost:8000/api/feedback');
      if (res.ok) {
        const data = await res.json();
        setFeedbackList(data.feedback || []);
      }
    } catch (e) {
      console.error('Failed to load feedback:', e);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          user_verdict: userVerdict,
          action_requested: actionRequested,
          comments: comments
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSubmittedStatus(`Feedback successfully logged (${data.feedback_id}). Retraining pipeline scheduled.`);
        setComments('');
        loadFeedback();
      } else {
        setSubmittedStatus('Error submitting feedback. Please try again.');
      }
    } catch (err) {
      setSubmittedStatus('Network error while submitting feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: '#0d1322',
        border: '1px solid var(--border-card)',
        borderRadius: '14px',
        width: '100%',
        maxWidth: '780px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '1.75rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '0.5rem', borderRadius: '8px' }}>
              <MessageSquarePlus size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#f3f4f6' }}>
                Continuous Learning & Feedback Forum
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Human-in-the-loop retraining: Report false positives, confirm impersonation, and update voice biometrics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Active Call Summary Bar */}
        <div style={{
          background: '#111827',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '1px solid #1f2937',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CALL SESSION DETAILS:</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f3f4f6' }}>
              {callerNumber} • {claimedIdentity}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PREDICTED THREAT:</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: threatTier === 'CRITICAL' || threatTier === 'HIGH' ? '#f43f5e' : '#34d399' }}>
                {overallRisk}% ({threatTier})
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ROOM ID:</div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'JetBrains Mono', color: '#38bdf8' }}>
                {roomId}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Submission Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Verdict Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#e5e7eb', marginBottom: '0.4rem' }}>
                User / SOC Analyst Ground Truth Verdict:
              </label>
              <select
                value={userVerdict}
                onChange={(e) => setUserVerdict(e.target.value)}
                style={{
                  width: '100%',
                  background: '#070b14',
                  border: '1px solid var(--border-card)',
                  borderRadius: '6px',
                  padding: '0.55rem',
                  color: '#fff',
                  fontSize: '0.8rem'
                }}
              >
                <option value="CONFIRMED_SCAM">🚨 Confirmed Impersonation / Fraud</option>
                <option value="FALSE_POSITIVE">✅ False Alarm (Legitimate Speaker)</option>
                <option value="INCONCLUSIVE">❓ Inconclusive / Needs Escalation</option>
              </select>
            </div>

            {/* Model Action / Retraining Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#e5e7eb', marginBottom: '0.4rem' }}>
                Autonomous Feedback Action:
              </label>
              <select
                value={actionRequested}
                onChange={(e) => setActionRequested(e.target.value)}
                style={{
                  width: '100%',
                  background: '#070b14',
                  border: '1px solid var(--border-card)',
                  borderRadius: '6px',
                  padding: '0.55rem',
                  color: '#fff',
                  fontSize: '0.8rem'
                }}
              >
                <option value="BLACKLIST_VOICE">🚫 Blacklist Voice Biometric Signature</option>
                <option value="ADD_TO_GENUINE_PROFILE">👤 Add to Genuine Speaker Voice Profile</option>
                <option value="LOG_ONLY">📝 Log for Offline Calibration & Auditing</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#e5e7eb', marginBottom: '0.4rem' }}>
              Forensic Comments & Context (Why was this flagged / unflagged?):
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g., Synthetic cadence observed during urgent transfer request, but CFO verified via corporate WhatsApp..."
              style={{
                width: '100%',
                background: '#070b14',
                border: '1px solid var(--border-card)',
                borderRadius: '6px',
                padding: '0.6rem',
                color: '#e5e7eb',
                fontSize: '0.78rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {submittedStatus && (
            <div style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              marginBottom: '1rem',
              background: submittedStatus.includes('successfully') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: submittedStatus.includes('successfully') ? '#10b981' : '#f87171',
              border: `1px solid ${submittedStatus.includes('successfully') ? '#10b98140' : '#f8717140'}`
            }}>
              {submittedStatus}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={14} />
              {submitting ? 'Submitting...' : 'Submit Model Feedback'}
            </button>
          </div>
        </form>

        {/* Existing Feedback History */}
        <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: '#9ca3af' }}>
              Recent Human Feedback Audit Log ({feedbackList.length})
            </h4>
            <button
              type="button"
              onClick={loadFeedback}
              disabled={loadingList}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'transparent',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={12} className={loadingList ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {feedbackList.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                No feedback entries submitted yet.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1f2937', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.4rem' }}>ID</th>
                    <th style={{ padding: '0.4rem' }}>Caller / Role</th>
                    <th style={{ padding: '0.4rem' }}>Verdict</th>
                    <th style={{ padding: '0.4rem' }}>Action</th>
                    <th style={{ padding: '0.4rem' }}>Original Risk</th>
                    <th style={{ padding: '0.4rem' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.map((fb, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #111827' }}>
                      <td style={{ padding: '0.4rem', fontFamily: 'JetBrains Mono', color: '#38bdf8' }}>{fb.feedback_id}</td>
                      <td style={{ padding: '0.4rem', color: '#e5e7eb' }}>{fb.claimed_identity || fb.caller_number || 'Unknown'}</td>
                      <td style={{ padding: '0.4rem' }}>
                        <span style={{
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: fb.user_verdict === 'CONFIRMED_SCAM' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: fb.user_verdict === 'CONFIRMED_SCAM' ? '#f87171' : '#34d399'
                        }}>
                          {fb.user_verdict}
                        </span>
                      </td>
                      <td style={{ padding: '0.4rem', color: '#9ca3af' }}>{fb.action_requested}</td>
                      <td style={{ padding: '0.4rem', fontWeight: 700, color: fb.original_risk > 70 ? '#f43f5e' : '#34d399' }}>
                        {fb.original_risk?.toFixed(1)}%
                      </td>
                      <td style={{ padding: '0.4rem', color: '#9ca3af', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {fb.comments || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
