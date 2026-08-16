#!/usr/bin/env python3
"""
One-time batch scraper: Fetch real LeetCode problem data (descriptions, examples,
constraints, test cases, starter code) via GraphQL API and upload to Cloudflare R2.

Usage:
    python backend/scrape_leetcode_to_r2.py [--start N] [--end M] [--delay SECS]
"""

import re
import sys
import json
import time
import html
import argparse
import requests

# Add parent dir so we can import r2_storage
sys.path.insert(0, '.')
from backend.r2_storage import CloudflareR2Storage

LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

GRAPHQL_QUERY = """
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    title
    titleSlug
    difficulty
    content
    exampleTestcases
    codeSnippets {
      lang
      langSlug
      code
    }
    topicTags {
      name
      slug
    }
    hints
    sampleTestCase
  }
}
"""

# All 191 SDE Sheet problem slugs extracted from sdeSheetData.ts leetcode URLs
SDE_SLUGS = [
    "set-matrix-zeroes", "pascals-triangle", "next-permutation", "maximum-subarray",
    "sort-colors", "best-time-to-buy-and-sell-stock", "rotate-image", "merge-intervals",
    "merge-sorted-array", "find-the-duplicate-number", "set-mismatch",
    "global-and-local-inversions", "search-a-2d-matrix", "powx-n", "majority-element",
    "majority-element-ii", "unique-paths", "reverse-pairs", "two-sum", "4sum",
    "longest-consecutive-sequence", "contiguous-array", "subarray-sum-equals-k",
    "longest-substring-without-repeating-characters", "reverse-linked-list",
    "middle-of-the-linked-list", "merge-two-sorted-lists",
    "remove-nth-node-from-end-of-list", "add-two-numbers",
    "delete-node-in-a-linked-list", "intersection-of-two-linked-lists",
    "linked-list-cycle", "reverse-nodes-in-k-group", "palindrome-linked-list",
    "linked-list-cycle-ii", "flatten-a-multilevel-doubly-linked-list", "rotate-list",
    "copy-list-with-random-pointer", "3sum", "trapping-rain-water",
    "remove-duplicates-from-sorted-array", "max-consecutive-ones", "meeting-rooms",
    "meeting-rooms-ii", "maximum-profit-in-job-scheduling", "maximum-units-on-a-truck",
    "coin-change", "assign-cookies", "subsets", "subsets-ii", "combination-sum",
    "combination-sum-ii", "palindrome-partitioning", "permutation-sequence",
    "kth-permutation-sequence", "valid-parentheses", "implement-stack-using-queues",
    "implement-queue-using-stacks", "next-greater-element-i", "sort-a-stack",
    "largest-rectangle-in-histogram", "sliding-window-maximum", "implement-min-stack",
    "rotting-oranges", "online-stock-span", "the-celebrity-problem",
    "lru-cache", "lfu-cache",
    "longest-valid-parentheses", "binary-tree-inorder-traversal",
    "binary-tree-preorder-traversal", "binary-tree-postorder-traversal",
    "binary-tree-level-order-traversal", "maximum-depth-of-binary-tree",
    "balanced-binary-tree", "diameter-of-binary-tree", "same-tree",
    "binary-tree-zigzag-level-order-traversal", "boundary-of-binary-tree",
    "vertical-order-traversal-of-a-binary-tree",
    "binary-tree-right-side-view", "symmetric-tree",
    "construct-binary-tree-from-preorder-and-inorder-traversal",
    "construct-binary-tree-from-inorder-and-postorder-traversal",
    "lowest-common-ancestor-of-a-binary-tree", "maximum-width-of-binary-tree",
    "path-sum", "path-sum-ii", "path-sum-iii",
    "binary-tree-maximum-path-sum",
    "serialize-and-deserialize-binary-tree", "flatten-binary-tree-to-linked-list",
    "binary-tree-level-order-traversal-ii", "populating-next-right-pointers-in-each-node",
    "search-in-a-binary-search-tree", "validate-binary-search-tree",
    "lowest-common-ancestor-of-a-binary-search-tree",
    "kth-smallest-element-in-a-bst",
    "construct-binary-search-tree-from-preorder-traversal",
    "inorder-successor-in-bst",
    "binary-search-tree-iterator",
    "two-sum-iv-input-is-a-bst",
    "recover-binary-search-tree",
    "largest-bst-subtree",
    "kth-largest-element-in-an-array",
    "merge-k-sorted-lists",
    "find-median-from-data-stream",
    "top-k-frequent-elements",
    "number-of-islands",
    "clone-graph",
    "course-schedule",
    "course-schedule-ii",
    "word-ladder",
    "word-ladder-ii",
    "number-of-provinces",
    "flood-fill",
    "surrounded-regions",
    "cheapest-flights-within-k-stops",
    "network-delay-time",
    "accounts-merge",
    "making-a-large-island",
    "critical-connections-in-a-network",
    "is-graph-bipartite",
    "shortest-path-in-binary-matrix",
    "min-cost-to-connect-all-points",
    "maximum-product-subarray",
    "longest-increasing-subsequence",
    "longest-common-subsequence",
    "partition-equal-subset-sum",
    "edit-distance",
    "maximum-ascending-subarray-sum",
    "burst-balloons",
    "minimum-path-sum",
    "integer-break",
    "super-egg-drop",
    "word-break",
    "palindrome-partitioning-ii",
    "implement-trie-prefix-tree",
    "implement-trie-ii-prefix-tree",
    "longest-word-in-dictionary",
    "number-of-distinct-substrings-in-a-string",
    "maximum-xor-of-two-numbers-in-an-array",
    "maximum-xor-with-an-element-from-array",
]


