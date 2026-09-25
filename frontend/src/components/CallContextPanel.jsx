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
          <Building2 size={17} color="#818cf8" />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
            Call Context & Enterprise Identity Enrichment
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.68rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: isRegistered ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
            color: isRegistered ? '#34d399' : '#fda4af',
            border: `1px solid ${isRegistered ? 'rgba(52, 211, 153, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`
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
              fontSize: '0.74rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '5px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.15s ease'
            }}
          >
            {isEditing ? 'Save Context' : 'Edit Stakes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {/* Claimed Identity Card */}
        <div style={{ background: 'rgba(15, 23, 42, 0.55)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
            Claimed Executive Identity
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
            {claimedIdentity}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#818cf8', marginTop: '0.2rem' }}>
            Registered Line: {registeredNumber}
          </div>
        </div>

        {/* Caller Number */}
        <div style={{ background: 'rgba(15, 23, 42, 0.55)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
            Incoming Caller ID (VoIP/Tel)
          </div>
          {isEditing ? (
            <input
              type="text"
              value={tempNumber}
              onChange={(e) => setTempNumber(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid #6366f1',
                color: '#fff',
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                borderRadius: '4px'
              }}
            />
          ) : (
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isRegistered ? '#34d399' : '#fda4af' }}>
              {callerNumber}
            </div>
          )}
          <div style={{ fontSize: '0.7rem', color: isRegistered ? '#94a3b8' : '#f87171', marginTop: '0.2rem' }}>
            {isRegistered ? 'Verified Corporate Gateway' : 'EXTERNAL / SPOOFED ORIGIN'}
          </div>
        </div>

        {/* Transaction Stakes */}
        <div style={{ background: 'rgba(15, 23, 42, 0.55)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
            Requested Action Stakes
          </div>
          {isEditing ? (
            <input
              type="number"
              value={tempAmount}
              onChange={(e) => setTempAmount(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid #6366f1',
                color: '#fff',
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                borderRadius: '4px'
              }}
            />
          ) : (
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'JetBrains Mono' }}>
              ₹ {Number(transactionAmount).toLocaleString('en-IN')}
            </div>
          )}
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Workflow: {actionType}
          </div>
        </div>

        {/* Multilingual / Accent Info */}
        <div style={{ background: 'rgba(15, 23, 42, 0.55)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
            <Globe size={12} color="#818cf8" />
            <span>Language & Dialect</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>
            {detectedLanguage === 'hi' ? 'Hindi (Regional Dialect / Hinglish)' :
             detectedLanguage === 'en' ? 'Indian English (Accent-Aware)' : 'Multilingual Auto-Detect'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: '0.2rem' }}>
            faster-whisper int8 CPU Active
          </div>
        </div>
      </div>
    </div>
  );
}
