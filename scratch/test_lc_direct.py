import requests, json

query = """
query userProfile($username: String!) {
  recentSubmissionList(username: $username, limit: 15) {
    title
    titleSlug
    statusDisplay
    lang
    timestamp
  }
  recentAcSubmissionList(username: $username, limit: 15) {
    id
    title
    titleSlug
    timestamp
  }
}
"""

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://leetcode.com',
    'Content-Type': 'application/json'
}

try:
    r = requests.post('https://leetcode.com/graphql', json={'query': query, 'variables': {'username': 'mdalamrahman4'}}, headers=headers, timeout=10)
    print('Leetcode direct status:', r.status_code)
    print('Response:', r.text[:600])
except Exception as e:
    print('Error:', e)
