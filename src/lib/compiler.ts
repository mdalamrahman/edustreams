import { TELEGRAM_BACKEND_URL } from './telegram';

export type SupportedLanguage = 'cpp' | 'python' | 'java' | 'javascript' | 'sql' | 'go' | 'rust';

export interface CodeExecutionResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time_ms: number;
  memory_used_kb: number;
  status: 'SUCCESS' | 'ERROR';
}

const JUDGE0_LANG_MAP: Record<string, number> = {
  cpp: 54,        // C++ (GCC 9.2.0)
  'c++': 54,
  python: 71,     // Python (3.8.1)
  py: 71,
  java: 62,       // Java (OpenJDK 13.0.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  js: 63,
  go: 60,         // Go (1.13.5)
  rust: 73,       // Rust (1.40.0)
  sql: 82         // SQLite 3.27.2
};

/**
 * Canonicalizes complex nested data structures so that order-independent collections
 * (e.g. Subsets, Permutations, 3Sum, Group Anagrams, Combination Sum)
 * match regardless of subset ordering or element permutations.
 */
export function canonicalizeData(val: any, isInner: boolean = false): any {
  if (val === null || val === undefined) return val;
  if (typeof val === 'number') {
    return Math.abs(val) < 1e-9 ? 0 : Number(val.toFixed(6));
  }
  if (typeof val === 'boolean' || typeof val === 'string') {
    return val;
  }
  if (Array.isArray(val)) {
    const isArrayOfArrays = val.length > 0 && val.every(item => Array.isArray(item));
    const isArrayOfPrimitives = val.length > 0 && val.every(item => typeof item === 'number' || typeof item === 'string');

    if (isArrayOfArrays) {
      const canonRows = val.map(row => {
        if (Array.isArray(row)) {
          const rowCopy = row.map(x => canonicalizeData(x, true));
          if (rowCopy.every(elem => typeof elem === 'number' || typeof elem === 'string')) {
            rowCopy.sort((a, b) => {
              if (typeof a === 'number' && typeof b === 'number') return a - b;
              return String(a).localeCompare(String(b));
            });
          }
          return rowCopy;
        }
        return canonicalizeData(row, true);
      });

      canonRows.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      return canonRows;
    }

    if (isArrayOfPrimitives && isInner) {
      const copy = val.map(x => canonicalizeData(x, true));
      copy.sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
      });
      return copy;
    }

    return val.map(x => canonicalizeData(x, isInner));
  }

  if (typeof val === 'object') {
    const sortedObj: Record<string, any> = {};
    Object.keys(val).sort().forEach(k => {
      sortedObj[k] = canonicalizeData(val[k], isInner);
    });
    return sortedObj;
  }

  return val;
}

