import { CODESTORYWITHMIK_SHEET_DATA } from './mikSheetData';
import { BLIND_75_SHEET_DATA } from './blind75SheetData';

export type DSASheetType = 'sde' | 'a2z' | '79' | 'blind75' | 'mik';

export interface DSAProblem {
  id: number;
  sheetType: DSASheetType;
  category: string;
  subcategory?: string;
  name: string;
  leetcode: string;
  gfg: string;
  youtube?: string;
  article?: string;
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
    totalQuestions: 474,
    description: 'Complete 474-Problem Step-by-Step DSA Roadmap across 18 Steps',
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
  },
  blind75: {
    id: 'blind75',
    name: "Blind 75 Curated Sheet",
    shortName: 'Blind 75',
    totalQuestions: 76,
    description: '75 Quintessential LeetCode Problems for Top Tech Interviews',
    icon: 'award',
    accentGradient: 'from-amber-500 via-orange-500 to-red-500'
  },
  mik: {
    id: 'mik',
    name: "CodeStoryWithMIK Premium DSA Sheet",
    shortName: 'CodeStoryWithMIK',
    totalQuestions: 174,
    description: '174 High-Frequency Topic-Wise Problems with In-Depth Video Stories across 20 Topics',
    icon: 'crown',
    accentGradient: 'from-fuchsia-600 via-pink-600 to-rose-600'
  }
};

