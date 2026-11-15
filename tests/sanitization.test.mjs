import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
const window = new JSDOM('').window;
const purifier = createDOMPurify(window);
test('Diagram sanitizer removes scripts, event handlers and foreign HTML', () => {
  const dirty = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><foreignObject><img src=x onerror="alert(1)"></foreignObject><path d="M0 0"/></svg>';
  const clean = purifier.sanitize(dirty, { USE_PROFILES: { svg: true, svgFilters: true } });
  assert.doesNotMatch(clean, /script|onload|onerror|foreignObject/i);
  assert.match(clean, /<path/);
});
test('Print sanitizer removes injected JavaScript URLs and handlers', () => {
  const clean = purifier.sanitize('<html><body><img src=x onerror="alert(1)"><a href="javascript:alert(1)">click</a><p>Notes</p></body></html>', { WHOLE_DOCUMENT: true });
  assert.doesNotMatch(clean, /onerror|javascript:/i);
  assert.match(clean, /Notes/);
});
