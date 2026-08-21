import re

with open('src/lib/dsaSheetsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract all slug and leetcode urls
slugs = set(re.findall(r'"slug":\s*"([^"]+)"', text))
lc_urls = set(re.findall(r'"leetcode":\s*"(https://leetcode\.com/problems/[^"]+)"', text))

print(f"Total unique slugs in dsaSheetsData.ts: {len(slugs)}")
print(f"Total unique leetcode URLs in dsaSheetsData.ts: {len(lc_urls)}")
