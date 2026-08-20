import requests
import json

query = """
query getQuestionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    title
    content
  }
}
"""
resp = requests.post(
    'https://leetcode.com/graphql',
    json={'query': query, 'variables': {'titleSlug': 'lowest-common-ancestor-of-a-binary-search-tree'}},
    headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
)
content = resp.json().get('data', {}).get('question', {}).get('content', '')
print("RAW HTML:")
print(content)
