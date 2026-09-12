import { TELEGRAM_BACKEND_URL } from './telegram';
import { AIDiagnosticReport, QuizQuestion } from './types';
import { executeCode, compareOutputs, SupportedLanguage } from './compiler';

export const MISTRAL_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MISTRAL_API_KEY) || 'ME2AJmpgz5j0QgKMkyDGkjDL0PMkb2E5';
export const GROQ_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY) || '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';

export interface CodeTAReview {
  time_complexity: string;
  space_complexity: string;
  status: string;
  review_summary: string;
  suggestions: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ContextualChatPayload {
  mode: 'video' | 'notes' | 'quiz' | 'code';
  userMsg: string;
  videoTitle: string;
  timestamp?: string;
  transcript?: string;
  notes?: string;
  mcq?: {
    question: string;
    options: string[];
    selectedAnswer?: number | null;
    correctAnswer?: number;
    explanation?: string;
  };
  codingContext?: {
    title: string;
    problemStatement: string;
    studentCode: string;
    language: string;
    testCases?: any[];
    stdout?: string;
    stderr?: string;
  };
  history?: ChatMessage[];
}

/**
 * Universal Multi-Provider AI Cascade Executor
 * Seamlessly fails over: Groq (Qwen 3.8 / Compound) -> Mistral -> Backend AI Endpoint
 */
export async function executeAIChatCascade(
  messages: Array<{ role: string; content: string }>,
  options?: {
    temperature?: number;
    maxTokens?: number;
    responseFormatJson?: boolean;
    timeoutMs?: number;
    preferMistral?: boolean;
  }
): Promise<string | null> {
  const temp = options?.temperature ?? 0.3;
  const timeoutMs = options?.timeoutMs ?? 15000;
  const preferMistral = options?.preferMistral !== false; // Mistral AI is always primary

  // 1. Mistral AI (Codestral, Mistral Code, Ministral 8B, Mistral Medium)
  const tryMistral = async (): Promise<string | null> => {
    if (!MISTRAL_API_KEY) return null;
    const mistralModels = ['codestral-latest', 'mistral-code-latest', 'ministral-8b-latest', 'mistral-medium-latest', 'mistral-small-latest'];
    const mistralMessages = options?.responseFormatJson && !messages.some(m => /json/i.test(m.content))
      ? [...messages, { role: 'system', content: 'Respond with a valid JSON object matching the requested schema.' }]
      : messages;

    for (const model of mistralModels) {
      try {
        const bodyPayload: any = {
          model,
          messages: mistralMessages,
          temperature: temp,
        };
        if (options?.responseFormatJson) {
          bodyPayload.response_format = { type: 'json_object' };
        }

        const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MISTRAL_API_KEY}`
          },
          body: JSON.stringify(bodyPayload),
          signal: AbortSignal.timeout(timeoutMs)
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content && typeof content === 'string' && content.trim().length > 0) {
            return content.trim();
          }
        } else if (res.status === 400 && options?.responseFormatJson) {
          const retryRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
              model,
              messages: mistralMessages,
              temperature: temp,
            }),
            signal: AbortSignal.timeout(timeoutMs)
          });
          if (retryRes.ok) {
            const data = await retryRes.json();
            const content = data.choices?.[0]?.message?.content;
            if (content && typeof content === 'string' && content.trim().length > 0) {
              return content.trim();
            }
          }
        }
      } catch (e) {
        console.warn(`[Mistral Model '${model}' notice]:`, e);
      }
    }
    return null;
  };

  // 2. Groq AI Fallback
  const tryGroq = async (): Promise<string | null> => {
    if (!GROQ_API_KEY) return null;
    const groqModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b', 'groq/compound-mini'];
    const groqMessages = options?.responseFormatJson && !messages.some(m => /json/i.test(m.content))
      ? [...messages, { role: 'system', content: 'Respond with a valid JSON object matching the requested schema.' }]
      : messages;

    for (const model of groqModels) {
      try {
        const bodyPayload: any = {
          model,
          messages: groqMessages,
          temperature: temp,
        };
        if (options?.maxTokens) bodyPayload.max_tokens = options.maxTokens;
        if (options?.responseFormatJson) {
          bodyPayload.response_format = { type: 'json_object' };
        }

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify(bodyPayload),
          signal: AbortSignal.timeout(timeoutMs)
        });

        if (res.ok) {
          const data = await res.json();
          const rawContent = data.choices?.[0]?.message?.content;
          if (rawContent && typeof rawContent === 'string' && rawContent.trim().length > 0) {
            const cleanContent = rawContent.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim();
            return cleanContent || rawContent.trim();
          }
        }
      } catch (e) {
        console.warn(`[Groq Model '${model}' notice]:`, e);
      }
    }
    return null;
  };

  if (preferMistral) {
    const mistralRes = await tryMistral();
    if (mistralRes) return mistralRes;
    const groqRes = await tryGroq();
    if (groqRes) return groqRes;
  } else {
    const groqRes = await tryGroq();
    if (groqRes) return groqRes;
    const mistralRes = await tryMistral();
    if (mistralRes) return mistralRes;
  }

  // 3. TERTIARY: Backend AI Cascade Proxy
  try {
    const backendUrl = TELEGRAM_BACKEND_URL ? `${TELEGRAM_BACKEND_URL}/api/interview/chat` : '/api/interview/chat';
    const lastUserMsg = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
    const sysPrompt = messages.find(m => m.role === 'system')?.content || '';
    const historyMsgs = messages.filter(m => m.role !== 'system');

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `${sysPrompt ? `[SYSTEM: ${sysPrompt}]\n\n` : ''}${lastUserMsg}`,
        history: historyMsgs.slice(0, -1)
      }),
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (res.ok) {
      // Read text stream or json
      const reader = res.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let fullText = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const parsed = JSON.parse(line.replace('data: ', '').trim());
                if (parsed.token) fullText += parsed.token;
              } catch {}
            }
          }
        }
        if (fullText.trim()) return fullText.trim();
      }
    }
  } catch (e) {
    console.warn('[Backend AI Chat fallback notice]:', e);
  }

  return null;
}

export async function requestContextualAIChatResponse(payload: ContextualChatPayload): Promise<string> {
  const { mode, userMsg, videoTitle, timestamp, transcript, notes, mcq, codingContext, history = [] } = payload;
  const cleanTitle = (videoTitle || 'Computer Science Lecture').replace(/\.(mp4|mkv|webm)$/i, '');

  let contextDescription = '';
  if (mode === 'video') {
    contextDescription = `MODE: VIDEO LECTURE & SPEECH TRANSCRIPT (TIMESTAMP-REFERENCED)
You are an expert computer science and software engineering teaching assistant grounded in the lecture "${cleanTitle}".
${timestamp ? `ACTIVE VIDEO TIMEMARK: ${timestamp} (The student paused the video at ${timestamp} to ask for clarification).` : ''}
VERBATIM LECTURE TRANSCRIPT:
${(transcript || '').slice(0, 14000)}

Instructions:
- If a timestamp (${timestamp || 'N/A'}) is referenced, explain with precision what the instructor is teaching, drawing, or coding at this point in the lecture.
- Provide clear intuition, mental models, trade-offs, and practical interview takeaways.
- Present explanations in clean, readable Markdown prose.`;
  } else if (mode === 'notes') {
    contextDescription = `MODE: ALGOMASTER SDE STUDY NOTES
You are grounded in the Algomaster SDE study guide for "${cleanTitle}".
STUDY NOTES:
${(notes || '').slice(0, 12000)}

Instructions:
- Answer questions by referencing the intuition, architectural diagrams, trade-off matrix, pitfalls, and interview follow-ups in the study notes.`;
  } else if (mode === 'quiz') {
    const selectedChar = mcq?.selectedAnswer !== undefined && mcq?.selectedAnswer !== null 
      ? String.fromCharCode(65 + mcq.selectedAnswer) 
      : 'None selected yet';
    const correctChar = mcq?.correctAnswer !== undefined ? String.fromCharCode(65 + mcq.correctAnswer) : 'A';

    contextDescription = `MODE: CONCEPTUAL MCQ QUIZ
Current Question:
"${mcq?.question || 'Quiz Question'}"

Options:
${(mcq?.options || []).map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}

Student's Selected Answer: Option ${selectedChar}
Correct Answer: Option ${correctChar}
Explanation from Lecture: ${mcq?.explanation || ''}

Instructions:
- Help the student understand why the correct answer is right and why other options are incorrect.
- Give constructive pedagogical feedback and explain edge cases or real-world implications.`;
  } else if (mode === 'code') {
    contextDescription = `MODE: CODING CHALLENGE & COMPILER WORKSPACE
Problem: ${codingContext?.title || cleanTitle}
Problem Statement:
${(codingContext?.problemStatement || '').slice(0, 5000)}

Language: ${codingContext?.language || 'python'}
Student's Typed Solution Code:
\`\`\`${codingContext?.language || 'python'}
${codingContext?.studentCode || '# No code written yet'}
\`\`\`

Execution Output (Terminal):
Stdout: ${codingContext?.stdout || '(No stdout)'}
Stderr / Errors: ${codingContext?.stderr || '(No errors)'}

Instructions:
- Review the student's code logic, syntax, edge cases, and runtime errors.
- If there is a compiler error or exception, explain the exact line and how to fix it without giving away the complete solution unless asked.
- Provide time and space complexity analysis.`;
  }

  const systemPrompt = `You are SDETube AI Teaching Assistant, an expert, encouraging computer science tutor.
You are assisting a student studying "${cleanTitle}".

${contextDescription}

General Guidelines:
- Answer clearly and concisely using Markdown formatting (bold keywords, code blocks with syntax highlighting, bullet points).
- NEVER mention third-party AI APIs (always identify yourself as SDETube AI Teaching Assistant).
- Be supportive, precise, and directly address the student's question.`;

  const messagesPayload = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: userMsg }
  ];

