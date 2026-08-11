import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, RefreshCw, MessageSquare, BookOpen, Code, Copy, Check } from 'lucide-react';
import { requestMistralChatResponse, ChatMessage } from '../lib/mistral';
import { Video } from '../lib/types';

interface AskAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video;
}

export const AskAIChatModal: React.FC<AskAIChatModalProps> = ({ isOpen, onClose, video }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const cleanTitle = (video.title || 'Lecture').replace(/\.(mp4|mkv|webm)$/i, '');

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I am your AI Teaching Assistant for **"${cleanTitle}"**.\n\nI have read the lecture transcript & Telegram post notes. Ask me any question about the algorithm, C++ code implementation, time complexity, or concepts explained in this video!`
        }
      ]);
    }
  }, [isOpen, cleanTitle]);

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

    const reply = await requestMistralChatResponse(
      query.trim(),
      video.title,
      video.transcript,
      updatedMessages
    );

    setIsLoading(false);
    setMessages([...updatedMessages, { role: 'assistant', content: reply }]);
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const quickQuestions = [
    `Explain the main algorithm in ${cleanTitle}`,
    `What is the time and space complexity?`,
    `Show the C++ solution code step-by-step`,
    `What edge cases should I test for?`
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 animate-fadeIn">
      
      {/* Sliding Drawer */}
      <div className="w-full max-w-xl h-[92vh] glass-panel rounded-2xl border border-purple-500/40 bg-slate-950 flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/40">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Ask AI Teaching Assistant
              </h3>
              <p className="text-[11px] text-purple-300 font-mono line-clamp-1">
                Lecture: {cleanTitle} (Post #{video.telegram_message_id})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] font-mono no-scrollbar">
          <span className="text-purple-400 font-bold flex-shrink-0 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Quick Ask:
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-700/50 text-purple-200 transition-all hover:scale-105"
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
                <div className="w-7 h-7 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl relative ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none leading-relaxed'
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
                <div className="w-7 h-7 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs p-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              <span>EduStream AI is analyzing lecture transcript & generating response...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={`Ask AI anything about "${cleanTitle}"...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-sans"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
