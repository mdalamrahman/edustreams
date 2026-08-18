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
  LayoutTemplate
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
      { id: 'node-client', type: 'client', label: 'Clients (Web & Mobile)', sublabel: '1M DAU Traffic', x: 50, y: 180, width: 170, height: 80, category: 'client', iconKey: 'client', color: 'text-sky-400', bgColor: 'bg-sky-950/40', borderColor: 'border-sky-500/60', glowColor: 'rgba(56, 189, 248, 0.2)' },
      { id: 'node-cdn', type: 'cdn', label: 'CDN Edge (Cloudflare)', sublabel: 'Static Assets & DDoS', x: 280, y: 80, width: 170, height: 80, category: 'client', iconKey: 'cdn', color: 'text-cyan-400', bgColor: 'bg-cyan-950/40', borderColor: 'border-cyan-500/60', glowColor: 'rgba(34, 211, 238, 0.2)' },
      { id: 'node-alb', type: 'load_balancer', label: 'Application Load Balancer', sublabel: 'SSL & Traffic Routing', x: 280, y: 280, width: 180, height: 80, category: 'gateway', iconKey: 'load_balancer', color: 'text-amber-400', bgColor: 'bg-amber-950/40', borderColor: 'border-amber-500/60', glowColor: 'rgba(251, 191, 36, 0.2)' },
      { id: 'node-gw', type: 'api_gateway', label: 'API Gateway', sublabel: 'Auth, Rate Limiting & JWT', x: 520, y: 280, width: 180, height: 80, category: 'gateway', iconKey: 'api_gateway', color: 'text-indigo-400', bgColor: 'bg-indigo-950/40', borderColor: 'border-indigo-500/60', glowColor: 'rgba(129, 140, 248, 0.2)' },
      { id: 'node-app', type: 'app_server', label: 'App Services (Cluster)', sublabel: 'Stateless Node/Go Pods', x: 760, y: 280, width: 180, height: 80, category: 'compute', iconKey: 'app_server', color: 'text-purple-400', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-500/60', glowColor: 'rgba(192, 132, 252, 0.2)' },
      { id: 'node-redis', type: 'cache', label: 'Redis Cluster (Cache)', sublabel: 'Session & Hot Data (LRU)', x: 1000, y: 160, width: 180, height: 80, category: 'cache', iconKey: 'cache', color: 'text-red-400', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60', glowColor: 'rgba(248, 113, 113, 0.2)' },
      { id: 'node-db', type: 'database', label: 'PostgreSQL Primary/Replica', sublabel: 'Master Write + Read Replicas', x: 1000, y: 380, width: 190, height: 80, category: 'storage', iconKey: 'database', color: 'text-emerald-400', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60', glowColor: 'rgba(52, 211, 153, 0.2)' },
    ],
    connections: [
      { id: 'conn-1', fromNodeId: 'node-client', toNodeId: 'node-cdn', fromPort: 'right', toPort: 'left', label: 'Static Requests', style: 'dashed', color: '#38bdf8' },
      { id: 'conn-2', fromNodeId: 'node-client', toNodeId: 'node-alb', fromPort: 'right', toPort: 'left', label: 'HTTPS API Req', style: 'solid', color: '#fbbf24' },
      { id: 'conn-3', fromNodeId: 'node-alb', toNodeId: 'node-gw', fromPort: 'right', toPort: 'left', label: 'Forward Traffic', style: 'solid', color: '#818cf8' },
      { id: 'conn-4', fromNodeId: 'node-gw', toNodeId: 'node-app', fromPort: 'right', toPort: 'left', label: 'gRPC / REST', style: 'solid', color: '#c084fc' },
      { id: 'conn-5', fromNodeId: 'node-app', toNodeId: 'node-redis', fromPort: 'right', toPort: 'left', label: 'Cache Read/Write', style: 'solid', color: '#f87171' },
      { id: 'conn-6', fromNodeId: 'node-app', toNodeId: 'node-db', fromPort: 'right', toPort: 'left', label: 'SQL Read/Write', style: 'solid', color: '#34d399' },
    ]
  },
  {
    id: 'url-shortener-tinyurl',
    title: 'URL Shortener (TinyURL) Architecture',
    description: 'Scalable Base62 hashing service with distributed Redis caching, Zookeeper/KGS token generator, and sharded DB.',
    nodes: [
      { id: 'tu-client', type: 'client', label: 'Clients (Web/API)', sublabel: 'Shorten & Redirect reqs', x: 50, y: 220, width: 170, height: 80, category: 'client', iconKey: 'client', color: 'text-sky-400', bgColor: 'bg-sky-950/40', borderColor: 'border-sky-500/60', glowColor: 'rgba(56, 189, 248, 0.2)' },
      { id: 'tu-lb', type: 'load_balancer', label: 'Load Balancer (ALB)', sublabel: 'High Availability', x: 280, y: 220, width: 180, height: 80, category: 'gateway', iconKey: 'load_balancer', color: 'text-amber-400', bgColor: 'bg-amber-950/40', borderColor: 'border-amber-500/60', glowColor: 'rgba(251, 191, 36, 0.2)' },
      { id: 'tu-app', type: 'app_server', label: 'URL Shortener Service', sublabel: 'Base62 Encoder / Redirector', x: 520, y: 220, width: 190, height: 80, category: 'compute', iconKey: 'app_server', color: 'text-purple-400', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-500/60', glowColor: 'rgba(192, 132, 252, 0.2)' },
      { id: 'tu-cache', type: 'cache', label: 'Redis Cache (80/20 Rule)', sublabel: 'Top 20% Hot Short URLs', x: 780, y: 110, width: 180, height: 80, category: 'cache', iconKey: 'cache', color: 'text-red-400', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60', glowColor: 'rgba(248, 113, 113, 0.2)' },
      { id: 'tu-db', type: 'nosql', label: 'NoSQL / DynamoDB', sublabel: 'Hash key -> Original URL', x: 780, y: 330, width: 190, height: 80, category: 'storage', iconKey: 'nosql', color: 'text-teal-400', bgColor: 'bg-teal-950/40', borderColor: 'border-teal-500/60', glowColor: 'rgba(45, 212, 191, 0.2)' },
      { id: 'tu-worker', type: 'worker', label: 'Key Generation Service (KGS)', sublabel: 'Pre-generates random 7-char keys', x: 520, y: 390, width: 200, height: 80, category: 'compute', iconKey: 'worker', color: 'text-pink-400', bgColor: 'bg-pink-950/40', borderColor: 'border-pink-500/60', glowColor: 'rgba(244, 114, 182, 0.2)' },
    ],
    connections: [
      { id: 'tu-c1', fromNodeId: 'tu-client', toNodeId: 'tu-lb', fromPort: 'right', toPort: 'left', label: 'GET /abc1234', style: 'solid', color: '#38bdf8' },
      { id: 'tu-c2', fromNodeId: 'tu-lb', toNodeId: 'tu-app', fromPort: 'right', toPort: 'left', label: 'Round-Robin', style: 'solid', color: '#fbbf24' },
      { id: 'tu-c3', fromNodeId: 'tu-app', toNodeId: 'tu-cache', fromPort: 'right', toPort: 'left', label: '1. Cache Lookup', style: 'solid', color: '#f87171' },
      { id: 'tu-c4', fromNodeId: 'tu-app', toNodeId: 'tu-db', fromPort: 'right', toPort: 'left', label: '2. DB Fallback', style: 'solid', color: '#2dd4bf' },
      { id: 'tu-c5', fromNodeId: 'tu-worker', toNodeId: 'tu-app', fromPort: 'top', toPort: 'bottom', label: 'Assign Pre-gen Key', style: 'dashed', color: '#f472b6' },
    ]
  },
  {
    id: 'streaming-platform-netflix',
    title: 'Video Streaming Architecture (Netflix/YouTube)',
    description: 'Content ingestion pipeline, video transcoding workers, object storage, metadata DB, and global CDN caching.',
    nodes: [
      { id: 'vid-client', type: 'client', label: 'Viewer & Creator Clients', sublabel: 'Upload / Stream HLS & DASH', x: 50, y: 220, width: 180, height: 80, category: 'client', iconKey: 'client', color: 'text-sky-400', bgColor: 'bg-sky-950/40', borderColor: 'border-sky-500/60', glowColor: 'rgba(56, 189, 248, 0.2)' },
      { id: 'vid-cdn', type: 'cdn', label: 'Global Video CDN', sublabel: 'Edge Chunk Caching', x: 280, y: 90, width: 170, height: 80, category: 'client', iconKey: 'cdn', color: 'text-cyan-400', bgColor: 'bg-cyan-950/40', borderColor: 'border-cyan-500/60', glowColor: 'rgba(34, 211, 238, 0.2)' },
      { id: 'vid-gw', type: 'api_gateway', label: 'API Gateway', sublabel: 'Upload Auth & Video APIs', x: 280, y: 320, width: 170, height: 80, category: 'gateway', iconKey: 'api_gateway', color: 'text-indigo-400', bgColor: 'bg-indigo-950/40', borderColor: 'border-indigo-500/60', glowColor: 'rgba(129, 140, 248, 0.2)' },
      { id: 'vid-upload', type: 'app_server', label: 'Video Ingestion Service', sublabel: 'Chunk Upload & S3 Signer', x: 520, y: 320, width: 190, height: 80, category: 'compute', iconKey: 'app_server', color: 'text-purple-400', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-500/60', glowColor: 'rgba(192, 132, 252, 0.2)' },
      { id: 'vid-queue', type: 'queue', label: 'Kafka Transcode Queue', sublabel: 'Job Partitioning', x: 770, y: 320, width: 180, height: 80, category: 'queue', iconKey: 'queue', color: 'text-lime-400', bgColor: 'bg-lime-950/40', borderColor: 'border-lime-500/60', glowColor: 'rgba(163, 230, 53, 0.2)' },
      { id: 'vid-worker', type: 'worker', label: 'Transcoder Workers (FFmpeg)', sublabel: '1080p, 720p, 480p, 360p', x: 1020, y: 320, width: 200, height: 80, category: 'compute', iconKey: 'worker', color: 'text-pink-400', bgColor: 'bg-pink-950/40', borderColor: 'border-pink-500/60', glowColor: 'rgba(244, 114, 182, 0.2)' },
      { id: 'vid-s3', type: 'storage', label: 'Amazon S3 Bucket', sublabel: 'Master Video & Encoded Chunks', x: 1020, y: 130, width: 200, height: 80, category: 'storage', iconKey: 'storage', color: 'text-orange-400', bgColor: 'bg-orange-950/40', borderColor: 'border-orange-500/60', glowColor: 'rgba(251, 146, 60, 0.2)' },
    ],
    connections: [
      { id: 'vc-1', fromNodeId: 'vid-client', toNodeId: 'vid-cdn', fromPort: 'top', toPort: 'left', label: 'HLS Playback', style: 'solid', color: '#22d3ee' },
      { id: 'vc-2', fromNodeId: 'vid-client', toNodeId: 'vid-gw', fromPort: 'bottom', toPort: 'left', label: 'Upload Video', style: 'solid', color: '#818cf8' },
      { id: 'vc-3', fromNodeId: 'vid-gw', toNodeId: 'vid-upload', fromPort: 'right', toPort: 'left', label: 'Forward Multipart', style: 'solid', color: '#c084fc' },
      { id: 'vc-4', fromNodeId: 'vid-upload', toNodeId: 'vid-queue', fromPort: 'right', toPort: 'left', label: 'Publish Job', style: 'solid', color: '#a3e635' },
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

  // Handle Dragging Nodes on Canvas
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
          // Snap to 16px grid
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
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 180,
      height: 80,
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
        // Only if not focused on an input
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
              <span className="font-extrabold text-[11px] text-amber-400 font-mono tracking-wider px-2.5 py-0.5 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>HLD STUDIO</span>
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                {problem ? problem.title : 'System Architecture Visual Canvas'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Drag components onto canvas &bull; Connect anchor ports with directional data flow arrows &bull; Run AI Review
            </p>
          </div>
        </div>

        {/* Middle & Right: Actions & Tools */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Tool Mode Selectors */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTool('select')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'select' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Select & Move Tool"
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Select / Move</span>
            </button>
            <button
              onClick={() => setActiveTool('pan')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'pan' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Pan Canvas Viewport"
            >
              <Move className="w-3.5 h-3.5" />
              <span>Pan</span>
            </button>
          </div>

          {/* Connection Protocol Selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 font-mono">Protocol:</span>
            <select
              value={connLabelInput}
              onChange={(e) => setConnLabelInput(e.target.value)}
              className="bg-transparent text-indigo-300 font-mono text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="HTTP / REST" className="bg-slate-900">HTTP / REST</option>
              <option value="gRPC (Proto)" className="bg-slate-900">gRPC (Proto)</option>
              <option value="WebSocket (WSS)" className="bg-slate-900">WebSocket (WSS)</option>
              <option value="Kafka Pub/Sub" className="bg-slate-900">Kafka Pub/Sub</option>
              <option value="SQL Query" className="bg-slate-900">SQL Query</option>
              <option value="Redis Cache Get" className="bg-slate-900">Redis Cache Get</option>
              <option value="Async Event" className="bg-slate-900">Async Event</option>
            </select>
          </div>

          {/* Prebuilt Templates Menu */}
          <div className="relative group">
            <button className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" />
              <span>Templates</span>
            </button>

            <div className="absolute right-0 top-full mt-2 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 hidden group-hover:block z-50 animate-fadeIn">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold p-2">Pre-built Architectures</p>
              {PREBUILT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleLoadTemplate(tmpl)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 text-xs transition-colors cursor-pointer"
                >
                  <p className="font-bold text-slate-200">{tmpl.title}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{tmpl.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Delete Selected Item */}
          {(selectedNodeId || selectedConnId) && (
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Delete selected item (or press Delete key)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          {/* AI Architecture Evaluation */}
          <button
            onClick={handleRunAiEvaluation}
            disabled={isEvaluating}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            <span>{isEvaluating ? 'Evaluating...' : 'AI Architecture Review'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Studio Layout: Component Palette + Interactive Canvas ── */}
      <div className="w-full flex flex-col lg:flex-row gap-4 min-h-[720px] relative">
        
        {/* ── LEFT: Cloud Component Catalog Sidebar (280px) ── */}
        <div className="w-full lg:w-72 glass-panel p-4 rounded-3xl border border-slate-800/80 bg-slate-950/90 flex flex-col space-y-4 overflow-y-auto max-h-[780px] custom-scrollbar flex-shrink-0">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Component Library</span>
            </h4>
            <p className="text-[11px] text-slate-500">Click any component to drop it on the canvas.</p>
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
              <span>How to connect:</span>
            </p>
            <p className="text-slate-400">Hover over any node port (●), drag an arrow to another node port to establish a directed data flow.</p>
          </div>
        </div>

        {/* ── CENTER / RIGHT: Interactive High-Level Design Canvas ── */}
        <div 
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseDown={(e) => {
            if (activeTool === 'pan') {
              setIsPanning(true);
              setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            } else {
              setSelectedNodeId(null);
              setSelectedConnId(null);
            }
          }}
          className="flex-1 glass-panel rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden relative shadow-2xl min-h-[720px]"
          style={{
            cursor: activeTool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'default'
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

          {/* Canvas Viewport Zoom & Reset Controls */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl backdrop-blur-md shadow-xl text-xs">
            <button
              onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-400 font-bold">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Reset Viewport"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* ── Scaled & Panned Canvas Layer ── */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              width: '4000px',
              height: '4000px',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          >
            
            {/* ── SVG Connection Lines Layer ── */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                {/* Arrowhead Marker */}
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
                    {/* Transparent Click Target for Ease of Selection */}
                    <path
                      d={pathStr}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                    />

                    {/* Animated Data Flow Line */}
                    <path
                      d={pathStr}
                      fill="none"
                      stroke={isSelected ? '#fbbf24' : (conn.color || '#818cf8')}
                      strokeWidth={isSelected ? '3' : '2'}
                      strokeDasharray={conn.style === 'dashed' ? '6 4' : undefined}
                      markerEnd={`url(#${isSelected ? 'hld-arrow-selected' : 'hld-arrow'})`}
                      className="transition-all"
                    />

                    {/* Connection Protocol Tag / Label */}
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

              {/* Temporary Arrow while dragging port connection */}
              {connectingStart && (() => {
                const startNode = nodes.find(n => n.id === connectingStart.nodeId);
                if (!startNode) return null;
                const p1 = getPortPos(startNode, connectingStart.port);
                const p2 = mouseCanvasPos;
                const pathStr = getBezierPath(p1.x, p1.y, p2.x, p2.y, connectingStart.port, 'left');

                return (
                  <path
                    d={pathStr}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    markerEnd="url(#hld-arrow-selected)"
                  />
                );
              })()}
            </svg>

            {/* ── Draggable Node Components Layer ── */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const IconCmp = ICON_MAP[node.iconKey] || Box;

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.width}px`,
                    height: `${node.height}px`,
                    boxShadow: isSelected ? `0 0 25px ${node.glowColor}, 0 10px 25px rgba(0,0,0,0.5)` : '0 10px 25px rgba(0,0,0,0.4)',
                  }}
                  className={`rounded-2xl border-2 transition-shadow select-none group backdrop-blur-xl flex items-center p-3.5 gap-3 cursor-move ${node.bgColor} ${
                    isSelected ? 'border-amber-400 ring-2 ring-amber-400/30 z-30' : `${node.borderColor} hover:border-indigo-400 z-10`
                  }`}
                >
                  {/* Icon Box */}
                  <div className={`p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 ${node.color} flex-shrink-0`}>
                    <IconCmp className="w-5 h-5" />
                  </div>

                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-100 truncate leading-tight">
                      {node.label}
                    </p>
                    {node.sublabel && (
                      <p className="text-[10px] text-slate-400 truncate font-mono mt-0.5">
                        {node.sublabel}
                      </p>
                    )}
                  </div>

                  {/* Edit Label / Config Trigger */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingNode(node); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                    title="Edit Component Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* ── 4 Directed Connection Ports (Top, Right, Bottom, Left) ── */}
                  {(['top', 'right', 'bottom', 'left'] as const).map((port) => (
                    <div
                      key={port}
                      onMouseDown={(e) => handlePortMouseDown(e, node.id, port)}
                      onMouseUp={(e) => handlePortMouseUp(e, node.id, port)}
                      title={`Connect from ${port} port`}
                      className={`absolute w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-slate-950 shadow-md cursor-crosshair opacity-0 group-hover:opacity-100 hover:scale-150 transition-all ${
                        port === 'top' ? '-top-2 left-1/2 -translate-x-1/2' :
                        port === 'bottom' ? '-bottom-2 left-1/2 -translate-x-1/2' :
                        port === 'left' ? '-left-2 top-1/2 -translate-y-1/2' :
                        '-right-2 top-1/2 -translate-y-1/2'
                      }`}
                    />
                  ))}
                </div>
              );
            })}

          </div>

        </div>

      </div>

      {/* ── Edit Node Metadata Modal ── */}
      {editingNode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-950 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                <span>Configure Component</span>
              </h4>
              <button onClick={() => setEditingNode(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Component Title / Role</label>
                <input
                  type="text"
                  value={editingNode.label}
                  onChange={(e) => setEditingNode({ ...editingNode, label: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Subtitle / Tech Specs (e.g. Master-Replica, 50k QPS)</label>
                <input
                  type="text"
                  value={editingNode.sublabel || ''}
                  onChange={(e) => setEditingNode({ ...editingNode, sublabel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingNode(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setNodes(prev => prev.map(n => n.id === editingNode.id ? editingNode : n));
                  setEditingNode(null);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Architecture Evaluation Drawer ── */}
      {isAiDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[560px] bg-slate-950/95 border-l border-amber-500/40 shadow-2xl backdrop-blur-2xl flex flex-col animate-slideLeft">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-600/30 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Principal Systems Architect Review</h4>
                <p className="text-[11px] text-slate-400">High-Availability & Distributed Systems Assessment</p>
              </div>
            </div>

            <button
              onClick={() => setIsAiDrawerOpen(false)}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
            {isEvaluating ? (
              <div className="py-28 text-center text-slate-400 font-mono text-xs animate-pulse">
                Analyzing distributed topology, caching bottlenecks, data flow arrows, and single points of failure...
              </div>
            ) : aiReport ? (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-900/50 text-xs sm:text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                {aiReport}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 font-mono text-xs">
                Build your architecture diagram and click "AI Architecture Review" for senior engineering feedback.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
