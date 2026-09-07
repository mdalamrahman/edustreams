import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Flame, ExternalLink, Code, CheckCircle2, Trophy, ArrowRight, Zap, Target, RefreshCw, BookOpen, Layers } from 'lucide-react';
import { fetchLeetCodePOTD, fetchGFGPOTD, clearPOTDCache, LeetCodeDailyQuestion, GFGDailyQuestion } from '../lib/leetcodeApi';
import { SDEProblem, SDE_SHEET_DATA, getUniversalSdePotd } from '../lib/sdeSheetData';
import { isProblemSlugSolved, isPotdSolvedToday, markProblemSolved } from '../lib/analytics';
import { getSolvedIds, getLinkedProfiles } from '../lib/progressService';
import { 
  fetchLeetCodeFullProfile, 
  fetchGFGProfile, 
  LeetCodeFullProfileData, 
  GFGProfileData, 
  isLeetCodeProblemSolvedToday, 
  isGfgProblemSolvedToday 
} from '../lib/userProfileService';

interface POTDModalProps {
  onClose: () => void;
  onSolveSdeProblem: (problem: SDEProblem) => void;
}

export const POTDModal: React.FC<POTDModalProps> = ({ onClose, onSolveSdeProblem }) => {
  const [activeTab, setActiveTab] = useState<'sdetube' | 'leetcode' | 'gfg'>('sdetube');
  const [lcPotd, setLcPotd] = useState<LeetCodeDailyQuestion | null>(null);
  const [gfgPotd, setGfgPotd] = useState<GFGDailyQuestion | null>(null);
  const [isLoadingLc, setIsLoadingLc] = useState(false);
  const [isLoadingGfg, setIsLoadingGfg] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  // Today's Curated SDETube POTD
  const sdePotd: SDEProblem = useMemo(() => {
    return getUniversalSdePotd();
  }, [today]);

  const [isSolvedEventTriggered, setIsSolvedEventTriggered] = useState(0);

  // External Platform Profiles
  const linkedConfig = useMemo(() => getLinkedProfiles(), []);
  const [leetcodeProfile, setLeetcodeProfile] = useState<LeetCodeFullProfileData | null>(null);
  const [gfgProfile, setGfgProfile] = useState<GFGProfileData | null>(null);

  useEffect(() => {
    if (linkedConfig.leetcodeUsername?.trim()) {
      fetchLeetCodeFullProfile(linkedConfig.leetcodeUsername.trim())
        .then(data => setLeetcodeProfile(data))
        .catch(() => {});
    }
    if (linkedConfig.gfgUsername?.trim()) {
      fetchGFGProfile(linkedConfig.gfgUsername.trim())
        .then(data => setGfgProfile(data))
        .catch(() => {});
    }
  }, [linkedConfig.leetcodeUsername, linkedConfig.gfgUsername]);

  useEffect(() => {
    const onSolved = () => setIsSolvedEventTriggered(prev => prev + 1);
    window.addEventListener('sdetube_problem_solved', onSolved);
    window.addEventListener('sdetube_potd_solved', onSolved);
    return () => {
      window.removeEventListener('sdetube_problem_solved', onSolved);
      window.removeEventListener('sdetube_potd_solved', onSolved);
    };
  }, []);

  // Check if SDE POTD is solved
  const isSdePotdSolved = useMemo(() => {
    if (isPotdSolvedToday()) return true;
    try {
      const sdeList = getSolvedIds('sde');
      if (sdeList.includes(sdePotd.id)) return true;
      if (isProblemSlugSolved(sdePotd.slug || sdePotd.name)) return true;
      if (sdePotd.slug) {
        const sub = localStorage.getItem(`edustream_submissions_${sdePotd.slug}`);
        if (sub && (sub.includes('"status":"SUCCESS"') || sub.includes('"passedCount"'))) return true;
      }
    } catch {
      return false;
    }
    return false;
  }, [sdePotd, isSolvedEventTriggered]);

  // Check if LeetCode POTD is solved
  const isLcPotdSolved = useMemo(() => {
    if (!lcPotd) return false;
    if (localStorage.getItem(`sdetube_potd_leetcode_solved_${today}`) === 'true') return true;
    if (isProblemSlugSolved(lcPotd.titleSlug || lcPotd.title)) return true;
    if (lcPotd.titleSlug) {
      const sub = localStorage.getItem(`edustream_submissions_${lcPotd.titleSlug}`);
      if (sub && (sub.includes('"status":"SUCCESS"') || sub.includes('"passedCount"'))) return true;
    }
    // Remote LeetCode check for same-day Accepted submission
    if (leetcodeProfile?.recentSubmissionList && leetcodeProfile.recentSubmissionList.length > 0) {
      const isRemoteSolved = isLeetCodeProblemSolvedToday(
        leetcodeProfile.recentSubmissionList,
        lcPotd.titleSlug,
        lcPotd.title,
        lcPotd.date
      );
      if (isRemoteSolved) {
        try {
          localStorage.setItem(`sdetube_potd_leetcode_solved_${today}`, 'true');
          localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
          markProblemSolved(lcPotd.title, 10, lcPotd.titleSlug);
        } catch {}
        return true;
      }
    }
    return false;
  }, [lcPotd, leetcodeProfile, today, isSolvedEventTriggered]);

  // Check if GFG POTD is solved
  const isGfgPotdSolved = useMemo(() => {
    if (!gfgPotd) return false;
    if (localStorage.getItem(`sdetube_potd_gfg_solved_${today}`) === 'true') return true;
    if (isProblemSlugSolved(gfgPotd.titleSlug || gfgPotd.title)) return true;
    if (gfgPotd.titleSlug) {
      const sub = localStorage.getItem(`edustream_submissions_${gfgPotd.titleSlug}`);
      if (sub && (sub.includes('"status":"SUCCESS"') || sub.includes('"passedCount"'))) return true;
    }
    // Remote GFG check for active streak
    if (gfgProfile) {
      const isRemoteSolved = isGfgProblemSolvedToday(gfgProfile, gfgPotd.titleSlug, gfgPotd.title);
      if (isRemoteSolved) {
        try {
          localStorage.setItem(`sdetube_potd_gfg_solved_${today}`, 'true');
          localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
          markProblemSolved(gfgPotd.title, 10, gfgPotd.titleSlug);
        } catch {}
        return true;
      }
    }
    return false;
  }, [gfgPotd, gfgProfile, today, isSolvedEventTriggered]);

  const isAnyPotdSolved = isSdePotdSolved || isLcPotdSolved || isGfgPotdSolved;

  const loadLeetCodePOTD = async (force = false) => {
    setIsLoadingLc(true);
    try {
      const res = await fetchLeetCodePOTD(force);
      setLcPotd(res);
    } catch (e) {
      console.warn('Failed to load LeetCode POTD', e);
    } finally {
      setIsLoadingLc(false);
    }
  };

  const loadGfgPOTD = async (force = false) => {
    setIsLoadingGfg(true);
    try {
      const res = await fetchGFGPOTD(force);
      setGfgPotd(res);
    } catch (e) {
      console.warn('Failed to load GFG POTD', e);
    } finally {
      setIsLoadingGfg(false);
    }
  };

  const handleRefreshAll = async () => {
    clearPOTDCache();
    await Promise.all([loadLeetCodePOTD(true), loadGfgPOTD(true)]);
  };

  useEffect(() => {
    loadLeetCodePOTD();
    loadGfgPOTD();
  }, []);

  const isRefreshingAny = isLoadingLc || isLoadingGfg;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/20 shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Glow ambient */}
        <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
          isAnyPotdSolved ? 'bg-emerald-500/15' : 'bg-amber-500/10'
        }`} />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${
              isAnyPotdSolved 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}>
              {isAnyPotdSolved ? (
                <CheckCircle2 className="w-5 h-5 animate-pulse text-emerald-400" />
              ) : (
                <Flame className="w-5 h-5 animate-bounce" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Daily Coding Challenge (POTD)</span>
                {isAnyPotdSolved ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1 shadow-sm shadow-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Solved Today ✓
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-700 text-amber-300 font-mono text-[11px] font-bold">
                    Today's Streak
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Practice daily challenges on SDETube IDE or directly on official platforms</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshingAny}
              className={`p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                isRefreshingAny ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Refresh all live daily problems"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAny ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Refresh POTDs</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 3-Tab Selector: SDETube Curated | LeetCode POTD | GeeksforGeeks POTD */}
        <div className="grid grid-cols-3 gap-2 my-5 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('sdetube')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'sdetube'
                ? isSdePotdSolved 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                  : 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-200 flex-shrink-0" />
            <span className="truncate">SDETube SDE POTD</span>
            {isSdePotdSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />}
          </button>

          <button
            onClick={() => setActiveTab('leetcode')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'leetcode'
                ? isLcPotdSolved 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                  : 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code className="w-4 h-4 text-amber-200 flex-shrink-0" />
            <span className="truncate">LeetCode POTD</span>
            {isLcPotdSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />}
          </button>

          <button
            onClick={() => setActiveTab('gfg')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'gfg'
                ? isGfgPotdSolved 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                  : 'bg-emerald-700 text-white shadow-lg shadow-emerald-700/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-200 flex-shrink-0" />
            <span className="truncate">GFG POTD</span>
            {isGfgPotdSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />}
          </button>
        </div>

        {/* TAB 1: SDETUBE CURATED POTD */}
        {activeTab === 'sdetube' && (
          <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
            isSdePotdSolved 
              ? 'bg-emerald-950/20 border-emerald-500/40' 
              : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 font-mono text-[10px] text-indigo-300 font-bold">
                  {sdePotd.category}
                </span>
                {isSdePotdSolved && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-500 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Solved ✓
                  </span>
                )}
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                sdePotd.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                sdePotd.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                'bg-rose-950 border-rose-700 text-rose-300'
              }`}>
                {sdePotd.difficulty}
              </span>
            </div>

            <div>
              <h4 className={`text-lg font-bold flex items-center gap-2 ${
                isSdePotdSolved ? 'text-emerald-200' : 'text-slate-100'
              }`}>
                <span>{sdePotd.name}</span>
                {isSdePotdSolved && <span className="text-emerald-400 text-xs font-normal">✓ Done</span>}
              </h4>
              <p className="text-xs text-slate-400 mt-1">High-frequency interview challenge selected from the SDETube Sheet &bull; {today}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {/* Primary: Solve in SDETube IDE */}
              <button
                onClick={() => {
                  onSolveSdeProblem(sdePotd);
                  onClose();
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isSdePotdSolved
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-600/30'
                }`}
              >
                <Code className="w-4 h-4 flex-shrink-0" />
                <span>{isSdePotdSolved ? 'Solved Today ✓ (Review in SDETube IDE)' : '⚡ Solve on SDETube IDE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary: External LeetCode link */}
              {sdePotd.leetcode && (
                <a
                  href={sdePotd.leetcode}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-200 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="Solve on LeetCode"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Solve on LeetCode</span>
                </a>
              )}

              {/* Secondary: External GFG link */}
              {sdePotd.gfg && (
                <a
                  href={sdePotd.gfg}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="Solve on GeeksforGeeks"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Solve on GFG</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LEETCODE POTD */}
        {activeTab === 'leetcode' && (
          <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
            isLcPotdSolved 
              ? 'bg-emerald-950/20 border-emerald-500/40' 
              : 'bg-slate-900/90 border-slate-800'
          }`}>
            {isLoadingLc ? (
              <div className="py-8 text-center text-slate-400 font-mono text-xs animate-pulse">
                Fetching Official LeetCode Problem of the Day...
              </div>
            ) : lcPotd ? (
              <>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {(lcPotd.topicTags || ['Algorithms']).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        {tag}
                      </span>
                    ))}
                    {isLcPotdSolved && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-500 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Solved ✓
                      </span>
                    )}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    lcPotd.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                    lcPotd.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                    'bg-rose-950 border-rose-700 text-rose-300'
                  }`}>
                    {lcPotd.difficulty}
                  </span>
                </div>

                <div>
                  <h4 className={`text-lg font-bold flex items-center gap-2 ${
                    isLcPotdSolved ? 'text-emerald-200' : 'text-slate-100'
                  }`}>
                    <span>{lcPotd.title}</span>
                    {isLcPotdSolved && <span className="text-emerald-400 text-xs font-normal">✓ Done</span>}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Official LeetCode Daily Challenge &bull; {lcPotd.date}</p>
                </div>

                {/* Dual Option: Solve on SDETube IDE vs Solve on LeetCode */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      const dynamicProblem: SDEProblem = {
                        id: 8888,
                        sheetType: 'sde',
                        category: (lcPotd.topicTags && lcPotd.topicTags[0]) || 'Daily Challenge',
                        name: lcPotd.title,
                        difficulty: (lcPotd.difficulty as any) || 'Medium',
                        rating: '5.0 / 5',
                        leetcode: lcPotd.url,
                        gfg: `https://www.geeksforgeeks.org/problems/${lcPotd.titleSlug}/1`,
                        companies: ['Google', 'Meta', 'Amazon'],
                        slug: lcPotd.titleSlug
                      };
                      onSolveSdeProblem(dynamicProblem);
                      onClose();
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isLcPotdSolved
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-600/30'
                        : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-600/30'
                    }`}
                  >
                    <Code className="w-4 h-4 flex-shrink-0" />
                    <span>{isLcPotdSolved ? 'Solved Today ✓ (Review in SDETube IDE)' : '⚡ Solve on SDETube IDE'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={lcPotd.url}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-200 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    title="Solve directly on LeetCode website"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>↗ Solve on LeetCode</span>
                  </a>

                  <button
                    onClick={() => loadLeetCodePOTD(true)}
                    disabled={isLoadingLc}
                    className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer flex items-center justify-center transition-all disabled:opacity-50"
                    title="Refresh LeetCode POTD"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingLc ? 'animate-spin text-amber-400' : ''}`} />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs font-mono">
                Failed to load LeetCode POTD.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GEEKSFORGEEKS POTD */}
        {activeTab === 'gfg' && (
          <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
            isGfgPotdSolved 
              ? 'bg-emerald-950/20 border-emerald-500/40' 
              : 'bg-slate-900/90 border-slate-800'
          }`}>
            {isLoadingGfg ? (
              <div className="py-8 text-center text-slate-400 font-mono text-xs animate-pulse">
                Fetching Official GeeksforGeeks Problem of the Day...
              </div>
            ) : gfgPotd ? (
              <>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {(gfgPotd.topicTags || ['Dynamic Programming']).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        {tag}
                      </span>
                    ))}
                    {gfgPotd.accuracy && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-[10px] text-emerald-300 font-mono">
                        Acc: {gfgPotd.accuracy}%
                      </span>
                    )}
                    {isGfgPotdSolved && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-500 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Solved ✓
                      </span>
                    )}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    gfgPotd.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                    gfgPotd.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                    'bg-rose-950 border-rose-700 text-rose-300'
                  }`}>
                    {gfgPotd.difficulty}
                  </span>
                </div>

                <div>
                  <h4 className={`text-lg font-bold flex items-center gap-2 ${
                    isGfgPotdSolved ? 'text-emerald-200' : 'text-slate-100'
                  }`}>
                    <span>{gfgPotd.title}</span>
                    {isGfgPotdSolved && <span className="text-emerald-400 text-xs font-normal">✓ Done</span>}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Official GeeksforGeeks Problem of the Day &bull; {gfgPotd.date}</p>
                </div>

                {/* Dual Option: Solve on SDETube IDE vs Solve on GeeksforGeeks */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      const dynamicProblem: SDEProblem = {
                        id: 9999,
                        sheetType: 'sde',
                        category: (gfgPotd.topicTags && gfgPotd.topicTags[0]) || 'GFG POTD',
                        name: gfgPotd.title,
                        difficulty: (gfgPotd.difficulty as any) || 'Medium',
                        rating: '5.0 / 5',
                        leetcode: gfgPotd.url,
                        gfg: gfgPotd.url,
                        companies: ['Amazon', 'Microsoft', 'Flipkart'],
                        slug: gfgPotd.titleSlug
                      };
                      onSolveSdeProblem(dynamicProblem);
                      onClose();
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isGfgPotdSolved
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-600/30'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/30'
                    }`}
                  >
                    <Code className="w-4 h-4 flex-shrink-0" />
                    <span>{isGfgPotdSolved ? 'Solved Today ✓ (Review in SDETube IDE)' : '⚡ Solve on SDETube IDE'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={gfgPotd.url}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    title="Solve directly on GeeksforGeeks website"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>↗ Solve on GeeksforGeeks</span>
                  </a>

                  <button
                    onClick={() => loadGfgPOTD(true)}
                    disabled={isLoadingGfg}
                    className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer flex items-center justify-center transition-all disabled:opacity-50"
                    title="Refresh GFG POTD"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingGfg ? 'animate-spin text-emerald-400' : ''}`} />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs font-mono">
                Failed to load GeeksforGeeks POTD.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
