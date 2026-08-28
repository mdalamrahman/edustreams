import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Flame, ExternalLink, Code, CheckCircle2, Trophy, ArrowRight, Zap, Target, RefreshCw } from 'lucide-react';
import { fetchLeetCodePOTD, LeetCodeDailyQuestion } from '../lib/leetcodeApi';
import { SDEProblem, SDE_SHEET_DATA } from '../lib/sdeSheetData';
import { isProblemSlugSolved, isPotdSolvedToday } from '../lib/analytics';
import { getSolvedIds } from '../lib/progressService';

interface POTDModalProps {
  onClose: () => void;
  onSolveSdeProblem: (problem: SDEProblem) => void;
}

export const POTDModal: React.FC<POTDModalProps> = ({ onClose, onSolveSdeProblem }) => {
  const [activeTab, setActiveTab] = useState<'sdetube' | 'leetcode'>('sdetube');
  const [lcPotd, setLcPotd] = useState<LeetCodeDailyQuestion | null>(null);
  const [isLoadingLc, setIsLoadingLc] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  // Today's Curated SDETube POTD
  const sdePotd: SDEProblem = useMemo(() => {
    const daySeed = Math.abs(today.split('-').reduce((acc, p) => acc + parseInt(p, 10), 0));
    return SDE_SHEET_DATA[daySeed % SDE_SHEET_DATA.length] || SDE_SHEET_DATA[0];
  }, [today]);

  const [isSolvedEventTriggered, setIsSolvedEventTriggered] = useState(0);

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
      return isProblemSlugSolved(sdePotd.slug || sdePotd.name);
    } catch {
      return false;
    }
  }, [sdePotd, isSolvedEventTriggered]);

  // Check if LeetCode POTD is solved
  const isLcPotdSolved = useMemo(() => {
    if (!lcPotd) return false;
    if (localStorage.getItem(`sdetube_potd_leetcode_solved_${today}`) === 'true') return true;
    return isProblemSlugSolved(lcPotd.titleSlug || lcPotd.title);
  }, [lcPotd, today, isSolvedEventTriggered]);

  const isAnyPotdSolved = isSdePotdSolved || isLcPotdSolved;

  const loadLeetCodePOTD = async () => {
    setIsLoadingLc(true);
    const res = await fetchLeetCodePOTD();
    setLcPotd(res);
    setIsLoadingLc(false);
  };

  useEffect(() => {
    loadLeetCodePOTD();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/20 shadow-2xl p-6 sm:p-8 overflow-hidden">
        
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
              <p className="text-xs text-slate-400">Choose between SDETube's Curated POTD or the Global Daily Challenge</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-3 my-5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('sdetube')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'sdetube'
                ? isSdePotdSolved 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                  : 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>SDETube Curated POTD</span>
            {isSdePotdSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
          </button>

          <button
            onClick={() => setActiveTab('leetcode')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'leetcode'
                ? isLcPotdSolved 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                  : 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4 text-amber-200" />
            <span>Global POTD</span>
            {isLcPotdSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
          </button>
        </div>

        {/* OPTION 1: SDETUBE CURATED POTD */}
        {activeTab === 'sdetube' && (
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isSdePotdSolved 
              ? 'bg-emerald-950/20 border-emerald-500/40' 
              : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
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
              <h4 className={`text-base font-bold flex items-center gap-2 ${
                isSdePotdSolved ? 'text-emerald-200' : 'text-slate-100'
              }`}>
                <span>{sdePotd.name}</span>
                {isSdePotdSolved && <span className="text-emerald-400 text-xs">✓ Done</span>}
              </h4>
              <p className="text-xs text-slate-400 mt-1">High-frequency interview challenge selected from the SDE Sheet.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onSolveSdeProblem(sdePotd);
                  onClose();
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isSdePotdSolved
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-600/30'
                }`}
              >
                {isSdePotdSolved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Solved Today ✓ (Review Solution in IDE)</span>
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4" />
                    <span>Solve in SDETube IDE</span>
                  </>
                )}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* OPTION 2: GLOBAL POTD */}
        {activeTab === 'leetcode' && (
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLcPotdSolved 
              ? 'bg-emerald-950/20 border-emerald-500/40' 
              : 'bg-slate-900/90 border-slate-800'
          }`}>
            {isLoadingLc ? (
              <div className="py-8 text-center text-slate-400 font-mono text-xs animate-pulse">
                Fetching Global Daily Challenge...
              </div>
            ) : lcPotd ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
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
                  <h4 className={`text-base font-bold flex items-center gap-2 ${
                    isLcPotdSolved ? 'text-emerald-200' : 'text-slate-100'
                  }`}>
                    <span>{lcPotd.title}</span>
                    {isLcPotdSolved && <span className="text-emerald-400 text-xs">✓ Done</span>}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Global Daily Challenge &bull; {lcPotd.date}</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
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
                    className={`flex-1 py-3 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isLcPotdSolved
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-600/30'
                        : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-600/30'
                    }`}
                  >
                    {isLcPotdSolved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>Solved Today ✓ (Review Solution in IDE)</span>
                      </>
                    ) : (
                      <>
                        <Code className="w-4 h-4" />
                        <span>Solve in SDETube IDE</span>
                      </>
                    )}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={lcPotd.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 transition-all cursor-pointer"
                    title="Open on LeetCode"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={loadLeetCodePOTD}
                    className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                    title="Refresh POTD"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs font-mono">
                Failed to load Global POTD.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