export function getLeetCodeSlug(problem: DSAProblem): string {
  if (problem.slug && problem.slug !== 'https' && problem.slug !== 'http') return problem.slug;
  const match = problem.leetcode?.match(/\/problems\/([^/]+)/);
  if (match && match[1]) return match[1];
  return (problem.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'problem';
}

export function getGfgUrl(problem: DSAProblem): string {
  if (problem.gfg && problem.gfg.startsWith('http') && problem.gfg !== '$undefined') {
    return problem.gfg;
  }
  const cleanSlug = getLeetCodeSlug(problem);
  return `https://www.geeksforgeeks.org/problems/${cleanSlug}/1`;
}

export function getLeetCodeUrl(problem: DSAProblem): string {
  if (problem.leetcode && problem.leetcode.startsWith('http') && problem.leetcode !== '$undefined') {
    return problem.leetcode;
  }
  const cleanSlug = getLeetCodeSlug(problem);
  return `https://leetcode.com/problems/${cleanSlug}/`;
}

export const SDE_SHEET_191_DATA: DSAProblem[] = [
  {
    "id": 1,
    "sheetType": "sde",
    "category": "Arrays Part-I",
    "subcategory": "Arrays Part-I",
    "name": "Set Matrix Zeroes",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/set-matrix-zeroes/",
    "gfg": "https://www.geeksforgeeks.org/problems/set-matrix-zeroes/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "set-matrix-zeroes"
  },
  {
    "id": 2,
    "sheetType": "sde",
    "category": "Arrays Part-I",
    "subcategory": "Arrays Part-I",
    "name": "Pascal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/pascals-triangle/",
    "gfg": "https://www.geeksforgeeks.org/problems/pascal-triangle0652/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "pascals-triangle"
  },
  {
    "id": 3,
    "sheetType": "sde",
    "category": "Arrays Part-I",
    "subcategory": "Arrays Part-I",
    "name": "Next Permutation",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/next-permutation/",
    "gfg": "https://www.geeksforgeeks.org/problems/next-permutation5226/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "next-permutation"
  },
  {
    "id": 4,
    "sheetType": "sde",
    "category": "Arrays Part-I",
    "subcategory": "Arrays Part-I",
    "name": "Kadane",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/maximum-subarray/",
    "gfg": "https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "maximum-subarray"
  },
  {
    "id": 5,
    "sheetType": "sde",
    "category": "Arrays Part-I",
    "subcategory": "Arrays Part-I",
    "name": "Sort an Array of 0s 1s and 2s",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/sort-colors/",
    "gfg": "https://www.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s4231/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "sort-colors"
  },
  {
    "id": 6,
    "sheetType": "sde",
    "category": "Arrays Part-I",
    "subcategory": "Arrays Part-I",
    "name": "Stock Buy and Sell",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "gfg": "https://www.geeksforgeeks.org/problems/stock-buy-and-sell2615/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "best-time-to-buy-and-sell-stock"
  },
  {
    "id": 7,
    "sheetType": "sde",
    "category": "Arrays Part-II",
    "subcategory": "Arrays Part-II",
    "name": "Rotate Matrix (Image)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/rotate-image/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotate-by-90-degree-1587115621/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "rotate-image"
  },
  {
    "id": 8,
    "sheetType": "sde",
    "category": "Arrays Part-II",
    "subcategory": "Arrays Part-II",
    "name": "Merge Overlapping Subintervals",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/merge-intervals/",
    "gfg": "https://www.geeksforgeeks.org/problems/overlapping-intervals--170643/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "merge-intervals"
  },
  {
    "id": 9,
    "sheetType": "sde",
    "category": "Arrays Part-II",
    "subcategory": "Arrays Part-II",
    "name": "Merge Two Sorted Arrays Without Extra Space",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/merge-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-two-sorted-arrays-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "merge-sorted-array"
  },
  {
    "id": 10,
    "sheetType": "sde",
    "category": "Arrays Part-II",
    "subcategory": "Arrays Part-II",
    "name": "Find Duplicate in Array of N+1 Integers",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-duplicate-number/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-duplicates-in-an-array/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "find-the-duplicate-number"
  },
  {
    "id": 11,
    "sheetType": "sde",
    "category": "Arrays Part-II",
    "subcategory": "Arrays Part-II",
    "name": "Repeat and Missing Number",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/set-mismatch/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-missing-and-repeating2512/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "set-mismatch"
  },
  {
    "id": 12,
    "sheetType": "sde",
    "category": "Arrays Part-II",
    "subcategory": "Arrays Part-II",
    "name": "Count Inversions in Array",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/global-and-local-inversions/",
    "gfg": "https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1",
    "companies": [
      "Amazon"
    ],
    "slug": "global-and-local-inversions"
  },
  {
    "id": 13,
    "sheetType": "sde",
    "category": "Arrays Part-III",
    "subcategory": "Arrays Part-III",
    "name": "Search in a 2D Matrix",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-a-matrix-1587115621/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "search-a-2d-matrix"
  },
  {
    "id": 14,
    "sheetType": "sde",
    "category": "Arrays Part-III",
    "subcategory": "Arrays Part-III",
    "name": "Pow(x, n)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/powx-n/",
    "gfg": "https://www.geeksforgeeks.org/problems/power-of-numbers-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "powx-n"
  },
  {
    "id": 15,
    "sheetType": "sde",
    "category": "Arrays Part-III",
    "subcategory": "Arrays Part-III",
    "name": "Majority Element (> N/2 times)",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/majority-element/",
    "gfg": "https://www.geeksforgeeks.org/problems/majority-element-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "majority-element"
  },
  {
    "id": 16,
    "sheetType": "sde",
    "category": "Arrays Part-III",
    "subcategory": "Arrays Part-III",
    "name": "Majority Element II (> N/3 times)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/majority-element-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/majority-vote/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "TCS"
    ],
    "slug": "majority-element-ii"
  },
  {
    "id": 17,
    "sheetType": "sde",
    "category": "Arrays Part-III",
    "subcategory": "Arrays Part-III",
    "name": "Grid Unique Paths",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/unique-paths/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-paths0925/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "unique-paths"
  },
  {
    "id": 18,
    "sheetType": "sde",
    "category": "Arrays Part-III",
    "subcategory": "Arrays Part-III",
    "name": "Reverse Pairs",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-pairs/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-reverse-pairs/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "reverse-pairs"
  },
  {
    "id": 19,
    "sheetType": "sde",
    "category": "Arrays Part-IV",
    "subcategory": "Arrays Part-IV",
    "name": "2 Sum Problem",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/two-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/key-pair5610/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "two-sum"
  },
  {
    "id": 20,
    "sheetType": "sde",
    "category": "Arrays Part-IV",
    "subcategory": "Arrays Part-IV",
    "name": "4 Sum Problem",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/4sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-all-four-sum-numbers1732/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "4sum"
  },
  {
    "id": 21,
    "sheetType": "sde",
    "category": "Arrays Part-IV",
    "subcategory": "Arrays Part-IV",
    "name": "Longest Consecutive Sequence",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-consecutive-sequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-consecutive-subsequence2421/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "longest-consecutive-sequence"
  },
  {
    "id": 22,
    "sheetType": "sde",
    "category": "Arrays Part-IV",
    "subcategory": "Arrays Part-IV",
    "name": "Largest Subarray with 0 Sum",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/contiguous-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/largest-subarray-with-0-sum/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ],
    "slug": "contiguous-array"
  },
  {
    "id": 23,
    "sheetType": "sde",
    "category": "Arrays Part-IV",
    "subcategory": "Arrays Part-IV",
    "name": "Count Subarrays with Given XOR K",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/subarray-sum-equals-k/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-subarray-with-given-xor/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "subarray-sum-equals-k"
  },
  {
    "id": 24,
    "sheetType": "sde",
    "category": "Arrays Part-IV",
    "subcategory": "Arrays Part-IV",
    "name": "Longest Substring Without Repeating Characters",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "gfg": "https://www.geeksforgeeks.org/problems/length-of-the-longest-substring3036/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "longest-substring-without-repeating-characters"
  },
  {
    "id": 25,
    "sheetType": "sde",
    "category": "Linked List",
    "subcategory": "Linked List",
    "name": "Reverse a Linked List",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "reverse-linked-list"
  },
  {
    "id": 26,
    "sheetType": "sde",
    "category": "Linked List",
    "subcategory": "Linked List",
    "name": "Find Middle of Linked List",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/middle-of-the-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/finding-middle-element-in-a-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "middle-of-the-linked-list"
  },
  {
    "id": 27,
    "sheetType": "sde",
    "category": "Linked List",
    "subcategory": "Linked List",
    "name": "Merge Two Sorted Linked Lists",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/merge-two-sorted-lists/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-two-sorted-linked-lists/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "merge-two-sorted-lists"
  },
  {
    "id": 28,
    "sheetType": "sde",
    "category": "Linked List",
    "subcategory": "Linked List",
    "name": "Remove Nth Node From End of List",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/nth-node-from-end-of-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "remove-nth-node-from-end-of-list"
  },
  {
    "id": 29,
    "sheetType": "sde",
    "category": "Linked List",
    "subcategory": "Linked List",
    "name": "Add Two Numbers as LinkedLists",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/add-two-numbers/",
    "gfg": "https://www.geeksforgeeks.org/problems/add-two-numbers-represented-by-linked-lists/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "add-two-numbers"
  },
  {
    "id": 30,
    "sheetType": "sde",
    "category": "Linked List",
    "subcategory": "Linked List",
    "name": "Delete Node in a Linked List",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/delete-node-in-a-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/delete-without-head-pointer/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "delete-node-in-a-linked-list"
  },
  {
    "id": 31,
    "sheetType": "sde",
    "category": "Linked List Part-II",
    "subcategory": "Linked List Part-II",
    "name": "Find Intersection Point of Y LinkedList",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
    "gfg": "https://www.geeksforgeeks.org/problems/intersection-point-in-y-shapped-linked-lists/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "intersection-of-two-linked-lists"
  },
  {
    "id": 32,
    "sheetType": "sde",
    "category": "Linked List Part-II",
    "subcategory": "Linked List Part-II",
    "name": "Detect Cycle in Linked List",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "linked-list-cycle"
  },
  {
    "id": 33,
    "sheetType": "sde",
    "category": "Linked List Part-II",
    "subcategory": "Linked List Part-II",
    "name": "Reverse Nodes in K-Group",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-a-linked-list-in-groups-of-given-size/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "reverse-nodes-in-k-group"
  },
  {
    "id": 34,
    "sheetType": "sde",
    "category": "Linked List Part-II",
    "subcategory": "Linked List Part-II",
    "name": "Check if Linked List is Palindrome",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/palindrome-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-if-linked-list-is-pallindrome/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Nvidia"
    ],
    "slug": "palindrome-linked-list"
  },
  {
    "id": 35,
    "sheetType": "sde",
    "category": "Linked List Part-II",
    "subcategory": "Linked List Part-II",
    "name": "Find Starting Point of Loop in LinkedList",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-first-node-of-loop-in-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "ByteDance"
    ],
    "slug": "linked-list-cycle-ii"
  },
  {
    "id": 36,
    "sheetType": "sde",
    "category": "Linked List Part-II",
    "subcategory": "Linked List Part-II",
    "name": "Flattening of a LinkedList",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/flattening-a-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "LinkedIn"
    ],
    "slug": "flatten-a-multilevel-doubly-linked-list"
  },
  {
    "id": 37,
    "sheetType": "sde",
    "category": "Linked List and Arrays",
    "subcategory": "Linked List and Arrays",
    "name": "Rotate a LinkedList",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/rotate-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotate-a-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Nvidia"
    ],
    "slug": "rotate-list"
  },
  {
    "id": 38,
    "sheetType": "sde",
    "category": "Linked List and Arrays",
    "subcategory": "Linked List and Arrays",
    "name": "Clone Linked List with Random and Next Pointer",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/copy-list-with-random-pointer/",
    "gfg": "https://www.geeksforgeeks.org/problems/clone-a-linked-list-with-next-and-random-pointer/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "copy-list-with-random-pointer"
  },
  {
    "id": 39,
    "sheetType": "sde",
    "category": "Linked List and Arrays",
    "subcategory": "Linked List and Arrays",
    "name": "3 Sum Problem",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/3sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-triplets-with-zero-sum/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "3sum"
  },
  {
    "id": 40,
    "sheetType": "sde",
    "category": "Linked List and Arrays",
    "subcategory": "Linked List and Arrays",
    "name": "Trapping Rain Water",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/trapping-rain-water/",
    "gfg": "https://www.geeksforgeeks.org/problems/trapping-rain-water-1587115621/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "trapping-rain-water"
  },
  {
    "id": 41,
    "sheetType": "sde",
    "category": "Linked List and Arrays",
    "subcategory": "Linked List and Arrays",
    "name": "Remove Duplicates from Sorted Array",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/remove-duplicate-elements-from-sorted-array/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "remove-duplicates-from-sorted-array"
  },
  {
    "id": 42,
    "sheetType": "sde",
    "category": "Linked List and Arrays",
    "subcategory": "Linked List and Arrays",
    "name": "Max Consecutive Ones",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "https://leetcode.com/problems/max-consecutive-ones/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-consecutive-ones/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "max-consecutive-ones"
  },
  {
    "id": 43,
    "sheetType": "sde",
    "category": "Greedy Algorithm",
    "subcategory": "Greedy Algorithm",
    "name": "N Meetings in One Room",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/meeting-rooms/",
    "gfg": "https://www.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "meeting-rooms"
  },
  {
    "id": 44,
    "sheetType": "sde",
    "category": "Greedy Algorithm",
    "subcategory": "Greedy Algorithm",
    "name": "Minimum Platforms Required for Railway Station",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/meeting-rooms-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "meeting-rooms-ii"
  },
  {
    "id": 45,
    "sheetType": "sde",
    "category": "Greedy Algorithm",
    "subcategory": "Greedy Algorithm",
    "name": "Job Sequencing Problem",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-profit-in-job-scheduling/",
    "gfg": "https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "maximum-profit-in-job-scheduling"
  },
  {
    "id": 46,
    "sheetType": "sde",
    "category": "Greedy Algorithm",
    "subcategory": "Greedy Algorithm",
    "name": "Fractional Knapsack Problem",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-units-on-a-truck/",
    "gfg": "https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Salesforce"
    ],
    "slug": "maximum-units-on-a-truck"
  },
  {
    "id": 47,
    "sheetType": "sde",
    "category": "Greedy Algorithm",
    "subcategory": "Greedy Algorithm",
    "name": "Greedy Algorithm for Minimum Coins",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/coin-change/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-coins1824/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "coin-change"
  },
  {
    "id": 48,
    "sheetType": "sde",
    "category": "Greedy Algorithm",
    "subcategory": "Greedy Algorithm",
    "name": "Assign Cookies / Candy",
    "difficulty": "Easy",
    "rating": "4.0 / 5",
    "leetcode": "https://leetcode.com/problems/assign-cookies/",
    "gfg": "https://www.geeksforgeeks.org/problems/assign-cookies/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "assign-cookies"
  },
  {
    "id": 49,
    "sheetType": "sde",
    "category": "Recursion",
    "subcategory": "Recursion",
    "name": "Subset Sums",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/subsets/",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sums1516/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "subsets"
  },
  {
    "id": 50,
    "sheetType": "sde",
    "category": "Recursion",
    "subcategory": "Recursion",
    "name": "Subset II (Unique Subsets)",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/subsets-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sum-ii/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "subsets-ii"
  },
  {
    "id": 51,
    "sheetType": "sde",
    "category": "Recursion",
    "subcategory": "Recursion",
    "name": "Combination Sum I",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/combination-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/combination-sum-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "combination-sum"
  },
  {
    "id": 52,
    "sheetType": "sde",
    "category": "Recursion",
    "subcategory": "Recursion",
    "name": "Combination Sum II",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/combination-sum-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/combination-sum-ii-1664263832/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ],
    "slug": "combination-sum-ii"
  },
  {
    "id": 53,
    "sheetType": "sde",
    "category": "Recursion",
    "subcategory": "Recursion",
    "name": "Palindrome Partitioning",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/palindrome-partitioning/",
    "gfg": "https://www.geeksforgeeks.org/problems/palindrome-partitioning3622/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Infosys"
    ],
    "slug": "palindrome-partitioning"
  },
  {
    "id": 54,
    "sheetType": "sde",
    "category": "Recursion",
    "subcategory": "Recursion",
    "name": "K-th Permutation Sequence",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/permutation-sequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-th-permutation-sequence/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Twitter (X)"
    ],
    "slug": "permutation-sequence"
  },
  {
    "id": 55,
    "sheetType": "sde",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "name": "Print All Permutations of Array / String",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/permutations/",
    "gfg": "https://www.geeksforgeeks.org/problems/permutations-of-a-given-string2041/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "permutations"
  },
  {
    "id": 56,
    "sheetType": "sde",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "name": "N Queens Problem",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/n-queens/",
    "gfg": "https://www.geeksforgeeks.org/problems/n-queen-problem0315/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "n-queens"
  },
  {
    "id": 57,
    "sheetType": "sde",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "name": "Sudoku Solver",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/sudoku-solver/",
    "gfg": "https://www.geeksforgeeks.org/problems/solve-the-sudoku-1587115621/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "sudoku-solver"
  },
  {
    "id": 58,
    "sheetType": "sde",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "name": "M Coloring Problem",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/flower-planting-with-no-adjacent/",
    "gfg": "https://www.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1",
    "companies": [
      "Bloomberg"
    ],
    "slug": "flower-planting-with-no-adjacent"
  },
  {
    "id": 59,
    "sheetType": "sde",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "name": "Rat in a Maze",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/unique-paths-iii/",
    "gfg": "https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem--1587115621/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "unique-paths-iii"
  },
  {
    "id": 60,
    "sheetType": "sde",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "name": "Word Break (Print all ways)",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/word-break-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-break-part-23201/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "word-break-ii"
  },
  {
    "id": 61,
    "sheetType": "sde",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "N-th Root of an Integer",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/powx-n/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-nth-root-of-m5843/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "powx-n"
  },
  {
    "id": 62,
    "sheetType": "sde",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "Matrix Median",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
    "gfg": "https://www.geeksforgeeks.org/problems/matrix-median0732/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "kth-smallest-element-in-a-sorted-matrix"
  },
  {
    "id": 63,
    "sheetType": "sde",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "Single Element in a Sorted Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/single-element-in-a-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-the-element-that-appears-once-in-sorted-array0624/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "single-element-in-a-sorted-array"
  },
  {
    "id": 64,
    "sheetType": "sde",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "Search Element in Sorted and Rotated Array",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-a-rotated-array4618/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "search-in-rotated-sorted-array"
  },
  {
    "id": 65,
    "sheetType": "sde",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "Median of 2 Sorted Arrays",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    "gfg": "https://www.geeksforgeeks.org/problems/median-of-2-sorted-arrays-of-different-sizes/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "median-of-two-sorted-arrays"
  },
  {
    "id": 66,
    "sheetType": "sde",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "K-th Element of Two Sorted Arrays",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/kth-smallest-product-of-two-sorted-arrays/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array1317/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "LinkedIn"
    ],
    "slug": "kth-smallest-product-of-two-sorted-arrays"
  },
  {
    "id": 67,
    "sheetType": "sde",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "Allocate Minimum Number of Pages",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
    "gfg": "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "capacity-to-ship-packages-within-d-days"
  },
  {
    "id": 68,
    "sheetType": "sde",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "Aggressive Cows",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/magnetic-force-between-two-balls/",
    "gfg": "https://www.geeksforgeeks.org/problems/aggressive-cows/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "magnetic-force-between-two-balls"
  },
  {
    "id": 69,
    "sheetType": "sde",
    "category": "Heaps",
    "subcategory": "Heaps",
    "name": "Max Heap Min Heap Implementation",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/heap-sort/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "max-heap-min-heap-implementation"
  },
  {
    "id": 70,
    "sheetType": "sde",
    "category": "Heaps",
    "subcategory": "Heaps",
    "name": "Kth Largest Element in an Array",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-largest-elements4206/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "kth-largest-element-in-an-array"
  },
  {
    "id": 71,
    "sheetType": "sde",
    "category": "Heaps",
    "subcategory": "Heaps",
    "name": "Maximum Sum Combination",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-sum-combination/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "find-k-pairs-with-smallest-sums"
  },
  {
    "id": 72,
    "sheetType": "sde",
    "category": "Heaps",
    "subcategory": "Heaps",
    "name": "Find Median from Data Stream",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/find-median-from-data-stream/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-median-in-a-stream-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "find-median-from-data-stream"
  },
  {
    "id": 73,
    "sheetType": "sde",
    "category": "Heaps",
    "subcategory": "Heaps",
    "name": "Merge K Sorted Arrays",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/merge-k-sorted-lists/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "merge-k-sorted-lists"
  },
  {
    "id": 74,
    "sheetType": "sde",
    "category": "Heaps",
    "subcategory": "Heaps",
    "name": "Top K Frequent Elements",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/top-k-frequent-elements/",
    "gfg": "https://www.geeksforgeeks.org/problems/top-k-frequent-elements-in-array/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "top-k-frequent-elements"
  },
  {
    "id": 75,
    "sheetType": "sde",
    "category": "Stack and Queue",
    "subcategory": "Stack and Queue",
    "name": "Implement Stack using Array",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/implement-stack-using-array/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "implement-stack-using-array"
  },
  {
    "id": 76,
    "sheetType": "sde",
    "category": "Stack and Queue",
    "subcategory": "Stack and Queue",
    "name": "Implement Queue using Array",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/implement-queue-using-array/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "implement-queue-using-array"
  },
  {
    "id": 77,
    "sheetType": "sde",
    "category": "Stack and Queue",
    "subcategory": "Stack and Queue",
    "name": "Implement Stack using Queue",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/implement-stack-using-queues/",
    "gfg": "https://www.geeksforgeeks.org/problems/stack-using-two-queues/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "implement-stack-using-queues"
  },
  {
    "id": 78,
    "sheetType": "sde",
    "category": "Stack and Queue",
    "subcategory": "Stack and Queue",
    "name": "Implement Queue using Stack",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/implement-queue-using-stacks/",
    "gfg": "https://www.geeksforgeeks.org/problems/queue-using-two-stacks/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "implement-queue-using-stacks"
  },
  {
    "id": 79,
    "sheetType": "sde",
    "category": "Stack and Queue",
    "subcategory": "Stack and Queue",
    "name": "Check for Balanced Parentheses",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/valid-parentheses/",
    "gfg": "https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "valid-parentheses"
  },
  {
    "id": 80,
    "sheetType": "sde",
    "category": "Stack and Queue",
    "subcategory": "Stack and Queue",
    "name": "Next Greater Element",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/next-greater-element-i/",
    "gfg": "https://www.geeksforgeeks.org/problems/next-larger-element-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "next-greater-element-i"
  },
  {
    "id": 81,
    "sheetType": "sde",
    "category": "Stack and Queue",
    "subcategory": "Stack and Queue",
    "name": "Sort a Stack",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/sort-a-stack/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "sort-a-stack"
  },
  {
    "id": 82,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "name": "Next Smaller Element",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/final-prices-with-a-special-discount-in-a-shop/",
    "gfg": "https://www.geeksforgeeks.org/problems/help-classmates--141631/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "final-prices-with-a-special-discount-in-a-shop"
  },
  {
    "id": 83,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "name": "LRU Cache Implementation",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/lru-cache/",
    "gfg": "https://www.geeksforgeeks.org/problems/lru-cache/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "lru-cache"
  },
  {
    "id": 84,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "name": "LFU Cache Implementation",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/lfu-cache/",
    "gfg": "https://www.geeksforgeeks.org/problems/lfu-cache/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "lfu-cache"
  },
  {
    "id": 85,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "name": "Largest Rectangle in Histogram",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-rectangular-area-in-a-histogram-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "largest-rectangle-in-histogram"
  },
  {
    "id": 86,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "name": "Sliding Window Maximum",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-of-all-subarrays-of-size-k5901/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "sliding-window-maximum"
  },
  {
    "id": 87,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "name": "Implement Min Stack",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/min-stack/",
    "gfg": "https://www.geeksforgeeks.org/problems/get-minimum-element-from-stack/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "min-stack"
  },
  {
    "id": 88,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "name": "Rotten Oranges",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/rotting-oranges/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotting-oranges2536/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "rotting-oranges"
  },
  {
    "id": 89,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "name": "Stock Span Problem",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/online-stock-span/",
    "gfg": "https://www.geeksforgeeks.org/problems/stock-span-problem-1587115621/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ],
    "slug": "online-stock-span"
  },
  {
    "id": 90,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "name": "The Celebrity Problem",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-celebrity/",
    "gfg": "https://www.geeksforgeeks.org/problems/the-celebrity-problem/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "find-the-celebrity"
  },
  {
    "id": 91,
    "sheetType": "sde",
    "category": "Stack and Queue Part-II",
    "subcategory": "Stack and Queue Part-II",
    "name": "Maximum of Minimum for Every Window Size",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-of-minimum-for-every-window-size3453/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "maximum-of-minimum-for-every-window-size"
  },
  {
    "id": 92,
    "sheetType": "sde",
    "category": "String",
    "subcategory": "String",
    "name": "Reverse Words in a String",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-words-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-words-in-a-given-string3547/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "reverse-words-in-a-string"
  },
  {
    "id": 93,
    "sheetType": "sde",
    "category": "String",
    "subcategory": "String",
    "name": "Longest Palindromic Substring",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-palindromic-substring/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-palindromic-substring0857/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "longest-palindromic-substring"
  },
  {
    "id": 94,
    "sheetType": "sde",
    "category": "String",
    "subcategory": "String",
    "name": "Roman to Integer",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/roman-to-integer/",
    "gfg": "https://www.geeksforgeeks.org/problems/roman-number-to-integer3201/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "roman-to-integer"
  },
  {
    "id": 95,
    "sheetType": "sde",
    "category": "String",
    "subcategory": "String",
    "name": "Implement String to Integer (ATOI)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/string-to-integer-atoi/",
    "gfg": "https://www.geeksforgeeks.org/problems/implement-atoi/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "string-to-integer-atoi"
  },
  {
    "id": 96,
    "sheetType": "sde",
    "category": "String",
    "subcategory": "String",
    "name": "Longest Common Prefix",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/longest-common-prefix/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-common-prefix-in-an-array5129/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "longest-common-prefix"
  },
  {
    "id": 97,
    "sheetType": "sde",
    "category": "String",
    "subcategory": "String",
    "name": "Rabin Karp Algorithm",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/repeated-string-match/",
    "gfg": "https://www.geeksforgeeks.org/problems/rabin-karp-algorithm/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "repeated-string-match"
  },
  {
    "id": 98,
    "sheetType": "sde",
    "category": "String Part-II",
    "subcategory": "String Part-II",
    "name": "Z-Function",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-pattern-z-algorithm--141631/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "find-the-index-of-the-first-occurrence-in-a-string"
  },
  {
    "id": 99,
    "sheetType": "sde",
    "category": "String Part-II",
    "subcategory": "String Part-II",
    "name": "KMP Algorithm / Find Index of First Occurrence",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-pattern-kmp-algorithm--141631/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "find-the-index-of-the-first-occurrence-in-a-string"
  },
  {
    "id": 100,
    "sheetType": "sde",
    "category": "String Part-II",
    "subcategory": "String Part-II",
    "name": "Minimum Characters Needed to Make String Palindromic",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/shortest-palindrome/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-characters-to-be-added-at-front-to-make-string-palindrome/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "shortest-palindrome"
  },
  {
    "id": 101,
    "sheetType": "sde",
    "category": "String Part-II",
    "subcategory": "String Part-II",
    "name": "Valid Anagram",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/valid-anagram/",
    "gfg": "https://www.geeksforgeeks.org/problems/anagram-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "valid-anagram"
  },
  {
    "id": 102,
    "sheetType": "sde",
    "category": "String Part-II",
    "subcategory": "String Part-II",
    "name": "Count and Say",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/count-and-say/",
    "gfg": "https://www.geeksforgeeks.org/problems/decode-the-pattern1138/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "count-and-say"
  },
  {
    "id": 103,
    "sheetType": "sde",
    "category": "String Part-II",
    "subcategory": "String Part-II",
    "name": "Compare Version Numbers",
    "difficulty": "Medium",
    "rating": "4.0 / 5",
    "leetcode": "https://leetcode.com/problems/compare-version-numbers/",
    "gfg": "https://www.geeksforgeeks.org/problems/compare-two-version-numbers/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Apple",
      "Nvidia",
      "Zoho"
    ],
    "slug": "compare-version-numbers"
  },
  {
    "id": 104,
    "sheetType": "sde",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "name": "Inorder Traversal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/inorder-traversal/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "TCS"
    ],
    "slug": "binary-tree-inorder-traversal"
  },
  {
    "id": 105,
    "sheetType": "sde",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "name": "Preorder Traversal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/preorder-traversal/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "binary-tree-preorder-traversal"
  },
  {
    "id": 106,
    "sheetType": "sde",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "name": "Postorder Traversal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/postorder-traversal/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "binary-tree-postorder-traversal"
  },
  {
    "id": 107,
    "sheetType": "sde",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "name": "Morris Inorder Traversal",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/inorder-traversal/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "TCS"
    ],
    "slug": "binary-tree-inorder-traversal"
  },
  {
    "id": 108,
    "sheetType": "sde",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "name": "Morris Preorder Traversal",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/preorder-traversal/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "binary-tree-preorder-traversal"
  },
  {
    "id": 109,
    "sheetType": "sde",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "name": "Left View of Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/left-view-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "left-view-of-binary-tree"
  },
  {
    "id": 110,
    "sheetType": "sde",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "name": "Bottom View of Binary Tree",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "bottom-view-of-binary-tree"
  },
  {
    "id": 111,
    "sheetType": "sde",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "name": "Top View of Binary Tree",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/top-view-of-binary-tree/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "top-view-of-binary-tree"
  },
  {
    "id": 112,
    "sheetType": "sde",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "name": "Preorder Inorder Postorder in Single Traversal",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "preorder-inorder-postorder-in-single-traversal"
  },
  {
    "id": 113,
    "sheetType": "sde",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "name": "Vertical Order Traversal",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/print-a-binary-tree-in-vertical-order/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "vertical-order-traversal-of-a-binary-tree"
  },
  {
    "id": 114,
    "sheetType": "sde",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "name": "Root to Node Path in Binary Tree",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-paths/",
    "gfg": "https://www.geeksforgeeks.org/problems/root-to-leaf-paths/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "binary-tree-paths"
  },
  {
    "id": 115,
    "sheetType": "sde",
    "category": "Binary Tree",
    "subcategory": "Binary Tree",
    "name": "Max Width of Binary Tree",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-width-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-width-of-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Flipkart"
    ],
    "slug": "maximum-width-of-binary-tree"
  },
  {
    "id": 116,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "name": "Level Order Traversal",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/level-order-traversal/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "binary-tree-level-order-traversal"
  },
  {
    "id": 117,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "name": "Height of Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/height-of-binary-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "maximum-depth-of-binary-tree"
  },
  {
    "id": 118,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "name": "Diameter of Binary Tree",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/diameter-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/diameter-of-binary-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "diameter-of-binary-tree"
  },
  {
    "id": 119,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "name": "Check if Binary Tree is Height Balanced",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/balanced-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-for-balanced-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "balanced-binary-tree"
  },
  {
    "id": 120,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "name": "Lowest Common Ancestor (LCA)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-binary-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "lowest-common-ancestor-of-a-binary-tree"
  },
  {
    "id": 121,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "name": "Check if Two Trees are Identical",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/same-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/determine-if-two-trees-are-identical/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "same-tree"
  },
  {
    "id": 122,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "name": "Zig Zag Traversal",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/zigzag-tree-traversal/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "binary-tree-zigzag-level-order-traversal"
  },
  {
    "id": 123,
    "sheetType": "sde",
    "category": "Binary Tree Part-II",
    "subcategory": "Binary Tree Part-II",
    "name": "Boundary Traversal",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/boundary-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/boundary-traversal-of-binary-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Adobe"
    ],
    "slug": "boundary-of-binary-tree"
  },
  {
    "id": 124,
    "sheetType": "sde",
    "category": "Binary Tree Part-III",
    "subcategory": "Binary Tree Part-III",
    "name": "Maximum Path Sum",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-path-sum-from-any-node/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "binary-tree-maximum-path-sum"
  },
  {
    "id": 125,
    "sheetType": "sde",
    "category": "Binary Tree Part-III",
    "subcategory": "Binary Tree Part-III",
    "name": "Construct Tree from Preorder and Inorder",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/construct-tree-1/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ],
    "slug": "construct-binary-tree-from-preorder-and-inorder-traversal"
  },
  {
    "id": 126,
    "sheetType": "sde",
    "category": "Binary Tree Part-III",
    "subcategory": "Binary Tree Part-III",
    "name": "Construct Tree from Postorder and Inorder",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/build-a-tree-concept/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Walmart"
    ],
    "slug": "construct-binary-tree-from-inorder-and-postorder-traversal"
  },
  {
    "id": 127,
    "sheetType": "sde",
    "category": "Binary Tree Part-III",
    "subcategory": "Binary Tree Part-III",
    "name": "Symmetric Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/symmetric-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/symmetric-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "symmetric-tree"
  },
  {
    "id": 128,
    "sheetType": "sde",
    "category": "Binary Tree Part-III",
    "subcategory": "Binary Tree Part-III",
    "name": "Flatten Binary Tree to LinkedList",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/flatten-binary-tree-to-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "flatten-binary-tree-to-linked-list"
  },
  {
    "id": 129,
    "sheetType": "sde",
    "category": "Binary Tree Part-III",
    "subcategory": "Binary Tree Part-III",
    "name": "Check for Children Sum Property",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/children-sum-parent/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "check-for-children-sum-property"
  },
  {
    "id": 130,
    "sheetType": "sde",
    "category": "Binary Tree Part-III",
    "subcategory": "Binary Tree Part-III",
    "name": "Invert a Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/invert-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/mirror-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "LinkedIn"
    ],
    "slug": "invert-binary-tree"
  },
  {
    "id": 131,
    "sheetType": "sde",
    "category": "Binary Search Tree",
    "subcategory": "Binary Search Tree",
    "name": "Populating Next Right Pointers in Each Node",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/populating-next-right-pointers-in-each-node/",
    "gfg": "https://www.geeksforgeeks.org/problems/connect-nodes-at-same-level/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "populating-next-right-pointers-in-each-node"
  },
  {
    "id": 132,
    "sheetType": "sde",
    "category": "Binary Search Tree",
    "subcategory": "Binary Search Tree",
    "name": "Search in BST",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/search-in-a-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-a-node-in-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "search-in-a-binary-search-tree"
  },
  {
    "id": 133,
    "sheetType": "sde",
    "category": "Binary Search Tree",
    "subcategory": "Binary Search Tree",
    "name": "Convert Sorted Array to BST",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/array-to-bst4443/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "convert-sorted-array-to-binary-search-tree"
  },
  {
    "id": 134,
    "sheetType": "sde",
    "category": "Binary Search Tree",
    "subcategory": "Binary Search Tree",
    "name": "Construct BST from Preorder Traversal",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/construct-bst-from-postorder/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "construct-binary-search-tree-from-preorder-traversal"
  },
  {
    "id": 135,
    "sheetType": "sde",
    "category": "Binary Search Tree",
    "subcategory": "Binary Search Tree",
    "name": "Validate BST",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/validate-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-for-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "validate-binary-search-tree"
  },
  {
    "id": 136,
    "sheetType": "sde",
    "category": "Binary Search Tree",
    "subcategory": "Binary Search Tree",
    "name": "Lowest Common Ancestor in BST",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "lowest-common-ancestor-of-a-binary-search-tree"
  },
  {
    "id": 137,
    "sheetType": "sde",
    "category": "Binary Search Tree",
    "subcategory": "Binary Search Tree",
    "name": "Inorder Predecessor and Successor in BST",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/inorder-successor-in-bst/",
    "gfg": "https://www.geeksforgeeks.org/problems/predecessor-and-successor/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft"
    ],
    "slug": "inorder-successor-in-bst"
  },
  {
    "id": 138,
    "sheetType": "sde",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "name": "Floor in BST",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/closest-binary-search-tree-value/",
    "gfg": "https://www.geeksforgeeks.org/problems/floor-in-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Microsoft",
      "Uber",
      "Bloomberg",
      "Snapchat"
    ],
    "slug": "floor-in-bst"
  },
  {
    "id": 139,
    "sheetType": "sde",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "name": "Ceil in BST",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/closest-binary-search-tree-value-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/ceil-in-bst/1",
    "companies": [
      "Google",
      "Amazon",
      "LinkedIn"
    ],
    "slug": "closest-binary-search-tree-value-ii"
  },
  {
    "id": 140,
    "sheetType": "sde",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "name": "Kth Smallest Element in BST",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-th-smallest-element-in-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "kth-smallest-element-in-a-bst"
  },
  {
    "id": 141,
    "sheetType": "sde",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "name": "Kth Largest Element in BST",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/kth-largest-element-in-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "kth-largest-element-in-an-array"
  },
  {
    "id": 142,
    "sheetType": "sde",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "name": "Two Sum IV - Input is a BST",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/two-sum-iv-input-is-a-bst/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-a-pair-with-given-target-in-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "two-sum-iv-input-is-a-bst"
  },
  {
    "id": 143,
    "sheetType": "sde",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "name": "BST Iterator",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-search-tree-iterator/",
    "gfg": "https://www.geeksforgeeks.org/problems/binary-search-tree-iterator/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "binary-search-tree-iterator"
  },
  {
    "id": 144,
    "sheetType": "sde",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "name": "Size of Largest BST in Binary Tree",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-sum-bst-in-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/largest-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "maximum-sum-bst-in-binary-tree"
  },
  {
    "id": 145,
    "sheetType": "sde",
    "category": "BST Part-II",
    "subcategory": "BST Part-II",
    "name": "Serialize and Deserialize Binary Tree",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/serialize-and-deserialize-a-binary-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "serialize-and-deserialize-binary-tree"
  },
  {
    "id": 146,
    "sheetType": "sde",
    "category": "Binary Trees [Misc]",
    "subcategory": "Binary Trees [Misc]",
    "name": "Binary Tree to Double LinkedList",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/binary-tree-to-dll/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "binary-tree-to-double-linkedlist"
  },
  {
    "id": 147,
    "sheetType": "sde",
    "category": "Binary Trees [Misc]",
    "subcategory": "Binary Trees [Misc]",
    "name": "Find Median in a Data Stream",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/find-median-from-data-stream/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-median-in-a-stream-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "find-median-from-data-stream"
  },
  {
    "id": 148,
    "sheetType": "sde",
    "category": "Binary Trees [Misc]",
    "subcategory": "Binary Trees [Misc]",
    "name": "Kth Largest Element in a Stream",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
    "gfg": "https://www.geeksforgeeks.org/problems/kth-largest-element-in-a-stream2220/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "kth-largest-element-in-a-stream"
  },
  {
    "id": 149,
    "sheetType": "sde",
    "category": "Binary Trees [Misc]",
    "subcategory": "Binary Trees [Misc]",
    "name": "Kth Largest Element in Unsorted Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-largest-elements4206/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "kth-largest-element-in-an-array"
  },
  {
    "id": 150,
    "sheetType": "sde",
    "category": "Binary Trees [Misc]",
    "subcategory": "Binary Trees [Misc]",
    "name": "Distinct Numbers in Window",
    "difficulty": "Medium",
    "rating": "4.2 / 5",
    "leetcode": "",
    "gfg": "https://www.geeksforgeeks.org/problems/count-distinct-elements-in-every-window/1",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "distinct-numbers-in-window"
  },
  {
    "id": 151,
    "sheetType": "sde",
    "category": "Binary Trees [Misc]",
    "subcategory": "Binary Trees [Misc]",
    "name": "K Most Frequent Elements",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/top-k-frequent-elements/",
    "gfg": "https://www.geeksforgeeks.org/problems/top-k-frequent-elements-in-array/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "top-k-frequent-elements"
  },
  {
    "id": 152,
    "sheetType": "sde",
    "category": "Graph",
    "subcategory": "Graph",
    "name": "Clone Graph",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/clone-graph/",
    "gfg": "https://www.geeksforgeeks.org/problems/clone-a-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "clone-graph"
  },
  {
    "id": 153,
    "sheetType": "sde",
    "category": "Graph",
    "subcategory": "Graph",
    "name": "DFS Traversal of Graph",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-provinces/",
    "gfg": "https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "number-of-provinces"
  },
  {
    "id": 154,
    "sheetType": "sde",
    "category": "Graph",
    "subcategory": "Graph",
    "name": "BFS Traversal of Graph",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/graph-valid-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "LinkedIn"
    ],
    "slug": "graph-valid-tree"
  },
  {
    "id": 155,
    "sheetType": "sde",
    "category": "Graph",
    "subcategory": "Graph",
    "name": "Detect Cycle in Undirected Graph using BFS",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/number-of-provinces/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "number-of-provinces"
  },
  {
    "id": 156,
    "sheetType": "sde",
    "category": "Graph",
    "subcategory": "Graph",
    "name": "Detect Cycle in Undirected Graph using DFS",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/number-of-provinces/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "number-of-provinces"
  },
  {
    "id": 157,
    "sheetType": "sde",
    "category": "Graph",
    "subcategory": "Graph",
    "name": "Detect Cycle in Directed Graph using DFS",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/course-schedule/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "course-schedule"
  },
  {
    "id": 158,
    "sheetType": "sde",
    "category": "Graph",
    "subcategory": "Graph",
    "name": "Detect Cycle in Directed Graph using BFS (Kahn",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/course-schedule-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "course-schedule-ii"
  },
  {
    "id": 159,
    "sheetType": "sde",
    "category": "Graph",
    "subcategory": "Graph",
    "name": "Topological Sort DFS",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/course-schedule-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/topological-sort/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "course-schedule-ii"
  },
  {
    "id": 160,
    "sheetType": "sde",
    "category": "Graph",
    "subcategory": "Graph",
    "name": "Topological Sort BFS",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/course-schedule-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/topological-sort/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "course-schedule-ii"
  },
  {
    "id": 161,
    "sheetType": "sde",
    "category": "Graph",
    "subcategory": "Graph",
    "name": "Number of Islands",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/number-of-islands/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-the-number-of-islands/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "number-of-islands"
  },
  {
    "id": 162,
    "sheetType": "sde",
    "category": "Graph",
    "subcategory": "Graph",
    "name": "Bipartite Check BFS",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/is-graph-bipartite/",
    "gfg": "https://www.geeksforgeeks.org/problems/bipartite-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "is-graph-bipartite"
  },
  {
    "id": 163,
    "sheetType": "sde",
    "category": "Graph",
    "subcategory": "Graph",
    "name": "Bipartite Check DFS",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/is-graph-bipartite/",
    "gfg": "https://www.geeksforgeeks.org/problems/bipartite-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "is-graph-bipartite"
  },
  {
    "id": 164,
    "sheetType": "sde",
    "category": "Graph Part-II",
    "subcategory": "Graph Part-II",
    "name": "Strongly Connected Components (Kosaraju",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/critical-connections-in-a-network/",
    "gfg": "https://www.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Flipkart"
    ],
    "slug": "critical-connections-in-a-network"
  },
  {
    "id": 165,
    "sheetType": "sde",
    "category": "Graph Part-II",
    "subcategory": "Graph Part-II",
    "name": "Dijkstra",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/network-delay-time/",
    "gfg": "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Netflix",
      "Bloomberg"
    ],
    "slug": "network-delay-time"
  },
  {
    "id": 166,
    "sheetType": "sde",
    "category": "Graph Part-II",
    "subcategory": "Graph Part-II",
    "name": "Bellman Ford Algorithm",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
    "gfg": "https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "cheapest-flights-within-k-stops"
  },
  {
    "id": 167,
    "sheetType": "sde",
    "category": "Graph Part-II",
    "subcategory": "Graph Part-II",
    "name": "Floyd Warshall Algorithm",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/",
    "gfg": "https://www.geeksforgeeks.org/problems/floyd-warshall4005/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance"
  },
  {
    "id": 168,
    "sheetType": "sde",
    "category": "Graph Part-II",
    "subcategory": "Graph Part-II",
    "name": "Prim",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/min-cost-to-connect-all-points/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Flipkart"
    ],
    "slug": "min-cost-to-connect-all-points"
  },
  {
    "id": 169,
    "sheetType": "sde",
    "category": "Graph Part-II",
    "subcategory": "Graph Part-II",
    "name": "Kruskal",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/min-cost-to-connect-all-points/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Flipkart"
    ],
    "slug": "min-cost-to-connect-all-points"
  },
  {
    "id": 170,
    "sheetType": "sde",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Max Product Subarray",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/maximum-product-subarray/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-product-subarray3608/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "maximum-product-subarray"
  },
  {
    "id": 171,
    "sheetType": "sde",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Longest Increasing Subsequence (LIS)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-increasing-subsequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-increasing-subsequence-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "longest-increasing-subsequence"
  },
  {
    "id": 172,
    "sheetType": "sde",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Longest Common Subsequence (LCS)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-common-subsequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-common-subsequence-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "longest-common-subsequence"
  },
  {
    "id": 173,
    "sheetType": "sde",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "0-1 Knapsack Problem",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/partition-equal-subset-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0917/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "partition-equal-subset-sum"
  },
  {
    "id": 174,
    "sheetType": "sde",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Edit Distance",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/edit-distance/",
    "gfg": "https://www.geeksforgeeks.org/problems/edit-distance3702/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "edit-distance"
  },
  {
    "id": 175,
    "sheetType": "sde",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Maximum Sum Increasing Subsequence",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-ascending-subarray-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-sum-increasing-subsequence4749/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "TCS"
    ],
    "slug": "maximum-ascending-subarray-sum"
  },
  {
    "id": 176,
    "sheetType": "sde",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Matrix Chain Multiplication (MCM)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/burst-balloons/",
    "gfg": "https://www.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "burst-balloons"
  },
  {
    "id": 177,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "subcategory": "Dynamic Programming Part-II",
    "name": "Minimum Path Sum in Matrix",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/minimum-path-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-cost-path3805/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "minimum-path-sum"
  },
  {
    "id": 178,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "subcategory": "Dynamic Programming Part-II",
    "name": "Coin Change Problem",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/coin-change/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-coins1824/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "coin-change"
  },
  {
    "id": 179,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "subcategory": "Dynamic Programming Part-II",
    "name": "Subset Sum Problem",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/partition-equal-subset-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sum-problem2014/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "partition-equal-subset-sum"
  },
  {
    "id": 180,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "subcategory": "Dynamic Programming Part-II",
    "name": "Rod Cutting Problem",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/integer-break/",
    "gfg": "https://www.geeksforgeeks.org/problems/rod-cutting0840/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "integer-break"
  },
  {
    "id": 181,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "subcategory": "Dynamic Programming Part-II",
    "name": "Egg Dropping Puzzle",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/super-egg-drop/",
    "gfg": "https://www.geeksforgeeks.org/problems/egg-dropping-puzzle-1587115620/1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "super-egg-drop"
  },
  {
    "id": 182,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "subcategory": "Dynamic Programming Part-II",
    "name": "Word Break Problem",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/word-break/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-break1352/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "word-break"
  },
  {
    "id": 183,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "subcategory": "Dynamic Programming Part-II",
    "name": "Palindrome Partitioning II",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/palindrome-partitioning-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/palindromic-patitioning4845/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "palindrome-partitioning-ii"
  },
  {
    "id": 184,
    "sheetType": "sde",
    "category": "Dynamic Programming Part-II",
    "subcategory": "Dynamic Programming Part-II",
    "name": "Maximum Profit in Job Scheduling",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-profit-in-job-scheduling/",
    "gfg": "https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "maximum-profit-in-job-scheduling"
  },
  {
    "id": 185,
    "sheetType": "sde",
    "category": "Trie",
    "subcategory": "Trie",
    "name": "Implement Trie (Prefix Tree)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/implement-trie-prefix-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/trie-insert-and-search0651/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "implement-trie-prefix-tree"
  },
  {
    "id": 186,
    "sheetType": "sde",
    "category": "Trie",
    "subcategory": "Trie",
    "name": "Implement Trie II",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/implement-trie-ii-prefix-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/trie-delete/1",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "slug": "implement-trie-ii-prefix-tree"
  },
  {
    "id": 187,
    "sheetType": "sde",
    "category": "Trie",
    "subcategory": "Trie",
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
    "subcategory": "Trie",
    "name": "Number of Distinct Substrings in String",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-distinct-substrings-in-a-string/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-number-of-substrings4528/1",
    "companies": [
      "Uber",
      "Bloomberg",
      "Intuit"
    ],
    "slug": "number-of-distinct-substrings-in-a-string"
  },
  {
    "id": 189,
    "sheetType": "sde",
    "category": "Trie",
    "subcategory": "Trie",
    "name": "Power Set (All Subsequences)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/subsets/",
    "gfg": "https://www.geeksforgeeks.org/problems/power-set4302/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "subsets"
  },
  {
    "id": 190,
    "sheetType": "sde",
    "category": "Trie",
    "subcategory": "Trie",
    "name": "Maximum XOR of Two Numbers in an Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-xor-of-two-numbers-in-an-array/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "maximum-xor-of-two-numbers-in-an-array"
  },
  {
    "id": 191,
    "sheetType": "sde",
    "category": "Trie",
    "subcategory": "Trie",
    "name": "Maximum XOR With an Element From Array",
    "difficulty": "Hard",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-xor-with-an-element-from-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-xor-with-an-element-from-array/1",
    "companies": [
      "Google"
    ],
    "slug": "maximum-xor-with-an-element-from-array"
  }
];

