import React, { useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { 
  Play, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  Minimize2, 
  Code, 
  BookOpen, 
  Lightbulb, 
  Zap, 
  Award,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { executeCode, SupportedLanguage } from '../lib/compiler';
import { requestMistralCodeReview, CodeTAReview } from '../lib/mistral';
import { CodeExecutionResult, QuizQuestion } from '../lib/types';
import confetti from 'canvas-confetti';

interface LeetCodeWorkspaceModalProps {
  question?: QuizQuestion;
  problemTitle: string;
  initialLanguage?: SupportedLanguage;
  initialCode?: string;
  onClose: () => void;
  onCodeExecuted?: (timeTakenSeconds: number, isCorrect: boolean) => void;
}

// Language-specific starter templates
const LC_STARTERS: Record<SupportedLanguage, string> = {
  python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []

# Driver Code
sol = Solution()
print(sol.twoSum([2, 7, 11, 15], 9))  # [0, 1]
print(sol.twoSum([3, 2, 4], 6))       # [1, 2]
`,
  java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[]{};
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(Arrays.toString(sol.twoSum(new int[]{2, 7, 11, 15}, 9)));
    }
}
`,
  cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
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
    auto result = sol.twoSum(nums, 9);
    cout << "[" << result[0] << ", " << result[1] << "]" << endl;
    return 0;
}
`,
  go: `package main

import "fmt"

func twoSum(nums []int, target int) []int {
    seen := map[int]int{}
    for i, num := range nums {
        complement := target - num
        if j, ok := seen[complement]; ok {
            return []int{j, i}
        }
        seen[num] = i
    }
    return []int{}
}

func main() {
    fmt.Println(twoSum([]int{2, 7, 11, 15}, 9))
}
`,
  rust: `use std::collections::HashMap;

impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        let mut seen: HashMap<i32, i32> = HashMap::new();
        for (i, &num) in nums.iter().enumerate() {
            let complement = target - num;
            if let Some(&j) = seen.get(&complement) {
                return vec![j, i as i32];
            }
            seen.insert(num, i as i32);
        }
        vec![]
    }
}

fn main() {
    let result = Solution::two_sum(vec![2, 7, 11, 15], 9);
    println!("{:?}", result);
}

struct Solution;
`,
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
};

// Test Cases
console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]
console.log(twoSum([3, 2, 4], 6));       // [1, 2]
`,
  sql: `-- Two Sum equivalent: Find pairs with matching sum
SELECT
    a.id AS idx1,
    b.id AS idx2,
    a.val + b.val AS total
FROM numbers a
JOIN numbers b ON a.id < b.id
WHERE a.val + b.val = 9
ORDER BY a.id;
`
};

const MONACO_LANG_MAP: Record<SupportedLanguage, string> = {
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  go: 'go',
  rust: 'rust',
  javascript: 'javascript',
  sql: 'sql'
};

