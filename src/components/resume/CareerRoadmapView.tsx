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
      {/* 1. CAREER PROGRESSION LEVEL BRIDGE BANNER */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
              <Target className="w-5 h-5 text-indigo-400" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Career Progression & Level Calibration</h2>
              <p className="text-xs text-slate-400">FAANG Seniority Ladder Mapping</p>
            </div>
          </div>
        </div>

        {/* Visual Level Bridge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          {/* Current Level Box */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">Current Assessed Level</span>
            <div className="text-lg font-black text-indigo-300 font-mono">
              {progression.current_level}
            </div>
            <p className="text-xs text-slate-400">Derived from candidate years & scope</p>
          </div>

          {/* Bridge Arrow */}
          <div className="hidden md:flex flex-col items-center justify-center space-y-1 text-center">
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Target Promotion Gap</span>
            <div className="w-full flex items-center justify-center">
              <div className="h-0.5 w-16 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <ArrowRight className="w-5 h-5 text-purple-400" />
            </div>
          </div>

          {/* Target Level Box */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/40 space-y-1 shadow-lg shadow-purple-950/20">
            <span className="text-[10px] font-mono uppercase font-bold text-purple-400 tracking-wider">Target Role Level</span>
            <div className="text-lg font-black text-purple-300 font-mono">
              {progression.target_level}
            </div>
            <p className="text-xs text-slate-400">Required level from target job post</p>
          </div>
        </div>

        {/* Gap Analysis Paragraph */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-900/50 space-y-1">
          <span className="text-xs font-mono font-bold uppercase text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Seniority Gap Analysis:</span>
          </span>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {progression.gap_analysis}
          </p>
        </div>
      </div>

      {/* 2. RESUME WRITING CHECKLIST (GOOGLE XYZ METHOD) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
              <FileText className="w-5 h-5 text-purple-400" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-100">Concrete Resume Writing Enhancements</h3>
              <p className="text-xs text-slate-400">Transform passive bullet points into high-impact accomplishments</p>
            </div>
          </div>
          <span className="text-xs font-mono text-purple-300 font-bold hidden sm:inline">
            Google "XYZ" Formula
          </span>
        </div>

        {/* Google XYZ Explainer */}
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-slate-200 space-y-2">
          <div className="font-bold text-indigo-300 text-xs font-mono">The Google Resume Formula:</div>
          <blockquote className="italic border-l-2 border-indigo-400 pl-3 text-slate-300">
            "Accomplished <strong>[X]</strong>, as measured by <strong>[Y]</strong>, by doing <strong>[Z]</strong>."
          </blockquote>
          <p className="text-[11px] text-slate-400">
            Example: "Reduced database query latency by <strong>42% (Y)</strong>, improving checkout conversion <strong>(X)</strong>, by implementing a write-behind Redis caching layer and indexing composite keys <strong>(Z)</strong>."
          </p>
        </div>

        {/* Actionable Suggestions List */}
        <div className="space-y-3">
          {insights.resume_improvements?.map((imp, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all text-xs text-slate-200"
            >
              <div className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-700 text-purple-300 font-mono font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                {idx + 1}
              </div>
              <p className="leading-relaxed font-sans text-xs sm:text-sm">{imp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
