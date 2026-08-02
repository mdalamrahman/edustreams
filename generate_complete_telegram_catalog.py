import json

with open("all_striver_videos_complete.json", "r", encoding="utf-8") as f:
    all_videos_by_cat = json.load(f)

dsa_vids = all_videos_by_cat.get("DSA", [])
sd_vids = all_videos_by_cat.get("System Design", [])
dbms_vids = all_videos_by_cat.get("DBMS", [])
cn_vids = all_videos_by_cat.get("Computer Networks", [])

print(f"Generating full catalog with {len(dsa_vids)} DSA, {len(sd_vids)} System Design, {len(dbms_vids)} DBMS, {len(cn_vids)} CN videos...")

def clean_title(v, idx, cat):
    file_name = v.get("file_name") or f"{cat} Lecture {idx}"
    title = file_name.rsplit('.', 1)[0]
    return f"{cat} Lecture {idx}: {title}"

def build_video_dict(v, idx, cat_code, channel_id, cat_name):
    title = clean_title(v, idx, cat_name)
    file_name = v.get("file_name") or "lecture_video.mp4"
    msg_id = v.get("msg_id")
    chat_id = v.get("chat_id")
    size_mb = v.get("size_mb", 0)
    duration = int(v.get("duration", 1200) or 1200)
    if duration == 0: duration = 1500
    caption_raw = v.get("caption") or f"Telegram Channel Post #{msg_id} ({file_name})"
    caption_formatted = f"📌 [Telegram Channel Post #{msg_id} | Size: {size_mb} MB]\n{caption_raw}"

    # Protocol-agnostic relative HTTPS stream URL for Vercel + Local compatibility
    stream_url = f"/api/stream/{chat_id}/{msg_id}"
    download_url = f"/api/download/{chat_id}/{msg_id}?file_name={file_name}"

    return {
        "id": f"tg-real-{cat_code}-{idx}",
        "channel_id": channel_id,
        "telegram_file_id": str(v.get("file_id")),
        "telegram_message_id": msg_id,
        "sender_username": f"@Striver_{cat_code.upper()}_Bot",
        "title": title,
        "telegram_caption": caption_formatted,
        "duration_seconds": duration,
        "transcript": f"Ingested from Telegram MTProto Post #{msg_id} ({file_name}). Real video stream powered by Telethon MTProto Proxy.",
        "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
        "stream_url": stream_url,
        "created_at": v.get("date", "2026-03-04T12:00:00Z"),
        "quiz_json": [
            {
                "id": f"q-real-{cat_code}-{idx}",
                "type": "CODING",
                "question": f"Implement solution for {title}",
                "starter_code": f"# Implement solution for {file_name}\ndef solution():\n    pass\n",
                "solution_code": "def solution():\n    return True\n",
                "difficulty": "Medium"
            }
        ],
        "attachments": [
            {
                "id": f"att-real-{cat_code}-{idx}",
                "video_id": f"tg-real-{cat_code}-{idx}",
                "telegram_file_id": str(v.get("file_id")),
                "file_name": file_name,
                "file_type": "mp4",
                "file_size_bytes": int(size_mb * 1024 * 1024),
                "download_url": download_url,
                "created_at": v.get("date", "2026-03-04T12:00:00Z"),
                "caption": f"Telegram File Download ({file_name})"
            }
        ]
    }

ts_videos = []
for i, v in enumerate(dsa_vids, 1):
    ts_videos.append(json.dumps(build_video_dict(v, i, "dsa", "ch-dsa-01", "DSA"), indent=2))

for i, v in enumerate(sd_vids, 1):
    ts_videos.append(json.dumps(build_video_dict(v, i, "sd", "ch-sd-02", "System Design"), indent=2))

for i, v in enumerate(dbms_vids, 1):
    ts_videos.append(json.dumps(build_video_dict(v, i, "dbms", "ch-dbms-03", "DBMS"), indent=2))

for i, v in enumerate(cn_vids, 1):
    ts_videos.append(json.dumps(build_video_dict(v, i, "cn", "ch-cn-04", "Computer Networks"), indent=2))

ts_content = f"""import {{ createClient }} from '@supabase/supabase-js';
import {{ Channel, Video }} from './types';

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-b4G7T-uPojtUC3nDGD_JQ_xR2UzNO3';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://edustream-demo.supabase.co';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const MOCK_CHANNELS: Channel[] = [
  {{
    id: 'ch-dsa-01',
    telegram_channel_id: -5475342376,
    category_name: 'DSA',
    description: 'Striver DSA Sheet, LeetCode Patterns, Dynamic Programming, Graphs & Trees ({len(dsa_vids)} Ingested Real Telegram Videos)',
    icon: 'code-2',
    created_at: new Date().toISOString(),
    post_count: {len(dsa_vids)}
  }},
  {{
    id: 'ch-sd-02',
    telegram_channel_id: -5233650498,
    category_name: 'System Design',
    description: 'STRIVER LLD: Low Level Design, Microservices, Caching & Distributed Consensus ({len(sd_vids)} Ingested Real Telegram Videos)',
    icon: 'cpu',
    created_at: new Date().toISOString(),
    post_count: {len(sd_vids)}
  }},
  {{
    id: 'ch-dbms-03',
    telegram_channel_id: -5139397617,
    category_name: 'DBMS',
    description: 'Striver DBMS: Relational Algebra, B+ Trees, SQL Optimization & MVCC Locks ({len(dbms_vids)} Ingested Real Telegram Videos)',
    icon: 'database',
    created_at: new Date().toISOString(),
    post_count: {len(dbms_vids)}
  }},
  {{
    id: 'ch-cn-04',
    telegram_channel_id: -4621115089,
    category_name: 'Computer Networks',
    description: 'Striver CN: TCP/IP Stack, Subnetting, Socket Programming & HTTP/3 Traces ({len(cn_vids)} Ingested Real Telegram Videos)',
    icon: 'network',
    created_at: new Date().toISOString(),
    post_count: {len(cn_vids)}
  }}
];

export const MOCK_VIDEOS: Video[] = [
{',\n'.join(ts_videos)}
];
"""

with open("src/lib/supabase.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"\n[SUCCESS] Generated src/lib/supabase.ts with {len(ts_videos)} COMPLETE Real Telegram Videos!")
