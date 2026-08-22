import React, { useState, useEffect, useMemo, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Database, 
  Minimize2, 
  BookOpen, 
  FileCode, 
  Send, 
  Bot, 
  Copy, 
  Check, 
  CheckCircle, 
  Tv, 
  X, 
  RefreshCw,
  Table,
  Lightbulb,
  Layers,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Lock,
  Eye,
  RotateCcw,
  Cloud
} from 'lucide-react';
import { executeAndJudgeSQL, generateSQLProblem, SQLProblem, SQLJudgeResult } from '../lib/sqlJudge';
import { requestContextualAIChatResponse, ChatMessage } from '../lib/mistral';
import { FormattedChatText } from './FormattedChatText';
import confetti from 'canvas-confetti';
import { deductCredits, canAffordAction, PRICING_CONFIG } from '../lib/billing';
import { getCurrentStudent } from '../lib/auth';
import { InsufficientCreditsModal } from './InsufficientCreditsModal';
import { WalletTopupModal } from './WalletTopupModal';
import { toSlug } from '../lib/problemService';

interface LeetCodeSQLWorkspaceModalProps {
  problemTitle: string;
  transcript?: string;
  notes?: string;
  onClose: () => void;
  onCodeExecuted?: (timeTakenSeconds: number, isCorrect: boolean) => void;
}

