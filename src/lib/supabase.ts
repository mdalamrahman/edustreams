import { createClient } from '@supabase/supabase-js';
import { Channel, Video } from './types';

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-b4G7T-uPojtUC3nDGD_JQ_xR2UzNO3';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://edustream-demo.supabase.co';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const MOCK_CHANNELS: Channel[] = [
  {
    id: 'ch-dsa-01',
    telegram_channel_id: -1004390749731,
    category_name: 'DSA',
    description: 'Striver DSA Sheet, LeetCode Patterns, Dynamic Programming, Graphs & Trees (47 Real Telegram Videos)',
    icon: 'code-2',
    created_at: new Date().toISOString(),
    post_count: 47
  },
  {
    id: 'ch-sd-02',
    telegram_channel_id: -1004329144420,
    category_name: 'System Design',
    description: 'STRIVER LLD: Low Level Design, Microservices, Caching & Distributed Consensus (48 Real Telegram Videos)',
    icon: 'cpu',
    created_at: new Date().toISOString(),
    post_count: 48
  },
  {
    id: 'ch-dbms-03',
    telegram_channel_id: -1004332462419,
    category_name: 'DBMS',
    description: 'Striver DBMS: Relational Algebra, B+ Trees, SQL Optimization & MVCC Locks (47 Real Telegram Videos)',
    icon: 'database',
    created_at: new Date().toISOString(),
    post_count: 47
  },
  {
    id: 'ch-cn-04',
    telegram_channel_id: -1004308430774,
    category_name: 'Computer Networks',
    description: 'Striver CN: TCP/IP Stack, Subnetting, Socket Programming & HTTP/3 Traces (40 Real Telegram Videos)',
    icon: 'network',
    created_at: new Date().toISOString(),
    post_count: 40
  }
];

