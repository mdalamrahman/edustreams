import sys
import asyncio
from telethon import TelegramClient

API_ID = 37503742
API_HASH = 'e9418514754885f7a01050ca1d2997b1'
SESSION_NAME = "edustream_telethon_user"

async def main():
    phone = sys.argv[1]
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    print(f"Connecting to Telegram for {phone}...", flush=True)
    await client.connect()
    print("Connected! Sending code request...", flush=True)
    res = await client.send_code_request(phone)
    print(f"RESULT:HASH:{res.phone_code_hash}", flush=True)
    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
