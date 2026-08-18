import sys
import json
import asyncio
from telethon import TelegramClient
from telethon.tl.types import MessageMediaDocument, DocumentAttributeVideo, DocumentAttributeFilename

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

API_ID = 37503742
API_HASH = 'e9418514754885f7a01050ca1d2997b1'
SESSION_NAME = "edustream_telethon_user"

async def main():
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await client.connect()

    chat_id = -5501631117
    entity = await client.get_entity(chat_id)
    print(f"Fetching videos from '{entity.title}' ({chat_id})...")

    videos = []
    msgs = await client.get_messages(chat_id, limit=50)
    for msg in msgs:
        if not msg.media or not isinstance(msg.media, MessageMediaDocument):
            continue
        doc = msg.media.document
        if not doc:
            continue

        file_name = next(
            (a.file_name for a in (doc.attributes or []) if isinstance(a, DocumentAttributeFilename)),
            f"video_{msg.id}.mp4"
        )
        is_video = (
            any(isinstance(a, DocumentAttributeVideo) for a in (doc.attributes or []))
            or (doc.mime_type and doc.mime_type.startswith("video/"))
            or file_name.lower().endswith((".mp4", ".mkv", ".webm"))
        )
        if not is_video:
            continue

        duration = next(
            (a.duration for a in (doc.attributes or []) if isinstance(a, DocumentAttributeVideo)),
            300
        )

        clean_title = file_name.replace(".mp4", "").replace(".mkv", "").strip()
        if clean_title.startswith(("0", "1", "2", "3", "4", "5", "6", "7", "8", "9")):
            clean_title = f"HLD Lecture {clean_title}"

        v_obj = {
            "id": f"tg-exact-hld-{msg.id}",
            "channel_id": "ch-hld-05",
            "telegram_file_id": str(doc.id),
            "telegram_message_id": msg.id,
            "sender_username": "@NeetCode_Faculty",
            "title": clean_title,
            "telegram_caption": f"📌 [HLD Module | Size: {round(doc.size / (1024 * 1024), 1)} MB]\nFile: {file_name}\nCourse: Neetcode System Design HLD",
            "duration_seconds": duration,
            "transcript": f"NeetCode System Design High Level Design Lecture: {file_name}. High-definition stream.",
            "thumbnail_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
            "stream_url": f"https://edustream-backend-90vm.onrender.com/stream/-5501631117/{msg.id}",
            "created_at": msg.date.isoformat() if msg.date else "2026-08-18T17:00:00+00:00",
            "quiz_json": [],
            "attachments": [
                {
                    "id": f"att-exact-hld-{msg.id}",
                    "video_id": f"tg-exact-hld-{msg.id}",
                    "telegram_file_id": str(doc.id),
                    "file_name": file_name,
                    "file_type": "mp4",
                    "file_size_bytes": doc.size,
                    "download_url": f"/api/download/-5501631117/{msg.id}?file_name={file_name}",
                    "created_at": msg.date.isoformat() if msg.date else "2026-08-18T17:00:00+00:00",
                    "caption": f"Lecture Video Attachment ({file_name})"
                }
            ]
        }
        videos.append(v_obj)

    # Sort in ascending lecture order
    videos.sort(key=lambda x: x["telegram_message_id"])
    print(f"Successfully processed {len(videos)} videos.")

    with open("hld_videos_extracted.json", "w", encoding="utf-8") as f:
        json.dump(videos, f, indent=2, ensure_ascii=False)

    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
