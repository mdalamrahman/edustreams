import requests
import json
import re
import html

def clean_html_entities(text: str) -> str:
    if not text:
        return ""
    # Convert superscripts and subscripts
    text = re.sub(r'<sup>([\s\S]*?)</sup>', r'^\1', text, flags=re.IGNORECASE)
    text = re.sub(r'<sub>([\s\S]*?)</sub>', r'_\1', text, flags=re.IGNORECASE)
    # Standard HTML entity unescape
    text = html.unescape(text)
    # Additional common LeetCode entities
    replacements = {
        '&ldquo;': '"',
        '&rdquo;': '"',
        '&lsquo;': "'",
        '&rsquo;': "'",
        '&nbsp;': ' ',
        '&lt;': '<',
        '&gt;': '>',
        '&le;': '<=',
        '&ge;': '>=',
        '&quot;': '"',
        '&#39;': "'",
        '&amp;': '&',
        '&hellip;': '...',
        '&times;': '×',
        '&minus;': '-',
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    return text

def parse_leetcode_html_v2(html_str: str) -> dict:
    if not html_str:
        return {"description": "", "examples": [], "constraints": []}

    # 1. Parse Constraints
    constraints = []
    con_m = re.search(r'<p><strong[^>]*>Constraints:</strong></p>\s*<ul>([\s\S]*?)</ul>', html_str, re.IGNORECASE)
    if not con_m:
        con_m = re.search(r'<strong>Constraints:</strong>\s*<ul>([\s\S]*?)</ul>', html_str, re.IGNORECASE)
    if con_m:
        lis = re.findall(r'<li>([\s\S]*?)</li>', con_m.group(1), re.IGNORECASE)
        for li in lis:
            c = re.sub(r'<code>([\s\S]*?)</code>', r'`\1`', li, flags=re.IGNORECASE)
            c = re.sub(r'<[^>]+>', '', c)
            c = clean_html_entities(c).strip()
            if c:
                constraints.append(c)

    # 2. Split content into Examples sections
    examples = []
    
    # Extract all example blocks (splits on Example 1:, Example 2:, etc.)
    example_sections = re.split(r'<p><strong[^>]*class=["\']?example["\']?[^>]*>Example\s*(\d+):?</strong></p>|<strong[^>]*class=["\']?example["\']?[^>]*>Example\s*(\d+):?</strong>', html_str, flags=re.IGNORECASE)
    
    # In re.split with 2 groups, matches produce [intro, grp1, grp2, content1, grp1, grp2, content2, ...]
    # Let's extract each example block
    ex_pattern = re.compile(r'(?:<p><strong[^>]*class=["\']?example["\']?[^>]*>Example\s*(\d+):?</strong></p>|<strong[^>]*class=["\']?example["\']?[^>]*>Example\s*(\d+):?</strong>)([\s\S]*?)(?=(?:<p><strong[^>]*class=["\']?example["\']?[^>]*>Example\s*\d+:?</strong>|<p><strong[^>]*>Constraints:|<p>&nbsp;</p>\s*<p><strong>Constraints:|$))', re.IGNORECASE)
    
    matches = list(ex_pattern.finditer(html_str))
    for m in matches:
        num = m.group(1) or m.group(2) or str(len(examples) + 1)
        body = m.group(3)
        
        # Check for image inside this example body
        img_m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', body, re.IGNORECASE)
        img_url = None
        if img_m:
            src = img_m.group(1).strip()
            if src.startswith('/'):
                img_url = f"https://assets.leetcode.com{src}"
            elif not src.startswith('http'):
                img_url = f"https://assets.leetcode.com/uploads/{src.lstrip('/')}"
            else:
                img_url = src

        # Extract pre content
        pre_m = re.search(r'<pre>([\s\S]*?)</pre>', body, re.IGNORECASE)
        pre_text = pre_m.group(1) if pre_m else body
        pre_clean = re.sub(r'<[^>]+>', '', pre_text).strip()
        pre_clean = clean_html_entities(pre_clean)

        in_m = re.search(r'Input:\s*([\s\S]*?)(?=\nOutput:|$)', pre_clean, re.IGNORECASE)
        out_m = re.search(r'Output:\s*([\s\S]*?)(?=\nExplanation:|$)', pre_clean, re.IGNORECASE)
        exp_m = re.search(r'Explanation:\s*([\s\S]*?)$', pre_clean, re.IGNORECASE)

        inp = in_m.group(1).strip() if in_m else pre_clean
        outp = out_m.group(1).strip() if out_m else ""
        exp = exp_m.group(1).strip() if exp_m else None

        examples.append({
            "input": inp,
            "output": outp,
            "explanation": exp,
            "image": img_url
        })

    # Fallback if regex split didn't find standard examples
    if not examples:
        ex_blocks = re.findall(r'<pre>([\s\S]*?)</pre>', html_str, re.IGNORECASE)
        for eb in ex_blocks:
            text = re.sub(r'<[^>]+>', '', eb).strip()
            text = clean_html_entities(text)
            in_m = re.search(r'Input:\s*([\s\S]*?)(?=\nOutput:|$)', text, re.IGNORECASE)
            out_m = re.search(r'Output:\s*([\s\S]*?)(?=\nExplanation:|$)', text, re.IGNORECASE)
            exp_m = re.search(r'Explanation:\s*([\s\S]*?)$', text, re.IGNORECASE)
            inp = in_m.group(1).strip() if in_m else text
            outp = out_m.group(1).strip() if out_m else ""
            exp = exp_m.group(1).strip() if exp_m else None
            if inp and outp:
                examples.append({"input": inp, "output": outp, "explanation": exp})

    # 3. Clean Description (Intro portion before Example 1 / Constraints)
    # Split before Example 1
    parts = re.split(r'<p><strong[^>]*class=["\']?example["\']?[^>]*>Example\s*1:?</strong></p>|<strong[^>]*class=["\']?example["\']?[^>]*>Example\s*1:?</strong>|<pre>', html_str, maxsplit=1, flags=re.IGNORECASE)
    desc_raw = parts[0] if len(parts) > 1 else html_str

    desc = desc_raw
    desc = re.sub(r'<p><strong[^>]*>Constraints:</strong></p>[\s\S]*$', '', desc, flags=re.IGNORECASE)
    desc = re.sub(r'</p>', '\n\n', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<br\s*/?>', '\n', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<code>([\s\S]*?)</code>', r'`\1`', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<strong>([\s\S]*?)</strong>', r'**\1**', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<em>([\s\S]*?)</em>', r'*\1*', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>([\s\S]*?)</a>', r'[\2](\1)', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<[^>]+>', '', desc)
    desc = clean_html_entities(desc)
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
for slug in ['lowest-common-ancestor-of-a-binary-search-tree', 'symmetric-tree', 'two-sum']:
    resp = requests.post(
        'https://leetcode.com/graphql',
        json={'query': query, 'variables': {'titleSlug': slug}},
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
    )
    content = resp.json().get('data', {}).get('question', {}).get('content', '')
    parsed = parse_leetcode_html_v2(content)
    print(f"================ {slug} ================")
    print("DESCRIPTION:")
    print(parsed['description'])
    print("\nEXAMPLES:")
    for idx, ex in enumerate(parsed['examples']):
        print(f"  Example {idx+1}:")
        print(f"    Image: {ex.get('image')}")
        print(f"    Input: {ex.get('input')}")
        print(f"    Output: {ex.get('output')}")
        print(f"    Explanation: {ex.get('explanation')}")
    print("\nCONSTRAINTS:")
    for c in parsed['constraints']:
        print(f"  - {c}")
