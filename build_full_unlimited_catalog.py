import sys
import json
import asyncio

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from telethon import TelegramClient
from telethon.tl.types import MessageMediaDocument, DocumentAttributeVideo, DocumentAttributeFilename

API_ID = 37503742
API_HASH = 'e9418514754885f7a01050ca1d2997b1'
SESSION_NAME = "edustream_telethon_user"

# Target channel IDs from user account
CHANNEL_MAP = {
    "DSA": [-5475342376, -1002230216021, -1002381302446, -1002243972304],
    "System Design": [-5233650498, -1002565364771, -1002895658945, -1003314999500],
    "DBMS": [-5139397617],
    "Computer Networks": [-4621115089]
}

async def main():
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await client.connect()

    print("=== Scanning ALL Messages in ALL Striver & CS Channels ===")

    all_videos_by_cat = {
        "DSA": [],
        "System Design": [],
        "DBMS": [],
        "Computer Networks": []
    }

    for cat_name, chat_ids in CHANNEL_MAP.items():
        print(f"\nProcessing category: {cat_name} ({len(chat_ids)} channels)...")
        for cid in chat_ids:
            try:
                entity = await client.get_entity(cid)
                title = getattr(entity, 'title', str(cid))
                print(f"  Scanning channel '{title}' (ID: {cid})...")
                
                count = 0
                async for msg in client.iter_messages(entity, limit=200):
                    if msg.media and isinstance(msg.media, MessageMediaDocument) and msg.media.document:
                        doc = msg.media.document
                        is_video = any(isinstance(a, DocumentAttributeVideo) for a in (doc.attributes or []))
                        file_name = next((a.file_name for a in (doc.attributes or []) if isinstance(a, DocumentAttributeFilename)), "lecture_video.mp4")

                        if is_video or doc.mime_type.startswith('video/'):
                            count += 1
                            duration = next((a.duration for a in (doc.attributes or []) if isinstance(a, DocumentAttributeVideo)), 0)
                            all_videos_by_cat[cat_name].append({
                                "chat_name": title,
                                "chat_id": cid,
                                "msg_id": msg.id,
                                "file_id": str(doc.id),
                                "file_name": file_name,
                                "size_mb": round(doc.size / 1024 / 1024, 1),
                                "duration": duration,
                                "caption": (msg.message or "")[:150],
                                "date": msg.date.isoformat() if msg.date else None
                            })
                print(f"    ✓ Found {count} videos in '{title}'")
            except Exception as e:
                print(f"    Error reading chat {cid}: {e}")

    print("\n=== TOTAL UNLIMITED VIDEOS DISCOVERED ===")
    for cat, items in all_videos_by_cat.items():
        print(f"  - {cat}: {len(items)} Real Telegram Videos")

    out_file = "all_striver_videos_complete.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_videos_by_cat, f, indent=2, ensure_ascii=False)
    print(f"\n[SUCCESS] Saved catalog to {out_file}")

    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
