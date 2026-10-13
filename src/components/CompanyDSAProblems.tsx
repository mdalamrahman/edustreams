import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  Circle,
  ExternalLink,
  Code2,
  Sparkles,
  ChevronDown,
  Calendar,
  FileText,
  ArrowUpDown,
  Tag,
  Globe,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  Check,
  BookOpen
} from 'lucide-react';
import {
  fetchCompanyProblemsDataset,
  CompanyProblemsDataset,
  CompanyProblemItem,
  TimeframeKey,
  TIMEFRAME_LABELS,
  FEATURED_COMPANIES,
  POPULAR_TOPICS,
  getCompanyProblemsForTimeframe
} from '../lib/companyProblemsData';
import { toggleProblemSolvedGlobally } from '../lib/analytics';
import { SDEProblem } from '../lib/dsaSheetsData';
import { LeetCodePOTDCalendarWidget } from './LeetCodePOTDCalendarWidget';
import { useNavigate, useParams } from 'react-router-dom';

interface CompanyDSAProblemsProps {
  onOpenCodingWorkspace?: (problem: SDEProblem) => void;
  onOpenNotes?: (problem: SDEProblem) => void;
  initialCompany?: string;
}

export const CompanyDSAProblems: React.FC<CompanyDSAProblemsProps> = ({
  onOpenCodingWorkspace: propOpenCodingWorkspace,
  onOpenNotes,
  initialCompany = 'all_companies'
}) => {
  const { name: paramCompany } = useParams<{ name?: string }>();
  const navigate = useNavigate();

  const onOpenCodingWorkspace = (problem: SDEProblem) => {
    if (propOpenCodingWorkspace) propOpenCodingWorkspace(problem);
    else {
      const slug = problem.slug || problem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      navigate(`/problem/${slug}`);
    }
  };

  const [dataset, setDataset] = useState<CompanyProblemsDataset | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCompany, setSelectedCompany] = useState<string>(() => {
    if (paramCompany) return paramCompany;
    try {
      return localStorage.getItem('sdetube_last_selected_company') || initialCompany;
    } catch {
      return initialCompany;
    }
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeKey>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Solved' | 'Unsolved'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'id_asc' | 'frequency' | 'acceptance_desc' | 'acceptance_asc' | 'title_asc'>('id_asc');

  // Dropdown states
  const [isDifficultyDropdownOpen, setIsDifficultyDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  const [topicSearchQuery, setTopicSearchQuery] = useState('');

  const difficultyRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);
  const topicDropdownRef = useRef<HTMLDivElement>(null);
  const topicsScrollRef = useRef<HTMLDivElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Re-render tick when any problem is solved in workspace
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

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (difficultyRef.current && !difficultyRef.current.contains(e.target as Node)) {
        setIsDifficultyDropdownOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
      if (topicDropdownRef.current && !topicDropdownRef.current.contains(e.target as Node)) {
        setIsTopicDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCompany, selectedTimeframe, selectedTopic, selectedDifficulty, selectedStatus, searchQuery, sortBy]);

  // Active Company Object
  const currentCompanyData = useMemo(() => {
    if (!dataset || !dataset.companies) return null;
    return dataset.companies[selectedCompany] || dataset.companies['all_companies'] || null;
  }, [dataset, selectedCompany]);

  // Raw list of problems for this company & timeframe
  const rawCompanyProblems = useMemo(() => {
    if (!dataset) return [];
    void syncVersion; // triggers re-eval when syncVersion updates
    return getCompanyProblemsForTimeframe(dataset, selectedCompany, selectedTimeframe);
  }, [dataset, selectedCompany, selectedTimeframe, syncVersion]);

  // Filtered & Sorted Problems List
  const filteredProblems = useMemo(() => {
    let list = [...rawCompanyProblems];

    // Topic Filter
    if (selectedTopic !== 'ALL') {
      list = list.filter((p) => p.topicTags && p.topicTags.includes(selectedTopic));
    }

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

    // Search query (matches title, slug or ID or topic)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        (p.topicTags && p.topicTags.some(t => t.toLowerCase().includes(q))) ||
        (p.companies && p.companies.some(c => c.toLowerCase().includes(q)))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'id_asc') return a.id - b.id;
      if (sortBy === 'frequency') return b.frequency - a.frequency;
      if (sortBy === 'acceptance_desc') return b.acceptance - a.acceptance;
      if (sortBy === 'acceptance_asc') return a.acceptance - b.acceptance;
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
      return 0;
    });

    return list;
  }, [rawCompanyProblems, selectedTopic, selectedDifficulty, selectedStatus, searchQuery, sortBy]);

  // Stats breakdown for LeetCode Sidebar Progress Ring
  const statsBreakdown = useMemo(() => {
    let easyTotal = 0, easySolved = 0;
    let mediumTotal = 0, mediumSolved = 0;
    let hardTotal = 0, hardSolved = 0;

    rawCompanyProblems.forEach((p) => {
      if (p.difficulty === 'Easy') {
        easyTotal++;
        if (p.isSolved) easySolved++;
      } else if (p.difficulty === 'Medium') {
        mediumTotal++;
        if (p.isSolved) mediumSolved++;
      } else if (p.difficulty === 'Hard') {
        hardTotal++;
        if (p.isSolved) hardSolved++;
      }
    });

    const total = rawCompanyProblems.length;
    const totalSolved = easySolved + mediumSolved + hardSolved;
    const percentage = total > 0 ? Math.round((totalSolved / total) * 100) : 0;

    return {
      easyTotal,
      easySolved,
      mediumTotal,
      mediumSolved,
      hardTotal,
      hardSolved,
      total,
      totalSolved,
      percentage
    };
  }, [rawCompanyProblems]);

  // Available topics for the current filtered company set
  const topicsSummaryForCompany = useMemo(() => {
    if (!rawCompanyProblems) return [];
    const counts: Record<string, number> = {};
    rawCompanyProblems.forEach((p) => {
      (p.topicTags || []).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
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

  // Filtered topics for dropdown
  const filteredTopicsForDropdown = useMemo(() => {
    const list = topicsSummaryForCompany.length > 0 ? topicsSummaryForCompany : (dataset?.topics_summary || []);
    if (!topicSearchQuery.trim()) return list;
    const q = topicSearchQuery.toLowerCase().trim();
    return list.filter((t) => t.name.toLowerCase().includes(q));
  }, [topicsSummaryForCompany, dataset, topicSearchQuery]);

  // Toggle problem solved
  const handleToggleSolved = (item: CompanyProblemItem) => {
    toggleProblemSolvedGlobally(item.slug, item.title, item.id);
    setSyncVersion((v) => v + 1);
  };

  // Open Problem in LeetCode Workspace
  const handleSolveInWorkspace = (item: CompanyProblemItem) => {
    const itemCompanies = (item.companies && item.companies.length > 0)
      ? item.companies
      : (currentCompanyData?.slug !== 'all_companies' && currentCompanyData?.name ? [currentCompanyData.name] : []);

    const sdeProblem: SDEProblem = {
      id: item.id,
      sheetType: 'sde',
      category: item.topicTags?.[0] || `${currentCompanyData?.name || 'Company'} Interview Questions`,
      subcategory: TIMEFRAME_LABELS[selectedTimeframe]?.label || 'Curated',
      name: item.title,
      leetcode: item.url,
      gfg: `https://www.geeksforgeeks.org/problems/${item.slug}/1`,
      companies: itemCompanies,
      difficulty: item.difficulty,
      rating: `${item.frequency}% Frequency`,
      slug: item.slug
    };
    onOpenCodingWorkspace(sdeProblem);
  };

  // Pick One: LeetCode Random Problem Action
  const handlePickOne = () => {
    const pool = filteredProblems.length > 0 ? filteredProblems : rawCompanyProblems;
    if (pool.length === 0) return;
    const randomIndex = Math.floor(Math.random() * pool.length);
    handleSolveInWorkspace(pool[randomIndex]);
  };

  // Open Notes Modal
  const handleOpenProblemNotes = (item: CompanyProblemItem) => {
    if (!onOpenNotes) return;
    const itemCompanies = (item.companies && item.companies.length > 0)
      ? item.companies
      : (currentCompanyData?.slug !== 'all_companies' && currentCompanyData?.name ? [currentCompanyData.name] : []);

    const sdeProblem: SDEProblem = {
      id: item.id,
      sheetType: 'sde',
      category: item.topicTags?.[0] || `${currentCompanyData?.name || 'Company'} Interview Questions`,
      subcategory: TIMEFRAME_LABELS[selectedTimeframe]?.label || 'Curated',
      name: item.title,
      leetcode: item.url,
      gfg: `https://www.geeksforgeeks.org/problems/${item.slug}/1`,
      companies: itemCompanies,
      difficulty: item.difficulty,
      rating: `${item.frequency}% Frequency`,
      slug: item.slug
    };
    onOpenNotes(sdeProblem);
  };

  // Scroll topics list left/right
  const scrollTopics = (direction: 'left' | 'right') => {
    if (topicsScrollRef.current) {
      const offset = direction === 'left' ? -300 : 300;
      topicsScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Loading 3,400+ LeetCode DSA Problems...</p>
        <span className="text-xs text-slate-500">Indexing 659 companies, 170+ topic tags and 5 timeframe horizons</span>
      </div>
    );
  }

  const isAllCompanies = selectedCompany === 'all_companies';

  return (
    <div className="space-y-6 animate-fadeIn pb-16">

      {/* 1. TOP STUDY PLANS / FEATURED CARDS (LEETCODE BANNER STYLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => {
            setSelectedCompany('all_companies');
            setSelectedTimeframe('all');
            setSelectedTopic('ALL');
            setSelectedDifficulty('All');
          }}
          className="group relative overflow-hidden rounded-2xl bg-[#0c101a] border border-white/[0.08] hover:border-cyan-500/50 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-cyan-500/10 blur-2xl transition-opacity group-hover:opacity-100" />
          <div className="flex items-start justify-between relative z-10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              ● Most Popular
            </span>
            <Globe className="w-4 h-4 text-cyan-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          </div>
          <h3 className="text-sm font-bold text-white mt-2 group-hover:text-cyan-300 transition-colors relative z-10">
            Complete LeetCode 3,400+
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-mono relative z-10">
            Entire authentic LeetCode problemset with official testcases
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono relative z-10">
            <span className="text-cyan-400 font-bold">{dataset?.total_problems.toLocaleString() || '3,399'} Qs</span>
            <span className="group-hover:translate-x-0.5 transition-transform text-slate-300">View All &rarr;</span>
          </div>
        </div>

        <div
          onClick={() => {
            setSelectedCompany('google');
            setSelectedTimeframe('6_months');
            setSelectedTopic('ALL');
          }}
          className="group relative overflow-hidden rounded-2xl bg-[#0c101a] border border-white/[0.08] hover:border-rose-500/50 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/10 cursor-pointer"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-rose-500/10 blur-2xl transition-opacity group-hover:opacity-100" />
          <div className="flex items-start justify-between relative z-10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
              ● FAANG Target
            </span>
            <Flame className="w-4 h-4 text-rose-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          </div>
          <h3 className="text-sm font-bold text-white mt-2 group-hover:text-rose-300 transition-colors relative z-10">
            Google High Frequency
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-mono relative z-10">
            Top algorithms & dynamic graphs asked in recent interview rounds
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono relative z-10">
            <span className="text-rose-400 font-bold">Past 6 Months</span>
            <span className="group-hover:translate-x-0.5 transition-transform text-slate-300">Explore &rarr;</span>
          </div>
        </div>

        <div
          onClick={() => {
            setSelectedCompany('amazon');
            setSelectedTimeframe('all');
            setSelectedTopic('ALL');
          }}
          className="group relative overflow-hidden rounded-2xl bg-[#0c101a] border border-white/[0.08] hover:border-amber-500/50 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-amber-500/10 blur-2xl transition-opacity group-hover:opacity-100" />
          <div className="flex items-start justify-between relative z-10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              ● High Yield
            </span>
            <Building2 className="w-4 h-4 text-amber-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          </div>
          <h3 className="text-sm font-bold text-white mt-2 group-hover:text-amber-300 transition-colors relative z-10">
            Amazon Interview Set
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-mono relative z-10">
            Trees, heaps, sliding window & BFS/DFS high-yield patterns
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono relative z-10">
            <span className="text-amber-400 font-bold">1,200+ Questions</span>
            <span className="group-hover:translate-x-0.5 transition-transform text-slate-300">Explore &rarr;</span>
          </div>
        </div>

        <div
          onClick={() => {
            setSelectedCompany('meta');
            setSelectedTimeframe('all');
            setSelectedTopic('ALL');
          }}
          className="group relative overflow-hidden rounded-2xl bg-[#0c101a] border border-white/[0.08] hover:border-indigo-500/50 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl transition-opacity group-hover:opacity-100" />
          <div className="flex items-start justify-between relative z-10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              ● Top Rated
            </span>
            <Sparkles className="w-4 h-4 text-indigo-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          </div>
          <h3 className="text-sm font-bold text-white mt-2 group-hover:text-indigo-300 transition-colors relative z-10">
            Meta Interview Set
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-mono relative z-10">
            Fast trees, binary search, intervals & dynamic recursion
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono relative z-10">
            <span className="text-indigo-400 font-bold">850+ Questions</span>
            <span className="group-hover:translate-x-0.5 transition-transform text-slate-300">Explore &rarr;</span>
          </div>
        </div>
      </div>

      {/* 2. TOPICS HORIZONTAL CAROUSEL BAR (EXACT LEETCODE STYLE) */}
      <div className="relative flex items-center bg-[#090d16] rounded-2xl border border-white/[0.08] p-2 shadow-sm">
        <button
          onClick={() => scrollTopics('left')}
          className="p-1.5 rounded-xl bg-[#0c101a] hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors cursor-pointer mr-1 hidden sm:flex items-center justify-center flex-shrink-0 border border-white/[0.08]"
          title="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={topicsScrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-1 flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* All Topics Pill */}
          <button
            onClick={() => setSelectedTopic('ALL')}
            className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              selectedTopic === 'ALL'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-[#0c101a] text-slate-300 hover:bg-white/[0.06] hover:text-white border border-white/[0.08]'
            }`}
          >
            <span>All Topics</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${selectedTopic === 'ALL' ? 'bg-black/30 text-white' : 'text-slate-500'}`}>
              {rawCompanyProblems.length}
            </span>
          </button>

          {/* Popular Topics List */}
          {POPULAR_TOPICS.map((topName) => {
            const isSel = selectedTopic === topName;
            const count = topicsSummaryForCompany.find(t => t.name === topName)?.count || 0;
            return (
              <button
                key={topName}
                onClick={() => setSelectedTopic(isSel ? 'ALL' : topName)}
                className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                  isSel
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/30'
                    : 'bg-[#0c101a] text-slate-300 hover:bg-white/[0.06] hover:text-white border border-white/[0.08]'
                }`}
              >
                <span>{topName}</span>
                {count > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isSel ? 'bg-black/30 text-white' : 'text-slate-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scrollTopics('right')}
          className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1 hidden sm:flex items-center justify-center flex-shrink-0"
          title="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Search All 170+ Topics Combobox Trigger */}
        <div className="relative ml-2 flex-shrink-0" ref={topicDropdownRef}>
          <button
            onClick={() => setIsTopicDropdownOpen(!isTopicDropdownOpen)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">More Topics</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
          </button>

          {isTopicDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-slate-950 border border-indigo-500/40 shadow-2xl z-50 p-2 space-y-2 backdrop-blur-xl animate-fadeIn">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={topicSearchQuery}
                  onChange={(e) => setTopicSearchQuery(e.target.value)}
                  placeholder="Search 170+ topics..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                <button
                  onClick={() => {
                    setSelectedTopic('ALL');
                    setIsTopicDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs cursor-pointer ${
                    selectedTopic === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <span>All Topics</span>
                  <span className="text-[10px] font-mono text-slate-400">{rawCompanyProblems.length}</span>
                </button>

                {filteredTopicsForDropdown.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => {
                      setSelectedTopic(t.name);
                      setIsTopicDropdownOpen(false);
                      setTopicSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs cursor-pointer ${
                      t.name === selectedTopic ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <span className="truncate">{t.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{t.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. LEETCODE FILTER & ACTION BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0d121f] border border-slate-800">
        
        {/* Left Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Dropdown */}
          <div className="relative" ref={difficultyRef}>
            <button
              onClick={() => setIsDifficultyDropdownOpen(!isDifficultyDropdownOpen)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <span>Difficulty:</span>
              <span className={`font-bold ${
                selectedDifficulty === 'Easy' ? 'text-emerald-400' :
                selectedDifficulty === 'Medium' ? 'text-amber-400' :
                selectedDifficulty === 'Hard' ? 'text-rose-400' : 'text-slate-100'
              }`}>
                {selectedDifficulty}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDifficultyDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-40 rounded-xl bg-slate-950 border border-slate-800 shadow-xl z-50 p-1 space-y-1 animate-fadeIn">
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      setSelectedDifficulty(diff);
                      setIsDifficultyDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      selectedDifficulty === diff ? 'bg-slate-800 text-white font-bold' : 'hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        diff === 'Easy' ? 'bg-emerald-400' :
                        diff === 'Medium' ? 'bg-amber-400' :
                        diff === 'Hard' ? 'bg-rose-400' : 'bg-slate-400'
                      }`} />
                      <span>{diff}</span>
                    </div>
                    {selectedDifficulty === diff && <Check className="w-3 h-3 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <span>Status:</span>
              <span className="font-bold text-slate-100">{selectedStatus}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-36 rounded-xl bg-slate-950 border border-slate-800 shadow-xl z-50 p-1 space-y-1 animate-fadeIn">
                {(['All', 'Solved', 'Unsolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setSelectedStatus(st);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      selectedStatus === st ? 'bg-slate-800 text-white font-bold' : 'hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {st === 'Solved' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : st === 'Unsolved' ? (
                        <Circle className="w-3 h-3 text-slate-500" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                      )}
                      <span>{st}</span>
                    </div>
                    {selectedStatus === st && <Check className="w-3 h-3 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Company Selector Dropdown */}
          <div className="relative" ref={companyRef}>
            <button
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer max-w-[200px]"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="truncate">{currentCompanyData?.name || 'All Companies'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            </button>

            {isCompanyDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-80 rounded-2xl bg-slate-950 border border-indigo-500/40 shadow-2xl z-50 p-2 space-y-2 backdrop-blur-xl animate-fadeIn">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={companySearchQuery}
                    onChange={(e) => setCompanySearchQuery(e.target.value)}
                    placeholder="Search 650+ tech giants..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800 pr-1">
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
                            : c.slug === 'all_companies'
                            ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-800/50 hover:bg-cyan-900/40'
                            : 'hover:bg-slate-900 text-slate-300 hover:text-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {c.slug === 'all_companies' ? (
                            <Globe className="w-3.5 h-3.5 text-cyan-300" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span className="truncate">{c.name}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isCur ? 'bg-indigo-800 text-white' : 'bg-slate-900 text-slate-400'
                        }`}>
                          {c.total} Qs
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Timeframe Horizons */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            {(['all', '30_days', '3_months', '6_months', 'more_6_months'] as TimeframeKey[]).map((tf) => {
              const isSel = selectedTimeframe === tf;
              const meta = TIMEFRAME_LABELS[tf];
              const countInTf = currentCompanyData?.timeframes?.[tf]?.length || 0;
              const isAvail = Boolean(currentCompanyData?.timeframes?.[tf]);

              return (
                <button
                  key={tf}
                  disabled={!isAvail && countInTf === 0}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    isSel
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm font-bold'
                      : isAvail
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      : 'text-slate-600 cursor-not-allowed opacity-40'
                  }`}
                  title={meta.description}
                >
                  {meta.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Search and Pick One Group */}
        <div className="flex items-center space-x-2 w-full lg:w-auto">
          {/* LeetCode Search Input */}
          <div className="relative flex-1 lg:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-9 pr-7 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/80 font-sans shadow-inner placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* LeetCode's Signature "Pick One" (Random Problem) Button */}
          <button
            onClick={handlePickOne}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
            title="Pick a random problem to solve"
          >
            <Shuffle className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Pick One</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center space-x-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="id_asc">Sort: # ID</option>
              <option value="frequency">Sort: Frequency %</option>
              <option value="acceptance_desc">Sort: Highest Acc</option>
              <option value="acceptance_asc">Sort: Lowest Acc</option>
              <option value="title_asc">Sort: Title (A-Z)</option>
            </select>
          </div>
        </div>

      </div>

      {/* 4. MAIN 2-COLUMN LAYOUT (LEETCODE 75% TABLE + 25% SIDEBAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: LEETCODE PROBLEMS TABLE (9 cols on lg) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          <div className="rounded-2xl border border-slate-800/90 bg-[#0d121f] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-semibold text-slate-400 font-mono">
                    <th className="py-3 px-3.5 w-10 text-center">
                      <Check className="w-3.5 h-3.5 text-slate-500 inline-block" />
                    </th>
                    <th className="py-3 px-4">Title & Verified Companies</th>
                    <th className="py-3 px-2 w-14 text-center">Notes</th>
                    <th className="py-3 px-3 w-24 text-center">Acceptance</th>
                    <th className="py-3 px-3 w-24 text-center">Difficulty</th>
                    <th className="py-3 px-4 w-32">Frequency</th>
                    <th className="py-3 px-4 w-44 text-right">Practice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs">
                  {paginatedProblems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <Search className="w-8 h-8 text-slate-600" />
                          <p className="text-sm font-semibold text-slate-300">
                            No problems found matching your filters.
                          </p>
                          <button
                            onClick={() => {
                              setSelectedTopic('ALL');
                              setSelectedDifficulty('All');
                              setSelectedStatus('All');
                              setSearchQuery('');
                              setSelectedTimeframe('all');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedProblems.map((item) => {
                      const isSolved = item.isSolved;
                      const itemCompanies = item.companies || [];

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-800/40 transition-colors group ${
                            isSolved ? 'bg-emerald-950/10' : ''
                          }`}
                        >
                          {/* Status Checkbox */}
                          <td className="py-3 px-3.5 text-center">
                            <button
                              onClick={() => handleToggleSolved(item)}
                              className={`p-0.5 rounded transition-transform active:scale-90 cursor-pointer ${
                                isSolved ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 hover:text-slate-400'
                              }`}
                              title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                            >
                              {isSolved ? (
                                <CheckCircle2 className="w-4 h-4 fill-emerald-500/20" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* Problem Title & Company Chips Preview */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleSolveInWorkspace(item)}
                                  className="font-semibold text-slate-200 hover:text-indigo-300 transition-colors text-left line-clamp-1 cursor-pointer"
                                  title={`Open ${item.title} in Workspace`}
                                >
                                  <span>{item.id}. {item.title}</span>
                                </button>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-600 hover:text-amber-400 transition-colors flex-shrink-0"
                                  title="View on LeetCode"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>

                              {/* Authentic Company Badges Preview Under Problem Title */}
                              {itemCompanies.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1">
                                  {itemCompanies.slice(0, 3).map((comp) => (
                                    <span
                                      key={comp}
                                      className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-900/90 text-slate-400 border border-slate-800/80"
                                      title={`Asked by ${comp}`}
                                    >
                                      <Building2 className="w-2.5 h-2.5 text-slate-500" />
                                      <span>{comp}</span>
                                    </span>
                                  ))}
                                  {itemCompanies.length > 3 && (
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      +{itemCompanies.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Notes */}
                          <td className="py-3 px-2 text-center">
                            {onOpenNotes && (
                              <button
                                onClick={() => handleOpenProblemNotes(item)}
                                className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Problem Notes"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>

                          {/* Acceptance % */}
                          <td className="py-3 px-3 text-center font-mono text-slate-400 font-medium text-[11px]">
                            {item.acceptance}%
                          </td>

                          {/* Difficulty (LeetCode Style Color) */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`text-[12px] font-semibold ${
                                item.difficulty === 'Easy'
                                  ? 'text-emerald-400'
                                  : item.difficulty === 'Medium'
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {item.difficulty}
                            </span>
                          </td>

                          {/* Frequency Bar */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                                  style={{ width: `${Math.min(100, item.frequency)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Practice Buttons: SDETube IDE Solve + LeetCode Direct Solve */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSolveInWorkspace(item)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500 font-semibold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                                title="Solve in SDETube IDE"
                              >
                                <Code2 className="w-3 h-3" />
                                <span>Solve</span>
                              </button>

                              <a
                                href={item.url || (item.slug ? `https://leetcode.com/problems/${item.slug}/` : 'https://leetcode.com/problemset/all/')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/50 font-semibold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                                title="Solve directly on LeetCode"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>LeetCode</span>
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* LeetCode Style Table Pagination Footer */}
            {filteredProblems.length > 0 && (
              <div className="p-3.5 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
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
                  <span>questions</span>

                  <span className="text-slate-600">|</span>
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2 py-0.5 text-xs focus:outline-none cursor-pointer"
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
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold cursor-pointer"
                  >
                    &larr; Prev
                  </button>

                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold cursor-pointer"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LEETCODE STATS SIDEBAR (3-4 cols on lg) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">

          {/* 1. AUTHENTIC LEETCODE MONTHLY POTD CALENDAR WIDGET */}
          <LeetCodePOTDCalendarWidget onOpenCodingWorkspace={onOpenCodingWorkspace} />

          {/* 2. SESSION SOLVED PROGRESS CARD (EXACT LEETCODE STYLE) */}
          <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-bold text-slate-300 tracking-wide uppercase font-mono flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Session Progress
              </span>
              <span className="text-[11px] font-mono text-cyan-400 font-bold">
                {statsBreakdown.percentage}% Complete
              </span>
            </div>

            {/* Circular Progress Ring */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1e293b"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - statsBreakdown.percentage / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-white font-mono">
                    {statsBreakdown.totalSolved}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    / {statsBreakdown.total} Solved
                  </span>
                </div>
              </div>
            </div>

            {/* Difficulty Breakdown Progress Bars */}
            <div className="space-y-2.5 pt-1">
              {/* Easy */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Easy
                  </span>
                  <span className="font-mono text-slate-300 font-bold text-[11px]">
                    {statsBreakdown.easySolved} <span className="text-slate-500 font-normal">/ {statsBreakdown.easyTotal}</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${statsBreakdown.easyTotal > 0 ? (statsBreakdown.easySolved / statsBreakdown.easyTotal) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Medium
                  </span>
                  <span className="font-mono text-slate-300 font-bold text-[11px]">
                    {statsBreakdown.mediumSolved} <span className="text-slate-500 font-normal">/ {statsBreakdown.mediumTotal}</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${statsBreakdown.mediumTotal > 0 ? (statsBreakdown.mediumSolved / statsBreakdown.mediumTotal) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Hard */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Hard
                  </span>
                  <span className="font-mono text-slate-300 font-bold text-[11px]">
                    {statsBreakdown.hardSolved} <span className="text-slate-500 font-normal">/ {statsBreakdown.hardTotal}</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${statsBreakdown.hardTotal > 0 ? (statsBreakdown.hardSolved / statsBreakdown.hardTotal) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. TARGET COMPANY QUICK JUMP CARD */}
          <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 font-mono">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                Target Companies
              </span>
              <span className="text-[10px] text-slate-500 font-mono">659 Tech Giants</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {FEATURED_COMPANIES.slice(0, 8).map((fc) => {
                const isCur = selectedCompany === fc.slug;
                const companyObj = dataset?.companies[fc.slug];
                const qCount = companyObj?.total || (fc.slug === 'all_companies' ? dataset?.total_problems : 0) || 0;

                return (
                  <button
                    key={fc.slug}
                    onClick={() => {
                      setSelectedCompany(fc.slug);
                      setSelectedTimeframe('all');
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      isCur
                        ? 'bg-indigo-600 text-white font-bold border-indigo-400/60 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{fc.name.replace(/\(.*\)/, '').trim()}</span>
                    <span className={`text-[10px] font-mono px-1 rounded ${isCur ? 'bg-indigo-800 text-indigo-100' : 'text-slate-500'}`}>
                      {qCount > 1000 ? `${Math.round(qCount / 1000)}k` : qCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
