import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Flame,
  Sparkles,
  CheckCircle2,
  Search,
  RefreshCw,
  ExternalLink,
  RotateCcw,
  Code2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  ArrowRight,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  fetchServerPotd,
  setServerPotd,
  resetServerPotd,
  getTodayDateString,
  AdminPotdRecord
} from '../lib/potdAdminApi';
import {
  ALL_ADMIN_PROBLEMS,
  AdminProblemItem,
  toSlug,
  fetchExtendedCatalog
} from '../lib/problemCatalog';

interface AdminPOTDManagerProps {
  onPotdChanged?: () => void;
  onOpenInStudio?: (slug: string) => void;
}

export const AdminPOTDManager: React.FC<AdminPOTDManagerProps> = ({
  onPotdChanged,
  onOpenInStudio
}) => {
  const [catalog, setCatalog] = useState<AdminProblemItem[]>(ALL_ADMIN_PROBLEMS);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [currentPotd, setCurrentPotd] = useState<AdminPotdRecord | null>(null);
  const [isOverridden, setIsOverridden] = useState<boolean>(false);
  const [isLoadingActive, setIsLoadingActive] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Load full 3,400+ problem catalog asynchronously
  useEffect(() => {
    fetchExtendedCatalog().then(setCatalog);
  }, []);

  // Selected Problem from Catalog (no typing allowed)
  const [selectedProblem, setSelectedProblem] = useState<AdminProblemItem | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Problem Catalog Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sheetFilter, setSheetFilter] = useState<string>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dsa' | 'lld'>('all');
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Sync active POTD on date change or mount
  const refreshActivePotd = async () => {
    setIsLoadingActive(true);
    try {
      const serverResult = await fetchServerPotd(selectedDate);
      if (serverResult.isOverridden && serverResult.problem) {
        setCurrentPotd(serverResult.problem);
        setIsOverridden(true);
      } else {
        setCurrentPotd(null);
        setIsOverridden(false);
      }
    } finally {
      setIsLoadingActive(false);
    }
  };

  useEffect(() => {
    refreshActivePotd();
  }, [selectedDate]);

  // Catalog filtered list
  const filteredProblems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return catalog.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (sheetFilter !== 'ALL' && !item.sheets.includes(sheetFilter.toLowerCase())) return false;
      if (difficultyFilter !== 'ALL' && item.difficulty !== difficultyFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.companies?.some(c => c.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, sheetFilter, difficultyFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / itemsPerPage));
  const paginatedProblems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProblems.slice(start, start + itemsPerPage);
  }, [filteredProblems, page]);

  // Handle Publish POTD
  const handlePublishPotd = async () => {
    if (!selectedProblem) {
      setActionNotice({ type: 'error', text: 'Please select a problem from the catalog first.' });
      return;
    }

    setIsPublishing(true);
    setActionNotice(null);
    try {
      const res = await setServerPotd({
        id: selectedProblem.id,
        name: selectedProblem.name,
        title: selectedProblem.name,
        slug: selectedProblem.slug,
        difficulty: selectedProblem.difficulty,
        category: selectedProblem.category,
        topic: selectedProblem.category,
        leetcode: selectedProblem.leetcode || `https://leetcode.com/problems/${selectedProblem.slug}/`,
        sheet: selectedProblem.sheets[0] || 'Admin Curated',
        description: selectedProblem.description || '',
        companies: selectedProblem.companies || ['Top Tech', 'FAANG'],
        date: selectedDate
      });

      if (res.success && res.problem) {
        setCurrentPotd(res.problem);
        setIsOverridden(true);
        setActionNotice({
          type: 'success',
          text: `🎉 POTD successfully scheduled as "${selectedProblem.name}" for ${selectedDate} in Cloudflare R2!`
        });
        onPotdChanged?.();
      } else {
        setActionNotice({
          type: 'error',
          text: res.error || 'Failed to update POTD in Cloudflare R2.'
        });
      }
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        text: err?.message || 'Failed to publish POTD.'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle Reset to Default Rotation
  const handleResetPotd = async () => {
    if (!window.confirm(`Reset POTD for ${selectedDate} back to standard rotational schedule?`)) return;

    setIsPublishing(true);
    setActionNotice(null);
    try {
      const res = await resetServerPotd(selectedDate);
      if (res.success) {
        setCurrentPotd(null);
        setIsOverridden(false);
        setActionNotice({
          type: 'success',
          text: `POTD reset to default rotational seed for ${selectedDate}.`
        });
        onPotdChanged?.();
      } else {
        setActionNotice({
          type: 'error',
          text: res.error || 'Failed to reset POTD.'
        });
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-800/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-purple-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-purple-900/30">
              <Flame className="w-8 h-8 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Problem of the Day (POTD) Mission Control
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Cloudflare R2 Synchronized
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Set, override, or schedule the daily coding challenge for all students across SDETube.
              </p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-3 bg-slate-950/90 p-2.5 px-4 rounded-2xl border border-slate-800 shadow-inner">
            <Calendar className="w-4 h-4 text-purple-400" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Target Date</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs font-mono font-black text-white outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={refreshActivePotd}
              disabled={isLoadingActive}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh POTD Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingActive ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between animate-fadeIn ${
          actionNotice.type === 'success'
            ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
            : actionNotice.type === 'info'
            ? 'bg-cyan-950/70 border-cyan-700/60 text-cyan-300'
            : 'bg-rose-950/70 border-rose-700/60 text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : actionNotice.type === 'info' ? (
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{actionNotice.text}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer ml-4 font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active POTD Status Card for Selected Date */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
              Status for {selectedDate} {selectedDate === getTodayDateString() ? '(TODAY)' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isOverridden ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Admin Override (Cloudflare R2)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono text-[10px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Default Rotational Seed Schedule
              </span>
            )}

            {isOverridden && (
              <button
                onClick={handleResetPotd}
                disabled={isPublishing}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-slate-700"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            )}
          </div>
        </div>

        {currentPotd ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-black text-white">{currentPotd.name}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  currentPotd.difficulty === 'Easy'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : currentPotd.difficulty === 'Medium'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {currentPotd.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold font-mono">
                  {currentPotd.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                slug: <strong className="text-slate-300">{currentPotd.slug}</strong> &bull; sheet: <span className="text-indigo-400">{currentPotd.sheet || 'Curated'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentPotd.leetcode && (
                <a
                  href={currentPotd.leetcode}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>LeetCode</span>
                </a>
              )}
              {onOpenInStudio && (
                <button
                  onClick={() => onOpenInStudio(currentPotd.slug)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-indigo-500/40 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Open in Studio</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center py-6 space-y-1">
            <p className="text-xs text-slate-400">
              No manual override for <strong className="text-slate-300">{selectedDate}</strong>.
            </p>
            <p className="text-[11px] text-slate-500">
              Students will receive the automatically rotated algorithmic problem from the SDE sheet schedule.
            </p>
          </div>
        )}
      </div>

      {/* POTD Problem Picker (No Typing Form: Select from Available Problems) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Searchable Problem Catalog Table */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                Select Problem from Catalog
              </h3>
              <p className="text-[11px] text-slate-400">
                Choose any DSA or LLD problem to publish as the challenge for {selectedDate}.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-1 rounded-xl border border-cyan-800/40">
              {filteredProblems.length} Available
            </span>
          </div>

          {/* Search Bar & Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by problem title, slug, topic, or company (e.g. Two Sum, Tree, Google)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Type Filter */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => { setTypeFilter('all'); setPage(1); }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    typeFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => { setTypeFilter('dsa'); setPage(1); }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    typeFilter === 'dsa' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  DSA (660+)
                </button>
                <button
                  onClick={() => { setTypeFilter('lld'); setPage(1); }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    typeFilter === 'lld' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  LLD (10)
                </button>
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => { setDifficultyFilter(diff); setPage(1); }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      difficultyFilter === diff
                        ? diff === 'Easy'
                          ? 'bg-emerald-600 text-white'
                          : diff === 'Medium'
                          ? 'bg-amber-600 text-white'
                          : diff === 'Hard'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Sheet Filter */}
              <select
                value={sheetFilter}
                onChange={(e) => { setSheetFilter(e.target.value); setPage(1); }}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 font-sans outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Curricula & Sheets ({catalog.length})</option>
                <option value="company_dsa">Company DSA (3,400+ Problems)</option>
                <option value="sde">Striver SDE Sheet (191)</option>
                <option value="a2z">Striver A2Z Sheet (474)</option>
                <option value="blind75">NeetCode Blind 75</option>
                <option value="79">SDETube Core 79</option>
                <option value="lld">LLD System Design (10)</option>
              </select>
            </div>
          </div>

          {/* Problem List Items */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {paginatedProblems.map((prob) => {
              const isSelected = selectedProblem?.slug === prob.slug;
              return (
                <div
                  key={prob.id}
                  onClick={() => setSelectedProblem(prob)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-950/50'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white truncate">{prob.name}</span>
                      <span className={`px-2 py-0.2 rounded-md text-[9px] font-mono font-bold ${
                        prob.difficulty === 'Easy'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : prob.difficulty === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {prob.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950/50 px-1.5 py-0.2 rounded border border-purple-800/40">
                        {prob.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                      <span>slug: {prob.slug}</span>
                      {prob.companies && prob.companies.length > 0 && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Building2 className="w-2.5 h-2.5 text-cyan-400" />
                          {prob.companies.slice(0, 3).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <span>Pick</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {paginatedProblems.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-500 space-y-1">
                <p>No problems match current filters.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSheetFilter('ALL'); setDifficultyFilter('ALL'); setTypeFilter('all'); }}
                  className="text-cyan-400 font-bold hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Selected Problem Confirmation & Publish Card */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                POTD Publish Preview
              </h3>
            </div>

            {selectedProblem ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 block">Selected Challenge</span>
                  <h4 className="text-base font-black text-white">{selectedProblem.name}</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[9px] font-mono uppercase text-slate-500 block">Difficulty</span>
                    <span className={`font-bold font-mono ${
                      selectedProblem.difficulty === 'Easy' ? 'text-emerald-400' : selectedProblem.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {selectedProblem.difficulty}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[9px] font-mono uppercase text-slate-500 block">Category</span>
                    <span className="font-bold text-slate-200 truncate block">
                      {selectedProblem.category}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Target Scheduling Date</span>
                  <div className="flex items-center gap-2 text-slate-200 font-mono font-bold">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>{selectedDate}</span>
                    {selectedDate === getTodayDateString() && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px]">TODAY</span>
                    )}
                  </div>
                </div>

                {selectedProblem.description && (
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 max-h-28 overflow-y-auto">
                    {selectedProblem.description}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-dashed border-slate-800 text-center py-10 space-y-2">
                <Flame className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-400">No problem currently selected</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Click <strong>Pick</strong> on any problem in the catalog to prepare it for deployment to Cloudflare R2.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800">
            <button
              onClick={handlePublishPotd}
              disabled={!selectedProblem || isPublishing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-purple-950/50 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Synchronizing with Cloudflare R2...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>Set as POTD for {selectedDate}</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-500 font-mono">
              Direct R2 Upload &bull; All connected student browsers updated live
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
