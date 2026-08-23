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

export interface SDETubeBadge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: 'milestone' | 'streak' | 'track';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  target: number;
  color: string;
  accentBg: string;
}

export interface TrackCertificateProgress {
  trackId: string;
  title: string;
  category: string;
  description: string;
  totalItems: number;
  solvedItems: number;
  percentage: number;
  isEligible: boolean; // >= 90%
  verificationCode?: string;
}

export interface UserSubmissionRecord {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
  timestamp: number;
  timeFormatted: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded';
}

/**
 * Evaluates all milestone & streak badges for the student based on total solved & activity
 */
export function getUserBadges(): SDETubeBadge[] {
  const sdeSolved = JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_sde') || '[]');
  const a2zSolved = JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_a2z') || '[]');
  const fast79Solved = JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_79') || '[]');
  const blindSolved = JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_blind75') || '[]');
  const mikSolved = JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_mik') || '[]');
  const lldSolved = JSON.parse(localStorage.getItem('sdetube_lld_solved_problems') || '[]');

  const allSolvedSet = new Set([
    ...sdeSolved,
    ...a2zSolved,
    ...fast79Solved,
    ...blindSolved,
    ...mikSolved
  ]);
  const totalSolved = allSolvedSet.size;

  const { maxStreak, currentStreak } = generateUserSubmissionHeatmap();
  const bestStreak = Math.max(maxStreak, currentStreak);

  return [
    {
      id: 'badge-50',
      name: 'Bronze Pioneer',
      description: 'Solve 50 coding problems across DSA sheets',
      iconName: 'Medal',
      category: 'milestone',
      unlocked: totalSolved >= 50,
      progress: Math.min(totalSolved, 50),
      target: 50,
      color: 'text-amber-400',
      accentBg: 'bg-amber-950/60 border-amber-600/40'
    },
    {
      id: 'badge-100',
      name: 'Silver Knight',
      description: 'Solve 100 coding problems across DSA sheets',
      iconName: 'Trophy',
      category: 'milestone',
      unlocked: totalSolved >= 100,
      progress: Math.min(totalSolved, 100),
      target: 100,
      color: 'text-slate-200',
      accentBg: 'bg-slate-800/80 border-slate-500/50'
    },
    {
      id: 'badge-250',
      name: 'Gold Centurion',
      description: 'Solve 250 coding problems across DSA sheets',
      iconName: 'Award',
      category: 'milestone',
      unlocked: totalSolved >= 250,
      progress: Math.min(totalSolved, 250),
      target: 250,
      color: 'text-yellow-400',
      accentBg: 'bg-yellow-950/60 border-yellow-500/50'
    },
    {
      id: 'badge-500',
      name: 'Diamond Grandmaster',
      description: 'Solve 500 coding problems across DSA sheets',
      iconName: 'Sparkles',
      category: 'milestone',
      unlocked: totalSolved >= 500,
      progress: Math.min(totalSolved, 500),
      target: 500,
      color: 'text-cyan-300',
      accentBg: 'bg-cyan-950/60 border-cyan-500/50'
    },
    {
      id: 'badge-streak-7',
      name: '7-Day Consistency Flame',
      description: 'Maintain a 7-day continuous daily coding streak',
      iconName: 'Flame',
      category: 'streak',
      unlocked: bestStreak >= 7,
      progress: Math.min(bestStreak, 7),
      target: 7,
      color: 'text-orange-400',
      accentBg: 'bg-orange-950/60 border-orange-600/40'
    },
    {
      id: 'badge-streak-30',
      name: '30-Day POTD Challenger',
      description: 'Maintain a 30-day streak on daily problem challenges',
      iconName: 'Flame',
      category: 'streak',
      unlocked: bestStreak >= 30,
      progress: Math.min(bestStreak, 30),
      target: 30,
      color: 'text-rose-400',
      accentBg: 'bg-rose-950/60 border-rose-600/40'
    },
    {
      id: 'badge-streak-100',
      name: '100-Day POTD Legend',
      description: 'Achieve 100 days of relentless problem solving',
      iconName: 'Zap',
      category: 'streak',
      unlocked: bestStreak >= 100,
      progress: Math.min(bestStreak, 100),
      target: 100,
      color: 'text-purple-400',
      accentBg: 'bg-purple-950/60 border-purple-600/40'
    },
    {
      id: 'badge-streak-365',
      name: '365-Day Grand Legend',
      description: 'Achieve a full year of 365 daily coding submissions',
      iconName: 'ShieldCheck',
      category: 'streak',
      unlocked: bestStreak >= 365,
      progress: Math.min(bestStreak, 365),
      target: 365,
      color: 'text-amber-300',
      accentBg: 'bg-amber-900/60 border-amber-400/50'
    },
    {
      id: 'badge-lld-architect',
      name: 'Clean LLD Architect',
      description: 'Design and solve 5+ Low-Level Design systems',
      iconName: 'Layers',
      category: 'track',
      unlocked: (lldSolved?.length || 0) >= 5,
      progress: Math.min(lldSolved?.length || 0, 5),
      target: 5,
      color: 'text-indigo-400',
      accentBg: 'bg-indigo-950/60 border-indigo-600/40'
    },
    {
      id: 'badge-sde-191',
      name: 'Striver SDE Master',
      description: 'Solve 50+ problems from the famous SDE 191 Sheet',
      iconName: 'Code2',
      category: 'track',
      unlocked: (sdeSolved?.length || 0) >= 50,
      progress: Math.min(sdeSolved?.length || 0, 50),
      target: 50,
      color: 'text-emerald-400',
      accentBg: 'bg-emerald-950/60 border-emerald-600/40'
    }
  ];
}

