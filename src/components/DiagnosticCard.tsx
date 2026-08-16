import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, BookOpen, RefreshCw, Award } from 'lucide-react';
import { requestMistralDiagnostic } from '../lib/mistral';
import { AIDiagnosticReport } from '../lib/types';

interface DiagnosticCardProps {
  totalSolved: number;
  totalMins: number;
  accuracyPercent: number;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  totalSolved,
  totalMins,
  accuracyPercent
}) => {
  const [report, setReport] = useState<AIDiagnosticReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiagnostic = async () => {
    setIsLoading(true);
    const res = await requestMistralDiagnostic(totalSolved, totalMins, accuracyPercent);
    setReport(res);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDiagnostic();
  }, [totalSolved, totalMins, accuracyPercent]);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-slate-900 to-slate-950 shadow-2xl relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              SDETube AI Student Academic Diagnostic
            </h3>
            <p className="text-xs text-slate-400">Synthesized velocity analysis & personalized review recommendations</p>
          </div>
        </div>

        <button
          onClick={fetchDiagnostic}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
          <span>Refresh Diagnostic</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 italic font-mono text-xs">
          Synthesizing student velocity vector via SDETube AI Engine...
        </div>
      ) : report ? (
        <div className="space-y-5">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Overall Status</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold">
                {report.academic_performance}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              {report.summary}
            </p>
          </div>

          {/* Strengths & Weaknesses 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Academic Strengths
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {report.strengths.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Recommended Slow-Paced Areas
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {report.weaknesses.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Recommended Lectures to Review */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Recommended EduStream Lecture Reviews
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {report.recommended_lectures.map((lec, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="truncate">{lec}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
};
