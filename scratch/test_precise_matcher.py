import json
import re

with open('src/lib/dsaSheetsData.ts', 'r', encoding='utf-8') as f:
    sheet_content = f.read()

problem_names = re.findall(r'"name":\s*"([^"]+)"', sheet_content)

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

stopwords = set(['the', 'and', 'for', 'with', 'part', 'using', 'algorithm', 'problem', 'in', 'of', 'a', 'an', 'to', 'by', 'array', 'part-i', 'part-ii', 'given', 'solve'])

def clean_name(s):
    s = re.sub(r'^DSA Lecture \d+:\s*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\s*\(.*?\)', '', s) # Remove (DP - 20), (LCS), etc.
    s = re.sub(r'\s*\|.*$', '', s) # Remove | DP-29
    s = s.replace('_', ' ')
    s = re.sub(r'[^\w\s]', ' ', s).lower()
    return ' '.join(s.split())

def match_problem(p_name):
    norm_p = clean_name(p_name)
    if not norm_p or len(norm_p) < 3:
        return None
    p_words = [w for w in norm_p.split() if len(w) > 2 and w not in stopwords]
    if not p_words:
        return None

    # 1. Exact cleaned match or complete substring match
    for v in dsa_videos:
        norm_v = clean_name(v['title'])
        if norm_p == norm_v or (len(norm_p) >= 8 and (norm_p in norm_v or norm_v in norm_p)):
            return v

    # 2. All key words of problem are in video (and problem has >= 2 key words)
    if len(p_words) >= 2:
        for v in dsa_videos:
            norm_v = clean_name(v['title'])
            v_words = set(norm_v.split())
            if all(w in v_words or any(vw.startswith(w) or w.startswith(vw) for vw in v_words if len(vw) > 3) for w in p_words):
                return v

    return None

matched_count = 0
for p in sorted(set(problem_names)):
    m = match_problem(p)
    if m:
        matched_count += 1
        clean_p = p.encode('ascii', 'ignore').decode('ascii')
        clean_v = m['title'].encode('ascii', 'ignore').decode('ascii')
        print(f"[MATCH] '{clean_p}' -> '{clean_v}'")

print(f"\nTotal verified accurate matches: {matched_count}")
