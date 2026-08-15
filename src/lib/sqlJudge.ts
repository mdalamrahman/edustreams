import alasql from 'alasql';

export interface SQLTableSchema {
  column: string;
  type: string;
}

export interface SQLTableData {
  tableName: string;
  schema: SQLTableSchema[];
  rows: any[][];
}

export interface SQLTestCase {
  name: string;
  setupSql: string;
  tables: SQLTableData[];
}

export interface SQLProblem {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  tables: SQLTableData[];
  setupSql: string;
  starterSql: string;
  solutionSql: string;
  testCases: SQLTestCase[];
}

export interface SQLJudgeResult {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'SYNTAX_ERROR';
  executionTimeMs: number;
  columns: string[];
  rows: any[][];
  expectedColumns: string[];
  expectedRows: any[][];
  errorMessage?: string;
  tables?: SQLTableData[];
  testCaseIdx?: number;
  totalTestCasesPassed?: number;
  totalTestCases?: number;
}

// Built-in curated SQL problems with multiple test cases and clean starter templates (no prefilled answers)
export const PREDEFINED_SQL_PROBLEMS: Record<string, SQLProblem> = {
  'duplicateemails': {
    id: 'sql-1',
    title: 'Duplicate Emails',
    category: 'DBMS & SQL',
    difficulty: 'Easy',
    description: `Write a SQL query to report all the duplicate emails. Note that it's guaranteed that the email field is not NULL.

### Schema
**Person** table:
| Column Name | Type |
| :--- | :--- |
| id | int |
| email | varchar |

### Example
**Input:**
Person table:
| id | email |
| :--- | :--- |
| 1 | a@b.com |
| 2 | c@d.com |
| 3 | a@b.com |

**Output:**
| Email |
| :--- |
| a@b.com |`,
    tables: [
      {
        tableName: 'Person',
        schema: [
          { column: 'id', type: 'INT' },
          { column: 'email', type: 'VARCHAR' }
        ],
        rows: [
          [1, 'a@b.com'],
          [2, 'c@d.com'],
          [3, 'a@b.com']
        ]
      }
    ],
    setupSql: `
CREATE TABLE Person (id INT, email STRING);
INSERT INTO Person VALUES (1, 'a@b.com'), (2, 'c@d.com'), (3, 'a@b.com');
`,
    starterSql: `-- Write your SQL query statement below
SELECT 
    email AS Email
FROM Person
`,
    solutionSql: `
SELECT email AS Email
FROM Person
GROUP BY email
HAVING COUNT(email) > 1;
`,
    testCases: [
      {
        name: 'Case 1: Standard Duplicates',
        setupSql: `
CREATE TABLE Person (id INT, email STRING);
INSERT INTO Person VALUES (1, 'a@b.com'), (2, 'c@d.com'), (3, 'a@b.com');
`,
        tables: [
          {
            tableName: 'Person',
            schema: [{ column: 'id', type: 'INT' }, { column: 'email', type: 'VARCHAR' }],
            rows: [[1, 'a@b.com'], [2, 'c@d.com'], [3, 'a@b.com']]
          }
        ]
      },
      {
        name: 'Case 2: No Duplicates (All Unique)',
        setupSql: `
CREATE TABLE Person (id INT, email STRING);
INSERT INTO Person VALUES (1, 'john@doe.com'), (2, 'alice@crypto.com'), (3, 'bob@dev.com');
`,
        tables: [
          {
            tableName: 'Person',
            schema: [{ column: 'id', type: 'INT' }, { column: 'email', type: 'VARCHAR' }],
            rows: [[1, 'john@doe.com'], [2, 'alice@crypto.com'], [3, 'bob@dev.com']]
          }
        ]
      },
      {
        name: 'Case 3: Multiple Duplicate Sets',
        setupSql: `
CREATE TABLE Person (id INT, email STRING);
INSERT INTO Person VALUES (1, 'team@io.com'), (2, 'help@io.com'), (3, 'team@io.com'), (4, 'help@io.com'), (5, 'dev@io.com');
`,
        tables: [
          {
            tableName: 'Person',
            schema: [{ column: 'id', type: 'INT' }, { column: 'email', type: 'VARCHAR' }],
            rows: [[1, 'team@io.com'], [2, 'help@io.com'], [3, 'team@io.com'], [4, 'help@io.com'], [5, 'dev@io.com']]
          }
        ]
      }
    ]
  },

  'secondhighestsalary': {
    id: 'sql-2',
    title: 'Second Highest Salary',
    category: 'DBMS & SQL',
    difficulty: 'Medium',
    description: `Write a SQL query to find the second highest salary from the **Employee** table. If there is no second highest salary, the query should report **null**.

### Schema
**Employee** table:
| Column Name | Type |
| :--- | :--- |
| id | int |
| salary | int |

### Example
**Input:**
Employee table:
| id | salary |
| :--- | :--- |
| 1 | 100 |
| 2 | 200 |
| 3 | 300 |

**Output:**
| SecondHighestSalary |
| :--- |
| 200 |`,
    tables: [
      {
        tableName: 'Employee',
        schema: [
          { column: 'id', type: 'INT' },
          { column: 'salary', type: 'INT' }
        ],
        rows: [
          [1, 100],
          [2, 200],
          [3, 300]
        ]
      }
    ],
    setupSql: `
CREATE TABLE Employee (id INT, salary INT);
INSERT INTO Employee VALUES (1, 100), (2, 200), (3, 300);
`,
    starterSql: `-- Write your SQL query statement below
SELECT 
    
FROM Employee;
`,
    solutionSql: `
SELECT MAX(salary) AS SecondHighestSalary
FROM Employee
WHERE salary < (SELECT MAX(salary) FROM Employee);
`,
    testCases: [
      {
        name: 'Case 1: Standard Distinct Salaries',
        setupSql: `
CREATE TABLE Employee (id INT, salary INT);
INSERT INTO Employee VALUES (1, 100), (2, 200), (3, 300);
`,
        tables: [
          {
            tableName: 'Employee',
            schema: [{ column: 'id', type: 'INT' }, { column: 'salary', type: 'INT' }],
            rows: [[1, 100], [2, 200], [3, 300]]
          }
        ]
      },
      {
        name: 'Case 2: Single Employee (Returns NULL)',
        setupSql: `
CREATE TABLE Employee (id INT, salary INT);
INSERT INTO Employee VALUES (1, 100);
`,
        tables: [
          {
            tableName: 'Employee',
            schema: [{ column: 'id', type: 'INT' }, { column: 'salary', type: 'INT' }],
            rows: [[1, 100]]
          }
        ]
      },
      {
        name: 'Case 3: Duplicate Highest Salaries',
        setupSql: `
CREATE TABLE Employee (id INT, salary INT);
INSERT INTO Employee VALUES (1, 100), (2, 300), (3, 300);
`,
        tables: [
          {
            tableName: 'Employee',
            schema: [{ column: 'id', type: 'INT' }, { column: 'salary', type: 'INT' }],
            rows: [[1, 100], [2, 300], [3, 300]]
          }
        ]
      }
    ]
  },

  'combinetwotables': {
    id: 'sql-3',
    title: 'Combine Two Tables',
    category: 'DBMS & SQL',
    difficulty: 'Easy',
    description: `Write a SQL query to report the first name, last name, city, and state of each person in the **Person** table. If the address of a \`personId\` is not present in the **Address** table, report **null** instead.

### Schema
**Person** table:
| Column Name | Type |
| :--- | :--- |
| personId | int |
| lastName | varchar |
| firstName | varchar |

**Address** table:
| Column Name | Type |
| :--- | :--- |
| addressId | int |
| personId | int |
| city | varchar |
| state | varchar |`,
    tables: [
      {
        tableName: 'Person',
        schema: [
          { column: 'personId', type: 'INT' },
          { column: 'lastName', type: 'VARCHAR' },
          { column: 'firstName', type: 'VARCHAR' }
        ],
        rows: [
          [1, 'Wang', 'Allen'],
          [2, 'Alice', 'Bob']
        ]
      },
      {
        tableName: 'Address',
        schema: [
          { column: 'addressId', type: 'INT' },
          { column: 'personId', type: 'INT' },
          { column: 'city', type: 'VARCHAR' },
          { column: 'state', type: 'VARCHAR' }
        ],
        rows: [
          [1, 2, 'New York City', 'New York'],
          [2, 3, 'Leetcode', 'California']
        ]
      }
    ],
    setupSql: `
CREATE TABLE Person (personId INT, lastName STRING, firstName STRING);
INSERT INTO Person VALUES (1, 'Wang', 'Allen'), (2, 'Alice', 'Bob');

CREATE TABLE Address (addressId INT, personId INT, city STRING, state STRING);
INSERT INTO Address VALUES (1, 2, 'New York City', 'New York'), (2, 3, 'Leetcode', 'California');
`,
    starterSql: `-- Write your SQL query statement below (LEFT JOIN)
SELECT 
    
FROM Person p
`,
    solutionSql: `
SELECT 
    p.firstName, 
    p.lastName, 
    a.city, 
    a.state
FROM Person p
LEFT JOIN Address a ON p.personId = a.personId;
`,
    testCases: [
      {
        name: 'Case 1: Standard Left Join with Missing Address',
        setupSql: `
CREATE TABLE Person (personId INT, lastName STRING, firstName STRING);
INSERT INTO Person VALUES (1, 'Wang', 'Allen'), (2, 'Alice', 'Bob');

CREATE TABLE Address (addressId INT, personId INT, city STRING, state STRING);
INSERT INTO Address VALUES (1, 2, 'New York City', 'New York'), (2, 3, 'Leetcode', 'California');
`,
        tables: [
          {
            tableName: 'Person',
            schema: [{ column: 'personId', type: 'INT' }, { column: 'lastName', type: 'VARCHAR' }, { column: 'firstName', type: 'VARCHAR' }],
            rows: [[1, 'Wang', 'Allen'], [2, 'Alice', 'Bob']]
          },
          {
            tableName: 'Address',
            schema: [{ column: 'addressId', type: 'INT' }, { column: 'personId', type: 'INT' }, { column: 'city', type: 'VARCHAR' }, { column: 'state', type: 'VARCHAR' }],
            rows: [[1, 2, 'New York City', 'New York'], [2, 3, 'Leetcode', 'California']]
          }
        ]
      },
      {
        name: 'Case 2: All Persons Have Addresses',
        setupSql: `
CREATE TABLE Person (personId INT, lastName STRING, firstName STRING);
INSERT INTO Person VALUES (1, 'Smith', 'John'), (2, 'Doe', 'Jane');

CREATE TABLE Address (addressId INT, personId INT, city STRING, state STRING);
INSERT INTO Address VALUES (10, 1, 'Seattle', 'Washington'), (20, 2, 'Austin', 'Texas');
`,
        tables: [
          {
            tableName: 'Person',
            schema: [{ column: 'personId', type: 'INT' }, { column: 'lastName', type: 'VARCHAR' }, { column: 'firstName', type: 'VARCHAR' }],
            rows: [[1, 'Smith', 'John'], [2, 'Doe', 'Jane']]
          },
          {
            tableName: 'Address',
            schema: [{ column: 'addressId', type: 'INT' }, { column: 'personId', type: 'INT' }, { column: 'city', type: 'VARCHAR' }, { column: 'state', type: 'VARCHAR' }],
            rows: [[10, 1, 'Seattle', 'Washington'], [20, 2, 'Austin', 'Texas']]
          }
        ]
      }
    ]
  },

  'departmenthighestsalary': {
    id: 'sql-4',
    title: 'Department Highest Salary',
    category: 'DBMS & SQL',
    difficulty: 'Medium',
    description: `Write a SQL query to find employees who have the highest salary in each of the departments.

### Schema
**Employee** table:
| Column Name | Type |
| :--- | :--- |
| id | int |
| name | varchar |
| salary | int |
| departmentId | int |

**Department** table:
| Column Name | Type |
| :--- | :--- |
| id | int |
| name | varchar |`,
    tables: [
      {
        tableName: 'Employee',
        schema: [
          { column: 'id', type: 'INT' },
          { column: 'name', type: 'VARCHAR' },
          { column: 'salary', type: 'INT' },
          { column: 'departmentId', type: 'INT' }
        ],
        rows: [
          [1, 'Joe', 70000, 1],
          [2, 'Jim', 90000, 1],
          [3, 'Henry', 80000, 2],
          [4, 'Sam', 60000, 2],
          [5, 'Max', 90000, 1]
        ]
      },
      {
        tableName: 'Department',
        schema: [
          { column: 'id', type: 'INT' },
          { column: 'name', type: 'VARCHAR' }
        ],
        rows: [
          [1, 'IT'],
          [2, 'Sales']
        ]
      }
    ],
    setupSql: `
CREATE TABLE Employee (id INT, name STRING, salary INT, departmentId INT);
INSERT INTO Employee VALUES (1, 'Joe', 70000, 1), (2, 'Jim', 90000, 1), (3, 'Henry', 80000, 2), (4, 'Sam', 60000, 2), (5, 'Max', 90000, 1);

CREATE TABLE Department (id INT, name STRING);
INSERT INTO Department VALUES (1, 'IT'), (2, 'Sales');
`,
    starterSql: `-- Write your SQL query statement below
SELECT 
    
FROM Employee e
JOIN Department d ON e.departmentId = d.id;
`,
    solutionSql: `
SELECT 
    d.name AS Department,
    e.name AS Employee,
    e.salary AS Salary
FROM Employee e
JOIN Department d ON e.departmentId = d.id
WHERE e.salary = (
    SELECT MAX(salary) 
    FROM Employee e2 
    WHERE e2.departmentId = e.departmentId
);
`,
    testCases: [
      {
        name: 'Case 1: Tied Highest Salaries in IT',
        setupSql: `
CREATE TABLE Employee (id INT, name STRING, salary INT, departmentId INT);
INSERT INTO Employee VALUES (1, 'Joe', 70000, 1), (2, 'Jim', 90000, 1), (3, 'Henry', 80000, 2), (4, 'Sam', 60000, 2), (5, 'Max', 90000, 1);

CREATE TABLE Department (id INT, name STRING);
INSERT INTO Department VALUES (1, 'IT'), (2, 'Sales');
`,
        tables: [
          {
            tableName: 'Employee',
            schema: [{ column: 'id', type: 'INT' }, { column: 'name', type: 'VARCHAR' }, { column: 'salary', type: 'INT' }, { column: 'departmentId', type: 'INT' }],
            rows: [[1, 'Joe', 70000, 1], [2, 'Jim', 90000, 1], [3, 'Henry', 80000, 2], [4, 'Sam', 60000, 2], [5, 'Max', 90000, 1]]
          },
          {
            tableName: 'Department',
            schema: [{ column: 'id', type: 'INT' }, { column: 'name', type: 'VARCHAR' }],
            rows: [[1, 'IT'], [2, 'Sales']]
          }
        ]
      }
    ]
  },

  'customerswhoneverorder': {
    id: 'sql-5',
    title: 'Customers Who Never Order',
    category: 'DBMS & SQL',
    difficulty: 'Easy',
    description: `Write a SQL query to report all customers who never order anything.

### Schema
**Customers** table:
| Column Name | Type |
| :--- | :--- |
| id | int |
| name | varchar |

**Orders** table:
| Column Name | Type |
| :--- | :--- |
| id | int |
| customerId | int |`,
    tables: [
      {
        tableName: 'Customers',
        schema: [
          { column: 'id', type: 'INT' },
          { column: 'name', type: 'VARCHAR' }
        ],
        rows: [
          [1, 'Joe'],
          [2, 'Henry'],
          [3, 'Sam'],
          [4, 'Max']
        ]
      },
      {
        tableName: 'Orders',
        schema: [
          { column: 'id', type: 'INT' },
          { column: 'customerId', type: 'INT' }
        ],
        rows: [
          [1, 3],
          [2, 1]
        ]
      }
    ],
    setupSql: `
CREATE TABLE Customers (id INT, name STRING);
INSERT INTO Customers VALUES (1, 'Joe'), (2, 'Henry'), (3, 'Sam'), (4, 'Max');

CREATE TABLE Orders (id INT, customerId INT);
INSERT INTO Orders VALUES (1, 3), (2, 1);
`,
    starterSql: `-- Write your SQL query statement below
SELECT 
    
FROM Customers;
`,
    solutionSql: `
SELECT name AS Customers
FROM Customers
WHERE id NOT IN (SELECT customerId FROM Orders WHERE customerId IS NOT NULL);
`,
    testCases: [
      {
        name: 'Case 1: Standard Subset of Customers Ordered',
        setupSql: `
CREATE TABLE Customers (id INT, name STRING);
INSERT INTO Customers VALUES (1, 'Joe'), (2, 'Henry'), (3, 'Sam'), (4, 'Max');

CREATE TABLE Orders (id INT, customerId INT);
INSERT INTO Orders VALUES (1, 3), (2, 1);
`,
        tables: [
          {
            tableName: 'Customers',
            schema: [{ column: 'id', type: 'INT' }, { column: 'name', type: 'VARCHAR' }],
            rows: [[1, 'Joe'], [2, 'Henry'], [3, 'Sam'], [4, 'Max']]
          },
          {
            tableName: 'Orders',
            schema: [{ column: 'id', type: 'INT' }, { column: 'customerId', type: 'INT' }],
            rows: [[1, 3], [2, 1]]
          }
        ]
      },
      {
        name: 'Case 2: All Customers Placed Orders',
        setupSql: `
CREATE TABLE Customers (id INT, name STRING);
INSERT INTO Customers VALUES (1, 'Alice'), (2, 'Bob');

CREATE TABLE Orders (id INT, customerId INT);
INSERT INTO Orders VALUES (10, 1), (20, 2);
`,
        tables: [
          {
            tableName: 'Customers',
            schema: [{ column: 'id', type: 'INT' }, { column: 'name', type: 'VARCHAR' }],
            rows: [[1, 'Alice'], [2, 'Bob']]
          },
          {
            tableName: 'Orders',
            schema: [{ column: 'id', type: 'INT' }, { column: 'customerId', type: 'INT' }],
            rows: [[10, 1], [20, 2]]
          }
        ]
      }
    ]
  }
};

