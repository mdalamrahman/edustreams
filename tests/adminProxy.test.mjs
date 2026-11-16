import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../admin-portal/api/backend.js';

test('Admin proxy preserves PostgREST upsert and schema headers', async () => {
  const originalFetch = globalThis.fetch;
  const previousBackend = process.env.BACKEND_URL;
  process.env.BACKEND_URL = 'https://backend.example.test';
  let forwarded;
  globalThis.fetch = async (url, options) => {
    forwarded = { url, options };
    return new Response(null, { status: 204 });
  };
  const headers = {};
  const res = { status(code) { this.statusCode = code; return this; }, setHeader(key, value) { headers[key] = value; }, end() {} };
  try {
    await handler({ method: 'POST', query: { path: '/api/admin/supabase/rest/v1/user_dsa_progress' }, headers: {
      authorization: 'Bearer verified-admin-session', 'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates', 'content-profile': 'public', apikey: 'must-not-forward',
    }, body: { user_email: 'system_platform_config' } }, res);
    assert.equal(res.statusCode, 204);
    assert.equal(forwarded.options.headers.prefer, 'resolution=merge-duplicates');
    assert.equal(forwarded.options.headers['content-profile'], 'public');
    assert.equal(forwarded.options.headers.apikey, undefined);
    assert.equal(headers['Cache-Control'], 'private, no-store');
  } finally {
    globalThis.fetch = originalFetch;
    if (previousBackend === undefined) delete process.env.BACKEND_URL;
    else process.env.BACKEND_URL = previousBackend;
  }
});
