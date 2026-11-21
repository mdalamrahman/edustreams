import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, Briefcase, FileCheck, FileText, GitBranch, Layers, Upload } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { assessResume } from '../lib/atsEvidence';
import { extractResumeTextFromFile } from '../lib/resumeAnalyzerService';
import { displayPay, marketCountries, postedPay, type JobLane, type MarketCountry, type ResumeJob } from '../lib/resumeMarket';
import { AtsResumeCreatorView } from './resume/AtsResumeCreatorView';

const tabs = [
  { id: 'dashboard', label: 'Market pay', icon: BarChart3 },
  { id: 'ats_scanner', label: 'ATS review', icon: FileCheck },
  { id: 'jobs', label: 'Job listings', icon: Briefcase },
  { id: 'roadmap', label: 'Skill roadmap', icon: Layers },
  { id: 'transitions', label: 'Role transitions', icon: GitBranch },
  { id: 'creator', label: 'Resume editor', icon: FileText },
] as const;
export type UnifiedStudioTab = (typeof tabs)[number]['id'];

const tabAliases: Record<string, UnifiedStudioTab> = {
  scanner: 'ats_scanner', ats: 'ats_scanner', skills: 'roadmap', flashcards: 'transitions', compensation: 'jobs',
};

const transitions = [
  { role: 'Backend Engineer', skills: ['Python', 'SQL', 'REST', 'Docker'], project: 'Build an API with a relational database, integration tests, and a documented deployment.' },
  { role: 'Frontend Engineer', skills: ['JavaScript', 'React', 'Accessibility', 'Playwright'], project: 'Build an accessible interface and test its main workflows with Playwright.' },
  { role: 'QA Automation Engineer', skills: ['Test automation', 'Playwright', 'API testing', 'CI/CD'], project: 'Build a browser and API regression suite that runs in CI, including failure reporting.' },
  { role: 'Platform Engineer', skills: ['Linux', 'Docker', 'Kubernetes', 'Terraform'], project: 'Deploy a small service with infrastructure as code, monitoring, and a tested rollback.' },
];

const panel = 'min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6';
const control = 'min-w-0 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 focus-visible:outline-2 focus-visible:outline-teal-400';
const button = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-teal-400 disabled:opacity-50';
const title = 'text-lg font-semibold tracking-tight text-white sm:text-xl';

type ListingState = { key: string; jobs?: ResumeJob[]; unavailable?: boolean };

