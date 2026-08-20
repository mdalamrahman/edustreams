import json
import re

# Read DSA sheet data
with open('src/lib/dsaSheetsData.ts', 'r', encoding='utf-8') as f:
    sheet_content = f.read()

# Extract problems from dsaSheetsData.ts
problem_names = re.findall(r'"name":\s*"([^"]+)"', sheet_content)
print(f"Total problems in DSA Sheets: {len(problem_names)}")

# Read supabase DSA videos
with open('src/lib/supabase.ts', 'r', encoding='utf-8') as f:
    supa_content = f.read()

dsa_videos = []
for m in re.finditer(r'\{\s*"id":\s*"(tg-[^"]+)",\s*"channel_id":\s*"ch-dsa-01".*?"telegram_message_id":\s*(\d+).*?"title":\s*"([^"]+)".*?"stream_url":\s*"([^"]+)"', supa_content, re.DOTALL):
    dsa_videos.append({
        'id': m.group(1),
        'msg_id': m.group(2),
        'title': m.group(3),
        'stream_url': m.group(4)
    })
print(f"Total DSA videos in supabase: {len(dsa_videos)}")

stopwords = set(['the', 'and', 'for', 'with', 'part', 'using', 'algorithm', 'problem', 'in', 'of', 'a', 'an', 'to', 'by', 'array', 'part-i', 'part-ii', 'find', 'given', 'solve'])

def normalize(s):
    # Remove "DSA Lecture \d+:" or similar prefixes
    s = re.sub(r'^DSA Lecture \d+:\s*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'[^\w\s]', ' ', s).lower()
    return s.strip()

def match_problem(p_name):
    norm_p = normalize(p_name)
    p_words = [w for w in norm_p.split() if len(w) > 2 and w not in stopwords]
    
    # 1. exact / substring match
    for v in dsa_videos:
        norm_v = normalize(v['title'])
        if norm_p in norm_v or norm_v in norm_p:
            return v
    
    # 2. all keywords match
    if len(p_words) >= 2:
        for v in dsa_videos:
            norm_v = normalize(v['title'])
            if all(w in norm_v for w in p_words):
                return v
                
    # 3. strong keyword overlap
    if len(p_words) >= 3:
        best_v = None
        max_matches = 0
        for v in dsa_videos:
            norm_v = normalize(v['title'])
            cnt = sum(1 for w in p_words if w in norm_v)
            if cnt >= len(p_words) - 1 and cnt > max_matches:
                max_matches = cnt
                best_v = v
        if best_v:
            return best_v
            
    return None

matched_count = 0
for p in set(problem_names):
    m = match_problem(p)
    if m:
        matched_count += 1
        # print match
        clean_p = p.encode('ascii', 'ignore').decode('ascii')
        clean_v = m['title'].encode('ascii', 'ignore').decode('ascii')
        print(f"[MATCH] Problem: '{clean_p}' -> Video: '{clean_v}' (Msg #{m['msg_id']})")

print(f"\nTotal unique problem matches found: {matched_count}")
