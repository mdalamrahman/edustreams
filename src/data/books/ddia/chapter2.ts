import { BookChapter } from './ddiaTypes';

export const CHAPTER_2: BookChapter = {
  id: 'chapter-2',
  number: 2,
  title: 'Data Models and Query Languages',
  partId: 'part-1',
  partTitle: 'Part I. Foundations of Data Systems',
  pageRange: 'pp. 25 - 66',
  epigraph: {
    quote: 'The limits of my language mean the limits of my world.',
    author: 'Ludwig Wittgenstein, Tractatus Logico-Philosophicus (1922)'
  },
  sections: [
    {
      id: 'ch2-layering-data-models',
      title: 'Layering Data Models',
      level: 2,
      content: [
        'Data models are perhaps the most important part of developing software, because they have such a profound effect: not only on how the software is written, but also how we think about the problem that we are solving.',
        'Most applications are built by layering one data model on top of another. For each layer, the key question is: how is it represented in terms of the next-lower layer? For example:',
        '1. As an application developer, you look at the real world (in which there are people, organizations, goods, actions, money flows, sensors, etc.) and model it in terms of objects or data structures, and APIs which manipulate those data structures. Those structures are often specific to your application.',
        '2. When you want to store those data structures, you express them in terms of a general-purpose data model, such as JSON or XML documents, tables in a relational database, or a graph model.',
        '3. The engineers who built your database software decided on a way of representing that JSON/XML/relational/graph data in terms of bytes in memory, on disk, or on a network. The representation may allow the data to be queried, searched, manipulated and processed in various ways.',
        '4. On yet lower levels, hardware engineers have figured out how to represent bytes in terms of electrical currents, pulses of light, magnetic fields, and more.',
        'In a complex application there may be more intermediary levels, such as APIs built upon APIs, but the basic idea is still the same: each layer hides the complexity of the layers below it by providing a clean data model. These abstractions allow different groups of people — for example, the engineers at the database vendor and the application developers using their database — to work together effectively.',
        'In this chapter, we will look at a range of general-purpose data models for data storage and querying. In particular, we will compare the relational model, the document model and a few graph-based data models.'
      ]
    },
    {
      id: 'ch2-relational-vs-document',
      title: 'Relational Model vs. Document Model & The Object-Relational Mismatch',
      level: 2,
      content: [
        'The best-known data model today is probably that of SQL, based on the relational model proposed by Edgar Codd in 1970 [1]: data is organized into relations (in SQL: tables), where each relation is an unordered collection of tuples (rows).',
        'The relational model was a theoretical proposal, and many people at the time doubted whether it could be implemented efficiently. However, by the mid-1980s, relational database management systems (RDBMS) and SQL had become the tool of choice for most people who needed to store and query data with some kind of regular structure. The dominance of relational databases has lasted around 25‒30 years — an eternity in computing history.',
        'Now, in the 2010s, NoSQL is the latest attempt to overthrow the relational model’s dominance. The term NoSQL is unfortunate, since it doesn’t actually refer to any particular technology — it was intended simply as a catchy Twitter hashtag for a meetup on open source, distributed, non-relational databases in 2009 [3].',
        'The object-relational mismatch: Most application development today is done in object-oriented programming languages, which leads to a common criticism of the SQL data model: if data is stored in relational tables, an awkward translation layer is required between the objects in the application code and the database model of tables, rows and columns. The disconnect between the models is sometimes called an impedance mismatch.',
        'For example, Figure 2-1 illustrates how a résumé (a LinkedIn profile) could be expressed in a relational schema. The profile as a whole can be identified by a unique identifier, user_id. Fields like first_name and last_name appear exactly once per user, so they can be modeled as columns on the users table. However, positions, education and contact_info require one-to-many relationships (Figure 2-2).',
        'For a data structure like a résumé, which is mostly a self-contained document, a JSON representation can be quite appropriate: see Example 2-1. The JSON representation has better locality than the multi-table schema in Figure 2-1. In the JSON representation, all the relevant information is in one place, and one query is sufficient.'
      ],
      diagramId: 'fig-2-1-data-models',
      codeSnippet: {
        language: 'json',
        code: `{\n  "user_id": 251,\n  "first_name": "Bill",\n  "last_name": "Gates",\n  "positions": [\n    {"job_title": "Co-chair", "organization": "Bill & Melinda Gates Foundation"},\n    {"job_title": "Co-founder, Chairman", "organization": "Microsoft"}\n  ]\n}`,
        caption: 'Example 2-1. Representing a LinkedIn profile as a JSON document'
      },
      keyConcept: {
        title: 'Schema-on-Read vs Schema-on-Write',
        takeaway: 'Document DBs enforce schema-on-read (implicit, dynamic type check). Relational DBs enforce schema-on-write (explicit, compile-time check).',
        interviewTip: 'When asked SQL vs NoSQL, discuss data relationship topology (one-to-many tree vs many-to-many graph).'
      }
    },
    {
      id: 'ch2-many-to-many-and-history',
      title: 'Many-to-One and Many-to-Many: Are Document Databases Repeating History?',
      level: 2,
      content: [
        'Whether you store an ID or a text string is a question of duplication. When you use an ID, the information that is meaningful to humans (such as the word Philanthropy) is stored in only one place, and everything that refers to it uses an ID (which only has meaning within the database). When you store the text directly, you are duplicating the human-meaningful information in every record that uses it.',
        'The advantage of using an ID is that because it has no meaning to humans, it never needs to change. Removing such duplication is the key idea behind normalization in databases.',
        'Unfortunately, normalizing this data requires many-to-one relationships, which don’t fit nicely into the document model. In relational databases, it’s normal to refer to rows in other tables by ID, because joins are easy. In document databases, joins are not needed for one-to-many tree structures, and support for joins is often weak.',
        'Are document databases repeating history? The most popular database for business data processing in the 1970s was IBM’s Information Management System (IMS), originally developed for stock-keeping in the Apollo space program [13]. It represented all data as a tree of records nested within records, much like the JSON structure of Figure 2-2.',
        'Like document databases, IMS worked well for one-to-many relationships, but it made many-to-many relationships difficult and didn’t support joins. The CODASYL network model tried to fix this with access paths, but programmers had to navigate an n-dimensional pointer space in code. Codd’s relational model won because the query optimizer automatically chooses access paths!'
      ]
    },
    {
      id: 'ch2-query-languages',
      title: 'Query Languages for Data: Declarative vs. Imperative',
      level: 2,
      content: [
        'When the relational model was introduced, it included a new way of querying data: SQL is a declarative query language, whereas IMS and CODASYL queried the database using imperative code.',
        'An imperative language tells the computer to perform certain operations in a certain order (e.g. stepping through a loop line by line). In a declarative query language, like SQL or relational algebra, you just specify the pattern of the data you want — what conditions the results must meet, and how you want it to be transformed (e.g. sorted, grouped and aggregated), but not how to achieve that goal.',
        'A declarative query language is attractive because it hides implementation details of the database engine, which makes it possible for the database system to introduce performance improvements without requiring any changes to queries. Furthermore, declarative queries lend themselves to automatic parallel execution.',
        'Declarative queries on the web: The advantages of declarative query languages are not limited to just databases. In CSS, li.selected > p declaratively declares which element to color blue, whereas imperative DOM manipulation in JavaScript requires dozens of lines of nested loops that are brittle and prone to stale state.'
      ],
      codeSnippet: {
        language: 'sql',
        code: `SELECT * FROM animals WHERE family = 'Sharks';`,
        caption: 'Declarative SQL query compared to an imperative loop'
      }
    },
    {
      id: 'ch2-graph-data-models',
      title: 'Graph-like Data Models: Cypher, SPARQL, and Datalog',
      level: 2,
      content: [
        'If many-to-many relationships are very common in your data, it becomes most natural to model your data as a graph. A graph consists of two kinds of object: vertices (also known as nodes or entities) and edges (also known as relationships or arcs).',
        'In the property graph model, each vertex consists of a unique identifier, a set of outgoing edges, a set of incoming edges, and key-value properties. Each edge has a tail vertex, a head vertex, and a label.',
        'Cypher is a declarative query language for property graphs, created for the Neo4j graph database [36]. Example 2-4 shows how to find people who emigrated from the US to Europe with elegant arrow pattern matching: (person) -[:BORN_IN]-> () -[:WITHIN*0..]-> (us:Location {name:\'United States\'}).',
        'Graph queries in SQL: To express variable-length traversal paths in SQL requires recursive common table expressions (WITH RECURSIVE), taking 29 lines of complex syntax for what Cypher does in 4 lines (Example 2-5).',
        'Triple-stores and SPARQL: In a triple-store, all information is stored as (subject, predicate, object). SPARQL is a declarative query language for triple-stores using the RDF data model [42].',
        'Datalog: The foundation that later query languages build upon. In Datalog, predicates are defined as rules (e.g. within_recursive(Location, Name) :- within(Location, Via), within_recursive(Via, Name)), allowing complex recursive queries to be built up piece by piece (Figure 2-6).'
      ],
      diagramId: 'fig-2-5-graph-model',
      codeSnippet: {
        language: 'cypher',
        code: `MATCH (person) -[:BORN_IN]-> () -[:WITHIN*0..]-> (us:Location {name:'United States'}),\n      (person) -[:LIVES_IN]-> () -[:WITHIN*0..]-> (eu:Location {name:'Europe'})\nRETURN person.name`,
        caption: 'Example 2-4. Cypher query to find people who emigrated from the US to Europe'
      }
    }
  ],
  references: [
    { id: 1, text: "Edgar F Codd: 'A Relational Model of Data for Large Shared Data Banks,' CACM 1970." },
    { id: 3, text: "Pramod J Sadalage and Martin Fowler: NoSQL Distilled, Addison-Wesley 2012." },
    { id: 13, text: "Rick Long et al.: IMS Primer, IBM Redbook 2000." },
    { id: 36, text: "The Neo4j Manual v2.0.0, Neo Technology 2013." },
    { id: 42, text: "Steve Harris et al.: 'SPARQL 1.1 Query Language,' W3C Recommendation 2013." },
    { id: 43, text: "Todd J Green et al.: 'Datalog and Recursive Query Processing,' Foundations and Trends in Databases 2013." }
  ]
};
