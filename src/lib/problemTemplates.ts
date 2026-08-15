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
  starters: Record<SupportedLanguage, string>;
}

// Helper to normalize problem names for matching
export const normalizeProblemTitle = (title: string): string => {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Handcrafted specific templates for core SDE sheet problems
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
    starters: {
      python: `# SDETube LeetCode Arena: Set Matrix Zeroes
class Solution:
    def setZeroes(self, matrix: list[list[int]]) -> None:
        """
        Do not return anything, modify matrix in-place instead.
        Optimal Time Complexity: O(M * N)
        Optimal Space Complexity: O(1)
        """
        m, n = len(matrix), len(matrix[0])
        first_row_zero = any(matrix[0][j] == 0 for j in range(n))
        first_col_zero = any(matrix[i][0] == 0 for i in range(m))

        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][j] == 0:
                    matrix[i][0] = 0
                    matrix[0][j] = 0

        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][0] == 0 or matrix[0][j] == 0:
                    matrix[i][j] = 0

        if first_row_zero:
            for j in range(n):
                matrix[0][j] = 0

        if first_col_zero:
            for i in range(m):
                matrix[i][0] = 0

# Test Execution
if __name__ == "__main__":
    sol = Solution()
    mat = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
    print("Initial Matrix:", mat)
    sol.setZeroes(mat)
    print("Result Matrix: ", mat)
`,
      cpp: `// SDETube LeetCode Arena: Set Matrix Zeroes
#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size();
        int n = matrix[0].size();
        bool col0 = false;

        for (int i = 0; i < m; i++) {
            if (matrix[i][0] == 0) col0 = true;
            for (int j = 1; j < n; j++) {
                if (matrix[i][j] == 0) {
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }

        for (int i = m - 1; i >= 0; i--) {
            for (int j = n - 1; j >= 1; j--) {
                if (matrix[i][0] == 0 || matrix[0][j] == 0) {
                    matrix[i][j] = 0;
                }
            }
            if (col0) matrix[i][0] = 0;
        }
    }
};

int main() {
    Solution sol;
    vector<vector<int>> matrix = {{1, 1, 1}, {1, 0, 1}, {1, 1, 1}};
    cout << "Input: [[1,1,1],[1,0,1],[1,1,1]]" << endl;
    sol.setZeroes(matrix);
    cout << "Success: Matrix Zeroes processed in-place." << endl;
    return 0;
}
`,
      java: `import java.util.*;

public class Solution {
    public void setZeroes(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        boolean col0 = false;
        for (int i = 0; i < m; i++) {
            if (matrix[i][0] == 0) col0 = true;
            for (int j = 1; j < n; j++) {
                if (matrix[i][j] == 0) {
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }
        for (int i = m - 1; i >= 0; i--) {
            for (int j = n - 1; j >= 1; j--) {
                if (matrix[i][0] == 0 || matrix[0][j] == 0) matrix[i][j] = 0;
            }
            if (col0) matrix[i][0] = 0;
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        int[][] mat = {{1, 1, 1}, {1, 0, 1}, {1, 1, 1}};
        sol.setZeroes(mat);
        System.out.println("Execution success for Set Matrix Zeroes.");
    }
}
`,
      javascript: `/**
 * SDETube LeetCode Arena: Set Matrix Zeroes
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
var setZeroes = function(matrix) {
    let m = matrix.length, n = matrix[0].length;
    let col0 = false;
    for (let i = 0; i < m; i++) {
        if (matrix[i][0] === 0) col0 = true;
        for (let j = 1; j < n; j++) {
            if (matrix[i][j] === 0) {
                matrix[i][0] = 0;
                matrix[0][j] = 0;
            }
        }
    }
    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 1; j--) {
            if (matrix[i][0] === 0 || matrix[0][j] === 0) matrix[i][j] = 0;
        }
        if (col0) matrix[i][0] = 0;
    }
};

let mat = [[1, 1, 1], [1, 0, 1], [1, 1, 1]];
setZeroes(mat);
console.log("Output matrix:", JSON.stringify(mat));
`,
      go: `package main

import "fmt"

func setZeroes(matrix [][]int) {
    m, n := len(matrix), len(matrix[0])
    col0 := false
    for i := 0; i < m; i++ {
        if matrix[i][0] == 0 {
            col0 = true
        }
        for j := 1; j < n; j++ {
            if matrix[i][j] == 0 {
                matrix[i][0] = 0
                matrix[0][j] = 0
            }
        }
    }
    for i := m - 1; i >= 0; i-- {
        for j := n - 1; j >= 1; j-- {
            if matrix[i][0] == 0 || matrix[0][j] == 0 {
                matrix[i][j] = 0
            }
        }
        if col0 {
            matrix[i][0] = 0
        }
    }
}

func main() {
    mat := [][]int{{1, 1, 1}, {1, 0, 1}, {1, 1, 1}}
    setZeroes(mat)
    fmt.Println("Result:", mat)
}
`,
      rust: `struct Solution;

impl Solution {
    pub fn set_zeroes(matrix: &mut Vec<Vec<i32>>) {
        let m = matrix.len();
        let n = matrix[0].len();
        let mut col0 = false;
        for i in 0..m {
            if matrix[i][0] == 0 { col0 = true; }
            for j in 1..n {
                if matrix[i][j] == 0 {
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }
        for i in (0..m).rev() {
            for j in (1..n).rev() {
                if matrix[i][0] == 0 || matrix[0][j] == 0 { matrix[i][j] = 0; }
            }
            if col0 { matrix[i][0] = 0; }
        }
    }
}

fn main() {
    let mut mat = vec![vec![1, 1, 1], vec![1, 0, 1], vec![1, 1, 1]];
    Solution::set_zeroes(&mut mat);
    println!("Matrix solved successfully.");
}
`,
      sql: `-- Set Matrix Zeroes is an in-memory algorithmic challenge.`
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
    starters: {
      python: `# SDETube LeetCode Arena: Two Sum
class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []

if __name__ == "__main__":
    sol = Solution()
    print("Result:", sol.twoSum([2, 7, 11, 15], 9))
`,
      cpp: `// SDETube LeetCode Arena: Two Sum
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.find(complement) != seen.end()) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};

int main() {
    Solution sol;
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> res = sol.twoSum(nums, target);
    cout << "Indices: [" << res[0] << ", " << res[1] << "]" << endl;
    return 0;
}
`,
      java: `import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (seen.containsKey(comp)) {
                return new int[] { seen.get(comp), i };
            }
            seen.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] res = sol.twoSum(new int[]{2, 7, 11, 15}, 9);
        System.out.println("Result: [" + res[0] + ", " + res[1] + "]");
    }
}
`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (seen.has(comp)) return [seen.get(comp), i];
        seen.set(nums[i], i);
    }
    return [];
};

console.log("Result:", twoSum([2, 7, 11, 15], 9));
`,
      go: `package main

import "fmt"

func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        comp := target - num
        if idx, ok := seen[comp]; ok {
            return []int{idx, i}
        }
        seen[num] = i
    }
    return nil
}

