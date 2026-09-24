/**
 * SwarSatya Chrome Extension - Popup Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const threatTierBadge = document.getElementById('threatTierBadge');
  const openSidePanelBtn = document.getElementById('openSidePanelBtn');
  const openDashboardBtn = document.getElementById('openDashboardBtn');

  // Check backend health via service worker message
  try {
    chrome.runtime.sendMessage({ type: 'CHECK_BACKEND' }, (response) => {
      if (response && response.success) {
        statusDot.style.background = '#10b981';
        statusText.textContent = 'Active (Port 8000)';
      } else {
        statusDot.style.background = '#ef4444';
        statusText.textContent = 'Offline (Check Backend)';
      }
    });
  } catch (e) {
    statusDot.style.background = '#ef4444';
    statusText.textContent = 'Unavailable';
  }

  // Load last stored threat status
  const stored = await chrome.storage.local.get(['threatTier', 'lastRisk']);
  if (stored.threatTier) {
    threatTierBadge.textContent = `${stored.threatTier} (${stored.lastRisk || 0}%)`;
    if (stored.threatTier === 'CRITICAL' || stored.threatTier === 'HIGH') {
      threatTierBadge.className = 'badge badge-warn';
    } else {
      threatTierBadge.className = 'badge badge-safe';
    }
  }

  // Open side panel
  openSidePanelBtn.addEventListener('click', async () => {
    chrome.runtime.sendMessage({ type: 'OPEN_SIDEPANEL' }, (res) => {
      window.close();
    });
  });

  // Open full dashboard in a new tab
  openDashboardBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173/' });
  });
});
