import requests
import json
import re

query = """
query getQuestionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    questionFrontendId
    title
    titleSlug
    content
    difficulty
    topicTags {
      name
      slug
    }
    codeSnippets {
      lang
      langSlug
      code
    }
    exampleTestcases
    hints
  }
}
"""

slug = "lowest-common-ancestor-of-a-binary-search-tree"
resp = requests.post(
    "https://leetcode.com/graphql",
    json={"query": query, "variables": {"titleSlug": slug}},
    headers={
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": f"https://leetcode.com/problems/{slug}/"
    },
    timeout=10
)
print("STATUS CODE:", resp.status_code)
print("RESPONSE TEXT:", resp.text[:500])
