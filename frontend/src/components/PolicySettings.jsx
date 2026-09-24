import React, { useState, useEffect } from 'react';
import { Sliders, Shield, Lock, FileCheck, Database, History, Check } from 'lucide-react';
import { BACKEND_URL } from '../config.js';

export default function PolicySettings({
  activePolicy = 'high_value_transfer',
  onPolicyChange,
  featureOnlyLogging = false,
  onToggleFeatureOnly
}) {
  const [policies, setPolicies] = useState({});
  const [selectedPolicy, setSelectedPolicy] = useState(activePolicy);
  const [privacyConfig, setPrivacyConfig] = useState({
    feature_only_logging: featureOnlyLogging,
    raw_audio_retention: false,
    edge_inference_support: true
  });
  const [incidents, setIncidents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('policy'); // 'policy', 'privacy', 'incidents'

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/policy/config`);
      if (res.ok) {
        const data = await res.json();
        setPolicies(data.policies || {});
        setSelectedPolicy(data.active_policy || activePolicy);
      }
      const privRes = await fetch(`${BACKEND_URL}/api/privacy/config`);
      if (privRes.ok) {
        const pdata = await privRes.json();
        setPrivacyConfig(pdata);
      }
    } catch (e) {
      console.error('Error loading policy config:', e);
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/incidents`);
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
      const ares = await fetch(`${BACKEND_URL}/api/audit`);
      if (ares.ok) {
        const adata = await ares.json();
        setAuditLogs(adata.audit_logs || []);
      }
    } catch (e) {
      console.error('Error fetching incidents:', e);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchIncidents();
  }, []);

  const handleSelectPolicy = async (pId) => {
    setSelectedPolicy(pId);
    if (onPolicyChange) onPolicyChange(pId);
    try {
      await fetch(`${BACKEND_URL}/api/policy/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policy_id: pId })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePrivacy = async (field) => {
    const updated = {
      ...privacyConfig,
      [field]: !privacyConfig[field]
    };
    setPrivacyConfig(updated);
    if (field === 'feature_only_logging' && onToggleFeatureOnly) {
      onToggleFeatureOnly(updated[field]);
    }
    try {
      await fetch(`${BACKEND_URL}/api/privacy/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} color="var(--accent-cyan)" />
            Enterprise Governance, Policy & Privacy Management
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Configurable risk thresholds, zero-retention privacy switches, and SOC audit trails
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('policy')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'policy' ? 'var(--accent-cyan)' : '#1f2937',
              color: activeTab === 'policy' ? '#0a0f1d' : '#9ca3af'
            }}
          >
            Policy Engine
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'privacy' ? 'var(--accent-cyan)' : '#1f2937',
              color: activeTab === 'privacy' ? '#0a0f1d' : '#9ca3af'
            }}
          >
            Privacy & Compliance
          </button>
          <button
            onClick={() => {
              setActiveTab('incidents');
              fetchIncidents();
            }}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'incidents' ? 'var(--accent-cyan)' : '#1f2937',
              color: activeTab === 'incidents' ? '#0a0f1d' : '#9ca3af'
            }}
          >
            SOC Incidents ({incidents.length})
          </button>
        </div>
      </div>

      {activeTab === 'policy' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {Object.keys(policies).map((pKey) => {
              const p = policies[pKey];
              const isSelected = selectedPolicy === pKey;
              return (
                <div
                  key={pKey}
                  onClick={() => handleSelectPolicy(pKey)}
                  style={{
                    background: isSelected ? 'rgba(6, 182, 212, 0.12)' : '#0d1322',
                    border: `1px solid ${isSelected ? '#06b6d4' : 'var(--border-card)'}`,
                    borderRadius: '10px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f3f4f6' }}>
                      {p.name}
                    </span>
                    {isSelected && <Check size={16} color="#06b6d4" />}
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                    {p.description}
                  </p>

                  <div style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                    <div>Caution: ≥ {p.thresholds.caution}%</div>
                    <div>High (Hold): ≥ {p.thresholds.high}%</div>
                    <div>Critical: ≥ {p.thresholds.critical}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div style={{ background: '#0d1322', borderRadius: '10px', padding: '1.25rem', border: '1px solid var(--border-card)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#f3f4f6' }}>
            Data Minimization & Compliance Controls (India DPDP Act / GDPR)
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Control 1: Feature-Only Logging */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-card)' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6' }}>
                  Feature-Only Logging (Zero Raw Text Retention)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Only stores acoustic embedding vectors and mathematical risk metrics in DB; redacts spoken transcripts.
                </div>
              </div>
              <button
                onClick={() => handleTogglePrivacy('feature_only_logging')}
                style={{
                  padding: '0.35rem 0.9rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: privacyConfig.feature_only_logging ? '#10b981' : '#374151',
                  color: '#fff'
                }}
              >
                {privacyConfig.feature_only_logging ? 'ACTIVE (ENFORCED)' : 'DISABLED'}
              </button>
            </div>

            {/* Control 2: Raw Audio Retention */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-card)' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6' }}>
                  Raw Audio File Retention
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Permanently disabled. Incoming chunks reside only in ephemeral RAM buffer for inference and are discarded immediately.
                </div>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid #10b98140'
              }}>
                OFF (EPHEMERAL ONLY)
              </span>
            </div>

            {/* Control 3: Edge Inference Mode */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6' }}>
                  Edge Inference & Telecom Gateway Architecture
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Stateless model inference worker architecture compatible with banking on-premise DMZ & telecom nodes.
                </div>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#06b6d4',
                background: 'rgba(6, 182, 212, 0.15)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid #06b6d440'
              }}>
                READY
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'incidents' && (
        <div style={{ background: '#0d1322', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border-card)' }}>
          {incidents.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
              No security incidents created yet. High-risk calls or held transactions will be logged here.
            </div>
          ) : (
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {incidents.map((inc) => (
                <div
                  key={inc.incident_id}
                  style={{
                    background: '#111827',
                    border: '1px solid var(--border-card)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#f43f5e', fontFamily: 'JetBrains Mono' }}>
                        {inc.incident_id}
                      </span>
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: '#f43f5e20', color: '#fca5a5' }}>
                        Risk: {Math.round(inc.risk_score)}%
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                        Status: <strong style={{ color: inc.resolution_status === 'INVESTIGATING' ? '#f59e0b' : '#10b981' }}>{inc.resolution_status}</strong>
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#e5e7eb', marginTop: '0.2rem' }}>
                      Target: {inc.claimed_identity} ({inc.caller_number}) | Exposure: ₹{Number(inc.transaction_amount || 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Action: {inc.action_taken}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
