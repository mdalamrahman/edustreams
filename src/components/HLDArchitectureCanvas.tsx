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
  Minimize2,
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
  Crosshair,
  Smartphone,
  Laptop,
  Flame,
  Binary,
  FolderArchive,
  Workflow,
  Network,
  Split,
  Boxes,
  Key,
  CreditCard,
  Bell,
  Mail,
  LineChart,
  BarChart3,
  LayoutDashboard,
  Type,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Square,
  User,
  Users,
  Share2,
  Compass,
  Webhook,
  Clock,
  Timer,
  Building2,
  PenTool,
  Pencil,
  Undo2,
  Redo2,
  Grid,
  Copy,
  Palette
} from 'lucide-react';
import { requestMistralChat } from '../lib/mistral';
import { MarkdownRenderer } from './MarkdownRenderer';
import { deductCredits, canAffordAction, PRICING_CONFIG } from '../lib/billing';
import { InsufficientCreditsModal } from './InsufficientCreditsModal';
import { WalletTopupModal } from './WalletTopupModal';

export interface HLDNode {
  id: string;
  type: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category: 'client' | 'gateway' | 'compute' | 'storage' | 'cache' | 'queue' | 'security' | 'observability';
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
  mobile: Smartphone,
  desktop: Laptop,
  user: User,
  cdn: Globe,
  dns: Network,
  reverse_proxy: Server,
  load_balancer: Layers,
  api_gateway: ShieldCheck,
  rate_limiter: ShieldAlert,
  security: Lock,
  app_server: Server,
  worker: Cpu,
  serverless: Zap,
  websocket: Radio,
  auth: Key,
  payment: CreditCard,
  notification: Bell,
  database: Database,
  replica_db: Database,
  nosql: HardDrive,
  key_value: Boxes,
  graph_db: Share2,
  timeseries: LineChart,
  vector_db: Binary,
  storage: FolderArchive,
  data_warehouse: Building2,
  search: Search,
  cache: Flame,
  memcached: Zap,
  lock_mgr: Lock,
  queue: Box,
  kafka: Activity,
  event_stream: Workflow,
  spark: Cpu,
  monitoring: BarChart3,
  tracing: Compass,
  logging: FileCode,
  alerting: Bell,
  container_box: Square
};

