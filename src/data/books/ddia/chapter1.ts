import { BookChapter } from './ddiaTypes';

export const CHAPTER_1: BookChapter = {
  id: 'chapter-1',
  number: 1,
  title: 'Reliable, Scalable and Maintainable Applications',
  partId: 'part-1',
  partTitle: 'Part I. Foundations of Data Systems',
  pageRange: 'pp. 1 - 24',
  epigraph: {
    quote: 'The Internet was done so well that most people think of it as a natural resource like the Pacific Ocean, rather than something that was man-made. When was the last time a technology with a scale like that was so error-free?',
    author: 'Alan Kay, Dr Dobb’s Journal (2012)'
  },
  sections: [
    {
      id: 'ch1-thinking-about-data-systems',
      title: 'Thinking About Data Systems',
      level: 2,
      content: [
        'Many applications today are data-intensive, as opposed to compute-intensive. Raw CPU power is rarely a limiting factor for these applications — bigger problems are usually the amount of data, the complexity of data, and the speed at which it is changing.',
        'A data-intensive application is typically built from standard building blocks which provide commonly needed functionality. For example, many applications need to:',
        '• Store data so that they, or another application, can find it again later (databases),',
        '• Remember the result of an expensive operation, to speed up reads (caches),',
        '• Allow users to search data by keyword or filter it in various ways (search indexes),',
        '• Send a message to another process, to be handled asynchronously (stream processing),',
        '• Periodically crunch a large amount of accumulated data (batch processing).',
        'If that sounds painfully obvious, that’s just because these data systems are such a successful abstraction: we use them all the time without thinking too much. When building an application, most engineers wouldn’t dream of writing a new data storage engine from scratch, because databases are a perfectly good tool for the job.',
        'But reality is not that simple. There are many database systems with different characteristics, because different applications have different requirements. There are various approaches to caching, several ways of building search indexes, and so on. When building an application, we still need to figure out which tools and which approaches are the most appropriate for the task at hand. Sometimes it can be hard to combine several tools when you need to do something that a single tool cannot do alone.',
        'This book is a journey through both the principles and the practicalities of data systems, and how you can use them to build data-intensive applications. We will explore what different tools have in common, what distinguishes them, and how they achieve their characteristics.',
        'In this Chapter 1, we will start by exploring the fundamentals of what we are trying to achieve: reliable, scalable and maintainable data systems. We’ll clarify what those things mean, outline some ways of thinking about them, and go over the basics that we will need for later chapters. In the following chapters we will continue layer by layer, looking at different design decisions which need to be considered when working on a data-intensive application.',
        'We typically think of databases, queues, caches etc. as being very different categories of tools. Although a database and a message queue have some superficial similarity — both store data for some time — they have very different access patterns, which means different performance characteristics, and thus very different implementations.',
        'So why should we lump them all together under an umbrella term like data systems?',
        'Many new tools for data storage and processing have emerged in recent years. They are optimized for a variety of different use cases, and they no longer neatly fit into traditional categories [1]. For example, there are data stores that are also used as message queues (Redis), and there are message queues with database-like durability guarantees (Kafka). The boundaries between the categories are becoming blurred.',
        'Secondly, increasingly many applications now have such demanding or wide-ranging requirements that a single tool can no longer meet all of its data processing and storage needs. Instead, the work is broken down into tasks that can be performed efficiently on a single tool, and those different tools are stitched together using application code.',
        'For example, if you have an application-managed caching layer (using memcached or similar), or a full-text search server separate from your main database (such as Elasticsearch or Solr), it is normally the application code’s responsibility to keep those caches and indexes in sync with the main database. Figure 1-1 gives a glimpse of what this may look like (we will go into detail in later chapters).',
        'When you combine several tools in order to provide a service, the service’s interface or API usually hides those implementation details from clients. Now you have essentially created a new, special-purpose data system from smaller, general-purpose components. Your composite data system may provide certain guarantees, e.g. that the cache will be correctly invalidated or updated on writes, so that outside clients see consistent results. You are now not only an application developer, but also a data system designer.',
        'If you are designing a data system or service, a lot of tricky questions arise. How do you ensure that the data remains correct and complete, even when things go wrong internally? How do you provide consistently good performance to clients, even when parts of your system are degraded? How do you scale to handle an increase in load? What does a good API for the service look like?'
      ],
      diagramId: 'fig-1-1',
      keyConcept: {
        title: 'Composite Data Systems (Figure 1-1)',
        takeaway: 'Modern backends stitch together specialized tools (Cache, DB, Search Index, Message Queue) behind an API, making the application developer a data system architect.',
        interviewTip: 'Always identify how components stay synchronized (dual-writes vs CDC/event streams) when combining DB, Cache, and Search.'
      }
    },
    {
      id: 'ch1-reliability',
      title: 'Reliability',
      level: 2,
      content: [
        'Everybody has an intuitive idea of what it means for software to be reliable or unreliable. For software, typical expectations include:',
        '• The application performs the function that the user expected.',
        '• It can tolerate the user making mistakes, or using the software in unexpected ways.',
        '• Its performance is good enough for the required use case, under expected load and data volume.',
        '• The system prevents any unauthorized access and abuse.',
        'If all those things together mean “working correctly”, then we can understand reliability as meaning, roughly, “continuing to work correctly, even when things go wrong”.',
        'The things that can go wrong are called faults, and systems that anticipate faults and can cope with them are called fault-tolerant or resilient. The term is slightly misleading: it suggests that we could make a system tolerant of every possible kind of fault, which in reality is not feasible. If the entire planet Earth (and all servers on it) were swallowed by a black hole, tolerance of that fault would require web hosting in space — good luck getting that budget item approved. So it only makes sense to talk about tolerating certain types of fault.',
        'Note that a fault is not the same as a failure [2]. A fault is usually defined as one component of the system deviating from its spec, whereas a failure is when the system as a whole stops providing the required service to the user. It is impossible to reduce the probability of a fault to zero; therefore it is usually best to design fault tolerance mechanisms that prevent faults from causing failures. In this book we cover several techniques for building reliable systems from unreliable parts.',
        'Counter-intuitively, in such fault-tolerant systems, it can make sense to increase the rate of faults by triggering them deliberately — for example, by randomly killing individual processes without warning. Many critical bugs are actually due to poor error handling [3]; by deliberately inducing faults, you ensure that the fault-tolerance machinery is continually exercised and tested, which can increase your confidence that faults will be handled correctly when they occur naturally. The Netflix chaos monkey [4] is an example of this approach.'
      ],
      keyConcept: {
        title: 'Fault vs Failure',
        takeaway: 'A fault is a component deviating from spec; a failure is total service outage. Good systems use fault-tolerance to prevent faults from becoming failures.'
      }
    },
    {
      id: 'ch1-hardware-software-human-faults',
      title: 'Hardware Faults, Software Errors, and Human Errors',
      level: 3,
      content: [
        'Hardware faults: When we think of causes of system failure, hardware faults quickly come to mind. Hard disks crash, RAM becomes faulty, the power grid has a blackout, someone unplugs the wrong network cable. Anyone who has worked with large data centers can tell you that these things happen all the time when you have a lot of machines. Hard disks are reported as having a mean time to failure (MTTF) of about 10 to 50 years [5, 6]. Thus, on a storage cluster with 10,000 disks, we should expect on average one disk to die per day.',
        'Software errors: Another class of fault is a systematic error within the system [8]. Such faults are harder to anticipate, and because they are correlated across nodes, they tend to cause many more system failures than uncorrelated hardware faults [5]. Examples include a software bug that causes every instance of an application server to crash when given a particular bad input (e.g. leap second on June 30, 2012 [9]), runaway processes using CPU/RAM/disk, or cascading failures [10].',
        'Human errors: Humans design and build software systems, and the operators who keep the system running are also human. Even when they have the best intentions, humans are known to be unreliable. For example, one study of large internet services found that configuration errors by operators were the leading cause of outages, whereas hardware faults (servers or network) played a role in only 10–25% of outages [13].',
        'How do we make our system reliable, in spite of unreliable humans? The best systems combine several approaches: design abstractions that minimize opportunities for error; decouple places where mistakes happen (sandboxes); test thoroughly at all levels [3]; allow quick recovery (fast rollback, recompute tools); and set up detailed telemetry and monitoring [14].'
      ]
    },
    {
      id: 'ch1-scalability-describing-load',
      title: 'Scalability: Describing Load (The Twitter Architecture)',
      level: 2,
      content: [
        'Even if a system is working reliably today, that doesn’t mean it will necessarily work reliably in future. One common reason for degradation is increased load: perhaps it has grown from 10,000 concurrent users to 100,000 concurrent users, or from 1 million to 10 million. Perhaps it is processing much larger volumes of data than it did before.',
        'Scalability is the term we use to describe a system’s ability to cope with increased load. Note, however, that it is not a one-dimensional label that we can attach to a system: it is meaningless to say “X is scalable” or “Y doesn’t scale”. Rather, discussing scalability means to discuss the question: if the system grows in a particular way, what are our options for coping with the growth? How can we add computing resources to handle the additional load?',
        'First, we need to succinctly describe the current load on the system; only then can we discuss growth questions (what happens if our load doubles?). Load can be described with a few numbers which we call load parameters. The best choice of parameters depends on the architecture of your system: perhaps it’s requests per second to a webserver, ratio of reads to writes in a database, the number of simultaneously active users in a chat room, the hit rate on a cache, or something else.',
        'To make this idea more concrete, let’s consider Twitter as an example, using data published in November 2012 [16]. Two of Twitter’s main operations are:',
        '• Post tweet: A user can publish a new message to their followers (4.6 k requests/sec on average, over 12 k requests/sec at peak).',
        '• Home timeline: A user can view tweets recently published by the people they follow (300 k requests/sec).',
        'Simply handling 12,000 writes per second (the peak rate for posting tweets) would be fairly easy. However, Twitter’s scaling challenge is not primarily due to tweet volume, but due to fan-out — each user follows many people, and each user is followed by many people. There are broadly two approaches to implementing these two operations:',
        '1. Posting a tweet simply inserts the new tweet into a global collection of tweets. When a user requests home timeline, look up all the people they follow, find all recent tweets for each of those users, and merge them (sorted by time). In a relational database like the one in Figure 1-2, this would be a query along the lines of:',
        'SELECT tweets.*, users.* FROM tweets JOIN users ON tweets.sender_id = users.id JOIN follows ON follows.followee_id = users.id WHERE follows.follower_id = current_user',
        '2. Maintain a cache for each user’s home timeline — like a mailbox of tweets for each recipient user (see Figure 1-3). When a user posts a tweet, look up all the people who follow that user, and insert the new tweet into each of their home timeline caches. The request to read the home timeline is then cheap, because its result has been computed ahead of time.',
        'The first version of Twitter used approach 1, but the systems struggled to keep up with the load of home timeline queries, so the company switched to approach 2. This works better because the average rate of published tweets is almost two orders of magnitude lower than the rate of home timeline reads, and so in this case it’s preferable to do more work at write time and less at read time.',
        'However, the downside of approach 2 is that posting a tweet now requires a lot of extra work. On average, a tweet is delivered to about 75 followers, so 4.6 k tweets per second become 345 k writes per second to the home timeline caches. But this average hides the fact that the number of followers per user varies wildly, and some users have over 30 million followers. This means that a single tweet may result in over 30 million writes to home timelines! Doing this in a timely manner — Twitter tries to deliver tweets to followers within 5 seconds — is a significant challenge.',
        'The final twist of the Twitter anecdote: now that approach 2 is robustly implemented, Twitter is moving to a hybrid of both approaches. Most users’ tweets continue to be fanned out to home timelines at the time when they are posted, but a small number of users with a very large number of followers are excepted from this fan-out. Instead, when the home timeline is read, the tweets from celebrities followed by the user are fetched separately and merged with the home timeline when the timeline is read, like in approach 1. This hybrid approach is able to deliver consistently good performance.'
      ],
      diagramId: 'fig-1-3-twitter-fanout',
      codeSnippet: {
        language: 'sql',
        code: `SELECT tweets.*, users.* FROM tweets\n JOIN users ON tweets.sender_id = users.id\n JOIN follows ON follows.followee_id = users.id\n WHERE follows.follower_id = current_user`,
        caption: 'Figure 1-2 Relational query for timeline generation'
      },
      keyConcept: {
        title: 'Fan-Out on Write vs Fan-Out on Read',
        takeaway: 'High read-to-write ratio (300k reads vs 4.6k writes) favors write-time precomputation (fan-out on write), but celebrity power-law distributions require a hybrid approach.',
        interviewTip: 'Twitter timeline design is the #1 classic interview question showcasing fan-out trade-offs.'
      }
    },
    {
      id: 'ch1-describing-performance',
      title: 'Describing Performance: Percentiles and Tail Latency',
      level: 2,
      content: [
        'Once you have described the load on our system, you can investigate what happens when the load increases. You can look at it in two ways:',
        '• When you increase a load parameter, and keep the system resources (CPU, memory, network bandwidth, etc.) unchanged, how is performance of your system affected?',
        '• When you increase a load parameter, how much do you need to increase the resources if you want to keep performance unchanged?',
        'Latency and response time are often used synonymously, but they are not the same. The response time is what the client sees: besides the actual time to process the request (the service time), it includes network delays and queueing delays. Latency is the duration that a request is waiting to be handled — during which it is latent, awaiting service [17].',
        'Even if you only make the same request over and over again, you’ll get a slightly different response time on every try. In practice, in a system handling a variety of requests, the response time can vary a lot. We therefore need to think of response time not as a single number, but as a distribution of values that you can measure.',
        'In Figure 1-4, each gray bar represents a request to a service, and its height shows how long that request took. Most requests are reasonably fast, but there are occasional outliers that take much longer... Usually it is better to use percentiles. If you take your list of response times and sort it, from fastest to slowest, then the median is the half-way point: for example, if your median response time is 200 ms, that means half your requests return in less than 200 ms, and half your requests take longer than that. The median is also known as 50th percentile, and sometimes abbreviated as p50.',
        'In order to figure out how bad your outliers are, you can look at higher percentiles: the 95th, 99th and 99.9th percentile are common (abbreviated p95, p99 and p999). High percentiles are important because they directly affect users’ experience of the service. For example, Amazon describes response time requirements for internal services in terms of the 99.9th percentile, even though it only affects 1 in 1,000 requests. This is because the customers with the slowest requests are often those who have made many purchases — i.e. the most valuable customers [19].',
        'Percentiles in Practice: High percentiles become especially important in backend services that are called multiple times as part of serving a single end-user request. Even if you make the calls in parallel, the end-user request still needs to wait for the slowest of the parallel calls to complete. It takes just one slow call to make the entire end-user request slow, as illustrated in Figure 1-5. Even if only a small percentage of backend calls are slow, the chance of getting a slow call increases if an end-user request requires multiple backend calls, and so a higher proportion of end-user requests end up being slow [24].'
      ],
      diagramId: 'fig-1-4-percentiles',
      keyConcept: {
        title: 'Tail Latency Amplification (Figure 1-5)',
        takeaway: 'When 1 end-user request invokes N parallel microservices, the end-user experience is bound by the slowest service (tail latency). A 1% slow service rate multiplies across calls.',
        interviewTip: 'Explain why SLAs/SLOs must measure p99 and p99.9 rather than averages.'
      }
    },
    {
      id: 'ch1-coping-with-load',
      title: 'Approaches for Coping with Load and Maintainability',
      level: 2,
      content: [
        'People often talk of a dichotomy between scaling up (vertical scaling, moving to a more powerful machine) and scaling out (horizontal scaling, distributing the load across multiple smaller machines). Distributing load across multiple machines is also known as a shared nothing architecture. A system that can run on a single machine is often simpler, but high-end machines can become very expensive, so very intensive workloads often can’t avoid scaling out.',
        'Some systems are elastic, meaning that they can automatically add computing resources when they detect a load increase, whereas other systems are scaled manually (a human analyses the capacity and decides to add more machines to the system). An elastic system can be useful if load is highly unpredictable, but manually scaled systems are simpler and may have fewer operational surprises.',
        'Maintainability: It is well-known that the majority of the cost of software is not in its initial development, but in its ongoing maintenance — fixing bugs, keeping its systems operational, investigating failures, adapting it to new platforms, modifying it for new use cases, repaying technical debt, and adding new features. We pay particular attention to three design principles for software systems:',
        '• Operability: Make it easy for operations teams to keep the system running smoothly.',
        '• Simplicity: Make it easy for new engineers to understand the system, by removing as much complexity as possible from the system. (Note this is not the same as simplicity of the user interface.)',
        '• Evolvability: Make it easy for engineers in future to make changes to the system, adapting it for unanticipated use cases as requirements change. Also known as extensibility, modifiability or plasticity.'
      ]
    },
    {
      id: 'ch1-summary',
      title: 'Summary',
      level: 2,
      content: [
        'In this chapter, we have explored some fundamental ways of thinking about data-intensive applications. These principles will guide us through the rest of the book, when we dive into deep technical detail.',
        'An application has to meet various requirements in order to be useful. There are functional requirements (what it should do, e.g. allow data to be stored, retrieved, searched and processed in various ways), and some non-functional requirements (general properties like security, reliability, compliance, scalability, compatibility and maintainability). In this chapter we discussed reliability, scalability and maintainability in detail.',
        'Reliability means making systems work correctly, even when faults occur. Faults can be in hardware (typically random and uncorrelated), software (bugs are typically systematic and hard to deal with), and humans (who inevitably make mistakes from time to time). Fault tolerance techniques can hide certain types of fault from the end user.',
        'Scalability means having strategies for keeping performance good, even when load increases. In order to discuss scalability, we first need ways of describing load and performance quantitatively. We briefly looked at Twitter’s home timelines as an example of describing load, and response time percentiles as a way of measuring performance. In a scalable system, you can add processing capacity in order to remain reliable under high load.',
        'Maintainability has many facets, but in essence it’s about making life better for the engineering and operations teams who need to work with the system. Good abstractions can help reduce complexity and make the system easier to modify and adapt for new use cases. Good operability means having good visibility into the system’s health, and having effective ways of managing it.'
      ]
    }
  ],
  references: [
    { id: 1, text: "Michael Stonebraker and Uğur Çetintemel: 'One Size Fits All: An Idea Whose Time Has Come and Gone,' ICDE 2005." },
    { id: 2, text: "Walter L Heimerdinger and Charles B Weinstock: 'A Conceptual Framework for System Fault Tolerance,' CMU/SEI-92-TR-033, 1992." },
    { id: 3, text: "Ding Yuan et al.: 'Simple Testing Can Prevent Most Critical Failures: An Analysis of Production Failures in Distributed Data-Intensive Systems,' OSDI 2014." },
    { id: 4, text: "Yury Izrailevsky and Ariel Tseitlin: 'The Netflix Simian Army,' techblog.netflix.com, 2011." },
    { id: 16, text: "Raffi Krikorian: 'Timelines at Scale,' QCon San Francisco, 2012." },
    { id: 19, text: "Giuseppe DeCandia et al.: 'Dynamo: Amazon’s Highly Available Key-Value Store,' SOSP 2007." },
    { id: 24, text: "Jeffrey Dean and Luiz André Barroso: 'The Tail at Scale,' Communications of the ACM, 2013." }
  ]
};
