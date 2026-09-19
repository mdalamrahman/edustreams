/**
 * AsperSDE SuperAdmin Problem Catalog
 * Unified database of 660+ DSA Problems (across SDE, A2Z, 79, Blind75, CodeStoryWithMIK)
 * and 10 LLD Machine Coding Architectures.
 */

export type ProblemType = 'dsa' | 'lld';
export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';
export type SupportedLanguage = 'cpp' | 'python' | 'java' | 'javascript' | 'go' | 'rust' | 'sql';

export interface AdminProblemItem {
  id: string;
  name: string;
  slug: string;
  type: ProblemType;
  category: string;
  subcategory?: string;
  difficulty: ProblemDifficulty;
  sheets: string[];
  leetcode?: string;
  gfg?: string;
  companies?: string[];
  description?: string;
}

export const LLD_PROBLEMS: AdminProblemItem[] = [
  {
    "id": "lld-parking-lot",
    "name": "Design a Multi-Floor Parking Lot System",
    "slug": "lld-parking-lot",
    "type": "lld",
    "category": "Low Level Design",
    "subcategory": "Object Oriented Design",
    "difficulty": "Medium",
    "sheets": [
      "lld"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber",
      "Swiggy"
    ],
    "description": "Design a multi-floor parking lot system handling multiple vehicle types (Motorcycles, Cars, Trucks), dynamically allocating parking spots, generating tickets, and calculating hourly rates with extensible pricing strategies."
  },
  {
    "id": "lld-rate-limiter",
    "name": "Design a Distributed API Rate Limiter",
    "slug": "lld-rate-limiter",
    "type": "lld",
    "category": "Low Level Design",
    "subcategory": "System Patterns & Concurrency",
    "difficulty": "Medium",
    "sheets": [
      "lld"
    ],
    "companies": [
      "Stripe",
      "Uber",
      "Cloudflare",
      "Meta",
      "Amazon"
    ],
    "description": "Design an extensible and thread-safe API Rate Limiter supporting multiple throttling algorithms (Token Bucket, Leaky Bucket, Sliding Window Counter)."
  },
  {
    "id": "lld-elevator-system",
    "name": "Design an Intelligent Elevator Dispatch System",
    "slug": "lld-elevator-system",
    "type": "lld",
    "category": "Low Level Design",
    "subcategory": "State & Dispatcher Patterns",
    "difficulty": "Medium",
    "sheets": [
      "lld"
    ],
    "companies": [
      "Google",
      "Microsoft",
      "Amazon",
      "Bloomberg",
      "Salesforce"
    ],
    "description": "Design an intelligent elevator dispatch system with multiple elevator cars, floor call stations, and optimal scheduling algorithms (LOOK/SCAN)."
  },
  {
    "id": "lld-splitwise",
    "name": "Design an Expense Sharing System (Splitwise)",
    "slug": "lld-splitwise",
    "type": "lld",
    "category": "Low Level Design",
    "subcategory": "Financial & Ledger Systems",
    "difficulty": "Medium",
    "sheets": [
      "lld"
    ],
    "companies": [
      "Uber",
      "Swiggy",
      "Cred",
      "PhonePe",
      "Flipkart"
    ],
    "description": "Design an expense sharing and group bill splitting application capable of equal, exact amount, and percentage splits with simplified debt balance settlements."
  },
  {
    "id": "lld-lru-cache",
    "name": "Design an In-Memory LRU Cache with TTL",
    "slug": "lld-lru-cache",
    "type": "lld",
    "category": "Low Level Design",
    "subcategory": "Data Structures & Memory",
    "difficulty": "Medium",
    "sheets": [
      "lld"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Microsoft",
      "Apple",
      "Oracle"
    ],
    "description": "Design a high-performance in-memory Least Recently Used (LRU) Cache featuring O(1) Get and Put operations, capacity evictions, and time-to-live expiration."
  },
  {
    "id": "lld-bookmyshow",
    "name": "Design BookMyShow / Movie Ticket Booking System",
    "slug": "lld-bookmyshow",
    "type": "lld",
    "category": "Low Level Design",
    "subcategory": "Concurrency & Locking",
    "difficulty": "Hard",
    "sheets": [
      "lld"
    ],
    "companies": [
      "Amazon",
      "Flipkart",
      "MakeMyTrip",
      "BookMyShow",
      "Google"
    ],
    "description": "Design a highly concurrent movie ticket booking system managing cinema halls, shows, seat layouts, temporary locking during checkout, and payment processing."
  },
  {
    "id": "lld-vending-machine",
    "name": "Design an Automated Vending Machine",
    "slug": "lld-vending-machine",
    "type": "lld",
    "category": "Low Level Design",
    "subcategory": "State Machine Pattern",
    "difficulty": "Easy",
    "sheets": [
      "lld"
    ],
    "companies": [
      "Amazon",
      "Microsoft",
      "Paypal",
      "Goldman Sachs"
    ],
    "description": "Design an automated vending machine using the State Pattern handling idle, money-inserted, item-dispensed, and change-return workflows."
  },
  {
    "id": "lld-snake-and-ladder",
    "name": "Design a Multiplayer Snake and Ladder Game",
    "slug": "lld-snake-and-ladder",
    "type": "lld",
    "category": "Low Level Design",
    "subcategory": "Game Engines",
    "difficulty": "Medium",
    "sheets": [
      "lld"
    ],
    "companies": [
      "Flipkart",
      "Amazon",
      "Zynga",
      "Meesho"
    ],
    "description": "Design a modular, extensible multiplayer Snake and Ladder game supporting customizable board dimensions, multiple dice, snakes, and ladders."
  },
  {
    "id": "lld-atm-machine",
    "name": "Design an ATM Cash Dispenser & Transaction Engine",
    "slug": "lld-atm-machine",
    "type": "lld",
    "category": "Low Level Design",
    "subcategory": "Chain of Responsibility & State",
    "difficulty": "Hard",
    "sheets": [
      "lld"
    ],
    "companies": [
      "Visa",
      "Mastercard",
      "JPMorgan",
      "Morgan Stanley"
    ],
    "description": "Design an ATM transaction engine supporting authentication, cash withdrawal via Chain of Responsibility currency dispensers, balance inquiries, and PIN updates."
  },
  {
    "id": "lld-logging-framework",
    "name": "Design an Asynchronous Multi-Level Logging Framework",
    "slug": "lld-logging-framework",
    "type": "lld",
    "category": "Low Level Design",
    "subcategory": "Producer-Consumer & Observer",
    "difficulty": "Medium",
    "sheets": [
      "lld"
    ],
    "companies": [
      "Uber",
      "Google",
      "Datadog",
      "Splunk"
    ],
    "description": "Design an asynchronous logging library supporting log levels (DEBUG, INFO, WARN, ERROR), sink destinations (Console, File, Network), and non-blocking ring buffer queues."
  }
];

