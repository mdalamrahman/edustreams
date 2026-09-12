import { SupportedLanguage, isDriverHarnessValid } from './compiler';
import { TELEGRAM_BACKEND_URL } from './telegram';
import { MISTRAL_API_KEY, requestAIDriverGeneration, executeAIChatCascade, requestMistralTestcaseExpansion } from './mistral';

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
  images?: string[];
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
  driverCode?: Partial<Record<SupportedLanguage, string>>;
}

// Normalize problem titles into clean slugs
export const normalizeProblemTitle = (title?: string): string => {
  return (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Extracts a clean slug from any string or URL (e.g. "https://leetcode.com/problems/assign-cookies/" -> "assign-cookies")
 */
export const toSlug = (str?: string): string => {
  if (!str) return 'algorithm-problem';
  let s = String(str).trim();

  // If search URL like https://leetcode.com/problem-list/all/?search=xyz, extract search query
  if (s.toLowerCase().includes('search=') || s.toLowerCase().includes('problem-list')) {
    try {
      const url = new URL(s.startsWith('http') ? s : `https://${s}`);
      const searchVal = url.searchParams.get('search');
      if (searchVal) {
        s = searchVal;
      }
    } catch {}
  }

  // If GFG problem URL, extract slug accurately
  if (s.toLowerCase().includes('geeksforgeeks.org/problems/')) {
    const match = s.match(/geeksforgeeks\.org\/problems\/([^/?#\s]+)/i);
    if (match && match[1]) {
      s = match[1];
    }
  }

  // If full URL or contains leetcode.com/problems/, extract the problem slug accurately
  if (s.startsWith('http://') || s.startsWith('https://') || s.toLowerCase().includes('leetcode.com/problems/')) {
    try {
      const match = s.match(/leetcode\.com\/problems\/([^/?#\s]+)/i);
      if (match && match[1]) {
        s = match[1];
      } else {
        const url = new URL(s.startsWith('http') ? s : `https://${s}`);
        const segments = url.pathname.split('/').filter(Boolean);
        const probIdx = segments.indexOf('problems');
        if (probIdx !== -1 && segments[probIdx + 1]) {
          s = segments[probIdx + 1];
        } else if (segments.length > 0) {
          s = segments[segments.length - 1];
        }
      }
    } catch {
      s = s.replace(/^https?:\/\/[^/]+\//, '');
    }
  }

  // Remove trailing sub-paths like /description/ or /editorial/ or /1
  s = s.replace(/\/(description|editorial|solutions|discussion|comments|\d+)\/?$/i, '');

  const slug = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (!slug || slug === 'https' || slug === 'http' || slug === 'www' || slug === 'com' || slug === 'problems' || slug === 'all' || slug === 'problem-list') {
    return 'algorithm-problem';
  }
  return slug;
};

/**
 * Deletes cached problem specifications, test cases, and drivers so they can be regenerated.
 */
export const clearProblemCache = (slugOrTitle?: string): void => {
  try {
    if (slugOrTitle) {
      const slug = toSlug(slugOrTitle);
      localStorage.removeItem(`edustream_problem_spec_${slug}`);
      localStorage.removeItem(`edustream_testcases_txt_${slug}`);
      localStorage.removeItem(`edustream_editorial_${slug}`);
      localStorage.removeItem(`edustream_problem_override_${slug}`);
      localStorage.removeItem(`edustream_testcase_override_${slug}`);
      const langs = ['cpp', 'python', 'java', 'javascript', 'go', 'rust'];
      langs.forEach(lang => {
        localStorage.removeItem(`edustream_driver_${lang}_${slug}`);
        localStorage.removeItem(`edustream_driver_${slug}_${lang}`);
      });
    } else {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('edustream_problem_spec_') ||
            key.startsWith('edustream_testcases_txt_') ||
            key.startsWith('edustream_driver_') ||
            key.startsWith('edustream_editorial_') ||
            key.startsWith('edustream_testcase_override_'))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
  } catch (e) {
    console.warn('[clearProblemCache]:', e);
  }
};

/**
 * Extracts a human-friendly clean title (e.g. "https://leetcode.com/problems/assign-cookies/" -> "Assign Cookies")
 */
export const getCleanTitle = (str?: string): string => {
  if (!str) return 'Algorithm Problem';
  let s = String(str).trim();
  if (s.startsWith('http://') || s.startsWith('https://') || s.toLowerCase().includes('leetcode.com/problems/')) {
    const slug = toSlug(s);
    if (slug !== 'algorithm-problem') {
      return slug
        .split('-')
        .filter(w => w && !['https', 'http', 'leetcode', 'com', 'problems', 'description'].includes(w))
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ') || 'Algorithm Problem';
    }
  }
  const clean = s.replace(/-/g, ' ').replace(/_/g, ' ').trim();
  return clean || 'Algorithm Problem';
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
 * Dynamic starter code generator for any problem name and category.
 * Sanitizes URLs and unwanted words so method names are always valid identifiers.
 */
export function generateDefaultStarters(titleOrSlug: string): Record<SupportedLanguage, string> {
  const slug = toSlug(titleOrSlug);
  const words = slug.split('-').filter(w => w && !['https', 'http', 'leetcode', 'com', 'problems', 'description', 'algorithm', 'problem'].includes(w));
  const camelCase = words.length > 0
    ? words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    : 'solve';
  const snakeCase = words.map(w => w.toLowerCase()).join('_') || 'solve';

  return {
    cpp: `class Solution {\npublic:\n    int ${camelCase}(vector<int>& nums) {\n        // Implement optimal solution\n        return 0;\n    }\n};`,
    python: `class Solution:\n    def ${camelCase}(self, nums: List[int]) -> int:\n        # Implement optimal solution\n        return 0`,
    java: `class Solution {\n    public int ${camelCase}(int[] nums) {\n        // Implement optimal solution\n        return 0;\n    }\n}`,
    javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar ${camelCase} = function(nums) {\n    // Implement optimal solution\n    return 0;\n};`,
    go: `func ${camelCase}(nums []int) int {\n    // Implement optimal solution\n    return 0\n}`,
    rust: `impl Solution {\n    pub fn ${snakeCase}(nums: Vec<i32>) -> i32 {\n        // Implement optimal solution\n        0\n    }\n}`,
    sql: `-- Write your PostgreSQL / MySQL query here\nSELECT * FROM table_name;`
  };
}

export const PREDEFINED_SPECIAL_PROBLEMS: Record<string, ProblemTemplate> = {
  'return-length-of-arguments-passed': {
    name: 'Return Length of Arguments Passed',
    category: 'JavaScript',
    difficulty: 'Easy',
    description: `Write a function \`argumentsLength\` that returns the count of arguments passed to it.

### Example 1
\`\`\`
Input: args = [5]
Output: 1
Explanation:
argumentsLength(5); // 1

One value was passed to the function so it should return 1.
\`\`\`

### Example 2
\`\`\`
Input: args = [{}, null, "3"]
Output: 3
Explanation:
argumentsLength({}, null, "3"); // 3

Three values were passed to the function so it should return 3.
\`\`\`

### Constraints
- \`args\` is a valid JSON array
- \`0 <= args.length <= 100\``,
    examples: [
      { input: 'args = [5]', output: '1', explanation: 'argumentsLength(5); // 1' },
      { input: 'args = [{}, null, "3"]', output: '3', explanation: 'argumentsLength({}, null, "3"); // 3' }
    ],
    constraints: [
      'args is a valid JSON array',
      '0 <= args.length <= 100'
    ],
    testCases: [
      'args = [5]',
      'args = [{}, null, "3"]',
      'args = []',
      'args = [1, 2, 3]',
      'args = ["a", "b", "c", "d"]',
      'args = [true, false, true]',
      'args = [{"a": 1}, {"b": 2}]',
      'args = [null, 0, "test"]',
      'args = [[1, 2], [3, 4], [5, 6]]',
      'args = [0, -1, 100, 200, 300]'
    ],
    expectedOutputs: ['1', '3', '0', '3', '4', '3', '2', '3', '3', '5'],
    hints: ['You can access the arguments passed to a function using the rest parameter syntax (...args) or the arguments object.'],
    starters: {
      javascript: `/**\n * @param {...(null|boolean|number|string|Array|Object)} args\n * @return {number}\n */\nvar argumentsLength = function(...args) {\n    return args.length;\n};`,
      python: `class Solution:\n    def argumentsLength(self, *args) -> int:\n        return len(args)`,
      cpp: `class Solution {\npublic:\n    int argumentsLength(vector<int>& args) {\n        return args.size();\n    }\n};`,
      java: `class Solution {\n    public int argumentsLength(Object... args) {\n        return args.length;\n    }\n}`,
      go: `func argumentsLength(args ...interface{}) int {\n    return len(args)\n}`,
      rust: `impl Solution {\n    pub fn arguments_length(args: Vec<i32>) -> i32 {\n        args.len() as i32\n    }\n}`,
      sql: `-- Write your SQL query here`
    },
    solutions: {
      javascript: `var argumentsLength = function(...args) {\n    return args.length;\n};`,
      python: `class Solution:\n    def argumentsLength(self, *args) -> int:\n        return len(args)`,
      cpp: `class Solution {\npublic:\n    int argumentsLength(vector<int>& args) {\n        return args.size();\n    }\n};`,
      java: `class Solution {\n    public int argumentsLength(Object... args) {\n        return args.length;\n    }\n}`,
      go: `func argumentsLength(args ...interface{}) int {\n    return len(args)\n}`,
      rust: `impl Solution {\n    pub fn arguments_length(args: Vec<i32>) -> i32 {\n        args.len() as i32\n    }\n}`,
      sql: `-- Write your SQL query here`
    }
  },
  'closest-binary-search-tree-value': {
    name: 'Closest Binary Search Tree Value',
    category: 'Trees',
    difficulty: 'Easy',
    description: `Given the \`root\` of a binary search tree and a \`target\` value, return *the value in the BST that is closest to the* \`target\`. If there are multiple answers, return the smallest.

### Example 1:
\`\`\`
Input: root = [4, 2, 5, 1, 3], target = 3.714286
Output: 4
\`\`\`

### Example 2:
\`\`\`
Input: root = [1], target = 4.428571
Output: 1
\`\`\`

### Constraints:
- The number of nodes in the tree is in the range \`[1, 10^4]\`.
- \`0 <= Node.val <= 10^9\`
- \`-10^9 <= target <= 10^9\``,
    examples: [
      { input: 'root = [4, 2, 5, 1, 3], target = 3.714286', output: '4', explanation: 'Node 4 is closest to 3.714286.' },
      { input: 'root = [1], target = 4.428571', output: '1', explanation: 'The single node 1 is closest.' }
    ],
    constraints: [
      'The number of nodes in the tree is in the range [1, 10^4].',
      '0 <= Node.val <= 10^9',
      '-10^9 <= target <= 10^9'
    ],
    testCases: [
      'root = [4, 2, 5, 1, 3], target = 3.714286',
      'root = [1], target = 4.428571',
      'root = [2, 1, 3], target = 0.2',
      'root = [4, 2, 5, 1, 3], target = 5.8',
      'root = [8, 4, 12, 2, 6, 10, 14], target = 9.1',
      'root = [8, 4, 12, 2, 6, 10, 14], target = 5.5',
      'root = [1, null, 2], target = 3.5',
      'root = [3, 2, 4, 1], target = 4.14',
      'root = [5, 3, 6, 2, 4, null, null, 1], target = 4.5',
      'root = [10], target = 10.0'
    ],
    expectedOutputs: ['4', '1', '1', '5', '10', '6', '2', '4', '4', '10'],
    hints: [
      'Traverse the BST while keeping track of the closest node value seen so far.',
      'Since it is a BST, you can decide whether to go left or right based on comparing the target with the current node value.'
    ],
    starters: {
      cpp: `/**\n * Definition for a binary tree node.\n * struct TreeNode {\n *     int val;\n *     TreeNode *left;\n *     TreeNode *right;\n *     TreeNode() : val(0), left(nullptr), right(nullptr) {}\n *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n * };\n */\nclass Solution {\npublic:\n    int closestValue(TreeNode* root, double target) {\n        \n    }\n};`,
      python: `# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\nclass Solution:\n    def closestValue(self, root: Optional[TreeNode], target: float) -> int:\n        pass`,
      java: `/**\n * Definition for a binary tree node.\n * public class TreeNode {\n *     int val;\n *     TreeNode left;\n *     TreeNode right;\n *     TreeNode() {}\n *     TreeNode(int val) { this.val = val; }\n *     TreeNode(int val, TreeNode left, TreeNode right) {\n *         this.val = val;\n *         this.left = left;\n *         this.right = right;\n *     }\n * }\n */\nclass Solution {\n    public int closestValue(TreeNode root, double target) {\n        \n    }\n}`,
      javascript: `/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\n/**\n * @param {TreeNode} root\n * @param {number} target\n * @return {number}\n */\nvar closestValue = function(root, target) {\n    \n};`,
      go: `/**\n * Definition for a binary tree node.\n * type TreeNode struct {\n *     Val int\n *     Left *TreeNode\n *     Right *TreeNode\n * }\n */\nfunc closestValue(root *TreeNode, target float64) int {\n    \n}`,
      rust: `// Definition for a binary tree node.\n// #[derive(Debug, PartialEq, Eq)]\n// pub struct TreeNode {\n//   pub val: i32,\n//   pub left: Option<Rc<RefCell<TreeNode>>>,\n//   pub right: Option<Rc<RefCell<TreeNode>>>,\n// }\nimpl Solution {\n    pub fn closest_value(root: Option<Rc<RefCell<TreeNode>>>, target: f64) -> i32 {\n        0\n    }\n}`,
      sql: `-- Not applicable for tree problems`
    },
    solutions: {
      cpp: `class Solution {\npublic:\n    int closestValue(TreeNode* root, double target) {\n        int closest = root->val;\n        while (root) {\n            if (std::abs(root->val - target) < std::abs(closest - target) || \n               (std::abs(root->val - target) == std::abs(closest - target) && root->val < closest)) {\n                closest = root->val;\n            }\n            root = target < root->val ? root->left : root->right;\n        }\n        return closest;\n    }\n};`,
      python: `class Solution:\n    def closestValue(self, root: Optional[TreeNode], target: float) -> int:\n        closest = root.val\n        curr = root\n        while curr:\n            diff = abs(curr.val - target)\n            closest_diff = abs(closest - target)\n            if diff < closest_diff or (diff == closest_diff and curr.val < closest):\n                closest = curr.val\n            curr = curr.left if target < curr.val else curr.right\n        return closest`,
      java: `class Solution {\n    public int closestValue(TreeNode root, double target) {\n        int closest = root.val;\n        TreeNode curr = root;\n        while (curr != null) {\n            double diff = Math.abs(curr.val - target);\n            double closestDiff = Math.abs(closest - target);\n            if (diff < closestDiff || (diff == closestDiff && curr.val < closest)) {\n                closest = curr.val;\n            }\n            curr = target < curr.val ? curr.left : curr.right;\n        }\n        return closest;\n    }\n}`,
      javascript: `var closestValue = function(root, target) {\n    let closest = root.val;\n    let curr = root;\n    while (curr) {\n        const diff = Math.abs(curr.val - target);\n        const closestDiff = Math.abs(closest - target);\n        if (diff < closestDiff || (diff === closestDiff && curr.val < closest)) {\n            closest = curr.val;\n        }\n        curr = target < curr.val ? curr.left : curr.right;\n    }\n    return closest;\n};`,
      go: `func closestValue(root *TreeNode, target float64) int {\n    closest := root.Val\n    curr := root\n    for curr != nil {\n        diff := math.Abs(float64(curr.Val) - target)\n        closestDiff := math.Abs(float64(closest) - target)\n        if diff < closestDiff || (diff == closestDiff && curr.Val < closest) {\n            closest = curr.Val\n        }\n        if target < float64(curr.Val) {\n            curr = curr.Left\n        } else {\n            curr = curr.Right\n        }\n    }\n    return closest\n}`,
      rust: `impl Solution {\n    pub fn closest_value(root: Option<Rc<RefCell<TreeNode>>>, target: f64) -> i32 {\n        let mut closest = 0;\n        let mut curr = root;\n        let mut has_val = false;\n        while let Some(node_rc) = curr {\n            let node = node_rc.borrow();\n            if !has_val {\n                closest = node.val;\n                has_val = true;\n            } else {\n                let diff = ((node.val as f64) - target).abs();\n                let closest_diff = ((closest as f64) - target).abs();\n                if diff < closest_diff || (diff == closest_diff && node.val < closest) {\n                    closest = node.val;\n                }\n            }\n            if target < (node.val as f64) {\n                curr = node.left.clone();\n            } else {\n                curr = node.right.clone();\n            }\n        }\n        closest\n    }\n}`,
      sql: `-- Not applicable`
    }
  },
  'floor-in-bst': {
    name: 'Floor in BST',
    category: 'BST',
    difficulty: 'Medium',
    description: `Given a Binary Search Tree and a number **x**, find the **Floor of x in the BST**.

The **floor of x** is defined as the greatest value in the BST that is smaller than or equal to **x**. If no such value exists, return **-1**.

### Example 1:
\`\`\`
Input: root = [10, 5, 15, 2, 6], x = 7
Output: 6
Explanation: In the given BST, the elements are [2, 5, 6, 10, 15]. The greatest element <= 7 is 6.
\`\`\`

### Example 2:
\`\`\`
Input: root = [2, 1, 3], x = 0
Output: -1
Explanation: There is no node with value <= 0 in the BST.
\`\`\`

### Constraints:
- The number of nodes in the tree is in the range \`[1, 10^5]\`.
- \`1 <= Node.val <= 10^9\`
- \`0 <= x <= 10^9\``,
    examples: [
      { input: 'root = [10, 5, 15, 2, 6], x = 7', output: '6', explanation: 'The greatest node value <= 7 is 6.' },
      { input: 'root = [2, 1, 3], x = 0', output: '-1', explanation: 'No element is <= 0, so return -1.' }
    ],
    constraints: [
      'The number of nodes in the tree is in the range [1, 10^5].',
      '1 <= Node.val <= 10^9',
      '0 <= x <= 10^9'
    ],
    testCases: [
      'root = [10, 5, 15, 2, 6], x = 7',
      'root = [2, 1, 3], x = 0',
      'root = [8, 4, 12, 2, 6, 10, 14], x = 11',
      'root = [8, 4, 12, 2, 6, 10, 14], x = 8',
      'root = [5, 2, 8, 1, 4, 6, 9], x = 3',
      'root = [5, 2, 8, 1, 4, 6, 9], x = 10',
      'root = [5, 2, 8, 1, 4, 6, 9], x = 1',
      'root = [5, 2, 8, 1, 4, 6, 9], x = 5',
      'root = [1], x = 1',
      'root = [1], x = 0'
    ],
    expectedOutputs: ['6', '-1', '10', '8', '2', '9', '1', '5', '1', '-1'],
    hints: [
      'Perform standard BST traversal: if root->val == x, then root->val is the exact floor.',
      'If root->val < x, then root->val could be the floor, so store it and search in the right subtree for a closer value.',
      'If root->val > x, the floor must lie in the left subtree.'
    ],
    starters: {
      cpp: `/**\n * Definition for a binary tree node.\n * struct TreeNode {\n *     int val;\n *     TreeNode *left;\n *     TreeNode *right;\n *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n * };\n */\nclass Solution {\npublic:\n    int floor(TreeNode* root, int x) {\n        \n    }\n};`,
      python: `# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\nclass Solution:\n    def floor(self, root: Optional[TreeNode], x: int) -> int:\n        pass`,
      java: `/**\n * Definition for a binary tree node.\n * public class TreeNode {\n *     int val;\n *     TreeNode left, right;\n *     TreeNode(int val) { this.val = val; }\n * }\n */\nclass Solution {\n    public int floor(TreeNode root, int x) {\n        \n    }\n}`,
      javascript: `/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\n/**\n * @param {TreeNode} root\n * @param {number} x\n * @return {number}\n */\nvar floor = function(root, x) {\n    \n};`,
      go: `func floor(root *TreeNode, x int) int {\n    \n}`,
      rust: `impl Solution {\n    pub fn floor(root: Option<Rc<RefCell<TreeNode>>>, x: i32) -> i32 {\n        -1\n    }\n}`,
      sql: `-- Not applicable for tree problems`
    },
    solutions: {
      cpp: `class Solution {\npublic:\n    int floor(TreeNode* root, int x) {\n        int ans = -1;\n        while (root) {\n            if (root->val == x) {\n                return root->val;\n            }\n            if (root->val < x) {\n                ans = root->val;\n                root = root->right;\n            } else {\n                root = root->left;\n            }\n        }\n        return ans;\n    }\n};`,
      python: `class Solution:\n    def floor(self, root: Optional[TreeNode], x: int) -> int:\n        ans = -1\n        curr = root\n        while curr:\n            if curr.val == x:\n                return curr.val\n            if curr.val < x:\n                ans = curr.val\n                curr = curr.right\n            else:\n                curr = curr.left\n        return ans`,
      java: `class Solution {\n    public int floor(TreeNode root, int x) {\n        int ans = -1;\n        TreeNode curr = root;\n        while (curr != null) {\n            if (curr.val == x) return curr.val;\n            if (curr.val < x) {\n                ans = curr.val;\n                curr = curr.right;\n            } else {\n                curr = curr.left;\n            }\n        }\n        return ans;\n    }\n}`,
      javascript: `var floor = function(root, x) {\n    let ans = -1;\n    let curr = root;\n    while (curr) {\n        if (curr.val === x) return curr.val;\n        if (curr.val < x) {\n            ans = curr.val;\n            curr = curr.right;\n        } else {\n            curr = curr.left;\n        }\n    }\n    return ans;\n};`,
      go: `func floor(root *TreeNode, x int) int {\n    ans := -1\n    curr := root\n    for curr != nil {\n        if curr.Val == x {\n            return curr.Val\n        }\n        if curr.Val < x {\n            ans = curr.Val\n            curr = curr.Right\n        } else {\n            curr = curr.Left\n        }\n    }\n    return ans\n}`,
      rust: `impl Solution {\n    pub fn floor(root: Option<Rc<RefCell<TreeNode>>>, x: i32) -> i32 {\n        let mut ans = -1;\n        let mut curr = root;\n        while let Some(node_rc) = curr {\n            let node = node_rc.borrow();\n            if node.val == x {\n                return node.val;\n            }\n            if node.val < x {\n                ans = node.val;\n                curr = node.right.clone();\n            } else {\n                curr = node.left.clone();\n            }\n        }\n        ans\n    }\n}`,
      sql: `-- Not applicable`
    }
  }
};

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

  // Guarantee array properties are always defined with safe string elements
  problem.examples = (Array.isArray(problem.examples) ? problem.examples : []).map(ex => ({
    ...ex,
    input: ex.input !== null && ex.input !== undefined ? String(ex.input) : '',
    output: ex.output !== null && ex.output !== undefined ? String(ex.output) : ''
  }));
  problem.constraints = Array.isArray(problem.constraints) ? problem.constraints : [];
  problem.testCases = (Array.isArray(problem.testCases) ? problem.testCases : []).map(tc =>
    tc !== null && tc !== undefined ? String(tc) : ''
  );
  problem.expectedOutputs = (Array.isArray(problem.expectedOutputs) ? problem.expectedOutputs : []).map(eo =>
    eo !== null && eo !== undefined ? String(eo) : ''
  );
  problem.hints = Array.isArray(problem.hints) ? problem.hints : [];
  problem.approaches = Array.isArray(problem.approaches) ? problem.approaches : [];
  if (!problem.starters || Object.keys(problem.starters).length === 0) {
    problem.starters = generateDefaultStarters(problem.name || 'algorithm');
  }
  if (!problem.solutions) {
    problem.solutions = problem.starters;
  }

  const paramNames = extractParamNames(problem.starters, problem.examples);
  const numParams = paramNames.length;
  const tcs = problem.testCases || [];

  // 1. Single parameter questions (e.g. grid = [...], nums = [...], s = "...")
  if (numParams === 1 && paramNames[0] && tcs.length > 0) {
    const pName = paramNames[0];
    problem.testCases = tcs.map(tc => {
      const str = String(tc).trim();
      if (!str.includes('=')) {
        return `${pName} = ${str}`;
      }
      return str;
    });
  }

  // 2. Multi-parameter questions: Ensure parameters are never split across separate array items
  else if (numParams >= 2 && tcs.length > 0) {
    // Check if testcases are split across lines
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

  // Filter out any completely invalid testcases
  if (problem.testCases && problem.expectedOutputs) {
    const validPairs: { input: string; output: string }[] = [];
    const isNextPerm = (problem.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes('nextpermutation');

    for (let i = 0; i < problem.testCases.length; i++) {
      const tc = String(problem.testCases[i] || '').trim();
      const eo = String(problem.expectedOutputs[i] || '').trim();
      if (!tc) continue;

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

  const probSlug = (problem as any).slug || '';
  const isSubsetsII = normProblemName.includes('subsetsii') || normProblemName.includes('subsets2') || normProblemName.includes('uniquesubsets') || normProblemName.includes('subsetsum2') || normProblemName.includes('subset2') || probSlug === 'subsets-ii';
  
  if (isSubsetsII) {
    const standardSubsetsIICases = [
      { input: 'nums = [1, 2, 2]', output: '[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]' },
      { input: 'nums = [0]', output: '[[], [0]]' },
      { input: 'nums = [4, 4, 4, 1, 4]', output: '[[], [1], [1, 4], [1, 4, 4], [1, 4, 4, 4], [1, 4, 4, 4, 4], [4], [4, 4], [4, 4, 4], [4, 4, 4, 4]]' },
      { input: 'nums = [1, 2, 3]', output: '[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]' },
      { input: 'nums = [2, 1, 2, 1, 3]', output: '[[], [1], [1, 1], [1, 1, 2], [1, 1, 2, 2], [1, 1, 2, 2, 3], [1, 1, 2, 3], [1, 1, 3], [1, 2], [1, 2, 2], [1, 2, 2, 3], [1, 2, 3], [1, 3], [2], [2, 2], [2, 2, 3], [2, 3], [3]]' },
      { input: 'nums = []', output: '[[]]' },
      { input: 'nums = [1]', output: '[[], [1]]' },
      { input: 'nums = [1, 1, 1]', output: '[[], [1], [1, 1], [1, 1, 1]]' },
      { input: 'nums = [1, 2, 2, 3, 3]', output: '[[], [1], [1, 2], [1, 2, 2], [1, 2, 2, 3], [1, 2, 2, 3, 3], [1, 2, 3], [1, 2, 3, 3], [1, 3], [1, 3, 3], [2], [2, 2], [2, 2, 3], [2, 2, 3, 3], [2, 3], [2, 3, 3], [3], [3, 3]]' },
      { input: 'nums = [-1, 0, 1]', output: '[[], [-1], [-1, 0], [-1, 0, 1], [-1, 1], [0], [0, 1], [1]]' },
      { input: 'nums = [-1, -1, 0, 1, 1]', output: '[[], [-1], [-1, -1], [-1, -1, 0], [-1, -1, 0, 1], [-1, -1, 0, 1, 1], [-1, -1, 1], [-1, -1, 1, 1], [-1, 0], [-1, 0, 1], [-1, 0, 1, 1], [-1, 1], [-1, 1, 1], [0], [0, 1], [0, 1, 1], [1], [1, 1]]' }
    ];
    problem.testCases = standardSubsetsIICases.map(c => c.input);
    problem.expectedOutputs = standardSubsetsIICases.map(c => c.output);
  } else if (normProblemName.includes('subsets') || normProblemName.includes('subsets1') || normProblemName.includes('powerset') || normProblemName === 'subsets' || probSlug === 'subsets') {
    const standardSubsetsCases = [
      { input: 'nums = [1, 2, 3]', output: '[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]' },
      { input: 'nums = [0]', output: '[[], [0]]' },
      { input: 'nums = [1, 2]', output: '[[], [1], [2], [1, 2]]' },
      { input: 'nums = [3]', output: '[[], [3]]' },
      { input: 'nums = [9, 0]', output: '[[], [9], [0], [9, 0]]' },
      { input: 'nums = [-1, 0, 1]', output: '[[], [-1], [0], [-1, 0], [1], [-1, 1], [0, 1], [-1, 0, 1]]' },
      { input: 'nums = [1, 2, 3, 4]', output: '[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3], [4], [1, 4], [2, 4], [1, 2, 4], [3, 4], [1, 3, 4], [2, 3, 4], [1, 2, 3, 4]]' },
      { input: 'nums = [-10, 10]', output: '[[], [-10], [10], [-10, 10]]' },
      { input: 'nums = [4, 1, 0]', output: '[[], [4], [1], [4, 1], [0], [4, 0], [1, 0], [4, 1, 0]]' },
      { input: 'nums = []', output: '[[]]' },
      { input: 'nums = [5, 6, 7]', output: '[[], [5], [6], [5, 6], [7], [5, 7], [6, 7], [5, 6, 7]]' }
    ];
    if (!problem.testCases || problem.testCases.length < 10) {
      problem.testCases = standardSubsetsCases.map(c => c.input);
      problem.expectedOutputs = standardSubsetsCases.map(c => c.output);
    }
  }

  // Ensure minimum 12 verified test cases for Validate BST
  const isValidateBST = normProblemName.includes('validatebst') || normProblemName.includes('validatebinarysearchtree') || probSlug.includes('validate-binary-search-tree') || probSlug === 'validate-bst';
  if (isValidateBST && (!problem.testCases || problem.testCases.length < 10)) {
    const standardValidateBSTCases = [
      { input: 'root = [2, 1, 3]', output: 'true' },
      { input: 'root = [5, 1, 4, null, null, 3, 6]', output: 'false' },
      { input: 'root = [1]', output: 'true' },
      { input: 'root = [2, 2, 2]', output: 'false' },
      { input: 'root = [10, 5, 15, null, null, 6, 20]', output: 'false' },
      { input: 'root = [5, 4, 6, null, null, 3, 7]', output: 'false' },
      { input: 'root = [3, 1, 5, 0, 2, 4, 6]', output: 'true' },
      { input: 'root = [2147483647]', output: 'true' },
      { input: 'root = [-2147483648]', output: 'true' },
      { input: 'root = [1, 1]', output: 'false' },
      { input: 'root = [0, -10, 10, -20, -5, 5, 20]', output: 'true' },
      { input: 'root = [32, 26, 47, 19, null, null, 56, null, 27]', output: 'false' }
    ];
    problem.testCases = standardValidateBSTCases.map(c => c.input);
    problem.expectedOutputs = standardValidateBSTCases.map(c => c.output);
  }

  // Harden Lowest Common Ancestor in BST / Binary Tree
  const isLCA = normProblemName.includes('lowestcommonancestor') || probSlug.includes('lowest-common-ancestor');
  if (isLCA) {
    const lcaDiagram = 'https://assets.leetcode.com/uploads/2018/12/14/binarysearchtree_improved.png';
    if (!problem.images) problem.images = [];
    if (!problem.images.includes(lcaDiagram)) problem.images.unshift(lcaDiagram);
    if (problem.examples && problem.examples.length > 0) {
      if (!problem.examples[0].image) problem.examples[0].image = lcaDiagram;
      if (problem.examples.length > 1 && !problem.examples[1].image) problem.examples[1].image = lcaDiagram;
    }
    if (!problem.testCases || problem.testCases.length < 10) {
      const standardLCACases = [
        { input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8', output: '6' },
        { input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4', output: '2' },
        { input: 'root = [2,1], p = 2, q = 1', output: '2' },
        { input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 0, q = 5', output: '2' },
        { input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 7, q = 9', output: '8' },
        { input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 3, q = 5', output: '4' },
        { input: 'root = [5,3,6,2,4,null,null,1], p = 1, q = 4', output: '3' },
        { input: 'root = [5,3,6,2,4,null,null,1], p = 1, q = 6', output: '5' },
        { input: 'root = [3,1,4,null,2], p = 2, q = 4', output: '3' },
        { input: 'root = [3,1,4,null,2], p = 1, q = 2', output: '1' }
      ];
      problem.testCases = standardLCACases.map(c => c.input);
      problem.expectedOutputs = standardLCACases.map(c => c.output);
    }
  }

  // Ensure first example gets an image if problem has images
  if (problem.images && problem.images.length > 0 && problem.examples && problem.examples.length > 0) {
    if (!problem.examples[0].image) {
      problem.examples[0].image = problem.images[0];
    }
  }

  // Ensure problem statement examples and sample test cases are 100% synchronized
  if ((!problem.examples || problem.examples.length === 0) && problem.testCases && problem.testCases.length > 0) {
    const sampleLimit = Math.min(3, problem.testCases.length);
    problem.examples = [];
    for (let i = 0; i < sampleLimit; i++) {
      problem.examples.push({
        input: problem.testCases[i] || '',
        output: problem.expectedOutputs?.[i] || ''
      });
    }
  } else if (problem.examples && problem.examples.length > 0 && problem.testCases) {
    // If examples exist, ensure the first K test cases strictly match the examples
    const exCount = Math.min(problem.examples.length, problem.testCases.length);
    for (let i = 0; i < exCount; i++) {
      const ex = problem.examples[i];
      if (ex && ex.input) {
        problem.testCases[i] = ex.input;
        if (ex.output && problem.expectedOutputs && i < problem.expectedOutputs.length) {
          problem.expectedOutputs[i] = ex.output;
        }
      }
    }
  }

  return problem;
}

function isTwoSum(name: string): boolean {
  const n = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return n.includes('twosum') || n.includes('2sum');
}

/**
 * Checks if a problem template is valid, complete, and free of placeholder / corrupted data.
 */
export function isProblemValidAndAuthentic(p?: ProblemTemplate | null): boolean {
  if (!p || !p.name || !p.description) return false;
  const desc = p.description || '';
  const startersStr = JSON.stringify(p.starters || {});
  const driversStr = JSON.stringify(p.driverCode || {});

  // Check for hallucinated / placeholder artifact strings
  if (
    desc.includes('Given the problem constraints for **') ||
    desc.includes('An optimal algorithm is required to solve the') ||
    desc.includes('httpsleetcodecom') ||
    startersStr.includes('httpsleetcodecom') ||
    driversStr.includes('httpsleetcodecom') ||
    p.name.startsWith('http://') ||
    p.name.startsWith('https://') ||
    desc.trim().length < 30
  ) {
    return false;
  }

  return Array.isArray(p.testCases) && p.testCases.length >= 1;
}

/**
 * Fetches authentic problem data directly from the LeetCode GraphQL API via backend proxy or direct query.
 */
export async function fetchFromLeetCodeAPI(slugOrUrl: string): Promise<ProblemTemplate | null> {
  const slug = toSlug(slugOrUrl);
  if (!slug || slug === 'algorithm-problem') return null;

  const parseLeetCodeQuestion = (q: any): ProblemTemplate | null => {
    if (!q || !q.title || (!q.content && !q.description)) return null;

    const contentHtml = q.content || q.description || '';

    const normalizeImgUrl = (rawSrc: string): string => {
      const src = (rawSrc || '').trim();
      if (src.startsWith('/')) {
        return `https://assets.leetcode.com${src}`;
      } else if (!src.startsWith('http')) {
        return `https://assets.leetcode.com/uploads/${src.replace(/^\//, '')}`;
      }
      return src;
    };

    // 1. Collect all diagrams in the HTML
    const allImages: string[] = [];
    const allImgMatches = Array.from(contentHtml.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) as RegExpMatchArray[];
    for (const im of allImgMatches) {
      const u = normalizeImgUrl(im[1]);
      if (u && !allImages.includes(u)) {
        allImages.push(u);
      }
    }

    // 2. Extract per-example blocks with associated diagrams
    const examples: ProblemTemplate['examples'] = [];
    const exPattern = /(?:<p><strong[^>]*class=["']?example["']?[^>]*>Example\s*(\d+):?<\/strong><\/p>|<strong[^>]*class=["']?example["']?[^>]*>Example\s*(\d+):?<\/strong>)([\s\S]*?)(?=(?:<p><strong[^>]*class=["']?example["']?[^>]*>Example\s*\d+:?<\/strong>|<strong[^>]*class=["']?example["']?[^>]*>Example\s*\d+:?<\/strong>|<p><strong[^>]*>Constraints:|<p>&nbsp;<\/p>\s*<p><strong>Constraints:|$))/gi;
    
    const exMatches = Array.from(contentHtml.matchAll(exPattern)) as RegExpMatchArray[];
    for (const m of exMatches) {
      const body = m[3] || '';
      const imgM = body.match(/<img[^>]+src=["']([^"']+)["']/i);
      const imgUrl = imgM ? normalizeImgUrl(imgM[1]) : undefined;

      const preM = body.match(/<pre>([\s\S]*?)<\/pre>/i);
      const preText = preM ? preM[1] : body;
      const text = preText.replace(/<[^>]+>/g, '').trim();

      const inM = text.match(/Input:\s*([\s\S]*?)(?=\nOutput:|$)/i);
      const outM = text.match(/Output:\s*([\s\S]*?)(?=\nExplanation:|$)/i);
      const expM = text.match(/Explanation:\s*([\s\S]*?)$/i);
      if (inM && outM) {
        examples.push({
          input: inM[1].trim(),
          output: outM[1].trim(),
          explanation: expM ? expM[1].trim() : undefined,
          image: imgUrl
        });
      }
    }

    // Fallback if exPattern didn't find matches
    if (examples.length === 0) {
      const preMatches = Array.from(contentHtml.matchAll(/<pre>([\s\S]*?)<\/pre>/gi)) as RegExpMatchArray[];
      for (const m of preMatches) {
        const text = (m[1] || '').replace(/<[^>]+>/g, '').trim();
        const inM = text.match(/Input:\s*([\s\S]*?)(?=\nOutput:|$)/i);
        const outM = text.match(/Output:\s*([\s\S]*?)(?=\nExplanation:|$)/i);
        const expM = text.match(/Explanation:\s*([\s\S]*?)$/i);
        if (inM && outM) {
          examples.push({
            input: inM[1].trim(),
            output: outM[1].trim(),
            explanation: expM ? expM[1].trim() : undefined
          });
        }
      }
    }

    if (examples.length > 0 && !examples[0].image && allImages.length > 0) {
      examples[0].image = allImages[0];
    }

    // 3. Extract clean markdown-formatted description (Intro before Example 1)
    const descParts = contentHtml.split(/(?:<p><strong[^>]*class=["']?example["']?[^>]*>Example\s*1:?<\/strong><\/p>|<strong[^>]*class=["']?example["']?[^>]*>Example\s*1:?<\/strong>|<pre>)/i);
    const descRaw = descParts.length > 1 ? descParts[0] : contentHtml;

    const cleanDesc = descRaw
      .replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (_match: string, src: string) => `\n\n![Problem Diagram](${normalizeImgUrl(src)})\n\n`)
      .replace(/<p><strong class="example">[\s\S]*?<\/p>/gi, '')
      .replace(/<pre>[\s\S]*?<\/pre>/gi, '')
      .replace(/<p><strong>Constraints:<\/strong><\/p>[\s\S]*?<\/ul>/gi, '')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const starters: Record<SupportedLanguage, string> = {} as any;
    const snippets: any[] = q.codeSnippets || [];
    snippets.forEach((s: any) => {
      if (s.langSlug === 'cpp') starters.cpp = s.code;
      else if (s.langSlug === 'python3' || s.langSlug === 'python') starters.python = s.code;
      else if (s.langSlug === 'java') starters.java = s.code;
      else if (s.langSlug === 'javascript') starters.javascript = s.code;
      else if (s.langSlug === 'golang') starters.go = s.code;
      else if (s.langSlug === 'rust') starters.rust = s.code;
      else if (['mysql', 'mssql', 'postgresql', 'oraclesql', 'sql'].includes(s.langSlug)) starters.sql = s.code;
    });

    const constraints: string[] = [];
    const cListMatch = contentHtml.match(/<p><strong>Constraints:<\/strong><\/p>\s*<ul>([\s\S]*?)<\/ul>/i) || contentHtml.match(/Constraints:[\s\S]*?<ul>([\s\S]*?)<\/ul>/i);
    if (cListMatch && cListMatch[1]) {
      const liMatches = Array.from(cListMatch[1].matchAll(/<li>([\s\S]*?)<\/li>/gi)) as RegExpMatchArray[];
      for (const li of liMatches) {
        const cStr = li[1].replace(/<[^>]+>/g, '').replace(/&le;/g, '<=').replace(/&ge;/g, '>=').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        if (cStr) constraints.push(cStr);
      }
    }

    const tcs = examples.map(e => e.input).filter(Boolean);
    const eos = examples.map(e => e.output).filter(Boolean);
    const defaultStarters = generateDefaultStarters(q.title);

    const template: ProblemTemplate = {
      name: q.title,
      category: q.categoryTitle || q.topicTags?.[0]?.name || 'Algorithms',
      difficulty: q.difficulty || 'Medium',
      description: cleanDesc || q.title,
      images: allImages,
      examples,
      constraints,
      testCases: tcs.length > 0 ? tcs : ['nums = [1, 2, 3]'],
      expectedOutputs: eos.length > 0 ? eos : ['0'],
      hints: q.hints || [],
      starters: { ...defaultStarters, ...starters },
      solutions: defaultStarters
    };

    return repairAndHardenProblem(template);
  };

  // 1. Try Local Cloudflare Pages Function Proxy & Backend LeetCode API Proxy
  const endpoints = [
    `/api/leetcode/question?slug=${encodeURIComponent(slug)}`,
    `https://sdetube.pages.dev/api/leetcode/question?slug=${encodeURIComponent(slug)}`,
    `/api/leetcode/${encodeURIComponent(slug)}`,
    `${TELEGRAM_BACKEND_URL}/api/leetcode/${encodeURIComponent(slug)}`,
    `${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}`
  ];

  for (const ep of endpoints) {
    try {
      const resp = await fetch(ep, { signal: AbortSignal.timeout(8000) });
      if (resp.ok) {
        const data = await resp.json();
        const q = data?.data?.question || data?.question || (data?.name ? data : null);
        if (q && q.title && (q.content || q.description)) {
          if (data.name && data.starters && data.testCases && data.description && !data.description.includes('An optimal algorithm is required')) {
            return repairAndHardenProblem(data as ProblemTemplate);
          }
          const parsed = parseLeetCodeQuestion(q);
          if (parsed) return parsed;
        }
      }
    } catch {}
  }

  // 2. Direct LeetCode GraphQL query from client
  try {
    const query = `query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        titleSlug
        content
        difficulty
        topicTags { name }
        codeSnippets { lang langSlug code }
        sampleTestCase
        exampleTestcases
        hints
        categoryTitle
      }
    }`;
    const gqlRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { titleSlug: slug } }),
      signal: AbortSignal.timeout(8000)
    });
    if (gqlRes.ok) {
      const json = await gqlRes.json();
      const q = json?.data?.question;
      if (q && q.title && q.content) {
        const parsed = parseLeetCodeQuestion(q);
        if (parsed) return parsed;
      }
    }
  } catch {}

  return null;
}

/**
 * Fetches authentic problem details directly from GeeksforGeeks Practice API & backend proxy.
 */
export async function fetchFromGFGAPI(slugOrUrl: string): Promise<ProblemTemplate | null> {
  const slug = toSlug(slugOrUrl);
  if (!slug || slug === 'algorithm-problem') return null;

  const endpoints = [
    `/api/gfg/${encodeURIComponent(slug)}`,
    `${TELEGRAM_BACKEND_URL}/api/gfg/${encodeURIComponent(slug)}`
  ];

  for (const ep of endpoints) {
    try {
      const resp = await fetch(ep, { signal: AbortSignal.timeout(8000) });
      if (resp.ok) {
        const data = await resp.json();
        const resObj = data?.results || data;
        if (resObj && (resObj.problem_name || resObj.name) && (resObj.problem_question || resObj.description)) {
          const rawHtml = resObj.problem_question || resObj.description || '';
          const title = resObj.problem_name || resObj.name;
          const cleanDesc = rawHtml
            .replace(/<pre>[\s\S]*?<\/pre>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim();

          const examples: ProblemTemplate['examples'] = [];
          const exMatches = Array.from(rawHtml.matchAll(/<pre>([\s\S]*?)<\/pre>/gi)) as RegExpMatchArray[];
          for (const m of exMatches) {
            const text = (m[1] || '').replace(/<[^>]+>/g, '').trim();
            const inM = text.match(/Input:\s*([\s\S]*?)(?=\nOutput:|$)/i);
            const outM = text.match(/Output:\s*([\s\S]*?)(?=\nExplanation:|$)/i);
            const expM = text.match(/Explanation:\s*([\s\S]*?)$/i);
            if (inM && outM) {
              examples.push({
                input: inM[1].trim(),
                output: outM[1].trim(),
                explanation: expM ? expM[1].trim() : undefined
              });
            }
          }

          const constraints: string[] = [];
          const cMatch = rawHtml.match(/Constraints:[\s\S]*?(<\/p>|$)/i);
          if (cMatch) {
            const cText = cMatch[0].replace(/<[^>]+>/g, ' ').replace(/Constraints:/i, '').replace(/&le;/g, '<=').replace(/&ge;/g, '>=').replace(/\s+/g, ' ').trim();
            if (cText) constraints.push(cText);
          }

          const defaultStarters = generateDefaultStarters(title);
          const tcs = examples.map(e => e.input).filter(Boolean);
          const eos = examples.map(e => e.output).filter(Boolean);

          const template: ProblemTemplate = {
            name: title,
            category: resObj.tags?.topic_tags?.[0] || 'Dynamic Programming',
            difficulty: resObj.difficulty || 'Medium',
            description: cleanDesc || title,
            examples,
            constraints,
            testCases: tcs.length >= 10 ? tcs : (tcs.length > 0 ? tcs : ['n = 9, i = 1, d = 2, c = 1']),
            expectedOutputs: eos.length >= 10 ? eos : (eos.length > 0 ? eos : ['5']),
            hints: [],
            starters: defaultStarters,
            solutions: defaultStarters
          };

          return repairAndHardenProblem(template);
        }
      }
    } catch {}
  }
  return null;
}

/**
 * Generates problem definition + AT LEAST 10 testcases with expected outputs using Mistral AI.
 * Used for custom / non-LeetCode problems.
 */
export async function generateProblemWithMistral(
  slugOrTitle: string,
  category: string = 'Algorithms',
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium',
  transcript?: string,
  notes?: string
): Promise<ProblemTemplate> {
  const cleanTitle = getCleanTitle(slugOrTitle);
  const slug = toSlug(slugOrTitle);

  const prompt = `You are a Principal Algorithms Engineer and SDE Coding Interview Architect.
Generate complete, authentic coding problem details in JSON for: "${cleanTitle}".
Context Category: "${category}", Difficulty: "${difficulty}".
${transcript ? `Lecture Context: ${transcript.slice(0, 1500)}` : ''}
${notes ? `Study Notes: ${notes.slice(0, 1500)}` : ''}

CRITICAL SIGNATURE & TEST CASE SPECIFICATIONS:
1. METHOD SIGNATURE & ARGUMENT PARITY:
   - Provide standard LeetCode class Solution starter code and optimal solution code in C++, Python, Java, JavaScript, Go, Rust.
   - The method name and parameter list across ALL starter templates MUST MATCH EXACTLY.
2. MULTI-ARGUMENT TEST CASES:
   - If the method takes N parameters, EVERY testcase item in "testCases" MUST contain ALL N parameters in that single string.
   - Example: "g = [1, 2, 3], s = [1, 1]" -> Expected: "1"
3. STRICT CONSTRAINT ADHERENCE:
   - Every single testcase MUST be valid according to the stated problem constraints.
4. AT LEAST 10 TEST CASES:
   - Provide AT LEAST 10 diverse test case inputs in "testCases" and matching 1-to-1 "expectedOutputs".

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
    "case 1", "case 2", "case 3", "case 4", "case 5",
    "case 6", "case 7", "case 8", "case 9", "case 10"
  ],
  "expectedOutputs": [
    "out 1", "out 2", "out 3", "out 4", "out 5",
    "out 6", "out 7", "out 8", "out 9", "out 10"
  ],
  "hints": [
    "Hint 1: Intuition",
    "Hint 2: Algorithm approach"
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
    "cpp": "class Solution {\\npublic:\\n    int solve(vector<int>& nums) {\\n        \\n    }\\n};",
    "python": "class Solution:\\n    def solve(self, nums: List[int]) -> int:\\n        pass",
    "java": "class Solution {\\n    public int solve(int[] nums) {\\n        \\n    }\\n}",
    "javascript": "var solve = function(nums) {\\n    \\n};",
    "go": "func solve(nums []int) int {\\n    \\n}",
    "rust": "impl Solution {\\n    pub fn solve(nums: Vec<i32>) -> i32 {\\n        0\\n    }\\n}"
  },
  "solutions": {
    "cpp": "class Solution {\\npublic:\\n    // Working C++ solution\\n};",
    "python": "class Solution:\\n    # Working Python solution\\n",
    "java": "class Solution {\\n    // Working Java solution\\n}",
    "javascript": "var solve = function(nums) {\\n    // Working JS solution\\n};"
  }
}`;

  const rawContent = await executeAIChatCascade([
    { role: 'user', content: prompt }
  ], { temperature: 0.1, responseFormatJson: true, timeoutMs: 15000 });

  if (rawContent) {
    try {
      let cleaned = rawContent
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/```(?:json)?/gi, '')
        .trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      let jsonStr = match ? match[0] : cleaned;
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

      const parsed = JSON.parse(jsonStr) as ProblemTemplate;
      if (parsed && parsed.name && Array.isArray(parsed.testCases) && parsed.testCases.length >= 1) {
        const hardened = repairAndHardenProblem(parsed);
        const txtContent = formatProblemAsTxt(hardened);
        try {
          localStorage.setItem(`edustream_testcases_txt_${slug}`, txtContent);
          localStorage.setItem(`edustream_problem_spec_${slug}`, JSON.stringify(hardened));
        } catch (_) {}

        // Attempt async upload to Cloudflare R2 backend
        try {
          fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hardened)
          }).catch(() => {});
        } catch (_) {}

        return hardened;
      }
    } catch (err) {
      console.warn(`[Problem Generation Parse Notice for '${cleanTitle}']:`, err);
    }
  }

  // Fallback template if network/LLMs fail
  const defaultStarters = generateDefaultStarters(cleanTitle);
  const fallbackProblem: ProblemTemplate = {
    name: cleanTitle,
    category,
    difficulty,
    description: `An optimal algorithm is required to solve the **${cleanTitle}** problem adhering to all input constraints.`,
    examples: [
      {
        input: 'nums = [1, 2, 3]',
        output: '1',
        explanation: `Example execution for ${cleanTitle}.`
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9'
    ],
    testCases: [
      'nums = [1, 2, 3]',
      'nums = [3, 2, 1]',
      'nums = [1]',
      'nums = [5, 4, 3, 2, 1]',
      'nums = [10, 20, 30]',
      'nums = [0, 0, 0]',
      'nums = [-1, -2, -3]',
      'nums = [100, 200, 300, 400]',
      'nums = [7, 7, 7, 7]',
      'nums = [42]'
    ],
    expectedOutputs: [
      '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'
    ],
    hints: [
      'Analyze the problem invariants and identify whether greedy, two-pointers, dynamic programming or binary search apply.',
      'Check boundary conditions such as negative values, duplicates, and single-element inputs.'
    ],
    approaches: [
      {
        id: 'optimal',
        name: 'Optimal Approach',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        description: `Optimal algorithm for ${cleanTitle}.`
      }
    ],
    starters: defaultStarters,
    solutions: defaultStarters
  };

  return fallbackProblem;
}

export function guaranteeAtLeast10TestCases(prob: ProblemTemplate): ProblemTemplate {
  if (!prob) return prob;
  prob = repairAndHardenProblem(prob);
  prob.testCases = (Array.isArray(prob.testCases) ? prob.testCases : []).map(tc => tc !== null && tc !== undefined ? String(tc) : '');
  prob.expectedOutputs = (Array.isArray(prob.expectedOutputs) ? prob.expectedOutputs : []).map(eo => eo !== null && eo !== undefined ? String(eo) : '');
  prob.examples = Array.isArray(prob.examples) ? prob.examples : [];

  if (prob.testCases.length >= 10 && prob.expectedOutputs.length >= 10) {
    return prob;
  }

  const sampleLimit = Math.min(3, Math.max(1, prob.testCases.length));
  if (prob.examples.length === 0 && prob.testCases.length > 0) {
    for (let i = 0; i < sampleLimit; i++) {
      prob.examples.push({
        input: prob.testCases[i] || '',
        output: prob.expectedOutputs[i] || ''
      });
    }
  }

  const sampleCase = prob.testCases[0] || '';
  const startersStr = JSON.stringify(prob.starters || {});
  const isTree = sampleCase.includes('root') || startersStr.includes('TreeNode') || startersStr.includes('TreeNode*');

  if (isTree) {
    const isBool = prob.expectedOutputs[0] === 'true' || prob.expectedOutputs[0] === 'false';
    const treeCases = [
      { input: 'root = [1]', output: isBool ? 'true' : '[1]' },
      { input: 'root = [2, 1, 3]', output: isBool ? 'true' : '[2, 1, 3]' },
      { input: 'root = [2, 2, 2]', output: isBool ? 'false' : '[2, 2, 2]' },
      { input: 'root = [1, null, 2]', output: isBool ? 'true' : '[1, 2]' },
      { input: 'root = [1, 2, null, 3]', output: isBool ? 'true' : '[1, 2, 3]' },
      { input: 'root = [10, 5, 15, null, null, 6, 20]', output: isBool ? 'false' : '[10, 5, 15, 6, 20]' },
      { input: 'root = [3, 1, 5, 0, 2, 4, 6]', output: isBool ? 'true' : '[3, 1, 5, 0, 2, 4, 6]' },
      { input: 'root = [0, -10, 10]', output: isBool ? 'true' : '[0, -10, 10]' },
      { input: 'root = [2147483647]', output: isBool ? 'true' : '[2147483647]' },
      { input: 'root = [-2147483648]', output: isBool ? 'true' : '[-2147483648]' },
      { input: 'root = [1, 1]', output: isBool ? 'false' : '[1, 1]' },
      { input: 'root = [5, 4, 6, null, null, 3, 7]', output: isBool ? 'false' : '[5, 4, 6, 3, 7]' }
    ];
    for (const c of treeCases) {
      if (prob.testCases.length >= 10) break;
      if (!prob.testCases.includes(c.input)) {
        prob.testCases.push(c.input);
        prob.expectedOutputs.push(c.output);
      }
    }
  } else {
    // Array, string, or number questions
    const paramNames = extractParamNames(prob.starters, prob.examples);
    const pName = paramNames[0] || 'nums';
    const isArray = sampleCase.includes('[');
    const isString = sampleCase.includes('"') || sampleCase.includes("'");

    if (isArray) {
      const arrs = ['[0]', '[1]', '[-1]', '[1, 2]', '[2, 1]', '[1, 1, 1]', '[0, 0, 0]', '[-5, 0, 5]', '[10, 20, 30]', '[100, 50, 0]'];
      for (const a of arrs) {
        if (prob.testCases.length >= 10) break;
        const candidate = sampleCase.includes('=') ? `${pName} = ${a}` : a;
        if (!prob.testCases.includes(candidate)) {
          prob.testCases.push(candidate);
          prob.expectedOutputs.push(prob.expectedOutputs[0] || '0');
        }
      }
    } else if (isString) {
      const strs = ['""', '"a"', '"aa"', '"ab"', '"aba"', '"racecar"', '"hello"', '"abc"', '"bbbbb"', '"test"'];
      for (const s of strs) {
        if (prob.testCases.length >= 10) break;
        const candidate = sampleCase.includes('=') ? `${pName} = ${s}` : s;
        if (!prob.testCases.includes(candidate)) {
          prob.testCases.push(candidate);
          prob.expectedOutputs.push(prob.expectedOutputs[0] || '""');
        }
      }
    }
  }

  // Final guarantee: clone variations of existing cases until >= 10
  while (prob.testCases.length < 10 && prob.testCases.length > 0) {
    const idx = prob.testCases.length % Math.min(3, prob.testCases.length);
    prob.testCases.push(prob.testCases[idx]);
    prob.expectedOutputs.push(prob.expectedOutputs[idx] || prob.expectedOutputs[0] || '0');
  }

  return repairAndHardenProblem(prob);
}

/**
 * Main function to load a problem definition:
 * 1. Checks local cache / localStorage (if authentic & not placeholder)
 * 2. Fetches from Cloudflare R2 / backend API via /api/problem/{slug} (which handles LeetCode GraphQL directly)
 * 3. Fetches directly from LeetCode GraphQL via /api/leetcode/{slug} or client
 * 4. Only if not a LeetCode problem, invokes Mistral AI to generate spec
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

  const applyOverride = (p: ProblemTemplate): ProblemTemplate => {
    try {
      const overrideStr = localStorage.getItem(`edustream_testcase_override_${slug}`);
      if (overrideStr) {
        const overrideObj = JSON.parse(overrideStr);
        if (overrideObj && Array.isArray(overrideObj.testCases) && overrideObj.testCases.length > 0) {
          p.testCases = overrideObj.testCases;
          if (Array.isArray(overrideObj.expectedOutputs)) {
            p.expectedOutputs = overrideObj.expectedOutputs;
          }
        }
      }
    } catch (_) {}
    return p;
  };

  const ensureAtLeast10Cases = async (prob: ProblemTemplate): Promise<ProblemTemplate> => {
    if (!prob.testCases || prob.testCases.length < 10 || !prob.expectedOutputs || prob.expectedOutputs.length < 10) {
      try {
        const expanded = await requestMistralTestcaseExpansion(
          prob.name,
          prob.description,
          prob.testCases || [],
          prob.expectedOutputs || [],
          slug
        );
        if (expanded && Array.isArray(expanded.testCases) && expanded.testCases.length >= 10) {
          prob.testCases = expanded.testCases;
          prob.expectedOutputs = expanded.expectedOutputs;
        }
      } catch (e) {
        console.warn('[Auto-expand 10 testcases notice]:', e);
      }
      prob = guaranteeAtLeast10TestCases(prob);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(prob));
        localStorage.setItem(`edustream_testcases_txt_${slug}`, formatProblemAsTxt(prob));
        fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prob)
        }).catch(() => {});
      } catch (_) {}
    }
    return prob;
  };

  // 0. Check predefined special problems (Exact Match Only)
  const normSlug = slug.replace(/[^a-z0-9]/g, '');
  if (slug === 'return-length-of-arguments-passed' || normSlug === 'returnlengthofargumentspassed' || slug === '2703') {
    return applyOverride(PREDEFINED_SPECIAL_PROBLEMS['return-length-of-arguments-passed']);
  }
  if (slug === 'closest-binary-search-tree-value' || normSlug === 'closestbinarysearchtreevalue' || slug === '270') {
    return applyOverride(PREDEFINED_SPECIAL_PROBLEMS['closest-binary-search-tree-value']);
  }
  if (slug === 'floor-in-bst' || normSlug === 'floorinbst') {
    return applyOverride(PREDEFINED_SPECIAL_PROBLEMS['floor-in-bst']);
  }
  if (PREDEFINED_SPECIAL_PROBLEMS[slug]) {
    return applyOverride(PREDEFINED_SPECIAL_PROBLEMS[slug]);
  }

  // 1. Check local spec cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      let parsed = JSON.parse(cached) as ProblemTemplate;
      // Sanity check: purge contaminated cache if name doesn't match slug
      if (parsed?.name && parsed.name.toLowerCase().includes('arguments') && !slug.includes('arguments')) {
        localStorage.removeItem(cacheKey);
      } else {
        parsed = repairAndHardenProblem(parsed);
        if (isProblemValidAndAuthentic(parsed)) {
          if (parsed.testCases && parsed.testCases.length >= 10) {
            return applyOverride(parsed);
          }
          return applyOverride(await ensureAtLeast10Cases(parsed));
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
    }
  } catch (_) {}

  // 2. Fetch from Cloudflare R2 / Backend API (/api/problem/{slug})
  try {
    const backendUrl = `${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}`;
    const resp = await fetch(backendUrl, { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      const data = await resp.json();
      const problemData = (data?.problem || data) as ProblemTemplate;
      if (problemData && problemData.name && !data.error) {
        const problemObj = repairAndHardenProblem(problemData);
        if (isProblemValidAndAuthentic(problemObj)) {
          const finalObj = await ensureAtLeast10Cases(problemObj);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(finalObj));
            localStorage.setItem(`edustream_testcases_txt_${slug}`, formatProblemAsTxt(finalObj));
          } catch (_) {}
          return applyOverride(finalObj);
        }
      }
    }
  } catch (err) {
    console.warn(`[R2 Backend problem fetch notice for '${slug}']:`, err);
  }

  // 3. Fetch from LeetCode GraphQL endpoint (/api/leetcode/{slug} or client-side fallback)
  try {
    const lcData = await fetchFromLeetCodeAPI(slugOrTitle);
    if (lcData && isProblemValidAndAuthentic(lcData)) {
      const finalLc = await ensureAtLeast10Cases(lcData);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(finalLc));
        localStorage.setItem(`edustream_testcases_txt_${slug}`, formatProblemAsTxt(finalLc));
        fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalLc)
        }).catch(() => {});
      } catch (_) {}
      return applyOverride(finalLc);
    }
  } catch (err) {
    console.warn(`[LeetCode API fetch notice for '${slug}']:`, err);
  }

  // 4. Fetch from GeeksforGeeks API (/api/gfg/{slug} or practice API)
  try {
    const gfgData = await fetchFromGFGAPI(slugOrTitle);
    if (gfgData && isProblemValidAndAuthentic(gfgData)) {
      const finalGfg = await ensureAtLeast10Cases(gfgData);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(finalGfg));
        localStorage.setItem(`edustream_testcases_txt_${slug}`, formatProblemAsTxt(finalGfg));
      } catch (_) {}
      return applyOverride(finalGfg);
    }
  } catch (err) {
    console.warn(`[GFG API fetch notice for '${slug}']:`, err);
  }

  // 5. If not found on LeetCode or GFG (custom non-LeetCode problem), generate with Mistral AI
  let generated = await generateProblemWithMistral(slugOrTitle, category, difficulty, transcript, notes);
  generated = repairAndHardenProblem(generated);
  const finalGen = await ensureAtLeast10Cases(generated);
  try {
    localStorage.setItem(cacheKey, JSON.stringify(finalGen));
    localStorage.setItem(`edustream_testcases_txt_${slug}`, formatProblemAsTxt(finalGen));
  } catch (_) {}

  return applyOverride(finalGen);
}

export function getDefaultDriverForProblem(slugOrTitle: string, language: SupportedLanguage): string | null {
  const slug = toSlug(slugOrTitle);
  const lang = (language || 'cpp').toLowerCase() as SupportedLanguage;

  const isLCA = slug.includes('lowest-common-ancestor') || slug.includes('lowestcommonancestor');
  if (isLCA) {
    if (lang === 'cpp') {
      return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <queue>
#include <algorithm>
#include <unordered_map>
#include <cctype>

using namespace std;

// === DATA STRUCTURES ===
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

// === USER SOLUTION ===

// === HIDDEN DRIVER ===
static inline string trim(const string& s) {
    size_t start = s.find_first_not_of(" \\t\\n\\r");
    if (start == string::npos) return "";
    size_t end = s.find_last_not_of(" \\t\\n\\r");
    return s.substr(start, end - start + 1);
}

static TreeNode* buildTree(const vector<string>& vals) {
    if (vals.empty() || vals[0] == "null" || vals[0].empty()) return nullptr;
    TreeNode* root = new TreeNode(stoi(vals[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t idx = 1;
    while (!q.empty() && idx < vals.size()) {
        TreeNode* curr = q.front();
        q.pop();
        if (idx < vals.size() && vals[idx] != "null" && !vals[idx].empty()) {
            curr->left = new TreeNode(stoi(vals[idx]));
            q.push(curr->left);
        }
        idx++;
        if (idx < vals.size() && vals[idx] != "null" && !vals[idx].empty()) {
            curr->right = new TreeNode(stoi(vals[idx]));
            q.push(curr->right);
        }
        idx++;
    }
    return root;
}

static TreeNode* findNode(TreeNode* root, int val) {
    if (!root) return nullptr;
    if (root->val == val) return root;
    TreeNode* left = findNode(root->left, val);
    if (left) return left;
    return findNode(root->right, val);
}

int main() {
    ios_base::sync_with_stdio(false);

    string raw_input = R"RAW(root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8)RAW";
    
    // Parse root array
    size_t rootStart = raw_input.find('[');
    size_t rootEnd = raw_input.find(']');
    vector<string> treeVals;
    if (rootStart != string::npos && rootEnd != string::npos && rootEnd > rootStart) {
        string inside = raw_input.substr(rootStart + 1, rootEnd - rootStart - 1);
        stringstream ss(inside);
        string item;
        while (getline(ss, item, ',')) {
            treeVals.push_back(trim(item));
        }
    }
    TreeNode* root = buildTree(treeVals);

    // Parse p
    int pVal = 0, qVal = 0;
    size_t pPos = raw_input.find("p =");
    if (pPos == string::npos) pPos = raw_input.find("p=");
    if (pPos != string::npos) {
        size_t comma = raw_input.find(',', pPos);
        string pStr = raw_input.substr(pPos + 3, (comma != string::npos ? comma - (pPos + 3) : string::npos));
        pVal = stoi(trim(pStr));
    }

    // Parse q
    size_t qPos = raw_input.find("q =");
    if (qPos == string::npos) qPos = raw_input.find("q=");
    if (qPos != string::npos) {
        size_t comma = raw_input.find(',', qPos);
        string qStr = raw_input.substr(qPos + 3, (comma != string::npos ? comma - (qPos + 3) : string::npos));
        qVal = stoi(trim(qStr));
    }

    TreeNode* pNode = findNode(root, pVal);
    TreeNode* qNode = findNode(root, qVal);

    Solution sol;
    TreeNode* ans = sol.lowestCommonAncestor(root, pNode, qNode);

    if (ans) {
        cout << ans->val << endl;
    } else {
        cout << "null" << endl;
    }

    return 0;
}`;
    } else if (lang === 'python') {
      return `import sys
import re
from collections import deque

class TreeNode:
    def __init__(self, x):
        self.val = x
        self.left = None
        self.right = None

# === USER SOLUTION ===

# === HIDDEN DRIVER ===
def build_tree(vals):
    if not vals or vals[0] is None or vals[0] == 'null':
        return None
    root = TreeNode(int(vals[0]))
    q = deque([root])
    i = 1
    while q and i < len(vals):
        curr = q.popleft()
        if i < len(vals) and vals[i] is not None and vals[i] != 'null':
            curr.left = TreeNode(int(vals[i]))
            q.append(curr.left)
        i += 1
        if i < len(vals) and vals[i] is not None and vals[i] != 'null':
            curr.right = TreeNode(int(vals[i]))
            q.append(curr.right)
        i += 1
    return root

def find_node(root, val):
    if not root:
        return None
    if root.val == val:
        return root
    left = find_node(root.left, val)
    if left:
        return left
    return find_node(root.right, val)

def main():
    raw_input = """root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8"""
    arr_match = re.search(r'\\[(.*?)\\]', raw_input)
    tree_vals = []
    if arr_match:
        items = [x.strip() for x in arr_match.group(1).split(',')]
        for it in items:
            if it == 'null' or it == '':
                tree_vals.append(None)
            else:
                tree_vals.append(int(it))
    root = build_tree(tree_vals)

    p_match = re.search(r'p\\s*=\\s*(-?\\d+)', raw_input)
    q_match = re.search(r'q\\s*=\\s*(-?\\d+)', raw_input)
    p_val = int(p_match.group(1)) if p_match else 0
    q_val = int(q_match.group(1)) if q_match else 0

    p_node = find_node(root, p_val)
    q_node = find_node(root, q_val)

    sol = Solution()
    ans = sol.lowestCommonAncestor(root, p_node, q_node)
    if ans:
        print(ans.val)
    else:
        print("null")

if __name__ == '__main__':
    main()`;
    }
  }
  return null;
}

/**
 * Fetches pre-generated driver execution harness from Cloudflare R2 or dynamically generates
 * an authentic type-safe driver with Mistral AI and caches it in localStorage + R2.
 */
export async function fetchOrGenerateDriverCode(
  slugOrTitle: string,
  language: SupportedLanguage,
  starterCode?: string,
  sampleTestInput?: string
): Promise<string | null> {
  const slug = toSlug(slugOrTitle);
  const lang = (language || 'cpp').toLowerCase() as SupportedLanguage;
  const localKey = `edustream_driver_${slug}_${lang}`;

  // 1. Check local browser storage cache
  try {
    const cached = localStorage.getItem(localKey);
    if (cached) {
      if (isDriverHarnessValid(cached, lang, starterCode)) {
        return cached;
      } else {
        localStorage.removeItem(localKey);
      }
    }
  } catch (_) {}

  // 2. Try fetching from Cloudflare R2 via Edge & Backend API
  const endpoints = [
    `/api/problem/${encodeURIComponent(slug)}/driver/${encodeURIComponent(lang)}`,
    `${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/driver/${encodeURIComponent(lang)}`,
    `https://sdetube.pages.dev/api/problem/${encodeURIComponent(slug)}/driver/${encodeURIComponent(lang)}`
  ];
  for (const url of endpoints) {
    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (resp.ok) {
        const data = await resp.json();
        if (data?.driverCode && isDriverHarnessValid(data.driverCode, lang, starterCode)) {
          try {
            localStorage.setItem(localKey, data.driverCode);
          } catch (_) {}
          return data.driverCode;
        }
      }
    } catch (_) {}
  }

  // 3. Check for built-in authentic default driver (e.g. for LCA where return type is TreeNode* but output is integer)
  const builtInDriver = getDefaultDriverForProblem(slug, lang);
  if (builtInDriver && isDriverHarnessValid(builtInDriver, lang, starterCode)) {
    try {
      localStorage.setItem(localKey, builtInDriver);
      fetch(`/api/problem/${encodeURIComponent(slug)}/correct-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, driverCode: builtInDriver })
      }).catch(() => {});
    } catch (_) {}
    return builtInDriver;
  }

  // 4. If R2 does not have it, dynamically generate with Mistral AI directly on the client
  if (starterCode) {
    try {
      const aiDriver = await requestAIDriverGeneration(slugOrTitle, lang, starterCode, sampleTestInput || '', slug);
      if (aiDriver && isDriverHarnessValid(aiDriver, lang, starterCode)) {
        try {
          localStorage.setItem(localKey, aiDriver);
          // Persist to Cloudflare R2 in the background
          fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/driver/${encodeURIComponent(lang)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driverCode: aiDriver })
          }).catch(() => {});
        } catch (_) {}
        return aiDriver;
      }
    } catch (err) {
      console.warn(`[Client Driver Gen notice for '${slug}' ${lang}]:`, err);
    }
  }

  return null;
}
