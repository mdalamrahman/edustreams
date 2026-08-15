import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from r2_storage import r2_storage, R2_BUCKET_NAME

print("[TEST] Testing Cloudflare R2 upload to bucket:", R2_BUCKET_NAME)

sample_data = {
    "title": "Cloudflare R2 Verification Test",
    "transcript": "Verifying Cloudflare R2 object storage integration for SDEStream. Zero egress bandwidth, 10 GB free tier storage.",
    "notes": "## Algomaster SDE Notes\n- Verified R2 S3 SigV4 client upload and fetch.",
    "mcqs": [
        {
            "question": "What is the primary benefit of Cloudflare R2 for text payload storage?",
            "options": ["Zero egress download fees", "100ms latency", "Higher pricing", "Restricted storage"],
            "correct_answer": 0,
            "explanation": "Cloudflare R2 charges zero egress download bandwidth fees."
        }
    ]
}

key = r2_storage.upload_artifact_payload("test_verification_01", sample_data)
print("Uploaded Key:", key)

if key:
    print("[TEST] Fetching back uploaded artifact from Cloudflare R2...")
    fetched = r2_storage.fetch_artifact_payload("test_verification_01")
    if fetched and fetched.get("title") == sample_data["title"]:
        print("[SUCCESS] Successfully verified upload and fetch from Cloudflare R2 bucket 'sdestream'!")
    else:
        print("[FAIL] Fetched data mismatch:", fetched)
