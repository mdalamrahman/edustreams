import sys
import asyncio
import json

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

    print("=== Scanning ALL Telegram Channels & Saved Messages for Video Files ===")
    dialogs = await client.get_dialogs()

    found_videos = []

    for d in dialogs:
        name = d.name or "Unnamed"
        chat_id = d.id
        print(f"\nScanning '{name}' ({chat_id})...")

        try:
            entity = d.entity
            v_count = 0
            async for msg in client.iter_messages(entity, limit=50):
                if msg.media and isinstance(msg.media, MessageMediaDocument) and msg.media.document:
                    doc = msg.media.document
                    is_video = any(isinstance(a, DocumentAttributeVideo) for a in (doc.attributes or []))
                    file_name = next((a.file_name for a in (doc.attributes or []) if isinstance(a, DocumentAttributeFilename)), "lecture_video.mp4")

                    if is_video or doc.mime_type.startswith('video/'):
                        v_count += 1
                        duration = next((a.duration for a in (doc.attributes or []) if isinstance(a, DocumentAttributeVideo)), 0)
                        video_info = {
                            "chat_name": name,
                            "chat_id": chat_id,
                            "msg_id": msg.id,
                            "file_id": str(doc.id),
                            "file_name": file_name,
                            "size_mb": round(doc.size / 1024 / 1024, 1),
                            "duration": duration,
                            "caption": (msg.message or "")[:100],
                            "date": msg.date.isoformat() if msg.date else None
                        }
                        found_videos.append(video_info)
                        print(f"  [VIDEO FOUND] #{msg.id} in '{name}': {file_name} ({video_info['size_mb']} MB, {duration}s)")
                        if msg.message:
                            print(f"    Caption: {msg.message[:80]}")

            if v_count == 0:
                print(f"  No videos in first 50 messages of '{name}'")
        except Exception as e:
            print(f"  Error reading '{name}': {e}")

    print(f"\n==================================================")
    print(f"TOTAL VIDEOS FOUND ACROSS ALL TELEGRAM CHATS: {len(found_videos)}")
    print(f"==================================================")

    out_file = "all_user_telegram_videos.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(found_videos, f, indent=2, ensure_ascii=False)
    print(f"Saved full list to {out_file}")

    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