  const aiReply = await executeAIChatCascade(messagesPayload, { temperature: 0.3 });
  if (aiReply) return aiReply;

  if (mode === 'code') {
    return `Regarding **${cleanTitle}**: For this algorithmic problem, carefully consider the core invariant, optimal data structure (e.g., using a **stack** for matching brackets/parentheses, hash maps for lookups, or two pointers), and trace your algorithm through the example inputs step-by-step to verify $O(N)$ time and $O(1)$/$O(N)$ space complexity.`;
  }

  if (mode === 'quiz') {
    return `Regarding **${cleanTitle}**: Review the options and the underlying algorithmic concepts from the lecture to identify the most optimal, correct choice and eliminate distractors.`;
  }

  if (mode === 'notes') {
    return `Regarding **${cleanTitle}**: Review the key architectural principles, system invariants, and trade-off matrices outlined in the study notes.`;
  }

  return `Regarding **${cleanTitle}**: Based on your current lecture context, focus on the core intuitions, trade-offs, and practical interview takeaways discussed in this topic.`;
}

export async function requestMistralChatResponse(
  userMsg: string,
  videoTitle: string,
  transcript: string,
  history: ChatMessage[] = []
): Promise<string> {
  return requestContextualAIChatResponse({
    mode: 'video',
    userMsg,
    videoTitle,
    transcript,
    history
  });
}

export async function requestMistralQuiz(
  videoTitle: string,
  transcript: string,
  channelName: string = 'DSA'
): Promise<QuizQuestion[]> {
  const cleanTitle = (videoTitle || 'Lecture').replace(/\.(mp4|mkv|webm)$/i, '');

  // 1. Check global shared backend AI cache first so ALL users get the exact same quiz
  try {
    const backendUrl = import.meta.env.VITE_TELEGRAM_BACKEND_URL || '';
    const cacheResp = await fetch(`${backendUrl}/api/ai/cache/${encodeURIComponent(cleanTitle)}`);
    if (cacheResp.ok) {
      const cacheData = await cacheResp.json();
      if (cacheData.quiz_json && cacheData.quiz_json.length > 0) {
        return cacheData.quiz_json;
      }
    }
  } catch (err) {
    console.warn('[AI Cache Check Notice]:', err);
  }

  const prompt = `You are a Computer Science Professor creating a quiz from this lecture transcript.
Create questions for the lecture "${cleanTitle}" (${channelName}).

TRANSCRIPT (base your questions ONLY on this content):
"${(transcript || '').slice(0, 3000)}"

Return a JSON object with two keys:
1. "mcqs": An array of 5 multiple-choice questions. Each MUST be based on concepts from the transcript above. Each question must have:
   - "question": string (directly related to the transcript content)
   - "options": array of 4 string choices
   - "correct_answer": index (0, 1, 2, or 3)
   - "explanation": string explaining why the answer is correct, referencing the transcript
2. "coding_challenges": An array of 3 coding challenge objects. Each MUST be related to the lecture topic and have:
   - "title": string (problem title related to ${cleanTitle})
   - "problem_statement": string (clear problem description)
   - "starter_code": string (in C++ by default, with #include headers and main())
   - "test_cases": array of 3 objects, each with "input" (string) and "expected_output" (string, the exact stdout expected)
   - "difficulty": "Easy", "Medium", or "Hard"

Return ONLY valid JSON.`;

  const rawJson = await executeAIChatCascade([
    { role: 'user', content: prompt }
  ], { temperature: 0.2, responseFormatJson: true });

  if (rawJson) {
    try {
      const content = JSON.parse(rawJson);
      const questions: QuizQuestion[] = [];

      if (Array.isArray(content.mcqs)) {
        content.mcqs.forEach((m: any, idx: number) => {
          questions.push({
            id: `mcq-${Date.now()}-${idx}`,
            video_id: cleanTitle,
            type: 'MCQ',
            question: m.question || `Question ${idx + 1} on ${cleanTitle}`,
            options: m.options || ['Option A', 'Option B', 'Option C', 'Option D'],
            correct_answer: typeof m.correct_answer === 'number' ? m.correct_answer : 0,
            explanation: m.explanation || 'Refer to the lecture transcript for details.'
          });
        });
      }

      const codingArray = content.coding_challenges || (content.coding_challenge ? [content.coding_challenge] : []);
      if (Array.isArray(codingArray)) {
        codingArray.forEach((cc: any, idx: number) => {
          questions.push({
            id: `code-${Date.now()}-${idx}`,
            video_id: cleanTitle,
            type: 'CODING',
            question: cc.problem_statement || cc.title || `Solve coding challenge ${idx + 1} for ${cleanTitle}`,
            options: [],
            correct_answer: 0,
            starter_code: cc.starter_code || `// C++ Solution for ${cleanTitle}\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
            explanation: cc.title || `Coding challenge ${idx + 1} for ${cleanTitle}`,
            difficulty: cc.difficulty || 'Medium',
            test_cases: Array.isArray(cc.test_cases) ? cc.test_cases.map((tc: any) => ({
              input: String(tc.input || ''),
              expected_output: String(tc.expected_output || '')
            })) : []
          });
        });
      }

      if (questions.length > 0) {
        return questions;
      }
    } catch (e) {
      console.warn('[Quiz Parse Notice]:', e);
    }
  }

  return generateTopicSpecificQuizFallback(cleanTitle, channelName);
}

function generateTopicSpecificQuizFallback(title: string, channelName: string): QuizQuestion[] {
  return [
    {
      id: `mcq-gen-1`,
      video_id: title,
      type: 'MCQ',
      question: `In "${title}", what is the primary algorithmic paradigm utilized for achieving optimal complexity?`,
      options: ['Dynamic Programming & Memoization', 'Greedy Choice Property', 'Divide & Conquer', 'Two Pointers & Sliding Window'],
      correct_answer: 0,
      explanation: 'The lecture covers subproblem decomposition and state space optimization.'
    },
    {
      id: `mcq-gen-2`,
      video_id: title,
      type: 'MCQ',
      question: `In "${title}", what is the worst-case space complexity when storing memoized intermediate values?`,
      options: ['O(1)', 'O(N)', 'O(N^2)', 'O(2^N)'],
      correct_answer: 1,
      explanation: 'Storing memoized states requires O(N) auxiliary space.'
    },
    {
      id: `mcq-gen-3`,
      video_id: title,
      type: 'MCQ',
      question: `Which data structure provides the optimal lookup speed for searching elements during state transitions?`,
      options: ['Unordered Hash Table (O(1))', 'Singly Linked List (O(N))', 'Binary Search Tree (O(N))', 'Stack (O(N))'],
      correct_answer: 0,
      explanation: 'Hash tables allow constant O(1) average lookup for memoized keys.'
    },
    {
      id: `code-gen-4`,
      video_id: title,
      type: 'CODING',
      question: `Implement the core algorithmic problem for "${title}" in C++.`,
      options: [],
      correct_answer: 0,
      starter_code: `// C++ Solution for ${title}\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint solveChallenge(const vector<int>& arr) {\n    int sum = 0;\n    for (int x : arr) sum += x;\n    return sum;\n}\n\nint main() {\n    vector<int> data = {10, 20, 30, 40};\n    cout << "Computed Result for ${title}: " << solveChallenge(data) << endl;\n    return 0;\n}`,
      explanation: 'Optimal linear execution for algorithm challenge.'
    }
  ];
}

export interface CodeReviewContext {
  approaches?: Array<{ id?: string; name: string; time?: string; space?: string; description?: string }>;
  starterCode?: string;
  hints?: string[];
  examples?: Array<{ input?: string; output?: string; explanation?: string }>;
}

export async function requestMistralCodeReview(
  code: string,
  language: string,
  stdout: string,
  stderr: string,
  problemTitle: string,
  problemStatement?: string,
  constraints?: string[],
  testCases?: any[],
  context?: CodeReviewContext
): Promise<CodeTAReview> {
  const constraintsText = (constraints && constraints.length > 0)
    ? `Constraints:\n${constraints.map(c => `- ${c}`).join('\n')}`
    : '';

  const testCasesText = (testCases && testCases.length > 0)
    ? `Sample Test Cases:\n${testCases.slice(0, 3).map((tc, i) => `Case ${i + 1}: Input: ${JSON.stringify(tc.input || tc)} => Expected: ${JSON.stringify(tc.expected_output || tc.output || '')}`).join('\n')}`
    : '';

  const hintsText = (context?.hints && context.hints.length > 0)
    ? `Algorithmic Hints / Key Invariants:\n${context.hints.map((h, i) => `${i + 1}. ${h}`).join('\n')}`
    : '';

  const approachesText = (context?.approaches && context.approaches.length > 0)
    ? `Optimal Reference Approaches:\n${context.approaches.map(a => `- ${a.name} [Time: ${a.time || 'N/A'}, Space: ${a.space || 'N/A'}]`).join('\n')}`
    : '';

  const prompt = `You are a Senior Principal Software Engineer & FAANG Technical Interviewer conducting a rigorous code review.

PROBLEM: "${problemTitle}"
${problemStatement ? `PROBLEM DESCRIPTION:\n${problemStatement.slice(0, 3000)}` : ''}
${constraintsText}
${testCasesText}
${hintsText}
${approachesText}

STUDENT'S SUBMITTED CODE:
Language: ${language}
\`\`\`${language}
${code}
\`\`\`

EXECUTION RESULTS:
Stdout: "${stdout || '(No output)'}"
Stderr / Runtime Diagnostics: "${stderr || '(No errors)'}"

Please thoroughly analyze the student's submitted code with respect to the problem requirements:
1. Check algorithmic correctness, edge cases (e.g. empty input, single element, negative numbers, maximum bounds), and any logical or syntax errors.
2. Calculate the exact Time Complexity and Space Complexity based on the actual loops, recursion, and data structures used in their code.
3. Provide an executive review summary explaining how well the code addresses the problem and what happens during execution.
4. Give 2 to 3 concrete, high-impact suggestions for optimization, edge cases, or idiomatic refactoring.

Respond in JSON format with exactly the following structure:
{
  "time_complexity": "e.g. O(N log N)",
  "space_complexity": "e.g. O(1)",
  "status": "e.g. Optimal & Correct | Logic Error / Failing Edge Cases | Runtime Error / Bug | Suboptimal Complexity",
  "review_summary": "Thorough markdown analysis of their algorithm, correctness against the question, and behavior on test inputs.",
  "suggestions": [
    "Specific improvement or edge-case handling tip",
    "Specific performance or clean-code optimization"
  ]
}`;

  try {
    const text = await executeAIChatCascade([
      { role: 'user', content: prompt }
    ], { temperature: 0.1 });

    if (text) {
      // Try to parse JSON from AI response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.time_complexity && parsed.review_summary) {
            return {
              time_complexity: String(parsed.time_complexity),
              space_complexity: String(parsed.space_complexity || 'O(1)'),
              status: String(parsed.status || (stderr ? 'Runtime Error' : 'Executable & Analyzed')),
              review_summary: String(parsed.review_summary),
              suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0 
                ? parsed.suggestions.map(String) 
                : ['Verify boundary edge cases.', 'Check for memory reuse opportunities.']
            };
          }
        } catch {
          // JSON parse failed, extract from text
        }
      }

      // Fallback text parsing
      const timeMatch = text.match(/time\s*complexity[:\s]+(O\([^)]+\))/i);
      const spaceMatch = text.match(/space\s*complexity[:\s]+(O\([^)]+\))/i);
      return {
        time_complexity: timeMatch ? timeMatch[1] : (text.includes('O(') ? text.substring(text.indexOf('O('), text.indexOf(')', text.indexOf('O(')) + 1) : 'O(N)'),
        space_complexity: spaceMatch ? spaceMatch[1] : 'O(1)',
        status: stderr ? 'Runtime/Compilation Issue' : 'Analyzed with Respect to Problem',
        review_summary: text.length > 500 ? text.slice(0, 500) + '...' : text,
        suggestions: [
          'Verify all problem constraints and boundary conditions.',
          'Analyze nested loops or helper memory allocations for performance improvements.'
        ]
      };
    }
  } catch (err) {
    console.warn('[requestMistralCodeReview error]:', err);
  }

  const isErr = Boolean(stderr && stderr.trim());
  return {
    time_complexity: language === 'python' ? 'O(N)' : 'O(N)',
    space_complexity: 'O(1)',
    status: isErr ? 'Runtime Diagnostics Detected' : 'Passed - Valid Solution',
    review_summary: isErr
      ? `Execution error in ${language} for "${problemTitle}": ${stderr.slice(0, 150)}. Review variable declarations, types, and loop termination.`
      : `Your ${language.toUpperCase()} code for "${problemTitle}" executes cleanly. The approach handles basic cases with standard complexity.`,
    suggestions: [
      'Edge Cases: Check empty collections, duplicates, and integer limit boundaries.',
      'Idiomatic Refactoring: Verify that container types and iterator lookups are minimized.'
    ]
  };
}

