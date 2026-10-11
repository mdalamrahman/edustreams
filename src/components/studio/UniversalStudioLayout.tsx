import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PanelsTopLeft, 
  Sparkles, 
  ArrowLeft, 
  Layers, 
  Code2, 
  Cpu, 
  Wallet, 
  Maximize2, 
  Minimize2,
  Coins
} from 'lucide-react';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { ProblemSpecPane } from './ProblemSpecPane';
import { CodeArenaPane } from './CodeArenaPane';
import { DiagramViewerPane } from './DiagramViewerPane';

import { useAppContext } from '../../lib/AppContext';
import { getUserWallet } from '../../lib/billing';
import { SDE_SHEET_191_DATA } from '../../lib/dsaSheetsData';
import { LLD_PROBLEMS } from '../../lib/lldData';
import { HLD_PRACTICE_PROBLEMS } from '../SystemDesignHub';

export const UniversalStudioLayout: React.FC = () => {
  const { mode: rawMode = 'dsa', slug } = useParams<{ mode?: string; slug?: string }>();
  const mode = (rawMode.toLowerCase() === 'hld' ? 'hld' : rawMode.toLowerCase() === 'lld' ? 'lld' : 'dsa') as 'dsa' | 'hld' | 'lld';
  
  const navigate = useNavigate();
  const { user, setIsWalletModalOpen } = useAppContext();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // User wallet
  const wallet = useMemo(() => getUserWallet(user?.email), [user?.email]);

  // Lookup problem metadata based on mode and slug
  const problemMeta = useMemo(() => {
    const cleanSlug = (slug || '').toLowerCase();

    if (mode === 'lld') {
      const match = LLD_PROBLEMS.find(p => 
        p.id.toString() === cleanSlug || 
        p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').includes(cleanSlug)
      );
      if (match) {
        return {
          title: match.title,
          difficulty: match.difficulty as any,
          companies: match.companies || ['Amazon', 'Microsoft', 'Uber'],
          description: match.description,
          starterCode: match.starterCode?.cpp || match.starterCode?.java
        };
      }
      return {
        title: slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Low-Level Design Architecture Studio',
        difficulty: 'Medium' as const,
        companies: ['Amazon', 'Google', 'Flipkart'],
        description: 'Design robust, thread-safe object-oriented system architectures with design patterns and UML class models.'
      };
    }

    if (mode === 'hld') {
      const match = HLD_PRACTICE_PROBLEMS.find(p =>
        p.id === cleanSlug ||
        p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').includes(cleanSlug)
      );
      if (match) {
        return {
          title: match.title,
          difficulty: (match.difficulty || 'Hard') as any,
          companies: match.companies || ['Meta', 'Netflix', 'Google'],
          description: match.description
        };
      }
      return {
        title: slug ? slug.replace(/-/g, ' ').toUpperCase() : 'High-Level System Design Studio',
        difficulty: 'Hard' as const,
        companies: ['Meta', 'Google', 'Netflix'],
        description: 'Architect distributed systems at scale. Define load balancers, caching strategies, replication topologies, and event buses.'
      };
    }

    // Default: DSA
    const match = (SDE_SHEET_191_DATA || []).find(p =>
      p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').includes(cleanSlug)
    );
    if (match) {
      return {
        title: match.name,
        difficulty: match.difficulty as any,
        companies: match.companies || ['Google', 'Microsoft', 'Amazon'],
        description: `Solve the problem: **${match.name}**. Analyze asymptotic runtime complexity, state transitions, and edge cases.`
      };
    }

    return {
      title: slug ? slug.replace(/-/g, ' ').toUpperCase() : 'DSA Algorithm Studio',
      difficulty: 'Medium' as const,
      companies: ['Google', 'Amazon', 'Microsoft'],
      description: 'Implement optimal algorithms and data structures with automatic runtime verification.'
    };
  }, [mode, slug]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`flex flex-col bg-[#07090e] text-slate-100 ${
      isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'h-[calc(100vh-4.25rem)] w-full rounded-2xl border border-slate-800 overflow-hidden shadow-2xl'
    }`}>
      {/* 1. Universal Studio Header Bar */}
      <div className="h-12 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <PanelsTopLeft className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">SDETube Studio v4.0</span>
            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md font-bold border ${
              mode === 'dsa'
                ? 'bg-indigo-950/80 border-indigo-700/60 text-indigo-300'
                : mode === 'hld'
                ? 'bg-teal-950/80 border-teal-700/60 text-teal-300'
                : 'bg-pink-950/80 border-pink-700/60 text-pink-300'
            }`}>
              {mode.toUpperCase()}
            </span>
          </div>

          <span className="text-xs font-mono text-slate-300 border-l border-slate-800 pl-3 truncate max-w-[200px] sm:max-w-xs">
            {problemMeta.title}
          </span>
        </div>

        {/* Mode Switchers & Actions */}
        <div className="flex items-center gap-2">
          {/* Studio Modes */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800">
            <button
              onClick={() => navigate('/studio/dsa')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'dsa' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>DSA</span>
            </button>
            <button
              onClick={() => navigate('/studio/hld')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'hld' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>HLD</span>
            </button>
            <button
              onClick={() => navigate('/studio/lld')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'lld' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>LLD</span>
            </button>
          </div>

          {/* Wallet Balance & Topup Quick Access */}
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-300 transition-colors cursor-pointer"
            title="Wallet Credits"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>₹{wallet.balance.toFixed(2)}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Workbench"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Resizable 3-Pane Universal Workbench */}
      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal" className="h-full w-full">
          {/* PANE 1: Problem Specification & Requirements */}
          <Panel defaultSize={26} minSize={18} maxSize={38} className="h-full overflow-hidden">
            <ProblemSpecPane
              mode={mode}
              slug={slug}
              problemTitle={problemMeta.title}
              difficulty={problemMeta.difficulty}
              companies={problemMeta.companies}
              description={problemMeta.description}
            />
          </Panel>

          <Separator className="studio-resizer-horizontal" />

          {/* PANE 2: High-Density Monaco Code Arena */}
          <Panel defaultSize={42} minSize={28} maxSize={60} className="h-full overflow-hidden">
            <CodeArenaPane
              mode={mode}
              slug={slug}
              problemTitle={problemMeta.title}
              starterCode={problemMeta.starterCode}
              onOpenRechargeModal={() => setIsWalletModalOpen(true)}
            />
          </Panel>

          <Separator className="studio-resizer-horizontal" />

          {/* PANE 3: Diagram & Architecture Topology Visualizer (Standard ₹0.20 vs AI Studio ₹0.60) */}
          <Panel defaultSize={32} minSize={22} maxSize={50} className="h-full overflow-hidden">
            <DiagramViewerPane
              mode={mode}
              slug={slug}
              problemTitle={problemMeta.title}
              userEmail={user?.email}
              onOpenRechargeModal={() => setIsWalletModalOpen(true)}
            />
          </Panel>
        </Group>
      </div>
    </div>
  );
};
