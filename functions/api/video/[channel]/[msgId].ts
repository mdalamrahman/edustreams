interface Env {
  RENDER_BACKEND_URL?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { channel, msgId } = context.params;
  const range = context.request.headers.get('Range');
  const backendBase = (context.env.RENDER_BACKEND_URL || 'https://edustream-backend.onrender.com').replace(/\/+$/, '');
  
  const targetUrl = `${backendBase}/stream/${channel}/${msgId}`;

  const requestHeaders = new Headers();
  if (range) {
    requestHeaders.set('Range', range);
  }

  try {
    // Fetch from Render and cache individual byte-slices at Cloudflare Edge
    const originResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: requestHeaders,
      cf: {
        cacheEverything: true,
        cacheTtl: 2592000, // 30-day edge cache TTL
      },
    });

    if (!originResponse.ok && originResponse.status !== 206) {
      // Fallback: try /api/stream if backend routes differently
      const fallbackUrl = `${backendBase}/api/stream/${channel}/${msgId}`;
      const fallbackResponse = await fetch(fallbackUrl, {
        method: 'GET',
        headers: requestHeaders,
        cf: {
          cacheEverything: true,
          cacheTtl: 2592000,
        },
      });

      if (fallbackResponse.ok || fallbackResponse.status === 206) {
        const responseHeaders = new Headers(fallbackResponse.headers);
        responseHeaders.set('Accept-Ranges', 'bytes');
        responseHeaders.set('Cache-Control', 'public, max-age=2592000, s-maxage=2592000, immutable');
        responseHeaders.set('Access-Control-Allow-Origin', '*');

        return new Response(fallbackResponse.body, {
          status: fallbackResponse.status,
          statusText: fallbackResponse.statusText,
          headers: responseHeaders,
        });
      }

      return new Response(JSON.stringify({ error: 'Video stream unavailable', channel, msgId }), {
        status: originResponse.status || 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    const responseHeaders = new Headers(originResponse.headers);
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=2592000, s-maxage=2592000, immutable');
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Cloudflare Pages Video Edge Proxy Error', details: String(err) }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
