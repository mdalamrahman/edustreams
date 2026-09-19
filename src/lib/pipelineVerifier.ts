import { executeCode, SupportedLanguage, compareOutputs, isValidHeightBalancedBSTForNums, isDriverHarnessValid } from './compiler';
import { getDefaultDriverForProblem, fetchOrGenerateDriverCode, toSlug } from './problemService';
import { executeAIChatCascade } from './mistral';
import { TELEGRAM_BACKEND_URL } from './telegram';

export interface PipelineTestCaseResult {
  index: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  runtimeMs: number;
  memoryKb: number;
  error?: string;
}

export interface PipelineVerificationProgress {
  stage: 'fetching_solution' | 'resolving_driver' | 'running_cases' | 'evaluating' | 'ai_healing' | 'completed';
  currentCase?: number;
  totalCases?: number;
  attempt?: number;
  maxAttempts?: number;
  message: string;
}

export interface PipelineVerificationParams {
  slug: string;
  problemTitle: string;
  problemStatement?: string;
  language: SupportedLanguage;
  starterCode?: string;
  testCases: string[];
  expectedOutputs: string[];
  existingSolutionCode?: string;
  existingDriverCode?: string;
  onProgress?: (progress: PipelineVerificationProgress) => void;
}

export interface PipelineVerificationResult {
  status: 'VERIFIED_SUCCESS' | 'HEALED_AND_VERIFIED' | 'DISCREPANCY_UNRESOLVED';
  passedCount: number;
  totalCount: number;
  attemptsUsed: number;
  healed: boolean;
  healingDiagnosis?: string;
  defectType?: 'solution' | 'driver' | 'testcase' | 'none';
  solutionCode: string;
  driverCode?: string;
  testCaseResults: PipelineTestCaseResult[];
  overallRuntimeMs: number;
  repairedAssets?: {
    solutionRepaired: boolean;
    driverRepaired: boolean;
    expectedOutputsRepaired: boolean;
    repairedExpectedOutputs?: string[];
  };
}

/**
 * Validates actual output against expected output taking into account
 * flexible formatting, floating points, arrays, and multi-valid BST problems.
 */
export function isOutputValidForTestCase(
  stdout: string,
  stderr: string,
  expectedOutput: string,
  caseInput?: string,
  problemSlug?: string
): boolean {
  const isFatalStderr = Boolean(
    stderr && (
      stderr.includes('error:') ||
      stderr.includes('Runtime Error') ||
      stderr.includes('Traceback') ||
      stderr.includes('Exception') ||
      stderr.includes('SyntaxError') ||
      stderr.includes('Segmentation fault') ||
      stderr.includes('SIGSEGV') ||
      stderr.includes('SIGABRT')
    )
  );
  if (isFatalStderr) return false;
  if (!stdout || !stdout.trim()) return false;

  const cleanSlug = problemSlug ? problemSlug.toLowerCase() : '';
  if (cleanSlug.includes('convert-sorted-array-to-binary-search-tree') && caseInput) {
    if (isValidHeightBalancedBSTForNums(stdout, caseInput)) {
      return true;
    }
  }

  if (cleanSlug.includes('serialize-and-deserialize')) {
    const normActual = stdout.trim().replace(/\s+/g, '');
    const normExp = String(expectedOutput ?? '').trim().replace(/\s+/g, '');
    if (normActual === normExp) return true;
  }

  const expStr = String(expectedOutput ?? '').trim();
  if (!expStr) return stdout.trim().length > 0;
  return compareOutputs(stdout, expStr);
}

/**
 * Resolves or fetches the backend reference solution for a given problem and language.
 */
