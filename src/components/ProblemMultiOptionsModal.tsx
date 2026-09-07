import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Code2,
  Info
} from 'lucide-react';
import {
  judgeProblemMultiOptionsAI,
  ProblemMultiOptionsResult,
  MultiTestCaseOption
} from '../lib/mistral';

interface ProblemMultiOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemTitle: string;
  problemSlug: string;
  problemStatement: string;
  testCases: string[];
  expectedOutputs?: string[];
  onApplyAllOptionsToTemplate?: (updatedExpectedOutputs: string[]) => void;
}

export const ProblemMultiOptionsModal: React.FC<ProblemMultiOptionsModalProps> = ({
  isOpen,
  onClose,
  problemTitle,
  problemSlug,
  problemStatement,
  testCases,
  expectedOutputs,
  onApplyAllOptionsToTemplate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [multiData, setMultiData] = useState<ProblemMultiOptionsResult | null>(null);
  const [copiedOption, setCopiedOption] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setHasApplied(false);

    judgeProblemMultiOptionsAI({
      slug: problemSlug,
      problemTitle,
      problemStatement,
      testCases,
      expectedOutputs
    }).then(result => {
      if (isMounted) {
        setMultiData(result);
        setIsLoading(false);
      }
    }).catch(err => {
      console.warn('[MultiOptions Modal Load Error]:', err);
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, problemSlug, testCases]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOption(text);
    setTimeout(() => setCopiedOption(null), 2000);
  };

  const handleApplyAll = () => {
    if (!multiData || !multiData.allTestCasesOptions || !onApplyAllOptionsToTemplate) return;

    const newOutputs = [...(expectedOutputs || [])];
    multiData.allTestCasesOptions.forEach(item => {
      if (item.validOptions && item.validOptions.length > 0) {
        newOutputs[item.caseIndex] = item.validOptions.join(' or ');
      }
    });

    onApplyAllOptionsToTemplate(newOutputs);
    setHasApplied(true);
    setTimeout(() => setHasApplied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/90 border-b border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-md">
              <Layers className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AI Testcase Multi-Option Judge</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-600/70 text-[10px] font-bold text-purple-300 font-mono">
                  Special Judge
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Problem: <strong className="text-slate-200">{problemTitle}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200">Evaluating Problem Mathematical Specifications...</p>
                <p className="text-xs text-slate-400">Judging if multiple valid testcase outputs are acceptable for this question</p>
              </div>
            </div>
          )}

          {!isLoading && multiData && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Verdict Banner */}
              {multiData.hasMultipleValidOutputs ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/60 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                          Multiple Correct Testcase Solutions Possible
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-900 border border-purple-500 text-[10px] text-purple-300 font-mono">
                          {multiData.allTestCasesOptions.length} Testcases Analyzed
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {multiData.reason}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                  <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Deterministic Single-Output Problem
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {multiData.reason || 'This problem requires a unique deterministic output for each testcase.'}
                    </p>
                  </div>
                </div>
              )}

              {/* All Testcases Available for Each Such Question */}
              {multiData.allTestCasesOptions && multiData.allTestCasesOptions.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-purple-400" />
                      <span>All Available Testcases & Valid Output Options:</span>
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono">
                      Special Judge Tolerant
                    </span>
                  </div>

                  <div className="space-y-3">
                    {multiData.allTestCasesOptions.map((item: MultiTestCaseOption, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-purple-900/30 space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-purple-950 border border-purple-700/60 text-purple-300 font-mono text-[11px]">
                              Case {item.caseIndex + 1}
                            </span>
                            <code className="text-slate-300 font-mono text-xs">{item.input}</code>
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-800/50">
                            {item.validOptions.length} valid {item.validOptions.length === 1 ? 'option' : 'options'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {item.validOptions.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className="p-3 rounded-xl bg-slate-900/90 border border-purple-900/40 space-y-1 hover:border-purple-500/50 transition-colors group relative"
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-purple-400 uppercase tracking-wider">
                                  Option {oIdx + 1}
                                </span>
                                <button
                                  onClick={() => handleCopy(opt)}
                                  className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                  title="Copy this output"
                                >
                                  {copiedOption === opt ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <p className="font-mono text-xs text-emerald-300 font-bold break-all">
                                {opt}
                              </p>
                            </div>
                          ))}
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-slate-400 italic pt-0.5">
                            💡 {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                {multiData.hasMultipleValidOutputs && onApplyAllOptionsToTemplate && (
                  <button
                    onClick={handleApplyAll}
                    disabled={hasApplied}
                    className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {hasApplied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>All Options Applied to Testcases!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-purple-200" />
                        <span>Sync All Valid Options to Workspace</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="py-3 px-6 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
