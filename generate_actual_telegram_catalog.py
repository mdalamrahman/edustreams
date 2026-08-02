import json

with open("all_user_telegram_videos.json", "r", encoding="utf-8") as f:
    all_videos = json.load(f)

# Group by category
dsa_vids = []
sd_vids = []
dbms_vids = []
cn_vids = []

for v in all_videos:
    name = (v.get("chat_name") or "").lower()
    file_name = (v.get("file_name") or "").lower()
    caption = (v.get("caption") or "").lower()

    if "striver dsa" in name or ("dsa" in name and "striver" in caption):
        dsa_vids.append(v)
    elif "striver lld" in name or "system design" in name or "striver : system design" in name:
        sd_vids.append(v)
    elif "striver dbms" in name or ("dbms" in name and "striver" in caption):
        dbms_vids.append(v)
    elif "striver cn" in name or ("cn" in name and "striver" in caption) or "computer networks" in name:
        cn_vids.append(v)

print(f"Discovered Real Telegram Videos:")
print(f"  - DSA: {len(dsa_vids)} real Telegram lecture videos")
print(f"  - System Design: {len(sd_vids)} real Telegram lecture videos")
print(f"  - DBMS: {len(dbms_vids)} real Telegram lecture videos")
print(f"  - Computer Networks: {len(cn_vids)} real Telegram lecture videos")

def clean_title(v, idx, cat):
    file_name = v.get("file_name") or f"{cat} Lecture {idx}"
    title = file_name.rsplit('.', 1)[0]
    return f"{cat} Lecture {idx}: {title}"

def build_video_obj(v, idx, cat_code, channel_id, cat_name):
    title = clean_title(v, idx, cat_name)
    file_name = v.get("file_name") or "lecture_video.mp4"
    msg_id = v.get("msg_id")
    chat_id = v.get("chat_id")
    size_mb = v.get("size_mb", 0)
    duration = int(v.get("duration", 1200) or 1200)
    if duration == 0: duration = 1500
    caption_raw = v.get("caption") or f"Telegram Channel Post #{msg_id} ({file_name})"
    caption_formatted = f"📌 [Telegram Channel Post #{msg_id} | Size: {size_mb} MB]\n{caption_raw}"

    video_dict = {
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
        "stream_url": f"http://localhost:7860/stream/{chat_id}/{msg_id}",
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
                "download_url": f"http://localhost:7860/api/download/{chat_id}/{msg_id}?file_name={file_name}",
                "created_at": v.get("date", "2026-03-04T12:00:00Z"),
                "caption": f"Telegram File Download ({file_name})"
            }
        ]
    }
    return json.dumps(video_dict, indent=2)

ts_videos = []
for i, v in enumerate(dsa_vids, 1):
    ts_videos.append(build_video_obj(v, i, "dsa", "ch-dsa-01", "DSA"))

for i, v in enumerate(sd_vids, 1):
    ts_videos.append(build_video_obj(v, i, "sd", "ch-sd-02", "System Design"))

for i, v in enumerate(dbms_vids, 1):
    ts_videos.append(build_video_obj(v, i, "dbms", "ch-dbms-03", "DBMS"))

for i, v in enumerate(cn_vids, 1):
    ts_videos.append(build_video_obj(v, i, "cn", "ch-cn-04", "Computer Networks"))

dsa_chat_id = dsa_vids[0]["chat_id"] if dsa_vids else -1004390749731
sd_chat_id = sd_vids[0]["chat_id"] if sd_vids else -1004329144420
dbms_chat_id = dbms_vids[0]["chat_id"] if dbms_vids else -1004332462419
cn_chat_id = cn_vids[0]["chat_id"] if cn_vids else -1004308430774

ts_content = f"""import {{ createClient }} from '@supabase/supabase-js';
import {{ Channel, Video }} from './types';

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-b4G7T-uPojtUC3nDGD_JQ_xR2UzNO3';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://edustream-demo.supabase.co';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const MOCK_CHANNELS: Channel[] = [
  {{
    id: 'ch-dsa-01',
    telegram_channel_id: {dsa_chat_id},
    category_name: 'DSA',
    description: 'Striver DSA Sheet, LeetCode Patterns, Dynamic Programming, Graphs & Trees ({len(dsa_vids)} Real Telegram Videos)',
    icon: 'code-2',
    created_at: new Date().toISOString(),
    post_count: {len(dsa_vids)}
  }},
  {{
    id: 'ch-sd-02',
    telegram_channel_id: {sd_chat_id},
    category_name: 'System Design',
    description: 'STRIVER LLD: Low Level Design, Microservices, Caching & Distributed Consensus ({len(sd_vids)} Real Telegram Videos)',
    icon: 'cpu',
    created_at: new Date().toISOString(),
    post_count: {len(sd_vids)}
  }},
  {{
    id: 'ch-dbms-03',
    telegram_channel_id: {dbms_chat_id},
    category_name: 'DBMS',
    description: 'Striver DBMS: Relational Algebra, B+ Trees, SQL Optimization & MVCC Locks ({len(dbms_vids)} Real Telegram Videos)',
    icon: 'database',
    created_at: new Date().toISOString(),
    post_count: {len(dbms_vids)}
  }},
  {{
    id: 'ch-cn-04',
    telegram_channel_id: {cn_chat_id},
    category_name: 'Computer Networks',
    description: 'Striver CN: TCP/IP Stack, Subnetting, Socket Programming & HTTP/3 Traces ({len(cn_vids)} Real Telegram Videos)',
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

print(f"\n[SUCCESS] Generated src/lib/supabase.ts with {len(ts_videos)} REAL Telegram Channel Videos!")
