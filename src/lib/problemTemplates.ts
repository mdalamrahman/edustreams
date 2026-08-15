import { SupportedLanguage } from './compiler';

export interface ProblemTemplate {
  name: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  testCases: string[];
  expectedOutputs?: string[];
  starters: Record<SupportedLanguage, string>;
}

// Helper to normalize problem names for matching
export const normalizeProblemTitle = (title: string): string => {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Handcrafted specific templates for core SDE sheet problems matching exact LeetCode clean signatures
export const SPECIFIC_TEMPLATES: Record<string, Partial<ProblemTemplate>> = {
  'setmatrixzeroes': {
    name: 'Set Matrix Zeroes',
    category: 'Arrays',
    difficulty: 'Medium',
    description: 'Given an m x n integer matrix matrix, if an element is 0, set its entire row and column to 0\'s. You must do it in place without allocating auxiliary 2D matrix memory.',
    examples: [
      {
        input: 'matrix = [[1,1,1],[1,0,1],[1,1,1]]',
        output: '[[1,0,1],[0,0,0],[1,0,1]]',
        explanation: 'Element at (1,1) is 0, so entire row 1 and column 1 are set to 0.'
      },
      {
        input: 'matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]',
        output: '[[0,0,0,0],[0,4,5,0],[0,3,1,0]]'
      }
    ],
    constraints: [
      'm == matrix.length',
      'n == matrix[0].length',
      '1 <= m, n <= 200',
      '-2^31 <= matrix[i][j] <= 2^31 - 1'
    ],
    testCases: [
      'matrix = [[1,1,1],[1,0,1],[1,1,1]]',
      'matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]',
      'matrix = [[1,0],[2,7]]'
    ],
    expectedOutputs: [
      '[[1,0,1],[0,0,0],[1,0,1]]',
      '[[0,0,0,0],[0,4,5,0],[0,3,1,0]]',
      '[[0,0],[2,0]]'
    ],
    starters: {
      cpp: `class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        
    }
};`,
      python: `class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        """
        Do not return anything, modify matrix in-place instead.
        """
        pass`,
      java: `class Solution {
    public void setZeroes(int[][] matrix) {
        
    }
}`,
      javascript: `/**
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
var setZeroes = function(matrix) {
    
};`,
      go: `func setZeroes(matrix [][]int) {
    
}`,
      rust: `impl Solution {
    pub fn set_zeroes(matrix: &mut Vec<Vec<i32>>) {
        
    }
}`,
      sql: `-- Set Matrix Zeroes is an in-place array challenge.`
    }
  },

  'pascalstriangle': {
    name: "Pascal's Triangle",
    category: 'Arrays',
    difficulty: 'Easy',
    description: 'Given an integer numRows, return the first numRows of Pascal\'s triangle. In Pascal\'s triangle, each number is the sum of the two numbers directly above it.',
    examples: [
      {
        input: 'numRows = 5',
        output: '[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]'
      },
      {
        input: 'numRows = 1',
        output: '[[1]]'
      }
    ],
    constraints: [
      '1 <= numRows <= 30'
    ],
    testCases: [
      'numRows = 5',
      'numRows = 1',
      'numRows = 4'
    ],
    expectedOutputs: [
      '[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]',
      '[[1]]',
      '[[1],[1,1],[1,2,1],[1,3,3,1]]'
    ],
    starters: {
      cpp: `class Solution {
public:
    vector<vector<int>> generate(int numRows) {
        
    }
};`,
      python: `class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        pass`,
      java: `class Solution {
    public List<List<Integer>> generate(int numRows) {
        
    }
}`,
      javascript: `/**
 * @param {number} numRows
 * @return {number[][]}
 */
var generate = function(numRows) {
    
};`,
      go: `func generate(numRows int) [][]int {
    
}`,
      rust: `impl Solution {
    pub fn generate(num_rows: i32) -> Vec<Vec<i32>> {
        
    }
}`,
      sql: `-- Pascal's Triangle algorithmic challenge.`
    }
  },

  'twosum': {
    name: 'Two Sum',
    category: 'Arrays',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    testCases: [
      'nums = [2, 7, 11, 15], target = 9',
      'nums = [3, 2, 4], target = 6',
      'nums = [3, 3], target = 6'
    ],
    expectedOutputs: [
      '[0,1]',
      '[1,2]',
      '[0,1]'
    ],
    starters: {
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    
};`,
      go: `func twoSum(nums []int, target int) []int {
    
}`,
      rust: `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        
    }
}`,
      sql: `-- Two Sum is an algorithmic challenge.`
    }
  },

  'maximumsubarray': {
    name: 'Maximum Subarray (Kadane)',
    category: 'Arrays',
    difficulty: 'Medium',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
      },
      {
        input: 'nums = [1]',
        output: '1'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    testCases: [
      'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
      'nums = [1]',
      'nums = [5, 4, -1, 7, 8]'
    ],
    expectedOutputs: [
      '6',
      '1',
      '23'
    ],
    starters: {
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        
    }
};`,
      python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        pass`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        
    }
}`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    
};`,
      go: `func maxSubArray(nums []int) int {
    
}`,
      rust: `impl Solution {
    pub fn max_sub_array(nums: Vec<i32>) -> i32 {
        
    }
}`,
      sql: `-- Maximum Subarray algorithmic challenge.`
    }
  }
};

// Dynamic Template Generator for all SDE problems
export const getProblemTemplate = (
  problemTitle: string,
  category: string = 'Arrays',
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'
): ProblemTemplate => {
  const norm = normalizeProblemTitle(problemTitle);
  
  if (SPECIFIC_TEMPLATES[norm]) {
    const t = SPECIFIC_TEMPLATES[norm];
    return {
      name: t.name || problemTitle,
      category: t.category || category,
      difficulty: t.difficulty || difficulty,
      description: t.description || `Given the problem requirements for ${problemTitle}, implement an optimal solution with minimum time and auxiliary space complexity.`,
      examples: t.examples || [
        { input: `nums = [1, 2, 3, 4, 5]`, output: `Expected Result` }
      ],
      constraints: t.constraints || [
        '1 <= input.length <= 10^5',
        '-10^9 <= value <= 10^9',
        'Time Complexity: Optimal',
        'Space Complexity: In-place or O(N)'
      ],
      testCases: t.testCases || [`nums = [1, 2, 3, 4, 5]`],
      expectedOutputs: t.expectedOutputs || [`Result`],
      starters: t.starters || getDynamicStarters(problemTitle, category)
    };
  }

  return generateDynamicTemplate(problemTitle, category, difficulty);
};

function generateDynamicTemplate(
  name: string,
  category: string,
  difficulty: 'Easy' | 'Medium' | 'Hard'
): ProblemTemplate {
  const cleanName = name.replace(/\.(mp4|mkv)$/i, '').replace(/_/g, ' ');
  const camelName = cleanName
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .map((w, idx) => idx === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('') || 'solve';

  const isArray = category.toLowerCase().includes('array') || category.toLowerCase().includes('search');
  const isString = category.toLowerCase().includes('string');
  const isTree = category.toLowerCase().includes('tree');
  const isList = category.toLowerCase().includes('list');
  const isGraph = category.toLowerCase().includes('graph');

  let sampleInput = 'nums = [1, 2, 3, 4, 5]';
  let sampleOutput = '[1, 2, 3, 4, 5]';
  let testCases = [
    'nums = [1, 2, 3, 4, 5]',
    'nums = [10, 20, 30, 40]',
    'nums = [0]'
  ];

  let cppSig = `    void ${camelName}(vector<int>& nums) {\n        \n    }`;
  let pySig = `    def ${camelName}(self, nums: List[int]) -> any:\n        pass`;
  let javaSig = `    public void ${camelName}(int[] nums) {\n        \n    }`;
  let jsSig = `var ${camelName} = function(nums) {\n    \n};`;

  if (isString) {
    sampleInput = 's = "babad"';
    sampleOutput = '"bab"';
    testCases = ['s = "babad"', 's = "cbbd"', 's = "a"'];
    cppSig = `    string ${camelName}(string s) {\n        \n    }`;
    pySig = `    def ${camelName}(self, s: str) -> str:\n        pass`;
    javaSig = `    public String ${camelName}(String s) {\n        \n    }`;
    jsSig = `var ${camelName} = function(s) {\n    \n};`;
  } else if (isTree) {
    sampleInput = 'root = [3,9,20,null,null,15,7]';
    sampleOutput = '3';
    testCases = ['root = [3,9,20,null,null,15,7]', 'root = [1,null,2]', 'root = []'];
    cppSig = `    int ${camelName}(TreeNode* root) {\n        \n    }`;
    pySig = `    def ${camelName}(self, root: Optional[TreeNode]) -> int:\n        pass`;
    javaSig = `    public int ${camelName}(TreeNode root) {\n        \n    }`;
    jsSig = `var ${camelName} = function(root) {\n    \n};`;
  } else if (isList) {
    sampleInput = 'head = [1,2,3,4,5]';
    sampleOutput = '[5,4,3,2,1]';
    testCases = ['head = [1,2,3,4,5]', 'head = [1,2]', 'head = []'];
    cppSig = `    ListNode* ${camelName}(ListNode* head) {\n        \n    }`;
    pySig = `    def ${camelName}(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        pass`;
    javaSig = `    public ListNode ${camelName}(ListNode head) {\n        \n    }`;
    jsSig = `var ${camelName} = function(head) {\n    \n};`;
  }

  const starters: Record<SupportedLanguage, string> = {
    cpp: `class Solution {\npublic:\n${cppSig}\n};`,
    python: `class Solution:\n${pySig}`,
    java: `class Solution {\n${javaSig}\n}`,
    javascript: `/**\n * @param {any} input\n * @return {any}\n */\n${jsSig}`,
    go: `func ${camelName}() {\n    \n}`,
    rust: `impl Solution {\n    pub fn ${camelName}() {\n        \n    }\n}`,
    sql: `-- SDETube SQL Arena: ${cleanName}\nSELECT 1 AS result;\n`
  };

  return {
    name: cleanName,
    category,
    difficulty,
    description: `Given the input constraints for ${cleanName}, implement the most optimal algorithmic approach. Analyze both Time Complexity and Space Complexity.`,
    examples: [
      {
        input: sampleInput,
        output: sampleOutput,
        explanation: `Standard interview testcase for ${cleanName}.`
      }
    ],
    constraints: [
      '1 <= input.length <= 10^5',
      '-10^9 <= values <= 10^9',
      'Follow optimal Time & Space boundaries'
    ],
    testCases,
    expectedOutputs: [sampleOutput],
    starters
  };
}

function getDynamicStarters(name: string, category: string): Record<SupportedLanguage, string> {
  return generateDynamicTemplate(name, category, 'Medium').starters;
}
