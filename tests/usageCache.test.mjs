import { test } from 'node:test';
import assert from 'node:assert/strict';
process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-public-key';
const calls = [];
globalThis.fetch = async (...args) => { calls.push(args); throw new Error('Unexpected network request'); };
const { storeUsagePriceInRedis } = await import('../src/lib/redis.ts');
test('Usage telemetry is cached without a second billing request', async () => {
  const saved = await storeUsagePriceInRedis({ userEmail: 'student@example.com', category: 'TEST', price: 1, description: 'test', syncWithDb: true });
  assert.ok(saved);
  assert.equal(saved.syncedWithDb, false);
  assert.equal(calls.length, 0);
});
