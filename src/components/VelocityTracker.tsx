import React from 'react';
import { Zap, Clock, Target, CheckCircle2, TrendingUp, BookOpen, HelpCircle, Code } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface VelocityTrackerProps {
  totalSolved: number;
  totalActiveMins: number;
  accuracyPercent: number;
  timeBreakdown: {
    lecturesMins: number;
    quizzesMins: number;
    codingMins: number;
  };
}

export const VelocityTracker: React.FC<VelocityTrackerProps> = ({
  totalSolved,
  totalActiveMins,
  accuracyPercent,
  timeBreakdown
}) => {
  // Speed Index calculation formula (questions/min)
  const speedIndex = Number((totalSolved / Math.max(totalActiveMins, 1.0)).toFixed(2));
  const totalDedicatedHours = ((timeBreakdown.lecturesMins + timeBreakdown.quizzesMins + timeBreakdown.codingMins) / 60).toFixed(1);

  // Sample weekly velocity trajectory data
  const velocityData = [
    { day: 'Mon', qpm: 0.25, questions: 4 },
    { day: 'Tue', qpm: 0.35, questions: 6 },
    { day: 'Wed', qpm: 0.42, questions: 8 },
    { day: 'Thu', qpm: 0.50, questions: 10 },
    { day: 'Fri', qpm: 0.48, questions: 9 },
    { day: 'Sat', qpm: 0.55, questions: 12 },
    { day: 'Sun', qpm: speedIndex || 0.60, questions: totalSolved }
  ];

  return (
    <div className="space-y-6">
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
            <p className="text-[11px] text-slate-400 mt-1">Lectures + Quizzes + Coding</p>
          </div>
        </div>

        {/* Total Questions Solved */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Total Solved</span>
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
              {totalSolved} <span className="text-xs text-emerald-300 font-normal">Questions</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">MCQs & Sandboxed Compiler Problems</p>
          </div>
        </div>

        {/* Accuracy Percent */}
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Accuracy Rate</span>
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
              {accuracyPercent}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">First-Attempt Precision</p>
          </div>
        </div>

      </div>

      {/* Chart & Dedicated Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Velocity Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-100">7-Day Velocity Trajectory (questions/min)</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
              +18% Velocity Growth
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="colorQpm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="qpm" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorQpm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Dedicated Breakdown */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Time Dedicated Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Aggregated by learning module type</p>

            <div className="space-y-3">
              {/* Lecture Watching */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Video Lectures
                  </span>
                  <span className="font-mono text-indigo-300">{timeBreakdown.lecturesMins} mins</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              {/* MCQ Quizzes */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> MCQ Quizzes
                  </span>
                  <span className="font-mono text-purple-300">{timeBreakdown.quizzesMins} mins</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>

              {/* Sandboxed Coding */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Code className="w-3.5 h-3.5 text-emerald-400" /> Coding Practice
                  </span>
                  <span className="font-mono text-emerald-300">{timeBreakdown.codingMins} mins</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 font-mono">
            Optimal balance: 50% Video / 25% Quiz / 25% Sandboxed Execution.
          </div>
        </div>

      </div>
    </div>
  );
};
