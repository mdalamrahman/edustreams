import urllib.request
import urllib.parse
import json

slug = 'lowest-common-ancestor-of-a-binary-search-tree'
url = f'https://sdetube.vercel.app/api/problem/{urllib.parse.quote(slug)}'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=20) as r:
    data = json.loads(r.read().decode('utf-8'))
    print('NAME:', data.get('name'))
    print('DESCRIPTION:')
    print(data.get('description'))
    print('\nEXAMPLES COUNT:', len(data.get('examples', [])))
    for idx, ex in enumerate(data.get('examples', [])):
        print(f'Example {idx+1}:')
        print(f'  image: {ex.get("image")}')
        print(f'  input: {ex.get("input")}')
        print(f'  output: {ex.get("output")}')
        print(f'  explanation: {ex.get("explanation")}')
