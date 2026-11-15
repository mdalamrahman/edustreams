interface Env { RENDER_BACKEND_URL?: string }
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.RENDER_BACKEND_URL) return new Response('Backend is not configured', { status: 503 });
  const source = new URL(request.url);
  const target = new URL(env.RENDER_BACKEND_URL);
  target.pathname = source.pathname.replace(/^\/api\/video\//, '/stream/').replace(/^\/api\/fish-tts$/, '/api/provider/fish/tts');
  target.search = source.search;
  const headers = new Headers();
  for (const name of ['Authorization', 'Content-Type', 'Range', 'Origin', 'Idempotency-Key']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const response = await fetch(target, { method: request.method, headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body, redirect: 'manual' });
    const resultHeaders = new Headers(response.headers);
    resultHeaders.set('Cache-Control', 'private, no-store');
    return new Response(response.body, { status: response.status, headers: resultHeaders });
  } catch {
    return new Response('Backend unavailable', { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
};
