import { MISTRAL_API_KEY, executeAIChatCascade } from './mistral';

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
  },
  {
    id: 'netflix',
    name: 'Netflix',
    tagline: 'Freedom and Responsibility, High-throughput Video Microservices & Chaos Engineering',
    logoColor: 'from-red-600 via-rose-700 to-slate-900',
    focusAreas: {
      DSA: ['Sliding Window / Rate Limiting', 'Graph Cycle Detection', 'LRU/LFU Eviction', 'Bit Manipulation'],
      LLD: ['Video Transcoding Pipeline State Machine', 'Adaptive Bitrate Selector', 'Circuit Breaker Pattern'],
      HLD: ['Global Video Transcoding & CDN Delivery', 'Dynamic Personalized Recommendation Engine', 'Zuul Gateway & Chaos Monkey'],
      Behavioral: ['Context Not Control', 'Highly Aligned Loosely Coupled', 'Stunning Colleagues', 'Impact & Courage']
    }
  },
  {
    id: 'stripe',
    name: 'Stripe',
    tagline: 'Global economic infrastructure, financial precision, idempotency & API craftsmanship',
    logoColor: 'from-indigo-600 via-violet-600 to-sky-500',
    focusAreas: {
      DSA: ['Interval Partitioning', 'Topological Dependency Graphs', 'Monotonic Stacks', 'Parsing & AST'],
      LLD: ['Idempotent Payment Processor', 'Multi-Currency Double-Entry Ledger', 'Webhook Dispatcher with Exponential Backoff'],
      HLD: ['Global Payment Gateway with Exactly-Once Processing', 'Distributed Financial Ledger with Raft Consensus', 'Multi-Region High Availability'],
      Behavioral: ['Users First', 'Rigorous Craftsmanship', 'Macro Optimism', 'Clear Written Communication']
    }
  }
];

