import urllib.request
import urllib.parse
import json

slugs = ['set-matrix-zeroes', 'pascals-triangle', 'two-sum', 'trapping-rain-water', 'count-primes-in-range-l-to-r']

for s in slugs:
    url = f'https://sdetube.vercel.app/api/problem/{urllib.parse.quote(s)}'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=35) as r:
            data = json.loads(r.read().decode('utf-8'))
            name = data.get('name')
            diff = data.get('difficulty')
            tcs = data.get('testCases', [])
            hints = data.get('hints', [])
            starters = list(data.get('starters', {}).keys())
            desc = data.get('description', '')[:80]
            print(f'SUCCESS [200]: {s}')
            print(f'  Name: "{name}" ({diff})')
            print(f'  Description: "{desc}..."')
            print(f'  TestCases: {tcs[:2]}')
            print(f'  Hints ({len(hints)}): {hints[:1]}')
            print(f'  Languages: {starters}')
            print('-' * 60)
    except Exception as e:
        print(f'ERROR: {s} -> {e}')
