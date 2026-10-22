/**
 * SDETube Monaco Editor Autocomplete & Suggestion Engine (LeetCode Parity)
 * 
 * Provides rich IntelliSense, STL/Collections completions, method completions,
 * DSA algorithm snippets, and context-aware starter-code parameter discovery
 * for all supported languages (C++, Java, Python, JavaScript, TypeScript, Go, Rust).
 */

type Monaco = typeof import('monaco-editor');

let isRegistered = false;

/**
 * Extracts method argument names from the starter code template.
 * E.g. "int twoSum(vector<int>& nums, int target)" -> ["nums", "target"]
 */
export function extractParametersFromCode(code: string, language: string): string[] {
  if (!code) return [];
  const params: Set<string> = new Set();

  try {
    const normLang = (language || '').toLowerCase();

    if (normLang === 'python') {
      // def search(self, nums: List[int], target: int) -> int:
      const defMatch = code.match(/def\s+[a-zA-Z0-9_]+\s*\(([^)]*)\)/);
      if (defMatch && defMatch[1]) {
        defMatch[1].split(',').forEach(p => {
          const clean = p.split(':')[0].trim();
          if (clean && clean !== 'self' && clean !== 'cls' && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(clean)) {
            params.add(clean);
          }
        });
      }
    } else if (normLang === 'cpp' || normLang === 'c++') {
      // vector<int> twoSum(vector<int>& nums, int target)
      // ListNode* reverseList(ListNode* head)
      const sigMatch = code.match(/[a-zA-Z0-9_:*<>]+\s+[a-zA-Z0-9_]+\s*\(([^)]*)\)\s*(?:const)?\s*\{?/);
      if (sigMatch && sigMatch[1]) {
        sigMatch[1].split(',').forEach(p => {
          const tokens = p.trim().replace(/[*&]/g, ' ').split(/\s+/).filter(Boolean);
          if (tokens.length >= 2) {
            const varName = tokens[tokens.length - 1];
            if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
              params.add(varName);
            }
          }
        });
      }
    } else if (normLang === 'java') {
      // public int[] twoSum(int[] nums, int target)
      const sigMatch = code.match(/(?:public|private|protected)?\s*(?:static\s+)?[a-zA-Z0-9_<>\[\]]+\s+[a-zA-Z0-9_]+\s*\(([^)]*)\)/);
      if (sigMatch && sigMatch[1]) {
        sigMatch[1].split(',').forEach(p => {
          const tokens = p.trim().split(/\s+/).filter(Boolean);
          if (tokens.length >= 2) {
            const varName = tokens[tokens.length - 1];
            if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
              params.add(varName);
            }
          }
        });
      }
    } else if (normLang === 'javascript' || normLang === 'typescript') {
      // var twoSum = function(nums, target) or function twoSum(nums, target)
      const fnMatch = code.match(/function\s*(?:[a-zA-Z0-9_]+)?\s*\(([^)]*)\)/) || code.match(/(?:const|let|var)\s+[a-zA-Z0-9_]+\s*=\s*(?:async\s*)?\(([^)]*)\)/);
      if (fnMatch && fnMatch[1]) {
        fnMatch[1].split(',').forEach(p => {
          const clean = p.split(':')[0].trim();
          if (clean && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(clean)) {
            params.add(clean);
          }
        });
      }
    } else if (normLang === 'go') {
      // func search(nums []int, target int) int
      const fnMatch = code.match(/func\s+[a-zA-Z0-9_]+\s*\(([^)]*)\)/);
      if (fnMatch && fnMatch[1]) {
        fnMatch[1].split(',').forEach(p => {
          const tokens = p.trim().split(/\s+/);
          if (tokens.length >= 1 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tokens[0])) {
            params.add(tokens[0]);
          }
        });
      }
    } else if (normLang === 'rust') {
      // pub fn search(nums: Vec<i32>, target: i32) -> i32
      const fnMatch = code.match(/fn\s+[a-zA-Z0-9_]+\s*\(([^)]*)\)/);
      if (fnMatch && fnMatch[1]) {
        fnMatch[1].split(',').forEach(p => {
          const clean = p.split(':')[0].replace(/mut\s+/, '').trim();
          if (clean && clean !== '&self' && clean !== '&mut self' && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(clean)) {
            params.add(clean);
          }
        });
      }
    }
  } catch {}

  return Array.from(params);
}

