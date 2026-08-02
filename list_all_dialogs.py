import asyncio
from telethon import TelegramClient
from telethon.tl.types import Channel, Chat, User

API_ID = 37503742
API_HASH = 'e9418514754885f7a01050ca1d2997b1'
SESSION_NAME = "edustream_telethon_user"

async def main():
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await client.connect()

    print("=== All Telegram Dialogs & Channels for user Alam ===")
    dialogs = await client.get_dialogs()
    
    for d in dialogs:
        entity = d.entity
        entity_type = "User" if isinstance(entity, User) else ("Channel" if isinstance(entity, Channel) else "Group")
        print(f"Name: '{d.name}' | ID: {d.id} | Type: {entity_type} | Unread: {d.unread_count}")

    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
