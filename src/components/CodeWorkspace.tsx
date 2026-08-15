import React, { useState, useCallback, useEffect } from 'react';
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
  RotateCcw,
  History,
  Laptop,
  Copy,
  Check
} from 'lucide-react';
import { executeCode, SupportedLanguage } from '../lib/compiler';
import { requestMistralCodeReview, CodeTAReview } from '../lib/mistral';
import { CodeExecutionResult, QuizQuestion } from '../lib/types';
import { LeetCodeWorkspaceModal } from './LeetCodeWorkspaceModal';

import { AIProcessingStatusCard } from './AIProcessingStatusCard';

interface CodeWorkspaceProps {
  question?: QuizQuestion;
  allCodingQuestions?: QuizQuestion[];
  codingProblem?: {
    title?: string;
    problem_statement?: string;
    starter_code_python?: string;
    starter_code_cpp?: string;
    solution_code_cpp?: string;
  } | null;
  isLoading?: boolean;
  progressPercent?: number;
  currentPart?: number;
  totalParts?: number;
  stage?: string;
  estimatedSecondsLeft?: number;
  onCodeExecuted?: (timeTakenSeconds: number, isCorrect: boolean) => void;
}

// Language-specific starter templates
const LANGUAGE_STARTERS: Record<SupportedLanguage, string> = {
  python: `# SDETube — Python 3.10 Sandbox
# Solve the problem below and click "Run Code"

def solve():
    pass
`,
  java: `// SDETube — Java 17 Sandbox
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, SDETube!");
    }
}
`,
  cpp: `// SDETube — C++ 20 Sandbox
#include <iostream>
#include <vector>
using namespace std;

int main() {
    cout << "Hello, SDETube!" << endl;
    return 0;
}
`,
  go: `// SDETube — Go 1.21 Sandbox
package main

import "fmt"

func main() {
    fmt.Println("SDETube Go Execution Context")
}
`,
  rust: `// SDETube — Rust 1.75 Sandbox
fn main() {
    println!("SDETube Rust Execution Context");
}
`,
  javascript: `// SDETube — Node.js Sandbox
function solve() {
    console.log("Hello, SDETube!");
}
solve();
`,
  sql: `-- SDETube — PostgreSQL SQL Sandbox
SELECT 1;
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

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ 
  question, 
  allCodingQuestions = [], 
  codingProblem, 
  isLoading = false, 
  progressPercent,
  currentPart,
  totalParts,
  stage,
  estimatedSecondsLeft,
  onCodeExecuted 
}) => {
  const codingList = allCodingQuestions.length > 0 ? allCodingQuestions : (question ? [question] : []);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const activeQ = codingList[activeQuestionIdx] || question;

  const initialDetectedLang: SupportedLanguage = (() => {
    if (codingProblem?.starter_code_python) return 'python';
    if (codingProblem?.starter_code_cpp) return 'cpp';
    if (activeQ?.starter_code) {
      if (/^#include|using namespace std|std::|int main\(\)/.test(activeQ.starter_code)) return 'cpp';
      if (/public class|import java\./.test(activeQ.starter_code)) return 'java';
    }
    return 'python';
  })();

  const [language, setLanguage] = useState<SupportedLanguage>(initialDetectedLang);
  const [code, setCode] = useState<string>(
    (initialDetectedLang === 'python' ? codingProblem?.starter_code_python : codingProblem?.starter_code_cpp) ||
    activeQ?.starter_code || 
    LANGUAGE_STARTERS[initialDetectedLang]
  );

  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [aiReview, setAiReview] = useState<CodeTAReview | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'terminal' | 'ai_ta' | 'test_cases'>('terminal');
  const [isLeetCodeFullscreen, setIsLeetCodeFullscreen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState<{ input: string; expected: string; actual: string; passed: boolean }[]>([]);
  const [isCopiedStarter, setIsCopiedStarter] = useState(false);

  useEffect(() => {
    if (codingProblem) {
      if (language === 'python' && codingProblem.starter_code_python) {
        setCode(codingProblem.starter_code_python);
      } else if (language === 'cpp' && codingProblem.starter_code_cpp) {
        setCode(codingProblem.starter_code_cpp);
      }
    }
  }, [codingProblem?.title, language]);

  // Synchronize starter code whenever question changes
  useEffect(() => {
    if (activeQ?.starter_code) {
      setCode(activeQ.starter_code);
      setExecutionResult(null);
      setAiReview(null);
    }
  }, [activeQ?.id, activeQ?.starter_code]);

  if (isLoading || (!codingProblem && codingList.length === 0)) {
    return (
      <AIProcessingStatusCard 
        videoTitle={codingProblem?.title || activeQ?.question || 'Lecture Coding Challenge'} 
        durationSeconds={900} 
        progressPercent={progressPercent}
        currentPart={currentPart}
        totalParts={totalParts}
        stage={stage}
        estimatedSecondsLeft={estimatedSecondsLeft}
      />
    );
  }

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (newLang === 'python' && codingProblem?.starter_code_python) {
      setCode(codingProblem.starter_code_python);
    } else if (newLang === 'cpp' && codingProblem?.starter_code_cpp) {
      setCode(codingProblem.starter_code_cpp);
    } else {
      setCode(LANGUAGE_STARTERS[newLang]);
    }
    setExecutionResult(null);
    setAiReview(null);
  };

  const handleResetCode = () => {
    if (language === 'python' && codingProblem?.starter_code_python) {
      setCode(codingProblem.starter_code_python);
    } else if (language === 'cpp' && codingProblem?.starter_code_cpp) {
      setCode(codingProblem.starter_code_cpp);
    } else if (activeQ?.starter_code) {
      setCode(activeQ.starter_code);
    } else {
      setCode(LANGUAGE_STARTERS[language]);
    }
    setExecutionResult(null);
    setAiReview(null);
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
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
    setAiReview(null);

    const startTime = performance.now();
    const result = await executeCode(code, language);
    const endTime = performance.now();

    setIsExecuting(false);
    setExecutionResult(result);
    setActiveBottomTab('terminal');

    // Validate against Mistral-generated test cases if available
    if (activeQ?.test_cases && activeQ.test_cases.length > 0 && result.stdout) {
      const stdoutTrimmed = result.stdout.trim();
      const tcResults = activeQ.test_cases.map((tc) => {
        const expectedTrimmed = tc.expected_output.trim();
        const passed = stdoutTrimmed.includes(expectedTrimmed) || stdoutTrimmed === expectedTrimmed;
        return { input: tc.input, expected: tc.expected_output, actual: stdoutTrimmed, passed };
      });
      setTestCaseResults(tcResults);
      setActiveBottomTab('test_cases');
    } else {
      setTestCaseResults([]);
    }

    // Trigger Mistral AI evaluation for test cases automatically
    setIsAnalyzingAI(true);
    requestMistralCodeReview(code, language, result.stdout, result.stderr, question?.question || 'Lecture Challenge')
      .then((review) => setAiReview(review))
      .catch((err) => console.warn('[Mistral TA Notice]:', err))
      .finally(() => setIsAnalyzingAI(false));

    // Save submission attempt to localStorage history
    const submissionEntry = {
      id: `sub-${Date.now()}`,
      problemTitle: question?.question || 'Lecture Challenge',
      code,
      language,
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      timestamp: new Date().toLocaleTimeString()
    };
    try {
      const existing = JSON.parse(localStorage.getItem('edustream_code_history') || '[]');
      localStorage.setItem('edustream_code_history', JSON.stringify([submissionEntry, ...existing].slice(0, 30)));

      // Sync attempt to Cloud Database
      const backendUrl = import.meta.env.VITE_TELEGRAM_BACKEND_URL || 'https://edustream-backend-90vm.onrender.com';
      fetch(`${backendUrl}/api/attempts/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_title: question?.question || 'Lecture Coding Challenge',
          question_type: 'CODING',
          code_submitted: code,
          stdout: result.stdout,
          stderr: result.stderr,
          is_correct: result.status === 'SUCCESS' && !result.stderr,
          time_taken_seconds: Math.max(15, Math.round((endTime - startTime) / 1000))
        })
      }).catch((e) => console.warn('[Attempt Sync Notice]:', e));
    } catch (e) {
      console.warn('[Storage Notice]:', e);
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

  const handleCopyStarter = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setIsCopiedStarter(true);
    setTimeout(() => setIsCopiedStarter(false), 2000);
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      
      {/* MOBILE RESTRICTION VIEW (Screens < 768px): Inform user to switch to laptop */}
      <div className="block md:hidden p-4 sm:p-6 space-y-5 bg-slate-950/95 font-sans">
        
        {/* Desktop Required Alert Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-purple-950/80 border border-indigo-500/40 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 shadow-lg">
            <Laptop className="w-7 h-7 animate-pulse text-indigo-300" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold">
              DESKTOP WORKSPACE REQUIRED
            </span>
            <h3 className="text-base font-extrabold text-slate-100 tracking-tight">
              Switch to Laptop to Use the Code Compiler
            </h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              The Monaco SDE Code Compiler, real-time runtime judge, and live debugging terminal require a physical keyboard and larger display. Open SDETube on your laptop or PC to run test cases and submit solutions.
            </p>
          </div>
        </div>

        {/* Problem Statement Card for Mobile */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-indigo-300">
                {codingProblem?.title || activeQ?.question || 'Algorithmic Challenge'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-indigo-950 border border-indigo-700/60 text-[10px] font-mono text-indigo-300">
              SDE Practice
            </span>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans border-t border-slate-800/80 pt-2.5">
            {codingProblem?.problem_statement || activeQ?.question || 'Implement the optimal algorithmic solution based on the lecture invariants.'}
          </div>
        </div>

        {/* Starter Code Viewer with Copy Button on Mobile */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg space-y-2">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-400 font-bold">Starter Code Preview</span>
            <button
              onClick={() => handleCopyStarter(code)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold transition-all"
            >
              {isCopiedStarter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopiedStarter ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-3.5 text-[11px] font-mono text-indigo-200 overflow-x-auto max-h-52 bg-slate-950/80 leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>

      </div>

      {/* DESKTOP FULL WORKSPACE (Screens >= 768px): Full Monaco IDE */}
      <div className="hidden md:flex flex-col flex-1 h-full">
        {/* Top Toolbar */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-slate-300">Monaco Editor</span>
            </div>

          {codingList.length > 1 && (
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {codingList.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setActiveQuestionIdx(idx);
                    if (q.starter_code) setCode(q.starter_code);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-all ${
                    activeQuestionIdx === idx
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={q.question}
                >
                  Var {idx + 1}
                </button>
              ))}
            </div>
          )}

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

          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-purple-300 hover:text-purple-200 text-xs transition-all font-bold"
            title="View Code Submission History"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">History</span>
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
              <span>SDETube AI Review</span>
            </button>

            {testCaseResults.length > 0 && (
              <button
                onClick={() => setActiveBottomTab('test_cases')}
                className={`flex items-center space-x-1.5 font-mono ${
                  activeBottomTab === 'test_cases' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Test Cases ({testCaseResults.filter(t => t.passed).length}/{testCaseResults.length})</span>
              </button>
            )}
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
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
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
          ) : activeBottomTab === 'test_cases' ? (
            testCaseResults.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-100">SDETube AI Test Case Validation</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                    testCaseResults.every(t => t.passed)
                      ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                      : 'bg-amber-950 border-amber-700 text-amber-300'
                  }`}>
                    {testCaseResults.filter(t => t.passed).length}/{testCaseResults.length} Passed
                  </span>
                </div>
                {testCaseResults.map((tc, idx) => (
                  <div key={idx} className={`p-2 rounded-lg border ${
                    tc.passed
                      ? 'bg-emerald-950/30 border-emerald-800/50'
                      : 'bg-red-950/30 border-red-800/50'
                  }`}>
                    <div className="flex items-center gap-2 text-[11px] font-bold mb-1">
                      {tc.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span className={tc.passed ? 'text-emerald-300' : 'text-red-300'}>
                        Test Case {idx + 1}: {tc.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                      <div><span className="text-slate-500">Input:</span> {tc.input || '(stdin)'}</div>
                      <div><span className="text-slate-500">Expected:</span> <span className="text-emerald-400">{tc.expected}</span></div>
                      {!tc.passed && <div><span className="text-slate-500">Actual:</span> <span className="text-red-400">{tc.actual.slice(0, 200)}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 italic flex items-center justify-center h-full">
                Run your code to see test case results.
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
                Click "AI Review" for SDETube AI algorithmic complexity review.
              </div>
            )
          )}
        </div>
      </div>
      </div>

      {/* LeetCode Fullscreen Workspace Modal */}
      {isLeetCodeFullscreen && (
        <LeetCodeWorkspaceModal
          question={question}
          problemTitle={codingProblem?.title || question?.question || 'Algorithm Practice Challenge'}
          initialLanguage={language}
          initialCode={code}
          codingProblem={codingProblem}
          onClose={() => setIsLeetCodeFullscreen(false)}
          onCodeExecuted={onCodeExecuted}
        />
      )}

      {/* Submission History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-6 overflow-y-auto flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                Code Execution & Attempt Submission History
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                Close ✖
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 font-mono text-xs">
              {(() => {
                const history = JSON.parse(localStorage.getItem('edustream_code_history') || '[]');
                if (history.length === 0) {
                  return <p className="text-slate-400 italic text-center py-6">No submission history logged yet. Run code in Monaco Editor to record history.</p>;
                }
                return history.map((sub: any) => (
                  <div key={sub.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300">{sub.problemTitle}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                        {sub.status} • {sub.timestamp}
                      </span>
                    </div>
                    <pre className="p-2 rounded bg-slate-900 text-[10px] text-slate-300 overflow-x-auto">
                      {sub.code}
                    </pre>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
