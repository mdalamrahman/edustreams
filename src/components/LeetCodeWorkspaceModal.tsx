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
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  GripVertical,
  GripHorizontal
} from 'lucide-react';
import { executeCode, SupportedLanguage } from '../lib/compiler';
import { requestMistralCodeReview, requestContextualAIChatResponse, requestAIOptimalSolution, OptimalSolutionResponse, CodeTAReview, ChatMessage } from '../lib/mistral';
import { getProblemTemplate, fetchEnrichedProblem, ProblemTemplate, ProblemApproach } from '../lib/problemTemplates';
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

  const [problemTemplate, setProblemTemplate] = useState<ProblemTemplate>(() => {
    return getProblemTemplate(
      cleanTitle,
      codingProblem?.category || 'Arrays',
      codingProblem?.difficulty || 'Medium',
      effectiveTranscript,
      notes
    );
  });

  const [isLoadingEnriched, setIsLoadingEnriched] = useState<boolean>(true);

  // Fetch enriched LeetCode problem description, examples, constraints & starter code from Cloudflare R2
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingEnriched(true);

    const slug = codingProblem?.slug || codingProblem?.leetcode || cleanTitle;
    fetchEnrichedProblem(
      slug,
      codingProblem?.category || 'Arrays',
      codingProblem?.difficulty || 'Medium',
      effectiveTranscript,
      notes
    ).then((enriched) => {
      if (!isCancelled && enriched) {
        setProblemTemplate(enriched);
        setIsLoadingEnriched(false);
        if (!initialCode || initialCode.trim().length < 10) {
          setCode(enriched.starters[language] || enriched.starters.cpp || '');
        }
        if (enriched.testCases && enriched.testCases.length > 0) {
          setTestInput(enriched.testCases[0]);
        }
      }
    }).catch(() => {
      if (!isCancelled) setIsLoadingEnriched(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [cleanTitle, codingProblem, effectiveTranscript, notes, language, initialCode]);

  // Selected Approach
  const [selectedApproachId, setSelectedApproachId] = useState<string>(() => {
    return problemTemplate.approaches && problemTemplate.approaches.length > 0 
      ? problemTemplate.approaches[0].id 
      : 'default';
  });

  // Code state
  const [code, setCode] = useState<string>(() => {
    if (initialCode && initialCode.trim().length > 10) return initialCode;
    return problemTemplate.starters[initialLanguage] || problemTemplate.starters.cpp;
  });

  const [leftTab, setLeftTab] = useState<'description' | 'hints' | 'editorial' | 'video' | 'solutions' | 'submissions' | 'aireview'>('description');
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState<number>(0);
  const [testInput, setTestInput] = useState<string>(() => problemTemplate.testCases[0] || 'nums = [2, 7, 11, 15], target = 9');
  
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [executionTime, setExecutionTime] = useState<number>(0);
  
  // Resizable Horizontal Split Pane (Left vs Right)
  const [splitPercent, setSplitPercent] = useState<number>(42);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Resizable Vertical Console Height (Editor vs Bottom Testcases)
  const [consoleHeight, setConsoleHeight] = useState<number>(270);
  const [isVerticalDragging, setIsVerticalDragging] = useState<boolean>(false);

  // Minimizable console state
  const [isConsoleMinimized, setIsConsoleMinimized] = useState<boolean>(false);

  // Copy states
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedDescription, setCopiedDescription] = useState<boolean>(false);
  const [copiedReviewText, setCopiedReviewText] = useState<boolean>(false);
  const [copiedHints, setCopiedHints] = useState<boolean>(false);
  const [copiedEditorial, setCopiedEditorial] = useState<boolean>(false);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);
  
  // Slide-out Ask AI popup on the RIGHT
  const [isRightAskAiOpen, setIsRightAskAiOpen] = useState<boolean>(false);

  // AI Review state
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [aiReview, setAiReview] = useState<CodeTAReview | null>(null);

  // Solutions tab state
  const [solutionLang, setSolutionLang] = useState<SupportedLanguage>(language);
  const [aiGeneratedSolutions, setAiGeneratedSolutions] = useState<Record<string, OptimalSolutionResponse>>({});
  const [isGeneratingSolution, setIsGeneratingSolution] = useState<boolean>(false);
  const [copiedSolutionCode, setCopiedSolutionCode] = useState<boolean>(false);
  const [appliedSolutionMsg, setAppliedSolutionMsg] = useState<boolean>(false);

  const handleGenerateSolution = async (langToGen: SupportedLanguage = solutionLang) => {
    setIsGeneratingSolution(true);
    try {
      const sol = await requestAIOptimalSolution(
        cleanTitle,
        problemTemplate.description,
        langToGen,
        problemTemplate.starters[langToGen]
      );
      if (sol) {
        setAiGeneratedSolutions(prev => ({ ...prev, [langToGen]: sol }));
      }
    } catch (e) {
      console.warn('AI Solution Generation Error:', e);
    } finally {
      setIsGeneratingSolution(false);
    }
  };

  const handleApplySolutionToEditor = (solCode: string, langToApply: SupportedLanguage) => {
    setLanguage(langToApply);
    setCode(solCode);
    setAppliedSolutionMsg(true);
    setTimeout(() => setAppliedSolutionMsg(false), 2000);
  };

  const handleCopySolutionText = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedSolutionCode(true);
    setTimeout(() => setCopiedSolutionCode(false), 2000);
  };

  // Dragging handlers for horizontal split pane
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

  // Dragging handlers for vertical console resizer
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
        content: `Hi! I'm your dedicated SDETube Teaching Assistant for **${cleanTitle}**.\n\nI have complete context of the lecture transcript, starter code, and active test harness. Ask me anything!`
      }
    ];
  });

  const [aiInputText, setAiInputText] = useState<string>('');
  const [isAiReplying, setIsAiReplying] = useState<boolean>(false);
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

  // Submission History State
  const [submissionsList, setSubmissionsList] = useState<{
    timestamp: string;
    status: string;
    runtime: string;
    memory: string;
    lang: string;
  }[]>([]);

  // Update starter code when language or approach changes
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (problemTemplate.approaches && problemTemplate.approaches.length > 0) {
      const curApp = problemTemplate.approaches.find(a => a.id === selectedApproachId) || problemTemplate.approaches[0];
      setCode(curApp.starters[newLang] || problemTemplate.starters[newLang]);
    } else {
      setCode(problemTemplate.starters[newLang] || problemTemplate.starters.cpp);
    }
  };

  const handleSelectApproach = (approach: ProblemApproach) => {
    setSelectedApproachId(approach.id);
    if (approach.starters[language]) {
      setCode(approach.starters[language]);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(problemTemplate.description);
    setCopiedDescription(true);
    setTimeout(() => setCopiedDescription(false), 2000);
  };

  const handleCopyReviewText = () => {
    if (!aiReview) return;
    const reportText = `AI Code Review: ${cleanTitle}\nStatus: ${aiReview.status}\nTime Complexity: ${aiReview.time_complexity}\nSpace Complexity: ${aiReview.space_complexity}\n\nSummary:\n${aiReview.review_summary}\n\nOptimization Tips:\n${aiReview.suggestions.join('\n')}`;
    navigator.clipboard.writeText(reportText);
    setCopiedReviewText(true);
    setTimeout(() => setCopiedReviewText(false), 2000);
  };

  const handleCopyHints = () => {
    const hintsText = "Hint 1: State & Invariant Analysis\nThink about what state needs to be preserved. Can you use in-place markers or hash tables to eliminate unnecessary iterations?\n\nHint 2: Two-Pointer & Reverse Pass\nTo avoid overwriting active markers, perform updates in reverse direction or keep boundary flags.";
    navigator.clipboard.writeText(hintsText);
    setCopiedHints(true);
    setTimeout(() => setCopiedHints(false), 2000);
  };

  const handleCopyEditorial = () => {
    const editContent = `Optimal Approach Walkthrough:\n1. Traverse the input data and identify invariant state boundaries.\n2. Use constant variables or first elements to record flags in-place.\n3. Perform the secondary pass in reverse or directional order to prevent overwriting active markers.\n\nTime Complexity: O(N) / O(M*N)\nSpace Complexity: O(1) Auxiliary`;
    navigator.clipboard.writeText(editContent);
    setCopiedEditorial(true);
    setTimeout(() => setCopiedEditorial(false), 2000);
  };

  const handleClearChat = () => {
    const initialMsg: ChatMessage = {
      role: 'assistant',
      content: `Chat history reset. How can I assist you with **${cleanTitle}**?`
    };
    setAiChatMessages([initialMsg]);
    try {
      localStorage.removeItem(chatStorageKey);
    } catch {}
  };

  // Strict Output Validation Logic (Prevents empty or wrong solutions from getting Accepted)
  const currentExpectedOutput = useMemo(() => {
    return problemTemplate.expectedOutputs?.[activeTestCaseIdx] || problemTemplate.expectedOutputs?.[0] || '';
  }, [problemTemplate, activeTestCaseIdx]);

  const normalizeOutput = (str: string) => {
    return (str || '')
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\s+/g, '')
      .toLowerCase();
  };

  const isOutputValid = (stdout: string, stderr: string): boolean => {
    if (stderr && stderr.trim().length > 0) return false;
    if (!stdout || !stdout.trim()) return false;
    
    // If output is default placeholder string without real logic execution
    if (stdout.includes('Solution executed successfully with test input') && currentExpectedOutput && !currentExpectedOutput.includes('Solution executed')) {
      return false;
    }
    
    if (!currentExpectedOutput) return stdout.trim().length > 0;
    return normalizeOutput(stdout) === normalizeOutput(currentExpectedOutput);
  };

  // Run Code / Submit
  const handleExecute = async (isSubmission: boolean = false) => {
    setIsExecuting(true);
    setConsoleTab('result');
    if (isConsoleMinimized) setIsConsoleMinimized(false);
    const start = Date.now();

    try {
      const result = await executeCode(code, language, testInput, cleanTitle);
      const elapsedMs = Date.now() - start;
      setExecutionTime(elapsedMs);
      setExecutionResult(result);

      // Strict Acceptance Check
      const isSuccess = result.status === 'SUCCESS' && isOutputValid(result.stdout, result.stderr);

      if (isSubmission) {
        setSubmissionsList(prev => [
          {
            timestamp: new Date().toLocaleTimeString(),
            status: isSuccess ? 'Accepted' : result.stderr ? 'Runtime Error' : 'Wrong Answer',
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
        { role: 'assistant', content: 'Could not fetch AI reasoning. Please check your internet connection or API quota.' }
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const difficulty = codingProblem?.difficulty || problemTemplate.difficulty || 'Medium';
  const companies = codingProblem?.companies || ['Amazon', 'Google', 'Microsoft', 'Meta'];

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col font-sans select-none animate-fadeIn overflow-hidden ${isDragging ? 'cursor-col-resize select-none' : isVerticalDragging ? 'cursor-row-resize select-none' : ''}`}>
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR                                                             */}
      {/* ========================================================================= */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0 z-10">
        
        {/* Brand & Problem Title */}
        <div className="flex items-center space-x-3 truncate">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-800 transition-colors group cursor-pointer"
            title="Return to SDE Sheet"
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md">
              <Tv className="w-4 h-4 text-purple-200" />
            </div>
            <span className="text-sm font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-sky-300 group-hover:opacity-90">
              SDEStream
            </span>
          </button>

          <span className="text-slate-600 font-mono">/</span>

          <div className="flex items-center space-x-2 truncate">
            <h1 className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-xs sm:max-w-md">
              {cleanTitle}
            </h1>
            <span className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
              difficulty === 'Easy'
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                : difficulty === 'Hard'
                ? 'bg-rose-950/80 text-rose-400 border-rose-700/60'
                : 'bg-amber-950/80 text-amber-400 border-amber-700/60'
            }`}>
              {difficulty}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Ask AI Top Action Button with Icon and Tooltip on Hover */}
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

          {/* AI Review Button */}
          <button
            onClick={handleAIReview}
            disabled={isReviewing}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Generate AI Code Review & Complexity Report"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isReviewing ? 'Analyzing...' : 'AI Review'}</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center space-x-1.5">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="cpp">C++ 20 (STL)</option>
              <option value="python">Python 3</option>
              <option value="java">Java 17</option>
              <option value="javascript">JavaScript</option>
              <option value="go">Go 1.21</option>
              <option value="rust">Rust 1.75</option>
            </select>

            <button
              onClick={() => setCode(problemTemplate.starters[language] || problemTemplate.starters.cpp)}
              className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Reset code to clean official starter signature"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

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
      {/* 2. RESIZABLE SPLIT SCREEN WORKSPACE                                       */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT PANEL: DESCRIPTION, HINTS, EDITORIAL, VIDEO, SOLUTIONS, AI REVIEW   */}
        {/* ----------------------------------------------------------------------- */}
        <div 
          style={{ width: `${splitPercent}%` }}
          className="hidden lg:flex bg-slate-900/90 border-r border-slate-800 flex-col overflow-hidden transition-all duration-75"
        >
          
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

            <button
              onClick={() => setLeftTab('video')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                leftTab === 'video'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Video</span>
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
              <span>Solutions</span>
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
          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed font-sans select-text">
            
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

                {/* Problem Statement with Copy Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Problem Description</h3>
                    <button
                      onClick={handleCopyDescription}
                      className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                      title="Copy Problem Statement"
                    >
                      {copiedDescription ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDescription ? 'Copied' : 'Copy Description'}</span>
                    </button>
                  </div>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step-by-Step Hints</h3>
                  <button
                    onClick={handleCopyHints}
                    className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                  >
                    {copiedHints ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHints ? 'Copied' : 'Copy Hints'}</span>
                  </button>
                </div>
                
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
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Algorithmic Editorial</h3>
                  <button
                    onClick={handleCopyEditorial}
                    className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
                  >
                    {copiedEditorial ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEditorial ? 'Copied' : 'Copy Editorial'}</span>
                  </button>
                </div>
                
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
                  <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 text-slate-400">
                    <VideoIcon className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">No direct video stream attached to this specific problem item.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: SOLUTIONS */}
            {leftTab === 'solutions' && (() => {
              const staticSol = problemTemplate.solutions?.[solutionLang];
              const aiSol = aiGeneratedSolutions[solutionLang];
              const activeSolutionCode = aiSol?.code || (staticSol && staticSol !== problemTemplate.starters[solutionLang] ? staticSol : null);
              const hasWorkedSolution = Boolean(activeSolutionCode);

              return (
                <div className="space-y-4 font-sans">
                  {/* Top Bar: Language Tabs & Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    {/* Solution Language Pills */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto no-scrollbar">
                      {(['cpp', 'python', 'java', 'javascript', 'go', 'rust'] as SupportedLanguage[]).map((langKey) => (
                        <button
                          key={langKey}
                          onClick={() => setSolutionLang(langKey)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            solutionLang === langKey
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                          }`}
                        >
                          {langKey === 'cpp' ? 'C++' : langKey === 'python' ? 'Python' : langKey === 'java' ? 'Java' : langKey === 'javascript' ? 'JS' : langKey === 'go' ? 'Go' : 'Rust'}
                        </button>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGenerateSolution(solutionLang)}
                        disabled={isGeneratingSolution}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-purple-700/60 text-purple-300 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        title="Derive fresh optimal solution with SDETube AI"
                      >
                        <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isGeneratingSolution ? 'animate-spin' : 'animate-pulse'}`} />
                        <span>{isGeneratingSolution ? 'Deriving...' : hasWorkedSolution ? 'Regenerate' : 'AI Generate'}</span>
                      </button>

                      {hasWorkedSolution && activeSolutionCode && (
                        <>
                          <button
                            onClick={() => handleCopySolutionText(activeSolutionCode)}
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                            title="Copy Solution Code"
                          >
                            {copiedSolutionCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSolutionCode ? 'Copied' : 'Copy'}</span>
                          </button>

                          <button
                            onClick={() => handleApplySolutionToEditor(activeSolutionCode, solutionLang)}
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
                            title="Load code directly into editor"
                          >
                            <Code className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{appliedSolutionMsg ? 'Applied!' : 'Apply to Editor'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Complexity & Approach Header */}
                  {hasWorkedSolution && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approach</div>
                        <div className="text-xs font-bold text-indigo-400 mt-0.5 truncate">
                          {aiSol?.approachName || 'Optimal Reference'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Time Complexity</div>
                        <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                          {aiSol?.timeComplexity || 'O(N) / Optimal'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Space Complexity</div>
                        <div className="text-xs font-mono font-bold text-cyan-400 mt-0.5">
                          {aiSol?.spaceComplexity || 'O(1) Auxiliary'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Solution Code Frame with Monaco Editor & Line Numbers */}
                  {hasWorkedSolution && activeSolutionCode ? (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
                        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400 font-bold flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                            Solution.{solutionLang === 'cpp' ? 'cpp' : solutionLang === 'python' ? 'py' : solutionLang === 'java' ? 'java' : solutionLang === 'javascript' ? 'js' : solutionLang === 'go' ? 'go' : 'rs'}
                          </span>
                          <span className="text-purple-400 text-[11px] uppercase font-bold">
                            {solutionLang.toUpperCase()} 2026 Optimal
                          </span>
                        </div>
                        <div className="h-72 w-full">
                          <Editor
                            height="100%"
                            language={solutionLang === 'cpp' ? 'cpp' : solutionLang === 'python' ? 'python' : solutionLang === 'java' ? 'java' : solutionLang === 'javascript' ? 'javascript' : solutionLang === 'go' ? 'go' : 'rust'}
                            theme="vs-dark"
                            value={(() => {
                              const raw = activeSolutionCode;
                              const rawLines = raw.split('\n').filter(l => l.trim().length > 0);
                              if (rawLines.length > 5 && rawLines.some(l => l.startsWith('    ') || l.startsWith('\t'))) {
                                return raw;
                              }
                              if (solutionLang !== 'python') {
                                const forLoops: string[] = [];
                                let c = raw.replace(/for\s*\([^)]*\)/g, (m) => {
                                  forLoops.push(m);
                                  return `__FOR_LOOP_${forLoops.length - 1}__`;
                                });
                                c = c
                                  .replace(/;\s*/g, ';\n')
                                  .replace(/{\s*/g, ' {\n')
                                  .replace(/}\s*/g, '\n}\n')
                                  .replace(/public:\s*/g, 'public:\n')
                                  .replace(/private:\s*/g, 'private:\n')
                                  .replace(/\n\s*\n/g, '\n');
                                forLoops.forEach((fl, idx) => {
                                  c = c.replace(`__FOR_LOOP_${idx}__`, fl);
                                });
                                let ind = 0;
                                return c.split('\n').map(line => {
                                  const trimmed = line.trim();
                                  if (!trimmed) return '';
                                  if (trimmed.startsWith('}') || trimmed.startsWith('};')) ind = Math.max(0, ind - 1);
                                  const res = trimmed === 'public:' || trimmed === 'private:' ? trimmed : '    '.repeat(ind) + trimmed;
                                  if (trimmed.endsWith('{') && !trimmed.startsWith('//')) ind++;
                                  return res;
                                }).filter(l => l.length > 0).join('\n');
                              }
                              return raw;
                            })()}
                            options={{
                              readOnly: true,
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              fontSize: 12,
                              lineNumbers: 'on',
                              folding: true,
                              automaticLayout: true,
                              renderLineHighlight: 'none',
                              fontFamily: 'Fira Code, JetBrains Mono, monospace'
                            }}
                          />
                        </div>
                      </div>

                      {/* Explanation Section */}
                      {aiSol?.explanation && (
                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-400" /> Algorithmic Intuition & Logic:
                          </div>
                          <div className="text-xs text-slate-300 leading-relaxed font-sans">
                            <FormattedChatText text={aiSol.explanation} />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Empty State / Trigger Prompt */
                    <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800/80 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center mx-auto text-purple-400 shadow-inner">
                        <FileCode className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-200">No Pre-written Solution for {solutionLang.toUpperCase()}</h4>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          Click below to have the SDETube AI engine derive the complete optimal solution with time & space bounds in {solutionLang.toUpperCase()}.
                        </p>
                      </div>
                      <button
                        onClick={() => handleGenerateSolution(solutionLang)}
                        disabled={isGeneratingSolution}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className={`w-4 h-4 text-amber-300 ${isGeneratingSolution ? 'animate-spin' : 'animate-pulse'}`} />
                        <span>{isGeneratingSolution ? 'Generating Optimal Solution...' : `Generate ${solutionLang.toUpperCase()} Solution`}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TAB 6: SUBMISSIONS */}
            {leftTab === 'submissions' && (
              <div className="space-y-3 font-sans">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Run & Submission History</h3>
                
                {submissionsList.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
                    No submissions recorded yet in this workspace session.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submissionsList.map((sub, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                            sub.status === 'Accepted'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                              : 'bg-rose-950 text-rose-400 border border-rose-700/60'
                          }`}>
                            {sub.status}
                          </span>
                          <span className="text-slate-400 font-mono">{sub.lang}</span>
                        </div>

                        <div className="flex items-center space-x-4 text-slate-400 font-mono text-[11px]">
                          <span>{sub.runtime}</span>
                          <span>{sub.memory}</span>
                          <span className="text-slate-500">{sub.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-700 text-purple-300 text-[10px] font-mono">
                      {aiReview.status}
                    </span>
                    <button
                      onClick={handleCopyReviewText}
                      className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                    >
                      {copiedReviewText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedReviewText ? 'Copied' : 'Copy Report'}</span>
                    </button>
                  </div>
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
                  <div className="text-xs text-slate-300 leading-relaxed font-sans">
                    <FormattedChatText text={aiReview.review_summary} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-200 text-xs">Actionable Optimization Tips</div>
                  <ul className="space-y-2">
                    {aiReview.suggestions.map((sug, idx) => (
                      <li key={idx} className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/40 flex items-start gap-2 text-slate-300 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <FormattedChatText text={sug} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* DRAGGABLE HORIZONTAL RESIZER HANDLE (LEFT VS RIGHT)                     */}
        {/* ----------------------------------------------------------------------- */}
        <div
          onMouseDown={handleMouseDown}
          className="hidden lg:flex w-2 hover:w-2.5 bg-slate-900 hover:bg-indigo-600/80 cursor-col-resize items-center justify-center transition-all z-20 border-x border-slate-800/80 group"
          title="Drag to resize Problem Description and Code Editor width"
        >
          <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT PANEL: MONACO CODE EDITOR & TESTCASES / RESULTS CONSOLE           */}
        {/* ----------------------------------------------------------------------- */}
        <div 
          style={{ width: `${100 - splitPercent}%` }}
          className="flex-1 lg:flex-none bg-slate-950 flex flex-col overflow-hidden relative transition-all duration-75"
        >
          
          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[160px] relative overflow-hidden">
            <Editor
              height="100%"
              language={language === 'rust' ? 'rust' : language === 'go' ? 'go' : language}
              value={code}
              theme="vs-dark"
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', 'Courier New', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                lineNumbers: 'on',
                automaticLayout: true,
                tabSize: 4
              }}
            />

            {/* Quick Actions overlay on top-right of Editor */}
            <div className="absolute top-2 right-4 flex items-center space-x-2 z-10">
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 text-[11px] font-mono flex items-center gap-1 shadow-md cursor-pointer"
                title="Copy editor code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* DRAGGABLE VERTICAL RESIZER HANDLE (EDITOR VS TESTCASE CONSOLE)        */}
          {/* --------------------------------------------------------------------- */}
          {!isConsoleMinimized && (
            <div
              onMouseDown={handleVerticalMouseDown}
              className="w-full h-2 hover:h-2.5 bg-slate-900 hover:bg-indigo-600/80 cursor-row-resize flex items-center justify-center transition-all z-20 border-y border-slate-800/80 group"
              title="Drag up or down to adjust Testcases console height"
            >
              <div className="w-10 h-0.5 bg-slate-600 group-hover:bg-white rounded-full transition-colors" />
            </div>
          )}

          {/* Testcases & Console Bottom Split (Minimizable & Height-Adjustable) */}
          <div 
            style={{ height: isConsoleMinimized ? 40 : consoleHeight }}
            className="bg-slate-900/90 flex flex-col flex-shrink-0 transition-all duration-75 border-t border-slate-800 overflow-hidden"
          >
            
            {/* Console Header / Action Tabs */}
            <div className="h-10 flex items-center justify-between px-4 bg-slate-950 border-b border-slate-800 flex-shrink-0">
              
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setConsoleTab('testcase');
                    if (isConsoleMinimized) setIsConsoleMinimized(false);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    consoleTab === 'testcase'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Test Cases
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
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Test Result</span>
                  {executionResult && (
                    <span className={`w-2 h-2 rounded-full ${
                      executionResult.stderr || !isOutputValid(executionResult.stdout, executionResult.stderr) 
                        ? 'bg-rose-500' 
                        : 'bg-emerald-400'
                    }`} />
                  )}
                </button>
              </div>

              {/* Execution Run, Submit & Minimize/Maximize Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExecute(false)}
                  disabled={isExecuting}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                  <span>{isExecuting ? 'Running...' : 'Run'}</span>
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
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors ml-1 cursor-pointer"
                  title={isConsoleMinimized ? "Expand Testcases Console" : "Minimize Console to expand Editor"}
                >
                  {isConsoleMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

            </div>

            {/* Console Content (Hidden when minimized) */}
            {!isConsoleMinimized && (
              <div className="flex-1 p-4 overflow-y-auto font-mono text-xs select-text">
                
                {/* TAB A: TESTCASES */}
                {consoleTab === 'testcase' && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                      {problemTemplate.testCases.map((tc, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveTestCaseIdx(idx);
                            setTestInput(tc);
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                            activeTestCaseIdx === idx
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          Case {idx + 1}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Input:</div>
                      <textarea
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* TAB B: TEST RESULT */}
                {consoleTab === 'result' && (
                  <div className="space-y-3 font-sans">
                    {executionResult ? (
                      <div className="space-y-3">
                        
                        {/* Status Header with Strict Correctness Evaluation */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <div className="flex items-center space-x-2 font-black text-sm">
                            {executionResult.stderr ? (
                              <>
                                <XCircle className="w-5 h-5 text-rose-400" />
                                <span className="text-rose-400">Runtime Error</span>
                              </>
                            ) : isOutputValid(executionResult.stdout, executionResult.stderr) ? (
                              <>
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                <span className="text-emerald-400">Accepted (Case {activeTestCaseIdx + 1})</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-amber-400" />
                                <span className="text-amber-400">Wrong Answer (Case {activeTestCaseIdx + 1})</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center space-x-3 font-mono text-xs text-slate-400">
                            <span>Runtime: <strong className="text-slate-200">{executionTime} ms</strong></span>
                            <span>Memory: <strong className="text-slate-200">{executionResult.memory_used_kb || 3420} KB</strong></span>
                          </div>
                        </div>

                        {/* Stdout Output Box */}
                        {executionResult.stdout && (
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Stdout Output:</div>
                            <div className={`p-2.5 rounded-xl bg-slate-950 border text-mono text-xs whitespace-pre-wrap ${
                              isOutputValid(executionResult.stdout, executionResult.stderr)
                                ? 'border-emerald-800/80 text-emerald-400'
                                : 'border-amber-800/80 text-amber-300'
                            }`}>
                              {executionResult.stdout}
                            </div>
                          </div>
                        )}

                        {/* Expected Output Box */}
                        {currentExpectedOutput && (
                          <div className="space-y-1">
                            <div className="text-[10px] text-indigo-400 font-bold uppercase">Expected Output:</div>
                            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-xs">
                              {currentExpectedOutput}
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
            )}

          </div>

          {/* ===================================================================== */}
          {/* FLOATING CIRCULAR ASK AI ACTION BUTTON AT BOTTOM-RIGHT                */}
          {/* ===================================================================== */}
          <button
            onClick={() => setIsRightAskAiOpen(true)}
            className="absolute bottom-4 right-4 z-20 w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-2xl shadow-purple-600/60 border-2 border-purple-300/40 flex items-center justify-center transition-all duration-300 hover:scale-110 group cursor-pointer"
            title="Ask AI Teaching Assistant"
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

          <div className="w-full max-w-lg h-full bg-slate-950/98 border-l border-purple-500/40 shadow-2xl flex flex-col font-sans relative overflow-hidden pointer-events-auto animate-slideInRight z-10">
            
            {/* Drawer Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-purple-950/70 to-slate-950 border-b border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-inner">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    Ask AI Teaching Assistant
                  </h3>
                  <p className="text-[10px] text-purple-300 font-mono line-clamp-1">
                    Problem: {cleanTitle} ({language.toUpperCase()})
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

            {/* Quick Question Chips */}
            <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] font-mono no-scrollbar">
              <span className="text-purple-400 font-bold flex-shrink-0 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-400" /> Prompts:
              </span>
              {[
                "Debug my code",
                "Explain Approach 1",
                "Time & Space Complexity",
                "Edge cases"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendAiMessage(chip)}
                  className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-950 border border-slate-800 hover:border-purple-700/60 text-slate-300 hover:text-purple-200 transition-all text-[11px] cursor-pointer"
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
                    <div className="w-6 h-6 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center flex-shrink-0 mt-0.5">
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
                        className="absolute top-2 right-2 p-1 text-slate-500 hover:text-purple-300 transition-colors cursor-pointer"
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
                  <Bot className="w-4 h-4 text-purple-400 animate-spin" />
                  <span>AI is thinking & analyzing code...</span>
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
                placeholder="Ask about this problem, code, or testcases..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
              />
              <button
                onClick={() => handleSendAiMessage()}
                disabled={isAiReplying || !aiInputText.trim()}
                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
