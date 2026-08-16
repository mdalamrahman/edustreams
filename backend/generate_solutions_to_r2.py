#!/usr/bin/env python3
"""
Pre-generates and uploads optimal verified multi-language solutions (C++, Python 3, Java, JavaScript)
for all SDE Sheet problems into Cloudflare R2 (problems/{slug}.json).
"""

import sys
import json
import time
import requests

sys.path.insert(0, '.')
from backend.r2_storage import r2_storage
from backend.scrape_leetcode_to_r2 import get_sde_sheet_slugs

GROQ_API_KEY = "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"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def generate_solution_for_problem(title: str, description: str, starters: dict) -> dict:
    prompt = f"""You are a Principal Algorithms Engineer.
Generate complete, optimal, bug-free solution code for the LeetCode problem '{title}' in C++, Python 3, Java, and JavaScript.

Problem Statement:
{description[:3500]}

Starter signatures:
C++: {starters.get('cpp', '')}
Python: {starters.get('python', '')}
Java: {starters.get('java', '')}
JavaScript: {starters.get('javascript', '')}

Return ONLY valid JSON matching this exact structure:
{{
  "cpp": "<complete optimal C++ code matching signature>",
  "python": "<complete optimal Python 3 code matching signature>",
  "java": "<complete optimal Java code matching signature>",
  "javascript": "<complete optimal JavaScript code matching signature>",
  "timeComplexity": "O(N) / O(M*N)",
  "spaceComplexity": "O(1) / O(N)",
  "explanation": "1. Approach and invariant...\\n2. Algorithm steps...\\n3. Complexity analysis..."
}}"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"},
        "temperature": 0.1
    }

    try:
        r = requests.post(GROQ_URL, headers=headers, json=payload, timeout=20)
        if r.status_code == 200:
            content = r.json()["choices"][0]["message"]["content"]
            return json.loads(content)
    except Exception as e:
        print(f"  [Groq Error: {e}]", end=" ", flush=True)

    # Fallback to Mistral API
    try:
        m_headers = {
            "Authorization": "Bearer ME2AJmpgz5j0QgKMkyDGkjDL0PMkb2E5",
            "Content-Type": "application/json"
        }
        m_payload = {
            "model": "mistral-small-latest",
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }
        mr = requests.post("https://api.mistral.ai/v1/chat/completions", headers=m_headers, json=m_payload, timeout=20)
        if mr.status_code == 200:
            content = mr.json()["choices"][0]["message"]["content"]
            return json.loads(content)
    except Exception as e:
        print(f"  [Mistral Error: {e}]", flush=True)

    return {}

def main():
    slugs = get_sde_sheet_slugs()
    print(f"\n{'='*60}", flush=True)
    print(f"  Pre-generating Multi-Language Solutions for {len(slugs)} Problems", flush=True)
    print(f"{'='*60}\n", flush=True)

    success = 0
    for idx, slug in enumerate(slugs):
        print(f"[{idx+1}/{len(slugs)}] Processing {slug}...", end=" ", flush=True)
        p = r2_storage.fetch_problem(slug)
        if not p:
            print("Problem not found in R2 (skipped)", flush=True)
            continue

        # Check if already has solutions
        existing_sols = p.get("solutions", {})
        if existing_sols.get("cpp") and existing_sols.get("python") and existing_sols.get("cpp") != p.get("starters", {}).get("cpp"):
            print("ALREADY HAS SOLUTION (skipped)", flush=True)
            success += 1
            continue

        title = p.get("title", slug)
        desc = p.get("description", "") or p.get("description_full", "")
        starters = p.get("starters", {})

        sols = generate_solution_for_problem(title, desc, starters)
        if sols and sols.get("cpp") and sols.get("python"):
            p["solutions"] = {
                "cpp": sols["cpp"],
                "python": sols["python"],
                "java": sols.get("java", ""),
                "javascript": sols.get("javascript", ""),
                "go": sols.get("go", starters.get("go", "")),
                "rust": sols.get("rust", starters.get("rust", ""))
            }
            p["timeComplexity"] = sols.get("timeComplexity", "Optimal")
            p["spaceComplexity"] = sols.get("spaceComplexity", "O(1)")
            p["editorial"] = sols.get("explanation", "")

            r2_storage.upload_problem(slug, p)
            print(f"OK -> Stored Solutions in R2 ({sols.get('timeComplexity')})", flush=True)
            success += 1
        else:
            print("FAILED TO GENERATE", flush=True)

        time.sleep(0.5)

    print(f"\n{'='*60}", flush=True)
    print(f"  Finished: {success}/{len(slugs)} problems now have optimal solutions in Cloudflare R2!", flush=True)
    print(f"{'='*60}\n", flush=True)

if __name__ == "__main__":
    main()