func main() {
    fmt.Println("Result:", twoSum([]int{2, 7, 11, 15}, 9))
}
`,
      rust: `use std::collections::HashMap;

struct Solution;

impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        let mut seen = HashMap::new();
        for (i, &num) in nums.iter().enumerate() {
            let comp = target - num;
            if let Some(&idx) = seen.get(&comp) {
                return vec![idx as i32, i as i32];
            }
            seen.insert(num, i);
        }
        vec![]
    }
}

fn main() {
    println!("Result: {:?}", Solution::two_sum(vec![2, 7, 11, 15], 9));
}
`,
      sql: `-- Two Sum is an algorithmic challenge.`
    }
  }
};

// Dynamic Template Generator for any SDE problem
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
        { input: `input_data = [example_1]`, output: `expected_result_1` }
      ],
      constraints: t.constraints || [
        '1 <= input.length <= 10^5',
        '-10^9 <= value <= 10^9',
        'Time Complexity: Optimal',
        'Space Complexity: In-place or O(N)'
      ],
      testCases: t.testCases || [`input = standard_test_case_1`],
      starters: t.starters || getDynamicStarters(problemTitle, category)
    };
  }

  // Derive dynamic signature based on problem name and category
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
    .join('');

  const isArray = category.toLowerCase().includes('array') || category.toLowerCase().includes('search');
  const isString = category.toLowerCase().includes('string');
  const isTree = category.toLowerCase().includes('tree');
  const isList = category.toLowerCase().includes('list');
  const isGraph = category.toLowerCase().includes('graph');

  let sampleInput = 'nums = [1, 2, 3, 4, 5]';
  let sampleOutput = 'Result';
  let testCases = [
    'nums = [1, 2, 3, 4, 5]',
    'nums = [10, 20, 30, 40]',
    'nums = [0]'
  ];

  if (isString) {
    sampleInput = 's = "babad"';
    sampleOutput = '"bab"';
    testCases = ['s = "babad"', 's = "cbbd"', 's = "a"'];
  } else if (isTree) {
    sampleInput = 'root = [3,9,20,null,null,15,7]';
    sampleOutput = '3';
    testCases = ['root = [3,9,20,null,null,15,7]', 'root = [1,null,2]', 'root = []'];
  } else if (isList) {
    sampleInput = 'head = [1,2,3,4,5]';
    sampleOutput = '[5,4,3,2,1]';
    testCases = ['head = [1,2,3,4,5]', 'head = [1,2]', 'head = []'];
  } else if (isGraph) {
    sampleInput = 'numCourses = 2, prerequisites = [[1,0]]';
    sampleOutput = 'true';
    testCases = ['numCourses = 2, prerequisites = [[1,0]]', 'numCourses = 2, prerequisites = [[1,0],[0,1]]'];
  }

  const starters: Record<SupportedLanguage, string> = {
    python: `# SDETube LeetCode Arena: ${cleanName}
