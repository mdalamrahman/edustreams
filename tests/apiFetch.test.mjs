import { test } from 'node:test';
import assert from 'node:assert/strict';
process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-public-key';
process.env.VITE_BACKEND_URL = 'https://backend.example.com';
globalThis.window = { location: { origin: 'https://student.example.com' } };
const calls = [];
globalThis.fetch = async (input, init) => { calls.push(new Request(input, init)); return new Response('{}'); };
const { apiFetch, setSessionTokenProvider } = await import('../src/lib/apiFetch.ts');
setSessionTokenProvider(async () => 'user-session');
test('Attach user token to first-party APIs', async () => {
  await apiFetch('https://backend.example.com/api/billing/wallet');
  assert.equal(calls.at(-1).headers.get('Authorization'), 'Bearer user-session');
});
test('Do not send user session to third-party services', async () => {
  await apiFetch('https://external.example.com/data');
  assert.equal(calls.at(-1).headers.has('Authorization'), false);
});
test('Route AI requests through the authenticated backend', async () => {
  await apiFetch('https://api.mistral.ai/v1/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer server-managed', 'Content-Type': 'application/json' }, body: '{}' });
  const request = calls.at(-1);
  assert.equal(request.url, 'https://backend.example.com/api/provider/mistral/chat/completions');
  assert.equal(request.headers.get('Authorization'), 'Bearer user-session');
  assert.equal(await request.text(), '{}');
});
