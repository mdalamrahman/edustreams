import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Clock, 
  Workflow, 
  LayoutGrid, 
  ExternalLink, 
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
  Smartphone
} from 'lucide-react';

export const HLDBossSheet: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { id: 'overview', title: 'Overview', num: '00' },
    { id: 'minimum', title: '1. Student minimum', num: '01' },
    { id: 'mental-model', title: '2. Why it\'s overwhelming', num: '02' },
    { id: 'request-flow', title: '3. Request lifecycle', num: '03' },
    { id: 'tradeoffs', title: '4. Core tradeoffs', num: '04' },
    { id: 'memory-map', title: '5. Memory map', num: '05' },
    { id: 'beyond', title: '6. Beyond basics', num: '06' },
    { id: 'blocks', title: '7. The 15 blocks', num: '07' },
    { id: 'pairs', title: '8. Confusion killers', num: '08' },
    { id: 'numbers', title: '9. Estimates', num: '09' },
    { id: 'framework', title: '10. 7-step framework', num: '10' },
    { id: 'triggers', title: '11. Interview triggers', num: '11' },
    { id: 'mistakes', title: '12. Common mistakes', num: '12' },
    { id: 'comms', title: '13. Comms & APIs', num: '13' },
    { id: 'faqs', title: '14. Interview FAQs', num: '14' },
    { id: 'concepts', title: '15. More concepts', num: '15' },
    { id: 'revision', title: '16. Revision (20 mins)', num: '16' },
    { id: 'resources', title: 'Web resources', num: '17' },
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
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-[#0a0a0a] text-[#e7e1d9]' 
        : 'bg-[#f7f6f2] text-[#24211d]'
    }`}>
      
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Container */}
      <div className="flex w-full">
        
        {/* Sticky Left Sidebar Navigation */}
        <aside className={`fixed top-0 bottom-0 left-0 w-72 z-50 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          theme === 'dark'
            ? 'bg-[#121212] border-r border-[#262626]'
            : 'bg-[#fcfbf8] border-r border-[#24211d]/10'
        } p-5 flex flex-col h-screen overflow-y-auto`}>
          
          {/* Brand Header */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-blue-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight">HLD Boss Sheet</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400">System Design Notes</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={toggleTheme}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                theme === 'dark'
                  ? 'bg-[#1a1a1a] border-[#333] hover:bg-[#262626] text-slate-300'
                  : 'bg-[#f3f0ec] border-[#24211d]/10 hover:bg-[#ede9e2] text-slate-700'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                theme === 'dark'
                  ? 'bg-[#1a1a1a] border-[#333] hover:bg-[#262626] text-slate-300'
                  : 'bg-[#f3f0ec] border-[#24211d]/10 hover:bg-[#ede9e2] text-slate-700'
              }`}
              title="Scroll to Top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Box */}
          <div className={`relative mb-4 rounded-xl border flex items-center px-3 ${
            theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-[#f3f0ec] border-[#24211d]/10'
          }`}>
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search HLD concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 bg-transparent text-xs outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-200">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Sections</div>
          <nav className="space-y-1 flex-1">
            {filteredNavItems.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-teal-950/60 text-teal-300 border border-teal-800/60 font-semibold'
                        : 'bg-teal-50 text-teal-800 border border-teal-200 font-semibold'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:bg-[#1a1a1a] hover:text-slate-200'
                      : 'text-slate-600 hover:bg-[#f3f0ec] hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{item.title}</span>
                  <span className="text-[10px] font-mono opacity-50 ml-2">{item.num}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-72 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-12">
          
          {/* Mobile Top Header Toggle */}
          <div className="flex lg:hidden items-center justify-between p-4 rounded-2xl border mb-6 bg-slate-900/60 border-slate-800">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-teal-400" />
              <span className="text-sm font-bold">HLD Boss Sheet</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Section: Overview Hero */}
          <section id="overview" className={`relative rounded-3xl p-6 sm:p-10 border overflow-hidden shadow-2xl ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-[#121212] via-[#161616] to-[#121212] border-[#262626]'
              : 'bg-gradient-to-br from-[#fcfbf8] via-[#f3f0ec] to-[#fcfbf8] border-[#24211d]/10'
          }`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> 0 to interview-ready
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              HLD / System Design Boss Sheet
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed mb-6">
              The memory map. Every building block with one desi analogy, so the whiteboard round stops feeling like a black box.
            </p>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs mb-6">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">If you have only 20 minutes:</strong>
                <p className="text-slate-300 mt-1">
                  Jump straight to <strong>Section 16 (Revision)</strong>, the memory map in <strong>Section 5</strong>, and the 7-step framework in <strong>Section 10</strong>.
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
                <ExternalLink className="w-3.5 h-3.5" /> Web Resources
              </button>
            </div>
          </section>

          {/* Section 1: Student Minimum */}
          <section id="minimum" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 1</span>
              <h3 className="text-xl font-bold">Start Here: The Student Minimum</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Honest truth first. A fresher / SDE-1 system design round is <strong>NOT</strong> asking you to design Google from scratch. Most interviewers want to see that you can take a vague problem, draw a sane high-level diagram, and reason about a few trade-offs out loud. What actually gets tested:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2.5 text-teal-400 font-bold text-sm">
                  <Route className="w-4 h-4" /> 1. The Request Flow
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Can you draw client &rarr; load balancer &rarr; servers &rarr; cache &rarr; database and explain each box cleanly.</p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2.5 text-blue-400 font-bold text-sm">
                  <Blocks className="w-4 h-4" /> 2. Key Building Blocks
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Load balancer, caching, SQL vs NoSQL, replication, sharding, and message queues. Know what each does and WHEN to reach for it.</p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2.5 text-purple-400 font-bold text-sm">
                  <Scale className="w-4 h-4" /> 3. Trade-off Talk
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">SQL vs NoSQL, strong vs eventual consistency, scale up vs out. You don't need the 'right' answer; you need to weigh both sides.</p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2.5 text-pink-400 font-bold text-sm">
                  <PenTool className="w-4 h-4" /> 4. Design ONE System End-to-End
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">A URL shortener or rate limiter is the classic warm-up; Twitter feed / WhatsApp are the step-up. Walk through API, hashing, DB choice, and caching aloud.</p>
              </div>
            </div>
          </section>

          {/* Section 2: Mental Model */}
          <section id="mental-model" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 2</span>
              <h3 className="text-xl font-bold">Why System Design Feels Overwhelming — And The Fix</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              DSA has a compile button: your code passes or it doesn't. System design has an open whiteboard. Most students collect a pile of scary words that never became pictures they can use. <strong>The fix: ONE physical picture per concept.</strong>
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-300 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="p-3.5 border-b border-slate-800">The Definition (Forgotten under pressure)</th>
                    <th className="p-3.5 border-b border-slate-800">The Picture (Survives the interview)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 text-slate-400">"Consistent hashing minimizes key remapping when the cluster is resized."</td>
                    <td className="p-3.5 font-bold text-teal-300">A round table — add one guest and the others barely shift.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 text-slate-400">"Eventual consistency: replicas converge after a bounded delay."</td>
                    <td className="p-3.5 font-bold text-teal-300">A WhatsApp like count — off by 2 for a second, nobody is harmed.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 text-slate-400">"A load balancer distributes requests across a server pool."</td>
                    <td className="p-3.5 font-bold text-teal-300">Station ticket windows — one guy splits the crowd across counters.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Request Lifecycle Diagram */}
          <section id="request-flow" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 3</span>
              <h3 className="text-xl font-bold">The Request Lifecycle — How One Click Reaches A Server</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Before any building block makes sense, you need the one diagram every design is built on. If you can draw and narrate this, you can start ANY system design answer.
            </p>
            
            {/* Visual Interactive Flow Diagram */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl overflow-x-auto">
              <div className="flex items-center gap-3 min-w-[760px] justify-between text-center font-sans">
                
                {/* Node: Client */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center flex-1">
                  <Smartphone className="w-6 h-6 text-indigo-400 mb-1.5" />
                  <strong className="text-xs font-bold text-slate-200">Client</strong>
                  <span className="text-[10px] text-slate-500 font-mono">browser / app</span>
                </div>
                
                <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

                {/* Node: DNS */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-purple-800/50 flex flex-col items-center flex-1">
                  <Globe className="w-6 h-6 text-purple-400 mb-1.5" />
                  <strong className="text-xs font-bold text-slate-200">DNS</strong>
                  <span className="text-[10px] text-slate-500 font-mono">name &rarr; IP</span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

                {/* Node: Load Balancer */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-800/50 flex flex-col items-center flex-1">
                  <GitMerge className="w-6 h-6 text-emerald-400 mb-1.5" />
                  <strong className="text-xs font-bold text-slate-200">Load Balancer</strong>
                  <span className="text-[10px] text-slate-500 font-mono">Nginx / ALB</span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

                {/* Node: Web Server + CDN */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-amber-800/50 flex flex-col items-center flex-1 relative">
                  <Server className="w-6 h-6 text-amber-400 mb-1.5" />
                  <strong className="text-xs font-bold text-slate-200">Web Server</strong>
                  <span className="text-[10px] text-slate-500 font-mono">stateless logic</span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

                {/* Node: Cache */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-blue-800/50 flex flex-col items-center flex-1">
                  <Zap className="w-6 h-6 text-blue-400 mb-1.5" />
                  <strong className="text-xs font-bold text-slate-200">Cache (Redis)</strong>
                  <span className="text-[10px] text-slate-500 font-mono">&lt;1ms in RAM</span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

                {/* Node: Database */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-pink-800/50 flex flex-col items-center flex-1">
                  <Database className="w-6 h-6 text-pink-400 mb-1.5" />
                  <strong className="text-xs font-bold text-slate-200">Database</strong>
                  <span className="text-[10px] text-slate-500 font-mono">source of truth</span>
                </div>

              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div>• <strong>DNS:</strong> Turns domain names into IP addresses.</div>
              <div>• <strong>Load Balancer:</strong> Distributes incoming traffic across redundant servers and removes dead nodes.</div>
              <div>• <strong>Web Server:</strong> Executes business logic, kept stateless so sessions stay in Redis.</div>
              <div>• <strong>Cache (Redis):</strong> Microsecond RAM queries for hot read data.</div>
              <div>• <strong>Database:</strong> Durable primary storage with read replicas and sharding.</div>
              <div>• <strong>CDN & Message Queue:</strong> CDN serves media at edge nodes; Message Queues buffer asynchronous background jobs.</div>
            </div>
          </section>

          {/* Section 4: Core Trade-offs */}
          <section id="tradeoffs" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 4</span>
              <h3 className="text-xl font-bold">The Core Tradeoffs In One Screen</h3>
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
                    <td className="p-3.5 text-slate-400">Latency = time for ONE request.<br/>Throughput = requests per second.</td>
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
                    <td className="p-3.5 text-teal-300 font-medium">Scale up first for simplicity; scale out when you hit hardware limits or need fault tolerance.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold text-slate-200">Stateful vs Stateless</td>
                    <td className="p-3.5 text-slate-400">Server remembers user session vs forgets all state.</td>
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

          {/* Section 5: The 15 Building Blocks Memory Map */}
          <section id="memory-map" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 5</span>
              <h3 className="text-xl font-bold">The 15 Building-Block Memory Map</h3>
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

          {/* Section 10: 7-Step Attack Framework */}
          <section id="framework" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 10</span>
              <h3 className="text-xl font-bold">The 7-Step Attack Framework</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Walk these 7 steps in order, out loud, every single interview. The structured communication is what earns maximum points.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { step: '1', title: 'Clarify Requirements (2-3 min)', icon: MessageSquare, desc: 'Pin down functional needs (shorten URL) and non-functional needs (scale, latency). Ask before assuming.' },
                { step: '2', title: 'Estimate Scale', icon: BarChart, desc: 'Daily active users, QPS, read:write ratio, storage. This decides every downstream choice.' },
                { step: '3', title: 'Define the API', icon: PlugZap, desc: 'The 2-3 core endpoints (e.g. POST /shorten). Keeps design concrete.' },
                { step: '4', title: 'Sketch High-Level Diagram', icon: PenTool, desc: 'Client &rarr; Load Balancer &rarr; Servers &rarr; Cache &rarr; DB. The request spine.' },
                { step: '5', title: 'Design Data Model', icon: Database, desc: 'Tables, shard key, SQL vs NoSQL, and technical rationale.' },
                { step: '6', title: 'Scale the Design', icon: ArrowUpRight, desc: 'Add blocks at bottlenecks: caching, replication, sharding, queue, CDN.' },
                { step: '7', title: 'Trade-offs + Failure Handling', icon: ShieldAlert, desc: 'What breaks if a server dies, SPOFs, consistency choices. Shows senior signal.' }
              ].map(f => {
                const Icon = f.icon;
                return (
                  <div key={f.step} className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                      <span className="w-5 h-5 rounded-full bg-teal-950 border border-teal-700/60 text-teal-300 text-[10px] font-mono flex items-center justify-center">{f.step}</span>
                      <span>{f.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 16: Revision */}
          <section id="revision" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Section 16</span>
              <h3 className="text-xl font-bold">Revision — The Last 20 Minutes Before The Round</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <Split className="w-4 h-4" /> The 4 Confusion Tells
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
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
                <p className="text-emerald-300 font-bold">You learned 15 building blocks as 15 pictures, not 15 dry definitions.</p>
                <p className="text-slate-300 mt-1">
                  The interviewer will describe a problem, not name a block. Match the situation to a picture, draw the request spine, name your trade-offs out loud. You don't need to design Google. You need to think clearly and communicate. You've got this!
                </p>
              </div>
            </div>
          </section>

          {/* Section 17: Curated Web Resources */}
          <section id="resources" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">Bonus</span>
              <h3 className="text-xl font-bold">Curated Web Resources</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'ByteByteGo', desc: 'Practical framework for system design interviews.', link: 'https://bytebytego.com/courses/system-design-interview/a-framework-for-system-design-interviews', icon: Compass },
                { title: 'Sys Design Prep', desc: 'GitHub collection of interview prep notes.', link: 'https://github.com/mohllal/system-design-interview-prep', icon: Github },
                { title: 'Learn Sys Design', desc: 'Comprehensive engineering learning repository.', link: 'https://github.com/beagreatengineer/learn-system-design', icon: BookOpenText },
                { title: 'Best Resources', desc: 'Curated list of community system design material.', link: 'https://github.com/armankhondker/best-system-design-resources', icon: Star },
                { title: 'Design Archive', desc: 'Open-source system design articles & real cases.', link: 'https://github.com/kartikMahendru/System-Design-Resources', icon: FolderGit2 },
                { title: 'Awesome Design', desc: 'Categorized repository for software architectures.', link: 'https://github.com/Rajdeepc/awesome-system-design', icon: Layers3 },
              ].map(r => {
                const Icon = r.icon;
                return (
                  <a
                    key={r.title}
                    href={r.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl border bg-slate-900/40 border-slate-800 hover:border-teal-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-teal-300 font-bold text-xs mb-1.5">
                        <Icon className="w-4 h-4 text-teal-400" />
                        <span>{r.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{r.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>Open Link</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </a>
                );
              })}
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-xs text-slate-500 pt-8 pb-12 border-t border-slate-800/80">
            HLD Boss Sheet • Cloudflare R2 Persistent Edition • Authored by @rathoreadiitya
          </footer>

        </main>
      </div>
    </div>
  );
};
