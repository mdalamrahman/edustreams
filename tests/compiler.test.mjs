import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Helper replicate canonicalization and comparison logic tested in compiler
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
}

function compareOutputs(actual, expected) {
  const normAct = String(actual || '').trim();
  const normExp = String(expected || '').trim();
  if (normAct === normExp) return true;

  try {
    const parsedAct = JSON.parse(normAct);
    const parsedExp = JSON.parse(normExp);

    if (deepEqual(parsedAct, parsedExp)) return true;

    // String arrays order-independence (e.g. root-to-leaf paths in any order)
    if (Array.isArray(parsedAct) && Array.isArray(parsedExp)) {
      if (
        parsedAct.length === parsedExp.length &&
        parsedAct.every(x => typeof x === 'string') &&
        parsedExp.every(x => typeof x === 'string')
      ) {
        const sAct = [...parsedAct].map(s => String(s).trim()).sort();
        const sExp = [...parsedExp].map(s => String(s).trim()).sort();
        if (deepEqual(sAct, sExp)) return true;
      }
    }
  } catch (_) {}

  return false;
}

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