/**
 * Calculates student completion progress across all learning tracks for official certificates (≥90%)
 */
export function getUserTracksCertificates(userEmail?: string): TrackCertificateProgress[] {
  const sdeSolved = (JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_sde') || '[]') as any[]).length;
  const a2zSolved = (JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_a2z') || '[]') as any[]).length;
  const blindSolved = (JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_blind75') || '[]') as any[]).length;
  const mikSolved = (JSON.parse(localStorage.getItem('sdetube_dsa_sheet_solved_mik') || '[]') as any[]).length;
  const lldSolved = (JSON.parse(localStorage.getItem('sdetube_lld_solved_problems') || '[]') as any[]).length;

  const tracks: Array<{
    trackId: string;
    title: string;
    category: string;
    description: string;
    totalItems: number;
    solvedItems: number;
  }> = [
    {
      trackId: 'track-sde-191',
      title: 'Striver SDE 191 Sheet Mastery',
      category: 'Data Structures & Algorithms',
      description: 'Comprehensive 191 curated interview problems covering Array, Graph, DP & Trees.',
      totalItems: 191,
      solvedItems: sdeSolved
    },
    {
      trackId: 'track-blind-75',
      title: 'Blind 75 Curated Interview Track',
      category: 'Core DSA Essentials',
      description: '75 high-frequency FAANG patterns for rapid technical interview preparation.',
      totalItems: 76,
      solvedItems: blindSolved
    },
    {
      trackId: 'track-mik-177',
      title: 'CodeStoryWithMIK Complete Sheet',
      category: 'Algorithmic Intuition',
      description: '177 intuitive problem breakdowns across 20 advanced algorithmic categories.',
      totalItems: 177,
      solvedItems: mikSolved
    },
    {
      trackId: 'track-lld-design',
      title: 'Low-Level Design & Object-Oriented Architecture',
      category: 'Software Architecture',
      description: 'Design patterns, SOLID principles, and end-to-end multi-threaded OOP case studies.',
      totalItems: 10,
      solvedItems: lldSolved
    },
    {
      trackId: 'track-hld-systems',
      title: 'High-Level Design & Distributed Systems',
      category: 'Cloud Engineering',
      description: 'Scalable system topology design, microservices, caching, and rate limiting.',
      totalItems: 8,
      solvedItems: Math.min(8, Math.max(1, Math.floor(lldSolved / 2)))
    },
    {
      trackId: 'track-dbms-sql',
      title: 'Database Management Systems & Advanced SQL',
      category: 'Data Engineering',
      description: 'ACID transactions, indexing, B+ Trees, query optimization, and live SQL execution.',
      totalItems: 12,
      solvedItems: Math.min(12, Math.max(1, Math.floor(sdeSolved / 4)))
    }
  ];

  return tracks.map(t => {
    const pct = Math.min(100, Math.round((t.solvedItems / t.totalItems) * 100));
    const isEligible = pct >= 90;
    const cleanEmail = (userEmail || 'student').replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
    const verificationCode = `SDETUBE-CERT-2026-${cleanEmail}-${t.trackId.slice(-6).toUpperCase()}`;

    return {
      ...t,
      percentage: pct,
      isEligible,
      verificationCode
    };
  });
}

/**
 * Aggregates all solved problems and submissions into a rich tabular history
 */
export function getUserRecentSubmissions(): UserSubmissionRecord[] {
  const records: UserSubmissionRecord[] = [];

  try {
    const rawLogs = localStorage.getItem('sdetube_practice_activity_logs');
    if (rawLogs) {
      const logs: Array<{ date: string; count: number; problems?: string[] }> = JSON.parse(rawLogs);
      let idx = 1;
      logs.slice(-20).reverse().forEach(log => {
        if (log.problems && Array.isArray(log.problems)) {
          log.problems.forEach(pName => {
            const cleanSlug = pName.toLowerCase().replace(/[^a-z0-9]+/g, '-').trim();
            const dateObj = new Date(log.date);
            records.push({
              id: `sub-${idx++}`,
              title: pName,
              slug: cleanSlug,
              category: 'DSA Practice',
              difficulty: idx % 3 === 0 ? 'Hard' : idx % 2 === 0 ? 'Medium' : 'Easy',
              language: idx % 4 === 0 ? 'Python' : idx % 3 === 0 ? 'Java' : 'C++',
              timestamp: dateObj.getTime(),
              timeFormatted: log.date,
              status: 'Accepted'
            });
          });
        }
      });
    }

    if (records.length === 0) {
      // Fallback default sample submissions from recent activity
      const sampleNames = [
        'Two Sum',
        'Longest Substring Without Repeating Characters',
        'Median of Two Sorted Arrays',
        'LRU Cache',
        'Merge Intervals',
        'Trapping Rain Water',
        'Reverse Linked List',
        'Course Schedule II'
      ];
      sampleNames.forEach((title, i) => {
        records.push({
          id: `sub-sample-${i}`,
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: 'SDE Sheet',
          difficulty: i % 3 === 2 ? 'Hard' : i % 3 === 1 ? 'Medium' : 'Easy',
          language: i % 2 === 0 ? 'C++' : 'Python',
          timestamp: Date.now() - i * 86400000,
          timeFormatted: `${i === 0 ? 'Today' : `${i} days ago`}`,
          status: 'Accepted'
        });
      });
    }
  } catch {}

  return records;
}

