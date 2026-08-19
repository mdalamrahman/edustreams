export type DSASheetType = 'sde' | 'a2z' | '79';

export interface DSAProblem {
  id: number;
  sheetType: DSASheetType;
  category: string;
  name: string;
  leetcode: string;
  gfg: string;
  companies: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: string;
  slug?: string;
  starter_code_cpp?: string;
  starter_code_python?: string;
}

// Backward compatibility alias for SDEProblem
export type SDEProblem = DSAProblem;

export interface SheetConfig {
  id: DSASheetType;
  name: string;
  shortName: string;
  totalQuestions: number;
  description: string;
  icon: string;
  accentGradient: string;
}

export const DSA_SHEETS_CONFIG: Record<DSASheetType, SheetConfig> = {
  sde: {
    id: 'sde',
    name: "SDETube's SDE Sheet",
    shortName: 'SDE Sheet',
    totalQuestions: 191,
    description: '191 Essential Curated Interview Problems across 27 Days',
    icon: 'rocket',
    accentGradient: 'from-emerald-600 to-teal-600'
  },
  a2z: {
    id: 'a2z',
    name: "SDETube's A2Z DSA Sheet",
    shortName: 'A2Z Roadmap',
    totalQuestions: 473,
    description: 'Complete 473-Problem Step-by-Step DSA Roadmap across 18 Steps',
    icon: 'book-open',
    accentGradient: 'from-indigo-600 to-purple-600'
  },
  79: {
    id: '79',
    name: "SDETube's 79 Sheet",
    shortName: '79 Fast-Track',
    totalQuestions: 79,
    description: '79 High-Yield Last-Moment Interview Patterns',
    icon: 'zap',
    accentGradient: 'from-amber-600 to-orange-600'
  }
};

