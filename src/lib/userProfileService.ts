/**
 * Comprehensive Developer Profile Service
 * Integrates:
 * 1. SDETube Local/Cloud Submission Activity & 365-Day Heatmap
 * 2. LeetCode Comprehensive GraphQL Full Profile Proxy
 * 3. GitHub Profile Proxy
 */

import { TELEGRAM_BACKEND_URL } from './telegram';

export interface LeetCodeFullProfileData {
  allQuestionsCount?: Array<{
    difficulty: 'All' | 'Easy' | 'Medium' | 'Hard';
    count: number;
  }>;
  matchedUser?: {
    username: string;
    githubUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    profile: {
      realName?: string;
      websites?: string[];
      countryName?: string;
      skillTags?: string[];
      reputation: number;
      ranking: number;
      starRating?: number;
      aboutMe?: string;
      userAvatar: string;
    };
    activeBadge?: {
      displayName: string;
      icon: string;
    };
    badges?: Array<{
      id: string;
      name: string;
      icon: string;
    }>;
    languageProblemCount?: Array<{
      languageName: string;
      problemsSolved: number;
    }>;
    submitStats?: {
      acSubmissionNum: Array<{
        difficulty: 'All' | 'Easy' | 'Medium' | 'Hard';
        count: number;
      }>;
    };
  };
  userContestRanking?: {
    attendedContestsCount: number;
    rating: number;
    globalRanking: number;
    totalParticipants: number;
    topPercentage: number;
    badge?: {
      name: string;
    };
  };
  recentSubmissionList?: Array<{
    title: string;
    titleSlug: string;
    timestamp: string;
    statusDisplay: string;
    lang: string;
  }>;
}

export interface GitHubProfileData {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  bio?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface LinkedProfilesConfig {
  leetcodeUsername: string;
  githubUsername: string;
  bio?: string;
  customAvatar?: string;
}

const STORAGE_LINKED_PROFILES_KEY = 'sdetube_linked_dev_profiles';

export function getLinkedProfiles(email?: string): LinkedProfilesConfig {
  try {
    const raw = localStorage.getItem(`${STORAGE_LINKED_PROFILES_KEY}_${email || 'default'}`) || localStorage.getItem(STORAGE_LINKED_PROFILES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {
    leetcodeUsername: '',
    githubUsername: '',
    bio: 'Software Development Engineer & DSA Enthusiast on SDETube.'
  };
}

export function saveLinkedProfiles(config: LinkedProfilesConfig, email?: string): void {
  try {
    localStorage.setItem(`${STORAGE_LINKED_PROFILES_KEY}_${email || 'default'}`, JSON.stringify(config));
    localStorage.setItem(STORAGE_LINKED_PROFILES_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('sdetube_linked_profiles_updated', { detail: config }));
  } catch {}
}

/**
 * Fetches the complete LeetCode Profile dataset via GraphQL proxy
 */
export async function fetchLeetCodeFullProfile(username: string): Promise<LeetCodeFullProfileData | null> {
  const clean = username.trim();
  if (!clean) return null;

  // 1. Try Backend FastAPI GraphQL Proxy
  try {
    const res = await fetch(`${TELEGRAM_BACKEND_URL}/api/leetcode/full-profile/${encodeURIComponent(clean)}`, {
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.matchedUser || data.allQuestionsCount)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[Backend LeetCode Profile Proxy Notice]:', err);
  }

  // 2. Direct LeetCode GraphQL Fallback
  const query = `
    query userFullProfile($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        username
        profile {
          realName
          ranking
          reputation
          aboutMe
          userAvatar
        }
        badges {
          id
          name
          icon
        }
        languageProblemCount {
          languageName
          problemsSolved
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
        totalParticipants
        topPercentage
      }
      recentSubmissionList(username: $username, limit: 10) {
        title
        statusDisplay
        lang
        timestamp
      }
    }
  `;

  try {
    const directRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { username: clean } }),
      signal: AbortSignal.timeout(5000)
    });
    if (directRes.ok) {
      const json = await directRes.json();
      if (json?.data) return json.data;
    }
  } catch {}

  return null;
}

/**
 * Fetches public GitHub profile data
 */
