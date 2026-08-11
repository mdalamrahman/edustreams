import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, CheckCircle2, Loader2, Cpu, Mic, BookOpen } from 'lucide-react';

interface AIProcessingStatusCardProps {
  videoTitle: string;
  durationSeconds?: number;
}

export const AIProcessingStatusCard: React.FC<AIProcessingStatusCardProps> = ({ videoTitle, durationSeconds = 900 }) => {
  // Estimated total processing time: ~30 to 90 seconds based on video duration
  const totalEstimatedSeconds = Math.max(30, Math.min(120, Math.round(durationSeconds / 15)));
  const [secondsRemaining, setSecondsRemaining] = useState(totalEstimatedSeconds);
  const [progressPercent, setProgressPercent] = useState(10);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, totalEstimatedSeconds - elapsed);
      setSecondsRemaining(remaining);

      // Smooth progress calculation from 10% to 92% (leaves room for completion)
      const calculatedProgress = Math.min(92, Math.round(10 + (elapsed / totalEstimatedSeconds) * 82));
      setProgressPercent(calculatedProgress);
    }, 1000);

    return () => clearInterval(interval);
  }, [totalEstimatedSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Compute current active step based on progress
  const step = progressPercent < 45 ? 1 : progressPercent < 80 ? 2 : 3;

  return (
    <div className="h-full flex flex-col justify-center items-center p-6 sm:p-8 glass-panel rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-slate-900/90 via-indigo-950/40 to-slate-950 shadow-2xl relative overflow-hidden text-center space-y-6">
      
      {/* Background Neon Ambient Glows */}
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Header Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold tracking-wide shadow-inner">
        <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
        <span>EDUSTREAM AI PROCESSING ENGINE</span>
      </div>

      {/* Title & Description */}
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-extrabold text-slate-100 line-clamp-1">
          Transcribing & Synthesizing AI Artifacts
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Extracting speech from <span className="text-indigo-300 font-semibold">{videoTitle}</span> and creating lecture notes, 5 conceptual MCQs, and coding challenges.
        </p>
      </div>

      {/* Live Estimated Countdown Counter */}
      <div className="flex items-center justify-center space-x-3 bg-slate-950/80 px-5 py-2.5 rounded-2xl border border-slate-800 shadow-lg">
        <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
        <span className="text-xs text-slate-300 font-mono">Estimated Time Remaining:</span>
        <span className="text-sm font-mono font-extrabold text-amber-300 tracking-wider">
          {formatTime(secondsRemaining)}
        </span>
      </div>

      {/* Animated Step Progress Bar */}
      <div className="w-full max-w-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-400 px-1">
          <span>Processing Step {step} of 3</span>
          <span className="text-indigo-400">{progressPercent}%</span>
        </div>
        
        <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 p-0.5 overflow-hidden relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-700 shadow-md shadow-indigo-500/30 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 3-Step Live Execution Pipeline */}
      <div className="w-full max-w-md grid grid-cols-3 gap-2 text-left pt-2">
        
        {/* Step 1: Audio Extraction */}
        <div className={`p-3 rounded-xl border transition-all ${
          step > 1
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : step === 1
            ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200 ring-2 ring-indigo-500/30'
            : 'bg-slate-900/40 border-slate-800 text-slate-500'
        }`}>
          <div className="flex items-center gap-1.5 mb-1">
            {step > 1 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-indigo-400 animate-pulse flex-shrink-0" />
            )}
            <span className="text-[11px] font-bold font-mono">1. Audio</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">Extracting stream</p>
        </div>

        {/* Step 2: Speech-to-Text */}
        <div className={`p-3 rounded-xl border transition-all ${
          step > 2
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : step === 2
            ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200 ring-2 ring-indigo-500/30'
            : 'bg-slate-900/40 border-slate-800 text-slate-500'
        }`}>
          <div className="flex items-center gap-1.5 mb-1">
            {step > 2 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            ) : step === 2 ? (
              <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin flex-shrink-0" />
            ) : (
              <Cpu className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            )}
            <span className="text-[11px] font-bold font-mono">2. Speech STT</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">Verbatim transcribing</p>
        </div>

        {/* Step 3: Synthesis */}
        <div className={`p-3 rounded-xl border transition-all ${
          step === 3
            ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200 ring-2 ring-indigo-500/30'
            : 'bg-slate-900/40 border-slate-800 text-slate-500'
        }`}>
          <div className="flex items-center gap-1.5 mb-1">
            {step === 3 ? (
              <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin flex-shrink-0" />
            ) : (
              <BookOpen className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            )}
            <span className="text-[11px] font-bold font-mono">3. Synthesis</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">Notes & MCQs</p>
        </div>

      </div>

      <p className="text-[11px] text-slate-500 font-mono pt-1">
        EduStream Cloud will automatically refresh components once processing completes.
      </p>

    </div>
  );
};
