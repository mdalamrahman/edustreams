import requests
import json

# Test Judge0 CE
try:
    j0_payload = {
        "source_code": "#include <iostream>\nusing namespace std;\nint main() { cout << \"Judge0 C++ Output Test\\n\"; return 0; }",
        "language_id": 54 # C++ (GCC 9.2.0)
    }
    r = requests.post("https://ce.judge0.com/submissions?wait=true", json=j0_payload, timeout=8)
    print("Judge0 Status:", r.status_code)
    print("Judge0 Response:", r.json())
except Exception as e:
    print("Judge0 Error:", e)

# Test Wandbox API
try:
    wb_payload = {
        "compiler": "gcc-head",
        "code": "#include <iostream>\nusing namespace std;\nint main() { cout << \"Wandbox C++ Output Test\\n\"; return 0; }"
    }
    r = requests.post("https://wandbox.org/api/compile.json", json=wb_payload, timeout=8)
    print("Wandbox Status:", r.status_code)
    print("Wandbox Response:", r.json())
except Exception as e:
    print("Wandbox Error:", e)
