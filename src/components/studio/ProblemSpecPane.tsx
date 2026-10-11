import React, { useState } from 'react';
import { 
  FileText, 
  Cpu, 
  Layers, 
  Code2, 
  CheckCircle2, 
  Building2, 
  ExternalLink,
  BookOpen,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { MarkdownRenderer } from '../MarkdownRenderer';

interface ProblemSpecPaneProps {
  mode: 'dsa' | 'hld' | 'lld';
  slug?: string;
  problemTitle: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  companies?: string[];
  description: string;
  requirements?: string[];
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  constraints?: string[];
}

export const ProblemSpecPane: React.FC<ProblemSpecPaneProps> = ({
  mode,
  slug,
  problemTitle,
  difficulty = 'Medium',
  companies = ['Google', 'Meta', 'Amazon', 'Uber'],
  description,
  requirements = [
    'Sub-50ms p99 latency under 100k peak QPS',
    'Zero data loss with multi-region quorum consistency',
    'Horizontally partitionable by tenant or user ID'
  ],
  examples = [],
  constraints = [
    '1 <= N <= 10^5',
    'Time Complexity: O(N log N) or O(N)',
    'Space Complexity: O(1) auxiliary memory'
  ]
}) => {
  const [activeTab, setActiveTab] = useState<'description' | 'requirements' | 'constraints'>('description');

  return (
    <div className="h-full flex flex-col bg-slate-950 border-r border-slate-800 select-none">
      {/* 1. Header Information */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-mono border ${
            difficulty === 'Hard'
              ? 'bg-rose-950/60 text-rose-300 border-rose-700/60'
              : difficulty === 'Medium'
              ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
              : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
          }`}>
            {difficulty}
          </span>

          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-700/60 text-indigo-300">
            {mode.toUpperCase()}
          </span>

          {slug && (
            <span className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">
              {slug}
            </span>
          )}
        </div>

        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
          {problemTitle}
        </h2>

        {/* Company Tags */}
        {companies && companies.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <Building2 className="w-3 h-3 text-slate-500" />
            {companies.slice(0, 4).map((c, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-medium text-slate-300"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 text-xs font-bold text-slate-400">
        <button
          onClick={() => setActiveTab('description')}
          className={`flex-1 py-2.5 px-3 text-center transition-colors border-b-2 cursor-pointer ${
            activeTab === 'description'
              ? 'border-indigo-500 text-white bg-slate-900/80'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('requirements')}
          className={`flex-1 py-2.5 px-3 text-center transition-colors border-b-2 cursor-pointer ${
            activeTab === 'requirements'
              ? 'border-indigo-500 text-white bg-slate-900/80'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          Requirements
        </button>
        <button
          onClick={() => setActiveTab('constraints')}
          className={`flex-1 py-2.5 px-3 text-center transition-colors border-b-2 cursor-pointer ${
            activeTab === 'constraints'
              ? 'border-indigo-500 text-white bg-slate-900/80'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          Constraints
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs text-slate-300 leading-relaxed">
        {activeTab === 'description' && (
          <div className="space-y-4 animate-fadeIn">
            {description ? (
              <MarkdownRenderer content={description} />
            ) : (
              <div className="space-y-3">
                <p>
                  Design and architect a high-throughput, fault-tolerant system solution for <strong>{problemTitle}</strong>.
                </p>
                <p>
                  Ensure class hierarchies (for LLD) adhere strictly to SOLID principles, design patterns (Strategy, Factory, Observer), and thread-safety invariants.
                </p>
                <p>
                  For Distributed Systems (HLD), articulate the request lifecycle, caching layers, write-ahead logs, and partitioning scheme in the adjacent architecture canvas.
                </p>
              </div>
            )}

            {/* Examples if present */}
            {examples && examples.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                  Test Scenarios & Invariants
                </h4>
                {examples.map((ex, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500">Input: </span>
                      <span className="text-indigo-300">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Output: </span>
                      <span className="text-emerald-300">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <p className="text-slate-400 font-sans text-[11px] pt-1 border-t border-slate-800/80 mt-1">
                        {ex.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="space-y-3 animate-fadeIn">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
              Functional & Scalability Invariants
            </h4>
            <ul className="space-y-2">
              {requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-200">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'constraints' && (
          <div className="space-y-3 animate-fadeIn">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
              Mathematical & Performance Constraints
            </h4>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono text-[11px]">
              {constraints.map((c, idx) => (
                <div key={idx} className="text-slate-300 flex items-center gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