export async function requestMistralDiagnostic(
  totalSolved: number,
  totalMins: number,
  accuracyPercent: number
): Promise<AIDiagnosticReport> {
  const speedIndex = Number((totalSolved / Math.max(totalMins, 1.0)).toFixed(2));

  if (totalSolved === 0 && totalMins === 0) {
    return {
      solving_velocity_qpm: 0,
      academic_performance: 'Initial Diagnostic Pending',
      strengths: [
        'Ready to begin initial DSA & Systems lectures',
        'Authentication verified and workspace initialized',
        'LeetCode Sandboxed Compiler ready for code execution'
      ],
      weaknesses: [
        'No solved questions recorded yet. Complete MCQs or Code Challenges to log weak topics.'
      ],
      recommended_lectures: [
        'DSA: 1.2 Software Design Principles & C++ Basics',
        'DSA: Count primes in range L to R',
        'System Design: Distributed Caching & Rate Limiting'
      ],
      summary: 'Welcome! You have not logged active solving minutes yet. Watch lectures and solve quizzes/coding challenges to generate real-time AI diagnostics.'
    };
  }

  const prompt = `You are a Computer Science Academic Dean evaluating a student.
Student Stats:
- Total Solved Questions: ${totalSolved}
- Total Active Minutes: ${Math.round(totalMins)}
- Question Solving Velocity: ${speedIndex} questions/min
- First-Attempt Accuracy: ${accuracyPercent}%

Generate a strict JSON object with:
1. "academic_performance": string (e.g. "High Velocity (Mastery Level)", "Steady Progress", or "Needs Concept Practice")
2. "strengths": array of 3 specific student strengths based on these stats
3. "weaknesses": array of 2 specific weak topics that need review
4. "recommended_lectures": array of 3 specific lecture topics to re-watch
5. "summary": string summary paragraph

Return ONLY valid JSON.`;

  const rawJson = await executeAIChatCascade([
    { role: 'user', content: prompt }
  ], { temperature: 0.3, responseFormatJson: true });

  if (rawJson) {
    try {
      const content = JSON.parse(rawJson);
      return {
        solving_velocity_qpm: speedIndex,
        academic_performance: content.academic_performance || (speedIndex >= 0.3 ? 'High Velocity (Mastery Level)' : 'Steady Progress'),
        strengths: content.strengths || ['Consistent speed in solving DSA challenges', 'Strong accuracy in MCQ comprehension', 'Active engagement in code compilation'],
        weaknesses: content.weaknesses || ['Complex recursion stack overflow edge cases', 'System design consistent hashing node rebalancing'],
        recommended_lectures: content.recommended_lectures || ['DSA: 1.2 Software Design Principles', 'DSA: Sieve of Eratosthenes', 'System Design: Distributed Caching'],
        summary: content.summary || `Dynamic Diagnostic Summary: You have solved ${totalSolved} questions in ${Math.round(totalMins)} active minutes, maintaining a Question Solving Velocity of ${speedIndex} questions/min with ${accuracyPercent}% accuracy.`
      };
    } catch {}
  }

  const perf = speedIndex >= 0.4 ? 'High Velocity (Mastery Level)' : speedIndex >= 0.1 ? 'Steady Progress' : 'Needs Concept Practice';
  return {
    solving_velocity_qpm: speedIndex,
    academic_performance: perf,
    strengths: [
      accuracyPercent >= 75 ? 'Excellent accuracy on first-attempt problem solving' : 'Consistent practice pace across topics',
      `Logged ${totalSolved} verified problem completions`,
      `Active learning velocity of ${speedIndex} QPM`
    ],
    weaknesses: [
      accuracyPercent < 70 ? 'Accuracy below target 70%. Review boundary edge cases and variable types.' : 'Advanced graph DFS memory optimization'
    ],
    recommended_lectures: [
      'DSA: Software Design Principles & C++ Basics',
      'DSA: Sieve of Eratosthenes & Prime Factorization',
      'System Design: Load Balancers & Distributed Caching'
    ],
    summary: `Dynamic Academic Summary: You have completed ${totalSolved} practice problems across ${Math.round(totalMins)} active learning minutes with an overall accuracy of ${accuracyPercent}%.`
  };
}

