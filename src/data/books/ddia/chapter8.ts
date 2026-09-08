import { BookChapter } from './ddiaTypes';

export const CHAPTER_8: BookChapter = {
  id: 'chapter-8',
  number: 8,
  title: 'The Trouble with Distributed Systems',
  partId: 'part-2',
  partTitle: 'Part II. Distributed Data',
  pageRange: 'pp. 265 - 310',
  epigraph: {
    quote: "Hey I just met you / The network's laggy / But here's my data / So store it maybe",
    author: 'Kyle Kingsbury, Carly Rae Jepsen and the perils of network partitions (2013)'
  },
  sections: [
    {
      id: 'ch8-faults-and-partial-failures',
      title: 'Faults and Partial Failures in Distributed Systems',
      level: 2,
      content: [
        'Working with distributed systems is fundamentally different from writing software on a single computer — and the main difference is that there are lots of new and exciting ways for things to go wrong [1, 2].',
        'On a single computer, when hardware is working correctly, the same operation always produces the same result. If there is a hardware problem, the consequence is usually total system failure. Computers hide fuzzy physical reality behind an idealized mathematical perfection.',
        'In distributed systems, we have no choice but to confront the messy reality of the physical world. In a distributed system, there may well be some parts of the system that are broken in some unpredictable way, even though other parts are working fine. This is known as a partial failure.',
        'Coda Hale’s datacenter anecdote [4]: "In my limited experience I’ve dealt with long-lived network partitions in a single data center (DC), PDU failures, switch failures, accidental power cycles of whole racks, whole-DC backbone failures, whole-DC power failures, and a hypoglycemic driver smashing his Ford pickup truck into a DC’s HVAC system. And I’m not even an ops guy."',
        'Building a reliable system from unreliable components: This is an old idea in computing (John von Neumann [11]). Error-correcting codes transmit data across noisy radio channels; TCP provides reliable streams on top of packet-dropping IP. But TCP cannot magically remove delays in the network.'
      ]
    },
    {
      id: 'ch8-unreliable-networks-clocks',
      title: 'Unreliable Networks, Packet Queues, and Unreliable Clocks',
      level: 2,
      content: [
        'Unreliable Networks (Figure 8-1): When you send a request and get no response, it is impossible to tell whether: (a) the request was lost; (b) the remote node crashed; or (c) the response was lost on the return path. Network congestion in switch queues (Figure 8-2) and OS socket buffers causes unbounded delays.',
        'Unreliable Clocks: Modern computers have two clocks: (1) Time-of-day clock (wall-clock time, synchronized via NTP, subject to sudden backward jumps and leap second anomalies); (2) Monotonic clock (e.g. System.nanoTime(), guaranteed to never jump backwards, suitable for measuring timeouts and durations).',
        'Clock readings have a confidence interval: Quartz crystals drift with temperature (Google assumes 200 ppm drift ~ 17 seconds/day). Google’s TrueTime API in Spanner explicitly reports an uncertainty bound [earliest, latest], waiting out the uncertainty before committing writes [39].',
        'Timestamps for Ordering Events (Figure 8-3): Relying on physical time-of-day clocks for Last Write Wins (LWW) is dangerous. Clock skew can assign an earlier timestamp to a causally later write, causing silent and permanent data loss!'
      ],
      diagramId: 'fig-8-3-clock-skew',
      keyConcept: {
        title: 'Time-of-Day vs Monotonic Clocks',
        takeaway: 'Never use time-of-day clocks (System.currentTimeMillis) to measure timeouts or order distributed events. Use monotonic clocks (System.nanoTime) for elapsed durations.',
        interviewTip: 'Explain why Last-Write-Wins (LWW) with physical timestamps causes silent data loss.'
      }
    },
    {
      id: 'ch8-process-pauses-fencing-tokens',
      title: 'Process Pauses, The Leader and the Lock, and Fencing Tokens',
      level: 2,
      content: [
        'Process Pauses: What happens when a thread stops for 15 seconds? Stop-the-world garbage collection (GC) pauses [60], virtual machine live migration [63], CPU steal time, or OS memory page swapping (thrashing). A thread can sleep without knowing it was paused!',
        'The Leader and the Lock (Figure 8-4): Say a client obtains a lease to write to storage. If the client experiences a 15-second GC pause, its lease expires. Another client acquires the lease and writes to storage. The paused client wakes up, believes it still owns the lease, and writes to storage, corrupting the file!',
        'Fencing Tokens (Figure 8-5): The lock service returns a monotonically increasing fencing token with every lease grant (e.g. token 33, token 34). Every write to storage must include this token. When the revived client attempts to write with stale token 33, the storage service checks its highest seen token (34) and rejects the write!',
        'Byzantine Faults & The Byzantine Generals Problem [73]: When nodes can actively lie, forge packets, or behave maliciously. Most datacenter algorithms assume crash-recovery (honest but crashable nodes); blockchain systems assume Byzantine fault tolerance.'
      ],
      diagramId: 'fig-8-5-fencing-tokens',
      keyConcept: {
        title: 'Fencing Tokens (Figure 8-5)',
        takeaway: 'A distributed lock alone is insufficient because clients can pause (GC, swap). The storage resource must validate monotonically increasing fencing tokens to reject zombie writes.',
        interviewTip: 'If an interviewer asks how to implement a distributed lock with ZooKeeper or Redis, mentioning fencing tokens earns top-tier marks.'
      }
    },
    {
      id: 'ch8-safety-and-liveness',
      title: 'System Models: Safety vs. Liveness Properties',
      level: 2,
      content: [
        'Timing models: (1) Synchronous model (bounded delay, unrealistic); (2) Partially synchronous model (synchronous most of the time, but subject to arbitrary delays and pauses — the most realistic model); (3) Asynchronous model (no clocks, no timeouts).',
        'Safety and Liveness [86]:',
        '• Safety properties: "Nothing bad happens". If violated, we can point to an exact moment in time when it was broken, and it cannot be undone (e.g. Uniqueness of fencing tokens, no duplicate leader). Must hold in all situations.',
        '• Liveness properties: "Something good eventually happens". May not hold at a point in time, but is eventually satisfied (e.g. Availability, termination, eventual consistency). Allowed to make caveats (e.g. holds if network recovers).'
      ]
    }
  ],
  references: [
    { id: 4, text: "Coda Hale: 'You Can’t Sacrifice Partition Tolerance,' codahale.com 2010." },
    { id: 11, text: "John von Neumann: 'Probabilistic Logics and the Synthesis of Reliable Organisms from Unreliable Components,' 1956." },
    { id: 39, text: "James C Corbett et al.: 'Spanner: Google’s Globally-Distributed Database,' OSDI 2012." },
    { id: 70, text: "Flavio P Junqueira and Benjamin Reed: ZooKeeper: Distributed Process Coordination, O’Reilly 2013." },
    { id: 73, text: "Leslie Lamport, Robert Shostak, and Marshall Pease: 'The Byzantine Generals Problem,' TOPLAS 1982." },
    { id: 86, text: "Bowen Alpern and Fred B Schneider: 'Defining Liveness,' Information Processing Letters 1985." }
  ]
};
