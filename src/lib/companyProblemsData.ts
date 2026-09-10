/**
 * companyProblemsData.ts
 * Manages loading, caching, and filtering of the 3,400+ LeetCode Company-Wise & Timeframe-Wise DSA dataset.
 */

import { TELEGRAM_BACKEND_URL } from './telegram';
import { isProblemSlugSolved } from './analytics';

export type TimeframeKey = 'all' | '30_days' | '3_months' | '6_months' | 'more_6_months';

export interface CompanyProblemItem {
  id: number;
  title: string;
  slug: string;
  url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptance: number;
  frequency: number; // in current company/timeframe context
  isSolved?: boolean;
}

export interface CompanySummary {
  slug: string;
  name: string;
  total: number;
  available_timeframes: TimeframeKey[];
  counts: Partial<Record<TimeframeKey, number>>;
}

export interface RawCompanyData {
  slug: string;
  name: string;
  total: number;
  timeframes: Record<string, [number, number][]>; // [pid, freq]
}

export interface CompanyProblemsDataset {
  total_problems: number;
  total_companies: number;
  total_occurrences: number;
  companies_summary: CompanySummary[];
  problems: Record<string, {
    id: number;
    title: string;
    slug: string;
    url: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    acceptance: number;
  }>;
  companies: Record<string, RawCompanyData>;
}

export const TIMEFRAME_LABELS: Record<TimeframeKey, { label: string; shortLabel: string; description: string }> = {
  all: {
    label: 'All Time',
    shortLabel: 'All Time',
    description: 'Lifetime aggregated frequency across all interview cycles'
  },
  '30_days': {
    label: 'Last 30 Days',
    shortLabel: '30 Days',
    description: 'Fresh trending questions reported in recent 30-day interview rounds'
  },
  '3_months': {
    label: 'Last 3 Months',
    shortLabel: '3 Months',
    description: 'High-probability questions asked in the past quarter'
  },
  '6_months': {
    label: 'Last 6 Months',
    shortLabel: '6 Months',
    description: 'Dominant questions tested across the last two hiring quarters'
  },
  more_6_months: {
    label: 'More Than 6 Months (1 Year+)',
    shortLabel: '1 Year+',
    description: 'Classic recurring interview patterns asked over 6+ months ago'
  }
};

export interface FeaturedCompany {
  slug: string;
  name: string;
  tagline: string;
  badgeColor: string;
  iconBg: string;
}

