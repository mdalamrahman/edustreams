import { BookChapter } from './ddiaTypes';

export const CHAPTER_9: BookChapter = {
  id: 'chapter-9',
  number: 9,
  title: 'Consistency and Consensus',
  partId: 'part-2',
  partTitle: 'Part II. Distributed Data',
  pageRange: 'pp. 311 - 376',
  epigraph: {
    quote: 'Is it better to be alive and wrong or right and dead?',
    author: 'Jay Kreps, A few notes on Kafka and Jepsen (2013)'
  },
  sections: [
    {
      id: 'ch9-linearizability',
      title: 'Linearizability: The Recency Guarantee & Linearizability vs. Serializability',
      level: 2,
      content: [
        'Linearizability (also known as atomic consistency or strong consistency): The basic idea is to make a system appear as if there was only a single copy of the data, and all operations on it are atomic. Linearizability is a recency guarantee.',
        'Figure 9-1: The non-linearizable sports website. Alice and Bob are sitting in the same room checking their phones for the World Cup final score. Alice sees the winner and exclaims it. Bob hits reload, but his request hits a lagging replica that says the game is still playing! Bob heard the real-life audio channel, creating a cross-channel causality violation.',
        'Figure 9-3: Once any one read has returned the new value, all following reads (on the same or other clients) must also return the new value. Figure 9-4 visualizes linearization points.',
        'Linearizability vs. Serializability: Often confused, but completely different!',
        '• Serializability: An isolation property of transactions that read/write multiple objects. Ensures transactions behave as if executed in some serial order.',
        '• Linearizability: A recency guarantee on reads and writes of a single object/register. Does not group operations into transactions.',
        '• Strict serializability combines both (achieved via 2PL or actual serial execution). Serializable snapshot isolation (SSI) is NOT linearizable by design (reads from consistent historical snapshot).',
        'Cross-channel timing dependencies (Figure 9-5): Web server uploads photo to S3 file storage and places message on queue for image resizer. If S3 is not linearizable, resizer fetches image from queue message before S3 replication finishes, causing permanent inconsistency!'
      ],
      diagramId: 'fig-9-1-linearizability',
      keyConcept: {
        title: 'Linearizability vs Serializability',
        takeaway: 'Serializability = Multi-object transaction isolation. Linearizability = Single-object recency guarantee. CAP theorem applies ONLY to linearizability!',
        interviewTip: 'Know that Spanner provides Strict Serializability by waiting out TrueTime confidence intervals.'
      }
    },
    {
      id: 'ch9-the-cap-theorem',
      title: 'The CAP Theorem & The Cost of Linearizability',
      level: 2,
      content: [
        'The Cost of Linearizability (Figure 9-7): If a network partition occurs between Datacenter 1 and Datacenter 2, a single-leader database cannot process linearizable writes in the follower datacenter. You must choose: either halt operations (sacrifice availability for consistency), or accept writes independently (sacrifice linearizability for availability).',
        'The CAP Theorem (Eric Brewer): Popularized as "Consistency, Availability, Partition Tolerance: pick 2 out of 3". This phrasing is misleading: network partitions are a fault of physical networks, not something you choose!',
        'A better phrasing of CAP is: Consistent or Available when Partitioned.',
        'Linearizability is slow: Attiya and Welch proved that the response time of linearizable operations is proportional to the uncertainty of network delays. Linearizability is slow all the time, not just during network splits.'
      ],
      diagramId: 'fig-9-7-cap-dilemma'
    },
    {
      id: 'ch9-ordering-lamport-total-order',
      title: 'Ordering Guarantees, Lamport Timestamps, and Total Order Broadcast',
      level: 2,
      content: [
        'Ordering and Causality: Causality defines a partial order (concurrent events are incomparable). Linearizability defines a total order (single straight timeline). Linearizability implies causality.',
        'Sequence number ordering: Non-causal sequence generators (odd/even counters, wall clocks, block allocators) fail to reflect causality.',
        'Lamport Timestamps (Figure 9-8): Leslie Lamport (1978). Each node keeps an operation counter. The timestamp is a pair: (counter, node ID). Every node passes its maximum seen counter on every message, advancing local counters on receipt. This guarantees total ordering consistent with causality!',
        'Timestamp ordering is not sufficient: To enforce uniqueness (e.g. usernames), you must know WHEN the order is finalized. You cannot know if another node concurrently generated a lower timestamp without querying all nodes.',
        'Total Order Broadcast (Atomic Broadcast): Requires: (1) Reliable delivery (no messages lost); (2) Totally ordered delivery (all nodes receive in identical order). Total order broadcast is equivalent to consensus!'
      ],
      diagramId: 'fig-9-8-lamport-timestamps',
      keyConcept: {
        title: 'Total Order Broadcast Equivalence to Consensus',
        takeaway: 'A linearizable compare-and-set register, total order broadcast, and consensus are mathematically reducible to one another.',
        interviewTip: 'ZooKeeper and etcd implement total order broadcast to provide linearizable atomic leases and locks.'
      }
    },
    {
      id: 'ch9-atomic-commit-2pc-consensus',
      title: 'Distributed Transactions, Two-Phase Commit (2PC), and Consensus',
      level: 2,
      content: [
        'Atomic Commit Problem: In distributed databases spanning multiple partitions, all nodes must either commit or abort together.',
        'Two-Phase Commit (2PC, Figure 9-9): A coordinator (transaction manager) coordinates participants:',
        '• Phase 1 (Prepare): Coordinator sends prepare request to all participants. Each participant writes data to disk, checks constraints, and votes "yes" or "no". By voting yes, a participant promises it will definitely commit if asked.',
        '• Phase 2 (Commit/Abort): If all voted yes, coordinator writes commit record to its disk log (the commit point) and sends commit to all. If any voted no or timed out, coordinator writes abort to log and sends abort.',
        'Coordinator Failure (Figure 9-10): If the coordinator crashes after participants vote "yes", participants are stuck in-doubt (uncertain). They hold database row locks indefinitely until the coordinator recovers and reads its disk log! Reboots do not clear 2PC locks. Heuristic decisions allow unilateral aborts, breaking atomicity.',
        'Fault-Tolerant Consensus Algorithms: Paxos, Raft, Viewstamped Replication (VSR), and Zab. Unlike 2PC which requires 100% agreement, consensus algorithms require only a strict majority quorum (e.g. 2 of 3, 3 of 5) and satisfy agreement, integrity, validity, and termination.',
        'Epoch numbering (term in Raft, ballot in Paxos) ensures that within each epoch, the leader is unique, preventing split-brain.'
      ],
      diagramId: 'fig-9-9-two-phase-commit',
      keyConcept: {
        title: '2PC vs Consensus (Raft/Paxos)',
        takeaway: '2PC requires 100% unanimous votes and blocks when the coordinator crashes. Consensus algorithms require a majority quorum (>50%) and automatically recover via leader elections.',
        interviewTip: 'Highlight the difference between 2PC (atomic commit) and 2PL (serializable isolation).'
      }
    }
  ],
  references: [
    { id: 6, text: "Maurice P Herlihy and Jeannette M Wing: 'Linearizability: A Correctness Condition for Concurrent Objects,' ACM TOPLAS 1990." },
    { id: 35, text: "Seth Gilbert and Nancy Lynch: 'Brewer’s Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services,' ACM SIGACT News 2002." },
    { id: 50, text: "Hagit Attiya and Jennifer L Welch: 'Sequential Consistency versus Linearizability,' ACM TOCS 1994." },
    { id: 59, text: "Leslie Lamport: 'Time, Clocks, and the Ordering of Events in a Distributed System,' CACM 1978." },
    { id: 73, text: "Michael J Fischer, Nancy Lynch, and Michael S Paterson: 'Impossibility of Distributed Consensus with One Faulty Process (FLP),' JACM 1985." },
    { id: 101, text: "Diego Ongaro and John K Ousterhout: 'In Search of an Understandable Consensus Algorithm (Raft),' USENIX ATC 2014." }
  ]
};
