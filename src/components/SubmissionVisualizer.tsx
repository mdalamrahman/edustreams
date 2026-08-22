import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Cpu, BarChart3, TrendingUp, 
  Layers, Sparkles, ChevronRight, Zap, Award, Info, Code2, 
  Check, ArrowUpRight, Flame, ShieldCheck, PieChart, Activity
} from 'lucide-react';
import { SupportedLanguage } from '../lib/compiler';
import { FormattedChatText } from './FormattedChatText';

export interface TestCaseResultItem {
  caseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed: boolean;
  runtimeMs: number;
  memoryKb: number;
  errorMessage?: string;
}

export interface SubmissionAnalyticsData {
  isSuccess: boolean;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Memory Limit Exceeded';
  totalCases: number;
  passedCases: number;
  runtimeMs: number;
  memoryKb: number;
  runtimePercentile: number; // e.g. 92.4%
  memoryPercentile: number;  // e.g. 88.7%
  timeComplexity: string;    // e.g. 'O(N)'
  spaceComplexity: string;   // e.g. 'O(N)'
  timeExplanation: string;
  spaceExplanation: string;
  optimalTimeComplexity?: string;  // e.g. 'O(N)'
  optimalSpaceComplexity?: string; // e.g. 'O(1)'
  testCasesResults: TestCaseResultItem[];
  failedCase?: {
    caseIndex: number;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    stderr?: string;
  };
  language: SupportedLanguage;
  problemTitle: string;
  submittedCode: string;
}

interface SubmissionVisualizerProps {
  data: SubmissionAnalyticsData;
  onClose?: () => void;
  onRetry?: () => void;
  onAskAi?: (prompt: string) => void;
}

