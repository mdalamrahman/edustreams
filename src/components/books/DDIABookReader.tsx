import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Menu, 
  X, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Sun, 
  Moon, 
  Type, 
  Sparkles, 
  Check, 
  Copy, 
  Share2, 
  Layers, 
  Code2, 
  Quote, 
  ExternalLink,
  BookMarked,
  Sliders,
  AlignLeft,
  Maximize2
} from 'lucide-react';
import { 
  DDIA_METADATA, 
  DDIA_PARTS, 
  DDIA_CHAPTERS, 
  BookChapter, 
  BookSection, 
  searchDDIABook, 
  SearchResult 
} from '../../data/books/ddia';
import { DDIADiagramAnimator } from './DDIADiagramAnimator';

export const DDIABookReader: React.FC = () => {
  // Navigation State
  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    return localStorage.getItem('ddia_last_chapter') || 'chapter-1';
  });
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Reader Settings State
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'cyber' | 'light'>(() => {
    return (localStorage.getItem('ddia_reader_theme') as any) || 'dark';
  });
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>(() => {
    return (localStorage.getItem('ddia_reader_font') as any) || 'base';
  });
  const [readingWidth, setReadingWidth] = useState<'narrow' | 'medium' | 'wide'>('medium');

  // Audio Speech Synthesis (TTS) State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ddia_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  // Copied alert
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Active Chapter Reference
  const currentChapter = DDIA_CHAPTERS.find((c) => c.id === selectedChapterId) || DDIA_CHAPTERS[1];
  const chapterContentRef = useRef<HTMLDivElement>(null);

  // Save last visited chapter
  useEffect(() => {
    localStorage.setItem('ddia_last_chapter', selectedChapterId);
    if (chapterContentRef.current) {
      chapterContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Stop speech when chapter changes
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [selectedChapterId]);

  // Save theme
  useEffect(() => {
    localStorage.setItem('ddia_reader_theme', theme);
  }, [theme]);

  // Save font
  useEffect(() => {
    localStorage.setItem('ddia_reader_font', fontSize);
  }, [fontSize]);

  // Search handler
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setSearchResults(searchDDIABook(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Text-To-Speech (TTS)
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Prepare text
    const textToRead = [
      currentChapter.title,
      currentChapter.epigraph ? `${currentChapter.epigraph.quote} by ${currentChapter.epigraph.author}` : '',
      ...currentChapter.sections.map((s) => `${s.title}. ${s.content.join(' ')}`)
    ].join('. ');

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = speechRate;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const toggleBookmark = (chapterId: string) => {
    let updated: string[];
    if (bookmarks.includes(chapterId)) {
      updated = bookmarks.filter((id) => id !== chapterId);
    } else {
      updated = [...bookmarks, chapterId];
    }
    setBookmarks(updated);
    localStorage.setItem('ddia_bookmarks', JSON.stringify(updated));
  };

  const copySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Chapter Navigation
  const currentChapterIndex = DDIA_CHAPTERS.findIndex((c) => c.id === currentChapter.id);
  const prevChapter = currentChapterIndex > 0 ? DDIA_CHAPTERS[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < DDIA_CHAPTERS.length - 1 ? DDIA_CHAPTERS[currentChapterIndex + 1] : null;

  // Reading Theme styles
  const themeClasses = {
    dark: 'bg-slate-950 text-slate-200 selection:bg-teal-500/30 selection:text-teal-200',
    sepia: 'bg-[#1b1714] text-[#e8dfd5] selection:bg-amber-600/40 selection:text-amber-100',
    cyber: 'bg-[#090d16] text-[#c8d6e5] selection:bg-cyan-500/40 selection:text-cyan-200',
    light: 'bg-slate-50 text-slate-800 selection:bg-teal-100 selection:text-teal-900'
  }[theme];

  const contentCardClasses = {
    dark: 'bg-slate-900/40 border-slate-800/80',
    sepia: 'bg-[#231e1a]/80 border-[#3d332c]',
    cyber: 'bg-[#0f172a]/70 border-[#1e293b]',
    light: 'bg-white border-slate-200 shadow-md'
  }[theme];

  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose font-normal'
  }[fontSize];

  const maxWidthClasses = {
    narrow: 'max-w-2xl',
    medium: 'max-w-4xl',
    wide: 'max-w-6xl'
  }[readingWidth];

  return (
    <div className={`relative min-h-screen rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col ${themeClasses}`}>
      
      {/* TOP STICKY TOOLBAR */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 backdrop-blur-xl border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between gap-3">
        {/* Left: Table of Contents button & Chapter Info */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-teal-400 hover:text-teal-300 transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
            title="Table of Contents"
          >
            <Menu className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Contents</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-teal-950/80 border border-teal-700/50 text-[10px] font-mono text-teal-300 font-bold uppercase tracking-wider flex-shrink-0">
                {currentChapter.number === 0 ? 'Preface' : `Ch ${currentChapter.number}`}
              </span>
              <span className="text-xs font-bold truncate text-slate-100 hidden sm:inline">
                {currentChapter.title}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate hidden md:block">
              {currentChapter.partTitle} • {currentChapter.pageRange}
            </div>
          </div>
        </div>

        {/* Right: Search, TTS, Bookmark, Font & Theme Controls */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Quick Search in Book */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            title="Search Book"
          >
            <Search className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-semibold hidden lg:inline">Search Book</span>
          </button>

          {/* Audio TTS */}
          <button
            onClick={toggleSpeech}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              isSpeaking
                ? 'bg-amber-600 border-amber-500 text-white shadow-lg animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title={isSpeaking ? 'Pause Audio Read-Aloud' : 'Read Aloud (Text to Speech)'}
          >
            {isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            <span className="text-xs font-semibold hidden md:inline">{isSpeaking ? 'Pause' : 'Listen'}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => toggleBookmark(currentChapter.id)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              bookmarks.includes(currentChapter.id)
                ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
            }`}
            title="Bookmark Chapter"
          >
            <Bookmark className={`w-4 h-4 ${bookmarks.includes(currentChapter.id) ? 'fill-teal-400' : ''}`} />
          </button>

          {/* Font Size Toggle */}
          <div className="hidden sm:flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
            {(['sm', 'base', 'lg'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFontSize(s)}
                className={`px-2 py-1 text-xs rounded-lg font-mono font-bold transition-all cursor-pointer ${
                  fontSize === s ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Theme Selector */}
          <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                theme === 'dark' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dark Obsidian Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                theme === 'sepia' ? 'bg-amber-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Warm Book Sepia"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('cyber')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                theme === 'cyber' ? 'bg-cyan-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cyber Slate Theme"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* TABLE OF CONTENTS DRAWER / SIDEBAR */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn">
          {/* Backdrop */}
          <div 
            onClick={() => setIsTocOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer Pane */}
          <div className="relative w-full max-w-md h-full bg-slate-950 border-r border-slate-800 shadow-2xl flex flex-col p-6 z-10 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <BookMarked className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-slate-100">Table of Contents</h3>
              </div>
              <button
                onClick={() => setIsTocOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 custom-scrollbar">
              {DDIA_PARTS.map((part) => (
                <div key={part.id} className="space-y-2">
                  <div className="text-[11px] font-mono font-bold text-teal-400 uppercase tracking-wider px-2 py-1 bg-teal-950/40 rounded-lg border border-teal-800/30">
                    {part.title}
                  </div>
                  <div className="space-y-1">
                    {part.chapterIds.map((chId) => {
                      const ch = DDIA_CHAPTERS.find((c) => c.id === chId);
                      if (!ch) return null;
                      const isCurrent = ch.id === currentChapter.id;
                      const isBookmarked = bookmarks.includes(ch.id);

                      return (
                        <div key={ch.id} className="space-y-1">
                          <button
                            onClick={() => {
                              setSelectedChapterId(ch.id);
                              setIsTocOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-2xl transition-all flex items-start justify-between gap-2 cursor-pointer ${
                              isCurrent
                                ? 'bg-teal-600/20 text-teal-300 border border-teal-500/50 shadow-lg font-bold'
                                : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                            }`}
                          >
                            <div className="flex items-start space-x-2.5">
                              <span className="font-mono text-xs text-slate-500 mt-0.5">
                                {ch.number === 0 ? '•' : `${ch.number}.`}
                              </span>
                              <div>
                                <div className="text-xs font-semibold leading-snug">{ch.title}</div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{ch.pageRange}</div>
                              </div>
                            </div>
                            {isBookmarked && (
                              <Bookmark className="w-3.5 h-3.5 fill-teal-400 text-teal-400 flex-shrink-0 mt-1" />
                            )}
                          </button>

                          {/* Sub-sections dropdown if current chapter */}
                          {isCurrent && (
                            <div className="ml-7 pl-2 border-l border-teal-500/30 space-y-1 py-1">
                              {ch.sections.map((sec) => (
                                <button
                                  key={sec.id}
                                  onClick={() => {
                                    setIsTocOpen(false);
                                    const el = document.getElementById(sec.id);
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="w-full text-left px-2 py-1 rounded-lg text-[11px] text-slate-400 hover:text-teal-300 hover:bg-slate-900 truncate transition-all cursor-pointer block"
                                >
                                  {sec.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Book Info Footer */}
            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              Martin Kleppmann • O'Reilly Media First Edition
            </div>
          </div>
        </div>
      )}

      {/* SEARCH MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-20 animate-fadeIn">
          <div onClick={() => setIsSearchOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

          <div className="relative w-full max-w-2xl bg-slate-950 border border-teal-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/60">
              <Search className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search across all 11 chapters (e.g. linearizability, fencing tokens, SSTable, 2PC)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {searchResults.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  {searchQuery.trim().length < 2
                    ? 'Type at least 2 characters to search the book.'
                    : `No passages found matching "${searchQuery}".`}
                </div>
              ) : (
                searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedChapterId(res.chapterId);
                      setIsSearchOpen(false);
                      setTimeout(() => {
                        const el = document.getElementById(res.sectionId);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-slate-900/60 hover:bg-teal-950/40 border border-slate-800 hover:border-teal-500/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-teal-950 border border-teal-700/60 text-[10px] font-mono text-teal-300 font-bold">
                        Chapter {res.chapterNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                        {res.sectionTitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                      {res.snippet}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN BOOK READING BODY */}
      <main 
        ref={chapterContentRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 custom-scrollbar"
      >
        <div className={`mx-auto space-y-10 ${maxWidthClasses}`}>
          
          {/* CHAPTER HEADER BANNER */}
          <section className="space-y-4 pb-8 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-teal-950/80 border border-teal-600/50 text-xs font-mono text-teal-300 font-bold uppercase tracking-wider">
                {currentChapter.partTitle}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {currentChapter.pageRange}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight font-serif leading-tight">
              {currentChapter.number > 0 && (
                <span className="text-teal-400 block text-lg sm:text-xl font-mono font-bold mb-2">
                  Chapter {currentChapter.number}
                </span>
              )}
              {currentChapter.title}
            </h1>

            {/* Epigraph Quote */}
            {currentChapter.epigraph && (
              <div className="p-5 rounded-2xl bg-slate-900/40 border-l-4 border-teal-500 text-slate-300 space-y-2 italic font-serif">
                <p className="text-sm sm:text-base leading-relaxed">
                  "{currentChapter.epigraph.quote}"
                </p>
                <div className="text-right text-xs font-mono font-semibold text-teal-400 not-italic">
                  — {currentChapter.epigraph.author}
                </div>
              </div>
            )}
          </section>

          {/* CHAPTER SECTIONS WITH EXACT VERBATIM BOOK TEXT */}
          <div className="space-y-12">
            {currentChapter.sections.map((section) => (
              <article key={section.id} id={section.id} className="space-y-5 scroll-mt-24">
                
                {/* Section Title */}
                <h2 className={`font-bold tracking-tight text-slate-100 flex items-center justify-between border-b pb-2 ${
                  section.level === 2 ? 'text-xl sm:text-2xl border-slate-800' : 'text-lg sm:text-xl border-slate-800/50 text-teal-300'
                }`}>
                  <span>{section.title}</span>
                  <a 
                    href={`#${section.id}`} 
                    className="opacity-0 hover:opacity-100 text-slate-500 hover:text-teal-400 text-xs font-mono"
                    title="Link to section"
                  >
                    #
                  </a>
                </h2>

                {/* Key Concept Callout Box if present */}
                {section.keyConcept && (
                  <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-teal-300 font-mono">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      <span>Key Concept: {section.keyConcept.title}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {section.keyConcept.takeaway}
                    </p>
                    {section.keyConcept.interviewTip && (
                      <div className="text-[11px] text-amber-300/90 font-mono pt-1 border-t border-teal-900/50 flex items-center gap-1.5">
                        <span className="font-bold">🎯 Interview Focus:</span>
                        <span>{section.keyConcept.interviewTip}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Verbatim Paragraphs (NOT A SINGLE LINE CHANGED) */}
                <div className={`space-y-4 font-serif text-slate-200 ${fontSizeClasses}`}>
                  {section.content.map((para, pIdx) => (
                    <p key={pIdx} className="leading-relaxed text-justify">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Code Snippet if applicable */}
                {section.codeSnippet && (
                  <div className="my-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                    <div className="px-4 py-2 bg-slate-900 flex items-center justify-between border-b border-slate-800">
                      <span className="text-[11px] font-mono text-teal-400 font-bold">
                        {section.codeSnippet.caption || section.codeSnippet.language}
                      </span>
                      <button
                        onClick={() => copySnippet(section.codeSnippet!.code, section.id)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedCodeId === section.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="font-mono text-[10px]">{copiedCodeId === section.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-teal-200 overflow-x-auto leading-relaxed">
                      <code>{section.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}

                {/* Embedded Interactive Animated Diagram */}
                {section.diagramId && (
                  <DDIADiagramAnimator diagramId={section.diagramId} />
                )}

                {/* Footnote if present */}
                {section.footnote && (
                  <div className="text-xs text-slate-400 italic pt-2 border-t border-slate-800/60 font-sans">
                    {section.footnote}
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* CHAPTER REFERENCES */}
          {currentChapter.references && currentChapter.references.length > 0 && (
            <section className="pt-8 border-t border-slate-800 space-y-3 font-sans">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <span>References</span>
                <span className="text-xs font-mono text-slate-500 font-normal">
                  ({currentChapter.references.length} citations)
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                {currentChapter.references.map((ref) => (
                  <div key={ref.id} className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
                    <span className="text-teal-400 mr-2">[{ref.id}]</span>
                    <span>{ref.text}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CHAPTER BOTTOM NAVIGATION */}
          <footer className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
            {prevChapter ? (
              <button
                onClick={() => setSelectedChapterId(prevChapter.id)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group"
              >
                <ChevronLeft className="w-4 h-4 text-teal-400 group-hover:-translate-x-1 transition-transform" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 font-mono">Previous Chapter</div>
                  <div>{prevChapter.title}</div>
                </div>
              </button>
            ) : <div />}

            {nextChapter && (
              <button
                onClick={() => setSelectedChapterId(nextChapter.id)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg group"
              >
                <div className="text-right">
                  <div className="text-[10px] text-teal-200 font-mono">Next Chapter</div>
                  <div>{nextChapter.title}</div>
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </footer>

        </div>
      </main>

    </div>
  );
};
