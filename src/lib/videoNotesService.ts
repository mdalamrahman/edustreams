import { TELEGRAM_BACKEND_URL } from './telegram';
import { getCurrentStudent } from './auth';

const STORAGE_KEY_PREFIX = 'sdetube_video_notes_';

/**
 * Normalizes video doc id for Cloudflare R2 storage
 */
export function getVideoDocId(videoId: string, userEmail?: string): string {
  const email = userEmail || getCurrentStudent()?.email || 'anonymous';
  const cleanEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const cleanVid = (videoId || 'generic').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return `vnotes_${cleanEmail}_${cleanVid}`;
}

/**
 * Retrieves cached video notes from browser localStorage
 */
export function getLocalVideoNotes(videoId: string, userEmail?: string): string {
  if (!videoId) return '';
  const docId = getVideoDocId(videoId, userEmail);
  try {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}${docId}`) || '';
  } catch {
    return '';
  }
}

/**
 * Fetches video notes from Cloudflare R2 via Backend API, falling back to localStorage
 */
export async function fetchVideoNotes(videoId: string, userEmail?: string): Promise<string> {
  const local = getLocalVideoNotes(videoId, userEmail);
  if (!videoId) return local;

  const docId = getVideoDocId(videoId, userEmail);

  try {
    const res = await fetch(`${TELEGRAM_BACKEND_URL}/api/notes/${docId}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.content && typeof data.content === 'string' && data.content.trim()) {
        try {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}${docId}`, data.content);
        } catch {}
        return data.content;
      }
    }
  } catch (err) {
    console.warn('[Video Notes Cloud Fetch Notice]:', err);
  }

  return local;
}

/**
 * Saves video notes locally and syncs directly to Cloudflare R2
 */
export async function saveVideoNotes(
  videoId: string,
  content: string,
  userEmail?: string
): Promise<{ success: boolean; syncedToR2: boolean; error?: string }> {
  if (!videoId) return { success: false, syncedToR2: false, error: 'Invalid video ID' };

  const docId = getVideoDocId(videoId, userEmail);
  const email = userEmail || getCurrentStudent()?.email || 'anonymous@sdetube.app';

  // 1. Immediately cache in browser localStorage
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${docId}`, content);
    window.dispatchEvent(new CustomEvent('sdetube_video_notes_updated', { detail: { videoId, content } }));
  } catch (e) {
    console.warn('[Video Notes Local Storage Notice]:', e);
  }

  // 2. Synchronize to Cloudflare R2
  let syncedToR2 = false;
  try {
    const res = await fetch(`${TELEGRAM_BACKEND_URL}/api/notes/${docId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        user_email: email,
        video_id: videoId,
        timestamp: Date.now()
      })
    });

    if (res.ok) {
      syncedToR2 = true;
    }
  } catch (err) {
    console.warn('[Video Notes Cloudflare R2 Sync Notice]:', err);
  }

  return { success: true, syncedToR2 };
}

/**
 * Exports video notes as a formatted .txt download
 */
export function downloadVideoNotesAsTxt(videoTitle: string, content: string): void {
  try {
    const header = `=======================================================\n` +
      `  SDETUBE STUDENT VIDEO NOTES\n` +
      `  Lecture: ${videoTitle || 'Untitled Lecture'}\n` +
      `  Exported At: ${new Date().toLocaleString()}\n` +
      `=======================================================\n\n`;

    const fullText = header + (content.trim() ? content : 'No notes written yet.');
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanFileName = (videoTitle || 'lecture-notes').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${cleanFileName}_notes.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    console.warn('[Video Notes Download Notice]:', e);
  }
}
