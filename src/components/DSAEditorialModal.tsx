import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  X, 
  Sparkles, 
  Layers, 
  Code,
  Building2,
  ExternalLink,
  Eye,
  AlignLeft,
  Loader2
} from 'lucide-react';
import { DSAProblem } from '../lib/dsaSheetsData';
import { fetchProblemEditorial, downloadEditorialAsTxt, getCleanSlug } from '../lib/editorialService';
import { FormattedChatText } from './FormattedChatText';

interface DSAEditorialModalProps {
  problem: DSAProblem;
  onClose: () => void;
  onOpenCodingFullscreen?: (problem: DSAProblem) => void;
}

export const DSAEditorialModal: React.FC<DSAEditorialModalProps> = ({
  problem,
  onClose,
  onOpenCodingFullscreen
}) => {
  const [editorialText, setEditorialText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'rich' | 'raw'>('rich');

  const slug = getCleanSlug(problem);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchProblemEditorial(problem).then((content) => {
      if (isMounted) {
        setEditorialText(content);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [problem]);

  const handleDownload = () => {
    downloadEditorialAsTxt(slug, problem.name, editorialText);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorialText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/20 shadow-2xl p-5 sm:p-7 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-[10px] font-black uppercase tracking-wider font-mono">
                  GitHub & SDE Editorial (.txt / Markdown)
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
                <span className="text-[11px] text-slate-400 font-mono">
                  {problem.rating}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 truncate">
                {problem.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-400">
                <span className="text-indigo-300 font-mono">{problem.category}</span>
                {problem.subcategory && <span>&bull; {problem.subcategory}</span>}
                {problem.companies && problem.companies.length > 0 && (
                  <>
                    <span>&bull;</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {problem.companies.slice(0, 4).join(', ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('rich')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                  viewMode === 'rich'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Rich</span>
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                  viewMode === 'raw'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Raw .txt</span>
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

        {/* Content Body */}
        <div className="flex-1 my-4 flex flex-col min-h-[300px] overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-16 text-slate-400">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs font-mono">Fetching editorial analysis from GitHub & local storage...</p>
            </div>
          ) : viewMode === 'rich' ? (
            <div className="flex-1 p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs sm:text-sm font-sans leading-relaxed overflow-y-auto custom-scrollbar space-y-4">
              <FormattedChatText text={editorialText} />
            </div>
          ) : (
            <textarea
              readOnly
              value={editorialText}
              className="w-full flex-1 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-100 text-xs sm:text-sm font-mono leading-relaxed focus:outline-none resize-none custom-scrollbar"
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 flex-shrink-0 text-xs">
          
          <div className="flex items-center space-x-2 text-slate-500 font-mono text-[11px]">
            <span>Cached locally as <code className="text-slate-400">{slug}-editorial.txt</code></span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-all"
              title="Copy editorial to clipboard"
            >
              {hasCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Download .txt Button */}
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold border border-slate-700 transition-all cursor-pointer"
              title="Download editorial as .txt file"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download .txt</span>
            </button>

            {/* Code Arena Button */}
            {onOpenCodingFullscreen && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCodingFullscreen(problem);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Practice in Code Arena</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
