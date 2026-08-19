import React, { useState, useEffect, useMemo } from 'react';
import { 
  Code, 
  CheckCircle2, 
  ListChecks, 
  Star, 
  Building2, 
  Search, 
  RotateCcw, 
  ExternalLink, 
  Play, 
  FolderOpen,
  Sparkles,
  Terminal,
  Filter,
  Check,
  Flame,
  Zap,
  Trophy,
  ArrowRight,
  Download,
  BookOpen,
  Layers,
  Rocket
} from 'lucide-react';
import { 
  DSAProblem, 
  DSASheetType, 
  DSA_SHEETS_CONFIG, 
  ALL_SHEETS_MAP, 
  getSheetData,
  SDEProblem 
} from '../lib/dsaSheetsData';

interface SDESheetExplorerProps {
  onSelectVideoByTopic?: (query: string) => void;
  onOpenCodingFullscreen?: (problem: DSAProblem) => void;
}

const STORAGE_ACTIVE_SHEET_KEY = 'sdetube_active_dsa_sheet';
const STORAGE_SOLVED_PREFIX = 'sdetube_dsa_sheet_solved_';
const STORAGE_POTD_DATE_KEY = 'sdetube_potd_date';
const STORAGE_POTD_ID_KEY = 'sdetube_potd_problem_id';

