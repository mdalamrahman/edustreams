import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Clock, 
  Workflow, 
  LayoutGrid, 
  Route, 
  Blocks, 
  Scale, 
  PenTool, 
  Globe, 
  GitMerge, 
  Server, 
  Cloud, 
  Zap, 
  ListOrdered, 
  Database, 
  CopyPlus, 
  Shield, 
  DoorOpen, 
  TableProperties, 
  Copy, 
  SplitSquareHorizontal, 
  BookOpen, 
  TriangleAlert, 
  CheckCheck, 
  CircleDashed, 
  LayoutTemplate, 
  Calculator, 
  MessageSquare, 
  BarChart, 
  PlugZap, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2, 
  Split, 
  GitBranch, 
  Compass, 
  Github, 
  BookOpenText, 
  Star, 
  FolderGit2, 
  Layers3,
  Search,
  Moon,
  Sun,
  ArrowUp,
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  Layers,
  Smartphone,
  Radio,
  Network,
  Lock,
  Boxes,
  HelpCircle,
  AlertTriangle,
  Flame,
  Check
} from 'lucide-react';
import { CURATED_HLD_TOPICS, CuratedGitHubTopic } from '../lib/githubLld';

interface HLDBossSheetProps {
  onOpenGithubTopic?: (topic: CuratedGitHubTopic) => void;
  onOpenBookChapter?: (chapterId: string) => void;
}

