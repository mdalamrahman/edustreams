import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  User,
  Flame,
  CheckCircle2,
  Trophy,
  ExternalLink,
  Github,
  Code2,
  Calendar,
  Sparkles,
  Award,
  Layers,
  BarChart3,
  Globe,
  Settings,
  RefreshCw,
  Zap,
  Activity,
  FolderGit2,
  Medal,
  Terminal,
  BookmarkCheck,
  Download,
  ShieldCheck,
  GraduationCap,
  Cloud
} from 'lucide-react';
import {
  LeetCodeFullProfileData,
  GitHubProfileData,
  GFGProfileData,
  CodeforcesProfileData,
  getLinkedProfiles,
  saveLinkedProfiles,
  fetchLeetCodeFullProfile,
  fetchGitHubProfile,
  fetchGFGProfile,
  fetchCodeforcesProfile,
  getRealSDETubeStats,
  getUserBadges,
  getUserTracksCertificates,
  TrackCertificateProgress,
  LinkedProfilesConfig,
  SDETubeRealStats,
  isCloudAutoSyncEnabled,
  setCloudAutoSyncEnabled
} from '../lib/userProfileService';
import { getUserWallet } from '../lib/billing';
import { getUserProgressSync } from '../lib/progressService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onOpenWallet?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenWallet
}) => {
  // Default tab is SDETube alone as requested
  const [activeTab, setActiveTab] = useState<'sdetube' | 'leetcode' | 'gfg' | 'codeforces' | 'github' | 'combined' | 'settings'>('sdetube');
  const [linkedConfig, setLinkedConfig] = useState<LinkedProfilesConfig>(() => getLinkedProfiles(user?.email));
  const [leetcodeData, setLeetcodeData] = useState<LeetCodeFullProfileData | null>(null);
  const [gfgData, setGfgData] = useState<GFGProfileData | null>(null);
  const [codeforcesData, setCodeforcesData] = useState<CodeforcesProfileData | null>(null);
  const [githubData, setGithubData] = useState<GitHubProfileData | null>(null);

  const [isLoadingLC, setIsLoadingLC] = useState<boolean>(false);
  const [isLoadingGFG, setIsLoadingGFG] = useState<boolean>(false);
  const [isLoadingCF, setIsLoadingCF] = useState<boolean>(false);
  const [isLoadingGH, setIsLoadingGH] = useState<boolean>(false);

  const [lcError, setLcError] = useState<string | null>(null);
  const [gfgError, setGfgError] = useState<string | null>(null);
  const [cfError, setCfError] = useState<string | null>(null);
  const [ghError, setGhError] = useState<string | null>(null);

  // Real SDETube Platform Stats (Scanned from real submissions & practice logs)
  const [sdeStats, setSdeStats] = useState<SDETubeRealStats>(() => getRealSDETubeStats());
  const [certificates, setCertificates] = useState<TrackCertificateProgress[]>(() => getUserTracksCertificates(user?.email));
  const badges = useMemo(() => getUserBadges(), [sdeStats.totalUniqueSolved, sdeStats.currentStreak]);

  // Certificate Modal View State
  const [selectedCert, setSelectedCert] = useState<TrackCertificateProgress | null>(null);

  // Settings Form
  const [lcInput, setLcInput] = useState(linkedConfig.leetcodeUsername || '');
  const [gfgInput, setGfgInput] = useState(linkedConfig.gfgUsername || '');
  const [cfInput, setCfInput] = useState(linkedConfig.codeforcesHandle || '');
  const [ghInput, setGhInput] = useState(linkedConfig.githubUsername || '');
  const [bioInput, setBioInput] = useState(linkedConfig.bio || '');
  const [autoSyncInput, setAutoSyncInput] = useState<boolean>(() => isCloudAutoSyncEnabled(user?.email));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const wallet = useMemo(() => getUserWallet(user?.email), [user?.email]);

  // Load real stats whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSdeStats(getRealSDETubeStats());
      setCertificates(getUserTracksCertificates(user?.email));
    }
  }, [isOpen, user?.email]);

  // Load LeetCode profile
  const loadLeetcode = async (uname: string) => {
    if (!uname.trim()) {
      setLeetcodeData(null);
      return;
    }
    setIsLoadingLC(true);
    setLcError(null);
    try {
      const data = await fetchLeetCodeFullProfile(uname);
      if (data && (data.matchedUser || data.allQuestionsCount)) {
        setLeetcodeData(data);
      } else {
        setLcError(`Could not find LeetCode profile for @${uname}`);
      }
    } catch (e: any) {
      setLcError(e?.message || 'Failed to fetch LeetCode profile');
    } finally {
      setIsLoadingLC(false);
    }
  };

  // Load GFG profile
  const loadGFG = async (uname: string) => {
    if (!uname.trim()) {
      setGfgData(null);
      return;
    }
    setIsLoadingGFG(true);
    setGfgError(null);
    try {
      const data = await fetchGFGProfile(uname);
      if (data && (data.status === 'Success' || data.total_problems_solved !== undefined)) {
        setGfgData(data);
      } else {
        setGfgError(`Could not find GeeksforGeeks profile for @${uname}`);
      }
    } catch (e: any) {
      setGfgError(e?.message || 'Failed to fetch GeeksforGeeks profile');
    } finally {
      setIsLoadingGFG(false);
    }
  };

  // Load Codeforces profile
  const loadCodeforces = async (handle: string) => {
    if (!handle.trim()) {
      setCodeforcesData(null);
      return;
    }
    setIsLoadingCF(true);
    setCfError(null);
    try {
      const data = await fetchCodeforcesProfile(handle);
      if (data && (data.status === 'Success' || data.handle)) {
        setCodeforcesData(data);
      } else {
        setCfError(`Could not find Codeforces profile for @${handle}`);
      }
    } catch (e: any) {
      setCfError(e?.message || 'Failed to fetch Codeforces profile');
    } finally {
      setIsLoadingCF(false);
    }
  };

  // Load GitHub profile
  const loadGithub = async (uname: string) => {
    if (!uname.trim()) {
      setGithubData(null);
      return;
    }
    setIsLoadingGH(true);
    setGhError(null);
    try {
      const data = await fetchGitHubProfile(uname);
      if (data && data.login) {
        setGithubData(data);
      } else {
        setGhError(`Could not find GitHub profile for @${uname}`);
      }
    } catch (e: any) {
      setGhError(e?.message || 'Failed to fetch GitHub profile');
    } finally {
      setIsLoadingGH(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const cfg = getLinkedProfiles(user?.email);
      setLinkedConfig(cfg);
      setLcInput(cfg.leetcodeUsername || '');
      setGfgInput(cfg.gfgUsername || '');
      setCfInput(cfg.codeforcesHandle || '');
      setGhInput(cfg.githubUsername || '');
      setBioInput(cfg.bio || '');

      if (cfg.leetcodeUsername) loadLeetcode(cfg.leetcodeUsername);
      if (cfg.gfgUsername) loadGFG(cfg.gfgUsername);
      if (cfg.codeforcesHandle) loadCodeforces(cfg.codeforcesHandle);
      if (cfg.githubUsername) loadGithub(cfg.githubUsername);
      setAutoSyncInput(isCloudAutoSyncEnabled(user?.email));
    }
  }, [isOpen, user?.email]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: LinkedProfilesConfig = {
      leetcodeUsername: lcInput.trim(),
      gfgUsername: gfgInput.trim(),
      codeforcesHandle: cfInput.trim(),
      githubUsername: ghInput.trim(),
      bio: bioInput.trim(),
      autoSyncCloud: autoSyncInput
    };
    setLinkedConfig(updated);
    saveLinkedProfiles(updated, user?.email);
    setCloudAutoSyncEnabled(autoSyncInput, user?.email);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    if (updated.leetcodeUsername) loadLeetcode(updated.leetcodeUsername);
    if (updated.gfgUsername) loadGFG(updated.gfgUsername);
    if (updated.codeforcesHandle) loadCodeforces(updated.codeforcesHandle);
    if (updated.githubUsername) loadGithub(updated.githubUsername);
  };

  if (!isOpen) return null;

  // Real Supabase Sheet Solved counts from progressService
  const userProgress = getUserProgressSync(user?.email);
  const sdeSolvedCount = (userProgress.solved_sde || []).length;
  const a2zSolvedCount = (userProgress.solved_a2z || []).length;
  const fast79SolvedCount = (userProgress.solved_79 || []).length;
  const blindSolvedCount = (userProgress.solved_blind75 || []).length;
  const mikSolvedCount = (userProgress.solved_mik || []).length;

  // 52-week heatmap grid (364 days divided into 52 weeks of 7 days)
  const heatmapWeeks: Array<Array<{ date: string; count: number; level: number }>> = [];
  const heatmapDays = generateHeatmapDays(sdeStats);
  for (let i = 0; i < heatmapDays.length; i += 7) {
    heatmapWeeks.push(heatmapDays.slice(i, i + 7));
  }

  // Month labels for heatmap
  const monthLabels = getMonthHeaders(heatmapDays);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Full Horizontal Width Container */}
      <div className="relative w-full max-w-[98vw] xl:max-w-[96vw] 2xl:max-w-[1680px] bg-slate-900 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[94vh] max-h-[94vh]">
        
        {/* Top Header & User Identity Banner */}
        <div className="relative p-5 sm:p-7 bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/90 border-b border-slate-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800 shadow-md z-10"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {githubData?.avatar_url || leetcodeData?.matchedUser?.profile?.userAvatar ? (
                  <img
                    src={githubData?.avatar_url || leetcodeData?.matchedUser?.profile?.userAvatar}
                    alt="Profile Avatar"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-purple-500/50 shadow-xl"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white text-2xl font-black shadow-xl border-2 border-purple-400/40">
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 shadow-md">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* User Meta */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                    {user?.user_metadata?.name || leetcodeData?.matchedUser?.profile?.realName || githubData?.name || 'SDETube Engineer'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-300 font-mono text-[10px] font-bold">
                    SDETUBE ENGINEER
                  </span>
                  {user?.email && (
                    <span className="text-xs text-slate-400 font-mono hidden md:inline truncate max-w-xs">
                      {user.email}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-1 max-w-3xl">
                  {linkedConfig.bio || 'Mastering algorithms, software architecture, and system design on SDETube.'}
                </p>

                {/* Handles & Credits Pill Row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2.5">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/50 border border-purple-700/50 text-purple-300 text-xs font-bold font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>{sdeStats.totalUniqueSolved} Solved</span>
                  </span>

                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs font-bold font-mono">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{sdeStats.currentStreak} Day Streak</span>
                  </span>

                  {onOpenWallet && (
                    <button
                      onClick={onOpenWallet}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/50 border border-emerald-700/60 text-emerald-300 hover:text-emerald-200 text-xs font-bold font-mono transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Wallet: ₹{wallet.balance.toFixed(2)}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-700/50">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Certification</p>
                  <p className="text-xs font-bold text-white">
                    {certificates.filter(c => c.isEligible).length > 0 ? `${certificates.filter(c => c.isEligible).length} Certified` : 'In Progress (≥90%)'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Responsive Full-Width Tabs) */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab('sdetube')}
            className={`px-4 sm:px-5 py-2.5 rounded-t-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'sdetube'
                ? 'bg-slate-900 text-purple-300 border-purple-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Activity className="w-4 h-4 text-purple-400" />
            <span>SDETube Alone</span>
          </button>

          <button
            onClick={() => setActiveTab('leetcode')}
            className={`px-4 sm:px-5 py-2.5 rounded-t-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'leetcode'
                ? 'bg-slate-900 text-amber-300 border-amber-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>LeetCode Live</span>
            {linkedConfig.leetcodeUsername && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('gfg')}
            className={`px-4 sm:px-5 py-2.5 rounded-t-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'gfg'
                ? 'bg-slate-900 text-emerald-300 border-emerald-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>GeeksforGeeks</span>
            {linkedConfig.gfgUsername && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('codeforces')}
            className={`px-4 sm:px-5 py-2.5 rounded-t-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'codeforces'
                ? 'bg-slate-900 text-sky-300 border-sky-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Zap className="w-4 h-4 text-sky-400" />
            <span>Codeforces</span>
            {linkedConfig.codeforcesHandle && (
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 sm:px-5 py-2.5 rounded-t-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'github'
                ? 'bg-slate-900 text-cyan-300 border-cyan-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Github className="w-4 h-4 text-cyan-400" />
            <span>GitHub Live</span>
            {linkedConfig.githubUsername && (
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('combined')}
            className={`px-4 sm:px-5 py-2.5 rounded-t-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'combined'
                ? 'bg-slate-900 text-indigo-300 border-indigo-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Combined Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 sm:px-5 py-2.5 rounded-t-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 whitespace-nowrap ml-auto ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-purple-300 border-purple-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>Link Handles</span>
          </button>
        </div>

        {/* Tab Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 1: SDETUBE ALONE (ONLY SDETUBE DATA, REAL STATS & HEATMAP)
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'sdetube' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Real Velocity Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>Total Solved</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-white font-mono">{sdeStats.totalUniqueSolved}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">problems</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>Submissions</span>
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-purple-300 font-mono">{sdeStats.totalSubmissions}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">runs</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>Accuracy</span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-cyan-300 font-mono">{sdeStats.acceptanceRate}%</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">acceptance</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>Current Streak</span>
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-amber-400 font-mono">{sdeStats.currentStreak}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">days</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>Max Streak</span>
                    <Trophy className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-indigo-300 font-mono">{sdeStats.maxStreak}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">days</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>Active Days</span>
                    <Calendar className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-pink-300 font-mono">{sdeStats.activeDaysCount}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">in 365d</span>
                  </div>
                </div>
              </div>

              {/* 364-Day Activity Heatmap */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800/90 shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <span>{sdeStats.totalSubmissions} SDETube Submissions & Practice Runs</span>
                    </h3>
                    <p className="text-xs text-slate-400">Live activity heatmap across all DSA sheets, SQL challenges, and coding workspaces</p>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-[3px] bg-slate-900 border border-slate-800" />
                    <div className="w-3 h-3 rounded-[3px] bg-purple-950 border border-purple-800" />
                    <div className="w-3 h-3 rounded-[3px] bg-purple-700" />
                    <div className="w-3 h-3 rounded-[3px] bg-purple-500" />
                    <div className="w-3 h-3 rounded-[3px] bg-purple-400 shadow-sm shadow-purple-400/50" />
                    <span>More</span>
                  </div>
                </div>

                {/* Heatmap 52-Week Grid with Month Headers */}
                <div className="overflow-x-auto pb-2 custom-scrollbar">
                  <div className="inline-flex flex-col gap-1 min-w-[760px]">
                    {/* Month header row */}
                    <div className="flex text-[10px] text-slate-500 font-mono pl-6 pb-1">
                      {monthLabels.map((m, idx) => (
                        <span key={idx} style={{ width: `${m.width}px` }} className="truncate">
                          {m.label}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-1.5">
                      {/* Day of week labels */}
                      <div className="flex flex-col justify-between text-[9px] text-slate-500 font-mono pr-1 h-[90px]">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                      </div>

                      {/* 52 Weeks Grid */}
                      <div className="flex gap-1">
                        {heatmapWeeks.map((week, wIdx) => (
                          <div key={wIdx} className="flex flex-col gap-1">
                            {week.map((day) => {
                              const levelClasses = [
                                'bg-slate-900/90 border border-slate-800/60',
                                'bg-purple-950/80 border border-purple-800/70',
                                'bg-purple-700 border border-purple-600',
                                'bg-purple-500 border border-purple-400',
                                'bg-purple-400 border border-purple-300 shadow-sm shadow-purple-400/60'
                              ];
                              return (
                                <div
                                  key={day.date}
                                  className={`w-3 h-3 rounded-[3px] transition-transform hover:scale-125 cursor-pointer ${levelClasses[day.level]}`}
                                  title={`${day.date}: ${day.count} submissions on SDETube`}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solved Breakdown by Difficulty & DSA Sheet Mastery Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Solved by Difficulty Breakdown */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800/90 shadow-xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span>Solved Problems by Difficulty</span>
                  </h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                      <p className="text-xs font-bold text-emerald-400 uppercase">Easy</p>
                      <p className="text-2xl font-black text-white font-mono">{sdeStats.easySolved}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Solved</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                      <p className="text-xs font-bold text-amber-400 uppercase">Medium</p>
                      <p className="text-2xl font-black text-white font-mono">{sdeStats.mediumSolved}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Solved</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                      <p className="text-xs font-bold text-rose-400 uppercase">Hard</p>
                      <p className="text-2xl font-black text-white font-mono">{sdeStats.hardSolved}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Solved</p>
                    </div>
                  </div>

                  {/* Progress Multi-Bar */}
                  <div className="space-y-2 pt-2">
                    <div className="w-full bg-slate-900 rounded-full h-3 flex overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                        style={{ width: `${sdeStats.totalUniqueSolved > 0 ? (sdeStats.easySolved / sdeStats.totalUniqueSolved) * 100 : 33}%` }}
                        title={`Easy: ${sdeStats.easySolved}`}
                      />
                      <div
                        className="bg-amber-500 h-full transition-all duration-500"
                        style={{ width: `${sdeStats.totalUniqueSolved > 0 ? (sdeStats.mediumSolved / sdeStats.totalUniqueSolved) * 100 : 33}%` }}
                        title={`Medium: ${sdeStats.mediumSolved}`}
                      />
                      <div
                        className="bg-rose-500 h-full rounded-r-full transition-all duration-500"
                        style={{ width: `${sdeStats.totalUniqueSolved > 0 ? (sdeStats.hardSolved / sdeStats.totalUniqueSolved) * 100 : 34}%` }}
                        title={`Hard: ${sdeStats.hardSolved}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Curated DSA Sheet Progress */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800/90 shadow-xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>DSA Sheets Completion</span>
                  </h4>

                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span>Striver SDE Sheet (191 Problems)</span>
                        <span className="font-mono text-indigo-400">{sdeSolvedCount} / 191 ({Math.round((sdeSolvedCount / 191) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (sdeSolvedCount / 191) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span>NeetCode Blind 75 Sheet</span>
                        <span className="font-mono text-purple-400">{blindSolvedCount} / 76 ({Math.round((blindSolvedCount / 76) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (blindSolvedCount / 76) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span>CodeStoryWithMIK Complete Sheet (177 Problems)</span>
                        <span className="font-mono text-pink-400">{mikSolvedCount} / 177 ({Math.round((mikSolvedCount / 177) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-pink-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (mikSolvedCount / 177) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Certificates Eligibility Section (≥90% Track Completion) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-indigo-950/40 border border-purple-500/30 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Verified Course Certificates & Milestones (≥90% Mastery)</span>
                    </h4>
                    <p className="text-xs text-slate-400">Complete 90% of problem solutions and lecture milestones in any track to unlock your verified certificate</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map((cert) => (
                    <div
                      key={cert.trackId}
                      className={`p-4 rounded-2xl border transition-all ${
                        cert.isEligible
                          ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{cert.category}</span>
                          <h5 className="text-xs font-bold text-white mt-0.5">{cert.title}</h5>
                        </div>
                        {cert.isEligible ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold">
                            UNLOCKED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                            {cert.percentage}%
                          </span>
                        )}
                      </div>

                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden my-3 border border-slate-800">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${cert.isEligible ? 'bg-emerald-400' : 'bg-purple-500'}`}
                          style={{ width: `${cert.percentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">{cert.solvedItems} / {cert.totalItems} completed</span>
                        {cert.isEligible ? (
                          <button
                            onClick={() => setSelectedCert(cert)}
                            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all cursor-pointer shadow-md"
                          >
                            View Certificate
                          </button>
                        ) : (
                          <span className="text-slate-500 font-mono">Need 90%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Recent SDETube Submissions Table */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800/90 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span>Real SDETube Submissions Log ({sdeStats.recentSubmissions.length})</span>
                  </h4>
                </div>

                {sdeStats.recentSubmissions.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-2">
                    <Code2 className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs font-bold text-slate-300">No Submissions Recorded Yet</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Solve any problem in the LeetCode or SQL workspace, and your execution verdicts will automatically appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                          <th className="pb-3 font-bold">Problem Title</th>
                          <th className="pb-3 font-bold">Category</th>
                          <th className="pb-3 font-bold">Language</th>
                          <th className="pb-3 font-bold">Verdict</th>
                          <th className="pb-3 font-bold text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {sdeStats.recentSubmissions.slice(0, 15).map((sub) => {
                          const isAc = sub.status === 'Accepted';
                          return (
                            <tr key={sub.id} className="hover:bg-slate-900/60 transition-colors">
                              <td className="py-3 font-bold text-slate-200 truncate max-w-xs">{sub.title}</td>
                              <td className="py-3 text-slate-400">{sub.category}</td>
                              <td className="py-3">
                                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-indigo-300 font-mono text-[10px] font-bold">
                                  {sub.language}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                  isAc
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                                    : 'bg-rose-950 text-rose-300 border border-rose-800/80'
                                }`}>
                                  {sub.status}
                                </span>
                              </td>
                              <td className="py-3 text-right text-slate-400 font-mono text-[11px]">{sub.timeFormatted}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 2: LEETCODE LIVE GRAPHQL PROFILE (ONLY LEETCODE DATA)
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'leetcode' && (
            <div className="space-y-6 animate-fadeIn">
              {!linkedConfig.leetcodeUsername ? (
                <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-950/60 border border-amber-700/60 flex items-center justify-center text-amber-400">
                    <Code2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">No LeetCode Handle Linked</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Link your LeetCode username in the settings tab to view live GraphQL statistics, contest ratings, and badges.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-900/30"
                  >
                    Link LeetCode Username
                  </button>
                </div>
              ) : isLoadingLC ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 mx-auto text-amber-400 animate-spin" />
                  <p className="text-xs text-slate-400 font-mono">Fetching full GraphQL profile from LeetCode...</p>
                </div>
              ) : lcError ? (
                <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center space-y-3">
                  <p className="text-sm font-bold text-rose-300">{lcError}</p>
                  <button
                    onClick={() => loadLeetcode(linkedConfig.leetcodeUsername)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    Retry Fetch
                  </button>
                </div>
              ) : leetcodeData?.matchedUser ? (
                <div className="space-y-6">
                  
                  {/* LeetCode Bio Header */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={leetcodeData.matchedUser.profile.userAvatar}
                        alt="LeetCode Avatar"
                        className="w-16 h-16 rounded-2xl object-cover border border-amber-500/50 shadow-md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">
                            {leetcodeData.matchedUser.profile.realName || leetcodeData.matchedUser.username}
                          </h3>
                          <span className="text-xs text-amber-400 font-mono">(@{leetcodeData.matchedUser.username})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Global Ranking: <strong className="text-slate-200 font-mono">#{leetcodeData.matchedUser.profile.ranking?.toLocaleString()}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Reputation: {leetcodeData.matchedUser.profile.reputation}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`https://leetcode.com/${leetcodeData.matchedUser.username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-2xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all"
                    >
                      <span>Open on LeetCode</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Problem Solving Breakdown */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-amber-400" />
                      <span>LeetCode Problems Solved</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {leetcodeData.matchedUser.submitStats?.acSubmissionNum
                        .filter(item => item.difficulty !== 'All')
                        .map((item) => {
                          const isEasy = item.difficulty === 'Easy';
                          const isMed = item.difficulty === 'Medium';
                          const color = isEasy ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' : isMed ? 'text-amber-400 border-amber-500/40 bg-amber-950/30' : 'text-rose-400 border-rose-500/40 bg-rose-950/30';
                          return (
                            <div key={item.difficulty} className={`p-4 rounded-2xl border ${color} space-y-1`}>
                              <p className="text-xs font-bold uppercase tracking-wider">{item.difficulty}</p>
                              <p className="text-2xl font-black font-mono">{item.count} <span className="text-xs text-slate-400 font-normal">solved</span></p>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Contest Performance (ONLY if present) */}
                  {leetcodeData.userContestRanking && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-indigo-950/40 border border-amber-500/30 space-y-3">
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Contest Performance</span>
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <p className="text-[10px] text-slate-400">Contest Rating</p>
                          <p className="text-lg font-black text-amber-300 font-mono">{Math.round(leetcodeData.userContestRanking.rating)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <p className="text-[10px] text-slate-400">Global Rank</p>
                          <p className="text-lg font-black text-white font-mono">#{leetcodeData.userContestRanking.globalRanking?.toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <p className="text-[10px] text-slate-400">Top Percentage</p>
                          <p className="text-lg font-black text-emerald-400 font-mono">{leetcodeData.userContestRanking.topPercentage}%</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <p className="text-[10px] text-slate-400">Contests Attended</p>
                          <p className="text-lg font-black text-purple-300 font-mono">{leetcodeData.userContestRanking.attendedContestsCount}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Earned Badges (ONLY if present) */}
                  {Array.isArray(leetcodeData?.matchedUser?.badges) && leetcodeData.matchedUser.badges.length > 0 && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Medal className="w-4 h-4 text-purple-400" />
                        <span>Earned Badges ({leetcodeData.matchedUser.badges.length})</span>
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        {(leetcodeData.matchedUser.badges || []).map((badge) => {
                          const iconUrl = badge.icon.startsWith('http') ? badge.icon : `https://leetcode.com${badge.icon}`;
                          return (
                            <div key={badge.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1.5 w-24 text-center shadow-md">
                              <img src={iconUrl} alt={badge.name} className="w-12 h-12 object-contain" />
                              <p className="text-[10px] font-bold text-slate-300 truncate w-full" title={badge.name}>{badge.name}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Languages Breakdown (ONLY if present) */}
                  {Array.isArray(leetcodeData?.matchedUser?.languageProblemCount) && leetcodeData.matchedUser.languageProblemCount.length > 0 && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <span>Languages Breakdown</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(leetcodeData.matchedUser.languageProblemCount || []).map((lang) => (
                          <div key={lang.languageName} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono flex items-center gap-2">
                            <span className="font-bold text-slate-200">{lang.languageName}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-950 text-emerald-400 text-[10px] font-bold">{lang.problemsSolved}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Submissions (ONLY if present) */}
                  {Array.isArray(leetcodeData?.recentSubmissionList) && leetcodeData.recentSubmissionList.length > 0 && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        <span>Recent LeetCode Submissions</span>
                      </h4>
                      <div className="space-y-2">
                        {(leetcodeData.recentSubmissionList || []).map((sub, idx) => {
                          const isAc = sub.statusDisplay === 'Accepted';
                          return (
                            <div key={idx} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isAc ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                                  {sub.statusDisplay}
                                </span>
                                <span className="font-bold text-slate-200 truncate">{sub.title}</span>
                              </div>
                              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px] flex-shrink-0">
                                <span className="px-2 py-0.5 rounded bg-slate-950 text-indigo-300">{sub.lang}</span>
                                <span className="hidden sm:inline">{new Date(parseInt(sub.timestamp) * 1000).toLocaleDateString()}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 3: GEEKSFORGEEKS SCRAPED PROFILE
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'gfg' && (
            <div className="space-y-6 animate-fadeIn">
              {!linkedConfig.gfgUsername ? (
                <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">No GeeksforGeeks Handle Linked</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Link your GeeksforGeeks username in the settings tab to view your coding scores, problems solved, streak, and institute rankings.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-900/30"
                  >
                    Link GFG Username
                  </button>
                </div>
              ) : isLoadingGFG ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 mx-auto text-emerald-400 animate-spin" />
                  <p className="text-xs text-slate-400 font-mono">Fetching profile from GeeksforGeeks...</p>
                </div>
              ) : gfgError ? (
                <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center space-y-3">
                  <p className="text-sm font-bold text-rose-300">{gfgError}</p>
                  <button
                    onClick={() => loadGFG(linkedConfig.gfgUsername || '')}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    Retry Fetch
                  </button>
                </div>
              ) : gfgData ? (
                <div className="space-y-6">
                  {/* GFG Header Card */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {gfgData.avatar ? (
                        <img
                          src={gfgData.avatar}
                          alt="GFG Avatar"
                          className="w-16 h-16 rounded-2xl object-cover border border-emerald-500/50 shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400 font-black text-xl">
                          {(gfgData.name || gfgData.username || 'G').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">
                            {gfgData.name || gfgData.username}
                          </h3>
                          <span className="text-xs text-emerald-400 font-mono">(@{gfgData.username})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Institute Rank: <strong className="text-slate-200 font-mono">{gfgData.institute_rank && gfgData.institute_rank !== 'N/A' ? `#${gfgData.institute_rank}` : 'N/A'}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Organization: {gfgData.organization || 'GeeksforGeeks'}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`https://www.geeksforgeeks.org/user/${gfgData.username}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all"
                    >
                      <span>Open on GeeksforGeeks</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* GFG Statistics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>Problems Solved</span>
                      </p>
                      <p className="text-2xl font-black text-white font-mono">{gfgData.total_problems_solved || 0}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Coding Score</span>
                      </p>
                      <p className="text-2xl font-black text-amber-300 font-mono">{gfgData.coding_score || gfgData.overall_score || 0}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-rose-400" />
                        <span>POTD Streak</span>
                      </p>
                      <p className="text-2xl font-black text-rose-300 font-mono">{gfgData.streak || 0} <span className="text-xs text-slate-500">Days</span></p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-sky-400" />
                        <span>Monthly Score</span>
                      </p>
                      <p className="text-2xl font-black text-sky-300 font-mono">{gfgData.monthly_score || 0}</p>
                    </div>
                  </div>

                  {/* Difficulty Breakdown (if available) */}
                  {gfgData.difficulty && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-400" />
                        <span>GFG Difficulty Breakdown</span>
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                          <p className="text-[10px] font-bold text-emerald-400 uppercase">Easy</p>
                          <p className="text-xl font-black text-white font-mono">{gfgData.difficulty.easy || 0}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30">
                          <p className="text-[10px] font-bold text-amber-400 uppercase">Medium</p>
                          <p className="text-xl font-black text-white font-mono">{gfgData.difficulty.medium || 0}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30">
                          <p className="text-[10px] font-bold text-rose-400 uppercase">Hard</p>
                          <p className="text-xl font-black text-white font-mono">{gfgData.difficulty.hard || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 4: CODEFORCES API PROFILE
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'codeforces' && (
            <div className="space-y-6 animate-fadeIn">
              {!linkedConfig.codeforcesHandle ? (
                <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-950/60 border border-sky-700/60 flex items-center justify-center text-sky-400">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">No Codeforces Handle Linked</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Link your Codeforces handle in the settings tab to view your official rating, rank titles, and accepted submissions.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-sky-900/30"
                  >
                    Link Codeforces Handle
                  </button>
                </div>
              ) : isLoadingCF ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 mx-auto text-sky-400 animate-spin" />
                  <p className="text-xs text-slate-400 font-mono">Fetching profile from Codeforces API...</p>
                </div>
              ) : cfError ? (
                <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center space-y-3">
                  <p className="text-sm font-bold text-rose-300">{cfError}</p>
                  <button
                    onClick={() => loadCodeforces(linkedConfig.codeforcesHandle || '')}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    Retry Fetch
                  </button>
                </div>
              ) : codeforcesData ? (
                <div className="space-y-6">
                  {/* Codeforces Header Card */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {codeforcesData.avatar ? (
                        <img
                          src={codeforcesData.avatar}
                          alt="Codeforces Avatar"
                          className="w-16 h-16 rounded-2xl object-cover border border-sky-500/50 shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-sky-950 border border-sky-600/50 flex items-center justify-center text-sky-400 font-black text-xl">
                          {(codeforcesData.handle || 'C').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">
                            {codeforcesData.firstName ? `${codeforcesData.firstName} ${codeforcesData.lastName || ''}` : codeforcesData.handle}
                          </h3>
                          <span className="text-xs text-sky-400 font-mono">(@{codeforcesData.handle})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">
                          Rank: <strong className="text-sky-300 font-bold">{codeforcesData.rank || 'Unrated'}</strong> (Max: {codeforcesData.maxRank || 'Unrated'})
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {codeforcesData.organization || 'Competitive Programmer'} {codeforcesData.city ? `• ${codeforcesData.city}` : ''}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`https://codeforces.com/profile/${codeforcesData.handle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-2xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center gap-2 transition-all"
                    >
                      <span>Open on Codeforces</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Codeforces Statistics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-sky-400" />
                        <span>Current Rating</span>
                      </p>
                      <p className="text-2xl font-black text-white font-mono">{codeforcesData.rating || 0}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Max Rating</span>
                      </p>
                      <p className="text-2xl font-black text-amber-300 font-mono">{codeforcesData.maxRating || 0}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Problems Solved</span>
                      </p>
                      <p className="text-2xl font-black text-emerald-300 font-mono">{codeforcesData.total_problems_solved || 0}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-purple-400" />
                        <span>Contribution</span>
                      </p>
                      <p className="text-2xl font-black text-purple-300 font-mono">{codeforcesData.contribution || 0}</p>
                    </div>
                  </div>

                  {/* Difficulty Breakdown */}
                  {codeforcesData.difficulty_breakdown && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-sky-400" />
                        <span>Rating Tier Difficulty Breakdown</span>
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                          <p className="text-[10px] font-bold text-emerald-400 uppercase">Div 3 / Easy (≤1200)</p>
                          <p className="text-xl font-black text-white font-mono">{codeforcesData.difficulty_breakdown.easy || 0}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30">
                          <p className="text-[10px] font-bold text-amber-400 uppercase">Div 2 / Medium (1201-1700)</p>
                          <p className="text-xl font-black text-white font-mono">{codeforcesData.difficulty_breakdown.medium || 0}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30">
                          <p className="text-[10px] font-bold text-rose-400 uppercase">Div 1 / Hard (&gt;1700)</p>
                          <p className="text-xl font-black text-white font-mono">{codeforcesData.difficulty_breakdown.hard || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 5: GITHUB LIVE PROFILE (ONLY GITHUB DATA)
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'github' && (
            <div className="space-y-6 animate-fadeIn">
              {!linkedConfig.githubUsername ? (
                <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
                    <Github className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">No GitHub Handle Linked</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Link your GitHub username in the settings tab to view your public repositories, contributions, and follower metrics.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer shadow-lg"
                  >
                    Link GitHub Username
                  </button>
                </div>
              ) : isLoadingGH ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 mx-auto text-cyan-400 animate-spin" />
                  <p className="text-xs text-slate-400 font-mono">Fetching live profile from GitHub API...</p>
                </div>
              ) : ghError ? (
                <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center space-y-3">
                  <p className="text-sm font-bold text-rose-300">{ghError}</p>
                  <button
                    onClick={() => loadGithub(linkedConfig.githubUsername || '')}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    Retry Fetch
                  </button>
                </div>
              ) : githubData ? (
                <div className="space-y-6">
                  {/* GitHub Bio Header */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={githubData.avatar_url}
                        alt="GitHub Avatar"
                        className="w-16 h-16 rounded-2xl object-cover border border-cyan-500/50 shadow-md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">
                            {githubData.name || githubData.login}
                          </h3>
                          <span className="text-xs text-cyan-400 font-mono">(@{githubData.login})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 max-w-md">
                          {githubData.bio || 'Software Engineer on GitHub'}
                        </p>
                        {githubData.location && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                            <Globe className="w-3 h-3" />
                            <span>{githubData.location}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <a
                      href={githubData.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-2xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-all"
                    >
                      <span>Open on GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* GitHub Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        <FolderGit2 className="w-4 h-4 text-cyan-400" />
                        <span>Public Repos</span>
                      </p>
                      <p className="text-2xl font-black text-white font-mono">{githubData.public_repos}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        <User className="w-4 h-4 text-indigo-400" />
                        <span>Followers</span>
                      </p>
                      <p className="text-2xl font-black text-white font-mono">{githubData.followers}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        <User className="w-4 h-4 text-purple-400" />
                        <span>Following</span>
                      </p>
                      <p className="text-2xl font-black text-white font-mono">{githubData.following}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-pink-400" />
                        <span>Public Gists</span>
                      </p>
                      <p className="text-2xl font-black text-white font-mono">{githubData.public_gists}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 6: COMBINED 360° DEVELOPER OVERVIEW (SDETUBE + LEETCODE + GFG + CODEFORCES + GITHUB)
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'combined' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-950 to-indigo-950/60 border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-400" />
                    <span>Combined Engineering Portfolio</span>
                  </h3>
                  <p className="text-xs text-slate-400">Unified multi-platform view across SDETube, LeetCode, GeeksforGeeks, Codeforces, and GitHub</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {/* SDETube Column */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span>SDETube Platform</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Local Verified</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Problems Solved:</span>
                        <span className="font-bold text-white font-mono">{sdeStats.totalUniqueSolved}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Current Streak:</span>
                        <span className="font-bold text-amber-400 font-mono">{sdeStats.currentStreak} Days</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Accuracy:</span>
                        <span className="font-bold text-emerald-400 font-mono">{sdeStats.acceptanceRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* LeetCode Column */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-amber-400" />
                        <span>LeetCode GraphQL</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {linkedConfig.leetcodeUsername ? `@${linkedConfig.leetcodeUsername}` : 'Not linked'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Global Ranking:</span>
                        <span className="font-bold text-white font-mono">
                          {leetcodeData?.matchedUser?.profile?.ranking ? `#${leetcodeData.matchedUser.profile.ranking.toLocaleString()}` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Contest Rating:</span>
                        <span className="font-bold text-amber-300 font-mono">
                          {leetcodeData?.userContestRanking?.rating ? Math.round(leetcodeData.userContestRanking.rating) : 'Unrated'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Total Solved:</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {leetcodeData?.matchedUser?.submitStats?.acSubmissionNum?.find(s => s.difficulty === 'All')?.count || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* GeeksforGeeks Column */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>GeeksforGeeks</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {linkedConfig.gfgUsername ? `@${linkedConfig.gfgUsername}` : 'Not linked'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Coding Score:</span>
                        <span className="font-bold text-emerald-300 font-mono">{gfgData?.coding_score || gfgData?.overall_score || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Institute Rank:</span>
                        <span className="font-bold text-white font-mono">{gfgData?.institute_rank && gfgData.institute_rank !== 'N/A' ? `#${gfgData.institute_rank}` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Problems Solved:</span>
                        <span className="font-bold text-emerald-400 font-mono">{gfgData?.total_problems_solved || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Codeforces Column */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-sky-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-sky-400" />
                        <span>Codeforces API</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {linkedConfig.codeforcesHandle ? `@${linkedConfig.codeforcesHandle}` : 'Not linked'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Current Rating:</span>
                        <span className="font-bold text-sky-300 font-mono">{codeforcesData?.rating || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Rank Title:</span>
                        <span className="font-bold text-white font-mono capitalize">{codeforcesData?.rank || 'Unrated'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Problems Solved:</span>
                        <span className="font-bold text-emerald-400 font-mono">{codeforcesData?.total_problems_solved || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* GitHub Column */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                        <Github className="w-4 h-4 text-cyan-400" />
                        <span>GitHub Profile</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {linkedConfig.githubUsername ? `@${linkedConfig.githubUsername}` : 'Not linked'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Public Repos:</span>
                        <span className="font-bold text-white font-mono">{githubData?.public_repos ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Followers:</span>
                        <span className="font-bold text-cyan-300 font-mono">{githubData?.followers ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Location:</span>
                        <span className="font-bold text-slate-200 truncate">{githubData?.location || 'Global'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 7: SETTINGS & LINK HANDLES
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-5 animate-fadeIn max-w-xl">
              <div>
                <h3 className="text-sm font-bold text-white">Configure Developer Handles</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Link your LeetCode, GeeksforGeeks, Codeforces, and GitHub profiles to showcase live metrics and stats across platforms.
                </p>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile handles successfully updated!</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>LeetCode Username</span>
                  </label>
                  <input
                    type="text"
                    value={lcInput}
                    onChange={(e) => setLcInput(e.target.value)}
                    placeholder="e.g. your_leetcode_username"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:border-amber-500 focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Directly queries LeetCode's comprehensive GraphQL API.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>GeeksforGeeks Username</span>
                  </label>
                  <input
                    type="text"
                    value={gfgInput}
                    onChange={(e) => setGfgInput(e.target.value)}
                    placeholder="e.g. ayush_sharma or sandeep_jain"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Scrapes coding score, institute rank, POTD streak, and solved counts.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-sky-400" />
                    <span>Codeforces Handle</span>
                  </label>
                  <input
                    type="text"
                    value={cfInput}
                    onChange={(e) => setCfInput(e.target.value)}
                    placeholder="e.g. tourist or Benq"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:border-sky-500 focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Fetches official rating, rank title, and submissions via Codeforces API.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-cyan-400" />
                    <span>GitHub Username</span>
                  </label>
                  <input
                    type="text"
                    value={ghInput}
                    onChange={(e) => setGhInput(e.target.value)}
                    placeholder="e.g. torvalds or gaearon"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Cloud Code Auto-Sync Setting */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-950/60 to-cyan-950/40 border border-indigo-700/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
                        <Cloud className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">Cloud Code Auto-Sync</span>
                          <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-700/50 text-[10px] font-mono font-bold text-cyan-300">
                            ₹0.05 / sync
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Automatically backup and sync editor code changes directly to Cloudflare R2 cloud storage.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                      <input
                        type="checkbox"
                        checked={autoSyncInput}
                        onChange={(e) => setAutoSyncInput(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 shadow-inner"></div>
                    </label>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span>Charges stated in platform billing: <strong>5 paise (₹0.05)</strong> per debounced sync.</span>
                    <span className={autoSyncInput ? "text-cyan-400 font-bold" : "text-slate-500"}>
                      Status: {autoSyncInput ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    <span>Developer Bio</span>
                  </label>
                  <textarea
                    rows={3}
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    placeholder="Tell other engineers about your tech stack and DSA target..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-purple-500 focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Save & Sync Profiles</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* Verified Certificate Viewer Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header */}
            <div className="text-center space-y-2 border-b border-slate-800 pb-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
                <Award className="w-8 h-8" />
              </div>
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">SDETube Verified Certification</p>
              <h3 className="text-2xl font-black text-white">Certificate of Algorithmic Mastery</h3>
              <p className="text-xs text-slate-400">Awarded for completing 90%+ of problem challenges and coursework</p>
            </div>

            {/* Certificate Body */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
              <p className="text-xs text-slate-400">This is to certify that</p>
              <h4 className="text-xl font-black text-purple-300">
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'SDETube Student'}
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                has successfully demonstrated proficiency in <strong>{selectedCert.title}</strong> by solving {selectedCert.solvedItems} of {selectedCert.totalItems} questions ({selectedCert.percentage}%).
              </p>
              <div className="pt-2">
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-mono">
                  Verification Code: {selectedCert.verificationCode}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Certificate</span>
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper: Generates 364 days array for heatmap
function generateHeatmapDays(stats: SDETubeRealStats): Array<{ date: string; count: number; level: number }> {
  const today = new Date();
  const dateCounts: Record<string, number> = {};

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('edustream_submissions_') || key.startsWith('edustream_sql_submissions_'))) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            list.forEach((sub: any) => {
              const str = String(sub.timestamp || sub.id?.split('_')[0]);
              let ymd = str.slice(0, 10);
              if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
                const d = new Date(sub.timestamp || Date.now());
                if (!isNaN(d.getTime())) ymd = d.toISOString().slice(0, 10);
              }
              dateCounts[ymd] = (dateCounts[ymd] || 0) + 1;
            });
          }
        }
      }
    }
  } catch {}

  const result: Array<{ date: string; count: number; level: number }> = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = dateCounts[dateStr] || 0;

    let level = 0;
    if (count >= 6) level = 4;
    else if (count >= 4) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;

    result.push({ date: dateStr, count, level });
  }

  return result;
}

// Helper: Computes Month labels header for 52-week heatmap
function getMonthHeaders(days: Array<{ date: string }>): Array<{ label: string; width: number }> {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const headers: Array<{ label: string; width: number }> = [];
  let currentMonth = -1;
  let weekCount = 0;

  for (let i = 0; i < days.length; i += 7) {
    const d = new Date(days[i].date);
    const m = d.getMonth();
    if (m !== currentMonth) {
      if (currentMonth !== -1) {
        headers.push({ label: months[currentMonth], width: weekCount * 14 });
      }
      currentMonth = m;
      weekCount = 1;
    } else {
      weekCount++;
    }
  }
  if (currentMonth !== -1) {
    headers.push({ label: months[currentMonth], width: weekCount * 14 });
  }

  return headers;
}

