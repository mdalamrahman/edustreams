const SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'C++', 'C#',
  'Go', 'Rust', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'AWS', 'Azure', 'GCP', 'Docker',
  'Kubernetes', 'Terraform', 'Selenium', 'Playwright', 'Cypress', 'Git', 'CI/CD', 'REST', 'GraphQL',
  'Linux', 'Kafka', 'Spark', 'Excel', 'Power BI', 'Tableau', 'Figma', 'Agile', 'Accessibility',
];

function containsTerm(text: string, term: string) {
  const escaped = term.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&');
  return new RegExp('(?:^|[^\\w])' + escaped + '(?!\\w)', 'i').test(text);
}

export function assessResume(resume: string, jobDescription = '') {
  const lines = resume.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const sections = ['Experience', 'Education', 'Skills', 'Projects'].filter(
    name => lines.some(line => new RegExp('^(?:(?:work|technical|professional) )?' + name + '\\s*:?$', 'i').test(line)),
  );
  const measuredBullets = lines.filter(line => /\d+(?:\.\d+)?\s*(?:%|ms\b|users\b|hours\b|requests\b)/i.test(line)).length;
  const checks = [
    { label: 'Text extraction', detail: 'Selectable document text was read. Review the file’s reading order and layout separately.' },
    { label: 'Section headings', detail: sections.length ? sections.join(', ') : 'No standard headings detected. Use headings such as Experience, Education, or Skills.' },
    { label: 'Contact information', detail: /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(resume) ? 'An email address was detected.' : 'No email address was detected.' },
    { label: 'Measurable results', detail: measuredBullets ? measuredBullets + ' lines contain a recognizable impact metric.' : 'No impact metrics were detected. Include quantities or outcomes where you can substantiate them.' },
  ];
  const terms = SKILLS.filter(term => containsTerm(jobDescription, term));
  const requirements = terms.map(term => {
    const line = lines.find(text => containsTerm(text, term));
    if (!line) return { term, evidence: null };
    const matchAt = line.toLowerCase().indexOf(term.toLowerCase());
    const start = Math.max(0, matchAt - 65);
    const end = Math.min(line.length, matchAt + term.length + 100);
    return { term, evidence: (start ? '…' : '') + line.slice(start, end) + (end < line.length ? '…' : '') };
  });
  return {
    checks,
    match: requirements.length ? {
      requirements,
      score: Math.round(100 * requirements.filter(item => item.evidence).length / requirements.length),
    } : null,
  };
}
