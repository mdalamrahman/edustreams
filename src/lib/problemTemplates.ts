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
  }[];
  constraints: string[];
  testCases: string[];
  expectedOutputs?: string[];
  hints?: string[];
  approaches?: ProblemApproach[];
  starters: Record<SupportedLanguage, string>;
  solutions?: Record<SupportedLanguage, string>;
}

// Helper to normalize problem names for matching
export const normalizeProblemTitle = (title: string): string => {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Handcrafted specific templates for core SDE sheet problems with Multi-Approach support
export const SPECIFIC_TEMPLATES: Record<string, Partial<ProblemTemplate>> = {
  'sortcolors': {
    name: 'Sort an Array of 0s, 1s and 2s',
    category: 'Arrays',
    difficulty: 'Medium',
    description: 'Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order 0s, 1s, and 2s.',
    examples: [
      {
        input: 'nums = [2,0,2,1,1,0]',
        output: '[0,0,1,1,2,2]',
        explanation: 'Sorted using Dutch National Flag 3-pointer algorithm.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      'nums[i] is either 0, 1, or 2'
    ],
    testCases: [
      'nums = [2, 0, 2, 1, 1, 0]',
      'nums = [2, 0, 1]',
      'nums = [0]'
    ],
    expectedOutputs: [
      '[0,0,1,1,2,2]',
      '[0,1,2]',
      '[0]'
    ],
    approaches: [
      {
        id: 'dutchflag',
        name: 'Approach 1: Dutch National Flag 3-Pointer (Optimal O(N))',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        description: 'Maintain 3 pointers: low, mid, and high to sort in single pass.',
        starters: {
          cpp: `class Solution {\npublic:\n    void sortColors(vector<int>& nums) {\n        \n    }\n};`,
          python: `class Solution:\n    def sortColors(self, nums: List[int]) -> None:\n        """\n        Do not return anything, modify nums in-place instead.\n        """\n        pass`,
          java: `class Solution {\n    public void sortColors(int[] nums) {\n        \n    }\n}`,
          javascript: `var sortColors = function(nums) {\n    \n};`,
          go: `func sortColors(nums []int) { }`,
          rust: `impl Solution { pub fn sort_colors(nums: &mut Vec<i32>) { } }`,
          sql: `-- Solution`
        }
      }
    ],
    starters: {
      cpp: `class Solution {\npublic:\n    void sortColors(vector<int>& nums) {\n        \n    }\n};`,
      python: `class Solution:\n    def sortColors(self, nums: List[int]) -> None:\n        pass`,
      java: `class Solution {\n    public void sortColors(int[] nums) {\n        \n    }\n}`,
      javascript: `var sortColors = function(nums) {\n    \n};`,
      go: `func sortColors(nums []int) { }`,
      rust: `impl Solution { pub fn sort_colors(nums: &mut Vec<i32>) { } }`,
      sql: `-- Solution`
    },
    solutions: {
      cpp: `class Solution {\npublic:\n    void sortColors(vector<int>& nums) {\n        int low = 0, mid = 0, high = nums.size() - 1;\n        while (mid <= high) {\n            if (nums[mid] == 0) swap(nums[low++], nums[mid++]);\n            else if (nums[mid] == 1) mid++;\n            else swap(nums[mid], nums[high--]);\n        }\n    }\n};`,
      python: `class Solution:\n    def sortColors(self, nums: List[int]) -> None:\n        low, mid, high = 0, 0, len(nums) - 1\n        while mid <= high:\n            if nums[mid] == 0:\n                nums[low], nums[mid] = nums[mid], nums[low]\n                low += 1\n                mid += 1\n            elif nums[mid] == 1:\n                mid += 1\n            else:\n                nums[mid], nums[high] = nums[high], nums[mid]\n                high -= 1`,
      java: `class Solution {\n    public void sortColors(int[] nums) {\n        int low = 0, mid = 0, high = nums.length - 1;\n        while (mid <= high) {\n            if (nums[mid] == 0) { int t = nums[low]; nums[low++] = nums[mid]; nums[mid++] = t; }\n            else if (nums[mid] == 1) mid++;\n            else { int t = nums[mid]; nums[mid] = nums[high]; nums[high--] = t; }\n        }\n    }\n}`,
      javascript: `var sortColors = function(nums) {\n    let low = 0, mid = 0, high = nums.length - 1;\n    while (mid <= high) {\n        if (nums[mid] === 0) { [nums[low], nums[mid]] = [nums[mid], nums[low]]; low++; mid++; }\n        else if (nums[mid] === 1) mid++;\n        else { [nums[mid], nums[high]] = [nums[high], nums[mid]]; high--; }\n    }\n};`,
      go: `func sortColors(nums []int) { }`,
      rust: `impl Solution { pub fn sort_colors(nums: &mut Vec<i32>) { } }`,
      sql: `-- Solution`
    }
  },
  'sortanarrayof0s1sand2s': {
    name: 'Sort an Array of 0s, 1s and 2s',
    category: 'Arrays',
    difficulty: 'Medium',
    description: 'Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order 0s, 1s, and 2s.',
    examples: [
      {
        input: 'nums = [2,0,2,1,1,0]',
        output: '[0,0,1,1,2,2]',
        explanation: 'Sorted using Dutch National Flag algorithm.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      'nums[i] is either 0, 1, or 2'
    ],
    testCases: [
      'nums = [2, 0, 2, 1, 1, 0]',
      'nums = [2, 0, 1]',
      'nums = [0]'
    ],
    expectedOutputs: [
      '[0,0,1,1,2,2]',
      '[0,1,2]',
      '[0]'
    ],
    approaches: [],
    starters: {
      cpp: `class Solution {\npublic:\n    void sortColors(vector<int>& nums) {\n        \n    }\n};`,
      python: `class Solution:\n    def sortColors(self, nums: List[int]) -> None:\n        pass`,
      java: `class Solution {\n    public void sortColors(int[] nums) {\n        \n    }\n}`,
      javascript: `var sortColors = function(nums) {\n    \n};`,
      go: `func sortColors(nums []int) { }`,
      rust: `impl Solution { pub fn sort_colors(nums: &mut Vec<i32>) { } }`,
      sql: `-- Solution`
    },
    solutions: {
      cpp: `class Solution {\npublic:\n    void sortColors(vector<int>& nums) {\n        int low = 0, mid = 0, high = nums.size() - 1;\n        while (mid <= high) {\n            if (nums[mid] == 0) swap(nums[low++], nums[mid++]);\n            else if (nums[mid] == 1) mid++;\n            else swap(nums[mid], nums[high--]);\n        }\n    }\n};`,
      python: `class Solution:\n    def sortColors(self, nums: List[int]) -> None:\n        low, mid, high = 0, 0, len(nums) - 1\n        while mid <= high:\n            if nums[mid] == 0:\n                nums[low], nums[mid] = nums[mid], nums[low]\n                low += 1\n                mid += 1\n            elif nums[mid] == 1:\n                mid += 1\n            else:\n                nums[mid], nums[high] = nums[high], nums[mid]\n                high -= 1`,
      java: `class Solution { public void sortColors(int[] nums) {} }`,
      javascript: `var sortColors = function(nums) {};`,
      go: `func sortColors(nums []int) { }`,
      rust: `impl Solution { pub fn sort_colors(nums: &mut Vec<i32>) { } }`,
      sql: `-- Solution`
    }
  },
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
        // Optimal O(1) space solution
    }
};`,
          python: `class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        """
        Optimal in-place marker solution.
        Time: O(M*N), Space: O(1)
        """
        pass`,
          java: `class Solution {
    public void setZeroes(int[][] matrix) {
        
    }
}`,
          javascript: `var setZeroes = function(matrix) {
    
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
        // Implement row & col marker logic
    }
};`,
          python: `class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        rows, cols = [False] * m, [False] * n
        # Implement row & col marker logic`,
          java: `class Solution {
    public void setZeroes(int[][] matrix) {
        
    }
}`,
          javascript: `var setZeroes = function(matrix) {
    
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
    },
    solutions: {
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
                if (matrix[i][j] == 0 || matrix[0][j] == 0) matrix[i][j] = 0;

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
      sql: `-- Solution`
    }
  }
};

// System Design / LLD dynamic template generator grounded directly in verbatim transcript
export const generateLLDTemplate = (
  title: string,
  transcript: string = '',
  notes: string = ''
): ProblemTemplate => {
  const cleanTitle = title.replace(/\.(mp4|mkv)$/i, '').replace(/_/g, ' ');
  const isOcp = cleanTitle.toLowerCase().includes('ocp') || cleanTitle.toLowerCase().includes('open closed');
  const isStrategy = cleanTitle.toLowerCase().includes('strategy') || cleanTitle.toLowerCase().includes('pattern');
  
  // Extract transcript excerpt
  let transcriptSnippet = '';
  if (transcript && transcript.length > 50) {
    const rawExcerpt = transcript.slice(0, 450).replace(/\n+/g, ' ').trim();
    transcriptSnippet = `\n\n📌 **Key Concepts Taught in Lecture Transcript:**\n"${rawExcerpt}..."`;
  }

  let problemDesc = isOcp ? `### Low-Level Design Challenge: Open-Closed Principle (OCP)
${transcriptSnippet}

**Problem Scenario:**
Design an extensible Payment Processing System where new payment gateways (e.g., Credit Card, UPI, PayPal, Crypto) can be added **WITHOUT modifying existing payment processor classes**.

**Requirements:**
1. Create a polymorphic \`PaymentStrategy\` abstract interface with \`virtual void pay(double amount)\`.
2. Implement concrete classes: \`CreditCardPayment\` and \`UPIPayment\`.
3. Create a \`PaymentProcessor\` context class that receives a \`PaymentStrategy\` dynamically.
4. Verify that adding a new payment mode requires ZERO changes to \`PaymentProcessor\` (Open for Extension, Closed for Modification).` : `### Low-Level Design Challenge: Single Responsibility Principle (SRP)
${transcriptSnippet}

**Problem Scenario:**
Refactor a legacy monolithic \`Invoice\` class that mixes:
1. Invoice Total Calculation (Business Logic)
2. Database Saving (SQL Persistence)
3. Email Receipts (Notification Layer)

**Requirements:**
1. Split the responsibilities into 3 decoupled, single-responsibility classes:
   - \`Invoice\`: Only holds invoice data and calculates total with tax.
   - \`InvoiceRepository\`: Only handles database persistence.
   - \`InvoiceNotificationService\`: Only sends customer receipts.
2. Demonstrate clean instantiation and execution in the \`Solution\` class without side-effects.`;

  const cppStarter = isOcp ? `// LLD Challenge: Open-Closed Principle (OCP)
#include <iostream>
#include <vector>
#include <memory>
#include <string>
using namespace std;

// 1. Abstract Strategy Interface (Closed for modification, Open for extension)
class PaymentStrategy {
public:
    virtual ~PaymentStrategy() = default;
    virtual void pay(double amount) = 0;
};

// 2. Concrete Extensible Classes
class CreditCardPayment : public PaymentStrategy {
public:
    void pay(double amount) override {
        // Implement credit card processing
    }
};

class UPIPayment : public PaymentStrategy {
public:
    void pay(double amount) override {
        // Implement UPI processing
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
        // Test payment strategies
    }
};` : `// LLD Challenge: Single Responsibility Principle (SRP)
#include <iostream>
#include <string>
#include <memory>
using namespace std;

// 1. Business Logic Entity
class Invoice {
public:
    int id;
    double amount;
    Invoice(int id, double amount) : id(id), amount(amount) {}
    double calculateTotal() { return amount * 1.18; }
};

// 2. Database Persistence Responsibility
class InvoiceRepository {
public:
    void saveToDatabase(const Invoice& inv) {
        // Implement DB save
    }
};

// 3. Notification Responsibility
class InvoiceNotificationService {
public:
    void sendEmail(const Invoice& inv) {
        // Implement email notification
    }
};

class Solution {
public:
    void runDesign() {
        // Execute decoupled architecture
    }
};`;

  const cppSolution = isOcp ? `// Complete Optimal OCP Solution
#include <iostream>
#include <memory>
using namespace std;

class PaymentStrategy {
public:
    virtual ~PaymentStrategy() = default;
    virtual void pay(double amount) = 0;
};

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
};` : `// Complete Optimal SRP Solution
#include <iostream>
using namespace std;

class Invoice {
public:
    int id;
    double amount;
    Invoice(int id, double amount) : id(id), amount(amount) {}
    double calculateTotal() { return amount * 1.18; }
};

class InvoiceRepository {
public:
    void saveToDatabase(const Invoice& inv) {
        cout << "Persisted invoice #" << inv.id << " to database." << endl;
    }
};

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
        pass

class UPIPayment(PaymentStrategy):
    def pay(self, amount: float) -> None:
        pass

class PaymentProcessor:
    def __init__(self, strategy: PaymentStrategy = None):
        self.strategy = strategy

    def execute_payment(self, amount: float) -> None:
        if self.strategy:
            self.strategy.pay(amount)

class Solution:
    def run_design(self) -> None:
        pass
` : `# LLD Challenge: Single Responsibility Principle (SRP)
class Invoice:
    def __init__(self, invoice_id: int, amount: float):
        self.invoice_id = invoice_id
        self.amount = amount

    def calculate_total(self) -> float:
        return self.amount * 1.18

class InvoiceRepository:
    def save_to_db(self, invoice: Invoice) -> None:
        pass

class InvoiceNotifier:
    def send_email(self, invoice: Invoice) -> None:
        pass

class Solution:
    def run_design(self) -> None:
        pass
`;

  const pySolution = isOcp ? `from abc import ABC, abstractmethod

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
` : `class Invoice:
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
        input: 'Execute Solution::runDesign()',
        output: isOcp ? 'Processed Credit Card payment: $250\nProcessed UPI payment: $500' : 'Persisted invoice #101 to database.\nSent receipt email for invoice #101.',
        explanation: 'All classes execute cleanly adhering to SOLID principles.'
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
      isOcp ? 'Processed Credit Card payment: $250\nProcessed UPI payment: $500' : 'Persisted invoice #101 to database.\nSent receipt email for invoice #101.',
      isOcp ? 'Processed Credit Card payment: $1200' : 'Persisted invoice #202 to database.\nSent receipt email for invoice #202.'
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
          java: `class Solution { public void runDesign() { System.out.println("LLD SOLID Design verified."); } }`,
          javascript: `class Solution { runDesign() { console.log("LLD SOLID Design verified."); } }`,
          go: `func RunDesign() { }`,
          rust: `impl Solution { pub fn run_design() { } }`,
          sql: `-- LLD Schema Design`
        },
        solutionCode: {
          cpp: cppSolution,
          python: pySolution,
          java: `class Solution { public void runDesign() { System.out.println("LLD SOLID Design verified."); } }`,
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
      java: `class Solution {\n    public void runDesign() {\n        System.out.println("LLD SOLID Architecture Executed.");\n    }\n}`,
      javascript: `class Solution {\n    runDesign() {\n        console.log("LLD SOLID Architecture Executed.");\n    }\n}`,
      go: `func RunDesign() {\n}`,
      rust: `impl Solution {\n    pub fn run_design() {\n    }\n}`,
      sql: `-- LLD Challenge`
    },
    solutions: {
      cpp: cppSolution,
      python: pySolution,
      java: `class Solution { public void runDesign() { System.out.println("LLD SOLID Architecture Executed."); } }`,
      javascript: `class Solution { runDesign() { console.log("LLD SOLID Architecture Executed."); } }`,
      go: `func RunDesign() { }`,
      rust: `impl Solution { pub fn run_design() { } }`,
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
      starters: t.starters || getDynamicStarters(problemTitle, category),
      solutions: t.solutions || t.starters || getDynamicStarters(problemTitle, category)
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
    starters,
    solutions: starters
  };
}

function getDynamicStarters(name: string, category: string): Record<SupportedLanguage, string> {
  return generateDynamicTemplate(name, category, 'Medium').starters;
}

/**
 * Cleans raw HTML problem statements from LeetCode into readable markdown with extracted examples and constraints.
 */
export function parseLeetCodeProblemHtml(htmlStr: string): {
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
} {
  if (!htmlStr) return { description: '', examples: [], constraints: [] };

  const examples: { input: string; output: string; explanation?: string }[] = [];
  const exBlocks = htmlStr.match(/<pre>([\s\S]*?)<\/pre>/gi) || [];

  for (const eb of exBlocks) {
    const text = eb.replace(/<[^>]+>/g, '').trim();
    const inputMatch = text.match(/Input:\s*([\s\S]*?)(?=\nOutput:|$)/i);
    const outputMatch = text.match(/Output:\s*([\s\S]*?)(?=\nExplanation:|$)/i);
    const explMatch = text.match(/Explanation:\s*([\s\S]*?)$/i);

    const inp = inputMatch ? inputMatch[1].trim() : text;
    const outp = outputMatch ? outputMatch[1].trim() : '';
    const expl = explMatch ? explMatch[1].trim() : undefined;

    if (inp && outp) {
      examples.push({ input: inp, output: outp, explanation: expl });
    }
  }

  const constraints: string[] = [];
  const conMatch = htmlStr.match(/<p><strong[^>]*>Constraints:<\/strong><\/p>\s*<ul>([\s\S]*?)<\/ul>/i);
  if (conMatch) {
    const lis = conMatch[1].match(/<li>([\s\S]*?)<\/li>/gi) || [];
    for (const li of lis) {
      const cleanLi = li
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&le;/g, '<=')
        .replace(/&ge;/g, '>=')
        .replace(/&quot;/g, '"')
        .trim();
      if (cleanLi) constraints.push(cleanLi);
    }
  }

  // Clean description markdown
  let desc = htmlStr
    .replace(/<pre>[\s\S]*?<\/pre>/gi, '')
    .replace(/<p><strong[^>]*>Constraints:<\/strong><\/p>\s*<ul>[\s\S]*?<\/ul>/gi, '')
    .replace(/<p><strong[^>]*>Example \d+:[\s\S]*?<\/strong><\/p>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&le;/g, '<=')
    .replace(/&ge;/g, '>=')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { description: desc, examples, constraints };
}

/**
 * Fetches real problem statement, example test cases, constraints, and hints from LeetCode public API or backend proxy.
 */
export async function fetchFromLeetCodeApi(slug: string): Promise<ProblemTemplate | null> {
  // 1. Try our unified backend endpoint /api/problem/{slug} (which queries LeetCode GraphQL directly)
  try {
    const backendUrl = `/api/problem/${encodeURIComponent(slug)}`;
    const resp = await fetch(backendUrl, { signal: AbortSignal.timeout(8000) });
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.name && data.description && !data.error) {
        return data as ProblemTemplate;
      }
    }
  } catch (err) {
    console.warn(`[Backend Problem API fetch notice for '${slug}']:`, err);
  }

  // 2. Fallback to public alfa-leetcode-api
  try {
    const url = `https://alfa-leetcode-api.onrender.com/select?titleSlug=${encodeURIComponent(slug)}`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(6500) });
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.questionTitle) {
        const parsed = parseLeetCodeProblemHtml(data.question || '');
        const title = data.questionTitle;
        const diff = (data.difficulty === 'Hard' ? 'Hard' : data.difficulty === 'Easy' ? 'Easy' : 'Medium') as 'Easy' | 'Medium' | 'Hard';
        const hints = Array.isArray(data.hints) ? data.hints.map((h: string) => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean) : [];

        let testCases: string[] = [];
        if (data.exampleTestcases && typeof data.exampleTestcases === 'string') {
          const lines = data.exampleTestcases.split('\n').map((l: string) => l.trim()).filter(Boolean);
          testCases = lines.length > 0 ? lines : [];
        }
        if (testCases.length === 0 && parsed.examples.length > 0) {
          testCases = parsed.examples.map(e => e.input);
        }

        const dynamicFallback = generateDynamicTemplate(title, data.topicTags?.[0]?.name || 'Algorithms', diff);

        return {
          name: title,
          category: data.topicTags?.[0]?.name || 'Algorithms',
          difficulty: diff,
          description: parsed.description || `${title} problem challenge.`,
          examples: parsed.examples.length > 0 ? parsed.examples : dynamicFallback.examples,
          constraints: parsed.constraints.length > 0 ? parsed.constraints : dynamicFallback.constraints,
          testCases: testCases.length > 0 ? testCases : dynamicFallback.testCases,
          expectedOutputs: parsed.examples.map(e => e.output),
          hints: hints.length > 0 ? hints : [
            `Analyze the problem constraints and identify the optimal time complexity boundary.`,
            `Consider whether sorting, two-pointers, hash maps, or dynamic programming state transitions apply.`
          ],
          approaches: [
            {
              id: 'optimal',
              name: `Optimal Approach for ${title}`,
              timeComplexity: diff === 'Hard' ? 'O(N log N) / O(N)' : 'O(N)',
              spaceComplexity: 'O(1) to O(N)',
              description: `Identify invariant state boundaries and minimize auxiliary memory allocation for ${title}.`,
              starters: dynamicFallback.starters,
              solutionCode: dynamicFallback.solutions
            }
          ],
          starters: dynamicFallback.starters,
          solutions: dynamicFallback.solutions,
        };
      }
    }
  } catch (e) {
    // Silently continue
  }

  return null;
}

