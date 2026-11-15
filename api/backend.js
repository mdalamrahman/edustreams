/** Shared Vercel adapter. BACKEND_URL is server configuration, never a client fallback. */
export default async function handler(req, res) {
  const base = process.env.BACKEND_URL;
  if (!base) return res.status(503).json({ error: 'Backend is not configured' });
  const path = req.query.path;
  if (typeof path !== 'string' || !/^\/(api|stream)\//.test(path) || path.includes('..') || path.includes('\\')) {
    return res.status(400).json({ error: 'Invalid backend path' });
  }
  const target = new URL(path, base);
  if (target.origin !== new URL(base).origin) return res.status(400).json({ error: 'Invalid backend origin' });
  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'path' && typeof value === 'string') target.searchParams.set(key, value);
  }
  const headers = {};
  for (const name of ['authorization', 'content-type', 'range', 'origin', 'idempotency-key']) {
    if (typeof req.headers[name] === 'string') headers[name] = req.headers[name];
  }
  try {
    const response = await fetch(target, {
      method: req.method, headers, redirect: 'manual', signal: AbortSignal.timeout(90000),
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
    });
    res.status(response.status);
    for (const name of ['content-type', 'content-range', 'accept-ranges']) {
      if (response.headers.has(name)) res.setHeader(name, response.headers.get(name));
    }
    res.setHeader('Cache-Control', 'private, no-store');
    if (response.body) for await (const chunk of response.body) res.write(Buffer.from(chunk));
    res.end();
  } catch {
    if (!res.headersSent) res.status(502).json({ error: 'Backend unavailable' });
    else res.end();
  }
}
