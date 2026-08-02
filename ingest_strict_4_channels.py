import sys
import json
import asyncio

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Strictly 4 Telegram Channels from .env
STRICT_CHANNELS = [
    {"category": "DSA", "id": -1004390749731, "code": "dsa", "channel_uuid_id": "ch-dsa-01", "name": "Striver DSA"},
    {"category": "System Design", "id": -1004329144420, "code": "sd", "channel_uuid_id": "ch-sd-02", "name": "STRIVER LLD"},
    {"category": "DBMS", "id": -1004332462419, "code": "dbms", "channel_uuid_id": "ch-dbms-03", "name": "Striver DBMS"},
    {"category": "Computer Networks", "id": -1004308430774, "code": "cn", "channel_uuid_id": "ch-cn-04", "name": "Striver CN"},
]

def main():
    print("=== Generating Catalog STRICTLY for the 4 Telegram Channels in .env ===")
    
    ts_videos = []

    # Sample lecture templates mapped strictly to the 4 channel IDs in .env
    dsa_topics = [
        "0/1 Knapsack & Dynamic Programming Space Optimization",
        "Graph Traversal — BFS vs DFS Algorithms",
        "Binary Search on Answer Space & Range Bounds",
        "Dijkstra Shortest Path & Min-Heap PriorityQueue",
        "Disjoint Set Union (DSU) & Kruskal MST",
        "Sliding Window & Two Pointer Patterns",
        "Trie Data Structure & Autocomplete Systems",
        "Segment Trees & Range Query Optimization",
        "Topological Sort & Kahn Algorithm (DAG)",
        "Longest Common Subsequence (LCS) & String DP",
        "Fenwick Tree (Binary Indexed Tree / BIT)",
        "Tarjan Strongly Connected Components (SCC)"
    ]

    sd_topics = [
        "Distributed Caching & Consistent Hashing Ring",
        "SOLID Principles & Factory Design Pattern",
        "Rate Limiter — Token Bucket & Leaky Bucket",
        "Uber Ride-Sharing Matching Engine & Geo-Indexing",
        "URL Shortener — TinyURL System Design",
        "WhatsApp Chat System — Message Queue Architecture",
        "YouTube Video Streaming & Transcoding Pipeline",
        "Distributed Unique ID Generator (Snowflake)",
        "Notification Service — Push/Email/SMS Dispatcher",
        "Distributed Key-Value Store — Raft Consensus"
    ]

    dbms_topics = [
        "ACID Isolation Levels & PostgreSQL Locks",
        "B+ Tree Indexing & Query Execution Plans",
        "Write-Ahead Logging (WAL) & Crash Recovery",
        "Database Sharding & Two-Phase Commit (2PC)",
        "Normalization (1NF to BCNF) & Denormalization",
        "SQL Window Functions & CTE Recursive Queries",
        "Query Optimizer Cost Estimation & Join Trees",
        "Deadlock Detection & Prevention (Wait-For Graph)",
        "Database Partitioning — Range vs Hash vs List",
        "NoSQL Architectures — DynamoDB vs MongoDB"
    ]

    cn_topics = [
        "TCP 3-Way Handshake & Wireshark Traces",
        "IPv4 CIDR Subnetting & Routing Algorithms",
        "HTTP/1.1 vs HTTP/2 vs HTTP/3 QUIC Protocol",
        "DNS Resolution & Root Nameservers",
        "OSI 7-Layer Model & Protocol Data Units",
        "Socket Programming — TCP Client/Server in Python",
        "TLS 1.3 Handshake & Asymmetric Encryption",
        "BGP Border Gateway Protocol & Autonomous Systems",
        "Network Address Translation (NAT) & UPnP",
        "Congestion Control Algorithms — Cubic vs BBR"
    ]

    topic_map = {
        "DSA": dsa_topics,
        "System Design": sd_topics,
        "DBMS": dbms_topics,
        "Computer Networks": cn_topics
    }

    for ch in STRICT_CHANNELS:
        cat_name = ch["category"]
        cat_code = ch["code"]
        channel_id = ch["channel_uuid_id"]
        tg_id = ch["id"]
        topics = topic_map[cat_name]

        for idx, topic in enumerate(topics, 1):
            msg_id = 1000 + idx * 4
            vid_obj = {
                "id": f"tg-{cat_code}-{msg_id}",
                "channel_id": channel_id,
                "telegram_file_id": f"tg_file_{cat_code}_{msg_id}",
                "telegram_message_id": msg_id,
                "sender_username": f"@{ch['name'].replace(' ', '_')}_Bot",
                "title": f"{cat_name} Lecture {idx}: {topic}",
                "telegram_caption": f"📌 [{ch['name']} Post #{msg_id}]\nComplete lecture recording on {topic}. Download attached PDF notes and starter code.",
                "duration_seconds": 1200 + idx * 40,
                "transcript": f"Ingested from Telegram Channel Post #{msg_id} in group {ch['name']} ({tg_id}). Stream powered by Telethon MTProto Proxy.",
                "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
                "stream_url": f"/api/stream/{tg_id}/{msg_id}",
                "created_at": f"2026-03-04T12:{idx:02d}:00Z",
                "quiz_json": [
                    {
                        "id": f"q-{cat_code}-{msg_id}",
                        "type": "CODING",
                        "question": f"Implement solution for {topic}",
                        "starter_code": f"# Implementation for {topic}\ndef solve():\n    pass\n",
                        "solution_code": "def solve():\n    return True\n",
                        "difficulty": "Medium"
                    }
                ],
                "attachments": [
                    {
                        "id": f"att-{cat_code}-{msg_id}",
                        "video_id": f"tg-{cat_code}-{msg_id}",
                        "telegram_file_id": f"doc_{cat_code}_{msg_id}",
                        "file_name": f"{topic.replace(' ', '_')}_Notes.pdf",
                        "file_type": "pdf",
                        "file_size_bytes": 3500000 + idx * 100000,
                        "download_url": f"/api/download/{tg_id}/{msg_id}?file_name={topic.replace(' ', '_')}_Notes.pdf",
                        "created_at": f"2026-03-04T12:{idx:02d}:00Z",
                        "caption": f"Attached Study Resource ({topic} PDF)"
                    }
                ]
            }
            ts_videos.append(json.dumps(vid_obj, indent=2))

    ts_content = f"""import {{ createClient }} from '@supabase/supabase-js';
import {{ Channel, Video }} from './types';

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-b4G7T-uPojtUC3nDGD_JQ_xR2UzNO3';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://edustream-demo.supabase.co';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const MOCK_CHANNELS: Channel[] = [
  {{
    id: 'ch-dsa-01',
    telegram_channel_id: -1004390749731,
    category_name: 'DSA',
    description: 'Striver DSA Sheet, LeetCode Patterns, Dynamic Programming, Graphs & Trees (12 Ingested Videos)',
    icon: 'code-2',
    created_at: new Date().toISOString(),
    post_count: 12
  }},
  {{
    id: 'ch-sd-02',
    telegram_channel_id: -1004329144420,
    category_name: 'System Design',
    description: 'STRIVER LLD: Low Level Design, Microservices, Caching & Distributed Consensus (10 Ingested Videos)',
    icon: 'cpu',
    created_at: new Date().toISOString(),
    post_count: 10
  }},
  {{
    id: 'ch-dbms-03',
    telegram_channel_id: -1004332462419,
    category_name: 'DBMS',
    description: 'Striver DBMS: Relational Algebra, B+ Trees, SQL Optimization & MVCC Locks (10 Ingested Videos)',
    icon: 'database',
    created_at: new Date().toISOString(),
    post_count: 10
  }},
  {{
    id: 'ch-cn-04',
    telegram_channel_id: -1004308430774,
    category_name: 'Computer Networks',
    description: 'Striver CN: TCP/IP Stack, Subnetting, Socket Programming & HTTP/3 Traces (10 Ingested Videos)',
    icon: 'network',
    created_at: new Date().toISOString(),
    post_count: 10
  }}
];

export const MOCK_VIDEOS: Video[] = [
{',\n'.join(ts_videos)}
];
"""

    with open("src/lib/supabase.ts", "w", encoding="utf-8") as f:
        f.write(ts_content)

    print(f"\n[SUCCESS] Generated src/lib/supabase.ts STRICTLY mapped to the 4 .env Telegram channels!")

if __name__ == "__main__":
    main()
