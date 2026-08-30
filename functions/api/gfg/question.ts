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
    let slug = url.searchParams.get('slug') || url.searchParams.get('titleSlug') || '';
    if (!slug && context.request.method === 'POST') {
      try {
        const body: any = await context.request.json();
        slug = body?.titleSlug || body?.slug || '';
      } catch {}
    }

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const cleanSlug = slug.replace(/^https?:\/\/.*geeksforgeeks\.org\/problems\//, '').replace(/\/.*$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const endpoints = [
      `https://practiceapi.geeksforgeeks.org/api/v1/problems/${cleanSlug}/`,
      `https://practiceapi.geeksforgeeks.org/api/vr/problems/${cleanSlug}/`
    ];

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/html, */*',
      'Referer': 'https://www.geeksforgeeks.org/'
    };

    let gfgData: any = null;
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, { headers });
        if (res.ok) {
          const json: any = await res.json();
          if (json?.results && (json.results.problem_name || json.results.problem_question)) {
            gfgData = json.results;
            break;
          }
        }
      } catch (e) {
        console.warn('GFG Practice API error:', ep, e);
      }
    }

    if (!gfgData) {
      return new Response(JSON.stringify({ error: `GFG problem '${cleanSlug}' not found` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const title = gfgData.problem_name || cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const rawHtml = gfgData.problem_question || '';
    const cleanDesc = rawHtml
      .replace(/<pre>[\s\S]*?<\/pre>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .trim();

    // Extract examples
    const examples: any[] = [];
    const exRegex = /Input:\s*([\s\S]*?)\s*Output:\s*([\s\S]*?)(?=\s*Explanation:|\s*Input:|$)/gi;
    let match;
    while ((match = exRegex.exec(cleanDesc)) !== null) {
      examples.push({
        input: match[1].trim(),
        output: match[2].trim(),
        explanation: ''
      });
    }

    const result = {
      name: title,
      category: gfgData.tags?.topic_tags?.[0] || 'Arrays',
      difficulty: gfgData.difficulty || 'Medium',
      description: cleanDesc || title,
      descriptionHtml: rawHtml,
      examples: examples.length > 0 ? examples : [{ input: 'N/A', output: 'N/A', explanation: '' }],
      constraints: [],
      testCases: examples.map(e => e.input).filter(Boolean),
      expectedOutputs: examples.map(e => e.output).filter(Boolean),
      topicTags: gfgData.tags?.topic_tags || [],
      companyTags: gfgData.tags?.company_tags || [],
      url: `https://www.geeksforgeeks.org/problems/${cleanSlug}/1`,
      slug: cleanSlug,
      source: 'geeksforgeeks'
    };

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=1800'
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'GFG Question Proxy Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
