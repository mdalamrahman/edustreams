"""
EduStream — Telegram Channel Scanner via Telethon (Bot Token Authorization)
Scans channel message IDs directly via channels.getMessages MTProto method.
"""
import sys
import asyncio
import json
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from telethon import TelegramClient
from telethon.tl.types import (
    MessageMediaDocument,
    MessageMediaPhoto,
    DocumentAttributeVideo,
    DocumentAttributeFilename,
)

API_ID = 37503742
API_HASH = 'e9418514754885f7a01050ca1d2997b1'
BOT_TOKEN = '8931548931:AAEZgRPOngvCGNHa9cfZSb4B2dtyf_IS2vI'

CHANNELS = [
    {"name": "Striver DSA", "id": -1004390749731, "category": "DSA"},
    {"name": "STRIVER LLD", "id": -1004329144420, "category": "System Design"},
    {"name": "Striver DBMS", "id": -1004332462419, "category": "DBMS"},
    {"name": "Striver CN", "id": -1004308430774, "category": "Computer Networks"},
]

SESSION_FILE = "edustream_bot_session"

async def main():
    print("=== EduStream Telegram Bot MTProto Scanner ===\n")
    client = TelegramClient(SESSION_FILE, API_ID, API_HASH)
    await client.start(bot_token=BOT_TOKEN)

    me = await client.get_me()
    print(f"[OK] Bot Authorized: {me.first_name} (@{me.username})\n")

    all_content = {}

    for ch in CHANNELS:
        print(f"\n{'='*60}")
        print(f"  Scanning Channel: {ch['name']} ({ch['id']})")
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
            print(f"  [OK] Resolved channel entity: {getattr(entity, 'title', ch['name'])}")

            # Batch query message IDs 1 to 200
            msg_ids = list(range(1, 200))
            messages = await client.get_messages(entity, ids=msg_ids)
            
            valid_msgs = [m for m in messages if m is not None]
            print(f"  [OK] Fetched {len(valid_msgs)} existing messages out of {len(msg_ids)} queried IDs")

            for msg in valid_msgs:
                caption = msg.message or ""

                # Inspect document/video media
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
                        print(f"  [VIDEO] Msg #{msg.id}: {size_mb}MB, {duration}s, {width}x{height}, {doc.mime_type} | File: {file_name}")
                        if caption:
                            print(f"    Caption: {caption[:100]}")

                    else:
                        size_kb = round(doc.size / 1024, 1) if doc.size else 0
                        doc_data = {
                            "message_id": msg.id,
                            "date": msg.date.isoformat() if msg.date else None,
                            "caption": caption,
                            "file_id": str(doc.id),
                            "file_name": file_name,
                            "mime_type": doc.mime_type,
                            "size_bytes": doc.size,
                        }
                        all_content[ch["category"]]["documents"].append(doc_data)
                        print(f"  [DOC] Msg #{msg.id}: {file_name or 'unnamed'} ({doc.mime_type}, {size_kb}KB)")

                elif msg.media and isinstance(msg.media, MessageMediaPhoto):
                    all_content[ch["category"]]["photos"].append({"message_id": msg.id, "caption": caption})
                    print(f"  [PHOTO] Msg #{msg.id} | Caption: {caption[:60]}")

                elif caption:
                    all_content[ch["category"]]["texts"].append({"message_id": msg.id, "text": caption})
                    print(f"  [TEXT] Msg #{msg.id}: {caption[:80]}")

        except Exception as e:
            print(f"  [ERROR] Scanning channel {ch['name']}: {e}")

    # Output JSON summary
    out_file = "telegram_channel_content.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_content, f, indent=2, ensure_ascii=False)
    print(f"\n[OK] Saved results to {out_file}")

    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
