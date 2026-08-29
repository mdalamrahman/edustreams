import { MISTRAL_API_KEY } from './mistral';

/**
 * SDE Interview Question Bank & Dynamic Question Generation Engine
 * Supports multiple test styles, candidate background personalization, and company-specific criteria.
 */

export type SdeLevel = 'SDE-1' | 'SDE-2' | 'SDE-3';
export type InterviewRound = 'DSA' | 'LLD' | 'HLD' | 'Behavioral';

export type TestStyle = 
  | 'faang_bar_raiser'     // FAANG Bar Raiser: Rigorous Big-O, edge case stress-testing, invariants
  | 'high_growth_startup'  // High-Growth Startup: Pragmatic speed, clean modular architecture, rapid prototype trade-offs
  | 'fintech_low_latency'  // FinTech / Low-Latency: Concurrency, memory cache locality, zero-copy, atomic operations
  | 'system_architect';    // Large-Scale Architect: Global multi-region, CAP theorem, failure cascades, SPOFs

export interface TestStyleInfo {
  id: TestStyle;
  name: string;
  badge: string;
  description: string;
  accentColor: string;
}

export const SUPPORTED_TEST_STYLES: TestStyleInfo[] = [
  {
    id: 'faang_bar_raiser',
    name: 'FAANG Bar Raiser',
    badge: 'Algorithmic Depth',
    description: 'Deep mathematical proofs, strict edge case stress-testing & optimal Big-O complexity.',
    accentColor: 'indigo'
  },
  {
    id: 'high_growth_startup',
    name: 'High-Growth Startup',
    badge: 'Pragmatic Speed',
    description: 'Rapid MVP delivery, practical database design, clean API ergonomics & modularity.',
    accentColor: 'emerald'
  },
  {
    id: 'fintech_low_latency',
    name: 'FinTech / High-Frequency',
    badge: 'Concurrency & Performance',
    description: 'Thread safety, lock-free structures, memory alignment, zero-copy & cache locality.',
    accentColor: 'amber'
  },
  {
    id: 'system_architect',
    name: 'Principal Systems Architect',
    badge: 'Global Scale',
    description: 'Geo-distributed consensus, fault-tolerance, CAP tradeoffs, disaster recovery & SPOFs.',
    accentColor: 'purple'
  }
];

export interface CompanyInfo {
  id: string;
  name: string;
  tagline: string;
  logoColor: string;
  focusAreas: Record<InterviewRound, string[]>;
}

export interface CuratedInterviewQuestion {
  id: string;
  title: string;
  company: string;
  level: SdeLevel;
  round: InterviewRound;
  testStyle?: TestStyle;
  description: string;
  constraints?: string[];
  sampleInputOutput?: string;
  keyEvaluationCriteria: string[];
  starterCode?: Record<string, string>;
  architecturalHints?: string[];
}

