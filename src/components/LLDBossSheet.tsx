import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Clock, 
  Workflow, 
  LayoutGrid, 
  ExternalLink, 
  Route, 
  Blocks, 
  Scale, 
  PenTool, 
  Cpu, 
  Shield, 
  TableProperties, 
  Copy, 
  SplitSquareHorizontal, 
  BookOpen, 
  CheckCheck, 
  CircleDashed, 
  MessageSquare, 
  BarChart, 
  PlugZap, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2, 
  Split, 
  GitBranch, 
  Search, 
  Moon, 
  Sun, 
  ArrowUp, 
  Menu, 
  X, 
  ArrowRight, 
  Code2, 
  FileCode, 
  Check, 
  Box, 
  RefreshCw,
  Sliders,
  Maximize2
} from 'lucide-react';

export const LLDBossSheet: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [codeLang, setCodeLang] = useState<'java' | 'cpp' | 'python'>('java');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const navItems = [
    { id: 'overview', title: 'Overview', num: '00' },
    { id: 'minimum', title: '1. SDE-1 Student Minimum', num: '01' },
    { id: 'pillars', title: '2. 4 Pillars of OOP', num: '02' },
    { id: 'solid', title: '3. SOLID Principles & Fixes', num: '03' },
    { id: 'patterns', title: '4. 12 GoF Design Patterns', num: '04' },
    { id: 'case-studies', title: '5. Top 10 SDE-1 LLD Problems', num: '05' },
    { id: 'framework', title: '6. 6-Step LLD Framework', num: '06' },
    { id: 'mistakes', title: '7. Common LLD Pitfalls', num: '07' },
    { id: 'revision', title: '8. 20-Minute LLD Revision', num: '08' },
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

      {/* Main Flex Layout */}
      <div className="flex w-full">
        
        {/* Sticky Left Navigation Sidebar */}
        <aside className={`fixed top-0 bottom-0 left-0 w-72 z-50 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          theme === 'dark'
            ? 'bg-[#121212] border-r border-[#262626]'
            : 'bg-[#fcfbf8] border-r border-[#24211d]/10'
        } p-5 flex flex-col h-screen overflow-y-auto`}>
          
          {/* Brand */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight">LLD Boss Sheet</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">SDE-1 OOP & Design Patterns</p>
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
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-purple-500" />}
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
              placeholder="Search LLD patterns, SOLID..."
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
                        ? 'bg-purple-950/60 text-purple-300 border border-purple-800/60 font-semibold'
                        : 'bg-purple-50 text-purple-800 border border-purple-200 font-semibold'
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
          
          {/* Mobile Header Menu Trigger */}
          <div className="flex lg:hidden items-center justify-between p-4 rounded-2xl border mb-6 bg-slate-900/60 border-slate-800">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-bold">LLD Boss Sheet</span>
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
              ? 'bg-gradient-to-br from-[#121212] via-[#171324] to-[#121212] border-[#262626]'
              : 'bg-gradient-to-br from-[#fcfbf8] via-[#f5f0fb] to-[#fcfbf8] border-[#24211d]/10'
          }`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> SDE-1 Low-Level Design Mastery
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              LLD / Object-Oriented Design Boss Sheet
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed mb-6">
              The memory map for machine coding and whiteboard rounds. Master OOP 4 pillars, SOLID principles, 12 GoF Design Patterns, and top 10 interview case studies with desi analogies.
            </p>

            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3 text-xs mb-6">
              <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-300">Fast Revision Path:</strong>
                <p className="text-slate-300 mt-1">
                  If your round is in 20 minutes, jump to <strong>Section 3 (SOLID & Violations)</strong>, <strong>Section 4 (12 Design Patterns Hook Line)</strong>, and <strong>Section 6 (6-Step LLD Framework)</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button 
                onClick={() => scrollToSection('solid')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" /> SOLID Principles
              </button>
              <button 
                onClick={() => scrollToSection('patterns')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
              >
                <Box className="w-3.5 h-3.5" /> 12 Design Patterns
              </button>
              <button 
                onClick={() => scrollToSection('case-studies')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" /> Top 10 LLD Problems
              </button>
            </div>
          </section>

          {/* Section 1: SDE-1 Student Minimum */}
          <section id="minimum" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/60">Section 1</span>
              <h3 className="text-xl font-bold">What SDE-1 Interviewers ACTUALLY Expect</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              In an SDE-1 (fresher/0-2 yrs) Low Level Design round or Machine Coding round, you are <strong>not</strong> expected to write a 1,000-line production framework. Interviewers evaluate 4 specific skills:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Box className="w-4 h-4" /> 1. Entity Discovery & Separation
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Can you read a prompt (e.g. Parking Lot) and identify actors (Vehicle, Spot, Ticket, Payment, Gate) with clean attributes.</p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Shield className="w-4 h-4" /> 2. Extensibility via Interfaces (SOLID)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">When the interviewer asks: "What if we add EV Charging Spots or Hourly vs Daily Pricing?", does your code adapt without editing existing classes?</p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                  <Workflow className="w-4 h-4" /> 3. Practical Design Patterns
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Knowing when to use <code>Strategy</code> (for interchangeable pricing algorithms), <code>Factory</code> (for creating vehicles), or <code>Observer</code> (for slot vacancy alerts).</p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> 4. Working Executable Skeleton
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Clean naming conventions, proper getters/setters, thread-safe collections (or synchronized methods), and testable <code>main()</code> flows.</p>
              </div>
            </div>
          </section>

          {/* Section 2: 4 Pillars of OOP */}
          <section id="pillars" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/60">Section 2</span>
              <h3 className="text-xl font-bold">The 4 Pillars of OOP (Desi Analogies)</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 text-sm">1. Encapsulation</span>
                  <span className="text-[10px] font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-800/60 text-purple-300">Data Hiding</span>
                </div>
                <p className="text-xs text-teal-300 font-medium">Desi Hook: Bank locker ya Medical Capsule.</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Binding data (variables) and methods together while keeping fields <code>private</code>. Access is strictly controlled via validated getters and setters to prevent illegal states.
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 text-sm">2. Abstraction</span>
                  <span className="text-[10px] font-mono bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/60 text-indigo-300">Hiding Complexity</span>
                </div>
                <p className="text-xs text-teal-300 font-medium">Desi Hook: Car ka steering aur brakes.</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You know pressing the brake stops the car; you don't need to know hydraulic piston oil flow. In code, represented via <code>interface</code> and <code>abstract class</code>.
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-pink-300 text-sm">3. Inheritance</span>
                  <span className="text-[10px] font-mono bg-pink-950 px-2 py-0.5 rounded border border-pink-800/60 text-pink-300">IS-A Relationship</span>
                </div>
                <p className="text-xs text-teal-300 font-medium">Desi Hook: Pitaji ke property aur DNA ke gun.</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Child class inherits attributes/methods of parent (e.g. <code>Car extends Vehicle</code>). <em>Golden Rule:</em> Prefer <strong>Composition over Inheritance</strong> to avoid fragile base class traps.
                </p>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 text-sm">4. Polymorphism</span>
                  <span className="text-[10px] font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60 text-emerald-300">Many Forms</span>
                </div>
                <p className="text-xs text-teal-300 font-medium">Desi Hook: Ek insaan: beta, pati, bhai, employee sab alag roop mein.</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Compile-time:</strong> Method Overloading (same name, different params).<br/>
                  <strong>Runtime:</strong> Method Overriding via dynamic dispatch (<code>PaymentMethod.pay()</code> executes UPI or CreditCard dynamically).
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: SOLID Principles */}
          <section id="solid" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/60">Section 3</span>
              <h3 className="text-xl font-bold">SOLID Principles — Violations & Clean Fixes</h3>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  letter: 'S',
                  name: 'Single Responsibility Principle (SRP)',
                  hook: 'Ek class ka sirf EK hi kaam hona chahiye. (A class should have only one reason to change).',
                  bad: 'Invoice class handles calculating total, saving to SQL database, and printing PDF report.',
                  good: 'Split into: Invoice (data), InvoiceRepository (persistence), and InvoicePrinter (formatting).'
                },
                {
                  letter: 'O',
                  name: 'Open / Closed Principle (OCP)',
                  hook: 'Open for Extension, Closed for Modification. (New features bina purani files ko chede add karo).',
                  bad: 'Adding new payment mode (Crypto) requires modifying a huge if-else block in PaymentProcessor.java.',
                  good: 'Create PaymentMethod interface with pay() method. Add CryptoPayment class implementing it.'
                },
                {
                  letter: 'L',
                  name: 'Liskov Substitution Principle (LSP)',
                  hook: 'Child class ko parent ki jagah bina system tode rakh sakte ho. (Subtypes must be substitutable for base types).',
                  bad: 'Square extends Rectangle, but changing Square.setWidth() secretly changes height, breaking area calculations.',
                  good: 'Create Shape interface with getArea(). Make both Rectangle and Square implement Shape directly.'
                },
                {
                  letter: 'I',
                  name: 'Interface Segregation Principle (ISP)',
                  hook: 'Client ko un methods pe zabardasti depend mat karao jo wo use nahi karta. (No fat interfaces).',
                  bad: 'Worker interface has work(), eat(), sleep(). RobotWorker is forced to implement empty eat() and sleep().',
                  good: 'Split into Workable and Feedable interfaces. RobotWorker implements only Workable.'
                },
                {
                  letter: 'D',
                  name: 'Dependency Inversion Principle (DIP)',
                  hook: 'High-level modules low-level modules pe depend na karein; dono abstractions pe depend karein.',
                  bad: 'PasswordReminder directly instantiates new MySQLConnection() inside constructor.',
                  good: 'PasswordReminder receives DBConnection interface via Constructor Injection.'
                }
              ].map(s => (
                <div key={s.letter} className="p-5 rounded-2xl border bg-slate-900/50 border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40 font-mono font-bold flex items-center justify-center text-sm">
                      {s.letter}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{s.name}</h4>
                      <p className="text-xs text-teal-300 font-medium">{s.hook}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300">
                      <strong>❌ Violation:</strong> {s.bad}
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300">
                      <strong>✅ Clean Fix:</strong> {s.good}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: 12 GoF Design Patterns */}
          <section id="patterns" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/60">Section 4</span>
              <h3 className="text-xl font-bold">The 12 Must-Know Design Patterns for SDE-1</h3>
            </div>
            
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-300 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="p-3 border-b border-slate-800">Pattern</th>
                    <th className="p-3 border-b border-slate-800">Type</th>
                    <th className="p-3 border-b border-slate-800">Desi Analogy</th>
                    <th className="p-3 border-b border-slate-800">Use Case in Interview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  {[
                    { name: '1. Singleton', type: 'Creational', hook: 'Ek desh ka ek hi Rashtrapati/PM hota hai.', use: 'Database connection pool, Logger, In-memory cache manager.' },
                    { name: '2. Factory Method', type: 'Creational', hook: 'Swiggy/Zomato kitchen: order do, item ban kar aayega.', use: 'Creating Vehicles (Car/Bike/Truck) based on spot type in Parking Lot.' },
                    { name: '3. Builder Pattern', type: 'Creational', hook: 'Subway sandwich customized layer by layer.', use: 'Constructing complex Pizza, HTTP Request, or User Profile with optional params.' },
                    { name: '4. Prototype Pattern', type: 'Creational', hook: 'Xerox machine — asli document ki copy banao.', use: 'Cloning expensive Game Characters or Chess Board starting state.' },
                    { name: '5. Adapter Pattern', type: 'Structural', hook: 'Travel plug converter (2-pin to 3-pin).', use: 'Integrating third-party payment gateway (Stripe/PayPal) into our uniform interface.' },
                    { name: '6. Decorator Pattern', type: 'Structural', hook: 'Base Coffee mein Extra Milk + Caramel + Whip lagana.', use: 'Adding dynamic add-ons to Coffee, or Logging/Encryption wrappers over Stream.' },
                    { name: '7. Facade Pattern', type: 'Structural', hook: 'Hotel receptionist — ek phone pe khana, cab, cleaning sab book.', use: 'Simplifying multi-step complex subsystems (Order &rarr; Inventory &rarr; Payment &rarr; Shipping).' },
                    { name: '8. Proxy Pattern', type: 'Structural', hook: 'ATM debit card jo asli bank account ko represent karta hai.', use: 'Lazy loading high-res images, Access control, or Redis caching layer.' },
                    { name: '9. Strategy Pattern', type: 'Behavioral', hook: 'Google Maps: Car, Bike, Walk, Metro ka alag route algorithm.', use: 'Interchangeable Parking pricing strategies (Hourly, Surge, Festive).' },
                    { name: '10. Observer Pattern', type: 'Behavioral', hook: 'YouTube channel subscribe aur bell icon dabana.', use: 'Notifying waiting drivers when ride requested, or Stock price updates.' },
                    { name: '11. State Pattern', type: 'Behavioral', hook: 'Vending machine: NoCoin &rarr; HasCoin &rarr; Dispensing &rarr; SoldOut.', use: 'Vending Machine, ATM states, Order Status (Placed, Shipped, Delivered).' },
                    { name: '12. Command Pattern', type: 'Behavioral', hook: 'TV remote buttons aur Undo-Redo action stack.', use: 'Smart Home Remote (LightOnCommand), Transaction rollbacks, Job Queues.' },
                  ].map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-slate-200">{p.name}</td>
                      <td className="p-3 font-mono text-[11px]">
                        <span className={`px-2 py-0.5 rounded ${
                          p.type === 'Creational' ? 'bg-purple-950 text-purple-300 border border-purple-800/60' :
                          p.type === 'Structural' ? 'bg-blue-950 text-blue-300 border border-blue-800/60' :
                          'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}>{p.type}</span>
                      </td>
                      <td className="p-3 text-teal-300 font-medium">{p.hook}</td>
                      <td className="p-3 text-slate-400">{p.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: Top 10 SDE-1 LLD Problems */}
          <section id="case-studies" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/60">Section 5</span>
              <h3 className="text-xl font-bold">Top 10 Classic SDE-1 LLD Problems (Cheat Sheet)</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: 'parking-lot',
                  title: '1. Design Parking Lot',
                  companies: ['Amazon', 'Google', 'Microsoft', 'Flipkart'],
                  entities: 'ParkingLot, Floor, Spot (Compact, Large, Handicapped, EV), Vehicle (Bike, Car, Truck), Ticket, Payment.',
                  patterns: 'Factory (Vehicle/Spot creation), Strategy (Pricing algorithm), Singleton (ParkingLot instance).'
                },
                {
                  id: 'tic-tac-toe',
                  title: '2. Design Tic-Tac-Toe Game',
                  companies: ['Uber', 'Swiggy', 'Zomato', 'Microsoft'],
                  entities: 'Board, Player, Piece (X, O), WinChecker (Rows, Cols, Diagonals), GameState.',
                  patterns: 'Strategy (Win condition rules), Deque (Player turns cycle).'
                },
                {
                  id: 'snake-ladder',
                  title: '3. Design Snake & Ladder',
                  companies: ['Amazon', 'Flipkart', 'Paytm', 'Atlassian'],
                  entities: 'Board, Cell, Jumper (Snake, Ladder), Dice (Normal, Crooked), Player, GameController.',
                  patterns: 'Strategy (Dice roll & movement), Factory (Board generation).'
                },
                {
                  id: 'rate-limiter',
                  title: '4. Design In-Memory Rate Limiter',
                  companies: ['Stripe', 'Twilio', 'Cloudflare', 'Amazon'],
                  entities: 'RateLimiter, TokenBucket, SlidingWindowLog, ClientRequest, RateLimitConfig.',
                  patterns: 'Strategy (TokenBucket vs SlidingWindow), Decorator (HTTP middleware wrapper).'
                },
                {
                  id: 'splitwise',
                  title: '5. Design Splitwise / Expense App',
                  companies: ['PhonePe', 'Google Pay', 'CRED', 'Uber'],
                  entities: 'User, Group, Expense, Split (Equal, Exact, Percentage), BalanceSheet, DebtSimplifier.',
                  patterns: 'Strategy (Split calculation algorithms), Observer (Balance notifications).'
                },
                {
                  id: 'bookmyshow',
                  title: '6. Design BookMyShow / Cinema Booking',
                  companies: ['BookMyShow', 'MakeMyTrip', 'Amazon', 'Disney+ Hotstar'],
                  entities: 'Cinema, Screen, Show, Movie, Seat (Silver, Gold, VIP), Booking, LockManager, Payment.',
                  patterns: 'State (Seat: Available &rarr; Temporarily Locked &rarr; Booked), Strategy (Pricing by time).'
                },
                {
                  id: 'elevator',
                  title: '7. Design Elevator System',
                  companies: ['Uber', 'Amazon', 'Cisco', 'Adobe'],
                  entities: 'ElevatorCar, Direction (UP, DOWN, IDLE), Floor, InternalButton, ExternalButton, Dispatcher.',
                  patterns: 'State (Elevator moving/idle), Strategy (SCAN/LOOK elevator algorithm).'
                },
                {
                  id: 'vending-machine',
                  title: '8. Design Vending Machine',
                  companies: ['Amazon', 'Microsoft', 'Goldman Sachs'],
                  entities: 'VendingMachine, State (Idle, HasMoney, Dispense, SoldOut), Inventory, Slot, Coin/Note.',
                  patterns: 'State Pattern (State transitions & button actions), Inventory Manager.'
                },
                {
                  id: 'atm',
                  title: '9. Design ATM System',
                  companies: ['Visa', 'Mastercard', 'JPMorgan', 'Morgan Stanley'],
                  entities: 'ATM, CardReader, CashDispenser, BankService, Account, Transaction, ATMState.',
                  patterns: 'Chain of Responsibility (Cash Dispensing 2000 &rarr; 500 &rarr; 100), State Pattern.'
                },
                {
                  id: 'file-system',
                  title: '10. Design In-Memory File System',
                  companies: ['Google', 'Dropbox', 'Apple', 'Meta'],
                  entities: 'Node (Abstract), File (has content, size), Directory (has children map), PathResolver.',
                  patterns: 'Composite Pattern (Treat files and directories uniformly in hierarchy).'
                }
              ].map(p => (
                <div key={p.id} className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-100">{p.title}</h4>
                  </div>
                  <div className="text-[11px] text-purple-400 font-mono">
                    <strong>Entities:</strong> <span className="text-slate-300">{p.entities}</span>
                  </div>
                  <div className="text-[11px] text-teal-400 font-mono">
                    <strong>Patterns:</strong> <span className="text-slate-300">{p.patterns}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.companies.map(c => (
                      <span key={c} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6: 6-Step LLD Framework */}
          <section id="framework" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/60">Section 6</span>
              <h3 className="text-xl font-bold">The 6-Step SDE-1 LLD Interview Framework</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              In any 45-minute whiteboard or machine coding round, follow this exact step-by-step framework to score maximum points.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { step: '1', title: 'Clarify Scope & Constraints (3-5 min)', desc: 'Ask clarifying questions: "Should we support multiple floors? EV spots? What payment methods?" Define core vs nice-to-have features.' },
                { step: '2', title: 'Identify Core Entities & Enums (5 min)', desc: 'List out all nouns as classes (e.g. Vehicle, Spot, Ticket) and states as Enums (SpotType, VehicleType, PaymentStatus).' },
                { step: '3', title: 'Design Class Diagram (UML) (10 min)', desc: 'Define attributes, methods, and relationships: IS-A (inheritance) vs HAS-A (composition). Identify 1-to-1, 1-to-many associations.' },
                { step: '4', title: 'Plug In Design Patterns (5 min)', desc: 'Determine where flexibility is required: Strategy for pricing, Factory for creation, Observer for notifications.' },
                { step: '5', title: 'Write Clean Extensible Code (15 min)', desc: 'Write clean OOP code with interfaces, private fields, getters/setters, validation, and a working demo main() class.' },
                { step: '6', title: 'Concurrency & Edge Cases (5 min)', desc: 'Demonstrate thread safety: Synchronized locks or ConcurrentHashMap for spot allocation so two cars do not get the same spot.' }
              ].map(f => (
                <div key={f.step} className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-700/60 text-purple-300 text-[10px] font-mono flex items-center justify-center">{f.step}</span>
                    <span>{f.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 8: Revision */}
          <section id="revision" className="space-y-4">
            <div className="border-b pb-3 border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/60">Section 8</span>
              <h3 className="text-xl font-bold">20-Minute LLD Interview Revision Checklist</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Shield className="w-4 h-4" /> 5 Golden Rules of Clean LLD
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
                  <li>• <strong>Composition over Inheritance:</strong> Prefer <code>has-a</code> over <code>is-a</code>.</li>
                  <li>• <strong>Program to Interfaces:</strong> Never instantiate concrete classes directly in business logic.</li>
                  <li>• <strong>No God Classes:</strong> Break massive 500-line manager classes into small focused services.</li>
                  <li>• <strong>Thread Safety:</strong> Use <code>AtomicInteger</code> / <code>ConcurrentHashMap</code> for counters and shared state.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Box className="w-4 h-4" /> Pattern Selection Cheat Sheet
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
                  <li>• Interchangeable logic &rarr; <strong>Strategy Pattern</strong></li>
                  <li>• Object creation by condition &rarr; <strong>Factory Pattern</strong></li>
                  <li>• 1-to-many event notification &rarr; <strong>Observer Pattern</strong></li>
                  <li>• Object with changing internal state &rarr; <strong>State Pattern</strong></li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3 text-xs">
              <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-300 font-bold">You are prepared for your SDE-1 LLD / Machine Coding Round!</p>
                <p className="text-slate-300 mt-1">
                  Structure your thoughts out loud, define your entities clearly, apply clean SOLID interfaces, and walk through your working execution. You've got this!
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-xs text-slate-500 pt-8 pb-12 border-t border-slate-800/80">
            LLD Boss Sheet • Low-Level Design for SDE-1 Beginners • Cloudflare R2 Persistent Edition
          </footer>

        </main>
      </div>
    </div>
  );
};
