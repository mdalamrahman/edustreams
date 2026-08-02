import json
import asyncio
import requests
from telethon import TelegramClient

API_ID = 37503742
API_HASH = 'e9418514754885f7a01050ca1d2997b1'
BOT_TOKEN = '8931548931:AAEZgRPOngvCGNHa9cfZSb4B2dtyf_IS2vI'
SESSION_NAME = "edustream_telethon_user"

async def main():
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await client.connect()

    with open("all_user_telegram_videos.json", "r", encoding="utf-8") as f:
        vids = json.load(f)

    print(f"Total videos in account: {len(vids)}")

    # Sample video from Striver DBMS or STRIVER LLD
    sample = None
    for v in vids:
        name = (v.get("chat_name") or "").lower()
        if "striver" in name or "dsa" in name or "system design" in name or "dbms" in name or "cn" in name:
            sample = v
            break

    if sample:
        print("\nFound sample video:")
        print(f"  Chat: {sample.get('chat_name')}")
        print(f"  Title: {sample.get('file_name')}")
        print(f"  Msg ID: {sample.get('msg_id')}")
        print(f"  Size: {sample.get('size_mb')} MB")

        # Fetch message media
        entity = await client.get_entity(sample['chat_id'])
        msg = await client.get_messages(entity, ids=sample['msg_id'])
        
        if msg and msg.media:
            print("  Media type:", msg.media.__class__.__name__)
            # Check Telegram Bot getFile API
            doc = msg.media.document
            print("  Document ID:", doc.id)

    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
