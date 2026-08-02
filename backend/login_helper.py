"""
EduStream — Telethon User Login Helper
Step 1: Request OTP code
Step 2: Complete Sign-In with OTP code and optional 2FA password
"""
import sys
import json
import asyncio
from telethon import TelegramClient

API_ID = 37503742
API_HASH = 'e9418514754885f7a01050ca1d2997b1'
SESSION_NAME = "edustream_telethon_user"

async def request_code(phone):
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await client.connect()
    res = await client.send_code_request(phone)
    print(json.dumps({"status": "code_sent", "phone_code_hash": res.phone_code_hash}))
    await client.disconnect()

async def sign_in(phone, code, phone_code_hash, password=None):
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await client.connect()
    try:
        if password:
            user = await client.sign_in(phone=phone, code=code, phone_code_hash=phone_code_hash, password=password)
        else:
            user = await client.sign_in(phone=phone, code=code, phone_code_hash=phone_code_hash)
        print(json.dumps({"status": "success", "username": user.username, "first_name": user.first_name, "id": user.id}))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))
    finally:
        await client.disconnect()

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else ""
    if action == "request":
        phone = sys.argv[2]
        asyncio.run(request_code(phone))
    elif action == "signin":
        phone = sys.argv[2]
        code = sys.argv[3]
        hash_val = sys.argv[4]
        pwd = sys.argv[5] if len(sys.argv) > 5 else None
        asyncio.run(sign_in(phone, code, hash_val, pwd))
