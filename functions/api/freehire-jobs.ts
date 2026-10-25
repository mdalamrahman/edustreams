// functions/api/freehire-jobs.ts
// Cloudflare Pages Function for Dynamic Multi-Facet FreeHire Job Discovery

export interface Env {
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
}

const FREEHIRE_AGENT_SEARCH_URL = 'https://freehire.me/api/v1/agent/jobs/search';
const FREEHIRE_JOBS_LIST_URL = 'https://freehire.me/api/v1/jobs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// Extracts both Concrete Tech Stack AND Architectural Concepts (like those in CLANX JD)
const SKILL_AND_CONCEPT_PATTERNS: [string, RegExp][] = [
  ['TypeScript', /\btypescript\b|\bts\b/i],
  ['JavaScript', /\bjavascript\b|\bjs\b|\bes6\b/i],
  ['React', /\breact(?:\.js|js)?\b/i],
  ['Next.js', /\bnext(?:\.js|js)\b/i],
  ['Node.js', /\bnode(?:\.js|js)?\b/i],
  ['NestJS', /\bnest(?:\.js|js)\b/i],
  ['Go', /\bgolang\b|\bgo\s+(?:language|developer|engineer|backend|microservices|concurrency)\b/i],
  ['Python', /\bpython\b/i],
  ['Java', /\bjava\b(?!\s*script)/i],
  ['C++', /\bc\+\+\b|\bcpp\b/i],
  ['Rust', /\brust\b/i],
  ['Spring Boot', /\bspring(?:\s*boot)?\b/i],
  ['FastAPI', /\bfastapi\b/i],
  ['PostgreSQL', /\bpostgres(?:ql)?\b/i],
  ['MongoDB', /\bmongodb\b|\bmongo\b/i],
  ['Redis', /\bredis\b|\bvalkey\b/i],
  ['Apache Kafka', /\bkafka\b/i],
  ['NATS', /\bnats\b/i],
  ['Docker', /\bdocker\b|\bcontainer/i],
  ['Kubernetes', /\bkubernetes\b|\bk8s\b|\bk3d\b|\bk3s\b/i],
  ['KEDA', /\bkeda\b/i],
  ['AWS', /\baws\b|\bamazon\s+web\s+services\b/i],
  ['GCP', /\bgcp\b|\bgoogle\s+cloud\b/i],
  ['Terraform', /\bterraform\b/i],
  ['GraphQL', /\bgraphql\b/i],
  ['gRPC', /\bgrpc\b/i],
  ['Three.js / WebGL', /\bthree(?:\.js|js)\b|\bwebgl\b/i],
  ['SQL', /\bsql\b/i],
  // Architectural & Systems Engineering Concepts (Crucial for Senior/Startup JDs like CLANX)
  ['Distributed Systems', /\bdistributed\s+systems?\b|\bhigh\s+availability\b|\bfault[\s-]+toleran/i],
  ['System Design & Architecture', /\bsystem\s+design\b|\barchitecture\s+ownership\b|\bmicroservices?\b|\bscalability\b/i],
  ['Data Modelling & Consistency', /\bdata\s+modelling\b|\bdata\s+modeling\b|\bconsistency\b|\bisolation\b|\bacid\b|\btransactions?\b/i],
  ['Event-Driven / Event Sourcing', /\bevent[\s-]+sourced\b|\bevent[\s-]+driven\b|\bevent\s+streaming\b|\bmessage\s+queues?\b/i],
  ['Multi-Tenant Architecture', /\bmulti[\s-]+tenant\b|\btenant\s+isolation\b/i],
  ['Concurrency & Scale', /\bconcurrency\b|\bhigh[\s-]+throughput\b|\blow[\s-]+latency\b/i],
  ['Agentic AI / LLM Systems', /\bagentic\b|\bllm\b|\brag\b|\blangchain\b|\bautonomous\s+ai\b|\bgenerative\s+ai\b|\bmistral\b/i],
  ['CI/CD & Observability', /\bci\/cd\b|\bprometheus\b|\bgrafana\b|\bobservability\b|\btelemetry\b/i],
];

/**
 * Decodes HTML entities (&#39;, &amp;, &quot;, &nbsp;, etc.) and converts raw HTML
 * into clean text + structured sections without cutting words in half.
 */