/**
 * Uses Mistral AI to generate authentic, problem-specific problem statement, examples, testcases, hints, and code.
 */
export async function generateProblemWithMistral(
  title: string,
  category: string = 'Algorithms',
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'
): Promise<ProblemTemplate | null> {
  try {
    const prompt = `You are a Senior Algorithms and Data Structures Lead.
Generate a complete, high-quality, authentic coding problem specification in JSON for the challenge: "${title}" (Category: ${category}, Difficulty: ${difficulty}).

Requirements:
- Problem name: "${title}"
- Detailed, crystal-clear description with objective and input/output behavior.
- 2 to 3 realistic examples with input, output, and explanation.
- Realistic constraints (e.g. 1 <= N <= 10^5).
- 3 to 5 problem-specific test case inputs (e.g. if problem is about intervals or matrices, provide matrix/interval testcases).
- Corresponding expectedOutputs for the test cases.
- 2 to 3 progressive hints (intuition, edge cases, optimization).
- Approaches array with timeComplexity, spaceComplexity, and approach explanation.
- starters in cpp, python, java, javascript, go, rust (clean class/function signature with comments).
- solutions in cpp, python, java, javascript, go, rust.

Output ONLY valid JSON matching this schema:
{
  "name": "${title}",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "description": "...",
  "examples": [{"input": "...", "output": "...", "explanation": "..."}],
  "constraints": ["..."],
  "testCases": ["..."],
  "expectedOutputs": ["..."],
  "hints": ["...", "..."],
  "approaches": [
    {
      "id": "optimal",
      "name": "Optimal Approach",
      "timeComplexity": "O(N)",
      "spaceComplexity": "O(1)",
      "description": "..."
    }
  ],
  "starters": {
    "cpp": "...",
    "python": "...",
    "java": "...",
    "javascript": "...",
    "go": "...",
    "rust": "..."
  },
  "solutions": {
    "cpp": "...",
    "python": "...",
    "java": "...",
    "javascript": "...",
    "go": "...",
    "rust": "..."
  }
}`;

    const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2
      }),
      signal: AbortSignal.timeout(12000)
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    if (parsed && parsed.name && parsed.description && parsed.testCases) {
      return parsed as ProblemTemplate;
    }
    return null;
  } catch (err) {
    console.warn('[Mistral Problem Gen Notice]:', err);
    return null;
  }
}

