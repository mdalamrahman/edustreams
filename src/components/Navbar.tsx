import React from 'react';
import { 
  Tv, 
  Code2, 
  BarChart3, 
  HardDrive, 
  Smartphone, 
  Laptop, 
  BookOpen, 
  UserCheck, 
  LogOut, 
  KeyRound,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { useDevice } from '../lib/device';

interface NavbarProps {
  activeTab: 'channels' | 'lesson' | 'sde_sheet' | 'code' | 'quiz' | 'analytics' | 'settings';
  setActiveTab: (tab: 'channels' | 'lesson' | 'sde_sheet' | 'code' | 'quiz' | 'analytics' | 'settings') => void;
  selectedChannel: string;
  setSelectedChannel: (channelId: string) => void;
  user: any;
  onOpenAuthModal?: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuthModal,
  onSignOut,
}) => {
  const { isMobile } = useDevice();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('channels')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 p-0.5 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Tv className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
                SDETube
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700/60">
                SDE Arena
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">AI-Powered Video Lectures & SDE Preparation</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'channels'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Channels</span>
          </button>

          <button
            onClick={() => setActiveTab('sde_sheet')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'sde_sheet'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-purple-300 hover:text-purple-100 hover:bg-purple-950/40 border border-purple-900/40'
            }`}
          >
            <Code2 className="w-4 h-4 text-purple-300" />
            <span>SDE Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab('lesson')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'lesson'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Video Lecture + SDE Notes Side-by-Side"
          >
            <Tv className="w-4 h-4 text-sky-400" />
            <span>Video & Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'code'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Monaco SDE Coding IDE"
          >
            <Terminal className="w-4 h-4 text-cyan-300" />
            <span>Coding IDE</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Conceptual MCQ Quiz Arena"
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
            <span>MCQ Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Analytics</span>
          </button>
        </nav>

        {/* Right User & Auth Section */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl p-1 pr-2">
              <div className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 font-mono text-xs font-bold flex items-center gap-1.5 border border-indigo-700/60">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[120px] truncate">{user.email || 'Authorized Student'}</span>
              </div>
              <button
                onClick={onSignOut}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Student Auth</span>
            </button>
          )}

          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs">
            {isMobile ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] text-amber-300 font-medium">Mobile</span>
              </>
            ) : (
              <>
                <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-300 font-medium">Desktop</span>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
