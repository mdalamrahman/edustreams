import sys
import asyncio
from telethon import TelegramClient

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
    print(f"Channel Title: '{getattr(entity, 'title', 'N/A')}'")
    print(f"Chat ID: {chat_id}")
    print(f"Entity ID: {entity.id}")
    
    # In bot API format:
    # If it's a channel/supergroup, bot API uses -100 prefix with raw id
    print(f"Bot API Chat ID: -100{entity.id}" if not str(chat_id).startswith("-100") else f"Bot API Chat ID: {chat_id}")

    msgs = await client.get_messages(chat_id, limit=40)
    print(f"Found {len(msgs)} total messages in this channel:")
    count = 0
    for m in msgs:
        if m.media:
            count += 1
            filename = getattr(m.file, 'name', None) or (m.text[:40] if m.text else 'Media File')
            print(f"  [{count}] ID: {m.id} | Name: {filename}")

    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
