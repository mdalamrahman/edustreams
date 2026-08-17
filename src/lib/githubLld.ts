/**
 * GitHub REST API Client for fetching curated open-source LLD and System Design markdown materials
 */

export interface GitHubRepoItem {
  name: string;
  path: string;
  download_url: string;
  html_url: string;
  type: 'file' | 'dir';
}

export interface CuratedLLDTopic {
  id: string;
  title: string;
  category: string;
  repo: string;
  path: string;
  description: string;
  fallbackSummary: string;
}

export const CURATED_LLD_TOPICS: CuratedLLDTopic[] = [
  {
    id: 'design-patterns-summary',
    title: 'Design Patterns for Humans (GoF Patterns)',
    category: 'Design Patterns',
    repo: 'kamranahmedse/design-patterns-for-humans',
    path: 'README.md',
    description: 'Ultra-clear, practical explanation of Creational, Structural, and Behavioral patterns.',
    fallbackSummary: `# Design Patterns for Humans

> An ultra-simplified, real-world explanation of Gang of Four (GoF) Design Patterns.

## 1. Creational Design Patterns
These patterns are all about class instantiation or object creation.

- **Simple Factory**: Generates an instance for client without exposing instantiation logic.
- **Factory Method**: Delegates the creation logic to child subclasses.
- **Abstract Factory**: A factory of factories; groups individual factories with a common theme.
- **Builder**: Construct complex objects step-by-step to prevent constructor pollution.
- **Singleton**: Ensures a class has only one instance and provides a global access point.

---

## 2. Structural Design Patterns
These patterns are focused on object composition and simplifying relationships between entities.

- **Adapter**: Converts the interface of a class into another interface clients expect.
- **Bridge**: Decouples an abstraction from its implementation so both can vary independently.
- **Composite**: Composes objects into tree structures to represent part-whole hierarchies.
- **Decorator**: Dynamically adds behaviors to an individual object without affecting others.
- **Facade**: Provides a simplified interface to a complex subsystem.
- **Proxy**: Provides a placeholder or surrogate for another object to control access to it.

---

## 3. Behavioral Design Patterns
These patterns are concerned with algorithms and assignment of responsibilities between objects.

- **Chain of Responsibility**: Passes requests along a chain of handlers.
- **Command**: Encapsulates a request as an object, enabling parameterization and undo operations.
- **Iterator**: Accesses elements of an aggregate object sequentially without exposing underlying representation.
- **Observer**: Defines a 1-to-many dependency so when one object changes state, all dependents are notified.
- **Strategy**: Enables selecting an algorithm's behavior at runtime.
- **State**: Allows an object to alter its behavior when its internal state changes.`
  },
  {
    id: 'system-design-primer-scalability',
    title: 'System Design Primer — Scalability & Architecture',
    category: 'System Design',
    repo: 'donnemartin/system-design-primer',
    path: 'README.md',
    description: 'Industry-standard open-source primer on distributed systems, caching, replication, and load balancing.',
    fallbackSummary: `# System Design Primer — Scalability & Distributed Systems

> Comprehensive guide on architecting large-scale, high-throughput, fault-tolerant systems.

## Key Architectural Principles

### 1. Performance vs Scalability
- **Performance**: A system is performant if it is fast for a single user.
- **Scalability**: A system is scalable if it remains fast as the number of users/requests increases.

### 2. Latency vs Throughput
- **Latency**: The time taken to deliver a unit of data (measured in ms).
- **Throughput**: The amount of data delivered per unit time (requests/sec or MB/s).

### 3. Availability vs Consistency (CAP Theorem)
In a distributed computer system, you can only support two of the following guarantees:
- **Consistency**: Every read receives the most recent write or an error.
- **Availability**: Every request receives a non-error response without guarantee of latest write.
- **Partition Tolerance**: System continues operating despite dropped messages by the network.

---

## Core Distributed Building Blocks

- **DNS & CDN**: Route users to geographically nearest edge servers.
- **Load Balancers**: Distribute incoming traffic across server clusters (L4 vs L7).
- **Reverse Proxy**: Microservice routing, SSL termination, rate limiting, and compression.
- **Distributed Caching**: Redis / Memcached for sub-millisecond key-value retrieval.
- **Asynchronous Message Queues**: Kafka / RabbitMQ to decouple producers from consumers.`
  },
  {
    id: 'awesome-lld-parking-lot',
    title: 'Low-Level Design Patterns & SOLID Principles',
    category: 'Low Level Design',
    repo: 'ashishps1/awesome-low-level-design',
    path: 'README.md',
    description: 'Comprehensive object-oriented low level design interview solutions, concurrency, and patterns.',
    fallbackSummary: `# Low-Level Design (LLD) & Object-Oriented Principles

> Master Object-Oriented Analysis and Design (OOAD) for senior engineering interviews.

## SOLID Principles in Practice

1. **S — Single Responsibility Principle (SRP)**: A class should have one, and only one, reason to change.
2. **O — Open/Closed Principle (OCP)**: Software entities should be open for extension, but closed for modification.
3. **L — Liskov Substitution Principle (LSP)**: Subtypes must be substitutable for their base types without altering correctness.
4. **I — Interface Segregation Principle (ISP)**: Clients should not be forced to depend upon interfaces they do not use.
5. **D — Dependency Inversion Principle (DIP)**: High-level modules should not depend on low-level modules; both should depend on abstractions.

---

## Standard LLD Interview Execution Framework

1. **Clarify Requirements**: Functional requirements, capacity bounds, and concurrency expectations.
2. **Identify Core Entities**: Nouns and Actors in the problem domain (e.g., Vehicle, ParkingSpot, Ticket).
3. **Establish Relationships**: Inheritance (is-a), Composition (has-a), Aggregation (uses-a).
4. **Select Design Patterns**: Factory for creation, Strategy for algorithms, State for lifecycle.
5. **Implement Thread-Safety**: Synchronized blocks, Atomic variables, Concurrent collections, and Mutex locks.`
  },
  {
    id: 'system-design-interview-framework',
    title: 'System Design Interview Cheatsheet & Framework',
    category: 'System Design',
    repo: 'madd86/awesome-system-design',
    path: 'README.md',
    description: 'A curated list of System Design and Software Architecture resources for SDE 2 & 3 interviews.',
    fallbackSummary: `# System Design Interview Framework (45-Minute Playbook)

## Step 1: Scope the Problem (5 Mins)
- Clarify Functional Requirements: Key user flows and API capabilities.
- Clarify Non-Functional Requirements: High availability (99.99%), latency bounds (<50ms), consistency model.
- Back-of-the-envelope estimation: DAU, Read/Write QPS, Storage per year, Bandwidth.

## Step 2: High-Level Architecture (10 Mins)
- Define API contracts (REST / gRPC).
- Sketch core components: Client -> CDN / Load Balancer -> API Gateway -> Microservices -> Primary DB / Cache.

## Step 3: Database & Data Modeling (10 Mins)
- Schema design (SQL vs NoSQL vs Graph DB).
- Sharding strategy (Hash-based, Range-based, Consistent Hashing).

## Step 4: Deep Dive & Bottlenecks (15 Mins)
- Concurrency & Race conditions (Distributed Locks, Optimistic Locking).
- Caching policies (Write-through, Write-back, Cache-aside).
- Message Brokers (Kafka partitioned queues, Idempotency keys).

## Step 5: Wrap Up & Telemetry (5 Mins)
- Health checks, Distributed tracing, Metrics (Prometheus/Grafana), Alerting.`
  },
  {
    id: 'gof-oop-principles',
    title: 'Clean Code & Architectural Design',
    category: 'Architecture',
    repo: 'ryanmcdermott/clean-code-javascript',
    path: 'README.md',
    description: 'Clean code and SOLID design principles translated for modern object-oriented software engineering.',
    fallbackSummary: `# Clean Code & Architectural Excellence

## Functions & Methods
- **Small and Focused**: A function should do one thing and do it exceptionally well.
- **Monadic / Dyadic Arguments**: Strive for 1-2 function arguments. Use parameter objects for 3+ parameters.
- **No Side Effects**: Avoid unexpected mutations of external state.

## Naming Conventions
- Use intention-revealing, pronounceable, and searchable names.
- Avoid abbreviations and mental mapping.

## Error Handling
- Use Exceptions rather than Return Codes.
- Write Try-Catch-Finally statements as first-class transactions.
- Never pass or return null pointers; use Optional or Null Object Pattern.`
  }
];

