import urllib.request
import json

url = 'https://leetcode.com/graphql'
query = """
query getQuestionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    title
    content
    difficulty
    hints
    exampleTestcases
    topicTags {
      name
    }
    codeSnippets {
      lang
      langSlug
      code
    }
  }
}
"""

data = json.dumps({
    'query': query,
    'variables': {'titleSlug': 'set-matrix-zeroes'}
}).encode('utf-8')

req = urllib.request.Request(
    url,
    data=data,
    headers={
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com/problems/set-matrix-zeroes/'
    }
)

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        q = res.get('data', {}).get('question', {})
        print('LeetCode GraphQL Status: SUCCESS!')
        print('Title:', q.get('title'))
        print('Difficulty:', q.get('difficulty'))
        print('Content preview:', q.get('content')[:150] if q.get('content') else None)
        print('Example Testcases:', q.get('exampleTestcases'))
        print('Hints:', q.get('hints'))
        snippets = q.get('codeSnippets') or []
        print(f'Code Snippets ({len(snippets)} languages):')
        for s in snippets:
            print(f"  - {s.get('langSlug')}: {s.get('code')[:40]}...")
except Exception as e:
    print('Error:', e)
