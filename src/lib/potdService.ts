/**
 * SDETube — POTD (Problem of the Day) Management & Synchronization Service
 * 
 * Enables administrators to override today's POTD from any existing DSA sheet
 * or provide a brand-new custom question. Synchronizes with Cloudflare R2 via
 * the backend API, updates browser localStorage, and dispatches real-time events.
 */

import { 
  DSAProblem, 
  SDE_SHEET_191_DATA, 
  A2Z_DSA_SHEET_474_DATA, 
  SDETUBE_79_SHEET_DATA, 
  BLIND_75_SHEET_DATA, 
  CODESTORYWITHMIK_SHEET_DATA 
} from './dsaSheetsData';
import { TELEGRAM_BACKEND_URL } from './telegram';

export interface AdminPotdRecord {
  id: number | string;
  name: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  topic?: string;
  leetcode?: string;
  url?: string;
  sheet?: string;
  description?: string;
  date: string;
  overridden_at?: string;
}

export interface CatalogProblemItem {
  id: number | string;
  name: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  leetcode?: string;
  sheet: string;
}

/**
 * Returns today's formatted UTC/local date string (YYYY-MM-DD).
 */
export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Checks localStorage for an active admin POTD override for the specified date.
 */
export function getLocalSdePotdOverride(date?: string): AdminPotdRecord | null {
  if (typeof window === 'undefined') return null;
  const targetDate = date || getTodayDateString();
  try {
    const raw = localStorage.getItem(`sdetube_custom_potd_${targetDate}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.name || parsed.title) && parsed.slug) {
        return parsed as AdminPotdRecord;
      }
    }
  } catch {}
  return null;
}

/**
 * Fetches the active POTD configuration from the backend (Cloudflare R2).
 * Synchronizes local cache if an override is returned.
 */
export async function fetchServerSdePotd(date?: string): Promise<{ isOverridden: boolean; problem: AdminPotdRecord | null }> {
  const targetDate = date || getTodayDateString();
  const backendBase = TELEGRAM_BACKEND_URL || '';
  try {
    const res = await fetch(`${backendBase}/api/potd/sdetube?date=${encodeURIComponent(targetDate)}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        if (data.isOverridden && data.problem) {
          try {
            localStorage.setItem(`sdetube_custom_potd_${targetDate}`, JSON.stringify(data.problem));
          } catch {}
          return { isOverridden: true, problem: data.problem };
        } else {
          // If server reports no override, clear stale local override
          try {
            localStorage.removeItem(`sdetube_custom_potd_${targetDate}`);
          } catch {}
          return { isOverridden: false, problem: null };
        }
      }
    }
  } catch (err) {
    console.warn('[potdService] Failed to fetch server POTD:', err);
  }

  // Fallback to local cache if offline
  const local = getLocalSdePotdOverride(targetDate);
  return { isOverridden: Boolean(local), problem: local };
}

export type AdminPotdInput = {
  id?: number | string;
  name?: string;
  title?: string;
  slug?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string;
  category?: string;
  topic?: string;
  leetcode?: string;
  url?: string;
  sheet?: string;
  description?: string;
  targetDate?: string;
};

/**
 * Sets an admin override for the POTD on the given date (defaults to today).
 * Updates localStorage, broadcasts sdetube_potd_updated, and pushes to backend.
 */
export async function setAdminPotdOverride(
  problem: AdminPotdInput
): Promise<{ success: boolean; problem: AdminPotdRecord; message?: string }> {
  const targetDate = problem.targetDate || getTodayDateString();
  const name = (problem.name || problem.title || 'Untitled Problem').trim();
  const slug = problem.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const difficulty = (problem.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium';
  const category = problem.category || (problem as any).topic || 'Algorithms';
  const leetcode = problem.leetcode || (problem as any).url || `https://leetcode.com/problems/${slug}/`;
  const sheet = problem.sheet || 'Admin Selection';

  const record: AdminPotdRecord = {
    id: problem.id || Date.now(),
    name,
    title: name,
    slug,
    difficulty,
    category,
    topic: category,
    leetcode,
    url: leetcode,
    sheet,
    description: problem.description || '',
    date: targetDate,
    overridden_at: new Date().toISOString()
  };

  // 1. Instant local cache update
  try {
    localStorage.setItem(`sdetube_custom_potd_${targetDate}`, JSON.stringify(record));
  } catch {}

  // 2. Broadcast window event for instant UI updates across tabs & modals
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sdetube_potd_updated', { detail: record }));
  }

  // 3. Persist to Backend API & Cloudflare R2
  const backendBase = TELEGRAM_BACKEND_URL || '';
  try {
    const res = await fetch(`${backendBase}/api/potd/sdetube`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, problem: record, message: data.message };
    }
  } catch (err) {
    console.warn('[potdService] Failed to push POTD to backend:', err);
  }

  return { success: true, problem: record, message: 'Saved locally and pending backend sync.' };
}

/**
 * Resets the POTD override back to the default rotational seed schedule.
 */
export async function resetAdminPotdOverride(date?: string): Promise<{ success: boolean; message: string }> {
  const targetDate = date || getTodayDateString();

  // 1. Clear local cache
  try {
    localStorage.removeItem(`sdetube_custom_potd_${targetDate}`);
  } catch {}

  // 2. Broadcast event to revert all UI components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sdetube_potd_updated', { detail: null }));
  }

  // 3. Delete from backend & Cloudflare R2
  const backendBase = TELEGRAM_BACKEND_URL || '';
  try {
    const res = await fetch(`${backendBase}/api/potd/sdetube?date=${encodeURIComponent(targetDate)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message || 'Reverted to rotational schedule' };
    }
  } catch (err) {
    console.warn('[potdService] Failed to reset backend POTD:', err);
  }

  return { success: true, message: 'Reverted to standard rotational schedule' };
}

/**
 * Returns a deduplicated, unified catalog of all available curated problems
 * from all DSA Sheets (1,000+ problems).
 */
export function getAllAvailableProblems(): CatalogProblemItem[] {
  const seenSlugs = new Set<string>();
  const catalog: CatalogProblemItem[] = [];

  const sheets: { name: string; data: DSAProblem[] }[] = [
    { name: 'SDE Sheet (191)', data: SDE_SHEET_191_DATA },
    { name: 'Striver A2Z (474)', data: A2Z_DSA_SHEET_474_DATA },
    { name: 'NeetCode Blind 75', data: BLIND_75_SHEET_DATA },
    { name: 'SDETube Core 79', data: SDETUBE_79_SHEET_DATA },
    { name: 'CodeStoryWithMIK (186)', data: CODESTORYWITHMIK_SHEET_DATA },
  ];

  for (const sheet of sheets) {
    for (const p of sheet.data) {
      if (!p || !p.name) continue;
      const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const key = slug.toLowerCase();
      if (!seenSlugs.has(key)) {
        seenSlugs.add(key);
        catalog.push({
          id: p.id || slug,
          name: p.name,
          slug,
          difficulty: (p.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
          category: p.category || 'DSA',
          leetcode: p.leetcode,
          sheet: sheet.name
        });
      }
    }
  }

  return catalog;
}
