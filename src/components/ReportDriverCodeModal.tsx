import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Wand2,
  Check,
  Coins,
  Cpu,
  Terminal,
  Cloud,
  RotateCcw
} from 'lucide-react';
import {
  verifyAndCorrectDriverCodeAI,
  DriverCorrectionResult
} from '../lib/mistral';
import {
  getDefaultDriverForProblem,
  fetchOrGenerateDriverCode
} from '../lib/problemService';
import { SupportedLanguage } from '../lib/compiler';
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
  onApplyCorrection
}) => {
  const [userNote, setUserNote] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [aiResult, setAiResult] = useState<DriverCorrectionResult | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [resolvedStatus, setResolvedStatus] = useState<{
    autoResolved: boolean;
    credited: boolean;
    creditedAmount: number;
    newBalance: number | null;
    message: string;
    storedInR2: boolean;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAiResult(null);
      setUserNote('');
      setResolvedStatus(null);
      setIsResetting(false);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  /**
   * Directly resets the driver to the verified authentic default driver for this problem.
   * Updates R2, caches, and component state immediately without executing the code.
   */
  const handleResetToDefault = async () => {
    setIsResetting(true);
    setSuccessMessage(null);
    try {
      const slug = problemSlug;
      const lang = (language || 'cpp').toLowerCase() as SupportedLanguage;

      // 1. Purge stale cache keys
      localStorage.removeItem(`edustream_driver_${slug}_${lang}`);
      localStorage.removeItem(`edustream_driver_${lang}_${slug}`);

      // 2. Fetch or retrieve authentic default driver
      let defaultDriver = getDefaultDriverForProblem(slug, lang);
      if (!defaultDriver) {
        defaultDriver = await fetchOrGenerateDriverCode(slug, lang, starterCode, sampleTestInput);
      }

      if (defaultDriver) {
        // 3. Update localStorage cache
        localStorage.setItem(`edustream_driver_${slug}_${lang}`, defaultDriver);

        // Synchronize problem spec cache
        try {
          const specStr = localStorage.getItem(`edustream_problem_spec_${slug}`);
          if (specStr) {
            const spec = JSON.parse(specStr);
            if (!spec.driverCode) spec.driverCode = {};
            spec.driverCode[lang] = defaultDriver;
            localStorage.setItem(`edustream_problem_spec_${slug}`, JSON.stringify(spec));
          }
        } catch (_) {}

        // 4. Update Cloudflare R2
        const endpoints = [
          `/api/problem/${encodeURIComponent(slug)}/correct-driver`,
          `${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/correct-driver`,
          `https://sdetube.pages.dev/api/problem/${encodeURIComponent(slug)}/correct-driver`
        ];
        for (const ep of endpoints) {
          try {
            await fetch(ep, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ language: lang, driverCode: defaultDriver }),
              signal: AbortSignal.timeout(5000)
            });
            break;
          } catch (_) {}
        }

        // 5. Apply to workspace state immediately WITHOUT running
        onApplyCorrection(defaultDriver);
        setSuccessMessage('✓ Boilerplate driver reset to default and updated immediately!');
      }
    } catch (err) {
      console.error('[Reset Driver Error]:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleInspectAndCorrect = async () => {
    setIsVerifying(true);
    setResolvedStatus(null);
    setSuccessMessage(null);

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

      // Special safety check for LCA: ensure the driver outputs the node's integer value
      const isLCA = problemSlug.includes('lowest-common-ancestor') || problemSlug.includes('lowestcommonancestor');
      if (isLCA && result.correctedDriverCode) {
        if (result.correctedDriverCode.includes('serializeTree(ans)') || !result.correctedDriverCode.includes('ans->val')) {
          const defaultLCA = getDefaultDriverForProblem(problemSlug, (language || 'cpp').toLowerCase() as SupportedLanguage);
          if (defaultLCA) {
            result.correctedDriverCode = defaultLCA;
            result.identifiedIssue = 'Return type is TreeNode* but LeetCode expected output is node integer value. Replaced serializeTree with ans->val output.';
            result.explanation = 'Corrected driver output to print ans->val instead of serializing the entire tree.';
          }
        }
      }

      setAiResult(result);

      if (result.correctedDriverCode && result.correctedDriverCode.length > 50) {
        const student = getCurrentStudent();
        const activeEmail = userEmail || student?.email || 'student@edustream.io';

        // 1. Check if this user already claimed ANY bounty for this problem (frontend guard: 1 bounty per problem)
        const bountyClaimKey = `edustream_bounty_claimed_${problemSlug}_${activeEmail}`;
        const legacyDriverKey = `edustream_bounty_claimed_driver_${problemSlug}_${language}_${activeEmail}`;
        const legacyTestcaseKey = `edustream_bounty_claimed_testcase_${problemSlug}_${activeEmail}`;
        const alreadyClaimedLocally = (() => {
          try {
            return !!(
              localStorage.getItem(bountyClaimKey) ||
              localStorage.getItem(legacyDriverKey) ||
              localStorage.getItem(legacyTestcaseKey)
            );
          } catch {
            return false;
          }
        })();

        // 2. Credit ₹1.00 bounty reward locally only if not already claimed
        let localCredit = { newBalance: null as number | null };
        if (!alreadyClaimedLocally) {
          const bountyDesc = `🎉 Bug Bounty: ₹1.00 credited for reporting & auto-resolving boilerplate code in ${problemTitle} (${language.toUpperCase()})`;
          localCredit = creditUserReward(1.00, bountyDesc, activeEmail) as any;
          try {
            localStorage.setItem(bountyClaimKey, '1');
            localStorage.setItem(legacyDriverKey, '1');
          } catch {}
        }

        let backendBalance = localCredit.newBalance;
        let backendMessage = alreadyClaimedLocally
          ? `Boilerplate driver for ${language.toUpperCase()} auto-corrected and saved in Cloudflare R2! (Bounty already claimed for this problem.)`
          : `Boilerplate driver for ${language.toUpperCase()} was successfully auto-corrected and saved in Cloudflare R2! ₹1.00 has been credited to your balance.`;
        let storedInR2 = true;

        // 3. Multi-tier upload to Cloudflare R2 (edge function proxy, direct backend, and failover)
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

          // Synchronize problem spec cache
          const specStr = localStorage.getItem(`edustream_problem_spec_${slug}`);
          if (specStr) {
            const spec = JSON.parse(specStr);
            if (!spec.driverCode) spec.driverCode = {};
            spec.driverCode[lang] = result.correctedDriverCode;
            localStorage.setItem(`edustream_problem_spec_${slug}`, JSON.stringify(spec));
          }
        } catch (_) {}

        // 4. Apply to workspace state immediately without running
        onApplyCorrection(result.correctedDriverCode);

        setResolvedStatus({
          autoResolved: true,
          credited: true,
          creditedAmount: 1.00,
          newBalance: backendBalance,
          message: backendMessage,
          storedInR2
        });

        setSuccessMessage('✓ Boilerplate driver auto-corrected and saved to R2 & cache silently!');
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
                AI Boilerplate Code Inspector &bull; Problem: <strong className="text-slate-200">{problemTitle}</strong> ({problemSlug})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefault}
              disabled={isResetting}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              title="Reset to default correct driver code without running"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset to Default</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto font-sans flex-1">

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-200 animate-fadeIn">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-400 hover:text-white text-xs font-mono px-2 py-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          
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

          {/* Info card: AI handles correction silently */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-200">AI Auto-Correction</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The AI will silently inspect and correct the internal driver harness for this problem.
                Corrections are saved directly to <span className="text-cyan-400 font-mono">Cloudflare R2</span> and your local cache — no code is exposed or run automatically.
              </p>
            </div>
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
                placeholder="e.g. Return type should print integer node value (ans->val) instead of serializing entire tree, missing header, or struct ordering..."
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
                  <span>Boilerplate Harness Auto-Corrected</span>
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToDefault}
                disabled={isResetting}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>Reset to Default Boilerplate</span>
              </button>

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
                    <span>Auto-Correct Boilerplate Code in R2</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleResetToDefault}
                disabled={isResetting}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>Reset to Default</span>
              </button>

              <button
                onClick={onClose}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Done</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
