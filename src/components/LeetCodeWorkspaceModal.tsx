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
  Lock,
  Eye,
  FileText,
  Save,
  Download,
  Cloud,
  Tag,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Code2,
  BarChart3,
  ArrowUpRight,
  Youtube,
  Wand2,
  AlertTriangle,
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { executeCode, compareOutputs, SupportedLanguage } from '../lib/compiler';
import { requestMistralCodeReview, requestContextualAIChatResponse, requestAIOptimalSolution, OptimalSolutionResponse, CodeTAReview, ChatMessage } from '../lib/mistral';
import { fetchEnrichedProblem, fetchOrGenerateDriverCode, ProblemTemplate, ProblemApproach, generateDefaultStarters, toSlug, getCleanTitle, extractParamNames } from '../lib/problemService';
import { DSAProblem } from '../lib/dsaSheetsData';
import { CodeExecutionResult, QuizQuestion, Video } from '../lib/types';
import { FormattedChatText } from './FormattedChatText';
import confetti from 'canvas-confetti';
import { deductCredits, canAffordAction, PRICING_CONFIG } from '../lib/billing';
import { getCurrentStudent } from '../lib/auth';
import { InsufficientCreditsModal } from './InsufficientCreditsModal';
import { getLocalProblemNote, saveProblemNote, downloadProblemNotesAsTxt } from '../lib/notesService';
import { WalletTopupModal } from './WalletTopupModal';
import { SubmissionVisualizer, SubmissionAnalyticsData, TestCaseResultItem } from './SubmissionVisualizer';
import { ReportTestCaseModal } from './ReportTestCaseModal';
import { TELEGRAM_BACKEND_URL } from '../lib/telegram';
import { markProblemSolved } from '../lib/analytics';
import { KrokiDiagramViewer } from './KrokiDiagramViewer';
import { startSpeechRecognition, stopSpeechRecognition, speakText, stopSpeaking, isSpeaking, isSpeechRecognitionSupported, isSpeechSynthesisSupported } from '../lib/speechVoice';


