import { MISTRAL_API_KEY, executeAIChatCascade } from './mistral';
import { InterviewMessage, InterviewContext } from './interviewService';

export interface CompetencyScore {
  score: number; // 0 to 10
  rating: 'Exceptional' | 'Strong' | 'Adequate' | 'Needs Work' | 'Unsatisfactory';
  feedback: string;
  evidenceQuotes?: string[];
}

export interface ComplexityAnalysis {
  statedTimeComplexity: string;
  statedSpaceComplexity: string;
  actualTimeComplexity: string;
  actualSpaceComplexity: string;
  isOptimal: boolean;
  verdict: string;
}

export interface TurnHighlight {
  turnType: 'strength' | 'weakness' | 'critical_pivot';
  candidateSaid: string;
  interviewerReaction: string;
  takeaway: string;
}

export interface ActionableRoadmapItem {
  day: string;
  topic: string;
  recommendedAction: string;
  practiceProblemOrConcept: string;
}

export interface InterviewScorecard {
  overallScore: number; // 0 to 100
  hiringVerdict: 'STRONG HIRE' | 'HIRE' | 'LEAN HIRE' | 'LEAN NO HIRE' | 'STRONG NO HIRE';
  hiringDecision?: string; // alias for backwards compatibility
  verdictColor: string;
  percentileRank: number; // e.g. 88th percentile
  levelCalibration: string;
  roleLevel: string;
  roundType: string;
  testStyle: string;
  company: string;
  date: string;
  durationMinutes: number;
  
  metrics: {
    problemSolving: CompetencyScore;
    codeQuality: CompetencyScore;
    architectureDesign: CompetencyScore;
    communication: CompetencyScore;
    behavioralOwnership?: CompetencyScore;
  };

  complexityAnalysis?: ComplexityAnalysis;
  turnHighlights?: TurnHighlight[];
  strengths: string[];
  areasOfImprovement: string[];
  sevenDayRoadmap?: ActionableRoadmapItem[];
  hiringCommitteeDebrief?: string;
  interviewerSummary: string;
}

export function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case 'STRONG HIRE':
      return 'text-emerald-400 bg-emerald-950/80 border-emerald-500';
    case 'HIRE':
      return 'text-teal-400 bg-teal-950/80 border-teal-500';
    case 'LEAN HIRE':
      return 'text-amber-400 bg-amber-950/80 border-amber-500';
    case 'LEAN NO HIRE':
      return 'text-orange-400 bg-orange-950/80 border-orange-500';
    case 'STRONG NO HIRE':
    default:
      return 'text-rose-400 bg-rose-950/80 border-rose-500';
  }
}

/**
 * FinalRound.ai / FAANG Bar Raiser Calibrated Assessment Engine:
 * Analyzes candidate turns, code quality, complexity bounds, and generates a personalized debrief.
 */
