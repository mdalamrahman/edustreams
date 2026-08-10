import requests
import json
import base64

def run_judge0(code, lang_id):
    encoded_code = base64.b64encode(code.encode('utf-8')).decode('utf-8')
    payload = {
        "source_code": encoded_code,
        "language_id": lang_id
    }
    r = requests.post("https://ce.judge0.com/submissions?wait=true&base64_encoded=true", json=payload, timeout=8)
    data = r.json()
    
    def decode_b64(val):
        if not val:
            return ""
        try:
            return base64.b64decode(val).decode('utf-8')
        except:
            return str(val)

    return {
        "stdout": decode_b64(data.get("stdout")),
        "stderr": decode_b64(data.get("stderr")),
        "compile_output": decode_b64(data.get("compile_output")),
        "status": data.get("status", {}).get("description")
    }

# Test 1: Valid C++
print("--- TEST 1: Valid C++ ---")
cpp_code = """#include <iostream>
using namespace std;
int main() {
    cout << "Hello World from Real C++ Compiler!" << endl;
    return 0;
}"""
print(run_judge0(cpp_code, 54))

# Test 2: Broken C++ Syntax
print("--- TEST 2: Broken C++ ---")
broken_cpp = """#include <iostream>
using namespace std;
int main() {
    cout << undeclared_variable << endl;
    return 0;
}"""
print(run_judge0(broken_cpp, 54))
