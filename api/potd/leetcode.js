export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = `query questionOfToday {
    activeDailyCodingChallengeQuestion {
      date
      link
      question {
        acRate
        difficulty
        frontendQuestionId: questionFrontendId
        title
        titleSlug
        topicTags {
          name
        }
      }
    }
  }`;

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': 'https://leetcode.com/'
  };

  // 1. Fetch live from official LeetCode GraphQL API
  try {
    const lcRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(8000)
    });

    if (lcRes.ok) {
      const json = await lcRes.json();
      const daily = json?.data?.activeDailyCodingChallengeQuestion;
      if (daily?.question) {
        const q = daily.question;
        const result = {
          date: daily.date || new Date().toISOString().slice(0, 10),
          questionId: q.frontendQuestionId || '1',
          questionFrontendId: q.frontendQuestionId || '1',
          title: q.title,
          titleSlug: q.titleSlug,
          difficulty: q.difficulty || 'Medium',
          topicTags: (q.topicTags || []).map((t) => t.name),
          url: `https://leetcode.com/problems/${q.titleSlug}/`,
          acRate: q.acRate
        };

        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.status(200).json(result);
      }
    }
  } catch (err) {
    console.error('LeetCode GraphQL Fetch Notice:', err);
  }

  // 2. Fallback to Cloudflare Pages edge proxy
  try {
    const edgeRes = await fetch('https://sdetube.pages.dev/api/potd/leetcode', { signal: AbortSignal.timeout(6000) });
    if (edgeRes.ok) {
      const data = await edgeRes.json();
      if (data && data.title) {
        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.status(200).json(data);
      }
    }
  } catch (err) {
    console.error('Cloudflare Pages Fallback Notice:', err);
  }

  // 3. Fallback to Alfa LeetCode API Proxy
  try {
    const fallbackRes = await fetch('https://alfa-leetcode-api.onrender.com/daily', { signal: AbortSignal.timeout(8000) });
    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      if (data && (data.questionTitle || data.title)) {
        const title = data.questionTitle || data.title;
        const slug = data.titleSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const result = {
          date: data.date || new Date().toISOString().slice(0, 10),
          questionId: data.questionId || data.questionFrontendId || '1',
          questionFrontendId: data.questionFrontendId || data.questionId || '1',
          title,
          titleSlug: slug,
          difficulty: data.difficulty || 'Medium',
          topicTags: Array.isArray(data.topicTags) ? data.topicTags.map((t) => typeof t === 'string' ? t : t.name) : ['Algorithms'],
          url: data.questionLink || `https://leetcode.com/problems/${slug}/`
        };
        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.status(200).json(result);
      }
    }
  } catch (err) {
    console.error('Alfa LeetCode Fallback Notice:', err);
  }

  return res.status(502).json({ error: 'Failed to fetch LeetCode POTD' });
}
