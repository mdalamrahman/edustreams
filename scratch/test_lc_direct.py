import requests, json

query = """
query userProfileMultiYear($username: String!) {
  matchedUser(username: $username) {
    submissionCalendar
    c2026: userCalendar(year: 2026) {
      totalActiveDays
      submissionCalendar
    }
    c2025: userCalendar(year: 2025) {
      totalActiveDays
      submissionCalendar
    }
    c2024: userCalendar(year: 2024) {
      totalActiveDays
      submissionCalendar
    }
  }
}
"""

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://leetcode.com',
    'Content-Type': 'application/json'
}

r = requests.post('https://leetcode.com/graphql', json={'query': query, 'variables': {'username': 'mdalamrahman4'}}, headers=headers, timeout=10)
mu = r.json().get('data', {}).get('matchedUser', {})
for yr, key in [(2026, 'c2026'), (2025, 'c2025'), (2024, 'c2024')]:
    c = mu.get(key, {})
    cal = json.loads(c.get('submissionCalendar', '{}'))
    print(f"{yr}: activeDays={c.get('totalActiveDays')}, totalSubmissions={sum(cal.values())}, countEntries={len(cal)}")



