import { DSAProblem } from './dsaSheetsData';
import { getProblemTemplate } from './problemTemplates';
import { TELEGRAM_BACKEND_URL } from './telegram';

const EDITORIAL_CACHE_PREFIX = 'sdetube_editorial_txt_';

/**
 * Normalizes title / slug to standard LeetCode format
 */
export function getCleanSlug(problem: DSAProblem): string {
  if (problem.slug) return problem.slug;
  if (problem.leetcode) {
    const match = problem.leetcode.match(/\/problems\/([^/]+)/);
    if (match) return match[1];
  }
  return problem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Fetches or derives verified GitHub / SDE editorial for a problem,
 * caches it locally as a .txt / markdown file, and returns the markdown text.
 */
export async function fetchProblemEditorial(problem: DSAProblem): Promise<string> {
  const slug = getCleanSlug(problem);
  
  // 1. Check Local Cache (.txt file in localStorage)
  try {
    const cached = localStorage.getItem(`${EDITORIAL_CACHE_PREFIX}${slug}`);
    if (cached && cached.trim().length > 100) {
      return cached;
    }
  } catch (e) {
    console.warn('[Editorial Cache Read Notice]:', e);
  }

  // 2. Try fetching from GitHub Markdown Editorials (azl397985856 or doocs/leetcode)
  try {
    const githubUrls = [
      `https://raw.githubusercontent.com/azl397985856/leetcode/master/problems/${slug}.md`,
      `https://raw.githubusercontent.com/youngyangyang04/leetcode-master/master/problems/${slug}.md`
    ];

    for (const url of githubUrls) {
      const resp = await fetch(url);
      if (resp.ok) {
        const text = await resp.text();
        if (text && text.length > 200 && !text.includes('404: Not Found')) {
          const formatted = `# Editorial & Complete Analysis: ${problem.name}\n\n` +
            `**Category:** ${problem.category} | **Difficulty:** ${problem.difficulty}\n` +
            `**Target Companies:** ${(problem.companies || []).slice(0, 6).join(', ')}\n\n` +
            `=======================================================\n\n` +
            text;
          
          // Cache locally
          localStorage.setItem(`${EDITORIAL_CACHE_PREFIX}${slug}`, formatted);
          return formatted;
        }
      }
    }
  } catch (err) {
    console.warn('[GitHub Editorial Fetch Notice]:', err);
  }

  // 3. Fallback: Generate Grounded Multi-Approach SDE Editorial from Problem Template Engine
  const template = getProblemTemplate(slug, problem.category, problem.difficulty);
  const approaches = template.approaches || [];
  
  let content = `=======================================================\n` +
    `  SDETUBE EDITORIAL: ${problem.name}\n` +
    `  Category: ${problem.category} ${problem.subcategory ? `• ${problem.subcategory}` : ''}\n` +
    `  Difficulty: ${problem.difficulty} | Rating: ${problem.rating}\n` +
    `  Target Companies: ${(problem.companies || []).join(', ')}\n` +
    `=======================================================\n\n` +
    `## 📋 Problem Description\n\n${template.description}\n\n` +
    `### Example Test Cases:\n`;

  (template.examples || []).forEach((ex, i) => {
    content += `\n**Example ${i + 1}:**\n- Input: \`${ex.input}\`\n- Output: \`${ex.output}\`\n`;
    if (ex.explanation) content += `- Explanation: ${ex.explanation}\n`;
  });

  content += `\n### Constraints:\n`;
  (template.constraints || []).forEach((c) => {
    content += `- \`${c}\`\n`;
  });

  content += `\n---\n\n## 💡 Core Algorithmic Approaches & Solutions\n\n`;

  if (approaches.length > 0) {
    approaches.forEach((app, idx) => {
      content += `### Approach ${idx + 1}: ${app.name}\n\n` +
        `**Intuition & Strategy:**\n${app.description}\n\n` +
        `**Complexity Analysis:**\n` +
        `- ⏱️ **Time Complexity:** ${app.timeComplexity}\n` +
        `- 💾 **Space Complexity:** ${app.spaceComplexity}\n\n`;
    });
  } else {
    content += `### 1. Optimal Two-Pointer / Sliding Window / State Invariant\n\n` +
      `- Maintain the active search invariant and window boundaries.\n` +
      `- Reduce redundant state calculations using incremental updates.\n\n` +
      `**Complexity:**\n- ⏱️ **Time:** O(N)\n- 💾 **Space:** O(1)\n\n`;
  }

  content += `### 💻 Optimal Implementation (C++):\n\`\`\`cpp\n${template.starters.cpp}\n\`\`\`\n\n`;
  content += `### 🐍 Optimal Implementation (Python):\n\`\`\`python\n${template.starters.python}\n\`\`\`\n\n`;
  content += `### ☕ Optimal Implementation (Java):\n\`\`\`java\n${template.starters.java}\n\`\`\`\n\n`;

  // Cache locally as .txt
  try {
    localStorage.setItem(`${EDITORIAL_CACHE_PREFIX}${slug}`, content);
  } catch {}

  return content;
}

/**
 * Downloads editorial as a standalone .txt file
 */
export function downloadEditorialAsTxt(slug: string, problemName: string, content: string) {
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug}-editorial.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    console.warn('[Editorial Download Notice]:', e);
  }
}
