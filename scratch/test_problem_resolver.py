import re
import json
import requests

MISTRAL_API_KEY = "ME2AJmpgz5j0QgKMkyDGkjDL0PMkb2E5"

def parse_leetcode_html(html_str):
    if not html_str:
        return {"description": "", "examples": [], "constraints": []}

    examples = []
    ex_blocks = re.findall(r'<pre>([\s\S]*?)</pre>', html_str, re.IGNORECASE)
    for eb in ex_blocks:
        text = re.sub(r'<[^>]+>', '', eb).strip()
        in_m = re.search(r'Input:\s*([\s\S]*?)(?=\nOutput:|$)', text, re.IGNORECASE)
        out_m = re.search(r'Output:\s*([\s\S]*?)(?=\nExplanation:|$)', text, re.IGNORECASE)
        exp_m = re.search(r'Explanation:\s*([\s\S]*?)$', text, re.IGNORECASE)
        inp = in_m.group(1).strip() if in_m else text
        outp = out_m.group(1).strip() if out_m else ""
        exp = exp_m.group(1).strip() if exp_m else None
        if inp and outp:
            examples.append({"input": inp, "output": outp, "explanation": exp})

    constraints = []
    con_m = re.search(r'<p><strong[^>]*>Constraints:</strong></p>\s*<ul>([\s\S]*?)</ul>', html_str, re.IGNORECASE)
    if con_m:
        lis = re.findall(r'<li>([\s\S]*?)</li>', con_m.group(1), re.IGNORECASE)
        for li in lis:
            c = re.sub(r'<[^>]+>', '', li)
            c = c.replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>').replace('&le;', '<=').replace('&ge;', '>=').replace('&quot;', '"').strip()
            if c:
                constraints.append(c)

    # Clean description
    desc = re.sub(r'<pre>[\s\S]*?</pre>', '', html_str, flags=re.IGNORECASE)
    desc = re.sub(r'<p><strong[^>]*>Constraints:</strong></p>\s*<ul>[\s\S]*?</ul>', '', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<p><strong[^>]*>Example \d+:[\s\S]*?</strong></p>', '', desc, flags=re.IGNORECASE)
    desc = re.sub(r'</p>', '\n\n', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<br\s*/?>', '\n', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<code>([\s\S]*?)</code>', r'`\1`', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<strong>([\s\S]*?)</strong>', r'**\1**', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<em>([\s\S]*?)</em>', r'*\1*', desc, flags=re.IGNORECASE)
    desc = re.sub(r'<[^>]+>', '', desc)
    desc = desc.replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>').replace('&le;', '<=').replace('&ge;', '>=').replace('&quot;', '"')
    desc = re.sub(r'\n{3,}', '\n\n', desc).strip()

    return {"description": desc, "examples": examples, "constraints": constraints}

def fetch_leetcode_graphql(slug):
    query = """
    query getQuestionDetail($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        content
        difficulty
        hints
        exampleTestcases
        topicTags {
          name
        }
        codeSnippets {
          lang
          langSlug
          code
        }
      }
    }
    """
    try:
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
        if resp.status_code == 200:
            q = resp.json().get("data", {}).get("question")
            if q and q.get("title"):
                parsed = parse_leetcode_html(q.get("content", ""))
                
                # Parse testcases
                raw_tc = q.get("exampleTestcases") or ""
                test_cases = [line.strip() for line in raw_tc.split("\n") if line.strip()]
                if not test_cases and parsed["examples"]:
                    test_cases = [e["input"] for e in parsed["examples"]]
                
                # Parse starters
                starters = {}
                snippets = q.get("codeSnippets") or []
                for s in snippets:
                    l = s.get("langSlug")
                    c = s.get("code")
                    if l == "cpp": starters["cpp"] = c
                    elif l in ["python3", "python"]: starters["python"] = c
                    elif l == "java": starters["java"] = c
                    elif l == "javascript": starters["javascript"] = c
                    elif l == "golang": starters["go"] = c
                    elif l == "rust": starters["rust"] = c

                hints = q.get("hints") or []
                clean_hints = [re.sub(r'<[^>]+>', '', h).strip() for h in hints if h]

                return {
                    "name": q.get("title"),
                    "category": (q.get("topicTags") or [{}])[0].get("name", "Algorithms"),
                    "difficulty": q.get("difficulty", "Medium"),
                    "description": parsed["description"],
                    "examples": parsed["examples"],
                    "constraints": parsed["constraints"],
                    "testCases": test_cases,
                    "expectedOutputs": [e["output"] for e in parsed["examples"]],
                    "hints": clean_hints,
                    "starters": starters,
                    "solutions": {}
                }
    except Exception as e:
        print("GraphQL Error:", e)
    return None

def fetch_or_generate_problem(slug_or_title):
    clean_slug = re.sub(r'^https?://leetcode\.com/problems/', '', slug_or_title, flags=re.IGNORECASE)
    clean_slug = re.sub(r'/.*$', '', clean_slug)
    clean_slug = re.sub(r'[^a-z0-9]+', '-', clean_slug.lower()).strip('-')

    print(f"Resolving problem for '{slug_or_title}' (slug: '{clean_slug}')...")
    lc_data = fetch_leetcode_graphql(clean_slug)
    if lc_data:
        print(f"Found on LeetCode: '{lc_data['name']}' ({lc_data['difficulty']})")
        print(f"Description ({len(lc_data['description'])} chars): {lc_data['description'][:100]}...")
        print(f"Test cases: {lc_data['testCases']}")
        print(f"Hints: {len(lc_data['hints'])} hints")
        print(f"Starters: {list(lc_data['starters'].keys())}")
        return lc_data

    # Fallback to Mistral AI for non-leetcode
    print(f"Calling Mistral AI generator for '{slug_or_title}'...")
    prompt = f"""You are a Lead Algorithms Engineer.
Generate authentic problem details in JSON for: "{slug_or_title}".
Return valid JSON with: name, category, difficulty, description, examples (array of {{input, output, explanation}}), constraints (array of strings), testCases (array of 3+ strings), expectedOutputs (array of strings), hints (array of 2+ strings), starters (cpp, python, java, javascript, go, rust)."""
    resp = requests.post(
        "https://api.mistral.ai/v1/chat/completions",
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {MISTRAL_API_KEY}"},
        json={"model": "mistral-small-latest", "messages": [{"role": "user", "content": prompt}], "response_format": {"type": "json_object"}},
        timeout=12
    )
    if resp.status_code == 200:
        data = resp.json()
        parsed = json.loads(data["choices"][0]["message"]["content"])
        print("Mistral generated:", parsed.get("name"))
        return parsed
    return None

if __name__ == "__main__":
    fetch_or_generate_problem("set-matrix-zeroes")
    print("-" * 50)
    fetch_or_generate_problem("Count Primes in Range L to R")
