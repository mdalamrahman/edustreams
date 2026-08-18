import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  MonitorSmartphone,
  Globe,
  Layers,
  Shield,
  Server,
  Database,
  Zap,
  Box,
  Cloud,
  Cpu,
  Search,
  Lock,
  Radio,
  HardDrive,
  Activity,
  Plus,
  Trash2,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Play,
  ArrowRight,
  MousePointer,
  Maximize2,
  FileCode,
  Download,
  Info,
  CheckCircle2,
  AlertTriangle,
  X,
  Edit2,
  LayoutTemplate,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Crosshair
} from 'lucide-react';
import { requestMistralChat } from '../lib/mistral';

export interface HLDNode {
  id: string;
  type: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category: 'client' | 'gateway' | 'compute' | 'storage' | 'cache' | 'queue' | 'security';
  iconKey: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  notes?: string;
}

export interface HLDConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromPort: 'top' | 'right' | 'bottom' | 'left';
  toPort: 'top' | 'right' | 'bottom' | 'left';
  label: string;
  style: 'solid' | 'dashed';
  color?: string;
}

export interface HLDProblemSpec {
  id: string;
  title: string;
  difficulty: 'Medium' | 'Hard';
  companies: string[];
  description: string;
  requirements: string[];
  expectedScale: string;
}

const ICON_MAP: Record<string, any> = {
  client: MonitorSmartphone,
  cdn: Globe,
  load_balancer: Layers,
  api_gateway: Shield,
  app_server: Server,
  worker: Cpu,
  database: Database,
  nosql: HardDrive,
  cache: Zap,
  queue: Box,
  storage: Cloud,
  search: Search,
  security: Lock,
  websocket: Radio,
  monitoring: Activity
};