async function resolveReferenceSolution(
  slug: string,
  problemTitle: string,
  language: SupportedLanguage,
  starterCode?: string,
  existingSolutionCode?: string,
  problemStatement?: string
): Promise<string> {
  // 1. If an existing non-starter solution was passed in, check if it's usable
  if (existingSolutionCode && existingSolutionCode.trim().length > 20 && existingSolutionCode !== starterCode) {
    return existingSolutionCode.trim();
  }

  // 2. Check local browser cache
  try {
    const cachedStr = localStorage.getItem(`edustream_ai_solutions_${slug}`);
    if (cachedStr) {
      const parsed = JSON.parse(cachedStr);
      const sol = parsed[language]?.code || parsed[language];
      if (sol && typeof sol === 'string' && sol.trim().length > 20 && sol !== starterCode) {
        return sol.trim();
      }
    }
  } catch (_) {}

  // 3. Try fetching from Cloudflare R2 / Backend
  try {
    const endpoints = [
      `/api/problem/${encodeURIComponent(slug)}/solution/${encodeURIComponent(language)}`,
      `${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/solution/${encodeURIComponent(language)}`,
      `https://sdetube.pages.dev/api/problem/${encodeURIComponent(slug)}/solution/${encodeURIComponent(language)}`
    ];
    for (const url of endpoints) {
      try {
        const resp = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (resp.ok) {
          const data = await resp.json();
          const sol = data?.code || data?.solution;
          if (sol && typeof sol === 'string' && sol.trim().length > 20) {
            return sol.trim();
          }
        }
      } catch (_) {}
    }
  } catch (_) {}

  // 4. Generate with AI Cascade if no solution exists in storage
  const prompt = `You are a Principal Software Engineer and Competitive Programming Grandmaster.
Write an optimal, bug-free, fully implemented LeetCode reference solution in ${language.toUpperCase()} for the problem "${problemTitle}".

Problem Statement:
${problemStatement || problemTitle}

Starter Code template:
\`\`\`${language}
${starterCode || ''}
\`\`\`

Requirements:
- Provide ONLY the complete Solution class/function.
- Adhere strictly to optimal time and space complexity.
- Handle all edge cases: empty structures, boundary constraints, single elements, negative numbers.
- Do NOT wrap with main() or driver harnesses.

Respond with ONLY the raw code inside a single markdown code fence.`;

  const aiResp = await executeAIChatCascade([
    { role: 'user', content: prompt }
  ], { temperature: 0.1 });

  if (aiResp) {
    const codeMatch = aiResp.match(/```(?:[a-zA-Z]*)\n([\s\S]*?)```/);
    const cleanedCode = (codeMatch ? codeMatch[1] : aiResp).trim();
    if (cleanedCode.length > 20) {
      return cleanedCode;
    }
  }

  return starterCode || '// No reference solution available';
}

/**
 * Main Pipeline Verification and Self-Healing Engine
 */
