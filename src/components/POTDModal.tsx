import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, ExternalLink, Code, CheckCircle2, Trophy, ArrowRight, Zap, Target, RefreshCw } from 'lucide-react';
import { fetchLeetCodePOTD, LeetCodeDailyQuestion } from '../lib/leetcodeApi';
import { SDEProblem, SDE_SHEET_DATA } from '../lib/sdeSheetData';

interface POTDModalProps {
  onClose: () => void;
  onSolveSdeProblem: (problem: SDEProblem) => void;
}

export const POTDModal: React.FC<POTDModalProps> = ({ onClose, onSolveSdeProblem }) => {
  const [activeTab, setActiveTab] = useState<'sdetube' | 'leetcode'>('sdetube');
  const [lcPotd, setLcPotd] = useState<LeetCodeDailyQuestion | null>(null);
  const [isLoadingLc, setIsLoadingLc] = useState(false);

  // Today's Curated SDETube POTD
  const sdePotd: SDEProblem = React.useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const daySeed = Math.abs(today.split('-').reduce((acc, p) => acc + parseInt(p, 10), 0));
    return SDE_SHEET_DATA[daySeed % SDE_SHEET_DATA.length] || SDE_SHEET_DATA[0];
  }, []);

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
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Daily Coding Challenge (POTD)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-700 text-amber-300 font-mono text-[11px] font-bold">
                  Today's Streak
                </span>
              </h3>
              <p className="text-xs text-slate-400">Choose between SDETube's Curated POTD or the Official LeetCode Daily Problem</p>
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
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>SDETube Curated POTD</span>
          </button>

          <button
            onClick={() => setActiveTab('leetcode')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'leetcode'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4 text-amber-200" />
            <span>Official LeetCode POTD</span>
          </button>
        </div>

        {/* OPTION 1: SDETUBE CURATED POTD */}
        {activeTab === 'sdetube' && (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 font-mono text-[10px] text-indigo-300 font-bold">
                {sdePotd.category}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                sdePotd.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                sdePotd.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                'bg-rose-950 border-rose-700 text-rose-300'
              }`}>
                {sdePotd.difficulty}
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-100">{sdePotd.name}</h4>
              <p className="text-xs text-slate-400 mt-1">High-frequency interview challenge selected from the 191 SDE Sheet.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onSolveSdeProblem(sdePotd);
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Code className="w-4 h-4" />
                <span>Solve in SDETube Monaco IDE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* OPTION 2: OFFICIAL LEETCODE POTD */}
        {activeTab === 'leetcode' && (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            {isLoadingLc ? (
              <div className="py-8 text-center text-slate-400 font-mono text-xs animate-pulse">
                Fetching Official Daily Challenge from LeetCode API...
              </div>
            ) : lcPotd ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {lcPotd.topicTags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        {tag}
                      </span>
                    ))}
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
                  <h4 className="text-base font-bold text-slate-100">{lcPotd.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Official Daily Problem &bull; {lcPotd.date}</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={lcPotd.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Solve Directly on LeetCode</span>
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
                Failed to load LeetCode POTD.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
