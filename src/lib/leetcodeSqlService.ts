import { SQLProblem, PREDEFINED_SQL_PROBLEMS } from './sqlJudge';
import rawCatalog from '../data/leetcodeSqlCatalog.json';

export interface LeetCodeSqlMeta {
  id: number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  paidOnly: boolean;
  acceptanceRate: string;
  githubPath: string | null;
  tags?: string;
}

const STATIC_CATALOG: LeetCodeSqlMeta[] = rawCatalog as LeetCodeSqlMeta[];
const problemCache = new Map<string, SQLProblem>();

/**
 * Returns all 323+ LeetCode SQL questions instantly from the embedded catalog.
 */
export function getAllLeetCodeSqlProblems(): LeetCodeSqlMeta[] {
  try {
    const cached = localStorage.getItem('edustream_leetcode_sql_catalog_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length >= STATIC_CATALOG.length) {
        return parsed;
      }
    }
  } catch {}
  return STATIC_CATALOG;
}

/**
 * Re-syncs catalog directly from LeetCode Database API and GitHub.
 */
export async function syncLeetCodeSqlCatalog(): Promise<LeetCodeSqlMeta[]> {
  try {
    const lcRes = await fetch('https://leetcode.com/api/problems/database/', {
      signal: AbortSignal.timeout(6000)
    });
    if (!lcRes.ok) return getAllLeetCodeSqlProblems();

    const lcData = await lcRes.json();
    const pairs = lcData?.stat_status_pairs;
    if (!Array.isArray(pairs) || pairs.length === 0) return getAllLeetCodeSqlProblems();

    const existingMap = new Map<number, LeetCodeSqlMeta>();
    for (const item of STATIC_CATALOG) {
      existingMap.set(item.id, item);
    }

    const updated: LeetCodeSqlMeta[] = [];
    for (const p of pairs) {
      const id = Number(p.stat.frontend_question_id);
      const existing = existingMap.get(id);
      const diff = p.difficulty.level === 1 ? 'Easy' : p.difficulty.level === 2 ? 'Medium' : 'Hard';
      const acc = p.stat.total_submitted > 0
        ? ((p.stat.total_acs / p.stat.total_submitted) * 100).toFixed(1) + '%'
        : (existing?.acceptanceRate || '50.0%');

      updated.push({
        id,
        title: p.stat.question__title || existing?.title || `Question ${id}`,
        slug: p.stat.question__title_slug || existing?.slug || `question-${id}`,
        difficulty: diff,
        paidOnly: Boolean(p.paid_only),
        acceptanceRate: acc,
        githubPath: existing?.githubPath || null,
        tags: existing?.tags || 'Database'
      });
    }

    updated.sort((a, b) => a.id - b.id);
    try {
      localStorage.setItem('edustream_leetcode_sql_catalog_cache', JSON.stringify(updated));
    } catch {}
    return updated;
  } catch (err) {
    console.warn('[LeetCodeSQLService] Live sync fallback to static catalog:', err);
    return getAllLeetCodeSqlProblems();
  }
}

/**
 * Find SQL problem metadata by title slug.
 */
export function getSqlProblemMetaBySlug(slugOrTitle: string): LeetCodeSqlMeta | undefined {
  if (!slugOrTitle) return undefined;
  const clean = slugOrTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const catalog = getAllLeetCodeSqlProblems();

  // 1. Direct slug match
  let found = catalog.find(p => p.slug === clean);
  if (found) return found;

  // 2. Numeric ID prefix match (e.g. "175-combine-two-tables")
  const idMatch = clean.match(/^(\d+)/);
  if (idMatch) {
    const numId = parseInt(idMatch[1], 10);
    found = catalog.find(p => p.id === numId);
    if (found) return found;
  }

  // 3. Substring match
  found = catalog.find(p => clean.includes(p.slug) || p.slug.includes(clean));
  return found;
}

/**
 * Parses raw LeetCode markdown into an interactive AlaSQL executable SQLProblem.
 */
