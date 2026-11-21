import { useState } from 'react';
import { Copy, Download, Printer } from 'lucide-react';
import { assessResume, prioritizeResumeBullets, resumeHeading } from '../../lib/atsEvidence';
import './resumeEditor.css';

interface ResumeEditorProps {
  draft: string;
  onChange: (draft: string) => void;
  baseResumeText: string;
  jobDescription: string;
}

const action = 'inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-teal-400 disabled:opacity-50';

export function AtsResumeCreatorView({ draft, onChange, baseResumeText, jobDescription }: ResumeEditorProps) {
  const [notice, setNotice] = useState('');
  const [previousDraft, setPreviousDraft] = useState<string>();
  const ready = Boolean(draft.trim());
  const paragraphGroups = draft.trim().split(/\r?\n\s*\r?\n/);
  const audit = ready ? assessResume(draft, jobDescription) : null;

  function reorder() {
    const ordered = prioritizeResumeBullets(draft, jobDescription);
    if (ordered === draft) {
      setNotice('No eligible bullet groups changed. Use one bullet per line under Experience or Projects.');
      return;
    }
    setPreviousDraft(draft);
    onChange(ordered);
    setNotice('Existing bullets reordered within their groups. Review the new order before exporting.');
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      setNotice('Resume text copied.');
    } catch {
      setNotice('Clipboard permission is unavailable. Select and copy the draft directly.');
    }
  }

  function downloadMarkdown() {
    const lines = draft.trim().split(/\r?\n/);
    const formatted = lines.map((line, index) => {
      if (resumeHeading(line)) return '## ' + line.trim().replace(/^#+\s*/, '').replace(/:$/, '');
      if (index === 0 && !line.startsWith('#')) return '# ' + line;
      return line;
    });
    const href = URL.createObjectURL(new Blob([formatted.join('\n')], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = href;
    link.download = 'resume.md';
    link.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

  function restore(value: string) {
    const lastDraft = draft;
    onChange(value);
    setPreviousDraft(lastDraft);
    setNotice('Draft restored.');
  }

  return <section className="resume-draft grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <div className="min-w-0 space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Edit your resume</h2>
        <p className="mt-2 text-sm text-slate-300">Your draft starts with the extracted text. Use standard section headings and begin each bullet with a dash. Describe what you did and add outcomes you can verify.</p>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-slate-200">Resume draft</span>
        <textarea value={draft} className="mt-2 block min-h-80 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm leading-relaxed text-white focus-visible:outline-2 focus-visible:outline-teal-400"
          maxLength={50_000} onChange={event => { onChange(event.target.value); setNotice(''); }} />
      </label>
      <div className="flex flex-wrap gap-2">
        <button className={action} disabled={!ready || !jobDescription.trim()} onClick={reorder}>Prioritize relevant bullets</button>
        {draft !== baseResumeText && <button className={action} onClick={() => restore(baseResumeText)}>Restore original</button>}
        {previousDraft !== undefined && previousDraft !== draft && <button className={action} onClick={() => restore(previousDraft)}>Undo last change</button>}
      </div>
      <p className="text-sm text-slate-400">{audit?.match
        ? audit.match.matched + ' of ' + audit.match.requirements.length + ' recognized job terms appear in the draft.'
        : 'Add a job description in ATS review to prioritize existing bullets.'}</p>
      {notice && <p role="status" className="text-sm text-teal-300">{notice}</p>}
    </div>

    <div className="min-w-0 space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-white">Print preview</h2>
      <div className="flex flex-wrap gap-2">
        <button className={action} disabled={!ready} onClick={() => window.print()}><Printer size={15} /> Print / PDF</button>
        <button className={action} disabled={!ready} onClick={() => void copy()}><Copy size={15} /> Copy text</button>
        <button className={action} disabled={!ready} onClick={downloadMarkdown}><Download size={15} /> Markdown</button>
      </div>
      <article className="resume-draft-paper space-y-4 rounded-lg bg-white p-4 text-sm leading-relaxed text-slate-900 sm:p-6" aria-label="Draft print preview">
        {!ready && <p>Add text to preview your resume.</p>}
        {ready && paragraphGroups.map((group, index) => <p className="whitespace-pre-wrap break-words" key={index}>{group}</p>)}
      </article>
    </div>
  </section>;
}
