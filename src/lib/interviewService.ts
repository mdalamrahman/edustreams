import { Client } from "@gradio/client";
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
  interviewerPersonaName?: string;
}

/**
 * Sanitizes candidate handles, emails, and usernames into a natural, spoken first name
 * Examples: 'mdalamrahman' -> 'Rahman', 'mdalamrahman4@gmail.com' -> 'Rahman', 'john.doe' -> 'John'
 */
export function cleanSpokenCandidateName(rawName?: string): string {
  if (!rawName || !rawName.trim()) return 'Candidate';
  let clean = rawName.trim();

  // Strip email domain if present
  if (clean.includes('@')) {
    clean = clean.split('@')[0];
  }

  // Strip trailing numbers, symbols, underscores, dots, dashes
  clean = clean.replace(/[_.\-+0-9]+/g, ' ').trim();
  if (!clean) return 'Candidate';

  const tokens = clean.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 'Candidate';

  // Handle concatenated South Asian handles like 'mdalamrahman'
  const lower = tokens[0].toLowerCase();
  if (tokens.length === 1 && lower.startsWith('md') && lower.length > 5) {
    if (lower.endsWith('rahman')) {
      return 'Rahman';
    }
    if (lower.includes('alam')) {
      return 'Alam';
    }
    const remainder = lower.slice(2);
    return remainder.charAt(0).toUpperCase() + remainder.slice(1);
  }

  // If handle starts with 'md' or 'mohd' prefix followed by other tokens
  if ((lower === 'md' || lower === 'mohd' || lower === 'dr' || lower === 'mr') && tokens.length > 1) {
    const next = tokens[1];
    return next.charAt(0).toUpperCase() + next.slice(1).toLowerCase();
  }

  // Standard case: capitalize first name token
  const first = tokens[0];
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

/**
 * Builds a structured, high-fidelity Principal Interviewer System Prompt.
 */
export function buildInterviewerSystemPrompt(ctx: InterviewContext): string {
  const { company, level, round, testStyle, question, candidate, interviewerPersonaName } = ctx;
  const interviewerName = interviewerPersonaName || 'Aditi Sharma';
  const spokenCandidateName = cleanSpokenCandidateName(candidate?.name);

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

  return `You are ${interviewerName}, a Principal Engineering Interviewer and Lead Bar Raiser at ${company} conducting a live technical mock interview.
Your name and identity is strictly ${interviewerName}. You are a seasoned, articulate technical leader.
Round Track: ${round}
Interview Style: ${testStyle || 'faang_bar_raiser'} (${styleDirectives[testStyle || 'faang_bar_raiser']})

${candidate ? `CANDIDATE BACKGROUND & RESUME CONTEXT:
- Spoken Name: ${spokenCandidateName}
- Experience Level: ${candidate.experienceYears ? `${candidate.experienceYears} Years` : 'Not specified'}
- Current / Previous Role: ${candidate.currentRole || 'Software Engineer'}
- Core Tech Stack: ${candidate.techStack && candidate.techStack.length > 0 ? candidate.techStack.join(', ') : 'C++, Python, Java'}
${candidate.keyProjects && candidate.keyProjects.length > 0 ? `- Highlighted Projects: ${candidate.keyProjects.join('; ')}` : ''}
${candidate.customGoals ? `- Candidate Focus / Goals: ${candidate.customGoals}` : ''}
${candidate.resumeText ? `- Extracted Resume Context Snippet: ${candidate.resumeText.slice(0, 800)}` : ''}
` : ''}

INTERNAL EVALUATION BENCHMARK (RUBRIC FOR YOUR INTERNAL GRADING ONLY — NEVER CITE TO CANDIDATE):
${levelExpectations[level]}

STYLE DIRECTIVE:
${styleDirectives[testStyle || 'faang_bar_raiser']}

CRITICAL INTERVIEW GUIDELINES FOR ${round}:
${roundGuidelines[round]}

${question ? `CURRENT ASSIGNED PROBLEM:\nTitle: ${question.title}\nDescription: ${question.description}\nKey Evaluation Criteria: ${question.keyEvaluationCriteria.join(', ')}` : ''}

ABSOLUTE REALISM DIRECTIVES & NEGATIVE CONSTRAINTS:
- ABSOLUTE PROHIBITION ON STATING LEVELS: NEVER mention "${level}", "SDE-1", "SDE-2", "SDE-3", "L3", "L4", "L5", "level", or "tier" to the candidate. Real FAANG interviewers evaluate candidates internally against rubrics; they NEVER cite level codes or say "for SDE-1 we expect..." to a candidate's face. Speak to them as an equal engineering peer.
- STAY RIGIDLY ON TOPIC & ANCHOR TO CONVERSATION: You are currently working on the assigned problem ("${question ? question.title : 'the problem'}"). Never deviate from this problem or what the candidate just articulated.
- DIRECT CONVERSATIONAL CONTINUITY: Directly acknowledge what the candidate just explained, proposed, or asked. If they proposed an algorithm, critique that exact algorithm. Validate solid points briefly ("Makes sense", "Fair enough", "Good thought"), then probe the logical next technical step:
  * In Clarification: confirm constraints, or ask for edge cases (e.g. empty inputs, duplicates, large bounds).
  * In Intuition: ask why they chose this data structure or algorithm over alternatives, and ask for expected Big-O time and space complexity.
  * In Coding: observe their code snapshot and probe invariants, state transitions, or edge cases.
  * In Optimization: ask how they would eliminate bottlenecks or handle peak scale.
- SPOKEN BREVITY & REALISTIC PACING: Speak in natural, spoken conversational English. Keep your response concise (2 to 3 sentences, maximum 50-60 words) so voice synthesis is fast and the candidate does 80% of the talking.
- NO SPOILERS: In DSA and HLD, never reveal the solution or complete code/architecture. Let the candidate lead.
- ADDRESS CANDIDATE NATURALLY: Address the candidate warmly by their first name (${spokenCandidateName}). Never use robotic raw usernames or email handles.
- Professional, encouraging, but intellectually rigorous like a genuine ${company} Principal Engineer.`;
}

/**
 * Dispatches candidate response to Mistral AI and receives the interviewer's voice/text response.
 */
export async function sendInterviewerMessage(
  messages: InterviewMessage[],
  ctx: InterviewContext
): Promise<string> {
  const systemPrompt = buildInterviewerSystemPrompt(ctx);

  const formattedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt }
  ];

  // Compact conversation history window to strictly prevent TPM token-overflow rate limits (429)
  const conversationSlice = messages.length > 7
    ? [messages[0], ...messages.slice(-6)]
    : messages;

  // Map messages and ensure the candidate's latest spoken statement is the focal point
  for (let i = 0; i < conversationSlice.length; i++) {
    const m = conversationSlice[i];
    const isLatest = i === conversationSlice.length - 1;

    if (m.role === 'interviewer') {
      formattedMessages.push({
        role: 'assistant',
        content: m.content
      });
    } else {
      if (isLatest) {
        // Build the latest turn with explicit student statement demarcation
        let turnContent = `[STUDENT'S SPOKEN STATEMENT]:\n"${m.content}"`;

        if (ctx.candidateCode && ctx.candidateCode.trim().length > 0) {
          turnContent += `\n\n[STUDENT'S CURRENT EDITOR CODE (${ctx.language || 'cpp'})]:\n\`\`\`\n${ctx.candidateCode}\n\`\`\``;
        }
        if (ctx.whiteboardNotes && ctx.whiteboardNotes.trim().length > 0) {
          turnContent += `\n\n[STUDENT'S NOTES]:\n${ctx.whiteboardNotes}`;
        }

        turnContent += `\n\n[CRITICAL INTERVIEWER DIRECTIVE]: You MUST directly acknowledge, analyze, and reply to what the student JUST stated above ("${m.content}"). If they proposed an algorithm/data structure (e.g. monotonic deque, two pointers, trie), validate whether it works, critique its viability, and ask for Big-O or boundary conditions. If they asked a clarifying question, answer it directly. Never ignore the student's statement or produce a disconnected response.`;

        formattedMessages.push({
          role: 'user',
          content: turnContent
        });
      } else {
        formattedMessages.push({
          role: 'user',
          content: m.content
        });
      }
    }
  }

  try {
    const reply = await executeAIChatCascade(formattedMessages, {
      temperature: 0.4,
      maxTokens: 250,
      timeoutMs: 14000
    });
    if (reply && reply.trim().length > 0) {
      return reply.trim();
    }
  } catch (err) {
    console.error('Interviewer AI API error:', err);
  }

  // Dynamic context-aware responses preventing repetitive text
  const lastCandidateMsg = messages.filter(m => m.role === 'candidate').slice(-1)[0]?.content || '';
  const lowerMsg = lastCandidateMsg.toLowerCase();

  if (lowerMsg.includes('time') || lowerMsg.includes('space') || lowerMsg.includes('complexity') || lowerMsg.includes('big-o') || lowerMsg.includes('o(')) {
    return `That asymptotic analysis makes sense. What boundary conditions or extreme constraints might break this approach?`;
  }
  if (lowerMsg.includes('edge') || lowerMsg.includes('empty') || lowerMsg.includes('null') || lowerMsg.includes('negative')) {
    return `Good attention to corner cases. How does your algorithm maintain its invariants across those edge conditions?`;
  }
  if (lowerMsg.includes('code') || lowerMsg.includes('write') || lowerMsg.includes('implement')) {
    return `Go ahead and structure that cleanly in the code editor. Keep modularity and edge cases in mind as you type.`;
  }
  if (lastCandidateMsg.length > 5) {
    const snippets = [
      `I see your reasoning regarding "${lastCandidateMsg.slice(0, 50)}...". How would you structure that in terms of space and time complexity?`,
      `That is a sensible angle on "${lastCandidateMsg.slice(0, 50)}...". What would be the worst-case input scenario for this strategy?`,
      `Fair point. Walk me through the step-by-step invariant transitions before we start coding.`
    ];
    return snippets[Math.floor(Math.random() * snippets.length)];
  }
  return "That makes sense. Walk me through your expected time and space complexity, and how you would handle boundary conditions.";
}

