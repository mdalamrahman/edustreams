/**
 * Central Supabase-backed DSA Progress Service
 * Manages solved problems, bookmarks/revision list, active sheet, LLD solved problems,
 * linked developer profiles, and study analytics in Supabase with zero reliance on fragmented local storage.
 */

import { supabase, supabaseAdmin } from './supabase';
import { TELEGRAM_BACKEND_URL } from './telegram';
import { SDE_SHEET_191_DATA, A2Z_DSA_SHEET_474_DATA, SDETUBE_79_SHEET_DATA, BLIND_75_SHEET_DATA, CODESTORYWITHMIK_SHEET_DATA, getLeetCodeSlug } from './dsaSheetsData';

export interface LinkedProfilesConfig {
  leetcodeUsername: string;
  githubUsername: string;
  gfgUsername?: string;
  codeforcesHandle?: string;
  bio?: string;
  customAvatar?: string;
  autoSyncCloud?: boolean;
  designTierPreference?: 'standard' | 'ai_studio'; // 'standard' = ₹0.20 (Standard Diagram), 'ai_studio' = ₹0.60 (AI-Powered Studio)
}

export interface UserDSAProgress {
  user_email: string;
  user_id?: string;
  active_sheet: 'sde' | 'a2z' | '79' | 'blind75' | 'mik';
  solved_sde: number[];
  solved_a2z: number[];
  solved_79: number[];
  solved_blind75: number[];
  solved_mik: number[];
  lld_solved_ids: number[];
  revision_ids: string[];
  linked_profiles: LinkedProfilesConfig;
  active_mins: number;
  updated_at?: string;
}

const DEFAULT_LINKED_PROFILES: LinkedProfilesConfig = {
  leetcodeUsername: '',
  githubUsername: '',
  gfgUsername: '',
  codeforcesHandle: '',
  bio: 'Software Development Engineer & DSA Enthusiast on SDETube.',
  autoSyncCloud: false,
  designTierPreference: 'standard'
};

// In-Memory Progress Cache for instant 0ms synchronous UI reads
const progressCache = new Map<string, UserDSAProgress>();
const solvedSlugsCache = new Set<string>();
const solvedNamesCache = new Set<string>();

const sdeProblemMap = new Map<number, any>();
(SDE_SHEET_191_DATA || []).forEach(p => sdeProblemMap.set(p.id, p));

const a2zProblemMap = new Map<number, any>();
(A2Z_DSA_SHEET_474_DATA || []).forEach(p => a2zProblemMap.set(p.id, p));

const sde79ProblemMap = new Map<number, any>();
(SDETUBE_79_SHEET_DATA || []).forEach(p => sde79ProblemMap.set(p.id, p));

const blind75ProblemMap = new Map<number, any>();
(BLIND_75_SHEET_DATA || []).forEach(p => blind75ProblemMap.set(p.id, p));

const mikProblemMap = new Map<number, any>();
(CODESTORYWITHMIK_SHEET_DATA || []).forEach(p => mikProblemMap.set(p.id, p));

/**
 * Gets the active logged-in user email
 */
export function getCurrentUserEmail(): string {
  if (typeof window === 'undefined') return 'mdalamrahman4@gmail.com';
  try {
    const rawSession = localStorage.getItem('edustream_student_session');
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed?.email) return parsed.email.trim().toLowerCase();
    }
  } catch {}
  return 'mdalamrahman4@gmail.com';
}

/**
 * Helper: Migrates legacy localStorage keys to the Supabase dataset (one-time fallback)
 */
