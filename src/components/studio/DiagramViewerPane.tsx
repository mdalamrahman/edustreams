import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Sparkles, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  Cpu, 
  Database, 
  Server, 
  Globe, 
  Radio, 
  Plus, 
  Wand2, 
  HelpCircle,
  Coins
} from 'lucide-react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
  MarkerType,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { renderKrokiDiagram, getLldDiagramForProblem, DiagramType } from '../../lib/kroki';
import { canAffordAction, deductCredits, PRICING_CONFIG, getUserWallet } from '../../lib/billing';
import { getLinkedProfiles, saveLinkedProfiles } from '../../lib/userProfileService';
import { requestMistralChat } from '../../lib/mistral';

interface DiagramViewerPaneProps {
  mode: 'dsa' | 'hld' | 'lld';
  slug?: string;
  problemTitle?: string;
  currentCode?: string;
  userEmail?: string;
  onOpenRechargeModal?: () => void;
}

// Initial template nodes for AI Interactive Canvas
const DEFAULT_HLD_NODES: Node[] = [
  {
    id: 'client-1',
    type: 'default',
    position: { x: 50, y: 150 },
    data: { label: '🌐 Mobile & Web Clients' },
    style: { background: '#1e1b4b', color: '#c7d2fe', border: '1px solid #6366f1', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', fontWeight: 600 }
  },
  {
    id: 'lb-1',
    type: 'default',
    position: { x: 260, y: 150 },
    data: { label: '⚖️ Cloudflare Edge / NLB' },
    style: { background: '#0f172a', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', fontWeight: 600 }
  },
  {
    id: 'gateway-1',
    type: 'default',
    position: { x: 480, y: 150 },
    data: { label: '🚪 API Gateway & Auth Service' },
    style: { background: '#042f2e', color: '#5eead4', border: '1px solid #0d9488', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', fontWeight: 600 }
  },
  {
    id: 'service-1',
    type: 'default',
    position: { x: 720, y: 80 },
    data: { label: '⚙️ Core Microservice Cluster' },
    style: { background: '#311042', color: '#f0abfc', border: '1px solid #c026d3', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', fontWeight: 600 }
  },
  {
    id: 'cache-1',
    type: 'default',
    position: { x: 960, y: 60 },
    data: { label: '⚡ Redis Cluster (Write-Through)' },
    style: { background: '#450a0a', color: '#fca5a5', border: '1px solid #dc2626', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', fontWeight: 600 }
  },
  {
    id: 'db-1',
    type: 'default',
    position: { x: 960, y: 180 },
    data: { label: '🗄️ PostgreSQL (Read Replicas)' },
    style: { background: '#064e3b', color: '#6ee7b7', border: '1px solid #059669', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', fontWeight: 600 }
  },
  {
    id: 'queue-1',
    type: 'default',
    position: { x: 720, y: 240 },
    data: { label: '📨 Apache Kafka Event Stream' },
    style: { background: '#422006', color: '#fde047', border: '1px solid #ca8a04', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', fontWeight: 600 }
  }
];

const DEFAULT_HLD_EDGES: Edge[] = [
  { id: 'e1-2', source: 'client-1', target: 'lb-1', animated: true, style: { stroke: '#818cf8', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' } },
  { id: 'e2-3', source: 'lb-1', target: 'gateway-1', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' } },
  { id: 'e3-4', source: 'gateway-1', target: 'service-1', style: { stroke: '#5eead4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#5eead4' } },
  { id: 'e4-5', source: 'service-1', target: 'cache-1', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
  { id: 'e4-6', source: 'service-1', target: 'db-1', style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
  { id: 'e3-7', source: 'gateway-1', target: 'queue-1', animated: true, style: { stroke: '#eab308', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#eab308' } }
];

export const DiagramViewerPane: React.FC<DiagramViewerPaneProps> = ({
  mode,
  slug,
  problemTitle,
  currentCode = '',
  userEmail,
  onOpenRechargeModal
}) => {
  // User profile linked config & preference
  const profileConfig = useMemo(() => getLinkedProfiles(userEmail), [userEmail]);
  
  // Tier state: auto-selected from profile (Standard = ₹0.20 vs AI Studio = ₹0.60)
  const [activeTier, setActiveTier] = useState<'standard' | 'ai_studio'>(() => {
    return profileConfig.designTierPreference || 'standard';
  });

  // Keep in sync if profile updates
  useEffect(() => {
    if (profileConfig.designTierPreference) {
      setActiveTier(profileConfig.designTierPreference);
    }
  }, [profileConfig.designTierPreference]);

  // Standard Diagram Tier state (Kroki SVG)
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoadingStandard, setIsLoadingStandard] = useState<boolean>(false);
  const [standardError, setStandardError] = useState<string | null>(null);
  const [diagramZoom, setDiagramZoom] = useState<number>(1);

  // AI-Powered Studio Tier state (@xyflow/react)
  const [nodes, setNodes] = useState<Node[]>(DEFAULT_HLD_NODES);
  const [edges, setEdges] = useState<Edge[]>(DEFAULT_HLD_EDGES);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiCriticFeedback, setAiCriticFeedback] = useState<string | null>(null);
  const [isCritiquing, setIsCritiquing] = useState<boolean>(false);

  // Track if initial diagram render was already billed for current problem
  const [hasBilledStandard, setHasBilledStandard] = useState(false);
  const [hasBilledAiStudio, setHasBilledAiStudio] = useState(false);

  // React Flow changes callbacks
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } }, eds)),
    []
  );

  // Render Standard Diagram (₹0.20)
  const renderStandardDiagram = useCallback(async () => {
    setIsLoadingStandard(true);
    setStandardError(null);

    // Bill once per problem render session
    if (!hasBilledStandard) {
      if (!canAffordAction(PRICING_CONFIG.DESIGN_DIAGRAM_RENDER)) {
        setIsLoadingStandard(false);
        setStandardError('Insufficient wallet balance (Requires ₹0.20). Please top up your wallet.');
        if (onOpenRechargeModal) onOpenRechargeModal();
        return;
      }
      deductCredits(
        PRICING_CONFIG.DESIGN_DIAGRAM_RENDER,
        'STANDARD_DIAGRAM',
        `📐 Standard Architecture Diagram: ${problemTitle || slug || mode.toUpperCase()}`
      );
      setHasBilledStandard(true);
    }

    try {
      const template = getLldDiagramForProblem(slug || problemTitle || mode);
      const res = await renderKrokiDiagram(template.code, template.type);
      if (res.error) {
        setStandardError(res.error);
        setSvgContent(null);
      } else {
        setSvgContent(res.svg);
      }
    } catch {
      setStandardError('Could not connect to SDETube Diagram engine.');
    } finally {
      setIsLoadingStandard(false);
    }
  }, [hasBilledStandard, problemTitle, slug, mode, onOpenRechargeModal]);

  // Initial load when activeTier is standard
  useEffect(() => {
    if (activeTier === 'standard' && !svgContent && !isLoadingStandard) {
      renderStandardDiagram();
    }
  }, [activeTier, renderStandardDiagram, svgContent, isLoadingStandard]);

  // Handle switching to AI Studio tier (₹0.60, 3x cost)
  const handleSelectAiStudio = () => {
    if (!hasBilledAiStudio) {
      if (!canAffordAction(PRICING_CONFIG.AI_DESIGN_STUDIO)) {
        if (onOpenRechargeModal) onOpenRechargeModal();
        return;
      }
      deductCredits(
        PRICING_CONFIG.AI_DESIGN_STUDIO,
        'AI_DESIGN_STUDIO',
        `✨ AI-Powered Design Studio: ${problemTitle || slug || mode.toUpperCase()}`
      );
      setHasBilledAiStudio(true);
    }
    setActiveTier('ai_studio');
  };

  // Set current tier as user's profile preference
  const handleSetDefaultPreference = (tier: 'standard' | 'ai_studio') => {
    const updated = {
      ...profileConfig,
      designTierPreference: tier
    };
    saveLinkedProfiles(updated, userEmail);
    setActiveTier(tier);
  };

  // AI Architecture Critic action
  const handleAskAiCritic = async () => {
    if (isCritiquing) return;
    if (!canAffordAction(PRICING_CONFIG.NODE_AI_GUIDE_QUERY)) {
      if (onOpenRechargeModal) onOpenRechargeModal();
      return;
    }
    deductCredits(
      PRICING_CONFIG.NODE_AI_GUIDE_QUERY,
      'AI_ARCH_CRITIQUE',
      `🤖 Architecture Review: ${problemTitle || slug || 'System Topology'}`
    );

    setIsCritiquing(true);
    setAiCriticFeedback(null);

    try {
      const prompt = `As a Principal Distributed Systems Architect, critique this current system design topology for "${problemTitle || slug || 'High-Throughput Service'}":
Active Nodes: ${nodes.map(n => typeof n.data?.label === 'string' ? n.data.label : n.id).join(', ')}.
Total Interconnections: ${edges.length}.
Provide 3 concise, highly actionable observations:
1. Potential Bottleneck or SPOF (Single Point of Failure).
2. Recommended Caching / Partitioning Strategy.
3. Resilience & Fallback Recommendation (e.g. circuit breakers, DLQ, rate limiting).
Keep response under 150 words.`;

      const res = await requestMistralChat([{ role: 'user', content: prompt }]);
      setAiCriticFeedback(res?.content || 'Topology appears solid with multi-layer separation.');
    } catch {
      setAiCriticFeedback('Could not reach SDETube AI Critique engine. Please try again.');
    } finally {
      setIsCritiquing(false);
    }
  };

  // Add custom node to interactive canvas
  const handleAddNode = (nodeType: 'service' | 'cache' | 'database' | 'queue') => {
    const id = `node-${Date.now()}`;
    const x = 300 + Math.random() * 200;
    const y = 100 + Math.random() * 200;

    let label = '⚙️ New Service';
    let style = { background: '#1e1b4b', color: '#c7d2fe', border: '1px solid #6366f1', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', fontWeight: 600 };

    if (nodeType === 'cache') {
      label = '⚡ Distributed Cache (Memcached/Redis)';
      style = { background: '#450a0a', color: '#fca5a5', border: '1px solid #dc2626', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', fontWeight: 600 };
    } else if (nodeType === 'database') {
      label = '🗄️ Sharded Database (Scylla/Cassandra)';
      style = { background: '#064e3b', color: '#6ee7b7', border: '1px solid #059669', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', fontWeight: 600 };
    } else if (nodeType === 'queue') {
      label = '📨 Event Bus / Message Broker';
      style = { background: '#422006', color: '#fde047', border: '1px solid #ca8a04', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', fontWeight: 600 };
    }

    const newNode: Node = {
      id,
      position: { x, y },
      data: { label },
      style
    };

    setNodes(prev => [...prev, newNode]);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-l border-slate-800 select-none">
      {/* 1. Header Toolbar with Tier Switcher */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white">System Architecture & UML</span>
        </div>

        {/* 2-Tier Diagram Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTier('standard')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTier === 'standard'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Standard vector diagram (₹0.20) — Clean, fast, lowest cost"
          >
            <span>Standard</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-700">
              ₹0.20
            </span>
          </button>

          <button
            onClick={handleSelectAiStudio}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTier === 'ai_studio'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-900/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="AI-Powered Interactive Studio (₹0.60) — 3x cost, dynamic canvas with auto-nodes"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>AI Studio</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-700">
              ₹0.60 (3x)
            </span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Toolbar (Tier Status & Actions) */}
      <div className="px-3 py-2 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {activeTier === 'standard' ? (
            <span className="flex items-center gap-1.5 text-teal-300 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Standard Vector Engine Active (₹0.20)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-purple-300 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              AI Interactive Studio Active (₹0.60, 3x)
            </span>
          )}

          {/* Quick toggle to save preference in profile */}
          {profileConfig.designTierPreference !== activeTier && (
            <button
              onClick={() => handleSetDefaultPreference(activeTier)}
              className="text-[10px] font-medium text-slate-400 hover:text-indigo-300 underline cursor-pointer ml-1"
              title="Remember this tier as default in your profile"
            >
              Set as profile default
            </button>
          )}
        </div>

        {/* Action Controls for each tier */}
        {activeTier === 'standard' ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDiagramZoom(z => Math.max(0.5, z - 0.15))}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-500 w-8 text-center">
              {Math.round(diagramZoom * 100)}%
            </span>
            <button
              onClick={() => setDiagramZoom(z => Math.min(2.5, z + 0.15))}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={renderStandardDiagram}
              disabled={isLoadingStandard}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer ml-1"
              title="Re-render Diagram"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStandard ? 'animate-spin text-teal-400' : ''}`} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAskAiCritic}
              disabled={isCritiquing}
              className="px-2 py-0.5 rounded-md bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Ask SDETube AI to critique and inspect architecture bottlenecks (₹0.10)"
            >
              <Wand2 className={`w-3 h-3 ${isCritiquing ? 'animate-spin' : ''}`} />
              <span>AI Critic</span>
              <span className="text-[9px] font-mono text-purple-400">(₹0.10)</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Main View Area (Standard Vector vs AI Interactive Canvas) */}
      <div className="flex-1 overflow-hidden relative">
        {activeTier === 'standard' ? (
          // ── STANDARD VECTOR TIER ──
          <div className="h-full overflow-auto p-4 flex items-center justify-center bg-slate-950 relative custom-scrollbar">
            {isLoadingStandard ? (
              <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                <RefreshCw className="w-7 h-7 text-teal-400 animate-spin" />
                <p className="text-xs font-mono">Rendering standard vector architecture...</p>
              </div>
            ) : standardError ? (
              <div className="max-w-md p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start space-x-3 text-xs">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-rose-200">Diagram Render Notice</h5>
                  <p className="mt-1 text-slate-300">{standardError}</p>
                  <button
                    onClick={renderStandardDiagram}
                    className="mt-3 px-3 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Retry Render</span>
                  </button>
                </div>
              </div>
            ) : svgContent ? (
              <div
                style={{ transform: `scale(${diagramZoom})`, transformOrigin: 'center center' }}
                className="transition-transform duration-150"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            ) : (
              <div className="text-center text-slate-500 text-xs">
                Click refresh to render standard vector diagram
              </div>
            )}
          </div>
        ) : (
          // ── AI-POWERED STUDIO CANVAS TIER (@xyflow/react) ──
          <div className="h-full w-full relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              className="bg-slate-950 studio-canvas-grid"
            >
              <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#334155" />
              <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300" />
              <MiniMap
                className="!bg-slate-900 !border-slate-800"
                nodeColor="#6366f1"
                maskColor="rgba(15, 23, 42, 0.7)"
              />
            </ReactFlow>

            {/* Quick Add Node Floating Island */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur border border-slate-800 shadow-xl z-10">
              <span className="text-[10px] font-mono text-slate-400 pl-1 pr-1 font-bold">ADD:</span>
              <button
                onClick={() => handleAddNode('service')}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition-colors cursor-pointer"
              >
                + Microservice
              </button>
              <button
                onClick={() => handleAddNode('cache')}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition-colors cursor-pointer"
              >
                + Cache
              </button>
              <button
                onClick={() => handleAddNode('database')}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition-colors cursor-pointer"
              >
                + Database
              </button>
              <button
                onClick={() => handleAddNode('queue')}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition-colors cursor-pointer"
              >
                + Queue
              </button>
            </div>

            {/* AI Architecture Critic Feedback Banner */}
            {aiCriticFeedback && (
              <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-2xl bg-purple-950/90 backdrop-blur border border-purple-600/70 shadow-2xl text-xs text-purple-200 z-10 animate-fadeIn">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>SDETube Principal AI Critic</span>
                  </div>
                  <button
                    onClick={() => setAiCriticFeedback(null)}
                    className="text-purple-400 hover:text-white text-xs cursor-pointer font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="whitespace-pre-line text-[11px] leading-relaxed text-slate-300">
                  {aiCriticFeedback}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
