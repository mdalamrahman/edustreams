#!/usr/bin/env python3
"""
One-Time Telethon StringSession Generator for EduStream.
Run this locally once to convert Telegram authorization credentials into an in-memory
StringSession that can be safely placed in Render's TELEGRAM_SESSION_STRING environment variable.
Eliminates ephemeral disk SQLite locks permanently.
"""

import sys

try:
    from telethon.sync import TelegramClient
    from telethon.sessions import StringSession
except ImportError:
    sys.exit("Please install Telethon: pip install telethon")

def main():
    print("=" * 60)
    print("EduStream Telethon StringSession Generator")
    print("=" * 60)
    
    api_id_str = input("Enter TELEGRAM_API_ID (e.g. 37503742): ").strip()
    if not api_id_str.isdigit():
        sys.exit("Invalid API ID format")
    api_id = int(api_id_str)
    
    api_hash = input("Enter TELEGRAM_API_HASH: ").strip()
    if not api_hash:
        sys.exit("API HASH cannot be empty")
        
    print("\nConnecting to Telegram to generate StringSession...")
    with TelegramClient(StringSession(), api_id, api_hash) as client:
        session_str = client.session.save()
        print("\n" + "=" * 60)
        print("SUCCESS! Copy the string below into Render's TELEGRAM_SESSION_STRING env variable:")
        print("=" * 60)
        print(session_str)
        print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
