import React from 'react';
import { 
  Compass, 
  ArrowLeft, 
  Home, 
  Code2, 
  Layers, 
  Cpu, 
  Search, 
  Sparkles,
  AlertOctagon
} from 'lucide-react';

interface NotFoundPageProps {
  onNavigateHome: () => void;
  onNavigateTab: (tab: any) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigateHome,
  onNavigateTab,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 animate-fadeIn">
      <div className="w-full max-w-2xl text-center space-y-8 relative">
        
        {/* Glow ambient background circles */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="text-8xl sm:text-9xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 select-none drop-shadow-2xl">
            404
          </div>
          <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-slate-900 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold shadow-xl flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
            <span>ROUTE_NOT_FOUND</span>
          </div>
        </div>

        {/* Heading & Context */}
        <div className="space-y-3 relative z-10">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Lost in the Code Space?
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
            The interview path, problem slug, or lecture route you navigated to doesn't exist or has been relocated to an updated track.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
          <button
            onClick={onNavigateHome}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <button
            onClick={() => onNavigateTab('sde_sheet')}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm flex items-center gap-2 transition-all hover:border-slate-700 cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>Browse SDE Sheets</span>
          </button>
        </div>

        {/* Suggested Quick Nav Cards */}
        <div className="pt-6 border-t border-slate-800/80 relative z-10">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">
            Popular Learning Paths
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigateTab('dsa_problems')}
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-indigo-400 mb-1">
                <Code2 className="w-4 h-4" />
                <span className="text-[10px] font-mono text-slate-500">3,400+ Qs</span>
              </div>
              <div className="font-bold text-slate-200 text-xs group-hover:text-indigo-300">Company DSA</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Top FAANG questions</p>
            </button>

            <button
              onClick={() => onNavigateTab('lld')}
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-pink-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-pink-400 mb-1">
                <Layers className="w-4 h-4" />
                <span className="text-[10px] font-mono text-slate-500">OOP Studio</span>
              </div>
              <div className="font-bold text-slate-200 text-xs group-hover:text-pink-300">Low-Level Design</div>
              <p className="text-[11px] text-slate-400 mt-0.5">SOLID & Design Patterns</p>
            </button>

            <button
              onClick={() => onNavigateTab('hld')}
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-teal-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-teal-400 mb-1">
                <Cpu className="w-4 h-4" />
                <span className="text-[10px] font-mono text-slate-500">Boss Canvas</span>
              </div>
              <div className="font-bold text-slate-200 text-xs group-hover:text-teal-300">System Design</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Scalable Architecture</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
