import { Redis } from '@upstash/redis';
import { supabaseAdmin } from './supabase';

export const UPSTASH_REDIS_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_UPSTASH_REDIS_REST_URL) ||
  'https://organic-tahr-192308.upstash.io';

export const UPSTASH_REDIS_TOKEN =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_UPSTASH_REDIS_REST_TOKEN) ||
  'gQAAAAAAAu80AAIgcDI0MDVlNzYxY2RlMDE0MmUzYTBkMTc5MzU4ZDI1YTJlMA';

/**
 * Global Upstash Redis REST Client instance.
 * Safe for use in browser, edge workers, and Node environments.
 */
export const redis = new Redis({
  url: UPSTASH_REDIS_URL,
  token: UPSTASH_REDIS_TOKEN,
});

const BACKEND_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
  'https://edustream-backend-90vm.onrender.com';

// 5 minutes TTL in seconds (300s)
export const USAGE_PRICE_TTL_SECONDS = 300;

// ==========================================
// 1. REALTIME TRANSCRIPT STATUS TYPES & API
// ==========================================

export type TranscriptProcessingStage =
  | 'idle'
  | 'initializing'
  | 'downloading_media'
  | 'extracting_audio'
  | 'transcribing'
  | 'synthesizing_ai'
  | 'completed'
  | 'failed';

export interface RealtimeTranscriptStatus {
  key: string;
  videoId?: string;
  chatId?: string;
  msgId?: number | string;
  title?: string;
  status: TranscriptProcessingStage;
  progressPercent: number; // 0.0 to 100.0
  currentPart?: number;
  totalParts?: number;
  stage?: string;
  hasArtifacts?: boolean;
  estimatedSecondsLeft?: number;
  transcriptSnippet?: string;
  lastUpdated: string;
  source: 'redis' | 'db' | 'backend';
}

export function sanitizeKey(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase();
}

/**
 * Stores or updates realtime transcript processing status in Redis.
 * Also synchronizes completed status / transcript snippets back with database.
 */
export async function setRealtimeTranscriptStatus(
  videoIdOrKey: string,
  updates: Partial<RealtimeTranscriptStatus>,
  syncWithDb: boolean = true
): Promise<RealtimeTranscriptStatus | null> {
  const cleanId = sanitizeKey(videoIdOrKey);
  const redisKey = `transcript:status:${cleanId}`;

  try {
    const existing = await redis.get<RealtimeTranscriptStatus>(redisKey).catch(() => null);

    const merged: RealtimeTranscriptStatus = {
      key: cleanId,
      videoId: updates.videoId || existing?.videoId || cleanId,
      chatId: updates.chatId || existing?.chatId,
      msgId: updates.msgId || existing?.msgId,
      title: updates.title || existing?.title,
      status: updates.status || existing?.status || 'initializing',
      progressPercent: updates.progressPercent !== undefined ? updates.progressPercent : (existing?.progressPercent || 0),
      currentPart: updates.currentPart || existing?.currentPart || 1,
      totalParts: updates.totalParts || existing?.totalParts || 30,
      stage: updates.stage || existing?.stage || 'Processing transcript stream',
      hasArtifacts: updates.hasArtifacts !== undefined ? updates.hasArtifacts : (existing?.hasArtifacts || false),
      estimatedSecondsLeft: updates.estimatedSecondsLeft !== undefined ? updates.estimatedSecondsLeft : existing?.estimatedSecondsLeft,
      transcriptSnippet: updates.transcriptSnippet || existing?.transcriptSnippet,
      lastUpdated: new Date().toISOString(),
      source: 'redis'
    };

    // Store in Redis (24-hour retention for completed jobs, 180s for active in-progress jobs)
    const isCompleted = merged.status === 'completed' || merged.progressPercent >= 100;
    await redis.set(redisKey, merged, { ex: isCompleted ? 86400 : 180 });

    // Broadcast update via custom DOM event for active UI components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sdetube_transcript_status_updated', { detail: merged }));
    }

    // Synchronize with database if requested and status is completed or has snippet
    if (syncWithDb && (merged.status === 'completed' || merged.transcriptSnippet)) {
      syncTranscriptStatusWithDb(merged).catch((e) => {
        console.warn('[Redis-to-DB Transcript Sync Notice]:', e);
      });
    }

    return merged;
  } catch (err) {
    console.warn('[Upstash Redis setRealtimeTranscriptStatus Error]:', err);
    return null;
  }
}

/**
 * Retrieves the latest realtime transcript status:
 * 1. Checks Upstash Redis first (sub-millisecond fast hit)
 * 2. Falls back to database/backend, populates Redis, and returns the status.
 */
