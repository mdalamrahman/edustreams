import { TELEGRAM_BACKEND_URL } from './telegram';

export interface ProblemNote {
  slug: string;
  problemName: string;
  content: string;
  updatedAt: number;
  syncedToCloudflare: boolean;
}

const STORAGE_NOTES_PREFIX = 'sdetube_dsa_notes_';

/**
 * Retrieves local notes for a problem slug
 */
export function getLocalProblemNote(slug: string): string {
  if (!slug) return '';
  try {
    return localStorage.getItem(`${STORAGE_NOTES_PREFIX}${slug}`) || '';
  } catch {
    return '';
  }
}

/**
 * Saves notes locally and synchronizes to Cloudflare R2 / Backend storage as a .txt file
 */
export async function saveProblemNote(
  slug: string,
  problemName: string,
  content: string,
  userEmail?: string
): Promise<{ success: boolean; syncedToCloudflare: boolean; error?: string }> {
  if (!slug) return { success: false, syncedToCloudflare: false, error: 'Invalid slug' };

  // 1. Save to local storage
  try {
    localStorage.setItem(`${STORAGE_NOTES_PREFIX}${slug}`, content);
    window.dispatchEvent(new CustomEvent('sdetube_notes_updated', { detail: { slug, content } }));
  } catch (e) {
    console.warn('[SDETube Notes Local Storage Notice]:', e);
  }

  // 2. Synchronize to Cloudflare R2 via Backend API
  let syncedToCloudflare = false;
  try {
    const payload = {
      slug,
      problem_name: problemName,
      content,
      user_email: userEmail || 'anonymous@sdetube.app',
      filename: `${slug}-notes.txt`,
      timestamp: Date.now()
    };

    const resp = await fetch(`${TELEGRAM_BACKEND_URL}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (resp.ok) {
      syncedToCloudflare = true;
    }
  } catch (err) {
    // Graceful offline/fallback if backend is temporarily unreachable
    console.warn('[SDETube Cloudflare Note Sync Notice]:', err);
  }

  return { success: true, syncedToCloudflare };
}

/**
 * Downloads the student's personal notes as a .txt file
 */
export function downloadProblemNotesAsTxt(slug: string, problemName: string, content: string) {
  try {
    const header = `=======================================================\n` +
      `  SDETUBE STUDY NOTES: ${problemName}\n` +
      `  Problem Slug: ${slug}\n` +
      `  Exported At: ${new Date().toLocaleString()}\n` +
      `=======================================================\n\n`;

    const fullText = header + (content.trim() ? content : 'No notes written yet.');
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug}-notes.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    console.warn('[Notes Download Notice]:', e);
  }
}
