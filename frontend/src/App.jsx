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
      {/* Header */}
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
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            padding: '0.6rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
          }}>
            <Shield size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>SwarSatya</h1>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                स्वर सत्य • Voice Security Operations Center (SIH #26104)
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
              Multi-Layer Real-Time Voice Biometric & Impersonation Scam Defense Platform
            </p>
          </div>
        </div>

        {/* Telemetry Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div className="telemetry-cluster" title={`Connected to: ${BACKEND_URL}`}>
            <div className="telemetry-item">
              <span className="status-dot blue" />
              <span>HF Zero-GPU: {BACKEND_URL.includes('hf.space') ? 'A10G Cloud' : 'Local'}</span>
            </div>
            <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
            <div className="telemetry-item">
              <span className={`status-dot ${backendHealthy ? 'green' : 'red'}`} />
              <span>ML Core: {backendHealthy ? 'Multi-Layer Active' : 'Offline'}</span>
            </div>
            <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
            <div className="telemetry-item">
              <span className={`status-dot ${wsConnected ? 'green' : 'amber'}`} />
              <span>Stream: {wsConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            {lastLatencyMs !== null && (
              <>
                <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
                <div className="telemetry-item mono" style={{ color: '#38bdf8' }}>
                  <Clock size={12} />
                  <span>{lastLatencyMs} ms</span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Navigation & Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Segmented Tab Controls */}
        <div className="nav-segmented-container">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <Shield size={14} />
            Live Voice SOC
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`nav-tab-btn ${activeTab === 'governance' ? 'active' : ''}`}
          >
            <Sliders size={14} />
            Policy & Incidents
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`nav-tab-btn ${activeTab === 'inspector' ? 'active' : ''}`}
          >
            <Terminal size={14} />
            Packet Inspector ({logs.length})
          </button>
        </div>

        {/* Cohesive Secondary Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsLegalModalOpen(true)}
            className="btn-header-secondary"
          >
            <Scale size={13} color="#f59e0b" />
            1930 Legal Helpdesk
          </button>

          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="btn-header-secondary"
          >
            <MessageSquarePlus size={13} color="#10b981" />
            Feedback Forum
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="btn-header-primary"
          >
            <IndianRupee size={13} />
            Execute Bank Transfer
          </button>

          <button
            onClick={resetMetrics}
            className="btn-header-secondary"
            title="Reset telemetry meters"
          >
            <RefreshCw size={12} color="#94a3b8" />
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
            isStreamActive={isStreamActive}
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