export const SDESheetExplorer: React.FC<SDESheetExplorerProps> = ({
  onSelectVideoByTopic,
  onOpenCodingFullscreen
}) => {
  // Active Sheet Selector: 'sde' (191 Qs) | 'a2z' (473 Qs) | '79' (79 Qs)
  const [activeSheet, setActiveSheet] = useState<DSASheetType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_SHEET_KEY) as DSASheetType;
      if (saved && (saved === 'sde' || saved === 'a2z' || saved === '79')) return saved;
    } catch {}
    return 'sde';
  });

  const activeSheetConfig = DSA_SHEETS_CONFIG[activeSheet];
  const currentSheetProblems = useMemo(() => getSheetData(activeSheet), [activeSheet]);

  // Solved State per Sheet
  const [solvedIds, setSolvedIds] = useState<number[]>(() => {
    try {
      const savedKey = `${STORAGE_SOLVED_PREFIX}${activeSheet}`;
      const saved = localStorage.getItem(savedKey) || localStorage.getItem('sdetube_sde_sheet_solved_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Re-sync solved state when switching sheets
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_SHEET_KEY, activeSheet);
      const savedKey = `${STORAGE_SOLVED_PREFIX}${activeSheet}`;
      const legacyKey = activeSheet === 'sde' ? 'sdetube_sde_sheet_solved_ids' : '';
      const saved = localStorage.getItem(savedKey) || (legacyKey ? localStorage.getItem(legacyKey) : null);
      setSolvedIds(saved ? JSON.parse(saved) : []);
    } catch {}
  }, [activeSheet]);

  // Save solved state on change
  useEffect(() => {
    try {
      const savedKey = `${STORAGE_SOLVED_PREFIX}${activeSheet}`;
      localStorage.setItem(savedKey, JSON.stringify(solvedIds));
      if (activeSheet === 'sde') {
        localStorage.setItem('sdetube_sde_sheet_solved_ids', JSON.stringify(solvedIds));
      }
    } catch (e) {
      console.warn('[SDETube Sheets Storage Notice]:', e);
    }
  }, [solvedIds, activeSheet]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [activeTopicPill, setActiveTopicPill] = useState('ALL');

  // Reset category/topic filters when switching sheets
  const handleSwitchSheet = (newSheet: DSASheetType) => {
    setActiveSheet(newSheet);
    setSelectedCategory('ALL');
    setActiveTopicPill('ALL');
    setSearchQuery('');
  };

  // POTD (Problem of the Day) Generator for active sheet
  const potdProblem = useMemo<DSAProblem>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem(STORAGE_POTD_DATE_KEY);
    const savedId = localStorage.getItem(STORAGE_POTD_ID_KEY);

    if (savedDate === today && savedId) {
      const p = currentSheetProblems.find((item) => item.id === Number(savedId));
      if (p) return p;
    }

    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash * 31 + today.charCodeAt(i)) % currentSheetProblems.length;
    }
    const selected = currentSheetProblems[Math.abs(hash) % currentSheetProblems.length] || currentSheetProblems[0];

    try {
      localStorage.setItem(STORAGE_POTD_DATE_KEY, today);
      localStorage.setItem(STORAGE_POTD_ID_KEY, selected.id.toString());
    } catch {}
    return selected;
  }, [currentSheetProblems]);

  const isPotdSolved = solvedIds.includes(potdProblem.id);

  const toggleSolved = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSolvedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allCategories = useMemo(() => {
    return Array.from(new Set(currentSheetProblems.map((p) => p.category)));
  }, [currentSheetProblems]);

  const allCompanies = useMemo(() => {
    const companies = new Set<string>();
    currentSheetProblems.forEach((p) => p.companies.forEach((c) => companies.add(c.trim())));
    return Array.from(companies).sort();
  }, [currentSheetProblems]);

  // Topic category chips for quick navigation
  const topTopics = useMemo(() => {
    const counts: Record<string, number> = {};
    currentSheetProblems.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [currentSheetProblems]);

  // Multi-Criteria Filtering
  const filteredProblems = useMemo(() => {
    return currentSheetProblems.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.companies.some((c) => c.toLowerCase().includes(q))
      );

      const matchesCat = 
        selectedCategory === 'ALL' 
          ? (activeTopicPill === 'ALL' || p.category === activeTopicPill)
          : (p.category === selectedCategory);

      const matchesCompany = 
        selectedCompany === 'ALL' || 
        p.companies.some((c) => c.toLowerCase() === selectedCompany.toLowerCase());

      const matchesDifficulty = 
        selectedDifficulty === 'ALL' || p.difficulty === selectedDifficulty;

      const isSolved = solvedIds.includes(p.id);
      let matchesStatus = true;
      if (selectedStatus === 'SOLVED') matchesStatus = isSolved;
      if (selectedStatus === 'UNSOLVED') matchesStatus = !isSolved;
      if (selectedStatus === 'MUST_DO') matchesStatus = p.rating.includes('Must Do');

      return matchesSearch && matchesCat && matchesCompany && matchesDifficulty && matchesStatus;
    });
  }, [currentSheetProblems, searchQuery, selectedCategory, activeTopicPill, selectedCompany, selectedDifficulty, selectedStatus, solvedIds]);

  // Statistics calculation for the active sheet
  const totalCount = currentSheetProblems.length;
  const solvedCount = solvedIds.filter(id => currentSheetProblems.some(p => p.id === id)).length;
  const solvedPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
  const mustDoCount = currentSheetProblems.filter((p) => p.rating.includes('Must Do')).length;
  const mustDoSolved = currentSheetProblems.filter((p) => p.rating.includes('Must Do') && solvedIds.includes(p.id)).length;

  const easyTotal = currentSheetProblems.filter((p) => p.difficulty === 'Easy').length;
  const easySolved = currentSheetProblems.filter((p) => p.difficulty === 'Easy' && solvedIds.includes(p.id)).length;

  const mediumTotal = currentSheetProblems.filter((p) => p.difficulty === 'Medium').length;
  const mediumSolved = currentSheetProblems.filter((p) => p.difficulty === 'Medium' && solvedIds.includes(p.id)).length;

  const hardTotal = currentSheetProblems.filter((p) => p.difficulty === 'Hard').length;
  const hardSolved = currentSheetProblems.filter((p) => p.difficulty === 'Hard' && solvedIds.includes(p.id)).length;

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedCompany('ALL');
    setSelectedDifficulty('ALL');
    setSelectedStatus('ALL');
    setActiveTopicPill('ALL');
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedCategory !== 'ALL' || 
    selectedCompany !== 'ALL' || 
    selectedDifficulty !== 'ALL' || 
    selectedStatus !== 'ALL' || 
    activeTopicPill !== 'ALL';

  // Export current active sheet to CSV
  const handleExportCSV = () => {
    try {
      const headers = ["ID", "Category / Topic", "Problem Name", "LeetCode URL", "GFG URL", "Companies", "Difficulty", "Rating"];
      const rows = currentSheetProblems.map((p) => [
        p.id,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${p.leetcode || ''}"`,
        `"${p.gfg || ''}"`,
        `"${(p.companies || []).join(', ')}"`,
        `"${p.difficulty || ''}"`,
        `"${p.rating || ''}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = activeSheet === 'sde' 
        ? 'sdetube_sde_sheet_191_problems.csv' 
        : activeSheet === 'a2z' 
          ? 'sdetube_a2z_dsa_sheet_473_problems.csv' 
          : 'sdetube_79_sheet_79_problems.csv';

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.warn('CSV export notice:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">

      {/* TOP 3-WAY SHEET SWITCHER TABS */}
      <div className="p-2 sm:p-3 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto flex-1">
          
          {/* TAB 1: SDE Sheet */}
          <button
            onClick={() => handleSwitchSheet('sde')}
            className={`flex items-center justify-center space-x-2.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
              activeSheet === 'sde'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02] border border-emerald-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Rocket className={`w-4 h-4 ${activeSheet === 'sde' ? 'text-white animate-bounce' : 'text-emerald-400'}`} />
            <span>SDETube's SDE Sheet</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${activeSheet === 'sde' ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-400/30' : 'bg-slate-800 text-slate-400'}`}>
              191 Qs
            </span>
          </button>

          {/* TAB 2: A2Z DSA Roadmap */}
          <button
            onClick={() => handleSwitchSheet('a2z')}
            className={`flex items-center justify-center space-x-2.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
              activeSheet === 'a2z'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-[1.02] border border-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeSheet === 'a2z' ? 'text-white animate-pulse' : 'text-indigo-400'}`} />
            <span>SDETube's A2Z Roadmap</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${activeSheet === 'a2z' ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-400/30' : 'bg-slate-800 text-slate-400'}`}>
              473 Qs
            </span>
          </button>

          {/* TAB 3: 79 Sheet */}
          <button
            onClick={() => handleSwitchSheet('79')}
            className={`flex items-center justify-center space-x-2.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
              activeSheet === '79'
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 text-white shadow-lg shadow-amber-500/20 scale-[1.02] border border-amber-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Zap className={`w-4 h-4 ${activeSheet === '79' ? 'text-white animate-pulse' : 'text-amber-400'}`} />
            <span>SDETube's 79 Sheet</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${activeSheet === '79' ? 'bg-amber-950/80 text-amber-200 border border-amber-400/30' : 'bg-slate-800 text-slate-400'}`}>
              79 Qs
            </span>
          </button>

        </div>

        {/* CSV Exporter Action */}
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all shadow-md cursor-pointer hover:border-emerald-500/50"
          title="Export Active Sheet to CSV"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export CSV ({activeSheetConfig.totalQuestions} Qs)</span>
        </button>
      </div>
      
      {/* HERO SHOWCASE & PROGRESS BANNER */}
      <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border shadow-2xl relative overflow-hidden ${
        activeSheet === 'sde' ? 'border-emerald-500/30' : activeSheet === 'a2z' ? 'border-indigo-500/30' : 'border-amber-500/30'
      }`}>
        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
          <Code className="w-80 h-80 text-white" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left Title & Description */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold flex items-center space-x-1.5 shadow-sm ${
                activeSheet === 'sde' 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                  : activeSheet === 'a2z'
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/60'
                    : 'bg-amber-950 text-amber-300 border border-amber-700/60'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>OFFICIAL CURRICULUM &bull; {activeSheetConfig.totalQuestions} PROBLEMS</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {allCategories.length} Topics
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              {activeSheetConfig.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {activeSheetConfig.description}. Seamlessly practice directly in the built-in Monaco Code Arena with live testcases, automated judging, and AI optimization.
            </p>
          </div>

          {/* Right Live Overall Progress Ring */}
          <div className="flex items-center gap-4 sm:gap-6 bg-slate-950/70 p-4 sm:p-5 rounded-3xl border border-slate-800/80 backdrop-blur-md">
            
            {/* Circular Progress Gauge */}
            <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={activeSheet === 'sde' ? 'text-emerald-400' : activeSheet === 'a2z' ? 'text-indigo-400' : 'text-amber-400'}
                  strokeDasharray={`${solvedPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-black font-mono text-slate-100">{solvedPercent}%</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Done</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-medium">Sheet Solved Status</div>
              <div className="text-2xl font-black font-mono text-slate-100">
                {solvedCount} <span className="text-xs text-slate-500 font-normal">/ {totalCount} Solved</span>
              </div>
              <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                <span>{mustDoSolved} / {mustDoCount} Must Do Problems</span>
              </div>
            </div>

          </div>

        </div>

        {/* Difficulty Breakdown Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          
          {/* Easy Bar */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">Easy</span>
                <span className="font-mono text-[11px] text-slate-400">{easySolved}/{easyTotal}</span>
              </div>
              <div className="w-32 sm:w-28 md:w-36 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${easyTotal > 0 ? (easySolved / easyTotal) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Medium Bar */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400">Medium</span>
                <span className="font-mono text-[11px] text-slate-400">{mediumSolved}/{mediumTotal}</span>
              </div>
              <div className="w-32 sm:w-28 md:w-36 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-500" 
                  style={{ width: `${mediumTotal > 0 ? (mediumSolved / mediumTotal) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hard Bar */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-400">Hard</span>
                <span className="font-mono text-[11px] text-slate-400">{hardSolved}/{hardTotal}</span>
              </div>
              <div className="w-32 sm:w-28 md:w-36 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-rose-500 transition-all duration-500" 
                  style={{ width: `${hardTotal > 0 ? (hardSolved / hardTotal) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* PROBLEM OF THE DAY (POTD) CARD */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex-shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 text-[10px] font-black uppercase tracking-wider">
                Daily Problem of the Day
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {potdProblem.category}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 hover:text-amber-300 transition-colors">
              {potdProblem.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                potdProblem.difficulty === 'Easy' 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' 
                  : potdProblem.difficulty === 'Medium' 
                    ? 'bg-amber-950 text-amber-400 border border-amber-800/60' 
                    : 'bg-rose-950 text-rose-400 border border-rose-800/60'
              }`}>
                {potdProblem.difficulty}
              </span>
              <span>&bull;</span>
              <span>{potdProblem.companies.slice(0, 3).join(', ')}</span>
              {isPotdSolved && (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold ml-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Solved Today
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenCodingFullscreen?.(potdProblem)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Terminal className="w-4 h-4" />
            <span>Solve POTD</span>
          </button>
        </div>
      </div>

      {/* TOPIC PILLS QUICK FILTER BAR */}
      <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar pb-2 pt-1">
        <button
          onClick={() => {
            setActiveTopicPill('ALL');
            setSelectedCategory('ALL');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
            activeTopicPill === 'ALL' && selectedCategory === 'ALL'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>All Topics</span>
          <span className="text-[10px] font-mono opacity-80">({totalCount})</span>
        </button>

        {topTopics.map(([topicName, count]) => {
          const isSelected = activeTopicPill === topicName || selectedCategory === topicName;
          return (
            <button
              key={topicName}
              onClick={() => {
                setActiveTopicPill(topicName);
                setSelectedCategory(topicName);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{topicName}</span>
              <span className="text-[10px] font-mono opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* ADVANCED FILTER & SEARCH CONTROLS */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Search Problems & Companies
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problem title or company (e.g. Two Sum, Google)..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category / Topic Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Topic / Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setActiveTopicPill(e.target.value);
              }}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All {allCategories.length} Topics</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Easy">Easy ({easyTotal})</option>
              <option value="Medium">Medium ({mediumTotal})</option>
              <option value="Hard">Hard ({hardTotal})</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Status & Rating
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Problems ({totalCount})</option>
              <option value="MUST_DO">⭐ Must Do Only ({mustDoCount})</option>
              <option value="SOLVED">✅ Solved Only ({solvedCount})</option>
              <option value="UNSOLVED">⭕ Unsolved Only ({totalCount - solvedCount})</option>
            </select>
          </div>

        </div>

        {/* Filter Summary & Reset Action */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Showing <strong className="text-slate-100 font-mono">{filteredProblems.length}</strong> of{' '}
            <strong className="text-slate-100 font-mono">{totalCount}</strong> problems in{' '}
            <span className="text-indigo-400 font-bold">{activeSheetConfig.name}</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Active Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* PROBLEMS TABLE LIST */}
      <div className="p-2 sm:p-4 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-mono">
                <th className="py-4 px-4 w-12 text-center">Status</th>
                <th className="py-4 px-4 font-bold">Topic / Category</th>
                <th className="py-4 px-4 font-bold min-w-[240px]">Problem Title</th>
                <th className="py-4 px-4 font-bold text-center">Difficulty</th>
                <th className="py-4 px-4 font-bold">Top Companies</th>
                <th className="py-4 px-4 font-bold">Importance</th>
                <th className="py-4 px-4 font-bold text-center">Practice Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 space-y-3">
                    <FolderOpen className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                    <p className="text-base font-bold text-slate-300">No problems found matching your criteria</p>
                    <p className="text-xs text-slate-500">Try adjusting your search terms, topic, or difficulty filters.</p>
                    <button
                      onClick={resetAllFilters}
                      className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProblems.map((p) => {
                  const isSolved = solvedIds.includes(p.id);
                  const isMustDo = p.rating.includes('Must Do');

                  return (
                    <tr
                      key={`${p.sheetType}-${p.id}`}
                      className={`hover:bg-slate-800/40 transition-colors group cursor-pointer ${
                        isSolved ? 'bg-slate-950/40' : ''
                      }`}
                      onClick={() => onOpenCodingFullscreen?.(p)}
                    >
                      {/* Checkbox Status */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => toggleSolved(p.id, e)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
                            isSolved
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                              : 'bg-slate-950 border-slate-700 text-transparent hover:border-slate-500 hover:text-slate-600'
                          }`}
                          title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-medium text-slate-400 text-xs font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300">
                          {p.category}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4 font-medium">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold transition-colors ${
                            isSolved 
                              ? 'line-through text-slate-500' 
                              : 'text-slate-100 group-hover:text-indigo-300'
                          }`}>
                            {p.name}
                          </span>
                          {isMustDo && (
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-current flex-shrink-0" />
                          )}
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                          p.difficulty === 'Easy'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : p.difficulty === 'Medium'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                        }`}>
                          {p.difficulty}
                        </span>
                      </td>

                      {/* Target Companies */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 items-center">
                          {p.companies.slice(0, 3).map((comp) => (
                            <span
                              key={comp}
                              className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[11px] border border-slate-700/60"
                            >
                              {comp}
                            </span>
                          ))}
                          {p.companies.length > 3 && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              +{p.companies.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                        <span className={isMustDo ? 'text-amber-400 font-bold' : 'text-slate-400 font-mono'}>
                          {p.rating}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-2">
                          
                          {/* Code Arena Button */}
                          <button
                            onClick={() => onOpenCodingFullscreen?.(p)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                            title="Open in Monaco Coding Arena with Testcases & Compiler"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Code Arena</span>
                          </button>

                          {/* Video Lecture Button */}
                          {onSelectVideoByTopic && (
                            <button
                              onClick={() => onSelectVideoByTopic(p.name)}
                              className="p-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-700/60 text-purple-300 hover:text-white transition-all cursor-pointer"
                              title="Watch Video Lecture for this Problem"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}

                          {/* LeetCode External Link */}
                          {p.leetcode && (
                            <a
                              href={p.leetcode}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 transition-all"
                              title="Open on LeetCode"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* GFG External Link */}
                          {p.gfg && (
                            <a
                              href={p.gfg}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all"
                              title="Open on GeeksforGeeks"
                            >
                              <Code className="w-3.5 h-3.5" />
                            </a>
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
      </div>

    </div>
  );
};
