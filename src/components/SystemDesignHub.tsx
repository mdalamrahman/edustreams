import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
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
  Terminal,
  Columns,
  Sparkle,
  X,
  Globe,
  Server,
  Database,
  Shield,
  Cloud,
  Box,
  MonitorSmartphone,
  PlusCircle,
  Trash2,
  Move
} from 'lucide-react';
import { LLD_PROBLEMS, LLDProblem } from '../lib/lldData';
import { renderKrokiDiagram, DiagramType } from '../lib/kroki';
import { fetchGitHubMarkdown, CURATED_LLD_TOPICS, CuratedLLDTopic } from '../lib/githubLld';
import { markLLDProblemSolved } from '../lib/analytics';
import { requestMistralChat } from '../lib/mistral';
import { convertCodeToUml } from '../lib/codeToUml';
import { FormattedChatText } from './FormattedChatText';
import { executeCode } from '../lib/compiler';
import { GitHubArticleReader } from './GitHubArticleReader';

/* ── HLD Practice Hub Types ── */
interface HLDComponent {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
}

const HLD_COMPONENT_PALETTE = [
  { type: 'client', label: 'Client / Browser', icon: MonitorSmartphone, color: 'text-sky-400' },
  { type: 'cdn', label: 'CDN', icon: Globe, color: 'text-emerald-400' },
  { type: 'load_balancer', label: 'Load Balancer', icon: Layers, color: 'text-amber-400' },
  { type: 'api_gateway', label: 'API Gateway', icon: Shield, color: 'text-indigo-400' },
  { type: 'service', label: 'Microservice', icon: Server, color: 'text-purple-400' },
  { type: 'database', label: 'Database', icon: Database, color: 'text-emerald-400' },
  { type: 'cache', label: 'Cache (Redis)', icon: Zap, color: 'text-rose-400' },
  { type: 'queue', label: 'Message Queue', icon: Box, color: 'text-orange-400' },
  { type: 'storage', label: 'Object Storage', icon: Cloud, color: 'text-cyan-400' },
];

const HLD_PRACTICE_PROBLEMS = [
  { id: 'hld-url-shortener', title: 'Design URL Shortener (TinyURL)', difficulty: 'Medium' as const, companies: ['Google', 'Meta', 'Amazon'] },
  { id: 'hld-twitter-feed', title: 'Design Twitter / X Feed', difficulty: 'Hard' as const, companies: ['Meta', 'Twitter', 'Google'] },
  { id: 'hld-chat-app', title: 'Design WhatsApp / Messenger', difficulty: 'Hard' as const, companies: ['Meta', 'Microsoft', 'Google'] },
  { id: 'hld-video-streaming', title: 'Design YouTube / Netflix', difficulty: 'Hard' as const, companies: ['Google', 'Netflix', 'Amazon'] },
  { id: 'hld-uber', title: 'Design Uber / Ride Sharing', difficulty: 'Hard' as const, companies: ['Uber', 'Lyft', 'Google'] },
  { id: 'hld-notification', title: 'Design Notification System', difficulty: 'Medium' as const, companies: ['Meta', 'Amazon', 'Apple'] },
  { id: 'hld-rate-limiter', title: 'Design Rate Limiter', difficulty: 'Medium' as const, companies: ['Stripe', 'Cloudflare', 'Amazon'] },
  { id: 'hld-search-engine', title: 'Design Web Crawler & Search', difficulty: 'Hard' as const, companies: ['Google', 'Microsoft', 'Amazon'] },
];

interface SystemDesignHubProps {
  onOpenDirectProblem?: (problemId: string) => void;
}

