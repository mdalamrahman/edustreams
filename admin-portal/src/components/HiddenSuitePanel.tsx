import { useState } from 'react';
import { adminFetch } from '../lib/transport';
import { config } from '../lib/config';

export function HiddenSuitePanel({ slug, samples }: { slug: string; samples: { input: string; output: string }[] }) {
  const [language, setLanguage] = useState('cpp');
  const [harness, setHarness] = useState('');
  const [reference, setReference] = useState('');
  const [official, setOfficial] = useState(() => JSON.stringify(samples, null, 2));
  const [candidates, setCandidates] = useState('[]');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  async function run(publish: boolean) {
    setPending(true);
    setMessage('');
    try {
      const payload = { language, official_samples: JSON.parse(official) };
      const body = publish ? { ...payload, harness, reference, reviewed_inputs: JSON.parse(candidates) } : payload;
      const operation = publish ? 'hidden-suite' : 'hidden-candidates';
      const response = await adminFetch(new URL('/api/admin/problems/' + encodeURIComponent(slug) + '/' + operation, config.backendUrl), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(90000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Check the language, harness, and JSON fields.');
      if (publish) setMessage('Published ' + data.totalCount + ' verified hidden cases.');
      else {
        setCandidates(JSON.stringify(data.inputs, null, 2));
        setMessage(data.inputs.length ? 'Review each input against the problem constraints before publishing.' : 'No distinct inputs were generated.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed.');
    } finally { setPending(false); }
  }

  return <section className="space-y-4 rounded-2xl border border-indigo-700/50 bg-slate-950 p-5">
    <h4 className="text-base font-bold text-white">Verified hidden suite</h4>
    <p className="text-sm text-slate-300">Use the published examples and a trusted reference. The harness reads each input from stdin and prints only the result. Mark the solution insertion line with <code>=== USER SOLUTION ===</code> in a comment.</p>
    <label className="flex items-center gap-3 text-sm">Language
      <select value={language} onChange={event => setLanguage(event.target.value)} className="rounded bg-slate-900 p-2">
        {['cpp', 'python', 'javascript', 'java', 'go', 'rust'].map(value => <option key={value}>{value}</option>)}
      </select>
    </label>
    <div className="grid gap-4 md:grid-cols-2">
      <label className="space-y-2 text-sm">Official samples (JSON input/output pairs)
        <textarea value={official} onChange={event => setOfficial(event.target.value)} rows={6} className="block w-full rounded bg-slate-900 p-2 font-mono" />
      </label>
      <label className="space-y-2 text-sm">Reviewed hidden inputs (JSON array)
        <textarea value={candidates} onChange={event => setCandidates(event.target.value)} rows={6} className="block w-full rounded bg-slate-900 p-2 font-mono" />
      </label>
      <label className="space-y-2 text-sm">Stdin harness
        <textarea value={harness} onChange={event => setHarness(event.target.value)} rows={6} className="block w-full rounded bg-slate-900 p-2 font-mono" />
      </label>
      <label className="space-y-2 text-sm">Reference solution
        <textarea value={reference} onChange={event => setReference(event.target.value)} rows={6} className="block w-full rounded bg-slate-900 p-2 font-mono" />
      </label>
    </div>
    <div className="flex flex-wrap gap-3">
      <button type="button" disabled={pending} onClick={() => void run(false)} className="rounded bg-slate-800 px-3 py-2 text-sm disabled:opacity-50">Suggest hidden inputs</button>
      <button type="button" disabled={pending || !harness.trim() || !reference.trim()} onClick={() => void run(true)} className="rounded bg-indigo-600 px-3 py-2 text-sm disabled:opacity-50">Verify and publish</button>
    </div>
    {pending && <p role="status" className="text-sm text-slate-300">Working on the hidden suite…</p>}
    {message && <p role="status" className="text-sm text-slate-300">{message}</p>}
  </section>;
}
