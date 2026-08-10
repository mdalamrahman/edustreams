import requests
import json

# Test C++ Syntax Error on Judge0
j0_error_payload = {
    "source_code": "#include <iostream>\nusing namespace std;\nint main() { cout << missing_var; return 0; }",
    "language_id": 54 # C++
}
r = requests.post("https://ce.judge0.com/submissions?wait=true", json=j0_error_payload, timeout=8)
print("Judge0 Error Status:", r.status_code)
print("Judge0 Error Response:", json.dumps(r.json(), indent=2))