/**
 * Common C++ STL Autocomplete Items
 */
function getCppSuggestions(monaco: any, range: any): any[] {
  const K = monaco.languages.CompletionItemKind;
  return [
    // Clean Keywords & Fundamental Types (Instant replacement without snippet lock)
    { label: 'void', kind: K.Keyword, insertText: 'void', detail: 'void keyword', range },
    { label: 'int', kind: K.Keyword, insertText: 'int', detail: 'int type', range },
    { label: 'long long', kind: K.Keyword, insertText: 'long long', detail: '64-bit integer type', range },
    { label: 'string', kind: K.Class, insertText: 'string', detail: 'std::string', range },
    { label: 'bool', kind: K.Keyword, insertText: 'bool', detail: 'boolean type', range },
    { label: 'char', kind: K.Keyword, insertText: 'char', detail: 'char type', range },
    { label: 'double', kind: K.Keyword, insertText: 'double', detail: 'double type', range },
    { label: 'auto', kind: K.Keyword, insertText: 'auto', detail: 'auto type deduction', range },
    { label: 'const', kind: K.Keyword, insertText: 'const', detail: 'const qualifier', range },
    { label: 'return', kind: K.Keyword, insertText: 'return', detail: 'return statement', range },
    { label: 'nullptr', kind: K.Keyword, insertText: 'nullptr', detail: 'null pointer literal', range },

    // Containers (Clean type templates)
    { label: 'vector', kind: K.Class, insertText: 'vector<${1:int}>', insertTextRules: 4, detail: 'std::vector<T>', range },
    { label: 'unordered_map', kind: K.Class, insertText: 'unordered_map<${1:int}, ${2:int}>', insertTextRules: 4, detail: 'std::unordered_map<K, V>', range },
    { label: 'unordered_set', kind: K.Class, insertText: 'unordered_set<${1:int}>', insertTextRules: 4, detail: 'std::unordered_set<T>', range },
    { label: 'priority_queue', kind: K.Class, insertText: 'priority_queue<${1:int}>', insertTextRules: 4, detail: 'std::priority_queue (Max-Heap)', range },
    { label: 'priority_queue_min', kind: K.Snippet, insertText: 'priority_queue<${1:int}, vector<${1:int}>, greater<${1:int}>>', insertTextRules: 4, detail: 'std::priority_queue (Min-Heap)', range },
    { label: 'queue', kind: K.Class, insertText: 'queue<${1:int}>', insertTextRules: 4, detail: 'std::queue FIFO container', range },
    { label: 'stack', kind: K.Class, insertText: 'stack<${1:int}>', insertTextRules: 4, detail: 'std::stack LIFO container', range },
    { label: 'deque', kind: K.Class, insertText: 'deque<${1:int}>', insertTextRules: 4, detail: 'std::deque double-ended queue', range },
    { label: 'pair', kind: K.Class, insertText: 'pair<${1:int}, ${2:int}>', insertTextRules: 4, detail: 'std::pair<T1, T2>', range },

    // Full Variable Declaration Snippets (Explicitly labeled as snippets)
    { label: 'vector_def', kind: K.Snippet, insertText: 'vector<${1:int}> ${2:v};', insertTextRules: 4, detail: 'vector<T> v; declaration', range },
    { label: 'unordered_map_def', kind: K.Snippet, insertText: 'unordered_map<${1:int}, ${2:int}> ${3:mp};', insertTextRules: 4, detail: 'unordered_map<K, V> mp; declaration', range },
    { label: 'unordered_set_def', kind: K.Snippet, insertText: 'unordered_set<${1:int}> ${2:st};', insertTextRules: 4, detail: 'unordered_set<T> st; declaration', range },

    // Member methods
    { label: 'push_back', kind: K.Method, insertText: 'push_back(${1:val})', insertTextRules: 4, detail: 'vector.push_back(val)', range },
    { label: 'emplace_back', kind: K.Method, insertText: 'emplace_back(${1:args})', insertTextRules: 4, detail: 'vector.emplace_back(...)', range },
    { label: 'pop_back', kind: K.Method, insertText: 'pop_back()', detail: 'vector.pop_back()', range },
    { label: 'size', kind: K.Method, insertText: 'size()', detail: 'container.size()', range },
    { label: 'empty', kind: K.Method, insertText: 'empty()', detail: 'container.empty()', range },
    { label: 'clear', kind: K.Method, insertText: 'clear()', detail: 'container.clear()', range },
    { label: 'begin', kind: K.Method, insertText: 'begin()', detail: 'container.begin()', range },
    { label: 'end', kind: K.Method, insertText: 'end()', detail: 'container.end()', range },
    { label: 'insert', kind: K.Method, insertText: 'insert(${1:val})', insertTextRules: 4, detail: 'set/map.insert(val)', range },
    { label: 'erase', kind: K.Method, insertText: 'erase(${1:key})', insertTextRules: 4, detail: 'set/map.erase(key)', range },
    { label: 'find', kind: K.Method, insertText: 'find(${1:key})', insertTextRules: 4, detail: 'map.find(key)', range },
    { label: 'count', kind: K.Method, insertText: 'count(${1:key})', insertTextRules: 4, detail: 'set/map.count(key)', range },

    // Algorithm functions
    { label: 'sort', kind: K.Function, insertText: 'sort(${1:v}.begin(), ${1:v}.end());', insertTextRules: 4, detail: 'std::sort(begin, end)', range },
    { label: 'sort_desc', kind: K.Function, insertText: 'sort(${1:v}.begin(), ${1:v}.end(), greater<>());', insertTextRules: 4, detail: 'std::sort descending', range },
    { label: 'reverse', kind: K.Function, insertText: 'reverse(${1:v}.begin(), ${1:v}.end());', insertTextRules: 4, detail: 'std::reverse(begin, end)', range },
    { label: 'lower_bound', kind: K.Function, insertText: 'lower_bound(${1:v}.begin(), ${1:v}.end(), ${2:val})', insertTextRules: 4, detail: 'std::lower_bound', range },
    { label: 'upper_bound', kind: K.Function, insertText: 'upper_bound(${1:v}.begin(), ${1:v}.end(), ${2:val})', insertTextRules: 4, detail: 'std::upper_bound', range },
    { label: 'max', kind: K.Function, insertText: 'max(${1:a}, ${2:b})', insertTextRules: 4, detail: 'std::max(a, b)', range },
    { label: 'min', kind: K.Function, insertText: 'min(${1:a}, ${2:b})', insertTextRules: 4, detail: 'std::min(a, b)', range },

    // Snippets
    { label: 'fori', kind: K.Snippet, insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ++${1:i}) {\n\t$0\n}', insertTextRules: 4, detail: 'Index for-loop', range },
    { label: 'forauto', kind: K.Snippet, insertText: 'for (const auto& ${1:x} : ${2:container}) {\n\t$0\n}', insertTextRules: 4, detail: 'Range-based for-loop', range },
    { label: 'matrix_2d', kind: K.Snippet, insertText: 'vector<vector<${1:int}>> dp(${2:m}, vector<${1:int}>(${3:n}, ${4:0}));', insertTextRules: 4, detail: '2D Vector grid', range }
  ];
}

