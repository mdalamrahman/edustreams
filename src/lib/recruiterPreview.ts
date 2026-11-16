const PREVIEW_KEY = 'sdetube_recruiter_preview';
const LEGACY_SESSION_KEY = 'edustream_student_session';

export function isRecruiterDemoUser(value: unknown): boolean {
  return Boolean(value && typeof value === 'object' && 'id' in value &&
    typeof value.id === 'string' && value.id.startsWith('demo-recruiter-'));
}

export function isRecruiterPreviewEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem(PREVIEW_KEY) === 'true') return true;
    if (isRecruiterDemoUser(JSON.parse(localStorage.getItem(LEGACY_SESSION_KEY) || 'null'))) {
      localStorage.removeItem(LEGACY_SESSION_KEY);
      localStorage.setItem(PREVIEW_KEY, 'true');
      return true;
    }
  } catch {}
  return false;
}

export function setRecruiterPreviewEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem(PREVIEW_KEY, 'true');
    else localStorage.removeItem(PREVIEW_KEY);
  } catch {}
}

/** Use at action boundaries; a preview flag never supplies an authenticated identity. */
export function requestSignInForPreview(): boolean {
  if (!isRecruiterPreviewEnabled()) return false;
  window.dispatchEvent(new Event('sdetube_open_auth'));
  return true;
}
