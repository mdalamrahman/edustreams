import json

with open("hld_videos_extracted.json", "r", encoding="utf-8") as f:
    hld_videos = json.load(f)

with open("src/lib/supabase.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Check if already added
if "tg-exact-hld-7310" not in content:
    idx = content.rfind("];")
    if idx != -1:
        hld_str = ",\n" + ",\n".join(json.dumps(v, indent=2) for v in hld_videos) + "\n"
        new_content = content[:idx] + hld_str + content[idx:]
        with open("src/lib/supabase.ts", "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Successfully appended {len(hld_videos)} HLD videos to MOCK_VIDEOS in src/lib/supabase.ts!")
    else:
        print("Error: Could not find closing bracket of MOCK_VIDEOS")
else:
    print("HLD videos already present in src/lib/supabase.ts")