export function ResumeAnalyst() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab') || params.get('mode') || '';
  const tab = tabs.find(item => item.id === requested)?.id || (Object.prototype.hasOwnProperty.call(tabAliases, requested) ? tabAliases[requested] : 'dashboard');
  const changeTab = (value: UnifiedStudioTab) => setParams(previous => {
    const next = new URLSearchParams(previous);
    next.set('tab', value);
    return next;
  });

  const upload = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const [resume, setResume] = useState<{ name: string; text: string }>();
  const [loadingFile, setLoadingFile] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [description, setDescription] = useState('');
  const [selectedJob, setSelectedJob] = useState<ResumeJob>();
  const [draft, setDraft] = useState('');
  const [country, setCountry] = useState<MarketCountry>('IN');
  const [city, setCity] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [roleInput, setRoleInput] = useState(role);
  const [workMode, setWorkMode] = useState('all');
  const [lane, setLane] = useState<JobLane>('domestic');
  const [version, retry] = useState(0);
  const [domestic, setDomestic] = useState<ListingState>();
  const [global, setGlobal] = useState<ListingState>();
  const searchKey = JSON.stringify([country, city, role, workMode, version]);
  const needsListings = Boolean(resume) && (tab === 'dashboard' || tab === 'jobs');

  useEffect(() => {
    if (!needsListings) return;
    const abort = new AbortController();
    async function fetchLane(lane: JobLane, save: (listing: ListingState) => void) {
      try {
        const query = new URLSearchParams({ q: role, country, work_mode: workMode, lane });
        if (lane === 'domestic' && city) query.set('city', city);
        const response = await fetch('/api/freehire-jobs?' + query, { signal: abort.signal });
        if (!response.ok) throw new Error('Job feed unavailable');
        const data: { jobs: ResumeJob[] } = await response.json();
        if (!Array.isArray(data.jobs)) throw new Error('Job feed response unavailable');
        if (!abort.signal.aborted) save({ key: searchKey, jobs: data.jobs });
      } catch {
        if (!abort.signal.aborted) save({ key: searchKey, unavailable: true });
      }
    }
    if (domestic?.key !== searchKey) void fetchLane('domestic', setDomestic);
    if (global?.key !== searchKey) void fetchLane('global', setGlobal);
    return () => abort.abort();
  }, [needsListings, searchKey, country, city, role, workMode]);

  const hasStructuredRequirements = selectedJob && (selectedJob.required.length || selectedJob.preferred.length);
  const coreText = hasStructuredRequirements ? selectedJob.required.join('\n') : description;
  const audit = useMemo(() => resume ? assessResume(resume.text, coreText, selectedJob?.preferred.join('\n')) : null, [resume, coreText, selectedJob]);

  function clearResume() {
    generation.current++;
    setResume(undefined);
    setDraft('');
    setDescription('');
    setSelectedJob(undefined);
    setUploadError('');
    setLoadingFile(false);
    if (upload.current) upload.current.value = '';
  }

  async function readResume(file?: File) {
    if (!file) return;
    clearResume();
    const current = generation.current;
    setLoadingFile(true);
    try {
      if (!/\.(pdf|txt|md)$/i.test(file.name) || file.size > 10 * 1024 * 1024) throw new Error('Unsupported file');
      const text = (await extractResumeTextFromFile(file, { requireReadableText: true })).trim();
      if (text.length > 50_000 || (text.match(/[\p{L}\p{N}]/gu)?.length ?? 0) < 20 || /\u0000|\ufffd/.test(text)) throw new Error('Unreadable text');
      if (generation.current !== current) return;
      setResume({ name: file.name, text });
      setDraft(text);
    } catch {
      if (generation.current === current) setUploadError('Could not read this resume. Choose a text-based PDF, TXT, or Markdown file under 10 MB. Scanned PDFs need OCR first.');
    } finally {
      if (generation.current === current) setLoadingFile(false);
    }
  }

  const market = marketCountries[country];
  const listings = lane === 'domestic' ? domestic : global;
  function renderMarket(label: string, state: ListingState | undefined, currency: string) {
    const current = state?.key === searchKey ? state : undefined;
    const pay = current?.jobs ? postedPay(current.jobs, currency) : null;
    return <section className={panel}>
      <h3 className={title}>{label}</h3>
      {!current ? <p role="status" className="mt-3 text-slate-300">Checking listings…</p>
        : current.unavailable ? <p className="mt-3 text-slate-300">Live listings are currently unavailable.</p>
          : pay?.range ? <>
            <p className="mt-3 break-words text-2xl font-semibold text-teal-300">{displayPay(pay.range.min, pay.range.max, currency, 'year')}</p>
            <p className="mt-2 text-sm text-slate-400">Median lower and upper pay from {pay.count} employers with recent full-time postings in {currency}.</p>
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer font-medium text-teal-300">View source postings</summary>
              <ul className="mt-2 space-y-2">
                {pay.sample.map(job => <li key={job.id}>{job.applyUrl ? <a className="text-slate-200 underline" href={job.applyUrl} target="_blank" rel="noreferrer">{job.title} · {job.company}</a> : job.title + ' · ' + job.company}</li>)}
              </ul>
            </details>
          </> : <p className="mt-3 text-sm text-slate-300">Insufficient salary data. Found {pay?.count ?? 0} employers with comparable annual postings in {currency}. At least three are needed.</p>}
    </section>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <section aria-labelledby="resume-analyst-heading" className="mx-auto w-full max-w-6xl space-y-6 px-4 py-5 sm:px-8 sm:py-9">
        <header className="space-y-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-teal-300"><ArrowLeft size={16} /> Dashboard</Link>
          <div className="border-l-2 border-teal-400 pl-4">
            <h1 id="resume-analyst-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Resume Analyst</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">Review your resume, compare it with a job description, and find the next step for your target role.</p>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <section className={panel}>
            <h2 className={title}>Your resume</h2>
            <p className="mt-2 text-sm text-slate-400">PDF with selectable text, TXT, or Markdown. Up to 10 MB. Resume text and edits stay in this browser session.</p>
            <input ref={upload} type="file" accept=".pdf,.txt,.md" aria-label="Upload resume" className="sr-only" tabIndex={-1}
              onChange={event => void readResume(event.currentTarget.files?.[0])} />
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={button + ' bg-teal-500/15 text-teal-200'} onClick={() => upload.current?.click()}><Upload size={16} />{resume ? 'Replace resume' : 'Upload resume'}</button>
              {(resume || loadingFile) && <button className={button} onClick={clearResume}>{loadingFile ? 'Cancel upload' : 'Remove resume'}</button>}
            </div>
            {loadingFile && <p className="mt-3 text-sm text-slate-300" role="status">Reading your resume…</p>}
            {resume && <p className="mt-3 break-all text-sm font-medium text-teal-300">{resume.name}</p>}
            {uploadError && <p className="mt-3 text-sm text-rose-300" role="alert">{uploadError}</p>}
          </section>

          <section className={panel}>
            <h2 className={title}>Job search settings</h2>
            <form className="mt-3 grid gap-3 sm:grid-cols-2" onSubmit={event => {
              event.preventDefault();
              const next = roleInput.trim();
              if (!next) return;
              setRole(next);
              setCity(cityInput.trim());
              retry(n => n + 1);
              if (resume && tab !== 'dashboard') changeTab('jobs');
            }}>
              <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium">Target job title</span>
                <input className={control} value={roleInput} maxLength={80} required onChange={event => setRoleInput(event.target.value)} />
              </label>
              <label className="space-y-1.5"><span className="text-sm font-medium">Country</span>
                <select className={control} value={country} onChange={event => {
                  setCountry(event.target.value as MarketCountry);
                  setCity('');
                  setCityInput('');
                }}>
                  {Object.entries(marketCountries).map(([code, item]) => <option key={code} value={code}>{item.name}</option>)}
                </select>
              </label>
              <label className="space-y-1.5"><span className="text-sm font-medium">City (optional)</span>
                <input className={control} value={cityInput} maxLength={80} placeholder="Any city" onChange={event => setCityInput(event.target.value)} />
              </label>
              <label className="space-y-1.5"><span className="text-sm font-medium">Work arrangement</span>
                <select className={control} value={workMode} onChange={event => setWorkMode(event.target.value)}>
                  <option value="all">Any arrangement</option><option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option><option value="onsite">On-site</option>
                </select>
              </label>
              <button className={button + ' self-end sm:justify-self-start'} type="submit" disabled={!roleInput.trim()}>Search listings <ArrowRight size={15} /></button>
            </form>
          </section>
        </div>

        <nav aria-label="Resume tools" className="grid grid-cols-2 gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1.5 sm:grid-cols-3 lg:grid-cols-6">
          {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-current={tab === id ? 'page' : undefined}
            className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-slate-300 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-teal-400 aria-[current=page]:bg-teal-400/15 aria-[current=page]:text-teal-200"
            onClick={() => changeTab(id)}><Icon size={17} className="shrink-0" />{label}</button>)}
        </nav>

        {!resume ? <section className={panel}>
          <h2 className={title}>{tabs.find(item => item.id === tab)?.label}</h2>
          <p className="mt-2 text-sm text-slate-300">Upload a readable resume to use this tool.</p>
        </section> : <>
          {tab === 'dashboard' && <section className="space-y-4">
            <div><h2 className={title}>Posted pay for {role}</h2>
              <p className="mt-2 text-sm text-slate-300">Compare advertised pay from listings posted in the last 90 days. These figures describe the available postings.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {renderMarket('In-country · ' + (city ? city + ', ' : '') + market.name, domestic, market.currency)}
              {renderMarket('Worldwide remote · USD', global, 'USD')}
            </div>
            {(domestic?.key === searchKey && domestic.unavailable || global?.key === searchKey && global.unavailable) && <button className={button} onClick={() => retry(n => n + 1)}>Retry listings</button>}
          </section>}

          {tab === 'ats_scanner' && audit && <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <section className={panel}>
              <h2 className={title}>Resume parseability and quality</h2>
              <dl className="mt-3 divide-y divide-slate-800">
                {audit.checks.map(check => <div key={check.label} className="space-y-1.5 py-3">
                  <div className="flex flex-wrap justify-between gap-2"><dt className="font-medium text-white">{check.label}</dt><dd className={check.status === 'Review' ? 'text-sm text-amber-300' : 'text-sm text-teal-300'}>{check.status}</dd></div>
                  <dd className="text-sm leading-relaxed text-slate-300">{check.detail}</dd>
                </div>)}
              </dl>
              <details className="mt-4 text-sm"><summary className="cursor-pointer font-medium text-teal-300">Preview extracted text</summary>
                <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-3">{resume.text}</pre>
              </details>
            </section>
            <section className={panel}>
              <h2 className={title}>Job description comparison</h2>
              <p className="mt-2 text-sm text-slate-300">Compare recognized technical terms and review the resume excerpts yourself. Review experience, education, and eligibility requirements separately.</p>
              {selectedJob && <p className="mt-3 text-sm text-teal-300">Comparing with {selectedJob.title} at {selectedJob.company}</p>}
              <label className="mt-4 block space-y-1.5"><span className="text-sm font-medium">Job description (optional)</span>
                <textarea className={control + ' min-h-32 resize-y'} value={description} maxLength={16_000}
                  onChange={event => { setDescription(event.target.value); setSelectedJob(undefined); }} placeholder="Paste the requirements and preferred qualifications from a job posting." />
              </label>
              {audit.match ? <div className="mt-5">
                <p className="font-semibold text-white">{audit.match.matched} of {audit.match.requirements.length} recognized terms found</p>
                <ul className="mt-2 divide-y divide-slate-800">
                  {audit.match.requirements.map(item => <li key={item.term} className="py-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-sm font-semibold text-white">{item.term}{item.preferred ? ' · Preferred' : ''}</span>
                      <span className={item.evidence ? 'text-xs text-teal-300' : 'text-xs text-amber-300'}>
                        {item.evidence ? item.section === 'Skills' ? 'Listed in Skills' : item.section || 'Mentioned' : 'Evidence not found'}
                      </span>
                    </div>
                    {item.evidence && <p className="mt-1 break-words text-sm text-slate-300">{item.evidence}</p>}
                  </li>)}
                </ul>
              </div> : description.trim() ? <p className="mt-3 text-sm text-slate-300">No recognized technical terms were found. Review the posting manually.</p> : null}
            </section>
          </div>}

          {tab === 'jobs' && <section className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className={title}>{role} listings</h2><p className="mt-2 text-sm text-slate-400">Recent postings from FreeHire{lane === 'domestic' && city ? ' for ' + city : ''}.</p></div>
              <label className="flex items-center gap-2 text-sm">Market
                <select className={control} value={lane} onChange={event => setLane(event.target.value as JobLane)}>
                  <option value="domestic">{market.name}</option><option value="global">Worldwide remote</option>
                </select>
              </label>
            </div>
            {listings?.key !== searchKey ? <p role="status">Checking listings…</p>
              : listings.unavailable ? <div className={panel}>
                <p>Live listings are currently unavailable. You can find a posting on FreeHire and paste its requirements into ATS review.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className={button} onClick={() => retry(n => n + 1)}>Retry listings</button>
                  <a className={button} href="https://freehire.me/jobs" target="_blank" rel="noreferrer">Browse FreeHire</a>
                  <button className={button} onClick={() => changeTab('ats_scanner')}>Open ATS review</button>
                </div>
              </div> : !listings.jobs?.length ? <p className={panel}>No recent listings match these filters. Try another job title or work arrangement.</p>
                : <div className="grid gap-4 md:grid-cols-2">
                  {listings.jobs.map(job => <article key={job.id} className={panel}>
                    <h3 className="break-words text-base font-semibold text-white">{job.title}</h3>
                    <p className="mt-1 break-words text-sm text-slate-300">{[job.company, job.location, job.workMode].filter(Boolean).join(' · ')}</p>
                    <p className="mt-3 text-sm text-teal-300">{job.salary ? displayPay(job.salary.min, job.salary.max, job.salary.currency, job.salary.period) : 'Pay not listed'}</p>
                    {Number.isFinite(Date.parse(job.postedAt)) && <p className="mt-1 text-sm text-slate-400">Posted {new Date(job.postedAt).toLocaleDateString()}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {!!(job.description || job.required.length) && <button className={button} onClick={() => {
                        setSelectedJob(job);
                        setDescription(job.description || [...job.required, ...job.preferred].join('\n'));
                        changeTab('ats_scanner');
                      }}>Compare with resume</button>}
                      {job.applyUrl && <a className={button} href={job.applyUrl} target="_blank" rel="noreferrer">View original posting <ArrowRight size={15} /></a>}
                    </div>
                  </article>)}
                </div>}
          </section>}

          {tab === 'roadmap' && audit && <section className={panel}>
            <h2 className={title}>Build evidence for your target role</h2>
            <p className="mt-2 text-sm text-slate-300">Start with the posting’s requirements. Show where you used each skill, what you owned, and what changed.</p>
            {audit.match ? <ul className="mt-4 divide-y divide-slate-800">
              {[...audit.match.requirements].sort((left, right) => Number(left.preferred) - Number(right.preferred)
                || Number(Boolean(left.evidence)) - Number(Boolean(right.evidence))).map(item => <li key={item.term} className="py-3">
                <h3 className="font-medium text-white">{item.term}{item.preferred ? ' · Preferred' : ''}</h3>
                <p className="mt-1 text-sm text-slate-300">{item.section === 'Experience' || item.section === 'Projects'
                  ? 'Review the existing example and clarify your contribution or outcome.'
                  : item.evidence ? 'Add a work or project example if you have one.'
                    : 'Check whether this skill is required. If you need practice, build a small example you can explain.'}</p>
              </li>)}
            </ul> : <>
              <p className="mt-3 text-sm text-slate-400">Add a job description to get a skills checklist grounded in that posting.</p>
              <button className={button + ' mt-3'} onClick={() => changeTab('ats_scanner')}>Add a job description</button>
            </>}
          </section>}

          {tab === 'transitions' && audit && <section className="space-y-4">
            <div><h2 className={title}>Explore adjacent roles</h2>
              <p className="mt-2 text-sm text-slate-300">Illustrative role checklists use skills mentioned in your resume. Requirements vary by employer.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">{transitions.map(path => {
              const existing = path.skills.filter(skill => audit.skills.some(item => item.term === skill));
              const gaps = path.skills.filter(skill => !existing.includes(skill));
              return <article key={path.role} className={panel}>
                <h3 className="font-semibold text-white">{path.role}</h3>
                <p className="mt-3 text-sm text-slate-300">Mentioned in your resume · {existing.join(', ') || 'None of these checklist skills'}</p>
                <p className="mt-2 text-sm text-slate-300">Review or build · {gaps.join(', ') || 'Check specific requirements in a posting'}</p>
                <p className="mt-3 text-sm text-teal-200">{path.project}</p>
                <button className={button + ' mt-4'} onClick={() => {
                  setRole(path.role);
                  setRoleInput(path.role);
                  changeTab('jobs');
                }}>Search this role <ArrowRight size={15} /></button>
              </article>;
            })}</div>
          </section>}

          {tab === 'creator' && <AtsResumeCreatorView draft={draft} onChange={setDraft} baseResumeText={resume.text} jobDescription={coreText} />}
        </>}
      </section>
    </div>
  );
}

export default ResumeAnalyst;