export const LeetCodeSQLWorkspaceModal: React.FC<LeetCodeSQLWorkspaceModalProps> = ({
  problemTitle,
  transcript = '',
  notes = '',
  onClose,
  onCodeExecuted
}) => {
  const cleanTitle = useMemo(() => {
    return (problemTitle || 'DBMS SQL Challenge')
      .replace(/\.(mp4|mkv|webm)$/i, '')
      .replace(/_/g, ' ');
  }, [problemTitle]);

  const sqlProblem: SQLProblem = useMemo(() => {
    return generateSQLProblem(cleanTitle, transcript, notes);
  }, [cleanTitle, transcript, notes]);

  const [code, setCode] = useState<string>(() => {
    try {
      const cached = localStorage.getItem(`edustream_sql_code_${toSlug(cleanTitle)}`);
      if (cached !== null && cached.trim().length > 0) return cached;
    } catch {}
    return sqlProblem.starterSql;
  });

  const [codeSaveStatus, setCodeSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Instant Synchronous Autosave on every keystroke
  const handleCodeChange = (newVal: string | undefined) => {
    const nextCode = newVal ?? '';
    setCode(nextCode);
    try {
      localStorage.setItem(`edustream_sql_code_${toSlug(cleanTitle)}`, nextCode);
      setCodeSaveStatus('saved');
    } catch {}
  };

  // Reset to default starter SQL
  const handleResetCode = () => {
    if (window.confirm('Reset SQL query to default template? Any local edits will be discarded.')) {
      setCode(sqlProblem.starterSql);
      try {
        localStorage.removeItem(`edustream_sql_code_${toSlug(cleanTitle)}`);
        setCodeSaveStatus('idle');
      } catch {}
    }
  };

  const [leftTab, setLeftTab] = useState<'description' | 'editorial' | 'solutions' | 'submissions'>('description');
  const [consoleTab, setConsoleTab] = useState<'tables' | 'result'>('tables');
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState<number>(0);
  
  // Resizable Split Pane state
  const [splitPercent, setSplitPercent] = useState<number>(42);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Minimizable console state
  const [isConsoleMinimized, setIsConsoleMinimized] = useState<boolean>(false);

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [judgeResult, setJudgeResult] = useState<SQLJudgeResult | null>(null);
  
  // Copy states
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedDesc, setCopiedDesc] = useState<boolean>(false);
  const [copiedEditorial, setCopiedEditorial] = useState<boolean>(false);
  const [copiedSolution, setCopiedSolution] = useState<boolean>(false);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);

  // Submissions history
  const [submissionsList, setSubmissionsList] = useState<{
    timestamp: string;
    status: string;
    runtime: string;
  }[]>([]);

  // Dragging handlers for resizable split pane
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const containerWidth = window.innerWidth;
      const newPercent = (e.clientX / containerWidth) * 100;
      if (newPercent >= 20 && newPercent <= 80) {
        setSplitPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Resizable Vertical Console Height (Editor vs Bottom Testcases)
  const [consoleHeight, setConsoleHeight] = useState<number>(270);
  const [isVerticalDragging, setIsVerticalDragging] = useState<boolean>(false);

  const handleVerticalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsVerticalDragging(true);
  };

  useEffect(() => {
    const handleVerticalMouseMove = (e: MouseEvent) => {
      if (!isVerticalDragging) return;
      const windowHeight = window.innerHeight;
      const newHeight = windowHeight - e.clientY;
      if (newHeight >= 100 && newHeight <= windowHeight - 160) {
        setConsoleHeight(newHeight);
      }
    };

    const handleVerticalMouseUp = () => {
      setIsVerticalDragging(false);
    };

    if (isVerticalDragging) {
      window.addEventListener('mousemove', handleVerticalMouseMove);
      window.addEventListener('mouseup', handleVerticalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleVerticalMouseMove);
      window.removeEventListener('mouseup', handleVerticalMouseUp);
    };
  }, [isVerticalDragging]);

  // Ask AI Drawer on the Right
  const [isRightAskAiOpen, setIsRightAskAiOpen] = useState<boolean>(false);
  const chatStorageKey = `sdetube_sql_chat_${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const [aiChatMessages, setAiChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(chatStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        role: 'assistant',
        content: `Hi! I'm your dedicated SQL Teaching Assistant for **${cleanTitle}**.\n\nI have complete context of the database tables, schema constraints, and in-browser SQL judge. Ask me about JOIN logic, GROUP BY aggregations, or debugging your query!`
      }
    ];
  });

  const [aiInputText, setAiInputText] = useState<string>('');
  const [isAiReplying, setIsAiReplying] = useState<boolean>(false);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(chatStorageKey, JSON.stringify(aiChatMessages));
    } catch {}
  }, [aiChatMessages, chatStorageKey]);

  useEffect(() => {
    if (isRightAskAiOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiChatMessages, isRightAskAiOpen]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyDesc = () => {
    navigator.clipboard.writeText(sqlProblem.description);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  const handleCopyEditorial = () => {
    const editContent = `SQL Query Strategy for ${cleanTitle}:\n1. Analyze table relationships and primary/foreign key joins.\n2. Filter unneeded rows with WHERE prior to aggregation.\n3. Use GROUP BY / HAVING for grouped summaries or Subqueries for conditional ranking.`;
    navigator.clipboard.writeText(editContent);
    setCopiedEditorial(true);
    setTimeout(() => setCopiedEditorial(false), 2000);
  };

  const handleCopySolution = () => {
    navigator.clipboard.writeText(sqlProblem.solutionSql);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  const handleClearChat = () => {
    const initialMsg: ChatMessage = {
      role: 'assistant',
      content: `Chat history reset. How can I assist you with your SQL query for **${cleanTitle}**?`
    };
    setAiChatMessages([initialMsg]);
    try {
      localStorage.removeItem(chatStorageKey);
    } catch {}
  };

  // ── Billing Modals State ──
  const [isInsufficientCreditsOpen, setIsInsufficientCreditsOpen] = useState(false);
  const [isWalletTopupOpen, setIsWalletTopupOpen] = useState(false);
  const [insufficientMeta, setInsufficientMeta] = useState<{ cost: number; action: string }>({ cost: 0.10, action: 'Running SQL Query' });

  // Run & Judge SQL
  const handleExecute = async (isSubmission: boolean = false) => {
    if (!canAffordAction(PRICING_CONFIG.SQL_RUN_JUDGE)) {
      setInsufficientMeta({
        cost: PRICING_CONFIG.SQL_RUN_JUDGE,
        action: 'Running SQL Query on Database Engine (10 paise)'
      });
      setIsInsufficientCreditsOpen(true);
      return;
    }

    deductCredits(
      PRICING_CONFIG.SQL_RUN_JUDGE,
      'SQL_RUN',
      `🗄️ SQL Query Run: ${cleanTitle}`
    );

    setIsExecuting(true);
    setConsoleTab('result');
    if (isConsoleMinimized) setIsConsoleMinimized(false);

    try {
      const result = await executeAndJudgeSQL(code, sqlProblem, activeTestCaseIdx);
      setJudgeResult(result);

      const isSuccess = result.status === 'ACCEPTED';

      if (isSubmission) {
        setSubmissionsList(prev => [
          {
            timestamp: new Date().toLocaleTimeString(),
            status: isSuccess ? 'Accepted' : result.status === 'SYNTAX_ERROR' ? 'Syntax Error' : 'Wrong Answer',
            runtime: `${result.executionTimeMs} ms`
          },
          ...prev
        ]);

        if (isSuccess) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        if (onCodeExecuted) {
          onCodeExecuted(Math.max(1, Math.round(result.executionTimeMs / 1000)), isSuccess);
        }
      }
    } catch (err: any) {
      setJudgeResult({
        status: 'SYNTAX_ERROR',
        executionTimeMs: 0,
        columns: [],
        rows: [],
        expectedColumns: [],
        expectedRows: [],
        errorMessage: err?.message || 'Database engine execution exception.'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Send message in Ask AI
  const handleSendAiMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || aiInputText;
    if (!textToSend.trim() || isAiReplying) return;

    const user = getCurrentStudent();
    if (!canAffordAction(PRICING_CONFIG.AI_CHAT_MESSAGE, user?.email)) {
      setInsufficientMeta({
        cost: PRICING_CONFIG.AI_CHAT_MESSAGE,
        action: 'SQL AI Teaching Assistant Chat (20 paise)'
      });
      setIsInsufficientCreditsOpen(true);
      return;
    }

    deductCredits(
      PRICING_CONFIG.AI_CHAT_MESSAGE,
      'AI_CHAT',
      `🤖 SQL AI Assistant Chat: ${cleanTitle}`,
      user?.email
    );

    const userMessage: ChatMessage = { role: 'user', content: textToSend.trim() };
    setAiChatMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setAiInputText('');
    setIsAiReplying(true);

    try {
      const reply = await requestContextualAIChatResponse({
        mode: 'code',
        userMsg: textToSend,
        videoTitle: cleanTitle,
        transcript: transcript,
        notes: notes,
        codingContext: {
          title: cleanTitle,
          problemStatement: sqlProblem.description,
          studentCode: code,
          language: 'sql',
          testCases: [sqlProblem.setupSql],
          stdout: judgeResult?.rows ? JSON.stringify(judgeResult.rows) : '',
          stderr: judgeResult?.errorMessage || ''
        },
        history: aiChatMessages
      });

      setAiChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setAiChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Could not fetch AI reasoning. Please verify your query syntax or try again.' }
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const currentTestCase = sqlProblem.testCases[activeTestCaseIdx] || sqlProblem.testCases[0] || {
    name: 'Case 1',
    tables: sqlProblem.tables
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col font-sans select-none animate-fadeIn overflow-hidden ${isDragging ? 'cursor-col-resize select-none' : ''}`}>
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR                                                             */}
      {/* ========================================================================= */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0 z-10">
        
        {/* Brand & SQL Problem Title */}
        <div className="flex items-center space-x-3 truncate">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-800 transition-colors group cursor-pointer"
            title="Return to Lecture Workspace"
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md">
              <Database className="w-4 h-4 text-cyan-200" />
            </div>
            <span className="text-sm font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 group-hover:opacity-90">
              SDEStream SQL Arena
            </span>
          </button>

          <span className="text-slate-600 font-mono">/</span>

          <div className="flex items-center space-x-2 truncate">
            <h1 className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-xs sm:max-w-md">
              {cleanTitle}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border bg-amber-950/80 text-amber-400 border-amber-700/60">
              {sqlProblem.difficulty}
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-950 border border-cyan-800 text-cyan-300">
              In-Memory WebAssembly DB
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Ask AI Top Button */}
          <button
            onClick={() => setIsRightAskAiOpen(true)}
            className="p-2 rounded-xl bg-gradient-to-tr from-purple-600/30 via-indigo-600/30 to-sky-500/30 hover:from-purple-600 hover:to-indigo-600 text-purple-200 hover:text-white border border-purple-500/40 transition-all shadow-sm cursor-pointer relative group flex items-center justify-center"
            title="Ask AI Teaching Assistant"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="absolute top-10 right-0 bg-slate-900 border border-slate-800 text-slate-100 text-[11px] font-bold px-2.5 py-1 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none z-30">
              Ask AI
            </span>
          </button>

          {/* Reset Starter Query */}
          <button
            onClick={() => setCode(sqlProblem.starterSql)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            title="Reset Starter Query"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
            title="Exit SQL Arena"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. RESIZABLE SPLIT SCREEN WORKSPACE                                       */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT PANEL: DESCRIPTION, EDITORIAL, SOLUTIONS, SUBMISSIONS               */}
        {/* ----------------------------------------------------------------------- */}
        <div 
          style={{ width: `${splitPercent}%` }}
          className="hidden lg:flex bg-slate-900/90 border-r border-slate-800 flex-col overflow-hidden transition-all duration-75"
        >
          
          {/* Left Tabs Bar */}
          <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar text-xs font-bold flex-shrink-0">
            
            <button
              onClick={() => setLeftTab('description')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                leftTab === 'description'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setLeftTab('editorial')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                leftTab === 'editorial'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Editorial</span>
            </button>

            <button
              onClick={() => setLeftTab('solutions')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                leftTab === 'solutions'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Solution</span>
            </button>

            <button
              onClick={() => setLeftTab('submissions')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                leftTab === 'submissions'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Submissions ({submissionsList.length})</span>
            </button>

          </div>

          {/* Left Content Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed font-sans select-text">
            
            {/* TAB 1: DESCRIPTION */}
            {leftTab === 'description' && (
              <div className="space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h2 className="text-xl font-black text-slate-100 tracking-tight">{cleanTitle}</h2>
                  <button
                    onClick={handleCopyDesc}
                    className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                  >
                    {copiedDesc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDesc ? 'Copied' : 'Copy Description'}</span>
                  </button>
                </div>

                {/* Problem Statement with Better-Aligned Tables */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-slate-200 leading-relaxed font-sans text-xs sm:text-sm">
                  <FormattedChatText text={sqlProblem.description} />
                </div>

                {/* Input Database Tables */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-cyan-400" /> Reference Schema Tables
                  </h3>

                  {sqlProblem.tables.map((tbl, tIdx) => (
                    <div key={tIdx} className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                      <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-cyan-300 font-mono">
                        Table: {tbl.tableName}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-[11px]">
                          <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                            <tr>
                              {tbl.schema.map((col, cIdx) => (
                                <th key={cIdx} className="px-3.5 py-1.5 font-bold">{col.column}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-300">
                            {tbl.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-900/40">
                                {row.map((val, vIdx) => (
                                  <td key={vIdx} className="px-3.5 py-1.5">{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 2: EDITORIAL */}
            {leftTab === 'editorial' && (
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">SQL Query Strategy</h3>
                  <button
                    onClick={handleCopyEditorial}
                    className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
                  >
                    {copiedEditorial ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEditorial ? 'Copied' : 'Copy Editorial'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-300">Relational Optimization Concepts</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    • <strong>Projection & Filtering:</strong> Prefer filtering with index-backed WHERE conditions prior to invoking sorting operations.<br />
                    • <strong>JOIN Cardinality:</strong> When joining multi-table entities, verify outer vs inner join semantics to prevent accidental NULL suppression.<br />
                    • <strong>Subquery vs Window Functions:</strong> Correlated subqueries evaluate per-row while window functions compute in a single pass.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: SOLUTIONS */}
            {leftTab === 'solutions' && (
              !isSolutionRevealed ? (
                <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4 my-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center mx-auto text-cyan-300">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100">Canonical SQL Query Protected</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Write your query in the SQL editor and click Run Query first to test your solution before checking the reference solution.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSolutionRevealed(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/30 cursor-pointer transition-all flex items-center gap-1.5 mx-auto hover:scale-105"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Reveal Canonical SQL</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Canonical Solution Query</h3>
                    <button
                      onClick={handleCopySolution}
                      className="flex items-center space-x-1 text-xs text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                    >
                      {copiedSolution ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSolution ? 'Copied' : 'Copy Solution'}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto">
                    <pre className="text-emerald-300 whitespace-pre-wrap">{sqlProblem.solutionSql.trim()}</pre>
                  </div>
                </div>
              )
            )}

            {/* TAB 4: SUBMISSIONS */}
            {leftTab === 'submissions' && (
              <div className="space-y-3 font-sans">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Submission History</h3>
                
                {submissionsList.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
                    No SQL submissions recorded yet in this workspace session.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submissionsList.map((sub, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                          sub.status === 'Accepted'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                            : 'bg-rose-950 text-rose-400 border border-rose-700/60'
                        }`}>
                          {sub.status}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">{sub.runtime}</span>
                        <span className="text-slate-500 text-[11px]">{sub.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* DRAGGABLE RESIZER HANDLE                                                */}
        {/* ----------------------------------------------------------------------- */}
        <div
          onMouseDown={handleMouseDown}
          className="hidden lg:flex w-2 hover:w-2.5 bg-slate-900 hover:bg-cyan-600/80 cursor-col-resize items-center justify-center transition-all z-20 border-x border-slate-800/80 group"
          title="Drag to resize Problem Description and SQL Editor width"
        >
          <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT PANEL: MONACO SQL EDITOR & QUERY RESULT CONSOLE                   */}
        {/* ----------------------------------------------------------------------- */}
        <div 
          style={{ width: `${100 - splitPercent}%` }}
          className="flex-1 lg:flex-none bg-slate-950 flex flex-col overflow-hidden relative transition-all duration-75"
        >
          
          {/* Monaco SQL Editor */}
          <div className="flex-1 min-h-[160px] relative overflow-hidden">
            <Editor
              height="100%"
              language="sql"
              value={code}
              theme="vs-dark"
              onChange={handleCodeChange}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', 'Courier New', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                lineNumbers: 'on',
                automaticLayout: true,
                tabSize: 2
              }}
            />

            {/* Quick Actions */}
            <div className="absolute top-2 right-4 flex items-center space-x-2 z-10">
              <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/60 text-[10px] font-mono text-slate-300 shadow-md">
                <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Saved in Browser Cache ⚡</span>
              </div>

              <button
                onClick={handleResetCode}
                className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700/60 hover:border-rose-700/60 text-[11px] font-mono flex items-center gap-1 shadow-md cursor-pointer transition-colors"
                title="Reset SQL query to default template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 text-[11px] font-mono flex items-center gap-1 shadow-md cursor-pointer"
                title="Copy SQL Query"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* DRAGGABLE VERTICAL RESIZER HANDLE (EDITOR VS SQL TESTCASE CONSOLE)    */}
          {/* --------------------------------------------------------------------- */}
          {!isConsoleMinimized && (
            <div
              onMouseDown={handleVerticalMouseDown}
              className="w-full h-2 hover:h-2.5 bg-slate-900 hover:bg-cyan-600/80 cursor-row-resize flex items-center justify-center transition-all z-20 border-y border-slate-800/80 group"
              title="Drag up or down to adjust SQL Testcases console height"
            >
              <div className="w-10 h-0.5 bg-slate-600 group-hover:text-white rounded-full transition-colors" />
            </div>
          )}

          {/* Bottom Console with Multiple Test Cases (Minimizable & Height-Adjustable) */}
          <div 
            style={{ height: isConsoleMinimized ? 40 : consoleHeight }}
            className="bg-slate-900/90 flex flex-col flex-shrink-0 transition-all duration-75 border-t border-slate-800 overflow-hidden"
          >
            
            {/* Console Header */}
            <div className="h-10 flex items-center justify-between px-4 bg-slate-950 border-b border-slate-800 flex-shrink-0">
              
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setConsoleTab('tables');
                    if (isConsoleMinimized) setIsConsoleMinimized(false);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    consoleTab === 'tables'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Table className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
                  <span>Test Tables</span>
                </button>

                <button
                  onClick={() => {
                    setConsoleTab('result');
                    if (isConsoleMinimized) setIsConsoleMinimized(false);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    consoleTab === 'result'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Query Result</span>
                  {judgeResult && (
                    <span className={`w-2 h-2 rounded-full ${judgeResult.status === 'ACCEPTED' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  )}
                </button>
              </div>

              {/* Execution Run, Submit & Minimize Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExecute(false)}
                  disabled={isExecuting}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                  <span>{isExecuting ? 'Running...' : 'Run Query'}</span>
                </button>

                <button
                  onClick={() => handleExecute(true)}
                  disabled={isExecuting}
                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5 fill-current" />
                  <span>{isExecuting ? 'Submitting...' : 'Submit'}</span>
                </button>

                {/* Minimize Console Button to get Full Height Code Screen */}
                <button
                  onClick={() => setIsConsoleMinimized(!isConsoleMinimized)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors ml-1"
                  title={isConsoleMinimized ? "Expand Testcases Console" : "Minimize Console to expand Editor"}
                >
                  {isConsoleMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

            </div>

            {/* Console Content Area (Hidden when minimized) */}
            {!isConsoleMinimized && (
              <div className="flex-1 p-4 overflow-y-auto font-mono text-xs select-text">
                
                {/* TAB A: INPUT TABLES & MULTI-TESTCASE SELECTOR */}
                {consoleTab === 'tables' && (
                  <div className="space-y-4">
                    {/* Testcase Switcher Pills */}
                    <div className="flex items-center space-x-2 pb-1 border-b border-slate-800/80 overflow-x-auto">
                      <span className="text-slate-400 text-[11px] font-sans font-bold flex items-center gap-1 mr-1">
                        <Layers className="w-3 h-3 text-cyan-400" /> Test Cases:
                      </span>
                      {sqlProblem.testCases.map((tc, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveTestCaseIdx(idx)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
                            activeTestCaseIdx === idx
                              ? 'bg-cyan-600 text-white shadow-md'
                              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          Case {idx + 1}
                        </button>
                      ))}
                    </div>

                    {/* Active Testcase Tables */}
                    <div className="space-y-3">
                      <div className="text-[11px] font-bold text-slate-300 font-sans">
                        {currentTestCase.name}
                      </div>

                      {currentTestCase.tables.map((tbl, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="text-[11px] font-bold text-cyan-400 uppercase font-sans">
                            Table: {tbl.tableName}
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                            <table className="w-full text-left text-[11px]">
                              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                                <tr>
                                  {tbl.schema.map((c, ci) => (
                                    <th key={ci} className="px-3 py-1 font-bold">{c.column}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                {tbl.rows.map((r, ri) => (
                                  <tr key={ri}>
                                    {r.map((val, vi) => (
                                      <td key={vi} className="px-3 py-1">{String(val)}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB B: QUERY RESULT */}
                {consoleTab === 'result' && (
                  <div className="space-y-3 font-sans">
                    {judgeResult ? (
                      <div className="space-y-3">
                        
                        {/* Status Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <div className="flex items-center space-x-2 font-black text-sm">
                            {judgeResult.status === 'ACCEPTED' ? (
                              <>
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                <span className="text-emerald-400">Accepted (Case {(judgeResult.testCaseIdx ?? activeTestCaseIdx) + 1})</span>
                              </>
                            ) : judgeResult.status === 'SYNTAX_ERROR' ? (
                              <>
                                <XCircle className="w-5 h-5 text-rose-400" />
                                <span className="text-rose-400">Syntax Error</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-amber-400" />
                                <span className="text-amber-400">Wrong Answer (Case {(judgeResult.testCaseIdx ?? activeTestCaseIdx) + 1})</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center space-x-3 font-mono text-xs text-slate-400">
                            <span>Execution Time: <strong className="text-slate-200">{judgeResult.executionTimeMs} ms</strong></span>
                          </div>
                        </div>

                        {/* Error Message */}
                        {judgeResult.errorMessage && (
                          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 font-mono text-xs whitespace-pre-wrap">
                            {judgeResult.errorMessage}
                          </div>
                        )}

                        {/* Output Tables Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                          
                          {/* Your Output */}
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase font-sans">Your Output:</div>
                            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-x-auto min-h-[60px]">
                              {judgeResult.columns.length > 0 ? (
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                                    <tr>
                                      {judgeResult.columns.map((c, i) => (
                                        <th key={i} className="px-3 py-1">{c}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                                    {judgeResult.rows.map((r, ri) => (
                                      <tr key={ri}>
                                        {r.map((val, vi) => (
                                          <td key={vi} className="px-3 py-1">{val === null ? 'null' : String(val)}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div className="p-3 text-slate-500 text-[11px]">Empty result set</div>
                              )}
                            </div>
                          </div>

                          {/* Expected Output */}
                          <div className="space-y-1">
                            <div className="text-[10px] text-emerald-400 font-bold uppercase font-sans">Expected Output:</div>
                            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-x-auto min-h-[60px]">
                              {judgeResult.expectedColumns.length > 0 ? (
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                                    <tr>
                                      {judgeResult.expectedColumns.map((c, i) => (
                                        <th key={i} className="px-3 py-1 text-emerald-400">{c}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800/60 text-emerald-300/90">
                                    {judgeResult.expectedRows.map((r, ri) => (
                                      <tr key={ri}>
                                        {r.map((val, vi) => (
                                          <td key={vi} className="px-3 py-1">{val === null ? 'null' : String(val)}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div className="p-3 text-slate-500 text-[11px]">Empty result set</div>
                              )}
                            </div>
                          </div>

                        </div>

                      </div>
                    ) : (
                      <div className="text-slate-500 py-6 text-center">
                        Click "Run Query" or "Submit" to execute your SQL against Case {activeTestCaseIdx + 1}.
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Floating Ask AI Button */}
          <button
            onClick={() => setIsRightAskAiOpen(true)}
            className="absolute bottom-4 right-4 z-20 w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-500 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-2xl shadow-cyan-600/60 border-2 border-cyan-300/40 flex items-center justify-center transition-all duration-300 hover:scale-110 group cursor-pointer"
            title="Ask SQL Teaching Assistant"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
            <span className="absolute right-14 bg-slate-900 border border-slate-800 text-slate-100 text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
              Ask AI
            </span>
          </button>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. SLIDE-OUT ASK AI TEACHING ASSISTANT POPUP (NON-BLURRED BACKGROUND)    */}
      {/* ========================================================================= */}
      {isRightAskAiOpen && (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-none animate-fadeIn">
          {/* Non-blurring click catcher overlay */}
          <div 
            onClick={() => setIsRightAskAiOpen(false)}
            className="absolute inset-0 bg-slate-950/25 pointer-events-auto cursor-pointer"
          />

          <div className="w-full max-w-lg h-full bg-slate-950/98 border-l border-cyan-500/40 shadow-2xl flex flex-col font-sans relative overflow-hidden pointer-events-auto animate-slideInRight z-10">
            
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-cyan-950/70 to-slate-950 border-b border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-inner">
                  <Database className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    SQL Teaching Assistant
                  </h3>
                  <p className="text-[10px] text-cyan-300 font-mono line-clamp-1">
                    Problem: {cleanTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {aiChatMessages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-[10px] font-mono"
                    title="Clear Chat History"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsRightAskAiOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors border border-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] font-mono no-scrollbar">
              <span className="text-cyan-400 font-bold flex-shrink-0 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-400" /> Prompts:
              </span>
              {[
                "Explain JOIN logic",
                "Debug my SQL query",
                "How to handle NULLs?",
                "Optimize GROUP BY"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendAiMessage(chip)}
                  className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-700/60 text-slate-300 hover:text-cyan-200 transition-all text-[11px] cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs select-text">
              {aiChatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[88%] p-3 rounded-2xl relative leading-relaxed select-text ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="font-sans pr-6">
                      <FormattedChatText text={msg.content} />
                    </div>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          setCopiedMsgIdx(idx);
                          setTimeout(() => setCopiedMsgIdx(null), 2000);
                        }}
                        className="absolute top-2 right-2 p-1 text-slate-500 hover:text-cyan-300 transition-colors cursor-pointer"
                        title="Copy message text"
                      >
                        {copiedMsgIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isAiReplying && (
                <div className="flex gap-2.5 items-center text-slate-400 text-xs font-mono">
                  <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>AI is analyzing SQL tables & query execution...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                placeholder="Ask about table joins, aggregations, or syntax errors..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              />
              <button
                onClick={() => handleSendAiMessage()}
                disabled={isAiReplying || !aiInputText.trim()}
                className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Insufficient Credits Gatekeeper Modal */}
      <InsufficientCreditsModal
        isOpen={isInsufficientCreditsOpen}
        onClose={() => setIsInsufficientCreditsOpen(false)}
        onOpenRecharge={() => {
          setIsInsufficientCreditsOpen(false);
          setIsWalletTopupOpen(true);
        }}
        requiredCost={insufficientMeta.cost}
        actionName={insufficientMeta.action}
      />

      {/* Wallet Top-up Modal */}
      <WalletTopupModal
        isOpen={isWalletTopupOpen}
        onClose={() => setIsWalletTopupOpen(false)}
        initialAmount={50}
      />

    </div>
  );
};
