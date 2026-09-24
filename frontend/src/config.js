/**
 * SwarSatya Global Environment & Network Configuration
 * Supports Localhost, Hugging Face Spaces, and Cloudflare/Vercel deployments.
 */

// If VITE_BACKEND_URL is provided (e.g. 'https://username-swarsatya.hf.space'), use it.
// Otherwise fallback to local development port 8000.
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Compute WebSocket URL dynamically:
// If BACKEND_URL is https://abc.hf.space -> wss://abc.hf.space
// If BACKEND_URL is http://localhost:8000 -> ws://localhost:8000
export const getWsUrl = (roomId = 'satya-room-1') => {
  if (import.meta.env.VITE_WS_URL) {
    return `${import.meta.env.VITE_WS_URL}/ws/call/${roomId}`;
  }
  
  try {
    const url = new URL(BACKEND_URL);
    const wsProto = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProto}//${url.host}/ws/call/${roomId}`;
  } catch (e) {
    const host = window.location.hostname === 'localhost' ? '127.0.0.1:8000' : window.location.host;
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${host}/ws/call/${roomId}`;
  }
};
