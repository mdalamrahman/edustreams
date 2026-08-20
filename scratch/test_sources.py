import urllib.request
import json

# Test various LeetCode problem sources on GitHub & public APIs
urls = [
    ('Doocs LeetCode (0000-0099/0001.Two Sum)', 'https://raw.githubusercontent.com/doocs/leetcode/main/solution/0000-0099/0001.Two%20Sum/README_EN.md'),
    ('LeetCode GraphQL Direct', 'https://leetcode.com/graphql/'),
    ('Alfa LeetCode API select', 'https://alfa-leetcode-api.onrender.com/select?titleSlug=two-sum'),
    ('LeetCode API Problems List', 'https://alfa-leetcode-api.onrender.com/problems?limit=5')
]

for name, u in urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=8) as resp:
            print(f"{name} status: {resp.getcode()}")
            content = resp.read()
            print(f"Content length: {len(content)}")
    except Exception as e:
        print(f"{name} error: {e}")
