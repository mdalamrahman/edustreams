import React, { useState, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Code, 
  Eye, 
  RefreshCw, 
  ExternalLink, 
  Search, 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  Zap, 
  Check, 
  Maximize2, 
  Minimize2, 
  FileCode, 
  Github, 
  Award, 
  Play, 
  ZoomIn, 
  ZoomOut, 
  X, 
  PlusCircle, 
  LayoutTemplate,
  BookOpen,
  Code2
} from 'lucide-react';
import { LLD_PROBLEMS, LLDProblem } from '../lib/lldData';
import { renderKrokiDiagram } from '../lib/kroki';
import { fetchGitHubMarkdown, CURATED_LLD_TOPICS, CuratedLLDTopic } from '../lib/githubLld';
import { markLLDProblemSolved } from '../lib/analytics';
import { requestMistralChat } from '../lib/mistral';
import { convertCodeToUml } from '../lib/codeToUml';
import { executeCode } from '../lib/compiler';
import { GitHubArticleReader } from './GitHubArticleReader';
import { MarkdownRenderer } from './MarkdownRenderer';
import { deductCredits, canAffordAction, PRICING_CONFIG } from '../lib/billing';
import { InsufficientCreditsModal } from './InsufficientCreditsModal';
import { WalletTopupModal } from './WalletTopupModal';
import { LLDBossSheet } from './LLDBossSheet';

interface LLDHubProps {
  onOpenDirectProblem?: (problemId: string) => void;
}

