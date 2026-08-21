import os
import sys
import re
import json
import time
import requests

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
from r2_storage import r2_storage
from main import fetch_leetcode_graphql

def extract_slugs_from_sheets():
    filepath = os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'dsaSheetsData.ts')
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    slugs = set()
    for s in re.findall(r'"slug":\s*"([^"]+)"', content):
        if s and s.strip():
            slugs.add(s.strip().lower())

    for u in re.findall(r'"leetcode":\s*"(https://leetcode\.com/problems/[^"]+)"', content):
        clean = re.sub(r'^https?://leetcode\.com/problems/', '', u)
        clean = re.sub(r'/.*$', '', clean).strip().lower()
        if clean:
            slugs.add(clean)

    return sorted(list(slugs))

def seed_problems(limit=50):
    slugs = extract_slugs_from_sheets()
    print(f"[R2 Seeder] Found {len(slugs)} unique problem slugs to check & sync to Cloudflare R2.")

    success_count = 0
    already_cached = 0
    failed_count = 0

    for i, slug in enumerate(slugs[:limit]):
        clean_slug = re.sub(r'[^a-zA-Z0-9_\-]', '-', slug).strip('-')
        print(f"[{i+1}/{min(len(slugs), limit)}] Checking '{clean_slug}' in Cloudflare R2...")

        # 1. Check if already in R2
        existing = r2_storage.fetch_problem(clean_slug)
        if existing and existing.get("name") and existing.get("description") and existing.get("testCases"):
            print(f"  [ALREADY STORED] Cloudflare R2: '{existing.get('name')}'")
            already_cached += 1
            continue

        # 2. Fetch from LeetCode GraphQL
        print(f"  -> Fetching from LeetCode GraphQL API...")
        data = fetch_leetcode_graphql(clean_slug)
        if data and data.get("name") and data.get("description"):
            key = r2_storage.upload_problem(clean_slug, data)
            if key:
                print(f"  [SAVED R2] Stored permanently in Cloudflare R2: {key}")
                success_count += 1
            else:
                print(f"  [ERROR] Failed to upload to R2 for '{clean_slug}'")
                failed_count += 1
        else:
            print(f"  -> Generating authentic spec via Mistral AI...")
            try:
                prompt = f"""You are a Lead Algorithms and Data Structures Engineer.
Generate complete, authentic coding problem details in JSON for: "{slug}".
Return valid JSON with:
- name: string (e.g. Clean Problem Title)
- category: string
- difficulty: "Easy" | "Medium" | "Hard"
- description: detailed problem explanation
- examples: array of objects with input, output, explanation
- constraints: array of strings
- testCases: array of 3+ test case inputs
- expectedOutputs: array of strings matching testCases
- hints: array of 2+ hints
- approaches: array of objects with id, name, timeComplexity, spaceComplexity, description
- starters: object with cpp, python, java, javascript, go, rust
- solutions: object with cpp, python, java, javascript, go, rust"""
                import requests
                from main import MISTRAL_API_KEY
                resp = requests.post(
                    "https://api.mistral.ai/v1/chat/completions",
                    headers={"Content-Type": "application/json", "Authorization": f"Bearer {MISTRAL_API_KEY}"},
                    json={"model": "mistral-small-latest", "messages": [{"role": "user", "content": prompt}], "response_format": {"type": "json_object"}},
                    timeout=25
                )
                if resp.status_code == 200:
                    ai_data = json.loads(resp.json()["choices"][0]["message"]["content"])
                    if ai_data and ai_data.get("name") and ai_data.get("description"):
                        key = r2_storage.upload_problem(clean_slug, ai_data)
                        print(f"  [SAVED R2 via AI] Stored permanently in Cloudflare R2: {key}")
                        success_count += 1
                    else:
                        print(f"  [ERROR] Mistral JSON invalid for '{clean_slug}'")
                        failed_count += 1
                else:
                    print(f"  [ERROR] Mistral status {resp.status_code} for '{clean_slug}'")
                    failed_count += 1
            except Exception as e:
                print(f"  [ERROR] Mistral exception for '{clean_slug}': {e}")
                failed_count += 1

        time.sleep(0.3)

    print("\n" + "="*50)
    print(f"[R2 Seeding Complete] Stored: {success_count}, Already in R2: {already_cached}, Failed/Custom: {failed_count}")
    print("="*50)

if __name__ == "__main__":
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 30
    seed_problems(limit=limit)