export function parseSqlProblemFromMarkdown(
  md: string,
  solutionSqlRaw: string,
  item: LeetCodeSqlMeta
): SQLProblem {
  // 1. Extract Description
  const descMatch = md.match(/<!--\s*description:start\s*-->([\s\S]*?)<!--\s*description:end\s*-->/i);
  let rawDesc = descMatch ? descMatch[1] : md;

  // Clean description HTML to clean markdown
  const cleanDesc = rawDesc
    .replace(/<strong class="example">Example (\d+):<\/strong>/gi, '### Example $1')
    .replace(/<strong>(Input|Output|Explanation):<\/strong>/gi, '**$1:**')
    .replace(/<p>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre>/gi, '\n```text\n')
    .replace(/<\/pre>/gi, '\n```\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();

  // 2. Extract Table Schemas
  const tables: Array<{
    tableName: string;
    schema: Array<{ column: string; type: string }>;
    rows: any[][];
  }> = [];

  const tableDefRegex = /Table:\s*(?:<code>|`)([A-Za-z0-9_]+)(?:<\/code>|`)[\s\S]*?(?:<pre>|```text)([\s\S]*?)(?:<\/pre>|```)/gi;
  let tMatch;
  while ((tMatch = tableDefRegex.exec(rawDesc)) !== null) {
    const tableName = tMatch[1];
    const block = tMatch[2];
    const lines = block.split('\n');
    const schema: Array<{ column: string; type: string }> = [];

    for (const line of lines) {
      const colM = line.match(/^\|\s*([A-Za-z0-9_]+)\s*\|\s*([A-Za-z0-9_()]+)\s*\|/);
      if (colM) {
        const colName = colM[1].trim();
        const rawType = colM[2].trim().toLowerCase();
        if (colName.toLowerCase() !== 'column' && colName.toLowerCase() !== 'column name') {
          let colType = 'STRING';
          if (rawType.includes('int') || rawType.includes('bigint') || rawType.includes('numeric')) {
            colType = 'INT';
          } else if (rawType.includes('float') || rawType.includes('double') || rawType.includes('decimal')) {
            colType = 'FLOAT';
          } else if (rawType.includes('date') || rawType.includes('time')) {
            colType = 'STRING';
          } else if (rawType.includes('bool')) {
            colType = 'BOOLEAN';
          }
          schema.push({ column: colName, type: colType });
        }
      }
    }

    if (schema.length > 0 && !tables.some(t => t.tableName.toLowerCase() === tableName.toLowerCase())) {
      tables.push({ tableName, schema, rows: [] });
    }
  }

  // 3. Extract Example Inputs for Table Rows
  const inputMatch = rawDesc.match(/(?:<strong>Input:<\/strong>|Input:)([\s\S]*?)(?:<strong>Output:<\/strong>|Output:|<\/pre>|```)/i);
  const inputBlock = inputMatch ? inputMatch[1] : '';

  if (inputBlock && tables.length > 0) {
    for (const t of tables) {
      const lines = inputBlock.split('\n');
      let foundThisTable = tables.length === 1;
      let headerPassed = false;
      let headersRead = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (
          line.toLowerCase().includes(`${t.tableName.toLowerCase()} table:`) ||
          line.toLowerCase().startsWith(`${t.tableName.toLowerCase()}:`)
        ) {
          foundThisTable = true;
          headerPassed = false;
          headersRead = false;
          continue;
        }
        if (!foundThisTable) continue;

        // If another table header is reached, stop for this table
        const otherTableHit = tables.some(
          ot =>
            ot.tableName !== t.tableName &&
            (line.toLowerCase().includes(`${ot.tableName.toLowerCase()} table:`) ||
              line.toLowerCase().startsWith(`${ot.tableName.toLowerCase()}:`))
        );
        if (otherTableHit) {
          foundThisTable = false;
          continue;
        }

        if (line.includes('+---')) {
          if (!headersRead) {
            // top border
          } else {
            // border after column headers
            headerPassed = true;
          }
          continue;
        }

        if (line.trim().startsWith('|')) {
          if (!headersRead) {
            headersRead = true;
            continue;
          }
          if (headerPassed) {
            const rawCells = line
              .split('|')
              .slice(1, -1)
              .map(c => c.trim());
            if (rawCells.length > 0 && !rawCells.every(c => c === '')) {
              const parsedCells = rawCells.map((cell, idx) => {
                const col = t.schema[idx];
                const lower = cell.toLowerCase();
                if (lower === 'null' || lower === 'none' || lower === '') return null;
                if (col && col.type === 'INT') {
                  const num = parseInt(cell, 10);
                  return isNaN(num) ? cell : num;
                }
                if (col && col.type === 'FLOAT') {
                  const flt = parseFloat(cell);
                  return isNaN(flt) ? cell : flt;
                }
                return cell;
              });
              t.rows.push(parsedCells);
            }
          }
        }
      }
    }
  }

  // Fallback: if no tables parsed, provide default schema
  if (tables.length === 0) {
    tables.push({
      tableName: 'Data',
      schema: [
        { column: 'id', type: 'INT' },
        { column: 'value', type: 'STRING' }
      ],
      rows: [
        [1, 'Example A'],
        [2, 'Example B']
      ]
    });
  }

  // 4. Generate setupSql
  let setupSql = '';
  for (const t of tables) {
    const colDefs = t.schema.map(c => `[${c.column}] ${c.type}`).join(', ');
    setupSql += `CREATE TABLE [${t.tableName}] (${colDefs});\n`;
    if (t.rows.length > 0) {
      const valStrings = t.rows
        .map(row => {
          const rowVals = row
            .map(v => {
              if (v === null || v === undefined) return 'null';
              if (typeof v === 'number') return v;
              return `'${String(v).replace(/'/g, "''")}'`;
            })
            .join(', ');
          return `(${rowVals})`;
        })
        .join(', ');
      setupSql += `INSERT INTO [${t.tableName}] VALUES ${valStrings};\n`;
    }
  }

  // 5. Solution SQL
  let cleanSolution = solutionSqlRaw
    .replace(/^#\s*Write your .*$/gim, '')
    .replace(/^--\s*Write your .*$/gim, '')
    .trim();

  if (!cleanSolution) {
    cleanSolution = `SELECT * FROM [${tables[0]?.tableName || 'Data'}];`;
  }

  // 6. Starter SQL
  const starterSql = `-- Write your PostgreSQL/MySQL query statement below\n-- Problem: ${item.id}. ${item.title}\n\nSELECT \n    \nFROM [${tables[0]?.tableName || 'Data'}];\n`;

  return {
    id: `sql-${item.id}`,
    title: `${item.id}. ${item.title}`,
    category: 'DBMS & SQL',
    difficulty: item.difficulty,
    description: cleanDesc,
    tables,
    setupSql,
    starterSql,
    solutionSql: cleanSolution,
    testCases: [
      {
        name: 'Case 1: Standard Example',
        setupSql,
        tables
      }
    ]
  };
}

