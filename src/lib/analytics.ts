import { SDE_SHEET_DATA, SDE_SHEET_191_DATA, A2Z_DSA_SHEET_473_DATA, SDETUBE_79_SHEET_DATA, getLeetCodeSlug, getUniversalSdePotd } from './dsaSheetsData';
import { BLIND_75_SHEET_DATA } from './blind75SheetData';
import { CODESTORYWITHMIK_SHEET_DATA } from './mikSheetData';
import { LLD_PROBLEMS } from './lldData';
import { setSolvedIds, getSolvedIds, saveUserProgress, recordStudyMinutes, getUserProgressSync } from './progressService';

// Dedicated per-sheet maps for accurate O(1) problem ID lookup (prevents cross-sheet ID collisions)
const sdeProblemMap = new Map<number, any>();
(SDE_SHEET_191_DATA || []).forEach(p => sdeProblemMap.set(p.id, p));

const a2zProblemMap = new Map<number, any>();
(A2Z_DSA_SHEET_473_DATA || []).forEach(p => a2zProblemMap.set(p.id, p));

const sde79ProblemMap = new Map<number, any>();
(SDETUBE_79_SHEET_DATA || []).forEach(p => sde79ProblemMap.set(p.id, p));

const blind75ProblemMap = new Map<number, any>();
(BLIND_75_SHEET_DATA || []).forEach(p => blind75ProblemMap.set(p.id, p));

const mikProblemMap = new Map<number, any>();
(CODESTORYWITHMIK_SHEET_DATA || []).forEach(p => mikProblemMap.set(p.id, p));

/**
 * Normalizes any problem title, slug, or key into a clean, canonical slug.
 * Strips leading problem numbers (e.g. '3871-count-commas...' -> 'count-commas...')
 * to ensure compiler submissions and sheet items map to the exact same unique problem.
 */
export function normalizeCanonicalSlug(raw?: string): string {
  if (!raw) return '';
  let s = String(raw).trim().toLowerCase();
  // Strip leading question numbers (e.g. "3871. Count Commas" or "3871-count-commas")
  s = s.replace(/^\d+[\s\.\-_]+/, '');
  // Normalize symbols/spaces to hyphens
  s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s;
}

export interface DailyActivityItem {
  date: string; // 'YYYY-MM-DD'
  dayName: string; // 'Mon', 'Tue', etc.
  questions: number;
  mins: number;
  qpm: number;
}

export interface RealAnalyticsMetrics {
  // Core Tracking: DSA + LLD
  dsaSolved: number;
  dsaTotal: number;
  dsaPct: number;

  lldSolved: number;
  lldTotal: number;
  lldPct: number;

  totalSolved: number; // DSA + LLD
  totalAvailableProblems: number;

  // Bonus Modules (CN + DBMS)
  dbmsScore: number;
  dbmsQueriesExecuted: number;
  cnScore: number;
  cnModulesCompleted: number;
  bonusPoints: number;

  // General & Velocity Metrics
  totalActiveMins: number;
  totalDedicatedHours: string;
  speedIndex: number;
  accuracyPercent: number;
  totalAttempts: number;
  correctAttempts: number;
  streakDays: number;
  
  timeBreakdown: {
    lecturesMins: number;
    quizzesMins: number;
    codingMins: number;
    lldMins: number;
  };
  
  difficultyStats: {
    easy: { solved: number; total: number; pct: number };
    medium: { solved: number; total: number; pct: number };
    hard: { solved: number; total: number; pct: number };
  };
  
  categoryStats: Array<{
    category: string;
    solved: number;
    total: number;
    pct: number;
  }>;
  
  dailyVelocity: DailyActivityItem[];
  sdeReadinessScore: number;
}

const STORAGE_SOLVED_IDS_KEY = 'sdetube_sde_sheet_solved_ids';
const STORAGE_LLD_SOLVED_KEY = 'sdetube_lld_solved_ids';
const STORAGE_SQL_RUNS_KEY = 'sdetube_sql_executions_count';
const STORAGE_CN_COMPLETED_KEY = 'sdetube_cn_completed_modules';
const STORAGE_DAILY_LOG_KEY = 'sdetube_real_daily_activity_log';
const STORAGE_ACTIVE_MINS_KEY = 'edustream_active_mins';
const STORAGE_TOTAL_ATTEMPTS_KEY = 'edustream_total_attempts';
const STORAGE_CORRECT_ATTEMPTS_KEY = 'edustream_correct_attempts';
const STORAGE_TIME_BREAKDOWN_KEY = 'edustream_time_breakdown';

/**
 * Records real user activity for today across DSA, LLD, DBMS, and CN.
 */
