"""
EduStream — Telethon MTProto User Session Ingestion & Media Stream Engine
Connects to Telegram via Telethon user session to pull real channel videos, PDFs, and message captions.
"""
import os
import sys
import json
import asyncio
from telethon import TelegramClient
from telethon.tl.types import (
    MessageMediaDocument,
    DocumentAttributeVideo,
    DocumentAttributeFilename
)

API_ID = 37503742
API_HASH = 'e9418514754885f7a01050ca1d2997b1'

CHANNELS = [
    {"name": "Striver DSA", "id": -1004390749731, "category": "DSA"},
    {"name": "STRIVER LLD", "id": -1004329144420, "category": "System Design"},
    {"name": "Striver DBMS", "id": -1004332462419, "category": "DBMS"},
    {"name": "Striver CN", "id": -1004308430774, "category": "Computer Networks"},
]

SESSION_NAME = "edustream_telethon_user"

async def ingest_telegram_channels(phone_number=None, code=None, password=None):
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await client.connect()

    if not await client.is_user_authorized():
        print("[Telethon] User session not authorized yet.")
        if phone_number and code:
            try:
                await client.sign_in(phone_number, code, password=password)
            except Exception as e:
                print(f"[Telethon Auth Error]: {e}")
                return False
        else:
            print("[Telethon] Requires interactive user login (phone + Telegram login code).")
            return False

    me = await client.get_me()
    print(f"[Telethon Logged In] Name: {me.first_name} | Phone: +{me.phone}")

    ingested_catalog = {}

    for ch in CHANNELS:
        print(f"\n--- Ingesting Channel: {ch['name']} ({ch['id']}) ---")
        ingested_catalog[ch['category']] = []

        try:
            entity = await client.get_entity(ch['id'])
            async for msg in client.iter_messages(entity, limit=50):
                if not msg.media:
                    continue

                if isinstance(msg.media, MessageMediaDocument) and msg.media.document:
                    doc = msg.media.document
                    is_video = any(isinstance(a, DocumentAttributeVideo) for a in (doc.attributes or []))
                    file_name = next((a.file_name for a in (doc.attributes or []) if isinstance(a, DocumentAttributeFilename)), "lecture_attachment")

                    if is_video:
                        duration = next((a.duration for a in (doc.attributes or []) if isinstance(a, DocumentAttributeVideo)), 0)
                        video_item = {
                            "id": f"tg-{ch['category'].lower()}-{msg.id}",
                            "channel_id": f"ch-{ch['category'].lower()}",
                            "telegram_file_id": str(doc.id),
                            "telegram_message_id": msg.id,
                            "sender_username": f"@{ch['name'].replace(' ', '_')}_Bot",
                            "title": f"{ch['name']} Lecture Post #{msg.id}: {msg.message[:40] if msg.message else 'Video Lecture'}",
                            "telegram_caption": msg.message or f"Telegram Channel Lecture Post #{msg.id}",
                            "duration_seconds": duration or 1200,
                            "transcript": f"Ingested from Telegram MTProto Post #{msg.id}. Whisper STT transcript processing...",
                            "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c7142b2e2ec?auto=format&fit=crop&w=800&q=80",
                            "stream_url": f"http://localhost:7860/stream/{msg.id}",
                            "created_at": msg.date.isoformat() if msg.date else None,
                            "attachments": [
                                {
                                    "id": f"att-{msg.id}",
                                    "video_id": f"tg-{ch['category'].lower()}-{msg.id}",
                                    "telegram_file_id": str(doc.id),
                                    "file_name": file_name,
                                    "file_type": file_name.split('.')[-1] if '.' in file_name else 'pdf',
                                    "file_size_bytes": doc.size,
                                    "download_url": f"http://localhost:7860/api/download/att-{msg.id}?file_name={file_name}",
                                    "created_at": msg.date.isoformat() if msg.date else None,
                                    "caption": f"Attached lecture resource ({file_name})"
                                }
                            ]
                        }
                        ingested_catalog[ch['category']].append(video_item)
                        print(f"  [OK] Ingested Video #{msg.id}: {file_name} ({round(doc.size/1024/1024, 1)} MB)")

        except Exception as err:
            print(f"  [Error] Channel {ch['name']}: {err}")

    # Write output catalog
    out_path = os.path.join(os.path.dirname(__file__), "ingested_telegram_catalog.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(ingested_catalog, f, indent=2, ensure_ascii=False)

    print(f"\n[Success] Ingestion complete. Output saved to {out_path}")
    await client.disconnect()
    return True

if __name__ == "__main__":
    asyncio.run(ingest_telegram_channels())
