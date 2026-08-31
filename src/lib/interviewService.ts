import { MISTRAL_API_KEY, executeAIChatCascade } from './mistral';
import { SdeLevel, InterviewRound, TestStyle, CuratedInterviewQuestion } from './githubInterviewData';

export interface InterviewMessage {
  id: string;
  role: 'interviewer' | 'candidate' | 'system';
  content: string;
  timestamp: string;
  stage?: 'intro' | 'problem' | 'intuition' | 'coding' | 'complexity' | 'evaluation';
}

export interface CandidateDetails {
  name?: string;
  experienceYears?: number | string;
  currentRole?: string;
  techStack?: string[];
  keyProjects?: string[];
  resumeText?: string;
  customGoals?: string;
}

export interface InterviewContext {
  company: string;
  level: SdeLevel;
  round: InterviewRound;
  testStyle?: TestStyle;
  candidate?: CandidateDetails;
  question?: CuratedInterviewQuestion;
  candidateCode?: string;
  language?: string;
  whiteboardNotes?: string;
}

/**
 * Builds a structured, high-fidelity Principal Interviewer System Prompt.
 */
export function buildInterviewerSystemPrompt(ctx: InterviewContext): string {
  const { company, level, round, testStyle, question, candidate } = ctx;

  const levelExpectations: Record<SdeLevel, string> = {
    'SDE-1': 'Expect solid algorithmic fundamentals, standard library mastery, clean syntax, basic edge cases, and time/space complexity awareness. Guide with warm, clear hints if stuck.',
    'SDE-2': 'Expect scalable designs, clean modular architecture, concurrency handling, rigorous boundary condition validation, and active trade-off discussions. Challenge them on optimizations and edge cases.',
    'SDE-3': 'Expect deep architectural vision, distributed systems consensus (CAP, Raft/Paxos), failure modes, SPOFs, cost estimations, and leadership pushback. Push them hard on bottleneck analysis and large-scale trade-offs.'
  };

  const styleDirectives: Record<TestStyle, string> = {
    faang_bar_raiser: 'Adopt the strict FAANG Bar Raiser style. Demand mathematical rigor, asymptotic Big-O proofs, and rigorous probing on subtle corner cases (e.g. integer overflow, cycles, null inputs).',
    high_growth_startup: 'Adopt a pragmatic Silicon Valley Tech Lead style. Focus on speed of execution, clean maintainable code, database indexing, API ergonomics, and sensible MVP compromises.',
    fintech_low_latency: 'Adopt a Principal Low-Latency Systems Architect style. Focus heavily on concurrency race conditions, atomic operations, cache locality, thread-safety, zero allocations, and GC latency impact.',
    system_architect: 'Adopt a Global Chief Architect style. Probe deeply into geo-distributed replication, CAP theorem tradeoffs, single points of failure (SPOFs), multi-region disaster recovery, and cascading failures.'
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

    HLD: `1. Present the problem scenario and core requirements clearly.
2. CRITICAL RULE: Under NO circumstances should you reveal, suggest, or design the architecture solution yourself. Do NOT say "You should use Redis, Kafka, or Cassandra". You must make the candidate propose the design and justify every single component.
3. Guide them sequentially through: Requirements Clarification -> Capacity & QPS Estimations -> API Contracts -> High-Level Architecture -> Deep Dives into Bottlenecks, Sharding & SPOFs.
4. Ask probing questions: "What is your data partitioning key?", "Why this database over another?", "How do you handle peak traffic spikes?", "What happens if a broker fails?".
5. Keep conversational turns concise (2-3 sentences) so the candidate speaks 80% of the time.`,

    Behavioral: `1. Conduct a rigorous behavioral evaluation using the Amazon/Google STAR method (Situation, Task, Action, Result).
2. Deeply explore conflict resolution, technical disagreements with leadership, mentorship, dealing with production outages, and ambiguity.
3. Reference their resume projects and experience if provided, and probe what specifically THEY delivered.`
  };

  return `You are a Principal Engineering Interviewer and Lead Bar Raiser at ${company} conducting a live technical mock interview.
Role Level: ${level}
Round Type: ${round}
Interview Style: ${testStyle || 'faang_bar_raiser'} (${styleDirectives[testStyle || 'faang_bar_raiser']})

${candidate ? `CANDIDATE BACKGROUND & RESUME CONTEXT:
- Candidate Name: ${candidate.name || 'Candidate'}
- Experience Level: ${candidate.experienceYears ? `${candidate.experienceYears} Years` : 'Not specified'}
- Current / Previous Role: ${candidate.currentRole || 'Software Engineer'}
- Core Tech Stack: ${candidate.techStack && candidate.techStack.length > 0 ? candidate.techStack.join(', ') : 'C++, Python, Java'}
${candidate.keyProjects && candidate.keyProjects.length > 0 ? `- Highlighted Projects: ${candidate.keyProjects.join('; ')}` : ''}
${candidate.customGoals ? `- Candidate Focus / Goals: ${candidate.customGoals}` : ''}
${candidate.resumeText ? `- Extracted Resume Context Snippet: ${candidate.resumeText.slice(0, 800)}` : ''}
` : ''}

LEVEL EXPECTATION FOR ${level}:
${levelExpectations[level]}

STYLE DIRECTIVE:
${styleDirectives[testStyle || 'faang_bar_raiser']}

CRITICAL INTERVIEW GUIDELINES FOR ${round}:
${roundGuidelines[round]}

${question ? `CURRENT ASSIGNED PROBLEM:\nTitle: ${question.title}\nDescription: ${question.description}\nKey Evaluation Criteria: ${question.keyEvaluationCriteria.join(', ')}` : ''}

STRICT CONSTRAINTS & BEHAVIOR:
- STRICT ISOLATION: Never refer to any other candidate or past interviews. Evaluate strictly this candidate.
- NO SPOILERS: In DSA and HLD, never reveal the solution or complete code/architecture. Let the candidate lead.
- SPOKEN PACING: Speak in natural, spoken conversational English. Keep replies between 2 to 3 sentences so voice synthesis is smooth.
- Address the candidate naturally by name (${candidate?.name || 'there'}).
- Professional, encouraging, but rigorous like a genuine ${company} Principal Engineer.`;
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
    const reply = await executeAIChatCascade(formattedMessages, {
      temperature: 0.6,
      maxTokens: 350,
      timeoutMs: 10000
    });
    if (reply && reply.trim().length > 0) {
      return reply.trim();
    }
  } catch (err) {
    console.error('Interviewer AI API error:', err);
  }

  return "Thank you for explaining that. Let's dig deeper into the trade-offs. How do you plan to scale this under high concurrency?";
}

