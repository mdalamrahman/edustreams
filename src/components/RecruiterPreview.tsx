import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Code2, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useApp } from '../lib/AppContext';
import { fetchLeetCodeQuestionData, LeetCodeQuestionDetail } from '../lib/leetcodeApi';

type PreviewKind = 'problem' | 'interview' | 'analytics' | 'profile' | 'career' | 'studio' | 'lesson' | 'sql';

const FEATURES: Record<Exclude<PreviewKind, 'problem'>, { title: string; description: string; action: string; cards: [string, string][] }> = {
  sql: { title: 'SQL arena', description: 'Browse the SQL practice experience. Sign in to write queries, run them against example tables, and save results.', action: 'Sign in to practice SQL', cards: [['Question catalog', 'Queries · Joins · Window functions'], ['Table previews', 'Schemas · Example rows · Expected results'], ['Query evaluation', 'Run and compare queries after signing in']] },
  interview: { title: 'Mock interviews', description: 'Explore the interview flow: clarify the problem, explain an approach, code, and review structured feedback.', action: 'Sign in to start an interview', cards: [['Interview tracks', 'Frontend · Backend · Full stack · SDET'], ['Guided rounds', 'DSA · System design · Behavioral'], ['Feedback', 'Problem solving · Code quality · Communication']] },
  analytics: { title: 'Learning analytics', description: 'See how the dashboard organizes practice, accuracy, time spent, and interview readiness.', action: 'Sign in to view your analytics', cards: [['Example solved problems', '42'], ['Example accuracy', '84%'], ['Example study time', '12 hours']] },
  profile: { title: 'Developer profile', description: 'Preview the profile features used to track progress and showcase technical preparation.', action: 'Sign in to view your profile', cards: [['Connected profiles', 'GitHub · LeetCode · GeeksforGeeks'], ['Progress', 'Solved questions · Study streaks · Revisions'], ['Account controls', 'Profile settings · Passkeys · Activity']] },
  career: { title: 'Career & ATS studio', description: 'Explore resume analysis, role matching, and guided career preparation before signing in.', action: 'Sign in to analyze your resume', cards: [['Resume analysis', 'Skills · Evidence · ATS compatibility'], ['Career planning', 'Role matches · Learning roadmaps'], ['Your documents', 'Resume uploads and edits require sign-in']] },
  studio: { title: 'Coding & design studio', description: 'Browse the platform’s coding and architecture workspaces. Creating, running, and saving work requires an account.', action: 'Sign in to use the studio', cards: [['Coding', 'Monaco editor · Multiple languages'], ['System design', 'Architecture canvas · Diagram previews'], ['Evaluation', 'Compiler results · Structured feedback']] },
  lesson: { title: 'Video learning workspace', description: 'Browse the course catalog in this tour. Sign in to watch lessons, take quizzes, and save study notes.', action: 'Sign in to open this lesson', cards: [['Course content', 'DSA · LLD · System design'], ['Study tools', 'Notes · Quizzes · Coding practice'], ['Learning progress', 'Completed lessons · Revisions']] },
};

export function RecruiterFeaturePreview({ kind }: { kind: Exclude<PreviewKind, 'problem'> }) {
  const { setIsAuthModalOpen } = useApp();
  const feature = FEATURES[kind];
  return <section className="mx-auto max-w-5xl py-8 sm:py-14">
    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-300">View-only feature preview</p>
    <h1 className="text-3xl font-bold text-white sm:text-4xl">{feature.title}</h1>
    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">{feature.description}</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-3">{feature.cards.map(([label, text]) => <article key={label} className="rounded-2xl border border-white/10 bg-slate-900 p-6"><h2 className="text-sm font-semibold text-cyan-200">{label}</h2><p className="mt-4 text-lg font-semibold leading-7 text-slate-100">{text}</p></article>)}</div>
    <p className="mt-5 text-sm text-slate-500">Sample preview only. Personal data is shown after you sign in to your own account.</p>
    <button onClick={() => setIsAuthModalOpen(true)} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200"><LockKeyhole className="h-4 w-4" aria-hidden="true" />{feature.action}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
    <nav aria-label="Explore previews" className="mt-9 flex flex-wrap gap-4 text-sm text-slate-300">{[['/dsa-problems', 'Questions'], ['/interview', 'Interviews'], ['/analytics', 'Analytics'], ['/profile', 'Profile']].map(([url, label]) => <Link key={url} to={url} className="underline underline-offset-4 hover:text-cyan-200">{label}</Link>)}</nav>
  </section>;
}

export function RecruiterProblemPreview() {
  const { slug = '' } = useParams();
  const { setIsAuthModalOpen } = useApp();
  const [question, setQuestion] = useState<LeetCodeQuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    if (slug === 'sql-arena') { setLoading(false); return; }
    setLoading(true); setQuestion(null);
    fetchLeetCodeQuestionData(slug).then(value => { if (active) setQuestion(value); })
      .catch(() => { if (active) setQuestion(null); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug, attempt]);
  if (slug === 'sql-arena') return <RecruiterFeaturePreview kind="sql" />;
  const starter = question?.codeSnippets?.find(snippet => snippet.langSlug === 'javascript') || question?.codeSnippets?.[0];
  return <section className="mx-auto max-w-7xl py-5">
    <Link to="/dsa-problems" className="text-sm text-cyan-300 hover:underline">← Browse questions</Link>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Question preview</p><h1 className="mt-2 text-2xl font-bold text-white">{question?.title || slug.replace(/-/g, ' ')}{question?.difficulty && <span className="ml-3 text-sm font-medium text-slate-400">{question.difficulty}</span>}</h1></div><button onClick={() => setIsAuthModalOpen(true)} className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950">Sign in to solve</button></div>
    {loading ? <p role="status" className="mt-10 flex items-center gap-3 text-slate-300"><Loader2 className="h-5 w-5 animate-spin" />Loading public question…</p> : !question ? <div className="mt-8 rounded-2xl border border-slate-700 p-6 text-slate-300"><p>This question could not be loaded right now.</p><button onClick={() => setAttempt(value => value + 1)} className="mt-3 text-cyan-300 underline">Retry</button></div> : <div className="mt-7 grid gap-5 lg:grid-cols-2">
      <article className="min-w-0 rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-7"><h2 className="mb-5 text-lg font-bold text-white">Problem description</h2><div className="prose prose-invert max-w-none text-sm leading-7 text-slate-300 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-950 [&_pre]:p-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.content || '') }} /></article>
      <aside className="min-w-0 rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-7"><h2 className="flex items-center gap-2 text-lg font-bold text-white"><Code2 className="h-5 w-5 text-cyan-300" />Code workspace preview</h2><p className="mt-3 text-sm leading-6 text-slate-400">Starter code is view-only. Sign in to edit code, run test cases, submit a solution, or save progress.</p><pre aria-label="Read-only starter code" className="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-5 text-sm leading-7 text-slate-300"><code>{starter?.code || '// Sign in to open the coding workspace.'}</code></pre><button onClick={() => setIsAuthModalOpen(true)} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 px-4 py-3 text-sm font-bold text-cyan-200"><LockKeyhole className="h-4 w-4" />Sign in to run or submit</button></aside>
    </div>}
  </section>;
}

export function RecruiterRoute({ kind, children }: { kind: PreviewKind; children: React.ReactNode }) {
  const { isRecruiterPreview } = useApp();
  if (!isRecruiterPreview) return <>{children}</>;
  return kind === 'problem' ? <RecruiterProblemPreview /> : <RecruiterFeaturePreview kind={kind} />;
}
