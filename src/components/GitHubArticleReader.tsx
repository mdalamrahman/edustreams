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
  Search,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  AlignLeft,
  Menu,
  Layers
} from 'lucide-react';
import { CuratedLLDTopic } from '../lib/githubLld';
import { KrokiDiagramModal } from './KrokiDiagramModal';
import { deductCredits, canAffordAction, PRICING_CONFIG } from '../lib/billing';
import { getCurrentStudent } from '../lib/auth';
import { InsufficientCreditsModal } from './InsufficientCreditsModal';
import { WalletTopupModal } from './WalletTopupModal';

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
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [isInsufficientCreditsOpen, setIsInsufficientCreditsOpen] = useState(false);
  const [isWalletTopupOpen, setIsWalletTopupOpen] = useState(false);
  const [insufficientMeta, setInsufficientMeta] = useState<{ cost: number; action: string }>({ cost: 0.20, action: '' });

  const handleOpenDiagramModal = () => {
    const user = getCurrentStudent();
    if (!canAffordAction(PRICING_CONFIG.LLD_DIAGRAM_VIEW, user?.email)) {
      setInsufficientMeta({
        cost: PRICING_CONFIG.LLD_DIAGRAM_VIEW,
        action: `Kroki Visual LLD Architecture Diagram (20 paise): ${topic.title}`
      });
      setIsInsufficientCreditsOpen(true);
      return;
    }
    deductCredits(
      PRICING_CONFIG.LLD_DIAGRAM_VIEW,
      'LLD_DIAGRAM',
      `📐 LLD Architecture Diagram (20p): ${topic.title}`,
      user?.email
    );
    setIsDiagramModalOpen(true);
  };

  const [baseFontSize, setBaseFontSize] = useState<number>(16); // Dynamic px size (14 - 24)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeChapterId, setActiveChapterId] = useState<string>('');
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [tocSearch, setTocSearch] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Native Fullscreen API Integration for 100% full monitor viewport usage
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        document.documentElement.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      }
      setIsFullscreen(true);
      // Auto-minimize chapters in full screen for maximum focus
      setIsSidebarOpen(false);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
      setIsSidebarOpen(true);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      if (isNowFullscreen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

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
          <span key={match.index} className="block my-5 text-center">
            <img
              src={src}
              alt={alt}
              className="rounded-2xl border border-slate-800 max-h-96 mx-auto object-contain bg-slate-900 shadow-xl"
              loading="lazy"
            />
            {alt && alt !== 'Diagram' && (
              <span className="text-xs text-slate-400 mt-1.5 block font-mono">{alt}</span>
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
          <code key={match.index} className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-purple-300 font-mono text-[0.9em]">
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

      if (!trimmed) {
        lineIdx++;
        continue;
      }

      // Headings (# H1, ## H2, ### H3)
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
              className="text-2xl sm:text-3xl font-black text-slate-100 pt-6 pb-3 border-b border-slate-800 tracking-tight flex items-center gap-2.5"
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
              className="text-xl sm:text-2xl font-extrabold text-slate-100 pt-6 pb-2.5 border-b border-slate-800/80 tracking-tight flex items-center gap-2"
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
              className="text-lg sm:text-xl font-bold text-indigo-200 pt-4 pb-1.5 tracking-tight flex items-center gap-1.5"
            >
              <span className="text-sky-400">###</span>
              <span>{renderInline(text, topic.repo)}</span>
            </h3>
          );
        } else {
          blocks.push(
            <h4 key={lineIdx} id={`heading-${id}`} className="text-base font-bold text-purple-300 pt-3">
              {renderInline(text, topic.repo)}
            </h4>
          );
        }
        lineIdx++;
        continue;
      }

      // Fenced Code Blocks (```lang ... ```)
      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3).trim() || 'code';
        const codeLines: string[] = [];
        lineIdx++;
        while (lineIdx < rawLines.length && !rawLines[lineIdx].trim().startsWith('```')) {
          codeLines.push(rawLines[lineIdx]);
          lineIdx++;
        }
        if (lineIdx < rawLines.length) lineIdx++;

        const fullCode = codeLines.join('\n');
        const currentIdx = codeBlockCount++;

        blocks.push(
          <div key={`code-${lineIdx}`} className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl my-5">
            <div className="h-10 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-purple-300 font-bold uppercase">{lang}</span>
              <button
                onClick={() => handleCopyCode(fullCode, currentIdx)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {copiedCodeIdx === currentIdx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-300/90 leading-relaxed custom-scrollbar">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        continue;
      }

      // Blockquotes (> quote)
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [];
        while (lineIdx < rawLines.length && rawLines[lineIdx].trim().startsWith('>')) {
          quoteLines.push(rawLines[lineIdx].trim().replace(/^>\s*/, ''));
          lineIdx++;
        }
        blocks.push(
          <blockquote key={`quote-${lineIdx}`} className="border-l-4 border-purple-500 bg-purple-950/20 pl-4 py-3 my-4 rounded-r-2xl text-slate-200 italic">
            {quoteLines.map((ql, qIdx) => (
              <p key={qIdx} className="my-1">{renderInline(ql, topic.repo)}</p>
            ))}
          </blockquote>
        );
        continue;
      }

      // Unordered Lists (- item or * item)
      if (trimmed.match(/^[-*]\s+/)) {
        const listItems: string[] = [];
        while (lineIdx < rawLines.length && rawLines[lineIdx].trim().match(/^[-*]\s+/)) {
          listItems.push(rawLines[lineIdx].trim().replace(/^[-*]\s+/, ''));
          lineIdx++;
        }
        blocks.push(
          <ul key={`ul-${lineIdx}`} className="space-y-2 my-4 pl-2 list-none">
            {listItems.map((li, lIdx) => (
              <li key={lIdx} className="flex items-start gap-2.5 text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2.5 flex-shrink-0" />
                <span className="flex-1">{renderInline(li, topic.repo)}</span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered Lists (1. item)
      if (trimmed.match(/^\d+\.\s+/)) {
        const listItems: string[] = [];
        while (lineIdx < rawLines.length && rawLines[lineIdx].trim().match(/^\d+\.\s+/)) {
          listItems.push(rawLines[lineIdx].trim().replace(/^\d+\.\s+/, ''));
          lineIdx++;
        }
        blocks.push(
          <ol key={`ol-${lineIdx}`} className="space-y-2 my-4 pl-2 list-none">
            {listItems.map((li, lIdx) => (
              <li key={lIdx} className="flex items-start gap-2.5 text-slate-200">
                <span className="font-mono text-xs font-bold text-indigo-400 mt-0.5 flex-shrink-0">{lIdx + 1}.</span>
                <span className="flex-1">{renderInline(li, topic.repo)}</span>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Regular Paragraphs
      const paraLines: string[] = [];
      while (
        lineIdx < rawLines.length &&
        rawLines[lineIdx].trim() &&
        !rawLines[lineIdx].trim().match(/^(#{1,4})\s+/) &&
        !rawLines[lineIdx].trim().startsWith('```') &&
        !rawLines[lineIdx].trim().startsWith('>') &&
        !rawLines[lineIdx].trim().match(/^[-*]\s+/) &&
        !rawLines[lineIdx].trim().match(/^\d+\.\s+/)
      ) {
        paraLines.push(rawLines[lineIdx].trim());
        lineIdx++;
      }

      if (paraLines.length > 0) {
        blocks.push(
          <p key={`p-${lineIdx}`} className="text-slate-200 my-3 leading-relaxed">
            {renderInline(paraLines.join(' '), topic.repo)}
          </p>
        );
      }
    }

    return blocks;
  }, [markdown, topic.repo]);

  return (
    <div 
      ref={containerRef}
      className={`w-full transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-[99999] bg-slate-950 w-screen h-screen flex flex-col p-3 sm:p-5 m-0 border-0 rounded-none overflow-hidden select-text' 
          : 'space-y-4'
      }`}
    >
      
      {/* Top Header & Reading Controls Bar */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-950 border border-purple-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        
        {/* Left: Topic Title & Reading Statistics */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-purple-950/80 text-purple-300 border border-purple-800/60 hidden sm:block">
            <BookOpen className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-[10px] text-purple-400 font-mono tracking-wider px-2 py-0.5 rounded-lg bg-purple-950 border border-purple-800/60">
                {topic.category}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate max-w-md">{topic.title}</h3>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{readingStats.mins} Min Read</span>
              </span>
              <span>&bull;</span>
              <span>{readingStats.words.toLocaleString()} Words</span>
              <span>&bull;</span>
              <span className="truncate max-w-[140px]">{topic.repo}</span>
            </div>
          </div>
        </div>

        {/* Right Toolbar Controls: Font Scaling, LLD Diagram & Fullscreen */}
        <div className="flex items-center gap-2">
          
          {/* Dynamic Font Size Stepper (A-, A, A+) */}
          <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setBaseFontSize(s => Math.max(13, s - 2))}
              className="px-2.5 py-1 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer font-serif"
              title="Decrease Font Size (A-)"
            >
              A-
            </button>
            <span className="px-2 font-mono text-[11px] text-purple-400 font-bold">{baseFontSize}px</span>
            <button
              onClick={() => setBaseFontSize(s => Math.min(24, s + 2))}
              className="px-2.5 py-1 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer font-serif text-sm font-bold"
              title="Increase Font Size (A+)"
            >
              A+
            </button>
          </div>

          {/* Small LLD Diagram Button on the Right (20 paise) */}
          <button
            onClick={handleOpenDiagramModal}
            className="px-3.5 py-2 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Open Kroki Visual LLD Architecture Popup (20 paise)"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>LLD Diagram</span>
          </button>

          {/* Fullscreen Reading Mode with Native Monitor Full Viewport */}
          <button
            onClick={toggleFullscreen}
            className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter 100% Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-purple-400" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}</span>
          </button>

          {/* Open on GitHub */}
          <a
            href={`https://github.com/${topic.repo}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            title="View on GitHub"
          >
            <Github className="w-4 h-4" />
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>

      {/* Main Two-Column Reader Canvas: Chapter Navigator (TOC) + Markdown Stream */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 relative ${isFullscreen ? 'flex-1 overflow-hidden min-h-0' : ''}`}>
          
          {/* Floating "Show Index" Button when Chapter Index is minimized */}
          {!isSidebarOpen && chapters.length > 0 && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-3 left-3 z-30 px-3 py-1.5 rounded-2xl bg-purple-600/90 hover:bg-purple-600 text-white text-xs font-bold shadow-2xl border border-purple-400/60 backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
              title="Open Chapter Index"
            >
              <PanelLeft className="w-4 h-4" />
              <span>Show Index ({chapters.length})</span>
            </button>
          )}

          {/* Left: Chapter / Table of Contents Navigator Box */}
          {chapters.length > 0 && isSidebarOpen && (
            <div className={`lg:col-span-3 glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 bg-slate-950/95 flex flex-col ${
              isFullscreen ? 'h-full overflow-hidden' : 'max-h-[680px]'
            } animate-fadeIn flex-shrink-0`}>
              
              {/* Header with "Hide Index" button inside the index box */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 flex-shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                  <ListOrdered className="w-4 h-4" />
                  <span>Chapter Index ({chapters.length})</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="px-2 py-1 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  title="Hide Chapter Index"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                  <span>Hide Index</span>
                </button>
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
                    className={`w-full text-left py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer group ${
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

          {/* Right: Rich Structured Article Reader (Full Viewport Usage) */}
          <div 
            ref={contentRef}
            className={`${(chapters.length > 0 && isSidebarOpen) ? 'lg:col-span-9' : 'lg:col-span-12'} glass-panel p-6 sm:p-12 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl overflow-y-auto custom-scrollbar ${
              isFullscreen ? 'h-full' : 'max-h-[720px]'
            }`}
          >
            {isLoading ? (
              <div className="py-28 text-center text-slate-400 font-mono text-xs animate-pulse">
                Fetching and rendering open-source primer via GitHub REST API...
              </div>
            ) : (
              <div 
                style={{ fontSize: `${baseFontSize}px`, lineHeight: 1.8 }}
                className="max-w-5xl mx-auto space-y-5 font-sans tracking-normal select-text"
              >
                {renderedBlocks}
              </div>
            )}
          </div>

        </div>

      {/* Kroki Visual LLD Architecture Popup Modal (Charged at 20 paise) */}
      {isDiagramModalOpen && (
        <KrokiDiagramModal
          slugOrTitle={topic.title}
          category={topic.category}
          onClose={() => setIsDiagramModalOpen(false)}
        />
      )}

      {/* Insufficient Credits Gatekeeper Modal */}
      <InsufficientCreditsModal
        isOpen={isInsufficientCreditsOpen}
        onClose={() => setIsInsufficientCreditsOpen(false)}
        onOpenRecharge={() => {
          setIsInsufficientCreditsOpen(false);
          setIsWalletTopupOpen(true);
        }}
        requiredCost={insufficientMeta.cost}
        actionName={insufficientMeta.action}
      />

      {/* Wallet Top-up Modal */}
      <WalletTopupModal
        isOpen={isWalletTopupOpen}
        onClose={() => setIsWalletTopupOpen(false)}
        initialAmount={50}
      />

    </div>
  );
};
