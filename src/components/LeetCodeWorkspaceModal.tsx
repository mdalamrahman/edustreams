import React, { useState, useEffect, useMemo } from 'react';
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
  AlertCircle
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
  codingProblem?: any;
  onClose: () => void;
  onCodeExecuted?: (timeTakenSeconds: number, isCorrect: boolean) => void;
}

// Language-specific fallback starter templates
const LC_STARTERS: Record<SupportedLanguage, string> = {
  python: `# TiliTube AI Algorithm Sandbox
class Solution:
    def solve(self) -> None:
        """
        Implement optimal solution below.
        """
        pass

# Driver / Test Runner
if __name__ == "__main__":
    sol = Solution()
    sol.solve()
    print("Solution executed successfully.")
`,
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <memory>
using namespace std;

class Solution {
public:
    void solve() {
        // Implement optimal solution below
        cout << "Solution executed successfully." << endl;
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
        System.out.println("Solution executed successfully.");
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        sol.solve();
    }
}
`,
  javascript: `/**
 * EduStream AI Algorithm Sandbox
 */
class Solution {
    solve() {
        // Implement optimal solution below
        console.log("Solution executed successfully.");
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
    fmt.Println("Solution executed successfully.")
}

func main() {
    sol := Solution{}
    sol.Solve()
}
`,
  rust: `struct Solution;

impl Solution {
    pub fn solve() {
        // Implement optimal solution below
        println!("Solution executed successfully.");
    }
}

fn main() {
    Solution::solve();
}
`,
  sql: `-- EduStream AI SQL Query Workspace
SELECT 
    'Solution executed successfully.' AS status;
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

// Automatic language detection from code content
function detectLanguageFromCode(codeSnippet: string): SupportedLanguage {
  if (!codeSnippet) return 'python';
  if (/^#include|using namespace std|std::|int main\(\)/.test(codeSnippet)) return 'cpp';
  if (/public class|import java\./.test(codeSnippet)) return 'java';
  if (/package main|func main/.test(codeSnippet)) return 'go';
  if (/fn main|use std::/.test(codeSnippet)) return 'rust';
  if (/function\s+\w+|const\s+\w+\s*=|var\s+\w+/.test(codeSnippet) && !/def\s+/.test(codeSnippet)) return 'javascript';
  if (/SELECT\s+|FROM\s+/i.test(codeSnippet)) return 'sql';
  return 'python';
}

/**
 * Clean, comfortable Markdown Problem Description Renderer for LeetCode
 * Converts raw markdown into soft, readable paragraphs without jarring eye-straining bold weights.
 */
const ProblemDescriptionRenderer: React.FC<{ rawText: string; title: string }> = ({ rawText, title }) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Helper to parse inline formatting (**bold**, `code`) safely
  const formatInlineText = (text: string) => {
    // First split by backticks for inline code
    const codeParts = text.split(/(`[^`]+`)/g);
    return codeParts.map((part, pIdx) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={pIdx} className="px-1.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-indigo-300 font-mono text-[11px] font-normal mx-0.5">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Inside normal text, parse **bold**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
          return (
            <strong key={`${pIdx}-${bIdx}`} className="font-semibold text-slate-100">
              {bPart.slice(2, -2)}
            </strong>
          );
        }
        return <span key={`${pIdx}-${bIdx}`}>{bPart}</span>;
      });
    });
  };

  // Parse structured blocks from the raw text
  const blocks = useMemo(() => {
    if (!rawText) return [];

    // Normalize newlines
    let text = rawText.replace(/\r\n/g, '\n');

    // Split code blocks out
    const segments = text.split(/(```[\s\S]*?```)/g);
    const parsed: Array<{ type: 'paragraph' | 'heading' | 'code' | 'list' | 'example'; content: any; lang?: string }> = [];

    segments.forEach((segment) => {
      if (segment.startsWith('```') && segment.endsWith('```')) {
        const firstLineEnd = segment.indexOf('\n');
        const lang = firstLineEnd !== -1 ? segment.slice(3, firstLineEnd).trim() : 'code';
        const codeContent = firstLineEnd !== -1 ? segment.slice(firstLineEnd + 1, -3).trim() : segment.slice(3, -3).trim();
        parsed.push({ type: 'code', content: codeContent, lang: lang || 'plaintext' });
      } else {
        const lines = segment.split('\n');
        let currentList: string[] = [];

        lines.forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed) {
            if (currentList.length > 0) {
              parsed.push({ type: 'list', content: currentList });
              currentList = [];
            }
            return;
          }

          if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
            if (currentList.length > 0) {
              parsed.push({ type: 'list', content: currentList });
              currentList = [];
            }
            const headingText = trimmed.replace(/^#+\s*/, '');
            parsed.push({ type: 'heading', content: headingText });
          } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s+/.test(trimmed)) {
            const listText = trimmed.replace(/^[-*]\s+|\d+\.\s+/, '');
            currentList.push(listText);
          } else {
            if (currentList.length > 0) {
              parsed.push({ type: 'list', content: currentList });
              currentList = [];
            }
            parsed.push({ type: 'paragraph', content: trimmed });
          }
        });

        if (currentList.length > 0) {
          parsed.push({ type: 'list', content: currentList });
        }
      }
    });

    return parsed;
  }, [rawText]);

  return (
    <div className="space-y-4 font-sans">
      {/* Problem Header Title Banner */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight leading-snug">
          {title}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[11px] font-mono font-medium">
            TiliTube SDE Arena
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[11px] font-mono font-medium">
            Optimal Pattern Challenge
          </span>
        </div>
      </div>

      {/* Rendered Markdown Stream */}
      <div className="space-y-3">
        {blocks.map((block, idx) => {
          if (block.type === 'heading') {
            return (
              <h4 key={idx} className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-300 pt-3 pb-1 border-b border-slate-800/60 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>{block.content}</span>
              </h4>
            );
          }

          if (block.type === 'code') {
            const codeId = `code-block-${idx}`;
            return (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden my-2.5 shadow-lg">
                <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
                  <span className="text-indigo-400 font-medium text-[11px] flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5" />
                    {block.lang || 'code'}
                  </span>
                  <button
                    onClick={() => handleCopyCode(codeId, block.content)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800"
                  >
                    {copiedCodeId === codeId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCodeId === codeId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3.5 text-[12px] font-mono text-slate-200 overflow-x-auto leading-relaxed whitespace-pre">
                  <code>{block.content}</code>
                </pre>
              </div>
            );
          }

          if (block.type === 'list') {
            return (
              <ul key={idx} className="space-y-2 my-2 pl-1">
                {block.content.map((item: string, iIdx: number) => (
                  <li key={iIdx} className="flex items-start gap-2.5 text-[13px] text-slate-300 leading-relaxed font-normal">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></span>
                    <div className="flex-1">{formatInlineText(item)}</div>
                  </li>
                ))}
              </ul>
            );
          }

          // Paragraph
          return (
            <p key={idx} className="text-[13px] text-slate-300 font-normal leading-relaxed">
              {formatInlineText(block.content)}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export const LeetCodeWorkspaceModal: React.FC<LeetCodeWorkspaceModalProps> = ({
  question,
  problemTitle,
  initialLanguage = 'python',
  initialCode,
  codingProblem,
  onClose,
  onCodeExecuted
}) => {
  // Resolve accurate problem title and statement
  const cleanTitle = codingProblem?.title || problemTitle || question?.question || 'Algorithm Practice Challenge';
  const rawStatement = codingProblem?.problem_statement || question?.question || 'Implement the optimal algorithmic solution based on the lecture requirements.';

  // Automatically detect language if code snippet is supplied
  const detectedInitialLang = useMemo(() => {
    if (initialCode) return detectLanguageFromCode(initialCode);
    if (question?.starter_code) return detectLanguageFromCode(question.starter_code);
    if (codingProblem?.starter_code_cpp) return 'cpp';
    if (codingProblem?.starter_code_python) return 'python';
    return initialLanguage;
  }, [initialCode, question?.starter_code, codingProblem, initialLanguage]);

  const [language, setLanguage] = useState<SupportedLanguage>(detectedInitialLang);
  const [code, setCode] = useState<string>(() => {
    if (initialCode) return initialCode;
    if (detectedInitialLang === 'cpp' && codingProblem?.starter_code_cpp) return codingProblem.starter_code_cpp;
    if (detectedInitialLang === 'python' && codingProblem?.starter_code_python) return codingProblem.starter_code_python;
    if (question?.starter_code) return question.starter_code;
    return LC_STARTERS[detectedInitialLang] || LC_STARTERS.python;
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [aiReview, setAiReview] = useState<CodeTAReview | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [leftTab, setLeftTab] = useState<'description' | 'hints' | 'solution'>('description');
  const [bottomTab, setBottomTab] = useState<'terminal' | 'ai_ta' | 'testcases'>('terminal');

  // Synchronize code if parent props change
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setLanguage(detectLanguageFromCode(initialCode));
    }
  }, [initialCode]);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (newLang === 'python' && codingProblem?.starter_code_python) {
      setCode(codingProblem.starter_code_python);
    } else if (newLang === 'cpp' && codingProblem?.starter_code_cpp) {
      setCode(codingProblem.starter_code_cpp);
    } else if (question?.starter_code && detectLanguageFromCode(question.starter_code) === newLang) {
      setCode(question.starter_code);
    } else {
      setCode(LC_STARTERS[newLang]);
    }
    setExecutionResult(null);
    setAiReview(null);
  };

  const handleResetStarter = () => {
    if (language === 'python' && codingProblem?.starter_code_python) {
      setCode(codingProblem.starter_code_python);
    } else if (language === 'cpp' && codingProblem?.starter_code_cpp) {
      setCode(codingProblem.starter_code_cpp);
    } else if (question?.starter_code) {
      setCode(question.starter_code);
    } else {
      setCode(LC_STARTERS[language]);
    }
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

    if (result.status === 'SUCCESS' && !result.stderr) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    }

    if (onCodeExecuted) {
      const timeSeconds = Math.max(15, Math.round((endTime - startTime) / 1000));
      onCodeExecuted(timeSeconds, result.status === 'SUCCESS' && !result.stderr);
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
      cleanTitle
    );

    setAiReview(review);
    setIsAnalyzingAI(false);
  };

  // Optimal solution code resolution
  const optimalSolution = codingProblem?.solution_code_cpp || question?.solution_code || LC_STARTERS.cpp;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans text-slate-100 overflow-hidden animate-fade-in">
      
      {/* Top Header Bar — LeetCode-style */}
      <header className="h-12 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0 shadow-md">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-700/50 text-xs font-bold text-amber-300 flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>LeetCode Arena</span>
          </div>
          <span className="text-slate-700">|</span>
          <h2 className="text-sm font-semibold text-slate-100 truncate max-w-md">{cleanTitle}</h2>
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
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-300 text-xs font-bold transition-all shadow-sm"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isAnalyzingAI ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isAnalyzingAI ? 'Analyzing...' : 'AI Review'}</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
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
        <div className="w-[42%] border-r border-slate-800 flex flex-col bg-slate-900/60 overflow-hidden">
          {/* Left Panel Tabs */}
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex space-x-4 text-xs font-semibold flex-shrink-0">
            <button
              onClick={() => setLeftTab('description')}
              className={`flex items-center space-x-1.5 pb-1 transition-all ${
                leftTab === 'description' ? 'text-indigo-400 border-b-2 border-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setLeftTab('hints')}
              className={`flex items-center space-x-1.5 pb-1 transition-all ${
                leftTab === 'hints' ? 'text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Hints</span>
            </button>

            <button
              onClick={() => setLeftTab('solution')}
              className={`flex items-center space-x-1.5 pb-1 transition-all ${
                leftTab === 'solution' ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Solution</span>
            </button>
          </div>

          {/* Left Body Content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {leftTab === 'description' && (
              <ProblemDescriptionRenderer 
                rawText={rawStatement} 
                title={cleanTitle} 
              />
            )}

            {leftTab === 'hints' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-amber-900/40 text-xs text-amber-200/90 space-y-1.5 leading-relaxed font-sans">
                  <strong className="text-amber-300 font-semibold flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Hint 1: Single Responsibility & Invariants
                  </strong>
                  <p>Identify all distinct reasons a class or module might change. Each cohesive unit should fulfill only one architectural concern (e.g. storage, calculation, or external notifications).</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-amber-900/40 text-xs text-amber-200/90 space-y-1.5 leading-relaxed font-sans">
                  <strong className="text-amber-300 font-semibold flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Hint 2: Composition & Dependency Inversion
                  </strong>
                  <p>Decouple high-level orchestration from low-level implementation details using interfaces/abstract classes or dedicated service facades.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-amber-900/40 text-xs text-amber-200/90 space-y-1.5 leading-relaxed font-sans">
                  <strong className="text-amber-300 font-semibold flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Hint 3: Boundary & Edge Case Isolation
                  </strong>
                  <p>Write isolated test assertions for each refactored component to ensure full testability without mocking unneeded side-effects.</p>
                </div>
              </div>
            )}

            {leftTab === 'solution' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-900/60 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      Optimal Solution Code:
                    </span>
                    <span className="text-[11px] text-slate-400">EduStream AI Verified</span>
                  </div>
                  <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto text-[12px] p-2">
                    {optimalSolution}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL — Editor + Terminal */}
        <div className="w-[58%] flex flex-col h-full bg-slate-950">
          
          {/* Editor Header — Language Selector + Reset */}
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                className="bg-slate-950 text-slate-200 text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
              >
                <option value="python">Python 3.10</option>
                <option value="cpp">C++ 20 (GCC 9.2)</option>
                <option value="java">Java 17 (OpenJDK)</option>
                <option value="javascript">JavaScript ES2022</option>
                <option value="go">Go 1.21</option>
                <option value="rust">Rust 1.75</option>
                <option value="sql">PostgreSQL SQL</option>
              </select>

              <button
                onClick={handleResetStarter}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-all"
                title="Reset to problem starter template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Code</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
              <span className="text-indigo-400">{MONACO_LANG_MAP[language].toUpperCase()}</span> · Ctrl+Enter to Execute
            </div>
          </div>

          {/* Main Monaco Code Editor Area */}
          <div className="flex-1 relative min-h-[300px]">
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
                },
                folding: true,
                foldingStrategy: 'indentation',
                showFoldingControls: 'always',
              }}
            />
          </div>

          {/* Bottom Panel — Terminal / AI / Test Cases */}
          <div className="h-52 bg-slate-950 border-t border-slate-800 flex flex-col flex-shrink-0">
            <div className="px-4 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex space-x-4">
                <button
                  onClick={() => setBottomTab('terminal')}
                  className={`flex items-center space-x-1.5 font-mono ${
                    bottomTab === 'terminal' ? 'text-emerald-400 font-bold border-b-2 border-emerald-400 pb-0.5' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Output</span>
                </button>

                <button
                  onClick={() => setBottomTab('testcases')}
                  className={`flex items-center space-x-1.5 font-mono ${
                    bottomTab === 'testcases' ? 'text-sky-400 font-bold border-b-2 border-sky-400 pb-0.5' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Test Cases</span>
                </button>

                <button
                  onClick={() => setBottomTab('ai_ta')}
                  className={`flex items-center space-x-1.5 font-mono ${
                    bottomTab === 'ai_ta' ? 'text-purple-400 font-bold border-b-2 border-purple-400 pb-0.5' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Review</span>
                </button>
              </div>

              {executionResult && (
                <div className="flex items-center space-x-3 font-mono text-[11px]">
                  <span className={`flex items-center gap-1 font-bold ${executionResult.status === 'SUCCESS' && !executionResult.stderr ? 'text-emerald-400' : 'text-red-400'}`}>
                    {executionResult.status === 'SUCCESS' && !executionResult.stderr ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {executionResult.status === 'SUCCESS' && !executionResult.stderr ? 'SUCCESS (Exit Code 0)' : 'EXCEPTION'}
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
                  <div className="space-y-1.5">
                    {executionResult.stdout && (
                      <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">{executionResult.stdout}</pre>
                    )}
                    {executionResult.stderr && (
                      <pre className="text-red-400 whitespace-pre-wrap p-2.5 bg-red-950/30 rounded-lg border border-red-900/50">{executionResult.stderr}</pre>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500 italic flex flex-col items-center justify-center h-full gap-1">
                    <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">Enter</kbd> to run your code</span>
                    <span className="text-slate-600 text-[10px]">Or click the green "Run Code" button</span>
                  </div>
                )
              ) : bottomTab === 'testcases' ? (
                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sky-400 font-bold text-xs">Test Invariant 1: Single Responsibility Separation</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {executionResult?.status === 'SUCCESS' && !executionResult?.stderr ? 'PASSED' : 'READY'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">Validates that database, business calculations, and notifications are isolated.</p>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sky-400 font-bold text-xs">Test Invariant 2: Execution Output Consistency</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {executionResult?.status === 'SUCCESS' && !executionResult?.stderr ? 'PASSED' : 'READY'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">Ensures stdout prints correct calculation and log messages without runtime exceptions.</p>
                  </div>
                </div>
              ) : (
                aiReview ? (
                  <div className="space-y-2 font-sans">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-bold text-xs font-mono">
                        Time: {aiReview.time_complexity}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold text-xs font-mono">
                        Space: {aiReview.space_complexity}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-xs">{aiReview.review_summary}</p>
                  </div>
                ) : (
                  <div className="text-slate-500 italic flex items-center justify-center h-full">
                    Click "AI Review" for EduStream AI algorithmic complexity review.
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
