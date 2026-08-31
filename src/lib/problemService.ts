import { SupportedLanguage } from './compiler';
import { TELEGRAM_BACKEND_URL } from './telegram';
import { MISTRAL_API_KEY, requestAIDriverGeneration, executeAIChatCascade } from './mistral';

export interface ProblemApproach {
  id: string;
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  starters?: Record<SupportedLanguage, string>;
  solutionCode?: Record<SupportedLanguage, string>;
}

export interface ProblemTemplate {
  name: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
    image?: string;
  }[];
  constraints: string[];
  testCases: string[];
  expectedOutputs?: string[];
  hints?: string[];
  approaches?: ProblemApproach[];
  starters: Record<SupportedLanguage, string>;
  solutions?: Record<SupportedLanguage, string>;
  driverCode?: Partial<Record<SupportedLanguage, string>>;
}

// Normalize problem titles into clean slugs
export const normalizeProblemTitle = (title?: string): string => {
  return (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Extracts a clean slug from any string or URL (e.g. "https://leetcode.com/problems/assign-cookies/" -> "assign-cookies")
 */
export const toSlug = (str?: string): string => {
  if (!str) return 'algorithm-problem';
  let s = String(str).trim();

  // If search URL like https://leetcode.com/problem-list/all/?search=xyz, extract search query
  if (s.toLowerCase().includes('search=') || s.toLowerCase().includes('problem-list')) {
    try {
      const url = new URL(s.startsWith('http') ? s : `https://${s}`);
      const searchVal = url.searchParams.get('search');
      if (searchVal) {
        s = searchVal;
      }
    } catch {}
  }

  // If GFG problem URL, extract slug accurately
  if (s.toLowerCase().includes('geeksforgeeks.org/problems/')) {
    const match = s.match(/geeksforgeeks\.org\/problems\/([^/?#\s]+)/i);
    if (match && match[1]) {
      s = match[1];
    }
  }

  // If full URL or contains leetcode.com/problems/, extract the problem slug accurately
  if (s.startsWith('http://') || s.startsWith('https://') || s.toLowerCase().includes('leetcode.com/problems/')) {
    try {
      const match = s.match(/leetcode\.com\/problems\/([^/?#\s]+)/i);
      if (match && match[1]) {
        s = match[1];
      } else {
        const url = new URL(s.startsWith('http') ? s : `https://${s}`);
        const segments = url.pathname.split('/').filter(Boolean);
        const probIdx = segments.indexOf('problems');
        if (probIdx !== -1 && segments[probIdx + 1]) {
          s = segments[probIdx + 1];
        } else if (segments.length > 0) {
          s = segments[segments.length - 1];
        }
      }
    } catch {
      s = s.replace(/^https?:\/\/[^/]+\//, '');
    }
  }

  // Remove trailing sub-paths like /description/ or /editorial/ or /1
  s = s.replace(/\/(description|editorial|solutions|discussion|comments|\d+)\/?$/i, '');

  const slug = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (!slug || slug === 'https' || slug === 'http' || slug === 'www' || slug === 'com' || slug === 'problems' || slug === 'all' || slug === 'problem-list') {
    return 'algorithm-problem';
  }
  return slug;
};

/**
 * Deletes cached problem specifications, test cases, and drivers so they can be regenerated.
 */
export const clearProblemCache = (slugOrTitle?: string): void => {
  try {
    if (slugOrTitle) {
      const slug = toSlug(slugOrTitle);
      localStorage.removeItem(`edustream_problem_spec_${slug}`);
      localStorage.removeItem(`edustream_testcases_txt_${slug}`);
      localStorage.removeItem(`edustream_editorial_${slug}`);
      localStorage.removeItem(`edustream_problem_override_${slug}`);
      const langs = ['cpp', 'python', 'java', 'javascript', 'go', 'rust'];
      langs.forEach(lang => {
        localStorage.removeItem(`edustream_driver_${lang}_${slug}`);
      });
    } else {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('edustream_problem_spec_') ||
            key.startsWith('edustream_testcases_txt_') ||
            key.startsWith('edustream_driver_') ||
            key.startsWith('edustream_editorial_'))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
  } catch (e) {
    console.warn('[clearProblemCache]:', e);
  }
};

/**
 * Extracts a human-friendly clean title (e.g. "https://leetcode.com/problems/assign-cookies/" -> "Assign Cookies")
 */
export const getCleanTitle = (str?: string): string => {
  if (!str) return 'Algorithm Problem';
  let s = String(str).trim();
  if (s.startsWith('http://') || s.startsWith('https://') || s.toLowerCase().includes('leetcode.com/problems/')) {
    const slug = toSlug(s);
    if (slug !== 'algorithm-problem') {
      return slug
        .split('-')
        .filter(w => w && !['https', 'http', 'leetcode', 'com', 'problems', 'description'].includes(w))
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ') || 'Algorithm Problem';
    }
  }
  const clean = s.replace(/-/g, ' ').replace(/_/g, ' ').trim();
  return clean || 'Algorithm Problem';
};

/**
 * Generate human-readable .txt testcase content for cloud/local storage
 */
export function formatProblemAsTxt(problem: ProblemTemplate): string {
  const lines: string[] = [
    `=== PROBLEM: ${problem.name} ===`,
    `CATEGORY: ${problem.category}`,
    `DIFFICULTY: ${problem.difficulty}`,
    ``,
    `=== DESCRIPTION ===`,
    problem.description,
    ``,
    `=== CONSTRAINTS ===`,
    ...(problem.constraints || []).map(c => `- ${c}`),
    ``,
    `=== TESTCASES (${problem.testCases?.length || 0}) ===`
  ];

  const tcs = problem.testCases || [];
  const eos = problem.expectedOutputs || [];

  tcs.forEach((tc, idx) => {
    const eo = eos[idx] || '';
    lines.push(`--- CASE ${idx + 1} ---`);
    lines.push(`INPUT: ${tc}`);
    lines.push(`EXPECTED: ${eo}`);
    lines.push(``);
  });

  if (problem.solutions && Object.keys(problem.solutions).length > 0) {
    lines.push(`=== OFFICIAL REFERENCE SOLUTIONS ===`);
    Object.entries(problem.solutions).forEach(([lang, solCode]) => {
      if (solCode && solCode.trim()) {
        lines.push(`--- LANGUAGE: ${lang.toUpperCase()} ---`);
        lines.push(solCode.trim());
        lines.push(``);
      }
    });
  }

  if (problem.approaches && problem.approaches.length > 0) {
    lines.push(`=== APPROACHES & COMPLEXITY ===`);
    problem.approaches.forEach((app, i) => {
      lines.push(`--- APPROACH ${i + 1}: ${app.name} ---`);
      lines.push(`TIME COMPLEXITY: ${app.timeComplexity}`);
      lines.push(`SPACE COMPLEXITY: ${app.spaceComplexity}`);
      lines.push(`DESCRIPTION: ${app.description}`);
      lines.push(``);
    });
  }

  return lines.join('\n');
}

/**
 * Dynamic starter code generator for any problem name and category.
 * Sanitizes URLs and unwanted words so method names are always valid identifiers.
 */
export function generateDefaultStarters(titleOrSlug: string): Record<SupportedLanguage, string> {
  const slug = toSlug(titleOrSlug);
  const words = slug.split('-').filter(w => w && !['https', 'http', 'leetcode', 'com', 'problems', 'description', 'algorithm', 'problem'].includes(w));
  const camelCase = words.length > 0
    ? words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    : 'solve';
  const snakeCase = words.map(w => w.toLowerCase()).join('_') || 'solve';

  return {
    cpp: `class Solution {\npublic:\n    int ${camelCase}(vector<int>& nums) {\n        // Implement optimal solution\n        return 0;\n    }\n};`,
    python: `class Solution:\n    def ${camelCase}(self, nums: List[int]) -> int:\n        # Implement optimal solution\n        return 0`,
    java: `class Solution {\n    public int ${camelCase}(int[] nums) {\n        // Implement optimal solution\n        return 0;\n    }\n}`,
    javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar ${camelCase} = function(nums) {\n    // Implement optimal solution\n    return 0;\n};`,
    go: `func ${camelCase}(nums []int) int {\n    // Implement optimal solution\n    return 0\n}`,
    rust: `impl Solution {\n    pub fn ${snakeCase}(nums: Vec<i32>) -> i32 {\n        // Implement optimal solution\n        0\n    }\n}`,
    sql: `-- Write your PostgreSQL / MySQL query here\nSELECT * FROM table_name;`
  };
}

/**
 * Extracts parameter names from starter code or examples
 */
export function extractParamNames(starters: Record<SupportedLanguage, string> | undefined, examples: { input: string }[] | undefined): string[] {
  const pyCode = starters?.python || '';
  if (pyCode) {
    const match = pyCode.match(/def\s+[a-zA-Z0-9_]+\s*\(\s*self\s*,\s*([^)]+)\)/);
    if (match) {
      const parts = match[1].split(',').map(p => p.trim().split(':')[0].trim()).filter(p => p && p !== 'self');
      if (parts.length > 0) return parts;
    }
  }

  const cppCode = starters?.cpp || '';
  if (cppCode) {
    const match = cppCode.match(/[a-zA-Z0-9_<>]+\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)/);
    if (match) {
      const parts = match[2].split(',').map(p => {
        const tokens = p.trim().replace(/[&*]/g, ' ').split(/\s+/).filter(Boolean);
        return tokens[tokens.length - 1];
      }).filter(Boolean);
      if (parts.length > 0) return parts;
    }
  }

  if (examples && examples.length > 0) {
    for (const ex of examples) {
      const matches = Array.from(ex.input.matchAll(/([a-zA-Z0-9_]+)\s*=/g)).map(m => m[1]);
      if (matches.length > 0) return matches;
    }
  }

  return [];
}

/**
 * Hardens problem testcases so that multi-parameter questions (like Two Sum)
 * NEVER split parameters across different testcase lines.
 */
export function repairAndHardenProblem(problem: ProblemTemplate): ProblemTemplate {
  if (!problem) return problem;

  // Guarantee array properties are always defined
  problem.examples = Array.isArray(problem.examples) ? problem.examples : [];
  problem.constraints = Array.isArray(problem.constraints) ? problem.constraints : [];
  problem.testCases = Array.isArray(problem.testCases) ? problem.testCases : [];
  problem.expectedOutputs = Array.isArray(problem.expectedOutputs) ? problem.expectedOutputs : [];
  problem.hints = Array.isArray(problem.hints) ? problem.hints : [];
  problem.approaches = Array.isArray(problem.approaches) ? problem.approaches : [];
  if (!problem.starters || Object.keys(problem.starters).length === 0) {
    problem.starters = generateDefaultStarters(problem.name || 'algorithm');
  }
  if (!problem.solutions) {
    problem.solutions = problem.starters;
  }

  const paramNames = extractParamNames(problem.starters, problem.examples);
  const numParams = paramNames.length;
  const tcs = problem.testCases || [];

  // 1. Single parameter questions (e.g. grid = [...], nums = [...], s = "...")
  if (numParams === 1 && paramNames[0] && tcs.length > 0) {
    const pName = paramNames[0];
    problem.testCases = tcs.map(tc => {
      const str = String(tc).trim();
      if (!str.includes('=')) {
        return `${pName} = ${str}`;
      }
      return str;
    });
  }

  // 2. Multi-parameter questions: Ensure parameters are never split across separate array items
  else if (numParams >= 2 && tcs.length > 0) {
    // Check if testcases are split across lines
    const isBroken = tcs.some(tc => {
      const str = String(tc).trim();
      return !str.includes('=') || paramNames.some(p => !str.includes(p));
    });

    if (isBroken) {
      if (tcs.length % numParams === 0 && tcs.length >= numParams) {
        const fixedTcs: string[] = [];
        for (let i = 0; i < tcs.length; i += numParams) {
          const chunk = tcs.slice(i, i + numParams);
          const parts = chunk.map((val, idx) => {
            const vStr = String(val).trim();
            if (vStr.includes('=')) return vStr;
            const pName = paramNames[idx] || `arg${idx + 1}`;
            return `${pName} = ${vStr}`;
          });
          fixedTcs.push(parts.join(', '));
        }
        problem.testCases = fixedTcs;
      } else if (problem.examples && problem.examples.length > 0) {
        const validEx = problem.examples.filter(e => e.input && e.input.includes('='));
        if (validEx.length > 0) {
          problem.testCases = validEx.map(e => e.input);
          problem.expectedOutputs = validEx.map(e => e.output);
        }
      }
    }
  }

  // Filter out any completely invalid testcases
  if (problem.testCases && problem.expectedOutputs) {
    const validPairs: { input: string; output: string }[] = [];
    const isNextPerm = (problem.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes('nextpermutation');

    for (let i = 0; i < problem.testCases.length; i++) {
      const tc = String(problem.testCases[i] || '').trim();
      const eo = String(problem.expectedOutputs[i] || '').trim();
      if (!tc) continue;

      if (isNextPerm && (tc === 'nums = []' || tc === '[]' || tc === 'nums = [ ]')) {
        continue;
      }
      validPairs.push({ input: tc, output: eo });
    }

    if (validPairs.length > 0) {
      problem.testCases = validPairs.map(p => p.input);
      problem.expectedOutputs = validPairs.map(p => p.output);
    }
  }

  // Ensure minimum 10 verified test cases for Next Permutation
  const normProblemName = (problem.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normProblemName.includes('nextpermutation') && (!problem.testCases || problem.testCases.length < 10)) {
    const standardNextPermCases = [
      { input: 'nums = [1, 2, 3]', output: '[1, 3, 2]' },
      { input: 'nums = [3, 2, 1]', output: '[1, 2, 3]' },
      { input: 'nums = [1, 1, 5]', output: '[1, 5, 1]' },
      { input: 'nums = [1, 3, 2]', output: '[2, 1, 3]' },
      { input: 'nums = [2, 3, 1]', output: '[3, 1, 2]' },
      { input: 'nums = [1]', output: '[1]' },
      { input: 'nums = [5, 4, 7, 5, 3, 2]', output: '[5, 5, 2, 3, 4, 7]' },
      { input: 'nums = [1, 5, 1]', output: '[5, 1, 1]' },
      { input: 'nums = [2, 1, 2, 2, 2, 2, 2, 1]', output: '[2, 2, 1, 1, 2, 2, 2, 2]' },
      { input: 'nums = [4, 2, 0, 2, 3, 2, 0]', output: '[4, 2, 0, 3, 0, 2, 2]' }
    ];
    problem.testCases = standardNextPermCases.map(c => c.input);
    problem.expectedOutputs = standardNextPermCases.map(c => c.output);
  }

  // Ensure minimum 10 test cases for Two Sum
  if (paramNames.includes('nums') && paramNames.includes('target') && (!problem.testCases || problem.testCases.length < 10 || isTwoSum(problem.name))) {
    const standardTwoSumCases = [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' },
      { input: 'nums = [3, 3], target = 6', output: '[0, 1]' },
      { input: 'nums = [1, 5, 8, 3], target = 4', output: '[0, 3]' },
      { input: 'nums = [-1, -2, -3, -4, -5], target = -8', output: '[2, 4]' },
      { input: 'nums = [0, 4, 3, 0], target = 0', output: '[0, 3]' },
      { input: 'nums = [-3, 4, 3, 90], target = 0', output: '[0, 2]' },
      { input: 'nums = [1, 2, 3, 4, 5, 6, 7], target = 13', output: '[5, 6]' },
      { input: 'nums = [10, 20, 30, 40, 50], target = 90', output: '[3, 4]' },
      { input: 'nums = [5, 25, 75], target = 100', output: '[1, 2]' }
    ];
    problem.testCases = standardTwoSumCases.map(c => c.input);
    problem.expectedOutputs = standardTwoSumCases.map(c => c.output);
  }

  const probSlug = (problem as any).slug || '';
  const isSubsetsII = normProblemName.includes('subsetsii') || normProblemName.includes('subsets2') || normProblemName.includes('uniquesubsets') || normProblemName.includes('subsetsum2') || normProblemName.includes('subset2') || probSlug === 'subsets-ii';
  
  if (isSubsetsII) {
    const standardSubsetsIICases = [
      { input: 'nums = [1, 2, 2]', output: '[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]' },
      { input: 'nums = [0]', output: '[[], [0]]' },
      { input: 'nums = [4, 4, 4, 1, 4]', output: '[[], [1], [1, 4], [1, 4, 4], [1, 4, 4, 4], [1, 4, 4, 4, 4], [4], [4, 4], [4, 4, 4], [4, 4, 4, 4]]' },
      { input: 'nums = [1, 2, 3]', output: '[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]' },
      { input: 'nums = [2, 1, 2, 1, 3]', output: '[[], [1], [1, 1], [1, 1, 2], [1, 1, 2, 2], [1, 1, 2, 2, 3], [1, 1, 2, 3], [1, 1, 3], [1, 2], [1, 2, 2], [1, 2, 2, 3], [1, 2, 3], [1, 3], [2], [2, 2], [2, 2, 3], [2, 3], [3]]' },
      { input: 'nums = []', output: '[[]]' },
      { input: 'nums = [1]', output: '[[], [1]]' },
      { input: 'nums = [1, 1, 1]', output: '[[], [1], [1, 1], [1, 1, 1]]' },
      { input: 'nums = [1, 2, 2, 3, 3]', output: '[[], [1], [1, 2], [1, 2, 2], [1, 2, 2, 3], [1, 2, 2, 3, 3], [1, 2, 3], [1, 2, 3, 3], [1, 3], [1, 3, 3], [2], [2, 2], [2, 2, 3], [2, 2, 3, 3], [2, 3], [2, 3, 3], [3], [3, 3]]' },
      { input: 'nums = [-1, 0, 1]', output: '[[], [-1], [-1, 0], [-1, 0, 1], [-1, 1], [0], [0, 1], [1]]' },
      { input: 'nums = [-1, -1, 0, 1, 1]', output: '[[], [-1], [-1, -1], [-1, -1, 0], [-1, -1, 0, 1], [-1, -1, 0, 1, 1], [-1, -1, 1], [-1, -1, 1, 1], [-1, 0], [-1, 0, 1], [-1, 0, 1, 1], [-1, 1], [-1, 1, 1], [0], [0, 1], [0, 1, 1], [1], [1, 1]]' }
    ];
    problem.testCases = standardSubsetsIICases.map(c => c.input);
    problem.expectedOutputs = standardSubsetsIICases.map(c => c.output);
  } else if (normProblemName.includes('subsets') || normProblemName.includes('subsets1') || normProblemName.includes('powerset') || normProblemName === 'subsets' || probSlug === 'subsets') {
    const standardSubsetsCases = [
      { input: 'nums = [1, 2, 3]', output: '[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]' },
      { input: 'nums = [0]', output: '[[], [0]]' },
      { input: 'nums = [1, 2]', output: '[[], [1], [2], [1, 2]]' },
      { input: 'nums = [3]', output: '[[], [3]]' },
      { input: 'nums = [9, 0]', output: '[[], [9], [0], [9, 0]]' },
      { input: 'nums = [-1, 0, 1]', output: '[[], [-1], [0], [-1, 0], [1], [-1, 1], [0, 1], [-1, 0, 1]]' },
      { input: 'nums = [1, 2, 3, 4]', output: '[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3], [4], [1, 4], [2, 4], [1, 2, 4], [3, 4], [1, 3, 4], [2, 3, 4], [1, 2, 3, 4]]' },
      { input: 'nums = [-10, 10]', output: '[[], [-10], [10], [-10, 10]]' },
      { input: 'nums = [4, 1, 0]', output: '[[], [4], [1], [4, 1], [0], [4, 0], [1, 0], [4, 1, 0]]' },
      { input: 'nums = []', output: '[[]]' },
      { input: 'nums = [5, 6, 7]', output: '[[], [5], [6], [5, 6], [7], [5, 7], [6, 7], [5, 6, 7]]' }
    ];
    if (!problem.testCases || problem.testCases.length < 10) {
      problem.testCases = standardSubsetsCases.map(c => c.input);
      problem.expectedOutputs = standardSubsetsCases.map(c => c.output);
    }
  }

  return problem;
}

function isTwoSum(name: string): boolean {
  const n = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return n.includes('twosum') || n.includes('2sum');
}

/**
 * Checks if a problem template is valid, complete, and free of placeholder / corrupted data.
 */
export function isProblemValidAndAuthentic(p?: ProblemTemplate | null): boolean {
  if (!p || !p.name || !p.description) return false;
  const desc = p.description || '';
  const startersStr = JSON.stringify(p.starters || {});
  const driversStr = JSON.stringify(p.driverCode || {});

  // Check for hallucinated / placeholder artifact strings
  if (
    desc.includes('Given the problem constraints for **') ||
    desc.includes('An optimal algorithm is required to solve the') ||
    desc.includes('httpsleetcodecom') ||
    startersStr.includes('httpsleetcodecom') ||
    driversStr.includes('httpsleetcodecom') ||
    p.name.startsWith('http://') ||
    p.name.startsWith('https://') ||
    desc.trim().length < 30
  ) {
    return false;
  }

  return Array.isArray(p.testCases) && p.testCases.length >= 1;
}

/**
 * Fetches authentic problem data directly from the LeetCode GraphQL API via backend proxy or direct query.
 */
export async function fetchFromLeetCodeAPI(slugOrUrl: string): Promise<ProblemTemplate | null> {
  const slug = toSlug(slugOrUrl);
  if (!slug || slug === 'algorithm-problem') return null;

  const parseLeetCodeQuestion = (q: any): ProblemTemplate | null => {
    if (!q || !q.title || (!q.content && !q.description)) return null;

    const contentHtml = q.content || q.description || '';

    // Extract clean markdown-formatted description
    const cleanDesc = contentHtml
      .replace(/<p><strong class="example">[\s\S]*?<\/p>/gi, '')
      .replace(/<pre>[\s\S]*?<\/pre>/gi, '')
      .replace(/<p><strong>Constraints:<\/strong><\/p>[\s\S]*?<\/ul>/gi, '')
      .replace(/<img[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const starters: Record<SupportedLanguage, string> = {} as any;
    const snippets: any[] = q.codeSnippets || [];
    snippets.forEach((s: any) => {
      if (s.langSlug === 'cpp') starters.cpp = s.code;
      else if (s.langSlug === 'python3' || s.langSlug === 'python') starters.python = s.code;
      else if (s.langSlug === 'java') starters.java = s.code;
      else if (s.langSlug === 'javascript') starters.javascript = s.code;
      else if (s.langSlug === 'golang') starters.go = s.code;
      else if (s.langSlug === 'rust') starters.rust = s.code;
    });

    const examples: ProblemTemplate['examples'] = [];
    const exMatches = Array.from(contentHtml.matchAll(/<pre>([\s\S]*?)<\/pre>/gi)) as RegExpMatchArray[];
    for (const m of exMatches) {
      const text = (m[1] || '').replace(/<[^>]+>/g, '').trim();
      const inM = text.match(/Input:\s*([\s\S]*?)(?=\nOutput:|$)/i);
      const outM = text.match(/Output:\s*([\s\S]*?)(?=\nExplanation:|$)/i);
      const expM = text.match(/Explanation:\s*([\s\S]*?)$/i);
      if (inM && outM) {
        examples.push({
          input: inM[1].trim(),
          output: outM[1].trim(),
          explanation: expM ? expM[1].trim() : undefined
        });
      }
    }

    const constraints: string[] = [];
    const cListMatch = contentHtml.match(/<p><strong>Constraints:<\/strong><\/p>\s*<ul>([\s\S]*?)<\/ul>/i) || contentHtml.match(/Constraints:[\s\S]*?<ul>([\s\S]*?)<\/ul>/i);
    if (cListMatch && cListMatch[1]) {
      const liMatches = Array.from(cListMatch[1].matchAll(/<li>([\s\S]*?)<\/li>/gi)) as RegExpMatchArray[];
      for (const li of liMatches) {
        const cStr = li[1].replace(/<[^>]+>/g, '').replace(/&le;/g, '<=').replace(/&ge;/g, '>=').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        if (cStr) constraints.push(cStr);
      }
    }

    const tcs = examples.map(e => e.input).filter(Boolean);
    const eos = examples.map(e => e.output).filter(Boolean);
    const defaultStarters = generateDefaultStarters(q.title);

    const template: ProblemTemplate = {
      name: q.title,
      category: q.topicTags?.[0]?.name || q.categoryTitle || 'Algorithms',
      difficulty: q.difficulty || 'Medium',
      description: cleanDesc || q.title,
      examples,
      constraints,
      testCases: tcs.length > 0 ? tcs : ['nums = [1, 2, 3]'],
      expectedOutputs: eos.length > 0 ? eos : ['0'],
      hints: q.hints || [],
      starters: { ...defaultStarters, ...starters },
      solutions: defaultStarters
    };

    return repairAndHardenProblem(template);
  };

  // 1. Try Local Cloudflare Pages Function Proxy & Backend LeetCode API Proxy
  const endpoints = [
    `/api/leetcode/question?slug=${encodeURIComponent(slug)}`,
    `/api/leetcode/${encodeURIComponent(slug)}`,
    `${TELEGRAM_BACKEND_URL}/api/leetcode/${encodeURIComponent(slug)}`,
    `${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}`
  ];

  for (const ep of endpoints) {
    try {
      const resp = await fetch(ep, { signal: AbortSignal.timeout(8000) });
      if (resp.ok) {
        const data = await resp.json();
        const q = data?.data?.question || data?.question || (data?.name ? data : null);
        if (q && q.title && (q.content || q.description)) {
          if (data.name && data.starters && data.testCases && data.description && !data.description.includes('An optimal algorithm is required')) {
            return repairAndHardenProblem(data as ProblemTemplate);
          }
          const parsed = parseLeetCodeQuestion(q);
          if (parsed) return parsed;
        }
      }
    } catch {}
  }

  // 2. Direct LeetCode GraphQL query from client
  try {
    const query = `query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        titleSlug
        content
        difficulty
        topicTags { name }
        codeSnippets { lang langSlug code }
        sampleTestCase
        exampleTestcases
        hints
        categoryTitle
      }
    }`;
    const gqlRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { titleSlug: slug } }),
      signal: AbortSignal.timeout(8000)
    });
    if (gqlRes.ok) {
      const json = await gqlRes.json();
      const q = json?.data?.question;
      if (q && q.title && q.content) {
        const parsed = parseLeetCodeQuestion(q);
        if (parsed) return parsed;
      }
    }
  } catch {}

  return null;
}

/**
 * Fetches authentic problem details directly from GeeksforGeeks Practice API & backend proxy.
 */
export async function fetchFromGFGAPI(slugOrUrl: string): Promise<ProblemTemplate | null> {
  const slug = toSlug(slugOrUrl);
  if (!slug || slug === 'algorithm-problem') return null;

  const endpoints = [
    `https://practiceapi.geeksforgeeks.org/api/v1/problems/${encodeURIComponent(slug)}/`,
    `/api/gfg/${encodeURIComponent(slug)}`,
    `${TELEGRAM_BACKEND_URL}/api/gfg/${encodeURIComponent(slug)}`
  ];

  for (const ep of endpoints) {
    try {
      const resp = await fetch(ep, { signal: AbortSignal.timeout(8000) });
      if (resp.ok) {
        const data = await resp.json();
        const resObj = data?.results || data;
        if (resObj && (resObj.problem_name || resObj.name) && (resObj.problem_question || resObj.description)) {
          const rawHtml = resObj.problem_question || resObj.description || '';
          const title = resObj.problem_name || resObj.name;
          const cleanDesc = rawHtml
            .replace(/<pre>[\s\S]*?<\/pre>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim();

          const examples: ProblemTemplate['examples'] = [];
          const exMatches = Array.from(rawHtml.matchAll(/<pre>([\s\S]*?)<\/pre>/gi)) as RegExpMatchArray[];
          for (const m of exMatches) {
            const text = (m[1] || '').replace(/<[^>]+>/g, '').trim();
            const inM = text.match(/Input:\s*([\s\S]*?)(?=\nOutput:|$)/i);
            const outM = text.match(/Output:\s*([\s\S]*?)(?=\nExplanation:|$)/i);
            const expM = text.match(/Explanation:\s*([\s\S]*?)$/i);
            if (inM && outM) {
              examples.push({
                input: inM[1].trim(),
                output: outM[1].trim(),
                explanation: expM ? expM[1].trim() : undefined
              });
            }
          }

          const constraints: string[] = [];
          const cMatch = rawHtml.match(/Constraints:[\s\S]*?(<\/p>|$)/i);
          if (cMatch) {
            const cText = cMatch[0].replace(/<[^>]+>/g, ' ').replace(/Constraints:/i, '').replace(/&le;/g, '<=').replace(/&ge;/g, '>=').replace(/\s+/g, ' ').trim();
            if (cText) constraints.push(cText);
          }

          const defaultStarters = generateDefaultStarters(title);
          const tcs = examples.map(e => e.input).filter(Boolean);
          const eos = examples.map(e => e.output).filter(Boolean);

          const template: ProblemTemplate = {
            name: title,
            category: resObj.tags?.topic_tags?.[0] || 'Dynamic Programming',
            difficulty: resObj.difficulty || 'Medium',
            description: cleanDesc || title,
            examples,
            constraints,
            testCases: tcs.length >= 10 ? tcs : (tcs.length > 0 ? tcs : ['n = 9, i = 1, d = 2, c = 1']),
            expectedOutputs: eos.length >= 10 ? eos : (eos.length > 0 ? eos : ['5']),
            hints: [],
            starters: defaultStarters,
            solutions: defaultStarters
          };

          return repairAndHardenProblem(template);
        }
      }
    } catch {}
  }
  return null;
}

/**
 * Generates problem definition + AT LEAST 10 testcases with expected outputs using Mistral AI.
 * Used for custom / non-LeetCode problems.
 */
export async function generateProblemWithMistral(
  slugOrTitle: string,
  category: string = 'Algorithms',
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium',
  transcript?: string,
  notes?: string
): Promise<ProblemTemplate> {
  const cleanTitle = getCleanTitle(slugOrTitle);
  const slug = toSlug(slugOrTitle);

  const prompt = `You are a Principal Algorithms Engineer and SDE Coding Interview Architect.
Generate complete, authentic coding problem details in JSON for: "${cleanTitle}".
Context Category: "${category}", Difficulty: "${difficulty}".
${transcript ? `Lecture Context: ${transcript.slice(0, 1500)}` : ''}
${notes ? `Study Notes: ${notes.slice(0, 1500)}` : ''}

CRITICAL SIGNATURE & TEST CASE SPECIFICATIONS:
1. METHOD SIGNATURE & ARGUMENT PARITY:
   - Provide standard LeetCode class Solution starter code and optimal solution code in C++, Python, Java, JavaScript, Go, Rust.
   - The method name and parameter list across ALL starter templates MUST MATCH EXACTLY.
2. MULTI-ARGUMENT TEST CASES:
   - If the method takes N parameters, EVERY testcase item in "testCases" MUST contain ALL N parameters in that single string.
   - Example: "g = [1, 2, 3], s = [1, 1]" -> Expected: "1"
3. STRICT CONSTRAINT ADHERENCE:
   - Every single testcase MUST be valid according to the stated problem constraints.
4. AT LEAST 10 TEST CASES:
   - Provide AT LEAST 10 diverse test case inputs in "testCases" and matching 1-to-1 "expectedOutputs".

Return ONLY valid JSON matching this exact structure:
{
  "name": "${cleanTitle}",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "description": "Complete problem explanation with markdown bold/code markers",
  "examples": [
    {
      "input": "input representation string containing all arguments",
      "output": "expected output string",
      "explanation": "why this output is correct"
    }
  ],
  "constraints": [
    "constraint 1",
    "constraint 2"
  ],
  "testCases": [
    "case 1", "case 2", "case 3", "case 4", "case 5",
    "case 6", "case 7", "case 8", "case 9", "case 10"
  ],
  "expectedOutputs": [
    "out 1", "out 2", "out 3", "out 4", "out 5",
    "out 6", "out 7", "out 8", "out 9", "out 10"
  ],
  "hints": [
    "Hint 1: Intuition",
    "Hint 2: Algorithm approach"
  ],
  "approaches": [
    {
      "id": "optimal",
      "name": "Optimal Approach",
      "timeComplexity": "O(N)",
      "spaceComplexity": "O(1)",
      "description": "Explanation of optimal technique"
    }
  ],
  "starters": {
    "cpp": "class Solution {\\npublic:\\n    int solve(vector<int>& nums) {\\n        \\n    }\\n};",
    "python": "class Solution:\\n    def solve(self, nums: List[int]) -> int:\\n        pass",
    "java": "class Solution {\\n    public int solve(int[] nums) {\\n        \\n    }\\n}",
    "javascript": "var solve = function(nums) {\\n    \\n};",
    "go": "func solve(nums []int) int {\\n    \\n}",
    "rust": "impl Solution {\\n    pub fn solve(nums: Vec<i32>) -> i32 {\\n        0\\n    }\\n}"
  },
  "solutions": {
    "cpp": "class Solution {\\npublic:\\n    // Working C++ solution\\n};",
    "python": "class Solution:\\n    # Working Python solution\\n",
    "java": "class Solution {\\n    // Working Java solution\\n}",
    "javascript": "var solve = function(nums) {\\n    // Working JS solution\\n};"
  }
}`;

  const rawContent = await executeAIChatCascade([
    { role: 'user', content: prompt }
  ], { temperature: 0.1, responseFormatJson: true, timeoutMs: 15000 });

  if (rawContent) {
    try {
      const match = rawContent.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : rawContent;
      const parsed = JSON.parse(jsonStr) as ProblemTemplate;
      if (parsed && parsed.name && parsed.testCases && parsed.testCases.length >= 10) {
        const hardened = repairAndHardenProblem(parsed);
        const txtContent = formatProblemAsTxt(hardened);
        try {
          localStorage.setItem(`edustream_testcases_txt_${slug}`, txtContent);
          localStorage.setItem(`edustream_problem_spec_${slug}`, JSON.stringify(hardened));
        } catch (_) {}

        // Attempt async upload to Cloudflare R2 backend
        try {
          fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hardened)
          }).catch(() => {});
        } catch (_) {}

        return hardened;
      }
    } catch (err) {
      console.warn(`[Problem Generation Parse Notice for '${cleanTitle}']:`, err);
    }
  }

  // Fallback template if network/LLMs fail
  const defaultStarters = generateDefaultStarters(cleanTitle);
  const fallbackProblem: ProblemTemplate = {
    name: cleanTitle,
    category,
    difficulty,
    description: `An optimal algorithm is required to solve the **${cleanTitle}** problem adhering to all input constraints.`,
    examples: [
      {
        input: 'nums = [1, 2, 3]',
        output: '1',
        explanation: `Example execution for ${cleanTitle}.`
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9'
    ],
    testCases: [
      'nums = [1, 2, 3]',
      'nums = [3, 2, 1]',
      'nums = [1]',
      'nums = [5, 4, 3, 2, 1]',
      'nums = [10, 20, 30]',
      'nums = [0, 0, 0]',
      'nums = [-1, -2, -3]',
      'nums = [100, 200, 300, 400]',
      'nums = [7, 7, 7, 7]',
      'nums = [42]'
    ],
    expectedOutputs: [
      '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'
    ],
    hints: [
      'Analyze the problem invariants and identify whether greedy, two-pointers, dynamic programming or binary search apply.',
      'Check boundary conditions such as negative values, duplicates, and single-element inputs.'
    ],
    approaches: [
      {
        id: 'optimal',
        name: 'Optimal Approach',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        description: `Optimal algorithm for ${cleanTitle}.`
      }
    ],
    starters: defaultStarters,
    solutions: defaultStarters
  };

  return fallbackProblem;
}

/**
 * Main function to load a problem definition:
 * 1. Checks local cache / localStorage (if authentic & not placeholder)
 * 2. Fetches from Cloudflare R2 / backend API via /api/problem/{slug} (which handles LeetCode GraphQL directly)
 * 3. Fetches directly from LeetCode GraphQL via /api/leetcode/{slug} or client
 * 4. Only if not a LeetCode problem, invokes Mistral AI to generate spec
 */
export async function fetchEnrichedProblem(
  slugOrTitle: string,
  category: string = 'Algorithms',
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium',
  transcript?: string,
  notes?: string
): Promise<ProblemTemplate> {
  const slug = toSlug(slugOrTitle);
  const cacheKey = `edustream_problem_spec_${slug}`;

  const applyOverride = (p: ProblemTemplate): ProblemTemplate => {
    try {
      const overrideStr = localStorage.getItem(`edustream_testcase_override_${slug}`);
      if (overrideStr) {
        const overrideObj = JSON.parse(overrideStr);
        if (overrideObj && Array.isArray(overrideObj.testCases) && overrideObj.testCases.length > 0) {
          p.testCases = overrideObj.testCases;
          if (Array.isArray(overrideObj.expectedOutputs)) {
            p.expectedOutputs = overrideObj.expectedOutputs;
          }
        }
      }
    } catch (_) {}
    return p;
  };

  // 1. Check local spec cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      let parsed = JSON.parse(cached) as ProblemTemplate;
      parsed = repairAndHardenProblem(parsed);
      if (isProblemValidAndAuthentic(parsed)) {
        return applyOverride(parsed);
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (_) {}

  // 2. Fetch from Cloudflare R2 / Backend API (/api/problem/{slug})
  try {
    const backendUrl = `${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}`;
    const resp = await fetch(backendUrl, { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      const data = await resp.json();
      const problemData = (data?.problem || data) as ProblemTemplate;
      if (problemData && problemData.name && !data.error) {
        const problemObj = repairAndHardenProblem(problemData);
        if (isProblemValidAndAuthentic(problemObj)) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(problemObj));
            localStorage.setItem(`edustream_testcases_txt_${slug}`, formatProblemAsTxt(problemObj));
          } catch (_) {}
          return applyOverride(problemObj);
        }
      }
    }
  } catch (err) {
    console.warn(`[R2 Backend problem fetch notice for '${slug}']:`, err);
  }

  // 3. Fetch from LeetCode GraphQL endpoint (/api/leetcode/{slug} or client-side fallback)
  try {
    const lcData = await fetchFromLeetCodeAPI(slugOrTitle);
    if (lcData && isProblemValidAndAuthentic(lcData)) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(lcData));
        localStorage.setItem(`edustream_testcases_txt_${slug}`, formatProblemAsTxt(lcData));
        // Save to R2 in background
        fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lcData)
        }).catch(() => {});
      } catch (_) {}
      return applyOverride(lcData);
    }
  } catch (err) {
    console.warn(`[LeetCode API fetch notice for '${slug}']:`, err);
  }

  // 4. Fetch from GeeksforGeeks API (/api/gfg/{slug} or practice API)
  try {
    const gfgData = await fetchFromGFGAPI(slugOrTitle);
    if (gfgData && isProblemValidAndAuthentic(gfgData)) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(gfgData));
        localStorage.setItem(`edustream_testcases_txt_${slug}`, formatProblemAsTxt(gfgData));
      } catch (_) {}
      return applyOverride(gfgData);
    }
  } catch (err) {
    console.warn(`[GFG API fetch notice for '${slug}']:`, err);
  }

  // 5. If not found on LeetCode or GFG (custom non-LeetCode problem), generate with Mistral AI
  let generated = await generateProblemWithMistral(slugOrTitle, category, difficulty, transcript, notes);
  generated = repairAndHardenProblem(generated);
  try {
    localStorage.setItem(cacheKey, JSON.stringify(generated));
    localStorage.setItem(`edustream_testcases_txt_${slug}`, formatProblemAsTxt(generated));
  } catch (_) {}

  return applyOverride(generated);
}