/**
 * Fetches enriched LeetCode problem description, examples, constraints,
 * test cases, hints, and official multi-language starter code from LeetCode API,
 * backend GraphQL proxy, or Mistral AI.
 */
export async function fetchEnrichedProblem(
  slugOrTitle: string,
  category: string = 'Arrays',
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium',
  transcript: string = '',
  notes: string = ''
): Promise<ProblemTemplate> {
  const cleanSlug = slugOrTitle
    .toLowerCase()
    .replace(/^https?:\/\/leetcode\.com\/problems\//i, '')
    .replace(/\/.*$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const cacheKey = `edustream_problem_enriched_v9_${cleanSlug}`;

  // 1. Instant 0ms browser cache check (only if valid, problem-specific non-dummy template)
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (
        parsed?.description &&
        parsed?.testCases &&
        parsed.testCases.length > 0 &&
        !parsed.description.includes('Given the input constraints for') &&
        !(parsed.testCases.length === 1 && parsed.testCases[0] === 'nums = [1, 2, 3, 4, 5]')
      ) {
        return parsed;
      }
    }
  } catch {}

  // 2. Check handcrafted templates first if available
  const norm = normalizeProblemTitle(slugOrTitle);
  if (SPECIFIC_TEMPLATES[norm]) {
    const staticTemplate = getProblemTemplate(slugOrTitle, category, difficulty, transcript, notes);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(staticTemplate));
    } catch {}
    return staticTemplate;
  }

  // 3. Try LeetCode API (backend GraphQL proxy / alfa-leetcode-api)
  if (cleanSlug && cleanSlug.length > 1) {
    const lcData = await fetchFromLeetCodeApi(cleanSlug);
    if (lcData) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(lcData));
      } catch {}
      return lcData;
    }
  }

  // 4. Try Mistral AI Generator (generates rich problem statement, test cases, hints, approaches)
  const mistralData = await generateProblemWithMistral(slugOrTitle, category, difficulty);
  if (mistralData) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(mistralData));
    } catch {}
    return mistralData;
  }

  // 5. Fallback to existing local generator
  const fallback = getProblemTemplate(slugOrTitle, category, difficulty, transcript, notes);
  return fallback;
}

