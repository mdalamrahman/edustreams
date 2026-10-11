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
  Rocket,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Youtube,
  Bookmark,
  BookmarkCheck,
  Edit3,
  Crown,
  Award
} from 'lucide-react';
import { 
  DSAProblem, 
  DSASheetType, 
  DSA_SHEETS_CONFIG, 
  getSheetData, 
  SDE_SHEET_191_DATA,
  SDEProblem,
  getUniversalSdePotd
} from '../lib/dsaSheetsData';
import { ProblemNotesModal } from './ProblemNotesModal';
import { getLocalProblemNote } from '../lib/notesService';
import { isProblemSlugSolved, isPotdSolvedToday } from '../lib/analytics';
import { 
  getSolvedIds as getSolvedIdsFromService, 
  setSolvedIds as setSolvedIdsToService, 
  getRevisionIds as getRevisionIdsFromService, 
  setRevisionIds as setRevisionIdsToService, 
  getActiveSheet as getActiveSheetFromService, 
  setActiveSheet as setActiveSheetToService,
  toggleProblemSolved as toggleProblemSolvedInService,
  toggleRevisionId as toggleRevisionIdInService,
  loadUserProgress
} from '../lib/progressService';
import { Video } from '../lib/types';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../lib/AppContext';


interface SDESheetExplorerProps {
  onSelectVideoByTopic?: (query: string) => void;
  onOpenVideo?: (video: Video) => void;
  onOpenCodingFullscreen?: (problem: DSAProblem) => void;
  userEmail?: string;
  dsaVideos?: Video[];
}

/**
 * Searches exclusively within the Telegram DSA channel video list ('ch-dsa-01') to find an exact or high-confidence matching lecture.
 * Returns null if no real matching video exists (never falls back to generic or wrong videos).
 */
export function findMatchingDsaVideo(problemName?: string, dsaVideos?: Video[]): Video | null {
  if (!dsaVideos || dsaVideos.length === 0 || !problemName) return null;
  
  const clean = (s?: string) => {
    if (!s) return '';
    return String(s)
      .replace(/^DSA Lecture \d+:\s*/i, '')
      .replace(/\s*\(.*?\)/g, '')
      .replace(/\s*\|.*$/g, '')
      .replace(/_/g, ' ')
      .replace(/[^\w\s]/gi, ' ')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  };

  const normP = clean(problemName);
  if (!normP || normP.length < 3) return null;

  // 1. Exact cleaned match or complete substring match
  for (const v of dsaVideos) {
    const normV = clean(v?.title);
    if (normP === normV || (normP.length >= 7 && (normP.includes(normV) || normV.includes(normP)))) {
      return v;
    }
  }

  const stopwords = new Set(['the', 'and', 'for', 'with', 'part', 'using', 'algorithm', 'problem', 'in', 'of', 'a', 'an', 'to', 'by', 'array', 'part-i', 'part-ii', 'given', 'solve', 'two', 'numbers', 'number', 'find', 'all']);
  const pWords = normP.split(' ').filter(w => w.length > 2 && !stopwords.has(w));
  if (pWords.length === 0) return null;

  // 2. All specific key words of problem are in video (and problem has >= 2 key words)
  if (pWords.length >= 2) {
    for (const v of dsaVideos) {
      const normV = clean(v?.title);
      const vWords = new Set(normV.split(' '));
      const allMatch = pWords.every(w => vWords.has(w) || Array.from(vWords).some(vw => (vw.length > 3 && (vw.startsWith(w) || w.startsWith(vw)))));
      if (allMatch) return v;
    }
  }

  return null;
}

const STORAGE_ACTIVE_SHEET_KEY = 'sdetube_active_dsa_sheet';
const STORAGE_SOLVED_PREFIX = 'sdetube_dsa_sheet_solved_';
const STORAGE_REVISION_KEY = 'sdetube_dsa_revision_ids';
const STORAGE_POTD_DATE_KEY = 'sdetube_potd_date';
const STORAGE_POTD_ID_KEY = 'sdetube_potd_problem_id';

