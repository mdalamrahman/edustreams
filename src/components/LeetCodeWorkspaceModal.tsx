import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Copy,
  Check,
  CheckCircle,
  FileCode,
  Tag,
  AlertCircle,
  Video as VideoIcon,
  Send,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Layers,
  Building2,
  ListOrdered
} from 'lucide-react';
import { executeCode, SupportedLanguage } from '../lib/compiler';
import { requestMistralCodeReview, CodeTAReview } from '../lib/mistral';
import { CodeExecutionResult, QuizQuestion, Video } from '../lib/types';
import confetti from 'canvas-confetti';

interface LeetCodeWorkspaceModalProps {
  question?: QuizQuestion;
  problemTitle: string;
  initialLanguage?: SupportedLanguage;
  initialCode?: string;
  codingProblem?: any;
  matchingVideo?: Video;
  onClose: () => void;
  onCodeExecuted?: (timeTakenSeconds: number, isCorrect: boolean) => void;
}

const LC_STARTERS: Record<SupportedLanguage, string> = {
  python: `# SDETube LeetCode Arena
class Solution:
    def solve(self, nums: list[int] = None) -> any:
        """
        Implement optimal solution below.
        Time Complexity: O(N)
        Space Complexity: O(1)
        """
        pass

# Test execution
if __name__ == "__main__":
    sol = Solution()
    result = sol.solve([2, 7, 11, 15])
    print("Execution Output:", result)
`,
  cpp: `// SDETube LeetCode Arena
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
using namespace std;

class Solution {
public:
    void solve() {
        // Implement optimal solution below
        cout << "Optimal solution executed successfully." << endl;
    }
};

int main() {
    Solution sol;
    sol.solve();
    return 0;
}
`,
  java: `import java.util.*;

public class Solution {
    public void solve() {
        // Implement optimal solution below
        System.out.println("Optimal solution executed successfully.");
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        sol.solve();
    }
}
`,
  javascript: `/**
 * SDETube LeetCode Arena
 */
class Solution {
    solve(nums = []) {
        // Implement optimal solution below
        console.log("Optimal solution executed successfully.");
    }
}

const sol = new Solution();
sol.solve();
`,
  go: `package main

import "fmt"

type Solution struct{}

func (s *Solution) Solve() {
    // Implement optimal solution below
    fmt.Println("Optimal solution executed successfully.")
}

func main() {
    sol := Solution{}
    sol.Solve()
}
`,
  rust: `struct Solution;

impl Solution {
    pub fn solve() {
        println!("Optimal solution executed successfully.");
    }
}

fn main() {
    Solution::solve();
}
`,
  sql: `-- SDETube SQL Workspace
SELECT 1 AS result;
`
};