export async function getRealtimeTranscriptStatus(
  videoIdOrKey: string,
  chatId?: string,
  msgId?: number | string,
  title?: string
): Promise<RealtimeTranscriptStatus | null> {
  const cleanId = sanitizeKey(videoIdOrKey);
  const redisKey = `transcript:status:${cleanId}`;

  try {
    // 1. Upstash Redis fast hit
    const cached = await redis.get<RealtimeTranscriptStatus>(redisKey).catch(() => null);
    if (cached) {
      // If completed or 100%, return immediately
      if (cached.status === 'completed' || cached.progressPercent >= 100) {
        return cached;
      }
      // If in progress and updated within last 2 seconds, return cached to avoid hammering backend
      const ageMs = cached.lastUpdated ? Date.now() - new Date(cached.lastUpdated).getTime() : 99999;
      if (ageMs < 2000) {
        return cached;
      }
    }

    // 2. Query backend for live status update if chatId and msgId provided
    if (chatId && msgId) {
      try {
        const resp = await fetch(`${BACKEND_URL}/api/transcript/status/${chatId}/${msgId}?title=${encodeURIComponent(title || '')}`, {
          signal: AbortSignal.timeout(3500)
        });
        if (resp.ok) {
          const data = await resp.json();
          const isComplete = data.status === 'completed' || data.has_artifacts || Number(data.progress_percent || 0) >= 100;
          const fromBackend: RealtimeTranscriptStatus = {
            key: cleanId,
            videoId: cleanId,
            chatId,
            msgId,
            title,
            status: isComplete ? 'completed' : 'transcribing',
            progressPercent: isComplete ? 100 : Number(data.progress_percent || (data.status === 'completed' ? 100 : 25)),
            currentPart: data.current_part || 1,
            totalParts: data.total_parts || 30,
            stage: isComplete ? 'Completed' : (data.stage || 'In progress'),
            hasArtifacts: isComplete || Boolean(data.has_artifacts),
            estimatedSecondsLeft: isComplete ? 0 : data.estimated_seconds_left,
            lastUpdated: new Date().toISOString(),
            source: 'backend'
          };
          // Cache in Redis (86400s if completed, 180s if in progress)
          await redis.set(redisKey, fromBackend, { ex: isComplete ? 86400 : 180 }).catch(() => {});
          return fromBackend;
        }
      } catch (_) {}
    }

    // 3. If cached status existed (even if slightly older), return it as fallback
    if (cached) {
      return cached;
    }

    // 4. Fallback to Supabase video table
    try {
      const { data } = await supabaseAdmin
        .from('videos')
        .select('id, title, transcript')
        .or(`id.eq.${cleanId},telegram_message_id.eq.${msgId || -1}`)
        .limit(1)
        .maybeSingle();

      if (data && data.transcript && data.transcript.length > 50) {
        const fromDb: RealtimeTranscriptStatus = {
          key: cleanId,
          videoId: String(data.id),
          title: data.title,
          status: 'completed',
          progressPercent: 100,
          currentPart: 30,
          totalParts: 30,
          stage: 'Completed (Synchronized from DB)',
          hasArtifacts: true,
          estimatedSecondsLeft: 0,
          transcriptSnippet: data.transcript.slice(0, 200),
          lastUpdated: new Date().toISOString(),
          source: 'db'
        };
        await redis.set(redisKey, fromDb, { ex: 86400 }).catch(() => {});
        return fromDb;
      }
    } catch (_) {}

    return null;
  } catch (err) {
    console.warn('[Upstash Redis getRealtimeTranscriptStatus Error]:', err);
    return null;
  }
}

/**
 * Subscribes to realtime transcript status via polling against Upstash Redis.
 * Calls callback on status update and returns unsubscribe function.
 */
export function subscribeRealtimeTranscriptStatus(
  videoIdOrKey: string,
  onUpdate: (status: RealtimeTranscriptStatus) => void,
  intervalMs: number = 2500
): () => void {
  let isCancelled = false;

  const poll = async () => {
    if (isCancelled) return;
    const status = await getRealtimeTranscriptStatus(videoIdOrKey);
    if (status && !isCancelled) {
      onUpdate(status);
      if (status.status === 'completed' || status.status === 'failed') {
        return; // stop polling once terminal state reached
      }
    }
  };

  poll();
  const timer = setInterval(poll, intervalMs);

  return () => {
    isCancelled = true;
    clearInterval(timer);
  };
}

/**
 * Helper to sync completed transcript status back into database
 */
async function syncTranscriptStatusWithDb(status: RealtimeTranscriptStatus): Promise<void> {
  if (status.videoId && status.status === 'completed') {
    try {
      // Sync with Supabase
      await supabaseAdmin
        .from('videos')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', status.videoId);
    } catch (_) {}
  }
}

