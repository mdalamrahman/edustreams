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
  salary: { min: number; max: number; currency: string; period: string } | null;
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
