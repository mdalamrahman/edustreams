import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Flame, ExternalLink, Code, CheckCircle2, Trophy, ArrowRight, Zap, Target, RefreshCw, BookOpen, Layers, AlertTriangle } from 'lucide-react';
import { fetchLeetCodePOTD, fetchGFGPOTD, clearPOTDCache, LeetCodeDailyQuestion, GFGDailyQuestion } from '../lib/leetcodeApi';
import { SDEProblem, SDE_SHEET_DATA, getUniversalSdePotd } from '../lib/sdeSheetData';
import { isProblemSlugSolved, isPotdSolvedToday, markProblemSolved, resetUnverifiedPotdToday } from '../lib/analytics';
import { getSolvedIds, getLinkedProfiles } from '../lib/progressService';
import { 
  fetchLeetCodeFullProfile, 
  fetchGFGProfile, 
  LeetCodeFullProfileData, 
  GFGProfileData, 
  isLeetCodeProblemSolvedToday, 
  isGfgProblemSolvedToday,
  checkLeetCodeProfilePrivacy
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
    resetUnverifiedPotdToday();
    const onSolved = () => setIsSolvedEventTriggered(prev => prev + 1);
    window.addEventListener('sdetube_problem_solved', onSolved);
    window.addEventListener('sdetube_potd_solved', onSolved);
    return () => {
      window.removeEventListener('sdetube_problem_solved', onSolved);
      window.removeEventListener('sdetube_potd_solved', onSolved);
    };
  }, []);

  // Check if SDE POTD is solved TODAY
  const isSdePotdSolved = useMemo(() => {
    if (localStorage.getItem(`sdetube_potd_sdetube_solved_${today}`) === 'true') return true;
    try {
      if (sdePotd?.slug) {
        const sub = localStorage.getItem(`edustream_submissions_${sdePotd.slug}`);
        if (sub) {
          const list = JSON.parse(sub);
          if (Array.isArray(list) && list.some(item => {
            if (!item || (item.status !== 'Accepted' && item.status !== 'SUCCESS')) return false;
            if (item.id) {
              const ts = parseInt(item.id.split('_')[0], 10);
              if (ts > 0 && new Date(ts).toISOString().slice(0, 10) === today) return true;
            }
            return false;
          })) {
            return true;
          }
        }
      }
    } catch {
      return false;
    }
    return false;
  }, [sdePotd, today, isSolvedEventTriggered]);

  // Check if LeetCode POTD is solved TODAY
  const isLcPotdSolved = useMemo(() => {
    if (!lcPotd) return false;
    if (localStorage.getItem(`sdetube_potd_leetcode_solved_${today}`) === 'true') return true;

    // Check localStorage submissions made TODAY
    const subVariants = [
      lcPotd.titleSlug,
      (lcPotd.titleSlug || '').toLowerCase().replace(/[^a-z0-9]/g, ''),
      (lcPotd.titleSlug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      (lcPotd.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    ].filter(Boolean);

    for (const v of subVariants) {
      const sub = localStorage.getItem(`edustream_submissions_${v}`);
      if (sub) {
        try {
          const list = JSON.parse(sub);
          if (Array.isArray(list) && list.some(item => {
            if (!item || (item.status !== 'Accepted' && item.status !== 'SUCCESS')) return false;
            if (item.id) {
              const ts = parseInt(item.id.split('_')[0], 10);
              if (ts > 0 && new Date(ts).toISOString().slice(0, 10) === today) return true;
            }
            return false;
          })) {
            return true;
          }
        } catch {}
      }
    }

    // Remote LeetCode check: only if an accepted submission matching slug was made TODAY
    if (leetcodeProfile) {
      const isRemoteSolved = isLeetCodeProblemSolvedToday(
        leetcodeProfile,
        lcPotd.titleSlug,
        lcPotd.title,
        lcPotd.date
      );
      if (isRemoteSolved) {
        try {
          localStorage.setItem(`sdetube_potd_leetcode_solved_${today}`, 'true');
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

    const subVariants = [
      gfgPotd.titleSlug,
      '9999',
      'gfgpotd',
      (gfgPotd.titleSlug || '').toLowerCase().replace(/[^a-z0-9]/g, ''),
      (gfgPotd.titleSlug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      (gfgPotd.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      (gfgPotd.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    ].filter(Boolean);

    for (const v of subVariants) {
      const sub = localStorage.getItem(`edustream_submissions_${v}`);
      if (sub) {
        try {
          const list = JSON.parse(sub);
          if (Array.isArray(list) && list.some(item => {
            if (!item || (item.status !== 'Accepted' && item.status !== 'SUCCESS')) return false;
            let isToday = false;
            if (item.id) {
              const ts = parseInt(item.id.split('_')[0], 10);
              if (ts > 0 && new Date(ts).toISOString().slice(0, 10) === today) isToday = true;
            }
            if (!isToday && item.timestamp) {
              const ts = typeof item.timestamp === 'number' ? item.timestamp : Date.parse(item.timestamp);
              if (ts > 0 && new Date(ts).toISOString().slice(0, 10) === today) isToday = true;
            }
            return isToday;
          })) {
            return true;
          }
        } catch {}
      }
    }

    // Remote GFG check: only if verified solve was made today
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

  const [isVerifyingLc, setIsVerifyingLc] = useState(false);
  const [lcVerifyMessage, setLcVerifyMessage] = useState<string | null>(null);

  const verifyLeetCodeSolved = async () => {
    const username = linkedConfig.leetcodeUsername?.trim();
    if (!username) {
      setLcVerifyMessage('Please link your LeetCode username in your profile to auto-verify.');
      return;
    }
    setIsVerifyingLc(true);
    setLcVerifyMessage(`Querying LeetCode for @${username}...`);
    try {
      const profile = await fetchLeetCodeFullProfile(username, true);
      if (profile) {
        setLeetcodeProfile(profile);
        const solved = lcPotd ? isLeetCodeProblemSolvedToday(profile, lcPotd.titleSlug, lcPotd.title, lcPotd.date) : false;
        if (solved) {
          localStorage.setItem(`sdetube_potd_leetcode_solved_${today}`, 'true');
          localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
          window.dispatchEvent(new CustomEvent('sdetube_potd_solved', { detail: { platform: 'leetcode', date: today } }));
          setIsSolvedEventTriggered(prev => prev + 1);
          setLcVerifyMessage('Verified! Solved today on LeetCode ✓');
        } else {
          setLcVerifyMessage(`No accepted submission for today found yet on @${username}. If you just submitted, please wait ~30s or use "Mark as Solved" below.`);
        }
      } else {
        setLcVerifyMessage(`Could not fetch profile for @${username}. You can mark it as solved manually below.`);
      }
    } catch {
      setLcVerifyMessage('Network check failed. You can mark it as solved manually below.');
    } finally {
      setIsVerifyingLc(false);
    }
  };

  const toggleManualLcSolved = () => {
    const current = localStorage.getItem(`sdetube_potd_leetcode_solved_${today}`) === 'true';
    if (current) {
      localStorage.removeItem(`sdetube_potd_leetcode_solved_${today}`);
      const sdeSolved = localStorage.getItem(`sdetube_potd_sdetube_solved_${today}`) === 'true';
      const gfgSolved = localStorage.getItem(`sdetube_potd_gfg_solved_${today}`) === 'true';
      if (!sdeSolved && !gfgSolved) {
        localStorage.removeItem(`sdetube_potd_solved_${today}`);
      }
    } else {
      localStorage.setItem(`sdetube_potd_leetcode_solved_${today}`, 'true');
      localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
    }
    window.dispatchEvent(new CustomEvent('sdetube_potd_solved', { detail: { platform: 'leetcode', date: today } }));
    setIsSolvedEventTriggered(prev => prev + 1);
  };

  const [isVerifyingGfg, setIsVerifyingGfg] = useState(false);
  const [gfgVerifyMessage, setGfgVerifyMessage] = useState<string | null>(null);

  const verifyGfgSolved = async () => {
    const username = linkedConfig.gfgUsername?.trim();
    if (!username) {
      setGfgVerifyMessage('Please link your GeeksforGeeks username in your profile to auto-verify.');
      return;
    }
    setIsVerifyingGfg(true);
    setGfgVerifyMessage(`Querying GeeksforGeeks for @${username}...`);
    try {
      const profile = await fetchGFGProfile(username, true);
      if (profile) {
        setGfgProfile(profile);
        const solved = gfgPotd ? isGfgProblemSolvedToday(profile, gfgPotd.titleSlug, gfgPotd.title) : false;
        if (solved) {
          localStorage.setItem(`sdetube_potd_gfg_solved_${today}`, 'true');
          localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
          if (gfgPotd) {
            markProblemSolved(gfgPotd.title, 10, gfgPotd.titleSlug);
          }
          window.dispatchEvent(new CustomEvent('sdetube_potd_solved', { detail: { platform: 'gfg', date: today } }));
          setIsSolvedEventTriggered(prev => prev + 1);
          setGfgVerifyMessage('Verified! Solved today on GeeksforGeeks ✓');
        } else {
          setGfgVerifyMessage(`No accepted submission for today found yet on @${username}. If you just submitted, please wait ~30s or use "Mark as Solved" below.`);
        }
      } else {
        setGfgVerifyMessage(`Could not fetch profile for @${username}. You can mark it as solved manually below.`);
      }
    } catch {
      setGfgVerifyMessage('Network check failed. You can mark it as solved manually below.');
    } finally {
      setIsVerifyingGfg(false);
    }
  };

  const toggleManualGfgSolved = () => {
    const current = localStorage.getItem(`sdetube_potd_gfg_solved_${today}`) === 'true';
    if (current) {
      localStorage.removeItem(`sdetube_potd_gfg_solved_${today}`);
      localStorage.removeItem(`sdetube_potd_gfg_manual_solved_${today}`);
      const sdeSolved = localStorage.getItem(`sdetube_potd_sdetube_solved_${today}`) === 'true';
      const lcSolved = localStorage.getItem(`sdetube_potd_leetcode_solved_${today}`) === 'true';
      if (!sdeSolved && !lcSolved) {
        localStorage.removeItem(`sdetube_potd_solved_${today}`);
      }
    } else {
      localStorage.setItem(`sdetube_potd_gfg_solved_${today}`, 'true');
      localStorage.setItem(`sdetube_potd_gfg_manual_solved_${today}`, 'true');
      localStorage.setItem(`sdetube_potd_solved_${today}`, 'true');
      if (gfgPotd) {
        markProblemSolved(gfgPotd.title, 10, gfgPotd.titleSlug);
      }
    }
    window.dispatchEvent(new CustomEvent('sdetube_potd_solved', { detail: { platform: 'gfg', date: today } }));
    setIsSolvedEventTriggered(prev => prev + 1);
  };

  const loadLeetCodePOTD = async (force = false) => {
    setIsLoadingLc(true);
    try {
      const res = await fetchLeetCodePOTD(force);
      setLcPotd(res);
      if (force && linkedConfig.leetcodeUsername?.trim()) {
        fetchLeetCodeFullProfile(linkedConfig.leetcodeUsername.trim(), true)
          .then(data => setLeetcodeProfile(data))
          .catch(() => {});
      }
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
      if (force && linkedConfig.gfgUsername?.trim()) {
        fetchGFGProfile(linkedConfig.gfgUsername.trim())
          .then(data => setGfgProfile(data))
          .catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to load GFG POTD', e);
    } finally {
      setIsLoadingGfg(false);
    }
  };

  const handleRefreshAll = async () => {
    clearPOTDCache();
    const lcUser = linkedConfig.leetcodeUsername?.trim();
    const gfgUser = linkedConfig.gfgUsername?.trim();
    await Promise.all([
      loadLeetCodePOTD(true),
      loadGfgPOTD(true),
      lcUser ? fetchLeetCodeFullProfile(lcUser, true).then(d => setLeetcodeProfile(d)).catch(() => {}) : Promise.resolve(),
      gfgUser ? fetchGFGProfile(gfgUser).then(d => setGfgProfile(d)).catch(() => {}) : Promise.resolve()
    ]);
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
                    title="Refresh LeetCode POTD & Profile"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingLc ? 'animate-spin text-amber-400' : ''}`} />
                  </button>
                </div>

                {/* LeetCode Sync & Manual Mark Solved Strip */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400">LeetCode Profile:</span>
                    {linkedConfig.leetcodeUsername ? (
                      <span className="text-amber-400 font-bold">@{linkedConfig.leetcodeUsername}</span>
                    ) : (
                      <span className="text-slate-500 italic">Not linked yet</span>
                    )}
                    {leetcodeProfile && (
                      checkLeetCodeProfilePrivacy(leetcodeProfile).isPublic ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Public ✓</span>
                        </span>
                      ) : (
                        <a
                          href="https://leetcode.com/profile/account/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-amber-900 transition-colors"
                          title="Click to make your profile public on LeetCode"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>Private (Make Public ↗)</span>
                        </a>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {linkedConfig.leetcodeUsername && (
                      <button
                        onClick={verifyLeetCodeSolved}
                        disabled={isVerifyingLc}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingLc ? 'animate-spin' : ''}`} />
                        <span>{isVerifyingLc ? 'Checking LeetCode...' : 'Verify Submission'}</span>
                      </button>
                    )}

                    <button
                      onClick={toggleManualLcSolved}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isLcPotdSolved
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                      title="Click to toggle solved status for today"
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isLcPotdSolved ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span>{isLcPotdSolved ? 'Solved ✓' : 'Mark as Solved'}</span>
                    </button>
                  </div>
                </div>

                {/* Private Submissions Alert Notification Banner */}
                {leetcodeProfile && checkLeetCodeProfilePrivacy(leetcodeProfile).isPrivate && (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-300">LeetCode Submissions Are Private</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-900/80 text-[9px] font-mono text-amber-300 border border-amber-700/60">Action Recommended</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Your LeetCode account has recent submissions set to <strong>Private</strong>. Make them public in LeetCode settings so SDETube can automatically verify your POTD solve.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <a
                        href="https://leetcode.com/profile/account/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                      >
                        <span>Make Public on LeetCode</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={verifyLeetCodeSolved}
                        disabled={isVerifyingLc}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingLc ? 'animate-spin' : ''}`} />
                        <span>Re-check</span>
                      </button>
                    </div>
                  </div>
                )}

                {lcVerifyMessage && (
                  <div className="text-[11px] font-mono px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    {lcVerifyMessage}
                  </div>
                )}
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

                {/* Linked Account Status & Quick Controls */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">Linked GFG Account:</span>
                    {linkedConfig.gfgUsername ? (
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                        @{linkedConfig.gfgUsername}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono italic">Not linked</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {linkedConfig.gfgUsername && (
                      <button
                        onClick={verifyGfgSolved}
                        disabled={isVerifyingGfg}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingGfg ? 'animate-spin' : ''}`} />
                        <span>{isVerifyingGfg ? 'Checking GFG...' : 'Verify Submission'}</span>
                      </button>
                    )}

                    <button
                      onClick={toggleManualGfgSolved}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isGfgPotdSolved
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                      title="Click to toggle solved status for today"
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isGfgPotdSolved ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span>{isGfgPotdSolved ? 'Solved ✓' : 'Mark as Solved'}</span>
                    </button>
                  </div>
                </div>

                {gfgVerifyMessage && (
                  <div className="text-[11px] font-mono px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    {gfgVerifyMessage}
                  </div>
                )}

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