/**
 * Common Java Collections Autocomplete Items
 */
function getJavaSuggestions(monaco: any, range: any): any[] {
  const K = monaco.languages.CompletionItemKind;
  return [
    // Collections
    { label: 'ArrayList', kind: K.Class, insertText: 'List<${1:Integer}> ${2:list} = new ArrayList<>();', insertTextRules: 4, detail: 'List<T> list = new ArrayList<>()', range },
    { label: 'HashMap', kind: K.Class, insertText: 'Map<${1:Integer}, ${2:Integer}> ${3:map} = new HashMap<>();', insertTextRules: 4, detail: 'Map<K, V> map = new HashMap<>()', range },
    { label: 'HashSet', kind: K.Class, insertText: 'Set<${1:Integer}> ${2:set} = new HashSet<>();', insertTextRules: 4, detail: 'Set<T> set = new HashSet<>()', range },
    { label: 'PriorityQueue', kind: K.Class, insertText: 'PriorityQueue<${1:Integer}> ${2:pq} = new PriorityQueue<>();', insertTextRules: 4, detail: 'PriorityQueue (Min-Heap)', range },
    { label: 'PriorityQueue_max', kind: K.Snippet, insertText: 'PriorityQueue<${1:Integer}> ${2:pq} = new PriorityQueue<>(Collections.reverseOrder());', insertTextRules: 4, detail: 'PriorityQueue (Max-Heap)', range },
    { label: 'ArrayDeque', kind: K.Class, insertText: 'Deque<${1:Integer}> ${2:deque} = new ArrayDeque<>();', insertTextRules: 4, detail: 'Deque<T> deque = new ArrayDeque<>()', range },
    { label: 'StringBuilder', kind: K.Class, insertText: 'StringBuilder sb = new StringBuilder();', detail: 'StringBuilder', range },

    // Methods
    { label: 'getOrDefault', kind: K.Method, insertText: 'getOrDefault(${1:key}, ${2:defaultValue})', insertTextRules: 4, detail: 'map.getOrDefault(key, default)', range },
    { label: 'putIfAbsent', kind: K.Method, insertText: 'putIfAbsent(${1:key}, ${2:val})', insertTextRules: 4, detail: 'map.putIfAbsent(key, val)', range },
    { label: 'containsKey', kind: K.Method, insertText: 'containsKey(${1:key})', insertTextRules: 4, detail: 'map.containsKey(key)', range },
    { label: 'contains', kind: K.Method, insertText: 'contains(${1:val})', insertTextRules: 4, detail: 'collection.contains(val)', range },
    { label: 'toCharArray', kind: K.Method, insertText: 'toCharArray()', detail: 'str.toCharArray()', range },
    { label: 'substring', kind: K.Method, insertText: 'substring(${1:start}, ${2:end})', insertTextRules: 4, detail: 'str.substring(start, end)', range },
    { label: 'offer', kind: K.Method, insertText: 'offer(${1:val})', insertTextRules: 4, detail: 'queue.offer(val)', range },
    { label: 'poll', kind: K.Method, insertText: 'poll()', detail: 'queue.poll()', range },
    { label: 'peek', kind: K.Method, insertText: 'peek()', detail: 'queue.peek()', range },

    // Math & Arrays
    { label: 'Math.max', kind: K.Function, insertText: 'Math.max(${1:a}, ${2:b})', insertTextRules: 4, detail: 'Math.max(a, b)', range },
    { label: 'Math.min', kind: K.Function, insertText: 'Math.min(${1:a}, ${2:b})', insertTextRules: 4, detail: 'Math.min(a, b)', range },
    { label: 'Math.abs', kind: K.Function, insertText: 'Math.abs(${1:n})', insertTextRules: 4, detail: 'Math.abs(n)', range },
    { label: 'Arrays.sort', kind: K.Function, insertText: 'Arrays.sort(${1:arr});', insertTextRules: 4, detail: 'Arrays.sort(arr)', range },
    { label: 'Arrays.fill', kind: K.Function, insertText: 'Arrays.fill(${1:arr}, ${2:val});', insertTextRules: 4, detail: 'Arrays.fill(arr, val)', range },

    // Snippets
    { label: 'fori', kind: K.Snippet, insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}', insertTextRules: 4, detail: 'Indexed for loop', range },
    { label: 'foreach', kind: K.Snippet, insertText: 'for (${1:int} ${2:x} : ${3:nums}) {\n\t$0\n}', insertTextRules: 4, detail: 'Enhanced for loop', range },
    { label: 'matrix_2d', kind: K.Snippet, insertText: 'int[][] dp = new int[${1:m}][${2:n}];', insertTextRules: 4, detail: '2D int array', range }
  ];
}