export const LeetCodeWorkspaceModal: React.FC<LeetCodeWorkspaceModalProps> = ({
  question,
  problemTitle,
  initialLanguage = 'python',
  initialCode,
  onClose,
  onCodeExecuted
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [code, setCode] = useState<string>(initialCode || question?.starter_code || LC_STARTERS[initialLanguage]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [aiReview, setAiReview] = useState<CodeTAReview | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [leftTab, setLeftTab] = useState<'description' | 'hints' | 'solution'>('description');
  const [bottomTab, setBottomTab] = useState<'terminal' | 'ai_ta' | 'testcases'>('terminal');

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setCode(LC_STARTERS[newLang]);
    setExecutionResult(null);
    setAiReview(null);
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Ctrl+Enter → Run Code
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => handleRunCode()
    });

    // Ctrl+Shift+Enter → Submit
    editor.addAction({
      id: 'submit-code',
      label: 'Submit',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter],
      run: () => handleRunCode()
    });

    // Focus the editor
    editor.focus();
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setExecutionResult(null);

    const startTime = performance.now();
    const result = await executeCode(code, language);
    const endTime = performance.now();

    setIsExecuting(false);
    setExecutionResult(result);
    setBottomTab('terminal');

    if (result.status === 'SUCCESS') {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    }

    if (onCodeExecuted) {
      const timeSeconds = Math.max(15, Math.round((endTime - startTime) / 1000));
      onCodeExecuted(timeSeconds, result.status === 'SUCCESS');
    }
  };

  const handleRequestAITA = async () => {
    if (!executionResult) {
      await handleRunCode();
    }
    setIsAnalyzingAI(true);
    setBottomTab('ai_ta');

    const review = await requestMistralCodeReview(
      code,
      language,
      executionResult?.stdout || '',
      executionResult?.stderr || '',
      problemTitle
    );

    setAiReview(review);
    setIsAnalyzingAI(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans text-slate-100 overflow-hidden animate-fade-in">
      
      {/* Top Header Bar — LeetCode-style */}
      <header className="h-12 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-700/50 text-xs font-bold text-amber-300 flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>LeetCode Arena</span>
          </div>
          <span className="text-slate-700">|</span>
          <h2 className="text-sm font-bold text-slate-100 truncate max-w-md">{problemTitle}</h2>
          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded flex-shrink-0 ${
            question?.difficulty === 'Easy' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
            question?.difficulty === 'Hard' ? 'bg-red-950 text-red-300 border border-red-800' :
            'bg-amber-950 text-amber-300 border border-amber-800'
          }`}>
            {question?.difficulty || 'Medium'}
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={handleRequestAITA}
            disabled={isAnalyzingAI}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-300 text-xs font-bold transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isAnalyzingAI ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isAnalyzingAI ? 'Analyzing...' : 'AI Review'}</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 transition-all"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-pulse' : ''}`} />
            <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition-all ml-1"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Main Split Body (40% Left / 60% Right) */}
      <div className="flex-1 flex overflow-hidden bg-slate-950">
        
        {/* LEFT PANEL — Problem Description */}
        <div className="w-[40%] border-r border-slate-800 flex flex-col bg-slate-900/60 overflow-hidden">
          {/* Left Panel Tabs */}
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex space-x-4 text-xs font-bold flex-shrink-0">
            <button
              onClick={() => setLeftTab('description')}
              className={`flex items-center space-x-1.5 pb-1 ${
                leftTab === 'description' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setLeftTab('hints')}
              className={`flex items-center space-x-1.5 pb-1 ${
                leftTab === 'hints' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Hints</span>
            </button>

            <button
              onClick={() => setLeftTab('solution')}
              className={`flex items-center space-x-1.5 pb-1 ${
                leftTab === 'solution' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Solution</span>
            </button>
          </div>

          {/* Left Body Content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {leftTab === 'description' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-100 mb-2">{question?.question || problemTitle}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Given weights and values of N items, put these items in a knapsack of capacity W to get the maximum total value in the knapsack.
                    You cannot break an item, either pick the complete item or don't pick it (0-1 property).
                  </p>
                </div>

                {/* Constraints */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <span className="text-indigo-400 font-bold block mb-1.5">Constraints:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>1 &lt;= N &lt;= 1000</li>
                    <li>1 &lt;= W &lt;= 10000</li>
                    <li>Time Limit: 2.0s</li>
                    <li>Expected: O(N × W) time, O(W) space</li>
                  </ul>
                </div>

                {/* Example */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
                  <span className="text-emerald-400 font-bold block">Example 1:</span>
                  <div className="bg-slate-900 rounded-lg p-2.5 space-y-1">
                    <p className="text-slate-400"><strong className="text-slate-200">Input:</strong> weights = [1, 3, 4, 5], values = [10, 40, 50, 70], W = 8</p>
                    <p className="text-emerald-300"><strong className="text-slate-200">Output:</strong> 120</p>
                    <p className="text-slate-500"><strong className="text-slate-400">Explanation:</strong> Pick items 3+5 → 40+70 = 110, or items 4+3+1 = 100. Optimal: items weighing 3 & 5 → 110. Actually items 1,3,5 → 10+40+70=120.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
                  <span className="text-emerald-400 font-bold block">Example 2:</span>
                  <div className="bg-slate-900 rounded-lg p-2.5 space-y-1">
                    <p className="text-slate-400"><strong className="text-slate-200">Input:</strong> weights = [2, 3, 4], values = [4, 5, 6], W = 5</p>
                    <p className="text-emerald-300"><strong className="text-slate-200">Output:</strong> 9</p>
                  </div>
                </div>
              </div>
            )}

            {leftTab === 'hints' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200">
                  <strong className="text-amber-300">Hint 1:</strong> Define state: <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">dp[i][w]</code> = max value using first <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">i</code> items with capacity <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">w</code>.
                </div>
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200">
                  <strong className="text-amber-300">Hint 2:</strong> To optimize space from O(N × W) → O(W), iterate <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">w</code> backwards from <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">W</code> down to <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">weights[i]</code>.
                </div>
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200">
                  <strong className="text-amber-300">Hint 3:</strong> The recurrence: <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">dp[w] = max(dp[w], dp[w - wt[i]] + val[i])</code>
                </div>
              </div>
            )}

            {leftTab === 'solution' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/60 text-xs font-mono">
                <span className="text-emerald-400 font-bold block mb-2">Optimal Solution (Python):</span>
                <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">{question?.solution_code || `def knapsack(weights, values, W):
    dp = [0] * (W + 1)
    for i in range(len(weights)):
        for w in range(W, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    return dp[W]

# Time: O(N * W) | Space: O(W)`}</pre>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL — Editor + Terminal */}
        <div className="w-[60%] flex flex-col h-full bg-slate-950">
          
          {/* Editor Header — Language Selector + Shortcuts */}
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                className="bg-slate-950 text-slate-200 text-xs font-mono px-2.5 py-1 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="python">Python 3.10</option>
                <option value="java">Java 17</option>
                <option value="cpp">C++ 20</option>
                <option value="javascript">JavaScript ES2022</option>
                <option value="go">Go 1.21</option>
                <option value="rust">Rust 1.75</option>
                <option value="sql">PostgreSQL SQL</option>
              </select>

              <button
                onClick={() => { setCode(LC_STARTERS[language]); setExecutionResult(null); }}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] transition-all"
                title="Reset to default template"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-500 font-mono hidden md:block">
              Ctrl+Enter: Run · Ctrl+/: Comment · Ctrl+Shift+F: Format
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative min-h-0">
            <Editor
              height="100%"
              language={MONACO_LANG_MAP[language]}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Consolas', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                tabSize: 4,
                insertSpaces: true,
                autoIndent: 'full',
                formatOnPaste: true,
                formatOnType: true,
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                bracketPairColorization: { enabled: true },
                matchBrackets: 'always',
                suggestOnTriggerCharacters: true,
                quickSuggestions: { other: true, comments: false, strings: true },
                acceptSuggestionOnEnter: 'smart',
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                renderWhitespace: 'selection',
                guides: {
                  indentation: true,
                  bracketPairs: true,
                },
                folding: true,
                foldingStrategy: 'indentation',
                showFoldingControls: 'always',
              }}
            />
          </div>

          {/* Bottom Panel — Terminal / AI / Test Cases */}
          <div className="h-48 bg-slate-950 border-t border-slate-800 flex flex-col flex-shrink-0">
            <div className="px-4 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex space-x-4">
                <button
                  onClick={() => setBottomTab('terminal')}
                  className={`flex items-center space-x-1.5 font-mono ${
                    bottomTab === 'terminal' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Output</span>
                </button>

                <button
                  onClick={() => setBottomTab('testcases')}
                  className={`flex items-center space-x-1.5 font-mono ${
                    bottomTab === 'testcases' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Test Cases</span>
                </button>

                <button
                  onClick={() => setBottomTab('ai_ta')}
                  className={`flex items-center space-x-1.5 font-mono ${
                    bottomTab === 'ai_ta' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Review</span>
                </button>
              </div>

              {executionResult && (
                <div className="flex items-center space-x-3 font-mono text-[11px]">
                  <span className={`flex items-center gap-1 font-bold ${executionResult.status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {executionResult.status === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {executionResult.status === 'SUCCESS' ? 'Accepted' : 'Error'}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" /> {executionResult.execution_time_ms} ms
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-emerald-400" /> {executionResult.memory_used_kb} KB
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs">
              {bottomTab === 'terminal' ? (
                executionResult ? (
                  <div>
                    <pre className="text-slate-300 whitespace-pre-wrap">{executionResult.stdout}</pre>
                    {executionResult.stderr && (
                      <pre className="text-red-400 whitespace-pre-wrap mt-2 p-2 bg-red-950/30 rounded-lg border border-red-900/50">{executionResult.stderr}</pre>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500 italic flex flex-col items-center justify-center h-full gap-1">
                    <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">Enter</kbd> to run your code</span>
                    <span className="text-slate-600 text-[10px]">Or click the green "Run Code" button</span>
                  </div>
                )
              ) : bottomTab === 'testcases' ? (
                <div className="space-y-3">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-sky-400 font-bold text-[11px] block mb-1">Test Case 1:</span>
                    <p className="text-slate-400 text-[11px]"><strong className="text-slate-300">Input:</strong> weights = [1, 3, 4, 5], values = [10, 40, 50, 70], W = 8</p>
                    <p className="text-emerald-400 text-[11px]"><strong className="text-slate-300">Expected:</strong> 120</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-sky-400 font-bold text-[11px] block mb-1">Test Case 2:</span>
                    <p className="text-slate-400 text-[11px]"><strong className="text-slate-300">Input:</strong> weights = [2, 3, 4], values = [4, 5, 6], W = 5</p>
                    <p className="text-emerald-400 text-[11px]"><strong className="text-slate-300">Expected:</strong> 9</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-sky-400 font-bold text-[11px] block mb-1">Test Case 3 (Edge):</span>
                    <p className="text-slate-400 text-[11px]"><strong className="text-slate-300">Input:</strong> weights = [10], values = [5], W = 3</p>
                    <p className="text-emerald-400 text-[11px]"><strong className="text-slate-300">Expected:</strong> 0</p>
                  </div>
                </div>
              ) : (
                aiReview ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-bold">
                        Time: {aiReview.time_complexity}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold">
                        Space: {aiReview.space_complexity}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{aiReview.review_summary}</p>
                  </div>
                ) : (
                  <div className="text-slate-500 italic flex items-center justify-center h-full">
                    Click "AI Review" for Mistral complexity analysis.
                  </div>
                )
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