/**
 * Generates an SQL problem grounded directly in the lecture transcript and notes.
 */
export function generateSQLProblem(
  title: string,
  transcript: string = '',
  notes: string = ''
): SQLProblem {
  const cleanTitle = (title || 'DBMS Query Studio')
    .replace(/\.(mp4|mkv|webm)$/i, '')
    .replace(/_/g, ' ');

  const lowerTitle = cleanTitle.toLowerCase();
  const lowerTranscript = (transcript || '').toLowerCase();
  const lowerNotes = (notes || '').toLowerCase();
  const combined = `${lowerTitle} ${lowerTranscript} ${lowerNotes}`;

  if (combined.includes('duplicate') || combined.includes('having count') || combined.includes('emails')) {
    return PREDEFINED_SQL_PROBLEMS['duplicateemails'];
  }
  if (combined.includes('second highest') || combined.includes('2nd highest') || combined.includes('nth highest')) {
    return PREDEFINED_SQL_PROBLEMS['secondhighestsalary'];
  }
  if (combined.includes('join') || combined.includes('inner join') || combined.includes('left join') || combined.includes('combine two tables')) {
    return PREDEFINED_SQL_PROBLEMS['combinetwotables'];
  }
  if (combined.includes('highest salary') || combined.includes('department') || (combined.includes('group by') && combined.includes('max'))) {
    return PREDEFINED_SQL_PROBLEMS['departmenthighestsalary'];
  }
  if (combined.includes('not in') || combined.includes('customers') || combined.includes('never order') || combined.includes('subquery') || combined.includes('subqueries')) {
    return PREDEFINED_SQL_PROBLEMS['customerswhoneverorder'];
  }

  // Dynamic problem grounded in lecture transcript
  let transcriptSnippet = '';
  if (transcript && transcript.length > 50) {
    const rawExcerpt = transcript.slice(0, 350).replace(/\n+/g, ' ').trim();
    transcriptSnippet = `\n\n📌 **Key Concepts Taught in Lecture Transcript:**\n"${rawExcerpt}..."`;
  }

  return {
    id: `sql-dynamic-${Date.now()}`,
    title: cleanTitle,
    category: 'DBMS & SQL',
    difficulty: 'Medium',
    description: `Write a SQL query to solve the data aggregation and relational constraint requirements explained in **${cleanTitle}**.
${transcriptSnippet}

### Schema
**Employee** table:
| Column Name | Type |
| :--- | :--- |
| id | int |
| name | varchar |
| salary | int |
| departmentId | int |

**Department** table:
| Column Name | Type |
| :--- | :--- |
| id | int |
| name | varchar |`,
    tables: [
      {
        tableName: 'Employee',
        schema: [
          { column: 'id', type: 'INT' },
          { column: 'name', type: 'VARCHAR' },
          { column: 'salary', type: 'INT' },
          { column: 'departmentId', type: 'INT' }
        ],
        rows: [
          [1, 'Joe', 85000, 1],
          [2, 'Henry', 80000, 2],
          [3, 'Sam', 60000, 2],
          [4, 'Max', 90000, 1]
        ]
      },
      {
        tableName: 'Department',
        schema: [
          { column: 'id', type: 'INT' },
          { column: 'name', type: 'VARCHAR' }
        ],
        rows: [
          [1, 'IT'],
          [2, 'Sales']
        ]
      }
    ],
    setupSql: `
CREATE TABLE Employee (id INT, name STRING, salary INT, departmentId INT);
INSERT INTO Employee VALUES (1, 'Joe', 85000, 1), (2, 'Henry', 80000, 2), (3, 'Sam', 60000, 2), (4, 'Max', 90000, 1);

CREATE TABLE Department (id INT, name STRING);
INSERT INTO Department VALUES (1, 'IT'), (2, 'Sales');
`,
    starterSql: `-- Write your SQL query statement below
SELECT 
    
FROM Employee e;
`,
    solutionSql: `
SELECT 
    d.name AS Department,
    e.name AS Employee,
    e.salary AS Salary
FROM Employee e
JOIN Department d ON e.departmentId = d.id
WHERE e.salary >= 80000
ORDER BY e.salary DESC;
`,
    testCases: [
      {
        name: 'Case 1: Standard Multi-Department Records',
        setupSql: `
CREATE TABLE Employee (id INT, name STRING, salary INT, departmentId INT);
INSERT INTO Employee VALUES (1, 'Joe', 85000, 1), (2, 'Henry', 80000, 2), (3, 'Sam', 60000, 2), (4, 'Max', 90000, 1);

CREATE TABLE Department (id INT, name STRING);
INSERT INTO Department VALUES (1, 'IT'), (2, 'Sales');
`,
        tables: [
          {
            tableName: 'Employee',
            schema: [{ column: 'id', type: 'INT' }, { column: 'name', type: 'VARCHAR' }, { column: 'salary', type: 'INT' }, { column: 'departmentId', type: 'INT' }],
            rows: [[1, 'Joe', 85000, 1], [2, 'Henry', 80000, 2], [3, 'Sam', 60000, 2], [4, 'Max', 90000, 1]]
          },
          {
            tableName: 'Department',
            schema: [{ column: 'id', type: 'INT' }, { column: 'name', type: 'VARCHAR' }],
            rows: [[1, 'IT'], [2, 'Sales']]
          }
        ]
      },
      {
        name: 'Case 2: Single Department Edge Case',
        setupSql: `
CREATE TABLE Employee (id INT, name STRING, salary INT, departmentId INT);
INSERT INTO Employee VALUES (10, 'Zara', 95000, 1);

CREATE TABLE Department (id INT, name STRING);
INSERT INTO Department VALUES (1, 'Engineering');
`,
        tables: [
          {
            tableName: 'Employee',
            schema: [{ column: 'id', type: 'INT' }, { column: 'name', type: 'VARCHAR' }, { column: 'salary', type: 'INT' }, { column: 'departmentId', type: 'INT' }],
            rows: [[10, 'Zara', 95000, 1]]
          },
          {
            tableName: 'Department',
            schema: [{ column: 'id', type: 'INT' }, { column: 'name', type: 'VARCHAR' }],
            rows: [[1, 'Engineering']]
          }
        ]
      }
    ]
  };
}