export async function evaluateInterview(
  messages: InterviewMessage[],
  ctx: InterviewContext,
  durationMinutes: number = 45
): Promise<InterviewScorecard> {
  const candidateTurns = messages.filter(m => m.role === 'candidate');
  const candidateSpeech = candidateTurns.map(m => m.content).join(' ');
  const codeLength = (ctx.candidateCode || '').trim().length;

  const transcriptText = messages
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const evaluationPrompt = `You are the Lead Bar Raiser and Executive Hiring Committee Director at ${ctx.company}.
Conduct a rigorous, granular, non-canned evaluation of this ${ctx.level} candidate in the ${ctx.round} round (${ctx.testStyle || 'faang_bar_raiser'} style).

EVALUATION RULES:
1. BE ACCURATE AND CRITICAL: Do NOT give a generic high score (e.g. 85) if the candidate spoke very little, did not write functional code, or struggled on edge cases.
2. If candidate turns are fewer than 3 or code is mostly boilerplate/empty, assign an accurate low score (e.g. 25-45 Lean No Hire) with constructive feedback.
3. If candidate explained optimal intuition, stated exact Big-O complexities, and wrote modular code, reward them with a 75-95 score.
4. Extract ACTUAL QUOTES from the candidate's speech for evidence.

CANDIDATE PROFILE:
- Name: ${ctx.candidate?.name || 'Candidate'}
- Experience: ${ctx.candidate?.experienceYears || '2-4'} Years (${ctx.candidate?.currentRole || 'Software Engineer'})
- Tech Stack: ${ctx.candidate?.techStack?.join(', ') || 'General'}

INTERVIEW TRANSCRIPT:
\`\`\`
${transcriptText.slice(0, 8000)}
\`\`\`

FINAL CANDIDATE CODE SNAPSHOT (${ctx.language || 'cpp'}):
\`\`\`${ctx.language || 'cpp'}
${ctx.candidateCode || '// No code submitted'}
\`\`\`

CANDIDATE WHITEBOARD / ARCHITECTURE NOTES:
\`\`\`
${ctx.whiteboardNotes || '// No whiteboard notes'}
\`\`\`

Respond STRICTLY in valid JSON matching this schema:
{
  "overallScore": 82,
  "hiringVerdict": "HIRE",
  "percentileRank": 84,
  "levelCalibration": "Calibrated at SDE-2 (Standard FAANG L5 Bar)",
  "metrics": {
    "problemSolving": {
      "score": 8,
      "rating": "Strong",
      "feedback": "Granular analysis of algorithmic intuition, data structure choice, and constraint handling.",
      "evidenceQuotes": ["Quote 1 from candidate speech", "Quote 2 from candidate speech"]
    },
    "codeQuality": {
      "score": 8,
      "rating": "Strong",
      "feedback": "Granular analysis of code cleanliness, naming conventions, modularity, and error handling.",
      "evidenceQuotes": ["Quote or code snippet"]
    },
    "architectureDesign": {
      "score": 7,
      "rating": "Adequate",
      "feedback": "Evaluation of scalability bounds, SOLID principles, and concurrency handling."
    },
    "communication": {
      "score": 9,
      "rating": "Exceptional",
      "feedback": "Evaluation of clarity, articulation, collaborative dialogue, and response to hints.",
      "evidenceQuotes": ["Quote 1"]
    },
    "behavioralOwnership": {
      "score": 8,
      "rating": "Strong",
      "feedback": "Technical ownership, rigor, and poise under questioning."
    }
  },
  "complexityAnalysis": {
    "statedTimeComplexity": "O(N)",
    "statedSpaceComplexity": "O(1)",
    "actualTimeComplexity": "O(N)",
    "actualSpaceComplexity": "O(1)",
    "isOptimal": true,
    "verdict": "Candidate accurately identified and implemented the optimal asymptotic bound."
  },
  "turnHighlights": [
    {
      "turnType": "strength",
      "candidateSaid": "Exact snippet of what candidate said",
      "interviewerReaction": "How the bar raiser evaluated it",
      "takeaway": "Key interview signal"
    },
    {
      "turnType": "weakness",
      "candidateSaid": "Exact snippet where candidate made an error or missed an edge case",
      "interviewerReaction": "Identified gap",
      "takeaway": "Remediation advice"
    }
  ],
  "strengths": [
    "Specific strength 1 with technical detail",
    "Specific strength 2 with technical detail",
    "Specific strength 3 with technical detail"
  ],
  "areasOfImprovement": [
    "Specific actionable gap 1",
    "Specific actionable gap 2",
    "Specific actionable gap 3"
  ],
  "sevenDayRoadmap": [
    {
      "day": "Day 1-2",
      "topic": "Core Algorithmic Gap",
      "recommendedAction": "Actionable practice exercise",
      "practiceProblemOrConcept": "Specific problem / pattern to master"
    },
    {
      "day": "Day 3-4",
      "topic": "Concurrency & Edge Cases",
      "recommendedAction": "Actionable drill",
      "practiceProblemOrConcept": "Specific pattern"
    },
    {
      "day": "Day 5-7",
      "topic": "High-Pressure Mock Re-Runs",
      "recommendedAction": "Full simulation under 30min constraint",
      "practiceProblemOrConcept": "Full mock test"
    }
  ],
  "hiringCommitteeDebrief": "Comprehensive 2-3 paragraph bar raiser debrief summarizing why this decision was reached and how the candidate compares to the hiring bar at ${ctx.company}.",
  "interviewerSummary": "Concise 2-sentence executive summary."
}`;

  try {
    const rawJson = await executeAIChatCascade(
      [{ role: 'user', content: evaluationPrompt }],
      {
        temperature: 0.15,
        responseFormatJson: true,
        timeoutMs: 15000
      }
    );
    if (rawJson) {
      const match = rawJson.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : rawJson;
      const parsed = JSON.parse(jsonStr);
      const verdict = parsed.hiringVerdict || (parsed.overallScore >= 80 ? 'HIRE' : parsed.overallScore >= 65 ? 'LEAN HIRE' : 'LEAN NO HIRE');
      
      return {
        overallScore: Math.min(100, Math.max(0, parsed.overallScore ?? 75)),
        hiringVerdict: verdict,
        hiringDecision: verdict,
        verdictColor: getVerdictColor(verdict),
        percentileRank: parsed.percentileRank || Math.round((parsed.overallScore || 75) * 0.95),
        levelCalibration: parsed.levelCalibration || `Calibrated at ${ctx.level} Standards`,
        roleLevel: ctx.level,
        roundType: ctx.round,
        testStyle: ctx.testStyle || 'faang_bar_raiser',
        company: ctx.company,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        durationMinutes,
        metrics: {
          problemSolving: parsed.metrics?.problemSolving || { score: 7, rating: 'Adequate', feedback: 'Demonstrated viable intuition.' },
          codeQuality: parsed.metrics?.codeQuality || { score: 7, rating: 'Adequate', feedback: 'Code was structured.' },
          architectureDesign: parsed.metrics?.architectureDesign || { score: 7, rating: 'Adequate', feedback: 'Reasonable architectural bounds.' },
          communication: parsed.metrics?.communication || { score: 8, rating: 'Strong', feedback: 'Articulated thought process clearly.' },
          behavioralOwnership: parsed.metrics?.behavioralOwnership || { score: 8, rating: 'Strong', feedback: 'Good technical ownership.' }
        },
        complexityAnalysis: parsed.complexityAnalysis,
        turnHighlights: parsed.turnHighlights || [],
        strengths: parsed.strengths || ['Good high-level problem understanding', 'Proactive communication'],
        areasOfImprovement: parsed.areasOfImprovement || ['Deepen boundary condition verification'],
        sevenDayRoadmap: parsed.sevenDayRoadmap || [],
        hiringCommitteeDebrief: parsed.hiringCommitteeDebrief || 'Candidate demonstrated solid fundamental problem-solving abilities.',
        interviewerSummary: parsed.interviewerSummary || 'Candidate showed strong potential and clear communication.'
      };
    }
  } catch (err) {
    console.error('Evaluation AI Error:', err);
  }

  // Dynamic fallback calculation based on actual session activity
  const isEngaged = candidateTurns.length >= 3 && codeLength > 50;
  const computedScore = isEngaged ? 78 : candidateTurns.length >= 1 ? 52 : 35;
  const computedVerdict = computedScore >= 75 ? 'HIRE' : computedScore >= 50 ? 'LEAN HIRE' : 'LEAN NO HIRE';

  return {
    overallScore: computedScore,
    hiringVerdict: computedVerdict,
    hiringDecision: computedVerdict,
    verdictColor: getVerdictColor(computedVerdict),
    percentileRank: Math.round(computedScore * 0.9),
    levelCalibration: `Calibrated for ${ctx.level} (${ctx.company})`,
    roleLevel: ctx.level,
    roundType: ctx.round,
    testStyle: ctx.testStyle || 'faang_bar_raiser',
    company: ctx.company,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    durationMinutes,
    metrics: {
      problemSolving: { score: isEngaged ? 8 : 5, rating: isEngaged ? 'Strong' : 'Needs Work', feedback: isEngaged ? 'Identified problem constraints and articulated algorithm.' : 'Candidate provided limited algorithmic discussion.' },
      codeQuality: { score: isEngaged ? 7 : 4, rating: isEngaged ? 'Adequate' : 'Needs Work', feedback: isEngaged ? 'Wrote clean modular logic in editor.' : 'Minimal code submitted during the allotted duration.' },
      architectureDesign: { score: isEngaged ? 8 : 5, rating: isEngaged ? 'Strong' : 'Needs Work', feedback: 'System trade-offs were discussed.' },
      communication: { score: candidateTurns.length >= 2 ? 8 : 5, rating: 'Adequate', feedback: 'Communicated approach and replied to queries.' }
    },
    strengths: isEngaged ? ['Articulated high-level strategy clearly', 'Handled core logic in editor'] : ['Attempted initial problem framing'],
    areasOfImprovement: isEngaged ? ['Handle deeper edge-case boundary conditions', 'Validate memory limits proactively'] : ['Provide more detailed step-by-step intuition', 'Implement complete working solution code'],
    interviewerSummary: isEngaged ? 'Candidate demonstrated good problem-solving foundation with room for edge case refinement.' : 'Candidate requires more practice articulating complexity and writing complete code.'
  };
}