export const SUPPORTED_COMPANIES: CompanyInfo[] = [
  {
    id: 'google',
    name: 'Google',
    tagline: 'Algorithmic rigor, clean code, scalable architecture & Googliness',
    logoColor: 'from-blue-500 via-red-500 to-amber-400',
    focusAreas: {
      DSA: ['Advanced Dynamic Programming', 'Graph Algorithms (Dijkstra, Tarjan)', 'Segment Trees', 'Trie & Prefix Systems'],
      LLD: ['Design Patterns', 'SOLID Principles', 'Thread-Safe Data Structures', 'Generic API Design'],
      HLD: ['Global Load Balancing (Maglev)', 'Distributed Storage (Spanner/Bigtable)', 'MapReduce & Streaming', 'Geo-Distributed Consistency'],
      Behavioral: ['Googliness', 'Navigating Ambiguity', 'Data-Driven Decision Making', 'Disagree & Commit']
    }
  },
  {
    id: 'amazon',
    name: 'Amazon',
    tagline: '16 Leadership Principles, Bar Raiser rigor & High-Scale Microservices',
    logoColor: 'from-amber-500 via-orange-500 to-yellow-400',
    focusAreas: {
      DSA: ['Trees & BST', 'Priority Queue / Heaps', 'Breadth-First & Depth-First Search', 'Two Pointers / Sliding Window'],
      LLD: ['Machine Coding (Locker, Parking Lot, Vending Machine)', 'Clean Modular Interfaces', 'Concurrency & Locking'],
      HLD: ['Event-Driven Architecture', 'DynamoDB & S3 Patterns', 'High Availability (99.999%)', 'SPOF & Blast Radius Mitigation'],
      Behavioral: ['Customer Obsession', 'Ownership', 'Bias for Action', 'Dive Deep & Deliver Results']
    }
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    tagline: 'Enterprise engineering, maintainability, clean design & collaboration',
    logoColor: 'from-blue-600 via-teal-500 to-emerald-400',
    focusAreas: {
      DSA: ['Linked Lists & Arrays', 'Binary Trees & Graph Traversals', 'String Manipulation', 'Matrix DP'],
      LLD: ['Object-Oriented Design', 'Extensible Domain Models', 'Factory & Observer Patterns', 'Dependency Injection'],
      HLD: ['Multi-Tenant SaaS Architecture', 'Azure Cosmos DB & Event Hubs', 'API Gateway & Rate Limiting', 'Caching Tiers (Redis)'],
      Behavioral: ['Growth Mindset', 'Cross-Team Collaboration', 'Empathy & Inclusivity', 'Handling Technical Debt']
    }
  },
  {
    id: 'meta',
    name: 'Meta',
    tagline: 'High-scale graph processing, fast iteration & massive user fanout',
    logoColor: 'from-blue-600 via-indigo-600 to-purple-600',
    focusAreas: {
      DSA: ['Graph Bipartite & Topological Sort', 'Binary Search Variants', 'Recursion & Backtracking', 'Sliding Window Strings'],
      LLD: ['Feed Generation Engine', 'Real-Time Messaging Protocol', 'Rate Limiting & Token Bucket', 'Event Bus Architecture'],
      HLD: ['Social Graph Storage (TAO)', 'News Feed Hybrid Fanout', 'Live Video Streaming CDN', 'Cassandra/RocksDB Sharding'],
      Behavioral: ['Be Bold', 'Focus on Impact', 'Move Fast', 'Be Open']
    }
  },
  {
    id: 'uber',
    name: 'Uber',
    tagline: 'Real-time geospatial dispatch, dynamic pricing & distributed routing',
    logoColor: 'from-slate-700 via-zinc-800 to-black',
    focusAreas: {
      DSA: ['Geospatial Quadtrees / H3 Hexagons', 'Shortest Path (A*, Bidirectional Dijkstra)', 'Concurrency Queues', 'Monotonic Stacks'],
      LLD: ['Ride Matching Dispatcher', 'Driver State Machine', 'Dynamic Surge Pricing Engine', 'Trip Lifecycle Manager'],
      HLD: ['Real-Time Driver Location Stream', 'Geofencing Service', 'Distributed Locking with Redis Redlock', 'Kafka Event Pipeline'],
      Behavioral: ['See the Forest and the Trees', 'Build with Purpose', 'Go Get It', 'Great Minds Do Not Think Alike']
    }
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    tagline: 'Team collaboration systems, high code craftsmanship & resilience',
    logoColor: 'from-blue-500 via-sky-500 to-cyan-400',
    focusAreas: {
      DSA: ['Interval Merging', 'Trie / Autocomplete Systems', 'Tree Ancestors / LCA', 'Dynamic Programming on Grids'],
      LLD: ['Kanban Board State Engine', 'Issue Lifecycle Workflow', 'Rate Limiter & Circuit Breaker', 'Plugin Architecture'],
      HLD: ['Collaborative Document Editing (OT / CRDT)', 'Global Search with Elasticsearch', 'Distributed Webhooks', 'Event Sourcing with Kafka'],
      Behavioral: ['Open Company No Bullshit', 'Build with Heart & Balance', 'Don’t #@!% the Customer', 'Play as a Team']
    }
  }
];