// Global Voice Lock & Utterance References (Prevents Chromium GC & Audio Freezes)
let lockedInterviewerVoice: SpeechSynthesisVoice | null = null;
let lockedVoiceURI: string | null = null;
let speechKeepaliveTimer: any = null;
let isSpeakingActive = false;
let activeUtteranceQueue: SpeechSynthesisUtterance[] = [];

export function resetInterviewerVoiceLock(): void {
  lockedInterviewerVoice = null;
  lockedVoiceURI = null;
  stopInterviewerSpeech();
}

/**
 * Unlocks the browser SpeechSynthesis audio engine on a user gesture click.
 */
export function unlockSpeechSynthesis(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    const warmUp = new SpeechSynthesisUtterance(' ');
    warmUp.volume = 0.01;
    warmUp.rate = 2.0;
    window.speechSynthesis.speak(warmUp);
  } catch (err) {
    console.warn('Speech synthesis unlock warning:', err);
  }
}

export function getOrLockInterviewerVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  if (lockedVoiceURI) {
    const existing = voices.find(v => v.voiceURI === lockedVoiceURI);
    if (existing) return existing;
  }

  // Prioritize premium natural voices
  const preferred = voices.find(v => 
    (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Guy') || v.name.includes('David') || v.name.includes('Mark') || v.name.includes('Zira')) && 
    (v.lang.startsWith('en-US') || v.lang.startsWith('en-GB') || v.lang.startsWith('en'))
  ) || voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en')) || voices[0];

  if (preferred) {
    lockedInterviewerVoice = preferred;
    lockedVoiceURI = preferred.voiceURI;
  }

  return lockedInterviewerVoice;
}

// Pre-initialize voice listener
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    getOrLockInterviewerVoice();
  };
}

/**
 * Robust Text-to-Speech (TTS) synthesizer with sentence-level chunking, Chrome keepalive,
 * asynchronous cancel debounce, and GC retention.
 */