export function getLeetCodeSlug(problem: DSAProblem): string {
  if (problem.slug) return problem.slug;
  const match = problem.leetcode.match(/\/problems\/([^/]+)/);
  return match ? match[1] : problem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const SDE_SHEET_191_DATA: DSAProblem[] = [
  {
    "id": 1,
    "sheetType": "sde",
    "category": "Arrays Part-I",
    "name": "Set Matrix Zeroes",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/set-matrix-zeroes/",
    "gfg": "https://www.geeksforgeeks.org/problems/set-matrix-zeroes/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta",
      "Google"
    ],
    "slug": "set-matrix-zeroes"
  },
  {
    "id": 2,
    "sheetType": "sde",
    "category": "Arrays Part-I",
    "name": "Pascal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/pascals-triangle/",
    "gfg": "https://www.geeksforgeeks.org/problems/pascal-triangle0652/1",
    "companies": [
      "Amazon",
      "Google",
      "Goldman Sachs"
    ],
    "slug": "pascals-triangle"
  },
  {
    "id": 3,
    "sheetType": "sde",
    "category": "Arrays Part-I",
    "name": "Next Permutation",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/next-permutation/",
    "gfg": "https://www.geeksforgeeks.org/problems/next-permutation5226/1",
    "companies": [
      "Meta",
      "Amazon",
      "Adobe",
      "Uber"
    ],
    "slug": "next-permutation"
  },
  {
    "id": 4,
    "sheetType": "sde",
    "category": "Arrays Part-I",
    "name": "Kadane",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/maximum-subarray/",
    "gfg": "https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Walmart"
    ],
    "slug": "maximum-subarray"
  },
  {
    "id": 5,
    "sheetType": "sde",
    "category": "Arrays Part-I",
    "name": "Sort an Array of 0s 1s and 2s",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/sort-colors/",
    "gfg": "https://www.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s4231/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Paytm",
      "Flipkart"
    ],
    "slug": "sort-colors"
  },
  {
    "id": 6,
    "sheetType": "sde",
    "category": "Arrays Part-I",
    "name": "Stock Buy and Sell",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "gfg": "https://www.geeksforgeeks.org/problems/stock-buy-and-sell2615/1",
    "companies": [
      "Amazon",
      "Meta",
      "Microsoft",
      "Oracle"
    ],
    "slug": "best-time-to-buy-and-sell-stock"
  },
  {
    "id": 7,
    "sheetType": "sde",
    "category": "Arrays Part-II",
    "name": "Rotate Matrix (Image)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/rotate-image/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotate-by-90-degree-1587115621/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Uber",
      "Apple"
    ],
    "slug": "rotate-image"
  },
  {
    "id": 8,
    "sheetType": "sde",
    "category": "Arrays Part-II",
    "name": "Merge Overlapping Subintervals",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/merge-intervals/",
    "gfg": "https://www.geeksforgeeks.org/problems/overlapping-intervals--170643/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Salesforce"
    ],
    "slug": "merge-intervals"
  },
  {
    "id": 9,
    "sheetType": "sde",
    "category": "Arrays Part-II",
    "name": "Merge Two Sorted Arrays Without Extra Space",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/merge-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-two-sorted-arrays-1587115620/1",
    "companies": [
      "Goldman Sachs",
      "Amdocs"
    ],
    "slug": "merge-sorted-array"
  },
  {
    "id": 10,
    "sheetType": "sde",
    "category": "Arrays Part-II",
    "name": "Find Duplicate in Array of N+1 Integers",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-duplicate-number/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-duplicates-in-an-array/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Qualcomm"
    ],
    "slug": "find-the-duplicate-number"
  },
  {
    "id": 11,
    "sheetType": "sde",
    "category": "Arrays Part-II",
    "name": "Repeat and Missing Number",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/set-mismatch/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-missing-and-repeating2512/1",
    "companies": [
      "Amazon",
      "Goldman Sachs",
      "Deloitte"
    ],
    "slug": "set-mismatch"
  },
  {
    "id": 12,
    "sheetType": "sde",
    "category": "Arrays Part-II",
    "name": "Count Inversions in Array",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/global-and-local-inversions/",
    "gfg": "https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1",
    "companies": [
      "Amazon",
      "Flipkart",
      "Microsoft"
    ],
    "slug": "global-and-local-inversions"
  },
  {
    "id": 13,
    "sheetType": "sde",
    "category": "Arrays Part-III",
    "name": "Search in a 2D Matrix",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-a-matrix-1587115621/1",
    "companies": [
      "Amazon",
      "Meta",
      "Oracle"
    ],
    "slug": "search-a-2d-matrix"
  },
  {
    "id": 14,
    "sheetType": "sde",
    "category": "Arrays Part-III",
    "name": "Pow(x, n)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/powx-n/",
    "gfg": "https://www.geeksforgeeks.org/problems/power-of-numbers-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Bloomberg"
    ],
    "slug": "powx-n"
  },
  {
    "id": 15,
    "sheetType": "sde",
    "category": "Arrays Part-III",
    "name": "Majority Element (> N/2 times)",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/majority-element/",
    "gfg": "https://www.geeksforgeeks.org/problems/majority-element-1587115620/1",
    "companies": [
      "Amazon",
      "Google",
      "Morgan Stanley"
    ],
    "slug": "majority-element"
  },
  {
    "id": 16,
    "sheetType": "sde",
    "category": "Arrays Part-III",
    "name": "Majority Element II (> N/3 times)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/majority-element-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/majority-vote/1",
    "companies": [
      "Meta",
      "Amazon",
      "Uber"
    ],
    "slug": "majority-element-ii"
  },
  {
    "id": 17,
    "sheetType": "sde",
    "category": "Arrays Part-III",
    "name": "Grid Unique Paths",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/unique-paths/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-paths0925/1",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "slug": "unique-paths"
  },
  {
    "id": 18,
    "sheetType": "sde",
    "category": "Arrays Part-III",
    "name": "Reverse Pairs",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-pairs/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-reverse-pairs/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "reverse-pairs"
  },
  {
    "id": 19,
    "sheetType": "sde",
    "category": "Arrays Part-IV",
    "name": "2 Sum Problem",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/two-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/key-pair5610/1",
    "companies": [
      "Amazon",
      "Meta",
      "Apple",
      "Microsoft"
    ],
    "slug": "two-sum"
  },
  {
    "id": 20,
    "sheetType": "sde",
    "category": "Arrays Part-IV",
    "name": "4 Sum Problem",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/4sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-all-four-sum-numbers1732/1",
    "companies": [
      "Amazon",
      "Google",
      "LinkedIn"
    ],
    "slug": "4sum"
  },
  {
    "id": 21,
    "sheetType": "sde",
    "category": "Arrays Part-IV",
    "name": "Longest Consecutive Sequence",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-consecutive-sequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-consecutive-subsequence2421/1",
    "companies": [
      "Amazon",
      "Google",
      "Spotify"
    ],
    "slug": "longest-consecutive-sequence"
  },
  {
    "id": 22,
    "sheetType": "sde",
    "category": "Arrays Part-IV",
    "name": "Largest Subarray with 0 Sum",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/contiguous-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/largest-subarray-with-0-sum/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "MakeMyTrip"
    ],
    "slug": "contiguous-array"
  },
  {
    "id": 23,
    "sheetType": "sde",
    "category": "Arrays Part-IV",
    "name": "Count Subarrays with Given XOR K",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/subarray-sum-equals-k/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-subarray-with-given-xor/1",
    "companies": [
      "Amazon",
      "Google",
      "Flipkart"
    ],
    "slug": "subarray-sum-equals-k"
  },
  {
    "id": 24,
    "sheetType": "sde",
    "category": "Arrays Part-IV",
    "name": "Longest Substring Without Repeating Characters",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "gfg": "https://www.geeksforgeeks.org/problems/length-of-the-longest-substring3036/1",
    "companies": [
      "Amazon",
      "Meta",
      "Bloomberg"
    ],
    "slug": "longest-substring-without-repeating-characters"
  },
  {
    "id": 25,
    "sheetType": "sde",
    "category": "Linked List",
    "name": "Reverse a Linked List",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Adobe",
      "Uber"
    ],
    "slug": "reverse-linked-list"
  },
  {
    "id": 26,
    "sheetType": "sde",
    "category": "Linked List",
    "name": "Find Middle of Linked List",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/middle-of-the-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/finding-middle-element-in-a-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "TCS"
    ],
    "slug": "middle-of-the-linked-list"
  },
  {
    "id": 27,
    "sheetType": "sde",
    "category": "Linked List",
    "name": "Merge Two Sorted Linked Lists",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/merge-two-sorted-lists/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-two-sorted-linked-lists/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "slug": "merge-two-sorted-lists"
  },
  {
    "id": 28,
    "sheetType": "sde",
    "category": "Linked List",
    "name": "Remove Nth Node From End of List",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/nth-node-from-end-of-linked-list/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "remove-nth-node-from-end-of-list"
  },
  {
    "id": 29,
    "sheetType": "sde",
    "category": "Linked List",
    "name": "Add Two Numbers as LinkedLists",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/add-two-numbers/",
    "gfg": "https://www.geeksforgeeks.org/problems/add-two-numbers-represented-by-linked-lists/1",
    "companies": [
      "Amazon",
      "Meta",
      "Bloomberg"
    ],
    "slug": "add-two-numbers"
  },
  {
    "id": 30,
    "sheetType": "sde",
    "category": "Linked List",
    "name": "Delete Node in a Linked List",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/delete-node-in-a-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/delete-without-head-pointer/1",
    "companies": [
      "Apple",
      "Adobe",
      "Amazon"
    ],
    "slug": "delete-node-in-a-linked-list"
  },
  {
    "id": 31,
    "sheetType": "sde",
    "category": "Linked List Part-II",
    "name": "Find Intersection Point of Y LinkedList",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
    "gfg": "https://www.geeksforgeeks.org/problems/intersection-point-in-y-shapped-linked-lists/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Visa"
    ],
    "slug": "intersection-of-two-linked-lists"
  },
  {
    "id": 32,
    "sheetType": "sde",
    "category": "Linked List Part-II",
    "name": "Detect Cycle in Linked List",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Yahoo"
    ],
    "slug": "linked-list-cycle"
  },
  {
    "id": 33,
    "sheetType": "sde",
    "category": "Linked List Part-II",
    "name": "Reverse Nodes in K-Group",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-a-linked-list-in-groups-of-given-size/1",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "slug": "reverse-nodes-in-k-group"
  },
  {
    "id": 34,
    "sheetType": "sde",
    "category": "Linked List Part-II",
    "name": "Check if Linked List is Palindrome",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/palindrome-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-if-linked-list-is-pallindrome/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Adobe"
    ],
    "slug": "palindrome-linked-list"
  },
  {
    "id": 35,
    "sheetType": "sde",
    "category": "Linked List Part-II",
    "name": "Find Starting Point of Loop in LinkedList",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-first-node-of-loop-in-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Paytm"
    ],
    "slug": "linked-list-cycle-ii"
  },
  {
    "id": 36,
    "sheetType": "sde",
    "category": "Linked List Part-II",
    "name": "Flattening of a LinkedList",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/flattening-a-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Flipkart"
    ],
    "slug": "flatten-a-multilevel-doubly-linked-list"
  },
  {
    "id": 37,
    "sheetType": "sde",
    "category": "Linked List and Arrays",
    "name": "Rotate a LinkedList",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/rotate-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotate-a-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "rotate-list"
  },
  {
    "id": 38,
    "sheetType": "sde",
    "category": "Linked List and Arrays",
    "name": "Clone Linked List with Random and Next Pointer",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/copy-list-with-random-pointer/",
    "gfg": "https://www.geeksforgeeks.org/problems/clone-a-linked-list-with-next-and-random-pointer/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "copy-list-with-random-pointer"
  },
  {
    "id": 39,
    "sheetType": "sde",
    "category": "Linked List and Arrays",
    "name": "3 Sum Problem",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/3sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-triplets-with-zero-sum/1",
    "companies": [
      "Amazon",
      "Meta",
      "Apple"
    ],
    "slug": "3sum"
  },
  {
    "id": 40,
    "sheetType": "sde",
    "category": "Linked List and Arrays",
    "name": "Trapping Rain Water",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/trapping-rain-water/",
    "gfg": "https://www.geeksforgeeks.org/problems/trapping-rain-water-1587115621/1",
    "companies": [
      "Google",
      "Amazon",
      "Goldman Sachs"
    ],
    "slug": "trapping-rain-water"
  },
  {
    "id": 41,
    "sheetType": "sde",
    "category": "Linked List and Arrays",
    "name": "Remove Duplicates from Sorted Array",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/remove-duplicate-elements-from-sorted-array/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "slug": "remove-duplicates-from-sorted-array"
  },
  {
    "id": 42,
    "sheetType": "sde",
    "category": "Linked List and Arrays",
    "name": "Max Consecutive Ones",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "https://leetcode.com/problems/max-consecutive-ones/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-consecutive-ones/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "max-consecutive-ones"
  },
  {
    "id": 43,
    "sheetType": "sde",
    "category": "Greedy Algorithm",
    "name": "N Meetings in One Room",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/meeting-rooms/",
    "gfg": "https://www.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Flipkart"
    ],
    "slug": "meeting-rooms"
  },
  {
    "id": 44,
    "sheetType": "sde",
    "category": "Greedy Algorithm",
    "name": "Minimum Platforms Required for Railway Station",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/meeting-rooms-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1",
    "companies": [
      "Amazon",
      "Google",
      "Walmart"
    ],
    "slug": "meeting-rooms-ii"
  },
  {
    "id": 45,
    "sheetType": "sde",
    "category": "Greedy Algorithm",
    "name": "Job Sequencing Problem",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-profit-in-job-scheduling/",
    "gfg": "https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "maximum-profit-in-job-scheduling"
  },
  {
    "id": 46,
    "sheetType": "sde",
    "category": "Greedy Algorithm",
    "name": "Fractional Knapsack Problem",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-units-on-a-truck/",
    "gfg": "https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "maximum-units-on-a-truck"
  },
  {
    "id": 47,
    "sheetType": "sde",
    "category": "Greedy Algorithm",
    "name": "Greedy Algorithm for Minimum Coins",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/coin-change/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-coins1824/1",
    "companies": [
      "Amazon",
      "Paytm"
    ],
    "slug": "coin-change"
  },
  {
    "id": 48,
    "sheetType": "sde",
    "category": "Greedy Algorithm",
    "name": "Assign Cookies / Candy",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "https://leetcode.com/problems/assign-cookies/",
    "gfg": "https://www.geeksforgeeks.org/problems/assign-cookies/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "assign-cookies"
  },
  {
    "id": 49,
    "sheetType": "sde",
    "category": "Recursion",
    "name": "Subset Sums",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/subsets/",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sums1516/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "subsets"
  },
  {
    "id": 50,
    "sheetType": "sde",
    "category": "Recursion",
    "name": "Subset II (Unique Subsets)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/subsets-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sum-ii/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "subsets-ii"
  },
  {
    "id": 51,
    "sheetType": "sde",
    "category": "Recursion",
    "name": "Combination Sum I",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/combination-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/combination-sum-1587115620/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "combination-sum"
  },
  {
    "id": 52,
    "sheetType": "sde",
    "category": "Recursion",
    "name": "Combination Sum II",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/combination-sum-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/combination-sum-ii-1664263832/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "combination-sum-ii"
  },
  {
    "id": 53,
    "sheetType": "sde",
    "category": "Recursion",
    "name": "Palindrome Partitioning",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/palindrome-partitioning/",
    "gfg": "https://www.geeksforgeeks.org/problems/palindrome-partitioning3622/1",
    "companies": [
      "Google",
      "Amazon",
      "Meta"
    ],
    "slug": "palindrome-partitioning"
  },
  {
    "id": 54,
    "sheetType": "sde",
    "category": "Recursion",
    "name": "K-th Permutation Sequence",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/permutation-sequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-th-permutation-sequence/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "permutation-sequence"
  },
  {
    "id": 55,
    "sheetType": "sde",
    "category": "Recursion and Backtracking",
    "name": "Print All Permutations of Array / String",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/permutations/",
    "gfg": "https://www.geeksforgeeks.org/problems/permutations-of-a-given-string2041/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "permutations"
  },
  {
    "id": 56,
    "sheetType": "sde",
    "category": "Recursion and Backtracking",
    "name": "N Queens Problem",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/n-queens/",
    "gfg": "https://www.geeksforgeeks.org/problems/n-queen-problem0315/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "n-queens"
  },
  {
    "id": 57,
    "sheetType": "sde",
    "category": "Recursion and Backtracking",
    "name": "Sudoku Solver",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/sudoku-solver/",
    "gfg": "https://www.geeksforgeeks.org/problems/solve-the-sudoku-1587115621/1",
    "companies": [
      "Google",
      "Uber",
      "Amazon"
    ],
    "slug": "sudoku-solver"
  },
  {
    "id": 58,
    "sheetType": "sde",
    "category": "Recursion and Backtracking",
    "name": "M Coloring Problem",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/flower-planting-with-no-adjacent/",
    "gfg": "https://www.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "flower-planting-with-no-adjacent"
  },
  {
    "id": 59,
    "sheetType": "sde",
    "category": "Recursion and Backtracking",
    "name": "Rat in a Maze",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/unique-paths-iii/",
    "gfg": "https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem--1587115621/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "unique-paths-iii"
  },
  {
    "id": 60,
    "sheetType": "sde",
    "category": "Recursion and Backtracking",
    "name": "Word Break (Print all ways)",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/word-break-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-break-part-23201/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon"
    ],
    "slug": "word-break-ii"
  },
  {
    "id": 61,
    "sheetType": "sde",
    "category": "Binary Search",
    "name": "N-th Root of an Integer",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/powx-n/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-nth-root-of-m5843/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "powx-n"
  },
  {
    "id": 62,
    "sheetType": "sde",
    "category": "Binary Search",
    "name": "Matrix Median",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
    "gfg": "https://www.geeksforgeeks.org/problems/matrix-median0732/1",
    "companies": [
      "Amazon",
      "Flipkart"
    ],
    "slug": "kth-smallest-element-in-a-sorted-matrix"
  },
  {
    "id": 63,
    "sheetType": "sde",
    "category": "Binary Search",
    "name": "Single Element in a Sorted Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/single-element-in-a-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-the-element-that-appears-once-in-sorted-array0624/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "single-element-in-a-sorted-array"
  },
  {
    "id": 64,
    "sheetType": "sde",
    "category": "Binary Search",
    "name": "Search Element in Sorted and Rotated Array",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-a-rotated-array4618/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "search-in-rotated-sorted-array"
  },
  {
    "id": 65,
    "sheetType": "sde",
    "category": "Binary Search",
    "name": "Median of 2 Sorted Arrays",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    "gfg": "https://www.geeksforgeeks.org/problems/median-of-2-sorted-arrays-of-different-sizes/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft"
    ],
    "slug": "median-of-two-sorted-arrays"
  },
  {
    "id": 66,
    "sheetType": "sde",
    "category": "Binary Search",
    "name": "K-th Element of Two Sorted Arrays",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/kth-smallest-product-of-two-sorted-arrays/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array1317/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "kth-smallest-product-of-two-sorted-arrays"
  },
  {
    "id": 67,
    "sheetType": "sde",
    "category": "Binary Search",
    "name": "Allocate Minimum Number of Pages",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
    "gfg": "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1",
    "companies": [
      "Google",
      "Amazon",
      "Flipkart"
    ],
    "slug": "capacity-to-ship-packages-within-d-days"
  },
  {
    "id": 68,
    "sheetType": "sde",
    "category": "Binary Search",
    "name": "Aggressive Cows",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/magnetic-force-between-two-balls/",
    "gfg": "https://www.geeksforgeeks.org/problems/aggressive-cows/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "magnetic-force-between-two-balls"
  },
  {
    "id": 69,
    "sheetType": "sde",
    "category": "Heaps",
    "name": "Max Heap Min Heap Implementation",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/heap-sort/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "max-heap-min-heap-implementation"
  },
  {
    "id": 70,
    "sheetType": "sde",
    "category": "Heaps",
    "name": "Kth Largest Element in an Array",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-largest-elements4206/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "kth-largest-element-in-an-array"
  },
  {
    "id": 71,
    "sheetType": "sde",
    "category": "Heaps",
    "name": "Maximum Sum Combination",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-sum-combination/1",
    "companies": [
      "Amazon",
      "Flipkart"
    ],
    "slug": "find-k-pairs-with-smallest-sums"
  },
  {
    "id": 72,
    "sheetType": "sde",
    "category": "Heaps",
    "name": "Find Median from Data Stream",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/find-median-from-data-stream/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-median-in-a-stream-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon"
    ],
    "slug": "find-median-from-data-stream"
  },
  {
    "id": 73,
    "sheetType": "sde",
    "category": "Heaps",
    "name": "Merge K Sorted Arrays",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/merge-k-sorted-lists/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "slug": "merge-k-sorted-lists"
  },
  {
    "id": 74,
    "sheetType": "sde",
    "category": "Heaps",
    "name": "Top K Frequent Elements",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/top-k-frequent-elements/",
    "gfg": "https://www.geeksforgeeks.org/problems/top-k-frequent-elements-in-array/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "top-k-frequent-elements"
  },
  {
    "id": 75,
    "sheetType": "sde",
    "category": "Stack and Queue",
    "name": "Implement Stack using Array",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/implement-stack-using-array/1",
    "companies": [
      "Amazon",
      "TCS"
    ],
    "slug": "implement-stack-using-array"
  },
  {
    "id": 76,
    "sheetType": "sde",
    "category": "Stack and Queue",
    "name": "Implement Queue using Array",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/implement-queue-using-array/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "implement-queue-using-array"
  },
  {
    "id": 77,
    "sheetType": "sde",
    "category": "Stack and Queue",
    "name": "Implement Stack using Queue",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/implement-stack-using-queues/",
    "gfg": "https://www.geeksforgeeks.org/problems/stack-using-two-queues/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "implement-stack-using-queues"
  },
  {
    "id": 78,
    "sheetType": "sde",
    "category": "Stack and Queue",
    "name": "Implement Queue using Stack",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/implement-queue-using-stacks/",
    "gfg": "https://www.geeksforgeeks.org/problems/queue-using-two-stacks/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "implement-queue-using-stacks"
  },
  {
    "id": 79,
    "sheetType": "sde",
    "category": "Stack and Queue",
    "name": "Check for Balanced Parentheses",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/valid-parentheses/",
    "gfg": "https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "valid-parentheses"
  },
  {
    "id": 80,
    "sheetType": "sde",
    "category": "Stack and Queue",
    "name": "Next Greater Element",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/next-greater-element-i/",
    "gfg": "https://www.geeksforgeeks.org/problems/next-larger-element-1587115620/1",
    "companies": [
      "Amazon",
      "Flipkart",
      "Meta"
    ],
    "slug": "next-greater-element-i"
  },
  {
    "id": 81,
    "sheetType": "sde",
    "category": "Stack and Queue",
    "name": "Sort a Stack",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/sort-a-stack/1",
    "companies": [
      "Amazon",
      "Goldman Sachs"
    ],
    "slug": "sort-a-stack"
  },
  {
    "id": 82,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "name": "Next Smaller Element",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/final-prices-with-a-special-discount-in-a-shop/",
    "gfg": "https://www.geeksforgeeks.org/problems/help-classmates--141631/1",
    "companies": [
      "Amazon"
    ],
    "slug": "final-prices-with-a-special-discount-in-a-shop"
  },
  {
    "id": 83,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "name": "LRU Cache Implementation",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/lru-cache/",
    "gfg": "https://www.geeksforgeeks.org/problems/lru-cache/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "lru-cache"
  },
  {
    "id": 84,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "name": "LFU Cache Implementation",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/lfu-cache/",
    "gfg": "https://www.geeksforgeeks.org/problems/lfu-cache/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "lfu-cache"
  },
  {
    "id": 85,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "name": "Largest Rectangle in Histogram",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-rectangular-area-in-a-histogram-1587115620/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "largest-rectangle-in-histogram"
  },
  {
    "id": 86,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "name": "Sliding Window Maximum",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-of-all-subarrays-of-size-k5901/1",
    "companies": [
      "Google",
      "Amazon",
      "Uber"
    ],
    "slug": "sliding-window-maximum"
  },
  {
    "id": 87,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "name": "Implement Min Stack",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/min-stack/",
    "gfg": "https://www.geeksforgeeks.org/problems/get-minimum-element-from-stack/1",
    "companies": [
      "Amazon",
      "Meta",
      "Microsoft"
    ],
    "slug": "min-stack"
  },
  {
    "id": 88,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "name": "Rotten Oranges",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/rotting-oranges/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotting-oranges2536/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "rotting-oranges"
  },
  {
    "id": 89,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "name": "Stock Span Problem",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/online-stock-span/",
    "gfg": "https://www.geeksforgeeks.org/problems/stock-span-problem-1587115621/1",
    "companies": [
      "Amazon",
      "Flipkart"
    ],
    "slug": "online-stock-span"
  },
  {
    "id": 90,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "name": "The Celebrity Problem",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-celebrity/",
    "gfg": "https://www.geeksforgeeks.org/problems/the-celebrity-problem/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "find-the-celebrity"
  },
  {
    "id": 91,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "name": "Maximum of Minimum for Every Window Size",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-of-minimum-for-every-window-size3453/1",
    "companies": [
      "Amazon",
      "Flipkart"
    ],
    "slug": "maximum-of-minimum-for-every-window-size"
  },
  {
    "id": 92,
    "sheetType": "sde",
    "category": "String",
    "name": "Reverse Words in a String",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-words-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-words-in-a-given-string3547/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "reverse-words-in-a-string"
  },
  {
    "id": 93,
    "sheetType": "sde",
    "category": "String",
    "name": "Longest Palindromic Substring",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-palindromic-substring/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-palindromic-substring0857/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "longest-palindromic-substring"
  },
  {
    "id": 94,
    "sheetType": "sde",
    "category": "String",
    "name": "Roman to Integer",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/roman-to-integer/",
    "gfg": "https://www.geeksforgeeks.org/problems/roman-number-to-integer3201/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "roman-to-integer"
  },
  {
    "id": 95,
    "sheetType": "sde",
    "category": "String",
    "name": "Implement String to Integer (ATOI)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/string-to-integer-atoi/",
    "gfg": "https://www.geeksforgeeks.org/problems/implement-atoi/1",
    "companies": [
      "Meta",
      "Amazon",
      "Microsoft"
    ],
    "slug": "string-to-integer-atoi"
  },
  {
    "id": 96,
    "sheetType": "sde",
    "category": "String",
    "name": "Longest Common Prefix",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/longest-common-prefix/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-common-prefix-in-an-array5129/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "longest-common-prefix"
  },
  {
    "id": 97,
    "sheetType": "sde",
    "category": "String",
    "name": "Rabin Karp Algorithm",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/repeated-string-match/",
    "gfg": "https://www.geeksforgeeks.org/problems/rabin-karp-algorithm/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "repeated-string-match"
  },
  {
    "id": 98,
    "sheetType": "sde",
    "category": "String Part-II",
    "name": "Z-Function",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-pattern-z-algorithm--141631/1",
    "companies": [
      "Google",
      "Meta"
    ],
    "slug": "find-the-index-of-the-first-occurrence-in-a-string"
  },
  {
    "id": 99,
    "sheetType": "sde",
    "category": "String Part-II",
    "name": "KMP Algorithm / Find Index of First Occurrence",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-pattern-kmp-algorithm--141631/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "find-the-index-of-the-first-occurrence-in-a-string"
  },
  {
    "id": 100,
    "sheetType": "sde",
    "category": "String Part-II",
    "name": "Minimum Characters Needed to Make String Palindromic",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/shortest-palindrome/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-characters-to-be-added-at-front-to-make-string-palindrome/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "shortest-palindrome"
  },
  {
    "id": 101,
    "sheetType": "sde",
    "category": "String Part-II",
    "name": "Valid Anagram",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/valid-anagram/",
    "gfg": "https://www.geeksforgeeks.org/problems/anagram-1587115620/1",
    "companies": [
      "Amazon",
      "Meta",
      "Uber"
    ],
    "slug": "valid-anagram"
  },
  {
    "id": 102,
    "sheetType": "sde",
    "category": "String Part-II",
    "name": "Count and Say",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/count-and-say/",
    "gfg": "https://www.geeksforgeeks.org/problems/decode-the-pattern1138/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "count-and-say"
  },
  {
    "id": 103,
    "sheetType": "sde",
    "category": "String Part-II",
    "name": "Compare Version Numbers",
    "difficulty": "Medium",
    "rating": "4.0 / 5",
    "leetcode": "https://leetcode.com/problems/compare-version-numbers/",
    "gfg": "https://www.geeksforgeeks.org/problems/compare-two-version-numbers/1",
    "companies": [
      "Apple",
      "Microsoft"
    ],
    "slug": "compare-version-numbers"
  },
  {
    "id": 104,
    "sheetType": "sde",
    "category": "Binary Tree",
    "name": "Inorder Traversal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/inorder-traversal/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "binary-tree-inorder-traversal"
  },
  {
    "id": 105,
    "sheetType": "sde",
    "category": "Binary Tree",
    "name": "Preorder Traversal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/preorder-traversal/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "binary-tree-preorder-traversal"
  },
  {
    "id": 106,
    "sheetType": "sde",
    "category": "Binary Tree",
    "name": "Postorder Traversal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/postorder-traversal/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "binary-tree-postorder-traversal"
  },
  {
    "id": 107,
    "sheetType": "sde",
    "category": "Binary Tree",
    "name": "Morris Inorder Traversal",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/inorder-traversal/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "binary-tree-inorder-traversal"
  },
  {
    "id": 108,
    "sheetType": "sde",
    "category": "Binary Tree",
    "name": "Morris Preorder Traversal",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/preorder-traversal/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "binary-tree-preorder-traversal"
  },
  {
    "id": 109,
    "sheetType": "sde",
    "category": "Binary Tree",
    "name": "Left View of Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/left-view-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "left-view-of-binary-tree"
  },
  {
    "id": 110,
    "sheetType": "sde",
    "category": "Binary Tree",
    "name": "Bottom View of Binary Tree",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Flipkart"
    ],
    "slug": "bottom-view-of-binary-tree"
  },
  {
    "id": 111,
    "sheetType": "sde",
    "category": "Binary Tree",
    "name": "Top View of Binary Tree",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/top-view-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "top-view-of-binary-tree"
  },
  {
    "id": 112,
    "sheetType": "sde",
    "category": "Binary Tree",
    "name": "Preorder Inorder Postorder in Single Traversal",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "TCS"
    ],
    "slug": "preorder-inorder-postorder-in-single-traversal"
  },
  {
    "id": 113,
    "sheetType": "sde",
    "category": "Binary Tree",
    "name": "Vertical Order Traversal",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/print-a-binary-tree-in-vertical-order/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "vertical-order-traversal-of-a-binary-tree"
  },
  {
    "id": 114,
    "sheetType": "sde",
    "category": "Binary Tree",
    "name": "Root to Node Path in Binary Tree",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-paths/",
    "gfg": "https://www.geeksforgeeks.org/problems/root-to-leaf-paths/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "binary-tree-paths"
  },
  {
    "id": 115,
    "sheetType": "sde",
    "category": "Binary Tree",
    "name": "Max Width of Binary Tree",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-width-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-width-of-tree/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "maximum-width-of-binary-tree"
  },
  {
    "id": 116,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "name": "Level Order Traversal",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/level-order-traversal/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "binary-tree-level-order-traversal"
  },
  {
    "id": 117,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "name": "Height of Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/height-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "maximum-depth-of-binary-tree"
  },
  {
    "id": 118,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "name": "Diameter of Binary Tree",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/diameter-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/diameter-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "diameter-of-binary-tree"
  },
  {
    "id": 119,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "name": "Check if Binary Tree is Height Balanced",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/balanced-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-for-balanced-tree/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "balanced-binary-tree"
  },
  {
    "id": 120,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "name": "Lowest Common Ancestor (LCA)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-binary-tree/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "lowest-common-ancestor-of-a-binary-tree"
  },
  {
    "id": 121,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "name": "Check if Two Trees are Identical",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/same-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/determine-if-two-trees-are-identical/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "same-tree"
  },
  {
    "id": 122,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "name": "Zig Zag Traversal",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/zigzag-tree-traversal/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "binary-tree-zigzag-level-order-traversal"
  },
  {
    "id": 123,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "name": "Boundary Traversal",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/boundary-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/boundary-traversal-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "boundary-of-binary-tree"
  },
  {
    "id": 124,
    "sheetType": "sde",
    "category": "Binary Tree Part-III",
    "name": "Maximum Path Sum",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-path-sum-from-any-node/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon"
    ],
    "slug": "binary-tree-maximum-path-sum"
  },
  {
    "id": 125,
    "sheetType": "sde",
    "category": "Binary Tree Part-III",
    "name": "Construct Tree from Preorder and Inorder",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/construct-tree-1/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "construct-binary-tree-from-preorder-and-inorder-traversal"
  },
  {
    "id": 126,
    "sheetType": "sde",
    "category": "Binary Tree Part-III",
    "name": "Construct Tree from Postorder and Inorder",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/build-a-tree-concept/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "construct-binary-tree-from-inorder-and-postorder-traversal"
  },
  {
    "id": 127,
    "sheetType": "sde",
    "category": "Binary Tree Part-III",
    "name": "Symmetric Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/symmetric-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/symmetric-tree/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "symmetric-tree"
  },
  {
    "id": 128,
    "sheetType": "sde",
    "category": "Binary Tree Part-III",
    "name": "Flatten Binary Tree to LinkedList",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/flatten-binary-tree-to-linked-list/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "flatten-binary-tree-to-linked-list"
  },
  {
    "id": 129,
    "sheetType": "sde",
    "category": "Binary Tree Part-III",
    "name": "Check for Children Sum Property",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/children-sum-parent/1",
    "companies": [
      "Amazon"
    ],
    "slug": "check-for-children-sum-property"
  },
  {
    "id": 130,
    "sheetType": "sde",
    "category": "Binary Tree Part-III",
    "name": "Invert a Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/invert-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/mirror-tree/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "invert-binary-tree"
  },
  {
    "id": 131,
    "sheetType": "sde",
    "category": "Binary Search Tree",
    "name": "Populating Next Right Pointers in Each Node",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/populating-next-right-pointers-in-each-node/",
    "gfg": "https://www.geeksforgeeks.org/problems/connect-nodes-at-same-level/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "populating-next-right-pointers-in-each-node"
  },
  {
    "id": 132,
    "sheetType": "sde",
    "category": "Binary Search Tree",
    "name": "Search in BST",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/search-in-a-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-a-node-in-bst/1",
    "companies": [
      "Amazon"
    ],
    "slug": "search-in-a-binary-search-tree"
  },
  {
    "id": 133,
    "sheetType": "sde",
    "category": "Binary Search Tree",
    "name": "Convert Sorted Array to BST",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/array-to-bst4443/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "convert-sorted-array-to-binary-search-tree"
  },
  {
    "id": 134,
    "sheetType": "sde",
    "category": "Binary Search Tree",
    "name": "Construct BST from Preorder Traversal",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/construct-bst-from-postorder/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "construct-binary-search-tree-from-preorder-traversal"
  },
  {
    "id": 135,
    "sheetType": "sde",
    "category": "Binary Search Tree",
    "name": "Validate BST",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/validate-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-for-bst/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "validate-binary-search-tree"
  },
  {
    "id": 136,
    "sheetType": "sde",
    "category": "Binary Search Tree",
    "name": "Lowest Common Ancestor in BST",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-bst/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "lowest-common-ancestor-of-a-binary-search-tree"
  },
  {
    "id": 137,
    "sheetType": "sde",
    "category": "Binary Search Tree",
    "name": "Inorder Predecessor and Successor in BST",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/inorder-successor-in-bst/",
    "gfg": "https://www.geeksforgeeks.org/problems/predecessor-and-successor/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "inorder-successor-in-bst"
  },
  {
    "id": 138,
    "sheetType": "sde",
    "category": "BST Part-II",
    "name": "Floor in BST",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/closest-binary-search-tree-value/",
    "gfg": "https://www.geeksforgeeks.org/problems/floor-in-bst/1",
    "companies": [
      "Amazon"
    ],
    "slug": "closest-binary-search-tree-value"
  },
  {
    "id": 139,
    "sheetType": "sde",
    "category": "BST Part-II",
    "name": "Ceil in BST",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/closest-binary-search-tree-value-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/ceil-in-bst/1",
    "companies": [
      "Amazon"
    ],
    "slug": "closest-binary-search-tree-value-ii"
  },
  {
    "id": 140,
    "sheetType": "sde",
    "category": "BST Part-II",
    "name": "Kth Smallest Element in BST",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-th-smallest-element-in-bst/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "kth-smallest-element-in-a-bst"
  },
  {
    "id": 141,
    "sheetType": "sde",
    "category": "BST Part-II",
    "name": "Kth Largest Element in BST",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/kth-largest-element-in-bst/1",
    "companies": [
      "Amazon"
    ],
    "slug": "kth-largest-element-in-an-array"
  },
  {
    "id": 142,
    "sheetType": "sde",
    "category": "BST Part-II",
    "name": "Two Sum IV - Input is a BST",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/two-sum-iv-input-is-a-bst/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-a-pair-with-given-target-in-bst/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "two-sum-iv-input-is-a-bst"
  },
  {
    "id": 143,
    "sheetType": "sde",
    "category": "BST Part-II",
    "name": "BST Iterator",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-search-tree-iterator/",
    "gfg": "https://www.geeksforgeeks.org/problems/binary-search-tree-iterator/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "binary-search-tree-iterator"
  },
  {
    "id": 144,
    "sheetType": "sde",
    "category": "BST Part-II",
    "name": "Size of Largest BST in Binary Tree",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-sum-bst-in-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/largest-bst/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "maximum-sum-bst-in-binary-tree"
  },
  {
    "id": 145,
    "sheetType": "sde",
    "category": "BST Part-II",
    "name": "Serialize and Deserialize Binary Tree",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/serialize-and-deserialize-a-binary-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon"
    ],
    "slug": "serialize-and-deserialize-binary-tree"
  },
  {
    "id": 146,
    "sheetType": "sde",
    "category": "Binary Trees [Misc]",
    "name": "Binary Tree to Double LinkedList",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/binary-tree-to-dll/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "binary-tree-to-double-linkedlist"
  },
  {
    "id": 147,
    "sheetType": "sde",
    "category": "Binary Trees [Misc]",
    "name": "Find Median in a Data Stream",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/find-median-from-data-stream/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-median-in-a-stream-1587115620/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "find-median-from-data-stream"
  },
  {
    "id": 148,
    "sheetType": "sde",
    "category": "Binary Trees [Misc]",
    "name": "Kth Largest Element in a Stream",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
    "gfg": "https://www.geeksforgeeks.org/problems/kth-largest-element-in-a-stream2220/1",
    "companies": [
      "Amazon"
    ],
    "slug": "kth-largest-element-in-a-stream"
  },
  {
    "id": 149,
    "sheetType": "sde",
    "category": "Binary Trees [Misc]",
    "name": "Kth Largest Element in Unsorted Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-largest-elements4206/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "kth-largest-element-in-an-array"
  },
  {
    "id": 150,
    "sheetType": "sde",
    "category": "Binary Trees [Misc]",
    "name": "Distinct Numbers in Window",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/count-distinct-elements-in-every-window/1",
    "companies": [
      "Amazon"
    ],
    "slug": "distinct-numbers-in-window"
  },
  {
    "id": 151,
    "sheetType": "sde",
    "category": "Binary Trees [Misc]",
    "name": "K Most Frequent Elements",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/top-k-frequent-elements/",
    "gfg": "https://www.geeksforgeeks.org/problems/top-k-frequent-elements-in-array/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "top-k-frequent-elements"
  },
  {
    "id": 152,
    "sheetType": "sde",
    "category": "Graph",
    "name": "Clone Graph",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/clone-graph/",
    "gfg": "https://www.geeksforgeeks.org/problems/clone-a-graph/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "clone-graph"
  },
  {
    "id": 153,
    "sheetType": "sde",
    "category": "Graph",
    "name": "DFS Traversal of Graph",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-provinces/",
    "gfg": "https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "number-of-provinces"
  },
  {
    "id": 154,
    "sheetType": "sde",
    "category": "Graph",
    "name": "BFS Traversal of Graph",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/graph-valid-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "graph-valid-tree"
  },
  {
    "id": 155,
    "sheetType": "sde",
    "category": "Graph",
    "name": "Detect Cycle in Undirected Graph using BFS",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/number-of-provinces/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "number-of-provinces"
  },
  {
    "id": 156,
    "sheetType": "sde",
    "category": "Graph",
    "name": "Detect Cycle in Undirected Graph using DFS",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/number-of-provinces/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "number-of-provinces"
  },
  {
    "id": 157,
    "sheetType": "sde",
    "category": "Graph",
    "name": "Detect Cycle in Directed Graph using DFS",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/course-schedule/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "course-schedule"
  },
  {
    "id": 158,
    "sheetType": "sde",
    "category": "Graph",
    "name": "Detect Cycle in Directed Graph using BFS (Kahn",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/course-schedule-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "course-schedule-ii"
  },
  {
    "id": 159,
    "sheetType": "sde",
    "category": "Graph",
    "name": "Topological Sort DFS",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/course-schedule-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/topological-sort/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "course-schedule-ii"
  },
  {
    "id": 160,
    "sheetType": "sde",
    "category": "Graph",
    "name": "Topological Sort BFS",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/course-schedule-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/topological-sort/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "course-schedule-ii"
  },
  {
    "id": 161,
    "sheetType": "sde",
    "category": "Graph",
    "name": "Number of Islands",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/number-of-islands/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-the-number-of-islands/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "slug": "number-of-islands"
  },
  {
    "id": 162,
    "sheetType": "sde",
    "category": "Graph",
    "name": "Bipartite Check BFS",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/is-graph-bipartite/",
    "gfg": "https://www.geeksforgeeks.org/problems/bipartite-graph/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "is-graph-bipartite"
  },
  {
    "id": 163,
    "sheetType": "sde",
    "category": "Graph",
    "name": "Bipartite Check DFS",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/is-graph-bipartite/",
    "gfg": "https://www.geeksforgeeks.org/problems/bipartite-graph/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "is-graph-bipartite"
  },
  {
    "id": 164,
    "sheetType": "sde",
    "category": "Graph Part-II",
    "name": "Strongly Connected Components (Kosaraju",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/critical-connections-in-a-network/",
    "gfg": "https://www.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "critical-connections-in-a-network"
  },
  {
    "id": 165,
    "sheetType": "sde",
    "category": "Graph Part-II",
    "name": "Dijkstra",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/network-delay-time/",
    "gfg": "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
    "companies": [
      "Google",
      "Amazon",
      "Uber"
    ],
    "slug": "network-delay-time"
  },
  {
    "id": 166,
    "sheetType": "sde",
    "category": "Graph Part-II",
    "name": "Bellman Ford Algorithm",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
    "gfg": "https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "cheapest-flights-within-k-stops"
  },
  {
    "id": 167,
    "sheetType": "sde",
    "category": "Graph Part-II",
    "name": "Floyd Warshall Algorithm",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/",
    "gfg": "https://www.geeksforgeeks.org/problems/floyd-warshall4005/1",
    "companies": [
      "Amazon"
    ],
    "slug": "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance"
  },
  {
    "id": 168,
    "sheetType": "sde",
    "category": "Graph Part-II",
    "name": "Prim",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/min-cost-to-connect-all-points/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "min-cost-to-connect-all-points"
  },
  {
    "id": 169,
    "sheetType": "sde",
    "category": "Graph Part-II",
    "name": "Kruskal",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/min-cost-to-connect-all-points/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "min-cost-to-connect-all-points"
  },
  {
    "id": 170,
    "sheetType": "sde",
    "category": "Dynamic Programming",
    "name": "Max Product Subarray",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/maximum-product-subarray/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-product-subarray3608/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "maximum-product-subarray"
  },
  {
    "id": 171,
    "sheetType": "sde",
    "category": "Dynamic Programming",
    "name": "Longest Increasing Subsequence (LIS)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-increasing-subsequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-increasing-subsequence-1587115620/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "slug": "longest-increasing-subsequence"
  },
  {
    "id": 172,
    "sheetType": "sde",
    "category": "Dynamic Programming",
    "name": "Longest Common Subsequence (LCS)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-common-subsequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-common-subsequence-1587115620/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "longest-common-subsequence"
  },
  {
    "id": 173,
    "sheetType": "sde",
    "category": "Dynamic Programming",
    "name": "0-1 Knapsack Problem",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/partition-equal-subset-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0917/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "partition-equal-subset-sum"
  },
  {
    "id": 174,
    "sheetType": "sde",
    "category": "Dynamic Programming",
    "name": "Edit Distance",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/edit-distance/",
    "gfg": "https://www.geeksforgeeks.org/problems/edit-distance3702/1",
    "companies": [
      "Google",
      "Amazon",
      "Meta"
    ],
    "slug": "edit-distance"
  },
  {
    "id": 175,
    "sheetType": "sde",
    "category": "Dynamic Programming",
    "name": "Maximum Sum Increasing Subsequence",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-ascending-subarray-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-sum-increasing-subsequence4749/1",
    "companies": [
      "Amazon"
    ],
    "slug": "maximum-ascending-subarray-sum"
  },
  {
    "id": 176,
    "sheetType": "sde",
    "category": "Dynamic Programming",
    "name": "Matrix Chain Multiplication (MCM)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/burst-balloons/",
    "gfg": "https://www.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "burst-balloons"
  },
  {
    "id": 177,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "name": "Minimum Path Sum in Matrix",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/minimum-path-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-cost-path3805/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "minimum-path-sum"
  },
  {
    "id": 178,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "name": "Coin Change Problem",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/coin-change/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-coins1824/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "coin-change"
  },
  {
    "id": 179,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "name": "Subset Sum Problem",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/partition-equal-subset-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sum-problem2014/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "partition-equal-subset-sum"
  },
  {
    "id": 180,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "name": "Rod Cutting Problem",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/integer-break/",
    "gfg": "https://www.geeksforgeeks.org/problems/rod-cutting0840/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "integer-break"
  },
  {
    "id": 181,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "name": "Egg Dropping Puzzle",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/super-egg-drop/",
    "gfg": "https://www.geeksforgeeks.org/problems/egg-dropping-puzzle-1587115620/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "super-egg-drop"
  },
  {
    "id": 182,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "name": "Word Break Problem",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/word-break/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-break1352/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "word-break"
  },
  {
    "id": 183,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "name": "Palindrome Partitioning II",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/palindrome-partitioning-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/palindromic-patitioning4845/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "palindrome-partitioning-ii"
  },
  {
    "id": 184,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "name": "Maximum Profit in Job Scheduling",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-profit-in-job-scheduling/",
    "gfg": "https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "maximum-profit-in-job-scheduling"
  },
  {
    "id": 185,
    "sheetType": "sde",
    "category": "Trie",
    "name": "Implement Trie (Prefix Tree)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/implement-trie-prefix-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/trie-insert-and-search0651/1",
    "companies": [
      "Google",
      "Amazon",
      "Meta"
    ],
    "slug": "implement-trie-prefix-tree"
  },
  {
    "id": 186,
    "sheetType": "sde",
    "category": "Trie",
    "name": "Implement Trie II",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/implement-trie-ii-prefix-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/trie-delete/1",
    "companies": [
      "Google",
      "Meta"
    ],
    "slug": "implement-trie-ii-prefix-tree"
  },
  {
    "id": 187,
    "sheetType": "sde",
    "category": "Trie",
    "name": "Longest String with All Prefixes",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/longest-word-in-dictionary/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-string-with-all-prefixes/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "longest-word-in-dictionary"
  },
  {
    "id": 188,
    "sheetType": "sde",
    "category": "Trie",
    "name": "Number of Distinct Substrings in String",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-distinct-substrings-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-number-of-substrings4528/1",
    "companies": [
      "Google",
      "Meta"
    ],
    "slug": "number-of-distinct-substrings-in-a-string"
  },
  {
    "id": 189,
    "sheetType": "sde",
    "category": "Trie",
    "name": "Power Set (All Subsequences)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/subsets/",
    "gfg": "https://www.geeksforgeeks.org/problems/power-set4302/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "subsets"
  },
  {
    "id": 190,
    "sheetType": "sde",
    "category": "Trie",
    "name": "Maximum XOR of Two Numbers in an Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-xor-of-two-numbers-in-an-array/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "maximum-xor-of-two-numbers-in-an-array"
  },
  {
    "id": 191,
    "sheetType": "sde",
    "category": "Trie",
    "name": "Maximum XOR With an Element From Array",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-xor-with-an-element-from-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-xor-with-an-element-from-array/1",
    "companies": [
      "Google",
      "Meta"
    ],
    "slug": "maximum-xor-with-an-element-from-array"
  }
];