export const CURATED_INTERVIEW_QUESTIONS: CuratedInterviewQuestion[] = [
  // DSA QUESTIONS
  {
    id: 'goog-dsa-1',
    company: 'Google',
    level: 'SDE-2',
    round: 'DSA',
    testStyle: 'faang_bar_raiser',
    title: 'Word Ladder II - Shortest Transformation Sequences with Path Reconstruction',
    description: 'Given two words, beginWord and endWord, and a dictionary wordList, return all the shortest transformation sequences from beginWord to endWord. Each sequence must be transformed such that only one letter is changed at a time, and every transformed word must exist in the wordList.',
    constraints: [
      '1 <= beginWord.length <= 5',
      'endWord.length == beginWord.length',
      '1 <= wordList.length <= 500',
      'All words consist of lowercase English letters and are unique.'
    ],
    sampleInputOutput: 'Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]\nOutput: [["hit","hot","dot","dog","cog"],["hit","hot","lot","log","cog"]]',
    keyEvaluationCriteria: [
      'Bidirectional BFS for optimal level-wise graph traversal',
      'Backtracking / DFS path reconstruction from BFS parent adjacency map',
      'Avoiding infinite cycles and duplicate word visits',
      'Optimal Time Complexity O(N * L * 26) where N is word count, L is word length'
    ],
    starterCode: {
      cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <unordered_set>\n#include <unordered_map>\n#include <queue>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<string>> findLadders(string beginWord, string endWord, vector<string>& wordList) {\n        // Write your optimal BFS + DFS solution here\n        return {};\n    }\n};`,
      python: `class Solution:\n    def findLadders(self, beginWord: str, endWord: str, wordList: list[str]) -> list[list[str]]:\n        # Write your optimal BFS + DFS solution here\n        return []`,
      java: `import java.util.*;\n\nclass Solution {\n    public List<List<String>> findLadders(String beginWord, String endWord, List<String> wordList) {\n        // Write your optimal BFS + DFS solution here\n        return new ArrayList<>();\n    }\n}`,
      javascript: `/**\n * @param {string} beginWord\n * @param {string} endWord\n * @param {string[]} wordList\n * @return {string[][]}\n */\nvar findLadders = function(beginWord, endWord, wordList) {\n    // Write your optimal BFS + DFS solution here\n    return [];\n};`,
      go: `package main\n\nfunc findLadders(beginWord string, endWord string, wordList []string) [][]string {\n    // Write your optimal BFS + DFS solution here\n    return [][]string{}\n}`,
      rust: `impl Solution {\n    pub fn find_ladders(begin_word: String, end_word: String, word_list: Vec<String>) -> Vec<Vec<String>> {\n        // Write your optimal BFS + DFS solution here\n        Vec::new()\n    }\n}`
    }
  },
  {
    id: 'amzn-dsa-1',
    company: 'Amazon',
    level: 'SDE-2',
    round: 'DSA',
    testStyle: 'faang_bar_raiser',
    title: 'Sliding Window Maximum (O(N) Monotonic Deque)',
    description: 'You are given an array of integers nums, and there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position, return the max sliding window.',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
      '1 <= k <= nums.length'
    ],
    sampleInputOutput: 'Input: nums = [1,3,-1,-3,5,3,6,7], k = 3\nOutput: [3,3,5,5,6,7]',
    keyEvaluationCriteria: [
      'Rejection of O(N * K) brute force or O(N log K) priority queue approaches',
      'Implementation of Double-Ended Monotonic Queue (Deque) in strict O(N) time',
      'Handling boundary conditions when k == 1 or k == nums.length'
    ],
    starterCode: {
      cpp: `#include <iostream>\n#include <vector>\n#include <deque>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        // Write your O(N) Monotonic Deque solution here\n        return {};\n    }\n};`,
      python: `from collections import deque\n\nclass Solution:\n    def maxSlidingWindow(self, nums: list[int], k: int) -> list[int]:\n        # Write your O(N) Monotonic Deque solution here\n        return []`,
      java: `import java.util.*;\n\nclass Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        // Write your O(N) Monotonic Deque solution here\n        return new int[]{};\n    }\n}`,
      javascript: `var maxSlidingWindow = function(nums, k) {\n    // Write your O(N) Monotonic Deque solution here\n    return [];\n};`,
      go: `package main\n\nfunc maxSlidingWindow(nums []int, k int) []int {\n    // Write your O(N) Monotonic Deque solution here\n    return []int{}\n}`,
      rust: `impl Solution {\n    pub fn max_sliding_window(nums: Vec<i32>, k: i32) -> Vec<i32> {\n        // Write your O(N) Monotonic Deque solution here\n        Vec::new()\n    }\n}`
    }
  },

  // LLD MACHINE CODING QUESTIONS
  {
    id: 'amzn-lld-1',
    company: 'Amazon',
    level: 'SDE-2',
    round: 'LLD',
    testStyle: 'faang_bar_raiser',
    title: 'Design an Automated Amazon Locker Delivery & Pickup System',
    description: 'Design a modular, thread-safe Amazon Locker Network. Customers receive an OTP code to unlock a dedicated locker slot. Packages come in Small, Medium, and Large sizes. Lockers are clustered in hubs with varying slot sizes. Ensure slots are optimally allocated, expired packages can be reclaimed by couriers, and multiple users can concurrently interact.',
    keyEvaluationCriteria: [
      'SOLID Object-Oriented Domain Model (Locker, Slot, Package, Hub, OTPService, AllocationStrategy)',
      'Strategy Pattern for Slot Allocation (Fit matching, overflow rules)',
      'Thread safety & concurrency locking when reserving or unlocking slots',
      'Extensibility for dynamic locker configurations and timeout webhooks'
    ],
    starterCode: {
      cpp: `// Amazon Locker System - C++ Object-Oriented Architecture\n#include <iostream>\n#include <string>\n#include <vector>\n#include <unordered_map>\n#include <mutex>\n#include <memory>\n\nenum class SlotSize { SMALL, MEDIUM, LARGE };\nenum class SlotState { AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE };\n\n// Define your domain classes, strategies, and LockerManager below\nclass LockerManager {\npublic:\n    // Implement slot allocation, depositPackage, and retrievePackage\n};`,
      python: `# Amazon Locker System - Python OOP Architecture\nfrom enum import Enum\nimport threading\n\nclass SlotSize(Enum):\n    SMALL = 1\n    MEDIUM = 2\n    LARGE = 3\n\n# Define your domain classes, strategies, and LockerManager below\nclass LockerManager:\n    def __init__(self):\n        pass`,
      java: `// Amazon Locker System - Java OOP Architecture\nimport java.util.*;\nimport java.util.concurrent.locks.ReentrantLock;\n\nenum SlotSize { SMALL, MEDIUM, LARGE }\n\npublic class LockerManager {\n    // Implement thread-safe locker allocation and package retrieval\n}`,
      javascript: `// Amazon Locker System - JS Architecture\nclass LockerManager {\n    constructor() {\n        this.lockers = [];\n    }\n}`,
      go: `package main\n\n// Implement thread-safe LockerManager in Go\ntype LockerManager struct {}\n\nfunc main() {}`,
      rust: `// Amazon Locker System in Rust\npub struct LockerManager {}\n\nfn main() {}`
    }
  },

  // HLD SYSTEM DESIGN QUESTIONS
  {
    id: 'uber-hld-1',
    company: 'Uber',
    level: 'SDE-2',
    round: 'HLD',
    testStyle: 'system_architect',
    title: 'Design Uber Real-Time Driver Location Stream & Matchmaking Engine',
    description: 'Architect a low-latency system capable of tracking 5 Million active drivers streaming GPS coordinates every 4 seconds. The system must support rider search queries finding the top 5 nearest available drivers within a 3km radius with sub-50ms latency.',
    keyEvaluationCriteria: [
      'Geospatial Indexing strategy (H3 Hexagonal Hierarchical Spatial Index vs Google S2 vs QuadTrees)',
      'High-throughput WebSocket Gateway / Envoy connection pooling for 5M drivers',
      'In-memory geospatial cache (Redis Cluster with GEOADD / GEORADIUS or custom Sharded Memory Store)',
      'Event streaming with Kafka for ride dispatch lifecycle and analytics'
    ]
  },
  {
    id: 'meta-hld-1',
    company: 'Meta',
    level: 'SDE-3',
    round: 'HLD',
    testStyle: 'system_architect',
    title: 'Design a Globally Scalable News Feed Fanout System (Instagram / Facebook)',
    description: 'Design the news feed storage and delivery pipeline for 1 Billion DAU. Target read latency < 100ms. Handle celebrities with 100M+ followers (fanout-on-write vs fanout-on-read hybrid architecture), media caching, and real-time feed ranking.',
    keyEvaluationCriteria: [
      'Hybrid Fanout Pipeline (Push for normal users, Pull/Merge for celebrities)',
      'Cache tiering with Redis / Memcached and TAO graph caching',
      'Data partitioning by user_id and post_id with sharded secondary indices',
      'Resilience against hot-key traffic and multi-region replication'
    ]
  },

  // BEHAVIORAL QUESTIONS
  {
    id: 'amzn-beh-1',
    company: 'Amazon',
    level: 'SDE-2',
    round: 'Behavioral',
    testStyle: 'faang_bar_raiser',
    title: 'Customer Obsession & Technical Pushback (STAR Method)',
    description: 'Tell me about a time when you had to push back on a product manager or leadership requirement because it compromised customer data privacy, security, or system availability. How did you handle the conflict and what was the outcome?',
    keyEvaluationCriteria: [
      'Structured STAR format (Situation -> Task -> Action -> Result)',
      'Evidence of deep customer obsession and principled technical ownership',
      'Quantifiable impact (e.g. prevented outage, saved latency, increased reliability)'
    ]
  },
  {
    id: 'goog-beh-1',
    company: 'Google',
    level: 'SDE-3',
    round: 'Behavioral',
    testStyle: 'faang_bar_raiser',
    title: 'Navigating Architectural Ambiguity & Resolving Cross-Team Deadlocks',
    description: 'Describe a situation where two senior engineering teams had fundamentally conflicting architectural visions for a core infrastructure service. How did you facilitate consensus, mitigate risks, and lead the delivery without burning bridges?',
    keyEvaluationCriteria: [
      'Strategic leadership and technical empathy',
      'Objective benchmarking & proof-of-concept validation',
      'Long-term engineering culture elevation'
    ]
  }
];

