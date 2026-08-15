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
  Check
} from 'lucide-react';
import { SDEProblem, SDE_SHEET_DATA } from '../lib/sdeSheetData';

interface SDESheetExplorerProps {
  onSelectVideoByTopic?: (query: string) => void;
  onOpenCodingFullscreen?: (problem: SDEProblem) => void;
}

const STORAGE_SOLVED_KEY = 'sdetube_sde_sheet_solved_ids';

export const SDESheetExplorer: React.FC<SDESheetExplorerProps> = ({
  onSelectVideoByTopic,
  onOpenCodingFullscreen
}) => {
  const [solvedIds, setSolvedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SOLVED_KEY) || localStorage.getItem('sdetube_sde_sheet_solved_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [activeTopicPill, setActiveTopicPill] = useState('ALL');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SOLVED_KEY, JSON.stringify(solvedIds));
    } catch (e) {
      console.warn('[SDETube SDE Sheet Storage]:', e);
    }
  }, [solvedIds]);

  const toggleSolved = (id: number) => {
    setSolvedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allCategories = useMemo(() => {
    return Array.from(new Set(SDE_SHEET_DATA.map((p) => p.category)));
  }, []);

  const allCompanies = useMemo(() => {
    const companies = new Set<string>();
    SDE_SHEET_DATA.forEach((p) => p.companies.forEach((c) => companies.add(c.trim())));
    return Array.from(companies).sort();
  }, []);

  const topicPills = [
    { label: 'All Topics', value: 'ALL' },
    { label: 'Arrays', value: 'Arrays' },
    { label: 'Linked List', value: 'Linked List' },
    { label: 'Binary Search', value: 'Binary Search' },
    { label: 'String', value: 'String' },
    { label: 'Binary Tree & BST', value: 'Tree' },
    { label: 'Graph', value: 'Graph' },
    { label: 'Dynamic Programming', value: 'Dynamic Programming' },
    { label: 'Trie', value: 'Trie' }
  ];

  const handlePillClick = (val: string) => {
    setActiveTopicPill(val);
    if (val === 'ALL') {
      setSelectedCategory('ALL');
    } else if (val === 'Tree') {
      setSelectedCategory('ALL');
    } else {
      setSelectedCategory('ALL');
    }
  };

  const filteredProblems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SDE_SHEET_DATA.filter((p) => {
      // Search match
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.companies.some((c) => c.toLowerCase().includes(q));

      // Category dropdown match
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

      // Company dropdown match
      const matchesCompany = selectedCompany === 'ALL' || p.companies.some((c) => c.toLowerCase() === selectedCompany.toLowerCase());

      // Topic pill match
      let matchesTopicPill = true;
      if (activeTopicPill !== 'ALL') {
        if (activeTopicPill === 'Tree') {
          matchesTopicPill = p.category.includes('Tree');
        } else {
          matchesTopicPill = p.category.includes(activeTopicPill);
        }
      }

      // Difficulty match
      const matchesDifficulty = selectedDifficulty === 'ALL' || p.difficulty === selectedDifficulty;

      // Status match
      const isSolved = solvedIds.includes(p.id);
      let matchesStatus = true;
      if (selectedStatus === 'SOLVED') matchesStatus = isSolved;
      if (selectedStatus === 'UNSOLVED') matchesStatus = !isSolved;
      if (selectedStatus === 'MUST_DO') matchesStatus = p.rating.includes('Must Do');

      return matchesSearch && matchesCategory && matchesCompany && matchesTopicPill && matchesDifficulty && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedCompany, activeTopicPill, selectedDifficulty, selectedStatus, solvedIds]);

  // Statistics calculation
  const totalCount = SDE_SHEET_DATA.length;
  const solvedCount = solvedIds.length;
  const mustDoCount = SDE_SHEET_DATA.filter((p) => p.rating.includes('Must Do')).length;
  const progressPercent = Math.round((solvedCount / totalCount) * 100) || 0;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedCompany('ALL');
    setSelectedDifficulty('ALL');
    setSelectedStatus('ALL');
    setActiveTopicPill('ALL');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Header */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-purple-600/30 border border-purple-400/40 flex-shrink-0">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>SDETube SDE Mastery Sheet</span>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/40">
                191 Problems
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              FAANG Coding Interview Problems with In-Workspace Video Solutions & Fullscreen LeetCode IDE
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Problems */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="absolute -right-2 -bottom-2 text-slate-800/40 text-6xl font-black group-hover:text-purple-900/20 transition-colors pointer-events-none">
            <ListChecks className="w-20 h-20" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total SDE Problems</span>
          <div className="text-3xl font-black text-white mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">Top Coding Interview Curriculum</div>
        </div>

        {/* Solved Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="absolute -right-2 -bottom-2 text-emerald-950/40 text-6xl font-black pointer-events-none">
            <CheckCircle2 className="w-20 h-20 text-emerald-900/30" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Solved Status</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <div className="text-3xl font-black text-emerald-400">{solvedCount}</div>
            <span className="text-xs text-slate-400 font-mono">/ {totalCount} ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full mt-3 overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Must Do Questions */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="absolute -right-2 -bottom-2 text-amber-950/40 text-6xl font-black pointer-events-none">
            <Star className="w-20 h-20 text-amber-900/30" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Must Do Questions</span>
          <div className="text-3xl font-black text-amber-400 mt-1">{mustDoCount}</div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">5.0 ★ High Priority for Interviews</div>
        </div>

        {/* Companies Covered */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-colors">
          <div className="absolute -right-2 -bottom-2 text-blue-950/40 text-6xl font-black pointer-events-none">
            <Building2 className="w-20 h-20 text-blue-900/30" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Companies Covered</span>
          <div className="text-3xl font-black text-blue-400 mt-1">{allCompanies.length}+</div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">Google, Meta, Amazon, Microsoft & more</div>
        </div>

      </div>

      {/* Filter Controls & Topic Pills */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5 bg-slate-900/90">
        
        {/* Quick Topic Filter Pills */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            1-Click Topic Filter
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {topicPills.map((pill) => (
              <button
                key={pill.value}
                onClick={() => handlePillClick(pill.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTopicPill === pill.value
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Grid with Company Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-800">
          
          {/* Search Input */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-400 mb-1">Search Problem</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all font-sans"
              />
            </div>
          </div>

          {/* Company Filter Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Filter by Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
            >
              <option value="ALL">All Companies ({allCompanies.length})</option>
              {allCompanies.map((comp) => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Detailed Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setActiveTopicPill('ALL');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
            >
              <option value="ALL">All Categories ({allCategories.length})</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Status / Rating</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
            >
              <option value="ALL">All Problems</option>
              <option value="MUST_DO">Must Do Only (5.0 ★)</option>
              <option value="SOLVED">Solved Only</option>
              <option value="UNSOLVED">Unsolved Only</option>
            </select>
          </div>

        </div>

        {/* Filter Summary & Reset */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <div className="font-mono">
            Showing <span className="font-bold text-purple-400">{filteredProblems.length}</span> of {totalCount} problems
          </div>
          <button
            onClick={handleResetFilters}
            className="text-purple-400 hover:text-purple-300 font-bold transition-colors flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>

      </div>

      {/* Main Problems Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 shadow-2xl overflow-hidden bg-slate-900/90">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-4 px-4 w-12 text-center">Done</th>
                <th className="py-4 px-4 font-bold">Category</th>
                <th className="py-4 px-4 font-bold">Problem Title</th>
                <th className="py-4 px-4 font-bold">Difficulty</th>
                <th className="py-4 px-4 font-bold">Companies</th>
                <th className="py-4 px-4 font-bold">Importance</th>
                <th className="py-4 px-4 font-bold text-center">Interactive Workspace & Practice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProblems.map((item) => {
                const isSolved = solvedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      isSolved ? 'bg-slate-950/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSolved}
                        onChange={() => toggleSolved(item.id)}
                        className="w-4 h-4 rounded text-purple-600 bg-slate-950 border-slate-700 focus:ring-purple-500 focus:ring-offset-slate-900 cursor-pointer accent-purple-600"
                      />
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-medium text-slate-400 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                        {item.category}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className={`font-bold ${isSolved ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {item.name}
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                        item.difficulty === 'Easy'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : item.difficulty === 'Medium'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                          : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                      }`}>
                        {item.difficulty}
                      </span>
                    </td>

                    {/* Companies */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 items-center max-w-xs">
                        {item.companies.slice(0, 3).map((comp) => (
                          <span
                            key={comp}
                            className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-mono"
                          >
                            {comp}
                          </span>
                        ))}
                        {item.companies.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            +{item.companies.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Importance Rating */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`font-mono text-[11px] font-bold ${
                        item.rating.includes('Must Do')
                          ? 'text-amber-400 font-extrabold flex items-center gap-1'
                          : 'text-slate-400'
                      }`}>
                        {item.rating.includes('Must Do') && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                        {item.rating}
                      </span>
                    </td>

                    {/* Actions & Links */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        
                        {/* 1. MATCHING VIDEO IN SDETUBE CATALOG */}
                        {onSelectVideoByTopic && (
                          <button
                            onClick={() => onSelectVideoByTopic(item.name)}
                            className="inline-flex items-center space-x-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all shadow-sm group"
                            title="Play matching video lecture in SDETube"
                          >
                            <Play className="w-3 h-3 fill-current group-hover:scale-110 transition-transform" />
                            <span>Video</span>
                          </button>
                        )}

                        {/* 2. SOLVE IN FULLSCREEN LEETCODE IDE */}
                        {onOpenCodingFullscreen && (
                          <button
                            onClick={() => onOpenCodingFullscreen(item)}
                            className="inline-flex items-center space-x-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all shadow-sm group"
                            title="Solve in SDETube Fullscreen IDE / LeetCode Arena"
                          >
                            <Terminal className="w-3 h-3 text-cyan-300" />
                            <span>Solve (IDE)</span>
                          </button>
                        )}

                        {/* 3. External LeetCode */}
                        <a
                          href={item.leetcode}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold px-2 py-1 rounded-xl transition-colors"
                          title="Solve on LeetCode"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>LeetCode</span>
                        </a>

                        {/* 4. External GFG */}
                        <a
                          href={item.gfg}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2 py-1 rounded-xl transition-colors"
                          title="Solve on GeeksforGeeks"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>GFG</span>
                        </a>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredProblems.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto text-slate-500">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div className="text-slate-200 font-bold text-sm">No problems match your filter criteria</div>
            <p className="text-xs text-slate-500">Try adjusting your search query or reset the filters.</p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
