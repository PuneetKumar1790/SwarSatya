/**
 * SwarSatya Global Environment & Network Configuration
 * Supports Localhost, Hugging Face Spaces, and Cloudflare/Vercel deployments.
 */

export const CLOUD_BACKEND_URL = 'https://puneetk1789-swarsatya-backend.hf.space/soc';
export const LOCAL_BACKEND_URL = 'http://localhost:8000';

// Defaults to live Hugging Face Cloud backend (ZeroGPU accelerated) unless overridden in .env
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || CLOUD_BACKEND_URL;

// Compute WebSocket URL dynamically:
// e.g. https://puneetk1789-swarsatya-backend.hf.space/soc -> wss://puneetk1789-swarsatya-backend.hf.space/soc/ws/call/{roomId}
// e.g. http://localhost:8000 -> ws://localhost:8000/ws/call/{roomId}
export const getWsUrl = (roomId = 'satya-room-1') => {
  if (import.meta.env.VITE_WS_URL) {
    return `${import.meta.env.VITE_WS_URL}/ws/call/${roomId}`;
  }
  
  try {
    const url = new URL(BACKEND_URL);
    const wsProto = url.protocol === 'https:' ? 'wss:' : 'ws:';
    const pathPrefix = url.pathname.replace(/\/$/, '');
    return `${wsProto}//${url.host}${pathPrefix}/ws/call/${roomId}`;
  } catch (e) {
    return `wss://puneetk1789-swarsatya-backend.hf.space/soc/ws/call/${roomId}`;
  }
};

