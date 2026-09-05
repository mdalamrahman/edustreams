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

// Watchdog timer reference to prevent audio stalls
let utteranceWatchdogTimer: any = null;

/**
 * Robust, realistic Text-to-Speech (TTS) synthesizer:
 * - Thorough natural text preprocessing (expanding Big-O, technical acronyms, stripping emojis/code fences)
 * - Complete sentence phrasing (prevents choppy comma-splitting)
 * - Per-chunk watchdog timer (bypasses Chromium dropped onend events)
 * - V8 GC retention and non-destructive Chrome keepalive
 */
export function speakInterviewerText(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  stopInterviewerSpeech();
  isSpeakingActive = true;

  try {
    // 1. Clean markdown & expand technical terms for natural spoken cadence
    let cleanText = text
      // Replace code blocks with spoken notice
      .replace(/```[\s\S]*?```/g, 'I have updated the code editor with the relevant template. ')
      .replace(/`([^`]+)`/g, '$1')
      // Strip emojis (both surrogate pairs and standard ranges)
      .replace(/[\u{1F300}-\u{1FAD6}\u{2000}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
      // Expand Big-O asymptotic notations
      .replace(/\bO\(1\)\b/g, 'O of 1')
      .replace(/\bO\(log\s*n\)\b/gi, 'O of log N')
      .replace(/\bO\(n\)\b/gi, 'O of N')
      .replace(/\bO\(n\s*log\s*n\)\b/gi, 'O of N log N')
      .replace(/\bO\(n\^?2\)\b/gi, 'O of N squared')
      .replace(/\bO\(2\^?n\)\b/gi, 'O of 2 to the N')
      .replace(/\bO\(V\s*\+\s*E\)\b/gi, 'O of V plus E')
      .replace(/\bO\(n!\)\b/gi, 'O of N factorial')
      // Expand technical abbreviations & acronyms
      .replace(/\bQPS\b/g, 'queries per second')
      .replace(/\bTPS\b/g, 'transactions per second')
      .replace(/\bSPOF\b/g, 'single point of failure')
      .replace(/\bAPI\b/g, 'A P I')
      .replace(/\bAPIs\b/g, 'A P I s')
      .replace(/\bDB\b/g, 'database')
      .replace(/\bDBs\b/g, 'databases')
      .replace(/\bLLD\b/g, 'low level design')
      .replace(/\bHLD\b/g, 'high level design')
      .replace(/\bDSA\b/g, 'D S A')
      .replace(/\bSTAR\b/g, 'STAR method')
      .replace(/\bFIFO\b/g, 'first in first out')
      .replace(/\bLRU\b/g, 'L R U')
      .replace(/\bCRUD\b/g, 'C R U D')
      .replace(/\bRPC\b/g, 'R P C')
      .replace(/\bgRPC\b/g, 'G R P C')
      .replace(/\bJSON\b/gi, 'Jason')
      .replace(/\bSQL\b/g, 'sequel')
      .replace(/\bNoSQL\b/gi, 'no sequel')
      .replace(/\bCDN\b/g, 'C D N')
      .replace(/\bDNS\b/g, 'D N S')
      .replace(/\bK\/V\b/g, 'key value')
      .replace(/\bDr\./g, 'Doctor')
      .replace(/\bMr\./g, 'Mister')
      .replace(/\bMs\./g, 'Miss')
      .replace(/\be\.g\./gi, 'for example')
      .replace(/\bi\.e\./gi, 'that is')
      .replace(/\bvs\.?\b/gi, 'versus')
      // Strip remaining markdown formatting symbols
      .replace(/[*_#~>]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) {
      isSpeakingActive = false;
      if (onEnd) onEnd();
      return;
    }

    // 2. Segment by true sentence boundaries (preserving natural comma cadence)
    const rawSentences = cleanText.match(/[^.!?\n]+(?:[.!?\n]+|$)/g) || [cleanText];
    const chunks: string[] = [];

    for (const raw of rawSentences) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      // If a sentence is manageable in length (< 250 chars), keep it intact for natural inflection
      if (trimmed.length <= 250) {
        chunks.push(trimmed);
      } else {
        // Only split very long sentences at natural conjunctions
        const subParts = trimmed.split(/,\s+(?=and|but|while|so|however|or|because|then)\b/i);
        let current = '';
        for (const sub of subParts) {
          if ((current + ', ' + sub).length <= 250) {
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

    // 3. Resume audio engine if paused
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
        activeUtteranceQueue = [];

        // Pre-create and store utterances in memory (prevents Chromium V8 GC sweep)
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

        // Non-destructive Chrome keepalive (only resumes if browser paused; never pauses active audio)
        if (speechKeepaliveTimer) clearInterval(speechKeepaliveTimer);
        speechKeepaliveTimer = setInterval(() => {
          if (isSpeakingActive && typeof window !== 'undefined' && window.speechSynthesis) {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          }
        }, 1500);

        const playChunk = (index: number) => {
          if (utteranceWatchdogTimer) {
            clearTimeout(utteranceWatchdogTimer);
            utteranceWatchdogTimer = null;
          }

          if (!isSpeakingActive || index >= activeUtteranceQueue.length) {
            stopInterviewerSpeech();
            if (onEnd) onEnd();
            return;
          }

          const currentUtt = activeUtteranceQueue[index];
          let chunkDone = false;

          const advanceToNextChunk = () => {
            if (chunkDone) return;
            chunkDone = true;
            if (utteranceWatchdogTimer) {
              clearTimeout(utteranceWatchdogTimer);
              utteranceWatchdogTimer = null;
            }
            if (isSpeakingActive) {
              playChunk(index + 1);
            }
          };

          currentUtt.onstart = () => {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          };

          currentUtt.onend = () => {
            advanceToNextChunk();
          };

          currentUtt.onerror = (e) => {
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
              console.warn('Speech chunk playback notice:', e.error);
            }
            advanceToNextChunk();
          };

          // Watchdog safety timer: if Chromium drops onend, force advance to next chunk
          const wordCount = currentUtt.text.split(/\s+/).length;
          const expectedMs = Math.max(3000, wordCount * 550 + 2500);
          utteranceWatchdogTimer = setTimeout(() => {
            if (!chunkDone && isSpeakingActive) {
              console.warn('[TTS Watchdog] Advance stalled chunk:', index);
              advanceToNextChunk();
            }
          }, expectedMs);

          try {
            window.speechSynthesis.speak(currentUtt);
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          } catch (speakErr) {
            console.warn('Speech chunk exception:', speakErr);
            advanceToNextChunk();
          }
        };

        playChunk(0);
      } catch (innerErr) {
        console.warn('Speech playback initiation error:', innerErr);
        stopInterviewerSpeech();
        if (onEnd) onEnd();
      }
    }, 40);

  } catch (err) {
    console.warn('Speech synthesis general error:', err);
    stopInterviewerSpeech();
    if (onEnd) onEnd();
  }
}

export function stopInterviewerSpeech(): void {
  isSpeakingActive = false;
  activeUtteranceQueue = [];
  if (utteranceWatchdogTimer) {
    clearTimeout(utteranceWatchdogTimer);
    utteranceWatchdogTimer = null;
  }
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