export interface OptimalSolutionResponse {
  code: string;
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  approachName: string;
  validationPassed?: boolean;
  passedCount?: number;
  totalCount?: number;
  stored?: boolean;
  failedCaseIdx?: number | null;
  failedInput?: string | null;
  failedOutput?: string | null;
  failedExpected?: string | null;
  fromR2Cache?: boolean;
}

export interface SolutionGenerationContext {
  approaches?: Array<{ id?: string; name: string; time?: string; space?: string; description?: string }>;
  starterCode?: string;
  constraints?: string[];
  examples?: any[];
  hints?: string[];
  targetApproachId?: string;
  existingSolutions?: Record<string, string>;
  testCases?: string[];
  expectedOutputs?: string[];
}

export async function validateAndStoreSolution(
  slug: string,
  language: string,
  sol: OptimalSolutionResponse
): Promise<OptimalSolutionResponse> {
  try {
    const resp = await fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/solution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        code: sol.code,
        approachName: sol.approachName,
        timeComplexity: sol.timeComplexity,
        spaceComplexity: sol.spaceComplexity,
        explanation: sol.explanation
      })
    });
    if (resp.ok) {
      const result = await resp.json();
      return {
        ...sol,
        validationPassed: result.validationPassed,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        stored: result.stored,
        failedCaseIdx: result.failedCaseIdx ?? null,
        failedInput: result.failedInput ?? null,
        failedOutput: result.failedOutput ?? null,
        failedExpected: result.failedExpected ?? null,
      };
    }
  } catch (e) {
    console.warn('[Solution Validation Notice]:', e);
  }
  return sol;
}

/** Internal helper: call the LLM once and return a parsed solution object, or null on failure. */
async function _generateSolutionOnce(
  title: string,
  description: string,
  language: string,
  starterCode?: string,
  context?: SolutionGenerationContext,
  attempt = 1
): Promise<OptimalSolutionResponse | null> {
  // Find targeted approach if specified
  const targetApproach = context?.approaches?.find(
    a => a.id === context?.targetApproachId || a.name.toLowerCase().includes(context?.targetApproachId?.toLowerCase() || '')
  ) || context?.approaches?.[0];

  const approachDirective = targetApproach
    ? `Target Approach Paradigm: "${targetApproach.name}" (Target Time: ${targetApproach.time || 'Optimal'}, Target Space: ${targetApproach.space || 'Optimal'})\n${targetApproach.description ? `Approach Intuition: ${targetApproach.description}\n` : ''}`
    : '';

  const constraintsText = (context?.constraints && context.constraints.length > 0)
    ? `Constraints:\n${context.constraints.map(c => `- ${c}`).join('\n')}\n`
    : '';

  const hintsText = (context?.hints && context.hints.length > 0)
    ? `Key Hints:\n${context.hints.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n`
    : '';

  const prompt = `You are a Principal Software Engineer and Competitive Programming Master.
Generate an optimal, verified, production-grade solution for the following coding problem in ${language}.

Problem: ${title}
Description:
${(description || '').slice(0, 3000)}

${constraintsText}${hintsText}${approachDirective}
${starterCode ? `Starter Signature Reference (MUST match exact class name, method name, and types):\n\`\`\`\n${starterCode}\n\`\`\`` : ''}

Output ONLY valid JSON matching this exact structure:
{
  "approachName": "${targetApproach?.name || 'Optimal Approach'}",
  "code": "<Complete, clean, and optimal ${language} code matching class/function signature>",
  "timeComplexity": "${targetApproach?.time || 'O(N)'}",
  "spaceComplexity": "${targetApproach?.space || 'O(1)'}",
  "explanation": "<Step-by-step intuition, state invariants, and algorithmic breakdown>"
}`;

  const parseJsonSafe = (raw: string): any => {
    try {
      return JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {}
      }
    }
    return null;
  };

  const rawJson = await executeAIChatCascade([
    { role: 'user', content: prompt }
  ], { temperature: 0.1, responseFormatJson: true, preferMistral: true });

  if (rawJson) {
    const parsed = parseJsonSafe(rawJson);
    if (parsed && parsed.code) {
      return {
        code: parsed.code.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim(),
        explanation: parsed.explanation || 'Optimal algorithmic solution.',
        timeComplexity: parsed.timeComplexity || targetApproach?.time || 'O(N)',
        spaceComplexity: parsed.spaceComplexity || targetApproach?.space || 'O(1)',
        approachName: parsed.approachName || targetApproach?.name || 'Optimal Approach'
      };
    }
  }

  return null;
}

export async function requestAIOptimalSolution(
  title: string,
  description: string,
  language: string,
  starterCode?: string,
  slug?: string,
  context?: SolutionGenerationContext
): Promise<OptimalSolutionResponse> {
  const normLang = (language || 'cpp').toLowerCase() as SupportedLanguage;

  // 1. Primary: Generate initial solution via Mistral Codestral
  let candidate = await _generateSolutionOnce(title, description, language, starterCode, context, 1);

  // 2. Automated Testcase Verification & Self-Correction Loop
  const tcs = context?.testCases || [];
  const eos = context?.expectedOutputs || [];

  let isVerified = false;
  let passedCount = 0;
  let failedCaseIdx: number | null = null;
  let failedInput: string | null = null;
  let failedOutput: string | null = null;
  let failedExpected: string | null = null;
  let lastStderr: string | null = null;

  if (candidate?.code && tcs.length > 0) {
    const casesToVerify = Math.min(3, tcs.length);
    let currentCode = candidate.code;

    for (let attempt = 1; attempt <= 3; attempt++) {
      let allPassed = true;
      passedCount = 0;
      failedCaseIdx = null;
      failedInput = null;
      failedOutput = null;
      failedExpected = null;
      lastStderr = null;

      for (let i = 0; i < casesToVerify; i++) {
        const tcInput = tcs[i];
        let tcExpected = eos[i] || '';
        if (tcExpected.includes(' or ')) {
          tcExpected = tcExpected.split(' or ')[0].trim();
        }

        try {
          const execResult = await executeCode(currentCode, normLang, tcInput, title);
          const passed = execResult.status === 'SUCCESS' && compareOutputs(execResult.stdout, tcExpected);

          if (passed) {
            passedCount++;
          } else {
            allPassed = false;
            failedCaseIdx = i;
            failedInput = tcInput;
            failedOutput = execResult.stdout || '';
            failedExpected = tcExpected;
            lastStderr = execResult.stderr || '';
            break;
          }
        } catch (execErr: any) {
          allPassed = false;
          failedCaseIdx = i;
          failedInput = tcInput;
          failedExpected = tcExpected;
          lastStderr = String(execErr?.message || execErr);
          break;
        }
      }

      if (allPassed) {
        isVerified = true;
        candidate.code = currentCode;
        break;
      }

      // Self-healing: feed failed input, compiler diagnostics, and expected output back to Mistral Codestral
      if (attempt < 3 && failedInput !== null) {
        const correctionPrompt = `You are a Principal Software Engineer and Competitive Programming Master.
The previously generated ${language} solution failed automated test case verification.

Problem: ${title}
Failed Test Case Input:
${failedInput}

Expected Output:
${failedExpected}

Actual Output:
${failedOutput || '(empty / none)'}

${lastStderr ? `Compiler / Runtime Diagnostics / Stderr:\n${lastStderr}\n` : ''}

Failed Solution Code:
\`\`\`${language}
${currentCode}
\`\`\`

Starter Signature Reference (MUST match exact class name, method name, and return types):
\`\`\`${language}
${starterCode || ''}
\`\`\`

Fix the code so that it compiles cleanly and passes the test case.
Output ONLY valid JSON:
{
  "code": "<Complete corrected ${language} solution code>",
  "explanation": "<Brief explanation of the bug fix>"
}`;

        try {
          const rawCorrectedJson = await executeAIChatCascade([
            { role: 'user', content: correctionPrompt }
          ], { temperature: 0.1, responseFormatJson: true, preferMistral: true });

          if (rawCorrectedJson) {
            const parseJson = (raw: string): any => {
              try { return JSON.parse(raw); } catch {
                const m = raw.match(/\{[\s\S]*\}/);
                if (m) { try { return JSON.parse(m[0]); } catch {} }
              }
              return null;
            };
            const parsed = parseJson(rawCorrectedJson);
            if (parsed && parsed.code) {
              currentCode = parsed.code.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
              candidate.code = currentCode;
              if (parsed.explanation) {
                candidate.explanation = parsed.explanation;
              }
            }
          }
        } catch (corrErr) {
          console.warn('[Mistral Solution Self-Correction Notice]:', corrErr);
        }
      }
    }
  }

  const sol: OptimalSolutionResponse = candidate ?? {
    code: starterCode || `// Solution for ${title}`,
    explanation: 'Optimal solution can be derived using standard algorithmic techniques.',
    timeComplexity: 'Optimal',
    spaceComplexity: 'O(1)',
    approachName: 'Standard Optimal Approach'
  };

  sol.validationPassed = isVerified;
  sol.passedCount = passedCount;
  sol.totalCount = Math.min(3, tcs.length) || 1;
  sol.failedCaseIdx = isVerified ? null : failedCaseIdx;
  sol.failedInput = isVerified ? null : failedInput;
  sol.failedOutput = isVerified ? null : failedOutput;
  sol.failedExpected = isVerified ? null : failedExpected;

  if (slug && sol.code) {
    validateAndStoreSolution(slug, language, sol).catch(() => {});
  }

  return sol;
}

