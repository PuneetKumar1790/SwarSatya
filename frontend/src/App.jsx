import React, { useState, useEffect, useRef } from 'react';
import { Shield, Wifi, WifiOff, Terminal, Zap, Clock, Cpu, Volume2, RefreshCw } from 'lucide-react';
import CallRoom from './components/CallRoom.jsx';
import DemoController from './components/DemoController.jsx';
import RiskMeter from './components/RiskMeter.jsx';
import RiskTimeline from './components/RiskTimeline.jsx';
import AlertPanel from './components/AlertPanel.jsx';
import TranscriptPane from './components/TranscriptPane.jsx';

export default function App() {
  const [roomId, setRoomId] = useState('satya-room-1');
  const [backendHealthy, setBackendHealthy] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);

  // Risk States
  const [syntheticRisk, setSyntheticRisk] = useState(0);
  const [scamRisk, setScamRisk] = useState(0);
  const [overallRisk, setOverallRisk] = useState(0);
  const [threatTier, setThreatTier] = useState('LOW');
  const [recommendedAction, setRecommendedAction] = useState('Normal conversation. No threat detected.');
  const [transcript, setTranscript] = useState('');
  const [detectedPatterns, setDetectedPatterns] = useState([]);
  const [riskHistory, setRiskHistory] = useState([]);
  const [lastLatencyMs, setLastLatencyMs] = useState(null);

  // Demo Mode State
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [activeDemoScenario, setActiveDemoScenario] = useState(null);

  // Inspector Logs
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'inspector'

  const wsRef = useRef(null);

  const addLog = (direction, msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, direction, msg }, ...prev.slice(0, 49)]);
  };

  // Health check
  const checkHealth = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/health');
      if (res.ok) {
        const data = await res.json();
        setBackendHealthy(true);
        if (data.models_loaded) {
          setModelsReady(data.models_loaded.deepfake || data.models_loaded.asr);
        }
      } else {
        setBackendHealthy(false);
      }
    } catch (err) {
      setBackendHealthy(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  const signalingHandlerRef = useRef(null);
  const pendingDemoRef = useRef(null);

  // WebSocket Connection with automatic reconnection & IPv4 fallback
  const connectWebSocket = () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const host = window.location.hostname === 'localhost' ? '127.0.0.1' : (window.location.hostname || '127.0.0.1');
    const wsUrl = `ws://${host}:8000/ws/call/${roomId}`;
    addLog('SYSTEM', `Connecting WebSocket to ${wsUrl}...`);
    
    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
        addLog('SYSTEM', `WebSocket connected to room '${roomId}'`);

        // Send any queued demo requests
        if (pendingDemoRef.current) {
          ws.send(JSON.stringify(pendingDemoRef.current));
          addLog('SENT', `Dispatched queued demo: ${pendingDemoRef.current.scenario}`);
          pendingDemoRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'risk_update') {
            setSyntheticRisk(data.synthetic_risk || 0);
            setScamRisk(data.scam_risk || 0);
            setOverallRisk(data.overall_risk || 0);
            setThreatTier(data.threat_tier || 'LOW');
            setRecommendedAction(data.recommended_action || '');
            setLastLatencyMs(data.processing_latency_ms || null);

            if (data.transcript_snippet) {
              setTranscript((prev) => (prev ? `${prev} ${data.transcript_snippet}` : data.transcript_snippet));
            }
            if (data.detected_patterns) {
              setDetectedPatterns(data.detected_patterns);
            }

            setRiskHistory((prev) => [
              ...prev,
              {
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                overall: data.overall_risk || 0,
                synthetic: data.synthetic_risk || 0,
                scam: data.scam_risk || 0
              }
            ]);
            addLog('RISK', `Update: Overall=${data.overall_risk} (${data.threat_tier}), Synth=${data.synthetic_risk}%, Scam=${data.scam_risk}%`);
          } else if (data.type === 'demo_completed') {
            setIsPlayingDemo(false);
            setActiveDemoScenario(null);
            addLog('SYSTEM', `Demo playback finished.`);
          } else if (data.type === 'demo_stopped') {
            setIsPlayingDemo(false);
            setActiveDemoScenario(null);
          } else if (['offer', 'answer', 'candidate', 'user-joined', 'user-left'].includes(data.type)) {
            // Forward signaling messages to CallRoom
            if (signalingHandlerRef.current) {
              signalingHandlerRef.current(data);
            }
            addLog('SIGNAL', `${data.type} received`);
          } else {
            addLog('RECV', JSON.stringify(data));
          }
        } catch (err) {
          addLog('RECV', event.data);
        }
      };

      ws.onerror = (err) => {
        setWsConnected(false);
        addLog('ERROR', 'WebSocket error. Reconnecting...');
      };

      ws.onclose = () => {
        setWsConnected(false);
        addLog('SYSTEM', 'WebSocket disconnected. Will reconnect.');
        wsRef.current = null;
      };

      wsRef.current = ws;
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
    }
  };

  // Keep WebSocket automatically connected with heartbeat
  useEffect(() => {
    connectWebSocket();
    const reconnectTimer = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        connectWebSocket();
      }
    }, 2000);
    return () => clearInterval(reconnectTimer);
  }, [roomId]);

  // Demo Mode Handlers - non-blocking auto-dispatch
  const handleStartDemo = (scenarioId) => {
    setTranscript('');
    setDetectedPatterns([]);
    setRiskHistory([]);
    setActiveDemoScenario(scenarioId);
    setIsPlayingDemo(true);

    const payload = {
      type: 'start_demo',
      room_id: roomId,
      scenario: scenarioId
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      addLog('SENT', `Triggered Demo Mode: ${scenarioId}`);
    } else {
      // Queue payload and connect immediately
      pendingDemoRef.current = payload;
      connectWebSocket();
      addLog('SYSTEM', `Reconnecting WebSocket and queueing demo: ${scenarioId}`);
    }
  };

  const handleStopDemo = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'stop_demo',
        room_id: roomId
      }));
    }
    setIsPlayingDemo(false);
    setActiveDemoScenario(null);
  };

  const resetMetrics = () => {
    setSyntheticRisk(0);
    setScamRisk(0);
    setOverallRisk(0);
    setThreatTier('LOW');
    setRecommendedAction('Normal conversation. No threat detected.');
    setTranscript('');
    setDetectedPatterns([]);
    setRiskHistory([]);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Top Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-card)',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
            padding: '0.65rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <Shield size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>SwarSatya</h1>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                स्वर सत्य • SIH #26104
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Real-Time AI Voice Cloning & Impersonation Scam Defense Pipeline
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: backendHealthy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: backendHealthy ? '#10b981' : '#f87171',
            border: `1px solid ${backendHealthy ? '#10b98140' : '#f8717140'}`
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: backendHealthy ? '#10b981' : '#f87171' }} />
            API: {backendHealthy ? 'ONLINE' : 'OFFLINE'}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: wsConnected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(107, 114, 128, 0.15)',
            color: wsConnected ? '#06b6d4' : '#9ca3af',
            border: `1px solid ${wsConnected ? '#06b6d440' : '#4b556340'}`
          }}>
            {wsConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
            STREAM: {wsConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </div>

          {lastLatencyMs !== null && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              background: '#0d1322',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-card)'
            }}>
              <Clock size={13} color="#06b6d4" />
              <span>Latency: {lastLatencyMs} ms</span>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'dashboard' ? 'var(--accent-cyan)' : '#1f2937',
              color: activeTab === 'dashboard' ? '#0a0f1d' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Shield size={15} />
            Live Defense Dashboard
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'inspector' ? 'var(--accent-cyan)' : '#1f2937',
              color: activeTab === 'inspector' ? '#0a0f1d' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Terminal size={15} />
            Packet Inspector ({logs.length})
          </button>
        </div>

        <button
          onClick={resetMetrics}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'transparent',
            border: '1px solid var(--border-card)',
            color: 'var(--text-secondary)',
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={13} />
          Reset Dashboard
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div>
          {/* Prominent Alert Banner */}
          <AlertPanel
            threatTier={threatTier}
            recommendedAction={recommendedAction}
          />

          {/* WebRTC Live Call Room */}
          <CallRoom
            roomId={roomId}
            setRoomId={setRoomId}
            wsRef={wsRef}
            onRiskUpdate={setOverallRisk}
            onRegisterSignaling={(cb) => { signalingHandlerRef.current = cb; }}
          />

          {/* Demo Fallback Player */}
          <DemoController
            activeScenario={activeDemoScenario}
            onStartDemo={handleStartDemo}
            onStopDemo={handleStopDemo}
            isPlaying={isPlayingDemo}
          />

          {/* 3-Way Threat Meter */}
          <RiskMeter
            syntheticRisk={syntheticRisk}
            scamRisk={scamRisk}
            overallRisk={overallRisk}
            threatTier={threatTier}
          />

          {/* Real-Time Progression Timeline Graph */}
          <RiskTimeline history={riskHistory} />

          {/* Live Transcript Pane */}
          <TranscriptPane
            transcript={transcript}
            detectedPatterns={detectedPatterns}
          />
        </div>
      )}

      {activeTab === 'inspector' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={18} color="var(--accent-cyan)" />
            Live Packet & Signal Inspector
          </h3>
          <div style={{
            background: '#070b14',
            borderRadius: '8px',
            border: '1px solid var(--border-card)',
            padding: '1rem',
            minHeight: '350px',
            maxHeight: '500px',
            overflowY: 'auto'
          }}>
            {logs.map((log, idx) => (
              <div key={idx} style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', marginBottom: '0.4rem', display: 'flex', gap: '0.6rem' }}>
                <span style={{ color: '#6b7280' }}>[{log.timestamp}]</span>
                <span style={{
                  fontWeight: 700,
                  color: log.direction === 'SENT' ? '#38bdf8' :
                         log.direction === 'RISK' ? '#f43f5e' :
                         log.direction === 'RECV' ? '#34d399' :
                         log.direction === 'ERROR' ? '#ef4444' : '#f59e0b'
                }}>
                  {log.direction}:
                </span>
                <span style={{ color: '#e5e7eb', wordBreak: 'break-all' }}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
