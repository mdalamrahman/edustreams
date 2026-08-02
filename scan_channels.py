"""
EduStream — Telegram Channel Content Scanner via Telethon MTProto
Fetches ALL messages (videos, documents, photos, text) from the 4 Striver channels.
Requires user login (phone number + OTP code).
"""
import asyncio
import json
import os
import sys
from telethon import TelegramClient
from telethon.tl.types import (
    MessageMediaDocument,
    MessageMediaPhoto,
    DocumentAttributeVideo,
    DocumentAttributeFilename,
    DocumentAttributeAudio,
)

API_ID = 37503742
API_HASH = 'e9418514754885f7a01050ca1d2997b1'

CHANNELS = [
    {"name": "Striver DSA", "id": -1004390749731, "category": "DSA"},
    {"name": "STRIVER LLD", "id": -1004329144420, "category": "System Design"},
    {"name": "Striver DBMS", "id": -1004332462419, "category": "DBMS"},
    {"name": "Striver CN", "id": -1004308430774, "category": "Computer Networks"},
]

SESSION_FILE = "edustream_user_session"


async def main():
    print("=== EduStream Telegram MTProto Channel Scanner ===\n")
    print("This requires your Telegram account login (phone + OTP).")
    print("Your session will be saved locally for future use.\n")

    client = TelegramClient(SESSION_FILE, API_ID, API_HASH)
    await client.start()

    me = await client.get_me()
    print(f"✓ Logged in as: {me.first_name} (@{me.username or 'N/A'})\n")

    all_content = {}

    for ch in CHANNELS:
        print(f"\n{'='*60}")
        print(f"  Channel: {ch['name']} ({ch['id']})")
        print(f"{'='*60}")

        all_content[ch["category"]] = {
            "channel": ch,
            "videos": [],
            "documents": [],
            "photos": [],
            "texts": [],
        }

        try:
            entity = await client.get_entity(ch["id"])
            print(f"  Resolved entity: {entity.title}")

            msg_count = 0
            video_count = 0
            doc_count = 0
            photo_count = 0
            text_count = 0

            async for msg in client.iter_messages(entity, limit=100):
                msg_count += 1
                caption = msg.message or ""

                # --- VIDEO ---
                if msg.media and isinstance(msg.media, MessageMediaDocument) and msg.media.document:
                    doc = msg.media.document
                    is_video = False
                    duration = 0
                    width = 0
                    height = 0
                    file_name = None

                    for attr in (doc.attributes or []):
                        if isinstance(attr, DocumentAttributeVideo):
                            is_video = True
                            duration = attr.duration
                            width = attr.w
                            height = attr.h
                        if isinstance(attr, DocumentAttributeFilename):
                            file_name = attr.file_name

                    if is_video:
                        video_count += 1
                        size_mb = round(doc.size / 1024 / 1024, 1) if doc.size else 0
                        vid_data = {
                            "message_id": msg.id,
                            "date": msg.date.isoformat() if msg.date else None,
                            "caption": caption,
                            "file_id": str(doc.id),
                            "access_hash": str(doc.access_hash),
                            "file_reference": doc.file_reference.hex() if doc.file_reference else None,
                            "duration": duration,
                            "width": width,
                            "height": height,
                            "size_bytes": doc.size,
                            "size_mb": size_mb,
                            "mime_type": doc.mime_type,
                            "file_name": file_name,
                            "dc_id": doc.dc_id,
                        }
                        all_content[ch["category"]]["videos"].append(vid_data)
                        print(f"  [VIDEO] #{msg.id}: {size_mb}MB, {duration}s, {width}x{height}, {doc.mime_type}")
                        if caption:
                            print(f"    Caption: {caption[:120]}")

                    elif not is_video:
                        # Regular document (PDF, ZIP, DOCX, etc.)
                        doc_count += 1
                        size_kb = round(doc.size / 1024, 1) if doc.size else 0
                        doc_data = {
                            "message_id": msg.id,
                            "date": msg.date.isoformat() if msg.date else None,
                            "caption": caption,
                            "file_id": str(doc.id),
                            "access_hash": str(doc.access_hash),
                            "file_reference": doc.file_reference.hex() if doc.file_reference else None,
                            "file_name": file_name,
                            "mime_type": doc.mime_type,
                            "size_bytes": doc.size,
                            "size_kb": size_kb,
                        }
                        all_content[ch["category"]]["documents"].append(doc_data)
                        print(f"  [DOC]   #{msg.id}: {file_name or 'unnamed'} ({doc.mime_type}, {size_kb}KB)")

                # --- PHOTO ---
                elif msg.media and isinstance(msg.media, MessageMediaPhoto) and msg.media.photo:
                    photo_count += 1
                    photo = msg.media.photo
                    photo_data = {
                        "message_id": msg.id,
                        "date": msg.date.isoformat() if msg.date else None,
                        "caption": caption,
                        "photo_id": str(photo.id),
                        "access_hash": str(photo.access_hash),
                    }
                    all_content[ch["category"]]["photos"].append(photo_data)
                    print(f"  [PHOTO] #{msg.id}: Photo ID {photo.id}")
                    if caption:
                        print(f"    Caption: {caption[:120]}")

                # --- TEXT ONLY ---
                elif caption and len(caption) > 10:
                    text_count += 1
                    all_content[ch["category"]]["texts"].append({
                        "message_id": msg.id,
                        "date": msg.date.isoformat() if msg.date else None,
                        "text": caption,
                    })
                    print(f"  [TEXT]  #{msg.id}: {caption[:100]}")

            print(f"\n  ── Summary: {msg_count} total msgs | {video_count} videos | {doc_count} docs | {photo_count} photos | {text_count} texts")

        except Exception as e:
            print(f"  ERROR: {e}")

    # Save to JSON
    output_path = os.path.join(os.path.dirname(__file__), "telegram_channel_content.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_content, f, indent=2, ensure_ascii=False, default=str)
    print(f"\n✓ Content map saved to: {output_path}")

    await client.disconnect()
    print("✓ Disconnected from Telegram MTProto")


if __name__ == "__main__":
    asyncio.run(main())
