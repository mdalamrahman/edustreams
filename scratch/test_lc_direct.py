import requests, json

query = """
query userProfile($username: String!) {
  matchedUser(username: $username) {
    submissionCalendar
  }
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
    data = r.json()['data']
    cal = json.loads(data['matchedUser']['submissionCalendar'])
    import datetime
    years = {}
    for ts, cnt in cal.items():
        dt = datetime.datetime.utcfromtimestamp(int(ts))
        yr = dt.year
        years[yr] = years.get(yr, 0) + cnt
    print('Submissions by year:', sorted(years.items()))
    print('Recent submissions:', len(data.get('recentSubmissionList') or []))
except Exception as e:
    print('Error:', e)