export const SDESheetExplorer: React.FC<SDESheetExplorerProps> = ({
  onSelectVideoByTopic,
  onOpenVideo,
  onOpenCodingFullscreen,
  userEmail: propUserEmail,
  dsaVideos: propDsaVideos
}) => {
  const navigate = useNavigate();
  const appCtx = useAppContext();

  const userEmail = propUserEmail !== undefined ? propUserEmail : appCtx.user?.email;
  const dsaVideos = propDsaVideos || (appCtx.dynamicVideos.length > 0 ? appCtx.dynamicVideos.filter(v => v.channel_id === 'ch-dsa-01') : []);

  const handleOpenProblem = (p: DSAProblem) => {
    if (onOpenCodingFullscreen) onOpenCodingFullscreen(p);
    else {
      const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      navigate(`/problem/${slug}`);
    }
  };

  // Active Sheet Selector from Supabase progressService
  const [activeSheet, setActiveSheetState] = useState<DSASheetType>(() => {
    return getActiveSheetFromService(userEmail) as DSASheetType;
  });


  const setActiveSheet = (sheet: DSASheetType) => {
    setActiveSheetState(sheet);
    setActiveSheetToService(sheet, userEmail).catch(() => {});
  };

  const activeSheetConfig = DSA_SHEETS_CONFIG[activeSheet];
  const currentSheetProblems = useMemo(() => getSheetData(activeSheet), [activeSheet]);

  // View Mode: 'accordion' (takeuforward Step-by-Step Categorization) vs 'table' (Flat Filterable Table)
  const [viewMode, setViewMode] = useState<'accordion' | 'table'>('accordion');

  // Expanded Step Accordions Map
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  // Active Problem for Notes Modal
  const [activeNotesProblem, setActiveNotesProblem] = useState<DSAProblem | null>(null);

  // Notes update listener key to refresh UI indicators
  const [notesUpdateTrigger, setNotesUpdateTrigger] = useState(0);

  useEffect(() => {
    const handleNotesUpdated = () => setNotesUpdateTrigger((prev) => prev + 1);
    window.addEventListener('sdetube_notes_updated', handleNotesUpdated);
    return () => window.removeEventListener('sdetube_notes_updated', handleNotesUpdated);
  }, []);

  // Solved State per Sheet from central progressService
  const [solvedIds, setSolvedIdsState] = useState<number[]>(() => {
    return getSolvedIdsFromService(activeSheet, userEmail);
  });

  // Revision / Bookmarked Problems State from central progressService
  const [revisionIds, setRevisionIdsState] = useState<string[]>(() => {
    return getRevisionIdsFromService(userEmail);
  });

  // Re-sync solved state when switching sheets or when a problem is solved
  useEffect(() => {
    const syncSolved = () => {
      const freshSolved = getSolvedIdsFromService(activeSheet, userEmail);
      const freshRevisions = getRevisionIdsFromService(userEmail);
      setSolvedIdsState(freshSolved);
      setRevisionIdsState(freshRevisions);
    };

    syncSolved();
    // Load fresh data from Supabase in background
    loadUserProgress(userEmail).then(syncSolved).catch(() => {});

    window.addEventListener('sdetube_progress_updated', syncSolved);
    window.addEventListener('sdetube_problem_solved', syncSolved);
    window.addEventListener('sdetube_potd_solved', syncSolved);
    return () => {
      window.removeEventListener('sdetube_progress_updated', syncSolved);
      window.removeEventListener('sdetube_problem_solved', syncSolved);
      window.removeEventListener('sdetube_potd_solved', syncSolved);
    };
  }, [activeSheet, userEmail]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL'); // 'ALL' | 'REVISION' | 'MUST_DO' | 'SOLVED' | 'UNSOLVED'
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [activeTopicPill, setActiveTopicPill] = useState('ALL');

  // Compute all unique companies with question counts for the active sheet
  const companyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (currentSheetProblems || []).forEach((p) => {
      if (Array.isArray(p.companies)) {
        p.companies.forEach((c) => {
          const clean = (c || '').trim();
          if (clean) {
            counts[clean] = (counts[clean] || 0) + 1;
          }
        });
      }
    });
    return counts;
  }, [currentSheetProblems]);

  const sortedCompanies = useMemo(() => {
    return Object.keys(companyCounts).sort((a, b) => companyCounts[b] - companyCounts[a]);
  }, [companyCounts]);

  // SINGLE UNIVERSAL POTD: Strictly from SDETube's SDE Sheet (191 Questions)
  const potdProblem = useMemo<DSAProblem>(() => {
    return getUniversalSdePotd();
  }, []);

  // Solved status for SDE POTD (checks SDE solved list + POTD today key)
  const isPotdSolved = useMemo(() => {
    if (!potdProblem) return false;
    if (isPotdSolvedToday('sdetube')) return true;
    try {
      const sdeSaved = localStorage.getItem(`${STORAGE_SOLVED_PREFIX}sde`) || localStorage.getItem('sdetube_sde_sheet_solved_ids');
      const sdeSolvedList: number[] = sdeSaved ? JSON.parse(sdeSaved) : [];
      if (sdeSolvedList.includes(potdProblem.id)) return true;
      return isProblemSlugSolved(potdProblem.slug || potdProblem.name);
    } catch {
      return false;
    }
  }, [potdProblem, solvedIds]);

  const isProblemSolved = (p: DSAProblem) => {
    return solvedIds.includes(p.id) || isProblemSlugSolved(p.slug || p.name);
  };

  const toggleSolved = async (problem: DSAProblem | number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const id = typeof problem === 'number' ? problem : problem.id;
    const targetProb = typeof problem === 'object' ? problem : currentSheetProblems.find(p => p.id === id);
    const slug = targetProb?.slug || targetProb?.name || '';
    
    // Immediate optimistic local update
    const isCurrentlySolved = targetProb ? isProblemSolved(targetProb) : solvedIds.includes(id);
    const nextSolved = isCurrentlySolved ? solvedIds.filter(item => item !== id) : [...solvedIds, id];
    setSolvedIdsState(nextSolved);

    // Persist to Supabase & Backend
    await toggleProblemSolvedInService(activeSheet, id, userEmail, slug);
  };

  const toggleRevision = async (problem: DSAProblem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const key = `${problem.sheetType}-${problem.id}`;
    
    // Immediate optimistic local update
    const exists = revisionIds.includes(key);
    const nextRevs = exists ? revisionIds.filter(item => item !== key) : [...revisionIds, key];
    setRevisionIdsState(nextRevs);

    // Persist to Supabase
    await toggleRevisionIdInService(key, userEmail);
  };

  const isProblemStarred = (problem: DSAProblem) => {
    const key = `${problem.sheetType}-${problem.id}`;
    return revisionIds.includes(key);
  };

  // Reset category/topic filters when switching sheets
  const handleSwitchSheet = (newSheet: DSASheetType) => {
    setActiveSheet(newSheet);
    setSelectedCategory('ALL');
    setSelectedCompany('ALL');
    setActiveTopicPill('ALL');
    setSearchQuery('');
  };

  const allCategories = useMemo(() => {
    return Array.from(new Set((currentSheetProblems || []).map((p) => p.category || 'Algorithms')));
  }, [currentSheetProblems]);

  // Expand / Collapse Step Accordions
  const toggleStep = (stepName: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepName]: !prev[stepName]
    }));
  };

  const expandAllSteps = () => {
    const full: Record<string, boolean> = {};
    allCategories.forEach((c) => { full[c] = true; });
    setExpandedSteps(full);
  };

  const collapseAllSteps = () => {
    setExpandedSteps({});
  };

  // Initialize first 2 steps open by default on sheet load
  useEffect(() => {
    if (allCategories.length > 0) {
      setExpandedSteps({
        [allCategories[0]]: true,
        ...(allCategories[1] ? { [allCategories[1]]: true } : {})
      });
    }
  }, [activeSheet]);

  // Multi-Criteria Filtering
  const filteredProblems = useMemo(() => {
    return (currentSheetProblems || []).filter((p) => {
      const q = (searchQuery || '').toLowerCase().trim();
      const pName = (p.name || '').toLowerCase();
      const pCat = (p.category || '').toLowerCase();
      const pSub = (p.subcategory || '').toLowerCase();
      
      const matchesSearch = !q || (
        pName.includes(q) ||
        pCat.includes(q) ||
        pSub.includes(q) ||
        (Array.isArray(p.companies) && p.companies.some((c) => (c || '').toLowerCase().includes(q)))
      );

      const matchesCat = 
        selectedCategory === 'ALL' 
          ? (activeTopicPill === 'ALL' || p.category === activeTopicPill)
          : (p.category === selectedCategory);

      const matchesCompany = 
        selectedCompany === 'ALL' || 
        (Array.isArray(p.companies) && p.companies.some((c) => (c || '').toLowerCase() === (selectedCompany || '').toLowerCase()));

      const matchesDifficulty = 
        selectedDifficulty === 'ALL' || p.difficulty === selectedDifficulty;

      const isSolved = isProblemSolved(p);
      const isStarred = isProblemStarred(p);

      let matchesStatus = true;
      if (selectedStatus === 'SOLVED') matchesStatus = isSolved;
      if (selectedStatus === 'UNSOLVED') matchesStatus = !isSolved;
      if (selectedStatus === 'MUST_DO') matchesStatus = Boolean(p.rating && p.rating.includes('Must Do'));
      if (selectedStatus === 'REVISION') matchesStatus = isStarred;

      return matchesSearch && matchesCat && matchesCompany && matchesDifficulty && matchesStatus;
    });
  }, [currentSheetProblems, searchQuery, selectedCategory, selectedCompany, activeTopicPill, selectedDifficulty, selectedStatus, solvedIds, revisionIds]);

  // Group filtered problems hierarchically by Step -> Subcategory (takeuforward structure)
  const groupedData = useMemo(() => {
    const map = new Map<string, Map<string, DSAProblem[]>>();
    
    allCategories.forEach((cat) => {
      map.set(cat, new Map<string, DSAProblem[]>());
    });

    filteredProblems.forEach((p) => {
      const cat = p.category;
      const sub = p.subcategory || 'Problems';
      if (!map.has(cat)) {
        map.set(cat, new Map());
      }
      const subMap = map.get(cat)!;
      if (!subMap.has(sub)) {
        subMap.set(sub, []);
      }
      subMap.get(sub)!.push(p);
    });

    const result: { category: string; subcategories: { subcategory: string; problems: DSAProblem[] }[]; total: number; solved: number }[] = [];
    map.forEach((subMap, cat) => {
      const subList: { subcategory: string; problems: DSAProblem[] }[] = [];
      let catTotal = 0;
      let catSolved = 0;

      subMap.forEach((probs, sub) => {
        if (probs.length > 0) {
          subList.push({ subcategory: sub, problems: probs });
          catTotal += probs.length;
          catSolved += probs.filter((item) => isProblemSolved(item)).length;
        }
      });

      if (subList.length > 0) {
        result.push({
          category: cat,
          subcategories: subList,
          total: catTotal,
          solved: catSolved
        });
      }
    });

    return result;
  }, [filteredProblems, allCategories, solvedIds]);

  // Statistics calculation for the active sheet
  const totalCount = currentSheetProblems.length;
  const solvedCount = currentSheetProblems.filter((p) => isProblemSolved(p)).length;
  const solvedPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
  const mustDoCount = currentSheetProblems.filter((p) => p.rating.includes('Must Do')).length;
  const mustDoSolved = currentSheetProblems.filter((p) => p.rating.includes('Must Do') && isProblemSolved(p)).length;

  const currentSheetRevisionCount = currentSheetProblems.filter((p) => isProblemStarred(p)).length;

  const easyTotal = currentSheetProblems.filter((p) => p.difficulty === 'Easy').length;
  const easySolved = currentSheetProblems.filter((p) => p.difficulty === 'Easy' && isProblemSolved(p)).length;

  const mediumTotal = currentSheetProblems.filter((p) => p.difficulty === 'Medium').length;
  const mediumSolved = currentSheetProblems.filter((p) => p.difficulty === 'Medium' && isProblemSolved(p)).length;

  const hardTotal = currentSheetProblems.filter((p) => p.difficulty === 'Hard').length;
  const hardSolved = currentSheetProblems.filter((p) => p.difficulty === 'Hard' && isProblemSolved(p)).length;

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

  return (
    <div className="space-y-6 animate-fadeIn font-sans">

      {/* COMPANY-WISE QUESTIONS CALLOUT BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border border-cyan-500/30 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-bold text-slate-100">Targeting Specific Tech Companies?</span>
              <span className="px-2 py-0.2 rounded-full bg-cyan-950 border border-cyan-700/60 text-[10px] font-mono font-bold text-cyan-300">3,400+ Curated Problems</span>
            </div>
            <p className="text-xs text-slate-400">Filter by Google, BrowserStack, Amazon, Meta, Microsoft across 30 Days, 6 Months, and All Time with single submission tracking.</p>
          </div>
        </div>
        <button
          onClick={() => {
            window.location.hash = '#/dsa-problems';
          }}
          className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-600/20 cursor-pointer flex-shrink-0"
        >
          <Building2 className="w-4 h-4" />
          <span>Explore Company DSA Problems</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* TOP 5-WAY SHEET SWITCHER TABS */}
      <div className="p-2 sm:p-3 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 w-full">
          
          {/* TAB 1: SDE Sheet */}
          <button
            onClick={() => handleSwitchSheet('sde')}
            className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
              activeSheet === 'sde'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02] border border-emerald-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Rocket className={`w-4 h-4 ${activeSheet === 'sde' ? 'text-white animate-bounce' : 'text-emerald-400'}`} />
            <span>SDE Sheet</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${activeSheet === 'sde' ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-400/30' : 'bg-slate-800 text-slate-400'}`}>
              191 Qs
            </span>
          </button>

          {/* TAB 2: A2Z DSA Roadmap */}
          <button
            onClick={() => handleSwitchSheet('a2z')}
            className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
              activeSheet === 'a2z'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-[1.02] border border-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeSheet === 'a2z' ? 'text-white animate-pulse' : 'text-indigo-400'}`} />
            <span>A2Z Roadmap</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${activeSheet === 'a2z' ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-400/30' : 'bg-slate-800 text-slate-400'}`}>
              474 Qs
            </span>
          </button>

          {/* TAB 3: 79 Sheet */}
          <button
            onClick={() => handleSwitchSheet('79')}
            className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
              activeSheet === '79'
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 text-white shadow-lg shadow-amber-500/20 scale-[1.02] border border-amber-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Zap className={`w-4 h-4 ${activeSheet === '79' ? 'text-white animate-pulse' : 'text-amber-400'}`} />
            <span>79 Fast-Track</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${activeSheet === '79' ? 'bg-amber-950/80 text-amber-200 border border-amber-400/30' : 'bg-slate-800 text-slate-400'}`}>
              79 Qs
            </span>
          </button>

          {/* TAB 4: Blind 75 Sheet */}
          <button
            onClick={() => handleSwitchSheet('blind75')}
            className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
              activeSheet === 'blind75'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02] border border-orange-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Award className={`w-4 h-4 ${activeSheet === 'blind75' ? 'text-amber-200 animate-bounce' : 'text-orange-400'}`} />
            <span>Blind 75</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${activeSheet === 'blind75' ? 'bg-orange-950/80 text-orange-200 border border-orange-400/30' : 'bg-slate-800 text-slate-400'}`}>
              76 Qs
            </span>
          </button>

          {/* TAB 5: CodeStoryWithMIK Premium */}
          <button
            onClick={() => handleSwitchSheet('mik')}
            className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
              activeSheet === 'mik'
                ? 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/20 scale-[1.02] border border-pink-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Crown className={`w-4 h-4 ${activeSheet === 'mik' ? 'text-amber-300 animate-bounce' : 'text-pink-400'}`} />
            <span>CodeStoryWithMIK</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${activeSheet === 'mik' ? 'bg-pink-950/80 text-pink-200 border border-pink-400/30' : 'bg-slate-800 text-slate-400'}`}>
              174 Qs
            </span>
          </button>

        </div>
      </div>

      {/* SINGLE UNIVERSAL POTD (ALWAYS FROM SDE SHEET 191) */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex-shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 text-[10px] font-black uppercase tracking-wider">
                SDETube Problem of the Day (SDE Sheet)
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
              {potdProblem.companies && potdProblem.companies.length > 0 && (
                <>
                  <span>&bull;</span>
                  <span>{potdProblem.companies.slice(0, 3).join(', ')}</span>
                </>
              )}
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
            onClick={() => handleOpenProblem(potdProblem)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Terminal className="w-4 h-4" />
            <span>Solve SDE POTD</span>
          </button>
        </div>
      </div>
      
      {/* HERO SHOWCASE & PROGRESS BANNER */}
      <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border shadow-2xl relative overflow-hidden ${
        activeSheet === 'sde' ? 'border-emerald-500/30' : activeSheet === 'a2z' ? 'border-indigo-500/30' : activeSheet === 'mik' ? 'border-pink-500/30' : 'border-amber-500/30'
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
                    : activeSheet === 'mik'
                      ? 'bg-pink-950 text-pink-300 border border-pink-700/60'
                      : 'bg-amber-950 text-amber-300 border border-amber-700/60'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>OFFICIAL CURRICULUM &bull; {activeSheetConfig.totalQuestions} PROBLEMS</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {allCategories.length} Steps / Topics
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              {activeSheetConfig.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {activeSheetConfig.description}. Categorized by step-by-step topics & subcategories, equipped with video lectures, articles, personal cloud notes (.txt), and Monaco Code Arena.
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

      {/* QUICK STATUS PILLS (ALL, REVISION HUB, MUST DO, SOLVED, UNSOLVED) */}
      <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar pb-1">
        
        {/* All Tab */}
        <button
          onClick={() => setSelectedStatus('ALL')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            selectedStatus === 'ALL'
              ? 'bg-slate-100 text-slate-950 shadow-md scale-[1.02]'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>All Questions</span>
          <span className="text-[10px] font-mono opacity-80">({totalCount})</span>
        </button>

        {/* REVISION HUB TAB */}
        <button
          onClick={() => setSelectedStatus('REVISION')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            selectedStatus === 'REVISION'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 scale-[1.02]'
              : 'bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-amber-500/30'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${selectedStatus === 'REVISION' ? 'fill-current' : ''}`} />
          <span>⭐ Revision Hub</span>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${selectedStatus === 'REVISION' ? 'bg-amber-950/80 text-amber-200' : 'bg-slate-800 text-slate-400'}`}>
            {currentSheetRevisionCount}
          </span>
        </button>

        {/* Must Do Tab */}
        <button
          onClick={() => setSelectedStatus('MUST_DO')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            selectedStatus === 'MUST_DO'
              ? 'bg-amber-400 text-slate-950 shadow-md font-bold scale-[1.02]'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
          <span>Must Do (5.0 ★)</span>
          <span className="text-[10px] font-mono opacity-80">({mustDoCount})</span>
        </button>

        {/* Solved Only */}
        <button
          onClick={() => setSelectedStatus('SOLVED')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            selectedStatus === 'SOLVED'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-bold scale-[1.02]'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Solved</span>
          <span className="text-[10px] font-mono opacity-80">({solvedCount})</span>
        </button>

        {/* Unsolved Only */}
        <button
          onClick={() => setSelectedStatus('UNSOLVED')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            selectedStatus === 'UNSOLVED'
              ? 'bg-indigo-600 text-white shadow-md font-bold scale-[1.02]'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>Unsolved</span>
          <span className="text-[10px] font-mono opacity-80">({totalCount - solvedCount})</span>
        </button>

      </div>

      {/* ADVANCED FILTER & SEARCH CONTROLS + VIEW MODE SWITCHER */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          
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
                placeholder="Search problem name or company (e.g. Two Sum, Google, Meta)..."
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

          {/* Company-Wise Filter Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-indigo-400" />
              <span>Company Filter</span>
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Companies ({sortedCompanies.length})</option>
              {sortedCompanies.map((comp) => (
                <option key={comp} value={comp}>
                  {comp} ({companyCounts[comp]})
                </option>
              ))}
            </select>
          </div>

          {/* Category / Topic Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Step / Topic
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setActiveTopicPill(e.target.value);
              }}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All {allCategories.length} Steps</option>
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
              Status & Revision
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Problems ({totalCount})</option>
              <option value="REVISION">⭐ Bookmarked for Revision ({currentSheetRevisionCount})</option>
              <option value="MUST_DO">🔥 Must Do Only ({mustDoCount})</option>
              <option value="SOLVED">✅ Solved Only ({solvedCount})</option>
              <option value="UNSOLVED">⭕ Unsolved Only ({totalCount - solvedCount})</option>
            </select>
          </div>

        </div>

        {/* Company Quick-Filter Chips Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar pt-1 pb-1 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap flex items-center gap-1 mr-1">
            <Building2 className="w-3 h-3 text-slate-500" />
            <span>Top Companies:</span>
          </span>
          <button
            onClick={() => setSelectedCompany('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCompany === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Companies
          </button>
          {sortedCompanies.slice(0, 12).map((comp) => {
            const isSelected = selectedCompany.toLowerCase() === comp.toLowerCase();
            return (
              <button
                key={comp}
                onClick={() => setSelectedCompany(isSelected ? 'ALL' : comp)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                }`}
              >
                <span>{comp}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-500'
                }`}>
                  {companyCounts[comp]}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher + Expand/Collapse Buttons */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 gap-3">
          <div className="flex items-center space-x-3">
            <span>
              Showing <strong className="text-slate-100 font-mono">{filteredProblems.length}</strong> of{' '}
              <strong className="text-slate-100 font-mono">{totalCount}</strong> problems in{' '}
              <span className="text-indigo-400 font-bold">{activeSheetConfig.name}</span>
            </span>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* View Mode and Expand/Collapse Controls */}
          <div className="flex items-center space-x-2">
            
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('accordion')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === 'accordion' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Step Categorization</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === 'table' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>Flat Table</span>
              </button>
            </div>

            {/* Expand / Collapse All (only visible in accordion mode) */}
            {viewMode === 'accordion' && (
              <div className="hidden sm:flex items-center space-x-1.5">
                <button
                  onClick={expandAllSteps}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer border border-slate-700"
                  title="Expand All Steps"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Expand All</span>
                </button>

                <button
                  onClick={collapseAllSteps}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer border border-slate-700"
                  title="Collapse All Steps"
                >
                  <Minimize2 className="w-3 h-3" />
                  <span>Collapse All</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* RENDER MODE 1: STEP CATEGORIZATION ACCORDION (TAKEUFORWARD STYLE) */}
      {viewMode === 'accordion' && (
        <div className="space-y-4">
          {groupedData.length === 0 ? (
            <div className="p-16 text-center text-slate-500 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-3">
              <FolderOpen className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <p className="text-base font-bold text-slate-300">No problems found matching your criteria</p>
              <button
                onClick={resetAllFilters}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            groupedData.map((stepGroup, stepIdx) => {
              const isExpanded = expandedSteps[stepGroup.category] ?? false;
              const stepPercent = stepGroup.total > 0 ? Math.round((stepGroup.solved / stepGroup.total) * 100) : 0;
              const isStepCompleted = stepGroup.total > 0 && stepGroup.solved === stepGroup.total;

              return (
                <div
                  key={stepGroup.category}
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-xl ${
                    isExpanded 
                      ? 'bg-slate-900/95 border-indigo-500/40' 
                      : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80'
                  }`}
                >
                  {/* STEP ACCORDION HEADER */}
                  <div
                    onClick={() => toggleStep(stepGroup.category)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer group select-none gap-4"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 transition-all ${
                        isStepCompleted
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                          : isExpanded
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                      }`}>
                        {isStepCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stepIdx + 1}
                      </div>

                      <div className="min-w-0">
                        <h3 className={`text-sm sm:text-base font-bold transition-colors truncate ${
                          isExpanded ? 'text-indigo-200' : 'text-slate-200 group-hover:text-white'
                        }`}>
                          {stepGroup.category}
                        </h3>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                          <span>{stepGroup.subcategories.length} Sub-topics</span>
                          <span>&bull;</span>
                          <span>{stepGroup.total} Problems</span>
                        </div>
                      </div>
                    </div>

                    {/* Step Progress Pill & Chevron */}
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <div className="hidden sm:block w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isStepCompleted ? 'bg-emerald-400' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${stepPercent}%` }}
                          />
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                          isStepCompleted
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                            : 'bg-slate-950 text-slate-300 border-slate-800'
                        }`}>
                          {stepGroup.solved} / {stepGroup.total}
                        </span>
                      </div>

                      <div className={`p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 transition-transform duration-300 ${
                        isExpanded ? 'transform rotate-180 text-indigo-300 border-indigo-500/40' : 'group-hover:text-white'
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* STEP ACCORDION BODY (SUBCATEGORIES & PROBLEM TABLES) */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t border-slate-800/80 space-y-6 bg-slate-950/40">
                      {stepGroup.subcategories.map((sub) => {
                        const subSolvedCount = sub.problems.filter((p) => isProblemSolved(p)).length;
                        return (
                          <div key={sub.subcategory} className="space-y-3">
                            
                            {/* Subcategory Section Title Pill */}
                            <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                              <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                <h4 className="text-xs sm:text-sm font-bold text-slate-300">
                                  {sub.subcategory}
                                </h4>
                              </div>
                              <span className="text-[11px] font-mono text-slate-500 font-bold">
                                {subSolvedCount} / {sub.problems.length} Solved
                              </span>
                            </div>

                            {/* Subcategory Problem Rows */}
                            <div className="overflow-x-auto rounded-2xl border border-slate-800/60 bg-slate-950/60">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-500 text-[11px] uppercase tracking-wider font-mono">
                                    <th className="py-2.5 px-3 w-10 text-center">Status</th>
                                    <th className="py-2.5 px-3 w-10 text-center">Star</th>
                                    <th className="py-2.5 px-3 w-10 text-center">Note</th>
                                    <th className="py-2.5 px-3 font-bold min-w-[220px]">Problem</th>
                                    <th className="py-2.5 px-3 font-bold text-center">Difficulty</th>
                                    <th className="py-2.5 px-3 font-bold">Companies</th>
                                    <th className="py-2.5 px-3 font-bold">Rating</th>
                                    <th className="py-2.5 px-3 font-bold">Video</th>
                                    <th className="py-2.5 px-3 font-bold text-center">Practice</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40 text-xs">
                                  {sub.problems.map((p) => {
                                    const isSolved = isProblemSolved(p);
                                    const isMustDo = p.rating.includes('Must Do');
                                    const isStarred = isProblemStarred(p);
                                    const existingNote = getLocalProblemNote(p.slug || p.name);

                                    const hasValidYoutube = Boolean(
                                      p.youtube && 
                                      p.youtube.startsWith('http') && 
                                      p.youtube !== '$undefined'
                                    );
                                    const matchingDsaVideo = findMatchingDsaVideo(p.name, dsaVideos);
                                    const hasAnyVideo = hasValidYoutube || Boolean(matchingDsaVideo);

                                    return (
                                      <tr
                                        key={`${p.sheetType}-${p.id}`}
                                        className={`hover:bg-slate-800/40 transition-colors group cursor-pointer ${
                                          isSolved ? 'bg-slate-950/40' : ''
                                        }`}
                                        onClick={() => handleOpenProblem(p)}
                                      >
                                        {/* Checkbox Status */}
                                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            type="button"
                                            onClick={(e) => toggleSolved(p, e)}
                                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer border ${
                                              isSolved
                                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                                                : 'bg-slate-950 border-slate-700 text-transparent hover:border-slate-500'
                                            }`}
                                            title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                                          >
                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                          </button>
                                        </td>

                                        {/* Revision Bookmark Star */}
                                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            type="button"
                                            onClick={(e) => toggleRevision(p, e)}
                                            className={`p-1 rounded-lg transition-all cursor-pointer ${
                                              isStarred 
                                                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' 
                                                : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800'
                                            }`}
                                            title={isStarred ? 'Remove from Revision List' : 'Bookmark for Revision'}
                                          >
                                            <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400' : ''}`} />
                                          </button>
                                        </td>

                                        {/* Personal Study Notes Button */}
                                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            type="button"
                                            onClick={() => setActiveNotesProblem(p)}
                                            className={`p-1 rounded-lg transition-all cursor-pointer relative ${
                                              existingNote 
                                                ? 'text-indigo-300 bg-indigo-500/20 border border-indigo-500/40' 
                                                : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800'
                                            }`}
                                            title={existingNote ? 'View / Edit Personal Cloud Notes' : 'Create Personal Note'}
                                          >
                                            <FileText className="w-3.5 h-3.5" />
                                            {existingNote && (
                                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 absolute top-0.5 right-0.5" />
                                            )}
                                          </button>
                                        </td>

                                        {/* Problem Name */}
                                        <td className="py-2.5 px-3 font-medium">
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
                                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                            p.difficulty === 'Easy'
                                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                                              : p.difficulty === 'Medium'
                                                ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                                                : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                                          }`}>
                                            {p.difficulty}
                                          </span>
                                        </td>

                                        {/* Companies */}
                                        <td className="py-2.5 px-3">
                                          <div className="flex flex-wrap gap-1 items-center">
                                            {(p.companies || []).slice(0, 2).map((comp) => (
                                              <span
                                                key={comp}
                                                className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 text-[10px] border border-slate-800"
                                              >
                                                {comp}
                                              </span>
                                            ))}
                                            {(p.companies?.length || 0) > 2 && (
                                              <span className="text-[9px] text-slate-500 font-mono">
                                                +{(p.companies?.length || 0) - 2}
                                              </span>
                                            )}
                                          </div>
                                        </td>

                                        {/* Rating */}
                                        <td className="py-2.5 px-3 whitespace-nowrap text-[11px]">
                                          <span className={isMustDo ? 'text-amber-400 font-bold' : 'text-slate-400 font-mono'}>
                                            {p.rating}
                                          </span>
                                        </td>

                                        {/* Video Lecture (Telegram Channel or YouTube) */}
                                        <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                          <div className="flex items-center space-x-1.5">
                                            {matchingDsaVideo ? (
                                              <button
                                                onClick={() => {
                                                  if (onOpenVideo) {
                                                    onOpenVideo(matchingDsaVideo);
                                                  } else if (onSelectVideoByTopic) {
                                                    onSelectVideoByTopic(p.name);
                                                  }
                                                }}
                                                className="px-2.5 py-1 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                                title={`Watch SDETube Channel Lecture: ${matchingDsaVideo.title}`}
                                              >
                                                <Play className="w-3 h-3 fill-current text-purple-400" />
                                                <span>Video</span>
                                              </button>
                                            ) : hasValidYoutube ? (
                                              <a
                                                href={p.youtube}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2.5 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                                title="Watch Video Explanation"
                                              >
                                                <Youtube className="w-3.5 h-3.5 text-rose-400" />
                                                <span>YouTube</span>
                                              </a>
                                            ) : (
                                              <span className="text-slate-600 font-mono text-[11px] px-1">—</span>
                                            )}
                                          </div>
                                        </td>

                                        {/* Practice Actions */}
                                        <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                          <div className="flex items-center justify-center space-x-1.5">
                                            
                                            {/* Code Arena Button */}
                                            <button
                                              onClick={() => handleOpenProblem(p)}
                                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                                              title="Solve in Monaco IDE with Testcases & Automated Judge"
                                            >
                                              <Terminal className="w-3 h-3" />
                                              <span>Code Arena</span>
                                            </button>

                                            {/* LeetCode External Link (Only if available) */}
                                            {p.leetcode && p.leetcode.trim() !== '' && (
                                              <a
                                                href={p.leetcode}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 transition-all font-mono font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                                                title="Open Problem Source"
                                              >
                                                <span>Ref</span>
                                                <ExternalLink className="w-2.5 h-2.5" />
                                              </a>
                                            )}

                                            {/* GFG External Link (Only if available) */}
                                            {p.gfg && p.gfg.trim() !== '' && (
                                              <a
                                                href={p.gfg}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all font-mono font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                                                title="Open on GeeksforGeeks"
                                              >
                                                <span>GFG</span>
                                                <ExternalLink className="w-2.5 h-2.5" />
                                              </a>
                                            )}

                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

      {/* RENDER MODE 2: FLAT TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="p-2 sm:p-4 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-mono">
                  <th className="py-4 px-3 w-10 text-center">Status</th>
                  <th className="py-4 px-3 w-10 text-center">Star</th>
                  <th className="py-4 px-3 w-10 text-center">Note</th>
                  <th className="py-4 px-4 font-bold">Step / Category</th>
                  <th className="py-4 px-4 font-bold min-w-[220px]">Problem Title</th>
                  <th className="py-4 px-4 font-bold text-center">Difficulty</th>
                  <th className="py-4 px-4 font-bold">Companies</th>
                  <th className="py-4 px-4 font-bold">Rating</th>
                  <th className="py-4 px-4 font-bold text-center">Practice Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-500 space-y-3">
                      <FolderOpen className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                      <p className="text-base font-bold text-slate-300">No problems found matching your criteria</p>
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
                    const isSolved = isProblemSolved(p);
                    const isMustDo = Boolean(p.rating && p.rating.includes('Must Do'));
                    const isStarred = isProblemStarred(p);
                    const existingNote = getLocalProblemNote(p.slug || p.name);

                    const hasValidYoutube = Boolean(
                      p.youtube && 
                      p.youtube.startsWith('http') && 
                      p.youtube !== '$undefined'
                    );
                    const matchingDsaVideo = findMatchingDsaVideo(p.name, dsaVideos);

                    return (
                      <tr
                        key={`${p.sheetType}-${p.id}`}
                        className={`hover:bg-slate-800/40 transition-colors group cursor-pointer ${
                          isSolved ? 'bg-slate-950/40' : ''
                        }`}
                        onClick={() => handleOpenProblem(p)}
                      >
                        {/* Checkbox Status */}
                        <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => toggleSolved(p, e)}
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

                        {/* Star / Revision */}
                        <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => toggleRevision(p, e)}
                            className={`p-1 rounded-lg transition-all cursor-pointer ${
                              isStarred 
                                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' 
                                : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800'
                            }`}
                            title={isStarred ? 'Remove from Revision List' : 'Bookmark for Revision'}
                          >
                            <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400' : ''}`} />
                          </button>
                        </td>

                        {/* Notes */}
                        <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setActiveNotesProblem(p)}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer relative ${
                              existingNote 
                                ? 'text-indigo-300 bg-indigo-500/20 border border-indigo-500/40' 
                                : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800'
                            }`}
                            title={existingNote ? 'View / Edit Notes (.txt)' : 'Add Problem Notes (.txt)'}
                          >
                            <FileText className="w-4 h-4" />
                            {existingNote && (
                              <span className="w-2 h-2 rounded-full bg-indigo-400 absolute top-0.5 right-0.5" />
                            )}
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
                            <span className={`font-bold text-sm transition-colors ${
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

                        {/* Companies */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 items-center">
                            {(p.companies || []).slice(0, 3).map((comp) => (
                              <span
                                key={comp}
                                className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[11px] border border-slate-700/60"
                              >
                                {comp}
                              </span>
                            ))}
                            {(p.companies || []).length > 3 && (
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
                              onClick={() => handleOpenProblem(p)}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                              title="Open in Monaco Coding Arena with Testcases & Compiler"
                            >
                              <Terminal className="w-3.5 h-3.5" />
                              <span>Code Arena</span>
                            </button>

                            {/* Telegram DSA Channel or YouTube Lecture Video Button */}
                            {matchingDsaVideo ? (
                              <button
                                onClick={() => {
                                  if (onOpenVideo) {
                                    onOpenVideo(matchingDsaVideo);
                                  } else if (onSelectVideoByTopic) {
                                    onSelectVideoByTopic(p.name);
                                  }
                                }}
                                className="p-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 hover:text-white transition-all cursor-pointer shadow-sm"
                                title={`Watch SDETube Channel Lecture: ${matchingDsaVideo.title}`}
                              >
                                <Play className="w-3.5 h-3.5 fill-current text-purple-400" />
                              </button>
                            ) : hasValidYoutube ? (
                              <a
                                href={p.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center"
                                title="Watch Video Explanation"
                              >
                                <Youtube className="w-3.5 h-3.5 text-rose-400" />
                              </a>
                            ) : null}

                            {/* Problem Reference Link */}
                            {p.leetcode && p.leetcode.trim() !== '' && (
                              <a
                                href={p.leetcode}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 transition-all font-mono font-bold text-xs flex items-center gap-1 cursor-pointer"
                                title="Open Problem Source"
                              >
                                <span>Ref</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}

                            {/* GFG External Link (Only if available) */}
                            {p.gfg && p.gfg.trim() !== '' && (
                              <a
                                href={p.gfg}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all font-mono font-bold text-xs flex items-center gap-1 cursor-pointer"
                                title="Open on GeeksforGeeks"
                              >
                                <span>GFG</span>
                                <ExternalLink className="w-3 h-3" />
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
      )}

      {/* PERSONAL STUDY NOTES MODAL (.txt & CLOUDFLARE SYNC) */}
      {activeNotesProblem && (
        <ProblemNotesModal
          problem={activeNotesProblem}
          userEmail={userEmail}
          onClose={() => setActiveNotesProblem(null)}
        />
      )}

    </div>
  );
};
