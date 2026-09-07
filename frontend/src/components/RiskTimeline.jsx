import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function RiskTimeline({ history = [] }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} color="var(--accent-cyan)" />
          Risk Progression Timeline
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Updated per 3-5s audio chunk
        </span>
      </div>

      <div style={{ width: '100%', height: 220 }}>
        {history.length === 0 ? (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}>
            No audio chunks analyzed yet. Join a call or start Demo Mode to view risk timeline.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" stroke="#4b5563" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#4b5563" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  fontSize: '0.8rem'
                }}
              />
              <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Caution', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={85} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Critical', fill: '#f43f5e', fontSize: 10 }} />
              <Line type="monotone" dataKey="overall" stroke="#f43f5e" strokeWidth={3} dot={false} name="Overall Risk" />
              <Line type="monotone" dataKey="synthetic" stroke="#06b6d4" strokeWidth={1.5} dot={false} name="Synthetic Voice" />
              <Line type="monotone" dataKey="scam" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Scam Pattern" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
