import { MISTRAL_API_KEY } from './mistral';
import { SdeLevel, InterviewRound, CuratedInterviewQuestion } from './githubInterviewData';

export interface InterviewMessage {
  id: string;
  role: 'interviewer' | 'candidate' | 'system';
  content: string;
  timestamp: string;
  stage?: 'intro' | 'problem' | 'intuition' | 'coding' | 'complexity' | 'evaluation';
}

export interface InterviewContext {
  company: string;
  level: SdeLevel;
  round: InterviewRound;
  question?: CuratedInterviewQuestion;
  candidateCode?: string;
  language?: string;
  whiteboardNotes?: string;
}

/**
 * Builds a structured, high-fidelity Principal Interviewer System Prompt.
 */
export function buildInterviewerSystemPrompt(ctx: InterviewContext): string {
  const { company, level, round, question } = ctx;

  const levelExpectations: Record<SdeLevel, string> = {
    'SDE-1': 'Expect solid algorithmic fundamentals, standard library mastery, clean syntax, basic edge cases, and time/space complexity awareness. Guide with warm, clear hints if stuck.',
    'SDE-2': 'Expect scalable designs, clean modular architecture, concurrency handling, rigorous boundary condition validation, and active trade-off discussions. Challenge them on optimizations and edge cases.',
    'SDE-3': 'Expect deep architectural vision, distributed systems consensus (CAP, Raft/Paxos), failure modes, SPOFs, cost estimations, and leadership pushback. Push them hard on bottleneck analysis and large-scale trade-offs.'
  };

  const roundGuidelines: Record<InterviewRound, string> = {
    DSA: `1. Start by presenting the problem clearly with input/output constraints.
2. DO NOT let the candidate jump straight to coding. Demand that they first explain their high-level intuition, verify constraints, and specify expected Big-O Time & Space complexities.
3. Once they explain a viable approach, invite them to write clean code in the editor.
4. When they write code, probe for edge cases (e.g. empty inputs, negative values, large scales, duplicates, overflows).
5. Keep conversational turns concise (2-3 sentences) so the candidate does 80% of the talking.`,

    LLD: `1. Present the real-world machine coding scenario (e.g., Locker System, Rate Limiter, Parking Lot, Splitwise).
2. Ask the candidate to identify core domain entities, relationships, interfaces, and SOLID principles.
3. Evaluate their class design, extensible design patterns (Strategy, Factory, Observer, Singleton), and thread-safety.
4. Ask them to write clean modular code or class definitions in the editor.
5. Probe how their design handles new requirements or concurrency.`,

    HLD: `1. Present a large-scale distributed system problem (e.g., Uber Real-Time Dispatch, Instagram News Feed Fanout, URL Shortener).
2. Guide them through: Functional/Non-functional Requirements -> Back-of-the-Envelope Math (QPS, Storage, Bandwidth) -> High-Level API Design -> Core Components (Load Balancer, Caching, DB Sharding) -> Deep-Dive into Bottlenecks & SPOFs.
3. Challenge their choice of databases (SQL vs NoSQL vs Graph), caching strategies, message queues (Kafka vs RabbitMQ), and data partitioning keys.`,

    Behavioral: `1. Conduct a rigorous behavioral evaluation using the Amazon/Google STAR method (Situation, Task, Action, Result).
2. Deeply explore conflict resolution, technical disagreements with leadership, mentorship, dealing with production outages, and ambiguity.
3. Follow up on the candidate's exact personal contribution ("What specifically did YOU do, not just your team?").`
  };

  return `You are a Principal Engineering Interviewer at ${company} conducting a live technical mock interview.
Role Level: ${level}
Round Type: ${round}

LEVEL EXPECTATION FOR ${level}:
${levelExpectations[level]}

CRITICAL INTERVIEW GUIDELINES FOR ${round}:
${roundGuidelines[round]}

${question ? `CURRENT ASSIGNED PROBLEM:\nTitle: ${question.title}\nDescription: ${question.description}\nKey Evaluation Criteria: ${question.keyEvaluationCriteria.join(', ')}` : ''}

TONE & BEHAVIOR:
- Professional, encouraging, but rigorous and analytical.
- Speak in natural, spoken conversational sentences (2-3 sentences per turn).
- Never dump the complete answer or write the code for them; give subtle progressive hints if they struggle.
- Actively react to the candidate's thoughts, validate correct intuition, and steer away from suboptimal brute force paths.`;
}

/**
 * Dispatches candidate response to Mistral AI and receives the interviewer's voice/text response.
 */
export async function sendInterviewerMessage(
  messages: InterviewMessage[],
  ctx: InterviewContext
): Promise<string> {
  const systemPrompt = buildInterviewerSystemPrompt(ctx);

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role === 'interviewer' ? 'assistant' : 'user',
      content: m.content
    }))
  ];

  // If candidate has written code, inject latest snapshot
  if (ctx.candidateCode && ctx.candidateCode.trim().length > 0) {
    formattedMessages.push({
      role: 'user',
      content: `[CANDIDATE EDITOR SNAPSHOT (${ctx.language || 'cpp'})]:\n\`\`\`\n${ctx.candidateCode}\n\`\`\`\n${ctx.whiteboardNotes ? `[WHITEBOARD/NOTES SNAPSHOT]:\n${ctx.whiteboardNotes}` : ''}`
    });
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: formattedMessages,
        temperature: 0.6,
        max_tokens: 450
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Let us continue. Could you walk me through your intuition?';
    }
  } catch (err) {
    console.error('Mistral Interviewer API Error:', err);
  }

  // Graceful fallback interviewer prompts
  return `That makes sense. Can you explain your time and space complexity tradeoffs for this approach, and how you would handle potential edge cases?`;
}

/**
 * Text-to-Speech (TTS) voice synthesizer using the browser's Web Speech API.
 */
export function speakInterviewerText(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending utterances
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block provided in editor.').replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en'));
    if (naturalVoice) utterance.voice = naturalVoice;

    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

export function stopInterviewerSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
