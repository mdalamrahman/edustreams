/**
 * EduStream Device Session Manager
 * Enforces strict 1-active-session-per-user concurrency policy across all devices.
 */

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://edustream-backend-90vm.onrender.com';
const SESSION_STORAGE_KEY = 'edustream_device_session_id';

/**
 * Returns or generates a unique persistent device session ID for this browser.
 */
export function getDeviceSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  try {
    let id = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!id || id.trim().length < 8) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        id = `dev-${crypto.randomUUID()}`;
      } else {
        id = `dev-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`;
      }
      localStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `dev-${Date.now().toString(36)}`;
  }
}

/**
 * Generates a clean, user-friendly device & browser signature.
 */
export function getDeviceInfo(): string {
  if (typeof window === 'undefined') return 'Unknown Device';
  const ua = navigator.userAgent;
  
  let os = 'Unknown OS';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Macintosh|Mac OS/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  return `${os} • ${browser}`;
}

export interface SessionVerificationResult {
  valid: boolean;
  reason?: string;
  message?: string;
  is_new?: boolean;
}

/**
 * Registers this device as the single active session for the given user email.
 * Immediately supersedes and revokes any prior active sessions on other devices.
 */
export async function registerDeviceSession(email: string, userId?: string): Promise<boolean> {
  if (!email) return false;
  try {
    const sessionId = getDeviceSessionId();
    const deviceInfo = getDeviceInfo();
    const res = await fetch(`${BACKEND_URL}/api/session/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        user_id: userId || email.trim().toLowerCase(),
        session_id: sessionId,
        device_info: deviceInfo,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (e) {
    console.warn('[Session Register Notice]:', e);
  }
  return true;
}

/**
 * Verifies that the current browser/device is still the active session in SQLite backend.
 */
export async function verifyDeviceSession(email: string): Promise<SessionVerificationResult> {
  if (!email) return { valid: true };
  try {
    const sessionId = getDeviceSessionId();
    const res = await fetch(`${BACKEND_URL}/api/session/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        session_id: sessionId,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        valid: data.valid !== false,
        reason: data.reason,
        message: data.message,
        is_new: data.is_new,
      };
    }
  } catch (e) {
    // If backend is momentarily unreachable, do not kick the user out
    return { valid: true };
  }
  return { valid: true };
}

/**
 * Terminates this device's active session in the database upon sign out.
 */
export async function terminateDeviceSession(email: string): Promise<boolean> {
  if (!email) return true;
  try {
    const sessionId = getDeviceSessionId();
    await fetch(`${BACKEND_URL}/api/session/terminate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        session_id: sessionId,
      }),
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Starts a real-time heartbeat that periodically checks if the session was superseded by another device.
 * Automatically checks every 15s, on tab visibility changes, and window focus.
 */
export function startSessionHeartbeat(
  email: string,
  onRevoked: (message: string) => void
): () => void {
  if (!email) return () => {};

  let isRevoked = false;

  const check = async () => {
    if (isRevoked) return;
    const result = await verifyDeviceSession(email);
    if (!result.valid && result.reason === 'SESSION_REVOKED') {
      isRevoked = true;
      const msg = result.message || 'Your account was logged in from another device/browser. Only 1 active session is allowed.';
      onRevoked(msg);
    }
  };

  // Immediate check
  check();

  // Periodic heartbeat every 15 seconds
  const intervalId = setInterval(check, 15000);

  // Check on tab focus / visibility return
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      check();
    }
  };
  const handleFocus = () => {
    check();
  };

  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('focus', handleFocus);

  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('focus', handleFocus);
  };
}
