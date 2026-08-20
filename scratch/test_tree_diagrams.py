import urllib.request
import urllib.parse
import json

slugs = ['symmetric-tree', 'invert-binary-tree', 'clone-graph', 'binary-tree-level-order-traversal']

for s in slugs:
    url = f'https://sdetube.vercel.app/api/problem/{urllib.parse.quote(s)}'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=25) as r:
            data = json.loads(r.read().decode('utf-8'))
            name = data.get('name')
            diff = data.get('difficulty')
            desc = data.get('description', '')
            import re
            imgs = re.findall(r'!\[.*?\]\((.*?)\)', desc)
            print(f'SUCCESS [200]: {s}')
            print(f'  Name: "{name}" ({diff})')
            print(f'  Images in Description ({len(imgs)}): {imgs}')
            print(f'  Sample Snippet:\n  {desc[:150]}...')
            print('-' * 60)
    except Exception as e:
        print(f'ERROR: {s} -> {e}')
