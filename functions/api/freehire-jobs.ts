// functions/api/freehire-jobs.ts
// Cloudflare Pages Edge Function for Live FreeHire Job Search & 2-Lane Location Categorization

interface Env {
  RENDER_BACKEND_URL?: string;
}

const FREEHIRE_SEARCH_URL = 'https://freehire.me/api/v1/agent/jobs/search';
const FREEHIRE_FALLBACK_URL = 'https://freehire.me/api/v1/jobs';

const HIGH_ROI_SKILLS = [
  'python', 'java', 'c++', 'typescript', 'javascript', 'react', 'next.js', 'node.js', 'nestjs',
  'go', 'golang', 'rust', 'postgresql', 'mongodb', 'redis', 'apache kafka', 'kubernetes',
  'docker', 'aws', 'gcp', 'system design', 'microservices', 'graphql', 'sql'
];

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  const url = new URL(context.request.url);
  const roleQuery = url.searchParams.get('role') || 'software engineer';
  const countryName = (url.searchParams.get('country') || 'India').toLowerCase();
  const preferredCity = (url.searchParams.get('preferredCity') || 'Bengaluru').toLowerCase();
  const preferDomesticRemote = url.searchParams.get('preferDomesticRemote') === 'true';
  const workModeFilter = url.searchParams.get('workMode') || 'all';
  const includeOutsideCountry = url.searchParams.get('includeOutsideCountry') !== 'false';
  const candidateSkillsParam = url.searchParams.get('skills') || '';
  const candidateSkills = candidateSkillsParam ? candidateSkillsParam.split(',').map(s => s.trim().toLowerCase()) : [];

  let rawJobs: any[] = [];

  try {
    const searchParams = new URLSearchParams({
      q: roleQuery,
      limit: '50',
      offset: '0',
      include_description: 'true',
      description_format: 'markdown'
    });
    if (['remote', 'hybrid', 'onsite'].includes(workModeFilter)) {
      searchParams.set('work_mode', workModeFilter);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const resp = await fetch(`${FREEHIRE_SEARCH_URL}?${searchParams.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SDETube-CareerEngine/3.0'
      },
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (resp && resp.ok) {
      const data: any = await resp.json().catch(() => null);
      rawJobs = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    }

    if (rawJobs.length === 0) {
      // Fallback to basic endpoint
      const fbResp = await fetch(`${FREEHIRE_FALLBACK_URL}?limit=50`, {
        headers: { 'Accept': 'application/json' }
      }).catch(() => null);
      if (fbResp && fbResp.ok) {
        const fbData: any = await fbResp.json().catch(() => null);
        rawJobs = Array.isArray(fbData?.data) ? fbData.data : (Array.isArray(fbData) ? fbData : []);
      }
    }
  } catch (err) {
    console.warn('FreeHire edge fetch notice:', err);
  }

  const indianHubs = ['india', 'bengaluru', 'bangalore', 'hyderabad', 'pune', 'mumbai', 'gurgaon', 'gurugram', 'noida', 'chennai', 'kolkata', 'delhi'];
  const effectiveSkillsSet = new Set(candidateSkills.length > 0 ? candidateSkills : HIGH_ROI_SKILLS.slice(0, 10));

  const domesticJobs: any[] = [];
  const outsideCountryJobs: any[] = [];

  for (const job of rawJobs) {
    const locText = (job.location || '').toLowerCase();
    const workMode = (job.work_mode || (job.remote ? 'remote' : 'hybrid')).toLowerCase();
    const isRemote = workMode === 'remote' || locText.includes('remote');

    const isDomestic = countryName === 'india' || countryName === 'in'
      ? (locText.includes('india') || indianHubs.some(h => locText.includes(h)) || (isRemote && !locText.includes('us') && !locText.includes('europe')))
      : locText.includes(countryName);

    const isPreferredCity = Boolean(preferredCity && preferredCity !== 'any' && locText.includes(preferredCity));
    const isDomesticRemote = isDomestic && isRemote;

    const jobTags = Array.isArray(job.skills) ? job.skills.map((s: string) => String(s).toLowerCase()) : [];
    const descLower = (job.description || '').toLowerCase();
    for (const s of HIGH_ROI_SKILLS) {
      if (descLower.includes(s) && !jobTags.includes(s)) {
        jobTags.push(s);
      }
    }

    const matched: any[] = [];
    const missing: string[] = [];
    for (const tag of jobTags) {
      if (effectiveSkillsSet.has(tag)) {
        matched.push({ name: tag, fromSdeTube: false });
      } else {
        missing.push(tag);
      }
    }

    const totalReqs = Math.max(jobTags.length, 1);
    const atsScore = Math.min(99, Math.round((matched.length / totalReqs) * 85 + (isPreferredCity || isRemote ? 14 : 5)));

    const enriched = {
      id: String(job.id || job.slug || Math.random().toString(36).slice(2)),
      title: job.title || 'Software Engineer',
      company: job.company_name || job.company || 'Tech Company',
      location: job.location || (isRemote ? 'Remote' : 'India'),
      remote: isRemote,
      workMode: workMode === 'remote' ? 'remote' : workMode === 'hybrid' ? 'hybrid' : 'onsite',
      isPreferredCityMatch: isPreferredCity,
      isDomesticRemote,
      salaryRangeText: job.salary || job.salary_range || (isDomestic ? '₹28.0L – ₹48.0L' : '$110,000 – $165,000 / yr'),
      estimatedLPA: isDomestic ? 36.0 : 65.0,
      applyUrl: job.url || job.apply_url || `https://freehire.me/jobs`,
      postedAt: 'Live on FreeHire',
      source: 'FreeHire',
      atsMatchScore: atsScore,
      matchedSkills: matched.slice(0, 8),
      missingSkills: missing.slice(0, 6),
      marketValueComparison: 'Matches Your Valuation',
      rawDescription: (job.description || '').slice(0, 1500)
    };

    if (isDomestic) {
      domesticJobs.push(enriched);
    } else if (includeOutsideCountry) {
      outsideCountryJobs.push(enriched);
    }
  }

  domesticJobs.sort((a, b) => {
    const aPriority = (a.isPreferredCityMatch || (preferDomesticRemote && a.isDomesticRemote)) ? 1 : 0;
    const bPriority = (b.isPreferredCityMatch || (preferDomesticRemote && b.isDomesticRemote)) ? 1 : 0;
    if (aPriority !== bPriority) return bPriority - aPriority;
    return b.atsMatchScore - a.atsMatchScore;
  });

  outsideCountryJobs.sort((a, b) => b.atsMatchScore - a.atsMatchScore);

  return new Response(JSON.stringify({
    success: true,
    totalFound: rawJobs.length,
    domesticJobs: domesticJobs.slice(0, 25),
    outsideCountryJobs: outsideCountryJobs.slice(0, 25)
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600' // Edge cached 30 mins
    }
  });
};