// ==========================================
// 2. USAGE PRICING WITH 5-MIN TTL & DB SYNC
// ==========================================

export interface UsagePriceRecord {
  id: string;
  userEmail: string;
  category: string;
  price: number; // in ₹ credits
  description: string;
  balanceAfter?: number;
  metadata?: Record<string, any>;
  timestamp: string;
  expiresAt: string;
  ttlSeconds: number;
  syncedWithDb: boolean;
}

/**
 * Stores the price of each usage in Upstash Redis with a TTL of 5 minutes (300 seconds),
 * while keeping in sync with the database (SQLite backend + Supabase).
 */
export async function storeUsagePriceInRedis(params: {
  userEmail: string;
  category: string;
  price: number;
  description: string;
  balanceAfter?: number;
  metadata?: Record<string, any>;
  syncWithDb?: boolean;
}): Promise<UsagePriceRecord | null> {
  const cleanEmail = (params.userEmail || 'student@sdetube.com').toLowerCase().trim();
  const usageId = `usage_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + USAGE_PRICE_TTL_SECONDS * 1000).toISOString();

  const record: UsagePriceRecord = {
    id: usageId,
    userEmail: cleanEmail,
    category: params.category,
    price: parseFloat(Number(params.price || 0).toFixed(4)),
    description: params.description || `Platform usage: ${params.category}`,
    balanceAfter: params.balanceAfter !== undefined ? parseFloat(Number(params.balanceAfter).toFixed(4)) : undefined,
    metadata: params.metadata,
    timestamp: now.toISOString(),
    expiresAt,
    ttlSeconds: USAGE_PRICE_TTL_SECONDS,
    syncedWithDb: false
  };

  try {
    const itemKey = `usage:price:${cleanEmail}:${usageId}`;
    const latestKey = `usage:latest:${cleanEmail}`;
    const indexKey = `usage:recent_ids:${cleanEmail}`;

    // 1. Store individual usage with 5-minute TTL (300 seconds) in Redis
    await redis.set(itemKey, record, { ex: USAGE_PRICE_TTL_SECONDS });

    // 2. Store latest usage pointer with 5-minute TTL
    await redis.set(latestKey, record, { ex: USAGE_PRICE_TTL_SECONDS });

    // 3. Append to recent usage IDs list for this user (with 5 min TTL)
    try {
      const existingList = (await redis.get<string[]>(indexKey).catch(() => null)) || [];
      const updatedList = [itemKey, ...existingList.slice(0, 19)]; // keep up to 20 recent
      await redis.set(indexKey, updatedList, { ex: USAGE_PRICE_TTL_SECONDS });
    } catch (_) {}

    // 4. Synchronize with database if requested (default: true)
    if (params.syncWithDb !== false) {
      syncUsageWithDb(record).then((synced) => {
        if (synced) {
          record.syncedWithDb = true;
          // Refresh Redis record with synced flag
          redis.set(itemKey, record, { ex: USAGE_PRICE_TTL_SECONDS }).catch(() => {});
        }
      }).catch((e) => {
        console.warn('[Usage DB Sync Notice]:', e);
      });
    }

    return record;
  } catch (err) {
    console.warn('[Upstash Redis storeUsagePriceInRedis Error]:', err);
    return null;
  }
}

/**
 * Retrieves the latest active usage price for a user from Redis (within 5-min TTL).
 */
export async function getLatestUsagePriceFromRedis(userEmail: string): Promise<UsagePriceRecord | null> {
  const cleanEmail = (userEmail || 'student@sdetube.com').toLowerCase().trim();
  const latestKey = `usage:latest:${cleanEmail}`;
  try {
    return await redis.get<UsagePriceRecord>(latestKey);
  } catch (err) {
    console.warn('[Upstash Redis getLatestUsagePriceFromRedis Error]:', err);
    return null;
  }
}

/**
 * Retrieves all currently active usage price records for a user within the 5-minute TTL.
 */
export async function getActiveUsagesFromRedis(userEmail: string): Promise<UsagePriceRecord[]> {
  const cleanEmail = (userEmail || 'student@sdetube.com').toLowerCase().trim();
  const indexKey = `usage:recent_ids:${cleanEmail}`;

  try {
    const keys = await redis.get<string[]>(indexKey).catch(() => null);
    if (!keys || keys.length === 0) {
      // Fallback: check latest
      const latest = await getLatestUsagePriceFromRedis(cleanEmail);
      return latest ? [latest] : [];
    }

    const records: UsagePriceRecord[] = [];
    for (const key of keys) {
      try {
        const item = await redis.get<UsagePriceRecord>(key);
        if (item) {
          records.push(item);
        }
      } catch (_) {}
    }

    return records;
  } catch (err) {
    console.warn('[Upstash Redis getActiveUsagesFromRedis Error]:', err);
    return [];
  }
}

/**
 * Caches live platform pricing config in Redis with a 5-minute TTL (keeping sync with DB).
 */
export async function cachePricingConfigInRedis(pricing: Record<string, number>): Promise<void> {
  try {
    await redis.set('platform:pricing:config', pricing, { ex: USAGE_PRICE_TTL_SECONDS });
  } catch (err) {
    console.warn('[Upstash Redis cachePricingConfigInRedis Error]:', err);
  }
}

/**
 * Retrieves cached live platform pricing config from Redis (if within 5-min TTL).
 */
export async function getCachedPricingConfigFromRedis(): Promise<Record<string, number> | null> {
  try {
    return await redis.get<Record<string, number>>('platform:pricing:config');
  } catch (err) {
    console.warn('[Upstash Redis getCachedPricingConfigFromRedis Error]:', err);
    return null;
  }
}

/**
 * Internal helper: Synchronizes a usage price record with database backends:
 * 1. Backend SQLite database (`/api/billing/deduct`)
 * 2. Supabase (`user_dsa_progress` / audit logs)
 */
async function syncUsageWithDb(record: UsagePriceRecord): Promise<boolean> {
  try {
    // 1. Sync with backend SQLite
    const res = await fetch(`${BACKEND_URL}/api/billing/deduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: record.userEmail,
        amount: record.price,
        category: record.category,
        description: record.description
      })
    }).catch(() => null);

    if (res && res.ok) {
      return true;
    }
  } catch (_) {}

  // 2. Secondary fallback sync to Supabase progress/wallet if available
  try {
    const { error } = await supabaseAdmin
      .from('user_dsa_progress')
      .upsert({
        user_email: record.userEmail,
        last_active_at: new Date().toISOString()
      }, { onConflict: 'user_email' });

    return !error;
  } catch (_) {
    return false;
  }
}

