import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { assessResume } from '../src/lib/atsEvidence.ts';

const { window } = new JSDOM('');
globalThis.window = window;
globalThis.DOMParser = window.DOMParser;
const { parseLeetCodeStatement } = await import('../src/lib/leetcodeStatement.ts');

test('LeetCode parsing preserves statement markup and pairs every Same Tree example', () => {
  const result = parseLeetCodeStatement(
    '<p>Compare two binary trees.</p><pre>root notation</pre>' +
    '<p><strong class="example">Example 1:</strong></p><img src="/uploads/tree.png" onerror="alert(1)">' +
    '<pre><strong>Input:</strong> p = [1,2,3], q = [1,2,3]\n<strong>Output:</strong> true</pre>' +
    '<p><b>Example 2:</b></p><pre>Input: p = [1,2], q = [1,null,2]<br>Output: false</pre>' +
    '<p>Example 3:</p><pre>Input: p = [1,2,1], q = [1,1,2]\nOutput: false</pre>' +
    '<p><strong>Constraints:</strong></p><ul><li>At most 100 nodes.</li></ul>' +
    '<p>Follow-up: compare iteratively.</p><table><tr><td>Tree format</td></tr></table>',
  );
  assert.deepEqual(result.examples.map(item => [item.input, item.output]), [
    ['p = [1,2,3], q = [1,2,3]', 'true'],
    ['p = [1,2], q = [1,null,2]', 'false'],
    ['p = [1,2,1], q = [1,1,2]', 'false'],
  ]);
  assert.deepEqual(result.constraints, ['At most 100 nodes.']);
  assert.match(result.html, /root notation/);
  assert.match(result.html, /https:\/\/assets\.leetcode\.com\/uploads\/tree\.png/);
  assert.match(result.html, /<table>/);
  assert.match(result.html, /Follow-up/);
  assert.doesNotMatch(result.html, /onerror/);
});

test('Published sample parser retains false, zero, null and empty-string results', () => {
  const html = ['false', '0', 'null', '""'].map((output, i) => '<pre>Input: x = ' + i + '\nOutput: ' + output + '</pre>').join('');
  assert.deepEqual(parseLeetCodeStatement(html).examples.map(item => item.output), ['false', '0', 'null', '""']);
});

test('ATS coverage uses only user job requirements and resume excerpts', () => {
  const resume = 'Taylor Example\nSkills\nJavaScript, Playwright\nExperience\nReduced latency by 25% using JavaScript.';
  assert.equal(assessResume(resume).match, null);
  const { match } = assessResume(resume, 'Qualifications: Java, JavaScript and Playwright.');
  assert.equal(match.score, 67);
  assert.equal(match.requirements.find(item => item.term === 'Java').evidence, null);
  assert.match(match.requirements.find(item => item.term === 'Playwright').evidence, /Playwright/);
});