export const STRIVER_79_SHEET_DATA: DSAProblem[] = [
  {
    "id": 1,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "name": "Two Sum",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/two-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/key-pair5610/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "two-sum"
  },
  {
    "id": 2,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "name": "Valid Anagram",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/valid-anagram/",
    "gfg": "https://www.geeksforgeeks.org/problems/anagram-1587115620/1",
    "companies": [
      "Amazon",
      "Uber"
    ],
    "slug": "valid-anagram"
  },
  {
    "id": 3,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "name": "Group Anagrams",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/group-anagrams/",
    "gfg": "https://www.geeksforgeeks.org/problems/print-anagrams-together/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "group-anagrams"
  },
  {
    "id": 4,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "name": "Top K Frequent Elements",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/top-k-frequent-elements/",
    "gfg": "https://www.geeksforgeeks.org/problems/top-k-frequent-elements-in-array/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "top-k-frequent-elements"
  },
  {
    "id": 5,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "name": "Product of Array Except Self",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/product-of-array-except-self/",
    "gfg": "https://www.geeksforgeeks.org/problems/a-difference-of-values-and-indexes0539/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "product-of-array-except-self"
  },
  {
    "id": 6,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "name": "Longest Consecutive Sequence",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-consecutive-sequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-consecutive-subsequence2421/1",
    "companies": [
      "Google",
      "Spotify"
    ],
    "slug": "longest-consecutive-sequence"
  },
  {
    "id": 7,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "name": "Sort Colors (Dutch National Flag)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/sort-colors/",
    "gfg": "https://www.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s4231/1",
    "companies": [
      "Amazon",
      "Flipkart"
    ],
    "slug": "sort-colors"
  },
  {
    "id": 8,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "name": "Best Time to Buy and Sell Stock",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "gfg": "https://www.geeksforgeeks.org/problems/stock-buy-and-sell2615/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "best-time-to-buy-and-sell-stock"
  },
  {
    "id": 9,
    "sheetType": "79",
    "category": "Binary Search",
    "name": "Binary Search",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-search/",
    "gfg": "https://www.geeksforgeeks.org/problems/binary-search-1587115620/1",
    "companies": [
      "Microsoft",
      "Amazon"
    ],
    "slug": "binary-search"
  },
  {
    "id": 10,
    "sheetType": "79",
    "category": "Binary Search",
    "name": "Search in Rotated Sorted Array",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-a-rotated-array4618/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "search-in-rotated-sorted-array"
  },
  {
    "id": 11,
    "sheetType": "79",
    "category": "Binary Search",
    "name": "Find Minimum in Rotated Sorted Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-element-in-a-sorted-and-rotated-array3626/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "find-minimum-in-rotated-sorted-array"
  },
  {
    "id": 12,
    "sheetType": "79",
    "category": "Binary Search",
    "name": "Koko Eating Bananas",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/koko-eating-bananas/",
    "gfg": "https://www.geeksforgeeks.org/problems/koko-eating-bananas/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "koko-eating-bananas"
  },
  {
    "id": 13,
    "sheetType": "79",
    "category": "Binary Search",
    "name": "Search a 2D Matrix",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-a-matrix-1587115621/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "search-a-2d-matrix"
  },
  {
    "id": 14,
    "sheetType": "79",
    "category": "Binary Search",
    "name": "Median of Two Sorted Arrays",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    "gfg": "https://www.geeksforgeeks.org/problems/median-of-2-sorted-arrays-of-different-sizes/1",
    "companies": [
      "Google",
      "Microsoft"
    ],
    "slug": "median-of-two-sorted-arrays"
  },
  {
    "id": 15,
    "sheetType": "79",
    "category": "Binary Search",
    "name": "Capacity to Ship Packages Within D Days",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
    "gfg": "https://www.geeksforgeeks.org/problems/capacity-to-ship-packages-within-d-days/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "capacity-to-ship-packages-within-d-days"
  },
  {
    "id": 16,
    "sheetType": "79",
    "category": "Binary Search",
    "name": "Aggressive Cows",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/magnetic-force-between-two-balls/",
    "gfg": "https://www.geeksforgeeks.org/problems/aggressive-cows/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "magnetic-force-between-two-balls"
  },
  {
    "id": 17,
    "sheetType": "79",
    "category": "Linked List",
    "name": "Reverse Linked List",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "reverse-linked-list"
  },
  {
    "id": 18,
    "sheetType": "79",
    "category": "Linked List",
    "name": "Merge Two Sorted Lists",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/merge-two-sorted-lists/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-two-sorted-linked-lists/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "merge-two-sorted-lists"
  },
  {
    "id": 19,
    "sheetType": "79",
    "category": "Linked List",
    "name": "Reorder List",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/reorder-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/reorder-list/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "reorder-list"
  },
  {
    "id": 20,
    "sheetType": "79",
    "category": "Linked List",
    "name": "Remove Nth Node From End of List",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/nth-node-from-end-of-linked-list/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "remove-nth-node-from-end-of-list"
  },
  {
    "id": 21,
    "sheetType": "79",
    "category": "Linked List",
    "name": "Detect Cycle in Linked List",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "linked-list-cycle"
  },
  {
    "id": 22,
    "sheetType": "79",
    "category": "Linked List",
    "name": "LRU Cache",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/lru-cache/",
    "gfg": "https://www.geeksforgeeks.org/problems/lru-cache/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "lru-cache"
  },
  {
    "id": 23,
    "sheetType": "79",
    "category": "Recursion and Backtracking",
    "name": "Subsets",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/subsets/",
    "gfg": "https://www.geeksforgeeks.org/problems/power-set4302/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "subsets"
  },
  {
    "id": 24,
    "sheetType": "79",
    "category": "Recursion and Backtracking",
    "name": "Combination Sum",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/combination-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/combination-sum-1587115620/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "combination-sum"
  },
  {
    "id": 25,
    "sheetType": "79",
    "category": "Recursion and Backtracking",
    "name": "Permutations",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/permutations/",
    "gfg": "https://www.geeksforgeeks.org/problems/permutations-of-a-given-string2041/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "permutations"
  },
  {
    "id": 26,
    "sheetType": "79",
    "category": "Recursion and Backtracking",
    "name": "N-Queens",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/n-queens/",
    "gfg": "https://www.geeksforgeeks.org/problems/n-queen-problem0315/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "n-queens"
  },
  {
    "id": 27,
    "sheetType": "79",
    "category": "Recursion and Backtracking",
    "name": "Word Search",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/word-search/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-search/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "word-search"
  },
  {
    "id": 28,
    "sheetType": "79",
    "category": "Recursion and Backtracking",
    "name": "Palindrome Partitioning",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/palindrome-partitioning/",
    "gfg": "https://www.geeksforgeeks.org/problems/palindrome-partitioning3622/1",
    "companies": [
      "Google",
      "Meta"
    ],
    "slug": "palindrome-partitioning"
  },
  {
    "id": 29,
    "sheetType": "79",
    "category": "Stacks/Queues",
    "name": "Valid Parentheses",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/valid-parentheses/",
    "gfg": "https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "valid-parentheses"
  },
  {
    "id": 30,
    "sheetType": "79",
    "category": "Stacks/Queues",
    "name": "Min Stack",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/min-stack/",
    "gfg": "https://www.geeksforgeeks.org/problems/get-minimum-element-from-stack/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "min-stack"
  },
  {
    "id": 31,
    "sheetType": "79",
    "category": "Stacks/Queues",
    "name": "Evaluate Reverse Polish Notation",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
    "gfg": "https://www.geeksforgeeks.org/problems/evaluation-of-postfix-expression1735/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "evaluate-reverse-polish-notation"
  },
  {
    "id": 32,
    "sheetType": "79",
    "category": "Stacks/Queues",
    "name": "Daily Temperatures",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/daily-temperatures/",
    "gfg": "https://www.geeksforgeeks.org/problems/next-larger-element-1587115620/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "daily-temperatures"
  },
  {
    "id": 33,
    "sheetType": "79",
    "category": "Stacks/Queues",
    "name": "Car Fleet",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/car-fleet/",
    "gfg": "https://www.geeksforgeeks.org/problems/car-fleet/1",
    "companies": [
      "Google"
    ],
    "slug": "car-fleet"
  },
  {
    "id": 34,
    "sheetType": "79",
    "category": "Stacks/Queues",
    "name": "Largest Rectangle in Histogram",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-rectangular-area-in-a-histogram-1587115620/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "largest-rectangle-in-histogram"
  },
  {
    "id": 35,
    "sheetType": "79",
    "category": "Heaps",
    "name": "Kth Largest Element in an Array",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-largest-elements4206/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "kth-largest-element-in-an-array"
  },
  {
    "id": 36,
    "sheetType": "79",
    "category": "Heaps",
    "name": "Task Scheduler",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/task-scheduler/",
    "gfg": "https://www.geeksforgeeks.org/problems/task-scheduler/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "task-scheduler"
  },
  {
    "id": 37,
    "sheetType": "79",
    "category": "Heaps",
    "name": "Find Median from Data Stream",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/find-median-from-data-stream/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-median-in-a-stream-1587115620/1",
    "companies": [
      "Google",
      "Amazon",
      "Meta"
    ],
    "slug": "find-median-from-data-stream"
  },
  {
    "id": 38,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "name": "Invert Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/invert-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/mirror-tree/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "invert-binary-tree"
  },
  {
    "id": 39,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "name": "Maximum Depth of Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/height-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "maximum-depth-of-binary-tree"
  },
  {
    "id": 40,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "name": "Diameter of Binary Tree",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/diameter-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/diameter-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "diameter-of-binary-tree"
  },
  {
    "id": 41,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "name": "Balanced Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/balanced-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-for-balanced-tree/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "balanced-binary-tree"
  },
  {
    "id": 42,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "name": "Same Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/same-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/determine-if-two-trees-are-identical/1",
    "companies": [
      "Amazon"
    ],
    "slug": "same-tree"
  },
  {
    "id": 43,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "name": "Subtree of Another Tree",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/subtree-of-another-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-if-subtree/1",
    "companies": [
      "Amazon"
    ],
    "slug": "subtree-of-another-tree"
  },
  {
    "id": 44,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "name": "Lowest Common Ancestor of BST",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-bst/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "lowest-common-ancestor-of-a-binary-search-tree"
  },
  {
    "id": 45,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "name": "Binary Tree Level Order Traversal",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/level-order-traversal/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "binary-tree-level-order-traversal"
  },
  {
    "id": 46,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "name": "Validate Binary Search Tree",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/validate-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-for-bst/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "validate-binary-search-tree"
  },
  {
    "id": 47,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "name": "Kth Smallest Element in BST",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-th-smallest-element-in-bst/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "kth-smallest-element-in-a-bst"
  },
  {
    "id": 48,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "name": "Binary Tree Maximum Path Sum",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-path-sum-from-any-node/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon"
    ],
    "slug": "binary-tree-maximum-path-sum"
  },
  {
    "id": 49,
    "sheetType": "79",
    "category": "Graphs",
    "name": "Number of Islands",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/number-of-islands/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-the-number-of-islands/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "number-of-islands"
  },
  {
    "id": 50,
    "sheetType": "79",
    "category": "Graphs",
    "name": "Clone Graph",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/clone-graph/",
    "gfg": "https://www.geeksforgeeks.org/problems/clone-a-graph/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "clone-graph"
  },
  {
    "id": 51,
    "sheetType": "79",
    "category": "Graphs",
    "name": "Max Area of Island",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/max-area-of-island/",
    "gfg": "https://www.geeksforgeeks.org/problems/max-area-of-island/1",
    "companies": [
      "Amazon"
    ],
    "slug": "max-area-of-island"
  },
  {
    "id": 52,
    "sheetType": "79",
    "category": "Graphs",
    "name": "Pacific Atlantic Water Flow",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    "gfg": "https://www.geeksforgeeks.org/problems/pacific-atlantic-water-flow/1",
    "companies": [
      "Google"
    ],
    "slug": "pacific-atlantic-water-flow"
  },
  {
    "id": 53,
    "sheetType": "79",
    "category": "Graphs",
    "name": "Surrounded Regions",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/surrounded-regions/",
    "gfg": "https://www.geeksforgeeks.org/problems/replace-o-with-x4256/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "surrounded-regions"
  },
  {
    "id": 54,
    "sheetType": "79",
    "category": "Graphs",
    "name": "Rotting Oranges",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/rotting-oranges/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotting-oranges2536/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "rotting-oranges"
  },
  {
    "id": 55,
    "sheetType": "79",
    "category": "Graphs",
    "name": "Course Schedule",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/course-schedule/",
    "gfg": "https://www.geeksforgeeks.org/problems/prerequisite-tasks/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "course-schedule"
  },
  {
    "id": 56,
    "sheetType": "79",
    "category": "Graphs",
    "name": "Course Schedule II",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/course-schedule-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/course-schedule/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "course-schedule-ii"
  },
  {
    "id": 57,
    "sheetType": "79",
    "category": "Graphs",
    "name": "Redundant Connection",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/redundant-connection/",
    "gfg": "https://www.geeksforgeeks.org/problems/redundant-connection/1",
    "companies": [
      "Google"
    ],
    "slug": "redundant-connection"
  },
  {
    "id": 58,
    "sheetType": "79",
    "category": "Graphs",
    "name": "Word Ladder",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/word-ladder/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-ladder/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "word-ladder"
  },
  {
    "id": 59,
    "sheetType": "79",
    "category": "Graphs",
    "name": "Network Delay Time",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/network-delay-time/",
    "gfg": "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "network-delay-time"
  },
  {
    "id": 60,
    "sheetType": "79",
    "category": "Graphs",
    "name": "Alien Dictionary",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/alien-dictionary/",
    "gfg": "https://www.geeksforgeeks.org/problems/alien-dictionary/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "alien-dictionary"
  },
  {
    "id": 61,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "name": "Climbing Stairs",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/climbing-stairs/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-ways-to-reach-the-nth-stair-1587115620/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "climbing-stairs"
  },
  {
    "id": 62,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "name": "House Robber",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/house-robber/",
    "gfg": "https://www.geeksforgeeks.org/problems/max-sum-without-adjacents2430/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "house-robber"
  },
  {
    "id": 63,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "name": "House Robber II",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/house-robber-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/house-robber-ii/1",
    "companies": [
      "Amazon"
    ],
    "slug": "house-robber-ii"
  },
  {
    "id": 64,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "name": "Longest Palindromic Substring",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-palindromic-substring/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-palindromic-substring0857/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "longest-palindromic-substring"
  },
  {
    "id": 65,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "name": "Palindromic Substrings",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/palindromic-substrings/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-palindromic-subsequences/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "palindromic-substrings"
  },
  {
    "id": 66,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "name": "Coin Change",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/coin-change/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-coins1824/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "coin-change"
  },
  {
    "id": 67,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "name": "Maximum Product Subarray",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/maximum-product-subarray/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-product-subarray3608/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "maximum-product-subarray"
  },
  {
    "id": 68,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "name": "Word Break",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/word-break/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-break1352/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "word-break"
  },
  {
    "id": 69,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "name": "Longest Increasing Subsequence",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-increasing-subsequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-increasing-subsequence-1587115620/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "longest-increasing-subsequence"
  },
  {
    "id": 70,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "name": "Partition Equal Subset Sum",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/partition-equal-subset-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sum-problem2014/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "partition-equal-subset-sum"
  },
  {
    "id": 71,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "name": "Edit Distance",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/edit-distance/",
    "gfg": "https://www.geeksforgeeks.org/problems/edit-distance3702/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "edit-distance"
  },
  {
    "id": 72,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "name": "Burst Balloons",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/burst-balloons/",
    "gfg": "https://www.geeksforgeeks.org/problems/burst-balloons/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "burst-balloons"
  },
  {
    "id": 73,
    "sheetType": "79",
    "category": "Tries",
    "name": "Implement Trie (Prefix Tree)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/implement-trie-prefix-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/trie-insert-and-search0651/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "implement-trie-prefix-tree"
  },
  {
    "id": 74,
    "sheetType": "79",
    "category": "Tries",
    "name": "Design Add and Search Words Data Structure",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
    "gfg": "https://www.geeksforgeeks.org/problems/trie-insert-and-search0651/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "design-add-and-search-words-data-structure"
  },
  {
    "id": 75,
    "sheetType": "79",
    "category": "Tries",
    "name": "Maximum XOR of Two Numbers in an Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-xor-of-two-numbers-in-an-array/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "maximum-xor-of-two-numbers-in-an-array"
  },
  {
    "id": 76,
    "sheetType": "79",
    "category": "String",
    "name": "Longest Substring Without Repeating Characters",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "gfg": "https://www.geeksforgeeks.org/problems/length-of-the-longest-substring3036/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "longest-substring-without-repeating-characters"
  },
  {
    "id": 77,
    "sheetType": "79",
    "category": "String",
    "name": "Longest Repeating Character Replacement",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/longest-repeating-character-replacement/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-repeating-character-replacement/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "longest-repeating-character-replacement"
  },
  {
    "id": 78,
    "sheetType": "79",
    "category": "String",
    "name": "Minimum Window Substring",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/minimum-window-substring/",
    "gfg": "https://www.geeksforgeeks.org/problems/smallest-window-in-a-string-containing-all-the-characters-of-another-string-1587115621/1",
    "companies": [
      "Meta",
      "Google"
    ],
    "slug": "minimum-window-substring"
  },
  {
    "id": 79,
    "sheetType": "79",
    "category": "String",
    "name": "Valid Palindrome",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/valid-palindrome/",
    "gfg": "https://www.geeksforgeeks.org/problems/string-palindrome4521/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "valid-palindrome"
  }
];
export const SDETUBE_79_SHEET_DATA: DSAProblem[] = STRIVER_79_SHEET_DATA;

