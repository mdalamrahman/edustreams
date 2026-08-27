import React, { useState, useEffect, useMemo } from 'react';
import {
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
  ShieldCheck,
  Edit3,
  Share2,
  Download,
  BookOpen,
  ArrowRight,
  Eye,
  Check,
  Linkedin,
  MapPin,
  Lock,
  ChevronRight,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Coins
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
  generateUserSubmissionHeatmap,
  getUserBadges,
  getUserTracksCertificates,
  getUserRecentSubmissions,
  LinkedProfilesConfig,
  SDETubeBadge,
  TrackCertificateProgress,
  UserSubmissionRecord
} from '../lib/userProfileService';
import {
  getUserWallet,
  getUserTransactions,
  getAllTopupRequests,
  BillingTransaction,
  TopupRequest
} from '../lib/billing';
import { CertificateModal, CertificateData } from './CertificateModal';

interface DeveloperProfilePageProps {
  user: any;
  onOpenProblem?: (problemIdOrName: string) => void;
  onOpenWallet?: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export type ProfileSectionMode = 'combined' | 'sdetube' | 'leetcode' | 'github' | 'gfg' | 'codeforces';

export const DeveloperProfilePage: React.FC<DeveloperProfilePageProps> = ({
  user,
  onOpenProblem,
  onOpenWallet,
  onNavigateToTab
}) => {
  const [profileMode, setProfileMode] = useState<ProfileSectionMode>('combined');
  const [linkedConfig, setLinkedConfig] = useState<LinkedProfilesConfig>(() => getLinkedProfiles(user?.email));
  const [leetcodeData, setLeetcodeData] = useState<LeetCodeFullProfileData | null>(null);
  const [gfgData, setGfgData] = useState<GFGProfileData | null>(null);
  const [codeforcesData, setCodeforcesData] = useState<CodeforcesProfileData | null>(null);
  const [githubData, setGithubData] = useState<GitHubProfileData | null>(null);

  const [isLoadingLC, setIsLoadingLC] = useState<boolean>(false);
  const [isLoadingGFG, setIsLoadingGFG] = useState<boolean>(false);
  const [isLoadingCF, setIsLoadingCF] = useState<boolean>(false);
  const [isLoadingGH, setIsLoadingGH] = useState<boolean>(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<SDETubeBadge | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [billingFilter, setBillingFilter] = useState<'all' | 'credits' | 'debits'>('all');

  // Edit form state
  const [formName, setFormName] = useState(user?.user_metadata?.name || 'Mudit');
  const [formLcUsername, setFormLcUsername] = useState(linkedConfig.leetcodeUsername || 'mudit_2904');
  const [formGfgUsername, setFormGfgUsername] = useState(linkedConfig.gfgUsername || '');
  const [formCfHandle, setFormCfHandle] = useState(linkedConfig.codeforcesHandle || '');
  const [formGhUsername, setFormGhUsername] = useState(linkedConfig.githubUsername || '');
  const [formBio, setFormBio] = useState(linkedConfig.bio || 'Computer Science Student & SDE Aspirant. Solving DSA and building distributed systems.');
  const [formLocation, setFormLocation] = useState('India');
  const [formSavedNotice, setFormSavedNotice] = useState(false);

  const wallet = useMemo(() => getUserWallet(user?.email), [user?.email]);
  const transactions = useMemo(() => getUserTransactions(user?.email), [user?.email]);
  const topups = useMemo(() => getAllTopupRequests().filter(r => (r.userEmail || '').toLowerCase() === (user?.email || 'student@sdetube.com').toLowerCase()), [user?.email]);
  const heatmap = useMemo(() => generateUserSubmissionHeatmap(), []);
  const badges = useMemo(() => getUserBadges(), []);
  const tracks = useMemo(() => getUserTracksCertificates(user?.email), [user?.email]);
  const localSubmissions = useMemo(() => getUserRecentSubmissions(), []);

  // Fetch live LeetCode data
  const loadLeetcode = async (uname: string) => {
    if (!uname.trim()) return;
    setIsLoadingLC(true);
    try {
      const data = await fetchLeetCodeFullProfile(uname);
      if (data) setLeetcodeData(data);
    } catch {}
    setIsLoadingLC(false);
  };

  // Fetch live GFG data
  const loadGFG = async (uname: string) => {
    if (!uname.trim()) return;
    setIsLoadingGFG(true);
    try {
      const data = await fetchGFGProfile(uname);
      if (data) setGfgData(data);
    } catch {}
    setIsLoadingGFG(false);
  };

  // Fetch live Codeforces data
  const loadCodeforces = async (handle: string) => {
    if (!handle.trim()) return;
    setIsLoadingCF(true);
    try {
      const data = await fetchCodeforcesProfile(handle);
      if (data) setCodeforcesData(data);
    } catch {}
    setIsLoadingCF(false);
  };

  // Fetch live GitHub data
  const loadGithub = async (uname: string) => {
    if (!uname.trim()) return;
    setIsLoadingGH(true);
    try {
      const data = await fetchGitHubProfile(uname);
      if (data) setGithubData(data);
    } catch {}
    setIsLoadingGH(false);
  };

  useEffect(() => {
    const cfg = getLinkedProfiles(user?.email);
    setLinkedConfig(cfg);
    const targetLc = cfg.leetcodeUsername || 'mudit_2904';
    if (targetLc) loadLeetcode(targetLc);
    if (cfg.gfgUsername) loadGFG(cfg.gfgUsername);
    if (cfg.codeforcesHandle) loadCodeforces(cfg.codeforcesHandle);
    if (cfg.githubUsername) loadGithub(cfg.githubUsername);
  }, [user?.email]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: LinkedProfilesConfig = {
      leetcodeUsername: formLcUsername.trim(),
      gfgUsername: formGfgUsername.trim(),
      codeforcesHandle: formCfHandle.trim(),
      githubUsername: formGhUsername.trim(),
      bio: formBio.trim()
    };
    setLinkedConfig(updated);
    saveLinkedProfiles(updated, user?.email);
    setFormSavedNotice(true);
    setTimeout(() => {
      setFormSavedNotice(false);
      setIsEditModalOpen(false);
    }, 1200);

    if (updated.leetcodeUsername) loadLeetcode(updated.leetcodeUsername);
    if (updated.gfgUsername) loadGFG(updated.gfgUsername);
    if (updated.codeforcesHandle) loadCodeforces(updated.codeforcesHandle);
    if (updated.githubUsername) loadGithub(updated.githubUsername);
  };

  // Solved Stats calculation
  const sdeSolved = (JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_sde') || '[]') as any[]).length;
  const a2zSolved = (JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_a2z') || '[]') as any[]).length;
  const blindSolved = (JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_blind75') || '[]') as any[]).length;
  const mikSolved = (JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_mik') || '[]') as any[]).length;
  const lldSolved = (JSON.parse(localStorage.getItem('sdetube_lld_solved_problems') || '[]') as any[]).length;

  const totalSdetubeSolved = sdeSolved + a2zSolved + blindSolved + mikSolved + lldSolved || 38;
  const leetcodeSolved = leetcodeData?.matchedUser?.submitStats?.acSubmissionNum?.find(s => s.difficulty === 'All')?.count || 148;
  const gfgSolved = Number(gfgData?.total_problems_solved || 0);
  const cfSolved = Number(codeforcesData?.total_problems_solved || 0);
  const combinedSolved = totalSdetubeSolved + leetcodeSolved + gfgSolved + cfSolved;

  const easySolved = profileMode === 'sdetube'
    ? Math.round(totalSdetubeSolved * 0.45)
    : profileMode === 'leetcode'
    ? (leetcodeData?.matchedUser?.submitStats?.acSubmissionNum?.find(s => s.difficulty === 'Easy')?.count || 62)
    : Math.round(combinedSolved * 0.42);

  const medSolved = profileMode === 'sdetube'
    ? Math.round(totalSdetubeSolved * 0.45)
    : profileMode === 'leetcode'
    ? (leetcodeData?.matchedUser?.submitStats?.acSubmissionNum?.find(s => s.difficulty === 'Medium')?.count || 74)
    : Math.round(combinedSolved * 0.48);

  const hardSolved = profileMode === 'sdetube'
    ? Math.max(0, totalSdetubeSolved - easySolved - medSolved)
    : profileMode === 'leetcode'
    ? (leetcodeData?.matchedUser?.submitStats?.acSubmissionNum?.find(s => s.difficulty === 'Hard')?.count || 12)
    : Math.max(0, combinedSolved - easySolved - medSolved);

  // 52-week heatmap columns
  const weeks = [];
  for (let i = 0; i < heatmap.days.length; i += 7) {
    weeks.push(heatmap.days.slice(i, i + 7));
  }

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const handleOpenCert = (track: TrackCertificateProgress) => {
    setSelectedCertificate({
      id: track.trackId,
      studentName: user?.user_metadata?.name || formName || 'Mudit',
      trackTitle: track.title,
      trackCategory: track.category,
      completionPercentage: track.percentage,
      issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      verificationCode: track.verificationCode || `SDETUBE-CERT-2026-${track.trackId.slice(-6).toUpperCase()}`,
      totalProblemsSolved: track.solvedItems || 50,
      grade: track.percentage >= 95 ? 'Distinction' : 'Honors'
    });
  };

  const filteredTransactions = useMemo(() => {
    if (billingFilter === 'credits') return transactions.filter(t => t.amount > 0 || t.type === 'CREDIT');
    if (billingFilter === 'debits') return transactions.filter(t => t.amount < 0 || t.type === 'DEBIT');
    return transactions;
  }, [transactions, billingFilter]);

  return (
    <div className="w-full max-w-[1340px] mx-auto space-y-6 animate-fadeIn pb-20">
      
      {/* ── TOP SECTION SELECTOR (6 MODES) ── */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">

        {/* Tab Bar — row 1: label + actions */}
        <div className="px-4 sm:px-5 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600">
              <Globe className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-white">Developer Profile</p>
              <p className="text-[10px] text-slate-500 font-mono">Select platform view</p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">

          <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-400" />
              <span>Edit Profile</span>
            </button>

            {onOpenWallet && (
              <button
                onClick={onOpenWallet}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-950 border border-emerald-600/60 text-emerald-300 text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Click to recharge wallet via UPI"
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>₹{wallet.balance.toFixed(2)}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Bar — row 2: platform tabs */}
        <div className="px-3 pb-3 pt-2 flex flex-wrap gap-1.5">

          {/* Combined */}
          <button
            onClick={() => setProfileMode('combined')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              profileMode === 'combined'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-purple-900/40 scale-[1.02]'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Combined</span>
          </button>

          {/* SDETube */}
          <button
            onClick={() => setProfileMode('sdetube')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              profileMode === 'sdetube'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-900/40 scale-[1.02]'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SDETube</span>
          </button>

          <div className="w-px bg-slate-700/60 self-stretch mx-0.5" />

          {/* LeetCode */}
          <button
            onClick={() => setProfileMode('leetcode')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              profileMode === 'leetcode'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-900/40 scale-[1.02]'
                : 'bg-slate-800/60 text-slate-400 hover:text-amber-300 hover:bg-slate-800 border border-slate-700/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>LeetCode</span>
            {isLoadingLC && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />}
          </button>

          {/* GitHub */}
          <button
            onClick={() => setProfileMode('github')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              profileMode === 'github'
                ? 'bg-gradient-to-r from-slate-600 to-zinc-600 text-white shadow-lg shadow-slate-900/40 scale-[1.02] border border-slate-500'
                : 'bg-slate-800/60 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 border border-slate-700/50'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
            {isLoadingGH && <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />}
          </button>

          {/* GFG */}
          <button
            onClick={() => setProfileMode('gfg')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              profileMode === 'gfg'
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-900/40 scale-[1.02]'
                : 'bg-slate-800/60 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 border border-slate-700/50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>GeeksforGeeks</span>
            {isLoadingGFG && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />}
          </button>

          {/* Codeforces */}
          <button
            onClick={() => setProfileMode('codeforces')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              profileMode === 'codeforces'
                ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-900/40 scale-[1.02]'
                : 'bg-slate-800/60 text-slate-400 hover:text-sky-300 hover:bg-slate-800 border border-slate-700/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Codeforces</span>
            {isLoadingCF && <span className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-ping" />}
          </button>

        </div>
      </div>

      {/* ── 2-COLUMN LEETCODE-INSPIRED MAIN GRID ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ═══════════════════════════════════════════════════════════
            LEFT SIDEBAR: DEVELOPER IDENTITY & CREDENTIALS CARD
        ═══════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-80 flex flex-col space-y-6 flex-shrink-0">
          
          {/* Identity Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            
            {/* Avatar & Real Name */}
            <div className="flex items-start gap-4">
              <div className="relative">
                {githubData?.avatar_url || leetcodeData?.matchedUser?.profile?.userAvatar ? (
                  <img
                    src={githubData?.avatar_url || leetcodeData?.matchedUser?.profile?.userAvatar}
                    alt="Avatar"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/50 shadow-xl"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white text-2xl font-black shadow-xl border-2 border-purple-400/40">
                    {(user?.user_metadata?.name || formName || 'M').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center" title="Active">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-black text-white truncate">
                  {leetcodeData?.matchedUser?.profile?.realName || user?.user_metadata?.name || formName || 'Mudit'}
                </h1>
                <p className="text-xs text-slate-400 font-mono">@{formLcUsername || 'mudit_2904'}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800/80 text-[10px] font-bold font-mono">
                    Global Rank #{leetcodeData?.matchedUser?.profile?.ranking?.toLocaleString() || '1,420,381'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {formBio || leetcodeData?.matchedUser?.profile?.aboutMe || 'Crafting scalable software architectures and mastering algorithms on SDETube.'}
            </p>

            {/* Location & External Profiles */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{formLocation || leetcodeData?.matchedUser?.profile?.countryName || 'India'}</span>
              </div>

              {formLcUsername && (
                <a
                  href={`https://leetcode.com/${formLcUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 text-amber-300 text-xs font-mono transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">leetcode.com/{formLcUsername}</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-300" />
                </a>
              )}

              {formGfgUsername && (
                <a
                  href={`https://www.geeksforgeeks.org/user/${formGfgUsername}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 text-emerald-300 text-xs font-mono transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate">gfg.org/.../{formGfgUsername}</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-300" />
                </a>
              )}

              {formCfHandle && (
                <a
                  href={`https://codeforces.com/profile/${formCfHandle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 text-sky-300 text-xs font-mono transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-sky-400" />
                    <span className="truncate">codeforces.com/.../{formCfHandle}</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-sky-300" />
                </a>
              )}

              {formGhUsername && (
                <a
                  href={`https://github.com/${formGhUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 text-cyan-300 text-xs font-mono transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Github className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate">github.com/{formGhUsername}</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-300" />
                </a>
              )}
            </div>

            {/* Community Metrics */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Views</p>
                <p className="text-xs font-black text-slate-200 mt-0.5">2.4k</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Solutions</p>
                <p className="text-xs font-black text-slate-200 mt-0.5">{combinedSolved}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Reputation</p>
                <p className="text-xs font-black text-amber-400 mt-0.5">{leetcodeData?.matchedUser?.profile?.reputation || 12}</p>
              </div>
            </div>
          </div>

          {/* Languages Breakdown Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Languages Breakdown</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">{leetcodeData?.matchedUser?.languageProblemCount?.length || 4} languages</span>
            </h3>

            <div className="space-y-2">
              {(leetcodeData?.matchedUser?.languageProblemCount || [
                { languageName: 'C++', problemsSolved: Math.round(combinedSolved * 0.60) },
                { languageName: 'Python', problemsSolved: Math.round(combinedSolved * 0.25) },
                { languageName: 'Java', problemsSolved: Math.round(combinedSolved * 0.10) },
                { languageName: 'SQL', problemsSolved: 8 }
              ]).map((lang) => (
                <div key={lang.languageName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold">{lang.languageName}</span>
                    <span className="text-slate-400">{lang.problemsSolved} problems</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (lang.problemsSolved / Math.max(1, combinedSolved)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Breakdown Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Skills Matrix</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider mb-1.5">Advanced</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Dynamic Programming', 'Graph Theory', 'Segment Tree', 'Trie', 'Bit Manipulation'].map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-1.5">Intermediate</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Binary Search', 'Binary Tree', 'Heap / Priority Queue', 'Sliding Window', 'Greedy'].map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1.5">Fundamental</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Array', 'String', 'Hash Table', 'Two Pointers', 'Math', 'Recursion'].map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════
            RIGHT MAIN COLUMN — PLATFORM-SPECIFIC VIEWS
        ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 space-y-6 w-full">

          {/* ────────────────────────────────────────────────────────
              COMBINED + SDETUBE VIEW
          ──────────────────────────────────────────────────────── */}
          {(profileMode === 'combined' || profileMode === 'sdetube') && (<>

            {/* Metric Hero Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* Solved Donut */}
              <div className="md:col-span-5 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{profileMode === 'sdetube' ? 'SDETube Solved' : 'Combined Solved'}</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-bold font-mono">Beats 88.6%</span>
                </div>

                <div className="flex items-center justify-center py-2">
                  <div className={`relative w-36 h-36 rounded-full p-2 shadow-xl flex items-center justify-center ${profileMode === 'sdetube' ? 'bg-gradient-to-tr from-violet-500 via-purple-500 to-indigo-500' : 'bg-gradient-to-tr from-emerald-500 via-amber-400 to-rose-500'}`}>
                    <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black text-white font-mono">{profileMode === 'sdetube' ? totalSdetubeSolved : combinedSolved}</span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{profileMode === 'sdetube' ? 'sheet solved' : 'all platforms'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: 'Easy', val: easySolved, total: 850, color: 'bg-emerald-500', text: 'text-emerald-400' },
                    { label: 'Medium', val: medSolved, total: 1820, color: 'bg-amber-500', text: 'text-amber-400' },
                    { label: 'Hard', val: hardSolved, total: 750, color: 'bg-rose-500', text: 'text-rose-400' }
                  ].map(r => (
                    <div key={r.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className={`${r.text} font-bold`}>{r.label}</span>
                        <span className="text-slate-300">{r.val} <span className="text-slate-500">/ {r.total.toLocaleString()}</span></span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                        <div className={`${r.color} h-2 rounded-full`} style={{ width: `${Math.min(100, (r.val / r.total) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SDETube Badges */}
              <div className="md:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Medal className="w-4 h-4 text-purple-400" />
                    <span>{profileMode === 'sdetube' ? 'SDETube Milestones' : 'Omnichannel Badges'}</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">{badges.filter(b => b.unlocked).length} Unlocked</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {badges.slice(0, 8).map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge)}
                      className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-between gap-1 transition-all cursor-pointer group shadow-md ${badge.unlocked ? `${badge.accentBg} hover:scale-105` : 'bg-slate-950/60 border-slate-800/80 opacity-50 hover:opacity-75'}`}
                      title={`${badge.name}: ${badge.description}`}
                    >
                      <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${badge.color}`}>
                        {badge.unlocked ? <Trophy className="w-4 h-4" /> : <Lock className="w-4 h-4 text-slate-600" />}
                      </div>
                      <p className={`text-[10px] font-bold truncate w-full ${badge.unlocked ? 'text-slate-200' : 'text-slate-500'}`}>{badge.name}</p>
                      <p className="text-[9px] font-mono text-slate-500">{badge.progress}/{badge.target}</p>
                    </button>
                  ))}
                </div>
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-950 to-orange-950/30 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">LC Contest Rating</p>
                      <p className="text-base font-black text-amber-300 font-mono">{leetcodeData?.userContestRanking ? Math.round(leetcodeData.userContestRanking.rating) : '—'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">GFG Score</p>
                    <p className="text-base font-black text-emerald-300 font-mono">{gfgData?.coding_score ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">CF Rating</p>
                    <p className="text-base font-black text-sky-300 font-mono">{codeforcesData?.rating ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">GH Repos</p>
                    <p className="text-base font-black text-cyan-300 font-mono">{githubData?.public_repos ?? '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SDETube Certificates */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/30 shadow-2xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Official SDETube Course Completion Certificates</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700/60 text-amber-300 text-[10px] font-mono font-bold">90% REQUIREMENT</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Earn accredited certificates by completing ≥90% of curriculum exercises.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {tracks.map((track) => (
                  <div key={track.trackId} className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${track.isEligible ? 'bg-slate-950/90 border-amber-500/50 shadow-lg shadow-amber-500/5' : 'bg-slate-950/60 border-slate-800/80'}`}>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{track.category}</span>
                        <span className={`font-mono text-xs font-bold ${track.isEligible ? 'text-amber-300' : 'text-slate-400'}`}>{track.percentage}% Completed</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">{track.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{track.description}</p>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full ${track.isEligible ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-indigo-600'}`} style={{ width: `${track.percentage}%` }} />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-mono text-slate-500">{track.solvedItems} / {track.totalItems} solved</span>
                      {track.isEligible ? (
                        <button onClick={() => handleOpenCert(track)} className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md">
                          <Award className="w-3.5 h-3.5" /><span>View Certificate</span>
                        </button>
                      ) : (
                        <button onClick={() => handleOpenCert(track)} className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300 text-xs font-bold cursor-pointer flex items-center gap-1">
                          <span>Preview</span><Eye className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SDETube Heatmap */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>{profileMode === 'sdetube' ? `${heatmap.totalSubmissions || totalSdetubeSolved} SDETube submissions in past year` : `${heatmap.totalSubmissions + leetcodeSolved + gfgSolved + cfSolved} combined submissions in past year`}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Active days: <strong className="text-slate-200 font-mono">{heatmap.activeDaysCount}</strong> • Max streak: <strong className="text-amber-400 font-mono">{heatmap.maxStreak} days</strong> • Current streak: <strong className="text-emerald-400 font-mono">{heatmap.currentStreak} days</strong></p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  {[2026, 2025].map((yr) => (
                    <button key={yr} onClick={() => setSelectedYear(yr)} className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${selectedYear === yr ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>{yr}</button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto pb-2 custom-scrollbar">
                <div className="inline-flex flex-col gap-1.5 min-w-[760px] p-2 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between px-2 text-[10px] text-slate-500 font-mono">
                    {monthLabels.map((m) => <span key={m}>{m}</span>)}
                  </div>
                  <div className="flex gap-1">
                    {weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-1">
                        {week.map((day) => {
                          const lv = ['bg-slate-900 border border-slate-800/60','bg-emerald-950/80 border border-emerald-800/70','bg-emerald-700 border border-emerald-600','bg-emerald-500 border border-emerald-400','bg-emerald-400 border border-emerald-300 shadow-sm shadow-emerald-400/60'];
                          return <div key={day.date} className={`w-3 h-3 rounded-[3px] transition-transform hover:scale-125 cursor-pointer ${lv[day.level]}`} title={`${day.date}: ${day.count} submissions`} />;
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Billing */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-emerald-400"><CreditCard className="w-4 h-4" /></div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span>SDETube Wallet & Billing</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[10px] font-mono font-bold">₹{wallet.balance.toFixed(2)} Balance</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Live ledger of top-ups, credits, AI & video fees</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  {(['all','credits','debits'] as const).map((f) => (
                    <button key={f} onClick={() => setBillingFilter(f)} className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${billingFilter === f ? (f==='credits'?'bg-emerald-600':f==='debits'?'bg-rose-600':'bg-indigo-600') + ' text-white' : 'text-slate-400 hover:text-white'}`}>
                      {f === 'all' ? `All (${transactions.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {filteredTransactions.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">No billing transactions recorded yet.</div>
                ) : filteredTransactions.map((tx) => {
                  const isCredit = tx.amount > 0 || tx.type === 'CREDIT';
                  return (
                    <div key={tx.id} className="p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 flex items-center justify-between text-xs transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl border ${isCredit ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                          {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-200 truncate">{tx.description}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{new Date(tx.timestamp).toLocaleString()} • {tx.category}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`font-mono font-black text-xs ${isCredit ? 'text-emerald-400' : 'text-slate-300'}`}>{isCredit ? `+₹${Math.abs(tx.amount).toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}</span>
                        <p className="text-[10px] text-slate-500 font-mono">Bal: ₹{tx.balanceAfter.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>{/* end billing */}


            {/* SDETube Recent Submissions */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">SDETube Recent Submissions</h3>
              </div>
              <div className="space-y-2">
                {localSubmissions.slice(0, 15).map((sub, idx) => {
                  const diffColor = sub.difficulty === 'Easy' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : sub.difficulty === 'Medium' ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-rose-950 text-rose-300 border-rose-800';
                  return (
                    <div key={sub.id || idx} className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-violet-700/40 flex items-center justify-between gap-3 transition-all group shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-200 truncate group-hover:text-violet-300 transition-colors">{sub.title}</p>
                          <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{sub.category} • {sub.timeFormatted}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${diffColor}`}>{sub.difficulty}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-violet-300 font-mono text-[10px] font-bold border border-slate-800 hidden sm:inline">{sub.language}</span>
                        {onOpenProblem && (
                          <button onClick={() => onOpenProblem(sub.slug || sub.title)} className="px-3 py-1 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1">
                            <span>Practice</span><ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>)}

          {/* ────────────────────────────────────────────────────────
              LEETCODE VIEW
          ──────────────────────────────────────────────────────── */}
          {profileMode === 'leetcode' && (<>
            {!formLcUsername ? (
              <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 border-dashed flex flex-col items-center justify-center gap-4 text-center">
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-700/50"><Code2 className="w-8 h-8 text-amber-400" /></div>
                <div>
                  <h3 className="text-base font-black text-white">Connect LeetCode</h3>
                  <p className="text-xs text-slate-400 mt-1">Add your LeetCode username in Edit Profile to see your stats.</p>
                </div>
                <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-900/30">
                  <Edit3 className="w-3.5 h-3.5" /><span>Edit Profile</span>
                </button>
              </div>
            ) : isLoadingLC ? (
              <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-400 font-mono">Fetching LeetCode data for <strong className="text-amber-300">@{formLcUsername}</strong>…</p>
              </div>
            ) : (<>

              {/* LC: Solved Stats + Contest */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Solved Donut */}
                <div className="md:col-span-5 p-6 rounded-3xl bg-gradient-to-b from-amber-950/20 to-slate-900 border border-amber-500/20 shadow-2xl flex flex-col justify-between space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-4 h-4" /><span>LeetCode Solved</span>
                    </h3>
                    {leetcodeData?.matchedUser?.activeBadge && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700/60 text-amber-300 text-[10px] font-bold font-mono">{leetcodeData.matchedUser.activeBadge.displayName}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-center py-2">
                    <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-400 p-2 shadow-xl flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-black text-white font-mono">{leetcodeSolved}</span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">solved</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Easy', val: leetcodeData?.matchedUser?.submitStats?.acSubmissionNum?.find(s => s.difficulty === 'Easy')?.count ?? 0, total: (leetcodeData?.allQuestionsCount?.find(q => q.difficulty === 'Easy')?.count ?? 870), color: 'bg-emerald-500', text: 'text-emerald-400' },
                      { label: 'Medium', val: leetcodeData?.matchedUser?.submitStats?.acSubmissionNum?.find(s => s.difficulty === 'Medium')?.count ?? 0, total: (leetcodeData?.allQuestionsCount?.find(q => q.difficulty === 'Medium')?.count ?? 1826), color: 'bg-amber-500', text: 'text-amber-400' },
                      { label: 'Hard', val: leetcodeData?.matchedUser?.submitStats?.acSubmissionNum?.find(s => s.difficulty === 'Hard')?.count ?? 0, total: (leetcodeData?.allQuestionsCount?.find(q => q.difficulty === 'Hard')?.count ?? 802), color: 'bg-rose-500', text: 'text-rose-400' }
                    ].map(r => (
                      <div key={r.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className={`${r.text} font-bold`}>{r.label}</span>
                          <span className="text-slate-300">{r.val} <span className="text-slate-500">/ {r.total.toLocaleString()}</span></span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                          <div className={`${r.color} h-2 rounded-full`} style={{ width: `${Math.min(100, r.total > 0 ? (r.val / r.total) * 100 : 0)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contest + Profile Stats */}
                <div className="md:col-span-7 p-6 rounded-3xl bg-gradient-to-b from-amber-950/10 to-slate-900 border border-amber-500/20 shadow-2xl space-y-4">
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" /><span>Contest & Rankings</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Contest Rating', val: leetcodeData?.userContestRanking ? Math.round(leetcodeData.userContestRanking.rating) : '—', color: 'text-amber-300' },
                      { label: 'Global Rank', val: leetcodeData?.userContestRanking?.globalRanking ? `#${leetcodeData.userContestRanking.globalRanking.toLocaleString()}` : '—', color: 'text-white' },
                      { label: 'Top %', val: leetcodeData?.userContestRanking?.topPercentage ? `${leetcodeData.userContestRanking.topPercentage.toFixed(2)}%` : '—', color: 'text-emerald-300' },
                      { label: 'Contests', val: leetcodeData?.userContestRanking?.attendedContestsCount ?? '—', color: 'text-amber-300' },
                      { label: 'Profile Rank', val: leetcodeData?.matchedUser?.profile?.ranking ? `#${leetcodeData.matchedUser.profile.ranking.toLocaleString()}` : '—', color: 'text-white' },
                      { label: 'Reputation', val: leetcodeData?.matchedUser?.profile?.reputation ?? '—', color: 'text-amber-300' }
                    ].map(s => (
                      <div key={s.label} className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/10">
                        <p className="text-[10px] text-slate-500 font-mono uppercase">{s.label}</p>
                        <p className={`text-base font-black font-mono ${s.color}`}>{s.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Language Breakdown */}
                  {leetcodeData?.matchedUser?.languageProblemCount && leetcodeData.matchedUser.languageProblemCount.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Languages Used</p>
                      {leetcodeData.matchedUser.languageProblemCount.slice(0, 5).map(lang => (
                        <div key={lang.languageName} className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-slate-300 font-bold w-20 flex-shrink-0">{lang.languageName}</span>
                          <div className="flex-1 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (lang.problemsSolved / Math.max(1, leetcodeSolved)) * 100)}%` }} />
                          </div>
                          <span className="text-slate-400 w-12 text-right">{lang.problemsSolved}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* LC Official Badges */}
              {leetcodeData?.matchedUser?.badges && leetcodeData.matchedUser.badges.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/20 shadow-xl space-y-3">
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Medal className="w-4 h-4" /><span>LeetCode Official Badges</span>
                    <span className="text-slate-500 font-mono normal-case ml-auto">{leetcodeData.matchedUser.badges.length} earned</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {leetcodeData.matchedUser.badges.map(b => (
                      <div key={b.id} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-amber-950/20 border border-amber-700/30 text-center w-20">
                        <img src={b.icon} alt={b.name} className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <p className="text-[10px] text-amber-200 font-bold leading-tight">{b.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LC Recent AC Submissions */}
              {leetcodeData?.recentSubmissionList && leetcodeData.recentSubmissionList.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/20 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Code2 className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Recent LeetCode Submissions</h3>
                  </div>
                  <div className="space-y-2">
                    {leetcodeData.recentSubmissionList.slice(0, 12).map((sub, idx) => {
                      const isAC = sub.statusDisplay === 'Accepted';
                      return (
                        <div key={idx} className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all hover:scale-[1.01] ${isAC ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-slate-950/60 border-slate-800'}`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isAC ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            <p className={`font-bold truncate ${isAC ? 'text-slate-200' : 'text-slate-400'}`}>{sub.title}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${isAC ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'}`}>{sub.statusDisplay}</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 font-mono text-[10px] border border-slate-800 hidden sm:inline">{sub.lang}</span>
                            <span className="text-[10px] text-slate-500 font-mono hidden md:inline">{new Date(parseInt(sub.timestamp) * 1000).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>)}
          </>)}

          {/* ────────────────────────────────────────────────────────
              GITHUB VIEW
          ──────────────────────────────────────────────────────── */}
          {profileMode === 'github' && (<>
            {!formGhUsername ? (
              <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 border-dashed flex flex-col items-center justify-center gap-4 text-center">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700"><Github className="w-8 h-8 text-cyan-400" /></div>
                <div>
                  <h3 className="text-base font-black text-white">Connect GitHub</h3>
                  <p className="text-xs text-slate-400 mt-1">Add your GitHub username in Edit Profile to see your stats.</p>
                </div>
                <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-600 to-zinc-600 text-white text-xs font-black cursor-pointer flex items-center gap-2 shadow-lg border border-slate-500">
                  <Edit3 className="w-3.5 h-3.5" /><span>Edit Profile</span>
                </button>
              </div>
            ) : isLoadingGH ? (
              <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-400 font-mono">Fetching GitHub data for <strong className="text-cyan-300">@{formGhUsername}</strong>…</p>
              </div>
            ) : githubData ? (<>

              {/* GH Profile Hero */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-800/40 via-slate-900 to-zinc-900/40 border border-slate-600/40 shadow-2xl space-y-5">
                <div className="flex items-start gap-5">
                  <img src={githubData.avatar_url} alt="GitHub Avatar" className="w-20 h-20 rounded-2xl border-2 border-cyan-500/40 shadow-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-black text-white">{githubData.name || githubData.login}</h2>
                    <a href={githubData.html_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 font-mono hover:text-cyan-300 flex items-center gap-1 w-fit">
                      <Github className="w-3 h-3" /><span>github.com/{githubData.login}</span><ExternalLink className="w-3 h-3" />
                    </a>
                    {githubData.bio && <p className="text-xs text-slate-300 mt-2 leading-relaxed">{githubData.bio}</p>}
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-400">
                      {githubData.company && <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{githubData.company}</span>}
                      {githubData.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{githubData.location}</span>}
                      {githubData.blog && <a href={githubData.blog} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"><ExternalLink className="w-3 h-3" />{githubData.blog.replace(/https?:\/\//, '').slice(0, 30)}</a>}
                    </div>
                  </div>
                </div>

                {/* GH Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Public Repos', val: githubData.public_repos, color: 'text-cyan-300', icon: <FolderGit2 className="w-4 h-4 text-cyan-400" /> },
                    { label: 'Followers', val: githubData.followers, color: 'text-white', icon: <User className="w-4 h-4 text-slate-400" /> },
                    { label: 'Following', val: githubData.following, color: 'text-slate-300', icon: <User className="w-4 h-4 text-slate-400" /> },
                    { label: 'Public Gists', val: githubData.public_gists, color: 'text-cyan-300', icon: <BookOpen className="w-4 h-4 text-cyan-400" /> }
                  ].map(s => (
                    <div key={s.label} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700/50 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">{s.icon}<p className="text-[10px] text-slate-500 font-mono uppercase">{s.label}</p></div>
                      <p className={`text-2xl font-black font-mono ${s.color}`}>{s.val}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800/60 text-xs text-slate-500 font-mono">
                  Member since <strong className="text-slate-300">{new Date(githubData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
                </div>
              </div>

              {/* GH CTA */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-700/40 shadow-xl flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">View Full GitHub Profile</p>
                  <p className="text-xs text-slate-400 mt-0.5">See all repositories, contributions, and pinned projects.</p>
                </div>
                <a href={githubData.html_url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-zinc-600 border border-slate-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md flex-shrink-0">
                  <Github className="w-3.5 h-3.5" /><span>Open GitHub</span><ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </>) : (
              <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center">
                <p className="text-xs text-slate-500">Could not load GitHub data. Check username in Edit Profile.</p>
              </div>
            )}
          </>)}

          {/* ────────────────────────────────────────────────────────
              GEEKSFORGEEKS VIEW
          ──────────────────────────────────────────────────────── */}
          {profileMode === 'gfg' && (<>
            {!formGfgUsername ? (
              <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 border-dashed flex flex-col items-center justify-center gap-4 text-center">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-700/50"><Award className="w-8 h-8 text-emerald-400" /></div>
                <div>
                  <h3 className="text-base font-black text-white">Connect GeeksforGeeks</h3>
                  <p className="text-xs text-slate-400 mt-1">Add your GFG username in Edit Profile to see your stats.</p>
                </div>
                <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-black cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-900/30">
                  <Edit3 className="w-3.5 h-3.5" /><span>Edit Profile</span>
                </button>
              </div>
            ) : isLoadingGFG ? (
              <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-400 font-mono">Fetching GFG data for <strong className="text-emerald-300">@{formGfgUsername}</strong>…</p>
              </div>
            ) : gfgData ? (<>

              {/* GFG Hero */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Solved donut */}
                <div className="md:col-span-5 p-6 rounded-3xl bg-gradient-to-b from-emerald-950/20 to-slate-900 border border-emerald-500/20 shadow-2xl flex flex-col justify-between space-y-5">
                  <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4" /><span>GFG Problems Solved</span>
                  </h3>
                  <div className="flex items-center justify-center py-2">
                    <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-500 via-green-500 to-teal-400 p-2 shadow-xl flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-black text-white font-mono">{gfgData.total_problems_solved}</span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">solved</span>
                      </div>
                    </div>
                  </div>
                  {gfgData.difficulty && (
                    <div className="space-y-2">
                      {([
                        { label: 'School', val: gfgData.difficulty.school ?? 0, color: 'bg-sky-500', text: 'text-sky-400' },
                        { label: 'Basic', val: gfgData.difficulty.basic ?? 0, color: 'bg-teal-500', text: 'text-teal-400' },
                        { label: 'Easy', val: gfgData.difficulty.easy ?? 0, color: 'bg-emerald-500', text: 'text-emerald-400' },
                        { label: 'Medium', val: gfgData.difficulty.medium ?? 0, color: 'bg-amber-500', text: 'text-amber-400' },
                        { label: 'Hard', val: gfgData.difficulty.hard ?? 0, color: 'bg-rose-500', text: 'text-rose-400' }
                      ] as { label: string; val: number; color: string; text: string }[]).map(r => (
                        <div key={r.label} className="flex items-center gap-2 text-xs font-mono">
                          <span className={`${r.text} font-bold w-14 flex-shrink-0`}>{r.label}</span>
                          <div className="flex-1 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div className={`${r.color} h-1.5 rounded-full`} style={{ width: `${Math.min(100, gfgData.total_problems_solved > 0 ? (r.val / gfgData.total_problems_solved) * 100 : 0)}%` }} />
                          </div>
                          <span className="text-slate-400 w-6 text-right">{r.val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* GFG Stats */}
                <div className="md:col-span-7 p-6 rounded-3xl bg-gradient-to-b from-emerald-950/10 to-slate-900 border border-emerald-500/20 shadow-2xl space-y-4">
                  <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" /><span>GFG Score & Rankings</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Coding Score', val: gfgData.coding_score, color: 'text-emerald-300' },
                      { label: 'Monthly Score', val: gfgData.monthly_score, color: 'text-teal-300' },
                      { label: 'Institute Rank', val: gfgData.institute_rank ? `#${gfgData.institute_rank}` : '—', color: 'text-white' },
                      { label: 'Overall Score', val: gfgData.overall_score, color: 'text-emerald-300' },
                      { label: 'Longest Streak', val: `${gfgData.longest_streak} days`, color: 'text-amber-300' },
                      { label: 'Current Streak', val: `${gfgData.current_streak} days`, color: 'text-emerald-300' }
                    ].map(s => (
                      <div key={s.label} className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/10">
                        <p className="text-[10px] text-slate-500 font-mono uppercase">{s.label}</p>
                        <p className={`text-base font-black font-mono ${s.color}`}>{s.val}</p>
                      </div>
                    ))}
                  </div>
                  {(gfgData.organization || gfgData.institute) && (
                    <div className="pt-2 border-t border-slate-800/60 space-y-1">
                      {gfgData.organization && <p className="text-xs text-slate-400"><span className="text-slate-500">Organization: </span><strong className="text-slate-200">{gfgData.organization}</strong></p>}
                      {gfgData.institute && <p className="text-xs text-slate-400"><span className="text-slate-500">Institute: </span><strong className="text-slate-200">{gfgData.institute}</strong></p>}
                    </div>
                  )}
                  <a href={`https://www.geeksforgeeks.org/user/${formGfgUsername}/`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-950/30 border border-emerald-700/40 text-emerald-300 hover:bg-emerald-950/60 transition-all text-xs font-bold cursor-pointer">
                    <ExternalLink className="w-3.5 h-3.5" /><span>View GFG Profile</span>
                  </a>
                </div>
              </div>

              {/* SDETube Certificates (also shown in GFG tab) */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/30 shadow-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" /><span>SDETube Certificates</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700/60 text-amber-300 text-[10px] font-mono font-bold">90% REQUIREMENT</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tracks.filter(t => t.isEligible).slice(0, 4).map((track) => (
                    <div key={track.trackId} className="p-4 rounded-2xl border bg-slate-950/90 border-amber-500/50 shadow-lg flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-100 truncate">{track.title}</p>
                        <p className="text-[10px] font-mono text-amber-300">{track.percentage}% complete</p>
                      </div>
                      <button onClick={() => handleOpenCert(track)} className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black flex-shrink-0 cursor-pointer">Certificate</button>
                    </div>
                  ))}
                </div>
              </div>
            </>) : (
              <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center">
                <p className="text-xs text-slate-500">Could not load GFG data. Check username in Edit Profile.</p>
              </div>
            )}
          </>)}

          {/* ────────────────────────────────────────────────────────
              CODEFORCES VIEW
          ──────────────────────────────────────────────────────── */}
          {profileMode === 'codeforces' && (<>
            {!formCfHandle ? (
              <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 border-dashed flex flex-col items-center justify-center gap-4 text-center">
                <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-700/50"><Zap className="w-8 h-8 text-sky-400" /></div>
                <div>
                  <h3 className="text-base font-black text-white">Connect Codeforces</h3>
                  <p className="text-xs text-slate-400 mt-1">Add your Codeforces handle in Edit Profile to see your stats.</p>
                </div>
                <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 text-white text-xs font-black cursor-pointer flex items-center gap-2 shadow-lg shadow-sky-900/30">
                  <Edit3 className="w-3.5 h-3.5" /><span>Edit Profile</span>
                </button>
              </div>
            ) : isLoadingCF ? (
              <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-400 font-mono">Fetching Codeforces data for <strong className="text-sky-300">{formCfHandle}</strong>…</p>
              </div>
            ) : codeforcesData ? (<>

              {/* CF Hero */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Rating Donut */}
                <div className="md:col-span-5 p-6 rounded-3xl bg-gradient-to-b from-sky-950/20 to-slate-900 border border-sky-500/20 shadow-2xl flex flex-col justify-between space-y-5">
                  <h3 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /><span>Codeforces Solved</span>
                  </h3>
                  <div className="flex items-center justify-center py-2">
                    <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-sky-500 via-blue-500 to-indigo-500 p-2 shadow-xl flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-black text-white font-mono">{codeforcesData.total_problems_solved}</span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">solved</span>
                      </div>
                    </div>
                  </div>
                  {codeforcesData.difficulty_breakdown && (
                    <div className="space-y-2">
                      {([
                        { label: 'Easy', val: codeforcesData.difficulty_breakdown.easy, color: 'bg-emerald-500', text: 'text-emerald-400' },
                        { label: 'Medium', val: codeforcesData.difficulty_breakdown.medium, color: 'bg-amber-500', text: 'text-amber-400' },
                        { label: 'Hard', val: codeforcesData.difficulty_breakdown.hard, color: 'bg-rose-500', text: 'text-rose-400' }
                      ] as { label: string; val: number; color: string; text: string }[]).map(r => (
                        <div key={r.label} className="flex items-center gap-2 text-xs font-mono">
                          <span className={`${r.text} font-bold w-14 flex-shrink-0`}>{r.label}</span>
                          <div className="flex-1 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div className={`${r.color} h-1.5 rounded-full`} style={{ width: `${Math.min(100, codeforcesData.total_problems_solved > 0 ? (r.val / codeforcesData.total_problems_solved) * 100 : 0)}%` }} />
                          </div>
                          <span className="text-slate-400 w-6 text-right">{r.val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CF Stats */}
                <div className="md:col-span-7 p-6 rounded-3xl bg-gradient-to-b from-sky-950/10 to-slate-900 border border-sky-500/20 shadow-2xl space-y-4">
                  <h3 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" /><span>Rating & Rank</span>
                  </h3>

                  {/* Rating card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 to-blue-950/40 border border-sky-500/30 flex items-center gap-4">
                    {codeforcesData.avatar && <img src={codeforcesData.avatar} alt={codeforcesData.handle} className="w-14 h-14 rounded-xl border border-sky-500/30 object-cover" />}
                    <div>
                      <p className="text-base font-black text-white">{codeforcesData.firstName ?? ''} {codeforcesData.lastName ?? ''}</p>
                      <p className="text-xs text-sky-400 font-mono">@{codeforcesData.handle}</p>
                      <p className="text-xs text-sky-300 font-bold capitalize mt-0.5">{codeforcesData.rank}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Current Rating', val: codeforcesData.rating, color: 'text-sky-300' },
                      { label: 'Max Rating', val: codeforcesData.maxRating, color: 'text-sky-300' },
                      { label: 'Current Rank', val: codeforcesData.rank, color: 'text-white capitalize' },
                      { label: 'Max Rank', val: codeforcesData.maxRank, color: 'text-amber-300 capitalize' },
                      { label: 'Contribution', val: codeforcesData.contribution, color: codeforcesData.contribution >= 0 ? 'text-emerald-300' : 'text-rose-300' },
                      { label: 'Friend of', val: codeforcesData.friendOfCount, color: 'text-white' }
                    ].map(s => (
                      <div key={s.label} className="p-3 rounded-2xl bg-slate-950/80 border border-sky-500/10">
                        <p className="text-[10px] text-slate-500 font-mono uppercase">{s.label}</p>
                        <p className={`text-base font-black font-mono ${s.color}`}>{s.val}</p>
                      </div>
                    ))}
                  </div>
                  <a href={`https://codeforces.com/profile/${codeforcesData.handle}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-sky-950/30 border border-sky-700/40 text-sky-300 hover:bg-sky-950/60 transition-all text-xs font-bold cursor-pointer">
                    <ExternalLink className="w-3.5 h-3.5" /><span>View Codeforces Profile</span>
                  </a>
                </div>
              </div>
            </>) : (
              <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center">
                <p className="text-xs text-slate-500">Could not load Codeforces data. Check handle in Edit Profile.</p>
              </div>
            )}
          </>)}

        </div>{/* end right column */}

      </div>{/* end flex row */}


      {isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-400" />
                <span>Edit Developer Profile</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formSavedNotice && (
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>LeetCode Username</span>
                </label>
                <input
                  type="text"
                  value={formLcUsername}
                  onChange={(e) => setFormLcUsername(e.target.value)}
                  placeholder="e.g. mudit_2904"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>GeeksforGeeks Username</span>
                </label>
                <input
                  type="text"
                  value={formGfgUsername}
                  onChange={(e) => setFormGfgUsername(e.target.value)}
                  placeholder="e.g. ayush_sharma"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span>Codeforces Handle</span>
                </label>
                <input
                  type="text"
                  value={formCfHandle}
                  onChange={(e) => setFormCfHandle(e.target.value)}
                  placeholder="e.g. tourist"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-cyan-400" />
                  <span>GitHub Username</span>
                </label>
                <input
                  type="text"
                  value={formGhUsername}
                  onChange={(e) => setFormGhUsername(e.target.value)}
                  placeholder="e.g. mudit2904"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Bio / Headline</label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VERIFIED CERTIFICATE MODAL ── */}
      <CertificateModal
        isOpen={Boolean(selectedCertificate)}
        onClose={() => setSelectedCertificate(null)}
        certificate={selectedCertificate}
      />

    </div>
  );
};
