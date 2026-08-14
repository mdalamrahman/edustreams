import os
import json
import requests

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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")

def generate_ai_artifacts_from_transcript(transcript: str, title: str) -> dict:
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""You are a Computer Science Professor. Given the following video lecture transcript titled '{title}', generate educational materials in strict JSON format:

TRANSCRIPT:
{transcript[:6000]}

Return a JSON object with EXACTLY these keys:
1. "notes": A comprehensive markdown study note summarizing key concepts, definitions, edge cases, and code examples from the lecture.
2. "mcqs": Array of 5 conceptual multiple-choice questions. Each question must have:
   - "question": string
   - "options": array of 4 strings
   - "correct_answer": integer (0, 1, 2, or 3)
   - "explanation": string
3. "coding_problem": An object with:
   - "title": string
   - "problem_statement": string
   - "starter_code_python": string
   - "starter_code_cpp": string
   - "solution_code_cpp": string
4. "simulation_steps": Array of 4 step objects for a visual step-by-step execution simulation:
   - "title": string
   - "desc": string
   - "array": array of strings or numbers
   - "activeIndices": array of integers
   - "status": string
"""

    payload = {
        "model": "llama-3.3-70b-versatile",
        "response_format": {"type": "json_object"},
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=20)
        resp.raise_for_status()
        return json.loads(resp.json()["choices"][0]["message"]["content"])
    except Exception as e:
        print(f"Error: {e}")
        return {}

if __name__ == "__main__":
    sample_txt = "So today we discuss Class UML Diagrams. Inheritance is represented by solid line with closed arrow. Aggregation is a has-a relationship where contained object can exist independently."
    res = generate_ai_artifacts_from_transcript(sample_txt, "Class UML Diagrams")
    print(json.dumps(res, indent=2))