export function speakInterviewerText(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  stopInterviewerSpeech();
  isSpeakingActive = true;

  try {
    // 1. Clean markdown & expand technical abbreviations for natural pronunciation
    let cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block provided in editor.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#~>]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/Dr\./g, 'Doctor')
      .replace(/Mr\./g, 'Mister')
      .replace(/Ms\./g, 'Miss')
      .replace(/e\.g\./gi, 'for example')
      .replace(/i\.e\./gi, 'that is')
      .replace(/vs\./gi, 'versus')
      .replace(/\bQPS\b/g, 'Q P S')
      .replace(/\bSPOF\b/g, 'single point of failure')
      .replace(/\bTPS\b/g, 'T P S')
      .replace(/\bAPI\b/g, 'A P I')
      .replace(/\bDB\b/g, 'database')
      .replace(/\bLLD\b/g, 'low level design')
      .replace(/\bHLD\b/g, 'high level design')
      .replace(/\bDSA\b/g, 'D S A')
      .trim();

    if (!cleanText) {
      isSpeakingActive = false;
      if (onEnd) onEnd();
      return;
    }

    // 2. Split text into clean, natural sentence chunks (max 150 chars each)
    const rawSentences = cleanText.match(/[^.!?\n]+(?:[.!?\n]+|$)/g) || [cleanText];
    const chunks: string[] = [];

    for (const raw of rawSentences) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      if (trimmed.length <= 150) {
        chunks.push(trimmed);
      } else {
        // Sub-split long sentences at commas, semicolons, or colons
        const subParts = trimmed.split(/[,;:–—]\s+/);
        let current = '';
        for (const sub of subParts) {
          if ((current + ', ' + sub).length <= 150) {
            current = current ? current + ', ' + sub : sub;
          } else {
            if (current) chunks.push(current);
            current = sub;
          }
        }
        if (current) chunks.push(current);
      }
    }

    if (chunks.length === 0) {
      isSpeakingActive = false;
      if (onEnd) onEnd();
      return;
    }

    // 3. Unfreeze browser speech engine and wait 50ms for asynchronous cancel to clear
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    setTimeout(() => {
      if (!isSpeakingActive) return;

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const voice = getOrLockInterviewerVoice();
        let chunkIndex = 0;
        activeUtteranceQueue = [];

        // Pre-create and retain all utterances in memory to prevent GC collection bug
        for (let i = 0; i < chunks.length; i++) {
          const utt = new SpeechSynthesisUtterance(chunks[i]);
          utt.rate = 1.0;
          utt.pitch = 1.0;
          utt.volume = 1.0;
          if (voice) {
            utt.voice = voice;
            utt.lang = voice.lang;
          } else {
            utt.lang = 'en-US';
          }
          activeUtteranceQueue.push(utt);
        }

        // Start Keepalive Heartbeat (prevents Chrome 15s freeze bug)
        if (speechKeepaliveTimer) clearInterval(speechKeepaliveTimer);
        speechKeepaliveTimer = setInterval(() => {
          if (isSpeakingActive && window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 5000);

        const playChunk = (index: number) => {
          if (!isSpeakingActive || index >= activeUtteranceQueue.length) {
            stopInterviewerSpeech();
            if (onEnd) onEnd();
            return;
          }

          const currentUtt = activeUtteranceQueue[index];

          currentUtt.onstart = () => {
            // Keep alive check
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          };

          currentUtt.onend = () => {
            playChunk(index + 1);
          };

          currentUtt.onerror = (e) => {
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
              console.warn('Speech chunk playback error:', e.error);
            }
            if (isSpeakingActive) {
              playChunk(index + 1);
            }
          };

          try {
            window.speechSynthesis.speak(currentUtt);
            // In case browser is in paused state:
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          } catch (speakErr) {
            console.warn('Failed to speak chunk:', speakErr);
            playChunk(index + 1);
          }
        };

        playChunk(0);
      } catch (innerErr) {
        console.warn('Speech playback initiation error:', innerErr);
        stopInterviewerSpeech();
        if (onEnd) onEnd();
      }
    }, 60);

  } catch (err) {
    console.warn('Speech synthesis general error:', err);
    stopInterviewerSpeech();
    if (onEnd) onEnd();
  }
}

export function stopInterviewerSpeech(): void {
  isSpeakingActive = false;
  activeUtteranceQueue = [];
  if (speechKeepaliveTimer) {
    clearInterval(speechKeepaliveTimer);
    speechKeepaliveTimer = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {}
  }
}
