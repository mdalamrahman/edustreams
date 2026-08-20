import urllib.request
import json
import re

problems = ['two-sum', 'trapping-rain-water', 'course-schedule', 'lru-cache', 'coin-change', 'edit-distance']

def fetch_alfa_leetcode(slug):
    url = f"https://alfa-leetcode-api.onrender.com/select?titleSlug={slug}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read().decode('utf-8'))

for p in problems:
    try:
        data = fetch_alfa_leetcode(p)
        print(f"\n--- Problem: {p} ---")
        print("Title:", data.get('questionTitle'))
        print("Difficulty:", data.get('difficulty'))
        print("Hints count:", len(data.get('hints') or []))
        print("Raw testcases:", repr(data.get('exampleTestcases'))[:100])
        print("Topic tags:", [t.get('name') for t in data.get('topicTags', [])])
    except Exception as e:
        print(f"Error for {p}: {e}")
