import { ProblemTemplate, repairAndHardenProblem, generateDefaultStarters, toSlug, getCleanTitle } from './problemService';
import { SupportedLanguage } from './compiler';

interface GitHubProblemMeta {
  id: number;
  title: string;
  slug: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  category?: string;
}

/**
 * Extracts starter code from a full working solution by retaining the class and method signatures
 * and replacing the solution logic with standard placeholder return.
 */
export function solutionToStarter(code: string, lang: SupportedLanguage): string {
  if (!code || typeof code !== 'string') return '';
  const trimmed = code.trim();

  if (lang === 'python') {
    const lines = trimmed.split('\n');
    const out: string[] = [];
    let methodFound = false;
    for (const l of lines) {
      out.push(l);
      if (/^\s*def\s+[a-zA-Z0-9_]+\s*\(/.test(l) && !methodFound) {
        const indentMatch = l.match(/^(\s*)/);
        const indent = (indentMatch ? indentMatch[1] : '') + '    ';
        out.push(`${indent}pass`);
        methodFound = true;
        break;
      }
    }
    return methodFound ? out.join('\n') : trimmed;
  }

  if (lang === 'cpp' || lang === 'java') {
    // Preserve struct / class definitions (e.g. TreeNode, ListNode) preceding class Solution
    const m = trimmed.match(/class\s+Solution\s*\{[\s\S]*?([a-zA-Z0-9_<>,:*\s&]+?\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{)/);
    if (m) {
      const prefix = trimmed.slice(0, m.index! + m[0].length);
      const isVoid = m[1].includes('void ');
      const returnStmt = isVoid ? '' : '\n        \n    ';
      return `${prefix}${returnStmt}}\n};`;
    }
    return trimmed;
  }

  if (lang === 'javascript') {
    const fnMatch = trimmed.match(/(?:var|let|const)?\s*([a-zA-Z0-9_]+)\s*=\s*function\s*\([^)]*\)\s*\{/);
    if (fnMatch) {
      return `${fnMatch[0]}\n    \n};`;
    }
    const standardFn = trimmed.match(/function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{/);
    if (standardFn) {
      return `${standardFn[0]}\n    \n}`;
    }
  }

  if (lang === 'go') {
    const goMatch = trimmed.match(/func\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*[^{]*\{/);
    if (goMatch) {
      return `${goMatch[0]}\n\t\n}`;
    }
  }

  if (lang === 'rust') {
    const rustMatch = trimmed.match(/pub\s+fn\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*->\s*[^{]+\{/);
    if (rustMatch) {
      return `impl Solution {\n    ${rustMatch[0]}\n        \n    }\n}`;
    }
  }

  return trimmed;
}

/**
 * Resolves problem metadata (ID, clean title, canonical slug) using local dataset or Alfa LeetCode API.
 */
async function resolveProblemMeta(slugOrTitle: string): Promise<GitHubProblemMeta | null> {
  const cleanTitle = getCleanTitle(slugOrTitle);
  const slug = toSlug(slugOrTitle);

  // 1. Check Alfa LeetCode API (/select?titleSlug={slug})
  try {
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/select?titleSlug=${encodeURIComponent(slug)}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.questionFrontendId || data.questionId)) {
        return {
          id: parseInt(data.questionFrontendId || data.questionId, 10),
          title: data.questionTitle || cleanTitle,
          slug: data.titleSlug || slug,
          difficulty: (data.difficulty as any) || 'Medium',
          category: data.topicTags?.[0]?.name || 'Algorithms'
        };
      }
    }
  } catch (_) {}

  // 2. Fallback: Parse numeric ID if present in slug / title (e.g. "270-closest-binary-search-tree-value")
  const idMatch = slug.match(/^(\d+)/) || cleanTitle.match(/^(\d+)/);
  if (idMatch) {
    return {
      id: parseInt(idMatch[1], 10),
      title: cleanTitle.replace(/^\d+[\.\s-]*/, '').trim(),
      slug: slug.replace(/^\d+[\.\s-]*/, '').trim(),
      difficulty: 'Medium',
      category: 'Algorithms'
    };
  }

  return null;
}

/**
 * Parses markdown/HTML content from GitHub repository into an authentic ProblemTemplate.
 */
function parseGitHubMarkdown(
  rawContent: string,
  meta: GitHubProblemMeta,
  companionCpp?: string
): ProblemTemplate | null {
  if (!rawContent || rawContent.length < 50) return null;

  // 1. Extract Description HTML or text
  const descMatch = rawContent.match(/<!--\s*description:start\s*-->([\s\S]*?)<!--\s*description:end\s*-->/i);
  const contentHtml = descMatch ? descMatch[1].trim() : rawContent;

  // 2. Extract Title if not in meta
  const titleMatch = rawContent.match(/#\s*\[(\d+)\.\s*([^🔒\]]+)/) || rawContent.match(/<a[^>]*>(\d+)\.\s*([^<]+)<\/a>/i);
  const title = meta.title || (titleMatch ? titleMatch[2].trim() : getCleanTitle(meta.slug));

  // 3. Extract Examples (Input, Output, Explanation)
  const examples: ProblemTemplate['examples'] = [];
  const preMatches = Array.from(contentHtml.matchAll(/<pre>([\s\S]*?)<\/pre>/gi)) as RegExpMatchArray[];
  for (const pm of preMatches) {
    const text = (pm[1] || '').replace(/<[^>]+>/g, '').trim();
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

  // 4. Extract Constraints
  const constraints: string[] = [];
  const cListMatch = contentHtml.match(/Constraints:[\s\S]*?<ul>([\s\S]*?)<\/ul>/i) || contentHtml.match(/<p><strong>Constraints:<\/strong><\/p>\s*<ul>([\s\S]*?)<\/ul>/i);
  if (cListMatch && cListMatch[1]) {
    const liMatches = Array.from(cListMatch[1].matchAll(/<li>([\s\S]*?)<\/li>/gi)) as RegExpMatchArray[];
    for (const li of liMatches) {
      const cStr = li[1].replace(/<[^>]+>/g, '').replace(/&le;/g, '<=').replace(/&ge;/g, '>=').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      if (cStr) constraints.push(cStr);
    }
  }

  // 5. Extract Images
  const allImages: string[] = [];
  const allImgMatches = Array.from(contentHtml.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) as RegExpMatchArray[];
  for (const im of allImgMatches) {
    const src = im[1].trim();
    if (src && !allImages.includes(src)) allImages.push(src);
  }

  // 6. Clean Markdown Description
  const cleanDesc = contentHtml
    .replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (_match: string, src: string) => `\n\n![Problem Diagram](${src})\n\n`)
    .replace(/<pre>[\s\S]*?<\/pre>/gi, '')
    .replace(/<p><strong>Constraints:<\/strong><\/p>[\s\S]*?<\/ul>/gi, '')
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

  // 7. Extract Solutions across languages
  const solutions: Record<SupportedLanguage, string> = generateDefaultStarters(title);
  const re = /####\s+([A-Za-z0-9#+]+)[\s\S]*?```([a-z0-9]*)\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rawContent)) !== null) {
    const lang = m[1].toLowerCase();
    const code = m[3].trim();
    if (lang === 'c++' || lang === 'cpp') { solutions.cpp = code; }
    else if (lang === 'python3' || lang === 'python') { solutions.python = code; }
    else if (lang === 'java') { solutions.java = code; }
    else if (lang === 'typescript' || lang === 'javascript') { solutions.javascript = code; }
    else if (lang === 'go') { solutions.go = code; }
    else if (lang === 'rust') { solutions.rust = code; }
  }

  if (companionCpp && companionCpp.trim().length > 10) {
    solutions.cpp = companionCpp.trim();
  }

  // 8. Generate Starters from extracted solutions
  const starters: Record<SupportedLanguage, string> = {
    cpp: solutionToStarter(solutions.cpp, 'cpp'),
    python: solutionToStarter(solutions.python, 'python'),
    java: solutionToStarter(solutions.java, 'java'),
    javascript: solutionToStarter(solutions.javascript, 'javascript'),
    go: solutionToStarter(solutions.go, 'go'),
    rust: solutionToStarter(solutions.rust, 'rust'),
    sql: `-- Not applicable for DSA problems`
  };

  // 9. Extract Editorial / Thinking if available
  const hints: string[] = [];
  const thinkMatch = rawContent.match(/<!--\s*thinking:start\s*-->([\s\S]*?)<!--\s*thinking:end\s*-->/i);
  if (thinkMatch) {
    const thinkText = thinkMatch[1].replace(/<[^>]+>/g, '').trim();
    if (thinkText) hints.push(thinkText);
  }

  const tcs = examples.map(e => String(e.input ?? '').trim()).filter(Boolean);
  const eos = examples.map(e => String(e.output ?? '').trim()).filter(Boolean);

  const problem: ProblemTemplate = {
    name: title,
    category: meta.category || 'Algorithms',
    difficulty: meta.difficulty || 'Medium',
    description: cleanDesc || title,
    images: allImages,
    examples,
    constraints,
    testCases: tcs.length > 0 ? tcs : ['nums = [1, 2, 3]'],
    expectedOutputs: eos.length > 0 ? eos : ['0'],
    hints,
    starters,
    solutions
  };

  return repairAndHardenProblem(problem);
}

/**
 * Fetches an authentic LeetCode Premium problem from GitHub repositories:
 * 1. AkashSingh3031/Complete-LeetCode-Premium-Problems
 * 2. doocs/leetcode
 */
export async function fetchFromGitHubLeetCode(
  slugOrTitle: string,
  questionId?: number | string,
  questionTitle?: string
): Promise<ProblemTemplate | null> {
  const slug = toSlug(slugOrTitle);
  if (!slug || slug === 'algorithm-problem') return null;

  // Resolve metadata (ID and clean title)
  let meta: GitHubProblemMeta | null = null;
  if (questionId && questionTitle) {
    meta = {
      id: typeof questionId === 'number' ? questionId : parseInt(questionId, 10),
      title: questionTitle,
      slug,
      difficulty: 'Medium',
      category: 'Algorithms'
    };
  } else {
    meta = await resolveProblemMeta(slugOrTitle);
  }

  if (!meta || isNaN(meta.id)) {
    return null;
  }

  const paddedId = String(meta.id).padStart(4, '0');

  // Attempt 1: AkashSingh3031/Complete-LeetCode-Premium-Problems (Official GitHub Premium Repo)
  try {
    const akashReadme = `https://raw.githubusercontent.com/AkashSingh3031/Complete-LeetCode-Premium-Problems/master/${paddedId}-${slug}/README.md`;
    const akashCpp = `https://raw.githubusercontent.com/AkashSingh3031/Complete-LeetCode-Premium-Problems/master/${paddedId}-${slug}/${paddedId}-${slug}.cpp`;

    const [resReadme, resCpp] = await Promise.all([
      fetch(akashReadme, { signal: AbortSignal.timeout(6000) }),
      fetch(akashCpp, { signal: AbortSignal.timeout(6000) }).catch(() => null)
    ]);

    if (resReadme.ok) {
      const readmeText = await resReadme.text();
      const cppText = resCpp && resCpp.ok ? await resCpp.text() : undefined;
      const parsed = parseGitHubMarkdown(readmeText, meta, cppText);
      if (parsed) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`[GitHub AkashSingh Fetch notice for '${slug}']:`, err);
  }

  // Attempt 2: doocs/leetcode (Comprehensive Archive with Multi-Language Solutions)
  try {
    const start = Math.floor(meta.id / 100) * 100;
    const chunk = `${String(start).padStart(4, '0')}-${String(start + 99).padStart(4, '0')}`;
    const encodedTitle = encodeURIComponent(meta.title);

    const candidateUrls = [
      `https://raw.githubusercontent.com/doocs/leetcode/main/solution/${chunk}/${paddedId}.${encodedTitle}/README_EN.md`,
      `https://raw.githubusercontent.com/doocs/leetcode/main/solution/${chunk}/${paddedId}.${meta.title.replace(/ /g, '%20')}/README_EN.md`,
      `https://raw.githubusercontent.com/doocs/leetcode/main/solution/${chunk}/${paddedId}.${encodedTitle}/README.md`,
      `https://raw.githubusercontent.com/doocs/leetcode/main/solution/${chunk}/${paddedId}.${meta.title.replace(/ /g, '%20')}/README.md`
    ];

    for (const u of candidateUrls) {
      const res = await fetch(u, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const text = await res.text();
        const parsed = parseGitHubMarkdown(text, meta);
        if (parsed) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn(`[GitHub doocs Fetch notice for '${slug}']:`, err);
  }

  return null;
}