export const SubmissionVisualizer: React.FC<SubmissionVisualizerProps> = ({
  data,
  onClose,
  onRetry,
  onAskAi
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'complexity' | 'testcases' | 'optimization'>('overview');
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(
    data.failedCase ? data.failedCase.caseIndex : 0
  );
  const [scaleN, setScaleN] = useState<number>(10000); // 10^4
  const [hoveredBucket, setHoveredBucket] = useState<{ type: 'runtime' | 'memory'; idx: number } | null>(null);

  // Runtime distribution mock histogram with realistic Gaussian curve
  const runtimeDistribution = useMemo(() => {
    // 20 buckets from 10ms to 120ms
    const baseRuntime = Math.max(15, Math.min(100, data.runtimeMs));
    const buckets = [
      { ms: '15-25', count: 12, pct: 4 },
      { ms: '26-35', count: 48, pct: 15 },
      { ms: '36-45', count: 85, pct: 28 },
      { ms: '46-55', count: 72, pct: 24 },
      { ms: '56-65', count: 39, pct: 13 },
      { ms: '66-80', count: 24, pct: 8 },
      { ms: '81-100', count: 15, pct: 5 },
      { ms: '101-130', count: 8, pct: 3 },
    ];
    return buckets;
  }, [data.runtimeMs]);

  // Memory distribution histogram
  const memoryDistribution = useMemo(() => {
    const buckets = [
      { mb: '13.8', count: 20, pct: 7 },
      { mb: '14.2', count: 65, pct: 22 },
      { mb: '14.6', count: 95, pct: 32 },
      { mb: '15.0', count: 55, pct: 19 },
      { mb: '15.5', count: 32, pct: 11 },
      { mb: '16.2', count: 18, pct: 6 },
      { mb: '17.5', count: 9, pct: 3 },
    ];
    return buckets;
  }, [data.memoryKb]);

  // Theoretical Big-O Growth calculations for N
  const complexityCurves = useMemo(() => {
    const n = scaleN;
    return {
      constant: { name: 'O(1) Constant', ops: 1, color: '#10b981', desc: 'Instantaneous execution independent of N' },
      logN: { name: 'O(log N) Logarithmic', ops: Math.round(Math.log2(n)), color: '#06b6d4', desc: 'Binary search, divide & conquer' },
      linear: { name: 'O(N) Linear', ops: n, color: '#3b82f6', desc: 'Single linear pass over input dataset' },
      linearithmic: { name: 'O(N log N) Linearithmic', ops: Math.round(n * Math.log2(n)), color: '#f59e0b', desc: 'Optimal comparison sorting (Merge/Heap)' },
      quadratic: { name: 'O(N²) Quadratic', ops: Math.min(1e12, n * n), color: '#f43f5e', desc: 'Nested loops over elements' },
      exponential: { name: 'O(2^N) Exponential', ops: n <= 30 ? Math.pow(2, n) : 1e15, color: '#ef4444', desc: 'Combinatorial brute-force recursion' },
    };
  }, [scaleN]);

  const selectedCase = data.testCasesResults[selectedCaseIdx] || data.testCasesResults[0];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      
      {/* ===================================================================== */}
      {/* TOP HEADER: STATUS BANNER & METRIC PILLS                              */}
      {/* ===================================================================== */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
        data.isSuccess
          ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/40 border-emerald-500/30'
          : 'bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/40 border-rose-500/30'
      }`}>
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-3.5">
          <div className={`p-2.5 rounded-2xl shadow-lg border flex items-center justify-center ${
            data.isSuccess
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400 shadow-emerald-500/20 animate-pulse'
              : 'bg-rose-500/20 border-rose-400/50 text-rose-400 shadow-rose-500/20'
          }`}>
            {data.isSuccess ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className={`text-lg font-black tracking-tight ${
                data.isSuccess ? 'text-emerald-300' : 'text-rose-400'
              }`}>
                {data.status}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800/80 border border-slate-700 text-slate-300">
                {data.passedCases} / {data.totalCases} Cases Passed
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Submitted in <span className="text-purple-300 font-semibold">{data.language.toUpperCase()}</span> for <span className="text-slate-200 font-semibold">{data.problemTitle}</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Metric Badges */}
        <div className="flex items-center space-x-2">
          {data.isSuccess && (
            <div className="hidden sm:flex items-center space-x-2 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">
                Beats {data.runtimePercentile.toFixed(1)}% Speed
              </span>
            </div>
          )}

          {onAskAi && (
            <button
              onClick={() => onAskAi(`Please analyze my ${data.language} solution for ${data.problemTitle}. Can we optimize the runtime or memory complexity further?`)}
              className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Complexity Review</span>
            </button>
          )}

          {onRetry && !data.isSuccess && (
            <button
              onClick={onRetry}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Fix & Re-Submit
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* NAVIGATION TABS                                                       */}
      {/* ===================================================================== */}
      <div className="px-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1 py-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Distribution & Beats</span>
          </button>

          <button
            onClick={() => setActiveTab('complexity')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'complexity'
                ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Big-O Graph & Asymptotics</span>
          </button>

          <button
            onClick={() => setActiveTab('testcases')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'testcases'
                ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Testcases ({data.totalCases})</span>
          </button>

          <button
            onClick={() => setActiveTab('optimization')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'optimization'
                ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Performance Bottlenecks</span>
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span>Time: <strong className="text-slate-200">{data.timeComplexity || 'O(N)'}</strong></span>
          <span className="text-slate-600">•</span>
          <span>Space: <strong className="text-slate-200">{data.spaceComplexity || 'O(1)'}</strong></span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MAIN TAB CONTENT AREA                                                 */}
      {/* ===================================================================== */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {/* ------------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW & RUNTIME / MEMORY PERCENTILES                      */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top 2 Scorecards: Runtime vs Memory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Runtime Distribution Card */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Runtime Performance</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    Beats {data.runtimePercentile.toFixed(1)}%
                  </span>
                </div>

                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-slate-100 font-mono">{data.runtimeMs}</span>
                  <span className="text-sm font-semibold text-slate-400">ms</span>
                  <span className="text-xs text-slate-500 ml-auto font-mono">Rank: Top {(100 - data.runtimePercentile).toFixed(1)}%</span>
                </div>

                {/* SVG Bell-Curve & Distribution Bars */}
                <div className="mt-4 pt-2">
                  <div className="flex items-end justify-between h-28 gap-1.5 px-2">
                    {runtimeDistribution.map((b, i) => {
                      const isUserBucket = (i === 1 && data.runtimeMs <= 35) || (i === 2 && data.runtimeMs > 35 && data.runtimeMs <= 45) || (i === 3 && data.runtimeMs > 45);
                      return (
                        <div 
                          key={i} 
                          className="flex-1 flex flex-col items-center h-full justify-end group/bar relative cursor-pointer"
                          onMouseEnter={() => setHoveredBucket({ type: 'runtime', idx: i })}
                          onMouseLeave={() => setHoveredBucket(null)}
                        >
                          {/* Animated User Marker Pin */}
                          {isUserBucket && (
                            <div className="absolute -top-6 flex flex-col items-center animate-bounce z-10">
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500 text-white font-mono text-[9px] font-black shadow-lg whitespace-nowrap">
                                You ({data.runtimeMs}ms)
                              </span>
                              <div className="w-1.5 h-1.5 bg-indigo-500 rotate-45 -mt-0.5"></div>
                            </div>
                          )}

                          {/* Histogram Bar */}
                          <div 
                            style={{ height: `${b.pct * 3.2}%` }}
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              isUserBucket
                                ? 'bg-gradient-to-t from-indigo-600 via-sky-500 to-emerald-400 shadow-lg shadow-sky-500/30'
                                : 'bg-slate-800 hover:bg-slate-700'
                            }`}
                          />
                          <span className="text-[9px] font-mono text-slate-500 mt-1">{b.ms}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-slate-500 text-center mt-2 font-mono">
                    Runtime Distribution (ms) across all {data.language.toUpperCase()} submissions
                  </div>
                </div>
              </div>

              {/* Memory Distribution Card */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Memory Allocation</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-500/30">
                    Beats {data.memoryPercentile.toFixed(1)}%
                  </span>
                </div>

                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-slate-100 font-mono">{(data.memoryKb / 1024).toFixed(1)}</span>
                  <span className="text-sm font-semibold text-slate-400">MB</span>
                  <span className="text-xs text-slate-500 ml-auto font-mono">{data.memoryKb} KB used</span>
                </div>

                {/* SVG Memory Distribution Bars */}
                <div className="mt-4 pt-2">
                  <div className="flex items-end justify-between h-28 gap-1.5 px-2">
                    {memoryDistribution.map((b, i) => {
                      const isUserBucket = i === 2;
                      return (
                        <div 
                          key={i} 
                          className="flex-1 flex flex-col items-center h-full justify-end group/bar relative cursor-pointer"
                        >
                          {isUserBucket && (
                            <div className="absolute -top-6 flex flex-col items-center animate-bounce z-10">
                              <span className="px-1.5 py-0.5 rounded bg-purple-500 text-white font-mono text-[9px] font-black shadow-lg whitespace-nowrap">
                                You ({(data.memoryKb / 1024).toFixed(1)}MB)
                              </span>
                              <div className="w-1.5 h-1.5 bg-purple-500 rotate-45 -mt-0.5"></div>
                            </div>
                          )}

                          <div 
                            style={{ height: `${b.pct * 2.8}%` }}
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              isUserBucket
                                ? 'bg-gradient-to-t from-purple-600 via-pink-500 to-indigo-400 shadow-lg shadow-purple-500/30'
                                : 'bg-slate-800 hover:bg-slate-700'
                            }`}
                          />
                          <span className="text-[9px] font-mono text-slate-500 mt-1">{b.mb}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-slate-500 text-center mt-2 font-mono">
                    Memory Footprint (MB) across all submissions
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Testcase Summary Pills */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Test Suite Execution Summary ({data.passedCases}/{data.totalCases} Passed)
                </span>
                <button
                  onClick={() => setActiveTab('testcases')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  Inspect details <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
                {data.testCasesResults.map((tc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedCaseIdx(idx);
                      setActiveTab('testcases');
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      tc.passed
                        ? 'bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-400 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-500/40 hover:border-rose-400 text-rose-300'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold">Case {idx + 1}</span>
                    <span className="text-[9px] font-mono text-slate-400 mt-0.5">{tc.runtimeMs}ms</span>
                    {tc.passed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 mt-1" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 2: THEORETICAL COMPLEXITY & BIG-O GRAPH                         */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'complexity' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Interactive Asymptotic Scaling Graph */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    Asymptotic Complexity Scaling (Big-O Visualizer)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Compare how operation count scales as dataset size <span className="font-mono text-purple-300 font-bold">N</span> increases.
                  </p>
                </div>

                {/* Input Scaling Slider */}
                <div className="flex items-center space-x-3 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 font-bold">N =</span>
                  <input
                    type="range"
                    min="10"
                    max="100000"
                    step="100"
                    value={scaleN}
                    onChange={(e) => setScaleN(Number(e.target.value))}
                    className="w-28 sm:w-40 accent-purple-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-purple-300 min-w-[65px]">
                    {scaleN.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Big-O Curve Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                
                {/* User's Complexity Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border-2 border-indigo-500/50 shadow-lg relative">
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                    Your Solution
                  </div>
                  <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Time Complexity</div>
                  <div className="text-2xl font-black text-slate-100 font-mono mt-1">
                    {data.timeComplexity || 'O(N)'}
                  </div>
                  <div className="text-xs text-slate-300 font-mono mt-2 flex items-center justify-between">
                    <span>Operations at N={scaleN.toLocaleString()}:</span>
                    <strong className="text-indigo-300">
                      {scaleN.toLocaleString()} ops
                    </strong>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {data.timeExplanation || 'Single pass linear scan with constant time operations.'}
                  </p>
                </div>

                {/* Optimal Theoretical Bound Card */}
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 shadow-lg">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Optimal Bound</div>
                  <div className="text-2xl font-black text-slate-100 font-mono mt-1">
                    {data.optimalTimeComplexity || 'O(N)'} Time, {data.optimalSpaceComplexity || 'O(1)'} Space
                  </div>
                  <div className="text-xs text-slate-300 font-mono mt-2 flex items-center justify-between">
                    <span>Target Speed:</span>
                    <strong className="text-emerald-300">Mathematically Optimal</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Minimum theoretical lower bound for this problem class.
                  </p>
                </div>

                {/* Auxiliary Space Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-lg">
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Auxiliary Space</div>
                  <div className="text-2xl font-black text-slate-100 font-mono mt-1">
                    {data.spaceComplexity || 'O(N)'}
                  </div>
                  <div className="text-xs text-slate-300 font-mono mt-2 flex items-center justify-between">
                    <span>Allocated Heap:</span>
                    <strong className="text-purple-300">{data.memoryKb} KB</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {data.spaceExplanation || 'Hash table storage for element lookups.'}
                  </p>
                </div>

              </div>

              {/* Asymptotic Hierarchy Reference Table */}
              <div className="mt-5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase mb-2.5">
                  Big-O Asymptotic Spectrum for N = {scaleN.toLocaleString()}
                </div>
                <div className="space-y-2 font-mono text-xs">
                  {Object.entries(complexityCurves).map(([key, item]) => {
                    const isUser = (key === 'linear' && (data.timeComplexity.includes('N') && !data.timeComplexity.includes('N²') && !data.timeComplexity.includes('log'))) ||
                                  (key === 'linearithmic' && data.timeComplexity.includes('log')) ||
                                  (key === 'quadratic' && data.timeComplexity.includes('2'));
                    return (
                      <div 
                        key={key} 
                        className={`p-2 rounded-lg flex items-center justify-between border ${
                          isUser 
                            ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200' 
                            : 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-bold text-slate-200">{item.name}</span>
                          {isUser && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500 text-white text-[9px] font-bold uppercase">
                              Your Code
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-300">{item.ops.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-500 ml-1">operations</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 3: ALL TESTCASES BREAKDOWN MATRIX                               */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'testcases' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Split layout: Case list on left, case inspector on right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Case selector column */}
              <div className="lg:col-span-4 space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {data.testCasesResults.map((tc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCaseIdx(idx)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedCaseIdx === idx
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-md text-purple-200'
                        : tc.passed
                          ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          : 'bg-rose-950/20 border-rose-800/50 hover:border-rose-700 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {tc.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold font-mono">Case {idx + 1}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[140px] font-mono">
                          {tc.input}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="text-slate-400">{tc.runtimeMs} ms</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Case details inspector */}
              <div className="lg:col-span-8 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-300 font-mono">Test Case {selectedCaseIdx + 1} of {data.totalCases}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      selectedCase.passed
                        ? 'bg-emerald-950 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-950 border border-rose-500/30 text-rose-400'
                    }`}>
                      {selectedCase.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Latency: <strong className="text-slate-200">{selectedCase.runtimeMs} ms</strong>
                  </div>
                </div>

                {/* Input block */}
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Input:</div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap">
                    {selectedCase.input}
                  </div>
                </div>

                {/* Expected output block */}
                <div>
                  <div className="text-[10px] text-indigo-400 font-bold uppercase mb-1">Expected Output:</div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 whitespace-pre-wrap">
                    {selectedCase.expectedOutput}
                  </div>
                </div>

                {/* Actual output block */}
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Your Output:</div>
                  <div className={`p-3 rounded-xl bg-slate-950 border font-mono text-xs whitespace-pre-wrap ${
                    selectedCase.passed ? 'border-emerald-800/80 text-emerald-400' : 'border-rose-800/80 text-rose-300'
                  }`}>
                    {selectedCase.actualOutput || (selectedCase.passed ? selectedCase.expectedOutput : 'None / Empty output')}
                  </div>
                </div>

                {selectedCase.errorMessage && (
                  <div>
                    <div className="text-[10px] text-rose-400 font-bold uppercase mb-1">Diagnostics / Stderr:</div>
                    <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/60 font-mono text-xs text-rose-300 whitespace-pre-wrap">
                      {selectedCase.errorMessage}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 4: PERFORMANCE BOTTLENECKS & AI OPTIMIZATIONS                   */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'optimization' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-amber-300">
                <Flame className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-100">Performance Bottleneck Profiler & Tips</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    I/O Fast Acceleration
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    In C++, ensure <code className="text-purple-300 font-mono">ios_base::sync_with_stdio(false); cin.tie(NULL);</code> is enabled to reduce runtime overhead on large test batches.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    In-Place Space Reduction
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Replace auxiliary hash maps with two-pointer scans or in-place bitmask markers to reduce space complexity from <code className="text-purple-300 font-mono">O(N)</code> to <code className="text-emerald-400 font-mono">O(1)</code>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Cache Locality
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sequential contiguous array iterations maximize CPU L1/L2 cache hits compared to linked nodes or pointer chasing.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Branch Prediction
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sort input data or structure conditions so CPU branch predictors correctly anticipate conditional paths.
                  </p>
                </div>
              </div>

              {onAskAi && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onAskAi(`Analyze my solution's time complexity and suggest specific line-by-line performance optimizations for ${data.problemTitle}.`)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Run Full AI Complexity Diagnostics</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
