import React, { useState, useEffect, useMemo } from 'react';
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
  Play
} from 'lucide-react';
import { getRealAnalytics, RealAnalyticsMetrics } from '../lib/analytics';
import { fetchLeetCodePOTD, LeetCodeDailyQuestion } from '../lib/leetcodeApi';
import { SDEProblem, SDE_SHEET_DATA } from '../lib/sdeSheetData';

interface DashboardLandingPageProps {
  user: any;
  onNavigate: (tab: 'channels' | 'lesson' | 'sde_sheet' | 'system_design' | 'analytics') => void;
  onOpenSdeProblem: (problem: SDEProblem) => void;
  onOpenSqlWorkspace: () => void;
  onOpenAskAI: () => void;
}

export const DashboardLandingPage: React.FC<DashboardLandingPageProps> = ({
  user,
  onNavigate,
  onOpenSdeProblem,
  onOpenSqlWorkspace,
  onOpenAskAI
}) => {
  // Query 100% real computed student analytics
  const metrics: RealAnalyticsMetrics = useMemo(() => getRealAnalytics(), []);

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

  // SDETube Curated POTD
  const sdePotd: SDEProblem = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const daySeed = Math.abs(today.split('-').reduce((acc, p) => acc + parseInt(p, 10), 0));
    return SDE_SHEET_DATA[daySeed % SDE_SHEET_DATA.length] || SDE_SHEET_DATA[0];
  }, []);

  // LeetCode Official Daily POTD
  const [lcPotd, setLcPotd] = useState<LeetCodeDailyQuestion | null>(null);
  const [isLoadingLc, setIsLoadingLc] = useState(false);

  useEffect(() => {
    setIsLoadingLc(true);
    fetchLeetCodePOTD().then((res) => {
      setLcPotd(res);
      setIsLoadingLc(false);
    });
  }, []);

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Engineer';

  return (
    <div className="w-full space-y-8 animate-fadeIn pb-16">
      
      {/* ========================================================================= */}
      {/* 1. HERO WELCOME & STUDENT COMMAND CENTER HEADER                           */}
      {/* ========================================================================= */}
      <div className="w-full p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/60 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>STUDENT COMMAND CENTER</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Biometric Passkey Secured</span>
              </span>
              {streakDays > 0 && (
                <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-700/60 text-amber-300 font-mono text-xs font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current animate-bounce" />
                  <span>{streakDays} Day Streak</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-sky-300">{userName}</span> 🚀
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your personalized interview preparation workspace. Master Data Structures & Algorithms, practice live Object-Oriented Low-Level Design, and solve daily coding challenges.
            </p>
          </div>

          {/* SDE Readiness Hero Gauge */}
          <div className="flex-shrink-0 p-5 rounded-3xl bg-slate-950/80 border border-indigo-500/30 backdrop-blur-xl shadow-xl space-y-3 min-w-[260px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Interview Readiness</span>
              <span className="text-indigo-300 font-mono font-black">{sdeReadinessScore}/100</span>
            </div>
            
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400"
                style={{ width: `${Math.min(100, sdeReadinessScore)}%` }}
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

      {/* ========================================================================= */}
      {/* 2. DUAL PROBLEM OF THE DAY (POTD) SPOTLIGHT                                */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-lg font-extrabold text-slate-100">Today's Daily Coding Challenges (POTD)</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Keep your daily streak alive</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Card A: SDETube Curated POTD */}
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 shadow-xl flex flex-col justify-between group hover:border-indigo-500/80 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 font-mono text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>SDETube Curated POTD</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  sdePotd.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                  sdePotd.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                  'bg-rose-950 border-rose-700 text-rose-300'
                }`}>
                  {sdePotd.difficulty}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {sdePotd.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  High-frequency interview challenge curated from the 191 SDE Sheet with in-browser Monaco IDE and test runner.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {sdePotd.category}
                </span>
                <span>&bull;</span>
                <span>{sdePotd.companies.slice(0, 3).join(', ')}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80">
              <button
                onClick={() => onOpenSdeProblem(sdePotd)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Code className="w-4 h-4" />
                <span>Solve in SDETube Monaco IDE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card B: Official LeetCode POTD */}
          <div className="glass-panel p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 shadow-xl flex flex-col justify-between group hover:border-amber-500/80 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-700/60 font-mono text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Official Daily Challenge</span>
                </span>
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

              {isLoadingLc ? (
                <div className="py-6 text-center text-slate-400 font-mono text-xs animate-pulse">
                  Querying live Daily Coding Problem...
                </div>
              ) : lcPotd ? (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {lcPotd.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Official Problem of the Day &bull; {lcPotd.date}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {lcPotd.topicTags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500 font-mono py-4">
                  Daily problem available online.
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80">
              {lcPotd && (
                <a
                  href={lcPotd.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Solve Directly on Official Platform</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Portal 1: SDE Sheet */}
          <div 
            onClick={() => onNavigate('sde_sheet')}
            className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-950 hover:border-purple-500 shadow-xl cursor-pointer group transition-all transform hover:-translate-y-1"
          >
            <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/30 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
              SDE Sheet Explorer
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              191 Curated DSA problems, Monaco in-browser IDE, test runners, and topic filters.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-purple-400">
              <span>{dsaSolved}/{dsaTotal} Solved</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Portal 2: System Design & LLD */}
          <div 
            onClick={() => onNavigate('system_design')}
            className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950 hover:border-indigo-500 shadow-xl cursor-pointer group transition-all transform hover:-translate-y-1"
          >
            <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
              System Design & LLD Hub
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Auto visual UML diagrams, Monaco OOP studio, and Principal Architect AI evaluation.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-400">
              <span>{lldSolved}/{lldTotal} Designed</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Portal 3: Video Channels */}
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

          {/* Portal 4: Velocity Analytics */}
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
