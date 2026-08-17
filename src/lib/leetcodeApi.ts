/**
 * LeetCode Daily Challenge API Client
 */

export interface LeetCodeDailyQuestion {
  date: string;
  questionId: string;
  questionFrontendId: string;
  title: string;
  titleSlug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topicTags: string[];
  url: string;
}

/**
 * Fetches the active LeetCode Problem of the Day (POTD) from public endpoints with intelligent fallbacks.
 */
export async function fetchLeetCodePOTD(): Promise<LeetCodeDailyQuestion> {
  const today = new Date().toISOString().slice(0, 10);

  // 1. Try public REST proxy
  try {
    const res = await fetch('https://alfa-leetcode-api.onrender.com/daily', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.questionTitle || data?.title) {
        return {
          date: data.date || today,
          questionId: data.questionId || '1',
          questionFrontendId: data.questionFrontendId || '1',
          title: data.questionTitle || data.title,
          titleSlug: data.titleSlug || (data.questionTitle || data.title).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          difficulty: data.difficulty || 'Medium',
          topicTags: Array.isArray(data.topicTags) ? data.topicTags.map((t: any) => typeof t === 'string' ? t : t.name) : ['Algorithms'],
          url: data.questionLink || `https://leetcode.com/problems/${data.titleSlug || 'two-sum'}/`
        };
      }
    }
  } catch {}

  // 2. Fallback to daily rotation from high-yield interview problems
  const curatedDailyList = [
    { title: 'Trapping Rain Water', slug: 'trapping-rain-water', diff: 'Hard' as const, tags: ['Array', 'Two Pointers', 'Stack'] },
    { title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', diff: 'Medium' as const, tags: ['Hash Table', 'Sliding Window'] },
    { title: 'LRU Cache', slug: 'lru-cache', diff: 'Medium' as const, tags: ['Hash Table', 'Linked List', 'Design'] },
    { title: 'Course Schedule II', slug: 'course-schedule-ii', diff: 'Medium' as const, tags: ['Graph', 'Topological Sort'] },
    { title: 'Word Break', slug: 'word-break', diff: 'Medium' as const, tags: ['Dynamic Programming', 'Trie'] },
    { title: 'Serialize and Deserialize Binary Tree', slug: 'serialize-and-deserialize-binary-tree', diff: 'Hard' as const, tags: ['Tree', 'Design', 'BFS'] },
    { title: 'Valid Parentheses', slug: 'valid-parentheses', diff: 'Easy' as const, tags: ['Stack', 'String'] }
  ];

  const dayIndex = Math.abs(today.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0)) % curatedDailyList.length;
  const picked = curatedDailyList[dayIndex];

  return {
    date: today,
    questionId: String(dayIndex + 1),
    questionFrontendId: String(dayIndex + 1),
    title: picked.title,
    titleSlug: picked.slug,
    difficulty: picked.diff,
    topicTags: picked.tags,
    url: `https://leetcode.com/problems/${picked.slug}/`
  };
}