export function recordRealActivity(
  type: 'lecture' | 'quiz' | 'coding' | 'lld' | 'sql' | 'cn',
  mins: number,
  solvedIncrement: number = 0,
  isCorrect: boolean = true
) {
  if (typeof window === 'undefined') return;

  const todayStr = new Date().toISOString().slice(0, 10);
  const cleanMins = Math.max(0.1, Number(mins.toFixed(1)));

  // 1. Update Active Mins
  const curMins = parseFloat(localStorage.getItem(STORAGE_ACTIVE_MINS_KEY) || '0');
  const newMins = Number((curMins + cleanMins).toFixed(1));
  localStorage.setItem(STORAGE_ACTIVE_MINS_KEY, newMins.toString());

  // 2. Update Time Breakdown
  try {
    const rawBreakdown = localStorage.getItem(STORAGE_TIME_BREAKDOWN_KEY);
    const breakdown = rawBreakdown ? JSON.parse(rawBreakdown) : { lecturesMins: 0, quizzesMins: 0, codingMins: 0, lldMins: 0 };
    if (type === 'lecture') breakdown.lecturesMins = Math.round(breakdown.lecturesMins + cleanMins);
    else if (type === 'quiz') breakdown.quizzesMins = Math.round(breakdown.quizzesMins + cleanMins);
    else if (type === 'coding') breakdown.codingMins = Math.round(breakdown.codingMins + cleanMins);
    else if (type === 'lld') breakdown.lldMins = Math.round((breakdown.lldMins || 0) + cleanMins);
    localStorage.setItem(STORAGE_TIME_BREAKDOWN_KEY, JSON.stringify(breakdown));
  } catch {}

  // 3. Update Attempts
  const totalAttempts = parseInt(localStorage.getItem(STORAGE_TOTAL_ATTEMPTS_KEY) || '0', 10) + 1;
  localStorage.setItem(STORAGE_TOTAL_ATTEMPTS_KEY, totalAttempts.toString());

  if (isCorrect) {
    const curCorrect = parseInt(localStorage.getItem(STORAGE_CORRECT_ATTEMPTS_KEY) || '0', 10) + 1;
    localStorage.setItem(STORAGE_CORRECT_ATTEMPTS_KEY, curCorrect.toString());
  }

  // 4. Update SQL and CN bonus counters
  if (type === 'sql') {
    const runs = parseInt(localStorage.getItem(STORAGE_SQL_RUNS_KEY) || '0', 10) + 1;
    localStorage.setItem(STORAGE_SQL_RUNS_KEY, runs.toString());
  } else if (type === 'cn') {
    const cnRuns = parseInt(localStorage.getItem(STORAGE_CN_COMPLETED_KEY) || '0', 10) + 1;
    localStorage.setItem(STORAGE_CN_COMPLETED_KEY, cnRuns.toString());
  }

  // 5. Update Daily Activity Log Map
  try {
    const rawMap = localStorage.getItem(STORAGE_DAILY_LOG_KEY);
    const activityMap: Record<string, { questions: number; mins: number }> = rawMap ? JSON.parse(rawMap) : {};
    
    const curDay = activityMap[todayStr] || { questions: 0, mins: 0 };
    curDay.questions += solvedIncrement;
    curDay.mins = Number((curDay.mins + cleanMins).toFixed(1));
    activityMap[todayStr] = curDay;

    localStorage.setItem(STORAGE_DAILY_LOG_KEY, JSON.stringify(activityMap));
  } catch {}
}

/**
 * Checks if a problem slug or name is marked as solved across all local sheets.
 */
export function isProblemSlugSolved(slugOrName?: string): boolean {
  if (!slugOrName || typeof window === 'undefined') return false;
  const canonical = normalizeCanonicalSlug(slugOrName);
  const compact = canonical.replace(/[^a-z0-9]/g, '');
  if (!compact) return false;
  try {
    const rawSlugs = localStorage.getItem('sdetube_solved_slugs');
    if (rawSlugs) {
      const slugs: string[] = JSON.parse(rawSlugs);
      if (slugs.some(s => {
        const c = normalizeCanonicalSlug(s);
        return c === canonical || c.replace(/[^a-z0-9]/g, '') === compact;
      })) return true;
    }

    const rawNames = localStorage.getItem('sdetube_solved_names');
    if (rawNames) {
      const names: string[] = JSON.parse(rawNames);
      if (names.some(n => {
        const c = normalizeCanonicalSlug(n);
        return c === canonical || c.replace(/[^a-z0-9]/g, '') === compact;
      })) return true;
    }
  } catch {}
  return false;
}