/**
 * Sanitizes markdown content: cleans broken relative image tags, HTML tags, and raw translation tables.
 */
export function sanitizeGitHubMarkdown(raw: string, repo: string = ''): string {
  if (!raw) return '';
  let cleaned = raw;

  // 1. Remove translation table headers & badge artifacts
  cleaned = cleaned.replace(/\*\[English\]\(README\.md\)[^\n]*\*/gi, '');
  cleaned = cleaned.replace(/\*\*Help \[translate\][^\n]*\*\*/gi, '');
  cleaned = cleaned.replace(/\[!\[Build Status\][^\n]*\n?/gi, '');
  cleaned = cleaned.replace(/\[!\[License\][^\n]*\n?/gi, '');

  // 2. Clean raw HTML tags
  cleaned = cleaned.replace(/<p[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/p>/gi, '\n');
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
  cleaned = cleaned.replace(/<div[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/div>/gi, '\n');

  // 3. Fix relative image paths to GitHub raw content URL
  cleaned = cleaned.replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g, (match, alt, src) => {
    const cleanSrc = src.replace(/^\.\//, '');
    return `![${alt}](https://raw.githubusercontent.com/${repo}/master/${cleanSrc})`;
  });

  cleaned = cleaned.replace(/<img[^>]+src=["'](?!https?:\/\/)([^"']+)["'][^>]*\/?>/gi, (match, src) => {
    const cleanSrc = src.replace(/^\.\//, '');
    return `![Diagram](https://raw.githubusercontent.com/${repo}/master/${cleanSrc})`;
  });

  return cleaned.trim();
}

/**
 * Fetches raw markdown content from a GitHub repository via raw.githubusercontent.com or GitHub REST API.
 */
export async function fetchGitHubMarkdown(repo: string, path: string): Promise<{ content: string | null; error: string | null }> {
  try {
    // 1. Try fast raw CDN first
    const rawUrl = `https://raw.githubusercontent.com/${repo}/master/${path}`;
    let res = await fetch(rawUrl);

    if (!res.ok) {
      const rawMainUrl = `https://raw.githubusercontent.com/${repo}/main/${path}`;
      res = await fetch(rawMainUrl);
    }

    if (res.ok) {
      const text = await res.text();
      return { content: sanitizeGitHubMarkdown(text, repo), error: null };
    }

    // 2. Fallback to GitHub REST API
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
    const apiRes = await fetch(apiUrl, {
      headers: { 'Accept': 'application/vnd.github.v3.raw' }
    });

    if (apiRes.ok) {
      const text = await apiRes.text();
      return { content: sanitizeGitHubMarkdown(text, repo), error: null };
    }

    // 3. Fallback to curated local summary
    const matching = CURATED_LLD_TOPICS.find(t => t.repo === repo);
    if (matching?.fallbackSummary) {
      return { content: matching.fallbackSummary, error: null };
    }

    return { content: null, error: `Unable to load remote repository.` };
  } catch {
    const matching = CURATED_LLD_TOPICS.find(t => t.repo === repo);
    if (matching?.fallbackSummary) {
      return { content: matching.fallbackSummary, error: null };
    }
    return { content: null, error: 'Network error loading resource.' };
  }
}
