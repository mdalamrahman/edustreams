import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Zap,
  Clock,
  Target,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  HelpCircle,
  Code,
  Award,
  Flame,
  Layers,
  BarChart3,
  Check,
  Database,
  Network,
  Sparkles,
  Cpu,
  Globe,
  ExternalLink,
  RefreshCw,
  Edit3,
  Github,
  Trophy,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { getRealAnalytics, RealAnalyticsMetrics } from '../lib/analytics';
import { getCurrentStudent } from '../lib/auth';
import {
  getLinkedProfiles,
  saveLinkedProfiles,
  fetchLeetCodeFullProfile,
  fetchGFGProfile,
  fetchCodeforcesProfile,
  fetchGitHubProfile,
  LeetCodeFullProfileData,
  GFGProfileData,
  CodeforcesProfileData,
  GitHubProfileData,
  LinkedProfilesConfig
} from '../lib/userProfileService';

interface VelocityTrackerProps {
  totalSolved?: number;
  totalActiveMins?: number;
  accuracyPercent?: number;
  timeBreakdown?: any;
}

export type AnalyticsViewMode = 'sdetube' | 'overall';

export const VelocityTracker: React.FC<VelocityTrackerProps> = () => {
  const [viewMode, setViewMode] = useState<AnalyticsViewMode>('sdetube');
  const [metrics, setMetrics] = useState<RealAnalyticsMetrics>(() => getRealAnalytics());

  // Current user email & linked profile configurations
  const student = useMemo(() => getCurrentStudent(), []);
  const userEmail = student?.email || 'student@edustream.io';

  const [linkedConfig, setLinkedConfig] = useState<LinkedProfilesConfig>(() => getLinkedProfiles(userEmail));
  const [isConfigExpanded, setIsConfigExpanded] = useState<boolean>(false);

  // Form inputs for handles
  const [lcInput, setLcInput] = useState<string>(linkedConfig.leetcodeUsername || '');
  const [gfgInput, setGfgInput] = useState<string>(linkedConfig.gfgUsername || '');
  const [cfInput, setCfInput] = useState<string>(linkedConfig.codeforcesHandle || '');
  const [ghInput, setGhInput] = useState<string>(linkedConfig.githubUsername || '');
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);

  // External Platform Data States
  const [leetcodeData, setLeetcodeData] = useState<LeetCodeFullProfileData | null>(null);
  const [gfgData, setGfgData] = useState<GFGProfileData | null>(null);
  const [codeforcesData, setCodeforcesData] = useState<CodeforcesProfileData | null>(null);
  const [githubData, setGithubData] = useState<GitHubProfileData | null>(null);

  const [isLoadingAll, setIsLoadingAll] = useState<boolean>(false);

  // Refresh Real SDETube metrics on platform events
  useEffect(() => {
    const handleUpdate = () => setMetrics(getRealAnalytics());
    window.addEventListener('sdetube_problem_solved', handleUpdate);
    window.addEventListener('sdetube_potd_solved', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sdetube_problem_solved', handleUpdate);
      window.removeEventListener('sdetube_potd_solved', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Sync external profiles
  const syncExternalProfiles = useCallback(async (cfg: LinkedProfilesConfig) => {
    setIsLoadingAll(true);
    const promises: Promise<any>[] = [];

    if (cfg.leetcodeUsername?.trim()) {
      promises.push(
        fetchLeetCodeFullProfile(cfg.leetcodeUsername.trim())
          .then(data => setLeetcodeData(data))
          .catch(() => setLeetcodeData(null))
      );
    } else {
      setLeetcodeData(null);
    }

    if (cfg.gfgUsername?.trim()) {
      promises.push(
        fetchGFGProfile(cfg.gfgUsername.trim())
          .then(data => setGfgData(data))
          .catch(() => setGfgData(null))
      );
    } else {
      setGfgData(null);
    }

    if (cfg.codeforcesHandle?.trim()) {
      promises.push(
        fetchCodeforcesProfile(cfg.codeforcesHandle.trim())
          .then(data => setCodeforcesData(data))
          .catch(() => setCodeforcesData(null))
      );
    } else {
      setCodeforcesData(null);
    }

    if (cfg.githubUsername?.trim()) {
      promises.push(
        fetchGitHubProfile(cfg.githubUsername.trim())
          .then(data => setGithubData(data))
          .catch(() => setGithubData(null))
      );
    } else {
      setGithubData(null);
    }

    await Promise.allSettled(promises);
    setIsLoadingAll(false);
  }, []);

  // Initial load of external profiles
  useEffect(() => {
    syncExternalProfiles(linkedConfig);
  }, [syncExternalProfiles, linkedConfig]);

  const handleSaveHandles = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: LinkedProfilesConfig = {
      ...linkedConfig,
      leetcodeUsername: lcInput.trim(),
      gfgUsername: gfgInput.trim(),
      codeforcesHandle: cfInput.trim(),
      githubUsername: ghInput.trim()
    };
    saveLinkedProfiles(updated, userEmail);
    setLinkedConfig(updated);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
    syncExternalProfiles(updated);
  };

  const {
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
    difficultyStats,
    dailyVelocity,
    sdeReadinessScore
  } = metrics;

  // Multi-Platform Computed Totals
  const lcSolved = useMemo(() => {
    if (!leetcodeData?.matchedUser?.submitStats?.acSubmissionNum) return 0;
    const all = leetcodeData.matchedUser.submitStats.acSubmissionNum.find(s => s.difficulty === 'All');
    return all?.count || 0;
  }, [leetcodeData]);

  const lcEasy = useMemo(() => {
    const item = leetcodeData?.matchedUser?.submitStats?.acSubmissionNum?.find(s => s.difficulty === 'Easy');
    return item?.count || 0;
  }, [leetcodeData]);

  const lcMedium = useMemo(() => {
    const item = leetcodeData?.matchedUser?.submitStats?.acSubmissionNum?.find(s => s.difficulty === 'Medium');
    return item?.count || 0;
  }, [leetcodeData]);

  const lcHard = useMemo(() => {
    const item = leetcodeData?.matchedUser?.submitStats?.acSubmissionNum?.find(s => s.difficulty === 'Hard');
    return item?.count || 0;
  }, [leetcodeData]);

  const gfgSolved = Number(gfgData?.total_problems_solved || 0);
  const gfgScore = Number(gfgData?.coding_score || gfgData?.overall_score || 0);
  const cfSolved = Number(codeforcesData?.total_problems_solved || 0);

  // Overall Total Solved Count
  const totalSolvedCombined = totalSolved + lcSolved + gfgSolved + cfSolved;

  // Combined Difficulty Aggregation
  const combinedEasy = (difficultyStats?.easy?.solved || 0) + lcEasy + (gfgData?.difficulty?.easy || 0) + (codeforcesData?.difficulty_breakdown?.easy || 0);
  const combinedMedium = (difficultyStats?.medium?.solved || 0) + lcMedium + (gfgData?.difficulty?.medium || 0) + (codeforcesData?.difficulty_breakdown?.medium || 0);
  const combinedHard = (difficultyStats?.hard?.solved || 0) + lcHard + (gfgData?.difficulty?.hard || 0) + (codeforcesData?.difficulty_breakdown?.hard || 0);
  const totalCombinedClassified = Math.max(1, combinedEasy + combinedMedium + combinedHard);

  const easyPct = Math.round((combinedEasy / totalCombinedClassified) * 100);
  const medPct = Math.round((combinedMedium / totalCombinedClassified) * 100);
  const hardPct = Math.max(0, 100 - easyPct - medPct);

  const totalMinsCombined = Math.max(0, timeBreakdown.lecturesMins + timeBreakdown.quizzesMins + timeBreakdown.codingMins + (timeBreakdown.lldMins || 0));
  const lecturesPct = totalMinsCombined > 0 ? Math.round((timeBreakdown.lecturesMins / totalMinsCombined) * 100) : 0;
  const quizzesPct = totalMinsCombined > 0 ? Math.round((timeBreakdown.quizzesMins / totalMinsCombined) * 100) : 0;
  const codingPct = totalMinsCombined > 0 ? Math.round((timeBreakdown.codingMins / totalMinsCombined) * 100) : 0;
  const lldTimePct = totalMinsCombined > 0 ? Math.max(0, 100 - lecturesPct - quizzesPct - codingPct) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* TOP HEADER & DUAL VIEW MODE SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-100 tracking-tight flex items-center gap-2">
                Velocity & Mastery Analytics
              </h2>
              <p className="text-xs text-slate-400">
                {viewMode === 'sdetube'
                  ? 'Real-time performance analytics tracked natively on SDETube'
                  : 'Unified multi-platform engineering profile across SDETube, LeetCode, GFG, Codeforces & GitHub'}
              </p>
            </div>
          </div>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="flex items-center p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode('sdetube')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs transition-all cursor-pointer ${
              viewMode === 'sdetube'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>SDETube Alone</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
              viewMode === 'sdetube' ? 'bg-indigo-900/80 text-indigo-200' : 'bg-slate-800 text-slate-400'
            }`}>
              {totalSolved} Solved
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('overall')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs transition-all cursor-pointer ${
              viewMode === 'overall'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 text-white font-bold shadow-lg shadow-purple-600/30 border border-purple-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Overall (All Platforms)</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
              viewMode === 'overall' ? 'bg-purple-900/80 text-purple-200' : 'bg-slate-800 text-slate-400'
            }`}>
              {totalSolvedCombined} Total
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 VIEW 1: OVERALL MULTI-PLATFORM UNIFIED VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'overall' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* 1. HERO AGGREGATED BANNER */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/60 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-600/60 text-indigo-300 font-mono text-xs font-bold flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    Unified Multi-Platform Engineering Portfolio
                  </span>
                  {isLoadingAll && (
                    <span className="flex items-center gap-1 text-xs text-indigo-300 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Syncing profiles...
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-indigo-200 to-purple-300 font-mono tracking-tight">
                    {totalSolvedCombined}
                  </span>
                  <div className="text-sm sm:text-base font-semibold text-slate-300">
                    Total DSA & Coding Problems Solved
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2 max-w-xl">
                  Aggregating your verified solved problems and ratings across SDETube ({totalSolved}), LeetCode ({lcSolved}), GeeksforGeeks ({gfgSolved}), and Codeforces ({cfSolved}).
                </p>
              </div>

              {/* Quick Actions & Sync */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => syncExternalProfiles(linkedConfig)}
                  disabled={isLoadingAll}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-md cursor-pointer hover:border-slate-500"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoadingAll ? 'animate-spin' : ''}`} />
                  <span>Refresh All Sync</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Configure Handles</span>
                  {isConfigExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Platform Multi-Color Solved Proportions Bar */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold">Platform Breakdown Proportion</span>
                <span className="font-mono text-slate-300">100% Verified Submissions</span>
              </div>
              
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                {totalSolved > 0 && (
                  <div
                    style={{ width: `${Math.round((totalSolved / Math.max(1, totalSolvedCombined)) * 100)}%` }}
                    className="h-full bg-purple-500 transition-all duration-700"
                    title={`SDETube: ${totalSolved} solved`}
                  />
                )}
                {lcSolved > 0 && (
                  <div
                    style={{ width: `${Math.round((lcSolved / Math.max(1, totalSolvedCombined)) * 100)}%` }}
                    className="h-full bg-amber-500 transition-all duration-700"
                    title={`LeetCode: ${lcSolved} solved`}
                  />
                )}
                {gfgSolved > 0 && (
                  <div
                    style={{ width: `${Math.round((gfgSolved / Math.max(1, totalSolvedCombined)) * 100)}%` }}
                    className="h-full bg-emerald-500 transition-all duration-700"
                    title={`GeeksforGeeks: ${gfgSolved} solved`}
                  />
                )}
                {cfSolved > 0 && (
                  <div
                    style={{ width: `${Math.round((cfSolved / Math.max(1, totalSolvedCombined)) * 100)}%` }}
                    className="h-full bg-sky-500 transition-all duration-700"
                    title={`Codeforces: ${cfSolved} solved`}
                  />
                )}
              </div>

              {/* Legends */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-purple-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> SDETube: {totalSolved}
                </span>
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> LeetCode: {lcSolved}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> GeeksforGeeks: {gfgSolved}
                </span>
                <span className="flex items-center gap-1.5 text-sky-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Codeforces: {cfSolved}
                </span>
              </div>
            </div>
          </div>

          {/* 2. COLLAPSIBLE HANDLES CONFIGURATION PANEL */}
          {isConfigExpanded && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-700 bg-slate-900/90 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-indigo-400" />
                    Manage Your Coding Handles & Profiles
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect your public usernames to pull live ratings, problems solved, and achievements automatically.
                  </p>
                </div>
                {isSavedNotice && (
                  <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-bounce">
                    <CheckCircle className="w-3.5 h-3.5" /> Saved & Synced!
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveHandles} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* LeetCode Input */}
                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1.5">LeetCode Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={lcInput}
                      onChange={e => setLcInput(e.target.value)}
                      placeholder="e.g. mudit_2904"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* GeeksforGeeks Input */}
                <div>
                  <label className="block text-xs font-bold text-emerald-400 mb-1.5">GeeksforGeeks Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={gfgInput}
                      onChange={e => setGfgInput(e.target.value)}
                      placeholder="e.g. ayush_sharma"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Codeforces Input */}
                <div>
                  <label className="block text-xs font-bold text-sky-400 mb-1.5">Codeforces Handle</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cfInput}
                      onChange={e => setCfInput(e.target.value)}
                      placeholder="e.g. tourist"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* GitHub Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">GitHub Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={ghInput}
                      onChange={e => setGhInput(e.target.value)}
                      placeholder="e.g. torvalds"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigExpanded(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save & Sync Live
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. 5 DISTINCT PLATFORM CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* PLATFORM 1: SDETube Platform */}
            <div className="glass-panel p-5 rounded-3xl border border-purple-500/30 bg-slate-900/70 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
                      <Code className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">Native Workspace</span>
                      <h4 className="text-sm font-bold text-slate-100">SDETube Platform</h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-950 border border-purple-700/60 font-mono text-[11px] font-bold text-purple-300">
                    Active
                  </span>
                </div>

                <div className="mt-2 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Total Solved</span>
                    <span className="text-2xl font-black text-slate-100 font-mono">{totalSolved}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                    <span className="text-slate-400">DSA Sheets</span>
                    <span className="font-mono text-purple-300 font-bold">{dsaSolved} / {dsaTotal} ({dsaPct}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                    <span className="text-slate-400">LLD Architectures</span>
                    <span className="font-mono text-purple-300 font-bold">{lldSolved} / {lldTotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                    <span className="text-slate-400">Study Time</span>
                    <span className="font-mono text-indigo-300 font-bold">{totalDedicatedHours} Hours</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Streak: <strong className="text-slate-200">{streakDays} Days</strong></span>
                <span className="text-purple-400 font-mono font-bold">{sdeReadinessScore}% SDE Ready</span>
              </div>
            </div>

            {/* PLATFORM 2: LeetCode */}
            <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-slate-900/70 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-2xl bg-amber-600/20 text-amber-300 border border-amber-500/30">
                      <Code className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">Competitive DSA</span>
                      <h4 className="text-sm font-bold text-slate-100">LeetCode</h4>
                    </div>
                  </div>
                  {linkedConfig.leetcodeUsername ? (
                    <a
                      href={`https://leetcode.com/${linkedConfig.leetcodeUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-700/60 text-amber-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-500">Not linked</span>
                  )}
                </div>

                {linkedConfig.leetcodeUsername ? (
                  <div className="mt-2 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Problems Solved</span>
                      <span className="text-2xl font-black text-slate-100 font-mono">{lcSolved}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                      <span className="text-slate-400">Contest Rating</span>
                      <span className="font-mono text-amber-300 font-bold">
                        {leetcodeData?.userContestRanking?.rating ? Math.round(leetcodeData.userContestRanking.rating) : 'Unrated'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                      <span className="text-slate-400">Global Ranking</span>
                      <span className="font-mono text-slate-300 font-bold">
                        {leetcodeData?.matchedUser?.profile?.ranking ? `#${leetcodeData.matchedUser.profile.ranking.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono py-1 border-t border-slate-800">
                      <span className="text-emerald-400">Easy: {lcEasy}</span>
                      <span className="text-amber-400">Med: {lcMedium}</span>
                      <span className="text-rose-400">Hard: {lcHard}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    Click <strong>Configure Handles</strong> to link your LeetCode profile
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                <span>Handle: <strong className="text-slate-200">@{linkedConfig.leetcodeUsername || 'none'}</strong></span>
                <span className="text-amber-400 font-mono font-bold">LeetCode Verified</span>
              </div>
            </div>

            {/* PLATFORM 3: GeeksforGeeks (GFG) */}
            <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 bg-slate-900/70 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-2xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Practice & Articles</span>
                      <h4 className="text-sm font-bold text-slate-100">GeeksforGeeks</h4>
                    </div>
                  </div>
                  {linkedConfig.gfgUsername ? (
                    <a
                      href={`https://www.geeksforgeeks.org/user/${linkedConfig.gfgUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-500">Not linked</span>
                  )}
                </div>

                {linkedConfig.gfgUsername ? (
                  <div className="mt-2 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Problems Solved</span>
                      <span className="text-2xl font-black text-slate-100 font-mono">{gfgSolved}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                      <span className="text-slate-400">Coding Score</span>
                      <span className="font-mono text-emerald-300 font-bold">{gfgScore} Pts</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                      <span className="text-slate-400">Institute Rank</span>
                      <span className="font-mono text-slate-300 font-bold">
                        {gfgData?.institute_rank && gfgData.institute_rank !== 'N/A' ? `#${gfgData.institute_rank}` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                      <span className="text-slate-400">Organization</span>
                      <span className="font-mono text-emerald-300 truncate max-w-[120px]">{gfgData?.organization || 'GeeksforGeeks'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    Click <strong>Configure Handles</strong> to link your GFG profile
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                <span>Handle: <strong className="text-slate-200">@{linkedConfig.gfgUsername || 'none'}</strong></span>
                <span className="text-emerald-400 font-mono font-bold">GFG Scraped</span>
              </div>
            </div>

            {/* PLATFORM 4: Codeforces */}
            <div className="glass-panel p-5 rounded-3xl border border-sky-500/30 bg-slate-900/70 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-2xl bg-sky-600/20 text-sky-300 border border-sky-500/30">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">Competitive Programming</span>
                      <h4 className="text-sm font-bold text-slate-100">Codeforces</h4>
                    </div>
                  </div>
                  {linkedConfig.codeforcesHandle ? (
                    <a
                      href={`https://codeforces.com/profile/${linkedConfig.codeforcesHandle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900 border border-sky-700/60 text-sky-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-500">Not linked</span>
                  )}
                </div>

                {linkedConfig.codeforcesHandle ? (
                  <div className="mt-2 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Current Rating</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-100 font-mono">
                          {codeforcesData?.rating || 0}
                        </span>
                        <span className="text-xs text-sky-400 font-mono">
                          (Max: {codeforcesData?.maxRating || 0})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                      <span className="text-slate-400">Rank Title</span>
                      <span className="font-mono text-sky-300 font-bold capitalize">
                        {codeforcesData?.rank || 'Unrated'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                      <span className="text-slate-400">Problems Solved (AC)</span>
                      <span className="font-mono text-slate-100 font-bold">{cfSolved}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                      <span className="text-slate-400">Organization</span>
                      <span className="font-mono text-sky-300 truncate max-w-[120px]">{codeforcesData?.organization || 'Competitive Coder'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    Click <strong>Configure Handles</strong> to link your Codeforces handle
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                <span>Handle: <strong className="text-slate-200">@{linkedConfig.codeforcesHandle || 'none'}</strong></span>
                <span className="text-sky-400 font-mono font-bold">CF API Connected</span>
              </div>
            </div>

            {/* PLATFORM 5: GitHub */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-700 bg-slate-900/70 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-2xl bg-slate-800 text-slate-200 border border-slate-700">
                      <Github className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Open Source & Projects</span>
                      <h4 className="text-sm font-bold text-slate-100">GitHub</h4>
                    </div>
                  </div>
                  {linkedConfig.githubUsername ? (
                    <a
                      href={`https://github.com/${linkedConfig.githubUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-500">Not linked</span>
                  )}
                </div>

                {linkedConfig.githubUsername ? (
                  <div className="mt-2 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Public Repositories</span>
                      <span className="text-2xl font-black text-slate-100 font-mono">
                        {githubData?.public_repos || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                      <span className="text-slate-400">Followers</span>
                      <span className="font-mono text-slate-300 font-bold">{githubData?.followers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                      <span className="text-slate-400">Public Gists</span>
                      <span className="font-mono text-slate-300 font-bold">{githubData?.public_gists || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                      <span className="text-slate-400">Bio</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{githubData?.bio || 'Developer'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    Click <strong>Configure Handles</strong> to link your GitHub profile
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                <span>Handle: <strong className="text-slate-200">@{linkedConfig.githubUsername || 'none'}</strong></span>
                <span className="text-slate-300 font-mono font-bold">GitHub API</span>
              </div>
            </div>

            {/* SUMMARY CARD: Aggregated Difficulty Matrix */}
            <div className="glass-panel p-5 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-950 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    <h4 className="text-sm font-bold text-slate-100">Unified Problem Difficulty</h4>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                    Aggregated
                  </span>
                </div>

                <div className="space-y-3 mt-3">
                  {/* Easy */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-400 font-semibold">Easy Tier</span>
                      <span className="font-mono text-slate-200 font-bold">{combinedEasy} ({easyPct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${easyPct}%` }} />
                    </div>
                  </div>

                  {/* Medium */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-amber-400 font-semibold">Medium Tier</span>
                      <span className="font-mono text-slate-200 font-bold">{combinedMedium} ({medPct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${medPct}%` }} />
                    </div>
                  </div>

                  {/* Hard */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-rose-400 font-semibold">Hard Tier</span>
                      <span className="font-mono text-slate-200 font-bold">{combinedHard} ({hardPct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${hardPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                <span>Multi-Platform Balance</span>
                <span className="text-indigo-300 font-mono font-bold">{totalSolvedCombined} Total Solved</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚡ VIEW 2: SDETUBE PLATFORM ALONE VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'sdetube' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* 1. CORE TRACKING: DSA & LLD HERO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Core Metric 1: DSA (Data Structures & Algorithms) */}
            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Core Pillar 1</span>
                    <h3 className="text-base font-bold text-slate-100">DSA & Algorithms</h3>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 font-mono text-xs font-bold text-indigo-300">
                  {dsaPct}% Mastery
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-100 font-mono">{dsaSolved}</span>
                  <span className="text-sm font-semibold text-slate-400">/ {dsaTotal} Problems Solved</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mt-2">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${dsaPct}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">SDE Sheet Curated Coding Arena & Monaco IDE Execution</p>
              </div>
            </div>

            {/* Core Metric 2: LLD (Low Level Design & Architecture) */}
            <div className="glass-panel p-6 rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-950/50 via-slate-900 to-slate-950 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-purple-600/30 text-purple-300 border border-purple-500/30">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Core Pillar 2</span>
                    <h3 className="text-base font-bold text-slate-100">LLD & System Design</h3>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-950 border border-purple-700/60 font-mono text-xs font-bold text-purple-300">
                  {lldPct}% Mastery
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-100 font-mono">{lldSolved}</span>
                  <span className="text-sm font-semibold text-slate-400">/ {lldTotal} Architectures Designed</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mt-2">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700" style={{ width: `${lldPct}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Visual UML Architecture Diagrams + OOP Code + AI Design Evaluation</p>
              </div>
            </div>

          </div>

          {/* 2. BONUS MODULES BANNER: DBMS & CN EXTRA POINTS */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-sky-950/40 border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-700/60 text-emerald-300">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-100">Bonus Modules Active: DBMS & Computer Networks</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-600 text-[10px] font-mono font-bold text-emerald-200">
                    +{bonusPoints} Bonus Pts
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Not mandatory, but gives extra competitive score for full-stack interview readiness.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" />
                  <span>DBMS / SQL</span>
                </div>
                <div className="text-sm font-black text-slate-100 font-mono mt-0.5">{dbmsQueriesExecuted} Runs</div>
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-xs font-bold text-sky-400 flex items-center gap-1">
                  <Network className="w-3.5 h-3.5" />
                  <span>Networks</span>
                </div>
                <div className="text-sm font-black text-slate-100 font-mono mt-0.5">{cnModulesCompleted} Units</div>
              </div>
            </div>
          </div>

          {/* 3. 4 General Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Solving Velocity */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Solving Velocity</span>
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Zap className="w-4 h-4 fill-current animate-pulse" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-100 font-mono">
                  {speedIndex} <span className="text-xs text-indigo-300 font-normal">q/min</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Real-time Solving Pace</p>
              </div>
            </div>

            {/* Dedicated Hours */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Total Dedicated</span>
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-100 font-mono">
                  {totalDedicatedHours} <span className="text-xs text-purple-300 font-normal">Hours</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{totalActiveMins} Minutes Logged</p>
              </div>
            </div>

            {/* Overall Problems Solved */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Total Solved</span>
                <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-100 font-mono">
                  {totalSolved} <span className="text-xs text-emerald-300 font-normal">/ {totalAvailableProblems}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">DSA ({dsaSolved}) + LLD ({lldSolved})</p>
              </div>
            </div>

            {/* Accuracy Rate */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider">Accuracy Rate</span>
                <div className="p-2 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-100 font-mono">
                  {accuracyPercent}%
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{correctAttempts} of {totalAttempts} Submissions</p>
              </div>
            </div>

          </div>

          {/* 4. Real 7-Day Velocity Chart & Time Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Real Dynamic Velocity Trajectory */}
            <div className="lg:col-span-2 glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    7-Day Activity & Solving Trajectory
                  </h3>
                  <p className="text-xs text-slate-400">Actual questions solved and study pace recorded over the past 7 days</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-700/60 text-indigo-300 font-mono text-xs font-bold">
                  {streakDays > 0 ? `🔥 ${streakDays} Day Streak` : 'Active'}
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyVelocity}>
                    <defs>
                      <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="dayName" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="questions" name="Questions Solved" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorQuestions)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Real Time Dedicated Distribution */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">Time Dedicated Distribution</h3>
                <p className="text-xs text-slate-400 mb-4">Actual activity time aggregated across modules</p>

                <div className="space-y-3.5">
                  {/* Video Lectures */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Video Lectures
                      </span>
                      <span className="font-mono text-indigo-300 font-bold">{timeBreakdown.lecturesMins} mins ({lecturesPct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${lecturesPct}%` }}></div>
                    </div>
                  </div>

                  {/* LLD Systems */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Cpu className="w-3.5 h-3.5 text-purple-400" /> LLD Architecture Diagrams
                      </span>
                      <span className="font-mono text-purple-300 font-bold">{timeBreakdown.lldMins || 0} mins ({lldTimePct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${lldTimePct}%` }}></div>
                    </div>
                  </div>

                  {/* Sandboxed Coding */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Code className="w-3.5 h-3.5 text-emerald-400" /> Coding Workspace
                      </span>
                      <span className="font-mono text-emerald-300 font-bold">{timeBreakdown.codingMins} mins ({codingPct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${codingPct}%` }}></div>
                    </div>
                  </div>

                  {/* MCQ Quizzes */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Quizzes
                      </span>
                      <span className="font-mono text-amber-300 font-bold">{timeBreakdown.quizzesMins} mins ({quizzesPct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${quizzesPct}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex justify-between">
                <span>Total Active Time</span>
                <span className="text-indigo-300 font-bold">{totalMinsCombined} Minutes</span>
              </div>
            </div>

          </div>

          {/* 5. SDE Interview Readiness Progress Bar */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 fill-current" />
                  SDE Interview Readiness Index
                </h3>
                <p className="text-xs text-slate-400">Calculated from DSA (40%), LLD (35%), Active Time (15%), and DBMS/CN Bonus (+10%)</p>
              </div>
              <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                sdeReadinessScore >= 80 ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                sdeReadinessScore >= 50 ? 'bg-amber-950 border-amber-700 text-amber-300' :
                sdeReadinessScore >= 25 ? 'bg-indigo-950 border-indigo-700 text-indigo-300' :
                'bg-slate-900 border-slate-700 text-slate-400'
              }`}>
                {sdeReadinessScore >= 80 ? '🚀 SDE Ready' :
                 sdeReadinessScore >= 50 ? '🎯 Interview Ready' :
                 sdeReadinessScore >= 25 ? '📈 Intermediate' :
                 '🌱 Beginner'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mb-3">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(100, sdeReadinessScore)}%`,
                  background: sdeReadinessScore >= 80 ? 'linear-gradient(90deg, #10b981, #34d399)' :
                              sdeReadinessScore >= 50 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                              sdeReadinessScore >= 25 ? 'linear-gradient(90deg, #6366f1, #818cf8)' :
                              'linear-gradient(90deg, #475569, #64748b)'
                }}
              />
            </div>

            {/* Milestone Labels */}
            <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
              <span>Beginner</span>
              <span>Intermediate (25%)</span>
              <span>Interview Ready (50%)</span>
              <span>SDE Ready (80%+)</span>
            </div>

            {/* Readiness Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="text-center p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-lg font-black text-indigo-300 font-mono">{dsaSolved}/{dsaTotal}</div>
                <div className="text-[10px] text-slate-400">DSA Score (40% max)</div>
              </div>
              <div className="text-center p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-lg font-black text-purple-300 font-mono">{lldSolved}/{lldTotal}</div>
                <div className="text-[10px] text-slate-400">LLD Systems (35% max)</div>
              </div>
              <div className="text-center p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-lg font-black text-amber-300 font-mono">{totalDedicatedHours}h</div>
                <div className="text-[10px] text-slate-400">Time Invested (15% max)</div>
              </div>
              <div className="text-center p-3 rounded-2xl bg-slate-900/80 border border-emerald-900/50 bg-emerald-950/20">
                <div className="text-lg font-black text-emerald-400 font-mono">+{bonusPoints} Pts</div>
                <div className="text-[10px] text-emerald-300">DBMS & CN Bonus</div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