export const HLDBossSheet: React.FC<HLDBossSheetProps> = ({ onOpenGithubTopic, onOpenBookChapter }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { id: 'overview', title: '00. Overview & Fast Track', num: '00' },
    { id: 'minimum', title: '01. SDE-1 Student Minimum', num: '01' },
    { id: 'mental-model', title: '02. Physical Mental Models', num: '02' },
    { id: 'request-flow', title: '03. Request Lifecycle Flow', num: '03' },
    { id: 'tradeoffs', title: '04. Core System Trade-offs', num: '04' },
    { id: 'memory-map', title: '05. 15 Building Blocks Memory Map', num: '05' },
    { id: 'beyond', title: '06. Beyond Basics (Resilience & Idempotency)', num: '06' },
    { id: 'blocks', title: '07. Deep Dive: Top 5 HLD Blocks', num: '07' },
    { id: 'pairs', title: '08. Confusion Killers (Pair Comparisons)', num: '08' },
    { id: 'numbers', title: '09. Back-of-the-Envelope Estimates', num: '09' },
    { id: 'framework', title: '10. The 7-Step Attack Framework', num: '10' },
    { id: 'triggers', title: '11. Interview Triggers & Keywords', num: '11' },
    { id: 'mistakes', title: '12. Common Traps & Mistakes to Avoid', num: '12' },
    { id: 'comms', title: '13. Communication Protocols & APIs', num: '13' },
    { id: 'faqs', title: '14. Top 10 HLD Case Studies', num: '14' },
    { id: 'concepts', title: '15. Advanced Distributed Concepts', num: '15' },
    { id: 'revision', title: '16. Revision Checklist (20 Mins)', num: '16' },
    { id: 'resources', title: '17. Deep Dive GitHub Reader', num: '17' },
    { id: 'ddia-book', title: '18. DDIA Animated Book (Martin Kleppmann)', num: '18' },
  ];

  const filteredNavItems = navItems.filter(item => 
    !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setIsSidebarOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`rounded-3xl border transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-[#0b0f19] border-slate-800 text-slate-100' 
        : 'bg-[#faf9f6] border-[#24211d]/15 text-[#24211d]'
    }`}>
      
      {/* Top Floating Control Bar */}
      <header className={`sticky top-0 z-40 px-6 py-3.5 border-b backdrop-blur-md flex items-center justify-between transition-colors ${
        theme === 'dark'
          ? 'bg-[#0b0f19]/90 border-slate-800'
          : 'bg-[#faf9f6]/90 border-[#24211d]/10'
      }`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
            title="Toggle Index"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm tracking-tight block">HLD Boss Sheet</span>
              <span className="text-[10px] text-teal-400 font-mono">System Design Revision Matrix</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
            <input
              type="text"
              placeholder="Search concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-slate-200 w-full placeholder-slate-500"
            />
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </header>

      <div className="flex relative">
        
        {/* Left Sticky Sidebar Index */}
        <aside className={`fixed lg:sticky top-[61px] left-0 h-[calc(100vh-61px)] w-72 p-4 border-r overflow-y-auto z-30 transition-all ${
          theme === 'dark' ? 'bg-[#0d121f] border-slate-800' : 'bg-[#f5f3ef] border-[#24211d]/10'
        } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5" /> Chapters (17 Modules)
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-teal-950/80 text-teal-300 border border-teal-800/80 font-bold'
                        : 'bg-teal-50 text-teal-800 border border-teal-200 font-bold'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:bg-[#161f30] hover:text-slate-200'
                      : 'text-slate-600 hover:bg-[#eae6df] hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{item.title}</span>
                  <span className="text-[10px] font-mono opacity-60 ml-2">{item.num}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-12 select-text">
          
          {/* SECTION 00: OVERVIEW HERO */}
          <section id="overview" className={`relative rounded-3xl p-6 sm:p-10 border overflow-hidden shadow-2xl ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#0b0f19] border-slate-800'
              : 'bg-gradient-to-br from-[#fcfbf8] via-[#f3f0ec] to-[#fcfbf8] border-[#24211d]/10'
          }`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Complete Whiteboard Mastery
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 text-white">
              HLD / System Design Boss Sheet
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mb-6">
              The complete memory map for High-Level Design interviews. Every building block with one vivid physical analogy, request lifecycles, core trade-offs, and attack formulas.
            </p>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs mb-6">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-bold">20-Minute Pre-Interview Sprint:</strong>
                <p className="text-slate-300 mt-1">
                  Jump directly to <strong>Section 16 (Revision Checklist)</strong>, the 15 building blocks in <strong>Section 5</strong>, and the 7-step attack framework in <strong>Section 10</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button 
                onClick={() => scrollToSection('framework')}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Workflow className="w-3.5 h-3.5" /> 7-Step Attack Flow
              </button>
              <button 
                onClick={() => scrollToSection('memory-map')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5" /> 15 Building Blocks
              </button>
              <button 
                onClick={() => scrollToSection('resources')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
              >
                <BookOpenText className="w-3.5 h-3.5 text-teal-400" /> Deep Dive GitHub Reader
              </button>
            </div>
          </section>

          {/* SECTION 01: STUDENT MINIMUM */}
          <section id="minimum" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 01</span>
              <h2 className="text-xl font-bold text-white">Start Here: The Student Minimum</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A fresher / SDE-1 system design round is <strong>NOT</strong> asking you to design Google from scratch. Most interviewers want to see that you can take a vague problem, draw a sane high-level diagram, and reason about a few trade-offs out loud.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="flex items-center gap-2.5 text-teal-400 font-bold text-sm">
                  <Route className="w-4 h-4" /> 1. The Request Flow
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Can you draw client &rarr; load balancer &rarr; servers &rarr; cache &rarr; database and explain each box cleanly?</p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="flex items-center gap-2.5 text-blue-400 font-bold text-sm">
                  <Blocks className="w-4 h-4" /> 2. Key Building Blocks
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Load balancer, caching, SQL vs NoSQL, replication, sharding, and message queues. Know what each does and WHEN to reach for it.</p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="flex items-center gap-2.5 text-purple-400 font-bold text-sm">
                  <Scale className="w-4 h-4" /> 3. Trade-off Talk
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">SQL vs NoSQL, strong vs eventual consistency, scale up vs out. You don't need the 'right' answer; you need to weigh both sides.</p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="flex items-center gap-2.5 text-pink-400 font-bold text-sm">
                  <PenTool className="w-4 h-4" /> 4. Design ONE System End-to-End
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">A URL shortener or rate limiter is the classic warm-up; Twitter feed / WhatsApp are the step-up. Walk through API, hashing, DB choice, and caching aloud.</p>
              </div>
            </div>
          </section>

          {/* SECTION 02: MENTAL MODEL */}
          <section id="mental-model" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 02</span>
              <h2 className="text-xl font-bold text-white">Physical Mental Models: Why Design Feels Overwhelming</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              DSA has a compiler: code passes or it doesn't. System design is an open whiteboard. The fix is <strong>ONE physical picture per concept</strong> so you remember it under interview pressure.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-300 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="p-3.5 border-b border-slate-800">The Dry Definition</th>
                    <th className="p-3.5 border-b border-slate-800">The Physical Picture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 text-slate-400">"Consistent hashing minimizes key remapping when the cluster is resized."</td>
                    <td className="p-3.5 font-bold text-teal-300">A round dining table — add one guest and others barely shift their seats.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 text-slate-400">"Eventual consistency: replicas converge after a bounded delay."</td>
                    <td className="p-3.5 font-bold text-teal-300">A WhatsApp group like count — off by 2 for a second, nobody is harmed.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 text-slate-400">"A load balancer distributes requests across a server pool."</td>
                    <td className="p-3.5 font-bold text-teal-300">Station ticket windows — one officer routes passengers to the shortest queue.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 text-slate-400">"Message queues buffer write spikes asynchronously."</td>
                    <td className="p-3.5 font-bold text-teal-300">McDonald's order token system — take token, burger prepared asynchronously.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 03: REQUEST LIFECYCLE */}
          <section id="request-flow" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 03</span>
              <h2 className="text-xl font-bold text-white">The Request Lifecycle — How One Click Reaches A Server</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Before any building block makes sense, you need the one diagram every design is built on. If you can draw and narrate this, you can start ANY system design answer.
            </p>
            
            {/* Visual Interactive Flow Diagram */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl overflow-x-auto">
              <div className="flex items-center gap-3 min-w-[800px] justify-between text-center font-sans">
                
                {/* Node: Client */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center flex-1">
                  <Smartphone className="w-6 h-6 text-indigo-400 mb-1.5" />
                  <strong className="text-xs font-bold text-slate-200">1. Client</strong>
                  <span className="text-[10px] text-slate-400 font-mono">browser / mobile app</span>
                </div>
                
                <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

                {/* Node: DNS */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-purple-800/50 flex flex-col items-center flex-1">
                  <Globe className="w-6 h-6 text-purple-400 mb-1.5" />
                  <strong className="text-xs font-bold text-slate-200">2. DNS</strong>
                  <span className="text-[10px] text-slate-400 font-mono">domain &rarr; IP resolution</span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

                {/* Node: Load Balancer */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-800/50 flex flex-col items-center flex-1">
                  <GitMerge className="w-6 h-6 text-emerald-400 mb-1.5" />
                  <strong className="text-xs font-bold text-slate-200">3. Load Balancer</strong>
                  <span className="text-[10px] text-slate-400 font-mono">Nginx / AWS ALB</span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

                {/* Node: Web Server */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-blue-800/50 flex flex-col items-center flex-1">
                  <Server className="w-6 h-6 text-blue-400 mb-1.5" />
                  <strong className="text-xs font-bold text-slate-200">4. Web Server</strong>
                  <span className="text-[10px] text-slate-400 font-mono">Stateless microservice</span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

                {/* Node: Cache */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-amber-800/50 flex flex-col items-center flex-1">
                  <Zap className="w-6 h-6 text-amber-400 mb-1.5" />
                  <strong className="text-xs font-bold text-slate-200">5. RAM Cache</strong>
                  <span className="text-[10px] text-slate-400 font-mono">Redis / Memcached</span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

                {/* Node: Database */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-rose-800/50 flex flex-col items-center flex-1">
                  <Database className="w-6 h-6 text-rose-400 mb-1.5" />
                  <strong className="text-xs font-bold text-slate-200">6. Database</strong>
                  <span className="text-[10px] text-slate-400 font-mono">SQL / NoSQL (Disk)</span>
                </div>

              </div>
            </div>
          </section>

          {/* SECTION 04: CORE TRADEOFFS */}
          <section id="tradeoffs" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 04</span>
              <h2 className="text-xl font-bold text-white">The Core Trade-offs: Every Decision Has A Cost</h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-300 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="p-3.5 border-b border-slate-800">Trade-off</th>
                    <th className="p-3.5 border-b border-slate-800">Meaning</th>
                    <th className="p-3.5 border-b border-slate-800">Rule of Thumb</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-slate-200">Latency vs Throughput</td>
                    <td className="p-3.5 text-slate-400">Latency = time for ONE request.<br/>Throughput = requests handled per second.</td>
                    <td className="p-3.5 text-teal-300 font-medium">Optimize latency for user-facing clicks; throughput for batch pipelines.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-slate-200">Consistency vs Availability</td>
                    <td className="p-3.5 text-slate-400">Show only latest data vs always return an answer.</td>
                    <td className="p-3.5 text-teal-300 font-medium">Money/inventory &rarr; Consistency. Social feeds/likes &rarr; Availability.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-slate-200">Scale Up vs Scale Out</td>
                    <td className="p-3.5 text-slate-400">Bigger machine vs many smaller machines.</td>
                    <td className="p-3.5 text-teal-300 font-medium">Scale up first for simplicity; scale out when hitting hardware limits or need fault tolerance.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-slate-200">Stateful vs Stateless</td>
                    <td className="p-3.5 text-slate-400">Server remembers session vs forgets all state.</td>
                    <td className="p-3.5 text-teal-300 font-medium">Keep web servers stateless so any server can handle any request behind a load balancer.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-slate-200">Read-heavy vs Write-heavy</td>
                    <td className="p-3.5 text-slate-400">Far more reads than writes vs heavy incoming write streams.</td>
                    <td className="p-3.5 text-teal-300 font-medium">Read-heavy &rarr; Cache + Read Replicas. Write-heavy &rarr; Sharding + Message Queues.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-slate-200">SQL vs NoSQL</td>
                    <td className="p-3.5 text-slate-400">Structured tables + ACID vs flexible schema + horizontal scale.</td>
                    <td className="p-3.5 text-teal-300 font-medium">Relationships + strict ACID &rarr; SQL. Massive volume + flexible documents &rarr; NoSQL.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 05: THE 15 BUILDING BLOCKS MEMORY MAP */}
          <section id="memory-map" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 05</span>
              <h2 className="text-xl font-bold text-white">The 15 Building-Block Memory Map</h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-300 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="p-3 border-b border-slate-800">#</th>
                    <th className="p-3 border-b border-slate-800">Building Block</th>
                    <th className="p-3 border-b border-slate-800">Desi Analogy / Hook</th>
                    <th className="p-3 border-b border-slate-800">What It Does</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  {[
                    { id: 1, name: 'Load Balancer', hook: 'Bheed ko counters pe baant do. (Railway ticket window)', desc: 'Spreads incoming requests across many identical servers so no single one gets overwhelmed.' },
                    { id: 2, name: 'Horiz/Vertical Scaling', hook: 'Ek super-chef vs zyada cooks. (Kitchen scale)', desc: 'Vertical = bigger machine. Horizontal = more servers behind a load balancer.' },
                    { id: 3, name: 'Caching', hook: 'Baar-baar wali cheez haath ke paas rakho. (Desk notes)', desc: 'Stores copies in fast RAM so most reads skip the slow database.' },
                    { id: 4, name: 'CDN', hook: 'Door ki factory nahi, paas ki dukaan. (Local kirana store)', desc: 'Worldwide edge servers storing static content physically close to users.' },
                    { id: 5, name: 'Rate Limiting', hook: 'Club ka bouncer entry ginta hai. (Entry gate cap)', desc: 'Caps requests a user/IP can make in a window, protecting from abuse.' },
                    { id: 6, name: 'API Gateway', hook: 'Building ka reception desk. (Visitor security & routing)', desc: 'Single entry point handling auth, routing, rate limiting, and SSL termination.' },
                    { id: 7, name: 'SQL vs NoSQL', hook: 'Pakka ledger vs flexible sticky-note box.', desc: 'SQL = relational ACID consistency. NoSQL = flexible documents scaling horizontally.' },
                    { id: 8, name: 'Replication', hook: 'Ledger ki photocopy, sab padh sakein.', desc: 'Keeps copies of DB in sync to spread reads and survive server crashes.' },
                    { id: 9, name: 'Sharding / Partitioning', hook: 'Ek mota phonebook ko A-M, N-Z mein todo.', desc: 'Splits huge datasets across machines by a shard key.' },
                    { id: 10, name: 'Database Indexing', hook: 'Kitaab ke peeche ka index section.', desc: 'Sorted B-Tree/Hash lookup turning slow full-table scans into fast jumps.' },
                    { id: 11, name: 'CAP Theorem', hook: 'Teen mein se do hi mil sakte hain. (Pick two)', desc: 'During network partition, choose between Consistency (refuse stale) or Availability (always answer).' },
                    { id: 12, name: 'Consistency Models', hook: 'Turant pakka vs thodi der mein pakka. (WhatsApp tick)', desc: 'Strong = always latest. Eventual = briefly stale, converges quickly.' },
                    { id: 13, name: 'Consistent Hashing', hook: 'Gol mez pe seat, naya mehmaan sabko na hilaaye.', desc: 'Add/remove servers moving only ~1/N of data, avoiding full reshuffle.' },
                    { id: 14, name: 'Message Queue', hook: 'Order token lo, kitchen apne pace pe banaye.', desc: 'Buffer decoupling producer (drop task) and consumer (async processing).' },
                    { id: 15, name: 'Microservices vs Monolith', hook: 'Ek bada general store vs specialty shops ka mall.', desc: 'Monolith = one codebase. Microservices = independent deployable services.' },
                  ].map(b => (
                    <tr key={b.id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-mono text-slate-500">{b.id}</td>
                      <td className="p-3 font-bold text-slate-200">{b.name}</td>
                      <td className="p-3 text-teal-300 font-medium">{b.hook}</td>
                      <td className="p-3 text-slate-400">{b.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 06: BEYOND BASICS */}
          <section id="beyond" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 06</span>
              <h2 className="text-xl font-bold text-white">Beyond Basics: Resilience & Distributed Safety</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <Shield className="w-4 h-4" /> Idempotency Keys
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Prevents duplicate charges if network times out during checkout. Client sends unique UUID in header (<code>Idempotency-Key: abc-123</code>). Server saves key in Redis; duplicate attempts return cached success without charging twice.
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Flame className="w-4 h-4" /> Circuit Breaker Pattern
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Trips open when a downstream payment microservice fails repeatedly. Stops cascading thread exhaustion by failing immediately or returning fallback responses until service recovers.
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Radio className="w-4 h-4" /> Dead Letter Queues (DLQ)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Poison messages that crash consumers after N retries are diverted to a separate DLQ for engineer inspection, preventing pipeline stalls.
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Database className="w-4 h-4" /> Write-Ahead Logging (WAL)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Before applying mutations to in-memory tables, writes are appended sequentially to a durable append-only log file on disk to survive sudden crashes.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 07: DEEP DIVE ON TOP 5 BLOCKS */}
          <section id="blocks" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 07</span>
              <h2 className="text-xl font-bold text-white">Deep Dive: Top 5 HLD Building Blocks</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border bg-slate-900/50 border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-teal-300">1. Load Balancer Routing Strategies</h3>
                <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc">
                  <li><strong>Round Robin:</strong> Cycles 1, 2, 3 sequentially. Simple, ideal when requests have equal processing weight.</li>
                  <li><strong>Least Connections:</strong> Routes to server with fewest active TCP sockets. Best for long-lived WebSockets.</li>
                  <li><strong>IP Hash:</strong> Hashes client IP to bind user to same server (useful for session affinity / sticky sessions).</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/50 border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-teal-300">2. Caching Strategies & Eviction</h3>
                <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc">
                  <li><strong>Cache-Aside:</strong> App reads cache. On miss, reads DB & populates cache. Simple, handles sudden crashes.</li>
                  <li><strong>Write-Through:</strong> App writes to cache & DB synchronously. No stale reads, higher write latency.</li>
                  <li><strong>Write-Back:</strong> App writes only to cache; cache flushes to DB asynchronously in batches. Ultra-fast writes, risk of data loss on crash.</li>
                  <li><strong>Eviction:</strong> LRU (Least Recently Used), LFU (Least Frequently Used), and strict TTL expirations.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/50 border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-teal-300">3. Database Sharding & Partition Keys</h3>
                <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc">
                  <li><strong>Range-Based Sharding:</strong> E.g. Users A-M on DB1, N-Z on DB2. Risk of hotspotting if popular keys cluster together.</li>
                  <li><strong>Hash-Based Sharding:</strong> <code>ShardID = hash(user_id) % num_shards</code>. Uniform spread, cross-shard joins become difficult.</li>
                  <li><strong>Consistent Hashing:</strong> Nodes arranged on a 2^32 ring; adding a shard moves only 1/N keys.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 08: CONFUSION KILLERS */}
          <section id="pairs" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 08</span>
              <h2 className="text-xl font-bold text-white">Confusion Killers: Side-by-Side Comparisons</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Replication vs Sharding</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Replication</strong> makes exact duplicate copies of the same database for read scalability and failover.<br/>
                  <strong>Sharding</strong> divides massive tables into separate slices across machines to fit data into memory.
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Cache vs CDN</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Cache (Redis)</strong> sits next to web servers in the data center to store dynamic query results.<br/>
                  <strong>CDN (Cloudflare)</strong> sits at edge locations globally to serve static media (images, videos, JS).
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Polling vs WebSockets vs SSE</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Polling:</strong> Client repeatedly asks every 5s (wasteful).<br/>
                  <strong>WebSockets:</strong> Full-duplex persistent bidirectional TCP connection (Chat/Gaming).<br/>
                  <strong>SSE:</strong> One-way server push over plain HTTP (Live stock ticker).
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Kafka vs RabbitMQ</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>RabbitMQ:</strong> Smart broker, dumb consumer. Message deleted once acked. Great for transactional tasks.<br/>
                  <strong>Kafka:</strong> Dumb broker, smart consumer. Partitioned append-only log with replayability.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 09: BACK-OF-THE-ENVELOPE NUMBERS */}
          <section id="numbers" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 09</span>
              <h2 className="text-xl font-bold text-white">Back-of-the-Envelope Estimates & Latency Numbers</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2 font-mono text-xs">
                <div className="text-teal-400 font-bold font-sans text-sm">Latency Numbers Every Engineer Knows</div>
                <div className="space-y-1.5 text-slate-300 pt-1">
                  <div>L1 Cache Reference: <strong>0.5 ns</strong></div>
                  <div>Main Memory (RAM) Read: <strong>100 ns</strong></div>
                  <div>SSD Random Read: <strong>16,000 ns (16 µs)</strong></div>
                  <div>Send Packet CA to Netherlands: <strong>150 ms</strong></div>
                  <div>Hard Disk Seek: <strong>10 ms</strong> (RAM is 100,000x faster than disk!)</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2 font-mono text-xs">
                <div className="text-blue-400 font-bold font-sans text-sm">Everyday Scale Math Shortcuts</div>
                <div className="space-y-1.5 text-slate-300 pt-1">
                  <div>1 Day = <strong>86,400 seconds ≈ 100,000 s</strong></div>
                  <div>1 Million requests/day = <strong>~12 QPS</strong></div>
                  <div>100 Million requests/day = <strong>~1,200 QPS</strong></div>
                  <div>1 KB per user &times; 100M users = <strong>100 GB storage</strong></div>
                  <div>1 MB per video &times; 1M uploads/day = <strong>1 TB/day = 365 TB/yr</strong></div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 10: 7-STEP ATTACK FRAMEWORK */}
          <section id="framework" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 10</span>
              <h2 className="text-xl font-bold text-white">The 7-Step Attack Framework</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Walk these 7 steps in order, out loud, every single interview. Structured communication is what earns top senior marks.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { step: '1', title: 'Clarify Requirements (3-5 min)', icon: MessageSquare, desc: 'Pin down functional needs (e.g. create short link) and non-functional needs (availability, read:write ratio, latency). Never start coding without asking.' },
                { step: '2', title: 'Estimate Scale & Constraints', icon: BarChart, desc: 'DAU, QPS, Storage over 5 years. Determines whether you need a single DB or sharded NoSQL cluster.' },
                { step: '3', title: 'Define Core API Contracts', icon: PlugZap, desc: 'Write REST/gRPC endpoints (e.g. POST /api/v1/shorten, GET /:hash). Gives concrete anchor for diagram.' },
                { step: '4', title: 'Sketch High-Level Request Spine', icon: PenTool, desc: 'Client &rarr; DNS &rarr; Load Balancer &rarr; App Server &rarr; Cache &rarr; Database.' },
                { step: '5', title: 'Design Data Model & Schema', icon: Database, desc: 'Define table schemas, primary keys, indexing strategies, and justify SQL vs NoSQL.' },
                { step: '6', title: 'Scale Bottlenecks with Blocks', icon: ArrowUpRight, desc: 'Add Redis for hot read caching, message queues for async writes, and read replicas.' },
                { step: '7', title: 'Trade-offs, Failure & Security', icon: ShieldAlert, desc: 'Discuss what breaks if a master DB dies, SPOFs, rate limiting, and DDoS protection.' }
              ].map(f => {
                const Icon = f.icon;
                return (
                  <div key={f.step} className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                      <span className="w-5 h-5 rounded-full bg-teal-950 border border-teal-700/60 text-teal-300 text-[10px] font-mono flex items-center justify-center font-bold">{f.step}</span>
                      <span>{f.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 11: INTERVIEW TRIGGERS */}
          <section id="triggers" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 11</span>
              <h2 className="text-xl font-bold text-white">Interview Triggers & Architectural Reflexes</h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-300 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="p-3.5 border-b border-slate-800">When Interviewer Says...</th>
                    <th className="p-3.5 border-b border-slate-800">Your Immediate Architectural Reflex</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-slate-200">"Real-time bi-directional messaging (WhatsApp)"</td>
                    <td className="p-3.5 text-teal-300 font-medium">WebSockets + Gateway Session Registry + Redis Pub/Sub</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-slate-200">"Sudden viral traffic spikes / Flash Sale"</td>
                    <td className="p-3.5 text-teal-300 font-medium">Message Queue buffer (Kafka/RabbitMQ) + Redis Token Bucket Rate Limiter</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-slate-200">"Celebrity post causes write hotspot (Twitter)"</td>
                    <td className="p-3.5 text-teal-300 font-medium">Hybrid Feed: Push for normal users, Pull on demand for celebrities</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-slate-200">"Nearby driver tracking (Uber/Lyft)"</td>
                    <td className="p-3.5 text-teal-300 font-medium">Geohash / QuadTree spatial index + In-memory Redis Geospatial</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-slate-200">"Heavy analytics on historical logs"</td>
                    <td className="p-3.5 text-teal-300 font-medium">Columnar Store (ClickHouse / Amazon Redshift) + S3 Data Lake</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 12: COMMON MISTAKES */}
          <section id="mistakes" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 12</span>
              <h2 className="text-xl font-bold text-white">Top 5 System Design Traps to Avoid</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border bg-rose-950/20 border-rose-800/40 space-y-1.5">
                <strong className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> 1. Jumping to Database Schema First
                </strong>
                <p className="text-xs text-slate-300">Always establish high-level request flow and functional boundaries before writing database columns.</p>
              </div>

              <div className="p-5 rounded-2xl border bg-rose-950/20 border-rose-800/40 space-y-1.5">
                <strong className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> 2. Over-Engineering Kafka for 50 QPS
                </strong>
                <p className="text-xs text-slate-300">Scale the system only when justified by numbers. Start simple with PostgreSQL; introduce Kafka only when async throughput demands it.</p>
              </div>

              <div className="p-5 rounded-2xl border bg-rose-950/20 border-rose-800/40 space-y-1.5">
                <strong className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> 3. Silent Thinking
                </strong>
                <p className="text-xs text-slate-300">Whiteboard rounds are communication exams. Narrate every decision, trade-off, and alternative considered out loud.</p>
              </div>

              <div className="p-5 rounded-2xl border bg-rose-950/20 border-rose-800/40 space-y-1.5">
                <strong className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> 4. Ignoring Single Points of Failure (SPOF)
                </strong>
                <p className="text-xs text-slate-300">Every box you draw (LB, DB, Cache) must have a failover replica or standby pair.</p>
              </div>
            </div>
          </section>

          {/* SECTION 13: PROTOCOLS & APIS */}
          <section id="comms" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 13</span>
              <h2 className="text-xl font-bold text-white">Communication Protocols: REST vs gRPC vs GraphQL</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="font-bold text-sm text-teal-400">REST (HTTP/1.1 & 2)</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  JSON payload, standard verbs (GET, POST, PUT, DELETE). Ubiquitous, easy to cache with CDNs. Ideal for public web/mobile APIs.
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="font-bold text-sm text-indigo-400">gRPC (HTTP/2 + Protobuf)</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Binary serialization, strongly-typed contracts, multiplexed bidirectional streaming. 7-10x faster than JSON. Ideal for internal microservices.
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="font-bold text-sm text-pink-400">GraphQL</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Single endpoint where clients specify exact fields needed. Solves over-fetching and under-fetching on mobile apps.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 14: TOP 10 CASE STUDIES */}
          <section id="faqs" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 14</span>
              <h2 className="text-xl font-bold text-white">Top 10 Classic HLD Interview Case Studies</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: '1. TinyURL / URL Shortener', tech: 'Base62 Hashing + Redis Cache + SQL/NoSQL', desc: 'Convert long URLs to short 7-char hash, handle redirect with 301/302, ensure counter range distribution across workers.' },
                { title: '2. Twitter / X News Feed', tech: 'Fan-out on Write + Redis ZSET Timelines', desc: 'Hybrid fanout: push to active followers, pull on demand for celebrities with 50M+ followers.' },
                { title: '3. WhatsApp / Messenger', tech: 'WebSockets + Erlang/Go Gateway + Cassandra', desc: 'Bi-directional chat sessions, message acknowledgements (single/double/blue ticks), offline message queues.' },
                { title: '4. Netflix / YouTube Video Stream', tech: 'Transcoding Pipeline + CDN + Adaptive Bitrate (HLS/DASH)', desc: 'Chunk videos into 10s fragments across resolutions (480p, 1080p, 4K), cache chunks on ISP edge CDNs.' },
                { title: '5. Uber / Ride Matching Service', tech: 'Geohash / Google S2 + Redis Geo + WebSocket', desc: 'Driver location updates every 4s, match rider within radius, calculate dynamic surge pricing.' },
                { title: '6. Distributed Rate Limiter', tech: 'Redis Lua Script + Token Bucket / Sliding Window', desc: 'Throttle abusive clients at API Gateway before hitting downstream services.' },
                { title: '7. Web Crawler (Google)', tech: 'BFS Queue + Bloom Filter + Robots.txt cache', desc: 'Download web pages, extract URLs, deduplicate visited URLs using Bloom filter in RAM.' },
                { title: '8. Stripe / Payment Gateway', tech: 'Idempotency Keys + Two-Phase Commit / Saga + Postgres', desc: 'Zero double charges, ACID transactions for money movement, webhook retry with exponential backoff.' },
              ].map(c => (
                <div key={c.title} className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-bold text-slate-100">{c.title}</strong>
                  </div>
                  <span className="text-[11px] font-mono text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60 inline-block">{c.tech}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 15: ADVANCED CONCEPTS */}
          <section id="concepts" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 15</span>
              <h2 className="text-xl font-bold text-white">Advanced Distributed Systems Concepts</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="text-teal-400 font-bold text-sm">Bloom Filters</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Probabilistic bit-array data structure that answers "Is this element definitely NOT in set, or MIGHT be in set?". Uses 0.1% RAM compared to hash tables; saves slow disk lookups.
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="text-blue-400 font-bold text-sm">Saga Pattern for Distributed Transactions</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Replaces slow 2PC (Two-Phase Commit) locks in microservices with a chain of local transactions. If step 3 fails, compensating rollback transactions undo steps 2 and 1.
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="text-purple-400 font-bold text-sm">Consensus Protocols (Raft & Paxos)</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enables a cluster of distributed nodes (like ZooKeeper / etcd) to agree on leader election and state machine replication even if nodes crash.
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="text-amber-400 font-bold text-sm">Gossip Protocol</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Peer-to-peer decentralized communication used by Cassandra where nodes periodically ping random peers to share cluster health without any centralized coordinator.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 16: REVISION */}
          <section id="revision" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 16</span>
              <h2 className="text-xl font-bold text-white">Revision — The Last 20 Minutes Before The Round</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <Split className="w-4 h-4" /> The 4 Confusion Tells
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-1">
                  <li>• <strong>Replication</strong> = copy same data. <strong>Sharding</strong> = split data pieces.</li>
                  <li>• <strong>Strong</strong> = always latest (money). <strong>Eventual</strong> = briefly stale (likes).</li>
                  <li>• <strong>Cache</strong> = RAM near server. <strong>CDN</strong> = static files near user.</li>
                  <li>• <strong>Horizontal</strong> = more machines (LB). <strong>Vertical</strong> = bigger machine.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <GitBranch className="w-4 h-4" /> The Request Spine
                </div>
                <p className="text-xs text-slate-300 font-mono pt-1">
                  Client &rarr; DNS &rarr; Load Balancer &rarr; Web Server &rarr; Cache &rarr; Database.
                </p>
                <p className="text-xs text-slate-400">
                  CDN off to the side for static files. Message queue off to the side for slow background jobs. Start here, then add boxes.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-300 font-bold">You learned 15 building blocks as 15 physical pictures, not 15 dry definitions.</p>
                <p className="text-slate-300 mt-1">
                  Match the situation to a picture, draw the request spine, and name your trade-offs out loud. You don't need to design Google — you need to think clearly and communicate. You've got this!
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 17: CURATED HLD GITHUB READER */}
          <section id="resources" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 17</span>
              <h2 className="text-xl font-bold text-white">Curated System Design GitHub Deep Dives</h2>
            </div>
            <p className="text-xs text-slate-400">
              Click any guide below to open and read full high-resolution markdown notes directly on SDETube without external redirects.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {CURATED_HLD_TOPICS.map((top) => (
                <div
                  key={top.id}
                  onClick={() => onOpenGithubTopic?.(top)}
                  className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 hover:border-teal-500/60 hover:bg-slate-900 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2 text-teal-300 font-bold text-xs mb-1.5">
                      <BookOpenText className="w-4 h-4 text-teal-400" />
                      <span className="line-clamp-1">{top.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3 line-clamp-2">{top.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>Read Article</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 18: DDIA ANIMATED BOOK SHOWCASE */}
          <section id="ddia-book" className="space-y-5">
            <div className="border-b pb-3 border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 18</span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Designing Data-Intensive Applications</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700/60 font-mono">
                    Full Animated E-Book
                  </span>
                </h2>
              </div>
              <button
                onClick={() => onOpenBookChapter?.('chapter-1')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Launch Complete E-Book</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              The complete, verbatim text of Martin Kleppmann's distributed systems classic, enriched with live interactive architecture animations, simulation whiteboards, and concept summaries.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: 'chapter-1', num: 1, title: 'Reliable, Scalable, Maintainable', desc: 'Thinking about data systems, fault tolerance, Twitter fan-out load, tail latency percentiles.', part: 'Part I. Foundations' },
                { id: 'chapter-2', num: 2, title: 'Data Models & Query Languages', desc: 'Relational vs Document vs Graph models, CODASYL history, Cypher, SPARQL, and Datalog.', part: 'Part I. Foundations' },
                { id: 'chapter-3', num: 3, title: 'Storage and Retrieval', desc: 'Hash indexes, Bitcask, SSTables, LSM-Trees, B-Trees, OLAP data cubes, and columnar storage.', part: 'Part I. Foundations' },
                { id: 'chapter-4', num: 4, title: 'Encoding and Evolution', desc: 'MessagePack, Thrift, Protocol Buffers, Avro schemas, REST vs RPC fallacies, and message passing.', part: 'Part I. Foundations' },
                { id: 'chapter-5', num: 5, title: 'Replication', desc: 'Single-leader, multi-leader, leaderless quorums (w+r>n), replication lag anomalies, and version vectors.', part: 'Part II. Distributed Data' },
                { id: 'chapter-6', num: 6, title: 'Partitioning (Sharding)', desc: 'Key range vs hash partitioning, local vs global secondary indexes, rebalancing, and routing.', part: 'Part II. Distributed Data' },
                { id: 'chapter-7', num: 7, title: 'Transactions & ACID', desc: 'Read committed, Snapshot Isolation (MVCC), lost updates, write skew, phantoms, and SSI tripwires.', part: 'Part II. Distributed Data' },
                { id: 'chapter-8', num: 8, title: 'The Trouble with Distributed Systems', desc: 'Network timeouts, clock drift, process pauses (GC), fencing tokens, and Byzantine generals.', part: 'Part II. Distributed Data' },
                { id: 'chapter-9', num: 9, title: 'Consistency and Consensus', desc: 'Linearizability vs Serializability, CAP dilemma, Lamport timestamps, 2PC, Raft, and ZooKeeper.', part: 'Part II. Distributed Data' },
                { id: 'chapter-10', num: 10, title: 'Batch Processing', desc: 'Unix pipes philosophy, MapReduce dataflow, sort-merge joins, Spark RDDs, and Pregel graph models.', part: 'Part III. Derived Data' },
                { id: 'chapter-11', num: 11, title: 'Stream Processing', desc: 'Kafka partitioned logs, consumer offsets, Dual writes vs CDC, event sourcing calculus, and windowing.', part: 'Part III. Derived Data' },
              ].map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => onOpenBookChapter?.(ch.id)}
                  className="p-5 rounded-3xl border bg-slate-900/60 border-slate-800 hover:border-teal-500/60 hover:bg-slate-900 transition-all flex flex-col justify-between group cursor-pointer shadow-xl"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-teal-950 border border-teal-800/60 text-[10px] font-mono text-teal-300 font-bold">
                        Chapter {ch.num}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{ch.part}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                      {ch.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {ch.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-slate-500">Verbatim + Animated</span>
                    <span className="text-teal-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Read Chapter</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-xs text-slate-500 pt-8 pb-12 border-t border-slate-800/80">
            HLD Boss Sheet • Cloud Storage Edition • Authored by @rathoreadiitya
          </footer>

        </main>
      </div>
    </div>
  );
};
