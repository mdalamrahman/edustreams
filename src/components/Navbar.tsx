import React from 'react';
import { 
  Tv, 
  Code2, 
  BarChart3, 
  HardDrive, 
  Smartphone, 
  Laptop, 
  BookOpen 
} from 'lucide-react';
import { useDevice } from '../lib/device';

interface NavbarProps {
  activeTab: 'channels' | 'lesson' | 'analytics' | 'settings';
  setActiveTab: (tab: 'channels' | 'lesson' | 'analytics' | 'settings') => void;
  selectedChannel: string;
  setSelectedChannel: (channelId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab
}) => {
  const { isMobile } = useDevice();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('channels')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Tv className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight gradient-text">EduStream AI</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                Private Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Telegram Ingestion & AI Resource Matrix</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'channels'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Channels</span>
          </button>

          <button
            onClick={() => setActiveTab('lesson')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'lesson'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">Lesson Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Velocity Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span className="hidden sm:inline">Cache & Storage</span>
          </button>
        </nav>

        {/* Right Device Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs">
            {isMobile ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] text-amber-300 font-medium">Mobile View</span>
              </>
            ) : (
              <>
                <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-300 font-medium">Desktop Workspace</span>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