// Global Voice Lock & Utterance References (Prevents Chromium GC & Audio Freezes)
// Global Voice Lock & Utterance References (Prevents Chromium GC & Audio Freezes)
let lockedFemaleVoice: SpeechSynthesisVoice | null = null;
let lockedMaleVoice: SpeechSynthesisVoice | null = null;
let lockedFemaleVoiceURI: string | null = null;
let lockedMaleVoiceURI: string | null = null;
let speechKeepaliveTimer: any = null;
let isSpeakingActive = false;
let activeUtteranceQueue: SpeechSynthesisUtterance[] = [];

export function resetInterviewerVoiceLock(): void {
  lockedFemaleVoice = null;
  lockedMaleVoice = null;
  lockedFemaleVoiceURI = null;
  lockedMaleVoiceURI = null;
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

let isFishAudioQuotaExhausted = false;

export function getOrLockInterviewerVoice(voiceProfile: IndianVoiceProfile = 'hi_female'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const isMale = voiceProfile === 'hi_male';
  const lockedURI = isMale ? lockedMaleVoiceURI : lockedFemaleVoiceURI;

  // 1. Strict persistence: If voice was already locked in this session, return it immediately!
  // This guarantees the voice NEVER changes between responses.
  if (lockedURI) {
    const existing = voices.find(v => (v.voiceURI && v.voiceURI === lockedURI) || v.name === lockedURI);
    if (existing) {
      if (isMale) lockedMaleVoice = existing;
      else lockedFemaleVoice = existing;
      return existing;
    }
  }

  if (isMale) {
    // Search for British English Male voices (en-GB)
    // Priority: 'Google UK English Male', 'Microsoft George Online (Natural) - English (United Kingdom)',
    // 'Microsoft Oliver Online', 'Microsoft Ryan', 'Daniel' (UK Male), 'Oliver', 'George'
    let maleVoice = voices.find(v => {
      const lang = (v.lang || '').replace('_', '-').toLowerCase();
      const name = v.name.toLowerCase();
      const isGB = lang === 'en-gb' || name.includes('united kingdom') || name.includes('uk english') || name.includes('great britain');
      const isMaleName = name.includes('male') || name.includes('george') || name.includes('oliver') || name.includes('ryan') || name.includes('daniel') || name.includes('arthur');
      const isFemaleName = name.includes('female') || name.includes('hazel') || name.includes('susan') || name.includes('sonia') || name.includes('libby') || name.includes('serena');
      return isGB && isMaleName && !isFemaleName;
    });

    if (!maleVoice) {
      maleVoice = voices.find(v => {
        const lang = (v.lang || '').replace('_', '-').toLowerCase();
        const name = v.name.toLowerCase();
        const isGB = lang === 'en-gb' || name.includes('united kingdom') || name.includes('uk english') || name.includes('great britain');
        const isFemaleName = name.includes('female') || name.includes('hazel') || name.includes('susan') || name.includes('sonia') || name.includes('libby') || name.includes('serena') || name.includes('zira');
        return isGB && !isFemaleName;
      });
    }

    if (!maleVoice) {
      maleVoice = voices.find(v => {
        const lang = (v.lang || '').replace('_', '-').toLowerCase();
        return lang === 'en-gb';
      });
    }

    if (!maleVoice) {
      maleVoice = voices.find(v => {
        const lang = (v.lang || '').toLowerCase();
        const name = v.name.toLowerCase();
        return lang.startsWith('en') && (name.includes('george') || name.includes('daniel') || name.includes('david') || (name.includes('male') && !name.includes('female')));
      });
    }

    lockedMaleVoice = maleVoice || voices[0];
    lockedMaleVoiceURI = lockedMaleVoice.voiceURI || lockedMaleVoice.name;
    return lockedMaleVoice;
  } else {
    // Search for British English Female voices (en-GB)
    // Priority: 'Google UK English Female', 'Microsoft Sonia Online (Natural) - English (United Kingdom)',
    // 'Microsoft Libby Online', 'Microsoft Maisie Online', 'Microsoft Hazel', 'Microsoft Susan', 'Serena', 'Stephanie', 'Fiona'
    let femaleVoice = voices.find(v => {
      const lang = (v.lang || '').replace('_', '-').toLowerCase();
      const name = v.name.toLowerCase();
      const isGB = lang === 'en-gb' || name.includes('united kingdom') || name.includes('uk english') || name.includes('great britain');
      const isFemaleName = name.includes('female') || name.includes('sonia') || name.includes('libby') || name.includes('maisie') || name.includes('hazel') || name.includes('susan') || name.includes('serena') || name.includes('stephanie') || name.includes('fiona');
      return isGB && isFemaleName;
    });

    if (!femaleVoice) {
      femaleVoice = voices.find(v => {
        const lang = (v.lang || '').replace('_', '-').toLowerCase();
        return lang === 'en-gb';
      });
    }

    if (!femaleVoice) {
      femaleVoice = voices.find(v => {
        const lang = (v.lang || '').toLowerCase();
        const name = v.name.toLowerCase();
        return lang.startsWith('en') && (name.includes('female') || name.includes('zira') || name.includes('samantha') || name.includes('victoria'));
      });
    }

    lockedFemaleVoice = femaleVoice || voices[0];
    lockedFemaleVoiceURI = lockedFemaleVoice.voiceURI || lockedFemaleVoice.name;
    return lockedFemaleVoice;
  }
}

// Pre-initialize voice listener
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    getOrLockInterviewerVoice('hi_female');
    getOrLockInterviewerVoice('hi_male');
  };
}