/**
 * Common Python DSA Autocomplete Items
 */
function getPythonSuggestions(monaco: any, range: any): any[] {
  const K = monaco.languages.CompletionItemKind;
  return [
    // Collections
    { label: 'defaultdict', kind: K.Class, insertText: 'defaultdict(${1:int})', insertTextRules: 4, detail: 'collections.defaultdict', range },
    { label: 'defaultdict_list', kind: K.Class, insertText: 'defaultdict(list)', detail: 'collections.defaultdict(list)', range },
    { label: 'Counter', kind: K.Class, insertText: 'Counter(${1:nums})', insertTextRules: 4, detail: 'collections.Counter(iterable)', range },
    { label: 'deque', kind: K.Class, insertText: 'deque([${1}])', insertTextRules: 4, detail: 'collections.deque()', range },

    // Heapq
    { label: 'heappush', kind: K.Function, insertText: 'heapq.heappush(${1:heap}, ${2:item})', insertTextRules: 4, detail: 'heapq.heappush(heap, item)', range },
    { label: 'heappop', kind: K.Function, insertText: 'heapq.heappop(${1:heap})', insertTextRules: 4, detail: 'heapq.heappop(heap)', range },
    { label: 'heapify', kind: K.Function, insertText: 'heapq.heapify(${1:heap})', insertTextRules: 4, detail: 'heapq.heapify(list)', range },

    // Bisect
    { label: 'bisect_left', kind: K.Function, insertText: 'bisect.bisect_left(${1:a}, ${2:x})', insertTextRules: 4, detail: 'bisect.bisect_left(a, x)', range },
    { label: 'bisect_right', kind: K.Function, insertText: 'bisect.bisect_right(${1:a}, ${2:x})', insertTextRules: 4, detail: 'bisect.bisect_right(a, x)', range },

    // Builtins
    { label: 'enumerate', kind: K.Function, insertText: 'enumerate(${1:iterable})', insertTextRules: 4, detail: 'enumerate(iterable)', range },
    { label: 'zip', kind: K.Function, insertText: 'zip(${1:a}, ${2:b})', insertTextRules: 4, detail: 'zip(iter1, iter2)', range },
    { label: 'sorted', kind: K.Function, insertText: 'sorted(${1:iterable})', insertTextRules: 4, detail: 'sorted(iterable)', range },
    { label: 'float_inf', kind: K.Constant, insertText: 'float(\'inf\')', detail: 'Positive infinity', range },

    // Snippets
    { label: 'fori', kind: K.Snippet, insertText: 'for ${1:i} in range(${2:n}):\n\t$0', insertTextRules: 4, detail: 'for index in range(n)', range },
    { label: 'forenum', kind: K.Snippet, insertText: 'for ${1:i}, ${2:num} in enumerate(${3:nums}):\n\t$0', insertTextRules: 4, detail: 'for i, val in enumerate(...)', range },
    { label: 'grid_2d', kind: K.Snippet, insertText: 'dp = [[0] * ${1:cols} for _ in range(${2:rows})]', insertTextRules: 4, detail: '2D matrix comprehension', range }
  ];
}

