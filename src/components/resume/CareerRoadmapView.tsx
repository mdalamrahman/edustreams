import React from 'react';
import {
  Target,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  FileText,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { ResumeAnalysisResult } from '../../lib/resumeAnalyzerService';

interface CareerRoadmapViewProps {
  data: ResumeAnalysisResult;
}

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({ data }) => {
  const { insights } = data;
  const progression = insights.career_progression || {
    current_level: 'Mid-Level Software Engineer (SDE-2)',
    target_level: 'Senior Software Engineer (SDE-3 / Lead)',
    gap_analysis: 'Demonstrate cross-functional leadership, RFC system design ownership, and mentorship.'
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. CAREER PROGRESSION LEVEL BRIDGE BANNER (OBSIDIAN TELEMETRY) */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden group">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <Target className="w-5 h-5 text-cyan-400" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Career Progression &amp; Level Calibration</h2>
              <p className="text-xs text-stitch-dim">FAANG Seniority Ladder Mapping</p>
            </div>
          </div>
        </div>

        {/* Visual Level Bridge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center relative z-10">
          
          {/* Current Level Box */}
          <div className="p-5 rounded-xl bg-[#070a12] border border-white/[0.08] space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-stitch-dim tracking-wider">Current Assessed Level</span>
            <div className="text-lg font-black text-cyan-300 font-mono">
              {progression.current_level}
            </div>
            <p className="text-xs text-stitch-dim">Derived from candidate years &amp; scope</p>
          </div>

          {/* Bridge Arrow */}
          <div className="hidden md:flex flex-col items-center justify-center space-y-1 text-center">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">Target Promotion Gap</span>
            <div className="w-full flex items-center justify-center">
              <div className="h-0.5 w-16 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
              <ArrowRight className="w-5 h-5 text-purple-400" />
            </div>
          </div>

          {/* Target Level Box */}
          <div className="p-5 rounded-xl bg-[#070a12] border border-purple-500/40 space-y-1 shadow-lg shadow-purple-950/20">
            <span className="text-[10px] font-mono uppercase font-bold text-purple-400 tracking-wider">Target Role Level</span>
            <div className="text-lg font-black text-purple-300 font-mono">
              {progression.target_level}
            </div>
            <p className="text-xs text-stitch-dim">Required level from target job post</p>
          </div>
        </div>

        {/* Gap Analysis Paragraph */}
        <div className="p-4 rounded-xl bg-[#0e1422] border border-cyan-500/20 space-y-1 relative z-10">
          <span className="text-xs font-mono font-bold uppercase text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Seniority Gap Analysis:</span>
          </span>
          <p className="text-xs sm:text-sm text-stitch-dim leading-relaxed font-sans">
            {progression.gap_analysis}
          </p>
        </div>
      </div>

      {/* 2. RESUME WRITING CHECKLIST (GOOGLE XYZ METHOD) */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30">
              <FileText className="w-5 h-5 text-purple-400" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Concrete Resume Writing Enhancements</h3>
              <p className="text-xs text-stitch-dim">Transform passive bullet points into high-impact accomplishments</p>
            </div>
          </div>
          <span className="text-xs font-mono text-purple-300 font-bold hidden sm:inline">
            Google "XYZ" Formula
          </span>
        </div>

        {/* Google XYZ Explainer */}
        <div className="p-4 rounded-xl bg-[#070a12] border border-white/[0.08] text-xs text-slate-200 space-y-2">
          <div className="font-bold text-cyan-300 text-xs font-mono">The Google Resume Formula:</div>
          <blockquote className="italic border-l-2 border-cyan-400 pl-3 text-slate-300">
            "Accomplished <strong>[X]</strong>, as measured by <strong>[Y]</strong>, by doing <strong>[Z]</strong>."
          </blockquote>
          <p className="text-[11px] text-stitch-dim">
            Example: "Reduced database query latency by <strong>42% (Y)</strong>, improving checkout conversion <strong>(X)</strong>, by implementing a write-behind Redis caching layer and indexing composite keys <strong>(Z)</strong>."
          </p>
        </div>

        {/* Actionable Suggestions List */}
        <div className="space-y-3">
          {insights.resume_improvements?.map((imp, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-xl bg-[#070a12] border border-white/[0.08] hover:border-cyan-400/40 transition-all text-xs text-slate-200"
            >
              <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                {idx + 1}
              </div>
              <p className="leading-relaxed font-sans text-xs sm:text-sm text-stitch-dim">{imp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