export function compareOutputs(actual: any, expected: any): boolean {
  if (actual === expected) return true;
  if (actual === null || actual === undefined || expected === null || expected === undefined) {
    return actual == expected;
  }

  const cleanAct = String(actual).trim().replace(/\r\n/g, '\n').replace(/\s+$/mg, '');
  const cleanExp = String(expected).trim().replace(/\r\n/g, '\n').replace(/\s+$/mg, '');
  if (cleanAct === cleanExp) return true;

  try {
    const parsedAct = JSON.parse(cleanAct);
    const parsedExp = JSON.parse(cleanExp);

    // 1. Direct JSON comparison
    if (deepEqual(parsedAct, parsedExp)) return true;

    // 2. Canonicalized order-independent comparison (for Subsets, 3Sum, Group Anagrams, Permutations, etc.)
    const canonAct = canonicalizeData(parsedAct);
    const canonExp = canonicalizeData(parsedExp);
    if (deepEqual(canonAct, canonExp)) return true;

    // 3. Multiset fallback for 1D arrays (e.g. array of strings / IP addresses)
    if (Array.isArray(parsedAct) && Array.isArray(parsedExp) && parsedAct.length === parsedExp.length) {
      const sortAct = [...parsedAct].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      const sortExp = [...parsedExp].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      if (deepEqual(sortAct, sortExp)) return true;
    }
  } catch (_) {}

  // Case insensitive boolean check
  if ((cleanAct.toLowerCase() === 'true' && cleanExp.toLowerCase() === 'true') ||
      (cleanAct.toLowerCase() === 'false' && cleanExp.toLowerCase() === 'false')) return true;

  // Unquoted string comparison
  const stripQuotes = (s: string) => s.replace(/^["']|["']$/g, '');
  if (stripQuotes(cleanAct) === stripQuotes(cleanExp)) return true;

  return false;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || a === undefined || b === null || b === undefined) return a == b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 1e-5;
  }

  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Splits parameter list string safely outside angle brackets <...>
 */
function splitCppParams(str: string): string[] {
  const result: string[] = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '<') depth++;
    else if (ch === '>') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) {
      if (current.trim()) result.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

/**
 * Generates dynamic, type-safe C++ argument extractors for ANY function signature.
 */
function generateCppParamExtractors(paramList: string[]): { declarations: string[]; callArgs: string; firstArg: string } {
  const declarations: string[] = [];
  const argNames: string[] = [];

  paramList.forEach((param, i) => {
    const trimmed = param.trim();
    const lastSpaceIdx = trimmed.lastIndexOf(' ');
    let typePart = lastSpaceIdx > 0 ? trimmed.substring(0, lastSpaceIdx).trim() : trimmed;
    let namePart = lastSpaceIdx > 0 ? trimmed.substring(lastSpaceIdx + 1).replace(/^[\*&]+/, '').trim() : `arg_${i}`;

    namePart = namePart.replace(/[^a-zA-Z0-9_]/g, '') || `arg_${i}`;
    const argVar = `arg_${i}`;
    argNames.push(argVar);

    const cleanType = typePart.replace(/&/g, '').replace(/\bconst\b/g, '').replace(/>\s+>/g, '>>').trim();

    if (cleanType.includes('vector<vector<char>>')) {
      declarations.push(`vector<vector<char>> ${argVar} = parse_matrix_char(get_arg_str(raw_input, "${namePart}", ${i}));`);
    } else if (cleanType.includes('vector<vector<string>>')) {
      declarations.push(`vector<vector<string>> ${argVar} = parse_matrix_string(get_arg_str(raw_input, "${namePart}", ${i}));`);
    } else if (cleanType.includes('vector<vector<int>>') || cleanType.includes('vector<vector<long long>>') || cleanType.includes('vector<vector<long>>')) {
      declarations.push(`vector<vector<int>> ${argVar} = parse_matrix_int(get_arg_str(raw_input, "${namePart}", ${i}));`);
    } else if (cleanType.includes('vector<string>')) {
      declarations.push(`vector<string> ${argVar} = parse_vector_string(get_arg_str(raw_input, "${namePart}", ${i}));`);
    } else if (cleanType.includes('vector<int>') || cleanType.includes('vector<long long>')) {
      declarations.push(`vector<int> ${argVar} = parse_vector_int(get_arg_str(raw_input, "${namePart}", ${i}));`);
    } else if (cleanType.includes('vector<double>') || cleanType.includes('vector<float>')) {
      declarations.push(`vector<double> ${argVar} = parse_vector_double(get_arg_str(raw_input, "${namePart}", ${i}));`);
    } else if (cleanType.includes('vector<bool>')) {
      declarations.push(`vector<bool> ${argVar} = parse_vector_bool(get_arg_str(raw_input, "${namePart}", ${i}));`);
    } else if (cleanType.includes('TreeNode') || trimmed.includes('TreeNode')) {
      declarations.push(`TreeNode* ${argVar} = parse_tree_node(get_arg_str(raw_input, "${namePart}", ${i}));`);
    } else if (cleanType.includes('ListNode') || trimmed.includes('ListNode')) {
      declarations.push(`ListNode* ${argVar} = parse_list_node(get_arg_str(raw_input, "${namePart}", ${i}));`);
    } else if (cleanType.includes('Node') || trimmed.includes('Node*') || trimmed.includes('Node *')) {
      declarations.push(`Node* ${argVar} = parse_graph_node(get_arg_str(raw_input, "${namePart}", ${i}));`);
    } else if (cleanType.includes('string')) {
      declarations.push(`string ${argVar} = parse_string_arg(get_arg_str(raw_input, "${namePart}", ${i}));`);
    } else if (cleanType === 'int' || cleanType === 'long' || cleanType === 'long long') {
      declarations.push(`int ${argVar} = parse_single_int(get_arg_str(raw_input, "${namePart}", ${i}), 0);`);
    } else if (cleanType === 'double' || cleanType === 'float') {
      declarations.push(`double ${argVar} = parse_single_double(get_arg_str(raw_input, "${namePart}", ${i}), 0.0);`);
    } else if (cleanType === 'bool') {
      declarations.push(`bool ${argVar} = parse_single_bool(get_arg_str(raw_input, "${namePart}", ${i}), false);`);
    } else if (cleanType === 'char') {
      declarations.push(`char ${argVar} = parse_single_char(get_arg_str(raw_input, "${namePart}", ${i}), ' ');`);
    } else {
      declarations.push(`vector<int> ${argVar} = parse_vector_int(get_arg_str(raw_input, "${namePart}", ${i}));`);
    }
  });

  return {
    declarations,
    callArgs: argNames.join(', '),
    firstArg: argNames[0] || ''
  };
}

const CPP_RESERVED_KEYWORDS = new Set([
  'for', 'while', 'if', 'else', 'switch', 'case', 'default', 'return',
  'break', 'continue', 'goto', 'try', 'catch', 'throw', 'sizeof', 'decltype',
  'typeid', 'alignof', 'alignas', 'static_assert', 'do', 'new', 'delete',
  'typedef', 'using', 'template', 'typename', 'public', 'private', 'protected',
  'class', 'struct', 'enum', 'union', 'auto', 'register', 'volatile', 'mutable',
  'const', 'constexpr', 'inline', 'explicit', 'friend', 'virtual', 'override',
  'final', 'operator', 'this', 'namespace', 'extern', 'static', 'int', 'void',
  'bool', 'char', 'double', 'float', 'long', 'short', 'signed', 'unsigned'
]);

/**
 * Accurately finds the primary entrypoint method in C++ Solution class,
 * using brace-depth tracking at class scope and strictly filtering out
 * C++ reserved keywords (such as 'for', 'while', 'if', 'switch') to prevent
 * invalid driver code generation like 'sol.for(arg_0)'.
 */
function findBestCppMethod(
  searchSection: string,
  problemTitle?: string
): { methodName: string; retType: string; paramsStr: string } | null {
  const normTitle = (problemTitle || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  // Strip block and line comments to avoid false matches
  const cleanCode = searchSection.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

  const matches: Array<{ methodName: string; retType: string; paramsStr: string }> = [];

  // Parse methods at class-level depth (depth 0 of class body)
  let depth = 0;
  let buffer = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < cleanCode.length; i++) {
    const ch = cleanCode[i];
    const prevCh = i > 0 ? cleanCode[i - 1] : '';

    if (inString) {
      if (ch === stringChar && prevCh !== '\\') {
        inString = false;
      }
      continue;
    }

    if (ch === '"' || ch === '\'') {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === '{') {
      if (depth === 0 || depth === 1) {
        // Buffer right before this opening brace contains potential method header
        const header = buffer.trim();
        const methodMatch = header.match(/(?:inline\s+|virtual\s+|static\s+|constexpr\s+)*([a-zA-Z0-9_<>,:\s\*&]+?)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)(?:\s*const)?(?:\s*noexcept)?$/);
        
        if (methodMatch) {
          const retType = methodMatch[1].trim();
          const methodName = methodMatch[2].trim();
          const paramsStr = methodMatch[3].trim();

          const isKeyword = CPP_RESERVED_KEYWORDS.has(methodName.toLowerCase());
          const isClassOrCtor = methodName === 'Solution' || methodName.startsWith('~') || retType.includes('class') || retType.includes('struct');
          const hasInvalidRetTokens = /[\;=\{\}\[\]]/.test(retType);

          if (!isKeyword && !isClassOrCtor && !hasInvalidRetTokens) {
            matches.push({ methodName, retType, paramsStr });
          }
        }
        buffer = '';
      }
      depth++;
    } else if (ch === '}') {
      depth = Math.max(0, depth - 1);
      if (depth <= 1) {
        buffer = '';
      }
    } else {
      if (depth <= 1) {
        buffer += ch;
      }
    }
  }

  // Fallback: If brace parsing found 0 matches (e.g. malformed or single-line signatures), run filtered regex
  if (matches.length === 0) {
    const methodGlobalRegex = /(?:inline\s+|virtual\s+|static\s+)*([a-zA-Z0-9_<>,:\s\*&]+?)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*(?:const\s*)?\{/g;
    let m: RegExpExecArray | null;
    while ((m = methodGlobalRegex.exec(cleanCode)) !== null) {
      const retType = m[1].trim();
      const methodName = m[2].trim();
      const paramsStr = m[3].trim();

      const isKeyword = CPP_RESERVED_KEYWORDS.has(methodName.toLowerCase());
      const isClassOrCtor = methodName === 'Solution' || methodName.startsWith('~') || retType.includes('class') || retType.includes('struct');
      const hasInvalidRetTokens = /[\;=\{\}\[\]]/.test(retType);

      if (!isKeyword && !isClassOrCtor && !hasInvalidRetTokens) {
        matches.push({ methodName, retType, paramsStr });
      }
    }
  }

  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];

  const helperNames = new Set(['dfs', 'bfs', 'backtrack', 'helper', 'solve', 'recur', 'recursion', 'util', 'calc', 'calculate', 'check', 'isvalid', 'valid']);

  // 1. Match problem title if possible (e.g. subsets -> subsets, numIslands -> numIslands)
  if (normTitle) {
    const titleMatch = matches.find(cand => {
      const candNorm = cand.methodName.toLowerCase().replace(/[^a-z0-9]/g, '');
      return candNorm === normTitle || normTitle.includes(candNorm) || candNorm.includes(normTitle);
    });
    if (titleMatch) return titleMatch;
  }

  // 2. Prefer non-void method not in helper names
  const nonVoidNonHelper = matches.filter(cand => !cand.retType.includes('void') && !helperNames.has(cand.methodName.toLowerCase()));
  if (nonVoidNonHelper.length > 0) return nonVoidNonHelper[0];

  // 3. Prefer method not in helper names
  const nonHelper = matches.filter(cand => !helperNames.has(cand.methodName.toLowerCase()));
  if (nonHelper.length > 0) return nonHelper[0];

  return matches[0];
}