/**
 * Common JavaScript / TypeScript DSA Autocomplete Items
 */
function getJsTsSuggestions(monaco: any, range: any): any[] {
  const K = monaco.languages.CompletionItemKind;
  return [
    { label: 'Map', kind: K.Class, insertText: 'const ${1:map} = new Map();', insertTextRules: 4, detail: 'new Map()', range },
    { label: 'Set', kind: K.Class, insertText: 'const ${1:set} = new Set();', insertTextRules: 4, detail: 'new Set()', range },
    { label: 'sort_numeric', kind: K.Snippet, insertText: 'sort((a, b) => a - b)', detail: 'Numeric ascending sort', range },
    { label: 'sort_desc', kind: K.Snippet, insertText: 'sort((a, b) => b - a)', detail: 'Numeric descending sort', range },
    { label: 'Math.max', kind: K.Function, insertText: 'Math.max(${1:a}, ${2:b})', insertTextRules: 4, detail: 'Math.max(a, b)', range },
    { label: 'Math.min', kind: K.Function, insertText: 'Math.min(${1:a}, ${2:b})', insertTextRules: 4, detail: 'Math.min(a, b)', range },
    { label: 'fori', kind: K.Snippet, insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}', insertTextRules: 4, detail: 'for let i = 0', range },
    { label: 'forof', kind: K.Snippet, insertText: 'for (const ${1:item} of ${2:iterable}) {\n\t$0\n}', insertTextRules: 4, detail: 'for...of loop', range },
    { label: 'grid_2d', kind: K.Snippet, insertText: 'const dp = Array.from({ length: ${1:m} }, () => new Array(${2:n}).fill(0));', insertTextRules: 4, detail: '2D Array grid', range }
  ];
}

