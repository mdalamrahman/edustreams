import sys
import asyncio
from telethon import TelegramClient
from telethon.tl.types import MessageMediaDocument, DocumentAttributeVideo, DocumentAttributeFilename

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

API_ID = 37503742
API_HASH = 'e9418514754885f7a01050ca1d2997b1'
BOT_TOKEN = '8931548931:AAEZgRPOngvCGNHa9cfZSb4B2dtyf_IS2vI'

async def main():
    bot = TelegramClient('test_bot_session', API_ID, API_HASH)
    await bot.start(bot_token=BOT_TOKEN)

    chat_id = -5501631117
    entity = await bot.get_entity(chat_id)
    print(f"Entity type: {type(entity)}, Title: {getattr(entity, 'title', 'N/A')}")

    # Test get_messages with range 7300 to 7340
    ids = list(range(7300, 7340))
    msgs = await bot.get_messages(entity, ids=ids)
    print(f"Retrieved {len(msgs)} messages for ids 7300..7340:")
    for m in msgs:
        if m and m.media:
            doc = getattr(m.media, 'document', None)
            fname = getattr(m.file, 'name', 'unnamed')
            print(f"  Msg ID {m.id}: {fname} (doc id: {doc.id if doc else 'none'})")

    await bot.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
