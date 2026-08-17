import React, { useMemo } from 'react';
import { Zap, Clock, Target, CheckCircle2, TrendingUp, BookOpen, HelpCircle, Code, Award, Flame, Layers, BarChart3, Check } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { getRealAnalytics, RealAnalyticsMetrics } from '../lib/analytics';

interface VelocityTrackerProps {
  totalSolved?: number;
  totalActiveMins?: number;
  accuracyPercent?: number;
  timeBreakdown?: {
    lecturesMins: number;
    quizzesMins: number;
    codingMins: number;
  };
}

export const VelocityTracker: React.FC<VelocityTrackerProps> = () => {
  // Always query strictly REAL computed analytics from storage & SDE sheet data
  const metrics: RealAnalyticsMetrics = useMemo(() => getRealAnalytics(), []);

  const {
    totalSolved,
    totalAvailableProblems,
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
    dailyVelocity
  } = metrics;

  const totalMinsCombined = Math.max(0, timeBreakdown.lecturesMins + timeBreakdown.quizzesMins + timeBreakdown.codingMins);
  const lecturesPct = totalMinsCombined > 0 ? Math.round((timeBreakdown.lecturesMins / totalMinsCombined) * 100) : 0;
  const quizzesPct = totalMinsCombined > 0 ? Math.round((timeBreakdown.quizzesMins / totalMinsCombined) * 100) : 0;
  const codingPct = totalMinsCombined > 0 ? Math.max(0, 100 - lecturesPct - quizzesPct) : 0;

  // Real SDE Readiness Score: 0 to 100 based strictly on real milestones
  // 50% from problem solving (191 target), 25% from accuracy, 25% from study hours (up to 50h)
  const problemScore = Math.min(50, Math.round((totalSolved / totalAvailableProblems) * 50));
  const accScore = Math.min(25, Math.round((accuracyPercent / 100) * 25));
  const timeScore = Math.min(25, Math.round((totalActiveMins / (50 * 60)) * 25));
  const sdeReadinessScore = problemScore + accScore + timeScore;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Speed Index Card */}
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Solving Velocity</span>
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Zap className="w-5 h-5 fill-current animate-pulse" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
              {speedIndex} <span className="text-xs text-indigo-300 font-normal">q/min</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Questions Solved per Active Minute</p>
          </div>
        </div>

        {/* Total Dedicated Hours */}
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Total Dedicated</span>
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
              {totalDedicatedHours} <span className="text-xs text-purple-300 font-normal">Hours</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{totalActiveMins} Minutes Logged Across Sessions</p>
          </div>
        </div>

        {/* Total Questions Solved */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">SDE Problems</span>
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
              {totalSolved} <span className="text-xs text-emerald-300 font-normal">/ {totalAvailableProblems}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{((totalSolved / totalAvailableProblems) * 100).toFixed(1)}% of SDE Sheet Completed</p>
          </div>
        </div>

        {/* Accuracy % */}
        <div className="glass-panel p-5 rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-950 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider">Accuracy Rate</span>
            <div className="p-2 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
              {accuracyPercent}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{correctAttempts} Correct of {totalAttempts} Submissions</p>
          </div>
        </div>

      </div>

      {/* Dynamic Velocity Chart & Time Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real Dynamic Velocity Trajectory */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                7-Day Activity & Solving Trajectory
              </h3>
              <p className="text-xs text-slate-400">Real questions solved and study pace recorded over the past 7 days</p>
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
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Time Dedicated Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Actual activity time aggregated across modules</p>

            <div className="space-y-4">
              {/* Video Lectures */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Video Lectures
                  </span>
                  <span className="font-mono text-indigo-300 font-bold">{timeBreakdown.lecturesMins} mins ({lecturesPct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${lecturesPct}%` }}></div>
                </div>
              </div>

              {/* MCQ Quizzes */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> MCQ Quizzes
                  </span>
                  <span className="font-mono text-purple-300 font-bold">{timeBreakdown.quizzesMins} mins ({quizzesPct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${quizzesPct}%` }}></div>
                </div>
              </div>

              {/* Sandboxed Coding */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Code className="w-3.5 h-3.5 text-emerald-400" /> LeetCode Coding Workspace
                  </span>
                  <span className="font-mono text-emerald-300 font-bold">{timeBreakdown.codingMins} mins ({codingPct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${codingPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex justify-between">
            <span>Aggregated Active Time</span>
            <span className="text-indigo-300 font-bold">{timeBreakdown.lecturesMins + timeBreakdown.quizzesMins + timeBreakdown.codingMins} Minutes</span>
          </div>
        </div>

      </div>

      {/* Difficulty Mastery Breakdown (Easy, Medium, Hard) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              SDE Problem Difficulty Breakdown
            </h3>
            <p className="text-xs text-slate-400">Actual problem completion status segmented by difficulty tier</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {totalSolved} / {totalAvailableProblems} Solved
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Easy Tier */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-400">Easy Problems</span>
              <span className="font-mono text-slate-200">{difficultyStats.easy.solved} / {difficultyStats.easy.total}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${difficultyStats.easy.pct}%` }}></div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono text-right">{difficultyStats.easy.pct}% Complete</div>
          </div>

          {/* Medium Tier */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-amber-400">Medium Problems</span>
              <span className="font-mono text-slate-200">{difficultyStats.medium.solved} / {difficultyStats.medium.total}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${difficultyStats.medium.pct}%` }}></div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono text-right">{difficultyStats.medium.pct}% Complete</div>
          </div>

          {/* Hard Tier */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-rose-400">Hard Problems</span>
              <span className="font-mono text-slate-200">{difficultyStats.hard.solved} / {difficultyStats.hard.total}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${difficultyStats.hard.pct}%` }}></div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono text-right">{difficultyStats.hard.pct}% Complete</div>
          </div>

        </div>
      </div>

      {/* SDE Topic Category Mastery Progress */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Topic & Domain Coverage
          </h3>
          <p className="text-xs text-slate-400">Detailed breakdown of problems solved across each computer science topic</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryStats.map((cat, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 truncate">{cat.category}</span>
                <span className="font-mono text-indigo-300 font-bold">{cat.solved}/{cat.total}</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${cat.pct}%` }}></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Coverage</span>
                <span>{cat.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI-Powered SDE Readiness Progress Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-current" />
              SDE Interview Readiness Index
            </h3>
            <p className="text-xs text-slate-400">Calculated from verified problem completions, accuracy, and dedicated study time</p>
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
          {/* Milestone markers */}
          <div className="absolute inset-0 flex items-center">
            {[25, 50, 80].map((milestone) => (
              <div
                key={milestone}
                className="absolute h-full border-r border-slate-700/50"
                style={{ left: `${milestone}%` }}
              />
            ))}
          </div>
        </div>

        {/* Milestone Labels */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
          <span>Beginner</span>
          <span>Intermediate (25%)</span>
          <span>Interview Ready (50%)</span>
          <span>SDE Ready (80%+)</span>
        </div>

        {/* Readiness Breakdown */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-lg font-black text-slate-100 font-mono">{problemScore}/50</div>
            <div className="text-[10px] text-slate-400">Problem Solving ({totalSolved} problems)</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-lg font-black text-slate-100 font-mono">{accScore}/25</div>
            <div className="text-[10px] text-slate-400">Accuracy Rate ({accuracyPercent}%)</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-lg font-black text-slate-100 font-mono">{timeScore}/25</div>
            <div className="text-[10px] text-slate-400">Time Invested ({totalDedicatedHours}h)</div>
          </div>
        </div>
      </div>

    </div>
  );
};
