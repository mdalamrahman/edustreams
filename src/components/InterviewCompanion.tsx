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
  Radio
} from 'lucide-react';
import { 
  SdeLevel, 
  InterviewRound, 
  SUPPORTED_COMPANIES, 
  CuratedInterviewQuestion, 
  getCompanyInterviewData 
} from '../lib/githubInterviewData';
import { 
  InterviewMessage, 
  InterviewContext, 
  sendInterviewerMessage, 
  speakInterviewerText, 
  stopInterviewerSpeech 
} from '../lib/interviewService';
import { evaluateInterview, InterviewScorecard } from '../lib/interviewEvaluator';
import { InterviewScorecardModal } from './InterviewScorecardModal';
import { KrokiDiagramViewer } from './KrokiDiagramViewer';
import { FormattedChatText } from './FormattedChatText';
import { SupportedLanguage } from '../lib/compiler';
import confetti from 'canvas-confetti';

interface InterviewCompanionProps {
  onBackToDashboard?: () => void;
}

export const InterviewCompanion: React.FC<InterviewCompanionProps> = ({ onBackToDashboard }) => {
  // Configuration State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('google');
  const [selectedLevel, setSelectedLevel] = useState<SdeLevel>('SDE-2');
  const [selectedRound, setSelectedRound] = useState<InterviewRound>('DSA');
  const [language, setLanguage] = useState<SupportedLanguage>('cpp');

  // Active Problem & Context
  const [availableQuestions, setAvailableQuestions] = useState<CuratedInterviewQuestion[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<CuratedInterviewQuestion | null>(null);
  const [editorCode, setEditorCode] = useState<string>('// Write your optimal solution here\n\n');
  const [whiteboardNotes, setWhiteboardNotes] = useState<string>('');
  const [rightTab, setRightTab] = useState<'code' | 'diagram' | 'math' | 'star'>('code');

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

  // Timer State (45 mins default)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Assessment & Scorecard State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [scorecard, setScorecard] = useState<InterviewScorecard | null>(null);
  const [isScorecardOpen, setIsScorecardOpen] = useState<boolean>(false);

  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechAccumulatorRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const isRecognitionActiveRef = useRef<boolean>(false);
  const isAiSpeakingRef = useRef<boolean>(false);
  const isAiThinkingRef = useRef<boolean>(false);
  const isHandsFreeModeRef = useRef<boolean>(true);

  // Keep refs synchronized
  useEffect(() => { isAiSpeakingRef.current = isAiSpeaking; }, [isAiSpeaking]);
  useEffect(() => { isAiThinkingRef.current = isAiThinking; }, [isAiThinking]);
  useEffect(() => { isHandsFreeModeRef.current = isHandsFreeMode; }, [isHandsFreeMode]);

  // Selected company object
  const currentCompany = useMemo(() => {
    return SUPPORTED_COMPANIES.find(c => c.id === selectedCompanyId) || SUPPORTED_COMPANIES[0];
  }, [selectedCompanyId]);

  // Load questions when company/round/level changes
  useEffect(() => {
    let isCancelled = false;
    getCompanyInterviewData(currentCompany.name, selectedRound, selectedLevel).then(qs => {
      if (!isCancelled && qs && qs.length > 0) {
        setAvailableQuestions(qs);
        setActiveQuestion(qs[0]);
        if (qs[0].starterCode && qs[0].starterCode[language]) {
          setEditorCode(qs[0].starterCode[language]);
        }
      }
    });
    return () => { isCancelled = true; };
  }, [currentCompany, selectedRound, selectedLevel]);

  const startListening = () => {
    if (!recognitionRef.current || isAiThinkingRef.current) return;
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

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setSilenceCountdown(null);

    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Initialize Interview Dialogue on start or round change
  useEffect(() => {
    if (!activeQuestion) return;

    const initialGreeting = `Hello! I'm your Principal Engineering Interviewer at ${currentCompany.name} today. We will be conducting a ${selectedLevel} ${selectedRound} interview.\n\nHere is your problem scenario:\n**${activeQuestion.title}**\n\n${activeQuestion.description}\n\nTo begin, please walk me through your initial understanding, clarify any constraints, and explain your high-level approach before writing code.`;

    const initialMsg: InterviewMessage = {
      id: 'msg-init',
      role: 'interviewer',
      content: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: 'problem'
    };

    setMessages([initialMsg]);
    setSecondsRemaining(45 * 60);
    setIsTimerRunning(true);

    if (!isVoiceMuted) {
      setIsAiSpeaking(true);
      speakInterviewerText(initialGreeting, () => {
        setIsAiSpeaking(false);
        if (isHandsFreeModeRef.current) {
          startListening();
        }
      });
    } else if (isHandsFreeModeRef.current) {
      startListening();
    }

    return () => {
      stopInterviewerSpeech();
      stopListening();
    };
  }, [activeQuestion]);

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
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          isRecognitionActiveRef.current = true;
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
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
            speechAccumulatorRef.current = fullSpeech;
            setInterimSpeech(fullSpeech);
            setInputValue(fullSpeech);

            // Reset silence countdown timer
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

            // If hands-free mode is on and we have meaningful speech, start 1.8s auto-send countdown
            if (isHandsFreeModeRef.current && fullSpeech.split(' ').length >= 2) {
              let remainingMs = 1800;
              setSilenceCountdown(1.8);

              countdownIntervalRef.current = setInterval(() => {
                remainingMs -= 200;
                if (remainingMs <= 0) {
                  clearInterval(countdownIntervalRef.current);
                  setSilenceCountdown(null);
                } else {
                  setSilenceCountdown(Number((remainingMs / 1000).toFixed(1)));
                }
              }, 200);

              silenceTimerRef.current = setTimeout(() => {
                clearInterval(countdownIntervalRef.current);
                setSilenceCountdown(null);
                const toSend = speechAccumulatorRef.current.trim();
                if (toSend && !isAiThinkingRef.current) {
                  speechAccumulatorRef.current = '';
                  setInterimSpeech('');
                  handleSendMessage(toSend);
                }
              }, 1800);
            }
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            console.warn('Speech recognition error:', event.error);
          }
        };

        recognition.onend = () => {
          isRecognitionActiveRef.current = false;
          // In hands-free mode, if not AI speaking and not thinking, keep listening alive
          if (isHandsFreeModeRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
            try {
              recognition.start();
            } catch {}
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue || interimSpeech).trim();
    if (!text || isAiThinkingRef.current) return;

    // Clear speech timers & accumulator
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setSilenceCountdown(null);
    setInterimSpeech('');
    speechAccumulatorRef.current = '';
    setInputValue('');

    // Stop candidate mic and any AI speech while evaluating
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

    const ctx: InterviewContext = {
      company: currentCompany.name,
      level: selectedLevel,
      round: selectedRound,
      question: activeQuestion || undefined,
      candidateCode: editorCode,
      language: language,
      whiteboardNotes: whiteboardNotes
    };

    const aiReply = await sendInterviewerMessage(nextMessages, ctx);
    setIsAiThinking(false);

    const interviewerMsg: InterviewMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'interviewer',
      content: aiReply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: 'coding'
    };

    setMessages([...nextMessages, interviewerMsg]);

    // AI Voice Response & Seamless Hands-Free Auto-Listening Loop
    if (!isVoiceMuted) {
      setIsAiSpeaking(true);
      speakInterviewerText(aiReply, () => {
        setIsAiSpeaking(false);
        if (isHandsFreeModeRef.current) {
          startListening();
        }
      });
    } else if (isHandsFreeModeRef.current) {
      startListening();
    }
  };

  const handleEndInterviewAndEvaluate = async () => {
    setIsEvaluating(true);
    stopInterviewerSpeech();
    setIsAiSpeaking(false);

    const ctx: InterviewContext = {
      company: currentCompany.name,
      level: selectedLevel,
      round: selectedRound,
      question: activeQuestion || undefined,
      candidateCode: editorCode,
      language: language,
      whiteboardNotes: whiteboardNotes
    };

    const duration = Math.max(1, Math.round((45 * 60 - secondsRemaining) / 60));
    const result = await evaluateInterview(messages, ctx, duration);
    setIsEvaluating(false);
    setScorecard(result);
    setIsScorecardOpen(true);

    if (result.overallScore >= 75) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* 1. TOP CONFIGURATOR & STATUS BAR */}
      <div className="p-3 sm:px-6 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        
        {/* Left: Role, Company & Round Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Company Picker */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer"
            >
              {SUPPORTED_COMPANIES.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* SDE Level Selector */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            {(['SDE-1', 'SDE-2', 'SDE-3'] as SdeLevel[]).map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Round Type Selector */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            {(['DSA', 'LLD', 'HLD', 'Behavioral'] as InterviewRound[]).map(rd => (
              <button
                key={rd}
                onClick={() => {
                  setSelectedRound(rd);
                  if (rd === 'HLD') setRightTab('diagram');
                  else if (rd === 'Behavioral') setRightTab('star');
                  else setRightTab('code');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedRound === rd
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rd}
              </button>
            ))}
          </div>

        </div>

        {/* Right: Timer, Voice Mute & End Interview CTA */}
        <div className="flex items-center space-x-3">
          
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

          {/* Hands-Free Live Voice Toggle */}
          <button
            onClick={() => {
              const next = !isHandsFreeMode;
              setIsHandsFreeMode(next);
              if (!next) stopListening();
              else if (!isAiSpeaking && !isAiThinking) startListening();
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isHandsFreeMode
                ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border-teal-500/60 text-teal-300 shadow-sm shadow-teal-900/30'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Hands-Free Voice Flow: Automatically listens and sends when you pause speaking without pressing any buttons"
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* LEFT PANEL (VOICE COMPANION & LIVE DIALOGUE) - 5 COLS */}
        <div className="lg:col-span-5 flex flex-col border-r border-slate-800 bg-slate-950/90 overflow-hidden">
          
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
                    {currentCompany.name} Lead Bar Raiser
                  </h4>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[9px] font-mono">
                    AI Companion
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isAiSpeaking ? 'Speaking feedback...' : isAiThinking ? 'Analyzing your response...' : isListening ? 'Listening to candidate...' : 'Waiting for candidate input'}
                </p>
              </div>
            </div>

            {/* Speaking Status Waves */}
            {isAiSpeaking && (
              <div className="flex items-center space-x-1">
                <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce" />
                <span className="w-1 h-6 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1 h-3 bg-purple-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            )}
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
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-mono">
                  <span>{msg.role === 'interviewer' ? `${currentCompany.name} Interviewer` : 'Candidate'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className={`p-3.5 rounded-2xl max-w-[92%] select-text leading-relaxed font-sans ${
                  msg.role === 'candidate'
                    ? 'bg-indigo-600 text-white shadow-md rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-sm rounded-bl-none'
                }`}>
                  <FormattedChatText text={msg.content} />
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

          {/* Quick Action Prompt Pills */}
          <div className="p-2.5 bg-slate-900/70 border-t border-slate-800 flex items-center space-x-1.5 overflow-x-auto custom-scrollbar flex-shrink-0 text-[11px]">
            <span className="text-slate-500 font-bold uppercase text-[9px] px-1">Quick:</span>
            <button
              onClick={() => handleSendMessage('Can you provide a subtle hint on optimizing the time complexity?')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium border border-slate-700 whitespace-nowrap cursor-pointer transition-all"
            >
              💡 Ask for Hint
            </button>
            <button
              onClick={() => handleSendMessage('Let me walk you through my high-level intuition and constraints before writing code.')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium border border-slate-700 whitespace-nowrap cursor-pointer transition-all"
            >
              🧠 Explain Intuition
            </button>
            <button
              onClick={() => handleSendMessage('What are the edge case bounds for empty inputs or negative values?')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium border border-slate-700 whitespace-nowrap cursor-pointer transition-all"
            >
              🔍 Clarify Constraints
            </button>
            <button
              onClick={() => handleSendMessage('My target time complexity is O(N) with O(1) auxiliary space.')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-medium border border-slate-700 whitespace-nowrap cursor-pointer transition-all"
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
              disabled={!inputValue.trim() && !interimSpeech.trim() || isAiThinking}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* RIGHT PANEL (ADAPTIVE INTERACTIVE CANVAS) - 7 COLS */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950 overflow-hidden">
          
          {/* Right Panel Tabs */}
          <div className="p-2.5 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 flex-shrink-0">
            
            {/* View Mode Tabs */}
            <div className="flex items-center space-x-1 text-xs">
              <button
                onClick={() => setRightTab('code')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  rightTab === 'code'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Editor</span>
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
                <span>UML & Architecture</span>
              </button>

              {selectedRound === 'HLD' && (
                <button
                  onClick={() => setRightTab('math')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    rightTab === 'math'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Sizing Math</span>
                </button>
              )}

              {selectedRound === 'Behavioral' && (
                <button
                  onClick={() => setRightTab('star')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    rightTab === 'star'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>STAR Guide</span>
                </button>
              )}
            </div>

            {/* Language Selector (When in Code Mode) */}
            {rightTab === 'code' && (
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
                  onClick={() => {
                    handleSendMessage(`I have updated my code in the editor:\n\`\`\`${language}\n${editorCode}\n\`\`\`\nPlease review my logic.`);
                  }}
                  className="px-3 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Submit to Interviewer</span>
                </button>
              </div>
            )}

          </div>

          {/* Right Panel Main View Canvas */}
          <div className="flex-1 overflow-hidden relative">
            
            {/* VIEW 1: MONACO CODE EDITOR */}
            {rightTab === 'code' && (
              <div className="w-full h-full flex flex-col">
                <Editor
                  height="100%"
                  language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : language === 'java' ? 'java' : language === 'javascript' ? 'javascript' : language === 'go' ? 'go' : 'rust'}
                  theme="vs-dark"
                  value={editorCode}
                  onChange={(val) => setEditorCode(val || '')}
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

            {/* VIEW 3: HLD CAPACITY SIZING MATH */}
            {rightTab === 'math' && (
              <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar space-y-6 text-xs text-slate-200">
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

      {/* 3. EVALUATION SCORECARD MODAL */}
      {isScorecardOpen && scorecard && (
        <InterviewScorecardModal
          scorecard={scorecard}
          onClose={() => setIsScorecardOpen(false)}
          onRetake={() => {
            setIsScorecardOpen(false);
            setSecondsRemaining(45 * 60);
            setIsTimerRunning(true);
          }}
        />
      )}

    </div>
  );
};
