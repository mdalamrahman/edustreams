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
  Lightbulb
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
  initialMode = 'video',
  activeMCQ,
  selectedMCQOption,
  activeCode,
  activeLanguage = 'python',
  codingProblem,
  lastExecutionResult
}) => {
  const [activeMode, setActiveMode] = useState<AskAIMode>(initialMode);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const cleanTitle = (video?.title || 'Lecture').replace(/\.(mp4|mkv|webm|avi)$/i, '').replace(/_/g, ' ');
  const realTranscript = videoArtifacts?.transcript || video?.transcript || '';
  const realNotes = videoArtifacts?.notes || '';
  const resolvedCodingProblem = videoArtifacts?.coding_problem || codingProblem;

  // Sync mode whenever modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setActiveMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Set context-specific welcoming initial greeting whenever mode changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    let greetingText = '';
    if (activeMode === 'video') {
      greetingText = `Hello! I am your AI Teaching Assistant for **"${cleanTitle}"**.\n\n🎙️ **Grounding Context:** Verbatim Lecture Speech Transcript (${realTranscript ? 'Loaded' : 'Synthesizing in background'}).\n\nAsk me anything about the concepts explained by the instructor in this video!`;
    } else if (activeMode === 'notes') {
      greetingText = `Hello! I am grounded in your **Algomaster SDE Study Notes** for **"${cleanTitle}"**.\n\n📘 **Grounding Context:** Core Mental Models, Architectural Diagrams, Trade-off Matrix & FAANG Interview Traps.\n\nWhich section or concept would you like me to elaborate on?`;
    } else if (activeMode === 'quiz') {
      const qText = activeMCQ?.question || 'Current MCQ Quiz';
      const selectedOptText = (selectedMCQOption !== null && selectedMCQOption !== undefined && activeMCQ?.options)
        ? `Option ${String.fromCharCode(65 + selectedMCQOption)}: "${activeMCQ.options[selectedMCQOption]}"`
        : 'No option chosen yet';

      greetingText = `Hello! I am reviewing your **Conceptual MCQ Quiz** for **"${cleanTitle}"**.\n\n🎯 **Active Question:** "${qText}"\n👉 **Your Selection:** ${selectedOptText}\n\nNeed help understanding why a specific option is correct or why an alternative is an anti-pattern?`;
    } else if (activeMode === 'code') {
      const probTitle = resolvedCodingProblem?.title || activeMCQ?.question || cleanTitle;
      const statusNote = lastExecutionResult ? `Last Run: ${lastExecutionResult.status} (${lastExecutionResult.execution_time_ms || 20}ms)` : 'Editor ready';

      greetingText = `Hello! I am inspecting your **Coding Workspace** for **"${probTitle}"** (${activeLanguage.toUpperCase()}).\n\n💻 **Active Context:** Problem constraints, your typed code solution, and compiler terminal output (${statusNote}).\n\nNeed help debugging an exception, optimizing Time/Space complexity, or passing edge cases?`;
    }

    setMessages([
      {
        role: 'assistant',
        content: greetingText
      }
    ]);
  }, [isOpen, activeMode, cleanTitle, activeMCQ?.question, selectedMCQOption, activeLanguage, resolvedCodingProblem?.title]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMsg;
    if (!query.trim() || isLoading) return;

    const userEntry: ChatMessage = { role: 'user', content: query.trim() };
    const updatedMessages = [...messages, userEntry];
    setMessages(updatedMessages);
    if (!textToSend) setInputMsg('');
    setIsLoading(true);

    const payload: ContextualChatPayload = {
      mode: activeMode,
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
    switch (activeMode) {
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

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors border border-slate-800/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTEXT SELECTOR TABS (4 Grounding Modes) */}
        <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setActiveMode('video')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeMode === 'video'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            <span>Video & Transcript</span>
          </button>

          <button
            onClick={() => setActiveMode('notes')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeMode === 'notes'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Study Notes</span>
          </button>

          <button
            onClick={() => setActiveMode('quiz')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeMode === 'quiz'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>MCQ Quiz</span>
          </button>

          <button
            onClick={() => setActiveMode('code')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeMode === 'code'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Coding & Terminal</span>
          </button>
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
                <span className="text-[11px] font-mono">EduStream AI is analyzing {activeMode} context...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask a question regarding ${activeMode === 'video' ? 'lecture transcript' : activeMode === 'notes' ? 'SDE notes' : activeMode === 'quiz' ? 'MCQ quiz' : 'coding problem & compiler'}...`}
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

      </div>

    </div>
  );
};
