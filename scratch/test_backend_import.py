import sys
sys.path.append('backend')
from main import fetch_leetcode_graphql, parse_leetcode_html

res = fetch_leetcode_graphql("lowest-common-ancestor-of-a-binary-search-tree")
print("RESULT IS NONE?", res is None)
if res:
    print("NAME:", res.get("name"))
    print("DESCRIPTION:", res.get("description")[:200])
    print("EXAMPLES COUNT:", len(res.get("examples", [])))
    for idx, ex in enumerate(res.get("examples", [])):
        print(f"Ex {idx+1}: image={ex.get('image')}, input={ex.get('input')}, output={ex.get('output')}")
