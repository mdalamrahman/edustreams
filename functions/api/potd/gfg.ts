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
    'https://practiceapi.geeksforgeeks.org/api/v1/problems-of-day/problem/today/',
    'https://edustream-backend-90vm.onrender.com/api/potd/gfg'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/html, */*'
        },
        cf: {
          cacheTtl: 0,
          cacheEverything: false
        }
      } as any);

      if (res.ok) {
        const data: any = await res.json();
        if (data && (data.problem_name || data.title) && (data.problem_url || data.url)) {
          const title = data.problem_name || data.title;
          const url = data.problem_url || data.url;
          const match = url.match(/\/problems\/([^/]+)\//);
          const slug = match ? match[1] : (data.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
          const today = new Date().toISOString().slice(0, 10);
          
          const result = {
            id: data.id || data.problem_id || 2156,
            date: data.date ? data.date.slice(0, 10) : today,
            questionId: String(data.problem_id || data.id || '702846'),
            title: title,
            titleSlug: slug,
            difficulty: data.difficulty || 'Medium',
            topicTags: data.tags?.topic_tags || data.topicTags || ['Arrays', 'Searching'],
            companyTags: data.tags?.company_tags || data.companyTags || [],
            url: url,
            accuracy: data.accuracy || 48.53,
            totalSubmissions: data.total_submissions || data.totalSubmissions || 8184
          };

          return new Response(JSON.stringify(result), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
        }
      }
    } catch (e) {
      console.warn('GFG POTD fetch error from', ep, e);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify({
    id: 2156,
    date: today,
    questionId: '702846',
    title: 'Marks from Ranks',
    titleSlug: 'find-marks-from-ranks',
    difficulty: 'Medium',
    topicTags: ['Arrays', 'Searching'],
    companyTags: [],
    url: 'https://www.geeksforgeeks.org/problems/find-marks-from-ranks/1',
    accuracy: 48.53,
    totalSubmissions: 8184
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
};