/**
 * Checks if today's Problem of the Day (Curated or Global LeetCode) has been solved TODAY.
 */
export function isPotdSolvedToday(platform?: 'sdetube' | 'leetcode' | 'gfg'): boolean {
  if (typeof window === 'undefined') return false;
  const today = new Date().toISOString().slice(0, 10);

  if (platform === 'sdetube') {
    if (localStorage.getItem(`sdetube_potd_sdetube_solved_${today}`) === 'true') return true;
    try {
      const sdePotd = getUniversalSdePotd();
      if (sdePotd?.slug) {
        const sub = localStorage.getItem(`edustream_submissions_${sdePotd.slug}`);
        if (sub) {
          const list = JSON.parse(sub);
          if (Array.isArray(list) && list.some(item => {
            if (!item || (item.status !== 'Accepted' && item.status !== 'SUCCESS')) return false;
            if (item.id) {
              const ts = parseInt(item.id.split('_')[0], 10);
              if (ts > 0 && new Date(ts).toISOString().slice(0, 10) === today) return true;
            }
            return false;
          })) {
            localStorage.setItem(`sdetube_potd_sdetube_solved_${today}`, 'true');
            return true;
          }
        }
      }
    } catch {}
    return false;
  }

  if (platform === 'leetcode') {
    if (localStorage.getItem(`sdetube_potd_leetcode_solved_${today}`) === 'true') return true;
    try {
      const lcRaw = localStorage.getItem('edustream_potd_cache_leetcode');
      if (lcRaw) {
        const lc = JSON.parse(lcRaw);
        if (lc.titleSlug) {
          const sub = localStorage.getItem(`edustream_submissions_${lc.titleSlug}`);
          if (sub) {
            const list = JSON.parse(sub);
            if (Array.isArray(list) && list.some(item => {
              if (!item || (item.status !== 'Accepted' && item.status !== 'SUCCESS')) return false;
              if (item.id) {
                const ts = parseInt(item.id.split('_')[0], 10);
                if (ts > 0 && new Date(ts).toISOString().slice(0, 10) === today) return true;
              }
              return false;
            })) {
              localStorage.setItem(`sdetube_potd_leetcode_solved_${today}`, 'true');
              return true;
            }
          }
        }
      }
    } catch {}
    return false;
  }

  if (platform === 'gfg') {
    return localStorage.getItem(`sdetube_potd_gfg_solved_${today}`) === 'true';
  }

  // General check: only true if any platform was actually solved TODAY
  return (
    localStorage.getItem(`sdetube_potd_sdetube_solved_${today}`) === 'true' ||
    localStorage.getItem(`sdetube_potd_leetcode_solved_${today}`) === 'true' ||
    localStorage.getItem(`sdetube_potd_gfg_solved_${today}`) === 'true' ||
    localStorage.getItem(`sdetube_potd_solved_${today}`) === 'true'
  );
}

/**
 * Resets falsely cached POTD keys if no actual submission exists for today.
 */
export function resetUnverifiedPotdToday(): void {
  if (typeof window === 'undefined') return;
  const today = new Date().toISOString().slice(0, 10);

  // Verify SDETube POTD submission today
  // Clean up stale past-day keys from previous dates
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('sdetube_potd_solved_') ||
        key.startsWith('sdetube_potd_leetcode_solved_') ||
        key.startsWith('sdetube_potd_sdetube_solved_') ||
        key.startsWith('sdetube_potd_gfg_solved_')
      )) {
        if (!key.endsWith(today)) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch {}

  // If none of the platforms were solved today, clear today's aggregate potd flag
  const sdeSolved = localStorage.getItem(`sdetube_potd_sdetube_solved_${today}`) === 'true';
  const lcSolved = localStorage.getItem(`sdetube_potd_leetcode_solved_${today}`) === 'true';
  const gfgSolved = localStorage.getItem(`sdetube_potd_gfg_solved_${today}`) === 'true';
  if (!sdeSolved && !lcSolved && !gfgSolved) {
    localStorage.removeItem(`sdetube_potd_solved_${today}`);
  }
}

/**
 * Marks any DSA problem as solved across all sheets, auto-ticks POTD if applicable,
 * and updates analytics and activity heatmaps in real time.
 */
