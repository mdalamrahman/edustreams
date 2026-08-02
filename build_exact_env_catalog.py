import sys
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open("all_user_telegram_videos.json", "r", encoding="utf-8") as f:
    vids = json.load(f)

# The 4 Striver channels from user account
target_ids = {
    "DSA": [-5475342376, -1004390749731],
    "System Design": [-5233650498, -1004329144420],
    "DBMS": [-5139397617, -1004332462419],
    "Computer Networks": [-4621115089, -1004308430774]
}

exact_catalog = {
    "DSA": [],
    "System Design": [],
    "DBMS": [],
    "Computer Networks": []
}

for v in vids:
    cid = v.get("chat_id")
    for cat, ids in target_ids.items():
        if cid in ids:
            exact_catalog[cat].append(v)

print("=== EXACT REAL VIDEO COUNTS FOR YOUR 4 GROUPS ===")
for cat, items in exact_catalog.items():
    print(f"Category '{cat}': {len(items)} REAL Telegram Videos found")
    if items:
        print(f"  Sample Msg IDs: {[x['msg_id'] for x in items[:5]]}")
        print(f"  Sample Files: {[x['file_name'] for x in items[:3]]}")

with open("exact_4_channels_videos.json", "w", encoding="utf-8") as f:
    json.dump(exact_catalog, f, indent=2, ensure_ascii=False)