export const COMPONENT_CATALOG = [
  {
    category: 'Clients & Edge',
    items: [
      { type: 'client', label: 'Web & Mobile Client', sublabel: 'React / iOS / Android', iconKey: 'client', category: 'client' as const, color: 'text-sky-400', bgColor: 'bg-sky-950/40', borderColor: 'border-sky-500/60', glowColor: 'rgba(56, 189, 248, 0.2)' },
      { type: 'cdn', label: 'CDN Edge Network', sublabel: 'Cloudflare / CloudFront', iconKey: 'cdn', category: 'client' as const, color: 'text-cyan-400', bgColor: 'bg-cyan-950/40', borderColor: 'border-cyan-500/60', glowColor: 'rgba(34, 211, 238, 0.2)' },
    ]
  },
  {
    category: 'Traffic & Gateway',
    items: [
      { type: 'load_balancer', label: 'Load Balancer (ALB/NLB)', sublabel: 'Round Robin / Least Conn', iconKey: 'load_balancer', category: 'gateway' as const, color: 'text-amber-400', bgColor: 'bg-amber-950/40', borderColor: 'border-amber-500/60', glowColor: 'rgba(251, 191, 36, 0.2)' },
      { type: 'api_gateway', label: 'API Gateway & Rate Limiter', sublabel: 'Auth / Routing / Throttling', iconKey: 'api_gateway', category: 'gateway' as const, color: 'text-indigo-400', bgColor: 'bg-indigo-950/40', borderColor: 'border-indigo-500/60', glowColor: 'rgba(129, 140, 248, 0.2)' },
      { type: 'security', label: 'WAF & DDoS Shield', sublabel: 'IP Filter / TLS Termination', iconKey: 'security', category: 'security' as const, color: 'text-rose-400', bgColor: 'bg-rose-950/40', borderColor: 'border-rose-500/60', glowColor: 'rgba(244, 63, 94, 0.2)' },
    ]
  },
  {
    category: 'Compute & Microservices',
    items: [
      { type: 'app_server', label: 'Application Service Cluster', sublabel: 'Stateless REST / gRPC', iconKey: 'app_server', category: 'compute' as const, color: 'text-purple-400', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-500/60', glowColor: 'rgba(192, 132, 252, 0.2)' },
      { type: 'worker', label: 'Async Worker & Processor', sublabel: 'Background Job Consumer', iconKey: 'worker', category: 'compute' as const, color: 'text-pink-400', bgColor: 'bg-pink-950/40', borderColor: 'border-pink-500/60', glowColor: 'rgba(244, 114, 182, 0.2)' },
      { type: 'websocket', label: 'WebSocket Push Server', sublabel: 'Bi-directional Realtime', iconKey: 'websocket', category: 'compute' as const, color: 'text-blue-400', bgColor: 'bg-blue-950/40', borderColor: 'border-blue-500/60', glowColor: 'rgba(96, 165, 250, 0.2)' },
    ]
  },
  {
    category: 'Databases & Storage',
    items: [
      { type: 'database', label: 'Relational DB (PostgreSQL)', sublabel: 'Master-Replica (ACID)', iconKey: 'database', category: 'storage' as const, color: 'text-emerald-400', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60', glowColor: 'rgba(52, 211, 153, 0.2)' },
      { type: 'nosql', label: 'NoSQL DB (Cassandra/Mongo)', sublabel: 'High Throughput Key-Value', iconKey: 'nosql', category: 'storage' as const, color: 'text-teal-400', bgColor: 'bg-teal-950/40', borderColor: 'border-teal-500/60', glowColor: 'rgba(45, 212, 191, 0.2)' },
      { type: 'storage', label: 'Blob / Object Storage (S3)', sublabel: 'Images / Videos / Static Data', iconKey: 'storage', category: 'storage' as const, color: 'text-orange-400', bgColor: 'bg-orange-950/40', borderColor: 'border-orange-500/60', glowColor: 'rgba(251, 146, 60, 0.2)' },
      { type: 'search', label: 'Search Engine (Elasticsearch)', sublabel: 'Full-text & Inverted Index', iconKey: 'search', category: 'storage' as const, color: 'text-yellow-400', bgColor: 'bg-yellow-950/40', borderColor: 'border-yellow-500/60', glowColor: 'rgba(250, 204, 21, 0.2)' },
    ]
  },
  {
    category: 'Caching & Messaging',
    items: [
      { type: 'cache', label: 'Distributed Cache (Redis)', sublabel: 'Sub-ms Key-Value & Eviction', iconKey: 'cache', category: 'cache' as const, color: 'text-red-400', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60', glowColor: 'rgba(248, 113, 113, 0.2)' },
      { type: 'queue', label: 'Message Broker (Kafka / SQS)', sublabel: 'Pub/Sub & Partitioned Stream', iconKey: 'queue', category: 'queue' as const, color: 'text-lime-400', bgColor: 'bg-lime-950/40', borderColor: 'border-lime-500/60', glowColor: 'rgba(163, 230, 53, 0.2)' },
    ]
  }
];

export const PREBUILT_TEMPLATES = [
  {
    id: '3-tier-web-app',
    title: 'Scalable 3-Tier Web Application',
    description: 'High-availability architecture with CDN, ALB, Stateless Microservices, Redis Cache and Master-Replica PostgreSQL.',
    nodes: [
      { id: 'node-client', type: 'client', label: 'Clients (Web & Mobile)', sublabel: '1M DAU Traffic', x: 40, y: 220, width: 160, height: 76, category: 'client', iconKey: 'client', color: 'text-sky-400', bgColor: 'bg-sky-950/40', borderColor: 'border-sky-500/60', glowColor: 'rgba(56, 189, 248, 0.2)' },
      { id: 'node-cdn', type: 'cdn', label: 'CDN Edge (Cloudflare)', sublabel: 'Static Assets & DDoS', x: 230, y: 90, width: 160, height: 76, category: 'client', iconKey: 'cdn', color: 'text-cyan-400', bgColor: 'bg-cyan-950/40', borderColor: 'border-cyan-500/60', glowColor: 'rgba(34, 211, 238, 0.2)' },
      { id: 'node-alb', type: 'load_balancer', label: 'Application Load Balancer', sublabel: 'SSL & Traffic Routing', x: 230, y: 280, width: 170, height: 76, category: 'gateway', iconKey: 'load_balancer', color: 'text-amber-400', bgColor: 'bg-amber-950/40', borderColor: 'border-amber-500/60', glowColor: 'rgba(251, 191, 36, 0.2)' },
      { id: 'node-gw', type: 'api_gateway', label: 'API Gateway', sublabel: 'Auth, Rate Limiting & JWT', x: 440, y: 280, width: 170, height: 76, category: 'gateway', iconKey: 'api_gateway', color: 'text-indigo-400', bgColor: 'bg-indigo-950/40', borderColor: 'border-indigo-500/60', glowColor: 'rgba(129, 140, 248, 0.2)' },
      { id: 'node-app', type: 'app_server', label: 'App Services (Cluster)', sublabel: 'Stateless Node/Go Pods', x: 650, y: 280, width: 170, height: 76, category: 'compute', iconKey: 'app_server', color: 'text-purple-400', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-500/60', glowColor: 'rgba(192, 132, 252, 0.2)' },
      { id: 'node-redis', type: 'cache', label: 'Redis Cluster (Cache)', sublabel: 'Session & Hot Data (LRU)', x: 860, y: 150, width: 170, height: 76, category: 'cache', iconKey: 'cache', color: 'text-red-400', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60', glowColor: 'rgba(248, 113, 113, 0.2)' },
      { id: 'node-pg', type: 'database', label: 'PostgreSQL Primary', sublabel: 'Master-Replica (ACID)', x: 860, y: 340, width: 170, height: 76, category: 'storage', iconKey: 'database', color: 'text-emerald-400', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60', glowColor: 'rgba(52, 211, 153, 0.2)' }
    ],
    connections: [
      { id: 'c-1', fromNodeId: 'node-client', toNodeId: 'node-cdn', fromPort: 'top', toPort: 'left', label: 'Static Assets', style: 'dashed', color: '#22d3ee' },
      { id: 'c-2', fromNodeId: 'node-client', toNodeId: 'node-alb', fromPort: 'right', toPort: 'left', label: 'HTTPS REST', style: 'solid', color: '#fbbf24' },
      { id: 'c-3', fromNodeId: 'node-alb', toNodeId: 'node-gw', fromPort: 'right', toPort: 'left', label: 'Internal TLS', style: 'solid', color: '#818cf8' },
      { id: 'c-4', fromNodeId: 'node-gw', toNodeId: 'node-app', fromPort: 'right', toPort: 'left', label: 'gRPC / JSON', style: 'solid', color: '#c084fc' },
      { id: 'c-5', fromNodeId: 'node-app', toNodeId: 'node-redis', fromPort: 'right', toPort: 'left', label: 'Cache Query', style: 'solid', color: '#f87171' },
      { id: 'c-6', fromNodeId: 'node-app', toNodeId: 'node-pg', fromPort: 'right', toPort: 'left', label: 'SQL Read/Write', style: 'solid', color: '#34d399' },
    ]
  },
  {
    id: 'tinyurl-template',
    title: 'URL Shortener (TinyURL)',
    description: 'High-throughput URL encoding and redirect system with Base62 Key Generation, Redis Caching, and NoSQL Key-Value store.',
    nodes: [
      { id: 'tu-client', type: 'client', label: 'Web & API Clients', sublabel: 'Write 4k QPS / Read 400k QPS', x: 40, y: 220, width: 160, height: 76, category: 'client', iconKey: 'client', color: 'text-sky-400', bgColor: 'bg-sky-950/40', borderColor: 'border-sky-500/60', glowColor: 'rgba(56, 189, 248, 0.2)' },
      { id: 'tu-alb', type: 'load_balancer', label: 'Cloud Load Balancer', sublabel: 'Geo DNS & SSL Termination', x: 230, y: 220, width: 170, height: 76, category: 'gateway', iconKey: 'load_balancer', color: 'text-amber-400', bgColor: 'bg-amber-950/40', borderColor: 'border-amber-500/60', glowColor: 'rgba(251, 191, 36, 0.2)' },
      { id: 'tu-app', type: 'app_server', label: 'URL Shortener Service', sublabel: 'Base62 & KGS Lookup', x: 440, y: 220, width: 170, height: 76, category: 'compute', iconKey: 'app_server', color: 'text-purple-400', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-500/60', glowColor: 'rgba(192, 132, 252, 0.2)' },
      { id: 'tu-cache', type: 'cache', label: 'Redis Read Cache', sublabel: 'Top 20% Hot URLs (Sub-ms)', x: 670, y: 120, width: 170, height: 76, category: 'cache', iconKey: 'cache', color: 'text-red-400', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60', glowColor: 'rgba(248, 113, 113, 0.2)' },
      { id: 'tu-db', type: 'nosql', label: 'Cassandra / DynamoDB', sublabel: 'Short URL -> Original URL', x: 670, y: 320, width: 170, height: 76, category: 'storage', iconKey: 'nosql', color: 'text-teal-400', bgColor: 'bg-teal-950/40', borderColor: 'border-teal-500/60', glowColor: 'rgba(45, 212, 191, 0.2)' },
      { id: 'tu-kgs', type: 'worker', label: 'Key Generation Service', sublabel: 'Pre-generates Base62 Keys', x: 440, y: 390, width: 170, height: 76, category: 'compute', iconKey: 'worker', color: 'text-pink-400', bgColor: 'bg-pink-950/40', borderColor: 'border-pink-500/60', glowColor: 'rgba(244, 114, 182, 0.2)' },
    ],
    connections: [
      { id: 'tuc-1', fromNodeId: 'tu-client', toNodeId: 'tu-alb', fromPort: 'right', toPort: 'left', label: 'HTTP / Shorten & Redirect', style: 'solid', color: '#38bdf8' },
      { id: 'tuc-2', fromNodeId: 'tu-alb', toNodeId: 'tu-app', fromPort: 'right', toPort: 'left', label: 'Distribute Request', style: 'solid', color: '#fbbf24' },
      { id: 'tuc-3', fromNodeId: 'tu-app', toNodeId: 'tu-cache', fromPort: 'right', toPort: 'left', label: 'Cache Lookup', style: 'solid', color: '#f87171' },
      { id: 'tuc-4', fromNodeId: 'tu-app', toNodeId: 'tu-db', fromPort: 'right', toPort: 'left', label: 'Persist / Query', style: 'solid', color: '#2dd4bf' },
      { id: 'tuc-5', fromNodeId: 'tu-kgs', toNodeId: 'tu-app', fromPort: 'top', toPort: 'bottom', label: 'Feed Unused Keys', style: 'dashed', color: '#f472b6' },
    ]
  },
  {
    id: 'netflix-youtube-template',
    title: 'YouTube / Netflix Video Streaming',
    description: 'Chunked video upload pipeline with Kafka processing queue, async transcoders, S3 blob storage, and global CDN caching.',
    nodes: [
      { id: 'vid-client', type: 'client', label: 'Stream Viewers & Creators', sublabel: 'Web / Smart TVs / Apps', x: 40, y: 220, width: 160, height: 76, category: 'client', iconKey: 'client', color: 'text-sky-400', bgColor: 'bg-sky-950/40', borderColor: 'border-sky-500/60', glowColor: 'rgba(56, 189, 248, 0.2)' },
      { id: 'vid-cdn', type: 'cdn', label: 'Global Video CDN', sublabel: 'HLS/DASH Chunks (95% Hit)', x: 230, y: 90, width: 160, height: 76, category: 'client', iconKey: 'cdn', color: 'text-cyan-400', bgColor: 'bg-cyan-950/40', borderColor: 'border-cyan-500/60', glowColor: 'rgba(34, 211, 238, 0.2)' },
      { id: 'vid-gw', type: 'api_gateway', label: 'API Gateway & Ingest', sublabel: 'Chunked Upload Controller', x: 230, y: 280, width: 170, height: 76, category: 'gateway', iconKey: 'api_gateway', color: 'text-indigo-400', bgColor: 'bg-indigo-950/40', borderColor: 'border-indigo-500/60', glowColor: 'rgba(129, 140, 248, 0.2)' },
      { id: 'vid-queue', type: 'queue', label: 'Kafka Transcode Queue', sublabel: 'Partitioned Video Jobs', x: 440, y: 280, width: 170, height: 76, category: 'queue', iconKey: 'queue', color: 'text-lime-400', bgColor: 'bg-lime-950/40', borderColor: 'border-lime-500/60', glowColor: 'rgba(163, 230, 53, 0.2)' },
      { id: 'vid-worker', type: 'worker', label: 'Transcoding Cluster', sublabel: 'FFmpeg (4K/1080p/720p HLS)', x: 670, y: 280, width: 170, height: 76, category: 'compute', iconKey: 'worker', color: 'text-pink-400', bgColor: 'bg-pink-950/40', borderColor: 'border-pink-500/60', glowColor: 'rgba(244, 114, 182, 0.2)' },
      { id: 'vid-s3', type: 'storage', label: 'AWS S3 / GCS Storage', sublabel: 'Master Raw & HLS Chunks', x: 670, y: 90, width: 170, height: 76, category: 'storage', iconKey: 'storage', color: 'text-orange-400', bgColor: 'bg-orange-950/40', borderColor: 'border-orange-500/60', glowColor: 'rgba(251, 146, 60, 0.2)' },
    ],
    connections: [
      { id: 'vc-1', fromNodeId: 'vid-client', toNodeId: 'vid-cdn', fromPort: 'top', toPort: 'left', label: 'Stream Video Chunks', style: 'solid', color: '#22d3ee' },
      { id: 'vc-2', fromNodeId: 'vid-client', toNodeId: 'vid-gw', fromPort: 'right', toPort: 'left', label: 'Upload Video / Metadata', style: 'solid', color: '#38bdf8' },
      { id: 'vc-3', fromNodeId: 'vid-gw', toNodeId: 'vid-s3', fromPort: 'top', toPort: 'bottom', label: 'Store Raw Video', style: 'solid', color: '#fb923c' },
      { id: 'vc-4', fromNodeId: 'vid-gw', toNodeId: 'vid-queue', fromPort: 'right', toPort: 'left', label: 'Enqueue Transcode', style: 'solid', color: '#a3e635' },
      { id: 'vc-5', fromNodeId: 'vid-queue', toNodeId: 'vid-worker', fromPort: 'right', toPort: 'left', label: 'Consume Task', style: 'solid', color: '#f472b6' },
      { id: 'vc-6', fromNodeId: 'vid-worker', toNodeId: 'vid-s3', fromPort: 'top', toPort: 'bottom', label: 'Store MP4/HLS', style: 'solid', color: '#fb923c' },
      { id: 'vc-7', fromNodeId: 'vid-s3', toNodeId: 'vid-cdn', fromPort: 'left', toPort: 'right', label: 'Origin Fetch', style: 'dashed', color: '#22d3ee' },
    ]
  }
];

interface HLDArchitectureCanvasProps {
  problem?: HLDProblemSpec;
  onBack?: () => void;
}

export const HLDArchitectureCanvas: React.FC<HLDArchitectureCanvasProps> = ({
  problem,
  onBack
}) => {
  const [nodes, setNodes] = useState<HLDNode[]>(() => PREBUILT_TEMPLATES[0].nodes as any);
  const [connections, setConnections] = useState<HLDConnection[]>(() => PREBUILT_TEMPLATES[0].connections as any);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Selection & Dragging
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnId, setSelectedConnId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Arrow Connection in Progress
  const [connectingStart, setConnectingStart] = useState<{ nodeId: string; port: 'top' | 'right' | 'bottom' | 'left' } | null>(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas Viewport (Zoom & Pan)
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // UI Modes
  const [activeTool, setActiveTool] = useState<'select' | 'connect' | 'pan'>('select');
  const [connLabelInput, setConnLabelInput] = useState<string>('HTTP / REST');
  const [connStyleInput, setConnStyleInput] = useState<'solid' | 'dashed'>('solid');

  // AI Review
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Edit Node Modal
  const [editingNode, setEditingNode] = useState<HLDNode | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto-fit all nodes within the canvas viewport
  const handleFitToScreen = useCallback(() => {
    if (nodes.length === 0 || !canvasRef.current) {
      setPan({ x: 0, y: 0 });
      setZoom(1.0);
      return;
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x + n.width));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y + n.height));

    const contentW = Math.max(200, maxX - minX + 140);
    const contentH = Math.max(200, maxY - minY + 140);

    const scaleX = (rect.width - 60) / contentW;
    const scaleY = (rect.height - 60) / contentH;
    const newZoom = Math.min(1.15, Math.max(0.45, Math.min(scaleX, scaleY)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoom(newZoom);
    setPan({
      x: rect.width / 2 - centerX * newZoom,
      y: rect.height / 2 - centerY * newZoom
    });
  }, [nodes]);

  // Initial fit on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitToScreen();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Get Port Absolute Coordinates for a node
  const getPortPos = useCallback((node: HLDNode, port: 'top' | 'right' | 'bottom' | 'left') => {
    switch (port) {
      case 'top': return { x: node.x + node.width / 2, y: node.y };
      case 'bottom': return { x: node.x + node.width / 2, y: node.y + node.height };
      case 'left': return { x: node.x, y: node.y + node.height / 2 };
      case 'right': return { x: node.x + node.width, y: node.y + node.height / 2 };
    }
  }, []);

  // Compute Bezier Curve String
  const getBezierPath = useCallback((x1: number, y1: number, x2: number, y2: number, fromPort: string, toPort: string) => {
    const dx = Math.abs(x2 - x1) * 0.45;
    const dy = Math.abs(y2 - y1) * 0.45;
    let cx1 = x1, cy1 = y1, cx2 = x2, cy2 = y2;

    if (fromPort === 'right') cx1 += Math.max(dx, 40);
    else if (fromPort === 'left') cx1 -= Math.max(dx, 40);
    else if (fromPort === 'bottom') cy1 += Math.max(dy, 40);
    else if (fromPort === 'top') cy1 -= Math.max(dy, 40);

    if (toPort === 'right') cx2 += Math.max(dx, 40);
    else if (toPort === 'left') cx2 -= Math.max(dx, 40);
    else if (toPort === 'bottom') cy2 += Math.max(dy, 40);
    else if (toPort === 'top') cy2 -= Math.max(dy, 40);

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  }, []);

  // Handle Dragging Nodes or Panning Canvas
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - pan.x) / zoom;
    const canvasY = (e.clientY - rect.top - pan.y) / zoom;

    setMouseCanvasPos({ x: canvasX, y: canvasY });

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (draggingNodeId) {
      setNodes(prev => prev.map(n => {
        if (n.id === draggingNodeId) {
          const rawX = canvasX - dragOffset.x;
          const rawY = canvasY - dragOffset.y;
          const snapX = Math.round(rawX / 16) * 16;
          const snapY = Math.round(rawY / 16) * 16;
          return { ...n, x: Math.max(0, snapX), y: Math.max(0, snapY) };
        }
        return n;
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: HLDNode) => {
    e.stopPropagation();
    if (activeTool === 'pan') return;
    setSelectedNodeId(node.id);
    setSelectedConnId(null);

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - pan.x) / zoom;
    const canvasY = (e.clientY - rect.top - pan.y) / zoom;

    setDraggingNodeId(node.id);
    setDragOffset({
      x: canvasX - node.x,
      y: canvasY - node.y
    });
  };

  // Start Drawing Connection Arrow from a Port
  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string, port: 'top' | 'right' | 'bottom' | 'left') => {
    e.stopPropagation();
    setConnectingStart({ nodeId, port });
  };

  // Complete Connection Arrow on a Target Port
  const handlePortMouseUp = (e: React.MouseEvent, targetNodeId: string, targetPort: 'top' | 'right' | 'bottom' | 'left') => {
    e.stopPropagation();
    if (!connectingStart) return;

    if (connectingStart.nodeId !== targetNodeId) {
      const newConn: HLDConnection = {
        id: `conn-${Date.now()}`,
        fromNodeId: connectingStart.nodeId,
        toNodeId: targetNodeId,
        fromPort: connectingStart.port,
        toPort: targetPort,
        label: connLabelInput || 'REST',
        style: connStyleInput,
        color: '#818cf8'
      };
      setConnections(prev => [...prev, newConn]);
    }
    setConnectingStart(null);
  };

  // Add Component to Canvas
  const handleAddComponent = (item: any) => {
    const nextId = `node-${Date.now()}`;
    const newNode: HLDNode = {
      id: nextId,
      type: item.type,
      label: item.label,
      sublabel: item.sublabel,
      x: Math.max(50, (-pan.x + 150) / zoom + Math.random() * 80),
      y: Math.max(50, (-pan.y + 150) / zoom + Math.random() * 80),
      width: 170,
      height: 76,
      category: item.category,
      iconKey: item.iconKey,
      color: item.color,
      bgColor: item.bgColor,
      borderColor: item.borderColor,
      glowColor: item.glowColor
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(nextId);
  };

  // Load a Prebuilt Template
  const handleLoadTemplate = (template: typeof PREBUILT_TEMPLATES[0]) => {
    setNodes(template.nodes as any);
    setConnections(template.connections as any);
    setSelectedNodeId(null);
    setSelectedConnId(null);
    setAiReport(null);
    setTimeout(() => {
      handleFitToScreen();
    }, 50);
  };

  // Delete Selected Node or Connection
  const handleDeleteSelected = () => {
    if (selectedNodeId) {
      setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
      setConnections(prev => prev.filter(c => c.fromNodeId !== selectedNodeId && c.toNodeId !== selectedNodeId));
      setSelectedNodeId(null);
    } else if (selectedConnId) {
      setConnections(prev => prev.filter(c => c.id !== selectedConnId));
      setSelectedConnId(null);
    }
  };

  // Keyboard shortcut for deleting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
        handleDeleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedConnId]);

  // AI Deep Architecture Evaluation
  const handleRunAiEvaluation = async () => {
    setIsEvaluating(true);
    setIsAiDrawerOpen(true);
    setAiReport(null);

    const nodeSummary = nodes.map(n => `- [${n.label}] (${n.type}) | Role: ${n.sublabel || 'N/A'}`).join('\n');
    const connSummary = connections.map(c => {
      const from = nodes.find(n => n.id === c.fromNodeId)?.label || c.fromNodeId;
      const to = nodes.find(n => n.id === c.toNodeId)?.label || c.toNodeId;
      return `- ${from} --> (${c.label || 'Connection'}) --> ${to}`;
    }).join('\n');

    const prompt = `You are a Principal Cloud & Distributed Systems Architect reviewing a High-Level Design (HLD) diagram.

${problem ? `Problem Target: "${problem.title}"\nDescription: ${problem.description}\nExpected Scale: ${problem.expectedScale}\n` : 'Problem Target: General High-Throughput Distributed System\n'}

Architecture Components Placed (${nodes.length}):
${nodeSummary || '(None)'}

Directed Data Flow Connections (${connections.length}):
${connSummary || '(None)'}

Evaluate this high-level architecture thoroughly and provide a structured review:
1. 🏆 Architecture Score (0-100) & Seniority Assessment (Mid / Senior / Staff / Principal Architect)
2. ⚡ Scalability & High Availability (Can it support high throughput / multi-region? Caching hit ratio & DB sharding)
3. 🚨 Single Points of Failure (SPOF) & Security Vulnerabilities (e.g., direct DB access without API Gateway, missing rate limiting)
4. 🔄 Data Flow & Protocol Verification (REST vs gRPC vs Kafka Event Streaming)
5. 🛠️ Concrete Production Improvements & Missing Components (e.g. Redis Cluster, Message Broker, CDN, Async Workers, DLQ)`;

    try {
      const response = await requestMistralChat([
        { role: 'system', content: 'You are a world-class Principal Distributed Systems Architect conducting a FAANG senior System Design interview.' },
        { role: 'user', content: prompt }
      ]);
      setAiReport(response.content);
    } catch {
      setAiReport('AI Evaluation could not be completed. Please check your network connection and try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="w-full space-y-4 animate-fadeIn select-none">
      
      {/* ── Top Header Toolbar ── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 border border-indigo-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Breadcrumbs & Problem Info */}
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-[10px] text-amber-400 font-mono tracking-wider px-2 py-0.5 rounded-lg bg-amber-950/80 border border-amber-800/60">
                HLD ARCHITECTURE STUDIO
              </span>
              {problem?.difficulty && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-purple-950 text-purple-300 border border-purple-800">
                  {problem.difficulty}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 mt-0.5 truncate max-w-md">
              {problem?.title || 'Interactive Distributed System Design Studio'}
            </h3>
          </div>
        </div>

        {/* Right Action Tools: Templates, AI Evaluation, Clear Canvas */}
        <div className="flex items-center gap-2">
          
          {/* Prebuilt Architecture Templates */}
          <div className="relative group">
            <button className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md">
              <LayoutTemplate className="w-4 h-4 text-indigo-400" />
              <span>Load Template</span>
            </button>
            <div className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 hidden group-hover:block animate-fadeIn">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-3 py-1 font-bold">Standard Architectures</p>
              {PREBUILT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleLoadTemplate(tmpl)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 transition-colors text-xs space-y-0.5 cursor-pointer"
                >
                  <p className="font-bold text-slate-200">{tmpl.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{tmpl.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Fit to View */}
          <button
            onClick={handleFitToScreen}
            className="px-3 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Auto-Fit All Components to Screen"
          >
            <Crosshair className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Fit View</span>
          </button>

          {/* AI Principal Review */}
          <button
            onClick={handleRunAiEvaluation}
            disabled={isEvaluating}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isEvaluating ? 'animate-spin text-amber-300' : 'text-amber-300'}`} />
            <span>{isEvaluating ? 'Evaluating Topology...' : 'AI Architecture Review'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Two-Column Studio: Component Catalog + Drag-and-Drop Canvas ── */}
      <div className="flex flex-col lg:flex-row gap-4 items-start min-h-[720px] relative">
        
        {/* ── LEFT: Extensible Component Library Box ── */}
        {isSidebarOpen && (
          <div className="w-full lg:w-72 glass-panel p-4 rounded-3xl border border-slate-800/80 bg-slate-950/95 flex flex-col space-y-4 overflow-y-auto max-h-[780px] custom-scrollbar flex-shrink-0 animate-fadeIn">
            
            {/* Header with "Hide Library" button directly inside the library box */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Component Library</span>
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Click to drop on canvas</p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="px-2 py-1 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                title="Hide Component Library"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
                <span>Hide</span>
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {COMPONENT_CATALOG.map((section, sIdx) => (
                <div key={sIdx} className="space-y-2">
                  <p className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider px-1">
                    {section.category}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {section.items.map((item) => {
                      const IconCmp = ICON_MAP[item.iconKey] || Box;
                      return (
                        <button
                          key={item.type}
                          onClick={() => handleAddComponent(item)}
                          className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/60 text-left transition-all cursor-pointer group shadow-sm"
                        >
                          <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${item.color} group-hover:scale-110 transition-transform`}>
                            <IconCmp className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate font-mono">
                              {item.sublabel}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Tips */}
            <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-200 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>How to scroll & connect:</span>
              </p>
              <p className="text-slate-400">Drag anywhere on canvas or use mouse wheel to pan left/right/up/down. Hover over node ports (●) to connect data flows.</p>
            </div>
          </div>
        )}

        {/* ── CENTER / RIGHT: Interactive High-Level Design Canvas ── */}
        <div 
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onWheel={(e) => {
            e.preventDefault();
            if (e.ctrlKey || e.metaKey) {
              setZoom(z => Math.min(2.5, Math.max(0.35, z - e.deltaY * 0.002)));
            } else {
              setPan(p => ({
                x: p.x - e.deltaX,
                y: p.y - e.deltaY
              }));
            }
          }}
          onMouseDown={(e) => {
            // Drag on background starts canvas panning
            setIsPanning(true);
            setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            setSelectedNodeId(null);
            setSelectedConnId(null);
          }}
          className="flex-1 glass-panel rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden relative shadow-2xl min-h-[720px] w-full"
          style={{
            cursor: isPanning ? 'grabbing' : 'grab'
          }}
        >
          
          {/* Canvas Background Grid Pattern */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(148, 163, 184, 0.15) 1.5px, transparent 1.5px)`,
              backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`
            }}
          />

          {/* ── Floating "Show Library" Button when Sidebar is Hidden ── */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-4 left-4 z-20 px-3.5 py-2 rounded-2xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold shadow-2xl border border-indigo-400/60 backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              title="Open Component Library"
            >
              <PanelLeft className="w-4 h-4" />
              <span>+ Component Library</span>
            </button>
          )}

          {/* ── Floating Left / Right / Up / Down Navigation Controls ── */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl backdrop-blur-md shadow-2xl">
            <button
              onClick={() => setPan(p => ({ ...p, x: p.x + 180 }))}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Pan Left (Scroll Left)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPan(p => ({ ...p, y: p.y + 180 }))}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Pan Up (Scroll Up)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPan(p => ({ ...p, y: p.y - 180 }))}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Pan Down (Scroll Down)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPan(p => ({ ...p, x: p.x - 180 }))}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Pan Right (Scroll Right)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* ── Canvas Viewport Zoom & Reset Controls ── */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl backdrop-blur-md shadow-xl text-xs">
            <button
              onClick={() => setZoom(z => Math.min(2.2, z + 0.15))}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-400 font-bold">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.max(0.35, z - 0.15))}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleFitToScreen}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer"
              title="Fit to Screen"
            >
              Fit
            </button>
            <button
              onClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Reset to (0,0)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* ── Scaled & Panned Canvas Layer ── */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              width: '5000px',
              height: '4000px',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          >
            
            {/* ── SVG Connection Lines Layer ── */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <marker
                  id="hld-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
                </marker>
                <marker
                  id="hld-arrow-selected"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
                </marker>
              </defs>

              {/* Render Connections */}
              {connections.map((conn) => {
                const fromNode = nodes.find(n => n.id === conn.fromNodeId);
                const toNode = nodes.find(n => n.id === conn.toNodeId);
                if (!fromNode || !toNode) return null;

                const p1 = getPortPos(fromNode, conn.fromPort);
                const p2 = getPortPos(toNode, conn.toPort);
                const pathStr = getBezierPath(p1.x, p1.y, p2.x, p2.y, conn.fromPort, conn.toPort);
                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;

                const isSelected = selectedConnId === conn.id;

                return (
                  <g key={conn.id} className="pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedConnId(conn.id); setSelectedNodeId(null); }}>
                    <path
                      d={pathStr}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                    />

                    <path
                      d={pathStr}
                      fill="none"
                      stroke={isSelected ? '#fbbf24' : (conn.color || '#818cf8')}
                      strokeWidth={isSelected ? '3' : '2'}
                      strokeDasharray={conn.style === 'dashed' ? '6 4' : undefined}
                      markerEnd={`url(#${isSelected ? 'hld-arrow-selected' : 'hld-arrow'})`}
                      className="transition-all"
                    />

                    {conn.label && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x={- (conn.label.length * 3.8 + 12)}
                          y="-11"
                          width={conn.label.length * 7.6 + 24}
                          height="22"
                          rx="8"
                          className={`${isSelected ? 'fill-amber-950 stroke-amber-500' : 'fill-slate-900 stroke-slate-800'}`}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          className={`text-[10px] font-mono font-bold ${isSelected ? 'fill-amber-300' : 'fill-indigo-300'}`}
                        >
                          {conn.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Connecting Arrow Preview */}
              {connectingStart && (
                <path
                  d={(() => {
                    const fromNode = nodes.find(n => n.id === connectingStart.nodeId);
                    if (!fromNode) return '';
                    const p1 = getPortPos(fromNode, connectingStart.port);
                    return `M ${p1.x} ${p1.y} L ${mouseCanvasPos.x} ${mouseCanvasPos.y}`;
                  })()}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
              )}
            </svg>

            {/* ── Node Components Layer ── */}
            {nodes.map((node) => {
              const IconCmp = ICON_MAP[node.iconKey] || Box;
              const isSelected = selectedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  style={{
                    transform: `translate(${node.x}px, ${node.y}px)`,
                    width: `${node.width}px`,
                    height: `${node.height}px`,
                  }}
                  className={`absolute rounded-2xl border ${node.bgColor} ${
                    isSelected 
                      ? 'ring-2 ring-amber-400 border-amber-400 shadow-2xl scale-[1.02]' 
                      : `${node.borderColor} hover:border-indigo-400/80 hover:shadow-xl`
                  } backdrop-blur-md p-3 flex items-center gap-3 transition-shadow cursor-move group select-none`}
                >
                  
                  {/* Left Node Icon */}
                  <div className={`p-2 rounded-xl bg-slate-950/80 border border-slate-800 ${node.color} flex-shrink-0 shadow-inner`}>
                    <IconCmp className="w-5 h-5" />
                  </div>

                  {/* Node Label & Sublabel */}
                  <div className="flex-1 min-w-0 pr-1">
                    <p className="text-xs font-bold text-slate-100 truncate">
                      {node.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate font-mono mt-0.5">
                      {node.sublabel || node.type}
                    </p>
                  </div>

                  {/* Node Quick Action Controls on Hover */}
                  <div className="absolute -top-3 right-2 hidden group-hover:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5 shadow-lg z-30">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingNode(node); }}
                      className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white cursor-pointer"
                      title="Edit Node Label & Role"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setNodes(prev => prev.filter(n => n.id !== node.id));
                        setConnections(prev => prev.filter(c => c.fromNodeId !== node.id && c.toNodeId !== node.id));
                      }}
                      className="p-1 hover:bg-rose-950 rounded-lg text-slate-400 hover:text-rose-400 cursor-pointer"
                      title="Delete Node"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* ── 4 Interactive Port Dots for Drawing Connections (Top, Right, Bottom, Left) ── */}
                  
                  {/* Top Port */}
                  <div
                    onMouseDown={(e) => handlePortMouseDown(e, node.id, 'top')}
                    onMouseUp={(e) => handlePortMouseUp(e, node.id, 'top')}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-400 hover:bg-indigo-400 hover:scale-125 transition-all cursor-crosshair z-20 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    title="Connect from Top Port"
                  >
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>

                  {/* Right Port */}
                  <div
                    onMouseDown={(e) => handlePortMouseDown(e, node.id, 'right')}
                    onMouseUp={(e) => handlePortMouseUp(e, node.id, 'right')}
                    className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-400 hover:bg-indigo-400 hover:scale-125 transition-all cursor-crosshair z-20 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    title="Connect from Right Port"
                  >
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>

                  {/* Bottom Port */}
                  <div
                    onMouseDown={(e) => handlePortMouseDown(e, node.id, 'bottom')}
                    onMouseUp={(e) => handlePortMouseUp(e, node.id, 'bottom')}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-400 hover:bg-indigo-400 hover:scale-125 transition-all cursor-crosshair z-20 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    title="Connect from Bottom Port"
                  >
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>

                  {/* Left Port */}
                  <div
                    onMouseDown={(e) => handlePortMouseDown(e, node.id, 'left')}
                    onMouseUp={(e) => handlePortMouseUp(e, node.id, 'left')}
                    className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-400 hover:bg-indigo-400 hover:scale-125 transition-all cursor-crosshair z-20 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    title="Connect from Left Port"
                  >
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </div>

      {/* ── Edit Node Properties Modal ── */}
      {editingNode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                <span>Edit Component Properties</span>
              </h4>
              <button onClick={() => setEditingNode(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Component Title</label>
                <input
                  type="text"
                  value={editingNode.label}
                  onChange={(e) => setEditingNode({ ...editingNode, label: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sublabel / Operational Spec</label>
                <input
                  type="text"
                  value={editingNode.sublabel || ''}
                  onChange={(e) => setEditingNode({ ...editingNode, sublabel: e.target.value })}
                  placeholder="e.g. Master-Replica, 4k QPS, Sharded"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingNode(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setNodes(prev => prev.map(n => n.id === editingNode.id ? editingNode : n));
                  setEditingNode(null);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Evaluation Review Drawer ── */}
      {isAiDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[580px] bg-slate-950/98 border-l border-indigo-500/40 shadow-2xl backdrop-blur-2xl flex flex-col animate-slideLeft">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h4 className="text-sm font-bold text-slate-100">Principal Cloud Architect Review</h4>
            </div>
            <button 
              onClick={() => setIsAiDrawerOpen(false)} 
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
            {isEvaluating ? (
              <div className="py-32 text-center text-slate-400 font-mono text-xs space-y-3 animate-pulse">
                <Sparkles className="w-10 h-10 text-amber-300 mx-auto animate-spin" />
                <p className="font-bold text-slate-200">Evaluating topology against 10M DAU FAANG standards...</p>
                <p className="text-slate-500 text-[11px]">Analyzing caching hit ratios, SPOFs, DB replication, and async message streaming</p>
              </div>
            ) : aiReport ? (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-900/50 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {aiReport}
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
};