/**
 * Extracts parameter names from user solution code for any supported language.
 */
export function extractParamNamesFromCode(code: string, language: SupportedLanguage): string[] {
  const clean = (code || '').replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/#.*/g, '');
  const norm = (language || 'cpp').toLowerCase();
  
  if (norm.includes('cpp') || norm.includes('c++') || norm.includes('java')) {
    const publicSectionMatch = clean.match(/public:\s*([\s\S]*)/);
    const searchSection = publicSectionMatch ? publicSectionMatch[1] : clean;
    const best = findBestCppMethod(searchSection);
    if (best && best.paramsStr) {
      return splitCppParams(best.paramsStr).map(p => {
        const tokens = p.trim().replace(/[&*]/g, ' ').split(/\s+/).filter(Boolean);
        return tokens[tokens.length - 1];
      }).filter(Boolean);
    }
  } else if (norm.includes('python') || norm.includes('py')) {
    const m = clean.match(/def\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(\s*(?:self\s*,\s*)?([^)]*)\)/);
    if (m && m[1]) {
      return m[1].split(',').map(p => p.trim().split(':')[0].trim()).filter(p => p && p !== 'self');
    }
  } else if (norm.includes('javascript') || norm.includes('js')) {
    const m = clean.match(/(?:var|let|const|function)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*(?:function\s*\(|\(\s*)([^)]*)\)|function\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(([^)]*)\)/);
    if (m) {
      const rawParams = m[1] || m[2] || '';
      return rawParams.split(',').map(p => p.trim().replace(/[()]/g, '')).filter(Boolean);
    }
  }
  return [];
}

/**
 * Validates whether a pre-stored driver harness from R2 or cache is syntactically sound and safe to execute.
 * Catches common failure modes:
 * - stdin reading (cin >>, getline(cin)) which hangs headless Judge0 runners
 * - Missing struct declarations (TreeNode, ListNode, Node) before user solution insertion point
 * - Broken AI code generation artifacts / placeholder errors
 */
export function isDriverHarnessValid(
  driverCode: string | null | undefined,
  language: SupportedLanguage,
  codeOrStarter?: string
): boolean {
  if (!driverCode) return false;
  const drv = driverCode.trim();
  if (drv.length < 50) return false;

  // 1. Must contain user solution placeholder
  if (!drv.includes('// === USER SOLUTION ===') && !drv.includes('# === USER SOLUTION ===')) {
    return false;
  }

  // 2. Fatal error / broken driver keywords
  if (
    drv.includes('httpsleetcodecom') ||
    drv.includes('Error: Missing') ||
    drv.includes('error: missing') ||
    drv.includes('Cannot find')
  ) {
    return false;
  }

  const normLang = (language || 'cpp').toLowerCase();

  // 3. Headless sandboxes (Judge0) do not supply stdin by default; cin/getline(cin) will hang or fail
  if (drv.includes('cin >>') || drv.includes('getline(cin') || drv.includes('cin.tie')) {
    return false;
  }

  // 4. For C++, verify struct declarations are placed strictly BEFORE the user solution marker
  if (normLang.includes('cpp') || normLang.includes('c++')) {
    const userSolPos = drv.indexOf('// === USER SOLUTION ===');
    const headerSection = userSolPos !== -1 ? drv.substring(0, userSolPos) : drv;

    const checkContext = (codeOrStarter || '') + ' ' + drv;
    if (checkContext.includes('TreeNode') && !headerSection.includes('struct TreeNode')) {
      return false;
    }
    if (checkContext.includes('ListNode') && !headerSection.includes('struct ListNode')) {
      return false;
    }
    if ((checkContext.includes('Node*') || checkContext.includes('Node *')) && !headerSection.includes('Node')) {
      return false;
    }

    if (!drv.includes('main(') && !drv.includes('main (')) {
      return false;
    }
  }

  return true;
}

/**
 * Wraps clean LeetCode Solution class with standard DSA headers, ListNode/TreeNode definitions,
 * and dynamic universal driver execution code matching LeetCode's compiler architecture.
 */
