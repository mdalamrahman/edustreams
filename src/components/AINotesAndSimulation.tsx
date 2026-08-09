import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Play, Pause, RotateCcw, ChevronRight, CheckCircle2, Code, Cpu, ShieldAlert, CpuIcon } from 'lucide-react';
import { Video } from '../lib/types';

interface AINotesAndSimulationProps {
  video: Video;
}

export const AINotesAndSimulation: React.FC<AINotesAndSimulationProps> = ({ video }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'simulation'>('notes');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlayingSim, setIsPlayingSim] = useState(false);

  const cleanTitle = (video.title || 'Lecture').replace(/\.(mp4|mkv|webm)$/i, '');

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

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
      
      {/* Header Tabs */}
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
            <span>AI Powered Notes</span>
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

        <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2.5 py-0.5 rounded-lg border border-purple-800/50">
          Mistral AI Model v3
        </span>
      </div>

      {/* TAB 1: AI POWERED LECTURE NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4 font-sans text-xs">
          
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/40 space-y-2">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-400" /> Executive Lecture Summary — {cleanTitle}
            </h4>
            <p className="text-slate-300 leading-relaxed">
              This lecture covers fundamental concepts in <strong>{cleanTitle}</strong>. Key themes include subproblem decomposition, optimal state space transitions, memory layout guarantees, and Big-O execution boundaries.
            </p>
          </div>

          {/* Key Concepts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <h5 className="font-bold text-emerald-400 mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 1. Core Terminology & Data Types
              </h5>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Understand memory contiguous allocation (`std::vector`), reference semantics (`int&`), and constant correctness to avoid copying overhead during function dispatch.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <h5 className="font-bold text-amber-400 mb-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> 2. Technical Interview Pitfalls
              </h5>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Watch out for out-of-bounds index access, uninitialized pointers, dangling references, and hash collision degradation under adversarial inputs.
              </p>
            </div>
          </div>

          {/* Code Snippet Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold flex justify-between">
              <span>C++ Key Algorithm Template</span>
              <span className="text-indigo-400">{cleanTitle}.cpp</span>
            </div>
            <pre className="text-indigo-200 overflow-x-auto p-2 bg-slate-900/90 rounded-lg border border-slate-800">
{`// C++ Optimal Implementation for ${cleanTitle}
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

void executeAlgorithm() {
    // 1. Initialize state variables
    unordered_map<int, int> stateMap;
    // 2. Iterate through input elements in O(N) time
    cout << "Executing state transformation for ${cleanTitle}" << endl;
}`}
            </pre>
          </div>

        </div>
      )}

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

    </div>
  );
};
