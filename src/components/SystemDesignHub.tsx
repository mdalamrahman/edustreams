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
  FileCode,
  Github,
  Award
} from 'lucide-react';
import { LLD_PROBLEMS, LLDProblem } from '../lib/lldData';
import { renderKrokiDiagram, DiagramType, LLD_DIAGRAM_TEMPLATES } from '../lib/kroki';
import { fetchGitHubMarkdown, CURATED_LLD_TOPICS, CuratedLLDTopic } from '../lib/githubLld';
import { markLLDProblemSolved } from '../lib/analytics';
import { requestMistralChat } from '../lib/mistral';

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

  // Active Selected Problem for the Studio Workspace
  const [activeProblem, setActiveProblem] = useState<LLDProblem | null>(null);
  const [activeStudioTab, setActiveStudioTab] = useState<'diagram' | 'code' | 'evaluation'>('diagram');

  // Kroki Diagram State
  const [diagramCode, setDiagramCode] = useState<string>('');
  const [diagramType, setDiagramType] = useState<DiagramType>('plantuml');
  const [renderedSvg, setRenderedSvg] = useState<string | null>(null);
  const [isRenderingDiagram, setIsRenderingDiagram] = useState(false);
  const [diagramError, setDiagramError] = useState<string | null>(null);

  // OOP Code State
  const [codeLanguage, setCodeLanguage] = useState<'java' | 'cpp' | 'python'>('java');
  const [oopCode, setOopCode] = useState<string>('');

  // AI Evaluation State
  const [aiEvaluation, setAiEvaluation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // GitHub Interactive Reading Material State
  const [selectedGithubTopic, setSelectedGithubTopic] = useState<CuratedLLDTopic>(CURATED_LLD_TOPICS[0]);
  const [githubMarkdown, setGithubMarkdown] = useState<string>('');
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);

  // Load problem details when active problem changes
  useEffect(() => {
    if (activeProblem) {
      setDiagramCode(activeProblem.starterDiagram);
      setDiagramType(activeProblem.diagramType);
      setOopCode(activeProblem.starterCode[codeLanguage]);
      setAiEvaluation(null);
      handleRenderKroki(activeProblem.starterDiagram, activeProblem.diagramType);
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

  const handleRenderKroki = async (source: string, type: DiagramType = diagramType) => {
    setIsRenderingDiagram(true);
    setDiagramError(null);
    const res = await renderKrokiDiagram(source, type);
    setIsRenderingDiagram(false);
    if (res.svg) {
      setRenderedSvg(res.svg);
    } else {
      setDiagramError(res.error);
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

  const handleAIEvaluate = async () => {
    if (!activeProblem) return;
    setIsEvaluating(true);
    setAiEvaluation(null);

    const prompt = `You are a Principal Software Architect conducting a senior Low-Level Design & System Design interview.
Evaluate the candidate's solution for "${activeProblem.title}".

Candidate's UML / Architecture Diagram (${diagramType}):
\`\`\`
${diagramCode}
\`\`\`

Candidate's OOP Code Implementation (${codeLanguage}):
\`\`\`${codeLanguage}
${oopCode}
\`\`\`

Please provide a detailed architectural critique with:
1. Overall Architectural Score (0-100) and Seniority Level (Junior, Mid, Senior, Staff)
2. SOLID Principles Compliance Analysis
3. Design Pattern Correctness & Extensibility Review
4. Concurrency, Thread-Safety & Edge Case Handling
5. Concrete Refactoring Recommendations & Optimization Tips.`;

    try {
      const response = await requestMistralChat([
        { role: 'system', content: 'You are an expert System Design and LLD interviewer evaluating candidates with rigorous architectural standards.' },
        { role: 'user', content: prompt }
      ]);
      setAiEvaluation(response.content);
    } catch (e: any) {
      setAiEvaluation('Failed to complete AI architectural evaluation. Please verify your connection.');
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
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/50 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-700/60 text-purple-300 font-mono text-[11px] font-bold w-fit mb-3">
              <Cpu className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>KROKI API &bull; MISTRAL AI ARCHITECTURE STUDIO</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              System Design & LLD Practice Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Design real-world scalable architectures, draw live visual UML class & sequence diagrams via Kroki API, write production OOP code, and get evaluated by Mistral AI.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-xs font-bold text-purple-400">Architectures Solved</div>
              <div className="text-xl font-black text-slate-100 font-mono mt-0.5">
                {solvedLldIds.length} <span className="text-xs text-slate-500">/ {LLD_PROBLEMS.length}</span>
              </div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-xs font-bold text-emerald-400">Kroki Engine</div>
              <div className="text-xs font-mono text-emerald-300 font-bold mt-1.5 flex items-center gap-1 justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live UML SVG</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-4 flex-wrap">
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => { setActiveView('problems'); }}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'problems'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Design Questions Arena ({LLD_PROBLEMS.length})</span>
          </button>
          <button
            onClick={() => { setActiveView('reader'); }}
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
              placeholder="Search LLD by company, pattern, topic..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: DESIGN QUESTIONS ARENA                                            */}
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
                  {/* Category & Difficulty Badge */}
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

                  {/* Design Patterns Pill Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {prob.designPatternsUsed.map((pat, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        {pat}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Company Tags */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{prob.companies.join(', ')}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => setActiveProblem(prob)}
                      className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open Design Studio</span>
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
          
          {/* Topic Selector Sidebar */}
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

          {/* Reading Material Content Pane */}
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
      {/* MODAL: INTERACTIVE KROKI DIAGRAM & OOP DESIGN STUDIO                      */}
      {/* ========================================================================= */}
      {activeProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-6xl h-[92vh] glass-panel rounded-3xl border border-purple-500/40 bg-slate-900/95 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Studio Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-600/30 text-purple-300 border border-purple-500/30">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>{activeProblem.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 border border-purple-700 text-purple-300">
                      {activeProblem.difficulty}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Interactive Kroki Visual UML Studio & AI Architecture Evaluator</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleSolved(activeProblem.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    solvedLldIds.includes(activeProblem.id)
                      ? 'bg-emerald-950 border-emerald-700 text-emerald-400'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{solvedLldIds.includes(activeProblem.id) ? 'Solved' : 'Mark as Solved'}</span>
                </button>

                <button
                  onClick={() => setActiveProblem(null)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Studio Body Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              
              {/* Left Pane: Requirements (4 Columns) */}
              <div className="lg:col-span-4 border-r border-slate-800 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
                <div>
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1.5">Problem Statement</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeProblem.description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Functional Requirements</h4>
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
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Non-Functional & Concurrency</h4>
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
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">Key Design Patterns</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProblem.designPatternsUsed.map((p, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800 text-[10px] text-emerald-300 font-mono">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Pane: 3 Studio Tabs (8 Columns) */}
              <div className="lg:col-span-8 flex flex-col overflow-hidden bg-slate-900/60">
                
                {/* Tab Selector */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-950/60">
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                    <button
                      onClick={() => setActiveStudioTab('diagram')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeStudioTab === 'diagram'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Kroki UML Diagram</span>
                    </button>
                    <button
                      onClick={() => setActiveStudioTab('code')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeStudioTab === 'code'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>OOP Code Implementation</span>
                    </button>
                    <button
                      onClick={() => setActiveStudioTab('evaluation')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeStudioTab === 'evaluation'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>AI Architectural Review</span>
                    </button>
                  </div>

                  {activeStudioTab === 'diagram' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRenderKroki(diagramCode)}
                        disabled={isRenderingDiagram}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <RefreshCw className={`w-3 h-3 ${isRenderingDiagram ? 'animate-spin' : ''}`} />
                        <span>Render Kroki SVG</span>
                      </button>
                    </div>
                  )}

                  {activeStudioTab === 'code' && (
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {(['java', 'cpp', 'python'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setCodeLanguage(lang);
                            setOopCode(activeProblem.starterCode[lang]);
                          }}
                          className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-mono cursor-pointer ${
                            codeLanguage === lang 
                              ? 'bg-indigo-600 text-white font-bold' 
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tab Content 1: Kroki UML Studio */}
                {activeStudioTab === 'diagram' && (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                    {/* Diagram Code Editor */}
                    <div className="border-r border-slate-800 flex flex-col">
                      <div className="px-3 py-1.5 bg-slate-950 text-[11px] font-mono text-slate-400 border-b border-slate-800 flex justify-between items-center">
                        <span>PlantUML / Mermaid Editor</span>
                        <span className="text-purple-400">Live Kroki POST</span>
                      </div>
                      <textarea
                        value={diagramCode}
                        onChange={(e) => setDiagramCode(e.target.value)}
                        className="flex-1 w-full p-4 bg-slate-950 text-slate-100 font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50 leading-relaxed custom-scrollbar"
                        placeholder="Enter PlantUML / Mermaid diagram markup here..."
                        spellCheck={false}
                      />
                    </div>

                    {/* Rendered SVG Preview */}
                    <div className="flex flex-col bg-slate-950/80 overflow-hidden">
                      <div className="px-3 py-1.5 bg-slate-950 text-[11px] font-mono text-slate-400 border-b border-slate-800 flex justify-between items-center">
                        <span>Visual SVG Diagram Output</span>
                        {renderedSvg && (
                          <button
                            onClick={() => {
                              const blob = new Blob([renderedSvg], { type: 'image/svg+xml' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${activeProblem.id}-diagram.svg`;
                              a.click();
                            }}
                            className="text-indigo-400 hover:text-indigo-300 text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Export SVG</span>
                          </button>
                        )}
                      </div>

                      <div className="flex-1 p-4 overflow-auto flex items-center justify-center custom-scrollbar">
                        {isRenderingDiagram ? (
                          <div className="text-center font-mono text-xs text-slate-400 animate-pulse">
                            Rendering visual architecture via Kroki Engine...
                          </div>
                        ) : diagramError ? (
                          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 font-mono">
                            {diagramError}
                          </div>
                        ) : renderedSvg ? (
                          <div 
                            dangerouslySetInnerHTML={{ __html: renderedSvg }} 
                            className="max-w-full max-h-full overflow-auto text-slate-100 filter drop-shadow-md"
                          />
                        ) : (
                          <div className="text-center font-mono text-xs text-slate-500">
                            Click "Render Kroki SVG" to generate visual class diagrams.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 2: OOP Code Implementation */}
                {activeStudioTab === 'code' && (
                  <div className="flex-1 flex flex-col">
                    <textarea
                      value={oopCode}
                      onChange={(e) => setOopCode(e.target.value)}
                      className="flex-1 w-full p-4 bg-slate-950 text-slate-100 font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50 leading-relaxed custom-scrollbar"
                      placeholder={`Write ${codeLanguage.toUpperCase()} OOP solution applying SOLID and design patterns...`}
                      spellCheck={false}
                    />
                  </div>
                )}

                {/* Tab Content 3: AI Architectural Evaluation */}
                {activeStudioTab === 'evaluation' && (
                  <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                          <span>Mistral AI Architectural Reviewer</span>
                        </h4>
                        <p className="text-xs text-slate-400">Evaluates SOLID principles, pattern correctness, scalability, and code structure</p>
                      </div>

                      <button
                        onClick={handleAIEvaluate}
                        disabled={isEvaluating}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
                        <span>{isEvaluating ? 'Evaluating Design...' : 'Run Architectural Evaluation'}</span>
                      </button>
                    </div>

                    {isEvaluating ? (
                      <div className="py-16 text-center text-slate-400 font-mono text-xs animate-pulse">
                        Analyzing Kroki Diagram & OOP Code against Enterprise SOLID standards...
                      </div>
                    ) : aiEvaluation ? (
                      <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-900/50 text-xs sm:text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                        {aiEvaluation}
                      </div>
                    ) : (
                      <div className="text-center py-16 text-slate-500 font-mono text-xs">
                        Click "Run Architectural Evaluation" to get senior staff-level design feedback on your diagram and code.
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
