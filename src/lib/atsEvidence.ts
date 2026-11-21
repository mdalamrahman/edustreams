const aliases: Record<string, string[]> = {
  JavaScript: ['JavaScript', 'ECMAScript'],
  TypeScript: ['TypeScript'],
  React: ['React', 'React.js', 'ReactJS'],
  'Next.js': ['Next.js', 'NextJS'],
  Angular: ['Angular'],
  Vue: ['Vue', 'Vue.js', 'VueJS'],
  'Node.js': ['Node.js', 'NodeJS'],
  Python: ['Python'], Java: ['Java'], 'C++': ['C++'], 'C#': ['C#'],
  Go: ['Golang', 'Go'], Rust: ['Rust'], SQL: ['SQL'],
  PostgreSQL: ['PostgreSQL', 'Postgres'], MySQL: ['MySQL'], MongoDB: ['MongoDB'], Redis: ['Redis'],
  AWS: ['AWS', 'Amazon Web Services'], Azure: ['Azure'], GCP: ['GCP', 'Google Cloud Platform', 'Google Cloud'],
  Docker: ['Docker'], Kubernetes: ['Kubernetes', 'K8s'], Terraform: ['Terraform'],
  Selenium: ['Selenium'], Playwright: ['Playwright'], Cypress: ['Cypress'], Git: ['Git'],
  'CI/CD': ['CI/CD', 'CI-CD', 'continuous integration'], REST: ['REST', 'RESTful'], GraphQL: ['GraphQL'],
  Linux: ['Linux'], Kafka: ['Kafka'], Spark: ['Apache Spark', 'PySpark'], Excel: ['Excel', 'Microsoft Excel'],
  'Power BI': ['Power BI'], Tableau: ['Tableau'], Figma: ['Figma'],
  Accessibility: ['WCAG', 'web accessibility'], 'API testing': ['API testing', 'Postman'],
  'Test automation': ['test automation', 'automated testing'], 'System design': ['system design'],
  Observability: ['observability', 'OpenTelemetry', 'Prometheus'], Security: ['application security', 'OWASP'],
};

type Section = 'Experience' | 'Education' | 'Skills' | 'Projects' | 'Summary' | 'Certifications';
const headings: [Section, RegExp][] = [
  ['Experience', /^(?:(?:work|professional|relevant|employment|career) )?(?:experience|history)$/i],
  ['Education', /^(?:education|academic background|qualifications)$/i],
  ['Skills', /^(?:(?:technical|core) )?(?:skills|competencies|technologies|tech stack)$/i],
  ['Projects', /^(?:(?:technical|personal|selected|academic) )?projects$/i],
  ['Summary', /^(?:(?:professional|career) )?(?:summary|profile|objective)$/i],
  ['Certifications', /^(?:certifications|licenses and certifications)$/i],
];

