import requests
import json
import re

def parse_leetcode_html(html_str: str) -> dict:
    if not html_str:
        return {"description": "", "examples": [], "constraints": []}

    # 1. Convert all <img> tags to Markdown images
    def convert_img(match):
        m_src = re.search(r'src=["\']([^"\']+)["\']', match.group(0), re.IGNORECASE)
        m_alt = re.search(r'alt=["\']([^"\']*)["\']', match.group(0), re.IGNORECASE)
        if not m_src:
            return ""
        src = m_src.group(1).strip()
        alt = m_alt.group(1).strip() if m_alt else "Diagram"
        if src.startswith("/"):
            src = f"https://assets.leetcode.com{src}"
        elif not src.startswith("http"):
            src = f"https://assets.leetcode.com/uploads/{src.lstrip('/')}"
        return f"\n\n![{alt}]({src})\n\n"

    working_html = re.sub(r'<img[^>]*>', convert_img, html_str, flags=re.IGNORECASE)

    # 2. Extract Examples
    examples = []
    ex_blocks = re.findall(r'<pre>([\s\S]*?)</pre>', working_html, re.IGNORECASE)
    for eb in ex_blocks:
        text = re.sub(r'<[^>]+>', '', eb).strip()
        in_m = re.search(r'Input:\s*([\s\S]*?)(?=\nOutput:|$)', text, re.IGNORECASE)
        out_m = re.search(r'Output:\s*([\s\S]*?)(?=\nExplanation:|$)', text, re.IGNORECASE)
        exp_m = re.search(r'Explanation:\s*([\s\S]*?)$', text, re.IGNORECASE)
        inp = in_m.group(1).strip() if in_m else text
        outp = out_m.group(1).strip() if out_m else ""
        exp = exp_m.group(1).strip() if exp_m else None
        if inp and outp:
            examples.append({"input": inp, "output": outp, "explanation": exp})

    # 3. Extract Constraints
    constraints = []
    con_m = re.search(r'<p><strong[^>]*>Constraints:</strong></p>\s*<ul>([\s\S]*?)</ul>', working_html, re.IGNORECASE)
    if con_m:
        lis = re.findall(r'<li>([\s\S]*?)</li>', con_m.group(1), re.IGNORECASE)
        for li in lis:
            c = re.sub(r'<[^>]+>', '', li)
            c = c.replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>').replace('&le;', '<=').replace('&ge;', '>=').replace('&quot;', '"').strip()
            if c:
                constraints.append(c)

    # 4. Clean description while preserving markdown images
    desc = re.sub(r'<pre>[\s\S]*?</pre>', '', working_html, flags=re.IGNORECASE)
    desc = re.sub(r'<p><strong[^>]*>Constraints:</strong></p>\s*<ul>[\s\S]*?</ul>', '', desc, flags=re.IGNORECASE)
    desc = re.sub(r'</p>', '\n\n', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<br\s*/?>', '\n', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<code>([\s\S]*?)</code>', r'`\1`', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<strong>([\s\S]*?)</strong>', r'**\1**', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<em>([\s\S]*?)</em>', r'*\1*', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<[^>]+>', '', desc)
    desc = desc.replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>').replace('&le;', '<=').replace('&ge;', '>=').replace('&quot;', '"')
    desc = re.sub(r'\n{3,}', '\n\n', desc).strip()

    return {"description": desc, "examples": examples, "constraints": constraints}


query = """
query getQuestionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    title
    content
  }
}
"""
for slug in ['symmetric-tree', 'invert-binary-tree', 'clone-graph']:
    resp = requests.post(
        'https://leetcode.com/graphql',
        json={'query': query, 'variables': {'titleSlug': slug}},
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
    )
    content = resp.json().get('data', {}).get('question', {}).get('content', '')
    parsed = parse_leetcode_html(content)
    print(f"=== {slug} ===")
    print("Description:\n", parsed['description'])
    print("Examples count:", len(parsed['examples']))
    print("-" * 50)
