import sys
import json
import asyncio
from telethon import TelegramClient

API_ID = 37503742
API_HASH = 'e9418514754885f7a01050ca1d2997b1'
SESSION_NAME = "edustream_telethon_user"

async def main():
    phone = sys.argv[1]
    code = sys.argv[2]
    hash_val = sys.argv[3]
    pwd = sys.argv[4] if len(sys.argv) > 4 else None

    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await client.connect()
    try:
        if pwd:
            user = await client.sign_in(phone=phone, code=code, phone_code_hash=hash_val, password=pwd)
        else:
            user = await client.sign_in(phone=phone, code=code, phone_code_hash=hash_val)
        print(f"SUCCESS:AUTH:{user.first_name}:{user.username or 'N/A'}:{user.id}", flush=True)
    except Exception as e:
        print(f"ERROR:AUTH:{e}", flush=True)
    finally:
        await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
