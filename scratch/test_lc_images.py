import requests
import json
import re

query = """
query getQuestionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    title
    content
  }
}
"""
for slug in ['symmetric-tree', 'same-tree', 'clone-graph', 'binary-tree-level-order-traversal', 'invert-binary-tree']:
    resp = requests.post(
        'https://leetcode.com/graphql',
        json={'query': query, 'variables': {'titleSlug': slug}},
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
    )
    content = resp.json().get('data', {}).get('question', {}).get('content', '')
    imgs = re.findall(r'<img[^>]+src=[\'"]([^\'"]+)[\'"]', content, re.IGNORECASE)
    print(slug, '-> IMAGES FOUND:', imgs)
