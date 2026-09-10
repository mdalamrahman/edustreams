import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  ExternalLink,
  Code2,
  Sparkles,
  ChevronDown,
  TrendingUp,
  Calendar,
  Layers,
  FileText,
  RotateCcw,
  ArrowUpDown,
  BookOpen,
  Zap,
  Clock,
  ShieldAlert
} from 'lucide-react';
import {
  fetchCompanyProblemsDataset,
  CompanyProblemsDataset,
  CompanyProblemItem,
  CompanySummary,
  TimeframeKey,
  TIMEFRAME_LABELS,
  FEATURED_COMPANIES,
  getCompanyProblemsForTimeframe
} from '../lib/companyProblemsData';
import { isProblemSlugSolved, toggleProblemSolvedGlobally } from '../lib/analytics';
import { SDEProblem } from '../lib/dsaSheetsData';

interface CompanyDSAProblemsProps {
  onOpenCodingWorkspace: (problem: SDEProblem) => void;
  onOpenNotes?: (problem: SDEProblem) => void;
  initialCompany?: string;
}

export const CompanyDSAProblems: React.FC<CompanyDSAProblemsProps> = ({
  onOpenCodingWorkspace,
  onOpenNotes,
  initialCompany = 'google'
}) => {
  const [dataset, setDataset] = useState<CompanyProblemsDataset | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCompany, setSelectedCompany] = useState<string>(() => {
    try {
      return localStorage.getItem('sdetube_last_selected_company') || initialCompany;
    } catch {
      return initialCompany;
    }
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeKey>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Solved' | 'Unsolved'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'frequency' | 'acceptance_desc' | 'acceptance_asc' | 'id_asc' | 'title_asc'>('frequency');

  // Company Dropdown Combobox Search
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Re-render tick when any problem is solved in the workspace
  const [syncVersion, setSyncVersion] = useState(0);

  useEffect(() => {
    const handleSync = () => setSyncVersion((v) => v + 1);
    window.addEventListener('sdetube_problem_solved', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('sdetube_problem_solved', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Fetch Dataset on mount
  useEffect(() => {
    setLoading(true);
    fetchCompanyProblemsDataset()
      .then((data) => {
        setDataset(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[CompanyDSAProblems] Failed to load dataset:', err);
        setLoading(false);
      });
  }, []);

  // Save selected company to localStorage
  useEffect(() => {
    if (selectedCompany) {
      try {
        localStorage.setItem('sdetube_last_selected_company', selectedCompany);
      } catch {}
    }
  }, [selectedCompany]);

  // Click outside to close company dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCompany, selectedTimeframe, selectedDifficulty, selectedStatus, searchQuery, sortBy]);

  // Active Company Object
  const currentCompanyData = useMemo(() => {
    if (!dataset || !dataset.companies) return null;
    return dataset.companies[selectedCompany] || null;
  }, [dataset, selectedCompany]);

  // Timeframe counts for active company
  const availableTimeframes = useMemo(() => {
    if (!currentCompanyData || !currentCompanyData.timeframes) return [];
    const keys = Object.keys(currentCompanyData.timeframes) as TimeframeKey[];
    return keys;
  }, [currentCompanyData]);

  // Raw list of problems for this company & timeframe
  const rawCompanyProblems = useMemo(() => {
    if (!dataset) return [];
    // Dependency on syncVersion triggers instant re-evaluation of isSolved
    void syncVersion;
    return getCompanyProblemsForTimeframe(dataset, selectedCompany, selectedTimeframe);
  }, [dataset, selectedCompany, selectedTimeframe, syncVersion]);

  // Filtered & Sorted Problems List
  const filteredProblems = useMemo(() => {
    let list = [...rawCompanyProblems];

    // Difficulty filter
    if (selectedDifficulty !== 'All') {
      list = list.filter((p) => p.difficulty === selectedDifficulty);
    }

    // Status filter
    if (selectedStatus === 'Solved') {
      list = list.filter((p) => p.isSolved);
    } else if (selectedStatus === 'Unsolved') {
      list = list.filter((p) => !p.isSolved);
    }

    // Search query (matches title, slug or ID)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'frequency') return b.frequency - a.frequency;
      if (sortBy === 'acceptance_desc') return b.acceptance - a.acceptance;
      if (sortBy === 'acceptance_asc') return a.acceptance - b.acceptance;
      if (sortBy === 'id_asc') return a.id - b.id;
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
      return 0;
    });

    return list;
  }, [rawCompanyProblems, selectedDifficulty, selectedStatus, searchQuery, sortBy]);

  // Total solved in current company set
  const companySolvedCount = useMemo(() => {
    return rawCompanyProblems.filter((p) => p.isSolved).length;
  }, [rawCompanyProblems]);

  // Paginated Problems
  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / pageSize));
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProblems.slice(start, start + pageSize);
  }, [filteredProblems, currentPage, pageSize]);

  // Filtered company list for dropdown
  const filteredCompaniesForDropdown = useMemo(() => {
    if (!dataset || !dataset.companies_summary) return [];
    if (!companySearchQuery.trim()) return dataset.companies_summary;
    const q = companySearchQuery.toLowerCase().trim();
    return dataset.companies_summary.filter((c) =>
      c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [dataset, companySearchQuery]);

  // Toggle problem solved
  const handleToggleSolved = (item: CompanyProblemItem) => {
    toggleProblemSolvedGlobally(item.slug, item.title, item.id);
    setSyncVersion((v) => v + 1);
  };

  // Open Problem in LeetCode Workspace
  const handleSolveInWorkspace = (item: CompanyProblemItem) => {
    const sdeProblem: SDEProblem = {
      id: item.id,
      sheetType: 'sde',
      category: `${currentCompanyData?.name || 'Company'} Interview Questions`,
      subcategory: TIMEFRAME_LABELS[selectedTimeframe]?.label || 'Curated',
      name: item.title,
      leetcode: item.url,
      gfg: `https://www.geeksforgeeks.org/problems/${item.slug}/1`,
      companies: [currentCompanyData?.name || 'Tech Company'],
      difficulty: item.difficulty,
      rating: `${item.frequency}% Frequency`,
      slug: item.slug
    };
    onOpenCodingWorkspace(sdeProblem);
  };

  // Open Notes Modal
  const handleOpenProblemNotes = (item: CompanyProblemItem) => {
    if (!onOpenNotes) return;
    const sdeProblem: SDEProblem = {
      id: item.id,
      sheetType: 'sde',
      category: `${currentCompanyData?.name || 'Company'} Interview Questions`,
      subcategory: TIMEFRAME_LABELS[selectedTimeframe]?.label || 'Curated',
      name: item.title,
      leetcode: item.url,
      gfg: `https://www.geeksforgeeks.org/problems/${item.slug}/1`,
      companies: [currentCompanyData?.name || 'Tech Company'],
      difficulty: item.difficulty,
      rating: `${item.frequency}% Frequency`,
      slug: item.slug
    };
    onOpenNotes(sdeProblem);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Loading 3,400+ Company-Wise DSA Problems...</p>
        <span className="text-xs text-slate-500">Indexing 659 companies and 5 timeframe horizons</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. HERO HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-mono">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Company-Wise & Timeframe Curated DSA</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Company-Wise <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">DSA Interview Problems</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Target your dream company with precision. Browse 3,400+ authentic interview problems asked at 650+ tech giants, filtered across 30 Days, 3 Months, 6 Months, 1 Year+, and All Time.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col">
              <span className="text-[11px] font-medium text-slate-400">Total Companies</span>
              <span className="text-lg sm:text-xl font-black text-slate-100 mt-0.5">
                {dataset?.total_companies.toLocaleString() || '659'}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono mt-0.5">Global Tech</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col">
              <span className="text-[11px] font-medium text-slate-400">Unique Problems</span>
              <span className="text-lg sm:text-xl font-black text-slate-100 mt-0.5">
                {dataset?.total_problems.toLocaleString() || '3,399'}
              </span>
              <span className="text-[10px] text-indigo-400 font-mono mt-0.5">LeetCode Ingested</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col">
              <span className="text-[11px] font-medium text-slate-400">{currentCompanyData?.name || 'Company'} Questions</span>
              <span className="text-lg sm:text-xl font-black text-amber-300 mt-0.5">
                {rawCompanyProblems.length}
              </span>
              <span className="text-[10px] text-amber-400 font-mono mt-0.5">
                {TIMEFRAME_LABELS[selectedTimeframe]?.shortLabel || 'All Time'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-md flex flex-col">
              <span className="text-[11px] font-medium text-emerald-300">You Solved</span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-lg sm:text-xl font-black text-emerald-400">{companySolvedCount}</span>
                <span className="text-xs text-slate-400 font-mono">/ {rawCompanyProblems.length}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5">
                {rawCompanyProblems.length > 0
                  ? `${Math.round((companySolvedCount / rawCompanyProblems.length) * 100)}% Mastered`
                  : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Company Solved Progress Bar */}
        {rawCompanyProblems.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <span className="font-bold text-slate-100">{currentCompanyData?.name} Interview Readiness:</span>
              <span className="font-mono text-emerald-400 font-bold">{companySolvedCount}</span>
              <span>of</span>
              <span className="font-mono font-bold">{rawCompanyProblems.length}</span>
              <span>questions solved (Single submission tracking synced across all DSA sheets)</span>
            </div>
            <div className="w-full sm:w-64 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{
                  width: `${rawCompanyProblems.length > 0 ? Math.min(100, Math.round((companySolvedCount / rawCompanyProblems.length) * 100)) : 0}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. TOP FEATURED COMPANIES QUICK-PICK BAR */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Top Hiring Tech Giants (Quick Select)
          </span>
          <span className="text-xs text-slate-500">659 total companies available</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          {FEATURED_COMPANIES.map((fc) => {
            const isSelected = selectedCompany === fc.slug;
            const companyObj = dataset?.companies[fc.slug];
            const qCount = companyObj?.total || 0;

            return (
              <button
                key={fc.slug}
                onClick={() => {
                  setSelectedCompany(fc.slug);
                  // Default to all time if available
                  setSelectedTimeframe('all');
                }}
                className={`flex-shrink-0 flex items-center space-x-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white border-cyan-400/50 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span>{fc.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                    isSelected
                      ? 'bg-black/30 text-cyan-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {qCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CONTROLS BAR: COMPANY SEARCHABLE COMBOBOX + TIMEFRAME HORIZONS */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Company Searchable Combobox */}
          <div className="relative w-full md:w-80" ref={dropdownRef}>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Select Company (659 Available):
            </label>
            <button
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 text-slate-100 text-xs font-bold transition-all shadow-inner cursor-pointer"
            >
              <div className="flex items-center space-x-2 truncate">
                <Building2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="truncate">{currentCompanyData?.name || selectedCompany}</span>
              </div>
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 text-[10px] font-mono border border-indigo-800/60">
                  {currentCompanyData?.total || 0} Qs
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isCompanyDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-full sm:w-96 rounded-2xl bg-slate-950 border border-indigo-500/40 shadow-2xl z-50 p-2 space-y-2 backdrop-blur-xl animate-fadeIn">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={companySearchQuery}
                    onChange={(e) => setCompanySearchQuery(e.target.value)}
                    placeholder="Search 659 companies (e.g. BrowserStack, Meta)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                    autoFocus
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                  {filteredCompaniesForDropdown.map((c) => {
                    const isCur = c.slug === selectedCompany;
                    return (
                      <button
                        key={c.slug}
                        onClick={() => {
                          setSelectedCompany(c.slug);
                          setSelectedTimeframe('all');
                          setIsCompanyDropdownOpen(false);
                          setCompanySearchQuery('');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                          isCur
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'hover:bg-slate-900 text-slate-300 hover:text-slate-100'
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isCur ? 'bg-indigo-800 text-white' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {c.total} Qs
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Timeframe Horizons Selector (Pills) */}
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Timeframe Horizon Filter:
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', '30_days', '3_months', '6_months', 'more_6_months'] as TimeframeKey[]).map((tf) => {
                const isSelected = selectedTimeframe === tf;
                const tfMeta = TIMEFRAME_LABELS[tf];
                const countInTf = currentCompanyData?.timeframes?.[tf]?.length || 0;
                const isAvailable = Boolean(currentCompanyData?.timeframes?.[tf]);

                return (
                  <button
                    key={tf}
                    disabled={!isAvailable && countInTf === 0}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-400/50 shadow-md shadow-cyan-600/20'
                        : isAvailable
                        ? 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                        : 'bg-slate-950/40 text-slate-600 border border-slate-900 cursor-not-allowed opacity-50'
                    }`}
                    title={tfMeta.description}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{tfMeta.shortLabel}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        isSelected
                          ? 'bg-black/30 text-cyan-200'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {countInTf}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Timeframe Explanation Sub-Banner */}
        <div className="text-[11px] text-slate-400 flex items-center space-x-2 pt-1 border-t border-slate-800/60">
          <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span>
            <strong className="text-slate-200">{TIMEFRAME_LABELS[selectedTimeframe]?.label}:</strong>{' '}
            {TIMEFRAME_LABELS[selectedTimeframe]?.description} for {currentCompanyData?.name}.
          </span>
        </div>
      </div>

      {/* 4. SECONDARY FILTERS: SEARCH, DIFFICULTY, STATUS, SORT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80">
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${currentCompanyData?.name || ''} problems (e.g. 739, Daily)...`}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-sans shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Difficulty Pill Buttons */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => {
            const isSel = selectedDifficulty === diff;
            return (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSel
                    ? diff === 'Easy'
                      ? 'bg-emerald-600 text-white'
                      : diff === 'Medium'
                      ? 'bg-amber-600 text-white'
                      : diff === 'Hard'
                      ? 'bg-rose-600 text-white'
                      : 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {diff}
              </button>
            );
          })}
        </div>

        {/* Solved Status Filter */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          {(['All', 'Solved', 'Unsolved'] as const).map((st) => {
            const isSel = selectedStatus === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSel
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="frequency">Sort: Highest Frequency %</option>
            <option value="acceptance_desc">Sort: Highest Acceptance %</option>
            <option value="acceptance_asc">Sort: Lowest Acceptance %</option>
            <option value="id_asc">Sort: Problem ID (Ascending)</option>
            <option value="title_asc">Sort: Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* 5. PROBLEMS TABLE */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3.5 px-4 w-12 text-center">Status</th>
                <th className="py-3.5 px-3 w-16 text-center"># ID</th>
                <th className="py-3.5 px-4">Problem Title</th>
                <th className="py-3.5 px-3 w-28 text-center">Difficulty</th>
                <th className="py-3.5 px-3 w-32 text-center">Acceptance</th>
                <th className="py-3.5 px-4 w-44">Interview Frequency</th>
                <th className="py-3.5 px-4 w-44 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {paginatedProblems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="w-8 h-8 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-300">
                        No problems found matching your filters.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedDifficulty('All');
                          setSelectedStatus('All');
                          setSearchQuery('');
                          setSelectedTimeframe('all');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProblems.map((item) => {
                  const isSolved = item.isSolved;
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-900/60 transition-colors group ${
                        isSolved ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      {/* Solved Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleSolved(item)}
                          className={`p-1 rounded-lg transition-transform active:scale-90 cursor-pointer ${
                            isSolved
                              ? 'text-emerald-400 hover:text-emerald-300'
                              : 'text-slate-600 hover:text-slate-400'
                          }`}
                          title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved (Single Submission Tracking)'}
                        >
                          {isSolved ? (
                            <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                      </td>

                      {/* Problem ID */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-400 text-[11px]">
                        {item.id}
                      </td>

                      {/* Title & External Link */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSolveInWorkspace(item)}
                            className="font-bold text-slate-100 hover:text-indigo-300 transition-colors text-left line-clamp-1 cursor-pointer"
                          >
                            {item.title}
                          </button>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-slate-300 flex-shrink-0"
                            title="Open on LeetCode"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Difficulty Badge */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${
                            item.difficulty === 'Easy'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                              : item.difficulty === 'Medium'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                              : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                          }`}
                        >
                          {item.difficulty}
                        </span>
                      </td>

                      {/* Acceptance % */}
                      <td className="py-3 px-3 text-center font-mono text-slate-300 font-semibold text-[11px]">
                        {item.acceptance}%
                      </td>

                      {/* Interview Frequency % */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-slate-400">Frequency:</span>
                            <span className="font-bold text-cyan-300">{item.frequency}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                              style={{ width: `${Math.min(100, item.frequency)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleSolveInWorkspace(item)}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
                            title="Open in LeetCode Monaco Workspace with Testcases & Compiler"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Solve</span>
                          </button>

                          {onOpenNotes && (
                            <button
                              onClick={() => handleOpenProblemNotes(item)}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                              title="Problem Study Notes"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 6. PAGINATION CONTROLS */}
        {filteredProblems.length > 0 && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span>Showing</span>
              <span className="font-bold text-slate-200">
                {Math.min((currentPage - 1) * pageSize + 1, filteredProblems.length)}
              </span>
              <span>to</span>
              <span className="font-bold text-slate-200">
                {Math.min(currentPage * pageSize, filteredProblems.length)}
              </span>
              <span>of</span>
              <span className="font-bold text-slate-200">{filteredProblems.length}</span>
              <span>problems</span>

              <span className="text-slate-600">|</span>
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold"
              >
                Previous
              </button>

              <span className="px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono font-bold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
