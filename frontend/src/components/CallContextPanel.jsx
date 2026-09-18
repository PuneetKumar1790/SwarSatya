import React, { useState } from 'react';
import { UserCheck, PhoneCall, AlertTriangle, Building2, IndianRupee, Globe } from 'lucide-react';

export default function CallContextPanel({
  callerNumber = '+91-91234-56789',
  claimedIdentity = 'Rahul Sharma (CFO)',
  registeredNumber = '+91-98110-45291',
  transactionAmount = 2500000,
  actionType = 'Urgent Fund Transfer',
  detectedLanguage = 'en',
  onUpdateContext
}) {
  const isRegistered = callerNumber === registeredNumber;

  const [isEditing, setIsEditing] = useState(false);
  const [tempNumber, setTempNumber] = useState(callerNumber);
  const [tempAmount, setTempAmount] = useState(transactionAmount);

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdateContext) {
      onUpdateContext({
        caller_number: tempNumber,
        transaction_amount: Number(tempAmount)
      });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
            Call Context & Enterprise Identity Enrichment
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.7rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            backgroundColor: isRegistered ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: isRegistered ? '#10b981' : '#f87171',
            border: `1px solid ${isRegistered ? '#10b98140' : '#f8717140'}`
          }}>
            {isRegistered ? <UserCheck size={12} /> : <AlertTriangle size={12} />}
            {isRegistered ? 'REGISTERED CORPORATE LINE' : 'ORIGIN MISMATCH / UNREGISTERED'}
          </span>

          <button
            onClick={() => {
              if (isEditing) handleSave();
              else setIsEditing(true);
            }}
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              background: '#1f2937',
              color: '#9ca3af',
              border: '1px solid var(--border-card)',
              cursor: 'pointer'
            }}
          >
            {isEditing ? 'Save Context' : 'Edit Stakes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {/* Claimed Identity Card */}
        <div style={{ background: '#0d1322', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            Claimed Executive Identity
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f3f4f6' }}>
            {claimedIdentity}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#06b6d4', marginTop: '0.2rem' }}>
            Registered Line: {registeredNumber}
          </div>
        </div>

        {/* Caller Number */}
        <div style={{ background: '#0d1322', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            Incoming Caller ID (VoIP/Tel)
          </div>
          {isEditing ? (
            <input
              type="text"
              value={tempNumber}
              onChange={(e) => setTempNumber(e.target.value)}
              style={{
                width: '100%',
                background: '#111827',
                border: '1px solid #06b6d4',
                color: '#fff',
                padding: '0.2rem 0.4rem',
                fontSize: '0.8rem',
                borderRadius: '4px'
              }}
            />
          ) : (
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isRegistered ? '#10b981' : '#f87171' }}>
              {callerNumber}
            </div>
          )}
          <div style={{ fontSize: '0.7rem', color: isRegistered ? '#9ca3af' : '#ef4444', marginTop: '0.2rem' }}>
            {isRegistered ? 'Verified Corporate Gateway' : 'EXTERNAL / SPOOFED ORIGIN'}
          </div>
        </div>

        {/* Transaction Stakes */}
        <div style={{ background: '#0d1322', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            Requested Action Stakes
          </div>
          {isEditing ? (
            <input
              type="number"
              value={tempAmount}
              onChange={(e) => setTempAmount(e.target.value)}
              style={{
                width: '100%',
                background: '#111827',
                border: '1px solid #06b6d4',
                color: '#fff',
                padding: '0.2rem 0.4rem',
                fontSize: '0.8rem',
                borderRadius: '4px'
              }}
            />
          ) : (
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>
              ₹ {Number(transactionAmount).toLocaleString('en-IN')}
            </div>
          )}
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Workflow: {actionType}
          </div>
        </div>

        {/* Multilingual / Accent Info */}
        <div style={{ background: '#0d1322', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            <Globe size={12} color="#06b6d4" />
            <span>Language & Dialect Robustness</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
            {detectedLanguage === 'hi' ? 'Hindi (Regional Dialect / Hinglish)' :
             detectedLanguage === 'en' ? 'Indian English (Accent-Aware)' : 'Multilingual Auto-Detect'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.2rem' }}>
            faster-whisper int8 CPU Active
          </div>
        </div>
      </div>
    </div>
  );
}
