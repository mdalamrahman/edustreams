import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  Filter, 
  RefreshCw, 
  ExternalLink, 
  PlusCircle, 
  RotateCcw, 
  Code2, 
  Layers, 
  Check, 
  BookOpen, 
  ChevronRight,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { 
  getAllAvailableProblems, 
  CatalogProblemItem, 
  getLocalSdePotdOverride, 
  fetchServerSdePotd, 
  setAdminPotdOverride, 
  resetAdminPotdOverride, 
  getTodayDateString,
  AdminPotdRecord 
} from '../lib/potdService';
import { getUniversalSdePotd, DSAProblem } from '../lib/dsaSheetsData';

interface AdminPOTDManagerProps {
  onPotdChanged?: () => void;
}

export const AdminPOTDManager: React.FC<AdminPOTDManagerProps> = ({ onPotdChanged }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog');
  
  // Current active POTD state
  const [currentPotd, setCurrentPotd] = useState<AdminPotdRecord | DSAProblem>(() => {
    return getLocalSdePotdOverride(selectedDate) || getUniversalSdePotd();
  });
  const [isOverridden, setIsOverridden] = useState<boolean>(() => {
    return Boolean(getLocalSdePotdOverride(selectedDate));
  });
  const [isLoadingActive, setIsLoadingActive] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Catalog Picker state
  const allProblems = useMemo(() => getAllAvailableProblems(), []);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sheetFilter, setSheetFilter] = useState<string>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Custom Form state
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSlug, setCustomSlug] = useState<string>('');
  const [customDifficulty, setCustomDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [customCategory, setCustomCategory] = useState<string>('Algorithms');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');

  // Auto-slugify custom title
  const handleTitleChange = (val: string) => {
    setCustomTitle(val);
    if (!customSlug || customSlug === customTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) {
      setCustomSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  };

  // Sync active POTD on date change or mount
  const refreshActivePotd = async () => {
    setIsLoadingActive(true);
    try {
      const serverResult = await fetchServerSdePotd(selectedDate);
      if (serverResult.isOverridden && serverResult.problem) {
        setCurrentPotd(serverResult.problem);
        setIsOverridden(true);
      } else {
        const local = getLocalSdePotdOverride(selectedDate);
        if (local) {
          setCurrentPotd(local);
          setIsOverridden(true);
        } else {
          setCurrentPotd(getUniversalSdePotd());
          setIsOverridden(false);
        }
      }
    } finally {
      setIsLoadingActive(false);
    }
  };

  useEffect(() => {
    refreshActivePotd();
  }, [selectedDate]);

  // Catalog filtered list
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allProblems.filter((item) => {
      if (sheetFilter !== 'ALL' && item.sheet !== sheetFilter) return false;
      if (difficultyFilter !== 'ALL' && item.difficulty !== difficultyFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [allProblems, searchQuery, sheetFilter, difficultyFilter]);

  // Sheets list for filter
  const sheetOptions = useMemo(() => {
    const set = new Set<string>();
    allProblems.forEach(p => set.add(p.sheet));
    return ['ALL', ...Array.from(set)];
  }, [allProblems]);

  // Action: Select question from catalog
  const handleSelectFromCatalog = async (item: CatalogProblemItem) => {
    setIsSaving(true);
    setActionNotice(null);
    try {
      const result = await setAdminPotdOverride({
        id: item.id,
        name: item.name,
        title: item.name,
        slug: item.slug,
        difficulty: item.difficulty,
        category: item.category,
        leetcode: item.leetcode || `https://leetcode.com/problems/${item.slug}/`,
        sheet: item.sheet,
        targetDate: selectedDate
      });

      setCurrentPotd(result.problem);
      setIsOverridden(true);
      setActionNotice({
        type: 'success',
        text: `Active POTD updated to "${item.name}" for ${selectedDate}!`
      });
      onPotdChanged?.();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        text: err?.message || 'Failed to update POTD.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Action: Submit Custom Question Form
  const handleSaveCustomPotd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      setActionNotice({ type: 'error', text: 'Problem title is required.' });
      return;
    }

    setIsSaving(true);
    setActionNotice(null);
    try {
      const slug = customSlug.trim() || customTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const leetcode = customUrl.trim() || `https://leetcode.com/problems/${slug}/`;

      const result = await setAdminPotdOverride({
        name: customTitle.trim(),
        title: customTitle.trim(),
        slug,
        difficulty: customDifficulty,
        category: customCategory.trim() || 'Custom Challenge',
        leetcode,
        sheet: 'Admin Custom Problem',
        description: customDescription.trim(),
        targetDate: selectedDate
      });

      setCurrentPotd(result.problem);
      setIsOverridden(true);
      setActionNotice({
        type: 'success',
        text: `Custom POTD "${customTitle}" published for ${selectedDate}!`
      });

      // Clear custom fields
      setCustomTitle('');
      setCustomSlug('');
      setCustomUrl('');
      setCustomDescription('');
      onPotdChanged?.();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        text: err?.message || 'Failed to publish custom POTD.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Action: Reset to rotational schedule
  const handleResetToRotation = async () => {
    setIsSaving(true);
    setActionNotice(null);
    try {
      await resetAdminPotdOverride(selectedDate);
      setCurrentPotd(getUniversalSdePotd());
      setIsOverridden(false);
      setActionNotice({
        type: 'success',
        text: `Reverted to default rotational POTD for ${selectedDate}.`
      });
      onPotdChanged?.();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        text: err?.message || 'Failed to reset POTD.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-800/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
              <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                Problem of the Day (POTD) Control Center
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300">
                  Admin Realtime
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Override today's active challenge for all students worldwide across SDETube.
              </p>
            </div>
          </div>

          {/* Target Date Picker */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400 font-semibold">Target Date:</span>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-slate-200 outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between animate-fadeIn ${
          actionNotice.type === 'success' 
            ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300' 
            : 'bg-rose-950/70 border-rose-700/60 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldCheck className="w-4 h-4 text-rose-400" />}
            <span>{actionNotice.text}</span>
          </div>
          <button 
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current Active POTD Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current POTD for {selectedDate}:</span>
            {isOverridden ? (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Admin Override Active
              </span>
            ) : (
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <RotateCcw className="w-2.5 h-2.5 text-purple-400" /> Default Rotation Seed
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshActivePotd}
              disabled={isLoadingActive}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              title="Sync latest POTD state"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingActive ? 'animate-spin text-purple-400' : ''}`} />
            </button>
            {isOverridden && (
              <button
                onClick={handleResetToRotation}
                disabled={isSaving}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/50 text-rose-300 text-xs font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Rotation</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              {currentPotd?.name || (currentPotd as any)?.title || 'No Problem Title'}
              {(currentPotd as any)?.leetcode && (
                <a
                  href={(currentPotd as any).leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-indigo-400 transition-colors inline-flex items-center"
                  title="Open Problem on LeetCode"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                currentPotd?.difficulty === 'Easy' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : currentPotd?.difficulty === 'Hard'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {currentPotd?.difficulty || 'Medium'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                {currentPotd?.category || (currentPotd as any)?.topic || 'Algorithms'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-800/40 text-indigo-300 text-[11px]">
                {(currentPotd as any)?.sheet || 'SDE Sheet 191'}
              </span>
              {currentPotd?.slug && (
                <span className="text-slate-500 text-[10px] hidden md:inline">
                  slug: {currentPotd.slug}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Select from Available Questions ({allProblems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'custom'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Provide Custom / New POTD</span>
        </button>
      </div>

      {/* TAB 1: Catalog Picker */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problem, slug, or topic..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs font-sans focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Sheet Filter */}
            <div>
              <select
                value={sheetFilter}
                onChange={(e) => setSheetFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-sans focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {sheetOptions.map((sheet) => (
                  <option key={sheet} value={sheet}>
                    {sheet === 'ALL' ? 'All DSA Sheets' : sheet}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-sans focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="ALL">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>Showing {filteredCatalog.length} matching questions</span>
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setSheetFilter('ALL'); setDifficultyFilter('ALL'); }}
                className="text-purple-400 hover:text-purple-300 underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Scrollable Questions List */}
          <div className="max-h-[460px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {filteredCatalog.slice(0, 80).map((item) => {
              const isSelected = currentPotd?.slug === item.slug;
              return (
                <div
                  key={`${item.sheet}-${item.slug}`}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected 
                      ? 'bg-purple-950/40 border-purple-600/70 shadow-md' 
                      : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-200 hover:text-white">
                        {item.name}
                      </span>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 text-purple-400" /> Active Today
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span className={`px-1.5 py-0.2 rounded font-bold ${
                        item.difficulty === 'Easy' 
                          ? 'text-emerald-400' 
                          : item.difficulty === 'Hard'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}>
                        {item.difficulty}
                      </span>
                      <span>•</span>
                      <span>{item.category}</span>
                      <span>•</span>
                      <span className="text-indigo-400">{item.sheet}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {item.leetcode && (
                      <a
                        href={item.leetcode}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Open on LeetCode"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleSelectFromCatalog(item)}
                      disabled={isSaving || isSelected}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected 
                          ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-400 cursor-default'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Active POTD</span>
                        </>
                      ) : (
                        <>
                          <span>Set as POTD</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredCatalog.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                No matching questions found for "{searchQuery}". Try a different filter or provide a custom question.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Custom Question Form */}
      {activeTab === 'custom' && (
        <form onSubmit={handleSaveCustomPotd} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-purple-400" />
              Provide Custom Problem of the Day
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter any external or internal problem to deploy as today's POTD on SDETube.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Problem Title */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300">Problem Title *</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., Median of Two Sorted Arrays, Word Break III"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Problem Slug */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Problem Slug</label>
              <input
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="e.g., median-of-two-sorted-arrays"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Difficulty</label>
              <select
                value={customDifficulty}
                onChange={(e) => setCustomDifficulty(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Category / Topic */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Category / Topic</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g., Dynamic Programming, Trees, System Design"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* LeetCode / External URL */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">LeetCode / Problem URL</label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Optional Description */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300">Problem Statement / Notes (Optional)</label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Brief problem statement or interview intuition tips..."
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCustomTitle('');
                setCustomSlug('');
                setCustomUrl('');
                setCustomDescription('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSaving || !customTitle.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isSaving ? 'Publishing...' : 'Publish as Active POTD'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
