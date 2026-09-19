/**
 * potdAdminApi.ts
 * Admin API client for Problem of the Day (POTD) Mission Control
 * Direct Cloudflare R2 synchronization via Backend API
 */

import { apiFetch } from './problemAdminApi';

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
  companies?: string[];
  date: string;
  overridden_at?: string;
}

export interface AdminPotdInput {
  id?: number | string;
  name: string;
  title?: string;
  slug?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string;
  category?: string;
  topic?: string;
  leetcode?: string;
  url?: string;
  sheet?: string;
  description?: string;
  companies?: string[];
  date: string;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Fetches active POTD configuration from Cloudflare R2 for target date
 */
export async function fetchServerPotd(date?: string): Promise<{
  success: boolean;
  isOverridden: boolean;
  date: string;
  problem: AdminPotdRecord | null;
}> {
  const targetDate = date || getTodayDateString();
  try {
    const res = await apiFetch(`/api/potd/sdetube?date=${encodeURIComponent(targetDate)}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        isOverridden: Boolean(data?.isOverridden),
        date: targetDate,
        problem: data?.problem || null
      };
    }
  } catch (err) {
    console.warn('[potdAdminApi] Failed to fetch server POTD:', err);
  }
  return {
    success: false,
    isOverridden: false,
    date: targetDate,
    problem: null
  };
}

/**
 * Sets or schedules a POTD override directly in Cloudflare R2
 */
export async function setServerPotd(
  input: AdminPotdInput
): Promise<{ success: boolean; problem?: AdminPotdRecord; message?: string; error?: string }> {
  try {
    const targetDate = input.date || getTodayDateString();
    const name = input.name.trim();
    const slug = input.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const leetcode = input.leetcode || input.url || `https://leetcode.com/problems/${slug}/`;

    const payload = {
      id: input.id || Date.now(),
      name,
      title: name,
      slug,
      difficulty: input.difficulty || 'Medium',
      category: input.category || input.topic || 'Algorithms',
      topic: input.category || input.topic || 'Algorithms',
      leetcode,
      url: leetcode,
      sheet: input.sheet || 'Admin Curated',
      description: input.description || '',
      companies: input.companies || ['Top Tech', 'FAANG'],
      date: targetDate
    };

    const res = await apiFetch('/api/potd/sdetube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        problem: data.problem,
        message: data.message || `Successfully published POTD for ${targetDate}`
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || `HTTP ${res.status}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Resets POTD override for target date to standard rotational seed
 */
export async function resetServerPotd(date?: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const targetDate = date || getTodayDateString();
  try {
    const res = await apiFetch(`/api/potd/sdetube?date=${encodeURIComponent(targetDate)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message || `Reset POTD to default rotation for ${targetDate}` };
    }
    return { success: false, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}
