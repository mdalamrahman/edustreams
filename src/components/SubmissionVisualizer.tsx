import { useState } from 'react';
import { SupportedLanguage } from '../lib/compiler';

interface TestCaseMeasurement {
  caseIndex: number;
  isSample?: boolean;
  runtimeMs: number | null;
  memoryKb: number | null;
}

export interface TestCaseResultItem {
  caseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed: boolean;
  runtimeMs: number | null;
  memoryKb: number | null;
  errorMessage?: string;
  isSample?: boolean;
}

export interface SubmissionAnalyticsData {
  isSuccess: boolean;
  status: string;
  totalCases: number;
  passedCases: number;
  runtimeMs: number | null;
  memoryKb: number | null;
  measurementVersion?: 1;
  measurements?: Array<TestCaseMeasurement>;
  timeComplexity: string;    // e.g. 'O(N)'
  spaceComplexity: string;   // e.g. 'O(N)'
  timeExplanation: string;
  spaceExplanation: string;
  optimalTimeComplexity?: string;  // e.g. 'O(N)'
  optimalSpaceComplexity?: string; // e.g. 'O(1)'
  testCasesResults: TestCaseResultItem[];
  failedCase?: {
    caseIndex: number;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    stderr?: string;
  };
  language: SupportedLanguage;
  problemTitle: string;
  submittedCode: string;
  isAiEvaluated?: boolean;
}

interface SubmissionVisualizerProps {
  data: SubmissionAnalyticsData;
  onClose?: () => void;
  onRetry?: () => void;
  onAskAi?: (prompt: string) => void;
  onReportTestCase?: (caseIndex: number) => void;
  onApplyCode?: (code: string, language: SupportedLanguage) => void;
}

export function summarizeMeasurements(measurements: Pick<TestCaseMeasurement, 'runtimeMs' | 'memoryKb'>[]) {
  const valid = (value: number | null): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  const times = measurements.map(item => item.runtimeMs).filter(valid).sort((a, b) => a - b);
  const sizes = measurements.map(item => item.memoryKb).filter(valid);
  const middle = Math.floor(times.length / 2);
  const runtimeMs = !times.length ? null : times.length % 2 ? times[middle] : (times[middle - 1] + times[middle]) / 2;
  return { runtimeMs, memoryKb: sizes.length ? Math.max(...sizes) : null };
}

function formatMeasurement(value: number | null, unit: string) {
  return value === null ? 'Unavailable' : `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
}

function MeasurementChart({ points, field, unit, title }: {
  points: TestCaseMeasurement[];
  field: 'runtimeMs' | 'memoryKb';
  unit: string;
  title: string;
}) {
  const maximum = Math.max(0, ...points.map(point => point[field] ?? 0));
  return <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
    <h3 className="font-semibold text-slate-100">{title}</h3>
    {!points.length ? <p className="mt-3 text-sm text-slate-400">No measurements recorded.</p> : <ul className="mt-3 space-y-2">
      {points.map(point => {
        const value = point[field];
        return <li key={point.caseIndex} className="grid grid-cols-[6rem_1fr_7rem] items-center gap-3 text-xs">
          <span className="text-slate-300">{point.isSample ? `Sample ${point.caseIndex + 1}` : `Case ${point.caseIndex + 1}`}</span>
          <span className="h-2 rounded-full bg-slate-800" aria-hidden="true">
            {value !== null && maximum > 0 && <span className="block h-full rounded-full bg-cyan-400" style={{ width: `${value / maximum * 100}%` }} />}
          </span>
          <span className="text-right font-mono text-slate-200">{formatMeasurement(value, unit)}</span>
        </li>;
      })}
    </ul>}
  </section>;
}

export function SubmissionVisualizer({ data, onRetry, onAskAi, onReportTestCase, onApplyCode }: SubmissionVisualizerProps) {
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const points = data.measurementVersion === 1 ? data.measurements || [] : [];
  const { runtimeMs, memoryKb } = summarizeMeasurements(points);
  const sample = data.testCasesResults.find(item => item.isSample && item.caseIndex === selectedCase);
  return <div className="flex-1 min-h-0 overflow-y-auto space-y-5 p-6 text-slate-200">
    <header className="pr-10">
      <h2 className="text-xl font-bold text-white">Submission performance</h2>
      <p className="mt-1 text-sm">{data.problemTitle} &#183; {data.status} &#183; {data.passedCases}/{data.totalCases} passed</p>
    </header>
    <div className="grid gap-4 sm:grid-cols-2">
      <MeasurementChart points={points} field="runtimeMs" unit="ms" title={`Runtime by case (median ${formatMeasurement(runtimeMs, 'ms')})`} />
      <MeasurementChart points={points} field="memoryKb" unit="KB" title={`Memory by case (peak ${formatMeasurement(memoryKb, 'KB')})`} />
    </div>
    <p className="text-xs text-slate-400">The runner measures the program and its harness together. Runtime and memory readings can vary between executions.</p>
    <section className="rounded-xl border border-slate-700 p-4">
      <h3 className="font-semibold">Complexity estimate</h3>
      {data.measurementVersion === 1 && data.isAiEvaluated && data.timeComplexity && data.spaceComplexity ? <dl className="mt-2 space-y-2 text-sm">
        <div><dt className="font-semibold">Time {data.timeComplexity}</dt><dd>{data.timeExplanation}</dd></div>
        <div><dt className="font-semibold">Space {data.spaceComplexity}</dt><dd>{data.spaceExplanation}</dd></div>
      </dl> : <p className="mt-2 text-sm text-slate-400">No code-based estimate available.</p>}
    </section>
    {data.testCasesResults.some(item => item.isSample) && <section className="space-y-3">
      <h3 className="font-semibold">Public sample results</h3>
      <div className="flex flex-wrap gap-2">
        {data.testCasesResults.filter(item => item.isSample).map(item => <button type="button" key={item.caseIndex} aria-pressed={selectedCase === item.caseIndex} className="rounded-lg border border-slate-700 px-3 py-2 text-sm" onClick={() => setSelectedCase(item.caseIndex)}>Sample {item.caseIndex + 1} {item.passed ? 'passed' : 'failed'}</button>)}
      </div>
      {sample && <div className="rounded-xl bg-slate-900 p-4 text-sm">
        <pre className="whitespace-pre-wrap">{sample.input}</pre>
        <p className="mt-2">Expected: <code>{sample.expectedOutput}</code></p>
        <p>Actual: <code>{sample.actualOutput}</code></p>
        {sample.errorMessage && <pre className="mt-2 whitespace-pre-wrap">{sample.errorMessage}</pre>}
        {!sample.passed && onReportTestCase && <button type="button" className="mt-3 underline" onClick={() => onReportTestCase(sample.caseIndex)}>Report sample issue</button>}
      </div>}
    </section>}
    <div className="flex flex-wrap gap-4 text-sm">
      {onRetry && <button type="button" className="underline" onClick={onRetry}>Back to test cases</button>}
      {onAskAi && <button type="button" className="underline" onClick={() => onAskAi(`Review my ${data.language} solution for ${data.problemTitle} and explain its time and space complexity.`)}>Ask AI to review</button>}
      {onApplyCode && <button type="button" className="underline" onClick={() => onApplyCode(data.submittedCode, data.language)}>Load submitted code</button>}
    </div>
  </div>;
}