/**
 * Common Go DSA Autocomplete Items
 */
function getGoSuggestions(monaco: any, range: any): any[] {
  const K = monaco.languages.CompletionItemKind;
  return [
    { label: 'make_slice', kind: K.Function, insertText: 'make([]${1:int}, ${2:n})', insertTextRules: 4, detail: 'make([]T, len)', range },
    { label: 'make_map', kind: K.Function, insertText: 'make(map[${1:int}]${2:int})', insertTextRules: 4, detail: 'make(map[K]V)', range },
    { label: 'sort_Slice', kind: K.Function, insertText: 'sort.Slice(${1:nums}, func(i, j int) bool {\n\treturn ${1:nums}[i] < ${1:nums}[j]\n})', insertTextRules: 4, detail: 'sort.Slice comparator', range },
    { label: 'sort_Ints', kind: K.Function, insertText: 'sort.Ints(${1:nums})', insertTextRules: 4, detail: 'sort.Ints(slice)', range },
    { label: 'fori', kind: K.Snippet, insertText: 'for ${1:i} := 0; ${1:i} < ${2:n}; ${1:i}++ {\n\t$0\n}', insertTextRules: 4, detail: 'for i := 0 loop', range },
    { label: 'forrange', kind: K.Snippet, insertText: 'for ${1:i}, ${2:val} := range ${3:nums} {\n\t$0\n}', insertTextRules: 4, detail: 'for index, val := range', range }
  ];
}

/**
 * Common Rust DSA Autocomplete Items
 */
function getRustSuggestions(monaco: any, range: any): any[] {
  const K = monaco.languages.CompletionItemKind;
  return [
    { label: 'Vec::new', kind: K.Function, insertText: 'Vec::new()', detail: 'Vec::new()', range },
    { label: 'vec_macro', kind: K.Snippet, insertText: 'vec![${1:0}; ${2:n}]', insertTextRules: 4, detail: 'vec![val; n]', range },
    { label: 'HashMap::new', kind: K.Function, insertText: 'HashMap::new()', detail: 'std::collections::HashMap::new()', range },
    { label: 'HashSet::new', kind: K.Function, insertText: 'HashSet::new()', detail: 'std::collections::HashSet::new()', range },
    { label: 'BinaryHeap::new', kind: K.Function, insertText: 'BinaryHeap::new()', detail: 'std::collections::BinaryHeap::new()', range },
    { label: 'fori', kind: K.Snippet, insertText: 'for ${1:i} in 0..${2:n} {\n\t$0\n}', insertTextRules: 4, detail: 'for i in 0..n', range }
  ];
}