/**
 * Fetches authentic problem details, tables, schema, and solution from GitHub / LeetCode.
 * First checks rich predefined problems, then local cache, then fetches live from GitHub.
 */
export async function fetchSqlProblemDetails(item: LeetCodeSqlMeta): Promise<SQLProblem> {
  const cacheKey = `sql_problem_${item.id}_${item.slug}`;

  // 1. In-memory cache
  if (problemCache.has(cacheKey)) {
    return problemCache.get(cacheKey)!;
  }

  // 2. Predefined rich presets in PREDEFINED_SQL_PROBLEMS
  const normSlug = item.slug.replace(/[^a-z0-9]/g, '');
  for (const [key, preset] of Object.entries(PREDEFINED_SQL_PROBLEMS)) {
    if (
      key === normSlug ||
      preset.id === `sql-${item.id}` ||
      preset.title.toLowerCase().replace(/[^a-z0-9]/g, '') === normSlug
    ) {
      problemCache.set(cacheKey, preset);
      return preset;
    }
  }

  // 3. Check localStorage cache
  try {
    const stored = localStorage.getItem(`edustream_sql_parsed_${item.slug}`);
    if (stored) {
      const parsed: SQLProblem = JSON.parse(stored);
      if (parsed && parsed.tables && parsed.setupSql) {
        problemCache.set(cacheKey, parsed);
        return parsed;
      }
    }
  } catch {}

  // 4. Fetch from GitHub doocs/leetcode
  if (item.githubPath) {
    try {
      const mdUrl = `https://raw.githubusercontent.com/doocs/leetcode/main${item.githubPath}`;
      const sqlUrl = `https://raw.githubusercontent.com/doocs/leetcode/main${item.githubPath.replace(/README(_EN)?\.md$/, 'Solution.sql')}`;

      const [mdRes, sqlRes] = await Promise.all([
        fetch(mdUrl, { signal: AbortSignal.timeout(6000) }),
        fetch(sqlUrl, { signal: AbortSignal.timeout(6000) }).catch(() => null)
      ]);

      if (mdRes.ok) {
        const mdText = await mdRes.text();
        const sqlText = sqlRes && sqlRes.ok ? await sqlRes.text() : '';
        const parsed = parseSqlProblemFromMarkdown(mdText, sqlText, item);

        problemCache.set(cacheKey, parsed);
        try {
          localStorage.setItem(`edustream_sql_parsed_${item.slug}`, JSON.stringify(parsed));
        } catch {}
        return parsed;
      }
    } catch (fetchErr) {
      console.warn(`[LeetCodeSQLService] Error fetching problem ${item.id} from GitHub:`, fetchErr);
    }
  }

  // 5. Fallback synthetic problem if offline or not in GitHub
  const fallbackProblem: SQLProblem = {
    id: `sql-${item.id}`,
    title: `${item.id}. ${item.title}`,
    category: 'DBMS & SQL',
    difficulty: item.difficulty,
    description: `### ${item.id}. ${item.title}

Write an SQL query to solve the relational requirements for **${item.title}** (LeetCode #${item.id}).

**Difficulty:** ${item.difficulty}  
**Acceptance Rate:** ${item.acceptanceRate}  
**Tags:** ${item.tags || 'Database'}

### Schema
**Records** table:
| Column Name | Type |
| :--- | :--- |
| id | int |
| value | varchar |
| score | int |

### Example
**Input:**
Records table:
| id | value | score |
| :--- | :--- | :--- |
| 1 | Alpha | 100 |
| 2 | Beta | 85 |
| 3 | Gamma | 92 |

**Output:**
| id | value |
| :--- | :--- |
| 1 | Alpha |
`,
    tables: [
      {
        tableName: 'Records',
        schema: [
          { column: 'id', type: 'INT' },
          { column: 'value', type: 'STRING' },
          { column: 'score', type: 'INT' }
        ],
        rows: [
          [1, 'Alpha', 100],
          [2, 'Beta', 85],
          [3, 'Gamma', 92]
        ]
      }
    ],
    setupSql: `
CREATE TABLE [Records] ([id] INT, [value] STRING, [score] INT);
INSERT INTO [Records] VALUES (1, 'Alpha', 100), (2, 'Beta', 85), (3, 'Gamma', 92);
`,
    starterSql: `-- Write your SQL query statement below
-- Problem: ${item.id}. ${item.title}

SELECT 
    id, 
    value 
FROM Records
ORDER BY score DESC;
`,
    solutionSql: `
SELECT id, value 
FROM Records
ORDER BY score DESC;
`,
    testCases: [
      {
        name: 'Case 1: Standard Evaluation',
        setupSql: `
CREATE TABLE [Records] ([id] INT, [value] STRING, [score] INT);
INSERT INTO [Records] VALUES (1, 'Alpha', 100), (2, 'Beta', 85), (3, 'Gamma', 92);
`,
        tables: [
          {
            tableName: 'Records',
            schema: [
              { column: 'id', type: 'INT' },
              { column: 'value', type: 'STRING' },
              { column: 'score', type: 'INT' }
            ],
            rows: [
              [1, 'Alpha', 100],
              [2, 'Beta', 85],
              [3, 'Gamma', 92]
            ]
          }
        ]
      }
    ]
  };

  problemCache.set(cacheKey, fallbackProblem);
  return fallbackProblem;
}
