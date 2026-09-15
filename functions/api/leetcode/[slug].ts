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
    let slug = (context.params.slug as string) || '';
    const url = new URL(context.request.url);
    if (!slug) {
      slug = url.searchParams.get('slug') || url.searchParams.get('titleSlug') || '';
    }

    if (!slug && context.request.method === 'POST') {
      try {
        const body: any = await context.request.json();
        slug = body?.titleSlug || body?.slug || body?.variables?.titleSlug || '';
      } catch {}
    }

    if (slug) {
      slug = slug
        .replace(/^https?:\/\/[^/]+\/problems\//i, '')
        .replace(/\/(description|editorial|solutions|discussion|comments|\d+)\/?$/i, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .toLowerCase()
        .replace(/(^-|-$)/g, '');
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
        difficulty
        content
        codeSnippets {
          lang
          langSlug
          code
        }
        sampleTestCase
        exampleTestcases
        hints
        categoryTitle
        topicTags {
          name
          slug
        }
      }
    }`;

    const leetcodeRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
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
