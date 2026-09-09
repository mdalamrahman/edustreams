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
  Pause, 
  Type, 
  Sparkles, 
  Check, 
  Copy, 
  Sliders, 
  Maximize2, 
  Minimize2, 
  Bot, 
  Send, 
  Loader2, 
  Lightbulb, 
  Sun,
  Moon,
  Compass
} from 'lucide-react';
import { 
  DDIA_PARTS, 
  DDIA_CHAPTERS, 
  searchDDIABook, 
  SearchResult 
} from '../../data/books/ddia';
import { DDIADiagramAnimator } from './DDIADiagramAnimator';
import { executeAIChatCascade } from '../../lib/mistral';

type ReaderTheme = 'oreilly' | 'sepia' | 'dark' | 'cyber';

interface ThemeDefinition {
  id: ReaderTheme;
  name: string;
  tagline: string;
  dotColor: string;
  accentDot: string;
  rootClass: string;
  headerClass: string;
  cardClass: string;
  cardSoftClass: string;
  calloutClass: string;
  calloutBadgeClass: string;
  calloutTitleClass: string;
  epigraphClass: string;
  codeSnippetClass: string;
  codeHeaderClass: string;
  codeTextClass: string;
  buttonClass: string;
  buttonActiveClass: string;
  brandBadgeClass: string;
  headingTextClass: string;
  bodyTextClass: string;
  mutedTextClass: string;
  accentTextClass: string;
  accentBgClass: string;
  borderClass: string;
  drawerClass: string;
  drawerHeaderClass: string;
  inputClass: string;
  tocActiveItemClass: string;
  tocInactiveItemClass: string;
  progressBarColor: string;
}

