import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  RefreshCw, 
  MessageSquare, 
  BookOpen, 
  Code, 
  Copy, 
  Check, 
  Video as VideoIcon, 
  HelpCircle,
  FileCode,
  Terminal,
  Layers,
  ChevronRight,
  Lightbulb,
  ArrowLeft,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { requestContextualAIChatResponse, ChatMessage, ContextualChatPayload } from '../lib/mistral';
import { Video, QuizQuestion } from '../lib/types';

export type AskAIMode = 'video' | 'notes' | 'quiz' | 'code';

interface AskAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video;
  videoArtifacts?: any;
  initialMode?: AskAIMode;
  activeMCQ?: QuizQuestion;
  selectedMCQOption?: number | null;
  activeCode?: string;
  activeLanguage?: string;
  codingProblem?: any;
  lastExecutionResult?: any;
}

export const AskAIChatModal: React.FC<AskAIChatModalProps> = ({ 
  isOpen, 
  onClose, 
  video,
  videoArtifacts,
  initialMode,
  activeMCQ,
  selectedMCQOption,
  activeCode,
  activeLanguage = 'python',
  codingProblem,
  lastExecutionResult
}) => {
  // Step 1: User must first choose one of the 4 contextual options before typing
  const [selectedMode, setSelectedMode] = useState<AskAIMode | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cleanTitle = (video?.title || 'Lecture').replace(/\.(mp4|mkv|webm|avi)$/i, '').replace(/_/g, ' ');
  const realTranscript = videoArtifacts?.transcript || video?.transcript || '';
  const realNotes = videoArtifacts?.notes || '';
  const resolvedCodingProblem = videoArtifacts?.coding_problem || codingProblem;

  // Reset or preset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialMode) {
        setSelectedMode(initialMode);
      } else {
        setSelectedMode(null); // Force selection screen
      }
    }
  }, [isOpen, initialMode]);

  // When a mode is selected, generate grounded initial greeting and focus input
  useEffect(() => {
    if (!isOpen || !selectedMode) return;

    let greetingText = '';
    if (selectedMode === 'video') {
      greetingText = `Hello! I am your AI Teaching Assistant for **"${cleanTitle}"**.\n\n🎙️ **Grounding Context:** Verbatim Lecture Speech Transcript (${realTranscript ? 'Loaded' : 'Synthesizing in background'}).\n\nAsk me any question about the concepts, time complexity, or architectural walkthrough explained by the instructor in this video!`;
    } else if (selectedMode === 'notes') {
      greetingText = `Hello! I am grounded in your **Algomaster SDE Study Notes** for **"${cleanTitle}"**.\n\n📘 **Grounding Context:** Core Mental Models, ASCII Architecture Diagrams, Trade-off Matrix & FAANG Interview Traps.\n\nWhich section or concept would you like me to explain further?`;
    } else if (selectedMode === 'quiz') {
      const qText = activeMCQ?.question || 'Current MCQ Quiz';
      const selectedOptText = (selectedMCQOption !== null && selectedMCQOption !== undefined && activeMCQ?.options)
        ? `Option ${String.fromCharCode(65 + selectedMCQOption)}: "${activeMCQ.options[selectedMCQOption]}"`
        : 'No option chosen yet';

      greetingText = `Hello! I am reviewing your **Conceptual MCQ Quiz** for **"${cleanTitle}"**.\n\n🎯 **Active Question:** "${qText}"\n👉 **Your Selection:** ${selectedOptText}\n\nNeed help understanding why this option is correct or why an alternative was an anti-pattern?`;
    } else if (selectedMode === 'code') {
      const probTitle = resolvedCodingProblem?.title || activeMCQ?.question || cleanTitle;
      const statusNote = lastExecutionResult ? `Last Run: ${lastExecutionResult.status} (${lastExecutionResult.execution_time_ms || 20}ms)` : 'Editor ready';

      greetingText = `Hello! I am inspecting your **Coding Workspace** for **"${probTitle}"** (${activeLanguage.toUpperCase()}).\n\n💻 **Active Context:** Problem statement, your typed code solution, and compiler terminal output (${statusNote}).\n\nNeed help debugging a syntax/runtime error, optimizing Time/Space complexity, or passing edge cases?`;
    }

    setMessages([
      {
        role: 'assistant',
        content: greetingText
      }
    ]);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, [isOpen, selectedMode, cleanTitle, activeMCQ?.question, selectedMCQOption, activeLanguage, resolvedCodingProblem?.title]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSelectMode = (mode: AskAIMode) => {
    setSelectedMode(mode);
  };

  const handleSend = async (textToSend?: string) => {
    if (!selectedMode) return;
    const query = textToSend || inputMsg;
    if (!query.trim() || isLoading) return;

    const userEntry: ChatMessage = { role: 'user', content: query.trim() };
    const updatedMessages = [...messages, userEntry];
    setMessages(updatedMessages);
    if (!textToSend) setInputMsg('');
    setIsLoading(true);

    const payload: ContextualChatPayload = {
      mode: selectedMode,
      userMsg: query.trim(),
      videoTitle: cleanTitle,
      transcript: realTranscript,
      notes: realNotes,
      mcq: activeMCQ ? {
        question: activeMCQ.question,
        options: activeMCQ.options || [],
        selectedAnswer: selectedMCQOption,
        correctAnswer: activeMCQ.correct_answer,
        explanation: activeMCQ.explanation
      } : undefined,
      codingContext: {
        title: resolvedCodingProblem?.title || cleanTitle,
        problemStatement: resolvedCodingProblem?.problem_statement || activeMCQ?.question || '',
        studentCode: activeCode || resolvedCodingProblem?.starter_code_python || resolvedCodingProblem?.starter_code_cpp || '',
        language: activeLanguage,
        testCases: activeMCQ?.test_cases || [],
        stdout: lastExecutionResult?.stdout || '',
        stderr: lastExecutionResult?.stderr || ''
      },
      history: updatedMessages
    };

    const reply = await requestContextualAIChatResponse(payload);

    setIsLoading(false);
    setMessages([...updatedMessages, { role: 'assistant', content: reply }]);
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Quick Prompt Chips customized per Context Mode
  const getQuickQuestions = () => {
    switch (selectedMode) {
      case 'video':
        return [
          `Summarize the 3 core takeaways from this lecture`,
          `Explain the algorithm approach at a high level`,
          `What trade-offs did the instructor mention?`,
          `Give a real-world software engineering analogy`
        ];
      case 'notes':
        return [
          `Explain the trade-off matrix in Section 4`,
          `Break down the ASCII architecture diagram`,
          `What are the most common FAANG interview traps?`,
          `Summarize Section 1 Core Mental Model`
        ];
      case 'quiz':
        return [
          `Why is my selected option correct or incorrect?`,
          `Explain the underlying principle behind this question`,
          `Give me another practice question on this concept`,
          `How is this rule applied in production code?`
        ];
      case 'code':
        return [
          `Debug my compiler error or runtime exception`,
          `Analyze the Time & Space Complexity of my code`,
          `What edge cases would break my solution?`,
          `How can I optimize this into fewer lines?`
        ];
      default:
        return [];
    }
  };

  const quickQuestions = getQuickQuestions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 animate-fadeIn">
      
      {/* Sliding Drawer */}
      <div className="w-full max-w-xl h-[92vh] glass-panel rounded-3xl border border-purple-500/40 bg-slate-950 flex flex-col shadow-2xl overflow-hidden relative font-sans">
        
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-purple-950/90 via-slate-900 to-slate-950 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                EduStream AI Teaching Assistant
              </h3>
              <p className="text-[11px] text-purple-300 font-mono line-clamp-1">
                Lecture: {cleanTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {selectedMode && (
              <button
                onClick={() => setSelectedMode(null)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 hover:text-purple-200 border border-purple-800/50 text-[11px] font-bold flex items-center gap-1 transition-all"
                title="Choose a different context option"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Change Option</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors border border-slate-800/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 1: CHOOSE ONE OF THE 4 CONTEXT OPTIONS FIRST        */}
        {/* ========================================================= */}
        {!selectedMode ? (
          <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-center space-y-6">
            <div className="text-center space-y-2 max-w-md mx-auto">
              <div className="inline-flex p-3 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-300 mb-1">
                <Bot className="w-7 h-7 animate-bounce" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-100">
                How can I assist you with this lecture?
              </h2>
              <p className="text-xs text-slate-400">
                Please select which context you need help with. I will ground my reasoning directly in your selection:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg mx-auto w-full">
              
              {/* Option 1: Video & Transcript */}
              <button
                onClick={() => handleSelectMode('video')}
                className="p-4 rounded-2xl bg-slate-900/90 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/60 text-left transition-all hover:scale-[1.02] group shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <VideoIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                      Speech STT
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-purple-200">
                    1. Video & Transcript
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Ask questions about the lecture audio, explanations, and key concepts taught by the instructor.
                  </p>
                </div>
                <div className="mt-3 flex items-center text-[11px] font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
                  <span>Select Video Context</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </button>

              {/* Option 2: Study Notes */}
              <button
                onClick={() => handleSelectMode('notes')}
                className="p-4 rounded-2xl bg-slate-900/90 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/60 text-left transition-all hover:scale-[1.02] group shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Algomaster SDE
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-200">
                    2. SDE Study Notes
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Clarify Algomaster study guides, ASCII architecture diagrams, trade-off tables & FAANG traps.
                  </p>
                </div>
                <div className="mt-3 flex items-center text-[11px] font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Select Notes Context</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </button>

              {/* Option 3: MCQ Quiz */}
              <button
                onClick={() => handleSelectMode('quiz')}
                className="p-4 rounded-2xl bg-slate-900/90 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500/60 text-left transition-all hover:scale-[1.02] group shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                      Quiz Practice
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-200">
                    3. Conceptual MCQ Quiz
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Analyze quiz questions, review your chosen option, and understand why specific choices are right/wrong.
                  </p>
                </div>
                <div className="mt-3 flex items-center text-[11px] font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Select Quiz Context</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </button>

              {/* Option 4: Coding Problem */}
              <button
                onClick={() => handleSelectMode('code')}
                className="p-4 rounded-2xl bg-slate-900/90 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/60 text-left transition-all hover:scale-[1.02] group shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Code className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                      Monaco & Terminal
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-200">
                    4. Coding Challenge
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Inspect your active code, debug compiler errors, analyze Big-O complexity, and pass test cases.
                  </p>
                </div>
                <div className="mt-3 flex items-center text-[11px] font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Select Code Context</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </button>

            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* STEP 2: ACTIVE CONTEXT CHAT & QUESTION INPUT             */
          /* ========================================================= */
          <>
            {/* Active Context Bar */}
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Active Grounding:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1.5 ${
                  selectedMode === 'video' ? 'bg-purple-950 text-purple-300 border border-purple-700' :
                  selectedMode === 'notes' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
                  selectedMode === 'quiz' ? 'bg-amber-950 text-amber-300 border border-amber-700' :
                  'bg-indigo-950 text-indigo-300 border border-indigo-700'
                }`}>
                  {selectedMode === 'video' && <VideoIcon className="w-3 h-3" />}
                  {selectedMode === 'notes' && <BookOpen className="w-3 h-3" />}
                  {selectedMode === 'quiz' && <HelpCircle className="w-3 h-3" />}
                  {selectedMode === 'code' && <Code className="w-3 h-3" />}
                  <span className="capitalize">{selectedMode === 'video' ? 'Video & Transcript' : selectedMode === 'notes' ? 'SDE Study Notes' : selectedMode === 'quiz' ? 'MCQ Quiz' : 'Coding Challenge'}</span>
                </span>
              </div>

              <div className="flex items-center gap-1">
                {(['video', 'notes', 'quiz', 'code'] as AskAIMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleSelectMode(m)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                      selectedMode === m 
                        ? 'bg-purple-600 text-white ring-1 ring-purple-400' 
                        : 'bg-slate-950 text-slate-500 hover:text-slate-200 border border-slate-800'
                    }`}
                    title={`Switch to ${m}`}
                  >
                    {m === 'video' ? '1' : m === 'notes' ? '2' : m === 'quiz' ? '3' : '4'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Question Chips */}
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] font-mono no-scrollbar">
              <span className="text-purple-400 font-bold flex-shrink-0 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Suggested:
              </span>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-950 border border-slate-800 hover:border-purple-700/60 text-slate-300 hover:text-purple-200 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Message Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl relative leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans">{m.content}</div>

                    {m.role === 'assistant' && (
                      <button
                        onClick={() => handleCopyText(m.content, idx)}
                        className="absolute top-2 right-2 p-1 text-slate-500 hover:text-purple-300 transition-colors"
                        title="Copy response"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {m.role === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-7 h-7 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-purple-400 flex items-center space-x-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span className="text-[11px] font-mono">EduStream AI is analyzing {selectedMode} context...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Ask a question regarding ${selectedMode === 'video' ? 'lecture transcript' : selectedMode === 'notes' ? 'SDE notes' : selectedMode === 'quiz' ? 'MCQ quiz' : 'coding problem & compiler'}...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-purple-500 text-slate-100 placeholder-slate-500 text-xs"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputMsg.trim() || isLoading}
                className={`p-2.5 rounded-xl transition-all shadow-md ${
                  inputMsg.trim() && !isLoading
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30 hover:scale-105'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

      </div>

    </div>
  );
};
