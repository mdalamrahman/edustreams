import { BookChapter } from './ddiaTypes';

export const CHAPTER_4: BookChapter = {
  id: 'chapter-4',
  number: 4,
  title: 'Encoding and Evolution',
  partId: 'part-1',
  partTitle: 'Part I. Foundations of Data Systems',
  pageRange: 'pp. 107 - 144',
  epigraph: {
    quote: 'Everything changes and nothing stands still.',
    author: 'Heraclitus of Ephesus, As quoted by Plato in Cratylus (360 BC)'
  },
  sections: [
    {
      id: 'ch4-formats-and-compatibility',
      title: 'Formats for Encoding Data and Compatibility',
      level: 2,
      content: [
        'Applications inevitably change over time. Features are added or modified as new products are launched, user requirements become better understood, or business circumstances change.',
        'In large applications, code changes cannot happen instantaneously: with rolling upgrades, newer and older code coexist. In order for the system to continue running smoothly, we need to maintain compatibility in both directions:',
        '• Backward compatibility: Newer code can read data that was written by older code.',
        '• Forward compatibility: Older code can read data that was written by newer code.',
        'Programs work with data in two representations: in-memory objects (optimized for CPU access via pointers), and byte sequences (for disk storage or network transfer). Translating from memory to bytes is encoding (serialization, marshalling); the reverse is decoding (deserialization, unmarshalling).',
        'Language-specific formats (Java Serializable, Python pickle, Ruby Marshal) are tied to a specific language, have security vulnerabilities allowing remote code execution, and neglect schema evolution.',
        'JSON, XML and CSV are textual and widely supported, but have subtle problems: ambiguity with numbers > 2^53 (Twitter tweet IDs had to be sent as strings in JSON), lack of binary string support, and bulky wire representation.'
      ],
      keyConcept: {
        title: 'Forward vs Backward Compatibility',
        takeaway: 'Backward: new code reads old data. Forward: old code can gracefully handle new data by ignoring unknown fields without crashing.',
        interviewTip: 'Crucial for zero-downtime rolling upgrades in microservice architectures.'
      }
    },
    {
      id: 'ch4-binary-encodings-thrift-protobuf-avro',
      title: 'Binary Encodings: MessagePack, Thrift, Protocol Buffers, and Avro',
      level: 2,
      content: [
        'MessagePack: A binary encoding for JSON. In Example 4-1 ({userName: "Martin", favoriteNumber: 1337, interests: ["daydreaming", "hacking"]}), MessagePack takes 66 bytes (Figure 4-1), retaining all field name strings.',
        'Thrift and Protocol Buffers: Require a schema definition. Both use numeric field tags (1, 2, 3) instead of field names. Thrift BinaryProtocol takes 59 bytes (Figure 4-2), Thrift CompactProtocol packs tags and variable-length integers into 34 bytes (Figure 4-3), and Protocol Buffers fits the record in 33 bytes (Figure 4-4).',
        'Field tags and schema evolution: You can change the name of a field in the schema, since encoded data only refers to field tags. You cannot change a field\'s tag. New fields must be optional or have defaults so that backward compatibility is preserved.',
        'Apache Avro: Contains NO field tags or type indicators in the encoded data! The same record is just 32 bytes (Figure 4-5) — the most compact of all encodings.',
        'The Writer’s Schema and Reader’s Schema (Figure 4-6): When data is decoded, the Avro library matches fields by name using both schemas side-by-side, translating writer format into reader format. This makes Avro ideal for dynamic schemas dumped from relational databases or large files in Hadoop.'
      ],
      diagramId: 'fig-4-1-binary-encodings',
      codeSnippet: {
        language: 'protobuf',
        code: `message Person {\n  required string user_name = 1;\n  optional int64 favorite_number = 2;\n  repeated string interests = 3;\n}`,
        caption: 'Example Protocol Buffers Schema with Field Tags'
      },
      keyConcept: {
        title: 'Field Tags vs Schema Resolution',
        takeaway: 'Protobuf & Thrift use field tag numbers for schema evolution. Avro uses schema resolution comparing the writer’s schema with reader’s schema.',
        interviewTip: 'Know why Protobuf and gRPC dominate RPC, while Avro dominates Kafka event streaming and big data.'
      }
    },
    {
      id: 'ch4-modes-of-dataflow',
      title: 'Modes of Data Flow: Databases, REST/RPC, and Message-Passing',
      level: 2,
      content: [
        'Data Flow Through Databases: Data outlives code — data written 5 years ago in an old format may still be read by code today. When an older version updates data written by a newer version, care must be taken not to lose unknown fields (Figure 4-7).',
        'Data Flow Through Services: REST vs. RPC. REST builds upon HTTP principles (URLs, cache control, JSON). Remote Procedure Call (RPC) tries to make network requests look like local method calls (location transparency), but this is fundamentally flawed because network calls can timeout, fail, drop packets, or run with wildly variable latency.',
        'Modern RPC frameworks (gRPC with Protocol Buffers, Finagle, Rest.li) make the network explicit with futures, promises, and streaming.',
        'Message-Passing Data Flow: Asynchronous communication using message brokers (RabbitMQ, ActiveMQ, Kafka). Advantages over RPC: acts as a buffer during overload, redelivers messages to crashed consumers, decouples sender from recipient, and supports fan-out.'
      ],
      diagramId: 'fig-4-7-dataflow',
      keyConcept: {
        title: 'The Fallacy of Location Transparency in RPC',
        takeaway: 'A network request is fundamentally not a local function call: it has variable latency, packet drops, partial failures, timeouts, and requires idempotent retries.',
        interviewTip: 'When designing microservices, discuss why gRPC with timeouts, circuit breakers, and retries is necessary.'
      }
    }
  ],
  references: [
    { id: 16, text: "Protocol Buffers Developer Guide, Google Inc." },
    { id: 19, text: "Martin Kleppmann: 'Schema evolution in Avro, Protocol Buffers and Thrift,' 2012." },
    { id: 20, text: "Apache Avro 1.7.7 Documentation, avro.apache.org 2014." },
    { id: 41, text: "Andrew D Birrell and Bruce Jay Nelson: 'Implementing Remote Procedure Calls,' ACM TOCS 1984." }
  ]
};
