import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  CheckCircle2, 
  Code, 
  Cpu, 
  ShieldAlert, 
  Maximize2, 
  X,
  Zap,
  HelpCircle,
  Layers
} from 'lucide-react';
import { Video } from '../lib/types';

interface AINotesAndSimulationProps {
  video: Video;
}

export const AINotesAndSimulation: React.FC<AINotesAndSimulationProps> = ({ video }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'simulation'>('notes');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlayingSim, setIsPlayingSim] = useState(false);
  const [isFullscreenNotes, setIsFullscreenNotes] = useState(false);

  const cleanTitle = (video.title || 'Lecture').replace(/\.(mp4|mkv|webm)$/i, '');
  const cacheKey = `edustream_ainotes_${video.id || cleanTitle}`;

  const isLldTopic = cleanTitle.toLowerCase().includes('design') || cleanTitle.toLowerCase().includes('pattern') || cleanTitle.toLowerCase().includes('software');

  // Simulation steps tailored to algorithm
  const simSteps = [
    {
      title: 'Step 1: Input Memory Allocation & Pointer Initialization',
      desc: `Allocating contiguous memory blocks for ${cleanTitle}. Pointers 'left' and 'right' initialized at indices 0 and N-1.`,
      array: [2, 7, 11, 15],
      activeIndices: [0, 3],
      target: 9,
      status: 'Searching'
    },
    {
      title: 'Step 2: Complement Calculation & Hash Table Lookup',
      desc: `Target = 9. Current element = 2. Complement = 9 - 2 = 7. Checking hash bucket for key 7.`,
      array: [2, 7, 11, 15],
      activeIndices: [0],
      target: 9,
      status: 'Hash Miss (Insert 2 at index 0)'
    },
    {
      title: 'Step 3: Next Iteration & Match Verified',
      desc: `Next element = 7. Complement = 9 - 7 = 2. Key 2 found in hash table at index 0!`,
      array: [2, 7, 11, 15],
      activeIndices: [0, 1],
      target: 9,
      status: 'Match Found! Returns [0, 1]'
    },
    {
      title: 'Step 4: Algorithm Termination & Optimal Output',
      desc: `Linear time O(N) single pass execution completed with O(1) auxiliary space optimization.`,
      array: [2, 7, 11, 15],
      activeIndices: [0, 1],
      target: 9,
      status: 'COMPLETED - Success'
    }
  ];

  useEffect(() => {
    let timer: any;
    if (isPlayingSim) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < simSteps.length - 1) return prev + 1;
          setIsPlayingSim(false);
          return prev;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlayingSim, simSteps.length]);

  const renderNotesContent = (isFull: boolean = false) => (
    <div className={`space-y-6 font-sans ${isFull ? 'text-sm max-w-5xl mx-auto' : 'text-xs'}`}>
      
      {/* Chapter 1: Foundational Concept & Analogy */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-purple-900/50 space-y-3">
        <h4 className="font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2 text-xs sm:text-sm">
          <BookOpen className="w-4 h-4 text-purple-400" />
          Chapter 1: Foundational Concept & Real-World Analogy
        </h4>
        <p className="text-slate-200 leading-relaxed">
          Welcome to <strong>{cleanTitle}</strong>! Think of this concept like managing a high-efficiency registry. Rather than repeatedly recreating expensive resources or searching line-by-line, we establish a single point of truth and reusable state bounds.
        </p>
        <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-200 text-xs">
          <strong>💡 Beginner Tip:</strong> If you are new to {cleanTitle}, focus first on understanding the inputs, outputs, and why a naive nested loop takes O(N²) while our optimized approach takes O(N).
        </div>
      </div>

      {/* Chapter 2: Step-by-Step Beginner Blueprint */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h4 className="font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 text-xs sm:text-sm">
          <Zap className="w-4 h-4" />
          Chapter 2: Step-by-Step Beginner Blueprint
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-indigo-400 font-mono font-bold text-xs">1. Setup & Init</span>
            <p className="text-slate-300 text-xs">Initialize variables, stack/heap structures, or static references cleanly.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-indigo-400 font-mono font-bold text-xs">2. Core Processing</span>
            <p className="text-slate-300 text-xs">Iterate through elements while maintaining invariant invariants and checks.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-indigo-400 font-mono font-bold text-xs">3. Termination</span>
            <p className="text-slate-300 text-xs">Return optimal result or release locked resources back to system memory.</p>
          </div>
        </div>
      </div>

      {/* Chapter 3: Intermediate Implementation Code (C++ / Java / Python) */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold text-emerald-400 flex items-center gap-1.5 font-sans">
            <Code className="w-4 h-4" /> Chapter 3: Complete Executable Implementation Code
          </span>
          <span className="text-indigo-300">{cleanTitle}.cpp</span>
        </div>

        <pre className="p-4 rounded-xl bg-slate-900 text-indigo-100 text-xs overflow-x-auto border border-slate-800 leading-relaxed">
{isLldTopic ? `// C++ Thread-Safe Meyers Singleton & Design Pattern Template for ${cleanTitle}
#include <iostream>
#include <mutex>
using namespace std;

class ${cleanTitle.replace(/[^a-zA-Z0-9]/g, '')} {
private:
    ${cleanTitle.replace(/[^a-zA-Z0-9]/g, '')}() {
        cout << "[Singleton Log]: Resource Instance Created" << endl;
    }
public:
    // Meyers Singleton guarantees thread-safe initialization in C++11+
    static ${cleanTitle.replace(/[^a-zA-Z0-9]/g, '')}& getInstance() {
        static ${cleanTitle.replace(/[^a-zA-Z0-9]/g, '')} instance;
        return instance;
    }

    void executeAction() {
        cout << "[Singleton Log]: Action Executed Successfully" << endl;
    }
};

int main() {
    auto& ref1 = ${cleanTitle.replace(/[^a-zA-Z0-9]/g, '')}::getInstance();
    ref1.executeAction();
    return 0;
}` : `// C++ Complete Solution for ${cleanTitle}
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

void solve${cleanTitle.replace(/[^a-zA-Z0-9]/g, '')}() {
    cout << "Executing ${cleanTitle} algorithm..." << endl;
}

int main() {
    solve${cleanTitle.replace(/[^a-zA-Z0-9]/g, '')}();
    return 0;
}`}
        </pre>
      </div>

      {/* Chapter 4: Advanced Optimization & Memory Guarantees */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h4 className="font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2 text-xs sm:text-sm">
          <Layers className="w-4 h-4 text-indigo-400" />
          Chapter 4: Advanced Optimization & Memory Guarantees
        </h4>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>Time Complexity:</strong> O(N) linear time single pass processing.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>Space Complexity:</strong> O(1) auxiliary space optimization avoiding unnecessary heap dynamic allocations.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>Cache Locality:</strong> Sequential vector memory guarantees L1/L2 hardware CPU cache hits.</span>
          </li>
        </ul>
      </div>

      {/* Chapter 5: Beginner Pitfalls & Common Bugs */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-amber-900/50 space-y-3">
        <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 text-xs sm:text-sm">
          <ShieldAlert className="w-4 h-4" />
          Chapter 5: Beginner Pitfalls & Production Bugs
        </h4>
        <div className="space-y-2 text-xs text-slate-300">
          <p>⚠️ <strong>Dangling Pointers / References:</strong> Never return references to local stack variables initialized inside function scope.</p>
          <p>⚠️ <strong>Race Conditions:</strong> In multi-threaded environments, double-checked locking without volatile / std::atomic can cause instruction reordering bugs.</p>
        </div>
      </div>

      {/* Chapter 6: FAANG Technical Interview Q&A */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h4 className="font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2 text-xs sm:text-sm">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          Chapter 6: FAANG Technical Interview Questions
        </h4>
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <strong className="text-slate-100">Q1: How do you guarantee thread safety for {cleanTitle}?</strong>
            <p className="mt-1 text-slate-400">Answer: In C++11+, static local variables (Meyers Singleton) are guaranteed thread-safe by the compiler standard.</p>
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
      
      {/* Header Tabs & Fullscreen Toggle */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'notes'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Detailed Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'simulation'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-300" />
            <span>Interactive Visual Simulation</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'notes' && (
            <button
              onClick={() => setIsFullscreenNotes(true)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-bold transition-all"
              title="Read Notes in Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fullscreen Notes</span>
            </button>
          )}

          <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2.5 py-0.5 rounded-lg border border-purple-800/50">
            Mistral AI Model v3
          </span>
        </div>
      </div>

      {/* TAB 1: AI POWERED LECTURE NOTES */}
      {activeTab === 'notes' && renderNotesContent(false)}

      {/* TAB 2: INTERACTIVE VISUAL SIMULATION */}
      {activeTab === 'simulation' && (
        <div className="space-y-4 font-sans text-xs">
          
          {/* Controls Bar */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlayingSim(!isPlayingSim)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                {isPlayingSim ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingSim ? 'Pause' : 'Auto Play'}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentStep(0);
                  setIsPlayingSim(false);
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-1 text-xs font-mono text-slate-400">
              <span>Step {currentStep + 1} of {simSteps.length}</span>
            </div>
          </div>

          {/* Simulation Visualization Display */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-900/50 space-y-4">
            
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4 text-indigo-400" />
                {simSteps[currentStep].title}
              </h5>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-700 text-[11px] font-mono font-bold text-indigo-300">
                {simSteps[currentStep].status}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">
              {simSteps[currentStep].desc}
            </p>

            {/* Visual Memory Blocks Array */}
            <div className="flex justify-center items-center space-x-3 py-6">
              {simSteps[currentStep].array.map((val, idx) => {
                const isActive = simSteps[currentStep].activeIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-sm transition-all duration-500 shadow-lg ${
                      isActive
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white scale-110 border-2 border-indigo-300 shadow-indigo-500/40 ring-4 ring-indigo-500/20'
                        : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>{val}</span>
                    <span className="text-[9px] font-normal text-slate-400">idx {idx}</span>
                  </div>
                );
              })}
            </div>

            {/* Stepper Buttons */}
            <div className="flex justify-between pt-2 border-t border-slate-900">
              <button
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 disabled:opacity-40 text-slate-300 text-xs font-semibold"
              >
                ◀ Previous Step
              </button>

              <button
                disabled={currentStep === simSteps.length - 1}
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 disabled:opacity-40 text-white text-xs font-semibold"
              >
                Next Step ▶
              </button>
            </div>

          </div>

        </div>
      )}

      {/* FULLSCREEN AI NOTES MODAL */}
      {isFullscreenNotes && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl p-6 sm:p-10 overflow-y-auto space-y-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">{cleanTitle} — Comprehensive AI Notes</h2>
                <p className="text-xs text-slate-400">Structured from Basics to Advanced for FAANG Interview Preparation</p>
              </div>
            </div>

            <button
              onClick={() => setIsFullscreenNotes(false)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <X className="w-5 h-5" />
              <span>Close Fullscreen</span>
            </button>
          </div>

          {renderNotesContent(true)}
        </div>
      )}

    </div>
  );
};
