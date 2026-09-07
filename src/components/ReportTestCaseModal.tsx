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
  MessageSquare,
  Wand2,
  Code2,
  Check,
  Coins,
  Play,
  Layers
} from 'lucide-react';
import {
  verifyAndCorrectTestCaseAI,
  TestCaseVerificationResult,
  MultiTestCaseOption
} from '../lib/mistral';
import { TELEGRAM_BACKEND_URL } from '../lib/telegram';
import { creditUserReward } from '../lib/billing';
import { getCurrentStudent } from '../lib/auth';

interface ReportTestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemTitle: string;
  problemSlug: string;
  problemStatement: string;
  methodSignature?: string;
  testCaseIndex: number;
  currentInput: string;
  currentExpectedOutput?: string;
  userActualOutput?: string;
  language?: string;
  userEmail?: string;
  allProblemTestCases?: string[];
  allProblemExpectedOutputs?: string[];
  onApplyCorrection: (correctedInput: string, correctedExpectedOutput: string) => any;
  onResubmit?: (updatedTemplate?: any) => void;
}

export const ReportTestCaseModal: React.FC<ReportTestCaseModalProps> = ({
  isOpen,
  onClose,
  problemTitle,
  problemSlug,
  problemStatement,
  methodSignature,
  testCaseIndex,
  currentInput,
  currentExpectedOutput,
  userActualOutput,
  language,
  userEmail,
  allProblemTestCases,
  allProblemExpectedOutputs,
  onApplyCorrection,
  onResubmit
}) => {
  const [userNote, setUserNote] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [aiResult, setAiResult] = useState<TestCaseVerificationResult | null>(null);
  const [autoResubmitCountdown, setAutoResubmitCountdown] = useState<number | null>(null);
  const latestUpdatedTemplateRef = useRef<any>(null);
  const timerIdRef = useRef<any>(null);

  const [resolvedStatus, setResolvedStatus] = useState<{
    autoResolved: boolean;
    credited: boolean;
    creditedAmount: number;
    newBalance: number | null;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAiResult(null);
      setUserNote('');
      setResolvedStatus(null);
      setAutoResubmitCountdown(null);
      latestUpdatedTemplateRef.current = null;
    } else {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      setAutoResubmitCountdown(null);
    }
  }, [isOpen, testCaseIndex, currentInput]);

  useEffect(() => {
    if (autoResubmitCountdown === null) return;
    if (autoResubmitCountdown <= 0) {
      handleResubmit();
      return;
    }
    timerIdRef.current = setTimeout(() => {
      setAutoResubmitCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [autoResubmitCountdown]);

  if (!isOpen) return null;

  const handleRunVerification = async () => {
    setIsVerifying(true);
    setAiResult(null);
    setResolvedStatus(null);

    try {
      const result = await verifyAndCorrectTestCaseAI({
        slug: problemSlug,
        problemTitle,
        problemStatement,
        methodSignature,
        currentInput,
        currentExpectedOutput,
        userActualOutput,
        userNote: userNote.trim(),
        language: language || 'cpp',
        allProblemTestCases,
        allProblemExpectedOutputs
      });

      setAiResult(result);

      // If an issue was detected, automatically auto-resolve on backend & credit ₹1 to user
      if (result.isIncorrect) {
        let finalInput = (result.correctedInput || currentInput || '').trim();
        const finalExpected = (result.correctedExpectedOutput || currentExpectedOutput || '').trim();

        // Deterministic fallback: If input lacks '=', auto-prefix parameter name
        if (!finalInput.includes('=')) {
          let pName = 'grid';
          const m = (methodSignature || '').match(/(?:int|void|bool|vector<[^>]+>|string|double|List<[^>]+>)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*(?:self\s*,\s*)?(?:const\s+)?[a-zA-Z0-9_<>,:\[\]\s\*&]+?\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\)/);
          if (m && m[2]) {
            pName = m[2];
          } else {
            const simpleMatch = (methodSignature || '').match(/\(\s*(?:self\s*,\s*)?([a-zA-Z_][a-zA-Z0-9_]*)\s*[:\)]/);
            if (simpleMatch && simpleMatch[1]) pName = simpleMatch[1];
          }
          finalInput = `${pName} = ${finalInput}`;
        }

        const student = getCurrentStudent();
        const activeEmail = userEmail || student?.email || 'student@edustream.io';

        // 1. Credit ₹1.00 bounty reward locally
        const bountyDesc = `🎉 Bug Bounty: ₹1.00 credited for finding and auto-resolving testcase issue in ${problemTitle}`;
        const localCredit = creditUserReward(1.00, bountyDesc, activeEmail);

        // 2. Call backend to auto-resolve problem in R2 + memory cache and record credit in DB
        let backendMessage = result.verdict === 'MULTIPLE_VALID_OUTPUTS'
          ? "Multiple valid BST structures detected! Testcase updated to accept valid solutions. ₹1 credited to balance. Auto-resubmitting..."
          : "Your reported issue was found correct! It has been resolved. ₹1 has been credited to your balance. Auto-resubmitting your solution...";
        let backendBalance = localCredit.newBalance;

        try {
          const resp = await fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(problemSlug)}/correct-testcase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              testCaseIndex,
              correctedInput: finalInput,
              correctedExpectedOutput: finalExpected,
              email: activeEmail,
              problemTitle
            })
          });
          if (resp.ok) {
            const resData = await resp.json();
            if (resData.message) backendMessage = resData.message;
            if (typeof resData.newBalance === 'number') backendBalance = resData.newBalance;
          }
        } catch (e) {
          console.warn('[Auto-Resolve Backend Notice]:', e);
        }

        // 3. Apply correction in the workspace and retain latest template
        const updatedTpl = onApplyCorrection(finalInput, finalExpected);
        latestUpdatedTemplateRef.current = updatedTpl;

        setResolvedStatus({
          autoResolved: true,
          credited: true,
          creditedAmount: 1.00,
          newBalance: backendBalance,
          message: backendMessage
        });

        // 4. Trigger auto-resubmit countdown (2 seconds for clear feedback and smooth UX)
        setAutoResubmitCountdown(2);
      }
    } catch (e) {
      console.error('[Verify TestCase Error]:', e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResubmit = () => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    setAutoResubmitCountdown(null);
    onClose();
    if (onResubmit) {
      onResubmit(latestUpdatedTemplateRef.current);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-md">
              <Wand2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AI Testcase Inspector & Auto-Resolver</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-[10px] font-bold text-indigo-300 font-mono">
                  Mistral Large
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-[10px] font-bold text-emerald-300 font-mono flex items-center gap-1">
                  <Coins className="w-3 h-3 text-emerald-400" />
                  ₹1 Bounty
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Problem: <strong className="text-slate-200">{problemTitle}</strong> (Case {testCaseIndex + 1})
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

          {/* Current Test Case Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>Reported Testcase Input (Case {testCaseIndex + 1})</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Index {testCaseIndex}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
              {currentInput}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Expected Output</span>
                <p className="font-mono font-bold text-indigo-300 truncate">
                  {currentExpectedOutput || '(None specified)'}
                </p>
              </div>

              {userActualOutput && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Your Actual Output</span>
                  <p className="font-mono font-bold text-amber-300 truncate">
                    {userActualOutput}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User Feedback / Note Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Suspect this testcase or expected output is wrong? (Optional description for AI)</span>
            </label>
            <textarea
              rows={2}
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="e.g. For nums=[1,1,1], duplicate subsets should be deduplicated to [[],[1],[1,1],[1,1,1]], or parameter prefix is missing..."
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors resize-none placeholder:text-slate-600"
            />
          </div>

          {/* Trigger Verification Button */}
          {!aiResult && (
            <button
              onClick={handleRunVerification}
              disabled={isVerifying}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-600 via-indigo-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Verifying algorithm constraints & auto-resolving testcase from backend...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>Verify & Auto-Resolve with AI (Earn ₹1 Bounty)</span>
                </>
              )}
            </button>
          )}

          {/* AI Result Card */}
          {aiResult && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Auto-Resolved / Verdict Banner */}
              {aiResult.isIncorrect && resolvedStatus ? (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-slate-900 border-2 border-emerald-500/80 text-emerald-100 shadow-xl shadow-emerald-950/50 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/90 border border-emerald-500 text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          Auto-Resolved from Backend
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-500 text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          +₹1.00 Credited to Balance
                        </span>
                        {autoResubmitCountdown !== null && (
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-950/90 border border-teal-400 text-teal-300 font-mono text-[11px] font-bold flex items-center gap-1 animate-pulse">
                            <RefreshCw className="w-3 h-3 text-teal-400 animate-spin" />
                            Auto-Resubmitting ({autoResubmitCountdown}s)
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-emerald-100 leading-snug">
                        {resolvedStatus.message}
                      </p>
                      {resolvedStatus.newBalance !== null && (
                        <p className="text-xs text-emerald-300/90 font-mono pt-1">
                          New Wallet Balance: <strong className="text-white font-bold">₹{resolvedStatus.newBalance.toFixed(2)}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border flex items-start gap-3 shadow-lg bg-emerald-950/40 border-emerald-500/60 text-emerald-200">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Testcase Verified Correct
                    </h4>
                    <p className="text-xs mt-0.5 text-slate-300">
                      {aiResult.explanation}
                    </p>
                  </div>
                </div>
              )}

              {/* Step-by-Step AI Trace */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  AI Mathematical Trace & Deduction
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {aiResult.analysis}
                </p>
              </div>

              {/* Multiple Valid Testcase Options Detected Card */}
              {(aiResult.hasMultipleValidOutputs || (aiResult.allTestCasesOptions && aiResult.allTestCasesOptions.length > 0)) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border-2 border-purple-500/60 shadow-xl space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-sm">
                        <Layers className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <span>Multiple Correct Testcase Solutions Possible</span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-900/80 border border-purple-500/70 text-[10px] text-purple-300 font-mono">
                            Special Judge
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          AI evaluated this question and confirmed multiple mathematically valid testcase outputs exist.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* List of All Testcases available for this question */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                      <span>Available Testcases & Valid Output Options for Question:</span>
                      <span className="text-slate-400 font-mono">
                        {(aiResult.allTestCasesOptions || []).length} Question Testcases
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                      {(aiResult.allTestCasesOptions && aiResult.allTestCasesOptions.length > 0
                        ? aiResult.allTestCasesOptions
                        : [{
                            caseIndex: testCaseIndex,
                            input: currentInput,
                            validOptions: aiResult.validOutputOptions || [aiResult.correctedExpectedOutput],
                            description: "Valid options detected by AI"
                          }]
                      ).map((item: MultiTestCaseOption, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/90 border border-purple-900/40 space-y-2">
                          <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                            <span className="font-bold text-slate-200 flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-700/50 text-[10px] font-mono text-purple-300">
                                Case {item.caseIndex + 1}
                              </span>
                              <code className="text-slate-300 font-mono text-[11px] font-normal">{item.input}</code>
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                              {item.validOptions.length} acceptable {item.validOptions.length === 1 ? 'option' : 'options'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {item.validOptions.map((opt: string, oIdx: number) => (
                              <div key={oIdx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono flex items-start gap-1.5">
                                <span className="text-purple-400 font-bold flex-shrink-0">Option {oIdx + 1}:</span>
                                <span className="text-emerald-300 break-all">{opt}</span>
                              </div>
                            ))}
                          </div>

                          {item.description && (
                            <p className="text-[10px] text-slate-400 italic pt-0.5">
                              💡 {item.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Before vs Corrected Diff */}
              {aiResult.isIncorrect && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Before */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Original Testcase</span>
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 font-mono text-[11px] text-slate-300 space-y-1">
                      <p><strong className="text-slate-400">Input:</strong> {currentInput}</p>
                      <p><strong className="text-slate-400">Expected:</strong> {currentExpectedOutput || 'N/A'}</p>
                    </div>
                  </div>

                  {/* After */}
                  <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Auto-Fixed Testcase (Cloudflare R2 Synced)</span>
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 font-mono text-[11px] text-emerald-200 space-y-1 border border-emerald-500/20">
                      <p><strong className="text-emerald-400">Input:</strong> {aiResult.correctedInput}</p>
                      <p><strong className="text-emerald-400">Expected:</strong> {aiResult.correctedExpectedOutput}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {aiResult.isIncorrect ? (
                  <button
                    onClick={handleResubmit}
                    className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <Play className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
                    <span>
                      {autoResubmitCountdown !== null && autoResubmitCountdown > 0
                        ? `Auto-Resubmitting in ${autoResubmitCountdown}s... (Click to Resubmit Now)`
                        : 'Resubmit Solution Now 🚀'}
                    </span>
                    {autoResubmitCountdown !== null && autoResubmitCountdown > 0 && (
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-mono font-bold animate-pulse">
                        {autoResubmitCountdown}
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleRunVerification}
                    className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-verify with Custom Note</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (timerIdRef.current) {
                      clearTimeout(timerIdRef.current);
                      timerIdRef.current = null;
                    }
                    setAutoResubmitCountdown(null);
                    onClose();
                  }}
                  className="py-2.5 px-5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
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