export const A2Z_DSA_SHEET_473_DATA: DSAProblem[] = [
  {
    "id": 1,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "User Input / Output",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "",
    "companies": [
      "TCS",
      "Infosys"
    ],
    "slug": "user-input-output"
  },
  {
    "id": 2,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Data Types & Sizes",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/data-type-1666706141/1",
    "companies": [
      "Accenture"
    ],
    "slug": "data-types-sizes"
  },
  {
    "id": 3,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "If Else Decision Making",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/java-if-else-decision-making0924/1",
    "companies": [
      "Cognizant"
    ],
    "slug": "if-else-decision-making"
  },
  {
    "id": 4,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Switch Statement Syntax & Use",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/java-switch-case-statement3529/1",
    "companies": [
      "Wipro"
    ],
    "slug": "switch-statement-syntax-use"
  },
  {
    "id": 5,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "What are Arrays and Strings?",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "",
    "companies": [
      "TCS"
    ],
    "slug": "what-are-arrays-and-strings"
  },
  {
    "id": 6,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "For Loops Mechanics",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/nth-fibonacci-number1335/1",
    "companies": [
      "Infosys"
    ],
    "slug": "for-loops-mechanics"
  },
  {
    "id": 7,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "While Loops Mechanics",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/while-loop-printtable-java/1",
    "companies": [
      "Capgemini"
    ],
    "slug": "while-loops-mechanics"
  },
  {
    "id": 8,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Functions (Pass by Reference and Value)",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/pass-by-reference-and-value/1",
    "companies": [
      "HCL"
    ],
    "slug": "functions-pass-by-reference-and-value"
  },
  {
    "id": 9,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Time & Space Complexity Analysis Theory",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "time-space-complexity-analysis-theory"
  },
  {
    "id": 10,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 1: N x N Square Star Pattern",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/square-pattern/1",
    "companies": [
      "TCS"
    ],
    "slug": "pattern-1-n-x-n-square-star-pattern"
  },
  {
    "id": 11,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 2: Right-Angled Triangle Star",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/right-triangle/1",
    "companies": [
      "TCS"
    ],
    "slug": "pattern-2-right-angled-triangle-star"
  },
  {
    "id": 12,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 3: Right-Angled Number Triangle",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/number-triangle/1",
    "companies": [
      "Wipro"
    ],
    "slug": "pattern-3-right-angled-number-triangle"
  },
  {
    "id": 13,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 4: Right-Angled Repeated Number Triangle",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/triangle-number-1/1",
    "companies": [
      "Infosys"
    ],
    "slug": "pattern-4-right-angled-repeated-number-triangle"
  },
  {
    "id": 14,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 5: Inverted Right Pyramid Star",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/inverted-right-triangle/1",
    "companies": [
      "TCS"
    ],
    "slug": "pattern-5-inverted-right-pyramid-star"
  },
  {
    "id": 15,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 6: Inverted Number Pyramid",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/inverted-number-triangle/1",
    "companies": [
      "Cognizant"
    ],
    "slug": "pattern-6-inverted-number-pyramid"
  },
  {
    "id": 16,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 7: Centered Star Pyramid",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/star-pyramid/1",
    "companies": [
      "Accenture"
    ],
    "slug": "pattern-7-centered-star-pyramid"
  },
  {
    "id": 17,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 8: Inverted Centered Star Pyramid",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/inverted-star-pyramid/1",
    "companies": [
      "Capgemini"
    ],
    "slug": "pattern-8-inverted-centered-star-pyramid"
  },
  {
    "id": 18,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 9: Diamond Star Pattern",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/diamond-pattern/1",
    "companies": [
      "TCS"
    ],
    "slug": "pattern-9-diamond-star-pattern"
  },
  {
    "id": 19,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 10: Half Diamond Star Pattern",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/half-diamond-star/1",
    "companies": [
      "Wipro"
    ],
    "slug": "pattern-10-half-diamond-star-pattern"
  },
  {
    "id": 20,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 11: Binary Number Triangle Pattern",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/binary-triangle/1",
    "companies": [
      "Infosys"
    ],
    "slug": "pattern-11-binary-number-triangle-pattern"
  },
  {
    "id": 21,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 12: Number Crown Pattern",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/number-crown/1",
    "companies": [
      "Accenture"
    ],
    "slug": "pattern-12-number-crown-pattern"
  },
  {
    "id": 22,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 13: Increasing Number Triangle (Floyd",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/floyds-triangle/1",
    "companies": [
      "TCS"
    ],
    "slug": "pattern-13-increasing-number-triangle-floyd"
  },
  {
    "id": 23,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 14: Increasing Letter Triangle",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/letter-triangle/1",
    "companies": [
      "Cognizant"
    ],
    "slug": "pattern-14-increasing-letter-triangle"
  },
  {
    "id": 24,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 15: Reverse Letter Triangle",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-letter-triangle/1",
    "companies": [
      "Wipro"
    ],
    "slug": "pattern-15-reverse-letter-triangle"
  },
  {
    "id": 25,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 16: Alpha-Ramp Pattern",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/alpha-ramp/1",
    "companies": [
      "Infosys"
    ],
    "slug": "pattern-16-alpha-ramp-pattern"
  },
  {
    "id": 26,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 17: Alpha-Hill Pattern",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/alpha-hill/1",
    "companies": [
      "Amazon"
    ],
    "slug": "pattern-17-alpha-hill-pattern"
  },
  {
    "id": 27,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 18: Alpha-Triangle Pattern",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/alpha-triangle/1",
    "companies": [
      "TCS"
    ],
    "slug": "pattern-18-alpha-triangle-pattern"
  },
  {
    "id": 28,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 19: Symmetric Void Pattern",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/symmetric-void/1",
    "companies": [
      "Amazon"
    ],
    "slug": "pattern-19-symmetric-void-pattern"
  },
  {
    "id": 29,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 20: Symmetric Butterfly Pattern",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/butterfly-pattern/1",
    "companies": [
      "Microsoft"
    ],
    "slug": "pattern-20-symmetric-butterfly-pattern"
  },
  {
    "id": 30,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 21: Hollow Square Star Pattern",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/hollow-square/1",
    "companies": [
      "TCS"
    ],
    "slug": "pattern-21-hollow-square-star-pattern"
  },
  {
    "id": 31,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Pattern 22: Concentric Number Square Pattern",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/concentric-square/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "pattern-22-concentric-number-square-pattern"
  },
  {
    "id": 32,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "C++ STL Vectors, Maps, Sets & Iterators Overview",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "c-stl-vectors-maps-sets-iterators-overview"
  },
  {
    "id": 33,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Java Collections Framework Guide",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "",
    "companies": [
      "TCS",
      "Cognizant"
    ],
    "slug": "java-collections-framework-guide"
  },
  {
    "id": 34,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Count Digits in a Number",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/find-numbers-with-even-number-of-digits/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-digits5716/1",
    "companies": [
      "TCS",
      "Amazon"
    ],
    "slug": "find-numbers-with-even-number-of-digits"
  },
  {
    "id": 35,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Reverse Integer",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-integer/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-digit0817/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "reverse-integer"
  },
  {
    "id": 36,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Check Palindrome Number",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/palindrome-number/",
    "gfg": "https://www.geeksforgeeks.org/problems/palindrome0746/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "palindrome-number"
  },
  {
    "id": 37,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "GCD Or HCF (Euclidean Algorithm)",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-greatest-common-divisor-of-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/lcm-and-gcd4516/1",
    "companies": [
      "Goldman Sachs",
      "Amazon"
    ],
    "slug": "find-greatest-common-divisor-of-array"
  },
  {
    "id": 38,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Armstrong Numbers Check",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/armstrong-numbers2727/1",
    "companies": [
      "TCS",
      "Wipro"
    ],
    "slug": "armstrong-numbers-check"
  },
  {
    "id": 39,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Print All Divisors of a Number",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/all-divisors-of-a-number/1",
    "companies": [
      "Amazon"
    ],
    "slug": "print-all-divisors-of-a-number"
  },
  {
    "id": 40,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Check for Prime Number",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/prime-number2314/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "check-for-prime-number"
  },
  {
    "id": 41,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Understand Recursion by Printing N Times",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/print-1-to-n-without-using-loops-1587115620/1",
    "companies": [
      "TCS"
    ],
    "slug": "understand-recursion-by-printing-n-times"
  },
  {
    "id": 42,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Print Name N Times Using Recursion",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Infosys"
    ],
    "slug": "print-name-n-times-using-recursion"
  },
  {
    "id": 43,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Print 1 to N Using Recursion",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/print-1-to-n-without-using-loops-1587115620/1",
    "companies": [
      "Accenture"
    ],
    "slug": "print-1-to-n-using-recursion"
  },
  {
    "id": 44,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Print N to 1 Using Recursion",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/print-n-to-1-without-loop/1",
    "companies": [
      "Cognizant"
    ],
    "slug": "print-n-to-1-using-recursion"
  },
  {
    "id": 45,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Sum of First N Numbers (Recursive)",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/sum-of-first-n-terms5818/1",
    "companies": [
      "TCS"
    ],
    "slug": "sum-of-first-n-numbers-recursive"
  },
  {
    "id": 46,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Factorial of N Numbers (Recursive)",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/find-all-factorial-numbers-less-than-or-equal-to-n3548/1",
    "companies": [
      "Amazon"
    ],
    "slug": "factorial-of-n-numbers-recursive"
  },
  {
    "id": 47,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Reverse an Array (Recursive & Iterative)",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-an-array/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "reverse-string"
  },
  {
    "id": 48,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Check if String is Palindrome (Recursive)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/valid-palindrome/",
    "gfg": "https://www.geeksforgeeks.org/problems/string-palindrome4521/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "valid-palindrome"
  },
  {
    "id": 49,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Fibonacci Number",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/fibonacci-number/",
    "gfg": "https://www.geeksforgeeks.org/problems/nth-fibonacci-number1335/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "fibonacci-number"
  },
  {
    "id": 50,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Hashing Theory & Division Method",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon"
    ],
    "slug": "hashing-theory-division-method"
  },
  {
    "id": 51,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Counting Frequencies of Array Elements",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/frequency-of-the-most-frequent-element/",
    "gfg": "https://www.geeksforgeeks.org/problems/frequency-of-array-elements-1587115620/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "frequency-of-the-most-frequent-element"
  },
  {
    "id": 52,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Find Highest and Lowest Frequency Element",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/top-k-frequent-elements-in-array/1",
    "companies": [
      "Amazon"
    ],
    "slug": "find-highest-and-lowest-frequency-element"
  },
  {
    "id": 53,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Character Hashing Concepts",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Wipro"
    ],
    "slug": "character-hashing-concepts"
  },
  {
    "id": 54,
    "sheetType": "a2z",
    "category": "Step 1: Learn the Basics",
    "name": "Collisions in Hashing & Chaining Concept",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Microsoft"
    ],
    "slug": "collisions-in-hashing-chaining-concept"
  },
  {
    "id": 55,
    "sheetType": "a2z",
    "category": "Step 2: Sorting Techniques",
    "name": "Selection Sort Algorithm",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/selection-sort/1",
    "companies": [
      "Wipro",
      "TCS"
    ],
    "slug": "selection-sort-algorithm"
  },
  {
    "id": 56,
    "sheetType": "a2z",
    "category": "Step 2: Sorting Techniques",
    "name": "Bubble Sort Algorithm",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/bubble-sort/1",
    "companies": [
      "Infosys",
      "Cognizant"
    ],
    "slug": "bubble-sort-algorithm"
  },
  {
    "id": 57,
    "sheetType": "a2z",
    "category": "Step 2: Sorting Techniques",
    "name": "Insertion Sort Algorithm",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/insertion-sort/1",
    "companies": [
      "Amazon"
    ],
    "slug": "insertion-sort-algorithm"
  },
  {
    "id": 58,
    "sheetType": "a2z",
    "category": "Step 2: Sorting Techniques",
    "name": "Merge Sort Algorithm",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/sort-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-sort/1",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "slug": "sort-an-array"
  },
  {
    "id": 59,
    "sheetType": "a2z",
    "category": "Step 2: Sorting Techniques",
    "name": "Quick Sort Algorithm",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/sort-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/quick-sort/1",
    "companies": [
      "Amazon",
      "Meta",
      "Goldman Sachs"
    ],
    "slug": "sort-an-array"
  },
  {
    "id": 60,
    "sheetType": "a2z",
    "category": "Step 2: Sorting Techniques",
    "name": "Recursive Bubble Sort",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/bubble-sort/1",
    "companies": [
      "Accenture"
    ],
    "slug": "recursive-bubble-sort"
  },
  {
    "id": 61,
    "sheetType": "a2z",
    "category": "Step 2: Sorting Techniques",
    "name": "Recursive Insertion Sort",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/insertion-sort/1",
    "companies": [
      "Capgemini"
    ],
    "slug": "recursive-insertion-sort"
  },
  {
    "id": 62,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Largest Element in an Array",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/largest-element-in-array2855/1",
    "companies": [
      "TCS",
      "Amazon"
    ],
    "slug": "largest-element-in-an-array"
  },
  {
    "id": 63,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Second Largest Element in Array Without Sorting",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/second-largest3735/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "second-largest-element-in-array-without-sorting"
  },
  {
    "id": 64,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Check if Array is Sorted and Rotated",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-if-an-array-is-sorted0701/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "check-if-array-is-sorted-and-rotated"
  },
  {
    "id": 65,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Remove Duplicates from Sorted Array",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/remove-duplicate-elements-from-sorted-array/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "slug": "remove-duplicates-from-sorted-array"
  },
  {
    "id": 66,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Left Rotate Array by One Place",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/cyclically-rotate-an-array-by-one2614/1",
    "companies": [
      "Amazon"
    ],
    "slug": "left-rotate-array-by-one-place"
  },
  {
    "id": 67,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Left Rotate Array by K Places",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/rotate-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotate-array-by-n-elements-1587115621/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Paytm"
    ],
    "slug": "rotate-array"
  },
  {
    "id": 68,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Move Zeros to End",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/move-zeroes/",
    "gfg": "https://www.geeksforgeeks.org/problems/move-all-zeroes-to-end-of-array0751/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "move-zeroes"
  },
  {
    "id": 69,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Linear Search in Array",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/search-an-element-in-an-array-1587115621/1",
    "companies": [
      "TCS"
    ],
    "slug": "linear-search-in-array"
  },
  {
    "id": 70,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Find Union of Two Sorted Arrays",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/union-of-two-sorted-arrays-1587115621/1",
    "companies": [
      "Amazon",
      "Flipkart"
    ],
    "slug": "find-union-of-two-sorted-arrays"
  },
  {
    "id": 71,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Find Intersection of Two Sorted Arrays",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/intersection-of-two-arrays/",
    "gfg": "https://www.geeksforgeeks.org/problems/intersection-of-two-arrays2404/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "intersection-of-two-arrays"
  },
  {
    "id": 72,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Find Missing Number in Array",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/missing-number/",
    "gfg": "https://www.geeksforgeeks.org/problems/missing-number-in-array1416/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "missing-number"
  },
  {
    "id": 73,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Max Consecutive Ones",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/max-consecutive-ones/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-consecutive-ones/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "max-consecutive-ones"
  },
  {
    "id": 74,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Find Element Appearing Once, Others Twice",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/single-number/",
    "gfg": "https://www.geeksforgeeks.org/problems/element-appearing-once2552/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "single-number"
  },
  {
    "id": 75,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Longest Subarray with Sum K (Positives)",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-sub-array-with-sum-k0809/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "longest-subarray-with-sum-k-positives"
  },
  {
    "id": 76,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "2 Sum Problem",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/two-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/key-pair5610/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google",
      "Microsoft"
    ],
    "slug": "two-sum"
  },
  {
    "id": 77,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Sort Array of 0s, 1s and 2s (Dutch Flag)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/sort-colors/",
    "gfg": "https://www.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s4231/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Paytm"
    ],
    "slug": "sort-colors"
  },
  {
    "id": 78,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Majority Element (> N/2 times)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/majority-element/",
    "gfg": "https://www.geeksforgeeks.org/problems/majority-element-1587115620/1",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "slug": "majority-element"
  },
  {
    "id": 79,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Kadane",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/maximum-subarray/",
    "gfg": "https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Walmart"
    ],
    "slug": "maximum-subarray"
  },
  {
    "id": 80,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Print Subarray with Maximum Subarray Sum",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/max-sum-in-sub-arrays0822/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "print-subarray-with-maximum-subarray-sum"
  },
  {
    "id": 81,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Stock Buy and Sell",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "gfg": "https://www.geeksforgeeks.org/problems/stock-buy-and-sell2615/1",
    "companies": [
      "Amazon",
      "Meta",
      "Oracle"
    ],
    "slug": "best-time-to-buy-and-sell-stock"
  },
  {
    "id": 82,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Rearrange Array Elements by Sign",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/rearrange-array-elements-by-sign/",
    "gfg": "https://www.geeksforgeeks.org/problems/rearrange-array-alternatively-1587115620/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "rearrange-array-elements-by-sign"
  },
  {
    "id": 83,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Next Permutation",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/next-permutation/",
    "gfg": "https://www.geeksforgeeks.org/problems/next-permutation5226/1",
    "companies": [
      "Meta",
      "Amazon",
      "Adobe"
    ],
    "slug": "next-permutation"
  },
  {
    "id": 84,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Leaders in an Array",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/leaders-in-an-array-1587115620/1",
    "companies": [
      "Amazon",
      "Paytm"
    ],
    "slug": "leaders-in-an-array"
  },
  {
    "id": 85,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Longest Consecutive Sequence in Array",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-consecutive-sequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-consecutive-subsequence2421/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "longest-consecutive-sequence"
  },
  {
    "id": 86,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Set Matrix Zeroes",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/set-matrix-zeroes/",
    "gfg": "https://www.geeksforgeeks.org/problems/set-matrix-zeroes/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "slug": "set-matrix-zeroes"
  },
  {
    "id": 87,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Rotate Matrix / Image by 90 Degrees",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/rotate-image/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotate-by-90-degree-1587115621/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "rotate-image"
  },
  {
    "id": 88,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Spiral Traversal of Matrix",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/spiral-matrix/",
    "gfg": "https://www.geeksforgeeks.org/problems/spirally-traversing-a-matrix-1587115621/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google"
    ],
    "slug": "spiral-matrix"
  },
  {
    "id": 89,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Count Subarrays with Given Sum K",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/subarray-sum-equals-k/",
    "gfg": "https://www.geeksforgeeks.org/problems/subarrays-with-sum-k/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "subarray-sum-equals-k"
  },
  {
    "id": 90,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Pascal",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/pascals-triangle/",
    "gfg": "https://www.geeksforgeeks.org/problems/pascal-triangle0652/1",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "slug": "pascals-triangle"
  },
  {
    "id": 91,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Majority Element II (> N/3 times)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/majority-element-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/majority-vote/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "majority-element-ii"
  },
  {
    "id": 92,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "3 Sum Problem",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/3sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-triplets-with-zero-sum/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "3sum"
  },
  {
    "id": 93,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "4 Sum Problem",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/4sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-all-four-sum-numbers1732/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "4sum"
  },
  {
    "id": 94,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Largest Subarray with 0 Sum",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/largest-subarray-with-0-sum/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "largest-subarray-with-0-sum"
  },
  {
    "id": 95,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Count Subarrays with Given XOR K",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/count-subarray-with-given-xor/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "count-subarrays-with-given-xor-k"
  },
  {
    "id": 96,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Merge Overlapping Subintervals",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/merge-intervals/",
    "gfg": "https://www.geeksforgeeks.org/problems/overlapping-intervals--170643/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon"
    ],
    "slug": "merge-intervals"
  },
  {
    "id": 97,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Merge Two Sorted Arrays Without Extra Space",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/merge-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-two-sorted-arrays-1587115620/1",
    "companies": [
      "Goldman Sachs",
      "Amdocs"
    ],
    "slug": "merge-sorted-array"
  },
  {
    "id": 98,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Find Repeating and Missing Number",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/find-missing-and-repeating2512/1",
    "companies": [
      "Amazon",
      "Goldman Sachs"
    ],
    "slug": "find-repeating-and-missing-number"
  },
  {
    "id": 99,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Count Inversions in Array",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1",
    "companies": [
      "Amazon",
      "Flipkart"
    ],
    "slug": "count-inversions-in-array"
  },
  {
    "id": 100,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Reverse Pairs",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-pairs/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-reverse-pairs/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "reverse-pairs"
  },
  {
    "id": 101,
    "sheetType": "a2z",
    "category": "Step 3: Arrays [Easy->Medium->Hard]",
    "name": "Maximum Product Subarray",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/maximum-product-subarray/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-product-subarray3608/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "maximum-product-subarray"
  },
  {
    "id": 102,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Binary Search to Find X in Sorted Array",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-search/",
    "gfg": "https://www.geeksforgeeks.org/problems/binary-search-1587115620/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "binary-search"
  },
  {
    "id": 103,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Implement Lower Bound",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/floor-in-a-sorted-array-1587115620/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "implement-lower-bound"
  },
  {
    "id": 104,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Implement Upper Bound",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/ceil-in-a-sorted-array/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "implement-upper-bound"
  },
  {
    "id": 105,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Search Insert Position",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/search-insert-position/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-insert-position-of-k-in-a-sorted-array/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "search-insert-position"
  },
  {
    "id": 106,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Floor and Ceil in Sorted Array",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/floor-in-a-sorted-array-1587115620/1",
    "companies": [
      "Amazon"
    ],
    "slug": "floor-and-ceil-in-sorted-array"
  },
  {
    "id": 107,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "First and Last Position of Element in Sorted Array",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/first-and-last-occurrences-of-x3116/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "find-first-and-last-position-of-element-in-sorted-array"
  },
  {
    "id": 108,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Count Occurrences of a Number in Sorted Array",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-occurrence2259/1",
    "companies": [
      "Amazon"
    ],
    "slug": "count-occurrences-of-a-number-in-sorted-array"
  },
  {
    "id": 109,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Search in Rotated Sorted Array I",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-a-rotated-array4618/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "search-in-rotated-sorted-array"
  },
  {
    "id": 110,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Search in Rotated Sorted Array II (With Duplicates)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-a-rotated-array0925/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "search-in-rotated-sorted-array-ii"
  },
  {
    "id": 111,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Find Minimum in Rotated Sorted Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-element-in-a-sorted-and-rotated-array3626/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "find-minimum-in-rotated-sorted-array"
  },
  {
    "id": 112,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Find How Many Times Array Has Been Rotated",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/rotation4708/1",
    "companies": [
      "Amazon"
    ],
    "slug": "find-how-many-times-array-has-been-rotated"
  },
  {
    "id": 113,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Single Element in a Sorted Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/single-element-in-a-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-the-element-that-appears-once-in-sorted-array0624/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "single-element-in-a-sorted-array"
  },
  {
    "id": 114,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Find Peak Element in 1D Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/find-peak-element/",
    "gfg": "https://www.geeksforgeeks.org/problems/peak-element/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "find-peak-element"
  },
  {
    "id": 115,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Square Root of an Integer (BS on Search Space)",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/sqrtx/",
    "gfg": "https://www.geeksforgeeks.org/problems/square-root/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "sqrtx"
  },
  {
    "id": 116,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Find N-th Root of an Integer",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/find-nth-root-of-m5843/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "find-n-th-root-of-an-integer"
  },
  {
    "id": 117,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Koko Eating Bananas",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/koko-eating-bananas/",
    "gfg": "https://www.geeksforgeeks.org/problems/koko-eating-bananas/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "koko-eating-bananas"
  },
  {
    "id": 118,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Minimum Days to Make M Bouquets",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-days-to-make-m-bouquets/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "minimum-number-of-days-to-make-m-bouquets"
  },
  {
    "id": 119,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Find Smallest Divisor Given a Threshold",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/",
    "gfg": "https://www.geeksforgeeks.org/problems/smallest-divisor/1",
    "companies": [
      "Amazon"
    ],
    "slug": "find-the-smallest-divisor-given-a-threshold"
  },
  {
    "id": 120,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Capacity to Ship Packages Within D Days",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
    "gfg": "https://www.geeksforgeeks.org/problems/capacity-to-ship-packages-within-d-days/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "capacity-to-ship-packages-within-d-days"
  },
  {
    "id": 121,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Kth Missing Positive Number",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/kth-missing-positive-number/",
    "gfg": "https://www.geeksforgeeks.org/problems/kth-missing-positive-number-in-a-sorted-array/1",
    "companies": [
      "Amazon"
    ],
    "slug": "kth-missing-positive-number"
  },
  {
    "id": 122,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Aggressive Cows (BS on Search Space)",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/aggressive-cows/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "aggressive-cows-bs-on-search-space"
  },
  {
    "id": 123,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Book Allocation Problem / Allocate Minimum Pages",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1",
    "companies": [
      "Google",
      "Amazon",
      "Flipkart"
    ],
    "slug": "book-allocation-problem-allocate-minimum-pages"
  },
  {
    "id": 124,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Split Array - Largest Sum",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/split-array-largest-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/split-array-largest-sum--141631/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "split-array-largest-sum"
  },
  {
    "id": 125,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Painter",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/the-painters-partition-problem1420/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "painter"
  },
  {
    "id": 126,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Minimize Max Distance to Gas Station",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/minimize-max-distance-to-gas-station/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "minimize-max-distance-to-gas-station"
  },
  {
    "id": 127,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Median of 2 Sorted Arrays",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    "gfg": "https://www.geeksforgeeks.org/problems/median-of-2-sorted-arrays-of-different-sizes/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft"
    ],
    "slug": "median-of-two-sorted-arrays"
  },
  {
    "id": 128,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Kth Element of Two Sorted Arrays",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array1317/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "kth-element-of-two-sorted-arrays"
  },
  {
    "id": 129,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Find Row with Maximum Number of 1s",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/row-with-max-1s0023/1",
    "companies": [
      "Amazon"
    ],
    "slug": "find-row-with-maximum-number-of-1s"
  },
  {
    "id": 130,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Search in a 2D Matrix I",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-a-matrix-1587115621/1",
    "companies": [
      "Amazon",
      "Meta",
      "Microsoft"
    ],
    "slug": "search-a-2d-matrix"
  },
  {
    "id": 131,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Search in a 2D Matrix II",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-a-matrix-1587115621/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "search-a-2d-matrix-ii"
  },
  {
    "id": 132,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Find Peak Element in a 2D Matrix",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-a-peak-element-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-a-peak-element-ii/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "find-a-peak-element-ii"
  },
  {
    "id": 133,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "name": "Matrix Median (BS on Matrix)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/matrix-median0732/1",
    "companies": [
      "Amazon",
      "Flipkart"
    ],
    "slug": "matrix-median-bs-on-matrix"
  },
  {
    "id": 134,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Remove Outermost Parentheses",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/remove-outermost-parentheses/",
    "gfg": "https://www.geeksforgeeks.org/problems/remove-outermost-parentheses/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "remove-outermost-parentheses"
  },
  {
    "id": 135,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Reverse Words in a String",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-words-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-words-in-a-given-string3547/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "reverse-words-in-a-string"
  },
  {
    "id": 136,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Largest Odd Number in String",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "https://leetcode.com/problems/largest-odd-number-in-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/largest-odd-number-in-string/1",
    "companies": [
      "Amazon"
    ],
    "slug": "largest-odd-number-in-string"
  },
  {
    "id": 137,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Longest Common Prefix",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/longest-common-prefix/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-common-prefix-in-an-array5129/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "longest-common-prefix"
  },
  {
    "id": 138,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Isomorphic Strings Check",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/isomorphic-strings/",
    "gfg": "https://www.geeksforgeeks.org/problems/isomorphic-strings-1587115620/1",
    "companies": [
      "Google",
      "LinkedIn"
    ],
    "slug": "isomorphic-strings"
  },
  {
    "id": 139,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Check if One String is Rotation of Another",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/rotate-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-if-strings-are-rotations-of-each-other-or-not-1587115620/1",
    "companies": [
      "Amazon"
    ],
    "slug": "rotate-string"
  },
  {
    "id": 140,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Valid Anagram Check",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/valid-anagram/",
    "gfg": "https://www.geeksforgeeks.org/problems/anagram-1587115620/1",
    "companies": [
      "Amazon",
      "Meta",
      "Uber"
    ],
    "slug": "valid-anagram"
  },
  {
    "id": 141,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Maximum Nesting Depth of Parentheses",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-nesting-depth-of-the-parentheses/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-nesting-depth-of-the-parentheses/1",
    "companies": [
      "Meta"
    ],
    "slug": "maximum-nesting-depth-of-the-parentheses"
  },
  {
    "id": 142,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Sort Characters By Frequency",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/sort-characters-by-frequency/",
    "gfg": "https://www.geeksforgeeks.org/problems/sort-a-string/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "sort-characters-by-frequency"
  },
  {
    "id": 143,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Roman to Integer",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/roman-to-integer/",
    "gfg": "https://www.geeksforgeeks.org/problems/roman-number-to-integer3201/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "roman-to-integer"
  },
  {
    "id": 144,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Integer to Roman",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/integer-to-roman/",
    "gfg": "https://www.geeksforgeeks.org/problems/convert-to-roman-no/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "integer-to-roman"
  },
  {
    "id": 145,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Implement Atoi (String to Integer)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/string-to-integer-atoi/",
    "gfg": "https://www.geeksforgeeks.org/problems/implement-atoi/1",
    "companies": [
      "Meta",
      "Amazon",
      "Microsoft"
    ],
    "slug": "string-to-integer-atoi"
  },
  {
    "id": 146,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Count Number of Substrings with K Distinct Chars",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/count-number-of-substrings4528/1",
    "companies": [
      "Amazon"
    ],
    "slug": "count-number-of-substrings-with-k-distinct-chars"
  },
  {
    "id": 147,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Longest Palindromic Substring",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-palindromic-substring/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-palindromic-substring0857/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "longest-palindromic-substring"
  },
  {
    "id": 148,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "name": "Sum of Beauty of All Substrings",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/sum-of-beauty-of-all-substrings/",
    "gfg": "https://www.geeksforgeeks.org/problems/sum-of-beauty-of-all-substrings/1",
    "companies": [
      "Amazon"
    ],
    "slug": "sum-of-beauty-of-all-substrings"
  },
  {
    "id": 149,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Inserting a Node in Single LinkedList",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/linked-list-insertion-1587115620/1",
    "companies": [
      "Amazon"
    ],
    "slug": "inserting-a-node-in-single-linkedlist"
  },
  {
    "id": 150,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Deleting a Node in Single LinkedList",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/delete-node-in-a-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/delete-without-head-pointer/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "delete-node-in-a-linked-list"
  },
  {
    "id": 151,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Length of Linked List",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/count-nodes-of-linked-list/1",
    "companies": [
      "TCS"
    ],
    "slug": "length-of-linked-list"
  },
  {
    "id": 152,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Search an Element in Linked List",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-linked-list-1664434726/1",
    "companies": [
      "Wipro"
    ],
    "slug": "search-an-element-in-linked-list"
  },
  {
    "id": 153,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Insert Node in Doubly LinkedList",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/insert-a-node-in-doubly-linked-list/1",
    "companies": [
      "Amazon"
    ],
    "slug": "insert-node-in-doubly-linkedlist"
  },
  {
    "id": 154,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Delete Node in Doubly LinkedList",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/delete-node-in-doubly-linked-list/1",
    "companies": [
      "Amazon"
    ],
    "slug": "delete-node-in-doubly-linkedlist"
  },
  {
    "id": 155,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Reverse a Doubly LinkedList",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-a-doubly-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "reverse-a-doubly-linkedlist"
  },
  {
    "id": 156,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Find Middle Node of Linked List",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/middle-of-the-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/finding-middle-element-in-a-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "middle-of-the-linked-list"
  },
  {
    "id": 157,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Reverse a Single Linked List (Iterative & Recursive)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "slug": "reverse-linked-list"
  },
  {
    "id": 158,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Detect Cycle / Loop in Linked List",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "slug": "linked-list-cycle"
  },
  {
    "id": 159,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Find Starting Point of Loop in LL",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-first-node-of-loop-in-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "slug": "linked-list-cycle-ii"
  },
  {
    "id": 160,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Length of Loop in Linked List",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/find-length-of-loop/1",
    "companies": [
      "Amazon"
    ],
    "slug": "length-of-loop-in-linked-list"
  },
  {
    "id": 161,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Check if Linked List is Palindrome",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/palindrome-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-if-linked-list-is-pallindrome/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "palindrome-linked-list"
  },
  {
    "id": 162,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Segregate Odd and Even Nodes in LL",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/odd-even-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/rearrange-a-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "odd-even-linked-list"
  },
  {
    "id": 163,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Remove Nth Node From End of LL",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/nth-node-from-end-of-linked-list/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "remove-nth-node-from-end-of-list"
  },
  {
    "id": 164,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Delete Middle Node of Linked List",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/delete-middle-of-linked-list/1",
    "companies": [
      "Amazon"
    ],
    "slug": "delete-the-middle-node-of-a-linked-list"
  },
  {
    "id": 165,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Intersection Point of Y-Shaped Linked List",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
    "gfg": "https://www.geeksforgeeks.org/problems/intersection-point-in-y-shapped-linked-lists/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Visa"
    ],
    "slug": "intersection-of-two-linked-lists"
  },
  {
    "id": 166,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Add 1 to a Number Represented as Linked List",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/add-1-to-a-number-represented-as-linked-list/1",
    "companies": [
      "Amazon"
    ],
    "slug": "add-1-to-a-number-represented-as-linked-list"
  },
  {
    "id": 167,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Add Two Numbers Represented by Linked Lists",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/add-two-numbers/",
    "gfg": "https://www.geeksforgeeks.org/problems/add-two-numbers-represented-by-linked-lists/1",
    "companies": [
      "Amazon",
      "Meta",
      "Microsoft"
    ],
    "slug": "add-two-numbers"
  },
  {
    "id": 168,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Delete All Occurrences of Key in Doubly LL",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/delete-all-occurrences-of-a-given-key-in-a-doubly-linked-list/1",
    "companies": [
      "Amazon"
    ],
    "slug": "delete-all-occurrences-of-key-in-doubly-ll"
  },
  {
    "id": 169,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Find Pairs with Given Sum in Sorted DLL",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/find-pairs-with-given-sum-in-doubly-linked-list/1",
    "companies": [
      "Amazon"
    ],
    "slug": "find-pairs-with-given-sum-in-sorted-dll"
  },
  {
    "id": 170,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Merge Two Sorted Linked Lists",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/merge-two-sorted-lists/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-two-sorted-linked-lists/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "slug": "merge-two-sorted-lists"
  },
  {
    "id": 171,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Sort Linked List 0s 1s 2s",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/given-a-linked-list-of-0s-1s-and-2s-sort-it/1",
    "companies": [
      "Amazon"
    ],
    "slug": "sort-linked-list-0s-1s-2s"
  },
  {
    "id": 172,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Remove Duplicates from Sorted Doubly LL",
    "difficulty": "Hard",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/remove-duplicates-from-a-sorted-doubly-linked-list/1",
    "companies": [
      "Amazon"
    ],
    "slug": "remove-duplicates-from-sorted-doubly-ll"
  },
  {
    "id": 173,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Reverse Nodes in K-Group",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-a-linked-list-in-groups-of-given-size/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "reverse-nodes-in-k-group"
  },
  {
    "id": 174,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Rotate a Linked List",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/rotate-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotate-a-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "rotate-list"
  },
  {
    "id": 175,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Flattening of a Linked List",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/flattening-a-linked-list/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "flatten-a-multilevel-doubly-linked-list"
  },
  {
    "id": 176,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Clone Linked List with Random and Next Pointer",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/copy-list-with-random-pointer/",
    "gfg": "https://www.geeksforgeeks.org/problems/clone-a-linked-list-with-next-and-random-pointer/1",
    "companies": [
      "Amazon",
      "Meta",
      "Microsoft"
    ],
    "slug": "copy-list-with-random-pointer"
  },
  {
    "id": 177,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Sort Linked List using Merge Sort",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/sort-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/sort-a-linked-list/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "sort-list"
  },
  {
    "id": 178,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "Split Linked List in Parts",
    "difficulty": "Hard",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/split-linked-list-in-parts/",
    "gfg": "https://www.geeksforgeeks.org/problems/split-a-circular-linked-list-into-two-halves/1",
    "companies": [
      "Amazon"
    ],
    "slug": "split-linked-list-in-parts"
  },
  {
    "id": 179,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "name": "LRU Cache Linked List & Hash Map Design",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/lru-cache/",
    "gfg": "https://www.geeksforgeeks.org/problems/lru-cache/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "slug": "lru-cache"
  },
  {
    "id": 180,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Recursive Implementation of Pow(x, n)",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/powx-n/",
    "gfg": "https://www.geeksforgeeks.org/problems/power-of-numbers-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon"
    ],
    "slug": "powx-n"
  },
  {
    "id": 181,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Count Good Numbers",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/count-good-numbers/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-good-numbers/1",
    "companies": [
      "Amazon"
    ],
    "slug": "count-good-numbers"
  },
  {
    "id": 182,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Sort a Stack Using Recursion",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/sort-a-stack/1",
    "companies": [
      "Amazon",
      "Goldman Sachs"
    ],
    "slug": "sort-a-stack-using-recursion"
  },
  {
    "id": 183,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Reverse a Stack Using Recursion",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-a-stack/1",
    "companies": [
      "Amazon"
    ],
    "slug": "reverse-a-stack-using-recursion"
  },
  {
    "id": 184,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Generate All Binary Strings Without Consecutive 1s",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/generate-all-binary-strings/1",
    "companies": [
      "Amazon"
    ],
    "slug": "generate-all-binary-strings-without-consecutive-1s"
  },
  {
    "id": 185,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Generate Parentheses",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/generate-parentheses/",
    "gfg": "https://www.geeksforgeeks.org/problems/generate-all-balanced-parentheses/1",
    "companies": [
      "Meta",
      "Google",
      "Amazon"
    ],
    "slug": "generate-parentheses"
  },
  {
    "id": 186,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Power Set (Print all Subsequences)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/subsets/",
    "gfg": "https://www.geeksforgeeks.org/problems/power-set4302/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "subsets"
  },
  {
    "id": 187,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Combination Sum I",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/combination-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/combination-sum-1587115620/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "combination-sum"
  },
  {
    "id": 188,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Combination Sum II",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/combination-sum-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/combination-sum-ii-1664263832/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "combination-sum-ii"
  },
  {
    "id": 189,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Subset Sums I",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sums1516/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "subset-sums-i"
  },
  {
    "id": 190,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Subset Sums II (Unique Subsets)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/subsets-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sum-ii/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "subsets-ii"
  },
  {
    "id": 191,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Combination Sum III",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/combination-sum-iii/",
    "gfg": "https://www.geeksforgeeks.org/problems/combination-sum-iii/1",
    "companies": [
      "Amazon"
    ],
    "slug": "combination-sum-iii"
  },
  {
    "id": 192,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Print All Subsequences with Sum K",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/subsets-with-sum-k/1",
    "companies": [
      "Amazon"
    ],
    "slug": "print-all-subsequences-with-sum-k"
  },
  {
    "id": 193,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Count All Subsequences with Sum K",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/perfect-sum-problem5633/1",
    "companies": [
      "Amazon"
    ],
    "slug": "count-all-subsequences-with-sum-k"
  },
  {
    "id": 194,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Check if there Exists Subsequence with Sum K",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sum-problem2014/1",
    "companies": [
      "Amazon"
    ],
    "slug": "check-if-there-exists-subsequence-with-sum-k"
  },
  {
    "id": 195,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Better String (More Distinct Subsequences)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/better-string/1",
    "companies": [
      "Amazon"
    ],
    "slug": "better-string-more-distinct-subsequences"
  },
  {
    "id": 196,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Print All Permutations of String/Array",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/permutations/",
    "gfg": "https://www.geeksforgeeks.org/problems/permutations-of-a-given-string2041/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "permutations"
  },
  {
    "id": 197,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Letter Combinations of a Phone Number",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
    "gfg": "https://www.geeksforgeeks.org/problems/possible-words-from-phone-digits-1587115620/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "letter-combinations-of-a-phone-number"
  },
  {
    "id": 198,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Palindrome Partitioning",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/palindrome-partitioning/",
    "gfg": "https://www.geeksforgeeks.org/problems/palindrome-partitioning3622/1",
    "companies": [
      "Google",
      "Amazon",
      "Meta"
    ],
    "slug": "palindrome-partitioning"
  },
  {
    "id": 199,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Word Search in Grid",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/word-search/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-search/1",
    "companies": [
      "Amazon",
      "Meta",
      "Microsoft"
    ],
    "slug": "word-search"
  },
  {
    "id": 200,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "N Queens Problem",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/n-queens/",
    "gfg": "https://www.geeksforgeeks.org/problems/n-queen-problem0315/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "n-queens"
  },
  {
    "id": 201,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Sudoku Solver",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/sudoku-solver/",
    "gfg": "https://www.geeksforgeeks.org/problems/solve-the-sudoku-1587115621/1",
    "companies": [
      "Google",
      "Uber",
      "Amazon"
    ],
    "slug": "sudoku-solver"
  },
  {
    "id": 202,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "M Coloring Problem",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "m-coloring-problem"
  },
  {
    "id": 203,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Rat in a Maze Problem",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem--1587115621/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "rat-in-a-maze-problem"
  },
  {
    "id": 204,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "name": "Word Break II (Print All Ways)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/word-break-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-break-part-23201/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon"
    ],
    "slug": "word-break-ii"
  },
  {
    "id": 205,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Check if i-th Bit is Set or Not",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/check-whether-k-th-bit-is-set-or-not-1587115620/1",
    "companies": [
      "Microsoft"
    ],
    "slug": "check-if-i-th-bit-is-set-or-not"
  },
  {
    "id": 206,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Check if Number is Power of 2",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/power-of-two/",
    "gfg": "https://www.geeksforgeeks.org/problems/power-of-2-1587115620/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "power-of-two"
  },
  {
    "id": 207,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Count Set Bits in an Integer",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-1-bits/",
    "gfg": "https://www.geeksforgeeks.org/problems/set-bits0143/1",
    "companies": [
      "Amazon"
    ],
    "slug": "number-of-1-bits"
  },
  {
    "id": 208,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Set/Unset Rightmost Unset Bit",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/set-the-rightmost-unset-bit4436/1",
    "companies": [
      "Amazon"
    ],
    "slug": "set-unset-rightmost-unset-bit"
  },
  {
    "id": 209,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Swap Two Numbers Without Third Variable",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/swap-two-numbers3844/1",
    "companies": [
      "TCS",
      "Wipro"
    ],
    "slug": "swap-two-numbers-without-third-variable"
  },
  {
    "id": 210,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Divide Two Integers Without Operator",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/divide-two-integers/",
    "gfg": "https://www.geeksforgeeks.org/problems/division-without-using-multiplication-division-and-mod-operator/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "divide-two-integers"
  },
  {
    "id": 211,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Minimum Bit Flips to Convert Number",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-bit-flips-to-convert-number/",
    "gfg": "https://www.geeksforgeeks.org/problems/bit-difference-1587115620/1",
    "companies": [
      "Amazon"
    ],
    "slug": "minimum-bit-flips-to-convert-number"
  },
  {
    "id": 212,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Single Number I (Find Non-Repeating)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/single-number/",
    "gfg": "https://www.geeksforgeeks.org/problems/element-appearing-once2552/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "single-number"
  },
  {
    "id": 213,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Single Number II (Every element appears 3 times)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/single-number-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-element-occuring-once-when-all-other-appear-thrice/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "single-number-ii"
  },
  {
    "id": 214,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Single Number III (Two Numbers Appearing Odd Times)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/single-number-iii/",
    "gfg": "https://www.geeksforgeeks.org/problems/two-numbers-with-odd-occurrences5846/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "single-number-iii"
  },
  {
    "id": 215,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Find XOR of Numbers in Range L to R",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/find-xor-of-numbers-from-l-to-r/1",
    "companies": [
      "Amazon"
    ],
    "slug": "find-xor-of-numbers-in-range-l-to-r"
  },
  {
    "id": 216,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Two Numbers with Odd Occurrences",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/two-numbers-with-odd-occurrences5846/1",
    "companies": [
      "Amazon"
    ],
    "slug": "two-numbers-with-odd-occurrences"
  },
  {
    "id": 217,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Power Set Using Bit Manipulation",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/subsets/",
    "gfg": "https://www.geeksforgeeks.org/problems/power-set4302/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "subsets"
  },
  {
    "id": 218,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Subsets XOR Sum Total",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/sum-of-all-subset-xor-totals/",
    "gfg": "https://www.geeksforgeeks.org/problems/sum-of-all-subset-xor-totals/1",
    "companies": [
      "Meta"
    ],
    "slug": "sum-of-all-subset-xor-totals"
  },
  {
    "id": 219,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Bitwise AND of Numbers Range",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/bitwise-and-of-numbers-range/",
    "gfg": "https://www.geeksforgeeks.org/problems/bitwise-and-of-numbers-range/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "bitwise-and-of-numbers-range"
  },
  {
    "id": 220,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Counting Bits 0 to N",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/counting-bits/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-total-set-bits-1587115620/1",
    "companies": [
      "Amazon"
    ],
    "slug": "counting-bits"
  },
  {
    "id": 221,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Reverse Bits of 32-bit Integer",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-bits/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-bits3556/1",
    "companies": [
      "Apple"
    ],
    "slug": "reverse-bits"
  },
  {
    "id": 222,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "name": "Gray Code Sequence Generation",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/gray-code/",
    "gfg": "https://www.geeksforgeeks.org/problems/gray-code-1611210854/1",
    "companies": [
      "Amazon"
    ],
    "slug": "gray-code"
  },
  {
    "id": 223,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Implement Stack using Arrays",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/implement-stack-using-array/1",
    "companies": [
      "TCS",
      "Amazon"
    ],
    "slug": "implement-stack-using-arrays"
  },
  {
    "id": 224,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Implement Queue using Arrays",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/implement-queue-using-array/1",
    "companies": [
      "TCS",
      "Amazon"
    ],
    "slug": "implement-queue-using-arrays"
  },
  {
    "id": 225,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Implement Stack using Queues",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/implement-stack-using-queues/",
    "gfg": "https://www.geeksforgeeks.org/problems/stack-using-two-queues/1",
    "companies": [
      "Amazon"
    ],
    "slug": "implement-stack-using-queues"
  },
  {
    "id": 226,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Implement Queue using Stacks",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/implement-queue-using-stacks/",
    "gfg": "https://www.geeksforgeeks.org/problems/queue-using-two-stacks/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "implement-queue-using-stacks"
  },
  {
    "id": 227,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Implement Min Stack",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/min-stack/",
    "gfg": "https://www.geeksforgeeks.org/problems/get-minimum-element-from-stack/1",
    "companies": [
      "Amazon",
      "Meta",
      "Microsoft"
    ],
    "slug": "min-stack"
  },
  {
    "id": 228,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Check for Balanced Parentheses",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/valid-parentheses/",
    "gfg": "https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "valid-parentheses"
  },
  {
    "id": 229,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Infix to Postfix Conversion",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/infix-to-postfix-1587115620/1",
    "companies": [
      "Amazon"
    ],
    "slug": "infix-to-postfix-conversion"
  },
  {
    "id": 230,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Prefix to Infix Conversion",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/prefix-to-infix-conversion/1",
    "companies": [
      "Amazon"
    ],
    "slug": "prefix-to-infix-conversion"
  },
  {
    "id": 231,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Prefix to Postfix Conversion",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/prefix-to-postfix-conversion/1",
    "companies": [
      "Amazon"
    ],
    "slug": "prefix-to-postfix-conversion"
  },
  {
    "id": 232,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Postfix to Prefix Conversion",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/postfix-to-prefix-conversion/1",
    "companies": [
      "Amazon"
    ],
    "slug": "postfix-to-prefix-conversion"
  },
  {
    "id": 233,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Postfix to Infix Conversion",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/postfix-to-infix-conversion/1",
    "companies": [
      "Amazon"
    ],
    "slug": "postfix-to-infix-conversion"
  },
  {
    "id": 234,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Infix to Prefix Conversion",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/infix-to-prefix-conversion/1",
    "companies": [
      "Amazon"
    ],
    "slug": "infix-to-prefix-conversion"
  },
  {
    "id": 235,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Evaluate Postfix Expression",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
    "gfg": "https://www.geeksforgeeks.org/problems/evaluation-of-postfix-expression1735/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "evaluate-reverse-polish-notation"
  },
  {
    "id": 236,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Next Greater Element I",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/next-greater-element-i/",
    "gfg": "https://www.geeksforgeeks.org/problems/next-larger-element-1587115620/1",
    "companies": [
      "Amazon",
      "Meta",
      "Flipkart"
    ],
    "slug": "next-greater-element-i"
  },
  {
    "id": 237,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Next Greater Element II (Circular Array)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/next-greater-element-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/next-greater-element/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "next-greater-element-ii"
  },
  {
    "id": 238,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Next Smaller Element",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/help-classmates--141631/1",
    "companies": [
      "Amazon"
    ],
    "slug": "next-smaller-element"
  },
  {
    "id": 239,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Asteroid Collision",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/asteroid-collision/",
    "gfg": "https://www.geeksforgeeks.org/problems/asteroid-collision/1",
    "companies": [
      "Amazon",
      "Uber"
    ],
    "slug": "asteroid-collision"
  },
  {
    "id": 240,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Sum of Subarray Minimums",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/sum-of-subarray-minimums/",
    "gfg": "https://www.geeksforgeeks.org/problems/sum-of-subarray-minimum/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "sum-of-subarray-minimums"
  },
  {
    "id": 241,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Sum of Subarray Ranges",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/sum-of-subarray-ranges/",
    "gfg": "https://www.geeksforgeeks.org/problems/sum-of-subarray-ranges/1",
    "companies": [
      "Amazon"
    ],
    "slug": "sum-of-subarray-ranges"
  },
  {
    "id": 242,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Remove K Digits",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/remove-k-digits/",
    "gfg": "https://www.geeksforgeeks.org/problems/remove-k-digits/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "remove-k-digits"
  },
  {
    "id": 243,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Online Stock Span",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/online-stock-span/",
    "gfg": "https://www.geeksforgeeks.org/problems/stock-span-problem-1587115621/1",
    "companies": [
      "Amazon",
      "Flipkart"
    ],
    "slug": "online-stock-span"
  },
  {
    "id": 244,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Trapping Rain Water",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/trapping-rain-water/",
    "gfg": "https://www.geeksforgeeks.org/problems/trapping-rain-water-1587115621/1",
    "companies": [
      "Google",
      "Amazon",
      "Meta"
    ],
    "slug": "trapping-rain-water"
  },
  {
    "id": 245,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Largest Rectangle in Histogram",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-rectangular-area-in-a-histogram-1587115620/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "largest-rectangle-in-histogram"
  },
  {
    "id": 246,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Maximal Rectangle (Matrix Histogram)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximal-rectangle/",
    "gfg": "https://www.geeksforgeeks.org/problems/max-rectangle/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "maximal-rectangle"
  },
  {
    "id": 247,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Sliding Window Maximum",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-of-all-subarrays-of-size-k5901/1",
    "companies": [
      "Google",
      "Amazon",
      "Uber"
    ],
    "slug": "sliding-window-maximum"
  },
  {
    "id": 248,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "LRU Cache Implementation",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/lru-cache/",
    "gfg": "https://www.geeksforgeeks.org/problems/lru-cache/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "slug": "lru-cache"
  },
  {
    "id": 249,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "LFU Cache Implementation",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/lfu-cache/",
    "gfg": "https://www.geeksforgeeks.org/problems/lfu-cache/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "lfu-cache"
  },
  {
    "id": 250,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "The Celebrity Problem",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/the-celebrity-problem/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "the-celebrity-problem"
  },
  {
    "id": 251,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Conversions, Monotonic, Implementation]",
    "name": "Rotten Oranges (BFS Queue)",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/rotting-oranges/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotting-oranges2536/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "rotting-oranges"
  },
  {
    "id": 252,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "name": "Longest Substring Without Repeating Characters",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "gfg": "https://www.geeksforgeeks.org/problems/length-of-the-longest-substring3036/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "longest-substring-without-repeating-characters"
  },
  {
    "id": 253,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "name": "Max Consecutive Ones III",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/max-consecutive-ones-iii/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximize-number-of-1s0905/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "max-consecutive-ones-iii"
  },
  {
    "id": 254,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "name": "Fruit Into Baskets",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/fruit-into-baskets/",
    "gfg": "https://www.geeksforgeeks.org/problems/fruit-into-baskets-1663137637/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "fruit-into-baskets"
  },
  {
    "id": 255,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "name": "Longest Repeating Character Replacement",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/longest-repeating-character-replacement/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-repeating-character-replacement/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "longest-repeating-character-replacement"
  },
  {
    "id": 256,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "name": "Binary Subarrays With Sum",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-subarrays-with-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/binary-subarrays-with-sum/1",
    "companies": [
      "Amazon"
    ],
    "slug": "binary-subarrays-with-sum"
  },
  {
    "id": 257,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "name": "Count Number of Nice Subarrays",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/count-number-of-nice-subarrays/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-number-of-nice-subarrays/1",
    "companies": [
      "Amazon"
    ],
    "slug": "count-number-of-nice-subarrays"
  },
  {
    "id": 258,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "name": "Number of Substrings Containing All Three Characters",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-substrings-containing-all-three-characters/1",
    "companies": [
      "Amazon"
    ],
    "slug": "number-of-substrings-containing-all-three-characters"
  },
  {
    "id": 259,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "name": "Maximum Points You Can Obtain from Cards",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-point-you-can-obtain-from-cards/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "maximum-points-you-can-obtain-from-cards"
  },
  {
    "id": 260,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "name": "Subarrays with K Different Integers",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/subarrays-with-k-different-integers/",
    "gfg": "https://www.geeksforgeeks.org/problems/subarrays-with-k-different-integers/1",
    "companies": [
      "Amazon"
    ],
    "slug": "subarrays-with-k-different-integers"
  },
  {
    "id": 261,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "name": "Minimum Window Substring",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/minimum-window-substring/",
    "gfg": "https://www.geeksforgeeks.org/problems/smallest-window-in-a-string-containing-all-the-characters-of-another-string-1587115621/1",
    "companies": [
      "Meta",
      "Amazon",
      "Google"
    ],
    "slug": "minimum-window-substring"
  },
  {
    "id": 262,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "name": "Longest Substring with At Most K Distinct Characters",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-k-unique-characters-substring0853/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "longest-substring-with-at-most-k-distinct-characters"
  },
  {
    "id": 263,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "name": "Minimum Window Subsequence",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-window-subsequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-window-subsequence/1",
    "companies": [
      "Google"
    ],
    "slug": "minimum-window-subsequence"
  },
  {
    "id": 264,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Check if Array Represents Min Heap",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/does-array-represent-heap4345/1",
    "companies": [
      "Amazon"
    ],
    "slug": "check-if-array-represents-min-heap"
  },
  {
    "id": 265,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Convert Min Heap to Max Heap",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/convert-min-heap-to-max-heap-1666385718/1",
    "companies": [
      "Amazon"
    ],
    "slug": "convert-min-heap-to-max-heap"
  },
  {
    "id": 266,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Kth Largest Element in an Array",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-largest-elements4206/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "kth-largest-element-in-an-array"
  },
  {
    "id": 267,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Kth Smallest Element in an Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/kth-smallest-element5615/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "kth-smallest-element-in-an-array"
  },
  {
    "id": 268,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Merge K Sorted Arrays",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "slug": "merge-k-sorted-arrays"
  },
  {
    "id": 269,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Merge K Sorted Lists",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/merge-k-sorted-lists/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-k-sorted-linked-lists/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "merge-k-sorted-lists"
  },
  {
    "id": 270,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Replace Elements by Its Rank in Array",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/rank-transform-of-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/replace-elements-by-its-rank-in-the-array/1",
    "companies": [
      "Amazon"
    ],
    "slug": "rank-transform-of-an-array"
  },
  {
    "id": 271,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "K Closest Points to Origin",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/k-closest-points-to-origin/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-closest-elements3619/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "k-closest-points-to-origin"
  },
  {
    "id": 272,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Kth Largest Element in a Stream",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
    "gfg": "https://www.geeksforgeeks.org/problems/kth-largest-element-in-a-stream2220/1",
    "companies": [
      "Amazon"
    ],
    "slug": "kth-largest-element-in-a-stream"
  },
  {
    "id": 273,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Maximum Sum Combination",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-sum-combination/1",
    "companies": [
      "Amazon",
      "Flipkart"
    ],
    "slug": "maximum-sum-combination"
  },
  {
    "id": 274,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Design Twitter / Timeline Feed",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/design-twitter/",
    "gfg": "https://www.geeksforgeeks.org/problems/design-twitter/1",
    "companies": [
      "Twitter",
      "Amazon"
    ],
    "slug": "design-twitter"
  },
  {
    "id": 275,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Reorganize String No Two Adjacent Same",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/reorganize-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/rearrange-characters2001/1",
    "companies": [
      "Amazon"
    ],
    "slug": "reorganize-string"
  },
  {
    "id": 276,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Minimum Cost to Connect Ropes",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1",
    "companies": [
      "Amazon"
    ],
    "slug": "minimum-cost-to-connect-ropes"
  },
  {
    "id": 277,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Task Scheduler",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/task-scheduler/",
    "gfg": "https://www.geeksforgeeks.org/problems/task-scheduler/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "task-scheduler"
  },
  {
    "id": 278,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Hands of Straights",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/hand-of-straights/",
    "gfg": "https://www.geeksforgeeks.org/problems/hands-of-straights/1",
    "companies": [
      "Google"
    ],
    "slug": "hand-of-straights"
  },
  {
    "id": 279,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Find Median from Data Stream",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/find-median-from-data-stream/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-median-in-a-stream-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon"
    ],
    "slug": "find-median-from-data-stream"
  },
  {
    "id": 280,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "name": "Top K Frequent Elements",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/top-k-frequent-elements/",
    "gfg": "https://www.geeksforgeeks.org/problems/top-k-frequent-elements-in-array/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "top-k-frequent-elements"
  },
  {
    "id": 281,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "Assign Cookies",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "https://leetcode.com/problems/assign-cookies/",
    "gfg": "https://www.geeksforgeeks.org/problems/assign-cookies/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "assign-cookies"
  },
  {
    "id": 282,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "Fractional Knapsack Problem",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "fractional-knapsack-problem"
  },
  {
    "id": 283,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "Find Minimum Coins / Greedy Coin Change",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-coins1824/1",
    "companies": [
      "Amazon",
      "Paytm"
    ],
    "slug": "find-minimum-coins-greedy-coin-change"
  },
  {
    "id": 284,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "Lemonade Change",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/lemonade-change/",
    "gfg": "https://www.geeksforgeeks.org/problems/lemonade-change/1",
    "companies": [
      "Amazon"
    ],
    "slug": "lemonade-change"
  },
  {
    "id": 285,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "Valid Parenthesis String Check",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/valid-parenthesis-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/valid-string/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "valid-parenthesis-string"
  },
  {
    "id": 286,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "N Meetings in One Room",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "n-meetings-in-one-room"
  },
  {
    "id": 287,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "Non-Overlapping Intervals",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/non-overlapping-intervals/",
    "gfg": "https://www.geeksforgeeks.org/problems/non-overlapping-intervals/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "non-overlapping-intervals"
  },
  {
    "id": 288,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "Minimum Platforms Required for Railway Station",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1",
    "companies": [
      "Amazon",
      "Google",
      "Paytm"
    ],
    "slug": "minimum-platforms-required-for-railway-station"
  },
  {
    "id": 289,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "Job Sequencing Problem",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "job-sequencing-problem"
  },
  {
    "id": 290,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "Jump Game I",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/jump-game/",
    "gfg": "https://www.geeksforgeeks.org/problems/jump-game/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "jump-game"
  },
  {
    "id": 291,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "Jump Game II",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/jump-game-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-number-of-jumps-1587115620/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "jump-game-ii"
  },
  {
    "id": 292,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "Page Faults in LRU Memory",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/page-faults-in-lru5603/1",
    "companies": [
      "Amazon"
    ],
    "slug": "page-faults-in-lru-memory"
  },
  {
    "id": 293,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "Shortest Job First (SJF) CPU Scheduling",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/shortest-job-first/1",
    "companies": [
      "Amazon"
    ],
    "slug": "shortest-job-first-sjf-cpu-scheduling"
  },
  {
    "id": 294,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "Candy Distribution Problem",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/candy/",
    "gfg": "https://www.geeksforgeeks.org/problems/candy/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "candy"
  },
  {
    "id": 295,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "name": "Insert Interval",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/insert-interval/",
    "gfg": "https://www.geeksforgeeks.org/problems/insert-interval/1",
    "companies": [
      "Google",
      "Meta"
    ],
    "slug": "insert-interval"
  },
  {
    "id": 296,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Binary Tree Inorder Traversal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/inorder-traversal/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "binary-tree-inorder-traversal"
  },
  {
    "id": 297,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Binary Tree Preorder Traversal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/preorder-traversal/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "binary-tree-preorder-traversal"
  },
  {
    "id": 298,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Binary Tree Postorder Traversal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/postorder-traversal/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "binary-tree-postorder-traversal"
  },
  {
    "id": 299,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Level Order Traversal of Binary Tree",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/level-order-traversal/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "binary-tree-level-order-traversal"
  },
  {
    "id": 300,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Maximum Depth / Height of Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/height-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "maximum-depth-of-binary-tree"
  },
  {
    "id": 301,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Check if Binary Tree is Height-Balanced",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/balanced-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-for-balanced-tree/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "balanced-binary-tree"
  },
  {
    "id": 302,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Diameter of Binary Tree",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/diameter-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/diameter-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "diameter-of-binary-tree"
  },
  {
    "id": 303,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Binary Tree Maximum Path Sum",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-path-sum-from-any-node/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon"
    ],
    "slug": "binary-tree-maximum-path-sum"
  },
  {
    "id": 304,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Check if Two Trees are Identical / Same Tree",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/same-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/determine-if-two-trees-are-identical/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "same-tree"
  },
  {
    "id": 305,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Zig Zag Level Order Traversal",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/zigzag-tree-traversal/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "binary-tree-zigzag-level-order-traversal"
  },
  {
    "id": 306,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Boundary Traversal of Binary Tree",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/boundary-traversal-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "boundary-traversal-of-binary-tree"
  },
  {
    "id": 307,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Vertical Order Traversal of Binary Tree",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/print-a-binary-tree-in-vertical-order/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "vertical-order-traversal-of-a-binary-tree"
  },
  {
    "id": 308,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Top View of Binary Tree",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/top-view-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Oyo"
    ],
    "slug": "top-view-of-binary-tree"
  },
  {
    "id": 309,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Bottom View of Binary Tree",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Flipkart"
    ],
    "slug": "bottom-view-of-binary-tree"
  },
  {
    "id": 310,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Right View / Left View of Binary Tree",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-right-side-view/",
    "gfg": "https://www.geeksforgeeks.org/problems/right-view-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "binary-tree-right-side-view"
  },
  {
    "id": 311,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Symmetric Tree Check",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/symmetric-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/symmetric-tree/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "symmetric-tree"
  },
  {
    "id": 312,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Lowest Common Ancestor (LCA) in Binary Tree",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-binary-tree/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "lowest-common-ancestor-of-a-binary-tree"
  },
  {
    "id": 313,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Maximum Width of Binary Tree",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-width-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-width-of-tree/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "maximum-width-of-binary-tree"
  },
  {
    "id": 314,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "All Nodes Distance K in Binary Tree",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/nodes-at-given-distance-in-binary-tree/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "all-nodes-distance-k-in-binary-tree"
  },
  {
    "id": 315,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Root to Node Path in Binary Tree",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/root-to-leaf-paths/1",
    "companies": [
      "Amazon"
    ],
    "slug": "root-to-node-path-in-binary-tree"
  },
  {
    "id": 316,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Children Sum Property in Binary Tree",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/children-sum-parent/1",
    "companies": [
      "Amazon"
    ],
    "slug": "children-sum-property-in-binary-tree"
  },
  {
    "id": 317,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Count Total Nodes in Complete Binary Tree",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/count-complete-tree-nodes/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-number-of-nodes-in-a-binary-tree/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "count-complete-tree-nodes"
  },
  {
    "id": 318,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Check for Children Sum Property",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/children-sum-parent/1",
    "companies": [
      "Amazon"
    ],
    "slug": "check-for-children-sum-property"
  },
  {
    "id": 319,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Print All Nodes at Distance K from Target",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/nodes-at-given-distance-in-binary-tree/1",
    "companies": [
      "Amazon"
    ],
    "slug": "all-nodes-distance-k-in-binary-tree"
  },
  {
    "id": 320,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Inorder Preorder Postorder Traversals in One Traversal",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/tree-traversal/1",
    "companies": [
      "Amazon"
    ],
    "slug": "inorder-preorder-postorder-traversals-in-one-traversal"
  },
  {
    "id": 321,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Iterative Inorder Traversal using Stack",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/inorder-traversal-iterative/1",
    "companies": [
      "Amazon"
    ],
    "slug": "binary-tree-inorder-traversal"
  },
  {
    "id": 322,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Iterative Preorder Traversal using Stack",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/preorder-traversal-iterative/1",
    "companies": [
      "Amazon"
    ],
    "slug": "binary-tree-preorder-traversal"
  },
  {
    "id": 323,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Iterative Postorder Traversal using 2 Stacks",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/postorder-traversal-iterative/1",
    "companies": [
      "Amazon"
    ],
    "slug": "binary-tree-postorder-traversal"
  },
  {
    "id": 324,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Iterative Postorder Traversal using 1 Stack",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/postorder-traversal-iterative/1",
    "companies": [
      "Amazon"
    ],
    "slug": "binary-tree-postorder-traversal"
  },
  {
    "id": 325,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Morris Inorder Traversal (O(1) Space)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/inorder-traversal/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "binary-tree-inorder-traversal"
  },
  {
    "id": 326,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Minimum Time Taken to Burn the Binary Tree",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/burning-tree/1",
    "companies": [
      "Amazon"
    ],
    "slug": "minimum-time-taken-to-burn-the-binary-tree"
  },
  {
    "id": 327,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Construct BT from Preorder and Inorder Traversal",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/construct-tree-1/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "construct-binary-tree-from-preorder-and-inorder-traversal"
  },
  {
    "id": 328,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Construct BT from Inorder and Postorder Traversal",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/build-a-tree-concept/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "construct-binary-tree-from-inorder-and-postorder-traversal"
  },
  {
    "id": 329,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Serialize and Deserialize Binary Tree",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/serialize-and-deserialize-a-binary-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon"
    ],
    "slug": "serialize-and-deserialize-binary-tree"
  },
  {
    "id": 330,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Flatten Binary Tree to Linked List",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/flatten-binary-tree-to-linked-list/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "flatten-binary-tree-to-linked-list"
  },
  {
    "id": 331,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Path Sum III (Paths Equal to Sum)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/path-sum-iii/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-single-valued-subtrees/1",
    "companies": [
      "Amazon"
    ],
    "slug": "path-sum-iii"
  },
  {
    "id": 332,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Binary Tree Cameras Minimum Installation",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-cameras/",
    "gfg": "https://www.geeksforgeeks.org/problems/binary-tree-cameras/1",
    "companies": [
      "Google"
    ],
    "slug": "binary-tree-cameras"
  },
  {
    "id": 333,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "name": "Morris Preorder Traversal (O(1) Space)",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/preorder-traversal/1",
    "companies": [
      "Google"
    ],
    "slug": "binary-tree-preorder-traversal"
  },
  {
    "id": 334,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Search in a Binary Search Tree",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/search-in-a-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-a-node-in-bst/1",
    "companies": [
      "Amazon"
    ],
    "slug": "search-in-a-binary-search-tree"
  },
  {
    "id": 335,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Find Min and Max in BST",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-element-in-bst/1",
    "companies": [
      "Amazon"
    ],
    "slug": "find-min-and-max-in-bst"
  },
  {
    "id": 336,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Ceil in a Binary Search Tree",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/ceil-in-bst/1",
    "companies": [
      "Amazon"
    ],
    "slug": "ceil-in-a-binary-search-tree"
  },
  {
    "id": 337,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Floor in a Binary Search Tree",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/floor-in-bst/1",
    "companies": [
      "Amazon"
    ],
    "slug": "floor-in-a-binary-search-tree"
  },
  {
    "id": 338,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Insert a Node in a BST",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/insert-into-a-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/insert-a-node-in-a-bst/1",
    "companies": [
      "Amazon"
    ],
    "slug": "insert-into-a-binary-search-tree"
  },
  {
    "id": 339,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Delete a Node in a BST",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/delete-node-in-a-bst/",
    "gfg": "https://www.geeksforgeeks.org/problems/delete-a-node-from-bst/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "delete-node-in-a-bst"
  },
  {
    "id": 340,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Kth Smallest Element in a BST",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-th-smallest-element-in-bst/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "kth-smallest-element-in-a-bst"
  },
  {
    "id": 341,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Validate Binary Search Tree",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/validate-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-for-bst/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "validate-binary-search-tree"
  },
  {
    "id": 342,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Lowest Common Ancestor of BST",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-bst/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "lowest-common-ancestor-of-a-binary-search-tree"
  },
  {
    "id": 343,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Construct BST from Preorder Traversal",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/construct-bst-from-postorder/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "construct-binary-search-tree-from-preorder-traversal"
  },
  {
    "id": 344,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Convert Sorted Array to Binary Search Tree",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/array-to-bst4443/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "convert-sorted-array-to-binary-search-tree"
  },
  {
    "id": 345,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Inorder Predecessor and Successor in BST",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/predecessor-and-successor/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "inorder-predecessor-and-successor-in-bst"
  },
  {
    "id": 346,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "BST Iterator Implementation",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-search-tree-iterator/",
    "gfg": "https://www.geeksforgeeks.org/problems/binary-search-tree-iterator/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "binary-search-tree-iterator"
  },
  {
    "id": 347,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Two Sum IV - Input is a BST",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/two-sum-iv-input-is-a-bst/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-a-pair-with-given-target-in-bst/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "two-sum-iv-input-is-a-bst"
  },
  {
    "id": 348,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Recover BST / Correct Swap Nodes in BST",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/recover-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/fixed-two-nodes-of-a-bst/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "recover-binary-search-tree"
  },
  {
    "id": 349,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "name": "Size of Largest BST in Binary Tree",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-sum-bst-in-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/largest-bst/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "maximum-sum-bst-in-binary-tree"
  },
  {
    "id": 350,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "BFS Traversal of Graph",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "bfs-traversal-of-graph"
  },
  {
    "id": 351,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "DFS Traversal of Graph",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "dfs-traversal-of-graph"
  },
  {
    "id": 352,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Number of Provinces",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-provinces/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-provinces/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "number-of-provinces"
  },
  {
    "id": 353,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Flood Fill Algorithm",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/flood-fill/",
    "gfg": "https://www.geeksforgeeks.org/problems/flood-fill-algorithm1856/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "flood-fill"
  },
  {
    "id": 354,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Detect Cycle in Undirected Graph (BFS/DFS)",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "detect-cycle-in-undirected-graph-bfs-dfs"
  },
  {
    "id": 355,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Detect Cycle in Directed Graph (DFS)",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "detect-cycle-in-directed-graph-dfs"
  },
  {
    "id": 356,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Number of Islands",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/number-of-islands/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-the-number-of-islands/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "slug": "number-of-islands"
  },
  {
    "id": 357,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Rotting Oranges (Grid BFS)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/rotting-oranges/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotting-oranges2536/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "rotting-oranges"
  },
  {
    "id": 358,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Distance of Nearest Cell Having 1 (0-1 Matrix)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/01-matrix/",
    "gfg": "https://www.geeksforgeeks.org/problems/distance-of-nearest-cell-having-1-1587115620/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "01-matrix"
  },
  {
    "id": 359,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Surrounded Regions (Replace O with X)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/surrounded-regions/",
    "gfg": "https://www.geeksforgeeks.org/problems/replace-o-with-x4256/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "surrounded-regions"
  },
  {
    "id": 360,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Number of Enclaves",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-enclaves/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-enclaves/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "number-of-enclaves"
  },
  {
    "id": 361,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Is Graph Bipartite? (BFS & DFS)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/is-graph-bipartite/",
    "gfg": "https://www.geeksforgeeks.org/problems/bipartite-graph/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "is-graph-bipartite"
  },
  {
    "id": 362,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Topological Sort Algorithm (DFS & Kahn",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/topological-sort/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "topological-sort-algorithm-dfs-kahn"
  },
  {
    "id": 363,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Course Schedule I (Prerequisites Cycle)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/course-schedule/",
    "gfg": "https://www.geeksforgeeks.org/problems/prerequisite-tasks/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "course-schedule"
  },
  {
    "id": 364,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Course Schedule II (Order of Tasks)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/course-schedule-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/course-schedule/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "course-schedule-ii"
  },
  {
    "id": 365,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Alien Dictionary (Topo Sort)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/alien-dictionary/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "alien-dictionary-topo-sort"
  },
  {
    "id": 366,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Shortest Path in Undirected Graph with Unit Weights",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph-having-unit-distance/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "shortest-path-in-undirected-graph-with-unit-weights"
  },
  {
    "id": 367,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Shortest Path in Directed Acyclic Graph (DAG)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph-1655470893/1",
    "companies": [
      "Amazon"
    ],
    "slug": "shortest-path-in-directed-acyclic-graph-dag"
  },
  {
    "id": 368,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Dijkstra",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
    "companies": [
      "Google",
      "Amazon",
      "Uber"
    ],
    "slug": "dijkstra"
  },
  {
    "id": 369,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Shortest Distance in a Binary Maze",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
    "gfg": "https://www.geeksforgeeks.org/problems/shortest-path-in-a-binary-maze-1655453161/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "shortest-path-in-binary-matrix"
  },
  {
    "id": 370,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Path With Minimum Effort",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/path-with-minimum-effort/",
    "gfg": "https://www.geeksforgeeks.org/problems/path-with-minimum-effort/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "path-with-minimum-effort"
  },
  {
    "id": 371,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Cheapest Flights Within K Stops",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
    "gfg": "https://www.geeksforgeeks.org/problems/cheapest-flights-within-k-stops/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "cheapest-flights-within-k-stops"
  },
  {
    "id": 372,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Network Delay Time",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/network-delay-time/",
    "gfg": "https://www.geeksforgeeks.org/problems/network-delay-time/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "network-delay-time"
  },
  {
    "id": 373,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Number of Ways to Arrive at Destination",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-ways-to-arrive-at-destination/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "number-of-ways-to-arrive-at-destination"
  },
  {
    "id": 374,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Minimum Multiplications to Reach End",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-multiplications-to-reach-end/1",
    "companies": [
      "Amazon"
    ],
    "slug": "minimum-multiplications-to-reach-end"
  },
  {
    "id": 375,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Bellman Ford Algorithm",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "bellman-ford-algorithm"
  },
  {
    "id": 376,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Floyd Warshall Algorithm (All Pairs Shortest Path)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/floyd-warshall4005/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "floyd-warshall-algorithm-all-pairs-shortest-path"
  },
  {
    "id": 377,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Find City With Smallest Number of Neighbors",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/",
    "gfg": "https://www.geeksforgeeks.org/problems/city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/1",
    "companies": [
      "Amazon"
    ],
    "slug": "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance"
  },
  {
    "id": 378,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Minimum Spanning Tree - Prim",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "minimum-spanning-tree-prim"
  },
  {
    "id": 379,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Minimum Spanning Tree - Kruskal",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "minimum-spanning-tree-kruskal"
  },
  {
    "id": 380,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Number of Operations to Make Network Connected",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-operations-to-make-network-connected/",
    "gfg": "https://www.geeksforgeeks.org/problems/connecting-the-graph/1",
    "companies": [
      "Amazon"
    ],
    "slug": "number-of-operations-to-make-network-connected"
  },
  {
    "id": 381,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Most Stones Removed with Same Row or Column",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-stone-removal/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "most-stones-removed-with-same-row-or-column"
  },
  {
    "id": 382,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Eulerian Path and Circuit in Undirected Graph",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/eulerian-path-in-an-undirected-graph/1",
    "companies": [
      "Amazon"
    ],
    "slug": "eulerian-path-and-circuit-in-undirected-graph"
  },
  {
    "id": 383,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Count Distinct Islands (Grid DFS)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-distinct-islands/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "count-distinct-islands-grid-dfs"
  },
  {
    "id": 384,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Graph Valid Tree Check",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/graph-valid-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/is-it-a-tree/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "graph-valid-tree"
  },
  {
    "id": 385,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Clone Graph (DFS & Map)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/clone-graph/",
    "gfg": "https://www.geeksforgeeks.org/problems/clone-a-graph/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "clone-graph"
  },
  {
    "id": 386,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Reconstruct Itinerary (Eulerian Path)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/reconstruct-itinerary/",
    "gfg": "https://www.geeksforgeeks.org/problems/reconstruct-itinerary/1",
    "companies": [
      "Google"
    ],
    "slug": "reconstruct-itinerary"
  },
  {
    "id": 387,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Disjoint Set Data Structure (Union by Rank & Size)",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/disjoint-set-union-find/1",
    "companies": [
      "Google",
      "Amazon",
      "Meta"
    ],
    "slug": "disjoint-set-data-structure-union-by-rank-size"
  },
  {
    "id": 388,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Accounts Merge",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/accounts-merge/",
    "gfg": "https://www.geeksforgeeks.org/problems/accounts-merge/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "accounts-merge"
  },
  {
    "id": 389,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Number of Islands II (Online Queries Disjoint Set)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-islands/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "number-of-islands-ii-online-queries-disjoint-set"
  },
  {
    "id": 390,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Making a Large Island (Change 0 to 1)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/making-a-large-island/",
    "gfg": "https://www.geeksforgeeks.org/problems/making-a-large-island/1",
    "companies": [
      "Google",
      "Meta"
    ],
    "slug": "making-a-large-island"
  },
  {
    "id": 391,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Strongly Connected Components - Kosaraju",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "strongly-connected-components-kosaraju"
  },
  {
    "id": 392,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Bridges in Graph - Tarjan",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/critical-connections-in-a-network/",
    "gfg": "https://www.geeksforgeeks.org/problems/bridge-edge-in-graph/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "critical-connections-in-a-network"
  },
  {
    "id": 393,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Articulation Points in Graph",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/articulation-point-1/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "articulation-points-in-graph"
  },
  {
    "id": 394,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Word Ladder I (Shortest Transformation)",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/word-ladder/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-ladder/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "word-ladder"
  },
  {
    "id": 395,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Word Ladder II (All Shortest Sequences)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/word-ladder-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-ladder-ii/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "word-ladder-ii"
  },
  {
    "id": 396,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Swim in Rising Water",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/swim-in-rising-water/",
    "gfg": "https://www.geeksforgeeks.org/problems/swim-in-rising-water/1",
    "companies": [
      "Google"
    ],
    "slug": "swim-in-rising-water"
  },
  {
    "id": 397,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "As Far from Land as Possible",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/as-far-from-land-as-possible/",
    "gfg": "https://www.geeksforgeeks.org/problems/as-far-from-land-as-possible/1",
    "companies": [
      "Amazon"
    ],
    "slug": "as-far-from-land-as-possible"
  },
  {
    "id": 398,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Shortest Path Visiting All Nodes",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/shortest-path-visiting-all-nodes/",
    "gfg": "https://www.geeksforgeeks.org/problems/shortest-path-visiting-all-nodes/1",
    "companies": [
      "Google"
    ],
    "slug": "shortest-path-visiting-all-nodes"
  },
  {
    "id": 399,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Minimum Cost to Make at Least One Valid Path in Grid",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/1",
    "companies": [
      "Google"
    ],
    "slug": "minimum-cost-to-make-at-least-one-valid-path-in-a-grid"
  },
  {
    "id": 400,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Parallel Courses III (Topo Sort & DP)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/parallel-courses-iii/",
    "gfg": "https://www.geeksforgeeks.org/problems/parallel-courses-iii/1",
    "companies": [
      "Google"
    ],
    "slug": "parallel-courses-iii"
  },
  {
    "id": 401,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Longest Increasing Path in a Matrix",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-increasing-path-in-a-matrix/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "longest-increasing-path-in-a-matrix"
  },
  {
    "id": 402,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "name": "Trapping Rain Water II (3D Grid Heap BFS)",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/trapping-rain-water-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/trapping-rain-water-ii/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "trapping-rain-water-ii"
  },
  {
    "id": 403,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Climbing Stairs / Fibonacci DP",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/climbing-stairs/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-ways-to-reach-the-nth-stair-1587115620/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "slug": "climbing-stairs"
  },
  {
    "id": 404,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Frog Jump (DP 1D)",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/geek-jump/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "frog-jump-dp-1d"
  },
  {
    "id": 405,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Frog Jump with K Distances",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/minimal-cost/1",
    "companies": [
      "Amazon"
    ],
    "slug": "frog-jump-with-k-distances"
  },
  {
    "id": 406,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Maximum Sum of Non-Adjacent Elements (House Robber)",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/house-robber/",
    "gfg": "https://www.geeksforgeeks.org/problems/max-sum-without-adjacents2430/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "house-robber"
  },
  {
    "id": 407,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "House Robber II (Circular House Robber)",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/house-robber-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/house-robber-ii/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "house-robber-ii"
  },
  {
    "id": 408,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Grid Unique Paths I",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/unique-paths/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-paths0925/1",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "slug": "unique-paths"
  },
  {
    "id": 409,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Grid Unique Paths II (With Obstacles)",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/unique-paths-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/grid-path-2/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "unique-paths-ii"
  },
  {
    "id": 410,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Minimum Path Sum in Grid",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/minimum-path-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-cost-path3805/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "minimum-path-sum"
  },
  {
    "id": 411,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Triangle Path Minimum Sum",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/triangle/",
    "gfg": "https://www.geeksforgeeks.org/problems/triangle-path-sum/1",
    "companies": [
      "Amazon",
      "Apple"
    ],
    "slug": "triangle"
  },
  {
    "id": 412,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Minimum / Maximum Falling Path Sum",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-falling-path-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-path-sum-in-matrix2709/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "minimum-falling-path-sum"
  },
  {
    "id": 413,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "3D DP Ninja and His Friends (Chocolates Pickup)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/chocolates-pickup/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "3d-dp-ninja-and-his-friends-chocolates-pickup"
  },
  {
    "id": 414,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Subset Sum Equal to Target",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sum-problem2014/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "subset-sum-equal-to-target"
  },
  {
    "id": 415,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Partition Equal Subset Sum",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/partition-equal-subset-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sum-problem2014/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "partition-equal-subset-sum"
  },
  {
    "id": 416,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Partition Array Into Two Arrays to Minimize Difference",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/partition-array-into-two-arrays-to-minimize-sum-difference/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-sum-partition3317/1",
    "companies": [
      "Amazon"
    ],
    "slug": "partition-array-into-two-arrays-to-minimize-sum-difference"
  },
  {
    "id": 417,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Count Subsets with Sum K",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/perfect-sum-problem5633/1",
    "companies": [
      "Amazon"
    ],
    "slug": "count-subsets-with-sum-k"
  },
  {
    "id": 418,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Count Partitions with Given Difference",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/partitions-with-given-difference/1",
    "companies": [
      "Amazon"
    ],
    "slug": "count-partitions-with-given-difference"
  },
  {
    "id": 419,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "0/1 Knapsack Problem",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0917/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "0-1-knapsack-problem"
  },
  {
    "id": 420,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Coin Change I (Minimum Coins)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/coin-change/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-coins1824/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "coin-change"
  },
  {
    "id": 421,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Target Sum",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/target-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/target-sum/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "target-sum"
  },
  {
    "id": 422,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Coin Change II (Ways to Make Amount)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/coin-change-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/coin-change2514/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "coin-change-ii"
  },
  {
    "id": 423,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Unbounded Knapsack",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/knapsack-with-duplicate-items4201/1",
    "companies": [
      "Amazon"
    ],
    "slug": "unbounded-knapsack"
  },
  {
    "id": 424,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Rod Cutting Problem",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/rod-cutting0840/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "rod-cutting-problem"
  },
  {
    "id": 425,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Longest Common Subsequence (LCS)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-common-subsequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-common-subsequence-1587115620/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "longest-common-subsequence"
  },
  {
    "id": 426,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Print Longest Common Subsequence",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/print-all-lcs-sequences3413/1",
    "companies": [
      "Amazon"
    ],
    "slug": "print-longest-common-subsequence"
  },
  {
    "id": 427,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Longest Common Substring",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-common-substring1451/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "longest-common-substring"
  },
  {
    "id": 428,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Longest Palindromic Subsequence",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/longest-palindromic-subsequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-palindromic-subsequence-1612325078/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "longest-palindromic-subsequence"
  },
  {
    "id": 429,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Minimum Insertions to Make String Palindrome",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-deletions1648/1",
    "companies": [
      "Amazon"
    ],
    "slug": "minimum-insertion-steps-to-make-a-string-palindrome"
  },
  {
    "id": 430,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Minimum Deletions/Insertions to Convert String A to B",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/delete-operation-for-two-strings/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-number-of-deletions-and-insertions0209/1",
    "companies": [
      "Amazon"
    ],
    "slug": "delete-operation-for-two-strings"
  },
  {
    "id": 431,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Shortest Common Supersequence",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/shortest-common-supersequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/shortest-common-supersequence0322/1",
    "companies": [
      "Amazon"
    ],
    "slug": "shortest-common-supersequence"
  },
  {
    "id": 432,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Distinct Subsequences (Count Occurrences)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/distinct-subsequences/",
    "gfg": "https://www.geeksforgeeks.org/problems/distinct-occurrences/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "distinct-subsequences"
  },
  {
    "id": 433,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Edit Distance",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/edit-distance/",
    "gfg": "https://www.geeksforgeeks.org/problems/edit-distance3702/1",
    "companies": [
      "Google",
      "Amazon",
      "Meta"
    ],
    "slug": "edit-distance"
  },
  {
    "id": 434,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Wildcard Matching",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/wildcard-matching/",
    "gfg": "https://www.geeksforgeeks.org/problems/wildcard-pattern-matching/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "wildcard-matching"
  },
  {
    "id": 435,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Regular Expression Matching",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/regular-expression-matching/",
    "gfg": "https://www.geeksforgeeks.org/problems/regular-expression-matching/1",
    "companies": [
      "Google",
      "Meta"
    ],
    "slug": "regular-expression-matching"
  },
  {
    "id": 436,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Best Time to Buy and Sell Stock I",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "gfg": "https://www.geeksforgeeks.org/problems/stock-buy-and-sell2615/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "best-time-to-buy-and-sell-stock"
  },
  {
    "id": 437,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Best Time to Buy and Sell Stock II",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/stock-buy-and-sell-1587115621/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "best-time-to-buy-and-sell-stock-ii"
  },
  {
    "id": 438,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Best Time to Buy and Sell Stock III (At most 2 transactions)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/",
    "gfg": "https://www.geeksforgeeks.org/problems/buy-and-sell-a-share-at-most-twice/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "best-time-to-buy-and-sell-stock-iii"
  },
  {
    "id": 439,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Best Time to Buy and Sell Stock IV (At most K transactions)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-profit4657/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "best-time-to-buy-and-sell-stock-iv"
  },
  {
    "id": 440,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Best Time to Buy and Sell Stock with Cooldown",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/",
    "gfg": "https://www.geeksforgeeks.org/problems/buy-stock-with-cooldown/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "best-time-to-buy-and-sell-stock-with-cooldown"
  },
  {
    "id": 441,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Best Time to Buy and Sell Stock with Transaction Fee",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/",
    "gfg": "https://www.geeksforgeeks.org/problems/buy-stock-with-transaction-fee/1",
    "companies": [
      "Amazon"
    ],
    "slug": "best-time-to-buy-and-sell-stock-with-transaction-fee"
  },
  {
    "id": 442,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Longest Increasing Subsequence (LIS)",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-increasing-subsequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-increasing-subsequence-1587115620/1",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "slug": "longest-increasing-subsequence"
  },
  {
    "id": 443,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Print Longest Increasing Subsequence",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/printing-longest-increasing-subsequence/1",
    "companies": [
      "Amazon"
    ],
    "slug": "print-longest-increasing-subsequence"
  },
  {
    "id": 444,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Longest Increasing Subsequence using Binary Search (N log N)",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-increasing-subsequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-increasing-subsequence-1587115620/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "longest-increasing-subsequence"
  },
  {
    "id": 445,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Largest Divisible Subset",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/largest-divisible-subset/",
    "gfg": "https://www.geeksforgeeks.org/problems/largest-divisible-subset/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "largest-divisible-subset"
  },
  {
    "id": 446,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Longest String Chain",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/longest-string-chain/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-string-chain/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "longest-string-chain"
  },
  {
    "id": 447,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Longest Bitonic Subsequence",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-bitonic-subsequence0824/1",
    "companies": [
      "Amazon"
    ],
    "slug": "longest-bitonic-subsequence"
  },
  {
    "id": 448,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Number of Longest Increasing Subsequences",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-longest-increasing-subsequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-longest-increasing-subsequence/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "number-of-longest-increasing-subsequence"
  },
  {
    "id": 449,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Matrix Chain Multiplication (MCM)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "matrix-chain-multiplication-mcm"
  },
  {
    "id": 450,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Minimum Cost to Cut a Stick",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-cost-to-cut-a-board/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "minimum-cost-to-cut-a-stick"
  },
  {
    "id": 451,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Burst Balloons",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/burst-balloons/",
    "gfg": "https://www.geeksforgeeks.org/problems/burst-balloons/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "burst-balloons"
  },
  {
    "id": 452,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Evaluate Boolean Expression to True / Partitioning",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/boolean-parenthesization5611/1",
    "companies": [
      "Amazon"
    ],
    "slug": "evaluate-boolean-expression-to-true-partitioning"
  },
  {
    "id": 453,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Palindrome Partitioning II (Min Cuts)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/palindrome-partitioning-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/palindromic-patitioning4845/1",
    "companies": [
      "Amazon",
      "Meta"
    ],
    "slug": "palindrome-partitioning-ii"
  },
  {
    "id": 454,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Partition Array for Maximum Sum",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/partition-array-for-maximum-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/partition-array-for-maximum-sum/1",
    "companies": [
      "Amazon"
    ],
    "slug": "partition-array-for-maximum-sum"
  },
  {
    "id": 455,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Maximum Profit in Job Scheduling DP",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-profit-in-job-scheduling/",
    "gfg": "https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "maximum-profit-in-job-scheduling"
  },
  {
    "id": 456,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Word Break I (DP Approach)",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/word-break/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-break1352/1",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "slug": "word-break"
  },
  {
    "id": 457,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "name": "Super Egg Dropping Puzzle",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/super-egg-drop/",
    "gfg": "https://www.geeksforgeeks.org/problems/egg-dropping-puzzle-1587115620/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "super-egg-drop"
  },
  {
    "id": 458,
    "sheetType": "a2z",
    "category": "Step 17: Tries",
    "name": "Implement Trie I (Prefix Tree)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/implement-trie-prefix-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/trie-insert-and-search0651/1",
    "companies": [
      "Google",
      "Amazon",
      "Meta"
    ],
    "slug": "implement-trie-prefix-tree"
  },
  {
    "id": 459,
    "sheetType": "a2z",
    "category": "Step 17: Tries",
    "name": "Implement Trie II (Count Words / Prefix)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/trie-delete/1",
    "companies": [
      "Google",
      "Meta"
    ],
    "slug": "implement-trie-ii-count-words-prefix"
  },
  {
    "id": 460,
    "sheetType": "a2z",
    "category": "Step 17: Tries",
    "name": "Longest Word With All Prefixes (Complete String)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/longest-word-in-dictionary/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-string-with-all-prefixes/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "longest-word-in-dictionary"
  },
  {
    "id": 461,
    "sheetType": "a2z",
    "category": "Step 17: Tries",
    "name": "Number of Distinct Substrings in a String",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-distinct-substrings-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-number-of-substrings4528/1",
    "companies": [
      "Google",
      "Meta"
    ],
    "slug": "number-of-distinct-substrings-in-a-string"
  },
  {
    "id": 462,
    "sheetType": "a2z",
    "category": "Step 17: Tries",
    "name": "Maximum XOR of Two Numbers in an Array",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-xor-of-two-numbers-in-an-array/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "maximum-xor-of-two-numbers-in-an-array"
  },
  {
    "id": 463,
    "sheetType": "a2z",
    "category": "Step 17: Tries",
    "name": "Maximum XOR With an Element From Array",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-xor-with-an-element-from-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-xor-with-an-element-from-array/1",
    "companies": [
      "Google",
      "Meta"
    ],
    "slug": "maximum-xor-with-an-element-from-array"
  },
  {
    "id": 464,
    "sheetType": "a2z",
    "category": "Step 17: Tries",
    "name": "Word Break II (Trie & Backtracking)",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/word-break-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-break-part-23201/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon"
    ],
    "slug": "word-break-ii"
  },
  {
    "id": 465,
    "sheetType": "a2z",
    "category": "Step 18: Advanced Strings / Strings [Hard / Patterns]",
    "name": "KMP Algorithm for Pattern Searching / LPS Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-pattern-kmp-algorithm--141631/1",
    "companies": [
      "Google",
      "Meta"
    ],
    "slug": "find-the-index-of-the-first-occurrence-in-a-string"
  },
  {
    "id": 466,
    "sheetType": "a2z",
    "category": "Step 18: Advanced Strings / Strings [Hard / Patterns]",
    "name": "Count and Say Pattern Sequence",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/count-and-say/",
    "gfg": "https://www.geeksforgeeks.org/problems/decode-the-pattern1138/1",
    "companies": [
      "Meta",
      "Amazon"
    ],
    "slug": "count-and-say"
  },
  {
    "id": 467,
    "sheetType": "a2z",
    "category": "Step 18: Advanced Strings / Strings [Hard / Patterns]",
    "name": "Compare Version Numbers",
    "difficulty": "Medium",
    "rating": "4.0 / 5",
    "leetcode": "https://leetcode.com/problems/compare-version-numbers/",
    "gfg": "https://www.geeksforgeeks.org/problems/compare-two-version-numbers/1",
    "companies": [
      "Apple",
      "Microsoft"
    ],
    "slug": "compare-version-numbers"
  },
  {
    "id": 468,
    "sheetType": "a2z",
    "category": "Step 18: Advanced Strings / Strings [Hard / Patterns]",
    "name": "Minimum Bracket Reversals to Balance Expression",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/count-the-reversals0401/1",
    "companies": [
      "Amazon"
    ],
    "slug": "minimum-bracket-reversals-to-balance-expression"
  },
  {
    "id": 469,
    "sheetType": "a2z",
    "category": "Step 18: Advanced Strings / Strings [Hard / Patterns]",
    "name": "Rabin Karp Algorithm for String Matching",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/repeated-string-match/",
    "gfg": "https://www.geeksforgeeks.org/problems/rabin-karp-algorithm/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "repeated-string-match"
  },
  {
    "id": 470,
    "sheetType": "a2z",
    "category": "Step 18: Advanced Strings / Strings [Hard / Patterns]",
    "name": "Z-Function String Matching Algorithm",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/z-algorithm/1",
    "companies": [
      "Google"
    ],
    "slug": "find-the-index-of-the-first-occurrence-in-a-string"
  },
  {
    "id": 471,
    "sheetType": "a2z",
    "category": "Step 18: Advanced Strings / Strings [Hard / Patterns]",
    "name": "Shortest Palindrome / Add Minimum Front Characters",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/shortest-palindrome/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-characters-to-be-added-at-front-to-make-string-palindrome/1",
    "companies": [
      "Amazon",
      "Google"
    ],
    "slug": "shortest-palindrome"
  },
  {
    "id": 472,
    "sheetType": "a2z",
    "category": "Step 18: Advanced Strings / Strings [Hard / Patterns]",
    "name": "Longest Happy Prefix",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/longest-happy-prefix/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-prefix-suffix2527/1",
    "companies": [
      "Google"
    ],
    "slug": "longest-happy-prefix"
  },
  {
    "id": 473,
    "sheetType": "a2z",
    "category": "Step 18: Advanced Strings / Strings [Hard / Patterns]",
    "name": "Count Palindromic Subsequences in String",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/count-different-palindromic-subsequences/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-palindromic-subsequences/1",
    "companies": [
      "Google",
      "Amazon"
    ],
    "slug": "count-different-palindromic-subsequences"
  }
];

// Default SDE Sheet reference for backward compatibility
export const SDE_SHEET_DATA: DSAProblem[] = SDE_SHEET_191_DATA;

export const ALL_SHEETS_MAP: Record<DSASheetType, DSAProblem[]> = {
  sde: SDE_SHEET_191_DATA,
  a2z: A2Z_DSA_SHEET_473_DATA,
  79: SDETUBE_79_SHEET_DATA
};

export function getSheetData(sheetType: DSASheetType): DSAProblem[] {
  return ALL_SHEETS_MAP[sheetType] || SDE_SHEET_191_DATA;
}
