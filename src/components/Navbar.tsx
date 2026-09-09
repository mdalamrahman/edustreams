import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Code2, 
  BarChart3, 
  BookOpen, 
  UserCheck, 
  LogOut, 
  KeyRound, 
  Download, 
  ChevronDown, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Fingerprint, 
  Cpu, 
  LayoutDashboard, 
  Menu, 
  X, 
  Database, 
  Bot, 
  ArrowRight,
  Check,
  CreditCard,
  Layers,
  User,
  CheckCircle2
} from 'lucide-react';
import { useDevice } from '../lib/device';
import { addPasskeyToSupabase } from '../lib/auth';
import { getUserWallet } from '../lib/billing';
import { isPotdSolvedToday } from '../lib/analytics';

interface NavbarProps {
  activeTab: 'dashboard' | 'channels' | 'lesson' | 'sde_sheet' | 'lld' | 'hld' | 'system_design' | 'interview' | 'analytics' | 'profile' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'channels' | 'lesson' | 'sde_sheet' | 'lld' | 'hld' | 'system_design' | 'interview' | 'analytics' | 'profile' | 'settings') => void;
  selectedChannel: string;
  setSelectedChannel: (channelId: string) => void;
  user: any;
  onOpenAuthModal?: () => void;
  onOpenPotd?: () => void;
  onOpenSqlWorkspace?: () => void;
  onOpenAskAI?: () => void;
  onOpenWallet?: () => void;
  onOpenProfile?: () => void;
  onOpenAdmin?: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuthModal,
  onOpenPotd,
  onOpenSqlWorkspace,
  onOpenAskAI,
  onOpenWallet,
  onOpenProfile,
  onOpenAdmin,
  onSignOut,
}) => {
  const { isMobile } = useDevice();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyNotice, setPasskeyNotice] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(() => getUserWallet(user?.email).balance);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateBal = () => {
      setWalletBalance(getUserWallet(user?.email).balance);
    };
    updateBal();
    window.addEventListener('sdetube_wallet_updated', updateBal);
    return () => window.removeEventListener('sdetube_wallet_updated', updateBal);
  }, [user?.email]);

  const isAdminUser = Boolean(
    user?.email && (
      user.email.toLowerCase().includes('mdalamrahman4') || 
      user.email.toLowerCase() === 'mdalamrahman4@gmail.com'
    )
  );

  const handleAddPasskey = async () => {
    if (!user) return;
    setPasskeyLoading(true);
    setPasskeyNotice(null);

    const res = await addPasskeyToSupabase(user);
    setPasskeyLoading(false);

    if (res.success) {
      setPasskeyNotice('Hardware Biometric Passkey successfully linked to Supabase account.');
    } else {
      setPasskeyNotice(`Passkey registration notice: ${res.message}`);
    }

    setTimeout(() => {
      setPasskeyNotice(null);
    }, 6000);
  };

  const [isPotdSolved, setIsPotdSolved] = useState<boolean>(() => isPotdSolvedToday('sdetube'));

  useEffect(() => {
    const checkPotd = () => setIsPotdSolved(isPotdSolvedToday('sdetube'));
    checkPotd();
    window.addEventListener('sdetube_potd_solved', checkPotd);
    window.addEventListener('sdetube_problem_solved', checkPotd);
    return () => {
      window.removeEventListener('sdetube_potd_solved', checkPotd);
      window.removeEventListener('sdetube_problem_solved', checkPotd);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInstallClick = async () => {
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

  const navLinks = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      subtitle: 'Command Center & Daily POTD',
      icon: LayoutDashboard,
      color: 'text-indigo-400',
      activeColor: 'bg-indigo-600 text-white'
    },
    {
      id: 'sde_sheet' as const,
      label: 'DSA Sheets',
      subtitle: 'SDE, A2Z & 79 Curricula (743 Qs)',
      icon: Code2,
      color: 'text-purple-400',
      activeColor: 'bg-purple-600 text-white'
    },
    {
      id: 'lld' as const,
      label: 'LLD Design',
      subtitle: 'OOP Studio & SDE-1 Notes',
      icon: Layers,
      color: 'text-pink-400',
      activeColor: 'bg-pink-600 text-white'
    },
    {
      id: 'hld' as const,
      label: 'HLD Architecture',
      subtitle: 'Boss Sheet & Visual Canvas',
      icon: Cpu,
      color: 'text-teal-400',
      activeColor: 'bg-teal-600 text-white'
    },
    {
      id: 'channels' as const,
      label: 'Video Channels',
      subtitle: 'Cloud HD Video Lectures',
      icon: BookOpen,
      color: 'text-sky-400',
      activeColor: 'bg-sky-600 text-white'
    },
    {
      id: 'interview' as const,
      label: 'AI Mock Interview',
      subtitle: 'SDE-1/2/3 Multi-Round Companion',
      icon: Bot,
      color: 'text-amber-400',
      activeColor: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
    },
    {
      id: 'analytics' as const,
      label: 'Velocity Analytics',
      subtitle: '7-Day Trajectory & Real Stats',
      icon: BarChart3,
      color: 'text-emerald-400',
      activeColor: 'bg-emerald-600 text-white'
    }
  ];

  return (
    <>
      {/* Passkey Sync Toast Notification */}
      {passkeyNotice && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-indigo-950/95 border border-indigo-500/80 shadow-2xl backdrop-blur-xl text-indigo-100 text-xs font-semibold flex items-center gap-3 animate-fadeIn">
          <div className="p-2 rounded-xl bg-indigo-600/40 text-indigo-300 border border-indigo-400/40">
            <Fingerprint className="w-5 h-5 text-indigo-300 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-slate-100 flex items-center gap-1.5">
              <span>Supabase Passkey Engine</span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-900 border border-indigo-600 text-indigo-200 text-[9px] font-mono">Linked</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 max-w-xs">{passkeyNotice}</p>
          </div>
        </div>
      )}

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-[98%] mx-auto px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Hamburger Menu Button + Logo */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Trigger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shadow-sm transition-all cursor-pointer group flex items-center gap-1.5"
              title="Open Navigation Menu"
              aria-label="Navigation Menu"
            >
              <Menu className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            </button>

            {/* Brand Logo */}
            <div 
              className="flex items-center space-x-2.5 cursor-pointer flex-shrink-0" 
              onClick={() => setActiveTab('dashboard')}
            >
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
          </div>

          {/* Right Section: Wallet Balance + POTD Quick Action + User Avatar & Menu */}
          <div className="flex items-center space-x-2.5" ref={dropdownRef}>
            
            {/* Live Wallet Balance Pill */}
            {onOpenWallet && (
              <button
                onClick={onOpenWallet}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 text-xs font-bold font-mono transition-all shadow-md cursor-pointer group"
                title="SDETube Credits Wallet. Click to Recharge via UPI QR"
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>₹{walletBalance.toFixed(2)}</span>
              </button>
            )}

            {/* POTD Quick Action Button */}
            {onOpenPotd && (
              <button
                onClick={onOpenPotd}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer group ${
                  isPotdSolved
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border-emerald-500/50 text-emerald-300 hover:text-emerald-200 shadow-emerald-500/10'
                    : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border-amber-500/40 text-amber-300 hover:text-amber-200'
                }`}
                title={isPotdSolved ? "Today's SDETube POTD Solved! Click to review" : "Open Today's Problem of the Day"}
              >
                {isPotdSolved ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20 group-hover:scale-110 transition-transform" />
                ) : (
                  <Flame className="w-3.5 h-3.5 fill-amber-400 animate-pulse group-hover:scale-110 transition-transform" />
                )}
                <span>{isPotdSolved ? 'POTD Solved ✓' : 'POTD'}</span>
              </button>
            )}

            {/* Profile Page Quick Button */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer group ${
                activeTab === 'profile'
                  ? 'bg-purple-600 text-white border-purple-500 shadow-purple-600/30'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-purple-300 hover:text-white'
              }`}
              title="Open LeetCode-style Developer Profile, Heatmap & Certificates"
            >
              <User className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Profile</span>
            </button>

            {/* User Account / Auth Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                      <div className="text-xs font-bold text-slate-200 truncate">{user.user_metadata?.name || 'SDETube Student'}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                    </div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setActiveTab('profile');
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-purple-300 hover:bg-purple-950/50 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      <span>LeetCode Profile & Heatmap</span>
                    </button>

                    {isAdminUser && onOpenAdmin && (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-amber-300 hover:bg-amber-950/50 flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Admin Command Portal</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        handleAddPasskey();
                        setIsDropdownOpen(false);
                      }}
                      disabled={passkeyLoading}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-indigo-300 hover:bg-indigo-950/50 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Fingerprint className="w-4 h-4 text-indigo-400" />
                      <span>{passkeyLoading ? 'Linking Hardware Passkey...' : 'Register Device Passkey'}</span>
                    </button>

                    <button
                      onClick={() => {
                        handleInstallClick();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-300 hover:bg-slate-900 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-purple-400" />
                      <span>Install Web App (PWA)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition-all cursor-pointer mt-1 border-t border-slate-800/80"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* HAMBURGER SLIDE-OVER NAVIGATION DRAWER                                    */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn select-none">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" 
            onClick={() => setIsDrawerOpen(false)} 
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-slate-950 border-r border-slate-800 shadow-2xl flex flex-col z-10 animate-slideRight">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 p-0.5 shadow-md shadow-purple-500/20 flex-shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Tv className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
                  SDETube Arena
                </span>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Items List */}
            <div className="flex-1 p-3 overflow-y-auto space-y-1.5 custom-scrollbar">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
                Main Portals
              </div>

              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id);
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer group ${
                      isActive
                        ? link.activeColor + ' shadow-lg'
                        : 'hover:bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl border ${isActive ? 'bg-white/10 border-white/20' : 'bg-slate-900 border-slate-800 ' + link.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{link.label}</div>
                        <div className={`text-[10px] ${isActive ? 'text-white/80' : 'text-slate-500'}`}>{link.subtitle}</div>
                      </div>
                    </div>

                    <ArrowRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white opacity-100' : 'text-slate-400'}`} />
                  </button>
                );
              })}

              <div className="pt-3 border-t border-slate-800/80 mt-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
                  Credits & Utilities
                </div>

                {onOpenWallet && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenWallet();
                    }}
                    className="w-full p-3 rounded-2xl text-left hover:bg-slate-900/80 text-emerald-300 transition-all flex items-center justify-between cursor-pointer group bg-slate-900/50 border border-emerald-500/30 mb-1.5"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono">Wallet: ₹{walletBalance.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">Recharge Credits via UPI QR</div>
                      </div>
                    </div>
                  </button>
                )}

                {onOpenSqlWorkspace && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenSqlWorkspace();
                    }}
                    className="w-full p-3 rounded-2xl text-left hover:bg-slate-900/80 text-slate-300 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">SQL DBMS Arena</div>
                        <div className="text-[10px] text-slate-500">In-Browser WebAssembly Engine</div>
                      </div>
                    </div>
                  </button>
                )}

                {onOpenAskAI && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenAskAI();
                    }}
                    className="w-full p-3 rounded-2xl text-left hover:bg-slate-900/80 text-slate-300 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-300">
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-purple-200">Ask AI Mentor</div>
                        <div className="text-[10px] text-slate-400">Contextual Video & Code Assistant</div>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            {user && (
              <div className="p-3 border-t border-slate-800 bg-slate-950 flex flex-col gap-2">
                {isAdminUser && onOpenAdmin && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/60 text-amber-300 text-xs font-bold flex items-center justify-between cursor-pointer transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Admin Command Portal</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenProfile?.();
                  }}
                  className="w-full p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-950/70 border border-purple-800/60 text-purple-300 text-xs font-bold flex items-center justify-between cursor-pointer transition-all"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    <span>Developer Profile & Stats</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2 truncate">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-mono text-slate-300 truncate">{user.email}</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onSignOut();
                    }}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* PWA Install Instructions Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md glass-panel rounded-3xl border border-purple-500/40 p-6 bg-slate-900/95 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-purple-300 font-bold">
                <Download className="w-5 h-5 text-purple-400" />
                <span>Install SDETube App</span>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To install SDETube on your device, click the browser menu (⋮ or Share) and select <b>"Install App"</b> or <b>"Add to Home Screen"</b>.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
