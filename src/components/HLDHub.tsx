import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  LayoutTemplate, 
  BookOpen, 
  Search, 
  ArrowRight, 
  Building2, 
  Layers, 
  CheckCircle2, 
  RefreshCw,
  Zap,
  Maximize2,
  BookOpenText,
  BookMarked
} from 'lucide-react';
import { HLDArchitectureCanvas, HLDProblemSpec } from './HLDArchitectureCanvas';
import { HLDBossSheet } from './HLDBossSheet';
import { HLD_PRACTICE_PROBLEMS } from './SystemDesignHub';
import { CURATED_HLD_TOPICS, CuratedGitHubTopic, fetchGitHubMarkdown } from '../lib/githubLld';
import { GitHubArticleReader } from './GitHubArticleReader';
import { DDIABookReader } from './books/DDIABookReader';

interface HLDHubProps {
  onOpenDirectProblem?: (problemId: string) => void;
}

export const HLDHub: React.FC<HLDHubProps> = () => {
  const [hldSubTab, setHldSubTab] = useState<'boss_sheet' | 'freeform_canvas' | 'practice_canvas' | 'github_reader' | 'books'>('boss_sheet');
  const [activeHldProblem, setActiveHldProblem] = useState<HLDProblemSpec | null>(null);
  const [isFreeformHldCanvas, setIsFreeformHldCanvas] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Curated HLD GitHub Reader states
  const [selectedHldTopic, setSelectedHldTopic] = useState<CuratedGitHubTopic>(CURATED_HLD_TOPICS[0]);
  const [githubMarkdown, setGithubMarkdown] = useState<string>('');
  const [isLoadingGithub, setIsLoadingGithub] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    setIsLoadingGithub(true);
    fetchGitHubMarkdown(selectedHldTopic.repo, selectedHldTopic.path).then((res) => {
      if (!isCancelled) {
        setGithubMarkdown(res.content || selectedHldTopic.fallbackSummary);
        setIsLoadingGithub(false);
      }
    }).catch(() => {
      if (!isCancelled) {
        setGithubMarkdown(selectedHldTopic.fallbackSummary);
        setIsLoadingGithub(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedHldTopic]);

  const handleOpenGithubTopicFromSheet = (topic: CuratedGitHubTopic) => {
    setSelectedHldTopic(topic);
    setHldSubTab('github_reader');
  };

  const filteredHldProblems = HLD_PRACTICE_PROBLEMS.filter((p) => {
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return true;
    return (
      (p.title || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (Array.isArray(p.companies) && p.companies.some((c) => (c || '').toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Sub-Navigation Tabs (Obsidian Telemetry) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-white/[0.08] bg-[#0c101a] shadow-2xl relative overflow-hidden group">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl transition-opacity group-hover:opacity-100" />

        <div className="flex items-center space-x-3 relative z-10">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>High-Level Design (HLD)</span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold">
                System Design Hub
              </span>
            </h1>
            <p className="text-xs text-stitch-dim">Scalable Architectures, Caching, CDN, Sharding, Kafka &amp; Interactive Topology Canvas</p>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#070a12] p-1.5 rounded-xl border border-white/[0.08] relative z-10">
          <button
            onClick={() => {
              setHldSubTab('boss_sheet');
              setActiveHldProblem(null);
              setIsFreeformHldCanvas(false);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              hldSubTab === 'boss_sheet'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-stitch-dim hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>HLD Boss Sheet</span>
          </button>

          {/* Dedicated HLD Canvas Tab (No Question attached, pure system design whiteboard) */}
          <button
            onClick={() => {
              setHldSubTab('freeform_canvas');
              setActiveHldProblem(null);
              setIsFreeformHldCanvas(true);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              hldSubTab === 'freeform_canvas'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-stitch-dim hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>Architecture Canvas</span>
          </button>

          <button
            onClick={() => {
              setHldSubTab('practice_canvas');
              setActiveHldProblem(null);
              setIsFreeformHldCanvas(false);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              hldSubTab === 'practice_canvas'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-stitch-dim hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>HLD Challenges</span>
          </button>

          <button
            onClick={() => {
              setHldSubTab('github_reader');
              setActiveHldProblem(null);
              setIsFreeformHldCanvas(false);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              hldSubTab === 'github_reader'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-stitch-dim hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <BookOpenText className="w-4 h-4" />
            <span>HLD Deep Dives</span>
          </button>

          {/* DDIA Animated Book Tab */}
          <button
            onClick={() => {
              setHldSubTab('books');
              setActiveHldProblem(null);
              setIsFreeformHldCanvas(false);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              hldSubTab === 'books'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-stitch-dim hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <BookMarked className="w-4 h-4 text-cyan-300" />
            <span>DDIA Animated E-Book</span>
            <span className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono text-cyan-200 font-bold border border-cyan-500/40">BOOK</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: HLD BOSS SHEET (REVISION NOTES) */}
      {hldSubTab === 'boss_sheet' && (
        <HLDBossSheet 
          onOpenGithubTopic={handleOpenGithubTopicFromSheet}
          onOpenBookChapter={(chId) => {
            localStorage.setItem('ddia_last_chapter', chId);
            setHldSubTab('books');
          }}
        />
      )}

      {/* SUB-VIEW 2: DEDICATED BLANK HLD CANVAS (NO QUESTIONS) */}
      {hldSubTab === 'freeform_canvas' && (
        <div className="space-y-4 animate-fadeIn">
          <HLDArchitectureCanvas />
        </div>
      )}

      {/* SUB-VIEW 2: HLD PRACTICE CANVAS & SYSTEM DESIGN PROBLEMS */}
      {hldSubTab === 'practice_canvas' && (
        <>
          {activeHldProblem || isFreeformHldCanvas ? (
            /* Active HLD Drag-and-Drop Canvas */
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => {
                    setActiveHldProblem(null);
                    setIsFreeformHldCanvas(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  ← Back to HLD Problem Catalog
                </button>
                <div className="text-xs font-mono text-teal-400 font-bold">
                  {activeHldProblem ? activeHldProblem.title : 'Freeform Architecture Whiteboard'}
                </div>
              </div>

              <HLDArchitectureCanvas problem={activeHldProblem || undefined} />
            </div>
          ) : (
            /* Problem Catalog & Freeform Canvas Launch */
            <div className="space-y-6">
              
              {/* Freeform Whiteboard Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-950/80 via-slate-900 to-indigo-950/80 border border-teal-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-100 mb-1">Open Blank System Architecture Canvas</h3>
                  <p className="text-xs text-slate-300">Freeform drag-and-drop playground to design microservices, Kafka queues, Redis caches, and database clusters with instant AI evaluation.</p>
                </div>
                <button
                  onClick={() => setIsFreeformHldCanvas(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer flex-shrink-0"
                >
                  <LayoutTemplate className="w-4 h-4" />
                  <span>Launch Freeform Canvas</span>
                </button>
              </div>

              {/* Search Filter */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold text-slate-300">
                  <span>10+ FAANG System Design Interview Challenges</span>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search HLD problems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* HLD Problem Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredHldProblems.map((prob) => (
                  <div
                    key={prob.id}
                    className="p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900/60 transition-all flex flex-col justify-between group shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-teal-950 border border-teal-800/60 text-[10px] font-mono text-teal-300 font-bold">
                          System Design
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          prob.difficulty === 'Hard' ? 'text-rose-400 bg-rose-950/60' :
                          'text-amber-400 bg-amber-950/60'
                        }`}>
                          {prob.difficulty}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                        {prob.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {prob.description}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {prob.companies.slice(0, 3).map((comp) => (
                          <span key={comp} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-400">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-900 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">Interactive Canvas</span>
                      <button
                        onClick={() => setActiveHldProblem(prob)}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
                      >
                        <span>Design Architecture</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </>
      )}

      {/* SUB-VIEW 3: HLD GITHUB DEEP DIVE READER */}
      {hldSubTab === 'github_reader' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            {CURATED_HLD_TOPICS.map((top) => (
              <button
                key={top.id}
                onClick={() => setSelectedHldTopic(top)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedHldTopic.id === top.id
                    ? 'bg-teal-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {top.title}
              </button>
            ))}
          </div>

          <GitHubArticleReader
            topic={selectedHldTopic}
            markdown={githubMarkdown}
            isLoading={isLoadingGithub}
          />
        </div>
      )}

      {/* SUB-VIEW 5: DDIA INTERACTIVE ANIMATED E-BOOK */}
      {hldSubTab === 'books' && (
        <div className="space-y-4 animate-fadeIn">
          <DDIABookReader />
        </div>
      )}

    </div>
  );
};
