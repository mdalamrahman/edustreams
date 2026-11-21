export const onRequestGet: PagesFunction = async ({ env, request }) => {
  const base = String(env.RENDER_BACKEND_URL || '').trim();
  const unavailable = () => Response.json({ detail: 'GeeksforGeeks daily problem unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  if (!base) return unavailable();
  try {
    const upstream = new URL('/api/potd/gfg', base);
    if (new URL(request.url).searchParams.get('force_refresh') === 'true') upstream.searchParams.set('force_refresh', 'true');
    const response = await fetch(upstream, { signal: AbortSignal.timeout(11000) });
    if (!response.ok) return unavailable();
    return new Response(response.body, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch { return unavailable(); }
};
export const onRequest = onRequestGet;
