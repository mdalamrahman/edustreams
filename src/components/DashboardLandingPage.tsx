import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  Flame, 
  Code2, 
  Cpu, 
  BookOpen, 
  BarChart3, 
  ArrowRight, 
  Target, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Database, 
  Network, 
  ExternalLink, 
  Code, 
  Layers, 
  Bot, 
  Terminal, 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  RefreshCw, 
  Play, 
  AlertTriangle, 
  FileSearch, 
  Radio, 
  Sliders, 
  Scale, 
  Mic, 
  PhoneCall, 
  Activity, 
  Server, 
  Workflow, 
  Check, 
  ChevronRight, 
  Bookmark,
  Share2,
  Lock,
  Boxes
} from 'lucide-react';
import { getRealAnalytics, RealAnalyticsMetrics, isProblemSlugSolved, isPotdSolvedToday, markProblemSolved, resetUnverifiedPotdToday } from '../lib/analytics';
import { fetchLeetCodePOTD, fetchGFGPOTD, LeetCodeDailyQuestion, GFGDailyQuestion, clearPOTDCache } from '../lib/leetcodeApi';
import { SDEProblem, SDE_SHEET_DATA, getUniversalSdePotd } from '../lib/sdeSheetData';
import { getSolvedIds, getLinkedProfiles } from '../lib/progressService';
import { 
  fetchLeetCodeFullProfile, 
  fetchGFGProfile, 
  LeetCodeFullProfileData, 
  GFGProfileData, 
  isLeetCodeProblemSolvedToday, 
  isGfgProblemSolvedToday,
  checkLeetCodeProfilePrivacy,
  verifyLeetCodePotdSubmission
} from '../lib/userProfileService';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../lib/AppContext';

interface DashboardLandingPageProps {
  user?: any;
  onNavigate?: (tab: any) => void;
  onOpenSdeProblem?: (problem: SDEProblem) => void;
  onOpenSqlWorkspace?: () => void;
  onOpenAskAI?: () => void;
}

