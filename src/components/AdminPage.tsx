import React from 'react';
import { ShieldCheck, ArrowLeft, Terminal, Sparkles, Flame, Calendar, Activity } from 'lucide-react';
import { AdminDashboardModal } from './AdminDashboardModal';
import { AppTab } from './Navbar';

interface AdminPageProps {
  user: any;
  onNavigate: (tab: AppTab) => void;
  onOpenAuthModal?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  user,
  onNavigate,
  onOpenAuthModal
}) => {
  const isAdminUser = Boolean(
    user?.email && (
      user.email.toLowerCase().includes('mdalamrahman4') || 
      user.email.toLowerCase() === 'mdalamrahman4@gmail.com'
    )
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-500/30">
      {/* Top Banner Navigation */}
      <div className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm group"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to App</span>
            </button>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-200">
                SDETube Operations Command Center
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-md bg-purple-950 border border-purple-700/50 text-[10px] font-mono font-bold text-purple-300">
                /admin
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Admin Session Live
            </span>
            {user?.email && (
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                {user.email}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col">
        <AdminDashboardModal
          isPage={true}
          currentUserEmail={user?.email || 'mdalamrahman4@gmail.com'}
          initialTab="potd"
        />
      </main>
    </div>
  );
};
