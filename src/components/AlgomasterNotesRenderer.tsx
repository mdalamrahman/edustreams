import React, { useState } from 'react';
import { 
  BookOpen, 
  Code, 
  Check, 
  Copy, 
  Sparkles, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Zap, 
  Layers, 
  HelpCircle,
  Clock,
  Award,
  Terminal
} from 'lucide-react';

interface AlgomasterNotesRendererProps {
  content: string;
  title: string;
  isFullscreen?: boolean;
}

export const AlgomasterNotesRenderer: React.FC<AlgomasterNotesRendererProps> = ({
  content,
  title,
  isFullscreen = false
}) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Helper to parse and render Markdown content into rich SDE Algomaster components
  const renderFormattedMarkdown = (markdown: string) => {
    if (!markdown) return null;

    const lines = markdown.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer: string[] = [];
    let codeBlockIndex = 0;
    let inTable = false;
    let tableHeaderBuffer: string[] = [];
    let tableRowsBuffer: string[][] = [];

    const flushTable = (key: string) => {
      if (tableHeaderBuffer.length > 0 || tableRowsBuffer.length > 0) {
        elements.push(
          <div key={key} className="my-5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-indigo-950/60 text-indigo-200 uppercase tracking-wider font-mono border-b border-slate-800">
                <tr>
                  {tableHeaderBuffer.map((th, i) => (
                    <th key={i} className="px-4 py-3 font-extrabold">{renderInlineSpans(th)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {tableRowsBuffer.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/50 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 font-sans leading-relaxed">
                        {renderInlineSpans(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeaderBuffer = [];
        tableRowsBuffer = [];
        inTable = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code Block Start / End
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Flush code block
          const fullCode = codeBuffer.join('\n');
          const idx = codeBlockIndex++;
          elements.push(
            <div key={`code-${idx}`} className="my-5 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-indigo-300 font-bold uppercase">{codeLanguage || 'CODE'}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(fullCode, idx)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all text-[11px] font-sans font-semibold border border-slate-700"
                >
                  {copiedCodeIdx === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono leading-relaxed text-indigo-100 overflow-x-auto bg-slate-950/90 selection:bg-indigo-500/30">
                <code>{fullCode}</code>
              </pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          flushTable(`table-before-code-${i}`);
          inCodeBlock = true;
          codeLanguage = line.trim().replace(/^```/, '').trim() || 'code';
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Tables
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const rawCells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (rawCells.every(c => /^:?-+:?$/.test(c))) {
          // Separator line — ignore
          continue;
        }
        if (!inTable) {
          inTable = true;
          tableHeaderBuffer = rawCells;
        } else {
          tableRowsBuffer.push(rawCells);
        }
        continue;
      } else if (inTable) {
        flushTable(`table-${i}`);
      }

      // Headings
      if (line.startsWith('# ')) {
        const h1Text = line.replace(/^# /, '').trim();
        elements.push(
          <div key={`h1-${i}`} className="pt-2 pb-4 border-b border-indigo-900/40 my-4">
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <span>{h1Text}</span>
            </h1>
          </div>
        );
        continue;
      }

      if (line.startsWith('## ')) {
        const h2Text = line.replace(/^## /, '').trim();
        elements.push(
          <div key={`h2-${i}`} className="mt-8 mb-3 pt-3 border-t border-slate-800/80">
            <h2 className="text-base sm:text-lg font-extrabold text-indigo-300 flex items-center gap-2 font-mono tracking-wide">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>{h2Text}</span>
            </h2>
          </div>
        );
        continue;
      }

      if (line.startsWith('### ')) {
        const h3Text = line.replace(/^### /, '').trim();
        elements.push(
          <h3 key={`h3-${i}`} className="text-sm font-bold text-sky-300 mt-5 mb-2 flex items-center gap-2 font-mono">
            <Code className="w-4 h-4 text-sky-400" />
            <span>{h3Text}</span>
          </h3>
        );
        continue;
      }

      // GitHub Style Alerts / Callouts (> [!NOTE], > [!TIP], > [!WARNING], > text)
      if (line.startsWith('>')) {
        const alertContent = line.replace(/^>\s*/, '').trim();
        const isNote = alertContent.toLowerCase().includes('[!note]') || alertContent.toLowerCase().includes('executive summary');
        const isTip = alertContent.toLowerCase().includes('[!tip]') || alertContent.toLowerCase().includes('pro tip') || alertContent.toLowerCase().includes('intuition');
        const isWarning = alertContent.toLowerCase().includes('[!warning]') || alertContent.toLowerCase().includes('caution') || alertContent.toLowerCase().includes('pitfall');

        const cleanText = alertContent.replace(/\[!(note|tip|warning|important)\]/gi, '').trim();

        elements.push(
          <div
            key={`alert-${i}`}
            className={`my-4 p-4 rounded-2xl border flex items-start gap-3 shadow-lg ${
              isTip
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : isWarning
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-indigo-950/50 border-indigo-500/40 text-indigo-200'
            }`}
          >
            {isTip ? (
              <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : isWarning ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed font-sans font-medium space-y-1">
              {renderInlineSpans(cleanText)}
            </div>
          </div>
        );
        continue;
      }

      // Bullet Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const listText = line.trim().replace(/^[-*]\s+/, '');
        elements.push(
          <div key={`list-${i}`} className="flex items-start gap-2.5 my-1.5 pl-2 text-xs text-slate-300 font-sans leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-2"></span>
            <div>{renderInlineSpans(listText)}</div>
          </div>
        );
        continue;
      }

      // Numbered Lists
      if (/^\d+\.\s+/.test(line.trim())) {
        const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          elements.push(
            <div key={`numlist-${i}`} className="flex items-start gap-2.5 my-1.5 pl-2 text-xs text-slate-300 font-sans leading-relaxed">
              <span className="px-1.5 py-0.5 rounded-md bg-indigo-950 border border-indigo-800 text-[10px] font-mono font-bold text-indigo-300 flex-shrink-0">
                {numMatch[1]}
              </span>
              <div>{renderInlineSpans(numMatch[2])}</div>
            </div>
          );
          continue;
        }
      }

      // Horizontal Rule
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={`hr-${i}`} className="my-6 border-slate-800" />);
        continue;
      }

      // Regular Paragraph
      if (line.trim().length > 0) {
        elements.push(
          <p key={`p-${i}`} className="my-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {renderInlineSpans(line)}
          </p>
        );
      }
    }

    if (inTable) {
      flushTable('table-final');
    }

    return elements;
  };

  // Helper to parse inline bold, italic, code tags and complexity badges
  const renderInlineSpans = (text: string): React.ReactNode => {
    if (!text) return null;

    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        return (
          <strong key={index} className="font-extrabold text-slate-100">
            {inner}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        const inner = part.slice(1, -1);
        const isComplexity = /^O\(.*?\)$/i.test(inner);
        return (
          <code
            key={index}
            className={`px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-[11px] font-bold border ${
              isComplexity
                ? 'bg-amber-950/60 border-amber-600/40 text-amber-300 shadow-sm'
                : 'bg-indigo-950/80 border-indigo-700/50 text-indigo-200'
            }`}
          >
            {inner}
          </code>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={index} className="italic text-indigo-200">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'max-w-5xl mx-auto py-4 px-2 sm:px-6' : ''}`}>
      
      {/* SDE Mastery Top Banner Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/40 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>ALGORITHMIC ARCHITECTURE & SDE PREP</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950 border border-emerald-700/50 text-[11px] font-mono font-bold text-emerald-300">
              FAANG / MAANG Grade
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-purple-950 border border-purple-700/50 text-[11px] font-mono font-bold text-purple-300">
              EduStream AI
            </span>
          </div>
        </div>

        <h2 className="text-lg sm:text-2xl font-black text-slate-100 tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Comprehensive deep-dive synthesizing foundational intuition, architectural invariants, step-by-step trace walkthroughs, and production-ready code.
        </p>

        {/* Quick Meta Pills */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>~8 min read</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>Level: SDE II / Senior</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Transcript-Grounded</span>
          </div>
        </div>
      </div>

      {/* Main Formatted Notes Content Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl font-sans text-slate-200 space-y-2">
        {renderFormattedMarkdown(content)}
      </div>

    </div>
  );
};