/**
 * Diagnostic utility to test and benchmark the Upstash Redis connection.
 */
export async function testRedisConnection(): Promise<{ success: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    await redis.set('test:ping', 'pong', { ex: 60 });
    const val = await redis.get('test:ping');
    const latencyMs = Date.now() - start;
    if (val === 'pong') {
      return { success: true, latencyMs };
    }
    return { success: false, latencyMs, error: 'Ping response mismatch' };
  } catch (err: any) {
    return { success: false, latencyMs: Date.now() - start, error: err?.message || String(err) };
  }
}

// ============================================================================
// 6. UNIFIED RESUME ANALYST & FREEHIRE REDIS CACHING
// ============================================================================

export async function sha256Hex(input: string): Promise<string> {
  const normalized = input.trim().toLowerCase();
  try {
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(normalized);
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch (_) {}

  // Deterministic fallback hash if crypto.subtle is not accessible
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}

export async function buildResumeAnalysisCacheKey(params: {
  resumeText: string;
  includeSdeTubeData: boolean;
  userId?: string;
  sdeTubeTelemetryHash?: string;
  targetRole?: string;
  targetJobId?: string;
}): Promise<{ cacheKey: string; resumeHash: string }> {
  const fullHash = await sha256Hex(params.resumeText);
  const resumeHash = fullHash.slice(0, 24);
  const roleSlug = (params.targetRole || 'auto').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const jdSlug = params.targetJobId ? `jd_${params.targetJobId}` : 'general';

  if (!params.includeSdeTubeData) {
    return {
      resumeHash,
      cacheKey: `sdetube:analyst:v2:resume_only:${resumeHash}:${roleSlug}:${jdSlug}`,
    };
  }

  const uid = params.userId || 'anon';
  const telemetryHash = params.sdeTubeTelemetryHash || 'no_telemetry';
  return {
    resumeHash,
    cacheKey: `sdetube:analyst:v2:with_sdetube:${resumeHash}:${uid}:${telemetryHash}:${roleSlug}:${jdSlug}`,
  };
}

export async function getCachedResumeAnalysis<T = any>(cacheKey: string): Promise<T | null> {
  try {
    return await redis.get<T>(cacheKey);
  } catch (err) {
    console.warn('[Redis Cache Read Error]:', err);
    return null;
  }
}

export async function setCachedResumeAnalysis<T = any>(
  cacheKey: string,
  data: T,
  ttlSeconds: number = 86400 // 24 hours
): Promise<void> {
  try {
    await redis.set(cacheKey, data, { ex: ttlSeconds });
  } catch (err) {
    console.warn('[Redis Cache Write Error]:', err);
  }
}

