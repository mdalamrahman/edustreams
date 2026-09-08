import { BookChapter } from './ddiaTypes';

export const CHAPTER_7: BookChapter = {
  id: 'chapter-7',
  number: 7,
  title: 'Transactions',
  partId: 'part-2',
  partTitle: 'Part II. Distributed Data',
  pageRange: 'pp. 213 - 264',
  epigraph: {
    quote: 'Some authors have claimed that general two-phase commit is too expensive to support, because of the performance or availability problems that it brings. We believe it is better to have application programmers deal with performance problems due to overuse of transactions as bottlenecks arise, rather than always coding around the lack of transactions.',
    author: 'James Corbett et al., Spanner: Google’s Globally-Distributed Database (2012)'
  },
  sections: [
    {
      id: 'ch7-meaning-of-acid',
      title: 'The Slippery Concept of a Transaction & The Meaning of ACID',
      level: 2,
      content: [
        'In the harsh reality of data systems, many things can go wrong: crashes, network interruptions, concurrent overwrites, partial updates, and race conditions.',
        'A transaction is a way for an application to group several reads and writes together into a logical unit. Conceptually, all reads and writes in a transaction are executed as one operation: either the entire transaction succeeds (commit) or it fails (abort, rollback). If it fails, the application can safely retry.',
        'The Meaning of ACID:',
        '• Atomicity: Not about concurrency, but about abortability. If an error occurs halfway through a sequence of writes, the transaction is aborted and the database discards or undoes any writes made so far (all-or-nothing guarantee).',
        '• Consistency: An application-specific notion of invariants (e.g. credits and debits must balance). Joe Hellerstein remarked that the C in ACID was “tossed in to make the acronym work”. Atomicity, isolation and durability are properties of the database, whereas consistency is a property of the application.',
        '• Isolation: Concurrently executing transactions cannot step on each other\'s toes. The classic definition is serializability: transactions behave as if run serially.',
        '• Durability: Once a transaction has committed successfully, any data it has written will not be forgotten, even if hardware crashes.'
      ],
      keyConcept: {
        title: 'ACID Dissected',
        takeaway: 'Atomicity = Abortability on fault; Consistency = Application invariants; Isolation = Concurrency isolation; Durability = Crash-resilient storage.',
        interviewTip: 'Clarify that "Consistency" in ACID is completely different from consistency in CAP or replica consistency.'
      }
    },
    {
      id: 'ch7-weak-isolation-levels',
      title: 'Weak Isolation Levels: Read Committed, Snapshot Isolation (MVCC), and Race Conditions',
      level: 2,
      content: [
        'Serializable isolation has a severe performance penalty, so systems use weaker isolation levels that protect against some race conditions but not all.',
        'Read Committed: Makes two guarantees: (1) No dirty reads (readers only see committed data, Figure 7-4); (2) No dirty writes (writers only overwrite committed data, Figure 7-5). Implemented using row-level write locks and remembering old committed values for readers.',
        'Snapshot Isolation & MVCC (Figure 7-6, 7-7): Read committed allows read skew (non-repeatable reads, where Alice sees $500 in account 1 and $400 in account 2 because of a concurrent transfer). Snapshot isolation solves this: each transaction reads from a consistent snapshot frozen in time.',
        'Key principle: Readers never block writers, and writers never block readers.',
        'Implementation in PostgreSQL: Multiversion concurrency control (MVCC). Every transaction gets a monotonic txid. Rows have created_by and deleted_by txid fields. Deleted rows are kept until garbage collection (vacuum) removes them.',
        'Visibility rules: A transaction cannot see writes made by transactions that were in-progress or started after it, nor aborted transactions.'
      ],
      diagramId: 'fig-7-7-mvcc',
      keyConcept: {
        title: 'Snapshot Isolation & MVCC (Figure 7-7)',
        takeaway: 'MVCC tracks row versions via transaction IDs. Readers observe a point-in-time snapshot without acquiring read locks, completely eliminating read/write lock contention.',
        interviewTip: 'Snapshot isolation is called "repeatable read" in Postgres and MySQL, and "serializable" in Oracle 11g.'
      }
    },
    {
      id: 'ch7-lost-updates-write-skew',
      title: 'Preventing Lost Updates, Write Skew, and Phantoms',
      level: 2,
      content: [
        'Lost updates (Figure 7-1): Occurs in read-modify-write cycles (incrementing counters, editing wiki pages). Solutions: atomic write operations (UPDATE counters SET val = val + 1), explicit locking (SELECT FOR UPDATE, Example 7-1), automated lost update detection, and compare-and-set.',
        'Write skew (Figure 7-8): A subtle generalization of lost update. Example: Hospital on-call shifts. Alice and Bob are both on call; both concurrently request leave. Both transactions check: COUNT(*) WHERE on_call = true. Both see 2 doctors, so both set their own status to false and commit. Now ZERO doctors are on call! Snapshot isolation DOES NOT detect write skew.',
        'Phantoms causing write skew: In the doctors case, locking rows works because the rows already existed. But in meeting room booking (Example 7-2), claiming a username, or double-spending, the query checks for the ABSENCE of conflicting rows, so SELECT FOR UPDATE has no rows to attach locks to! A write in one transaction changing the result of a search query in another is called a phantom.',
        'Materializing conflicts: Artificially inserting lock objects (e.g. empty room/time slots) into the schema to attach locks. Clunky and error-prone.'
      ],
      diagramId: 'fig-7-8-write-skew',
      codeSnippet: {
        language: 'sql',
        code: `BEGIN TRANSACTION;\nSELECT COUNT(*) FROM bookings\n WHERE room_id = 123 AND end_time > '2015-01-01 12:00' AND start_time < '2015-01-01 13:00';\n-- If zero returned, insert booking:\nINSERT INTO bookings (room_id, start_time, end_time, user_id)\n VALUES (123, '2015-01-01 12:00', '2015-01-01 13:00', 666);\nCOMMIT;`,
        caption: 'Example 7-2. Meeting room booking phantom vulnerability under snapshot isolation'
      },
      keyConcept: {
        title: 'Write Skew and Phantoms',
        takeaway: 'Write skew happens when transactions read a premise, make a decision, and write to different records. When the premise checks for non-existence, it is a phantom.',
        interviewTip: 'The "Two Doctors on Call" bug is the quintessential whiteboard example of write skew.'
      }
    },
    {
      id: 'ch7-serializability-2pl-ssi',
      title: 'True Serializability: Actual Serial Execution, 2PL, and SSI',
      level: 2,
      content: [
        'Serializable isolation prevents all race conditions. Three main implementations exist:',
        '1. Actual Serial Execution (VoltDB, Redis, Datomic): Execute only one transaction at a time on a single CPU thread. Feasible only because RAM is cheap enough to hold data (no disk I/O waits) and transactions are submitted as stored procedures (Figure 7-9) to avoid interactive network round-trips.',
        '2. Two-Phase Locking (2PL): For 30 years the primary algorithm. Writers block writers AND readers; readers block writers. Uses shared and exclusive locks held until commit/abort (phase 1: acquire, phase 2: release). Subject to severe latency instability and frequent deadlocks. Solves phantoms via index-range locks.',
        '3. Serializable Snapshot Isolation (SSI, Cahill 2008): An optimistic concurrency control algorithm. Transactions read from MVCC snapshots without blocking. The database tracks serialization conflicts using two mechanisms: (a) Detecting stale MVCC reads (Figure 7-10); (b) Detecting writes that affect prior reads using non-blocking index tripwires (Figure 7-11). If a conflict occurred, the transaction aborts on commit.'
      ],
      diagramId: 'fig-7-11-ssi-tripwire',
      keyConcept: {
        title: 'Serializable Snapshot Isolation (SSI)',
        takeaway: 'SSI achieves full serializability without the massive locking overhead of 2PL by treating index locks as non-blocking tripwires and aborting conflicting transactions on commit.',
        interviewTip: 'Postgres uses SSI for its serializable isolation level since version 9.1.'
      }
    }
  ],
  references: [
    { id: 2, text: "Jim N Gray et al.: 'Granularity of Locks and Degrees of Consistency in a Shared Data Base,' IFIP 1976." },
    { id: 7, text: "Theo Härder and Andreas Reuter: 'Principles of Transaction-Oriented Database Recovery,' ACM Computing Surveys 1983." },
    { id: 27, text: "Hal Berenson et al.: 'A Critique of ANSI SQL Isolation Levels,' ACM SIGMOD 1995." },
    { id: 39, text: "Michael J Cahill, Uwe Röhm, and Alan Fekete: 'Serializable Isolation for Snapshot Databases,' ACM SIGMOD 2008." }
  ]
};
