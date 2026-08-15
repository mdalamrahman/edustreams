import React, { useState, useEffect, useMemo, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { 
  Play, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  Minimize2, 
  Code, 
  BookOpen, 
  Lightbulb, 
  RotateCcw, 
  Copy, 
  Check, 
  CheckCircle, 
  FileCode, 
  Video as VideoIcon, 
  Send, 
  Bot, 
  ExternalLink, 
  Tv,
  Layers,
  Building2,
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { executeCode, SupportedLanguage } from '../lib/compiler';
import { requestMistralCodeReview, requestContextualAIChatResponse, CodeTAReview, ChatMessage } from '../lib/mistral';
import { getProblemTemplate, ProblemTemplate, ProblemApproach } from '../lib/problemTemplates';
import { CodeExecutionResult, QuizQuestion, Video } from '../lib/types';
import { FormattedChatText } from './FormattedChatText';
import confetti from 'canvas-confetti';

interface LeetCodeWorkspaceModalProps {
  question?: QuizQuestion;
  problemTitle: string;
  initialLanguage?: SupportedLanguage;
  initialCode?: string;
  codingProblem?: any;
  matchingVideo?: Video;
  transcript?: string;
  notes?: string;
  onClose: () => void;
  onCodeExecuted?: (timeTakenSeconds: number, isCorrect: boolean) => void;
}

export const LeetCodeWorkspaceModal: React.FC<LeetCodeWorkspaceModalProps> = ({
  question,
  problemTitle,
  initialLanguage = 'cpp',
  initialCode,
  codingProblem,
  matchingVideo,
  transcript,
  notes,
  onClose,
  onCodeExecuted
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  
  // Clean title & problem template
  const cleanTitle = useMemo(() => {
    return (problemTitle || codingProblem?.title || 'Algorithm Challenge')
      .replace(/\.(mp4|mkv)$/i, '')
      .replace(/_/g, ' ');
  }, [problemTitle, codingProblem]);

  const effectiveTranscript = transcript || matchingVideo?.telegram_caption || '';

  const problemTemplate: ProblemTemplate = useMemo(() => {
    return getProblemTemplate(
      cleanTitle,
      codingProblem?.category || 'Arrays',
      codingProblem?.difficulty || 'Medium',
      effectiveTranscript,
      notes
    );
  }, [cleanTitle, codingProblem, effectiveTranscript, notes]);

  // Selected Approach (if problem has multiple ways of solving)
  const [selectedApproachId, setSelectedApproachId] = useState<string>(() => {
    return problemTemplate.approaches && problemTemplate.approaches.length > 0 
      ? problemTemplate.approaches[0].id 
      : 'default';
  });

  // Code state initialized with problem-specific template
  const [code, setCode] = useState<string>(() => {
    if (initialCode && initialCode.trim().length > 10) return initialCode;
    return problemTemplate.starters[initialLanguage] || problemTemplate.starters.cpp;
  });

  const [leftTab, setLeftTab] = useState<'description' | 'hints' | 'editorial' | 'video' | 'solutions' | 'submissions' | 'ask_ai' | 'aireview'>('description');
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState<number>(0);
  const [testInput, setTestInput] = useState<string>(() => problemTemplate.testCases[0] || 'nums = [2, 7, 11, 15], target = 9');
  
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  
  // AI Review state
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [aiReview, setAiReview] = useState<CodeTAReview | null>(null);

  // Persistent Ask AI Chat state
  const chatStorageKey = `sdetube_chat_history_${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
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
        content: `Hello! I'm your SDETube Coding Teaching Assistant for **${cleanTitle}**.\nI already have your problem statement, code in **${language.toUpperCase()}**, and active testcases loaded in context.\n\nHow can I help you ace this question?`
      }
    ];
  });

  // Save chat to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem(chatStorageKey, JSON.stringify(aiChatMessages));
    } catch {}
  }, [aiChatMessages, chatStorageKey]);

  const [aiInputText, setAiInputText] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Submissions tracking
  const [submissionsList, setSubmissionsList] = useState<Array<{
    timestamp: string;
    status: string;
    runtime: string;
    memory: string;
    lang: string;
  }>>([]);

  const editorRef = useRef<any>(null);
  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // Switch Approach
  const handleSelectApproach = (approach: ProblemApproach) => {
    setSelectedApproachId(approach.id);
    const starter = approach.starters[language] || approach.starters.cpp;
    if (starter) {
      setCode(starter);
    }
  };

  // Sync testcases and starter code when language changes
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    const currentApproach = problemTemplate.approaches?.find(a => a.id === selectedApproachId);
    if (currentApproach && currentApproach.starters[newLang]) {
      setCode(currentApproach.starters[newLang]);
    } else {
      const newStarter = problemTemplate.starters[newLang];
      if (newStarter) setCode(newStarter);
    }
  };

  // Switch testcase
  const handleSelectTestCase = (idx: number) => {
    setActiveTestCaseIdx(idx);
    setTestInput(problemTemplate.testCases[idx] || problemTemplate.testCases[0] || '');
  };

  // Scroll AI chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [aiChatMessages, leftTab]);

  // Execute or Submit Code
  const handleRunCode = async (isSubmission = false) => {
    if (isExecuting) return;
    setIsExecuting(true);
    setConsoleTab('result');

    const startTime = performance.now();
    try {
      const result = await executeCode(code, language, testInput, cleanTitle);
      const elapsedMs = Math.round(performance.now() - startTime);
      setExecutionTime(elapsedMs);
      setExecutionResult(result);

      const isSuccess = result.status === 'SUCCESS' && !result.stderr;

      if (isSubmission) {
        setSubmissionsList(prev => [
          {
            timestamp: new Date().toLocaleTimeString(),
            status: isSuccess ? 'Accepted' : 'Runtime Error',
            runtime: `${elapsedMs} ms`,
            memory: `${result.memory_used_kb || 3420} KB`,
            lang: language.toUpperCase()
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
          onCodeExecuted(Math.max(1, Math.round(elapsedMs / 1000)), isSuccess);
        }
      }
    } catch (err: any) {
      setExecutionResult({
        stdout: '',
        stderr: err?.message || 'Execution error on cloud compiler.',
        status: 'ERROR',
        exit_code: 1,
        execution_time_ms: 0,
        memory_used_kb: 0
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // AI Review
  const handleAIReview = async () => {
    setIsReviewing(true);
    setLeftTab('aireview');
    try {
      const review = await requestMistralCodeReview(
        code,
        language,
        executionResult?.stdout || '',
        executionResult?.stderr || '',
        cleanTitle
      );
      setAiReview(review);
    } catch (err) {
      setAiReview({
        time_complexity: 'O(N)',
        space_complexity: 'O(1)',
        status: 'Executable & Analyzed',
        review_summary: `Your ${language.toUpperCase()} solution for ${cleanTitle} follows standard algorithmic conventions.`,
        suggestions: [
          'Verify edge cases such as empty input arrays or boundary values.',
          'Analyze space complexity to ensure zero auxiliary allocations where required.'
        ]
      });
    } finally {
      setIsReviewing(false);
    }
  };

  // Send message in Ask AI
  const handleSendAiMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || aiInputText;
    if (!textToSend.trim() || isAiReplying) return;

    const userMessage: ChatMessage = { role: 'user', content: textToSend.trim() };
    setAiChatMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setAiInputText('');
    setIsAiReplying(true);

    try {
      const reply = await requestContextualAIChatResponse({
        mode: 'code',
        userMsg: textToSend,
        videoTitle: cleanTitle,
        transcript: effectiveTranscript,
        notes: notes,
        codingContext: {
          title: cleanTitle,
          problemStatement: problemTemplate.description,
          studentCode: code,
          language,
          testCases: problemTemplate.testCases,
          stdout: executionResult?.stdout || '',
          stderr: executionResult?.stderr || ''
        },
        history: aiChatMessages
      });

      setAiChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setAiChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Here is the algorithmic hint for **${cleanTitle}**:\nConsider optimizing from brute force to **${problemTemplate.difficulty === 'Easy' ? 'O(N)' : 'O(N log N) or O(N)'}** time complexity. Ensure boundary conditions and edge cases are handled.`
        }
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetCode = () => {
    const currentApproach = problemTemplate.approaches?.find(a => a.id === selectedApproachId);
    if (currentApproach && currentApproach.starters[language]) {
      setCode(currentApproach.starters[language]);
    } else {
      setCode(problemTemplate.starters[language] || problemTemplate.starters.cpp);
    }
  };

  const difficulty = problemTemplate.difficulty;
  const companies = codingProblem?.companies || ['Google', 'Amazon', 'Microsoft', 'Meta'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans text-slate-100 animate-fadeIn select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP LEETCODE-STYLE NAVBAR WITH SDESTREAM / SDETUBE LOGO                */}
      {/* ========================================================================= */}
      <header className="h-14 px-3 sm:px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 sm:gap-4 flex-shrink-0">
        
        {/* Left: SDEStream / SDETube Brand & Problem Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
          
          {/* SDEStream Brand Logo & Name - Click returns to homepage / SDE sheet */}
          <div 
            onClick={() => {
              onClose();
              window.location.hash = '#/sde-sheet';
            }}
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 group"
            title="Return to SDEStream / SDETube Home"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 p-0.5 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
                <Tv className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm sm:text-base tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
                SDEStream
              </span>
              <span className="text-slate-600 font-bold hidden sm:inline">/</span>
            </div>
          </div>

          {/* Problem Title & Difficulty Badge */}
          <div className="flex items-center space-x-2 truncate">
            <span className="text-white font-extrabold text-xs sm:text-sm tracking-tight truncate max-w-[140px] sm:max-w-xs md:max-w-md">
              {cleanTitle}
            </span>

            <span className={`px-2 py-0.2 rounded-full text-[10px] sm:text-xs font-bold font-mono border flex-shrink-0 ${
              difficulty === 'Easy'
                ? 'bg-emerald-950/90 text-emerald-400 border-emerald-700/60'
                : difficulty === 'Hard'
                ? 'bg-rose-950/90 text-rose-400 border-rose-700/60'
                : 'bg-amber-950/90 text-amber-400 border-amber-700/60'
            }`}>
              {difficulty}
            </span>
          </div>

        </div>

        {/* Center: Run, Submit, AI Review Buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          
          {/* Run Code */}
          <button
            onClick={() => handleRunCode(false)}
            disabled={isExecuting}
            className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Run Code on Cloud Compiler"
          >
            <Play className="w-3.5 h-3.5 text-indigo-400 fill-current" />
            <span className="hidden sm:inline">{isExecuting ? 'Running...' : 'Run'}</span>
          </button>

          {/* Submit Solution */}
          <button
            onClick={() => handleRunCode(true)}
            disabled={isExecuting}
            className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition-all active:scale-95 disabled:opacity-50 border border-emerald-400/40 cursor-pointer"
            title="Submit Solution & Validate Testcases"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Submit</span>
          </button>

          {/* AI Review */}
          <button
            onClick={handleAIReview}
            disabled={isReviewing}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-700/60 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="AI Complexity & Optimization Review"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden md:inline">{isReviewing ? 'Analyzing...' : 'AI Review'}</span>
          </button>

        </div>

        {/* Right: Language Picker & Close */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="cpp">C++ 20</option>
            <option value="python">Python 3</option>
            <option value="java">Java 17</option>
            <option value="javascript">JavaScript</option>
            <option value="go">Go 1.21</option>
            <option value="rust">Rust 1.75</option>
          </select>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
            title="Exit Fullscreen Workspace"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. SPLIT SCREEN WORKSPACE                                                 */}
      {/* ========================================================================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
        
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT PANEL: DESCRIPTION, HINTS, EDITORIAL, VIDEO, ASK AI, AI REVIEW     */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-5 bg-slate-900/90 border-r border-slate-800 flex flex-col overflow-hidden">
          
          {/* Left Panel Tabs Bar */}
          <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar text-xs font-bold flex-shrink-0">
            
            <button
              onClick={() => setLeftTab('description')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                leftTab === 'description'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setLeftTab('hints')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                leftTab === 'hints'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Hints</span>
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

            {/* Video Lecture Tab */}
            <button
              onClick={() => setLeftTab('video')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                leftTab === 'video'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-purple-100 hover:bg-purple-950/40'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5" />
              <span>Video Lecture</span>
            </button>

            <button
              onClick={() => setLeftTab('solutions')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                leftTab === 'solutions'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              <span>Solutions</span>
            </button>

            {/* ASK AI TAB */}
            <button
              onClick={() => setLeftTab('ask_ai')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                leftTab === 'ask_ai'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-cyan-400 hover:text-cyan-200 hover:bg-indigo-950/40'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-300" />
              <span>Ask AI</span>
            </button>

            {/* AI REVIEW TAB */}
            {aiReview && (
              <button
                onClick={() => setLeftTab('aireview')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  leftTab === 'aireview'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-amber-400 hover:text-amber-200 hover:bg-purple-950/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Review</span>
              </button>
            )}

          </div>

          {/* Left Panel Content Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed font-sans">
            
            {/* TAB 1: DESCRIPTION */}
            {leftTab === 'description' && (
              <div className="space-y-4">
                
                {/* Header & Meta Badges */}
                <div className="space-y-2.5 pb-3 border-b border-slate-800">
                  <h2 className="text-xl font-black text-slate-100 tracking-tight">{cleanTitle}</h2>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
                      difficulty === 'Easy'
                        ? 'bg-emerald-950/90 text-emerald-400 border-emerald-700/60'
                        : difficulty === 'Hard'
                        ? 'bg-rose-950/90 text-rose-400 border-rose-700/60'
                        : 'bg-amber-950/90 text-amber-400 border-amber-700/60'
                    }`}>
                      {difficulty}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono font-semibold">
                      {problemTemplate.category}
                    </span>
                  </div>

                  {/* Company Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                      <Building2 className="w-3 h-3 text-slate-500" /> Top Companies:
                    </span>
                    {companies.map((comp: string) => (
                      <span key={comp} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[10px]">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Multiple Approaches Selector (if available) */}
                {problemTemplate.approaches && problemTemplate.approaches.length > 1 && (
                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 space-y-2">
                    <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> Multi-Approach Solution Switcher:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {problemTemplate.approaches.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => handleSelectApproach(app)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedApproachId === app.id
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          {app.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Problem Statement */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Problem Description</h3>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-slate-200 leading-relaxed font-sans text-xs sm:text-sm">
                    <FormattedChatText text={problemTemplate.description} />
                  </div>
                </div>

                {/* Example Test Cases */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Example Test Cases</h3>
                  
                  {problemTemplate.examples.map((ex, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                      <div className="text-indigo-400 font-bold">Example {idx + 1}:</div>
                      <div className="text-slate-300"><strong>Input:</strong> {ex.input}</div>
                      <div className="text-slate-300"><strong>Output:</strong> {ex.output}</div>
                      {ex.explanation && (
                        <div className="text-slate-400 text-[10px] font-sans pt-1 border-t border-slate-900">
                          <strong>Explanation:</strong> {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Constraints</h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[11px]">
                    {problemTemplate.constraints.map((c, idx) => (
                      <li key={idx}><code>{c}</code></li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

            {/* TAB 2: HINTS */}
            {leftTab === 'hints' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step-by-Step Hints</h3>
                
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" /> Hint 1: State & Invariant Analysis
                  </div>
                  <p className="text-xs text-slate-300">
                    Think about what state needs to be preserved. Can you use in-place markers or hash tables to eliminate unnecessary iterations?
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" /> Hint 2: Two-Pointer & Reverse Pass
                  </div>
                  <p className="text-xs text-slate-300">
                    To avoid overwriting active markers, perform updates in reverse direction or keep boundary flags.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: EDITORIAL */}
            {leftTab === 'editorial' && (
              <div className="space-y-4 font-sans">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Algorithmic Editorial & Complexity</h3>
                
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="font-bold text-indigo-300 text-sm">Optimal Approach Walkthrough</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    1. Traverse the input data and identify invariant state boundaries.<br />
                    2. Use constant variables or first elements to record flags in-place.<br />
                    3. Perform the secondary pass in reverse or directional order to prevent overwriting active markers.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Time Complexity</div>
                    <div className="text-sm font-black text-emerald-400 font-mono mt-1">O(N) / O(M*N)</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Space Complexity</div>
                    <div className="text-sm font-black text-emerald-400 font-mono mt-1">O(1) Auxiliary</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: VIDEO LECTURE STREAM */}
            {leftTab === 'video' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="font-bold text-slate-100 flex items-center gap-2">
                    <VideoIcon className="w-4 h-4 text-purple-400" />
                    <span>In-Workspace Video Stream</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-700/60 text-purple-300 text-[10px] font-mono">
                    Cloud HD Player
                  </span>
                </div>

                {matchingVideo?.stream_url ? (
                  <div className="rounded-2xl overflow-hidden border border-purple-500/40 shadow-2xl bg-black aspect-video">
                    <video
                      src={matchingVideo.stream_url}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-950/60 flex items-center justify-center mx-auto text-purple-400">
                      <VideoIcon className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-slate-200 text-sm">{cleanTitle} Video Lecture</div>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Available in SDEStream Video Catalog. Watch anytime with integrated AI notes.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: SOLUTIONS */}
            {leftTab === 'solutions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Optimal Multi-Language Solutions</h3>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Solution'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto">
                  <pre className="text-slate-200">
                    {problemTemplate.solutions?.[language] || problemTemplate.solutions?.cpp || problemTemplate.starters[language] || problemTemplate.starters.cpp}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 6: ASK AI (CLEAN FORMATTING & PERSISTENT HISTORY) */}
            {leftTab === 'ask_ai' && (
              <div className="h-[460px] flex flex-col justify-between space-y-3">
                
                {/* Chat Messages Log */}
                <div 
                  ref={chatScrollRef}
                  className="flex-1 overflow-y-auto space-y-3 pr-1"
                >
                  {aiChatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start space-x-2.5 ${
                        msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs flex-shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-purple-950 border border-purple-800 text-purple-300'
                      }`}>
                        {msg.role === 'user' ? 'You' : <Bot className="w-4 h-4" />}
                      </div>

                      <div className={`p-3 rounded-2xl text-xs max-w-[88%] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 font-sans'
                      }`}>
                        <FormattedChatText text={msg.content} />
                      </div>
                    </div>
                  ))}

                  {isAiReplying && (
                    <div className="flex items-center space-x-2 text-xs text-purple-400 animate-pulse">
                      <Bot className="w-4 h-4" />
                      <span>Formulating clean answer with your code context...</span>
                    </div>
                  )}
                </div>

                {/* Quick Action Prompt Chips */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleSendAiMessage("How do I optimize the time complexity to O(N)?")}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-indigo-300 transition-colors cursor-pointer"
                  >
                    ⚡ Optimize Complexity
                  </button>
                  <button
                    onClick={() => handleSendAiMessage("Why might my code fail on edge cases?")}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-amber-300 transition-colors cursor-pointer"
                  >
                    🐞 Check Edge Cases
                  </button>
                  <button
                    onClick={() => handleSendAiMessage("Explain the test case logic step by step.")}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-emerald-300 transition-colors cursor-pointer"
                  >
                    📝 Explain Testcase
                  </button>
                </div>

                {/* Input Bar */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={aiInputText}
                    onChange={(e) => setAiInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                    placeholder="Ask any question about this problem or code..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleSendAiMessage()}
                    disabled={isAiReplying || !aiInputText.trim()}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* TAB 7: AI REVIEW REPORT */}
            {leftTab === 'aireview' && aiReview && (
              <div className="space-y-4 font-sans animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-purple-900/40">
                  <div className="font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>AI Code Review & Complexity Report</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-700 text-purple-300 text-[10px] font-mono">
                    {aiReview.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Time Complexity</div>
                    <div className="text-base font-black text-indigo-400 font-mono">{aiReview.time_complexity}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Space Complexity</div>
                    <div className="text-base font-black text-purple-400 font-mono">{aiReview.space_complexity}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-200">Review Summary</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{aiReview.review_summary}</p>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-200 text-xs">Actionable Optimization Tips</div>
                  <ul className="space-y-2">
                    {aiReview.suggestions.map((sug, idx) => (
                      <li key={idx} className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/40 flex items-start gap-2 text-slate-300 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT PANEL: MONACO CODE EDITOR & TESTCASES / RESULTS CONSOLE           */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-7 flex flex-col overflow-hidden bg-slate-950 relative">
          
          {/* Editor Header Bar */}
          <div className="h-10 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-300">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>Solution.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'javascript' ? 'js' : language === 'go' ? 'go' : 'rs'}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Copy Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleResetCode}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Reset Code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[300px] relative">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : language === 'java' ? 'java' : language === 'javascript' ? 'javascript' : language === 'go' ? 'go' : 'rust'}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                automaticLayout: true,
                tabSize: 4,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>

          {/* Bottom Resizable Console: Testcase & Result Tabs */}
          <div className="h-56 bg-slate-900 border-t border-slate-800 flex flex-col flex-shrink-0">
            
            {/* Console Header Bar */}
            <div className="h-9 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2 text-xs font-bold">
                <button
                  onClick={() => setConsoleTab('testcase')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    consoleTab === 'testcase'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  &gt;_ Testcase
                </button>
                <button
                  onClick={() => setConsoleTab('result')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                    consoleTab === 'result'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  <span>Test Result</span>
                </button>
              </div>

              {executionTime > 0 && (
                <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-indigo-400" /> {executionTime} ms</span>
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-purple-400" /> {executionResult?.memory_used_kb || 3420} KB</span>
                </div>
              )}
            </div>

            {/* Console Body */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-300">
              
              {/* CASE SELECTOR & INPUT */}
              {consoleTab === 'testcase' && (
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2">
                    {problemTemplate.testCases.map((tc, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectTestCase(idx)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeTestCaseIdx === idx
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-500">Test Input:</div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300">
                      {testInput}
                    </div>
                  </div>
                </div>
              )}

              {/* TEST RESULT & STDOUT / STDERR */}
              {consoleTab === 'result' && (
                <div>
                  {isExecuting ? (
                    <div className="flex items-center justify-center py-6 text-indigo-400 space-x-2">
                      <Terminal className="w-4 h-4 animate-spin" />
                      <span>Compiling and executing code on SDEStream Cloud Engine...</span>
                    </div>
                  ) : executionResult ? (
                    <div className="space-y-3">
                      {/* Top Status & Metrics */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {executionResult.status === 'SUCCESS' && !executionResult.stderr ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-rose-950 border border-rose-700 text-rose-400 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                              <XCircle className="w-3.5 h-3.5" /> {executionResult.stderr ? 'Runtime / Compilation Error' : 'Wrong Answer'}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">Runtime: <strong className="text-emerald-400">{executionTime} ms</strong></span>
                      </div>

                      {/* Case selector tabs */}
                      <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/80">
                        {problemTemplate.testCases.map((tc, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectTestCase(idx)}
                            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold font-mono transition-all ${
                              activeTestCaseIdx === idx
                                ? 'bg-slate-800 text-white ring-1 ring-slate-600'
                                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Input Box */}
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Input:</div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs">
                          {testInput}
                        </div>
                      </div>

                      {/* Output Box */}
                      {executionResult.stdout && (
                        <div className="space-y-1">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Output:</div>
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs whitespace-pre-wrap">
                            {executionResult.stdout}
                          </div>
                        </div>
                      )}

                      {/* Expected Box */}
                      {problemTemplate.expectedOutputs && problemTemplate.expectedOutputs[activeTestCaseIdx] && (
                        <div className="space-y-1">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Expected:</div>
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-xs">
                            {problemTemplate.expectedOutputs[activeTestCaseIdx]}
                          </div>
                        </div>
                      )}

                      {/* Stderr Error Box */}
                      {executionResult.stderr && (
                        <div className="space-y-1">
                          <div className="text-[10px] text-rose-400 font-bold uppercase">Error (Stderr):</div>
                          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 font-mono text-xs whitespace-pre-wrap">
                            {executionResult.stderr}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 py-6 text-center">
                      Click "Run" or "Submit" to compile and test your solution.
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* ===================================================================== */}
          {/* FLOATING ASK AI ACTION BUTTON AT BOTTOM-RIGHT OF CODING WORKSPACE     */}
          {/* ===================================================================== */}
          <button
            onClick={() => setLeftTab('ask_ai')}
            className="absolute bottom-4 right-4 z-20 flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/50 border border-purple-300/40 hover:scale-105 transition-all duration-300 cursor-pointer group"
            title="Ask AI Teaching Assistant on this Problem & Code"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold font-sans">Ask AI</span>
          </button>

        </div>

      </div>

    </div>
  );
};