export const CURATED_INTERVIEW_QUESTIONS: CuratedInterviewQuestion[] = [
  // --- DSA QUESTIONS ---
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
      javascript: `var findLadders = function(beginWord, endWord, wordList) {\n    return [];\n};`,
      go: `package main\n\nfunc findLadders(beginWord string, endWord string, wordList []string) [][]string {\n    return [][]string{}\n}`,
      rust: `impl Solution {\n    pub fn find_ladders(begin_word: String, end_word: String, word_list: Vec<String>) -> Vec<Vec<String>> {\n        Vec::new()\n    }\n}`
    }
  },
  {
    id: 'goog-dsa-2',
    company: 'Google',
    level: 'SDE-2',
    round: 'DSA',
    testStyle: 'faang_bar_raiser',
    title: 'Shortest Path Visiting All Nodes (Bitmask BFS)',
    description: 'You have an undirected, connected graph of n nodes labeled from 0 to n - 1. You are given an array graph where graph[i] is a list of all the nodes connected with node i by an edge. Return the length of the shortest path that visits every node. You may start and stop at any node, revisit nodes multiple times, and reuse edges.',
    constraints: [
      '1 <= n <= 12',
      '0 <= graph[i].length < n',
      'graph[i] does not contain i',
      'The input graph is always connected.'
    ],
    sampleInputOutput: 'Input: graph = [[1,2,3],[0],[0],[0]]\nOutput: 4\nExplanation: One possible path is [1,0,2,0,3]',
    keyEvaluationCriteria: [
      'State representation using (node, visited_bitmask)',
      'Multi-source BFS initialized with all nodes at distance 0',
      'Early termination when bitmask == (1 << n) - 1',
      'Time complexity O(N * 2^N) and Space complexity O(N * 2^N)'
    ],
    starterCode: {
      cpp: `#include <iostream>\n#include <vector>\n#include <queue>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int shortestPathLength(vector<vector<int>>& graph) {\n        // Implement Bitmask BFS\n        return 0;\n    }\n};`,
      python: `class Solution:\n    def shortestPathLength(self, graph: list[list[int]]) -> int:\n        # Implement Bitmask BFS\n        return 0`,
      java: `import java.util.*;\n\nclass Solution {\n    public int shortestPathLength(int[][] graph) {\n        return 0;\n    }\n}`,
      javascript: `var shortestPathLength = function(graph) {\n    return 0;\n};`,
      go: `package main\n\nfunc shortestPathLength(graph [][]int) int {\n    return 0\n}`,
      rust: `impl Solution {\n    pub fn shortest_path_length(graph: Vec<Vec<i32>>) -> i32 {\n        0\n    }\n}`
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
      cpp: `#include <iostream>\n#include <vector>\n#include <deque>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        return {};\n    }\n};`,
      python: `from collections import deque\n\nclass Solution:\n    def maxSlidingWindow(self, nums: list[int], k: int) -> list[int]:\n        return []`,
      java: `import java.util.*;\n\nclass Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        return new int[]{};\n    }\n}`,
      javascript: `var maxSlidingWindow = function(nums, k) {\n    return [];\n};`,
      go: `package main\n\nfunc maxSlidingWindow(nums []int, k int) []int {\n    return []int{}\n}`,
      rust: `impl Solution {\n    pub fn max_sliding_window(nums: Vec<i32>, k: i32) -> Vec<i32> {\n        Vec::new()\n    }\n}`
    }
  },
  {
    id: 'amzn-dsa-2',
    company: 'Amazon',
    level: 'SDE-2',
    round: 'DSA',
    testStyle: 'faang_bar_raiser',
    title: 'Critical Connections in a Network (Tarjan\'s Bridges Algorithm)',
    description: 'There are n servers numbered from 0 to n - 1 connected by undirected server-to-server connections forming a network where connections[i] = [a, b] represents a connection between servers a and b. Any server can reach other servers directly or indirectly through the network. A critical connection is a connection that, if removed, will make some servers unable to reach some other servers. Return all critical connections in the network in any order.',
    constraints: [
      '2 <= n <= 10^5',
      'n - 1 <= connections.length <= 10^5',
      '0 <= a, b <= n - 1',
      'a != b',
      'There are no repeated connections.'
    ],
    sampleInputOutput: 'Input: n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]\nOutput: [[1,3]]\nExplanation: [[1,3]] is the only critical connection (bridge) in the network.',
    keyEvaluationCriteria: [
      'Identification of Bridge-Finding problem using Tarjan\'s DFS algorithm in O(V + E) time',
      'Maintenance of discovery times (tin) and lowest reachable times (low)',
      'Avoiding trivial backtrack to direct parent in undirected graph',
      'Space complexity O(V + E) for adjacency list and recursion stack'
    ],
    starterCode: {
      cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> criticalConnections(int n, vector<vector<int>>& connections) {\n        return {};\n    }\n};`,
      python: `class Solution:\n    def criticalConnections(self, n: int, connections: list[list[int]]) -> list[list[int]]:\n        return []`,
      java: `import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> criticalConnections(int n, List<List<Integer>> connections) {\n        return new ArrayList<>();\n    }\n}`,
      javascript: `var criticalConnections = function(n, connections) {\n    return [];\n};`,
      go: `package main\n\nfunc criticalConnections(n int, connections [][]int) [][]int {\n    return [][]int{}\n}`,
      rust: `impl Solution {\n    pub fn critical_connections(n: i32, connections: Vec<Vec<i32>>) -> Vec<Vec<i32>> {\n        Vec::new()\n    }\n}`
    }
  },
  {
    id: 'amzn-dsa-3',
    company: 'Amazon',
    level: 'SDE-2',
    round: 'DSA',
    testStyle: 'faang_bar_raiser',
    title: 'Word Search II (Trie & 2D Grid Backtracking)',
    description: 'Given an m x n board of characters and a list of strings words, return all words on the board. Each word must be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.',
    constraints: [
      'm == board.length, n == board[i].length',
      '1 <= m, n <= 12',
      '1 <= words.length <= 3 * 10^4',
      '1 <= words[i].length <= 10',
      'board and words[i] consist of lowercase English letters.'
    ],
    sampleInputOutput: 'Input: board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]\nOutput: ["eat","oath"]',
    keyEvaluationCriteria: [
      'Prefix Tree (Trie) construction over word list for rapid branch pruning',
      'Backtracking DFS with in-place cell masking to avoid secondary visited matrix overhead',
      'Trie node leaf pruning after a word is matched to prevent redundant re-traversals',
      'Time complexity O(M * N * 4^(L)) where L is maximum word length'
    ],
    starterCode: {
      cpp: `#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {\n        return {};\n    }\n};`,
      python: `class Solution:\n    def findWords(self, board: list[list[str]], words: list[str]) -> list[str]:\n        return []`,
      java: `import java.util.*;\n\nclass Solution {\n    public List<String> findWords(char[][] board, String[] words) {\n        return new ArrayList<>();\n    }\n}`,
      javascript: `var findWords = function(board, words) {\n    return [];\n};`,
      go: `package main\n\nfunc findWords(board [][]byte, words []string) []string {\n    return []string{}\n}`,
      rust: `impl Solution {\n    pub fn find_words(board: Vec<Vec<char>>, words: Vec<String>) -> Vec<String> {\n        Vec::new()\n    }\n}`
    }
  },
  {
    id: 'amzn-dsa-4',
    company: 'Amazon',
    level: 'SDE-2',
    round: 'DSA',
    testStyle: 'faang_bar_raiser',
    title: 'Trapping Rain Water (Two Pointers & Monotonic Boundary)',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    sampleInputOutput: 'Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6\nExplanation: 6 units of rain water are trapped in the elevation map.',
    keyEvaluationCriteria: [
      'Rejection of O(N^2) brute force and advancement from O(N) space DP to O(1) space Two Pointers',
      'Invariant: min(left_max, right_max) determines the water bound at current pointer',
      'Correct handling of plateau peaks, monotonic ascending/descending slopes, and edge arrays'
    ],
    starterCode: {
      cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        return 0;\n    }\n};`,
      python: `class Solution:\n    def trap(self, height: list[int]) -> int:\n        return 0`,
      java: `class Solution {\n    public int trap(int[] height) {\n        return 0;\n    }\n}`,
      javascript: `var trap = function(height) {\n    return 0;\n};`,
      go: `package main\n\nfunc trap(height []int) int {\n    return 0\n}`,
      rust: `impl Solution {\n    pub fn trap(height: Vec<i32>) -> i32 {\n        0\n    }\n}`
    }
  },
  {
    id: 'amzn-dsa-5',
    company: 'Amazon',
    level: 'SDE-2',
    round: 'DSA',
    testStyle: 'faang_bar_raiser',
    title: 'Course Schedule II (Topological Sort / Kahn\'s Algorithm)',
    description: 'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [a_i, b_i] indicates that you must take course b_i first if you want to take course a_i. Return the ordering of courses you should take to finish all courses. If there are many valid answers, return any of them. If it is impossible to finish all courses, return an empty array.',
    constraints: [
      '1 <= numCourses <= 2000',
      '0 <= prerequisites.length <= numCourses * (numCourses - 1)',
      'prerequisites[i].length == 2',
      '0 <= a_i, b_i < numCourses',
      'a_i != b_i',
      'All the pairs [a_i, b_i] are distinct.'
    ],
    sampleInputOutput: 'Input: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]\nOutput: [0,2,1,3]\nExplanation: There are 4 courses to take. One possible order is [0,1,2,3], another is [0,2,1,3].',
    keyEvaluationCriteria: [
      'In-degree calculation and queue-based BFS (Kahn\'s algorithm) or DFS 3-state cycle detection',
      'Cycle detection check: comparing visited node count against numCourses',
      'Asymptotic Time complexity O(V + E) and Space complexity O(V + E)'
    ],
    starterCode: {
      cpp: `#include <iostream>\n#include <vector>\n#include <queue>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {\n        return {};\n    }\n};`,
      python: `from collections import deque\n\nclass Solution:\n    def findOrder(self, numCourses: int, prerequisites: list[list[int]]) -> list[int]:\n        return []`,
      java: `import java.util.*;\n\nclass Solution {\n    public int[] findOrder(int numCourses, int[][] prerequisites) {\n        return new int[]{};\n    }\n}`,
      javascript: `var findOrder = function(numCourses, prerequisites) {\n    return [];\n};`,
      go: `package main\n\nfunc findOrder(numCourses int, prerequisites [][]int) []int {\n    return []int{}\n}`,
      rust: `impl Solution {\n    pub fn find_order(num_courses: i32, prerequisites: Vec<Vec<i32>>) -> Vec<i32> {\n        Vec::new()\n    }\n}`
    }
  },
  {
    id: 'meta-dsa-1',
    company: 'Meta',
    level: 'SDE-2',
    round: 'DSA',
    testStyle: 'faang_bar_raiser',
    title: 'Accounts Merge with Disjoint Set Union (DSU)',
    description: 'Given a list of accounts where each element accounts[i] is a list of strings, where the first element accounts[i][0] is a name, and the rest of the elements are emails representing emails of the account. Merge the accounts such that if two accounts share an email, they belong to the same person.',
    constraints: [
      '1 <= accounts.length <= 1000',
      '2 <= accounts[i].length <= 10',
      'accounts[i][j] consists of lowercase English letters and "@" and "."'
    ],
    sampleInputOutput: 'Input: accounts = [["John","johnsmith@mail.com","john_newyork@mail.com"],["John","johnsmith@mail.com","john00@mail.com"],["Mary","mary@mail.com"],["John","johnnybravo@mail.com"]]\nOutput: [["John","john00@mail.com","john_newyork@mail.com","johnsmith@mail.com"],["Mary","mary@mail.com"],["John","johnnybravo@mail.com"]]',
    keyEvaluationCriteria: [
      'Disjoint Set Union (DSU / Union-Find) with Path Compression and Union by Rank',
      'Email to Account Index mapping',
      'Lexicographical sorting of merged emails'
    ],
    starterCode: {
      cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<string>> accountsMerge(vector<vector<string>>& accounts) {\n        return {};\n    }\n};`,
      python: `class Solution:\n    def accountsMerge(self, accounts: list[list[str]]) -> list[list[str]]:\n        return []`,
      java: `import java.util.*;\n\nclass Solution {\n    public List<List<String>> accountsMerge(List<List<String>> accounts) {\n        return new ArrayList<>();\n    }\n}`,
      javascript: `var accountsMerge = function(accounts) {\n    return [];\n};`,
      go: `package main\n\nfunc accountsMerge(accounts [][]string) [][]string {\n    return [][]string{}\n}`,
      rust: `impl Solution {\n    pub fn accounts_merge(accounts: Vec<Vec<String>>) -> Vec<Vec<String>> {\n        Vec::new()\n    }\n}`
    }
  },
  {
    id: 'uber-dsa-1',
    company: 'Uber',
    level: 'SDE-2',
    round: 'DSA',
    testStyle: 'fintech_low_latency',
    title: 'Car Pooling & Dynamic Surge Route Overlaps (Sweep-Line Algorithm)',
    description: 'There is a car with capacity empty seats. The vehicle only drives east. Given integer capacity and array trips where trips[i] = [numPassengers, from, to], return true if it is possible to pick up and drop off all passengers for all the given trips without exceeding capacity.',
    constraints: [
      '1 <= trips.length <= 1000',
      'trips[i].length == 3',
      '1 <= numPassengers <= 100',
      '0 <= from < to <= 1000',
      '1 <= capacity <= 10^5'
    ],
    sampleInputOutput: 'Input: trips = [[2,1,5],[3,3,7]], capacity = 4\nOutput: false\nExplanation: At location 3, passengers exceed vehicle capacity (2 + 3 = 5 > 4)',
    keyEvaluationCriteria: [
      'Difference Array / Sweep-Line algorithm in O(N + MaxLocation) or O(N log N)',
      'Handling simultaneous pickups and drop-offs at the exact same location',
      'Memory optimization with constant-size bucket arrays'
    ],
    starterCode: {
      cpp: `#include <vector>\n#include <map>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    bool carPooling(vector<vector<int>>& trips, int capacity) {\n        return true;\n    }\n};`,
      python: `class Solution:\n    def carPooling(self, trips: list[list[int]], capacity: int) -> bool:\n        return True`,
      java: `class Solution {\n    public boolean carPooling(int[][] trips, int capacity) {\n        return true;\n    }\n}`,
      javascript: `var carPooling = function(trips, capacity) {\n    return true;\n};`,
      go: `package main\n\nfunc carPooling(trips [][]int, capacity int) bool {\n    return true\n}`,
      rust: `impl Solution {\n    pub fn car_pooling(trips: Vec<Vec<i32>>, capacity: i32) -> bool {\n        true\n    }\n}`
    }
  },

  // --- LLD MACHINE CODING QUESTIONS ---
  {
    id: 'amzn-lld-1',
    company: 'Amazon',
    level: 'SDE-2',
    round: 'LLD',
    testStyle: 'faang_bar_raiser',
    title: 'Design an Automated Amazon Locker Delivery & Pickup Network',
    description: 'Design a modular, thread-safe Amazon Locker Network. Customers receive a 6-digit OTP code to unlock a dedicated locker slot. Packages come in Small, Medium, and Large sizes. Lockers are clustered in hubs with varying slot sizes. Ensure slots are optimally allocated, expired packages can be reclaimed by couriers, and multiple users can concurrently interact.',
    keyEvaluationCriteria: [
      'SOLID Object-Oriented Domain Model (Locker, Slot, Package, Hub, OTPService, AllocationStrategy)',
      'Strategy Pattern for Slot Allocation (Fit matching, overflow rules)',
      'Thread safety & concurrency locking when reserving or unlocking slots',
      'Extensibility for dynamic locker configurations and timeout webhooks'
    ],
    starterCode: {
      cpp: `// Amazon Locker System - C++ Object-Oriented Architecture\n#include <iostream>\n#include <string>\n#include <vector>\n#include <unordered_map>\n#include <mutex>\n#include <memory>\n\nenum class SlotSize { SMALL, MEDIUM, LARGE };\nenum class SlotState { AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE };\n\nclass LockerManager {\npublic:\n    // Implement slot allocation, depositPackage, and retrievePackage\n};`,
      python: `# Amazon Locker System - Python OOP Architecture\nfrom enum import Enum\nimport threading\n\nclass SlotSize(Enum):\n    SMALL = 1\n    MEDIUM = 2\n    LARGE = 3\n\nclass LockerManager:\n    def __init__(self):\n        pass`,
      java: `import java.util.*;\nimport java.util.concurrent.locks.ReentrantLock;\n\nenum SlotSize { SMALL, MEDIUM, LARGE }\n\npublic class LockerManager {\n    // Implement thread-safe locker allocation and package retrieval\n}`,
      javascript: `class LockerManager {\n    constructor() {\n        this.lockers = [];\n    }\n}`,
      go: `package main\n\ntype LockerManager struct {}\n\nfunc main() {}`,
      rust: `pub struct LockerManager {}\n\nfn main() {}`
    }
  },
  {
    id: 'meta-lld-1',
    company: 'Meta',
    level: 'SDE-2',
    round: 'LLD',
    testStyle: 'high_growth_startup',
    title: 'Design a Distributed In-Memory Rate Limiter (Token Bucket & Leaky Bucket)',
    description: 'Implement a thread-safe, extensible Rate Limiter library supporting multiple algorithms: Token Bucket, Leaky Bucket, and Sliding Window Log. It should support per-user and per-IP throttling with configurable burst capacity and refill rates.',
    keyEvaluationCriteria: [
      'Strategy Pattern for swapping Rate Limiter algorithms seamlessly',
      'Thread-safe atomic updates (e.g. AtomicInteger / Mutex locks)',
      'High throughput with minimal lock contention',
      'Clean interface design with `boolean allowRequest(String clientId)`'
    ],
    starterCode: {
      cpp: `#include <iostream>\n#include <string>\n#include <unordered_map>\n#include <mutex>\n#include <chrono>\n\nclass RateLimiter {\npublic:\n    virtual bool allowRequest(const std::string& clientId) = 0;\n};`,
      python: `import time\nimport threading\nfrom abc import ABC, abstractmethod\n\nclass RateLimiter(ABC):\n    @abstractmethod\n    def allow_request(self, client_id: str) -> bool:\n        pass`,
      java: `public interface RateLimiter {\n    boolean allowRequest(String clientId);\n}`,
      javascript: `class RateLimiter {\n    allowRequest(clientId) {\n        return true;\n    }\n}`,
      go: `package main\n\ntype RateLimiter interface {\n    AllowRequest(clientId string) bool\n}`,
      rust: `pub trait RateLimiter {\n    fn allow_request(&mut self, client_id: &str) -> bool;\n}`
    }
  },
  {
    id: 'stripe-lld-1',
    company: 'Stripe',
    level: 'SDE-2',
    round: 'LLD',
    testStyle: 'fintech_low_latency',
    title: 'Design an Idempotent Multi-Currency Financial Ledger & Payment Engine',
    description: 'Design a high-precision double-entry bookkeeping ledger system. Each financial transaction consists of equal Debits and Credits across accounts. Must support atomic transaction execution, currency conversion rates, and strict idempotency keys to prevent duplicate billing upon network retries.',
    keyEvaluationCriteria: [
      'Double-entry accounting invariant (Sum of Debits == Sum of Credits)',
      'Idempotency Key Cache & Atomic Lock mechanism',
      'Immutability of posted financial entries (Append-only ledger)',
      'Handling fractional amounts and rounding precision with BigDecimal / integer cents'
    ],
    starterCode: {
      cpp: `#include <iostream>\n#include <string>\n#include <vector>\n#include <unordered_map>\n#include <mutex>\n\nclass LedgerService {\npublic:\n    // Implement recordTransaction(idempotencyKey, entries)\n};`,
      python: `class LedgerService:\n    def __init__(self):\n        self.accounts = {}\n        self.idempotency_keys = set()`,
      java: `import java.math.BigDecimal;\nimport java.util.*;\n\npublic class LedgerService {\n    // Implement double-entry recording with idempotency\n}`,
      javascript: `class LedgerService {\n    constructor() {\n        this.accounts = new Map();\n    }\n}`,
      go: `package main\n\ntype LedgerService struct {}\n\nfunc main() {}`,
      rust: `pub struct LedgerService {}\n\nfn main() {}`
    }
  },

  // --- HLD SYSTEM DESIGN QUESTIONS ---
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
  {
    id: 'netflix-hld-1',
    company: 'Netflix',
    level: 'SDE-3',
    round: 'HLD',
    testStyle: 'system_architect',
    title: 'Design a Global Video Transcoding & Adaptive Bitrate Streaming CDN',
    description: 'Architect an ultra-reliable video upload, distributed chunked transcoding, and global CDN caching pipeline for 200M concurrent video streamers with zero buffering and multi-region failover.',
    keyEvaluationCriteria: [
      'Chunk-based parallel video transcoding with FFmpeg workers and SQS/Kafka job queues',
      'HLS / DASH manifest generation with multi-bitrate profiles (4K, 1080p, 720p, 480p)',
      'Edge CDN Anycast routing with Cloudflare/Fastly and origin shield caches',
      'Circuit breaker pattern and graceful degradation during network congestion'
    ]
  },
  {
    id: 'atlassian-hld-1',
    company: 'Atlassian',
    level: 'SDE-2',
    round: 'HLD',
    testStyle: 'system_architect',
    title: 'Design a Real-Time Collaborative Document Editor (Google Docs / Confluence)',
    description: 'Architect a collaborative document editing engine supporting 100+ concurrent editors per document. Guarantee consistency, conflict resolution, low latency (<50ms keystroke sync), and offline synchronization.',
    keyEvaluationCriteria: [
      'Operational Transformation (OT) vs Conflict-free Replicated Data Types (CRDTs)',
      'WebSocket stateful session management with Redis pub/sub backplane',
      'Snapshotting & append-only document operation logs in Cassandra/Postgres',
      'Cursor position broadcast and presence cluster management'
    ]
  },

  // --- BEHAVIORAL QUESTIONS ---
  {
    id: 'amzn-beh-1',
    company: 'Amazon',
    level: 'SDE-2',
    round: 'Behavioral',
    testStyle: 'faang_bar_raiser',
    title: 'Customer Obsession & Principled Technical Pushback (STAR Method)',
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
  },
  {
    id: 'meta-beh-1',
    company: 'Meta',
    level: 'SDE-2',
    round: 'Behavioral',
    testStyle: 'high_growth_startup',
    title: 'Moving Fast with Focus on Long-Term Impact & Technical Debt',
    description: 'Tell me about a time when you had to make a critical trade-off between shipping a high-priority feature quickly to meet a business deadline versus building the ideal, scalable architecture. How did you manage technical debt and what were the consequences?',
    keyEvaluationCriteria: [
      'Clarity in business vs engineering trade-offs',
      'Deliberate technical debt tracking and remediation plan',
      'Measurable results and key lessons learned'
    ]
  }
];