export const COMPONENT_CATALOG = [
  {
    category: 'Clients & Edge (Ingress)',
    items: [
      { type: 'client', label: 'Web / Browser Client', sublabel: 'React / Next.js SPA', iconKey: 'desktop', category: 'client' as const, color: 'text-sky-400', bgColor: 'bg-sky-950/40', borderColor: 'border-sky-500/60', glowColor: 'rgba(56, 189, 248, 0.2)' },
      { type: 'mobile', label: 'Mobile Client (iOS/Android)', sublabel: 'Native App / Push Token', iconKey: 'mobile', category: 'client' as const, color: 'text-blue-400', bgColor: 'bg-blue-950/40', borderColor: 'border-blue-500/60', glowColor: 'rgba(96, 165, 250, 0.2)' },
      { type: 'user', label: 'User / Actor Persona', sublabel: 'End User / Tenant', iconKey: 'user', category: 'client' as const, color: 'text-indigo-300', bgColor: 'bg-indigo-950/40', borderColor: 'border-indigo-500/60', glowColor: 'rgba(165, 180, 252, 0.2)' },
      { type: 'cdn', label: 'CDN (Cloudflare / CloudFront)', sublabel: 'Edge Static & HLS Cache', iconKey: 'cdn', category: 'client' as const, color: 'text-cyan-400', bgColor: 'bg-cyan-950/40', borderColor: 'border-cyan-500/60', glowColor: 'rgba(34, 211, 238, 0.2)' },
      { type: 'dns', label: 'Anycast DNS (Route 53)', sublabel: 'Latency & Geo Routing', iconKey: 'dns', category: 'client' as const, color: 'text-emerald-400', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60', glowColor: 'rgba(52, 211, 153, 0.2)' },
    ]
  },
  {
    category: 'Traffic & Gateways',
    items: [
      { type: 'load_balancer', label: 'Load Balancer (ALB / NLB)', sublabel: 'Round-Robin / Least Conn', iconKey: 'load_balancer', category: 'gateway' as const, color: 'text-amber-400', bgColor: 'bg-amber-950/40', borderColor: 'border-amber-500/60', glowColor: 'rgba(251, 191, 36, 0.2)' },
      { type: 'api_gateway', label: 'API Gateway (Kong / Envoy)', sublabel: 'Routing / TLS / SSL Termination', iconKey: 'api_gateway', category: 'gateway' as const, color: 'text-indigo-400', bgColor: 'bg-indigo-950/40', borderColor: 'border-indigo-500/60', glowColor: 'rgba(129, 140, 248, 0.2)' },
      { type: 'rate_limiter', label: 'Rate Limiter Middleware', sublabel: 'Token Bucket / Sliding Window', iconKey: 'rate_limiter', category: 'gateway' as const, color: 'text-violet-400', bgColor: 'bg-violet-950/40', borderColor: 'border-violet-500/60', glowColor: 'rgba(167, 139, 250, 0.2)' },
      { type: 'security', label: 'WAF & DDoS Shield', sublabel: 'IP Filter / Bot Protection', iconKey: 'security', category: 'security' as const, color: 'text-rose-400', bgColor: 'bg-rose-950/40', borderColor: 'border-rose-500/60', glowColor: 'rgba(244, 63, 94, 0.2)' },
    ]
  },
  {
    category: 'Compute & Microservices',
    items: [
      { type: 'app_server', label: 'App Service Pod (Cluster)', sublabel: 'Stateless REST / gRPC', iconKey: 'app_server', category: 'compute' as const, color: 'text-purple-400', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-500/60', glowColor: 'rgba(192, 132, 252, 0.2)' },
      { type: 'worker', label: 'Async Job Worker (Celery/Go)', sublabel: 'Background Task Consumer', iconKey: 'worker', category: 'compute' as const, color: 'text-pink-400', bgColor: 'bg-pink-950/40', borderColor: 'border-pink-500/60', glowColor: 'rgba(244, 114, 182, 0.2)' },
      { type: 'serverless', label: 'Serverless (AWS Lambda)', sublabel: 'Event-driven Compute', iconKey: 'serverless', category: 'compute' as const, color: 'text-yellow-400', bgColor: 'bg-yellow-950/40', borderColor: 'border-yellow-500/60', glowColor: 'rgba(250, 204, 21, 0.2)' },
      { type: 'websocket', label: 'WebSocket Gateway', sublabel: 'Bi-directional Realtime Push', iconKey: 'websocket', category: 'compute' as const, color: 'text-blue-400', bgColor: 'bg-blue-950/40', borderColor: 'border-blue-500/60', glowColor: 'rgba(96, 165, 250, 0.2)' },
      { type: 'auth', label: 'Auth & IAM (OAuth / JWT)', sublabel: 'Keycloak / Auth0 / Tokens', iconKey: 'auth', category: 'security' as const, color: 'text-emerald-400', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60', glowColor: 'rgba(52, 211, 153, 0.2)' },
      { type: 'payment', label: 'Payment Gateway (Stripe)', sublabel: 'Idempotency & Webhooks', iconKey: 'payment', category: 'compute' as const, color: 'text-green-400', bgColor: 'bg-green-950/40', borderColor: 'border-green-500/60', glowColor: 'rgba(74, 222, 128, 0.2)' },
      { type: 'notification', label: 'Notification Hub', sublabel: 'FCM / APNs / Twilio SMS', iconKey: 'notification', category: 'compute' as const, color: 'text-amber-300', bgColor: 'bg-amber-950/40', borderColor: 'border-amber-500/60', glowColor: 'rgba(252, 211, 77, 0.2)' },
    ]
  },
  {
    category: 'Databases & Persistent Stores',
    items: [
      { type: 'database', label: 'PostgreSQL / MySQL Primary', sublabel: 'Master Write Instance (ACID)', iconKey: 'database', category: 'storage' as const, color: 'text-emerald-400', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60', glowColor: 'rgba(52, 211, 153, 0.2)' },
      { type: 'replica_db', label: 'Read Replica Cluster', sublabel: 'Horizontal Scale for Read QPS', iconKey: 'replica_db', category: 'storage' as const, color: 'text-teal-400', bgColor: 'bg-teal-950/40', borderColor: 'border-teal-500/60', glowColor: 'rgba(45, 212, 191, 0.2)' },
      { type: 'nosql', label: 'NoSQL DB (Cassandra/Mongo)', sublabel: 'High-Write Partitioned Scale', iconKey: 'nosql', category: 'storage' as const, color: 'text-cyan-400', bgColor: 'bg-cyan-950/40', borderColor: 'border-cyan-500/60', glowColor: 'rgba(34, 211, 238, 0.2)' },
      { type: 'key_value', label: 'Key-Value (DynamoDB)', sublabel: 'Single-digit ms Key Lookup', iconKey: 'key_value', category: 'storage' as const, color: 'text-blue-400', bgColor: 'bg-blue-950/40', borderColor: 'border-blue-500/60', glowColor: 'rgba(96, 165, 250, 0.2)' },
      { type: 'graph_db', label: 'Graph DB (Neo4j / Neptune)', sublabel: 'Social Graph & Traversal', iconKey: 'graph_db', category: 'storage' as const, color: 'text-fuchsia-400', bgColor: 'bg-fuchsia-950/40', borderColor: 'border-fuchsia-500/60', glowColor: 'rgba(232, 121, 249, 0.2)' },
      { type: 'timeseries', label: 'Time-Series DB (InfluxDB)', sublabel: 'Metrics & Rollup Logs', iconKey: 'timeseries', category: 'storage' as const, color: 'text-sky-400', bgColor: 'bg-sky-950/40', borderColor: 'border-sky-500/60', glowColor: 'rgba(56, 189, 248, 0.2)' },
      { type: 'vector_db', label: 'Vector DB (Pinecone / Milvus)', sublabel: 'Embeddings & Semantic Search', iconKey: 'vector_db', category: 'storage' as const, color: 'text-violet-400', bgColor: 'bg-violet-950/40', borderColor: 'border-violet-500/60', glowColor: 'rgba(167, 139, 250, 0.2)' },
      { type: 'storage', label: 'Blob / Object Storage (AWS S3)', sublabel: 'Media / Videos / Raw Payloads', iconKey: 'storage', category: 'storage' as const, color: 'text-orange-400', bgColor: 'bg-orange-950/40', borderColor: 'border-orange-500/60', glowColor: 'rgba(251, 146, 60, 0.2)' },
      { type: 'data_warehouse', label: 'Data Warehouse (Snowflake)', sublabel: 'Big Data OLAP & ETL', iconKey: 'data_warehouse', category: 'storage' as const, color: 'text-indigo-400', bgColor: 'bg-indigo-950/40', borderColor: 'border-indigo-500/60', glowColor: 'rgba(129, 140, 248, 0.2)' },
      { type: 'search', label: 'Search Engine (Elasticsearch)', sublabel: 'Full-text & Inverted Index', iconKey: 'search', category: 'storage' as const, color: 'text-yellow-400', bgColor: 'bg-yellow-950/40', borderColor: 'border-yellow-500/60', glowColor: 'rgba(250, 204, 21, 0.2)' },
    ]
  },
  {
    category: 'Caching & Fast Memory',
    items: [
      { type: 'cache', label: 'Redis Cluster (Cache)', sublabel: 'Sub-ms Key-Value & Eviction', iconKey: 'cache', category: 'cache' as const, color: 'text-red-400', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60', glowColor: 'rgba(248, 113, 113, 0.2)' },
      { type: 'memcached', label: 'Memcached (Simple Key-Val)', sublabel: 'Multi-threaded Pure Cache', iconKey: 'memcached', category: 'cache' as const, color: 'text-amber-400', bgColor: 'bg-amber-950/40', borderColor: 'border-amber-500/60', glowColor: 'rgba(251, 191, 36, 0.2)' },
      { type: 'lock_mgr', label: 'Distributed Lock (Redlock)', sublabel: 'Concurrency Leader Election', iconKey: 'lock_mgr', category: 'cache' as const, color: 'text-rose-400', bgColor: 'bg-rose-950/40', borderColor: 'border-rose-500/60', glowColor: 'rgba(244, 63, 94, 0.2)' },
    ]
  },
  {
    category: 'Streaming & Messaging',
    items: [
      { type: 'kafka', label: 'Apache Kafka Event Stream', sublabel: 'Partitioned Log / High QPS', iconKey: 'kafka', category: 'queue' as const, color: 'text-lime-400', bgColor: 'bg-lime-950/40', borderColor: 'border-lime-500/60', glowColor: 'rgba(163, 230, 53, 0.2)' },
      { type: 'queue', label: 'Message Queue (RabbitMQ/SQS)', sublabel: 'FIFO / Pub-Sub Message Broker', iconKey: 'queue', category: 'queue' as const, color: 'text-emerald-400', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60', glowColor: 'rgba(52, 211, 153, 0.2)' },
      { type: 'spark', label: 'Streaming Processor (Flink/Spark)', sublabel: 'Realtime Aggregation Pipeline', iconKey: 'spark', category: 'compute' as const, color: 'text-orange-400', bgColor: 'bg-orange-950/40', borderColor: 'border-orange-500/60', glowColor: 'rgba(251, 146, 60, 0.2)' },
    ]
  },
  {
    category: 'Observability & Reliability',
    items: [
      { type: 'monitoring', label: 'Prometheus & Metrics Scraper', sublabel: 'Timeseries Counters & Gauges', iconKey: 'monitoring', category: 'observability' as const, color: 'text-teal-400', bgColor: 'bg-teal-950/40', borderColor: 'border-teal-500/60', glowColor: 'rgba(45, 212, 191, 0.2)' },
      { type: 'tracing', label: 'Distributed Tracing (Jaeger)', sublabel: 'OpenTelemetry Spans & Flamegraph', iconKey: 'tracing', category: 'observability' as const, color: 'text-purple-400', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-500/60', glowColor: 'rgba(192, 132, 252, 0.2)' },
      { type: 'logging', label: 'Central Log Store (ELK/Loki)', sublabel: 'Log Aggregation & Alerts', iconKey: 'logging', category: 'observability' as const, color: 'text-yellow-400', bgColor: 'bg-yellow-950/40', borderColor: 'border-yellow-500/60', glowColor: 'rgba(250, 204, 21, 0.2)' },
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

export const CONNECTION_PRESETS = [
  { label: 'HTTP / REST', color: '#38bdf8', style: 'solid' as const, desc: 'REST API' },
  { label: 'gRPC / RPC', color: '#818cf8', style: 'solid' as const, desc: 'Binary RPC' },
  { label: 'WebSocket', color: '#60a5fa', style: 'solid' as const, desc: 'Realtime Push' },
  { label: 'Kafka / Queue', color: '#fb923c', style: 'dashed' as const, desc: 'Event Queue' },
  { label: 'Async Worker', color: '#f472b6', style: 'dashed' as const, desc: 'Async Job' },
  { label: 'SQL / Query', color: '#34d399', style: 'solid' as const, desc: 'Database Query' },
  { label: 'Cache Lookup', color: '#f87171', style: 'dashed' as const, desc: 'Redis / Memcached' },
  { label: 'Internal Call', color: '#94a3b8', style: 'solid' as const, desc: 'Internal Traffic' },
];

export const COLOR_THEMES = [
  { name: 'Sky', color: 'text-sky-400', bgColor: 'bg-sky-950/40', borderColor: 'border-sky-500/60', glowColor: 'rgba(56, 189, 248, 0.2)' },
  { name: 'Emerald', color: 'text-emerald-400', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60', glowColor: 'rgba(52, 211, 153, 0.2)' },
  { name: 'Amber', color: 'text-amber-400', bgColor: 'bg-amber-950/40', borderColor: 'border-amber-500/60', glowColor: 'rgba(251, 191, 36, 0.2)' },
  { name: 'Purple', color: 'text-purple-400', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-500/60', glowColor: 'rgba(192, 132, 252, 0.2)' },
  { name: 'Rose', color: 'text-rose-400', bgColor: 'bg-rose-950/40', borderColor: 'border-rose-500/60', glowColor: 'rgba(244, 63, 94, 0.2)' },
  { name: 'Orange', color: 'text-orange-400', bgColor: 'bg-orange-950/40', borderColor: 'border-orange-500/60', glowColor: 'rgba(251, 146, 60, 0.2)' },
];

interface HLDArchitectureCanvasProps {
  problem?: HLDProblemSpec;
  onBack?: () => void;
}

export const HLDArchitectureCanvas: React.FC<HLDArchitectureCanvasProps> = ({
  problem,
  onBack
}) => {
  // Mode selection: Interactive Node Studio vs Excalidraw Whiteboard
  const [studioMode, setStudioMode] = useState<'studio' | 'excalidraw'>('studio');
  const [excalidrawNotes, setExcalidrawNotes] = useState<string>('');

  // Initial starter state (starts with clean single entrypoint or empty canvas for practice)
  const initialStarterNodes: HLDNode[] = useMemo(() => [
    {
      id: 'node-client-start',
      type: 'client',
      label: 'Client / User App',
      sublabel: 'Web & Mobile Traffic',
      x: 60,
      y: 220,
      width: 165,
      height: 76,
      category: 'client',
      iconKey: 'client',
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/40',
      borderColor: 'border-sky-500/60',
      glowColor: 'rgba(56, 189, 248, 0.2)'
    }
  ], []);

  const [nodes, setNodes] = useState<HLDNode[]>(() => initialStarterNodes);
  const [connections, setConnections] = useState<HLDConnection[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isConfirmRevealOpen, setIsConfirmRevealOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenExcalidraw, setIsFullscreenExcalidraw] = useState(false);
  const [isInsufficientCreditsOpen, setIsInsufficientCreditsOpen] = useState(false);
  const [isWalletTopupOpen, setIsWalletTopupOpen] = useState(false);
  const [insufficientMeta, setInsufficientMeta] = useState<{ cost: number; action: string }>({ cost: 1.0, action: 'AI Architecture Review' });
  const [sessionStudioCharged, setSessionStudioCharged] = useState(false);

  // Selection & Dragging
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnId, setSelectedConnId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Arrow Connection in Progress
  const [connectingStart, setConnectingStart] = useState<{ nodeId: string; port: 'top' | 'right' | 'bottom' | 'left' } | null>(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas Viewport (Zoom & Pan)
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // UI Modes & Tools
  const [activeTool, setActiveTool] = useState<'select' | 'connect' | 'pan'>('select');
  const [connLabelInput, setConnLabelInput] = useState<string>('HTTP / REST');
  const [connStyleInput, setConnStyleInput] = useState<'solid' | 'dashed'>('solid');
  const [connColorInput, setConnColorInput] = useState<string>('#38bdf8');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);

  // Node Context Menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);

  // Undo / Redo History Stack (up to 30 snapshots)
  interface HistorySnapshot {
    nodes: HLDNode[];
    connections: HLDConnection[];
  }
  const historyRef = useRef<HistorySnapshot[]>([
    { nodes: initialStarterNodes, connections: [] }
  ]);
  const historyIndexRef = useRef<number>(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isHistoryActionRef = useRef(false);

  const pushHistorySnapshot = useCallback((newNodes: HLDNode[], newConns: HLDConnection[]) => {
    if (isHistoryActionRef.current) return;
    const nextHist = historyRef.current.slice(0, historyIndexRef.current + 1);
    nextHist.push({
      nodes: JSON.parse(JSON.stringify(newNodes)),
      connections: JSON.parse(JSON.stringify(newConns))
    });
    if (nextHist.length > 30) {
      nextHist.shift();
    }
    historyRef.current = nextHist;
    historyIndexRef.current = nextHist.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    isHistoryActionRef.current = true;
    setNodes(JSON.parse(JSON.stringify(snapshot.nodes)));
    setConnections(JSON.parse(JSON.stringify(snapshot.connections)));
    setSelectedNodeId(null);
    setSelectedConnId(null);
    isHistoryActionRef.current = false;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(true);
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    isHistoryActionRef.current = true;
    setNodes(JSON.parse(JSON.stringify(snapshot.nodes)));
    setConnections(JSON.parse(JSON.stringify(snapshot.connections)));
    setSelectedNodeId(null);
    setSelectedConnId(null);
    isHistoryActionRef.current = false;
    setCanUndo(true);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  // Node duplication
  const handleDuplicateNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const newId = `node-${Date.now()}`;
    const duplicated: HLDNode = {
      ...node,
      id: newId,
      label: `${node.label} (Copy)`,
      x: node.x + 32,
      y: node.y + 32
    };
    const nextNodes = [...nodes, duplicated];
    setNodes(nextNodes);
    setSelectedNodeId(newId);
    pushHistorySnapshot(nextNodes, connections);
  }, [nodes, connections, pushHistorySnapshot]);

  // Node recoloring
  const handleRecolorNode = useCallback((nodeId: string, theme: typeof COLOR_THEMES[0]) => {
    const nextNodes = nodes.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          color: theme.color,
          bgColor: theme.bgColor,
          borderColor: theme.borderColor,
          glowColor: theme.glowColor,
        };
      }
      return n;
    });
    setNodes(nextNodes);
    pushHistorySnapshot(nextNodes, connections);
  }, [nodes, connections, pushHistorySnapshot]);

  // Context Menu trigger
  const handleNodeContextMenu = useCallback((e: React.MouseEvent, node: HLDNode) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setSelectedConnId(null);
    setContextMenu({
      x: Math.min(window.innerWidth - 220, e.clientX),
      y: Math.min(window.innerHeight - 280, e.clientY),
      nodeId: node.id
    });
  }, []);

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

  // Non-passive Wheel Listener for Smooth Panning & Zooming without console errors
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        setZoom(z => Math.min(2.5, Math.max(0.35, z - e.deltaY * 0.002)));
      } else {
        setPan(p => ({
          x: p.x - e.deltaX,
          y: p.y - e.deltaY
        }));
      }
    };

    el.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => el.removeEventListener('wheel', handleWheelNative);
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

  // Convert screen coordinates to canvas-space coordinates
  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom
    };
  }, [pan, zoom]);

  // Delete selected node or connection
  const handleDeleteSelected = useCallback(() => {
    if (selectedNodeId) {
      const nextNodes = nodes.filter(n => n.id !== selectedNodeId);
      const nextConns = connections.filter(c => c.fromNodeId !== selectedNodeId && c.toNodeId !== selectedNodeId);
      setNodes(nextNodes);
      setConnections(nextConns);
      setSelectedNodeId(null);
      pushHistorySnapshot(nextNodes, nextConns);
    } else if (selectedConnId) {
      const nextConns = connections.filter(c => c.id !== selectedConnId);
      setConnections(nextConns);
      setSelectedConnId(null);
      pushHistorySnapshot(nodes, nextConns);
    }
  }, [selectedNodeId, selectedConnId, nodes, connections, pushHistorySnapshot]);

  // Global Keyboard Shortcuts (Undo, Redo, Delete, Duplicate, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      if (e.key === 'Escape') {
        if (contextMenu) {
          setContextMenu(null);
        } else if (isConfirmRevealOpen) {
          setIsConfirmRevealOpen(false);
        } else if (editingNode) {
          setEditingNode(null);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (selectedNodeId) {
          e.preventDefault();
          handleDuplicateNode(selectedNodeId);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId || selectedConnId) {
          e.preventDefault();
          handleDeleteSelected();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [contextMenu, isConfirmRevealOpen, editingNode, isFullscreen, selectedNodeId, selectedConnId, handleUndo, handleRedo, handleDuplicateNode, handleDeleteSelected]);

  // Export Canvas directly to high-res PNG image
  const handleExportPng = useCallback(() => {
    if (nodes.length === 0) return;

    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x + n.width));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y + n.height));

    const padding = 60;
    const rawW = Math.max(700, maxX - minX + padding * 2);
    const rawH = Math.max(450, maxY - minY + padding * 2 + 30);
    const scale = 2; // 2x retina clarity

    const canvas = document.createElement('canvas');
    canvas.width = rawW * scale;
    canvas.height = rawH * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(scale, scale);

    // Canvas Background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, rawW, rawH);

    // Subtle grid dots
    ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
    for (let gx = 0; gx < rawW; gx += 24) {
      for (let gy = 0; gy < rawH; gy += 24) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Header Title
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(problem?.title || 'Distributed System Architecture', padding, 24);

    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Exported from SDETube HLD Architecture Studio', padding, 46);

    const offsetX = padding - minX;
    const offsetY = padding + 40 - minY;

    const drawRoundRectPath = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    // Draw Connections
    connections.forEach((conn) => {
      const fromNode = nodes.find(n => n.id === conn.fromNodeId);
      const toNode = nodes.find(n => n.id === conn.toNodeId);
      if (!fromNode || !toNode) return;

      const p1 = getPortPos(fromNode, conn.fromPort);
      const p2 = getPortPos(toNode, conn.toPort);

      const x1 = p1.x + offsetX;
      const y1 = p1.y + offsetY;
      const x2 = p2.x + offsetX;
      const y2 = p2.y + offsetY;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const cx1 = x1 + (conn.fromPort === 'right' ? Math.max(40, dx / 2) : conn.fromPort === 'left' ? -Math.max(40, -dx / 2) : 0);
      const cy1 = y1 + (conn.fromPort === 'bottom' ? Math.max(40, dy / 2) : conn.fromPort === 'top' ? -Math.max(40, -dy / 2) : 0);
      const cx2 = x2 + (conn.toPort === 'left' ? -Math.max(40, -dx / 2) : conn.toPort === 'right' ? Math.max(40, dx / 2) : 0);
      const cy2 = y2 + (conn.toPort === 'top' ? -Math.max(40, -dy / 2) : conn.toPort === 'bottom' ? Math.max(40, dy / 2) : 0);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
      ctx.strokeStyle = conn.color || '#818cf8';
      ctx.lineWidth = 2;
      if (conn.style === 'dashed') {
        ctx.setLineDash([5, 5]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw arrow head at end
      const angle = Math.atan2(y2 - cy2, x2 - cx2);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI / 7), y2 - 10 * Math.sin(angle - Math.PI / 7));
      ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI / 7), y2 - 10 * Math.sin(angle + Math.PI / 7));
      ctx.closePath();
      ctx.fillStyle = conn.color || '#818cf8';
      ctx.fill();

      // Label badge
      if (conn.label) {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        ctx.font = 'bold 9px monospace';
        const tw = ctx.measureText(conn.label).width;
        drawRoundRectPath(midX - tw / 2 - 6, midY - 9, tw + 12, 18, 5);
        ctx.fillStyle = '#020617';
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(conn.label, midX, midY);
      }
    });

    // Draw Nodes
    nodes.forEach((node) => {
      const nx = node.x + offsetX;
      const ny = node.y + offsetY;
      const nw = node.width;
      const nh = node.height;

      // Node shadow
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;

      // Node container
      drawRoundRectPath(nx, ny, nw, nh, 12);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Node border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Node title
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(node.label, nx + 14, ny + 16);

      // Node subtitle
      if (node.sublabel) {
        ctx.font = '9px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(node.sublabel, nx + 14, ny + 36);
      }
    });

    const link = document.createElement('a');
    link.download = `${(problem?.title || 'architecture-design').toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [nodes, connections, problem, getPortPos]);

  // Add Component from Catalog to Canvas
  const handleAddComponent = (templateItem: typeof COMPONENT_CATALOG[0]['items'][0]) => {
    // If not charged for Architecture Studio platform drawing today, charge 50 paise (₹0.50)
    if (!sessionStudioCharged) {
      if (!canAffordAction(PRICING_CONFIG.HLD_STUDIO_PLATFORM_DRAWING)) {
        setInsufficientMeta({
          cost: PRICING_CONFIG.HLD_STUDIO_PLATFORM_DRAWING,
          action: 'using Architecture Studio drawing platform (50 paise)'
        });
        setIsInsufficientCreditsOpen(true);
        return;
      }
      deductCredits(
        PRICING_CONFIG.HLD_STUDIO_PLATFORM_DRAWING,
        'HLD_STUDIO_DRAW',
        '🏗️ High-Level Design Architecture Studio Platform Access (₹0.50)'
      );
      setSessionStudioCharged(true);
    }

    const id = `node-${Date.now()}`;
    const newNode: HLDNode = {
      id,
      type: templateItem.type,
      label: templateItem.label,
      sublabel: templateItem.sublabel,
      x: -pan.x / zoom + 260 + (Math.random() * 80),
      y: -pan.y / zoom + 180 + (Math.random() * 80),
      width: 175,
      height: 76,
      category: templateItem.category,
      iconKey: templateItem.iconKey,
      color: templateItem.color,
      bgColor: templateItem.bgColor,
      borderColor: templateItem.borderColor,
      glowColor: templateItem.glowColor,
    };
    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    setSelectedNodeId(id);
    pushHistorySnapshot(nextNodes, connections);
  };

  // Dragging Nodes
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (activeTool === 'connect') return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    dragStartPosRef.current = { x: node.x, y: node.y };
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: canvasPos.x - node.x,
      y: canvasPos.y - node.y
    });
    setSelectedNodeId(nodeId);
    setSelectedConnId(null);
    setContextMenu(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setMouseCanvasPos(canvasPos);

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (draggingNodeId) {
      setNodes(prev => prev.map(node => {
        if (node.id === draggingNodeId) {
          let nx = canvasPos.x - dragOffset.x;
          let ny = canvasPos.y - dragOffset.y;
          if (snapToGrid) {
            nx = Math.round(nx / 16) * 16;
            ny = Math.round(ny / 16) * 16;
          } else {
            nx = Math.round(nx);
            ny = Math.round(ny);
          }
          return {
            ...node,
            x: nx,
            y: ny
          };
        }
        return node;
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingNodeId && dragStartPosRef.current) {
      const movedNode = nodes.find(n => n.id === draggingNodeId);
      if (movedNode && (movedNode.x !== dragStartPosRef.current.x || movedNode.y !== dragStartPosRef.current.y)) {
        pushHistorySnapshot(nodes, connections);
      }
    }
    dragStartPosRef.current = null;
    setDraggingNodeId(null);
    setIsPanning(false);
    if (connectingStart) {
      setConnectingStart(null);
    }
  };

  // Port Click to Connect
  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string, port: 'top' | 'right' | 'bottom' | 'left') => {
    e.stopPropagation();
    if (!connectingStart) {
      setConnectingStart({ nodeId, port });
    } else {
      if (connectingStart.nodeId !== nodeId) {
        const newConn: HLDConnection = {
          id: `conn-${Date.now()}`,
          fromNodeId: connectingStart.nodeId,
          toNodeId: nodeId,
          fromPort: connectingStart.port,
          toPort: port,
          label: connLabelInput,
          style: connStyleInput,
          color: connColorInput || '#818cf8'
        };
        const nextConns = [...connections, newConn];
        setConnections(nextConns);
        pushHistorySnapshot(nodes, nextConns);
      }
      setConnectingStart(null);
    }
  };

  const handleClearCanvas = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeId(null);
    setSelectedConnId(null);
    pushHistorySnapshot([], []);
  };

  const handleLoadTemplate = (tmpl: typeof PREBUILT_TEMPLATES[0]) => {
    const nextNodes = tmpl.nodes as HLDNode[];
    const nextConns = tmpl.connections as HLDConnection[];
    setNodes(nextNodes);
    setConnections(nextConns);
    setSelectedNodeId(null);
    setSelectedConnId(null);
    pushHistorySnapshot(nextNodes, nextConns);
    setTimeout(() => handleFitToScreen(), 100);
  };

  const handleRevealReferenceSolution = () => {
    // Find matching template or default to 3-tier
    let match = PREBUILT_TEMPLATES.find(t => 
      problem?.id && (
        (problem.id.includes('url') && t.id.includes('tinyurl')) ||
        (problem.id.includes('video') && t.id.includes('netflix'))
      )
    );
    if (!match) match = PREBUILT_TEMPLATES[0];
    handleLoadTemplate(match);
    setIsConfirmRevealOpen(false);
  };

  // Run AI Architecture Evaluation
  const handleRunAiEvaluation = async () => {
    // Check if candidate can afford ₹1.00 for HLD AI Evaluation
    if (!canAffordAction(PRICING_CONFIG.AI_EVALUATION_HLD)) {
      setInsufficientMeta({
        cost: PRICING_CONFIG.AI_EVALUATION_HLD,
        action: 'High-Level Design AI Principal Architecture Review (₹1.00)'
      });
      setIsInsufficientCreditsOpen(true);
      return;
    }

    // Deduct ₹1.00
    deductCredits(
      PRICING_CONFIG.AI_EVALUATION_HLD,
      'AI_EVALUATION_HLD',
      `🏛️ HLD AI Principal Review: ${problem?.title || 'Distributed System Design'}`
    );

    setIsEvaluating(true);
    setIsAiDrawerOpen(true);
    setAiReport(null);

    const isExcalidraw = studioMode === 'excalidraw';
    const topologySummary = isExcalidraw ? {
      designMode: 'Excalidraw Visual Whiteboard',
      problem: problem?.title || 'Distributed System Design Studio',
      difficulty: problem?.difficulty || 'Hard',
      requirements: problem?.requirements || [],
      expectedScale: problem?.expectedScale || '10M DAU, 100k QPS',
      candidateArchitectureNotes: excalidrawNotes.trim() || 'Candidate designed architecture on Excalidraw whiteboard.'
    } : {
      designMode: 'Interactive Node Canvas',
      problem: problem?.title || 'Distributed System Design Studio',
      difficulty: problem?.difficulty || 'Hard',
      requirements: problem?.requirements || [],
      expectedScale: problem?.expectedScale || '10M DAU, 100k QPS',
      nodes: nodes.map(n => ({ id: n.id, type: n.type, label: n.label, sublabel: n.sublabel, category: n.category })),
      connections: connections.map(c => {
        const from = nodes.find(n => n.id === c.fromNodeId)?.label;
        const to = nodes.find(n => n.id === c.toNodeId)?.label;
        return `${from} -> ${to} [${c.label}] (${c.style})`;
      })
    };

    const prompt = `You are a Principal Cloud Infrastructure Architect and Staff System Design Interviewer at Meta, Google, and Netflix.
Critique and grade the following High-Level System Architecture Diagram created by a senior candidate:

TOPOLOGY UNDER REVIEW:
${JSON.stringify(topologySummary, null, 2)}

Provide an authoritative, highly structured Principal Review with:
1. **Architecture Score & Seniority Assessment**:
   - Provide a score breakdown table with columns: | Category | Score (0-100) | Justification |
   - Final Score out of 100.
   - Seniority level (Junior, Mid, Senior Architect L6, Principal L7+).

2. **Strengths (What was designed well)**:
   - Specific praise for caching layers, separation of concerns, and decoupling.

3. **Critical Gaps & SPOFs (Single Points of Failure)**:
   - Identify missing components (e.g. Rate limiting, DB sharding/replication, Kafka event queue, CDN, Circuit breakers, Observability).

4. **10M DAU Scale & Resilience Hardening**:
   - Step-by-step architectural recommendations to handle 10x traffic bursts.`;

    try {
      const response = await requestMistralChat([{ role: 'user', content: prompt }]);
      setAiReport(response.content || 'No review generated.');
    } catch (e) {
      setAiReport(`### ⚠️ AI Review Offline\n\nCould not connect to the cloud evaluation service. Please check your API key or internet connection.`);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className={`w-full space-y-4 ${isFullscreen ? 'fixed inset-0 z-[9999] bg-slate-950 p-3 sm:p-4 flex flex-col w-screen h-screen overflow-hidden' : ''}`}>
      
      {/* ── Top Header Toolbar ── */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        
        {/* Left: Problem Title & Back Button */}
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Back to Problems Hub"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-[10px] text-amber-400 font-mono tracking-wider px-2 py-0.5 rounded-lg bg-amber-950/80 border border-amber-800/60">
                HLD SYSTEM DESIGN STUDIO
              </span>
              {problem?.difficulty && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-purple-950 text-purple-300 border border-purple-800">
                  {problem.difficulty}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 mt-0.5 truncate max-w-md">
              {problem?.title || 'Interactive Distributed System Architecture Studio'}
            </h3>
          </div>
        </div>

        {/* Studio Mode Switcher: Interactive Studio vs Excalidraw */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setStudioMode('studio')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              studioMode === 'studio' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Architecture Studio</span>
          </button>
          <button
            onClick={() => setStudioMode('excalidraw')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              studioMode === 'excalidraw' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-pink-400" />
            <span>Excalidraw Whiteboard</span>
          </button>
        </div>

        {/* Right Action Tools: Undo/Redo, Snap, Export PNG, Templates, Reveal, Fit, Fullscreen, AI Review */}
        <div className="flex items-center gap-2">
          
          {/* Undo / Redo */}
          {studioMode === 'studio' && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-0.5">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors cursor-pointer"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Snap to Grid Toggle */}
          {studioMode === 'studio' && (
            <button
              onClick={() => setSnapToGrid(s => !s)}
              className={`px-3 py-2 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                snapToGrid
                  ? 'bg-indigo-950 border-indigo-500/60 text-indigo-300 hover:bg-indigo-900'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Snap to 16px Grid"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Snap: {snapToGrid ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* Export PNG */}
          {studioMode === 'studio' && (
            <button
              onClick={handleExportPng}
              className="px-3 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-300 hover:text-sky-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Export Canvas to High-Res PNG"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Export PNG</span>
            </button>
          )}

          {/* Reveal Solution / Reference Architecture Button */}
          {problem && (
            <button
              onClick={() => setIsConfirmRevealOpen(true)}
              className="px-3 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Reveal Reference Architecture Solution"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Reveal Solution</span>
            </button>
          )}

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
          {studioMode === 'studio' && (
            <button
              onClick={handleFitToScreen}
              className="px-3 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Auto-Fit All Components to Screen"
            >
              <Crosshair className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Fit View</span>
            </button>
          )}

          {/* Fullscreen Toggle Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`px-3 py-2 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              isFullscreen 
                ? 'bg-teal-950 border-teal-500/60 text-teal-300 hover:bg-teal-900' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen Canvas"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-teal-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
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

      {/* ── EXCALIDRAW WHITEBOARD MODE ── */}
      {studioMode === 'excalidraw' && (
        <div className={`space-y-3 ${isFullscreenExcalidraw ? 'fixed inset-0 z-[99999] bg-slate-950 p-3 sm:p-5 flex flex-col w-screen h-screen' : ''}`}>
          
          {/* Top Bar inside Fullscreen */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-pink-400" />
                <span>Excalidraw Visual Whiteboard</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                100% Free Drawing
              </span>
            </div>

            <button
              onClick={() => setIsFullscreenExcalidraw(f => !f)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              title={isFullscreenExcalidraw ? "Exit Fullscreen" : "Full Screen Excalidraw Canvas"}
            >
              {isFullscreenExcalidraw ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5 text-purple-400" />}
              <span>{isFullscreenExcalidraw ? "Exit Fullscreen" : "Fullscreen Excalidraw"}</span>
            </button>
          </div>

          <div className={`w-full rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl bg-slate-950 ${isFullscreenExcalidraw ? 'flex-1' : 'h-[740px]'}`}>
            <iframe 
              src="https://excalidraw.com" 
              title="Excalidraw Whiteboard"
              className="w-full h-full border-0"
              allow="clipboard-read; clipboard-write"
            />
          </div>

          {/* Excalidraw AI Review Companion Bar */}
          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Architecture Notes & Rationale for AI Evaluation (₹1.00):</span>
              </label>
              <input
                type="text"
                value={excalidrawNotes}
                onChange={(e) => setExcalidrawNotes(e.target.value)}
                placeholder="e.g. Cloudflare CDN -> ALB -> Go microservices -> Redis cluster -> PostgreSQL (master-replica) + Kafka for async jobs..."
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={handleRunAiEvaluation}
              disabled={isEvaluating}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 flex items-center gap-2 cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Evaluate Excalidraw Design (₹1.00)</span>
            </button>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE STUDIO MODE: Drag-and-Drop Node Canvas ── */}
      {studioMode === 'studio' && (
        <div className={`flex flex-col lg:flex-row gap-4 items-start relative w-full ${isFullscreen ? 'flex-1 min-h-0 h-full' : 'min-h-[720px]'}`}>
          
          {/* ── LEFT: Extensible Component Library Box ── */}
          {isSidebarOpen && (
            <div className={`w-full lg:w-72 glass-panel p-4 rounded-3xl border border-slate-800/80 bg-slate-950/95 flex flex-col space-y-4 overflow-y-auto custom-scrollbar flex-shrink-0 animate-fadeIn ${isFullscreen ? 'h-full max-h-none' : 'max-h-[780px]'}`}>
              
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
                  <span>Interactive Instructions</span>
                </p>
                <p className="text-slate-400">1. Click any component above to drop it.</p>
                <p className="text-slate-400">2. Drag node connector dots to draw arrows.</p>
                <p className="text-slate-400">3. Click <strong>AI Review</strong> to grade your topology.</p>
              </div>
            </div>
          )}

          {/* ── CENTER / RIGHT: Interactive High-Level Design Canvas ── */}
          <div 
            ref={canvasRef}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onContextMenu={(e) => {
              // Right-click on empty canvas closes node context menu
              e.preventDefault();
              setContextMenu(null);
            }}
            onMouseDown={(e) => {
              // Drag on background starts canvas panning
              setIsPanning(true);
              setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
              setSelectedNodeId(null);
              setSelectedConnId(null);
              setContextMenu(null);
            }}
            className={`flex-1 glass-panel rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden relative shadow-2xl w-full ${isFullscreen ? 'h-full min-h-0' : 'min-h-[720px]'}`}
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

            {/* ── Floating Canvas Viewport & Tooling Controls (Bottom Center) ── */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-800/90 p-2 rounded-2xl shadow-2xl backdrop-blur-md">
              {/* Connector Protocol Preset & Options */}
              <div className="flex items-center space-x-1.5 pr-2 border-r border-slate-800">
                <select
                  onChange={(e) => {
                    const preset = CONNECTION_PRESETS.find(p => p.label === e.target.value);
                    if (preset) {
                      setConnLabelInput(preset.label);
                      setConnStyleInput(preset.style);
                      setConnColorInput(preset.color);
                    }
                  }}
                  value={connLabelInput}
                  className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  title="Select Protocol Preset"
                >
                  {CONNECTION_PRESETS.map((p) => (
                    <option key={p.label} value={p.label}>
                      {p.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={connLabelInput}
                  onChange={(e) => setConnLabelInput(e.target.value)}
                  placeholder="Protocol / Label"
                  className="w-24 px-2 py-1 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <div
                  className="w-3.5 h-3.5 rounded-full border border-slate-700 flex-shrink-0"
                  style={{ backgroundColor: connColorInput }}
                  title={`Connection Color: ${connColorInput}`}
                />

                <button
                  onClick={() => setConnStyleInput(s => s === 'solid' ? 'dashed' : 'solid')}
                  className="px-2 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white cursor-pointer"
                  title="Toggle Solid vs Dashed Connection Line"
                >
                  {connStyleInput === 'solid' ? '— Solid' : '- - Dashed'}
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 pr-2 border-r border-slate-800">
                <button
                  onClick={() => setZoom(z => Math.max(0.35, z - 0.15))}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-indigo-400 font-bold px-1 min-w-[44px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleFitToScreen}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-emerald-400 cursor-pointer"
                  title="Auto Fit to Screen"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
              </div>

              {/* Actions: Delete & Clear */}
              {(selectedNodeId || selectedConnId) && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  title="Delete Selected Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}

              <button
                onClick={handleClearCanvas}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                title="Clear Canvas"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* ── Scaled & Panned SVG / Nodes Layer ── */}
            <div 
              className="absolute inset-0 origin-top-left pointer-events-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
              }}
            >
              {/* SVG Connecting Lines Layer */}
              <svg className="absolute inset-0 overflow-visible w-full h-full pointer-events-none">
                <defs>
                  <marker id="arrow-solid" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#818cf8" />
                  </marker>
                  <marker id="arrow-selected" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
                  </marker>
                </defs>

                {/* Render Permanent Connections */}
                {connections.map((conn) => {
                  const fromNode = nodes.find(n => n.id === conn.fromNodeId);
                  const toNode = nodes.find(n => n.id === conn.toNodeId);
                  if (!fromNode || !toNode) return null;

                  const p1 = getPortPos(fromNode, conn.fromPort);
                  const p2 = getPortPos(toNode, conn.toPort);
                  const isSelected = selectedConnId === conn.id;

                  // Curved Cubic Bézier path calculation
                  const dx = p2.x - p1.x;
                  const dy = p2.y - p1.y;
                  const cx1 = p1.x + (conn.fromPort === 'right' ? Math.max(40, dx / 2) : conn.fromPort === 'left' ? -Math.max(40, -dx / 2) : 0);
                  const cy1 = p1.y + (conn.fromPort === 'bottom' ? Math.max(40, dy / 2) : conn.fromPort === 'top' ? -Math.max(40, -dy / 2) : 0);
                  const cx2 = p2.x + (conn.toPort === 'left' ? -Math.max(40, -dx / 2) : conn.toPort === 'right' ? Math.max(40, dx / 2) : 0);
                  const cy2 = p2.y + (conn.toPort === 'top' ? -Math.max(40, -dy / 2) : conn.toPort === 'bottom' ? Math.max(40, dy / 2) : 0);

                  const pathD = `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`;
                  const midX = (p1.x + p2.x) / 2;
                  const midY = (p1.y + p2.y) / 2;

                  return (
                    <g key={conn.id} className="pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedConnId(conn.id); setSelectedNodeId(null); }}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={14}
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isSelected ? '#f43f5e' : (conn.color || '#818cf8')}
                        strokeWidth={isSelected ? 3 : 2}
                        strokeDasharray={conn.style === 'dashed' ? '5,5' : 'none'}
                        markerEnd={isSelected ? 'url(#arrow-selected)' : 'url(#arrow-solid)'}
                      />
                      {conn.label && (
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x={-conn.label.length * 3.5 - 6}
                            y={-10}
                            width={conn.label.length * 7 + 12}
                            height={18}
                            rx={6}
                            fill="#020617"
                            stroke={isSelected ? '#f43f5e' : '#334155'}
                            strokeWidth={1}
                          />
                          <text
                            x={0}
                            y={3}
                            textAnchor="middle"
                            fill={isSelected ? '#f43f5e' : '#cbd5e1'}
                            fontSize={9}
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {conn.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Render In-Progress Connection Line */}
                {connectingStart && (() => {
                  const fromNode = nodes.find(n => n.id === connectingStart.nodeId);
                  if (!fromNode) return null;
                  const p1 = getPortPos(fromNode, connectingStart.port);
                  return (
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={mouseCanvasPos.x}
                      y2={mouseCanvasPos.y}
                      stroke="#fbbf24"
                      strokeWidth={2}
                      strokeDasharray="4,4"
                    />
                  );
                })()}
              </svg>

              {/* Render Architectural Nodes */}
              {nodes.map((node) => {
                const IconCmp = ICON_MAP[node.iconKey] || Box;
                const isSelected = selectedNodeId === node.id;

                return (
                  <div
                    key={node.id}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    onContextMenu={(e) => handleNodeContextMenu(e, node)}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      width: `${node.width}px`,
                      height: `${node.height}px`,
                      boxShadow: isSelected ? `0 0 25px ${node.glowColor}, 0 0 0 2px #6366f1` : `0 4px 15px rgba(0,0,0,0.5)`,
                    }}
                    className={`absolute rounded-2xl p-2.5 transition-shadow select-none pointer-events-auto cursor-move flex flex-col justify-between border ${
                      isSelected ? 'border-indigo-400 bg-slate-900/95' : `${node.borderColor} ${node.bgColor} hover:border-indigo-400/80`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`p-1.5 rounded-xl bg-slate-950 border border-slate-800 ${node.color} flex-shrink-0`}>
                          <IconCmp className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-100 truncate">{node.label}</p>
                          {node.sublabel && (
                            <p className="text-[9px] text-slate-400 truncate font-mono">{node.sublabel}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingNode(node); }}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                        title="Edit Node Properties"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Node Ports (Top, Right, Bottom, Left) */}
                    {(['top', 'right', 'bottom', 'left'] as const).map((port) => {
                      const posClass =
                        port === 'top' ? 'top-[-5px] left-1/2 -translate-x-1/2' :
                        port === 'bottom' ? 'bottom-[-5px] left-1/2 -translate-x-1/2' :
                        port === 'left' ? 'left-[-5px] top-1/2 -translate-y-1/2' :
                        'right-[-5px] top-1/2 -translate-y-1/2';

                      return (
                        <div
                          key={port}
                          onMouseDown={(e) => handlePortMouseDown(e, node.id, port)}
                          title={`Connect from ${port}`}
                          className={`absolute w-3 h-3 rounded-full bg-slate-950 border-2 border-indigo-400 hover:bg-indigo-400 hover:scale-125 transition-all cursor-crosshair ${posClass}`}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* ── Reveal Solution Confirmation Modal ── */}
      {isConfirmRevealOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-300 mx-auto">
              <Eye className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-100">Reveal Official Architecture Solution?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Loading the reference solution will replace the current canvas with the official high-availability topology. Try designing it first!
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-3">
              <button
                onClick={() => setIsConfirmRevealOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Keep Designing
              </button>
              <button
                onClick={handleRevealReferenceSolution}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Reveal Solution Topology
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Node Properties Modal ── */}
      {editingNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                <span>Edit Component Properties</span>
              </h4>
              <button onClick={() => setEditingNode(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-400">Component Title</label>
                <input
                  type="text"
                  value={editingNode.label}
                  onChange={(e) => setEditingNode({ ...editingNode, label: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400">Subtitle / Specification</label>
                <input
                  type="text"
                  value={editingNode.sublabel || ''}
                  onChange={(e) => setEditingNode({ ...editingNode, sublabel: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingNode(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const nextNodes = nodes.map(n => n.id === editingNode.id ? editingNode : n);
                  setNodes(nextNodes);
                  pushHistorySnapshot(nextNodes, connections);
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

      {/* ── Node Right-Click Context Menu ── */}
      {contextMenu && (() => {
        const targetNode = nodes.find(n => n.id === contextMenu.nodeId);
        if (!targetNode) return null;
        return (
          <div
            className="fixed z-[99999] w-52 bg-slate-900/98 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl p-1.5 space-y-1 animate-scaleUp text-xs select-none"
            style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-2.5 py-1.5 border-b border-slate-800">
              <p className="font-bold text-slate-200 truncate">{targetNode.label}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{targetNode.sublabel || targetNode.type}</p>
            </div>

            {/* Actions */}
            <button
              onClick={() => {
                handleDuplicateNode(targetNode.id);
                setContextMenu(null);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-200 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-2">
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Duplicate</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Ctrl+D</span>
            </button>

            <button
              onClick={() => {
                setEditingNode(targetNode);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-200 cursor-pointer transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Edit Properties</span>
            </button>

            {/* Recolor Options */}
            <div className="px-2.5 py-1.5 border-t border-slate-800 space-y-1.5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Change Color</p>
              <div className="flex items-center gap-1.5">
                {COLOR_THEMES.map((th) => (
                  <button
                    key={th.name}
                    onClick={() => {
                      handleRecolorNode(targetNode.id, th);
                      setContextMenu(null);
                    }}
                    title={th.name}
                    className={`w-5 h-5 rounded-full border border-slate-700 cursor-pointer transition-transform hover:scale-125 ${
                      th.name === 'Sky' ? 'bg-sky-500' :
                      th.name === 'Emerald' ? 'bg-emerald-500' :
                      th.name === 'Amber' ? 'bg-amber-500' :
                      th.name === 'Purple' ? 'bg-purple-500' :
                      th.name === 'Rose' ? 'bg-rose-500' :
                      'bg-orange-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Delete */}
            <div className="border-t border-slate-800 pt-1">
              <button
                onClick={() => {
                  handleDeleteSelected();
                  setContextMenu(null);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-rose-950 text-rose-300 cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete</span>
                </span>
                <span className="text-[10px] font-mono text-rose-400/60">Del</span>
              </button>
            </div>
          </div>
        );
      })()}

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
              <MarkdownRenderer 
                content={aiReport} 
                className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-900/50 shadow-xl" 
              />
            ) : null}
          </div>
        </div>
      )}

      {/* Insufficient Credits Gatekeeper Modal */}
      <InsufficientCreditsModal
        isOpen={isInsufficientCreditsOpen}
        onClose={() => setIsInsufficientCreditsOpen(false)}
        onOpenRecharge={() => {
          setIsInsufficientCreditsOpen(false);
          setIsWalletTopupOpen(true);
        }}
        requiredCost={insufficientMeta.cost}
        actionName={insufficientMeta.action}
      />

      {/* Wallet Top-up Modal */}
      <WalletTopupModal
        isOpen={isWalletTopupOpen}
        onClose={() => setIsWalletTopupOpen(false)}
        initialAmount={Math.max(50, Math.ceil(insufficientMeta.cost * 10))}
      />

    </div>
  );
};
