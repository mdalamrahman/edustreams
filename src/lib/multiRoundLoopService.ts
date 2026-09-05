import { SdeLevel, InterviewRound, SUPPORTED_COMPANIES } from './githubInterviewData';
import { InterviewScorecard } from './interviewEvaluator';

export type InterviewExecutionMode = 'single' | 'full_loop';

export interface RoundDefinition {
  id: string;
  roundIndex: number; // 0-indexed (0 = Round 1, 1 = Round 2...)
  title: string;
  roundType: InterviewRound;
  interviewerName: string;
  interviewerTitle: string;
  focusDescription: string;
  durationMinutes: number;
}

export interface CompletedRoundRecord {
  roundIndex: number;
  roundDefinition: RoundDefinition;
  scorecard: InterviewScorecard;
  passed: boolean;
  eliminationReason?: string;
  timestamp: string;
}

export interface CompensationBand {
  baseSalary: string;
  rsuEquity: string;
  signOnBonus: string;
  totalFirstYear: string;
}

export interface OfferPacket {
  company: string;
  level: SdeLevel;
  calibratedJobTitle: string;
  verdict: 'OFFER EXTENDED' | 'STRONG HIRE' | 'HIRE';
  overallScore: number;
  compositePercentile: number;
  compensation: CompensationBand;
  hiringCommitteeSummary: string;
  roundResults: CompletedRoundRecord[];
  createdAt: string;
}

/**
 * Returns authentic, company-specific multi-round interview schedules
 * starting with DSA Coding, followed by Machine Coding / LLD, Distributed Systems HLD, and Bar Raiser Behavioral.
 */
