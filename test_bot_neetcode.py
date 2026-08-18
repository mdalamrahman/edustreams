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

    test_ids = [-5501631117, -1005501631117, 5501631117]
    for cid in test_ids:
        try:
            entity = await bot.get_entity(cid)
            print(f"[SUCCESS] Bot accessed channel with ID {cid}: {getattr(entity, 'title', 'N/A')}")
            msgs = await bot.get_messages(cid, limit=5)
            print(f"  Retrieved {len(msgs)} messages with bot token.")
        except Exception as e:
            print(f"[FAILED] Bot failed for ID {cid}: {e}")

    await bot.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
