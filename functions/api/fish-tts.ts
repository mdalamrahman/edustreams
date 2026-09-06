interface Env {
  FISH_AUDIO_API_KEY?: string;
  VITE_FISH_AUDIO_API_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  try {
    const clientAuth = request.headers.get('Authorization');
    const apiKey = clientAuth?.replace(/^Bearer\s+/i, '') || 
      env.FISH_AUDIO_API_KEY || 
      env.VITE_FISH_AUDIO_API_KEY || 
      'sk-fish-uoO0HkD31OPYy49TI9Hyx4vRiZ2q0DbD2dqIPR3ceY8';

    const bodyText = await request.text();

    const fishResp = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: bodyText
    });

    if (!fishResp.ok) {
      const errDetail = await fishResp.text();
      return new Response(errDetail, {
        status: fishResp.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain'
        }
      });
    }

    const audioBuffer = await fishResp.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': fishResp.headers.get('Content-Type') || 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Fish Audio proxy error' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
};
