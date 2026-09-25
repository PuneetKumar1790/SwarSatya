import React, { useState, useEffect, useRef } from 'react';
import { Shield, Wifi, WifiOff, Terminal, Zap, Clock, Cpu, RefreshCw, Sliders, IndianRupee, KeyRound, Scale, MessageSquarePlus } from 'lucide-react';
import CallRoom from './components/CallRoom.jsx';
import DemoController from './components/DemoController.jsx';
import RiskMeter from './components/RiskMeter.jsx';
import RiskTimeline from './components/RiskTimeline.jsx';
import AlertPanel from './components/AlertPanel.jsx';
import TranscriptPane from './components/TranscriptPane.jsx';
import CallContextPanel from './components/CallContextPanel.jsx';
import MultiSignalRadar from './components/MultiSignalRadar.jsx';
import TransactionModal from './components/TransactionModal.jsx';
import SecondaryVerify from './components/SecondaryVerify.jsx';
import PolicySettings from './components/PolicySettings.jsx';
import ScamCopilotCard from './components/ScamCopilotCard.jsx';
import LegalHelpdesk from './components/LegalHelpdesk.jsx';
import FeedbackForum from './components/FeedbackForum.jsx';
import { BACKEND_URL, getWsUrl, CLOUD_BACKEND_URL } from './config.js';

