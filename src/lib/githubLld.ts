/**
 * GitHub REST API Client for fetching curated open-source LLD and System Design markdown materials
 */

export interface GitHubRepoItem {
  name: string;
  path: string;
  download_url: string;
  html_url: string;
  type: 'file' | 'dir';
}

export interface CuratedLLDTopic {
  id: string;
  title: string;
  category: string;
  repo: string;
  path: string;
  description: string;
}

export const CURATED_LLD_TOPICS: CuratedLLDTopic[] = [
  {
    id: 'design-patterns-summary',
    title: 'Design Patterns for Humans (GoF Patterns)',
    category: 'Design Patterns',
    repo: 'kamranahmedse/design-patterns-for-humans',
    path: 'README.md',
    description: 'Ultra-clear, practical explanation of Creational, Structural, and Behavioral patterns.'
  },
  {
    id: 'system-design-primer-scalability',
    title: 'System Design Primer — Scalability & Architecture',
    category: 'System Design',
    repo: 'donnemartin/system-design-primer',
    path: 'README.md',
    description: 'Industry-standard open-source primer on distributed systems, caching, replication, and load balancing.'
  },
  {
    id: 'awesome-lld-parking-lot',
    title: 'Low-Level Design Patterns & SOLID Principles',
    category: 'Low Level Design',
    repo: 'ashishps1/awesome-low-level-design',
    path: 'README.md',
    description: 'Comprehensive object-oriented low level design interview solutions, concurrency, and patterns.'
  },
  {
    id: 'system-design-interview-framework',
    title: 'System Design Interview Cheatsheet & Framework',
    category: 'System Design',
    repo: 'madd86/awesome-system-design',
    path: 'README.md',
    description: 'A curated list of System Design and Software Architecture resources for SDE 2 & 3 interviews.'
  },
  {
    id: 'gof-oop-principles',
    title: 'SOLID Principles & Clean Code Architecture',
    category: 'Architecture',
    repo: 'ryanmcdermott/clean-code-javascript',
    path: 'README.md',
    description: 'Clean code and SOLID design principles translated for modern object-oriented software engineering.'
  }
];

/**
 * Cleans translation headers and unwanted raw badge text from repository README files.
 */
export function sanitizeGitHubMarkdown(raw: string): string {
  if (!raw) return '';
  let cleaned = raw;

  // Remove translation table headers like "*[English](README.md) · [日本語](README-ja.md)..."
  cleaned = cleaned.replace(/\*\[English\]\(README\.md\)[^\n]*\*/gi, '');
  cleaned = cleaned.replace(/\*\*Help \[translate\][^\n]*\*\*/gi, '');
  cleaned = cleaned.replace(/\[!\[Build Status\][^\n]*\n?/gi, '');
  cleaned = cleaned.replace(/\[!\[License\][^\n]*\n?/gi, '');

  return cleaned.trim();
}

/**
 * Fetches raw markdown content from a GitHub repository via raw.githubusercontent.com or GitHub REST API.
 */
export async function fetchGitHubMarkdown(repo: string, path: string): Promise<{ content: string | null; error: string | null }> {
  try {
    // 1. Try fast raw CDN first (zero rate-limits)
    const rawUrl = `https://raw.githubusercontent.com/${repo}/master/${path}`;
    let res = await fetch(rawUrl);

    if (!res.ok) {
      // Try main branch
      const rawMainUrl = `https://raw.githubusercontent.com/${repo}/main/${path}`;
      res = await fetch(rawMainUrl);
    }

    if (res.ok) {
      const text = await res.text();
      return { content: sanitizeGitHubMarkdown(text), error: null };
    }

    // 2. Fallback to GitHub REST API
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3.raw'
      }
    });

    if (apiRes.ok) {
      const text = await apiRes.text();
      return { content: sanitizeGitHubMarkdown(text), error: null };
    }

    return { content: null, error: `Failed to fetch GitHub material (${apiRes.status})` };
  } catch (err: any) {
    return { content: null, error: err?.message || 'Network error fetching GitHub resource.' };
  }
}
