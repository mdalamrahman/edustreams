interface Env {
  RENDER_BACKEND_URL?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const backendBase = (context.env.RENDER_BACKEND_URL || 'https://edustream-backend-90vm.onrender.com').replace(/\/+$/, '');

  // Handle CORS Preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  // Map /api/video/channelId/msgId -> /stream/channelId/msgId
  let targetPath = url.pathname;
  if (targetPath.startsWith('/api/video/')) {
    targetPath = targetPath.replace('/api/video/', '/stream/');
  }

  const targetUrl = `${backendBase}${targetPath}${url.search}`;
  const range = context.request.headers.get('Range');
  const isStream = targetPath.startsWith('/stream/');
  const method = context.request.method;

  // 1. Range-Aware Cache Matching on Cloudflare Anycast Edge (GET requests only)
  const cache = (caches as any).default;
  let cacheKey: Request | null = null;

  if (isStream && method === 'GET' && cache) {
    const rangeId = range || 'bytes=0-';
    // Unique cache key per byte range slice
    cacheKey = new Request(`${url.origin}${url.pathname}#__range=${encodeURIComponent(rangeId)}`, {
      method: 'GET',
      headers: context.request.headers
    });
    try {
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        const hitHeaders = new Headers(cachedResponse.headers);
        hitHeaders.set('CF-Edge-Cache', 'HIT');
        hitHeaders.set('Access-Control-Allow-Origin', '*');
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: hitHeaders,
        });
      }
    } catch (e) {
      console.warn('Cache match notice:', e);
    }
  }

  const requestHeaders = new Headers();
  if (range) {
    requestHeaders.set('Range', range);
  }

  const authHeader = context.request.headers.get('Authorization');
  if (authHeader) requestHeaders.set('Authorization', authHeader);
  const contentType = context.request.headers.get('Content-Type');
  if (contentType) requestHeaders.set('Content-Type', contentType);

  try {
    const originResponse = await fetch(targetUrl, {
      method: method,
      headers: requestHeaders,
      body: method !== 'GET' && method !== 'HEAD' ? context.request.body : undefined,
    });

    const responseHeaders = new Headers(originResponse.headers);
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges, Content-Type');

    if (isStream) {
      responseHeaders.set('Cache-Control', 'public, max-age=2592000, s-maxage=2592000, immutable');
    }

    const finalResponse = new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: responseHeaders,
    });

    // 2. Range-Aware Edge Cache Storage
    if (isStream && cacheKey && cache && (originResponse.status === 200 || originResponse.status === 206)) {
      try {
        context.waitUntil(cache.put(cacheKey, finalResponse.clone()));
      } catch (e) {
        console.warn('Cache put notice:', e);
      }
    }

    return finalResponse;
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
