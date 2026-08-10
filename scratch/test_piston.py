import requests
import json

payload = {
    "language": "cpp",
    "version": "*",
    "files": [
        {
            "name": "main.cpp",
            "content": "#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"REAL C++ COMPILER OUTPUT: Hello World!\" << endl;\n    return 0;\n}"
        }
    ]
}

res = requests.post("https://emkc.org/api/v2/piston/execute", json=payload)
print("Status:", res.status_code)
print("Response:", json.dumps(res.json(), indent=2))