export default function App() {
  const [roomId, setRoomId] = useState('satya-room-1');
  const [backendHealthy, setBackendHealthy] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(false);

  // Multi-layer Risk States
  const [syntheticRisk, setSyntheticRisk] = useState(0);
  const [spectralRisk, setSpectralRisk] = useState(0);
  const [prosodyRisk, setProsodyRisk] = useState(0);
  const [speakerSimilarity, setSpeakerSimilarity] = useState(100);
  const [contextRisk, setContextRisk] = useState(0);
  const [scamRisk, setScamRisk] = useState(0);
  const [overallRisk, setOverallRisk] = useState(0);
  const [threatTier, setThreatTier] = useState('LOW');
  const [actionCode, setActionCode] = useState('ALLOW');
  const [recommendedAction, setRecommendedAction] = useState('Normal conversation. No threat detected.');
  const [requiresHold, setRequiresHold] = useState(false);
  const [transactionHeld, setTransactionHeld] = useState(false);
  const [activeIncidentId, setActiveIncidentId] = useState(null);

  // Fine-grained Telemetry & Breakdown
  const [layerBreakdown, setLayerBreakdown] = useState({});
  const [telemetry, setTelemetry] = useState({});
  const [transcript, setTranscript] = useState('');
  const [detectedPatterns, setDetectedPatterns] = useState([]);
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const [riskHistory, setRiskHistory] = useState([]);
  const [lastLatencyMs, setLastLatencyMs] = useState(null);

  // Context State
  const [callerNumber, setCallerNumber] = useState('+91-91234-56789');
  const [claimedIdentity, setClaimedIdentity] = useState('Rahul Sharma (CFO)');
  const [registeredNumber, setRegisteredNumber] = useState('+91-98110-45291');
  const [transactionAmount, setTransactionAmount] = useState(2500000);
  const [actionType, setActionType] = useState('Urgent Fund Transfer');

  // Interactive Modals & Copilot Guidance
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [verifyMode, setVerifyMode] = useState('mfa');
  const [defenseCopilot, setDefenseCopilot] = useState({});

  // Demo Mode State
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [activeDemoScenario, setActiveDemoScenario] = useState(null);

  // Tabs & Privacy Settings
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'governance', 'inspector'
  const [featureOnlyLogging, setFeatureOnlyLogging] = useState(false);
  const [logs, setLogs] = useState([]);

  const wsRef = useRef(null);

  const addLog = (direction, msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, direction, msg }, ...prev.slice(0, 49)]);
  };

  // Health check
  const checkHealth = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setBackendHealthy(true);
        if (data.models_loaded) {
          setModelsReady(data.models_loaded.deepfake || data.models_loaded.asr || data.models_loaded.speaker_biometrics);
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

  // WebSocket Connection
  const connectWebSocket = () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = getWsUrl(roomId);
    addLog('SYSTEM', `Connecting WebSocket to ${wsUrl}...`);

    try {
      const ws = new WebSocket(wsUrl);


      ws.onopen = () => {
        setWsConnected(true);
        addLog('SYSTEM', `WebSocket connected to room '${roomId}'`);

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
            setIsStreamActive(true);
            setOverallRisk(data.overall_risk || 0);
            setThreatTier(data.threat_tier || 'LOW');
            setActionCode(data.action_code || 'ALLOW');
            setRecommendedAction(data.recommended_action || '');
            setRequiresHold(data.requires_hold || false);
            setTransactionHeld(data.transaction_held || false);
            if (data.active_incident_id) {
              setActiveIncidentId(data.active_incident_id);
            }

            if (data.layer_breakdown) {
              setLayerBreakdown(data.layer_breakdown);
              setSyntheticRisk(data.layer_breakdown.synthetic_model || 0);
              setSpectralRisk(data.layer_breakdown.spectral_phase || 0);
              setProsodyRisk(data.layer_breakdown.prosody_behavior || 0);
              const spkMis = data.layer_breakdown.speaker_mismatch || 0;
              setSpeakerSimilarity(Math.max(0, 100 - spkMis));
              setContextRisk(data.layer_breakdown.context_stakes || 0);
              setScamRisk(data.layer_breakdown.conversational_scam || 0);
            }

            if (data.telemetry) {
              setTelemetry(data.telemetry);
              if (data.telemetry.speaker && data.telemetry.speaker.claimed_identity) {
                setClaimedIdentity(data.telemetry.speaker.claimed_identity);
              }
              if (data.telemetry.context) {
                if (data.telemetry.context.caller_number) setCallerNumber(data.telemetry.context.caller_number);
                if (data.telemetry.context.transaction_amount) setTransactionAmount(data.telemetry.context.transaction_amount);
              }
            }

            if (data.detected_language) {
              setDetectedLanguage(data.detected_language);
            }

            setLastLatencyMs(data.processing_latency_ms || null);

            if (data.transcript_snippet) {
              setTranscript((prev) => (prev ? `${prev} ${data.transcript_snippet}` : data.transcript_snippet));
            }
            if (data.detected_patterns) {
              setDetectedPatterns(data.detected_patterns);
            }
            if (data.defense_copilot) {
              setDefenseCopilot(data.defense_copilot);
            }

            setRiskHistory((prev) => [
              ...prev,
              {
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                overall: data.overall_risk || 0,
                synthetic: (data.layer_breakdown && data.layer_breakdown.synthetic_model) || 0,
                scam: (data.layer_breakdown && data.layer_breakdown.conversational_scam) || 0
              }
            ]);
            addLog('RISK', `Update: Overall=${data.overall_risk} (${data.threat_tier}) | Policy: ${data.action_code}`);
          } else if (data.type === 'demo_completed') {
            setIsPlayingDemo(false);
            setActiveDemoScenario(null);
            addLog('SYSTEM', `Demo playback finished.`);
          } else if (data.type === 'demo_stopped') {
            setIsPlayingDemo(false);
            setActiveDemoScenario(null);
          } else if (['offer', 'answer', 'candidate', 'user-joined', 'user-left'].includes(data.type)) {
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

      ws.onerror = () => {
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

  useEffect(() => {
    connectWebSocket();
    const reconnectTimer = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        connectWebSocket();
      }
    }, 2000);
    return () => clearInterval(reconnectTimer);
  }, [roomId]);

  // Update Call Context
  const handleUpdateContext = async (newContext) => {
    if (newContext.caller_number) setCallerNumber(newContext.caller_number);
    if (newContext.transaction_amount !== undefined) setTransactionAmount(newContext.transaction_amount);

    try {
      await fetch(`${BACKEND_URL}/api/context/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          ...newContext
        })
      });
      addLog('CONTEXT', `Updated: ${JSON.stringify(newContext)}`);
    } catch (e) {
      console.error(e);
    }
  };

  // Demo Trigger Handlers
  const handleStartDemo = (scenarioId) => {
    setTranscript('');
    setDetectedPatterns([]);
    setRiskHistory([]);
    setActiveDemoScenario(scenarioId);
    setIsPlayingDemo(true);
    setIsStreamActive(true);

    const payload = {
      type: 'start_demo',
      room_id: roomId,
      scenario: scenarioId
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      addLog('SENT', `Triggered Demo Mode: ${scenarioId}`);
    } else {
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
    setIsStreamActive(false);
  };

  const resetMetrics = () => {
    setIsStreamActive(false);
    setSyntheticRisk(0);
    setSpectralRisk(0);
    setProsodyRisk(0);
    setSpeakerSimilarity(100);
    setContextRisk(0);
    setScamRisk(0);
    setOverallRisk(0);
    setThreatTier('LOW');
    setActionCode('ALLOW');
    setRecommendedAction('Normal conversation. No threat detected.');
    setRequiresHold(false);
    setTransactionHeld(false);
    setActiveIncidentId(null);
    setTranscript('');
    setDetectedPatterns([]);
    setRiskHistory([]);
    setLayerBreakdown({});
    setTelemetry({});
    setDefenseCopilot({});
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '1.25rem' }}>
      {/* Top Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-card)',
        marginBottom: '1.25rem',
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
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                स्वर सत्य • Voice Security Operations Center (SIH #26104)
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Multi-Layer Real-Time Voice Biometric & Impersonation Scam Defense Platform
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
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }} title={`Connected to: ${BACKEND_URL}`}>
            <Zap size={13} color="#60a5fa" />
            HF ZERO-GPU: {BACKEND_URL.includes('hf.space') ? 'CLOUD (A10G)' : 'LOCAL'}
          </div>

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
            ML CORE: {backendHealthy ? 'ACTIVE (MULTI-LAYER)' : 'OFFLINE'}
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
              <span>Pipeline: {lastLatencyMs} ms</span>
            </div>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'dashboard' ? 'var(--accent-cyan)' : '#1f2937',
              color: activeTab === 'dashboard' ? '#0a0f1d' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Shield size={15} />
            Live Voice SOC
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'governance' ? 'var(--accent-cyan)' : '#1f2937',
              color: activeTab === 'governance' ? '#0a0f1d' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Sliders size={15} />
            Policy, Governance & Incidents
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
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

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsLegalModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Scale size={13} />
            1930 Legal Helpdesk
          </button>

          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <MessageSquarePlus size={13} />
            Feedback Forum
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <IndianRupee size={13} />
            Execute Bank Transfer
          </button>

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
            Reset
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div>
          {/* Actionable Alert Panel */}
          <AlertPanel
            threatTier={threatTier}
            recommendedAction={recommendedAction}
            requiresHold={requiresHold || transactionHeld}
            onOpenTransferModal={() => setIsTransferModalOpen(true)}
            onOpenMfaModal={() => {
              setVerifyMode('mfa');
              setIsVerifyModalOpen(true);
            }}
            onOpenCallbackModal={() => {
              setVerifyMode('callback');
              setIsVerifyModalOpen(true);
            }}
          />

          {/* Call Context & Enterprise Identity Enrichment */}
          <CallContextPanel
            callerNumber={callerNumber}
            claimedIdentity={claimedIdentity}
            registeredNumber={registeredNumber}
            transactionAmount={transactionAmount}
            actionType={actionType}
            detectedLanguage={detectedLanguage}
            onUpdateContext={handleUpdateContext}
          />

          {/* WebRTC Live Call Room */}
          <CallRoom
            roomId={roomId}
            setRoomId={setRoomId}
            wsRef={wsRef}
            onRiskUpdate={setOverallRisk}
            onRegisterSignaling={(cb) => { signalingHandlerRef.current = cb; }}
          />

          {/* Fallback Demo Mode Trigger Player */}
          <DemoController
            activeScenario={activeDemoScenario}
            onStartDemo={handleStartDemo}
            onStopDemo={handleStopDemo}
            isPlaying={isPlayingDemo}
          />

          {/* Multi-Layer Threat Telemetry Meter */}
          <RiskMeter
            syntheticRisk={syntheticRisk}
            spectralRisk={spectralRisk}
            prosodyRisk={prosodyRisk}
            speakerSimilarity={speakerSimilarity}
            contextRisk={contextRisk}
            scamRisk={scamRisk}
            overallRisk={overallRisk}
            threatTier={threatTier}
            isStreamActive={isStreamActive}
          />

          {/* Real-Time Scam Defense Copilot & Counter-Interrogation Scripts */}
          <ScamCopilotCard
            defenseCopilot={defenseCopilot}
            detectedPatterns={detectedPatterns}
            isStreamActive={isStreamActive}
          />

          {/* 4-Signal Deep Radar Breakdown */}
          <MultiSignalRadar
            telemetry={telemetry}
            layerBreakdown={layerBreakdown}
            isStreamActive={isStreamActive}
          />

          {/* Dynamic Risk Progression Timeline */}
          <RiskTimeline history={riskHistory} />

          {/* Live Transcript Pane */}
          <TranscriptPane
            transcript={transcript}
            detectedPatterns={detectedPatterns}
          />
        </div>
      )}

      {activeTab === 'governance' && (
        <PolicySettings
          activePolicy="high_value_transfer"
          featureOnlyLogging={featureOnlyLogging}
          onToggleFeatureOnly={(val) => setFeatureOnlyLogging(val)}
        />
      )}

      {activeTab === 'inspector' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={18} color="var(--accent-cyan)" />
            Real-Time WebSocket Signal Inspector
          </h3>
          <div style={{
            background: '#070b14',
            borderRadius: '8px',
            border: '1px solid var(--border-card)',
            padding: '1rem',
            minHeight: '350px',
            maxHeight: '520px',
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
                         log.direction === 'CONTEXT' ? '#a78bfa' :
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

      {/* Pre-Transaction Banking Transfer Modal */}
      <TransactionModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        overallRisk={overallRisk}
        requiresHold={requiresHold || transactionHeld}
        activeIncidentId={activeIncidentId}
        onTriggerVerification={(mode) => {
          setVerifyMode(mode);
          setIsVerifyModalOpen(true);
        }}
      />

      {/* Secondary Verification (MFA & Call-Back) Modal */}
      <SecondaryVerify
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        initialTab={verifyMode}
        registeredPhone={registeredNumber}
        claimedIdentity={claimedIdentity}
        activeIncidentId={activeIncidentId || 'INC-2026-00418'}
        onVerificationSuccess={() => {
          setTransactionHeld(false);
          setRequiresHold(false);
        }}
      />

      {/* National Cybercrime Legal Helpdesk (1930 & Section 66D IT Act) */}
      <LegalHelpdesk
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        callerNumber={callerNumber}
        claimedIdentity={claimedIdentity}
        transactionAmount={transactionAmount}
        overallRisk={overallRisk}
        threatTier={threatTier}
        activeIncidentId={activeIncidentId || 'INC-2026-00418'}
      />

      {/* Model Feedback Forum (Continuous Retraining Loop) */}
      <FeedbackForum
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        roomId={roomId}
        callerNumber={callerNumber}
        claimedIdentity={claimedIdentity}
        overallRisk={overallRisk}
        threatTier={threatTier}
      />
    </div>
  );
}
