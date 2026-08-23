import { SupportedLanguage } from './compiler';
import { TELEGRAM_BACKEND_URL } from './telegram';
import { MISTRAL_API_KEY } from './mistral';

export interface ProblemApproach {
  id: string;
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  starters?: Record<SupportedLanguage, string>;
  solutionCode?: Record<SupportedLanguage, string>;
}

export interface ProblemTemplate {
  name: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
    image?: string;
  }[];
  constraints: string[];
  testCases: string[];
  expectedOutputs?: string[];
  hints?: string[];
  approaches?: ProblemApproach[];
  starters: Record<SupportedLanguage, string>;
  solutions?: Record<SupportedLanguage, string>;
}

// Normalize problem titles into clean slugs
export const normalizeProblemTitle = (title: string): string => {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const toSlug = (str: string): string => {
  return str
    .replace(/^https?:\/\/leetcode\.com\/problems\//i, '')
    .replace(/\/.*$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Generate human-readable .txt testcase content for cloud/local storage
 */
export function formatProblemAsTxt(problem: ProblemTemplate): string {
  const lines: string[] = [
    `=== PROBLEM: ${problem.name} ===`,
    `CATEGORY: ${problem.category}`,
    `DIFFICULTY: ${problem.difficulty}`,
    ``,
    `=== DESCRIPTION ===`,
    problem.description,
    ``,
    `=== CONSTRAINTS ===`,
    ...(problem.constraints || []).map(c => `- ${c}`),
    ``,
    `=== TESTCASES (${problem.testCases?.length || 0}) ===`
  ];

  const tcs = problem.testCases || [];
  const eos = problem.expectedOutputs || [];

  tcs.forEach((tc, idx) => {
    const eo = eos[idx] || '';
    lines.push(`--- CASE ${idx + 1} ---`);
    lines.push(`INPUT: ${tc}`);
    lines.push(`EXPECTED: ${eo}`);
    lines.push(``);
  });

  if (problem.solutions && Object.keys(problem.solutions).length > 0) {
    lines.push(`=== OFFICIAL REFERENCE SOLUTIONS ===`);
    Object.entries(problem.solutions).forEach(([lang, solCode]) => {
      if (solCode && solCode.trim()) {
        lines.push(`--- LANGUAGE: ${lang.toUpperCase()} ---`);
        lines.push(solCode.trim());
        lines.push(``);
      }
    });
  }

  if (problem.approaches && problem.approaches.length > 0) {
    lines.push(`=== APPROACHES & COMPLEXITY ===`);
    problem.approaches.forEach((app, i) => {
      lines.push(`--- APPROACH ${i + 1}: ${app.name} ---`);
      lines.push(`TIME COMPLEXITY: ${app.timeComplexity}`);
      lines.push(`SPACE COMPLEXITY: ${app.spaceComplexity}`);
      lines.push(`DESCRIPTION: ${app.description}`);
      lines.push(``);
    });
  }

  return lines.join('\n');
}

/**
 * Dynamic starter code generator for any problem name and category
 */
export function generateDefaultStarters(title: string): Record<SupportedLanguage, string> {
  const clean = title.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const camelCase = words.length > 0
    ? words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    : 'solve';
  const snakeCase = words.map(w => w.toLowerCase()).join('_') || 'solve';

  return {
    cpp: `class Solution {\npublic:\n    vector<int> ${camelCase}(vector<int>& nums) {\n        // Implement optimal solution\n        return {};\n    }\n};`,
    python: `class Solution:\n    def ${camelCase}(self, nums: List[int]) -> List[int]:\n        # Implement optimal solution\n        return []`,
    java: `class Solution {\n    public int[] ${camelCase}(int[] nums) {\n        // Implement optimal solution\n        return new int[]{};\n    }\n}`,
    javascript: `var ${camelCase} = function(nums) {\n    // Implement optimal solution\n    return [];\n};`,
    go: `func ${camelCase}(nums []int) []int {\n    // Implement optimal solution\n    return []int{}\n}`,
    rust: `impl Solution {\n    pub fn ${snakeCase}(nums: Vec<i32>) -> Vec<i32> {\n        // Implement optimal solution\n        vec![]\n    }\n}`,
    sql: `-- Write your PostgreSQL / MySQL query here\nSELECT * FROM table_name;`
  };
}

/**
 * Extracts parameter names from starter code or examples
 */
export function extractParamNames(starters: Record<SupportedLanguage, string> | undefined, examples: { input: string }[] | undefined): string[] {
  const pyCode = starters?.python || '';
  if (pyCode) {
    const match = pyCode.match(/def\s+[a-zA-Z0-9_]+\s*\(\s*self\s*,\s*([^)]+)\)/);
    if (match) {
      const parts = match[1].split(',').map(p => p.trim().split(':')[0].trim()).filter(p => p && p !== 'self');
      if (parts.length > 0) return parts;
    }
  }

  const cppCode = starters?.cpp || '';
  if (cppCode) {
    const match = cppCode.match(/[a-zA-Z0-9_<>]+\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)/);
    if (match) {
      const parts = match[2].split(',').map(p => {
        const tokens = p.trim().replace(/[&*]/g, ' ').split(/\s+/).filter(Boolean);
        return tokens[tokens.length - 1];
      }).filter(Boolean);
      if (parts.length > 0) return parts;
    }
  }

  if (examples && examples.length > 0) {
    for (const ex of examples) {
      const matches = Array.from(ex.input.matchAll(/([a-zA-Z0-9_]+)\s*=/g)).map(m => m[1]);
      if (matches.length > 0) return matches;
    }
  }

  return [];
}

/**
 * Hardens problem testcases so that multi-parameter questions (like Two Sum)
 * NEVER split parameters across different testcase lines.
 */
export function repairAndHardenProblem(problem: ProblemTemplate): ProblemTemplate {
  if (!problem) return problem;

  const paramNames = extractParamNames(problem.starters, problem.examples);
  const numParams = paramNames.length;
  const tcs = problem.testCases || [];

  if (numParams >= 2 && tcs.length > 0) {
    // Check if testcases are split across lines (e.g. [2,7,11,15] on line 1, 9 on line 2)
    const isBroken = tcs.some(tc => {
      const str = String(tc).trim();
      return !str.includes('=') || paramNames.some(p => !str.includes(p));
    });

    if (isBroken) {
      if (tcs.length % numParams === 0 && tcs.length >= numParams) {
        const fixedTcs: string[] = [];
        for (let i = 0; i < tcs.length; i += numParams) {
          const chunk = tcs.slice(i, i + numParams);
          const parts = chunk.map((val, idx) => {
            const vStr = String(val).trim();
            if (vStr.includes('=')) return vStr;
            const pName = paramNames[idx] || `arg${idx + 1}`;
            return `${pName} = ${vStr}`;
          });
          fixedTcs.push(parts.join(', '));
        }
        problem.testCases = fixedTcs;
      } else if (problem.examples && problem.examples.length > 0) {
        const validEx = problem.examples.filter(e => e.input && e.input.includes('='));
        if (validEx.length > 0) {
          problem.testCases = validEx.map(e => e.input);
          problem.expectedOutputs = validEx.map(e => e.output);
        }
      }
    }
  }

  // Filter out any completely invalid testcases (like empty array for nextPermutation where 1 <= nums.length)
  if (problem.testCases && problem.expectedOutputs) {
    const validPairs: { input: string; output: string }[] = [];
    const isNextPerm = (problem.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes('nextpermutation');
    
    for (let i = 0; i < problem.testCases.length; i++) {
      const tc = String(problem.testCases[i] || '').trim();
      const eo = String(problem.expectedOutputs[i] || '').trim();
      if (!tc) continue;
      
      // If Next Permutation has nums = [] or nums = [ ] which violates 1 <= nums.length <= 100, skip it
      if (isNextPerm && (tc === 'nums = []' || tc === '[]' || tc === 'nums = [ ]')) {
        continue;
      }
      validPairs.push({ input: tc, output: eo });
    }
    
    if (validPairs.length > 0) {
      problem.testCases = validPairs.map(p => p.input);
      problem.expectedOutputs = validPairs.map(p => p.output);
    }
  }

  // Ensure minimum 10 verified test cases for Next Permutation
  const normProblemName = (problem.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normProblemName.includes('nextpermutation') && (!problem.testCases || problem.testCases.length < 10)) {
    const standardNextPermCases = [
      { input: 'nums = [1, 2, 3]', output: '[1, 3, 2]' },
      { input: 'nums = [3, 2, 1]', output: '[1, 2, 3]' },
      { input: 'nums = [1, 1, 5]', output: '[1, 5, 1]' },
      { input: 'nums = [1, 3, 2]', output: '[2, 1, 3]' },
      { input: 'nums = [2, 3, 1]', output: '[3, 1, 2]' },
      { input: 'nums = [1]', output: '[1]' },
      { input: 'nums = [5, 4, 7, 5, 3, 2]', output: '[5, 5, 2, 3, 4, 7]' },
      { input: 'nums = [1, 5, 1]', output: '[5, 1, 1]' },
      { input: 'nums = [2, 1, 2, 2, 2, 2, 2, 1]', output: '[2, 2, 1, 1, 2, 2, 2, 2]' },
      { input: 'nums = [4, 2, 0, 2, 3, 2, 0]', output: '[4, 2, 0, 3, 0, 2, 2]' }
    ];
    problem.testCases = standardNextPermCases.map(c => c.input);
    problem.expectedOutputs = standardNextPermCases.map(c => c.output);
  }

  // Ensure minimum 10 test cases for Two Sum
  if (paramNames.includes('nums') && paramNames.includes('target') && (!problem.testCases || problem.testCases.length < 10 || isTwoSum(problem.name))) {
    const standardTwoSumCases = [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' },
      { input: 'nums = [3, 3], target = 6', output: '[0, 1]' },
      { input: 'nums = [1, 5, 8, 3], target = 4', output: '[0, 3]' },
      { input: 'nums = [-1, -2, -3, -4, -5], target = -8', output: '[2, 4]' },
      { input: 'nums = [0, 4, 3, 0], target = 0', output: '[0, 3]' },
      { input: 'nums = [-3, 4, 3, 90], target = 0', output: '[0, 2]' },
      { input: 'nums = [1, 2, 3, 4, 5, 6, 7], target = 13', output: '[5, 6]' },
      { input: 'nums = [10, 20, 30, 40, 50], target = 90', output: '[3, 4]' },
      { input: 'nums = [5, 25, 75], target = 100', output: '[1, 2]' }
    ];
    problem.testCases = standardTwoSumCases.map(c => c.input);
    problem.expectedOutputs = standardTwoSumCases.map(c => c.output);
  }

  return problem;
}

function isTwoSum(name: string): boolean {
  const n = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return n.includes('twosum') || n.includes('2sum');
}

/**
 * Generates problem definition + AT LEAST 10 testcases with expected outputs using Mistral AI.
 * Also stores testcases as a .txt file.
 */
export async function generateProblemWithMistral(
  slugOrTitle: string,
  category: string = 'Algorithms',
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium',
  transcript?: string,
  notes?: string
): Promise<ProblemTemplate> {
  const cleanTitle = slugOrTitle.replace(/-/g, ' ').trim();
  
  const prompt = `You are a Principal Algorithms Engineer and SDE Coding Interview Architect.
Generate complete, authentic coding problem details in JSON for: "${cleanTitle}".
Context Category: "${category}", Difficulty: "${difficulty}".
${transcript ? `Lecture Context: ${transcript.slice(0, 1500)}` : ''}
${notes ? `Study Notes: ${notes.slice(0, 1500)}` : ''}

CRITICAL SIGNATURE & TEST CASE SPECIFICATIONS:
1. METHOD SIGNATURE & ARGUMENT PARITY:
   - Provide standard LeetCode class Solution starter code and optimal solution code in C++, Python, Java, JavaScript, Go, Rust.
   - The method name and parameter list across ALL starter templates MUST MATCH EXACTLY.
   - Example (1 argument):
     C++: void nextPermutation(vector<int>& nums)
     Python: def nextPermutation(self, nums: List[int]) -> None:
     Testcase: "nums = [1, 2, 3]" -> Expected: "[1, 3, 2]"
   - Example (2 arguments):
     C++: vector<int> twoSum(vector<int>& nums, int target)
     Python: def twoSum(self, nums: List[int], target: int) -> List[int]:
     Testcase: "nums = [2, 7, 11, 15], target = 9" -> Expected: "[0, 1]"
2. MULTI-ARGUMENT TEST CASES:
   - If the method takes N parameters, EVERY testcase item in "testCases" MUST contain ALL N parameters in that single string.
   - NEVER put argument 1 in Case 1 and argument 2 in Case 2!
   - NEVER add phantom or extra parameters (like adding 'target' to nextPermutation or sortColors).
3. IN-PLACE / VOID METHODS:
   - For methods returning void (e.g. nextPermutation, sortColors, rotate, setZeroes, moveZeroes), "expectedOutputs" MUST contain the final mutated array/matrix representation.
4. STRICT CONSTRAINT ADHERENCE:
   - Strictly obey the standard problem constraints (e.g. if 1 <= nums.length <= 100, DO NOT generate empty arrays like "nums = []").
   - Every single testcase MUST be valid according to the stated problem constraints.
5. AT LEAST 10 TEST CASES:
   - Provide AT LEAST 10 diverse test case inputs in "testCases" and matching 1-to-1 "expectedOutputs".
   - Include standard cases, edge cases within constraints, single-element cases, sorted/reverse-sorted cases, duplicate elements, negative numbers, large bounds.

Return ONLY valid JSON matching this exact structure:
{
  "name": "${cleanTitle}",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "description": "Complete problem explanation with markdown bold/code markers",
  "examples": [
    {
      "input": "input representation string containing all arguments",
      "output": "expected output string",
      "explanation": "why this output is correct"
    }
  ],
  "constraints": [
    "constraint 1",
    "constraint 2"
  ],
  "testCases": [
    "case 1 input string with all parameters",
    "case 2 input string with all parameters",
    "case 3 input string with all parameters",
    "case 4 input string with all parameters",
    "case 5 input string with all parameters",
    "case 6 input string with all parameters",
    "case 7 input string with all parameters",
    "case 8 input string with all parameters",
    "case 9 input string with all parameters",
    "case 10 input string with all parameters"
  ],
  "expectedOutputs": [
    "case 1 output string",
    "case 2 output string",
    "case 3 output string",
    "case 4 output string",
    "case 5 output string",
    "case 6 output string",
    "case 7 output string",
    "case 8 output string",
    "case 9 output string",
    "case 10 output string"
  ],
  "hints": [
    "Hint 1: Intuition",
    "Hint 2: Algorithm approach",
    "Hint 3: Edge cases"
  ],
  "approaches": [
    {
      "id": "optimal",
      "name": "Optimal Approach",
      "timeComplexity": "O(N)",
      "spaceComplexity": "O(1)",
      "description": "Explanation of optimal technique"
    }
  ],
  "starters": {
    "cpp": "class Solution {\\npublic:\\n    void nextPermutation(vector<int>& nums) {\\n        \\n    }\\n};",
    "python": "class Solution:\\n    def nextPermutation(self, nums: List[int]) -> None:\\n        pass",
    "java": "class Solution {\\n    public void nextPermutation(int[] nums) {\\n        \\n    }\\n}",
    "javascript": "/**\\n * @param {number[]} nums\\n * @return {void} Do not return anything, modify nums in-place instead.\\n */\\nvar nextPermutation = function(nums) {\\n    \\n};",
    "go": "func nextPermutation(nums []int) {\\n    \\n}",
    "rust": "impl Solution {\\n    pub fn next_permutation(nums: &mut Vec<i32>) {\\n        \\n    }\\n}"
  },
  "solutions": {
    "cpp": "class Solution {\\npublic:\\n    // Working C++ solution\\n};",
    "python": "class Solution:\\n    # Working Python solution\\n",
    "java": "class Solution {\\n    // Working Java solution\\n}",
    "javascript": "var nextPermutation = function(nums) {\\n    // Working JS solution\\n};"
  }
}`;

  try {
    const resp = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      }),
      signal: AbortSignal.timeout(28000)
    });

    if (resp.ok) {
      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content) as ProblemTemplate;
        if (parsed && parsed.name && parsed.testCases && parsed.testCases.length >= 10) {
          // Save testcases as .txt file in localStorage & attempt cloud sync
          const txtContent = formatProblemAsTxt(parsed);
          const slug = toSlug(parsed.name || cleanTitle);
          try {
            localStorage.setItem(`edustream_testcases_txt_${slug}`, txtContent);
            localStorage.setItem(`edustream_problem_spec_${slug}`, JSON.stringify(parsed));
          } catch (_) {}

          // Attempt async upload to Cloudflare R2 backend
          try {
            fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/upload`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(parsed)
            }).catch(() => {});
          } catch (_) {}

          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn(`[Mistral Problem Generation Notice for '${cleanTitle}']:`, err);
  }

  // Fallback template if network/Mistral fails
  const defaultStarters = generateDefaultStarters(cleanTitle);
  const fallbackProblem: ProblemTemplate = {
    name: cleanTitle,
    category,
    difficulty,
    description: `Given the problem constraints for **${cleanTitle}**, design an optimal algorithm with minimum time and auxiliary space complexity.`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9'
    ],
    testCases: [
      'nums = [2, 7, 11, 15], target = 9',
      'nums = [3, 2, 4], target = 6',
      'nums = [3, 3], target = 6',
      'nums = [1, 5, 8, 3], target = 4',
      'nums = [-1, -2, -3, -4, -5], target = -8',
      'nums = [0, 4, 3, 0], target = 0',
      'nums = [-3, 4, 3, 90], target = 0',
      'nums = [1, 2, 3, 4, 5, 6, 7], target = 13',
      'nums = [10, 20, 30, 40, 50], target = 90',
      'nums = [5, 25, 75], target = 100'
    ],
    expectedOutputs: [
      '[0, 1]',
      '[1, 2]',
      '[0, 1]',
      '[0, 3]',
      '[2, 4]',
      '[0, 3]',
      '[0, 2]',
      '[5, 6]',
      '[3, 4]',
      '[1, 2]'
    ],
    hints: [
      'Analyze the problem invariants and identify whether hash maps, two-pointers, or binary search apply.',
      'Check boundary conditions such as negative values, duplicates, and single-element inputs.'
    ],
    approaches: [
      {
        id: 'optimal',
        name: 'Optimal Approach',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        description: `Optimal linear scan algorithm for ${cleanTitle}.`
      }
    ],
    starters: defaultStarters,
    solutions: defaultStarters
  };

  return fallbackProblem;
}

/**
 * Main function to load a problem definition:
 * 1. Checks local cache / localStorage
 * 2. Checks Cloudflare R2 storage via /api/problem/{slug}
 * 3. If testcases are not in R2 or < 10 testcases, calls Mistral AI to generate min 10 testcases and stores as .txt / .json in R2
 */
export async function fetchEnrichedProblem(
  slugOrTitle: string,
  category: string = 'Algorithms',
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium',
  transcript?: string,
  notes?: string
): Promise<ProblemTemplate> {
  const slug = toSlug(slugOrTitle);
  const cacheKey = `edustream_problem_spec_${slug}`;

  // 1. Check local spec cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      let parsed = JSON.parse(cached) as ProblemTemplate;
      parsed = repairAndHardenProblem(parsed);
      if (parsed && parsed.name && parsed.testCases && parsed.testCases.length >= 10) {
        return parsed;
      }
    }
  } catch (_) {}

  // 2. Fetch from Cloudflare R2 via Backend API
  try {
    const backendUrl = `${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}`;
    const resp = await fetch(backendUrl, { signal: AbortSignal.timeout(8000) });
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.name && !data.error) {
        const problemObj = repairAndHardenProblem(data as ProblemTemplate);
        if (problemObj.testCases && problemObj.testCases.length >= 10) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(problemObj));
            localStorage.setItem(`edustream_testcases_txt_${slug}`, formatProblemAsTxt(problemObj));
          } catch (_) {}
          return problemObj;
        }
      }
    }
  } catch (err) {
    console.warn(`[R2 Backend problem fetch notice for '${slug}']:`, err);
  }

  // 3. If not in R2 or testcases missing / < 10, invoke Mistral AI to generate testcases and store as .txt
  let generated = await generateProblemWithMistral(slugOrTitle, category, difficulty, transcript, notes);
  generated = repairAndHardenProblem(generated);
  try {
    localStorage.setItem(cacheKey, JSON.stringify(generated));
    localStorage.setItem(`edustream_testcases_txt_${slug}`, formatProblemAsTxt(generated));
  } catch (_) {}

  return generated;
}
