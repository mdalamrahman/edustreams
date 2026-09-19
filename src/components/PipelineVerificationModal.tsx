import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Copy,
  Check,
  Code2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  Wrench,
  HelpCircle,
  FileCode
} from 'lucide-react';
import {
  PipelineVerificationResult,
  PipelineVerificationProgress,
  PipelineTestCaseResult,
  verifyAndHealPipeline
} from '../lib/pipelineVerifier';
import { SupportedLanguage } from '../lib/compiler';

interface PipelineVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  problemTitle: string;
  problemStatement?: string;
  language: SupportedLanguage;
  starterCode?: string;
  testCases: string[];
  expectedOutputs: string[];
  existingSolutionCode?: string;
  existingDriverCode?: string;
  onApplySolutionToEditor?: (solutionCode: string) => void;
  onPipelineHealed?: (repairedData: {
    solutionCode: string;
    driverCode?: string;
    expectedOutputs?: string[];
  }) => void;
}

export const PipelineVerificationModal: React.FC<PipelineVerificationModalProps> = ({
  isOpen,
  onClose,
  slug,
  problemTitle,
  problemStatement,
  language,
  starterCode,
  testCases,
  expectedOutputs,
  existingSolutionCode,
  existingDriverCode,
  onApplySolutionToEditor,
  onPipelineHealed
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<PipelineVerificationProgress | null>(null);
  const [result, setResult] = useState<PipelineVerificationResult | null>(null);
  const [expandedCaseIdx, setExpandedCaseIdx] = useState<number | null>(0);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [appliedSolution, setAppliedSolution] = useState(false);
  const [showSolutionCode, setShowSolutionCode] = useState(false);

  const startVerification = async () => {
    setIsRunning(true);
    setResult(null);
    setProgress({
      stage: 'fetching_solution',
      message: `Initiating pipeline verification for ${language.toUpperCase()}...`
    });

    try {
      const res = await verifyAndHealPipeline({
        slug,
        problemTitle,
        problemStatement,
        language,
        starterCode,
        testCases,
        expectedOutputs,
        existingSolutionCode,
        existingDriverCode,
        onProgress: (p) => setProgress(p)
      });

      setResult(res);

      if (res.healed && onPipelineHealed) {
        onPipelineHealed({
          solutionCode: res.solutionCode,
          driverCode: res.driverCode,
          expectedOutputs: res.repairedAssets?.repairedExpectedOutputs
        });
      }
    } catch (err: any) {
      console.error('[PipelineVerificationModal Error]:', err);
      setResult({
        status: 'DISCREPANCY_UNRESOLVED',
        passedCount: 0,
        totalCount: Math.max(1, testCases.length),
        attemptsUsed: 1,
        healed: false,
        healingDiagnosis: `Unexpected error during pipeline run: ${err?.message || err}`,
        solutionCode: existingSolutionCode || '',
        testCaseResults: [],
        overallRuntimeMs: 0
      });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAppliedSolution(false);
      setCopiedSolution(false);
      setShowSolutionCode(false);
      startVerification();
    } else {
      setResult(null);
      setProgress(null);
      setIsRunning(false);
    }
  }, [isOpen, slug, language]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (result?.solutionCode) {
      navigator.clipboard.writeText(result.solutionCode);
      setCopiedSolution(true);
      setTimeout(() => setCopiedSolution(false), 2000);
    }
  };

  const handleApply = () => {
    if (result?.solutionCode && onApplySolutionToEditor) {
      onApplySolutionToEditor(result.solutionCode);
      setAppliedSolution(true);
      setTimeout(() => setAppliedSolution(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-3xl bg-slate-900/95 border border-slate-700/70 rounded-3xl shadow-2xl shadow-cyan-950/20 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-cyan-950/80 border border-cyan-700/50 text-cyan-400 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-100">
                  Platform Pipeline Verification
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-800/60 text-cyan-300 uppercase">
                  {language}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {problemTitle} • Self-Healing Quality Assurance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isRunning && (
              <button
                onClick={startVerification}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Re-run Verification"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">

          {/* Running Progress View */}
          {isRunning && (
            <div className="p-6 rounded-3xl bg-slate-950/90 border border-cyan-900/40 text-center space-y-5 my-2">
              <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <Sparkles className="w-6 h-6 text-cyan-300 animate-pulse" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200">
                  {progress?.message || 'Testing pipeline health against Judge0...'}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Submitting backend reference solution against {testCases.length} test cases
                </p>
              </div>

              {/* Step Flow Pills */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] max-w-lg mx-auto">
                <div className={`p-2 rounded-xl border text-center transition-all ${
                  progress?.stage === 'fetching_solution' || progress?.stage === 'resolving_driver'
                    ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>
                  1. Load Solution
                </div>
                <div className={`p-2 rounded-xl border text-center transition-all ${
                  progress?.stage === 'running_cases'
                    ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>
                  2. Judge0 Execution
                </div>
                <div className={`p-2 rounded-xl border text-center transition-all ${
                  progress?.stage === 'ai_healing'
                    ? 'bg-purple-950/60 border-purple-500/60 text-purple-300 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>
                  3. AI Self-Healing
                </div>
              </div>
            </div>
          )}

          {/* Results View */}
          {!isRunning && result && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Verdict Banner */}
              {result.status === 'VERIFIED_SUCCESS' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-emerald-900/40 to-slate-950 border border-emerald-600/50 shadow-lg shadow-emerald-950/30">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-emerald-200">
                          Platform Pipeline 100% Verified
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-500/50 text-emerald-300">
                          {result.passedCount}/{result.totalCount} Passed
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        The official backend reference solution passed all test cases with 100% accuracy. The test cases, expected outputs, compiler flags, and driver harness are completely verified.
                      </p>
                      <p className="text-xs text-emerald-400/90 font-medium pt-1">
                        💡 If your submission is failing, the issue is strictly inside your solution logic, not a platform defect.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {result.status === 'HEALED_AND_VERIFIED' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-indigo-950/40 to-slate-950 border border-cyan-500/50 shadow-lg shadow-cyan-950/30">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-cyan-900/60 border border-cyan-500/50 text-cyan-300 flex-shrink-0">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-cyan-200">
                          Pipeline Discrepancy Self-Healed & Verified
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                          Healed (Attempt {result.attemptsUsed - 1})
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        A discrepancy was detected during initial evaluation, but the automated AI self-healing loop successfully repaired the {result.defectType || 'pipeline'} and verified that all {result.totalCount} test cases now pass 100%.
                      </p>
                      {result.healingDiagnosis && (
                        <div className="mt-2 p-2.5 rounded-xl bg-slate-950/80 border border-cyan-900/60 text-xs font-mono text-cyan-300">
                          <span className="font-bold text-slate-400">Diagnosis: </span>
                          {result.healingDiagnosis}
                        </div>
                      )}
                      <p className="text-xs text-cyan-400/90 font-medium pt-1">
                        ✨ Corrected assets have been automatically updated and synced to Cloudflare R2!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {result.status === 'DISCREPANCY_UNRESOLVED' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-rose-900/40 to-slate-950 border border-rose-500/50 shadow-lg shadow-rose-950/30">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-rose-900/60 border border-rose-500/50 text-rose-300 flex-shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-rose-200">
                          Pipeline Discrepancy Unresolved
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 border border-rose-500/50 text-rose-300">
                          {result.passedCount}/{result.totalCount} Passed
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        The reference solution failed on one or more test cases even after {result.attemptsUsed} automated repair iterations. Review the failing cases below to inspect the discrepancy.
                      </p>
                      {result.healingDiagnosis && (
                        <div className="mt-2 p-2.5 rounded-xl bg-slate-950/80 border border-rose-900/60 text-xs font-mono text-rose-300">
                          {result.healingDiagnosis}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Metrics Summary Strip */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Accuracy</div>
                  <div className={`text-base font-bold font-mono mt-0.5 ${
                    result.passedCount === result.totalCount ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {Math.round((result.passedCount / Math.max(1, result.totalCount)) * 100)}%
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Latency</div>
                  <div className="text-base font-bold font-mono text-slate-200 mt-0.5 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{result.overallRuntimeMs}ms</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Self-Healing</div>
                  <div className="text-base font-bold font-mono text-slate-200 mt-0.5 flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{result.healed ? 'Active (Healed)' : 'Healthy'}</span>
                  </div>
                </div>
              </div>

              {/* Test Cases Results Accordion */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                  <span>Evaluated Test Cases ({result.testCaseResults.length})</span>
                  <span>Click to inspect Input / Output</span>
                </div>

                <div className="space-y-2">
                  {result.testCaseResults.map((tc) => {
                    const isExpanded = expandedCaseIdx === tc.index;
                    return (
                      <div
                        key={tc.index}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          tc.passed
                            ? 'bg-slate-950/70 border-slate-800/80'
                            : 'bg-rose-950/20 border-rose-900/40'
                        }`}
                      >
                        <button
                          onClick={() => setExpandedCaseIdx(isExpanded ? null : tc.index)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-900/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {tc.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                            )}
                            <span className="text-xs font-bold text-slate-200">
                              Test Case #{tc.index + 1}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 truncate max-w-xs">
                              {tc.input.replace(/\n/g, ' ')}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-[10px] font-mono text-slate-400">
                              {tc.runtimeMs}ms
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              tc.passed 
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50' 
                                : 'bg-rose-950 text-rose-300 border border-rose-800/50'
                            }`}>
                              {tc.passed ? 'PASSED' : 'FAILED'}
                            </span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-3.5 pt-0 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono mt-1">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase text-slate-500">Input</span>
                              <pre className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-32 text-[11px]">
                                {tc.input}
                              </pre>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase text-slate-500">Expected Output</span>
                              <pre className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400/90 overflow-x-auto whitespace-pre-wrap max-h-32 text-[11px]">
                                {tc.expectedOutput || '<empty>'}
                              </pre>
                            </div>

                            <div className="sm:col-span-2 space-y-1">
                              <span className="text-[10px] font-bold uppercase text-slate-500">Platform Reference Output</span>
                              <pre className={`p-2 rounded-xl bg-slate-950 border overflow-x-auto whitespace-pre-wrap max-h-32 text-[11px] ${
                                tc.passed ? 'border-slate-800 text-slate-300' : 'border-rose-900/60 text-rose-300'
                              }`}>
                                {tc.actualOutput || (tc.error ? `Error: ${tc.error}` : '<no output>')}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reference Solution Inspection Toggle */}
              {result.solutionCode && (
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setShowSolutionCode(!showSolutionCode)}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>{showSolutionCode ? 'Hide Verified Solution' : 'View Verified Reference Solution'}</span>
                    {showSolutionCode ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {showSolutionCode && (
                    <pre className="mt-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono overflow-x-auto max-h-52 custom-scrollbar whitespace-pre">
                      {result.solutionCode}
                    </pre>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {result?.solutionCode && (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedSolution ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSolution ? 'Copied' : 'Copy Solution'}</span>
                </button>

                {onApplySolutionToEditor && (
                  <button
                    onClick={handleApply}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{appliedSolution ? 'Applied to Editor!' : 'Apply to Editor'}</span>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
