import re
import json

with open('src/lib/supabase.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Match video objects
matches = re.findall(r'\{\s*"id":\s*"(tg-[^"]+)",\s*"channel_id":\s*"ch-dsa-01".*?"telegram_message_id":\s*(\d+).*?"title":\s*"([^"]+)".*?"telegram_caption":\s*"([^"]*)"', text, re.DOTALL)
print(f"Total DSA videos extracted: {len(matches)}")
for m in matches:
    clean_title = m[2].encode('ascii', 'ignore').decode('ascii')
    print(f"Msg #{m[1]}: {clean_title}")