def html_to_markdown(html_content: str) -> str:
    """Convert LeetCode HTML problem description to clean Markdown."""
    if not html_content:
        return ""
    
    text = html_content
    
    # Handle code blocks
    text = re.sub(r'<pre>(.*?)</pre>', lambda m: '\n```\n' + html.unescape(re.sub(r'<[^>]+>', '', m.group(1)).strip()) + '\n```\n', text, flags=re.DOTALL)
    text = re.sub(r'<code>(.*?)</code>', lambda m: '`' + html.unescape(re.sub(r'<[^>]+>', '', m.group(1))) + '`', text, flags=re.DOTALL)
    
    # Handle images
    text = re.sub(r'<img[^>]+src="([^"]*)"[^>]*/?>', r'![example](\1)', text)
    
    # Handle headers
    text = re.sub(r'<h[1-3][^>]*>(.*?)</h[1-3]>', r'\n### \1\n', text, flags=re.DOTALL)
    
    # Handle bold/strong
    text = re.sub(r'<strong>(.*?)</strong>', r'**\1**', text, flags=re.DOTALL)
    text = re.sub(r'<b>(.*?)</b>', r'**\1**', text, flags=re.DOTALL)
    text = re.sub(r'<em>(.*?)</em>', r'*\1*', text, flags=re.DOTALL)
    
    # Handle lists
    text = re.sub(r'<li>(.*?)</li>', r'\n- \1', text, flags=re.DOTALL)
    text = re.sub(r'<ul>|</ul>|<ol>|</ol>', '\n', text)
    
    # Handle paragraphs and line breaks
    text = re.sub(r'<p>', '\n', text)
    text = re.sub(r'</p>', '\n', text)
    text = re.sub(r'<br\s*/?>', '\n', text)
    
    # Handle superscript (constraints like 10^5)
    text = re.sub(r'<sup>(.*?)</sup>', r'^\1', text, flags=re.DOTALL)
    text = re.sub(r'<sub>(.*?)</sub>', r'_\1', text, flags=re.DOTALL)
    
    # Remove remaining HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Decode HTML entities
    text = html.unescape(text)
    
    # Clean up whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()
    
    return text


def parse_examples_from_html(raw_html: str) -> list:
    """Extract structured examples from raw LeetCode HTML (the <pre> blocks)."""
    examples = []
    
    # LeetCode wraps examples in <pre> blocks after <strong class="example">Example N:</strong>
    # Split by example markers
    parts = re.split(r'<strong\s+class="example">\s*Example\s*\d+\s*:?\s*</strong>', raw_html)
    
    for part in parts[1:]:  # Skip text before first example
        # Find the <pre> block
        pre_match = re.search(r'<pre>(.*?)</pre>', part, re.DOTALL)
        if not pre_match:
            continue
        
        pre_content = pre_match.group(1)
        # Strip HTML tags from within pre
        clean = re.sub(r'<[^>]+>', '', pre_content)
        clean = html.unescape(clean).strip()
        
        input_match = re.search(r'Input:\s*(.*?)(?=Output:|$)', clean, re.DOTALL)
        output_match = re.search(r'Output:\s*(.*?)(?=Explanation:|$)', clean, re.DOTALL)
        explanation_match = re.search(r'Explanation:\s*(.*?)$', clean, re.DOTALL)
        
        if input_match and output_match:
            example = {
                "input": input_match.group(1).strip(),
                "output": output_match.group(1).strip()
            }
            if explanation_match:
                expl = explanation_match.group(1).strip()
                if expl:
                    example["explanation"] = expl
            examples.append(example)
    
    return examples


