"""Authentication and response policy, independent of application startup side effects."""
import json
import os
import re
import time
from urllib.parse import parse_qs

import httpx
from media_tickets import valid_ticket


class SecurityMiddleware:
    def __init__(self, app, verifier=None):
        self.app = app
        self.verifier = verifier or verify_user
        self.request_windows = {}

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http':
            return await self.app(scope, receive, send)
        path, method = scope['path'], scope['method']
        headers = dict(scope.get('headers', []))
        maximum_size = int(os.getenv('MAX_REQUEST_BYTES', '2097152'))
        origin = headers.get(b'origin', b'').decode()
        allowed = {v.strip() for v in os.getenv('ALLOWED_ORIGINS', '').split(',') if v.strip()}

        async def respond(status, message):
            await send({'type': 'http.response.start', 'status': status,
                        'headers': [(b'content-type', b'application/json'), (b'cache-control', b'no-store')]})
            await send({'type': 'http.response.body', 'body': json.dumps({'detail': message}).encode()})

        if origin and origin not in allowed:
            return await respond(403, 'Origin not allowed')
        try:
            if int(headers.get(b'content-length', b'0')) > maximum_size:
                return await respond(413, 'Request too large')
        except ValueError:
            return await respond(400, 'Invalid content length')
        if method == 'OPTIONS':
            response_headers = [(b'vary', b'Origin')]
            if origin in allowed:
                response_headers += [(b'access-control-allow-origin', origin.encode()),
                                     (b'access-control-allow-methods', b'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS'),
                                     (b'access-control-allow-headers', b'Authorization, Content-Type, Range, Idempotency-Key')]
            await send({'type': 'http.response.start', 'status': 204, 'headers': response_headers})
            return await send({'type': 'http.response.body', 'body': b''})

        protected = path.startswith(('/api/', '/stream/', '/interview/'))
        query = parse_qs(scope.get('query_string', b'').decode())
        signed_media = path.startswith('/stream/') and method in {'GET', 'HEAD'} and valid_ticket(
            path, query.get('expires', [''])[0], query.get('signature', [''])[0])
        public = path in {'/api/health', '/api/passkey/verify'} or (
            method in {'GET', 'HEAD'} and path.startswith(('/api/potd/', '/api/leetcode/', '/api/gfg/',
                '/api/company-problems/', '/api/catalog/', '/api/image/')) and not path.endswith('/clear'))
        admin = (path.startswith(('/api/admin/', '/api/billing/admin/', '/api/admin/supabase/'))
                 or path in {'/api/passkey/generate', '/api/passkey/active', '/api/auth/register_confirmed',
                             '/api/billing/credit', '/api/bounty/claim', '/api/potd/clear', '/api/send-otp-email'}
                 or (method not in {'GET', 'HEAD'} and path.startswith('/api/potd/'))
                 or (method not in {'GET', 'HEAD'} and re.match(
                     r'^/api/problem/[^/]+/(upload|expand-testcases|generate-drivers|validate-pipeline|save-solution|solution|driver(?:/.*)?|drivers|correct-driver|correct-testcase)$', path))
                 or (method == 'DELETE' and path.startswith('/api/problem/'))
                 or (path.startswith('/api/problem-reports') and (method == 'GET' or path.endswith('/resolve')))
                 or (method not in {'GET', 'HEAD'} and path.startswith('/api/notes/'))
                 or (method not in {'GET', 'HEAD'} and path.startswith('/api/ai/cache/'))
                 or path in {'/api/ai/cache/clear'} or (method == 'DELETE' and path == '/api/ai/cache'))
        if path == '/api/passkey/verify':
            window = int(time.time() // 60)
            client = scope.get('client') or ('unknown', 0)
            key = ('invite:' + client[0], window)
            self.request_windows = {k: v for k, v in self.request_windows.items() if k[1] == window}
            self.request_windows[key] = self.request_windows.get(key, 0) + 1
            if self.request_windows[key] > 10:
                return await respond(429, 'Request limit exceeded')
        user = None
        if protected and not public and not signed_media:
            token = headers.get(b'authorization', b'').decode()
            if not token.startswith('Bearer '):
                return await respond(401, 'Authentication required')
            user = await self.verifier(token[7:])
            if not user:
                return await respond(401, 'Invalid or expired session')
            is_admin = user.get('app_metadata', {}).get('role') == 'admin'
            if admin and not is_admin:
                return await respond(403, 'Administrator access required')
            scope.setdefault('state', {})['user'] = user
            if method not in {'GET', 'HEAD'}:
                window = int(time.time() // 60)
                key = (user['id'], window)
                self.request_windows = {k: v for k, v in self.request_windows.items() if k[1] == window}
                count = self.request_windows.get(key, 0) + 1
                self.request_windows[key] = count
                if count > int(os.getenv('MAX_USER_REQUESTS_PER_MINUTE', '120')):
                    return await respond(429, 'Request limit exceeded')
            # Existing handlers accept identity fields: reject cross-user requests before dispatch.
            query = parse_qs(scope.get('query_string', b'').decode())
            identities = [v for k in ('email', 'user_email', 'userEmail') for v in query.get(k, [])]
            match = re.match(r'^/api/user-progress/(.+)$', path)
            if match:
                from urllib.parse import unquote
                identities.append(unquote(match[1]))
            body = b''
            if method not in {'GET', 'HEAD'}:
                while True:
                    message = await receive()
                    if message['type'] == 'http.disconnect':
                        return
                    body += message.get('body', b'')
                    if len(body) > maximum_size:
                        return await respond(413, 'Request too large')
                    if not message.get('more_body'):
                        break
                if 'application/json' in headers.get(b'content-type', b'').decode():
                    try:
                        data = json.loads(body or b'{}')
                        if isinstance(data, dict):
                            identities += [data[k] for k in ('email', 'user_email', 'userEmail') if data.get(k)]
                    except (ValueError, TypeError):
                        return await respond(400, 'Invalid JSON')
                original_receive = receive
                replayed = False
                async def replay():
                    nonlocal replayed
                    if not replayed:
                        replayed = True
                        return {'type': 'http.request', 'body': body, 'more_body': False}
                    return await original_receive()
                receive = replay
            if not is_admin and any(not isinstance(v, str) or v.lower().strip() != user.get('email', '').lower() for v in identities):
                return await respond(403, 'Cannot access another user')
            # Legacy identity-based handlers must receive an explicit verified identity.
            if not is_admin and (path in {'/api/billing/wallet', '/api/billing/transactions', '/api/billing/topups', '/api/interview/history'} or path.endswith(('/user-code', '/submissions'))) and method == 'GET' and not identities:
                return await respond(400, 'User email is required')

        async def secure_send(message):
            if message['type'] == 'http.response.start':
                # Override legacy CORS/cache headers centrally.
                response_headers = [(k, v) for k, v in message.get('headers', [])
                                    if not k.lower().startswith(b'access-control-') and k.lower() != b'cache-control']
                response_headers += [(b'cache-control', b'private, no-store'), (b'vary', b'Origin'),
                                     (b'x-content-type-options', b'nosniff')]
                if origin in allowed:
                    response_headers += [(b'access-control-allow-origin', origin.encode()),
                                         (b'access-control-expose-headers', b'Content-Range, Content-Length, Accept-Ranges')]
                message = {**message, 'headers': response_headers}
            await send(message)
        await self.app(scope, receive, secure_send)


async def verify_user(token):
    url, key = os.getenv('SUPABASE_URL', ''), os.getenv('SUPABASE_ANON_KEY', '')
    if not url or not key or not token:
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{url.rstrip('/')}/auth/v1/user",
                                        headers={'apikey': key, 'Authorization': f'Bearer {token}'})
        if response.status_code == 200:
            user = response.json()
            if user.get('id') and user.get('email'):
                return user
    except (httpx.HTTPError, ValueError):
        pass
    return None