export const STRIVER_79_SHEET_DATA: DSAProblem[] = [
  {
    "id": 1,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "subcategory": "Arrays and Hashing",
    "name": "Two Sum",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/two-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/key-pair5610/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "two-sum"
  },
  {
    "id": 2,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "subcategory": "Arrays and Hashing",
    "name": "Valid Anagram",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/valid-anagram/",
    "gfg": "https://www.geeksforgeeks.org/problems/anagram-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "valid-anagram"
  },
  {
    "id": 3,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "subcategory": "Arrays and Hashing",
    "name": "Group Anagrams",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/group-anagrams/",
    "gfg": "https://www.geeksforgeeks.org/problems/print-anagrams-together/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "group-anagrams"
  },
  {
    "id": 4,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "subcategory": "Arrays and Hashing",
    "name": "Top K Frequent Elements",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/top-k-frequent-elements/",
    "gfg": "https://www.geeksforgeeks.org/problems/top-k-frequent-elements-in-array/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "top-k-frequent-elements"
  },
  {
    "id": 5,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "subcategory": "Arrays and Hashing",
    "name": "Product of Array Except Self",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/product-of-array-except-self/",
    "gfg": "https://www.geeksforgeeks.org/problems/a-difference-of-values-and-indexes0539/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "product-of-array-except-self"
  },
  {
    "id": 6,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "subcategory": "Arrays and Hashing",
    "name": "Longest Consecutive Sequence",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-consecutive-sequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-consecutive-subsequence2421/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "longest-consecutive-sequence"
  },
  {
    "id": 7,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "subcategory": "Arrays and Hashing",
    "name": "Sort Colors (Dutch National Flag)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/sort-colors/",
    "gfg": "https://www.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s4231/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "sort-colors"
  },
  {
    "id": 8,
    "sheetType": "79",
    "category": "Arrays and Hashing",
    "subcategory": "Arrays and Hashing",
    "name": "Best Time to Buy and Sell Stock",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "gfg": "https://www.geeksforgeeks.org/problems/stock-buy-and-sell2615/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "best-time-to-buy-and-sell-stock"
  },
  {
    "id": 9,
    "sheetType": "79",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "Binary Search",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-search/",
    "gfg": "https://www.geeksforgeeks.org/problems/binary-search-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "binary-search"
  },
  {
    "id": 10,
    "sheetType": "79",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "Search in Rotated Sorted Array",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-a-rotated-array4618/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "search-in-rotated-sorted-array"
  },
  {
    "id": 11,
    "sheetType": "79",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "Find Minimum in Rotated Sorted Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/minimum-element-in-a-sorted-and-rotated-array3626/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "find-minimum-in-rotated-sorted-array"
  },
  {
    "id": 12,
    "sheetType": "79",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "Koko Eating Bananas",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/koko-eating-bananas/",
    "gfg": "https://www.geeksforgeeks.org/problems/koko-eating-bananas/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "koko-eating-bananas"
  },
  {
    "id": 13,
    "sheetType": "79",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "Search a 2D Matrix",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix/",
    "gfg": "https://www.geeksforgeeks.org/problems/search-in-a-matrix-1587115621/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "search-a-2d-matrix"
  },
  {
    "id": 14,
    "sheetType": "79",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "Median of Two Sorted Arrays",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    "gfg": "https://www.geeksforgeeks.org/problems/median-of-2-sorted-arrays-of-different-sizes/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "median-of-two-sorted-arrays"
  },
  {
    "id": 15,
    "sheetType": "79",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "Capacity to Ship Packages Within D Days",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
    "gfg": "https://www.geeksforgeeks.org/problems/capacity-to-ship-packages-within-d-days/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "capacity-to-ship-packages-within-d-days"
  },
  {
    "id": 16,
    "sheetType": "79",
    "category": "Binary Search",
    "subcategory": "Binary Search",
    "name": "Aggressive Cows",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/magnetic-force-between-two-balls/",
    "gfg": "https://www.geeksforgeeks.org/problems/aggressive-cows/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "magnetic-force-between-two-balls"
  },
  {
    "id": 17,
    "sheetType": "79",
    "category": "Linked List",
    "subcategory": "Linked List",
    "name": "Reverse Linked List",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "reverse-linked-list"
  },
  {
    "id": 18,
    "sheetType": "79",
    "category": "Linked List",
    "subcategory": "Linked List",
    "name": "Merge Two Sorted Lists",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/merge-two-sorted-lists/",
    "gfg": "https://www.geeksforgeeks.org/problems/merge-two-sorted-linked-lists/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "merge-two-sorted-lists"
  },
  {
    "id": 19,
    "sheetType": "79",
    "category": "Linked List",
    "subcategory": "Linked List",
    "name": "Reorder List",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/reorder-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/reorder-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "reorder-list"
  },
  {
    "id": 20,
    "sheetType": "79",
    "category": "Linked List",
    "subcategory": "Linked List",
    "name": "Remove Nth Node From End of List",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    "gfg": "https://www.geeksforgeeks.org/problems/nth-node-from-end-of-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "remove-nth-node-from-end-of-list"
  },
  {
    "id": 21,
    "sheetType": "79",
    "category": "Linked List",
    "subcategory": "Linked List",
    "name": "Detect Cycle in Linked List",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle/",
    "gfg": "https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "linked-list-cycle"
  },
  {
    "id": 22,
    "sheetType": "79",
    "category": "Linked List",
    "subcategory": "Linked List",
    "name": "LRU Cache",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/lru-cache/",
    "gfg": "https://www.geeksforgeeks.org/problems/lru-cache/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "lru-cache"
  },
  {
    "id": 23,
    "sheetType": "79",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "name": "Subsets",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/subsets/",
    "gfg": "https://www.geeksforgeeks.org/problems/power-set4302/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "subsets"
  },
  {
    "id": 24,
    "sheetType": "79",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "name": "Combination Sum",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/combination-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/combination-sum-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "combination-sum"
  },
  {
    "id": 25,
    "sheetType": "79",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "name": "Permutations",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/permutations/",
    "gfg": "https://www.geeksforgeeks.org/problems/permutations-of-a-given-string2041/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "permutations"
  },
  {
    "id": 26,
    "sheetType": "79",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "name": "N-Queens",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/n-queens/",
    "gfg": "https://www.geeksforgeeks.org/problems/n-queen-problem0315/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "n-queens"
  },
  {
    "id": 27,
    "sheetType": "79",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "name": "Word Search",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/word-search/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-search/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "word-search"
  },
  {
    "id": 28,
    "sheetType": "79",
    "category": "Recursion and Backtracking",
    "subcategory": "Recursion and Backtracking",
    "name": "Palindrome Partitioning",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/palindrome-partitioning/",
    "gfg": "https://www.geeksforgeeks.org/problems/palindrome-partitioning3622/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Infosys"
    ],
    "slug": "palindrome-partitioning"
  },
  {
    "id": 29,
    "sheetType": "79",
    "category": "Stacks/Queues",
    "subcategory": "Stacks/Queues",
    "name": "Valid Parentheses",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/valid-parentheses/",
    "gfg": "https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "valid-parentheses"
  },
  {
    "id": 30,
    "sheetType": "79",
    "category": "Stacks/Queues",
    "subcategory": "Stacks/Queues",
    "name": "Min Stack",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/min-stack/",
    "gfg": "https://www.geeksforgeeks.org/problems/get-minimum-element-from-stack/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "min-stack"
  },
  {
    "id": 31,
    "sheetType": "79",
    "category": "Stacks/Queues",
    "subcategory": "Stacks/Queues",
    "name": "Evaluate Reverse Polish Notation",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
    "gfg": "https://www.geeksforgeeks.org/problems/evaluation-of-postfix-expression1735/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "evaluate-reverse-polish-notation"
  },
  {
    "id": 32,
    "sheetType": "79",
    "category": "Stacks/Queues",
    "subcategory": "Stacks/Queues",
    "name": "Daily Temperatures",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/daily-temperatures/",
    "gfg": "https://www.geeksforgeeks.org/problems/next-larger-element-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "daily-temperatures"
  },
  {
    "id": 33,
    "sheetType": "79",
    "category": "Stacks/Queues",
    "subcategory": "Stacks/Queues",
    "name": "Car Fleet",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/car-fleet/",
    "gfg": "https://www.geeksforgeeks.org/problems/car-fleet/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "car-fleet"
  },
  {
    "id": 34,
    "sheetType": "79",
    "category": "Stacks/Queues",
    "subcategory": "Stacks/Queues",
    "name": "Largest Rectangle in Histogram",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-rectangular-area-in-a-histogram-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "largest-rectangle-in-histogram"
  },
  {
    "id": 35,
    "sheetType": "79",
    "category": "Heaps",
    "subcategory": "Heaps",
    "name": "Kth Largest Element in an Array",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-largest-elements4206/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "kth-largest-element-in-an-array"
  },
  {
    "id": 36,
    "sheetType": "79",
    "category": "Heaps",
    "subcategory": "Heaps",
    "name": "Task Scheduler",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/task-scheduler/",
    "gfg": "https://www.geeksforgeeks.org/problems/task-scheduler/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "task-scheduler"
  },
  {
    "id": 37,
    "sheetType": "79",
    "category": "Heaps",
    "subcategory": "Heaps",
    "name": "Find Median from Data Stream",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/find-median-from-data-stream/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-median-in-a-stream-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "find-median-from-data-stream"
  },
  {
    "id": 38,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "subcategory": "Trees (BT + BST)",
    "name": "Invert Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/invert-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/mirror-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "LinkedIn"
    ],
    "slug": "invert-binary-tree"
  },
  {
    "id": 39,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "subcategory": "Trees (BT + BST)",
    "name": "Maximum Depth of Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/height-of-binary-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "maximum-depth-of-binary-tree"
  },
  {
    "id": 40,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "subcategory": "Trees (BT + BST)",
    "name": "Diameter of Binary Tree",
    "difficulty": "Easy",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/diameter-of-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/diameter-of-binary-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "diameter-of-binary-tree"
  },
  {
    "id": 41,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "subcategory": "Trees (BT + BST)",
    "name": "Balanced Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/balanced-binary-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-for-balanced-tree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "balanced-binary-tree"
  },
  {
    "id": 42,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "subcategory": "Trees (BT + BST)",
    "name": "Same Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/same-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/determine-if-two-trees-are-identical/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "same-tree"
  },
  {
    "id": 43,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "subcategory": "Trees (BT + BST)",
    "name": "Subtree of Another Tree",
    "difficulty": "Easy",
    "rating": "4.2 / 5",
    "leetcode": "https://leetcode.com/problems/subtree-of-another-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-if-subtree/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "eBay"
    ],
    "slug": "subtree-of-another-tree"
  },
  {
    "id": 44,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "subcategory": "Trees (BT + BST)",
    "name": "Lowest Common Ancestor of BST",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "lowest-common-ancestor-of-a-binary-search-tree"
  },
  {
    "id": 45,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "subcategory": "Trees (BT + BST)",
    "name": "Binary Tree Level Order Traversal",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    "gfg": "https://www.geeksforgeeks.org/problems/level-order-traversal/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "binary-tree-level-order-traversal"
  },
  {
    "id": 46,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "subcategory": "Trees (BT + BST)",
    "name": "Validate Binary Search Tree",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/validate-binary-search-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/check-for-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "validate-binary-search-tree"
  },
  {
    "id": 47,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "subcategory": "Trees (BT + BST)",
    "name": "Kth Smallest Element in BST",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    "gfg": "https://www.geeksforgeeks.org/problems/k-th-smallest-element-in-bst/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "kth-smallest-element-in-a-bst"
  },
  {
    "id": 48,
    "sheetType": "79",
    "category": "Trees (BT + BST)",
    "subcategory": "Trees (BT + BST)",
    "name": "Binary Tree Maximum Path Sum",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-path-sum-from-any-node/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "binary-tree-maximum-path-sum"
  },
  {
    "id": 49,
    "sheetType": "79",
    "category": "Graphs",
    "subcategory": "Graphs",
    "name": "Number of Islands",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/number-of-islands/",
    "gfg": "https://www.geeksforgeeks.org/problems/find-the-number-of-islands/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "number-of-islands"
  },
  {
    "id": 50,
    "sheetType": "79",
    "category": "Graphs",
    "subcategory": "Graphs",
    "name": "Clone Graph",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/clone-graph/",
    "gfg": "https://www.geeksforgeeks.org/problems/clone-a-graph/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "clone-graph"
  },
  {
    "id": 51,
    "sheetType": "79",
    "category": "Graphs",
    "subcategory": "Graphs",
    "name": "Max Area of Island",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/max-area-of-island/",
    "gfg": "https://www.geeksforgeeks.org/problems/max-area-of-island/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "max-area-of-island"
  },
  {
    "id": 52,
    "sheetType": "79",
    "category": "Graphs",
    "subcategory": "Graphs",
    "name": "Pacific Atlantic Water Flow",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    "gfg": "https://www.geeksforgeeks.org/problems/pacific-atlantic-water-flow/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ],
    "slug": "pacific-atlantic-water-flow"
  },
  {
    "id": 53,
    "sheetType": "79",
    "category": "Graphs",
    "subcategory": "Graphs",
    "name": "Surrounded Regions",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/surrounded-regions/",
    "gfg": "https://www.geeksforgeeks.org/problems/replace-o-with-x4256/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "surrounded-regions"
  },
  {
    "id": 54,
    "sheetType": "79",
    "category": "Graphs",
    "subcategory": "Graphs",
    "name": "Rotting Oranges",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/rotting-oranges/",
    "gfg": "https://www.geeksforgeeks.org/problems/rotting-oranges2536/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "rotting-oranges"
  },
  {
    "id": 55,
    "sheetType": "79",
    "category": "Graphs",
    "subcategory": "Graphs",
    "name": "Course Schedule",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/course-schedule/",
    "gfg": "https://www.geeksforgeeks.org/problems/prerequisite-tasks/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "course-schedule"
  },
  {
    "id": 56,
    "sheetType": "79",
    "category": "Graphs",
    "subcategory": "Graphs",
    "name": "Course Schedule II",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/course-schedule-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/course-schedule/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "course-schedule-ii"
  },
  {
    "id": 57,
    "sheetType": "79",
    "category": "Graphs",
    "subcategory": "Graphs",
    "name": "Redundant Connection",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/redundant-connection/",
    "gfg": "https://www.geeksforgeeks.org/problems/redundant-connection/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "redundant-connection"
  },
  {
    "id": 58,
    "sheetType": "79",
    "category": "Graphs",
    "subcategory": "Graphs",
    "name": "Word Ladder",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/word-ladder/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-ladder/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "word-ladder"
  },
  {
    "id": 59,
    "sheetType": "79",
    "category": "Graphs",
    "subcategory": "Graphs",
    "name": "Network Delay Time",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/network-delay-time/",
    "gfg": "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Netflix",
      "Bloomberg"
    ],
    "slug": "network-delay-time"
  },
  {
    "id": 60,
    "sheetType": "79",
    "category": "Graphs",
    "subcategory": "Graphs",
    "name": "Alien Dictionary",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/alien-dictionary/",
    "gfg": "https://www.geeksforgeeks.org/problems/alien-dictionary/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "alien-dictionary"
  },
  {
    "id": 61,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Climbing Stairs",
    "difficulty": "Easy",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/climbing-stairs/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-ways-to-reach-the-nth-stair-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "climbing-stairs"
  },
  {
    "id": 62,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "House Robber",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/house-robber/",
    "gfg": "https://www.geeksforgeeks.org/problems/max-sum-without-adjacents2430/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "house-robber"
  },
  {
    "id": 63,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "House Robber II",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/house-robber-ii/",
    "gfg": "https://www.geeksforgeeks.org/problems/house-robber-ii/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "house-robber-ii"
  },
  {
    "id": 64,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Longest Palindromic Substring",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-palindromic-substring/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-palindromic-substring0857/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "longest-palindromic-substring"
  },
  {
    "id": 65,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Palindromic Substrings",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/palindromic-substrings/",
    "gfg": "https://www.geeksforgeeks.org/problems/count-palindromic-subsequences/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "palindromic-substrings"
  },
  {
    "id": 66,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Coin Change",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/coin-change/",
    "gfg": "https://www.geeksforgeeks.org/problems/number-of-coins1824/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "coin-change"
  },
  {
    "id": 67,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Maximum Product Subarray",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/maximum-product-subarray/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-product-subarray3608/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "maximum-product-subarray"
  },
  {
    "id": 68,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Word Break",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/word-break/",
    "gfg": "https://www.geeksforgeeks.org/problems/word-break1352/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "word-break"
  },
  {
    "id": 69,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Longest Increasing Subsequence",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-increasing-subsequence/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-increasing-subsequence-1587115620/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "longest-increasing-subsequence"
  },
  {
    "id": 70,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Partition Equal Subset Sum",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/partition-equal-subset-sum/",
    "gfg": "https://www.geeksforgeeks.org/problems/subset-sum-problem2014/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "partition-equal-subset-sum"
  },
  {
    "id": 71,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Edit Distance",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/edit-distance/",
    "gfg": "https://www.geeksforgeeks.org/problems/edit-distance3702/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "edit-distance"
  },
  {
    "id": 72,
    "sheetType": "79",
    "category": "Dynamic Programming",
    "subcategory": "Dynamic Programming",
    "name": "Burst Balloons",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/burst-balloons/",
    "gfg": "https://www.geeksforgeeks.org/problems/burst-balloons/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "burst-balloons"
  },
  {
    "id": 73,
    "sheetType": "79",
    "category": "Tries",
    "subcategory": "Tries",
    "name": "Implement Trie (Prefix Tree)",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/implement-trie-prefix-tree/",
    "gfg": "https://www.geeksforgeeks.org/problems/trie-insert-and-search0651/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "implement-trie-prefix-tree"
  },
  {
    "id": 74,
    "sheetType": "79",
    "category": "Tries",
    "subcategory": "Tries",
    "name": "Design Add and Search Words Data Structure",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
    "gfg": "https://www.geeksforgeeks.org/problems/trie-insert-and-search0651/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "design-add-and-search-words-data-structure"
  },
  {
    "id": 75,
    "sheetType": "79",
    "category": "Tries",
    "subcategory": "Tries",
    "name": "Maximum XOR of Two Numbers in an Array",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
    "gfg": "https://www.geeksforgeeks.org/problems/maximum-xor-of-two-numbers-in-an-array/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "maximum-xor-of-two-numbers-in-an-array"
  },
  {
    "id": 76,
    "sheetType": "79",
    "category": "String",
    "subcategory": "String",
    "name": "Longest Substring Without Repeating Characters",
    "difficulty": "Medium",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "gfg": "https://www.geeksforgeeks.org/problems/length-of-the-longest-substring3036/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "longest-substring-without-repeating-characters"
  },
  {
    "id": 77,
    "sheetType": "79",
    "category": "String",
    "subcategory": "String",
    "name": "Longest Repeating Character Replacement",
    "difficulty": "Medium",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/longest-repeating-character-replacement/",
    "gfg": "https://www.geeksforgeeks.org/problems/longest-repeating-character-replacement/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "longest-repeating-character-replacement"
  },
  {
    "id": 78,
    "sheetType": "79",
    "category": "String",
    "subcategory": "String",
    "name": "Minimum Window Substring",
    "difficulty": "Hard",
    "rating": "5.0 / 5 (Must Do)",
    "leetcode": "https://leetcode.com/problems/minimum-window-substring/",
    "gfg": "https://www.geeksforgeeks.org/problems/smallest-window-in-a-string-containing-all-the-characters-of-another-string-1587115621/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "minimum-window-substring"
  },
  {
    "id": 79,
    "sheetType": "79",
    "category": "String",
    "subcategory": "String",
    "name": "Valid Palindrome",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/valid-palindrome/",
    "gfg": "https://www.geeksforgeeks.org/problems/string-palindrome4521/1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "valid-palindrome"
  }
];
export const SDETUBE_79_SHEET_DATA: DSAProblem[] = STRIVER_79_SHEET_DATA;

