import { SDE_SHEET_DATA } from './sdeSheetData';
import { LLD_PROBLEMS } from './lldData';

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
 * Marks an LLD problem as solved.
 */
export function markLLDProblemSolved(problemId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_LLD_SOLVED_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    set.add(problemId);
    localStorage.setItem(STORAGE_LLD_SOLVED_KEY, JSON.stringify(Array.from(set)));
    recordRealActivity('lld', 15, 1, true);
  } catch {}
}

/**
 * Computes strictly 100% REAL user analytics data across DSA + LLD + Bonus (CN & DBMS).
 */
export function getRealAnalytics(): RealAnalyticsMetrics {
  // 1. DSA Solved
  let dsaSolvedIds: number[] = [];
  try {
    const raw1 = localStorage.getItem(STORAGE_SOLVED_IDS_KEY);
    const raw2 = localStorage.getItem('sdestream_solved_problems');
    const set = new Set<number>([
      ...(raw1 ? JSON.parse(raw1) : []),
      ...(raw2 ? JSON.parse(raw2) : [])
    ]);
    dsaSolvedIds = Array.from(set);
  } catch {
    dsaSolvedIds = [];
  }
  const dsaSolved = dsaSolvedIds.length;
  const dsaTotal = SDE_SHEET_DATA.length;
  const dsaPct = dsaTotal > 0 ? Math.round((dsaSolved / dsaTotal) * 100) : 0;

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

  // 6. Difficulty Stats
  const solvedSet = new Set(dsaSolvedIds);
  let easyTotal = 0, easySolved = 0;
  let medTotal = 0, medSolved = 0;
  let hardTotal = 0, hardSolved = 0;

  const catMap = new Map<string, { total: number; solved: number }>();

  for (const prob of SDE_SHEET_DATA) {
    const isSolved = solvedSet.has(prob.id);
    if (prob.difficulty === 'Easy') {
      easyTotal++;
      if (isSolved) easySolved++;
    } else if (prob.difficulty === 'Medium') {
      medTotal++;
      if (isSolved) medSolved++;
    } else if (prob.difficulty === 'Hard') {
      hardTotal++;
      if (isSolved) hardSolved++;
    }

    const cat = prob.category || 'Algorithms';
    const cEntry = catMap.get(cat) || { total: 0, solved: 0 };
    cEntry.total++;
    if (isSolved) cEntry.solved++;
    catMap.set(cat, cEntry);
  }

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
