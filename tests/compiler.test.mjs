import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'public-test-placeholder';
const { compareOutputs } = await import('../src/lib/compiler.ts');

describe('Compiler Output Verification Engine', () => {
  test('Exact string scalar matches', () => {
    assert.equal(compareOutputs('42', '42'), true);
    assert.equal(compareOutputs('hello world', 'hello world'), true);
    assert.equal(compareOutputs('false', 'false'), true);
  });

  test('JSON Array exact matching', () => {
    assert.equal(compareOutputs('[1, 2, 3]', '[1,2,3]'), true);
    assert.equal(compareOutputs('[[1,2],[3,4]]', '[[1, 2], [3, 4]]'), true);
  });

  test('String arrays order-independence (Root-to-Leaf paths, Subsets)', () => {
    const act = '["1->3", "1->2->5"]';
    const exp = '["1->2->5", "1->3"]';
    assert.equal(compareOutputs(act, exp), true);
  });

  test('Detects genuine mismatches', () => {
    assert.equal(compareOutputs('[1, 2, 3]', '[1, 2, 4]'), false);
    assert.equal(compareOutputs('["a"]', '["b"]'), false);
    assert.equal(compareOutputs('0', '["1->2"]'), false);
  });
});