export const MOCK_VIDEOS: Video[] = [
{
  "id": "tg-exact-dsa-7121",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997238",
  "telegram_message_id": 7121,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 1: Count primes in range L to R",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7121 | Size: 17.7 MB]\nFile: Count primes in range L to R.mp4\nLocation: 19. Maths/01. Sieve of Eratosthenes/03. Count prime",
  "duration_seconds": 350,
  "transcript": "Ingested from Telegram Channel Post #7121 (Count primes in range L to R.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7121",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 1: Count primes in range L to R",
      "starter_code": "# Implementation for Count primes in range L to R.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7121",
      "video_id": "tg-exact-dsa-7121",
      "telegram_file_id": "5014767384896997238",
      "file_name": "Count primes in range L to R.mp4",
      "file_type": "mp4",
      "file_size_bytes": 18559795,
      "download_url": "/api/download/-5475342376/7121?file_name=Count primes in range L to R.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Count primes in range L to R.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7120",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997237",
  "telegram_message_id": 7120,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 2: Prime factorisation of a Number",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7120 | Size: 11.4 MB]\nFile: Prime factorisation of a Number.mp4\nLocation: 19. Maths/01. Sieve of Eratosthenes/02. Prime fa",
  "duration_seconds": 228,
  "transcript": "Ingested from Telegram Channel Post #7120 (Prime factorisation of a Number.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7120",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 2: Prime factorisation of a Number",
      "starter_code": "# Implementation for Prime factorisation of a Number.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7120",
      "video_id": "tg-exact-dsa-7120",
      "telegram_file_id": "5014767384896997237",
      "file_name": "Prime factorisation of a Number.mp4",
      "file_type": "mp4",
      "file_size_bytes": 11953766,
      "download_url": "/api/download/-5475342376/7120?file_name=Prime factorisation of a Number.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Prime factorisation of a Number.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7119",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997236",
  "telegram_message_id": 7119,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 3: Print all primes till N",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7119 | Size: 54.4 MB]\nFile: Print all primes till N.mp4\nLocation: 19. Maths/01. Sieve of Eratosthenes/01. Print all primes",
  "duration_seconds": 1074,
  "transcript": "Ingested from Telegram Channel Post #7119 (Print all primes till N.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7119",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 3: Print all primes till N",
      "starter_code": "# Implementation for Print all primes till N.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7119",
      "video_id": "tg-exact-dsa-7119",
      "telegram_file_id": "5014767384896997236",
      "file_name": "Print all primes till N.mp4",
      "file_type": "mp4",
      "file_size_bytes": 57042534,
      "download_url": "/api/download/-5475342376/7119?file_name=Print all primes till N.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Print all primes till N.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7118",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997235",
  "telegram_message_id": 7118,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 4: Shortest Palindrome",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7118 | Size: 19.8 MB]\nFile: Shortest Palindrome.mp4\nLocation: 18. Strings (Advanced Algo)/02. Advanced Problems (Less aske",
  "duration_seconds": 418,
  "transcript": "Ingested from Telegram Channel Post #7118 (Shortest Palindrome.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7118",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 4: Shortest Palindrome",
      "starter_code": "# Implementation for Shortest Palindrome.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7118",
      "video_id": "tg-exact-dsa-7118",
      "telegram_file_id": "5014767384896997235",
      "file_name": "Shortest Palindrome.mp4",
      "file_type": "mp4",
      "file_size_bytes": 20761804,
      "download_url": "/api/download/-5475342376/7118?file_name=Shortest Palindrome.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Shortest Palindrome.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7117",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997234",
  "telegram_message_id": 7117,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 5: KMP Algorithm or LPS array",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7117 | Size: 24.4 MB]\nFile: KMP Algorithm or LPS array.mp4\nLocation: 18. Strings (Advanced Algo)/02. Advanced Problems (Le",
  "duration_seconds": 565,
  "transcript": "Ingested from Telegram Channel Post #7117 (KMP Algorithm or LPS array.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7117",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 5: KMP Algorithm or LPS array",
      "starter_code": "# Implementation for KMP Algorithm or LPS array.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7117",
      "video_id": "tg-exact-dsa-7117",
      "telegram_file_id": "5014767384896997234",
      "file_name": "KMP Algorithm or LPS array.mp4",
      "file_type": "mp4",
      "file_size_bytes": 25585254,
      "download_url": "/api/download/-5475342376/7117?file_name=KMP Algorithm or LPS array.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (KMP Algorithm or LPS array.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7116",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997233",
  "telegram_message_id": 7116,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 6: Z function",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7116 | Size: 25.2 MB]\nFile: Z function.mp4\nLocation: 18. Strings (Advanced Algo)/02. Advanced Problems (Less asked)/02. Z ",
  "duration_seconds": 574,
  "transcript": "Ingested from Telegram Channel Post #7116 (Z function.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7116",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 6: Z function",
      "starter_code": "# Implementation for Z function.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7116",
      "video_id": "tg-exact-dsa-7116",
      "telegram_file_id": "5014767384896997233",
      "file_name": "Z function.mp4",
      "file_type": "mp4",
      "file_size_bytes": 26424115,
      "download_url": "/api/download/-5475342376/7116?file_name=Z function.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Z function.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7115",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997232",
  "telegram_message_id": 7115,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 7: Rabin Karp Algorithm",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7115 | Size: 34.6 MB]\nFile: Rabin Karp Algorithm.mp4\nLocation: 18. Strings (Advanced Algo)/02. Advanced Problems (Less ask",
  "duration_seconds": 785,
  "transcript": "Ingested from Telegram Channel Post #7115 (Rabin Karp Algorithm.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7115",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 7: Rabin Karp Algorithm",
      "starter_code": "# Implementation for Rabin Karp Algorithm.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7115",
      "video_id": "tg-exact-dsa-7115",
      "telegram_file_id": "5014767384896997232",
      "file_name": "Rabin Karp Algorithm.mp4",
      "file_type": "mp4",
      "file_size_bytes": 36280729,
      "download_url": "/api/download/-5475342376/7115?file_name=Rabin Karp Algorithm.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Rabin Karp Algorithm.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7114",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997231",
  "telegram_message_id": 7114,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 8: Count and say",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7114 | Size: 63.5 MB]\nFile: Count and say.mp4\nLocation: 18. Strings (Advanced Algo)/01. Medium Problems/03. Count and say\n",
  "duration_seconds": 1146,
  "transcript": "Ingested from Telegram Channel Post #7114 (Count and say.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7114",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 8: Count and say",
      "starter_code": "# Implementation for Count and say.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7114",
      "video_id": "tg-exact-dsa-7114",
      "telegram_file_id": "5014767384896997231",
      "file_name": "Count and say.mp4",
      "file_type": "mp4",
      "file_size_bytes": 66584576,
      "download_url": "/api/download/-5475342376/7114?file_name=Count and say.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Count and say.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7113",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997230",
  "telegram_message_id": 7113,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 9: Minimum_number_of_bracket_reversals_to_make_an_expression_balanced",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7113 | Size: 70.0 MB]\nFile: Minimum number of bracket reversals to make an expression balanced.mp4\nLocation: 18. Strings (",
  "duration_seconds": 1169,
  "transcript": "Ingested from Telegram Channel Post #7113 (Minimum_number_of_bracket_reversals_to_make_an_expression_balanced.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7113",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 9: Minimum_number_of_bracket_reversals_to_make_an_expression_balanced",
      "starter_code": "# Implementation for Minimum_number_of_bracket_reversals_to_make_an_expression_balanced.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7113",
      "video_id": "tg-exact-dsa-7113",
      "telegram_file_id": "5014767384896997230",
      "file_name": "Minimum_number_of_bracket_reversals_to_make_an_expression_balanced.mp4",
      "file_type": "mp4",
      "file_size_bytes": 73400320,
      "download_url": "/api/download/-5475342376/7113?file_name=Minimum_number_of_bracket_reversals_to_make_an_expression_balanced.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Minimum_number_of_bracket_reversals_to_make_an_expression_balanced.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7112",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997229",
  "telegram_message_id": 7112,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 10: Reverse every word in a string",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7112 | Size: 56.0 MB]\nFile: Reverse every word in a string.mp4\nLocation: 18. Strings (Advanced Algo)/01. Medium Problems/0",
  "duration_seconds": 940,
  "transcript": "Ingested from Telegram Channel Post #7112 (Reverse every word in a string.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7112",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 10: Reverse every word in a string",
      "starter_code": "# Implementation for Reverse every word in a string.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7112",
      "video_id": "tg-exact-dsa-7112",
      "telegram_file_id": "5014767384896997229",
      "file_name": "Reverse every word in a string.mp4",
      "file_type": "mp4",
      "file_size_bytes": 58720256,
      "download_url": "/api/download/-5475342376/7112?file_name=Reverse every word in a string.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Reverse every word in a string.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7111",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997228",
  "telegram_message_id": 7111,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 11: Maximum Xor with an element from an array",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7111 | Size: 86.1 MB]\nFile: Maximum Xor with an element from an array.mp4\nLocation: 17. Tries/02. Problems/04. Maximum Xor",
  "duration_seconds": 1394,
  "transcript": "Ingested from Telegram Channel Post #7111 (Maximum Xor with an element from an array.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7111",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 11: Maximum Xor with an element from an array",
      "starter_code": "# Implementation for Maximum Xor with an element from an array.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7111",
      "video_id": "tg-exact-dsa-7111",
      "telegram_file_id": "5014767384896997228",
      "file_name": "Maximum Xor with an element from an array.mp4",
      "file_type": "mp4",
      "file_size_bytes": 90282393,
      "download_url": "/api/download/-5475342376/7111?file_name=Maximum Xor with an element from an array.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Maximum Xor with an element from an array.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7110",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997227",
  "telegram_message_id": 7110,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 12: Maximum XOR of two numbers in an array",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7110 | Size: 107.3 MB]\nFile: Maximum XOR of two numbers in an array.mp4\nLocation: 17. Tries/02. Problems/03. Maximum XOR of",
  "duration_seconds": 2039,
  "transcript": "Ingested from Telegram Channel Post #7110 (Maximum XOR of two numbers in an array.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7110",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 12: Maximum XOR of two numbers in an array",
      "starter_code": "# Implementation for Maximum XOR of two numbers in an array.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7110",
      "video_id": "tg-exact-dsa-7110",
      "telegram_file_id": "5014767384896997227",
      "file_name": "Maximum XOR of two numbers in an array.mp4",
      "file_type": "mp4",
      "file_size_bytes": 112512204,
      "download_url": "/api/download/-5475342376/7110?file_name=Maximum XOR of two numbers in an array.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Maximum XOR of two numbers in an array.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7109",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997226",
  "telegram_message_id": 7109,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 13: Number of distinct substrings in a string",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7109 | Size: 23.1 MB]\nFile: Number of distinct substrings in a string.mp4\nLocation: 17. Tries/02. Problems/02. Number of d",
  "duration_seconds": 496,
  "transcript": "Ingested from Telegram Channel Post #7109 (Number of distinct substrings in a string.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7109",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 13: Number of distinct substrings in a string",
      "starter_code": "# Implementation for Number of distinct substrings in a string.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7109",
      "video_id": "tg-exact-dsa-7109",
      "telegram_file_id": "5014767384896997226",
      "file_name": "Number of distinct substrings in a string.mp4",
      "file_type": "mp4",
      "file_size_bytes": 24222105,
      "download_url": "/api/download/-5475342376/7109?file_name=Number of distinct substrings in a string.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Number of distinct substrings in a string.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7108",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997225",
  "telegram_message_id": 7108,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 14: Longest Word with All Prefixes",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7108 | Size: 81.0 MB]\nFile: Longest Word with All Prefixes.mp4\nLocation: 17. Tries/02. Problems/01. Longest Word with All ",
  "duration_seconds": 1476,
  "transcript": "Ingested from Telegram Channel Post #7108 (Longest Word with All Prefixes.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7108",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 14: Longest Word with All Prefixes",
      "starter_code": "# Implementation for Longest Word with All Prefixes.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7108",
      "video_id": "tg-exact-dsa-7108",
      "telegram_file_id": "5014767384896997225",
      "file_name": "Longest Word with All Prefixes.mp4",
      "file_type": "mp4",
      "file_size_bytes": 84934656,
      "download_url": "/api/download/-5475342376/7108?file_name=Longest Word with All Prefixes.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Longest Word with All Prefixes.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7107",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997224",
  "telegram_message_id": 7107,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 15: Trie Implementation and Advanced Operations",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7107 | Size: 80.7 MB]\nFile: Trie Implementation and Advanced Operations.mp4\nLocation: 17. Tries/01. Theory/02. Trie Implem",
  "duration_seconds": 1330,
  "transcript": "Ingested from Telegram Channel Post #7107 (Trie Implementation and Advanced Operations.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7107",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 15: Trie Implementation and Advanced Operations",
      "starter_code": "# Implementation for Trie Implementation and Advanced Operations.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7107",
      "video_id": "tg-exact-dsa-7107",
      "telegram_file_id": "5014767384896997224",
      "file_name": "Trie Implementation and Advanced Operations.mp4",
      "file_type": "mp4",
      "file_size_bytes": 84620083,
      "download_url": "/api/download/-5475342376/7107?file_name=Trie Implementation and Advanced Operations.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Trie Implementation and Advanced Operations.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7106",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997223",
  "telegram_message_id": 7106,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 16: Trie Implementation and Operations",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7106 | Size: 102.1 MB]\nFile: Trie Implementation and Operations.mp4\nLocation: 17. Tries/01. Theory/01. Trie Implementation ",
  "duration_seconds": 1780,
  "transcript": "Ingested from Telegram Channel Post #7106 (Trie Implementation and Operations.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7106",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 16: Trie Implementation and Operations",
      "starter_code": "# Implementation for Trie Implementation and Operations.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7106",
      "video_id": "tg-exact-dsa-7106",
      "telegram_file_id": "5014767384896997223",
      "file_name": "Trie Implementation and Operations.mp4",
      "file_type": "mp4",
      "file_size_bytes": 107059609,
      "download_url": "/api/download/-5475342376/7106?file_name=Trie Implementation and Operations.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Trie Implementation and Operations.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7105",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997222",
  "telegram_message_id": 7105,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 17: Palindrome partitioning II",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7105 | Size: 154.9 MB]\nFile: Palindrome partitioning II.mp4\nLocation: 16. Dynamic Programming/09. MCM DP/04. Palindrome par",
  "duration_seconds": 1190,
  "transcript": "Ingested from Telegram Channel Post #7105 (Palindrome partitioning II.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7105",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 17: Palindrome partitioning II",
      "starter_code": "# Implementation for Palindrome partitioning II.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7105",
      "video_id": "tg-exact-dsa-7105",
      "telegram_file_id": "5014767384896997222",
      "file_name": "Palindrome partitioning II.mp4",
      "file_type": "mp4",
      "file_size_bytes": 162424422,
      "download_url": "/api/download/-5475342376/7105?file_name=Palindrome partitioning II.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Palindrome partitioning II.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7104",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997221",
  "telegram_message_id": 7104,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 18: Burst balloons",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7104 | Size: 209.2 MB]\nFile: Burst balloons.mp4\nLocation: 16. Dynamic Programming/09. MCM DP/03. Burst balloons\n\nFollow Now",
  "duration_seconds": 1723,
  "transcript": "Ingested from Telegram Channel Post #7104 (Burst balloons.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-06-18T17:09:42+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7104",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 18: Burst balloons",
      "starter_code": "# Implementation for Burst balloons.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7104",
      "video_id": "tg-exact-dsa-7104",
      "telegram_file_id": "5014767384896997221",
      "file_name": "Burst balloons.mp4",
      "file_type": "mp4",
      "file_size_bytes": 219362099,
      "download_url": "/api/download/-5475342376/7104?file_name=Burst balloons.mp4",
      "created_at": "2026-06-18T17:09:42+00:00",
      "caption": "Telegram Study Attachment (Burst balloons.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7103",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997220",
  "telegram_message_id": 7103,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 19: Minimum cost to cut the stick",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7103 | Size: 180.6 MB]\nFile: Minimum cost to cut the stick.mp4\nLocation: 16. Dynamic Programming/09. MCM DP/02. Minimum cos",
  "duration_seconds": 1434,
  "transcript": "Ingested from Telegram Channel Post #7103 (Minimum cost to cut the stick.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-06-18T17:08:45+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7103",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 19: Minimum cost to cut the stick",
      "starter_code": "# Implementation for Minimum cost to cut the stick.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7103",
      "video_id": "tg-exact-dsa-7103",
      "telegram_file_id": "5014767384896997220",
      "file_name": "Minimum cost to cut the stick.mp4",
      "file_type": "mp4",
      "file_size_bytes": 189372825,
      "download_url": "/api/download/-5475342376/7103?file_name=Minimum cost to cut the stick.mp4",
      "created_at": "2026-06-18T17:08:45+00:00",
      "caption": "Telegram Study Attachment (Minimum cost to cut the stick.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7102",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997219",
  "telegram_message_id": 7102,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 20: Matrix chain multiplication",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7102 | Size: 365.5 MB]\nFile: Matrix chain multiplication.mp4\nLocation: 16. Dynamic Programming/09. MCM DP/01. Matrix chain ",
  "duration_seconds": 3182,
  "transcript": "Ingested from Telegram Channel Post #7102 (Matrix chain multiplication.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-06-18T17:08:45+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7102",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 20: Matrix chain multiplication",
      "starter_code": "# Implementation for Matrix chain multiplication.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7102",
      "video_id": "tg-exact-dsa-7102",
      "telegram_file_id": "5014767384896997219",
      "file_name": "Matrix chain multiplication.mp4",
      "file_type": "mp4",
      "file_size_bytes": 383254528,
      "download_url": "/api/download/-5475342376/7102?file_name=Matrix chain multiplication.mp4",
      "created_at": "2026-06-18T17:08:45+00:00",
      "caption": "Telegram Study Attachment (Matrix chain multiplication.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7101",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997218",
  "telegram_message_id": 7101,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 21: Wildcard matching",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7101 | Size: 194.6 MB]\nFile: Wildcard matching.mp4\nLocation: 16. Dynamic Programming/08. DP on strings/09. Wildcard matchin",
  "duration_seconds": 1866,
  "transcript": "Ingested from Telegram Channel Post #7101 (Wildcard matching.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-06-18T17:08:45+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7101",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 21: Wildcard matching",
      "starter_code": "# Implementation for Wildcard matching.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7101",
      "video_id": "tg-exact-dsa-7101",
      "telegram_file_id": "5014767384896997218",
      "file_name": "Wildcard matching.mp4",
      "file_type": "mp4",
      "file_size_bytes": 204052889,
      "download_url": "/api/download/-5475342376/7101?file_name=Wildcard matching.mp4",
      "created_at": "2026-06-18T17:08:45+00:00",
      "caption": "Telegram Study Attachment (Wildcard matching.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7100",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997217",
  "telegram_message_id": 7100,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 22: Edit distance",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7100 | Size: 199.1 MB]\nFile: Edit distance.mp4\nLocation: 16. Dynamic Programming/08. DP on strings/08. Edit distance\n\nFollo",
  "duration_seconds": 1601,
  "transcript": "Ingested from Telegram Channel Post #7100 (Edit distance.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-06-18T17:08:45+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7100",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 22: Edit distance",
      "starter_code": "# Implementation for Edit distance.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7100",
      "video_id": "tg-exact-dsa-7100",
      "telegram_file_id": "5014767384896997217",
      "file_name": "Edit distance.mp4",
      "file_type": "mp4",
      "file_size_bytes": 208771481,
      "download_url": "/api/download/-5475342376/7100?file_name=Edit distance.mp4",
      "created_at": "2026-06-18T17:08:45+00:00",
      "caption": "Telegram Study Attachment (Edit distance.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7099",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997216",
  "telegram_message_id": 7099,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 23: Distinct subsequences",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7099 | Size: 166.1 MB]\nFile: Distinct subsequences.mp4\nLocation: 16. Dynamic Programming/08. DP on strings/07. Distinct sub",
  "duration_seconds": 1311,
  "transcript": "Ingested from Telegram Channel Post #7099 (Distinct subsequences.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-06-18T17:08:45+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7099",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 23: Distinct subsequences",
      "starter_code": "# Implementation for Distinct subsequences.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7099",
      "video_id": "tg-exact-dsa-7099",
      "telegram_file_id": "5014767384896997216",
      "file_name": "Distinct subsequences.mp4",
      "file_type": "mp4",
      "file_size_bytes": 174168473,
      "download_url": "/api/download/-5475342376/7099?file_name=Distinct subsequences.mp4",
      "created_at": "2026-06-18T17:08:45+00:00",
      "caption": "Telegram Study Attachment (Distinct subsequences.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7098",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997215",
  "telegram_message_id": 7098,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 24: Shortest common supersequence",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7098 | Size: 202.4 MB]\nFile: Shortest common supersequence.mp4\nLocation: 16. Dynamic Programming/08. DP on strings/06. Shor",
  "duration_seconds": 1555,
  "transcript": "Ingested from Telegram Channel Post #7098 (Shortest common supersequence.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-06-18T17:08:45+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7098",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 24: Shortest common supersequence",
      "starter_code": "# Implementation for Shortest common supersequence.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7098",
      "video_id": "tg-exact-dsa-7098",
      "telegram_file_id": "5014767384896997215",
      "file_name": "Shortest common supersequence.mp4",
      "file_type": "mp4",
      "file_size_bytes": 212231782,
      "download_url": "/api/download/-5475342376/7098?file_name=Shortest common supersequence.mp4",
      "created_at": "2026-06-18T17:08:45+00:00",
      "caption": "Telegram Study Attachment (Shortest common supersequence.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7097",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997214",
  "telegram_message_id": 7097,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 25: Minimum insertions or deletions to convert string A to B",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7097 | Size: 57.8 MB]\nFile: Minimum insertions or deletions to convert string A to B.mp4\nLocation: 16. Dynamic Programming",
  "duration_seconds": 426,
  "transcript": "Ingested from Telegram Channel Post #7097 (Minimum insertions or deletions to convert string A to B.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-06-18T17:08:45+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7097",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 25: Minimum insertions or deletions to convert string A to B",
      "starter_code": "# Implementation for Minimum insertions or deletions to convert string A to B.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7097",
      "video_id": "tg-exact-dsa-7097",
      "telegram_file_id": "5014767384896997214",
      "file_name": "Minimum insertions or deletions to convert string A to B.mp4",
      "file_type": "mp4",
      "file_size_bytes": 60607692,
      "download_url": "/api/download/-5475342376/7097?file_name=Minimum insertions or deletions to convert string A to B.mp4",
      "created_at": "2026-06-18T17:08:45+00:00",
      "caption": "Telegram Study Attachment (Minimum insertions or deletions to convert string A to B.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7096",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997213",
  "telegram_message_id": 7096,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 26: Minimum insertions to make string palindrome",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7096 | Size: 87.8 MB]\nFile: Minimum insertions to make string palindrome.mp4\nLocation: 16. Dynamic Programming/08. DP on s",
  "duration_seconds": 699,
  "transcript": "Ingested from Telegram Channel Post #7096 (Minimum insertions to make string palindrome.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-06-18T17:08:45+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7096",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 26: Minimum insertions to make string palindrome",
      "starter_code": "# Implementation for Minimum insertions to make string palindrome.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7096",
      "video_id": "tg-exact-dsa-7096",
      "telegram_file_id": "5014767384896997213",
      "file_name": "Minimum insertions to make string palindrome.mp4",
      "file_type": "mp4",
      "file_size_bytes": 92064972,
      "download_url": "/api/download/-5475342376/7096?file_name=Minimum insertions to make string palindrome.mp4",
      "created_at": "2026-06-18T17:08:45+00:00",
      "caption": "Telegram Study Attachment (Minimum insertions to make string palindrome.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7095",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997212",
  "telegram_message_id": 7095,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 27: Longest palindromic subsequence",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7095 | Size: 59.5 MB]\nFile: Longest palindromic subsequence.mp4\nLocation: 16. Dynamic Programming/08. DP on strings/03. Lo",
  "duration_seconds": 549,
  "transcript": "Ingested from Telegram Channel Post #7095 (Longest palindromic subsequence.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-06-18T17:08:45+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7095",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 27: Longest palindromic subsequence",
      "starter_code": "# Implementation for Longest palindromic subsequence.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7095",
      "video_id": "tg-exact-dsa-7095",
      "telegram_file_id": "5014767384896997212",
      "file_name": "Longest palindromic subsequence.mp4",
      "file_type": "mp4",
      "file_size_bytes": 62390272,
      "download_url": "/api/download/-5475342376/7095?file_name=Longest palindromic subsequence.mp4",
      "created_at": "2026-06-18T17:08:45+00:00",
      "caption": "Telegram Study Attachment (Longest palindromic subsequence.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7094",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997211",
  "telegram_message_id": 7094,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 28: Longest common substring",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7094 | Size: 95.6 MB]\nFile: Longest common substring.mp4\nLocation: 16. Dynamic Programming/08. DP on strings/02. Longest c",
  "duration_seconds": 822,
  "transcript": "Ingested from Telegram Channel Post #7094 (Longest common substring.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-06-18T17:08:45+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7094",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 28: Longest common substring",
      "starter_code": "# Implementation for Longest common substring.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7094",
      "video_id": "tg-exact-dsa-7094",
      "telegram_file_id": "5014767384896997211",
      "file_name": "Longest common substring.mp4",
      "file_type": "mp4",
      "file_size_bytes": 100243865,
      "download_url": "/api/download/-5475342376/7094?file_name=Longest common substring.mp4",
      "created_at": "2026-06-18T17:08:45+00:00",
      "caption": "Telegram Study Attachment (Longest common substring.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7093",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997210",
  "telegram_message_id": 7093,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 29: Longest common subsequence",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7093 | Size: 217.6 MB]\nFile: Longest common subsequence.mp4\nLocation: 16. Dynamic Programming/08. DP on strings/01. Longest",
  "duration_seconds": 2102,
  "transcript": "Ingested from Telegram Channel Post #7093 (Longest common subsequence.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-06-18T17:08:45+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7093",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 29: Longest common subsequence",
      "starter_code": "# Implementation for Longest common subsequence.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7093",
      "video_id": "tg-exact-dsa-7093",
      "telegram_file_id": "5014767384896997210",
      "file_name": "Longest common subsequence.mp4",
      "file_type": "mp4",
      "file_size_bytes": 228170137,
      "download_url": "/api/download/-5475342376/7093?file_name=Longest common subsequence.mp4",
      "created_at": "2026-06-18T17:08:45+00:00",
      "caption": "Telegram Study Attachment (Longest common subsequence.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7092",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997209",
  "telegram_message_id": 7092,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 30: Number of Longest Increasing Subsequences",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7092 | Size: 136.8 MB]\nFile: Number of Longest Increasing Subsequences.mp4\nLocation: 16. Dynamic Programming/07. LIS/06. Nu",
  "duration_seconds": 1199,
  "transcript": "Ingested from Telegram Channel Post #7092 (Number of Longest Increasing Subsequences.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-06-18T17:08:45+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7092",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 30: Number of Longest Increasing Subsequences",
      "starter_code": "# Implementation for Number of Longest Increasing Subsequences.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7092",
      "video_id": "tg-exact-dsa-7092",
      "telegram_file_id": "5014767384896997209",
      "file_name": "Number of Longest Increasing Subsequences.mp4",
      "file_type": "mp4",
      "file_size_bytes": 143445196,
      "download_url": "/api/download/-5475342376/7092?file_name=Number of Longest Increasing Subsequences.mp4",
      "created_at": "2026-06-18T17:08:45+00:00",
      "caption": "Telegram Study Attachment (Number of Longest Increasing Subsequences.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7091",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997208",
  "telegram_message_id": 7091,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 31: Longest Bitonic Subsequence",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7091 | Size: 86.9 MB]\nFile: Longest Bitonic Subsequence.mp4\nLocation: 16. Dynamic Programming/07. LIS/05. Longest Bitonic ",
  "duration_seconds": 769,
  "transcript": "Ingested from Telegram Channel Post #7091 (Longest Bitonic Subsequence.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-06-18T17:08:45+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7091",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 31: Longest Bitonic Subsequence",
      "starter_code": "# Implementation for Longest Bitonic Subsequence.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7091",
      "video_id": "tg-exact-dsa-7091",
      "telegram_file_id": "5014767384896997208",
      "file_name": "Longest Bitonic Subsequence.mp4",
      "file_type": "mp4",
      "file_size_bytes": 91121254,
      "download_url": "/api/download/-5475342376/7091?file_name=Longest Bitonic Subsequence.mp4",
      "created_at": "2026-06-18T17:08:45+00:00",
      "caption": "Telegram Study Attachment (Longest Bitonic Subsequence.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7090",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997207",
  "telegram_message_id": 7090,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 32: Longest String Chain",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7090 | Size: 106.1 MB]\nFile: Longest String Chain.mp4\nLocation: 16. Dynamic Programming/07. LIS/04. Longest String Chain\n\nF",
  "duration_seconds": 987,
  "transcript": "Ingested from Telegram Channel Post #7090 (Longest String Chain.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7090",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 32: Longest String Chain",
      "starter_code": "# Implementation for Longest String Chain.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7090",
      "video_id": "tg-exact-dsa-7090",
      "telegram_file_id": "5014767384896997207",
      "file_name": "Longest String Chain.mp4",
      "file_type": "mp4",
      "file_size_bytes": 111253913,
      "download_url": "/api/download/-5475342376/7090?file_name=Longest String Chain.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Longest String Chain.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7089",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997206",
  "telegram_message_id": 7089,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 33: Largest Divisible Subset",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7089 | Size: 106.6 MB]\nFile: Largest Divisible Subset.mp4\nLocation: 16. Dynamic Programming/07. LIS/03. Largest Divisible S",
  "duration_seconds": 860,
  "transcript": "Ingested from Telegram Channel Post #7089 (Largest Divisible Subset.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7089",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 33: Largest Divisible Subset",
      "starter_code": "# Implementation for Largest Divisible Subset.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7089",
      "video_id": "tg-exact-dsa-7089",
      "telegram_file_id": "5014767384896997206",
      "file_name": "Largest Divisible Subset.mp4",
      "file_type": "mp4",
      "file_size_bytes": 111778201,
      "download_url": "/api/download/-5475342376/7089?file_name=Largest Divisible Subset.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Largest Divisible Subset.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7088",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997205",
  "telegram_message_id": 7088,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 34: Print Longest Increasing Subsequence",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7088 | Size: 162.5 MB]\nFile: Print Longest Increasing Subsequence.mp4\nLocation: 16. Dynamic Programming/07. LIS/02. Print L",
  "duration_seconds": 1531,
  "transcript": "Ingested from Telegram Channel Post #7088 (Print Longest Increasing Subsequence.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7088",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 34: Print Longest Increasing Subsequence",
      "starter_code": "# Implementation for Print Longest Increasing Subsequence.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7088",
      "video_id": "tg-exact-dsa-7088",
      "telegram_file_id": "5014767384896997205",
      "file_name": "Print Longest Increasing Subsequence.mp4",
      "file_type": "mp4",
      "file_size_bytes": 170393600,
      "download_url": "/api/download/-5475342376/7088?file_name=Print Longest Increasing Subsequence.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Print Longest Increasing Subsequence.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7087",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997204",
  "telegram_message_id": 7087,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 35: Longest Increasing Subsequence",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7087 | Size: 157.0 MB]\nFile: Longest Increasing Subsequence.mp4\nLocation: 16. Dynamic Programming/07. LIS/01. Longest Incre",
  "duration_seconds": 1435,
  "transcript": "Ingested from Telegram Channel Post #7087 (Longest Increasing Subsequence.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7087",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 35: Longest Increasing Subsequence",
      "starter_code": "# Implementation for Longest Increasing Subsequence.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7087",
      "video_id": "tg-exact-dsa-7087",
      "telegram_file_id": "5014767384896997204",
      "file_name": "Longest Increasing Subsequence.mp4",
      "file_type": "mp4",
      "file_size_bytes": 164626432,
      "download_url": "/api/download/-5475342376/7087?file_name=Longest Increasing Subsequence.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Longest Increasing Subsequence.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7086",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997203",
  "telegram_message_id": 7086,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 36: Rod cutting problem",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7086 | Size: 106.8 MB]\nFile: Rod cutting problem.mp4\nLocation: 16. Dynamic Programming/06. DP on subsequences/11. Rod cutti",
  "duration_seconds": 798,
  "transcript": "Ingested from Telegram Channel Post #7086 (Rod cutting problem.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7086",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 36: Rod cutting problem",
      "starter_code": "# Implementation for Rod cutting problem.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7086",
      "video_id": "tg-exact-dsa-7086",
      "telegram_file_id": "5014767384896997203",
      "file_name": "Rod cutting problem.mp4",
      "file_type": "mp4",
      "file_size_bytes": 111987916,
      "download_url": "/api/download/-5475342376/7086?file_name=Rod cutting problem.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Rod cutting problem.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7085",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997202",
  "telegram_message_id": 7085,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 37: Unbounded knapsack",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7085 | Size: 87.2 MB]\nFile: Unbounded knapsack.mp4\nLocation: 16. Dynamic Programming/06. DP on subsequences/10. Unbounded ",
  "duration_seconds": 626,
  "transcript": "Ingested from Telegram Channel Post #7085 (Unbounded knapsack.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7085",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 37: Unbounded knapsack",
      "starter_code": "# Implementation for Unbounded knapsack.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7085",
      "video_id": "tg-exact-dsa-7085",
      "telegram_file_id": "5014767384896997202",
      "file_name": "Unbounded knapsack.mp4",
      "file_type": "mp4",
      "file_size_bytes": 91435827,
      "download_url": "/api/download/-5475342376/7085?file_name=Unbounded knapsack.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Unbounded knapsack.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7084",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997201",
  "telegram_message_id": 7084,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 38: Coin change II",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7084 | Size: 100.3 MB]\nFile: Coin change II.mp4\nLocation: 16. Dynamic Programming/06. DP on subsequences/09. Coin change II",
  "duration_seconds": 823,
  "transcript": "Ingested from Telegram Channel Post #7084 (Coin change II.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7084",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 38: Coin change II",
      "starter_code": "# Implementation for Coin change II.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7084",
      "video_id": "tg-exact-dsa-7084",
      "telegram_file_id": "5014767384896997201",
      "file_name": "Coin change II.mp4",
      "file_type": "mp4",
      "file_size_bytes": 105172172,
      "download_url": "/api/download/-5475342376/7084?file_name=Coin change II.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Coin change II.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7083",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997200",
  "telegram_message_id": 7083,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 39: Target sum",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7083 | Size: 61.1 MB]\nFile: Target sum.mp4\nLocation: 16. Dynamic Programming/06. DP on subsequences/08. Target sum\n\nFollow",
  "duration_seconds": 490,
  "transcript": "Ingested from Telegram Channel Post #7083 (Target sum.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7083",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 39: Target sum",
      "starter_code": "# Implementation for Target sum.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7083",
      "video_id": "tg-exact-dsa-7083",
      "telegram_file_id": "5014767384896997200",
      "file_name": "Target sum.mp4",
      "file_type": "mp4",
      "file_size_bytes": 64067993,
      "download_url": "/api/download/-5475342376/7083?file_name=Target sum.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Target sum.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7082",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997199",
  "telegram_message_id": 7082,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 40: Minimum coins",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7082 | Size: 179.2 MB]\nFile: Minimum coins.mp4\nLocation: 16. Dynamic Programming/06. DP on subsequences/07. Minimum coins\n\n",
  "duration_seconds": 1385,
  "transcript": "Ingested from Telegram Channel Post #7082 (Minimum coins.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7082",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 40: Minimum coins",
      "starter_code": "# Implementation for Minimum coins.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7082",
      "video_id": "tg-exact-dsa-7082",
      "telegram_file_id": "5014767384896997199",
      "file_name": "Minimum coins.mp4",
      "file_type": "mp4",
      "file_size_bytes": 187904819,
      "download_url": "/api/download/-5475342376/7082?file_name=Minimum coins.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Minimum coins.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7081",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997198",
  "telegram_message_id": 7081,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 41: 0 and 1 Knapsack",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7081 | Size: 192.8 MB]\nFile: 0 and 1 Knapsack.mp4\nLocation: 16. Dynamic Programming/06. DP on subsequences/06. 0 and 1 Knap",
  "duration_seconds": 1408,
  "transcript": "Ingested from Telegram Channel Post #7081 (0 and 1 Knapsack.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7081",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 41: 0 and 1 Knapsack",
      "starter_code": "# Implementation for 0 and 1 Knapsack.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7081",
      "video_id": "tg-exact-dsa-7081",
      "telegram_file_id": "5014767384896997198",
      "file_name": "0 and 1 Knapsack.mp4",
      "file_type": "mp4",
      "file_size_bytes": 202165452,
      "download_url": "/api/download/-5475342376/7081?file_name=0 and 1 Knapsack.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (0 and 1 Knapsack.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7080",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997197",
  "telegram_message_id": 7080,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 42: Count partitions with given difference",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7080 | Size: 130.0 MB]\nFile: Count partitions with given difference.mp4\nLocation: 16. Dynamic Programming/06. DP on subsequ",
  "duration_seconds": 1026,
  "transcript": "Ingested from Telegram Channel Post #7080 (Count partitions with given difference.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7080",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 42: Count partitions with given difference",
      "starter_code": "# Implementation for Count partitions with given difference.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7080",
      "video_id": "tg-exact-dsa-7080",
      "telegram_file_id": "5014767384896997197",
      "file_name": "Count partitions with given difference.mp4",
      "file_type": "mp4",
      "file_size_bytes": 136314880,
      "download_url": "/api/download/-5475342376/7080?file_name=Count partitions with given difference.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Count partitions with given difference.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7079",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997196",
  "telegram_message_id": 7079,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 43: Count subsets with sum K",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7079 | Size: 152.2 MB]\nFile: Count subsets with sum K.mp4\nLocation: 16. Dynamic Programming/06. DP on subsequences/04. Coun",
  "duration_seconds": 1238,
  "transcript": "Ingested from Telegram Channel Post #7079 (Count subsets with sum K.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7079",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 43: Count subsets with sum K",
      "starter_code": "# Implementation for Count subsets with sum K.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7079",
      "video_id": "tg-exact-dsa-7079",
      "telegram_file_id": "5014767384896997196",
      "file_name": "Count subsets with sum K.mp4",
      "file_type": "mp4",
      "file_size_bytes": 159593267,
      "download_url": "/api/download/-5475342376/7079?file_name=Count subsets with sum K.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Count subsets with sum K.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7078",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997194",
  "telegram_message_id": 7078,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 44: Partition_a_set_into_two_subsets_with_minimum_absolute_sum_difference",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7078 | Size: 191.0 MB]\nFile: Partition a set into two subsets with minimum absolute sum difference.mp4\nLocation: 16. Dynami",
  "duration_seconds": 1736,
  "transcript": "Ingested from Telegram Channel Post #7078 (Partition_a_set_into_two_subsets_with_minimum_absolute_sum_difference.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7078",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 44: Partition_a_set_into_two_subsets_with_minimum_absolute_sum_difference",
      "starter_code": "# Implementation for Partition_a_set_into_two_subsets_with_minimum_absolute_sum_difference.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7078",
      "video_id": "tg-exact-dsa-7078",
      "telegram_file_id": "5014767384896997194",
      "file_name": "Partition_a_set_into_two_subsets_with_minimum_absolute_sum_difference.mp4",
      "file_type": "mp4",
      "file_size_bytes": 200278016,
      "download_url": "/api/download/-5475342376/7078?file_name=Partition_a_set_into_two_subsets_with_minimum_absolute_sum_difference.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Partition_a_set_into_two_subsets_with_minimum_absolute_sum_difference.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7077",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997193",
  "telegram_message_id": 7077,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 45: Partition equal subset sum",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7077 | Size: 58.5 MB]\nFile: Partition equal subset sum.mp4\nLocation: 16. Dynamic Programming/06. DP on subsequences/02. Pa",
  "duration_seconds": 448,
  "transcript": "Ingested from Telegram Channel Post #7077 (Partition equal subset sum.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7077",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 45: Partition equal subset sum",
      "starter_code": "# Implementation for Partition equal subset sum.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7077",
      "video_id": "tg-exact-dsa-7077",
      "telegram_file_id": "5014767384896997193",
      "file_name": "Partition equal subset sum.mp4",
      "file_type": "mp4",
      "file_size_bytes": 61341696,
      "download_url": "/api/download/-5475342376/7077?file_name=Partition equal subset sum.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Partition equal subset sum.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7076",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997192",
  "telegram_message_id": 7076,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 46: Subset sum equals to target",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7076 | Size: 132.7 MB]\nFile: Subset sum equals to target.mp4\nLocation: 16. Dynamic Programming/06. DP on subsequences/01. S",
  "duration_seconds": 1250,
  "transcript": "Ingested from Telegram Channel Post #7076 (Subset sum equals to target.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7076",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 46: Subset sum equals to target",
      "starter_code": "# Implementation for Subset sum equals to target.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7076",
      "video_id": "tg-exact-dsa-7076",
      "telegram_file_id": "5014767384896997192",
      "file_name": "Subset sum equals to target.mp4",
      "file_type": "mp4",
      "file_size_bytes": 139146035,
      "download_url": "/api/download/-5475342376/7076?file_name=Subset sum equals to target.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Subset sum equals to target.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dsa-7075",
  "channel_id": "ch-dsa-01",
  "telegram_file_id": "5014767384896997191",
  "telegram_message_id": 7075,
  "sender_username": "@Striver_DSA_Bot",
  "title": "DSA Lecture 47: Best time to buy and sell stock with transaction fees",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #7075 | Size: 44.6 MB]\nFile: Best time to buy and sell stock with transaction fees.mp4\nLocation: 16. Dynamic Programming/05",
  "duration_seconds": 344,
  "transcript": "Ingested from Telegram Channel Post #7075 (Best time to buy and sell stock with transaction fees.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-06-18T17:08:44+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dsa-7075",
      "type": "CODING",
      "question": "Implement solution for DSA Lecture 47: Best time to buy and sell stock with transaction fees",
      "starter_code": "# Implementation for Best time to buy and sell stock with transaction fees.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dsa-7075",
      "video_id": "tg-exact-dsa-7075",
      "telegram_file_id": "5014767384896997191",
      "file_name": "Best time to buy and sell stock with transaction fees.mp4",
      "file_type": "mp4",
      "file_size_bytes": 46766489,
      "download_url": "/api/download/-5475342376/7075?file_name=Best time to buy and sell stock with transaction fees.mp4",
      "created_at": "2026-06-18T17:08:44+00:00",
      "caption": "Telegram Study Attachment (Best time to buy and sell stock with transaction fees.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6048",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483808",
  "telegram_message_id": 6048,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 1: 11.10 Task Management System Code",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6048 | Size: 187.8 MB]\nFile Name: 11.10 Task Management System Code.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6048 (11.10 Task Management System Code.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-03T11:08:37+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6048",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 1: 11.10 Task Management System Code",
      "starter_code": "# Implementation for 11.10 Task Management System Code.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6048",
      "video_id": "tg-exact-sd-6048",
      "telegram_file_id": "4986003752692483808",
      "file_name": "11.10 Task Management System Code.mp4",
      "file_type": "mp4",
      "file_size_bytes": 196922572,
      "download_url": "/api/download/-5233650498/6048?file_name=11.10 Task Management System Code.mp4",
      "created_at": "2026-03-03T11:08:37+00:00",
      "caption": "Telegram Study Attachment (11.10 Task Management System Code.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6047",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483807",
  "telegram_message_id": 6047,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 2: 11.9 Task Management System Design",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6047 | Size: 443.7 MB]\nFile Name: 11.9 Task Management System Design.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6047 (11.9 Task Management System Design.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6047",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 2: 11.9 Task Management System Design",
      "starter_code": "# Implementation for 11.9 Task Management System Design.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6047",
      "video_id": "tg-exact-sd-6047",
      "telegram_file_id": "4986003752692483807",
      "file_name": "11.9 Task Management System Design.mp4",
      "file_type": "mp4",
      "file_size_bytes": 465253171,
      "download_url": "/api/download/-5233650498/6047?file_name=11.9 Task Management System Design.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (11.9 Task Management System Design.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6046",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483806",
  "telegram_message_id": 6046,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 3: 11.8 Vending Machine Code",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6046 | Size: 231.9 MB]\nFile Name: 11.8 Vending Machine Code.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6046 (11.8 Vending Machine Code.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6046",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 3: 11.8 Vending Machine Code",
      "starter_code": "# Implementation for 11.8 Vending Machine Code.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6046",
      "video_id": "tg-exact-sd-6046",
      "telegram_file_id": "4986003752692483806",
      "file_name": "11.8 Vending Machine Code.mp4",
      "file_type": "mp4",
      "file_size_bytes": 243164774,
      "download_url": "/api/download/-5233650498/6046?file_name=11.8 Vending Machine Code.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (11.8 Vending Machine Code.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6045",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483805",
  "telegram_message_id": 6045,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 4: 11.7 Vending Machine Design",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6045 | Size: 416.7 MB]\nFile Name: 11.7 Vending Machine Design.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6045 (11.7 Vending Machine Design.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6045",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 4: 11.7 Vending Machine Design",
      "starter_code": "# Implementation for 11.7 Vending Machine Design.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6045",
      "video_id": "tg-exact-sd-6045",
      "telegram_file_id": "4986003752692483805",
      "file_name": "11.7 Vending Machine Design.mp4",
      "file_type": "mp4",
      "file_size_bytes": 436941619,
      "download_url": "/api/download/-5233650498/6045?file_name=11.7 Vending Machine Design.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (11.7 Vending Machine Design.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6044",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483804",
  "telegram_message_id": 6044,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 5: 11.6 Traffic Signal System (Code)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6044 | Size: 232.9 MB]\nFile Name: 11.6 Traffic Signal System (Code).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6044 (11.6 Traffic Signal System (Code).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6044",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 5: 11.6 Traffic Signal System (Code)",
      "starter_code": "# Implementation for 11.6 Traffic Signal System (Code).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6044",
      "video_id": "tg-exact-sd-6044",
      "telegram_file_id": "4986003752692483804",
      "file_name": "11.6 Traffic Signal System (Code).mp4",
      "file_type": "mp4",
      "file_size_bytes": 244213350,
      "download_url": "/api/download/-5233650498/6044?file_name=11.6 Traffic Signal System (Code).mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (11.6 Traffic Signal System (Code).mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6043",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483803",
  "telegram_message_id": 6043,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 6: 11.5 Traffic Signal System (Design)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6043 | Size: 501.8 MB]\nFile Name: 11.5 Traffic Signal System (Design).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6043 (11.5 Traffic Signal System (Design).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6043",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 6: 11.5 Traffic Signal System (Design)",
      "starter_code": "# Implementation for 11.5 Traffic Signal System (Design).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6043",
      "video_id": "tg-exact-sd-6043",
      "telegram_file_id": "4986003752692483803",
      "file_name": "11.5 Traffic Signal System (Design).mp4",
      "file_type": "mp4",
      "file_size_bytes": 526175436,
      "download_url": "/api/download/-5233650498/6043?file_name=11.5 Traffic Signal System (Design).mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (11.5 Traffic Signal System (Design).mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6042",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483802",
  "telegram_message_id": 6042,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 7: 11.4 Logging Framework (Code)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6042 | Size: 219.0 MB]\nFile Name: 11.4 Logging Framework (Code).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6042 (11.4 Logging Framework (Code).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6042",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 7: 11.4 Logging Framework (Code)",
      "starter_code": "# Implementation for 11.4 Logging Framework (Code).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6042",
      "video_id": "tg-exact-sd-6042",
      "telegram_file_id": "4986003752692483802",
      "file_name": "11.4 Logging Framework (Code).mp4",
      "file_type": "mp4",
      "file_size_bytes": 229638144,
      "download_url": "/api/download/-5233650498/6042?file_name=11.4 Logging Framework (Code).mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (11.4 Logging Framework (Code).mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6041",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483801",
  "telegram_message_id": 6041,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 8: 11.2 Parking Lot (Code)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6041 | Size: 252.5 MB]\nFile Name: 11.2 Parking Lot (Code).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6041 (11.2 Parking Lot (Code).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6041",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 8: 11.2 Parking Lot (Code)",
      "starter_code": "# Implementation for 11.2 Parking Lot (Code).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6041",
      "video_id": "tg-exact-sd-6041",
      "telegram_file_id": "4986003752692483801",
      "file_name": "11.2 Parking Lot (Code).mp4",
      "file_type": "mp4",
      "file_size_bytes": 264765440,
      "download_url": "/api/download/-5233650498/6041?file_name=11.2 Parking Lot (Code).mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (11.2 Parking Lot (Code).mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6040",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483800",
  "telegram_message_id": 6040,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 9: 11.1 Parking Lot (Design) (Interview Problems (Part-1)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6040 | Size: 284.2 MB]\nFile Name: 11.1 Parking Lot (Design) (Interview Problems (Part-1).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6040 (11.1 Parking Lot (Design) (Interview Problems (Part-1).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6040",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 9: 11.1 Parking Lot (Design) (Interview Problems (Part-1)",
      "starter_code": "# Implementation for 11.1 Parking Lot (Design) (Interview Problems (Part-1).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6040",
      "video_id": "tg-exact-sd-6040",
      "telegram_file_id": "4986003752692483800",
      "file_name": "11.1 Parking Lot (Design) (Interview Problems (Part-1).mp4",
      "file_type": "mp4",
      "file_size_bytes": 298005299,
      "download_url": "/api/download/-5233650498/6040?file_name=11.1 Parking Lot (Design) (Interview Problems (Part-1).mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (11.1 Parking Lot (Design) (Interview Problems (Part-1).mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6039",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483798",
  "telegram_message_id": 6039,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 10: 10.3 How to approach a LLD Interview",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6039 | Size: 240.7 MB]\nFile Name: 10.3 How to approach a LLD Interview.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6039 (10.3 How to approach a LLD Interview.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6039",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 10: 10.3 How to approach a LLD Interview",
      "starter_code": "# Implementation for 10.3 How to approach a LLD Interview.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6039",
      "video_id": "tg-exact-sd-6039",
      "telegram_file_id": "4986003752692483798",
      "file_name": "10.3 How to approach a LLD Interview.mp4",
      "file_type": "mp4",
      "file_size_bytes": 252392243,
      "download_url": "/api/download/-5233650498/6039?file_name=10.3 How to approach a LLD Interview.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (10.3 How to approach a LLD Interview.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6038",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483797",
  "telegram_message_id": 6038,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 11: 10.2 Database Design and Integration",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6038 | Size: 169.0 MB]\nFile Name: 10.2 Database Design and Integration.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6038 (10.2 Database Design and Integration.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6038",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 11: 10.2 Database Design and Integration",
      "starter_code": "# Implementation for 10.2 Database Design and Integration.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6038",
      "video_id": "tg-exact-sd-6038",
      "telegram_file_id": "4986003752692483797",
      "file_name": "10.2 Database Design and Integration.mp4",
      "file_type": "mp4",
      "file_size_bytes": 177209344,
      "download_url": "/api/download/-5233650498/6038?file_name=10.2 Database Design and Integration.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (10.2 Database Design and Integration.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6037",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483796",
  "telegram_message_id": 6037,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 12: 10.1 Exceptions and Error Handling (Best practices in LLD)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6037 | Size: 445.3 MB]\nFile Name: 10.1 Exceptions and Error Handling (Best practices in LLD).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6037 (10.1 Exceptions and Error Handling (Best practices in LLD).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6037",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 12: 10.1 Exceptions and Error Handling (Best practices in LLD)",
      "starter_code": "# Implementation for 10.1 Exceptions and Error Handling (Best practices in LLD).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6037",
      "video_id": "tg-exact-sd-6037",
      "telegram_file_id": "4986003752692483796",
      "file_name": "10.1 Exceptions and Error Handling (Best practices in LLD).mp4",
      "file_type": "mp4",
      "file_size_bytes": 466930892,
      "download_url": "/api/download/-5233650498/6037?file_name=10.1 Exceptions and Error Handling (Best practices in LLD).mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (10.1 Exceptions and Error Handling (Best practices in LLD).mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6036",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483795",
  "telegram_message_id": 6036,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 13: 9.1 Exception Handling (LLD) (Exceptions and Error Handling)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6036 | Size: 165.2 MB]\nFile Name: 9.1 Exception Handling (LLD) (Exceptions and Error Handling).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6036 (9.1 Exception Handling (LLD) (Exceptions and Error Handling).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6036",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 13: 9.1 Exception Handling (LLD) (Exceptions and Error Handling)",
      "starter_code": "# Implementation for 9.1 Exception Handling (LLD) (Exceptions and Error Handling).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6036",
      "video_id": "tg-exact-sd-6036",
      "telegram_file_id": "4986003752692483795",
      "file_name": "9.1 Exception Handling (LLD) (Exceptions and Error Handling).mp4",
      "file_type": "mp4",
      "file_size_bytes": 173224755,
      "download_url": "/api/download/-5233650498/6036?file_name=9.1 Exception Handling (LLD) (Exceptions and Error Handling).mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (9.1 Exception Handling (LLD) (Exceptions and Error Handling).mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6035",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483794",
  "telegram_message_id": 6035,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 14: 8. Producer Consumer Problem",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6035 | Size: 134.5 MB]\nFile Name: 8. Producer Consumer Problem.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6035 (8. Producer Consumer Problem.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6035",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 14: 8. Producer Consumer Problem",
      "starter_code": "# Implementation for 8. Producer Consumer Problem.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6035",
      "video_id": "tg-exact-sd-6035",
      "telegram_file_id": "4986003752692483794",
      "file_name": "8. Producer Consumer Problem.mp4",
      "file_type": "mp4",
      "file_size_bytes": 141033472,
      "download_url": "/api/download/-5233650498/6035?file_name=8. Producer Consumer Problem.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (8. Producer Consumer Problem.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6034",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483793",
  "telegram_message_id": 6034,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 15: 7_1_Multithreading_and_Concurrency_Multithreading_and_Concurrency",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6034 | Size: 328.4 MB]\nFile Name: 7_1_Multithreading_and_Concurrency_Multithreading_and_Concurrency.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6034 (7_1_Multithreading_and_Concurrency_Multithreading_and_Concurrency.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6034",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 15: 7_1_Multithreading_and_Concurrency_Multithreading_and_Concurrency",
      "starter_code": "# Implementation for 7_1_Multithreading_and_Concurrency_Multithreading_and_Concurrency.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6034",
      "video_id": "tg-exact-sd-6034",
      "telegram_file_id": "4986003752692483793",
      "file_name": "7_1_Multithreading_and_Concurrency_Multithreading_and_Concurrency.mp4",
      "file_type": "mp4",
      "file_size_bytes": 344352358,
      "download_url": "/api/download/-5233650498/6034?file_name=7_1_Multithreading_and_Concurrency_Multithreading_and_Concurrency.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (7_1_Multithreading_and_Concurrency_Multithreading_and_Concurrency.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6033",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483792",
  "telegram_message_id": 6033,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 16: 7.7 Producer Consumer Problem",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6033 | Size: 122.2 MB]\nFile Name: 7.7 Producer Consumer Problem.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6033 (7.7 Producer Consumer Problem.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6033",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 16: 7.7 Producer Consumer Problem",
      "starter_code": "# Implementation for 7.7 Producer Consumer Problem.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6033",
      "video_id": "tg-exact-sd-6033",
      "telegram_file_id": "4986003752692483792",
      "file_name": "7.7 Producer Consumer Problem.mp4",
      "file_type": "mp4",
      "file_size_bytes": 128135987,
      "download_url": "/api/download/-5233650498/6033?file_name=7.7 Producer Consumer Problem.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (7.7 Producer Consumer Problem.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6032",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483791",
  "telegram_message_id": 6032,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 17: 7.6 Locks and Synchronization Mechanism",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6032 | Size: 255.0 MB]\nFile Name: 7.6 Locks and Synchronization Mechanism.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6032 (7.6 Locks and Synchronization Mechanism.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6032",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 17: 7.6 Locks and Synchronization Mechanism",
      "starter_code": "# Implementation for 7.6 Locks and Synchronization Mechanism.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6032",
      "video_id": "tg-exact-sd-6032",
      "telegram_file_id": "4986003752692483791",
      "file_name": "7.6 Locks and Synchronization Mechanism.mp4",
      "file_type": "mp4",
      "file_size_bytes": 267386880,
      "download_url": "/api/download/-5233650498/6032?file_name=7.6 Locks and Synchronization Mechanism.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (7.6 Locks and Synchronization Mechanism.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6031",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483790",
  "telegram_message_id": 6031,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 18: 7.5 Deadlock and Prevention Techniques",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6031 | Size: 198.1 MB]\nFile Name: 7.5 Deadlock and Prevention Techniques.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6031 (7.5 Deadlock and Prevention Techniques.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6031",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 18: 7.5 Deadlock and Prevention Techniques",
      "starter_code": "# Implementation for 7.5 Deadlock and Prevention Techniques.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6031",
      "video_id": "tg-exact-sd-6031",
      "telegram_file_id": "4986003752692483790",
      "file_name": "7.5 Deadlock and Prevention Techniques.mp4",
      "file_type": "mp4",
      "file_size_bytes": 207722905,
      "download_url": "/api/download/-5233650498/6031?file_name=7.5 Deadlock and Prevention Techniques.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (7.5 Deadlock and Prevention Techniques.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6030",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483789",
  "telegram_message_id": 6030,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 19: 7.4 Thread Safety and Synchronization",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6030 | Size: 224.8 MB]\nFile Name: 7.4 Thread Safety and Synchronization.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6030 (7.4 Thread Safety and Synchronization.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6030",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 19: 7.4 Thread Safety and Synchronization",
      "starter_code": "# Implementation for 7.4 Thread Safety and Synchronization.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6030",
      "video_id": "tg-exact-sd-6030",
      "telegram_file_id": "4986003752692483789",
      "file_name": "7.4 Thread Safety and Synchronization.mp4",
      "file_type": "mp4",
      "file_size_bytes": 235719884,
      "download_url": "/api/download/-5233650498/6030?file_name=7.4 Thread Safety and Synchronization.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (7.4 Thread Safety and Synchronization.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6029",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483788",
  "telegram_message_id": 6029,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 20: 7.3 Thread Pools and Executors",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6029 | Size: 276.2 MB]\nFile Name: 7.3 Thread Pools and Executors.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6029 (7.3 Thread Pools and Executors.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6029",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 20: 7.3 Thread Pools and Executors",
      "starter_code": "# Implementation for 7.3 Thread Pools and Executors.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6029",
      "video_id": "tg-exact-sd-6029",
      "telegram_file_id": "4986003752692483788",
      "file_name": "7.3 Thread Pools and Executors.mp4",
      "file_type": "mp4",
      "file_size_bytes": 289616691,
      "download_url": "/api/download/-5233650498/6029?file_name=7.3 Thread Pools and Executors.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (7.3 Thread Pools and Executors.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6028",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483787",
  "telegram_message_id": 6028,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 21: 7.2 Creating and Managing Threads",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6028 | Size: 305.7 MB]\nFile Name: 7.2 Creating and Managing Threads.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6028 (7.2 Creating and Managing Threads.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6028",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 21: 7.2 Creating and Managing Threads",
      "starter_code": "# Implementation for 7.2 Creating and Managing Threads.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6028",
      "video_id": "tg-exact-sd-6028",
      "telegram_file_id": "4986003752692483787",
      "file_name": "7.2 Creating and Managing Threads.mp4",
      "file_type": "mp4",
      "file_size_bytes": 320549683,
      "download_url": "/api/download/-5233650498/6028?file_name=7.2 Creating and Managing Threads.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (7.2 Creating and Managing Threads.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6027",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483786",
  "telegram_message_id": 6027,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 22: 6.10 Memento Pattern",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6027 | Size: 93.8 MB]\nFile Name: 6.10 Memento Pattern.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6027 (6.10 Memento Pattern.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6027",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 22: 6.10 Memento Pattern",
      "starter_code": "# Implementation for 6.10 Memento Pattern.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6027",
      "video_id": "tg-exact-sd-6027",
      "telegram_file_id": "4986003752692483786",
      "file_name": "6.10 Memento Pattern.mp4",
      "file_type": "mp4",
      "file_size_bytes": 98356428,
      "download_url": "/api/download/-5233650498/6027?file_name=6.10 Memento Pattern.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (6.10 Memento Pattern.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6026",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483785",
  "telegram_message_id": 6026,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 23: 6.9 Mediator Pattern",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6026 | Size: 72.8 MB]\nFile Name: 6.9 Mediator Pattern.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6026 (6.9 Mediator Pattern.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6026",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 23: 6.9 Mediator Pattern",
      "starter_code": "# Implementation for 6.9 Mediator Pattern.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6026",
      "video_id": "tg-exact-sd-6026",
      "telegram_file_id": "4986003752692483785",
      "file_name": "6.9 Mediator Pattern.mp4",
      "file_type": "mp4",
      "file_size_bytes": 76336332,
      "download_url": "/api/download/-5233650498/6026?file_name=6.9 Mediator Pattern.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (6.9 Mediator Pattern.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6025",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483784",
  "telegram_message_id": 6025,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 24: 6.8 Visitor Pattern",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6025 | Size: 142.9 MB]\nFile Name: 6.8 Visitor Pattern.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6025 (6.8 Visitor Pattern.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6025",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 24: 6.8 Visitor Pattern",
      "starter_code": "# Implementation for 6.8 Visitor Pattern.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6025",
      "video_id": "tg-exact-sd-6025",
      "telegram_file_id": "4986003752692483784",
      "file_name": "6.8 Visitor Pattern.mp4",
      "file_type": "mp4",
      "file_size_bytes": 149841510,
      "download_url": "/api/download/-5233650498/6025?file_name=6.8 Visitor Pattern.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (6.8 Visitor Pattern.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6024",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483783",
  "telegram_message_id": 6024,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 25: 6.7 Chain of Responsibility",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6024 | Size: 96.0 MB]\nFile Name: 6.7 Chain of Responsibility.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6024 (6.7 Chain of Responsibility.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6024",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 25: 6.7 Chain of Responsibility",
      "starter_code": "# Implementation for 6.7 Chain of Responsibility.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6024",
      "video_id": "tg-exact-sd-6024",
      "telegram_file_id": "4986003752692483783",
      "file_name": "6.7 Chain of Responsibility.mp4",
      "file_type": "mp4",
      "file_size_bytes": 100663296,
      "download_url": "/api/download/-5233650498/6024?file_name=6.7 Chain of Responsibility.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (6.7 Chain of Responsibility.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6023",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483782",
  "telegram_message_id": 6023,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 26: 6.6 State Pattern",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6023 | Size: 111.0 MB]\nFile Name: 6.6 State Pattern.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6023 (6.6 State Pattern.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6023",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 26: 6.6 State Pattern",
      "starter_code": "# Implementation for 6.6 State Pattern.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6023",
      "video_id": "tg-exact-sd-6023",
      "telegram_file_id": "4986003752692483782",
      "file_name": "6.6 State Pattern.mp4",
      "file_type": "mp4",
      "file_size_bytes": 116391936,
      "download_url": "/api/download/-5233650498/6023?file_name=6.6 State Pattern.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (6.6 State Pattern.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6022",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483781",
  "telegram_message_id": 6022,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 27: 6.5 Template Method",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6022 | Size: 100.2 MB]\nFile Name: 6.5 Template Method.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6022 (6.5 Template Method.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6022",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 27: 6.5 Template Method",
      "starter_code": "# Implementation for 6.5 Template Method.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6022",
      "video_id": "tg-exact-sd-6022",
      "telegram_file_id": "4986003752692483781",
      "file_name": "6.5 Template Method.mp4",
      "file_type": "mp4",
      "file_size_bytes": 105067315,
      "download_url": "/api/download/-5233650498/6022?file_name=6.5 Template Method.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (6.5 Template Method.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6021",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483780",
  "telegram_message_id": 6021,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 28: 6.4 Command Pattern",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6021 | Size: 159.5 MB]\nFile Name: 6.4 Command Pattern.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6021 (6.4 Command Pattern.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6021",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 28: 6.4 Command Pattern",
      "starter_code": "# Implementation for 6.4 Command Pattern.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6021",
      "video_id": "tg-exact-sd-6021",
      "telegram_file_id": "4986003752692483780",
      "file_name": "6.4 Command Pattern.mp4",
      "file_type": "mp4",
      "file_size_bytes": 167247872,
      "download_url": "/api/download/-5233650498/6021?file_name=6.4 Command Pattern.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (6.4 Command Pattern.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6020",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483779",
  "telegram_message_id": 6020,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 29: 6.3 Strategy Pattern",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6020 | Size: 67.6 MB]\nFile Name: 6.3 Strategy Pattern.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6020 (6.3 Strategy Pattern.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6020",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 29: 6.3 Strategy Pattern",
      "starter_code": "# Implementation for 6.3 Strategy Pattern.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6020",
      "video_id": "tg-exact-sd-6020",
      "telegram_file_id": "4986003752692483779",
      "file_name": "6.3 Strategy Pattern.mp4",
      "file_type": "mp4",
      "file_size_bytes": 70883737,
      "download_url": "/api/download/-5233650498/6020?file_name=6.3 Strategy Pattern.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (6.3 Strategy Pattern.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6019",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483778",
  "telegram_message_id": 6019,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 30: 6.2 Behavioural Design Patterns",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6019 | Size: 102.7 MB]\nFile Name: 6.2 Behavioural Design Patterns.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6019 (6.2 Behavioural Design Patterns.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6019",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 30: 6.2 Behavioural Design Patterns",
      "starter_code": "# Implementation for 6.2 Behavioural Design Patterns.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6019",
      "video_id": "tg-exact-sd-6019",
      "telegram_file_id": "4986003752692483778",
      "file_name": "6.2 Behavioural Design Patterns.mp4",
      "file_type": "mp4",
      "file_size_bytes": 107688755,
      "download_url": "/api/download/-5233650498/6019?file_name=6.2 Behavioural Design Patterns.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (6.2 Behavioural Design Patterns.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6018",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483777",
  "telegram_message_id": 6018,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 31: 6.1 Iterator Pattern (Behavioural Design Patterns)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6018 | Size: 131.9 MB]\nFile Name: 6.1 Iterator Pattern (Behavioural Design Patterns).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6018 (6.1 Iterator Pattern (Behavioural Design Patterns).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6018",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 31: 6.1 Iterator Pattern (Behavioural Design Patterns)",
      "starter_code": "# Implementation for 6.1 Iterator Pattern (Behavioural Design Patterns).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6018",
      "video_id": "tg-exact-sd-6018",
      "telegram_file_id": "4986003752692483777",
      "file_name": "6.1 Iterator Pattern (Behavioural Design Patterns).mp4",
      "file_type": "mp4",
      "file_size_bytes": 138307174,
      "download_url": "/api/download/-5233650498/6018?file_name=6.1 Iterator Pattern (Behavioural Design Patterns).mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (6.1 Iterator Pattern (Behavioural Design Patterns).mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6017",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483776",
  "telegram_message_id": 6017,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 32: 5.7 Flyweight Pattern",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6017 | Size: 96.4 MB]\nFile Name: 5.7 Flyweight Pattern.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6017 (5.7 Flyweight Pattern.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6017",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 32: 5.7 Flyweight Pattern",
      "starter_code": "# Implementation for 5.7 Flyweight Pattern.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6017",
      "video_id": "tg-exact-sd-6017",
      "telegram_file_id": "4986003752692483776",
      "file_name": "5.7 Flyweight Pattern.mp4",
      "file_type": "mp4",
      "file_size_bytes": 101082726,
      "download_url": "/api/download/-5233650498/6017?file_name=5.7 Flyweight Pattern.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (5.7 Flyweight Pattern.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6016",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483775",
  "telegram_message_id": 6016,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 33: 5.6 Bridge Pattern",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6016 | Size: 100.1 MB]\nFile Name: 5.6 Bridge Pattern.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6016 (5.6 Bridge Pattern.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6016",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 33: 5.6 Bridge Pattern",
      "starter_code": "# Implementation for 5.6 Bridge Pattern.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6016",
      "video_id": "tg-exact-sd-6016",
      "telegram_file_id": "4986003752692483775",
      "file_name": "5.6 Bridge Pattern.mp4",
      "file_type": "mp4",
      "file_size_bytes": 104962457,
      "download_url": "/api/download/-5233650498/6016?file_name=5.6 Bridge Pattern.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (5.6 Bridge Pattern.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6015",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483774",
  "telegram_message_id": 6015,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 34: 5.5 Proxy Pattern",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6015 | Size: 94.1 MB]\nFile Name: 5.5 Proxy Pattern.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6015 (5.5 Proxy Pattern.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6015",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 34: 5.5 Proxy Pattern",
      "starter_code": "# Implementation for 5.5 Proxy Pattern.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6015",
      "video_id": "tg-exact-sd-6015",
      "telegram_file_id": "4986003752692483774",
      "file_name": "5.5 Proxy Pattern.mp4",
      "file_type": "mp4",
      "file_size_bytes": 98671001,
      "download_url": "/api/download/-5233650498/6015?file_name=5.5 Proxy Pattern.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (5.5 Proxy Pattern.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6014",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483773",
  "telegram_message_id": 6014,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 35: 5.4 Composite Pattern",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6014 | Size: 124.7 MB]\nFile Name: 5.4 Composite Pattern.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6014 (5.4 Composite Pattern.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6014",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 35: 5.4 Composite Pattern",
      "starter_code": "# Implementation for 5.4 Composite Pattern.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6014",
      "video_id": "tg-exact-sd-6014",
      "telegram_file_id": "4986003752692483773",
      "file_name": "5.4 Composite Pattern.mp4",
      "file_type": "mp4",
      "file_size_bytes": 130757427,
      "download_url": "/api/download/-5233650498/6014?file_name=5.4 Composite Pattern.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (5.4 Composite Pattern.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6013",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483772",
  "telegram_message_id": 6013,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 36: 5.3 Facade Pattern",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6013 | Size: 92.9 MB]\nFile Name: 5.3 Facade Pattern.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6013 (5.3 Facade Pattern.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6013",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 36: 5.3 Facade Pattern",
      "starter_code": "# Implementation for 5.3 Facade Pattern.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6013",
      "video_id": "tg-exact-sd-6013",
      "telegram_file_id": "4986003752692483772",
      "file_name": "5.3 Facade Pattern.mp4",
      "file_type": "mp4",
      "file_size_bytes": 97412710,
      "download_url": "/api/download/-5233650498/6013?file_name=5.3 Facade Pattern.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (5.3 Facade Pattern.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6012",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483771",
  "telegram_message_id": 6012,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 37: 5.2 Structural Design Patterns",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6012 | Size: 131.0 MB]\nFile Name: 5.2 Structural Design Patterns.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6012 (5.2 Structural Design Patterns.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6012",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 37: 5.2 Structural Design Patterns",
      "starter_code": "# Implementation for 5.2 Structural Design Patterns.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6012",
      "video_id": "tg-exact-sd-6012",
      "telegram_file_id": "4986003752692483771",
      "file_name": "5.2 Structural Design Patterns.mp4",
      "file_type": "mp4",
      "file_size_bytes": 137363456,
      "download_url": "/api/download/-5233650498/6012?file_name=5.2 Structural Design Patterns.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (5.2 Structural Design Patterns.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6011",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483770",
  "telegram_message_id": 6011,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 38: 5.1 Adapter Pattern (Structural Design Patterns)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6011 | Size: 87.5 MB]\nFile Name: 5.1 Adapter Pattern (Structural Design Patterns).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6011 (5.1 Adapter Pattern (Structural Design Patterns).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6011",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 38: 5.1 Adapter Pattern (Structural Design Patterns)",
      "starter_code": "# Implementation for 5.1 Adapter Pattern (Structural Design Patterns).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6011",
      "video_id": "tg-exact-sd-6011",
      "telegram_file_id": "4986003752692483770",
      "file_name": "5.1 Adapter Pattern (Structural Design Patterns).mp4",
      "file_type": "mp4",
      "file_size_bytes": 91750400,
      "download_url": "/api/download/-5233650498/6011?file_name=5.1 Adapter Pattern (Structural Design Patterns).mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (5.1 Adapter Pattern (Structural Design Patterns).mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6010",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483769",
  "telegram_message_id": 6010,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 39: 4_1_Introduction_to_Design_Patterns_Creational_Design_Patterns",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6010 | Size: 50.4 MB]\nFile Name: 4_1_Introduction_to_Design_Patterns_Creational_Design_Patterns.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6010 (4_1_Introduction_to_Design_Patterns_Creational_Design_Patterns.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6010",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 39: 4_1_Introduction_to_Design_Patterns_Creational_Design_Patterns",
      "starter_code": "# Implementation for 4_1_Introduction_to_Design_Patterns_Creational_Design_Patterns.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6010",
      "video_id": "tg-exact-sd-6010",
      "telegram_file_id": "4986003752692483769",
      "file_name": "4_1_Introduction_to_Design_Patterns_Creational_Design_Patterns.mp4",
      "file_type": "mp4",
      "file_size_bytes": 52848230,
      "download_url": "/api/download/-5233650498/6010?file_name=4_1_Introduction_to_Design_Patterns_Creational_Design_Patterns.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (4_1_Introduction_to_Design_Patterns_Creational_Design_Patterns.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6009",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483768",
  "telegram_message_id": 6009,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 40: 4.6 Prototype Pattern",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6009 | Size: 113.3 MB]\nFile Name: 4.6 Prototype Pattern.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6009 (4.6 Prototype Pattern.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6009",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 40: 4.6 Prototype Pattern",
      "starter_code": "# Implementation for 4.6 Prototype Pattern.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6009",
      "video_id": "tg-exact-sd-6009",
      "telegram_file_id": "4986003752692483768",
      "file_name": "4.6 Prototype Pattern.mp4",
      "file_type": "mp4",
      "file_size_bytes": 118803660,
      "download_url": "/api/download/-5233650498/6009?file_name=4.6 Prototype Pattern.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (4.6 Prototype Pattern.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6008",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483767",
  "telegram_message_id": 6008,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 41: 4.5 Abstract Factory",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6008 | Size: 188.7 MB]\nFile Name: 4.5 Abstract Factory.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6008 (4.5 Abstract Factory.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6008",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 41: 4.5 Abstract Factory",
      "starter_code": "# Implementation for 4.5 Abstract Factory.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6008",
      "video_id": "tg-exact-sd-6008",
      "telegram_file_id": "4986003752692483767",
      "file_name": "4.5 Abstract Factory.mp4",
      "file_type": "mp4",
      "file_size_bytes": 197866291,
      "download_url": "/api/download/-5233650498/6008?file_name=4.5 Abstract Factory.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (4.5 Abstract Factory.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6007",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483766",
  "telegram_message_id": 6007,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 42: 4.4 Builder Pattern",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6007 | Size: 151.9 MB]\nFile Name: 4.4 Builder Pattern.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6007 (4.4 Builder Pattern.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6007",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 42: 4.4 Builder Pattern",
      "starter_code": "# Implementation for 4.4 Builder Pattern.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6007",
      "video_id": "tg-exact-sd-6007",
      "telegram_file_id": "4986003752692483766",
      "file_name": "4.4 Builder Pattern.mp4",
      "file_type": "mp4",
      "file_size_bytes": 159278694,
      "download_url": "/api/download/-5233650498/6007?file_name=4.4 Builder Pattern.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (4.4 Builder Pattern.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6006",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483765",
  "telegram_message_id": 6006,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 43: 4.3 Factory Method",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6006 | Size: 89.5 MB]\nFile Name: 4.3 Factory Method.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6006 (4.3 Factory Method.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6006",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 43: 4.3 Factory Method",
      "starter_code": "# Implementation for 4.3 Factory Method.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6006",
      "video_id": "tg-exact-sd-6006",
      "telegram_file_id": "4986003752692483765",
      "file_name": "4.3 Factory Method.mp4",
      "file_type": "mp4",
      "file_size_bytes": 93847552,
      "download_url": "/api/download/-5233650498/6006?file_name=4.3 Factory Method.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (4.3 Factory Method.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6005",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483764",
  "telegram_message_id": 6005,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 44: 4.2 Singleton Design Pattern",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6005 | Size: 164.8 MB]\nFile Name: 4.2 Singleton Design Pattern.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6005 (4.2 Singleton Design Pattern.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6005",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 44: 4.2 Singleton Design Pattern",
      "starter_code": "# Implementation for 4.2 Singleton Design Pattern.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6005",
      "video_id": "tg-exact-sd-6005",
      "telegram_file_id": "4986003752692483764",
      "file_name": "4.2 Singleton Design Pattern.mp4",
      "file_type": "mp4",
      "file_size_bytes": 172805324,
      "download_url": "/api/download/-5233650498/6005?file_name=4.2 Singleton Design Pattern.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (4.2 Singleton Design Pattern.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6004",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483763",
  "telegram_message_id": 6004,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 45: 3.2 Class UML diagrams",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6004 | Size: 210.8 MB]\nFile Name: 3.2 Class UML diagrams.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6004 (3.2 Class UML diagrams.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6004",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 45: 3.2 Class UML diagrams",
      "starter_code": "# Implementation for 3.2 Class UML diagrams.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6004",
      "video_id": "tg-exact-sd-6004",
      "telegram_file_id": "4986003752692483763",
      "file_name": "3.2 Class UML diagrams.mp4",
      "file_type": "mp4",
      "file_size_bytes": 221039820,
      "download_url": "/api/download/-5233650498/6004?file_name=3.2 Class UML diagrams.mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (3.2 Class UML diagrams.mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6003",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483762",
  "telegram_message_id": 6003,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 46: 3.1 Unified Modeling Language (UML)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6003 | Size: 68.0 MB]\nFile Name: 3.1 Unified Modeling Language (UML).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6003 (3.1 Unified Modeling Language (UML).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6003",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 46: 3.1 Unified Modeling Language (UML)",
      "starter_code": "# Implementation for 3.1 Unified Modeling Language (UML).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6003",
      "video_id": "tg-exact-sd-6003",
      "telegram_file_id": "4986003752692483762",
      "file_name": "3.1 Unified Modeling Language (UML).mp4",
      "file_type": "mp4",
      "file_size_bytes": 71303168,
      "download_url": "/api/download/-5233650498/6003?file_name=3.1 Unified Modeling Language (UML).mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (3.1 Unified Modeling Language (UML).mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6002",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483761",
  "telegram_message_id": 6002,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 47: 2.5 Dependency Inversion Principle (DIP)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6002 | Size: 90.6 MB]\nFile Name: 2.5 Dependency Inversion Principle (DIP).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6002 (2.5 Dependency Inversion Principle (DIP).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6002",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 47: 2.5 Dependency Inversion Principle (DIP)",
      "starter_code": "# Implementation for 2.5 Dependency Inversion Principle (DIP).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6002",
      "video_id": "tg-exact-sd-6002",
      "telegram_file_id": "4986003752692483761",
      "file_name": "2.5 Dependency Inversion Principle (DIP).mp4",
      "file_type": "mp4",
      "file_size_bytes": 95000985,
      "download_url": "/api/download/-5233650498/6002?file_name=2.5 Dependency Inversion Principle (DIP).mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (2.5 Dependency Inversion Principle (DIP).mp4)"
    }
  ]
},
{
  "id": "tg-exact-sd-6001",
  "channel_id": "ch-sd-02",
  "telegram_file_id": "4986003752692483760",
  "telegram_message_id": 6001,
  "sender_username": "@Striver_SD_Bot",
  "title": "System Design Lecture 48: 2.4 Interface Segregation Principle (ISP)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6001 | Size: 48.0 MB]\nFile Name: 2.4 Interface Segregation Principle (ISP).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6001 (2.4 Interface Segregation Principle (ISP).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-03T11:08:36+00:00",
  "quiz_json": [
    {
      "id": "q-exact-sd-6001",
      "type": "CODING",
      "question": "Implement solution for System Design Lecture 48: 2.4 Interface Segregation Principle (ISP)",
      "starter_code": "# Implementation for 2.4 Interface Segregation Principle (ISP).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-sd-6001",
      "video_id": "tg-exact-sd-6001",
      "telegram_file_id": "4986003752692483760",
      "file_name": "2.4 Interface Segregation Principle (ISP).mp4",
      "file_type": "mp4",
      "file_size_bytes": 50331648,
      "download_url": "/api/download/-5233650498/6001?file_name=2.4 Interface Segregation Principle (ISP).mp4",
      "created_at": "2026-03-03T11:08:36+00:00",
      "caption": "Telegram Study Attachment (2.4 Interface Segregation Principle (ISP).mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6144",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958186",
  "telegram_message_id": 6144,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 1: 14.3 Event-Driven Architecture",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6144 | Size: 122.9 MB]\nFile Name: 14.3 Event-Driven Architecture.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6144 (14.3 Event-Driven Architecture.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6144",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 1: 14.3 Event-Driven Architecture",
      "starter_code": "# Implementation for 14.3 Event-Driven Architecture.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6144",
      "video_id": "tg-exact-dbms-6144",
      "telegram_file_id": "4992464001980958186",
      "file_name": "14.3 Event-Driven Architecture.mp4",
      "file_type": "mp4",
      "file_size_bytes": 128869990,
      "download_url": "/api/download/-5139397617/6144?file_name=14.3 Event-Driven Architecture.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (14.3 Event-Driven Architecture.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6143",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958185",
  "telegram_message_id": 6143,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 2: 14.2 Data Warehousing",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6143 | Size: 104.9 MB]\nFile Name: 14.2 Data Warehousing.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6143 (14.2 Data Warehousing.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6143",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 2: 14.2 Data Warehousing",
      "starter_code": "# Implementation for 14.2 Data Warehousing.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6143",
      "video_id": "tg-exact-dbms-6143",
      "telegram_file_id": "4992464001980958185",
      "file_name": "14.2 Data Warehousing.mp4",
      "file_type": "mp4",
      "file_size_bytes": 109995622,
      "download_url": "/api/download/-5139397617/6143?file_name=14.2 Data Warehousing.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (14.2 Data Warehousing.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6142",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958184",
  "telegram_message_id": 6142,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 3: 14.1 Database Migration (Data Warehousing and Migration)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6142 | Size: 100.6 MB]\nFile Name: 14.1 Database Migration (Data Warehousing and Migration).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6142 (14.1 Database Migration (Data Warehousing and Migration).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6142",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 3: 14.1 Database Migration (Data Warehousing and Migration)",
      "starter_code": "# Implementation for 14.1 Database Migration (Data Warehousing and Migration).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6142",
      "video_id": "tg-exact-dbms-6142",
      "telegram_file_id": "4992464001980958184",
      "file_name": "14.1 Database Migration (Data Warehousing and Migration).mp4",
      "file_type": "mp4",
      "file_size_bytes": 105486745,
      "download_url": "/api/download/-5139397617/6142?file_name=14.1 Database Migration (Data Warehousing and Migration).mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (14.1 Database Migration (Data Warehousing and Migration).mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6141",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958183",
  "telegram_message_id": 6141,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 4: 13.3 DBaas (Database as a Service)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6141 | Size: 65.1 MB]\nFile Name: 13.3 DBaas (Database as a Service).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6141 (13.3 DBaas (Database as a Service).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6141",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 4: 13.3 DBaas (Database as a Service)",
      "starter_code": "# Implementation for 13.3 DBaas (Database as a Service).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6141",
      "video_id": "tg-exact-dbms-6141",
      "telegram_file_id": "4992464001980958183",
      "file_name": "13.3 DBaas (Database as a Service).mp4",
      "file_type": "mp4",
      "file_size_bytes": 68262297,
      "download_url": "/api/download/-5139397617/6141?file_name=13.3 DBaas (Database as a Service).mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (13.3 DBaas (Database as a Service).mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6140",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958182",
  "telegram_message_id": 6140,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 5: 13.2 Big Data and DBMS",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6140 | Size: 111.5 MB]\nFile Name: 13.2 Big Data and DBMS.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6140 (13.2 Big Data and DBMS.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6140",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 5: 13.2 Big Data and DBMS",
      "starter_code": "# Implementation for 13.2 Big Data and DBMS.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6140",
      "video_id": "tg-exact-dbms-6140",
      "telegram_file_id": "4992464001980958182",
      "file_name": "13.2 Big Data and DBMS.mp4",
      "file_type": "mp4",
      "file_size_bytes": 116916224,
      "download_url": "/api/download/-5139397617/6140?file_name=13.2 Big Data and DBMS.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (13.2 Big Data and DBMS.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6139",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958181",
  "telegram_message_id": 6139,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 6: 13.1 Database Scaling (Scalability and Big Data)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6139 | Size: 126.3 MB]\nFile Name: 13.1 Database Scaling (Scalability and Big Data).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6139 (13.1 Database Scaling (Scalability and Big Data).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6139",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 6: 13.1 Database Scaling (Scalability and Big Data)",
      "starter_code": "# Implementation for 13.1 Database Scaling (Scalability and Big Data).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6139",
      "video_id": "tg-exact-dbms-6139",
      "telegram_file_id": "4992464001980958181",
      "file_name": "13.1 Database Scaling (Scalability and Big Data).mp4",
      "file_type": "mp4",
      "file_size_bytes": 132435148,
      "download_url": "/api/download/-5139397617/6139?file_name=13.1 Database Scaling (Scalability and Big Data).mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (13.1 Database Scaling (Scalability and Big Data).mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6138",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958180",
  "telegram_message_id": 6138,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 7: 12.6 RBAC Models",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6138 | Size: 113.4 MB]\nFile Name: 12.6 RBAC Models.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6138 (12.6 RBAC Models.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6138",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 7: 12.6 RBAC Models",
      "starter_code": "# Implementation for 12.6 RBAC Models.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6138",
      "video_id": "tg-exact-dbms-6138",
      "telegram_file_id": "4992464001980958180",
      "file_name": "12.6 RBAC Models.mp4",
      "file_type": "mp4",
      "file_size_bytes": 118908518,
      "download_url": "/api/download/-5139397617/6138?file_name=12.6 RBAC Models.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (12.6 RBAC Models.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6137",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958179",
  "telegram_message_id": 6137,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 8: 12.5 RBAC (Role-Based Access Control)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6137 | Size: 100.4 MB]\nFile Name: 12.5 RBAC (Role-Based Access Control).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6137 (12.5 RBAC (Role-Based Access Control).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6137",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 8: 12.5 RBAC (Role-Based Access Control)",
      "starter_code": "# Implementation for 12.5 RBAC (Role-Based Access Control).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6137",
      "video_id": "tg-exact-dbms-6137",
      "telegram_file_id": "4992464001980958179",
      "file_name": "12.5 RBAC (Role-Based Access Control).mp4",
      "file_type": "mp4",
      "file_size_bytes": 105277030,
      "download_url": "/api/download/-5139397617/6137?file_name=12.5 RBAC (Role-Based Access Control).mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (12.5 RBAC (Role-Based Access Control).mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6136",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958178",
  "telegram_message_id": 6136,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 9: 12.4 Data Masking Techniques",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6136 | Size: 105.4 MB]\nFile Name: 12.4 Data Masking Techniques.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6136 (12.4 Data Masking Techniques.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6136",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 9: 12.4 Data Masking Techniques",
      "starter_code": "# Implementation for 12.4 Data Masking Techniques.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6136",
      "video_id": "tg-exact-dbms-6136",
      "telegram_file_id": "4992464001980958178",
      "file_name": "12.4 Data Masking Techniques.mp4",
      "file_type": "mp4",
      "file_size_bytes": 110519910,
      "download_url": "/api/download/-5139397617/6136?file_name=12.4 Data Masking Techniques.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (12.4 Data Masking Techniques.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6135",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958177",
  "telegram_message_id": 6135,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 10: 12.3 Encryption Techniques in DBMS",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6135 | Size: 64.1 MB]\nFile Name: 12.3 Encryption Techniques in DBMS.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6135 (12.3 Encryption Techniques in DBMS.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6135",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 10: 12.3 Encryption Techniques in DBMS",
      "starter_code": "# Implementation for 12.3 Encryption Techniques in DBMS.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6135",
      "video_id": "tg-exact-dbms-6135",
      "telegram_file_id": "4992464001980958177",
      "file_name": "12.3 Encryption Techniques in DBMS.mp4",
      "file_type": "mp4",
      "file_size_bytes": 67213721,
      "download_url": "/api/download/-5139397617/6135?file_name=12.3 Encryption Techniques in DBMS.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (12.3 Encryption Techniques in DBMS.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6134",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958176",
  "telegram_message_id": 6134,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 11: 12.2 Database Security",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6134 | Size: 124.8 MB]\nFile Name: 12.2 Database Security.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6134 (12.2 Database Security.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6134",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 11: 12.2 Database Security",
      "starter_code": "# Implementation for 12.2 Database Security.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6134",
      "video_id": "tg-exact-dbms-6134",
      "telegram_file_id": "4992464001980958176",
      "file_name": "12.2 Database Security.mp4",
      "file_type": "mp4",
      "file_size_bytes": 130862284,
      "download_url": "/api/download/-5139397617/6134?file_name=12.2 Database Security.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (12.2 Database Security.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6133",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958175",
  "telegram_message_id": 6133,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 12: 12.1 Data Encryption in DBMS (Security and Access Control)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6133 | Size: 84.4 MB]\nFile Name: 12.1 Data Encryption in DBMS (Security and Access Control).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6133 (12.1 Data Encryption in DBMS (Security and Access Control).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6133",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 12: 12.1 Data Encryption in DBMS (Security and Access Control)",
      "starter_code": "# Implementation for 12.1 Data Encryption in DBMS (Security and Access Control).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6133",
      "video_id": "tg-exact-dbms-6133",
      "telegram_file_id": "4992464001980958175",
      "file_name": "12.1 Data Encryption in DBMS (Security and Access Control).mp4",
      "file_type": "mp4",
      "file_size_bytes": 88499814,
      "download_url": "/api/download/-5139397617/6133?file_name=12.1 Data Encryption in DBMS (Security and Access Control).mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (12.1 Data Encryption in DBMS (Security and Access Control).mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6132",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958174",
  "telegram_message_id": 6132,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 13: 11.4 Database Caching Strategies",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6132 | Size: 81.1 MB]\nFile Name: 11.4 Database Caching Strategies.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6132 (11.4 Database Caching Strategies.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6132",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 13: 11.4 Database Caching Strategies",
      "starter_code": "# Implementation for 11.4 Database Caching Strategies.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6132",
      "video_id": "tg-exact-dbms-6132",
      "telegram_file_id": "4992464001980958174",
      "file_name": "11.4 Database Caching Strategies.mp4",
      "file_type": "mp4",
      "file_size_bytes": 85039513,
      "download_url": "/api/download/-5139397617/6132?file_name=11.4 Database Caching Strategies.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (11.4 Database Caching Strategies.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6131",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958173",
  "telegram_message_id": 6131,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 14: 11.3 Database Caching",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6131 | Size: 89.5 MB]\nFile Name: 11.3 Database Caching.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6131 (11.3 Database Caching.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6131",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 14: 11.3 Database Caching",
      "starter_code": "# Implementation for 11.3 Database Caching.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6131",
      "video_id": "tg-exact-dbms-6131",
      "telegram_file_id": "4992464001980958173",
      "file_name": "11.3 Database Caching.mp4",
      "file_type": "mp4",
      "file_size_bytes": 93847552,
      "download_url": "/api/download/-5139397617/6131?file_name=11.3 Database Caching.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (11.3 Database Caching.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6130",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958172",
  "telegram_message_id": 6130,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 15: 11.2 Performance Tuning",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6130 | Size: 106.2 MB]\nFile Name: 11.2 Performance Tuning.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6130 (11.2 Performance Tuning.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6130",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 15: 11.2 Performance Tuning",
      "starter_code": "# Implementation for 11.2 Performance Tuning.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6130",
      "video_id": "tg-exact-dbms-6130",
      "telegram_file_id": "4992464001980958172",
      "file_name": "11.2 Performance Tuning.mp4",
      "file_type": "mp4",
      "file_size_bytes": 111358771,
      "download_url": "/api/download/-5139397617/6130?file_name=11.2 Performance Tuning.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (11.2 Performance Tuning.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6129",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958171",
  "telegram_message_id": 6129,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 16: 11.1 Database Monitoring (Database Monitoring and Caching)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6129 | Size: 124.7 MB]\nFile Name: 11.1 Database Monitoring (Database Monitoring and Caching).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6129 (11.1 Database Monitoring (Database Monitoring and Caching).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6129",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 16: 11.1 Database Monitoring (Database Monitoring and Caching)",
      "starter_code": "# Implementation for 11.1 Database Monitoring (Database Monitoring and Caching).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6129",
      "video_id": "tg-exact-dbms-6129",
      "telegram_file_id": "4992464001980958171",
      "file_name": "11.1 Database Monitoring (Database Monitoring and Caching).mp4",
      "file_type": "mp4",
      "file_size_bytes": 130757427,
      "download_url": "/api/download/-5139397617/6129?file_name=11.1 Database Monitoring (Database Monitoring and Caching).mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (11.1 Database Monitoring (Database Monitoring and Caching).mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6128",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958170",
  "telegram_message_id": 6128,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 17: 10.4 B- and B+ Trees",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6128 | Size: 117.3 MB]\nFile Name: 10.4 B- and B+ Trees.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6128 (10.4 B- and B+ Trees.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6128",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 17: 10.4 B- and B+ Trees",
      "starter_code": "# Implementation for 10.4 B- and B+ Trees.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6128",
      "video_id": "tg-exact-dbms-6128",
      "telegram_file_id": "4992464001980958170",
      "file_name": "10.4 B- and B+ Trees.mp4",
      "file_type": "mp4",
      "file_size_bytes": 122997964,
      "download_url": "/api/download/-5139397617/6128?file_name=10.4 B- and B+ Trees.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (10.4 B- and B+ Trees.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6127",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958169",
  "telegram_message_id": 6127,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 18: 10.3 Indexing Techniques",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6127 | Size: 114.9 MB]\nFile Name: 10.3 Indexing Techniques.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6127 (10.3 Indexing Techniques.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6127",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 18: 10.3 Indexing Techniques",
      "starter_code": "# Implementation for 10.3 Indexing Techniques.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6127",
      "video_id": "tg-exact-dbms-6127",
      "telegram_file_id": "4992464001980958169",
      "file_name": "10.3 Indexing Techniques.mp4",
      "file_type": "mp4",
      "file_size_bytes": 120481382,
      "download_url": "/api/download/-5139397617/6127?file_name=10.3 Indexing Techniques.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (10.3 Indexing Techniques.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6126",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958168",
  "telegram_message_id": 6126,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 19: 10.2 Types of Database Indexing",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6126 | Size: 105.1 MB]\nFile Name: 10.2 Types of Database Indexing.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6126 (10.2 Types of Database Indexing.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6126",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 19: 10.2 Types of Database Indexing",
      "starter_code": "# Implementation for 10.2 Types of Database Indexing.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6126",
      "video_id": "tg-exact-dbms-6126",
      "telegram_file_id": "4992464001980958168",
      "file_name": "10.2 Types of Database Indexing.mp4",
      "file_type": "mp4",
      "file_size_bytes": 110205337,
      "download_url": "/api/download/-5139397617/6126?file_name=10.2 Types of Database Indexing.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (10.2 Types of Database Indexing.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6125",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958167",
  "telegram_message_id": 6125,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 20: 10.1 Database Indexing (Indexing and Performance Tuning)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6125 | Size: 153.7 MB]\nFile Name: 10.1 Database Indexing (Indexing and Performance Tuning).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6125 (10.1 Database Indexing (Indexing and Performance Tuning).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6125",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 20: 10.1 Database Indexing (Indexing and Performance Tuning)",
      "starter_code": "# Implementation for 10.1 Database Indexing (Indexing and Performance Tuning).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6125",
      "video_id": "tg-exact-dbms-6125",
      "telegram_file_id": "4992464001980958167",
      "file_name": "10.1 Database Indexing (Indexing and Performance Tuning).mp4",
      "file_type": "mp4",
      "file_size_bytes": 161166131,
      "download_url": "/api/download/-5139397617/6125?file_name=10.1 Database Indexing (Indexing and Performance Tuning).mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (10.1 Database Indexing (Indexing and Performance Tuning).mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6124",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958166",
  "telegram_message_id": 6124,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 21: 9.2 Database Backups",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6124 | Size: 106.0 MB]\nFile Name: 9.2 Database Backups.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6124 (9.2 Database Backups.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6124",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 21: 9.2 Database Backups",
      "starter_code": "# Implementation for 9.2 Database Backups.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6124",
      "video_id": "tg-exact-dbms-6124",
      "telegram_file_id": "4992464001980958166",
      "file_name": "9.2 Database Backups.mp4",
      "file_type": "mp4",
      "file_size_bytes": 111149056,
      "download_url": "/api/download/-5139397617/6124?file_name=9.2 Database Backups.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (9.2 Database Backups.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6123",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958165",
  "telegram_message_id": 6123,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 22: 9.1 Database Recovery Management (Recovery and Backup)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6123 | Size: 126.3 MB]\nFile Name: 9.1 Database Recovery Management (Recovery and Backup).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6123 (9.1 Database Recovery Management (Recovery and Backup).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6123",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 22: 9.1 Database Recovery Management (Recovery and Backup)",
      "starter_code": "# Implementation for 9.1 Database Recovery Management (Recovery and Backup).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6123",
      "video_id": "tg-exact-dbms-6123",
      "telegram_file_id": "4992464001980958165",
      "file_name": "9.1 Database Recovery Management (Recovery and Backup).mp4",
      "file_type": "mp4",
      "file_size_bytes": 132435148,
      "download_url": "/api/download/-5139397617/6123?file_name=9.1 Database Recovery Management (Recovery and Backup).mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (9.1 Database Recovery Management (Recovery and Backup).mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6122",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958164",
  "telegram_message_id": 6122,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 23: 8.2 Stored Procedures in Databases",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6122 | Size: 108.5 MB]\nFile Name: 8.2 Stored Procedures in Databases.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6122 (8.2 Stored Procedures in Databases.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6122",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 23: 8.2 Stored Procedures in Databases",
      "starter_code": "# Implementation for 8.2 Stored Procedures in Databases.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6122",
      "video_id": "tg-exact-dbms-6122",
      "telegram_file_id": "4992464001980958164",
      "file_name": "8.2 Stored Procedures in Databases.mp4",
      "file_type": "mp4",
      "file_size_bytes": 113770496,
      "download_url": "/api/download/-5139397617/6122?file_name=8.2 Stored Procedures in Databases.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (8.2 Stored Procedures in Databases.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6121",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958163",
  "telegram_message_id": 6121,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 24: 8.1 Triggers in Databases (Triggers and Procedural Features)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6121 | Size: 107.9 MB]\nFile Name: 8.1 Triggers in Databases (Triggers and Procedural Features).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6121 (8.1 Triggers in Databases (Triggers and Procedural Features).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6121",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 24: 8.1 Triggers in Databases (Triggers and Procedural Features)",
      "starter_code": "# Implementation for 8.1 Triggers in Databases (Triggers and Procedural Features).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6121",
      "video_id": "tg-exact-dbms-6121",
      "telegram_file_id": "4992464001980958163",
      "file_name": "8.1 Triggers in Databases (Triggers and Procedural Features).mp4",
      "file_type": "mp4",
      "file_size_bytes": 113141350,
      "download_url": "/api/download/-5139397617/6121?file_name=8.1 Triggers in Databases (Triggers and Procedural Features).mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (8.1 Triggers in Databases (Triggers and Procedural Features).mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6120",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958162",
  "telegram_message_id": 6120,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 25: 7.15 Managing Transaction Consistency and Concurrency",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6120 | Size: 128.8 MB]\nFile Name: 7.15 Managing Transaction Consistency and Concurrency.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6120 (7.15 Managing Transaction Consistency and Concurrency.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6120",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 25: 7.15 Managing Transaction Consistency and Concurrency",
      "starter_code": "# Implementation for 7.15 Managing Transaction Consistency and Concurrency.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6120",
      "video_id": "tg-exact-dbms-6120",
      "telegram_file_id": "4992464001980958162",
      "file_name": "7.15 Managing Transaction Consistency and Concurrency.mp4",
      "file_type": "mp4",
      "file_size_bytes": 135056588,
      "download_url": "/api/download/-5139397617/6120?file_name=7.15 Managing Transaction Consistency and Concurrency.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (7.15 Managing Transaction Consistency and Concurrency.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6119",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958161",
  "telegram_message_id": 6119,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 26: 7.14 Isolation Levels",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6119 | Size: 97.5 MB]\nFile Name: 7.14 Isolation Levels.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6119 (7.14 Isolation Levels.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6119",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 26: 7.14 Isolation Levels",
      "starter_code": "# Implementation for 7.14 Isolation Levels.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6119",
      "video_id": "tg-exact-dbms-6119",
      "telegram_file_id": "4992464001980958161",
      "file_name": "7.14 Isolation Levels.mp4",
      "file_type": "mp4",
      "file_size_bytes": 102236160,
      "download_url": "/api/download/-5139397617/6119?file_name=7.14 Isolation Levels.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (7.14 Isolation Levels.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6118",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958160",
  "telegram_message_id": 6118,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 27: 7.13 Serialization Graphs in Databases",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6118 | Size: 63.6 MB]\nFile Name: 7.13 Serialization Graphs in Databases.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6118 (7.13 Serialization Graphs in Databases.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6118",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 27: 7.13 Serialization Graphs in Databases",
      "starter_code": "# Implementation for 7.13 Serialization Graphs in Databases.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6118",
      "video_id": "tg-exact-dbms-6118",
      "telegram_file_id": "4992464001980958160",
      "file_name": "7.13 Serialization Graphs in Databases.mp4",
      "file_type": "mp4",
      "file_size_bytes": 66689433,
      "download_url": "/api/download/-5139397617/6118?file_name=7.13 Serialization Graphs in Databases.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (7.13 Serialization Graphs in Databases.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6117",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958159",
  "telegram_message_id": 6117,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 28: 7.12 Scheduling in Databases",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6117 | Size: 83.2 MB]\nFile Name: 7.12 Scheduling in Databases.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6117 (7.12 Scheduling in Databases.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6117",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 28: 7.12 Scheduling in Databases",
      "starter_code": "# Implementation for 7.12 Scheduling in Databases.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6117",
      "video_id": "tg-exact-dbms-6117",
      "telegram_file_id": "4992464001980958159",
      "file_name": "7.12 Scheduling in Databases.mp4",
      "file_type": "mp4",
      "file_size_bytes": 87241523,
      "download_url": "/api/download/-5139397617/6117?file_name=7.12 Scheduling in Databases.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (7.12 Scheduling in Databases.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6116",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958158",
  "telegram_message_id": 6116,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 29: 7.11 Serialization in Databases",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6116 | Size: 151.9 MB]\nFile Name: 7.11 Serialization in Databases.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6116 (7.11 Serialization in Databases.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6116",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 29: 7.11 Serialization in Databases",
      "starter_code": "# Implementation for 7.11 Serialization in Databases.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6116",
      "video_id": "tg-exact-dbms-6116",
      "telegram_file_id": "4992464001980958158",
      "file_name": "7.11 Serialization in Databases.mp4",
      "file_type": "mp4",
      "file_size_bytes": 159278694,
      "download_url": "/api/download/-5139397617/6116?file_name=7.11 Serialization in Databases.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (7.11 Serialization in Databases.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6115",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958157",
  "telegram_message_id": 6115,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 30: 7.10 Concurrency Control in Distributed Databases",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6115 | Size: 157.8 MB]\nFile Name: 7.10 Concurrency Control in Distributed Databases.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6115 (7.10 Concurrency Control in Distributed Databases.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:03:21+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6115",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 30: 7.10 Concurrency Control in Distributed Databases",
      "starter_code": "# Implementation for 7.10 Concurrency Control in Distributed Databases.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6115",
      "video_id": "tg-exact-dbms-6115",
      "telegram_file_id": "4992464001980958157",
      "file_name": "7.10 Concurrency Control in Distributed Databases.mp4",
      "file_type": "mp4",
      "file_size_bytes": 165465292,
      "download_url": "/api/download/-5139397617/6115?file_name=7.10 Concurrency Control in Distributed Databases.mp4",
      "created_at": "2026-03-04T17:03:21+00:00",
      "caption": "Telegram Study Attachment (7.10 Concurrency Control in Distributed Databases.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6114",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958156",
  "telegram_message_id": 6114,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 31: 7.9 Deadlock in DBMS",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6114 | Size: 179.2 MB]\nFile Name: 7.9 Deadlock in DBMS.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6114 (7.9 Deadlock in DBMS.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6114",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 31: 7.9 Deadlock in DBMS",
      "starter_code": "# Implementation for 7.9 Deadlock in DBMS.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6114",
      "video_id": "tg-exact-dbms-6114",
      "telegram_file_id": "4992464001980958156",
      "file_name": "7.9 Deadlock in DBMS.mp4",
      "file_type": "mp4",
      "file_size_bytes": 187904819,
      "download_url": "/api/download/-5139397617/6114?file_name=7.9 Deadlock in DBMS.mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (7.9 Deadlock in DBMS.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6113",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958155",
  "telegram_message_id": 6113,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 32: 7.8 Starvation in DBMS",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6113 | Size: 77.6 MB]\nFile Name: 7.8 Starvation in DBMS.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6113 (7.8 Starvation in DBMS.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6113",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 32: 7.8 Starvation in DBMS",
      "starter_code": "# Implementation for 7.8 Starvation in DBMS.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6113",
      "video_id": "tg-exact-dbms-6113",
      "telegram_file_id": "4992464001980958155",
      "file_name": "7.8 Starvation in DBMS.mp4",
      "file_type": "mp4",
      "file_size_bytes": 81369497,
      "download_url": "/api/download/-5139397617/6113?file_name=7.8 Starvation in DBMS.mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (7.8 Starvation in DBMS.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6112",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958154",
  "telegram_message_id": 6112,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 33: 7.7 Timestamp Ordering Protocols in DBMS",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6112 | Size: 133.8 MB]\nFile Name: 7.7 Timestamp Ordering Protocols in DBMS.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6112 (7.7 Timestamp Ordering Protocols in DBMS.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6112",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 33: 7.7 Timestamp Ordering Protocols in DBMS",
      "starter_code": "# Implementation for 7.7 Timestamp Ordering Protocols in DBMS.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6112",
      "video_id": "tg-exact-dbms-6112",
      "telegram_file_id": "4992464001980958154",
      "file_name": "7.7 Timestamp Ordering Protocols in DBMS.mp4",
      "file_type": "mp4",
      "file_size_bytes": 140299468,
      "download_url": "/api/download/-5139397617/6112?file_name=7.7 Timestamp Ordering Protocols in DBMS.mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (7.7 Timestamp Ordering Protocols in DBMS.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6111",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958153",
  "telegram_message_id": 6111,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 34: 7.6 Locking Protocol (Shared Locks, Exclusive Locks)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6111 | Size: 145.5 MB]\nFile Name: 7.6 Locking Protocol (Shared Locks, Exclusive Locks).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6111 (7.6 Locking Protocol (Shared Locks, Exclusive Locks).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6111",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 34: 7.6 Locking Protocol (Shared Locks, Exclusive Locks)",
      "starter_code": "# Implementation for 7.6 Locking Protocol (Shared Locks, Exclusive Locks).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6111",
      "video_id": "tg-exact-dbms-6111",
      "telegram_file_id": "4992464001980958153",
      "file_name": "7.6 Locking Protocol (Shared Locks, Exclusive Locks).mp4",
      "file_type": "mp4",
      "file_size_bytes": 152567808,
      "download_url": "/api/download/-5139397617/6111?file_name=7.6 Locking Protocol (Shared Locks, Exclusive Locks).mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (7.6 Locking Protocol (Shared Locks, Exclusive Locks).mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6110",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958152",
  "telegram_message_id": 6110,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 35: 7.5 Concurrency Control in Databases",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6110 | Size: 190.8 MB]\nFile Name: 7.5 Concurrency Control in Databases.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6110 (7.5 Concurrency Control in Databases.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6110",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 35: 7.5 Concurrency Control in Databases",
      "starter_code": "# Implementation for 7.5 Concurrency Control in Databases.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6110",
      "video_id": "tg-exact-dbms-6110",
      "telegram_file_id": "4992464001980958152",
      "file_name": "7.5 Concurrency Control in Databases.mp4",
      "file_type": "mp4",
      "file_size_bytes": 200068300,
      "download_url": "/api/download/-5139397617/6110?file_name=7.5 Concurrency Control in Databases.mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (7.5 Concurrency Control in Databases.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6109",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958151",
  "telegram_message_id": 6109,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 36: 7.4 Database Transactions",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6109 | Size: 99.2 MB]\nFile Name: 7.4 Database Transactions.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6109 (7.4 Database Transactions.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6109",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 36: 7.4 Database Transactions",
      "starter_code": "# Implementation for 7.4 Database Transactions.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6109",
      "video_id": "tg-exact-dbms-6109",
      "telegram_file_id": "4992464001980958151",
      "file_name": "7.4 Database Transactions.mp4",
      "file_type": "mp4",
      "file_size_bytes": 104018739,
      "download_url": "/api/download/-5139397617/6109?file_name=7.4 Database Transactions.mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (7.4 Database Transactions.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6108",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958150",
  "telegram_message_id": 6108,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 37: 7.3 CAP Theorem",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6108 | Size: 133.5 MB]\nFile Name: 7.3 CAP Theorem.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6108 (7.3 CAP Theorem.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6108",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 37: 7.3 CAP Theorem",
      "starter_code": "# Implementation for 7.3 CAP Theorem.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6108",
      "video_id": "tg-exact-dbms-6108",
      "telegram_file_id": "4992464001980958150",
      "file_name": "7.3 CAP Theorem.mp4",
      "file_type": "mp4",
      "file_size_bytes": 139984896,
      "download_url": "/api/download/-5139397617/6108?file_name=7.3 CAP Theorem.mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (7.3 CAP Theorem.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6107",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958149",
  "telegram_message_id": 6107,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 38: 7.2 ACID Properties",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6107 | Size: 107.6 MB]\nFile Name: 7.2 ACID Properties.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6107 (7.2 ACID Properties.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6107",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 38: 7.2 ACID Properties",
      "starter_code": "# Implementation for 7.2 ACID Properties.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6107",
      "video_id": "tg-exact-dbms-6107",
      "telegram_file_id": "4992464001980958149",
      "file_name": "7.2 ACID Properties.mp4",
      "file_type": "mp4",
      "file_size_bytes": 112826777,
      "download_url": "/api/download/-5139397617/6107?file_name=7.2 ACID Properties.mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (7.2 ACID Properties.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6106",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958148",
  "telegram_message_id": 6106,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 39: 7.1 Thomas' Rules (Transactions and Concurrency)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6106 | Size: 59.3 MB]\nFile Name: 7.1 Thomas' Rules (Transactions and Concurrency).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6106 (7.1 Thomas' Rules (Transactions and Concurrency).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6106",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 39: 7.1 Thomas' Rules (Transactions and Concurrency)",
      "starter_code": "# Implementation for 7.1 Thomas' Rules (Transactions and Concurrency).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6106",
      "video_id": "tg-exact-dbms-6106",
      "telegram_file_id": "4992464001980958148",
      "file_name": "7.1 Thomas' Rules (Transactions and Concurrency).mp4",
      "file_type": "mp4",
      "file_size_bytes": 62180556,
      "download_url": "/api/download/-5139397617/6106?file_name=7.1 Thomas' Rules (Transactions and Concurrency).mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (7.1 Thomas' Rules (Transactions and Concurrency).mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6105",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958147",
  "telegram_message_id": 6105,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 40: 6.7 Data Replication Techniques",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6105 | Size: 130.5 MB]\nFile Name: 6.7 Data Replication Techniques.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6105 (6.7 Data Replication Techniques.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6105",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 40: 6.7 Data Replication Techniques",
      "starter_code": "# Implementation for 6.7 Data Replication Techniques.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6105",
      "video_id": "tg-exact-dbms-6105",
      "telegram_file_id": "4992464001980958147",
      "file_name": "6.7 Data Replication Techniques.mp4",
      "file_type": "mp4",
      "file_size_bytes": 136839168,
      "download_url": "/api/download/-5139397617/6105?file_name=6.7 Data Replication Techniques.mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (6.7 Data Replication Techniques.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6104",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958146",
  "telegram_message_id": 6104,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 41: 6.6 Load Balancing in Distributed Databases",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6104 | Size: 97.3 MB]\nFile Name: 6.6 Load Balancing in Distributed Databases.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6104 (6.6 Load Balancing in Distributed Databases.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6104",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 41: 6.6 Load Balancing in Distributed Databases",
      "starter_code": "# Implementation for 6.6 Load Balancing in Distributed Databases.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6104",
      "video_id": "tg-exact-dbms-6104",
      "telegram_file_id": "4992464001980958146",
      "file_name": "6.6 Load Balancing in Distributed Databases.mp4",
      "file_type": "mp4",
      "file_size_bytes": 102026444,
      "download_url": "/api/download/-5139397617/6104?file_name=6.6 Load Balancing in Distributed Databases.mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (6.6 Load Balancing in Distributed Databases.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6103",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958145",
  "telegram_message_id": 6103,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 42: 6.5 Fault Tolerance in Distributed Databases",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6103 | Size: 126.3 MB]\nFile Name: 6.5 Fault Tolerance in Distributed Databases.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6103 (6.5 Fault Tolerance in Distributed Databases.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6103",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 42: 6.5 Fault Tolerance in Distributed Databases",
      "starter_code": "# Implementation for 6.5 Fault Tolerance in Distributed Databases.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6103",
      "video_id": "tg-exact-dbms-6103",
      "telegram_file_id": "4992464001980958145",
      "file_name": "6.5 Fault Tolerance in Distributed Databases.mp4",
      "file_type": "mp4",
      "file_size_bytes": 132435148,
      "download_url": "/api/download/-5139397617/6103?file_name=6.5 Fault Tolerance in Distributed Databases.mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (6.5 Fault Tolerance in Distributed Databases.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6102",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958144",
  "telegram_message_id": 6102,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 43: 6.4 Data Distribution Methods",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6102 | Size: 151.2 MB]\nFile Name: 6.4 Data Distribution Methods.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6102 (6.4 Data Distribution Methods.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6102",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 43: 6.4 Data Distribution Methods",
      "starter_code": "# Implementation for 6.4 Data Distribution Methods.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6102",
      "video_id": "tg-exact-dbms-6102",
      "telegram_file_id": "4992464001980958144",
      "file_name": "6.4 Data Distribution Methods.mp4",
      "file_type": "mp4",
      "file_size_bytes": 158544691,
      "download_url": "/api/download/-5139397617/6102?file_name=6.4 Data Distribution Methods.mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (6.4 Data Distribution Methods.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6101",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958143",
  "telegram_message_id": 6101,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 44: 6.3 Architecture of Distributed Database Systems",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6101 | Size: 105.2 MB]\nFile Name: 6.3 Architecture of Distributed Database Systems.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6101 (6.3 Architecture of Distributed Database Systems.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6101",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 44: 6.3 Architecture of Distributed Database Systems",
      "starter_code": "# Implementation for 6.3 Architecture of Distributed Database Systems.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6101",
      "video_id": "tg-exact-dbms-6101",
      "telegram_file_id": "4992464001980958143",
      "file_name": "6.3 Architecture of Distributed Database Systems.mp4",
      "file_type": "mp4",
      "file_size_bytes": 110310195,
      "download_url": "/api/download/-5139397617/6101?file_name=6.3 Architecture of Distributed Database Systems.mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (6.3 Architecture of Distributed Database Systems.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6100",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958142",
  "telegram_message_id": 6100,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 45: 6.2 Distributed Database Systems",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6100 | Size: 122.2 MB]\nFile Name: 6.2 Distributed Database Systems.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6100 (6.2 Distributed Database Systems.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6100",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 45: 6.2 Distributed Database Systems",
      "starter_code": "# Implementation for 6.2 Distributed Database Systems.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6100",
      "video_id": "tg-exact-dbms-6100",
      "telegram_file_id": "4992464001980958142",
      "file_name": "6.2 Distributed Database Systems.mp4",
      "file_type": "mp4",
      "file_size_bytes": 128135987,
      "download_url": "/api/download/-5139397617/6100?file_name=6.2 Distributed Database Systems.mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (6.2 Distributed Database Systems.mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6099",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958141",
  "telegram_message_id": 6099,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 46: 6.1 Sharding in DBMS (Distributed Database Systems)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6099 | Size: 140.5 MB]\nFile Name: 6.1 Sharding in DBMS (Distributed Database Systems).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6099 (6.1 Sharding in DBMS (Distributed Database Systems).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6099",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 46: 6.1 Sharding in DBMS (Distributed Database Systems)",
      "starter_code": "# Implementation for 6.1 Sharding in DBMS (Distributed Database Systems).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6099",
      "video_id": "tg-exact-dbms-6099",
      "telegram_file_id": "4992464001980958141",
      "file_name": "6.1 Sharding in DBMS (Distributed Database Systems).mp4",
      "file_type": "mp4",
      "file_size_bytes": 147324928,
      "download_url": "/api/download/-5139397617/6099?file_name=6.1 Sharding in DBMS (Distributed Database Systems).mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (6.1 Sharding in DBMS (Distributed Database Systems).mp4)"
    }
  ]
},
{
  "id": "tg-exact-dbms-6098",
  "channel_id": "ch-dbms-03",
  "telegram_file_id": "4992464001980958140",
  "telegram_message_id": 6098,
  "sender_username": "@Striver_DBMS_Bot",
  "title": "DBMS Lecture 47: 5.8 Sharding in DBMS",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6098 | Size: 199.7 MB]\nFile Name: 5.8 Sharding in DBMS.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6098 (5.8 Sharding in DBMS.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:03:20+00:00",
  "quiz_json": [
    {
      "id": "q-exact-dbms-6098",
      "type": "CODING",
      "question": "Implement solution for DBMS Lecture 47: 5.8 Sharding in DBMS",
      "starter_code": "# Implementation for 5.8 Sharding in DBMS.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-dbms-6098",
      "video_id": "tg-exact-dbms-6098",
      "telegram_file_id": "4992464001980958140",
      "file_name": "5.8 Sharding in DBMS.mp4",
      "file_type": "mp4",
      "file_size_bytes": 209400627,
      "download_url": "/api/download/-5139397617/6098?file_name=5.8 Sharding in DBMS.mp4",
      "created_at": "2026-03-04T17:03:20+00:00",
      "caption": "Telegram Study Attachment (5.8 Sharding in DBMS.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6185",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480058",
  "telegram_message_id": 6185,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 1: 10.6 Network Reliability and Fault Tolerance",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6185 | Size: 61.9 MB]\nFile Name: 10.6 Network Reliability and Fault Tolerance.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6185 (10.6 Network Reliability and Fault Tolerance.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6185",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 1: 10.6 Network Reliability and Fault Tolerance",
      "starter_code": "# Implementation for 10.6 Network Reliability and Fault Tolerance.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6185",
      "video_id": "tg-exact-cn-6185",
      "telegram_file_id": "4990510028084480058",
      "file_name": "10.6 Network Reliability and Fault Tolerance.mp4",
      "file_type": "mp4",
      "file_size_bytes": 64906854,
      "download_url": "/api/download/-4621115089/6185?file_name=10.6 Network Reliability and Fault Tolerance.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (10.6 Network Reliability and Fault Tolerance.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6184",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480057",
  "telegram_message_id": 6184,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 2: 10.5 Software-Defined Networking (SDN)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6184 | Size: 63.8 MB]\nFile Name: 10.5 Software-Defined Networking (SDN).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6184 (10.5 Software-Defined Networking (SDN).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6184",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 2: 10.5 Software-Defined Networking (SDN)",
      "starter_code": "# Implementation for 10.5 Software-Defined Networking (SDN).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6184",
      "video_id": "tg-exact-cn-6184",
      "telegram_file_id": "4990510028084480057",
      "file_name": "10.5 Software-Defined Networking (SDN).mp4",
      "file_type": "mp4",
      "file_size_bytes": 66899148,
      "download_url": "/api/download/-4621115089/6184?file_name=10.5 Software-Defined Networking (SDN).mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (10.5 Software-Defined Networking (SDN).mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6183",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480056",
  "telegram_message_id": 6183,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 3: 10.4 Network Virtualization",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6183 | Size: 53.7 MB]\nFile Name: 10.4 Network Virtualization.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6183 (10.4 Network Virtualization.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6183",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 3: 10.4 Network Virtualization",
      "starter_code": "# Implementation for 10.4 Network Virtualization.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6183",
      "video_id": "tg-exact-cn-6183",
      "telegram_file_id": "4990510028084480056",
      "file_name": "10.4 Network Virtualization.mp4",
      "file_type": "mp4",
      "file_size_bytes": 56308531,
      "download_url": "/api/download/-4621115089/6183?file_name=10.4 Network Virtualization.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (10.4 Network Virtualization.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6182",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480055",
  "telegram_message_id": 6182,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 4: 10_3_Load_Balancing_Techniques,_Content_Delivery_Networks_CDNs",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6182 | Size: 83.0 MB]\nFile Name: 10.3 Load Balancing Techniques, Content Delivery Networks (CDNs).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6182 (10_3_Load_Balancing_Techniques,_Content_Delivery_Networks_CDNs.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6182",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 4: 10_3_Load_Balancing_Techniques,_Content_Delivery_Networks_CDNs",
      "starter_code": "# Implementation for 10_3_Load_Balancing_Techniques,_Content_Delivery_Networks_CDNs.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6182",
      "video_id": "tg-exact-cn-6182",
      "telegram_file_id": "4990510028084480055",
      "file_name": "10_3_Load_Balancing_Techniques,_Content_Delivery_Networks_CDNs.mp4",
      "file_type": "mp4",
      "file_size_bytes": 87031808,
      "download_url": "/api/download/-4621115089/6182?file_name=10_3_Load_Balancing_Techniques,_Content_Delivery_Networks_CDNs.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (10_3_Load_Balancing_Techniques,_Content_Delivery_Networks_CDNs.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6181",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480054",
  "telegram_message_id": 6181,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 5: 10.2 Network Design Principles and Considerations",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6181 | Size: 68.0 MB]\nFile Name: 10.2 Network Design Principles and Considerations.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6181 (10.2 Network Design Principles and Considerations.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6181",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 5: 10.2 Network Design Principles and Considerations",
      "starter_code": "# Implementation for 10.2 Network Design Principles and Considerations.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6181",
      "video_id": "tg-exact-cn-6181",
      "telegram_file_id": "4990510028084480054",
      "file_name": "10.2 Network Design Principles and Considerations.mp4",
      "file_type": "mp4",
      "file_size_bytes": 71303168,
      "download_url": "/api/download/-4621115089/6181?file_name=10.2 Network Design Principles and Considerations.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (10.2 Network Design Principles and Considerations.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6180",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480053",
  "telegram_message_id": 6180,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 6: 10_1_Client_Server_Vs_Peer_to_Peer_Architectures_Advanced_Networking",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6180 | Size: 112.6 MB]\nFile Name: 10.1 Client-Server Vs Peer-to-Peer Architectures (Advanced Networking Concepts).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6180 (10_1_Client_Server_Vs_Peer_to_Peer_Architectures_Advanced_Networking.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6180",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 6: 10_1_Client_Server_Vs_Peer_to_Peer_Architectures_Advanced_Networking",
      "starter_code": "# Implementation for 10_1_Client_Server_Vs_Peer_to_Peer_Architectures_Advanced_Networking.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6180",
      "video_id": "tg-exact-cn-6180",
      "telegram_file_id": "4990510028084480053",
      "file_name": "10_1_Client_Server_Vs_Peer_to_Peer_Architectures_Advanced_Networking.mp4",
      "file_type": "mp4",
      "file_size_bytes": 118069657,
      "download_url": "/api/download/-4621115089/6180?file_name=10_1_Client_Server_Vs_Peer_to_Peer_Architectures_Advanced_Networking.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (10_1_Client_Server_Vs_Peer_to_Peer_Architectures_Advanced_Networking.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6179",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480052",
  "telegram_message_id": 6179,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 7: 9.6 Network Protocol Analysis Tools (Wireshark, tcpdump)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6179 | Size: 69.8 MB]\nFile Name: 9.6 Network Protocol Analysis Tools (Wireshark, tcpdump).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6179 (9.6 Network Protocol Analysis Tools (Wireshark, tcpdump).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6179",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 7: 9.6 Network Protocol Analysis Tools (Wireshark, tcpdump)",
      "starter_code": "# Implementation for 9.6 Network Protocol Analysis Tools (Wireshark, tcpdump).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6179",
      "video_id": "tg-exact-cn-6179",
      "telegram_file_id": "4990510028084480052",
      "file_name": "9.6 Network Protocol Analysis Tools (Wireshark, tcpdump).mp4",
      "file_type": "mp4",
      "file_size_bytes": 73190604,
      "download_url": "/api/download/-4621115089/6179?file_name=9.6 Network Protocol Analysis Tools (Wireshark, tcpdump).mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (9.6 Network Protocol Analysis Tools (Wireshark, tcpdump).mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6178",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480051",
  "telegram_message_id": 6178,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 8: 9.5 Network Monitoring and Management",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6178 | Size: 68.3 MB]\nFile Name: 9.5 Network Monitoring and Management.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6178 (9.5 Network Monitoring and Management.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6178",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 8: 9.5 Network Monitoring and Management",
      "starter_code": "# Implementation for 9.5 Network Monitoring and Management.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6178",
      "video_id": "tg-exact-cn-6178",
      "telegram_file_id": "4990510028084480051",
      "file_name": "9.5 Network Monitoring and Management.mp4",
      "file_type": "mp4",
      "file_size_bytes": 71617740,
      "download_url": "/api/download/-4621115089/6178?file_name=9.5 Network Monitoring and Management.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (9.5 Network Monitoring and Management.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6177",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480050",
  "telegram_message_id": 6177,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 9: 9.4 Network Troubleshooting Techniques",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6177 | Size: 65.9 MB]\nFile Name: 9.4 Network Troubleshooting Techniques.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6177 (9.4 Network Troubleshooting Techniques.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6177",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 9: 9.4 Network Troubleshooting Techniques",
      "starter_code": "# Implementation for 9.4 Network Troubleshooting Techniques.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6177",
      "video_id": "tg-exact-cn-6177",
      "telegram_file_id": "4990510028084480050",
      "file_name": "9.4 Network Troubleshooting Techniques.mp4",
      "file_type": "mp4",
      "file_size_bytes": 69101158,
      "download_url": "/api/download/-4621115089/6177?file_name=9.4 Network Troubleshooting Techniques.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (9.4 Network Troubleshooting Techniques.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6176",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480049",
  "telegram_message_id": 6176,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 10: 9.3 Network Performance Metrics",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6176 | Size: 72.6 MB]\nFile Name: 9.3 Network Performance Metrics.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6176 (9.3 Network Performance Metrics.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6176",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 10: 9.3 Network Performance Metrics",
      "starter_code": "# Implementation for 9.3 Network Performance Metrics.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6176",
      "video_id": "tg-exact-cn-6176",
      "telegram_file_id": "4990510028084480049",
      "file_name": "9.3 Network Performance Metrics.mp4",
      "file_type": "mp4",
      "file_size_bytes": 76126617,
      "download_url": "/api/download/-4621115089/6176?file_name=9.3 Network Performance Metrics.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (9.3 Network Performance Metrics.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6175",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480048",
  "telegram_message_id": 6175,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 11: 9_2_Quality_of_Service_QoS,_Bandwidth_and_Latency,_Network_Congestion",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6175 | Size: 111.0 MB]\nFile Name: 9.2 Quality of Service (QoS), Bandwidth and Latency, Network Congestion and Control Mecha",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6175 (9_2_Quality_of_Service_QoS,_Bandwidth_and_Latency,_Network_Congestion.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6175",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 11: 9_2_Quality_of_Service_QoS,_Bandwidth_and_Latency,_Network_Congestion",
      "starter_code": "# Implementation for 9_2_Quality_of_Service_QoS,_Bandwidth_and_Latency,_Network_Congestion.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6175",
      "video_id": "tg-exact-cn-6175",
      "telegram_file_id": "4990510028084480048",
      "file_name": "9_2_Quality_of_Service_QoS,_Bandwidth_and_Latency,_Network_Congestion.mp4",
      "file_type": "mp4",
      "file_size_bytes": 116391936,
      "download_url": "/api/download/-4621115089/6175?file_name=9_2_Quality_of_Service_QoS,_Bandwidth_and_Latency,_Network_Congestion.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (9_2_Quality_of_Service_QoS,_Bandwidth_and_Latency,_Network_Congestion.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6174",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480047",
  "telegram_message_id": 6174,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 12: 9_1_Traffic_Management_Techniques_Network_Management_and_Monitoring",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6174 | Size: 119.1 MB]\nFile Name: 9.1 Traffic Management Techniques (Network Management and Monitoring).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6174 (9_1_Traffic_Management_Techniques_Network_Management_and_Monitoring.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6174",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 12: 9_1_Traffic_Management_Techniques_Network_Management_and_Monitoring",
      "starter_code": "# Implementation for 9_1_Traffic_Management_Techniques_Network_Management_and_Monitoring.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6174",
      "video_id": "tg-exact-cn-6174",
      "telegram_file_id": "4990510028084480047",
      "file_name": "9_1_Traffic_Management_Techniques_Network_Management_and_Monitoring.mp4",
      "file_type": "mp4",
      "file_size_bytes": 124885401,
      "download_url": "/api/download/-4621115089/6174?file_name=9_1_Traffic_Management_Techniques_Network_Management_and_Monitoring.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (9_1_Traffic_Management_Techniques_Network_Management_and_Monitoring.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6173",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480046",
  "telegram_message_id": 6173,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 13: 8.7 Network Layer and Application Layer Firewalls",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6173 | Size: 93.8 MB]\nFile Name: 8.7 Network Layer and Application Layer Firewalls.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6173 (8.7 Network Layer and Application Layer Firewalls.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6173",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 13: 8.7 Network Layer and Application Layer Firewalls",
      "starter_code": "# Implementation for 8.7 Network Layer and Application Layer Firewalls.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6173",
      "video_id": "tg-exact-cn-6173",
      "telegram_file_id": "4990510028084480046",
      "file_name": "8.7 Network Layer and Application Layer Firewalls.mp4",
      "file_type": "mp4",
      "file_size_bytes": 98356428,
      "download_url": "/api/download/-4621115089/6173?file_name=8.7 Network Layer and Application Layer Firewalls.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (8.7 Network Layer and Application Layer Firewalls.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6172",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480045",
  "telegram_message_id": 6172,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 14: 8.6 Transport Layer Security (TLS) and SSL",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6172 | Size: 94.6 MB]\nFile Name: 8.6 Transport Layer Security (TLS) and SSL.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6172 (8.6 Transport Layer Security (TLS) and SSL.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6172",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 14: 8.6 Transport Layer Security (TLS) and SSL",
      "starter_code": "# Implementation for 8.6 Transport Layer Security (TLS) and SSL.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6172",
      "video_id": "tg-exact-cn-6172",
      "telegram_file_id": "4990510028084480045",
      "file_name": "8.6 Transport Layer Security (TLS) and SSL.mp4",
      "file_type": "mp4",
      "file_size_bytes": 99195289,
      "download_url": "/api/download/-4621115089/6172?file_name=8.6 Transport Layer Security (TLS) and SSL.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (8.6 Transport Layer Security (TLS) and SSL.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6171",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480044",
  "telegram_message_id": 6171,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 15: 8_5_Cryptography_Basics_Symmetric_and_Asymmetric_Encryption",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6171 | Size: 43.7 MB]\nFile Name: 8.5 Cryptography Basics (Symmetric and Asymmetric Encryption).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6171 (8_5_Cryptography_Basics_Symmetric_and_Asymmetric_Encryption.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6171",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 15: 8_5_Cryptography_Basics_Symmetric_and_Asymmetric_Encryption",
      "starter_code": "# Implementation for 8_5_Cryptography_Basics_Symmetric_and_Asymmetric_Encryption.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6171",
      "video_id": "tg-exact-cn-6171",
      "telegram_file_id": "4990510028084480044",
      "file_name": "8_5_Cryptography_Basics_Symmetric_and_Asymmetric_Encryption.mp4",
      "file_type": "mp4",
      "file_size_bytes": 45822771,
      "download_url": "/api/download/-4621115089/6171?file_name=8_5_Cryptography_Basics_Symmetric_and_Asymmetric_Encryption.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (8_5_Cryptography_Basics_Symmetric_and_Asymmetric_Encryption.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6170",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480043",
  "telegram_message_id": 6170,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 16: 8_4_Virtual_Private_Networks_VPNs_and_Public_Key_Infrastructure",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6170 | Size: 74.4 MB]\nFile Name: 8.4 Virtual Private Networks (VPNs) and Public Key Infrastructure (PKI).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6170 (8_4_Virtual_Private_Networks_VPNs_and_Public_Key_Infrastructure.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6170",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 16: 8_4_Virtual_Private_Networks_VPNs_and_Public_Key_Infrastructure",
      "starter_code": "# Implementation for 8_4_Virtual_Private_Networks_VPNs_and_Public_Key_Infrastructure.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6170",
      "video_id": "tg-exact-cn-6170",
      "telegram_file_id": "4990510028084480043",
      "file_name": "8_4_Virtual_Private_Networks_VPNs_and_Public_Key_Infrastructure.mp4",
      "file_type": "mp4",
      "file_size_bytes": 78014054,
      "download_url": "/api/download/-4621115089/6170?file_name=8_4_Virtual_Private_Networks_VPNs_and_Public_Key_Infrastructure.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (8_4_Virtual_Private_Networks_VPNs_and_Public_Key_Infrastructure.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6169",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480042",
  "telegram_message_id": 6169,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 17: 8.3 Intrusion Detection and Prevention Systems",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6169 | Size: 71.5 MB]\nFile Name: 8.3 Intrusion Detection and Prevention Systems.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6169 (8.3 Intrusion Detection and Prevention Systems.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6169",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 17: 8.3 Intrusion Detection and Prevention Systems",
      "starter_code": "# Implementation for 8.3 Intrusion Detection and Prevention Systems.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6169",
      "video_id": "tg-exact-cn-6169",
      "telegram_file_id": "4990510028084480042",
      "file_name": "8.3 Intrusion Detection and Prevention Systems.mp4",
      "file_type": "mp4",
      "file_size_bytes": 74973184,
      "download_url": "/api/download/-4621115089/6169?file_name=8.3 Intrusion Detection and Prevention Systems.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (8.3 Intrusion Detection and Prevention Systems.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6168",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480041",
  "telegram_message_id": 6168,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 18: 8.2 Firewall and their Types",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6168 | Size: 39.8 MB]\nFile Name: 8.2 Firewall and their Types.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6168 (8.2 Firewall and their Types.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6168",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 18: 8.2 Firewall and their Types",
      "starter_code": "# Implementation for 8.2 Firewall and their Types.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6168",
      "video_id": "tg-exact-cn-6168",
      "telegram_file_id": "4990510028084480041",
      "file_name": "8.2 Firewall and their Types.mp4",
      "file_type": "mp4",
      "file_size_bytes": 41733324,
      "download_url": "/api/download/-4621115089/6168?file_name=8.2 Firewall and their Types.mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (8.2 Firewall and their Types.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6167",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480040",
  "telegram_message_id": 6167,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 19: 8.1 Network Security Fundamentals (Network Security)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6167 | Size: 78.2 MB]\nFile Name: 8.1 Network Security Fundamentals (Network Security).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6167 (8.1 Network Security Fundamentals (Network Security).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:05:02+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6167",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 19: 8.1 Network Security Fundamentals (Network Security)",
      "starter_code": "# Implementation for 8.1 Network Security Fundamentals (Network Security).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6167",
      "video_id": "tg-exact-cn-6167",
      "telegram_file_id": "4990510028084480040",
      "file_name": "8.1 Network Security Fundamentals (Network Security).mp4",
      "file_type": "mp4",
      "file_size_bytes": 81998643,
      "download_url": "/api/download/-4621115089/6167?file_name=8.1 Network Security Fundamentals (Network Security).mp4",
      "created_at": "2026-03-04T17:05:02+00:00",
      "caption": "Telegram Study Attachment (8.1 Network Security Fundamentals (Network Security).mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6166",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480039",
  "telegram_message_id": 6166,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 20: 7.3 Data Link Protocols and Spanning tree Protocol",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6166 | Size: 62.8 MB]\nFile Name: 7.3 Data Link Protocols and Spanning tree Protocol.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6166 (7.3 Data Link Protocols and Spanning tree Protocol.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6166",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 20: 7.3 Data Link Protocols and Spanning tree Protocol",
      "starter_code": "# Implementation for 7.3 Data Link Protocols and Spanning tree Protocol.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6166",
      "video_id": "tg-exact-cn-6166",
      "telegram_file_id": "4990510028084480039",
      "file_name": "7.3 Data Link Protocols and Spanning tree Protocol.mp4",
      "file_type": "mp4",
      "file_size_bytes": 65850572,
      "download_url": "/api/download/-4621115089/6166?file_name=7.3 Data Link Protocols and Spanning tree Protocol.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (7.3 Data Link Protocols and Spanning tree Protocol.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6165",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480038",
  "telegram_message_id": 6165,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 21: 7.2 Ethernet Switching and VLANs",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6165 | Size: 46.8 MB]\nFile Name: 7.2 Ethernet Switching and VLANs.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6165 (7.2 Ethernet Switching and VLANs.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6165",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 21: 7.2 Ethernet Switching and VLANs",
      "starter_code": "# Implementation for 7.2 Ethernet Switching and VLANs.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6165",
      "video_id": "tg-exact-cn-6165",
      "telegram_file_id": "4990510028084480038",
      "file_name": "7.2 Ethernet Switching and VLANs.mp4",
      "file_type": "mp4",
      "file_size_bytes": 49073356,
      "download_url": "/api/download/-4621115089/6165?file_name=7.2 Ethernet Switching and VLANs.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (7.2 Ethernet Switching and VLANs.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6164",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480037",
  "telegram_message_id": 6164,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 22: 7_1_Ethernet_Standards_IEEE_802_3_and_Wireless_Networking_IEEE_802",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6164 | Size: 42.0 MB]\nFile Name: 7.1 Ethernet Standards (IEEE 802.3) and Wireless Networking (IEEE 802.11) (Network Techno",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6164 (7_1_Ethernet_Standards_IEEE_802_3_and_Wireless_Networking_IEEE_802.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6164",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 22: 7_1_Ethernet_Standards_IEEE_802_3_and_Wireless_Networking_IEEE_802",
      "starter_code": "# Implementation for 7_1_Ethernet_Standards_IEEE_802_3_and_Wireless_Networking_IEEE_802.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6164",
      "video_id": "tg-exact-cn-6164",
      "telegram_file_id": "4990510028084480037",
      "file_name": "7_1_Ethernet_Standards_IEEE_802_3_and_Wireless_Networking_IEEE_802.mp4",
      "file_type": "mp4",
      "file_size_bytes": 44040192,
      "download_url": "/api/download/-4621115089/6164?file_name=7_1_Ethernet_Standards_IEEE_802_3_and_Wireless_Networking_IEEE_802.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (7_1_Ethernet_Standards_IEEE_802_3_and_Wireless_Networking_IEEE_802.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6163",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480036",
  "telegram_message_id": 6163,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 23: 6.4 Switching Techniques",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6163 | Size: 63.2 MB]\nFile Name: 6.4 Switching Techniques.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6163 (6.4 Switching Techniques.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6163",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 23: 6.4 Switching Techniques",
      "starter_code": "# Implementation for 6.4 Switching Techniques.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6163",
      "video_id": "tg-exact-cn-6163",
      "telegram_file_id": "4990510028084480036",
      "file_name": "6.4 Switching Techniques.mp4",
      "file_type": "mp4",
      "file_size_bytes": 66270003,
      "download_url": "/api/download/-4621115089/6163?file_name=6.4 Switching Techniques.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (6.4 Switching Techniques.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6162",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480035",
  "telegram_message_id": 6162,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 24: 6_3_Border_Gateway_Protocol_BGP,_Interior_Gateway_Protocols_IGRP",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6162 | Size: 74.2 MB]\nFile Name: 6.3 Border Gateway Protocol (BGP), Interior Gateway Protocols (IGRP, EIGRP, OSPF).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6162 (6_3_Border_Gateway_Protocol_BGP,_Interior_Gateway_Protocols_IGRP.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6162",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 24: 6_3_Border_Gateway_Protocol_BGP,_Interior_Gateway_Protocols_IGRP",
      "starter_code": "# Implementation for 6_3_Border_Gateway_Protocol_BGP,_Interior_Gateway_Protocols_IGRP.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6162",
      "video_id": "tg-exact-cn-6162",
      "telegram_file_id": "4990510028084480035",
      "file_name": "6_3_Border_Gateway_Protocol_BGP,_Interior_Gateway_Protocols_IGRP.mp4",
      "file_type": "mp4",
      "file_size_bytes": 77804339,
      "download_url": "/api/download/-4621115089/6162?file_name=6_3_Border_Gateway_Protocol_BGP,_Interior_Gateway_Protocols_IGRP.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (6_3_Border_Gateway_Protocol_BGP,_Interior_Gateway_Protocols_IGRP.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6161",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480034",
  "telegram_message_id": 6161,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 25: 6.2 Distance Vector and Link State Routing Protocols",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6161 | Size: 102.4 MB]\nFile Name: 6.2 Distance Vector and Link State Routing Protocols.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6161 (6.2 Distance Vector and Link State Routing Protocols.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6161",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 25: 6.2 Distance Vector and Link State Routing Protocols",
      "starter_code": "# Implementation for 6.2 Distance Vector and Link State Routing Protocols.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6161",
      "video_id": "tg-exact-cn-6161",
      "telegram_file_id": "4990510028084480034",
      "file_name": "6.2 Distance Vector and Link State Routing Protocols.mp4",
      "file_type": "mp4",
      "file_size_bytes": 107374182,
      "download_url": "/api/download/-4621115089/6161?file_name=6.2 Distance Vector and Link State Routing Protocols.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (6.2 Distance Vector and Link State Routing Protocols.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6160",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480033",
  "telegram_message_id": 6160,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 26: 6.1 Routing Algorithms (Routing and Switching)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6160 | Size: 99.9 MB]\nFile Name: 6.1 Routing Algorithms (Routing and Switching).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6160 (6.1 Routing Algorithms (Routing and Switching).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6160",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 26: 6.1 Routing Algorithms (Routing and Switching)",
      "starter_code": "# Implementation for 6.1 Routing Algorithms (Routing and Switching).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6160",
      "video_id": "tg-exact-cn-6160",
      "telegram_file_id": "4990510028084480033",
      "file_name": "6.1 Routing Algorithms (Routing and Switching).mp4",
      "file_type": "mp4",
      "file_size_bytes": 104752742,
      "download_url": "/api/download/-4621115089/6160?file_name=6.1 Routing Algorithms (Routing and Switching).mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (6.1 Routing Algorithms (Routing and Switching).mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6159",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480032",
  "telegram_message_id": 6159,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 27: 5_3_Network_Address_Translation_NAT,_Dynamic_Host_Configuration",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6159 | Size: 74.5 MB]\nFile Name: 5.3 Network Address Translation (NAT), Dynamic Host Configuration Protocol (DHCP), Domain",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6159 (5_3_Network_Address_Translation_NAT,_Dynamic_Host_Configuration.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6159",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 27: 5_3_Network_Address_Translation_NAT,_Dynamic_Host_Configuration",
      "starter_code": "# Implementation for 5_3_Network_Address_Translation_NAT,_Dynamic_Host_Configuration.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6159",
      "video_id": "tg-exact-cn-6159",
      "telegram_file_id": "4990510028084480032",
      "file_name": "5_3_Network_Address_Translation_NAT,_Dynamic_Host_Configuration.mp4",
      "file_type": "mp4",
      "file_size_bytes": 78118912,
      "download_url": "/api/download/-4621115089/6159?file_name=5_3_Network_Address_Translation_NAT,_Dynamic_Host_Configuration.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (5_3_Network_Address_Translation_NAT,_Dynamic_Host_Configuration.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6158",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480031",
  "telegram_message_id": 6158,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 28: 5_2_Subnetting,_Supernetting_and_Classful_vs_Classless_Addressing",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6158 | Size: 89.6 MB]\nFile Name: 5.2 Subnetting, Supernetting and Classful vs Classless Addressing.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6158 (5_2_Subnetting,_Supernetting_and_Classful_vs_Classless_Addressing.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6158",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 28: 5_2_Subnetting,_Supernetting_and_Classful_vs_Classless_Addressing",
      "starter_code": "# Implementation for 5_2_Subnetting,_Supernetting_and_Classful_vs_Classless_Addressing.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6158",
      "video_id": "tg-exact-cn-6158",
      "telegram_file_id": "4990510028084480031",
      "file_name": "5_2_Subnetting,_Supernetting_and_Classful_vs_Classless_Addressing.mp4",
      "file_type": "mp4",
      "file_size_bytes": 93952409,
      "download_url": "/api/download/-4621115089/6158?file_name=5_2_Subnetting,_Supernetting_and_Classful_vs_Classless_Addressing.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (5_2_Subnetting,_Supernetting_and_Classful_vs_Classless_Addressing.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6157",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480030",
  "telegram_message_id": 6157,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 29: 5_1_IP_Addressing_IPv4_and_IPv6_IP_Addressing_and_Subnetting",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6157 | Size: 46.1 MB]\nFile Name: 5.1 IP Addressing (IPv4 and IPv6) IP Addressing and Subnetting).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6157 (5_1_IP_Addressing_IPv4_and_IPv6_IP_Addressing_and_Subnetting.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6157",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 29: 5_1_IP_Addressing_IPv4_and_IPv6_IP_Addressing_and_Subnetting",
      "starter_code": "# Implementation for 5_1_IP_Addressing_IPv4_and_IPv6_IP_Addressing_and_Subnetting.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6157",
      "video_id": "tg-exact-cn-6157",
      "telegram_file_id": "4990510028084480030",
      "file_name": "5_1_IP_Addressing_IPv4_and_IPv6_IP_Addressing_and_Subnetting.mp4",
      "file_type": "mp4",
      "file_size_bytes": 48339353,
      "download_url": "/api/download/-4621115089/6157?file_name=5_1_IP_Addressing_IPv4_and_IPv6_IP_Addressing_and_Subnetting.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (5_1_IP_Addressing_IPv4_and_IPv6_IP_Addressing_and_Subnetting.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6156",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480029",
  "telegram_message_id": 6156,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 30: 4_3_Layer_Functions,_Protocols_and_Connectionless_vs_Connection",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6156 | Size: 50.1 MB]\nFile Name: 4.3 Layer Functions, Protocols and Connectionless vs Connection-Oriented Protocols.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6156 (4_3_Layer_Functions,_Protocols_and_Connectionless_vs_Connection.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6156",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 30: 4_3_Layer_Functions,_Protocols_and_Connectionless_vs_Connection",
      "starter_code": "# Implementation for 4_3_Layer_Functions,_Protocols_and_Connectionless_vs_Connection.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6156",
      "video_id": "tg-exact-cn-6156",
      "telegram_file_id": "4990510028084480029",
      "file_name": "4_3_Layer_Functions,_Protocols_and_Connectionless_vs_Connection.mp4",
      "file_type": "mp4",
      "file_size_bytes": 52533657,
      "download_url": "/api/download/-4621115089/6156?file_name=4_3_Layer_Functions,_Protocols_and_Connectionless_vs_Connection.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (4_3_Layer_Functions,_Protocols_and_Connectionless_vs_Connection.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6155",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480028",
  "telegram_message_id": 6155,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 31: 4.2 Application Layer Protocols (HTTP, FTP, SMTP, SNMP)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6155 | Size: 57.2 MB]\nFile Name: 4.2 Application Layer Protocols (HTTP, FTP, SMTP, SNMP).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6155 (4.2 Application Layer Protocols (HTTP, FTP, SMTP, SNMP).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6155",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 31: 4.2 Application Layer Protocols (HTTP, FTP, SMTP, SNMP)",
      "starter_code": "# Implementation for 4.2 Application Layer Protocols (HTTP, FTP, SMTP, SNMP).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6155",
      "video_id": "tg-exact-cn-6155",
      "telegram_file_id": "4990510028084480028",
      "file_name": "4.2 Application Layer Protocols (HTTP, FTP, SMTP, SNMP).mp4",
      "file_type": "mp4",
      "file_size_bytes": 59978547,
      "download_url": "/api/download/-4621115089/6155?file_name=4.2 Application Layer Protocols (HTTP, FTP, SMTP, SNMP).mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (4.2 Application Layer Protocols (HTTP, FTP, SMTP, SNMP).mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6154",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480026",
  "telegram_message_id": 6154,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 32: 4.1 Network Protocols (Network Protocols and Communication)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6154 | Size: 70.6 MB]\nFile Name: 4.1 Network Protocols (Network Protocols and Communication).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6154 (4.1 Network Protocols (Network Protocols and Communication).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6154",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 32: 4.1 Network Protocols (Network Protocols and Communication)",
      "starter_code": "# Implementation for 4.1 Network Protocols (Network Protocols and Communication).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6154",
      "video_id": "tg-exact-cn-6154",
      "telegram_file_id": "4990510028084480026",
      "file_name": "4.1 Network Protocols (Network Protocols and Communication).mp4",
      "file_type": "mp4",
      "file_size_bytes": 74029465,
      "download_url": "/api/download/-4621115089/6154?file_name=4.1 Network Protocols (Network Protocols and Communication).mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (4.1 Network Protocols (Network Protocols and Communication).mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6153",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480025",
  "telegram_message_id": 6153,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 33: 3.3 Ethernet Frame Structure + ARP + NAC",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6153 | Size: 81.8 MB]\nFile Name: 3.3 Ethernet Frame Structure + ARP + NAC.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6153 (3.3 Ethernet Frame Structure + ARP + NAC.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6153",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 33: 3.3 Ethernet Frame Structure + ARP + NAC",
      "starter_code": "# Implementation for 3.3 Ethernet Frame Structure + ARP + NAC.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6153",
      "video_id": "tg-exact-cn-6153",
      "telegram_file_id": "4990510028084480025",
      "file_name": "3.3 Ethernet Frame Structure + ARP + NAC.mp4",
      "file_type": "mp4",
      "file_size_bytes": 85773516,
      "download_url": "/api/download/-4621115089/6153?file_name=3.3 Ethernet Frame Structure + ARP + NAC.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (3.3 Ethernet Frame Structure + ARP + NAC.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6152",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480024",
  "telegram_message_id": 6152,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 34: 3.2 Network Devices",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6152 | Size: 50.7 MB]\nFile Name: 3.2 Network Devices.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6152 (3.2 Network Devices.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6152",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 34: 3.2 Network Devices",
      "starter_code": "# Implementation for 3.2 Network Devices.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6152",
      "video_id": "tg-exact-cn-6152",
      "telegram_file_id": "4990510028084480024",
      "file_name": "3.2 Network Devices.mp4",
      "file_type": "mp4",
      "file_size_bytes": 53162803,
      "download_url": "/api/download/-4621115089/6152?file_name=3.2 Network Devices.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (3.2 Network Devices.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6151",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480023",
  "telegram_message_id": 6151,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 35: 3_1_Network_Cabling_and_Connectors_Networking_Fundamentals_and_Basics",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6151 | Size: 70.8 MB]\nFile Name: 3.1 Network Cabling and Connectors (Networking Fundamentals and Basics).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6151 (3_1_Network_Cabling_and_Connectors_Networking_Fundamentals_and_Basics.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6151",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 35: 3_1_Network_Cabling_and_Connectors_Networking_Fundamentals_and_Basics",
      "starter_code": "# Implementation for 3_1_Network_Cabling_and_Connectors_Networking_Fundamentals_and_Basics.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6151",
      "video_id": "tg-exact-cn-6151",
      "telegram_file_id": "4990510028084480023",
      "file_name": "3_1_Network_Cabling_and_Connectors_Networking_Fundamentals_and_Basics.mp4",
      "file_type": "mp4",
      "file_size_bytes": 74239180,
      "download_url": "/api/download/-4621115089/6151?file_name=3_1_Network_Cabling_and_Connectors_Networking_Fundamentals_and_Basics.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (3_1_Network_Cabling_and_Connectors_Networking_Fundamentals_and_Basics.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6150",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480022",
  "telegram_message_id": 6150,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 36: 2.2 TCP and IP Model and Its Layers + Comparison",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6150 | Size: 60.5 MB]\nFile Name: 2.2 TCP and IP Model and Its Layers + Comparison.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6150 (2.2 TCP and IP Model and Its Layers + Comparison.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/bunny/movie.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6150",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 36: 2.2 TCP and IP Model and Its Layers + Comparison",
      "starter_code": "# Implementation for 2.2 TCP and IP Model and Its Layers + Comparison.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6150",
      "video_id": "tg-exact-cn-6150",
      "telegram_file_id": "4990510028084480022",
      "file_name": "2.2 TCP and IP Model and Its Layers + Comparison.mp4",
      "file_type": "mp4",
      "file_size_bytes": 63438848,
      "download_url": "/api/download/-4621115089/6150?file_name=2.2 TCP and IP Model and Its Layers + Comparison.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (2.2 TCP and IP Model and Its Layers + Comparison.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6149",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480021",
  "telegram_message_id": 6149,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 37: 2.1 OSI Model and Layers (Networking Models)",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6149 | Size: 135.1 MB]\nFile Name: 2.1 OSI Model and Layers (Networking Models).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6149 (2.1 OSI Model and Layers (Networking Models).mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6149",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 37: 2.1 OSI Model and Layers (Networking Models)",
      "starter_code": "# Implementation for 2.1 OSI Model and Layers (Networking Models).mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6149",
      "video_id": "tg-exact-cn-6149",
      "telegram_file_id": "4990510028084480021",
      "file_name": "2.1 OSI Model and Layers (Networking Models).mp4",
      "file_type": "mp4",
      "file_size_bytes": 141662617,
      "download_url": "/api/download/-4621115089/6149?file_name=2.1 OSI Model and Layers (Networking Models).mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (2.1 OSI Model and Layers (Networking Models).mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6148",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480020",
  "telegram_message_id": 6148,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 38: 1.3 Network and Logical Topologies",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6148 | Size: 103.5 MB]\nFile Name: 1.3 Network and Logical Topologies.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6148 (1.3 Network and Logical Topologies.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://media.w3.org/2010/05/video/movie_300.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6148",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 38: 1.3 Network and Logical Topologies",
      "starter_code": "# Implementation for 1.3 Network and Logical Topologies.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6148",
      "video_id": "tg-exact-cn-6148",
      "telegram_file_id": "4990510028084480020",
      "file_name": "1.3 Network and Logical Topologies.mp4",
      "file_type": "mp4",
      "file_size_bytes": 108527616,
      "download_url": "/api/download/-4621115089/6148?file_name=1.3 Network and Logical Topologies.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (1.3 Network and Logical Topologies.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6147",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480019",
  "telegram_message_id": 6147,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 39: 1.2 Types of Networks and Interconnected Net",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6147 | Size: 71.9 MB]\nFile Name: 1.2 Types of Networks and Interconnected Net.mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6147 (1.2 Types of Networks and Interconnected Net.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6147",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 39: 1.2 Types of Networks and Interconnected Net",
      "starter_code": "# Implementation for 1.2 Types of Networks and Interconnected Net.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6147",
      "video_id": "tg-exact-cn-6147",
      "telegram_file_id": "4990510028084480019",
      "file_name": "1.2 Types of Networks and Interconnected Net.mp4",
      "file_type": "mp4",
      "file_size_bytes": 75392614,
      "download_url": "/api/download/-4621115089/6147?file_name=1.2 Types of Networks and Interconnected Net.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (1.2 Types of Networks and Interconnected Net.mp4)"
    }
  ]
},
{
  "id": "tg-exact-cn-6146",
  "channel_id": "ch-cn-04",
  "telegram_file_id": "4990510028084480018",
  "telegram_message_id": 6146,
  "sender_username": "@Striver_CN_Bot",
  "title": "Computer Networks Lecture 40: 1_1_Introduction_to_Computer_Networks_Introduction_to_Computer_Networks",
  "telegram_caption": "\ud83d\udccc [Telegram Channel Post #6146 | Size: 85.1 MB]\nFile Name: 1.1 Introduction to Computer Networks (Introduction to Computer Networks).mp4",
  "duration_seconds": 1200,
  "transcript": "Ingested from Telegram Channel Post #6146 (1_1_Introduction_to_Computer_Networks_Introduction_to_Computer_Networks.mp4). Video stream powered by Telethon MTProto Proxy.",
  "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
  "stream_url": "https://www.w3schools.com/html/mov_bbb.mp4",
  "created_at": "2026-03-04T17:05:01+00:00",
  "quiz_json": [
    {
      "id": "q-exact-cn-6146",
      "type": "CODING",
      "question": "Implement solution for Computer Networks Lecture 40: 1_1_Introduction_to_Computer_Networks_Introduction_to_Computer_Networks",
      "starter_code": "# Implementation for 1_1_Introduction_to_Computer_Networks_Introduction_to_Computer_Networks.mp4\ndef solve():\n    pass\n",
      "solution_code": "def solve():\n    return True\n",
      "difficulty": "Medium"
    }
  ],
  "attachments": [
    {
      "id": "att-exact-cn-6146",
      "video_id": "tg-exact-cn-6146",
      "telegram_file_id": "4990510028084480018",
      "file_name": "1_1_Introduction_to_Computer_Networks_Introduction_to_Computer_Networks.mp4",
      "file_type": "mp4",
      "file_size_bytes": 89233817,
      "download_url": "/api/download/-4621115089/6146?file_name=1_1_Introduction_to_Computer_Networks_Introduction_to_Computer_Networks.mp4",
      "created_at": "2026-03-04T17:05:01+00:00",
      "caption": "Telegram Study Attachment (1_1_Introduction_to_Computer_Networks_Introduction_to_Computer_Networks.mp4)"
    }
  ]
}
];
