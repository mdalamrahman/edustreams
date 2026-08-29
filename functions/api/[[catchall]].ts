interface Env {
  RENDER_BACKEND_URL?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const backendBase = (context.env.RENDER_BACKEND_URL || 'https://edustream-backend-90vm.onrender.com').replace(/\/+$/, '');

  // Map /api/video/channelId/msgId -> /stream/channelId/msgId
  let targetPath = url.pathname;
  if (targetPath.startsWith('/api/video/')) {
    targetPath = targetPath.replace('/api/video/', '/stream/');
  }

  const targetUrl = `${backendBase}${targetPath}${url.search}`;
  const range = context.request.headers.get('Range');
  const requestHeaders = new Headers();
  
  if (range) {
    requestHeaders.set('Range', range);
  }

  // Copy relevant headers
  const authHeader = context.request.headers.get('Authorization');
  if (authHeader) requestHeaders.set('Authorization', authHeader);
  const contentType = context.request.headers.get('Content-Type');
  if (contentType) requestHeaders.set('Content-Type', contentType);

  try {
    const originResponse = await fetch(targetUrl, {
      method: context.request.method,
      headers: requestHeaders,
      body: context.request.method !== 'GET' && context.request.method !== 'HEAD' ? context.request.body : undefined,
      cf: {
        cacheEverything: true,
        cacheTtl: 2592000, // 30-day edge cache TTL for static media slices
      },
    });

    const responseHeaders = new Headers(originResponse.headers);
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');

    if (targetPath.startsWith('/stream/')) {
      responseHeaders.set('Cache-Control', 'public, max-age=2592000, s-maxage=2592000, immutable');
    }

    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Cloudflare Pages Edge Proxy Error', targetUrl, details: String(err) }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