export const A2Z_DSA_SHEET_474_DATA: DSAProblem[] = [
  {
    "id": 1,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "name": "Input Output",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/EAR7De6Goz4?t=250",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "input-output"
  },
  {
    "id": 2,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "name": "Cpp Basics",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/EAR7De6Goz4?t=2415",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "cpp-basics"
  },
  {
    "id": 3,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "name": "If ElseIf",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/EAR7De6Goz4?t=1259",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "if-elseif"
  },
  {
    "id": 4,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "name": "Switch Case",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/EAR7De6Goz4",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "switch-case"
  },
  {
    "id": 5,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "name": "What are arrays, strings?",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/EAR7De6Goz4?t=2415",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "what-are-arrays-strings"
  },
  {
    "id": 6,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "name": "For loops",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/EAR7De6Goz4?t=3096",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "for-loops"
  },
  {
    "id": 7,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "name": "While loops",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/EAR7De6Goz4?t=3459",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "while-loops"
  },
  {
    "id": 8,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "name": "Functions (Pass by Reference and Value)",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/EAR7De6Goz4?t=3677",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "functions-pass-by-reference-and-value"
  },
  {
    "id": 9,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Things to Know in C++/Java/Python or any language",
    "name": "Theory with examples",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/FPu9Uld7W-E",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "theory-with-examples"
  },
  {
    "id": 10,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Build-up Logical Thinking",
    "name": "Easy and Medium",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "easy-and-medium"
  },
  {
    "id": 11,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Build-up Logical Thinking",
    "name": "Hard",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "hard"
  },
  {
    "id": 12,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 1",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-1"
  },
  {
    "id": 13,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 2",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-2"
  },
  {
    "id": 14,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 3",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-3"
  },
  {
    "id": 15,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 4",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-4"
  },
  {
    "id": 16,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 5",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-5"
  },
  {
    "id": 17,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 6",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-6"
  },
  {
    "id": 18,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 7",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-7"
  },
  {
    "id": 19,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 8",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-8"
  },
  {
    "id": 20,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 9",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-9"
  },
  {
    "id": 21,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 10",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-10"
  },
  {
    "id": 22,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 11",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-11"
  },
  {
    "id": 23,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 12",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-12"
  },
  {
    "id": 24,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 13",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-13"
  },
  {
    "id": 25,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 14",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-14"
  },
  {
    "id": 26,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 15",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-15"
  },
  {
    "id": 27,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 16",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-16"
  },
  {
    "id": 28,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 17",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-17"
  },
  {
    "id": 29,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 18",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-18"
  },
  {
    "id": 30,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 19",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pattern-19"
  },
  {
    "id": 31,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 20",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "pattern-20"
  },
  {
    "id": 32,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 21",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "pattern-21"
  },
  {
    "id": 33,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Patterns",
    "name": "Pattern 22",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "pattern-22"
  },
  {
    "id": 34,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn STL/Java-Collections or similar thing in your             language",
    "name": "STL",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=RRVYpIET_RU",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "stl"
  },
  {
    "id": 35,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn STL/Java-Collections or similar thing in your             language",
    "name": "Java Collections",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "java-collections"
  },
  {
    "id": 36,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Know Basic Maths",
    "name": "Count all Digits of a Number",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/1xNbjMdbjug",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "count-all-digits-of-a-number"
  },
  {
    "id": 37,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Know Basic Maths",
    "name": "Reverse a number",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-integer/",
    "gfg": "",
    "youtube": "https://youtu.be/1xNbjMdbjug?t=930",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "reverse-integer"
  },
  {
    "id": 38,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Know Basic Maths",
    "name": "Palindrome Number",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/palindrome-number/",
    "gfg": "",
    "youtube": "https://youtu.be/1xNbjMdbjug?t=1230",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "palindrome-number"
  },
  {
    "id": 39,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Know Basic Maths",
    "name": "GCD of Two Numbers",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/1xNbjMdbjug?t=2684",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "gcd-of-two-numbers"
  },
  {
    "id": 40,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Know Basic Maths",
    "name": "Check if the Number is Armstrong",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/armstrong-number/",
    "gfg": "",
    "youtube": "https://youtu.be/1xNbjMdbjug?t=1418",
    "companies": [
      "Amazon"
    ],
    "slug": "armstrong-number"
  },
  {
    "id": 41,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Know Basic Maths",
    "name": "Print all Divisors",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/1xNbjMdbjug?t=1580",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "print-all-divisors"
  },
  {
    "id": 42,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Know Basic Maths",
    "name": "Check for Prime Number",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/1xNbjMdbjug?t=2381",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "check-for-prime-number"
  },
  {
    "id": 43,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "name": "Understand recursion by print something N times",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=yVdKa8dnKiE&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "understand-recursion-by-print-something-n-times"
  },
  {
    "id": 44,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "name": "Print name N times using recursion",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=un6PLygfXrA&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=2",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "print-name-n-times-using-recursion"
  },
  {
    "id": 45,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "name": "Print 1 to N using Recursion",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=un6PLygfXrA&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=2",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "print-1-to-n-using-recursion"
  },
  {
    "id": 46,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "name": "Print N to 1 using Recursion",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=un6PLygfXrA&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=2",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "print-n-to-1-using-recursion"
  },
  {
    "id": 47,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "name": "Sum of First N Numbers",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=69ZCDFy-OUo&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "sum-of-first-n-numbers"
  },
  {
    "id": 48,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "name": "Factorial of a given number",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=69ZCDFy-OUo&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "factorial-of-a-given-number"
  },
  {
    "id": 49,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "name": "Reverse an array",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=twuC1F6gLI8&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=4",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "reverse-an-array"
  },
  {
    "id": 50,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "name": "Check if String is Palindrome or Not",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/valid-palindrome/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=twuC1F6gLI8&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=4",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "valid-palindrome"
  },
  {
    "id": 51,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Recursion",
    "name": "Fibonacci Number",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/fibonacci-number/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=kvRjNm4rVBE&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=5",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "fibonacci-number"
  },
  {
    "id": 52,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Hashing",
    "name": "Basic Hashing",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=KEs5UyBJ39g",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "basic-hashing"
  },
  {
    "id": 53,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Hashing",
    "name": "Counting Frequencies of Array Elements",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "counting-frequencies-of-array-elements"
  },
  {
    "id": 54,
    "sheetType": "a2z",
    "category": "Step 1: Learn the basics",
    "subcategory": "Learn Basic Hashing",
    "name": "Highest Occurring Element in an Array",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/frequency-of-the-most-frequent-element/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "frequency-of-the-most-frequent-element"
  },
  {
    "id": 55,
    "sheetType": "a2z",
    "category": "Step 2: Learn Important Sorting Techniques",
    "subcategory": "Sorting-I",
    "name": "Selection Sort",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/HGk_ypEuS24?t=167",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "selection-sort"
  },
  {
    "id": 56,
    "sheetType": "a2z",
    "category": "Step 2: Learn Important Sorting Techniques",
    "subcategory": "Sorting-I",
    "name": "Bubble Sort",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/HGk_ypEuS24?t=1061",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "bubble-sort"
  },
  {
    "id": 57,
    "sheetType": "a2z",
    "category": "Step 2: Learn Important Sorting Techniques",
    "subcategory": "Sorting-I",
    "name": "Insertion Sorting",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/HGk_ypEuS24?t=1900",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "insertion-sorting"
  },
  {
    "id": 58,
    "sheetType": "a2z",
    "category": "Step 2: Learn Important Sorting Techniques",
    "subcategory": "Sorting-II",
    "name": "Merge Sorting",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/ogjf7ORKfd8",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "merge-sorting"
  },
  {
    "id": 59,
    "sheetType": "a2z",
    "category": "Step 2: Learn Important Sorting Techniques",
    "subcategory": "Sorting-II",
    "name": "Recursive Bubble Sort",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "recursive-bubble-sort"
  },
  {
    "id": 60,
    "sheetType": "a2z",
    "category": "Step 2: Learn Important Sorting Techniques",
    "subcategory": "Sorting-II",
    "name": "Recursive Insertion Sort",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "recursive-insertion-sort"
  },
  {
    "id": 61,
    "sheetType": "a2z",
    "category": "Step 2: Learn Important Sorting Techniques",
    "subcategory": "Sorting-II",
    "name": "Quick Sorting",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/WIrA4YexLRQ",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "quick-sorting"
  },
  {
    "id": 62,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "name": "Largest Element",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/37E9ckMDdTk?t=526",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "largest-element"
  },
  {
    "id": 63,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "name": "Second Largest Element",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/37E9ckMDdTk?t=810",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "second-largest-element"
  },
  {
    "id": 64,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "name": "Check if the Array is Sorted II",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/#:~:text=Input%3A%20nums%20%3D%20%5B2%2C,no%20rotation)%20to%20make%20nums.",
    "gfg": "",
    "youtube": "https://youtu.be/37E9ckMDdTk?t=17224",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Infosys"
    ],
    "slug": "check-if-array-is-sorted-and-rotated"
  },
  {
    "id": 65,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "name": "Remove duplicates from Sorted array",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/#:~:text=Input%3A%20nums%20%3D%20%5B0%2C,%2C%203%2C%20and%204%20respectively.",
    "gfg": "",
    "youtube": "https://youtu.be/37E9ckMDdTk?t=1887",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "remove-duplicates-from-sorted-array"
  },
  {
    "id": 66,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "name": "Left Rotate Array by One",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/rotate-array/",
    "gfg": "",
    "youtube": "https://youtu.be/wvcQg43_V8U?t=61",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "rotate-array"
  },
  {
    "id": 67,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "name": "Left Rotate Array by K Places",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/rotate-array/",
    "gfg": "",
    "youtube": "https://youtu.be/wvcQg43_V8U?t=485",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "rotate-array"
  },
  {
    "id": 68,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "name": "Move Zeros to End",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/move-zeroes/",
    "gfg": "",
    "youtube": "https://youtu.be/wvcQg43_V8U?t=1633",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "move-zeroes"
  },
  {
    "id": 69,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "name": "Linear Search",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/wvcQg43_V8U?t=2465",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "linear-search"
  },
  {
    "id": 70,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "name": "Union of two sorted arrays",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/wvcQg43_V8U?t=2584",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "union-of-two-sorted-arrays"
  },
  {
    "id": 71,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "name": "Find missing number",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "find-missing-number"
  },
  {
    "id": 72,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "name": "Maximum Consecutive Ones",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/max-consecutive-ones/",
    "gfg": "",
    "youtube": "https://youtu.be/bYWLJb3vCWY?t=1124",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "max-consecutive-ones"
  },
  {
    "id": 73,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "name": "Find the number that appears once, and other numbers twice.",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/single-number/",
    "gfg": "",
    "youtube": "https://youtu.be/bYWLJb3vCWY?t=1369",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ],
    "slug": "single-number"
  },
  {
    "id": 74,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "name": "Longest subarray with given sum K(positives)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=frf7qxiN2qU&feature=youtu.be",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "longest-subarray-with-given-sum-k-positives"
  },
  {
    "id": 75,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Easy",
    "name": "Longest subarray with sum K",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/frf7qxiN2qU",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "longest-subarray-with-sum-k"
  },
  {
    "id": 76,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "name": "Two Sum",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/two-sum/",
    "gfg": "",
    "youtube": "https://youtu.be/UXDSeD9mN-k",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "two-sum"
  },
  {
    "id": 77,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "name": "Sort an array of 0's 1's and 2's",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/sort-colors/",
    "gfg": "",
    "youtube": "https://youtu.be/tp8JIuCXBaU",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "sort-colors"
  },
  {
    "id": 78,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "name": "Majority Element-I",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/majority-element/",
    "gfg": "",
    "youtube": "https://youtu.be/nP_ns3uSh80",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "majority-element"
  },
  {
    "id": 79,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "name": "Kadane's Algorithm",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-subarray/",
    "gfg": "",
    "youtube": "https://youtu.be/AHZpyENo7k4?si=QJpof4R1hHokm1hw",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "maximum-subarray"
  },
  {
    "id": 80,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "name": "Print subarray with maximum subarray sum (extended version of above problem)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/AHZpyENo7k4",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "print-subarray-with-maximum-subarray-sum-extended-version-of-above-problem"
  },
  {
    "id": 81,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "name": "Stock Buy and Sell",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "gfg": "",
    "youtube": "https://youtu.be/excAOvwF_Wk",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "best-time-to-buy-and-sell-stock"
  },
  {
    "id": 82,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "name": "Rearrange array elements by sign",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/rearrange-array-elements-by-sign/",
    "gfg": "",
    "youtube": "https://youtu.be/h4aBagy4Uok",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Infosys"
    ],
    "slug": "rearrange-array-elements-by-sign"
  },
  {
    "id": 83,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "name": "Next Permutation",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/next-permutation/",
    "gfg": "",
    "youtube": "https://youtu.be/JDOXKqF60RQ",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "next-permutation"
  },
  {
    "id": 84,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "name": "Leaders in an Array",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/cHrH9CQ8pmY",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "leaders-in-an-array"
  },
  {
    "id": 85,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "name": "Longest Consecutive Sequence in an Array",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/longest-consecutive-sequence/solution/",
    "gfg": "",
    "youtube": "https://youtu.be/oO5uLE7EUlM",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "longest-consecutive-sequence"
  },
  {
    "id": 86,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "name": "Set Matrix Zeroes",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/set-matrix-zeroes/",
    "gfg": "",
    "youtube": "https://youtu.be/N0MgLvceX7M",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "set-matrix-zeroes"
  },
  {
    "id": 87,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "name": "Rotate matrix by 90 degrees",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/rotate-image/",
    "gfg": "",
    "youtube": "https://youtu.be/Z0R2u6gd3GU",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "rotate-image"
  },
  {
    "id": 88,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "name": "Print the matrix in spiral manner",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/spiral-matrix/",
    "gfg": "",
    "youtube": "https://youtu.be/3Zv-s9UUrFM",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "spiral-matrix"
  },
  {
    "id": 89,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Medium",
    "name": "Count subarrays with given sum",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/subarray-sum-equals-k/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=xvNwoz-ufXA&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=32",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "subarray-sum-equals-k"
  },
  {
    "id": 90,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "name": "Pascal's Triangle I",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/pascals-triangle/",
    "gfg": "",
    "youtube": "https://youtu.be/bR7mQgwQ_o8",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "pascals-triangle"
  },
  {
    "id": 91,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "name": "Majority Element-II",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/majority-element-ii/",
    "gfg": "",
    "youtube": "https://youtu.be/vwZj1K0e9U8",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "majority-element-ii"
  },
  {
    "id": 92,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "name": "3 Sum",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/3sum/",
    "gfg": "",
    "youtube": "https://youtu.be/DhFh8Kw7ymk",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "3sum"
  },
  {
    "id": 93,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "name": "4 Sum",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/4sum/",
    "gfg": "",
    "youtube": "https://youtu.be/eD95WRfh81c",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "4sum"
  },
  {
    "id": 94,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "name": "Largest Subarray with Sum 0",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=xmguZ6GbatA&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=23",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "largest-subarray-with-sum-0"
  },
  {
    "id": 95,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "name": "Count subarrays with given xor K",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/eZr-6p0B7ME",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "count-subarrays-with-given-xor-k"
  },
  {
    "id": 96,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "name": "Merge Overlapping Subintervals",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/merge-intervals/",
    "gfg": "",
    "youtube": "https://youtu.be/IexN60k62jo",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "merge-intervals"
  },
  {
    "id": 97,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "name": "Merge two sorted arrays without extra space",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/merge-sorted-array/",
    "gfg": "",
    "youtube": "https://youtu.be/n7uwj04E0I4",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "merge-sorted-array"
  },
  {
    "id": 98,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "name": "Find the repeating and missing number",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/2D0D8HE6uak",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "find-the-repeating-and-missing-number"
  },
  {
    "id": 99,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "name": "Count Inversions",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/AseUmwVNaoY",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "count-inversions"
  },
  {
    "id": 100,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "name": "Reverse Pairs",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-pairs/",
    "gfg": "",
    "youtube": "https://youtu.be/0e4bZaP3MDI",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "reverse-pairs"
  },
  {
    "id": 101,
    "sheetType": "a2z",
    "category": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
    "subcategory": "Hard",
    "name": "Maximum Product Subarray in an Array",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-product-subarray/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "maximum-product-subarray"
  },
  {
    "id": 102,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "name": "Search X in sorted array",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-search/",
    "gfg": "",
    "youtube": "https://youtu.be/MHf6awe89xw",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "binary-search"
  },
  {
    "id": 103,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "name": "Lower Bound",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/6zhGS79oQ4k",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "lower-bound"
  },
  {
    "id": 104,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "name": "Upper Bound",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/6zhGS79oQ4k",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "upper-bound"
  },
  {
    "id": 105,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "name": "Search insert position",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/search-insert-position/#:~:text=Search%20Insert%20Position%20%2D%20LeetCode&text=Given%20a%20sorted%20array%20of,(log%20n)%20runtime%20complexity.",
    "gfg": "",
    "youtube": "https://youtu.be/6zhGS79oQ4k",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Zoho"
    ],
    "slug": "search-insert-position"
  },
  {
    "id": 106,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "name": "Floor and Ceil in Sorted Array",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=6zhGS79oQ4k&list=PLgUwDviBIf0pMFMWuuvDNMAkoQFi-h0ZF&index=3",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "floor-and-ceil-in-sorted-array"
  },
  {
    "id": 107,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "name": "First and last occurrence",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
    "gfg": "",
    "youtube": "https://youtu.be/hjR1IYVx9lY",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "find-first-and-last-position-of-element-in-sorted-array"
  },
  {
    "id": 108,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "name": "Count Occurrences in a Sorted Array",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/hjR1IYVx9lY",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "count-occurrences-in-a-sorted-array"
  },
  {
    "id": 109,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "name": "Search in rotated sorted array-I",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=r3pMQ8-Ad5s&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=64",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "search-in-rotated-sorted-array"
  },
  {
    "id": 110,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "name": "Search in rotated sorted array-II",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/",
    "gfg": "",
    "youtube": "https://youtu.be/w2G2W8l__pc",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "LinkedIn"
    ],
    "slug": "search-in-rotated-sorted-array-ii"
  },
  {
    "id": 111,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "name": "Find minimum in Rotated Sorted Array",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    "gfg": "",
    "youtube": "https://youtu.be/nhEMDKMB44g",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "find-minimum-in-rotated-sorted-array"
  },
  {
    "id": 112,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "name": "Find out how many times the array is rotated",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/jtSiWTPLwd0",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "find-out-how-many-times-the-array-is-rotated"
  },
  {
    "id": 113,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "name": "Single element in a Sorted Array",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/single-element-in-a-sorted-array/",
    "gfg": "",
    "youtube": "https://youtu.be/AZOmHuHadxQ",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "single-element-in-a-sorted-array"
  },
  {
    "id": 114,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 1D Arrays",
    "name": "Find peak element",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-peak-element/#:~:text=Find%20Peak%20Element%20%2D%20LeetCode&text=A%20peak%20element%20is%20an,to%20any%20of%20the%20peaks.",
    "gfg": "",
    "youtube": "https://youtu.be/cXxmbemS6XM",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "find-peak-element"
  },
  {
    "id": 115,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "name": "Find square root of a number",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/Bsv3FPUX_BA",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "find-square-root-of-a-number"
  },
  {
    "id": 116,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "name": "Find Nth root of a number",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=WjpswYrS2nY&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=62",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "find-nth-root-of-a-number"
  },
  {
    "id": 117,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "name": "Koko eating bananas",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/koko-eating-bananas/",
    "gfg": "",
    "youtube": "https://youtu.be/qyfekrNni90",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "koko-eating-bananas"
  },
  {
    "id": 118,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "name": "Minimum days to make M bouquets",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/",
    "gfg": "",
    "youtube": "https://youtu.be/TXAuxeYBTdg",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ],
    "slug": "minimum-number-of-days-to-make-m-bouquets"
  },
  {
    "id": 119,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "name": "Find the smallest divisor",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/",
    "gfg": "",
    "youtube": "https://youtu.be/UvBKTVaG6U8",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "DE Shaw"
    ],
    "slug": "find-the-smallest-divisor-given-a-threshold"
  },
  {
    "id": 120,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "name": "Capacity to Ship Packages Within D Days",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
    "gfg": "",
    "youtube": "https://youtu.be/MG-Ac4TAvTY",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "capacity-to-ship-packages-within-d-days"
  },
  {
    "id": 121,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "name": "Kth Missing Positive Number",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/kth-missing-positive-number/#:~:text=Given%20an%20array%20arr%20of,13%2C...%5D.",
    "gfg": "",
    "youtube": "https://youtu.be/uZ0N_hZpyps",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "kth-missing-positive-number"
  },
  {
    "id": 122,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "name": "Aggressive Cows",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/R_Mfw4ew-Vo",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "aggressive-cows"
  },
  {
    "id": 123,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "name": "Book Allocation Problem",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=gYmWHvRHu-s&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=69",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "book-allocation-problem"
  },
  {
    "id": 124,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "name": "Split array - largest sum",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/split-array-largest-sum/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=thUd_WJn6wk&list=PLgUwDviBIf0pMFMWuuvDNMAkoQFi-h0ZF&index=20",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "split-array-largest-sum"
  },
  {
    "id": 125,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "name": "Painter's Partition",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=thUd_WJn6wk&list=PLgUwDviBIf0pMFMWuuvDNMAkoQFi-h0ZF&index=20",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "painter-s-partition"
  },
  {
    "id": 126,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "name": "Minimize Max Distance to Gas Station",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/minimize-max-distance-to-gas-station/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=kMSBvlZ-_HA&list=PLgUwDviBIf0pMFMWuuvDNMAkoQFi-h0ZF&index=21",
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
    "subcategory": "BS on Answers",
    "name": "Median of 2 sorted arrays",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=NTop3VTjmxk&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=65",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "median-of-two-sorted-arrays"
  },
  {
    "id": 128,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on Answers",
    "name": "Kth element of 2 sorted arrays",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/D1oDwWCq50g",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "kth-element-of-2-sorted-arrays"
  },
  {
    "id": 129,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 2D Arrays",
    "name": "Find row with maximum 1's",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/SCz-1TtYxDI",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "find-row-with-maximum-1-s"
  },
  {
    "id": 130,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 2D Arrays",
    "name": "Search in a 2D matrix",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix/",
    "gfg": "",
    "youtube": "https://youtu.be/ZYpYur0znng",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "search-a-2d-matrix"
  },
  {
    "id": 131,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 2D Arrays",
    "name": "Search in 2D matrix - II",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix-ii/",
    "gfg": "",
    "youtube": "https://youtu.be/9ZbB397jU4k",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "search-a-2d-matrix-ii"
  },
  {
    "id": 132,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 2D Arrays",
    "name": "Find Peak Element - II",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/find-a-peak-element-ii/",
    "gfg": "",
    "youtube": "https://youtu.be/nGGp5XBzC4g?si=WCop5C6Azj5gAELH",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "find-a-peak-element-ii"
  },
  {
    "id": 133,
    "sheetType": "a2z",
    "category": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
    "subcategory": "BS on 2D Arrays",
    "name": "Matrix Median",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/Q9wXgdxJq48?si=ScI_0uzJh7yg8nrX",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "matrix-median"
  },
  {
    "id": 134,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Basic and Easy String Problems",
    "name": "Remove Outermost Parentheses",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/remove-outermost-parentheses/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "TCS"
    ],
    "slug": "remove-outermost-parentheses"
  },
  {
    "id": 135,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Basic and Easy String Problems",
    "name": "Reverse words in a given string / Palindrome Check",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-words-in-a-string/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "reverse-words-in-a-string"
  },
  {
    "id": 136,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Basic and Easy String Problems",
    "name": "Largest Odd Number in a String",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/largest-odd-number-in-string/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "largest-odd-number-in-string"
  },
  {
    "id": 137,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Basic and Easy String Problems",
    "name": "Longest Common Prefix",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/longest-common-prefix/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "longest-common-prefix"
  },
  {
    "id": 138,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Basic and Easy String Problems",
    "name": "Isomorphic String",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/isomorphic-strings/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "isomorphic-strings"
  },
  {
    "id": 139,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Basic and Easy String Problems",
    "name": "Rotate String",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/rotate-string/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "rotate-string"
  },
  {
    "id": 140,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Basic and Easy String Problems",
    "name": "Check if two strings are anagram of each other",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/valid-anagram/#:~:text=Given%20two%20strings%20s%20and,the%20original%20letters%20exactly%20once.&text=Constraints%3A,.length%20%3C%3D%205%20*%2010",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "valid-anagram"
  },
  {
    "id": 141,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Medium String Problems",
    "name": "Sort Characters by Frequency",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/sort-characters-by-frequency/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Flipkart"
    ],
    "slug": "sort-characters-by-frequency"
  },
  {
    "id": 142,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Medium String Problems",
    "name": "Maximum Nesting Depth of the Parentheses",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-nesting-depth-of-the-parentheses/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "TCS"
    ],
    "slug": "maximum-nesting-depth-of-the-parentheses"
  },
  {
    "id": 143,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Medium String Problems",
    "name": "Roman to Integer",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/roman-to-integer/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "roman-to-integer"
  },
  {
    "id": 144,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Medium String Problems",
    "name": "String to Integer (atoi)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/string-to-integer-atoi/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "string-to-integer-atoi"
  },
  {
    "id": 145,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Medium String Problems",
    "name": "Count Number of Substrings",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "count-number-of-substrings"
  },
  {
    "id": 146,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Medium String Problems",
    "name": "Longest Palindromic Substring",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/longest-palindromic-substring/",
    "gfg": "",
    "youtube": "",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "longest-palindromic-substring"
  },
  {
    "id": 147,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Medium String Problems",
    "name": "Sum of Beauty of All Substrings",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/sum-of-beauty-of-all-substrings/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Zoho"
    ],
    "slug": "sum-of-beauty-of-all-substrings"
  },
  {
    "id": 148,
    "sheetType": "a2z",
    "category": "Step 5: Strings [Basic and Medium]",
    "subcategory": "Medium String Problems",
    "name": "Reverse every word in a string",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-words-in-a-string/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "reverse-words-in-a-string"
  },
  {
    "id": 149,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn 1D LinkedList",
    "name": "Introduction to Singly LinkedList",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/Nq7ok-OyEpg?si=9PR1o8OPRWil7fRA",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "introduction-to-singly-linkedlist"
  },
  {
    "id": 150,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn 1D LinkedList",
    "name": "Insertion at the head of Linked List",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/VaECK03Dz-g?si=vHSwdf9jhE05adKM&t=1934",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "insertion-at-the-head-of-linked-list"
  },
  {
    "id": 151,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn 1D LinkedList",
    "name": "Deletion of the head of LL",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/delete-node-in-a-linked-list/",
    "gfg": "",
    "youtube": "https://youtu.be/VaECK03Dz-g?si=CRaBHbOo2bHFbOT5",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "delete-node-in-a-linked-list"
  },
  {
    "id": 152,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn 1D LinkedList",
    "name": "Find the length of the Linked List",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/Nq7ok-OyEpg?si=xqQbukLfo2oZ6C6s&t=2240",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "find-the-length-of-the-linked-list"
  },
  {
    "id": 153,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn 1D LinkedList",
    "name": "Search in Linked List",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/Nq7ok-OyEpg?si=WNXcIaXZ_B6cNq0s&t=2524",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "search-in-linked-list"
  },
  {
    "id": 154,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn Doubly LinkedList",
    "name": "Introduction to Doubly LL",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/0eKMU10uEDI?si=uDnoj_C5ghEpNLvP",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "introduction-to-doubly-ll"
  },
  {
    "id": 155,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn Doubly LinkedList",
    "name": "Insert node before head in Doubly Linked List",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/0eKMU10uEDI?si=J5a0pQTosimcO_aA&t=2684",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "insert-node-before-head-in-doubly-linked-list"
  },
  {
    "id": 156,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn Doubly LinkedList",
    "name": "Delete head of Doubly Linked List",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/0eKMU10uEDI?si=sE7jqrW46lfRHVLd&t=853",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "delete-head-of-doubly-linked-list"
  },
  {
    "id": 157,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Learn Doubly LinkedList",
    "name": "Reverse a Doubly Linked List",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/u3WUW2qe6ww?si=96Wwlju72IvmzkxE",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "reverse-a-doubly-linked-list"
  },
  {
    "id": 158,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Middle of a LinkedList [TortoiseHare Method]",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/middle-of-the-linked-list/",
    "gfg": "",
    "youtube": "https://youtu.be/7LjQ57RqgEc?si=ir_rRDio38rhamU_",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "middle-of-the-linked-list"
  },
  {
    "id": 159,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Reverse a LinkedList [Iterative]",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
    "gfg": "",
    "youtube": "https://youtu.be/D2vI2DNJGd8?si=RCaLSx01qR21IBdh",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "reverse-linked-list"
  },
  {
    "id": 160,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Reverse a LL",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
    "gfg": "",
    "youtube": "https://youtu.be/D2vI2DNJGd8?si=RCaLSx01qR21IBdh",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "reverse-linked-list"
  },
  {
    "id": 161,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Detect a loop in LL",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle/",
    "gfg": "",
    "youtube": "https://youtu.be/wiOo4DC5GGA?si=zagt6O6tFXc4_3cx",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "linked-list-cycle"
  },
  {
    "id": 162,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Find the starting point in LL",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle-ii/",
    "gfg": "",
    "youtube": "https://youtu.be/2Kd0KKmmHFc?si=7UreDPRjRvapeVB0",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "ByteDance"
    ],
    "slug": "linked-list-cycle-ii"
  },
  {
    "id": 163,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Length of loop in LL",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/I4g1qbkTPus?si=ONktpqewvx57T8pF",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "length-of-loop-in-ll"
  },
  {
    "id": 164,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Check if LL is palindrome or not",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/palindrome-linked-list/",
    "gfg": "",
    "youtube": "https://youtu.be/lRY_G-u_8jk?si=BpM8hRYvXSYyjl-G",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Nvidia"
    ],
    "slug": "palindrome-linked-list"
  },
  {
    "id": 165,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Segregate odd and even nodes in Linked List",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/odd-even-linked-list/",
    "gfg": "",
    "youtube": "https://youtu.be/qf6qp7GzD5Q?si=JozAyXUdT8EJMSCQ",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "odd-even-linked-list"
  },
  {
    "id": 166,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Remove Nth node from the back of the LL",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    "gfg": "",
    "youtube": "https://youtu.be/3kMKYQ2wNIU?si=DtFDnPU7z9HMz_GM",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "remove-nth-node-from-end-of-list"
  },
  {
    "id": 167,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Delete the middle node in LL",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/#:~:text=You%20are%20given%20the%20head,than%20or%20equal%20to%20x%20.",
    "gfg": "",
    "youtube": "https://youtu.be/ePpV-_pfOeI?si=Au9GsZkVO57j6SiN",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "delete-the-middle-node-of-a-linked-list"
  },
  {
    "id": 168,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Sort LL",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/sort-list/",
    "gfg": "",
    "youtube": "https://youtu.be/8ocB7a_c-Cc?si=Gv-Y8q8-WyARoV35",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "ByteDance"
    ],
    "slug": "sort-list"
  },
  {
    "id": 169,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Sort a Linked List of 0's 1's and 2's",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/gRII7LhdJWc?si=l3qRC7w3NhY7OAqw",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "sort-a-linked-list-of-0-s-1-s-and-2-s"
  },
  {
    "id": 170,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Find the intersection point of Y LL",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
    "gfg": "",
    "youtube": "https://youtu.be/0DYoPz2Tpt4?si=L-uJs5yXUxj4VJM2",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "intersection-of-two-linked-lists"
  },
  {
    "id": 171,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Add one to a number represented by LL",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/aXQWhbvT3w0?si=uRgU9S4r5cVmnUy7",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "add-one-to-a-number-represented-by-ll"
  },
  {
    "id": 172,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of LL",
    "name": "Add two numbers in Linked List",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/add-two-numbers/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=LBVsXSMOIk4&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=32",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "add-two-numbers"
  },
  {
    "id": 173,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of DLL",
    "name": "Delete all occurrences of a key in DLL",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/Mh0NH_SD92k?si=tCYshBRi1upMqSVz",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "delete-all-occurrences-of-a-key-in-dll"
  },
  {
    "id": 174,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of DLL",
    "name": "Find Pairs with Given Sum in Doubly Linked List",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/YitR4dQsddE?si=iZAC259hdngV_OxC",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "find-pairs-with-given-sum-in-doubly-linked-list"
  },
  {
    "id": 175,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Medium Problems of DLL",
    "name": "Remove duplicates from sorted DLL",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/YJKVTnOJXSY?si=AsZoNUoewetsBjr0",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "remove-duplicates-from-sorted-dll"
  },
  {
    "id": 176,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Hard Problems of LL",
    "name": "Reverse LL in group of given size K",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
    "gfg": "",
    "youtube": "https://youtu.be/lIar1skcQYI?si=_jFghHKX4eaK36a1",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "reverse-nodes-in-k-group"
  },
  {
    "id": 177,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Hard Problems of LL",
    "name": "Rotate a LL",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/rotate-list/description/",
    "gfg": "",
    "youtube": "https://youtu.be/uT7YI7XbTY8?si=ZaChW3a68c_v54Is",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Nvidia"
    ],
    "slug": "rotate-list"
  },
  {
    "id": 178,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Hard Problems of LL",
    "name": "Flattening of LL",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/ykelywHJWLg?si=InMg9MmTHzY22NSR",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "flattening-of-ll"
  },
  {
    "id": 179,
    "sheetType": "a2z",
    "category": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
    "subcategory": "Hard Problems of LL",
    "name": "Clone a LL with random and next pointer",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/copy-list-with-random-pointer/",
    "gfg": "",
    "youtube": "https://youtu.be/q570bKdrnlw?si=epZtpWvtNwuTf23o",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "copy-list-with-random-pointer"
  },
  {
    "id": 180,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Get a Strong Hold",
    "name": "Recursive Implementation of atoi()",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/string-to-integer-atoi/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "string-to-integer-atoi"
  },
  {
    "id": 181,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Get a Strong Hold",
    "name": "Pow(x, n)",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/powx-n/",
    "gfg": "",
    "youtube": "https://youtu.be/l0YC3876qxg",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "powx-n"
  },
  {
    "id": 182,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Get a Strong Hold",
    "name": "Count Good Numbers",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/count-good-numbers/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Infosys"
    ],
    "slug": "count-good-numbers"
  },
  {
    "id": 183,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Get a Strong Hold",
    "name": "Sort a stack using recursion",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "sort-a-stack-using-recursion"
  },
  {
    "id": 184,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Get a Strong Hold",
    "name": "Reverse a Stack",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "reverse-a-stack"
  },
  {
    "id": 185,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "name": "Generate Binary Strings Without Consecutive 1s",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "generate-binary-strings-without-consecutive-1s"
  },
  {
    "id": 186,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "name": "Generate Parentheses",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/generate-parentheses/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "generate-parentheses"
  },
  {
    "id": 187,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "name": "Power Set",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=b7AYbpM5YrE&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=67",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "power-set"
  },
  {
    "id": 188,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "name": "Learn All Patterns of Subsequences (Theory)",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=eQCS_v3bw0Q&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=7",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "learn-all-patterns-of-subsequences-theory"
  },
  {
    "id": 189,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "name": "Count all subsequences with sum K",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "count-all-subsequences-with-sum-k"
  },
  {
    "id": 190,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "name": "Check if there exists a subsequence with sum K",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "check-if-there-exists-a-subsequence-with-sum-k"
  },
  {
    "id": 191,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "name": "Combination Sum",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/combination-sum/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=OyZFFqQtu98&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=49",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "combination-sum"
  },
  {
    "id": 192,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "name": "Combination Sum II",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/combination-sum-ii/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=G1fRTGRxXU8&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=50",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ],
    "slug": "combination-sum-ii"
  },
  {
    "id": 193,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "name": "Subsets I",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=rYkfBRtMJr8&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=52",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "subsets-i"
  },
  {
    "id": 194,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "name": "Subsets II",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/subsets-ii/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=RIn3gOkbhQE&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=53",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "subsets-ii"
  },
  {
    "id": 195,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "name": "Combination Sum III",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/combination-sum-iii/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "combination-sum-iii"
  },
  {
    "id": 196,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Subsequences Pattern",
    "name": "Letter Combinations of a Phone Number",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "letter-combinations-of-a-phone-number"
  },
  {
    "id": 197,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Trying out all Combos / Hard",
    "name": "Palindrome partitioning",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/_H8V5hJUGd0",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "palindrome-partitioning"
  },
  {
    "id": 198,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Trying out all Combos / Hard",
    "name": "Word Search",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/word-search/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "word-search"
  },
  {
    "id": 199,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Trying out all Combos / Hard",
    "name": "N Queen",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/n-queens/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=i05Ju7AftcM&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=57",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "n-queens"
  },
  {
    "id": 200,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Trying out all Combos / Hard",
    "name": "Rat in a Maze",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=bLGZhJlt4y0&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=60",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "rat-in-a-maze"
  },
  {
    "id": 201,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Trying out all Combos / Hard",
    "name": "Word Break",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "word-break"
  },
  {
    "id": 202,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Trying out all Combos / Hard",
    "name": "M Coloring Problem",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=wuVwUK25Rfc&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=59",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "m-coloring-problem"
  },
  {
    "id": 203,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Trying out all Combos / Hard",
    "name": "Sudoku Solver",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/sudoku-solver/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=FWAIf_EVUKE&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=58",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "sudoku-solver"
  },
  {
    "id": 204,
    "sheetType": "a2z",
    "category": "Step 7: Recursion [PatternWise]",
    "subcategory": "Trying out all Combos / Hard",
    "name": "Expression Add Operators",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/expression-add-operators/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Bloomberg",
      "LinkedIn"
    ],
    "slug": "expression-add-operators"
  },
  {
    "id": 205,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "name": "Introduction to Bits and Tricks",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/qQd-ViW7bfk?si=QtdNaRhHmZb08Mr8",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "introduction-to-bits-and-tricks"
  },
  {
    "id": 206,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "name": "Check if the i-th bit is Set or Not",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/nttpF8kwgd4?si=x9o8PsYaA2XVZ9rV",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "check-if-the-i-th-bit-is-set-or-not"
  },
  {
    "id": 207,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "name": "Check if a Number is Odd or Not",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/nttpF8kwgd4?si=x9o8PsYaA2XVZ9rV",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "check-if-a-number-is-odd-or-not"
  },
  {
    "id": 208,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "name": "Check if a Number is Power of 2 or Not",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/power-of-two/",
    "gfg": "",
    "youtube": "https://youtu.be/nttpF8kwgd4?si=x9o8PsYaA2XVZ9rV",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "power-of-two"
  },
  {
    "id": 209,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "name": "Count the Number of Set Bits",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/nttpF8kwgd4?si=x9o8PsYaA2XVZ9rV",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "count-the-number-of-set-bits"
  },
  {
    "id": 210,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "name": "Set/Unset the rightmost unset bit",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/nttpF8kwgd4?si=x9o8PsYaA2XVZ9rV",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "set-unset-the-rightmost-unset-bit"
  },
  {
    "id": 211,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "name": "Swap Two Numbers",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/nttpF8kwgd4?si=x9o8PsYaA2XVZ9rV",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "swap-two-numbers"
  },
  {
    "id": 212,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Learn Bit Manipulation",
    "name": "Divide two numbers without multiplication and division",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/divide-two-integers/",
    "gfg": "",
    "youtube": "https://youtu.be/pBD4B1tzgVc?si=G9c5pEE-RrzeU6sz",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "divide-two-integers"
  },
  {
    "id": 213,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Interview Problems",
    "name": "Minimum Bit Flips to Convert Number",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-bit-flips-to-convert-number/",
    "gfg": "",
    "youtube": "https://youtu.be/OOdrmcfZXd8?si=rnkRVz1UiVBKWC69",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "minimum-bit-flips-to-convert-number"
  },
  {
    "id": 214,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Interview Problems",
    "name": "Single Number - I",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/single-number/",
    "gfg": "",
    "youtube": "https://youtu.be/bYWLJb3vCWY?t=1369",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ],
    "slug": "single-number"
  },
  {
    "id": 215,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Interview Problems",
    "name": "Power Set Bit Manipulation",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/subsets/",
    "gfg": "",
    "youtube": "https://youtu.be/LqKaUv1G3_I?si=UXU_T5OsHiokPRvP",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "subsets"
  },
  {
    "id": 216,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Interview Problems",
    "name": "XOR of numbers in a given range",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/WqGb7159h7Q?si=uGUEbNUUaIN_6Vvr",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "xor-of-numbers-in-a-given-range"
  },
  {
    "id": 217,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Interview Problems",
    "name": "Single Number - III",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/UA5JnV1J2sI?si=VFBRJyb3boZvx_r1",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle",
      "Zomato"
    ],
    "slug": "single-number-iii"
  },
  {
    "id": 218,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Advanced Maths",
    "name": "Print Prime Factors of a Number",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/LT7XhVdeRyg?si=6HkjQokJRPTFai21",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "print-prime-factors-of-a-number"
  },
  {
    "id": 219,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Advanced Maths",
    "name": "Divisors of a Number",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/1xNbjMdbjug?t=1580",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "divisors-of-a-number"
  },
  {
    "id": 220,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Advanced Maths",
    "name": "Count primes in range L to R",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/count-primes/",
    "gfg": "",
    "youtube": "https://youtu.be/g5Fuxn_AvSk?si=fv6Q-Po7wrMW0a5n",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "count-primes"
  },
  {
    "id": 221,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Advanced Maths",
    "name": "Prime factorisation of a Number",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/LT7XhVdeRyg?si=6HkjQokJRPTFai21",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "prime-factorisation-of-a-number"
  },
  {
    "id": 222,
    "sheetType": "a2z",
    "category": "Step 8: Bit Manipulation [Concepts & Problems]",
    "subcategory": "Advanced Maths",
    "name": "Pow(x,n)",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/powx-n/",
    "gfg": "",
    "youtube": "https://youtu.be/l0YC3876qxg",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "powx-n"
  },
  {
    "id": 223,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Learning",
    "name": "Implement Stack using Arrays",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/tqQ5fTamIN4?si=ofLt8Zt1ZvhikZ6w",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "implement-stack-using-arrays"
  },
  {
    "id": 224,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Learning",
    "name": "Implement Queue using Arrays",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/tqQ5fTamIN4?si=ofLt8Zt1ZvhikZ6w",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "implement-queue-using-arrays"
  },
  {
    "id": 225,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Learning",
    "name": "Implement Stack using Queue",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/implement-stack-using-queues/",
    "gfg": "",
    "youtube": "https://youtu.be/tqQ5fTamIN4?si=ofLt8Zt1ZvhikZ6w",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "implement-stack-using-queues"
  },
  {
    "id": 226,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Learning",
    "name": "Implement Queue using Stack",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/implement-queue-using-stacks/",
    "gfg": "",
    "youtube": "https://youtu.be/tqQ5fTamIN4?si=ofLt8Zt1ZvhikZ6w",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "implement-queue-using-stacks"
  },
  {
    "id": 227,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Learning",
    "name": "Implement stack using Linkedlist",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/tqQ5fTamIN4?si=ofLt8Zt1ZvhikZ6w",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "implement-stack-using-linkedlist"
  },
  {
    "id": 228,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Learning",
    "name": "Implement queue using Linkedlist",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/tqQ5fTamIN4?si=ofLt8Zt1ZvhikZ6w",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "implement-queue-using-linkedlist"
  },
  {
    "id": 229,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Learning",
    "name": "Balanced Paranthesis",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/valid-parentheses/",
    "gfg": "",
    "youtube": "https://youtu.be/xwjS0iZhw4I?si=UoyKpFn4Q3nf5h2R",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "valid-parentheses"
  },
  {
    "id": 230,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Learning",
    "name": "Implement Min Stack",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/min-stack/",
    "gfg": "",
    "youtube": "https://youtu.be/NdDIaH91P0g?si=4_Jbsq5trFvfSdUY",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "min-stack"
  },
  {
    "id": 231,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Prefix, Infix, PostFix Conversion Problems",
    "name": "Infix to Postfix Conversion",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/4pIc9UBHJtk?si=ryeVvQWpCgwbTQrh",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "infix-to-postfix-conversion"
  },
  {
    "id": 232,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Prefix, Infix, PostFix Conversion Problems",
    "name": "Prefix to Infix Conversion",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/4pIc9UBHJtk?si=ryeVvQWpCgwbTQrh",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "prefix-to-infix-conversion"
  },
  {
    "id": 233,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Prefix, Infix, PostFix Conversion Problems",
    "name": "Prefix to Postfix Conversion",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/4pIc9UBHJtk?si=0pWtyDC1GhbiYP3P",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "prefix-to-postfix-conversion"
  },
  {
    "id": 234,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Prefix, Infix, PostFix Conversion Problems",
    "name": "Postfix to Prefix Conversion",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/4pIc9UBHJtk?si=0pWtyDC1GhbiYP3P",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "postfix-to-prefix-conversion"
  },
  {
    "id": 235,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Prefix, Infix, PostFix Conversion Problems",
    "name": "Postfix to Infix Conversion",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/4pIc9UBHJtk?si=0pWtyDC1GhbiYP3P",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "postfix-to-infix-conversion"
  },
  {
    "id": 236,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Prefix, Infix, PostFix Conversion Problems",
    "name": "Infix to Prefix Conversion",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/4pIc9UBHJtk?si=0pWtyDC1GhbiYP3P",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "infix-to-prefix-conversion"
  },
  {
    "id": 237,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "name": "Next Greater Element",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/next-greater-element-i/",
    "gfg": "",
    "youtube": "https://youtu.be/e7XQLtOQM3I?si=QdcHpTtx6gAHsext",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "next-greater-element-i"
  },
  {
    "id": 238,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "name": "Next Greater Element - 2",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/next-greater-element-ii/",
    "gfg": "",
    "youtube": "https://youtu.be/7PrncD7v9YQ?si=UkBc7eVy9HGlBpeW",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "next-greater-element-ii"
  },
  {
    "id": 239,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "name": "Next Smaller Element",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "next-smaller-element"
  },
  {
    "id": 240,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "name": "Number of Greater Elements to the Right",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "number-of-greater-elements-to-the-right"
  },
  {
    "id": 241,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "name": "Trapping Rainwater",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/trapping-rain-water/",
    "gfg": "",
    "youtube": "https://youtu.be/1_5VuquLbXg?si=NFG6df318_6OtGvg",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "trapping-rain-water"
  },
  {
    "id": 242,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "name": "Sum of Subarray Minimums",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/sum-of-subarray-minimums/",
    "gfg": "",
    "youtube": "https://youtu.be/v0e8p9JCgRc?si=XAU7ekECgS5nboRw",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "sum-of-subarray-minimums"
  },
  {
    "id": 243,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "name": "Asteroid Collision",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/asteroid-collision/",
    "gfg": "",
    "youtube": "https://youtu.be/_eYGqw_VDR4?si=YyxibcHq800RqgIQ",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "asteroid-collision"
  },
  {
    "id": 244,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "name": "Sum of Subarray Ranges",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/sum-of-subarray-ranges/",
    "gfg": "",
    "youtube": "https://youtu.be/gIrMptNPf5M?si=Q_GHuBvzZVs27X_U",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "sum-of-subarray-ranges"
  },
  {
    "id": 245,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "name": "Remove K Digits",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/remove-k-digits/",
    "gfg": "",
    "youtube": "https://youtu.be/jmbuRzYPGrg?si=WN387gwQ7aXWkUao",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ],
    "slug": "remove-k-digits"
  },
  {
    "id": 246,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "name": "Largest rectangle in a histogram",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "gfg": "",
    "youtube": "https://youtu.be/Bzat9vgD0fs?si=DiBlLejXcr6EJoyB",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "largest-rectangle-in-histogram"
  },
  {
    "id": 247,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Monotonic Stack/Queue Problems [VVV. Imp]",
    "name": "Maximum Rectangles",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximal-rectangle/",
    "gfg": "",
    "youtube": "https://youtu.be/tOylVCugy9k",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "maximal-rectangle"
  },
  {
    "id": 248,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Implementation Problems",
    "name": "Sliding Window Maximum",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
    "gfg": "",
    "youtube": "https://youtu.be/NwBvene4Imo?si=eU1PY-bcQfk5wdog",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "sliding-window-maximum"
  },
  {
    "id": 249,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Implementation Problems",
    "name": "Stock span problem",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/online-stock-span/",
    "gfg": "",
    "youtube": "https://youtu.be/eay-zoSRkVc?si=deNNe5i38BOAntha",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ],
    "slug": "online-stock-span"
  },
  {
    "id": 250,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Implementation Problems",
    "name": "Celebrity Problem",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/accounts/login/?next=/problems/find-the-celebrity/",
    "gfg": "",
    "youtube": "https://youtu.be/cEadsbTeze4?si=olXYfOs7l-SEn2zl",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "find-the-celebrity"
  },
  {
    "id": 251,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Implementation Problems",
    "name": "LRU Cache",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "lru-cache"
  },
  {
    "id": 252,
    "sheetType": "a2z",
    "category": "Step 9: Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
    "subcategory": "Implementation Problems",
    "name": "LFU Cache",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/lfu-cache/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=0PSB9y8ehbk&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=79",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "lfu-cache"
  },
  {
    "id": 253,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Medium Problems",
    "name": "Longest Substring Without Repeating Characters",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "gfg": "",
    "youtube": "https://youtu.be/-zSxTJkcdAo?si=I2zfR-vlDMg0zU9z",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "longest-substring-without-repeating-characters"
  },
  {
    "id": 254,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Medium Problems",
    "name": "Max Consecutive Ones III",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/max-consecutive-ones-iii/",
    "gfg": "",
    "youtube": "https://youtu.be/3E4JBHSLpYk?si=SoOW64pP6otEKxBw",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "max-consecutive-ones-iii"
  },
  {
    "id": 255,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Medium Problems",
    "name": "Fruit Into Baskets",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/fruit-into-baskets/description/",
    "gfg": "",
    "youtube": "https://youtu.be/e3bs0uA1NhQ?si=gR8pO62u-nJeFAXk",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Netflix",
      "Bloomberg"
    ],
    "slug": "fruit-into-baskets"
  },
  {
    "id": 256,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Medium Problems",
    "name": "Longest Repeating Character Replacement",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/longest-repeating-character-replacement/",
    "gfg": "",
    "youtube": "https://youtu.be/_eNhaDCr6P0?si=pBWcEjozF5poom0p",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "longest-repeating-character-replacement"
  },
  {
    "id": 257,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Medium Problems",
    "name": "Binary Subarrays With Sum",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-subarrays-with-sum/",
    "gfg": "",
    "youtube": "https://youtu.be/XnMdNUkX6VM?si=Nyt8EveeLUg8lmty",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Nvidia"
    ],
    "slug": "binary-subarrays-with-sum"
  },
  {
    "id": 258,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Medium Problems",
    "name": "Count number of Nice subarrays",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/count-number-of-nice-subarrays/",
    "gfg": "",
    "youtube": "https://youtu.be/j_QOv9OT9Og?si=Oq5-5hyFkzVSOZpP",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "count-number-of-nice-subarrays"
  },
  {
    "id": 259,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Medium Problems",
    "name": "Number of Substrings Containing All Three Characters",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/",
    "gfg": "",
    "youtube": "https://youtu.be/xtqN4qlgr8s?si=kuaLHVOLXhh5Z2tW",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "DE Shaw"
    ],
    "slug": "number-of-substrings-containing-all-three-characters"
  },
  {
    "id": 260,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Medium Problems",
    "name": "Maximum Points You Can Obtain from Cards",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/",
    "gfg": "",
    "youtube": "https://youtu.be/pBWCOCS636U?si=-X64rY67noxvOwrG",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "maximum-points-you-can-obtain-from-cards"
  },
  {
    "id": 261,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Hard Problems",
    "name": "Longest Substring With At Most K Distinct Characters",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/",
    "gfg": "",
    "youtube": "https://youtu.be/teM9ZsVRQyc?si=Kh0_u6aCkkBU3Q33",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "longest-substring-with-at-most-k-distinct-characters"
  },
  {
    "id": 262,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Hard Problems",
    "name": "Subarrays with K Different Integers",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/subarrays-with-k-different-integers/",
    "gfg": "",
    "youtube": "https://youtu.be/7wYGbV_LsX4?si=KWa48RgLDCvdNqRb",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "subarrays-with-k-different-integers"
  },
  {
    "id": 263,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Hard Problems",
    "name": "Minimum Window Substring",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-window-substring/",
    "gfg": "",
    "youtube": "https://youtu.be/WJaij9ffOIY?si=-xnsWIH84zWU0ICd",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "minimum-window-substring"
  },
  {
    "id": 264,
    "sheetType": "a2z",
    "category": "Step 10: Sliding Window & Two Pointer Combined Problems",
    "subcategory": "Hard Problems",
    "name": "Minimum Window Subsequence",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-window-subsequence/",
    "gfg": "",
    "youtube": "",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Salesforce",
      "Airbnb",
      "eBay"
    ],
    "slug": "minimum-window-subsequence"
  },
  {
    "id": 265,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Learning",
    "name": "Heaps (Theory Video)",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "heaps-theory-video"
  },
  {
    "id": 266,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Learning",
    "name": "Implement Min Heap",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "article": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "implement-min-heap"
  },
  {
    "id": 267,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Learning",
    "name": "Check if an array represents a min heap",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "check-if-an-array-represents-a-min-heap"
  },
  {
    "id": 268,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Learning",
    "name": "Convert Min Heap to Max Heap",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "article": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "convert-min-heap-to-max-heap"
  },
  {
    "id": 269,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "K-th Largest element in an array",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "k-th-largest-element-in-an-array"
  },
  {
    "id": 270,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Kth smallest element in an array [use priority queue]",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "kth-smallest-element-in-an-array-use-priority-queue"
  },
  {
    "id": 271,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Sort K sorted array",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "sort-k-sorted-array"
  },
  {
    "id": 272,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Merge K sorted Lists",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/merge-k-sorted-lists/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "merge-k-sorted-lists"
  },
  {
    "id": 273,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Replace Elements by Their Rank",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "replace-elements-by-their-rank"
  },
  {
    "id": 274,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Task Scheduler",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/task-scheduler/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "task-scheduler"
  },
  {
    "id": 275,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Hand of Straights",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/hand-of-straights/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "hand-of-straights"
  },
  {
    "id": 276,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Design Twitter",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/design-twitter/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber",
      "Bloomberg"
    ],
    "slug": "design-twitter"
  },
  {
    "id": 277,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Minimum Cost to Connect Sticks",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Amazon",
      "Twitter (X)"
    ],
    "slug": "minimum-cost-to-connect-sticks"
  },
  {
    "id": 278,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Kth largest element in a stream of running integers",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-a-stream/#:~:text=Implement%20KthLargest%20class%3A,largest%20element%20in%20the%20stream.",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "kth-largest-element-in-a-stream"
  },
  {
    "id": 279,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Maximum Sum Combination",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "maximum-sum-combination"
  },
  {
    "id": 280,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Find Median from Data Stream",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/find-median-from-data-stream/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "find-median-from-data-stream"
  },
  {
    "id": 281,
    "sheetType": "a2z",
    "category": "Step 11: Heaps [Learning, Medium, Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Top K Frequent Elements",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/top-k-frequent-elements/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "top-k-frequent-elements"
  },
  {
    "id": 282,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Easy Problems",
    "name": "Assign Cookies",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/assign-cookies/",
    "gfg": "",
    "youtube": "https://youtu.be/DIX2p7vb9co?si=GofAIDimue-Av0Fi",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "assign-cookies"
  },
  {
    "id": 283,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Easy Problems",
    "name": "Fractional Knapsack",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/1ibsQrnuEEg?si=8R2By3wpHo0zZVHE",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "fractional-knapsack"
  },
  {
    "id": 284,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Easy Problems",
    "name": "Lemonade Change",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/lemonade-change/",
    "gfg": "",
    "youtube": "https://youtu.be/n_tmibEhO6Q?si=q1NW8MfPy0QU6fIl",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Zoho"
    ],
    "slug": "lemonade-change"
  },
  {
    "id": 285,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Easy Problems",
    "name": "Valid Paranthesis Checker",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/valid-parenthesis-string/",
    "gfg": "",
    "youtube": "https://youtu.be/cHT6sG_hUZI?si=XRHeyh7jOaLaTy3g",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "valid-parenthesis-string"
  },
  {
    "id": 286,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "name": "N meetings in one room",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/mKfhTotEguk?si=2RELeq18mpmIIN3Q",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "n-meetings-in-one-room"
  },
  {
    "id": 287,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "name": "Jump Game - I",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/jump-game/",
    "gfg": "",
    "youtube": "https://youtu.be/tZAa_jJ3SwQ?si=voKd7n9VTLDRRNzJ",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "jump-game"
  },
  {
    "id": 288,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "name": "Jump Game II",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/jump-game-ii/",
    "gfg": "",
    "youtube": "https://youtu.be/7SBVnw7GSTk?si=9uUouBELh9K3m2jZ",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "jump-game-ii"
  },
  {
    "id": 289,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "name": "Minimum number of platforms required for a railway",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/AsGzwR_FWok?si=165acXU_dtqOHuo9",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "minimum-number-of-platforms-required-for-a-railway"
  },
  {
    "id": 290,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "name": "Job sequencing Problem",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/QbwltemZbRg?si=wvcemJ5BLPlTRmkG",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "job-sequencing-problem"
  },
  {
    "id": 291,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "name": "Candy",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/candy/",
    "gfg": "",
    "youtube": "https://youtu.be/IIqVFvKE6RY?si=EjmuXZJNLQLUkEd7",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "candy"
  },
  {
    "id": 292,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "name": "Shortest Job First",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/3-QbX1iDbXs?si=IH8QZUblr01F7UoQ",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "shortest-job-first"
  },
  {
    "id": 293,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "name": "Program for Least Recently Used (LRU) Page Replacement Algorithm",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "program-for-least-recently-used-lru-page-replacement-algorithm"
  },
  {
    "id": 294,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "name": "Insert Interval",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/insert-interval/",
    "gfg": "",
    "youtube": "https://youtu.be/xxRE-46OCC8?si=a7aPuIw16zDx2lAa",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "insert-interval"
  },
  {
    "id": 295,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "name": "Merge Intervals",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/merge-intervals/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=2JzRBPFYbKE&list=PLgUwDviBIf0rPG3Ictpu74YWBQ1CaBkm2&index=6",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "merge-intervals"
  },
  {
    "id": 296,
    "sheetType": "a2z",
    "category": "Step 12: Greedy Algorithms [Easy, Medium/Hard]",
    "subcategory": "Medium/Hard",
    "name": "Non-overlapping Intervals",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/non-overlapping-intervals/",
    "gfg": "",
    "youtube": "https://youtu.be/HDHQ8lAWakY?si=JVtLqboGdpUTOVjf",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "non-overlapping-intervals"
  },
  {
    "id": 297,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "name": "Introduction to Trees",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/_ANrF3FJm7I",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "introduction-to-trees"
  },
  {
    "id": 298,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "name": "Binary Tree Representation in Java",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/hyLyW7rP24I",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "binary-tree-representation-in-java"
  },
  {
    "id": 299,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "name": "Pre, Post, Inorder in one traversal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/ySp2epYvgTE",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "pre-post-inorder-in-one-traversal"
  },
  {
    "id": 300,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "name": "Preorder Traversal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    "gfg": "",
    "youtube": "https://youtu.be/RlUu72JrOCQ",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "binary-tree-preorder-traversal"
  },
  {
    "id": 301,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "name": "Inorder Traversal of Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "gfg": "",
    "youtube": "https://youtu.be/Z_NEgBgbRVI",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "TCS"
    ],
    "slug": "binary-tree-inorder-traversal"
  },
  {
    "id": 302,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "name": "Postorder Traversal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
    "gfg": "",
    "youtube": "https://youtu.be/2YBhNLodD8Q",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "binary-tree-postorder-traversal"
  },
  {
    "id": 303,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "name": "Level Order Traversal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    "gfg": "",
    "youtube": "https://youtu.be/EoAsWbO7sqg",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "binary-tree-level-order-traversal"
  },
  {
    "id": 304,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "name": "Iterative Preorder Traversal of Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    "gfg": "",
    "youtube": "https://youtu.be/Bfqd8BsPVuw",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "binary-tree-preorder-traversal"
  },
  {
    "id": 305,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "name": "Iterative Inorder Traversal of Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "gfg": "",
    "youtube": "https://youtu.be/lxTGsVXjwvM",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "TCS"
    ],
    "slug": "binary-tree-inorder-traversal"
  },
  {
    "id": 306,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "name": "Post-order Traversal of Binary Tree using 2 stack",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
    "gfg": "",
    "youtube": "https://youtu.be/2YBhNLodD8Q",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "binary-tree-postorder-traversal"
  },
  {
    "id": 307,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "name": "Post-order Traversal of Binary Tree using 1 stack",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
    "gfg": "",
    "youtube": "https://youtu.be/NzIGLLwZBS8",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "binary-tree-postorder-traversal"
  },
  {
    "id": 308,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Traversals",
    "name": "Preorder, Inorder, and Postorder Traversal in one Traversal",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/ySp2epYvgTE",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "preorder-inorder-and-postorder-traversal-in-one-traversal"
  },
  {
    "id": 309,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Maximum Depth in BT",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/eD3tmO66aBA",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "maximum-depth-of-binary-tree"
  },
  {
    "id": 310,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Check for balanced binary tree",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/balanced-binary-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/Yt50Jfbd8Po",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "balanced-binary-tree"
  },
  {
    "id": 311,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Diameter of Binary Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/diameter-of-binary-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/Rezetez59Nk",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "diameter-of-binary-tree"
  },
  {
    "id": 312,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Maximum path sum",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    "gfg": "",
    "youtube": "https://youtu.be/WszrfSwMz58",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "binary-tree-maximum-path-sum"
  },
  {
    "id": 313,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Check if two trees are identical or not",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/same-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/BhuvF_-PWS0",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "same-tree"
  },
  {
    "id": 314,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Zig Zag or Spiral Traversal",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
    "gfg": "",
    "youtube": "https://youtu.be/3OXWEdlIGl4",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "binary-tree-zigzag-level-order-traversal"
  },
  {
    "id": 315,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Boundary Traversal",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/boundary-of-binary-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/0ca1nvR0be4",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Adobe"
    ],
    "slug": "boundary-of-binary-tree"
  },
  {
    "id": 316,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Vertical Order Traversal",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/q_a6lpbKJdw",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "vertical-order-traversal-of-a-binary-tree"
  },
  {
    "id": 317,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Top View of BT",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/Et9OCDNvJ78",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "top-view-of-bt"
  },
  {
    "id": 318,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Bottom view of BT",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/0FtVY6I4pB8",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "bottom-view-of-bt"
  },
  {
    "id": 319,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Right/Left View of Binary Tree",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-right-side-view/",
    "gfg": "",
    "youtube": "https://youtu.be/KV4mRzTjlAk",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "binary-tree-right-side-view"
  },
  {
    "id": 320,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Medium Problems",
    "name": "Symmetric Binary Tree",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/symmetric-tree/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=nKggNAiEpBE",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "symmetric-tree"
  },
  {
    "id": 321,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Print root to leaf path in BT",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/fmflMqVOC7k",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "print-root-to-leaf-path-in-bt"
  },
  {
    "id": 322,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "LCA in BT",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/_-QHfMDde90",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "lowest-common-ancestor-of-a-binary-tree"
  },
  {
    "id": 323,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Maximum Width of BT",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-width-of-binary-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/ZbybYvcVLks",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Flipkart"
    ],
    "slug": "maximum-width-of-binary-tree"
  },
  {
    "id": 324,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Children Sum Property in Binary Tree",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/fnmisPM6cVo",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "children-sum-property-in-binary-tree"
  },
  {
    "id": 325,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Print all nodes at a distance of K in BT",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/i9ORlEy6EsI",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "all-nodes-distance-k-in-binary-tree"
  },
  {
    "id": 326,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Minimum time taken to burn the BT from a given Node",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/2r5wLmQfD6g",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "minimum-time-taken-to-burn-the-bt-from-a-given-node"
  },
  {
    "id": 327,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Count total nodes in a complete BT",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/count-complete-tree-nodes/",
    "gfg": "",
    "youtube": "https://youtu.be/u-yWemKGWO0",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ],
    "slug": "count-complete-tree-nodes"
  },
  {
    "id": 328,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Requirements needed to construct a unique BT",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/9GMECGQgWrQ",
    "article": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "requirements-needed-to-construct-a-unique-bt"
  },
  {
    "id": 329,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Construct a BT from Preorder and Inorder",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    "gfg": "",
    "youtube": "https://youtu.be/aZNaLrVebKQ",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Adobe"
    ],
    "slug": "construct-binary-tree-from-preorder-and-inorder-traversal"
  },
  {
    "id": 330,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Construct the Binary Tree from Postorder and Inorder Traversal",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/",
    "gfg": "",
    "youtube": "https://youtu.be/LgLRTaEMRVc",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Walmart"
    ],
    "slug": "construct-binary-tree-from-inorder-and-postorder-traversal"
  },
  {
    "id": 331,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Serialize and De-serialize BT",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/-YbXySKJsX8",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "serialize-and-deserialize-binary-tree"
  },
  {
    "id": 332,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Morris Preorder Traversal of a Binary Tree",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "gfg": "",
    "youtube": "https://youtu.be/80Zug6D1_r4",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "binary-tree-inorder-traversal"
  },
  {
    "id": 333,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Morris Inorder Traversal of a Binary Tree",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "gfg": "",
    "youtube": "https://youtu.be/80Zug6D1_r4",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "binary-tree-inorder-traversal"
  },
  {
    "id": 334,
    "sheetType": "a2z",
    "category": "Step 13: Binary Trees [Traversals, Medium and Hard Problems]",
    "subcategory": "Hard Problems",
    "name": "Flatten Binary Tree to Linked List",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/",
    "gfg": "",
    "youtube": "https://youtu.be/sWf7k1x9XR4",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "flatten-binary-tree-to-linked-list"
  },
  {
    "id": 335,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Concepts",
    "name": "Introduction to BST",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/p7-9UvDQZ3w",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "introduction-to-bst"
  },
  {
    "id": 336,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Concepts",
    "name": "Search in a Binary Search Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/search-in-a-binary-search-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/KcNt6v_56cc",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "search-in-a-binary-search-tree"
  },
  {
    "id": 337,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Concepts",
    "name": "Find Min/Max in BST",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "find-min-max-in-bst"
  },
  {
    "id": 338,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "name": "Floor and Ceil in a BST",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=xm_W1ub-K-w&list=PLgUwDviBIf0q8Hkd7bK2Bpryj2xVJk8Vk&index=43",
    "article": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "floor-and-ceil-in-a-bst"
  },
  {
    "id": 339,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "name": "Floor in a Binary Search Tree",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/xm_W1ub-K-w",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "floor-in-a-binary-search-tree"
  },
  {
    "id": 340,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "name": "Insert a given node in BST",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/insert-into-a-binary-search-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/FiFiNvM29ps",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "LinkedIn"
    ],
    "slug": "insert-into-a-binary-search-tree"
  },
  {
    "id": 341,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "name": "Delete a node in BST",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/delete-node-in-a-bst/",
    "gfg": "",
    "youtube": "https://youtu.be/kouxiP_H5WE",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "delete-node-in-a-bst"
  },
  {
    "id": 342,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "name": "Kth Smallest and Largest element in BST",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    "gfg": "",
    "youtube": "https://youtu.be/9TJYWh0adfk",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "kth-smallest-element-in-a-bst"
  },
  {
    "id": 343,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "name": "Check if a tree is a BST or not",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/validate-binary-search-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/f-sj7I5oXEI",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "validate-binary-search-tree"
  },
  {
    "id": 344,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "name": "LCA in BST",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/cX_kPV_foZc",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "lowest-common-ancestor-of-a-binary-search-tree"
  },
  {
    "id": 345,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "name": "Construct a BST from a preorder traversal",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/",
    "gfg": "",
    "youtube": "https://youtu.be/UmJT3j26t1I",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "construct-binary-search-tree-from-preorder-traversal"
  },
  {
    "id": 346,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "name": "Inorder Successor/Predecessor in BST",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/inorder-successor-in-bst/",
    "gfg": "",
    "youtube": "https://youtu.be/SXKAD2svfmI",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft"
    ],
    "slug": "inorder-successor-in-bst"
  },
  {
    "id": 347,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "name": "Merge 2 BST's",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/binary-search-tree-iterator/",
    "gfg": "",
    "youtube": "https://youtu.be/D2jMcmxU4bs",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "binary-search-tree-iterator"
  },
  {
    "id": 348,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "name": "Two Sum In BST | Check if there exists a pair with Sum K",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/two-sum-iv-input-is-a-bst/",
    "gfg": "",
    "youtube": "https://youtu.be/ssL3sHwPeb4",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "two-sum-iv-input-is-a-bst"
  },
  {
    "id": 349,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "name": "Correct BST with two nodes swapped",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/recover-binary-search-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/ZWGW7FminDM",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "DE Shaw"
    ],
    "slug": "recover-binary-search-tree"
  },
  {
    "id": 350,
    "sheetType": "a2z",
    "category": "Step 14: Binary Search Trees [Concept and Problems]",
    "subcategory": "Practice Problems",
    "name": "Largest BST in Binary Tree",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-sum-bst-in-binary-tree/",
    "gfg": "",
    "youtube": "https://youtu.be/X0oXMdtUDwo",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "maximum-sum-bst-in-binary-tree"
  },
  {
    "id": 351,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Learning",
    "name": "Introduction to Graph",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/3oI-34aPMWM",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "introduction-to-graph"
  },
  {
    "id": 352,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Learning",
    "name": "Graph Representation | C++",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/3oI-34aPMWM",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "graph-representation-c"
  },
  {
    "id": 353,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Learning",
    "name": "Graph Representation | Java",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/3oI-34aPMWM",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "graph-representation-java"
  },
  {
    "id": 354,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Learning",
    "name": "Connected Components",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "connected-components"
  },
  {
    "id": 355,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Learning",
    "name": "Traversal Techniques",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/Qzf1a--rhp8",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "traversal-techniques"
  },
  {
    "id": 356,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Learning",
    "name": "DFS",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/Qzf1a--rhp8",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "dfs"
  },
  {
    "id": 357,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "name": "Number of provinces",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-provinces/#:~:text=A%20province%20is%20a%20group,the%20total%20number%20of%20provinces.",
    "gfg": "",
    "youtube": "https://youtu.be/ACzkVtewUYA",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "number-of-provinces"
  },
  {
    "id": 358,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "name": "Connected Components Problem in Matrix",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "connected-components-problem-in-matrix"
  },
  {
    "id": 359,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "name": "Rotten Oranges",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/rotting-oranges/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=yf3oUhkvqA0",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "rotting-oranges"
  },
  {
    "id": 360,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "name": "Flood fill algorithm",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/flood-fill/",
    "gfg": "",
    "youtube": "",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "flood-fill"
  },
  {
    "id": 361,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "name": "Cycle Detection in Undirected Graph (bfs)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/BPlrALf1LDU",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "cycle-detection-in-undirected-graph-bfs"
  },
  {
    "id": 362,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "name": "Detect a cycle in an undirected graph",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/course-schedule/",
    "gfg": "",
    "youtube": "https://youtu.be/zQ3zgFypzX4",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "course-schedule"
  },
  {
    "id": 363,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "name": "Distance of nearest cell having one",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/01-matrix/",
    "gfg": "",
    "youtube": "https://youtu.be/edXdVwkYHF8",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "01-matrix"
  },
  {
    "id": 364,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "name": "Surrounded Regions",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/surrounded-regions/",
    "gfg": "",
    "youtube": "https://youtu.be/BtdgAys4yMk",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "surrounded-regions"
  },
  {
    "id": 365,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "name": "Number of enclaves",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-enclaves/",
    "gfg": "",
    "youtube": "https://youtu.be/rxKcepXQgU4",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "number-of-enclaves"
  },
  {
    "id": 366,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "name": "Word ladder I",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/word-ladder/",
    "gfg": "",
    "youtube": "https://youtu.be/tRPda0rcf8E",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "word-ladder"
  },
  {
    "id": 367,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "name": "Word ladder II",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/word-ladder-ii/",
    "gfg": "",
    "youtube": "https://youtu.be/AD4SFl7tu7I?si=EpcJQTWm2YeURvEG",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "word-ladder-ii"
  },
  {
    "id": 368,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "name": "Number of islands",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-islands/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=muncqlKJrH0&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=8",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "number-of-islands"
  },
  {
    "id": 369,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "name": "Bipartite Graph (DFS)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/is-graph-bipartite/",
    "gfg": "",
    "youtube": "https://youtu.be/KG5YFfR0j8A",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "is-graph-bipartite"
  },
  {
    "id": 370,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Problems on BFS/DFS",
    "name": "Cycle Detection in Directed Graph (DFS)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/course-schedule-ii/discuss/293048/detecting-cycle-in-directed-graph-problem",
    "gfg": "",
    "youtube": "https://youtu.be/9twcmtQj4DU",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "course-schedule-ii"
  },
  {
    "id": 371,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Topo Sort and Problems",
    "name": "Topo Sort",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/5lZ0iJMrUMk",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "topo-sort"
  },
  {
    "id": 372,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Topo Sort and Problems",
    "name": "Topological sort or Kahn's algorithm",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/5lZ0iJMrUMk",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "topological-sort-or-kahn-s-algorithm"
  },
  {
    "id": 373,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Topo Sort and Problems",
    "name": "Detect a cycle in a directed graph",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/course-schedule/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=uzVUw90ZFIg&list=PLgUwDviBIf0rGEWe64KWas0Nryn7SCRWw&index=12",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "course-schedule"
  },
  {
    "id": 374,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Topo Sort and Problems",
    "name": "Course Schedule I",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/course-schedule/",
    "gfg": "",
    "youtube": "https://youtu.be/WAOfKpxYHR8",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "course-schedule"
  },
  {
    "id": 375,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Topo Sort and Problems",
    "name": "Course Schedule II",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/course-schedule-ii/",
    "gfg": "",
    "youtube": "https://youtu.be/WAOfKpxYHR8",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Netflix"
    ],
    "slug": "course-schedule-ii"
  },
  {
    "id": 376,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Topo Sort and Problems",
    "name": "Find eventual safe states",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/find-eventual-safe-states/",
    "gfg": "",
    "youtube": "https://youtu.be/2gtg3VsDGyc",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "find-eventual-safe-states"
  },
  {
    "id": 377,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Topo Sort and Problems",
    "name": "Alien Dictionary",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/alien-dictionary/solution/",
    "gfg": "",
    "youtube": "https://youtu.be/U3N_je7tWAs",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "alien-dictionary"
  },
  {
    "id": 378,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "name": "Shortest path in undirected graph with unit weights",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=C4gxoTaI71U&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=28",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "shortest-path-in-undirected-graph-with-unit-weights"
  },
  {
    "id": 379,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "name": "Shortest path in DAG",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=ZUFQfFaU-8U&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=27",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "shortest-path-in-dag"
  },
  {
    "id": 380,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "name": "Djisktra's Algorithm",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=rp1SMw7HSO8&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=35",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "djisktra-s-algorithm"
  },
  {
    "id": 381,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "name": "Why priority Queue is used in Djisktra's Algorithm",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=rp1SMw7HSO8&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=35",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "why-priority-queue-is-used-in-djisktra-s-algorithm"
  },
  {
    "id": 382,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "name": "Shortest Distance in a Binary Maze",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=U5Mw4eyUmw4&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=36",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "shortest-path-in-binary-matrix"
  },
  {
    "id": 383,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "name": "Path with minimum effort",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/path-with-minimum-effort/",
    "gfg": "",
    "youtube": "https://youtu.be/0ytpZyiZFhA",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "path-with-minimum-effort"
  },
  {
    "id": 384,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "name": "Cheapest flight within K stops",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
    "gfg": "",
    "youtube": "https://youtu.be/9XybHVqTHcQ",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "cheapest-flights-within-k-stops"
  },
  {
    "id": 385,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "name": "Network Delay Time",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/network-delay-time/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Netflix",
      "Bloomberg"
    ],
    "slug": "network-delay-time"
  },
  {
    "id": 386,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "name": "Number of ways to arrive at destination",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/",
    "gfg": "",
    "youtube": "https://youtu.be/_-0mx0SmYxA",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "number-of-ways-to-arrive-at-destination"
  },
  {
    "id": 387,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "name": "Minimum multiplications to reach end",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=_BvEJ3VIDWw&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=39",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "minimum-multiplications-to-reach-end"
  },
  {
    "id": 388,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "name": "Bellman Ford Algorithm",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/0vVofAhAYjc",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "bellman-ford-algorithm"
  },
  {
    "id": 389,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "name": "Floyd warshall algorithm",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=YbY8cVwWAvw&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=42",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "floyd-warshall-algorithm"
  },
  {
    "id": 390,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Shortest Path Algorithms and Problems",
    "name": "Find the city with the smallest number of neighbors",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/",
    "gfg": "",
    "youtube": "https://youtu.be/9XybHVqTHcQ",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance"
  },
  {
    "id": 391,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "name": "MST theory",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/ZSPjZuZWCME",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "mst-theory"
  },
  {
    "id": 392,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "name": "Prim's Algorithm",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/mJcZjjKzeqk",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "prim-s-algorithm"
  },
  {
    "id": 393,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "name": "Disjoint Set",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/aBxjDBC4M1U",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "disjoint-set"
  },
  {
    "id": 394,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "name": "Find the MST weight",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/mJcZjjKzeqk",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "find-the-mst-weight"
  },
  {
    "id": 395,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "name": "Number of operations to make network connected",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-operations-to-make-network-connected/",
    "gfg": "",
    "youtube": "https://youtu.be/FYrl7iz9_ZU",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Salesforce"
    ],
    "slug": "number-of-operations-to-make-network-connected"
  },
  {
    "id": 396,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "name": "Most stones removed with same row or column",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/",
    "gfg": "",
    "youtube": "https://youtu.be/OwMNX8SPavM",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Snapchat"
    ],
    "slug": "most-stones-removed-with-same-row-or-column"
  },
  {
    "id": 397,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "name": "Accounts merge",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/accounts-merge/",
    "gfg": "",
    "youtube": "https://youtu.be/FMwpt_aQOGw",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "accounts-merge"
  },
  {
    "id": 398,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "name": "Number of islands II",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-islands-ii/",
    "gfg": "",
    "youtube": "https://youtu.be/Rn6B-Q4SNyA",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Uber",
      "Walmart",
      "PhonePe"
    ],
    "slug": "number-of-islands-ii"
  },
  {
    "id": 399,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "name": "Making a large island",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/making-a-large-island/",
    "gfg": "",
    "youtube": "https://youtu.be/lgiz0Oup6gM",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "making-a-large-island"
  },
  {
    "id": 400,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "MinimumSpanningTree/Disjoint Set and Problems",
    "name": "Swim in Rising Water",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/swim-in-rising-water/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Salesforce"
    ],
    "slug": "swim-in-rising-water"
  },
  {
    "id": 401,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Other Algorithms",
    "name": "Bridges in graph",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/critical-connections-in-a-network/discuss/382385/find-bridges-in-a-graph",
    "gfg": "",
    "youtube": "https://youtu.be/qrAub5z8FeA",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Flipkart"
    ],
    "slug": "critical-connections-in-a-network"
  },
  {
    "id": 402,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Other Algorithms",
    "name": "Articulation point in graph",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/j1QDfU21iZk",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "articulation-point-in-graph"
  },
  {
    "id": 403,
    "sheetType": "a2z",
    "category": "Step 15: Graphs [Concepts & Problems]",
    "subcategory": "Other Algorithms",
    "name": "Kosaraju's algorithm",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-number-of-non-overlapping-substrings/discuss/766485/kosaraju-algorithm-on",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=V8qIqJxCioo&list=PLgUwDviBIf0rGEWe64KWas0Nryn7SCRWw&index=27",
    "companies": [
      "Amazon"
    ],
    "slug": "maximum-number-of-non-overlapping-substrings"
  },
  {
    "id": 404,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "Introduction to DP",
    "name": "Introduction to DP",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/tyB0ztf0DNY",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "introduction-to-dp"
  },
  {
    "id": 405,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "1D DP",
    "name": "Climbing stairs",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/climbing-stairs/",
    "gfg": "",
    "youtube": "https://youtu.be/mLfjzJsN8us",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "climbing-stairs"
  },
  {
    "id": 406,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "1D DP",
    "name": "Frog Jump",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=EgG3jsGoPvQ",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle",
      "Snapchat"
    ],
    "slug": "frog-jump"
  },
  {
    "id": 407,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "1D DP",
    "name": "Frog jump with K distances",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=Kmh3rhyEtB8",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "frog-jump-with-k-distances"
  },
  {
    "id": 408,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "1D DP",
    "name": "Maximum sum of non adjacent elements",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/house-robber/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=GrMBfJNk_NY",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "house-robber"
  },
  {
    "id": 409,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "1D DP",
    "name": "House robber",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/house-robber-ii/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=3WaxQMELSkw",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "house-robber-ii"
  },
  {
    "id": 410,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "2D/3D DP and DP on Grids",
    "name": "Ninja's training",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=AE39gJYuRog",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "ninja-s-training"
  },
  {
    "id": 411,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "2D/3D DP and DP on Grids",
    "name": "Grid Unique Paths : DP on Grids (DP8)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/unique-paths/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=sdE0A2Oxofw",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "unique-paths"
  },
  {
    "id": 412,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "2D/3D DP and DP on Grids",
    "name": "Unique paths II",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/unique-paths-ii/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=TmhpgXScLyY",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Nvidia"
    ],
    "slug": "unique-paths-ii"
  },
  {
    "id": 413,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "2D/3D DP and DP on Grids",
    "name": "Minimum Falling Path Sum",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-path-sum/",
    "gfg": "",
    "youtube": "https://youtu.be/_rgTlyky1uQ",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "minimum-path-sum"
  },
  {
    "id": 414,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "2D/3D DP and DP on Grids",
    "name": "Triangle",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/triangle/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=SrP-PiLSYC0",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "triangle"
  },
  {
    "id": 415,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "2D/3D DP and DP on Grids",
    "name": "Ninja and his Friends",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=QGfn7JeXK54",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "ninja-and-his-friends"
  },
  {
    "id": 416,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "name": "Subset sum equal to target (DP- 14)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=fWX9xDmIzRI",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "subset-sum-equal-to-target-dp-14"
  },
  {
    "id": 417,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "name": "Partition equal subset sum",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/partition-equal-subset-sum/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=7win3dcgo3k",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "partition-equal-subset-sum"
  },
  {
    "id": 418,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "name": "Partition a set into two subsets with minimum absolute sum difference",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/partition-array-into-two-arrays-to-minimize-sum-difference/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=GS_OqZb2CWc",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Salesforce"
    ],
    "slug": "partition-array-into-two-arrays-to-minimize-sum-difference"
  },
  {
    "id": 419,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "name": "Count subsets with sum K",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=ZHyb-A2Mte4",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "count-subsets-with-sum-k"
  },
  {
    "id": 420,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "name": "Count partitions with given difference",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=zoilQD1kYSg",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "count-partitions-with-given-difference"
  },
  {
    "id": 421,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "name": "Assign Cookies",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/assign-cookies/",
    "gfg": "",
    "youtube": "https://youtu.be/DIX2p7vb9co?si=GofAIDimue-Av0Fi",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "assign-cookies"
  },
  {
    "id": 422,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "name": "Minimum Coins (DP - 20)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/coin-change/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=myPeWb3Y68A",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "coin-change"
  },
  {
    "id": 423,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "name": "Target sum",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/target-sum/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=b3GD8263-PQ",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Zoho"
    ],
    "slug": "target-sum"
  },
  {
    "id": 424,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "name": "Coin Change 2 (DP - 22)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/coin-change-2/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=HgyouUi11zk",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "coin-change-2"
  },
  {
    "id": 425,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "name": "Unbounded knapsack",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/OgvOZ6OrJoY",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "unbounded-knapsack"
  },
  {
    "id": 426,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Subsequences",
    "name": "Rod Cutting Problem | (DP - 24)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/mO8XpGoJwuo",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "rod-cutting-problem-dp-24"
  },
  {
    "id": 427,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "name": "Longest common subsequence",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/-zI4mrF2Pb4",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "longest-common-subsequence"
  },
  {
    "id": 428,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "name": "Print Longest Common Subsequence | (DP - 26)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/-zI4mrF2Pb4",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "print-longest-common-subsequence-dp-26"
  },
  {
    "id": 429,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "name": "Longest common substring",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/_wP9mWNPL5w",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "longest-common-substring"
  },
  {
    "id": 430,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "name": "Longest palindromic subsequence",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/longest-palindromic-subsequence/",
    "gfg": "",
    "youtube": "https://youtu.be/6i_T5kkfv4A",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "longest-palindromic-subsequence"
  },
  {
    "id": 431,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "name": "Minimum insertions to make string palindrome | DP-29",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=xPBLEj41rFU",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Oracle"
    ],
    "slug": "minimum-insertion-steps-to-make-a-string-palindrome"
  },
  {
    "id": 432,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "name": "Minimum insertions or deletions to convert string A to B",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/delete-operation-for-two-strings/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=yMnH0jrir0Q",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft"
    ],
    "slug": "delete-operation-for-two-strings"
  },
  {
    "id": 433,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "name": "Shortest common supersequence",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/shortest-common-supersequence/",
    "gfg": "",
    "youtube": "https://youtu.be/xElxAuBcvsU",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "shortest-common-supersequence"
  },
  {
    "id": 434,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "name": "Distinct subsequences",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/distinct-subsequences/",
    "gfg": "",
    "youtube": "https://youtu.be/nVG7eTiD2bY",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Salesforce"
    ],
    "slug": "distinct-subsequences"
  },
  {
    "id": 435,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "name": "Edit distance",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/edit-distance/",
    "gfg": "",
    "youtube": "https://youtu.be/fJaKO8FbDdo",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "edit-distance"
  },
  {
    "id": 436,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Strings",
    "name": "Wildcard matching",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/wildcard-matching/",
    "gfg": "",
    "youtube": "https://youtu.be/ZmlQ3vgAOMo",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "DE Shaw"
    ],
    "slug": "wildcard-matching"
  },
  {
    "id": 437,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Stocks",
    "name": "Best time to buy and sell stock",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "gfg": "",
    "youtube": "https://youtu.be/excAOvwF_Wk",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "best-time-to-buy-and-sell-stock"
  },
  {
    "id": 438,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Stocks",
    "name": "Best time to buy and sell stock II",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/",
    "gfg": "",
    "youtube": "https://youtu.be/nGJmxkUJQGs",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "best-time-to-buy-and-sell-stock-ii"
  },
  {
    "id": 439,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Stocks",
    "name": "Best time to buy and sell stock III",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/description/",
    "gfg": "",
    "youtube": "https://youtu.be/-uQGzhYj8BQ",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "best-time-to-buy-and-sell-stock-iii"
  },
  {
    "id": 440,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Stocks",
    "name": "Best time to buy and sell stock IV",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/",
    "gfg": "",
    "youtube": "https://youtu.be/IV1dHbk5CDc",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Goldman Sachs"
    ],
    "slug": "best-time-to-buy-and-sell-stock-iv"
  },
  {
    "id": 441,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Stocks",
    "name": "Best Time to Buy and Sell Stock with Cooldown",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/",
    "gfg": "",
    "youtube": "https://youtu.be/IGIe46xw3YY",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "best-time-to-buy-and-sell-stock-with-cooldown"
  },
  {
    "id": 442,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Stocks",
    "name": "Best time to buy and sell stock with transaction fees",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/",
    "gfg": "",
    "youtube": "https://youtu.be/k4eK-vEmnKg",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "best-time-to-buy-and-sell-stock-with-transaction-fee"
  },
  {
    "id": 443,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on LIS",
    "name": "Longest Increasing Subsequence",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/on2hvxBXJH4",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "longest-increasing-subsequence"
  },
  {
    "id": 444,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on LIS",
    "name": "Print Longest Increasing Subsequence",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/IFfYfonAFGc",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "print-longest-increasing-subsequence"
  },
  {
    "id": 445,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on LIS",
    "name": "Longest Increasing Subsequence |(DP-43)",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/on2hvxBXJH4",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "longest-increasing-subsequence-dp-43"
  },
  {
    "id": 446,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on LIS",
    "name": "Largest Divisible Subset",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/largest-divisible-subset/",
    "gfg": "",
    "youtube": "https://youtu.be/gDuZwBW9VvM",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "largest-divisible-subset"
  },
  {
    "id": 447,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on LIS",
    "name": "Longest String Chain",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/longest-string-chain/",
    "gfg": "",
    "youtube": "https://youtu.be/YY8iBaYcc4g",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "DE Shaw"
    ],
    "slug": "longest-string-chain"
  },
  {
    "id": 448,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on LIS",
    "name": "Longest Bitonic Subsequence",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/y4vN0WNdrlg",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Flipkart",
      "Adobe"
    ],
    "slug": "longest-bitonic-subsequence"
  },
  {
    "id": 449,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on LIS",
    "name": "Number of Longest Increasing Subsequences",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/number-of-longest-increasing-subsequence/",
    "gfg": "",
    "youtube": "https://youtu.be/cKVl1TFdNXg",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "number-of-longest-increasing-subsequence"
  },
  {
    "id": 450,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "MCM DP | Partition DP",
    "name": "Matrix chain multiplication",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/vRVfmbCFW7Y",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "matrix-chain-multiplication"
  },
  {
    "id": 451,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "MCM DP | Partition DP",
    "name": "Matrix Chain Multiplication | Bottom-Up|(DP-49)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/pDCXsbAw5Cg",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "matrix-chain-multiplication-bottom-up-dp-49"
  },
  {
    "id": 452,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "MCM DP | Partition DP",
    "name": "Minimum cost to cut the stick",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/",
    "gfg": "",
    "youtube": "https://youtu.be/xwomavsC86c",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "minimum-cost-to-cut-a-stick"
  },
  {
    "id": 453,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "MCM DP | Partition DP",
    "name": "Burst balloons",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/burst-balloons/",
    "gfg": "",
    "youtube": "https://youtu.be/Yz4LlDSlkns",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs"
    ],
    "slug": "burst-balloons"
  },
  {
    "id": 454,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "MCM DP | Partition DP",
    "name": "Different Ways to Evaluate a Boolean Expression",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/parsing-a-boolean-expression/",
    "gfg": "",
    "youtube": "https://youtu.be/MM7fXopgyjw",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "parsing-a-boolean-expression"
  },
  {
    "id": 455,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "MCM DP | Partition DP",
    "name": "Palindrome partitioning II",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/palindrome-partitioning-ii/",
    "gfg": "",
    "youtube": "https://youtu.be/_H8V5hJUGd0",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "palindrome-partitioning-ii"
  },
  {
    "id": 456,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "MCM DP | Partition DP",
    "name": "Partition Array for Maximum Sum",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/partition-array-for-maximum-sum/",
    "gfg": "",
    "youtube": "https://youtu.be/PhWWJmaKfMc",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "partition-array-for-maximum-sum"
  },
  {
    "id": 457,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Squares",
    "name": "Maximum Rectangle Area with all 1's|(DP-55)",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximal-rectangle/",
    "gfg": "",
    "youtube": "https://youtu.be/tOylVCugy9k",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "maximal-rectangle"
  },
  {
    "id": 458,
    "sheetType": "a2z",
    "category": "Step 16: Dynamic Programming [Patterns and Problems]",
    "subcategory": "DP on Squares",
    "name": "Count Square Submatrices with All Ones|(DP-56)",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/count-square-submatrices-with-all-ones/",
    "gfg": "",
    "youtube": "https://youtu.be/auS1fynpnjo",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Goldman Sachs",
      "Bloomberg"
    ],
    "slug": "count-square-submatrices-with-all-ones"
  },
  {
    "id": 459,
    "sheetType": "a2z",
    "category": "Step 17: Tries",
    "subcategory": "Theory",
    "name": "Trie Implementation and Operations",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/implement-trie-prefix-tree/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=dBGUmUQhjaM&list=PLgUwDviBIf0pcIDCZnxhv0LkHf5KzG9zp",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "slug": "implement-trie-prefix-tree"
  },
  {
    "id": 460,
    "sheetType": "a2z",
    "category": "Step 17: Tries",
    "subcategory": "Problems",
    "name": "Trie Implementation and Advanced Operations",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "trie-implementation-and-advanced-operations"
  },
  {
    "id": 461,
    "sheetType": "a2z",
    "category": "Step 17: Tries",
    "subcategory": "Problems",
    "name": "Longest Word with All Prefixes",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=AWnBa91lThI&list=PLgUwDviBIf0pcIDCZnxhv0LkHf5KzG9zp&index=3",
    "article": "",
    "companies": [
      "Google"
    ],
    "slug": "longest-word-with-all-prefixes"
  },
  {
    "id": 462,
    "sheetType": "a2z",
    "category": "Step 17: Tries",
    "subcategory": "Problems",
    "name": "Number of distinct substrings in a string",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=RV0QeTyHZxo&list=PLgUwDviBIf0pcIDCZnxhv0LkHf5KzG9zp&index=4",
    "companies": [
      "Uber",
      "Bloomberg",
      "Intuit"
    ],
    "slug": "number-of-distinct-substrings-in-a-string"
  },
  {
    "id": 463,
    "sheetType": "a2z",
    "category": "Step 17: Tries",
    "subcategory": "Problems",
    "name": "Bit PreRequisites for TRIE Problems",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "https://youtu.be/5iyuU4hQFrw",
    "article": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "bit-prerequisites-for-trie-problems"
  },
  {
    "id": 464,
    "sheetType": "a2z",
    "category": "Step 17: Tries",
    "subcategory": "Problems",
    "name": "Maximum XOR of two numbers in an array",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=EIhAwfHubE8&list=PLgUwDviBIf0pcIDCZnxhv0LkHf5KzG9zp&index=6",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "maximum-xor-of-two-numbers-in-an-array"
  },
  {
    "id": 465,
    "sheetType": "a2z",
    "category": "Step 17: Tries",
    "subcategory": "Problems",
    "name": "Maximum Xor with an element from an array",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/maximum-xor-with-an-element-from-array/",
    "gfg": "",
    "youtube": "https://www.youtube.com/watch?v=Q8LhG9Pi5KM&list=PLgUwDviBIf0pcIDCZnxhv0LkHf5KzG9zp&index=7",
    "companies": [
      "Google"
    ],
    "slug": "maximum-xor-with-an-element-from-array"
  },
  {
    "id": 466,
    "sheetType": "a2z",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "name": "Minimum number of bracket reversals to make an expression balanced",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "slug": "minimum-add-to-make-parentheses-valid"
  },
  {
    "id": 467,
    "sheetType": "a2z",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "name": "Count and say",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/count-and-say/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Bloomberg",
      "Oracle"
    ],
    "slug": "count-and-say"
  },
  {
    "id": 468,
    "sheetType": "a2z",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "name": "Hashing In Strings | Theory",
    "difficulty": "Easy",
    "rating": "4.5 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google",
      "Adobe",
      "TCS"
    ],
    "slug": "hashing-in-strings-theory"
  },
  {
    "id": 469,
    "sheetType": "a2z",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "name": "Rabin Karp Algorithm",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/repeated-string-match/discuss/416144/Rabin-Karp-algorithm-C%2B%2B-implementation",
    "gfg": "",
    "youtube": "",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "repeated-string-match"
  },
  {
    "id": 470,
    "sheetType": "a2z",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "name": "Z function",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "z-function"
  },
  {
    "id": 471,
    "sheetType": "a2z",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "name": "KMP Algorithm or LPS array",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/implement-strstr/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "slug": "implement-strstr"
  },
  {
    "id": 472,
    "sheetType": "a2z",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "name": "Shortest Palindrome",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "",
    "gfg": "",
    "youtube": "",
    "article": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Uber",
      "Bloomberg"
    ],
    "slug": "shortest-palindrome"
  },
  {
    "id": 473,
    "sheetType": "a2z",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "name": "Longest happy prefix",
    "difficulty": "Hard",
    "rating": "4.8 / 5",
    "leetcode": "https://leetcode.com/problems/longest-happy-prefix/",
    "gfg": "",
    "youtube": "",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Microsoft",
      "Apple",
      "Bloomberg"
    ],
    "slug": "longest-happy-prefix"
  },
  {
    "id": 474,
    "sheetType": "a2z",
    "category": "Step 18: Strings",
    "subcategory": "Hard Problems",
    "name": "Count Palindromic Subsequences",
    "difficulty": "Medium",
    "rating": "4.5 / 5",
    "leetcode": "https://leetcode.com/problems/count-palindromic-subsequences/",
    "gfg": "",
    "youtube": "",
    "article": "",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Uber",
      "Goldman Sachs",
      "Atlassian"
    ],
    "slug": "count-palindromic-subsequences"
  }
];
export const A2Z_DSA_SHEET_473_DATA: DSAProblem[] = A2Z_DSA_SHEET_474_DATA;
export { BLIND_75_SHEET_DATA } from './blind75SheetData';
export { CODESTORYWITHMIK_SHEET_DATA } from './mikSheetData';

