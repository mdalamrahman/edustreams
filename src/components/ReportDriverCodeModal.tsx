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
  Cloud
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
  onApplyCorrection: (correctedDriverCode: string) => void;
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

  const handleApplyAndRerun = useCallback(() => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    setAutoRerunCountdown(null);
    onClose();
    if (onRerun) {
      setTimeout(() => onRerun(), 250);
    }
  }, [onClose, onRerun]);

  useEffect(() => {
    if (isOpen) {
      setAiResult(null);
      setUserNote('');
      setResolvedStatus(null);
      setAutoRerunCountdown(null);
      setShowDriverPreview(false);
    } else {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
    }
  }, [isOpen]);

  // Countdown effect
  useEffect(() => {
    if (autoRerunCountdown === null) return;
    if (autoRerunCountdown <= 0) {
      handleApplyAndRerun();
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
        const bountyDesc = `🎉 Bug Bounty: ₹1.00 credited for finding and resolving driver code defect in ${problemTitle} (${language.toUpperCase()})`;
        const localCredit = creditUserReward(1.00, bountyDesc, activeEmail);

        let backendBalance = localCredit.newBalance;
        let backendMessage = `Driver harness for ${language.toUpperCase()} was successfully corrected and replaced in Cloudflare R2! ₹1.00 has been credited to your balance.`;
        let storedInR2 = true;

        // 2. Call backend to update Cloudflare R2 and record bounty in DB
        try {
          const resp = await fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(problemSlug)}/correct-driver`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              language,
              driverCode: result.correctedDriverCode,
              problemTitle,
              email: activeEmail,
              explanation: result.explanation
            })
          });

          if (resp.ok) {
            const data = await resp.json();
            if (data.message) backendMessage = data.message;
            if (typeof data.newBalance === 'number') backendBalance = data.newBalance;
            if (data.stored_in_r2 !== undefined) storedInR2 = data.stored_in_r2;
          }
        } catch (e) {
          console.warn('[Driver R2 Auto-Replace Notice]:', e);
        }

        // 3. Update localStorage so client uses the corrected driver immediately
        try {
          const localKey = `edustream_driver_${problemSlug}_${language.toLowerCase()}`;
          localStorage.setItem(localKey, result.correctedDriverCode);
        } catch (_) {}

        // 4. Apply to workspace state
        onApplyCorrection(result.correctedDriverCode);

        setResolvedStatus({
          autoResolved: true,
          credited: true,
          creditedAmount: 1.00,
          newBalance: backendBalance,
          message: backendMessage,
          storedInR2
        });

        // 5. Trigger 2-second countdown to auto-rerun solution
        setAutoRerunCountdown(2);
      }
    } catch (err) {
      console.error('[Inspect Driver Code Error]:', err);
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
                <h3 className="text-base font-bold text-white">AI Driver Code Inspector & Auto-Resolver</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-[10px] font-bold text-indigo-300 font-mono">
                  {language.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-[10px] font-bold text-emerald-300 font-mono flex items-center gap-1">
                  <Coins className="w-3 h-3 text-emerald-400" />
                  ₹1 Bounty
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Problem: <strong className="text-slate-200">{problemTitle}</strong> ({problemSlug})
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

          {/* Current Driver Code Collapsible Preview */}
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden">
            <button
              onClick={() => setShowDriverPreview(!showDriverPreview)}
              className="w-full flex items-center justify-between p-3 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Current Driver Execution Harness ({language.toUpperCase()})</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {currentDriverCode ? `${currentDriverCode.split('\n').length} lines` : 'Default Driver'}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-slate-400">
                <span>{showDriverPreview ? 'Hide' : 'Inspect Code'}</span>
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
                  {currentDriverCode || 'No driver harness loaded.'}
                </pre>
              </div>
            )}
          </div>

          {/* User Notes Input */}
          {!resolvedStatus && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>What appears to be wrong with the driver harness? (Optional)</span>
                <span className="text-[10px] text-slate-500 font-normal">AI will auto-diagnose errors</span>
              </label>
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="e.g. Missing #include <queue>, segmentation fault when deserializing binary tree, or output matrix format doesn't match..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* AI Result Card */}
          {aiResult && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Defect Identified & Replaced by AI</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700/60 text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-cyan-400" />
                    Replaced in Cloudflare R2
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-emerald-400" />
                    +₹1.00 Bounty Credited
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div>
                  <strong className="text-white">Issue:</strong> {aiResult.identifiedIssue}
                </div>
                <div className="text-slate-400 leading-relaxed">
                  <strong className="text-slate-200">Fix Summary:</strong> {aiResult.explanation}
                </div>
              </div>

              {/* Corrected Driver Code Preview */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-cyan-300">New Type-Safe Driver Code:</span>
                  <button
                    onClick={() => handleCopyCode(aiResult.correctedDriverCode)}
                    className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-emerald-300/90 bg-black/60 p-2.5 rounded-xl border border-emerald-900/40 max-h-44 overflow-y-auto whitespace-pre-wrap select-text">
                  {aiResult.correctedDriverCode}
                </pre>
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
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
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
                  <span>Diagnosing & Hardening Driver with AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-amber-300" />
                  <span>Inspect & Correct Driver in R2</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleApplyAndRerun}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                Apply & Rerun Code
                {autoRerunCountdown !== null && autoRerunCountdown > 0 ? ` (${autoRerunCountdown}s)` : ''}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
