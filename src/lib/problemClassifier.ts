import { executeAIChatCascade } from './mistral';
import { isSqlProblem } from './sqlJudge';

export type ProblemDomainType = 'dsa' | 'sql' | 'javascript';

/**
 * Accurately determines if a question is a standard DSA challenge, SQL database query, or JavaScript-specific problem.
 * 1. Prioritizes authentic LeetCode / GFG metadata (category, topic tags, code snippets).
 * 2. Falls back to AI Classification (Mistral / Gemini Cascade) when ambiguous or custom.
 */
export async function detectProblemType(
  problem: {
    category?: string;
    categoryTitle?: string;
    topicTags?: any[];
    codeSnippets?: any[];
    starters?: Record<string, string>;
    name?: string;
    title?: string;
    slug?: string;
    titleSlug?: string;
    description?: string;
  }
): Promise<ProblemDomainType> {
  if (!problem) return 'dsa';

  const name = (problem.name || problem.title || '').trim();
  const slug = (problem.slug || problem.titleSlug || '').toLowerCase().trim();
  const cat = (problem.category || problem.categoryTitle || '').toLowerCase().trim();

  // 1. Explicit SQL / Database detection
  if (isSqlProblem(problem) || cat === 'database' || cat === 'dbms' || cat === 'sql') {
    return 'sql';
  }

  // 2. Explicit JavaScript-only detection (e.g. 30 Days of JS Return Length of Arguments Passed)
  const normSlug = slug.replace(/[^a-z0-9]/g, '');
  if (
    normSlug === 'returnlengthofargumentspassed' ||
    slug === '2703' ||
    slug === 'return-length-of-arguments-passed'
  ) {
    return 'javascript';
  }

  // Check code snippets from LeetCode GraphQL if present
  if (Array.isArray(problem.codeSnippets) && problem.codeSnippets.length > 0) {
    const langSlugs = problem.codeSnippets.map((s: any) => s?.langSlug?.toLowerCase() || '');
    const hasSql = langSlugs.some(l => ['mysql', 'mssql', 'postgresql', 'oraclesql'].includes(l));
    if (hasSql && !langSlugs.includes('cpp')) return 'sql';

    const hasDsaLangs = langSlugs.some(l => ['cpp', 'python3', 'python', 'java', 'golang', 'rust', 'c'].includes(l));
    const hasJsOnly = langSlugs.every(l => ['javascript', 'typescript'].includes(l));

    if (hasJsOnly && !hasDsaLangs) {
      return 'javascript';
    }
    if (hasDsaLangs) {
      return 'dsa';
    }
  }

  // If LeetCode explicitly categorized as JavaScript (e.g. 30 Days of JS)
  if (cat === 'javascript' || cat === '30 days of javascript') {
    return 'javascript';
  }

  // Algorithmic category detection
  const algorithmicKeywords = [
    'tree', 'binary search', 'bst', 'graph', 'dynamic programming', 'dp',
    'array', 'string', 'linked list', 'stack', 'queue', 'heap', 'greedy',
    'backtracking', 'recursion', 'sorting', 'math', 'bit manipulation',
    'two pointers', 'sliding window', 'matrix', 'trie', 'algorithms'
  ];
  if (algorithmicKeywords.some(k => cat.includes(k) || slug.includes(k) || name.toLowerCase().includes(k))) {
    return 'dsa';
  }

  // 3. AI Classification Fallback
  try {
    const prompt = `Classify this coding challenge into exactly one category: "dsa", "sql", or "javascript".
- "sql": Relational database query problem requiring SQL SELECT / UPDATE / schema.
- "javascript": Exclusively tests JavaScript runtime concepts (closures, debounce, throttle, promises, event loop, JS prototype, 30 Days of JS) with NO C++/Java/Python equivalent.
- "dsa": Standard Data Structures and Algorithms (Trees, Arrays, Graphs, Dynamic Programming, Math, Binary Search) solvable in C++, Java, Python, Go, Rust.

Problem Title: "${name || slug}"
Category: "${cat}"
Snippet: "${(problem.description || '').slice(0, 300)}"

Respond with valid JSON: { "type": "dsa" | "sql" | "javascript" }`;

    const raw = await executeAIChatCascade([
      { role: 'user', content: prompt }
    ], { temperature: 0.1, responseFormatJson: true, timeoutMs: 4000 });

    if (raw) {
      const match = raw.match(/"type"\s*:\s*"(dsa|sql|javascript)"/i);
      if (match && match[1]) {
        return match[1].toLowerCase() as ProblemDomainType;
      }
    }
  } catch (err) {
    console.warn('[AI Problem Type Detection notice]:', err);
  }

  return 'dsa';
}
