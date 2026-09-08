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
  Maximize2,
  Minimize2,
  Bot,
  Send,
  Loader2,
  HelpCircle,
  Lightbulb,
  CornerDownLeft
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
import { executeAIChatCascade } from '../../lib/mistral';

export const DDIABookReader: React.FC = () => {
  // Container & Fullscreen Ref
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Navigation State
  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    return localStorage.getItem('ddia_last_chapter') || 'chapter-1';
  });
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Reader Settings State - DEFAULT TO FULL WIDTH
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'cyber' | 'light'>(() => {
    return (localStorage.getItem('ddia_reader_theme') as any) || 'dark';
  });
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>(() => {
    return (localStorage.getItem('ddia_reader_font') as any) || 'base';
  });
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>(() => {
    return (localStorage.getItem('ddia_reader_family') as any) || 'sans';
  });
  const [readingWidth, setReadingWidth] = useState<'medium' | 'wide' | 'full'>('full');

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

  // Ask AI Drawer State
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiContextSection, setAiContextSection] = useState<string>('');
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello! I am your DDIA Distributed Systems Architect AI assistant. Ask me any question about the concepts, trade-offs, algorithms, or system design interview applications from this book!'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const aiChatEndRef = useRef<HTMLDivElement>(null);

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

  // Save reader settings
  useEffect(() => {
    localStorage.setItem('ddia_reader_theme', theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem('ddia_reader_font', fontSize);
  }, [fontSize]);
  useEffect(() => {
    localStorage.setItem('ddia_reader_family', fontFamily);
  }, [fontFamily]);

  // Search handler
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setSearchResults(searchDDIABook(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Auto scroll AI chat
  useEffect(() => {
    if (isAiDrawerOpen && aiChatEndRef.current) {
      aiChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAiDrawerOpen]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (containerRef.current?.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
      } catch {}
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      } catch {}
    }
  };

  // Sync fullscreen change with ESC key
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [isFullscreen]);

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

  // Send message to DDIA AI
  const handleSendAiMessage = async (queryText?: string) => {
    const text = queryText || aiInput;
    if (!text.trim() || isLoadingAi) return;

    const userMessage = { role: 'user' as const, content: text.trim() };
    const updatedMessages = [...aiMessages, userMessage];
    setAiMessages(updatedMessages);
    setAiInput('');
    setIsLoadingAi(true);

    try {
      const systemPrompt = `You are a Principal Distributed Systems Architect and mentor specializing in Martin Kleppmann's book "Designing Data-Intensive Applications" (DDIA).
You are currently answering questions for the user who is studying:
Chapter ${currentChapter.number}: "${currentChapter.title}" (${currentChapter.partTitle}).
${aiContextSection ? `Active Section Context: "${aiContextSection}"` : ''}

Provide a clear, authoritative, insightful, and pedagogical explanation. When relevant:
- Highlight the architectural trade-offs (e.g. latency vs consistency, read vs write amplification, network costs).
- Provide an intuitive real-world analogy.
- Explain how this is evaluated in FAANG High-Level Design (HLD) interviews.
- Format your response cleanly with bullet points, bold key terms, and code/SQL snippets where appropriate.`;

      const response = await executeAIChatCascade([
        { role: 'system', content: systemPrompt },
        ...updatedMessages.slice(-6)
      ], { temperature: 0.3, maxTokens: 900 });

      if (response) {
        setAiMessages([...updatedMessages, { role: 'assistant', content: response }]);
      } else {
        setAiMessages([
          ...updatedMessages,
          { 
            role: 'assistant', 
            content: `In "${currentChapter.title}", Martin Kleppmann emphasizes evaluating data systems across three fundamental dimensions: Reliability (resisting hardware, software, and human faults), Scalability (handling growth with measurable load parameters like Twitter fan-out), and Maintainability (operability, simplicity, and evolvability). Let me know which specific trade-off you would like to explore deeper!`
          }
        ]);
      }
    } catch (err) {
      setAiMessages([
        ...updatedMessages,
        { role: 'assistant', content: 'Apologies, I encountered a temporary connection issue. Please try re-asking your question!' }
      ]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Quick chapter-specific prompt suggestions
  const getChapterQuestions = (chNum: number): string[] => {
    switch (chNum) {
      case 1:
        return [
          'Explain Twitter timeline fan-out on write vs fan-out on read',
          'Why does 1 slow service amplify tail latency across microservices?',
          'What is the difference between a fault and a failure?'
        ];
      case 2:
        return [
          'When should I choose Document DB vs Relational vs Graph?',
          'Why did the relational model win over the CODASYL network model?',
          'Explain Cypher graph queries compared to recursive SQL CTEs'
        ];
      case 3:
        return [
          'How does an LSM-Tree compaction and mergesort work step by step?',
          'When is a B-Tree better than an LSM-Tree?',
          'Why do OLAP data warehouses use column-oriented storage and bitmap indexes?'
        ];
      case 4:
        return [
          'How do Protocol Buffers and Thrift achieve forward and backward compatibility?',
          'How does Avro resolve writer’s schema vs reader’s schema without field tags?',
          'What are the fundamental flaws of RPC and location transparency?'
        ];
      case 5:
        return [
          'Explain the 3 replication lag anomalies: Read-after-write, Monotonic reads, and Consistent prefix reads',
          'Why does Last-Write-Wins (LWW) cause silent data loss?',
          'How do leaderless quorums guarantee strong consistency if w + r > n?'
        ];
      case 6:
        return [
          'Why does hash mod N break rebalancing when adding a database node?',
          'What is the difference between document-partitioned (local) and term-partitioned (global) secondary indexes?',
          'How does ZooKeeper maintain partition routing metadata?'
        ];
      case 7:
        return [
          'What is Write Skew and how does the on-call doctors scenario illustrate it?',
          'How does PostgreSQL MVCC implement Snapshot Isolation without read locks?',
          'How does Serializable Snapshot Isolation (SSI) avoid the heavy locking of 2PL?'
        ];
      case 8:
        return [
          'Why cannot time-of-day physical clocks be trusted for ordering events?',
          'How do fencing tokens protect shared storage after a Stop-the-World GC pause?',
          'Explain the Byzantine Generals Problem in distributed consensus'
        ];
      case 9:
        return [
          'Explain Linearizability vs Serializability clearly with examples',
          'What is the CAP Theorem dilemma during network partitions?',
          'Why is Two-Phase Commit (2PC) called a blocking atomic commit protocol?'
        ];
      case 10:
        return [
          'Explain the MapReduce shuffle and sort phase and why it is crucial',
          'Why are modern dataflow engines (Spark, Flink) faster than MapReduce?',
          'How does the Pregel BSP model process large graphs?'
        ];
      case 11:
        return [
          'Explain the dual-write race condition and how Change Data Capture (CDC) solves it',
          'What is the difference between Event Time and Processing Time (Star Wars analogy)?',
          'How do Kafka partitioned logs enable deterministic stream replay and consumer offsets?'
        ];
      default:
        return [
          'What are the primary themes of Designing Data-Intensive Applications?',
          'How does DDIA help prepare for FAANG High-Level Design interviews?',
          'Explain the difference between systems of record and derived data'
        ];
    }
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

  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose'
  }[fontSize];

  const fontFamilyClasses = fontFamily === 'serif' ? 'font-serif' : 'font-sans';

  // Full-width container classes: user requested full width!
  const maxWidthClasses = {
    medium: 'max-w-4xl mx-auto px-4 sm:px-8',
    wide: 'max-w-6xl mx-auto px-6 sm:px-10',
    full: 'w-full max-w-none px-4 sm:px-10 xl:px-16'
  }[readingWidth];

  return (
    <div 
      ref={containerRef}
      className={`relative w-full min-h-screen transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen overflow-hidden rounded-none' : 'rounded-3xl border border-slate-800 shadow-2xl overflow-hidden'
      } flex flex-col ${themeClasses}`}
    >
      
      {/* TOP STICKY TOOLBAR */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 backdrop-blur-xl border-b border-slate-800/80 bg-slate-950/90 flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
        
        {/* Left: Table of Contents & Chapter Indicator */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-teal-400 hover:text-teal-300 transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            title="Open Table of Contents"
          >
            <Menu className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Index</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-teal-950/80 border border-teal-700/50 text-[10px] font-mono text-teal-300 font-bold uppercase tracking-wider flex-shrink-0">
                {currentChapter.number === 0 ? 'Preface' : `Ch ${currentChapter.number}`}
              </span>
              <span className="text-xs font-bold truncate text-slate-100 hidden md:inline max-w-xs lg:max-w-md">
                {currentChapter.title}
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right Toolbar Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap flex-shrink-0">
          
          {/* ASK AI BUTTON (Prominent Glowing Pill) */}
          <button
            onClick={() => {
              setAiContextSection(currentChapter.sections[0]?.title || '');
              setIsAiDrawerOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/20 border border-teal-400/40 cursor-pointer transition-all animate-pulse hover:animate-none"
            title="Ask AI questions about this chapter"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span className="font-mono">Ask DDIA AI</span>
          </button>

          {/* Quick Search */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            title="Search Book"
          >
            <Search className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-semibold hidden xl:inline">Search</span>
          </button>

          {/* Audio TTS */}
          <button
            onClick={toggleSpeech}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              isSpeaking
                ? 'bg-amber-600 border-amber-500 text-white shadow-lg animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title={isSpeaking ? 'Pause Audio Narration' : 'Listen with Audio TTS'}
          >
            {isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            <span className="text-xs font-semibold hidden lg:inline">{isSpeaking ? 'Pause' : 'Listen'}</span>
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

          {/* Width Selector (Full width, Wide, Medium) */}
          <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
            <button
              onClick={() => setReadingWidth('full')}
              className={`px-2 py-1 text-[11px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                readingWidth === 'full' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Width (100% Display)"
            >
              100%
            </button>
            <button
              onClick={() => setReadingWidth('wide')}
              className={`px-2 py-1 text-[11px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                readingWidth === 'wide' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Wide Reading Column"
            >
              Wide
            </button>
            <button
              onClick={() => setReadingWidth('medium')}
              className={`px-2 py-1 text-[11px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                readingWidth === 'medium' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Centered Column"
            >
              Std
            </button>
          </div>

          {/* Font Serif / Sans Toggle */}
          <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
            <button
              onClick={() => setFontFamily('sans')}
              className={`px-2 py-1 text-[11px] font-sans font-bold rounded-lg transition-all cursor-pointer ${
                fontFamily === 'sans' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sans-Serif Modern Font"
            >
              Sans
            </button>
            <button
              onClick={() => setFontFamily('serif')}
              className={`px-2 py-1 text-[11px] font-serif font-bold rounded-lg transition-all cursor-pointer ${
                fontFamily === 'serif' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Classic Serif Book Font"
            >
              Serif
            </button>
          </div>

          {/* Font Size Scaling */}
          <div className="hidden md:flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
            {(['sm', 'base', 'lg', 'xl'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFontSize(s)}
                className={`px-2 py-1 text-[11px] rounded-lg font-mono font-bold transition-all cursor-pointer ${
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
              title="Dark Obsidian"
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
              title="Cyber Slate"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* FULL SCREEN TOGGLE (Maximize2 / Minimize2) */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
              isFullscreen
                ? 'bg-teal-600 border-teal-500 text-white shadow-xl ring-2 ring-teal-400'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title={isFullscreen ? 'Exit Full Screen' : 'Toggle Full Screen View'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-teal-400" />}
            <span className="text-xs font-bold hidden sm:inline">{isFullscreen ? 'Exit' : 'Full Screen'}</span>
          </button>

        </div>
      </header>

      {/* TABLE OF CONTENTS DRAWER / SIDEBAR */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn">
          <div onClick={() => setIsTocOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

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

      {/* ASK AI DRAWER (SPECIALIZED DDIA ARCHITECT ASSISTANT) */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
          <div onClick={() => setIsAiDrawerOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg h-full bg-slate-950 border-l border-teal-500/30 shadow-2xl flex flex-col z-10 overflow-hidden">
            {/* AI Header */}
            <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-teal-950/80 via-slate-900 to-indigo-950/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>DDIA Architect AI</span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-950 border border-teal-600/50 text-[10px] font-mono text-teal-300">
                      Ch {currentChapter.number} Context
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Ask questions about architectures, trade-offs, or interview patterns</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Questions Chips */}
            <div className="p-3 bg-slate-900/60 border-b border-slate-800/80 space-y-1.5">
              <div className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                <span>Suggested Questions for this Chapter:</span>
              </div>
              <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
                {getChapterQuestions(currentChapter.number).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendAiMessage(q)}
                    className="text-left px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-teal-950/50 border border-slate-800 hover:border-teal-500/40 text-[11px] text-slate-300 hover:text-teal-200 transition-all cursor-pointer line-clamp-1"
                  >
                    • {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {aiMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`p-1.5 rounded-xl flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-teal-600/30 text-teal-300 border border-teal-500/40'
                  }`}>
                    {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white font-sans'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 font-sans shadow-lg'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoadingAi && (
                <div className="flex items-center gap-2 text-xs font-mono text-teal-400 p-3 bg-slate-900/50 rounded-2xl border border-slate-800 w-fit">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking through DDIA principles...</span>
                </div>
              )}
              <div ref={aiChatEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-3 border-t border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2 bg-slate-900 rounded-2xl border border-slate-800 p-1.5 focus-within:border-teal-500 transition-all">
                <input
                  type="text"
                  placeholder={`Ask about ${currentChapter.title}...`}
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendAiMessage();
                    }
                  }}
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
                />
                <button
                  disabled={!aiInput.trim() || isLoadingAi}
                  onClick={() => handleSendAiMessage()}
                  className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-all cursor-pointer shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN READING CANVAS (FULL WIDTH ENABLED) */}
      <main 
        ref={chapterContentRef}
        className="flex-1 overflow-y-auto py-8 custom-scrollbar"
      >
        <div className={`space-y-10 ${maxWidthClasses}`}>
          
          {/* CHAPTER HEADER BANNER */}
          <section className="space-y-4 pb-8 border-b border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-teal-950/80 border border-teal-600/50 text-xs font-mono text-teal-300 font-bold uppercase tracking-wider">
                  {currentChapter.partTitle}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {currentChapter.pageRange}
                </span>
              </div>

              {/* Ask AI about this chapter shortcut button */}
              <button
                onClick={() => {
                  setAiContextSection(currentChapter.title);
                  setIsAiDrawerOpen(true);
                }}
                className="px-3 py-1 rounded-xl bg-teal-950 hover:bg-teal-900/60 border border-teal-700/60 text-teal-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Explain Chapter with AI</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight font-serif leading-tight">
              {currentChapter.number > 0 && (
                <span className="text-teal-400 block text-base sm:text-xl font-mono font-bold mb-2">
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
                
                {/* Section Title with Ask AI shortcut */}
                <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                  <h2 className={`font-bold tracking-tight text-slate-100 ${
                    section.level === 2 ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl text-teal-300'
                  }`}>
                    {section.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setAiContextSection(section.title);
                        setIsAiDrawerOpen(true);
                      }}
                      className="text-[11px] font-mono text-slate-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Ask AI about this specific section"
                    >
                      <Sparkles className="w-3 h-3 text-teal-400" />
                      <span className="hidden sm:inline">Ask AI</span>
                    </button>
                    <a 
                      href={`#${section.id}`} 
                      className="text-slate-500 hover:text-teal-400 text-xs font-mono"
                      title="Link to section"
                    >
                      #
                    </a>
                  </div>
                </div>

                {/* Key Concept Callout Box */}
                {section.keyConcept && (
                  <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-teal-300 font-mono">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      <span>Key Concept: {section.keyConcept.title}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {section.keyConcept.takeaway}
                    </p>
                    {section.keyConcept.interviewTip && (
                      <div className="text-[11px] text-amber-300/90 font-mono pt-1 border-t border-teal-900/50 flex items-center gap-1.5 font-sans">
                        <span className="font-bold">🎯 Interview Focus:</span>
                        <span>{section.keyConcept.interviewTip}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Verbatim Paragraphs (NOT A SINGLE LINE CHANGED) */}
                <div className={`space-y-4 text-slate-200 ${fontFamilyClasses} ${fontSizeClasses}`}>
                  {section.content.map((para, pIdx) => (
                    <p key={pIdx} className="leading-relaxed text-justify">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Code Snippet */}
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

                {/* Footnote */}
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

// Helper user icon
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
