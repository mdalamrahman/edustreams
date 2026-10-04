import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  Award,
  CheckCircle2,
  XCircle,
  Target,
  TrendingUp,
  Lightbulb,
  Check,
  X,
  FileCheck,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ResumeAnalysisResult } from '../../lib/resumeAnalyzerService';

interface AnalysisDashboardViewProps {
  data: ResumeAnalysisResult;
  onNavigateToFlashcards?: () => void;
  onNavigateToCreator?: () => void;
}

export const AnalysisDashboardView: React.FC<AnalysisDashboardViewProps> = ({
  data,
  onNavigateToFlashcards,
  onNavigateToCreator
}) => {
  const { analysis, insights, ats_score } = data;

  const matchingSkillsCount = analysis.matching_skills?.length || 0;
  const missingSkillsCount = analysis.missing_skills?.length || 0;
  const experienceScore = analysis.experience_match?.match_percentage || 0;
  const roleScore = analysis.role_compatibility?.score || 0;
  const overallAtsScore = ats_score.overall_score || 0;

  // Chart 1: Skills Distribution (Pie)
  const skillsPieData = [
    { name: 'Matching Skills', value: matchingSkillsCount, fill: '#10b981' },
    { name: 'Missing Skills', value: missingSkillsCount, fill: '#f43f5e' }
  ];

  // Chart 2: Score Breakdown (Bar)
  const scoreBreakdownData = [
    { name: 'ATS Overall', score: overallAtsScore, fill: '#8b5cf6' },
    { name: 'Role Match', score: roleScore, fill: '#6366f1' },
    { name: 'Exp. Match', score: experienceScore, fill: '#06b6d4' },
    { name: 'Keyword Align', score: ats_score.score_breakdown?.keyword_match?.score || 80, fill: '#3b82f6' },
    { name: 'Skills Align', score: ats_score.score_breakdown?.skills_match?.score || 85, fill: '#10b981' },
    { name: 'Format', score: ats_score.score_breakdown?.format_optimization?.score || 85, fill: '#ec4899' }
  ];

  // Chart 3: Radial ATS
  const radialData = [
    { name: 'ATS Score', value: overallAtsScore, fill: '#8b5cf6' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. TOP STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* ATS Score Card */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 shadow-xl relative overflow-hidden group hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
                {overallAtsScore}%
              </span>
            </div>
          </div>
          <h3 className="font-bold text-slate-100 text-base">ATS Compatibility</h3>
          <p className="text-xs text-slate-400 mt-1">Applicant Tracking System Score</p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono font-semibold text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <span>{ats_score.ats_compatibility?.rating || 'Strong'} Rating</span>
          </div>
        </div>

        {/* Matching Skills Card */}
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 shadow-xl relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                {matchingSkillsCount}
              </span>
            </div>
          </div>
          <h3 className="font-bold text-slate-100 text-base">Matching Skills</h3>
          <p className="text-xs text-slate-400 mt-1">Verified candidate proficiencies</p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-300">
            <Check className="w-3.5 h-3.5" />
            <span>Aligned with target JD</span>
          </div>
        </div>

        {/* Missing Skills Card */}
        <div className="glass-panel p-6 rounded-3xl border border-rose-500/40 bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-950 shadow-xl relative overflow-hidden group hover:border-rose-400 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-rose-600/20 text-rose-300 border border-rose-500/30">
              <XCircle className="w-6 h-6 text-rose-400" />
            </div>
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black font-mono text-rose-400">
                {missingSkillsCount}
              </span>
            </div>
          </div>
          <h3 className="font-bold text-slate-100 text-base">Skills to Add</h3>
          <p className="text-xs text-slate-400 mt-1">Key omissions from job post</p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono font-semibold text-rose-300">
            <X className="w-3.5 h-3.5" />
            <span>Opportunity gaps to bridge</span>
          </div>
        </div>

        {/* Role Match Card */}
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/30 via-slate-900 to-slate-950 shadow-xl relative overflow-hidden group hover:border-cyan-400 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30">
              <Target className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black font-mono text-cyan-400">
                {roleScore}%
              </span>
            </div>
          </div>
          <h3 className="font-bold text-slate-100 text-base">Role Compatibility</h3>
          <p className="text-xs text-slate-400 mt-1">Experience & seniority fit</p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono font-semibold text-cyan-300 truncate">
            <span>Req: {analysis.experience_match?.required_years || '3+ yrs'}</span>
          </div>
        </div>

      </div>

      {/* 2. CHARTS SECTION (SKILLS PIE, SCORE BREAKDOWN BAR, RADIAL ATS GAUGE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Skills Distribution (Pie) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Skills Distribution</span>
              </h3>
              <span className="text-xs font-mono text-slate-400 font-bold">
                {matchingSkillsCount + missingSkillsCount} Total
              </span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={skillsPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="#0f172a"
                    strokeWidth={2}
                  >
                    {skillsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex justify-center gap-6 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/50"></div>
              <span className="text-xs font-bold text-slate-300">Matching ({matchingSkillsCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded-full shadow-sm shadow-rose-500/50"></div>
              <span className="text-xs font-bold text-slate-300">Missing ({missingSkillsCount})</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Score Breakdown (Bar Chart) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Competency Scores</span>
              </h3>
              <span className="text-xs font-mono text-indigo-300 font-bold">Scale 0-100</span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {scoreBreakdownData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-400 font-mono">
            Analyzed against job description requirements
          </div>
        </div>

        {/* Chart 3: ATS Score Radial Gauge */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-purple-400" />
                <span>ATS Pass Readiness</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-[10px] font-mono text-purple-300 font-bold">
                {ats_score.ats_compatibility?.rating || 'Strong'}
              </span>
            </div>
            <div className="h-52 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="100%"
                  barSize={16}
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    background={{ fill: '#1e293b' }}
                    dataKey="value"
                    cornerRadius={12}
                    fill="#8b5cf6"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black font-mono text-slate-100">{overallAtsScore}%</span>
                <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Pass Rate</span>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-300 font-medium">
              {overallAtsScore >= 80 ? '✓ High probability of passing automated screening filters.' :
               overallAtsScore >= 60 ? '⚡ Decent alignment, but bridging keyword gaps will boost ranking.' :
               '⚠️ Needs substantial revision of keywords and experience bullets.'}
            </p>
          </div>
        </div>

      </div>

      {/* 3. DETAILED ANALYSIS (STRENGTHS, WEAKNESSES & PRIORITIZED RECOMMENDATIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Strengths & Weaknesses */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Strengths & Growth Opportunities</span>
          </h3>

          {/* Strengths */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Key Strengths</span>
            </h4>
            <div className="space-y-2">
              {insights.strengths?.map((str: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
                  <p className="leading-relaxed">{str}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 font-mono">
              <XCircle className="w-4 h-4" />
              <span>Areas for Improvement</span>
            </h4>
            <div className="space-y-2">
              {insights.weaknesses?.map((weak: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-xs text-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0"></div>
                  <p className="leading-relaxed">{weak}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prioritized Recommendations */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span>Actionable Recommendations</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Prioritized by Impact</span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {insights.recommendations?.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    {rec.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      rec.priority === 'High'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                        : rec.priority === 'Medium'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rec.suggestion}</p>
              </div>
            ))}
          </div>

          {/* Quick CTA to Interview Prep */}
          {onNavigateToFlashcards && (
            <div className="pt-2">
              <button
                onClick={onNavigateToFlashcards}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Practice 3D Interview Flashcards ({data.flashcards?.length || 15} Qs)</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 4. SKILLS & KEYWORDS GRID (MATCHING VS MISSING) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Matching Skills & Keywords */}
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-slate-900/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Matching Skills ({matchingSkillsCount})</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400/80 font-bold">Present in Resume</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {analysis.matching_skills?.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {skill}
              </span>
            ))}
          </div>

          {/* Matching Keywords */}
          {analysis.matching_keywords && analysis.matching_keywords.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Matching ATS Keywords:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matching_keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-mono"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Missing Skills & Keywords */}
        <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 bg-slate-900/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Missing Skills to Add ({missingSkillsCount})</span>
            </h3>
            <span className="text-xs font-mono text-rose-400/80 font-bold">Requested by Role</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {analysis.missing_skills?.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-700/60 text-rose-300 text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <X className="w-3.5 h-3.5 text-rose-400" />
                {skill}
              </span>
            ))}
          </div>

          {/* Missing Keywords */}
          {analysis.missing_keywords && analysis.missing_keywords.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Missing ATS Keywords:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missing_keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-rose-200 text-[11px] font-mono"
                  >
                    +{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 5. ROLE COMPATIBILITY SUMMARY */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[10px] font-mono font-bold">
              AI Recruiter Verdict
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Score: {roleScore}/100
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-100">
            {analysis.role_compatibility?.reasoning || 'Strong foundational alignment with core engineering responsibilities.'}
          </h4>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right font-mono text-xs text-slate-400">
            <div>Experience: <span className="font-bold text-slate-200">{analysis.experience_match?.candidate_years}</span></div>
            <div>Required: <span className="font-bold text-slate-200">{analysis.experience_match?.required_years}</span></div>
          </div>
        </div>
      </div>

      {/* 6. ACTION BANNER: LAUNCH AI ATS RESUME CREATOR */}
      {onNavigateToCreator && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/40 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Next Step Recommendation</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {missingSkillsCount} skill gaps identified
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Ready to Turn These Insights into an Interview-Winning ATS Resume?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Launch our <strong className="text-purple-300">AI ATS Resume Creator</strong> to seamlessly incorporate missing keywords, re-craft work bullets using Google's XYZ formula, and export an ATS-verified paper document or PDF ready for application tracking systems.
            </p>
          </div>

          <button
            onClick={onNavigateToCreator}
            className="flex-shrink-0 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Open AI ATS Resume Creator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
