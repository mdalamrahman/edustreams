import requests
import json

slug = 'Count Primes in Range L to R'
prompt = f'''You are a Lead Algorithms and Data Structures Engineer.
Generate complete, authentic coding problem details in JSON for: "{slug}".
Return valid JSON with:
- name: string
- category: string
- difficulty: "Easy" | "Medium" | "Hard"
- description: detailed problem explanation
- examples: array of objects with input, output, explanation
- constraints: array of strings
- testCases: array of 3+ test case inputs
- expectedOutputs: array of strings matching testCases
- hints: array of 2+ hints
- approaches: array of objects with id, name, timeComplexity, spaceComplexity, description
- starters: object with cpp, python, java, javascript, go, rust
- solutions: object with cpp, python, java, javascript, go, rust'''

resp = requests.post(
    'https://api.mistral.ai/v1/chat/completions',
    headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ME2AJmpgz5j0QgKMkyDGkjDL0PMkb2E5'},
    json={'model': 'mistral-small-latest', 'messages': [{'role': 'user', 'content': prompt}], 'response_format': {'type': 'json_object'}},
    timeout=25
)
print('Mistral Status:', resp.status_code)
if resp.status_code == 200:
    d = json.loads(resp.json()['choices'][0]['message']['content'])
    print('Generated Name:', d.get('name'))
    print('Category:', d.get('category'))
    print('Description:', d.get('description')[:100])
    print('TestCases:', d.get('testCases'))
    print('Starters:', list(d.get('starters', {}).keys()))
