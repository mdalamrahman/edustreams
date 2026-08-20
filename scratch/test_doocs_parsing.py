import urllib.request
import json

# Test fetching code snippets from public leetcode APIs
# Method 1: Doocs repository for solutions & code
# Method 2: LeetCode GraphQL via public CORS proxies or direct
# Method 3: Mistral generation

slug = 'two-sum'
doocs_url = f"https://raw.githubusercontent.com/doocs/leetcode/main/solution/0000-0099/0001.Two%20Sum/README_EN.md"
req = urllib.request.Request(doocs_url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        text = r.read().decode('utf-8')
        # Extract C++, Java, Python, Go, TypeScript code blocks
        print("Doocs fetched successfully, length:", len(text))
except Exception as e:
    print("Doocs error:", e)
