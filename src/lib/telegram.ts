/**
 * EduStream — Telegram HF Backend API Client
 * 
 * Connects the frontend to the Telethon backend deployed on Hugging Face Spaces.
 * Constructs stream and download URLs for Telegram channel media.
 * Uses TELEGRAM_BOT_TOKEN on the HF side for channel access.
 */

// Render / Backend base URL (default to relative path in browser for zero-CORS proxying via Vercel/Vite)
const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_BACKEND_URL as string || import.meta.env.VITE_RENDER_BACKEND_URL as string) : '') || '';

// Remove trailing slash if present
const BACKEND_BASE = BACKEND_URL ? BACKEND_URL.replace(/\/+$/, '') : '';

/**
 * Mapping from internal frontend channel IDs to Telegram Bot API channel IDs.
 * These are the -100XXXXXXXXXX format used by the Bot API & Telethon with bot_token.
 */
const CHANNEL_CHAT_ID_MAP: Record<string, number> = {
  'ch-dsa-01':  -1004390749731,
  'ch-sd-02':   -1004329144420,
  'ch-dbms-03': -1004332462419,
  'ch-cn-04':   -1004308430774,
  'ch-hld-05':  -5501631117,
};

/**
 * Returns the Telegram Bot API chat_id for a given frontend channel ID.
 */
export function getChatId(channelId: string): number | null {
  return CHANNEL_CHAT_ID_MAP[channelId] ?? null;
}

/**
 * Constructs a Telegram video stream URL via the HF Telethon backend.
 * This URL supports HTTP 206 range requests for instant seek/scrubbing.
 * 
 * @param channelId - Frontend channel ID (e.g., 'ch-dsa-01')
 * @param messageId - Telegram message ID of the video post
 * @returns Full stream URL like: https://mdalamrahman-edustream.hf.space/stream/-1004390749731/7121
 */
export function getStreamUrl(channelId: string, messageId: number): string {
  const chatId = CHANNEL_CHAT_ID_MAP[channelId] || channelId;
  if (!chatId || !messageId) return '';
  // In Cloudflare Pages or web deployment, route through zero-cost edge function with 30-day CDN caching
  if (typeof window !== 'undefined' && (window.location.hostname.includes('pages.dev') || window.location.hostname.includes('sdetube') || window.location.hostname.includes('vercel.app'))) {
    return `/api/video/${chatId}/${messageId}`;
  }
  return `${BACKEND_BASE}/stream/${chatId}/${messageId}`;
}

/**
 * Constructs a Telegram file download URL via the HF Telethon backend.
 * Used for downloading attachments (PDFs, ZIPs, SQL files, etc.) from Telegram messages.
 *
 * @param channelId - Frontend channel ID
 * @param messageId - Telegram message ID
 * @param fileName  - Original file name for Content-Disposition header
 */
export function getDownloadUrl(channelId: string, messageId: number, fileName: string): string {
  const chatId = CHANNEL_CHAT_ID_MAP[channelId] || channelId;
  if (!chatId || !messageId) return '#';
  return `${BACKEND_BASE}/api/download/${chatId}/${messageId}?file_name=${encodeURIComponent(fileName)}`;
}

/**
 * Fetches the video catalog from all 4 configured Telegram channels.
 * This calls the backend's /api/catalog/all endpoint.
 */
export async function fetchCatalog(): Promise<Record<string, unknown[]>> {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetch(`${BACKEND_BASE}/api/catalog/all`);
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      if (attempt < maxRetries) {
        // Wait 2s, 4s between retries while Render spins up
        await new Promise((res) => setTimeout(res, 2000 * attempt));
        continue;
      }
    }
  }
  return {};
}

/**
 * Checks if the Telethon backend is reachable and the bot is connected.
 */
export async function checkBackendHealth(): Promise<{ online: boolean; details?: unknown }> {
  try {
    const resp = await fetch(`${BACKEND_BASE}/`, { signal: AbortSignal.timeout(8000) });
    if (resp.ok) {
      const data = await resp.json();
      return { online: true, details: data };
    }
    return { online: false };
  } catch {
    return { online: false };
  }
}

/** Expose the base URL for debugging / display */
export const TELEGRAM_BACKEND_URL = BACKEND_BASE;
