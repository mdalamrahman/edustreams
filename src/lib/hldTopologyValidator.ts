/**
 * Semantic Topology Validator for HLD Architecture Canvas
 * Builds graph models, executes Tarjan's algorithm for Single Point of Failure (SPOF)
 * articulation points, checks synchronous cyclic dependencies, and verifies FAANG architectural rules.
 */

export interface CanvasNode {
  id: string;
  type: 'CLIENT' | 'LOAD_BALANCER' | 'API_GATEWAY' | 'SERVICE' | 'CACHE' | 'DB' | 'QUEUE';
  label: string;
}

export interface CanvasEdge {
  from: string;
  to: string;
  protocol?: 'HTTP' | 'gRPC' | 'TCP' | 'KAFKA' | 'WEBSOCKET';
  isAsync?: boolean;
}

export interface HLDTopologyReport {
  spofs: string[]; // Node IDs that form single points of failure
  cycles: string[][]; // Circular dependency paths
  architecturalFlaws: string[];
  recommendations: string[];
  isValidTier1Design: boolean;
  scoreAdjustment: number; // e.g. -15 for direct client-to-DB
  formattedEvaluationContext: string;
}

export function validateHLDTopology(
  nodes: CanvasNode[],
  edges: CanvasEdge[]
): HLDTopologyReport {
  const spofs: string[] = [];
  const cycles: string[][] = [];
  const architecturalFlaws: string[] = [];
  const recommendations: string[] = [];
  let scoreAdjustment = 0;

  if (!nodes || nodes.length === 0) {
    return {
      spofs: [],
      cycles: [],
      architecturalFlaws: ['No architecture components created on canvas.'],
      recommendations: ['Add Client, Load Balancer, Service, Cache, and Database nodes.'],
      isValidTier1Design: false,
      scoreAdjustment: -30,
      formattedEvaluationContext: '[HLD TOPOLOGY AUDIT]: Empty architecture canvas.'
    };
  }

  // 1. Build Adjacency List (Directed & Undirected)
  const adjDirected = new Map<string, string[]>();
  const adjUndirected = new Map<string, string[]>();
  const nodeMap = new Map<string, CanvasNode>();

  nodes.forEach(n => {
    nodeMap.set(n.id, n);
    adjDirected.set(n.id, []);
    adjUndirected.set(n.id, []);
  });

  edges.forEach(e => {
    if (adjDirected.has(e.from) && adjDirected.has(e.to)) {
      adjDirected.get(e.from)!.push(e.to);
      adjUndirected.get(e.from)!.push(e.to);
      adjUndirected.get(e.to)!.push(e.from);
    }
  });

  // 2. Tarjan's Articulation Points Algorithm for SPOF Identification
  let timer = 0;
  const tin = new Map<string, number>();
  const low = new Map<string, number>();
  const visited = new Set<string>();
  const isArticulation = new Set<string>();

  function dfsTarjan(u: string, p: string = '') {
    visited.add(u);
    tin.set(u, ++timer);
    low.set(u, tin.get(u)!);
    let children = 0;

    const neighbors = adjUndirected.get(u) || [];
    for (const v of neighbors) {
      if (v === p) continue;
      if (visited.has(v)) {
        low.set(u, Math.min(low.get(u)!, tin.get(v)!));
      } else {
        dfsTarjan(v, u);
        low.set(u, Math.min(low.get(u)!, low.get(v)!));
        if (low.get(v)! >= tin.get(u)! && p !== '') {
          isArticulation.add(u);
        }
        children++;
      }
    }
    if (p === '' && children > 1) {
      isArticulation.add(u);
    }
  }

  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      dfsTarjan(n.id);
    }
  });

  isArticulation.forEach(id => {
    const node = nodeMap.get(id);
    // Don't flag Client as internal SPOF
    if (node && node.type !== 'CLIENT') {
      spofs.push(`${node.label} (${node.type})`);
    }
  });

  // 3. Cycle Detection in Synchronous Calls (DFS with recursion stack)
  const cycleVisited = new Set<string>();
  const recStack = new Set<string>();
  const currentPath: string[] = [];

  function dfsCycle(u: string) {
    cycleVisited.add(u);
    recStack.add(u);
    currentPath.push(u);

    const neighbors = adjDirected.get(u) || [];
    for (const v of neighbors) {
      if (!cycleVisited.has(v)) {
        dfsCycle(v);
      } else if (recStack.has(v)) {
        const cycleStartIndex = currentPath.indexOf(v);
        if (cycleStartIndex !== -1) {
          const cycleNodes = currentPath.slice(cycleStartIndex).map(id => nodeMap.get(id)?.label || id);
          cycles.push([...cycleNodes, nodeMap.get(v)?.label || v]);
        }
      }
    }

    recStack.delete(u);
    currentPath.pop();
  }

  nodes.forEach(n => {
    if (!cycleVisited.has(n.id)) {
      dfsCycle(n.id);
    }
  });

  // 4. FAANG Architectural Rule Checks
  // Rule A: Direct Client-to-DB Connection (Severe Anti-Pattern)
  edges.forEach(e => {
    const fromNode = nodeMap.get(e.from);
    const toNode = nodeMap.get(e.to);
    if (fromNode?.type === 'CLIENT' && toNode?.type === 'DB') {
      architecturalFlaws.push(`Critical Anti-Pattern: Direct Client (${fromNode.label}) connection to Database (${toNode.label}) without an intermediary API Gateway or Service.`);
      scoreAdjustment -= 20;
    }
  });

  // Rule B: Synchronous circular microservice dependencies
  if (cycles.length > 0) {
    cycles.forEach(c => {
      architecturalFlaws.push(`Synchronous Cyclic Dependency: ${c.join(' -> ')} can trigger cascading distributed deadlocks.`);
    });
    scoreAdjustment -= 15;
    recommendations.push('Decouple cyclic service interactions using an asynchronous message queue (e.g. Kafka or RabbitMQ) or event bus.');
  }

  // Rule C: Single Database without replication / cache
  const dbNodes = nodes.filter(n => n.type === 'DB');
  const cacheNodes = nodes.filter(n => n.type === 'CACHE');
  const queueNodes = nodes.filter(n => n.type === 'QUEUE');

  if (dbNodes.length === 1 && cacheNodes.length === 0) {
    architecturalFlaws.push('Single Database Node with no caching layer (Redis/Memcached) leaves primary database vulnerable to thundering herd query load.');
    scoreAdjustment -= 10;
    recommendations.push('Introduce a distributed caching layer (Redis) in front of the database for high read throughput.');
  }

  // Rule D: High-throughput write path without buffering queue
  if (queueNodes.length === 0 && nodes.some(n => n.type === 'SERVICE')) {
    recommendations.push('Consider adding an asynchronous queue (Kafka) for peak burst smoothing and decoupled event processing.');
  }

  // Rule E: Articulation Points / SPOFs detected
  if (spofs.length > 0) {
    recommendations.push(`Redundancy needed: ${spofs.join(', ')} act as single points of failure. Add multi-region replicas or multi-master failover.`);
  }

  const isValidTier1Design = architecturalFlaws.length === 0 && spofs.length <= 1;

  const formattedEvaluationContext = `[HLD TOPOLOGY & ARCHITECTURE VALIDATION REPORT]:
- Tier-1 Valid Design: ${isValidTier1Design ? 'YES' : 'NO (Violations present)'}
- Single Points of Failure (Tarjan Articulation Points): ${spofs.length > 0 ? spofs.join(', ') : 'None detected (Properly redundanted)'}
- Synchronous Cycles / Deadlocks: ${cycles.length > 0 ? cycles.map(c => c.join(' -> ')).join('; ') : 'None detected'}
- Architectural Flaws:
${architecturalFlaws.length > 0 ? architecturalFlaws.map(f => `  * ${f}`).join('\n') : '  * None. Compliant with standard microservice boundaries.'}
- Architectural Recommendations:
${recommendations.map(r => `  * ${r}`).join('\n')}
- Topology Score Adjustment: ${scoreAdjustment} pts`;

  return {
    spofs,
    cycles,
    architecturalFlaws,
    recommendations,
    isValidTier1Design,
    scoreAdjustment,
    formattedEvaluationContext
  };
}
