import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Home, 
  Code2, 
  Wallet, 
  Bot, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface ThankYouPageProps {
  onNavigateHome?: () => void;
  onNavigateTab?: (tab: any) => void;
  conversionType?: 'wallet' | 'problem' | 'interview' | 'feedback' | 'welcome';
  detailMessage?: string;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  onNavigateHome,
  onNavigateTab,
  conversionType = 'welcome',
  detailMessage,
}) => {
  const navigate = useNavigate();
  const handleHome = onNavigateHome || (() => navigate('/'));
  const handleTab = (tab: any) => {
    if (onNavigateTab) onNavigateTab(tab);
    if (tab === 'sde_sheet') navigate('/dsa-sheets');
    else if (tab === 'dsa_problems') navigate('/dsa-problems');
    else if (tab === 'lld') navigate('/lld');
    else if (tab === 'hld' || tab === 'system_design') navigate('/hld');
    else if (tab === 'interview') navigate('/interview');
    else if (tab === 'resume_analyst') navigate('/resume-analyst');
    else if (tab === 'channels') navigate('/channels');
    else if (tab === 'analytics') navigate('/analytics');
    else navigate(`/${tab}`);
  };

  useEffect(() => {
    // Trigger celebratory confetti burst on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#38bdf8', '#10b981', '#f59e0b'],
      });
    } catch {}
  }, []);

  const configs = {
    wallet: {
      badge: 'PAYMENT_VERIFIED',
      title: 'Wallet Recharged Successfully! 💳',
      subtitle: 'Your virtual credits have been credited to your account. All video lecture passes and AI assistant queries are now unlocked.',
      icon: Wallet,
      color: 'text-emerald-400',
      actionText: 'Back to Video Curricula',
      actionTab: 'channels',
    },
    problem: {
      badge: 'PROBLEM_SOLVED',
      title: 'Milestone Achieved! All Test Cases Passed 🚀',
      subtitle: 'Outstanding execution! Your solution has been saved, your streak has advanced, and velocity points have been logged.',
      icon: Award,
      color: 'text-amber-400',
      actionText: 'Solve Next Challenge',
      actionTab: 'sde_sheet',
    },
    interview: {
      badge: 'INTERVIEW_COMPLETED',
      title: 'AI Mock Interview Complete! 🎯',
      subtitle: 'Your multi-round interview transcript has been evaluated by our AI evaluator. Review your scorecard and competency breakdown.',
      icon: Bot,
      color: 'text-purple-400',
      actionText: 'Review Scorecard',
      actionTab: 'interview',
    },
    feedback: {
      badge: 'FEEDBACK_LOGGED',
      title: 'Thank You for Your Feedback! 💬',
      subtitle: 'Your report helps us refine compiler runtimes and SDE curricula for thousands of engineers.',
      icon: CheckCircle2,
      color: 'text-sky-400',
      actionText: 'Return to Dashboard',
      actionTab: 'dashboard',
    },
    welcome: {
      badge: 'ACTION_CONFIRMED',
      title: 'Action Completed Successfully! 🎉',
      subtitle: 'Thank you for being part of the SDETube open learning community. Your preparation workspace is ready.',
      icon: Sparkles,
      color: 'text-indigo-400',
      actionText: 'Explore SDE Sheets',
      actionTab: 'sde_sheet',
    },
  };

  const current = configs[conversionType] || configs.welcome;
  const IconComponent = current.icon;

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 animate-fadeIn">
      <div className="w-full max-w-xl text-center space-y-8 relative">
        
        {/* Ambient Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Badge */}
        <div className="relative inline-flex flex-col items-center justify-center gap-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-0.5 shadow-2xl shadow-indigo-600/40 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <IconComponent className={`w-10 h-10 ${current.color}`} />
            </div>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs font-bold shadow-lg">
            {current.badge}
          </span>
        </div>

        {/* Heading & Details */}
        <div className="space-y-3 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {current.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
            {detailMessage || current.subtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
          <button
            onClick={() => handleTab(current.actionTab)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <span>{current.actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleHome}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 text-indigo-400" />
            <span>Dashboard</span>
          </button>
        </div>

      </div>
    </div>
  );
};
