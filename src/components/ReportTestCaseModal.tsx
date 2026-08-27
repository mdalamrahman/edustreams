import React, { useState, useEffect } from 'react';
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
  Check
} from 'lucide-react';
import {
  verifyAndCorrectTestCaseAI,
  TestCaseVerificationResult
} from '../lib/mistral';
import { TELEGRAM_BACKEND_URL } from '../lib/telegram';

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
  onApplyCorrection: (correctedInput: string, correctedExpectedOutput: string) => void;
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
  onApplyCorrection
}) => {
  const [userNote, setUserNote] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [aiResult, setAiResult] = useState<TestCaseVerificationResult | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAiResult(null);
      setUserNote('');
      setAppliedSuccess(false);
    }
  }, [isOpen, testCaseIndex, currentInput]);

  if (!isOpen) return null;

  const handleRunVerification = async () => {
    setIsVerifying(true);
    setAiResult(null);
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
        language: language || 'cpp'
      });
      setAiResult(result);
    } catch (e) {
      console.error('[Verify TestCase Error]:', e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleApply = async () => {
    if (!aiResult) return;
    let finalInput = (aiResult.correctedInput || currentInput || '').trim();
    const finalExpected = (aiResult.correctedExpectedOutput || currentExpectedOutput || '').trim();

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

    // 1. Sync to backend R2
    try {
      fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(problemSlug)}/correct-testcase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCaseIndex,
          correctedInput: finalInput,
          correctedExpectedOutput: finalExpected
        })
      }).catch(() => {});
    } catch (_) {}

    // 2. Apply in caller state & local overrides
    onApplyCorrection(finalInput, finalExpected);
    setAppliedSuccess(true);

    setTimeout(() => {
      onClose();
    }, 1200);
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
                <h3 className="text-base font-bold text-white">AI Testcase Inspector & Repair</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-[10px] font-bold text-indigo-300 font-mono">
                  Mistral Large
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
                <span>Selected Testcase Input (Case {testCaseIndex + 1})</span>
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
              <span>What seems incorrect? (Optional description for AI)</span>
            </label>
            <textarea
              rows={2}
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="e.g. Expected output true is wrong because matrix has 2 rows and target is not in bounds, or bracket is missing..."
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors resize-none placeholder:text-slate-600"
            />
          </div>

          {/* Trigger Verification Button */}
          {!aiResult && (
            <button
              onClick={handleRunVerification}
              disabled={isVerifying}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-600 via-indigo-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mistral Large AI is verifying problem constraints & computing true output...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Inspect & Verify Testcase with AI</span>
                </>
              )}
            </button>
          )}

          {/* AI Result Card */}
          {aiResult && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 shadow-lg ${
                  aiResult.isIncorrect
                    ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                    : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                }`}
              >
                {aiResult.isIncorrect ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {aiResult.isIncorrect ? 'Discrepancy Detected in Testcase' : 'Testcase Verified Correct'}
                  </h4>
                  <p className="text-xs mt-0.5 text-slate-300">
                    {aiResult.explanation}
                  </p>
                </div>
              </div>

              {/* Step-by-Step AI Trace */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  AI Mathematical Trace & Deduction
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {aiResult.analysis}
                </p>
              </div>

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
                      <span>AI Corrected Testcase</span>
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
                    onClick={handleApply}
                    disabled={appliedSuccess}
                    className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {appliedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Applied & Synced to Cloudflare R2!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Apply AI Correction to Workspace & Sync</span>
                      </>
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
                  onClick={onClose}
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
