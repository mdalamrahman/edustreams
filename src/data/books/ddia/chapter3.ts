import { BookChapter } from './ddiaTypes';

export const CHAPTER_3: BookChapter = {
  id: 'chapter-3',
  number: 3,
  title: 'Storage and Retrieval',
  partId: 'part-1',
  partTitle: 'Part I. Foundations of Data Systems',
  pageRange: 'pp. 67 - 106',
  epigraph: {
    quote: 'Wer Ordnung hält, ist nur zu faul zum Suchen. (If you keep things tidily ordered, you’re just too lazy to go searching.)',
    author: 'German proverb'
  },
  sections: [
    {
      id: 'ch3-simplest-database',
      title: 'Data Structures that Power Your Database: Hash Indexes & Compaction',
      level: 2,
      content: [
        'On the most fundamental level, a database needs to do two things: when you give it some data, it should store the data — and when you ask it again later, it should give the data back to you.',
        'Consider the world’s simplest database, implemented as two Bash functions:',
        'db_set () { echo "$1,$2" >> database; }',
        'db_get () { grep "^$1," database | sed -e "s/^$1,//" | tail -n 1; }',
        'Our db_set function actually has pretty good performance for something that is so simple, because appending to a file is generally very efficient. Many databases internally use a log, an append-only data file. On the other hand, our db_get function has terrible performance: O(n) scan of the entire database.',
        'Hash indexes: Keep an in-memory hash map where every key is mapped to a byte offset in the data file (Figure 3-1). This is essentially what Bitcask (Riak) does. Bitcask offers high-performance reads and writes, subject to the requirement that all keys fit in RAM.',
        'Compaction and Segment Merging: To avoid running out of disk space, break the log into segments of a certain size and perform compaction (Figure 3-2), throwing away duplicate keys and keeping only the most recent update for each key. Segments are merged in background threads (Figure 3-3).'
      ],
      diagramId: 'fig-3-1-hash-index',
      codeSnippet: {
        language: 'bash',
        code: `#!/bin/bash\ndb_set () {\n  echo "$1,$2" >> database\n}\ndb_get () {\n  grep "^$1," database | sed -e "s/^$1,//" | tail -n 1\n}`,
        caption: 'World’s simplest key-value database in Bash'
      },
      keyConcept: {
        title: 'Append-Only Log + In-Memory Hash Map',
        takeaway: 'Sequential appends maximize write throughput. Compaction merges immutable segment files in the background while reads continue uninterrupted.',
        interviewTip: 'Mention Bitcask when asked how to design a high-throughput key-value store with fixed key sets.'
      }
    },
    {
      id: 'ch3-sstables-lsm-trees',
      title: 'SSTables and LSM-Trees',
      level: 2,
      content: [
        'Now we can make a simple change to the format of our segment files: we require that the sequence of key-value pairs is sorted by key. We call this format Sorted String Table, or SSTable for short.',
        'SSTables have several big advantages over log segments with hash indexes:',
        '1. Merging segments is simple and efficient, even if files exceed available memory: using a mergesort algorithm (Figure 3-4), reading input files side-by-side and copying the lowest key.',
        '2. In order to find a particular key in the file, you no longer need to keep an index of all keys in memory: a sparse in-memory index is sufficient (Figure 3-5), jumping to the nearest boundary and scanning a few kilobytes.',
        '3. Records can be grouped into compressed blocks before writing to disk, reducing disk bandwidth.',
        'Maintaining sorted order in memory: Incoming writes are added to an in-memory balanced tree (Red-Black tree or AVL tree), known as a memtable. When the memtable exceeds a threshold (a few MBs), it is written to disk as a new SSTable segment. To prevent data loss on crash, an append-only write-ahead log (WAL) is kept.',
        'This structure was described by Patrick O’Neil under the name Log-Structured Merge-Tree (LSM-Tree) [10]. LevelDB, RocksDB, Cassandra, and HBase use this architecture. Lucene uses SSTable-like files for its term dictionary.'
      ],
      diagramId: 'fig-3-4-sstable-compaction',
      keyConcept: {
        title: 'LSM-Tree Core Workflow',
        takeaway: 'Writes hit MemTable (RAM) + WAL (Disk) -> Flush to SSTable -> Background Compaction merges sorted runs. Bloom filters avoid disk seeks for non-existent keys.',
        interviewTip: 'LSM-trees trade slower reads / compaction spikes for blistering sequential write speed.'
      }
    },
    {
      id: 'ch3-b-trees',
      title: 'B-Trees: The Ubiquitous Page-Oriented Index',
      level: 2,
      content: [
        'Introduced in 1970 [16] and called “ubiquitous” less than 10 years later [17], B-trees have stood the test of time very well. They remain the standard index implementation in almost all relational databases.',
        'B-trees break the database down into fixed-size blocks or pages, traditionally 4 kB in size, and read or write one page at a time. Each page can refer to another page address on disk (Figure 3-6).',
        'One page is designated as the root. Each page contains k keys and k+1 references to child pages. When updating an existing key, the leaf page is overwritten in-place. When adding a new key to a full page, it splits into two half-full pages and updates the parent (Figure 3-7). A B-tree with n keys always has a height of O(log n).',
        'Update-in-place vs. append-only: B-trees overwrite pages on disk, requiring a Write-Ahead Log (WAL / redo log) for crash recovery. Locks and latches protect against concurrency anomalies.',
        'Comparing B-trees to LSM-trees: LSM-trees sustain higher random write throughput because they turn random writes into sequential disk writes. B-trees are faster for reads and provide more predictable latency because each key exists in exactly one place in the tree.'
      ],
      diagramId: 'fig-3-6-btree',
      keyConcept: {
        title: 'B-Tree vs LSM-Tree Comparison',
        takeaway: 'B-Tree: Fixed 4KB pages, update in-place, WAL, O(log N) reads, predictable latency. LSM-Tree: Append-only memtable + SSTable compaction, high write throughput.',
        interviewTip: 'A common system design question: "When would you choose Cassandra/RocksDB (LSM) over Postgres/MySQL InnoDB (B-Tree)?"'
      }
    },
    {
      id: 'ch3-oltp-vs-olap-column-storage',
      title: 'OLTP vs. OLAP, Data Warehousing, and Column-Oriented Storage',
      level: 2,
      content: [
        'Transaction Processing or Analytics? In the early days, commercial transactions gave rise to Online Transaction Processing (OLTP): small numbers of records accessed by key with low latency. By contrast, Online Analytic Processing (OLAP) scans millions of rows calculating aggregates (SUM, COUNT, AVG) for business intelligence.',
        'Data Warehousing & ETL (Figure 3-8): OLTP systems power operational services. An Extract-Transform-Load (ETL) pipeline copies data into a dedicated data warehouse where analysts run complex queries without impacting OLTP databases.',
        'Stars and Snowflakes: Analytic schemas typically center around a fact table (e.g. fact_sales with millions of rows) surrounded by dimension tables (product, store, customer, date) like the rays of a star (Figure 3-9).',
        'Column-oriented storage: Fact tables may have 100+ columns, but queries only access 4-5. Storing each column in a separate file (Figure 3-10) avoids reading unnecessary attributes from disk.',
        'Column compression & Bitmap encoding: Repeating values in a column compress compactly with run-length encoding (Figure 3-11). Bitwise AND/OR operations enable vectorized SIMD execution in CPU L1 cache.',
        'Data cubes (OLAP cubes): Pre-aggregated grids along multiple dimensions (Figure 3-12) for instant reporting.'
      ],
      diagramId: 'fig-3-10-columnar',
      keyConcept: {
        title: 'Row-Oriented vs Column-Oriented Storage',
        takeaway: 'OLTP uses row storage (all columns of 1 row contiguous for rapid point writes/reads). OLAP uses columnar storage (all values of 1 column contiguous for hyper-fast aggregate scans & compression).',
        interviewTip: 'Use this to explain Parquet, ClickHouse, Redshift, and Snowflake architecture.'
      }
    }
  ],
  references: [
    { id: 3, text: "Justin Sheehy and David Smith: 'Bitcask: A Log-Structured Hash Table for Fast Key/Value Data,' Basho 2010." },
    { id: 10, text: "Patrick O’Neil et al.: 'The Log-Structured Merge-Tree (LSM-Tree),' Acta Informatica 1996." },
    { id: 16, text: "Rudolf Bayer and Edward M McCreight: 'Organization and Maintenance of Large Ordered Indices,' 1970." },
    { id: 17, text: "Douglas Comer: 'The Ubiquitous B-tree,' ACM Computing Surveys 1979." },
    { id: 48, text: "Ralph Kimball and Margy Ross: The Data Warehouse Toolkit, 3rd edition, Wiley 2013." }
  ]
};
