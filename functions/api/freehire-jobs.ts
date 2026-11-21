import type { ResumeJob, WorkMode } from '../../src/lib/resumeMarket';

export interface Env {
  FREEHIRE_API_KEY?: string;
}

const searchUrl = 'https://freehire.me/api/v1/jobs/search';
type ProviderJob = {
  public_slug: string;
  title: string;
  company: string;
  company_slug?: string;
  countries?: string[];
  regions?: string[];
  cities?: string[];
  location?: string;
  work_mode?: string;
  posted_at?: string;
  description?: string;
  url?: string;
  enrichment?: {
    summary?: string;
    employment_type?: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    salary_period?: string;
    requirements?: { text: string; priority: string }[];
  };
};

function normalizeJob(job: ProviderJob): ResumeJob | null {
  if (!job.public_slug || !job.title || !job.company) return null;
  const enrichment = job.enrichment ?? {};
  const { salary_min: min, salary_max: max, salary_currency: currency, salary_period: period } = enrichment;
  let applyUrl = '';
  try {
    const url = new URL(job.url ?? '');
    if (url.protocol === 'https:' || url.protocol === 'http:') applyUrl = url.href;
  } catch { /* The source did not include a usable link. */ }
  return {
    id: job.public_slug,
    title: job.title,
    company: job.company,
    companyKey: job.company_slug || job.company.toLowerCase().trim(),
    location: job.location || '',
    applyUrl,
    workMode: ['remote', 'hybrid', 'onsite'].includes(job.work_mode ?? '') ? job.work_mode as WorkMode : null,
    postedAt: job.posted_at || '',
    description: (job.description || enrichment.summary || '').replace(/<[^>]*>/g, ' ').slice(0, 16_000),
    required: (enrichment.requirements ?? []).filter(item => item.priority === 'required').map(item => item.text).slice(0, 25),
    preferred: (enrichment.requirements ?? []).filter(item => item.priority === 'preferred').map(item => item.text).slice(0, 25),
    employment: enrichment.employment_type || '',
    salary: typeof min === 'number' && typeof max === 'number' && Number.isFinite(min) && Number.isFinite(max) &&
      min > 0 && max >= min && currency && /^[A-Z]{3}$/.test(currency) && period && ['year', 'month', 'day', 'hour'].includes(period)
      ? { min, max, currency, period } : null,
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const params = new URL(request.url).searchParams;
  const role = (params.get('q') || '').trim();
  const country = (params.get('country') || '').toLowerCase();
  const city = (params.get('city') || '').trim();
  const lane = params.get('lane');
  const mode = params.get('work_mode');
  if (!role || role.length > 80 || city.length > 80 || city.includes(',') || !/^[a-z]{2}$/.test(country) ||
      (lane !== 'global' && lane !== 'domestic') || !['all', 'remote', 'hybrid', 'onsite'].includes(mode ?? '')) {
    return Response.json({ error: 'Invalid job search filters.' }, { status: 400 });
  }
  if (!env.FREEHIRE_API_KEY) {
    return Response.json({ error: 'Live job listings are currently unavailable.' }, { status: 503 });
  }

  const query = new URLSearchParams({
    q: role, limit: '50', posted_within_days: '90', sort: 'posted_at', order: 'desc',
    ...(lane === 'global' ? { regions: 'global', work_mode: 'remote' }
      : { ...(city ? { cities: city } : { countries: country.toUpperCase() }), ...(mode !== 'all' && mode ? { work_mode: mode } : {}) }),
  });
  try {
    const response = await fetch(searchUrl + '?' + query, {
      headers: { Accept: 'application/json', Authorization: 'Bearer ' + env.FREEHIRE_API_KEY },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error('Provider request failed');
    const payload: { data?: ProviderJob[]; meta?: { ignored_params?: unknown[] } } = await response.json();
    if (!Array.isArray(payload.data) || payload.meta?.ignored_params?.length) throw new Error('Unexpected provider response');
    const roleWords = role.toLowerCase().match(/[a-z0-9]+/g) ?? [];
    const jobs = new Map<string, ResumeJob>();
    for (const job of payload.data) {
      if (lane === 'global' ? job.work_mode !== 'remote' || !job.regions?.includes('global') || job.countries?.length
        : !job.countries?.includes(country) || (mode !== 'all' && job.work_mode !== mode)) continue;
      const titleWords = job.title?.toLowerCase().match(/[a-z0-9]+/g) ?? [];
      if (!roleWords.length || !roleWords.every(word => titleWords.includes(word))) continue;
      const normalized = normalizeJob(job);
      if (normalized) jobs.set(normalized.id, normalized);
    }
    return Response.json({ jobs: [...jobs.values()] });
  } catch {
    return Response.json({ error: 'Live job listings are currently unavailable.' }, { status: 502 });
  }
}