export async function verifyAndHealPipeline(
  params: PipelineVerificationParams
): Promise<PipelineVerificationResult> {
  const {
    slug,
    problemTitle,
    problemStatement = '',
    language,
    starterCode = '',
    testCases,
    expectedOutputs,
    existingSolutionCode,
    existingDriverCode,
    onProgress
  } = params;

  const totalCases = Math.max(1, testCases.length);
  const startTime = Date.now();

  // Step 1: Resolve Reference Solution
  onProgress?.({
    stage: 'fetching_solution',
    message: `Fetching official reference solution for ${language.toUpperCase()}...`
  });

  let currentSolution = await resolveReferenceSolution(
    slug,
    problemTitle,
    language,
    starterCode,
    existingSolutionCode,
    problemStatement
  );

  // Step 2: Resolve Driver Code
  onProgress?.({
    stage: 'resolving_driver',
    message: `Validating execution driver harness for ${language.toUpperCase()}...`
  });

  const builtInDriver = getDefaultDriverForProblem(slug, language);
  let currentDriver = builtInDriver || existingDriverCode;
  if (!currentDriver || !isDriverHarnessValid(currentDriver, language, starterCode)) {
    const sampleCase = testCases[0] || '';
    const fetched = await fetchOrGenerateDriverCode(slug, language, starterCode, sampleCase);
    if (fetched) {
      currentDriver = fetched;
    }
  }

  let activeExpectedOutputs = [...expectedOutputs];

  // Self-heal corrupted expected outputs for serialize-and-deserialize-binary-tree
  if (slug.includes('serialize-and-deserialize')) {
    activeExpectedOutputs = activeExpectedOutputs.map((eo, idx) => {
      const s = String(eo || '').trim();
      if (s.includes(' or ') || s.includes('#') || !s.startsWith('[')) {
        const tc = testCases[idx] || '';
        const lb = tc.indexOf('[');
        const rb = tc.lastIndexOf(']');
        if (lb !== -1 && rb !== -1 && rb > lb) {
          const rawTree = tc.substring(lb, rb + 1).replace(/\s+/g, '');
          return rawTree.replace(/(,null)+\]$/, ']');
        }
        return '[]';
      }
      return eo;
    });
  }

  let healed = false;
  let healingDiagnosis: string | undefined;
  let defectType: 'solution' | 'driver' | 'testcase' | 'none' = 'none';
  let solutionRepaired = false;
  let driverRepaired = false;
  let expectedOutputsRepaired = false;

  const MAX_HEALING_ATTEMPTS = 3;
  let lastTestResults: PipelineTestCaseResult[] = [];
  let attemptsUsed = 0;
  const healingHistory: Array<{
    attempt: number;
    passed: number;
    total: number;
    failedInput?: string;
    expectedOutput?: string;
    actualOutput?: string;
    error?: string;
    diagnosis?: string;
  }> = [];

  // Run execution loop: initial test + up to MAX_HEALING_ATTEMPTS if failures occur
  for (let attempt = 1; attempt <= MAX_HEALING_ATTEMPTS + 1; attempt++) {
    attemptsUsed = attempt;
    const isHealingAttempt = attempt > 1;

    onProgress?.({
      stage: 'running_cases',
      attempt,
      maxAttempts: MAX_HEALING_ATTEMPTS + 1,
      totalCases,
      message: isHealingAttempt
        ? `Re-evaluating repaired pipeline across all ${totalCases} test cases (Attempt ${attempt - 1}/${MAX_HEALING_ATTEMPTS})...`
        : `Executing reference solution on Judge0 across ${totalCases} test cases...`
    });

    const caseResults: PipelineTestCaseResult[] = [];
    let allPassed = true;

    for (let i = 0; i < totalCases; i++) {
      const tcInput = testCases[i] || '';
      const tcExpected = activeExpectedOutputs[i] || '';

      onProgress?.({
        stage: 'running_cases',
        currentCase: i + 1,
        totalCases,
        attempt,
        maxAttempts: MAX_HEALING_ATTEMPTS + 1,
        message: `Running Test Case ${i + 1} of ${totalCases}...`
      });

      const caseStart = Date.now();
      let execRes;
      try {
        execRes = await executeCode(currentSolution, language, tcInput, problemTitle, currentDriver);
      } catch (err: any) {
        execRes = {
          status: 'ERROR',
          stdout: '',
          stderr: String(err?.message || err),
          execution_time_ms: 0,
          memory_used_kb: 0
        };
      }

      const caseDuration = Math.max(2, Date.now() - caseStart);
      const passed = execRes.status === 'SUCCESS' && isOutputValidForTestCase(
        execRes.stdout,
        execRes.stderr || '',
        tcExpected,
        tcInput,
        slug
      );

      if (!passed) {
        allPassed = false;
      }

      caseResults.push({
        index: i,
        input: tcInput,
        expectedOutput: tcExpected,
        actualOutput: execRes.stdout || '',
        passed,
        runtimeMs: execRes.execution_time_ms || caseDuration,
        memoryKb: execRes.memory_used_kb || 3500,
        error: passed ? undefined : (execRes.stderr || (execRes.status !== 'SUCCESS' ? `Status: ${execRes.status}` : 'Output Mismatch'))
      });
    }

    lastTestResults = caseResults;

    // If all passed, we are done!
    if (allPassed) {
      if (isHealingAttempt) {
        healed = true;
      }
      break;
    }

    // Record failure in healing history for context in next attempts
    const failedCases = caseResults.filter(c => !c.passed);
    const firstFailure = failedCases[0] || {} as any;
    healingHistory.push({
      attempt,
      passed: caseResults.length - failedCases.length,
      total: totalCases,
      failedInput: firstFailure.input,
      expectedOutput: firstFailure.expectedOutput,
      actualOutput: firstFailure.actualOutput,
      error: firstFailure.error,
      diagnosis: healingDiagnosis
    });

    // If we have not exhausted our healing attempts, trigger AI self-healing!
    if (attempt <= MAX_HEALING_ATTEMPTS) {
      onProgress?.({
        stage: 'ai_healing',
        attempt,
        maxAttempts: MAX_HEALING_ATTEMPTS,
        message: `Discrepancy detected (${caseResults.length - failedCases.length}/${totalCases} passed). AI diagnosing defect & self-healing pipeline (Attempt ${attempt}/${MAX_HEALING_ATTEMPTS})...`
      });

      const historySection = healingHistory.length > 0
        ? `\nHISTORY OF PREVIOUS FAILED ATTEMPTS (DO NOT REPEAT THESE MISTAKES):
${healingHistory.map(h => `--- Attempt ${h.attempt} (${h.passed}/${h.total} passed) ---
Input: ${h.failedInput}
Expected: ${h.expectedOutput}
Actual Output: ${h.actualOutput || '<empty>'}
Error: ${h.error || 'None'}
Prior Attempt Diagnosis: ${h.diagnosis || 'None'}`).join('\n')}\n`
        : '';

      const healingPrompt = `You are a Principal Test Platform & Compiler Architect for an enterprise LeetCode platform.
A pipeline verification test failed for problem "${problemTitle}" (${slug}) in ${language.toUpperCase()}.

Problem Statement:
${problemStatement || problemTitle}

Starter Code template:
\`\`\`${language}
${starterCode}
\`\`\`

Current Reference Solution Code:
\`\`\`${language}
${currentSolution}
\`\`\`

Current Driver Code (if applicable):
\`\`\`${language}
${currentDriver || 'No custom driver'}
\`\`\`

Total Test Cases: ${totalCases}
Failed Test Cases Count: ${failedCases.length}

Primary Failed Test Case Details:
- Input:
${firstFailure.input}
- Expected Output:
${firstFailure.expectedOutput}
- Actual Output from Platform:
${firstFailure.actualOutput || '<empty>'}
- Error / Compiler Diagnostics:
${firstFailure.error || 'None'}

All Failed Cases:
${failedCases.map(f => `Case ${f.index + 1}: Input: ${f.input.substring(0, 100)} | Expected: ${f.expectedOutput} | Actual: ${f.actualOutput.substring(0, 100)} | Err: ${f.error || 'None'}`).join('\n')}
${historySection}
DIAGNOSIS & HEALING INSTRUCTIONS:
1. Determine the root cause of the testcase failure:
   - "solution": The algorithm in the Solution/Codec class has a bug (e.g. edge cases, off-by-one, type overflow, wrong return format).
   - "driver": The driver harness failed to deserialize inputs (e.g. tree/graph/matrix formatting) or serialize the output correctly.
   - "testcase": The testcase expected output itself is hallucinated, outdated, or logically incorrect for the problem statement.
2. Provide the corrected code to make ALL test cases pass.
3. Respond in strict JSON format (no surrounding text):
{
  "defectType": "solution" | "driver" | "testcase",
  "diagnosis": "1-3 sentences explaining exactly what went wrong and how it was healed",
  "repairedSolutionCode": "Complete replacement Solution class/code (if solution had the defect)",
  "repairedDriverCode": "Complete replacement driver harness code with // === USER SOLUTION === or # === USER SOLUTION === (if driver had the defect)",
  "repairedExpectedOutputs": ["corrected_expected_1", "corrected_expected_2"] // Only if testcase expected output was provably wrong
}`;

      try {
        const aiHealingResp = await executeAIChatCascade([
          { role: 'user', content: healingPrompt }
        ], { temperature: 0.1 });

        if (aiHealingResp) {
          const match = aiHealingResp.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            defectType = parsed.defectType || 'solution';
            healingDiagnosis = parsed.diagnosis || 'Self-healed edge-case and serialization defects.';

            if (parsed.repairedSolutionCode && typeof parsed.repairedSolutionCode === 'string') {
              const cleanSol = parsed.repairedSolutionCode.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
              if (cleanSol.length > 20) {
                currentSolution = cleanSol;
                solutionRepaired = true;
              }
            }

            if (parsed.repairedDriverCode && typeof parsed.repairedDriverCode === 'string') {
              const cleanDrv = parsed.repairedDriverCode.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
              if (cleanDrv.includes('// === USER SOLUTION ===') || cleanDrv.includes('# === USER SOLUTION ===')) {
                currentDriver = cleanDrv;
                driverRepaired = true;
              }
            }

            if (Array.isArray(parsed.repairedExpectedOutputs) && parsed.repairedExpectedOutputs.length === totalCases) {
              activeExpectedOutputs = parsed.repairedExpectedOutputs.map((o: any) => String(o).trim());
              expectedOutputsRepaired = true;
            }
          }
        }
      } catch (healingErr) {
        console.warn('[Pipeline Self-Healing AI Error]:', healingErr);
      }
    }
  }

  const passedCount = lastTestResults.filter(c => c.passed).length;
  const isAllPassed = passedCount === totalCases;

  // If successfully verified or healed, persist the assets
  if (isAllPassed) {
    try {
      // 1. Cache verified solution locally
      const localSolKey = `edustream_ai_solutions_${slug}`;
      let cachedObj: Record<string, any> = {};
      try {
        cachedObj = JSON.parse(localStorage.getItem(localSolKey) || '{}');
      } catch (_) {}
      cachedObj[language] = {
        code: currentSolution,
        explanation: healingDiagnosis || 'Official reference solution verified against all test cases.',
        validationPassed: true,
        verifiedAt: new Date().toISOString()
      };
      localStorage.setItem(localSolKey, JSON.stringify(cachedObj));

      // 2. Persist solution to Cloudflare R2 / Backend in background
      fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/save-solution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, solution: currentSolution })
      }).catch(() => {});

      // 3. If driver was healed, persist driver to Cloudflare R2
      if (driverRepaired && currentDriver) {
        const localDrvKey = `edustream_driver_${slug}_${language}`;
        localStorage.setItem(localDrvKey, currentDriver);

        fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/correct-driver`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            driverCode: currentDriver,
            solutionCode: currentSolution,
            problemTitle,
            explanation: healingDiagnosis
          })
        }).catch(() => {});
      }
    } catch (_) {}
  }

  onProgress?.({
    stage: 'completed',
    message: isAllPassed 
      ? (healed ? 'Pipeline auto-healed & verified!' : 'Pipeline verified 100% healthy!')
      : `Verification finished: ${passedCount}/${totalCases} passed.`
  });

  return {
    status: isAllPassed 
      ? (healed ? 'HEALED_AND_VERIFIED' : 'VERIFIED_SUCCESS') 
      : 'DISCREPANCY_UNRESOLVED',
    passedCount,
    totalCount: totalCases,
    attemptsUsed,
    healed,
    healingDiagnosis,
    defectType,
    solutionCode: currentSolution,
    driverCode: currentDriver,
    testCaseResults: lastTestResults,
    overallRuntimeMs: Date.now() - startTime,
    repairedAssets: {
      solutionRepaired,
      driverRepaired,
      expectedOutputsRepaired,
      repairedExpectedOutputs: expectedOutputsRepaired ? activeExpectedOutputs : undefined
    }
  };
}
