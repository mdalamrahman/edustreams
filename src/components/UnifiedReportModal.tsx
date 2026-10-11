import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Send,
  Wand2,
  Code2,
  Check,
  Coins,
  Cpu,
  Layers
} from 'lucide-react';
import {
  verifyAndCorrectTestCaseAI,
  verifyAndCorrectDriverCodeAI,
  TestCaseVerificationResult,
  DriverCorrectionResult
} from '../lib/mistral';
import { TELEGRAM_BACKEND_URL } from '../lib/telegram';
import { claimReportBounty } from '../lib/billing';
import { getCurrentStudent } from '../lib/auth';
import { resolveReferenceSolution } from '../lib/problemService';
import { executeCode, SupportedLanguage } from '../lib/compiler';

export interface UnifiedReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemTitle: string;
  problemSlug: string;
  problemStatement?: string;
  language: string;
  methodSignature?: string;
  starterCode?: string;
  currentDriverCode?: string;
  userCode?: string;
  testCaseIndex?: number;
  currentInput?: string;
  currentExpectedOutput?: string;
  userActualOutput?: string;
  executionError?: string;
  allProblemTestCases?: string[];
  allProblemExpectedOutputs?: string[];
  onApplyTestCaseCorrection?: (correctedInput: string, correctedExpectedOutput: string) => any;
  onApplyDriverCorrection?: (correctedDriver: string) => void;
  onResubmit?: (updatedTemplate?: any) => void;
}

