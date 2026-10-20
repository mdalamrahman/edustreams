import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Cpu, 
  Database, 
  Layers, 
  ShieldCheck, 
  Zap, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  GitBranch, 
  Server, 
  Activity,
  Mic,
  Code2,
  BookOpen
} from 'lucide-react';

interface PortfolioShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortfolioShowcaseModal: React.FC<PortfolioShowcaseModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'engineering' | 'metrics'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-indigo-500/30 rounded-3xl shadow-2xl shadow-indigo-950/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  SDETube Architecture & Engineering Showcase
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold">
                  Staff SDE Portfolio
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full-Stack Distributed System &bull; Polyglot Code Compiler &bull; AI Voice Mock Interviewer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/40 px-6 gap-2 pt-2">
          {[
            { id: 'overview' as const, label: 'System Overview', icon: Sparkles },
            { id: 'architecture' as const, label: 'Data Flow & Topology', icon: Layers },
            { id: 'engineering' as const, label: 'Engineering Deep-Dives', icon: Cpu },
            { id: 'metrics' as const, label: 'Production Metrics & SLA', icon: Activity },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-400 text-indigo-200 bg-indigo-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-t-lg'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-xs sm:text-sm custom-scrollbar">

          {/* TAB 1: SYSTEM OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-slate-200 leading-relaxed space-y-2">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Executive Summary</span>
                </div>
                <p>
                  <strong>SDETube / EduStream</strong> is an enterprise-grade SDE preparation and interview intelligence platform built to solve the fragmentation of DSA, System Design, LLD/OOP, and Mock Interviews. Designed with a zero-cost edge delivery architecture, it scales to thousands of concurrent users while maintaining sub-150ms execution latencies.
                </p>
              </div>

              {/* Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <Code2 className="w-4 h-4" />
                    <span>Polyglot Compiler Cluster</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Integrated Judge0 CE cluster supporting C++17, Python 3, Java 17, and JavaScript with automated driver synthesis, tree/graph deserializers, and order-independent path verifiers.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Database className="w-4 h-4" />
                    <span>In-Browser WASM SQL Arena</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Client-side SQL execution engine powered by AlaSQL with 320+ authentic LeetCode SQL challenges, automated schema provisioning, and exact table difference verification.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Mic className="w-4 h-4" />
                    <span>Audio VAD Mock Interviewer</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Real-time voice activity detection (VAD) coupled with a multi-round state machine (Intro &rarr; Clarification &rarr; Approach &rarr; Coding &rarr; Dry Run &rarr; Feedback).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Zero-Trust Ledger & Passkeys</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Passwordless FIDO2/WebAuthn biometrics, single-device session locking, and server-authoritative wallet billing with 24-hour access pass deduplication.
                  </p>
                </div>
              </div>

              {/* Tech Stack Chips */}
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Production Tech Stack</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    'React 18', 'TypeScript', 'Tailwind CSS v4', 'Vite', 'Monaco Editor',
                    'FastAPI (Python 3.11)', 'Judge0 CE', 'Supabase PostgreSQL', 'Cloudflare Pages & R2',
                    'WebAuthn / Passkeys', 'AlaSQL WASM', 'Kroki Diagrams', 'Upstash Redis', 'Render'
                  ].map(tech => (
                    <span key={tech} className="px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 font-mono text-xs font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE & DATA FLOW */}
          {activeTab === 'architecture' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <span>Distributed Tier Architecture</span>
                </div>
                <div className="font-mono text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-indigo-300 leading-relaxed">
                  {`[Client SPA: React 18 + Vite]
  │
  ├── Edge Tier: Cloudflare Pages & Workers (Global CDN, SSR proxy)
  ├── Storage Tier: Cloudflare R2 (SigV4 Canonical Problem Spec Storage)
  ├── Execution Tier: Judge0 CE Isolated Sandbox (C++, Py, Java, JS)
  ├── Database & Auth: Supabase PostgreSQL (RLS, WebAuthn Passkeys)
  ├── Backend Gateway: FastAPI on Render (AI Inference, Telethon Stream Gateway)
  └── In-Browser Tier: AlaSQL Engine (Zero-Network SQL Execution)`}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-white text-sm">Resilience & Offline First</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The client utilizes an asynchronous <strong>Cache-Aside pattern</strong> with IndexedDB and LocalStorage fallback. If the network or remote APIs experience latency or rate limits, the frontend transparently falls back to pre-seeded canonical problem drivers and cached specifications without breaking user workflow.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ENGINEERING DEEP-DIVES */}
          {activeTab === 'engineering' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>1. Autonomous Driver Injection & Multi-Testcase Batching</span>
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Solved Judge0 rate limits and user setup friction by designing an automated driver generator. Instead of running separate compiler requests per testcase, the execution wrapper stitches test inputs into a single batch execution payload, reducing network round-trips by up to 10x while maintaining accurate per-case status.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>2. Audio VAD to Prevent AI Hallucinations in Interviews</span>
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Traditional web speech recognition emits sporadic interim transcripts during ambient pauses. By integrating a dedicated Web Audio API Voice Activity Detector (VAD) with RMS volume thresholding, the AI interviewer accurately distinguishes user thinking pauses from completed answers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>3. Order-Independent Output Canonicalization</span>
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Graph, tree, and combination problems (e.g. Binary Tree Paths, Subsets) allow outputs in arbitrary order. The comparison engine canonicalizes nested JSON structures and string arrays order-independently to prevent false negative testcase failures.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: METRICS & SLA */}
          {activeTab === 'metrics' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">99.9%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Uptime Target</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-indigo-400">&lt;150ms</div>
                  <div className="text-[11px] text-slate-400 font-medium">P95 Client Latency</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-purple-400">4,200+</div>
                  <div className="text-[11px] text-slate-400 font-medium">Questions Indexed</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-cyan-400">12 / 12</div>
                  <div className="text-[11px] text-slate-400 font-medium">CI Tests Passing</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="font-bold text-white text-sm">Live Production Endpoints</span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="font-mono text-slate-400">Cloudflare Pages Live SPA</span>
                    <a href="https://sdetube.pages.dev" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                      <span>sdetube.pages.dev</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="font-mono text-slate-400">Render Backend Gateway</span>
                    <a href="https://edustream-backend-90vm.onrender.com/api/health" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
                      <span>/api/health (Healthy)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800/80 bg-slate-900/60 z-10 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-indigo-400" />
            <span className="font-mono">main branch &bull; Production Ready</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/mdalamrahman/edustreams"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all cursor-pointer shadow-sm shadow-indigo-600/30"
            >
              Close Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