export const FEATURED_COMPANIES: FeaturedCompany[] = [
  { slug: 'google', name: 'Google', tagline: 'Hard algorithms & dynamic graphs', badgeColor: 'text-rose-400 border-rose-500/40 bg-rose-500/10', iconBg: 'from-rose-500 to-amber-500' },
  { slug: 'browserstack', name: 'BrowserStack', tagline: 'High-frequency systems & data structures', badgeColor: 'text-sky-400 border-sky-500/40 bg-sky-500/10', iconBg: 'from-sky-500 to-indigo-500' },
  { slug: 'amazon', name: 'Amazon', tagline: 'Trees, heaps & sliding window', badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10', iconBg: 'from-amber-500 to-orange-500' },
  { slug: 'meta', name: 'Meta', tagline: 'Fast trees, recursion & intervals', badgeColor: 'text-blue-400 border-blue-500/40 bg-blue-500/10', iconBg: 'from-blue-500 to-cyan-500' },
  { slug: 'microsoft', name: 'Microsoft', tagline: 'Linked lists, arrays & design', badgeColor: 'text-teal-400 border-teal-500/40 bg-teal-500/10', iconBg: 'from-teal-500 to-emerald-500' },
  { slug: 'apple', name: 'Apple', tagline: 'Pointers, DP & bit manipulation', badgeColor: 'text-slate-300 border-slate-600 bg-slate-800/40', iconBg: 'from-slate-400 to-zinc-600' },
  { slug: 'bloomberg', name: 'Bloomberg', tagline: 'Stacks, string parsing & hash maps', badgeColor: 'text-purple-400 border-purple-500/40 bg-purple-500/10', iconBg: 'from-purple-500 to-pink-500' },
  { slug: 'uber', name: 'Uber', tagline: 'Shortest paths, matrices & queues', badgeColor: 'text-neutral-200 border-neutral-600 bg-neutral-900', iconBg: 'from-neutral-700 to-neutral-900' },
  { slug: 'netflix', name: 'Netflix', tagline: 'Topological sort & sliding window', badgeColor: 'text-red-400 border-red-500/40 bg-red-500/10', iconBg: 'from-red-600 to-rose-700' },
  { slug: 'goldman-sachs', name: 'Goldman Sachs', tagline: 'Math, arrays & dynamic programming', badgeColor: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10', iconBg: 'from-yellow-500 to-amber-600' },
  { slug: 'atlassian', name: 'Atlassian', tagline: 'Custom data structures & rate limiters', badgeColor: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10', iconBg: 'from-indigo-500 to-sky-600' },
  { slug: 'tiktok', name: 'TikTok', tagline: 'Subarrays, heaps & binary search', badgeColor: 'text-pink-400 border-pink-500/40 bg-pink-500/10', iconBg: 'from-pink-500 to-rose-600' },
  { slug: 'adobe', name: 'Adobe', tagline: 'Strings, matrix traversal & BST', badgeColor: 'text-red-400 border-red-500/40 bg-red-500/10', iconBg: 'from-red-500 to-orange-500' },
  { slug: 'salesforce', name: 'Salesforce', tagline: 'Hash tables & trees', badgeColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10', iconBg: 'from-cyan-500 to-blue-500' },
  { slug: 'flipkart', name: 'Flipkart', tagline: 'DP, graphs & greedy algorithms', badgeColor: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10', iconBg: 'from-yellow-400 to-amber-500' }
];

// In-memory cached dataset
let cachedDataset: CompanyProblemsDataset | null = null;
let loadPromise: Promise<CompanyProblemsDataset> | null = null;

/**
 * Loads the company-wise problems dataset asynchronously with fallbacks:
 * 1. Returns in-memory cache if already loaded (0ms).
 * 2. Fetches static JSON from /data/company_problems.json (instant via Vite / Cloudflare Pages CDN).
 * 3. Falls back to backend API if static fetch fails.
 */
export async function fetchCompanyProblemsDataset(): Promise<CompanyProblemsDataset> {
  if (cachedDataset) {
    return cachedDataset;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    // 1. Try static asset
    try {
      const resp = await fetch('/data/company_problems.json');
      if (resp.ok) {
        const data = await resp.json();
        cachedDataset = data;
        return data;
      }
    } catch (err) {
      console.warn('[CompanyProblems] Static JSON fetch failed, trying backend fallback:', err);
    }

    // 2. Try backend API fallback
    try {
      const resp = await fetch(`${TELEGRAM_BACKEND_URL}/api/company-problems/all`);
      if (resp.ok) {
        const data = await resp.json();
        cachedDataset = data;
        return data;
      }
    } catch (err) {
      console.error('[CompanyProblems] Backend fetch also failed:', err);
    }

    // Return empty fallback structure if both fail
    return {
      total_problems: 0,
      total_companies: 0,
      total_occurrences: 0,
      companies_summary: [],
      problems: {},
      companies: {}
    };
  })();

  return loadPromise;
}

/**
 * Gets problems for a specific company and timeframe, enriched with current user solved status.
 */
export function getCompanyProblemsForTimeframe(
  dataset: CompanyProblemsDataset,
  companySlug: string,
  timeframe: TimeframeKey
): CompanyProblemItem[] {
  const comp = dataset.companies[companySlug];
  if (!comp || !comp.timeframes) return [];

  // If requested timeframe doesn't exist for this company, fall back to 'all' or first available
  const tfKey = comp.timeframes[timeframe] ? timeframe : (comp.timeframes['all'] ? 'all' : Object.keys(comp.timeframes)[0]);
  const pairs = comp.timeframes[tfKey] || [];

  return pairs.map(([pid, freq]) => {
    const rawProb = dataset.problems[String(pid)];
    const pSlug = rawProb?.slug || '';
    const solved = isProblemSlugSolved(pSlug) || isProblemSlugSolved(rawProb?.title);

    return {
      id: pid,
      title: rawProb?.title || `Problem #${pid}`,
      slug: pSlug,
      url: rawProb?.url || `https://leetcode.com/problems/${pSlug || pid}`,
      difficulty: rawProb?.difficulty || 'Medium',
      acceptance: rawProb?.acceptance || 50.0,
      frequency: freq,
      isSolved: solved
    };
  });
}
