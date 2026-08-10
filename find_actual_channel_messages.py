import asyncio
from telethon import TelegramClient
from telethon.tl.types import MessageMediaDocument, DocumentAttributeFilename, DocumentAttributeVideo

API_ID = 37503742
API_HASH = "e9418514754885f7a01050ca1d2997b1"
BOT_TOKEN = "8931548931:AAEZgRPOngvCGNHa9cfZSb4B2dtyf_IS2vI"

CHANNELS = {
    "DSA": -1004390749731,
    "System Design": -1004329144420,
    "DBMS": -1004332462419,
    "Computer Networks": -1004308430774,
}

async def main():
    client = TelegramClient("test_bot.session", API_ID, API_HASH)
    await client.start(bot_token=BOT_TOKEN)

    for cname, cid in CHANNELS.items():
        print(f"\n==========================================")
        print(f" Probing {cname} ({cid})...")
        print(f"==========================================")
        entity = await client.get_entity(cid)

        all_valid = []
        # Probe IDs 1 to 500 in batches of 100
        for b in range(0, 500, 100):
            ids = list(range(b + 1, b + 101))
            msgs = await client.get_messages(entity, ids=ids)
            valid = [m for m in msgs if m]
            all_valid.extend(valid)

        print(f"Total valid messages found in {cname} (IDs 1..500): {len(all_valid)}")
        for m in all_valid:
            doc = m.media.document if (m.media and isinstance(m.media, MessageMediaDocument)) else None
            fname = next((a.file_name for a in (doc.attributes or []) if isinstance(a, DocumentAttributeFilename)), None) if doc else None
            is_vid = "VIDEO" if doc and (any(isinstance(a, DocumentAttributeVideo) for a in (doc.attributes or [])) or (doc.mime_type or '').startswith('video/')) else "TEXT/OTHER"
            print(f"  Msg #{m.id} | Type: {is_vid} | File: {fname} | Text: {(m.message or '')[:60]}")

    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