// Default SDE Sheet reference for backward compatibility (Single POTD source)
export const SDE_SHEET_DATA: DSAProblem[] = SDE_SHEET_191_DATA;

export const ALL_SHEETS_MAP: Record<DSASheetType, DSAProblem[]> = {
  sde: SDE_SHEET_191_DATA,
  a2z: A2Z_DSA_SHEET_474_DATA,
  79: SDETUBE_79_SHEET_DATA,
  blind75: BLIND_75_SHEET_DATA,
  mik: CODESTORYWITHMIK_SHEET_DATA
};

export function getSheetData(sheetType: DSASheetType): DSAProblem[] {
  return ALL_SHEETS_MAP[sheetType] || SDE_SHEET_191_DATA;
}

export function getUniversalSdePotd(): DSAProblem {
  const today = new Date().toISOString().slice(0, 10);
  // 1. Check if admin has set a custom POTD override for today
  if (typeof window !== 'undefined') {
    try {
      const customRaw = localStorage.getItem(`sdetube_custom_potd_${today}`);
      if (customRaw) {
        const parsed = JSON.parse(customRaw);
        if (parsed && (parsed.name || parsed.title) && parsed.slug) {
          return {
            id: parsed.id || 9999,
            name: parsed.name || parsed.title,
            title: parsed.title || parsed.name,
            slug: parsed.slug,
            difficulty: parsed.difficulty || 'Medium',
            category: parsed.category || parsed.topic || 'DSA',
            leetcode: parsed.leetcode || parsed.url || `https://leetcode.com/problems/${parsed.slug}/`,
            sheet: parsed.sheet || 'Curated POTD'
          } as unknown as DSAProblem;
        }
      }
    } catch {}
  }

  // 2. Default rotational seed based on date
  const daySeed = Math.abs(today.split('-').reduce((acc, p) => acc + parseInt(p, 10), 0));
  return SDE_SHEET_191_DATA[daySeed % SDE_SHEET_191_DATA.length] || SDE_SHEET_191_DATA[0];
}