export function getCompanyRoundSchedule(companyId: string, level: SdeLevel): RoundDefinition[] {
  const normId = companyId.toLowerCase();

  switch (normId) {
    case 'google':
      return [
        {
          id: 'goog-r1',
          roundIndex: 0,
          title: 'Round 1: DSA Algorithms & Complexity',
          roundType: 'DSA',
          interviewerName: 'Dr. Sarah Chen',
          interviewerTitle: 'Staff Software Engineer, Core Systems',
          focusDescription: 'Optimal algorithmic depth, Big-O proofs, sliding windows, and graph traversals.',
          durationMinutes: 45
        },
        {
          id: 'goog-r2',
          roundIndex: 1,
          title: 'Round 2: Advanced Data Structures & Invariants',
          roundType: 'DSA',
          interviewerName: 'Alex Rivera',
          interviewerTitle: 'Senior Staff Engineer, Google Cloud',
          focusDescription: 'Complex dynamic programming, segment trees, tries, and boundary edge cases.',
          durationMinutes: 45
        },
        {
          id: 'goog-r3',
          roundIndex: 2,
          title: 'Round 3: High-Level System Design (HLD)',
          roundType: 'HLD',
          interviewerName: 'Vikram Patel',
          interviewerTitle: 'Principal Systems Architect',
          focusDescription: 'Global distributed storage (Spanner/Bigtable), multi-region replication, and SPOFs.',
          durationMinutes: 45
        },
        {
          id: 'goog-r4',
          roundIndex: 3,
          title: 'Round 4: Googliness & Leadership',
          roundType: 'Behavioral',
          interviewerName: 'Elena Rostova',
          interviewerTitle: 'Engineering Director & Bar Raiser',
          focusDescription: 'Navigating ambiguity, cross-functional disagreement, team culture, and ownership.',
          durationMinutes: 40
        }
      ];

    case 'amazon':
      return [
        {
          id: 'amzn-r1',
          roundIndex: 0,
          title: 'Round 1: Online Coding & Algorithmic Problem Solving',
          roundType: 'DSA',
          interviewerName: 'David Miller',
          interviewerTitle: 'Software Development Manager, AWS',
          focusDescription: 'Trees, BST, heaps, Dijkstra, and clean modular code execution.',
          durationMinutes: 45
        },
        {
          id: 'amzn-r2',
          roundIndex: 1,
          title: 'Round 2: Machine Coding & Low-Level Design (LLD)',
          roundType: 'LLD',
          interviewerName: 'Marcus Vance',
          interviewerTitle: 'Principal SDE, Retail Platform',
          focusDescription: 'Object-Oriented Domain Modeling, SOLID design, concurrency locks, and design patterns.',
          durationMinutes: 45
        },
        {
          id: 'amzn-r3',
          roundIndex: 2,
          title: 'Round 3: Distributed System Architecture (HLD)',
          roundType: 'HLD',
          interviewerName: 'Ananya Sharma',
          interviewerTitle: 'AWS Principal Solutions Architect',
          focusDescription: 'Event-driven pub/sub, DynamoDB data modeling, high availability (99.999%), and blast radius mitigation.',
          durationMinutes: 45
        },
        {
          id: 'amzn-r4',
          roundIndex: 3,
          title: 'Round 4: Bar Raiser & Amazon 16 Leadership Principles',
          roundType: 'Behavioral',
          interviewerName: 'Rachel Green',
          interviewerTitle: 'Principal Bar Raiser, Prime Video',
          focusDescription: 'Customer Obsession, Ownership, Bias for Action, Dive Deep, and Disagree & Commit.',
          durationMinutes: 45
        }
      ];

    case 'meta':
      return [
        {
          id: 'meta-r1',
          roundIndex: 0,
          title: 'Round 1: Coding Sprint (DSA Part 1)',
          roundType: 'DSA',
          interviewerName: 'Alex Rivera',
          interviewerTitle: 'Staff Engineer, Social Graph Core',
          focusDescription: 'Fast-paced algorithmic problem solving, clean bug-free syntax, and recursion/backtracking.',
          durationMinutes: 45
        },
        {
          id: 'meta-r2',
          roundIndex: 1,
          title: 'Round 2: Complex Algorithms (DSA Part 2)',
          roundType: 'DSA',
          interviewerName: 'Jessica Wu',
          interviewerTitle: 'Senior Staff Engineer, AI Infrastructure',
          focusDescription: 'Topological sort, bipartite graphs, custom data structures, and optimal Big-O.',
          durationMinutes: 45
        },
        {
          id: 'meta-r3',
          roundIndex: 2,
          title: 'Round 3: Large-Scale System Design (HLD)',
          roundType: 'HLD',
          interviewerName: 'Michael Zhang',
          interviewerTitle: 'Principal Architect, Feed Infrastructure',
          focusDescription: 'Social graph caching (TAO), hybrid fan-out feeds, RocksDB sharding, and live streaming.',
          durationMinutes: 45
        },
        {
          id: 'meta-r4',
          roundIndex: 3,
          title: 'Round 4: Behavioral & Culture (Move Fast & Impact)',
          roundType: 'Behavioral',
          interviewerName: 'Carlos Gomez',
          interviewerTitle: 'Director of Engineering',
          focusDescription: 'Be Bold, Focus on Impact, Move Fast, and handling production outages.',
          durationMinutes: 40
        }
      ];

    case 'microsoft':
      return [
        {
          id: 'msft-r1',
          roundIndex: 0,
          title: 'Round 1: Data Structures & Algorithms',
          roundType: 'DSA',
          interviewerName: 'Priya Nair',
          interviewerTitle: 'Principal SDE, Azure Compute',
          focusDescription: 'Linked lists, binary trees, dynamic programming on grids, and string parsing.',
          durationMinutes: 45
        },
        {
          id: 'msft-r2',
          roundIndex: 1,
          title: 'Round 2: Machine Coding & Extensible OOP (LLD)',
          roundType: 'LLD',
          interviewerName: 'Nathan Cole',
          interviewerTitle: 'Senior Software Engineer, Office 365',
          focusDescription: 'Domain design patterns, interface segregation, thread-safety, and testability.',
          durationMinutes: 45
        },
        {
          id: 'msft-r3',
          roundIndex: 2,
          title: 'Round 3: Cloud Distributed Architecture (HLD)',
          roundType: 'HLD',
          interviewerName: 'David Miller',
          interviewerTitle: 'Partner Software Architect, Azure',
          focusDescription: 'Multi-tenant SaaS, Cosmos DB partitioning, event hubs, caching layers, and SLA guarantees.',
          durationMinutes: 45
        },
        {
          id: 'msft-r4',
          roundIndex: 3,
          title: 'Round 4: As Appropriate (AA) / Executive Leadership',
          roundType: 'Behavioral',
          interviewerName: 'Sarah Jenkins',
          interviewerTitle: 'General Manager, Enterprise Cloud',
          focusDescription: 'Growth mindset, inclusive leadership, cross-organizational collaboration, and resilience.',
          durationMinutes: 40
        }
      ];

    case 'uber':
      return [
        {
          id: 'uber-r1',
          roundIndex: 0,
          title: 'Round 1: Algorithmic Coding & Graphs',
          roundType: 'DSA',
          interviewerName: 'Kevin Lin',
          interviewerTitle: 'Senior SDE, Mobility Routing',
          focusDescription: 'Shortest path (A* / Dijkstra), quadtrees, priority queues, and concurrency data structures.',
          durationMinutes: 45
        },
        {
          id: 'uber-r2',
          roundIndex: 1,
          title: 'Round 2: Real-Time Machine Coding (LLD)',
          roundType: 'LLD',
          interviewerName: 'Sophia Taylor',
          interviewerTitle: 'Staff SDE, Marketplace Dispatcher',
          focusDescription: 'Driver state machine, dynamic surge pricing engine, and trip lifecycle coordinator.',
          durationMinutes: 45
        },
        {
          id: 'uber-r3',
          roundIndex: 2,
          title: 'Round 3: Geospatial Distributed Systems (HLD)',
          roundType: 'HLD',
          interviewerName: 'Jason Scott',
          interviewerTitle: 'Principal Systems Architect',
          focusDescription: 'Real-time location ingestion, H3 hexagon indexing, Redis Redlock, and Kafka pipelines.',
          durationMinutes: 45
        },
        {
          id: 'uber-r4',
          roundIndex: 3,
          title: 'Round 4: Behavioral & Systemic Ownership',
          roundType: 'Behavioral',
          interviewerName: 'Amanda Cruz',
          interviewerTitle: 'Engineering Director',
          focusDescription: 'High-stakes production incident recovery, data-driven decisions, and collaborative grit.',
          durationMinutes: 40
        }
      ];

    case 'stripe':
      return [
        {
          id: 'stripe-r1',
          roundIndex: 0,
          title: 'Round 1: Algorithmic Rigor & Dependency Trees',
          roundType: 'DSA',
          interviewerName: 'Liam Foster',
          interviewerTitle: 'Staff Engineer, Global Payments',
          focusDescription: 'Topological dependency graphs, monotonic parsing, interval partitioning, and invariants.',
          durationMinutes: 45
        },
        {
          id: 'stripe-r2',
          roundIndex: 1,
          title: 'Round 2: Financial Precision & Machine Coding (LLD)',
          roundType: 'LLD',
          interviewerName: 'Emma Watson',
          interviewerTitle: 'Principal Engineer, Banking Rail',
          focusDescription: 'Idempotent transaction state machine, multi-currency double-entry ledger, and exponential retry dispatchers.',
          durationMinutes: 45
        },
        {
          id: 'stripe-r3',
          roundIndex: 2,
          title: 'Round 3: High-Availability Financial Architecture (HLD)',
          roundType: 'HLD',
          interviewerName: 'Oliver Smith',
          interviewerTitle: 'Distinguished Architect',
          focusDescription: 'Payment gateway with exactly-once semantics, Raft consensus ledgers, and zero data-loss replication.',
          durationMinutes: 45
        },
        {
          id: 'stripe-r4',
          roundIndex: 3,
          title: 'Round 4: Behavioral & Technical Craftsmanship',
          roundType: 'Behavioral',
          interviewerName: 'Chloe Bennett',
          interviewerTitle: 'Head of Infrastructure Engineering',
          focusDescription: 'Users first, rigorous software craftsmanship, macro optimism, and precise communication.',
          durationMinutes: 40
        }
      ];

    default:
      // Canonical 4-stage tier-1 loop fallback
      return [
        {
          id: `${normId}-r1`,
          roundIndex: 0,
          title: 'Round 1: Data Structures & Algorithms',
          roundType: 'DSA',
          interviewerName: 'Lead Interviewer',
          interviewerTitle: 'Staff Software Engineer',
          focusDescription: 'Core algorithmic problem solving, Big-O proofs, and test-case execution.',
          durationMinutes: 45
        },
        {
          id: `${normId}-r2`,
          roundIndex: 1,
          title: 'Round 2: Machine Coding & Object-Oriented Design (LLD)',
          roundType: 'LLD',
          interviewerName: 'Senior Principal Engineer',
          interviewerTitle: 'Domain Architecture Lead',
          focusDescription: 'SOLID principles, modular patterns, and thread-safe data modeling.',
          durationMinutes: 45
        },
        {
          id: `${normId}-r3`,
          roundIndex: 2,
          title: 'Round 3: High-Level Distributed Architecture (HLD)',
          roundType: 'HLD',
          interviewerName: 'Principal Systems Architect',
          interviewerTitle: 'Platform Infrastructure Lead',
          focusDescription: 'Distributed storage, caching layers, load balancing, and SPOF mitigation.',
          durationMinutes: 45
        },
        {
          id: `${normId}-r4`,
          roundIndex: 3,
          title: 'Round 4: Bar Raiser & Behavioral Leadership',
          roundType: 'Behavioral',
          interviewerName: 'Principal Bar Raiser',
          interviewerTitle: 'Engineering Director',
          focusDescription: 'STAR method situational responses, handling conflict, and culture alignment.',
          durationMinutes: 40
        }
      ];
  }
}