export function formatCodeForDisplay(raw: string, lang: SupportedLanguage): string {
  if (!raw) return '';
  let code = raw.trim();
  const rawLines = code.split('\n').filter(l => l.trim().length > 0);
  if (rawLines.length > 5 && rawLines.some(l => l.startsWith('    ') || l.startsWith('\t'))) {
    return code;
  }

  // 1. Python Multi-line Formatter
  if (lang === 'python') {
    code = code.replace(/;/g, '\n');
    const patterns = [
      /:\s*(def\s+)/g,
      /:\s*(for\s+)/g,
      /:\s*(while\s+)/g,
      /:\s*(if\s+)/g,
      /:\s*(elif\s+)/g,
      /:\s*(else:)/g,
      /:\s*(return\s+)/g,
      /:\s*(pass\b)/g,
      /:\s*(continue\b)/g,
      /:\s*(break\b)/g,
      /:\s*([a-zA-Z_]\w*(?:\[[^\]]*\])*\s*[,=])/g,
      /:\s*([a-zA-Z_]\w*\.[a-zA-Z_]\w*\()/g
    ];
    for (const pat of patterns) {
      code = code.replace(pat, ':\n$1');
    }

    const lines = code.split('\n').map(l => l.trim()).filter(Boolean);
    let indent = 0;
    const res: string[] = [];

    for (const l of lines) {
      if (l.startsWith('elif ') || l.startsWith('else:') || l.startsWith('except ') || l.startsWith('except:') || l.startsWith('finally:')) {
        indent = Math.max(0, indent - 1);
      }
      res.push('    '.repeat(indent) + l);
      if (l.endsWith(':')) {
        indent++;
      }
    }
    return res.join('\n');
  }

  // 2. C++, Java, JS, Go, Rust Multi-line Formatter
  const forLoops: string[] = [];
  let c = code.replace(/for\s*\([^)]*\)/g, (m) => {
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
    return getCleanTitle(codingProblem?.name || codingProblem?.title || problemTitle || codingProblem?.leetcode || 'Algorithm Challenge');
  }, [problemTitle, codingProblem]);

  const currentProblemSlug = useMemo(() => {
    return toSlug(codingProblem?.leetcode || codingProblem?.slug || codingProblem?.name || codingProblem?.title || cleanTitle);
  }, [codingProblem, cleanTitle]);

  const effectiveTranscript = transcript || matchingVideo?.telegram_caption || '';

  const [problemTemplate, setProblemTemplate] = useState<ProblemTemplate>(() => {
    return {
      name: cleanTitle,
      category: codingProblem?.category || 'Algorithms',
      difficulty: (codingProblem?.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard',
      description: `Loading **${cleanTitle}** problem description...`,
      examples: [],
      constraints: [],
      testCases: ['nums = [1, 2, 3]'],
      expectedOutputs: ['0'],
      hints: [],
      approaches: [],
      starters: generateDefaultStarters(currentProblemSlug),
      solutions: generateDefaultStarters(currentProblemSlug)
    };
  });

  const [isLoadingEnriched, setIsLoadingEnriched] = useState<boolean>(true);

  // Fetch enriched LeetCode problem description, examples, constraints & starter code from Cloudflare R2 / LeetCode GraphQL
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingEnriched(true);

    const rawTarget = codingProblem?.leetcode || codingProblem?.slug || codingProblem?.name || cleanTitle;
    const targetSlug = currentProblemSlug;

    fetchEnrichedProblem(
      rawTarget,
      codingProblem?.category || 'Arrays',
      codingProblem?.difficulty || 'Medium',
      effectiveTranscript,
      notes
    ).then((enriched) => {
      if (!isCancelled && enriched) {
        // Check for local testcase override
        try {
          const overrideStr = localStorage.getItem(`edustream_testcase_override_${targetSlug}`);
          if (overrideStr) {
            const overrideObj = JSON.parse(overrideStr);
            if (overrideObj && Array.isArray(overrideObj.testCases) && overrideObj.testCases.length > 0) {
              enriched.testCases = overrideObj.testCases;
              if (Array.isArray(overrideObj.expectedOutputs)) {
                enriched.expectedOutputs = overrideObj.expectedOutputs;
              }
            }
          }
        } catch {}

        setProblemTemplate(enriched);
        setIsLoadingEnriched(false);

        // Check if user already has saved code in browser cache for this problem & language
        try {
          const cached = localStorage.getItem(`edustream_user_code_${targetSlug}_${language}`);
          if (cached !== null && cached.trim().length > 0) {
            setCode(cached);
            if (enriched.testCases && enriched.testCases.length > 0) {
              setActiveTestCaseIdx(0);
              setTestInput(enriched.testCases[0]);
            }
            return;
          }
        } catch {}

        if (!initialCode || initialCode.trim().length < 10) {
          setCode(enriched.starters[language] || enriched.starters.cpp || '');
        }
        if (enriched.testCases && enriched.testCases.length > 0) {
          setActiveTestCaseIdx(0);
          setTestInput(enriched.testCases[0]);
        }

        // Prefetch & generate type-safe driver harness asynchronously
        fetchOrGenerateDriverCode(targetSlug, language, enriched.starters?.[language], enriched.testCases?.[0]).then(drv => {
          if (drv && !isCancelled) {
            setProblemTemplate(prev => ({
              ...prev,
              driverCode: { ...(prev.driverCode || {}), [language]: drv } as Record<SupportedLanguage, string>
            }));
          }
        }).catch(() => {});
      }
    }).catch(() => {
      if (!isCancelled) setIsLoadingEnriched(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [currentProblemSlug, codingProblem, cleanTitle, effectiveTranscript, notes, language, initialCode]);

  // Selected Approach
  const [selectedApproachId, setSelectedApproachId] = useState<string>(() => {
    return problemTemplate.approaches && problemTemplate.approaches.length > 0 
      ? problemTemplate.approaches[0].id 
      : 'default';
  });

  // Code state with localStorage initial load
  const [code, setCode] = useState<string>(() => {
    if (initialCode && initialCode.trim().length > 10) return initialCode;
    try {
      const slug = currentProblemSlug;
      const cached = localStorage.getItem(`edustream_user_code_${slug}_${initialLanguage}`);
      if (cached !== null && cached.trim().length > 0) return cached;
    } catch {}
    return problemTemplate.starters[initialLanguage] || problemTemplate.starters.cpp;
  });

  const [codeSaveStatus, setCodeSaveStatus] = useState<'idle' | 'saved' | 'synced'>('idle');

  const [leftTab, setLeftTab] = useState<'description' | 'hints' | 'editorial' | 'notes' | 'video' | 'solutions' | 'submissions' | 'aireview' | 'diagram'>('description');
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState<number>(0);
  const [testInput, setTestInput] = useState<string>(() => problemTemplate.testCases[0] || 'nums = [2, 7, 11, 15], target = 9');
  
  // Submission and Test Execution State
  const [submissionResult, setSubmissionResult] = useState<{
    isSubmission: boolean;
    passedCount: number;
    totalCount: number;
    failedCaseIdx?: number;
    failedInput?: string;
    failedOutput?: string;
    failedExpected?: string;
    failedStderr?: string;
    isSuccess: boolean;
  } | null>(null);
  
  const [submissionAnalytics, setSubmissionAnalytics] = useState<SubmissionAnalyticsData | null>(null);
  const [isSubmissionVisualizerOpen, setIsSubmissionVisualizerOpen] = useState<boolean>(false);
  
  // AI Test Case Verification and Repair Modal State
  const [isReportTestCaseOpen, setIsReportTestCaseOpen] = useState<boolean>(false);
  const [reportTestCaseIdx, setReportTestCaseIdx] = useState<number>(0);

  
  // Direct LeetCode & GeeksforGeeks links (Only if explicitly present)
  const lcUrl = useMemo(() => {
    return (codingProblem?.leetcode && codingProblem.leetcode.trim().length > 0) ? codingProblem.leetcode : null;
  }, [codingProblem]);

  const gfgUrl = useMemo(() => {
    return (codingProblem?.gfg && codingProblem.gfg.trim().length > 0) ? codingProblem.gfg : null;
  }, [codingProblem]);

  // YouTube embed URL parser (from problem metadata or template)
  const youtubeEmbedUrl = useMemo(() => {
    const rawUrl = codingProblem?.youtube || codingProblem?.youtubeUrl || (problemTemplate as any)?.youtube || '';
    if (!rawUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = rawUrl.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : (rawUrl.startsWith('http') ? rawUrl : null);
  }, [codingProblem, problemTemplate]);

  // Valid matching channel video (must genuinely match the problem title)
  const validMatchingVideo = useMemo(() => {
    if (!matchingVideo?.stream_url) return null;
    const clean = (s: string) => s.replace(/^DSA Lecture \d+:\s*/i, '').replace(/[^\w\s]/gi, ' ').toLowerCase().trim().replace(/\s+/g, ' ');
    const normTitle = clean(cleanTitle);
    const normV = clean(matchingVideo.title || '');
    if (normTitle === normV || (normTitle.length >= 7 && normV.length >= 7 && (normTitle.includes(normV) || normV.includes(normTitle)))) {
      return matchingVideo;
    }
    return null;
  }, [matchingVideo, cleanTitle]);

  const hasVideoSolution = Boolean(youtubeEmbedUrl || validMatchingVideo?.stream_url);

  // Sync code state whenever problem or language changes
  useEffect(() => {
    const slug = currentProblemSlug;
    try {
      const cached = localStorage.getItem(`edustream_user_code_${slug}_${language}`);
      if (cached !== null && cached.trim().length > 0) {
        setCode(cached);
        return;
      }
    } catch {}
    if (problemTemplate.starters && problemTemplate.starters[language]) {
      setCode(problemTemplate.starters[language]);
    }
  }, [currentProblemSlug, language, problemTemplate.starters]);

  // Problem Notes Studio state (.txt & Cloudflare sync)
  const [modalNotesContent, setModalNotesContent] = useState<string>(() => {
    return getLocalProblemNote(currentProblemSlug);
  });
  const [isSavingModalNotes, setIsSavingModalNotes] = useState(false);
  const [modalNotesSavedStatus, setModalNotesSavedStatus] = useState<'idle' | 'saved' | 'synced'>('idle');

  const handleSaveModalNotes = async () => {
    setIsSavingModalNotes(true);
    const slug = currentProblemSlug;
    const student = getCurrentStudent();
    const res = await saveProblemNote(slug, codingProblem?.name || cleanTitle, modalNotesContent, student?.email);
    setIsSavingModalNotes(false);
    setModalNotesSavedStatus(res.syncedToCloudflare ? 'synced' : 'saved');
    setTimeout(() => setModalNotesSavedStatus('idle'), 4000);
  };

  const handleDownloadModalNotes = () => {
    const slug = currentProblemSlug;
    downloadProblemNotesAsTxt(slug, codingProblem?.name || cleanTitle, modalNotesContent);
  };
  
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

  // Solutions tab state with robust localStorage & Cloudflare R2 persistence
  const [solutionLang, setSolutionLang] = useState<SupportedLanguage>(language);
  const [aiGeneratedSolutions, setAiGeneratedSolutions] = useState<Record<string, OptimalSolutionResponse>>(() => {
    const slug = currentProblemSlug;
    const initialMap: Record<string, OptimalSolutionResponse> = {};
    try {
      const cached = localStorage.getItem(`edustream_ai_solutions_${slug}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          Object.assign(initialMap, parsed);
        }
      }
    } catch {}

    // Populate from R2 problemTemplate.solutions
    if (problemTemplate.solutions && typeof problemTemplate.solutions === 'object') {
      Object.entries(problemTemplate.solutions).forEach(([langKey, solCode]) => {
        if (solCode && typeof solCode === 'string' && solCode.trim().length > 10 && (!initialMap[langKey] || !initialMap[langKey].code)) {
          initialMap[langKey] = {
            code: solCode,
            explanation: 'Official reference solution persisted in Cloudflare R2.',
            timeComplexity: 'Optimal',
            spaceComplexity: 'O(1) Auxiliary',
            approachName: 'Optimal Reference Approach',
            stored: true,
            fromR2Cache: true
          };
        }
      });
    }
    return initialMap;
  });

  const [isGeneratingSolution, setIsGeneratingSolution] = useState<boolean>(false);
  const [copiedSolutionCode, setCopiedSolutionCode] = useState<boolean>(false);
  const [appliedSolutionMsg, setAppliedSolutionMsg] = useState<boolean>(false);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);

  // Sync solutions from R2 on problem load / language switch
  useEffect(() => {
    const slug = currentProblemSlug;
    
    // 1. Read local storage
    try {
      const cached = localStorage.getItem(`edustream_ai_solutions_${slug}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          setAiGeneratedSolutions(prev => ({ ...parsed, ...prev }));
        }
      }
    } catch {}

    // 2. Read problemTemplate.solutions
    if (problemTemplate.solutions && typeof problemTemplate.solutions === 'object') {
      setAiGeneratedSolutions(prev => {
        const updated = { ...prev };
        let changed = false;
        Object.entries(problemTemplate.solutions || {}).forEach(([langKey, solCode]) => {
          if (solCode && typeof solCode === 'string' && solCode.trim().length > 10) {
            if (!updated[langKey] || !updated[langKey].code) {
              updated[langKey] = {
                code: solCode,
                explanation: 'Official reference solution persisted in Cloudflare R2.',
                timeComplexity: 'Optimal',
                spaceComplexity: 'O(1) Auxiliary',
                approachName: 'Optimal Reference Approach',
                stored: true,
                fromR2Cache: true
              };
              changed = true;
            }
          }
        });
        if (changed) {
          try {
            localStorage.setItem(`edustream_ai_solutions_${slug}`, JSON.stringify(updated));
          } catch {}
        }
        return changed ? updated : prev;
      });
    }

    // 3. Directly poll R2 solution endpoint for active solutionLang
    fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/solution/${encodeURIComponent(solutionLang)}`)
      .then(res => res.json())
      .then(data => {
        if (data?.code && data.stored) {
          setAiGeneratedSolutions(prev => {
            const updated = {
              ...prev,
              [solutionLang]: {
                code: data.code,
                explanation: data.meta?.explanation || 'Official reference solution persisted in Cloudflare R2.',
                timeComplexity: data.meta?.timeComplexity || 'Optimal',
                spaceComplexity: data.meta?.spaceComplexity || 'O(1) Auxiliary',
                approachName: data.meta?.approachName || 'Optimal Reference Approach',
                stored: true,
                fromR2Cache: true
              }
            };
            try {
              localStorage.setItem(`edustream_ai_solutions_${slug}`, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      })
      .catch(() => {});
  }, [cleanTitle, problemTemplate.solutions, solutionLang, codingProblem]);

  const handleGenerateSolution = async (langToGen: SupportedLanguage = solutionLang) => {
    const user = getCurrentStudent();
    if (!canAffordAction(PRICING_CONFIG.AI_OPTIMAL_SOLUTION_GEN, user?.email)) {
      setInsufficientMeta({
        cost: PRICING_CONFIG.AI_OPTIMAL_SOLUTION_GEN,
        action: `Generating AI Optimal Multi-Approach Solution (${langToGen.toUpperCase()}): ${cleanTitle}`
      });
      setIsInsufficientCreditsOpen(true);
      return;
    }
    deductCredits(
      PRICING_CONFIG.AI_OPTIMAL_SOLUTION_GEN,
      'AI_OPTIMAL_SOLUTION',
      `💡 AI Optimal Solution (${langToGen.toUpperCase()}): ${cleanTitle}`,
      user?.email
    );

    // Derive clean problem slug for backend validation + R2 storage
    const problemSlug = toSlug(codingProblem?.leetcode || codingProblem?.slug || codingProblem?.name || cleanTitle);

    setIsGeneratingSolution(true);
    try {
      const sol = await requestAIOptimalSolution(
        cleanTitle,
        problemTemplate.description,
        langToGen,
        problemTemplate.starters[langToGen],
        problemSlug
      );
      if (sol) {
        setAiGeneratedSolutions(prev => {
          const updated = { ...prev, [langToGen]: sol };
          try {
            localStorage.setItem(`edustream_ai_solutions_${problemSlug}`, JSON.stringify(updated));
          } catch {}
          return updated;
        });

        // Always update problemTemplate.solutions & problem spec in localStorage
        setProblemTemplate(prev => {
          const updatedSolutions = { ...(prev.solutions || {}), [langToGen]: sol.code } as Record<SupportedLanguage, string>;
          const updatedTemplate = { ...prev, solutions: updatedSolutions };
          try {
            const cacheKey = `edustream_problem_spec_${problemSlug}`;
            localStorage.setItem(cacheKey, JSON.stringify(updatedTemplate));
          } catch {}
          return updatedTemplate;
        });
      }
    } catch (e) {
      console.warn('AI Solution Generation Error:', e);
    } finally {
      setIsGeneratingSolution(false);
    }
  };


  const handleApplySolutionToEditor = (solCode: string, langToApply: SupportedLanguage) => {
    setLanguage(langToApply);
    setCode(formatCodeForDisplay(solCode, langToApply));
    setAppliedSolutionMsg(true);
    setTimeout(() => setAppliedSolutionMsg(false), 2000);
  };

  const handleCopySolutionText = (textToCopy: string) => {
    navigator.clipboard.writeText(formatCodeForDisplay(textToCopy, solutionLang));
    setCopiedSolutionCode(true);
    setTimeout(() => setCopiedSolutionCode(false), 2000);
  };

  // ── Billing Modals State ──
  const [isInsufficientCreditsOpen, setIsInsufficientCreditsOpen] = useState(false);
  const [isWalletTopupOpen, setIsWalletTopupOpen] = useState(false);
  const [insufficientMeta, setInsufficientMeta] = useState<{ cost: number; action: string }>({ cost: 0.05, action: 'Running Code' });

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

  // Speech & Voice State for Problem Discussion
  const [isVoiceInputActive, setIsVoiceInputActive] = useState<boolean>(false);
  const [isAutoSpeakEnabled, setIsAutoSpeakEnabled] = useState<boolean>(() => {
    return localStorage.getItem('sdetube_auto_speak_ai') === 'true';
  });
  const [speakingMessageIdx, setSpeakingMessageIdx] = useState<number | null>(null);

  const toggleAutoSpeak = () => {
    const nextVal = !isAutoSpeakEnabled;
    setIsAutoSpeakEnabled(nextVal);
    try {
      localStorage.setItem('sdetube_auto_speak_ai', String(nextVal));
    } catch {}
    if (!nextVal) stopSpeaking();
  };

  const handleToggleVoiceInput = () => {
    if (isVoiceInputActive) {
      stopSpeechRecognition();
      setIsVoiceInputActive(false);
    } else {
      setIsVoiceInputActive(true);
      startSpeechRecognition({
        onTranscript: (transcript, isFinal) => {
          setAiInputText(transcript);
          if (isFinal) {
            setIsVoiceInputActive(false);
          }
        },
        onError: (err) => {
          console.warn('Voice input error:', err);
          setIsVoiceInputActive(false);
        },
        onEnd: () => {
          setIsVoiceInputActive(false);
        }
      });
    }
  };

  const handleSpeakMessage = (text: string, idx: number) => {
    if (speakingMessageIdx === idx) {
      stopSpeaking();
      setSpeakingMessageIdx(null);
    } else {
      setSpeakingMessageIdx(idx);
      speakText(text, {
        onEnd: () => setSpeakingMessageIdx(null),
        onError: () => setSpeakingMessageIdx(null)
      });
    }
  };

  // Cleanup speech on unmount or Ask AI close
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopSpeechRecognition();
    };
  }, []);

  // Submission History State with LocalStorage & Cloud Sync
  const [submissionsList, setSubmissionsList] = useState<{
    id?: string;
    timestamp: string;
    status: string;
    runtime: string;
    memory: string;
    lang: string;
    code?: string;
    passedCount?: number;
    totalCount?: number;
    analytics?: SubmissionAnalyticsData;
  }[]>(() => {
    try {
      const slug = currentProblemSlug;
      const stored = localStorage.getItem(`edustream_submissions_${slug}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  // Sync submissions from Cloudflare R2 on mount and problem change
  useEffect(() => {
    const slug = currentProblemSlug;
    
    // 1. Read local storage
    try {
      const stored = localStorage.getItem(`edustream_submissions_${slug}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) setSubmissionsList(parsed);
      }
    } catch {}

    // 2. Fetch from Cloudflare R2
    const student = getCurrentStudent();
    const email = student?.email || 'anonymous';
    fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/submissions?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data?.submissions && Array.isArray(data.submissions) && data.submissions.length > 0) {
          setSubmissionsList(prev => {
            // Merge & deduplicate by ID
            const existingIds = new Set(prev.map(s => s.id));
            const merged = [...prev];
            data.submissions.forEach((s: any) => {
              if (s && s.id && !existingIds.has(s.id)) {
                merged.push(s);
                existingIds.add(s.id);
              }
            });
            // Sort newest first
            merged.sort((a, b) => (new Date(b.timestamp).getTime() || 0) - (new Date(a.timestamp).getTime() || 0));
            try {
              localStorage.setItem(`edustream_submissions_${slug}`, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .catch(() => {});
  }, [currentProblemSlug]);

  // Instant Synchronous Autosave on every keystroke (like LeetCode)
  const handleCodeChange = (newVal: string | undefined) => {
    const nextCode = newVal ?? '';
    setCode(nextCode);
    const slug = currentProblemSlug;
    try {
      localStorage.setItem(`edustream_user_code_${slug}_${language}`, nextCode);
      setCodeSaveStatus('saved');
    } catch {}
  };

  // Reset to default template (LeetCode reload button)
  const handleResetCode = () => {
    if (window.confirm('Reset code to default template? Any unsaved edits for this language will be discarded.')) {
      const starter = problemTemplate.starters[language] || problemTemplate.starters.cpp || '';
      setCode(starter);
      const slug = currentProblemSlug;
      try {
        localStorage.removeItem(`edustream_user_code_${slug}_${language}`);
        setCodeSaveStatus('idle');
      } catch {}
    }
  };

  // Update starter code or load from cache when language changes
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    const slug = currentProblemSlug;
    try {
      const cached = localStorage.getItem(`edustream_user_code_${slug}_${newLang}`);
      if (cached !== null && cached.trim().length > 0) {
        setCode(cached);
        return;
      }
    } catch {}

    if (problemTemplate.approaches && problemTemplate.approaches.length > 0) {
      const curApp = problemTemplate.approaches.find(a => a.id === selectedApproachId) || problemTemplate.approaches[0];
      setCode((curApp?.starters && curApp.starters[newLang]) || problemTemplate.starters[newLang] || problemTemplate.starters.cpp);
    } else {
      setCode(problemTemplate.starters[newLang] || problemTemplate.starters.cpp);
    }
  };

  // Sync user code directly to Cloudflare R2 as a .txt file (deducts ₹0.05)
  const handleSyncCodeToCloud = async () => {
    setCodeSaveStatus('idle');
    const slug = currentProblemSlug;
    const student = getCurrentStudent();

    if (!canAffordAction(PRICING_CONFIG.CLOUD_CODE_SAVE, student?.email)) {
      setInsufficientMeta({
        cost: PRICING_CONFIG.CLOUD_CODE_SAVE,
        action: `Save Code to Cloud Backup (5 paise): ${cleanTitle}`
      });
      setIsInsufficientCreditsOpen(true);
      return;
    }

    deductCredits(
      PRICING_CONFIG.CLOUD_CODE_SAVE,
      'CLOUD_CODE_SAVE',
      `☁️ Save Code to Cloud (5p): ${cleanTitle}`,
      student?.email
    );

    try {
      localStorage.setItem(`edustream_user_code_${slug}_${language}`, code);
      if (student?.email) {
        await fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/user-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: student.email,
            language,
            code,
            problemTitle: cleanTitle
          })
        });
      }
      setCodeSaveStatus('synced');
    } catch {
      setCodeSaveStatus('saved');
    }
    setTimeout(() => setCodeSaveStatus('idle'), 3500);
  };

  const handleSelectApproach = (approach: ProblemApproach) => {
    setSelectedApproachId(approach.id);
    if (approach?.starters && approach.starters[language]) {
      setCode(approach.starters[language]);
    } else if (problemTemplate.starters[language]) {
      setCode(problemTemplate.starters[language]);
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

  // Strict Output Validation Logic (Handles order-independent nested subsets, bools, ints, whitespace)
  const currentExpectedOutput = useMemo(() => {
    return problemTemplate.expectedOutputs?.[activeTestCaseIdx] || problemTemplate.expectedOutputs?.[0] || '';
  }, [problemTemplate, activeTestCaseIdx]);

  const isOutputValid = (stdout: string, stderr: string, expectedOutput: string = currentExpectedOutput): boolean => {
    // Only treat as fatal error if stderr contains genuine error/exception signatures (not harmless GCC compiler warnings)
    const isFatalStderr = Boolean(
      stderr && (
        stderr.includes('error:') ||
        stderr.includes('Runtime Error') ||
        stderr.includes('Traceback') ||
        stderr.includes('Exception') ||
        stderr.includes('SyntaxError')
      )
    );
    if (isFatalStderr) return false;
    if (!stdout || !stdout.trim()) return false;
    if (!expectedOutput || !expectedOutput.trim()) return stdout.trim().length > 0;
    return compareOutputs(stdout, expectedOutput);
  };

  // Run Code (First 3 Run Cases) vs Submit (All Hidden Cases)
  const handleExecute = async (isSubmission: boolean = false) => {
    const cost = isSubmission ? PRICING_CONFIG.CODE_SUBMIT_DSA_LLD : PRICING_CONFIG.COMPILER_RUN_DSA_LLD;
    const actionLabel = isSubmission ? 'Submitting & Judging Solution (20 paise)' : 'Running Code via Compiler (5 paise)';

    if (!canAffordAction(cost)) {
      setInsufficientMeta({ cost, action: actionLabel });
      setIsInsufficientCreditsOpen(true);
      return;
    }

    deductCredits(
      cost,
      isSubmission ? 'CODE_SUBMIT' : 'COMPILER_RUN',
      `${isSubmission ? '🎯 DSA Code Submit' : '⚡ DSA Compiler Run'} (${language.toUpperCase()}): ${cleanTitle}`
    );

    setIsExecuting(true);
    setConsoleTab('result');
    if (isConsoleMinimized) setIsConsoleMinimized(false);
    const start = Date.now();

    try {
      let preloadedDriver = problemTemplate?.driverCode?.[language];
      if (!preloadedDriver) {
        const slug = currentProblemSlug;
        const sampleCase = testInput || problemTemplate?.testCases?.[0] || '';
        const fetchedDriver = await fetchOrGenerateDriverCode(slug, language, problemTemplate.starters?.[language], sampleCase);
        if (fetchedDriver) {
          preloadedDriver = fetchedDriver;
          setProblemTemplate(prev => ({
            ...prev,
            driverCode: { ...(prev.driverCode || {}), [language]: fetchedDriver } as Record<SupportedLanguage, string>
          }));
        }
      }

      if (!isSubmission) {
        // ----------------------------------------------------
        // RUN MODE: Execute the currently active testcase
        // ----------------------------------------------------
        const result = await executeCode(code, language, testInput, cleanTitle, preloadedDriver);
        const elapsedMs = Date.now() - start;
        setExecutionTime(elapsedMs);
        setExecutionResult(result);

        const isSuccess = result.status === 'SUCCESS' && isOutputValid(result.stdout, result.stderr, currentExpectedOutput);

        setSubmissionResult({
          isSubmission: false,
          passedCount: isSuccess ? 1 : 0,
          totalCount: 1,
          failedCaseIdx: isSuccess ? undefined : activeTestCaseIdx,
          failedInput: isSuccess ? undefined : testInput,
          failedOutput: result.stdout,
          failedExpected: currentExpectedOutput,
          failedStderr: isSuccess ? undefined : result.stderr,
          isSuccess
        });

        if (isSuccess) {
          confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
        }

      } else {
        // ----------------------------------------------------
        // SUBMISSION MODE: Ultra-Fast Parallel Execution
        // ----------------------------------------------------
        const allCases = problemTemplate.testCases && problemTemplate.testCases.length > 0 
          ? problemTemplate.testCases 
          : [testInput];
        const allExpected = problemTemplate.expectedOutputs && problemTemplate.expectedOutputs.length > 0
          ? problemTemplate.expectedOutputs
          : [currentExpectedOutput];

        // Run all test cases concurrently in parallel for lightning-fast results
        const caseExecutionPromises = allCases.map(async (caseInput, i) => {
          const expectedOut = allExpected[i] || '';
          const caseStart = Date.now();
          const res = await executeCode(code, language, caseInput, cleanTitle, preloadedDriver);
          const caseLatency = Math.max(2, Date.now() - caseStart);
          const casePass = res.status === 'SUCCESS' && isOutputValid(res.stdout, res.stderr, expectedOut);
          return {
            caseIndex: i,
            input: caseInput,
            expectedOutput: expectedOut,
            actualOutput: res.stdout,
            passed: casePass,
            runtimeMs: res.execution_time_ms || caseLatency,
            memoryKb: res.memory_used_kb || (3400 + Math.floor(Math.random() * 400)),
            errorMessage: casePass ? undefined : (res.stderr || undefined),
            rawResult: res
          };
        });

        const resolvedCases = await Promise.all(caseExecutionPromises);
        resolvedCases.sort((a, b) => a.caseIndex - b.caseIndex);

        let passed = 0;
        let failedIdx = -1;
        let failedIn = '';
        let failedExp = '';
        let failedOut = '';
        let failedErr = '';
        const caseResults: TestCaseResultItem[] = [];
        let lastResult: CodeExecutionResult = resolvedCases[0]?.rawResult || {
          stdout: '',
          stderr: '',
          status: 'SUCCESS',
          exit_code: 0,
          execution_time_ms: 0,
          memory_used_kb: 3420
        };

        for (const item of resolvedCases) {
          caseResults.push({
            caseIndex: item.caseIndex,
            input: item.input,
            expectedOutput: item.expectedOutput,
            actualOutput: item.actualOutput,
            passed: item.passed,
            runtimeMs: item.runtimeMs,
            memoryKb: item.memoryKb,
            errorMessage: item.errorMessage
          });

          if (item.passed) {
            passed++;
          } else if (failedIdx === -1) {
            failedIdx = item.caseIndex;
            failedIn = item.input;
            failedExp = item.expectedOutput;
            failedOut = item.actualOutput;
            failedErr = item.errorMessage || item.rawResult?.stderr || '';
            lastResult = item.rawResult;
          }
        }

        const elapsedMs = Date.now() - start;
        setExecutionTime(elapsedMs);
        setExecutionResult(lastResult);

        const isAllSuccess = passed === allCases.length;

        // Calculate percentiles
        let runtimePct = 85.0;
        if (elapsedMs < 30) runtimePct = 96.5;
        else if (elapsedMs < 60) runtimePct = 92.4;
        else if (elapsedMs < 100) runtimePct = 84.2;
        else if (elapsedMs < 200) runtimePct = 71.0;
        else runtimePct = 55.0;

        const memoryKb = lastResult.memory_used_kb || 3420;
        let memoryPct = 88.5;
        if (memoryKb < 3000) memoryPct = 95.0;
        else if (memoryKb < 4000) memoryPct = 89.2;
        else memoryPct = 72.0;

        const analytics: SubmissionAnalyticsData = {
          isSuccess: isAllSuccess,
          status: isAllSuccess ? 'Accepted' : failedErr ? 'Runtime Error' : 'Wrong Answer',
          totalCases: allCases.length,
          passedCases: passed,
          runtimeMs: elapsedMs,
          memoryKb: memoryKb,
          runtimePercentile: runtimePct,
          memoryPercentile: memoryPct,
          timeComplexity: problemTemplate.approaches?.[0]?.timeComplexity || 'O(N)',
          spaceComplexity: problemTemplate.approaches?.[0]?.spaceComplexity || 'O(N)',
          timeExplanation: problemTemplate.approaches?.[0]?.description || 'Linear traversal with efficient element processing.',
          spaceExplanation: `Auxiliary dynamic memory allocated (${(memoryKb / 1024).toFixed(1)} MB).`,
          optimalTimeComplexity: 'O(N)',
          optimalSpaceComplexity: 'O(1)',
          testCasesResults: caseResults,
          failedCase: isAllSuccess ? undefined : {
            caseIndex: failedIdx >= 0 ? failedIdx : 0,
            input: failedIn,
            expectedOutput: failedExp,
            actualOutput: failedOut,
            stderr: failedErr
          },
          language,
          problemTitle: cleanTitle,
          submittedCode: code
        };

        setSubmissionAnalytics(analytics);
        if (isAllSuccess) {
          setIsSubmissionVisualizerOpen(true);
        } else {
          setIsSubmissionVisualizerOpen(false);
          setConsoleTab('result');
          setIsConsoleMinimized(false);
        }

        setSubmissionResult({
          isSubmission: true,
          passedCount: passed,
          totalCount: allCases.length,
          failedCaseIdx: isAllSuccess ? undefined : failedIdx,
          failedInput: isAllSuccess ? undefined : failedIn,
          failedOutput: isAllSuccess ? undefined : failedOut,
          failedExpected: isAllSuccess ? undefined : failedExp,
          failedStderr: isAllSuccess ? undefined : failedErr,
          isSuccess: isAllSuccess
        });

        const newSubItem = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toLocaleString(),
          status: isAllSuccess ? 'Accepted' : failedErr ? 'Runtime Error' : `Wrong Answer (${passed}/${allCases.length})`,
          runtime: `${elapsedMs} ms`,
          memory: `${lastResult.memory_used_kb || 3420} KB`,
          lang: language.toUpperCase(),
          code: code,
          passedCount: passed,
          totalCount: allCases.length,
          analytics: analytics
        };

        const slug = currentProblemSlug;

        setSubmissionsList(prev => {
          const updated = [newSubItem, ...prev];
          try {
            localStorage.setItem(`edustream_submissions_${slug}`, JSON.stringify(updated));
          } catch {}
          return updated;
        });

        // Sync submission to backend Cloudflare R2
        const student = getCurrentStudent();
        const email = student?.email || 'anonymous';
        fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            submission: newSubItem
          })
        }).catch(() => {});

        if (isAllSuccess) {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 }
          });
          markProblemSolved(
            codingProblem?.id || codingProblem?.name || cleanTitle,
            Math.max(1, Math.round(elapsedMs / 60000)),
            currentProblemSlug || codingProblem?.slug || cleanTitle
          );

          // Persist validated solution to Cloudflare R2
          fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/save-solution`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language, solution: code })
          }).catch(() => {});
        }

        if (onCodeExecuted) {
          onCodeExecuted(Math.max(1, Math.round(elapsedMs / 1000)), isAllSuccess);
        }
      }
    } catch (err: any) {
      const elapsedMs = Date.now() - start;
      setExecutionTime(elapsedMs);
      const fallbackResult: CodeExecutionResult = {
        stdout: '',
        stderr: err?.message || 'Execution error on cloud compiler.',
        status: 'ERROR',
        exit_code: 1,
        execution_time_ms: elapsedMs,
        memory_used_kb: 0
      };
      setExecutionResult(fallbackResult);
      setSubmissionResult({
        isSubmission,
        passedCount: 0,
        totalCount: isSubmission ? (problemTemplate.testCases?.length || 1) : 1,
        failedCaseIdx: activeTestCaseIdx,
        failedInput: testInput,
        failedOutput: '',
        failedExpected: currentExpectedOutput,
        failedStderr: err?.message || 'Compiler execution error',
        isSuccess: false
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // LeetCode Standard Global Shortcuts:
  // - Ctrl + ' (or Cmd + ') -> Run Code
  // - Ctrl + Enter (or Cmd + Enter) -> Submit Code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + ' or Cmd + ' -> Run Code
      if ((e.ctrlKey || e.metaKey) && (e.key === "'" || e.key === '"')) {
        e.preventDefault();
        e.stopPropagation();
        if (!isExecuting) {
          handleExecute(false);
        }
      }
      // Ctrl + Enter or Cmd + Enter -> Submit Code
      else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (!isExecuting) {
          handleExecute(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isExecuting, handleExecute, code, language, testInput]);

  // AI Review
  const handleAIReview = async () => {
    const user = getCurrentStudent();
    if (!canAffordAction(PRICING_CONFIG.AI_CODE_REVIEW_DSA, user?.email)) {
      setInsufficientMeta({
        cost: PRICING_CONFIG.AI_CODE_REVIEW_DSA,
        action: `Senior AI Code Review & Feedback (50 paise): ${cleanTitle}`
      });
      setIsInsufficientCreditsOpen(true);
      return;
    }
    deductCredits(
      PRICING_CONFIG.AI_CODE_REVIEW_DSA,
      'AI_CODE_REVIEW',
      `🔍 Senior AI Code Review (50p): ${cleanTitle}`,
      user?.email
    );

    setIsReviewing(true);
    setLeftTab('aireview');
    try {
      const review = await requestMistralCodeReview(
        code,
        language,
        executionResult?.stdout || '',
        executionResult?.stderr || '',
        cleanTitle,
        problemTemplate?.description || '',
        problemTemplate?.constraints || [],
        problemTemplate?.testCases || []
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

    const user = getCurrentStudent();
    if (!canAffordAction(PRICING_CONFIG.AI_CHAT_MESSAGE, user?.email)) {
      setInsufficientMeta({
        cost: PRICING_CONFIG.AI_CHAT_MESSAGE,
        action: 'AI Teaching Assistant Chat (20 paise)'
      });
      setIsInsufficientCreditsOpen(true);
      return;
    }

    deductCredits(
      PRICING_CONFIG.AI_CHAT_MESSAGE,
      'AI_CHAT',
      `🤖 DSA AI Assistant Chat: ${cleanTitle}`,
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

      setAiChatMessages(prev => {
        const next: ChatMessage[] = [...prev, { role: 'assistant', content: reply }];
        if (isAutoSpeakEnabled) {
          const newIdx = next.length - 1;
          setSpeakingMessageIdx(newIdx);
          speakText(reply, {
            onEnd: () => setSpeakingMessageIdx(null),
            onError: () => setSpeakingMessageIdx(null)
          });
        }
        return next;
      });
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
    <div className={`fixed inset-0 z-[100] w-screen h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none animate-fadeIn overflow-hidden ${isDragging ? 'cursor-col-resize select-none' : isVerticalDragging ? 'cursor-row-resize select-none' : ''}`}>
      
      {/* ========================================================================= */}
      {/* 0. FULL PAGE PROBLEM GENERATION & CLOUD SYNC OVERLAY                      */}
      {/* ========================================================================= */}
      {isLoadingEnriched && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-fadeIn select-none overflow-hidden">
          {/* Ambient Glowing Blobs */}
          <div className="absolute w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -top-32 -left-32 animate-pulse" />
          <div className="absolute w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none -bottom-32 -right-32 animate-pulse" />
          
          {/* Top Close Button so user can easily cancel and exit */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer z-20 shadow-lg"
            title="Close and return"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative max-w-lg w-full bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center space-y-5 sm:space-y-6">
            
            {/* Animated Center Orb & Pulsing Icons */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/25 animate-pulse">
                <Code2 className="w-10 h-10 text-white animate-bounce" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              </div>
            </div>

            {/* Problem Title & Category Badges */}
            <div className="space-y-2 text-center w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-mono">
                <span className={`w-2 h-2 rounded-full ${
                  difficulty === 'Easy' ? 'bg-emerald-400' : difficulty === 'Hard' ? 'bg-rose-400' : 'bg-amber-400'
                } animate-ping`} />
                <span className="text-slate-300 font-bold">{codingProblem?.category || 'Algorithm'}</span>
                <span className="text-slate-500">•</span>
                <span className={
                  difficulty === 'Easy' ? 'text-emerald-400' : difficulty === 'Hard' ? 'text-rose-400' : 'text-amber-400'
                }>{difficulty}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate px-2">
                {cleanTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Synthesizing problem constraints, type-safe execution drivers, and 10+ verified test cases...
              </p>
            </div>

            {/* Animated Multi-Step Pipeline Indicator */}
            <div className="w-full space-y-2.5 bg-slate-950/70 border border-slate-800/70 rounded-2xl p-4 text-left font-mono text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  <span className="truncate">Authentic LeetCode Specification</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold ml-2">READY</span>
              </div>

              <div className="flex items-center justify-between text-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-purple-500/20 border border-purple-500/60 flex items-center justify-center">
                    <Cloud className="w-2.5 h-2.5 text-purple-400 animate-spin" />
                  </div>
                  <span className="truncate">Multi-argument Test Suite & Drivers</span>
                </div>
                <span className="text-[10px] text-purple-400 animate-pulse font-bold ml-2">PROCESSING</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <Zap className="w-2.5 h-2.5 text-slate-500" />
                  </div>
                  <span className="truncate">Monaco IDE Sandbox & Compiler</span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold ml-2">MOUNTING</span>
              </div>
            </div>

            {/* Progress Bar Shimmer */}
            <div className="w-full space-y-1.5">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full animate-pulse rounded-full" />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Cloud AI Acceleration</span>
                </span>
                <span>Sub-second Latency</span>
              </div>
            </div>

          </div>
        </div>
      )}

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

          {/* Cloud Sync Status Badge */}
          {isLoadingEnriched && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-[11px] font-mono animate-pulse">
              <Cloud className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span className="hidden sm:inline">Syncing Cloud...</span>
            </div>
          )}

          {lcUrl && (
            <a
              href={lcUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-mono font-bold text-xs transition-all shadow-sm cursor-pointer"
              title="Open External Problem Statement"
            >
              <span>Practice</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {gfgUrl && (
            <a
              href={gfgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-mono font-bold text-xs transition-all shadow-sm cursor-pointer"
              title="Open Problem on GeeksforGeeks"
            >
              <span>GFG</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* Telegram DSA Channel Video Button (ONLY IF MATCHING VIDEO EXISTS) */}
          {matchingVideo && (
            <button
              onClick={() => setLeftTab('video')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              title={`Watch Telegram DSA Channel Lecture: ${matchingVideo.title}`}
            >
              <Play className="w-3.5 h-3.5 fill-current text-purple-400" />
              <span className="hidden sm:inline">Watch Video</span>
            </button>
          )}

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
        
        {/* LEFT PANEL: DESCRIPTION, HINTS, EDITORIAL, VIDEO, SOLUTIONS, AI REVIEW */}
        <div 
          style={{ width: `${splitPercent}%` }}
          className="hidden lg:flex bg-[#1e1e1e] border-r border-white/10 flex-col overflow-hidden transition-all duration-75"
        >
          
          {/* LEFT SUB-NAVBAR TABS */}
          <div className="flex items-center space-x-1 px-3 py-2 bg-[#252526] border-b border-white/10 overflow-x-auto no-scrollbar flex-shrink-0">
            <button
              onClick={() => setLeftTab('description')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                leftTab === 'description'
                  ? 'bg-[#1e1e1e] text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setLeftTab('hints')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                leftTab === 'hints'
                  ? 'bg-[#1e1e1e] text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Hints ({problemTemplate.hints?.length || 0})</span>
            </button>

            <button
              onClick={() => setLeftTab('solutions')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                leftTab === 'solutions'
                  ? 'bg-[#1e1e1e] text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Approaches ({problemTemplate.approaches?.length || 1})</span>
            </button>

            {/* TAB: Video Lesson */}
            {hasVideoSolution && (
              <button
                onClick={() => setLeftTab('video')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  leftTab === 'video'
                    ? 'bg-rose-950/80 text-rose-200 shadow-sm border border-rose-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Video Lesson</span>
              </button>
            )}

            <button
              onClick={() => setLeftTab('diagram')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                leftTab === 'diagram'
                  ? 'bg-cyan-950/80 text-cyan-200 shadow-sm border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Visualizer</span>
            </button>

            <button
              onClick={() => setLeftTab('editorial')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                leftTab === 'editorial'
                  ? 'bg-[#1e1e1e] text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Editorial</span>
            </button>

            <button
              onClick={() => setLeftTab('notes')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                leftTab === 'notes'
                  ? 'bg-[#1e1e1e] text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Save className="w-3.5 h-3.5 text-purple-400" />
              <span>Notes</span>
            </button>

            <button
              onClick={() => setLeftTab('submissions')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                leftTab === 'submissions'
                  ? 'bg-[#1e1e1e] text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Submissions ({submissionsList.length})</span>
            </button>

            <button
              onClick={() => setLeftTab('aireview')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                leftTab === 'aireview'
                  ? 'bg-purple-900/60 text-purple-200 shadow-sm border border-purple-500/40 font-bold'
                  : 'text-purple-300 hover:text-purple-100 hover:bg-purple-950/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>AI Code Review</span>
            </button>
          </div>

          {/* LEFT PANEL CONTENT */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-sm text-[#eff1f6] leading-relaxed custom-scrollbar">
            
            {/* TAB 1: DESCRIPTION */}
            {leftTab === 'description' && (
              isLoadingEnriched ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center animate-spin">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/60 flex items-center justify-center shadow-lg">
                      <Cloud className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h3 className="text-sm font-bold text-white tracking-tight">Loading Problem Definition...</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Fetching authentic problem statement, test cases & diagrams from Cloud storage.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>Cloud Storage Direct Stream</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-fadeIn">
                  {/* Header & Meta Badges */}
                  <div className="space-y-3 pb-3 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white tracking-tight">{cleanTitle}</h2>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : difficulty === 'Hard'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {difficulty}
                      </span>

                      <button 
                        className="px-2.5 py-0.5 rounded-full bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                        title="Topic Category"
                      >
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>{problemTemplate.category}</span>
                      </button>

                      <div className="px-2.5 py-0.5 rounded-full bg-white/[0.07] text-slate-300 text-xs font-medium flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{companies.slice(0, 3).join(', ')}</span>
                      </div>

                      {problemTemplate.hints && problemTemplate.hints.length > 0 && (
                        <button
                          onClick={() => setLeftTab('hints')}
                          className="px-2.5 py-0.5 rounded-full bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          title="View Hints"
                        >
                          <Lightbulb className="w-3 h-3 text-amber-400" />
                          <span>Hint</span>
                        </button>
                      )}
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

                  {/* Problem Statement Body */}
                  <div className="space-y-3">
                    <div className="text-[14px] text-[#eff1f6] leading-[1.75] font-normal select-text">
                      <FormattedChatText text={problemTemplate.description} />
                    </div>
                  </div>

                  {/* Example Test Cases */}
                  <div className="space-y-4 pt-2">
                    {(problemTemplate.examples || []).map((ex, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="font-bold text-[14px] text-white tracking-tight">Example {idx + 1}:</div>
                        
                        <div className="p-4 rounded-xl bg-white/[0.04] border-l-2 border-slate-600/70 space-y-1.5 font-mono text-[13px]">
                          {/* LeetCode Example Illustration / Tree / Graph Diagram */}
                          {(ex.image || (ex as any).img) && (
                            <div className="my-2 p-2 rounded-xl bg-black/40 border border-white/10 inline-block max-w-full">
                              <img 
                                src={ex.image || (ex as any).img} 
                                alt={`Example ${idx + 1} Diagram`} 
                                className="max-h-60 rounded-lg object-contain mx-auto"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  if (target.src.includes('/api/image/')) {
                                    const rel = target.src.split('/api/image/')[1];
                                    target.src = `https://assets.leetcode.com/uploads/${rel}`;
                                  }
                                }}
                              />
                            </div>
                          )}

                          <div>
                            <strong className="font-bold text-white font-sans mr-2">Input:</strong>
                            <span className="text-[#eff1f6]">{ex.input}</span>
                          </div>
                          <div>
                            <strong className="font-bold text-white font-sans mr-2">Output:</strong>
                            <span className="text-[#eff1f6]">{ex.output}</span>
                          </div>
                          {ex.explanation && (
                            <div className="pt-1.5 text-slate-300 font-sans text-xs border-t border-white/5">
                              <strong className="font-bold text-white mr-2">Explanation:</strong>
                              <span>{ex.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  <div className="space-y-2.5 pt-4 border-t border-white/10">
                    <div className="font-bold text-[14px] text-white tracking-tight">Constraints:</div>
                    <ul className="list-disc pl-5 space-y-2 text-[#eff1f6] text-xs">
                      {(problemTemplate.constraints || []).map((c, idx) => (
                        <li key={idx}>
                          <code className="lc-code-chip">{c}</code>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* LeetCode Bottom Action & Engagement Bar */}
                  <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>11.2K</span>
                      </button>
                      <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer">
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                      <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>237</span>
                      </button>
                      <button 
                        onClick={handleCopyDescription}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                        title="Copy Problem Statement"
                      >
                        {copiedDescription ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>111 Online</span>
                    </div>
                  </div>

                </div>
              )
            )}

            {/* TAB 2: HINTS (DYNAMIC FROM LEETCODE API / MISTRAL) */}
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
                
                {(problemTemplate.hints && problemTemplate.hints.length > 0) ? (
                  problemTemplate.hints.map((hint, hIdx) => (
                    <div key={hIdx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                        <Lightbulb className="w-4 h-4 text-amber-400" /> Hint {hIdx + 1}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans select-text">
                        {hint}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400 text-xs">
                    No official hints provided for this problem. Try breaking down the problem into smaller subproblems or analyzing base conditions.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: EDITORIAL & MULTI-APPROACH (DYNAMIC) */}
            {leftTab === 'editorial' && (
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Algorithmic Editorial & Approaches</h3>
                  {problemTemplate.approaches && problemTemplate.approaches.length > 0 && (
                    <button
                      onClick={handleCopyEditorial}
                      className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
                    >
                      {copiedEditorial ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEditorial ? 'Copied' : 'Copy Editorial'}</span>
                    </button>
                  )}
                </div>
                
                {(problemTemplate.approaches && problemTemplate.approaches.length > 0) ? (
                  problemTemplate.approaches.map((app, aIdx) => (
                    <div key={app.id || aIdx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-indigo-300 text-sm">{app.name}</div>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[10px] font-mono">
                          Approach {aIdx + 1}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed select-text">
                        {app.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Time Complexity</div>
                          <div className="text-xs font-black text-emerald-400 font-mono mt-0.5">{app.timeComplexity || 'O(N)'}</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Space Complexity</div>
                          <div className="text-xs font-black text-emerald-400 font-mono mt-0.5">{app.spaceComplexity || 'O(1)'}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                      <Sparkles className="w-6 h-6 text-purple-400/60" />
                    </div>
                    <div className="text-slate-200 font-bold text-sm">Editorial Not Available</div>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto">
                      Official editorial walkthrough is not available for this problem yet. You can use the <strong>Ask AI</strong> assistant or Solutions tab to explore optimal implementations.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: VIDEO LECTURE / YOUTUBE STREAM */}
            {leftTab === 'video' && hasVideoSolution && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="font-bold text-slate-100 flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-rose-400" />
                    <span>{youtubeEmbedUrl ? 'Video Solution & Intuition' : 'SDETube Master Channel Stream'}</span>
                  </div>
                  {youtubeEmbedUrl ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-700/60 text-rose-300 text-[10px] font-mono font-bold">
                      YouTube Stream
                    </span>
                  ) : validMatchingVideo?.stream_url ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[10px] font-mono font-bold">
                      Channel Stream HD
                    </span>
                  ) : null}
                </div>

                {youtubeEmbedUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-rose-500/40 shadow-2xl bg-black aspect-video">
                    <iframe
                      src={`${youtubeEmbedUrl}?autoplay=0&rel=0`}
                      title="Video Explanation"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : validMatchingVideo?.stream_url ? (
                  <div className="rounded-2xl overflow-hidden border border-emerald-500/40 shadow-2xl bg-black aspect-video">
                    <video
                      src={validMatchingVideo.stream_url.startsWith('http') ? validMatchingVideo.stream_url : `${TELEGRAM_BACKEND_URL}${validMatchingVideo.stream_url}`}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : null}
              </div>
            )}

            {/* TAB: UML & ARCHITECTURE VISUALIZER (KROKI ENGINE) */}
            {leftTab === 'diagram' && (
              <div className="h-[620px] min-h-[500px] flex flex-col rounded-2xl overflow-hidden border border-slate-800 animate-fadeIn">
                <KrokiDiagramViewer
                  slugOrTitle={cleanTitle || currentProblemSlug || problemTemplate.name}
                  category={problemTemplate.category}
                />
              </div>
            )}

            {/* TAB: PERSONAL STUDY NOTES */}
            {leftTab === 'notes' && (
              <div className="space-y-3 font-sans animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>Personal Study Notes (.txt / Cloudflare R2)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Auto-saved locally and synchronized as a .txt file
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownloadModalNotes}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold cursor-pointer transition-all"
                      title="Download notes as .txt"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>.txt</span>
                    </button>

                    <button
                      onClick={handleSaveModalNotes}
                      disabled={isSavingModalNotes}
                      className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-all shadow-sm disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingModalNotes ? 'Saving...' : modalNotesSavedStatus === 'synced' ? 'Synced!' : 'Save'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Insert Snippet Buttons */}
                <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar pb-1 text-[11px]">
                  <span className="font-bold text-slate-500 uppercase">Insert:</span>
                  <button
                    onClick={() => {
                      const snippet = `\n[ CORE INTUITION / KEY APPROACH ]\n• Main observation:\n• State & Pointer transitions:\n• Why this works:\n`;
                      setModalNotesContent(prev => prev ? prev + snippet : snippet.trim());
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold border border-slate-700 cursor-pointer whitespace-nowrap"
                  >
                    + Intuition
                  </button>
                  <button
                    onClick={() => {
                      const snippet = `\n[ EDGE CASES TO CONSIDER ]\n• Empty array / single element\n• Negative numbers / zero boundaries\n• Duplicates / all elements identical\n• Integer overflow limits\n`;
                      setModalNotesContent(prev => prev ? prev + snippet : snippet.trim());
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold border border-slate-700 cursor-pointer whitespace-nowrap"
                  >
                    + Edge Cases
                  </button>
                  <button
                    onClick={() => {
                      const snippet = `\n[ COMPLEXITY ANALYSIS ]\n• Time Complexity:  O()\n• Space Complexity: O()\n`;
                      setModalNotesContent(prev => prev ? prev + snippet : snippet.trim());
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold border border-slate-700 cursor-pointer whitespace-nowrap"
                  >
                    + Complexity
                  </button>
                </div>

                <div className="flex flex-col h-[380px]">
                  <textarea
                    value={modalNotesContent}
                    onChange={(e) => setModalNotesContent(e.target.value)}
                    placeholder="Write key observations, edge cases, formula, or custom intuition here... (Saved automatically as .txt)"
                    className="w-full flex-1 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono leading-relaxed placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: SOLUTIONS */}
            {leftTab === 'solutions' && (() => {
              const staticSol = problemTemplate.solutions?.[solutionLang];
              const aiSol = aiGeneratedSolutions[solutionLang];
              const activeSolutionCode = aiSol?.code || (staticSol && staticSol !== problemTemplate.starters[solutionLang] ? staticSol : null);
              const hasWorkedSolution = Boolean(activeSolutionCode);

              if (!isSolutionRevealed) {
                return (
                  <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4 my-4 animate-fadeIn">
                    <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800 flex items-center justify-center mx-auto text-purple-300">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-100">Official Solution Protected</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Try implementing your algorithm and running the test cases first before checking the reference solution.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsSolutionRevealed(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 cursor-pointer transition-all flex items-center gap-1.5 mx-auto hover:scale-105"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Reveal Official Solution</span>
                    </button>
                  </div>
                );
              }

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
                    <div className="grid grid-cols-3 gap-2.5">
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

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
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
                      <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
                        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center text-xs font-mono">
                          <span className="text-slate-400 font-bold flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                            Solution.{solutionLang === 'cpp' ? 'cpp' : solutionLang === 'python' ? 'py' : solutionLang === 'java' ? 'java' : solutionLang === 'javascript' ? 'js' : solutionLang === 'go' ? 'go' : 'rs'}
                          </span>
                        </div>
                        <div className="h-72 w-full">
                          <Editor
                            height="100%"
                            language={solutionLang === 'cpp' ? 'cpp' : solutionLang === 'python' ? 'python' : solutionLang === 'java' ? 'java' : solutionLang === 'javascript' ? 'javascript' : solutionLang === 'go' ? 'go' : 'rust'}
                            theme="vs-dark"
                            value={formatCodeForDisplay(activeSolutionCode, solutionLang)}
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
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                    <span>Submission History ({submissionsList.length})</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Persisted in Browser Cache & Cloud
                  </span>
                </div>
                
                {submissionsList.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-slate-400 font-medium">No submissions recorded yet for {cleanTitle}.</div>
                    <p className="text-[11px] text-slate-600">Click "Submit" to judge your solution and view complexity analytics.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {submissionsList.map((sub, idx) => (
                      <div key={sub.id || idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-black border ${
                              sub.status === 'Accepted'
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60 shadow-sm shadow-emerald-900/30'
                                : sub.status === 'Runtime Error'
                                ? 'bg-rose-950/80 text-rose-400 border-rose-700/60'
                                : 'bg-amber-950/80 text-amber-400 border-amber-700/60'
                            }`}>
                              {sub.status}
                            </span>
                            <span className="text-xs font-mono font-bold text-purple-300">{sub.lang}</span>
                            <span className="text-[11px] text-slate-500 font-mono">({sub.passedCount ?? (sub.status === 'Accepted' ? 'All' : 'Partial')}/{sub.totalCount || problemTemplate.testCases?.length || 10} Cases)</span>
                          </div>

                          <span className="text-[10px] text-slate-500 font-mono">{sub.timestamp}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-xs font-mono text-slate-400">
                          <div className="flex items-center space-x-3">
                            <span>Runtime: <strong className="text-slate-200">{sub.runtime}</strong></span>
                            <span>Memory: <strong className="text-slate-200">{sub.memory}</strong></span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {sub.analytics && (
                              <button
                                onClick={() => {
                                  setSubmissionAnalytics(sub.analytics!);
                                  setIsSubmissionVisualizerOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-700/50 text-purple-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                title="Open Graphical Complexity & Big-O Visualizer"
                              >
                                <BarChart3 className="w-3 h-3 text-purple-300" />
                                <span>Visualizer</span>
                              </button>
                            )}

                            {sub.code && (
                              <button
                                onClick={() => {
                                  setCode(sub.code!);
                                  if (sub.lang) setLanguage(sub.lang.toLowerCase() as SupportedLanguage);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                title="Load this code into the editor"
                              >
                                <Code className="w-3 h-3 text-indigo-400" />
                                <span>Load Code</span>
                              </button>
                            )}

                            {sub.code && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(sub.code!);
                                  setCopiedCode(true);
                                  setTimeout(() => setCopiedCode(false), 2000);
                                }}
                                className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-[10px] cursor-pointer"
                                title="Copy submitted code"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
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
                    {(aiReview.suggestions || []).map((sug, idx) => (
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
          {/* LeetCode Standard Editor Header Bar */}
          <div className="h-10 bg-[#1e1e1e] border-b border-white/10 px-3 flex items-center justify-between flex-shrink-0 z-10 select-none">
            {/* Left: Language Selector */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                  className="bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-xs font-mono font-semibold text-slate-200 rounded-lg px-2.5 py-1 outline-none cursor-pointer appearance-none pr-7 transition-all focus:border-indigo-500"
                >
                  <option value="cpp" className="bg-[#1e1e1e] text-slate-200">C++</option>
                  <option value="python" className="bg-[#1e1e1e] text-slate-200">Python 3</option>
                  <option value="java" className="bg-[#1e1e1e] text-slate-200">Java</option>
                  <option value="javascript" className="bg-[#1e1e1e] text-slate-200">JavaScript</option>
                  <option value="go" className="bg-[#1e1e1e] text-slate-200">Go</option>
                  <option value="rust" className="bg-[#1e1e1e] text-slate-200">Rust</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {problemTemplate.approaches && problemTemplate.approaches.length > 1 && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-700/50 text-[10px] font-mono text-indigo-300">
                  {problemTemplate.approaches.find(a => a.id === selectedApproachId)?.name || 'Approach'}
                </span>
              )}
            </div>

            {/* Right: LeetCode Toolbar Actions */}
            <div className="flex items-center space-x-1.5">
              {/* Save to Cloud Button with Hover Tooltip */}
              <div className="relative group">
                <button
                  onClick={handleSyncCodeToCloud}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    codeSaveStatus === 'synced'
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-sm'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  <Cloud className={`w-3.5 h-3.5 ${codeSaveStatus === 'synced' ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'}`} />
                  <span className="text-[11px]">{codeSaveStatus === 'synced' ? 'Synced (₹0.05)' : 'Save to Cloud'}</span>
                </button>

                {/* Tooltip on Hover */}
                <div className="absolute top-8 right-0 bg-slate-900 border border-slate-700/80 text-slate-200 text-[11px] font-sans px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none z-30 flex items-center gap-1">
                  <span>Save to Cloud</span>
                  <span className="text-amber-400 font-mono font-bold">(Deducts ₹0.05)</span>
                </div>
              </div>

              {/* Reset to Default Template Button */}
              <div className="relative group">
                <button
                  onClick={handleResetCode}
                  className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-700/60 transition-colors cursor-pointer"
                  aria-label="Reset to default code definition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <div className="absolute top-8 right-0 bg-slate-900 border border-slate-700/80 text-slate-200 text-[11px] font-sans px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none z-30">
                  Reset to default code definition
                </div>
              </div>

              {/* Copy Code Button */}
              <div className="relative group">
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-slate-200 border border-white/10 transition-colors cursor-pointer"
                  aria-label="Copy code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <div className="absolute top-8 right-0 bg-slate-900 border border-slate-700/80 text-slate-200 text-[11px] font-sans px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none z-30">
                  {copiedCode ? 'Copied!' : 'Copy code'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[160px] relative overflow-hidden">
            <Editor
              height="100%"
              language={language === 'rust' ? 'rust' : language === 'go' ? 'go' : language}
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
                tabSize: 4
              }}
            />
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
                  title="Run code against active test case (Ctrl + ')"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 group"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                  <span>{isExecuting ? 'Running...' : 'Run'}</span>
                  <span className="hidden sm:inline-block ml-1 text-[10px] font-mono font-medium px-1 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-700 group-hover:text-slate-200">
                    Ctrl+'
                  </span>
                </button>

                <button
                  onClick={() => handleExecute(true)}
                  disabled={isExecuting}
                  title="Submit code against all test cases (Ctrl + Enter)"
                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 group"
                >
                  <CheckCircle className="w-3.5 h-3.5 fill-current" />
                  <span>{isExecuting ? 'Submitting...' : 'Submit'}</span>
                  <span className="hidden sm:inline-block ml-1 text-[10px] font-mono font-medium px-1 py-0.5 rounded bg-emerald-950/80 text-emerald-200 border border-emerald-500/40">
                    Ctrl+↵
                  </span>
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
                
                {/* TAB A: TESTCASES (Show All Test Cases) */}
                {consoleTab === 'testcase' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-[70%] no-scrollbar">
                        {(problemTemplate.testCases || []).map((tc, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setActiveTestCaseIdx(idx);
                              setTestInput(tc);
                            }}
                            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                              activeTestCaseIdx === idx
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setReportTestCaseIdx(activeTestCaseIdx);
                            setIsReportTestCaseOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/50 text-amber-300 hover:text-amber-200 text-[10px] font-bold font-sans flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          title="Report or fix incorrect testcase with AI"
                        >
                          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Report / Fix with AI</span>
                        </button>

                        <span className="text-[10px] text-emerald-400 font-mono px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 whitespace-nowrap">
                          {problemTemplate.testCases?.length || 0} Cases
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                        <span>Input (Case {activeTestCaseIdx + 1}):</span>
                        {currentExpectedOutput && (
                          <span className="text-slate-400 font-normal font-mono normal-case">
                            Expected: <code className="text-indigo-300 font-bold">{currentExpectedOutput}</code>
                          </span>
                        )}
                      </div>
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
                    {submissionResult ? (
                      <div className="space-y-3">
                        
                        {/* Status Header with Comprehensive Correctness Evaluation */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <div className="flex items-center space-x-2 font-black text-sm">
                            {submissionResult.failedStderr && (submissionResult.failedStderr.includes('error:') || submissionResult.failedStderr.includes('Runtime Error') || submissionResult.failedStderr.includes('Exception') || submissionResult.failedStderr.includes('Traceback')) ? (
                              <>
                                <XCircle className="w-5 h-5 text-rose-400" />
                                <span className="text-rose-400">
                                  {submissionResult.failedStderr.includes('error:') ? 'Compilation Error' : 'Runtime Error'}
                                  {submissionResult.isSubmission && ` (Case ${(submissionResult.failedCaseIdx ?? 0) + 1} of ${submissionResult.totalCount})`}
                                </span>
                              </>
                            ) : submissionResult.isSuccess ? (
                              <>
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                <span className="text-emerald-400">
                                  {submissionResult.isSubmission
                                    ? `Accepted (Passed all ${submissionResult.totalCount}/${submissionResult.totalCount} Test Cases)`
                                    : `Accepted (Case ${activeTestCaseIdx + 1})`}
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-amber-400" />
                                <span className="text-amber-400">
                                  {submissionResult.isSubmission
                                    ? `Wrong Answer (Failed Case ${(submissionResult.failedCaseIdx ?? 0) + 1} of ${submissionResult.totalCount})`
                                    : `Wrong Answer (Case ${activeTestCaseIdx + 1})`}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center space-x-3 font-mono text-xs text-slate-400">
                            <span>Runtime: <strong className="text-slate-200">{executionTime} ms</strong></span>
                            <span>Memory: <strong className="text-slate-200">{executionResult?.memory_used_kb || 3420} KB</strong></span>
                          </div>
                        </div>

                        {/* If failed, show quick AI report banner */}
                        {!submissionResult.isSuccess && (
                          <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 text-amber-300">
                              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                              <span className="text-[11px] font-medium">Suspect this testcase or expected output is wrong?</span>
                            </div>
                            <button
                              onClick={() => {
                                setReportTestCaseIdx(submissionResult?.failedCaseIdx ?? activeTestCaseIdx);
                                setIsReportTestCaseOpen(true);
                              }}
                              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold font-sans flex items-center gap-1.5 transition-all cursor-pointer shadow-md flex-shrink-0"
                            >
                              <Wand2 className="w-3 h-3" />
                              <span>Verify & Fix with AI</span>
                            </button>
                          </div>
                        )}

                        {/* Visualizer Trigger Banner (Only shown if all testcases passed / Accepted) */}
                        {submissionResult.isSubmission && submissionResult.isSuccess && submissionAnalytics && (
                          <button
                            onClick={() => setIsSubmissionVisualizerOpen(true)}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-sky-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center justify-between transition-all shadow-lg shadow-purple-600/10 group cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                              <span>Open Graphical Complexity & Big-O Visualizer</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/40 text-[10px] font-mono text-purple-200 group-hover:translate-x-0.5 transition-transform">
                              Analyze Speed & Memory 📊
                            </span>
                          </button>
                        )}


                        {/* If failed in submission or run, show failing testcase input with option to load and run */}
                        {submissionResult.failedInput && (
                          <div className="space-y-1">
                            <div className="text-[10px] text-amber-400 font-bold uppercase flex items-center justify-between">
                              <span>Failed Test Case Input (Case {(submissionResult.failedCaseIdx ?? 0) + 1}):</span>
                              <button
                                onClick={() => {
                                  if (submissionResult.failedInput) {
                                    setTestInput(submissionResult.failedInput);
                                    setConsoleTab('testcase');
                                    if (typeof submissionResult.failedCaseIdx === 'number') {
                                      setActiveTestCaseIdx(submissionResult.failedCaseIdx);
                                    }
                                  }
                                }}
                                className="px-2.5 py-0.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-[10px] font-bold font-sans flex items-center gap-1 transition-all cursor-pointer"
                                title="Load this test case into the Test Cases tab to run and debug"
                              >
                                <span>+ Use Testcase to Run</span>
                              </button>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-900/40 text-slate-200 font-mono text-xs">
                              {submissionResult.failedInput}
                            </div>
                          </div>
                        )}

                        {/* Actual Output Box */}
                        {executionResult?.stdout && (
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Your Output:</div>
                            <div className={`p-2.5 rounded-xl bg-slate-950 border font-mono text-xs whitespace-pre-wrap ${
                              submissionResult.isSuccess
                                ? 'border-emerald-800/80 text-emerald-400'
                                : 'border-amber-800/80 text-amber-300'
                            }`}>
                              {executionResult.stdout}
                            </div>
                          </div>
                        )}

                        {/* Expected Output Box */}
                        {(submissionResult.failedExpected || currentExpectedOutput) && (
                          <div className="space-y-1">
                            <div className="text-[10px] text-indigo-400 font-bold uppercase flex items-center justify-between">
                              <span>Expected Output:</span>
                              {submissionResult.isSuccess && (
                                <span className="text-[10px] text-emerald-400 font-mono normal-case font-medium flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>Output Matched</span>
                                </span>
                              )}
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-xs">
                              {submissionResult.isSuccess
                                ? (executionResult?.stdout || currentExpectedOutput)
                                : (submissionResult.failedExpected || currentExpectedOutput)}
                            </div>
                          </div>
                        )}

                        {/* Stderr / Compiler Output Box (Shown on error/diagnostic) */}
                        {!submissionResult.isSuccess && (executionResult?.stderr || submissionResult.failedStderr) && (
                          <div className="space-y-1">
                            <div className="text-[10px] text-rose-400 font-bold uppercase">Compiler / Runtime Diagnostics:</div>
                            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 font-mono text-xs whitespace-pre-wrap">
                              {executionResult?.stderr || submissionResult.failedStderr}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-500 py-6 text-center">
                        Click "Run" to test the first 3 cases, or "Submit" to judge against all test cases.
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

              <div className="flex items-center space-x-1.5">
                {/* Voice Auto-Speak Toggle */}
                {isSpeechSynthesisSupported() && (
                  <button
                    onClick={toggleAutoSpeak}
                    className={`px-2 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                      isAutoSpeakEnabled
                        ? 'bg-purple-900/50 border-purple-500/60 text-purple-200 shadow-sm shadow-purple-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title={isAutoSpeakEnabled ? "Auto-speak AI responses (Enabled)" : "Auto-speak AI responses (Disabled)"}
                  >
                    {isAutoSpeakEnabled ? <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{isAutoSpeakEnabled ? 'Voice On' : 'Voice Off'}</span>
                  </button>
                )}

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
                  onClick={() => {
                    stopSpeaking();
                    stopSpeechRecognition();
                    setIsVoiceInputActive(false);
                    setIsRightAskAiOpen(false);
                  }}
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
                    <div className="font-sans pr-14">
                      <FormattedChatText text={msg.content} />
                    </div>
                    {msg.role === 'assistant' && (
                      <div className="absolute top-2 right-2 flex items-center space-x-1">
                        {isSpeechSynthesisSupported() && (
                          <button
                            onClick={() => handleSpeakMessage(msg.content, idx)}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              speakingMessageIdx === idx 
                                ? 'text-purple-400 bg-purple-950/60' 
                                : 'text-slate-500 hover:text-purple-300'
                            }`}
                            title={speakingMessageIdx === idx ? "Stop speaking" : "Speak response aloud"}
                          >
                            {speakingMessageIdx === idx ? (
                              <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            setCopiedMsgIdx(idx);
                            setTimeout(() => setCopiedMsgIdx(null), 2000);
                          }}
                          className="p-1 text-slate-500 hover:text-purple-300 transition-colors cursor-pointer"
                          title="Copy message text"
                        >
                          {copiedMsgIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
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
              {isVoiceInputActive && (
                <div className="flex gap-2.5 items-center text-red-400 text-xs font-mono p-2 rounded-xl bg-red-950/30 border border-red-800/40 animate-pulse">
                  <Radio className="w-4 h-4 animate-spin text-red-400" />
                  <span>Listening... Speak your question into microphone</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
              {isSpeechRecognitionSupported() && (
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isVoiceInputActive
                      ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-purple-300'
                  }`}
                  title={isVoiceInputActive ? "Click to stop listening" : "Speak your question (Voice Input)"}
                >
                  {isVoiceInputActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
              <input
                type="text"
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                placeholder={isVoiceInputActive ? "Listening to your voice..." : "Ask about this problem, code, or testcases..."}
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

      {/* Submission & Complexity Analytics Visualizer Overlay */}
      {isSubmissionVisualizerOpen && submissionAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-5xl h-[92vh] bg-slate-950 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-scaleUp">
            <button
              onClick={() => setIsSubmissionVisualizerOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700 transition-colors shadow-lg cursor-pointer"
              title="Close Visualizer"
            >
              <X className="w-4 h-4" />
            </button>
            <SubmissionVisualizer
              data={submissionAnalytics}
              onClose={() => setIsSubmissionVisualizerOpen(false)}
              onRetry={() => {
                setIsSubmissionVisualizerOpen(false);
                setConsoleTab('testcase');
              }}
              onAskAi={(prompt) => {
                setIsSubmissionVisualizerOpen(false);
                setIsRightAskAiOpen(true);
                setAiInputText(prompt);
              }}
              onReportTestCase={(caseIdx) => {
                setReportTestCaseIdx(caseIdx);
                setIsReportTestCaseOpen(true);
              }}
            />
          </div>
        </div>
      )}


      {/* AI Testcase Inspector & Repair Modal */}
      <ReportTestCaseModal
        isOpen={isReportTestCaseOpen}
        onClose={() => setIsReportTestCaseOpen(false)}
        problemTitle={cleanTitle}
        problemSlug={currentProblemSlug}
        problemStatement={problemTemplate.description}
        methodSignature={problemTemplate.starters?.[language] || problemTemplate.starters?.cpp || ''}
        testCaseIndex={reportTestCaseIdx}
        currentInput={problemTemplate.testCases?.[reportTestCaseIdx] || testInput}
        currentExpectedOutput={problemTemplate.expectedOutputs?.[reportTestCaseIdx]}
        userActualOutput={submissionResult?.failedOutput || executionResult?.stdout}
        language={language}
        userEmail={getCurrentStudent()?.email || 'student@edustream.io'}
        onResubmit={() => {
          setIsReportTestCaseOpen(false);
          handleExecute(true);
        }}
        onApplyCorrection={(correctedInput, correctedExpected) => {
          let finalInput = (correctedInput || '').trim();
          const pNames = extractParamNames(problemTemplate.starters, problemTemplate.examples);
          if (pNames.length === 1 && !finalInput.includes('=')) {
            finalInput = `${pNames[0]} = ${finalInput}`;
          }

          setProblemTemplate(prev => {
            const updatedCases = [...(prev.testCases || [])];
            const updatedExp = [...(prev.expectedOutputs || [])];
            updatedCases[reportTestCaseIdx] = finalInput;
            if (correctedExpected) updatedExp[reportTestCaseIdx] = correctedExpected.trim();
            
            const next = { ...prev, testCases: updatedCases, expectedOutputs: updatedExp };
            try {
              const slug = currentProblemSlug;
              localStorage.setItem(`edustream_testcase_override_${slug}`, JSON.stringify(next));
              localStorage.setItem(`edustream_problem_spec_${slug}`, JSON.stringify(next));
              // Invalidate stale driver cache so resilient driver is generated/used
              const langs = ['cpp', 'python', 'javascript', 'java', 'go', 'rust'];
              langs.forEach(l => localStorage.removeItem(`edustream_driver_${slug}_${l}`));
            } catch {}
            return next;
          });

          if (reportTestCaseIdx === activeTestCaseIdx) {
            setTestInput(finalInput);
          }
        }}
      />

    </div>
  );
};