class Solution:
    def ${camelName || 'solve'}(self, nums: list[int] = None) -> any:
        """
        Optimal Solution for: ${cleanName}
        Category: ${category} | Difficulty: ${difficulty}
        """
        # Implement your optimal algorithm here
        return nums

if __name__ == "__main__":
    sol = Solution()
    test_val = [1, 2, 3, 4, 5]
    print("Test Execution:", sol.${camelName || 'solve'}(test_val))
`,
    cpp: `// SDETube LeetCode Arena: ${cleanName}
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
using namespace std;

class Solution {
public:
    void ${camelName || 'solve'}() {
        // Implement optimal solution for ${cleanName}
        cout << "Optimal solution for ${cleanName} executed successfully." << endl;
    }
};

int main() {
    Solution sol;
    sol.${camelName || 'solve'}();
    return 0;
}
`,
    java: `import java.util.*;

public class Solution {
    public void ${camelName || 'solve'}() {
        // Implement optimal solution for ${cleanName}
        System.out.println("Optimal solution for ${cleanName} executed successfully.");
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        sol.${camelName || 'solve'}();
    }
}
`,
    javascript: `/**
 * SDETube LeetCode Arena: ${cleanName}
 */
class Solution {
    ${camelName || 'solve'}(input) {
        console.log("Optimal solution for ${cleanName} executed successfully.");
        return input;
    }
}

const sol = new Solution();
sol.${camelName || 'solve'}();
`,
    go: `package main

import "fmt"

type Solution struct{}

func (s *Solution) ${cleanName.replace(/\s+/g, '')}() {
    fmt.Println("Optimal solution for ${cleanName} executed successfully.")
}

func main() {
    sol := Solution{}
    sol.${cleanName.replace(/\s+/g, '')}()
}
`,
    rust: `struct Solution;

impl Solution {
    pub fn solve() {
        println!("Optimal solution for ${cleanName} executed successfully.");
    }
}

fn main() {
    Solution::solve();
}
`,
    sql: `-- SDETube SQL Arena: ${cleanName}
SELECT 1 AS result;
`
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
    starters
  };
}

function getDynamicStarters(name: string, category: string): Record<SupportedLanguage, string> {
  return generateDynamicTemplate(name, category, 'Medium').starters;
}
