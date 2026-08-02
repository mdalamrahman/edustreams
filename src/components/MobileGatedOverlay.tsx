import React from 'react';
import { Laptop, Smartphone, AlertCircle, ArrowRight } from 'lucide-react';

interface MobileGatedOverlayProps {
  onDismiss: () => void;
  onSwitchToQuiz: () => void;
}

export const MobileGatedOverlay: React.FC<MobileGatedOverlayProps> = ({ onDismiss, onSwitchToQuiz }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="max-w-md w-full glass-panel rounded-2xl p-6 border border-amber-500/30 shadow-2xl shadow-amber-500/10 text-center">
        
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <Laptop className="w-8 h-8 animate-pulse" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
          Device Access Policy Gated
        </span>

        <h3 className="text-xl font-bold text-slate-100 mb-2">
          Laptop or Desktop Required for Coding Practice
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          Coding challenges require a physical keyboard, full editor layout, and Monaco compiler terminal. Please open this lesson on your computer to write, run, and debug your code.
        </p>

        {/* Allowed Features Card */}
        <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 text-left mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" /> Unlocked Mobile Features:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>HD Video Streaming & Offline Caching</li>
            <li>Interactive MCQ Quizzes & Solution Explanations</li>
            <li>Download Study Attachments (.pdf, .docx, .zip)</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onSwitchToQuiz}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <span>Take Mobile MCQ Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onDismiss}
            className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all"
          >
            Close Notice
          </button>
        </div>

      </div>
    </div>
  );
};
