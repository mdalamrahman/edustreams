import React, { useState } from 'react';
import { 
  Boxes, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Code2, 
  BookOpen, 
  CheckCircle2, 
  Building2, 
  Clock, 
  Scale, 
  Zap, 
  Check, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Workflow,
  Search,
  BookOpenText,
  Lock,
  ArrowRight,
  LayoutGrid,
  Menu,
  X,
  Smartphone,
  Cpu,
  Layers3,
  Flame,
  Award,
  BookMarked
} from 'lucide-react';
import { CURATED_LLD_TOPICS, CuratedGitHubTopic } from '../lib/githubLld';

interface LLDBossSheetProps {
  onOpenGithubTopic?: (topic: CuratedGitHubTopic) => void;
  onOpenCodingProblem?: (problemId: string) => void;
}

type LLDModuleId = 'all' | 'pillars' | 'solid' | 'patterns' | 'problems' | 'framework' | 'revision' | 'github';

export const LLDBossSheet: React.FC<LLDBossSheetProps> = ({ onOpenGithubTopic, onOpenCodingProblem }) => {
  const [selectedModule, setSelectedModule] = useState<LLDModuleId>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activePatternCategory, setActivePatternCategory] = useState<'creational' | 'structural' | 'behavioral'>('creational');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const moduleCards = [
    {
      id: 'pillars' as LLDModuleId,
      title: '1. The 4 Pillars of OOP',
      badge: 'Core Foundation',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      icon: Boxes,
      iconColor: 'text-emerald-400',
      desc: 'Encapsulation, Abstraction, Inheritance, and Polymorphism with real-world desi analogies and composition rules.',
      topicsCount: '4 Core Concepts • 8 Code Examples'
    },
    {
      id: 'solid' as LLDModuleId,
      title: '2. SOLID Principles Masterclass',
      badge: 'Must-Know',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
      icon: ShieldCheck,
      iconColor: 'text-purple-400',
      desc: 'Every letter (S, O, L, I, D) explained with realistic Bad Code violations vs Clean Refactored solutions.',
      topicsCount: '5 Principles • Violations & Clean Fixes'
    },
    {
      id: 'patterns' as LLDModuleId,
      title: '3. 12 GoF Design Patterns for SDE-1',
      badge: 'Interview Gold',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-800',
      icon: Layers,
      iconColor: 'text-blue-400',
      desc: 'Creational, Structural, and Behavioral patterns with class UML schemas and implementation snippets.',
      topicsCount: '12 Patterns • Singleton, Factory, Strategy...'
    },
    {
      id: 'problems' as LLDModuleId,
      title: '4. Top 10 SDE-1 Machine Coding Problems',
      badge: 'FAANG Classic',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
      icon: Building2,
      iconColor: 'text-amber-400',
      desc: 'Parking Lot, Tic-Tac-Toe, Snake & Ladder, Rate Limiter, Splitwise, BookMyShow, Elevator & ATM.',
      topicsCount: '10 Problems • Entity & Class Blueprints'
    },
    {
      id: 'framework' as LLDModuleId,
      title: '5. The 6-Step Whiteboard Attack Framework',
      badge: 'Interview Strategy',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
      icon: Workflow,
      iconColor: 'text-rose-400',
      desc: 'Step-by-step formula from clarifying requirements to class diagrams and thread-safe concurrency.',
      topicsCount: '6 Execution Steps • 45-Min Timeline'
    },
    {
      id: 'revision' as LLDModuleId,
      title: '6. 20-Minute Last-Minute Revision',
      badge: 'Quick Cheat Sheet',
      badgeColor: 'bg-teal-950 text-teal-300 border-teal-800',
      icon: Clock,
      iconColor: 'text-teal-400',
      desc: 'Rapid pattern decision tree, confusion killers, and 10 common design traps to avoid under pressure.',
      topicsCount: 'Pattern Decision Matrix • Trap Avoidance'
    },
    {
      id: 'github' as LLDModuleId,
      title: '7. Curated LLD GitHub Deep Dives',
      badge: 'Integrated Reader',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
      icon: BookOpenText,
      iconColor: 'text-indigo-400',
      desc: 'Read curated open-source low-level design repositories and clean code articles directly inside SDETube.',
      topicsCount: 'Design Patterns for Humans • Clean Code'
    }
  ];

  return (
    <div className="space-y-8 select-text">
      
      {/* Top Banner & Module Switcher Header */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> SDE-1 / Fresher LLD Complete Syllabus
          </span>
          <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-bold">
            Cloudflare R2 Persistent Edition
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Low-Level Design (LLD) Boss Sheet & SDE-1 Notes
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed mb-6">
          Everything an entry-level software engineer needs to crush object-oriented machine coding rounds. 4 OOP Pillars, SOLID principles, 12 GoF design patterns, top 10 machine coding case studies, and interview execution frameworks.
        </p>

        {/* Breadcrumb Navigation when inside a specific chapter */}
        {selectedModule !== 'all' && (
          <div className="flex items-center gap-2 pt-2 border-t border-purple-800/40">
            <button
              onClick={() => setSelectedModule('all')}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow"
            >
              <span>← Back to All LLD Options</span>
            </button>
            <span className="text-xs font-mono text-purple-300 font-bold">
              Viewing: {moduleCards.find(m => m.id === selectedModule)?.title}
            </span>
          </div>
        )}
      </div>

      {/* DASHBOARD VIEW: OPTION CARDS GRID */}
      {selectedModule === 'all' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-purple-400" />
              <span>Select an LLD Module to Explore:</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">7 Interactive Chapters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {moduleCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedModule(card.id)}
                  className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-900/60 transition-all flex flex-col justify-between group cursor-pointer shadow-xl relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                      <div className="w-9 h-9 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className={`w-5 h-5 ${card.iconColor}`} />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                      {card.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">{card.topicsCount}</span>
                    <div className="flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
                      <span>Open Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODULE 1: THE 4 OOP PILLARS */}
      {(selectedModule === 'all' || selectedModule === 'pillars') && (
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Module 1: The 4 OOP Pillars with Desi Analogies</h2>
                <p className="text-xs text-slate-400">How to explain Object-Oriented fundamentals crisply to interviewers</p>
              </div>
            </div>
            {selectedModule !== 'all' && (
              <button
                onClick={() => setSelectedModule('all')}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
              >
                ← Back to Options
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Encapsulation */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">1. Encapsulation</span>
                <span className="text-[10px] font-mono text-slate-500">Data Hiding & Bundling</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Desi Analogy:</strong> Bank Locker ya Medical Capsule. Capsule ke andar dawai band hoti hai; bahar se koi directly chemical ko chhu nahi sakta.
              </p>
              <div className="p-3 rounded-xl bg-black/50 border border-slate-800 font-mono text-[11px] text-emerald-300 space-y-1">
                <div><span className="text-purple-400">class</span> BankAccount &#123;</div>
                <div className="pl-4"><span className="text-rose-400">private double</span> balance; <span className="text-slate-500">// hidden</span></div>
                <div className="pl-4"><span className="text-rose-400">public void</span> deposit(double amount) &#123; <span className="text-slate-500">/* validated */</span> &#125;</div>
                <div>&#125;</div>
              </div>
            </div>

            {/* Abstraction */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">2. Abstraction</span>
                <span className="text-[10px] font-mono text-slate-500">Hiding Complexity</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Desi Analogy:</strong> Car ka accelerator/brake pedal. Driver ko internal combustion engine ki piston timing janne ki zaroorat nahi hai.
              </p>
              <div className="p-3 rounded-xl bg-black/50 border border-slate-800 font-mono text-[11px] text-blue-300 space-y-1">
                <div><span className="text-purple-400">interface</span> PaymentGateway &#123;</div>
                <div className="pl-4"><span className="text-rose-400">boolean</span> processPayment(Order order);</div>
                <div>&#125; <span className="text-slate-500">// Stripe, Razorpay implement internally</span></div>
              </div>
            </div>

            {/* Inheritance vs Composition */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">3. Inheritance vs Composition</span>
                <span className="text-[10px] font-mono text-slate-500">"IS-A" vs "HAS-A"</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Golden Rule:</strong> <em>Favor Composition over Inheritance</em>. Inheritance creates tight coupling; composition gives runtime flexibility.
              </p>
              <div className="p-3 rounded-xl bg-black/50 border border-slate-800 font-mono text-[11px] text-purple-300 space-y-1">
                <div><span className="text-purple-400">class</span> Car &#123;</div>
                <div className="pl-4"><span className="text-rose-400">private</span> Engine engine; <span className="text-slate-500">// HAS-A (Composition)</span></div>
                <div>&#125;</div>
              </div>
            </div>

            {/* Polymorphism */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">4. Polymorphism</span>
                <span className="text-[10px] font-mono text-slate-500">Overloading vs Overriding</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Desi Analogy:</strong> Ek vyakti ke alag alag roop (Ghar pe beta, college mein student, office mein developer). Dynamic dispatch handles it at runtime.
              </p>
              <div className="p-3 rounded-xl bg-black/50 border border-slate-800 font-mono text-[11px] text-pink-300 space-y-1">
                <div>Shape s = <span className="text-purple-400">new</span> Circle();</div>
                <div>s.draw(); <span className="text-slate-500">// Calls Circle's draw() dynamically</span></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MODULE 2: SOLID PRINCIPLES MASTERCLASS */}
      {(selectedModule === 'all' || selectedModule === 'solid') && (
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Module 2: SOLID Principles Masterclass (Code Violations & Clean Fixes)</h2>
                <p className="text-xs text-slate-400">The 5 design commandments every interviewer looks for in machine coding</p>
              </div>
            </div>
            {selectedModule !== 'all' && (
              <button
                onClick={() => setSelectedModule('all')}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
              >
                ← Back to Options
              </button>
            )}
          </div>

          <div className="space-y-4">
            {[
              {
                letter: 'S',
                name: 'Single Responsibility Principle (SRP)',
                hook: 'Ek class ka sirf EK hi reason hona chahiye badalne ka.',
                bad: `// VIOLATION: Invoice handles calculation, DB saving, AND printing!
class Invoice {
    public void calculateTotal() { ... }
    public void saveToDatabase() { ... } // Bad: DB change affects Invoice!
    public void printInvoice() { ... }   // Bad: UI change affects Invoice!
}`,
                good: `// CLEAN REFACTOR: Separated concerns into dedicated classes
class Invoice { public double calculateTotal() { ... } }
class InvoiceRepository { public void save(Invoice inv) { ... } }
class InvoicePrinter { public void print(Invoice inv) { ... } }`
              },
              {
                letter: 'O',
                name: 'Open/Closed Principle (OCP)',
                hook: 'Extension ke liye open, modification ke liye closed.',
                bad: `// VIOLATION: Modifying class every time a new payment mode arrives!
class PaymentProcessor {
    public void pay(String type) {
        if (type.equals("UPI")) { ... }
        else if (type.equals("CREDIT_CARD")) { ... }
        else if (type.equals("CRYPTO")) { ... } // Modified existing file!
    }
}`,
                good: `// CLEAN REFACTOR: Polymorphic interfaces
interface PaymentMethod { void pay(double amount); }
class UpiPayment implements PaymentMethod { public void pay(double a) { ... } }
class CardPayment implements PaymentMethod { public void pay(double a) { ... } }
// Add CryptoPayment without touching existing code!`
              },
              {
                letter: 'L',
                name: 'Liskov Substitution Principle (LSP)',
                hook: 'Child class ko parent ki jagah bina system tode use kiya ja sake.',
                bad: `// VIOLATION: Square inherits Rectangle and breaks width/height expectations
class Rectangle { void setWidth(int w) { ... } void setHeight(int h) { ... } }
class Square extends Rectangle {
    void setWidth(int w) { super.setWidth(w); super.setHeight(w); } // Breaks math!
}`,
                good: `// CLEAN REFACTOR: Common abstraction or separate hierarchies
interface Shape { int getArea(); }
class Rectangle implements Shape { ... }
class Square implements Shape { ... }`
              },
              {
                letter: 'I',
                name: 'Interface Segregation Principle (ISP)',
                hook: 'Kisi bhi client ko aise methods implement karne pe majboor mat karo jo wo use nahi karta.',
                bad: `// VIOLATION: Fat interface forces Robot to eat!
interface Worker {
    void work();
    void eat(); // Robots don't eat!
}`,
                good: `// CLEAN REFACTOR: Segregated lean interfaces
interface Workable { void work(); }
interface Feedable { void eat(); }
class Human implements Workable, Feedable { ... }
class Robot implements Workable { ... }`
              },
              {
                letter: 'D',
                name: 'Dependency Inversion Principle (DIP)',
                hook: 'High-level modules ko low-level modules par depend nahi karna chahiye; dono ko abstractions par depend karna chahiye.',
                bad: `// VIOLATION: Car directly instantiates PetrolEngine (tightly coupled)
class Car {
    private PetrolEngine engine = new PetrolEngine(); // Cannot switch to Electric!
}`,
                good: `// CLEAN REFACTOR: Constructor Dependency Injection via interface
class Car {
    private Engine engine;
    public Car(Engine engine) { this.engine = engine; } // Injected!
}`
              }
            ].map((p) => (
              <div key={p.letter} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-purple-950 border border-purple-700/60 text-purple-300 font-black text-sm flex items-center justify-center">
                      {p.letter}
                    </span>
                    <strong className="text-sm text-slate-100">{p.name}</strong>
                  </div>
                  <span className="text-xs text-teal-400 font-medium">{p.hook}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1">
                    <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">❌ Violation (Bad)</div>
                    <pre className="font-mono text-[11px] text-rose-200 overflow-x-auto">{p.bad}</pre>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-1">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">✅ Refactored Clean Fix (Good)</div>
                    <pre className="font-mono text-[11px] text-emerald-200 overflow-x-auto">{p.good}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODULE 3: 12 GoF DESIGN PATTERNS */}
      {(selectedModule === 'all' || selectedModule === 'patterns') && (
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Module 3: 12 GoF Design Patterns for SDE-1</h2>
                <p className="text-xs text-slate-400">Creational, Structural, and Behavioral patterns categorized with practical usage</p>
              </div>
            </div>
            {selectedModule !== 'all' && (
              <button
                onClick={() => setSelectedModule('all')}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
              >
                ← Back to Options
              </button>
            )}
          </div>

          {/* Pattern Category Filter */}
          <div className="flex gap-2">
            {[
              { id: 'creational', label: '1. Creational (Object Creation)' },
              { id: 'structural', label: '2. Structural (Object Composition)' },
              { id: 'behavioral', label: '3. Behavioral (Object Interaction)' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActivePatternCategory(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePatternCategory === cat.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePatternCategory === 'creational' && [
              { name: 'Singleton', when: 'DB connection pools, App config, Logger.', hook: 'Puri app mein ek hi instance banega.', code: 'private static volatile DBConn instance;\npublic static DBConn getInstance() { ... }' },
              { name: 'Factory Method', when: 'VehicleFactory returning Car, Bike, Truck based on type.', hook: 'Object creation logic ko child class/factory mein decouple karo.', code: 'Vehicle v = VehicleFactory.create("CAR");' },
              { name: 'Builder', when: 'Creating complex objects with 10+ optional parameters (HTTP Request, Pizza).', hook: 'Constructor pollution se bacho. Step-by-step build karo.', code: 'User u = new User.Builder("Adi").age(22).city("BLR").build();' },
              { name: 'Prototype', when: 'Creating new objects is expensive (cloning existing game NPC/monster).', hook: 'Existing object ko clone karke modified copy banao.', code: 'Monster boss = originalMonster.clone();' }
            ].map(p => (
              <div key={p.name} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-blue-300">{p.name} Pattern</strong>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Creational</span>
                </div>
                <p className="text-xs text-teal-300 font-medium">Hook: {p.hook}</p>
                <p className="text-xs text-slate-400">Use when: {p.when}</p>
                <div className="p-2.5 rounded-xl bg-black/50 border border-slate-800 font-mono text-[11px] text-slate-300">
                  {p.code}
                </div>
              </div>
            ))}

            {activePatternCategory === 'structural' && [
              { name: 'Adapter', when: 'Third-party payment gateways with different method signatures.', hook: 'Do incompatible interfaces ke beech charging adapter ka kaam karta hai.', code: 'PaymentAdapter implements NewGateway { OldService s; }' },
              { name: 'Decorator', when: 'Coffee addons (Milk, Caramel, Extra Shot) without subclass explosion.', hook: 'Runtime par naye behaviors wrap karke add karo.', code: 'Beverage b = new CaramelDecorator(new MilkDecorator(new Espresso()));' },
              { name: 'Facade', when: 'Complex subsystem (DVD Player + Projector + Sound + Lights for Home Theater).', hook: 'Ek simple wrapper method jo peeche ke 10 complex steps ko trigger kare.', code: 'homeTheater.watchMovie("Inception");' },
              { name: 'Proxy', when: 'Lazy loading heavy images, caching, security access control.', hook: 'Asli object tak pahunchne se pehle gatekeeper surrogate khada karo.', code: 'Image img = new ProxyImage("huge.png"); img.display();' }
            ].map(p => (
              <div key={p.name} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-purple-300">{p.name} Pattern</strong>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Structural</span>
                </div>
                <p className="text-xs text-teal-300 font-medium">Hook: {p.hook}</p>
                <p className="text-xs text-slate-400">Use when: {p.when}</p>
                <div className="p-2.5 rounded-xl bg-black/50 border border-slate-800 font-mono text-[11px] text-slate-300">
                  {p.code}
                </div>
              </div>
            ))}

            {activePatternCategory === 'behavioral' && [
              { name: 'Strategy', when: 'Sorting strategies (MergeSort, QuickSort) or Payment routes (UPI, Card).', hook: 'Algorithm ko runtime par plug-and-play badalne ki azaadi.', code: 'cart.setPaymentStrategy(new UpiStrategy()); cart.checkout();' },
              { name: 'Observer', when: 'YouTube channel subscribers, Stock ticker price changes, Event listeners.', hook: 'Ek subject badle to sabhi registered listeners ko notification bhejo.', code: 'channel.registerObserver(studentUser); channel.notifyAll();' },
              { name: 'State', when: 'Vending Machine (NoCoin, HasCoin, Dispensing, SoldOut) state transitions.', hook: 'State badalne par object ka behavior automatic badal jaye.', code: 'vendingMachine.setState(new HasCoinState());' },
              { name: 'Command', when: 'Undo/Redo actions, Remote control buttons, Task queues.', hook: 'Request ko ek object mein encapsulate karo with execute() & undo().', code: 'remote.pressButton(new TurnOnLightCommand(livingRoomLight));' }
            ].map(p => (
              <div key={p.name} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-pink-300">{p.name} Pattern</strong>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Behavioral</span>
                </div>
                <p className="text-xs text-teal-300 font-medium">Hook: {p.hook}</p>
                <p className="text-xs text-slate-400">Use when: {p.when}</p>
                <div className="p-2.5 rounded-xl bg-black/50 border border-slate-800 font-mono text-[11px] text-slate-300">
                  {p.code}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODULE 4: TOP 10 SDE-1 MACHINE CODING PROBLEMS */}
      {(selectedModule === 'all' || selectedModule === 'problems') && (
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Module 4: Top 10 SDE-1 Machine Coding Problems</h2>
                <p className="text-xs text-slate-400">Entity breakdown, core design patterns, and company frequency</p>
              </div>
            </div>
            {selectedModule !== 'all' && (
              <button
                onClick={() => setSelectedModule('all')}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
              >
                ← Back to Options
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'parking_lot', title: '1. Parking Lot System', patterns: 'Factory, Strategy (Fee calculation)', entities: 'Vehicle, ParkingSpot (Compact, Large), Ticket, Terminal', companies: ['Amazon', 'Flipkart', 'Uber'] },
              { id: 'tic_tac_toe', title: '2. Tic-Tac-Toe Game', patterns: 'State, Strategy (Win checker)', entities: 'Board, Piece (X, O), Player, GameController', companies: ['Microsoft', 'Google', 'PhonePe'] },
              { id: 'snake_ladder', title: '3. Snake & Ladder Game', patterns: 'Strategy, Observer', entities: 'Board, Cell, Jump (Snake, Ladder), Dice, Player', companies: ['Swiggy', 'Razorpay', 'Atlassian'] },
              { id: 'rate_limiter', title: '4. Token Bucket Rate Limiter', patterns: 'Strategy (Sliding Window, Leaky Bucket)', entities: 'RateLimiter, TokenBucket, ClientIdentifier', companies: ['Stripe', 'Uber', 'Zomato'] },
              { id: 'splitwise', title: '5. Expense Sharing App (Splitwise)', patterns: 'Strategy (Equal, Exact, Percent Split), Factory', entities: 'User, Expense, Split, BalanceSheet, Group', companies: ['Cred', 'PhonePe', 'DeShaw'] },
              { id: 'bookmyshow', title: '6. Movie Ticket Booking (BookMyShow)', patterns: 'Observer (Notify seat release), State (Seat lock)', entities: 'City, Cinema, Screen, Show, Seat, Booking, Payment', companies: ['Flipkart', 'MakeMyTrip', 'Oracle'] },
              { id: 'elevator', title: '7. Elevator Management System', patterns: 'State (Idle, MovingUp, MovingDown), Strategy (LOOK)', entities: 'ElevatorCar, Floor, InternalButton, Dispatcher', companies: ['Amazon', 'Salesforce', 'Adobe'] },
              { id: 'vending_machine', title: '8. Vending Machine', patterns: 'State Pattern (Idle, HasMoney, Dispensing, SoldOut)', entities: 'Inventory, Item, Coin, State, VendingMachine', companies: ['Microsoft', 'Cisco', 'Samsung'] },
            ].map((prob) => (
              <div key={prob.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-amber-300">{prob.title}</strong>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div><span className="text-slate-400 font-medium">Patterns:</span> <span className="text-teal-300 font-mono">{prob.patterns}</span></div>
                  <div><span className="text-slate-400 font-medium">Entities:</span> <span className="text-slate-200">{prob.entities}</span></div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {prob.companies.map(c => (
                    <span key={c} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODULE 5: 6-STEP WHITEBOARD ATTACK FRAMEWORK */}
      {(selectedModule === 'all' || selectedModule === 'framework') && (
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <Workflow className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Module 5: The 6-Step Whiteboard Attack Framework</h2>
                <p className="text-xs text-slate-400">Exact 45-minute step-by-step interview execution roadmap</p>
              </div>
            </div>
            {selectedModule !== 'all' && (
              <button
                onClick={() => setSelectedModule('all')}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
              >
                ← Back to Options
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Clarify Scope (5 Mins)', desc: 'Ask about functional rules, edge cases, single-threaded vs multi-threaded, and capacity bounds. Never start coding without asking.' },
              { step: '2', title: 'Identify Core Entities (5 Mins)', desc: 'List primary nouns (e.g. Vehicle, Spot, Ticket). Define core fields and their data types.' },
              { step: '3', title: 'Draft Class Diagram (10 Mins)', desc: 'Sketch inheritance (IS-A) and composition (HAS-A) relationships. Keep interfaces decoupled.' },
              { step: '4', title: 'Pick Design Patterns (5 Mins)', desc: 'Justify pattern choices out loud (e.g. "I am using Strategy for pricing because calculation rules vary").' },
              { step: '5', title: 'Write Clean Code (15 Mins)', desc: 'Implement core classes with getters, setters, private fields, and clean method names.' },
              { step: '6', title: 'Concurrency & Edge Cases (5 Mins)', desc: 'Discuss synchronized locks, AtomicInteger, ReentrantLock, and handling null / capacity overflows.' },
            ].map((f) => (
              <div key={f.step} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-rose-950 border border-rose-700/60 text-rose-300 text-xs font-mono flex items-center justify-center font-bold">{f.step}</span>
                  <span>{f.title}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODULE 6: 20-MINUTE PRE-INTERVIEW REVISION */}
      {(selectedModule === 'all' || selectedModule === 'revision') && (
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Module 6: 20-Minute Pre-Interview Revision Checklist</h2>
                <p className="text-xs text-slate-400">Rapid pattern decision tree and common trap avoidance</p>
              </div>
            </div>
            {selectedModule !== 'all' && (
              <button
                onClick={() => setSelectedModule('all')}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
              >
                ← Back to Options
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">Pattern Decision Formula</div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• Need dynamic algorithm switching? &rarr; <strong>Strategy Pattern</strong></li>
                <li>• Need 1-to-many event notification? &rarr; <strong>Observer Pattern</strong></li>
                <li>• Need object creation without constructor mess? &rarr; <strong>Builder / Factory</strong></li>
                <li>• Need to alter behavior when lifecycle state changes? &rarr; <strong>State Pattern</strong></li>
                <li>• Need to add features without subclass explosion? &rarr; <strong>Decorator Pattern</strong></li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">Top 5 Traps to Avoid</div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• Don't make everything public; use private fields + getters/setters.</li>
                <li>• Don't use raw Inheritance when Composition solves it better.</li>
                <li>• Don't hardcode strings; use Enums for Types, States & Statuses.</li>
                <li>• Don't forget thread-safety locks for shared resources (e.g. parking spot reservation).</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* MODULE 7: CURATED LLD GITHUB DEEP DIVES */}
      {(selectedModule === 'all' || selectedModule === 'github') && (
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <BookOpenText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Module 7: Curated LLD GitHub Deep Dives</h2>
                <p className="text-xs text-slate-400">Read open-source low-level design repositories directly on SDETube</p>
              </div>
            </div>
            {selectedModule !== 'all' && (
              <button
                onClick={() => setSelectedModule('all')}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
              >
                ← Back to Options
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CURATED_LLD_TOPICS.map((top) => (
              <div
                key={top.id}
                onClick={() => onOpenGithubTopic?.(top)}
                className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 hover:border-purple-500/60 hover:bg-slate-900 transition-all flex flex-col justify-between group cursor-pointer shadow-lg"
              >
                <div>
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs mb-1.5">
                    <BookOpenText className="w-4 h-4 text-purple-400" />
                    <span className="line-clamp-1">{top.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3 line-clamp-2">{top.description}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-purple-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>Read Article</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 pt-8 pb-12 border-t border-slate-800/80">
        LLD Boss Sheet & SDE-1 Notes • Cloudflare R2 Persistent Edition • Built for Fresher & SDE-1 Candidates
      </footer>

    </div>
  );
};