export const LeetCodeWorkspaceModal: React.FC<LeetCodeWorkspaceModalProps> = ({
  question,
  problemTitle,
  initialLanguage = 'python',
  initialCode,
  codingProblem,
  matchingVideo,
  onClose,
  onCodeExecuted
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [code, setCode] = useState<string>(() => {
    if (initialCode) return initialCode;
    if (codingProblem?.starter_code_python && language === 'python') return codingProblem.starter_code_python;
    if (codingProblem?.starter_code_cpp && language === 'cpp') return codingProblem.starter_code_cpp;
    if (question?.starter_code) return question.starter_code;
    return LC_STARTERS[language] || LC_STARTERS.python;
  });

  const [leftTab, setLeftTab] = useState<'description' | 'hints' | 'editorial' | 'video' | 'solutions' | 'submissions'>('description');
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState<number>(0);
  const [customTestCaseInput, setCustomTestCaseInput] = useState<string>('nums = [2, 7, 11, 15], target = 9');

  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [expandedHint, setExpandedHint] = useState<number | null>(0);

  const [isReviewing, setIsReviewing] = useState(false);
  const [aiReview, setAiReview] = useState<CodeTAReview | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const editorRef = useRef<any>(null);

  const cleanTitle = (problemTitle || codingProblem?.title || 'Problem Workspace').replace(/\.(mp4|mkv)$/i, '').replace(/_/g, ' ');
  const difficulty = codingProblem?.difficulty || 'Medium';
  const companies = codingProblem?.companies || ['Amazon', 'Microsoft', 'Google', 'Meta'];
  const problemStatement = codingProblem?.problem_statement || question?.question || `### Problem Statement\nGiven an input array/matrix, implement the optimal algorithm for **${cleanTitle}**.\n\n#### Constraints\n- Time Complexity: Optimal O(N) or O(N log N)\n- Space Complexity: O(1) auxiliary space`;

  // Pre-configured hints
  const hints = useMemo(() => {
    return [
      `Consider edge cases such as empty input arrays, single elements, or all negative numbers.`,
      `Think about whether a two-pointer, hashing, or binary search technique can reduce the time complexity from O(N²) to O(N).`,
      `Analyze in-place space optimization by reusing input memory instead of allocating additional buffers.`
    ];
  }, []);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (newLang === 'python' && codingProblem?.starter_code_python) {
      setCode(codingProblem.starter_code_python);
    } else if (newLang === 'cpp' && codingProblem?.starter_code_cpp) {
      setCode(codingProblem.starter_code_cpp);
    } else {
      setCode(LC_STARTERS[newLang] || LC_STARTERS.python);
    }
  };

  const handleRunCode = async (isSubmit = false) => {
    if (isExecuting) return;
    setIsExecuting(true);
    setConsoleTab('result');

    try {
      const res = await executeCode(code, language);
      setExecutionResult(res);

      const isAccepted = res.status === 'SUCCESS' && !res.stderr;
      const timeSpentSecs = Math.round((Date.now() - startTime) / 1000);

      const subEntry = {
        id: Date.now(),
        status: isAccepted ? 'Accepted' : 'Runtime Error',
        runtime_ms: res.execution_time_ms || 24,
        memory_mb: res.memory_used_kb ? (res.memory_used_kb / 1024).toFixed(1) : '17.4',
        language: language.toUpperCase(),
        timestamp: new Date().toLocaleTimeString()
      };

      setSubmissionsList(prev => [subEntry, ...prev]);

      if (isAccepted) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      }

      if (onCodeExecuted) {
        onCodeExecuted(timeSpentSecs, isAccepted);
      }
    } catch (e: any) {
      setExecutionResult({
        status: 'ERROR',
        stdout: '',
        stderr: e.message || 'Execution error',
        exit_code: 1,
        execution_time_ms: 0,
        memory_used_kb: 0
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleAIReview = async () => {
    if (isReviewing || !code.trim()) return;
    setIsReviewing(true);
    try {
      const review = await requestMistralCodeReview(
        code,
        language,
        executionResult?.stdout || '',
        executionResult?.stderr || '',
        cleanTitle
      );
      setAiReview(review);
    } catch (err) {
      console.warn('[AI Code Review Notice]:', err);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetCode = () => {
    setCode(LC_STARTERS[language] || LC_STARTERS.python);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans text-slate-100 animate-fadeIn select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP LEETCODE-STYLE NAVBAR                                              */}
      {/* ========================================================================= */}
      <header className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
        
        {/* Left: Problem Title & Difficulty */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
            <Code className="w-5 h-5" />
            <span className="text-white font-extrabold text-sm sm:text-base tracking-tight truncate max-w-xs sm:max-w-md">
              {cleanTitle}
            </span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
            difficulty === 'Easy'
              ? 'bg-emerald-950/90 text-emerald-400 border-emerald-700/60'
              : difficulty === 'Hard'
              ? 'bg-rose-950/90 text-rose-400 border-rose-700/60'
              : 'bg-amber-950/90 text-amber-400 border-amber-700/60'
          }`}>
            {difficulty}
          </span>
        </div>

        {/* Center: Run & Submit Action Buttons */}
        <div className="flex items-center space-x-2">
          
          {/* Run Code Button */}
          <button
            onClick={() => handleRunCode(false)}
            disabled={isExecuting}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            title="Run Code (Ctrl + Enter)"
          >
            <Play className="w-3.5 h-3.5 text-indigo-400 fill-current" />
            <span>{isExecuting ? 'Running...' : 'Run'}</span>
          </button>

          {/* Submit Solution Button */}
          <button
            onClick={() => handleRunCode(true)}
            disabled={isExecuting}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition-all active:scale-95 disabled:opacity-50 border border-emerald-400/40"
            title="Submit Solution"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Submit</span>
          </button>

          {/* AI Complexity Review */}
          <button
            onClick={handleAIReview}
            disabled={isReviewing}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-700/60 text-xs font-bold transition-all"
            title="AI Code Complexity & Optimization Review"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>{isReviewing ? 'Analyzing...' : 'AI Review'}</span>
          </button>

        </div>

        {/* Right: Language Picker & Close */}
        <div className="flex items-center space-x-3">
          
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="python">Python 3</option>
            <option value="cpp">C++ 20</option>
            <option value="java">Java 17</option>
            <option value="javascript">JavaScript (Node)</option>
            <option value="go">Go 1.21</option>
            <option value="rust">Rust 1.75</option>
          </select>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title="Exit Fullscreen Workspace"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. SPLIT SCREEN WORKSPACE                                                 */}
      {/* ========================================================================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT PANEL: DESCRIPTION, HINTS, EDITORIAL, VIDEO SOLUTION               */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-5 bg-slate-900/90 border-r border-slate-800 flex flex-col overflow-hidden">
          
          {/* Left Panel Tabs */}
          <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar text-xs font-bold">
            <button
              onClick={() => setLeftTab('description')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                leftTab === 'description'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setLeftTab('hints')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                leftTab === 'hints'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Hints</span>
            </button>

            <button
              onClick={() => setLeftTab('editorial')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                leftTab === 'editorial'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Editorial</span>
            </button>

            {/* In-Workspace Matching Video Lecture Tab */}
            <button
              onClick={() => setLeftTab('video')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                leftTab === 'video'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-purple-100 hover:bg-purple-950/40'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5" />
              <span>Video Lecture</span>
            </button>

            <button
              onClick={() => setLeftTab('solutions')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                leftTab === 'solutions'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              <span>Solutions</span>
            </button>

            <button
              onClick={() => setLeftTab('submissions')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                leftTab === 'submissions'
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Submissions ({submissionsList.length})</span>
            </button>
          </div>

          {/* Left Panel Content Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed font-sans">
            
            {/* TAB 1: DESCRIPTION */}
            {leftTab === 'description' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-black text-slate-100">{cleanTitle}</h2>
                  
                  {/* Company Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                      <Building2 className="w-3 h-3 text-slate-500" /> Companies:
                    </span>
                    {companies.map((comp: string) => (
                      <span key={comp} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[10px]">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 whitespace-pre-line text-slate-200 leading-relaxed font-sans">
                  {problemStatement}
                </div>

                {/* Example 1 & Example 2 */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Example Test Cases</h4>
                  
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                    <div className="text-indigo-300 font-bold">Example 1:</div>
                    <div className="text-slate-300"><strong>Input:</strong> nums = [2, 7, 11, 15], target = 9</div>
                    <div className="text-slate-300"><strong>Output:</strong> [0, 1]</div>
                    <div className="text-slate-400 text-[10px]"><strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                    <div className="text-indigo-300 font-bold">Example 2:</div>
                    <div className="text-slate-300"><strong>Input:</strong> nums = [3, 2, 4], target = 6</div>
                    <div className="text-slate-300"><strong>Output:</strong> [1, 2]</div>
                  </div>
                </div>

                {/* Constraints */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-400">
                  <h4 className="font-bold text-slate-300 font-sans text-xs uppercase tracking-wider">Constraints:</h4>
                  <div>• <code>1 &lt;= nums.length &lt;= 10^5</code></div>
                  <div>• <code>-10^9 &lt;= nums[i] &lt;= 10^9</code></div>
                  <div>• Only one valid answer exists.</div>
                </div>
              </div>
            )}

            {/* TAB 2: HINTS ACCORDION */}
            {leftTab === 'hints' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-100">Step-by-Step Problem Hints</h3>
                {hints.map((hint, idx) => (
                  <div key={idx} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                    <button
                      onClick={() => setExpandedHint(expandedHint === idx ? null : idx)}
                      className="w-full p-3 text-left font-bold text-xs flex items-center justify-between text-indigo-300 hover:bg-slate-900 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>Hint {idx + 1}</span>
                      </span>
                      {expandedHint === idx ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {expandedHint === idx && (
                      <div className="p-3.5 pt-0 text-slate-300 text-xs border-t border-slate-900 leading-relaxed font-sans">
                        {hint}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: EDITORIAL & SDE NOTES */}
            {leftTab === 'editorial' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-purple-900/40 space-y-3">
                  <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>SDETube Algomaster Editorial & Intuition</span>
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    <strong>Optimal Approach:</strong> Use hash mapping or two-pointer invariants to achieve single-pass linear time complexity.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1">
                    <div className="text-emerald-400 font-bold">Complexity Summary:</div>
                    <div>• Time Complexity: <strong>O(N)</strong></div>
                    <div>• Space Complexity: <strong>O(N)</strong> for hash table (or O(1) for two pointers)</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: IN-WORKSPACE VIDEO SOLUTION */}
            {leftTab === 'video' && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-slate-950 border border-purple-800/60">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <VideoIcon className="w-3.5 h-3.5" />
                      <span>Matching Lecture Video</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {matchingVideo?.title || cleanTitle}
                    </span>
                  </div>

                  {matchingVideo?.stream_url ? (
                    <video
                      src={matchingVideo.stream_url}
                      controls
                      className="w-full rounded-xl aspect-video bg-black shadow-lg"
                      playsInline
                    />
                  ) : (
                    <div className="aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center text-center p-4">
                      <VideoIcon className="w-8 h-8 text-purple-400 mb-2 animate-pulse" />
                      <p className="text-xs font-bold text-slate-200">Video Solution for {cleanTitle}</p>
                      <p className="text-[11px] text-slate-400 mt-1">Available in SDETube Video Catalog</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: OPTIMAL SOLUTIONS */}
            {leftTab === 'solutions' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-indigo-400 font-bold">
                    <span>Python 3 Optimal Solution</span>
                    <span className="text-[10px] text-slate-500">O(N) Time • O(N) Space</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 overflow-x-auto leading-relaxed">
{`class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, val in enumerate(nums):
            diff = target - val
            if diff in seen:
                return [seen[diff], i]
            seen[val] = i
        return []`}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 6: SUBMISSIONS HISTORY */}
            {leftTab === 'submissions' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-100">Past Run Submissions</h3>
                {submissionsList.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 italic">
                    No submissions recorded in this session. Click "Run" or "Submit" to test your code.
                  </div>
                ) : (
                  submissionsList.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        {sub.status === 'Accepted' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span className={`font-bold ${sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {sub.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                        <span>{sub.runtime_ms} ms</span>
                        <span>{sub.memory_mb} MB</span>
                        <span>{sub.language}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT PANEL: MONACO CODE EDITOR + CONSOLE TESTCASES                     */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950 overflow-hidden">
          
          {/* Editor Header Toolbar */}
          <div className="h-10 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-slate-400">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold text-slate-200">Solution.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'js'}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCode}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Copy Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleResetCode}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Reset Code Template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[300px] bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'javascript' ? 'javascript' : language === 'java' ? 'java' : 'python'}
              value={code}
              theme="vs-dark"
              onChange={(val) => setCode(val || '')}
              onMount={handleEditorMount}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                tabSize: 4,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>

          {/* Bottom LeetCode Console Panel */}
          <div className="h-64 bg-slate-900 border-t border-slate-800 flex flex-col overflow-hidden">
            
            {/* Console Header Tabs */}
            <div className="h-10 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setConsoleTab('testcase')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    consoleTab === 'testcase'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Testcase</span>
                </button>

                <button
                  onClick={() => setConsoleTab('result')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    consoleTab === 'result'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                  <span>Test Result</span>
                  {executionResult && (
                    <span className={`w-2 h-2 rounded-full ${executionResult.status === 'SUCCESS' && !executionResult.stderr ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  )}
                </button>
              </div>

              {executionResult && (
                <div className="text-[11px] font-mono text-slate-400">
                  Runtime: <span className="text-emerald-400 font-bold">{executionResult.execution_time_ms || 24}ms</span>
                </div>
              )}
            </div>

            {/* Console Body */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-300">
              
              {consoleTab === 'testcase' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestCaseIdx(idx)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          activeTestCaseIdx === idx
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400">Test Input:</label>
                    <textarea
                      value={customTestCaseInput}
                      onChange={(e) => setCustomTestCaseInput(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono resize-none"
                    />
                  </div>
                </div>
              ) : (
                /* Result View */
                <div className="space-y-3">
                  {executionResult ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        {executionResult.status === 'SUCCESS' && !executionResult.stderr ? (
                          <span className="text-base font-extrabold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-5 h-5" /> Accepted
                          </span>
                        ) : (
                          <span className="text-base font-extrabold text-rose-400 flex items-center gap-1.5">
                            <XCircle className="w-5 h-5" /> Runtime Exception
                          </span>
                        )}
                      </div>

                      {executionResult.stdout && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-400">Standard Output:</span>
                          <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs overflow-x-auto whitespace-pre-wrap">
                            {executionResult.stdout}
                          </pre>
                        </div>
                      )}

                      {executionResult.stderr && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-rose-400">Error Traceback:</span>
                          <pre className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs overflow-x-auto whitespace-pre-wrap">
                            {executionResult.stderr}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic py-6 text-center">
                      Click "Run" or "Submit" to execute your solution against test cases.
                    </div>
                  )}

                  {/* AI Complexity Assessment Output */}
                  {aiReview && (
                    <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-800 space-y-2 mt-3 font-sans">
                      <div className="flex items-center justify-between text-purple-300 font-bold text-xs">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>SDETube AI Code Review</span>
                        </span>
                        <span className="text-emerald-400 font-mono text-[11px]">
                          Time: {aiReview.time_complexity} • Space: {aiReview.space_complexity}
                        </span>
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed">{aiReview.review_summary}</p>
                      {aiReview.suggestions?.length > 0 && (
                        <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                          {aiReview.suggestions.map((sug, i) => (
                            <li key={i}>{sug}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
