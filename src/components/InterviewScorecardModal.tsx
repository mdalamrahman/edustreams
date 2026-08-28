import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  X, 
  Briefcase, 
  Clock, 
  Layers, 
  Sparkles,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { InterviewScorecard } from '../lib/interviewEvaluator';

interface InterviewScorecardModalProps {
  scorecard: InterviewScorecard;
  onClose: () => void;
  onRetake: () => void;
}

export const InterviewScorecardModal: React.FC<InterviewScorecardModalProps> = ({
  scorecard,
  onClose,
  onRetake
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleDownloadReport = () => {
    const md = `# SDE Technical Mock Interview Scorecard
**Company:** ${scorecard.company}
**Level:** ${scorecard.roleLevel} | **Round:** ${scorecard.roundType}
**Date:** ${scorecard.date} | **Duration:** ${scorecard.durationMinutes} minutes
**Overall Score:** ${scorecard.overallScore}/100 | **Hiring Decision:** ${scorecard.hiringVerdict}

---

## Metric Breakdown
- **Problem Solving & Logic:** ${scorecard.metrics.problemSolving.score}/10
  - ${scorecard.metrics.problemSolving.feedback}
- **Code Quality & Correctness:** ${scorecard.metrics.codeQuality.score}/10
  - ${scorecard.metrics.codeQuality.feedback}
- **Architecture & System Design:** ${scorecard.metrics.architectureDesign.score}/10
  - ${scorecard.metrics.architectureDesign.feedback}
- **Communication & Articulation:** ${scorecard.metrics.communication.score}/10
  - ${scorecard.metrics.communication.feedback}

---

## Key Strengths
${scorecard.strengths.map(s => `- ${s}`).join('\n')}

## Areas for Improvement
${scorecard.areasOfImprovement.map(a => `- ${a}`).join('\n')}

---
### Lead Interviewer Summary
${scorecard.interviewerSummary}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scorecard.company.toLowerCase()}-${scorecard.roleLevel.toLowerCase()}-${scorecard.roundType.toLowerCase()}-scorecard.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleCopySummary = () => {
    const text = `SDE Mock Interview Result (${scorecard.company} ${scorecard.roleLevel} - ${scorecard.roundType}): Score ${scorecard.overallScore}/100 - Verdict: ${scorecard.hiringVerdict}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-fadeIn overflow-y-auto custom-scrollbar">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {scorecard.company} SDE Interview Scorecard
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                  {scorecard.roleLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {scorecard.roundType} Round • {scorecard.date} • {scorecard.durationMinutes} mins
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySummary}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Copy Summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownloadReport}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Download Scorecard .md"
            >
              <Download className="w-4 h-4 text-indigo-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-slate-200">
          
          {/* Top Score & Verdict Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Overall Score */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Overall Rating</span>
                <div className="text-3xl font-black text-white mt-1">
                  {scorecard.overallScore}<span className="text-lg text-slate-500 font-normal">/100</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-black text-xl text-indigo-400">
                {scorecard.overallScore}%
              </div>
            </div>

            {/* Hiring Decision */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-center ${scorecard.verdictColor}`}>
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">Hiring Decision</span>
              <div className="text-2xl font-black tracking-tight mt-1">
                {scorecard.hiringVerdict}
              </div>
            </div>

            {/* Performance Tier */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-center">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Target Level Match</span>
              <div className="text-base font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{scorecard.roleLevel} Standards Met</span>
              </div>
            </div>

          </div>

          {/* Metric Breakdown Progress Bars */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Competency Breakdown</span>
            </h4>

            <div className="space-y-4">
              {Object.entries(scorecard.metrics).map(([key, item]) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300 capitalize">{item.name || key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-mono text-indigo-400">{item.score} / 10</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-700"
                      style={{ width: `${(item.score / 10) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{item.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Areas of Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Strengths */}
            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-3">
              <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Demonstrated Strengths</span>
              </h5>
              <ul className="space-y-2 text-xs text-slate-300">
                {scorecard.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-3">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Areas for Growth</span>
              </h5>
              <ul className="space-y-2 text-xs text-slate-300">
                {scorecard.areasOfImprovement.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Lead Interviewer Summary */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Principal Bar Raiser Assessment
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed font-sans select-text">
              {scorecard.interviewerSummary}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            onClick={onRetake}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Start New Round
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadReport}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-900/30 cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Report (.md)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