function scanLegacyLocalStorage(email: string): UserDSAProgress {
  const result: UserDSAProgress = {
    user_email: email,
    user_id: '',
    active_sheet: 'sde',
    solved_sde: [],
    solved_a2z: [],
    solved_79: [],
    solved_blind75: [],
    solved_mik: [],
    lld_solved_ids: [],
    revision_ids: [],
    linked_profiles: { ...DEFAULT_LINKED_PROFILES },
    active_mins: 0
  };

  if (typeof window === 'undefined') return result;

  try {
    const sde = localStorage.getItem('sdetube_dsa_sheet_solved_sde') || localStorage.getItem('sdetube_sde_sheet_solved_ids');
    if (sde) result.solved_sde = JSON.parse(sde);

    const a2z = localStorage.getItem('sdetube_dsa_sheet_solved_a2z');
    if (a2z) result.solved_a2z = JSON.parse(a2z);

    const s79 = localStorage.getItem('sdetube_dsa_sheet_solved_79');
    if (s79) result.solved_79 = JSON.parse(s79);

    const b75 = localStorage.getItem('sdetube_dsa_sheet_solved_blind75');
    if (b75) result.solved_blind75 = JSON.parse(b75);

    const mik = localStorage.getItem('sdetube_dsa_sheet_solved_mik');
    if (mik) result.solved_mik = JSON.parse(mik);

    const lld = localStorage.getItem('sdetube_lld_solved_ids') || localStorage.getItem('sdetube_lld_solved_problems');
    if (lld) result.lld_solved_ids = JSON.parse(lld);

    const rev = localStorage.getItem('sdetube_dsa_revision_ids');
    if (rev) result.revision_ids = JSON.parse(rev);

    const sheet = localStorage.getItem('sdetube_active_dsa_sheet');
    if (sheet && ['sde', 'a2z', '79', 'blind75', 'mik'].includes(sheet)) {
      result.active_sheet = sheet as any;
    }

    const profiles = localStorage.getItem(`sdetube_linked_dev_profiles_${email}`) || localStorage.getItem('sdetube_linked_dev_profiles');
    if (profiles) result.linked_profiles = JSON.parse(profiles);

    const mins = localStorage.getItem('edustream_active_mins');
    if (mins) result.active_mins = parseFloat(mins);
  } catch (err) {
    console.warn('[Legacy LocalStorage Scan Notice]:', err);
  }

  return result;
}

/**
 * Initializes and fetches the user's progress from Supabase / Backend
 */
export async function loadUserProgress(targetEmail?: string): Promise<UserDSAProgress> {
  const email = (targetEmail || getCurrentUserEmail()).trim().toLowerCase();

  // 1. Check in-memory cache
  if (progressCache.has(email)) {
    return progressCache.get(email)!;
  }

  // 2. Direct Supabase Query
  let supaProgress: UserDSAProgress | null = null;
  try {
    const { data, error } = await supabase
      .from('user_dsa_progress')
      .select('*')
      .eq('user_email', email)
      .maybeSingle();

    if (!error && data) {
      supaProgress = {
        user_email: email,
        user_id: data.user_id || '',
        active_sheet: data.active_sheet || 'sde',
        solved_sde: Array.isArray(data.solved_sde) ? data.solved_sde : JSON.parse(data.solved_sde || '[]'),
        solved_a2z: Array.isArray(data.solved_a2z) ? data.solved_a2z : JSON.parse(data.solved_a2z || '[]'),
        solved_79: Array.isArray(data.solved_79) ? data.solved_79 : JSON.parse(data.solved_79 || '[]'),
        solved_blind75: Array.isArray(data.solved_blind75) ? data.solved_blind75 : JSON.parse(data.solved_blind75 || '[]'),
        solved_mik: Array.isArray(data.solved_mik) ? data.solved_mik : JSON.parse(data.solved_mik || '[]'),
        lld_solved_ids: Array.isArray(data.lld_solved_ids) ? data.lld_solved_ids : JSON.parse(data.lld_solved_ids || '[]'),
        revision_ids: Array.isArray(data.revision_ids) ? data.revision_ids : JSON.parse(data.revision_ids || '[]'),
        linked_profiles: typeof data.linked_profiles === 'object' && data.linked_profiles !== null 
          ? data.linked_profiles 
          : JSON.parse(data.linked_profiles || '{}'),
        active_mins: Number(data.active_mins || 0),
        updated_at: data.updated_at
      };
    }
  } catch (err) {
    console.warn('[Supabase loadUserProgress Notice]:', err);
  }

  // 3. Fallback to Backend API
  if (!supaProgress) {
    try {
      const res = await fetch(`${TELEGRAM_BACKEND_URL}/api/user-progress/${encodeURIComponent(email)}`, {
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.progress && json.progress.user_email) {
          supaProgress = json.progress;
        }
      }
    } catch {}
  }

  // 4. If still no record, perform seamless one-time migration from local storage
  if (!supaProgress) {
    supaProgress = scanLegacyLocalStorage(email);
    // Push migrated data up to Supabase in background
    saveUserProgress(supaProgress, email).catch(() => {});
  }

  // 5. Populate caches and heal/sanitize any contaminated local storage keys
  progressCache.set(email, supaProgress);
  updateSlugsCacheFromProgress(supaProgress);

  if (typeof localStorage !== 'undefined' && supaProgress) {
    try {
      localStorage.setItem('sdetube_dsa_sheet_solved_sde', JSON.stringify(supaProgress.solved_sde || []));
      localStorage.setItem('sdetube_sde_sheet_solved_ids', JSON.stringify(supaProgress.solved_sde || []));
      localStorage.setItem('sdetube_dsa_sheet_solved_a2z', JSON.stringify(supaProgress.solved_a2z || []));
      localStorage.setItem('sdetube_dsa_sheet_solved_79', JSON.stringify(supaProgress.solved_79 || []));
      localStorage.setItem('sdetube_dsa_sheet_solved_blind75', JSON.stringify(supaProgress.solved_blind75 || []));
      localStorage.setItem('sdetube_dsa_sheet_solved_mik', JSON.stringify(supaProgress.solved_mik || []));
    } catch {}
  }

  return supaProgress;
}