/**
 * LeetCode High-Frequency Algorithm Templates
 */
function getAlgorithmSnippets(monaco: any, range: any, language: string): any[] {
  const K = monaco.languages.CompletionItemKind;
  const lang = (language || '').toLowerCase();

  const snippets = [];

  // Binary Search Template
  if (lang === 'python') {
    snippets.push({
      label: 'algo-binary-search',
      kind: K.Snippet,
      insertText: [
        'left, right = 0, len(${1:nums}) - 1',
        'while left <= right:',
        '\tmid = left + (right - left) // 2',
        '\tif ${1:nums}[mid] == ${2:target}:',
        '\t\treturn mid',
        '\telif ${1:nums}[mid] < ${2:target}:',
        '\t\tleft = mid + 1',
        '\telse:',
        '\t\tright = mid - 1',
        'return -1'
      ].join('\n'),
      insertTextRules: 4,
      detail: 'Binary Search Algorithm Template (Python)',
      range
    });
  } else {
    snippets.push({
      label: 'algo-binary-search',
      kind: K.Snippet,
      insertText: [
        'int left = 0, right = ${1:nums}.size() - 1;',
        'while (left <= right) {',
        '\tint mid = left + (right - left) / 2;',
        '\tif (${1:nums}[mid] == ${2:target}) {',
        '\t\treturn mid;',
        '\t} else if (${1:nums}[mid] < ${2:target}) {',
        '\t\tleft = mid + 1;',
        '\t} else {',
        '\t\tright = mid - 1;',
        '\t}',
        '}',
        'return -1;'
      ].join('\n'),
      insertTextRules: 4,
      detail: 'Binary Search Algorithm Template (C++/Java)',
      range
    });
  }

  // Sliding Window Template
  if (lang === 'python') {
    snippets.push({
      label: 'algo-sliding-window',
      kind: K.Snippet,
      insertText: [
        'left = 0',
        'window_state = {}',
        'for right in range(len(${1:nums})):',
        '\t# 1. Expand right window',
        '\tval = ${1:nums}[right]',
        '\twindow_state[val] = window_state.get(val, 0) + 1',
        '\t# 2. Shrink left if condition violated',
        '\twhile ${2:condition}:',
        '\t\tleft_val = ${1:nums}[left]',
        '\t\twindow_state[left_val] -= 1',
        '\t\tleft += 1',
        '\t# 3. Update answer'
      ].join('\n'),
      insertTextRules: 4,
      detail: 'Sliding Window Algorithm Template (Python)',
      range
    });
  } else {
    snippets.push({
      label: 'algo-sliding-window',
      kind: K.Snippet,
      insertText: [
        'int left = 0;',
        'for (int right = 0; right < ${1:nums}.size(); ++right) {',
        '\t// 1. Expand window with nums[right]',
        '\t',
        '\t// 2. Shrink window while invalid',
        '\twhile (${2:/* invalid condition */}) {',
        '\t\t// shrink nums[left]',
        '\t\tleft++;',
        '\t}',
        '\t// 3. Update result',
        '}'
      ].join('\n'),
      insertTextRules: 4,
      detail: 'Sliding Window Template (C++/Java)',
      range
    });
  }

  // BFS Template
  if (lang === 'python') {
    snippets.push({
      label: 'algo-bfs',
      kind: K.Snippet,
      insertText: [
        'queue = deque([${1:start_node}])',
        'visited = set([${1:start_node}])',
        'level = 0',
        'while queue:',
        '\tfor _ in range(len(queue)):',
        '\t\tnode = queue.popleft()',
        '\t\tfor neighbor in ${2:graph}[node]:',
        '\t\t\tif neighbor not in visited:',
        '\t\t\t\tvisited.add(neighbor)',
        '\t\t\t\tqueue.append(neighbor)',
        '\tlevel += 1'
      ].join('\n'),
      insertTextRules: 4,
      detail: 'Breadth-First Search (BFS Level-Order Template)',
      range
    });
  }

  return snippets;
}

