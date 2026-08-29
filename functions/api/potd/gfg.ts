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

  const endpoints = [
    'https://practiceapi.geeksforgeeks.org/api/vr/problems-of-day/problem/today/',
    'https://practiceapi.geeksforgeeks.org/api/v1/problems-of-day/problem/today/'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        const data: any = await res.json();
        if (data && (data.problem_name || data.title) && (data.problem_url || data.url)) {
          const title = data.problem_name || data.title;
          const url = data.problem_url || data.url;
          const match = url.match(/\/problems\/([^/]+)\//);
          const slug = match ? match[1] : (data.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
          const today = new Date().toISOString().slice(0, 10);
          
          const result = {
            id: data.id || data.problem_id || 2155,
            date: data.date ? data.date.slice(0, 10) : today,
            questionId: String(data.problem_id || data.id || '2155'),
            title: title,
            titleSlug: slug,
            difficulty: data.difficulty || 'Medium',
            topicTags: data.tags?.topic_tags || ['Dynamic Programming'],
            companyTags: data.tags?.company_tags || [],
            url: url,
            accuracy: data.accuracy || 50.0,
            totalSubmissions: data.total_submissions || 12000
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
    } catch (e) {
      console.warn('GFG POTD fetch error from', ep, e);
    }
  }

  return new Response(JSON.stringify({ error: 'Failed to fetch GFG POTD' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
};