/**
 * Synchronous read of current cached progress
 */
export function getUserProgressSync(targetEmail?: string): UserDSAProgress {
  const email = (targetEmail || getCurrentUserEmail()).trim().toLowerCase();
  if (progressCache.has(email)) {
    return progressCache.get(email)!;
  }
  // If not yet loaded into memory, read from legacy local storage as instant seed
  const seeded = scanLegacyLocalStorage(email);
  progressCache.set(email, seeded);
  // Trigger background async load from Supabase
  loadUserProgress(email).catch(() => {});
  return seeded;
}

/**
 * Saves and syncs progress to Supabase and Backend
 */
export async function saveUserProgress(patch: Partial<UserDSAProgress>, targetEmail?: string): Promise<void> {
  const email = (targetEmail || getCurrentUserEmail()).trim().toLowerCase();
  const current = getUserProgressSync(email);

  const updated: UserDSAProgress = {
    ...current,
    ...patch,
    user_email: email,
    updated_at: new Date().toISOString()
  };

  // Update in-memory cache immediately
  progressCache.set(email, updated);
  updateSlugsCacheFromProgress(updated);

  // Broadcast event to refresh all listening UI components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sdetube_progress_updated', { detail: updated }));
    window.dispatchEvent(new CustomEvent('sdetube_problem_solved', { detail: updated }));
  }

  // 1. Direct Supabase Upsert
  try {
    await supabaseAdmin
      .from('user_dsa_progress')
      .upsert({
        user_email: email,
        user_id: updated.user_id || '',
        active_sheet: updated.active_sheet || 'sde',
        solved_sde: updated.solved_sde || [],
        solved_a2z: updated.solved_a2z || [],
        solved_79: updated.solved_79 || [],
        solved_blind75: updated.solved_blind75 || [],
        solved_mik: updated.solved_mik || [],
        lld_solved_ids: updated.lld_solved_ids || [],
        revision_ids: updated.revision_ids || [],
        linked_profiles: updated.linked_profiles || DEFAULT_LINKED_PROFILES,
        active_mins: updated.active_mins || 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_email' });
  } catch (err) {
    console.warn('[Supabase Progress Save Notice]:', err);
  }

  // 2. Backend API Backup
  try {
    fetch(`${TELEGRAM_BACKEND_URL}/api/user-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(() => {});
  } catch {}
}

/**
 * Returns solved problem IDs for a specific sheet
 */
export function getSolvedIds(sheet: string, email?: string): number[] {
  const prog = getUserProgressSync(email);
  switch (sheet) {
    case 'sde':
    case 'sde191':
      return prog.solved_sde || [];
    case 'a2z':
      return prog.solved_a2z || [];
    case '79':
      return prog.solved_79 || [];
    case 'blind75':
      return prog.solved_blind75 || [];
    case 'mik':
    case 'codestorywithmik':
      return prog.solved_mik || [];
    default:
      return prog.solved_sde || [];
  }
}

/**
 * Sets solved problem IDs for a specific sheet
 */
export async function setSolvedIds(sheet: string, ids: number[], email?: string): Promise<void> {
  const patch: Partial<UserDSAProgress> = {};
  switch (sheet) {
    case 'sde':
    case 'sde191':
      patch.solved_sde = Array.from(new Set(ids));
      break;
    case 'a2z':
      patch.solved_a2z = Array.from(new Set(ids));
      break;
    case '79':
      patch.solved_79 = Array.from(new Set(ids));
      break;
    case 'blind75':
      patch.solved_blind75 = Array.from(new Set(ids));
      break;
    case 'mik':
    case 'codestorywithmik':
      patch.solved_mik = Array.from(new Set(ids));
      break;
    default:
      patch.solved_sde = Array.from(new Set(ids));
  }
  await saveUserProgress(patch, email);
}

/**
 * Toggles a problem's solved state for a sheet
 */
export async function toggleProblemSolved(sheet: string, problemId: number, email?: string, slug?: string): Promise<boolean> {
  const currentIds = getSolvedIds(sheet, email);
  const exists = currentIds.includes(problemId);
  const nextIds = exists ? currentIds.filter(id => id !== problemId) : [...currentIds, problemId];
  
  if (slug) {
    const clean = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (exists) {
      solvedSlugsCache.delete(clean);
    } else {
      solvedSlugsCache.add(clean);
    }
  }

  await setSolvedIds(sheet, nextIds, email);
  return !exists;
}

/**
 * Gets revision / bookmark IDs
 */
export function getRevisionIds(email?: string): string[] {
  return getUserProgressSync(email).revision_ids || [];
}

/**
 * Sets revision IDs
 */
export async function setRevisionIds(ids: string[], email?: string): Promise<void> {
  await saveUserProgress({ revision_ids: Array.from(new Set(ids)) }, email);
}

/**
 * Toggles revision mark
 */
export async function toggleRevisionId(id: string, email?: string): Promise<boolean> {
  const current = getRevisionIds(email);
  const exists = current.includes(id);
  const next = exists ? current.filter(item => item !== id) : [...current, id];
  await setRevisionIds(next, email);
  return !exists;
}

/**
 * Gets LLD solved IDs
 */
export function getLLDSolvedIds(email?: string): number[] {
  return getUserProgressSync(email).lld_solved_ids || [];
}

/**
 * Sets LLD solved IDs
 */
export async function setLLDSolvedIds(ids: number[], email?: string): Promise<void> {
  await saveUserProgress({ lld_solved_ids: Array.from(new Set(ids)) }, email);
}

/**
 * Toggles LLD problem solved
 */
export async function toggleLLDSolvedId(id: number, email?: string): Promise<boolean> {
  const current = getLLDSolvedIds(email);
  const exists = current.includes(id);
  const next = exists ? current.filter(item => item !== id) : [...current, id];
  await setLLDSolvedIds(next, email);
  return !exists;
}

/**
 * Gets active DSA sheet selection
 */
export function getActiveSheet(email?: string): 'sde' | 'a2z' | '79' | 'blind75' | 'mik' {
  return getUserProgressSync(email).active_sheet || 'sde';
}

/**
 * Sets active DSA sheet selection
 */
export async function setActiveSheet(sheet: 'sde' | 'a2z' | '79' | 'blind75' | 'mik', email?: string): Promise<void> {
  await saveUserProgress({ active_sheet: sheet }, email);
}

/**
 * Gets linked profiles config
 */
export function getLinkedProfiles(email?: string): LinkedProfilesConfig {
  return getUserProgressSync(email).linked_profiles || DEFAULT_LINKED_PROFILES;
}

/**
 * Saves linked profiles config
 */
export async function saveLinkedProfiles(config: LinkedProfilesConfig, email?: string): Promise<void> {
  await saveUserProgress({ linked_profiles: config }, email);
}

/**
 * Checks whether automatic cloud code sync is enabled for user
 */
export function isCloudAutoSyncEnabled(email?: string): boolean {
  try {
    const local = localStorage.getItem('edustream_cloud_autosync_enabled');
    if (local !== null) return local === 'true';
    const cfg = getLinkedProfiles(email);
    return Boolean(cfg?.autoSyncCloud);
  } catch {
    return false;
  }
}

/**
 * Sets automatic cloud code sync preference for user in localStorage and Supabase
 */
export async function setCloudAutoSyncEnabled(enabled: boolean, email?: string): Promise<void> {
  try {
    localStorage.setItem('edustream_cloud_autosync_enabled', String(enabled));
    const cfg = { ...getLinkedProfiles(email), autoSyncCloud: enabled };
    await saveLinkedProfiles(cfg, email);
  } catch {}
}

/**
 * Records study minutes
 */
export async function recordStudyMinutes(deltaMins: number, email?: string): Promise<void> {
  const current = getUserProgressSync(email);
  const nextMins = Number((current.active_mins + deltaMins).toFixed(2));
  await saveUserProgress({ active_mins: nextMins }, email);
}

/**
 * Checks if a problem slug or title is solved across any sheet
 */
export function isProblemSlugSolved(slugOrName?: string, email?: string): boolean {
  if (!slugOrName) return false;
  const raw = String(slugOrName).toLowerCase().replace(/^\d+[\s\.\-_]+/, '');
  const canonical = raw.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const compact = raw.replace(/[^a-z0-9]/g, '');
  if (!compact) return false;

  if (solvedSlugsCache.has(canonical) || solvedSlugsCache.has(compact) || solvedNamesCache.has(compact)) {
    return true;
  }

  const prog = getUserProgressSync(email);
  updateSlugsCacheFromProgress(prog);

  return solvedSlugsCache.has(canonical) || solvedSlugsCache.has(compact) || solvedNamesCache.has(compact);
}

/**
 * Fetches all users' progress rows from Supabase for the Admin Dashboard
 */
export async function fetchAllUsersProgressForAdmin(): Promise<UserDSAProgress[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_dsa_progress')
      .select('*');

    if (!error && data && data.length > 0) {
      return data.map(row => ({
        user_email: row.user_email,
        user_id: row.user_id || '',
        active_sheet: row.active_sheet || 'sde',
        solved_sde: Array.isArray(row.solved_sde) ? row.solved_sde : JSON.parse(row.solved_sde || '[]'),
        solved_a2z: Array.isArray(row.solved_a2z) ? row.solved_a2z : JSON.parse(row.solved_a2z || '[]'),
        solved_79: Array.isArray(row.solved_79) ? row.solved_79 : JSON.parse(row.solved_79 || '[]'),
        solved_blind75: Array.isArray(row.solved_blind75) ? row.solved_blind75 : JSON.parse(row.solved_blind75 || '[]'),
        solved_mik: Array.isArray(row.solved_mik) ? row.solved_mik : JSON.parse(row.solved_mik || '[]'),
        lld_solved_ids: Array.isArray(row.lld_solved_ids) ? row.lld_solved_ids : JSON.parse(row.lld_solved_ids || '[]'),
        revision_ids: Array.isArray(row.revision_ids) ? row.revision_ids : JSON.parse(row.revision_ids || '[]'),
        linked_profiles: typeof row.linked_profiles === 'object' && row.linked_profiles !== null 
          ? row.linked_profiles 
          : JSON.parse(row.linked_profiles || '{}'),
        active_mins: Number(row.active_mins || 0),
        updated_at: row.updated_at
      }));
    }
  } catch (err) {
    console.warn('[Supabase fetchAllUsersProgressForAdmin Notice]:', err);
  }

  // Fallback to Backend API
  try {
    const res = await fetch(`${TELEGRAM_BACKEND_URL}/api/admin/users-progress`);
    if (res.ok) {
      const json = await res.json();
      if (json?.users && Array.isArray(json.users)) {
        return json.users;
      }
    }
  } catch {}

  return Array.from(progressCache.values());
}

/**
 * Internal helper to populate slug lookup cache
 */
function updateSlugsCacheFromProgress(prog: UserDSAProgress): void {
  const addProblem = (prob?: any) => {
    if (!prob) return;
    const raw = getLeetCodeSlug(prob) || prob.slug || prob.name;
    const clean = String(raw).toLowerCase().replace(/^\d+[\s\.\-_]+/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (clean && clean.length > 2 && clean !== 'problem') {
      solvedSlugsCache.add(clean);
      solvedSlugsCache.add(clean.replace(/[^a-z0-9]/g, ''));
    }
    const nameClean = String(prob.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (nameClean) solvedNamesCache.add(nameClean);
  };

  (prog.solved_sde || []).forEach(id => addProblem(sdeProblemMap.get(id)));
  (prog.solved_a2z || []).forEach(id => addProblem(a2zProblemMap.get(id)));
  (prog.solved_79 || []).forEach(id => addProblem(sde79ProblemMap.get(id)));
  (prog.solved_blind75 || []).forEach(id => addProblem(blind75ProblemMap.get(id)));
  (prog.solved_mik || []).forEach(id => addProblem(mikProblemMap.get(id)));
}

// Pre-load current user on startup
if (typeof window !== 'undefined') {
  loadUserProgress().catch(() => {});
}