/**
 * Evaluates whether the candidate clears the round or is eliminated.
 * Elimination occurs on:
 * - Score < 60
 * - Verdict of 'LEAN NO HIRE' or 'STRONG NO HIRE'
 */
export function evaluateRoundElimination(scorecard: InterviewScorecard): { passed: boolean; reason: string } {
  const verdict = scorecard.hiringVerdict || scorecard.hiringDecision || 'LEAN NO HIRE';
  const score = scorecard.overallScore || 0;

  if (verdict === 'STRONG NO HIRE') {
    return {
      passed: false,
      reason: `Eliminated: Strong No Hire verdict (${score}/100). The candidate did not meet foundational competencies for this round.`
    };
  }

  if (verdict === 'LEAN NO HIRE') {
    return {
      passed: false,
      reason: `Eliminated: Lean No Hire verdict (${score}/100). The candidate exhibited substantial architectural or algorithmic gaps below the hiring bar.`
    };
  }

  if (score < 60) {
    return {
      passed: false,
      reason: `Eliminated: Overall score (${score}/100) is below the minimum passing threshold (60/100).`
    };
  }

  return {
    passed: true,
    reason: `Cleared: Achieved ${verdict} verdict with ${score}/100. Advanced to the next interview round!`
  };
}

/**
 * Computes benchmark compensation bands based on company and level
 */
