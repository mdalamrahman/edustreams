import { BookChapter } from './ddiaTypes';

export const CHAPTER_11: BookChapter = {
  id: 'chapter-11',
  number: 11,
  title: 'Stream Processing',
  partId: 'part-3',
  partTitle: 'Part III. Derived Data',
  pageRange: 'pp. 425 - 469',
  epigraph: {
    quote: 'A complex system that works is invariably found to have evolved from a simple system that works. The inverse proposition also appears to be true: A complex system designed from scratch never works and cannot be made to work.',
    author: 'John Gall, Systemantics (1975)'
  },
  sections: [
    {
      id: 'ch11-transmitting-event-streams',
      title: 'Transmitting Event Streams & Partitioned Logs (Kafka Model)',
      level: 2,
      content: [
        'In reality, a lot of data is unbounded because it arrives gradually over time: your users produced data yesterday and today, and they will continue to produce more data tomorrow. The problem with daily batch processes is that changes in input are only reflected in output a day later. Stream processing processes events continuously as they happen.',
        'An event is a small, self-contained, immutable object containing details of something that happened at some point in time with a timestamp.',
        'Traditional Message Brokers (JMS/AMQP, RabbitMQ): The broker delivers messages and deletes them once acknowledged (Figure 11-1). If a consumer crashes, redelivery combined with load balancing causes messages to be reordered (Figure 11-2). Message brokers assume short queues and transient messaging.',
        'Log-Based Message Brokers (Kafka, Kinesis, DistributedLog): A hybrid combining durable append-only storage with low-latency pub-sub notifications. The log is partitioned across machines (Figure 11-3).',
        'Within each partition, the broker assigns a monotonically increasing sequence number, or offset. Messages are totally ordered within a partition. Consumers track their progress by checkpointing their offset.',
        'Replaying old messages: Consuming is read-only like reading a file. You can reset a consumer offset to yesterday to re-process events with updated code without destroying input data.'
      ],
      diagramId: 'fig-11-3-partitioned-log',
      keyConcept: {
        title: 'JMS/AMQP vs Log-Based Brokers (Kafka)',
        takeaway: 'Traditional brokers delete on ACK and allow out-of-order redelivery. Log brokers append to partitioned commit logs, storing events durably with consumer-tracked offsets.',
        interviewTip: 'Always cite consumer offsets and disk retention when explaining Kafka’s fault tolerance.'
      }
    },
    {
      id: 'ch11-databases-and-streams-cdc',
      title: 'Databases and Streams: Dual Writes vs. Change Data Capture (CDC) and Event Sourcing',
      level: 2,
      content: [
        'Keeping systems in sync: Web applications combine OLTP databases, caches, and search indexes. If application code writes to both explicitly (dual writes), race conditions lead to permanent inconsistency (Figure 11-4: Client 1 sets X=A and Client 2 sets X=B; the DB ends up with B while the search index ends up with A!).',
        'Change Data Capture (CDC, Figure 11-5): Makes the primary database the single leader. All writes are captured from the database replication log (e.g. MySQL binlog, PostgreSQL WAL via Debezium/Bottled Water) and streamed to Kafka. Derived data systems (Elasticsearch, Redis cache, Redshift warehouse) consume the change stream and apply updates in the exact same commit order.',
        'Log Compaction: Keeps the most recent update for each primary key and garbage-collects older values. Allows new consumers to rebuild a full database snapshot starting from offset 0.',
        'Event Sourcing (DDD): Stores application changes as an append-only log of immutable domain events (commands vs events). Events are business facts that cannot be rejected.',
        'State, Streams, and Immutability (Figure 11-6): Mutable state and an append-only log are two sides of the same coin: Application state is what you get when you integrate an event stream over time, and a change stream is what you get when you differentiate state by time!'
      ],
      diagramId: 'fig-11-4-dual-writes-vs-cdc',
      keyConcept: {
        title: 'The Calculus of Data (Figure 11-6)',
        takeaway: 'state(now) = ∫ stream(t) dt. Stream is the derivative of state; state is the integral of the stream. The truth is the log; databases are caches of the log.',
        interviewTip: 'Explaining the dual-write race condition and proposing CDC with Debezium/Kafka is the gold standard for high-level design interviews.'
      }
    },
    {
      id: 'ch11-stream-analytics-windowing',
      title: 'Stream Analytics, Reasoning About Time, and Windowing',
      level: 2,
      content: [
        'Complex Event Processing (CEP): Searching for event patterns in streams using continuous declarative queries (Esper).',
        'Stream Analytics & Windowing: Aggregating statistics over time intervals:',
        '• Tumbling Window: Fixed-length, non-overlapping (e.g. 10:00-10:01, 10:01-10:02).',
        '• Hopping Window: Fixed length with overlapping hops (e.g. 5-min window with 1-min hop).',
        '• Sliding Window: Covers events within a relative interval of each other (e.g. events within 5 minutes of each other).',
        '• Session Window: Variable duration grouping events per user until an inactivity gap occurs.',
        'Event Time vs. Processing Time (Figure 11-7): The Star Wars Analogy — Episode IV released in 1977, V in 1980, VI in 1983, then I in 1999, II in 2002, III in 2005. If you watch by release date (processing time), it conflicts with the narrative timeline (event time)! Windowing by processing time creates false traffic spikes during server restarts; stream processors must window by event timestamps.',
        'Handling stragglers: Using low watermarks to declare windows complete, or issuing window corrections.'
      ],
      diagramId: 'fig-11-7-windowing-time',
      keyConcept: {
        title: 'Event Time vs Processing Time',
        takeaway: 'Processing time windows break during network lag, GC pauses, or backlog catchups. Accurate analytics require event-time windowing with watermark thresholds.',
        interviewTip: 'Use Martin Kleppmann\'s Star Wars analogy when asked about out-of-order stream processing.'
      }
    },
    {
      id: 'ch11-stream-joins-fault-tolerance',
      title: 'Stream Joins and Fault Tolerance (Exactly-Once Processing)',
      level: 2,
      content: [
        'Three types of stream join:',
        '1. Stream-stream join (window join): Joining click events with search query events across a 1-hour session window.',
        '2. Stream-table join (stream enrichment): Joining an event stream with a local database cache kept updated via CDC.',
        '3. Table-table join (materialized view maintenance): Joining two changelogs (tweets stream and follows stream) to maintain Twitter user timelines.',
        'Fault Tolerance and Exactly-Once Semantics: In stream processing, jobs run indefinitely, so tasks cannot simply be restarted from the beginning.',
        'Microbatching (Spark Streaming) divides streams into 1-second mini-batches. Checkpointing (Apache Flink) injects state checkpoint barriers into the event stream.',
        'Idempotence: An operation that can be executed multiple times with the same effect (overwriting a key vs incrementing a counter). Piggybacking monotonic Kafka message offsets with database writes enables deterministic deduplication and true end-to-end exactly-once semantics [79].'
      ],
      diagramId: 'fig-11-5-stream-joins',
      keyConcept: {
        title: 'Exactly-Once Processing via Idempotence',
        takeaway: 'True end-to-end exactly-once processing requires either distributed atomic commit (2PC) or idempotent writes tagged with unique message offsets.',
        interviewTip: 'Clarify that "exactly-once" in distributed systems means "effectively-once processing through idempotent retries".'
      }
    }
  ],
  references: [
    { id: 1, text: "Tyler Akidau et al.: 'The Dataflow Model: A Practical Approach to Balancing Correctness, Latency, and Cost,' VLDB 2015." },
    { id: 16, text: "Jay Kreps, Neha Narkhede, and Jun Rao: 'Kafka: a Distributed Messaging System for Log Processing,' NetDB 2011." },
    { id: 22, text: "Jay Kreps: 'The Log: What every software engineer should know about real-time data’s unifying abstraction,' 2013." },
    { id: 26, text: "Martin Kleppmann: 'Bottled Water: Real-time integration of PostgreSQL and Kafka,' 2015." },
    { id: 47, text: "Pat Helland: 'Immutability Changes Everything,' CIDR 2015." },
    { id: 79, text: "Pat Helland: 'Idempotence is not a medical condition,' ACM Computing Surveys 2012." }
  ]
};
