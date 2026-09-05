import { executeCode, SupportedLanguage, compareOutputs, CodeExecutionResult } from './compiler';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  timeLimitMs?: number;
}

export interface TestResultItem {
  testId: string;
  status: 'PASS' | 'FAIL' | 'TLE' | 'RUNTIME_ERROR';
  input: string;
  expectedOutput: string;
  actualOutput: string;
  timeMs: number;
  memoryKb?: number;
  error?: string;
  isHidden: boolean;
}

export interface TestSuiteExecutionReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  hiddenTestsPassed: number;
  hiddenTestsTotal: number;
  executionTimeMs: number;
  peakMemoryKb: number;
  results: TestResultItem[];
  verdict: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILE_ERROR';
  summaryMessage: string;
  formattedEvaluationContext: string;
}

export const TEST_CASE_DELIMITER = '__TEST_CASE_DELIMITER__';

/**
 * Wraps candidate code with a deterministic harness that feeds test cases,
 * captures execution time, and outputs structured assertions.
 */
export function wrapCandidateCode(
  candidateCode: string,
  testCases: TestCase[],
  language: SupportedLanguage
): { wrappedCode: string; stdinPayload: string } {
  const stdinPayload = testCases
    .map(tc => tc.input.trim())
    .join(`\n${TEST_CASE_DELIMITER}\n`);

  if (language === 'python') {
    const wrappedCode = `
import sys, time, json

# === CANDIDATE SOLUTION ===
${candidateCode}

# === DETERMINISTIC TEST HARNESS ===
def __run_harness():
    raw_input = sys.stdin.read()
    if not raw_input.strip():
        return
    cases = raw_input.split("${TEST_CASE_DELIMITER}")
    for idx, case_str in enumerate(cases):
        case_str = case_str.strip()
        if not case_str:
            continue
        print(f"---TEST_START_{idx}---")
        t0 = time.perf_counter()
        try:
            # Execute line or pass to solution
            # If Solution class exists, invoke dynamically
            if 'Solution' in globals():
                sol = Solution()
                # Attempt to parse inputs as lines
                lines = [l.strip() for l in case_str.split('\\n') if l.strip()]
                # If single JSON array/arg, evaluate
                args = []
                for l in lines:
                    try:
                        args.append(json.loads(l))
                    except:
                        args.append(l)
                # Find first non-dunder method
                methods = [m for m in dir(sol) if not m.startswith('_')]
                if methods:
                    fn = getattr(sol, methods[0])
                    res = fn(*args)
                    print(json.dumps(res) if res is not None else "")
                else:
                    print("No callable method on Solution")
            else:
                print("Solution class not found")
        except Exception as e:
            print(f"__ERROR__:{str(e)}")
        t1 = time.perf_counter()
        print(f"---TIME_MS:{(t1 - t0)*1000:.2f}---")
        print(f"---TEST_END_{idx}---")

if __name__ == '__main__':
    __run_harness()
`;
    return { wrappedCode, stdinPayload };
  }

  if (language === 'cpp') {
    const wrappedCode = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <chrono>
#include <algorithm>
using namespace std;

// === CANDIDATE SOLUTION ===
${candidateCode}

// === DETERMINISTIC TEST HARNESS ===
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string line, currentCase = "";
    int caseIdx = 0;
    
    auto executeCase = [&](int idx, const string& input) {
        cout << "---TEST_START_" << idx << "---\\n";
        auto t0 = chrono::high_resolution_clock::now();
        try {
            // Solution invocation
            #ifdef SOLUTION_EXISTS
            Solution sol;
            #endif
        } catch (const exception& e) {
            cout << "__ERROR__:" << e.what() << "\\n";
        } catch (...) {
            cout << "__ERROR__:Unknown Runtime Exception\\n";
        }
        auto t1 = chrono::high_resolution_clock::now();
        double ms = chrono::duration<double, milli>(t1 - t0).count();
        cout << "\\n---TIME_MS:" << ms << "---\\n";
        cout << "---TEST_END_" << idx << "---\\n";
    };

    while (getline(cin, line)) {
        if (line.find("${TEST_CASE_DELIMITER}") != string::npos) {
            executeCase(caseIdx++, currentCase);
            currentCase = "";
        } else {
            currentCase += line + "\\n";
        }
    }
    if (!currentCase.empty()) {
        executeCase(caseIdx++, currentCase);
    }
    return 0;
}
`;
    return { wrappedCode, stdinPayload };
  }

  if (language === 'java') {
    const wrappedCode = `
import java.io.*;
import java.util.*;

// === CANDIDATE SOLUTION ===
${candidateCode}

// === DETERMINISTIC TEST HARNESS ===
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        StringBuilder currentCase = new StringBuilder();
        int caseIdx = 0;

        while (scanner.hasNextLine()) {
            String line = scanner.nextLine();
            if (line.contains("${TEST_CASE_DELIMITER}")) {
                executeCase(caseIdx++, currentCase.toString());
                currentCase = new StringBuilder();
            } else {
                currentCase.append(line).append("\\n");
            }
        }
        if (currentCase.length() > 0) {
            executeCase(caseIdx++, currentCase.toString());
        }
    }

    private static void executeCase(int idx, String input) {
        System.out.println("---TEST_START_" + idx + "---");
        long t0 = System.nanoTime();
        try {
            // Solution instantiation and execution
            Solution sol = new Solution();
        } catch (Exception e) {
            System.out.println("__ERROR__:" + e.getMessage());
        } catch (Throwable t) {
            System.out.println("__ERROR__:Fatal " + t.getClass().getSimpleName());
        }
        long t1 = System.nanoTime();
        double ms = (t1 - t0) / 1000000.0;
        System.out.printf(Locale.US, "---TIME_MS:%.2f---\\n", ms);
        System.out.println("---TEST_END_" + idx + "---");
    }
}
`;
    return { wrappedCode, stdinPayload };
  }

  if (language === 'javascript') {
    const wrappedCode = `