export function getCalibratedCompensation(company: string, level: SdeLevel): CompensationBand {
  const normLevel = level || 'SDE-2';

  if (normLevel === 'SDE-1') {
    return {
      baseSalary: '$140,000 - $160,000',
      rsuEquity: '$75,000 (over 4 yrs)',
      signOnBonus: '$20,000',
      totalFirstYear: '$178,750 / yr'
    };
  }

  if (normLevel === 'SDE-3') {
    return {
      baseSalary: '$230,000 - $270,000',
      rsuEquity: '$240,000 (over 4 yrs)',
      signOnBonus: '$50,000',
      totalFirstYear: '$350,000 / yr'
    };
  }

  // SDE-2 Default
  return {
    baseSalary: '$185,000 - $210,000',
    rsuEquity: '$140,000 (over 4 yrs)',
    signOnBonus: '$35,000',
    totalFirstYear: '$255,000 / yr'
  };
}

/**
 * Synthesizes the final FAANG hiring committee offer packet after all rounds are cleared.
 */
export function generateFinalOfferPacket(
  completedRounds: CompletedRoundRecord[],
  companyName: string,
  level: SdeLevel
): OfferPacket {
  const totalScore = completedRounds.reduce((acc, r) => acc + (r.scorecard.overallScore || 0), 0);
  const averageScore = Math.round(totalScore / (completedRounds.length || 1));

  // Compute composite percentile
  const totalPercentile = completedRounds.reduce((acc, r) => acc + (r.scorecard.percentileRank || 50), 0);
  const compositePercentile = Math.min(99, Math.round(totalPercentile / (completedRounds.length || 1)));

  const compensation = getCalibratedCompensation(companyName, level);

  const levelTitleMap: Record<string, Record<SdeLevel, string>> = {
    Google: { 'SDE-1': 'Software Engineer II (L3)', 'SDE-2': 'Software Engineer III (L4)', 'SDE-3': 'Senior Software Engineer (L5)' },
    Amazon: { 'SDE-1': 'Software Development Engineer I (L4)', 'SDE-2': 'Software Development Engineer II (L5)', 'SDE-3': 'Software Development Engineer III (L6)' },
    Meta: { 'SDE-1': 'Software Engineer (E3)', 'SDE-2': 'Software Engineer (E4)', 'SDE-3': 'Senior Software Engineer (E5)' },
    Microsoft: { 'SDE-1': 'Software Engineer (Level 59-60)', 'SDE-2': 'Software Engineer II (Level 61-62)', 'SDE-3': 'Senior Software Engineer (Level 63-64)' }
  };

  const calibratedJobTitle = levelTitleMap[companyName]?.[level] || `${companyName} ${level} Engineer`;

  const hiringVerdict = averageScore >= 85 ? 'STRONG HIRE' : 'OFFER EXTENDED';

  const committeeSummary = `The ${companyName} Hiring Committee has officially concluded evaluation for ${calibratedJobTitle}. Across all ${completedRounds.length} virtual onsite rounds (including DSA Coding, Machine Coding / LLD, Distributed Systems HLD, and Bar Raiser Behavioral), the candidate demonstrated exemplary problem solving, optimal Big-O algorithmic rigor, modular domain architecture, and cultural alignment. Final Verdict: ${hiringVerdict} (${averageScore}/100, ${compositePercentile}th percentile). An official offer of employment is hereby extended.`;

  return {
    company: companyName,
    level,
    calibratedJobTitle,
    verdict: hiringVerdict,
    overallScore: averageScore,
    compositePercentile,
    compensation,
    hiringCommitteeSummary: committeeSummary,
    roundResults: completedRounds,
    createdAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  };
}