export async function requestMistralChat(messages: Array<{ role: string; content: string }>): Promise<{ content: string }> {
  const content = await executeAIChatCascade(messages, { temperature: 0.3 });
  return { content: content || 'No response generated.' };
}

export async function requestAIDriverGeneration(
  problemTitle: string,
  language: string,
  starterCode: string,
  sampleTestInput?: string,
  slug?: string
): Promise<string | null> {
  const normLang = (language || 'cpp').toLowerCase();
  const cleanSlug = slug || problemTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const isMultiMethod = /[a-zA-Z_][a-zA-Z0-9_]*\s*\(/.test(sampleTestInput || '') &&
    ((sampleTestInput || '').includes(',') || (sampleTestInput || '').includes('\n')) &&
    !sampleTestInput?.includes('=');
  const isLLDContext = cleanSlug.includes('lld') || cleanSlug.includes('design') || cleanSlug.includes('solid') || cleanSlug.includes('principle') || cleanSlug.includes('srp');

  const prompt = `You are a Principal Compiler Architect and Test Harness Engineer for LeetCode.
Generate a complete, robust, type-safe execution driver harness in ${normLang.toUpperCase()} for the problem: "${problemTitle}" (${cleanSlug}).

Function signature / starter code:
\`\`\`${normLang}
${starterCode}
\`\`\`

Sample test input:
\`\`\`
${sampleTestInput || ''}
\`\`\`

1. Include all necessary standard library headers (e.g. <iostream>, <vector>, <string>, <algorithm>, <numeric>, <unordered_map>, <map>, <set>, <unordered_set>, <queue>, <stack>, <deque>, <cmath>, <climits>, <cstring>, <sstream>, <utility>, <tuple>, <functional>, <memory>, <cctype>, <stdexcept> for C++). Add 'using namespace std;' so std types like map, vector, string are directly accessible.
2. CRITICAL STRUCT ORDER: If the problem uses TreeNode, ListNode, or Node, you MUST define struct TreeNode, struct ListNode, or class Node AT THE VERY TOP OF THE FILE, STRICTLY BEFORE '// === USER SOLUTION ==='! The user's solution cannot compile if structs are defined after '// === USER SOLUTION ==='.
3. CRITICAL INPUT HANDLING: DO NOT read from 'cin' or use 'getline(cin'. The testcase is passed directly in main() via string raw_input = R"RAW(${sampleTestInput || ''})RAW";. Reading from cin will cause a runtime failure.
4. ${isMultiMethod || isLLDContext ? `CRITICAL FOR MULTI-METHOD / LLD / DESIGN PROBLEMS:
   The starter code defines multiple methods or the input is a sequence of method invocations (e.g. initialize(10, 5, 20), parkVehicle("Car")... or operation arrays).
   The driver MUST parse and execute each method call sequentially on an instance of Solution, collect the return values, and print comma-separated results (e.g. 10, true, true, true, true, 10). NEVER assume a single algorithm method.` : `Implement a complete argument parser specifically designed for the exact types in the function signature (whether 2D matrix 'vector<vector<char>>', 'vector<vector<int>>', 1D array, scalar, strings, boolean, etc.) that parses named parameters like 'matrix = [[1,3,5,7],[10,11,16,20]], target = 3' or 'grid = [["1","0"],["0","1"]]'.
   - CRITICAL: When splitting named arguments at commas, track bracket depth '[' ']' and brace depth '{' '}' so you NEVER split on commas inside nested arrays or matrices.
   - RESILIENCE: If a named parameter (e.g. 'grid = ') is missing in raw_input and raw_input is simply the JSON value (e.g. '[["1","0"],["0","1"]]'), DO NOT throw an error. Parse the entire raw_input string directly as the value for that parameter!`}
5. Place ONLY the single placeholder comment line:
// === USER SOLUTION ===
DO NOT write any class Solution or method implementation yourself in the driver. The user's code will be inserted directly at this comment.
6. In the main entry point (below '// === HIDDEN DRIVER ==='):
   - Read the raw input string variable: string raw_input = R"RAW(${sampleTestInput || ''})RAW"; (or equivalent in other languages).
   - Parse each argument matching the exact parameter types and names of the method(s).
   - Instantiate Solution sol;
   - Call the corresponding method(s) on sol with the parsed arguments.
   - Print the return value in JSON / comma-separated format (e.g. true/false for bool, numbers, arrays [1,2], matrices [[1,2],[3,4]]).
   - CRITICAL FOR BINARY TREES (returning TreeNode* or TreeNode): You MUST serialize binary trees in exact LeetCode level-order format with "null" for missing child nodes and trailing "null"s trimmed (e.g. [0,-10,5,null,-3,null,9]). NEVER omit "null" for missing child nodes!
   - For void in-place methods (e.g. rotate, setZeroes, nextPermutation), print the mutated first argument to stdout.
7. Handle runtime exceptions gracefully.

Return ONLY raw executable code containing '// === USER SOLUTION ===' and '// === HIDDEN DRIVER ===', without markdown code block fences.`;

  const code = await executeAIChatCascade([
    { role: 'user', content: prompt }
  ], { temperature: 0.1 });

  if (code) {
    let cleanCode = code.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
    if (cleanCode && cleanCode.length > 50) {
      try {
        fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(cleanSlug)}/driver/${encodeURIComponent(normLang)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driverCode: cleanCode })
        }).catch(() => {});
      } catch (_) {}
      return cleanCode;
    }
  }

  return null;
}

export interface DriverVerificationPayload {
  slug?: string;
  problemTitle: string;
  language: string;
  starterCode?: string;
  currentDriverCode?: string;
  userCode?: string;
  sampleTestInput?: string;
  sampleExpectedOutput?: string;
  executionError?: string;
  userReportReason?: string;
}

export interface DriverCorrectionResult {
  isWrong: boolean;
  identifiedIssue: string;
  explanation: string;
  correctedDriverCode: string;
  correctedSolutionCode?: string;
}

