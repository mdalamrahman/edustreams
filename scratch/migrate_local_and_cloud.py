import os
import sys
import json
import sqlite3

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from r2_storage import r2_storage, R2_BUCKET_NAME

print("=" * 70)
print("[MIGRATION TO CLOUDFLARE R2] Checking all local caches and databases...")
print("=" * 70)

migrated = 0

# 1. Check SQLite database
sqlite_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend/edustream_artifacts.db'))
if os.path.exists(sqlite_path):
    try:
        conn = sqlite3.connect(sqlite_path)
        cursor = conn.cursor()
        cursor.execute("SELECT cache_key, chat_id, msg_id, title, transcript, notes, mcqs_json, coding_problem_json FROM lecture_artifacts WHERE transcript IS NOT NULL")
        rows = cursor.fetchall()
        print(f"[SQLite DB] Found {len(rows)} cached artifacts in SQLite database.")
        for row in rows:
            cache_key, chat_id, msg_id, title, transcript, notes, mcqs_json, coding_problem_json = row
            if transcript and len(transcript.strip()) > 100:
                payload = {
                    "chat_id": chat_id,
                    "msg_id": msg_id,
                    "title": title,
                    "transcript": transcript,
                    "notes": notes,
                    "mcqs": json.loads(mcqs_json) if mcqs_json else [],
                    "coding_problem": json.loads(coding_problem_json) if coding_problem_json else None,
                    "status": "completed",
                    "progress_percent": 100.0
                }
                key = r2_storage.upload_artifact_payload(cache_key, payload)
                if key:
                    print(f"  [R2 Uploaded] Stored '{title}' -> '{key}'")
                    migrated += 1
        conn.close()
    except Exception as e:
        print(f"[SQLite Error]: {e}")

# 2. Check ai_cache.json files
for cache_file in [
    os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend/ai_cache.json')),
    r"C:\Users\User\Desktop\edustreamfiles\ai_cache.json"
]:
    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            print(f"[JSON Cache] Inspecting {cache_file} ({len(data)} keys)...")
            for k, val in data.items():
                if isinstance(val, dict) and val.get("transcript") and len(val.get("transcript", "").strip()) > 100:
                    key = r2_storage.upload_artifact_payload(k, val)
                    if key:
                        print(f"  [R2 Uploaded] Stored '{val.get('title', k)}' -> '{key}'")
                        migrated += 1
        except Exception as e:
            print(f"[JSON Cache Error in {cache_file}]: {e}")

print("=" * 70)
print(f"[MIGRATION SUMMARY] Completed: {migrated} artifact payloads uploaded to Cloudflare R2 bucket '{R2_BUCKET_NAME}'")
print("=" * 70)