function sanitizeAndStructureHtmlDescription(rawHtml: string): {
  cleanSummary: string;
  cleanFullText: string;
  sections: { heading: string; bullets: string[] }[];
} {
  if (!rawHtml) {
    return { cleanSummary: '', cleanFullText: '', sections: [] };
  }

  // 1. Decode HTML entities
  let decoded = rawHtml
    .replace(/&#39;|&#x27;|&apos;/gi, "'")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&amp;|&#38;/gi, '&')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&lt;|&#60;/gi, '<')
    .replace(/&gt;|&#62;/gi, '>')
    .replace(/&ndash;|&#8211;/gi, '–')
    .replace(/&mdash;|&#8212;/gi, '—')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));

  // 2. Convert structural HTML tags into clean line breaks and bullet markers
  const structuredText = decoded
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '\n• ')
    .replace(/<\/\s*li\s*>/gi, '')
    .replace(/<\s*(?:p|div|ul|ol|h[1-6])[^>]*>/gi, '\n')
    .replace(/<\/\s*(?:p|div|ul|ol|h[1-6])\s*>/gi, '\n')
    .replace(/<\s*strong[^>]*>(.*?)<\/\s*strong\s*>/gi, '**$1**')
    .replace(/<\s*b[^>]*>(.*?)<\/\s*b\s*>/gi, '**$1**')
    .replace(/<[^>]+>/g, ' ') // Strip any remaining HTML tags
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();

  // 3. Parse into logical sections (Role, Requirements, Bonus, Responsibilities, Interview Process)
  const lines = structuredText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const sections: { heading: string; bullets: string[] }[] = [];
  let currentSection = { heading: 'Overview', bullets: [] as string[] };

  const headingRegex =
    /^\*\*(Company\s+Details|The\s+Role|About\s+the\s+Role|Requirements|Qualifications|Bonus\s+Qualifications|Nice\s+to\s+Have|Responsibilities|What\s+You'll\s+Do|30\s*\/\s*60\s*\/\s*90[\s-]*Day\s+Expectations|Job\s+Details|Interview\s+Process|Important\s+Note)\*\*$/i;

  for (const line of lines) {
    const cleanLine = line.replace(/\*\*/g, '').trim();
    if (headingRegex.test(line) || (line.startsWith('**') && line.endsWith('**') && cleanLine.length < 42)) {
      if (currentSection.bullets.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { heading: cleanLine, bullets: [] };
    } else {
      const bulletText = cleanLine.replace(/^•\s*/, '').trim();
      if (bulletText && bulletText !== 'Website:') {
        currentSection.bullets.push(bulletText);
      }
    }
  }
  if (currentSection.bullets.length > 0) {
    sections.push(currentSection);
  }

  // 4. Safe sentence-boundary summary (never cuts mid-word like "ClanX i")
  const plainNoMarkdown = structuredText.replace(/\*\*/g, '');
  let cleanSummary = plainNoMarkdown.slice(0, 320);
  if (plainNoMarkdown.length > 320) {
    const lastPeriod = cleanSummary.lastIndexOf('. ');
    const lastSpace = cleanSummary.lastIndexOf(' ');
    cleanSummary =
      lastPeriod > 140
        ? cleanSummary.slice(0, lastPeriod + 1)
        : cleanSummary.slice(0, Math.max(200, lastSpace)) + '…';
  }

  return {
    cleanSummary,
    cleanFullText: plainNoMarkdown.slice(0, 5000),
    sections,
  };
}

/**
 * Accurately extracts minimum YOE from patterns like:
 * - "7+ years in backend and distributed systems" (CLANX pattern!)
 * - "5+ years of experience"
 * - "Minimum 3 years building..."
 * - Or infers from "Senior / Staff / Principal / Lead" title if not explicitly stated
 */
function extractRequiredYoeFromJob(title: string, cleanText: string): {
  minYoe: number;
  seniorityLevel: 'Intern / Entry' | 'Junior (SDE-1)' | 'Mid-Level (SDE-2)' | 'Senior (SDE-3)' | 'Staff / Principal';
} {
  const patterns = [
    /\b(\d{1,2})\+?\s*(?:to|-|–)?\s*(?:\d{1,2}\s*)?(?:years?|yrs?)\s+(?:of\s+)?(?:relevant\s+|professional\s+|industry\s+|hands[\s-]+on\s+)?(?:experience|exp|in\s+backend|in\s+software|in\s+engineering|in\s+distributed|in\s+frontend|in\s+full[\s-]+stack|building|developing|working|designing)/i,
    /\b(?:minimum|at\s+least|requires?)\s+(\d{1,2})\+?\s*(?:years?|yrs?)/i,
    /\b(\d{1,2})\s*[-–to]+\s*\d{1,2}\s*(?:years?|yrs?)/i,
  ];

  let detectedYoe: number | null = null;
  for (const regex of patterns) {
    const m = regex.exec(cleanText);
    if (m) {
      const val = parseInt(m[1], 10);
      if (val >= 0 && val <= 18) {
        detectedYoe = val;
        break;
      }
    }
  }

  const titleLower = title.toLowerCase();
  if (detectedYoe === null) {
    if (/\b(principal|staff|architect|distinguished|head\s+of|vp)\b/i.test(titleLower)) detectedYoe = 7;
    else if (/\b(senior|sr\.?|lead|sde[\s-]*3|sde[\s-]*iii)\b/i.test(titleLower)) detectedYoe = 5;
    else if (/\b(mid|sde[\s-]*2|sde[\s-]*ii|software\s+engineer\s+ii)\b/i.test(titleLower)) detectedYoe = 2;
    else if (/\b(intern|trainee|fresher|graduate|apprentice|entry)\b/i.test(titleLower)) detectedYoe = 0;
    else detectedYoe = 1;
  }

  const seniorityLevel =
    detectedYoe >= 7
      ? 'Staff / Principal'
      : detectedYoe >= 4
      ? 'Senior (SDE-3)'
      : detectedYoe >= 2
      ? 'Mid-Level (SDE-2)'
      : detectedYoe >= 1
      ? 'Junior (SDE-1)'
      : 'Intern / Entry';

  return { minYoe: detectedYoe, seniorityLevel };
}

function formatRelativePostedDate(rawDate: string): string {
  if (!rawDate) return 'Recently';
  const parsed = new Date(rawDate);
  if (isNaN(parsed.getTime())) return rawDate;

  const diffMs = Date.now() - parsed.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const formattedShort = parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (diffDays <= 0) return `Today • ${formattedShort}`;
  if (diffDays === 1) return `Yesterday • ${formattedShort}`;
  if (diffDays < 30) return `${diffDays}d ago • ${formattedShort}`;
  return formattedShort;
}

function extractSkillsAndConcepts(text: string, existingTags: string[] = []): string[] {
  const found = new Set<string>();
  for (const t of existingTags) {
    if (typeof t === 'string' && t.trim().length > 1 && t.trim().length < 35) {
      found.add(t.trim());
    }
  }
  for (const [canonical, regex] of SKILL_AND_CONCEPT_PATTERNS) {
    if (regex.test(text)) {
      found.add(canonical);
    }
  }
  return Array.from(found);
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request } = context;
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const url = new URL(request.url);
    const roleQuery = (url.searchParams.get('q') || url.searchParams.get('role') || '').trim();
    const skillsParam = (url.searchParams.get('skills') || '').trim();
    const countryParam = (url.searchParams.get('country') || 'India').trim();
    const cityParam = (url.searchParams.get('location') || url.searchParams.get('preferredCity') || '').trim();
    const workModeParam = (url.searchParams.get('work_mode') || url.searchParams.get('workMode') || 'all').toLowerCase();
    const limit = Math.min(80, Math.max(25, parseInt(url.searchParams.get('limit') || '50', 10)));

    const topSkills = skillsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    const targetedQuery = [roleQuery, ...topSkills.slice(0, 2)].filter(Boolean).join(' ').trim() || 'software engineer';

    const searchParams1 = new URLSearchParams({
      q: targetedQuery,
      limit: String(limit),
      offset: '0',
      include_description: 'true',
      description_format: 'markdown',
    });
    if (workModeParam === 'remote' || workModeParam === 'hybrid' || workModeParam === 'onsite') {
      searchParams1.set('work_mode', workModeParam);
    }
    if (cityParam && !cityParam.toLowerCase().includes('anywhere') && !cityParam.toLowerCase().includes('all')) {
      searchParams1.set('location', cityParam);
    } else if (countryParam) {
      searchParams1.set('location', countryParam);
    }

    const [res1, res2] = await Promise.allSettled([
      fetch(`${FREEHIRE_AGENT_SEARCH_URL}?${searchParams1.toString()}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'SDETube-CareerEngine/4.0' },
      }),
      fetch(
        `${FREEHIRE_AGENT_SEARCH_URL}?q=${encodeURIComponent(roleQuery || 'software engineer')}&limit=${limit}&include_description=true&description_format=markdown`,
        { headers: { Accept: 'application/json', 'User-Agent': 'SDETube-CareerEngine/4.0' } }
      ),
    ]);

    const rawJobs: any[] = [];
    const seen = new Set<string>();

    const collect = async (settled: PromiseSettledResult<Response>) => {
      if (settled.status !== 'fulfilled' || !settled.value.ok) return;
      try {
        const payload: any = await settled.value.json();
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.jobs)
          ? payload.jobs
          : [];
        for (const item of list) {
          const key = String(item.id || item.job_id || item.slug || `${item.title}-${item.company_name || item.company}`);
          if (!seen.has(key)) {
            seen.add(key);
            rawJobs.push(item);
          }
        }
      } catch {
        // Ignore parse error
      }
    };

    await collect(res1);
    await collect(res2);

    if (rawJobs.length < 5) {
      try {
        const fb = await fetch(`${FREEHIRE_JOBS_LIST_URL}?limit=50`);
        if (fb.ok) {
          const fbJson: any = await fb.json();
          const list = Array.isArray(fbJson?.data) ? fbJson.data : [];
          for (const item of list) {
            const key = String(item.id || `${item.title}-${item.company}`);
            if (!seen.has(key)) {
              seen.add(key);
              rawJobs.push(item);
            }
          }
        }
      } catch {
        // Ignore fallback error
      }
    }

    const jobs = rawJobs.map((job, idx) => {
      const title = String(job.title || job.role || 'Software Engineer').trim();
      const company = String(job.company_name || job.company || 'Tech Company').trim();
      const location = String(job.location || job.city || (job.remote ? 'Remote' : 'Global / Remote')).trim();
      const rawDesc = String(job.description || job.summary || '').trim();

      // Sanitize HTML & structure sections so raw <p><strong> tags never appear in UI
      const { cleanSummary, cleanFullText, sections } = sanitizeAndStructureHtmlDescription(rawDesc);

      const rawTags = Array.isArray(job.skills)
        ? job.skills
        : Array.isArray(job.tags)
        ? job.tags
        : [];

      const extractedSkills = extractSkillsAndConcepts(`${title} ${cleanFullText}`, rawTags);
      const { minYoe, seniorityLevel } = extractRequiredYoeFromJob(title, cleanFullText);

      const rawMode = String(job.work_mode || job.workplace_type || '').toLowerCase();
      const workMode: 'remote' | 'hybrid' | 'onsite' =
        rawMode === 'remote' || /\bremote\b|\bwork\s+from\s+home\b/i.test(`${location} ${cleanFullText}`)
          ? 'remote'
          : rawMode === 'hybrid' || /\bhybrid\b/i.test(`${location} ${cleanFullText}`)
          ? 'hybrid'
          : 'onsite';

      const salaryText = String(job.salary || job.salary_range || 'Competitive Market Pay');
      const postedAtFormatted = formatRelativePostedDate(String(job.posted_at || job.created_at || ''));

      return {
        id: String(job.id || job.job_id || `fh-${idx}`),
        title,
        company,
        location,
        remote: workMode === 'remote',
        workMode,
        salaryText,
        salaryRangeText: salaryText,
        applyUrl: String(job.apply_url || job.url || 'https://freehire.me/jobs'),
        postedAt: postedAtFormatted,
        postedAtFormatted,
        postedAtRaw: String(job.posted_at || job.created_at || ''),
        extractedSkills,
        requiredMinYoe: minYoe,
        seniorityLevel,
        cleanSummary,
        cleanFullText,
        rawDescription: cleanFullText,
        structuredSections: sections,
        source: 'FreeHire' as const,
      };
    });

    return new Response(
      JSON.stringify({
        ok: true,
        success: true,
        queryUsed: targetedQuery,
        totalFound: jobs.length,
        count: jobs.length,
        jobs
      }),
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Cache-Control': 'public, max-age=1800, s-maxage=3600',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, success: false, error: err?.message || 'Error fetching jobs', jobs: [] }),
      { status: 200, headers: CORS_HEADERS }
    );
  }
};
