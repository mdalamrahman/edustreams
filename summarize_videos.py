import sys
import json
from collections import Counter

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open("all_user_telegram_videos.json", "r", encoding="utf-8") as f:
    vids = json.load(f)

chats = Counter(v["chat_name"] for v in vids)
print("=== Real Telegram Channels Found with Video Counts ===")
for chat, count in chats.most_common(30):
    print(f"Channel: '{chat}' -> {count} Real Video Files")
