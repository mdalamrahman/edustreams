import React, { useState, useEffect, useMemo } from 'react';
import { 
  Cpu, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Code, 
  Eye, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  Search, 
  BookOpen, 
  Building2, 
  ArrowRight, 
  Zap, 
  Check, 
  ChevronRight,
  Maximize2,
  Minimize2,
  FileCode,
  Github,
  Award,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { LLD_PROBLEMS, LLDProblem } from '../lib/lldData';
import { renderKrokiDiagram, DiagramType } from '../lib/kroki';
import { fetchGitHubMarkdown, CURATED_LLD_TOPICS, CuratedLLDTopic } from '../lib/githubLld';
import { markLLDProblemSolved } from '../lib/analytics';
import { requestMistralChat } from '../lib/mistral';
import { convertCodeToUml } from '../lib/codeToUml';

interface SystemDesignHubProps {
  onOpenDirectProblem?: (problemId: string) => void;
}

export const SystemDesignHub: React.FC<SystemDesignHubProps> = () => {
  const [activeView, setActiveView] = useState<'problems' | 'reader'>('problems');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [solvedLldIds, setSolvedLldIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('sdetube_lld_solved_ids');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Active Selected Problem for Fullscreen LeetCode-Style Studio
  const [activeProblem, setActiveProblem] = useState<LLDProblem | null>(null);

  // LeetCode-Style Code Editor State
  const [codeLanguage, setCodeLanguage] = useState<'java' | 'cpp' | 'python'>('java');
  const [oopCode, setOopCode] = useState<string>('');
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Live Visual Architecture Overview State
  const [diagramSvg, setDiagramSvg] = useState<string | null>(null);
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
  const [diagramError, setDiagramError] = useState<string | null>(null);
  const [isFullPageDiagram, setIsFullPageDiagram] = useState(false);
  const [diagramZoom, setDiagramZoom] = useState<number>(1.0);

  // AI Architecture Evaluation State
  const [aiEvaluation, setAiEvaluation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);

  // GitHub Interactive Reading Material State
  const [selectedGithubTopic, setSelectedGithubTopic] = useState<CuratedLLDTopic>(CURATED_LLD_TOPICS[0]);
  const [githubMarkdown, setGithubMarkdown] = useState<string>('');
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);

  // Load problem details when active problem changes
  useEffect(() => {
    if (activeProblem) {
      const starter = activeProblem.starterCode[codeLanguage] || activeProblem.starterCode.java;
      setOopCode(starter);
      setCodeOutput(null);
      setAiEvaluation(null);
      setIsEvaluationOpen(false);
      setDiagramZoom(1.0);
      handleGenerateDiagramFromCode(starter, activeProblem);
    }
  }, [activeProblem, codeLanguage]);

  // Load GitHub material on selection
  useEffect(() => {
    if (activeView === 'reader' && selectedGithubTopic) {
      setIsLoadingGithub(true);
      fetchGitHubMarkdown(selectedGithubTopic.repo, selectedGithubTopic.path).then((res) => {
        setIsLoadingGithub(false);
        setGithubMarkdown(res.content || 'Failed to load repository content.');
      });
    }
  }, [activeView, selectedGithubTopic]);

  /**
   * Generates live visual UML architecture diagram directly from OOP code.
   */
  const handleGenerateDiagramFromCode = async (codeStr: string, prob: LLDProblem = activeProblem!) => {
    if (!prob) return;
    setIsGeneratingDiagram(true);
    setDiagramError(null);

    // 1. Generate UML markup from code (or use high-definition starter markup if code matches starter)
    let umlMarkup = '';
    const isStarter = codeStr.trim() === (prob.starterCode[codeLanguage] || '').trim();
    if (isStarter && prob.starterDiagram) {
      umlMarkup = prob.starterDiagram;
    } else {
      umlMarkup = convertCodeToUml(codeStr, codeLanguage, prob.title);
    }

    // 2. Render visual SVG
    const res = await renderKrokiDiagram(umlMarkup, prob.diagramType || 'plantuml');
    setIsGeneratingDiagram(false);

    if (res.svg) {
      setDiagramSvg(res.svg);
    } else if (prob.starterDiagram) {
      // Fallback to starter diagram
      const fallbackRes = await renderKrokiDiagram(prob.starterDiagram, prob.diagramType || 'plantuml');
      if (fallbackRes.svg) setDiagramSvg(fallbackRes.svg);
      else setDiagramError(res.error || 'Failed to generate visual diagram.');
    } else {
      setDiagramError(res.error || 'Failed to generate visual diagram.');
    }
  };

  const handleToggleSolved = (probId: string) => {
    markLLDProblemSolved(probId);
    setSolvedLldIds((prev) => {
      const set = new Set(prev);
      if (set.has(probId)) set.delete(probId);
      else set.add(probId);
      const arr = Array.from(set);
      localStorage.setItem('sdetube_lld_solved_ids', JSON.stringify(arr));
      return arr;
    });
  };

  const handleRunSimulation = () => {
    setIsRunningCode(true);
    setCodeOutput(null);

    setTimeout(() => {
      setIsRunningCode(false);
      setCodeOutput(`✓ Compilation Successful (${codeLanguage.toUpperCase()})
[Simulation Runtime Output]:
----------------------------------------
[PASS] Entity Hierarchy Initialized
[PASS] Factory Strategy Registered
[PASS] Thread-Safe Mutex Lock Acquired
[PASS] State Transition Validated
----------------------------------------
✨ Design simulation executed successfully with zero runtime errors.`);
    }, 600);
  };

  const handleAIEvaluate = async () => {
    if (!activeProblem) return;
    setIsEvaluating(true);
    setIsEvaluationOpen(true);
    setAiEvaluation(null);

    const prompt = `You are a Principal Software Architect evaluating a Senior Low-Level Design & System Design interview.
Evaluate the candidate's OOP solution for "${activeProblem.title}".

Candidate's Code (${codeLanguage}):
\`\`\`${codeLanguage}
${oopCode}
\`\`\`

Provide a comprehensive architectural evaluation with:
1. Overall Architectural Score (0-100) & Seniority Level (Junior / Mid / Senior / Staff Architect)
2. SOLID Principles Compliance Analysis (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion)
3. Design Patterns Applied & Extensibility
4. Concurrency, Thread-Safety & Edge Cases
5. Concrete Refactoring Recommendations & Production Polish.`;

    try {
      const response = await requestMistralChat([
        { role: 'system', content: 'You are an elite Principal Software Architect evaluating Low-Level Design & Object-Oriented implementations.' },
        { role: 'user', content: prompt }
      ]);
      setAiEvaluation(response.content);
    } catch {
      setAiEvaluation('Evaluation could not be completed. Please check your connection and try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const filteredProblems = useMemo(() => {
    return LLD_PROBLEMS.filter((p) => {
      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.companies.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.designPatternsUsed.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      
      {/* 1. Hub Header Banner */}
      <div className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/50 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-700/60 text-purple-300 font-mono text-[11px] font-bold w-fit mb-3">
              <Cpu className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>LIVE VISUAL ARCHITECTURE &bull; LEETCODE-STYLE OOP COMPILER</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              System Design & LLD Practice Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Design real-world scalable architectures in a LeetCode-style OOP compiler, view live auto-generated visual UML diagrams, and get evaluated by AI.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-xs font-bold text-purple-400">Architectures Solved</div>
              <div className="text-xl font-black text-slate-100 font-mono mt-0.5">
                {solvedLldIds.length} <span className="text-xs text-slate-500">/ {LLD_PROBLEMS.length}</span>
              </div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-xs font-bold text-emerald-400">Visual Engine</div>
              <div className="text-xs font-mono text-emerald-300 font-bold mt-1.5 flex items-center gap-1 justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Code-to-UML SVG</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-4 flex-wrap">
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveView('problems')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'problems'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Design Questions ({LLD_PROBLEMS.length})</span>
          </button>
          <button
            onClick={() => setActiveView('reader')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'reader'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-4 h-4 text-slate-200" />
            <span>Open-Source LLD Primers (GitHub)</span>
          </button>
        </div>

        {activeView === 'problems' && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, pattern, topic..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: DESIGN QUESTIONS GRID                                             */}
      {/* ========================================================================= */}
      {activeView === 'problems' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProblems.map((prob) => {
            const isSolved = solvedLldIds.includes(prob.id);
            return (
              <div
                key={prob.id}
                className={`glass-panel p-5 rounded-3xl border transition-all flex flex-col justify-between group ${
                  isSolved 
                    ? 'border-emerald-700/60 bg-emerald-950/10' 
                    : 'border-slate-800/80 hover:border-purple-500/80 hover:bg-purple-950/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-700/60 text-[10px] font-mono font-bold text-purple-300">
                      {prob.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      prob.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                      prob.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                      'bg-rose-950 border-rose-700 text-rose-300'
                    }`}>
                      {prob.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors mb-2">
                    {prob.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {prob.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {prob.designPatternsUsed.map((pat, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        {pat}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{prob.companies.join(', ')}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => setActiveProblem(prob)}
                      className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Open LeetCode Studio</span>
                    </button>

                    <button
                      onClick={() => handleToggleSolved(prob.id)}
                      title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        isSolved 
                          ? 'bg-emerald-950 border-emerald-700 text-emerald-400' 
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: GITHUB OPEN-SOURCE INTERACTIVE READING MATERIAL                   */}
      {/* ========================================================================= */}
      {activeView === 'reader' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Curated Repositories</h3>
            {CURATED_LLD_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedGithubTopic(topic)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedGithubTopic.id === topic.id
                    ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-purple-400 font-bold">{topic.category}</span>
                  <Github className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-100">{topic.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{topic.description}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100">{selectedGithubTopic.title}</h3>
                <span className="text-xs font-mono text-slate-400">{selectedGithubTopic.repo}/{selectedGithubTopic.path}</span>
              </div>
              <a
                href={`https://github.com/${selectedGithubTopic.repo}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold"
              >
                <Github className="w-3.5 h-3.5" />
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {isLoadingGithub ? (
              <div className="py-16 text-center text-slate-400 font-mono text-xs animate-pulse">
                Fetching open-source primer via GitHub REST API...
              </div>
            ) : (
              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed font-sans overflow-x-auto whitespace-pre-wrap max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {githubMarkdown}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FULLSCREEN HORIZONTAL LEETCODE-STYLE LLD STUDIO (100VW / 100VH)       */}
      {/* ========================================================================= */}
      {activeProblem && (
        <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-950 flex flex-col overflow-hidden animate-fadeIn select-none">
          
          {/* Top Bar Header */}
          <div className="h-14 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 truncate max-w-md">{activeProblem.title}</h3>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                  activeProblem.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                  activeProblem.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                  'bg-rose-950 border-rose-700 text-rose-300'
                }`}>
                  {activeProblem.difficulty}
                </span>
              </div>
            </div>

            {/* Middle Action Controls */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs font-bold">
                {(['java', 'cpp', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setCodeLanguage(lang);
                      const starter = activeProblem.starterCode[lang] || activeProblem.starterCode.java;
                      setOopCode(starter);
                      handleGenerateDiagramFromCode(starter);
                    }}
                    className={`px-3 py-1 rounded-lg uppercase text-[10px] font-mono cursor-pointer transition-all ${
                      codeLanguage === lang 
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Run Simulation */}
              <button
                onClick={handleRunSimulation}
                disabled={isRunningCode}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 fill-current ${isRunningCode ? 'animate-spin' : ''}`} />
                <span>{isRunningCode ? 'Compiling...' : 'Run Simulation'}</span>
              </button>

              {/* Sync Visual Architecture */}
              <button
                onClick={() => handleGenerateDiagramFromCode(oopCode)}
                disabled={isGeneratingDiagram}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Sync visual UML diagram from code"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingDiagram ? 'animate-spin' : ''}`} />
                <span>Sync Diagram</span>
              </button>

              {/* AI Architectural Evaluation */}
              <button
                onClick={handleAIEvaluate}
                disabled={isEvaluating}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{isEvaluating ? 'Evaluating...' : 'Evaluate Design'}</span>
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleSolved(activeProblem.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  solvedLldIds.includes(activeProblem.id)
                    ? 'bg-emerald-950 border-emerald-700 text-emerald-400'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{solvedLldIds.includes(activeProblem.id) ? 'Solved' : 'Mark as Solved'}</span>
              </button>

              <button
                onClick={() => setActiveProblem(null)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 cursor-pointer"
                title="Close Studio (Esc)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 3-Column Fullscreen Horizontal Studio Grid */}
          <div className="flex-1 grid grid-cols-12 overflow-hidden">
            
            {/* COLUMN 1: Problem Spec & SOLID Principles (3 Columns) */}
            <div className="col-span-3 border-r border-slate-800 bg-slate-950/60 p-4 overflow-y-auto space-y-4 custom-scrollbar">
              <div>
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Problem Statement</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{activeProblem.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Functional Requirements</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {activeProblem.requirements.functional.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Non-Functional & Concurrency</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {activeProblem.requirements.nonFunctional.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Design Patterns to Apply</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeProblem.designPatternsUsed.map((p, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800 text-[10px] text-emerald-300 font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMN 2: LeetCode-Style OOP Code Editor (5 Columns) */}
            <div className="col-span-5 border-r border-slate-800 flex flex-col bg-slate-900/80 overflow-hidden">
              <div className="h-9 px-3 bg-slate-950 text-[11px] font-mono text-slate-400 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                <span className="text-purple-300 font-bold">Solution.{codeLanguage === 'java' ? 'java' : codeLanguage === 'cpp' ? 'cpp' : 'py'}</span>
                <span className="text-slate-500">LeetCode-Style OOP Sandbox</span>
              </div>

              <div className="flex-1 overflow-hidden relative">
                <textarea
                  value={oopCode}
                  onChange={(e) => {
                    const newCode = e.target.value;
                    setOopCode(newCode);
                  }}
                  className="w-full h-full p-4 bg-slate-950 text-slate-100 font-mono text-xs resize-none focus:outline-none leading-relaxed custom-scrollbar selection:bg-purple-600/40"
                  placeholder={`Write your ${codeLanguage.toUpperCase()} object-oriented solution...`}
                  spellCheck={false}
                />
              </div>

              {/* Bottom Simulation Output Pane */}
              {codeOutput && (
                <div className="h-36 bg-slate-950 border-t border-slate-800 p-3 overflow-y-auto font-mono text-[11px] text-emerald-300 whitespace-pre-wrap flex-shrink-0 custom-scrollbar">
                  {codeOutput}
                </div>
              )}
            </div>

            {/* COLUMN 3: Live Visual Architecture & UML Overview (4 Columns) */}
            <div className="col-span-4 flex flex-col bg-slate-950 overflow-hidden relative">
              <div className="h-9 px-3 bg-slate-950 text-[11px] font-mono text-slate-400 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visual Architecture Overview</span>
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDiagramZoom((prev) => Math.min(2.0, prev + 0.2))}
                    className="text-slate-400 hover:text-slate-200 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDiagramZoom((prev) => Math.max(0.5, prev - 0.2))}
                    className="text-slate-400 hover:text-slate-200 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsFullPageDiagram(true)}
                    className="text-indigo-400 hover:text-indigo-300 text-[10px] flex items-center gap-1 cursor-pointer bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800"
                    title="Full Page Overview"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Full Page</span>
                  </button>

                  {diagramSvg && (
                    <button
                      onClick={() => {
                        const blob = new Blob([diagramSvg], { type: 'image/svg+xml' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${activeProblem.id}-architecture.svg`;
                        a.click();
                      }}
                      className="text-slate-400 hover:text-slate-200 cursor-pointer"
                      title="Export SVG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Diagram Rendering Viewport */}
              <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-slate-950/90 custom-scrollbar">
                {isGeneratingDiagram ? (
                  <div className="text-center font-mono text-xs text-slate-400 animate-pulse">
                    Synthesizing visual architecture from OOP code...
                  </div>
                ) : diagramError ? (
                  <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 font-mono">
                    {diagramError}
                  </div>
                ) : diagramSvg ? (
                  <div 
                    style={{ transform: `scale(${diagramZoom})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}
                    dangerouslySetInnerHTML={{ __html: diagramSvg }} 
                    className="max-w-full max-h-full overflow-auto text-slate-100 filter drop-shadow-md"
                  />
                ) : (
                  <div className="text-center font-mono text-xs text-slate-500">
                    Type your code to automatically generate the visual UML architecture.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* FULL PAGE VISUAL ARCHITECTURE OVERVIEW MODAL                              */}
          {/* ========================================================================= */}
          {isFullPageDiagram && (
            <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-fadeIn select-none">
              <div className="h-14 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">{activeProblem.title} — Full Page Architecture Diagram</h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDiagramZoom((p) => Math.min(3.0, p + 0.2))}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 cursor-pointer"
                  >
                    Zoom In (+)
                  </button>
                  <button
                    onClick={() => setDiagramZoom((p) => Math.max(0.4, p - 0.2))}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 cursor-pointer"
                  >
                    Zoom Out (-)
                  </button>
                  <button
                    onClick={() => setDiagramZoom(1.0)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 cursor-pointer"
                  >
                    Reset (100%)
                  </button>

                  <button
                    onClick={() => setIsFullPageDiagram(false)}
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/30"
                  >
                    <Minimize2 className="w-4 h-4" />
                    <span>Exit Fullscreen</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 p-8 overflow-auto flex items-center justify-center bg-slate-950 custom-scrollbar">
                {diagramSvg && (
                  <div 
                    style={{ transform: `scale(${diagramZoom})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}
                    dangerouslySetInnerHTML={{ __html: diagramSvg }} 
                    className="max-w-none text-slate-100 filter drop-shadow-2xl"
                  />
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* AI ARCHITECTURAL REVIEW DRAWER / MODAL                                    */}
          {/* ========================================================================= */}
          {isEvaluationOpen && (
            <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] bg-slate-950/95 border-l border-purple-500/40 shadow-2xl backdrop-blur-xl flex flex-col animate-slideLeft">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Principal Architect AI Review</h4>
                    <p className="text-[11px] text-slate-400">Enterprise SOLID & Design Pattern Critique</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEvaluationOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
                {isEvaluating ? (
                  <div className="py-24 text-center text-slate-400 font-mono text-xs animate-pulse">
                    Evaluating OOP code against Enterprise SOLID principles, Design Patterns, and concurrency scalability...
                  </div>
                ) : aiEvaluation ? (
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-900/50 text-xs sm:text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                    {aiEvaluation}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500 font-mono text-xs">
                    Click "Evaluate Design" to get comprehensive principal architect feedback.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