/**
 * Dynamically generates a tailored technical interview question using Mistral AI based on candidate's exact background.
 */
export async function generateDynamicInterviewQuestion(
  company: string,
  round: InterviewRound,
  level: SdeLevel,
  style: TestStyle,
  candidateProfile?: {
    name?: string;
    techStack?: string[];
    experienceYears?: string;
    currentRole?: string;
    resumeText?: string;
    customGoals?: string;
  }
): Promise<CuratedInterviewQuestion> {
  const stylePromptMap: Record<TestStyle, string> = {
    faang_bar_raiser: 'Focus heavily on deep algorithmic invariants, optimal asymptotic time/space bounds, and strict edge case handling.',
    high_growth_startup: 'Focus on practical scalability, clean modular abstractions, developer productivity, and pragmatic MVP trade-offs.',
    fintech_low_latency: 'Focus on high concurrency, lock-free data structures, memory layout, cache locality, and atomic operations.',
    system_architect: 'Focus on global geo-distributed consensus, fault isolation, failure modes, CAP theorem tradeoffs, and disaster recovery.'
  };

  const prompt = `You are a Principal Bar Raiser and Senior Engineering Director at ${company}.
Create a highly authentic, realistic ${level} technical interview question for the "${round}" round.

TEST STYLE: ${style} (${stylePromptMap[style]})

CANDIDATE BACKGROUND:
- Name: ${candidateProfile?.name || 'Candidate'}
- Experience: ${candidateProfile?.experienceYears || '2-4'} Years (${candidateProfile?.currentRole || 'Software Engineer'})
- Tech Stack: ${candidateProfile?.techStack?.join(', ') || 'C++, Python, Java, Distributed Systems'}
${candidateProfile?.customGoals ? `- Specific Candidate Focus: ${candidateProfile.customGoals}` : ''}
${candidateProfile?.resumeText ? `- Extracted Resume Context: ${candidateProfile.resumeText.slice(0, 500)}` : ''}

Generate an authentic question formatted STRICTLY as JSON with this exact schema:
{
  "id": "gen-${Date.now()}",
  "title": "Clear Problem Title",
  "company": "${company}",
  "level": "${level}",
  "round": "${round}",
  "testStyle": "${style}",
  "description": "Comprehensive problem statement detailing input constraints, expected output, and requirements.",
  "constraints": ["Constraint 1", "Constraint 2", "Constraint 3"],
  "sampleInputOutput": "Input: ...\\nOutput: ...",
  "keyEvaluationCriteria": ["Criteria 1", "Criteria 2", "Criteria 3", "Criteria 4"],
  "starterCode": {
    "cpp": "// C++ starter code",
    "python": "# Python starter code",
    "java": "// Java starter code",
    "javascript": "// JS starter code",
    "go": "// Go starter code",
    "rust": "// Rust starter code"
  }
}`;

  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.title && parsed.description) {
          return {
            id: parsed.id || `gen-${Date.now()}`,
            title: parsed.title,
            company: company,
            level: level,
            round: round,
            testStyle: style,
            description: parsed.description,
            constraints: parsed.constraints || [],
            sampleInputOutput: parsed.sampleInputOutput || '',
            keyEvaluationCriteria: parsed.keyEvaluationCriteria || ['Optimal Time/Space Complexity', 'Clean Modularity'],
            starterCode: parsed.starterCode || {}
          };
        }
      }
    }
  } catch (err) {
    console.warn('Dynamic question generation fallback notice:', err);
  }

  // Fallback to closest curated question
  const fallback = CURATED_INTERVIEW_QUESTIONS.find(q => q.round === round && q.company === company) ||
                   CURATED_INTERVIEW_QUESTIONS.find(q => q.round === round) ||
                   CURATED_INTERVIEW_QUESTIONS[0];
  return { ...fallback, testStyle: style };
}

/**
 * Dynamically fetches company interview questions with caching and candidate style matching.
 */
export async function getCompanyInterviewData(
  company: string, 
  round: InterviewRound, 
  level: SdeLevel = 'SDE-2',
  style: TestStyle = 'faang_bar_raiser'
): Promise<CuratedInterviewQuestion[]> {
  const normCompany = company.toLowerCase();

  // Filter curated questions
  const filtered = CURATED_INTERVIEW_QUESTIONS.filter(q => {
    const matchCompany = q.company.toLowerCase() === normCompany || normCompany === 'general';
    const matchRound = q.round === round;
    return matchRound && (matchCompany || q.level === level);
  });

  return filtered.length > 0 ? filtered : CURATED_INTERVIEW_QUESTIONS.filter(q => q.round === round);
}