export function resumeHeading(line: string) {
  return headings.find(([, pattern]) => pattern.test(line.trim().replace(/:$|^#+\s*/g, '')))?.[0];
}

const patterns = Object.entries(aliases).map(([term, terms]) => ({
  term,
  regexes: terms.map(alias => alias === 'Go' ? /(?:^|[^A-Za-z])Go(?![A-Za-z])/
    : new RegExp('(?:^|[^\\w])(' + alias.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&') + ')(?![\\w])', 'i')),
}));

function termsIn(text: string) {
  return patterns.filter(({ regexes }) => regexes.some(regex => regex.test(text))).map(({ term }) => term);
}

export function assessResume(resume: string, jobDescription = '', preferredText = '') {
  const sections = new Set<Section>();
  let section: Section | undefined;
  const lines = resume.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(text => {
    const heading = resumeHeading(text);
    if (heading) {
      section = heading;
      sections.add(heading);
    }
    return { text, section };
  });
  const measuredBullets = lines.filter(line => (line.section === 'Experience' || line.section === 'Projects') &&
    /\b\d[\d,.]*\s*(?:%|ms\b|users\b|hours\b|requests\b|tests?\b|seconds\b|minutes\b|clients?\b|\bx\b)/i.test(line.text)).length;
  const hasEmail = /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(resume);
  const checks = [
    { label: 'Text extraction', status: 'Detected', detail: 'Readable text was extracted. Check the text order below, especially if the original uses columns.' },
    { label: 'Section headings', status: sections.size ? 'Detected' : 'Review', detail: sections.size ? [...sections].join(', ') : 'Use standard headings such as Experience, Education, and Skills.' },
    { label: 'Contact information', status: hasEmail ? 'Detected' : 'Review', detail: hasEmail ? 'An email address was found.' : 'An email address was not found in the extracted text.' },
    { label: 'Measurable results', status: measuredBullets ? 'Detected' : 'Review', detail: measuredBullets ? measuredBullets + ' experience or project lines contain a detectable quantity.' : 'Add measurable outcomes where you can substantiate them.' },
  ];
  const evidenceRank = (name?: Section) => name === 'Experience' ? 3 : name === 'Projects' ? 2 : name === 'Skills' ? 1 : 0;
  const evidence = patterns.map(({ term, regexes }) => {
    const entries = lines.flatMap(line => {
      const match = regexes.map(regex => regex.exec(line.text)).find(Boolean);
      return match ? [{ ...line, position: match.index }] : [];
    });
    const best = entries.sort((a, b) => evidenceRank(b.section) - evidenceRank(a.section))[0];
    const start = Math.max(0, (best?.position ?? 0) - 60);
    const end = (best?.position ?? 0) + 110;
    return {
      term,
      section: best?.section,
      evidence: best ? (start ? '\u2026' : '') + best.text.slice(start, end) + (end < best.text.length ? '\u2026' : '') : null,
    };
  });
  const coreLines: string[] = [];
  const preferredLines: string[] = [];
  let inPreferred = false;
  for (const line of jobDescription.split(/\r?\n/)) {
    const heading = line.trim().replace(/^#+\s*|\*+/g, '');
    if (/^(?:preferred qualifications|preferred skills|nice[- ]to[- ]haves?|bonus skills)\s*:?$/i.test(heading)) {
      inPreferred = true;
    } else if (/^(?:required qualifications|required skills|minimum qualifications|requirements|responsibilities|benefits)\s*:?$/i.test(heading)) {
      inPreferred = false;
    } else {
      (inPreferred ? preferredLines : coreLines).push(line);
    }
  }
  const core = termsIn(coreLines.join('\n'));
  const preferred = termsIn(preferredLines.join('\n') + '\n' + preferredText).filter(term => !core.includes(term));
  const requirements = evidence.filter(item => core.includes(item.term) || preferred.includes(item.term))
    .map(item => ({ ...item, preferred: preferred.includes(item.term) }));
  return {
    checks,
    skills: evidence.filter(item => item.evidence),
    match: requirements.length ? {
      requirements,
      matched: requirements.filter(item => item.evidence).length,
      score: Math.round(100 * requirements.filter(item => item.evidence).length / requirements.length),
    } : null,
  };
}

export function prioritizeResumeBullets(resume: string, jobDescription: string) {
  const desired = new Set(termsIn(jobDescription));
  const relevance = (line: string) => termsIn(line).filter(term => desired.has(term)).length;
  const lines = resume.split('\n');
  const bullet = /^\s*(?:[-*\u2022]\s+|\d+[.)]\s+)/;
  let section: Section | undefined;
  for (let index = 0; index < lines.length; index++) {
    section = resumeHeading(lines[index]) || section;
    if ((section !== 'Experience' && section !== 'Projects') || !bullet.test(lines[index]) ||
        /^\s*\d+[.)]/.test(lines[index])) continue;
    const start = index;
    while (index + 1 < lines.length && /^\s*[-*\u2022]\s+/.test(lines[index + 1])) index++;
    // A continuation belongs with its existing bullet. Only reorder complete, single-line groups.
    if (index === start || (index + 1 < lines.length && lines[index + 1].trim() && !resumeHeading(lines[index + 1]))) continue;
    const group = lines.slice(start, index + 1).map(line => ({ line, rank: relevance(line) }));
    lines.splice(start, group.length, ...group.sort((a, b) => b.rank - a.rank).map(item => item.line));
  }
  return lines.join('\n');
}
