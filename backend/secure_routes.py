"""Fixed upstream proxies: service credentials never cross the browser boundary."""
import os
import re
import time

import httpx
from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from starlette.background import BackgroundTask

router = APIRouter()
PROVIDERS = {
    'mistral': ('https://api.mistral.ai/v1', 'MISTRAL_API_KEY', {'chat/completions'}),
    'groq': ('https://api.groq.com/openai/v1', 'GROQ_API_KEY', {'chat/completions', 'audio/transcriptions'}),
    'fish': ('https://api.fish.audio/v1', 'FISH_AUDIO_API_KEY', {'tts'}),
}


@router.post('/api/media/ticket')
async def media_ticket(request: Request):
    from media_tickets import sign_ticket
    path = (await request.json()).get('path', '')
    if not isinstance(path, str) or not re.fullmatch(r'/stream/-?\d+/\d+', path):
        raise HTTPException(400, 'Invalid media path')
    expires = int(time.time()) + 1800
    try:
        return {'path': path, 'expires': expires, 'signature': sign_ticket(path, expires)}
    except ValueError:
        raise HTTPException(503, 'Media signing is not configured')


@router.post('/api/provider/{provider}/{operation:path}')
async def provider_proxy(provider: str, operation: str, request: Request):
    config = PROVIDERS.get(provider)
    if not config or operation not in config[2]:
        raise HTTPException(404, 'Unknown provider operation')
    key = os.getenv(config[1], '')
    if not key:
        raise HTTPException(503, 'Provider is not configured')
    # Auth is enforced by SecurityMiddleware; caller cannot select an arbitrary upstream.
    headers = {'Authorization': f'Bearer {key}',
               'Content-Type': request.headers.get('content-type', 'application/json')}
    if provider == 'fish':
        headers['model'] = os.getenv('FISH_AUDIO_MODEL', 's2.1-pro-free')
    client = httpx.AsyncClient(timeout=90)
    try:
        upstream_request = client.build_request('POST', f'{config[0]}/{operation}',
                                               content=await request.body(), headers=headers)
        result = await client.send(upstream_request, stream=True)
    except httpx.HTTPError:
        await client.aclose()
        raise HTTPException(502, 'Provider unavailable')

    async def close_upstream():
        await result.aclose()
        await client.aclose()

    return StreamingResponse(result.aiter_bytes(), status_code=result.status_code,
                             headers={'Content-Type': result.headers.get('content-type', 'application/json')},
                             background=BackgroundTask(close_upstream))


@router.api_route('/api/admin/supabase/{resource:path}', methods=['GET', 'POST', 'PATCH', 'DELETE', 'PUT'])
async def supabase_proxy(resource: str, request: Request):
    # Only administrators verified through server-controlled app_metadata reach this route.
    if not resource.startswith(('rest/v1/', 'auth/v1/admin/')) or '..' in resource or '\\' in resource:
        raise HTTPException(400, 'Unsupported resource')
    base, key = os.getenv('SUPABASE_URL', ''), os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
    if not base or not key:
        raise HTTPException(503, 'Administrator storage is not configured')
    headers = {'apikey': key, 'Authorization': f'Bearer {key}',
               'Content-Type': request.headers.get('content-type', 'application/json')}
    for name in ('prefer', 'range', 'accept', 'accept-profile', 'content-profile'):
        if name in request.headers:
            headers[name] = request.headers[name]
    async with httpx.AsyncClient(timeout=30) as client:
        result = await client.request(request.method, f"{base.rstrip('/')}/{resource}",
                                      params=request.query_params, headers=headers, content=await request.body())
    return Response(result.content, status_code=result.status_code,
                    headers={k: v for k, v in result.headers.items() if k in {'content-type', 'content-range', 'preference-applied'}})
