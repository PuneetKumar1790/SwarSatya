/**
 * SwarSatya Chrome Extension - Background Service Worker (Manifest V3)
 * Manages WebSocket bridge to the SwarSatya Voice SOC backend and side panel.
 */

// Initialize default state in chrome.storage.local
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({
    isGuardActive: false,
    backendUrl: 'http://127.0.0.1:8000',
    wsUrl: 'ws://127.0.0.1:8000/ws/call/extension-room',
    lastRisk: 0,
    threatTier: 'LOW',
    copilotScripts: []
  });
  console.log('[SwarSatya Background] Installed successfully.');
});

// Message listener for popup and side panel interactions
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === 'OPEN_SIDEPANEL') {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.windowId) {
          await chrome.sidePanel.open({ windowId: tab.windowId });
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'No active window found' });
        }
      } else if (message.type === 'CHECK_BACKEND') {
        const res = await fetch('http://127.0.0.1:8000/api/health');
        if (res.ok) {
          const data = await res.json();
          sendResponse({ success: true, data });
        } else {
          sendResponse({ success: false, status: res.status });
        }
      } else if (message.type === 'START_CALL_GUARD') {
        await chrome.storage.local.set({ isGuardActive: true });
        await chrome.action.setBadgeText({ text: 'ON' });
        await chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
        sendResponse({ success: true });
      } else if (message.type === 'STOP_CALL_GUARD') {
        await chrome.storage.local.set({ isGuardActive: false });
        await chrome.action.setBadgeText({ text: '' });
        sendResponse({ success: true });
      } else if (message.type === 'UPDATE_THREAT_BADGE') {
        const tier = message.tier || 'LOW';
        const color = tier === 'CRITICAL' ? '#ef4444' : tier === 'HIGH' ? '#f97316' : tier === 'WARN' ? '#eab308' : '#10b981';
        await chrome.action.setBadgeText({ text: tier === 'LOW' ? 'SAFE' : 'WARN' });
        await chrome.action.setBadgeBackgroundColor({ color });
        sendResponse({ success: true });
      }
    } catch (err) {
      console.error('[SwarSatya Background] Error handling message:', err);
      sendResponse({ success: false, error: err.message });
    }
  })();
  return true; // Keep channel open for async response
});
