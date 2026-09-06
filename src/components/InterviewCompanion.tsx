import React, { useState, useEffect, useRef, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Code2, 
  Layers, 
  Cpu, 
  UserCheck, 
  Award, 
  RotateCcw, 
  Play, 
  Pause, 
  ChevronRight, 
  Building2, 
  Zap, 
  FileText, 
  RefreshCw, 
  HelpCircle, 
  ShieldAlert, 
  Calculator, 
  Compass, 
  Radio, 
  Settings, 
  ArrowRight, 
  Sliders, 
  Check, 
  LayoutTemplate,
  Upload,
  User,
  Briefcase,
  GraduationCap,
  X,
  FileCheck2,
  Maximize2,
  Minimize2,
  Target,
  Wand2,
  Flame,
  History,
  HardDrive,
  Database
} from 'lucide-react';
import { 
  SdeLevel, 
  InterviewRound, 
  TestStyle,
  SUPPORTED_COMPANIES, 
  SUPPORTED_TEST_STYLES,
  CuratedInterviewQuestion, 
  getCompanyInterviewData,
  generateDynamicInterviewQuestion
} from '../lib/githubInterviewData';
import { 
  InterviewMessage, 
  InterviewContext, 
  CandidateDetails,
  sendInterviewerMessage, 
  speakInterviewerText, 
  speakInterviewerResponse,
  streamInterviewerSpeech,
  abortStreamingPlayback,
  stripEmotionTagsForUI,
  stopInterviewerSpeech,
  terminateInterviewerAudioSpeech,
  IndianVoiceProfile,
  getOrLockInterviewerVoice,
  resetInterviewerVoiceLock,
  unlockSpeechSynthesis,
  cleanSpokenCandidateName,
  PanelInterviewer,
  FAANG_INTERVIEWER_PANEL,
  getRandomPanelInterviewer
} from '../lib/interviewService';
import { evaluateInterview, InterviewScorecard } from '../lib/interviewEvaluator';
import { 
  saveInterviewSession, 
  getInterviewHistory, 
  getInterviewSessionDetails,
  StoredInterviewRecord, 
  FullInterviewSessionPayload 
} from '../lib/interviewHistoryService';
import { InterviewScorecardModal } from './InterviewScorecardModal';
import { KrokiDiagramViewer } from './KrokiDiagramViewer';
import { HLDArchitectureCanvas, HLDProblemSpec } from './HLDArchitectureCanvas';
import { FormattedChatText } from './FormattedChatText';
import { SupportedLanguage } from '../lib/compiler';
import { extractTextFromFile, analyzeResumeWithAI, ParsedCandidateProfile } from '../lib/resumeParser';
import { canAffordAction, deductCredits, PRICING_CONFIG, fetchLivePlatformPricing } from '../lib/billing';
import { getCurrentStudent } from '../lib/auth';
import { WalletTopupModal } from './WalletTopupModal';
import confetti from 'canvas-confetti';
import { runTestSuiteAgainstCompiler, TestCase, TestSuiteExecutionReport } from '../lib/testHarness';
import { InterviewStateMachine, InterviewStage } from '../lib/interviewStateMachine';
import { AntiCheatMonitor } from '../lib/antiCheatService';
import { validateHLDTopology } from '../lib/hldTopologyValidator';
import { VoiceActivityController } from '../lib/audioVAD';
import { 
  InterviewExecutionMode, 
  RoundDefinition, 
  CompletedRoundRecord, 
  OfferPacket, 
  getCompanyRoundSchedule, 
  evaluateRoundElimination, 
  generateFinalOfferPacket 
} from '../lib/multiRoundLoopService';
import { MultiRoundAdvanceModal } from './MultiRoundAdvanceModal';
import { MultiRoundEliminationModal } from './MultiRoundEliminationModal';
import { MultiRoundOfferModal } from './MultiRoundOfferModal';

interface InterviewCompanionProps {
  onBackToDashboard?: () => void;
}

