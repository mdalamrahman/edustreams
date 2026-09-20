/**
 * AsperSDE SuperAdmin Problem API Client
 * Connects to Render Backend and Cloudflare R2 for Problem Specs,
 * Drivers, Reference Solutions, and Compiler Execution.
 */

export const BACKEND_FALLBACK = 'https://edustream-backend-90vm.onrender.com';

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  // Normalize path
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Try relative path first (in Vercel, proxied via vercel.json rewrites)
  // Fast 4s timeout so we do not hang when Render is waking up from free-tier sleep
  try {
    const res = await fetch(cleanPath, {
      ...options,
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok || res.status === 404) {
      return res;
    }
  } catch (_) {
    // Relative fetch failed or timed out, fallback directly to Render backend URL
  }

  // Fallback directly to Render backend with generous 50s timeout for cold starts
  const directUrl = `${BACKEND_FALLBACK}${cleanPath}`;
  return await fetch(directUrl, {
    ...options,
    signal: AbortSignal.timeout(50000)
  });
}


export interface ProblemSpec {
  name?: string;
  title?: string;
  slug?: string;
  category?: string;
  difficulty?: string;
  description?: string;
  testCases?: string[];
  expectedOutputs?: string[];
  starters?: Record<string, string>;
  solutions?: Record<string, string>;
  driverCode?: Partial<Record<string, string>>;
}

export interface CompileResult {
  stdout: string;
  stderr: string;
  compile_output?: string;
  status?: { id: number; description: string } | string;
  time?: string | number;
  memory?: string | number;
  isError?: boolean;
}

/**
 * Fetch problem specification from backend/R2
 */
export async function fetchProblemSpec(slug: string): Promise<ProblemSpec | null> {
  try {
    const res = await apiFetch(`/api/problem/${encodeURIComponent(slug)}`);
    if (res.ok) {
      const data = await res.json();
      return (data?.problem || data) as ProblemSpec;
    }
  } catch (err) {
    console.warn(`[fetchProblemSpec]: Failed for ${slug}:`, err);
  }
  return null;
}

/**
 * Save problem definition and test cases to Cloudflare R2 and memory cache
 */
export async function saveProblemSpec(slug: string, problemData: Partial<ProblemSpec>): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await apiFetch(`/api/problem/${encodeURIComponent(slug)}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problemData)
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.r2_key ? `Saved to Cloudflare R2 (${data.r2_key})` : 'Saved successfully' };
    }
    return { success: false, message: `Server returned status ${res.status}` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error saving problem' };
  }
}

/**
 * Fetch stored driver code harness from R2 for a given language
 */
export async function fetchDriverCode(slug: string, language: string): Promise<string | null> {
  try {
    const res = await apiFetch(`/api/problem/${encodeURIComponent(slug)}/driver/${encodeURIComponent(language)}`);
    if (res.ok) {
      const data = await res.json();
      return data?.driverCode || null;
    }
  } catch (err) {
    console.warn(`[fetchDriverCode]: Failed for ${slug} ${language}:`, err);
  }
  return null;
}

/**
 * Save driver code harness into Cloudflare R2
 */
export async function saveDriverCode(slug: string, language: string, driverCode: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await apiFetch(`/api/problem/${encodeURIComponent(slug)}/driver/${encodeURIComponent(language)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverCode, code: driverCode })
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message || `Driver harness for ${language.toUpperCase()} saved to Cloudflare R2!` };
    }
    return { success: false, message: `Server error: ${res.statusText}` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error saving driver' };
  }
}

/**
 * Delete driver harness from Cloudflare R2
 */