export async function fetchGitHubProfile(username: string): Promise<GitHubProfileData | null> {
  const clean = username.trim();
  if (!clean) return null;

  try {
    const res = await fetch(`${TELEGRAM_BACKEND_URL}/api/github/profile/${encodeURIComponent(clean)}`, {
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.login) return data;
    }
  } catch {}

  try {
    const direct = await fetch(`https://api.github.com/users/${encodeURIComponent(clean)}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (direct.ok) {
      return await direct.json();
    }
  } catch {}

  return null;
}

export interface DayActivity {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

/**
 * Generates past 365 days submission heatmap from user's solved questions and activity log
 */
export function generateUserSubmissionHeatmap(): {
  days: DayActivity[];
  totalSubmissions: number;
  activeDaysCount: number;
  currentStreak: number;
  maxStreak: number;
} {
  const dateCounts: Record<string, number> = {};

  // Read stored solved timestamps
  try {
    const sdeSolved = JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_sde') || '[]');
    const a2zSolved = JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_a2z') || '[]');
    const fast79Solved = JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_79') || '[]');
    const blindSolved = JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_blind75') || '[]');
    const mikSolved = JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_mik') || '[]');

    const totalProblemsSolved = new Set([
      ...sdeSolved,
      ...a2zSolved,
      ...fast79Solved,
      ...blindSolved,
      ...mikSolved
    ]).size;

    // Read stored activity timestamps
    const rawLogs = localStorage.getItem('sdetube_practice_activity_logs');
    if (rawLogs) {
      const logs: Array<{ date: string; count?: number }> = JSON.parse(rawLogs);
      logs.forEach(l => {
        if (l.date) {
          dateCounts[l.date] = (dateCounts[l.date] || 0) + (l.count || 1);
        }
      });
    }

    // Distribute baseline solved questions over recent weeks if logs are sparse
    if (Object.keys(dateCounts).length === 0 && totalProblemsSolved > 0) {
      const today = new Date();
      let remaining = totalProblemsSolved;
      for (let i = 0; i < 30 && remaining > 0; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i * 2);
        const dateStr = d.toISOString().slice(0, 10);
        const c = Math.min(remaining, (i % 3) + 1);
        dateCounts[dateStr] = c;
        remaining -= c;
      }
    }
  } catch {}

  const today = new Date();
  const days: DayActivity[] = [];
  let totalSubmissions = 0;
  let activeDaysCount = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  // Generate 365 days backwards
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = dateCounts[dateStr] || 0;
    totalSubmissions += count;

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count >= 7) level = 4;
    else if (count >= 4) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;

    if (count > 0) {
      activeDaysCount++;
      tempStreak++;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else {
      tempStreak = 0;
    }

    days.push({
      date: dateStr,
      count,
      level
    });
  }

  // Calculate current streak ending today / yesterday
  const lastIndex = days.length - 1;
  if (days[lastIndex].count > 0 || (lastIndex > 0 && days[lastIndex - 1].count > 0)) {
    let s = 0;
    for (let j = lastIndex; j >= 0; j--) {
      if (days[j].count > 0) s++;
      else if (j === lastIndex && days[j].count === 0) continue;
      else break;
    }
    currentStreak = s;
  }

  return {
    days,
    totalSubmissions,
    activeDaysCount,
    currentStreak,
    maxStreak: Math.max(maxStreak, currentStreak)
  };
}

/**
 * Records an active problem solve timestamp to the local activity log
 */
export function recordProblemSolvedActivity(problemName: string): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const rawLogs = localStorage.getItem('sdetube_practice_activity_logs');
    const logs: Array<{ date: string; count: number; problems?: string[] }> = rawLogs ? JSON.parse(rawLogs) : [];

    const existing = logs.find(l => l.date === today);
    if (existing) {
      existing.count = (existing.count || 0) + 1;
      existing.problems = existing.problems || [];
      if (!existing.problems.includes(problemName)) existing.problems.push(problemName);
    } else {
      logs.push({ date: today, count: 1, problems: [problemName] });
    }

    localStorage.setItem('sdetube_practice_activity_logs', JSON.stringify(logs.slice(-365)));
    window.dispatchEvent(new CustomEvent('sdetube_activity_updated'));
  } catch {}
}
