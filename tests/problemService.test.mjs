import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'public-test-placeholder';
const { decodeHtmlEntities } = await import('../src/lib/problemService.ts');

describe('Problem Service Entity Decoding & Validation', () => {
  test('Decodes LeetCode escaped HTML entities', () => {
    const raw = '[&quot;1-&gt;2-&gt;5&quot;,&quot;1-&gt;3&quot;]';
    const decoded = decodeHtmlEntities(raw);
    assert.equal(decoded, '["1->2->5","1->3"]');
    assert.doesNotThrow(() => JSON.parse(decoded));
  });

  test('Decodes math inequalities and quotes in constraints', () => {
    const rawConstraint = '1 &le; nums.length &le; 10^5 and &minus;100 &le; val &le; 100';
    const decoded = decodeHtmlEntities(rawConstraint);
    assert.equal(decoded, '1 <= nums.length <= 10^5 and -100 <= val <= 100');
  });

});
