import urllib.request
import json

url = 'https://alfa-leetcode-api.onrender.com/select?titleSlug=two-sum'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=10) as r:
    data = json.loads(r.read().decode('utf-8'))
    print("Keys in alfa-leetcode-api:", list(data.keys()))
    print("Title:", data.get('questionTitle'))
    print("Difficulty:", data.get('difficulty'))
    print("Hints:", data.get('hints'))
    print("ExampleTestcases:", data.get('exampleTestcases'))
    print("SampleTestCase:", data.get('sampleTestCase'))
    print("CodeSnippets count:", len(data.get('codeSnippets', [])))
    for s in data.get('codeSnippets', [])[:5]:
        print(f"Snippet [{s.get('lang')}]: {s.get('code')[:60]}...")

# Also test official editorial / solutions from alfa-leetcode-api
editorial_url = 'https://alfa-leetcode-api.onrender.com/officialSolution?titleSlug=two-sum'
try:
    req_e = urllib.request.Request(editorial_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_e, timeout=10) as re:
        edata = json.loads(re.read().decode('utf-8'))
        print("\nEditorial keys:", list(edata.keys()))
        print("Editorial content preview:", str(edata.get('content') or edata.get('solution'))[:200])
except Exception as e:
    print("Official solution error:", e)
