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
  FileSearch
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

  // Query 100% real computed student analytics (reactive on problem solve)
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

  // Check Card B: LeetCode POTD solved status TODAY (Local + Remote submission check)
  const isLcPotdSolved = useMemo(() => {
    if (!lcPotd) return false;
    // 1. Check local marks for today
    if (localStorage.getItem(`sdetube_potd_leetcode_solved_${today}`) === 'true') return true;

    // Check localStorage submissions made TODAY
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

    // 2. Check remote LeetCode profile for an Accepted submission made TODAY
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

  // Check Card C: GFG POTD solved status (Strict today submission check)
  const isGfgPotdSolved = useMemo(() => {
    if (!gfgPotd) return false;
    // 1. Check local marks and submissions
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

    // 2. Check remote GFG profile for authenticated solve today
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

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Engineer';

  return (
    <div className="w-full space-y-8 animate-fadeIn pb-16">
      
      {/* ========================================================================= */}
      {/* 1. HERO WELCOME & STUDENT COMMAND CENTER HEADER                           */}
      {/* ========================================================================= */}
      <div className="w-full p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/60 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Greeting & Mission */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Full-Stack SDE Interview Operating System</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">{userName}</span> 🚀
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Your personalized interview preparation workspace. Master Data Structures & Algorithms, practice live Object-Oriented Low-Level Design, and solve daily coding challenges.
            </p>

            {/* Live Metrics Row */}
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-slate-300">Streak:</span>
                <span className="font-bold text-amber-300">{streakDays} Days</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Solved:</span>
                <span className="font-bold text-emerald-300">{totalSolved} Problems</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300">Time:</span>
                <span className="font-bold text-indigo-300">{totalDedicatedHours}h Dedicated</span>
              </div>
            </div>

            {/* Above-the-Fold High-Converting Hero CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => onOpenSdeProblem(sdePotd)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm tracking-tight shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Solve Today's SDE Problem of the Day"
              >
                <Flame className="w-4 h-4 fill-slate-950 text-slate-950 animate-bounce" />
                <span>Solve Today's POTD</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('sde_sheet')}
                className="px-4 py-3 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              >
                <Code2 className="w-4 h-4 text-indigo-300" />
                <span>Explore SDE Sheets (743 Qs)</span>
              </button>

              <button
                onClick={() => onNavigate('interview')}
                className="px-4 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
              >
                <Bot className="w-4 h-4 text-purple-400" />
                <span>AI Mock Interview</span>
              </button>
            </div>

            {/* Hero Social Proof Tag */}
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Free & Open Access
              </span>
              <span>&bull;</span>
              <span>Real Monaco IDE</span>
              <span>&bull;</span>
              <span>4,200+ Submissions Evaluated</span>
            </div>
          </div>

          {/* Right Column: SDE Readiness Score Dial */}
          <div className="lg:col-span-5 flex flex-col items-center sm:items-end justify-center">
            <div className="w-full max-w-xs p-5 rounded-2xl bg-slate-950/90 border border-indigo-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Interview Readiness</span>
                <span className="text-xs font-bold text-amber-300 font-mono">{sdeReadinessScore}/100</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-1000 ease-out"
                  style={{ width: `${Math.max(5, sdeReadinessScore)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className={`font-bold ${
                  sdeReadinessScore >= 80 ? 'text-emerald-400' :
                  sdeReadinessScore >= 50 ? 'text-amber-400' :
                  'text-indigo-300'
                }`}>
                  {sdeReadinessScore >= 80 ? '🚀 SDE Ready' :
                   sdeReadinessScore >= 50 ? '🎯 Interview Ready' :
                   sdeReadinessScore >= 25 ? '📈 Intermediate' :
                   '🌱 Active Learner'}
                </span>
                <button
                  onClick={() => onNavigate('analytics')}
                  className="text-slate-400 hover:text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Analytics</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TODAY'S DAILY CODING CHALLENGES (POTD TRIFECTA)                        */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-lg font-extrabold text-slate-100">Today's Daily Coding Challenges (POTD)</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-mono text-slate-400">Solve daily on SDETube IDE or official platforms</span>
            <button
              onClick={handleSyncPlatformPotd}
              disabled={isSyncingProfiles}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Sync status from official LeetCode & GeeksforGeeks profiles"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingProfiles ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isSyncingProfiles ? 'Syncing...' : 'Sync Platform'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card A: SDETube Curated SDE POTD */}
          <div className={`glass-panel p-6 rounded-3xl border ${
            isSdePotdSolved 
              ? 'border-emerald-500/60 bg-gradient-to-br from-slate-950 via-emerald-950/25 to-slate-950 shadow-emerald-950/30' 
              : 'border-indigo-500/40 bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950'
          } shadow-xl flex flex-col justify-between group hover:border-indigo-500/80 transition-all`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 font-mono text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>SDETube SDE POTD</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {isSdePotdSolved && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Solved
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    sdePotd.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                    sdePotd.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                    'bg-rose-950 border-rose-700 text-rose-300'
                  }`}>
                    {sdePotd.difficulty}
                  </span>
                </div>
              </div>

              <div>
                <h3 className={`text-base font-bold transition-colors line-clamp-1 ${
                  isSdePotdSolved ? 'text-emerald-200' : 'text-slate-100 group-hover:text-indigo-300'
                }`}>
                  {sdePotd.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  High-frequency interview challenge curated from the 191 SDE Sheet with in-browser Monaco IDE and test runner.
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-3">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {sdePotd.category}
                  </span>
                  {sdePotd.companies && sdePotd.companies.length > 0 && (
                    <>
                      <span>&bull;</span>
                      <span className="truncate">{sdePotd.companies.slice(0, 2).join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-2">
              <button
                onClick={() => onOpenSdeProblem(sdePotd)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isSdePotdSolved
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
                }`}
              >
                {isSdePotdSolved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                    <span>✓ Solved • Review Solution</span>
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4" />
                    <span>⚡ Solve in SDETube IDE</span>
                  </>
                )}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                {sdePotd.leetcode && (
                  <a
                    href={sdePotd.leetcode}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>LeetCode</span>
                  </a>
                )}
                {sdePotd.gfg && (
                  <a
                    href={sdePotd.gfg}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>GFG</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Card B: Official LeetCode POTD */}
          <div className={`glass-panel p-6 rounded-3xl border ${
            isLcPotdSolved 
              ? 'border-emerald-500/60 bg-gradient-to-br from-slate-950 via-emerald-950/25 to-slate-950 shadow-emerald-950/30' 
              : 'border-amber-500/40 bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950'
          } shadow-xl flex flex-col justify-between group hover:border-amber-500/80 transition-all`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-700/60 font-mono text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>LeetCode POTD</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {isLcPotdSolved && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Solved Today
                    </span>
                  )}
                  {lcPotd && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      lcPotd.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                      lcPotd.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                      'bg-rose-950 border-rose-700 text-rose-300'
                    }`}>
                      {lcPotd.difficulty}
                    </span>
                  )}
                </div>
              </div>

              {isLoadingLc ? (
                <div className="py-6 text-center text-slate-400 font-mono text-xs animate-pulse">
                  Querying live Daily Coding Problem...
                </div>
              ) : lcPotd ? (
                <>
                  <div>
                    <h3 className={`text-base font-bold transition-colors line-clamp-1 ${
                      isLcPotdSolved ? 'text-emerald-200' : 'text-slate-100 group-hover:text-amber-300'
                    }`}>
                      {lcPotd.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Official Problem of the Day &bull; {lcPotd.date}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(lcPotd.topicTags || ['Algorithms']).slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* LeetCode Private Submissions Alert Pill */}
                  {leetcodeProfile && checkLeetCodeProfilePrivacy(leetcodeProfile).isPrivate && (
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-2 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 text-amber-300 min-w-0">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                        <span className="truncate">LeetCode submissions are Private</span>
                      </div>
                      <a
                        href="https://leetcode.com/profile/account/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] inline-flex items-center gap-1 transition-all flex-shrink-0 cursor-pointer"
                        title="Open LeetCode Privacy Settings"
                      >
                        <span>Make Public ↗</span>
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-slate-500 font-mono py-4">
                  Daily problem available online.
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-2">
              {lcPotd && (
                <>
                  <button
                    onClick={() => {
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
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isLcPotdSolved
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                        : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-600/30'
                    }`}
                  >
                    {isLcPotdSolved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                        <span>✓ Solved Today • Review in IDE</span>
                      </>
                    ) : (
                      <>
                        <Code className="w-4 h-4" />
                        <span>⚡ Solve in SDETube IDE</span>
                      </>
                    )}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={lcPotd.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <span>↗ Solve on LeetCode</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {/* LeetCode Account Status & Manual Solved Toggle */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                    <span className="truncate max-w-[150px]">
                      {linkedConfig.leetcodeUsername ? `@${linkedConfig.leetcodeUsername}` : 'LC not linked'}
                    </span>
                    <button
                      onClick={() => {
                        const current = localStorage.getItem(`sdetube_potd_leetcode_solved_${today}`) === 'true';
                        if (current) {
                          localStorage.removeItem(`sdetube_potd_leetcode_solved_${today}`);
                          const sdeSolved = localStorage.getItem(`sdetube_potd_sdetube_solved_${today}`) === 'true';
                          const gfgSolved = localStorage.getItem(`sdetube_potd_gfg_solved_${today}`) === 'true';
                          if (!sdeSolved && !gfgSolved) {
                            localStorage.removeItem(`sdetube_potd_solved_${today}`);
                          }
                        } else {
                          localStorage.setItem(`sdetube_potd_leetcode_solved_${today}`, 'true');
                          localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
                        }
                        window.dispatchEvent(new CustomEvent('sdetube_potd_solved', { detail: { platform: 'leetcode', date: today } }));
                        setSolveEventCount(prev => prev + 1);
                      }}
                      className="text-amber-400 hover:text-amber-300 underline cursor-pointer text-[10px] font-bold"
                    >
                      {isLcPotdSolved ? 'Unmark Solved' : 'Mark as Solved ✓'}
                    </button>
                  </div>

                </>
              )}
            </div>
          </div>

          {/* Card C: GeeksforGeeks POTD */}
          <div className={`glass-panel p-6 rounded-3xl border ${
            isGfgPotdSolved 
              ? 'border-emerald-500/60 bg-gradient-to-br from-slate-950 via-emerald-950/25 to-slate-950 shadow-emerald-950/30' 
              : 'border-emerald-500/40 bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950'
          } shadow-xl flex flex-col justify-between group hover:border-emerald-500/80 transition-all`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 font-mono text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>GFG POTD</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {isGfgPotdSolved && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Solved Today
                    </span>
                  )}
                  {gfgPotd && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      gfgPotd.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                      gfgPotd.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                      'bg-rose-950 border-rose-700 text-rose-300'
                    }`}>
                      {gfgPotd.difficulty}
                    </span>
                  )}
                </div>
              </div>

              {isLoadingGfg ? (
                <div className="py-6 text-center text-slate-400 font-mono text-xs animate-pulse">
                  Querying live GFG Problem of the Day...
                </div>
              ) : gfgPotd ? (
                <>
                  <div>
                    <h3 className={`text-base font-bold transition-colors line-clamp-1 ${
                      isGfgPotdSolved ? 'text-emerald-200' : 'text-slate-100 group-hover:text-emerald-300'
                    }`}>
                      {gfgPotd.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      GFG Problem of the Day &bull; {gfgPotd.date}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 items-center">
                    {(gfgPotd.topicTags || ['Dynamic Programming']).slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        {tag}
                      </span>
                    ))}
                    {gfgPotd.accuracy && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-[10px] text-emerald-300 font-mono">
                        {gfgPotd.accuracy}% Acc
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500 font-mono py-4">
                  Daily GFG challenge available.
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-2">
              {gfgPotd && (
                <>
                  <button
                    onClick={() => {
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
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isGfgPotdSolved
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                    }`}
                  >
                    {isGfgPotdSolved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                        <span>✓ Solved Today • Review in IDE</span>
                      </>
                    ) : (
                      <>
                        <Code className="w-4 h-4" />
                        <span>⚡ Solve in SDETube IDE</span>
                      </>
                    )}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={gfgPotd.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <span>↗ Solve on GeeksforGeeks</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {/* GFG Account Status & Manual Solved Toggle */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                    <span className="truncate max-w-[150px]">
                      {linkedConfig.gfgUsername ? `@${linkedConfig.gfgUsername}` : 'GFG not linked'}
                    </span>
                    <button
                      onClick={() => {
                        const current = localStorage.getItem(`sdetube_potd_gfg_solved_${today}`) === 'true';
                        if (current) {
                          localStorage.removeItem(`sdetube_potd_gfg_solved_${today}`);
                          localStorage.removeItem(`sdetube_potd_gfg_manual_solved_${today}`);
                          const sdeSolved = localStorage.getItem(`sdetube_potd_sdetube_solved_${today}`) === 'true';
                          const lcSolved = localStorage.getItem(`sdetube_potd_leetcode_solved_${today}`) === 'true';
                          if (!sdeSolved && !lcSolved) {
                            localStorage.removeItem(`sdetube_potd_solved_${today}`);
                          }
                        } else {
                          localStorage.setItem(`sdetube_potd_gfg_solved_${today}`, 'true');
                          localStorage.setItem(`sdetube_potd_gfg_manual_solved_${today}`, 'true');
                          localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
                        }
                        window.dispatchEvent(new CustomEvent('sdetube_potd_solved', { detail: { platform: 'gfg', date: today } }));
                        setSolveEventCount(prev => prev + 1);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer text-[10px] font-bold"
                    >
                      {isGfgPotdSolved ? 'Unmark Solved' : 'Mark as Solved ✓'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CORE LEARNING PORTALS (ONE-CLICK REDIRECT HUBS)                        */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-extrabold text-slate-100">Learning Portals</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Direct Navigation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          
          {/* Portal 1: AI Mock Interview (SDE-1, SDE-2, SDE-3) */}
          <div 
            onClick={() => onNavigate('interview')}
            className="glass-panel p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 hover:border-amber-500 shadow-xl cursor-pointer group transition-all transform hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="p-3 rounded-2xl bg-amber-600/20 text-amber-300 border border-amber-500/30 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/30">
                FAANG COMPANION
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
              AI Mock Interview
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Live SDE-1/2/3 multi-round simulator with voice companion, Monaco IDE & Bar Raiser scorecards.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Start Live Round</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Portal 1.5: Resume Analyst (SDETube AI ATS Engine & 3D Flashcards) */}
          <div 
            onClick={() => onNavigate('resume_analyst')}
            className="glass-panel p-6 rounded-3xl border border-violet-500/40 bg-gradient-to-br from-violet-950/30 via-slate-900 to-slate-950 hover:border-violet-500 shadow-xl cursor-pointer group transition-all transform hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="p-3 rounded-2xl bg-violet-600/20 text-violet-300 border border-violet-500/30 w-fit mb-4 group-hover:scale-110 transition-transform">
              <FileSearch className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.2 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[9px] font-bold border border-violet-500/30">
                SDETUBE AI ATS
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-violet-300 transition-colors">
              Resume Analyst
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              ATS compatibility score, keyword gap analysis, and 15–20 tailored 3D interview flashcards.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-violet-400">
              <span>Scan Resume & JD</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Portal 2: SDE Sheet */}
          <div 
            onClick={() => onNavigate('sde_sheet')}
            className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-950 hover:border-purple-500 shadow-xl cursor-pointer group transition-all transform hover:-translate-y-1"
          >
            <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/30 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
              DSA Sheets Hub
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              SDE (191 Qs), A2Z (473 Qs) & 79 Sheets (743 Qs total), Monaco IDE, and test runners.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-purple-400">
              <span>{dsaSolved}/{dsaTotal} Solved</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Portal 3: System Design & LLD */}
          <div 
            onClick={() => onNavigate('system_design')}
            className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950 hover:border-indigo-500 shadow-xl cursor-pointer group transition-all transform hover:-translate-y-1"
          >
            <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
              System Design & LLD
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Auto visual UML diagrams, Monaco OOP studio, and Principal Architect AI evaluation.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-400">
              <span>{lldSolved}/{lldTotal} Designed</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Portal 4: Video Channels */}
          <div 
            onClick={() => onNavigate('channels')}
            className="glass-panel p-6 rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/30 via-slate-900 to-slate-950 hover:border-sky-500 shadow-xl cursor-pointer group transition-all transform hover:-translate-y-1"
          >
            <div className="p-3 rounded-2xl bg-sky-600/20 text-sky-300 border border-sky-500/30 w-fit mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
              Video Channels
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Cloud HD video player with synced AI transcripts, smart notes, and interactive quizzes.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-sky-400">
              <span>Explore Lectures</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Portal 5: Velocity Analytics */}
          <div 
            onClick={() => onNavigate('analytics')}
            className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 hover:border-emerald-500 shadow-xl cursor-pointer group transition-all transform hover:-translate-y-1"
          >
            <div className="p-3 rounded-2xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 w-fit mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
              Velocity Analytics
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Real 7-day velocity trajectory, solving speed, accuracy, and topic coverage breakdown.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>{accuracyPercent}% Accuracy</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. REAL STATS GRID & BONUS MODULES                                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total Solved */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Overall Problems</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {totalSolved} <span className="text-xs text-slate-500 font-normal">/ {totalAvailableProblems}</span>
          </div>
          <div className="text-[11px] text-indigo-300 font-mono">DSA: {dsaSolved} | LLD: {lldSolved}</div>
        </div>

        {/* Study Hours */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Dedicated Time</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {totalDedicatedHours} <span className="text-xs text-purple-300 font-normal">Hours</span>
          </div>
          <div className="text-[11px] text-slate-400">Logged across active sessions</div>
        </div>

        {/* Velocity */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Solving Pace</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {speedIndex} <span className="text-xs text-amber-300 font-normal">q/min</span>
          </div>
          <div className="text-[11px] text-slate-400">Questions per active minute</div>
        </div>

        {/* Bonus Points */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-900/40 bg-emerald-950/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span>Bonus Score</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            +{bonusPoints} <span className="text-xs text-emerald-300 font-normal">Pts</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">DBMS: {dbmsQueriesExecuted} | CN: {cnModulesCompleted}</div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. QUICK LAUNCH ACTIONS BAR                                               */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Quick Studio Launchers</span>
          </h4>
          <p className="text-xs text-slate-400">Instant access to in-browser developer tooling</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenSqlWorkspace}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>WebAssembly SQL Arena</span>
          </button>

          <button
            onClick={onOpenAskAI}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Bot className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask AI Teaching Assistant</span>
          </button>
        </div>
      </div>

    </div>
  );
};
