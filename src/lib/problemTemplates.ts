import { SupportedLanguage } from './compiler';

export interface ProblemApproach {
  id: string;
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  starters: Record<SupportedLanguage, string>;
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
  }[];
  constraints: string[];
  testCases: string[];
  expectedOutputs?: string[];
  approaches?: ProblemApproach[];
  starters: Record<SupportedLanguage, string>;
}

// Helper to normalize problem names for matching
export const normalizeProblemTitle = (title: string): string => {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Handcrafted specific templates for core SDE sheet problems with Multi-Approach support
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
    approaches: [
      {
        id: 'optimal',
        name: 'Approach 1: Optimal In-Place Markers (O(1) Space)',
        timeComplexity: 'O(M * N)',
        spaceComplexity: 'O(1) Auxiliary',
        description: 'Use the first row and first column of the matrix itself to store zero markers in-place.',
        starters: {
          cpp: `class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        bool firstRowZero = false, firstColZero = false;

        for (int j = 0; j < n; j++) if (matrix[0][j] == 0) firstRowZero = true;
        for (int i = 0; i < m; i++) if (matrix[i][0] == 0) firstColZero = true;

        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][j] == 0) {
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }

        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][0] == 0 || matrix[0][j] == 0) {
                    matrix[i][j] = 0;
                }
            }
        }

        if (firstRowZero) for (int j = 0; j < n; j++) matrix[0][j] = 0;
        if (firstColZero) for (int i = 0; i < m; i++) matrix[i][0] = 0;
    }
};`,
          python: `class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        """
        Optimal in-place marker solution.
        Time: O(M*N), Space: O(1)
        """
        m, n = len(matrix), len(matrix[0])
        first_row_zero = any(matrix[0][j] == 0 for j in range(n))
        first_col_zero = any(matrix[i][0] == 0 for i in range(m))

        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][j] == 0:
                    matrix[i][0] = matrix[0][j] = 0

        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][0] == 0 or matrix[0][j] == 0:
                    matrix[i][j] = 0

        if first_row_zero:
            for j in range(n): matrix[0][j] = 0
        if first_col_zero:
            for i in range(m): matrix[i][0] = 0`,
          java: `class Solution {
    public void setZeroes(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        boolean firstRow = false, firstCol = false;
        for (int j = 0; j < n; j++) if (matrix[0][j] == 0) firstRow = true;
        for (int i = 0; i < m; i++) if (matrix[i][0] == 0) firstCol = true;

        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                if (matrix[i][j] == 0) { matrix[i][0] = 0; matrix[0][j] = 0; }

        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                if (matrix[i][0] == 0 || matrix[0][j] == 0) matrix[i][j] = 0;

        if (firstRow) for (int j = 0; j < n; j++) matrix[0][j] = 0;
        if (firstCol) for (int i = 0; i < m; i++) matrix[i][0] = 0;
    }
}`,
          javascript: `var setZeroes = function(matrix) {
    let m = matrix.length, n = matrix[0].length;
    let firstRow = false, firstCol = false;
    for (let j = 0; j < n; j++) if (matrix[0][j] === 0) firstRow = true;
    for (let i = 0; i < m; i++) if (matrix[i][0] === 0) firstCol = true;

    for (let i = 1; i < m; i++)
        for (let j = 1; j < n; j++)
            if (matrix[i][j] === 0) { matrix[i][0] = 0; matrix[0][j] = 0; }

    for (let i = 1; i < m; i++)
        for (let j = 1; j < n; j++)
            if (matrix[i][0] === 0 || matrix[0][j] === 0) matrix[i][j] = 0;

    if (firstRow) for (let j = 0; j < n; j++) matrix[0][j] = 0;
    if (firstCol) for (let i = 0; i < m; i++) matrix[i][0] = 0;
};`,
          go: `func setZeroes(matrix [][]int) { }`,
          rust: `impl Solution { pub fn set_zeroes(matrix: &mut Vec<Vec<i32>>) { } }`,
          sql: `-- Set Matrix Zeroes`
        }
      },
      {
        id: 'better',
        name: 'Approach 2: Better (1D Row & Col Arrays)',
        timeComplexity: 'O(M * N)',
        spaceComplexity: 'O(M + N)',
        description: 'Maintain two boolean arrays rows[m] and cols[n] to record zero positions.',
        starters: {
          cpp: `class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        vector<bool> rows(m, false), cols(n, false);

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == 0) {
                    rows[i] = true;
                    cols[j] = true;
                }
            }
        }

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (rows[i] || cols[j]) {
                    matrix[i][j] = 0;
                }
            }
        }
    }
};`,
          python: `class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        """
        Approach using O(M + N) extra boolean arrays.
        """
        m, n = len(matrix), len(matrix[0])
        rows, cols = [False] * m, [False] * n

        for i in range(m):
            for j in range(n):
                if matrix[i][j] == 0:
                    rows[i] = cols[j] = True

        for i in range(m):
            for j in range(n):
                if rows[i] or cols[j]:
                    matrix[i][j] = 0`,
          java: `class Solution {
    public void setZeroes(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        boolean[] rows = new boolean[m], cols = new boolean[n];
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (matrix[i][j] == 0) { rows[i] = true; cols[j] = true; }
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (rows[i] || cols[j]) matrix[i][j] = 0;
    }
}`,
          javascript: `var setZeroes = function(matrix) {
    let m = matrix.length, n = matrix[0].length;
    let rows = new Array(m).fill(false), cols = new Array(n).fill(false);
    for (let i = 0; i < m; i++)
        for (let j = 0; j < n; j++)
            if (matrix[i][j] === 0) { rows[i] = true; cols[j] = true; }
    for (let i = 0; i < m; i++)
        for (let j = 0; j < n; j++)
            if (rows[i] || cols[j]) matrix[i][j] = 0;
};`,
          go: `func setZeroes(matrix [][]int) { }`,
          rust: `impl Solution { pub fn set_zeroes(matrix: &mut Vec<Vec<i32>>) { } }`,
          sql: `-- Set Matrix Zeroes`
        }
      }
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
      javascript: `var setZeroes = function(matrix) {
    
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
    approaches: [
      {
        id: 'optimal',
        name: 'Approach 1: One-Pass Hash Map (O(N) Time)',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        description: 'Iterate through the array and store {value: index} in a hash map to find complement in O(1).',
        starters: {
          cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < nums.size(); i++) {
            int comp = target - nums[i];
            if (mp.find(comp) != mp.end()) return {mp[comp], i};
            mp[nums[i]] = i;
        }
        return {};
    }
};`,
          python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            comp = target - num
            if comp in seen:
                return [seen[comp], i]
            seen[num] = i
        return []`,
          java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) return new int[]{map.get(comp), i};
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
          javascript: `var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
    }
    return [];
};`,
          go: `func twoSum(nums []int, target int) []int { return []int{} }`,
          rust: `impl Solution { pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> { vec![] } }`,
          sql: `-- Two Sum`
        }
      },
      {
        id: 'brute',
        name: 'Approach 2: Brute Force (O(N²) Time)',
        timeComplexity: 'O(N^2)',
        spaceComplexity: 'O(1)',
        description: 'Check every pair of elements with two nested loops.',
        starters: {
          cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        for (int i = 0; i < nums.size(); i++) {
            for (int j = i + 1; j < nums.size(); j++) {
                if (nums[i] + nums[j] == target) return {i, j};
            }
        }
        return {};
    }
};`,
          python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                if nums[i] + nums[j] == target:
                    return [i, j]
        return []`,
          java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++)
            for (int j = i + 1; j < nums.length; j++)
                if (nums[i] + nums[j] == target) return new int[]{i, j};
        return new int[]{};
    }
}`,
          javascript: `var twoSum = function(nums, target) {
    for (let i = 0; i < nums.length; i++)
        for (let j = i + 1; j < nums.length; j++)
            if (nums[i] + nums[j] === target) return [i, j];
    return [];
};`,
          go: `func twoSum(nums []int, target int) []int { return []int{} }`,
          rust: `impl Solution { pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> { vec![] } }`,
          sql: `-- Two Sum`
        }
      }
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
      javascript: `var twoSum = function(nums, target) {
    
};`,
      go: `func twoSum(nums []int, target int) []int {
    
}`,
      rust: `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        
    }
}`,
      sql: `-- Two Sum is an algorithmic challenge.`
    }
  }
};