/**
 * Executes a student SQL query against an in-memory AlaSQL sandbox and compares with solution query.
 * Can evaluate a specific test case (by index) or all test cases.
 */
export async function executeAndJudgeSQL(
  userSql: string,
  problem: SQLProblem,
  testCaseIdx: number = 0
): Promise<SQLJudgeResult> {
  const startTime = Date.now();
  const dbId = 'db_' + Math.random().toString(36).substring(2, 9);
  const activeTestCase = problem.testCases?.[testCaseIdx] || {
    name: 'Case 1',
    setupSql: problem.setupSql,
    tables: problem.tables
  };

  try {
    alasql(`CREATE DATABASE ${dbId}`);
    alasql(`USE ${dbId}`);

    // Run Setup DDL & DML for the active testcase
    const statements = activeTestCase.setupSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      alasql(stmt);
    }

    // Run Reference Solution Query to obtain Golden Expected Output
    let expectedRaw: any = [];
    try {
      expectedRaw = alasql(problem.solutionSql);
    } catch (solErr: any) {
      console.warn('[SQL Judge] Solution execution warning:', solErr);
    }

    const expectedColumns = Array.isArray(expectedRaw) && expectedRaw.length > 0
      ? Object.keys(expectedRaw[0])
      : [];

    const expectedRows = Array.isArray(expectedRaw)
      ? expectedRaw.map((obj: any) => expectedColumns.map(col => obj[col]))
      : [];

    // Run Student SQL Query
    const userCleanSql = userSql.trim().replace(/;+$/, '');
    let userRaw: any = [];

    try {
      userRaw = alasql(userCleanSql);
    } catch (syntaxErr: any) {
      const elapsed = Date.now() - startTime;
      alasql(`DROP DATABASE ${dbId}`);
      return {
        status: 'SYNTAX_ERROR',
        executionTimeMs: elapsed,
        columns: [],
        rows: [],
        expectedColumns,
        expectedRows,
        errorMessage: syntaxErr?.message || 'SQL Syntax Error: Unable to execute statement.',
        tables: activeTestCase.tables,
        testCaseIdx
      };
    }

    const userColumns = Array.isArray(userRaw) && userRaw.length > 0
      ? Object.keys(userRaw[0])
      : (typeof userRaw === 'object' && userRaw !== null ? Object.keys(userRaw) : []);

    const userRows = Array.isArray(userRaw)
      ? userRaw.map((obj: any) => userColumns.map(col => obj[col]))
      : [];

    const elapsed = Date.now() - startTime;

    // Compare columns and rows
    const isColsMatch = userColumns.length === expectedColumns.length &&
      userColumns.every((c, i) => c.toLowerCase() === expectedColumns[i].toLowerCase());

    const normalizeRow = (r: any[]) => JSON.stringify(r.map(v => v === undefined || v === null ? null : String(v).trim()));
    
    const isOrdered = problem.solutionSql.toLowerCase().includes('order by');
    
    let isRowsMatch = false;
    if (userRows.length === expectedRows.length) {
      if (isOrdered) {
        isRowsMatch = userRows.every((r, idx) => normalizeRow(r) === normalizeRow(expectedRows[idx]));
      } else {
        const sortedUser = [...userRows].map(normalizeRow).sort();
        const sortedExpected = [...expectedRows].map(normalizeRow).sort();
        isRowsMatch = sortedUser.every((r, idx) => r === sortedExpected[idx]);
      }
    }

    const status = (isColsMatch && isRowsMatch) ? 'ACCEPTED' : 'WRONG_ANSWER';

    alasql(`DROP DATABASE ${dbId}`);

    return {
      status,
      executionTimeMs: elapsed,
      columns: userColumns,
      rows: userRows,
      expectedColumns,
      expectedRows,
      tables: activeTestCase.tables,
      testCaseIdx
    };
  } catch (globalErr: any) {
    try {
      alasql(`DROP DATABASE ${dbId}`);
    } catch {}
    const elapsed = Date.now() - startTime;
    return {
      status: 'SYNTAX_ERROR',
      executionTimeMs: elapsed,
      columns: [],
      rows: [],
      expectedColumns: [],
      expectedRows: [],
      errorMessage: globalErr?.message || 'Database engine exception.',
      tables: activeTestCase.tables,
      testCaseIdx
    };
  }
}
