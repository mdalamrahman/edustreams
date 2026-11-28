import assert from 'node:assert/strict';
import test from 'node:test';
import { assessResume, prioritizeResumeBullets } from '../src/lib/atsEvidence.ts';
import { displayPay, postedPay } from '../src/lib/resumeMarket.ts';
import { onRequestGet } from '../functions/api/freehire-jobs.ts';

test('posted pay uses recent full-time annual listings from distinct employers, in one currency', () => {
  const now = Date.parse('2026-11-21T00:00:00Z');
  const row = (id, min, max, extra = {}) => ({
    id, companyKey: id, postedAt: '2026-11-19', employment: 'full_time',
    salary: { currency: 'USD', period: 'year', min, max }, ...extra,
  });
  const jobs = [
    row('a', 90_000, 120_000), row('b', 100_000, 130_000), row('c', 120_000, 160_000),
    row('copy', 200_000, 230_000, { companyKey: 'a', postedAt: '2026-11-01' }),
    row('old', 200_000, 230_000, { postedAt: '2025-01-01' }),
    row('contract', 200_000, 230_000, { employment: 'contract' }),
    row('different', 200_000, 230_000, { salary: { currency: 'CAD', period: 'year', min: 200_000, max: 230_000 } }),
  ];
  const result = postedPay(jobs, 'USD', now);
  assert.equal(result.count, 3);
  assert.deepEqual(result.range, { min: 100_000, max: 130_000 });
  assert.equal(postedPay(jobs, 'CAD', now).range, null);
  assert.match(displayPay(1_080_000, 1_560_000, 'INR', 'year'), /10\.8\s+\u2013\s+.*15\.6 LPA/);
});

test('resume evidence prefers work examples and retains preferred versus required status', () => {
  const resume = 'Skills\nPostgres, Python\nWork Experience\n- Used PostgreSQL to reduce latency by 20%\nProjects\n- Built a Python CLI';
  const { match } = assessResume(resume, 'PostgreSQL and Docker', 'Python');
  assert.equal(match.requirements.find(item => item.term === 'PostgreSQL').section, 'Experience');
  assert.equal(match.requirements.find(item => item.term === 'Docker').evidence, null);
  assert.equal(match.requirements.find(item => item.term === 'Python').preferred, true);
});

test('readiness score is explained by its weighted factors and keeps job coverage separate', () => {
  const resume = 'Taylor\ntaylor@example.com\nExperience\nEngineer 2020 - 2025\n- Built Python services for 200 users\n- Reduced latency by 25%\n- Automated 50 tests with Playwright\nEducation\nUniversity\nSkills\nPython, SQL, Docker, Playwright';
  const audit = assessResume(resume, 'Python and Kubernetes', 'Docker');
  assert.equal(audit.factors.reduce((sum, factor) => sum + factor.weight, 0), 100);
  assert.equal(audit.readinessScore, Math.round(audit.factors.reduce((sum, factor) => sum + factor.score * factor.weight / 100, 0)));
  assert.equal(audit.match.requiredScore, 50);
  assert.equal(audit.match.preferredScore, 100);
  assert.equal(assessResume(resume).readinessScore, audit.readinessScore);
  assert.ok(assessResume('Some unstructured text').readinessScore < audit.readinessScore);
});

test('resume tailoring reorders only complete bullets inside a role and preserves the authored text', () => {
  const resume = 'Experience\nFirst role\n- Wrote tests\n- Built a Docker CI job\n\nSecond role\n- Refactored services\n- Tuned PostgreSQL queries\n continuation\n\nEducation\n- University';
  const draft = prioritizeResumeBullets(resume, 'Docker and PostgreSQL');
  assert.match(draft, /First role\n- Built a Docker CI job\n- Wrote tests/);
  assert.match(draft, /Second role\n- Refactored services\n- Tuned PostgreSQL queries\n continuation/);
  assert.deepEqual(draft.split('\n').sort(), resume.split('\n').sort());
});

test('job provider filters country and global remote eligibility and preserves missing pay', async t => {
  const jobs = [
    { public_slug: 'in', title: 'Software Engineer', company: 'Employer One', countries: ['in'], regions: ['apac'] },
    { public_slug: 'us', title: 'Software Engineer', company: 'Employer Two', countries: ['us'], regions: ['global'], work_mode: 'remote' },
    { public_slug: 'global', title: 'Software Engineer', company: 'Employer Three', countries: [], regions: ['global'], work_mode: 'remote', url: 'javascript:alert(1)' },
    { public_slug: 'other', title: 'Account Executive', company: 'Employer Four', countries: ['in'], regions: ['apac'] },
  ];
  const provider = t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(new URL(url).hostname, 'freehire.me');
    assert.equal(init.headers.Authorization, 'Bearer test-key');
    return Response.json({ data: jobs });
  });
  const request = lane => new Request('https://example.test/api/freehire-jobs?q=Software+Engineer&country=IN&work_mode=all&lane=' + lane);
  assert.equal((await onRequestGet({ request: request('domestic'), env: {} })).status, 503);
  assert.equal(provider.mock.callCount(), 0);
  const domestic = await (await onRequestGet({ request: request('domestic'), env: { FREEHIRE_API_KEY: 'test-key' } })).json();
  assert.deepEqual(domestic.jobs.map(job => job.id), ['in']);
  assert.equal(domestic.jobs[0].salary, null);
  const global = await (await onRequestGet({ request: request('global'), env: { FREEHIRE_API_KEY: 'test-key' } })).json();
  assert.deepEqual(global.jobs.map(job => job.id), ['global']);
  assert.equal(global.jobs[0].applyUrl, '');
});
