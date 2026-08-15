import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2, 
  Code, 
  Cpu, 
  ShieldAlert, 
  Maximize2, 
  X,
  Zap, 
  HelpCircle,
  Layers,
  Terminal,
  Activity,
  Sliders,
  Check
} from 'lucide-react';
import { Video } from '../lib/types';
import { AIProcessingStatusCard } from './AIProcessingStatusCard';
import { AlgomasterNotesRenderer } from './AlgomasterNotesRenderer';

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
  } | null;
  isLoading?: boolean;
  onOpenAskAI?: (mode?: 'video' | 'notes' | 'quiz' | 'code') => void;
}

export const AINotesAndSimulation: React.FC<AINotesAndSimulationProps> = ({ video, videoArtifacts, isLoading, onOpenAskAI }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'simulation'>('notes');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlayingSim, setIsPlayingSim] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreenNotes, setIsFullscreenNotes] = useState(false);
  const [isFullscreenSim, setIsFullscreenSim] = useState(false);
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number | null>(null);

  const cleanTitle = (video.title || 'Lecture').replace(/\.(mp4|mkv|webm)$/i, '');

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
      title: 'Step 1: Sieve Boolean Array Initialization',
      desc: 'Creating boolean array is_prime of size N+1 initialized to true. Marking indices 0 and 1 as non-prime.',
      array: ['2:T', '3:T', '4:T', '5:T', '6:T', '7:T', '8:T', '9:T', '10:T', '11:T', '12:T', '13:T', '14:T', '15:T', '16:T'],
      activeIndices: [0, 1],
      status: 'Array Initialized (All True)',
      variables: { "P": "2", "N": "16", "Active Sieve Phase": "Init" },
      code_line: 'vector<bool> isPrime(N + 1, true); isPrime[0] = isPrime[1] = false;'
    },
    {
      step_number: 2,
      title: 'Step 2: Eliminating Multiples of Prime P = 2',
      desc: '2 is prime! Starting at 2² = 4, eliminating all multiples of 2 (4, 6, 8, 10, 12, 14, 16) by marking them false.',
      array: ['2:T', '3:T', '4:F', '5:T', '6:F', '7:T', '8:F', '9:T', '10:F', '11:T', '12:F', '13:T', '14:F', '15:T', '16:F'],
      activeIndices: [2, 4, 6, 8, 10, 12, 14],
      status: 'Multiples of 2 Marked Composite',
      variables: { "P": "2", "Multiples Marked": "7", "Next Prime": "3" },
      code_line: 'for (int j = p * p; j <= N; j += p) isPrime[j] = false;'
    },
    {
      step_number: 3,
      title: 'Step 3: Eliminating Multiples of Prime P = 3',
      desc: '3 is prime! Starting at 3² = 9, marking 9 and 15 composite. Multiples 6 and 12 were already eliminated by 2.',
      array: ['2:T', '3:T', '4:F', '5:T', '6:F', '7:T', '8:F', '9:F', '10:F', '11:T', '12:F', '13:T', '14:F', '15:F', '16:F'],
      activeIndices: [7, 13],
      status: 'Multiples of 3 Marked Composite',
      variables: { "P": "3", "P² Start": "9", "Multiples Marked": "2" },
      code_line: 'for (int j = 3 * 3; j <= 16; j += 2 * 3) isPrime[j] = false;'
    },
    {
      step_number: 4,
      title: 'Step 4: Sieve Termination at √N = 4',
      desc: 'Since next prime P = 5 > √16 (4), the Sieve terminates. Remaining true values [2, 3, 5, 7, 11, 13] are all the prime numbers up to N!',
      array: ['2:T', '3:T', '4:F', '5:T', '6:F', '7:T', '8:F', '9:F', '10:F', '11:T', '12:F', '13:T', '14:F', '15:F', '16:F'],
      activeIndices: [0, 1, 3, 5, 9, 11],
      status: 'Sieve Complete in O(N log log N)',
      variables: { "Primes Found": "2, 3, 5, 7, 11, 13", "Time Complexity": "O(N log log N)" },
      code_line: '// Sieve executed in O(N log log N) with bitset space optimization.'
    }
  ] : [
    {
      step_number: 1,
      title: 'Step 1: Problem Invariants & Initial Pointers',
      desc: `Setting up initial search pointers, sliding window boundaries, or recursion base cases for ${cleanTitle}.`,
      array: ['Low:0', 'Mid:3', 'High:6', 'Target:X', 'Ans:None'],
      activeIndices: [0, 2],
      status: 'Initialization Phase',
      variables: { "Left": "0", "Right": "6", "Mid": "3", "Status": "Searching" },
      code_line: 'int left = 0, right = n - 1;'
    },
    {
      step_number: 2,
      title: 'Step 2: Core Algorithm Decision Transition',
      desc: 'Evaluating middle element against invariant constraints to discard half the search space in logarithmic time.',
      array: ['Low:0', 'Mid:3', 'High:6', 'Condition:Met', 'Ans:Candidate'],
      activeIndices: [1, 3],
      status: 'Constraint Evaluated',
      variables: { "MidVal": "Arr[mid]", "Direction": "Shift Right", "Candidate": "Updated" },
      code_line: 'if (isValid(mid)) { ans = mid; left = mid + 1; }'
    },
    {
      step_number: 3,
      title: 'Step 3: Convergence & Optimal State',
      desc: 'Pointers meet at the optimal solution boundary. Monotonic invariant guarantees globally optimal result.',
      array: ['Low:4', 'High:4', 'Optimal:Found', 'Time:O(log N)'],
      activeIndices: [0, 1, 2],
      status: 'Optimal Solution Reached',
      variables: { "Result": "Optimal Found", "Operations": "O(log N)", "Space": "O(1)" },
      code_line: 'return ans; // Optimal logarithmic convergence verified.'
    }
  ]);

  // Auto-play timer effect
  useEffect(() => {
    let timer: any = null;
    if (isPlayingSim) {
      const intervalMs = Math.round(2400 / playbackSpeed);
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

  if (isLoading || (!videoArtifacts?.notes && (!videoArtifacts?.simulation_steps || videoArtifacts.simulation_steps.length === 0))) {
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

        {/* Speed Selector */}
        <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 text-xs font-mono">
          <span className="text-slate-500 text-[10px] pr-1">Speed:</span>
          {[0.5, 1, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                playbackSpeed === spd
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Main Visual Simulation Stage Container */}
      <div className={`p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 border border-indigo-900/40 space-y-6 shadow-2xl relative overflow-hidden ${isFull ? 'min-h-[70vh]' : ''}`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Step Header & Live Status Badge */}
        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs">
              {currentStep + 1} / {simSteps.length}
            </div>
            <h4 className="font-extrabold text-slate-100 text-sm sm:text-base tracking-tight">
              {currentSimStep.title}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-600/50 text-xs font-mono font-extrabold text-indigo-200 shadow-md">
              {currentSimStep.status}
            </span>
          </div>
        </div>

        {/* Narrative Explanation */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-slate-300 leading-relaxed text-xs sm:text-sm font-sans shadow-inner">
          {currentSimStep.desc}
        </div>

        {/* Interactive Visual Element Blocks (Memory / Class Components) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>State Invariants & Data Memory Layout (Click any block to inspect):</span>
            </span>
            <span className="text-indigo-300">{currentSimStep.array.length} Elements</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3 py-4 bg-slate-950/90 rounded-2xl p-3 sm:p-4 border border-slate-800/80">
            {currentSimStep.array.map((val: any, idx: number) => {
              const isActive = currentSimStep.activeIndices?.includes(idx);
              const isSelected = selectedBlockIdx === idx;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedBlockIdx(isSelected ? null : idx)}
                  className={`min-w-[64px] sm:min-w-[70px] h-18 sm:h-20 px-3 py-2 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-xs transition-all duration-300 shadow-lg relative ${
                    isActive
                      ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white scale-105 border-2 border-indigo-300 shadow-indigo-500/40 ring-4 ring-indigo-500/20 animate-pulse'
                      : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800'
                  } ${isSelected ? 'ring-2 ring-amber-400 border-amber-400' : ''}`}
                >
                  <span className="text-xs font-black truncate max-w-[110px] sm:max-w-[120px]">{String(val)}</span>
                  <span className="text-[10px] font-normal text-slate-300/80 mt-1">idx {idx}</span>
                  {isActive && (
                    <span className="absolute -top-2 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-[9px] font-bold text-slate-950 shadow-sm">
                      active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live State & Variable Inspector Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Variable Key-Values */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[11px] font-mono font-bold text-indigo-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Live Variable & Invariant Watcher</span>
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {Object.entries(stepVariables).map(([k, v]) => (
                <div key={k} className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">{k}:</span>
                  <span className="text-slate-100 font-bold">{String(v)}</span>
                </div>
              ))}
              {Object.keys(stepVariables).length === 0 && (
                <div className="col-span-2 text-slate-500 text-xs py-1">
                  Step {currentStep + 1} processing active transitions.
                </div>
              )}
            </div>
          </div>

          {/* Code Line Execution Highlight */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Executing Action / Code Invariant</span>
            </span>
            <pre className="p-2.5 rounded-xl bg-slate-900/90 text-emerald-300 font-mono text-xs overflow-x-auto border border-emerald-950/60 leading-relaxed">
              <code>{currentSimStep.code_line || `// Executing step ${currentStep + 1} for ${cleanTitle}`}</code>
            </pre>
          </div>
        </div>

        {/* Previous & Next Stepper Buttons */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-900">
          <button
            disabled={currentStep === 0}
            onClick={() => {
              setCurrentStep(currentStep - 1);
              setIsPlayingSim(false);
              setSelectedBlockIdx(null);
            }}
            className="flex items-center gap-1 px-3.5 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-bold transition-all border border-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono text-slate-500">
            Step {currentStep + 1} of {simSteps.length}
          </span>

          <button
            disabled={currentStep === simSteps.length - 1}
            onClick={() => {
              setCurrentStep(currentStep + 1);
              setIsPlayingSim(false);
              setSelectedBlockIdx(null);
            }}
            className="flex items-center gap-1 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top Header & Navigation Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2 sm:p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'notes'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Algomaster SDE Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'simulation'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Visual Simulator</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenAskAI && (
            <button
              onClick={() => onOpenAskAI(activeTab === 'notes' ? 'notes' : 'video')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md border border-purple-400/30"
              title="Ask AI Teaching Assistant about these notes"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          )}

          {activeTab === 'notes' ? (
            <button
              onClick={() => setIsFullscreenNotes(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-bold transition-all shadow-md"
              title="Read Notes in Fullscreen Focus Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fullscreen Focus</span>
            </button>
          ) : (
            <button
              onClick={() => setIsFullscreenSim(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold transition-all shadow-md"
              title="Open Simulator in Fullscreen Focus Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fullscreen Focus</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: ALGOMASTER SDE NOTES */}
      {activeTab === 'notes' && (
        <AlgomasterNotesRenderer
          content={videoArtifacts?.notes || `# 📘 ${cleanTitle} — SDE Study Notes\n\nStudy notes based on lecture transcript.`}
          title={cleanTitle}
          isFullscreen={false}
        />
      )}

      {/* TAB 2: INTERACTIVE MULTI-STATE VISUAL SIMULATOR */}
      {activeTab === 'simulation' && renderSimulationStage(false)}

      {/* FULLSCREEN AI NOTES MODAL (FULL HORIZONTAL SCREEN) */}
      {isFullscreenNotes && (
        <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl p-3 sm:p-8 overflow-y-auto space-y-6">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-4 px-2 sm:px-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-300 shadow-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-100">{cleanTitle} — SDE Mastery Guide</h2>
                <p className="text-xs text-slate-400">Algomaster SDE Grade • TiliTube Cloud AI</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
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

      {/* FULLSCREEN VISUAL SIMULATOR MODAL (FULL HORIZONTAL & VERTICAL SCREEN) */}
      {isFullscreenSim && (
        <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl p-3 sm:p-8 overflow-y-auto space-y-6">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-4 px-2 sm:px-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 shadow-lg">
                <Sparkles className="w-6 h-6 text-cyan-300" />
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
