import sys
import asyncio
from telethon import TelegramClient

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

    ids = list(range(1, 50))
    msgs = await bot.get_messages(entity, ids=ids)
    print(f"Retrieved {len(msgs)} messages for ids 1..50:")
    for m in msgs:
        if m and m.media:
            fname = getattr(m.file, 'name', None) or (m.text[:40] if m.text else 'Media File')
            print(f"  Msg ID {m.id}: {fname}")

    await bot.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
