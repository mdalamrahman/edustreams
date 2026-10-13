import React from 'react';
import { Activity, Flame, Clock, Award, BarChart3, Sparkles } from 'lucide-react';
import { VelocityTracker } from './VelocityTracker';
import { DiagnosticCard } from './DiagnosticCard';
import { useAppContext } from '../lib/AppContext';

export const AnalyticsPage: React.FC = () => {
  const { totalSolved, totalActiveMins, accuracyPercent, timeBreakdown } = useAppContext();

  const codingHours = Math.floor(totalActiveMins / 60);
  const codingMins = totalActiveMins % 60;
  const readinessIndex = Math.min(98, Math.round(65 + Math.min(30, totalSolved * 0.2)));

  return (
    <div className="space-y-8 max-w-[98%] xl:max-w-7xl mx-auto px-2 sm:px-4 py-6">
      {/* 1. TOP HERO COMMAND DECK (OBSIDIAN TELEMETRY) */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090d16]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl group">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl transition-opacity group-hover:opacity-100" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl transition-opacity group-hover:opacity-100" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[11px] font-bold tracking-wide uppercase">
              <Activity className="w-3.5 h-3.5" />
              <span>● PERFORMANCE TELEMETRY // SOLVING VELOCITY &amp; ACCURACY MATRIX</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Engineering Velocity &amp; Diagnostic Analytics
            </h1>
            <p className="text-xs sm:text-sm text-stitch-dim max-w-2xl leading-relaxed">
              Real-time problem execution telemetry, time allocation across tracks, algorithmic accuracy diagnostics, and FAANG interview readiness calibration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-xl bg-[#0e1320] border border-white/[0.08] text-center shadow-inner">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">Readiness Index</div>
              <div className="text-2xl font-black text-cyan-300 font-mono mt-0.5">
                {readinessIndex}%
              </div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-[#0e1320] border border-white/[0.08] text-center shadow-inner">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">Total Solved</div>
              <div className="text-2xl font-black text-emerald-300 font-mono mt-0.5">
                {totalSolved}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Floating Telemetry Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.06]">
          <div className="p-3.5 rounded-xl bg-[#070a12] border border-white/[0.08] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-stitch-dim uppercase">Total Solved</div>
              <div className="text-sm font-mono font-bold text-white">{totalSolved} Qs</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#070a12] border border-white/[0.08] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-stitch-dim uppercase">Coding Time</div>
              <div className="text-sm font-mono font-bold text-white">{codingHours}h {codingMins}m</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#070a12] border border-white/[0.08] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-stitch-dim uppercase">Accuracy Rate</div>
              <div className="text-sm font-mono font-bold text-white">{accuracyPercent}%</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#070a12] border border-white/[0.08] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-stitch-dim uppercase">Readiness Score</div>
              <div className="text-sm font-mono font-bold text-white">{readinessIndex}% Calibrated</div>
            </div>
          </div>
        </div>
      </div>

      <VelocityTracker
        totalSolved={totalSolved}
        totalActiveMins={totalActiveMins}
        accuracyPercent={accuracyPercent}
        timeBreakdown={timeBreakdown}
      />

      <DiagnosticCard
        totalSolved={totalSolved}
        totalMins={totalActiveMins}
        accuracyPercent={accuracyPercent}
      />
    </div>
  );
};

