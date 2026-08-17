import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  Github, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  ChevronRight, 
  ListOrdered, 
  Sparkles, 
  Clock, 
  Type, 
  ArrowUp,
  Search
} from 'lucide-react';
import { CuratedLLDTopic } from '../lib/githubLld';

interface GitHubArticleReaderProps {
  topic: CuratedLLDTopic;
  markdown: string;
  isLoading: boolean;
}

interface ChapterHeading {
  id: string;
  title: string;
  level: number; // 1, 2, 3
}

export const GitHubArticleReader: React.FC<GitHubArticleReaderProps> = ({
  topic,
  markdown,
  isLoading
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [activeChapterId, setActiveChapterId] = useState<string>('');
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [tocSearch, setTocSearch] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate Reading Time & Word Count
  const readingStats = useMemo(() => {
    if (!markdown) return { words: 0, mins: 1 };
    const words = markdown.trim().split(/\s+/).length;
    const mins = Math.max(1, Math.ceil(words / 220));
    return { words, mins };
  }, [markdown]);

  // Extract Chapter Headings for Table of Contents (TOC)
  const chapters: ChapterHeading[] = useMemo(() => {
    if (!markdown) return [];
    const lines = markdown.split('\n');
    const headings: ChapterHeading[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      const match = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const rawTitle = match[2].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '').trim();
        const id = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (rawTitle && id) {
          headings.push({ id, title: rawTitle, level });
        }
      }
    });

    return headings;
  }, [markdown]);

  const filteredChapters = useMemo(() => {
    if (!tocSearch) return chapters;
    return chapters.filter(c => c.title.toLowerCase().includes(tocSearch.toLowerCase()));
  }, [chapters, tocSearch]);

  const scrollToChapter = (id: string) => {
    setActiveChapterId(id);
    const el = document.getElementById(`heading-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  /**
   * Renders inline markdown text with clickable links, bold, italic, code, and images.
   */
  const renderInline = (str: string, repo: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    // Matches: [text](url), ![alt](src), **bold**, *italic*, `code`
    const regex = /(!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }

      const raw = match[0];

      // 1. Markdown Image
      if (raw.startsWith('![') && raw.endsWith(')')) {
        const alt = match[2] || 'Diagram';
        let src = match[3];
        if (!src.startsWith('http://') && !src.startsWith('https://')) {
          src = `https://raw.githubusercontent.com/${repo}/master/${src.replace(/^\.\//, '')}`;
        }
        parts.push(
          <span key={match.index} className="block my-4 text-center">
            <img
              src={src}
              alt={alt}
              className="rounded-2xl border border-slate-800 max-h-96 mx-auto object-contain bg-slate-900 shadow-xl"
              loading="lazy"
            />
            {alt && alt !== 'Diagram' && (
              <span className="text-[11px] text-slate-400 mt-1 block font-mono">{alt}</span>
            )}
          </span>
        );
      }
      // 2. Clickable Markdown Link [text](url)
      else if (raw.startsWith('[') && raw.endsWith(')')) {
        const linkText = match[4];
        let linkUrl = match[5];

        const isAnchor = linkUrl.startsWith('#');
        const isExternal = linkUrl.startsWith('http://') || linkUrl.startsWith('https://');

        if (!isExternal && !isAnchor) {
          linkUrl = `https://github.com/${repo}/blob/master/${linkUrl.replace(/^\.\//, '')}`;
        }

        parts.push(
          <a
            key={match.index}
            href={linkUrl}
            target={isAnchor ? '_self' : '_blank'}
            rel={isAnchor ? undefined : 'noreferrer'}
            onClick={isAnchor ? (e) => {
              e.preventDefault();
              scrollToChapter(linkUrl.replace('#', ''));
            } : undefined}
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 font-semibold transition-colors inline-flex items-center gap-0.5 cursor-pointer"
          >
            <span>{linkText}</span>
            {isExternal && <ExternalLink className="w-3 h-3 inline-block ml-0.5 opacity-70" />}
          </a>
        );
      }
      // 3. Bold Text **text**
      else if (raw.startsWith('**') && raw.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-bold text-slate-100">
            {raw.slice(2, -2)}
          </strong>
        );
      }
      // 4. Inline Code `code`
      else if (raw.startsWith('`') && raw.endsWith('`')) {
        parts.push(
          <code key={match.index} className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-purple-300 font-mono text-[12px]">
            {raw.slice(1, -1)}
          </code>
        );
      }
      // 5. Italic Text *text*
      else if (raw.startsWith('*') && raw.endsWith('*')) {
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

  /**
   * Parses structured blocks (headings, code blocks, blockquotes, lists, paragraphs, and tables).
   */
  const renderedBlocks = useMemo(() => {
    if (!markdown) return null;

    const rawLines = markdown.split('\n');
    const blocks: React.ReactNode[] = [];
    let lineIdx = 0;
    let codeBlockCount = 0;

    while (lineIdx < rawLines.length) {
      const line = rawLines[lineIdx];
      const trimmed = line.trim();

      // 1. Skip Empty Lines
      if (!trimmed) {
        lineIdx++;
        continue;
      }

      // 2. Headings (# H1, ## H2, ### H3)
      const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const rawTitle = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '').trim();
        const id = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        if (level === 1) {
          blocks.push(
            <h1
              key={lineIdx}
              id={`heading-${id}`}
              className="text-2xl sm:text-3xl font-black text-slate-100 pt-6 pb-2 border-b border-slate-800 tracking-tight flex items-center gap-2"
            >
              <span className="text-purple-400">#</span>
              <span>{renderInline(text, topic.repo)}</span>
            </h1>
          );
        } else if (level === 2) {
          blocks.push(
            <h2
              key={lineIdx}
              id={`heading-${id}`}
              className="text-xl sm:text-2xl font-extrabold text-slate-100 pt-6 pb-2 border-b border-slate-800/80 tracking-tight flex items-center gap-2"
            >
              <span className="text-indigo-400">##</span>
              <span>{renderInline(text, topic.repo)}</span>
            </h2>
          );
        } else if (level === 3) {
          blocks.push(
            <h3
              key={lineIdx}
              id={`heading-${id}`}
              className="text-base sm:text-lg font-bold text-indigo-200 pt-4 pb-1 tracking-tight flex items-center gap-1.5"
            >
              <span className="text-sky-400">###</span>
              <span>{renderInline(text, topic.repo)}</span>
            </h3>
          );
        } else {
          blocks.push(
            <h4 key={lineIdx} id={`heading-${id}`} className="text-sm font-bold text-purple-300 pt-2">
              {renderInline(text, topic.repo)}
            </h4>
          );
        }
        lineIdx++;
        continue;
      }

      // 3. Fenced Code Blocks (```lang ... ```)
      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3).trim() || 'code';
        const codeLines: string[] = [];
        lineIdx++;
        while (lineIdx < rawLines.length && !rawLines[lineIdx].trim().startsWith('```')) {
          codeLines.push(rawLines[lineIdx]);
          lineIdx++;
        }
        if (lineIdx < rawLines.length) lineIdx++; // Skip closing ```

        const fullCode = codeLines.join('\n');
        const currentIdx = codeBlockCount++;

        blocks.push(
          <div key={`code-${lineIdx}`} className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl my-4">
            <div className="h-9 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-purple-300 font-bold uppercase">{lang}</span>
              <button
                onClick={() => handleCopyCode(fullCode, currentIdx)}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {copiedCodeIdx === currentIdx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        continue;
      }

      // 4. Blockquotes (> ...)
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [];
        while (lineIdx < rawLines.length && rawLines[lineIdx].trim().startsWith('>')) {
          quoteLines.push(rawLines[lineIdx].trim().replace(/^>\s?/, ''));
          lineIdx++;
        }
        blocks.push(
          <blockquote
            key={`quote-${lineIdx}`}
            className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-transparent border-l-4 border-indigo-500 text-slate-300 text-xs sm:text-sm italic my-4 space-y-1 shadow-sm"
          >
            {quoteLines.map((ql, qIdx) => (
              <p key={qIdx}>{renderInline(ql, topic.repo)}</p>
            ))}
          </blockquote>
        );
        continue;
      }

      // 5. Horizontal Rule (---, ***, ___)
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        blocks.push(<hr key={`hr-${lineIdx}`} className="border-t border-slate-800/80 my-6" />);
        lineIdx++;
        continue;
      }

      // 6. Bullet Lists (- ..., * ..., + ...)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('+ ')) {
        const listItems: string[] = [];
        while (
          lineIdx < rawLines.length && 
          (rawLines[lineIdx].trim().startsWith('- ') || rawLines[lineIdx].trim().startsWith('* ') || rawLines[lineIdx].trim().startsWith('+ '))
        ) {
          listItems.push(rawLines[lineIdx].trim().replace(/^[-*+]\s+/, ''));
          lineIdx++;
        }
        blocks.push(
          <ul key={`ul-${lineIdx}`} className="space-y-2 my-3 pl-2">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-slate-300 text-xs sm:text-sm leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                <span>{renderInline(item, topic.repo)}</span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // 7. Numbered Lists (1. ..., 2. ...)
      if (/^\d+\.\s+/.test(trimmed)) {
        const numItems: string[] = [];
        while (lineIdx < rawLines.length && /^\d+\.\s+/.test(rawLines[lineIdx].trim())) {
          numItems.push(rawLines[lineIdx].trim().replace(/^\d+\.\s+/, ''));
          lineIdx++;
        }
        blocks.push(
          <ol key={`ol-${lineIdx}`} className="space-y-2 my-3 pl-2 list-decimal list-inside text-slate-300 text-xs sm:text-sm leading-relaxed">
            {numItems.map((item, idx) => (
              <li key={idx} className="pl-1">
                <span>{renderInline(item, topic.repo)}</span>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // 8. Markdown Tables (| ... |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
        const tableLines: string[] = [];
        while (lineIdx < rawLines.length && rawLines[lineIdx].trim().startsWith('|') && rawLines[lineIdx].trim().endsWith('|')) {
          tableLines.push(rawLines[lineIdx].trim());
          lineIdx++;
        }

        if (tableLines.length >= 2) {
          const headers = tableLines[0].split('|').slice(1, -1).map(h => h.trim());
          let rowStart = 1;
          if (tableLines[1].replace(/[\s\:\-\|]/g, '').length === 0) rowStart = 2;

          const rows = tableLines.slice(rowStart).map(r => r.split('|').slice(1, -1).map(c => c.trim()));

          blocks.push(
            <div key={`table-${lineIdx}`} className="overflow-x-auto my-4 rounded-2xl border border-slate-800 bg-slate-950 shadow-xl custom-scrollbar">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-purple-300 font-bold">
                  <tr>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="p-3 font-mono">{renderInline(h, topic.repo)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3 text-slate-300 font-sans">{renderInline(cell, topic.repo)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // 9. Standard Paragraph Block
      blocks.push(
        <p key={`p-${lineIdx}`} className="text-slate-300 text-xs sm:text-sm leading-relaxed my-3 font-sans">
          {renderInline(line, topic.repo)}
        </p>
      );
      lineIdx++;
    }

    return blocks;
  }, [markdown, topic.repo]);

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 flex flex-col animate-fadeIn select-text' : 'space-y-4'}`}>
      
      {/* Top Reading Controls Header Bar */}
      <div className={`p-4 sm:p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl ${isFullscreen ? 'border-b rounded-none' : ''}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-100 flex items-center gap-2">
              <span>{topic.title}</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-[10px] font-mono text-purple-300">
                {topic.category}
              </span>
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{readingStats.mins} Min Read</span>
              </span>
              <span>&bull;</span>
              <span>{readingStats.words.toLocaleString()} Words</span>
              <span>&bull;</span>
              <span>{topic.repo}</span>
            </div>
          </div>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-2.5">
          {/* Font Size Adjuster */}
          <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${fontSize === 'sm' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Small Text"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${fontSize === 'base' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Default Text"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${fontSize === 'lg' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Large Text"
            >
              A+
            </button>
          </div>

          {/* Fullscreen Reading Mode */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reader Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reader'}</span>
          </button>

          {/* Open on GitHub */}
          <a
            href={`https://github.com/${topic.repo}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            title="View on GitHub"
          >
            <Github className="w-4 h-4" />
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>

      {/* Main Two-Column Reader Canvas: Chapter Navigator (TOC) + Markdown Stream */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${isFullscreen ? 'flex-1 p-6 overflow-hidden' : ''}`}>
        
        {/* Left: Chapter / Table of Contents Navigator (3 Columns) */}
        {chapters.length > 0 && (
          <div className={`lg:col-span-3 glass-panel p-5 rounded-3xl border border-slate-800 bg-slate-950/80 flex flex-col ${isFullscreen ? 'h-full overflow-hidden' : 'max-h-[680px]'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <ListOrdered className="w-4 h-4" />
                <span>Chapter Index ({chapters.length})</span>
              </div>
            </div>

            {/* Chapter Search Filter */}
            <div className="relative mb-3 flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={tocSearch}
                onChange={(e) => setTocSearch(e.target.value)}
                placeholder="Filter chapters..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Clickable Chapter Links */}
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
              {filteredChapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToChapter(ch.id)}
                  className={`w-full text-left py-1.5 px-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer group ${
                    activeChapterId === ch.id
                      ? 'bg-purple-600 text-white font-bold shadow-md'
                      : ch.level === 1 
                        ? 'text-slate-100 font-bold hover:bg-slate-900' 
                        : ch.level === 2 
                          ? 'text-slate-300 pl-4 hover:bg-slate-900' 
                          : 'text-slate-400 pl-6 text-[11px] hover:bg-slate-900'
                  }`}
                >
                  <span className="truncate">{ch.title}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 flex-shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right: Rich Structured Article Reader (9 Columns) */}
        <div 
          ref={contentRef}
          className={`${chapters.length > 0 ? 'lg:col-span-9' : 'lg:col-span-12'} glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl overflow-y-auto custom-scrollbar ${
            isFullscreen ? 'h-full' : 'max-h-[720px]'
          }`}
        >
          {isLoading ? (
            <div className="py-28 text-center text-slate-400 font-mono text-xs animate-pulse">
              Fetching and rendering open-source primer via GitHub REST API...
            </div>
          ) : (
            <div className={`space-y-4 ${
              fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
            }`}>
              {renderedBlocks}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
