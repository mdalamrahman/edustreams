export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      }
    });
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

  // 1. Fetch live from official LeetCode GraphQL
  try {
    const lcRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com/'
      },
      body: JSON.stringify({ query })
    });

    if (lcRes.ok) {
      const json: any = await lcRes.json();
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
          topicTags: (q.topicTags || []).map((t: any) => t.name),
          url: `https://leetcode.com/problems/${q.titleSlug}/`,
          acRate: q.acRate
        };

        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=300, s-maxage=300'
          }
        });
      }
    }
  } catch (err) {
    console.error('LeetCode GraphQL Fetch Error:', err);
  }

  // 2. Fallback to public Alfa LeetCode API Proxy
  try {
    const fallbackRes = await fetch('https://alfa-leetcode-api.onrender.com/daily');
    if (fallbackRes.ok) {
      const data: any = await fallbackRes.json();
      if (data && (data.questionTitle || data.title)) {
        const result = {
          date: data.date || new Date().toISOString().slice(0, 10),
          questionId: data.questionId || data.questionFrontendId || '1',
          questionFrontendId: data.questionFrontendId || data.questionId || '1',
          title: data.questionTitle || data.title,
          titleSlug: data.titleSlug || (data.questionTitle || data.title).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          difficulty: data.difficulty || 'Medium',
          topicTags: Array.isArray(data.topicTags) ? data.topicTags.map((t: any) => typeof t === 'string' ? t : t.name) : ['Algorithms'],
          url: data.questionLink || `https://leetcode.com/problems/${data.titleSlug}/`
        };
        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=300, s-maxage=300'
          }
        });
      }
    }
  } catch {}

  return new Response(JSON.stringify({ error: 'Failed to fetch LeetCode POTD' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
};
