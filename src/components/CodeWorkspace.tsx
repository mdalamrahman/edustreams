import React, { useState, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { 
  Play, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  Maximize2, 
  Code,
  RotateCcw
} from 'lucide-react';
import { executeCode, SupportedLanguage } from '../lib/compiler';
import { requestMistralCodeReview, CodeTAReview } from '../lib/mistral';
import { CodeExecutionResult, QuizQuestion } from '../lib/types';
import { LeetCodeWorkspaceModal } from './LeetCodeWorkspaceModal';

interface CodeWorkspaceProps {
  question?: QuizQuestion;
  onCodeExecuted?: (timeTakenSeconds: number, isCorrect: boolean) => void;
}

// Language-specific starter templates
const LANGUAGE_STARTERS: Record<SupportedLanguage, string> = {
  python: `# EduStream — Python 3.10 Sandbox
# Solve the problem below and click "Run Code"

def two_sum(nums, target):
    """Find two indices that add up to target. O(N) using hashmap."""
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test Cases
print("Test 1:", two_sum([2, 7, 11, 15], 9))   # [0, 1]
print("Test 2:", two_sum([3, 2, 4], 6))         # [1, 2]
print("Test 3:", two_sum([3, 3], 6))             # [0, 1]
`,
  java: `// EduStream — Java 17 Sandbox
import java.util.*;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
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
        System.out.println("Test 1: " + Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9)));
        System.out.println("Test 2: " + Arrays.toString(twoSum(new int[]{3, 2, 4}, 6)));
    }
}
`,
  cpp: `// EduStream — C++ 20 Sandbox
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

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

int main() {
    vector<int> nums = {2, 7, 11, 15};
    auto result = twoSum(nums, 9);
    cout << "Two Sum: [" << result[0] << ", " << result[1] << "]" << endl;
    return 0;
}
`,
  go: `// EduStream — Go 1.21 Sandbox
package main

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
    result := twoSum([]int{2, 7, 11, 15}, 9)
    fmt.Println("Two Sum:", result) // [0, 1]
}
`,
  rust: `// EduStream — Rust 1.75 Sandbox
use std::collections::HashMap;

fn two_sum(nums: &[i32], target: i32) -> Vec<usize> {
    let mut seen: HashMap<i32, usize> = HashMap::new();
    for (i, &num) in nums.iter().enumerate() {
        let complement = target - num;
        if let Some(&j) = seen.get(&complement) {
            return vec![j, i];
        }
        seen.insert(num, i);
    }
    vec![]
}

fn main() {
    let result = two_sum(&[2, 7, 11, 15], 9);
    println!("Two Sum: {:?}", result); // [0, 1]
}
`,
  javascript: `// EduStream — JavaScript ES2022 Sandbox

function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}

// Test Cases
console.log("Test 1:", twoSum([2, 7, 11, 15], 9));  // [0, 1]
console.log("Test 2:", twoSum([3, 2, 4], 6));        // [1, 2]
console.log("Test 3:", twoSum([3, 3], 6));            // [0, 1]
`,
  sql: `-- EduStream — PostgreSQL SQL Sandbox
-- Window Functions & CTE Example

WITH ranked_students AS (
    SELECT
        student_name,
        subject,
        score,
        RANK() OVER (PARTITION BY subject ORDER BY score DESC) AS rank,
        AVG(score) OVER (PARTITION BY subject) AS avg_score
    FROM exam_results
)
SELECT
    student_name,
    subject,
    score,
    rank,
    ROUND(avg_score, 2) AS avg_score
FROM ranked_students
WHERE rank <= 3
ORDER BY subject, rank;
`
};

// Map language keys to Monaco language IDs
const MONACO_LANG_MAP: Record<SupportedLanguage, string> = {
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  go: 'go',
  rust: 'rust',
  javascript: 'javascript',
  sql: 'sql'
};

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ question, onCodeExecuted }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState<string>(question?.starter_code || LANGUAGE_STARTERS.python);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [aiReview, setAiReview] = useState<CodeTAReview | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'terminal' | 'ai_ta'>('terminal');
  const [isLeetCodeFullscreen, setIsLeetCodeFullscreen] = useState(false);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    // Only replace code if user hasn't modified it or if switching to a new language
    setCode(LANGUAGE_STARTERS[newLang]);
    setExecutionResult(null);
    setAiReview(null);
  };

  const handleResetCode = () => {
    setCode(question?.starter_code || LANGUAGE_STARTERS[language]);
    setExecutionResult(null);
    setAiReview(null);
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    // LeetCode-style keyboard shortcuts
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => handleRunCode()
    });

    editor.addAction({
      id: 'format-document',
      label: 'Format Document',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
      run: () => {
        editor.getAction('editor.action.formatDocument')?.run();
      }
    });
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setExecutionResult(null);

    const startTime = performance.now();
    const result = await executeCode(code, language);
    const endTime = performance.now();

    setIsExecuting(false);
    setExecutionResult(result);
    setActiveBottomTab('terminal');

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
    setActiveBottomTab('ai_ta');

    const review = await requestMistralCodeReview(
      code,
      language,
      executionResult?.stdout || '',
      executionResult?.stderr || '',
      question?.question || 'Algorithm Challenge'
    );

    setAiReview(review);
    setIsAnalyzingAI(false);
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      
      {/* Top Toolbar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-slate-300">Monaco Editor</span>
          </div>

          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
            className="bg-slate-950 text-slate-200 text-xs font-mono px-2 py-1 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
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
            onClick={handleResetCode}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-all"
            title="Reset to language template"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Fullscreen LeetCode Button */}
          <button
            onClick={() => setIsLeetCodeFullscreen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-300 text-xs font-bold transition-all shadow-sm"
            title="Expand to Fullscreen LeetCode Split-Screen Workspace"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LeetCode Fullscreen</span>
          </button>

          <button
            onClick={handleRequestAITA}
            disabled={isAnalyzingAI}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-700/80 text-purple-300 text-xs font-bold transition-all shadow-sm"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isAnalyzingAI ? 'animate-spin' : ''}`} />
            <span>{isAnalyzingAI ? 'Analyzing...' : 'AI TA'}</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 transition-all"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-pulse' : ''}`} />
            <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Shortcut hint bar */}
      <div className="px-4 py-1 bg-slate-950 border-b border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>Ctrl+Enter: Run Code · Ctrl+Shift+F: Format · Ctrl+/: Toggle Comment</span>
        <span className="text-indigo-500">{MONACO_LANG_MAP[language].toUpperCase()}</span>
      </div>

      {/* Main Monaco Code Editor Area */}
      <div className="flex-1 relative min-h-[280px]">
        <Editor
          height="100%"
          language={MONACO_LANG_MAP[language]}
          value={code}
          onChange={(val) => setCode(val || '')}
          theme="vs-dark"
          onMount={handleEditorMount}
          options={{
            fontSize: 13,
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
            }
          }}
        />
      </div>

      {/* Bottom Output Panel */}
      <div className="h-44 bg-slate-950 border-t border-slate-800 flex flex-col">
        <div className="px-4 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveBottomTab('terminal')}
              className={`flex items-center space-x-1.5 font-mono ${
                activeBottomTab === 'terminal' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Terminal Output</span>
            </button>

            <button
              onClick={() => setActiveBottomTab('ai_ta')}
              className={`flex items-center space-x-1.5 font-mono ${
                activeBottomTab === 'ai_ta' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mistral AI Review</span>
            </button>
          </div>

          {executionResult && (
            <div className="flex items-center space-x-3 font-mono text-[11px]">
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
          {activeBottomTab === 'terminal' ? (
            executionResult ? (
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  {executionResult.status === 'SUCCESS' ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> SUCCESS (Exit Code 0)
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1 font-bold">
                      <XCircle className="w-4 h-4" /> EXCEPTION
                    </span>
                  )}
                </div>
                <pre className="text-slate-300 whitespace-pre-wrap">{executionResult.stdout}</pre>
                {executionResult.stderr && (
                  <pre className="text-red-400 whitespace-pre-wrap mt-1">{executionResult.stderr}</pre>
                )}
              </div>
            ) : (
              <div className="text-slate-500 italic flex items-center justify-center h-full">
                Press Ctrl+Enter or click "Run Code" to execute via OnlineCompiler.io
              </div>
            )
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
                <p className="text-slate-300">{aiReview.review_summary}</p>
              </div>
            ) : (
              <div className="text-slate-500 italic flex items-center justify-center h-full">
                Click "AI TA" for Mistral algorithmic complexity review.
              </div>
            )
          )}
        </div>
      </div>

      {/* LeetCode Fullscreen Workspace Modal */}
      {isLeetCodeFullscreen && (
        <LeetCodeWorkspaceModal
          question={question}
          problemTitle={question?.question || 'Algorithm Practice Challenge'}
          initialLanguage={language}
          initialCode={code}
          onClose={() => setIsLeetCodeFullscreen(false)}
          onCodeExecuted={onCodeExecuted}
        />
      )}

    </div>
  );
};
