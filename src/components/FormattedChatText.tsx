import React, { useState } from 'react';
import { TELEGRAM_BACKEND_URL } from '../lib/telegram';
import { Image as ImageIcon, ZoomIn, X } from 'lucide-react';

interface FormattedChatTextProps {
  text: string;
}

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/<sup>([\s\S]*?)<\/sup>/gi, '^$1')
    .replace(/<sub>([\s\S]*?)<\/sub>/gi, '_$1')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rsquo;/g, '’')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&le;/g, '<=')
    .replace(/&ge;/g, '>=')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&hellip;/g, '...')
    .replace(/&times;/g, '×')
    .replace(/&minus;/g, '-');
}

/**
 * Renders AI chat messages, problem descriptions, diagrams, and schema definitions cleanly.
 * Formats Markdown images, tables, headers, bold text, bullet points, inline code, and code blocks
 * with zero raw markdown symbols (* and #).
 */
export const FormattedChatText: React.FC<FormattedChatTextProps> = ({ text }) => {
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  if (!text) return null;

  const cleanedText = decodeHtmlEntities(text);

  // Pre-process and group lines into blocks (tables, code blocks, paragraphs)
  const rawLines = cleanedText.split('\n');
  const blocks: Array<
    | { type: 'table'; headers: string[]; rows: string[][] }
    | { type: 'code'; code: string; lang?: string }
    | { type: 'image'; src: string; alt: string }
    | { type: 'line'; line: string }
  > = [];

  let i = 0;
  while (i < rawLines.length) {
    const trimmed = rawLines[i].trim();

    // 1. Markdown Image Detection: ![alt](url)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/) || trimmed.match(/<img[^>]+src=["']([^"']+)["'][^>]*\/?>/);
    if (imgMatch) {
      const alt = imgMatch[1] || 'Problem Diagram';
      let src = imgMatch[2] || imgMatch[1];
      if (src.includes('assets.leetcode.com/uploads/')) {
        const relPath = src.split('assets.leetcode.com/uploads/')[1];
        src = `${TELEGRAM_BACKEND_URL}/api/image/${relPath}`;
      }
      blocks.push({ type: 'image', src, alt });
      i++;
      continue;
    }

    // 2. Markdown Table Detection (line starts and ends with | or contains |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
      const tableLines: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith('|') && rawLines[i].trim().endsWith('|')) {
        tableLines.push(rawLines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        // First line is headers
        const headers = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map(h => h.trim().replace(/\*\*/g, ''));

        // Skip separator line (e.g. |:---|:---|)
        let rowStartIdx = 1;
        if (tableLines[1].replace(/[\s\:\-\|]/g, '').length === 0) {
          rowStartIdx = 2;
        }

        const rows: string[][] = [];
        for (let r = rowStartIdx; r < tableLines.length; r++) {
          const cells = tableLines[r]
            .split('|')
            .slice(1, -1)
            .map(c => c.trim().replace(/\*\*/g, ''));
          rows.push(cells);
        }

        blocks.push({ type: 'table', headers, rows });
        continue;
      } else {
        blocks.push({ type: 'line', line: tableLines[0] });
        continue;
      }
    }

    // 3. Code Blocks (```...```)
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < rawLines.length && !rawLines[i].trim().startsWith('```')) {
        codeLines.push(rawLines[i]);
        i++;
      }
      if (i < rawLines.length) i++; // skip closing ```
      blocks.push({ type: 'code', code: codeLines.join('\n'), lang });
      continue;
    }

    // 4. Regular lines
    blocks.push({ type: 'line', line: rawLines[i] });
    i++;
  }

  const renderInlineParts = (str: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /(!\[([^\]]*)\]\(([^)]+)\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }

      const raw = match[0];
      if (raw.startsWith('![') && raw.endsWith(')')) {
        const alt = match[2] || 'Diagram';
        let src = match[3];
        if (src.includes('assets.leetcode.com/uploads/')) {
          const relPath = src.split('assets.leetcode.com/uploads/')[1];
          src = `${TELEGRAM_BACKEND_URL}/api/image/${relPath}`;
        }
        parts.push(
          <span key={match.index} className="inline-block my-2">
            <img
              src={src}
              alt={alt}
              referrerPolicy="no-referrer"
              className="rounded-xl border border-slate-800 max-h-56 object-contain bg-slate-900 shadow-md inline-block"
              loading="lazy"
            />
          </span>
        );
      } else if (raw.startsWith('**') && raw.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-bold text-slate-100">
            {raw.slice(2, -2)}
          </strong>
        );
      } else if (raw.startsWith('`') && raw.endsWith('`')) {
        parts.push(
          <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300 font-mono text-[11px]">
            {raw.slice(1, -1)}
          </code>
        );
      } else if (raw.startsWith('*') && raw.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-slate-200">
            {raw.slice(1, -1)}
          </em>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="space-y-2 select-text font-sans">
      {blocks.map((block, bIdx) => {
        if (block.type === 'image') {
          return (
            <div key={bIdx} className="my-3 flex flex-col items-center group">
              <div 
                onClick={() => setZoomImage(block.src)}
                className="p-2 sm:p-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden max-w-full cursor-zoom-in relative transition-transform hover:scale-[1.01]"
                title="Click to zoom illustration"
              >
                <img
                  src={block.src}
                  alt={block.alt}
                  referrerPolicy="no-referrer"
                  className="rounded-xl max-h-72 object-contain bg-slate-900/90 border border-slate-800/80 mx-auto"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to direct LeetCode URL if proxy fails
                    const target = e.currentTarget;
                    if (target.src.includes('/api/image/')) {
                      const rel = target.src.split('/api/image/')[1];
                      target.src = `https://assets.leetcode.com/uploads/${rel}`;
                    }
                  }}
                />
                <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-3.5 h-3.5" />
                </div>
              </div>
              {block.alt && block.alt.toLowerCase() !== 'example' && (
                <span className="text-[10px] font-mono text-slate-400 mt-1.5 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-purple-400" /> {block.alt}
                </span>
              )}
            </div>
          );
        }

        if (block.type === 'table') {
          return (
            <div key={bIdx} className="my-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner max-w-full">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-300">
                    <tr>
                      {block.headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-3.5 py-2 font-bold tracking-wider text-cyan-300">
                          {renderInlineParts(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {block.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-1.5">
                            {renderInlineParts(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        if (block.type === 'code') {
          return (
            <div key={bIdx} className="my-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
              <pre>{block.code}</pre>
            </div>
          );
        }

        let trimmed = block.line.trim();
        if (!trimmed) {
          return <div key={bIdx} className="h-1.5" />;
        }

        // Dividers
        if (/^(\-\-\-|\*\*\*|___)$/.test(trimmed)) {
          return <hr key={bIdx} className="border-slate-800 my-2" />;
        }

        // Headings
        if (trimmed.startsWith('#')) {
          const cleanHeading = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/\*/g, '');
          return (
            <h4 key={bIdx} className="text-xs font-bold text-indigo-300 mt-3 mb-1 uppercase tracking-wider flex items-center gap-1.5">
              <span>{cleanHeading}</span>
            </h4>
          );
        }

        // Bullet points
        const isBullet = /^(\-|\*|•)\s+/.test(trimmed);
        if (isBullet) {
          trimmed = trimmed.replace(/^(\-|\*|•)\s+/, '');
          return (
            <div key={bIdx} className="flex items-start space-x-2 my-1">
              <span className="text-purple-400 font-bold text-xs mt-0.5">•</span>
              <div className="flex-1 text-slate-200 text-xs leading-relaxed">
                {renderInlineParts(trimmed)}
              </div>
            </div>
          );
        }

        return (
          <p key={bIdx} className="text-xs text-slate-200 leading-relaxed my-1">
            {renderInlineParts(trimmed)}
          </p>
        );
      })}

      {/* Lightbox / Zoom Modal */}
      {zoomImage && (
        <div 
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-w-4xl max-h-[85vh] p-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-slate-700 shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={zoomImage}
              alt="Zoomed Diagram"
              referrerPolicy="no-referrer"
              className="rounded-xl max-h-[75vh] max-w-full object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
