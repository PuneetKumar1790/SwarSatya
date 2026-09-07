import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Shield, Radio, Volume2, Users } from 'lucide-react';

export default function CallRoom({
  roomId,
  setRoomId,
  wsRef,
  onRiskUpdate,
  onRegisterSignaling
}) {
  const [callState, setCallState] = useState('idle'); // 'idle', 'joining', 'calling', 'connected'
  const [isMuted, setIsMuted] = useState(false);
  const [peersCount, setPeersCount] = useState(1);
  const [audioLevel, setAudioLevel] = useState(0);
  const [streamSource, setStreamSource] = useState('remote'); // 'remote' or 'mic'

  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const audioContextRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const chunkBufferRef = useRef([]);
  const chunkIndexRef = useRef(0);
  const animationFrameRef = useRef(null);
  const resamplePhaseRef = useRef(0);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Setup Web Audio Forking to stream 3-second 16kHz mono chunks to backend
  const setupAudioForking = (stream) => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      // Prefer native 16kHz AudioContext (supported by Chrome, Edge, Safari, Firefox)
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      let audioCtx;
      try {
        audioCtx = new AudioCtxClass({ sampleRate: 16000 });
      } catch (e) {
        audioCtx = new AudioCtxClass();
      }
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      // Audio Level Visualizer
      const pcmData = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(pcmData);
        let sum = 0;
        for (let i = 0; i < pcmData.length; i++) sum += pcmData[i];
        const avg = sum / pcmData.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // ScriptProcessor for 16kHz mono chunk accumulation
      const bufferSize = 4096;
      const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1);
      scriptProcessorRef.current = processor;

      const targetSampleRate = 16000;
      const chunkDurationSeconds = 3.0;
      const samplesPerChunk = targetSampleRate * chunkDurationSeconds; // 48,000 samples
      chunkBufferRef.current = [];
      resamplePhaseRef.current = 0;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const inRate = audioCtx.sampleRate;

        if (inRate === targetSampleRate) {
          // Exactly 16kHz from browser native context
          for (let i = 0; i < inputData.length; i++) {
            chunkBufferRef.current.push(inputData[i]);
          }
        } else {
          // Stateful linear interpolation resampling without inter-block phase jumps
          const ratio = inRate / targetSampleRate;
          let phase = resamplePhaseRef.current;
          while (phase < inputData.length) {
            const i0 = Math.floor(phase);
            const i1 = Math.min(i0 + 1, inputData.length - 1);
            const frac = phase - i0;
            const sample = inputData[i0] * (1 - frac) + inputData[i1] * frac;
            chunkBufferRef.current.push(sample);
            phase += ratio;
          }
          resamplePhaseRef.current = phase - inputData.length;
        }

        // When chunk is ready (3.0 seconds of audio), encode and transmit over WebSocket
        if (chunkBufferRef.current.length >= samplesPerChunk) {
          const chunk = chunkBufferRef.current.splice(0, samplesPerChunk);
          chunkIndexRef.current += 1;

          // Convert float32 array to 16-bit PCM
          const pcm16 = new Int16Array(chunk.length);
          for (let j = 0; j < chunk.length; j++) {
            const s = Math.max(-1, Math.min(1, chunk[j]));
            pcm16[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          // Base64 encode in safe slices
          const u8 = new Uint8Array(pcm16.buffer);
          let binary = '';
          const sliceSize = 8192;
          for (let k = 0; k < u8.length; k += sliceSize) {
            binary += String.fromCharCode.apply(null, u8.subarray(k, k + sliceSize));
          }
          const base64Audio = btoa(binary);

          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'audio_chunk',
              room_id: roomId,
              chunk_index: chunkIndexRef.current,
              audio_base64: base64Audio
            }));
          }
        }
      };

      // Mute gain node: CRITICAL to prevent mic feedback through speakers
      const muteGain = audioCtx.createGain();
      muteGain.gain.value = 0.0;
      source.connect(processor);
      processor.connect(muteGain);
      muteGain.connect(audioCtx.destination);
    } catch (err) {
      console.error('Audio forking error:', err);
    }
  };

  // Join WebRTC Call
  const handleJoinCall = async () => {
    setCallState('joining');
    try {
      // 1. Get user mic with acoustic echo cancellation & noise suppression
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        },
        video: false
      });
      localStreamRef.current = stream;

      // 2. Setup RTCPeerConnection
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local audio tracks to peer connection
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'candidate',
            room_id: roomId,
            payload: event.candidate
          }));
        }
      };

      // Handle Remote Audio Track
      pc.ontrack = (event) => {
        console.log('Received remote audio track!');
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
        setPeersCount(2);
        setCallState('connected');
        // Fork the remote caller's audio stream for AI analysis
        setupAudioForking(event.streams[0]);
      };

      // Listen for WebSocket signaling messages via clean registration
      if (onRegisterSignaling) {
        onRegisterSignaling(async (data) => {
          try {
            if (data.type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                  type: 'answer',
                  room_id: roomId,
                  payload: answer
                }));
              }
              setCallState('connected');
            } else if (data.type === 'answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
              setCallState('connected');
            } else if (data.type === 'candidate') {
              if (data.payload) {
                await pc.addIceCandidate(new RTCIceCandidate(data.payload));
              }
            } else if (data.type === 'user-joined') {
              // Create offer to incoming peer
              setPeersCount(2);
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                  type: 'offer',
                  room_id: roomId,
                  payload: offer
                }));
              }
            } else if (data.type === 'user-left') {
              setPeersCount(1);
            }
          } catch (e) {
            console.error('Signaling message handling error:', e);
          }
        });
      }

      // Notify room that user has joined
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'join',
          room_id: roomId
        }));
      }

      // If single tab testing, fork own microphone so AI pipeline can be tested right away
      setupAudioForking(stream);
      setCallState('calling');
    } catch (err) {
      console.error('Error starting WebRTC call:', err);
      setCallState('idle');
      alert(`Could not start call: ${err.message}. Please allow microphone access.`);
    }
  };

  const handleLeaveCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'leave',
        room_id: roomId
      }));
    }
    setCallState('idle');
    setAudioLevel(0);
    setPeersCount(1);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Hidden audio element for remote WebRTC stream */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
            padding: '0.65rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={22} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              WebRTC Live Call Room
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Two-way audio stream with synchronized 16kHz AI security fork
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {callState !== 'idle' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              background: '#0d1322',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--border-card)'
            }}>
              <Users size={14} color="#06b6d4" />
              <span>{peersCount} Participant{peersCount > 1 ? 's' : ''}</span>
            </div>
          )}

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            background: callState === 'connected' ? 'rgba(16, 185, 129, 0.15)' :
                        callState === 'calling' ? 'rgba(6, 182, 212, 0.15)' :
                        callState === 'joining' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(107, 114, 128, 0.15)',
            color: callState === 'connected' ? '#10b981' :
                   callState === 'calling' ? '#06b6d4' :
                   callState === 'joining' ? '#f59e0b' : '#9ca3af',
            border: `1px solid ${callState === 'connected' ? '#10b98140' :
                                 callState === 'calling' ? '#06b6d440' : '#4b556340'}`
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: callState === 'connected' ? '#10b981' :
                               callState === 'calling' ? '#06b6d4' :
                               callState === 'joining' ? '#f59e0b' : '#9ca3af'
            }} />
            {callState === 'calling' ? 'Awaiting Peer' : callState}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Room Code"
          disabled={callState !== 'idle'}
          style={{
            flex: '1',
            minWidth: '200px',
            background: '#0d1322',
            border: '1px solid var(--border-card)',
            color: 'var(--text-primary)',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />

        {callState === 'idle' ? (
          <button
            onClick={handleJoinCall}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Phone size={16} />
            Start WebRTC Call
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={toggleMute}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: isMuted ? '#ef4444' : '#1f2937',
                color: '#ffffff',
                border: '1px solid var(--border-card)',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button
              onClick={handleLeaveCall}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <PhoneOff size={16} />
              End Call
            </button>
          </div>
        )}
      </div>

      {/* Audio Activity Monitor */}
      {callState !== 'idle' && (
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#0d1322', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
          <Volume2 size={16} color={audioLevel > 15 ? '#10b981' : '#6b7280'} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Audio Signal:</span>
          <div style={{ flex: 1, height: '6px', background: '#1f2937', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${audioLevel}%`, height: '100%', background: audioLevel > 50 ? '#f59e0b' : '#10b981', transition: 'width 0.1s ease' }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>{audioLevel}%</span>
        </div>
      )}
    </div>
  );
}