// === CANDIDATE SOLUTION ===
${candidateCode}

// === DETERMINISTIC TEST HARNESS ===
const fs = require('fs');
const rawInput = fs.readFileSync(0, 'utf-8');
const cases = rawInput.split("${TEST_CASE_DELIMITER}");

cases.forEach((caseStr, idx) => {
    const trimmed = caseStr.trim();
    if (!trimmed) return;
    console.log(\`---TEST_START_\${idx}---\`);
    const t0 = performance.now();
    try {
        const lines = trimmed.split('\\n').map(l => l.trim()).filter(Boolean);
        const args = lines.map(l => {
            try { return JSON.parse(l); } catch { return l; }
        });
        // Look for functions in global scope or Solution
        if (typeof Solution === 'function') {
            const sol = new Solution();
            const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(sol)).filter(m => m !== 'constructor');
            if (methods.length > 0) {
                const res = sol[methods[0]](...args);
                console.log(res !== undefined ? JSON.stringify(res) : "");
            }
        } else {
            console.log("Solution class not defined");
        }
    } catch (err) {
        console.log("__ERROR__:" + err.message);
    }
    const t1 = performance.now();
    console.log(\`---TIME_MS:\${(t1 - t0).toFixed(2)}---\`);
    console.log(\`---TEST_END_\${idx}---\`);
});
`;
    return { wrappedCode, stdinPayload };
  }

  // Generic fallback
  return { wrappedCode: candidateCode, stdinPayload };
}

/**
 * Executes candidate code sequentially against all test cases using the compiler engine
 * and returns a rich test suite report with per-test execution times and memory metrics.
 */
export async function runTestSuiteAgainstCompiler(
  candidateCode: string,
  testCases: TestCase[],
  language: SupportedLanguage,
  problemTitle: string = 'Interview Problem'
): Promise<TestSuiteExecutionReport> {
  if (!testCases || testCases.length === 0) {
    return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      hiddenTestsPassed: 0,
      hiddenTestsTotal: 0,
      executionTimeMs: 0,
      peakMemoryKb: 0,
      results: [],
      verdict: 'ACCEPTED',
      summaryMessage: 'No test cases specified.',
      formattedEvaluationContext: '[NO TEST SUITE CONFIGURED]'
    };
  }

  const results: TestResultItem[] = [];
  let totalTimeMs = 0;
  let peakMemory = 0;
  let hasCompileOrRuntimeErr = false;

  // Run test cases sequentially or in parallel batches
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const execStart = performance.now();

    try {
      const res: CodeExecutionResult = await executeCode(
        candidateCode,
        language,
        tc.input,
        problemTitle
      );

      const execTime = res.execution_time_ms || Math.round(performance.now() - execStart);
      totalTimeMs += execTime;
      peakMemory = Math.max(peakMemory, res.memory_used_kb || 0);

      const isError = res.status === 'ERROR' || res.exit_code !== 0;
      const isTLE = tc.timeLimitMs ? execTime > tc.timeLimitMs : execTime > 3000;

      if (isError) {
        hasCompileOrRuntimeErr = true;
        results.push({
          testId: tc.id,
          status: 'RUNTIME_ERROR',
          input: tc.isHidden ? '[HIDDEN TEST VECTOR]' : tc.input,
          expectedOutput: tc.isHidden ? '[HIDDEN]' : tc.expectedOutput,
          actualOutput: res.stdout || '',
          timeMs: execTime,
          memoryKb: res.memory_used_kb,
          error: res.stderr || 'Runtime execution error',
          isHidden: tc.isHidden
        });
      } else if (isTLE) {
        results.push({
          testId: tc.id,
          status: 'TLE',
          input: tc.isHidden ? '[HIDDEN TEST VECTOR]' : tc.input,
          expectedOutput: tc.isHidden ? '[HIDDEN]' : tc.expectedOutput,
          actualOutput: 'Time Limit Exceeded (> 3000ms)',
          timeMs: execTime,
          memoryKb: res.memory_used_kb,
          isHidden: tc.isHidden
        });
      } else {
        const isMatch = compareOutputs(res.stdout, tc.expectedOutput);
        results.push({
          testId: tc.id,
          status: isMatch ? 'PASS' : 'FAIL',
          input: tc.isHidden ? '[HIDDEN TEST VECTOR]' : tc.input,
          expectedOutput: tc.isHidden ? '[HIDDEN]' : tc.expectedOutput,
          actualOutput: res.stdout.trim(),
          timeMs: execTime,
          memoryKb: res.memory_used_kb,
          isHidden: tc.isHidden
        });
      }
    } catch (err: any) {
      results.push({
        testId: tc.id,
        status: 'RUNTIME_ERROR',
        input: tc.isHidden ? '[HIDDEN TEST VECTOR]' : tc.input,
        expectedOutput: tc.isHidden ? '[HIDDEN]' : tc.expectedOutput,
        actualOutput: '',
        timeMs: 0,
        error: err?.message || 'Execution failed',
        isHidden: tc.isHidden
      });
    }
  }

  const passedTests = results.filter(r => r.status === 'PASS').length;
  const failedTests = results.length - passedTests;
  const hiddenTests = results.filter(r => r.isHidden);
  const hiddenTestsPassed = hiddenTests.filter(r => r.status === 'PASS').length;

  let verdict: TestSuiteExecutionReport['verdict'] = 'ACCEPTED';
  if (hasCompileOrRuntimeErr) {
    verdict = 'RUNTIME_ERROR';
  } else if (results.some(r => r.status === 'TLE')) {
    verdict = 'TIME_LIMIT_EXCEEDED';
  } else if (failedTests > 0) {
    verdict = 'WRONG_ANSWER';
  }

  const summaryMessage = `${passedTests}/${results.length} Test Cases Passed (${hiddenTestsPassed}/${hiddenTests.length} Hidden Tests). Verdict: ${verdict}. Total Runtime: ${totalTimeMs}ms.`;

  // Formatted block for LLM Bar Raiser prompt context injection
  const formattedEvaluationContext = `[DETERMINISTIC TEST SUITE EXECUTION REPORT]:
- Verdict: ${verdict}
- Total Tests: ${results.length} (Passed: ${passedTests}, Failed: ${failedTests})
- Hidden Test Defense: ${hiddenTestsPassed}/${hiddenTests.length} Hidden Corner Cases Passed
- Aggregate Execution Time: ${totalTimeMs} ms | Peak Memory: ${peakMemory} KB
${results.map((r, idx) => `  * Test #${idx + 1} (${r.isHidden ? 'Hidden' : 'Public'}): ${r.status} [${r.timeMs}ms] ${r.status !== 'PASS' ? `| Expected: ${r.expectedOutput} | Actual: ${r.actualOutput} ${r.error ? `| Error: ${r.error}` : ''}` : ''}`).join('\n')}`;

  return {
    totalTests: results.length,
    passedTests,
    failedTests,
    hiddenTestsPassed,
    hiddenTestsTotal: hiddenTests.length,
    executionTimeMs: totalTimeMs,
    peakMemoryKb: peakMemory,
    results,
    verdict,
    summaryMessage,
    formattedEvaluationContext
  };
}
