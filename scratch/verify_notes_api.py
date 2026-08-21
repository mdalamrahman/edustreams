import urllib.request
import json

for doc in ['lld', 'hld']:
    url = f'https://sdetube.vercel.app/api/notes/{doc}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read().decode('utf-8'))
        print(f"[OK] Notes doc: {doc} -> source: {data.get('source')} | bytes: {len(data.get('content', ''))}")