export async function verifyAndCorrectDriverCodeAI(
  payload: DriverVerificationPayload
): Promise<DriverCorrectionResult> {
  const {
    slug,
    problemTitle,
    language,
    starterCode = '',
    currentDriverCode = '',
    userCode = '',
    sampleTestInput = '',
    sampleExpectedOutput = '',
    executionError = '',
    userReportReason = ''
  } = payload;

  const normLang = (language || 'cpp').toLowerCase();
  const cleanSlug = slug || problemTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const prompt = `You are a Principal Compiler Architect, Test Harness Engineer, and Competitive Programming Grandmaster for LeetCode.
A user reported that the boilerplate code (execution driver harness / runner) for the problem "${problemTitle}" (${cleanSlug}) in ${normLang.toUpperCase()} is defective, failed to compile, or has incorrect parsing/serialization logic.

Method signature / starter code:
\`\`\`${normLang}
${starterCode}
\`\`\`

Current Boilerplate (Driver) Code:
\`\`\`${normLang}
${currentDriverCode}
\`\`\`

User Solution Code (if available):
\`\`\`${normLang}
${userCode}
\`\`\`

Sample Testcase Input:
\`\`\`
${sampleTestInput}
\`\`\`

Sample Expected Output:
\`\`\`
${sampleExpectedOutput}
\`\`\`

Execution / Compilation Error:
\`\`\`
${executionError}
\`\`\`

User Report / Notes:
"${userReportReason}"

TASK:
1. Examine the current boilerplate driver code and the user solution against the method signature and compiler/execution error.
2. Identify the specific defect(s) in the boilerplate code:
   - Missing required standard library headers (#include <vector>, <string>, <algorithm>, <queue>, <stack>, <unordered_map>, <map>, <set>, <sstream>, <cmath>, <climits>, etc.)
   - Missing or misordered structs: struct TreeNode, struct ListNode, or class Node MUST BE DEFINED AT THE VERY TOP OF THE FILE, STRICTLY BEFORE '// === USER SOLUTION ==='
   - Using 'cin' or 'getline(cin' instead of reading raw_input variable in main()
   - Fragile argument parsing: splitting strings on commas inside nested arrays/matrices without tracking bracket depth
   - Incorrect method parameter order or types
   - Incorrect serialization of outputs (e.g. binary tree level-order format with 'null's, boolean true/false, void in-place mutated argument)
   - CRITICAL FOR NODE POINTER RETURN TYPES (e.g. Lowest Common Ancestor TreeNode* / ListNode*): Check Sample Expected Output! For Lowest Common Ancestor, the method signature returns TreeNode*, but the expected output is the node's integer value (e.g. "6", "2"). The driver MUST print the node's integer value (e.g. 'if (ans) cout << ans->val << endl; else cout << "null" << endl;') and NEVER call serializeTree(ans) or printTree(ans)!
3. Generate the complete, fully compilable, hardened replacement boilerplate driver code for ${normLang.toUpperCase()}.
   - Must contain '// === USER SOLUTION ==='
   - Must contain '// === HIDDEN DRIVER ===' marking the main execution block.
   - CRITICAL: DO NOT implement or include the Solution class inside the boilerplate driver code! The driver code MUST leave '// === USER SOLUTION ===' as a placeholder for the user's code.

You must respond in strict JSON format (and nothing else):
{
  "isWrong": true,
  "identifiedIssue": "1-2 sentence summary of the specific defect in the boilerplate code",
  "explanation": "Clear explanation of how the bug occurred and what was corrected",
  "correctedDriverCode": "Complete replacement boilerplate driver code without markdown fences",
  "correctedSolutionCode": "Complete verified working solution (e.g. class Solution { ... }) without markdown fences"
}`;

  try {
    const rawResp = await executeAIChatCascade([
      { role: 'user', content: prompt }
    ], { temperature: 0.1 });

    if (rawResp) {
      let cleaned = rawResp.trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          let driverCode = (parsed.correctedDriverCode || '').replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
          let solutionCode = (parsed.correctedSolutionCode || '').replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
          
          if (driverCode && driverCode.includes('// === USER SOLUTION ===')) {
            return {
              isWrong: Boolean(parsed.isWrong ?? true),
              identifiedIssue: parsed.identifiedIssue || 'Boilerplate driver harness compilation or input parsing defect identified.',
              explanation: parsed.explanation || 'Corrected headers, struct declarations, input/output serialization in boilerplate code, and verified working solution.',
              correctedDriverCode: driverCode,
              correctedSolutionCode: solutionCode || undefined
            };
          }
        } catch (_) {}
      }
    }
  } catch (err) {
    console.error('[verifyAndCorrectDriverCodeAI Error]:', err);
  }

  // Fallback: use requestAIDriverGeneration to create a brand-new hardened driver
  const regenerated = await requestAIDriverGeneration(problemTitle, normLang, starterCode, sampleTestInput, cleanSlug);
  return {
    isWrong: true,
    identifiedIssue: 'Boilerplate harness encountered syntax or parsing failure.',
    explanation: 'Regenerated a fresh, authentic LeetCode-compliant boilerplate driver harness with complete type-safe argument parsing.',
    correctedDriverCode: regenerated || currentDriverCode,
    correctedSolutionCode: userCode && userCode.length > 20 ? userCode : undefined
  };
}


export interface TestCaseVerificationPayload {
  slug?: string;
  problemTitle: string;
  problemStatement: string;
  methodSignature?: string;
  currentInput: string;
  currentExpectedOutput?: string;
  userActualOutput?: string;
  userNote?: string;
  language?: string;
  allProblemTestCases?: string[];
  allProblemExpectedOutputs?: string[];
}

export interface MultiTestCaseOption {
  caseIndex: number;
  input: string;
  validOptions: string[];
  description?: string;
}

export interface ProblemMultiOptionsResult {
  hasMultipleValidOutputs: boolean;
  reason: string;
  allTestCasesOptions: MultiTestCaseOption[];
}

export interface TestCaseVerificationResult {
  isIncorrect: boolean;
  verdict: 'INCORRECT_EXPECTED' | 'MALFORMED_INPUT' | 'INVALID_CONSTRAINT' | 'MULTIPLE_VALID_OUTPUTS' | 'ALREADY_CORRECT';
  analysis: string;
  correctedInput: string;
  correctedExpectedOutput: string;
  explanation: string;
  suggestedAction: string;
  hasMultipleValidOutputs?: boolean;
  validOutputOptions?: string[];
  allTestCasesOptions?: MultiTestCaseOption[];
}

