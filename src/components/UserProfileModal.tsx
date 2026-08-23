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
  BookmarkCheck
} from 'lucide-react';
import {
  LeetCodeFullProfileData,
  GitHubProfileData,
  getLinkedProfiles,
  saveLinkedProfiles,
  fetchLeetCodeFullProfile,
  fetchGitHubProfile,
  generateUserSubmissionHeatmap,
  LinkedProfilesConfig
} from '../lib/userProfileService';
import { getUserWallet } from '../lib/billing';

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
  const [activeTab, setActiveTab] = useState<'sdetube' | 'leetcode' | 'github' | 'settings'>('sdetube');
  const [linkedConfig, setLinkedConfig] = useState<LinkedProfilesConfig>(() => getLinkedProfiles(user?.email));
  const [leetcodeData, setLeetcodeData] = useState<LeetCodeFullProfileData | null>(null);
  const [githubData, setGithubData] = useState<GitHubProfileData | null>(null);
  const [isLoadingLC, setIsLoadingLC] = useState<boolean>(false);
  const [isLoadingGH, setIsLoadingGH] = useState<boolean>(false);
  const [lcError, setLcError] = useState<string | null>(null);
  const [ghError, setGhError] = useState<string | null>(null);
  
  // Settings Form
  const [lcInput, setLcInput] = useState(linkedConfig.leetcodeUsername || '');
  const [ghInput, setGhInput] = useState(linkedConfig.githubUsername || '');
  const [bioInput, setBioInput] = useState(linkedConfig.bio || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const wallet = useMemo(() => getUserWallet(user?.email), [user?.email]);
  const heatmap = useMemo(() => generateUserSubmissionHeatmap(), [isOpen]);

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
      setGhInput(cfg.githubUsername || '');
      setBioInput(cfg.bio || '');

      if (cfg.leetcodeUsername) loadLeetcode(cfg.leetcodeUsername);
      if (cfg.githubUsername) loadGithub(cfg.githubUsername);
    }
  }, [isOpen, user?.email]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: LinkedProfilesConfig = {
      leetcodeUsername: lcInput.trim(),
      githubUsername: ghInput.trim(),
      bio: bioInput.trim()
    };
    setLinkedConfig(updated);
    saveLinkedProfiles(updated, user?.email);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    if (updated.leetcodeUsername) loadLeetcode(updated.leetcodeUsername);
    if (updated.githubUsername) loadGithub(updated.githubUsername);
  };

  if (!isOpen) return null;

  // Compute Solved counts across local storage sheets
  const sdeSolvedCount = (JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_sde') || '[]') as any[]).length;
  const a2zSolvedCount = (JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_a2z') || '[]') as any[]).length;
  const fast79SolvedCount = (JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_79') || '[]') as any[]).length;
  const blindSolvedCount = (JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_blind75') || '[]') as any[]).length;
  const mikSolvedCount = (JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_mik') || '[]') as any[]).length;
  const totalLocalSolved = sdeSolvedCount + a2zSolvedCount + fast79SolvedCount + blindSolvedCount + mikSolvedCount;

  // Month labels helper for 52-week heatmap
  const weeks = [];
  for (let i = 0; i < heatmap.days.length; i += 7) {
    weeks.push(heatmap.days.slice(i, i + 7));
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] custom-scrollbar">
        
        {/* Top Header & User Identity Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800 shadow-md"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              {githubData?.avatar_url || leetcodeData?.matchedUser?.profile?.userAvatar ? (
                <img
                  src={githubData?.avatar_url || leetcodeData?.matchedUser?.profile?.userAvatar}
                  alt="Profile Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/50 shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white text-2xl font-black shadow-xl border-2 border-purple-400/40">
                  {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 shadow-md">
                <Trophy className="w-4 h-4" />
              </div>
            </div>

            {/* User Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {user?.user_metadata?.name || leetcodeData?.matchedUser?.profile?.realName || githubData?.name || 'SDETube Engineer'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono text-[10px] font-bold">
                  PRO DEVELOPER
                </span>
                {user?.email && (
                  <span className="text-xs text-slate-400 font-mono hidden md:inline truncate max-w-xs">
                    {user.email}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {linkedConfig.bio || leetcodeData?.matchedUser?.profile?.aboutMe || githubData?.bio || 'Crafting scalable software architectures and mastering algorithms on SDETube.'}
              </p>

              {/* Handles & Credits Pill Row */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {linkedConfig.leetcodeUsername && (
                  <a
                    href={`https://leetcode.com/${linkedConfig.leetcodeUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 hover:text-amber-200 text-xs font-bold font-mono transition-all"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>@{linkedConfig.leetcodeUsername}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}

                {linkedConfig.githubUsername && (
                  <a
                    href={`https://github.com/${linkedConfig.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold font-mono transition-all"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>@{linkedConfig.githubUsername}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}

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
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sdetube')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'sdetube'
                ? 'bg-slate-900 text-purple-300 border-purple-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Activity className="w-4 h-4 text-purple-400" />
            <span>SDETube Heatmap & Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('leetcode')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'leetcode'
                ? 'bg-slate-900 text-amber-300 border-amber-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>LeetCode Live Profile</span>
            {linkedConfig.leetcodeUsername && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'github'
                ? 'bg-slate-900 text-cyan-300 border-cyan-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Github className="w-4 h-4 text-cyan-400" />
            <span>GitHub Live Profile</span>
            {linkedConfig.githubUsername && (
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-indigo-300 border-indigo-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>Link Handles</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

          {/* ═══════════ TAB 1: SDETUBE ACTIVITY & 365-DAY HEATMAP ═══════════ */}
          {activeTab === 'sdetube' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Quick Velocity Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>Total Solved</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-white font-mono">{totalLocalSolved}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">questions</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>Current Streak</span>
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-amber-400 font-mono">{heatmap.currentStreak}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">days streak</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>Max Streak</span>
                    <Trophy className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-purple-300 font-mono">{heatmap.maxStreak}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">days</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>Active Days</span>
                    <Calendar className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-cyan-300 font-mono">{heatmap.activeDaysCount}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">in 365 days</span>
                  </div>
                </div>
              </div>

              {/* 365-Day Interactive Activity Heatmap Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800/90 shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>{heatmap.totalSubmissions || totalLocalSolved} submissions in the last year</span>
                    </h3>
                    <p className="text-xs text-slate-500">Every code execution, accepted solution, and problem solved on SDETube</p>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>Less</span>
                    <div className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-slate-800" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-950 border border-emerald-800" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-700" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    <span>More</span>
                  </div>
                </div>

                {/* Heatmap Grid Container */}
                <div className="overflow-x-auto pb-2 custom-scrollbar">
                  <div className="inline-flex flex-col gap-1 min-w-[700px]">
                    <div className="flex gap-1">
                      {weeks.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-1">
                          {week.map((day) => {
                            const levelClasses = [
                              'bg-slate-900/90 border border-slate-800/60',
                              'bg-emerald-950/80 border border-emerald-800/70',
                              'bg-emerald-700 border border-emerald-600',
                              'bg-emerald-500 border border-emerald-400',
                              'bg-emerald-400 border border-emerald-300 shadow-sm shadow-emerald-400/60'
                            ];
                            return (
                              <div
                                key={day.date}
                                className={`w-3 h-3 rounded-[3px] transition-transform hover:scale-125 cursor-pointer ${levelClasses[day.level]}`}
                                title={`${day.date}: ${day.count} submissions`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sheet Progress Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>Striver SDE Sheet</span>
                    </span>
                    <span className="font-mono text-indigo-400">{sdeSolvedCount} / 191</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (sdeSolvedCount / 191) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <BookmarkCheck className="w-4 h-4 text-purple-400" />
                      <span>Blind 75 Sheet</span>
                    </span>
                    <span className="font-mono text-purple-400">{blindSolvedCount} / 76</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (blindSolvedCount / 76) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-pink-400" />
                      <span>CodeStoryWithMIK</span>
                    </span>
                    <span className="font-mono text-pink-400">{mikSolvedCount} / 177</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (mikSolvedCount / 177) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 2: LEETCODE LIVE GRAPHQL PROFILE ═══════════ */}
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
                      Link your LeetCode username in the settings tab to view full GraphQL stats, contest ratings, badges, and recent submissions.
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

                  {/* Problem Solving Counts */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-amber-400" />
                      <span>Problems Solved Breakdown</span>
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

                  {/* Contest Ranking */}
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

                  {/* Badges */}
                  {leetcodeData.matchedUser.badges && leetcodeData.matchedUser.badges.length > 0 && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Medal className="w-4 h-4 text-purple-400" />
                        <span>Earned Badges ({leetcodeData.matchedUser.badges.length})</span>
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        {leetcodeData.matchedUser.badges.map((badge) => {
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

                  {/* Languages Used */}
                  {leetcodeData.matchedUser.languageProblemCount && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <span>Languages Breakdown</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {leetcodeData.matchedUser.languageProblemCount.map((lang) => (
                          <div key={lang.languageName} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono flex items-center gap-2">
                            <span className="font-bold text-slate-200">{lang.languageName}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-950 text-emerald-400 text-[10px] font-bold">{lang.problemsSolved}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Submissions */}
                  {leetcodeData.recentSubmissionList && leetcodeData.recentSubmissionList.length > 0 && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        <span>Recent LeetCode Submissions</span>
                      </h4>
                      <div className="space-y-2">
                        {leetcodeData.recentSubmissionList.map((sub, idx) => {
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

          {/* ═══════════ TAB 3: GITHUB LIVE PROFILE ═══════════ */}
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
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-900/30"
                  >
                    Link GitHub Username
                  </button>
                </div>
              ) : isLoadingGH ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 mx-auto text-cyan-400 animate-spin" />
                  <p className="text-xs text-slate-400 font-mono">Fetching GitHub profile...</p>
                </div>
              ) : ghError ? (
                <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center space-y-3">
                  <p className="text-sm font-bold text-rose-300">{ghError}</p>
                  <button
                    onClick={() => loadGithub(linkedConfig.githubUsername)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    Retry Fetch
                  </button>
                </div>
              ) : githubData ? (
                <div className="space-y-6">
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={githubData.avatar_url}
                        alt="GitHub Avatar"
                        className="w-16 h-16 rounded-2xl object-cover border border-cyan-500/50 shadow-md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{githubData.name || githubData.login}</h3>
                          <span className="text-xs text-cyan-400 font-mono">(@{githubData.login})</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{githubData.bio || 'GitHub Contributor'}</p>
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

                  {/* GitHub Metrics */}
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

          {/* ═══════════ TAB 4: SETTINGS & LINK HANDLES ═══════════ */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-5 animate-fadeIn max-w-xl">
              <div>
                <h3 className="text-sm font-bold text-white">Configure Developer Handles</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Link your LeetCode and GitHub profiles to showcase live metrics, badges, and contest stats.
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
                    placeholder="e.g. tour_de_force or neal_wu"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:border-amber-500 focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Directly queries LeetCode's comprehensive GraphQL API.</p>
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
    </div>
  );
};
