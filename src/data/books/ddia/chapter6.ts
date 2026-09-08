import { BookChapter } from './ddiaTypes';

export const CHAPTER_6: BookChapter = {
  id: 'chapter-6',
  number: 6,
  title: 'Partitioning',
  partId: 'part-2',
  partTitle: 'Part II. Distributed Data',
  pageRange: 'pp. 191 - 212',
  epigraph: {
    quote: 'Clearly, we must break away from the sequential and not limit the computers. We must state definitions and provide for priorities and descriptions of data. We must state relationships, not procedures.',
    author: 'Grace Murray Hopper, Management and the Computer of the Future (1962)'
  },
  sections: [
    {
      id: 'ch6-partitioning-key-range-hash',
      title: 'Partitioning of Key-Value Data: Key Range vs. Hash Partitioning',
      level: 2,
      content: [
        'In Chapter 5 we discussed replication — having multiple copies of the same data on different nodes. For very large datasets, or very high query throughput, that is not sufficient: we also need to break the data up into partitions (also called shards in MongoDB, regions in HBase, tablets in BigTable, vnodes in Cassandra).',
        'Partitioning and replication: Copies of each partition are stored on multiple nodes for fault tolerance. Each node may act as leader for some partitions and follower for others (Figure 6-1).',
        'Our goal with partitioning is to spread data and query load evenly across nodes. If partitioning is unfair, we call it skewed; a partition with disproportionately high load is called a hot spot.',
        'Partitioning by Key Range: Assigning a continuous range of keys (min to max) to each partition, like the volumes of a paper encyclopedia (Figure 6-2). Enables efficient range scans, but can cause hot spots if keys are timestamps (e.g. all sensor writes for today hit today\'s partition).',
        'Partitioning by Hash of Key: Applying a 32-bit hash function (e.g. MD5 or Murmur3) to turn skewed strings into a uniformly distributed 32-bit number (Figure 6-3). Partitions are assigned ranges of hashes. Destroys the ordering of keys, making range queries inefficient (must scatter/gather across all partitions).',
        'Cassandra compound keys: The first column is hashed to determine the partition, while remaining columns act as a concatenated index sorted in SSTables.'
      ],
      diagramId: 'fig-6-3-hash-partitioning',
      keyConcept: {
        title: 'Key Range vs Hash Partitioning',
        takeaway: 'Key range preserves sort order (great for range scans, prone to timestamp hotspots). Hash partitioning guarantees uniform distribution (eliminates hotspots, ruins range scans).',
        interviewTip: 'Mention compound partition keys (e.g., tenant_id hashed + created_at sorted) as the optimal industry pattern.'
      }
    },
    {
      id: 'ch6-secondary-indexes',
      title: 'Partitioning and Secondary Indexes: Local vs. Global Index',
      level: 2,
      content: [
        'The situation becomes more complicated if secondary indexes are involved (searching for cars by color and make). There are two main approaches to partitioning a database with secondary indexes:',
        '1. Document-partitioned index (Local index, Figure 6-4): Each partition maintains its own secondary indexes, covering only documents within that partition. Writes only touch 1 partition. Reads require scatter/gather: querying all partitions in parallel and merging results, which is prone to tail latency amplification.',
        '2. Term-partitioned index (Global index, Figure 6-5): Construct a global index that covers data across all partitions, and partition that index itself by term (e.g. color:red on partition 0). Reads are fast (single partition request), but writes are slower and more complicated because updating 1 document may affect multiple partitions across different nodes asynchronously.'
      ],
      diagramId: 'fig-6-4-secondary-indexes',
      keyConcept: {
        title: 'Document-Partitioned (Local) vs Term-Partitioned (Global) Index',
        takeaway: 'Local index: Fast writes, slow scatter/gather reads. Global index: Fast point reads, slow cross-partition writes.',
        interviewTip: 'Elasticsearch and Solr use document-partitioned local indexes with scatter/gather.'
      }
    },
    {
      id: 'ch6-rebalancing-request-routing',
      title: 'Rebalancing Partitions & Request Routing',
      level: 2,
      content: [
        'Over time, throughput grows, data increases, and nodes fail. The process of moving data between nodes is called rebalancing.',
        'How NOT to do it: hash mod N. If the number of nodes N changes (e.g. 10 to 11), almost every single key must be moved to another node! This makes rebalancing excessively expensive.',
        'Fixed number of partitions (Figure 6-6): Create many more partitions than nodes (e.g. 1,000 partitions on 10 nodes). When a new node 4 is added, it steals a few partitions from every existing node. Keys never change partitions; only partition ownership moves.',
        'Dynamic partitioning: Partitions split when exceeding a size threshold (e.g. 10 GB in HBase) and merge when shrinking. Pre-splitting avoids an empty database having only 1 partition.',
        'Request routing (Figure 6-7): How does a client know which node owns key "foo"? Three approaches: (1) Round-robin to any node, which forwards to the owner; (2) Dedicated partition-aware routing tier; (3) Partition-aware client directly connecting to the target node.',
        'ZooKeeper (Figure 6-8) is commonly used to maintain the authoritative mapping of partitions to nodes, notifying routing tiers of topology changes.'
      ],
      diagramId: 'fig-6-6-rebalancing',
      keyConcept: {
        title: 'Fixed Partitions vs Consistent Hashing',
        takeaway: 'Fixed partitions (Riak, Cassandra, Elasticsearch) avoid hash mod N catastrophes by decoupling logical partition count from physical node count.',
        interviewTip: 'Describe how ZooKeeper or gossip protocols keep routing tiers in sync when nodes join or leave.'
      }
    }
  ],
  references: [
    { id: 1, text: "David J DeWitt and Jim N Gray: 'Parallel database systems: The future of high performance database systems,' CACM 1992." },
    { id: 6, text: "David Karger et al.: 'Consistent Hashing and Random Trees,' STOC 1997." },
    { id: 14, text: "Riak 1.4.8 Docs, Basho Technologies 2014." },
    { id: 28, text: "Kishore Gopalakrishna et al.: 'Untangling Cluster Management with Helix,' ACM SoCC 2012." }
  ]
};