def parse_constraints_from_html(raw_html: str) -> list:
    """Extract constraints list from raw HTML."""
    constraints = []
    
    # Find the Constraints section
    constraint_match = re.search(r'<strong>Constraints:</strong>(.*?)(?=<p><strong\s+class="example"|$)', raw_html, re.DOTALL)
    if not constraint_match:
        constraint_match = re.search(r'Constraints:</p>(.*?)(?=$)', raw_html, re.DOTALL)
    
    if constraint_match:
        block = constraint_match.group(1)
        # Extract list items
        items = re.findall(r'<li>(.*?)</li>', block, re.DOTALL)
        for item in items:
            clean = re.sub(r'<[^>]+>', '', item)
            clean = html.unescape(clean).strip()
            if clean and len(clean) > 1:
                constraints.append(clean)
    
    return constraints or ["1 <= input.length <= 10^5", "-10^9 <= values <= 10^9"]


def fetch_leetcode_problem(slug: str):
    """Fetch a single problem from LeetCode GraphQL API."""
    headers = {
        "Content-Type": "application/json",
        "Referer": f"https://leetcode.com/problems/{slug}/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    payload = {
        "query": GRAPHQL_QUERY,
        "variables": {"titleSlug": slug}
    }
    
    try:
        resp = requests.post(LEETCODE_GRAPHQL_URL, json=payload, headers=headers, timeout=15)
        if resp.status_code != 200:
            print(f"  [HTTP {resp.status_code}] Failed for {slug}")
            return None
        
        data = resp.json()
        question = data.get("data", {}).get("question")
        if not question:
            print(f"  [No Data] No question returned for slug '{slug}'")
            return None
        
        return question
    except Exception as e:
        print(f"  [Error] {slug}: {e}")
        return None


