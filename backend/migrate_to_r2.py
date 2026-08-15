import os
import json
import requests
from r2_storage import r2_storage, R2_BUCKET_NAME

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or "https://edustream-demo.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY") or ""

def run_migration_to_cloudflare_r2():
    """
    Migrates all existing heavy text payloads (transcripts, notes, MCQs) from Supabase to Cloudflare R2.
    After successful upload to R2, updates Supabase records to clear raw text and retain lightweight storage pointers.
    """
    print("=" * 70)
    print("[MIGRATION] Starting Migration: Supabase Heavy Payloads -> Cloudflare R2 (sdestream)")
    print("=" * 70)

    if not SUPABASE_URL or not SUPABASE_KEY or "edustream-demo.supabase.co" in SUPABASE_URL:
        print("[Notice] Supabase URL/Key not configured or demo mode. Checking local cache migration...")
        return

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    try:
        url = f"{SUPABASE_URL}/rest/v1/videos?select=*"
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200:
            print(f"[Migration Error] Failed to fetch videos from Supabase: {resp.status_code} {resp.text}")
            return

        rows = resp.json()
        print(f"[Supabase] Found {len(rows)} video records to inspect.")

        migrated_count = 0
        for row in rows:
            file_id = row.get("telegram_file_id")
            title = row.get("title")
            transcript = row.get("transcript") or ""
            quiz_json = row.get("quiz_json") or {}

            # Check if this row has legacy heavy text that needs moving to R2
            if transcript and len(transcript.strip()) > 120 and not transcript.startswith("R2_POINTER:"):
                print(f"[Payload] Migrating '{title}' ({file_id}) [{len(transcript)} chars] to R2...")

                payload_data = {
                    "chat_id": file_id.split("_")[0] if "_" in str(file_id) else "unknown",
                    "msg_id": file_id.split("_")[1] if "_" in str(file_id) else 0,
                    "title": title,
                    "transcript": transcript,
                    "notes": quiz_json.get("notes") if isinstance(quiz_json, dict) else row.get("notes"),
                    "mcqs": quiz_json.get("mcqs", []) if isinstance(quiz_json, dict) else [],
                    "coding_problem": quiz_json.get("coding_problem") if isinstance(quiz_json, dict) else None,
                    "simulation_steps": quiz_json.get("simulation_steps", []) if isinstance(quiz_json, dict) else [],
                    "status": "completed",
                    "progress_percent": 100.0
                }

                # 1. Upload to Cloudflare R2
                r2_key = r2_storage.upload_artifact_payload(file_id, payload_data)
                if r2_key:
                    # 2. Update Supabase record to delete heavy text and replace with pointer
                    update_url = f"{SUPABASE_URL}/rest/v1/videos?telegram_file_id=eq.{file_id}"
                    update_payload = {
                        "transcript": f"R2_POINTER:{r2_key}",
                        "quiz_json": {
                            "r2_storage_key": r2_key,
                            "r2_bucket": R2_BUCKET_NAME,
                            "has_artifacts": True
                        }
                    }
                    patch_resp = requests.patch(update_url, headers=headers, json=update_payload, timeout=5)
                    if patch_resp.status_code in [200, 204]:
                        print(f"[Success] Migrated & Cleaned Supabase storage for {file_id}")
                        migrated_count += 1
                    else:
                        print(f"[Notice] R2 uploaded, but Supabase update status: {patch_resp.status_code}")

        print("=" * 70)
        print(f"[MIGRATION COMPLETE] {migrated_count} records moved to Cloudflare R2 bucket '{R2_BUCKET_NAME}'")
        print("=" * 70)

    except Exception as e:
        print(f"[Migration Exception]: {e}")

if __name__ == "__main__":
    run_migration_to_cloudflare_r2()
