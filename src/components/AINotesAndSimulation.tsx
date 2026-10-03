import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Maximize2, 
  X,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { Video, QuizQuestion } from '../lib/types';
import { AIProcessingStatusCard } from './AIProcessingStatusCard';
import { AlgomasterNotesRenderer } from './AlgomasterNotesRenderer';
import { QuizModule } from './QuizModule';

interface AINotesAndSimulationProps {
  video: Video;
  videoArtifacts?: {
    notes?: string;
    simulation_steps?: any[];
    progress_percent?: number;
    current_part?: number;
    total_parts?: number;
    stage?: string;
    estimated_seconds_left?: number;
    mcqs?: any[];
  } | null;
  questions?: QuizQuestion[];
  isLoading?: boolean;
  onOpenAskAI?: (mode?: 'video' | 'notes' | 'quiz' | 'code') => void;
  onQuizSubmitted?: (timeTakenSeconds: number, isCorrect: boolean) => void;
  onAttemptMoreQuestions?: () => void;
  isGeneratingMoreQuiz?: boolean;
}

export const AINotesAndSimulation: React.FC<AINotesAndSimulationProps> = ({ 
  video, 
  videoArtifacts, 
  questions = [],
  isLoading, 
  onOpenAskAI,
  onQuizSubmitted,
  onAttemptMoreQuestions,
  isGeneratingMoreQuiz
}) => {
  const cleanTitle = (video.title || 'Lecture').replace(/\.(mp4|mkv|webm|avi|mov)$/i, '').replace(/_/g, ' ').trim();
  // Default to 'quiz' (MCQ Quiz) in all cases so it's always immediately front-and-center
  const [activeTab, setActiveTab] = useState<'quiz' | 'notes' | 'simulation'>('quiz');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlayingSim, setIsPlayingSim] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreenNotes, setIsFullscreenNotes] = useState(false);
  const [isFullscreenSim, setIsFullscreenSim] = useState(false);
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number | null>(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const downloadNotesAsPDF = () => {
    const notesContent = videoArtifacts?.notes || '';
    if (!notesContent) return;
    setIsDownloadingPDF(true);

    // Create a hidden iframe for PDF printing with SDETube watermark
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      setIsDownloadingPDF(false);
      return;
    }

    const watermarkDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="120" viewBox="0 0 360 120">
        <text x="180" y="65" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900"
          fill="#4f46e5" opacity="0.10" text-anchor="middle" dominant-baseline="middle"
          transform="rotate(-20, 180, 60)">SDETube</text>
      </svg>`
    );

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${cleanTitle} — SDE Notes | SDETube</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', Arial, sans-serif;
      background: #fff;
      color: #1e293b;
      padding: 40px 50px;
      line-height: 1.7;
      font-size: 13px;
      position: relative;
    }
    /* Watermark */
    body::before {
      content: '';
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: url('${watermarkDataUrl}');
      background-repeat: repeat;
      background-size: 360px 120px;
      opacity: 1;
      pointer-events: none;
      z-index: 0;
    }
    .content { position: relative; z-index: 1; }
    /* Header */
    .pdf-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      margin-bottom: 24px;
      border-bottom: 3px solid #6366f1;
    }
    .pdf-brand { font-size: 22px; font-weight: 900; color: #6366f1; letter-spacing: -0.5px; }
    .pdf-brand span { color: #8b5cf6; }
    .pdf-meta { font-size: 10px; color: #64748b; text-align: right; }
    /* Footer */
    .pdf-footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #94a3b8;
    }
    /* Typography */
    h1 { font-size: 22px; font-weight: 900; color: #1e293b; margin: 24px 0 12px; }
    h2 { font-size: 16px; font-weight: 800; color: #4f46e5; margin: 20px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #e0e7ff; }
    h3 { font-size: 13px; font-weight: 700; color: #0369a1; margin: 14px 0 6px; }
    p { margin: 8px 0; color: #334155; }
    ul, ol { margin: 8px 0 8px 20px; }
    li { margin: 4px 0; color: #334155; }
    code { font-family: 'JetBrains Mono', monospace; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 1px 5px; border-radius: 4px; font-size: 11px; color: #4338ca; }
    pre { background: #1e293b; color: #e2e8f0; border-radius: 8px; padding: 16px; margin: 12px 0; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 11px; line-height: 1.6; }
    pre code { background: none; border: none; padding: 0; color: inherit; font-size: inherit; }
    blockquote { background: #eff6ff; border-left: 4px solid #6366f1; padding: 10px 16px; margin: 12px 0; border-radius: 0 8px 8px 0; color: #1e40af; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11px; }
    th { background: #eff6ff; color: #4338ca; font-weight: 700; padding: 8px 12px; text-align: left; border: 1px solid #bfdbfe; }
    td { padding: 7px 12px; border: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) td { background: #f8fafc; }
    strong { font-weight: 700; color: #1e293b; }
    em { font-style: italic; color: #4f46e5; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
    @media print {
      body { padding: 20px 30px; }
      pre { page-break-inside: avoid; }
      h2 { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="content">
    <div class="pdf-header">
      <div class="pdf-brand">SDE<span>Tube</span></div>
      <div class="pdf-meta">
        <div style="font-weight:700;font-size:12px;color:#1e293b;">${cleanTitle}</div>
        <div>SDE Mastery Notes &bull; FAANG Interview Prep</div>
        <div>Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
      </div>
    </div>
    <div id="notes-content">${convertMarkdownToHTML(notesContent)}</div>
    <div class="pdf-footer">
      <div>🎓 SDETube — FAANG SDE Interview Preparation Platform</div>
      <div>AI-Generated from Lecture Transcript • sdetube.pages.dev</div>
    </div>
  </div>
  <script>window.onload = function() { window.print(); window.close(); };</script>
</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => setIsDownloadingPDF(false), 2000);
  };

  const convertMarkdownToHTML = (md: string): string => {
    if (!md) return '';
    let html = md
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^> \[!NOTE\]\s*$/gm, '')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^---+$/gm, '<hr>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/```([\w]*)(\n[\s\S]*?\n)```/gm, (_: string, lang: string, code: string) => `<pre><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`)
      .replace(/\|(.+)\|/g, (row) => {
        const cells = row.split('|').filter((_, i, a) => i > 0 && i < a.length - 1);
        if (cells.every(c => /^:?-+:?$/.test(c.trim()))) return '';
        const tag = cells.length > 0 && row.includes('**') ? 'th' : 'td';
        return `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
      })
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      .replace(/(<tr>.*<\/tr>\n?)+/g, '<table>$&</table>')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/^(?!<[hua]|<li|<block|<hr|<pre|<table|<tr)(.+)$/gm, '<p>$1</p>');
    return html;
  };

  const isLldTopic = cleanTitle.toLowerCase().includes('design') || cleanTitle.toLowerCase().includes('srp') || cleanTitle.toLowerCase().includes('solid') || cleanTitle.toLowerCase().includes('pattern') || cleanTitle.toLowerCase().includes('principle') || cleanTitle.toLowerCase().includes('open closed');
  const isPrimeTopic = cleanTitle.toLowerCase().includes('prime') || cleanTitle.toLowerCase().includes('sieve') || cleanTitle.toLowerCase().includes('math');

  // Dynamic simulation steps tailored to exact lecture domain
  const rawSimSteps = videoArtifacts?.simulation_steps;
  const simSteps = (rawSimSteps && rawSimSteps.length > 0) ? rawSimSteps : (isLldTopic ? [
    {
      step_number: 1,
      title: 'Step 1: Monolithic Anti-Pattern Class Inspection',
      desc: `Analyzing naive monolithic class structure for ${cleanTitle}. Notice how a single class combines Calculation logic, SQL database persistence, and Email formatting, creating 3 separate reasons to change.`,
      array: ['InvoiceCore', 'SQL_DB_Save', 'EmailService', 'PDFPrinter'],
      activeIndices: [0, 1, 2, 3],
      status: 'SRP Violation (High Coupling)',
      variables: { "Coupling": "High (4 Responsibilities)", "Reasons to Change": "4", "Refactor Needed": "Yes" },
      code_line: 'class Invoice { void calculateTotal(); void saveToDB(); void sendEmail(); void printPDF(); };'
    },
    {
      step_number: 2,
      title: 'Step 2: Isolating Database Persistence Layer',
      desc: `Extracting InvoiceRepository / InvoiceDao to handle database storage. Changes to database schema or SQL dialect no longer touch calculation logic.`,
      array: ['InvoiceCore', 'InvoiceRepository', 'EmailService', 'PDFPrinter'],
      activeIndices: [1],
      status: 'Database Layer Decoupled',
      variables: { "Coupling": "Reduced", "DB Responsibility": "Extracted to DAO", "Core Impact": "Zero" },
      code_line: 'class InvoiceRepository { void save(const Invoice& invoice); };'
    },
    {
      step_number: 3,
      title: 'Step 3: Extracting Notification & Output Services',
      desc: `Extracting InvoiceNotificationService for email/SMS and InvoicePrinter for PDF/HTML formatting. Each class now has a SINGLE, well-defined responsibility.`,
      array: ['InvoiceCore', 'InvoiceRepository', 'InvoiceNotification', 'InvoicePrinter'],
      activeIndices: [2, 3],
      status: 'Notification & Printing Decoupled',
      variables: { "Coupling": "Low", "Output Handlers": "Decoupled", "Cohesion": "High" },
      code_line: 'class InvoiceNotificationService { void notifyCustomer(const Invoice& invoice); };'
    },
    {
      step_number: 4,
      title: 'Step 4: Final Production-Ready SRP Architecture',
      desc: `Architecture refactoring complete. Every component is unit-testable in isolation, adheres to the Single Responsibility Principle, and has exactly ONE reason to change.`,
      array: ['InvoiceModel', 'InvoiceDao', 'InvoiceMailer', 'InvoiceFormatter'],
      activeIndices: [0, 1, 2, 3],
      status: 'Optimal SRP Architecture Verified',
      variables: { "Coupling": "Minimal", "Testability": "100%", "SRP Compliance": "Guaranteed" },
      code_line: '// All 4 decoupled classes compiled and verified with zero side-effects.'
    }
  ] : isPrimeTopic ? [
    {
      step_number: 1,
      title: 'Step 1: Initialize Sieve State Table',
      desc: `Setting up prime state array for ${cleanTitle}. Mark 0 and 1 as non-prime (false), and assume all numbers from 2 to N are prime (true).`,
      array: ['0:F', '1:F', '2:T', '3:T', '4:T', '5:T', '6:T', '7:T', '8:T', '9:T', '10:T', '11:T'],
      activeIndices: [0, 1],
      status: 'State Table Initialized',
      variables: { "Current Prime (p)": "None", "Limit (N)": "11", "Time Complexity": "O(N log log N)" },
      code_line: 'vector<bool> isPrime(N + 1, true); isPrime[0] = isPrime[1] = false;'
    },
    {
      step_number: 2,
      title: 'Step 2: Cross out Multiples of 2',
      desc: 'Prime p = 2 found. Marking all composites 4, 6, 8, 10 as non-prime (false).',
      array: ['0:F', '1:F', '2:T', '3:T', '4:F', '5:T', '6:F', '7:T', '8:F', '9:T', '10:F', '11:T'],
      activeIndices: [4, 6, 8, 10],
      status: 'Multiples of 2 Filtered',
      variables: { "Current Prime (p)": "2", "Multiples Crossed": "4, 6, 8, 10", "Next Candidate": "3" },
      code_line: 'for (int i = 2 * 2; i <= N; i += 2) isPrime[i] = false;'
    },
    {
      step_number: 3,
      title: 'Step 3: Cross out Multiples of 3',
      desc: 'Prime p = 3 found. Crossing out composites starting from 3*3 = 9.',
      array: ['0:F', '1:F', '2:T', '3:T', '4:F', '5:T', '6:F', '7:T', '8:F', '9:F', '10:F', '11:T'],
      activeIndices: [9],
      status: 'Multiples of 3 Filtered',
      variables: { "Current Prime (p)": "3", "Multiples Crossed": "9", "Next Candidate": "5" },
      code_line: 'for (int i = 3 * 3; i <= N; i += 3) isPrime[i] = false;'
    },
    {
      step_number: 4,
      title: 'Step 4: Final Sieve Table Complete',
      desc: 'Remaining numbers [2, 3, 5, 7, 11] are guaranteed primes in O(N log log N) time.',
      array: ['2:T', '3:T', '5:T', '7:T', '11:T'],
      activeIndices: [0, 1, 2, 3, 4],
      status: 'Primes Identified: [2, 3, 5, 7, 11]',
      variables: { "Total Primes": "5", "Space Complexity": "O(N)", "Query Time": "O(1)" },
      code_line: '// Sieve execution complete. Query range [L, R] in O(1) via prefix sum array.'
    }
  ] : [
    {
      step_number: 1,
      title: 'Step 1: Input Data Inspection',
      desc: `Visualizing input execution buffer for ${cleanTitle}. Initializing boundary pointers and auxiliary registers.`,
      array: ['12', '45', '7', '89', '23', '56'],
      activeIndices: [0, 1],
      status: 'Analyzing Pointers',
      variables: { "Left Index": "0", "Right Index": "5", "Active Value": "12" },
      code_line: 'int left = 0, right = n - 1;'
    },
    {
      step_number: 2,
      title: 'Step 2: Processing & Invariant Maintenance',
      desc: 'Comparing values and updating optimal intermediate state in-place.',
      array: ['7', '12', '23', '45', '56', '89'],
      activeIndices: [2, 3],
      status: 'Partitioning & Sorting Elements',
      variables: { "Swaps": "3", "Comparisons": "5", "Current Target": "45" },
      code_line: 'if (nums[i] > nums[j]) swap(nums[i], nums[j]);'
    },
    {
      step_number: 3,
      title: 'Step 3: State Convergence & Output Validation',
      desc: 'All invariants verified. Solution is optimal with minimum time and auxiliary space complexity.',
      array: ['7', '12', '23', '45', '56', '89'],
      activeIndices: [0, 1, 2, 3, 4, 5],
      status: 'Algorithm Executed Successfully',
      variables: { "Result": "Verified", "Time Complexity": "O(N log N)", "Space": "O(1)" },
      code_line: 'return result;'
    }
  ]);

  // Simulation timer loop
  useEffect(() => {
    let timer: any = null;
    if (isPlayingSim) {
      const intervalMs = Math.round(1600 / playbackSpeed);
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= simSteps.length - 1) {
            setIsPlayingSim(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingSim, simSteps.length, playbackSpeed]);

  if (isLoading && (!questions || questions.length === 0)) {
    return (
      <AIProcessingStatusCard 
        videoTitle={cleanTitle} 
        durationSeconds={video.duration_seconds || 900} 
        progressPercent={videoArtifacts?.progress_percent}
        currentPart={videoArtifacts?.current_part}
        totalParts={videoArtifacts?.total_parts}
        stage={videoArtifacts?.stage}
        estimatedSecondsLeft={videoArtifacts?.estimated_seconds_left}
      />
    );
  }

  const currentSimStep = simSteps[currentStep] || simSteps[0];
  const stepVariables = currentSimStep.variables || {};

  const renderSimulationStage = (isFull: boolean) => (
    <div className="space-y-4 font-sans text-xs">
      {/* Controls & Speed Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 shadow-xl">
        {/* Playback Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlayingSim(!isPlayingSim)}
            className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition-all ${
              isPlayingSim
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isPlayingSim ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlayingSim ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            onClick={() => {
              setCurrentStep(0);
              setIsPlayingSim(false);
              setSelectedBlockIdx(null);
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Step Navigation Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto py-1 max-w-full">
          {simSteps.map((s: any, idx: number) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                setIsPlayingSim(false);
                setSelectedBlockIdx(null);
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                currentStep === idx
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/40 ring-2 ring-indigo-400/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>

        {/* Speed Controls */}
        <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 text-[11px] font-mono">
          <span className="text-slate-500 mr-1 hidden sm:inline">Speed:</span>
          {[0.5, 1, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                playbackSpeed === spd
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className={`p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden space-y-5 ${isFull ? 'min-h-[400px]' : ''}`}>
        
        {/* Step Title & Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
              Simulation Stage {currentStep + 1} of {simSteps.length}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-100 mt-0.5">
              {currentSimStep.title}
            </h3>
          </div>

          <div className="px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{currentSimStep.status || 'Active State'}</span>
          </div>
        </div>

        {/* Step Description */}
        <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800/80">
          {currentSimStep.desc}
        </p>

        {/* Visual Array / Register Blocks */}
        {currentSimStep.array && currentSimStep.array.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              Memory Array & State Buffers
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center py-3 bg-slate-950/90 rounded-2xl border border-slate-800/80 p-3">
              {currentSimStep.array.map((val: string, idx: number) => {
                const isActive = (currentSimStep.activeIndices || []).includes(idx);
                const isSelected = selectedBlockIdx === idx;
                const isFalseFlag = String(val).endsWith(':F');
                const isTrueFlag = String(val).endsWith(':T');

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedBlockIdx(idx)}
                    className={`flex flex-col items-center justify-center min-w-[54px] sm:min-w-[64px] h-14 sm:h-16 px-2 rounded-2xl font-mono transition-all duration-300 cursor-pointer shadow-lg select-none relative group ${
                      isSelected
                        ? 'bg-purple-600 text-white ring-4 ring-purple-400/50 scale-105'
                        : isActive
                        ? isFalseFlag
                          ? 'bg-rose-950/80 border-2 border-rose-500 text-rose-200 shadow-rose-500/20 scale-105'
                          : isTrueFlag
                          ? 'bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 shadow-emerald-500/20 scale-105'
                          : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-indigo-500/40 ring-2 ring-indigo-400/50 scale-105'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-mono absolute top-1 left-1.5 opacity-70">
                      [{idx}]
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold tracking-tight mt-1">
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Variable Tracker Matrix */}
        {Object.keys(stepVariables).length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              Execution Registers & Metrics
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(stepVariables).map(([k, v]: [string, any], idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono">
                  <div className="text-[10px] text-slate-400 truncate">{k}</div>
                  <div className="text-xs font-black text-indigo-300 truncate mt-0.5">{String(v)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Snippet Highlight */}
        {currentSimStep.code_line && (
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              Executing Code Segment
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-indigo-900/50 font-mono text-[11px] text-emerald-300 overflow-x-auto">
              <code>{currentSimStep.code_line}</code>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-slate-800/90 shadow-2xl space-y-4 font-sans">
      
      {/* Top Header: Tab Switcher (MCQ Quiz, SDE Study Notes, Visual Simulator) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          
          {/* Tab 1: MCQ Quiz (Primary Default) */}
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-emerald-300" />
            <span>MCQ Quiz ({questions.length})</span>
          </button>

          {/* Tab 2: SDE Study Notes */}
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-300" />
            <span>SDE Notes</span>
          </button>

          {/* Tab 3: Visual Simulator */}
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'simulation'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-300" />
            <span>Visual Simulator</span>
          </button>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center space-x-2">
          {onOpenAskAI && (
            <button
              onClick={() => onOpenAskAI(activeTab === 'quiz' ? 'quiz' : activeTab === 'notes' ? 'notes' : 'video')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md border border-purple-400/30 cursor-pointer"
              title="Ask AI Teaching Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          )}

          {activeTab === 'notes' && (
            <>
              <button
                onClick={downloadNotesAsPDF}
                disabled={isDownloadingPDF || !videoArtifacts?.notes}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                title="Download Notes as PDF with SDETube watermark"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="hidden sm:inline">{isDownloadingPDF ? 'Opening...' : 'PDF'}</span>
              </button>
              <button
                onClick={() => setIsFullscreenNotes(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-bold transition-all shadow-md cursor-pointer"
                title="Read Notes in Fullscreen Focus Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fullscreen</span>
              </button>
            </>
          )}

          {activeTab === 'simulation' && (
            <button
              onClick={() => setIsFullscreenSim(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold transition-all shadow-md cursor-pointer"
              title="Open Simulator in Fullscreen Focus Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: MCQ QUIZ (DEFAULT PRIMARY VIEW) */}
      {activeTab === 'quiz' && (
        <QuizModule
          questions={questions}
          onQuizSubmitted={onQuizSubmitted}
          onAttemptMoreQuestions={onAttemptMoreQuestions}
          isGeneratingMore={isGeneratingMoreQuiz}
          videoTitle={cleanTitle}
          durationSeconds={video.duration_seconds || 900}
          progressPercent={videoArtifacts?.progress_percent}
          currentPart={videoArtifacts?.current_part}
          totalParts={videoArtifacts?.total_parts}
          stage={videoArtifacts?.stage}
          estimatedSecondsLeft={videoArtifacts?.estimated_seconds_left}
        />
      )}

      {/* TAB 2: ALGOMASTER SDE NOTES */}
      {activeTab === 'notes' && (
        <AlgomasterNotesRenderer
          content={videoArtifacts?.notes || `# 📘 ${cleanTitle} — SDE Study Notes\n\nStudy notes based on lecture transcript.`}
          title={cleanTitle}
          isFullscreen={false}
        />
      )}

      {/* TAB 3: INTERACTIVE MULTI-STATE VISUAL SIMULATOR */}
      {activeTab === 'simulation' && renderSimulationStage(false)}

      {/* FULLSCREEN AI NOTES MODAL */}
      {isFullscreenNotes && (
        <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl p-3 sm:p-8 overflow-y-auto space-y-6">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-4 px-2 sm:px-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-300 shadow-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-100">{cleanTitle} — SDE Mastery Guide</h2>
                <p className="text-xs text-slate-400">Algomaster SDE Grade • SDETube Cloud AI</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={downloadNotesAsPDF}
                disabled={isDownloadingPDF || !videoArtifacts?.notes}
                className="p-2.5 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 transition-all flex items-center gap-2 text-xs font-bold shadow-lg cursor-pointer disabled:opacity-50"
                title="Download Notes as PDF with SDETube Watermark"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="hidden sm:inline">{isDownloadingPDF ? 'Generating...' : 'Download PDF'}</span>
              </button>

              {onOpenAskAI && (
                <button
                  onClick={() => onOpenAskAI('notes')}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/40 transition-all flex items-center gap-2 text-xs font-bold shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Ask AI on Notes</span>
                </button>
              )}

              <button
                onClick={() => setIsFullscreenNotes(false)}
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all flex items-center gap-2 text-xs font-bold shadow-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
                <span className="hidden sm:inline">Close Focus Mode</span>
              </button>
            </div>
          </div>

          <AlgomasterNotesRenderer
            content={videoArtifacts?.notes || `# 📘 ${cleanTitle} — SDE Study Notes\n\nStudy notes based on lecture transcript.`}
            title={cleanTitle}
            isFullscreen={true}
          />
        </div>
      )}

      {/* FULLSCREEN VISUAL SIMULATOR MODAL */}
      {isFullscreenSim && (
        <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl p-3 sm:p-8 overflow-y-auto space-y-6">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-4 px-2 sm:px-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 shadow-lg">
                <Cpu className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-100">{cleanTitle} — Visual Simulator</h2>
                <p className="text-xs text-slate-400">Interactive Multi-State Execution Engine</p>
              </div>
            </div>

            <button
              onClick={() => setIsFullscreenSim(false)}
              className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all flex items-center gap-2 text-xs font-bold shadow-lg"
            >
              <X className="w-5 h-5 text-slate-400" />
              <span className="hidden sm:inline">Close Fullscreen</span>
            </button>
          </div>

          <div className="w-full px-1 sm:px-6">
            {renderSimulationStage(true)}
          </div>
        </div>
      )}

    </div>
  );
};
