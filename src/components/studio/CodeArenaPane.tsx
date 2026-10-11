import React, { useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { 
  Play, 
  Send, 
  RotateCcw, 
  Code2, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  Sparkles,
  ChevronDown,
  Layers
} from 'lucide-react';
import { registerLeetCodeCompletionProviders } from '../../lib/monacoEditorSuggestions';
import { executeCode, SupportedLanguage, CodeExecutionResult } from '../../lib/compiler';
import { canAffordAction, deductCredits, PRICING_CONFIG } from '../../lib/billing';

interface CodeArenaPaneProps {
  mode: 'dsa' | 'hld' | 'lld';
  slug?: string;
  problemTitle: string;
  initialLanguage?: SupportedLanguage;
  starterCode?: string;
  onCodeChange?: (code: string) => void;
  onOpenRechargeModal?: () => void;
}

const DEFAULT_STARTERS: Record<SupportedLanguage, string> = {
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <memory>

class Solution {
public:
    void execute() {
        std::cout << "SDETube Studio Engine Initialized" << std::endl;
    }
};

int main() {
    Solution sol;
    sol.execute();
    return 0;
}`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("SDETube Studio Engine Initialized");
    }
}`,
  python: `class Solution:
    def execute(self):
        print("SDETube Studio Engine Initialized")

if __name__ == "__main__":
    sol = Solution()
    sol.execute()
`,
  javascript: `function execute() {
    console.log("SDETube Studio Engine Initialized");
}

execute();
`,
  sql: `-- SDETube SQL Sandbox Query
SELECT 
    id, 
    name, 
    status 
FROM platform_solutions 
LIMIT 10;
`,
  go: `package main

import "fmt"

func main() {
    fmt.Println("SDETube Studio Engine Initialized")
}
`,
  rust: `fn main() {
    println!("SDETube Studio Engine Initialized");
}
`
};

export const CodeArenaPane: React.FC<CodeArenaPaneProps> = ({
  mode,
  slug,
  problemTitle,
  initialLanguage = 'cpp',
  starterCode,
  onCodeChange,
  onOpenRechargeModal
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [code, setCode] = useState<string>(() => starterCode || DEFAULT_STARTERS[initialLanguage] || DEFAULT_STARTERS.cpp);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'output' | 'testcases'>('output');

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    const newCode = DEFAULT_STARTERS[newLang] || DEFAULT_STARTERS.cpp;
    setCode(newCode);
    if (onCodeChange) onCodeChange(newCode);
  };

  const handleEditorMount: OnMount = (_, monaco) => {
    registerLeetCodeCompletionProviders(monaco);
  };

  const handleCodeChange = (val?: string) => {
    const updated = val || '';
    setCode(updated);
    if (onCodeChange) onCodeChange(updated);
  };

  const handleRunCode = async () => {
    if (isRunning) return;

    if (!canAffordAction(PRICING_CONFIG.COMPILER_RUN_DSA_LLD)) {
      if (onOpenRechargeModal) onOpenRechargeModal();
      return;
    }
    deductCredits(
      PRICING_CONFIG.COMPILER_RUN_DSA_LLD,
      'STUDIO_COMPILER_RUN',
      `⚡ Studio Execution: ${problemTitle || slug || mode.toUpperCase()}`
    );

    setIsRunning(true);
    setExecutionResult(null);

    try {
      const result = await executeCode(code, language);
      setExecutionResult(result);
    } catch {
      setExecutionResult({
        stdout: '',
        stderr: 'Execution failed: Could not connect to SDETube Compiler Engine.',
        exit_code: 1,
        execution_time_ms: 0,
        memory_used_kb: 0,
        status: 'ERROR'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 select-none">
      {/* 1. Editor Toolbar */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white hidden sm:inline">Code Arena</span>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="cpp">C++ (GCC 14)</option>
            <option value="java">Java 21 (OpenJDK)</option>
            <option value="python">Python 3.12</option>
            <option value="javascript">JavaScript (Node 20)</option>
            <option value="go">Go 1.22</option>
            <option value="rust">Rust 1.78</option>
            <option value="sql">SQL (Sandbox)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLanguageChange(language)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset code template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-sm shadow-emerald-950 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Run Code in SDETube Sandbox (₹0.05)"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            <span className="text-[10px] font-mono text-emerald-200">(₹0.05)</span>
          </button>
        </div>
      </div>

      {/* 2. Monaco Editor View */}
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : language === 'java' ? 'java' : 'javascript'}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 13,
            lineHeight: 20,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            tabSize: 4
          }}
        />
      </div>

      {/* 3. Bottom Console (Execution Output) */}
      <div className="h-44 border-t border-slate-800 bg-slate-900/90 flex flex-col">
        <div className="px-3 py-1.5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-300 font-mono text-[11px]">Execution Console</span>
          </div>

          {executionResult && (
            <div className="flex items-center gap-3 text-[11px] font-mono">
              {executionResult.execution_time_ms !== undefined && (
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {executionResult.execution_time_ms}ms
                </span>
              )}
              {executionResult.memory_used_kb !== undefined && (
                <span className="text-slate-400 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-purple-400" />
                  {executionResult.memory_used_kb} KB
                </span>
              )}
              <span className={`font-bold ${executionResult.status === 'ERROR' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {executionResult.status === 'ERROR' ? 'Runtime Error' : 'Success'}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 p-3 overflow-y-auto font-mono text-xs custom-scrollbar">
          {isRunning ? (
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Executing solution in SDETube Sandbox...</span>
            </div>
          ) : executionResult ? (
            <div className="space-y-2">
              {executionResult.stdout && (
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Stdout</div>
                  <pre className="text-slate-200 whitespace-pre-wrap">{executionResult.stdout}</pre>
                </div>
              )}
              {executionResult.stderr && (
                <div>
                  <div className="text-[10px] text-rose-400 uppercase tracking-wider font-bold mb-0.5">Stderr</div>
                  <pre className="text-rose-300 whitespace-pre-wrap">{executionResult.stderr}</pre>
                </div>
              )}
              {!executionResult.stdout && !executionResult.stderr && (
                <div className="text-slate-500 italic">Program finished with zero output.</div>
              )}
            </div>
          ) : (
            <div className="text-slate-500 italic">
              Click "Run Code" above to execute program and view stdout.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
