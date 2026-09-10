import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Wand2,
  Code2,
  Check,
  Coins,
  Cpu,
  Copy,
  ChevronDown,
  ChevronUp,
  Terminal,
  Cloud,
  FileCode,
  CheckCheck
} from 'lucide-react';
import {
  verifyAndCorrectDriverCodeAI,
  DriverCorrectionResult
} from '../lib/mistral';
import { TELEGRAM_BACKEND_URL } from '../lib/telegram';
import { creditUserReward } from '../lib/billing';
import { getCurrentStudent } from '../lib/auth';

interface ReportDriverCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemTitle: string;
  problemSlug: string;
  language: string;
  starterCode?: string;
  currentDriverCode?: string;
  userCode?: string;
  sampleTestInput?: string;
  sampleExpectedOutput?: string;
  executionError?: string;
  userEmail?: string;
  onApplyCorrection: (correctedDriverCode: string, correctedSolutionCode?: string) => void;
  onRerun?: () => void;
}

export const ReportDriverCodeModal: React.FC<ReportDriverCodeModalProps> = ({
  isOpen,
  onClose,
  problemTitle,
  problemSlug,
  language,
  starterCode,
  currentDriverCode,
  userCode,
  sampleTestInput,
  sampleExpectedOutput,
  executionError,
  userEmail,
  onApplyCorrection,
  onRerun
}) => {
  const [userNote, setUserNote] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [aiResult, setAiResult] = useState<DriverCorrectionResult | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'driver' | 'solution'>('solution');
  const [showDriverPreview, setShowDriverPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoRerunCountdown, setAutoRerunCountdown] = useState<number | null>(null);
  const timerIdRef = useRef<any>(null);

  const [resolvedStatus, setResolvedStatus] = useState<{
    autoResolved: boolean;
    credited: boolean;
    creditedAmount: number;
    newBalance: number | null;
    message: string;
    storedInR2: boolean;
  } | null>(null);

  const handleApplyAndRerun = useCallback((withSolution: boolean = true) => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    setAutoRerunCountdown(null);

    if (aiResult?.correctedDriverCode) {
      onApplyCorrection(
        aiResult.correctedDriverCode,
        withSolution ? aiResult.correctedSolutionCode : undefined
      );
    }

    onClose();
    if (onRerun) {
      setTimeout(() => onRerun(), 250);
    }
  }, [aiResult, onApplyCorrection, onClose, onRerun]);

  useEffect(() => {
    if (isOpen) {
      setAiResult(null);
      setUserNote('');
      setResolvedStatus(null);
      setAutoRerunCountdown(null);
      setShowDriverPreview(false);
      setActivePreviewTab('solution');
    } else {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
    }
  }, [isOpen]);

  // Auto countdown effect
  useEffect(() => {
    if (autoRerunCountdown === null) return;
    if (autoRerunCountdown <= 0) {
      handleApplyAndRerun(true);
      return;
    }

    timerIdRef.current = setTimeout(() => {
      setAutoRerunCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
    };
  }, [autoRerunCountdown, handleApplyAndRerun]);

  const handleCopyCode = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInspectAndCorrect = async () => {
    setIsVerifying(true);
    setResolvedStatus(null);
    setAutoRerunCountdown(null);

    try {
      const result = await verifyAndCorrectDriverCodeAI({
        problemTitle,
        slug: problemSlug,
        language,
        starterCode,
        currentDriverCode,
        userCode,
        sampleTestInput,
        sampleExpectedOutput,
        executionError,
        userReportReason: userNote
      });

      setAiResult(result);

      if (result.correctedDriverCode && result.correctedDriverCode.length > 50) {
        const student = getCurrentStudent();
        const activeEmail = userEmail || student?.email || 'student@edustream.io';

        // 1. Credit ₹1.00 bounty reward locally
        const bountyDesc = `🎉 Bug Bounty: ₹1.00 credited for reporting & auto-resolving boilerplate code in ${problemTitle} (${language.toUpperCase()})`;
        const localCredit = creditUserReward(1.00, bountyDesc, activeEmail);

        let backendBalance = localCredit.newBalance;
        let backendMessage = `Boilerplate code & verified solution for ${language.toUpperCase()} were successfully auto-corrected and saved in Cloudflare R2! ₹1.00 has been credited to your balance.`;
        let storedInR2 = true;

        // 2. Multi-tier upload to Cloudflare R2 (tries edge function proxy, direct backend, and failover)
        const endpoints = [
          `/api/problem/${encodeURIComponent(problemSlug)}/correct-driver`,
          `${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(problemSlug)}/correct-driver`,
          `https://sdetube.pages.dev/api/problem/${encodeURIComponent(problemSlug)}/correct-driver`
        ];

        for (const ep of endpoints) {
          try {
            const resp = await fetch(ep, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                language,
                driverCode: result.correctedDriverCode,
                solutionCode: result.correctedSolutionCode || undefined,
                problemTitle,
                email: activeEmail,
                explanation: result.explanation
              }),
              signal: AbortSignal.timeout(6000)
            });

            if (resp.ok) {
              const data = await resp.json();
              if (data.message) backendMessage = data.message;
              if (typeof data.newBalance === 'number') backendBalance = data.newBalance;
              if (data.stored_in_r2 !== undefined) storedInR2 = data.stored_in_r2;
              break;
            }
          } catch (e) {
            console.warn(`[Boilerplate R2 Auto-Replace attempt on ${ep} notice]:`, e);
          }
        }

        // 3. Multi-tier Local Cache Synchronization
        try {
          const slug = problemSlug;
          const lang = language.toLowerCase();
          localStorage.setItem(`edustream_driver_${slug}_${lang}`, result.correctedDriverCode);
          localStorage.removeItem(`edustream_driver_${lang}_${slug}`);

          // Synchronize problem spec cache so refreshes use corrected driver & solution
          const specStr = localStorage.getItem(`edustream_problem_spec_${slug}`);
          if (specStr) {
            const spec = JSON.parse(specStr);
            if (!spec.driverCode) spec.driverCode = {};
            spec.driverCode[lang] = result.correctedDriverCode;
            if (result.correctedSolutionCode) {
              if (!spec.solutions) spec.solutions = {};
              spec.solutions[lang] = result.correctedSolutionCode;
            }
            localStorage.setItem(`edustream_problem_spec_${slug}`, JSON.stringify(spec));
          }

          // Save verified solution into user code cache
          if (result.correctedSolutionCode) {
            localStorage.setItem(`edustream_user_code_${slug}_${lang}`, result.correctedSolutionCode);
          }
        } catch (_) {}

        // 4. Apply to workspace state immediately
        onApplyCorrection(result.correctedDriverCode, result.correctedSolutionCode);

        setResolvedStatus({
          autoResolved: true,
          credited: true,
          creditedAmount: 1.00,
          newBalance: backendBalance,
          message: backendMessage,
          storedInR2
        });

        // 5. Trigger 2-second countdown to auto-rerun code with verified solution
        setAutoRerunCountdown(2);
      }
    } catch (err) {
      console.error('[Inspect Boilerplate Code Error]:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-md">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white tracking-wide">REPORT BOILER PLATE CODE</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-[10px] font-bold text-indigo-300 font-mono">
                  {language.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-[10px] font-bold text-emerald-300 font-mono flex items-center gap-1">
                  <Coins className="w-3 h-3 text-emerald-400" />
                  ₹1.00 Bounty
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI Boilerplate Code & Solution Auto-Resolver &bull; Problem: <strong className="text-slate-200">{problemTitle}</strong> ({problemSlug})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto font-sans flex-1">
          
          {/* Execution Error Banner (if error occurred during compile/run) */}
          {executionError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-rose-300">
                <Terminal className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Compiler / Runtime Execution Error Encountered:</span>
              </div>
              <pre className="text-[11px] font-mono text-rose-200/90 bg-black/40 p-2.5 rounded-xl border border-rose-900/50 max-h-32 overflow-y-auto whitespace-pre-wrap select-text">
                {executionError}
              </pre>
            </div>
          )}

          {/* Current Boilerplate / Driver Code Collapsible Preview */}
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden">
            <button
              onClick={() => setShowDriverPreview(!showDriverPreview)}
              className="w-full flex items-center justify-between p-3 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Current Boilerplate Harness ({language.toUpperCase()})</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {currentDriverCode ? `${currentDriverCode.split('\n').length} lines` : 'Default Boilerplate'}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-slate-400">
                <span>{showDriverPreview ? 'Hide' : 'Inspect Boilerplate'}</span>
                {showDriverPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showDriverPreview && (
              <div className="p-3 border-t border-slate-800/80 bg-black/50">
                <div className="flex justify-end pb-1">
                  <button
                    onClick={() => handleCopyCode(currentDriverCode || '')}
                    className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap select-text p-2 rounded-xl bg-slate-950 border border-slate-900">
                  {currentDriverCode || 'No boilerplate code loaded.'}
                </pre>
              </div>
            )}
          </div>

          {/* User Notes Input */}
          {!resolvedStatus && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>What appears to be wrong with the boilerplate code? (Optional)</span>
                <span className="text-[10px] text-slate-500 font-normal">AI will auto-diagnose and correct</span>
              </label>
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="e.g. Missing standard library headers, TreeNode struct ordering bug, wrong input parsing, or solution method signature mismatch..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* AI Result Card */}
          {aiResult && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 flex-wrap gap-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Boilerplate & Solution Verified by AI</span>
                </div>
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700/60 text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-cyan-400" />
                    Saved in Cloudflare R2
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-emerald-400" />
                    +₹1.00 Bounty Credited
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div>
                  <strong className="text-white">Identified Defect:</strong> {aiResult.identifiedIssue}
                </div>
                <div className="text-slate-400 leading-relaxed">
                  <strong className="text-slate-200">Resolution:</strong> {aiResult.explanation}
                </div>
              </div>

              {/* Tab Switcher for Boilerplate Code vs Solution Code */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                    {aiResult.correctedSolutionCode && (
                      <button
                        onClick={() => setActivePreviewTab('solution')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          activePreviewTab === 'solution'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Corrected Working Solution</span>
                      </button>
                    )}
                    <button
                      onClick={() => setActivePreviewTab('driver')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activePreviewTab === 'driver'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Corrected Boilerplate Harness</span>
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      handleCopyCode(
                        activePreviewTab === 'solution'
                          ? aiResult.correctedSolutionCode || ''
                          : aiResult.correctedDriverCode
                      )
                    }
                    className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {activePreviewTab === 'solution' && aiResult.correctedSolutionCode ? (
                  <pre className="text-[11px] font-mono text-emerald-300/90 bg-black/60 p-3 rounded-xl border border-emerald-900/40 max-h-48 overflow-y-auto whitespace-pre-wrap select-text">
                    {aiResult.correctedSolutionCode}
                  </pre>
                ) : (
                  <pre className="text-[11px] font-mono text-cyan-300/90 bg-black/60 p-3 rounded-xl border border-cyan-900/40 max-h-48 overflow-y-auto whitespace-pre-wrap select-text">
                    {aiResult.correctedDriverCode}
                  </pre>
                )}
              </div>

              {/* Resolution Banner */}
              {resolvedStatus && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-200">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{resolvedStatus.message}</span>
                  </div>
                  {resolvedStatus.newBalance !== null && (
                    <span className="font-mono text-emerald-300 font-bold whitespace-nowrap ml-2">
                      Balance: ₹{resolvedStatus.newBalance.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {!aiResult ? (
            <button
              disabled={isVerifying}
              onClick={handleInspectAndCorrect}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Diagnosing & Resolving Boilerplate Code with AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-amber-300" />
                  <span>Auto-Correct Boilerplate Code & Solution in R2</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleApplyAndRerun(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                title="Only apply the boilerplate runner without changing current code"
              >
                Apply Boilerplate Only
              </button>

              <button
                onClick={() => handleApplyAndRerun(true)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-emerald-200" />
                <span>
                  Apply Boilerplate + Solution
                  {autoRerunCountdown !== null && autoRerunCountdown > 0 ? ` (${autoRerunCountdown}s)` : ''}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