/**
 * Dynamically generates a fresh, customized technical interview question using AI based on candidate's exact background.
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
  const randomSalt = Math.random().toString(36).substring(2, 8);
  const candidateName = candidateProfile?.name?.trim() || 'Candidate';
  const role = candidateProfile?.currentRole || 'Software Engineer';
  const exp = candidateProfile?.experienceYears || '2-4';
  const techStack = candidateProfile?.techStack && candidateProfile.techStack.length > 0 ? candidateProfile.techStack.join(', ') : 'C++, Python, Java, Distributed Systems';

  const stylePromptMap: Record<TestStyle, string> = {
    faang_bar_raiser: 'Focus heavily on deep algorithmic invariants, optimal asymptotic time/space bounds, and strict edge case handling.',
    high_growth_startup: 'Focus on practical scalability, clean modular abstractions, developer productivity, and pragmatic MVP trade-offs.',
    fintech_low_latency: 'Focus on high concurrency, lock-free data structures, memory layout, cache locality, and atomic operations.',
    system_architect: 'Focus on global geo-distributed consensus, fault isolation, failure modes, CAP theorem tradeoffs, and disaster recovery.'
  };

  const roundThemes: Record<InterviewRound, string[]> = {
    DSA: [
      'Multi-Dimensional Dynamic Programming on Matrices & Subsequences',
      'Graph Shortest Paths, Strongly Connected Components & Topological Sorting',
      'Monotonic Stack / Deque for Sliding Windows & Range Query Bounds',
      'Bitwise Trie & Prefix Tree Subarray Optimization',
      'Segment Tree & Binary Indexed Tree (Fenwick) with Lazy Propagation',
      'Two Pointers & Fast/Slow Traversal with String Matching',
      'Disjoint Set Union (DSU) with Path Compression & Rank Optimization',
      'Backtracking with Pruning & State Bitmask Optimization',
      'Binary Search on Answer Space & Monotonic Predicate Functions',
      'Interval Merging, Sweep-Line & Coordinate Compression'
    ],
    LLD: [
      'Machine Coding: Thread-Safe Amazon Locker Slot Allocation Network',
      'Machine Coding: Multi-Algorithm Rate Limiter (Token Bucket, Leaky Bucket, Sliding Log)',
      'Machine Coding: Double-Entry Financial Ledger with Idempotency Locks',
      'Machine Coding: Parking Lot & Multi-Vehicle Spot Matching Dispatcher',
      'Machine Coding: Elevator Scheduling Controller with Multiple Car State Machines',
      'Machine Coding: In-Memory Task Scheduler with Cron Trigger & Worker Thread Pool',
      'Machine Coding: Splitwise Expense Sharing with Debt Graph Simplification'
    ],
    HLD: [
      'Global Distributed Key-Value Store with Raft Consensus & Sharded LSM-Trees',
      'Real-Time Driver Location Stream & Geospatial Indexing (H3 Hexagons)',
      'High-Scale News Feed Fanout (Hybrid Push/Pull with Redis Caching & TAO)',
      'Global Video Transcoding & Adaptive Bitrate Streaming CDN Pipeline',
      'Real-Time Collaborative Document Editing Engine with CRDTs / Operational Transformation',
      'Global Payment Processing Gateway with Idempotency & Distributed Ledgers',
      'Distributed Notification & Webhook Dispatcher with Dead-Letter Queues'
    ],
    Behavioral: [
      'Principled Technical Pushback against High-Pressure Deadlines (STAR)',
      'Navigating Severe Production Outages, Post-Mortems & System Blast Radius Mitigation',
      'Leading Cross-Functional Consensus across Disagreeing Senior Architect Teams',
      'Balancing Rapid MVP Speed against Intentional Technical Debt Tracking',
      'Mentoring Junior Engineers and Elevating Overall Team Engineering Rigor'
    ]
  };

  const themesForRound = roundThemes[round] || roundThemes.DSA;
  const randomDomain = themesForRound[Math.floor(Math.random() * themesForRound.length)];

  const roundDirectives: Record<InterviewRound, string> = {
    DSA: `STRICT MANDATORY RULE: This is a PURE DATA STRUCTURES & ALGORITHMS (DSA) CODING PROBLEM.
- It MUST be an algorithmic coding problem requiring functions, arrays, graphs, trees, DP, stacks, or math.
- UNDER NO CIRCUMSTANCES should you generate a System Design, HLD, or microservices problem.
- Must provide exact input data types, array/string sizes, value bounds, and constraints (e.g. 1 <= nums.length <= 10^5).
- Must provide concrete Sample Input and Sample Output with explanation.
- Must provide algorithmic starter code with clean function signatures in all supported languages.`,

    LLD: `STRICT MANDATORY RULE: This is a LOW-LEVEL DESIGN (LLD) / MACHINE CODING PROBLEM.
- It MUST be an object-oriented class design or machine coding scenario.
- Focus on SOLID design principles, clean modular class hierarchies, design patterns (Strategy, Factory, Observer, State), and thread-safety.
- Provide starter class skeletons and interfaces in all supported languages.`,

    HLD: `STRICT MANDATORY RULE: This is a HIGH-LEVEL SYSTEM DESIGN (HLD) ARCHITECTURE PROBLEM.
- It MUST be a large-scale distributed system architecture scenario.
- Focus on microservices, QPS estimations, database sharding, caching tiers, message queues, CAP tradeoffs, and fault tolerance.`,

    Behavioral: `STRICT MANDATORY RULE: This is a BEHAVIORAL & LEADERSHIP (STAR METHOD) SCENARIO.
- It MUST be a behavioral interview question evaluating Situation, Task, Action, and Result.`
  };

  const prompt = `You are a Principal Bar Raiser and Senior Engineering Director at ${company} conducting a ${level} live technical mock interview for the "${round}" round.
Create a BRAND NEW, ORIGINAL, and REALISTIC technical interview problem.

${roundDirectives[round]}

SEED/THEME: ${randomDomain} (Entropy: ${randomSalt})
TEST STYLE: ${style} (${stylePromptMap[style]})

CANDIDATE BACKGROUND & RESUME CONTEXT:
- Candidate Name: ${candidateName}
- Target Level: ${level}
- Current Role: ${role} (${exp} Years Experience)
- Tech Stack: ${techStack}
${candidateProfile?.customGoals ? `- Candidate Personal Goals/Focus: ${candidateProfile.customGoals}` : ''}
${candidateProfile?.resumeText ? `- Extracted Resume Context: ${candidateProfile.resumeText.slice(0, 600)}` : ''}

Generate a fresh, authentic question formatted STRICTLY as JSON with this exact schema:
{
  "id": "gen-${Date.now()}",
  "title": "Problem Title",
  "company": "${company}",
  "level": "${level}",
  "round": "${round}",
  "testStyle": "${style}",
  "description": "Comprehensive problem statement detailing input constraints, expected output, and scenario requirements.",
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
    const raw = await executeAIChatCascade(
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.85,
        responseFormatJson: true,
        timeoutMs: 9000
      }
    );

    if (raw && raw.trim().length > 0) {
      const cleanJson = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);
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
  } catch (err) {
    console.warn('Dynamic question generation AI notice, using randomized curated pool:', err);
  }

  // Fallback to randomized curated question so it never repeats the same static problem
  const pool = CURATED_INTERVIEW_QUESTIONS.filter(q => q.round === round);
  const companyPool = pool.filter(q => q.company.toLowerCase() === company.toLowerCase() || q.company.toLowerCase() === 'general');
  const selectedPool = companyPool.length > 0 ? companyPool : pool;
  const picked = selectedPool[Math.floor(Math.random() * selectedPool.length)] || CURATED_INTERVIEW_QUESTIONS[0];
  return { ...picked, testStyle: style };
}

/**
 * Dynamically fetches company interview questions with randomized ordering and style matching.
 */
export async function getCompanyInterviewData(
  company: string, 
  round: InterviewRound, 
  level: SdeLevel = 'SDE-2',
  style: TestStyle = 'faang_bar_raiser'
): Promise<CuratedInterviewQuestion[]> {
  const normCompany = company.toLowerCase();

  // Filter curated questions
  let filtered = CURATED_INTERVIEW_QUESTIONS.filter(q => {
    const matchCompany = q.company.toLowerCase() === normCompany || normCompany === 'general';
    const matchRound = q.round === round;
    return matchRound && (matchCompany || q.level === level);
  });

  if (filtered.length === 0) {
    filtered = CURATED_INTERVIEW_QUESTIONS.filter(q => q.round === round);
  }

  // Shuffle the questions array so users get a fresh problem order every time
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.length > 0 ? shuffled : CURATED_INTERVIEW_QUESTIONS;
}
