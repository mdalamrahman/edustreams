import { useEffect, useRef, useState } from 'react';
import { Flag, X } from 'lucide-react';
import { apiFetch } from '../lib/apiFetch';
import { repositoryConfig } from '../lib/repositoryConfig';

interface ReportProps {
  isOpen: boolean;
  onClose: () => void;
  problemTitle: string;
  problemSlug: string;
  language: string;
  userCode?: string;
  currentInput?: string;
  currentExpectedOutput?: string;
  userActualOutput?: string;
  executionError?: string;
}

type Category = 'testcase' | 'driver' | 'problem' | 'solution';

export function UnifiedReportModal({ isOpen, onClose, problemTitle, problemSlug, language, userCode, currentInput, currentExpectedOutput, userActualOutput, executionError }: ReportProps) {
  const [category, setCategory] = useState<Category>('problem');
  const [testInput, setTestInput] = useState('');
  const [note, setNote] = useState('');
  const [shareCode, setShareCode] = useState(false);
  const [pending, setPending] = useState(false);
  const [reportId, setReportId] = useState('');
  const [error, setError] = useState('');
  const requestId = useRef('');

  useEffect(() => {
    if (!isOpen) return;
    setCategory(executionError ? 'driver' : currentInput ? 'testcase' : 'problem');
    setTestInput(currentInput || '');
    setNote('');
    setShareCode(false);
    setReportId('');
    setError('');
    requestId.current = crypto.randomUUID();
  }, [isOpen, problemSlug]);

  if (!isOpen) return null;

  return <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/80 p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="report-issue-title" className="max-h-[90dvh] w-full max-w-xl overflow-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-200 sm:p-6">
      <header className="flex items-start justify-between gap-3">
        <div><h2 id="report-issue-title" className="flex items-center gap-2 text-xl font-semibold text-white"><Flag className="h-5 w-5 text-amber-300" />Report an issue</h2><p className="mt-1 text-sm text-slate-400">{problemTitle}</p></div>
        <button type="button" aria-label="Close report" disabled={pending} onClick={onClose} className="rounded-lg p-2 hover:bg-slate-800"><X className="h-5 w-5" /></button>
      </header>
      {reportId ? <div className="mt-5 space-y-3"><p role="status" className="rounded-xl bg-emerald-950/70 p-3 text-emerald-200">Report submitted for review. An approved bounty will be credited to your wallet.</p><p className="break-all text-xs text-slate-400">Report ID {reportId}</p><button onClick={onClose} className="rounded-lg bg-slate-700 px-4 py-2">Done</button></div> : <form className="mt-5 space-y-4" onSubmit={async event => {
        event.preventDefault();
        if (pending || !note.trim()) return;
        setPending(true);
        setError('');
        try {
          const attachesRun = testInput.trim() === (currentInput || '').trim();
          const response = await apiFetch(`${repositoryConfig.backendUrl}/api/problem-reports`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(30000),
            body: JSON.stringify({ slug: problemSlug, problemTitle: problemTitle.slice(0, 220), issueType: category, language, note: note.trim(), requestId: requestId.current,
              testInput: testInput.slice(0, 3000), expectedOutput: attachesRun ? (currentExpectedOutput || '').slice(0, 3000) : '',
              actualOutput: attachesRun ? (userActualOutput || '').slice(0, 3000) : '',
              executionError: attachesRun ? (executionError || '').slice(0, 3000) : '', studentCode: shareCode ? (userCode || '').slice(0, 6000) : '' }),
          });
          const data = await response.json();
          if (!response.ok || !data.id) throw new Error(typeof data.detail === 'string' ? data.detail : 'The report could not be saved. Try again.');
          setReportId(data.id);
        } catch (failure) { setError(failure instanceof Error ? failure.message : 'The report could not be saved.'); }
        finally { setPending(false); }
      }}>
        <label className="block space-y-1 text-sm"><span>Issue type</span><select value={category} onChange={e => setCategory(e.target.value as Category)} className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5"><option value="testcase">Test case or expected output</option><option value="driver">Compiler harness</option><option value="problem">Problem statement</option><option value="solution">Reference solution</option></select></label>
        <label className="block space-y-1 text-sm"><span>Steps to reproduce</span><textarea required maxLength={2000} rows={3} value={note} onChange={e => setNote(e.target.value)} className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5" /></label>
        {(category === 'testcase' || testInput) && <label className="block space-y-1 text-sm"><span>Test input</span><textarea required={category === 'testcase'} maxLength={3000} rows={2} value={testInput} onChange={e => setTestInput(e.target.value)} className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 font-mono" /></label>}
        {userCode && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={shareCode} onChange={e => setShareCode(e.target.checked)} /> Include my code for the reviewer</label>}
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        <button type="submit" disabled={pending || !note.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Submitting...' : 'Submit for review'}</button>
      </form>}
    </section>
  </div>;
}
