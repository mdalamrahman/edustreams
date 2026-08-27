import requests
import json

def test_piston_compiler():
    # Test C++
    cpp_code = """
#include <iostream>
#include <vector>
using namespace std;

int main() {
    cout << "[[7,4,1],[8,5,2],[9,6,3]]" << endl;
    return 0;
}
"""
    res = requests.post(
        "https://emkc.org/api/v2/piston/execute",
        json={
            "language": "cpp",
            "version": "10.2.0",
            "files": [{"name": "solution.cpp", "content": cpp_code}]
        },
        timeout=15
    )
    print("C++ Execution result:", res.json().get("run"))

    # Test Python
    py_code = """
print([[7,4,1],[8,5,2],[9,6,3]])
"""
    res_py = requests.post(
        "https://emkc.org/api/v2/piston/execute",
        json={
            "language": "python",
            "version": "3.10.0",
            "files": [{"name": "solution.py", "content": py_code}]
        },
        timeout=15
    )
    print("Python Execution result:", res_py.json().get("run"))

if __name__ == "__main__":
    test_piston_compiler()
