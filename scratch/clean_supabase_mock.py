import re

supabase_file = "src/lib/supabase.ts"

with open(supabase_file, "r", encoding="utf-8") as f:
    content = f.read()

# Replace all "quiz_json": [ ... ] arrays with "quiz_json": []
cleaned = re.sub(r'"quiz_json":\s*\[[^\]]*\]', '"quiz_json": []', content, flags=re.DOTALL)

with open(supabase_file, "w", encoding="utf-8") as f:
    f.write(cleaned)

print("[SUCCESS] Cleared all pre-populated quiz_json arrays from src/lib/supabase.ts!")
