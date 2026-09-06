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

// Global pointer to track active audio element runtime
let currentInterviewerAudio: HTMLAudioElement | null = null;
let cachedKokoroClient: any = null;
let lastConnectedToken = '';

export type IndianVoiceProfile = 'hi_female' | 'hi_male';

interface KokoroAudioResponse {
  data: Array<{
    name?: string;
    url?: string;
    data?: string;
    is_file?: boolean;
  } | string>;
}

/**
 * Technical text pre-processor designed to control the Indian Voice Pack's cadence.
 * Forces elegant human-like structural pauses around complex corporate jargon.
 */
export function formatTextForIndianCadence(text: string): string {
  return text
    // 1. Maintain core platform redactions (From your specific code map)
    .replace(/```[\s\S]*?```/g, '... Check the code buffer I just updated in your arena ...')
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
    
    // 2. Local Indian corporate & technical acronym expansion
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
    
    // 3. Cadence Anchors: Injects vocal formatting markers to simulate active critical thinking
    .replace(/\b(look|see|actually|think about it|wait)\b/gi, '... $1 ...')
    .replace(/\.(\s+)/g, '. — ')
    .trim();
}

/**
 * Connects or returns existing cached authorized Gradio client for the private Space
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
 * Authenticates against your private Hugging Face space and streams high-fidelity 
 * Indian voice profiles directly back to the active client workspace.
 */
export async function speakInterviewerResponse(
  rawText: string,
  indianVoiceProfile: IndianVoiceProfile = 'hi_female', 
  onEndCallback?: () => void
): Promise<void> {

  // 1. Immediately drop running audio vectors to prepare for candidate vocal barge-in
  terminateInterviewerAudioSpeech();

  const cleanSpeechText = formatTextForIndianCadence(rawText);
  if (!cleanSpeechText) {
    if (onEndCallback) onEndCallback();
    return;
  }
  
  // Resolve environment variables based on Vite / NextJS runtime architectures
  const hfToken = ((import.meta as any).env?.VITE_HF_TOKEN || (typeof process !== 'undefined' ? (process as any)?.env?.NEXT_PUBLIC_HF_TOKEN : '')) || "";

  // If token is missing, gracefully drop to localized regional OS voices
  if (!hfToken) {
    console.warn("[Kokoro-TTS] VITE_HF_TOKEN not detected. Using localized Indian English OS fallback voice...");
    playLocalSpeechFallback(cleanSpeechText, onEndCallback);
    return;
  }

  try {
    // 2. Open authorized bridge session with your authenticated private Space
    const app = await getAuthenticatedKokoroClient(hfToken);
    
    // Map voice request to available Space models if needed
    let spaceVoice: string = indianVoiceProfile;
    if (indianVoiceProfile === 'hi_female') {
      spaceVoice = 'af_heart'; // High quality female voice with warm natural cadence
    } else if (indianVoiceProfile === 'hi_male') {
      spaceVoice = 'am_michael'; // Authoritative male tech lead voice
    }

    // 3. Request streaming output from the private endpoint pool
    let response: KokoroAudioResponse;
    try {
      response = await app.predict("/predict", {
        text: cleanSpeechText, 
        voice: spaceVoice, 
        speed: 1.03,               // Optimal professional velocity matching FAANG interview tempos
      }) as KokoroAudioResponse;
    } catch (predictErr: any) {
      if (spaceVoice !== 'af_heart') {
        response = await app.predict("/predict", {
          text: cleanSpeechText,
          voice: 'af_heart',
          speed: 1.03
        }) as KokoroAudioResponse;
      } else {
        throw predictErr;
      }
    }

    // 4. Construct live client-side element wrapper from generated data stream
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

      // Because the Space is private, fetch the audio binary with the Bearer token to create a playable blob
      if (hfToken && !secureAudioUrl.startsWith('data:') && !secureAudioUrl.startsWith('blob:')) {
        try {
          const fetchResp = await fetch(secureAudioUrl, {
            headers: {
              Authorization: `Bearer ${hfToken}`
            }
          });
          if (fetchResp.ok) {
            const blob = await fetchResp.blob();
            playableUrl = URL.createObjectURL(blob);
            isBlob = true;
          }
        } catch (fetchErr) {
          console.warn("[Kokoro-TTS] Auth fetch warning, using direct URL:", fetchErr);
        }
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

      // 5. Tie state flags directly into your audioVAD.ts architecture
      audio.onplay = () => {
        // Locks down microphone detection to prevent laptop speakers from creating echo loops
        (window as any).isTTSActive = true; 
        isSpeakingActive = true;
      };

      audio.onended = () => {
        // Releases line and initiates acoustic dissipation cooldown
        cleanup();
        if (onEndCallback) onEndCallback();
      };

      audio.onerror = (e) => {
        console.error("Kokoro Audio playback frame failure:", e);
        cleanup();
        playLocalSpeechFallback(cleanSpeechText, onEndCallback);
      };

      // 6. Fire playback action
      await audio.play();
    } else {
      throw new Error("Mismatched or empty data fields received from private workspace node.");
    }

  } catch (error) {
    console.warn("Private space connection dropped or unauthorized. Falling back to local OS speech engine...", error);
    cachedKokoroClient = null; // Clear cache on failure
    playLocalSpeechFallback(cleanSpeechText, onEndCallback);
  }
}

/**
 * Fail-safe boundary fallback: Gracefully drops down to local engine if Space hits quotas or errors
 */
function playLocalSpeechFallback(cleanSpeechText: string, onEndCallback?: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (typeof window !== 'undefined') (window as any).isTTSActive = false;
    isSpeakingActive = false;
    if (onEndCallback) onEndCallback();
    return;
  }

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    const fallbackUtterance = new SpeechSynthesisUtterance(cleanSpeechText);
    
    // Attempt to parse localized regional sub-voices native to the candidate's host OS (en-IN or hi-IN)
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
    };
    fallbackUtterance.onend = () => {
      (window as any).isTTSActive = false;
      isSpeakingActive = false;
      if (onEndCallback) onEndCallback();
    };
    fallbackUtterance.onerror = (e) => {
      (window as any).isTTSActive = false;
      isSpeakingActive = false;
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(fallbackUtterance);
  } catch (e) {
    console.error("Local fallback speech error:", e);
    (window as any).isTTSActive = false;
    isSpeakingActive = false;
    if (onEndCallback) onEndCallback();
  }
}

/**
 * Global cancellation handler triggered instantly when your audioVAD.ts engine flags a candidate barge-in.
 */
export function terminateInterviewerAudioSpeech(): void {
  if (currentInterviewerAudio) {
    try {
      currentInterviewerAudio.pause();
      currentInterviewerAudio.currentTime = 0;
    } catch {}
    currentInterviewerAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {}
  }
  if (typeof window !== 'undefined') {
    (window as any).isTTSActive = false;
  }
  isSpeakingActive = false;
}

// Backward-compatible alias for existing callers
export const stopInterviewerSpeech = terminateInterviewerAudioSpeech;

// Backward-compatible alias for speakInterviewerText callers
export function speakInterviewerText(
  text: string, 
  onEnd?: () => void,
  indianVoiceProfile: IndianVoiceProfile = 'hi_female'
): void {
  speakInterviewerResponse(text, indianVoiceProfile, onEnd);
}
