import React, { useMemo, useState } from 'react';
import { Copy, Check, Terminal, ExternalLink, Table } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  /**
   * Parses inline formatting: **bold**, *italic*, `code`, [link](url), ~~strikethrough~~, badges.
   */
  const renderInline = (str: string): React.ReactNode[] => {
    if (!str) return [];
    const parts: React.ReactNode[] = [];
    const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|~~[^~]+~~)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }

      const raw = match[0];

      // 1. Link [text](url)
      if (raw.startsWith('[') && raw.endsWith(')')) {
        const text = match[2];
        const url = match[3];
        parts.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 font-semibold transition-colors inline-flex items-center gap-0.5"
          >
            <span>{text}</span>
            <ExternalLink className="w-3 h-3 inline-block ml-0.5 opacity-70" />
          </a>
        );
      }
      // 2. Bold **text**
      else if (raw.startsWith('**') && raw.endsWith('**')) {
        const inner = raw.slice(2, -2);
        parts.push(
          <strong key={match.index} className="font-bold text-slate-100">
            {inner}
          </strong>
        );
      }
      // 3. Inline Code `code`
      else if (raw.startsWith('`') && raw.endsWith('`')) {
        parts.push(
          <code key={match.index} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-900 border border-slate-800 text-purple-300 font-mono text-[0.9em]">
            {raw.slice(1, -1)}
          </code>
        );
      }
      // 4. Italic *text*
      else if (raw.startsWith('*') && raw.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-slate-200">
            {raw.slice(1, -1)}
          </em>
        );
      }
      // 5. Strikethrough ~~text~~
      else if (raw.startsWith('~~') && raw.endsWith('~~')) {
        parts.push(
          <del key={match.index} className="line-through text-slate-500">
            {raw.slice(2, -2)}
          </del>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts;
  };

  /**
   * Helper to split markdown table line with escaped pipe protection
   */
  const splitTableLine = (line: string): string[] => {
    return line
      .split(/(?<!\\)\|/)
      .map(c => c.trim().replace(/\\\|/g, '|'))
      .filter((c, idx, arr) => (idx > 0 && idx < arr.length - 1) || c.length > 0);
  };

  /**
   * Parses structured blocks (tables, headings, code blocks, lists, blockquotes, horizontal rules).
   */
  const renderedElements = useMemo(() => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;
    let codeBlockCount = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Empty line
      if (!trimmed) {
        i++;
        continue;
      }

      // Horizontal Rule (---, ***, ___)
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        elements.push(<hr key={`hr-${i}`} className="border-t border-slate-800 my-4" />);
        i++;
        continue;
      }

      // ── Markdown Table Detection ──
      // Look for lines containing pipes `|` that look like a table
      if (trimmed.startsWith('|') || (trimmed.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---'))) {
        const tableLines: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('|') || lines[i].trim().includes('|'))) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const rawHeader = tableLines[0];
          const headers = splitTableLine(rawHeader);

          const dataRows: string[][] = [];
          for (let r = 1; r < tableLines.length; r++) {
            const rowStr = tableLines[r];
            // Skip markdown table divider line (e.g. |---|---| or |:---|:---:|)
            if (/^\|?(\s*:?-+:?\s*\|)+\s*$/.test(rowStr) || rowStr.replace(/[|\s-:]/g, '') === '') {
              continue;
            }
            const cols = splitTableLine(rowStr);
            if (cols.length > 0) {
              dataRows.push(cols);
            }
          }

          elements.push(
            <div key={`table-${i}`} className="overflow-x-auto my-4 rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-purple-300 font-bold uppercase tracking-wider text-[11px]">
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="py-3 px-4 font-mono">
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dataRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/60 transition-colors">
                      {row.map((cell, cIdx) => {
                        // Highlight score cells with a colored badge
                        const isScore = /\b\d{1,3}\s*\/\s*100\b/.test(cell);
                        return (
                          <td key={cIdx} className="py-2.5 px-4 text-slate-300 font-sans leading-relaxed">
                            {isScore ? (
                              <span className="px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-800/80 text-purple-300 font-mono font-bold text-xs inline-block">
                                {renderInline(cell)}
                              </span>
                            ) : (
                              renderInline(cell)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Headings (# H1, ## H2, ### H3, #### H4)
      const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];

        if (level === 1) {
          elements.push(
            <h1 key={`h1-${i}`} className="text-xl sm:text-2xl font-black text-slate-100 pt-4 pb-2 border-b border-slate-800/80 tracking-tight flex items-center gap-2">
              <span className="text-purple-400">#</span>
              <span>{renderInline(text)}</span>
            </h1>
          );
        } else if (level === 2) {
          elements.push(
            <h2 key={`h2-${i}`} className="text-lg sm:text-xl font-extrabold text-slate-100 pt-4 pb-1.5 border-b border-slate-800/60 tracking-tight flex items-center gap-2">
              <span className="text-indigo-400">##</span>
              <span>{renderInline(text)}</span>
            </h2>
          );
        } else if (level === 3) {
          elements.push(
            <h3 key={`h3-${i}`} className="text-base sm:text-lg font-bold text-indigo-200 pt-3 pb-1 tracking-tight flex items-center gap-1.5">
              <span className="text-sky-400">###</span>
              <span>{renderInline(text)}</span>
            </h3>
          );
        } else {
          elements.push(
            <h4 key={`h4-${i}`} className="text-sm font-bold text-purple-300 pt-2 pb-0.5">
              {renderInline(text)}
            </h4>
          );
        }
        i++;
        continue;
      }

      // Fenced Code Blocks (```lang ... ```)
      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3).trim() || 'text';
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++; // Skip closing ```

        const fullCode = codeLines.join('\n');
        const currentIdx = codeBlockCount++;

        elements.push(
          <div key={`code-${i}`} className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl my-3">
            <div className="h-8 px-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-purple-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-purple-400" />
                <span>{lang}</span>
              </span>
              <button
                onClick={() => handleCopy(fullCode, currentIdx)}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer text-[11px]"
              >
                {copiedIdx === currentIdx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-xs font-mono text-emerald-300/90 leading-relaxed custom-scrollbar">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        continue;
      }

      // Blockquotes (> quote)
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
          i++;
        }
        elements.push(
          <blockquote key={`quote-${i}`} className="border-l-4 border-purple-500 bg-purple-950/20 pl-4 py-2 my-3 rounded-r-2xl text-slate-300 italic text-xs sm:text-sm">
            {quoteLines.map((ql, qIdx) => (
              <p key={qIdx} className="my-1">{renderInline(ql)}</p>
            ))}
          </blockquote>
        );
        continue;
      }

      // Unordered Lists (- item, * item, or emojis like ✅, ❌, 📌, 🎯, ⚡)
      if (
        trimmed.match(/^[-*+]\s+/) ||
        trimmed.startsWith('✅') ||
        trimmed.startsWith('❌') ||
        trimmed.startsWith('📌') ||
        trimmed.startsWith('🎯') ||
        trimmed.startsWith('⚡') ||
        trimmed.startsWith('🚨') ||
        trimmed.startsWith('🔄') ||
        trimmed.startsWith('🛠️') ||
        trimmed.startsWith('🏆')
      ) {
        const listItems: string[] = [];
        while (
          i < lines.length &&
          (lines[i].trim().match(/^[-*+]\s+/) ||
           lines[i].trim().startsWith('✅') ||
           lines[i].trim().startsWith('❌') ||
           lines[i].trim().startsWith('📌') ||
           lines[i].trim().startsWith('🎯') ||
           lines[i].trim().startsWith('⚡') ||
           lines[i].trim().startsWith('🚨') ||
           lines[i].trim().startsWith('🔄') ||
           lines[i].trim().startsWith('🛠️') ||
           lines[i].trim().startsWith('🏆'))
        ) {
          listItems.push(lines[i].trim().replace(/^[-*+]\s+/, ''));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="space-y-1.5 my-2.5 pl-1 list-none text-xs sm:text-sm">
            {listItems.map((li, lIdx) => (
              <li key={lIdx} className="flex items-start gap-2 text-slate-200 leading-relaxed">
                {!li.startsWith('✅') && !li.startsWith('❌') && !li.startsWith('📌') && !li.startsWith('🎯') && !li.startsWith('⚡') && !li.startsWith('🚨') && !li.startsWith('🔄') && !li.startsWith('🛠️') && !li.startsWith('🏆') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                )}
                <span className="flex-1">{renderInline(li)}</span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered Lists (1. item)
      if (trimmed.match(/^\d+\.\s+/)) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
          i++;
        }
        elements.push(
          <ol key={`ol-${i}`} className="space-y-1.5 my-2.5 pl-1 list-none text-xs sm:text-sm">
            {listItems.map((li, lIdx) => (
              <li key={lIdx} className="flex items-start gap-2 text-slate-200 leading-relaxed">
                <span className="font-mono text-xs font-bold text-indigo-400 mt-0.5 flex-shrink-0">{lIdx + 1}.</span>
                <span className="flex-1">{renderInline(li)}</span>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Paragraphs
      const paraLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].trim().match(/^(#{1,4})\s+/) &&
        !lines[i].trim().startsWith('```') &&
        !lines[i].trim().startsWith('>') &&
        !lines[i].trim().match(/^[-*+]\s+/) &&
        !lines[i].trim().match(/^\d+\.\s+/) &&
        lines[i].trim() !== '---' &&
        !lines[i].trim().startsWith('|') &&
        !lines[i].trim().startsWith('✅') &&
        !lines[i].trim().startsWith('❌') &&
        !lines[i].trim().startsWith('📌') &&
        !lines[i].trim().startsWith('🎯')
      ) {
        paraLines.push(lines[i].trim());
        i++;
      }

      if (paraLines.length > 0) {
        elements.push(
          <p key={`p-${i}`} className="text-slate-200 text-xs sm:text-sm leading-relaxed my-2">
            {renderInline(paraLines.join(' '))}
          </p>
        );
      }
    }

    return elements;
  }, [content]);

  return (
    <div className={`space-y-1 select-text font-sans leading-relaxed ${className}`}>
      {renderedElements}
    </div>
  );
};