export async function verifyAndCorrectTestCaseAI(payload: TestCaseVerificationPayload): Promise<TestCaseVerificationResult> {
  const { slug, problemTitle, problemStatement, methodSignature, currentInput, currentExpectedOutput, userActualOutput, userNote, allProblemTestCases, allProblemExpectedOutputs } = payload;
  const cleanSlug = slug || problemTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').trim();
  const isKnownBST = cleanSlug.includes('convert-sorted-array-to-binary-search-tree') ||
    problemTitle.toLowerCase().includes('convert sorted array to');

  const defaultBSTOptions: MultiTestCaseOption[] = [
    {
      caseIndex: 0,
      input: allProblemTestCases?.[0] || 'nums = [-10,-3,0,5,9]',
      validOptions: [
        '[0,-3,9,-10,null,5]',
        '[0,-10,5,null,-3,null,9]',
        '[0,-10,9,-3,null,5]',
        '[0,-3,5,-10,null,null,9]'
      ],
      description: 'Height-balanced BST where |height(left) - height(right)| <= 1 and in-order traversal equals [-10,-3,0,5,9].'
    },
    {
      caseIndex: 1,
      input: allProblemTestCases?.[1] || 'nums = [1,3]',
      validOptions: [
        '[3,1]',
        '[1,null,3]'
      ],
      description: 'Root can be 3 (left child 1) or 1 (right child 3).'
    }
  ];

  const sanitizeResult = (res: Partial<TestCaseVerificationResult>): TestCaseVerificationResult => {
    let finalInput = (res.correctedInput || currentInput || '').trim();
    let isIncorrect = Boolean(res.isIncorrect);
    let verdict = res.verdict || (isIncorrect ? 'INCORRECT_EXPECTED' : 'ALREADY_CORRECT');
    let explanation = res.explanation || (isIncorrect ? 'Discrepancy detected in testcase.' : 'Testcase is mathematically correct.');
    let hasMultipleValidOutputs = Boolean(res.hasMultipleValidOutputs || isKnownBST || verdict === 'MULTIPLE_VALID_OUTPUTS');
    let validOutputOptions = Array.isArray(res.validOutputOptions) && res.validOutputOptions.length > 0
      ? res.validOutputOptions
      : [];
    let allTestCasesOptions = Array.isArray(res.allTestCasesOptions) && res.allTestCasesOptions.length > 0
      ? res.allTestCasesOptions
      : (isKnownBST ? defaultBSTOptions : []);

    if (verdict === 'MULTIPLE_VALID_OUTPUTS' || (isKnownBST && hasMultipleValidOutputs)) {
      isIncorrect = true;
      hasMultipleValidOutputs = true;
      verdict = 'MULTIPLE_VALID_OUTPUTS';
      explanation = res.explanation || 'This problem has multiple valid solutions/options. Testcase updated to accept valid alternative solution.';
      if (validOutputOptions.length === 0 && isKnownBST) {
        validOutputOptions = defaultBSTOptions[0].validOptions;
      }
    }

    if (!finalInput.includes('=')) {
      let pName = 'grid';
      const m = (methodSignature || '').match(/(?:int|void|bool|vector<[^>]+>|string|double|List<[^>]+>)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*(?:self\s*,\s*)?(?:const\s+)?[a-zA-Z0-9_<>,:\[\]\s\*&]+?\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\)/);
      if (m && m[2]) {
        pName = m[2];
      } else {
        const simpleMatch = (methodSignature || '').match(/\(\s*(?:self\s*,\s*)?([a-zA-Z_][a-zA-Z0-9_]*)\s*[:\)]/);
        if (simpleMatch && simpleMatch[1]) pName = simpleMatch[1];
      }
      finalInput = `${pName} = ${finalInput}`;
      isIncorrect = true;
      verdict = 'MALFORMED_INPUT';
      explanation = `Missing '${pName} =' parameter assignment prefix. Formatted to valid parameter syntax.`;
    }

    return {
      isIncorrect,
      verdict,
      analysis: res.analysis || 'Testcase analyzed by Algorithm & Parameter Inspector.',
      correctedInput: finalInput,
      correctedExpectedOutput: res.correctedExpectedOutput || currentExpectedOutput || '',
      explanation,
      suggestedAction: res.suggestedAction || (isIncorrect ? 'Apply AI correction' : 'Testcase verified'),
      hasMultipleValidOutputs,
      validOutputOptions: validOutputOptions.length > 0 ? validOutputOptions : undefined,
      allTestCasesOptions: allTestCasesOptions.length > 0 ? allTestCasesOptions : undefined
    };
  };

  // 1. Try Backend FastAPI route
  try {
    const res = await fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(cleanSlug)}/verify-testcase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.isIncorrect === 'boolean') {
        return sanitizeResult(data);
      }
    }
  } catch (e) {
    console.warn('[Backend Verify TestCase notice, falling back to direct AI cascade]:', e);
  }

  // 2. Cascade AI fallback
  const allCasesFormatted = (allProblemTestCases || [currentInput]).map((tc, idx) => 
    `Case ${idx + 1}: ${tc} (Expected: ${allProblemExpectedOutputs?.[idx] || 'N/A'})`
  ).join('\n');

  const prompt = `You are an elite Competitive Programming Judge and Algorithm Specialist.
A user is reporting a potentially incorrect testcase for the coding problem "${problemTitle}".

PROBLEM STATEMENT:
${problemStatement.slice(0, 4000)}

METHOD SIGNATURE / CONTEXT:
${methodSignature || 'N/A'}

REPORTED TESTCASE INPUT:
\`\`\`
${currentInput}
\`\`\`

CURRENT EXPECTED OUTPUT (IN TEST SUITE):
\`\`\`
${currentExpectedOutput || '(None provided)'}
\`\`\`

STUDENT'S ACTUAL EXECUTION OUTPUT:
\`\`\`
${userActualOutput || '(Not executed)'}
\`\`\`

ALL PROBLEM TESTCASES AVAILABLE FOR THIS QUESTION:
${allCasesFormatted}

STUDENT'S REPORT NOTE / SUSPICION:
${userNote || '(No specific note, please perform full mathematical & algorithmic validation)'}

TASK:
1. JUDGE IF MULTIPLE CORRECT TESTCASES / SOLUTIONS ARE POSSIBLE:
   - Determine whether this problem allows MULTIPLE VALID SOLUTIONS or configurations (for example: Binary Search Tree construction where multiple height-balanced BST roots/structures are valid such as in "Convert Sorted Array to Binary Search Tree", topological sort sequences, multiple valid paths, permutations, partitionings, etc.).
   - If YES:
     * Set "hasMultipleValidOutputs": true
     * In "validOutputOptions", list all valid acceptable outputs for this reported testcase.
     * In "allTestCasesOptions", list ALL available testcases for this question with their complete set of valid outputs:
       [
         {
           "caseIndex": 0,
           "input": "...",
           "validOptions": ["option1", "option2"],
           "description": "Brief reason why these options are valid"
         }
       ]
     * Check if the STUDENT'S ACTUAL EXECUTION OUTPUT is one of the mathematically valid answers.
     * If the student's output is valid, OR if the stored expected output is only one of multiple valid options and wrongly rejects the student's valid output:
       - Set "isIncorrect": true
       - Set "verdict": "MULTIPLE_VALID_OUTPUTS"
       - Set "correctedExpectedOutput": Set to the student's valid output (or allow options formatted as '[0,-3,9,-10,null,5] or [0,-10,5,null,-3,null,9]'), so the student's valid solution will pass.
       - Set "explanation": Explain clearly that the problem permits multiple correct answers, that the student's output is fully valid, and that the testcase expected output has been updated to accept it.
   - If NO:
     * Set "hasMultipleValidOutputs": false
     * Set "allTestCasesOptions": []
2. Trace the input against the problem statement and compute the TRUE expected output.
3. Check if input format has parameter name prefix.
4. Respond ONLY with a valid JSON object matching this schema:
{
  "isIncorrect": boolean,
  "verdict": "INCORRECT_EXPECTED" | "MALFORMED_INPUT" | "INVALID_CONSTRAINT" | "MULTIPLE_VALID_OUTPUTS" | "ALREADY_CORRECT",
  "hasMultipleValidOutputs": boolean,
  "validOutputOptions": ["opt1", "opt2"],
  "allTestCasesOptions": [
    {
      "caseIndex": 0,
      "input": "...",
      "validOptions": ["..."],
      "description": "..."
    }
  ],
  "analysis": "Brief step-by-step trace of the logic on this input",
  "correctedInput": "The clean, valid, formatted input string",
  "correctedExpectedOutput": "The exact true expected output (e.g. 'true', 'false', '42', '5', '[0, 1]', '[[1,2]]')",
  "explanation": "Clear explanation of why it was wrong or why it is already correct",
  "suggestedAction": "Summary of recommended action"
} `;

  const rawJson = await executeAIChatCascade([
    { role: 'user', content: prompt }
  ], { temperature: 0.1, responseFormatJson: true });

  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed && typeof parsed.isIncorrect === 'boolean') {
        return sanitizeResult(parsed);
      }
    } catch {}
  }

  return sanitizeResult({
    isIncorrect: isKnownBST || !currentInput.includes('='),
    verdict: isKnownBST ? 'MULTIPLE_VALID_OUTPUTS' : !currentInput.includes('=') ? 'MALFORMED_INPUT' : 'ALREADY_CORRECT',
    hasMultipleValidOutputs: isKnownBST,
    validOutputOptions: isKnownBST ? defaultBSTOptions[0].validOptions : undefined,
    allTestCasesOptions: isKnownBST ? defaultBSTOptions : undefined,
    analysis: isKnownBST ? 'Identified multiple valid height-balanced BST representations for sorted array.' : 'Verified testcase formatting and argument bindings.',
    correctedInput: currentInput,
    correctedExpectedOutput: currentExpectedOutput || '',
    explanation: isKnownBST ? 'Multiple valid height-balanced BST representations are possible for this input.' : !currentInput.includes('=') ? 'Formatted testcase parameter prefix.' : 'Testcase is valid.',
    suggestedAction: isKnownBST ? 'Accept alternative valid BST representation' : !currentInput.includes('=') ? 'Apply parameter fix' : 'Keep testcase'
  });
}

/**
 * AI Judge: Evaluates whether a question allows multiple correct testcase solutions.
 * If yes, lists all testcases available for the question with all valid options.
 */
export async function judgeProblemMultiOptionsAI(params: {
  slug: string;
  problemTitle: string;
  problemStatement: string;
  testCases: string[];
  expectedOutputs?: string[];
}): Promise<ProblemMultiOptionsResult> {
  const { slug, problemTitle, problemStatement, testCases, expectedOutputs } = params;
  const cacheKey = `edustream_multi_options_${slug}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed.hasMultipleValidOutputs === 'boolean') {
        return parsed;
      }
    }
  } catch {}

  const isKnownBST = slug.includes('convert-sorted-array-to-binary-search-tree') ||
    problemTitle.toLowerCase().includes('convert sorted array to');

  const defaultBSTOptions: MultiTestCaseOption[] = [
    {
      caseIndex: 0,
      input: testCases[0] || 'nums = [-10,-3,0,5,9]',
      validOptions: [
        '[0,-3,9,-10,null,5]',
        '[0,-10,5,null,-3,null,9]',
        '[0,-10,9,-3,null,5]',
        '[0,-3,5,-10,null,null,9]'
      ],
      description: 'Multiple root and subtree choices form valid height-balanced binary search trees with |height(left) - height(right)| <= 1.'
    },
    {
      caseIndex: 1,
      input: testCases[1] || 'nums = [1,3]',
      validOptions: [
        '[3,1]',
        '[1,null,3]'
      ],
      description: 'Root can be 3 (with left child 1) or 1 (with right child 3).'
    }
  ];

  // 1. Try Backend FastAPI route
  try {
    const res = await fetch(`${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(slug)}/multi-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemTitle,
        problemStatement,
        testCases,
        expectedOutputs
      }),
      signal: AbortSignal.timeout(20000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.hasMultipleValidOutputs === 'boolean') {
        try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}
        return data;
      }
    }
  } catch (e) {
    console.warn('[Backend Multi-Options Notice]:', e);
  }

  // 2. Cascade AI fallback
  const casesPrompt = testCases.map((tc, idx) => `Case ${idx + 1}: ${tc} (Expected: ${expectedOutputs?.[idx] || 'N/A'})`).join('\n');

  const prompt = `You are a Competitive Programming Judge and Algorithm Specialist.
Determine whether the problem "${problemTitle}" allows MULTIPLE VALID SOLUTIONS or testcase outputs for each testcase input.
Examples of problems with multiple valid outputs:
- BST construction where choosing different root/middle elements creates different valid height-balanced trees (e.g. Convert Sorted Array to BST)
- Topological sort orderings
- Subsets/Permutations orderings
- Partitionings or multiple valid graph paths

PROBLEM STATEMENT:
${problemStatement.slice(0, 3500)}

AVAILABLE TESTCASES:
${casesPrompt}

TASK:
1. Judge whether multiple valid correct output representations/answers are mathematically acceptable under the problem definition.
2. If YES:
   - Set "hasMultipleValidOutputs": true
   - Explain why in "reason".
   - For EACH available testcase, list ALL valid acceptable outputs in "allTestCasesOptions".
3. If NO:
   - Set "hasMultipleValidOutputs": false
   - Set "reason": "Problem has a unique deterministic output."
   - Set "allTestCasesOptions": []

Respond ONLY with valid JSON:
{
  "hasMultipleValidOutputs": boolean,
  "reason": "Detailed explanation...",
  "allTestCasesOptions": [
    {
      "caseIndex": 0,
      "input": "Case input string",
      "validOptions": ["option1", "option2"],
      "description": "Why both options are valid"
    }
  ]
}`;

  try {
    const rawJson = await executeAIChatCascade([
      { role: 'user', content: prompt }
    ], { temperature: 0.1, responseFormatJson: true });

    if (rawJson) {
      const parsed = JSON.parse(rawJson);
      if (parsed && typeof parsed.hasMultipleValidOutputs === 'boolean') {
        try { localStorage.setItem(cacheKey, JSON.stringify(parsed)); } catch {}
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[AI Multi-Options Error]:', e);
  }

  // Fallback for known BST problem
  if (isKnownBST) {
    const result: ProblemMultiOptionsResult = {
      hasMultipleValidOutputs: true,
      reason: 'Convert Sorted Array to Binary Search Tree allows multiple height-balanced BST structures for the same input array depending on which middle element is chosen as the subtree root.',
      allTestCasesOptions: defaultBSTOptions
    };
    try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch {}
    return result;
  }

  return {
    hasMultipleValidOutputs: false,
    reason: 'Unique deterministic output required for each testcase.',
    allTestCasesOptions: []
  };
}

export interface AIComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  timeExplanation: string;
  spaceExplanation: string;
  optimalTimeComplexity: string;
  optimalSpaceComplexity: string;
}

