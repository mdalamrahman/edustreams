// src/workers/sqlWorker.ts — Isolated Web Worker for AlaSQL
import alasql from 'alasql';

// Lockdown network egress inside the worker to prevent data exfiltration
try {
  (self as any).fetch = undefined;
  (self as any).XMLHttpRequest = undefined;
  (self as any).WebSocket = undefined;
} catch {}

// Register standard SQL compatibility polyfills
try {
  if (!(alasql as any).fn.DATEDIFF) {
    (alasql as any).fn.DATEDIFF = (d1: string, d2: string) =>
      Math.round((new Date(d1).getTime() - new Date(d2).getTime()) / 86400000);
  }
  if (!(alasql as any).fn.IFNULL) {
    (alasql as any).fn.IFNULL = (val: any, fallback: any) =>
      (val === null || val === undefined ? fallback : val);
  }
} catch {}

self.onmessage = (e: MessageEvent) => {
  const { runId, setupSql, solutionSql, userSql, isOrdered } = e.data;
  const safeId = String(runId || 'run_' + Math.random().toString(36).substring(2, 9)).replace(/[^a-zA-Z0-9_]/g, '');
  const dbName = `sandbox_${safeId}`;

  // Block dangerous AlaSQL JS-eval backticks and file-loader functions
  if (/[`]|FROM\s+(XLSX|CSV|JSON|TXT|HTML)\s*\(/i.test(userSql) || /\b(?:REQUIRE|EVAL|IMPORT)\b/i.test(userSql)) {
    self.postMessage({
      status: 'SYNTAX_ERROR',
      errorMessage: 'Disallowed expression or external function in SQL query.'
    });
    return;
  }

  const startTime = Date.now();

  try {
    alasql(`CREATE DATABASE ${dbName}`);
    alasql(`USE ${dbName}`);

    const statements = (setupSql || '')
      .split(';')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    for (const stmt of statements) {
      alasql(stmt);
    }

    let expectedRaw: any = [];
    try {
      expectedRaw = alasql(solutionSql);
    } catch (solErr: any) {
      console.warn('[SQL Worker] Solution execution warning:', solErr);
    }

    const expectedColumns = Array.isArray(expectedRaw) && expectedRaw.length > 0
      ? Object.keys(expectedRaw[0])
      : [];

    const expectedRows = Array.isArray(expectedRaw)
      ? expectedRaw.map((obj: any) => expectedColumns.map(col => obj[col]))
      : [];

    const userCleanSql = (userSql || '').trim().replace(/;+$/, '');
    let userRaw: any = [];
    try {
      userRaw = alasql(userCleanSql);
    } catch (syntaxErr: any) {
      const elapsed = Date.now() - startTime;
      self.postMessage({
        status: 'SYNTAX_ERROR',
        executionTimeMs: elapsed,
        expectedColumns,
        expectedRows,
        errorMessage: syntaxErr?.message || 'SQL Syntax Error'
      });
      return;
    }

    const userColumns = Array.isArray(userRaw) && userRaw.length > 0
      ? Object.keys(userRaw[0])
      : (typeof userRaw === 'object' && userRaw !== null ? Object.keys(userRaw) : []);

    const userRows = Array.isArray(userRaw)
      ? userRaw.map((obj: any) => userColumns.map(col => obj[col]))
      : [];

    const elapsed = Date.now() - startTime;

    const isColsMatch = userColumns.length === expectedColumns.length &&
      userColumns.every((c, i) => c.toLowerCase() === expectedColumns[i].toLowerCase());

    const normalizeRow = (r: any[]) => JSON.stringify(r.map(v => v === undefined || v === null ? null : String(v).trim()));

    let isRowsMatch = false;
    if (userRows.length === expectedRows.length) {
      if (isOrdered) {
        isRowsMatch = userRows.every((r, idx) => normalizeRow(r) === normalizeRow(expectedRows[idx]));
      } else {
        const sortedUser = [...userRows].map(normalizeRow).sort();
        const sortedExpected = [...expectedRows].map(normalizeRow).sort();
        isRowsMatch = sortedUser.every((r, idx) => r === sortedExpected[idx]);
      }
    }

    const status = (isColsMatch && isRowsMatch) ? 'ACCEPTED' : 'WRONG_ANSWER';

    self.postMessage({
      status,
      executionTimeMs: elapsed,
      columns: userColumns,
      rows: userRows,
      expectedColumns,
      expectedRows
    });
  } catch (err: any) {
    self.postMessage({
      status: 'SYNTAX_ERROR',
      executionTimeMs: Date.now() - startTime,
      errorMessage: err?.message || 'Database engine exception.'
    });
  } finally {
    try {
      alasql('USE alasql');
      alasql(`DROP DATABASE IF EXISTS ${dbName}`);
      if ((alasql as any).databases) {
        delete (alasql as any).databases[dbName];
      }
    } catch (_) {}
  }
};