export async function deleteDriverCode(slug: string, language: string): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/problem/${encodeURIComponent(slug)}/driver/${encodeURIComponent(language)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Trigger AI Driver Harness Generation for all supported languages
 */
export async function generateAiDrivers(slug: string): Promise<{ success: boolean; generated?: Record<string, boolean> }> {
  try {
    const res = await apiFetch(`/api/problem/${encodeURIComponent(slug)}/generate-drivers`, {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, generated: data.generated };
    }
  } catch (err) {
    console.warn(`[generateAiDrivers]: Failed for ${slug}:`, err);
  }
  return { success: false };
}

/**
 * Fetch official/validated reference solution code from R2
 */
export async function fetchSolutionCode(slug: string, language: string): Promise<string | null> {
  try {
    const res = await apiFetch(`/api/problem/${encodeURIComponent(slug)}/solution/${encodeURIComponent(language)}`);
    if (res.ok) {
      const data = await res.json();
      return data?.code || data?.solution || null;
    }
  } catch (err) {
    console.warn(`[fetchSolutionCode]: Failed for ${slug} ${language}:`, err);
  }
  return null;
}

/**
 * Save official reference solution to Cloudflare R2
 */
export async function saveSolutionCode(slug: string, language: string, solutionCode: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await apiFetch(`/api/problem/${encodeURIComponent(slug)}/save-solution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, solution: solutionCode, code: solutionCode })
    });
    if (res.ok) {
      return { success: true, message: `Reference solution for ${language.toUpperCase()} saved to Cloudflare R2!` };
    }
    return { success: false, message: `Failed to save solution: ${res.statusText}` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error saving solution' };
  }
}

/**
 * Execute code via Judge0 / Wandbox online compiler backend
 */
export async function executeCompile(
  code: string,
  language: string,
  input: string = ''
): Promise<CompileResult> {
  try {
    const res = await apiFetch('/api/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language,
        input
      })
    });

    if (res.ok) {
      const data = await res.json();
      const stdout = data.stdout || '';
      const stderr = data.stderr || data.compile_output || '';
      const isError = Boolean(stderr && (stderr.includes('error:') || stderr.includes('Exception') || stderr.includes('Traceback')));
      return {
        stdout,
        stderr,
        compile_output: data.compile_output,
        status: data.status,
        time: data.time || data.executionTimeMs,
        memory: data.memory,
        isError
      };
    }
    return {
      stdout: '',
      stderr: `HTTP ${res.status}: ${res.statusText}`,
      isError: true
    };
  } catch (err: any) {
    return {
      stdout: '',
      stderr: `Network / Timeout Error: ${err.message}`,
      isError: true
    };
  }
}

/**
 * Trigger Cloud Backend Pipeline Validation (runs Stage 1, 2, 3 on Render backend)
 */
export async function validateBackendPipeline(slug: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await apiFetch(`/api/problem/${encodeURIComponent(slug)}/validate-pipeline`, {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false, error: `Status ${res.status}: ${res.statusText}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Trigger AI Testcase Expansion (ensures 10+ comprehensive testcases)
 */
export async function expandTestcasesAI(slug: string): Promise<{ success: boolean; testCases?: string[]; expectedOutputs?: string[] }> {
  try {
    const res = await apiFetch(`/api/problem/${encodeURIComponent(slug)}/expand-testcases`, {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, testCases: data.testCases, expectedOutputs: data.expectedOutputs };
    }
  } catch (err) {
    console.warn(`[expandTestcasesAI]: Failed for ${slug}:`, err);
  }
  return { success: false };
}

/**
 * Assembles user solution with driver code harness:
 * 1. Strictly injects user solution into // === USER SOLUTION === before // === HIDDEN DRIVER === and main()
 * 2. Emits typedef / alias compatibility (e.g. using Solution = Codec) strictly AFTER user solution
 * 3. Substitutes %%INPUT%%, INPUT_PLACEHOLDER, and raw_input literals with testcase input
 */
export function assembleCodeWithDriver(
  driverCode: string,
  userSolution: string,
  language: string,
  testInput: string = ''
): string {
  const normLang = (language || 'cpp').toLowerCase();
  const rawInput = (testInput || '').trim();

  // If no driver harness is provided or placeholder not found, return userSolution
  if (!driverCode || driverCode.includes('not found in R2')) {
    return userSolution;
  }

  let code = driverCode;

  // 1. Locate User Solution Insertion Point
  const markerRegex = /(?:\/\/|#|\/\*)\s*===\s*USER SOLUTION\s*===(?:\*\/)?/i;
  const endMarkerRegex = /(?:\/\/|#|\/\*)\s*===\s*END USER SOLUTION\s*===(?:\*\/)?/i;
  const hiddenDriverRegex = /(?:\/\/|#|\/\*)\s*===\s*HIDDEN DRIVER\s*===(?:\*\/)?/i;

  const solClean = (userSolution || '').trim();

  // Prepare struct and alias injection if missing
  let preInject = '';
  let postInject = '';

  if (normLang.includes('cpp') || normLang.includes('c++')) {
    const userSolPos = code.search(markerRegex);
    const header = userSolPos !== -1 ? code.substring(0, userSolPos) : '';

    if (solClean.includes('TreeNode') && !header.includes('struct TreeNode')) {
      preInject += `\nstruct TreeNode { int val; TreeNode *left; TreeNode *right; TreeNode(int x) : val(x), left(NULL), right(NULL) {} };\n`;
    }
    if (solClean.includes('ListNode') && !header.includes('struct ListNode')) {
      preInject += `\nstruct ListNode { int val; ListNode *next; ListNode(int x) : val(x), next(NULL) {} };\n`;
    }
    // Post-inject aliases so they refer to the already declared class
    if (solClean.includes('class Codec') && !solClean.includes('class Solution')) {
      postInject += `\nusing Solution = Codec;\n`;
    } else if (solClean.includes('class Solution') && !solClean.includes('class Codec')) {
      postInject += `\nusing Codec = Solution;\n`;
    }
  } else if (normLang.includes('python') || normLang.includes('py')) {
    if (solClean.includes('class Codec') && !solClean.includes('class Solution')) {
      postInject += `\nSolution = Codec\n`;
    } else if (solClean.includes('class Solution') && !solClean.includes('class Codec')) {
      postInject += `\nCodec = Solution\n`;
    }
  }

  const solutionBlock = `${preInject}${solClean}${postInject ? '\n' + postInject : ''}`;

  if (markerRegex.test(code)) {
    if (endMarkerRegex.test(code)) {
      code = code.replace(
        new RegExp(`${markerRegex.source}[\\s\\S]*?${endMarkerRegex.source}`),
        `// === USER SOLUTION ===\n${solutionBlock}\n// === END USER SOLUTION ===`
      );
    } else if (hiddenDriverRegex.test(code)) {
      code = code.replace(
        new RegExp(`${markerRegex.source}[\\s\\S]*?(?=${hiddenDriverRegex.source})`),
        `// === USER SOLUTION ===\n${solutionBlock}\n\n`
      );
    } else {
      code = code.replace(markerRegex, `// === USER SOLUTION ===\n${solutionBlock}\n`);
    }
  } else {
    if (code.includes('int main(') || code.includes('int main (')) {
      code = code.replace(/(int\s+main\s*\()/, `${solutionBlock}\n\n$1`);
    } else if (code.includes('if __name__ == "__main__":') || code.includes("if __name__ == '__main__':")) {
      code = `${solutionBlock}\n\n${code}`;
    } else {
      code = `${code}\n\n${solutionBlock}`;
    }
  }

  // 2. Universal Input Placement
  if (rawInput) {
    if (code.includes('%%INPUT%%')) {
      code = code.split('%%INPUT%%').join(rawInput);
    }
    if (code.includes('INPUT_PLACEHOLDER')) {
      code = code.split('INPUT_PLACEHOLDER').join(rawInput);
    }

    if (normLang.includes('cpp') || normLang.includes('c++')) {
      if (code.includes('R"RAW(')) {
        code = code.replace(/R"RAW\(.*?\)RAW"/s, `R"RAW(${rawInput})RAW"`);
      } else if (code.includes('R"(')) {
        code = code.replace(/R"\((.*?)\)"/s, `R"(${rawInput})"`);
      }
      code = code.replace(
        /(?:string\s+)?(raw_?input|rawInput|full_?input)\s*=\s*(?:R"RAW\(.*?\)RAW"|R"\(.*?\)"|"[^"]*");/gi,
        `string $1 = R"RAW(${rawInput})RAW";`
      );
    } else if (normLang.includes('python') || normLang.includes('py')) {
      code = code.replace(/raw_?input\s*=\s*""".*?"""/s, `raw_input = """${rawInput}"""`);
      code = code.replace(/raw_?input\s*=\s*'''.*?'''/s, `raw_input = '''${rawInput}'''`);
    }
  }

  return code;
}

export interface StudentReportItem {
  id: string;
  slug: string;
  problemTitle: string;
  issueType: 'testcases' | 'driver' | 'solution' | 'problem';
  note: string;
  language: string;
  studentCode?: string;
  testInput?: string;
  expectedOutput?: string;
  status: 'open' | 'auto_healed' | 'resolved';
  autoHealDetails?: string;
  timestamp: string;
  userEmail?: string;
}

export async function fetchStudentReports(): Promise<StudentReportItem[]> {
  try {
    const res = await apiFetch('/api/problem-reports');
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data.reports) ? data.reports : [];
    }
  } catch (err) {
    console.error('[fetchStudentReports Error]:', err);
  }
  return [];
}

export async function resolveStudentReport(reportId: string, note: string = 'Resolved in Studio'): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/problem-reports/${reportId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolutionNote: note })
    });
    return res.ok;
  } catch (err) {
    console.error('[resolveStudentReport Error]:', err);
    return false;
  }
}
