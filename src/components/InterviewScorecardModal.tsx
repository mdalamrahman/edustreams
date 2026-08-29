import React, { useState } from 'react';
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
  Check,
  Target,
  Zap,
  Quote,
  Calendar,
  Compass,
  HardDrive,
  BarChart3,
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { InterviewScorecard, getVerdictColor } from '../lib/interviewEvaluator';

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
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'competencies' | 'highlights' | 'roadmap' | 'debrief'>('overview');

  const handleDownloadReport = () => {
    const md = `# ${scorecard.company} Technical Bar Raiser Scorecard
**Candidate Role Level:** ${scorecard.roleLevel} | **Round:** ${scorecard.roundType} (${scorecard.testStyle})
**Date:** ${scorecard.date} | **Duration:** ${scorecard.durationMinutes} Minutes
**Overall Score:** ${scorecard.overallScore}/100 | **Percentile:** ${scorecard.percentileRank}th Percentile
**Hiring Committee Verdict:** ${scorecard.hiringVerdict}
**Level Calibration:** ${scorecard.levelCalibration}

---

## 1. Competency Breakdown
- **Problem Solving & Algorithmic Intuition:** ${scorecard.metrics.problemSolving.score}/10 (${scorecard.metrics.problemSolving.rating || 'Strong'})
  ${scorecard.metrics.problemSolving.feedback}
- **Code Correctness & Quality:** ${scorecard.metrics.codeQuality.score}/10 (${scorecard.metrics.codeQuality.rating || 'Strong'})
  ${scorecard.metrics.codeQuality.feedback}
- **Architecture & System Design:** ${scorecard.metrics.architectureDesign.score}/10 (${scorecard.metrics.architectureDesign.rating || 'Strong'})
  ${scorecard.metrics.architectureDesign.feedback}
- **Communication & Collaboration:** ${scorecard.metrics.communication.score}/10 (${scorecard.metrics.communication.rating || 'Strong'})
  ${scorecard.metrics.communication.feedback}

---

## 2. Asymptotic Complexity Verdict
- **Stated Complexity:** Time: ${scorecard.complexityAnalysis?.statedTimeComplexity || 'O(N)'}, Space: ${scorecard.complexityAnalysis?.statedSpaceComplexity || 'O(1)'}
- **Actual Implemented Complexity:** Time: ${scorecard.complexityAnalysis?.actualTimeComplexity || 'O(N)'}, Space: ${scorecard.complexityAnalysis?.actualSpaceComplexity || 'O(1)'}
- **Verdict:** ${scorecard.complexityAnalysis?.verdict || 'Optimal complexity achieved.'}

---

## 3. Key Strengths
${scorecard.strengths.map(s => `- ${s}`).join('\n')}

## 4. Key Areas for Improvement
${scorecard.areasOfImprovement.map(a => `- ${a}`).join('\n')}

---

## 5. 7-Day Actionable Remediation Plan
${(scorecard.sevenDayRoadmap || []).map(r => `### ${r.day}: ${r.topic}\n- **Action:** ${r.recommendedAction}\n- **Practice:** ${r.practiceProblemOrConcept}`).join('\n\n')}

---

## 6. Executive Hiring Committee Debrief
${scorecard.hiringCommitteeDebrief || scorecard.interviewerSummary}
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
    const text = `SDE Mock Interview Result (${scorecard.company} ${scorecard.roleLevel} - ${scorecard.roundType}): Score ${scorecard.overallScore}/100 • Verdict: ${scorecard.hiringVerdict} (${scorecard.percentileRank}th Percentile) • Calibrated at ${scorecard.levelCalibration}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fadeIn overflow-y-auto custom-scrollbar">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {scorecard.company} Hiring Committee Scorecard
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                  {scorecard.roleLevel}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[10px] font-mono font-bold hidden sm:inline">
                  {scorecard.roundType}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <span>{scorecard.date}</span>
                <span>&bull;</span>
                <span>{scorecard.durationMinutes} Mins Live Assessment</span>
                <span>&bull;</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-cyan-400" />
                  <span>Persisted to Cloudflare R2 & Supabase</span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySummary}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Copy Summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownloadReport}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Download Full Markdown Scorecard"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Scorecard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (FinalRound.ai Style) */}
        <div className="p-2.5 px-6 bg-slate-950 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto custom-scrollbar flex-shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Executive Verdict
          </button>
          <button
            onClick={() => setActiveTab('competencies')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'competencies' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎯 Competency Rubric
          </button>
          {scorecard.turnHighlights && scorecard.turnHighlights.length > 0 && (
            <button
              onClick={() => setActiveTab('highlights')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'highlights' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💬 Speech Highlights
            </button>
          )}
          {scorecard.sevenDayRoadmap && scorecard.sevenDayRoadmap.length > 0 && (
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'roadmap' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🗓️ 7-Day Plan
            </button>
          )}
          <button
            onClick={() => setActiveTab('debrief')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'debrief' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📝 Bar Raiser Debrief
          </button>
        </div>

        {/* Modal Main Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          
          {/* TAB 1: EXECUTIVE VERDICT & OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Top Banner KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Score KPI */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold uppercase text-[10px] tracking-wider">Overall Rating</span>
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl sm:text-4xl font-black text-white">{scorecard.overallScore}</span>
                    <span className="text-slate-500 font-mono text-sm">/ 100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-1000"
                      style={{ width: `${scorecard.overallScore}%` }}
                    />
                  </div>
                </div>

                {/* Verdict KPI */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold uppercase text-[10px] tracking-wider">Hiring Decision</span>
                    <Target className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1.5 rounded-xl font-black text-sm tracking-wide border ${getVerdictColor(scorecard.hiringVerdict)}`}>
                      {scorecard.hiringVerdict}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-2 truncate">
                    {scorecard.levelCalibration}
                  </p>
                </div>

                {/* Percentile Rank KPI */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold uppercase text-[10px] tracking-wider">Cohort Percentile</span>
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="mt-2 flex items-baseline space-x-1">
                    <span className="text-3xl font-black text-amber-300">{scorecard.percentileRank}</span>
                    <span className="text-amber-400/80 font-bold text-sm">th Percentile</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">
                    Compared to {scorecard.company} {scorecard.roleLevel} pool
                  </p>
                </div>

              </div>

              {/* Asymptotic Complexity & Efficiency Card */}
              {scorecard.complexityAnalysis && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Asymptotic Complexity & Efficiency Analysis</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                      scorecard.complexityAnalysis.isOptimal ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {scorecard.complexityAnalysis.isOptimal ? 'Optimal Bounds Verified' : 'Suboptimal Complexity'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block font-mono">Stated Big-O Complexity</span>
                      <div className="font-mono text-slate-200 mt-0.5">
                        Time: <span className="text-indigo-400 font-bold">{scorecard.complexityAnalysis.statedTimeComplexity}</span> &bull; Space: <span className="text-cyan-400 font-bold">{scorecard.complexityAnalysis.statedSpaceComplexity}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block font-mono">Actual Implemented Complexity</span>
                      <div className="font-mono text-slate-200 mt-0.5">
                        Time: <span className="text-indigo-400 font-bold">{scorecard.complexityAnalysis.actualTimeComplexity}</span> &bull; Space: <span className="text-cyan-400 font-bold">{scorecard.complexityAnalysis.actualSpaceComplexity}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-400 leading-relaxed text-[11px] font-sans">
                    {scorecard.complexityAnalysis.verdict}
                  </p>
                </div>
              )}

              {/* Strengths & Improvement Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Key Strengths */}
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Demonstrated Strengths</span>
                  </div>
                  <ul className="space-y-2 text-slate-300">
                    {scorecard.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-400 mt-0.5">&bull;</span>
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Targeted Areas for Growth</span>
                  </div>
                  <ul className="space-y-2 text-slate-300">
                    {scorecard.areasOfImprovement.map((a, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-amber-400 mt-0.5">&bull;</span>
                        <span className="leading-relaxed">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: GRANULAR COMPETENCY RUBRIC */}
          {activeTab === 'competencies' && (
            <div className="space-y-4 animate-fadeIn">
              {Object.entries(scorecard.metrics).map(([key, metric]) => {
                if (!metric) return null;
                const titleMap: Record<string, string> = {
                  problemSolving: '1. Problem Solving & Algorithmic Intuition',
                  codeQuality: '2. Code Correctness, Idioms & Execution',
                  architectureDesign: '3. System Architecture & Scalability',
                  communication: '4. Communication & Collaborative Dialogue',
                  behavioralOwnership: '5. Behavioral Signals & Technical Ownership'
                };
                const label = titleMap[key] || key;

                return (
                  <div key={key} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">{label}</h4>
                      <div className="flex items-center space-x-2">
                        {metric.rating && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                            {metric.rating}
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-xl bg-indigo-950 border border-indigo-700/60 text-indigo-300 font-mono font-black text-xs">
                          {metric.score} / 10
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed font-sans text-xs">
                      {metric.feedback}
                    </p>

                    {metric.evidenceQuotes && metric.evidenceQuotes.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 mt-2">
                        <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                          <Quote className="w-3 h-3 text-indigo-400" />
                          <span>Candidate Speech Evidence:</span>
                        </span>
                        {metric.evidenceQuotes.map((q, idx) => (
                          <p key={idx} className="text-slate-400 italic text-[11px]">"{q}"</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: TURN-BY-TURN HIGHLIGHT ANALYSIS */}
          {activeTab === 'highlights' && scorecard.turnHighlights && (
            <div className="space-y-4 animate-fadeIn">
              {scorecard.turnHighlights.map((hl, idx) => (
                <div 
                  key={idx} 
                  className={`p-5 rounded-2xl border space-y-3 ${
                    hl.turnType === 'strength'
                      ? 'bg-emerald-950/10 border-emerald-500/30'
                      : 'bg-amber-950/10 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${
                      hl.turnType === 'strength'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {hl.turnType === 'strength' ? 'Positive Signal' : 'Identified Gap / Missed Edge Case'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">What You Said:</span>
                    <p className="text-slate-200 italic font-sans mt-0.5">"{hl.candidateSaid}"</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Bar Raiser Evaluation:</span>
                    <p className="text-slate-300 leading-relaxed font-sans">{hl.interviewerReaction}</p>
                  </div>

                  <div className="pt-1 text-[11px] font-medium text-indigo-300">
                    <span className="font-bold">Key Takeaway:</span> {hl.takeaway}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: 7-DAY ACTIONABLE REMEDIATION PLAN */}
          {activeTab === 'roadmap' && scorecard.sevenDayRoadmap && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  <span>Personalized 7-Day Interview Remediation Plan</span>
                </h4>
                <p className="text-slate-400 text-[11px]">
                  Engineered to close the exact gaps observed during this session before your real {scorecard.company} round.
                </p>
              </div>

              <div className="space-y-3">
                {scorecard.sevenDayRoadmap.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-teal-950 border border-teal-700/60 text-teal-300 font-mono font-bold text-[10px]">
                        {item.day}
                      </span>
                      <span className="font-bold text-xs text-white">{item.topic}</span>
                    </div>

                    <div className="text-slate-300 font-sans text-xs">
                      <span className="font-bold text-slate-400">Action:</span> {item.recommendedAction}
                    </div>

                    <div className="text-indigo-300 font-mono text-[11px]">
                      <span className="font-bold text-slate-500">Practice Concept:</span> {item.practiceProblemOrConcept}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BAR RAISER DEBRIEF NARRATIVE */}
          {activeTab === 'debrief' && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-fadeIn leading-relaxed">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Executive Hiring Committee Debrief</span>
              </div>
              <div className="text-slate-300 whitespace-pre-line font-sans text-xs space-y-3">
                {scorecard.hiringCommitteeDebrief || scorecard.interviewerSummary}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <button
            onClick={onRetake}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Configure Another Round
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report (Markdown)</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-900/30 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
