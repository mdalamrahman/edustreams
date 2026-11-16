import { test, after } from 'node:test';
import assert from 'node:assert/strict';
process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'public-test-key';
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) };
globalThis.window = { location: { origin: 'https://student.example.com' }, dispatchEvent: () => true };
const requests = [];
globalThis.fetch = async (...args) => {
  requests.push(args);
  if (new URL(args[0].url).pathname === '/api/passkey/verify') return new Response('{"valid":false}', { headers: { 'Content-Type': 'application/json' } });
  throw new Error('Preview must not issue a mutation');
};
const { isRecruiterPreviewEnabled, setRecruiterPreviewEnabled } = await import('../src/lib/recruiterPreview.ts');
const { saveProblemNote } = await import('../src/lib/notesService.ts');
const { executeCode } = await import('../src/lib/compiler.ts');
const { deductCredits } = await import('../src/lib/billing.ts');
const { apiFetch } = await import('../src/lib/apiFetch.ts');
const { supabase } = await import('../src/lib/supabase.ts');
after(() => supabase.auth.stopAutoRefresh());

test('Old fabricated recruiter sessions migrate to a separate preview flag', () => {
  storage.clear();
  localStorage.setItem('edustream_student_session', JSON.stringify({ id: 'demo-recruiter-old', email: 'recruiter.demo@sdetube.dev' }));
  assert.equal(isRecruiterPreviewEnabled(), true);
  assert.equal(localStorage.getItem('edustream_student_session'), null);
  assert.equal(localStorage.getItem('sdetube_recruiter_preview'), 'true');
});

test('Preview cannot run code, save notes, charge a wallet, or mutate backend state', async () => {
  storage.clear(); requests.length = 0;
  setRecruiterPreviewEnabled(true);
  const before = [...storage];
  assert.equal((await executeCode('print(42)', 'python')).status, 'ERROR');
  assert.equal((await saveProblemNote('two-sum', 'Two Sum', 'new note')).success, false);
  assert.equal(deductCredits(1, 'COMPILER_RUN', 'run').success, false);
  const response = await apiFetch('/api/interview/save', { method: 'POST', body: '{}' });
  assert.equal(response.status, 401);
  assert.deepEqual([...storage], before);
  assert.equal(requests.length, 0);
  setRecruiterPreviewEnabled(false);
  assert.equal(isRecruiterPreviewEnabled(), false);
});

test('Public signup verification remains available when leaving the preview to create an account', async () => {
  storage.clear(); requests.length = 0;
  setRecruiterPreviewEnabled(true);
  const response = await apiFetch('/api/passkey/verify', { method: 'POST', body: '{"code":"test-code"}' });
  assert.equal(response.status, 200);
  assert.equal(requests.length, 1);
  assert.equal(requests[0][0].headers.has('Authorization'), false);
  setRecruiterPreviewEnabled(false);
});