const THEMES: Record<ReaderTheme, ThemeDefinition> = {
  oreilly: {
    id: 'oreilly',
    name: "O'Reilly Classic",
    tagline: 'Authentic White & Crimson',
    dotColor: '#ffffff',
    accentDot: '#ce0000',
    rootClass: 'bg-[#faf9f6] text-[#1f2937] selection:bg-red-200 selection:text-red-950',
    headerClass: 'bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm',
    cardClass: 'bg-white border-slate-200/90 shadow-sm',
    cardSoftClass: 'bg-slate-50 border-slate-200',
    calloutClass: 'bg-[#fff8f8] border border-red-200/90 border-l-4 border-l-[#ce0000] text-slate-800 shadow-sm',
    calloutBadgeClass: 'bg-red-100 text-red-800 border-red-200',
    calloutTitleClass: 'text-[#ce0000]',
    epigraphClass: 'bg-white border-l-4 border-[#ce0000] border border-slate-200 text-slate-800 shadow-sm',
    codeSnippetClass: 'bg-[#0f172a] border-slate-800',
    codeHeaderClass: 'bg-[#1e293b] border-slate-800 text-slate-200',
    codeTextClass: 'text-emerald-300',
    buttonClass: 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700',
    buttonActiveClass: 'bg-[#ce0000] text-white shadow',
    brandBadgeClass: 'bg-[#ce0000] text-white font-black',
    headingTextClass: 'text-slate-900',
    bodyTextClass: 'text-[#1f2937]',
    mutedTextClass: 'text-slate-500',
    accentTextClass: 'text-[#ce0000]',
    accentBgClass: 'bg-[#ce0000]',
    borderClass: 'border-slate-200',
    drawerClass: 'bg-white text-slate-800 border-l border-slate-200 shadow-2xl',
    drawerHeaderClass: 'bg-slate-50 border-b border-slate-200',
    inputClass: 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400 focus-within:border-red-500',
    tocActiveItemClass: 'bg-red-50 text-red-800 border border-red-300 font-bold shadow-sm',
    tocInactiveItemClass: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
    progressBarColor: 'bg-[#ce0000]'
  },
  sepia: {
    id: 'sepia',
    name: 'Kindle Warm Sepia',
    tagline: 'Warm Parchment & Espresso',
    dotColor: '#fbf0d9',
    accentDot: '#9e2a2b',
    rootClass: 'bg-[#fbf0d9] text-[#2d231b] selection:bg-[#edd8b6] selection:text-[#4d1f1f]',
    headerClass: 'bg-[#f4e6ca]/95 backdrop-blur-md border-b border-[#e2d2b0] text-[#2d231b] shadow-sm',
    cardClass: 'bg-[#f5ead5] border-[#dfcfae] shadow-sm',
    cardSoftClass: 'bg-[#eee0c3] border-[#decbb0]',
    calloutClass: 'bg-[#f6ebd7] border border-[#decbb0] border-l-4 border-l-[#9e2a2b] text-[#2d231b] shadow-sm',
    calloutBadgeClass: 'bg-[#edd8b6] text-[#782324] border-[#d8c29d]',
    calloutTitleClass: 'text-[#9e2a2b]',
    epigraphClass: 'bg-[#f5ebd7] border-l-4 border-[#9e2a2b] border-[#e2d2b0] text-[#2d231b] shadow-sm',
    codeSnippetClass: 'bg-[#241c16] border-[#3d2f24]',
    codeHeaderClass: 'bg-[#2f241d] border-[#3d2f24] text-[#e0cfad]',
    codeTextClass: 'text-[#fcd34d]',
    buttonClass: 'bg-[#eedcb9] hover:bg-[#e4d1ab] border-[#d8c59f] text-[#3d3024]',
    buttonActiveClass: 'bg-[#9e2a2b] text-white shadow',
    brandBadgeClass: 'bg-[#9e2a2b] text-white font-black',
    headingTextClass: 'text-[#241a12]',
    bodyTextClass: 'text-[#2d231b]',
    mutedTextClass: 'text-[#7d6b5c]',
    accentTextClass: 'text-[#9e2a2b]',
    accentBgClass: 'bg-[#9e2a2b]',
    borderClass: 'border-[#e2d2b0]',
    drawerClass: 'bg-[#fbf0d9] text-[#2d231b] border-l border-[#e2d2b0] shadow-2xl',
    drawerHeaderClass: 'bg-[#f4e6ca] border-b border-[#e2d2b0]',
    inputClass: 'bg-[#eedcb9] border-[#d8c59f] text-[#2d231b] placeholder-[#8d7967] focus-within:border-[#9e2a2b]',
    tocActiveItemClass: 'bg-[#edd8b6] text-[#782324] border border-[#d8c29d] font-bold shadow-sm',
    tocInactiveItemClass: 'text-[#3d3024] hover:bg-[#eedcb9] hover:text-[#241a12]',
    progressBarColor: 'bg-[#9e2a2b]'
  },
  dark: {
    id: 'dark',
    name: 'Safari Night',
    tagline: 'Deep Obsidian & Ruby Red',
    dotColor: '#0d1117',
    accentDot: '#f85149',
    rootClass: 'bg-[#0d1117] text-[#e6edf3] selection:bg-red-950/80 selection:text-red-200',
    headerClass: 'bg-[#161b22]/95 backdrop-blur-md border-b border-[#30363d] text-[#e6edf3] shadow-sm',
    cardClass: 'bg-[#161b22] border-[#30363d] shadow-sm',
    cardSoftClass: 'bg-[#21262d] border-[#30363d]',
    calloutClass: 'bg-[#161b22] border border-[#30363d] border-l-4 border-l-[#f85149] text-[#e6edf3] shadow-sm',
    calloutBadgeClass: 'bg-red-950/60 text-red-300 border-red-800/50',
    calloutTitleClass: 'text-[#f85149]',
    epigraphClass: 'bg-[#161b22] border-l-4 border-[#f85149] border-[#30363d] text-[#e6edf3] shadow-sm',
    codeSnippetClass: 'bg-[#090d14] border-[#30363d]',
    codeHeaderClass: 'bg-[#161b22] border-[#30363d] text-slate-200',
    codeTextClass: 'text-teal-300',
    buttonClass: 'bg-[#21262d] hover:bg-[#30363d] border-[#30363d] text-slate-300',
    buttonActiveClass: 'bg-[#f85149] text-white shadow',
    brandBadgeClass: 'bg-[#f85149] text-white font-black',
    headingTextClass: 'text-[#f0f6fc]',
    bodyTextClass: 'text-[#e6edf3]',
    mutedTextClass: 'text-[#8b949e]',
    accentTextClass: 'text-[#f85149]',
    accentBgClass: 'bg-[#f85149]',
    borderClass: 'border-[#30363d]',
    drawerClass: 'bg-[#0d1117] text-[#e6edf3] border-l border-[#30363d] shadow-2xl',
    drawerHeaderClass: 'bg-[#161b22] border-b border-[#30363d]',
    inputClass: 'bg-[#21262d] border-[#30363d] text-[#e6edf3] placeholder-slate-500 focus-within:border-red-500',
    tocActiveItemClass: 'bg-red-950/40 text-red-300 border border-red-700/50 font-bold shadow-sm',
    tocInactiveItemClass: 'text-slate-300 hover:bg-[#21262d] hover:text-white',
    progressBarColor: 'bg-[#f85149]'
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Blueprint',
    tagline: 'Technical Cyan & Navy',
    dotColor: '#090d16',
    accentDot: '#14b8a6',
    rootClass: 'bg-[#090d16] text-[#c8d6e5] selection:bg-cyan-500/30 selection:text-cyan-200',
    headerClass: 'bg-[#0e1626]/95 backdrop-blur-md border-b border-[#1e293b] text-slate-200 shadow-sm',
    cardClass: 'bg-[#0e1626] border-[#1e293b] shadow-sm',
    cardSoftClass: 'bg-[#131f37] border-[#1e293b]',
    calloutClass: 'bg-[#0d172a] border border-teal-500/30 border-l-4 border-l-teal-400 text-slate-200 shadow-sm',
    calloutBadgeClass: 'bg-teal-950/70 text-teal-300 border-teal-700/50',
    calloutTitleClass: 'text-teal-400',
    epigraphClass: 'bg-[#0d172a] border-l-4 border-teal-500 border-teal-900/40 text-slate-200 shadow-sm',
    codeSnippetClass: 'bg-[#060911] border-[#1e293b]',
    codeHeaderClass: 'bg-[#0d1527] border-[#1e293b] text-slate-200',
    codeTextClass: 'text-cyan-300',
    buttonClass: 'bg-[#131f37] hover:bg-[#1a2b4c] border-[#1e293b] text-slate-300',
    buttonActiveClass: 'bg-teal-600 text-white shadow',
    brandBadgeClass: 'bg-teal-600 text-white font-black',
    headingTextClass: 'text-slate-100',
    bodyTextClass: 'text-[#c8d6e5]',
    mutedTextClass: 'text-slate-400',
    accentTextClass: 'text-teal-400',
    accentBgClass: 'bg-teal-600',
    borderClass: 'border-[#1e293b]',
    drawerClass: 'bg-[#090d16] text-[#c8d6e5] border-l border-[#1e293b] shadow-2xl',
    drawerHeaderClass: 'bg-[#0e1626] border-b border-[#1e293b]',
    inputClass: 'bg-[#131f37] border-[#1e293b] text-slate-100 placeholder-slate-500 focus-within:border-teal-500',
    tocActiveItemClass: 'bg-teal-950/50 text-teal-300 border border-teal-600/50 font-bold shadow-sm',
    tocInactiveItemClass: 'text-slate-300 hover:bg-[#131f37] hover:text-white',
    progressBarColor: 'bg-teal-400'
  }
};

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

  // Reader Settings State - DEFAULT TO AUTHENTIC O'REILLY THEME & FULL WIDTH
  const [theme, setTheme] = useState<ReaderTheme>(() => {
    const saved = localStorage.getItem('ddia_reader_theme');
    if (saved === 'light' || saved === 'oreilly') return 'oreilly';
    if (saved === 'sepia' || saved === 'dark' || saved === 'cyber') return saved;
    return 'oreilly';
  });

  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>(() => {
    return (localStorage.getItem('ddia_reader_font') as any) || 'base';
  });

  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>(() => {
    return (localStorage.getItem('ddia_reader_family') as any) || 'serif';
  });

  const [lineSpacing, setLineSpacing] = useState<'normal' | 'relaxed' | 'loose'>(() => {
    return (localStorage.getItem('ddia_reader_spacing') as any) || 'relaxed';
  });

  const [readingWidth, setReadingWidth] = useState<'medium' | 'wide' | 'full'>('full');

  // "Aa" Settings Popover
  const [isAaMenuOpen, setIsAaMenuOpen] = useState(false);
  const aaMenuRef = useRef<HTMLDivElement>(null);

  // Reading progress tracker
  const [readingProgress, setReadingProgress] = useState(0);

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
      content: 'Welcome to Designing Data-Intensive Applications! I am your DDIA Distributed Systems Architect AI assistant. Ask me any question about the architectures, trade-offs, algorithms, or system design interview applications from this book!'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const aiChatEndRef = useRef<HTMLDivElement>(null);

  // Active Chapter Reference
  const currentChapter = DDIA_CHAPTERS.find((c) => c.id === selectedChapterId) || DDIA_CHAPTERS[1];
  const chapterContentRef = useRef<HTMLDivElement>(null);

  // Active theme configuration
  const themeConfig = THEMES[theme] || THEMES.oreilly;

  // Save last visited chapter
  useEffect(() => {
    localStorage.setItem('ddia_last_chapter', selectedChapterId);
    if (chapterContentRef.current) {
      chapterContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setReadingProgress(0);
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
  useEffect(() => {
    localStorage.setItem('ddia_reader_spacing', lineSpacing);
  }, [lineSpacing]);

  // Close "Aa" popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (aaMenuRef.current && !aaMenuRef.current.contains(e.target as Node)) {
        setIsAaMenuOpen(false);
      }
    };
    if (isAaMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAaMenuOpen]);

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

  // Track scroll reading progress
  const handleScroll = () => {
    if (chapterContentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chapterContentRef.current;
      if (scrollHeight > clientHeight) {
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setReadingProgress(Math.min(100, Math.max(0, progress)));
      }
    }
  };

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

  // Typography scaling
  const fontSizeClasses = {
    sm: 'text-[15px]',
    base: 'text-[17px]',
    lg: 'text-[19px]',
    xl: 'text-[21px]'
  }[fontSize];

  const lineSpacingClasses = {
    normal: 'leading-relaxed',
    relaxed: 'leading-[1.88]',
    loose: 'leading-[2.15]'
  }[lineSpacing];

  const fontFamilyClasses = fontFamily === 'serif' ? 'font-serif' : 'font-sans';

  // Full-width container classes
  const maxWidthClasses = {
    medium: 'max-w-4xl mx-auto px-4 sm:px-8',
    wide: 'max-w-6xl mx-auto px-6 sm:px-10',
    full: 'w-full max-w-none px-6 sm:px-12 xl:px-24 2xl:px-32'
  }[readingWidth];

  return (
    <div 
      ref={containerRef}
      className={`relative w-full min-h-screen transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen overflow-hidden rounded-none' : 'rounded-3xl border shadow-2xl overflow-hidden'
      } flex flex-col ${themeConfig.rootClass} ${themeConfig.borderClass}`}
    >
      
      {/* TOP READING PROGRESS BAR */}
      <div className="h-1 w-full bg-black/5 dark:bg-white/5 overflow-hidden z-40">
        <div 
          className={`h-full transition-all duration-150 ${themeConfig.progressBarColor}`}
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* TOP STICKY TOOLBAR (O'REILLY & SAFARI INSPIRED) */}
      <header className={`sticky top-0 z-30 px-4 sm:px-6 py-3 ${themeConfig.headerClass} flex items-center justify-between gap-2 sm:gap-4 flex-wrap`}>
        
        {/* Left: O'Reilly Brand Pill, TOC Trigger & Chapter Indicator */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className={`p-2 rounded-xl ${themeConfig.buttonClass} transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0`}
            title="Open Table of Contents"
          >
            <Menu className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Contents</span>
          </button>

          {/* O'Reilly Brand Badge */}
          <div className="hidden md:flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-sm text-[11px] font-black tracking-wider uppercase ${themeConfig.brandBadgeClass}`}>
              O'REILLY®
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider flex-shrink-0 ${themeConfig.calloutBadgeClass}`}>
                {currentChapter.number === 0 ? 'Preface' : `Ch ${currentChapter.number}`}
              </span>
              <span className={`text-xs font-bold truncate ${themeConfig.headingTextClass} hidden lg:inline max-w-xs xl:max-w-md`}>
                {currentChapter.title}
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right Toolbar Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap flex-shrink-0">
          
          {/* ASK AI BUTTON (O'Reilly Distributed Systems AI) */}
          <button
            onClick={() => {
              setAiContextSection(currentChapter.sections[0]?.title || '');
              setIsAiDrawerOpen(true);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all ${
              theme === 'oreilly'
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white hover:brightness-110 shadow-red-500/20'
                : 'bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 text-white hover:brightness-110 shadow-teal-500/20'
            }`}
            title="Ask DDIA AI questions about this chapter"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span className="font-mono">Ask DDIA AI</span>
          </button>

          {/* Quick Search */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className={`p-2 rounded-xl ${themeConfig.buttonClass} transition-all cursor-pointer flex items-center gap-1.5`}
            title="Search Book Passages"
          >
            <Search className={`w-4 h-4 ${themeConfig.accentTextClass}`} />
            <span className="text-xs font-semibold hidden xl:inline">Search</span>
          </button>

          {/* Audio TTS */}
          <button
            onClick={toggleSpeech}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              isSpeaking
                ? `${themeConfig.accentBgClass} text-white shadow-lg animate-pulse`
                : themeConfig.buttonClass
            }`}
            title={isSpeaking ? 'Pause Audio Narration' : 'Listen with Audio TTS'}
          >
            {isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-xs font-semibold hidden lg:inline">{isSpeaking ? 'Pause' : 'Listen'}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => toggleBookmark(currentChapter.id)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              bookmarks.includes(currentChapter.id)
                ? `${themeConfig.accentBgClass} text-white shadow`
                : themeConfig.buttonClass
            }`}
            title="Bookmark Chapter"
          >
            <Bookmark className={`w-4 h-4 ${bookmarks.includes(currentChapter.id) ? 'fill-white' : ''}`} />
          </button>

          {/* "Aa" TYPOGRAPHY & THEME SETTINGS POPOVER (KINDLE / SAFARI STYLE) */}
          <div className="relative" ref={aaMenuRef}>
            <button
              onClick={() => setIsAaMenuOpen(!isAaMenuOpen)}
              className={`px-2.5 py-1.5 rounded-xl ${themeConfig.buttonClass} font-serif font-bold text-xs flex items-center gap-1 cursor-pointer transition-all ${
                isAaMenuOpen ? 'ring-2 ring-current' : ''
              }`}
              title="Display & Typography Options (Aa)"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Aa</span>
            </button>

            {isAaMenuOpen && (
              <div className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl p-4 shadow-2xl border ${themeConfig.cardClass} z-50 space-y-4 animate-fadeIn font-sans`}>
                <div className="flex items-center justify-between pb-2 border-b border-current/10">
                  <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Reading Theme & Style</span>
                  </div>
                  <button 
                    onClick={() => setIsAaMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Theme Selector with Live Swatches */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Themes</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(THEMES) as ReaderTheme[]).map((tKey) => {
                      const t = THEMES[tKey];
                      const isSelected = theme === tKey;
                      return (
                        <button
                          key={tKey}
                          onClick={() => setTheme(tKey)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                            isSelected 
                              ? 'ring-2 ring-red-600 border-red-600 bg-black/5 dark:bg-white/5 font-bold' 
                              : 'border-current/20 hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <div 
                            className="w-5 h-5 rounded-full border border-slate-300 shadow-sm flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: t.dotColor }}
                          >
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: t.accentDot }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs leading-tight truncate">{t.name}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Family (Serif vs Sans) */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Typeface</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFontFamily('serif')}
                      className={`py-2 px-3 rounded-xl border text-center font-serif text-sm cursor-pointer transition-all ${
                        fontFamily === 'serif'
                          ? `${themeConfig.buttonActiveClass} font-bold`
                          : `${themeConfig.buttonClass}`
                      }`}
                    >
                      Classic Serif
                    </button>
                    <button
                      onClick={() => setFontFamily('sans')}
                      className={`py-2 px-3 rounded-xl border text-center font-sans text-sm cursor-pointer transition-all ${
                        fontFamily === 'sans'
                          ? `${themeConfig.buttonActiveClass} font-bold`
                          : `${themeConfig.buttonClass}`
                      }`}
                    >
                      Modern Sans
                    </button>
                  </div>
                </div>

                {/* Font Size Scaling */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Font Size</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['sm', 'base', 'lg', 'xl'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        className={`py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-all ${
                          fontSize === s
                            ? `${themeConfig.buttonActiveClass}`
                            : `${themeConfig.buttonClass}`
                        }`}
                      >
                        {s === 'sm' ? '15px' : s === 'base' ? '17px' : s === 'lg' ? '19px' : '21px'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Line Spacing */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Line Spacing</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['normal', 'relaxed', 'loose'] as const).map((sp) => (
                      <button
                        key={sp}
                        onClick={() => setLineSpacing(sp)}
                        className={`py-1.5 rounded-lg border text-xs capitalize font-medium cursor-pointer transition-all ${
                          lineSpacing === sp
                            ? `${themeConfig.buttonActiveClass}`
                            : `${themeConfig.buttonClass}`
                        }`}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Page Width */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reading Width</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['medium', 'wide', 'full'] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => setReadingWidth(w)}
                        className={`py-1.5 rounded-lg border text-xs uppercase font-mono font-bold cursor-pointer transition-all ${
                          readingWidth === w
                            ? `${themeConfig.buttonActiveClass}`
                            : `${themeConfig.buttonClass}`
                        }`}
                      >
                        {w === 'medium' ? 'Standard' : w === 'wide' ? 'Wide' : '100% Full'}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Width Quick Selector (Full width, Wide, Medium) */}
          <div className="hidden sm:flex items-center rounded-xl border border-current/20 p-0.5">
            <button
              onClick={() => setReadingWidth('full')}
              className={`px-2 py-1 text-[11px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                readingWidth === 'full' ? themeConfig.buttonActiveClass : 'opacity-70 hover:opacity-100'
              }`}
              title="Full Width (100% Display)"
            >
              100%
            </button>
            <button
              onClick={() => setReadingWidth('wide')}
              className={`px-2 py-1 text-[11px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                readingWidth === 'wide' ? themeConfig.buttonActiveClass : 'opacity-70 hover:opacity-100'
              }`}
              title="Wide Reading Column"
            >
              Wide
            </button>
            <button
              onClick={() => setReadingWidth('medium')}
              className={`px-2 py-1 text-[11px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                readingWidth === 'medium' ? themeConfig.buttonActiveClass : 'opacity-70 hover:opacity-100'
              }`}
              title="Centered Column"
            >
              Std
            </button>
          </div>

          {/* Quick Theme Switcher Pills */}
          <div className="flex items-center rounded-xl border border-current/20 p-0.5">
            <button
              onClick={() => setTheme('oreilly')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                theme === 'oreilly' ? 'bg-[#ce0000] text-white shadow' : 'opacity-60 hover:opacity-100'
              }`}
              title="O'Reilly Classic White"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                theme === 'sepia' ? 'bg-[#9e2a2b] text-white shadow' : 'opacity-60 hover:opacity-100'
              }`}
              title="Kindle Warm Sepia"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                theme === 'dark' ? 'bg-[#f85149] text-white shadow' : 'opacity-60 hover:opacity-100'
              }`}
              title="Safari Night Dark"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* FULL SCREEN TOGGLE (Maximize2 / Minimize2) */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
              isFullscreen
                ? `${themeConfig.buttonActiveClass} ring-2 ring-current`
                : themeConfig.buttonClass
            }`}
            title={isFullscreen ? 'Exit Full Screen' : 'Toggle Full Screen View'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="text-xs font-bold hidden sm:inline">{isFullscreen ? 'Exit' : 'Full Screen'}</span>
          </button>

        </div>
      </header>

      {/* TABLE OF CONTENTS DRAWER / SIDEBAR */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn font-sans">
          <div onClick={() => setIsTocOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

          <div className={`relative w-full max-w-md h-full ${themeConfig.drawerClass} flex flex-col p-6 z-10 overflow-hidden`}>
            <div className={`flex items-center justify-between pb-4 border-b ${themeConfig.borderClass}`}>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${themeConfig.brandBadgeClass}`}>
                  O'REILLY
                </span>
                <h3 className={`text-base font-bold ${themeConfig.headingTextClass}`}>Table of Contents</h3>
              </div>
              <button
                onClick={() => setIsTocOpen(false)}
                className={`p-1.5 rounded-xl ${themeConfig.buttonClass} transition-all cursor-pointer`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 custom-scrollbar">
              {DDIA_PARTS.map((part) => (
                <div key={part.id} className="space-y-2">
                  <div className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg ${themeConfig.calloutBadgeClass}`}>
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
                                ? themeConfig.tocActiveItemClass
                                : themeConfig.tocInactiveItemClass
                            }`}
                          >
                            <div className="flex items-start space-x-2.5">
                              <span className="font-mono text-xs opacity-60 mt-0.5">
                                {ch.number === 0 ? '•' : `${ch.number}.`}
                              </span>
                              <div>
                                <div className="text-xs font-semibold leading-snug">{ch.title}</div>
                                <div className="text-[10px] opacity-60 font-mono mt-0.5">{ch.pageRange}</div>
                              </div>
                            </div>
                            {isBookmarked && (
                              <Bookmark className={`w-3.5 h-3.5 fill-current ${themeConfig.accentTextClass} flex-shrink-0 mt-1`} />
                            )}
                          </button>

                          {isCurrent && (
                            <div className={`ml-7 pl-2.5 border-l-2 ${themeConfig.accentTextClass} space-y-1 py-1`}>
                              {ch.sections.map((sec) => (
                                <button
                                  key={sec.id}
                                  onClick={() => {
                                    setIsTocOpen(false);
                                    const el = document.getElementById(sec.id);
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="w-full text-left px-2 py-1 rounded-lg text-[11px] opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 truncate transition-all cursor-pointer block"
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

            <div className={`pt-4 border-t ${themeConfig.borderClass} text-[11px] ${themeConfig.mutedTextClass} font-mono flex items-center justify-between`}>
              <span>Martin Kleppmann</span>
              <span className="font-bold">O'Reilly Media First Edition</span>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-20 animate-fadeIn font-sans">
          <div onClick={() => setIsSearchOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

          <div className={`relative w-full max-w-2xl ${themeConfig.cardClass} rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh] border ${themeConfig.borderClass}`}>
            <div className={`p-4 border-b ${themeConfig.borderClass} flex items-center gap-3 ${themeConfig.cardSoftClass}`}>
              <Search className={`w-5 h-5 ${themeConfig.accentTextClass} flex-shrink-0`} />
              <input
                type="text"
                autoFocus
                placeholder="Search across all 11 chapters (e.g. linearizability, fencing tokens, SSTable, 2PC)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-transparent text-sm ${themeConfig.headingTextClass} outline-none placeholder:opacity-50`}
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className={`p-1 rounded-lg ${themeConfig.buttonClass}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {searchResults.length === 0 ? (
                <div className={`text-center py-12 ${themeConfig.mutedTextClass} text-xs`}>
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
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer group ${themeConfig.cardSoftClass} hover:border-current/40`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${themeConfig.calloutBadgeClass}`}>
                        Chapter {res.chapterNumber}
                      </span>
                      <span className={`text-xs font-bold ${themeConfig.headingTextClass} group-hover:underline`}>
                        {res.sectionTitle}
                      </span>
                    </div>
                    <p className={`text-xs ${themeConfig.bodyTextClass} line-clamp-2 leading-relaxed opacity-85`}>
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
        <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn font-sans">
          <div onClick={() => setIsAiDrawerOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

          <div className={`relative w-full max-w-lg h-full ${themeConfig.drawerClass} flex flex-col z-10 overflow-hidden`}>
            {/* AI Header */}
            <div className={`p-4 border-b ${themeConfig.borderClass} ${themeConfig.drawerHeaderClass} flex items-center justify-between`}>
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-xl ${themeConfig.calloutBadgeClass}`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${themeConfig.headingTextClass} flex items-center gap-2`}>
                    <span>DDIA Architect AI</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${themeConfig.calloutBadgeClass}`}>
                      Ch {currentChapter.number} Context
                    </span>
                  </h3>
                  <p className={`text-[10px] ${themeConfig.mutedTextClass}`}>Ask questions about architectures, trade-offs, or interview patterns</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className={`p-1.5 rounded-xl ${themeConfig.buttonClass} transition-all cursor-pointer`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Questions Chips */}
            <div className={`p-3 border-b ${themeConfig.borderClass} ${themeConfig.cardSoftClass} space-y-1.5`}>
              <div className={`text-[10px] font-mono font-bold ${themeConfig.accentTextClass} uppercase tracking-wider flex items-center gap-1`}>
                <Lightbulb className="w-3 h-3" />
                <span>Suggested Questions for this Chapter:</span>
              </div>
              <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
                {getChapterQuestions(currentChapter.number).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendAiMessage(q)}
                    className={`text-left px-2.5 py-1.5 rounded-xl border text-[11px] transition-all cursor-pointer line-clamp-1 ${themeConfig.cardClass} hover:border-current/40`}
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
                    msg.role === 'user' 
                      ? 'bg-red-600 text-white' 
                      : `${themeConfig.calloutBadgeClass}`
                  }`}>
                    {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white font-sans'
                      : `${themeConfig.cardClass} border ${themeConfig.borderClass} ${themeConfig.bodyTextClass} font-sans shadow-md`
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoadingAi && (
                <div className={`flex items-center gap-2 text-xs font-mono p-3 rounded-2xl border ${themeConfig.calloutBadgeClass} w-fit`}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking through DDIA principles...</span>
                </div>
              )}
              <div ref={aiChatEndRef} />
            </div>

            {/* Input Box */}
            <div className={`p-3 border-t ${themeConfig.borderClass} ${themeConfig.drawerHeaderClass}`}>
              <div className={`flex items-center gap-2 rounded-2xl border p-1.5 transition-all ${themeConfig.inputClass}`}>
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
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs outline-none"
                />
                <button
                  disabled={!aiInput.trim() || isLoadingAi}
                  onClick={() => handleSendAiMessage()}
                  className={`p-2 rounded-xl ${themeConfig.buttonActiveClass} disabled:opacity-40 text-white transition-all cursor-pointer shadow`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN READING CANVAS (FULL WIDTH ENABLED & VERBATIM BOOK TEXT) */}
      <main 
        ref={chapterContentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-8 sm:py-12 custom-scrollbar"
      >
        <div className={`space-y-12 ${maxWidthClasses}`}>
          
          {/* CHAPTER HEADER BANNER (O'REILLY STYLE) */}
          <section className={`space-y-4 pb-8 border-b ${themeConfig.borderClass}`}>
            
            {/* O'Reilly Series Eyebrow Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-sm text-[11px] font-black uppercase tracking-widest ${themeConfig.brandBadgeClass} font-sans`}>
                  O'REILLY®
                </span>
                <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${themeConfig.accentTextClass}`}>
                  {currentChapter.partTitle}
                </span>
                <span className={`text-xs ${themeConfig.mutedTextClass} font-mono`}>
                  • {currentChapter.pageRange}
                </span>
              </div>

              {/* Ask AI shortcut */}
              <button
                onClick={() => {
                  setAiContextSection(currentChapter.title);
                  setIsAiDrawerOpen(true);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${themeConfig.calloutBadgeClass}`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Explain Chapter with AI</span>
              </button>
            </div>

            {/* Chapter Title */}
            <h1 className={`text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${themeConfig.headingTextClass} font-serif leading-tight`}>
              {currentChapter.number > 0 && (
                <span className={`block text-base sm:text-xl font-mono font-bold mb-2 ${themeConfig.accentTextClass}`}>
                  Chapter {currentChapter.number}
                </span>
              )}
              {currentChapter.title}
            </h1>

            {/* Epigraph Quote (O'Reilly Signature Left Red Border) */}
            {currentChapter.epigraph && (
              <div className={`p-5 rounded-2xl ${themeConfig.epigraphClass} space-y-2 italic font-serif`}>
                <p className={`text-sm sm:text-base leading-relaxed ${themeConfig.bodyTextClass}`}>
                  "{currentChapter.epigraph.quote}"
                </p>
                <div className={`text-right text-xs font-mono font-bold ${themeConfig.accentTextClass} not-italic`}>
                  — {currentChapter.epigraph.author}
                </div>
              </div>
            )}
          </section>

          {/* CHAPTER SECTIONS WITH EXACT VERBATIM BOOK TEXT */}
          <div className="space-y-14">
            {currentChapter.sections.map((section) => (
              <article key={section.id} id={section.id} className="space-y-6 scroll-mt-24">
                
                {/* Section Title with Ask AI shortcut */}
                <div className={`flex items-center justify-between border-b pb-2 ${themeConfig.borderClass}`}>
                  <h2 className={`font-extrabold tracking-tight ${
                    section.level === 2 
                      ? `text-xl sm:text-2xl ${themeConfig.headingTextClass}` 
                      : `text-lg sm:text-xl ${themeConfig.accentTextClass}`
                  }`}>
                    {section.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setAiContextSection(section.title);
                        setIsAiDrawerOpen(true);
                      }}
                      className={`text-[11px] font-mono ${themeConfig.mutedTextClass} hover:${themeConfig.accentTextClass} flex items-center gap-1 cursor-pointer transition-colors`}
                      title="Ask AI about this specific section"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span className="hidden sm:inline">Ask AI</span>
                    </button>
                    <a 
                      href={`#${section.id}`} 
                      className={`text-xs font-mono ${themeConfig.mutedTextClass} hover:${themeConfig.accentTextClass}`}
                      title="Link to section"
                    >
                      #
                    </a>
                  </div>
                </div>

                {/* Key Concept Callout Box (O'REILLY ARCHITECTURE NOTE) */}
                {section.keyConcept && (
                  <div className={`p-5 rounded-2xl ${themeConfig.calloutClass} space-y-3 shadow-sm transition-all font-sans`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className={`flex items-center space-x-2 text-xs font-bold font-mono ${themeConfig.calloutTitleClass}`}>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${themeConfig.calloutBadgeClass}`}>
                          O'REILLY NOTE
                        </span>
                        <span className="truncate">{section.keyConcept.title}</span>
                      </div>
                      <span className={`text-[10px] font-mono ${themeConfig.mutedTextClass}`}>Key Principle</span>
                    </div>
                    <p className={`text-xs sm:text-[13px] leading-relaxed ${themeConfig.bodyTextClass}`}>
                      {section.keyConcept.takeaway}
                    </p>
                    {section.keyConcept.interviewTip && (
                      <div className={`text-[11px] pt-2 border-t ${themeConfig.borderClass} flex items-start gap-1.5 font-sans`}>
                        <span className="font-bold flex-shrink-0">🎯 Interview Focus:</span>
                        <span className="opacity-90">{section.keyConcept.interviewTip}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Verbatim Paragraphs (NOT A SINGLE WORD ALTERED) */}
                <div className={`space-y-6 ${themeConfig.bodyTextClass} ${fontFamilyClasses} ${fontSizeClasses} ${lineSpacingClasses}`}>
                  {section.content.map((para, pIdx) => (
                    <p key={pIdx} className="text-left tracking-[0.01em]">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Code Snippet */}
                {section.codeSnippet && (
                  <div className={`my-6 rounded-2xl overflow-hidden border shadow-lg ${themeConfig.codeSnippetClass}`}>
                    <div className={`px-4 py-2 flex items-center justify-between border-b ${themeConfig.codeHeaderClass}`}>
                      <span className="text-[11px] font-mono font-bold">
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
                    <pre className={`p-4 text-xs font-mono overflow-x-auto leading-relaxed ${themeConfig.codeTextClass}`}>
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
                  <div className={`text-xs ${themeConfig.mutedTextClass} italic pt-2 border-t ${themeConfig.borderClass} font-sans`}>
                    {section.footnote}
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* CHAPTER REFERENCES */}
          {currentChapter.references && currentChapter.references.length > 0 && (
            <section className={`pt-8 border-t ${themeConfig.borderClass} space-y-4 font-sans`}>
              <h3 className={`text-base font-bold ${themeConfig.headingTextClass} flex items-center gap-2`}>
                <span>References</span>
                <span className={`text-xs font-mono ${themeConfig.mutedTextClass} font-normal`}>
                  ({currentChapter.references.length} citations)
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {currentChapter.references.map((ref) => (
                  <div key={ref.id} className={`p-3 rounded-xl border ${themeConfig.cardSoftClass} ${themeConfig.borderClass}`}>
                    <span className={`${themeConfig.accentTextClass} font-bold mr-2`}>[{ref.id}]</span>
                    <span className={themeConfig.bodyTextClass}>{ref.text}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CHAPTER BOTTOM NAVIGATION */}
          <footer className={`pt-8 border-t ${themeConfig.borderClass} flex flex-col sm:flex-row items-center justify-between gap-4 font-sans`}>
            {prevChapter ? (
              <button
                onClick={() => setSelectedChapterId(prevChapter.id)}
                className={`w-full sm:w-auto px-5 py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group ${themeConfig.buttonClass}`}
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <div className="text-left">
                  <div className={`text-[10px] ${themeConfig.mutedTextClass} font-mono`}>Previous Chapter</div>
                  <div className={themeConfig.headingTextClass}>{prevChapter.title}</div>
                </div>
              </button>
            ) : <div />}

            {nextChapter && (
              <button
                onClick={() => setSelectedChapterId(nextChapter.id)}
                className={`w-full sm:w-auto px-5 py-3 rounded-2xl ${themeConfig.buttonActiveClass} text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg group`}
              >
                <div className="text-right">
                  <div className="text-[10px] opacity-80 font-mono">Next Chapter</div>
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
