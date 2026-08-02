import asyncio
import json
from telethon import TelegramClient

API_ID = 37503742
API_HASH = 'e9418514754885f7a01050ca1d2997b1'
SESSION_NAME = "edustream_telethon_user"

CHANNELS = [
    {"name": "Striver DSA", "id": -1004390749731},
    {"name": "STRIVER LLD", "id": -1004329144420},
    {"name": "Striver DBMS", "id": -1004332462419},
    {"name": "Striver CN", "id": -1004308430774},
]

async def main():
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await client.connect()

    for ch in CHANNELS:
        print(f"\n==================== {ch['name']} ({ch['id']}) ====================")
        try:
            entity = await client.get_entity(ch['id'])
            print(f"Entity title: {getattr(entity, 'title', 'N/A')}")
            
            count = 0
            async for msg in client.iter_messages(entity, limit=20):
                count += 1
                media_type = msg.media.__class__.__name__ if msg.media else "No Media"
                text = (msg.message or "").replace('\n', ' ')
                print(f"  Msg #{msg.id} | Date: {msg.date} | Media: {media_type} | Text: {text[:80]}")
                if msg.media:
                    print(f"    Raw Media: {msg.media}")
            
            print(f"Total fetched: {count}")
        except Exception as e:
            print(f"  Error: {e}")

    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