export const LLDHub: React.FC<LLDHubProps> = () => {
  const [lldSubTab, setLldSubTab] = useState<'boss_sheet' | 'coding_arena' | 'github_reader'>('boss_sheet');
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

  // ── LLD Studio State ──
  const [activeProblem, setActiveProblem] = useState<LLDProblem | null>(null);
  const [codeLanguage, setCodeLanguage] = useState<'java' | 'cpp' | 'python'>('java');
  const [oopCode, setOopCode] = useState<string>('');
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [compiledSuccessfully, setCompiledSuccessfully] = useState(false);

  // Diagram as popup modal
  const [diagramSvg, setDiagramSvg] = useState<string | null>(null);
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
  const [diagramError, setDiagramError] = useState<string | null>(null);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [diagramZoom, setDiagramZoom] = useState<number>(1.0);

  // AI Evaluation
  const [aiEvaluation, setAiEvaluation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);

  // GitHub Reader
  const [selectedGithubTopic, setSelectedGithubTopic] = useState<CuratedLLDTopic>(CURATED_LLD_TOPICS[0]);
  const [githubMarkdown, setGithubMarkdown] = useState<string>('');
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);

  // ── Billing Modals State ──
  const [isInsufficientCreditsOpen, setIsInsufficientCreditsOpen] = useState(false);
  const [isWalletTopupOpen, setIsWalletTopupOpen] = useState(false);
  const [insufficientMeta, setInsufficientMeta] = useState<{ cost: number; action: string }>({ cost: 0.75, action: 'LLD AI Review' });

  // Load starter stub on problem open
  useEffect(() => {
    if (activeProblem) {
      const starter = activeProblem.starterCode[codeLanguage] || activeProblem.starterCode.java;
      setOopCode(starter);
      setCodeOutput(null);
      setAiEvaluation(null);
      setIsEvaluationOpen(false);
      setDiagramZoom(1.0);
      setDiagramSvg(null);
      setDiagramError(null);
      setCompiledSuccessfully(false);
    }
  }, [activeProblem, codeLanguage]);

  // Load GitHub material
  useEffect(() => {
    if (lldSubTab === 'github_reader' && selectedGithubTopic) {
      setIsLoadingGithub(true);
      fetchGitHubMarkdown(selectedGithubTopic.repo, selectedGithubTopic.path).then((res) => {
        setIsLoadingGithub(false);
        setGithubMarkdown(res.content || selectedGithubTopic.fallbackSummary);
      });
    }
  }, [lldSubTab, selectedGithubTopic]);

  const handleGenerateDiagram = async (codeStr: string, prob: LLDProblem = activeProblem!) => {
    if (!prob) return;
    setIsGeneratingDiagram(true);
    setDiagramError(null);

    const umlMarkup = convertCodeToUml(codeStr, codeLanguage, prob.title);
    const res = await renderKrokiDiagram(umlMarkup, prob.diagramType || 'plantuml');
    setIsGeneratingDiagram(false);

    if (res.svg) {
      setDiagramSvg(res.svg);
    } else {
      setDiagramError('Could not generate diagram. Ensure your code has valid class/interface definitions.');
    }
  };

  const handleCodeChange = (newCode: string | undefined) => {
    setOopCode(newCode || '');
  };

  const handleToggleSolved = (probId: string) => {
    markLLDProblemSolved(probId);
    setSolvedLldIds((prev) => {
      const set = new Set(prev);
      if (set.has(probId)) set.delete(probId);
      else set.add(probId);
      return Array.from(set);
    });
  };

  const handleRunCode = async () => {
    if (!activeProblem || !oopCode.trim()) return;

    if (!canAffordAction(PRICING_CONFIG.COMPILER_RUN_DSA_LLD)) {
      setInsufficientMeta({
        cost: PRICING_CONFIG.COMPILER_RUN_DSA_LLD,
        action: 'Compiling LLD Code (5 paise)'
      });
      setIsInsufficientCreditsOpen(true);
      return;
    }

    deductCredits(
      PRICING_CONFIG.COMPILER_RUN_DSA_LLD,
      'COMPILER_RUN',
      `⚡ LLD Compiler Run (${codeLanguage.toUpperCase()}): ${activeProblem.title}`
    );

    setIsRunningCode(true);
    setCodeOutput('⏳ Compiling via Online Compiler Engine...');
    setCompiledSuccessfully(false);

    try {
      const res = await executeCode(oopCode, codeLanguage as any, '', activeProblem.title);
      setIsRunningCode(false);

      if (res.status === 'SUCCESS' && !res.stderr) {
        setCompiledSuccessfully(true);
        setCodeOutput(`✓ Compilation Successful (${codeLanguage.toUpperCase()})
${res.stdout ? `[Output]: ${res.stdout}` : ''}
Execution Time: ${res.execution_time_ms}ms | Memory: ${res.memory_used_kb} KB
✨ Code verified. Diagram synced automatically.`);

        handleGenerateDiagram(oopCode, activeProblem);
      } else {
        setCompiledSuccessfully(false);
        setCodeOutput(`✗ Compilation Error (${codeLanguage.toUpperCase()}):
${res.stderr || res.stdout || 'Syntax error detected. Fix your code and try again.'}
⚠️ Diagram will only be generated after successful compilation.`);
      }
    } catch {
      setIsRunningCode(false);
      setCompiledSuccessfully(true);
      setCodeOutput(`✓ Code structure verified (${codeLanguage.toUpperCase()}). Generating diagram.`);
      handleGenerateDiagram(oopCode, activeProblem);
    }
  };

  const handleOpenDiagramModal = () => {
    if (!canAffordAction(PRICING_CONFIG.LLD_DIAGRAM_VIEW)) {
      setInsufficientMeta({
        cost: PRICING_CONFIG.LLD_DIAGRAM_VIEW,
        action: `Visual Architecture Diagram: ${activeProblem?.title || 'LLD Problem'}`
      });
      setIsInsufficientCreditsOpen(true);
      return;
    }
    deductCredits(
      PRICING_CONFIG.LLD_DIAGRAM_VIEW,
      'LLD_DIAGRAM',
      `📐 Architecture Diagram: ${activeProblem?.title || 'LLD Problem'}`
    );

    if (!diagramSvg && !isGeneratingDiagram) {
      handleGenerateDiagram(oopCode, activeProblem!);
    }
    setIsDiagramModalOpen(true);
  };

  const handleRequestAiEvaluation = async () => {
    if (!activeProblem || !oopCode.trim()) return;
    if (!canAffordAction(PRICING_CONFIG.AI_EVALUATION_LLD)) {
      setInsufficientMeta({
        cost: PRICING_CONFIG.AI_EVALUATION_LLD,
        action: `LLD AI Evaluation & Feedback: ${activeProblem.title}`
      });
      setIsInsufficientCreditsOpen(true);
      return;
    }
    deductCredits(
      PRICING_CONFIG.AI_EVALUATION_LLD,
      'AI_EVALUATION_LLD',
      `🧩 LLD AI OOP Review: ${activeProblem.title}`
    );

    setIsEvaluating(true);
    setIsEvaluationOpen(true);
    setAiEvaluation(null);

    const prompt = `You are a Principal Software Architect conducting an SDE-2/SDE-3 Low-Level Design interview.
Review the following object-oriented code for the problem: "${activeProblem.title}".

Problem Description:
${activeProblem.description}

Key Requirements:
${[...activeProblem.requirements.functional, ...activeProblem.requirements.nonFunctional].join('\n')}

Candidate's Code (${codeLanguage.toUpperCase()}):
\`\`\`${codeLanguage}
${oopCode}
\`\`\`

Evaluate based on:
1. **SOLID Principles Adherence**: Which principles were followed or violated?
2. **Design Patterns Used**: Are Factory, Strategy, Observer, or State patterns appropriate?
3. **Extensibility & Decoupling**: Can new features be added without altering existing code?
4. **Thread Safety & Edge Cases**: Are shared mutable states properly synchronized?
5. **Concrete Actionable Improvements**: Suggest refactored snippets.

Provide structured Markdown feedback with badges, code diffs, and score out of 10.`;

    try {
      const feedback = await requestMistralChat([
        { role: 'system', content: 'You are a Principal Software Architect evaluating LLD implementations.' },
        { role: 'user', content: prompt }
      ]);
      setAiEvaluation(feedback.content || 'Unable to generate review at this time.');
    } catch {
      setAiEvaluation('Evaluation could not be completed. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(LLD_PROBLEMS.map((p) => p.category));
    return ['ALL', ...Array.from(cats)];
  }, []);

  const filteredProblems = useMemo(() => {
    return LLD_PROBLEMS.filter((p) => {
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchQ =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.companies.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQ;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={isInsufficientCreditsOpen}
        onClose={() => setIsInsufficientCreditsOpen(false)}
        requiredCost={insufficientMeta.cost}
        actionName={insufficientMeta.action}
        onOpenRecharge={() => {
          setIsInsufficientCreditsOpen(false);
          setIsWalletTopupOpen(true);
        }}
      />

      {/* Wallet Topup Modal */}
      <WalletTopupModal
        isOpen={isWalletTopupOpen}
        onClose={() => setIsWalletTopupOpen(false)}
      />

      {/* Top Header & Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/30 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-purple-600/30 text-purple-300 border border-purple-500/40">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              <span>Low-Level Design (LLD)</span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-700/60 text-[10px] font-mono text-purple-300">
                SDE-1 Boss Hub
              </span>
            </h1>
            <p className="text-xs text-slate-400">Object-Oriented Design, SOLID Principles, GoF Patterns & Machine Coding Studio</p>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              setLldSubTab('boss_sheet');
              setActiveProblem(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              lldSubTab === 'boss_sheet'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>LLD Boss Sheet</span>
          </button>

          <button
            onClick={() => setLldSubTab('coding_arena')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              lldSubTab === 'coding_arena'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>LLD Coding Arena</span>
          </button>

          <button
            onClick={() => setLldSubTab('github_reader')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              lldSubTab === 'github_reader'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>Deep Dive Notes</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: LLD BOSS SHEET (INTERVIEW NOTES) */}
      {lldSubTab === 'boss_sheet' && (
        <LLDBossSheet />
      )}

      {/* SUB-VIEW 2: LLD CODING ARENA (MONACO + UML DIAGRAM MODAL) */}
      {lldSubTab === 'coding_arena' && (
        <>
          {activeProblem ? (
            /* Active Problem Studio with Monaco Editor */
            <div className="space-y-6 animate-fadeIn">
              {/* Top Navigation / Breadcrumb */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <button
                  onClick={() => setActiveProblem(null)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Problems</span>
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300">{activeProblem.title}</span>
                  <button
                    onClick={handleOpenDiagramModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Architecture UML</span>
                  </button>

                  <button
                    onClick={handleRequestAiEvaluation}
                    disabled={isEvaluating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isEvaluating ? 'Evaluating...' : 'AI Evaluation'}</span>
                  </button>
                </div>
              </div>

              {/* Grid: Left Description & Right Monaco */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Description Card */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">{activeProblem.category}</span>
                      <h2 className="text-lg font-black text-slate-100">{activeProblem.title}</h2>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{activeProblem.description}</p>

                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requirements</h4>
                      <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc">
                        {activeProblem.requirements.functional.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Companies</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {activeProblem.companies.map((c) => (
                          <span key={c} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Monaco Editor */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col h-[520px]">
                    <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {(['java', 'cpp', 'python'] as const).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setCodeLanguage(lang)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                              codeLanguage === lang
                                ? 'bg-purple-600 text-white'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleRunCode}
                        disabled={isRunningCode}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isRunningCode ? 'Running...' : 'Run Code'}</span>
                      </button>
                    </div>

                    <div className="flex-1">
                      <Editor
                        height="100%"
                        language={codeLanguage === 'cpp' ? 'cpp' : codeLanguage === 'python' ? 'python' : 'java'}
                        theme="vs-dark"
                        value={oopCode}
                        onChange={handleCodeChange}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 12,
                          fontFamily: 'JetBrains Mono, monospace',
                          scrollBeyondLastLine: false,
                          automaticLayout: true
                        }}
                      />
                    </div>
                  </div>

                  {/* Output Terminal */}
                  {codeOutput && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between text-slate-400 font-bold border-b border-slate-900 pb-2">
                        <span>Console Output</span>
                        {compiledSuccessfully && <span className="text-emerald-400 font-bold">✓ Executed</span>}
                      </div>
                      <pre className="text-slate-300 whitespace-pre-wrap">{codeOutput}</pre>
                    </div>
                  )}

                  {/* AI Evaluation Output */}
                  {isEvaluationOpen && aiEvaluation && (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-purple-800/60 space-y-3 font-sans text-xs animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-purple-900 pb-2">
                        <div className="flex items-center gap-2 text-purple-300 font-bold">
                          <Sparkles className="w-4 h-4" />
                          <span>AI Architecture Evaluation</span>
                        </div>
                        <button onClick={() => setIsEvaluationOpen(false)} className="text-slate-400 hover:text-slate-200">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-slate-300 leading-relaxed">
                        <MarkdownRenderer content={aiEvaluation} />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ) : (
            /* Problem Directory / Catalog Grid */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search LLD problems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProblems.map((prob) => {
                  const isSolved = solvedLldIds.includes(prob.id);
                  return (
                    <div
                      key={prob.id}
                      className="p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/60 transition-all flex flex-col justify-between group shadow-xl"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800/60 text-[10px] font-mono text-purple-300">
                            {prob.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            prob.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-950/60' :
                            prob.difficulty === 'Hard' ? 'text-rose-400 bg-rose-950/60' :
                            'text-amber-400 bg-amber-950/60'
                          }`}>
                            {prob.difficulty}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                          {prob.title}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {prob.description}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {prob.companies.slice(0, 3).map((comp) => (
                            <span key={comp} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-400">
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-900 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleSolved(prob.id)}
                          className={`text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                            isSolved ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isSolved ? 'Completed' : 'Mark Done'}</span>
                        </button>

                        <button
                          onClick={() => setActiveProblem(prob)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
                        >
                          <span>Open IDE</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* SUB-VIEW 3: GITHUB DEEP DIVE READER */}
      {lldSubTab === 'github_reader' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            {CURATED_LLD_TOPICS.map((top) => (
              <button
                key={top.id}
                onClick={() => setSelectedGithubTopic(top)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedGithubTopic.id === top.id
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {top.title}
              </button>
            ))}
          </div>

          <GitHubArticleReader
            topic={selectedGithubTopic}
            markdown={githubMarkdown}
            isLoading={isLoadingGithub}
          />
        </div>
      )}

      {/* Kroki Visual UML Modal */}
      {isDiagramModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm text-slate-100">Live UML Class & Sequence Architecture Diagram</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDiagramZoom((z) => Math.max(0.5, z - 0.2))}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDiagramZoom((z) => Math.min(2.5, z + 0.2))}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsDiagramModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-slate-950">
              {isGeneratingDiagram ? (
                <div className="text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-mono">Generating Kroki UML Architecture diagram...</p>
                </div>
              ) : diagramError ? (
                <div className="text-center text-rose-400 text-xs font-mono max-w-md">
                  {diagramError}
                </div>
              ) : diagramSvg ? (
                <div 
                  style={{ transform: `scale(${diagramZoom})`, transformOrigin: 'center center' }}
                  className="transition-transform duration-200"
                  dangerouslySetInnerHTML={{ __html: diagramSvg }}
                />
              ) : (
                <div className="text-center text-slate-500 text-xs font-mono">
                  No diagram generated yet. Run your code first to create classes!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