/**
 * Fetches pre-generated driver execution harness from Cloudflare R2 or dynamically generates
 * an authentic type-safe driver with Mistral AI and caches it in localStorage + R2.
 */
export async function fetchOrGenerateDriverCode(
  slugOrTitle: string,
  language: SupportedLanguage,
  starterCode?: string,
  sampleTestInput?: string
): Promise<string | null> {
  const slug = toSlug(slugOrTitle);
  const lang = (language || 'cpp').toLowerCase() as SupportedLanguage;
  const localKey = `edustream_driver_${slug}_${lang}`;

  // 1. Check local browser storage cache
  try {
    const cached = localStorage.getItem(localKey);
    if (cached && (cached.includes('// === USER SOLUTION ===') || cached.includes('# === USER SOLUTION ==='))) {
      if (!cached.includes('httpsleetcodecom') && !cached.includes('Error: Missing') && !cached.includes('error: missing')) {
        return cached;
      } else {
        localStorage.removeItem(localKey);
      }
    }
  } catch (_) {}

  // 2. Try fetching from Cloudflare R2 via Backend API
  try {
    const url = `${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/driver/${encodeURIComponent(lang)}`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (resp.ok) {
      const data = await resp.json();
      if (data?.driverCode && (data.driverCode.includes('// === USER SOLUTION ===') || data.driverCode.includes('# === USER SOLUTION ==='))) {
        if (!data.driverCode.includes('httpsleetcodecom') && !data.driverCode.includes('Error: Missing') && !data.driverCode.includes('error: missing')) {
          try {
            localStorage.setItem(localKey, data.driverCode);
          } catch (_) {}
          return data.driverCode;
        }
      }
    }
  } catch (_) {}

  // 3. If R2 does not have it, dynamically generate with Mistral AI directly on the client
  if (starterCode) {
    try {
      const aiDriver = await requestAIDriverGeneration(slugOrTitle, lang, starterCode, sampleTestInput || '', slug);
      if (aiDriver && (aiDriver.includes('// === USER SOLUTION ===') || aiDriver.includes('# === USER SOLUTION ==='))) {
        if (!aiDriver.includes('httpsleetcodecom')) {
          try {
            localStorage.setItem(localKey, aiDriver);
            // Persist to Cloudflare R2 in the background
            fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/driver/${encodeURIComponent(lang)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ driverCode: aiDriver })
            }).catch(() => {});
          } catch (_) {}
          return aiDriver;
        }
      }
    } catch (err) {
      console.warn(`[Client Driver Gen notice for '${slug}' ${lang}]:`, err);
    }
  }

  return null;
}
