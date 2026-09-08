import { BookChapter } from './ddiaTypes';

export const CHAPTER_5: BookChapter = {
  id: 'chapter-5',
  number: 5,
  title: 'Replication',
  partId: 'part-2',
  partTitle: 'Part II. Distributed Data',
  pageRange: 'pp. 145 - 190',
  epigraph: {
    quote: 'The major difference between a thing that might go wrong and a thing that cannot possibly go wrong is that when a thing that cannot possibly go wrong goes wrong it usually turns out to be impossible to get at or repair.',
    author: 'Douglas Adams, Mostly Harmless (1992)'
  },
  sections: [
    {
      id: 'ch5-part2-intro-leaders-followers',
      title: 'Part II Intro & Leaders and Followers (Master-Slave Replication)',
      level: 2,
      content: [
        'Part II Intro: For a successful technology, reality must take precedence over public relations, for nature cannot be fooled (Richard Feynman). In Part II we move from data stored on one machine to data distributed across multiple machines. Shared-nothing architectures have gained popularity where each node uses its CPU, RAM, and disks independently, communicating over a conventional network. Replication (keeping copies of the same data on multiple nodes) and Partitioning (sharding subsets across nodes) often go hand in hand (Figure II-1).',
        'Replication means keeping a copy of the same data on multiple machines connected via a network. Reasons: high availability, latency reduction (closer to users), and scaling read throughput.',
        'Leaders and Followers (Figure 5-1): One replica is designated the leader (master/primary). Clients send write requests to the leader, which writes new data to local storage and sends changes to followers via a replication log or change stream. Followers apply writes in the same order. Reads can go to the leader or any follower; writes only go to the leader.',
        'Synchronous vs. Asynchronous Replication (Figure 5-2): In synchronous replication, the leader waits for follower acknowledgment before confirming success to the client (guarantees up-to-date data, but stalls if the follower crashes). In asynchronous replication, the leader confirms immediately (high availability and write performance, but risk of losing un-replicated writes if the leader fails). Semi-synchronous configuration makes one follower synchronous and others asynchronous.'
      ],
      diagramId: 'fig-5-2-replication-sync-async',
      keyConcept: {
        title: 'Synchronous vs Asynchronous Replication',
        takeaway: 'Synchronous replication trades write latency and availability for strong durability. Semi-synchronous balances both with 1 synchronous replica.',
        interviewTip: 'Always mention semi-synchronous replication when discussing MySQL/Postgres high availability.'
      }
    },
    {
      id: 'ch5-handling-outages-replication-lag',
      title: 'Handling Node Outages & Problems with Replication Lag',
      level: 2,
      content: [
        'Follower failure: Catch-up recovery from replication log sequence numbers.',
        'Leader failure: Failover promotes a follower to leader, reconfiguring clients and remaining followers. Failover pitfalls include: un-replicated writes being discarded, primary key collisions in secondary datastores (e.g. GitHub incident with MySQL and Redis [9]), split-brain (two nodes both believing they are leader, risking silent corruption), and premature failovers caused by network spikes.',
        'Problems With Replication Lag (Eventual Consistency): When read queries are distributed across asynchronous followers, replication lag introduces severe anomalies:',
        '1. Reading your own writes / Read-after-write consistency (Figure 5-3): A user submits data (e.g. comments or profile picture) and immediately views it. If routed to a lagging follower, it appears the data was lost! Solution: Read the user’s own editable data from the leader, or track write timestamps and route to replicas that have caught up.',
        '2. Monotonic reads (Figure 5-4): A user refreshes a page and sees time move backwards because the first read went to a fresh replica and the second to a lagging replica (e.g. comment appears, then vanishes). Guarantee: Monotonic reads ensures a user will not read older data after previously reading newer data (e.g. hash user ID to replica).',
        '3. Consistent prefix reads (Figure 5-5): In partitioned databases, if some partitions replicate slower than others, causality is violated — an observer sees Mrs. Cake’s answer ("About ten seconds usually") before seeing Mr. Poons’ question ("How far into the future can you see?")!'
      ],
      diagramId: 'fig-5-3-replication-lag-anomalies',
      keyConcept: {
        title: 'Three Replication Lag Anomalies',
        takeaway: 'Read-your-own-writes (user sees own writes), Monotonic reads (time doesn\'t go backwards), Consistent prefix reads (causal ordering preserved).',
        interviewTip: 'Reciting the "Mr. Poons and Mrs. Cake" causality dialogue instantly proves deep distributed systems expertise.'
      }
    },
    {
      id: 'ch5-multi-leader-replication',
      title: 'Multi-Leader Replication and Write Conflicts',
      level: 2,
      content: [
        'Multi-leader replication allows more than one node to accept writes (Figure 5-6). Useful in multi-datacenter deployments, clients with offline operation (mobile calendar sync), and collaborative real-time editing (Google Docs).',
        'Handling write conflicts: The biggest problem is concurrent write conflicts (Figure 5-7: User 1 updates title to B, User 2 updates to C concurrently). Both writes succeed locally, but clash asynchronously.',
        'Conflict resolution approaches: Conflict avoidance (route all writes for a record to 1 datacenter); Convergent conflict resolution (Last Write Wins / LWW, UUID ordering, merging values); Automatic conflict resolution (Conflict-Free Replicated Data Types / CRDTs, Operational Transformation).',
        'Multi-leader topologies (Figure 5-8): Circular, Star, and All-to-all. In all-to-all, network delays can cause dependent updates to arrive before the preceding insert (Figure 5-9), requiring version vectors to detect causality.'
      ],
      diagramId: 'fig-5-7-write-conflicts'
    },
    {
      id: 'ch5-leaderless-replication-quorums',
      title: 'Leaderless Replication: Quorums ($w + r > n$) and Detecting Concurrent Writes',
      level: 2,
      content: [
        'Leaderless replication (Dynamo-style, Cassandra, Riak): Any replica can accept writes directly. There is no failover (Figure 5-10). When a node is down, clients write to available nodes.',
        'Read repair and Anti-entropy: When reading from multiple nodes in parallel, if a client spots a stale value (e.g. version 6 vs version 7), it writes the newer version back to the stale node (read repair). Background anti-entropy processes continuously sync differences.',
        'Quorums for reading and writing: If there are n replicas, every write must be confirmed by w nodes, and every read must query r nodes. As long as w + r > n, the read set and write set must overlap, guaranteeing an up-to-date value (Figure 5-11). Typical configuration: n = 3, w = 2, r = 2, or n = 5, w = 3, r = 3.',
        'Sloppy quorums and hinted handoff: If network partitions isolate nodes, writes are accepted by temporary alternate nodes (couch-surfing analogy) and handed off once connectivity restores.',
        'Detecting concurrent writes (Figure 5-12, 5-13, 5-14): Operations are concurrent if neither "happened before" the other. In shopping cart editing, concurrent writes produce siblings (e.g. [milk, flour] and [eggs, milk, ham]). Version vectors track causality per replica without relying on physical clocks.'
      ],
      diagramId: 'fig-5-11-quorum-calculator',
      keyConcept: {
        title: 'The Quorum Condition (w + r > n)',
        takeaway: 'If w + r > n, at least one node in the read quorum witnessed the latest write from the write quorum. Sloppy quorums sacrifice consistency for write availability.',
        interviewTip: 'Explain why LWW (Last Write Wins) causes silent data loss and how version vectors solve it.'
      }
    }
  ],
  references: [
    { id: 9, text: "Jesse Newland: 'GitHub availability this week,' github.com, 2012." },
    { id: 18, text: "Werner Vogels: 'Eventually Consistent,' ACM Queue 2008." },
    { id: 20, text: "Douglas B Terry et al.: 'Session Guarantees for Weakly Consistent Replicated Data,' PDIS 1994." },
    { id: 32, text: "Giuseppe DeCandia et al.: 'Dynamo: Amazon’s Highly Available Key-Value Store,' SOSP 2007." },
    { id: 33, text: "Marc Shapiro et al.: 'A comprehensive study of Convergent and Commutative Replicated Data Types (CRDTs),' INRIA 2011." },
    { id: 51, text: "D Stott Parker Jr et al.: 'Detection of Mutual Inconsistency in Distributed Systems,' IEEE TSE 1983." }
  ]
};
