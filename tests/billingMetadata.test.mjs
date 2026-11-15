import { test } from 'node:test';
import assert from 'node:assert/strict';
process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-public-key';
const calls = [];
globalThis.fetch = async (...args) => { calls.push(args); throw new Error('Unexpected metadata write'); };
const { syncTransactionToSupabase, syncTopupToSupabase } = await import('../src/lib/billing.ts');
test('Browser financial cache synchronization never writes Auth metadata', async () => {
  await syncTransactionToSupabase({ id: 'transaction' }, { userEmail: 'student@example.com' });
  await syncTopupToSupabase({ id: 'topup' });
  assert.equal(calls.length, 0);
});