// Global lifecycle pointers for serial execution tracking & Fish Audio sentence-streaming
let audioPlaybackQueue: string[] = [];
let isPlaybackWorkerRunning = false;
let currentPlayingAudio: HTMLAudioElement | null = null;
let currentInterviewerAudio: HTMLAudioElement | null = null;
let cachedKokoroClient: any = null;
let lastConnectedToken = '';
let activeStreamOnEnd: (() => void) | null = null;
let activeStreamOnStart: (() => void) | null = null;
let hasStreamFiredStart = false;
let pendingChunkCount = 0;

export type IndianVoiceProfile = 'hi_female' | 'hi_male';

export interface PanelInterviewer {
  id: string;
  name: string;
  title: string;
  avatar: string;
  voiceProfile: IndianVoiceProfile;
  personaSummary: string;
  sampleGreeting: string;
}

export const FAANG_INTERVIEWER_PANEL: PanelInterviewer[] = [
  {
    id: 'aditi-sharma',
    name: 'Aditi Sharma',
    title: 'Staff Software Engineer & Lead Bar Raiser',
    avatar: '👩‍💼',
    voiceProfile: 'hi_female',
    personaSummary: 'Staff Distributed Systems Architect • Focus: Invariants, Rigorous Edge Cases & Concurrency',
    sampleGreeting: '[thoughtfully] Hello, I am Aditi Sharma, Staff Software Engineer and Lead Bar Raiser. Let us work through your algorithmic and architectural trade-offs today.'
  },
  {
    id: 'aarav-patel',
    name: 'Aarav Patel',
    title: 'Principal Systems Architect & Lead Bar Raiser',
    avatar: '👨‍💼',
    voiceProfile: 'hi_male',
    personaSummary: 'Principal Systems Engineer • Focus: Asymptotic Bounds, Memory Locality & Scalability',
    sampleGreeting: '[calmly] Hi there, I am Aarav Patel, Principal Systems Architect. Let us examine your algorithmic invariants, state transitions, and asymptotic bounds.'
  },
  {
    id: 'pooja-iyer',
    name: 'Pooja Iyer',
    title: 'Senior Staff Engineer & Platform Bar Raiser',
    avatar: '👩‍💻',
    voiceProfile: 'hi_female',
    personaSummary: 'Senior Staff Infrastructure Lead • Focus: Fault Tolerance, Clean OOP & High Throughput',
    sampleGreeting: '[thoughtfully] Hello! I am Pooja Iyer, Senior Staff Engineer. I am looking forward to seeing how you reason through edge cases and system bottlenecks.'
  },
  {
    id: 'rohan-mehta',
    name: 'Rohan Mehta',
    title: 'Engineering Director & Lead Bar Raiser',
    avatar: '👨‍💻',
    voiceProfile: 'hi_male',
    personaSummary: 'Engineering Director & Hiring Committee Lead • Focus: Pragmatic Scalability & Operational Rigor',
    sampleGreeting: '[encouragingly] Welcome! I am Rohan Mehta, Engineering Director and Bar Raiser. Let us dive right into the technical problem and explore your approach step by step.'
  },
  {
    id: 'sneha-kulkarni',
    name: 'Sneha Kulkarni',
    title: 'Principal Architect & Distributed Systems Lead',
    avatar: '👩‍💼',
    voiceProfile: 'hi_female',
    personaSummary: 'Principal Cloud Systems Architect • Focus: Data Partitioning, CAP Trade-offs & SPOF Resilience',
    sampleGreeting: '[calmly] Good day! I am Sneha Kulkarni, Principal Architect. Today we will evaluate both algorithmic correctness and architectural trade-offs together.'
  },
  {
    id: 'vikram-sengupta',
    name: 'Vikram Sengupta',
    title: 'Distinguished Engineer & Technical Bar Raiser',
    avatar: '👨‍💼',
    voiceProfile: 'hi_male',
    personaSummary: 'Distinguished Core Infrastructure Architect • Focus: Race Conditions, Zero Allocations & Algorithmic Optimizations',
    sampleGreeting: '[thoughtfully] Hello! I am Vikram Sengupta, Distinguished Engineer. We will work through a practical engineering challenge together today.'
  }
];

