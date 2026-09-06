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
  // Extract starting emotional cue tag if present
  const emotionMatch = text.match(/^\[(sternly|thoughtfully|encouragingly|approvingly)\]/i);
  const prefixTag = emotionMatch ? emotionMatch[0] : "";
  
  let coreBody = emotionMatch ? text.slice(prefixTag.length) : text;

  coreBody = coreBody
    // Core platform text cleanup rules (From your specific code map)
    .replace(/```[\s\S]*?```/g, '... Reviewing the code block inside your workspace arena ...')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[\u{1F300}-\u{1FAD6}\u{2000}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/\bO\(1\)/gi, 'O of 1')
    .replace(/\bO\(n\)/gi, 'O of n')
    .replace(/\bO\(n\s*\*\s*log\s*n\)/gi, 'O of n log n')
    .replace(/\bO\(log\s*n\)/gi, 'O of log n')
    .replace(/\bO\(n\^?2\)/gi, 'O of n squared')
    .replace(/\bO\(2\^?n\)/gi, 'O of 2 to the n')
    .replace(/\bQPS\b/g, 'Q P S')
    .replace(/\bTPS\b/g, 'T P S')
    .replace(/\bSPOF\b/g, 'single point of failure')
    
    // Indian corporate & engineering phrasing normalization
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
    
    // Injected physical breathing pauses for realistic conversational delivery
    .replace(/\b(look|see|actually|think about it|wait)\b/gi, '... $1 ...')
    .replace(/\.(\s+)/g, '. — ');

  return `${prefixTag} ${coreBody.trim()}`.trim();
}

export const formatTextForIndianCadence = textToSpeechNormalizer;

/**
 * Dispatches stateless POST requests directly to Fish Audio's fair-use developer endpoint (s2.1-pro-free)
 */
async function generateAndBufferChunk(sentenceText: string, voiceId: string): Promise<boolean> {
  if (!sentenceText || !sentenceText.trim()) return false;

  const apiKey = ((import.meta as any).env?.VITE_FISH_AUDIO_API_KEY || (typeof process !== 'undefined' ? (process as any)?.env?.NEXT_PUBLIC_FISH_AUDIO_API_KEY : '')) || "";
  if (!apiKey) return false;

  try {
    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: sentenceText.trim(),
        model: "s2.1-pro-free",  // Explicit unmetered developer handle
        voice_id: voiceId !== 'default' && voiceId !== 'hi_female' && voiceId !== 'hi_male' ? voiceId : undefined,
        response_format: "mp3"
      })
    });

    if (!response.ok) {
      console.warn(`[Fish Audio] Edge server status ${response.status} (${response.statusText}). Triggering resilient fallback.`);
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
    console.error("[Fish Audio] Segment pipeline failure:", error);
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
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
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

  // Segment input strictly by punctuation parameters (. ! ?)
  const sentences = normalizedText.match(/[^.!?]+[.!?]+/g) || [normalizedText];
  const emotionMatch = normalizedText.match(/^\[(sternly|thoughtfully|encouragingly|approvingly)\]/i);
  const emotionTag = emotionMatch ? emotionMatch[0] : "";

  const apiKey = ((import.meta as any).env?.VITE_FISH_AUDIO_API_KEY || (typeof process !== 'undefined' ? (process as any)?.env?.NEXT_PUBLIC_FISH_AUDIO_API_KEY : '')) || "";

  if (apiKey) {
    pendingChunkCount = sentences.length;

    // Fire sentence 1 instantly to hit sub-90ms startup boundaries
    const firstChunkOk = await generateAndBufferChunk(sentences[0], voiceId);
    pendingChunkCount--;

    if (firstChunkOk) {
      // Sentence 1 ready and playing! Background fetch remaining tracks sequentially
      (async () => {
        for (let i = 1; i < sentences.length; i++) {
          const sentenceWithTone = emotionTag ? `${emotionTag} ${sentences[i].trim()}` : sentences[i];
          await generateAndBufferChunk(sentenceWithTone, voiceId);
          pendingChunkCount--;
        }
      })();
      return;
    }
  }

  // Resilient Fallback: If Fish Audio key is missing, hits API credit limits, or errors,
  // seamlessly drop to authenticated Kokoro-TTS or regional local OS voices!
  const voiceProfile: IndianVoiceProfile = voiceId === 'hi_male' ? 'hi_male' : 'hi_female';
  await playKokoroOrLocalFallback(normalizedText, voiceProfile, onEnd, onStart);
}

/**
 * Connects or returns existing cached authorized Gradio client for the private Kokoro-TTS Space
 */
