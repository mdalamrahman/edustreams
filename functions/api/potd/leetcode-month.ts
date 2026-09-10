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

  const url = new URL(context.request.url);
  const now = new Date();
  const year = parseInt(url.searchParams.get('year') || String(now.getFullYear()), 10);
  const month = parseInt(url.searchParams.get('month') || String(now.getMonth() + 1), 10);

  const query = `query dailyCodingQuestionRecords($year: Int!, $month: Int!) {
    dailyCodingChallengeV2(year: $year, month: $month) {
      challenges {
        date
        userStatus
        link
        question {
          questionFrontendId
          title
          titleSlug
          difficulty
          topicTags {
            name
          }
        }
      }
    }
  }`;

  try {
    const lcRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com/'
      },
      body: JSON.stringify({ query, variables: { year, month } })
    });

    if (lcRes.ok) {
      const json: any = await lcRes.json();
      const rawChallenges = json?.data?.dailyCodingChallengeV2?.challenges || [];
      const challenges = rawChallenges.map((c: any) => {
        const q = c.question || {};
        const dayNum = parseInt(c.date?.split('-')[2] || '1', 10);
        return {
          date: c.date,
          day: dayNum,
          link: c.link,
          userStatus: c.userStatus,
          question: {
            questionFrontendId: q.questionFrontendId || '1',
            title: q.title || 'Daily Problem',
            titleSlug: q.titleSlug || '',
            difficulty: q.difficulty || 'Medium',
            topicTags: (q.topicTags || []).map((t: any) => t.name)
          }
        };
      });

      return new Response(JSON.stringify({ year, month, challenges }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
  } catch (err) {
    console.error('LeetCode Monthly Challenges Error:', err);
  }

  return new Response(JSON.stringify({ year, month, challenges: [] }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
