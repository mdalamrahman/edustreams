import React from 'react';
import { 
  XCircle, 
  RotateCcw, 
  FileText, 
  AlertTriangle, 
  Compass, 
  ChevronRight, 
  Target,
  ArrowLeft
} from 'lucide-react';
import { CompletedRoundRecord } from '../lib/multiRoundLoopService';

interface MultiRoundEliminationModalProps {
  isOpen: boolean;
  roundRecord: CompletedRoundRecord;
  totalRoundsCount: number;
  onRestartLoop: () => void;
  onReviewScorecard: () => void;
  onExit: () => void;
}

export const MultiRoundEliminationModal: React.FC<MultiRoundEliminationModalProps> = ({
  isOpen,
  roundRecord,
  totalRoundsCount,
  onRestartLoop,
  onReviewScorecard,
  onExit
}) => {
  if (!isOpen) return null;

  const currentDef = roundRecord.roundDefinition;
  const scorecard = roundRecord.scorecard;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fadeIn">
      <div className="max-w-2xl w-full rounded-3xl border border-rose-500/50 bg-gradient-to-b from-slate-900 via-slate-950 to-rose-950/30 text-slate-100 shadow-2xl shadow-rose-950/60 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Rejection Header */}
        <div className="p-6 bg-gradient-to-r from-rose-950/90 via-slate-900 to-slate-950 border-b border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/40">
                ELIMINATION GATE • FAILED ROUND {roundRecord.roundIndex + 1} OF {totalRoundsCount}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Eliminated at {currentDef.title}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-rose-400 font-mono">
              {scorecard.overallScore}/100
            </span>
            <span className="block text-[10px] text-slate-400 font-mono">
              {scorecard.percentileRank}th Percentile
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
          
          {/* Elimination Reason Alert */}
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-1.5">
            <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Hiring Committee Elimination Verdict</span>
            </div>
            <p className="text-xs text-rose-200 leading-relaxed font-mono">
              {roundRecord.eliminationReason || `Candidate achieved ${scorecard.hiringVerdict || 'NO HIRE'} (${scorecard.overallScore}/100), falling short of the required passing threshold (60/100).`}
            </p>
          </div>

          {/* Primary Weaknesses / Gaps */}
          {scorecard.areasOfImprovement && scorecard.areasOfImprovement.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Primary Competency Deficits Identified</span>
              </div>
              <ul className="space-y-2">
                {scorecard.areasOfImprovement.slice(0, 3).map((item, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-slate-300 leading-relaxed">
                    <span className="text-rose-400 font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 7-Day Targeted Remediation Roadmap Snapshot */}
          {scorecard.sevenDayRoadmap && scorecard.sevenDayRoadmap.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Immediate 7-Day Action Plan for this Round</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Recommended Drills</span>
              </div>
              <div className="space-y-2">
                {scorecard.sevenDayRoadmap.slice(0, 3).map((plan, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between gap-3">
                    <span className="font-mono text-cyan-400 font-bold text-[11px] flex-shrink-0">{plan.day}:</span>
                    <span className="text-slate-300 text-xs truncate flex-1">{plan.topic} &mdash; {plan.recommendedAction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Action Footer */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onExit}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Loop</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onReviewScorecard}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Diagnostic Scorecard</span>
            </button>

            <button
              onClick={onRestartLoop}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-rose-950/40 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Full Loop</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
