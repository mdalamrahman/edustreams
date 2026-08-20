import urllib.request
import json

api_key = 'ME2AJmpgz5j0QgKMkyDGkjDL0PMkb2E5'
prompt = """
Generate a complete, high-quality coding problem in valid JSON for: 'Count Primes in Range L to R' (Category: Math, Difficulty: Medium).
Output MUST be a JSON object with:
{
  "name": "Count Primes in Range L to R",
  "description": "Given two positive integers L and R, find the total number of prime numbers in the closed interval [L, R].",
  "examples": [{"input": "L = 3, R = 10", "output": "4", "explanation": "Primes between 3 and 10 are 3, 5, 7."}],
  "constraints": ["1 <= L <= R <= 10^6"],
  "testCases": ["L = 3, R = 10", "L = 10, R = 20", "L = 1, R = 5"],
  "expectedOutputs": ["4", "4", "3"],
  "hints": ["Consider using the Sieve of Eratosthenes to precompute primes.", "Prefix sums on primes array can answer range queries in O(1)."],
  "approaches": [
    {
      "id": "sieve-prefix",
      "name": "Sieve of Eratosthenes + Prefix Sums (Optimal O(R log log R + Q))",
      "timeComplexity": "O(R log(log R))",
      "spaceComplexity": "O(R)",
      "description": "Precompute primes up to R using Sieve, then build a prefix count array where prefix[i] is the number of primes <= i. The answer for [L, R] is prefix[R] - prefix[L - 1]."
    }
  ],
  "starters": {
    "cpp": "class Solution {\\npublic:\\n    int countPrimes(int L, int R) {\\n        \\n    }\\n};",
    "python": "class Solution:\\n    def countPrimes(self, L: int, R: int) -> int:\\n        pass",
    "java": "class Solution {\\n    public int countPrimes(int L, int R) {\\n        return 0;\\n    }\\n}",
    "javascript": "var countPrimes = function(L, R) {\\n    \\n};",
    "go": "func countPrimes(L int, R int) int {\\n    return 0\\n}",
    "rust": "impl Solution {\\n    pub fn count_primes(l: i32, r: i32) -> i32 {\\n        0\\n    }\\n}"
  },
  "solutions": {
    "cpp": "class Solution {\\npublic:\\n    int countPrimes(int L, int R) {\\n        // implementation\\n    }\\n};"
  }
}
Return ONLY valid JSON.
"""

req_data = json.dumps({
    "model": "mistral-small-latest",
    "messages": [{"role": "user", "content": prompt}],
    "response_format": {"type": "json_object"},
    "temperature": 0.2
}).encode('utf-8')

req = urllib.request.Request('https://api.mistral.ai/v1/chat/completions', data=req_data, headers={
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {api_key}'
})

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        raw_json = res['choices'][0]['message']['content']
        parsed = json.loads(raw_json)
        print("Generated Name:", parsed.get('name'))
        print("Examples:", len(parsed.get('examples', [])))
        print("TestCases:", parsed.get('testCases'))
        print("ExpectedOutputs:", parsed.get('expectedOutputs'))
        print("Hints:", parsed.get('hints'))
        print("Starters keys:", list(parsed.get('starters', {}).keys()))
except Exception as e:
    print("Mistral error:", e)