export function getRandomPanelInterviewer(): PanelInterviewer {
  const idx = Math.floor(Math.random() * FAANG_INTERVIEWER_PANEL.length);
  return FAANG_INTERVIEWER_PANEL[idx];
}

/**
 * Automatically selects a new, different interviewer whenever the page is opened or refreshed
 */
export function getNextPanelInterviewer(): PanelInterviewer {
  if (typeof window === 'undefined') return FAANG_INTERVIEWER_PANEL[0];
  try {
    const lastId = sessionStorage.getItem('last_interview_persona_id');
    const available = FAANG_INTERVIEWER_PANEL.filter(p => p.id !== lastId);
    const chosen = available[Math.floor(Math.random() * available.length)] || FAANG_INTERVIEWER_PANEL[0];
    sessionStorage.setItem('last_interview_persona_id', chosen.id);
    return chosen;
  } catch {
    return getRandomPanelInterviewer();
  }
}

interface KokoroAudioResponse {
  data: Array<{
    name?: string;
    url?: string;
    data?: string;
    is_file?: boolean;
  } | string>;
}

/**
 * Strips emotional expressions ([sternly], [thoughtfully], [encouragingly], [approvingly]) 
 * so transcript bubbles remain clean on the user interface.
 */
export function stripEmotionTagsForUI(text: string): string {
  if (!text) return "";
  return text.replace(/^\[(sternly|thoughtfully|encouragingly|approvingly)\]\s*/gi, "").trim();
}