export function markProblemSolved(identifier: string | number, timeMins: number = 5, problemSlug?: string): boolean {
  if (typeof window === 'undefined') return false;

  const cleanSlug = normalizeCanonicalSlug(problemSlug || (typeof identifier === 'string' ? identifier : ''));
  const cleanCompact = cleanSlug.replace(/[^a-z0-9]/g, '');
  const strId = typeof identifier === 'string' ? normalizeCanonicalSlug(identifier) : '';

  // 1. Search across ALL 5 DSA Sheets (SDE, A2Z, Striver 79, Blind 75, CodeStoryWithMIK)
  const allProblems = [
    ...SDE_SHEET_191_DATA,
    ...A2Z_DSA_SHEET_473_DATA,
    ...SDETUBE_79_SHEET_DATA,
    ...BLIND_75_SHEET_DATA,
    ...CODESTORYWITHMIK_SHEET_DATA
  ];

  const matchedProblems = allProblems.filter(p => {
    const pSlug = normalizeCanonicalSlug(p.slug || getLeetCodeSlug(p));
    const pNameSlug = normalizeCanonicalSlug(p.name);
    return (
      (cleanSlug && (pSlug === cleanSlug || pNameSlug === cleanSlug)) ||
      (cleanCompact && (pSlug.replace(/[^a-z0-9]/g, '') === cleanCompact || pNameSlug.replace(/[^a-z0-9]/g, '') === cleanCompact)) ||
      (strId && (pSlug === strId || pNameSlug === strId)) ||
      (typeof identifier === 'number' && p.id === identifier && (!cleanSlug || pSlug === cleanSlug))
    );
  });

  const matchedId = matchedProblems.length > 0 ? matchedProblems[0].id : (typeof identifier === 'number' && identifier > 0 ? identifier : null);

  // 2. Update each sheet strictly for its OWN matched problems to prevent cross-sheet ID pollution
  const sheetUpdates: Record<string, number[]> = {};
  matchedProblems.forEach(p => {
    const sheet = p.sheetType || 'sde';
    if (!sheetUpdates[sheet]) sheetUpdates[sheet] = [];
    sheetUpdates[sheet].push(p.id);
  });

  // If no sheet problem matched but a numeric ID was provided, attribute only to active or default 'sde'
  if (matchedProblems.length === 0 && typeof identifier === 'number' && identifier > 0) {
    sheetUpdates['sde'] = [identifier];
  }

  Object.entries(sheetUpdates).forEach(([sheet, ids]) => {
    try {
      const specificKey = `sdetube_dsa_sheet_solved_${sheet}`;
      const raw = localStorage.getItem(specificKey);
      const set = new Set<number>(raw ? JSON.parse(raw) : []);
      ids.forEach(id => set.add(id));
      localStorage.setItem(specificKey, JSON.stringify(Array.from(set)));

      if (sheet === 'sde') {
        localStorage.setItem('sdetube_sde_sheet_solved_ids', JSON.stringify(Array.from(set)));
      }

      // Sync strictly to this sheet in Supabase
      const curr = getSolvedIds(sheet);
      const next = Array.from(new Set([...curr, ...ids]));
      setSolvedIds(sheet, next).catch(() => {});
    } catch {}
  });

  // 3. Persist canonical solved slug for cross-sheet instant ticking
  try {
    const rawSlugs = localStorage.getItem('sdetube_solved_slugs');
    const slugs = new Set<string>(rawSlugs ? JSON.parse(rawSlugs) : []);
    if (cleanSlug) slugs.add(cleanSlug);
    matchedProblems.forEach(p => {
      const ps = normalizeCanonicalSlug(p.slug || getLeetCodeSlug(p));
      if (ps) slugs.add(ps);
    });
    localStorage.setItem('sdetube_solved_slugs', JSON.stringify(Array.from(slugs)));

    const rawNames = localStorage.getItem('sdetube_solved_names');
    const names = new Set<string>(rawNames ? JSON.parse(rawNames) : []);
    if (strId) names.add(strId);
    matchedProblems.forEach(p => names.add(p.name));
    localStorage.setItem('sdetube_solved_names', JSON.stringify(Array.from(names)));
  } catch {}

  // 4. POTD Solved Detection: Auto-tick POTD if today's challenge is solved
  const today = new Date().toISOString().slice(0, 10);
  try {
    const sdePotd = getUniversalSdePotd();
    const potdName = (sdePotd?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const potdSlug = (sdePotd?.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const isSdePotd = (
      strId === potdName ||
      strId === potdSlug ||
      cleanSlug === potdSlug ||
      (typeof identifier === 'number' && identifier === sdePotd?.id) ||
      matchedProblems.some(p => p.id === sdePotd?.id || p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === potdName)
    );

    let isLcPotd = strId === '8888' || strId === 'dailychallenge' || cleanSlug.includes('daily');
    let isGfgPotd = strId === '9999' || strId === 'gfgpotd' || cleanSlug.includes('gfg');

    // Dynamic match against cached LeetCode & GFG POTDs
    try {
      const lcRaw = localStorage.getItem('edustream_potd_cache_leetcode');
      if (lcRaw) {
        const lcData = JSON.parse(lcRaw);
        const lSlug = (lcData.titleSlug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const lTitle = (lcData.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (lSlug && (cleanSlug === lSlug || strId === lSlug || cleanSlug === lTitle || strId === lTitle)) {
          isLcPotd = true;
        }
      }
      const gfgRaw = localStorage.getItem('edustream_potd_cache_gfg');
      if (gfgRaw) {
        const gfgData = JSON.parse(gfgRaw);
        const gSlug = (gfgData.problemSlug || gfgData.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/[^a-z0-9]/g, '');
        const gTitle = (gfgData.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (gSlug && (cleanSlug === gSlug || strId === gSlug || cleanSlug === gTitle || strId === gTitle)) {
          isGfgPotd = true;
        }
      }
    } catch {}

    if (isSdePotd || isLcPotd || isGfgPotd || strId === 'potd') {
      localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
      if (isSdePotd) localStorage.setItem(`sdetube_potd_sdetube_solved_${today}`, 'true');
      if (isLcPotd) localStorage.setItem(`sdetube_potd_leetcode_solved_${today}`, 'true');
      if (isGfgPotd) localStorage.setItem(`sdetube_potd_gfg_solved_${today}`, 'true');
      window.dispatchEvent(new CustomEvent('sdetube_potd_solved', { detail: { date: today, problemId: matchedId } }));
    }
  } catch (err) {
    console.warn('[POTD Auto-Check Notice]:', err);
  }

  // 5. Record real analytics activity
  recordRealActivity('coding', timeMins, 1, true);

  try {
    const rawLogs = localStorage.getItem('sdetube_practice_activity_logs');
    const logs: Array<{ date: string; count: number; problems?: string[] }> = rawLogs ? JSON.parse(rawLogs) : [];
    const existing = logs.find(l => l.date === today);
    const probLabel = cleanSlug || String(identifier);
    if (existing) {
      existing.count = (existing.count || 0) + 1;
      existing.problems = existing.problems || [];
      if (!existing.problems.includes(probLabel)) existing.problems.push(probLabel);
    } else {
      logs.push({ date: today, count: 1, problems: [probLabel] });
    }
    localStorage.setItem('sdetube_practice_activity_logs', JSON.stringify(logs.slice(-365)));
  } catch (_) {}

  // 6. Dispatch global custom events for instant UI reaction across all components
  window.dispatchEvent(new CustomEvent('sdetube_problem_solved', {
    detail: { problemId: matchedId, identifier, slug: cleanSlug }
  }));

  return true;
}

/**
 * Marks an LLD problem as solved.
 */
export function markLLDProblemSolved(problemId: string | number) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_LLD_SOLVED_KEY);
    const set = new Set<string | number>(raw ? JSON.parse(raw) : []);
    set.add(problemId);
    localStorage.setItem(STORAGE_LLD_SOLVED_KEY, JSON.stringify(Array.from(set)));
    
    // Sync to Supabase via progressService
    const numericId = typeof problemId === 'number' ? problemId : parseInt(problemId.replace(/\D/g, ''), 10) || 1;
    saveUserProgress({
      lld_solved_ids: Array.from(set).map(x => typeof x === 'number' ? x : parseInt(String(x).replace(/\D/g, ''), 10) || 1)
    }).catch(() => {});

    recordRealActivity('lld', 15, 1, true);
    window.dispatchEvent(new CustomEvent('sdetube_problem_solved', {
      detail: { lldProblemId: problemId }
    }));
  } catch {}
}

/**
 * Computes strictly 100% REAL user analytics data across DSA + LLD + Bonus (CN & DBMS).
 */
export function getAllPlatformUniqueProblems(): any[] {
  const map = new Map<string, any>();
  const allSheets = [
    ...(SDE_SHEET_DATA || []),
    ...(SDE_SHEET_191_DATA || []),
    ...(A2Z_DSA_SHEET_473_DATA || []),
    ...(SDETUBE_79_SHEET_DATA || []),
    ...(BLIND_75_SHEET_DATA || []),
    ...(CODESTORYWITHMIK_SHEET_DATA || [])
  ];
  for (const prob of (allSheets as any[])) {
    if (!prob) continue;
    const rawSlug = getLeetCodeSlug(prob);
    const cleanSlug = (rawSlug || prob.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    if (cleanSlug && cleanSlug !== 'problem' && !map.has(cleanSlug)) {
      map.set(cleanSlug, { ...prob, cleanSlug });
    }
  }
  return Array.from(map.values());
}

/**
 * Computes strictly 100% REAL user analytics data across DSA + LLD + Bonus (CN & DBMS).
 */
export function getRealAnalytics(): RealAnalyticsMetrics {
  // 1. DSA Solved across all sheets and unique slugs
  const allUniqueProblems = getAllPlatformUniqueProblems();
  const dsaTotal = Math.max(allUniqueProblems.length, 1);

  // Set of strictly UNIQUE canonical problem slugs solved by user (deduplicates across sheets and compiler)
  const uniqueSolvedSlugs = new Set<string>();

  const addProblem = (prob?: any) => {
    if (!prob) return;
    const raw = getLeetCodeSlug(prob) || prob.slug || prob.name;
    const slug = normalizeCanonicalSlug(raw);
    if (slug && slug.length > 2 && slug !== 'problem' && slug !== 'undefined' && slug !== 'null') {
      uniqueSolvedSlugs.add(slug);
    }
  };

  const addRawSlug = (raw?: string) => {
    if (!raw) return;
    const slug = normalizeCanonicalSlug(raw);
    if (slug && slug.length > 2 && slug !== 'problem' && slug !== 'undefined' && slug !== 'null') {
      uniqueSolvedSlugs.add(slug);
    }
  };

  // 1. Sheet progress: resolve IDs strictly against each sheet's OWN problem definitions (prevents cross-sheet ID collisions)
  try {
    const syncProg = getUserProgressSync();
    if (syncProg) {
      (syncProg.solved_sde || []).forEach(id => addProblem(sdeProblemMap.get(id)));
      (syncProg.solved_a2z || []).forEach(id => addProblem(a2zProblemMap.get(id)));
      (syncProg.solved_79 || []).forEach(id => addProblem(sde79ProblemMap.get(id)));
      (syncProg.solved_blind75 || []).forEach(id => addProblem(blind75ProblemMap.get(id)));
      (syncProg.solved_mik || []).forEach(id => addProblem(mikProblemMap.get(id)));

      // Synchronize and heal local storage keys with authoritative Supabase progress
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('sdetube_dsa_sheet_solved_sde', JSON.stringify(syncProg.solved_sde || []));
          localStorage.setItem('sdetube_sde_sheet_solved_ids', JSON.stringify(syncProg.solved_sde || []));
          localStorage.setItem('sdetube_dsa_sheet_solved_a2z', JSON.stringify(syncProg.solved_a2z || []));
          localStorage.setItem('sdetube_dsa_sheet_solved_79', JSON.stringify(syncProg.solved_79 || []));
          localStorage.setItem('sdetube_dsa_sheet_solved_blind75', JSON.stringify(syncProg.solved_blind75 || []));
          localStorage.setItem('sdetube_dsa_sheet_solved_mik', JSON.stringify(syncProg.solved_mik || []));
        } catch {}
      }
    } else {
      // Offline fallback: only if no Supabase progress exists, read from local storage keys
      const resolveStorageKey = (key: string, map: Map<number, any>) => {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              arr.forEach(id => typeof id === 'number' && addProblem(map.get(id)));
            }
          }
        } catch {}
      };
      resolveStorageKey('sdetube_dsa_sheet_solved_sde', sdeProblemMap);
      resolveStorageKey('sdetube_sde_sheet_solved_ids', sdeProblemMap);
      resolveStorageKey('sdetube_dsa_sheet_solved_a2z', a2zProblemMap);
      resolveStorageKey('sdetube_dsa_sheet_solved_79', sde79ProblemMap);
      resolveStorageKey('sdetube_dsa_sheet_solved_blind75', blind75ProblemMap);
      resolveStorageKey('sdetube_dsa_sheet_solved_mik', mikProblemMap);
    }
  } catch {}

  // 2. POTD Check: Include today's verified POTDs if solved
  const todayStr = new Date().toISOString().slice(0, 10);
  if (isPotdSolvedToday('sdetube')) {
    try {
      const sdePotd = getUniversalSdePotd();
      if (sdePotd) addProblem(sdePotd);
    } catch {}
  }
  if (isPotdSolvedToday('leetcode')) {
    try {
      const lcRaw = localStorage.getItem('edustream_potd_cache_leetcode') || localStorage.getItem(`sdetube_leetcode_potd_${todayStr}`);
      if (lcRaw) {
        const lc = JSON.parse(lcRaw);
        addRawSlug(lc.titleSlug || lc.title);
      } else {
        addRawSlug('count-commas-in-range-ii');
      }
    } catch {}
  }
  if (isPotdSolvedToday('gfg')) {
    try {
      const gfgRaw = localStorage.getItem('edustream_potd_cache_gfg') || localStorage.getItem(`sdetube_gfg_potd_${todayStr}`);
      if (gfgRaw) {
        const gfg = JSON.parse(gfgRaw);
        addRawSlug(gfg.titleSlug || gfg.title);
      }
    } catch {}
  }

  // 3. Compiler / IDE accepted submissions: count each unique problem once
  // STRICT RULE: Do NOT count test runs or submission attempts; only count unique problems with Accepted/SUCCESS status
  try {
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('edustream_submissions_') || key.startsWith('edustream_sql_submissions_'))) {
          const raw = localStorage.getItem(key);
          if (raw && (raw.includes('"status":"SUCCESS"') || raw.includes('"status":"Accepted"'))) {
            try {
              const subs = JSON.parse(raw);
              if (Array.isArray(subs) && subs.some(s => s && (s.status === 'SUCCESS' || s.status === 'Accepted'))) {
                const slugPart = key.replace(/^edustream_(sql_)?submissions_/, '');
                addRawSlug(slugPart);
              }
            } catch {}
          }
        }
      }
    }
  } catch {}

  // 4. Heal and prune contaminated local storage slug caches with authoritative uniqueSolvedSlugs
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sdetube_solved_slugs', JSON.stringify(Array.from(uniqueSolvedSlugs)));
      localStorage.removeItem('sdetube_solved_names');
    }
  } catch {}

  // Strictly count UNIQUE problems solved (never number of submissions)
  const dsaSolved = uniqueSolvedSlugs.size;
  let easyTotal = 0, easySolved = 0;
  let medTotal = 0, medSolved = 0;
  let hardTotal = 0, hardSolved = 0;

  const catMap = new Map<string, { total: number; solved: number }>();
  const matchedSlugs = new Set<string>();

  for (const prob of allUniqueProblems) {
    const pSlug = normalizeCanonicalSlug(prob.cleanSlug || prob.slug || getLeetCodeSlug(prob));
    const pNameSlug = normalizeCanonicalSlug(prob.name || prob.title);

    const isSolved = (pSlug && uniqueSolvedSlugs.has(pSlug)) || (pNameSlug && uniqueSolvedSlugs.has(pNameSlug));
    if (isSolved) {
      if (pSlug) matchedSlugs.add(pSlug);
      if (pNameSlug) matchedSlugs.add(pNameSlug);

      const diff = (prob.difficulty || 'Medium').toLowerCase();
      if (diff === 'easy') easySolved++;
      else if (diff === 'hard') hardSolved++;
      else medSolved++;
    }

    const diff = (prob.difficulty || 'Medium').toLowerCase();
    if (diff === 'easy') {
      easyTotal++;
    } else if (diff === 'hard') {
      hardTotal++;
    } else {
      medTotal++;
    }

    const cat = prob.category || 'Algorithms';
    const cEntry = catMap.get(cat) || { total: 0, solved: 0 };
    cEntry.total++;
    if (isSolved) cEntry.solved++;
    catMap.set(cat, cEntry);
  }

  // Account for any off-sheet unique solved problems (e.g. daily POTD, custom compiler challenges)
  for (const s of uniqueSolvedSlugs) {
    if (!matchedSlugs.has(s)) {
      medSolved++;
    }
  }

  const effectiveDsaTotal = Math.max(allUniqueProblems.length, dsaSolved);
  const dsaPct = effectiveDsaTotal > 0 ? Math.round((dsaSolved / effectiveDsaTotal) * 100) : 0;

  // 2. LLD Solved
  let lldSolvedIds: string[] = [];
  try {
    const rawLld = localStorage.getItem(STORAGE_LLD_SOLVED_KEY);
    if (rawLld) lldSolvedIds = JSON.parse(rawLld);
  } catch {
    lldSolvedIds = [];
  }
  const lldSolved = lldSolvedIds.length;
  const lldTotal = LLD_PROBLEMS.length;
  const lldPct = lldTotal > 0 ? Math.round((lldSolved / lldTotal) * 100) : 0;

  const totalSolved = dsaSolved + lldSolved;
  const totalAvailableProblems = dsaTotal + lldTotal;

  // 3. Bonus Points (DBMS & CN)
  let dbmsQueriesExecuted = 0;
  let cnModulesCompleted = 0;
  try {
    dbmsQueriesExecuted = parseInt(localStorage.getItem(STORAGE_SQL_RUNS_KEY) || '0', 10);
    cnModulesCompleted = parseInt(localStorage.getItem(STORAGE_CN_COMPLETED_KEY) || '0', 10);
  } catch {}

  const dbmsScore = Math.min(20, dbmsQueriesExecuted * 2); // Up to 20 bonus pts
  const cnScore = Math.min(20, cnModulesCompleted * 4);    // Up to 20 bonus pts
  const bonusPoints = dbmsScore + cnScore;

  // 4. Active Time & Speed
  const totalActiveMins = parseFloat(localStorage.getItem(STORAGE_ACTIVE_MINS_KEY) || '0') || 0;
  const totalDedicatedHours = (totalActiveMins / 60).toFixed(1);
  const speedIndex = totalActiveMins > 0 ? Number((totalSolved / totalActiveMins).toFixed(2)) : 0;

  const totalAttempts = parseInt(localStorage.getItem(STORAGE_TOTAL_ATTEMPTS_KEY) || '0', 10) || 0;
  const correctAttempts = parseInt(localStorage.getItem(STORAGE_CORRECT_ATTEMPTS_KEY) || '0', 10) || 0;

  const accuracyPercent = totalAttempts > 0 
    ? Math.min(100, Math.round((correctAttempts / totalAttempts) * 100))
    : (totalSolved > 0 ? 100 : 0);

  // 5. Time Breakdown
  let timeBreakdown = { lecturesMins: 0, quizzesMins: 0, codingMins: 0, lldMins: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_TIME_BREAKDOWN_KEY);
    if (raw) timeBreakdown = JSON.parse(raw);
  } catch {}

  // Include LLD in category map
  catMap.set('System Design & LLD', { total: lldTotal, solved: lldSolved });

  const categoryStats = Array.from(catMap.entries()).map(([category, data]) => ({
    category,
    solved: data.solved,
    total: data.total,
    pct: data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0
  })).sort((a, b) => b.total - a.total);

  // 7. Real 7-Day Velocity Log
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let activityMap: Record<string, { questions: number; mins: number }> = {};
  try {
    const rawMap = localStorage.getItem(STORAGE_DAILY_LOG_KEY);
    if (rawMap) activityMap = JSON.parse(rawMap);
  } catch {}

  const dailyVelocity: DailyActivityItem[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = i === 0 ? 'Today' : dayNames[d.getDay()];
    const log = activityMap[dateStr] || { questions: 0, mins: 0 };
    const dayQpm = log.mins > 0 ? Number((log.questions / log.mins).toFixed(2)) : 0;

    dailyVelocity.push({
      date: dateStr,
      dayName: dayLabel,
      questions: log.questions,
      mins: log.mins,
      qpm: dayQpm
    });
  }

  // 8. Streak
  let streakDays = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    if (activityMap[dateStr] && (activityMap[dateStr].questions > 0 || activityMap[dateStr].mins > 0)) {
      streakDays++;
    } else if (i > 0) {
      break;
    }
  }

  // 9. Comprehensive SDE Readiness Score (DSA 40% + LLD 35% + Study Time 15% + CN/DBMS Bonus 10%)
  const dsaScore = Math.min(40, Math.round((dsaSolved / Math.max(1, dsaTotal)) * 40));
  const lldScore = Math.min(35, Math.round((lldSolved / Math.max(1, lldTotal)) * 35));
  const timeScore = Math.min(15, Math.round((totalActiveMins / (50 * 60)) * 15));
  const bonusScoreCalc = Math.min(10, Math.round((bonusPoints / 40) * 10));
  const sdeReadinessScore = Math.min(100, dsaScore + lldScore + timeScore + bonusScoreCalc);

  return {
    dsaSolved,
    dsaTotal,
    dsaPct,
    lldSolved,
    lldTotal,
    lldPct,
    totalSolved,
    totalAvailableProblems,
    dbmsScore,
    dbmsQueriesExecuted,
    cnScore,
    cnModulesCompleted,
    bonusPoints,
    totalActiveMins,
    totalDedicatedHours,
    speedIndex,
    accuracyPercent,
    totalAttempts,
    correctAttempts,
    streakDays,
    timeBreakdown,
    difficultyStats: {
      easy: { solved: easySolved, total: easyTotal, pct: easyTotal > 0 ? Math.round((easySolved / easyTotal) * 100) : 0 },
      medium: { solved: medSolved, total: medTotal, pct: medTotal > 0 ? Math.round((medSolved / medTotal) * 100) : 0 },
      hard: { solved: hardSolved, total: hardTotal, pct: hardTotal > 0 ? Math.round((hardSolved / hardTotal) * 100) : 0 }
    },
    categoryStats,
    dailyVelocity,
    sdeReadinessScore
  };
}
