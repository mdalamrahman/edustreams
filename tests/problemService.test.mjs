import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&le;/g, '<=')
    .replace(/&ge;/g, '>=')
    .replace(/&minus;/g, '-')
    .replace(/&times;/g, 'x');
}

function validateProblemStructure(prob) {
  if (!prob || !prob.name || !prob.description) return false;
  if (!Array.isArray(prob.testCases) || prob.testCases.length === 0) return false;
  if (!Array.isArray(prob.expectedOutputs) || prob.expectedOutputs.length === 0) return false;
  if (prob.testCases.length !== prob.expectedOutputs.length) return false;
  return true;
}

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

  test('Validates authentic problem data structure', () => {
    const valid = {
      name: 'Binary Tree Paths',
      description: 'Given the root of a binary tree...',
      testCases: ['root = [1,2,3,null,5]', 'root = [1]'],
      expectedOutputs: ['["1->2->5","1->3"]', '["1"]']
    };
    assert.equal(validateProblemStructure(valid), true);

    const invalidMismatched = {
      name: 'Bad Problem',
      description: 'Desc',
      testCases: ['root = [1]'],
      expectedOutputs: ['["1"]', '["2"]']
    };
    assert.equal(validateProblemStructure(invalidMismatched), false);
  });
});
