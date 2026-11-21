import { useEffect, useState } from 'react';
import { config } from '../lib/config';
import { adminFetch } from '../lib/transport';

type Status = 'pending' | 'approved' | 'rejected' | 'duplicate' | 'legacy';
interface Report {
  id: string;
  slug: string;
  userEmail: string;
  issueType: string;
  status: Status;
  archivedStatus?: string;
  problemTitle?: string;
  timestamp: string;
  rewardedAmount: number;
  transactionId?: string;
  resolutionNote?: string;
  language?: string;
  note?: string;
  testInput?: string;
  expectedOutput?: string;
  actualOutput?: string;
  executionError?: string;
  studentCode?: string;
}

const pageSize = 15;
const endpoint = config.backendUrl + '/api/admin/bounties';
const button = 'rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50';

export function BountyReview() {
  const [filter, setFilter] = useState<Status | ''>('pending');
  const [offset, setOffset] = useState(0);
  const [version, setVersion] = useState(0);
  const [queue, setQueue] = useState<{ reports: Report[]; total: number; rewardAmount: number }>();
  const [selected, setSelected] = useState<Report>();
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const request = new AbortController();
    setQueue(undefined);
    setError('');
    const params = new URLSearchParams({ limit: String(pageSize), offset: String(offset) });
    params.set('status', filter || 'all');
    adminFetch(endpoint + '?' + params, { signal: request.signal }).then(async response => {
      if (!response.ok) throw new Error('Could not load the bounty queue.');
      const result = await response.json();
      if (!request.signal.aborted) setQueue(result);
    }).catch(() => {
      if (!request.signal.aborted) setError('Could not load the bounty queue. Try refreshing.');
    });
    return () => request.abort();
  }, [filter, offset, version]);

  async function review(decision: 'approve' | 'reject') {
    if (!selected || saving || !note.trim()) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await adminFetch(endpoint + '/' + selected.id + '/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, note: note.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.detail === 'string' ? result.detail : 'Could not save the review.');
      setSelected(result.report);
      setNotice(result.report.status === 'approved'
        ? 'Approved. Wallet credit recorded.'
        : result.report.status === 'duplicate' ? 'Already rewarded. No additional credit was issued.' : 'Report rejected.');
      setOffset(0);
      setVersion(v => v + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the review.');
    } finally {
      setSaving(false);
    }
  }

  const evidence = selected ? [
    ['Reporter notes', selected.note], ['Test input', selected.testInput], ['Expected output', selected.expectedOutput],
    ['Actual output', selected.actualOutput], ['Runtime error', selected.executionError], ['Submitted code', selected.studentCode],
  ].filter(([, value]) => value) : [];

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Bounty verification</h2>
          <p className="mt-1 text-sm text-slate-400">Reproduce the reported defect before approving its wallet credit.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm" htmlFor="bounty-status">Status</label>
          <select id="bounty-status" value={filter} disabled={saving} className={button + ' bg-slate-900'}
            onChange={event => { setFilter(event.target.value as Status | ''); setOffset(0); }}>
            <option value="pending">Pending</option><option value="approved">Approved</option>
            <option value="rejected">Rejected</option><option value="duplicate">Duplicate</option><option value="">All reports</option>
            <option value="legacy">Archived reports</option>
          </select>
          <button className={button} disabled={saving} onClick={() => setVersion(v => v + 1)}>Refresh</button>
        </div>
      </header>
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      {notice && <p role="status" className="text-sm text-teal-300">{notice}</p>}
      <div className="grid gap-5 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,2fr)]">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          {!queue && !error && <p role="status">Loading reports…</p>}
          {queue?.reports.length === 0 && <p className="text-slate-400">No reports on this page.</p>}
          <ul className="space-y-2">
            {queue?.reports.map(report => (
              <li key={report.id}>
                <button type="button" disabled={saving} aria-pressed={selected?.id === report.id}
                  className="block w-full rounded-lg border border-slate-700 px-3 py-2 text-left hover:bg-slate-800 aria-pressed:border-teal-500"
                  onClick={() => { setSelected(report); setNote(''); setNotice(''); setError(''); }}>
                  <span className="block break-all font-semibold text-white">{report.slug}</span>
                  <span className="text-sm text-slate-400">{report.issueType} · {report.status}</span>
                </button>
              </li>
            ))}
          </ul>
          {queue && queue.total > pageSize && <div className="mt-4 flex items-center justify-between gap-2">
            <button className={button} disabled={saving || offset === 0} onClick={() => setOffset(n => n - pageSize)}>Previous</button>
            <button className={button} disabled={saving || offset + pageSize >= queue.total} onClick={() => setOffset(n => n + pageSize)}>Next</button>
          </div>}
        </div>
        <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-900 p-5">
          {!selected ? <p className="text-slate-400">Select a report to inspect its evidence.</p> : <>
            <h3 className="break-words text-xl font-semibold text-white">{selected.problemTitle || selected.slug}</h3>
            <p className="mt-1 break-all text-sm text-slate-400">{selected.userEmail} · {selected.issueType} · {selected.status}</p>
            <p className="mt-1 text-sm text-slate-400">{selected.language || 'Language unspecified'} · {new Date(selected.timestamp).toLocaleString()}</p>
            <dl className="mt-5 space-y-3">
              {evidence.map(([name, value]) => <div key={name}>
                <dt className="mb-1 text-sm font-medium text-slate-300">{name}</dt>
                <dd><pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-3 text-sm">{value}</pre></dd>
              </div>)}
            </dl>
            {selected.status === 'pending' ? <form className="mt-5 space-y-3" onSubmit={event => event.preventDefault()}>
              {queue && <p className="text-sm text-slate-400">Eligible reports receive {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(queue.rewardAmount)} in wallet credit.</p>}
              <label className="block text-sm font-medium" htmlFor="bounty-review-note">Verification note (required)</label>
              <textarea id="bounty-review-note" rows={3} value={note} maxLength={2000} disabled={saving}
                placeholder="Record how you reproduced the defect or why the evidence falls short."
                className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-3" onChange={event => setNote(event.target.value)} />
              <div className="flex flex-wrap gap-2">
                <button type="button" className={button + ' border-teal-600 text-teal-200'} disabled={saving || !note.trim()} onClick={() => void review('approve')}>Approve and credit wallet</button>
                <button type="button" className={button} disabled={saving || !note.trim()} onClick={() => void review('reject')}>Reject report</button>
              </div>
            </form> : <div className="mt-5 space-y-2 break-words text-sm">
              {selected.status === 'legacy' && <p className="text-slate-300">Archived status: {selected.archivedStatus || 'Unknown'}. Ask the reporter to submit again from their signed-in account to consider a wallet credit.</p>}
              <p>{selected.resolutionNote}</p>
              {selected.transactionId && <p>Credit: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(selected.rewardedAmount)} · {selected.transactionId}</p>}
            </div>}
          </>}
        </div>
      </div>
    </section>
  );
}