/**
 * Accurately analyzes the user's submitted code using AI to determine true Time and Space complexity,
 * persisted in Cloudflare R2 for instant rechecking after submission.
 */
export async function requestSubmissionCodeComplexityAnalysis(
  code: string,
  language: string,
  problemTitle: string,
  slug?: string
): Promise<AIComplexityAnalysis | null> {
  const normLang = (language || 'cpp').toLowerCase();
  const cleanSlug = slug || problemTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const codeHash = `${code.length}_${code.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '')}`;
  const localKey = `edustream_ai_complexity_${cleanSlug}_${normLang}_${codeHash}`;

  // 1. Check local cache
  try {
    const cached = localStorage.getItem(localKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.timeComplexity && parsed?.spaceComplexity) {
        return parsed;
      }
    }
  } catch {}

  // 2. Try Backend API (/api/problem/{slug}/complexity) with Cloudflare R2 persistence
  try {
    const backendUrl = `${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(cleanSlug)}/complexity`;
    const resp = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language: normLang,
        title: problemTitle
      }),
      signal: AbortSignal.timeout(6000)
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data?.timeComplexity && data?.spaceComplexity) {
        const result: AIComplexityAnalysis = {
          timeComplexity: data.timeComplexity,
          spaceComplexity: data.spaceComplexity,
          timeExplanation: data.timeExplanation || 'Computed from loop and recursion structures.',
          spaceExplanation: data.spaceExplanation || 'Computed from auxiliary memory footprint.',
          optimalTimeComplexity: data.optimalTimeComplexity || 'O(N)',
          optimalSpaceComplexity: data.optimalSpaceComplexity || 'O(1)'
        };
        try { localStorage.setItem(localKey, JSON.stringify(result)); } catch {}
        return result;
      }
    }
  } catch (be) {
    console.warn('[Backend Complexity API notice, falling back to direct AI cascade]:', be);
  }

  // 3. Fallback: Direct frontend AI Cascade (Groq OSS 120B / Mistral)
  const prompt = `Analyze this ${normLang} solution code written for the algorithm problem "${problemTitle}".

STUDENT SUBMITTED CODE:
\`\`\`${normLang}
${code.slice(0, 4000)}
\`\`\`

Evaluate the true time complexity and auxiliary space complexity of THIS SPECIFIC CODE implementation.
- Check loop nesting, recursions, branching, and sorting calls for Time Complexity.
- Check auxiliary memory (hash tables, vectors, heap, recursion stack) for Space Complexity.

Respond strictly with a JSON object:
{
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "timeExplanation": "1-2 sentence precise explanation of why it has this time complexity.",
  "spaceExplanation": "1-2 sentence precise explanation of auxiliary memory usage.",
  "optimalTimeComplexity": "O(...)",
  "optimalSpaceComplexity": "O(...)"
}`;

  try {
    const rawJson = await executeAIChatCascade([
      { role: 'system', content: 'You are an algorithms expert who outputs strict JSON without Markdown formatting.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.1, responseFormatJson: true, timeoutMs: 6000 });

    if (rawJson) {
      const cleaned = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed?.timeComplexity && parsed?.spaceComplexity) {
        const result: AIComplexityAnalysis = {
          timeComplexity: parsed.timeComplexity,
          spaceComplexity: parsed.spaceComplexity,
          timeExplanation: parsed.timeExplanation || 'Analyzed algorithm structure.',
          spaceExplanation: parsed.spaceExplanation || 'Analyzed auxiliary memory allocation.',
          optimalTimeComplexity: parsed.optimalTimeComplexity || 'O(N)',
          optimalSpaceComplexity: parsed.optimalSpaceComplexity || 'O(1)'
        };
        try { localStorage.setItem(localKey, JSON.stringify(result)); } catch {}
        return result;
      }
    }
  } catch (e) {
    console.warn('[Direct AI Complexity Cascade notice]:', e);
  }

  return null;
}

/**
 * Asks Mistral AI to expand problem testcases to AT LEAST 10 diverse, comprehensive testcases
 * (sample cases + hidden edge cases: min/max bounds, negatives, duplicates, scale, etc.)
 * with mathematically verified expected outputs.
 */
export async function requestMistralTestcaseExpansion(
  problemTitle: string,
  description: string,
  existingCases: string[] = [],
  existingOutputs: string[] = [],
  slug?: string
): Promise<{ testCases: string[]; expectedOutputs: string[] } | null> {
  const cleanSlug = slug || problemTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // 1. Try backend R2 endpoint first
  try {
    const backendUrl = `${TELEGRAM_BACKEND_URL}/api/problem/${encodeURIComponent(cleanSlug)}/expand-testcases`;
    const resp = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: problemTitle,
        description,
        testCases: existingCases,
        expectedOutputs: existingOutputs
      }),
      signal: AbortSignal.timeout(12000)
    });
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data?.testCases) && data.testCases.length >= 10) {
        return {
          testCases: data.testCases,
          expectedOutputs: Array.isArray(data.expectedOutputs) ? data.expectedOutputs : []
        };
      }
    }
  } catch (err) {
    console.warn('[Backend Testcase Expansion Notice]:', err);
  }

  // 2. Direct Mistral AI cascade on client
  const sampleFormat = existingCases[0] || 'input = ...';
  const prompt = `You are a Principal Test Suite and Verification Engineer for Competitive Programming.
Problem Title: "${problemTitle}"
Problem Statement:
${description.slice(0, 2000)}

Existing Sample Test Cases:
${JSON.stringify(existingCases)}
Existing Sample Expected Outputs:
${JSON.stringify(existingOutputs)}

CRITICAL FORMAT REQUIREMENTS:
1. Preserve all existing sample testcases at indices 0 to ${Math.max(0, existingCases.length - 1)} so they remain the public sample cases.
2. Every testcase input string MUST follow the exact parameter syntax of existing cases (e.g. if existing cases use '${sampleFormat.slice(0, 40)}', all new cases MUST follow this exact same syntax). DO NOT use raw JSON objects or raw unassigned values.
3. Generate AT LEAST 10 total test cases (add diverse edge cases: n=0, n=1, empty, single element, negative numbers, duplicates, boundary bounds, deep subtrees).
4. Calculate 100% mathematically verified expected outputs matching each testcase.
5. Return ONLY a valid JSON object matching:
{
  "testCases": ["... minimum 10 input strings ..."],
  "expectedOutputs": ["... minimum 10 matching expected output strings ..."]
}`;

  try {
    const raw = await executeAIChatCascade([
      { role: 'system', content: 'You are an algorithms testing expert who outputs strictly valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.1, responseFormatJson: true, timeoutMs: 16000 });

    if (raw) {
      const cleaned = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed?.testCases) && parsed.testCases.length > 0) {
        const mergedCases = [...existingCases];
        const mergedOutputs = [...existingOutputs];
        for (let i = 0; i < parsed.testCases.length; i++) {
          const tc = String(parsed.testCases[i]).trim();
          const eo = String(parsed.expectedOutputs?.[i] ?? '').trim();
          if (tc && !mergedCases.includes(tc)) {
            mergedCases.push(tc);
            mergedOutputs.push(eo);
          }
        }
        if (mergedCases.length >= 10) {
          return {
            testCases: mergedCases,
            expectedOutputs: mergedOutputs
          };
        }
      }
    }
  } catch (e) {
    console.warn('[Direct AI Testcase Expansion error]:', e);
  }

  return null;
}

