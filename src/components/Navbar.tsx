import React, { useState, useEffect, useRef } from 'react';
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
  Download,
  ChevronDown,
  CheckCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { useDevice } from '../lib/device';

interface NavbarProps {
  activeTab: 'channels' | 'lesson' | 'sde_sheet' | 'analytics' | 'settings';
  setActiveTab: (tab: 'channels' | 'lesson' | 'sde_sheet' | 'analytics' | 'settings') => void;
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInstallWebApp = async () => {
    setIsDropdownOpen(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer flex-shrink-0" onClick={() => setActiveTab('channels')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 p-0.5 shadow-lg shadow-purple-500/20 flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Tv className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
                  SDETube
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-2 py-0.2 rounded-full bg-purple-950 text-purple-300 border border-purple-700/60">
                  SDE Arena
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">AI-Powered Video Lectures & SDE Preparation</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveTab('channels')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'channels'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Channels</span>
            </button>

            <button
              onClick={() => setActiveTab('sde_sheet')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'sde_sheet'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-purple-300 hover:text-purple-100 hover:bg-purple-950/40 border border-purple-900/40'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300" />
              <span>SDE Sheet</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Right User & Auth Section with Dropdown Menu */}
          <div className="flex items-center space-x-2" ref={dropdownRef}>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 rounded-xl p-1 sm:p-1.5 pr-2.5 transition-all cursor-pointer shadow-sm group"
                  title="Click for options & WebApp download"
                >
                  <div className="px-2 py-1 rounded-lg bg-indigo-950 text-indigo-300 font-mono text-xs font-bold flex items-center gap-1.5 border border-indigo-700/60">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="max-w-[100px] sm:max-w-[140px] truncate">{user.email || 'Authorized Student'}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
                    
                    {/* User Info Header */}
                    <div className="p-2.5 border-b border-slate-800">
                      <div className="text-xs font-bold text-slate-200 truncate">{user.email || 'Authorized Student'}</div>
                      <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Active SDE Session</span>
                      </div>
                    </div>

                    {/* Option 1: DOWNLOAD WEBAPP */}
                    <button
                      onClick={handleInstallWebApp}
                      className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-purple-600/20 text-purple-300 hover:text-purple-100 text-xs font-bold transition-colors group text-left"
                    >
                      <div className="p-1 rounded-lg bg-purple-950 border border-purple-800 text-purple-400 group-hover:text-white">
                        <Download className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div>Download WebApp</div>
                        <div className="text-[10px] text-slate-400 font-normal">Install as Desktop/Mobile App</div>
                      </div>
                    </button>

                    {/* Option 2: SIGN OUT */}
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-bold transition-colors text-left"
                    >
                      <div className="p-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                        <LogOut className="w-3.5 h-3.5" />
                      </div>
                      <span>Sign Out</span>
                    </button>

                  </div>
                )}
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

            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs">
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

      {/* WebApp Download / Install Modal Guide */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Download SDETube WebApp</h3>
                <p className="text-xs text-slate-400">Install as a standalone App on your device</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <strong className="text-indigo-400 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5" /> On PC / Laptop (Chrome or Edge):
                </strong>
                <p className="text-slate-400 text-[11px]">
                  Look at the right side of the browser URL address bar and click the <strong>Install App (⊕)</strong> icon, or click the browser menu (⋮) → <strong>Install SDETube</strong>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <strong className="text-purple-400 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> On Android & iPhone:
                </strong>
                <p className="text-slate-400 text-[11px]">
                  Open browser menu (⋮) or Safari Share button (⎋) and select <strong>Add to Home screen</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-md shadow-purple-600/30"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
