"""Real app smoke tests: isolated storage, no lifespan jobs, no external requests."""
import importlib.util
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))


@unittest.skipUnless(importlib.util.find_spec('telethon'), 'Install backend requirements to run full-app tests')
class AppSecurityTests(unittest.IsolatedAsyncioTestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.env = patch.dict(os.environ, {'MEDIA_STORAGE_DIR': cls.temp.name,
            'SQLITE_DB_PATH': str(Path(cls.temp.name) / 'test.db'), 'LOAD_LOCAL_ENV': '0',
            'SUPABASE_URL': '', 'SUPABASE_SERVICE_ROLE_KEY': '', 'SUPABASE_ANON_KEY': '',
            'GROQ_API_KEY': '', 'MISTRAL_API_KEY': '', 'TELEGRAM_BOT_TOKEN': '',
            'UPSTASH_REDIS_REST_URL': '', 'UPSTASH_REDIS_REST_TOKEN': ''})
        cls.env.start()
        import security
        async def verify(token):
            if token == 'student': return {'id': 'student-id', 'email': 'student@example.com', 'app_metadata': {}}
            if token == 'admin': return {'id': 'admin-id', 'email': 'admin@example.com', 'app_metadata': {'role': 'admin'}}
            return None
        cls.verifier = patch.object(security, 'verify_user', verify)
        cls.verifier.start()
        cls.network = patch('requests.sessions.Session.request', side_effect=RuntimeError('External network disabled in tests'))
        cls.network.start()
        import main
        cls.main = main
        cls.original_cloud_save = staticmethod(main.save_wallet_to_cloud)
        cls.cloud_save = patch.object(main, 'save_wallet_to_cloud', lambda wallet: None)
        cls.cloud_load = patch.object(main, 'load_wallet_from_cloud', lambda email: None)
        cls.cloud_save.start()
        cls.cloud_load.start()

    @classmethod
    def tearDownClass(cls):
        cls.cloud_load.stop()
        cls.cloud_save.stop()
        cls.network.stop()
        cls.verifier.stop()
        cls.env.stop()
        cls.temp.cleanup()

    async def asyncSetUp(self):
        import httpx
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=self.main.app), base_url='http://test')

    async def asyncTearDown(self):
        await self.client.aclose()

    async def test_health_and_protected_admin_routes(self):
        self.assertEqual((await self.client.get('/api/health')).status_code, 200)
        self.assertEqual((await self.client.post('/api/billing/admin/adjust', json={})).status_code, 401)
        self.assertEqual((await self.client.post('/api/billing/admin/adjust', json={}, headers={'Authorization': 'Bearer student'})).status_code, 403)

    async def test_admin_bounty_review_credits_once_and_ignores_client_identity(self):
        import asyncio
        import sqlite3

        student = {'Authorization': 'Bearer student'}
        admin = {'Authorization': 'Bearer admin'}
        payload = {'slug': 'bounty-test', 'problemTitle': 'Bounty test', 'issueType': 'testcase',
                   'language': 'python', 'note': 'The published expectation disagrees with the example.',
                   'testInput': 'nums = [1, 2]', 'requestId': 'app-report-1',
                   'status': 'approved', 'rewardedAmount': 100}
        self.assertEqual((await self.client.get('/api/admin/bounties')).status_code, 401)
        self.assertEqual((await self.client.get('/api/admin/bounties', headers=student)).status_code, 403)
        spoof = await self.client.post('/api/problem-reports', headers=student, json={**payload, 'userEmail': 'another@example.com'})
        self.assertEqual(spoof.status_code, 403)
        first = await self.client.post('/api/problem-reports', headers=student, json=payload)
        self.assertEqual(first.status_code, 201, first.text)
        replay = await self.client.post('/api/problem-reports', headers=student, json=payload)
        self.assertEqual(first.json(), replay.json())
        self.assertEqual(first.json()['status'], 'pending')
        queue = await self.client.get('/api/admin/bounties', headers=admin)
        [pending] = queue.json()['reports']
        self.assertEqual(pending['userEmail'], 'student@example.com')
        self.assertEqual(pending['rewardedAmount'], 0)
        endpoint = '/api/admin/bounties/' + pending['id'] + '/review'
        decision = {'decision': 'approve', 'note': 'Reproduced against the canonical example.'}
        self.assertEqual((await self.client.post(endpoint, headers=student, json=decision)).status_code, 403)
        self.assertEqual((await self.client.post(endpoint, headers=admin, json={**decision, 'note': ' '})).status_code, 422)
        results = await asyncio.gather(*(self.client.post(endpoint, headers=admin, json=decision) for _ in range(2)))
        for result in results:
            self.assertEqual(result.status_code, 200, result.text)
            self.assertEqual(result.json()['report']['rewardedAmount'], 1)
        report, repeated = (result.json()['report'] for result in results)
        self.assertEqual(report['transactionId'], repeated['transactionId'])

        duplicate = await self.client.post('/api/problem-reports', headers=student, json={
            **payload, 'testInput': 'nums=[1,2]', 'requestId': 'app-report-2'})
        resolution = await self.client.post('/api/admin/bounties/' + duplicate.json()['id'] + '/review', headers=admin, json=decision)
        self.assertEqual(resolution.json()['report']['status'], 'duplicate')
        with sqlite3.connect(self.main.SQLITE_DB_PATH) as ledger:
            self.assertEqual(ledger.execute('SELECT amount FROM billing_transactions WHERE id = ? AND user_email = ?',
                                            (report['transactionId'], 'student@example.com')).fetchone(), (1,))

        with patch.object(self.main.r2_storage, 'fetch_json', return_value=[{'id': 'legacy-rep', 'status': 'open'}]):
            archive = await self.client.get('/api/admin/bounties?status=legacy', headers=admin)
        self.assertEqual(archive.json()['reports'], [
            {'id': 'legacy-rep', 'status': 'legacy', 'archivedStatus': 'open', 'rewardedAmount': 0}])
        legacy_credit = await self.client.post('/api/admin/bounties/legacy-rep/review', headers=admin, json=decision)
        self.assertEqual(legacy_credit.status_code, 404)

    async def test_routes_have_no_shadowed_method_path_pairs(self):
        import re
        seen = set()
        for route in self.main.app.routes:
            for method in getattr(route, 'methods', []):
                key = (method, re.sub(r'\{[^}]+\}', '{}', route.path))
                self.assertNotIn(key, seen, f'Shadowed route: {key}')
                seen.add(key)

    async def test_hidden_grading_and_publication_access(self):
        payload = {'language': 'python', 'code': 'def solve(): return 42'}
        self.assertEqual((await self.client.post('/api/problem/example/grade', json=payload)).status_code, 401)
        headers = {'Authorization': 'Bearer student'}
        self.assertEqual((await self.client.post('/api/admin/problems/example/hidden-suite', headers=headers, json={})).status_code, 403)
        self.assertEqual((await self.client.post('/api/admin/problems/example/hidden-candidates', headers=headers, json={})).status_code, 403)
        with patch.object(self.main, 'load_hidden_suite', return_value=None):
            res = await self.client.post('/api/problem/example/grade', headers=headers, json=payload)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json(), {'verdict': 'hidden_unavailable', 'passedCount': 0, 'totalCount': 0, 'measurements': []})

    async def test_real_wallet_validation_and_idempotency(self):
        headers = {'Authorization': 'Bearer student', 'Idempotency-Key': 'app-debit-1'}
        body = {'email': 'student@example.com', 'amount': -1, 'category': 'TEST', 'description': 'test'}
        self.assertEqual((await self.client.post('/api/billing/deduct', json=body, headers=headers)).status_code, 422)
        body['amount'] = 1
        first = await self.client.post('/api/billing/deduct', json=body, headers=headers)
        second = await self.client.post('/api/billing/deduct', json=body, headers=headers)
        self.assertEqual(first.status_code, 200, first.text)
        self.assertEqual(first.json()['newBalance'], second.json()['newBalance'])
        self.assertTrue(second.json()['alreadyProcessed'])

    async def test_missing_provider_configuration_does_not_contact_upstream(self):
        response = await self.client.post('/api/provider/groq/chat/completions', json={}, headers={'Authorization': 'Bearer student'})
        self.assertEqual(response.status_code, 503)

    async def test_financial_backup_never_expands_auth_metadata(self):
        with patch.object(self.main.r2_storage, 'upload_json', return_value='saved') as upload, patch(
            'requests.get') as read_auth, patch('requests.put') as write_auth:
            self.original_cloud_save({'userEmail': 'student@example.com', 'balance': 8})
            upload.assert_called_once()
            read_auth.assert_not_called()
            write_auth.assert_not_called()

    async def test_provider_uses_server_key_and_preserves_stream(self):
        import httpx
        import secure_routes
        real_client = httpx.AsyncClient
        def upstream(request):
            self.assertEqual(request.headers['Authorization'], 'Bearer test-provider-key')
            return httpx.Response(200, headers={'Content-Type': 'text/event-stream'}, content=b'data: test\n\n')
        with patch.dict(os.environ, {'MISTRAL_API_KEY': 'test-provider-key'}), patch.object(
            secure_routes.httpx, 'AsyncClient', lambda **kwargs: real_client(transport=httpx.MockTransport(upstream), **kwargs)):
            response = await self.client.post('/api/provider/mistral/chat/completions', json={'stream': True}, headers={'Authorization': 'Bearer student'})
            self.assertEqual(response.status_code, 200)
            self.assertIn('text/event-stream', response.headers['content-type'])
            self.assertEqual(response.content, b'data: test\n\n')

    async def test_saved_code_round_trip_and_language_validation(self):
        storage = {}
        def save(key, value): storage[key] = value.encode(); return key
        headers = {'Authorization': 'Bearer student'}
        body = {'email': 'student@example.com', 'language': 'python', 'code': 'print(42)'}
        with patch.object(self.main.r2_storage, 'save_note', save), patch.object(self.main.r2_storage, 'fetch_file', lambda key: storage.get(key)):
            result = await self.client.post('/api/problem/two-sum/user-code', json=body, headers=headers)
            self.assertEqual(result.status_code, 200)
            result = await self.client.get('/api/problem/two-sum/user-code?email=student@example.com&language=python', headers=headers)
            self.assertEqual(result.json()['code'], 'print(42)')
            body['language'] = '../../other-user'
            self.assertEqual((await self.client.post('/api/problem/two-sum/user-code', json=body, headers=headers)).status_code, 422)
        body['language'] = 'python'
        with patch.object(self.main.r2_storage, 'save_note', lambda *_: None):
            self.assertEqual((await self.client.post('/api/problem/two-sum/user-code', json=body, headers=headers)).status_code, 503)

    async def test_unauthenticated_media_and_missing_signing_key(self):
        self.assertEqual((await self.client.get('/stream/-100/42')).status_code, 401)
        response = await self.client.post('/api/media/ticket', json={'path': '/stream/-100/42'}, headers={'Authorization': 'Bearer student'})
        self.assertEqual(response.status_code, 503)
