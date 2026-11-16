import asyncio
import json
import os
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
from security import SecurityMiddleware
from media_tickets import sign_ticket, valid_ticket


class SecurityTests(unittest.IsolatedAsyncioTestCase):
    async def request(self, path, method='GET', token='', data=None, query='', origin=''):
        async def endpoint(scope, receive, send):
            if method == 'POST':
                self.assertEqual(json.loads((await receive())['body']), data)
            await send({'type': 'http.response.start', 'status': 200, 'headers': [(b'cache-control', b'public')]})
            await send({'type': 'http.response.body', 'body': b'{}'})
        async def verify(value):
            if value == 'student': return {'id': '1', 'email': 'student@example.com', 'app_metadata': {}, 'user_metadata': {'role': 'admin'}}
            if value == 'admin': return {'id': '2', 'email': 'admin@example.com', 'app_metadata': {'role': 'admin'}}
            return None
        headers = [(b'content-type', b'application/json')]
        if token: headers.append((b'authorization', f'Bearer {token}'.encode()))
        if origin: headers.append((b'origin', origin.encode()))
        messages = []
        async def send(message): messages.append(message)
        async def receive(): return {'type': 'http.request', 'body': json.dumps(data).encode(), 'more_body': False}
        await SecurityMiddleware(endpoint, verify)({'type': 'http', 'path': path, 'method': method,
            'headers': headers, 'query_string': query.encode()}, receive, send)
        return messages[0]['status'], dict(messages[0]['headers'])

    async def test_admin_access_requires_verified_server_role(self):
        for token, status in [('', 401), ('expired', 401), ('student', 403), ('admin', 200)]:
            result, _ = await self.request('/api/billing/admin/adjust', 'POST', token, {'email': 'other@example.com'})
            self.assertEqual(result, status)

    async def test_cross_user_query_and_body_rejected(self):
        self.assertEqual((await self.request('/api/billing/wallet', token='student', query='email=other@example.com'))[0], 403)
        self.assertEqual((await self.request('/api/billing/deduct', 'POST', 'student', {'email': 'other@example.com'}))[0], 403)
        self.assertEqual((await self.request('/api/billing/wallet', token='student'))[0], 400)

    async def test_sensitive_response_not_publicly_cached(self):
        status, headers = await self.request('/api/billing/wallet', token='student', query='email=student@example.com')
        self.assertEqual(status, 200)
        self.assertEqual(headers[b'cache-control'], b'private, no-store')

    async def test_origin_allowlist(self):
        with patch.dict(os.environ, {'ALLOWED_ORIGINS': 'https://student.example.com'}):
            self.assertEqual((await self.request('/api/health', origin='https://evil.example.com'))[0], 403)
            self.assertEqual((await self.request('/api/health', origin='https://student.example.com'))[1][b'access-control-allow-origin'], b'https://student.example.com')

    async def test_admin_database_preflight_allows_postgrest_headers(self):
        with patch.dict(os.environ, {'ALLOWED_ORIGINS': 'https://admin.example.com'}):
            status, headers = await self.request('/api/admin/supabase/rest/v1/user_dsa_progress', method='OPTIONS', origin='https://admin.example.com')
            self.assertEqual(status, 204)
            permitted = headers[b'access-control-allow-headers'].decode().lower()
            for name in ('prefer', 'cache-control', 'pragma', 'accept-profile', 'content-profile'):
                self.assertIn(name, permitted)
            self.assertEqual((await self.request('/api/admin/supabase/rest/v1/user_dsa_progress', token='student'))[0], 403)

    async def test_unauthenticated_mutation_and_stream_blocked(self):
        for path in ['/api/problem/example/upload', '/api/provider/groq/chat/completions', '/stream/-100/42']:
            self.assertEqual((await self.request(path, 'POST'))[0], 401)

    async def test_ticket_is_expiring_and_path_bound(self):
        import time
        with patch.dict(os.environ, {'MEDIA_SIGNING_KEY': 'test-key-' * 5}):
            expiry = int(time.time()) + 100
            signature = sign_ticket('/stream/-100/42', expiry)
            self.assertTrue(valid_ticket('/stream/-100/42', expiry, signature))
            self.assertFalse(valid_ticket('/stream/-100/43', expiry, signature))
            self.assertFalse(valid_ticket('/stream/-100/42', 1, signature))
            self.assertEqual((await self.request('/stream/-100/42', query=f'expires={expiry}&signature={signature}'))[0], 200)
