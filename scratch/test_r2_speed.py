import urllib.request
import urllib.parse
import json
import time

slugs = ['3sum', 'add-two-numbers', 'clone-graph', 'coin-change']
for s in slugs:
    t0 = time.time()
    url = f'https://sdetube.vercel.app/api/problem/{urllib.parse.quote(s)}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read().decode('utf-8'))
        dt = (time.time() - t0) * 1000
        print(f"[OK] {s:20} -> {data.get('name'):35} ({dt:.1f}ms) | {len(data.get('examples', []))} examples")
