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
    let slug = '';
    const url = new URL(context.request.url);
    slug = url.searchParams.get('slug') || url.searchParams.get('titleSlug') || '';

    if (!slug && context.request.method === 'POST') {
      try {
        const body: any = await context.request.json();
        slug = body?.titleSlug || body?.slug || body?.variables?.titleSlug || '';
      } catch {}
    }

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const query = `query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        titleSlug
        content
        difficulty
        topicTags { name slug }
        codeSnippets { lang langSlug code }
        sampleTestCase
        exampleTestcases
        hints
        categoryTitle
      }
    }`;

    const leetcodeRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': `https://leetcode.com/problems/${slug}/`
      },
      body: JSON.stringify({ query, variables: { titleSlug: slug } })
    });

    if (leetcodeRes.ok) {
      const data = await leetcodeRes.json();
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    return new Response(JSON.stringify({ error: 'LeetCode API returned non-200' }), {
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
