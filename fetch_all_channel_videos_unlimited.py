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

async def main():
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await client.connect()

    print("=== Scanning ALL Messages in Striver Channels (UNLIMITED) ===")
    dialogs = await client.get_dialogs()

    target_chats = {}
    for d in dialogs:
        name = (d.name or "").lower()
        if "striver dsa" in name or "dsa with java pw" in name or "dsa with c++ by ac" in name:
            target_chats["DSA"] = d.entity
        elif "striver lld" in name or "striver : system design" in name or "system design" in name:
            target_chats["System Design"] = d.entity
        elif "striver dbms" in name or "dbms" in name:
            target_chats["DBMS"] = d.entity
        elif "striver cn" in name or "computer networks" in name:
            target_chats["Computer Networks"] = d.entity

    print(f"Target channels resolved: {list(target_chats.keys())}")

    all_unlimited_videos = []

    for cat_name, entity in target_chats.items():
        title = getattr(entity, 'title', cat_name)
        print(f"\nScanning channel '{title}' (ID: {entity.id}) without message limit...")
        
        v_count = 0
        try:
            async for msg in client.iter_messages(entity, limit=1000):
                if msg.media and isinstance(msg.media, MessageMediaDocument) and msg.media.document:
                    doc = msg.media.document
                    is_video = any(isinstance(a, DocumentAttributeVideo) for a in (doc.attributes or []))
                    file_name = next((a.file_name for a in (doc.attributes or []) if isinstance(a, DocumentAttributeFilename)), "lecture_video.mp4")

                    if is_video or doc.mime_type.startswith('video/'):
                        v_count += 1
                        duration = next((a.duration for a in (doc.attributes or []) if isinstance(a, DocumentAttributeVideo)), 0)
                        all_unlimited_videos.append({
                            "category": cat_name,
                            "chat_name": title,
                            "chat_id": entity.id,
                            "msg_id": msg.id,
                            "file_id": str(doc.id),
                            "file_name": file_name,
                            "size_mb": round(doc.size / 1024 / 1024, 1),
                            "duration": duration,
                            "caption": (msg.message or "")[:150],
                            "date": msg.date.isoformat() if msg.date else None
                        })

            print(f"  ✓ Fetched {v_count} total videos from '{title}'")
        except Exception as e:
            print(f"  Error reading '{title}': {e}")

    out_file = "all_striver_channel_videos_unlimited.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_unlimited_videos, f, indent=2, ensure_ascii=False)
    print(f"\n[SUCCESS] Saved {len(all_unlimited_videos)} total videos to {out_file}")

    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
