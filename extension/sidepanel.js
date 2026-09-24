/**
 * SwarSatya Chrome Extension - Side Panel In-Call Companion
 * Connects directly to backend WebSocket and updates in-call tactical scripts.
 */

document.addEventListener('DOMContentLoaded', () => {
  const riskScoreEl = document.getElementById('riskScore');
  const threatTierEl = document.getElementById('threatTier');
  const progressBarEl = document.getElementById('progressBar');
  const policyActionEl = document.getElementById('policyAction');
  const sigSynthEl = document.getElementById('sigSynth');
  const sigSpectralEl = document.getElementById('sigSpectral');
  const sigSpeakerEl = document.getElementById('sigSpeaker');
  const sigScamEl = document.getElementById('sigScam');
  const scriptsContainer = document.getElementById('scriptsContainer');
  const connBadge = document.getElementById('connBadge');
  const btnFir = document.getElementById('btnFir');
  const firBox = document.getElementById('firBox');
  const firContent = document.getElementById('firContent');
  const btnFeedback = document.getElementById('btnFeedback');

  let ws = null;

  function connect() {
    try {
      ws = new WebSocket('ws://127.0.0.1:8000/ws/call/satya-room-1');

      ws.onopen = () => {
        connBadge.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:#10b981;"></span> LIVE';
        connBadge.style.color = '#34d399';
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'risk_update') {
            updateDashboard(data);
          }
        } catch (e) {
          console.error('[SidePanel] Message parse error:', e);
        }
      };

      ws.onclose = () => {
        connBadge.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:#ef4444;"></span> OFFLINE';
        connBadge.style.color = '#f87171';
        setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      console.error('[SidePanel] WebSocket error:', e);
      setTimeout(connect, 3000);
    }
  }

  function updateDashboard(data) {
    const risk = Math.round(data.overall_risk || 0);
    const tier = data.threat_tier || 'LOW';

    riskScoreEl.textContent = `${risk}%`;
    progressBarEl.style.width = `${Math.min(100, Math.max(5, risk))}%`;

    if (tier === 'CRITICAL') {
      threatTierEl.textContent = 'CRITICAL THREAT';
      threatTierEl.className = 'tier-badge tier-critical';
      riskScoreEl.style.color = '#ef4444';
      progressBarEl.style.background = '#ef4444';
    } else if (tier === 'HIGH' || tier === 'WARN' || tier === 'ELEVATED') {
      threatTierEl.textContent = `${tier} THREAT`;
      threatTierEl.className = 'tier-badge tier-warn';
      riskScoreEl.style.color = '#fbbf24';
      progressBarEl.style.background = '#fbbf24';
    } else {
      threatTierEl.textContent = 'LOW THREAT';
      threatTierEl.className = 'tier-badge tier-low';
      riskScoreEl.style.color = '#10b981';
      progressBarEl.style.background = '#10b981';
    }

    if (data.recommended_action) {
      policyActionEl.textContent = data.recommended_action;
    }

    // Sub-signals
    if (data.layer_breakdown) {
      sigSynthEl.textContent = `${(data.layer_breakdown.synthetic_model || 0).toFixed(1)}%`;
      sigSpectralEl.textContent = `${(data.layer_breakdown.spectral_phase || 0).toFixed(1)}%`;
      const spkMis = data.layer_breakdown.speaker_mismatch || 0;
      sigSpeakerEl.textContent = `${Math.max(0, 100 - spkMis).toFixed(1)}%`;
      sigScamEl.textContent = `${(data.layer_breakdown.conversational_scam || 0).toFixed(1)}%`;
    }

    // Copilot counter scripts
    if (data.defense_copilot && data.defense_copilot.smart_counter_scripts) {
      renderScripts(data.defense_copilot.smart_counter_scripts);
    }
  }

  function renderScripts(scripts) {
    scriptsContainer.innerHTML = '';
    scripts.slice(0, 3).forEach((script) => {
      const item = document.createElement('div');
      item.className = 'script-item';

      const span = document.createElement('span');
      span.textContent = script;

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(script.replace(/^Ask: '|^Say: '|'$/g, ''));
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      });

      item.appendChild(span);
      item.appendChild(btn);
      scriptsContainer.appendChild(item);
    });
  }

  // Setup initial copy buttons
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-text');
      navigator.clipboard.writeText(text);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
  });

  // FIR Draft Generation
  btnFir.addEventListener('click', async () => {
    try {
      btnFir.textContent = 'Generating...';
      const res = await fetch('http://127.0.0.1:8000/api/legal/fir-draft?room_id=satya-room-1');
      if (res.ok) {
        const data = await res.json();
        firContent.value = data.fir_text;
        firBox.style.display = 'block';
        await navigator.clipboard.writeText(data.fir_text);
        btnFir.textContent = 'Copied FIR Draft!';
        setTimeout(() => { btnFir.textContent = '📋 Copy FIR Draft'; }, 3000);
      }
    } catch (e) {
      btnFir.textContent = 'Failed to generate';
      setTimeout(() => { btnFir.textContent = '📋 Copy FIR Draft'; }, 2000);
    }
  });

  // Open Feedback Forum in dashboard
  btnFeedback.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173/' });
  });

  // Initial connect
  connect();
});