// System Design / LLD dynamic template generator grounded directly in transcript
export const generateLLDTemplate = (
  title: string,
  transcript: string = '',
  notes: string = ''
): ProblemTemplate => {
  const cleanTitle = title.replace(/\.(mp4|mkv)$/i, '').replace(/_/g, ' ');
  const isSrp = cleanTitle.toLowerCase().includes('srp') || cleanTitle.toLowerCase().includes('single responsibility');
  const isOcp = cleanTitle.toLowerCase().includes('ocp') || cleanTitle.toLowerCase().includes('open closed');
  const isStrategy = cleanTitle.toLowerCase().includes('strategy') || cleanTitle.toLowerCase().includes('pattern');
  
  let problemDesc = `In this Low-Level Design (LLD) challenge based on "${cleanTitle}", design an extensible, maintainable class hierarchy adhering strictly to Object-Oriented Principles.`;
  if (transcript && transcript.length > 80) {
    const keyExcerpt = transcript.slice(0, 300).replace(/\n+/g, ' ');
    problemDesc += `\n\nInstructor Context from Lecture:\n"${keyExcerpt}..."`;
  }

  const cppStarter = isOcp ? `// LLD Challenge: Open-Closed Principle (OCP)
#include <iostream>
#include <vector>
#include <memory>
#include <string>
using namespace std;

// 1. Core Abstract Interface (Closed for modification, Open for extension)
class PaymentStrategy {
public:
    virtual ~PaymentStrategy() = default;
    virtual void pay(double amount) = 0;
};

// 2. Concrete Extensible Classes
class CreditCardPayment : public PaymentStrategy {
public:
    void pay(double amount) override {
        cout << "Processed Credit Card payment: $" << amount << endl;
    }
};

class UPIPayment : public PaymentStrategy {
public:
    void pay(double amount) override {
        cout << "Processed UPI payment: $" << amount << endl;
    }
};

// 3. High-level Context
class PaymentProcessor {
private:
    unique_ptr<PaymentStrategy> strategy;
public:
    void setStrategy(unique_ptr<PaymentStrategy> newStrategy) {
        strategy = move(newStrategy);
    }
    void executePayment(double amount) {
        if (strategy) strategy->pay(amount);
    }
};

class Solution {
public:
    void runDesign() {
        PaymentProcessor processor;
        processor.setStrategy(make_unique<CreditCardPayment>());
        processor.executePayment(250.0);
        processor.setStrategy(make_unique<UPIPayment>());
        processor.executePayment(500.0);
    }
};` : `// LLD Challenge: Single Responsibility Principle (SRP)
#include <iostream>
#include <string>
#include <memory>
using namespace std;

// 1. Model / Business Logic
class Invoice {
public:
    int id;
    double amount;
    Invoice(int id, double amount) : id(id), amount(amount) {}
    double calculateTotal() { return amount * 1.18; }
};

// 2. Persistence Responsibility
class InvoiceRepository {
public:
    void saveToDatabase(const Invoice& inv) {
        cout << "Persisted invoice #" << inv.id << " to database." << endl;
    }
};

// 3. Notification Responsibility
class InvoiceNotificationService {
public:
    void sendEmail(const Invoice& inv) {
        cout << "Sent receipt email for invoice #" << inv.id << endl;
    }
};

class Solution {
public:
    void runDesign() {
        Invoice inv(101, 1000.0);
        InvoiceRepository repo;
        InvoiceNotificationService notification;
        repo.saveToDatabase(inv);
        notification.sendEmail(inv);
    }
};`;

  const pyStarter = isOcp ? `# LLD Challenge: Open-Closed Principle (OCP)
from abc import ABC, abstractmethod

class PaymentStrategy(ABC):
    @abstractmethod
    def pay(self, amount: float) -> None:
        pass

class CreditCardPayment(PaymentStrategy):
    def pay(self, amount: float) -> None:
        print(f"Processed Credit Card payment: \${amount}")

class UPIPayment(PaymentStrategy):
    def pay(self, amount: float) -> None:
        print(f"Processed UPI payment: \${amount}")

class PaymentProcessor:
    def __init__(self, strategy: PaymentStrategy = None):
        self.strategy = strategy

    def execute_payment(self, amount: float) -> None:
        if self.strategy:
            self.strategy.pay(amount)

class Solution:
    def run_design(self) -> None:
        processor = PaymentProcessor(CreditCardPayment())
        processor.execute_payment(250.0)
        processor.strategy = UPIPayment()
        processor.execute_payment(500.0)
` : `# LLD Challenge: Single Responsibility Principle (SRP)
class Invoice:
    def __init__(self, invoice_id: int, amount: float):
        self.invoice_id = invoice_id
        self.amount = amount

    def calculate_total(self) -> float:
        return self.amount * 1.18

class InvoiceRepository:
    def save_to_db(self, invoice: Invoice) -> None:
        print(f"Persisted invoice #{invoice.invoice_id} to SQL Database.")

class InvoiceNotifier:
    def send_email(self, invoice: Invoice) -> None:
        print(f"Sent receipt email for invoice #{invoice.invoice_id}.")

class Solution:
    def run_design(self) -> None:
        inv = Invoice(101, 1000.0)
        repo = InvoiceRepository()
        notifier = InvoiceNotifier()
        repo.save_to_db(inv)
        notifier.send_email(inv)
`;

  return {
    name: cleanTitle,
    category: 'System Design & LLD',
    difficulty: 'Medium',
    description: problemDesc,
    examples: [
      {
        input: 'Run LLD Architectural Simulation',
        output: 'All decoupled classes execute without coupling violations.',
        explanation: 'Follows SOLID principles with isolated single responsibilities.'
      }
    ],
    constraints: [
      'Adhere strictly to SOLID principles',
      'Ensure zero high coupling between persistence, business logic, and notifications',
      'All classes must have single reason to change'
    ],
    testCases: [
      'invoice = { id: 101, amount: 1000.0 }',
      'invoice = { id: 202, amount: 4500.0 }'
    ],
    expectedOutputs: [
      'Persisted invoice #101 to database.\nSent receipt email for invoice #101.',
      'Persisted invoice #202 to database.\nSent receipt email for invoice #202.'
    ],
    approaches: [
      {
        id: 'refactored',
        name: 'Approach 1: SOLID Refactored Architecture (Optimal)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Decoupled classes with isolated single responsibilities and interface abstraction.',
        starters: {
          cpp: cppStarter,
          python: pyStarter,
          java: `// Java LLD Solution\nclass Solution { public void runDesign() { System.out.println("LLD SOLID Design verified."); } }`,
          javascript: `class Solution { runDesign() { console.log("LLD SOLID Design verified."); } }`,
          go: `func RunDesign() { }`,
          rust: `impl Solution { pub fn run_design() { } }`,
          sql: `-- LLD Schema Design`
        }
      }
    ],
    starters: {
      cpp: cppStarter,
      python: pyStarter,
      java: `// Java LLD Solution\nclass Solution {\n    public void runDesign() {\n        System.out.println("LLD SOLID Architecture Executed.");\n    }\n}`,
      javascript: `class Solution {\n    runDesign() {\n        console.log("LLD SOLID Architecture Executed.");\n    }\n}`,
      go: `func RunDesign() {\n}`,
      rust: `impl Solution {\n    pub fn run_design() {\n    }\n}`,
      sql: `-- LLD Challenge`
    }
  };
};

// Dynamic Template Generator for all SDE problems
export const getProblemTemplate = (
  problemTitle: string,
  category: string = 'Arrays',
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium',
  transcript: string = '',
  notes: string = ''
): ProblemTemplate => {
  const norm = normalizeProblemTitle(problemTitle);
  
  if (category.toLowerCase().includes('design') || category.toLowerCase().includes('lld') || problemTitle.toLowerCase().includes('solid') || problemTitle.toLowerCase().includes('srp') || problemTitle.toLowerCase().includes('ocp')) {
    return generateLLDTemplate(problemTitle, transcript, notes);
  }

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
      approaches: t.approaches || [],
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
    approaches: [],
    starters
  };
}

function getDynamicStarters(name: string, category: string): Record<SupportedLanguage, string> {
  return generateDynamicTemplate(name, category, 'Medium').starters;
}
