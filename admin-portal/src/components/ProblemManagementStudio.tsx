import React, { useState, useEffect, useMemo } from 'react';
import {
  Code2,
  Layers,
  Search,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Save,
  Sparkles,
  ShieldCheck,
  Cpu,
  Database,
  Sliders,
  ChevronLeft,
  ChevronRight,
  FileCode,
  Terminal,
  Clock,
  HardDrive,
  Wand2,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import {
  ALL_ADMIN_PROBLEMS,
  AdminProblemItem,
  SupportedLanguage,
  generateStarterCode,
  toSlug
} from '../lib/problemCatalog';
import {
  fetchProblemSpec,
  saveProblemSpec,
  fetchDriverCode,
  saveDriverCode,
  deleteDriverCode,
  generateAiDrivers,
  fetchSolutionCode,
  saveSolutionCode,
  executeCompile,
  validateBackendPipeline,
  expandTestcasesAI,
  ProblemSpec
} from '../lib/problemAdminApi';

interface TestCaseRow {
  input: string;
  expectedOutput: string;
}

interface TestRunResult {
  index: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  runtimeMs?: number;
  memoryKb?: number;
  stderr?: string;
  status?: string;
}

export const ProblemManagementStudio: React.FC = () => {
  // Catalog Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'dsa' | 'lld'>('all');
  const [selectedSheet, setSelectedSheet] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Selected Problem for Studio Editing
  const [activeProblem, setActiveProblem] = useState<AdminProblemItem | null>(null);
  const [activeStudioTab, setActiveStudioTab] = useState<'testcases' | 'driver' | 'solution' | 'verify'>('testcases');

  // Active Problem Editing States
  const [isLoadingSpec, setIsLoadingSpec] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  const [testCases, setTestCases] = useState<TestCaseRow[]>([]);
  const [isRawJsonView, setIsRawJsonView] = useState(false);
  const [rawJsonText, setRawJsonText] = useState('');

  // Driver Code States
  const [selectedDriverLang, setSelectedDriverLang] = useState<SupportedLanguage>('cpp');
  const [driverCode, setDriverCode] = useState('');
  const [isLoadingDriver, setIsLoadingDriver] = useState(false);

  // Solution Code States
  const [selectedSolutionLang, setSelectedSolutionLang] = useState<SupportedLanguage>('cpp');
  const [solutionCode, setSolutionCode] = useState('');
  const [isLoadingSolution, setIsLoadingSolution] = useState(false);

  // Feedback Notification
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Verification Pipeline States
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState<{ current: number; total: number; message: string } | null>(null);
  const [verificationResults, setVerificationResults] = useState<TestRunResult[] | null>(null);
  const [cloudValidationResult, setCloudValidationResult] = useState<any | null>(null);

  // Filtered Catalog
  const filteredProblems = useMemo(() => {
    return ALL_ADMIN_PROBLEMS.filter(p => {
      if (selectedType !== 'all' && p.type !== selectedType) return false;
      if (selectedSheet !== 'all' && !p.sheets.includes(selectedSheet)) return false;
      if (selectedDifficulty !== 'all' && p.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSlug = p.slug.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesCompany = p.companies?.some(c => c.toLowerCase().includes(q));
        if (!matchesName && !matchesSlug && !matchesCat && !matchesCompany) return false;
      }
      return true;
    });
  }, [selectedType, selectedSheet, selectedDifficulty, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / itemsPerPage));
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProblems.slice(start, start + itemsPerPage);
  }, [filteredProblems, currentPage]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), 4500);
  };

  // Load problem details when active problem changes
  useEffect(() => {
    if (!activeProblem) return;

    let isMounted = true;
    setIsLoadingSpec(true);
    setVerificationResults(null);
    setCloudValidationResult(null);

    // Initial fallbacks
    setProblemDescription(activeProblem.description || `Implement the optimal solution for ${activeProblem.name}.`);

    fetchProblemSpec(activeProblem.slug).then(spec => {
      if (!isMounted) return;
      setIsLoadingSpec(false);

      if (spec) {
        if (spec.description) setProblemDescription(spec.description);
        if (Array.isArray(spec.testCases) && spec.testCases.length > 0) {
          const rows: TestCaseRow[] = spec.testCases.map((tc, idx) => ({
            input: tc,
            expectedOutput: (spec.expectedOutputs && spec.expectedOutputs[idx]) || ''
          }));
          setTestCases(rows);
          setRawJsonText(JSON.stringify(rows, null, 2));
        } else {
          // Default initial testcases
          const defaultRows: TestCaseRow[] = [
            { input: 'nums = [2, 7, 11, 15], target = 9', expectedOutput: '[0, 1]' },
            { input: 'nums = [3, 2, 4], target = 6', expectedOutput: '[1, 2]' },
            { input: 'nums = [3, 3], target = 6', expectedOutput: '[0, 1]' }
          ];
          setTestCases(defaultRows);
          setRawJsonText(JSON.stringify(defaultRows, null, 2));
        }
      } else {
        const defaultRows: TestCaseRow[] = [
          { input: 'nums = [1, 2, 3]', expectedOutput: '[1, 2, 3]' },
          { input: 'nums = []', expectedOutput: '[]' }
        ];
        setTestCases(defaultRows);
        setRawJsonText(JSON.stringify(defaultRows, null, 2));
      }
    });

    // Load Driver & Solution for active language
    loadDriver(activeProblem.slug, selectedDriverLang);
    loadSolution(activeProblem.slug, selectedSolutionLang);

    return () => {
      isMounted = false;
    };
  }, [activeProblem]);

  const loadDriver = async (slug: string, lang: SupportedLanguage) => {
    setIsLoadingDriver(true);
    const code = await fetchDriverCode(slug, lang);
    setIsLoadingDriver(false);
    if (code) {
      setDriverCode(code);
    } else {
      setDriverCode(`// Driver harness for ${lang.toUpperCase()} not found in R2.\n// Click 'Generate AI Driver Harness' or write custom harness here.`);
    }
  };

  const loadSolution = async (slug: string, lang: SupportedLanguage) => {
    setIsLoadingSolution(true);
    const code = await fetchSolutionCode(slug, lang);
    setIsLoadingSolution(false);
    if (code) {
      setSolutionCode(code);
    } else {
      setSolutionCode(generateStarterCode(slug, lang));
    }
  };

  const handleDriverLangChange = (lang: SupportedLanguage) => {
    setSelectedDriverLang(lang);
    if (activeProblem) {
      loadDriver(activeProblem.slug, lang);
    }
  };

  const handleSolutionLangChange = (lang: SupportedLanguage) => {
    setSelectedSolutionLang(lang);
    if (activeProblem) {
      loadSolution(activeProblem.slug, lang);
    }
  };

  // -------------------------------------------------------------------------
  // TEST CASE ACTIONS
  // -------------------------------------------------------------------------
  const handleAddTestCase = () => {
    const updated = [...testCases, { input: '', expectedOutput: '' }];
    setTestCases(updated);
    setRawJsonText(JSON.stringify(updated, null, 2));
  };

  const handleRemoveTestCase = (index: number) => {
    const updated = testCases.filter((_, i) => i !== index);
    setTestCases(updated);
    setRawJsonText(JSON.stringify(updated, null, 2));
  };

  const handleDuplicateTestCase = (index: number) => {
    const target = testCases[index];
    const updated = [...testCases, { ...target }];
    setTestCases(updated);
    setRawJsonText(JSON.stringify(updated, null, 2));
  };

  const handleTestCaseChange = (index: number, field: 'input' | 'expectedOutput', val: string) => {
    const updated = [...testCases];
    updated[index][field] = val;
    setTestCases(updated);
    setRawJsonText(JSON.stringify(updated, null, 2));
  };

  const handleRawJsonApply = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      if (Array.isArray(parsed)) {
        const rows: TestCaseRow[] = parsed.map(item => ({
          input: typeof item.input === 'string' ? item.input : JSON.stringify(item.input || ''),
          expectedOutput: typeof item.expectedOutput === 'string' ? item.expectedOutput : JSON.stringify(item.expectedOutput ?? item.output ?? '')
        }));
        setTestCases(rows);
        setIsRawJsonView(false);
        showToast('JSON Testcases parsed successfully!');
      } else {
        showToast('JSON must be an array of objects with input and expectedOutput fields', 'error');
      }
    } catch (e: any) {
      showToast(`Invalid JSON syntax: ${e.message}`, 'error');
    }
  };

  const handleSaveTestCases = async () => {
    if (!activeProblem) return;
    setIsSaving(true);
    const tcInputs = testCases.map(tc => tc.input.trim()).filter(Boolean);
    const tcOutputs = testCases.map(tc => tc.expectedOutput.trim());

    const res = await saveProblemSpec(activeProblem.slug, {
      name: activeProblem.name,
      slug: activeProblem.slug,
      category: activeProblem.category,
      difficulty: activeProblem.difficulty,
      description: problemDescription,
      testCases: tcInputs,
      expectedOutputs: tcOutputs
    });
    setIsSaving(false);

    if (res.success) {
      showToast(res.message || 'Test cases saved to Cloudflare R2!');
    } else {
      showToast(res.message || 'Failed to save test cases', 'error');
    }
  };

  const handleAIExpandTestCases = async () => {
    if (!activeProblem) return;
    setIsSaving(true);
    showToast('Invoking AI Testcase Expansion Engine...', 'info');

    const res = await expandTestcasesAI(activeProblem.slug);
    setIsSaving(false);

    if (res.success && res.testCases && res.testCases.length > 0) {
      const newRows: TestCaseRow[] = res.testCases.map((tc, idx) => ({
        input: tc,
        expectedOutput: (res.expectedOutputs && res.expectedOutputs[idx]) || ''
      }));
      setTestCases(newRows);
      setRawJsonText(JSON.stringify(newRows, null, 2));
      showToast(`Generated ${newRows.length} comprehensive testcases with AI!`);
    } else {
      showToast('AI Expansion endpoint returned no cases. Please check Mistral API configuration.', 'error');
    }
  };

  // -------------------------------------------------------------------------
  // DRIVER HARNESS ACTIONS
  // -------------------------------------------------------------------------
  const handleSaveDriver = async () => {
    if (!activeProblem) return;
    setIsSaving(true);
    const res = await saveDriverCode(activeProblem.slug, selectedDriverLang, driverCode);
    setIsSaving(false);
    if (res.success) {
      showToast(res.message || `Driver harness for ${selectedDriverLang.toUpperCase()} saved to Cloudflare R2!`);
    } else {
      showToast(res.message || 'Failed to save driver', 'error');
    }
  };

  const handleGenerateAIDriver = async () => {
    if (!activeProblem) return;
    setIsSaving(true);
    showToast(`Generating ${selectedDriverLang.toUpperCase()} driver harness with Mistral AI...`, 'info');
    const res = await generateAiDrivers(activeProblem.slug);
    setIsSaving(false);
    if (res.success) {
      showToast(`Driver generated! Reloading ${selectedDriverLang.toUpperCase()} harness...`);
      loadDriver(activeProblem.slug, selectedDriverLang);
    } else {
      showToast('Driver generation failed or timed out', 'error');
    }
  };

  const handleResetDriver = async () => {
    if (!activeProblem) return;
    if (window.confirm(`Are you sure you want to delete stored ${selectedDriverLang.toUpperCase()} driver from R2?`)) {
      setIsSaving(true);
      const ok = await deleteDriverCode(activeProblem.slug, selectedDriverLang);
      setIsSaving(false);
      if (ok) {
        showToast(`Driver code for ${selectedDriverLang.toUpperCase()} removed from R2`);
        loadDriver(activeProblem.slug, selectedDriverLang);
      } else {
        showToast('Failed to delete driver', 'error');
      }
    }
  };

  // -------------------------------------------------------------------------
  // REFERENCE SOLUTION ACTIONS
  // -------------------------------------------------------------------------
  const handleSaveSolution = async () => {
    if (!activeProblem) return;
    setIsSaving(true);
    const res = await saveSolutionCode(activeProblem.slug, selectedSolutionLang, solutionCode);
    setIsSaving(false);
    if (res.success) {
      showToast(res.message || `Reference solution for ${selectedSolutionLang.toUpperCase()} saved to Cloudflare R2!`);
    } else {
      showToast(res.message || 'Failed to save reference solution', 'error');
    }
  };

  const handleInsertStarterTemplate = () => {
    if (!activeProblem) return;
    const starter = generateStarterCode(activeProblem.slug, selectedSolutionLang);
    setSolutionCode(starter);
    showToast(`Loaded starter boilerplate template for ${selectedSolutionLang.toUpperCase()}`);
  };

  // -------------------------------------------------------------------------
  // PIPELINE VERIFICATION ENGINE (STACK VERIFICATION)
  // -------------------------------------------------------------------------
  const handleRunPipelineVerification = async () => {
    if (!activeProblem) return;
    setIsVerifying(true);
    setVerificationResults(null);
    setCloudValidationResult(null);

    const validTestCases = testCases.filter(tc => tc.input.trim().length > 0);
    if (validTestCases.length === 0) {
      showToast('Please specify at least 1 test case to verify pipeline', 'error');
      setIsVerifying(false);
      return;
    }

    // Determine code to execute:
    // If driverCode contains a main function or harness, combine solution + driver
    let fullExecutionCode = solutionCode;
    if (driverCode && !driverCode.includes('not found in R2')) {
      if (selectedSolutionLang === 'cpp') {
        fullExecutionCode = `${driverCode}\n\n// Student/Reference Implementation\n${solutionCode}`;
      } else if (selectedSolutionLang === 'python') {
        fullExecutionCode = `from typing import List, Optional, Dict, Any, Tuple\nimport sys\nimport math\nimport collections\nimport heapq\n\n${solutionCode}\n\n# Execution Driver Harness\n${driverCode}`;
      } else if (selectedSolutionLang === 'java') {
        fullExecutionCode = `${solutionCode}\n\n${driverCode}`;
      } else if (selectedSolutionLang === 'javascript') {
        fullExecutionCode = `${solutionCode}\n\n// Driver Harness\n${driverCode}`;
      } else {
        fullExecutionCode = `${solutionCode}\n\n${driverCode}`;
      }
    }

    const results: TestRunResult[] = [];

    for (let i = 0; i < validTestCases.length; i++) {
      const tc = validTestCases[i];
      setVerifyProgress({
        current: i + 1,
        total: validTestCases.length,
        message: `Executing Case ${i + 1} of ${validTestCases.length} via Compiler API...`
      });

      const compileRes = await executeCompile(fullExecutionCode, selectedSolutionLang, tc.input);

      const actualOut = (compileRes.stdout || '').trim();
      const expectedOut = tc.expectedOutput.trim();

      // Flexible comparison: check exact or normalized whitespace / array comparison
      let passed = false;
      if (actualOut === expectedOut) {
        passed = true;
      } else {
        // Normalize whitespace & brackets
        const normActual = actualOut.replace(/\s+/g, '');
        const normExpected = expectedOut.replace(/\s+/g, '');
        if (normActual === normExpected && normActual.length > 0) {
          passed = true;
        } else if (actualOut.toLowerCase() === 'true' && expectedOut.toLowerCase() === '1') {
          passed = true;
        } else if (actualOut.toLowerCase() === 'false' && expectedOut.toLowerCase() === '0') {
          passed = true;
        }
      }

      if (compileRes.isError) {
        passed = false;
      }

      results.push({
        index: i + 1,
        input: tc.input,
        expectedOutput: expectedOut,
        actualOutput: actualOut || (compileRes.stderr ? `[Execution Error]\n${compileRes.stderr}` : '[Empty Output]'),
        passed,
        runtimeMs: typeof compileRes.time === 'number' ? compileRes.time : parseFloat(String(compileRes.time || '0')) * 1000,
        memoryKb: typeof compileRes.memory === 'number' ? compileRes.memory : parseFloat(String(compileRes.memory || '0')),
        stderr: compileRes.stderr,
        status: String(compileRes.status || (passed ? 'Accepted' : 'Wrong Answer'))
      });
    }

    setVerificationResults(results);
    setIsVerifying(false);
    setVerifyProgress(null);

    const passedCount = results.filter(r => r.passed).length;
    if (passedCount === results.length) {
      showToast(`🎉 Stack Pipeline 100% Verified! (${passedCount}/${results.length} cases passed)`, 'success');
    } else {
      showToast(`Pipeline Discrepancy: ${passedCount}/${results.length} passed. Inspect diagnostics below.`, 'error');
    }
  };

  const handleCloudBackendValidation = async () => {
    if (!activeProblem) return;
    setIsVerifying(true);
    showToast('Triggering 3-Stage Cloud Pipeline Validation on Render backend...', 'info');

    const res = await validateBackendPipeline(activeProblem.slug);
    setIsVerifying(false);

    if (res.success) {
      setCloudValidationResult(res.data);
      showToast('Cloud Pipeline Validation completed and verified assets saved to R2!');
    } else {
      showToast(`Cloud Validation failed: ${res.error || 'Server error'}`, 'error');
    }
  };

  const handleAutoHealDiscrepancy = async (caseIdx: number, actualOutput: string) => {
    if (!activeProblem || !actualOutput || actualOutput.startsWith('[')) return;
    const updated = [...testCases];
    if (updated[caseIdx]) {
      updated[caseIdx].expectedOutput = actualOutput.trim();
      setTestCases(updated);
      setRawJsonText(JSON.stringify(updated, null, 2));

      await saveProblemSpec(activeProblem.slug, {
        testCases: updated.map(t => t.input),
        expectedOutputs: updated.map(t => t.expectedOutput)
      });

      showToast(`Case ${caseIdx + 1} expected output auto-healed to '${actualOutput.trim()}' and saved!`);

      // Re-run verification
      handleRunPipelineVerification();
    }
  };

  // =========================================================================
  // VIEW: PROBLEM MANAGEMENT STUDIO (ACTIVE PROBLEM SELECTED)
  // =========================================================================
  if (activeProblem) {
    return (
      <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
        {/* Top Studio Action Bar */}
        <div className="p-4 px-6 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveProblem(null)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Catalog</span>
            </button>

            <div className="h-6 w-px bg-slate-800" />

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white">{activeProblem.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
                    activeProblem.type === 'lld'
                      ? 'bg-purple-950 text-purple-300 border border-purple-700'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  }`}
                >
                  {activeProblem.type.toUpperCase()}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeProblem.difficulty === 'Easy'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : activeProblem.difficulty === 'Medium'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {activeProblem.difficulty}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Slug: <span className="text-slate-300">{activeProblem.slug}</span> &bull; {activeProblem.category}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            {activeProblem.leetcode && (
              <a
                href={activeProblem.leetcode}
                target="_blank"
                rel="noreferrer"
                className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1 transition-all"
                title="Open LeetCode Problem"
              >
                <span>LeetCode</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}

            {activeProblem.gfg && (
              <a
                href={activeProblem.gfg}
                target="_blank"
                rel="noreferrer"
                className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center gap-1 transition-all"
                title="Open GFG Problem"
              >
                <span>GFG</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => {
                loadDriver(activeProblem.slug, selectedDriverLang);
                loadSolution(activeProblem.slug, selectedSolutionLang);
                showToast('Problem assets re-synced from R2');
              }}
              className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Refresh from R2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sync R2</span>
            </button>
          </div>
        </div>

        {/* Action Toast Feedback */}
        {actionFeedback && (
          <div
            className={`m-4 p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 animate-fade-in ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : actionFeedback.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                : 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : actionFeedback.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              )}
              <span>{actionFeedback.message}</span>
            </div>
            <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white text-xs cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Studio Sub-Navigation Tabs */}
        <div className="px-6 pt-3 bg-slate-900/60 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveStudioTab('testcases')}
            className={`px-4 py-2 rounded-t-xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
              activeStudioTab === 'testcases'
                ? 'bg-slate-950 border-slate-800 text-teal-400 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>1. Test Cases & Outputs ({testCases.length})</span>
          </button>

          <button
            onClick={() => setActiveStudioTab('driver')}
            className={`px-4 py-2 rounded-t-xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
              activeStudioTab === 'driver'
                ? 'bg-slate-950 border-slate-800 text-amber-400 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. Driver Code Harness</span>
          </button>

          <button
            onClick={() => setActiveStudioTab('solution')}
            className={`px-4 py-2 rounded-t-xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
              activeStudioTab === 'solution'
                ? 'bg-slate-950 border-slate-800 text-indigo-400 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>3. Reference Solution</span>
          </button>

          <button
            onClick={() => setActiveStudioTab('verify')}
            className={`px-4 py-2 rounded-t-xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
              activeStudioTab === 'verify'
                ? 'bg-slate-950 border-slate-800 text-cyan-400 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Verify Pipeline (Stack Verification)</span>
          </button>
        </div>

        {/* Tab 1: Test Cases Editor */}
        {activeStudioTab === 'testcases' && (
          <div className="p-6 space-y-6 max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-teal-400" />
                  <span>Test Cases & Mathematical Expected Outputs</span>
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  Testcases are directly executed by the compiler harness to validate student submissions and platform health.
                </p>
              </div>

              <div className="flex items-center space-x-2 flex-wrap">
                <button
                  onClick={() => setIsRawJsonView(!isRawJsonView)}
                  className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isRawJsonView ? 'Cards View' : 'Raw JSON View'}</span>
                </button>

                <button
                  onClick={handleAIExpandTestCases}
                  disabled={isSaving}
                  className="p-2 px-3 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  title="Expand to 10+ comprehensive edge cases with Mistral AI"
                >
                  <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Expand (10+ Cases)</span>
                </button>

                <button
                  onClick={handleAddTestCase}
                  className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Case</span>
                </button>

                <button
                  onClick={handleSaveTestCases}
                  disabled={isSaving}
                  className="p-2 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-teal-950 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Test Cases to R2</span>
                </button>
              </div>
            </div>

            {/* Problem Description Area */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Problem Statement / Constraints:</label>
              <textarea
                rows={3}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Enter problem statement and constraints..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500 custom-scrollbar"
              />
            </div>

            {/* Testcases List View */}
            {isRawJsonView ? (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Raw JSON Testcases Array:</span>
                  <button
                    onClick={handleRawJsonApply}
                    className="p-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Apply JSON
                  </button>
                </div>
                <textarea
                  rows={14}
                  value={rawJsonText}
                  onChange={(e) => setRawJsonText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500 custom-scrollbar"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-teal-400 font-mono text-xs font-bold">
                          Case #{idx + 1}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleDuplicateTestCase(idx)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                          title="Duplicate Case"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveTestCase(idx)}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 text-rose-300 hover:text-white text-xs cursor-pointer"
                          title="Delete Case"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 font-mono">
                          Input Arguments (e.g. matrix = [[1,2],[3,4]] or nums = [2,7,11,15], target = 9):
                        </label>
                        <input
                          type="text"
                          value={tc.input}
                          onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                          placeholder="Input arguments"
                          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 font-mono">
                          Mathematical Expected Output (e.g. [0, 1] or true):
                        </label>
                        <input
                          type="text"
                          value={tc.expectedOutput}
                          onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                          placeholder="Expected stdout/return value"
                          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Driver Code Harness Editor */}
        {activeStudioTab === 'driver' && (
          <div className="p-6 space-y-4 max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Execution Driver Harness</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Compiles test inputs, parses parameters, invokes Solution method, and prints formatted output.
                  </p>
                </div>
              </div>

              {/* Language Selector */}
              <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                {(['cpp', 'python', 'java', 'javascript', 'go', 'rust'] as SupportedLanguage[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => handleDriverLangChange(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedDriverLang === lang
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadDriver(activeProblem.slug, selectedDriverLang)}
                  disabled={isLoadingDriver}
                  className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDriver ? 'animate-spin' : ''}`} />
                  <span>Reload Driver</span>
                </button>

                <button
                  onClick={handleGenerateAIDriver}
                  disabled={isSaving}
                  className="p-2 px-3 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-700 text-amber-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generate with AI</span>
                </button>

                <button
                  onClick={handleResetDriver}
                  className="p-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 text-rose-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Driver</span>
                </button>
              </div>

              <button
                onClick={handleSaveDriver}
                disabled={isSaving}
                className="p-2 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-950 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save {selectedDriverLang.toUpperCase()} Driver to R2</span>
              </button>
            </div>

            {/* Code Editor */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
              <div className="p-3 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Driver Harness ({selectedDriverLang.toUpperCase()})</span>
                <span>{driverCode.split('\n').length} lines</span>
              </div>
              <textarea
                rows={18}
                value={driverCode}
                onChange={(e) => setDriverCode(e.target.value)}
                className="w-full p-4 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none custom-scrollbar"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Reference Solution Editor */}
        {activeStudioTab === 'solution' && (
          <div className="p-6 space-y-4 max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Reference Solution Implementation</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    The golden master reference solution tested against all testcases to verify the pipeline stack.
                  </p>
                </div>
              </div>

              {/* Language Selector */}
              <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                {(['cpp', 'python', 'java', 'javascript', 'go', 'rust'] as SupportedLanguage[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => handleSolutionLangChange(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedSolutionLang === lang
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadSolution(activeProblem.slug, selectedSolutionLang)}
                  disabled={isLoadingSolution}
                  className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSolution ? 'animate-spin' : ''}`} />
                  <span>Reload Solution</span>
                </button>

                <button
                  onClick={handleInsertStarterTemplate}
                  className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Load Starter Template</span>
                </button>
              </div>

              <button
                onClick={handleSaveSolution}
                disabled={isSaving}
                className="p-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-indigo-950 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save {selectedSolutionLang.toUpperCase()} Solution to R2</span>
              </button>
            </div>

            {/* Code Editor */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
              <div className="p-3 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Solution Implementation ({selectedSolutionLang.toUpperCase()})</span>
                <span>{solutionCode.split('\n').length} lines</span>
              </div>
              <textarea
                rows={18}
                value={solutionCode}
                onChange={(e) => setSolutionCode(e.target.value)}
                className="w-full p-4 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none custom-scrollbar"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* Tab 4: Verify Pipeline (Stack Verification) */}
        {activeStudioTab === 'verify' && (
          <div className="p-6 space-y-6 max-w-6xl">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/40 border border-cyan-800/40 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-6 h-6 text-cyan-400" />
                  <h4 className="text-base font-black text-white">Full Stack Pipeline Verification Engine</h4>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Executes the reference solution with the active driver code against all {testCases.length} testcases via the backend compiler.
                </p>
              </div>

              <div className="flex items-center space-x-2 flex-wrap">
                <button
                  onClick={handleCloudBackendValidation}
                  disabled={isVerifying}
                  className="p-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border border-slate-700 disabled:opacity-50"
                  title="Run 3-stage validation on Render backend"
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Cloud Backend Validation</span>
                </button>

                <button
                  onClick={handleRunPipelineVerification}
                  disabled={isVerifying}
                  className="p-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-950 flex items-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Stack...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Run Stack Verification ({selectedSolutionLang.toUpperCase()})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Indicator */}
            {isVerifying && verifyProgress && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-300">{verifyProgress.message}</span>
                  <span className="text-slate-400 font-bold">
                    {verifyProgress.current} / {verifyProgress.total}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-300"
                    style={{ width: `${(verifyProgress.current / verifyProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cloud Validation Result Banner */}
            {cloudValidationResult && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h5 className="text-xs font-bold text-teal-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Cloud Backend Validation Result:</span>
                </h5>
                <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto">
                  {JSON.stringify(cloudValidationResult, null, 2)}
                </pre>
              </div>
            )}

            {/* Verification Results View */}
            {verificationResults && (
              <div className="space-y-4">
                {/* Summary Banner */}
                {(() => {
                  const passed = verificationResults.filter(r => r.passed).length;
                  const total = verificationResults.length;
                  const allPassed = passed === total;

                  return (
                    <div
                      className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
                        allPassed
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                          : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {allPassed ? (
                          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h5 className="text-sm font-black text-white">
                            {allPassed ? 'Platform Pipeline 100% Operational & Verified!' : 'Pipeline Discrepancy Detected'}
                          </h5>
                          <p className="text-xs opacity-80 font-mono">
                            {passed} of {total} testcases passed successfully with active reference solution & driver.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-xs font-mono">
                        <span className="p-1.5 px-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white font-bold">
                          Pass Rate: {Math.round((passed / total) * 100)}%
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Test Case Breakdown Table/Cards */}
                <div className="space-y-3">
                  {verificationResults.map((res, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        res.passed
                          ? 'bg-slate-900/80 border-slate-800'
                          : 'bg-rose-950/30 border-rose-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 font-mono text-xs font-bold">
                            Testcase #{res.index}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                              res.passed
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {res.passed ? 'PASSED' : 'DISCREPANCY / FAILED'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                          {res.runtimeMs !== undefined && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{Math.round(res.runtimeMs)}ms</span>
                            </span>
                          )}
                          {!res.passed && (
                            <button
                              onClick={() => handleAutoHealDiscrepancy(idx, res.actualOutput)}
                              className="p-1 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold cursor-pointer"
                              title="Set expected output to this actual output and persist to R2"
                            >
                              Auto-Heal Output
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inputs & Outputs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Input:</span>
                          <div className="text-slate-200 break-all">{res.input || '(empty)'}</div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Expected Output:</span>
                          <div className="text-emerald-300 break-all">{res.expectedOutput || '(empty)'}</div>
                        </div>

                        <div
                          className={`p-3 rounded-xl border space-y-1 ${
                            res.passed
                              ? 'bg-slate-950 border-slate-800 text-slate-200'
                              : 'bg-rose-950/40 border-rose-800 text-rose-200'
                          }`}
                        >
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Actual Output:</span>
                          <div className="break-all whitespace-pre-wrap">{res.actualOutput}</div>
                        </div>
                      </div>

                      {res.stderr && (
                        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900 text-rose-300 font-mono text-xs space-y-1">
                          <span className="text-[10px] font-bold text-rose-400 uppercase block">Compiler Stderr:</span>
                          <pre className="whitespace-pre-wrap">{res.stderr}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN PROBLEM CATALOG LIST & FILTERS
  // =========================================================================
  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto font-sans">
      {/* Top Banner & Stats Header */}
      <div className="p-6 bg-slate-900 border-b border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-tight">DSA & LLD Problem Studio</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
                  {ALL_ADMIN_PROBLEMS.length} Questions Curated
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Manage driver code harnesses, reference solutions, and testcases with end-to-end stack pipeline verification.
              </p>
            </div>
          </div>

          {/* Quick Stat Chips */}
          <div className="flex items-center space-x-2">
            <div className="p-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">DSA Problems</span>
              <span className="text-sm font-black text-cyan-400 font-mono">668</span>
            </div>
            <div className="p-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">LLD Systems</span>
              <span className="text-sm font-black text-purple-400 font-mono">10</span>
            </div>
            <div className="p-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Sheets</span>
              <span className="text-sm font-black text-emerald-400 font-mono">5 Curated</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by problem name, slug, company or topic..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Type Toggle */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => { setSelectedType('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedType === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({ALL_ADMIN_PROBLEMS.length})
            </button>
            <button
              onClick={() => { setSelectedType('dsa'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedType === 'dsa' ? 'bg-cyan-900 text-cyan-200 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DSA (668)
            </button>
            <button
              onClick={() => { setSelectedType('lld'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedType === 'lld' ? 'bg-purple-900 text-purple-200 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LLD (10)
            </button>
          </div>

          {/* Sheet Selector */}
          <select
            value={selectedSheet}
            onChange={(e) => { setSelectedSheet(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
          >
            <option value="all">All Sheets & Tracks</option>
            <option value="sde">SDETube SDE Sheet (191)</option>
            <option value="a2z">A2Z Complete Roadmap (474)</option>
            <option value="79">79 Fast-Track Yield</option>
            <option value="blind75">Blind 75 Curated</option>
            <option value="mik">CodeStoryWithMIK (177)</option>
            <option value="lld">LLD Machine Coding (10)</option>
          </select>

          {/* Difficulty Filter */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => { setSelectedDifficulty('all'); setCurrentPage(1); }}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedDifficulty === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setSelectedDifficulty('Easy'); setCurrentPage(1); }}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedDifficulty === 'Easy' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => { setSelectedDifficulty('Medium'); setCurrentPage(1); }}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedDifficulty === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => { setSelectedDifficulty('Hard'); setCurrentPage(1); }}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedDifficulty === 'Hard' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hard
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Table / Grid View */}
      <div className="p-6 space-y-4 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredProblems.length)} of {filteredProblems.length} problems
          </span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3.5 px-4">Problem Name & Slug</th>
                <th className="p-3.5 px-4">Type & Track</th>
                <th className="p-3.5 px-4">Category</th>
                <th className="p-3.5 px-4">Difficulty</th>
                <th className="p-3.5 px-4">Companies</th>
                <th className="p-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {paginatedProblems.map((problem) => (
                <tr key={problem.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 px-4">
                    <div className="font-bold text-white hover:text-cyan-300 cursor-pointer" onClick={() => setActiveProblem(problem)}>
                      {problem.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{problem.slug}</div>
                  </td>

                  <td className="p-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          problem.type === 'lld'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {problem.type.toUpperCase()}
                      </span>
                      {problem.sheets?.map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-3.5 px-4 font-mono text-slate-300">
                    {problem.category}
                  </td>

                  <td className="p-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        problem.difficulty === 'Easy'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : problem.difficulty === 'Medium'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>

                  <td className="p-3.5 px-4">
                    <div className="flex items-center gap-1 flex-wrap max-w-xs">
                      {problem.companies && problem.companies.length > 0 ? (
                        problem.companies.slice(0, 3).map(c => (
                          <span key={c} className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 text-[10px] font-mono">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 font-mono text-[10px]">—</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3.5 px-4 text-right">
                    <button
                      onClick={() => setActiveProblem(problem)}
                      className="p-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-cyan-950 transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Edit & Verify</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5) {
                pageNum = Math.min(Math.max(1, currentPage - 2) + i, totalPages);
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