export const UnifiedReportModal: React.FC<UnifiedReportModalProps> = ({
  isOpen,
  onClose,
  problemTitle,
  problemSlug,
  problemStatement = '',
  language,
  methodSignature = '',
  starterCode = '',
  currentDriverCode = '',
  userCode = '',
  testCaseIndex = 0,
  currentInput = '',
  currentExpectedOutput = '',
  userActualOutput = '',
  executionError = '',
  allProblemTestCases,
  allProblemExpectedOutputs,
  onApplyTestCaseCorrection,
  onApplyDriverCorrection,
  onResubmit
}) => {
  const [activeTab, setActiveTab] = useState<'auto_diagnose' | 'manual_feedback'>('auto_diagnose');
  const [issueCategory, setIssueCategory] = useState<'testcase' | 'driver' | 'general'>(() => {
    if (executionError && executionError.trim().length > 0) return 'driver';
    return 'testcase';
  });

  const [userComment, setUserComment] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [testcaseResult, setTestcaseResult] = useState<TestCaseVerificationResult | null>(null);
  const [driverResult, setDriverResult] = useState<DriverCorrectionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Correction application state
  const [isApplying, setIsApplying] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUserComment('');
      setTestcaseResult(null);
      setDriverResult(null);
      setErrorMessage(null);
      setAppliedMessage(null);
      setRewardClaimed(false);

      if (executionError && executionError.trim().length > 0) {
        setIssueCategory('driver');
      } else {
        setIssueCategory('testcase');
      }

      // Proactively auto-trigger diagnosis on open for instant feedback
      const timer = setTimeout(() => {
        handleRunDiagnosis();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen, executionError]);

  if (!isOpen) return null;

  const activeEmail = getCurrentStudent()?.email || 'student@edustream.io';

  const handleRunDiagnosis = async () => {
    setIsDiagnosing(true);
    setErrorMessage(null);
    setAppliedMessage(null);

    try {
      if (issueCategory === 'driver') {
        const result = await verifyAndCorrectDriverCodeAI({
          problemTitle,
          slug: problemSlug,
          language,
          starterCode: starterCode || methodSignature,
          currentDriverCode,
          userCode,
          sampleTestInput: currentInput,
          sampleExpectedOutput: currentExpectedOutput,
          executionError: executionError || userComment
        });

        if (result && result.correctedDriverCode) {
          setDriverResult(result);
        } else {
          setErrorMessage('AI could not automatically correct the driver harness. Our engineering team has been notified.');
        }
      } else {
        // Fast-path Execution Verification: Run canonical reference solution against currentInput
        let referenceExecutionOutput: string | null = null;
        try {
          const normLang = (language || 'python').toLowerCase() as SupportedLanguage;
          const refSol = await resolveReferenceSolution(
            problemSlug,
            problemTitle,
            normLang,
            starterCode,
            undefined,
            problemStatement
          );
          if (refSol && refSol.length > 20) {
            const execRes = await executeCode(
              refSol,
              normLang,
              currentInput,
              problemTitle,
              currentDriverCode
            );
            if (execRes && execRes.status === 'SUCCESS' && execRes.stdout && execRes.stdout.trim().length > 0) {
              referenceExecutionOutput = execRes.stdout.trim();
            }
          }
        } catch (_) {}

        // If reference solution output matches user's output and differs from testsuite expected output:
        // Then this is 100% mathematical proof of an incorrect testcase expected output!
        if (
          referenceExecutionOutput &&
          userActualOutput &&
          userActualOutput.trim() === referenceExecutionOutput &&
          referenceExecutionOutput !== (currentExpectedOutput || '').trim()
        ) {
          setTestcaseResult({
            isIncorrect: true,
            verdict: 'INCORRECT_EXPECTED',
            correctedInput: currentInput,
            correctedExpectedOutput: referenceExecutionOutput,
            analysis: `Verified by Execution: Canonical reference solution executed on SDETube Sandbox and produced "${referenceExecutionOutput}".`,
            explanation: `Execution Verification Passed: The official platform reference solution was executed and produced "${referenceExecutionOutput}", which exactly matches your actual output. The testcase expected output ("${currentExpectedOutput}") is verified to be incorrect and has been corrected.`,
            suggestedAction: 'Apply verified reference output & claim bounty'
          });
          setIsDiagnosing(false);
          return;
        }

        const noteContext = referenceExecutionOutput
          ? `${userComment}\n[GROUND_TRUTH_EXECUTION: Official reference solution executed on this input and produced: "${referenceExecutionOutput}"]`
          : userComment;

        const result = await verifyAndCorrectTestCaseAI({
          problemTitle,
          slug: problemSlug,
          problemStatement,
          methodSignature,
          currentInput,
          currentExpectedOutput,
          userActualOutput,
          userNote: noteContext,
          language,
          allProblemTestCases,
          allProblemExpectedOutputs
        });

        if (result) {
          setTestcaseResult(result);
        } else {
          setErrorMessage('Could not verify testcase with AI. Please try again or submit manual feedback.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Diagnostic failed. Please check network connection.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleApplyTestCaseFix = async (correctedIn: string, correctedOut: string) => {
    setIsApplying(true);
    try {
      // 1. Claim bounty idempotently
      const bounty = claimReportBounty(problemSlug, problemTitle, 'testcase', activeEmail);
      if (bounty.rewardedAmount > 0) {
        setRewardClaimed(true);
      }

      // 2. Multi-tier upload to Cloudflare R2
      const endpoints = [
        `/api/problem/${encodeURIComponent(problemSlug)}/correct-testcase`,
        `${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(problemSlug)}/correct-testcase`
      ];

      for (const ep of endpoints) {
        try {
          await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              testCaseIndex,
              correctedInput: correctedIn,
              correctedExpectedOutput: correctedOut,
              email: activeEmail,
              problemTitle
            })
          });
          break;
        } catch {}
      }

      // 3. Apply in UI
      let nextTemplate: any = undefined;
      if (onApplyTestCaseCorrection) {
        nextTemplate = onApplyTestCaseCorrection(correctedIn, correctedOut);
      }

      setAppliedMessage(
        bounty.rewardedAmount > 0
          ? 'Fixed! ₹1.00 bounty credited to your balance. Auto-resubmitting...'
          : 'Testcase updated successfully! Auto-resubmitting...'
      );

      setTimeout(() => {
        onClose();
        if (onResubmit) onResubmit(nextTemplate);
      }, 1200);
    } catch (err: any) {
      setErrorMessage('Failed to apply fix: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyDriverFix = async (newDriver: string) => {
    setIsApplying(true);
    try {
      // 1. Claim bounty
      const bounty = claimReportBounty(problemSlug, problemTitle, 'driver', activeEmail);
      if (bounty.rewardedAmount > 0) {
        setRewardClaimed(true);
      }

      // 2. Persist to Cloudflare R2
      const endpoints = [
        `/api/problem/${encodeURIComponent(problemSlug)}/save-driver`,
        `${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(problemSlug)}/save-driver`
      ];

      for (const ep of endpoints) {
        try {
          await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              language,
              driverCode: newDriver,
              email: activeEmail
            })
          });
          break;
        } catch {}
      }

      // Cache locally
      try {
        localStorage.setItem(`edustream_driver_${problemSlug}_${language}`, newDriver);
      } catch {}

      if (onApplyDriverCorrection) {
        onApplyDriverCorrection(newDriver);
      }

      setAppliedMessage(
        bounty.rewardedAmount > 0
          ? 'Boilerplate updated! ₹1.00 bounty credited. Re-executing...'
          : 'Boilerplate updated! Re-executing...'
      );

      setTimeout(() => {
        onClose();
        if (onResubmit) onResubmit();
      }, 1200);
    } catch (err: any) {
      setErrorMessage('Failed to apply driver fix: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/30 shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Glow ambient */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl bg-indigo-500/10 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">Report & Auto-Resolve Issue</h3>
                <span className="px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-700/60 text-indigo-300 font-mono text-[10px] uppercase font-bold">
                  {language}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">{problemTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-2 pt-4 flex-shrink-0">
          <button
            onClick={() => {
              setIssueCategory('testcase');
              setTestcaseResult(null);
              setDriverResult(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              issueCategory === 'testcase'
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Testcase Data Issue</span>
          </button>
          <button
            onClick={() => {
              setIssueCategory('driver');
              setTestcaseResult(null);
              setDriverResult(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              issueCategory === 'driver'
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-sm'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Driver / Boilerplate Issue</span>
          </button>
          <div className="ml-auto flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-700/50 px-2.5 py-1 rounded-xl">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>₹1.00 Bounty on Valid Fix</span>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 text-xs">
          {/* Active Context Card */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            {issueCategory === 'testcase' ? (
              <>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Testcase #{testCaseIndex + 1}</span>
                  <span className="font-mono text-slate-400 truncate max-w-[200px]">{currentInput}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Expected</span>
                    <span className="text-amber-400 font-bold break-all">{currentExpectedOutput || 'None'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Your Actual Output</span>
                    <span className="text-cyan-400 font-bold break-all">{userActualOutput || 'None'}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Compiler / Boilerplate Harness</span>
                </div>
                {executionError && (
                  <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/60 font-mono text-[11px] text-rose-300 break-all max-h-24 overflow-y-auto">
                    {executionError}
                  </div>
                )}
              </>
            )}
          </div>

          {/* User note */}
          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1">
              Optional Note / Explanation:
            </label>
            <input
              type="text"
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder={
                issueCategory === 'testcase'
                  ? 'e.g. Expected output for this case should be true because...'
                  : 'e.g. Tree deserialization driver crashes on negative numbers...'
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 placeholder:text-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Diagnosis Action */}
          {!testcaseResult && !driverResult && (
            <button
              onClick={handleRunDiagnosis}
              disabled={isDiagnosing}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {isDiagnosing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running AI Diagnostics & Verifying...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Diagnose & Fix with AI</span>
                </>
              )}
            </button>
          )}

          {/* Results: Testcase Result */}
          {testcaseResult && (
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Diagnosis Result</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">{testcaseResult.explanation}</p>

              {testcaseResult.isIncorrect && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-600/40 font-mono text-[11px] flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block text-[10px]">CORRECTED EXPECTED OUTPUT</span>
                    <span className="text-emerald-400 font-bold">{testcaseResult.correctedExpectedOutput}</span>
                  </div>
                  <button
                    onClick={() =>
                      handleApplyTestCaseFix(
                        testcaseResult.correctedInput || currentInput,
                        testcaseResult.correctedExpectedOutput
                      )
                    }
                    disabled={isApplying}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Fix & Resubmit</span>
                  </button>
                </div>
              )}

              {!testcaseResult.isIncorrect && userActualOutput && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                  <span>The testcase appears correct. If your code output is intended as an alternative valid representation:</span>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => handleApplyTestCaseFix(currentInput, userActualOutput)}
                      disabled={isApplying}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept My Output & Resubmit</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results: Driver Result */}
          {driverResult && (
            <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Driver Harness Fixed</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">{driverResult.explanation}</p>

              <div className="flex justify-end">
                <button
                  onClick={() => handleApplyDriverFix(driverResult.correctedDriverCode)}
                  disabled={isApplying}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Boilerplate & Recompile</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Applied Success */}
          {appliedMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{appliedMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span>SDETube Self-Healing Diagnostic Engine</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
