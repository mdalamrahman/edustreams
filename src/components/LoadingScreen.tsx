import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Layers, Zap, Code2, ShieldCheck, Radio } from 'lucide-react';

const INITIALIZATION_STEPS = [
  { label: 'Connecting Telethon MTProto Proxy Streams', icon: Radio },
  { label: 'Connecting Telethon MTProto Stream Channel Proxy', icon: ShieldCheck },
  { label: 'Warming SDETube Speech & Audio Engine', icon: Sparkles },
  { label: 'Loading SDETube Academic Diagnostics', icon: Cpu },
  { label: 'Initializing Monaco Sandboxed Code Workspace', icon: Code2 },
  { label: 'Verifying Supabase Auth & Cloud Database Sync', icon: ShieldCheck },
];

export const LoadingScreen: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progressPct, setProgressPct] = useState(15);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev + 1) % INITIALIZATION_STEPS.length);
    }, 1800);

    const progressInterval = setInterval(() => {
      setProgressPct((prev) => {
        if (prev >= 92) return prev;
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 400);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const ActiveIcon = INITIALIZATION_STEPS[currentStepIdx].icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 overflow-hidden font-sans select-none">
      
      {/* Background Animated Gradient Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 left-1/3 w-[350px] h-[350px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Cybernetic Glassmorphic Card Container */}
      <div className="relative max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-indigo-500/30 bg-slate-900/60 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center space-y-7 overflow-hidden">
        
        {/* Top Decorative Cyber Grid Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

        {/* Central Concentric Neon Spinner & Breathing Core */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          
          {/* Outer Rotating Gradient Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin" style={{ animationDuration: '2.5s' }} />
          
          {/* Inner Counter-Rotating Cyan Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-cyan-400 border-l-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.8s' }} />

          {/* Central Glowing Orb Core */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-sky-500 p-0.5 shadow-xl shadow-indigo-500/40 flex items-center justify-center animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-300 animate-bounce" />
            </div>
          </div>

          {/* Glowing Status Dot */}
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono text-[11px] font-bold tracking-wider uppercase">
            <Zap className="w-3 h-3 text-amber-400 fill-current" /> SDETube AI Engine
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-indigo-200 to-purple-300 tracking-tight">
            Synchronizing Learning Platform
          </h2>
        </div>

        {/* Dynamic Rotating Status Step */}
        <div className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center space-x-3 text-left transition-all duration-500 min-h-[64px]">
          <div className="p-2.5 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-400 flex-shrink-0">
            <ActiveIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
              Step {currentStepIdx + 1} of {INITIALIZATION_STEPS.length}
            </div>
            <p className="text-xs font-semibold text-slate-200 truncate">
              {INITIALIZATION_STEPS[currentStepIdx].label}...
            </p>
          </div>
        </div>

        {/* Animated Progress Bar & Percentage */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">System Initialization</span>
            <span className="text-indigo-300 font-bold">{progressPct}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-300 ease-out shadow-lg shadow-indigo-500/50"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Bottom Feature Chips */}
        <div className="flex items-center justify-center space-x-2 text-[10px] font-mono text-slate-400 pt-1">
          <span className="px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800">Telegram Proxy</span>
          <span className="text-slate-600">•</span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800">Judge0 Compiler</span>
          <span className="text-slate-600">•</span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800">SDETube Cloud</span>
        </div>

      </div>
    </div>
  );
};
