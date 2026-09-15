export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      }
    });
  }

  try {
    const url = new URL(context.request.url);
    let categorySlug = url.searchParams.get('categorySlug') || '';
    let skip = parseInt(url.searchParams.get('skip') || '0', 10);
    let limit = parseInt(url.searchParams.get('limit') || '50', 10);
    let filters: any = {};

    if (context.request.method === 'POST') {
      try {
        const body: any = await context.request.json();
        if (body.categorySlug !== undefined) categorySlug = body.categorySlug;
        if (body.skip !== undefined) skip = parseInt(body.skip, 10);
        if (body.limit !== undefined) limit = parseInt(body.limit, 10);
        if (body.filters !== undefined) filters = body.filters;
      } catch {}
    }

    const query = `query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
      ) {
        total: totalNum
        questions: data {
          questionFrontendId
          title
          titleSlug
          difficulty
          isPaidOnly
          topicTags {
            name
            slug
          }
        }
      }
    }`;

    const leetcodeRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com/problemset/all/'
      },
      body: JSON.stringify({
        query,
        variables: {
          categorySlug,
          skip,
          limit,
          filters
        }
      })
    });

    if (leetcodeRes.ok) {
      const data = await leetcodeRes.json();
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        }
      });
    }

    return new Response(JSON.stringify({ error: 'LeetCode API returned non-200', status: leetcodeRes.status }), {
      status: leetcodeRes.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
