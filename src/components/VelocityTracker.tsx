import React, { useMemo } from 'react';
import { Zap, Clock, Target, CheckCircle2, TrendingUp, BookOpen, HelpCircle, Code, Award, Flame, Layers, BarChart3, Check, Database, Network, Sparkles, Cpu } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { getRealAnalytics, RealAnalyticsMetrics } from '../lib/analytics';

interface VelocityTrackerProps {
  totalSolved?: number;
  totalActiveMins?: number;
  accuracyPercent?: number;
  timeBreakdown?: any;
}

export const VelocityTracker: React.FC<VelocityTrackerProps> = () => {
  // Always query strictly REAL computed analytics from storage & SDE sheet data
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
    categoryStats,
    dailyVelocity,
    sdeReadinessScore
  } = metrics;

  const totalMinsCombined = Math.max(0, timeBreakdown.lecturesMins + timeBreakdown.quizzesMins + timeBreakdown.codingMins + (timeBreakdown.lldMins || 0));
  const lecturesPct = totalMinsCombined > 0 ? Math.round((timeBreakdown.lecturesMins / totalMinsCombined) * 100) : 0;
  const quizzesPct = totalMinsCombined > 0 ? Math.round((timeBreakdown.quizzesMins / totalMinsCombined) * 100) : 0;
  const codingPct = totalMinsCombined > 0 ? Math.round((timeBreakdown.codingMins / totalMinsCombined) * 100) : 0;
  const lldTimePct = totalMinsCombined > 0 ? Math.max(0, 100 - lecturesPct - quizzesPct - codingPct) : 0;

  return (
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
  );
};
