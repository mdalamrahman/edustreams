import React from 'react';
import { Flame, Code2, Bot, BarChart3, Sparkles } from 'lucide-react';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../lib/AppContext';

interface StickyMobileCTAProps {
  onOpenPotd?: () => void;
  onNavigateToSdeSheet?: () => void;
  onOpenAskAI?: () => void;
  onNavigateToAnalytics?: () => void;
  activeTab?: string;
}

export const StickyMobileCTA: React.FC<StickyMobileCTAProps> = ({
  onOpenPotd: propPotd,
  onNavigateToSdeSheet: propSdeSheet,
  onOpenAskAI: propAskAI,
  onNavigateToAnalytics: propAnalytics,
  activeTab: propActiveTab,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const appCtx = useAppContext();

  const activeTab = propActiveTab || (
    location.pathname.startsWith('/dsa-sheets') ? 'sde_sheet' :
    location.pathname.startsWith('/analytics') ? 'analytics' : ''
  );

  const onOpenPotd = propPotd || (() => appCtx.setIsPotdModalOpen(true));
  const onNavigateToSdeSheet = propSdeSheet || (() => navigate('/dsa-sheets'));
  const onOpenAskAI = propAskAI || (() => appCtx.openAskAIWithMode());
  const onNavigateToAnalytics = propAnalytics || (() => navigate('/analytics'));

  return (
    <div
      role="toolbar"
      aria-label="Mobile Navigation Quick Action Toolbar"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-xl px-3 py-2 shadow-2xl safe-area-inset-bottom"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {/* Daily POTD Action Button */}
        <button
          onClick={onOpenPotd}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-amber-300 hover:bg-amber-950/30 transition-all min-h-[44px] cursor-pointer"
          title="Open Today's POTD"
        >
          <div className="relative">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <span className="text-[10px] font-extrabold tracking-tight mt-0.5">Daily POTD</span>
        </button>

        {/* DSA Sheets Hub */}
        <button
          onClick={onNavigateToSdeSheet}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-h-[44px] cursor-pointer ${
            activeTab === 'sde_sheet'
              ? 'text-indigo-300 bg-indigo-950/60 border border-indigo-700/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="SDE Curricula (743 Problems)"
        >
          <Code2 className="w-5 h-5 text-indigo-400" />
          <span className="text-[10px] font-bold tracking-tight mt-0.5">SDE Sheet</span>
        </button>

        {/* Ask AI Tutor */}
        <button
          onClick={onOpenAskAI}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-purple-300 hover:bg-purple-950/30 transition-all min-h-[44px] cursor-pointer"
          title="Ask AI Teaching Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-purple-400" />
            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1.5" />
          </div>
          <span className="text-[10px] font-bold tracking-tight mt-0.5">Ask AI</span>
        </button>

        {/* Velocity Analytics */}
        <button
          onClick={onNavigateToAnalytics}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-h-[44px] cursor-pointer ${
            activeTab === 'analytics'
              ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-700/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Progress & Velocity Analytics"
        >
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-tight mt-0.5">Velocity</span>
        </button>
      </div>
    </div>
  );
};