export const InterviewCompanion: React.FC<InterviewCompanionProps> = ({ onBackToDashboard }) => {
  // Session Flow State: false = Pre-Interview Setup Wizard, true = Active Live Interview Room
  const [isInterviewStarted, setIsInterviewStarted] = useState<boolean>(false);

  // Fullscreen State & Proctoring Enforcement
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState<boolean>(false);

  // HLD Canvas & Screen Sizing
  const [isCanvasMaximized, setIsCanvasMaximized] = useState<boolean>(false);

  // Wallet & Billing State
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [billingError, setBillingError] = useState<string>('');

  // Pre-Flight Microphone Check State
  const [isMicPermissionGranted, setIsMicPermissionGranted] = useState<boolean>(false);
  const [isCheckingMic, setIsCheckingMic] = useState<boolean>(false);

  // Candidate Profile Form State
  const [candidateName, setCandidateName] = useState<string>(() => cleanSpokenCandidateName(getCurrentStudent()?.email?.split('@')[0]) || 'Candidate');
  const [candidateExpYears, setCandidateExpYears] = useState<string>('2-4');
  const [candidateRole, setCandidateRole] = useState<string>('Software Engineer');
  const [candidateTechStack, setCandidateTechStack] = useState<string>('C++, Python, React, PostgreSQL, Redis, Kafka');
  const [candidateGoals, setCandidateGoals] = useState<string>('');
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [isParsingResume, setIsParsingResume] = useState<boolean>(false);

  // Interview Configuration State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('google');
  const [selectedLevel, setSelectedLevel] = useState<SdeLevel>('SDE-2');
  const [selectedRound, setSelectedRound] = useState<InterviewRound>('DSA');
  const [selectedTestStyle, setSelectedTestStyle] = useState<TestStyle>('faang_bar_raiser');
  const [language, setLanguage] = useState<SupportedLanguage>('cpp');
  const [assignedInterviewer, setAssignedInterviewer] = useState<PanelInterviewer>(() => getRandomPanelInterviewer());
  const [selectedVoiceProfile, setSelectedVoiceProfile] = useState<IndianVoiceProfile>(() => assignedInterviewer.voiceProfile);

  const handleShuffleInterviewer = () => {
    setAssignedInterviewer(prev => {
      const pool = FAANG_INTERVIEWER_PANEL.filter(p => p.id !== prev.id);
      const next = pool[Math.floor(Math.random() * pool.length)];
      setSelectedVoiceProfile(next.voiceProfile);
      return next;
    });
  };

  useEffect(() => {
    if (assignedInterviewer?.voiceProfile) {
      setSelectedVoiceProfile(assignedInterviewer.voiceProfile);
    }
  }, [assignedInterviewer]);

  // Active Problem & Custom AI Generation State
  const [availableQuestions, setAvailableQuestions] = useState<CuratedInterviewQuestion[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<CuratedInterviewQuestion | null>(null);
  const [isGeneratingCustomQuestion, setIsGeneratingCustomQuestion] = useState<boolean>(false);
  const [editorCode, setEditorCode] = useState<string>('// Write your optimal solution here\n\n');
  const [whiteboardNotes, setWhiteboardNotes] = useState<string>('');
  const [rightTab, setRightTab] = useState<'code' | 'hld_canvas' | 'diagram' | 'math' | 'star'>('code');

  // Interview Dialogue & Speech State
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [interimSpeech, setInterimSpeech] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isHandsFreeMode, setIsHandsFreeMode] = useState<boolean>(true);
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);

  // Timer State (45 mins default)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Auto-Pause & Proctoring State (Freeze timer/voice when tab is blurred or hidden)
  const [isInterviewPaused, setIsInterviewPaused] = useState<boolean>(false);
  const [pauseReason, setPauseReason] = useState<string>('');
  const [isChangeQuestionModalOpen, setIsChangeQuestionModalOpen] = useState<boolean>(false);

  // Deterministic State Machine & Test Suite Harness State
  const [currentStage, setCurrentStage] = useState<InterviewStage>('CLARIFICATION');
  const [testSuiteReport, setTestSuiteReport] = useState<TestSuiteExecutionReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const stateMachineRef = useRef<InterviewStateMachine>(new InterviewStateMachine({ lockEditorUntilCoding: false }));
  const antiCheatRef = useRef<AntiCheatMonitor>(new AntiCheatMonitor());

  // Assessment & Scorecard State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [scorecard, setScorecard] = useState<InterviewScorecard | null>(null);
  const [isScorecardOpen, setIsScorecardOpen] = useState<boolean>(false);

  // Multi-Round Elimination Loop State
  const [interviewMode, setInterviewMode] = useState<InterviewExecutionMode>('single');
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [completedRoundRecords, setCompletedRoundRecords] = useState<CompletedRoundRecord[]>([]);
  const [advanceModalData, setAdvanceModalData] = useState<{ roundRecord: CompletedRoundRecord; nextRound: RoundDefinition } | null>(null);
  const [eliminationModalData, setEliminationModalData] = useState<{ roundRecord: CompletedRoundRecord } | null>(null);
  const [finalOfferPacket, setFinalOfferPacket] = useState<OfferPacket | null>(null);

  const companySchedule = useMemo(() => getCompanyRoundSchedule(selectedCompanyId, selectedLevel), [selectedCompanyId, selectedLevel]);
  const activeRoundDef = useMemo(() => companySchedule[currentRoundIndex] || companySchedule[0], [companySchedule, currentRoundIndex]);

  // History Drawer / Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyRecords, setHistoryRecords] = useState<StoredInterviewRecord[]>([]);
  const [selectedHistorySession, setSelectedHistorySession] = useState<FullInterviewSessionPayload | null>(null);
  const [isLoadingHistoryDetails, setIsLoadingHistoryDetails] = useState<boolean>(false);

  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechAccumulatorRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const isRecognitionActiveRef = useRef<boolean>(false);
  const isAiSpeakingRef = useRef<boolean>(false);
  const isAiThinkingRef = useRef<boolean>(false);
  const isHandsFreeModeRef = useRef<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vadRef = useRef<VoiceActivityController | null>(null);
  const hasPermanentMicErrorRef = useRef<boolean>(false);
  const recognitionRestartTimeoutRef = useRef<any>(null);
  const hasEnteredFullscreenRef = useRef<boolean>(false);
  const speechEchoCooldownUntilRef = useRef<number>(0);
  const lastSpokenInterviewerTextRef = useRef<string>('');

  // Self-hearing acoustic echo detection filter
  const isAcousticEchoOfInterviewer = (spoken: string, lastInterviewerText: string): boolean => {
    if (!lastInterviewerText || !spoken) return false;
    const cleanSpoken = spoken.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const cleanInterviewer = lastInterviewerText.toLowerCase().replace(/[^\w\s]/g, '').trim();
    if (cleanSpoken.length < 5) return false;

    // 1. Direct substring containment (candidate speech is inside what interviewer just said)
    if (cleanInterviewer.includes(cleanSpoken)) return true;

    // 2. High word overlap test (> 65% of candidate words match interviewer words)
    const spokenWords = cleanSpoken.split(/\s+/).filter(w => w.length > 2);
    if (spokenWords.length >= 3) {
      const interviewerWords = new Set(cleanInterviewer.split(/\s+/));
      let matchCount = 0;
      for (const w of spokenWords) {
        if (interviewerWords.has(w)) matchCount++;
      }
      if (matchCount / spokenWords.length >= 0.65) {
        return true;
      }
    }
    return false;
  };

  // Keep refs synchronized
  useEffect(() => { 
    isAiSpeakingRef.current = isAiSpeaking; 
    vadRef.current?.setTTSActive(isAiSpeaking);
    if (typeof window !== 'undefined') {
      (window as any).isTTSActive = isAiSpeaking;
    }
  }, [isAiSpeaking]);
  useEffect(() => { isAiThinkingRef.current = isAiThinking; }, [isAiThinking]);
  useEffect(() => { isHandsFreeModeRef.current = isHandsFreeMode; }, [isHandsFreeMode]);

  // Selected company object
  const currentCompany = useMemo(() => {
    return SUPPORTED_COMPANIES.find(c => c.id === selectedCompanyId) || SUPPORTED_COMPANIES[0];
  }, [selectedCompanyId]);

  // Handle Fullscreen toggle and listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const isCurrentlyFullscreen = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
      if (isCurrentlyFullscreen) {
        hasEnteredFullscreenRef.current = true;
        setShowFullscreenWarning(false);
      } else if (hasEnteredFullscreenRef.current && isInterviewStarted && !isEvaluating && !scorecard) {
        // Only trigger warning if candidate previously entered fullscreen and then escaped
        antiCheatRef.current.recordFullscreenEscape();
        setShowFullscreenWarning(true);
        pauseInterview('Fullscreen mode was exited — Fullscreen is strictly required during live technical interviews');
      } else {
        setShowFullscreenWarning(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isInterviewStarted, isEvaluating, scorecard]);

  // Tab Inactivity & Page Left Auto-Pause Proctoring
  const pauseInterview = (reason = 'Page left or focus moved away from interview tab') => {
    antiCheatRef.current.recordBlur();
    setIsInterviewPaused(true);
    setPauseReason(reason);
    setIsTimerRunning(false);
    stopListening();
    stopInterviewerSpeech();
    setIsAiSpeaking(false);
  };

  const resumeInterview = () => {
    antiCheatRef.current.recordFocus();
    setIsInterviewPaused(false);
    setPauseReason('');
    setIsTimerRunning(true);
    unlockSpeechSynthesis();
    if (isHandsFreeModeRef.current && !isVoiceMuted && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
      startListening();
    }
  };

  useEffect(() => {
    if (!isInterviewStarted || isEvaluating || scorecard) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        pauseInterview('Tab switched or minimized — Live interview paused to preserve time');
      }
    };

    const handleWindowBlur = () => {
      pauseInterview('Focus lost — Left interview window');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isInterviewStarted, isEvaluating, scorecard]);

  // Prevent accidental exit / reload during active live interview
  useEffect(() => {
    if (isInterviewStarted) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Live Technical Interview in progress! Are you sure you want to exit?';
        return e.returnValue;
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isInterviewStarted]);


  // Load Past Interview History
  const loadPastHistory = async () => {
    const records = await getInterviewHistory(candidateName);
    setHistoryRecords(records);
    setIsHistoryOpen(true);
  };

  const handleInspectHistoryRecord = async (interviewId: string) => {
    setIsLoadingHistoryDetails(true);
    const details = await getInterviewSessionDetails(interviewId);
    setSelectedHistorySession(details);
    setIsLoadingHistoryDetails(false);
  };

  // Pre-Flight Microphone Permission Check
  const requestPreflightMicPermission = async (): Promise<boolean> => {
    setIsCheckingMic(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        setIsMicPermissionGranted(true);
        setIsCheckingMic(false);
        return true;
      }
    } catch (err) {
      console.warn('Microphone access denied or error:', err);
    }
    setIsCheckingMic(false);
    return false;
  };

  const requestFullscreenMode = async () => {
    try {
      if (typeof document !== 'undefined' && 'fullscreenEnabled' in document && !document.fullscreenEnabled) {
        return;
      }
      const doc = document as any;
      const docEl = document.documentElement as any;
      if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
        setIsFullscreen(true);
        hasEnteredFullscreenRef.current = true;
        setShowFullscreenWarning(false);
      }
    } catch (err) {
      // Non-fatal if browser policy blocks fullscreen or on mobile
      console.warn('Fullscreen request notice:', err);
    }
  };

  const exitFullscreenMode = async () => {
    try {
      const doc = document as any;
      if (doc.fullscreenElement || doc.webkitFullscreenElement) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Exit fullscreen notice:', err);
    }
  };

  // Load questions when company/round/level/style changes
  useEffect(() => {
    let isCancelled = false;
    getCompanyInterviewData(currentCompany.name, selectedRound, selectedLevel, selectedTestStyle).then(qs => {
      if (!isCancelled && qs && qs.length > 0) {
        setAvailableQuestions(qs);
        setActiveQuestion(qs[0]);
        if (qs[0].starterCode && qs[0].starterCode[language]) {
          setEditorCode(qs[0].starterCode[language]);
        }
      }
    });
    return () => { isCancelled = true; };
  }, [currentCompany, selectedRound, selectedLevel, selectedTestStyle, language]);

  // Shuffle available curated questions
  const handleShuffleQuestion = () => {
    if (availableQuestions.length > 0) {
      const remaining = availableQuestions.filter(q => q.id !== activeQuestion?.id);
      const nextQ = remaining.length > 0 ? remaining[Math.floor(Math.random() * remaining.length)] : availableQuestions[0];
      setActiveQuestion(nextQ);
      if (nextQ.starterCode && nextQ.starterCode[language]) {
        setEditorCode(nextQ.starterCode[language]);
      }
    }
  };

  // Dynamic Custom Question Generator for candidate's exact profile & tech stack
  const handleGenerateCustomQuestion = async () => {
    setIsGeneratingCustomQuestion(true);
    try {
      const customQ = await generateDynamicInterviewQuestion(
        currentCompany.name,
        selectedRound,
        selectedLevel,
        selectedTestStyle,
        {
          name: candidateName,
          techStack: candidateTechStack.split(',').map(s => s.trim()).filter(Boolean),
          experienceYears: candidateExpYears,
          currentRole: candidateRole,
          resumeText: resumeText,
          customGoals: candidateGoals
        }
      );
      setActiveQuestion(customQ);
      if (customQ.starterCode && customQ.starterCode[language]) {
        setEditorCode(customQ.starterCode[language]);
      }
    } catch (err) {
      console.warn('Custom question generation notice:', err);
    } finally {
      setIsGeneratingCustomQuestion(false);
    }
  };

  // Handle PDF Resume Upload
  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);
    setIsParsingResume(true);

    try {
      const extracted = await extractTextFromFile(file);
      setResumeText(extracted);

      // AI Analysis to auto-populate candidate profile
      const parsedProfile: ParsedCandidateProfile = await analyzeResumeWithAI(extracted);
      if (parsedProfile.name && parsedProfile.name !== 'Candidate') {
        setCandidateName(parsedProfile.name);
      }
      if (parsedProfile.currentRole) {
        setCandidateRole(parsedProfile.currentRole);
      }
      if (parsedProfile.techStack && parsedProfile.techStack.length > 0) {
        setCandidateTechStack(parsedProfile.techStack.join(', '));
      }
      if (parsedProfile.experienceYears) {
        setCandidateExpYears(String(parsedProfile.experienceYears));
      }
    } catch (err) {
      console.warn('Resume parse error:', err);
    } finally {
      setIsParsingResume(false);
    }
  };

  const startListening = () => {
    if (
      !recognitionRef.current || 
      isAiThinkingRef.current || 
      isAiSpeakingRef.current || 
      hasPermanentMicErrorRef.current ||
      Date.now() < speechEchoCooldownUntilRef.current
    ) return;
    try {
      stopInterviewerSpeech();
      setIsAiSpeaking(false);
      if (!isRecognitionActiveRef.current) {
        recognitionRef.current.start();
      }
      setIsListening(true);
    } catch (err) {
      console.warn('Speech recognition start error:', err);
    }
  };

  const stopListening = (forceAbort = false) => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (recognitionRestartTimeoutRef.current) clearTimeout(recognitionRestartTimeoutRef.current);
    setSilenceCountdown(null);
    speechAccumulatorRef.current = '';
    setInterimSpeech('');

    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try {
        if (forceAbort && recognitionRef.current.abort) {
          recognitionRef.current.abort(); // Immediately flush and cancel in-flight audio buffers
        } else {
          recognitionRef.current.stop();
        }
      } catch {}
    }
    isRecognitionActiveRef.current = false;
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      hasPermanentMicErrorRef.current = false;
      speechEchoCooldownUntilRef.current = 0; // Manual user click overrides cooldown
      startListening();
    }
  };

  // Switch to a fresh dynamic question in an ongoing live interview
  const handleSwitchToNewQuestion = async () => {
    setIsGeneratingCustomQuestion(true);
    try {
      const newQ = await generateDynamicInterviewQuestion(
        currentCompany.name,
        selectedRound,
        selectedLevel,
        selectedTestStyle,
        {
          name: candidateName,
          techStack: candidateTechStack.split(',').map(s => s.trim()).filter(Boolean),
          experienceYears: candidateExpYears,
          currentRole: candidateRole,
          resumeText: resumeText,
          customGoals: candidateGoals
        }
      );
      setActiveQuestion(newQ);
      if (newQ.starterCode && newQ.starterCode[language]) {
        setEditorCode(newQ.starterCode[language]);
      }
      setIsChangeQuestionModalOpen(false);

      const candidateGreetingName = cleanSpokenCandidateName(candidateName);
      const switchMsg: InterviewMessage = {
        id: `msg-${Date.now()}`,
        role: 'interviewer',
        content: `Understood, ${candidateGreetingName}. Here is your fresh ${selectedRound} scenario:\n\n**${newQ.title}**\n\n${newQ.description}\n\nPlease walk me through your initial thoughts and clarifying questions before writing code or drawing.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stage: 'problem'
      };

      let switchRevealed = false;
      const revealSwitchMsg = () => {
        if (switchRevealed) return;
        switchRevealed = true;
        setMessages(prev => [...prev, switchMsg]);
      };

      if (!isVoiceMuted) {
        setIsAiSpeaking(true);
        vadRef.current?.setTTSActive(true);
        if (typeof window !== 'undefined') (window as any).isTTSActive = true;
        stopListening(true);
        const safetyTimer = setTimeout(revealSwitchMsg, 8000);
        speakInterviewerText(
          switchMsg.content,
          () => {
            clearTimeout(safetyTimer);
            revealSwitchMsg();
            speechEchoCooldownUntilRef.current = Date.now() + 100;
            setIsAiSpeaking(false);
            vadRef.current?.setTTSActive(false);
            if (typeof window !== 'undefined') (window as any).isTTSActive = false;
            if (isHandsFreeModeRef.current && !hasPermanentMicErrorRef.current) {
              startListening();
            }
          },
          selectedVoiceProfile,
          () => {
            clearTimeout(safetyTimer);
            revealSwitchMsg();
          }
        );
      } else {
        revealSwitchMsg();
        if (isHandsFreeModeRef.current && !hasPermanentMicErrorRef.current) {
          startListening();
        }
      }
    } catch (err) {
      console.warn('Switch question error:', err);
    } finally {
      setIsGeneratingCustomQuestion(false);
    }
  };

  // Launch the live interview session from the Pre-Interview Setup screen
  const handleStartLiveInterview = async () => {
    // 0. Synchronously request fullscreen and unlock audio context IMMEDIATELY upon user click!
    // This MUST be the very first line before ANY async/await to preserve the browser user activation token.
    unlockSpeechSynthesis();
    requestFullscreenMode();

    let questionToUse: CuratedInterviewQuestion | null = null;

    // Always auto-generate a fresh, unique personalized problem to eliminate repetition
    try {
      setIsGeneratingCustomQuestion(true);
      questionToUse = await generateDynamicInterviewQuestion(
        currentCompany.name,
        selectedRound,
        selectedLevel,
        selectedTestStyle,
        {
          name: candidateName,
          techStack: candidateTechStack.split(',').map(s => s.trim()).filter(Boolean),
          experienceYears: candidateExpYears,
          currentRole: candidateRole,
          resumeText: resumeText,
          customGoals: candidateGoals
        }
      );
      setActiveQuestion(questionToUse);
      if (questionToUse.starterCode && questionToUse.starterCode[language]) {
        setEditorCode(questionToUse.starterCode[language]);
      } else if (selectedRound === 'DSA' || selectedRound === 'LLD') {
        setEditorCode('// Write your optimal solution here\n\n');
      }
    } catch (e) {
      const pool = availableQuestions.length > 0 ? availableQuestions : (activeQuestion ? [activeQuestion] : []);
      questionToUse = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : activeQuestion;
    } finally {
      setIsGeneratingCustomQuestion(false);
    }

    if (!questionToUse) {
      questionToUse = availableQuestions[0];
    }

    // 1. Billing Gatekeeping (₹10 standard rate or live dynamic rate)
    const student = getCurrentStudent();
    const interviewCost = PRICING_CONFIG.AI_MOCK_INTERVIEW || 10.0;

    if (student?.email && !canAffordAction(interviewCost, student.email)) {
      setBillingError(`Insufficient Wallet Balance: ₹${interviewCost.toFixed(2)} is required to start a Live FAANG Mock Interview. Please top up your wallet.`);
      setIsWalletOpen(true);
      return;
    }

    setBillingError('');

    // Deduct credits from user wallet & record transaction
    if (student?.email) {
      deductCredits(interviewCost, 'AI_MOCK_INTERVIEW', `Live FAANG Mock Interview (${selectedRound} - ${currentCompany.name})`, student.email);
    }

    // 2. Pre-flight Mic Verification & Voice Activity Controller (VAD) initialization
    let micOk = isMicPermissionGranted;
    if (!micOk) {
      micOk = await requestPreflightMicPermission();
    }
    if (!micOk) {
      hasPermanentMicErrorRef.current = true;
      isHandsFreeModeRef.current = false;
      setIsHandsFreeMode(false);
    } else {
      hasPermanentMicErrorRef.current = false;
      try {
        const vad = new VoiceActivityController();
        vad.init(
          () => {
            // Candidate active speech onset detected via mic audio energy:
            // Immediately cancel any pending silence auto-send countdown so candidate is never cut off
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            setSilenceCountdown(null);
          },
          undefined,
          () => {
            // Explicit candidate interruption
            stopInterviewerSpeech();
            setIsAiSpeaking(false);
          }
        );
        vadRef.current = vad;
      } catch {}
    }

    // 3. Lock interviewer voice for the entire test session with assigned persona profile
    resetInterviewerVoiceLock();
    getOrLockInterviewerVoice(assignedInterviewer.voiceProfile);

    if (interviewMode === 'full_loop') {
      setCurrentRoundIndex(0);
      setCompletedRoundRecords([]);
      setSelectedRound(companySchedule[0].roundType);
    }

    // 5. Tab routing according to round
    const effectiveRound = interviewMode === 'full_loop' ? companySchedule[0].roundType : selectedRound;
    if (effectiveRound === 'HLD') {
      setRightTab('hld_canvas');
    } else if (effectiveRound === 'Behavioral') {
      setRightTab('star');
    } else {
      setRightTab('code');
    }

    const candidateGreetingName = cleanSpokenCandidateName(candidateName);
    const activeRound = interviewMode === 'full_loop' ? companySchedule[0] : null;
    const interviewerName = assignedInterviewer.name;
    const interviewerTitle = assignedInterviewer.title;

    const initialGreeting = interviewMode === 'full_loop' && activeRound
      ? `Hello ${candidateGreetingName}! I'm ${interviewerName}, ${interviewerTitle} at ${currentCompany.name}. Welcome to your ${currentCompany.name} Full Virtual Onsite Loop. We are commencing with ${activeRound.title}. Focus area: ${activeRound.focusDescription}.\n\nHere is your technical scenario:\n**${questionToUse.title}**\n\n${questionToUse.description}\n\nWhenever you are ready, please walk me through your clarifying questions and architectural or algorithmic approach.`
      : `Hello ${candidateGreetingName}! I'm ${interviewerName}, ${interviewerTitle} at ${currentCompany.name}. We will be conducting your ${selectedRound} interview today.\n\nHere is your problem scenario:\n**${questionToUse.title}**\n\n${questionToUse.description}\n\nTo begin, please walk me through your initial understanding, clarify any constraints, and explain your high-level approach before writing code or drawing architecture.`;

    const initialMsg: InterviewMessage = {
      id: 'msg-init',
      role: 'interviewer',
      content: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: 'problem'
    };

    setSecondsRemaining(45 * 60);
    setIsTimerRunning(true);
    setIsInterviewStarted(true);

    if (!isVoiceMuted) {
      lastSpokenInterviewerTextRef.current = initialGreeting;
      setIsAiSpeaking(true);
      vadRef.current?.setTTSActive(true);
      if (typeof window !== 'undefined') (window as any).isTTSActive = true;
      stopListening(true);

      let greetingRevealed = false;
      const revealGreeting = () => {
        if (greetingRevealed) return;
        greetingRevealed = true;
        setMessages([initialMsg]);
      };

      // Safety timeout: reveal text within 8s if TTS encounters network lag
      const safetyTimer = setTimeout(revealGreeting, 8000);

      speakInterviewerText(
        initialGreeting, 
        () => {
          clearTimeout(safetyTimer);
          revealGreeting();
          speechEchoCooldownUntilRef.current = Date.now() + 100;
          setIsAiSpeaking(false);
          vadRef.current?.setTTSActive(false);
          if (typeof window !== 'undefined') (window as any).isTTSActive = false;
          if (isHandsFreeModeRef.current && !hasPermanentMicErrorRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
            startListening();
          }
        }, 
        selectedVoiceProfile,
        () => {
          // onStart: Audio is actively playing through speakers now! Reveal text simultaneously!
          clearTimeout(safetyTimer);
          revealGreeting();
        }
      );
    } else {
      setMessages([initialMsg]);
      if (isHandsFreeModeRef.current && !hasPermanentMicErrorRef.current) {
        startListening();
      }
    }
  };

  // Auto-scroll transcript on new messages
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [messages, isAiThinking, interimSpeech]);

  // Timer Tick
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Setup Continuous Web Speech Recognition with Smart Silence Auto-Send
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSpeechSupported(false);
        setIsHandsFreeMode(false);
        return;
      }
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-GB';

        recognition.onstart = () => {
          isRecognitionActiveRef.current = true;
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          // 1. HARD ECHO SUPPRESSION: Discard mic capture if AI is speaking, thinking, or in acoustic cooldown
          const now = Date.now();
          if (
            isAiSpeakingRef.current || 
            isAiThinkingRef.current || 
            (typeof window !== 'undefined' && (window as any).isTTSActive === true) || 
            now < speechEchoCooldownUntilRef.current
          ) {
            speechAccumulatorRef.current = '';
            setInterimSpeech('');
            return;
          }

          let accumulatedFinal = '';
          let currentInterim = '';

          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedFinal += transcript + ' ';
            } else {
              currentInterim += transcript;
            }
          }

          const fullSpeech = (accumulatedFinal + currentInterim).trim();
          if (fullSpeech) {
            // 2. SELF-HEARING ACOUSTIC ECHO FILTER:
            // Discard if captured speech matches what the interviewer just said through the speakers
            if (isAcousticEchoOfInterviewer(fullSpeech, lastSpokenInterviewerTextRef.current)) {
              console.warn('[Echo Filter] Suppressed acoustic microphone echo from interviewer playback:', fullSpeech);
              speechAccumulatorRef.current = '';
              setInterimSpeech('');
              return;
            }

            speechAccumulatorRef.current = fullSpeech;
            setInterimSpeech(fullSpeech);
            setInputValue(fullSpeech);

            // Reset silence countdown timer
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            setSilenceCountdown(null);

            // If hands-free mode is on and we have meaningful speech, start 4.0s auto-send countdown
            if (isHandsFreeModeRef.current && fullSpeech.split(' ').length >= 2) {
              let remainingMs = 4000;
              setSilenceCountdown(4.0);

              countdownIntervalRef.current = setInterval(() => {
                remainingMs -= 200;
                if (remainingMs <= 0) {
                  clearInterval(countdownIntervalRef.current);
                  countdownIntervalRef.current = null;
                  setSilenceCountdown(null);
                } else {
                  setSilenceCountdown(Number((remainingMs / 1000).toFixed(1)));
                }
              }, 200);

              silenceTimerRef.current = setTimeout(() => {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
                setSilenceCountdown(null);
                const toSend = speechAccumulatorRef.current.trim();
                if (toSend && !isAiThinkingRef.current && !isAiSpeakingRef.current && !(typeof window !== 'undefined' && (window as any).isTTSActive)) {
                  speechAccumulatorRef.current = '';
                  setInterimSpeech('');
                  handleSendMessage(toSend);
                }
              }, 4000);
            }
          }
        };

        recognition.onerror = (event: any) => {
          if (
            event.error === 'not-allowed' ||
            event.error === 'service-not-allowed' ||
            event.error === 'audio-capture' ||
            event.error === 'language-not-supported'
          ) {
            hasPermanentMicErrorRef.current = true;
            isHandsFreeModeRef.current = false;
            setIsMicPermissionGranted(false);
            setIsHandsFreeMode(false);
            setIsListening(false);
            console.warn(`Speech recognition stopped (${event.error}). Switched to text-assisted chat mode.`);
            return;
          }
          if (event.error !== 'no-speech') {
            console.warn('Speech recognition error:', event.error);
          }
        };

        recognition.onend = () => {
          isRecognitionActiveRef.current = false;
          if (hasPermanentMicErrorRef.current || !isHandsFreeModeRef.current) {
            setIsListening(false);
            return;
          }

          // Debounce restart by 400ms to strictly prevent tight CPU error loops
          // Ensure it does NOT restart while AI is speaking, thinking, or during acoustic cooldown
          if (
            !isAiSpeakingRef.current && 
            !isAiThinkingRef.current && 
            !(typeof window !== 'undefined' && (window as any).isTTSActive) && 
            isInterviewStarted && 
            Date.now() >= speechEchoCooldownUntilRef.current
          ) {
            if (recognitionRestartTimeoutRef.current) {
              clearTimeout(recognitionRestartTimeoutRef.current);
            }
            recognitionRestartTimeoutRef.current = setTimeout(() => {
              if (
                isHandsFreeModeRef.current &&
                !isAiSpeakingRef.current &&
                !isAiThinkingRef.current &&
                !(typeof window !== 'undefined' && (window as any).isTTSActive) &&
                isInterviewStarted &&
                !hasPermanentMicErrorRef.current &&
                Date.now() >= speechEchoCooldownUntilRef.current
              ) {
                try {
                  recognition.start();
                } catch {}
              }
            }, 400);
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (recognitionRestartTimeoutRef.current) clearTimeout(recognitionRestartTimeoutRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, [isInterviewStarted]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue || interimSpeech).trim();
    if (!text || isAiThinkingRef.current) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setSilenceCountdown(null);
    setInterimSpeech('');
    speechAccumulatorRef.current = '';
    setInputValue('');

    stopInterviewerSpeech();
    setIsAiSpeaking(false);
    stopListening();

    const candidateMsg: InterviewMessage = {
      id: `msg-${Date.now()}`,
      role: 'candidate',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: 'intuition'
    };

    const nextMessages = [...messages, candidateMsg];
    setMessages(nextMessages);
    setIsAiThinking(true);

    const candidateContext: CandidateDetails = {
      name: candidateName,
      experienceYears: candidateExpYears,
      currentRole: candidateRole,
      techStack: candidateTechStack.split(',').map(s => s.trim()).filter(Boolean),
      customGoals: candidateGoals,
      resumeText: resumeText
    };

    const ctx: InterviewContext = {
      company: currentCompany.name,
      level: selectedLevel,
      round: selectedRound,
      testStyle: selectedTestStyle,
      candidate: candidateContext,
      question: activeQuestion || undefined,
      candidateCode: editorCode,
      language: language,
      whiteboardNotes: whiteboardNotes,
      interviewerPersonaName: assignedInterviewer.name
    };

    const aiReply = await sendInterviewerMessage(nextMessages, ctx);

    const interviewerMsg: InterviewMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'interviewer',
      content: aiReply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: 'coding'
    };

    let messageRevealed = false;
    const revealMessage = () => {
      if (messageRevealed) return;
      messageRevealed = true;
      setIsAiThinking(false);
      setMessages([...nextMessages, interviewerMsg]);
    };

    if (!isVoiceMuted) {
      lastSpokenInterviewerTextRef.current = aiReply;
      setIsAiSpeaking(true);
      vadRef.current?.setTTSActive(true);
      if (typeof window !== 'undefined') (window as any).isTTSActive = true;
      stopListening(true);

      // 8s fallback safety timer in case TTS takes longer or fails
      const safetyTimeout = setTimeout(revealMessage, 8000);

      speakInterviewerText(
        aiReply,
        () => {
          clearTimeout(safetyTimeout);
          revealMessage();
          speechEchoCooldownUntilRef.current = Date.now() + 100;
          setIsAiSpeaking(false);
          vadRef.current?.setTTSActive(false);
          if (typeof window !== 'undefined') (window as any).isTTSActive = false;
          if (isHandsFreeModeRef.current && !hasPermanentMicErrorRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
            startListening();
          }
        },
        selectedVoiceProfile,
        () => {
          // onStart: Audio is actively playing through the speaker! Reveal text at the exact same instant!
          clearTimeout(safetyTimeout);
          revealMessage();
        }
      );
    } else {
      revealMessage();
      if (isHandsFreeModeRef.current && !hasPermanentMicErrorRef.current) {
        startListening();
      }
    }
  };

  const handleEndInterviewAndEvaluate = async () => {
    setIsEvaluating(true);
    stopInterviewerSpeech();
    setIsAiSpeaking(false);

    const candidateContext: CandidateDetails = {
      name: candidateName,
      experienceYears: candidateExpYears,
      currentRole: candidateRole,
      techStack: candidateTechStack.split(',').map(s => s.trim()).filter(Boolean),
      customGoals: candidateGoals,
      resumeText: resumeText
    };

    const ctx: InterviewContext = {
      company: currentCompany.name,
      level: selectedLevel,
      round: selectedRound,
      testStyle: selectedTestStyle,
      candidate: candidateContext,
      question: activeQuestion || undefined,
      candidateCode: editorCode,
      language: language,
      whiteboardNotes: whiteboardNotes
    };

    const duration = Math.max(1, Math.round((45 * 60 - secondsRemaining) / 60));

    let topologyContext = '';
    if (selectedRound === 'HLD') {
      const sampleNodes = [
        { id: 'client-1', type: 'CLIENT' as const, label: 'Client Application' },
        { id: 'lb-1', type: 'LOAD_BALANCER' as const, label: 'Global Load Balancer' },
        { id: 'gw-1', type: 'API_GATEWAY' as const, label: 'API Gateway' },
        { id: 'service-1', type: 'SERVICE' as const, label: 'Core Microservice' },
        { id: 'cache-1', type: 'CACHE' as const, label: 'Distributed Redis Cache' },
        { id: 'db-1', type: 'DB' as const, label: 'Primary PostgreSQL Database' }
      ];
      const sampleEdges = [
        { from: 'client-1', to: 'lb-1' },
        { from: 'lb-1', to: 'gw-1' },
        { from: 'gw-1', to: 'service-1' },
        { from: 'service-1', to: 'cache-1' },
        { from: 'service-1', to: 'db-1' }
      ];
      const topoReport = validateHLDTopology(sampleNodes, sampleEdges);
      topologyContext = topoReport.formattedEvaluationContext;
    }

    // Telemetry from Test Harness, State Machine, Topology Validator, and Anti-Cheat Monitor
    const telemetry = {
      testHarnessContext: testSuiteReport?.formattedEvaluationContext,
      stateMachineContext: stateMachineRef.current.formatEvaluationDebrief(),
      topologyContext: topologyContext || undefined,
      antiCheatContext: antiCheatRef.current.generateReport().formattedEvaluationContext
    };

    const result = await evaluateInterview(messages, ctx, duration, telemetry);
    setIsEvaluating(false);
    setScorecard(result);

    // Save full session payload to Cloudflare R2 and scorecard index to Supabase
    saveInterviewSession(messages, ctx, result, duration).then(res => {
      console.log('[Interview History] Saved session to Cloudflare R2 & Supabase:', res);
    });

    if (interviewMode === 'full_loop') {
      const elim = evaluateRoundElimination(result);
      const currentRecord: CompletedRoundRecord = {
        roundIndex: currentRoundIndex,
        roundDefinition: activeRoundDef,
        scorecard: result,
        passed: elim.passed,
        eliminationReason: elim.passed ? undefined : elim.reason,
        timestamp: new Date().toLocaleTimeString()
      };
      const updatedHistory = [...completedRoundRecords, currentRecord];
      setCompletedRoundRecords(updatedHistory);

      if (!elim.passed) {
        // Eliminated at this round
        setEliminationModalData({ roundRecord: currentRecord });
        setIsScorecardOpen(false);
      } else if (currentRoundIndex + 1 < companySchedule.length) {
        // Cleared this round, advance to next
        setAdvanceModalData({
          roundRecord: currentRecord,
          nextRound: companySchedule[currentRoundIndex + 1]
        });
        setIsScorecardOpen(false);
      } else {
        // Cleared ALL rounds in the loop! OFFER EXTENDED!
        const offer = generateFinalOfferPacket(updatedHistory, currentCompany.name, selectedLevel);
        setFinalOfferPacket(offer);
        setIsScorecardOpen(false);
      }
    } else {
      setIsScorecardOpen(true);
      if (result.overallScore >= 75) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleProceedToNextRound = async () => {
    const nextIdx = currentRoundIndex + 1;
    if (nextIdx >= companySchedule.length) return;

    setCurrentRoundIndex(nextIdx);
    const nextDef = companySchedule[nextIdx];
    setSelectedRound(nextDef.roundType);

    // Update workspace tab according to next round
    if (nextDef.roundType === 'HLD') {
      setRightTab('hld_canvas');
    } else if (nextDef.roundType === 'Behavioral') {
      setRightTab('star');
    } else {
      setRightTab('code');
    }

    setAdvanceModalData(null);
    setIsEvaluating(false);
    setScorecard(null);
    setTestSuiteReport(null);
    stateMachineRef.current.reset();
    setCurrentStage('CLARIFICATION');

    // Generate fresh question for next round
    setIsGeneratingCustomQuestion(true);
    try {
      const newQ = await generateDynamicInterviewQuestion(
        currentCompany.name,
        nextDef.roundType,
        selectedLevel,
        selectedTestStyle,
        {
          name: candidateName,
          techStack: candidateTechStack.split(',').map(s => s.trim()).filter(Boolean),
          experienceYears: candidateExpYears,
          currentRole: candidateRole,
          resumeText: resumeText,
          customGoals: candidateGoals
        }
      );
      setActiveQuestion(newQ);
      if (newQ.starterCode && newQ.starterCode[language]) {
        setEditorCode(newQ.starterCode[language]);
      } else {
        setEditorCode('// Write your optimal solution here\n\n');
      }

      const candidateGreetingName = candidateName.trim() || 'Candidate';
      const interviewerName = selectedVoiceProfile === 'hi_female' ? 'Aditi Sharma' : 'Aarav Patel';
      const roundIntro = `Welcome to Round ${nextIdx + 1} (${nextDef.title}), ${candidateGreetingName}! I am ${interviewerName}, ${nextDef.interviewerTitle}. We will be focusing on ${nextDef.focusDescription}.\n\nHere is your technical scenario:\n**${newQ.title}**\n\n${newQ.description}\n\nWhenever you are ready, please walk me through your initial thoughts, verify any edge conditions, and structure your approach.`;

      const nextMsg: InterviewMessage = {
        id: `msg-r${nextIdx + 1}-init`,
        role: 'interviewer',
        content: roundIntro,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stage: 'problem'
      };

      setSecondsRemaining((nextDef.durationMinutes || 45) * 60);
      setIsTimerRunning(true);

      if (!isVoiceMuted) {
        lastSpokenInterviewerTextRef.current = roundIntro;
        setIsAiSpeaking(true);
        vadRef.current?.setTTSActive(true);
        if (typeof window !== 'undefined') (window as any).isTTSActive = true;
        stopListening(true);

        let roundRevealed = false;
        const revealRound = () => {
          if (roundRevealed) return;
          roundRevealed = true;
          setMessages([nextMsg]);
        };

        const safetyTimer = setTimeout(revealRound, 8000);

        speakInterviewerText(
          roundIntro, 
          () => {
            clearTimeout(safetyTimer);
            revealRound();
            speechEchoCooldownUntilRef.current = Date.now() + 100;
            setIsAiSpeaking(false);
            vadRef.current?.setTTSActive(false);
            if (typeof window !== 'undefined') (window as any).isTTSActive = false;
            if (isHandsFreeModeRef.current && !hasPermanentMicErrorRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
              startListening();
            }
          }, 
          selectedVoiceProfile,
          () => {
            // onStart: Audio is actively playing through the speaker! Reveal text at the exact same instant!
            clearTimeout(safetyTimer);
            revealRound();
          }
        );
      } else {
        setMessages([nextMsg]);
        if (isHandsFreeModeRef.current && !hasPermanentMicErrorRef.current) {
          startListening();
        }
      }
    } catch (err) {
      console.warn('Next round generation error:', err);
    } finally {
      setIsGeneratingCustomQuestion(false);
    }
  };

  const handleRestartLoop = () => {
    setEliminationModalData(null);
    setAdvanceModalData(null);
    setFinalOfferPacket(null);
    setCompletedRoundRecords([]);
    setCurrentRoundIndex(0);
    setIsInterviewStarted(false);
    setIsTimerRunning(false);
    setScorecard(null);
    stopInterviewerSpeech();
    stopListening();
  };

  const handleRunTestSuite = async () => {
    if (isRunningTests) return;
    setIsRunningTests(true);

    const testCases: TestCase[] = [
      { id: 'tc-1', input: '4\n1 2 3 4', expectedOutput: '10', isHidden: false },
      { id: 'tc-2', input: '1\n-5', expectedOutput: '-5', isHidden: false },
      { id: 'tc-3', input: '5\n5 4 -1 7 8', expectedOutput: '23', isHidden: true },
      { id: 'tc-4', input: '0\n', expectedOutput: '0', isHidden: true }
    ];

    try {
      const report = await runTestSuiteAgainstCompiler(
        editorCode,
        testCases,
        language,
        activeQuestion?.title || 'Coding Challenge'
      );
      setTestSuiteReport(report);
      stateMachineRef.current.setValidation('codeCompiled', report.verdict !== 'COMPILE_ERROR');
      stateMachineRef.current.setValidation('testCasesPassed', report.passedTests === report.totalTests);
      if (report.passedTests === report.totalTests) {
        stateMachineRef.current.transitionTo('OPTIMIZATION');
        setCurrentStage('OPTIMIZATION');
      }
    } catch (err) {
      console.warn('Test suite execution error:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleRequestHint = (tier: 1 | 2 | 3) => {
    const hintTitles: Record<1 | 2 | 3, string> = {
      1: 'Can you give me a subtle conceptual nudge or direction?',
      2: 'Could you suggest the optimal algorithmic pattern or data structure?',
      3: 'I am stuck. Could you provide a concrete step-by-step resolution or pseudocode?'
    };
    stateMachineRef.current.recordHint(tier, hintTitles[tier]);
    handleSendMessage(`[REQUEST HINT TIER ${tier}]: ${hintTitles[tier]}`);
  };

  const handleCloseScorecardAndExitInterview = () => {
    vadRef.current?.destroy();
    vadRef.current = null;
    setIsScorecardOpen(false);
    setIsInterviewStarted(false);
    setIsTimerRunning(false);
    setIsAiSpeaking(false);
    stopInterviewerSpeech();
    stopListening();
    exitFullscreenMode();
    if (onBackToDashboard) {
      onBackToDashboard();
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert active question to HLD problem spec if applicable
  const currentHldSpec: HLDProblemSpec | undefined = useMemo(() => {
    if (!activeQuestion || selectedRound !== 'HLD') return undefined;
    return {
      id: activeQuestion.id,
      title: activeQuestion.title,
      description: activeQuestion.description,
      difficulty: selectedLevel === 'SDE-1' ? 'Medium' : 'Hard',
      companies: [currentCompany.name],
      requirements: activeQuestion.keyEvaluationCriteria || ['High Availability (99.99%)', 'Low Latency (<100ms)', 'Scalable Storage'],
      expectedScale: '10M+ DAU'
    };
  }, [activeQuestion, selectedRound, selectedLevel, currentCompany]);

  // =========================================================================
  // VIEW 1: PRE-INTERVIEW SETUP & CANDIDATE PROFILE FORM WIZARD
  // =========================================================================
  if (!isInterviewStarted) {
    return (
      <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar p-4 sm:p-8">
        <div className="max-w-4xl mx-auto w-full space-y-8 animate-fadeIn">
          
          {/* Safari / Firefox Web Speech API Non-Blocking Fallback Notice */}
          {!isSpeechSupported && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">Spoken Voice Recognition Fallback: </span> 
                Speech recognition is not natively supported on this browser (Safari/Firefox). Text input mode has been automatically enabled. For the optimal hands-free spoken experience, Chromium-based browsers (Google Chrome, Brave, Microsoft Edge) are recommended.
              </div>
            </div>
          )}

          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/40 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 font-mono text-[11px] font-bold w-fit">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>FAANG BAR RAISER SIMULATOR &bull; R2 & SUPABASE PERSISTED</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Candidate Profile & Interview Setup
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Provide your background, grant mic permissions upfront, choose your test style, or upload your resume PDF. The AI Principal Interviewer locks its voice, customizes questions for your exact profile, and records all transcripts and scorecards.
              </p>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={loadPastHistory}
                className="px-4 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="View Past Mock Interviews, Scorecards & Transcripts"
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Past Interviews</span>
              </button>

              {onBackToDashboard && (
                <button
                  onClick={onBackToDashboard}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer flex-shrink-0"
                >
                  Back
                </button>
              )}
            </div>
          </div>

          {/* SECTION 1: CANDIDATE PROFILE & RESUME UPLOAD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  1. Candidate Profile & Experience
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Contextual Ingestion</span>
            </div>

            {/* Resume Upload Dropzone */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-dashed border-indigo-500/40 hover:border-indigo-500 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>Upload Resume PDF / Text</span>
                    {resumeFileName && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1 border border-emerald-500/40">
                        <FileCheck2 className="w-3 h-3" />
                        <span>Parsed</span>
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isParsingResume
                      ? 'Extracting tech stack, projects & experience with AI...'
                      : resumeFileName
                      ? `Active Resume: ${resumeFileName}`
                      : 'Upload your .pdf, .txt, or .docx resume for realistic project probing'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleResumeFileUpload}
                  accept=".pdf,.txt,.md,.docx,.json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsingResume}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-900/30 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{resumeFileName ? 'Replace Resume' : 'Select Resume PDF'}</span>
                </button>
                {resumeFileName && (
                  <button
                    onClick={() => {
                      setResumeFileName('');
                      setResumeText('');
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    title="Remove Resume"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Candidate Details Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Candidate Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Your Full Name:</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Experience Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Years of Experience (YOE):</label>
                <select
                  value={candidateExpYears}
                  onChange={(e) => setCandidateExpYears(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="0-1">0-1 Years (Fresher / College Graduate)</option>
                  <option value="2-4">2-4 Years (Mid-Level SDE-2)</option>
                  <option value="5-8">5-8 Years (Senior SDE-3 / Lead)</option>
                  <option value="9+">9+ Years (Staff / Principal Architect)</option>
                </select>
              </div>

              {/* Current Role / College */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Current Role / Organization:</label>
                <input
                  type="text"
                  value={candidateRole}
                  onChange={(e) => setCandidateRole(e.target.value)}
                  placeholder="e.g. Backend SDE @ FinTech Startup"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

            </div>

            {/* Tech Stack & Weakness / Goal Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Primary Tech Stack & Tools:</label>
                <input
                  type="text"
                  value={candidateTechStack}
                  onChange={(e) => setCandidateTechStack(e.target.value)}
                  placeholder="e.g. C++, Go, React, PostgreSQL, Redis, Kafka, AWS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Custom Focus / Weakness to Test (Optional):</label>
                <input
                  type="text"
                  value={candidateGoals}
                  onChange={(e) => setCandidateGoals(e.target.value)}
                  placeholder="e.g. Test my distributed concurrency, graph DP & caching tradeoffs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

          </div>

          {/* INTERVIEW EXECUTION MODE: SINGLE ROUND vs FULL VIRTUAL ONSITE LOOP */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Select Interview Format
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Simulation Depth</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setInterviewMode('single')}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  interviewMode === 'single'
                    ? 'bg-indigo-950/70 border-indigo-500 shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-500'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-white">Single Round Deep-Dive</span>
                    {interviewMode === 'single' && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-300 font-mono text-[10px] font-bold inline-block mt-1">
                    Focused Practice • 45 Mins
                  </span>
                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                    Drill specifically on one round of your choice: DSA Coding, LLD Machine Coding, HLD Distributed Systems, or STAR Behavioral.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setInterviewMode('full_loop')}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  interviewMode === 'full_loop'
                    ? 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-indigo-950/80 border-amber-500 shadow-xl shadow-amber-500/20 ring-1 ring-amber-500'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="font-black text-sm text-white">Full Virtual Onsite Loop</span>
                    </div>
                    {interviewMode === 'full_loop' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold inline-block mt-1">
                    Multi-Stage Elimination • 4 Rounds • FAANG Job Offer
                  </span>
                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                    Face the authentic company hiring gauntlet: DSA $\rightarrow$ LLD $\rightarrow$ HLD $\rightarrow$ Behavioral. Each round has an elimination gate. Clear all rounds to earn an official FAANG Job Offer!
                  </p>
                </div>
              </button>
            </div>

            {/* If Full Loop is active, render the company round timeline */}
            {interviewMode === 'full_loop' && (
              <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                    {currentCompany.name} {selectedLevel} Onsite Round Pipeline:
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Stage Elimination at each gate</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {companySchedule.map((round, idx) => (
                    <div key={round.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>STAGE {idx + 1}</span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold">{round.roundType}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white truncate">{round.title.replace(/^Round \d+:\s*/, '')}</h5>
                      <p className="text-[10px] text-slate-400 truncate">Interviewer: {round.interviewerName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: TEST STYLES SELECTION */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Select Interview Test Style
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Custom Evaluation Paradigm</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SUPPORTED_TEST_STYLES.map((style) => {
                const isSelected = style.id === selectedTestStyle;
                return (
                  <button
                    key={style.id}
                    onClick={() => setSelectedTestStyle(style.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/70 border-amber-500 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{style.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-300 font-mono text-[9px] font-bold inline-block mt-1">
                        {style.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{style.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: COMPANY, LEVEL & ROUND MATRIX */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Step 3A: Target Company */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">3. Target Company</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SUPPORTED_COMPANIES.map((comp) => {
                  const isSelected = comp.id === selectedCompanyId;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => setSelectedCompanyId(comp.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-950/80 border-indigo-500 shadow-md shadow-indigo-500/20'
                          : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{comp.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-mono">
                        {comp.focusAreas.DSA[0]}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3B: SDE Seniority Level */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">4. SDE Seniority Level</h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {(['SDE-1', 'SDE-2', 'SDE-3'] as SdeLevel[]).map((lvl) => {
                  const isSelected = lvl === selectedLevel;
                  const label = lvl === 'SDE-1' ? 'Junior / Fresher (0-2 YOE)' : lvl === 'SDE-2' ? 'Mid-Level Engineer (2-5 YOE)' : 'Senior / Staff Architect (5+ YOE)';
                  const focus = lvl === 'SDE-1' ? 'Core DSA, syntax mastery, edge cases' : lvl === 'SDE-2' ? 'Complex algorithms, concurrency & modular LLD' : 'Global distributed systems, trade-offs & consensus';
                  return (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-950/80 border-purple-500 shadow-md shadow-purple-500/20'
                          : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-sm text-white">{lvl}</span>
                          <span className="text-xs text-slate-400 font-mono">• {label}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{focus}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3C: Round Type */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">5. Technical Round Track</h3>
                </div>
                {interviewMode === 'full_loop' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/40">
                    Full Onsite Loop Active
                  </span>
                )}
              </div>

              {interviewMode === 'full_loop' ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Automated Sequential Progression</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    In Full Onsite Loop mode, rounds are sequentially cleared: Round 1 (DSA) &rarr; Round 2 (LLD) &rarr; Round 3 (HLD) &rarr; Round 4 (Behavioral).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'DSA', name: 'DSA & Algorithms', desc: 'Monaco Code IDE, Big-O' },
                    { id: 'LLD', name: 'LLD Machine Coding', desc: 'OOP Design Patterns' },
                    { id: 'HLD', name: 'HLD System Design', desc: 'Interactive Architecture Canvas' },
                    { id: 'Behavioral', name: 'Behavioral (STAR)', desc: 'Leadership & Conflict' }
                  ].map((rd) => {
                    const isSelected = rd.id === selectedRound;
                    return (
                      <button
                        key={rd.id}
                        onClick={() => setSelectedRound(rd.id as InterviewRound)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-950/80 border-cyan-500 shadow-md shadow-cyan-500/20'
                            : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{rd.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{rd.desc}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 3D: Language, Voice & Pre-Flight Mic Check */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">6. Audio & Environment Check</h3>
              </div>

              <div className="space-y-3">
                {/* Pre-Flight Microphone Check Button */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-200 font-bold">Microphone Permission Check:</span>
                      {isMicPermissionGranted ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Granted</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                          Pre-Flight Check
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isMicPermissionGranted
                        ? 'Microphone calibrated. No popups will interrupt your fullscreen test.'
                        : 'Grant microphone access now so the browser never interrupts mid-interview.'}
                    </p>
                  </div>

                  <button
                    onClick={requestPreflightMicPermission}
                    disabled={isCheckingMic || isMicPermissionGranted}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
                      isMicPermissionGranted
                        ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-400'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isCheckingMic ? 'Testing...' : isMicPermissionGranted ? 'Tested & Ready' : 'Test Microphone'}</span>
                  </button>
                </div>

                {/* Language Picker */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-slate-300 font-bold">Coding Language:</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="cpp">C++ (GCC 13)</option>
                    <option value="python">Python 3.12</option>
                    <option value="java">Java 21</option>
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="go">Go 1.22</option>
                    <option value="rust">Rust 1.77</option>
                  </select>
                </div>

                {/* Hands-Free Voice Flow */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-300 font-bold block">Hands-Free Live Voice Flow</span>
                    <span className="text-[10px] text-slate-500">Auto-listens & auto-sends when you finish talking</span>
                  </div>
                  <button
                    onClick={() => setIsHandsFreeMode(!isHandsFreeMode)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      isHandsFreeMode ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isHandsFreeMode ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Auto-Assigned Interviewer Panel (Realistic FAANG Protocol) */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-200 font-bold text-xs">Assigned Lead Interviewer:</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>Panel Auto-Assigned</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">Fish Audio S2.1 Pro Free</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/50 shadow-md shadow-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center text-2xl flex-shrink-0">
                        {assignedInterviewer.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">{assignedInterviewer.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-mono text-[9px] font-bold">
                            {assignedInterviewer.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5 font-medium">
                          {currentCompany.name} Hiring Committee • {assignedInterviewer.personaSummary}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Voice: {assignedInterviewer.voiceProfile === 'hi_female' ? 'Indian English Female' : 'Indian English Male'} (Sub-90ms latency)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          unlockSpeechSynthesis();
                          streamInterviewerSpeech(assignedInterviewer.sampleGreeting, assignedInterviewer.voiceProfile);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-emerald-700/60"
                        title="Test spoken audio sample of the assigned interviewer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>🔊 Test Audio</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShuffleInterviewer}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                        title="Re-assign another senior bar raiser from the hiring committee pool"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                        <span>🎲 Re-Assign</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>


          {/* Start CTA Button */}
          <div className="pt-2 flex flex-col items-center gap-2">
            {billingError && (
              <div className="p-3.5 rounded-2xl bg-amber-950/90 border border-amber-500/50 text-amber-300 text-xs font-semibold flex items-center justify-between gap-3 max-w-lg w-full shadow-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{billingError}</span>
                </div>
                <button
                  onClick={() => setIsWalletOpen(true)}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs cursor-pointer flex-shrink-0"
                >
                  Top Up Wallet
                </button>
              </div>
            )}

            <button
              onClick={handleStartLiveInterview}
              className="w-full sm:w-auto sm:px-14 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-sm tracking-wide shadow-2xl shadow-indigo-900/50 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
            >
              <Zap className="w-5 h-5 text-amber-300" />
              <span>🚀 Enter Technical Interview Room (₹{(PRICING_CONFIG.AI_MOCK_INTERVIEW || 10).toFixed(0)} • 45 Mins)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <Maximize2 className="w-3 h-3 text-slate-400" />
              <span>Distraction-free fullscreen &bull; ₹{(PRICING_CONFIG.AI_MOCK_INTERVIEW || 10).toFixed(0)} per full session &bull; Auto-saved to Cloudflare R2</span>
            </span>
          </div>

        </div>

        {/* PAST INTERVIEW HISTORY MODAL */}
        {isHistoryOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
              
              {/* Modal Header */}
              <div className="p-5 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Past Mock Interview Sessions</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <HardDrive className="w-3 h-3 text-cyan-400" />
                      <span>Stored in Cloudflare R2 & Synced to Supabase</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsHistoryOpen(false);
                    setSelectedHistorySession(null);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {selectedHistorySession ? (
                  /* Detail View of a Past Session */
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedHistorySession(null)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      &larr; Back to History List
                    </button>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{selectedHistorySession.company} • {selectedHistorySession.level} {selectedHistorySession.round}</span>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40">
                          Score: {selectedHistorySession.scorecard?.overallScore}/100 ({selectedHistorySession.scorecard?.hiringDecision})
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{selectedHistorySession.question?.title}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Interview Transcript</h4>
                      <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar p-3 rounded-2xl bg-slate-950 border border-slate-800">
                        {selectedHistorySession.messages?.map((m) => (
                          <div key={m.id} className="text-xs leading-relaxed">
                            <span className="font-bold text-indigo-400">{m.role === 'interviewer' ? `${selectedHistorySession.company} Interviewer` : 'Candidate'}: </span>
                            <span className="text-slate-300">{m.content}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : historyRecords.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <History className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-300">No mock interview records found yet</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Complete your first 45-minute technical mock interview. All transcripts, code, and scorecards will be safely stored in Cloudflare R2 and Supabase.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyRecords.map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => handleInspectHistoryRecord(rec.id)}
                        className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                              {rec.company}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[10px] font-mono">
                              {rec.level} • {rec.round}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              {new Date(rec.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1">{rec.question_title}</p>
                        </div>

                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <div className="text-right">
                            <span className="font-black text-sm text-emerald-400 block">{rec.overall_score}/100</span>
                            <span className="text-[10px] text-slate-400 font-mono">{rec.hiring_decision}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE LIVE SPLIT-SCREEN INTERVIEW ROOM (FULLSCREEN ENFORCED)
  // =========================================================================
  return (
    <div className={`flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans ${
      isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : 'flex-1 h-full'
    }`}>
      
      {/* FULLSCREEN STRICT ENFORCEMENT PROCTORING MODAL */}
      {showFullscreenWarning && !isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fadeIn">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/60 bg-gradient-to-b from-slate-900 via-slate-950 to-rose-950/40 text-center space-y-5 shadow-2xl shadow-rose-950/60">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 mx-auto flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100 flex items-center justify-center gap-2">
                <span>Fullscreen Mode Required</span>
              </h3>
              <p className="text-xs text-rose-300/90 font-mono mt-1">
                Live interview is paused because Fullscreen mode was exited.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                To maintain authentic test conditions, prevent distractions, and ensure proctoring integrity, you must remain in Fullscreen mode during the live technical interview.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={async () => {
                  await requestFullscreenMode();
                  resumeInterview();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-indigo-600 to-cyan-500 hover:from-rose-400 hover:to-cyan-400 text-white font-black text-sm shadow-xl shadow-rose-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Re-Enter Fullscreen & Resume Interview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safari / Firefox Live Room Speech Fallback Banner */}
      {!isSpeechSupported && (
        <div className="px-4 py-2 bg-amber-950/70 border-b border-amber-500/30 text-xs text-amber-200 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Browser Fallback Notice:</strong> Spoken voice recognition is unavailable in Safari/Firefox. Text-assisted mode is active. Chromium browsers (Chrome, Edge, Brave) are recommended for hands-free spoken dialogue.
            </span>
          </div>
        </div>
      )}

      {/* 1. TOP CONFIGURATOR & STATUS BAR */}
      <div className="p-3 sm:px-6 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        
        {/* Left: Role, Company, Test Style & Round Display */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>{currentCompany.name}</span>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-xs font-mono font-bold">
            {selectedLevel}
          </span>

          <span className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-bold">
            {selectedRound}
          </span>

          {interviewMode === 'full_loop' && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs overflow-x-auto">
              {companySchedule.map((r, i) => {
                const isDone = i < currentRoundIndex;
                const isCurrent = i === currentRoundIndex;
                return (
                  <div key={r.id} className="flex items-center gap-1 flex-shrink-0">
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      <span>R{i + 1}: {r.roundType}</span>
                      {isDone && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                    </div>
                    {i < companySchedule.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}

          <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-700/60 text-amber-300 text-xs font-mono font-bold hidden sm:inline">
            🎯 {SUPPORTED_TEST_STYLES.find(s => s.id === selectedTestStyle)?.name || 'Bar Raiser'}
          </span>

          {candidateName && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold">
              👤 {candidateName}
            </span>
          )}

          <button
            onClick={() => {
              stopInterviewerSpeech();
              stopListening();
              setIsInterviewStarted(false);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            title="Configure New Round or Update Profile"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit Setup</span>
          </button>

        </div>

        {/* Right: Timer, Fullscreen Toggle, Hands-Free Toggle, Voice Mute & End Interview CTA */}
        <div className="flex items-center space-x-2.5">
          
          {/* Live Countdown Timer */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs font-bold text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(secondsRemaining)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="ml-1 text-slate-400 hover:text-slate-200 cursor-pointer"
              title={isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={isFullscreen ? exitFullscreenMode : requestFullscreenMode}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-indigo-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Hands-Free Live Voice Toggle */}
          <button
            onClick={() => {
              const next = !isHandsFreeMode;
              setIsHandsFreeMode(next);
              isHandsFreeModeRef.current = next;
              if (!next) {
                stopListening();
              } else {
                hasPermanentMicErrorRef.current = false;
                if (!isAiSpeaking && !isAiThinking) startListening();
              }
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isHandsFreeMode
                ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border-teal-500/60 text-teal-300 shadow-sm shadow-teal-900/30'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Hands-Free Voice Flow: Automatically listens and sends when you pause speaking"
          >
            <Radio className={`w-3.5 h-3.5 ${isHandsFreeMode ? 'text-teal-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{isHandsFreeMode ? 'Hands-Free Voice: ON' : 'Hands-Free: OFF'}</span>
            <span className="sm:hidden">{isHandsFreeMode ? 'Voice ON' : 'Voice OFF'}</span>
          </button>

          {/* Audio Voice Output Mute Toggle */}
          <button
            onClick={() => {
              if (!isVoiceMuted) stopInterviewerSpeech();
              setIsVoiceMuted(!isVoiceMuted);
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isVoiceMuted
                ? 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
            }`}
            title={isVoiceMuted ? 'Unmute AI Voice Output' : 'Mute AI Voice Output'}
          >
            {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
          </button>

          {/* Assigned AI Interviewer Badge (Realistic Panel Protocol) */}
          <div 
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono text-emerald-300"
            title={`Assigned Lead Interviewer: ${assignedInterviewer.name}, ${assignedInterviewer.title} (${currentCompany.name})`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{assignedInterviewer.avatar} {assignedInterviewer.name} ({currentCompany.name})</span>
          </div>

          {/* Pause / Resume Interview Proctor Button */}
          <button
            onClick={() => {
              if (isInterviewPaused) {
                resumeInterview();
              } else {
                pauseInterview('Manual Pause by Candidate');
              }
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isInterviewPaused
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse shadow-md shadow-amber-500/20'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40'
            }`}
            title={isInterviewPaused ? 'Resume live interview' : 'Pause live interview (freezes timer & AI voice)'}
          >
            {isInterviewPaused ? <Play className="w-3.5 h-3.5 fill-amber-300" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden md:inline">{isInterviewPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Switch Question Button */}
          <button
            onClick={() => setIsChangeQuestionModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-purple-300 hover:border-purple-500/40 text-xs font-bold transition-all cursor-pointer"
            title="Switch to a fresh AI scenario or shuffle the question bank"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">New Question</span>
          </button>

          {/* Maximize Canvas / Split View Toggle */}
          <button
            onClick={() => setIsCanvasMaximized(!isCanvasMaximized)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isCanvasMaximized
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-900/40'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title={isCanvasMaximized ? "Switch back to Split View (Show Chat + Canvas)" : "Maximize Canvas (Full Width) for large architecture diagrams"}
          >
            {isCanvasMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="hidden sm:inline">{isCanvasMaximized ? 'Restore Split View' : 'Maximize Canvas (Full Width)'}</span>
            <span className="sm:hidden">{isCanvasMaximized ? 'Split' : 'Full'}</span>
          </button>

          {/* End Round & Generate Assessment */}
          <button
            onClick={handleEndInterviewAndEvaluate}
            disabled={isEvaluating}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Award className="w-4 h-4" />
            <span>{isEvaluating ? 'Evaluating...' : 'End & Scorecard'}</span>
          </button>

        </div>

      </div>

      {/* 2. MAIN SPLIT-SCREEN WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden relative">
        
        {/* LEFT PANEL (VOICE COMPANION & LIVE DIALOGUE) */}
        <div className={`${isCanvasMaximized ? 'hidden' : 'lg:col-span-5'} flex flex-col border-r border-slate-800 bg-slate-950/90 overflow-hidden`}>
          
          {/* AI Interviewer Avatar & Audio Orb */}
          <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  isAiSpeaking 
                    ? 'bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 shadow-lg shadow-cyan-500/30 animate-pulse' 
                    : isAiThinking
                    ? 'bg-amber-500/20 border border-amber-500/50 animate-spin'
                    : 'bg-indigo-950/80 border border-indigo-800'
                }`}>
                  <Bot className="w-6 h-6 text-white" />
                </div>
                {isAiSpeaking && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-xs font-bold text-white tracking-tight">
                    {selectedVoiceProfile === 'hi_female' ? 'Aditi Sharma' : 'Aarav Patel'}
                  </h4>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[9px] font-mono">
                    {currentCompany.name} Bar Raiser
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isAiSpeaking ? 'Speaking feedback...' : isAiThinking ? 'Analyzing your response...' : isListening ? 'Listening to candidate...' : 'Waiting for candidate input'}
                </p>
              </div>
            </div>

            {/* Right: Speaking Waves or Replay Button */}
            <div className="flex items-center space-x-2">
              {isAiSpeaking ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs">
                    <span className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce" />
                    <span className="w-1 h-5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1 h-3 bg-purple-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                    <span className="ml-1 text-[11px] font-bold text-indigo-300">Speaking...</span>
                  </div>
                  <button
                    onClick={() => {
                      stopInterviewerSpeech();
                      setIsAiSpeaking(false);
                      vadRef.current?.setTTSActive(false);
                      if (typeof window !== 'undefined') (window as any).isTTSActive = false;
                      speechEchoCooldownUntilRef.current = 0;
                      setTimeout(() => {
                        if (isHandsFreeModeRef.current && !hasPermanentMicErrorRef.current) startListening();
                      }, 200);
                    }}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-950/90 hover:bg-rose-900 border border-rose-500/60 text-rose-300 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-950/50 hover:scale-105"
                    title="Interrupt the interviewer and take your turn"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                    <span>Interrupt</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    unlockSpeechSynthesis();
                    const lastInterviewerMsg = [...messages].reverse().find(m => m.role === 'interviewer');
                    if (lastInterviewerMsg) {
                      lastSpokenInterviewerTextRef.current = lastInterviewerMsg.content;
                      setIsAiSpeaking(true);
                      vadRef.current?.setTTSActive(true);
                      if (typeof window !== 'undefined') (window as any).isTTSActive = true;
                      stopListening(true);
                      speakInterviewerText(
                        lastInterviewerMsg.content, 
                        () => {
                          speechEchoCooldownUntilRef.current = Date.now() + 100;
                          setIsAiSpeaking(false);
                          vadRef.current?.setTTSActive(false);
                          if (typeof window !== 'undefined') (window as any).isTTSActive = false;
                          if (isHandsFreeModeRef.current && !hasPermanentMicErrorRef.current) {
                            startListening();
                          }
                        }, 
                        selectedVoiceProfile
                      );
                    }
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold transition-all cursor-pointer"
                  title="Replay the last interviewer speech"
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Speak</span>
                </button>
              )}
            </div>
          </div>

          {/* Live Transcript Dialogue Stream */}
          <div 
            ref={transcriptScrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs leading-relaxed"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col space-y-1 animate-fadeIn ${
                  msg.role === 'candidate' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center justify-between w-full max-w-[92%] text-[10px] text-slate-500 font-mono">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-slate-300">
                      {msg.role === 'interviewer' 
                        ? `${selectedVoiceProfile === 'hi_female' ? 'Aditi Sharma' : 'Aarav Patel'} (${currentCompany.name})` 
                        : `${candidateName || 'Candidate'}`}
                    </span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  {msg.role === 'interviewer' && (
                    <button
                      onClick={() => {
                        unlockSpeechSynthesis();
                        lastSpokenInterviewerTextRef.current = msg.content;
                        setIsAiSpeaking(true);
                        vadRef.current?.setTTSActive(true);
                        if (typeof window !== 'undefined') (window as any).isTTSActive = true;
                        stopListening(true);
                        speakInterviewerText(
                          msg.content, 
                          () => {
                            speechEchoCooldownUntilRef.current = Date.now() + 100;
                            setIsAiSpeaking(false);
                            vadRef.current?.setTTSActive(false);
                            if (typeof window !== 'undefined') (window as any).isTTSActive = false;
                            if (isHandsFreeModeRef.current && !hasPermanentMicErrorRef.current) {
                              startListening();
                            }
                          }, 
                          selectedVoiceProfile
                        );
                      }}
                      className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-300 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                      title="Play / Replay this voice response"
                    >
                      <Volume2 className="w-3 h-3 text-cyan-400" />
                      <span>Play</span>
                    </button>
                  )}
                </div>

                <div className={`p-3.5 rounded-2xl max-w-[92%] select-text leading-relaxed font-sans ${
                  msg.role === 'candidate'
                    ? 'bg-indigo-600 text-white shadow-md rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-sm rounded-bl-none'
                }`}>
                  <FormattedChatText text={msg.role === 'interviewer' ? stripEmotionTagsForUI(msg.content) : msg.content} />
                </div>
              </div>
            ))}

            {isAiThinking && (
              <div className="flex items-center space-x-2 text-xs text-indigo-400 p-3 rounded-2xl bg-slate-900 border border-slate-800 max-w-[70%] animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Interviewer is evaluating your response...</span>
              </div>
            )}
          </div>

          {/* Deterministic Stage Ladder & Quick Action Prompt Pills */}
          <div className="p-2 bg-slate-900/80 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto custom-scrollbar flex-shrink-0 text-[11px]">
            {/* 5-Stage Ladder */}
            <div className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono flex-shrink-0">
              {(['CLARIFICATION', 'INTUITION', 'DRY_RUN', 'CODING', 'OPTIMIZATION'] as InterviewStage[]).map((stage, idx) => (
                <span
                  key={stage}
                  onClick={() => {
                    stateMachineRef.current.transitionTo(stage);
                    setCurrentStage(stage);
                  }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    currentStage === stage
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={`Stage ${idx + 1}: ${stage}`}
                >
                  {idx + 1}. {stage.charAt(0) + stage.slice(1, 4).toLowerCase()}
                </span>
              ))}
            </div>

            <span className="text-slate-500 font-bold uppercase text-[9px] px-1 flex-shrink-0">Hints:</span>
            <button
              onClick={() => handleRequestHint(1)}
              className="px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 font-medium border border-indigo-700/60 whitespace-nowrap cursor-pointer transition-all"
              title="Tier 1 Hint (-5% penalty): Subtle conceptual direction"
            >
              💡 Nudge (-5%)
            </button>
            <button
              onClick={() => handleRequestHint(2)}
              className="px-2 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-medium border border-amber-700/60 whitespace-nowrap cursor-pointer transition-all"
              title="Tier 2 Hint (-15% penalty): Algorithmic pattern / DS pointer"
            >
              🧩 Pattern (-15%)
            </button>
            <button
              onClick={() => handleRequestHint(3)}
              className="px-2 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-medium border border-rose-700/60 whitespace-nowrap cursor-pointer transition-all"
              title="Tier 3 Hint (-30% penalty): Concrete pseudocode resolution"
            >
              📝 Resolution (-30%)
            </button>

            <span className="text-slate-500 font-bold uppercase text-[9px] px-1 flex-shrink-0">Prompts:</span>
            <button
              onClick={() => {
                stateMachineRef.current.setValidation('assumptionsConfirmed', true);
                stateMachineRef.current.setValidation('constraintsClarified', true);
                handleSendMessage('What are the edge case bounds for empty inputs or negative values?');
              }}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium border border-slate-700 whitespace-nowrap cursor-pointer transition-all"
            >
              🔍 Clarify Bounds
            </button>
            <button
              onClick={() => {
                stateMachineRef.current.setValidation('timeComplexityStated', true);
                stateMachineRef.current.setValidation('spaceComplexityStated', true);
                handleSendMessage('My target time complexity is O(N) with O(1) auxiliary space.');
              }}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-medium border border-slate-700 whitespace-nowrap cursor-pointer transition-all"
            >
              ⚡ State Big-O
            </button>
          </div>

          {/* Active Voice Activity & Auto-Send Status Banner */}
          {isListening && (
            <div className="p-2 px-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2 flex-shrink-0 animate-fadeIn text-xs">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="flex items-center space-x-0.5 flex-shrink-0">
                  <span className="w-1 h-3.5 bg-teal-400 rounded-full animate-bounce" />
                  <span className="w-1 h-5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
                <div className="flex-1 truncate">
                  {interimSpeech ? (
                    <p className="text-slate-200 font-sans italic truncate">
                      "{interimSpeech}"
                    </p>
                  ) : (
                    <p className="text-teal-400 font-medium truncate">
                      🎙️ Continuous listening active... speak naturally (auto-sends on pause)
                    </p>
                  )}
                </div>
              </div>

              {silenceCountdown !== null && (
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/50 text-teal-300 font-mono text-[10px] font-bold animate-pulse">
                    Sending in {silenceCountdown}s
                  </span>
                  <button
                    onClick={() => {
                      if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current);
                        silenceTimerRef.current = null;
                      }
                      if (countdownIntervalRef.current) {
                        clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                      }
                      setSilenceCountdown(null);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold cursor-pointer transition-colors border border-amber-500/40 flex items-center gap-1"
                    title="Pause auto-send so you can keep thinking and continue speaking"
                  >
                    <span>✋ Hold</span>
                  </button>
                  <button
                    onClick={() => {
                      const toSend = speechAccumulatorRef.current.trim() || interimSpeech.trim() || inputValue.trim();
                      if (toSend) handleSendMessage(toSend);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Send Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Candidate Input Bar (Voice & Text) */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak to AI Interviewer'}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              placeholder={isListening ? 'Listening continuously... (or type your response)' : 'Type your answer or click mic to speak...'}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={(!inputValue.trim() && !interimSpeech.trim()) || isAiThinking}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* RIGHT PANEL (ADAPTIVE INTERACTIVE CANVAS) */}
        <div className={`${isCanvasMaximized ? 'lg:col-span-12' : 'lg:col-span-7'} flex flex-col bg-slate-950 overflow-hidden`}>
          
          {/* Right Panel Tabs */}
          <div className="p-2.5 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 flex-shrink-0">
            
            {/* View Mode Tabs (Strictly Round-Specific) */}
            <div className="flex items-center space-x-1 text-xs">
              
              {selectedRound === 'DSA' ? (
                <>
                  <button
                    onClick={() => setRightTab('code')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      rightTab === 'code'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>DSA Code IDE</span>
                  </button>

                  <button
                    onClick={() => setRightTab('math')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      rightTab === 'math'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Complexity & Notes</span>
                  </button>
                </>
              ) : selectedRound === 'LLD' ? (
                <>
                  <button
                    onClick={() => setRightTab('code')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      rightTab === 'code'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Machine Coding IDE</span>
                  </button>

                  <button
                    onClick={() => setRightTab('diagram')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      rightTab === 'diagram'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Class UML Diagram</span>
                  </button>

                  <button
                    onClick={() => setRightTab('math')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      rightTab === 'math'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Domain Notes</span>
                  </button>
                </>
              ) : selectedRound === 'HLD' ? (
                <>
                  <button
                    onClick={() => setRightTab('hld_canvas')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      rightTab === 'hld_canvas'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <LayoutTemplate className="w-3.5 h-3.5" />
                    <span>System Architecture Canvas</span>
                  </button>

                  <button
                    onClick={() => setRightTab('math')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      rightTab === 'math'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Capacity Math</span>
                  </button>

                  <button
                    onClick={() => setRightTab('diagram')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      rightTab === 'diagram'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>UML Architecture</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setRightTab('star')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      rightTab === 'star'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>STAR Framework Guide</span>
                  </button>
                </>
              )}

            </div>

            {/* Language Selector & Test Runner (When in Code Mode) */}
            {rightTab === 'code' && selectedRound !== 'HLD' && selectedRound !== 'Behavioral' && (
              <div className="flex items-center space-x-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="cpp">C++ (GCC 13)</option>
                  <option value="python">Python 3.12</option>
                  <option value="java">Java 21</option>
                  <option value="javascript">JavaScript (Node.js)</option>
                  <option value="go">Go 1.22</option>
                  <option value="rust">Rust 1.77</option>
                </select>

                <button
                  onClick={handleRunTestSuite}
                  disabled={isRunningTests}
                  className="px-3 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  title="Execute solution against public and hidden test cases"
                >
                  <Play className={`w-3 h-3 ${isRunningTests ? 'animate-spin text-emerald-400' : 'text-emerald-400'}`} />
                  <span>{isRunningTests ? 'Testing...' : 'Run Test Suite'}</span>
                </button>

                <button
                  onClick={() => {
                    handleSendMessage(`I have updated my code in the editor:\n\`\`\`${language}\n${editorCode}\n\`\`\`\nPlease review my logic.`);
                  }}
                  className="px-3 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Submit Code</span>
                </button>
              </div>
            )}

          </div>

          {/* Right Panel Main View Canvas */}
          <div className="flex-1 overflow-hidden relative">
            
            {/* VIEW 0: HLD INTERACTIVE DRAG-AND-DROP CANVAS */}
            {rightTab === 'hld_canvas' && (
              <div className="w-full h-full">
                <HLDArchitectureCanvas
                  problem={currentHldSpec}
                />
              </div>
            )}

            {/* VIEW 1: MONACO CODE EDITOR WITH TEST SUITE HARNESS */}
            {rightTab === 'code' && (
              <div className="w-full h-full flex flex-col relative">
                <Editor
                  height={testSuiteReport ? '75%' : '100%'}
                  language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : language === 'java' ? 'java' : language === 'javascript' ? 'javascript' : language === 'go' ? 'go' : 'rust'}
                  theme="vs-dark"
                  value={editorCode}
                  onChange={(val) => {
                    const newCode = val || '';
                    const diff = Math.abs(newCode.length - editorCode.length);
                    antiCheatRef.current.recordKeystroke();
                    if (diff > 50) {
                      antiCheatRef.current.evaluateCodeChange(diff, 10);
                    }
                    setEditorCode(newCode);
                  }}
                  options={{
                    fontSize: 13,
                    fontFamily: 'Fira Code, Menlo, Monaco, Consolas, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    tabSize: 4,
                    automaticLayout: true
                  }}
                />

                {/* TEST SUITE EXECUTION REPORT DRAWER */}
                {testSuiteReport && (
                  <div className="h-1/4 bg-slate-900 border-t border-slate-800 p-3 overflow-y-auto custom-scrollbar flex flex-col justify-between text-xs animate-fadeIn">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase font-mono ${
                          testSuiteReport.verdict === 'ACCEPTED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                            : 'bg-rose-950 text-rose-400 border border-rose-700/60'
                        }`}>
                          {testSuiteReport.verdict}
                        </span>
                        <span className="font-bold text-slate-200">
                          {testSuiteReport.passedTests}/{testSuiteReport.totalTests} Passed ({testSuiteReport.hiddenTestsPassed}/{testSuiteReport.hiddenTestsTotal} Hidden)
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                        <span>⏱️ {testSuiteReport.executionTimeMs}ms</span>
                        <span>💾 {testSuiteReport.peakMemoryKb}KB</span>
                        <button 
                          onClick={() => setTestSuiteReport(null)}
                          className="hover:text-white cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      {testSuiteReport.results.map((r, idx) => (
                        <div 
                          key={r.testId}
                          className={`p-2 rounded-xl border flex flex-col justify-between ${
                            r.status === 'PASS' 
                              ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300' 
                              : 'bg-rose-950/40 border-rose-800/40 text-rose-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span>Test #{idx + 1} ({r.isHidden ? 'Hidden' : 'Public'})</span>
                            <span>{r.status}</span>
                          </div>
                          <span className="font-mono text-[9px] opacity-80 truncate">{r.timeMs}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: KROKI UML ARCHITECTURE CANVAS */}
            {rightTab === 'diagram' && (
              <div className="w-full h-full">
                <KrokiDiagramViewer
                  slugOrTitle={activeQuestion?.title || currentCompany.name}
                  category={selectedRound}
                />
              </div>
            )}

            {/* VIEW 3: ROUND-SPECIFIC COMPLEXITY & MATH SCRATCHPAD */}
            {rightTab === 'math' && (
              <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar space-y-6 text-xs text-slate-200">
                {selectedRound === 'DSA' ? (
                  <>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-teal-400" />
                        <span>Algorithmic Complexity & Dry Run Scratchpad</span>
                      </h4>
                      <p className="text-slate-400 text-[11px]">
                        FAANG Bar Raiser evaluation expects explicit Big-O Time & Space analysis and edge cases.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                        <span className="font-bold text-teal-400 uppercase text-[10px]">1. Standard Complexity Bounds</span>
                        <p className="font-mono text-slate-300">
                          N &le; 10<sup>4</sup> &rarr; O(N<sup>2</sup>) or O(N log N)<br/>
                          N &le; 10<sup>5</sup> &rarr; O(N log N) or O(N)<br/>
                          N &le; 10<sup>7</sup> &rarr; O(N) linear scan / two pointers
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                        <span className="font-bold text-indigo-400 uppercase text-[10px]">2. Common DSA Edge Cases</span>
                        <p className="font-mono text-slate-300">
                          &bull; Empty inputs / Single-element arrays<br/>
                          &bull; Integer overflow bounds (use 64-bit int / long long)<br/>
                          &bull; Duplicate values, cyclic graphs & disconnected components
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="font-bold text-amber-400 uppercase text-[10px]">Dry Run State, Invariants & Complexity Notes:</span>
                      <textarea
                        value={whiteboardNotes}
                        onChange={(e) => setWhiteboardNotes(e.target.value)}
                        placeholder="Write your state transitions, dry run trace tables, invariant assertions, or Big-O analysis here..."
                        className="w-full h-40 p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500 resize-none custom-scrollbar"
                      />
                    </div>
                  </>
                ) : selectedRound === 'LLD' ? (
                  <>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-teal-400" />
                        <span>Low-Level Design & Machine Coding Domain Model</span>
                      </h4>
                      <p className="text-slate-400 text-[11px]">
                        Identify core domain entities, design patterns, and thread-safety concurrency locks.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                        <span className="font-bold text-teal-400 uppercase text-[10px]">1. SOLID Principles Checklist</span>
                        <p className="font-mono text-slate-300">
                          &bull; Single Responsibility &bull; Open-Closed<br/>
                          &bull; Liskov Substitution &bull; Interface Segregation<br/>
                          &bull; Dependency Inversion
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                        <span className="font-bold text-indigo-400 uppercase text-[10px]">2. Key Design Patterns</span>
                        <p className="font-mono text-slate-300">
                          &bull; Strategy / Factory / Singleton<br/>
                          &bull; Observer (Event notifications)<br/>
                          &bull; State Pattern (Status workflows)
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="font-bold text-amber-400 uppercase text-[10px]">Class Interfaces & Entity Relationships:</span>
                      <textarea
                        value={whiteboardNotes}
                        onChange={(e) => setWhiteboardNotes(e.target.value)}
                        placeholder="List your classes, enum states, method signatures, or concurrency mutexes here..."
                        className="w-full h-40 p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500 resize-none custom-scrollbar"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-teal-400" />
                        <span>Back-of-the-Envelope Capacity Estimations</span>
                      </h4>
                      <p className="text-slate-400 text-[11px]">
                        Standard FAANG System Design calculation benchmarks for {currentCompany.name}.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                        <span className="font-bold text-teal-400 uppercase text-[10px]">1. QPS / Throughput Formula</span>
                        <p className="font-mono text-slate-300">
                          Average QPS = Daily Active Users × Requests Per Day / 86,400s<br/>
                          Peak QPS = Average QPS × 2 to 5 (Traffic Spikes)
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                        <span className="font-bold text-indigo-400 uppercase text-[10px]">2. Storage Estimations</span>
                        <p className="font-mono text-slate-300">
                          Daily Storage = Daily Writes × Payload Size (e.g. 500B to 2KB)<br/>
                          5-Year Storage = Daily Storage × 365 × 5
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="font-bold text-amber-400 uppercase text-[10px]">Quick Scratchpad for Math & Notes:</span>
                      <textarea
                        value={whiteboardNotes}
                        onChange={(e) => setWhiteboardNotes(e.target.value)}
                        placeholder="Enter DAU, QPS math, storage bounds, or database partition keys here..."
                        className="w-full h-40 p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500 resize-none custom-scrollbar"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* VIEW 4: BEHAVIORAL STAR FRAMEWORK GUIDE */}
            {rightTab === 'star' && (
              <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar space-y-6 text-xs text-slate-200">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>STAR Method Framework & Leadership Guide</span>
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Structure all behavioral answers using Situation, Task, Action, and Quantifiable Results.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-amber-400">1. Situation (15%)</div>
                    <p className="text-slate-300">Set the context, team size, technical problem, and timeline.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-indigo-400">2. Task (15%)</div>
                    <p className="text-slate-300">Clarify your exact individual responsibility and target goals.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-cyan-400">3. Action (50%)</div>
                    <p className="text-slate-300">Deep-dive into technical trade-offs, architecture decisions, and conflict resolution.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-emerald-400">4. Result (20%)</div>
                    <p className="text-slate-300">Quantifiable impact: % latency reduced, 0 downtime migration, business cost saved.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="font-bold text-amber-400 uppercase text-[10px]">Your Answer Draft:</span>
                  <textarea
                    value={whiteboardNotes}
                    onChange={(e) => setWhiteboardNotes(e.target.value)}
                    placeholder="Draft your Situation, Task, Actions, and Results here..."
                    className="w-full h-36 p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-sans text-xs focus:outline-none focus:border-amber-500 resize-none custom-scrollbar"
                  />
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Floating Chat Pill when Canvas is Maximized */}
      {isCanvasMaximized && (
        <button
          onClick={() => setIsCanvasMaximized(false)}
          className="fixed bottom-6 left-6 z-40 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-2xl shadow-indigo-900/60 border border-indigo-400/40 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer animate-fadeIn"
          title="Return to Split View with Live Dialogue"
        >
          <Bot className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span>Show AI Interviewer Dialogue (Split View)</span>
        </button>
      )}

      {/* PROCTORING AUTO-PAUSE MODAL OVERLAY */}
      {isInterviewPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/50 bg-gradient-to-b from-slate-900 via-slate-950 to-amber-950/30 text-center space-y-5 shadow-2xl shadow-amber-950/50">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 mx-auto flex items-center justify-center animate-pulse">
              <Pause className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100 flex items-center justify-center gap-2">
                <span>Interview Paused</span>
              </h3>
              <p className="text-xs text-amber-300/90 font-mono mt-1">
                {pauseReason || 'Page left or focus moved away from the active interview tab'}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                The 45-minute countdown, AI speech, and speech-to-text are frozen. Return to the window and click Resume to continue your live session.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={resumeInterview}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Resume Interview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SWITCH / TUNE QUESTION MODAL */}
      {isChangeQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-lg w-full glass-panel p-6 sm:p-7 rounded-3xl border border-purple-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-purple-950/20 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Switch / Tune Interview Question</h3>
                  <p className="text-[11px] text-slate-400">Generate a fresh AI scenario or choose from the curated bank</p>
                </div>
              </div>
              <button
                onClick={() => setIsChangeQuestionModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Current Question: <span className="font-bold text-white font-mono">{activeQuestion?.title}</span>
              </p>
              <p className="text-slate-400">
                Would you like to synthesize a fresh AI problem tailored to your tech stack ({candidateTechStack.slice(0, 40)}...) or shuffle from the curated {currentCompany.name} bank?
              </p>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleSwitchToNewQuestion}
                disabled={isGeneratingCustomQuestion}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isGeneratingCustomQuestion ? 'animate-spin' : ''}`} />
                <span>{isGeneratingCustomQuestion ? 'Generating Fresh Scenario...' : '✨ Generate Fresh AI Question'}</span>
              </button>

              <button
                onClick={() => {
                  handleShuffleQuestion();
                  setIsChangeQuestionModalOpen(false);
                }}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>🎲 Shuffle Bank</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. EVALUATION SCORECARD MODAL */}
      {isScorecardOpen && scorecard && (
        <InterviewScorecardModal
          scorecard={scorecard}
          onClose={handleCloseScorecardAndExitInterview}
          onRetake={() => {
            setIsScorecardOpen(false);
            setIsInterviewStarted(false);
            setIsTimerRunning(false);
            setIsAiSpeaking(false);
            stopInterviewerSpeech();
            stopListening();
            exitFullscreenMode();
          }}
        />
      )}

      {/* 4. WALLET TOPUP MODAL */}
      {isWalletOpen && (
        <WalletTopupModal
          isOpen={isWalletOpen}
          onClose={() => setIsWalletOpen(false)}
          userEmail={getCurrentStudent()?.email || undefined}
          initialAmount={100}
        />
      )}

      {/* 5. MULTI-ROUND ADVANCE MODAL */}
      {advanceModalData && (
        <MultiRoundAdvanceModal
          isOpen={!!advanceModalData}
          roundRecord={advanceModalData.roundRecord}
          nextRound={advanceModalData.nextRound}
          totalRoundsCount={companySchedule.length}
          onProceedToNextRound={handleProceedToNextRound}
          onClose={() => {
            setAdvanceModalData(null);
            setIsScorecardOpen(true);
          }}
        />
      )}

      {/* 6. MULTI-ROUND ELIMINATION MODAL */}
      {eliminationModalData && (
        <MultiRoundEliminationModal
          isOpen={!!eliminationModalData}
          roundRecord={eliminationModalData.roundRecord}
          totalRoundsCount={companySchedule.length}
          onRestartLoop={handleRestartLoop}
          onReviewScorecard={() => {
            setEliminationModalData(null);
            setIsScorecardOpen(true);
          }}
          onExit={handleRestartLoop}
        />
      )}

      {/* 7. MULTI-ROUND FINAL OFFER MODAL */}
      {finalOfferPacket && (
        <MultiRoundOfferModal
          isOpen={!!finalOfferPacket}
          offerPacket={finalOfferPacket}
          candidateName={candidateName}
          onClose={handleRestartLoop}
        />
      )}

    </div>
  );
};