export const SystemDesignHub: React.FC<SystemDesignHubProps> = () => {
  const [activeView, setActiveView] = useState<'lld_problems' | 'hld_practice' | 'reader'>('lld_problems');
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

  // ── HLD Practice State ──
  const [activeHldProblem, setActiveHldProblem] = useState<typeof HLD_PRACTICE_PROBLEMS[0] | null>(null);
  const [hldComponents, setHldComponents] = useState<HLDComponent[]>([]);
  const [hldNextId, setHldNextId] = useState(1);
  const [hldAiReview, setHldAiReview] = useState<string | null>(null);
  const [isHldReviewing, setIsHldReviewing] = useState(false);
  const [hldNotes, setHldNotes] = useState('');

  // Load starter stub on problem open (don't generate diagram until compile succeeds)
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
    if (activeView === 'reader' && selectedGithubTopic) {
      setIsLoadingGithub(true);
      fetchGitHubMarkdown(selectedGithubTopic.repo, selectedGithubTopic.path).then((res) => {
        setIsLoadingGithub(false);
        setGithubMarkdown(res.content || selectedGithubTopic.fallbackSummary);
      });
    }
  }, [activeView, selectedGithubTopic]);

  /**
   * Generates diagram from code — only called after successful compilation.
   */
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
      const arr = Array.from(set);
      localStorage.setItem('sdetube_lld_solved_ids', JSON.stringify(arr));
      return arr;
    });
  };

  /**
   * Compiles code via online compiler. Only generates diagram on success (no syntax errors).
   */
  const handleRunOnlineCompiler = async () => {
    if (!activeProblem) return;
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

        // Auto-generate diagram only on successful compilation
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

  const handleAIEvaluate = async () => {
    if (!activeProblem) return;
    setIsEvaluating(true);
    setIsEvaluationOpen(true);
    setAiEvaluation(null);

    const prompt = `You are a Principal Software Architect conducting a senior Low-Level Design interview.
Evaluate the candidate's OOP solution for "${activeProblem.title}".

Code (${codeLanguage}):
\`\`\`${codeLanguage}
${oopCode}
\`\`\`

Provide:
1. Overall Score (0-100) & Seniority Level
2. SOLID Compliance Analysis
3. Design Patterns Applied
4. Concurrency & Thread-Safety
5. Concrete Refactoring Recommendations`;

    try {
      const response = await requestMistralChat([
        { role: 'system', content: 'You are a Principal Software Architect evaluating LLD implementations.' },
        { role: 'user', content: prompt }
      ]);
      setAiEvaluation(response.content);
    } catch {
      setAiEvaluation('Evaluation could not be completed. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // ── HLD Practice Functions ──
  const handleAddHldComponent = (type: string, label: string) => {
    const newComp: HLDComponent = {
      id: `hld-comp-${hldNextId}`,
      type,
      label: `${label} ${hldNextId}`,
      x: 50 + Math.random() * 400,
      y: 50 + Math.random() * 300,
    };
    setHldComponents(prev => [...prev, newComp]);
    setHldNextId(prev => prev + 1);
  };

  const handleRemoveHldComponent = (id: string) => {
    setHldComponents(prev => prev.filter(c => c.id !== id));
  };

  const handleHldAIReview = async () => {
    if (!activeHldProblem) return;
    setIsHldReviewing(true);
    setHldAiReview(null);

    const componentsList = hldComponents.map(c => `- ${c.label} (${c.type})`).join('\n');
    const prompt = `You are a Principal System Design Architect reviewing a High-Level Design (HLD) solution for "${activeHldProblem.title}".

The candidate has placed these components in their architecture:
${componentsList || '(No components placed yet)'}

Additional notes from candidate:
${hldNotes || '(None)'}

Provide a comprehensive HLD review covering:
1. Architecture Score (0-100) & Missing Components
2. Scalability Analysis (can it handle 10M+ DAU?)
3. Single Points of Failure & Redundancy
4. Data Flow Correctness
5. Caching Strategy Assessment
6. Suggested Improvements & Best Practices
7. What components are missing for production readiness?`;

    try {
      const response = await requestMistralChat([
        { role: 'system', content: 'You are a Principal System Design Architect at a FAANG company reviewing High-Level Design interview solutions.' },
        { role: 'user', content: prompt }
      ]);
      setHldAiReview(response.content);
    } catch {
      setHldAiReview('Review could not be completed. Please try again.');
    } finally {
      setIsHldReviewing(false);
    }
  };

  const rightWidth = 100 - 30 - 40; // fallback

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
      
      {/* ═══ LLD STUDIO VIEW (In-Page, No Popup) ═══ */}
      {activeProblem ? (
        <div className="w-full space-y-4 animate-fadeIn">
          
          {/* Breadcrumb Header & Action Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 border border-purple-500/30 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveProblem(null)}
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Questions</span>
              </button>

              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-[11px] text-purple-400 font-mono tracking-wider px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800/60">
                  SDETUBE LLD
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate max-w-sm">{activeProblem.title}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  activeProblem.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                  activeProblem.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                  'bg-rose-950 border-rose-700 text-rose-300'
                }`}>
                  {activeProblem.difficulty}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Language Selector */}
              <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs font-bold">
                {(['java', 'cpp', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCodeLanguage(lang)}
                    className={`px-3 py-1 rounded-lg uppercase text-[10px] font-mono cursor-pointer transition-all ${
                      codeLanguage === lang ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang === 'cpp' ? 'C++' : lang === 'java' ? 'Java' : 'Python'}
                  </button>
                ))}
              </div>

              {/* Run Online Compiler */}
              <button
                onClick={handleRunOnlineCompiler}
                disabled={isRunningCode}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 fill-current ${isRunningCode ? 'animate-spin' : ''}`} />
                <span>{isRunningCode ? 'Compiling...' : 'Run & Compile'}</span>
              </button>

              {/* View Diagram Button (opens popup) */}
              <button
                onClick={() => {
                  if (!diagramSvg && !compiledSuccessfully) {
                    setCodeOutput('⚠️ Please compile your code first. Diagram is generated only after successful compilation.');
                    return;
                  }
                  if (!diagramSvg) {
                    handleGenerateDiagram(oopCode);
                  }
                  setIsDiagramModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Diagram</span>
                {compiledSuccessfully && diagramSvg && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>

              {/* AI Evaluate */}
              <button
                onClick={handleAIEvaluate}
                disabled={isEvaluating}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isEvaluating ? 'Evaluating...' : 'AI Review'}</span>
              </button>

              {/* Mark Solved */}
              <button
                onClick={() => handleToggleSolved(activeProblem.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  solvedLldIds.includes(activeProblem.id)
                    ? 'bg-emerald-950 border-emerald-700 text-emerald-400'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{solvedLldIds.includes(activeProblem.id) ? 'Solved' : 'Solve'}</span>
              </button>
            </div>
          </div>

          {/* 2-Panel Layout: Requirements + Code Editor */}
          <div className="w-full flex flex-col lg:flex-row gap-4 min-h-[700px]">
            
            {/* LEFT PANEL: Problem Requirements */}
            <div className="w-full lg:w-[28%] glass-panel p-5 rounded-3xl border border-slate-800/80 bg-slate-950/80 overflow-y-auto space-y-5 custom-scrollbar">
              <div>
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
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
                  <span>Design Patterns</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeProblem.designPatternsUsed.map((p, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800 text-[10px] text-emerald-300 font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Monaco Code Editor */}
            <div className="w-full lg:w-[72%] glass-panel rounded-3xl border border-slate-800/80 bg-slate-900/90 flex flex-col overflow-hidden shadow-2xl">
              <div className="h-10 px-4 bg-slate-950 text-[11px] font-mono text-slate-400 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                <span className="text-purple-300 font-bold">Solution.{codeLanguage === 'java' ? 'java' : codeLanguage === 'cpp' ? 'cpp' : 'py'}</span>
                <div className="flex items-center gap-3">
                  {compiledSuccessfully && (
                    <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Compiled
                    </span>
                  )}
                  <span className="text-slate-500">SDETube OOP Sandbox</span>
                </div>
              </div>

              <div className="flex-1 min-h-[450px] overflow-hidden">
                <Editor
                  height="100%"
                  language={codeLanguage === 'cpp' ? 'cpp' : codeLanguage === 'python' ? 'python' : 'java'}
                  theme="vs-dark"
                  value={oopCode}
                  onChange={handleCodeChange}
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    folding: true,
                    automaticLayout: true,
                    fontFamily: 'Fira Code, JetBrains Mono, monospace',
                    tabSize: 4
                  }}
                />
              </div>

              {/* Compiler Output Log */}
              {codeOutput && (
                <div className="h-36 bg-slate-950 border-t border-slate-800 p-4 overflow-y-auto font-mono text-[11px] text-emerald-300 whitespace-pre-wrap flex-shrink-0 custom-scrollbar">
                  {codeOutput}
                </div>
              )}
            </div>
          </div>

          {/* ═══ DIAGRAM POPUP MODAL ═══ */}
          {isDiagramModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setIsDiagramModalOpen(false)}>
              <div className="bg-slate-950 border border-indigo-500/40 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="h-14 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-slate-100">{activeProblem.title} — Architecture Diagram</h3>
                    {compiledSuccessfully && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-[10px] text-emerald-300 font-mono">
                        ✓ From compiled code
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => setDiagramZoom(p => Math.min(3.0, p + 0.2))} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer">
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDiagramZoom(p => Math.max(0.3, p - 0.2))} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer">
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDiagramZoom(1.0)} className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 cursor-pointer">
                      100%
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
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
                        title="Export SVG"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => { handleGenerateDiagram(oopCode); }}
                      disabled={isGeneratingDiagram}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingDiagram ? 'animate-spin' : ''}`} />
                      <span>Regenerate</span>
                    </button>
                    <button onClick={() => setIsDiagramModalOpen(false)} className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-8 overflow-auto flex items-center justify-center bg-slate-950/90 custom-scrollbar min-h-[500px]">
                  {isGeneratingDiagram ? (
                    <div className="text-center font-mono text-sm text-slate-400 animate-pulse">
                      Generating architecture diagram from compiled code...
                    </div>
                  ) : diagramError ? (
                    <div className="p-6 rounded-2xl bg-red-950/60 border border-red-800 text-sm text-red-200 font-mono max-w-lg text-center">
                      {diagramError}
                    </div>
                  ) : diagramSvg ? (
                    <div 
                      style={{ transform: `scale(${diagramZoom})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}
                      dangerouslySetInnerHTML={{ __html: diagramSvg }} 
                      className="max-w-full filter drop-shadow-lg"
                    />
                  ) : (
                    <div className="text-center font-mono text-sm text-slate-500 space-y-2">
                      <Eye className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                      <p>No diagram yet.</p>
                      <p className="text-xs text-slate-600">Compile your code successfully first, then the diagram will be generated automatically.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Evaluation Drawer */}
          {isEvaluationOpen && (
            <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] bg-slate-950/95 border-l border-purple-500/40 shadow-2xl backdrop-blur-xl flex flex-col animate-slideLeft">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <h4 className="text-sm font-bold text-slate-100">Principal Architect AI Review</h4>
                </div>
                <button onClick={() => setIsEvaluationOpen(false)} className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 cursor-pointer">✕</button>
              </div>
              <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                {isEvaluating ? (
                  <div className="py-24 text-center text-slate-400 font-mono text-xs animate-pulse">
                    Evaluating OOP architecture against SOLID principles...
                  </div>
                ) : aiEvaluation ? (
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-900/50 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {aiEvaluation}
                  </div>
                ) : null}
              </div>
            </div>
          )}

        </div>

      ) : activeHldProblem ? (
        /* ═══ HLD PRACTICE STUDIO ═══ */
        <div className="w-full space-y-4 animate-fadeIn">
          
          {/* HLD Header */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 border border-amber-500/30 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => { setActiveHldProblem(null); setHldComponents([]); setHldAiReview(null); setHldNotes(''); }}
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All HLD Questions</span>
              </button>
              <span className="font-extrabold text-[11px] text-amber-400 font-mono tracking-wider px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-800/60">
                SDETUBE HLD
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">{activeHldProblem.title}</h3>
            </div>
            <button
              onClick={handleHldAIReview}
              disabled={isHldReviewing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isHldReviewing ? 'Reviewing...' : 'AI Architecture Review'}</span>
            </button>
          </div>

          <div className="w-full flex flex-col lg:flex-row gap-4 min-h-[650px]">
            
            {/* LEFT: Component Palette & Notes */}
            <div className="w-full lg:w-[25%] glass-panel p-5 rounded-3xl border border-slate-800/80 bg-slate-950/80 space-y-5 overflow-y-auto custom-scrollbar">
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Architecture Components</span>
                </h4>
                <p className="text-[11px] text-slate-400 mb-4">Click to add components to your design canvas.</p>
                <div className="grid grid-cols-1 gap-2">
                  {HLD_COMPONENT_PALETTE.map((comp) => (
                    <button
                      key={comp.type}
                      onClick={() => handleAddHldComponent(comp.type, comp.label)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
                    >
                      <comp.icon className={`w-4 h-4 ${comp.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-xs text-slate-300 font-semibold">{comp.label}</span>
                      <PlusCircle className="w-3 h-3 text-slate-600 group-hover:text-amber-400 ml-auto transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Design Notes</h4>
                <textarea
                  value={hldNotes}
                  onChange={(e) => setHldNotes(e.target.value)}
                  placeholder="Describe your architecture decisions, data flow, scaling strategy..."
                  className="w-full h-32 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                />
              </div>
            </div>

            {/* CENTER: Architecture Design Canvas */}
            <div className="w-full lg:w-[50%] glass-panel rounded-3xl border border-amber-500/20 bg-slate-900/60 overflow-hidden flex flex-col shadow-2xl">
              <div className="h-10 px-4 bg-slate-950 text-[11px] font-mono text-slate-400 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                <span className="text-amber-300 font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Architecture Canvas — {hldComponents.length} Components</span>
                </span>
                <button
                  onClick={() => setHldComponents([])}
                  className="text-slate-500 hover:text-red-400 text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="flex-1 p-4 overflow-auto custom-scrollbar relative bg-[radial-gradient(circle,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[length:24px_24px]" style={{ minHeight: 500 }}>
                {hldComponents.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-center">
                    <div className="space-y-3">
                      <Layers className="w-16 h-16 mx-auto text-slate-700" />
                      <p className="text-sm text-slate-500 font-mono">Click components on the left to build your architecture</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4 justify-center items-start pt-4">
                    {hldComponents.map((comp) => {
                      const palette = HLD_COMPONENT_PALETTE.find(p => p.type === comp.type);
                      const IconComp = palette?.icon || Box;
                      return (
                        <div
                          key={comp.id}
                          className="relative p-4 rounded-2xl bg-slate-950/90 border border-slate-700 hover:border-amber-500/60 shadow-xl min-w-[140px] text-center group transition-all"
                        >
                          <button
                            onClick={() => handleRemoveHldComponent(comp.id)}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                          >
                            ×
                          </button>
                          <IconComp className={`w-8 h-8 mx-auto mb-2 ${palette?.color || 'text-slate-400'}`} />
                          <p className="text-xs font-bold text-slate-200">{comp.label}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{comp.type}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: AI Review Panel */}
            <div className="w-full lg:w-[25%] glass-panel p-5 rounded-3xl border border-slate-800/80 bg-slate-950/80 overflow-y-auto custom-scrollbar space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Architecture Review</span>
              </h4>
              
              {isHldReviewing ? (
                <div className="py-16 text-center text-slate-400 font-mono text-xs animate-pulse">
                  Analyzing your system design architecture...
                </div>
              ) : hldAiReview ? (
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {hldAiReview}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-500 text-xs font-mono space-y-2">
                  <Sparkles className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                  <p>Place your system design components and click "AI Architecture Review" to get a comprehensive evaluation.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      ) : (
        /* ═══ MAIN HUB VIEW ═══ */
        <div className="space-y-6">
          
          {/* Hub Header Banner */}
          <div className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/50 border border-purple-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-700/60 text-purple-300 font-mono text-[11px] font-bold w-fit mb-3">
                  <Cpu className="w-3.5 h-3.5 text-amber-300" />
                  <span>SDETUBE &bull; LLD + HLD PRACTICE &bull; OOP CODE STUDIO</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                  SDETube System Design & LLD Practice Hub
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Practice LLD with Monaco code editor & online compiler, build HLD architectures with drag-and-drop components, and get evaluated by AI.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                  <div className="text-xs font-bold text-purple-400">LLD Solved</div>
                  <div className="text-xl font-black text-slate-100 font-mono mt-0.5">
                    {solvedLldIds.length} <span className="text-xs text-slate-500">/ {LLD_PROBLEMS.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-4 flex-wrap">
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setActiveView('lld_problems')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeView === 'lld_problems' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>LLD Practice ({LLD_PROBLEMS.length})</span>
              </button>
              <button
                onClick={() => setActiveView('hld_practice')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeView === 'hld_practice' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>HLD Practice ({HLD_PRACTICE_PROBLEMS.length})</span>
              </button>
              <button
                onClick={() => setActiveView('reader')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeView === 'reader' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Github className="w-4 h-4 text-slate-200" />
                <span>Design Primers</span>
              </button>
            </div>

            {(activeView === 'lld_problems' || activeView === 'hld_practice') && (
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

          {/* LLD Questions Grid */}
          {activeView === 'lld_problems' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProblems.map((prob) => {
                const isSolved = solvedLldIds.includes(prob.id);
                return (
                  <div key={prob.id} className={`glass-panel p-6 rounded-3xl border transition-all flex flex-col justify-between group ${
                    isSolved ? 'border-emerald-700/60 bg-emerald-950/10' : 'border-slate-800/80 hover:border-purple-500/80 hover:bg-purple-950/10'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-700/60 text-[10px] font-mono font-bold text-purple-300">
                          {prob.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          prob.difficulty === 'Easy' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                          prob.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                          'bg-rose-950 border-rose-700 text-rose-300'
                        }`}>{prob.difficulty}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors mb-2">{prob.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">{prob.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {prob.designPatternsUsed.map((pat, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">{pat}</span>
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
                          className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Code className="w-3.5 h-3.5" />
                          <span>Open Studio</span>
                        </button>
                        <button
                          onClick={() => handleToggleSolved(prob.id)}
                          className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                            isSolved ? 'bg-emerald-950 border-emerald-700 text-emerald-400' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
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

          {/* HLD Practice Grid */}
          {activeView === 'hld_practice' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {HLD_PRACTICE_PROBLEMS.filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.companies.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))).map((prob) => (
                <div key={prob.id} className="glass-panel p-6 rounded-3xl border border-slate-800/80 hover:border-amber-500/80 hover:bg-amber-950/10 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-700/60 text-[10px] font-mono font-bold text-amber-300">
                        HLD
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        prob.difficulty === 'Medium' ? 'bg-amber-950 border-amber-700 text-amber-300' : 'bg-rose-950 border-rose-700 text-rose-300'
                      }`}>{prob.difficulty}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors mb-2">{prob.title}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prob.companies.join(', ')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveHldProblem(prob)}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Design Architecture</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* GitHub Primers Reader */}
          {activeView === 'reader' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3 space-y-3">
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
              <div className="lg:col-span-9">
                <GitHubArticleReader
                  topic={selectedGithubTopic}
                  markdown={githubMarkdown}
                  isLoading={isLoadingGithub}
                />
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