async function getAuthenticatedKokoroClient(token: string) {
  if (cachedKokoroClient && lastConnectedToken === token) {
    return cachedKokoroClient;
  }
  const app = await Client.connect("mdalamrahman/Kokoro-TTS", {
    token: (token || "") as `hf_${string}`
  });
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
  const hfToken = ((import.meta as any).env?.VITE_HF_TOKEN || (typeof process !== 'undefined' ? (process as any)?.env?.NEXT_PUBLIC_HF_TOKEN : '')) || "";

  if (!hfToken) {
    playLocalSpeechFallback(cleanSpeechText, onEndCallback, onStartCallback);
    return;
  }

  try {
    const app = await getAuthenticatedKokoroClient(hfToken);
    let spaceVoice = indianVoiceProfile === 'hi_male' ? 'am_michael' : 'af_heart';

    let response: KokoroAudioResponse;
    try {
      response = await app.predict("/predict", {
        text: cleanSpeechText,
        voice: spaceVoice,
        speed: 1.03,
      }) as KokoroAudioResponse;
    } catch {
      response = await app.predict("/predict", {
        text: cleanSpeechText,
        voice: 'af_heart',
        speed: 1.03
      }) as KokoroAudioResponse;
    }

    let secureAudioUrl = '';
    const item = response?.data?.[0];
    if (typeof item === 'string') {
      secureAudioUrl = item;
    } else if (item && typeof item === 'object') {
      secureAudioUrl = (item as any).url || (item as any).name || (item as any).data || '';
    }

    if (secureAudioUrl) {
      let playableUrl = secureAudioUrl;
      let isBlob = false;

      if (hfToken && !secureAudioUrl.startsWith('data:') && !secureAudioUrl.startsWith('blob:')) {
        try {
          const fetchResp = await fetch(secureAudioUrl, {
            headers: { Authorization: `Bearer ${hfToken}` }
          });
          if (fetchResp.ok) {
            const blob = await fetchResp.blob();
            playableUrl = URL.createObjectURL(blob);
            isBlob = true;
          }
        } catch {}
      }

      const audio = new Audio(playableUrl);
      currentInterviewerAudio = audio;

      const cleanup = () => {
        (window as any).isTTSActive = false;
        isSpeakingActive = false;
        currentInterviewerAudio = null;
        if (isBlob) {
          try { URL.revokeObjectURL(playableUrl); } catch {}
        }
      };

      audio.onplay = () => {
        (window as any).isTTSActive = true;
        isSpeakingActive = true;
        if (onStartCallback) onStartCallback();
      };

      audio.onended = () => {
        cleanup();
        if (onEndCallback) onEndCallback();
      };

      audio.onerror = () => {
        cleanup();
        playLocalSpeechFallback(cleanSpeechText, onEndCallback, onStartCallback);
      };

      await audio.play();
    } else {
      playLocalSpeechFallback(cleanSpeechText, onEndCallback, onStartCallback);
    }
  } catch {
    cachedKokoroClient = null;
    playLocalSpeechFallback(cleanSpeechText, onEndCallback, onStartCallback);
  }
}

/**
 * Fail-safe boundary fallback: Gracefully drops down to local OS regional voice engine
 */
function playLocalSpeechFallback(
  cleanSpeechText: string, 
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
    const fallbackUtterance = new SpeechSynthesisUtterance(cleanSpeechText);
    const nativeSystemVoices = window.speechSynthesis.getVoices();
    const nativeIndianVoice = nativeSystemVoices.find(v => 
      v.lang === 'en-IN' || v.lang === 'hi-IN' || v.name.includes('India') || v.name.includes('Ravi') || v.name.includes('Heera') || v.name.includes('Kavya')
    ) || getOrLockInterviewerVoice();

    if (nativeIndianVoice) {
      fallbackUtterance.voice = nativeIndianVoice;
      fallbackUtterance.lang = nativeIndianVoice.lang;
    }
    fallbackUtterance.rate = 1.0;

    fallbackUtterance.onstart = () => { 
      (window as any).isTTSActive = true; 
      isSpeakingActive = true;
      if (onStartCallback) onStartCallback();
    };
    fallbackUtterance.onend = () => {
      (window as any).isTTSActive = false;
      isSpeakingActive = false;
      if (onEndCallback) onEndCallback();
    };
    fallbackUtterance.onerror = () => {
      (window as any).isTTSActive = false;
      isSpeakingActive = false;
      if (onStartCallback) onStartCallback();
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(fallbackUtterance);
  } catch (e) {
    console.error("Local fallback speech error:", e);
    (window as any).isTTSActive = false;
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