export const DSA_PROBLEMS: AdminProblemItem[] = [
  {
    "id": "dsa-set-matrix-zeroes",
    "name": "Set Matrix Zeroes",
    "slug": "set-matrix-zeroes",
    "type": "dsa",
    "category": "Arrays Part-I",
    "subcategory": "Arrays Part-I",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/set-matrix-zeroes/",
    "gfg": "https://www.geeksforgeeks.org/problems/set-matrix-zeroes/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-pascals-triangle",
    "name": "Pascal",
    "slug": "pascals-triangle",
    "type": "dsa",
    "category": "Arrays Part-I",
    "subcategory": "Arrays Part-I",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/pascals-triangle/",
    "gfg": "https://www.geeksforgeeks.org/problems/pascal-triangle0652/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-next-permutation",
    "name": "Next Permutation",
    "slug": "next-permutation",
    "type": "dsa",
    "category": "Arrays Part-I",
    "subcategory": "Arrays Part-I",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/next-permutation/",
    "gfg": "https://www.geeksforgeeks.org/problems/next-permutation5226/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs",
      "FactSet",
      "Hike",
      "MakeMyTrip"
    ]
  },
  {
    "id": "dsa-maximum-subarray",
    "name": "Kadane",
    "slug": "maximum-subarray",
    "type": "dsa",
    "category": "Arrays Part-I",
    "subcategory": "Arrays Part-I",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-subarray/",
    "gfg": "https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-sort-colors",
    "name": "Sort an Array of 0s 1s and 2s",
    "slug": "sort-colors",
    "type": "dsa",
    "category": "Arrays Part-I",
    "subcategory": "Arrays Part-I",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "79",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/sort-colors/",
    "gfg": "https://www.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s4231/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber",
      "Adobe",
      "Hike",
      "MakeMyTrip",
      "MAQ Software"
    ]
  },
  {
    "id": "dsa-best-time-to-buy-and-sell-stock",
    "name": "Stock Buy and Sell",
    "slug": "best-time-to-buy-and-sell-stock",
    "type": "dsa",
    "category": "Arrays Part-I",
    "subcategory": "Arrays Part-I",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "gfg": "https://www.geeksforgeeks.org/problems/stock-buy-and-sell2615/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-rotate-image",
    "name": "Rotate Matrix (Image)",
    "slug": "rotate-image",
    "type": "dsa",
    "category": "Arrays Part-II",
    "subcategory": "Arrays Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/rotate-image/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotate-by-90-degree-1587115621/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-merge-intervals",
    "name": "Merge Overlapping Subintervals",
    "slug": "merge-intervals",
    "type": "dsa",
    "category": "Arrays Part-II",
    "subcategory": "Arrays Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/merge-intervals/",
    "gfg": "https://www.geeksforgeeks.org/problems/overlapping-intervals--170643/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix",
      "Uber"
    ]
  },
  {
    "id": "dsa-merge-sorted-array",
    "name": "Merge Two Sorted Arrays Without Extra Space",
    "slug": "merge-sorted-array",
    "type": "dsa",
    "category": "Arrays Part-II",
    "subcategory": "Arrays Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/merge-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-two-sorted-arrays-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-find-the-duplicate-number",
    "name": "Find Duplicate in Array of N+1 Integers",
    "slug": "find-the-duplicate-number",
    "type": "dsa",
    "category": "Arrays Part-II",
    "subcategory": "Arrays Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/find-the-duplicate-number/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-duplicates-in-an-array/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-set-mismatch",
    "name": "Repeat and Missing Number",
    "slug": "set-mismatch",
    "type": "dsa",
    "category": "Arrays Part-II",
    "subcategory": "Arrays Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/set-mismatch/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-missing-and-repeating2512/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-global-and-local-inversions",
    "name": "Count Inversions in Array",
    "slug": "global-and-local-inversions",
    "type": "dsa",
    "category": "Arrays Part-II",
    "subcategory": "Arrays Part-II",
    "difficulty": "Hard",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/global-and-local-inversions/",
    "gfg": "https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1",
    "companies": [
      "Amazon"
    ]
  },
  {
    "id": "dsa-search-a-2d-matrix",
    "name": "Search in a 2D Matrix",
    "slug": "search-a-2d-matrix",
    "type": "dsa",
    "category": "Arrays Part-III",
    "subcategory": "Arrays Part-III",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "79",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-a-matrix-1587115621/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber",
      "Accolite",
      "MentorGraphics",
      "Adobe",
      "Directi"
    ]
  },
  {
    "id": "dsa-powx-n",
    "name": "Pow(x, n)",
    "slug": "powx-n",
    "type": "dsa",
    "category": "Arrays Part-III",
    "subcategory": "Arrays Part-III",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/powx-n/",
    "gfg": "https://www.geeksforgeeks.org/problems/power-of-numbers-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-majority-element",
    "name": "Majority Element (> N/2 times)",
    "slug": "majority-element",
    "type": "dsa",
    "category": "Arrays Part-III",
    "subcategory": "Arrays Part-III",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/majority-element/",
    "gfg": "https://www.geeksforgeeks.org/problems/majority-element-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg",
      "Accolite",
      "D-E-Shaw",
      "FactSet",
      "MakeMyTrip"
    ]
  },
  {
    "id": "dsa-majority-element-ii",
    "name": "Majority Element II (> N/3 times)",
    "slug": "majority-element-ii",
    "type": "dsa",
    "category": "Arrays Part-III",
    "subcategory": "Arrays Part-III",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/majority-element-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/majority-vote/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "TCS"
    ]
  },
  {
    "id": "dsa-unique-paths",
    "name": "Grid Unique Paths",
    "slug": "unique-paths",
    "type": "dsa",
    "category": "Arrays Part-III",
    "subcategory": "Arrays Part-III",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/unique-paths/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-paths0925/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg",
      "Apple"
    ]
  },
  {
    "id": "dsa-reverse-pairs",
    "name": "Reverse Pairs",
    "slug": "reverse-pairs",
    "type": "dsa",
    "category": "Arrays Part-III",
    "subcategory": "Arrays Part-III",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/reverse-pairs/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-reverse-pairs/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-two-sum",
    "name": "2 Sum Problem",
    "slug": "two-sum",
    "type": "dsa",
    "category": "Arrays Part-IV",
    "subcategory": "Arrays Part-IV",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/two-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/key-pair5610/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-4sum",
    "name": "4 Sum Problem",
    "slug": "4sum",
    "type": "dsa",
    "category": "Arrays Part-IV",
    "subcategory": "Arrays Part-IV",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/4sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-all-four-sum-numbers1732/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-longest-consecutive-sequence",
    "name": "Longest Consecutive Sequence",
    "slug": "longest-consecutive-sequence",
    "type": "dsa",
    "category": "Arrays Part-IV",
    "subcategory": "Arrays Part-IV",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/longest-consecutive-sequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-consecutive-subsequence2421/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-contiguous-array",
    "name": "Largest Subarray with 0 Sum",
    "slug": "contiguous-array",
    "type": "dsa",
    "category": "Arrays Part-IV",
    "subcategory": "Arrays Part-IV",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/contiguous-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/largest-subarray-with-0-sum/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ]
  },
  {
    "id": "dsa-subarray-sum-equals-k",
    "name": "Count Subarrays with Given XOR K",
    "slug": "subarray-sum-equals-k",
    "type": "dsa",
    "category": "Arrays Part-IV",
    "subcategory": "Arrays Part-IV",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/subarray-sum-equals-k/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-subarray-with-given-xor/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-longest-substring-without-repeating-characters",
    "name": "Longest Substring Without Repeating Characters",
    "slug": "longest-substring-without-repeating-characters",
    "type": "dsa",
    "category": "Arrays Part-IV",
    "subcategory": "Arrays Part-IV",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "gfg": "https://www.geeksforgeeks.org/problems/length-of-the-longest-substring3036/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ]
  },
  {
    "id": "dsa-reverse-linked-list",
    "name": "Reverse a Linked List",
    "slug": "reverse-linked-list",
    "type": "dsa",
    "category": "Linked List",
    "subcategory": "Linked List",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-middle-of-the-linked-list",
    "name": "Find Middle of Linked List",
    "slug": "middle-of-the-linked-list",
    "type": "dsa",
    "category": "Linked List",
    "subcategory": "Linked List",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/middle-of-the-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/finding-middle-element-in-a-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-merge-two-sorted-lists",
    "name": "Merge Two Sorted Linked Lists",
    "slug": "merge-two-sorted-lists",
    "type": "dsa",
    "category": "Linked List",
    "subcategory": "Linked List",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "blind75",
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/merge-two-sorted-lists/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-two-sorted-linked-lists/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-remove-nth-node-from-end-of-list",
    "name": "Remove Nth Node From End of List",
    "slug": "remove-nth-node-from-end-of-list",
    "type": "dsa",
    "category": "Linked List",
    "subcategory": "Linked List",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/nth-node-from-end-of-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-add-two-numbers",
    "name": "Add Two Numbers as LinkedLists",
    "slug": "add-two-numbers",
    "type": "dsa",
    "category": "Linked List",
    "subcategory": "Linked List",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/add-two-numbers/",
    "gfg": "https://www.geeksforgeeks.org/problems/add-two-numbers-represented-by-linked-lists/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-delete-node-in-a-linked-list",
    "name": "Delete Node in a Linked List",
    "slug": "delete-node-in-a-linked-list",
    "type": "dsa",
    "category": "Linked List",
    "subcategory": "Linked List",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/delete-node-in-a-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/delete-without-head-pointer/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-intersection-of-two-linked-lists",
    "name": "Find Intersection Point of Y LinkedList",
    "slug": "intersection-of-two-linked-lists",
    "type": "dsa",
    "category": "Linked List Part-II",
    "subcategory": "Linked List Part-II",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
    "gfg": "https://www.geeksforgeeks.org/problems/intersection-point-in-y-shapped-linked-lists/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-linked-list-cycle",
    "name": "Detect Cycle in Linked List",
    "slug": "linked-list-cycle",
    "type": "dsa",
    "category": "Linked List Part-II",
    "subcategory": "Linked List Part-II",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/linked-list-cycle/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-reverse-nodes-in-k-group",
    "name": "Reverse Nodes in K-Group",
    "slug": "reverse-nodes-in-k-group",
    "type": "dsa",
    "category": "Linked List Part-II",
    "subcategory": "Linked List Part-II",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-a-linked-list-in-groups-of-given-size/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-palindrome-linked-list",
    "name": "Check if Linked List is Palindrome",
    "slug": "palindrome-linked-list",
    "type": "dsa",
    "category": "Linked List Part-II",
    "subcategory": "Linked List Part-II",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/palindrome-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-if-linked-list-is-pallindrome/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Nvidia"
    ]
  },
  {
    "id": "dsa-linked-list-cycle-ii",
    "name": "Find Starting Point of Loop in LinkedList",
    "slug": "linked-list-cycle-ii",
    "type": "dsa",
    "category": "Linked List Part-II",
    "subcategory": "Linked List Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/linked-list-cycle-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-first-node-of-loop-in-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "ByteDance"
    ]
  },
  {
    "id": "dsa-flatten-a-multilevel-doubly-linked-list",
    "name": "Flattening of a LinkedList",
    "slug": "flatten-a-multilevel-doubly-linked-list",
    "type": "dsa",
    "category": "Linked List Part-II",
    "subcategory": "Linked List Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/flattening-a-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "LinkedIn"
    ]
  },
  {
    "id": "dsa-rotate-list",
    "name": "Rotate a LinkedList",
    "slug": "rotate-list",
    "type": "dsa",
    "category": "Linked List and Arrays",
    "subcategory": "Linked List and Arrays",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/rotate-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotate-a-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Nvidia"
    ]
  },
  {
    "id": "dsa-copy-list-with-random-pointer",
    "name": "Clone Linked List with Random and Next Pointer",
    "slug": "copy-list-with-random-pointer",
    "type": "dsa",
    "category": "Linked List and Arrays",
    "subcategory": "Linked List and Arrays",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/copy-list-with-random-pointer/",
    "gfg": "https://www.geeksforgeeks.org/problems/clone-a-linked-list-with-next-and-random-pointer/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-3sum",
    "name": "3 Sum Problem",
    "slug": "3sum",
    "type": "dsa",
    "category": "Linked List and Arrays",
    "subcategory": "Linked List and Arrays",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/3sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-triplets-with-zero-sum/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs",
      "Facebook"
    ]
  },
  {
    "id": "dsa-trapping-rain-water",
    "name": "Trapping Rain Water",
    "slug": "trapping-rain-water",
    "type": "dsa",
    "category": "Linked List and Arrays",
    "subcategory": "Linked List and Arrays",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/trapping-rain-water/",
    "gfg": "https://www.geeksforgeeks.org/problems/trapping-rain-water-1587115621/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber",
      "Accolite",
      "Adobe",
      "D-E-Shaw",
      "MakeMyTrip"
    ]
  },
  {
    "id": "dsa-remove-duplicates-from-sorted-array",
    "name": "Remove Duplicates from Sorted Array",
    "slug": "remove-duplicates-from-sorted-array",
    "type": "dsa",
    "category": "Linked List and Arrays",
    "subcategory": "Linked List and Arrays",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/remove-duplicate-elements-from-sorted-array/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-max-consecutive-ones",
    "name": "Max Consecutive Ones",
    "slug": "max-consecutive-ones",
    "type": "dsa",
    "category": "Linked List and Arrays",
    "subcategory": "Linked List and Arrays",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/max-consecutive-ones/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-consecutive-ones/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-meeting-rooms",
    "name": "N Meetings in One Room",
    "slug": "meeting-rooms",
    "type": "dsa",
    "category": "Greedy Algorithm",
    "subcategory": "Greedy Algorithm",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/meeting-rooms/",
    "gfg": "https://www.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-meeting-rooms-ii",
    "name": "Minimum Platforms Required for Railway Station",
    "slug": "meeting-rooms-ii",
    "type": "dsa",
    "category": "Greedy Algorithm",
    "subcategory": "Greedy Algorithm",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/meeting-rooms-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix",
      "Uber"
    ]
  },
  {
    "id": "dsa-maximum-profit-in-job-scheduling",
    "name": "Job Sequencing Problem",
    "slug": "maximum-profit-in-job-scheduling",
    "type": "dsa",
    "category": "Greedy Algorithm",
    "subcategory": "Greedy Algorithm",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-profit-in-job-scheduling/",
    "gfg": "https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-maximum-units-on-a-truck",
    "name": "Fractional Knapsack Problem",
    "slug": "maximum-units-on-a-truck",
    "type": "dsa",
    "category": "Greedy Algorithm",
    "subcategory": "Greedy Algorithm",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-units-on-a-truck/",
    "gfg": "https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Salesforce"
    ]
  },
  {
    "id": "dsa-coin-change",
    "name": "Greedy Algorithm for Minimum Coins",
    "slug": "coin-change",
    "type": "dsa",
    "category": "Greedy Algorithm",
    "subcategory": "Greedy Algorithm",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/coin-change/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-coins1824/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-assign-cookies",
    "name": "Assign Cookies / Candy",
    "slug": "assign-cookies",
    "type": "dsa",
    "category": "Greedy Algorithm",
    "subcategory": "Greedy Algorithm",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/assign-cookies/",
    "gfg": "https://www.geeksforgeeks.org/problems/assign-cookies/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-subsets",
    "name": "Subset Sums",
    "slug": "subsets",
    "type": "dsa",
    "category": "Recursion",
    "subcategory": "Recursion",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/subsets/",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sums1516/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-subsets-ii",
    "name": "Subset II (Unique Subsets)",
    "slug": "subsets-ii",
    "type": "dsa",
    "category": "Recursion",
    "subcategory": "Recursion",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/subsets-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sum-ii/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-combination-sum",
    "name": "Combination Sum I",
    "slug": "combination-sum",
    "type": "dsa",
    "category": "Recursion",
    "subcategory": "Recursion",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/combination-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/combination-sum-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-combination-sum-ii",
    "name": "Combination Sum II",
    "slug": "combination-sum-ii",
    "type": "dsa",
    "category": "Recursion",
    "subcategory": "Recursion",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/combination-sum-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/combination-sum-ii-1664263832/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ]
  },
  {
    "id": "dsa-palindrome-partitioning",
    "name": "Palindrome Partitioning",
    "slug": "palindrome-partitioning",
    "type": "dsa",
    "category": "Recursion",
    "subcategory": "Recursion",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/palindrome-partitioning/",
    "gfg": "https://www.geeksforgeeks.org/problems/palindrome-partitioning3622/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Infosys"
    ]
  },
  {
    "id": "dsa-permutation-sequence",
    "name": "K-th Permutation Sequence",
    "slug": "permutation-sequence",
    "type": "dsa",
    "category": "Recursion",
    "subcategory": "Recursion",
    "difficulty": "Hard",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/permutation-sequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-th-permutation-sequence/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Twitter (X)"
    ]
  },
  {
    "id": "dsa-permutations",
    "name": "Print All Permutations of Array / String",
    "slug": "permutations",
    "type": "dsa",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/permutations/",
    "gfg": "https://www.geeksforgeeks.org/problems/permutations-of-a-given-string2041/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-n-queens",
    "name": "N Queens Problem",
    "slug": "n-queens",
    "type": "dsa",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "79",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/n-queens/",
    "gfg": "https://www.geeksforgeeks.org/problems/n-queen-problem0315/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg",
      "Accolite",
      "Visa",
      "MAQ Software",
      "Amdocs"
    ]
  },
  {
    "id": "dsa-sudoku-solver",
    "name": "Sudoku Solver",
    "slug": "sudoku-solver",
    "type": "dsa",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/sudoku-solver/",
    "gfg": "https://www.geeksforgeeks.org/problems/solve-the-sudoku-1587115621/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-flower-planting-with-no-adjacent",
    "name": "M Coloring Problem",
    "slug": "flower-planting-with-no-adjacent",
    "type": "dsa",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/flower-planting-with-no-adjacent/",
    "gfg": "https://www.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1",
    "companies": [
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-unique-paths-iii",
    "name": "Rat in a Maze",
    "slug": "unique-paths-iii",
    "type": "dsa",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/unique-paths-iii/",
    "gfg": "https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem--1587115621/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-word-break-ii",
    "name": "Word Break (Print all ways)",
    "slug": "word-break-ii",
    "type": "dsa",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "difficulty": "Hard",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/word-break-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-break-part-23201/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-kth-smallest-element-in-a-sorted-matrix",
    "name": "Matrix Median",
    "slug": "kth-smallest-element-in-a-sorted-matrix",
    "type": "dsa",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "difficulty": "Hard",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
    "gfg": "https://www.geeksforgeeks.org/problems/matrix-median0732/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-single-element-in-a-sorted-array",
    "name": "Single Element in a Sorted Array",
    "slug": "single-element-in-a-sorted-array",
    "type": "dsa",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/single-element-in-a-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-the-element-that-appears-once-in-sorted-array0624/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg",
      "D-E-Shaw",
      "Ola Cabs",
      "Codenation",
      "Qualcomm"
    ]
  },
  {
    "id": "dsa-search-in-rotated-sorted-array",
    "name": "Search Element in Sorted and Rotated Array",
    "slug": "search-in-rotated-sorted-array",
    "type": "dsa",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-a-rotated-array4618/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber",
      "Adobe",
      "Morgan Stanley"
    ]
  },
  {
    "id": "dsa-median-of-two-sorted-arrays",
    "name": "Median of 2 Sorted Arrays",
    "slug": "median-of-two-sorted-arrays",
    "type": "dsa",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "79",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    "gfg": "https://www.geeksforgeeks.org/problems/median-of-2-sorted-arrays-of-different-sizes/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber",
      "Zenefits",
      "Yahoo"
    ]
  },
  {
    "id": "dsa-kth-smallest-product-of-two-sorted-arrays",
    "name": "K-th Element of Two Sorted Arrays",
    "slug": "kth-smallest-product-of-two-sorted-arrays",
    "type": "dsa",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/kth-smallest-product-of-two-sorted-arrays/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array1317/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "LinkedIn"
    ]
  },
  {
    "id": "dsa-capacity-to-ship-packages-within-d-days",
    "name": "Allocate Minimum Number of Pages",
    "slug": "capacity-to-ship-packages-within-d-days",
    "type": "dsa",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "79",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
    "gfg": "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber",
      "Baidu",
      "Flipkart",
      "D-E-Shaw"
    ]
  },
  {
    "id": "dsa-magnetic-force-between-two-balls",
    "name": "Aggressive Cows",
    "slug": "magnetic-force-between-two-balls",
    "type": "dsa",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "79",
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/magnetic-force-between-two-balls/",
    "gfg": "https://www.geeksforgeeks.org/problems/aggressive-cows/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-max-heap-min-heap-implementation",
    "name": "Max Heap Min Heap Implementation",
    "slug": "max-heap-min-heap-implementation",
    "type": "dsa",
    "category": "Heaps",
    "subcategory": "Heaps",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/heap-sort/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-kth-largest-element-in-an-array",
    "name": "Kth Largest Element in an Array",
    "slug": "kth-largest-element-in-an-array",
    "type": "dsa",
    "category": "Heaps",
    "subcategory": "Heaps",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-largest-elements4206/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-find-k-pairs-with-smallest-sums",
    "name": "Maximum Sum Combination",
    "slug": "find-k-pairs-with-smallest-sums",
    "type": "dsa",
    "category": "Heaps",
    "subcategory": "Heaps",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-sum-combination/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-find-median-from-data-stream",
    "name": "Find Median from Data Stream",
    "slug": "find-median-from-data-stream",
    "type": "dsa",
    "category": "Heaps",
    "subcategory": "Heaps",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/find-median-from-data-stream/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-median-in-a-stream-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-merge-k-sorted-lists",
    "name": "Merge K Sorted Arrays",
    "slug": "merge-k-sorted-lists",
    "type": "dsa",
    "category": "Heaps",
    "subcategory": "Heaps",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/merge-k-sorted-lists/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-top-k-frequent-elements",
    "name": "Top K Frequent Elements",
    "slug": "top-k-frequent-elements",
    "type": "dsa",
    "category": "Heaps",
    "subcategory": "Heaps",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/top-k-frequent-elements/",
    "gfg": "https://www.geeksforgeeks.org/problems/top-k-frequent-elements-in-array/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ]
  },
  {
    "id": "dsa-implement-stack-using-array",
    "name": "Implement Stack using Array",
    "slug": "implement-stack-using-array",
    "type": "dsa",
    "category": "Stack and Queue",
    "subcategory": "Stack and Queue",
    "difficulty": "Easy",
    "sheets": [
      "sde"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/implement-stack-using-array/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-implement-queue-using-array",
    "name": "Implement Queue using Array",
    "slug": "implement-queue-using-array",
    "type": "dsa",
    "category": "Stack and Queue",
    "subcategory": "Stack and Queue",
    "difficulty": "Easy",
    "sheets": [
      "sde"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/implement-queue-using-array/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-implement-stack-using-queues",
    "name": "Implement Stack using Queue",
    "slug": "implement-stack-using-queues",
    "type": "dsa",
    "category": "Stack and Queue",
    "subcategory": "Stack and Queue",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/implement-stack-using-queues/",
    "gfg": "https://www.geeksforgeeks.org/problems/stack-using-two-queues/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-implement-queue-using-stacks",
    "name": "Implement Queue using Stack",
    "slug": "implement-queue-using-stacks",
    "type": "dsa",
    "category": "Stack and Queue",
    "subcategory": "Stack and Queue",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/implement-queue-using-stacks/",
    "gfg": "https://www.geeksforgeeks.org/problems/queue-using-two-stacks/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-valid-parentheses",
    "name": "Check for Balanced Parentheses",
    "slug": "valid-parentheses",
    "type": "dsa",
    "category": "Stack and Queue",
    "subcategory": "Stack and Queue",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/valid-parentheses/",
    "gfg": "https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-next-greater-element-i",
    "name": "Next Greater Element",
    "slug": "next-greater-element-i",
    "type": "dsa",
    "category": "Stack and Queue",
    "subcategory": "Stack and Queue",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/next-greater-element-i/",
    "gfg": "https://www.geeksforgeeks.org/problems/next-larger-element-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-sort-a-stack",
    "name": "Sort a Stack",
    "slug": "sort-a-stack",
    "type": "dsa",
    "category": "Stack and Queue",
    "subcategory": "Stack and Queue",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/sort-a-stack/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-final-prices-with-a-special-discount-in-a-shop",
    "name": "Next Smaller Element",
    "slug": "final-prices-with-a-special-discount-in-a-shop",
    "type": "dsa",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/final-prices-with-a-special-discount-in-a-shop/",
    "gfg": "https://www.geeksforgeeks.org/problems/help-classmates--141631/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-lru-cache",
    "name": "LRU Cache Implementation",
    "slug": "lru-cache",
    "type": "dsa",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "79",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/lru-cache/",
    "gfg": "https://www.geeksforgeeks.org/problems/lru-cache/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix",
      "Uber"
    ]
  },
  {
    "id": "dsa-lfu-cache",
    "name": "LFU Cache Implementation",
    "slug": "lfu-cache",
    "type": "dsa",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/lfu-cache/",
    "gfg": "https://www.geeksforgeeks.org/problems/lfu-cache/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix",
      "Uber"
    ]
  },
  {
    "id": "dsa-largest-rectangle-in-histogram",
    "name": "Largest Rectangle in Histogram",
    "slug": "largest-rectangle-in-histogram",
    "type": "dsa",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-rectangular-area-in-a-histogram-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-sliding-window-maximum",
    "name": "Sliding Window Maximum",
    "slug": "sliding-window-maximum",
    "type": "dsa",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-of-all-subarrays-of-size-k5901/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber",
      "Media.Net (Directi",
      "2023 repeated)",
      "Zenefits"
    ]
  },
  {
    "id": "dsa-min-stack",
    "name": "Implement Min Stack",
    "slug": "min-stack",
    "type": "dsa",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/min-stack/",
    "gfg": "https://www.geeksforgeeks.org/problems/get-minimum-element-from-stack/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-rotting-oranges",
    "name": "Rotten Oranges",
    "slug": "rotting-oranges",
    "type": "dsa",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/rotting-oranges/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotting-oranges2536/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-online-stock-span",
    "name": "Stock Span Problem",
    "slug": "online-stock-span",
    "type": "dsa",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/online-stock-span/",
    "gfg": "https://www.geeksforgeeks.org/problems/stock-span-problem-1587115621/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ]
  },
  {
    "id": "dsa-find-the-celebrity",
    "name": "The Celebrity Problem",
    "slug": "find-the-celebrity",
    "type": "dsa",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/find-the-celebrity/",
    "gfg": "https://www.geeksforgeeks.org/problems/the-celebrity-problem/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-maximum-of-minimum-for-every-window-size",
    "name": "Maximum of Minimum for Every Window Size",
    "slug": "maximum-of-minimum-for-every-window-size",
    "type": "dsa",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "difficulty": "Hard",
    "sheets": [
      "sde"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-of-minimum-for-every-window-size3453/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-reverse-words-in-a-string",
    "name": "Reverse Words in a String",
    "slug": "reverse-words-in-a-string",
    "type": "dsa",
    "category": "String",
    "subcategory": "String",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/reverse-words-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-words-in-a-given-string3547/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-longest-palindromic-substring",
    "name": "Longest Palindromic Substring",
    "slug": "longest-palindromic-substring",
    "type": "dsa",
    "category": "String",
    "subcategory": "String",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/longest-palindromic-substring/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-palindromic-substring0857/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-roman-to-integer",
    "name": "Roman to Integer",
    "slug": "roman-to-integer",
    "type": "dsa",
    "category": "String",
    "subcategory": "String",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/roman-to-integer/",
    "gfg": "https://www.geeksforgeeks.org/problems/roman-number-to-integer3201/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-string-to-integer-atoi",
    "name": "Implement String to Integer (ATOI)",
    "slug": "string-to-integer-atoi",
    "type": "dsa",
    "category": "String",
    "subcategory": "String",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/string-to-integer-atoi/",
    "gfg": "https://www.geeksforgeeks.org/problems/implement-atoi/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ]
  },
  {
    "id": "dsa-longest-common-prefix",
    "name": "Longest Common Prefix",
    "slug": "longest-common-prefix",
    "type": "dsa",
    "category": "String",
    "subcategory": "String",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/longest-common-prefix/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-common-prefix-in-an-array5129/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-repeated-string-match",
    "name": "Rabin Karp Algorithm",
    "slug": "repeated-string-match",
    "type": "dsa",
    "category": "String",
    "subcategory": "String",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/repeated-string-match/",
    "gfg": "https://www.geeksforgeeks.org/problems/rabin-karp-algorithm/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-find-the-index-of-the-first-occurrence-in-a-string",
    "name": "Z-Function",
    "slug": "find-the-index-of-the-first-occurrence-in-a-string",
    "type": "dsa",
    "category": "String Part-II",
    "subcategory": "String Part-II",
    "difficulty": "Hard",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-pattern-z-algorithm--141631/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-shortest-palindrome",
    "name": "Minimum Characters Needed to Make String Palindromic",
    "slug": "shortest-palindrome",
    "type": "dsa",
    "category": "String Part-II",
    "subcategory": "String Part-II",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/shortest-palindrome/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-characters-to-be-added-at-front-to-make-string-palindrome/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-valid-anagram",
    "name": "Valid Anagram",
    "slug": "valid-anagram",
    "type": "dsa",
    "category": "String Part-II",
    "subcategory": "String Part-II",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/valid-anagram/",
    "gfg": "https://www.geeksforgeeks.org/problems/anagram-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ]
  },
  {
    "id": "dsa-count-and-say",
    "name": "Count and Say",
    "slug": "count-and-say",
    "type": "dsa",
    "category": "String Part-II",
    "subcategory": "String Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/count-and-say/",
    "gfg": "https://www.geeksforgeeks.org/problems/decode-the-pattern1138/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ]
  },
  {
    "id": "dsa-compare-version-numbers",
    "name": "Compare Version Numbers",
    "slug": "compare-version-numbers",
    "type": "dsa",
    "category": "String Part-II",
    "subcategory": "String Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/compare-version-numbers/",
    "gfg": "https://www.geeksforgeeks.org/problems/compare-two-version-numbers/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Apple",
      "Nvidia",
      "Zoho"
    ]
  },
  {
    "id": "dsa-binary-tree-inorder-traversal",
    "name": "Inorder Traversal",
    "slug": "binary-tree-inorder-traversal",
    "type": "dsa",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/inorder-traversal/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "TCS"
    ]
  },
  {
    "id": "dsa-binary-tree-preorder-traversal",
    "name": "Preorder Traversal",
    "slug": "binary-tree-preorder-traversal",
    "type": "dsa",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/preorder-traversal/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-binary-tree-postorder-traversal",
    "name": "Postorder Traversal",
    "slug": "binary-tree-postorder-traversal",
    "type": "dsa",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/postorder-traversal/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-left-view-of-binary-tree",
    "name": "Left View of Binary Tree",
    "slug": "left-view-of-binary-tree",
    "type": "dsa",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "difficulty": "Easy",
    "sheets": [
      "sde"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/left-view-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-bottom-view-of-binary-tree",
    "name": "Bottom View of Binary Tree",
    "slug": "bottom-view-of-binary-tree",
    "type": "dsa",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-top-view-of-binary-tree",
    "name": "Top View of Binary Tree",
    "slug": "top-view-of-binary-tree",
    "type": "dsa",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/top-view-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-preorder-inorder-postorder-in-single-traversal",
    "name": "Preorder Inorder Postorder in Single Traversal",
    "slug": "preorder-inorder-postorder-in-single-traversal",
    "type": "dsa",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-vertical-order-traversal-of-a-binary-tree",
    "name": "Vertical Order Traversal",
    "slug": "vertical-order-traversal-of-a-binary-tree",
    "type": "dsa",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/print-a-binary-tree-in-vertical-order/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-binary-tree-paths",
    "name": "Root to Node Path in Binary Tree",
    "slug": "binary-tree-paths",
    "type": "dsa",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/binary-tree-paths/",
    "gfg": "https://www.geeksforgeeks.org/problems/root-to-leaf-paths/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-maximum-width-of-binary-tree",
    "name": "Max Width of Binary Tree",
    "slug": "maximum-width-of-binary-tree",
    "type": "dsa",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-width-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-width-of-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Flipkart"
    ]
  },
  {
    "id": "dsa-binary-tree-level-order-traversal",
    "name": "Level Order Traversal",
    "slug": "binary-tree-level-order-traversal",
    "type": "dsa",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/level-order-traversal/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-maximum-depth-of-binary-tree",
    "name": "Height of Binary Tree",
    "slug": "maximum-depth-of-binary-tree",
    "type": "dsa",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/height-of-binary-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-diameter-of-binary-tree",
    "name": "Diameter of Binary Tree",
    "slug": "diameter-of-binary-tree",
    "type": "dsa",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/diameter-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/diameter-of-binary-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-balanced-binary-tree",
    "name": "Check if Binary Tree is Height Balanced",
    "slug": "balanced-binary-tree",
    "type": "dsa",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/balanced-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-for-balanced-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-lowest-common-ancestor-of-a-binary-tree",
    "name": "Lowest Common Ancestor (LCA)",
    "slug": "lowest-common-ancestor-of-a-binary-tree",
    "type": "dsa",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-binary-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-same-tree",
    "name": "Check if Two Trees are Identical",
    "slug": "same-tree",
    "type": "dsa",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/same-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/determine-if-two-trees-are-identical/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-binary-tree-zigzag-level-order-traversal",
    "name": "Zig Zag Traversal",
    "slug": "binary-tree-zigzag-level-order-traversal",
    "type": "dsa",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/zigzag-tree-traversal/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-boundary-of-binary-tree",
    "name": "Boundary Traversal",
    "slug": "boundary-of-binary-tree",
    "type": "dsa",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/boundary-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/boundary-traversal-of-binary-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Adobe"
    ]
  },
  {
    "id": "dsa-binary-tree-maximum-path-sum",
    "name": "Maximum Path Sum",
    "slug": "binary-tree-maximum-path-sum",
    "type": "dsa",
    "category": "Binary Tree Part-III",
    "subcategory": "Binary Tree Part-III",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-path-sum-from-any-node/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-construct-binary-tree-from-preorder-and-inorder-traversal",
    "name": "Construct Tree from Preorder and Inorder",
    "slug": "construct-binary-tree-from-preorder-and-inorder-traversal",
    "type": "dsa",
    "category": "Binary Tree Part-III",
    "subcategory": "Binary Tree Part-III",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/construct-tree-1/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe",
      "Apple"
    ]
  },
  {
    "id": "dsa-construct-binary-tree-from-inorder-and-postorder-traversal",
    "name": "Construct Tree from Postorder and Inorder",
    "slug": "construct-binary-tree-from-inorder-and-postorder-traversal",
    "type": "dsa",
    "category": "Binary Tree Part-III",
    "subcategory": "Binary Tree Part-III",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/build-a-tree-concept/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Walmart"
    ]
  },
  {
    "id": "dsa-symmetric-tree",
    "name": "Symmetric Binary Tree",
    "slug": "symmetric-tree",
    "type": "dsa",
    "category": "Binary Tree Part-III",
    "subcategory": "Binary Tree Part-III",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/symmetric-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/symmetric-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-flatten-binary-tree-to-linked-list",
    "name": "Flatten Binary Tree to LinkedList",
    "slug": "flatten-binary-tree-to-linked-list",
    "type": "dsa",
    "category": "Binary Tree Part-III",
    "subcategory": "Binary Tree Part-III",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/flatten-binary-tree-to-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ]
  },
  {
    "id": "dsa-check-for-children-sum-property",
    "name": "Check for Children Sum Property",
    "slug": "check-for-children-sum-property",
    "type": "dsa",
    "category": "Binary Tree Part-III",
    "subcategory": "Binary Tree Part-III",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/children-sum-parent/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-invert-binary-tree",
    "name": "Invert a Binary Tree",
    "slug": "invert-binary-tree",
    "type": "dsa",
    "category": "Binary Tree Part-III",
    "subcategory": "Binary Tree Part-III",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/invert-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/mirror-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "LinkedIn"
    ]
  },
  {
    "id": "dsa-populating-next-right-pointers-in-each-node",
    "name": "Populating Next Right Pointers in Each Node",
    "slug": "populating-next-right-pointers-in-each-node",
    "type": "dsa",
    "category": "Binary Search Tree",
    "subcategory": "Binary Search Tree",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/populating-next-right-pointers-in-each-node/",
    "gfg": "https://www.geeksforgeeks.org/problems/connect-nodes-at-same-level/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ]
  },
  {
    "id": "dsa-search-in-a-binary-search-tree",
    "name": "Search in BST",
    "slug": "search-in-a-binary-search-tree",
    "type": "dsa",
    "category": "Binary Search Tree",
    "subcategory": "Binary Search Tree",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/search-in-a-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-a-node-in-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-convert-sorted-array-to-binary-search-tree",
    "name": "Convert Sorted Array to BST",
    "slug": "convert-sorted-array-to-binary-search-tree",
    "type": "dsa",
    "category": "Binary Search Tree",
    "subcategory": "Binary Search Tree",
    "difficulty": "Easy",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/array-to-bst4443/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-construct-binary-search-tree-from-preorder-traversal",
    "name": "Construct BST from Preorder Traversal",
    "slug": "construct-binary-search-tree-from-preorder-traversal",
    "type": "dsa",
    "category": "Binary Search Tree",
    "subcategory": "Binary Search Tree",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/construct-bst-from-postorder/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-validate-binary-search-tree",
    "name": "Validate BST",
    "slug": "validate-binary-search-tree",
    "type": "dsa",
    "category": "Binary Search Tree",
    "subcategory": "Binary Search Tree",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/validate-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-for-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-lowest-common-ancestor-of-a-binary-search-tree",
    "name": "Lowest Common Ancestor in BST",
    "slug": "lowest-common-ancestor-of-a-binary-search-tree",
    "type": "dsa",
    "category": "Binary Search Tree",
    "subcategory": "Binary Search Tree",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-inorder-successor-in-bst",
    "name": "Inorder Predecessor and Successor in BST",
    "slug": "inorder-successor-in-bst",
    "type": "dsa",
    "category": "Binary Search Tree",
    "subcategory": "Binary Search Tree",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/inorder-successor-in-bst/",
    "gfg": "https://www.geeksforgeeks.org/problems/predecessor-and-successor/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft"
    ]
  },
  {
    "id": "dsa-floor-in-bst",
    "name": "Floor in BST",
    "slug": "floor-in-bst",
    "type": "dsa",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/closest-binary-search-tree-value/",
    "gfg": "https://www.geeksforgeeks.org/problems/floor-in-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Microsoft",
      "Uber",
      "Bloomberg",
      "Snapchat"
    ]
  },
  {
    "id": "dsa-closest-binary-search-tree-value-ii",
    "name": "Ceil in BST",
    "slug": "closest-binary-search-tree-value-ii",
    "type": "dsa",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/closest-binary-search-tree-value-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/ceil-in-bst/1",
    "companies": [
      "Google",
      "Amazon",
      "LinkedIn"
    ]
  },
  {
    "id": "dsa-kth-smallest-element-in-a-bst",
    "name": "Kth Smallest Element in BST",
    "slug": "kth-smallest-element-in-a-bst",
    "type": "dsa",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-th-smallest-element-in-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg",
      "Apple"
    ]
  },
  {
    "id": "dsa-two-sum-iv-input-is-a-bst",
    "name": "Two Sum IV - Input is a BST",
    "slug": "two-sum-iv-input-is-a-bst",
    "type": "dsa",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/two-sum-iv-input-is-a-bst/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-a-pair-with-given-target-in-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-binary-search-tree-iterator",
    "name": "BST Iterator",
    "slug": "binary-search-tree-iterator",
    "type": "dsa",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/binary-search-tree-iterator/",
    "gfg": "https://www.geeksforgeeks.org/problems/binary-search-tree-iterator/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-maximum-sum-bst-in-binary-tree",
    "name": "Size of Largest BST in Binary Tree",
    "slug": "maximum-sum-bst-in-binary-tree",
    "type": "dsa",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-sum-bst-in-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/largest-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-serialize-and-deserialize-binary-tree",
    "name": "Serialize and Deserialize Binary Tree",
    "slug": "serialize-and-deserialize-binary-tree",
    "type": "dsa",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "blind75",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/serialize-and-deserialize-a-binary-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-binary-tree-to-double-linkedlist",
    "name": "Binary Tree to Double LinkedList",
    "slug": "binary-tree-to-double-linkedlist",
    "type": "dsa",
    "category": "Binary Trees [Misc]",
    "subcategory": "Binary Trees [Misc]",
    "difficulty": "Hard",
    "sheets": [
      "sde"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/binary-tree-to-dll/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-kth-largest-element-in-a-stream",
    "name": "Kth Largest Element in a Stream",
    "slug": "kth-largest-element-in-a-stream",
    "type": "dsa",
    "category": "Binary Trees [Misc]",
    "subcategory": "Binary Trees [Misc]",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
    "gfg": "https://www.geeksforgeeks.org/problems/kth-largest-element-in-a-stream2220/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-distinct-numbers-in-window",
    "name": "Distinct Numbers in Window",
    "slug": "distinct-numbers-in-window",
    "type": "dsa",
    "category": "Binary Trees [Misc]",
    "subcategory": "Binary Trees [Misc]",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/count-distinct-elements-in-every-window/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-clone-graph",
    "name": "Clone Graph",
    "slug": "clone-graph",
    "type": "dsa",
    "category": "Graph",
    "subcategory": "Graph",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/clone-graph/",
    "gfg": "https://www.geeksforgeeks.org/problems/clone-a-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-number-of-provinces",
    "name": "DFS Traversal of Graph",
    "slug": "number-of-provinces",
    "type": "dsa",
    "category": "Graph",
    "subcategory": "Graph",
    "difficulty": "Easy",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/number-of-provinces/",
    "gfg": "https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-graph-valid-tree",
    "name": "BFS Traversal of Graph",
    "slug": "graph-valid-tree",
    "type": "dsa",
    "category": "Graph",
    "subcategory": "Graph",
    "difficulty": "Easy",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/graph-valid-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "LinkedIn"
    ]
  },
  {
    "id": "dsa-course-schedule",
    "name": "Detect Cycle in Directed Graph using DFS",
    "slug": "course-schedule",
    "type": "dsa",
    "category": "Graph",
    "subcategory": "Graph",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/course-schedule/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-course-schedule-ii",
    "name": "Detect Cycle in Directed Graph using BFS (Kahn",
    "slug": "course-schedule-ii",
    "type": "dsa",
    "category": "Graph",
    "subcategory": "Graph",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/course-schedule-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ]
  },
  {
    "id": "dsa-number-of-islands",
    "name": "Number of Islands",
    "slug": "number-of-islands",
    "type": "dsa",
    "category": "Graph",
    "subcategory": "Graph",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/number-of-islands/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-the-number-of-islands/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-is-graph-bipartite",
    "name": "Bipartite Check BFS",
    "slug": "is-graph-bipartite",
    "type": "dsa",
    "category": "Graph",
    "subcategory": "Graph",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/is-graph-bipartite/",
    "gfg": "https://www.geeksforgeeks.org/problems/bipartite-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-critical-connections-in-a-network",
    "name": "Strongly Connected Components (Kosaraju",
    "slug": "critical-connections-in-a-network",
    "type": "dsa",
    "category": "Graph Part-II",
    "subcategory": "Graph Part-II",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/critical-connections-in-a-network/",
    "gfg": "https://www.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Flipkart"
    ]
  },
  {
    "id": "dsa-network-delay-time",
    "name": "Dijkstra",
    "slug": "network-delay-time",
    "type": "dsa",
    "category": "Graph Part-II",
    "subcategory": "Graph Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "79",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/network-delay-time/",
    "gfg": "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Netflix",
      "Bloomberg",
      "Uber"
    ]
  },
  {
    "id": "dsa-cheapest-flights-within-k-stops",
    "name": "Bellman Ford Algorithm",
    "slug": "cheapest-flights-within-k-stops",
    "type": "dsa",
    "category": "Graph Part-II",
    "subcategory": "Graph Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
    "gfg": "https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance",
    "name": "Floyd Warshall Algorithm",
    "slug": "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance",
    "type": "dsa",
    "category": "Graph Part-II",
    "subcategory": "Graph Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/",
    "gfg": "https://www.geeksforgeeks.org/problems/floyd-warshall4005/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-min-cost-to-connect-all-points",
    "name": "Prim",
    "slug": "min-cost-to-connect-all-points",
    "type": "dsa",
    "category": "Graph Part-II",
    "subcategory": "Graph Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/min-cost-to-connect-all-points/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Flipkart"
    ]
  },
  {
    "id": "dsa-maximum-product-subarray",
    "name": "Max Product Subarray",
    "slug": "maximum-product-subarray",
    "type": "dsa",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-product-subarray/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-product-subarray3608/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg",
      "Apple"
    ]
  },
  {
    "id": "dsa-longest-increasing-subsequence",
    "name": "Longest Increasing Subsequence (LIS)",
    "slug": "longest-increasing-subsequence",
    "type": "dsa",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/longest-increasing-subsequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-increasing-subsequence-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs",
      "Apple"
    ]
  },
  {
    "id": "dsa-longest-common-subsequence",
    "name": "Longest Common Subsequence (LCS)",
    "slug": "longest-common-subsequence",
    "type": "dsa",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/longest-common-subsequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-common-subsequence-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg",
      "FactSet",
      "Hike",
      "Citrix"
    ]
  },
  {
    "id": "dsa-partition-equal-subset-sum",
    "name": "0-1 Knapsack Problem",
    "slug": "partition-equal-subset-sum",
    "type": "dsa",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/partition-equal-subset-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0917/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-edit-distance",
    "name": "Edit Distance",
    "slug": "edit-distance",
    "type": "dsa",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/edit-distance/",
    "gfg": "https://www.geeksforgeeks.org/problems/edit-distance3702/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-maximum-ascending-subarray-sum",
    "name": "Maximum Sum Increasing Subsequence",
    "slug": "maximum-ascending-subarray-sum",
    "type": "dsa",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-ascending-subarray-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-sum-increasing-subsequence4749/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "TCS"
    ]
  },
  {
    "id": "dsa-burst-balloons",
    "name": "Matrix Chain Multiplication (MCM)",
    "slug": "burst-balloons",
    "type": "dsa",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/burst-balloons/",
    "gfg": "https://www.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-minimum-path-sum",
    "name": "Minimum Path Sum in Matrix",
    "slug": "minimum-path-sum",
    "type": "dsa",
    "category": "Dynamic Programming Part-II",
    "subcategory": "Dynamic Programming Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-path-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-cost-path3805/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-integer-break",
    "name": "Rod Cutting Problem",
    "slug": "integer-break",
    "type": "dsa",
    "category": "Dynamic Programming Part-II",
    "subcategory": "Dynamic Programming Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/integer-break/",
    "gfg": "https://www.geeksforgeeks.org/problems/rod-cutting0840/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-super-egg-drop",
    "name": "Egg Dropping Puzzle",
    "slug": "super-egg-drop",
    "type": "dsa",
    "category": "Dynamic Programming Part-II",
    "subcategory": "Dynamic Programming Part-II",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/super-egg-drop/",
    "gfg": "https://www.geeksforgeeks.org/problems/egg-dropping-puzzle-1587115620/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "D-E-Shaw",
      "Goldman Sachs",
      "Hike"
    ]
  },
  {
    "id": "dsa-word-break",
    "name": "Word Break Problem",
    "slug": "word-break",
    "type": "dsa",
    "category": "Dynamic Programming Part-II",
    "subcategory": "Dynamic Programming Part-II",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/word-break/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-break1352/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ]
  },
  {
    "id": "dsa-palindrome-partitioning-ii",
    "name": "Palindrome Partitioning II",
    "slug": "palindrome-partitioning-ii",
    "type": "dsa",
    "category": "Dynamic Programming Part-II",
    "subcategory": "Dynamic Programming Part-II",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/palindrome-partitioning-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/palindromic-patitioning4845/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-implement-trie-prefix-tree",
    "name": "Implement Trie (Prefix Tree)",
    "slug": "implement-trie-prefix-tree",
    "type": "dsa",
    "category": "Trie",
    "subcategory": "Trie",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/implement-trie-prefix-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/trie-insert-and-search0651/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-implement-trie-ii-prefix-tree",
    "name": "Implement Trie II",
    "slug": "implement-trie-ii-prefix-tree",
    "type": "dsa",
    "category": "Trie",
    "subcategory": "Trie",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/implement-trie-ii-prefix-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/trie-delete/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ]
  },
  {
    "id": "dsa-longest-word-in-dictionary",
    "name": "Longest String with All Prefixes",
    "slug": "longest-word-in-dictionary",
    "type": "dsa",
    "category": "Trie",
    "subcategory": "Trie",
    "difficulty": "Medium",
    "sheets": [
      "sde"
    ],
    "leetcode": "https://leetcode.com/problems/longest-word-in-dictionary/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-string-with-all-prefixes/1",
    "companies": [
      "Google",
      "Amazon"
    ]
  },
  {
    "id": "dsa-number-of-distinct-substrings-in-a-string",
    "name": "Number of Distinct Substrings in String",
    "slug": "number-of-distinct-substrings-in-a-string",
    "type": "dsa",
    "category": "Trie",
    "subcategory": "Trie",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/number-of-distinct-substrings-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-number-of-substrings4528/1",
    "companies": [
      "Uber",
      "Bloomberg",
      "Intuit"
    ]
  },
  {
    "id": "dsa-maximum-xor-of-two-numbers-in-an-array",
    "name": "Maximum XOR of Two Numbers in an Array",
    "slug": "maximum-xor-of-two-numbers-in-an-array",
    "type": "dsa",
    "category": "Trie",
    "subcategory": "Trie",
    "difficulty": "Medium",
    "sheets": [
      "sde",
      "79",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-xor-of-two-numbers-in-an-array/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "MICROSOFT"
    ]
  },
  {
    "id": "dsa-maximum-xor-with-an-element-from-array",
    "name": "Maximum XOR With an Element From Array",
    "slug": "maximum-xor-with-an-element-from-array",
    "type": "dsa",
    "category": "Trie",
    "subcategory": "Trie",
    "difficulty": "Hard",
    "sheets": [
      "sde",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-xor-with-an-element-from-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-xor-with-an-element-from-array/1",
    "companies": [
      "Google"
    ]
  },
  {
    "id": "dsa-contains-duplicate",
    "name": "Contains Duplicate",
    "slug": "contains-duplicate",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/contains-duplicate/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-product-of-array-except-self",
    "name": "Product of Array Except Self",
    "slug": "product-of-array-except-self",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/product-of-array-except-self/",
    "gfg": "https://www.geeksforgeeks.org/problems/a-difference-of-values-and-indexes0539/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-find-minimum-in-rotated-sorted-array",
    "name": "Find Minimum in Rotated Sorted Array",
    "slug": "find-minimum-in-rotated-sorted-array",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-element-in-a-sorted-and-rotated-array3626/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-3-sum",
    "name": "3 Sum",
    "slug": "3-sum",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/3sum/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-container-with-most-water",
    "name": "Container With Most Water",
    "slug": "container-with-most-water",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/container-with-most-water/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-sum-of-two-integers",
    "name": "Sum of Two Integers",
    "slug": "sum-of-two-integers",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/sum-of-two-integers/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-number-of-1-bits",
    "name": "Number of 1 Bits",
    "slug": "number-of-1-bits",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/number-of-1-bits/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-counting-bits",
    "name": "Counting Bits",
    "slug": "counting-bits",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/counting-bits/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-missing-number",
    "name": "Missing Number",
    "slug": "missing-number",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/missing-number",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-reverse-bits",
    "name": "Reverse Bits",
    "slug": "reverse-bits",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/reverse-bits/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-reverse-a-linked-list",
    "name": "Reverse a Linked List",
    "slug": "reverse-a-linked-list",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-detect-cycle-in-a-linked-list",
    "name": "Detect Cycle in a Linked List",
    "slug": "detect-cycle-in-a-linked-list",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/linked-list-cycle/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-reorder-list",
    "name": "Reorder List",
    "slug": "reorder-list",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/reorder-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/reorder-list/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-climbing-stairs",
    "name": "Climbing Stairs",
    "slug": "climbing-stairs",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/climbing-stairs/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-ways-to-reach-the-nth-stair-1587115620/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-word-break-problem",
    "name": "Word Break Problem",
    "slug": "word-break-problem",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/word-break/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-house-robber",
    "name": "House Robber",
    "slug": "house-robber",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/house-robber/",
    "gfg": "https://www.geeksforgeeks.org/problems/max-sum-without-adjacents2430/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-house-robber-ii",
    "name": "House Robber II",
    "slug": "house-robber-ii",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/house-robber-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/house-robber-ii/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-decode-ways",
    "name": "Decode Ways",
    "slug": "decode-ways",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/decode-ways/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-jump-game",
    "name": "Jump Game",
    "slug": "jump-game",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/jump-game/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-longest-repeating-character-replacement",
    "name": "Longest Repeating Character Replacement",
    "slug": "longest-repeating-character-replacement",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/longest-repeating-character-replacement/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-repeating-character-replacement/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-minimum-window-substring",
    "name": "Minimum Window Substring",
    "slug": "minimum-window-substring",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "79",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-window-substring/",
    "gfg": "https://www.geeksforgeeks.org/problems/smallest-window-in-a-string-containing-all-the-characters-of-another-string-1587115621/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Uber",
      "Codenation",
      "FactSet"
    ]
  },
  {
    "id": "dsa-group-anagrams",
    "name": "Group Anagrams",
    "slug": "group-anagrams",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/group-anagrams/",
    "gfg": "https://www.geeksforgeeks.org/problems/print-anagrams-together/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-valid-palindrome",
    "name": "Valid Palindrome",
    "slug": "valid-palindrome",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/valid-palindrome/",
    "gfg": "https://www.geeksforgeeks.org/problems/string-palindrome4521/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-palindromic-substrings",
    "name": "Palindromic Substrings",
    "slug": "palindromic-substrings",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "79",
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/palindromic-substrings/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-palindromic-subsequences/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-encode-and-decode-strings-leetcode-premium",
    "name": "Encode and Decode Strings (Leetcode Premium)",
    "slug": "encode-and-decode-strings-leetcode-premium",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/encode-and-decode-strings/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-pacific-atlantic-water-flow",
    "name": "Pacific Atlantic Water Flow",
    "slug": "pacific-atlantic-water-flow",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    "gfg": "https://www.geeksforgeeks.org/problems/pacific-atlantic-water-flow/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Bloomberg",
      "Adobe"
    ]
  },
  {
    "id": "dsa-alien-dictionary-leetcode-premium",
    "name": "Alien Dictionary (Leetcode Premium)",
    "slug": "alien-dictionary-leetcode-premium",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/alien-dictionary/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-graph-valid-tree-leetcode-premium",
    "name": "Graph Valid Tree (Leetcode Premium)",
    "slug": "graph-valid-tree-leetcode-premium",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/graph-valid-tree/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-number-of-connected-components-in-an-undirected-graph-leetcode-premium",
    "name": "Number of Connected Components in an Undirected Graph (Leetcode Premium)",
    "slug": "number-of-connected-components-in-an-undirected-graph-leetcode-premium",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-insert-interval",
    "name": "Insert Interval",
    "slug": "insert-interval",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/insert-interval/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Google Online Round (2021)",
      "Twitter",
      "Uber"
    ]
  },
  {
    "id": "dsa-non-overlapping-intervals",
    "name": "Non-overlapping Intervals",
    "slug": "non-overlapping-intervals",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/non-overlapping-intervals/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-meeting-rooms-leetcode-premium",
    "name": "Meeting Rooms (Leetcode Premium)",
    "slug": "meeting-rooms-leetcode-premium",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/meeting-rooms/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-meeting-rooms-ii-leetcode-premium",
    "name": "Meeting Rooms II (Leetcode Premium)",
    "slug": "meeting-rooms-ii-leetcode-premium",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/meeting-rooms-ii/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-spiral-matrix",
    "name": "Spiral Matrix",
    "slug": "spiral-matrix",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/spiral-matrix/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-word-search",
    "name": "Word Search",
    "slug": "word-search",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/word-search/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-search/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Netflix"
    ]
  },
  {
    "id": "dsa-invert-flip-binary-tree",
    "name": "Invert/Flip Binary Tree",
    "slug": "invert-flip-binary-tree",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/invert-binary-tree/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-subtree-of-another-tree",
    "name": "Subtree of Another Tree",
    "slug": "subtree-of-another-tree",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75",
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/subtree-of-another-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-if-subtree/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple",
      "Bloomberg",
      "eBay"
    ]
  },
  {
    "id": "dsa-lowest-common-ancestor-of-bst",
    "name": "Lowest Common Ancestor of BST",
    "slug": "lowest-common-ancestor-of-bst",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-add-and-search-word",
    "name": "Add and Search Word",
    "slug": "add-and-search-word",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/add-and-search-word-data-structure-design/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-word-search-ii",
    "name": "Word Search II",
    "slug": "word-search-ii",
    "type": "dsa",
    "category": "Blind 75",
    "subcategory": "Blind 75 Essentials",
    "difficulty": "Medium",
    "sheets": [
      "blind75"
    ],
    "leetcode": "https://leetcode.com/problems/word-search-ii/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-binary-search",
    "name": "Binary Search",
    "slug": "binary-search",
    "type": "dsa",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "difficulty": "Easy",
    "sheets": [
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/binary-search/",
    "gfg": "https://www.geeksforgeeks.org/problems/binary-search-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ]
  },
  {
    "id": "dsa-koko-eating-bananas",
    "name": "Koko Eating Bananas",
    "slug": "koko-eating-bananas",
    "type": "dsa",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "difficulty": "Medium",
    "sheets": [
      "79",
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/koko-eating-bananas/",
    "gfg": "https://www.geeksforgeeks.org/problems/koko-eating-bananas/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix",
      "Miscrosoft"
    ]
  },
  {
    "id": "dsa-evaluate-reverse-polish-notation",
    "name": "Evaluate Reverse Polish Notation",
    "slug": "evaluate-reverse-polish-notation",
    "type": "dsa",
    "category": "Stacks/Queues",
    "subcategory": "Stacks/Queues",
    "difficulty": "Medium",
    "sheets": [
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
    "gfg": "https://www.geeksforgeeks.org/problems/evaluation-of-postfix-expression1735/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-daily-temperatures",
    "name": "Daily Temperatures",
    "slug": "daily-temperatures",
    "type": "dsa",
    "category": "Stacks/Queues",
    "subcategory": "Stacks/Queues",
    "difficulty": "Medium",
    "sheets": [
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/daily-temperatures/",
    "gfg": "https://www.geeksforgeeks.org/problems/next-larger-element-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-car-fleet",
    "name": "Car Fleet",
    "slug": "car-fleet",
    "type": "dsa",
    "category": "Stacks/Queues",
    "subcategory": "Stacks/Queues",
    "difficulty": "Medium",
    "sheets": [
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/car-fleet/",
    "gfg": "https://www.geeksforgeeks.org/problems/car-fleet/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-task-scheduler",
    "name": "Task Scheduler",
    "slug": "task-scheduler",
    "type": "dsa",
    "category": "Heaps",
    "subcategory": "Heaps",
    "difficulty": "Medium",
    "sheets": [
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/task-scheduler/",
    "gfg": "https://www.geeksforgeeks.org/problems/task-scheduler/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-max-area-of-island",
    "name": "Max Area of Island",
    "slug": "max-area-of-island",
    "type": "dsa",
    "category": "Graphs",
    "subcategory": "Graphs",
    "difficulty": "Medium",
    "sheets": [
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/max-area-of-island/",
    "gfg": "https://www.geeksforgeeks.org/problems/max-area-of-island/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-surrounded-regions",
    "name": "Surrounded Regions",
    "slug": "surrounded-regions",
    "type": "dsa",
    "category": "Graphs",
    "subcategory": "Graphs",
    "difficulty": "Medium",
    "sheets": [
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/surrounded-regions/",
    "gfg": "https://www.geeksforgeeks.org/problems/replace-o-with-x4256/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-redundant-connection",
    "name": "Redundant Connection",
    "slug": "redundant-connection",
    "type": "dsa",
    "category": "Graphs",
    "subcategory": "Graphs",
    "difficulty": "Medium",
    "sheets": [
      "79"
    ],
    "leetcode": "https://leetcode.com/problems/redundant-connection/",
    "gfg": "https://www.geeksforgeeks.org/problems/redundant-connection/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ]
  },
  {
    "id": "dsa-word-ladder",
    "name": "Word Ladder",
    "slug": "word-ladder",
    "type": "dsa",
    "category": "Graphs",
    "subcategory": "Graphs",
    "difficulty": "Hard",
    "sheets": [
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/word-ladder/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-ladder/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-alien-dictionary",
    "name": "Alien Dictionary",
    "slug": "alien-dictionary",
    "type": "dsa",
    "category": "Graphs",
    "subcategory": "Graphs",
    "difficulty": "Hard",
    "sheets": [
      "79",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/alien-dictionary/",
    "gfg": "https://www.geeksforgeeks.org/problems/alien-dictionary/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-design-add-and-search-words-data-structure",
    "name": "Design Add and Search Words Data Structure",
    "slug": "design-add-and-search-words-data-structure",
    "type": "dsa",
    "category": "Tries",
    "subcategory": "Tries",
    "difficulty": "Medium",
    "sheets": [
      "79",
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
    "gfg": "https://www.geeksforgeeks.org/problems/trie-insert-and-search0651/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg",
      "Uber"
    ]
  },
  {
    "id": "dsa-dijkstra-s-algorithm-part-1",
    "name": "Dijkstra's Algorithm Part - 1",
    "slug": "dijkstra-s-algorithm-part-1",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-dijkstra-s-algorithm-part-2",
    "name": "Dijkstra's Algorithm Part - 2",
    "slug": "dijkstra-s-algorithm-part-2",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-dijkstra-s-algorithm-part-3",
    "name": "Dijkstra's Algorithm Part - 3",
    "slug": "dijkstra-s-algorithm-part-3",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-design-graph-with-shortest-path-calculator",
    "name": "Design Graph With Shortest Path Calculator",
    "slug": "design-graph-with-shortest-path-calculator",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/restore-the-array-from-adjacent-pairs/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-find-edges-in-shortest-paths",
    "name": "Find Edges in Shortest Paths",
    "slug": "find-edges-in-shortest-paths",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-freedom-trail",
    "name": "Freedom Trail",
    "slug": "freedom-trail",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/freedom-trail/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-minimum-cost-to-convert-string-i",
    "name": "Minimum Cost to Convert String I",
    "slug": "minimum-cost-to-convert-string-i",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-cost-to-convert-string-i/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-minimum-cost-to-make-at-least-one-valid-path-in-a-grid",
    "name": "Minimum Cost to Make at Least One Valid Path in a Grid",
    "slug": "minimum-cost-to-make-at-least-one-valid-path-in-a-grid",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-minimum-obstacle-removal-to-reach-corner",
    "name": "Minimum Obstacle Removal to Reach Corner",
    "slug": "minimum-obstacle-removal-to-reach-corner",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-obstacle-removal-to-reach-corner/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-minimum-time-to-visit-a-cell-in-a-grid",
    "name": "Minimum Time to Visit a Cell In a Grid",
    "slug": "minimum-time-to-visit-a-cell-in-a-grid",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-time-to-visit-a-cell-in-a-grid/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-modify-graph-edge-weights",
    "name": "Modify Graph Edge Weights",
    "slug": "modify-graph-edge-weights",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/modify-graph-edge-weights/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-path-with-minimum-effort",
    "name": "Path With Minimum Effort",
    "slug": "path-with-minimum-effort",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/path-with-minimum-effort/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber",
      "Meta",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-path-with-maximum-probability",
    "name": "Path with Maximum Probability",
    "slug": "path-with-maximum-probability",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/path-with-maximum-probability/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-second-minimum-time-to-reach-destination",
    "name": "Second Minimum Time to Reach Destination",
    "slug": "second-minimum-time-to-reach-destination",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/second-minimum-time-to-reach-destination/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-shortest-distance-after-road-addition-queries-i",
    "name": "Shortest Distance After Road Addition Queries I",
    "slug": "shortest-distance-after-road-addition-queries-i",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/shortest-distance-after-road-addition-queries-i/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-shortest-path-in-binary-matrix",
    "name": "Shortest Path in Binary Matrix",
    "slug": "shortest-path-in-binary-matrix",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber",
      "Meta",
      "Apple"
    ]
  },
  {
    "id": "dsa-so-guys-aao-story-se-code-likhe",
    "name": "So guys, \"Aao, Story Se Code Likhe\"",
    "slug": "so-guys-aao-story-se-code-likhe",
    "type": "dsa",
    "category": "Dijkstras Algo Based Qns",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/so-guys-aao-story-se-code-likhe/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-factorial-of-large-numbers",
    "name": "Factorial Of Large Numbers",
    "slug": "factorial-of-large-numbers",
    "type": "dsa",
    "category": "ARRAY",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://practice.geeksforgeeks.org/problems/factorials-of-large-numbers2508/1?utm_source=gfg&utm_medium=article&utm_campaign=bottom_sticky_on_article",
    "companies": [
      "ADOBE",
      "BROWSERSTACK",
      "MAKEMYTRIP",
      "MAQ SOFTWARE",
      "MICROSOFT"
    ]
  },
  {
    "id": "dsa-kadane-s-algorithm-maximum-subarray",
    "name": "Kadane's Algorithm (Maximum Subarray)",
    "slug": "kadane-s-algorithm-maximum-subarray",
    "type": "dsa",
    "category": "ARRAY",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-subarray/",
    "gfg": "",
    "companies": [
      "VMWare",
      "Zoho",
      "Flipkart",
      "Morgan Stanley",
      "Accolite"
    ]
  },
  {
    "id": "dsa-maximum-sum-circular-subarray",
    "name": "Maximum Sum Circular Subarray",
    "slug": "maximum-sum-circular-subarray",
    "type": "dsa",
    "category": "ARRAY",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-sum-circular-subarray/",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft"
    ]
  },
  {
    "id": "dsa-3sum-closest",
    "name": "3Sum Closest",
    "slug": "3sum-closest",
    "type": "dsa",
    "category": "ARRAY",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/3sum-closest/",
    "gfg": "",
    "companies": [
      "Facebook",
      "Amazon",
      "Microsoft",
      "Oracle"
    ]
  },
  {
    "id": "dsa-arithmetic-subarrays",
    "name": "Arithmetic Subarrays",
    "slug": "arithmetic-subarrays",
    "type": "dsa",
    "category": "ARRAY",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/arithmetic-subarrays",
    "gfg": "",
    "companies": [
      "Atlassian Online Assessment"
    ]
  },
  {
    "id": "dsa-maximum-number-of-events-that-can-be-attended-ii",
    "name": "Maximum Number of Events That Can Be Attended II",
    "slug": "maximum-number-of-events-that-can-be-attended-ii",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-number-of-events-that-can-be-attended/",
    "gfg": "",
    "companies": [
      "Amazon Online Assessment"
    ]
  },
  {
    "id": "dsa-data-stream-as-disjoint-intervals",
    "name": "Data Stream as Disjoint Intervals",
    "slug": "data-stream-as-disjoint-intervals",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/data-stream-as-disjoint-intervals/",
    "gfg": "",
    "companies": [
      "Amazon"
    ]
  },
  {
    "id": "dsa-interval-list-intersections",
    "name": "Interval List Intersections",
    "slug": "interval-list-intersections",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/interval-list-intersections/",
    "gfg": "",
    "companies": [
      "Amazon",
      "Meta",
      "Microsoft"
    ]
  },
  {
    "id": "dsa-meeting-rooms-iii",
    "name": "Meeting Rooms III",
    "slug": "meeting-rooms-iii",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/meeting-rooms-iii/description/",
    "gfg": "",
    "companies": [
      "Google"
    ]
  },
  {
    "id": "dsa-maximum-beauty-of-an-array-after-applying-operation",
    "name": "Maximum Beauty of an Array After Applying Operation",
    "slug": "maximum-beauty-of-an-array-after-applying-operation",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-beauty-of-an-array-after-applying-operation",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-divide-intervals-into-minimum-number-of-groups",
    "name": "Divide Intervals Into Minimum Number of Groups",
    "slug": "divide-intervals-into-minimum-number-of-groups",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/divide-intervals-into-minimum-number-of-groups",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-my-calendar-i",
    "name": "My Calendar I",
    "slug": "my-calendar-i",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/my-calendar-i/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-my-calendar-ii",
    "name": "My Calendar II",
    "slug": "my-calendar-ii",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/my-calendar-ii",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-special-array-ii",
    "name": "Special Array II",
    "slug": "special-array-ii",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/special-array-ii",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-the-number-of-the-smallest-unoccupied-chair",
    "name": "The Number of the Smallest Unoccupied Chair",
    "slug": "the-number-of-the-smallest-unoccupied-chair",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/the-number-of-the-smallest-unoccupied-chair/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-two-best-non-overlapping-events",
    "name": "Two Best Non-Overlapping Events",
    "slug": "two-best-non-overlapping-events",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/two-best-non-overlapping-events",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-count-days-without-meetings",
    "name": "Count Days Without Meetings",
    "slug": "count-days-without-meetings",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/count-days-without-meetings",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-check-if-grid-can-be-cut-into-sections",
    "name": "Check if Grid can be Cut into Sections",
    "slug": "check-if-grid-can-be-cut-into-sections",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/check-if-grid-can-be-cut-into-sections",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-minimum-operations-to-make-array-elements-zero",
    "name": "Minimum Operations to Make Array Elements Zero",
    "slug": "minimum-operations-to-make-array-elements-zero",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-operations-to-make-array-elements-zero/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-github-complete-list-of-interval-based",
    "name": "Github Complete List Of Interval Based",
    "slug": "github-complete-list-of-interval-based",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/github-complete-list-of-interval-based/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-google-s-favourite-topic-google-s-favourite-topic-google-s-favourite-topic-google-s-favourite-topic-google-s-favourite-topic",
    "name": "GOOGLE's FAVOURITE TOPIC.             GOOGLE's FAVOURITE TOPIC.            GOOGLE's FAVOURITE TOPIC.             GOOGLE's FAVOURITE TOPIC.             GOOGLE's FAVOURITE TOPIC.",
    "slug": "google-s-favourite-topic-google-s-favourite-topic-google-s-favourite-topic-google-s-favourite-topic-google-s-favourite-topic",
    "type": "dsa",
    "category": "ARRAY INTERVAL BASED",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/google-s-favourite-topic-google-s-favourite-topic-google-s-favourite-topic-google-s-favourite-topic-google-s-favourite-topic/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-search-in-rotated-sorted-array-ii",
    "name": "Search in Rotated Sorted Array II",
    "slug": "search-in-rotated-sorted-array-ii",
    "type": "dsa",
    "category": "BINARY SEARCH",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/",
    "gfg": "",
    "companies": [
      "Adobe",
      "Amazon",
      "Microsoft",
      "Morgan Stanley",
      "Samsung",
      "Google",
      "Meta",
      "Bloomberg",
      "LinkedIn"
    ]
  },
  {
    "id": "dsa-last-day-where-you-can-still-cross",
    "name": "Last Day Where You Can Still Cross",
    "slug": "last-day-where-you-can-still-cross",
    "type": "dsa",
    "category": "BINARY SEARCH",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/last-day-where-you-can-still-cross/",
    "gfg": "",
    "companies": [
      "GOOGLE (on site interview)",
      "META"
    ]
  },
  {
    "id": "dsa-minimum-speed-to-arrive-on-time",
    "name": "Minimum Speed to Arrive on Time",
    "slug": "minimum-speed-to-arrive-on-time",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-speed-to-arrive-on-time/",
    "gfg": "",
    "companies": [
      "Google"
    ]
  },
  {
    "id": "dsa-minimum-number-of-days-to-make-m-bouquets",
    "name": "Minimum Number of Days to Make m Bouquets",
    "slug": "minimum-number-of-days-to-make-m-bouquets",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Meta",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ]
  },
  {
    "id": "dsa-kth-missing-positive-number",
    "name": "Kth Missing Positive Number",
    "slug": "kth-missing-positive-number",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/kth-missing-positive-number/",
    "gfg": "",
    "companies": [
      "Google",
      "Apple",
      "Amazon",
      "Meta",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ]
  },
  {
    "id": "dsa-allocate-minimum-number-of-pages",
    "name": "Allocate minimum number of pages",
    "slug": "allocate-minimum-number-of-pages",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://practice.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1",
    "companies": [
      "Infosys",
      "Amazon",
      "Microsoft",
      "Google",
      "Codenation"
    ]
  },
  {
    "id": "dsa-minimize-the-maximum-difference-of-pairs",
    "name": "Minimize the Maximum Difference of Pairs",
    "slug": "minimize-the-maximum-difference-of-pairs",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/minimize-the-maximum-difference-of-pairs/",
    "gfg": "",
    "companies": [
      "META"
    ]
  },
  {
    "id": "dsa-maximum-value-at-a-given-index-in-a-bounded-array",
    "name": "Maximum Value at a Given Index in a Bounded Array",
    "slug": "maximum-value-at-a-given-index-in-a-bounded-array",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-value-at-a-given-index-in-a-bounded-array/",
    "gfg": "",
    "companies": [
      "GOOGLE"
    ]
  },
  {
    "id": "dsa-apply-operations-to-maximize-frequency-score",
    "name": "Apply Operations to Maximize Frequency Score",
    "slug": "apply-operations-to-maximize-frequency-score",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/apply-operations-to-maximize-frequency-score/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-maximum-number-that-sum-of-the-prices-is-less-than-or-equal-to-k",
    "name": "Maximum Number That Sum of the Prices Is Less Than or Equal to K",
    "slug": "maximum-number-that-sum-of-the-prices-is-less-than-or-equal-to-k",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-number-that-sum-of-the-prices-is-less-than-or-equal-to-k/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-maximize-the-minimum-game-score",
    "name": "Maximize the Minimum Game Score",
    "slug": "maximize-the-minimum-game-score",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximize-the-minimum-game-score/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-maximum-candies-allocated-to-k-children",
    "name": "Maximum Candies Allocated to K Children",
    "slug": "maximum-candies-allocated-to-k-children",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-candies-allocated-to-k-children",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-house-robber-iv",
    "name": "House Robber IV",
    "slug": "house-robber-iv",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/house-robber-iv/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-minimum-time-to-repair-cars",
    "name": "Minimum Time to Repair Cars",
    "slug": "minimum-time-to-repair-cars",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-time-to-repair-cars/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-maximum-number-of-tasks-you-can-assign",
    "name": "Maximum Number of Tasks You Can Assign",
    "slug": "maximum-number-of-tasks-you-can-assign",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-number-of-tasks-you-can-assign",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-minimize-the-maximum-adjacent-element-difference",
    "name": "Minimize the Maximum Adjacent Element Difference",
    "slug": "minimize-the-maximum-adjacent-element-difference",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/minimize-the-maximum-adjacent-element-difference/description/",
    "gfg": "",
    "companies": [
      "Google"
    ]
  },
  {
    "id": "dsa-minimum-number-of-seconds-to-make-mountain-height-zero",
    "name": "Minimum Number of Seconds to Make Mountain Height Zero",
    "slug": "minimum-number-of-seconds-to-make-mountain-height-zero",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-number-of-seconds-to-make-mountain-height-zero",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-maximize-spanning-tree-stability-with-upgrades",
    "name": "Maximize Spanning Tree Stability with Upgrades",
    "slug": "maximize-spanning-tree-stability-with-upgrades",
    "type": "dsa",
    "category": "BINARY SEARCH ON ANSWER",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximize-spanning-tree-stability-with-upgrades/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-reorder-data-in-log-files",
    "name": "Reorder Data in Log Files",
    "slug": "reorder-data-in-log-files",
    "type": "dsa",
    "category": "STRINGS",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/reorder-data-in-log-files/",
    "gfg": "",
    "companies": [
      "Amazon Online Assessment"
    ]
  },
  {
    "id": "dsa-add-strings",
    "name": "Add Strings",
    "slug": "add-strings",
    "type": "dsa",
    "category": "STRINGS",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/add-strings/",
    "gfg": "",
    "companies": [
      "Bloomberg Phone Interview",
      "Airbnb",
      "Google"
    ]
  },
  {
    "id": "dsa-single-row-keyboard-time-to-type-a-string",
    "name": "single row keyboard / Time to Type a String",
    "slug": "single-row-keyboard-time-to-type-a-string",
    "type": "dsa",
    "category": "STRINGS",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/single-row-keyboard/",
    "gfg": "",
    "companies": [
      "Google OA round"
    ]
  },
  {
    "id": "dsa-remove-duplicate-letters",
    "name": "Remove Duplicate Letters",
    "slug": "remove-duplicate-letters",
    "type": "dsa",
    "category": "STRINGS",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/remove-duplicate-letters/",
    "gfg": "",
    "companies": [
      "GOOGLE",
      "Oracle Online Assessment"
    ]
  },
  {
    "id": "dsa-knuth-morris-pratt-kmp-string-matching-algorithm",
    "name": "Knuth-Morris-Pratt KMP String Matching Algorithm",
    "slug": "knuth-morris-pratt-kmp-string-matching-algorithm",
    "type": "dsa",
    "category": "STRING ALGORITHMS",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/search-pattern0205/1",
    "companies": [
      "Google"
    ]
  },
  {
    "id": "dsa-find-beautiful-indices-in-the-given-array-i-ii",
    "name": "Find Beautiful Indices in the Given Array I & II",
    "slug": "find-beautiful-indices-in-the-given-array-i-ii",
    "type": "dsa",
    "category": "STRING ALGORITHMS",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/find-beautiful-indices-in-the-given-array-ii",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-number-of-subarrays-that-match-a-pattern-i-ii",
    "name": "Number of Subarrays That Match a Pattern I & II",
    "slug": "number-of-subarrays-that-match-a-pattern-i-ii",
    "type": "dsa",
    "category": "STRING ALGORITHMS",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/number-of-subarrays-that-match-a-pattern-ii/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-contains-duplicate-ii",
    "name": "Contains Duplicate II",
    "slug": "contains-duplicate-ii",
    "type": "dsa",
    "category": "SLIDING WINDOW",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/contains-duplicate-ii/",
    "gfg": "",
    "companies": [
      "Airbnb",
      "Palantir Technologies"
    ]
  },
  {
    "id": "dsa-contains-duplicate-iii",
    "name": "Contains Duplicate III",
    "slug": "contains-duplicate-iii",
    "type": "dsa",
    "category": "SLIDING WINDOW",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/contains-duplicate-iii/",
    "gfg": "",
    "companies": [
      "Palantir",
      "Palantir Technologies",
      "Airbnb"
    ]
  },
  {
    "id": "dsa-shortest-subarray-with-sum-at-least-k",
    "name": "Shortest Subarray with Sum at Least K",
    "slug": "shortest-subarray-with-sum-at-least-k",
    "type": "dsa",
    "category": "SLIDING WINDOW",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-constrained-subsequence-sum",
    "name": "Constrained Subsequence Sum",
    "slug": "constrained-subsequence-sum",
    "type": "dsa",
    "category": "SLIDING WINDOW",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/constrained-subsequence-sum/description/",
    "gfg": "",
    "companies": [
      "Google",
      "HyperVerge"
    ]
  },
  {
    "id": "dsa-find-duplicates-within-a-range-k-in-an-array",
    "name": "Find duplicates within a range `k` in an array",
    "slug": "find-duplicates-within-a-range-k-in-an-array",
    "type": "dsa",
    "category": "SLIDING WINDOW",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/check-given-array-contains-duplicate-elements-within-k-distance/",
    "companies": [
      "Amazon"
    ]
  },
  {
    "id": "dsa-frequency-of-the-most-frequent-element",
    "name": "Frequency of the Most Frequent Element",
    "slug": "frequency-of-the-most-frequent-element",
    "type": "dsa",
    "category": "SLIDING WINDOW",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/frequency-of-the-most-frequent-element/",
    "gfg": "",
    "companies": [
      "Meta",
      "Google",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-count-complete-substrings",
    "name": "Count Complete Substrings",
    "slug": "count-complete-substrings",
    "type": "dsa",
    "category": "SLIDING WINDOW",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/count-complete-substrings/description/",
    "gfg": "",
    "companies": [
      "will update soon"
    ]
  },
  {
    "id": "dsa-largest-sum-subarray-of-size-at-least-k",
    "name": "Largest Sum Subarray of Size at least K.",
    "slug": "largest-sum-subarray-of-size-at-least-k",
    "type": "dsa",
    "category": "SLIDING WINDOW",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/largest-sum-subarray-of-size-at-least-k3121/1",
    "companies": [
      "Facebook",
      "Paytm",
      "Myntra"
    ]
  },
  {
    "id": "dsa-binary-subarrays-with-sum",
    "name": "Binary Subarrays With Sum",
    "slug": "binary-subarrays-with-sum",
    "type": "dsa",
    "category": "SLIDING WINDOW",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/binary-subarrays-with-sum/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber",
      "Meta",
      "Bloomberg",
      "Nvidia"
    ]
  },
  {
    "id": "dsa-find-subarray-with-bitwise-and-closest-to-k",
    "name": "Find Subarray With Bitwise AND Closest to K",
    "slug": "find-subarray-with-bitwise-and-closest-to-k",
    "type": "dsa",
    "category": "SLIDING WINDOW",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/find-subarray-with-bitwise-and-closest-to-k/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit",
    "name": "Longest Continuous Subarray With Absolute Diff Less\nThan or Equal to Limit",
    "slug": "longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit",
    "type": "dsa",
    "category": "SLIDING WINDOW",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/",
    "gfg": "",
    "companies": [
      "Uber"
    ]
  },
  {
    "id": "dsa-maximum-points-after-collecting-coins-from-all-nodes",
    "name": "Maximum Points After Collecting Coins From All Nodes",
    "slug": "maximum-points-after-collecting-coins-from-all-nodes",
    "type": "dsa",
    "category": "DP",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-points-after-collecting-coins-from-all-nodes/",
    "gfg": "",
    "companies": [
      "Will soon Update"
    ]
  },
  {
    "id": "dsa-maximum-balanced-subsequence-sum",
    "name": "Maximum Balanced Subsequence Sum",
    "slug": "maximum-balanced-subsequence-sum",
    "type": "dsa",
    "category": "DP",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-balanced-subsequence-sum/description/",
    "gfg": "",
    "companies": [
      "Will soon Update",
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-string-compression-ii",
    "name": "String Compression II",
    "slug": "string-compression-ii",
    "type": "dsa",
    "category": "DP",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/string-compression-ii/",
    "gfg": "",
    "companies": [
      "Adobe",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-printing-longest-common-subsequence",
    "name": "Printing Longest Common Subsequence",
    "slug": "printing-longest-common-subsequence",
    "type": "dsa",
    "category": "DP On Strings",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/printing-longest-common-subsequence/",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-find-the-string-with-lcp",
    "name": "Find the String with LCP",
    "slug": "find-the-string-with-lcp",
    "type": "dsa",
    "category": "DP On Strings",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/find-the-string-with-lcp/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-maximum-length-of-pair-chain",
    "name": "Maximum Length of Pair Chain",
    "slug": "maximum-length-of-pair-chain",
    "type": "dsa",
    "category": "DP - LIS Variants",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-length-of-pair-chain/",
    "gfg": "",
    "companies": [
      "Amazon",
      "PayU",
      "Cisco",
      "Zoho"
    ]
  },
  {
    "id": "dsa-longest-string-chain",
    "name": "Longest String Chain",
    "slug": "longest-string-chain",
    "type": "dsa",
    "category": "DP - LIS Variants",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/longest-string-chain/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "DE Shaw"
    ]
  },
  {
    "id": "dsa-build-array-where-you-can-find-the-maximum-exactly-k-comparisons",
    "name": "Build Array Where You Can Find The Maximum Exactly K Comparisons",
    "slug": "build-array-where-you-can-find-the-maximum-exactly-k-comparisons",
    "type": "dsa",
    "category": "DP - LIS Variants",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/build-array-where-you-can-find-the-maximum-exactly-k-comparisons/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-largest-divisible-subset",
    "name": "Largest Divisible Subset",
    "slug": "largest-divisible-subset",
    "type": "dsa",
    "category": "DP - LIS Variants",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/largest-divisible-subset/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ]
  },
  {
    "id": "dsa-longest-ideal-subsequence",
    "name": "Longest Ideal Subsequence",
    "slug": "longest-ideal-subsequence",
    "type": "dsa",
    "category": "DP - LIS Variants",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/longest-ideal-subsequence/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-minimum-number-of-removals-to-make-mountain-array",
    "name": "Minimum Number of Removals to Make Mountain Array",
    "slug": "minimum-number-of-removals-to-make-mountain-array",
    "type": "dsa",
    "category": "DP - LIS Variants",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-number-of-removals-to-make-mountain-array",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-find-the-maximum-length-of-valid-subsequence-i",
    "name": "Find the Maximum Length of Valid Subsequence I",
    "slug": "find-the-maximum-length-of-valid-subsequence-i",
    "type": "dsa",
    "category": "DP - LIS Variants",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/find-the-maximum-length-of-valid-subsequence-i",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-find-the-maximum-length-of-valid-subsequence-ii",
    "name": "Find the Maximum Length of Valid Subsequence II",
    "slug": "find-the-maximum-length-of-valid-subsequence-ii",
    "type": "dsa",
    "category": "DP - LIS Variants",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/find-the-maximum-length-of-valid-subsequence-ii",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-longest-unequal-adjacent-groups-subsequence-ii",
    "name": "Longest Unequal Adjacent Groups Subsequence II",
    "slug": "longest-unequal-adjacent-groups-subsequence-ii",
    "type": "dsa",
    "category": "DP - LIS Variants",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/longest-unequal-adjacent-groups-subsequence-ii/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-delete-columns-to-make-sorted-iii",
    "name": "Delete Columns to Make Sorted III",
    "slug": "delete-columns-to-make-sorted-iii",
    "type": "dsa",
    "category": "DP - LIS Variants",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/delete-columns-to-make-sorted-iii",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-introduction-what-how",
    "name": "Introduction | What | How",
    "slug": "introduction-what-how",
    "type": "dsa",
    "category": "Difference Array Technique",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/range-addition/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-shifting-letters-ii",
    "name": "Shifting Letters II",
    "slug": "shifting-letters-ii",
    "type": "dsa",
    "category": "Difference Array Technique",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/shifting-letters-ii/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-zero-array-transformation-ii",
    "name": "Zero Array Transformation II",
    "slug": "zero-array-transformation-ii",
    "type": "dsa",
    "category": "Difference Array Technique",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/zero-array-transformation-ii/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-zero-array-transformation-i",
    "name": "Zero Array Transformation I",
    "slug": "zero-array-transformation-i",
    "type": "dsa",
    "category": "Difference Array Technique",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/zero-array-transformation-i/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-maximum-frequency-of-an-element-after-performing-operations-i",
    "name": "Maximum Frequency of an Element After Performing Operations I",
    "slug": "maximum-frequency-of-an-element-after-performing-operations-i",
    "type": "dsa",
    "category": "Difference Array Technique",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-frequency-of-an-element-after-performing-operations-i/description/",
    "gfg": "",
    "companies": [
      "Google"
    ]
  },
  {
    "id": "dsa-maximum-frequency-of-an-element-after-performing-operations-ii",
    "name": "Maximum Frequency of an Element After Performing Operations II",
    "slug": "maximum-frequency-of-an-element-after-performing-operations-ii",
    "type": "dsa",
    "category": "Difference Array Technique",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-frequency-of-an-element-after-performing-operations-ii/description/",
    "gfg": "",
    "companies": [
      "Google"
    ]
  },
  {
    "id": "dsa-increment-submatrices-by-one",
    "name": "Increment Submatrices by One",
    "slug": "increment-submatrices-by-one",
    "type": "dsa",
    "category": "Difference Array Technique",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/increment-submatrices-by-one/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-difference-array-technique-with-jumps",
    "name": "Difference Array Technique with Jumps",
    "slug": "difference-array-technique-with-jumps",
    "type": "dsa",
    "category": "Difference Array Technique",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/difference-array-technique-with-jumps/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-xor-after-range-multiplication-queries-ii",
    "name": "XOR After Range Multiplication Queries II",
    "slug": "xor-after-range-multiplication-queries-ii",
    "type": "dsa",
    "category": "Difference Array Technique",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/xor-after-range-multiplication-queries-ii/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-palindrome-pairs",
    "name": "Palindrome Pairs",
    "slug": "palindrome-pairs",
    "type": "dsa",
    "category": "TRIE",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/palindrome-pairs/",
    "gfg": "",
    "companies": [
      "Airbnb"
    ]
  },
  {
    "id": "dsa-sum-of-subarray-minimums",
    "name": "Sum of Subarray Minimums",
    "slug": "sum-of-subarray-minimums",
    "type": "dsa",
    "category": "Stack",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/sum-of-subarray-minimums/",
    "gfg": "",
    "companies": [
      "Facebook",
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-distribute-candies-in-a-binary-tree",
    "name": "Distribute candies in a binary tree",
    "slug": "distribute-candies-in-a-binary-tree",
    "type": "dsa",
    "category": "Binary Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/distribute-candies-in-a-binary-tree/1",
    "companies": [
      "Microsoft"
    ]
  },
  {
    "id": "dsa-reverse-a-stack",
    "name": "Reverse a Stack",
    "slug": "reverse-a-stack",
    "type": "dsa",
    "category": "RECURSION",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik",
      "a2z"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-a-stack/1",
    "companies": [
      "Jio",
      "Amazon",
      "Airtle",
      "Swiggy",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-tower-of-hanoi",
    "name": "Tower Of Hanoi",
    "slug": "tower-of-hanoi",
    "type": "dsa",
    "category": "RECURSION",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/tower-of-hanoi-1587115621/1",
    "companies": [
      "Flipkart",
      "Microsoft"
    ]
  },
  {
    "id": "dsa-merge-sort",
    "name": "Merge Sort",
    "slug": "merge-sort",
    "type": "dsa",
    "category": "RECURSION",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-sort/1",
    "companies": [
      "Paytm",
      "Amazon",
      "Microsoft",
      "Snapdeal",
      "Oracle"
    ]
  },
  {
    "id": "dsa-quick-sort",
    "name": "Quick Sort",
    "slug": "quick-sort",
    "type": "dsa",
    "category": "RECURSION",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/quick-sort/1",
    "companies": [
      "VMWare",
      "Amazon",
      "Microsoft",
      "Samsung",
      "Hike"
    ]
  },
  {
    "id": "dsa-generate-parentheses",
    "name": "Generate Parentheses",
    "slug": "generate-parentheses",
    "type": "dsa",
    "category": "RECURSION",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/generate-parentheses/description/",
    "gfg": "",
    "companies": [
      "Samsung",
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-power-set",
    "name": "Power Set",
    "slug": "power-set",
    "type": "dsa",
    "category": "RECURSION",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik",
      "a2z"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/power-set4302/1",
    "companies": [
      "Snapdeal",
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-permutations-ii",
    "name": "Permutations II",
    "slug": "permutations-ii",
    "type": "dsa",
    "category": "RECURSION",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/permutations-ii/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Accolite",
      "Amazon",
      "OYO Rooms",
      "Samsung"
    ]
  },
  {
    "id": "dsa-insert-delete-getrandom-o-1",
    "name": "Insert Delete GetRandom O(1)",
    "slug": "insert-delete-getrandom-o-1",
    "type": "dsa",
    "category": "Design Data Structure",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/insert-delete-getrandom-o1/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-design-browser-history",
    "name": "Design Browser History",
    "slug": "design-browser-history",
    "type": "dsa",
    "category": "Design Data Structure",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/design-browser-history/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-design-parking-system",
    "name": "Design Parking System",
    "slug": "design-parking-system",
    "type": "dsa",
    "category": "Design Data Structure",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/design-parking-system/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-design-hashset",
    "name": "Design HashSet",
    "slug": "design-hashset",
    "type": "dsa",
    "category": "Design Data Structure",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/design-hashset/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-design-underground-system",
    "name": "Design Underground System",
    "slug": "design-underground-system",
    "type": "dsa",
    "category": "Design Data Structure",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/design-underground-system/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-snapshot-array",
    "name": "Snapshot Array",
    "slug": "snapshot-array",
    "type": "dsa",
    "category": "Design Data Structure",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/snapshot-array/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-design-task-manager",
    "name": "Design Task Manager",
    "slug": "design-task-manager",
    "type": "dsa",
    "category": "Design Data Structure",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/design-task-manager/description",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-implement-router",
    "name": "Implement Router",
    "slug": "implement-router",
    "type": "dsa",
    "category": "Design Data Structure",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/implement-router/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-design-movie-rental-system",
    "name": "Design Movie Rental System",
    "slug": "design-movie-rental-system",
    "type": "dsa",
    "category": "Design Data Structure",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/design-movie-rental-system/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-segment-tree-introduction-basics-build-segment-tree",
    "name": "Segment Tree | Introduction | Basics | Build Segment Tree",
    "slug": "segment-tree-introduction-basics-build-segment-tree",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/segment-tree-introduction-basics-build-segment-tree/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-segment-tree-update-query",
    "name": "Segment Tree | Update Query",
    "slug": "segment-tree-update-query",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/segment-tree-update-query/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-segment-tree-range-sum-query",
    "name": "Segment Tree | Range Sum Query",
    "slug": "segment-tree-range-sum-query",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/segment-tree-range-sum-query/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-segment-tree-why-size-is-4-n",
    "name": "Segment Tree | Why size is 4*n",
    "slug": "segment-tree-why-size-is-4-n",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/segment-tree-why-size-is-4-n/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-query-sum-ii",
    "name": "Query Sum II",
    "slug": "query-sum-ii",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/sum-of-query-ii5310/1",
    "companies": [
      "Amazon"
    ]
  },
  {
    "id": "dsa-range-minimum-query",
    "name": "Range Minimum Query",
    "slug": "range-minimum-query",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/range-minimum-query/1",
    "companies": [
      "Meta"
    ]
  },
  {
    "id": "dsa-range-update-query",
    "name": "Range Update Query",
    "slug": "range-update-query",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/lazy-propagation-in-segment-tree/",
    "companies": [
      "Google"
    ]
  },
  {
    "id": "dsa-range-sum-query",
    "name": "Range Sum Query",
    "slug": "range-sum-query",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/range-sum-query-mutable/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-range-maximum-index-query-part-1",
    "name": "Range Maximum Index Query | Part 1",
    "slug": "range-maximum-index-query-part-1",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/range-maximum-index-query-part-1/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-range-maximum-index-query-part-2",
    "name": "Range Maximum Index Query | Part 2",
    "slug": "range-maximum-index-query-part-2",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/range-maximum-index-query-part-2/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-find-building-where-alice-and-bob-can-meet",
    "name": "Find Building Where Alice and Bob Can Meet",
    "slug": "find-building-where-alice-and-bob-can-meet",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/find-building-where-alice-and-bob-can-meet/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-count-good-triplets-in-an-array",
    "name": "Count Good Triplets in an Array",
    "slug": "count-good-triplets-in-an-array",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/count-good-triplets-in-an-array/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-fruits-into-baskets-ii-iii",
    "name": "Fruits Into Baskets II & III",
    "slug": "fruits-into-baskets-ii-iii",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/fruits-into-baskets-ii/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-range-update-min-max-query-lazy-propagation",
    "name": "Range Update | Min-Max Query | Lazy Propagation",
    "slug": "range-update-min-max-query-lazy-propagation",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/range-update-min-max-query-lazy-propagation/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-longest-balanced-subarray-ii",
    "name": "Longest Balanced Subarray II",
    "slug": "longest-balanced-subarray-ii",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/longest-balanced-subarray-ii/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-block-placement-queries",
    "name": "Block Placement Queries",
    "slug": "block-placement-queries",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/block-placement-queries/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-maximize-active-section-with-trade-ii",
    "name": "Maximize Active Section with Trade II",
    "slug": "maximize-active-section-with-trade-ii",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/maximize-active-section-with-trade-ii/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-longest-substring-of-one-repeating-character",
    "name": "Longest Substring of One Repeating Character",
    "slug": "longest-substring-of-one-repeating-character",
    "type": "dsa",
    "category": "Segment Tree",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/longest-substring-of-one-repeating-character/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-introduction-binary-lifting-dp-on-trees",
    "name": "Introduction | Binary Lifting | DP On Trees",
    "slug": "introduction-binary-lifting-dp-on-trees",
    "type": "dsa",
    "category": "DP On Trees",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/introduction-binary-lifting-dp-on-trees/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-kth-ancestor-of-a-tree-node",
    "name": "Kth Ancestor of a Tree Node",
    "slug": "kth-ancestor-of-a-tree-node",
    "type": "dsa",
    "category": "DP On Trees",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/kth-ancestor-of-a-tree-node/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-lowest-common-ancestor-reusable-template",
    "name": "Lowest Common Ancestor | Reusable Template",
    "slug": "lowest-common-ancestor-reusable-template",
    "type": "dsa",
    "category": "DP On Trees",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-reusable-template/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-number-of-ways-to-assign-edge-weights-ii",
    "name": "Number of Ways to Assign Edge Weights II",
    "slug": "number-of-ways-to-assign-edge-weights-ii",
    "type": "dsa",
    "category": "DP On Trees",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/number-of-ways-to-assign-edge-weights-ii/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-introduction-meet-in-the-middle-mitm",
    "name": "Introduction | Meet In The Middle (MITM)",
    "slug": "introduction-meet-in-the-middle-mitm",
    "type": "dsa",
    "category": "Meet In The Middle",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/introduction-meet-in-the-middle-mitm/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-meet-in-the-middle",
    "name": "Meet In The Middle",
    "slug": "meet-in-the-middle",
    "type": "dsa",
    "category": "Meet In The Middle",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://cses.fi/problemset/task/1628/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-closest-subsequence-sum",
    "name": "Closest Subsequence Sum",
    "slug": "closest-subsequence-sum",
    "type": "dsa",
    "category": "Meet In The Middle",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/closest-subsequence-sum/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-partition-array-into-two-arrays-to-minimize-sum-difference",
    "name": "Partition Array Into Two Arrays to Minimize Sum Difference",
    "slug": "partition-array-into-two-arrays-to-minimize-sum-difference",
    "type": "dsa",
    "category": "Meet In The Middle",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik",
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/partition-array-into-two-arrays-to-minimize-sum-difference",
    "gfg": "",
    "companies": [
      "2026) In Round 2",
      "Arcesium OA (July",
      "2026)",
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Salesforce"
    ]
  },
  {
    "id": "dsa-split-array-with-same-average",
    "name": "Split Array With Same Average",
    "slug": "split-array-with-same-average",
    "type": "dsa",
    "category": "Meet In The Middle",
    "subcategory": "CodeStoryWithMIK",
    "difficulty": "Medium",
    "sheets": [
      "mik"
    ],
    "leetcode": "https://leetcode.com/problems/split-array-with-same-average/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-input-output",
    "name": "Input Output",
    "slug": "input-output",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-cpp-basics",
    "name": "Cpp Basics",
    "slug": "cpp-basics",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-if-elseif",
    "name": "If ElseIf",
    "slug": "if-elseif",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-switch-case",
    "name": "Switch Case",
    "slug": "switch-case",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-what-are-arrays-strings",
    "name": "What are arrays, strings?",
    "slug": "what-are-arrays-strings",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-for-loops",
    "name": "For loops",
    "slug": "for-loops",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-while-loops",
    "name": "While loops",
    "slug": "while-loops",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-functions-pass-by-reference-and-value",
    "name": "Functions (Pass by Reference and Value)",
    "slug": "functions-pass-by-reference-and-value",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-theory-with-examples",
    "name": "Theory with examples",
    "slug": "theory-with-examples",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-easy-and-medium",
    "name": "Easy and Medium",
    "slug": "easy-and-medium",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Build-up Logical Thinking",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-hard",
    "name": "Hard",
    "slug": "hard",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Build-up Logical Thinking",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-1",
    "name": "Pattern 1",
    "slug": "pattern-1",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-2",
    "name": "Pattern 2",
    "slug": "pattern-2",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-3",
    "name": "Pattern 3",
    "slug": "pattern-3",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-4",
    "name": "Pattern 4",
    "slug": "pattern-4",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-5",
    "name": "Pattern 5",
    "slug": "pattern-5",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-6",
    "name": "Pattern 6",
    "slug": "pattern-6",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-7",
    "name": "Pattern 7",
    "slug": "pattern-7",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-8",
    "name": "Pattern 8",
    "slug": "pattern-8",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-9",
    "name": "Pattern 9",
    "slug": "pattern-9",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-10",
    "name": "Pattern 10",
    "slug": "pattern-10",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-11",
    "name": "Pattern 11",
    "slug": "pattern-11",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-12",
    "name": "Pattern 12",
    "slug": "pattern-12",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-13",
    "name": "Pattern 13",
    "slug": "pattern-13",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-14",
    "name": "Pattern 14",
    "slug": "pattern-14",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-15",
    "name": "Pattern 15",
    "slug": "pattern-15",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-16",
    "name": "Pattern 16",
    "slug": "pattern-16",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-17",
    "name": "Pattern 17",
    "slug": "pattern-17",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-18",
    "name": "Pattern 18",
    "slug": "pattern-18",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-19",
    "name": "Pattern 19",
    "slug": "pattern-19",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pattern-20",
    "name": "Pattern 20",
    "slug": "pattern-20",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-pattern-21",
    "name": "Pattern 21",
    "slug": "pattern-21",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-pattern-22",
    "name": "Pattern 22",
    "slug": "pattern-22",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-stl",
    "name": "STL",
    "slug": "stl",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn STL/Java-Collections or similar thing in your             language",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-java-collections",
    "name": "Java Collections",
    "slug": "java-collections",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn STL/Java-Collections or similar thing in your             language",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-count-all-digits-of-a-number",
    "name": "Count all Digits of a Number",
    "slug": "count-all-digits-of-a-number",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Know Basic Maths",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-reverse-integer",
    "name": "Reverse a number",
    "slug": "reverse-integer",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Know Basic Maths",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/reverse-integer/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-palindrome-number",
    "name": "Palindrome Number",
    "slug": "palindrome-number",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Know Basic Maths",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/palindrome-number/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ]
  },
  {
    "id": "dsa-gcd-of-two-numbers",
    "name": "GCD of Two Numbers",
    "slug": "gcd-of-two-numbers",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Know Basic Maths",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-armstrong-number",
    "name": "Check if the Number is Armstrong",
    "slug": "armstrong-number",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Know Basic Maths",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/armstrong-number/",
    "gfg": "",
    "companies": [
      "Amazon"
    ]
  },
  {
    "id": "dsa-print-all-divisors",
    "name": "Print all Divisors",
    "slug": "print-all-divisors",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Know Basic Maths",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-check-for-prime-number",
    "name": "Check for Prime Number",
    "slug": "check-for-prime-number",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Know Basic Maths",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-understand-recursion-by-print-something-n-times",
    "name": "Understand recursion by print something N times",
    "slug": "understand-recursion-by-print-something-n-times",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-print-name-n-times-using-recursion",
    "name": "Print name N times using recursion",
    "slug": "print-name-n-times-using-recursion",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-print-1-to-n-using-recursion",
    "name": "Print 1 to N using Recursion",
    "slug": "print-1-to-n-using-recursion",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-print-n-to-1-using-recursion",
    "name": "Print N to 1 using Recursion",
    "slug": "print-n-to-1-using-recursion",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-sum-of-first-n-numbers",
    "name": "Sum of First N Numbers",
    "slug": "sum-of-first-n-numbers",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-factorial-of-a-given-number",
    "name": "Factorial of a given number",
    "slug": "factorial-of-a-given-number",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-reverse-an-array",
    "name": "Reverse an array",
    "slug": "reverse-an-array",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-fibonacci-number",
    "name": "Fibonacci Number",
    "slug": "fibonacci-number",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/fibonacci-number/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-basic-hashing",
    "name": "Basic Hashing",
    "slug": "basic-hashing",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Hashing",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-counting-frequencies-of-array-elements",
    "name": "Counting Frequencies of Array Elements",
    "slug": "counting-frequencies-of-array-elements",
    "type": "dsa",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Hashing",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-selection-sort",
    "name": "Selection Sort",
    "slug": "selection-sort",
    "type": "dsa",
    "category": "Step 2: Learn Important Sorting Techniques",
    "subcategory": "Sorting-I",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-bubble-sort",
    "name": "Bubble Sort",
    "slug": "bubble-sort",
    "type": "dsa",
    "category": "Step 2: Learn Important Sorting Techniques",
    "subcategory": "Sorting-I",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-insertion-sorting",
    "name": "Insertion Sorting",
    "slug": "insertion-sorting",
    "type": "dsa",
    "category": "Step 2: Learn Important Sorting Techniques",
    "subcategory": "Sorting-I",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-merge-sorting",
    "name": "Merge Sorting",
    "slug": "merge-sorting",
    "type": "dsa",
    "category": "Step 2: Learn Important Sorting Techniques",
    "subcategory": "Sorting-II",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-recursive-bubble-sort",
    "name": "Recursive Bubble Sort",
    "slug": "recursive-bubble-sort",
    "type": "dsa",
    "category": "Step 2: Learn Important Sorting Techniques",
    "subcategory": "Sorting-II",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-recursive-insertion-sort",
    "name": "Recursive Insertion Sort",
    "slug": "recursive-insertion-sort",
    "type": "dsa",
    "category": "Step 2: Learn Important Sorting Techniques",
    "subcategory": "Sorting-II",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-quick-sorting",
    "name": "Quick Sorting",
    "slug": "quick-sorting",
    "type": "dsa",
    "category": "Step 2: Learn Important Sorting Techniques",
    "subcategory": "Sorting-II",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-largest-element",
    "name": "Largest Element",
    "slug": "largest-element",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-second-largest-element",
    "name": "Second Largest Element",
    "slug": "second-largest-element",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-check-if-array-is-sorted-and-rotated",
    "name": "Check if the Array is Sorted II",
    "slug": "check-if-array-is-sorted-and-rotated",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/#:~:text=Input%3A%20nums%20%3D%20%5B2%2C,no%20rotation)%20to%20make%20nums.",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Infosys"
    ]
  },
  {
    "id": "dsa-rotate-array",
    "name": "Left Rotate Array by One",
    "slug": "rotate-array",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/rotate-array/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-move-zeroes",
    "name": "Move Zeros to End",
    "slug": "move-zeroes",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/move-zeroes/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-linear-search",
    "name": "Linear Search",
    "slug": "linear-search",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-union-of-two-sorted-arrays",
    "name": "Union of two sorted arrays",
    "slug": "union-of-two-sorted-arrays",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-find-missing-number",
    "name": "Find missing number",
    "slug": "find-missing-number",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-single-number",
    "name": "Find the number that appears once, and other numbers twice.",
    "slug": "single-number",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/single-number/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ]
  },
  {
    "id": "dsa-longest-subarray-with-given-sum-k-positives",
    "name": "Longest subarray with given sum K(positives)",
    "slug": "longest-subarray-with-given-sum-k-positives",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-longest-subarray-with-sum-k",
    "name": "Longest subarray with sum K",
    "slug": "longest-subarray-with-sum-k",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-print-subarray-with-maximum-subarray-sum-extended-version-of-above-problem",
    "name": "Print subarray with maximum subarray sum (extended version of above problem)",
    "slug": "print-subarray-with-maximum-subarray-sum-extended-version-of-above-problem",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-rearrange-array-elements-by-sign",
    "name": "Rearrange array elements by sign",
    "slug": "rearrange-array-elements-by-sign",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/rearrange-array-elements-by-sign/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Infosys"
    ]
  },
  {
    "id": "dsa-leaders-in-an-array",
    "name": "Leaders in an Array",
    "slug": "leaders-in-an-array",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-largest-subarray-with-sum-0",
    "name": "Largest Subarray with Sum 0",
    "slug": "largest-subarray-with-sum-0",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-count-subarrays-with-given-xor-k",
    "name": "Count subarrays with given xor K",
    "slug": "count-subarrays-with-given-xor-k",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-find-the-repeating-and-missing-number",
    "name": "Find the repeating and missing number",
    "slug": "find-the-repeating-and-missing-number",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-count-inversions",
    "name": "Count Inversions",
    "slug": "count-inversions",
    "type": "dsa",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-lower-bound",
    "name": "Lower Bound",
    "slug": "lower-bound",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-upper-bound",
    "name": "Upper Bound",
    "slug": "upper-bound",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-search-insert-position",
    "name": "Search insert position",
    "slug": "search-insert-position",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/search-insert-position/#:~:text=Search%20Insert%20Position%20%2D%20LeetCode&text=Given%20a%20sorted%20array%20of,(log%20n)%20runtime%20complexity.",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Zoho"
    ]
  },
  {
    "id": "dsa-floor-and-ceil-in-sorted-array",
    "name": "Floor and Ceil in Sorted Array",
    "slug": "floor-and-ceil-in-sorted-array",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-find-first-and-last-position-of-element-in-sorted-array",
    "name": "First and last occurrence",
    "slug": "find-first-and-last-position-of-element-in-sorted-array",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-count-occurrences-in-a-sorted-array",
    "name": "Count Occurrences in a Sorted Array",
    "slug": "count-occurrences-in-a-sorted-array",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-find-out-how-many-times-the-array-is-rotated",
    "name": "Find out how many times the array is rotated",
    "slug": "find-out-how-many-times-the-array-is-rotated",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-find-peak-element",
    "name": "Find peak element",
    "slug": "find-peak-element",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/find-peak-element/#:~:text=Find%20Peak%20Element%20%2D%20LeetCode&text=A%20peak%20element%20is%20an,to%20any%20of%20the%20peaks.",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ]
  },
  {
    "id": "dsa-find-square-root-of-a-number",
    "name": "Find square root of a number",
    "slug": "find-square-root-of-a-number",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-find-nth-root-of-a-number",
    "name": "Find Nth root of a number",
    "slug": "find-nth-root-of-a-number",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-find-the-smallest-divisor-given-a-threshold",
    "name": "Find the smallest divisor",
    "slug": "find-the-smallest-divisor-given-a-threshold",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "DE Shaw"
    ]
  },
  {
    "id": "dsa-aggressive-cows",
    "name": "Aggressive Cows",
    "slug": "aggressive-cows",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-book-allocation-problem",
    "name": "Book Allocation Problem",
    "slug": "book-allocation-problem",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-split-array-largest-sum",
    "name": "Split array - largest sum",
    "slug": "split-array-largest-sum",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/split-array-largest-sum/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-painter-s-partition",
    "name": "Painter's Partition",
    "slug": "painter-s-partition",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-minimize-max-distance-to-gas-station",
    "name": "Minimize Max Distance to Gas Station",
    "slug": "minimize-max-distance-to-gas-station",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/minimize-max-distance-to-gas-station/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon"
    ]
  },
  {
    "id": "dsa-kth-element-of-2-sorted-arrays",
    "name": "Kth element of 2 sorted arrays",
    "slug": "kth-element-of-2-sorted-arrays",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-find-row-with-maximum-1-s",
    "name": "Find row with maximum 1's",
    "slug": "find-row-with-maximum-1-s",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 2D Arrays",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-search-a-2d-matrix-ii",
    "name": "Search in 2D matrix - II",
    "slug": "search-a-2d-matrix-ii",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 2D Arrays",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix-ii/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-find-a-peak-element-ii",
    "name": "Find Peak Element - II",
    "slug": "find-a-peak-element-ii",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 2D Arrays",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/find-a-peak-element-ii/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-matrix-median",
    "name": "Matrix Median",
    "slug": "matrix-median",
    "type": "dsa",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 2D Arrays",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-remove-outermost-parentheses",
    "name": "Remove Outermost Parentheses",
    "slug": "remove-outermost-parentheses",
    "type": "dsa",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Basic and Easy String Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/remove-outermost-parentheses/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "TCS"
    ]
  },
  {
    "id": "dsa-largest-odd-number-in-string",
    "name": "Largest Odd Number in a String",
    "slug": "largest-odd-number-in-string",
    "type": "dsa",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Basic and Easy String Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/largest-odd-number-in-string/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-isomorphic-strings",
    "name": "Isomorphic String",
    "slug": "isomorphic-strings",
    "type": "dsa",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Basic and Easy String Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/isomorphic-strings/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-rotate-string",
    "name": "Rotate String",
    "slug": "rotate-string",
    "type": "dsa",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Basic and Easy String Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/rotate-string/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ]
  },
  {
    "id": "dsa-sort-characters-by-frequency",
    "name": "Sort Characters by Frequency",
    "slug": "sort-characters-by-frequency",
    "type": "dsa",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Medium String Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/sort-characters-by-frequency/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Flipkart"
    ]
  },
  {
    "id": "dsa-maximum-nesting-depth-of-the-parentheses",
    "name": "Maximum Nesting Depth of the Parentheses",
    "slug": "maximum-nesting-depth-of-the-parentheses",
    "type": "dsa",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Medium String Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-nesting-depth-of-the-parentheses/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "TCS"
    ]
  },
  {
    "id": "dsa-count-number-of-substrings",
    "name": "Count Number of Substrings",
    "slug": "count-number-of-substrings",
    "type": "dsa",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Medium String Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-sum-of-beauty-of-all-substrings",
    "name": "Sum of Beauty of All Substrings",
    "slug": "sum-of-beauty-of-all-substrings",
    "type": "dsa",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Medium String Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/sum-of-beauty-of-all-substrings/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Zoho"
    ]
  },
  {
    "id": "dsa-introduction-to-singly-linkedlist",
    "name": "Introduction to Singly LinkedList",
    "slug": "introduction-to-singly-linkedlist",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn 1D LinkedList",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-insertion-at-the-head-of-linked-list",
    "name": "Insertion at the head of Linked List",
    "slug": "insertion-at-the-head-of-linked-list",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn 1D LinkedList",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-find-the-length-of-the-linked-list",
    "name": "Find the length of the Linked List",
    "slug": "find-the-length-of-the-linked-list",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn 1D LinkedList",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-search-in-linked-list",
    "name": "Search in Linked List",
    "slug": "search-in-linked-list",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn 1D LinkedList",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-introduction-to-doubly-ll",
    "name": "Introduction to Doubly LL",
    "slug": "introduction-to-doubly-ll",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn Doubly LinkedList",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-insert-node-before-head-in-doubly-linked-list",
    "name": "Insert node before head in Doubly Linked List",
    "slug": "insert-node-before-head-in-doubly-linked-list",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn Doubly LinkedList",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-delete-head-of-doubly-linked-list",
    "name": "Delete head of Doubly Linked List",
    "slug": "delete-head-of-doubly-linked-list",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn Doubly LinkedList",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-reverse-a-doubly-linked-list",
    "name": "Reverse a Doubly Linked List",
    "slug": "reverse-a-doubly-linked-list",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn Doubly LinkedList",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-length-of-loop-in-ll",
    "name": "Length of loop in LL",
    "slug": "length-of-loop-in-ll",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-odd-even-linked-list",
    "name": "Segregate odd and even nodes in Linked List",
    "slug": "odd-even-linked-list",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/odd-even-linked-list/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-delete-the-middle-node-of-a-linked-list",
    "name": "Delete the middle node in LL",
    "slug": "delete-the-middle-node-of-a-linked-list",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/#:~:text=You%20are%20given%20the%20head,than%20or%20equal%20to%20x%20.",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-sort-list",
    "name": "Sort LL",
    "slug": "sort-list",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/sort-list/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "ByteDance"
    ]
  },
  {
    "id": "dsa-sort-a-linked-list-of-0-s-1-s-and-2-s",
    "name": "Sort a Linked List of 0's 1's and 2's",
    "slug": "sort-a-linked-list-of-0-s-1-s-and-2-s",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-add-one-to-a-number-represented-by-ll",
    "name": "Add one to a number represented by LL",
    "slug": "add-one-to-a-number-represented-by-ll",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-delete-all-occurrences-of-a-key-in-dll",
    "name": "Delete all occurrences of a key in DLL",
    "slug": "delete-all-occurrences-of-a-key-in-dll",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of DLL",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-find-pairs-with-given-sum-in-doubly-linked-list",
    "name": "Find Pairs with Given Sum in Doubly Linked List",
    "slug": "find-pairs-with-given-sum-in-doubly-linked-list",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of DLL",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-remove-duplicates-from-sorted-dll",
    "name": "Remove duplicates from sorted DLL",
    "slug": "remove-duplicates-from-sorted-dll",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of DLL",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-flattening-of-ll",
    "name": "Flattening of LL",
    "slug": "flattening-of-ll",
    "type": "dsa",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Hard Problems of LL",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-count-good-numbers",
    "name": "Count Good Numbers",
    "slug": "count-good-numbers",
    "type": "dsa",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Get a Strong Hold",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/count-good-numbers/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Infosys"
    ]
  },
  {
    "id": "dsa-sort-a-stack-using-recursion",
    "name": "Sort a stack using recursion",
    "slug": "sort-a-stack-using-recursion",
    "type": "dsa",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Get a Strong Hold",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-generate-binary-strings-without-consecutive-1s",
    "name": "Generate Binary Strings Without Consecutive 1s",
    "slug": "generate-binary-strings-without-consecutive-1s",
    "type": "dsa",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-learn-all-patterns-of-subsequences-theory",
    "name": "Learn All Patterns of Subsequences (Theory)",
    "slug": "learn-all-patterns-of-subsequences-theory",
    "type": "dsa",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-count-all-subsequences-with-sum-k",
    "name": "Count all subsequences with sum K",
    "slug": "count-all-subsequences-with-sum-k",
    "type": "dsa",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-check-if-there-exists-a-subsequence-with-sum-k",
    "name": "Check if there exists a subsequence with sum K",
    "slug": "check-if-there-exists-a-subsequence-with-sum-k",
    "type": "dsa",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-subsets-i",
    "name": "Subsets I",
    "slug": "subsets-i",
    "type": "dsa",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-combination-sum-iii",
    "name": "Combination Sum III",
    "slug": "combination-sum-iii",
    "type": "dsa",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/combination-sum-iii/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-letter-combinations-of-a-phone-number",
    "name": "Letter Combinations of a Phone Number",
    "slug": "letter-combinations-of-a-phone-number",
    "type": "dsa",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-rat-in-a-maze",
    "name": "Rat in a Maze",
    "slug": "rat-in-a-maze",
    "type": "dsa",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Trying out all Combos / Hard",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-m-coloring-problem",
    "name": "M Coloring Problem",
    "slug": "m-coloring-problem",
    "type": "dsa",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Trying out all Combos / Hard",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-expression-add-operators",
    "name": "Expression Add Operators",
    "slug": "expression-add-operators",
    "type": "dsa",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Trying out all Combos / Hard",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/expression-add-operators/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Bloomberg",
      "LinkedIn"
    ]
  },
  {
    "id": "dsa-introduction-to-bits-and-tricks",
    "name": "Introduction to Bits and Tricks",
    "slug": "introduction-to-bits-and-tricks",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-check-if-the-i-th-bit-is-set-or-not",
    "name": "Check if the i-th bit is Set or Not",
    "slug": "check-if-the-i-th-bit-is-set-or-not",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-check-if-a-number-is-odd-or-not",
    "name": "Check if a Number is Odd or Not",
    "slug": "check-if-a-number-is-odd-or-not",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-power-of-two",
    "name": "Check if a Number is Power of 2 or Not",
    "slug": "power-of-two",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/power-of-two/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-count-the-number-of-set-bits",
    "name": "Count the Number of Set Bits",
    "slug": "count-the-number-of-set-bits",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-set-unset-the-rightmost-unset-bit",
    "name": "Set/Unset the rightmost unset bit",
    "slug": "set-unset-the-rightmost-unset-bit",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-swap-two-numbers",
    "name": "Swap Two Numbers",
    "slug": "swap-two-numbers",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-divide-two-integers",
    "name": "Divide two numbers without multiplication and division",
    "slug": "divide-two-integers",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/divide-two-integers/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ]
  },
  {
    "id": "dsa-minimum-bit-flips-to-convert-number",
    "name": "Minimum Bit Flips to Convert Number",
    "slug": "minimum-bit-flips-to-convert-number",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Interview Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-bit-flips-to-convert-number/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-xor-of-numbers-in-a-given-range",
    "name": "XOR of numbers in a given range",
    "slug": "xor-of-numbers-in-a-given-range",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Interview Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-single-number-iii",
    "name": "Single Number - III",
    "slug": "single-number-iii",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Interview Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle",
      "Zomato"
    ]
  },
  {
    "id": "dsa-print-prime-factors-of-a-number",
    "name": "Print Prime Factors of a Number",
    "slug": "print-prime-factors-of-a-number",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Advanced Maths",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-divisors-of-a-number",
    "name": "Divisors of a Number",
    "slug": "divisors-of-a-number",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Advanced Maths",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-count-primes",
    "name": "Count primes in range L to R",
    "slug": "count-primes",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Advanced Maths",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/count-primes/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-prime-factorisation-of-a-number",
    "name": "Prime factorisation of a Number",
    "slug": "prime-factorisation-of-a-number",
    "type": "dsa",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Advanced Maths",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-implement-stack-using-arrays",
    "name": "Implement Stack using Arrays",
    "slug": "implement-stack-using-arrays",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Learning",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-implement-queue-using-arrays",
    "name": "Implement Queue using Arrays",
    "slug": "implement-queue-using-arrays",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Learning",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-implement-stack-using-linkedlist",
    "name": "Implement stack using Linkedlist",
    "slug": "implement-stack-using-linkedlist",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Learning",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-implement-queue-using-linkedlist",
    "name": "Implement queue using Linkedlist",
    "slug": "implement-queue-using-linkedlist",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Learning",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-infix-to-postfix-conversion",
    "name": "Infix to Postfix Conversion",
    "slug": "infix-to-postfix-conversion",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Prefix, Infix, PostFix Conversion Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-prefix-to-infix-conversion",
    "name": "Prefix to Infix Conversion",
    "slug": "prefix-to-infix-conversion",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Prefix, Infix, PostFix Conversion Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-prefix-to-postfix-conversion",
    "name": "Prefix to Postfix Conversion",
    "slug": "prefix-to-postfix-conversion",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Prefix, Infix, PostFix Conversion Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-postfix-to-prefix-conversion",
    "name": "Postfix to Prefix Conversion",
    "slug": "postfix-to-prefix-conversion",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Prefix, Infix, PostFix Conversion Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-postfix-to-infix-conversion",
    "name": "Postfix to Infix Conversion",
    "slug": "postfix-to-infix-conversion",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Prefix, Infix, PostFix Conversion Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-infix-to-prefix-conversion",
    "name": "Infix to Prefix Conversion",
    "slug": "infix-to-prefix-conversion",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Prefix, Infix, PostFix Conversion Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-next-greater-element-ii",
    "name": "Next Greater Element - 2",
    "slug": "next-greater-element-ii",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/next-greater-element-ii/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-next-smaller-element",
    "name": "Next Smaller Element",
    "slug": "next-smaller-element",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-number-of-greater-elements-to-the-right",
    "name": "Number of Greater Elements to the Right",
    "slug": "number-of-greater-elements-to-the-right",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-asteroid-collision",
    "name": "Asteroid Collision",
    "slug": "asteroid-collision",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/asteroid-collision/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-sum-of-subarray-ranges",
    "name": "Sum of Subarray Ranges",
    "slug": "sum-of-subarray-ranges",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/sum-of-subarray-ranges/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-remove-k-digits",
    "name": "Remove K Digits",
    "slug": "remove-k-digits",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/remove-k-digits/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ]
  },
  {
    "id": "dsa-maximal-rectangle",
    "name": "Maximum Rectangles",
    "slug": "maximal-rectangle",
    "type": "dsa",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/maximal-rectangle/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-max-consecutive-ones-iii",
    "name": "Max Consecutive Ones III",
    "slug": "max-consecutive-ones-iii",
    "type": "dsa",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Medium Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/max-consecutive-ones-iii/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-fruit-into-baskets",
    "name": "Fruit Into Baskets",
    "slug": "fruit-into-baskets",
    "type": "dsa",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Medium Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/fruit-into-baskets/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Netflix",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-count-number-of-nice-subarrays",
    "name": "Count number of Nice subarrays",
    "slug": "count-number-of-nice-subarrays",
    "type": "dsa",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Medium Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/count-number-of-nice-subarrays/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ]
  },
  {
    "id": "dsa-number-of-substrings-containing-all-three-characters",
    "name": "Number of Substrings Containing All Three Characters",
    "slug": "number-of-substrings-containing-all-three-characters",
    "type": "dsa",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Medium Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "DE Shaw"
    ]
  },
  {
    "id": "dsa-maximum-points-you-can-obtain-from-cards",
    "name": "Maximum Points You Can Obtain from Cards",
    "slug": "maximum-points-you-can-obtain-from-cards",
    "type": "dsa",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Medium Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-longest-substring-with-at-most-k-distinct-characters",
    "name": "Longest Substring With At Most K Distinct Characters",
    "slug": "longest-substring-with-at-most-k-distinct-characters",
    "type": "dsa",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Hard Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-subarrays-with-k-different-integers",
    "name": "Subarrays with K Different Integers",
    "slug": "subarrays-with-k-different-integers",
    "type": "dsa",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Hard Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/subarrays-with-k-different-integers/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-minimum-window-subsequence",
    "name": "Minimum Window Subsequence",
    "slug": "minimum-window-subsequence",
    "type": "dsa",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Hard Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-window-subsequence/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Salesforce",
      "Airbnb",
      "eBay"
    ]
  },
  {
    "id": "dsa-heaps-theory-video",
    "name": "Heaps (Theory Video)",
    "slug": "heaps-theory-video",
    "type": "dsa",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Learning",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-implement-min-heap",
    "name": "Implement Min Heap",
    "slug": "implement-min-heap",
    "type": "dsa",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Learning",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-check-if-an-array-represents-a-min-heap",
    "name": "Check if an array represents a min heap",
    "slug": "check-if-an-array-represents-a-min-heap",
    "type": "dsa",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Learning",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-convert-min-heap-to-max-heap",
    "name": "Convert Min Heap to Max Heap",
    "slug": "convert-min-heap-to-max-heap",
    "type": "dsa",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Learning",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-k-th-largest-element-in-an-array",
    "name": "K-th Largest element in an array",
    "slug": "k-th-largest-element-in-an-array",
    "type": "dsa",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Medium Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-kth-smallest-element-in-an-array-use-priority-queue",
    "name": "Kth smallest element in an array [use priority queue]",
    "slug": "kth-smallest-element-in-an-array-use-priority-queue",
    "type": "dsa",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Medium Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-sort-k-sorted-array",
    "name": "Sort K sorted array",
    "slug": "sort-k-sorted-array",
    "type": "dsa",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Medium Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-replace-elements-by-their-rank",
    "name": "Replace Elements by Their Rank",
    "slug": "replace-elements-by-their-rank",
    "type": "dsa",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Medium Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-hand-of-straights",
    "name": "Hand of Straights",
    "slug": "hand-of-straights",
    "type": "dsa",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Medium Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/hand-of-straights/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-design-twitter",
    "name": "Design Twitter",
    "slug": "design-twitter",
    "type": "dsa",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Hard Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/design-twitter/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-minimum-cost-to-connect-sticks",
    "name": "Minimum Cost to Connect Sticks",
    "slug": "minimum-cost-to-connect-sticks",
    "type": "dsa",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Hard Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Twitter (X)"
    ]
  },
  {
    "id": "dsa-maximum-sum-combination",
    "name": "Maximum Sum Combination",
    "slug": "maximum-sum-combination",
    "type": "dsa",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Hard Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-fractional-knapsack",
    "name": "Fractional Knapsack",
    "slug": "fractional-knapsack",
    "type": "dsa",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Easy Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-lemonade-change",
    "name": "Lemonade Change",
    "slug": "lemonade-change",
    "type": "dsa",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Easy Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/lemonade-change/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Zoho"
    ]
  },
  {
    "id": "dsa-valid-parenthesis-string",
    "name": "Valid Paranthesis Checker",
    "slug": "valid-parenthesis-string",
    "type": "dsa",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Easy Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/valid-parenthesis-string/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-n-meetings-in-one-room",
    "name": "N meetings in one room",
    "slug": "n-meetings-in-one-room",
    "type": "dsa",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-jump-game-ii",
    "name": "Jump Game II",
    "slug": "jump-game-ii",
    "type": "dsa",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/jump-game-ii/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-minimum-number-of-platforms-required-for-a-railway",
    "name": "Minimum number of platforms required for a railway",
    "slug": "minimum-number-of-platforms-required-for-a-railway",
    "type": "dsa",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-job-sequencing-problem",
    "name": "Job sequencing Problem",
    "slug": "job-sequencing-problem",
    "type": "dsa",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-candy",
    "name": "Candy",
    "slug": "candy",
    "type": "dsa",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/candy/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-shortest-job-first",
    "name": "Shortest Job First",
    "slug": "shortest-job-first",
    "type": "dsa",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-program-for-least-recently-used-lru-page-replacement-algorithm",
    "name": "Program for Least Recently Used (LRU) Page Replacement Algorithm",
    "slug": "program-for-least-recently-used-lru-page-replacement-algorithm",
    "type": "dsa",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-introduction-to-trees",
    "name": "Introduction to Trees",
    "slug": "introduction-to-trees",
    "type": "dsa",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-binary-tree-representation-in-java",
    "name": "Binary Tree Representation in Java",
    "slug": "binary-tree-representation-in-java",
    "type": "dsa",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-pre-post-inorder-in-one-traversal",
    "name": "Pre, Post, Inorder in one traversal",
    "slug": "pre-post-inorder-in-one-traversal",
    "type": "dsa",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-preorder-inorder-and-postorder-traversal-in-one-traversal",
    "name": "Preorder, Inorder, and Postorder Traversal in one Traversal",
    "slug": "preorder-inorder-and-postorder-traversal-in-one-traversal",
    "type": "dsa",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-top-view-of-bt",
    "name": "Top View of BT",
    "slug": "top-view-of-bt",
    "type": "dsa",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-bottom-view-of-bt",
    "name": "Bottom view of BT",
    "slug": "bottom-view-of-bt",
    "type": "dsa",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-binary-tree-right-side-view",
    "name": "Right/Left View of Binary Tree",
    "slug": "binary-tree-right-side-view",
    "type": "dsa",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/binary-tree-right-side-view/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-print-root-to-leaf-path-in-bt",
    "name": "Print root to leaf path in BT",
    "slug": "print-root-to-leaf-path-in-bt",
    "type": "dsa",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-children-sum-property-in-binary-tree",
    "name": "Children Sum Property in Binary Tree",
    "slug": "children-sum-property-in-binary-tree",
    "type": "dsa",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-all-nodes-distance-k-in-binary-tree",
    "name": "Print all nodes at a distance of K in BT",
    "slug": "all-nodes-distance-k-in-binary-tree",
    "type": "dsa",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-minimum-time-taken-to-burn-the-bt-from-a-given-node",
    "name": "Minimum time taken to burn the BT from a given Node",
    "slug": "minimum-time-taken-to-burn-the-bt-from-a-given-node",
    "type": "dsa",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-count-complete-tree-nodes",
    "name": "Count total nodes in a complete BT",
    "slug": "count-complete-tree-nodes",
    "type": "dsa",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/count-complete-tree-nodes/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ]
  },
  {
    "id": "dsa-requirements-needed-to-construct-a-unique-bt",
    "name": "Requirements needed to construct a unique BT",
    "slug": "requirements-needed-to-construct-a-unique-bt",
    "type": "dsa",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-introduction-to-bst",
    "name": "Introduction to BST",
    "slug": "introduction-to-bst",
    "type": "dsa",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Concepts",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-find-min-max-in-bst",
    "name": "Find Min/Max in BST",
    "slug": "find-min-max-in-bst",
    "type": "dsa",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Concepts",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-floor-and-ceil-in-a-bst",
    "name": "Floor and Ceil in a BST",
    "slug": "floor-and-ceil-in-a-bst",
    "type": "dsa",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-floor-in-a-binary-search-tree",
    "name": "Floor in a Binary Search Tree",
    "slug": "floor-in-a-binary-search-tree",
    "type": "dsa",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-insert-into-a-binary-search-tree",
    "name": "Insert a given node in BST",
    "slug": "insert-into-a-binary-search-tree",
    "type": "dsa",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/insert-into-a-binary-search-tree/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "LinkedIn"
    ]
  },
  {
    "id": "dsa-delete-node-in-a-bst",
    "name": "Delete a node in BST",
    "slug": "delete-node-in-a-bst",
    "type": "dsa",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/delete-node-in-a-bst/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-recover-binary-search-tree",
    "name": "Correct BST with two nodes swapped",
    "slug": "recover-binary-search-tree",
    "type": "dsa",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/recover-binary-search-tree/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "DE Shaw"
    ]
  },
  {
    "id": "dsa-introduction-to-graph",
    "name": "Introduction to Graph",
    "slug": "introduction-to-graph",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Learning",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-graph-representation-c",
    "name": "Graph Representation | C++",
    "slug": "graph-representation-c",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Learning",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-graph-representation-java",
    "name": "Graph Representation | Java",
    "slug": "graph-representation-java",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Learning",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-connected-components",
    "name": "Connected Components",
    "slug": "connected-components",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Learning",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-traversal-techniques",
    "name": "Traversal Techniques",
    "slug": "traversal-techniques",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Learning",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-dfs",
    "name": "DFS",
    "slug": "dfs",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Learning",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-connected-components-problem-in-matrix",
    "name": "Connected Components Problem in Matrix",
    "slug": "connected-components-problem-in-matrix",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-flood-fill",
    "name": "Flood fill algorithm",
    "slug": "flood-fill",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/flood-fill/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-cycle-detection-in-undirected-graph-bfs",
    "name": "Cycle Detection in Undirected Graph (bfs)",
    "slug": "cycle-detection-in-undirected-graph-bfs",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-01-matrix",
    "name": "Distance of nearest cell having one",
    "slug": "01-matrix",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/01-matrix/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-number-of-enclaves",
    "name": "Number of enclaves",
    "slug": "number-of-enclaves",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/number-of-enclaves/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-word-ladder-ii",
    "name": "Word ladder II",
    "slug": "word-ladder-ii",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/word-ladder-ii/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ]
  },
  {
    "id": "dsa-topo-sort",
    "name": "Topo Sort",
    "slug": "topo-sort",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Topo Sort and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-topological-sort-or-kahn-s-algorithm",
    "name": "Topological sort or Kahn's algorithm",
    "slug": "topological-sort-or-kahn-s-algorithm",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Topo Sort and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-find-eventual-safe-states",
    "name": "Find eventual safe states",
    "slug": "find-eventual-safe-states",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Topo Sort and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/find-eventual-safe-states/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-shortest-path-in-undirected-graph-with-unit-weights",
    "name": "Shortest path in undirected graph with unit weights",
    "slug": "shortest-path-in-undirected-graph-with-unit-weights",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-shortest-path-in-dag",
    "name": "Shortest path in DAG",
    "slug": "shortest-path-in-dag",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-djisktra-s-algorithm",
    "name": "Djisktra's Algorithm",
    "slug": "djisktra-s-algorithm",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-why-priority-queue-is-used-in-djisktra-s-algorithm",
    "name": "Why priority Queue is used in Djisktra's Algorithm",
    "slug": "why-priority-queue-is-used-in-djisktra-s-algorithm",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-number-of-ways-to-arrive-at-destination",
    "name": "Number of ways to arrive at destination",
    "slug": "number-of-ways-to-arrive-at-destination",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-minimum-multiplications-to-reach-end",
    "name": "Minimum multiplications to reach end",
    "slug": "minimum-multiplications-to-reach-end",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-bellman-ford-algorithm",
    "name": "Bellman Ford Algorithm",
    "slug": "bellman-ford-algorithm",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-floyd-warshall-algorithm",
    "name": "Floyd warshall algorithm",
    "slug": "floyd-warshall-algorithm",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-mst-theory",
    "name": "MST theory",
    "slug": "mst-theory",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-prim-s-algorithm",
    "name": "Prim's Algorithm",
    "slug": "prim-s-algorithm",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-disjoint-set",
    "name": "Disjoint Set",
    "slug": "disjoint-set",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-find-the-mst-weight",
    "name": "Find the MST weight",
    "slug": "find-the-mst-weight",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-number-of-operations-to-make-network-connected",
    "name": "Number of operations to make network connected",
    "slug": "number-of-operations-to-make-network-connected",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/number-of-operations-to-make-network-connected/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Salesforce"
    ]
  },
  {
    "id": "dsa-most-stones-removed-with-same-row-or-column",
    "name": "Most stones removed with same row or column",
    "slug": "most-stones-removed-with-same-row-or-column",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Snapchat"
    ]
  },
  {
    "id": "dsa-accounts-merge",
    "name": "Accounts merge",
    "slug": "accounts-merge",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/accounts-merge/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-number-of-islands-ii",
    "name": "Number of islands II",
    "slug": "number-of-islands-ii",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/number-of-islands-ii/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Uber",
      "Walmart",
      "PhonePe"
    ]
  },
  {
    "id": "dsa-making-a-large-island",
    "name": "Making a large island",
    "slug": "making-a-large-island",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/making-a-large-island/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-swim-in-rising-water",
    "name": "Swim in Rising Water",
    "slug": "swim-in-rising-water",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/swim-in-rising-water/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Salesforce"
    ]
  },
  {
    "id": "dsa-articulation-point-in-graph",
    "name": "Articulation point in graph",
    "slug": "articulation-point-in-graph",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Other Algorithms",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-maximum-number-of-non-overlapping-substrings",
    "name": "Kosaraju's algorithm",
    "slug": "maximum-number-of-non-overlapping-substrings",
    "type": "dsa",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Other Algorithms",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/maximum-number-of-non-overlapping-substrings/discuss/766485/kosaraju-algorithm-on",
    "gfg": "",
    "companies": [
      "Amazon"
    ]
  },
  {
    "id": "dsa-introduction-to-dp",
    "name": "Introduction to DP",
    "slug": "introduction-to-dp",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "Introduction to DP",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-frog-jump",
    "name": "Frog Jump",
    "slug": "frog-jump",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "1D DP",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle",
      "Snapchat"
    ]
  },
  {
    "id": "dsa-frog-jump-with-k-distances",
    "name": "Frog jump with K distances",
    "slug": "frog-jump-with-k-distances",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "1D DP",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-ninja-s-training",
    "name": "Ninja's training",
    "slug": "ninja-s-training",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "2D/3D DP and DP on Grids",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-unique-paths-ii",
    "name": "Unique paths II",
    "slug": "unique-paths-ii",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "2D/3D DP and DP on Grids",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/unique-paths-ii/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Nvidia"
    ]
  },
  {
    "id": "dsa-triangle",
    "name": "Triangle",
    "slug": "triangle",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "2D/3D DP and DP on Grids",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/triangle/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-ninja-and-his-friends",
    "name": "Ninja and his Friends",
    "slug": "ninja-and-his-friends",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "2D/3D DP and DP on Grids",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-subset-sum-equal-to-target-dp-14",
    "name": "Subset sum equal to target (DP- 14)",
    "slug": "subset-sum-equal-to-target-dp-14",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-count-subsets-with-sum-k",
    "name": "Count subsets with sum K",
    "slug": "count-subsets-with-sum-k",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-count-partitions-with-given-difference",
    "name": "Count partitions with given difference",
    "slug": "count-partitions-with-given-difference",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-target-sum",
    "name": "Target sum",
    "slug": "target-sum",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/target-sum/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Zoho"
    ]
  },
  {
    "id": "dsa-coin-change-2",
    "name": "Coin Change 2 (DP - 22)",
    "slug": "coin-change-2",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/coin-change-2/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-unbounded-knapsack",
    "name": "Unbounded knapsack",
    "slug": "unbounded-knapsack",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-rod-cutting-problem-dp-24",
    "name": "Rod Cutting Problem | (DP - 24)",
    "slug": "rod-cutting-problem-dp-24",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-print-longest-common-subsequence-dp-26",
    "name": "Print Longest Common Subsequence | (DP - 26)",
    "slug": "print-longest-common-subsequence-dp-26",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-longest-common-substring",
    "name": "Longest common substring",
    "slug": "longest-common-substring",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-longest-palindromic-subsequence",
    "name": "Longest palindromic subsequence",
    "slug": "longest-palindromic-subsequence",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/longest-palindromic-subsequence/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-minimum-insertion-steps-to-make-a-string-palindrome",
    "name": "Minimum insertions to make string palindrome | DP-29",
    "slug": "minimum-insertion-steps-to-make-a-string-palindrome",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Oracle"
    ]
  },
  {
    "id": "dsa-delete-operation-for-two-strings",
    "name": "Minimum insertions or deletions to convert string A to B",
    "slug": "delete-operation-for-two-strings",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/delete-operation-for-two-strings/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft"
    ]
  },
  {
    "id": "dsa-shortest-common-supersequence",
    "name": "Shortest common supersequence",
    "slug": "shortest-common-supersequence",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/shortest-common-supersequence/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-distinct-subsequences",
    "name": "Distinct subsequences",
    "slug": "distinct-subsequences",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/distinct-subsequences/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Salesforce"
    ]
  },
  {
    "id": "dsa-wildcard-matching",
    "name": "Wildcard matching",
    "slug": "wildcard-matching",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/wildcard-matching/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "DE Shaw"
    ]
  },
  {
    "id": "dsa-best-time-to-buy-and-sell-stock-ii",
    "name": "Best time to buy and sell stock II",
    "slug": "best-time-to-buy-and-sell-stock-ii",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Stocks",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-best-time-to-buy-and-sell-stock-iii",
    "name": "Best time to buy and sell stock III",
    "slug": "best-time-to-buy-and-sell-stock-iii",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Stocks",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/description/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-best-time-to-buy-and-sell-stock-iv",
    "name": "Best time to buy and sell stock IV",
    "slug": "best-time-to-buy-and-sell-stock-iv",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Stocks",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ]
  },
  {
    "id": "dsa-best-time-to-buy-and-sell-stock-with-cooldown",
    "name": "Best Time to Buy and Sell Stock with Cooldown",
    "slug": "best-time-to-buy-and-sell-stock-with-cooldown",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Stocks",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-best-time-to-buy-and-sell-stock-with-transaction-fee",
    "name": "Best time to buy and sell stock with transaction fees",
    "slug": "best-time-to-buy-and-sell-stock-with-transaction-fee",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Stocks",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-print-longest-increasing-subsequence",
    "name": "Print Longest Increasing Subsequence",
    "slug": "print-longest-increasing-subsequence",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on LIS",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-longest-increasing-subsequence-dp-43",
    "name": "Longest Increasing Subsequence |(DP-43)",
    "slug": "longest-increasing-subsequence-dp-43",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on LIS",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-longest-bitonic-subsequence",
    "name": "Longest Bitonic Subsequence",
    "slug": "longest-bitonic-subsequence",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on LIS",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ]
  },
  {
    "id": "dsa-number-of-longest-increasing-subsequence",
    "name": "Number of Longest Increasing Subsequences",
    "slug": "number-of-longest-increasing-subsequence",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on LIS",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/number-of-longest-increasing-subsequence/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-matrix-chain-multiplication",
    "name": "Matrix chain multiplication",
    "slug": "matrix-chain-multiplication",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "MCM DP | Partition DP",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-matrix-chain-multiplication-bottom-up-dp-49",
    "name": "Matrix Chain Multiplication | Bottom-Up|(DP-49)",
    "slug": "matrix-chain-multiplication-bottom-up-dp-49",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "MCM DP | Partition DP",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-minimum-cost-to-cut-a-stick",
    "name": "Minimum cost to cut the stick",
    "slug": "minimum-cost-to-cut-a-stick",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "MCM DP | Partition DP",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ]
  },
  {
    "id": "dsa-parsing-a-boolean-expression",
    "name": "Different Ways to Evaluate a Boolean Expression",
    "slug": "parsing-a-boolean-expression",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "MCM DP | Partition DP",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/parsing-a-boolean-expression/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-partition-array-for-maximum-sum",
    "name": "Partition Array for Maximum Sum",
    "slug": "partition-array-for-maximum-sum",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "MCM DP | Partition DP",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/partition-array-for-maximum-sum/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-count-square-submatrices-with-all-ones",
    "name": "Count Square Submatrices with All Ones|(DP-56)",
    "slug": "count-square-submatrices-with-all-ones",
    "type": "dsa",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Squares",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/count-square-submatrices-with-all-ones/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-trie-implementation-and-advanced-operations",
    "name": "Trie Implementation and Advanced Operations",
    "slug": "trie-implementation-and-advanced-operations",
    "type": "dsa",
    "category": "Step 17: Tries",
    "subcategory": "Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-longest-word-with-all-prefixes",
    "name": "Longest Word with All Prefixes",
    "slug": "longest-word-with-all-prefixes",
    "type": "dsa",
    "category": "Step 17: Tries",
    "subcategory": "Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google"
    ]
  },
  {
    "id": "dsa-bit-prerequisites-for-trie-problems",
    "name": "Bit PreRequisites for TRIE Problems",
    "slug": "bit-prerequisites-for-trie-problems",
    "type": "dsa",
    "category": "Step 17: Tries",
    "subcategory": "Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-minimum-add-to-make-parentheses-valid",
    "name": "Minimum number of bracket reversals to make an expression balanced",
    "slug": "minimum-add-to-make-parentheses-valid",
    "type": "dsa",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-hashing-in-strings-theory",
    "name": "Hashing In Strings | Theory",
    "slug": "hashing-in-strings-theory",
    "type": "dsa",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "difficulty": "Easy",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ]
  },
  {
    "id": "dsa-z-function",
    "name": "Z function",
    "slug": "z-function",
    "type": "dsa",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-implement-strstr",
    "name": "KMP Algorithm or LPS array",
    "slug": "implement-strstr",
    "type": "dsa",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/implement-strstr/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ]
  },
  {
    "id": "dsa-longest-happy-prefix",
    "name": "Longest happy prefix",
    "slug": "longest-happy-prefix",
    "type": "dsa",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "difficulty": "Hard",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/longest-happy-prefix/",
    "gfg": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ]
  },
  {
    "id": "dsa-count-palindromic-subsequences",
    "name": "Count Palindromic Subsequences",
    "slug": "count-palindromic-subsequences",
    "type": "dsa",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "difficulty": "Medium",
    "sheets": [
      "a2z"
    ],
    "leetcode": "https://leetcode.com/problems/count-palindromic-subsequences/",
    "gfg": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs",
      "Atlassian"
    ]
  }
];