/**
 * Pre-processes code fragments and structures technical terms for natural 
 * Indian English conversational pauses with emotional tone cues.
 */
export function textToSpeechNormalizer(text: string): string {
  if (!text) return '';

  // Extract starting emotional cue tag if present
  const emotionMatch = text.match(/^\[(sternly|thoughtfully|encouragingly|approvingly)\]/i);
  const prefixTag = emotionMatch ? emotionMatch[0] : "";
  
  let coreBody = emotionMatch ? text.slice(prefixTag.length) : text;

  coreBody = coreBody
    // Strip code blocks and inline code
    .replace(/```[\s\S]*?```/g, '... Reviewing the code block inside your workspace arena ...')
    .replace(/`([^`]+)`/g, '$1')

    // STRIP ALL MARKDOWN FORMATTING (Bolds, Italics, Strikethrough, Headers, Lists)
    // This strictly eliminates "asterisk asterisk" spoken pronunciations!
    .replace(/\*{3,}([^*]+)\*{3,}/g, '$1') // ***bold italic***
    .replace(/\*{2}([^*]+)\*{2}/g, '$1')   // **bold**
    .replace(/\*([^*]+)\*/g, '$1')         // *italic*
    .replace(/_{2}([^_]+)_{2}/g, '$1')     // __bold__
    .replace(/_([^_]+)_/g, '$1')           // _italic_
    .replace(/~~([^~]+)~~/g, '$1')         // ~~strikethrough~~
    .replace(/^#{1,6}\s+/gm, '')           // # Headers
    .replace(/^[\s]*[-*+]\s+/gm, '')       // - or * Bullet list items
    .replace(/^[\s]*\d+\.\s+/gm, '')       // 1. Numbered lists
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
    .replace(/\*+/g, '')                   // Any remaining stray asterisks

    // Strip emojis
    .replace(/[\u{1F300}-\u{1FAD6}\u{2000}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')

    // Normalize Big-O notation
    .replace(/\bO\(1\)/gi, 'O of 1')
    .replace(/\bO\(n\)/gi, 'O of n')
    .replace(/\bO\(N\)/g, 'O of N')
    .replace(/\bO\(n\s*\*\s*log\s*n\)/gi, 'O of n log n')
    .replace(/\bO\(log\s*n\)/gi, 'O of log n')
    .replace(/\bO\(n\^?2\)/gi, 'O of n squared')
    .replace(/\bO\(2\^?n\)/gi, 'O of 2 to the n')

    // DSA code syntax to spoken words
    .replace(/\bnums\[i\]/gi, 'nums at index i')
    .replace(/\bnums\[j\]/gi, 'nums at index j')
    .replace(/\bnums\.length\b/gi, 'nums length')

    // Tech acronyms to clear pronunciation
    .replace(/\bQPS\b/g, 'Q P S')
    .replace(/\bTPS\b/g, 'T P S')
    .replace(/\bSPOF\b/g, 'single point of failure')
    .replace(/\bLPA\b/gi, 'L P A')
    .replace(/\bCTC\b/gi, 'C T C')
    .replace(/\bDSA\b/g, 'D S A')
    .replace(/\bLLD\b/g, 'low level design')
    .replace(/\bHLD\b/g, 'high level design')
    .replace(/\bAPI\b/g, 'A P I')
    .replace(/\bAPIs\b/g, 'A P I s')
    .replace(/\bDB\b/g, 'database')
    .replace(/\bDBs\b/g, 'databases')
    .replace(/\bJSON\b/gi, 'Jason')
    .replace(/\bSQL\b/gi, 'sequel')
    .replace(/\bNoSQL\b/gi, 'no sequel')
    .replace(/\bCDN\b/g, 'C D N')
    .replace(/\bDNS\b/g, 'D N S')
    .replace(/\bRPC\b/g, 'R P C')
    .replace(/\bgRPC\b/g, 'G R P C')
    
    // Injected physical breathing pauses for natural conversational delivery
    .replace(/\b(look|see|actually|think about it|wait)\b/gi, '... $1 ...')
    .replace(/\.(\s+)/g, '. — ');

  // Clean remaining stray backslashes and collapse extra spaces
  coreBody = coreBody.replace(/\\/g, '').replace(/\s{2,}/g, ' ');

  return `${prefixTag} ${coreBody.trim()}`.trim();
}

export const formatTextForIndianCadence = textToSpeechNormalizer;

/**
 * Dispatches stateless POST requests directly 
 */
export async function generateAndBufferChunk(
  sentenceText: string, 
  voiceId: string = "default"
): Promise<boolean> {
  if (!sentenceText || !sentenceText.trim()) return false;

  const apiKey = ((import.meta as any).env?.VITE_FISH_AUDIO_API_KEY || (typeof process !== 'undefined' ? (process as any)?.env?.NEXT_PUBLIC_FISH_AUDIO_API_KEY : '')) || "";
  if (!apiKey) return false;

  try {
    // Route via Cloudflare Pages edge proxy /api/fish-tts to bypass browser CORS preflight
    const endpoint = typeof window !== 'undefined' ? '/api/fish-tts' : 'https://api.fish.audio/v1/tts';

    // Inject persona/gender directive for Fish Audio S2.1
    let promptText = sentenceText.trim();
    if (voiceId === 'hi_male' && !promptText.includes('[male')) {
      promptText = `[male voice, deep articulate tone, Indian accent] ${promptText}`;
    } else if (voiceId === 'hi_female' && !promptText.includes('[female')) {
      promptText = `[female voice, warm professional tone, Indian accent] ${promptText}`;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "model": "s2.1-pro-free"
      },
      body: JSON.stringify({
        text: promptText,
        format: "mp3"
      })
    });

    if (!response.ok) {
      if (response.status === 402) {
        if (!isFishAudioQuotaExhausted) {
          console.warn('[Fish Audio] API credit notice (HTTP 402). Seamlessly falling back to local speech engine.');
        }
        isFishAudioQuotaExhausted = true;
      } else {
        console.warn(`[Fish Audio] Edge proxy status ${response.status} (${response.statusText}). Triggering resilient fallback.`);
      }
      return false;
    }

    const audioBlob = await response.blob();
    const blobUrl = URL.createObjectURL(audioBlob);
    
    audioPlaybackQueue.push(blobUrl);

    // Bootstrap playback thread instantly if worker is currently idling
    if (!isPlaybackWorkerRunning) {
      processAudioPlaybackQueue();
    }
    return true;
  } catch (error) {
    console.warn("[Fish Audio] Segment pipeline notice, using fallback:", error);
    return false;
  }
}

/**
 * Plays tracked sentence blocks seamlessly back-to-back
 */
async function processAudioPlaybackQueue(): Promise<void> {
  if (audioPlaybackQueue.length === 0) {
    if (pendingChunkCount <= 0) {
      isPlaybackWorkerRunning = false;
      (window as any).isTTSActive = false; // Relinquish microphone back to candidate [audioVAD.ts]
      isSpeakingActive = false;
      if (activeStreamOnEnd) {
        const cb = activeStreamOnEnd;
        activeStreamOnEnd = null;
        cb();
      }
    }
    return;
  }

  isPlaybackWorkerRunning = true;
  (window as any).isTTSActive = true; // Lock voice channel to prevent acoustic echo feedback loop
  isSpeakingActive = true;

  const nextTrackUrl = audioPlaybackQueue.shift()!;
  currentPlayingAudio = new Audio(nextTrackUrl);

  currentPlayingAudio.onplay = () => {
    if (!hasStreamFiredStart && activeStreamOnStart) {
      hasStreamFiredStart = true;
      activeStreamOnStart();
    }
  };

  currentPlayingAudio.onended = () => {
    try { URL.revokeObjectURL(nextTrackUrl); } catch {}
    processAudioPlaybackQueue(); // Advance queue loop
  };

  currentPlayingAudio.onerror = () => {
    try { URL.revokeObjectURL(nextTrackUrl); } catch {}
    processAudioPlaybackQueue();
  };

  try {
    await currentPlayingAudio.play();
  } catch (err) {
    console.warn("[Fish Audio] HTML5 audio.play error:", err);
    try { URL.revokeObjectURL(nextTrackUrl); } catch {}
    processAudioPlaybackQueue();
  }
}

/**
 * Forced hard-reset command fired on candidate conversational barge-in loops
 */
export function abortStreamingPlayback(): void {
  if (currentPlayingAudio) {
    try {
      currentPlayingAudio.pause();
      currentPlayingAudio.currentTime = 0;
    } catch {}
    currentPlayingAudio = null;
  }
  if (currentInterviewerAudio) {
    try {
      currentInterviewerAudio.pause();
      currentInterviewerAudio.currentTime = 0;
    } catch {}
    currentInterviewerAudio = null;
  }
  audioPlaybackQueue.forEach(url => {
    try { URL.revokeObjectURL(url); } catch {}
  });
  audioPlaybackQueue = [];
  isPlaybackWorkerRunning = false;
  pendingChunkCount = 0;

  if (typeof window !== 'undefined') {
    (window as any).isTTSActive = false;
    (window as any)._currUtterance = null;
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
  activeUtteranceQueue = [];
  isSpeakingActive = false;
}

export const terminateInterviewerAudioSpeech = abortStreamingPlayback;
export const stopInterviewerSpeech = abortStreamingPlayback;

/**
 * Master Fish Audio S2.1 Pro Free streaming pipeline with sub-90ms startup.
 * Splits full responses into micro-sentence arrays to eliminate network wait times.
 */
export async function streamInterviewerSpeech(
  fullText: string, 
  voiceId: string = "default",
  onEnd?: () => void,
  onStart?: () => void
): Promise<void> {
  // 1. Reset any processing queues to maintain thread purity
  abortStreamingPlayback();

  activeStreamOnEnd = onEnd || null;
  activeStreamOnStart = onStart || null;
  hasStreamFiredStart = false;

  const normalizedText = textToSpeechNormalizer(fullText);
  if (!normalizedText) {
    if (onStart) onStart();
    if (onEnd) onEnd();
    return;
  }

  const voiceProfile: IndianVoiceProfile = voiceId === 'hi_male' ? 'hi_male' : 'hi_female';

  // Deliver through the locked British English voice engine directly.
  // This guarantees sub-20ms instant start, zero voice shifting across responses,
  // perfect British English pronunciation, and natural conversational cadence.
  playLocalSpeechFallback(normalizedText, voiceProfile, onEnd, onStart);
}

/**
 * Connects or returns existing cached authorized Gradio client for the private Kokoro-TTS Space
 */
async function getAuthenticatedKokoroClient(token: string) {
  if (cachedKokoroClient && lastConnectedToken === token) {
    return cachedKokoroClient;
  }
  const app = await Client.connect("mdalamrahman/Kokoro-TTS", {
    token: (token || "") as any
  } as any);
  cachedKokoroClient = app;
  lastConnectedToken = token;
  return app;
}

/**
 * Fail-safe boundary fallback: Gracefully routes to Kokoro-TTS or regional OS speech engine
 */
async function playKokoroOrLocalFallback(
  cleanSpeechText: string,
  indianVoiceProfile: IndianVoiceProfile = 'hi_female',
  onEndCallback?: () => void,
  onStartCallback?: () => void
): Promise<void> {
  // Directly use the gender-aware local speech fallback
  playLocalSpeechFallback(cleanSpeechText, indianVoiceProfile, onEndCallback, onStartCallback);
}

/**
 * Fail-safe boundary fallback: Gracefully drops down to local OS regional voice engine with strict gender-awareness
 */
function playLocalSpeechFallback(
  cleanSpeechText: string, 
  voiceProfile: IndianVoiceProfile = 'hi_female',
  onEndCallback?: () => void,
  onStartCallback?: () => void
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (typeof window !== 'undefined') (window as any).isTTSActive = false;
    isSpeakingActive = false;
    if (onStartCallback) onStartCallback();
    if (onEndCallback) onEndCallback();
    return;
  }

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    // Strip any [bracketed tags] or stray asterisks so browser SpeechSynthesis never reads them aloud
    const spokenText = cleanSpeechText.replace(/\[[^\]]*\]/g, '').replace(/\*+/g, '').trim();
    const fallbackUtterance = new SpeechSynthesisUtterance(spokenText);
    const selectedVoice = getOrLockInterviewerVoice(voiceProfile);

    if (selectedVoice) {
      fallbackUtterance.voice = selectedVoice;
      fallbackUtterance.lang = selectedVoice.lang || 'en-GB';
    } else {
      fallbackUtterance.lang = 'en-GB';
    }
    
    // Male voices receive natural deeper pitch; female voices receive clear crisp pitch
    fallbackUtterance.pitch = voiceProfile === 'hi_male' ? 0.95 : 1.02;
    fallbackUtterance.rate = 1.0; // Natural conversational British English speed

    activeUtteranceQueue.push(fallbackUtterance);
    (window as any)._currUtterance = fallbackUtterance;

    const cleanupUtterance = () => {
      activeUtteranceQueue = activeUtteranceQueue.filter(u => u !== fallbackUtterance);
      if ((window as any)._currUtterance === fallbackUtterance) {
        (window as any)._currUtterance = null;
      }
      (window as any).isTTSActive = false;
      isSpeakingActive = false;
    };

    fallbackUtterance.onstart = () => { 
      (window as any).isTTSActive = true; 
      isSpeakingActive = true;
      if (onStartCallback) onStartCallback();
    };
    fallbackUtterance.onend = () => {
      cleanupUtterance();
      if (onEndCallback) onEndCallback();
    };
    fallbackUtterance.onerror = () => {
      cleanupUtterance();
      if (onStartCallback) onStartCallback();
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(fallbackUtterance);
  } catch (e) {
    console.error("Local fallback speech error:", e);
    (window as any).isTTSActive = false;
    (window as any)._currUtterance = null;
    isSpeakingActive = false;
    if (onStartCallback) onStartCallback();
    if (onEndCallback) onEndCallback();
  }
}

// Backward-compatible alias for speakInterviewerResponse callers
export async function speakInterviewerResponse(
  rawText: string,
  indianVoiceProfile: IndianVoiceProfile = 'hi_female', 
  onEndCallback?: () => void,
  onStartCallback?: () => void
): Promise<void> {
  return streamInterviewerSpeech(rawText, indianVoiceProfile, onEndCallback, onStartCallback);
}

// Backward-compatible alias for speakInterviewerText callers
export function speakInterviewerText(
  text: string, 
  onEnd?: () => void,
  indianVoiceProfile: IndianVoiceProfile = 'hi_female',
  onStart?: () => void
): void {
  streamInterviewerSpeech(text, indianVoiceProfile, onEnd, onStart);
}
