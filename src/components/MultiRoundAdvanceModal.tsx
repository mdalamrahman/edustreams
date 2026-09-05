import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Coffee, 
  Sparkles, 
  Award, 
  Clock, 
  UserCheck, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { CompletedRoundRecord, RoundDefinition } from '../lib/multiRoundLoopService';

interface MultiRoundAdvanceModalProps {
  isOpen: boolean;
  roundRecord: CompletedRoundRecord;
  nextRound: RoundDefinition;
  totalRoundsCount: number;
  onProceedToNextRound: () => void;
  onClose: () => void;
}

export const MultiRoundAdvanceModal: React.FC<MultiRoundAdvanceModalProps> = ({
  isOpen,
  roundRecord,
  nextRound,
  totalRoundsCount,
  onProceedToNextRound,
  onClose
}) => {
  const [breakSecondsLeft, setBreakSecondsLeft] = useState<number | null>(null);
  const [isBreakActive, setIsBreakActive] = useState<boolean>(false);

  useEffect(() => {
    if (!isBreakActive || breakSecondsLeft === null) return;
    if (breakSecondsLeft <= 0) {
      setIsBreakActive(false);
      setBreakSecondsLeft(null);
      return;
    }
    const timer = setInterval(() => {
      setBreakSecondsLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isBreakActive, breakSecondsLeft]);

  if (!isOpen) return null;

  const startBreak = () => {
    setBreakSecondsLeft(5 * 60); // 5 minutes
    setIsBreakActive(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentDef = roundRecord.roundDefinition;
  const scorecard = roundRecord.scorecard;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
      <div className="max-w-2xl w-full rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950/30 text-slate-100 shadow-2xl shadow-emerald-950/50 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Ribbon */}
        <div className="p-6 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                  STAGE CLEARED • ROUND {roundRecord.roundIndex + 1} OF {totalRoundsCount}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {currentDef.title} Cleared!
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {scorecard.overallScore}/100
            </span>
            <span className="block text-[10px] text-slate-400 font-mono">
              {scorecard.percentileRank}th Percentile
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          
          {/* Verdict Banner */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block font-mono">Interviewer Verdict:</span>
                <span className="text-sm font-bold text-emerald-300">
                  {scorecard.hiringVerdict || 'HIRE'} — Advanced to Next Stage
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono">
              PASSED
            </span>
          </div>

          {/* Next Round Preview Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Next Up: Round {nextRound.roundIndex + 1} of {totalRoundsCount}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-indigo-950 border border-indigo-700/60 text-indigo-300 font-mono text-[10px] font-bold">
                {nextRound.roundType} ROUND
              </span>
            </div>

            <h3 className="text-lg font-black text-white">
              {nextRound.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {nextRound.focusDescription}
            </p>

            <div className="pt-2 flex items-center space-x-3 text-xs text-slate-400 border-t border-slate-800">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Interviewer: <strong>{nextRound.interviewerName}</strong> ({nextRound.interviewerTitle})</span>
            </div>
          </div>

          {/* Break Timer Section */}
          {isBreakActive && breakSecondsLeft !== null ? (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center space-x-3">
                <Coffee className="w-5 h-5 text-amber-400 animate-pulse" />
                <div>
                  <span className="text-xs font-bold text-amber-300 block">Candidate Rest Break Active</span>
                  <span className="text-[11px] text-slate-400">Take a breath, drink water, and review your notes.</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-mono font-black text-amber-300">
                  {formatTime(breakSecondsLeft)}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5 text-slate-400">
                <Coffee className="w-4 h-4 text-slate-400" />
                <span>Need a moment before facing the next interviewer?</span>
              </div>
              <button
                onClick={startBreak}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Take 5-Min Break</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Review Round Scorecard
          </button>

          <button
            onClick={onProceedToNextRound}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-sm font-black shadow-xl shadow-emerald-950/60 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <span>Proceed to Round {nextRound.roundIndex + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
