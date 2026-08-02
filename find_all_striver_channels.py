import sys
import json
from collections import defaultdict

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open("all_user_telegram_videos.json", "r", encoding="utf-8") as f:
    vids = json.load(f)

by_chat = defaultdict(list)
for v in vids:
    name = v.get("chat_name") or "Unnamed"
    by_chat[name].append(v)

print("=== ALL CHANNELS & VIDEO COUNTS ON YOUR ACCOUNT ===")
for chat_name, items in sorted(by_chat.items(), key=lambda x: len(x[1]), reverse=True):
    if any(k in chat_name.lower() for k in ["striver", "dsa", "lld", "design", "dbms", "cn", "networks", "course", "prep"]):
        print(f"Channel: '{chat_name}' (ID: {items[0]['chat_id']}) -> {len(items)} videos found")
