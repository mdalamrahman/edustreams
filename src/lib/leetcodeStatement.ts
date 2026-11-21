import DOMPurify from 'dompurify';

function statementText(root: Element): string {
  const walk = (node: Node): string => {
    if (node.nodeType === 3) return node.textContent || '';
    if (node.nodeType !== 1) return '';
    const tag = (node as Element).tagName;
    if (tag === 'BR') return '\n';
    const text = Array.from(node.childNodes, walk).join('');
    return /^(P|DIV|LI|PRE|TR|H[1-6])$/.test(tag) ? text + '\n' : text;
  };
  return walk(root).replace(/\u00a0/g, ' ').trim();
}

export function parseLeetCodeStatement(html: string) {
  const document = new DOMParser().parseFromString(DOMPurify.sanitize(html), 'text/html');
  const body = document.body;
  for (const image of body.querySelectorAll('img[src]')) {
    try {
      const url = new URL(image.getAttribute('src') || '', 'https://assets.leetcode.com/');
      if (url.protocol === 'https:') image.setAttribute('src', url.href);
      else image.removeAttribute('src');
      image.setAttribute('loading', 'lazy');
    } catch { image.removeAttribute('src'); }
  }
  const description = statementText(body);
  const markers = [...description.matchAll(/(?:^|\n)[ \t]*(Input|Output|Explanation|Constraints|Follow[ -]up)\s*:\s*/gi)];
  const examples: { input: string; output: string; explanation?: string }[] = [];
  let pair: { input: string; output?: string; explanation?: string } | undefined;
  const append = () => {
    if (pair?.input && pair.output !== undefined && pair.output !== '') {
      examples.push({ input: pair.input, output: pair.output, explanation: pair.explanation });
    }
  };
  for (const [index, marker] of markers.entries()) {
    const text = description.slice(marker.index + marker[0].length, markers[index + 1]?.index ?? description.length)
      .replace(/\n\s*(?:Example(?:\s+\d+)?\s*:|(?:Note|Follow[ -]up)\s*:)[\s\S]*$/i, '').trim();
    const label = marker[1].toLowerCase();
    if (label === 'input') { append(); pair = { input: text }; }
    else if (label === 'output' && pair) pair.output = text;
    else if (label === 'explanation' && pair) pair.explanation = text;
    else { append(); pair = undefined; }
  }
  append();
  const constraintHeading = Array.from(body.querySelectorAll('p, h2, h3, strong')).find(
    element => /^constraints\s*:\s*$/i.test(element.textContent?.trim() || ''),
  );
  const constraintList = constraintHeading?.closest('p, h2, h3')?.nextElementSibling;
  const constraints = constraintList?.matches('ol, ul') ? Array.from(constraintList.querySelectorAll('li'), statementText) : [];
  return { html: body.innerHTML, description, examples, constraints };
}
