import urllib.request
import json
import re

url = "https://alfa-leetcode-api.onrender.com/select?titleSlug=two-sum"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=10) as r:
    data = json.loads(r.read().decode('utf-8'))
    html = data.get('question', '')

def parse_leetcode_html(html_str):
    # Strip HTML tags but preserve code and formatting
    # Extract examples
    examples = []
    ex_blocks = re.findall(r'<pre>(.*?)</pre>', html_str, re.DOTALL)
    for eb in ex_blocks:
        clean_eb = re.sub(r'<[^>]+>', '', eb).strip()
        input_match = re.search(r'Input:\s*(.*?)(?=\nOutput:|$)', clean_eb, re.DOTALL)
        output_match = re.search(r'Output:\s*(.*?)(?=\nExplanation:|$)', clean_eb, re.DOTALL)
        expl_match = re.search(r'Explanation:\s*(.*?)$', clean_eb, re.DOTALL)
        
        inp = input_match.group(1).strip() if input_match else clean_eb
        outp = output_match.group(1).strip() if output_match else ''
        expl = expl_match.group(1).strip() if expl_match else None
        
        if inp:
            examples.append({'input': inp, 'output': outp, 'explanation': expl})
            
    # Extract constraints
    constraints = []
    con_block = re.search(r'<p><strong[^>]*>Constraints:</strong></p>\s*<ul>(.*?)</ul>', html_str, re.DOTALL)
    if con_block:
        lis = re.findall(r'<li>(.*?)</li>', con_block.group(1), re.DOTALL)
        for li in lis:
            clean_li = re.sub(r'<[^>]+>', '', li).replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>').replace('&le;', '<=').replace('&ge;', '>=').strip()
            if clean_li:
                constraints.append(clean_li)

    # Clean description
    desc = re.sub(r'<pre>.*?</pre>', '', html_str, flags=re.DOTALL)
    desc = re.sub(r'<p><strong[^>]*>Constraints:</strong></p>\s*<ul>.*?</ul>', '', desc, flags=re.DOTALL)
    desc = re.sub(r'<p><strong[^>]*>Example \d+:.*?</strong></p>', '', desc, flags=re.DOTALL)
    desc = re.sub(r'</p>', '\n\n', desc)
    desc = re.sub(r'<br\s*/?>', '\n', desc)
    desc = re.sub(r'<code>(.*?)</code>', r'`\1`', desc)
    desc = re.sub(r'<strong>(.*?)</strong>', r'**\1**', desc)
    desc = re.sub(r'<em>(.*?)</em>', r'*\1*', desc)
    desc = re.sub(r'<[^>]+>', '', desc)
    desc = desc.replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>').replace('&le;', '<=').replace('&ge;', '>=').replace('&quot;', '"')
    desc = re.sub(r'\n{3,}', '\n\n', desc).strip()
    
    return desc, examples, constraints

d, ex, con = parse_leetcode_html(html)
print("Cleaned description:\n", d)
print("\nParsed Examples (count =):", len(ex))
for i, e in enumerate(ex):
    print(f"Ex {i+1}: Input: {e['input']} | Output: {e['output']}")
print("\nParsed Constraints:", con)