export const DashboardLandingPage: React.FC<DashboardLandingPageProps> = ({
  user: propUser,
  onNavigate: propNavigate,
  onOpenSdeProblem: propOpenSdeProblem,
  onOpenSqlWorkspace: propOpenSql,
  onOpenAskAI: propOpenAskAI
}) => {
  const appCtx = useAppContext();
  const routerNavigate = useNavigate();
  const user = propUser !== undefined ? propUser : appCtx.user;

  const onNavigate = (tab: any) => {
    if (propNavigate) propNavigate(tab);
    if (tab === 'sde_sheet') routerNavigate('/dsa-sheets');
    else if (tab === 'dsa_problems') routerNavigate('/dsa-problems');
    else if (tab === 'lld') routerNavigate('/lld');
    else if (tab === 'hld' || tab === 'system_design') routerNavigate('/hld');
    else if (tab === 'interview') routerNavigate('/interview');
    else if (tab === 'resume_analyst') routerNavigate('/resume-analyst');
    else if (tab === 'channels') routerNavigate('/channels');
    else if (tab === 'analytics') routerNavigate('/analytics');
    else routerNavigate(`/${tab}`);
  };

  const onOpenSdeProblem = (prob: SDEProblem) => {
    if (propOpenSdeProblem) propOpenSdeProblem(prob);
    else {
      const slug = (prob as any).slug || prob.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      routerNavigate(`/problem/${slug}`);
    }
  };

  const onOpenSqlWorkspace = propOpenSql || (() => routerNavigate('/problem/sql-arena?type=sql'));
  const onOpenAskAI = propOpenAskAI || (() => appCtx.openAskAIWithMode());

  // Query 100% real computed student analytics
  const [metrics, setMetrics] = useState<RealAnalyticsMetrics>(() => getRealAnalytics(user?.email));
  const [solveEventCount, setSolveEventCount] = useState<number>(0);

  useEffect(() => {
    resetUnverifiedPotdToday();
    const handleUpdate = () => {
      setMetrics(getRealAnalytics(user?.email));
      setSolveEventCount(c => c + 1);
    };
    handleUpdate();
    window.addEventListener('sdetube_problem_solved', handleUpdate);
    window.addEventListener('sdetube_potd_solved', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sdetube_problem_solved', handleUpdate);
      window.removeEventListener('sdetube_potd_solved', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [user?.email]);

  const {
    dsaSolved,
    dsaTotal,
    dsaPct,
    lldSolved,
    lldTotal,
    lldPct,
    totalSolved,
    totalAvailableProblems,
    totalDedicatedHours,
    speedIndex,
    accuracyPercent,
    streakDays,
    bonusPoints,
    dbmsQueriesExecuted,
    cnModulesCompleted,
    sdeReadinessScore
  } = metrics;

  const userEmail = user?.email || 'mdalamrahman4@gmail.com';
  const linkedConfig = useMemo(() => getLinkedProfiles(userEmail), [userEmail]);

  // External Platform Profiles Data
  const [leetcodeProfile, setLeetcodeProfile] = useState<LeetCodeFullProfileData | null>(null);
  const [gfgProfile, setGfgProfile] = useState<GFGProfileData | null>(null);
  const [isSyncingProfiles, setIsSyncingProfiles] = useState<boolean>(false);
  const [isSyncingLc, setIsSyncingLc] = useState<boolean>(false);
  const [lcSyncMessage, setLcSyncMessage] = useState<string | null>(null);
  const [isSyncingGfg, setIsSyncingGfg] = useState<boolean>(false);
  const [gfgSyncMessage, setGfgSyncMessage] = useState<string | null>(null);

  const syncExternalProfiles = useCallback(async () => {
    setIsSyncingProfiles(true);
    const promises: Promise<any>[] = [];
    if (linkedConfig.leetcodeUsername?.trim()) {
      promises.push(
        fetchLeetCodeFullProfile(linkedConfig.leetcodeUsername.trim())
          .then(data => setLeetcodeProfile(data))
          .catch(() => {})
      );
    }
    if (linkedConfig.gfgUsername?.trim()) {
      promises.push(
        fetchGFGProfile(linkedConfig.gfgUsername.trim())
          .then(data => setGfgProfile(data))
          .catch(() => {})
      );
    }
    await Promise.allSettled(promises);
    setIsSyncingProfiles(false);
  }, [linkedConfig.leetcodeUsername, linkedConfig.gfgUsername]);

  useEffect(() => {
    syncExternalProfiles();
  }, [syncExternalProfiles]);

  const [potdUpdateTick, setPotdUpdateTick] = useState(0);

  useEffect(() => {
    const handlePotdUpdate = () => setPotdUpdateTick(t => t + 1);
    window.addEventListener('sdetube_potd_updated', handlePotdUpdate);
    import('../lib/potdService').then(({ fetchServerSdePotd }) => {
      fetchServerSdePotd().then((override) => {
        if (override) setPotdUpdateTick(t => t + 1);
      });
    }).catch(() => {});
    return () => window.removeEventListener('sdetube_potd_updated', handlePotdUpdate);
  }, []);

  // SDETube Curated POTD
  const sdePotd: SDEProblem = useMemo(() => {
    return getUniversalSdePotd();
  }, [potdUpdateTick]);

  // LeetCode Official Daily POTD
  const [lcPotd, setLcPotd] = useState<LeetCodeDailyQuestion | null>(null);
  const [isLoadingLc, setIsLoadingLc] = useState(false);

  // GeeksforGeeks Official Daily POTD
  const [gfgPotd, setGfgPotd] = useState<GFGDailyQuestion | null>(null);
  const [isLoadingGfg, setIsLoadingGfg] = useState(false);

  useEffect(() => {
    setIsLoadingLc(true);
    fetchLeetCodePOTD().then((res) => {
      setLcPotd(res);
      setIsLoadingLc(false);
    });

    setIsLoadingGfg(true);
    fetchGFGPOTD().then((res) => {
      setGfgPotd(res);
      setIsLoadingGfg(false);
    });
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  // Proactive background auto-verification for LeetCode POTD
  useEffect(() => {
    if (lcPotd && linkedConfig.leetcodeUsername?.trim()) {
      const alreadySolved = localStorage.getItem(`sdetube_potd_leetcode_solved_${today}`) === 'true';
      if (!alreadySolved) {
        verifyLeetCodePotdSubmission(
          linkedConfig.leetcodeUsername.trim(),
          lcPotd.titleSlug,
          lcPotd.title,
          lcPotd.date || today
        ).then(res => {
          if (res.verified) {
            localStorage.setItem(`sdetube_potd_leetcode_solved_${today}`, 'true');
            localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
            window.dispatchEvent(new CustomEvent('sdetube_potd_solved', { detail: { platform: 'leetcode', date: today } }));
            setSolveEventCount(c => c + 1);
          }
        }).catch(() => {});
      }
    }
  }, [lcPotd, linkedConfig.leetcodeUsername, today]);

  // Check Card A: SDETube SDE POTD solved status TODAY
  const isSdePotdSolved = useMemo(() => {
    if (localStorage.getItem(`sdetube_potd_sdetube_solved_${today}`) === 'true') return true;
    try {
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
            return true;
          }
        }
      }
    } catch {}
    return false;
  }, [sdePotd, today, solveEventCount]);

  // Check Card B: LeetCode POTD solved status TODAY
  const isLcPotdSolved = useMemo(() => {
    if (!lcPotd) return false;
    if (localStorage.getItem(`sdetube_potd_leetcode_solved_${today}`) === 'true') return true;

    const subVariants = [
      lcPotd.titleSlug,
      (lcPotd.titleSlug || '').toLowerCase().replace(/[^a-z0-9]/g, ''),
      (lcPotd.titleSlug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      (lcPotd.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    ].filter(Boolean);

    for (const v of subVariants) {
      const sub = localStorage.getItem(`edustream_submissions_${v}`);
      if (sub) {
        try {
          const list = JSON.parse(sub);
          if (Array.isArray(list) && list.some(item => {
            if (!item || (item.status !== 'Accepted' && item.status !== 'SUCCESS')) return false;
            if (item.id) {
              const ts = parseInt(item.id.split('_')[0], 10);
              if (ts > 0 && new Date(ts).toISOString().slice(0, 10) === today) return true;
            }
            return false;
          })) {
            return true;
          }
        } catch {}
      }
    }

    if (leetcodeProfile) {
      const isRemoteSolved = isLeetCodeProblemSolvedToday(
        leetcodeProfile,
        lcPotd.titleSlug,
        lcPotd.title,
        lcPotd.date
      );
      if (isRemoteSolved) {
        try {
          localStorage.setItem(`sdetube_potd_leetcode_solved_${today}`, 'true');
          localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
          window.dispatchEvent(new CustomEvent('sdetube_potd_solved', { detail: { platform: 'leetcode', date: today } }));
        } catch {}
        return true;
      }
    }
    return false;
  }, [lcPotd, leetcodeProfile, today, solveEventCount]);

  // Check Card C: GFG POTD solved status
  const isGfgPotdSolved = useMemo(() => {
    if (!gfgPotd) return false;
    if (localStorage.getItem(`sdetube_potd_gfg_solved_${today}`) === 'true') return true;

    const subVariants = [
      gfgPotd.titleSlug,
      '9999',
      'gfgpotd',
      (gfgPotd.titleSlug || '').toLowerCase().replace(/[^a-z0-9]/g, ''),
      (gfgPotd.titleSlug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      (gfgPotd.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      (gfgPotd.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    ].filter(Boolean);

    for (const v of subVariants) {
      const sub = localStorage.getItem(`edustream_submissions_${v}`);
      if (sub) {
        try {
          const list = JSON.parse(sub);
          if (Array.isArray(list) && list.some(item => {
            if (!item || (item.status !== 'Accepted' && item.status !== 'SUCCESS')) return false;
            let isToday = false;
            if (item.id) {
              const ts = parseInt(item.id.split('_')[0], 10);
              if (ts > 0 && new Date(ts).toISOString().slice(0, 10) === today) isToday = true;
            }
            if (!isToday && item.timestamp) {
              const ts = typeof item.timestamp === 'number' ? item.timestamp : Date.parse(item.timestamp);
              if (ts > 0 && new Date(ts).toISOString().slice(0, 10) === today) isToday = true;
            }
            return isToday;
          })) {
            return true;
          }
        } catch {}
      }
    }

    if (gfgProfile) {
      const isRemoteSolved = isGfgProblemSolvedToday(gfgProfile, gfgPotd.titleSlug, gfgPotd.title);
      if (isRemoteSolved) {
        try {
          localStorage.setItem(`sdetube_potd_gfg_solved_${today}`, 'true');
          localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
          markProblemSolved(gfgPotd.title, 10, gfgPotd.titleSlug);
        } catch {}
        return true;
      }
    }
    return false;
  }, [gfgPotd, gfgProfile, today, solveEventCount]);

  const handleSyncPlatformPotd = async () => {
    clearPOTDCache();
    const lcUser = linkedConfig.leetcodeUsername?.trim();
    const gfgUser = linkedConfig.gfgUsername?.trim();
    await Promise.allSettled([
      syncExternalProfiles(),
      fetchLeetCodePOTD(true).then(res => setLcPotd(res)),
      fetchGFGPOTD(true).then(res => setGfgPotd(res)),
      lcUser ? fetchLeetCodeFullProfile(lcUser, true).then(res => setLeetcodeProfile(res)) : Promise.resolve(),
      gfgUser ? fetchGFGProfile(gfgUser).then(res => setGfgProfile(res)) : Promise.resolve()
    ]);
  };

  // Per-platform inline sync handlers
  const handleSyncLcPotd = async () => {
    const lcUser = linkedConfig.leetcodeUsername?.trim();
    if (!lcUser) { setLcSyncMessage('Link your LeetCode username in Settings first.'); return; }
    setIsSyncingLc(true);
    setLcSyncMessage('Checking LeetCode...');
    try {
      const verifyRes = await verifyLeetCodePotdSubmission(
        lcUser, lcPotd?.titleSlug, lcPotd?.title, lcPotd?.date || today
      );
      if (verifyRes.verified) {
        localStorage.setItem(`sdetube_potd_leetcode_solved_${today}`, 'true');
        localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
        window.dispatchEvent(new CustomEvent('sdetube_potd_solved', { detail: { platform: 'leetcode', date: today } }));
        setSolveEventCount(c => c + 1);
        setLcSyncMessage('✓ Verified on LeetCode!');
      } else {
        // Fallback: fetch fresh profile
        const freshProfile = await fetchLeetCodeFullProfile(lcUser, true);
        if (freshProfile) {
          setLeetcodeProfile(freshProfile);
          const solved = lcPotd ? isLeetCodeProblemSolvedToday(freshProfile, lcPotd.titleSlug, lcPotd.title, lcPotd.date) : false;
          if (solved) {
            localStorage.setItem(`sdetube_potd_leetcode_solved_${today}`, 'true');
            localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
            window.dispatchEvent(new CustomEvent('sdetube_potd_solved', { detail: { platform: 'leetcode', date: today } }));
            setSolveEventCount(c => c + 1);
            setLcSyncMessage('✓ Verified via profile!');
          } else {
            setLcSyncMessage('Not yet solved on LeetCode today.');
          }
        } else {
          setLcSyncMessage('Could not fetch profile.');
        }
      }
    } catch { setLcSyncMessage('Sync failed. Try again.'); }
    setIsSyncingLc(false);
    setTimeout(() => setLcSyncMessage(null), 4000);
  };

  const handleSyncGfgPotd = async () => {
    const gfgUser = linkedConfig.gfgUsername?.trim();
    if (!gfgUser) { setGfgSyncMessage('Link your GFG username in Settings first.'); return; }
    setIsSyncingGfg(true);
    setGfgSyncMessage('Checking GFG...');
    try {
      const freshProfile = await fetchGFGProfile(gfgUser);
      if (freshProfile) {
        setGfgProfile(freshProfile);
        const solved = gfgPotd ? isGfgProblemSolvedToday(freshProfile, gfgPotd.titleSlug, gfgPotd.title) : false;
        if (solved) {
          localStorage.setItem(`sdetube_potd_gfg_solved_${today}`, 'true');
          localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
          if (gfgPotd) markProblemSolved(gfgPotd.title, 10, gfgPotd.titleSlug);
          window.dispatchEvent(new CustomEvent('sdetube_potd_solved', { detail: { platform: 'gfg', date: today } }));
          setSolveEventCount(c => c + 1);
          setGfgSyncMessage('✓ Verified on GFG!');
        } else {
          setGfgSyncMessage('Not yet solved on GFG today.');
        }
      } else {
        setGfgSyncMessage('Could not fetch GFG profile.');
      }
    } catch { setGfgSyncMessage('Sync failed. Try again.'); }
    setIsSyncingGfg(false);
    setTimeout(() => setGfgSyncMessage(null), 4000);
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Alex';
  const readinessDialPercent = Math.max(12, Math.min(100, sdeReadinessScore || 84));
  const progressRatio = totalAvailableProblems > 0 ? ((totalSolved / totalAvailableProblems) * 100).toFixed(1) : '19.1';

  return (
    <div className="w-full space-y-10 animate-fadeIn pb-20 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* ========================================================================= */}
      {/* 1. HERO & COMMAND DECK (Google Stitch Obsidian Telemetry)                 */}
      {/* ========================================================================= */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#111622] via-[#0e131d] to-[#080b11] border border-white/[0.08] p-6 sm:p-10 neon-glow-subtle shadow-2xl">
        {/* Ambient Top Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_50%_-20%,_rgba(0,240,255,0.22),_transparent_70%)]" />

        <div className="relative z-10 flex flex-col gap-6 max-w-4xl">
          {/* Status Indicator Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stitch-lowest/80 border border-cyan-400/40 w-fit backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-mono text-[11px] text-cyan-300 tracking-wider font-semibold uppercase">
              ● SYSTEM ONLINE // TARGET: FAANG &amp; TIER-1 ARCHITECTURES
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight font-sans leading-tight">
            Master SDE Interviews with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-purple-400">
              Production Precision
            </span>.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            A unified engineering war-room: 743+ curated DSA problems, live interactive HLD topology designers, LLD machine coding sandboxes, and AI-powered bar-raiser mock interviews. Engineered for Staff, Principal, and L5/E5 aspirations.
          </p>

          {/* Command Deck Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onOpenSdeProblem(sdePotd)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer font-mono"
            >
              <Terminal className="w-4 h-4 text-slate-950" />
              <span>Solve Daily Challenge (POTD)</span>
            </button>

            <button
              onClick={() => onNavigate('sde_sheet')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-stitch-low hover:bg-stitch-high border border-stitch-variant/80 text-slate-200 hover:text-cyan-300 font-bold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer font-mono"
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Explore 743+ DSA Curricula</span>
            </button>

            <button
              onClick={() => onNavigate('interview')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/50 text-purple-300 hover:text-white font-bold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer font-mono"
            >
              <Mic className="w-4 h-4 text-purple-400" />
              <span>Launch AI Bar-Raiser Mock</span>
            </button>
          </div>
        </div>

        {/* Telemetry Grid (4 Floating Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-stitch-variant/40">
          
          {/* Card 1: Total Solved */}
          <div className="bg-stitch-lowest/80 border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-[11px] text-stitch-dim font-medium uppercase">TOTAL SOLVED</span>
              <span className="font-mono text-[11px] text-stitch-mint font-semibold">+{bonusPoints || 8} pts</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-slate-100 font-sans">{totalSolved}</span>
              <span className="font-mono text-xs text-stitch-muted">/ {totalAvailableProblems} Qs</span>
            </div>
            <div className="w-full bg-stitch-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full transition-all duration-700" style={{ width: `${progressRatio}%` }} />
            </div>
            <span className="font-mono text-[10px] text-stitch-muted mt-1.5">Progress: {progressRatio}% Total</span>
          </div>

          {/* Card 2: Readiness Score */}
          <div className="bg-stitch-lowest/80 border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-[11px] text-stitch-dim font-medium uppercase">READINESS SCORE</span>
              <CheckCircle2 className="w-4 h-4 text-stitch-mint" />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-stitch-mint font-sans">{readinessDialPercent}%</span>
              <span className="font-mono text-xs text-stitch-mint font-medium">FAANG Ready</span>
            </div>
            <div className="w-full bg-stitch-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-stitch-mint h-full rounded-full transition-all duration-700" style={{ width: `${readinessDialPercent}%` }} />
            </div>
            <span className="font-mono text-[10px] text-stitch-muted mt-1.5">Benchmark: Top 9.4% Cohort</span>
          </div>

          {/* Card 3: Coding Hours */}
          <div className="bg-stitch-lowest/80 border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-[11px] text-stitch-dim font-medium uppercase">CODING HOURS</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-slate-100 font-sans">{totalDedicatedHours}</span>
              <span className="font-mono text-xs text-stitch-muted">hrs</span>
            </div>
            <div className="w-full bg-stitch-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: '68%' }} />
            </div>
            <span className="font-mono text-[10px] text-stitch-muted mt-1.5">Live Monaco &amp; Terminal session</span>
          </div>

          {/* Card 4: Solving Velocity */}
          <div className="bg-stitch-lowest/80 border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-[11px] text-stitch-dim font-medium uppercase">SOLVING PACE</span>
              <Zap className="w-4 h-4 text-stitch-lavender" />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-stitch-lavender font-sans">{speedIndex}</span>
              <span className="font-mono text-xs text-stitch-muted">q/min avg</span>
            </div>
            <div className="w-full bg-stitch-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-stitch-lavender h-full rounded-full" style={{ width: '76%' }} />
            </div>
            <span className="font-mono text-[10px] text-stitch-muted mt-1.5">Monaco Execution telemetry</span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. LIVE COHORT MILESTONE TICKER                                           */}
      {/* ========================================================================= */}
      <div className="w-full bg-stitch-lowest border border-stitch-variant/40 rounded-xl py-3 px-4 flex items-center gap-3 overflow-hidden shadow-sm">
        <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs font-bold shrink-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>LIVE COHORT MILESTONES:</span>
        </div>
        <div className="flex items-center gap-8 font-mono text-xs text-stitch-dim overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
          <div className="flex items-center gap-2">
            <span>🎉</span>
            <span className="text-slate-100 font-semibold">Rahul K.</span>
            <span>received</span>
            <span className="text-stitch-mint font-bold">L5 Offer from Google Bangalore</span>
          </div>
          <span className="text-stitch-muted">•</span>
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span className="text-slate-100 font-semibold">Priya M.</span>
            <span>completed</span>
            <span className="text-cyan-400 font-bold">Meta E6 System Design Track</span>
          </div>
          <span className="text-stitch-muted">•</span>
          <div className="flex items-center gap-2">
            <span>🚀</span>
            <span className="text-slate-100 font-semibold">Arjun S.</span>
            <span>cracked</span>
            <span className="text-stitch-lavender font-bold">Stripe L4 (100% Mock Score)</span>
          </div>
          <span className="text-stitch-muted">•</span>
          <div className="flex items-center gap-2">
            <span>💎</span>
            <span className="text-slate-100 font-semibold">Ananya V.</span>
            <span>submitted</span>
            <span className="text-stitch-mint font-bold">Distributed Cache LLD (0ms Concurrency)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TODAY'S DAILY CODING CHALLENGES (POTD TRIFECTA)                        */}
      {/* ========================================================================= */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stitch-variant/40 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight font-sans">
                Today's Problem of the Day (POTD Trifecta)
              </h2>
            </div>
            <p className="text-xs text-stitch-dim mt-0.5">
              Daily synchronized engineering challenges across SDETube, LeetCode, and GeeksforGeeks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stitch-container border border-stitch-variant font-mono text-xs text-slate-200">
              <Clock className="w-3.5 h-3.5 text-stitch-muted" />
              <span className="text-stitch-muted">Resets in:</span>
              <span className="text-cyan-400 font-bold">05h : 22m : 49s</span>
            </div>
            <button
              onClick={handleSyncPlatformPotd}
              disabled={isSyncingProfiles}
              className="p-1.5 rounded-lg bg-stitch-low hover:bg-stitch-high border border-stitch-variant text-stitch-dim hover:text-cyan-300 transition-colors cursor-pointer"
              title="Sync External Profiles"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingProfiles ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* 3 POTD Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Card 1: SDETube Curated POTD */}
          <div className="relative bg-stitch-low rounded-2xl border border-cyan-400/30 p-5 sm:p-6 flex flex-col justify-between hover:border-cyan-400 transition-all shadow-[0_0_20px_-8px_rgba(0,240,255,0.2)]">
            <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-mono text-[10px] font-bold flex items-center gap-1 shadow-sm">
              <Award className="w-3 h-3" />
              <span>SDETube Curated</span>
            </div>
            
            <div>
              <div className="flex justify-between items-start mt-2 mb-2">
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                  sdePotd.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                  sdePotd.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                  'bg-rose-950 border-rose-700 text-rose-300'
                }`}>
                  {sdePotd.difficulty || 'Hard'}
                </span>
                {isSdePotdSolved ? (
                  <span className="font-mono text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    ✓ Solved Today
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-stitch-muted">
                    SDE 191 Sheet
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">{sdePotd.name}</h3>
              <p className="text-xs text-stitch-dim mb-4 leading-relaxed">
                High-frequency interview challenge selected from the SDE Sheet • Practice in Monaco IDE with automated testbench & Judge0 compiler.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="px-2 py-0.5 rounded bg-stitch-container border border-stitch-variant/40 font-mono text-[10px] text-stitch-dim">
                  {sdePotd.category || 'Algorithms'}
                </span>
                {(sdePotd.companies || ['Google', 'Amazon']).slice(0, 2).map((comp, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-stitch-container border border-stitch-variant/40 font-mono text-[10px] text-stitch-dim">
                    {comp}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => onOpenSdeProblem(sdePotd)}
              className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer mt-auto"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{isSdePotdSolved ? '✓ Solved • Review in IDE' : 'Solve in Monaco IDE'}</span>
            </button>
          </div>

          {/* Card 2: LeetCode Live Sync POTD */}
          <div className="relative bg-stitch-low rounded-2xl border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between hover:border-stitch-variant transition-all">
            <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-semibold flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              <span>LeetCode Live Sync</span>
            </div>

            <div>
              <div className="flex justify-between items-start mt-2 mb-2">
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                  lcPotd?.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                  lcPotd?.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                  'bg-rose-950 border-rose-700 text-rose-300'
                }`}>
                  {lcPotd?.difficulty || 'Medium'}
                </span>
                <span className="font-mono text-[10px] text-stitch-muted">
                  {linkedConfig.leetcodeUsername ? `@${linkedConfig.leetcodeUsername}` : 'Account Linked'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">
                {lcPotd?.title || (isLoadingLc ? 'Loading Daily Challenge...' : 'Maximum Alternating Sum of Squares')}
              </h3>
              <p className="text-xs text-stitch-dim mb-4 leading-relaxed">
                {isLoadingLc 
                  ? 'Fetching today\'s authentic daily challenge directly from LeetCode official API...' 
                  : (lcPotd?.topicTags?.length 
                      ? `Official LeetCode Daily Challenge focusing on ${lcPotd.topicTags.join(', ')}.` 
                      : 'Solve today\'s official LeetCode problem with full automated testbench and edge case validations.')}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {(lcPotd?.topicTags || ['Algorithms', 'Array', 'Greedy']).slice(0, 3).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-stitch-container border border-stitch-variant/40 font-mono text-[10px] text-stitch-dim">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 mt-auto">
              {/* Primary: Solve on SDETube */}
              <button
                onClick={() => {
                  if (lcPotd) {
                    const dynamicProblem: SDEProblem = {
                      id: 8888,
                      sheetType: 'sde',
                      category: (lcPotd.topicTags && lcPotd.topicTags[0]) || 'Daily Challenge',
                      name: lcPotd.title,
                      difficulty: (lcPotd.difficulty as any) || 'Medium',
                      rating: '5.0 / 5',
                      leetcode: lcPotd.url,
                      gfg: `https://www.geeksforgeeks.org/problems/${lcPotd.titleSlug}/1`,
                      companies: ['Google', 'Meta', 'Amazon'],
                      slug: lcPotd.titleSlug
                    };
                    onOpenSdeProblem(dynamicProblem);
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-stitch-container hover:bg-stitch-high border border-stitch-variant text-slate-200 hover:text-cyan-300 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Solve in SDETube Monaco IDE with testcases"
              >
                <Code className="w-3.5 h-3.5" />
                <span className="truncate">{isLcPotdSolved ? '✓ Solved • Review on SDETube' : 'Solve on SDETube'}</span>
              </button>

              {/* Secondary row: Solve on LeetCode + Sync button */}
              <div className="flex gap-2">
                <a
                  href={lcPotd?.url || (lcPotd?.titleSlug ? `https://leetcode.com/problems/${lcPotd.titleSlug}/` : 'https://leetcode.com/problemset/all/')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    !lcPotd?.titleSlug && isLoadingLc ? 'pointer-events-none opacity-60' : ''
                  }`}
                  title="Solve directly on official LeetCode platform"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Solve on LeetCode</span>
                </a>
                <button
                  onClick={handleSyncLcPotd}
                  disabled={isSyncingLc}
                  className="px-3 py-2 rounded-xl bg-stitch-container hover:bg-stitch-high border border-stitch-variant text-stitch-dim hover:text-amber-300 transition-all cursor-pointer disabled:opacity-50"
                  title={lcSyncMessage || 'Auto-sync & verify LeetCode POTD solve'}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLc ? 'animate-spin text-amber-400' : ''}`} />
                </button>
              </div>
              {lcSyncMessage && (
                <p className={`text-[10px] font-mono text-center ${lcSyncMessage.startsWith('✓') ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {lcSyncMessage}
                </p>
              )}
            </div>
          </div>

          {/* Card 3: GeeksforGeeks POTD */}
          <div className="relative bg-stitch-low rounded-2xl border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between hover:border-stitch-variant transition-all">
            <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-stitch-mint font-mono text-[10px] font-semibold flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>GFG Official Sync</span>
            </div>

            <div>
              <div className="flex justify-between items-start mt-2 mb-2">
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                  gfgPotd?.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                  gfgPotd?.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                  'bg-rose-950 border-rose-700 text-rose-300'
                }`}>
                  {gfgPotd?.difficulty || 'Medium'}
                </span>
                <span className="font-mono text-[10px] text-stitch-muted">
                  {gfgPotd?.accuracy ? `Acc: ${gfgPotd.accuracy}%` : 'Acc: 64.2%'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">
                {gfgPotd?.title || 'Distinct Subsequences in String Matrix'}
              </h3>
              <p className="text-xs text-stitch-dim mb-4 leading-relaxed">
                Find the total number of paths in an N x M character matrix matching target sequence S using memoized DP transitions modulo 1e9+7.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {(gfgPotd?.topicTags || ['Dynamic Programming', 'Matrix DFS']).slice(0, 2).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-stitch-container border border-stitch-variant/40 font-mono text-[10px] text-stitch-dim">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 mt-auto">
              {/* Primary: Solve on SDETube */}
              <button
                onClick={() => {
                  if (gfgPotd) {
                    const dynamicProblem: SDEProblem = {
                      id: 9999,
                      sheetType: 'sde',
                      category: (gfgPotd.topicTags && gfgPotd.topicTags[0]) || 'GFG POTD',
                      name: gfgPotd.title,
                      difficulty: (gfgPotd.difficulty as any) || 'Medium',
                      rating: '5.0 / 5',
                      leetcode: `https://leetcode.com/problem-list/all/?search=${encodeURIComponent(gfgPotd.title)}`,
                      gfg: gfgPotd.url,
                      companies: ['Amazon', 'Microsoft', 'Flipkart'],
                      slug: gfgPotd.titleSlug
                    };
                    onOpenSdeProblem(dynamicProblem);
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-stitch-container hover:bg-stitch-high border border-stitch-variant text-slate-200 hover:text-stitch-mint font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Solve in SDETube Monaco IDE"
              >
                <Code className="w-3.5 h-3.5" />
                <span className="truncate">{isGfgPotdSolved ? '✓ Solved • Review on SDETube' : 'Solve on SDETube'}</span>
              </button>

              {/* Secondary row: Solve on GFG + Sync button */}
              <div className="flex gap-2">
                <a
                  href={gfgPotd?.url || (gfgPotd?.titleSlug ? `https://www.geeksforgeeks.org/problems/${gfgPotd.titleSlug}/1` : 'https://www.geeksforgeeks.org/problem-of-the-day')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Solve on official GeeksforGeeks platform"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Solve on GFG</span>
                </a>
                <button
                  onClick={handleSyncGfgPotd}
                  disabled={isSyncingGfg}
                  className="px-3 py-2 rounded-xl bg-stitch-container hover:bg-stitch-high border border-stitch-variant text-stitch-dim hover:text-emerald-300 transition-all cursor-pointer disabled:opacity-50"
                  title={gfgSyncMessage || 'Auto-sync & verify GFG POTD solve'}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGfg ? 'animate-spin text-emerald-400' : ''}`} />
                </button>
              </div>
              {gfgSyncMessage && (
                <p className={`text-[10px] font-mono text-center ${gfgSyncMessage.startsWith('✓') ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {gfgSyncMessage}
                </p>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. LIVE INTERACTIVE MONACO & TELEMETRY SANDBOX PREVIEW                    */}
      {/* ========================================================================= */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight font-sans">
              Interactive Production Sandbox &amp; Test Telemetry
            </h2>
          </div>
          <span className="font-mono text-xs text-stitch-muted hidden md:inline">
            Clustered Kernel: v2.48.0-arm64
          </span>
        </div>

        {/* Split Terminal Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-stitch-variant/60 bg-stitch-lowest shadow-xl">
          
          {/* Left Side: Monaco Editor Mock (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-stitch-variant/40 bg-[#0c0f17]">
            {/* Editor Tabs Header */}
            <div className="flex items-center justify-between bg-stitch-low px-4 py-2 border-b border-stitch-variant/30">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0c0f17] text-cyan-300 border-b-2 border-cyan-400 font-semibold">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>solution.cpp</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-stitch-muted text-[11px]">
                  <span>test_cases.json</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-stitch-muted text-[11px]">
                  <span>hld_diagram.drawio</span>
                </span>
              </div>
              <span className="font-mono text-[11px] text-stitch-mint flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-stitch-mint"></span>
                C++20 Clang
              </span>
            </div>

            {/* Code Canvas with Line Numbers */}
            <div className="p-4 sm:p-5 font-mono text-xs overflow-x-auto leading-relaxed select-none">
              <div className="flex gap-4">
                <div className="text-slate-600 text-right pr-2 select-none font-mono">
                  <div>01</div><div>02</div><div>03</div><div>04</div><div>05</div><div>06</div><div>07</div><div>08</div><div>09</div><div>10</div><div>11</div><div>12</div><div>13</div><div>14</div>
                </div>
                <div className="text-slate-200 flex-grow font-normal leading-6">
                  <p><span className="text-stitch-lavender font-semibold">#include</span> <span className="text-stitch-mint">&lt;unordered_map&gt;</span></p>
                  <p><span className="text-stitch-lavender font-semibold">#include</span> <span className="text-stitch-mint">&lt;mutex&gt;</span></p>
                  <p><span className="text-stitch-muted">// Production Grade Concurrency-Safe LRU with millisecond TTL</span></p>
                  <p><span className="text-cyan-400 font-semibold">class</span> <span className="text-slate-100 font-bold">ConcurrentLRUCache</span> &#123;</p>
                  <p className="pl-4"><span className="text-cyan-400">private:</span></p>
                  <p className="pl-6"><span className="text-stitch-lavender">std::mutex</span> mtx;</p>
                  <p className="pl-6 code-line-active"><span className="text-cyan-400">struct</span> <span className="text-slate-100">CacheNode</span> &#123; <span className="text-stitch-lavender">int</span> val; <span className="text-stitch-muted">uint64_t</span> expireAt; &#125;;</p>
                  <p className="pl-6"><span className="text-stitch-lavender">std::unordered_map</span>&lt;<span className="text-stitch-lavender">int</span>, CacheNode&gt; table;</p>
                  <p className="pl-4"><span className="text-cyan-400">public:</span></p>
                  <p className="pl-6"><span className="text-stitch-lavender font-semibold">int</span> <span className="text-stitch-mint font-semibold">get</span>(<span className="text-stitch-lavender">int</span> key) &#123;</p>
                  <p className="pl-8"><span className="text-stitch-lavender">std::lock_guard</span>&lt;<span className="text-stitch-lavender">std::mutex</span>&gt; lock(mtx);</p>
                  <p className="pl-8"><span className="text-cyan-400 font-semibold">if</span> (!table.count(key) || isExpired(table[key])) <span className="text-rose-400 font-semibold">return</span> -1;</p>
                  <p className="pl-8"><span className="text-rose-400 font-semibold">return</span> table[key].val;</p>
                  <p className="pl-6">&#125;</p>
                  <p>&#125;;</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Test Runner Telemetry Drawer (5 Cols) */}
          <div className="lg:col-span-5 bg-stitch-low p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stitch-variant/40 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-stitch-mint flex items-center justify-center text-slate-950 font-bold text-[10px]">
                    ✓
                  </span>
                  <span className="text-sm font-bold text-stitch-mint font-mono">All 28 Testcases Passed</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-stitch-mint font-mono text-[10px] font-bold border border-emerald-500/30">
                  ACCEPTED
                </span>
              </div>

              {/* Realtime Telemetry Counter HUD */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-stitch-lowest p-3 rounded-xl border border-stitch-variant/30">
                  <span className="font-mono text-[10px] text-stitch-muted block mb-1">Execution Time</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-slate-100 font-mono">12 ms</span>
                    <span className="font-mono text-[10px] text-stitch-mint font-semibold">Beats 98.4%</span>
                  </div>
                </div>

                <div className="bg-stitch-lowest p-3 rounded-xl border border-stitch-variant/30">
                  <span className="font-mono text-[10px] text-stitch-muted block mb-1">Memory Allocation</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-slate-100 font-mono">44.1 MB</span>
                    <span className="font-mono text-[10px] text-stitch-mint font-semibold">Beats 91.2%</span>
                  </div>
                </div>
              </div>

              {/* Verification Stream Console */}
              <div className="bg-stitch-lowest rounded-xl border border-stitch-variant/30 p-3 font-mono text-[11px] flex flex-col gap-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>[Test 01..12] Unit Boundary Conditions</span>
                  <span className="text-stitch-mint">PASSED (0.4ms)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>[Test 13..24] 10k Concurrent Goroutines</span>
                  <span className="text-stitch-mint">PASSED (6.8ms)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>[Test 25..28] Millisecond TTL Expire Sweep</span>
                  <span className="text-stitch-mint">PASSED (4.8ms)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-stitch-variant/40 mt-4">
              <button
                onClick={() => onOpenSdeProblem(sdePotd)}
                className="flex-1 py-2 rounded-xl bg-stitch-container hover:bg-stitch-high border border-stitch-variant text-slate-200 font-mono text-xs transition-colors cursor-pointer"
              >
                Custom Tests (JSON)
              </button>
              <button
                onClick={() => onOpenSdeProblem(sdePotd)}
                className="flex-1 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
              >
                Submit to Production
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CORE LEARNING TRACKS (BALANCED BENTO GRID OF 6 TRACKS)                 */}
      {/* ========================================================================= */}
      <section className="flex flex-col gap-4">
        <div className="border-b border-stitch-variant/40 pb-3">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight font-sans">
              Core Engineering Learning Tracks
            </h2>
          </div>
          <p className="text-xs text-stitch-dim mt-0.5">
            Comprehensive, battle-tested curricula designed specifically for Principal &amp; FAANG level bars.
          </p>
        </div>

        {/* Bento Grid (6 tracks) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Track 1: DSA Curated Curricula */}
          <div 
            onClick={() => onNavigate('sde_sheet')}
            className="bg-stitch-low rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between hover:border-cyan-400/40 transition-all group cursor-pointer shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                  <Terminal className="w-6 h-6" />
                </span>
                <span className="font-mono text-[10px] text-stitch-mint bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  743+ Problems
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                DSA Curated Curricula
              </h3>
              <p className="text-xs text-stitch-dim mb-4 leading-relaxed">
                Master foundational algorithms: Includes the complete 191 SDE Sheet, Striver A2Z 474 Qs, and Blind 75 with optimal pattern classifications.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                <span className="px-2 py-0.5 rounded bg-stitch-container font-mono text-[10px] text-stitch-muted border border-stitch-variant/40">Google</span>
                <span className="px-2 py-0.5 rounded bg-stitch-container font-mono text-[10px] text-stitch-muted border border-stitch-variant/40">Meta</span>
                <span className="px-2 py-0.5 rounded bg-stitch-container font-mono text-[10px] text-stitch-muted border border-stitch-variant/40">Amazon</span>
                <span className="px-2 py-0.5 rounded bg-stitch-container font-mono text-[10px] text-stitch-muted border border-stitch-variant/40">Uber</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-cyan-400 font-semibold group-hover:gap-3 transition-all">
              <span>Explore Curricula</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Track 2: High-Level System Design (HLD) Hub */}
          <div 
            onClick={() => onNavigate('hld')}
            className="bg-stitch-low rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between hover:border-cyan-400/40 transition-all group cursor-pointer shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-purple-500/15 text-stitch-lavender border border-purple-500/30">
                  <Network className="w-6 h-6" />
                </span>
                <span className="font-mono text-[10px] text-stitch-lavender bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
                  Live Visualizer
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                High-Level System Design Hub
              </h3>
              <p className="text-xs text-stitch-dim mb-4 leading-relaxed">
                Drag-and-drop interactive architecture canvas: Build Leaky Bucket Rate Limiters, Distributed Cache clusters, and explore dynamic CAP trade-off matrices.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                <span className="px-2 py-0.5 rounded bg-stitch-container font-mono text-[10px] text-stitch-muted border border-stitch-variant/40">Rate Limiter</span>
                <span className="px-2 py-0.5 rounded bg-stitch-container font-mono text-[10px] text-stitch-muted border border-stitch-variant/40">Consistent Hash</span>
                <span className="px-2 py-0.5 rounded bg-stitch-container font-mono text-[10px] text-stitch-muted border border-stitch-variant/40">Event Sourcing</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-cyan-400 font-semibold group-hover:gap-3 transition-all">
              <span>Launch Architecture Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Track 3: Low-Level Design & Machine Coding */}
          <div 
            onClick={() => onNavigate('lld')}
            className="bg-stitch-low rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between hover:border-cyan-400/40 transition-all group cursor-pointer shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-emerald-500/15 text-stitch-mint border border-emerald-500/30">
                  <Cpu className="w-6 h-6" />
                </span>
                <span className="font-mono text-[10px] text-stitch-mint bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  SOLID Certified
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                LLD &amp; Machine Coding Suite
              </h3>
              <p className="text-xs text-stitch-dim mb-4 leading-relaxed">
                Production-ready object-oriented design: Build Kafka Lite message queues, smart multi-elevator controllers, and inspect UML class relationships.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                <span className="px-2 py-0.5 rounded bg-stitch-container font-mono text-[10px] text-stitch-muted border border-stitch-variant/40">Kafka Lite</span>
                <span className="px-2 py-0.5 rounded bg-stitch-container font-mono text-[10px] text-stitch-muted border border-stitch-variant/40">Elevator Subsystem</span>
                <span className="px-2 py-0.5 rounded bg-stitch-container font-mono text-[10px] text-stitch-muted border border-stitch-variant/40">Factory Pattern</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-cyan-400 font-semibold group-hover:gap-3 transition-all">
              <span>Enter LLD Sandbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Track 4: AI Mock Interview Bar-Raiser */}
          <div 
            onClick={() => onNavigate('interview')}
            className="bg-stitch-low rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between hover:border-cyan-400/40 transition-all group cursor-pointer shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-400/30">
                  <Bot className="w-6 h-6" />
                </span>
                <span className="font-mono text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/30 font-bold">
                  AI Bar-Raiser
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                AI Bar-Raiser Mock Interviews
              </h3>
              <p className="text-xs text-stitch-dim mb-4 leading-relaxed">
                Rigorous live interrogation with Marcus Vance (Principal Architect AI). Features real-time voice latency (&lt;250ms), WebRTC wave analyzer, and STAR behavioral rubrics.
              </p>
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-stitch-lowest border border-stitch-variant/40 mb-5">
                <span className="w-2 h-2 rounded-full bg-stitch-mint animate-ping"></span>
                <span className="font-mono text-xs text-slate-200">
                  Avg Candidate Score: <strong className="text-cyan-400">92 / 100 STAR</strong>
                </span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-cyan-400 font-semibold group-hover:gap-3 transition-all">
              <span>Start Voice Simulation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Track 5: Cloud Video Lectures & Labs */}
          <div 
            onClick={() => onNavigate('channels')}
            className="bg-stitch-low rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between hover:border-cyan-400/40 transition-all group cursor-pointer shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-400/30">
                  <BookOpen className="w-6 h-6" />
                </span>
                <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                  4K Precision
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                Video Lectures &amp; Sync Labs
              </h3>
              <p className="text-xs text-stitch-dim mb-4 leading-relaxed">
                Ultra-high-definition architectural masterclasses with synchronized timestamp code execution. Split your monitor to follow line-by-line kernel internals.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                <span className="px-2 py-0.5 rounded bg-stitch-container font-mono text-[10px] text-stitch-muted border border-stitch-variant/40">Sync Timestamps</span>
                <span className="px-2 py-0.5 rounded bg-stitch-container font-mono text-[10px] text-stitch-muted border border-stitch-variant/40">Dual IDE Mirror</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-cyan-400 font-semibold group-hover:gap-3 transition-all">
              <span>Watch Masterclasses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Track 6: AI Resume Analyst & ATS Engine */}
          <div 
            onClick={() => onNavigate('resume_analyst')}
            className="bg-stitch-low rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between hover:border-cyan-400/40 transition-all group cursor-pointer shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30">
                  <FileSearch className="w-6 h-6" />
                </span>
                <span className="font-mono text-[10px] text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/30 font-bold">
                  88% Match Rate
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                AI Resume Analyst &amp; ATS Engine
              </h3>
              <p className="text-xs text-stitch-dim mb-4 leading-relaxed">
                Benchmark your CV against Tier-1 FAANG job descriptions. Real-time keyword vector alignment, missing impact metrics detector, and quantified bullet enhancements.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-stitch-mint font-mono text-[10px] border border-emerald-500/30 font-medium">
                  Matched: gRPC, K8s
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 font-mono text-[10px] border border-rose-500/30 font-medium">
                  Missing: Raft Consensus
                </span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-cyan-400 font-semibold group-hover:gap-3 transition-all">
              <span>Scan My Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. HARDWARE-LEVEL ARCHITECTURE PREVIEW SHOWCASE                           */}
      {/* ========================================================================= */}
      <section className="bg-stitch-lowest border border-stitch-variant/40 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold">
            <Server className="w-4 h-4" />
            <span>DISTRIBUTED TRACE VISUALIZER</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans">
            Experience Real Production Scenarios
          </h3>
          <p className="text-xs sm:text-sm text-stitch-dim leading-relaxed">
            Don't just write algorithms in an isolated sandbox. Run them against simulated network latency partitions, CPU thrashing, memory leaks, and distributed split-brain chaos tests.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => onNavigate('hld')}
            className="px-5 py-3 rounded-xl bg-stitch-high border border-stitch-variant/60 text-slate-200 font-mono text-xs hover:border-cyan-400 transition-all cursor-pointer"
          >
            View Architecture Docs
          </button>
          <button
            onClick={() => onNavigate('lld')}
            className="px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
          >
            Deploy Chaos Sandbox
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. QUICK TOOLING STRIP (Universal Studio Removed)                         */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-stitch-low border border-stitch-variant/60 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Mission Control Quick Tooling</span>
          </h4>
          <p className="text-xs text-stitch-muted">Instant launch into in-browser engineering developer environments</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenSqlWorkspace}
            className="px-4 py-2.5 rounded-xl bg-stitch-container hover:bg-stitch-high border border-stitch-variant text-stitch-lavender text-xs font-bold flex items-center gap-2 cursor-pointer transition-all font-mono"
          >
            <Database className="w-3.5 h-3.5" />
            <span>WebAssembly SQL Arena</span>
          </button>

          <button
            onClick={() => onNavigate('resume_analyst')}
            className="px-4 py-2.5 rounded-xl bg-stitch-container hover:bg-stitch-high border border-stitch-variant text-stitch-mint text-xs font-bold flex items-center gap-2 cursor-pointer transition-all font-mono"
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>Resume ATS Analyst</span>
          </button>

          <button
            onClick={onOpenAskAI}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all font-mono"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask AI Teaching Assistant</span>
          </button>
        </div>
      </div>

    </div>
  );
};
