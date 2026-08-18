import sys
import asyncio
from telethon import TelegramClient
from telethon.tl.types import Channel, Chat, User

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

API_ID = 37503742
API_HASH = 'e9418514754885f7a01050ca1d2997b1'
SESSION_NAME = "edustream_telethon_user"

async def main():
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await client.connect()

    print("=== Search for Neetcode / HLD Channels ===")
    dialogs = await client.get_dialogs()
    
    for d in dialogs:
        name = d.name or "Unnamed"
        if any(k in name.lower() for k in ["neetcode", "neet", "hld", "design", "striver", "system"]):
            entity = d.entity
            entity_type = "Channel" if isinstance(entity, Channel) else ("User" if isinstance(entity, User) else "Group")
            print(f"Name: {name} | ID: {d.id} | Type: {entity_type}")

    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
