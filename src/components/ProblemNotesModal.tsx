import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Save, 
  Download, 
  Check, 
  Copy, 
  Cloud, 
  Sparkles, 
  X, 
  Code,
  Layers,
  Clock,
  Eye,
  Edit2
} from 'lucide-react';
import { DSAProblem } from '../lib/dsaSheetsData';
import { getLocalProblemNote, saveProblemNote, downloadProblemNotesAsTxt } from '../lib/notesService';
import { FormattedChatText } from './FormattedChatText';

interface ProblemNotesModalProps {
  problem: DSAProblem;
  userEmail?: string;
  onClose: () => void;
}

export const ProblemNotesModal: React.FC<ProblemNotesModalProps> = ({
  problem,
  userEmail,
  onClose
}) => {
  const [noteContent, setNoteContent] = useState<string>(() => {
    return getLocalProblemNote(problem.slug || problem.name);
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'synced'>('idle');
  const [hasCopied, setHasCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const wordCount = useMemoWords(noteContent);
  const charCount = noteContent.length;

  const handleSave = async () => {
    setIsSaving(true);
    const slug = problem.slug || problem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const res = await saveProblemNote(slug, problem.name, noteContent, userEmail);
    setIsSaving(false);
    if (res.syncedToCloudflare) {
      setSaveStatus('synced');
    } else {
      setSaveStatus('saved');
    }
    setTimeout(() => setSaveStatus('idle'), 4000);
  };

  const handleDownload = () => {
    const slug = problem.slug || problem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadProblemNotesAsTxt(slug, problem.name, noteContent);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(noteContent);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  // Clean, professional plain-text template inserts (no messy markdown hashes or stars)
  const insertTemplate = (templateType: 'intuition' | 'edgecases' | 'complexity' | 'full') => {
    let snippet = '';
    if (templateType === 'intuition') {
      snippet = `\n[ CORE INTUITION / KEY APPROACH ]\n• Main observation:\n• State & Pointer transitions:\n• Why this works:\n`;
    } else if (templateType === 'edgecases') {
      snippet = `\n[ EDGE CASES TO CONSIDER ]\n• Empty array / single element\n• Negative numbers / zero boundaries\n• Duplicates / all elements identical\n• Integer overflow limits\n`;
    } else if (templateType === 'complexity') {
      snippet = `\n[ COMPLEXITY ANALYSIS ]\n• Time Complexity:  O(N)\n• Space Complexity: O(1)\n`;
    } else if (templateType === 'full') {
      snippet = `=======================================================\n` +
        `PROBLEM NOTES: ${problem.name}\n` +
        `Category: ${problem.category}\n` +
        `Difficulty: ${problem.difficulty}\n` +
        `=======================================================\n\n` +
        `[ CORE INTUITION ]\n• \n\n` +
        `[ ALGORITHM STEPS ]\n1. \n2. \n3. \n\n` +
        `[ EDGE CASES TO CONSIDER ]\n• Empty / single element input\n• Negative numbers or zero\n• Duplicates or overflow boundaries\n\n` +
        `[ COMPLEXITY ANALYSIS ]\n• Time Complexity:  O()\n• Space Complexity: O()\n\n` +
        `[ KEY TAKEAWAYS & PITFALLS ]\n• \n`;
    }

    setNoteContent((prev) => (prev ? prev + '\n' + snippet : snippet.trim()));
    setActiveTab('edit');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/20 shadow-2xl p-5 sm:p-7 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-[10px] font-black uppercase tracking-wider font-mono">
                  Personal Study Notes (.txt / Cloudflare)
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  problem.difficulty === 'Easy' 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                    : problem.difficulty === 'Medium' 
                      ? 'bg-amber-950 text-amber-400 border border-amber-800' 
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {problem.difficulty}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 truncate max-w-lg">
                {problem.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {problem.category} {problem.subcategory ? `• ${problem.subcategory}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Edit / Preview Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'edit'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Insert Templates Bar */}
        <div className="flex items-center space-x-2 py-3 overflow-x-auto custom-scrollbar flex-shrink-0 border-b border-slate-800/60 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
            Insert Section:
          </span>
          <button
            onClick={() => insertTemplate('full')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all whitespace-nowrap cursor-pointer border border-slate-700"
          >
            + Full Clean Template
          </button>
          <button
            onClick={() => insertTemplate('intuition')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold transition-all whitespace-nowrap cursor-pointer border border-slate-700"
          >
            + Core Intuition
          </button>
          <button
            onClick={() => insertTemplate('edgecases')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-all whitespace-nowrap cursor-pointer border border-slate-700"
          >
            + Edge Cases
          </button>
          <button
            onClick={() => insertTemplate('complexity')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold transition-all whitespace-nowrap cursor-pointer border border-slate-700"
          >
            + Complexity Analysis
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 my-3 flex flex-col min-h-[260px] overflow-hidden">
          {activeTab === 'edit' ? (
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your custom notes, intuition, edge cases, formulas, or tricky pitfalls here... (Saved automatically as .txt)"
              className="w-full flex-1 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-100 text-xs sm:text-sm font-mono leading-relaxed placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar"
            />
          ) : (
            <div className="w-full flex-1 p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs sm:text-sm font-sans leading-relaxed overflow-y-auto custom-scrollbar">
              {noteContent.trim() ? (
                <div className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {noteContent}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-600" />
                  <p>No notes written yet. Switch to "Edit" to write your notes.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 flex-shrink-0 text-xs">
          
          {/* Metrics & Sync Status */}
          <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
            <span>{wordCount} words &bull; {charCount} chars</span>
            {saveStatus === 'synced' && (
              <span className="text-emerald-400 font-bold flex items-center space-x-1 animate-fadeIn">
                <Check className="w-3.5 h-3.5" />
                <span>Saved & Synced to Cloud Storage</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-indigo-400 font-bold flex items-center space-x-1 animate-fadeIn">
                <Check className="w-3.5 h-3.5" />
                <span>Saved Locally</span>
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-all"
              title="Copy notes to clipboard"
            >
              {hasCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Download .txt Button */}
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold border border-slate-700 transition-all cursor-pointer"
              title="Download notes as .txt file"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download .txt</span>
            </button>

            {/* Save & Sync Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save & Sync'}</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

function useMemoWords(text: string): number {
  return useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [text]);
}
