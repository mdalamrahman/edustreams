export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let slug = req.query.slug || req.query.titleSlug || '';
  if (!slug && req.method === 'POST' && req.body) {
    slug = req.body.titleSlug || req.body.slug || req.body.variables?.titleSlug || '';
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
    return res.status(400).json({ error: 'Missing slug parameter' });
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

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': `https://leetcode.com/problems/${slug}/`,
    'Origin': 'https://leetcode.com'
  };

  // 1. Fetch from LeetCode official GraphQL
  try {
    const leetcodeRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables: { titleSlug: slug } }),
      signal: AbortSignal.timeout(9000)
    });

    if (leetcodeRes.ok) {
      const data = await leetcodeRes.json();
      if (data?.data?.question) {
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.status(200).json(data);
      }
    }
  } catch (err) {
    console.error('LeetCode GraphQL Fetch Notice:', err);
  }

  // 2. Fallback to Cloudflare Pages edge proxy
  try {
    const edgeRes = await fetch(`https://sdetube.pages.dev/api/leetcode/question?slug=${encodeURIComponent(slug)}`, {
      signal: AbortSignal.timeout(8000)
    });
    if (edgeRes.ok) {
      const data = await edgeRes.json();
      if (data?.data?.question) {
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.status(200).json(data);
      }
    }
  } catch (err) {
    console.error('Pages proxy Fallback Notice:', err);
  }

  return res.status(404).json({ error: `Problem '${slug}' not found` });
}
