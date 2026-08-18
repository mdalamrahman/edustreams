import sys
import asyncio
sys.path.insert(0, 'backend')
import main

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

async def run():
    print("Testing fetch_channel_videos(-5501631117)...")
    res = await main.fetch_channel_videos(-5501631117)
    print("Result count:", res.get("count"))
    if res.get("error"):
        print("Error:", res.get("error"))
    for v in res.get("videos", [])[:10]:
        print(f"  Msg ID {v['msg_id']}: {v['file_name']} ({v['size_mb']} MB)")

if __name__ == "__main__":
    asyncio.run(run())
