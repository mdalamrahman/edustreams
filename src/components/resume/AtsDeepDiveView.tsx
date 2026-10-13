import React from 'react';
import {
  Award,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { ResumeAnalysisResult } from '../../lib/resumeAnalyzerService';

interface AtsDeepDiveViewProps {
  data: ResumeAnalysisResult;
}

export const AtsDeepDiveView: React.FC<AtsDeepDiveViewProps> = ({ data }) => {
  const { ats_score } = data;
  const breakdown = ats_score.score_breakdown || {};

  const categories = [
    {
      title: 'Keyword Match',
      item: breakdown.keyword_match,
      icon: TrendingUp,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-600/20 border-indigo-500/30',
      description: 'Density and relevance of target role keywords found across experience and skills sections.'
    },
    {
      title: 'Skills Alignment',
      item: breakdown.skills_match,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-600/20 border-emerald-500/30',
      description: 'Direct matches for core programming languages, frameworks, databases, and architectural tools.'
    },
    {
      title: 'Experience Relevance',
      item: breakdown.experience_relevance,
      icon: Award,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/20 border-purple-500/30',
      description: 'Seniority alignment, team leadership indicators, and scale of past projects relative to the JD.'
    },
    {
      title: 'Format Optimization',
      item: breakdown.format_optimization,
      icon: FileCheck,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-600/20 border-cyan-500/30',
      description: 'Machine-readability of section headers, single-column parsing, and absence of obstructive formatting.'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. OVERALL ATS VERDICT BANNER (OBSIDIAN TELEMETRY) */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 font-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>ATS Readiness Engine</span>
            </span>
            <span className="text-xs font-mono text-stitch-dim">
              Analyzed via SDETube AI
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">
            Overall ATS Compatibility: <span className="text-cyan-400 font-mono">{ats_score.overall_score}%</span>
          </h2>
          <p className="text-xs sm:text-sm text-stitch-dim max-w-2xl leading-relaxed">
            Applicant Tracking Systems screen and rank candidates based on keyword matching, clean chronological formatting, and direct role competencies.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#070a12] border border-cyan-500/30 text-center flex-shrink-0 min-w-[140px] relative z-10 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-stitch-dim font-mono tracking-wider">Screening Verdict</span>
          <div className="text-xl font-black text-cyan-300 font-mono mt-0.5">
            {ats_score.ats_compatibility?.rating || 'Strong'}
          </div>
          <div className="text-[10px] font-mono text-stitch-dim mt-1">Pass Filter</div>
        </div>
      </div>

      {/* 2. ATS CRITERIA BREAKDOWN CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat, idx) => {
          const score = cat.item?.score || 80;
          const max = cat.item?.max_score || 100;
          const pct = Math.round((score / max) * 100);
          const Icon = cat.icon;

          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-6 shadow-xl space-y-4 flex flex-col justify-between group hover:border-cyan-400/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border ${cat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <span className="text-2xl font-black font-mono text-white">
                    {score}<span className="text-xs text-slate-500 font-normal">/{max}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{cat.title}</h3>
                  <p className="text-xs text-stitch-dim mt-1 leading-relaxed">
                    {cat.item?.details || cat.description}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
                <div className="w-full bg-[#070a12] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 85 ? 'bg-emerald-400' : pct >= 70 ? 'bg-cyan-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-stitch-dim">
                  <span>Match Score</span>
                  <span>{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. ATS IMPROVEMENT SUGGESTIONS & OPTIMIZATION TIPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Improvement Suggestions */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>ATS Improvement Suggestions</span>
            </h3>
            <span className="text-xs font-mono text-stitch-dim">High Impact First</span>
          </div>

          <div className="space-y-3">
            {ats_score.improvement_suggestions?.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#070a12] border border-white/[0.08] hover:border-cyan-400/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white font-mono">
                    Area: {item.area}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      item.impact === 'High'
                        ? 'bg-rose-950 text-rose-300 border-rose-700/60'
                        : item.impact === 'Medium'
                        ? 'bg-amber-950 text-amber-300 border-amber-700/60'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                    }`}
                  >
                    {item.impact} Impact
                  </span>
                </div>
                <p className="text-xs text-stitch-dim leading-relaxed">{item.suggestion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ATS Optimization Best Practices */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <span>ATS Formatting Best Practices</span>
          </h3>

          <div className="space-y-3">
            {ats_score.ats_compatibility?.optimization_tips?.map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[#070a12] border border-white/[0.08] text-xs text-slate-200"
              >
                <span className="w-5 h-5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  {idx + 1}
                </span>
                <p className="leading-relaxed text-stitch-dim">{tip}</p>
              </div>
            ))}

            {/* Standard Best Practices */}
            <div className="p-4 rounded-xl bg-[#0e1422] border border-cyan-500/30 text-xs text-cyan-200 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Golden Rules for Modern ATS Systems:</span>
              </div>
              <ul className="space-y-1 text-stitch-dim text-[11px] list-disc list-inside">
                <li>Use clean standard fonts (Inter, Roboto, Arial, Calibri)</li>
                <li>Avoid multi-column tables, graphics, or nested text boxes</li>
                <li>Save as standard PDF or Plain Text with UTF-8 encoding</li>
                <li>Use standard headings: Work Experience, Education, Technical Skills</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
