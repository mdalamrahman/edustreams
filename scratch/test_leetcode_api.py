import urllib.request
import json

query = """
query getQuestionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    title
    titleSlug
    content
    difficulty
    hints
    exampleTestcaseList
    sampleTestCase
    codeSnippets {
      lang
      langSlug
      code
    }
    topicTags {
      name
      slug
    }
  }
}
"""

req_data = json.dumps({'query': query, 'variables': {'titleSlug': 'two-sum'}}).encode('utf-8')
headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

req = urllib.request.Request('https://leetcode.com/graphql/', data=req_data, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        q = res.get('data', {}).get('question', {})
        print('Title:', q.get('title'))
        print('Difficulty:', q.get('difficulty'))
        print('Hints count:', len(q.get('hints', [])))
        print('ExampleTestcaseList:', q.get('exampleTestcaseList'))
        print('CodeSnippets count:', len(q.get('codeSnippets', [])))
        print('Content preview:', q.get('content')[:150])
except Exception as e:
    print('LeetCode GraphQL direct error:', e)

# Also test public LeetCode proxies / APIs (e.g. alfa-leetcode-api, leetcode-api)
proxies = [
    'https://alfa-leetcode-api.onrender.com/select?titleSlug=two-sum',
    'https://leetcode-api-faisalshohag.vercel.app/two-sum',
    'https://raw.githubusercontent.com/mdalamrahman/edustreams/main/package.json'
]
for p in proxies:
    try:
        req_p = urllib.request.Request(p, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_p, timeout=8) as r:
            print(f"Proxy {p} status: {r.getcode()}")
    except Exception as ex:
        print(f"Proxy {p} error: {ex}")
