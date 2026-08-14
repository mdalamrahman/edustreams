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
}

export const AINotesAndSimulation: React.FC<AINotesAndSimulationProps> = ({ video, videoArtifacts, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'simulation'>('notes');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlayingSim, setIsPlayingSim] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreenNotes, setIsFullscreenNotes] = useState(false);
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number | null>(null);

  const cleanTitle = (video.title || 'Lecture').replace(/\.(mp4|mkv|webm)$/i, '');

  const isLldTopic = cleanTitle.toLowerCase().includes('design') || cleanTitle.toLowerCase().includes('srp') || cleanTitle.toLowerCase().includes('solid') || cleanTitle.toLowerCase().includes('pattern') || cleanTitle.toLowerCase().includes('principle');
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
      desc: '3 is prime! Starting at 3² = 9, marking 9 and 15 as composite (6 and 12 were already eliminated by 2).',
      array: ['2:T', '3:T', '4:F', '5:T', '6:F', '7:T', '8:F', '9:F', '10:F', '11:T', '12:F', '13:T', '14:F', '15:F', '16:F'],
      activeIndices: [7, 13],
      status: 'Multiples of 3 Marked Composite',
      variables: { "P": "3", "Loop Limit": "sqrt(16) = 4", "Sieve Loop Done": "True" },
      code_line: 'j = 9, 15 -> isPrime[j] = false;'
    },
    {
      step_number: 4,
      title: 'Step 4: Final Prime Set Extracted',
      desc: 'All remaining elements marked true are guaranteed prime: [2, 3, 5, 7, 11, 13]. Overall time complexity: O(N log log N).',
      array: ['2:PRIME', '3:PRIME', '—', '5:PRIME', '—', '7:PRIME', '—', '—', '—', '11:PRIME', '—', '13:PRIME', '—', '—', '—'],
      activeIndices: [0, 1, 3, 5, 9, 11],
      status: 'Sieve Finished (Optimal Primes Extracted)',
      variables: { "Total Primes": "6", "Complexity": "O(N log log N)", "Aux Space": "O(N)" },
      code_line: '// Remaining true indices collected into primes vector.'
    }
  ] : [
    {
      step_number: 1,
      title: 'Step 1: Input Setup & Invariant Boundaries',
      desc: `Setting up runtime invariants, boundary validations, and memory state for ${cleanTitle}.`,
      array: ['Init', 'Setup', 'Boundary', 'State'],
      activeIndices: [0, 1],
      status: 'Memory Allocated & Initialized',
      variables: { "State": "Initialized", "Pointers": "L=0, R=N-1", "Status": "Valid" },
      code_line: '// Initializing variables and boundary condition checks.'
    },
    {
      step_number: 2,
      title: 'Step 2: Processing & Invariant Transitions',
      desc: `Iterating through elements while maintaining optimal subproblem properties for ${cleanTitle}.`,
      array: ['Init', 'Processing', 'Active', 'State'],
      activeIndices: [1, 2],
      status: 'Optimal State Transition',
      variables: { "Current Element": "Active", "Invariant": "Preserved", "Step": "2/4" },
      code_line: 'while (condition) { computeOptimalState(); }'
    },
    {
      step_number: 3,
      title: 'Step 3: Verification & Memory Safety Checks',
      desc: 'Validating that no out-of-bounds access occurred and all resource invariants hold true.',
      array: ['Init', 'Processed', 'Verified', 'Safe'],
      activeIndices: [2, 3],
      status: 'Invariants Validated',
      variables: { "Safety": "Verified", "Auxiliary Space": "O(1)", "Memory Leaks": "0" },
      code_line: 'assert(invariantSatisfied == true);'
    },
    {
      step_number: 4,
      title: 'Step 4: Optimal Solution Finalized',
      desc: `Algorithm completed. Returning optimal result for ${cleanTitle} with minimal time/space overhead.`,
      array: ['Optimal', 'Optimal', 'Verified', 'Optimal'],
      activeIndices: [0, 1, 2, 3],
      status: 'Execution Complete (Optimal)',
      variables: { "Execution Time": "Minimal", "Result": "Optimal", "Status": "Success" },
      code_line: 'return optimalSolution;'
    }
  ]);

  useEffect(() => {
    setCurrentStep(0);
    setIsPlayingSim(false);
    setSelectedBlockIdx(null);
  }, [video.id, cleanTitle]);

  // Auto-play simulation timer with playback speed
  useEffect(() => {
    let timer: any;
    if (isPlayingSim) {
      const intervalMs = Math.round(2500 / playbackSpeed);
      timer = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % simSteps.length);
      }, intervalMs);
    }
    return () => clearInterval(timer);
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

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
      
      {/* Header Tabs & Fullscreen Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex space-x-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all ${
              activeTab === 'notes'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>SDE Study Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all ${
              activeTab === 'simulation'
                ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-sky-300 animate-pulse" />
            <span>Interactive Visual Simulation</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'notes' && (
            <button
              onClick={() => setIsFullscreenNotes(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-bold transition-all shadow-md"
              title="Read Notes in Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fullscreen Focus</span>
            </button>
          )}

          <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-xl border border-indigo-700/60 shadow-inner">
            EduStream AI Engine
          </span>
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
      {activeTab === 'simulation' && (
        <div className="space-y-4 font-sans text-xs">
          
          {/* Controls & Speed Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 shadow-xl">
            
            {/* Playback Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlayingSim(!isPlayingSim)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition-all ${
                  isPlayingSim
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
                }`}
              >
                {isPlayingSim ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlayingSim ? 'Pause Simulation' : 'Auto Play'}</span>
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
            <div className="flex items-center space-x-1 overflow-x-auto py-1">
              {simSteps.map((s: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentStep(idx);
                    setIsPlayingSim(false);
                    setSelectedBlockIdx(null);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
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
          <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 border border-indigo-900/40 space-y-6 shadow-2xl relative overflow-hidden">
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

              <div className="flex flex-wrap justify-center items-center gap-3 py-4 bg-slate-950/90 rounded-2xl p-4 border border-slate-800/80">
                {currentSimStep.array.map((val: any, idx: number) => {
                  const isActive = currentSimStep.activeIndices?.includes(idx);
                  const isSelected = selectedBlockIdx === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedBlockIdx(isSelected ? null : idx)}
                      className={`min-w-[70px] h-20 px-3.5 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-xs transition-all duration-300 shadow-lg relative ${
                        isActive
                          ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white scale-105 border-2 border-indigo-300 shadow-indigo-500/40 ring-4 ring-indigo-500/20 animate-pulse'
                          : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800'
                      } ${isSelected ? 'ring-2 ring-amber-400 border-amber-400' : ''}`}
                    >
                      <span className="text-xs font-black truncate max-w-[120px]">{String(val)}</span>
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
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-bold transition-all border border-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
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
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* FULLSCREEN AI NOTES MODAL */}
      {isFullscreenNotes && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl p-4 sm:p-8 overflow-y-auto space-y-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-300 shadow-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-100">{cleanTitle} — SDE Mastery Guide</h2>
                <p className="text-xs text-slate-400">Algomaster.io Grade • EduStream Cloud AI</p>
              </div>
            </div>

            <button
              onClick={() => setIsFullscreenNotes(false)}
              className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all flex items-center gap-2 text-xs font-bold shadow-lg"
            >
              <X className="w-5 h-5 text-slate-400" />
              <span>Close Focus Mode</span>
            </button>
          </div>

          <AlgomasterNotesRenderer
            content={videoArtifacts?.notes || `# 📘 ${cleanTitle} — SDE Study Notes\n\nStudy notes based on lecture transcript.`}
            title={cleanTitle}
            isFullscreen={true}
          />
        </div>
      )}

    </div>
  );
};
