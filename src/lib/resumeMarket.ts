import { assessResume, resumeHeading } from './atsEvidence';

export const marketCountries = {
  IN: { name: 'India', currency: 'INR' },
  US: { name: 'United States', currency: 'USD' },
  GB: { name: 'United Kingdom', currency: 'GBP' },
  DE: { name: 'Germany', currency: 'EUR' },
  SG: { name: 'Singapore', currency: 'SGD' },
  CA: { name: 'Canada', currency: 'CAD' },
  AE: { name: 'United Arab Emirates', currency: 'AED' },
} as const;

export type MarketCountry = keyof typeof marketCountries;
export type JobLane = 'domestic' | 'global';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export interface ResumeJob {
  id: string;
  title: string;
  company: string;
  companyKey: string;
  location: string;
  applyUrl: string;
  workMode: WorkMode | null;
  postedAt: string;
  description: string;
  required: string[];
  preferred: string[];
  employment: string;
  experienceMin?: number | null;
  salary: { min: number; max: number; currency: string; period: string } | null;
}

export function resumeSearchProfile(text: string, now = new Date()) {
  const audit = assessResume(text);
  const skills = [...audit.skills].sort((a, b) => Number(b.section === 'Experience' || b.section === 'Projects') - Number(a.section === 'Experience' || a.section === 'Projects'))
    .slice(0, 8).map(item => item.term);
  const intervals: [number, number][] = [];
  let inExperience = false;
  for (const line of text.split(/\r?\n/)) {
    const heading = resumeHeading(line);
    if (heading) inExperience = heading === 'Experience';
    if (!inExperience) continue;
    for (const match of line.matchAll(/\b((?:19|20)\d{2})\s*(?:[-–—]|to)\s*((?:19|20)\d{2}|present|current|now)\b/gi)) {
      const start = Number(match[1]);
      const end = /^\d/.test(match[2]) ? Number(match[2]) : now.getFullYear();
      if (start <= end && end <= now.getFullYear()) intervals.push([start, end]);
    }
  }
  intervals.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const interval of intervals) {
    const previous = merged[merged.length - 1];
    if (previous && interval[0] <= previous[1]) previous[1] = Math.max(previous[1], interval[1]);
    else merged.push([...interval]);
  }
  const stated = text.match(/\b(\d{1,2})(?:\+)?\s+years?(?:\s+of)?\s+(?:(?:professional|industry|relevant|work|software development)\s+)?experience\b/i);
  const years = stated ? Number(stated[1]) : merged.length ? merged.reduce((sum, [start, end]) => sum + end - start, 0) : null;
  return { skills, years };
}

export function matchResumeJobs(jobs: ResumeJob[], text: string, years: number | null) {
  return jobs.map(job => {
    const requirements = job.required?.length ? job.required.join('\n') : job.description || '';
    const match = assessResume(text, requirements, job.preferred?.join('\n') || '').match;
    const required = match?.requirements.filter(item => !item.preferred) || [];
    const terms = required.length ? required : match?.requirements || [];
    const matched = terms.filter(item => item.evidence).map(item => item.term);
    const missing = terms.filter(item => !item.evidence).map(item => item.term);
    const eligible = years === null || job.experienceMin == null || job.experienceMin <= years;
    return { job, matched, missing, eligible, coverage: terms.length ? Math.round(100 * matched.length / terms.length) : null };
  }).filter(item => item.eligible && (item.coverage === null || item.matched.length > 0))
    .sort((a, b) => (b.coverage ?? -1) - (a.coverage ?? -1));
}

export function postedPay(jobs: ResumeJob[], currency: string, now = Date.now()) {
  const comparable = new Map<string, ResumeJob>();
  for (const job of jobs) {
    const age = (now - Date.parse(job.postedAt)) / 86_400_000;
    if (!(age >= 0 && age <= 90) || job.employment !== 'full_time' ||
        !job.companyKey || !job.salary || job.salary.currency !== currency || job.salary.period !== 'year') continue;
    const previous = comparable.get(job.companyKey);
    if (!previous || Date.parse(previous.postedAt) < Date.parse(job.postedAt)) comparable.set(job.companyKey, job);
  }
  const sample = [...comparable.values()];
  if (sample.length < 3) return { count: sample.length, sample, range: null };
  function median(values: number[]) {
    const sorted = values.sort((left, right) => left - right);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return {
    count: sample.length,
    sample,
    range: { min: median(sample.map(job => job.salary!.min)), max: median(sample.map(job => job.salary!.max)) },
  };
}

export function displayPay(min: number, max: number, currency: string, period: string) {
  const units: Record<string, string> = { year: 'year', month: 'month', day: 'day', hour: 'hour' };
  const format = (amount: number) => currency === 'INR' && period === 'year'
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 1 }).format(amount / 100_000)
    : new Intl.NumberFormat('en', { style: 'currency', currency, currencyDisplay: 'code', maximumFractionDigits: 0 }).format(amount);
  const range = min === max ? format(min) : format(min) + ' \u2013 ' + format(max);
  return range + (currency === 'INR' && period === 'year' ? ' LPA' : ' / ' + units[period]);
}