/**
 * Registers language-specific completion providers on the Monaco instance.
 */
export function registerLeetCodeCompletionProviders(monaco: Monaco): void {
  if (isRegistered || !monaco || !monaco.languages) return;
  isRegistered = true;

  const languages = ['cpp', 'c', 'java', 'python', 'javascript', 'typescript', 'go', 'rust'];

  languages.forEach(langId => {
    monaco.languages.registerCompletionItemProvider(langId, {
      triggerCharacters: ['.', ':', '>', '<'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const lineContent = model.getLineContent(position.lineNumber);
        const lineBefore = lineContent.substring(0, position.column - 1).trim();
        const isMemberAccess = lineBefore.endsWith('.') || lineBefore.endsWith('->') || lineBefore.endsWith('::');

        // CRITICAL FIX: If there is no active typed word and no member access, do NOT trigger suggestions.
        // This prevents suggestions popping up in blank whitespace, after spacebars (e.g. after "void "),
        // or on blank lines, which steals keyboard focus and traps Backspace and Enter.
        if (!word.word && !isMemberAccess) {
          return { suggestions: [] };
        }

        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const code = model.getValue();
        const detectedParams = extractParametersFromCode(code, langId);

        const suggestions: any[] = [];

        // 1. High Priority Starter Parameter Auto-Completions
        detectedParams.forEach(param => {
          suggestions.push({
            label: param,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: param,
            detail: `Problem parameter (${param})`,
            sortText: '0000_' + param, // Priority sort
            range
          });
        });

        // 2. TreeNode & ListNode Properties (only on member access)
        if (isMemberAccess) {
          if (code.includes('TreeNode')) {
            suggestions.push(
              { label: 'val', kind: monaco.languages.CompletionItemKind.Field, insertText: 'val', detail: 'TreeNode.val', sortText: '0001_val', range },
              { label: 'left', kind: monaco.languages.CompletionItemKind.Field, insertText: 'left', detail: 'TreeNode.left', sortText: '0001_left', range },
              { label: 'right', kind: monaco.languages.CompletionItemKind.Field, insertText: 'right', detail: 'TreeNode.right', sortText: '0001_right', range }
            );
          }
          if (code.includes('ListNode')) {
            suggestions.push(
              { label: 'val', kind: monaco.languages.CompletionItemKind.Field, insertText: 'val', detail: 'ListNode.val', sortText: '0001_val', range },
              { label: 'next', kind: monaco.languages.CompletionItemKind.Field, insertText: 'next', detail: 'ListNode.next', sortText: '0001_next', range }
            );
          }
        }

        // 3. Language-Specific STL / Collections / Keywords
        if (langId === 'cpp' || langId === 'c') {
          suggestions.push(...getCppSuggestions(monaco, range));
        } else if (langId === 'java') {
          suggestions.push(...getJavaSuggestions(monaco, range));
        } else if (langId === 'python') {
          suggestions.push(...getPythonSuggestions(monaco, range));
        } else if (langId === 'javascript' || langId === 'typescript') {
          suggestions.push(...getJsTsSuggestions(monaco, range));
        } else if (langId === 'go') {
          suggestions.push(...getGoSuggestions(monaco, range));
        } else if (langId === 'rust') {
          suggestions.push(...getRustSuggestions(monaco, range));
        }

        // 4. Algorithm Snippets (only show when typing at least 2 characters)
        if (word.word && word.word.length >= 2) {
          suggestions.push(...getAlgorithmSnippets(monaco, range, langId));
        }

        return { suggestions };
      }
    });
  });
}
