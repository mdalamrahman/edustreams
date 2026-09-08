import { BookChapter } from './ddiaTypes';

export const CHAPTER_10: BookChapter = {
  id: 'chapter-10',
  number: 10,
  title: 'Batch Processing',
  partId: 'part-3',
  partTitle: 'Part III. Derived Data',
  pageRange: 'pp. 377 - 424',
  epigraph: {
    quote: 'A system cannot be successful if it is too strongly influenced by a single person. Once the initial design is complete and fairly robust, the real test begins as people with many different viewpoints undertake their own experiments.',
    author: 'Donald Knuth'
  },
  sections: [
    {
      id: 'ch10-part3-intro-systems-of-record',
      title: 'Part III Intro: Systems of Record vs. Derived Data Systems',
      level: 2,
      content: [
        'In Part I and Part II, we assembled the considerations that go into a distributed database, assuming only one database in the application. In reality, large applications combine several datastores, caches, search indexes, and data warehouses.',
        'Systems of Record (Source of Truth): Holds the authoritative version of data. New data is first written here. Each fact is represented exactly once (normalized). Discrepancies default to the system of record.',
        'Derived Data Systems: The result of taking existing data from another system and transforming it (caches, search indexes, denormalized views, recommendations). If lost, derived data can be re-created by re-running the derivation process from the original source.',
        'Batch vs. Stream vs. Online Services:',
        '• Online services: Client sends request and waits for response. Metric: Response time / latency.',
        '• Batch processing (offline): Takes bounded input data, crunches it over minutes/days, writes output. Metric: Throughput.',
        '• Stream processing (near-real-time): Operates on unbounded event streams shortly after arrival.'
      ],
      keyConcept: {
        title: 'System of Record vs Derived Data',
        takeaway: 'System of record = Authoritative ground truth. Derived data = Reproducible, denormalized read-optimized views (search indexes, caches).',
        interviewTip: 'Always frame search indexes (Elasticsearch) and caches (Redis) as derived views of your primary database.'
      }
    },
    {
      id: 'ch10-unix-philosophy-log-analysis',
      title: 'Batch Processing with Unix Tools and The Unix Philosophy',
      level: 2,
      content: [
        'Simple log analysis: Finding the 5 most popular pages on a web server using Unix pipes:',
        'cat /var/log/nginx/access.log | awk \'{print $7}\' | sort | uniq -c | sort -r -n | head -n 5',
        'Sorting vs. in-memory aggregation: A Ruby script uses an in-memory hash table. The Unix pipeline uses disk-based external mergesort (GNU sort spills to disk and multi-threads), seamlessly processing gigabytes without running out of RAM.',
        'The Unix Philosophy (Doug McIlroy 1964):',
        '1. Make each program do one thing well.',
        '2. Expect the output of every program to become the input to another, as yet unknown, program.',
        '3. Design and build software to be tried early.',
        '4. Use tools in preference to unskilled help.',
        'Uniform Interface: In Unix, the interface is a file descriptor (stream of bytes, newline-separated text). Pipes connect stdout to stdin with small memory buffers without writing intermediate streams to disk.',
        'Separation of logic and wiring: Programs do not hardcode file paths; shell users wire stdin/stdout arbitrarily.'
      ],
      codeSnippet: {
        language: 'bash',
        code: `cat /var/log/nginx/access.log |\n awk '{print $7}' |\n sort |\n uniq -c |\n sort -r -n |\n head -n 5`,
        caption: 'Top 5 requested URLs using standard Unix pipeline'
      }
    },
    {
      id: 'ch10-mapreduce-distributed-execution',
      title: 'MapReduce and Distributed Filesystems (HDFS)',
      level: 2,
      content: [
        'MapReduce is like Unix tools distributed across thousands of machines. It reads and writes to a distributed filesystem (HDFS / GFS).',
        'HDFS is based on shared-nothing commodity hardware. File blocks (typically 64 or 128 MB) are replicated across nodes. A central NameNode tracks block locations.',
        'MapReduce Execution Flow (Figure 10-1):',
        '1. Input is partitioned into file blocks, each processed by a mapper task.',
        '2. Mapper: Reads records and outputs key-value pairs. Putting computation near data: mappers run on the machines storing the input replica, saving network transfer.',
        '3. Shuffle and Sort: Output is partitioned by hash(key) for reducers and sorted by key on mapper local disks.',
        '4. Reducer: Receives sorted key-value pairs and merges them, executing aggregation logic and writing final output to HDFS.',
        'Reduce-side joins (Figure 10-2, 10-3): Joining activity events with a user database. Mappers tag records with user ID. The shuffle phase groups them together so the reducer receives the user profile followed by all click events for that user (secondary sort).',
        'Skew joins (sharded joins): Linchpin objects (celebrities with millions of followers) are handled by sending celebrity records to random reducers to prevent straggler tasks from stalling the job.'
      ],
      diagramId: 'fig-10-1-mapreduce-dataflow',
      keyConcept: {
        title: 'MapReduce Shuffle and Sort (Figure 10-1)',
        takeaway: 'The magic of MapReduce lies in the implicit sort phase between Map and Reduce: all values for a key arrive sequentially at the reducer.',
        interviewTip: 'Explain how map-side joins (broadcast hash joins) avoid the expensive shuffle stage when one dataset is small enough to fit in memory.'
      }
    },
    {
      id: 'ch10-beyond-mapreduce-dataflow',
      title: 'Beyond MapReduce: Dataflow Engines (Spark, Flink, Tez) and Graph Processing (Pregel)',
      level: 2,
      content: [
        'Problems with MapReduce: It fully materializes intermediate state to HDFS between every step. If a workflow has 50 jobs, each job writes and replicates intermediate files to disk, creating massive I/O overhead and straggler delays.',
        'Dataflow Engines (Spark, Flink, Tez): Model the entire workflow as a Directed Acyclic Graph (DAG) of operators. Intermediate state is kept in memory or pipelined over network buffers without writing to HDFS.',
        'Fault Tolerance via Recomputation: Spark uses Resilient Distributed Datasets (RDDs) to track data lineage. If a worker fails, only the lost partition is recomputed from upstream operators (requiring deterministic operators).',
        'Bulk Synchronous Parallel (Pregel Model) [72]: For iterative graph algorithms (PageRank). Vertices act like actors that send messages to other vertices along graph edges in synchronized rounds, checkpointing state across iterations.'
      ],
      diagramId: 'fig-10-3-dataflow-join',
      keyConcept: {
        title: 'Materialization vs Pipelined Dataflow',
        takeaway: 'MapReduce writes every intermediate step to HDFS. Modern engines (Spark, Flink) stream intermediate data in memory via DAGs, recomputing partitions on failure using lineage (RDDs).',
        interviewTip: 'Compare MapReduce vs Spark: Spark is up to 100x faster due to in-memory caching and pipelined DAG execution.'
      }
    }
  ],
  references: [
    { id: 1, text: "Jeffrey Dean and Sanjay Ghemawat: 'MapReduce: Simplified Data Processing on Large Clusters,' OSDI 2004." },
    { id: 19, text: "Sanjay Ghemawat, Howard Gobioff, and Shun-Tak Leung: 'The Google File System (GFS),' SOSP 2003." },
    { id: 61, text: "Matei Zaharia et al.: 'Resilient Distributed Datasets (RDDs): A Fault-Tolerant Abstraction for In-Memory Cluster Computing,' NSDI 2012." },
    { id: 72, text: "Grzegorz Malewicz et al.: 'Pregel: A System for Large-Scale Graph Processing,' ACM SIGMOD 2010." }
  ]
};