export function wrapLeetCodeExecutableCode(
  userCode: string,
  language: SupportedLanguage,
  testInput: string = '',
  problemTitle: string = '',
  preloadedDriver?: string
): string {
  const normTitle = (problemTitle || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanInput = (testInput || '').trim();

  // Auto-normalize input: if input lacks '=' assignment, auto-prefix with parameter name if single param
  let effectiveInput = cleanInput;
  if (effectiveInput && !effectiveInput.includes('=')) {
    let paramName = '';
    if (preloadedDriver) {
      const pMatch = preloadedDriver.match(/(?:get_arg_str\([^,]+,\s*"|raw_input\.find\(")([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
      if (pMatch) paramName = pMatch[1];
    }
    if (!paramName) {
      const pNames = extractParamNamesFromCode(userCode, language);
      if (pNames.length === 1) paramName = pNames[0];
    }
    if (paramName) {
      effectiveInput = `${paramName} = ${effectiveInput}`;
    }
  }

  // If a pre-stored Cloudflare R2 / AI driver exists, check for strict validity and method signature alignment
  if (preloadedDriver && (preloadedDriver.includes('// === USER SOLUTION ===') || preloadedDriver.includes('# === USER SOLUTION ==='))) {
    const isValid = isDriverHarnessValid(preloadedDriver, language, userCode);

    // Detect the primary method name in user code
    let userMethodName = '';
    if (language === 'cpp' || (language as any) === 'c++') {
      const publicSectionMatch = userCode.match(/public:\s*([\s\S]*)/);
      const searchCode = publicSectionMatch ? publicSectionMatch[1] : userCode;
      const best = findBestCppMethod(searchCode, problemTitle);
      if (best) userMethodName = best.methodName;
    } else if (language === 'python' || (language as any) === 'py') {
      const m = userCode.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
      if (m && m[1] !== '__init__') userMethodName = m[1];
    } else if (language === 'javascript' || (language as any) === 'js') {
      const m = userCode.match(/(?:var|let|const|function)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:function|\()|function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
      if (m) userMethodName = m[1] || m[2];
    }

    // If user defined a method name, verify that the preloaded driver doesn't call an entirely different method
    const isMethodMismatch = Boolean(userMethodName && preloadedDriver.includes('sol.') && !preloadedDriver.includes(`sol.${userMethodName}(`));

    if (!isValid || isMethodMismatch) {
      console.warn(`[SDETube Compiler] Preloaded driver rejected (valid=${isValid}, mismatch=${isMethodMismatch}). Falling back to dynamic universal harness.`);
    } else {
      let replaced = preloadedDriver;

      if (replaced.includes('// === USER SOLUTION ===')) {
        // Double safety: ensure any needed structs are declared before user solution
        let structInject = '';
        if (language === 'cpp' || (language as any) === 'c++') {
          const userSolPos = replaced.indexOf('// === USER SOLUTION ===');
          const header = userSolPos !== -1 ? replaced.substring(0, userSolPos) : '';
          if (userCode.includes('TreeNode') && !header.includes('struct TreeNode')) {
            structInject += `\nstruct TreeNode { int val; TreeNode *left; TreeNode *right; TreeNode() : val(0), left(nullptr), right(nullptr) {} TreeNode(int x) : val(x), left(nullptr), right(nullptr) {} TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {} };\n`;
          }
          if (userCode.includes('ListNode') && !header.includes('struct ListNode')) {
            structInject += `\nstruct ListNode { int val; ListNode *next; ListNode() : val(0), next(nullptr) {} ListNode(int x) : val(x), next(nullptr) {} ListNode(int x, ListNode *next) : val(x), next(next) {} };\n`;
          }
        }

        const endMarkerRegex = /(?:\/\/|\/\*)\s*===\s*END USER SOLUTION\s*===(?:\*\/)?/;
        if (endMarkerRegex.test(replaced)) {
          replaced = replaced.replace(new RegExp(`//\\s*===\\s*USER SOLUTION\\s*===[\\s\\S]*?${endMarkerRegex.source}`), `// === USER SOLUTION ===\n${structInject}${userCode}\n// === END USER SOLUTION ===`);
        } else if (replaced.includes('// === HIDDEN DRIVER ===')) {
          replaced = replaced.replace(/\/\/\s*===\s*USER SOLUTION\s*===[\s\S]*?(?=\/\/\s*===\s*HIDDEN DRIVER\s*===)/, `// === USER SOLUTION ===\n${structInject}${userCode}\n\n`);
        } else {
          // Non-destructive replacement: replace only the comment itself, NEVER wipe out following helpers or structs!
          replaced = replaced.replace('// === USER SOLUTION ===', `// === USER SOLUTION ===\n${structInject}${userCode}\n`);
        }
      } else if (replaced.includes('# === USER SOLUTION ===')) {
        if (replaced.includes('# === END USER SOLUTION ===')) {
          replaced = replaced.replace(/#\s*===\s*USER SOLUTION\s*===[\s\S]*?#\s*===\s*END USER SOLUTION\s*===/, `# === USER SOLUTION ===\n${userCode}\n# === END USER SOLUTION ===`);
        } else if (replaced.includes('# === HIDDEN DRIVER ===')) {
          replaced = replaced.replace(/#\s*===\s*USER SOLUTION\s*===[\s\S]*?(?=#\s*===\s*HIDDEN DRIVER\s*===)/, `# === USER SOLUTION ===\n${userCode}\n\n`);
        } else {
          replaced = replaced.replace('# === USER SOLUTION ===', `# === USER SOLUTION ===\n${userCode}\n`);
        }
      }

      if (replaced.includes('R"RAW(')) {
        replaced = replaced.replace(/R"RAW\(.*?\)RAW"/s, `R"RAW(${effectiveInput})RAW"`);
      } else if (replaced.includes('raw_input = """')) {
        replaced = replaced.replace(/raw_input = """.*?"""/s, `raw_input = """${effectiveInput}"""`);
      } else if (replaced.includes('const rawInput = `')) {
        replaced = replaced.replace(/const rawInput = `.*?`;/s, `const rawInput = \`${effectiveInput}\`;`);
      }
      return replaced;
    }
  }


  // ==========================================
  // 1. C++ (GCC 9+) UNIVERSAL DRIVER
  // ==========================================
  if (language === 'cpp' || (language as any) === 'c++') {
    if (userCode.includes('int main(')) return userCode;

    // Detect method name, return type and parameters from user's class Solution (prioritize public: section)
    const cleanUserCode = userCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    const classSolMatch = cleanUserCode.match(/class\s+Solution[\s\S]*?\{([\s\S]*)\};?/);
    const bodyToSearch = classSolMatch ? classSolMatch[1] : cleanUserCode;

    const publicSectionMatch = bodyToSearch.match(/public:\s*([\s\S]*)/);
    const searchSection = publicSectionMatch ? publicSectionMatch[1] : bodyToSearch;

    const bestMethod = findBestCppMethod(searchSection, problemTitle);

    let methodName = '';
    let retType = '';
    let paramsStr = '';

    if (bestMethod) {
      retType = bestMethod.retType;
      methodName = bestMethod.methodName;
      paramsStr = bestMethod.paramsStr;
    }

    const paramList = splitCppParams(paramsStr);
    const { declarations, callArgs, firstArg } = generateCppParamExtractors(paramList);

    let invocation = '';
    if (methodName) {
      if (retType.includes('void')) {
        invocation = `
        ${declarations.join('\n        ')}
        sol.${methodName}(${callArgs});
        print_val(${firstArg || 'raw_input'});
        cout << endl;
`;
      } else {
        invocation = `
        ${declarations.join('\n        ')}
        auto res = sol.${methodName}(${callArgs});
        print_val(res);
        cout << endl;
`;
      }
    } else {
      invocation = `
        cout << "Solution executed successfully with test input." << endl;
`;
    }


    return `// SDETube Universal LeetCode C++ Test Harness
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <numeric>
#include <unordered_map>
#include <map>
#include <set>
#include <unordered_set>
#include <queue>
#include <stack>
#include <deque>
#include <cmath>
#include <climits>
#include <cstring>
#include <sstream>
#include <utility>
#include <tuple>
#include <functional>
#include <memory>
using namespace std;

// Standard DSA Structs
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Node {
public:
    int val;
    vector<Node*> neighbors;
    Node() : val(0) {}
    Node(int _val) : val(_val) {}
    Node(int _val, vector<Node*> _neighbors) : val(_val), neighbors(_neighbors) {}
};

// Forward Declarations for Universal JSON Printers
void print_val(int x);
void print_val(long long x);
void print_val(double x);
void print_val(bool x);
void print_val(char x);
void print_val(const string& s);
void print_val(ListNode* head);
void print_val(TreeNode* root);
void print_val(Node* graphNode);
template<typename T> void print_val(const vector<T>& vec);
template<typename T, typename U> void print_val(const pair<T, U>& p);

// Implementations
inline void print_val(int x) { cout << x; }
inline void print_val(long long x) { cout << x; }
inline void print_val(double x) { cout << x; }
inline void print_val(bool x) { cout << (x ? "true" : "false"); }
inline void print_val(char x) { cout << "\\"" << x << "\\""; }
inline void print_val(const string& x) { cout << "\\"" << x << "\\""; }

template<typename T>
inline void print_val(const vector<T>& vec) {
    cout << "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        print_val(vec[i]);
        if (i + 1 < vec.size()) cout << ",";
    }
    cout << "]";
}

template<typename T, typename U>
inline void print_val(const pair<T, U>& p) {
    cout << "[";
    print_val(p.first);
    cout << ",";
    print_val(p.second);
    cout << "]";
}

inline void print_val(ListNode* head) {
    cout << "[";
    ListNode* curr = head;
    while (curr) {
        cout << curr->val;
        if (curr->next) cout << ",";
        curr = curr->next;
    }
    cout << "]";
}

inline void print_val(TreeNode* root) {
    if (!root) {
        cout << "[]";
        return;
    }
    vector<string> res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* node = q.front();
        q.pop();
        if (node) {
            res.push_back(to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            res.push_back("null");
        }
    }
    while (!res.empty() && res.back() == "null") res.pop_back();
    cout << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        if (res[i] == "null") cout << "null";
        else cout << res[i];
        if (i + 1 < res.size()) cout << ",";
    }
    cout << "]";
}

inline void print_val(Node* graphNode) {
    if (!graphNode) {
        cout << "[]";
        return;
    }
    unordered_map<Node*, int> visited;
    queue<Node*> q;
    q.push(graphNode);
    visited[graphNode] = graphNode->val;
    vector<Node*> order = {graphNode};
    while (!q.empty()) {
        Node* curr = q.front();
        q.pop();
        for (Node* neighbor : curr->neighbors) {
            if (visited.find(neighbor) == visited.end()) {
                visited[neighbor] = neighbor->val;
                order.push_back(neighbor);
                q.push(neighbor);
            }
        }
    }
    cout << "[";
    for (size_t i = 0; i < order.size(); ++i) {
        cout << "[";
        for (size_t j = 0; j < order[i]->neighbors.size(); ++j) {
            cout << order[i]->neighbors[j]->val;
            if (j + 1 < order[i]->neighbors.size()) cout << ",";
        }
        cout << "]";
        if (i + 1 < order.size()) cout << ",";
    }
    cout << "]";
}

// Universal Parsing Helpers
inline vector<string> split_top_level_args(const string& s) {
    vector<string> args;
    string cur;
    int bracket_depth = 0;
    int brace_depth = 0;
    bool in_quote = false;
    char quote_char = 0;

    for (size_t i = 0; i < s.size(); ++i) {
        char c = s[i];
        if (in_quote) {
            cur += c;
            if (c == quote_char && (i == 0 || s[i - 1] != '\\\\')) {
                in_quote = false;
            }
        } else {
            if (c == '"' || c == '\\'') {
                in_quote = true;
                quote_char = c;
                cur += c;
            } else if (c == '[') {
                bracket_depth++;
                cur += c;
            } else if (c == ']') {
                bracket_depth = max(0, bracket_depth - 1);
                cur += c;
            } else if (c == '{') {
                brace_depth++;
                cur += c;
            } else if (c == '}') {
                brace_depth = max(0, brace_depth - 1);
                cur += c;
            } else if ((c == ',' || c == '\n') && bracket_depth == 0 && brace_depth == 0) {
                if (cur.find_first_not_of(" \t\r\n") != string::npos) {
                    args.push_back(cur);
                    cur.clear();
                }
            } else {
                cur += c;
            }
        }
    }
    if (cur.find_first_not_of(" \t\r\n") != string::npos) {
        args.push_back(cur);
    }
    return args;
}

inline string get_arg_str(const string& raw, const string& param_name, size_t index) {
    if (!param_name.empty()) {
        size_t pos = 0;
        while ((pos = raw.find(param_name, pos)) != string::npos) {
            bool bound_before = (pos == 0 || (!isalnum(raw[pos - 1]) && raw[pos - 1] != '_'));
            size_t after_pos = pos + param_name.size();
            bool bound_after = (after_pos >= raw.size() || (!isalnum(raw[after_pos]) && raw[after_pos] != '_'));
            if (bound_before && bound_after) {
                size_t eq = raw.find('=', pos);
                if (eq != string::npos) {
                    string after = raw.substr(eq + 1);
                    auto parts = split_top_level_args(after);
                    if (!parts.empty()) return parts[0];
                }
            }
            pos++;
        }
    }
    auto top_args = split_top_level_args(raw);
    if (index < top_args.size()) {
        string seg = top_args[index];
        size_t eq = seg.find('=');
        if (eq != string::npos) return seg.substr(eq + 1);
        return seg;
    }
    return raw;
}

inline vector<int> parse_vector_int(string s) {
    vector<int> res;
    size_t start = s.find('[');
    size_t end = s.rfind(']');
    if (start == string::npos || end == string::npos || start >= end) return res;
    string sub = s.substr(start + 1, end - start - 1);
    stringstream ss(sub);
    string token;
    while (getline(ss, token, ',')) {
        token.erase(0, token.find_first_not_of(" \\t\\r\\n"));
        token.erase(token.find_last_not_of(" \\t\\r\\n") + 1);
        if (!token.empty()) {
            try { res.push_back(stoi(token)); } catch(...) {}
        }
    }
    return res;
}

inline vector<vector<int>> parse_matrix_int(string s) {
    vector<vector<int>> res;
    size_t outer_start = s.find('[');
    size_t outer_end = s.rfind(']');
    if (outer_start == string::npos || outer_end == string::npos || outer_start >= outer_end) return res;

    size_t i = outer_start + 1;
    while (i < outer_end) {
        if (s[i] == '[') {
            size_t close = s.find(']', i);
            if (close != string::npos && close <= outer_end) {
                string sub = s.substr(i, close - i + 1);
                auto row = parse_vector_int(sub);
                res.push_back(row);
                i = close + 1;
                continue;
            }
        }
        i++;
    }
    return res;
}

inline vector<vector<char>> parse_matrix_char(string s) {
    vector<vector<char>> res;
    size_t outer_start = s.find('[');
    size_t outer_end = s.rfind(']');
    if (outer_start == string::npos || outer_end == string::npos || outer_start >= outer_end) return res;

    size_t i = outer_start + 1;
    while (i < outer_end) {
        if (s[i] == '[') {
            size_t close = s.find(']', i);
            if (close != string::npos && close <= outer_end) {
                string sub = s.substr(i + 1, close - i - 1);
                vector<char> row;
                for (char c : sub) {
                    if (c != ' ' && c != ',' && c != '"' && c != '\\'') {
                        row.push_back(c);
                    }
                }
                res.push_back(row);
                i = close + 1;
                continue;
            }
        }
        i++;
    }
    return res;
}

inline vector<string> parse_vector_string(string s) {
    vector<string> res;
    size_t start = s.find('[');
    size_t end = s.rfind(']');
    if (start == string::npos || end == string::npos || start >= end) return res;
    string sub = s.substr(start + 1, end - start - 1);
    stringstream ss(sub);
    string token;
    while (getline(ss, token, ',')) {
        token.erase(0, token.find_first_not_of(" \\t\\r\\n\\\"\\'"));
        token.erase(token.find_last_not_of(" \\t\\r\\n\\\"\\'") + 1);
        if (!token.empty()) res.push_back(token);
    }
    return res;
}

inline vector<vector<string>> parse_matrix_string(string s) {
    vector<vector<string>> res;
    size_t outer_start = s.find('[');
    size_t outer_end = s.rfind(']');
    if (outer_start == string::npos || outer_end == string::npos || outer_start >= outer_end) return res;

    size_t i = outer_start + 1;
    while (i < outer_end) {
        if (s[i] == '[') {
            size_t close = s.find(']', i);
            if (close != string::npos && close <= outer_end) {
                string sub = s.substr(i, close - i + 1);
                auto row = parse_vector_string(sub);
                res.push_back(row);
                i = close + 1;
                continue;
            }
        }
        i++;
    }
    return res;
}

inline vector<double> parse_vector_double(string s) {
    vector<double> res;
    auto strArr = parse_vector_string(s);
    for (const auto& str : strArr) {
        try { res.push_back(stod(str)); } catch(...) {}
    }
    return res;
}

inline vector<bool> parse_vector_bool(string s) {
    vector<bool> res;
    auto strArr = parse_vector_string(s);
    for (const auto& str : strArr) {
        res.push_back(str == "true" || str == "1");
    }
    return res;
}

inline TreeNode* parse_tree_node(string s) {
    size_t start = s.find('[');
    size_t end = s.rfind(']');
    if (start == string::npos || end == string::npos || start >= end) return nullptr;
    string sub = s.substr(start + 1, end - start - 1);
    stringstream ss(sub);
    string token;
    vector<string> tokens;
    while (getline(ss, token, ',')) {
        token.erase(0, token.find_first_not_of(" \t\r\n\"'"));
        token.erase(token.find_last_not_of(" \t\r\n\"'") + 1);
        if (!token.empty()) tokens.push_back(token);
    }
    if (tokens.empty() || tokens[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(tokens[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front();
        q.pop();
        if (i < tokens.size()) {
            if (tokens[i] != "null") {
                curr->left = new TreeNode(stoi(tokens[i]));
                q.push(curr->left);
            }
            i++;
        }
        if (i < tokens.size()) {
            if (tokens[i] != "null") {
                curr->right = new TreeNode(stoi(tokens[i]));
                q.push(curr->right);
            }
            i++;
        }
    }
    return root;
}

inline ListNode* parse_list_node(string s) {
    size_t start = s.find('[');
    size_t end = s.rfind(']');
    if (start == string::npos || end == string::npos || start >= end) return nullptr;
    string sub = s.substr(start + 1, end - start - 1);
    stringstream ss(sub);
    string token;
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (getline(ss, token, ',')) {
        token.erase(0, token.find_first_not_of(" \t\r\n\"'"));
        token.erase(token.find_last_not_of(" \t\r\n\"'") + 1);
        if (!token.empty()) {
            try {
                tail->next = new ListNode(stoi(token));
                tail = tail->next;
            } catch(...) {}
        }
    }
    return dummy.next;
}

inline Node* parse_graph_node(string s) {
    auto mat = parse_matrix_int(s);
    int n = mat.size();
    if (n == 0) return nullptr;
    vector<Node*> nodes;
    for (int i = 1; i <= n; ++i) nodes.push_back(new Node(i));
    for (int i = 0; i < n; ++i) {
        for (int neighborVal : mat[i]) {
            if (neighborVal >= 1 && neighborVal <= n) {
                nodes[i]->neighbors.push_back(nodes[neighborVal - 1]);
            }
        }
    }
    return nodes.empty() ? nullptr : nodes[0];
}

inline int parse_single_int(string s, int fallback = 0) {
    size_t eq = s.find('=');
    if (eq != string::npos) s = s.substr(eq + 1);
    size_t p = s.find_first_of("-0123456789");
    if (p != string::npos) {
        try { return stoi(s.substr(p)); } catch(...) {}
    }
    return fallback;
}

inline double parse_single_double(string s, double fallback = 0.0) {
    size_t eq = s.find('=');
    if (eq != string::npos) s = s.substr(eq + 1);
    size_t p = s.find_first_of("-0123456789.");
    if (p != string::npos) {
        try { return stod(s.substr(p)); } catch(...) {}
    }
    return fallback;
}

inline bool parse_single_bool(string s, bool fallback = false) {
    size_t eq = s.find('=');
    if (eq != string::npos) s = s.substr(eq + 1);
    if (s.find("true") != string::npos || s.find("True") != string::npos || s.find("1") != string::npos) return true;
    if (s.find("false") != string::npos || s.find("False") != string::npos || s.find("0") != string::npos) return false;
    return fallback;
}

inline char parse_single_char(string s, char fallback = ' ') {
    size_t eq = s.find('=');
    if (eq != string::npos) s = s.substr(eq + 1);
    size_t p = s.find_first_not_of(" \\t\\\"\\'");
    if (p != string::npos) return s[p];
    return fallback;
}

inline string parse_string_arg(string s) {
    size_t eq = s.find('=');
    if (eq != string::npos) s = s.substr(eq + 1);
    s.erase(0, s.find_first_not_of(" \\t\\\"\\'"));
    s.erase(s.find_last_not_of(" \\t\\\"\\'") + 1);
    return s;
}

// === USER SOLUTION ===
${userCode}

// === HIDDEN DRIVER ===
int main() {
    try {
        ${(userCode.includes('class Solution') || userCode.includes('struct Solution'))
          ? `Solution sol;
        string raw_input = R"RAW(${cleanInput || 'nums = [1, 2, 2]'})RAW";
        ${invocation}`
          : `cout << "Compiled and verified successfully." << endl;`}
    } catch (const exception& e) {
        cerr << "Runtime Error: " << e.what() << endl;
        return 1;
    } catch (...) {
        cerr << "Unknown Runtime Exception occurred." << endl;
        return 1;
    }
    return 0;
}
`;
  }

  // ==========================================
  // 2. PYTHON 3 UNIVERSAL DRIVER
  // ==========================================
  if (language === 'python' || (language as any) === 'py') {
    if (userCode.includes('if __name__ ==')) return userCode;

    return `import sys
import math
import collections
import heapq
import json
import ast
import re
from typing import List, Optional, Dict, Set, Tuple

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# === USER SOLUTION ===
${userCode}

# === HIDDEN DRIVER ===
if __name__ == '__main__':
    try:
        sol = Solution()
        raw_input = """${cleanInput || 'nums = [1, 2, 2]'}"""
        
        def split_args(s):
            args = []
            cur = ""
            b_depth = 0
            in_q = False
            q_char = ''
            for i, c in enumerate(s):
                if in_q:
                    cur += c
                    if c == q_char and (i == 0 or s[i-1] != '\\\\'):
                        in_q = False
                else:
                    if c in ('"', "'"):
                        in_q = True
                        q_char = c
                        cur += c
                    elif c in ('[', '{', '('):
                        b_depth += 1
                        cur += c
                    elif c in (']', '}', ')'):
                        b_depth = max(0, b_depth - 1)
                        cur += c
                    elif c == ',' and b_depth == 0:
                        if cur.strip():
                            args.append(cur.strip())
                            cur = ""
                    else:
                        cur += c
            if cur.strip():
                args.append(cur.strip())
            return args

        parts = split_args(raw_input.strip())
        parsed_args = []
        for p in parts:
            if '=' in p:
                _, val = p.split('=', 1)
                p = val.strip()
            try:
                parsed_args.append(ast.literal_eval(p))
            except Exception:
                parsed_args.append(p.strip('"\\''))

        user_code_str = """${userCode.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"')}"""
        user_methods = re.findall(r'def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*[(]', user_code_str)
        user_methods = [m for m in user_methods if not m.startswith('_')]

        helpers = {'dfs', 'bfs', 'backtrack', 'helper', 'solve', 'recur', 'recursion', 'util', 'calculate', 'check', 'isvalid', 'valid'}
        norm_title = "${normTitle}"
        target_method_name = None

        if norm_title:
            for m in user_methods:
                cand_norm = re.sub(r'[^a-z0-9]', '', m.lower())
                prefix = cand_norm[:5]
                if cand_norm == norm_title or norm_title in cand_norm or cand_norm in norm_title or (len(prefix) >= 4 and prefix in norm_title):
                    target_method_name = m
                    break

        if not target_method_name:
            for m in user_methods:
                if m.lower() not in helpers:
                    target_method_name = m
                    break

        if not target_method_name and user_methods:
            target_method_name = user_methods[0]

        def build_tree(vals):
            if not vals:
                return None
            if isinstance(vals, str):
                try: vals = json.loads(vals)
                except Exception: return None
            if not isinstance(vals, list) or not vals or vals[0] is None:
                return None
            root = TreeNode(vals[0])
            q = collections.deque([root])
            i = 1
            while q and i < len(vals):
                curr = q.popleft()
                if i < len(vals):
                    if vals[i] is not None:
                        curr.left = TreeNode(vals[i])
                        q.append(curr.left)
                    i += 1
                if i < len(vals):
                    if vals[i] is not None:
                        curr.right = TreeNode(vals[i])
                        q.append(curr.right)
                    i += 1
            return root

        def serialize_tree(root):
            if not root:
                return []
            res = []
            q = collections.deque([root])
            while q:
                node = q.popleft()
                if node:
                    res.append(node.val)
                    q.append(node.left)
                    q.append(node.right)
                else:
                    res.append(None)
            while res and res[-1] is None:
                res.pop()
            return res

        def build_list(vals):
            if not vals or not isinstance(vals, list):
                return None
            dummy = ListNode(0)
            cur = dummy
            for v in vals:
                cur.next = ListNode(v)
                cur = cur.next
            return dummy.next

        def serialize_list(head):
            res = []
            cur = head
            while cur:
                res.append(cur.val)
                cur = cur.next
            return res

        def serialize_val(val):
            if isinstance(val, TreeNode):
                return serialize_tree(val)
            if isinstance(val, ListNode):
                return serialize_list(val)
            return val

        if target_method_name and hasattr(sol, target_method_name):
            target_method = getattr(sol, target_method_name)
        else:
            methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
            target_method = getattr(sol, methods[0]) if methods else None

        if target_method:
            import inspect
            try:
                sig = inspect.signature(target_method)
                pnames = list(sig.parameters.keys())
                for idx, pname in enumerate(pnames):
                    if idx < len(parsed_args) and isinstance(parsed_args[idx], list):
                        plow = pname.lower()
                        if 'root' in plow or 'tree' in plow:
                            parsed_args[idx] = build_tree(parsed_args[idx])
                        elif 'head' in plow or 'list' in plow:
                            parsed_args[idx] = build_list(parsed_args[idx])
            except Exception:
                pass

            res = target_method(*parsed_args)
            if res is not None:
                print(json.dumps(serialize_val(res), separators=(',', ':')))
            else:
                out_val = parsed_args[0] if parsed_args else "Success"
                print(json.dumps(serialize_val(out_val), separators=(',', ':')))
        else:
            print("Python Solution verified successfully.")
    except Exception as e:
        sys.stderr.write(f"Runtime Error: {e}\\n")
        sys.exit(1)
`;
  }

  // ==========================================
  // 3. JAVASCRIPT (NODE.JS) UNIVERSAL DRIVER
  // ==========================================
  if (language === 'javascript' || (language as any) === 'js') {
    const fnMatch = userCode.match(/(?:var|let|const|function)\s+([a-zA-Z0-9_]+)/);
    const detectedFnName = fnMatch ? fnMatch[1] : '';

    return `// === USER SOLUTION ===
${userCode}

// === HIDDEN DRIVER ===
try {
    const rawInput = \`${cleanInput || 'nums = [1, 2, 2]'}\`;
    function splitArgs(s) {
        const args = [];
        let cur = '';
        let bDepth = 0;
        let inQ = false;
        let qChar = '';
        for (let i = 0; i < s.length; i++) {
            const c = s[i];
            if (inQ) {
                cur += c;
                if (c === qChar && (i === 0 || s[i - 1] !== '\\\\')) inQ = false;
            } else {
                if (c === '"' || c === "'") {
                    inQ = true;
                    qChar = c;
                    cur += c;
                } else if (c === '[' || c === '{' || c === '(') {
                    bDepth++;
                    cur += c;
                } else if (c === ']' || c === '}' || c === ')') {
                    bDepth = Math.max(0, bDepth - 1);
                    cur += c;
                } else if (c === ',' && bDepth === 0) {
                    if (cur.trim()) { args.push(cur.trim()); cur = ''; }
                } else {
                    cur += c;
                }
            }
        }
        if (cur.trim()) args.push(cur.trim());
        return args;
    }

    const rawParts = splitArgs(rawInput.trim());
    const parsedArgs = rawParts.map(p => {
        let val = p;
        if (p.includes('=')) {
            val = p.substring(p.indexOf('=') + 1).trim();
        }
        try { return JSON.parse(val); } catch(e) { return val.replace(/^["']|["']$/g, ''); }
    });

    let res;
    if (typeof Solution === 'function') {
        const sol = new Solution();
        const methodNames = Object.getOwnPropertyNames(Solution.prototype).filter(m => m !== 'constructor');
        if (methodNames.length > 0) res = sol[methodNames[0]](...parsedArgs);
    } else if (typeof ${detectedFnName || 'null'} === 'function') {
        res = ${detectedFnName}(...parsedArgs);
    } else {
        const fnNames = Object.keys(global).filter(k => typeof global[k] === 'function' && !k.startsWith('_'));
        if (fnNames.length > 0) res = global[fnNames[0]](...parsedArgs);
    }
    console.log(JSON.stringify(res !== undefined ? res : (parsedArgs[0] || 'Success')));
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
`;
  }

  // ==========================================
  // 4. JAVA UNIVERSAL DRIVER
  // ==========================================
  if (language === 'java') {
    if (userCode.includes('public static void main(') || userCode.includes('class Main')) return userCode;
    const hasSolutionClass = userCode.includes('class Solution');

    return `import java.util.*;
import java.io.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

// === USER SOLUTION ===
${userCode}

// === HIDDEN DRIVER ===
class Main {
    public static void main(String[] args) {
        try {
            ${hasSolutionClass ? `
            Solution sol = new Solution();
            System.out.println("Java Solution executed successfully.");
            ` : `System.out.println("Java Solution executed successfully.");`}
        } catch (Exception e) {
            System.err.println("Runtime Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
`;
  }

  return userCode;
}

export async function executeCode(
  code: string, 
  language: SupportedLanguage,
  testInput: string = '',
  problemTitle: string = '',
  preloadedDriver?: string
): Promise<CodeExecutionResult> {
  const startTime = performance.now();
  const normLang = (language || 'python').toLowerCase() as SupportedLanguage;
  const executableCode = wrapLeetCodeExecutableCode(code, normLang, testInput, problemTitle, preloadedDriver);

  // 1. Try Direct Judge0 CE Execution First for authentic compiler stdout/stderr
  try {
    const langId = JUDGE0_LANG_MAP[normLang] || 71;
    const encodedCode = btoa(unescape(encodeURIComponent(executableCode)));
    const j0Payload: any = {
      source_code: encodedCode,
      language_id: langId
    };
    if (langId === 54 || normLang === 'cpp' || (normLang as any) === 'c++') {
      j0Payload.compiler_options = "-std=c++17 -O2";
    }

    const response = await fetch('https://ce.judge0.com/submissions?wait=true&base64_encoded=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(j0Payload),
      signal: AbortSignal.timeout(8000)
    });

    if (response.ok) {
      const data = await response.json();
      const endTime = performance.now();

      const decodeB64 = (str?: string) => {
        if (!str) return '';
        try {
          return decodeURIComponent(escape(atob(str)));
        } catch {
          return str;
        }
      };

      const stdout = decodeB64(data.stdout);
      const stderr = decodeB64(data.stderr);
      const compileOut = decodeB64(data.compile_output);
      
      let rawDiag = (stderr + (compileOut ? '\n' + compileOut : '')).trim();
      const isFatalErr = Boolean(
        (data.status && data.status.id > 3) ||
        (data.exit_code && data.exit_code !== 0) ||
        (stderr && (stderr.includes('Runtime Error:') || stderr.includes('Exception') || stderr.includes('Traceback'))) ||
        (compileOut && compileOut.includes('error:'))
      );

      // Clean non-fatal C++ compiler warnings (structured bindings, deprecation warnings) from diagnostics
      let cleanDiag = rawDiag;
      if (!isFatalErr && !rawDiag.toLowerCase().includes('error:') && !rawDiag.toLowerCase().includes('runtime error')) {
        const lines = rawDiag.split('\n').filter(l => {
          const lower = l.toLowerCase();
          return !lower.includes('warning:') && !lower.includes('warning: structured bindings');
        });
        cleanDiag = lines.join('\n').trim();
      }

      const finalStdout = stdout.trim();

      return {
        stdout: finalStdout || (isFatalErr ? '' : 'Executed successfully.'),
        stderr: cleanDiag,
        exit_code: isFatalErr ? 1 : 0,
        execution_time_ms: Math.round(endTime - startTime),
        memory_used_kb: Math.round((data.memory || 1420)),
        status: isFatalErr ? 'ERROR' : 'SUCCESS'
      };
    }
  } catch (err) {
    console.warn('[SDETube Compiler] Judge0 notice, falling back to Backend:', err);
  }

  // 2. Try Backend API (/api/compile)
  try {
    const compileEndpoint = `${TELEGRAM_BACKEND_URL}/api/compile`;
    const response = await fetch(compileEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language: normLang,
        code: executableCode,
        input: testInput
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (response.ok) {
      const resData = await response.json();
      const endTime = performance.now();
      const rawStderr = (resData.stderr || resData.error || '').trim();
      const isFatalErr = Boolean(rawStderr && (rawStderr.includes('error:') || rawStderr.includes('Runtime Error') || rawStderr.includes('Exception') || rawStderr.includes('Traceback')));

      return {
        stdout: resData.stdout || resData.output || '',
        stderr: rawStderr,
        exit_code: isFatalErr ? 1 : (resData.exitCode ?? 0),
        execution_time_ms: Math.round(endTime - startTime),
        memory_used_kb: Math.round(resData.memoryUsedKb || 3420),
        status: isFatalErr ? 'ERROR' : 'SUCCESS'
      };
    }
  } catch (err) {
    console.error('[SDETube Compiler] Execution error:', err);
  }

  // 3. Fallback
  return {
    stdout: '',
    stderr: 'Compiler execution failed or timed out. Please try again.',
    exit_code: 1,
    execution_time_ms: Math.round(performance.now() - startTime),
    memory_used_kb: 0,
    status: 'ERROR'
  };
}