export const ALL_ADMIN_PROBLEMS: AdminProblemItem[] = [
  ...LLD_PROBLEMS,
  ...DSA_PROBLEMS
];

/**
 * Returns clean slug from any string
 */
export function toSlug(str?: string): string {
  if (!str) return 'algorithm-problem';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Quick lookup of problem by slug
 */
export function getProblemBySlug(slug: string): AdminProblemItem | undefined {
  const clean = toSlug(slug);
  return ALL_ADMIN_PROBLEMS.find(p => p.slug === clean || toSlug(p.slug) === clean);
}

/**
 * Generate default starter code template for a problem
 */
export function generateStarterCode(slug: string, lang: SupportedLanguage): string {
  const words = slug.split('-').filter(Boolean);
  const camelCase = words.length > 0
    ? words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    : 'solve';
  const snakeCase = words.map(w => w.toLowerCase()).join('_') || 'solve';

  switch (lang) {
    case 'cpp':
      return `class Solution {\npublic:\n    int ${camelCase}(vector<int>& nums) {\n        // Implement optimal solution\n        return 0;\n    }\n};`;
    case 'python':
      return `class Solution:\n    def ${camelCase}(self, nums: List[int]) -> int:\n        # Implement optimal solution\n        return 0`;
    case 'java':
      return `class Solution {\n    public int ${camelCase}(int[] nums) {\n        // Implement optimal solution\n        return 0;\n    }\n}`;
    case 'javascript':
      return `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar ${camelCase} = function(nums) {\n    // Implement optimal solution\n    return 0;\n};`;
    case 'go':
      return `func ${camelCase}(nums []int) int {\n    // Implement optimal solution\n    return 0\n}`;
    case 'rust':
      return `impl Solution {\n    pub fn ${snakeCase}(nums: Vec<i32>) -> i32 {\n        // Implement optimal solution\n        0\n    }\n}`;
    case 'sql':
      return `-- Write SQL Query\nSELECT * FROM table_name;`;
    default:
      return `// Starter code for ${slug}`;
  }
}

// In-memory cache for full merged catalog (DSA sheets + 3,400 company problems + LLD)
let cachedExtendedCatalog: AdminProblemItem[] | null = null;
let extendedCatalogPromise: Promise<AdminProblemItem[]> | null = null;

export async function fetchExtendedCatalog(): Promise<AdminProblemItem[]> {
  if (cachedExtendedCatalog) return cachedExtendedCatalog;
  if (extendedCatalogPromise) return extendedCatalogPromise;

  extendedCatalogPromise = (async () => {
    const existingSlugs = new Set(ALL_ADMIN_PROBLEMS.map(p => toSlug(p.slug)));
    const merged: AdminProblemItem[] = [...ALL_ADMIN_PROBLEMS];

    // 1. Try local static asset from admin-portal/public/data
    let companyProblemsData: any = null;
    try {
      const resp = await fetch('/data/company_problems.json');
      if (resp.ok) {
        companyProblemsData = await resp.json();
      }
    } catch (_) {}

    // 2. Try sdetube CDN fallback
    if (!companyProblemsData) {
      try {
        const resp = await fetch('https://sdetube.pages.dev/data/company_problems.json');
        if (resp.ok) {
          companyProblemsData = await resp.json();
        }
      } catch (_) {}
    }

    if (companyProblemsData && companyProblemsData.problems) {
      const problemsObj = companyProblemsData.problems;
      for (const key of Object.keys(problemsObj)) {
        const cp = problemsObj[key];
        const s = toSlug(cp.slug || cp.title || key);
        if (!existingSlugs.has(s)) {
          existingSlugs.add(s);
          merged.push({
            id: String(cp.id || s),
            name: cp.title || cp.name || s,
            slug: s,
            type: 'dsa',
            category: cp.topicTags?.[0] || 'Company DSA',
            subcategory: cp.topicTags?.slice(1).join(', ') || undefined,
            difficulty: (cp.difficulty || 'Medium') as ProblemDifficulty,
            sheets: ['company_dsa'],
            leetcode: cp.url || (cp.slug ? `https://leetcode.com/problems/${cp.slug}/` : undefined),
            companies: Array.isArray(cp.companies) ? cp.companies : []
          });
        }
      }
    }

    cachedExtendedCatalog = merged;
    return merged;
  })();

  return extendedCatalogPromise;
}