def process_problem(question: dict) -> dict:
    """Transform raw LeetCode GraphQL response into our enriched problem format."""
    slug = question.get("titleSlug", "")
    title = question.get("title", slug)
    difficulty = question.get("difficulty", "Medium")
    raw_html = question.get("content") or ""
    example_testcases = question.get("exampleTestcases") or ""
    sample_test = question.get("sampleTestCase") or ""
    hints = question.get("hints") or []
    topic_tags = [t["name"] for t in (question.get("topicTags") or [])]
    
    # Convert HTML to Markdown for display
    description_md = html_to_markdown(raw_html)
    
    # Parse structured examples directly from raw HTML (more reliable)
    examples = parse_examples_from_html(raw_html)
    
    # Parse constraints directly from raw HTML
    constraints = parse_constraints_from_html(raw_html)
    
    # Parse test cases from exampleTestcases (newline-separated)
    test_cases = []
    if example_testcases:
        raw_lines = [l.strip() for l in example_testcases.strip().split('\n') if l.strip()]
        test_cases = raw_lines
    
    # Extract starter code per language
    starters = {}
    lang_map = {
        "cpp": "cpp", "c++": "cpp",
        "python3": "python", "python": "python",
        "java": "java",
        "javascript": "javascript",
        "golang": "go", "go": "go",
        "rust": "rust"
    }
    
    for snippet in (question.get("codeSnippets") or []):
        lang_slug = snippet.get("langSlug", "").lower()
        mapped = lang_map.get(lang_slug)
        if mapped:
            starters[mapped] = snippet["code"]
            
    if not starters:
        camel = "".join(w.capitalize() for w in title.split()) or "Solution"
        starters = {
            "cpp": f"class Solution {{\npublic:\n    void solve() {{\n        // Solution for {title}\n    }}\n}};",
            "python": f"class Solution:\n    def solve(self) -> None:\n        # Solution for {title}\n        pass",
            "java": f"class Solution {{\n    public void solve() {{\n        // Solution for {title}\n    }}\n}};",
            "javascript": f"var solve = function() {{\n    // Solution for {title}\n}};",
            "go": f"func solve() {{\n}}",
            "rust": f"impl Solution {{\n    pub fn solve() {{\n    }}\n}}"
        }
    
    # Build clean description (extract just problem statement before examples)
    clean_desc = description_md or f"Implement the optimal algorithm for {title}."
    for pattern in [r'Example\s*1\s*:', r'```\nInput:', r'\n\nInput:']:
        parts = re.split(pattern, clean_desc, maxsplit=1)
        if len(parts) > 1 and len(parts[0].strip()) > 30:
            clean_desc = parts[0].strip()
            break
    
    return {
        "slug": slug,
        "title": title,
        "difficulty": difficulty,
        "description": clean_desc,
        "description_full": description_md,
        "examples": examples,
        "constraints": constraints,
        "testCases": test_cases,
        "sampleTestCase": sample_test,
        "starters": starters,
        "hints": hints,
        "topicTags": topic_tags,
        "source": "leetcode",
        "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


def get_sde_sheet_slugs() -> list:
    """Extract all LeetCode slugs from sdeSheetData.ts directly."""
    try:
        with open("src/lib/sdeSheetData.ts", "r", encoding="utf-8") as f:
            content = f.read()
        matches = re.findall(r'leetcode:\s*["\']https?://leetcode\.com/problems/([^/"\']+)', content)
        unique = []
        for m in matches:
            clean = m.strip().lower()
            if clean and clean not in unique:
                unique.append(clean)
        if unique:
            print(f"[LeetCode Scraper] Extracted {len(unique)} unique slugs from sdeSheetData.ts", flush=True)
            return unique
    except Exception as e:
        print(f"[LeetCode Scraper Warning] Could not read sdeSheetData.ts: {e}", flush=True)
    
    # Fallback to hardcoded list
    return list(dict.fromkeys(SDE_SLUGS))


def main():
    parser = argparse.ArgumentParser(description="Scrape LeetCode problems to Cloudflare R2")
    parser.add_argument("--start", type=int, default=0, help="Start index (0-based)")
    parser.add_argument("--end", type=int, default=None, help="End index (exclusive)")
    parser.add_argument("--delay", type=float, default=0.8, help="Seconds between requests")
    parser.add_argument("--dry-run", action="store_true", help="Fetch but don't upload")
    parser.add_argument("--force", action="store_true", help="Re-fetch even if already in R2")
    args = parser.parse_args()
    
    all_slugs = get_sde_sheet_slugs()
    slugs = all_slugs[args.start:args.end]
    total = len(slugs)
    
    print(f"\n{'='*60}", flush=True)
    print(f"  LeetCode -> Cloudflare R2 Problem Scraper", flush=True)
    print(f"  Problems: {total} (index {args.start} to {args.start + total})", flush=True)
    print(f"  Delay: {args.delay}s between requests", flush=True)
    print(f"  Dry Run: {args.dry_run} | Force Re-upload: {args.force}", flush=True)
    print(f"{'='*60}\n", flush=True)
    
    r2 = CloudflareR2Storage()
    success = 0
    skipped = 0
    failed = []
    
    for i, slug in enumerate(slugs):
        idx = args.start + i + 1
        
        # Check if already present in Cloudflare R2 (unless --force)
        if not args.force and not args.dry_run:
            existing = r2.fetch_problem(slug)
            if existing and existing.get("description") and existing.get("starters"):
                print(f"[{idx}/{args.start + total}] {slug}: ALREADY IN R2 (skipped)", flush=True)
                skipped += 1
                success += 1
                continue
        
        print(f"[{idx}/{args.start + total}] Fetching from LeetCode: {slug}...", end=" ", flush=True)
        
        question = fetch_leetcode_problem(slug)
        if not question:
            failed.append(slug)
            print("FAILED (No data from LeetCode)", flush=True)
            time.sleep(args.delay)
            continue
        
        enriched = process_problem(question)
        
        if args.dry_run:
            print(f"OK (dry-run) -- {enriched['title']} [{enriched['difficulty']}] "
                  f"({len(enriched['examples'])} examples, {len(enriched['testCases'])} tests, "
                  f"{len(enriched['starters'])} langs)", flush=True)
        else:
            key = r2.upload_problem(slug, enriched)
            if key:
                print(f"OK -> {key} ({len(enriched['examples'])} examples, "
                      f"{len(enriched['testCases'])} tests)", flush=True)
                success += 1
            else:
                print("UPLOAD FAILED", flush=True)
                failed.append(slug)
        
        if i < total - 1:
            time.sleep(args.delay)
    
    print(f"\n{'='*60}", flush=True)
    print(f"  Results: {success} ready ({skipped} cached, {success - skipped} uploaded), {len(failed)} failed", flush=True)
    if failed:
        print(f"  Failed slugs: {', '.join(failed)}", flush=True)
    print(f"{'='*60}\n", flush=True)


if __name__ == "__main__":
    main()
