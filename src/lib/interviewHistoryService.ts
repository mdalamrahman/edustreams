import { supabaseAdmin, supabase } from './supabase';
import { InterviewMessage, InterviewContext } from './interviewService';
import { InterviewScorecard } from './interviewEvaluator';

export interface StoredInterviewRecord {
  id: string;
  company: string;
  level: string;
  round: string;
  test_style: string;
  question_title: string;
  overall_score: number;
  hiring_decision: string;
  duration_minutes: number;
  r2_storage_key?: string;
  created_at: string;
}

export interface FullInterviewSessionPayload {
  id: string;
  user_email?: string;
  candidate_name?: string;
  company: string;
  level: string;
  round: string;
  test_style: string;
  question?: any;
  messages: InterviewMessage[];
  candidateCode?: string;
  whiteboardNotes?: string;
  language?: string;
  scorecard: InterviewScorecard;
  duration_minutes: number;
  created_at: string;
}

const LOCAL_STORAGE_KEY = 'sdetube_mock_interview_history';
const API_BASE = (import.meta.env.VITE_API_URL || 'https://edustream-backend.onrender.com').replace(/\/$/, '');

/**
 * Persists full interview session to Cloudflare R2 + Supabase and updates local storage.
 */
export async function saveInterviewSession(
  messages: InterviewMessage[],
  ctx: InterviewContext,
  scorecard: InterviewScorecard,
  durationMinutes: number
): Promise<{ success: boolean; interviewId: string; r2Key?: string }> {
  const interviewId = `interview_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const candidateEmail = ctx.candidate?.name?.toLowerCase().replace(/\s+/g, '_') || 'candidate';
  const createdAt = new Date().toISOString();

  const payload: FullInterviewSessionPayload = {
    id: interviewId,
    user_email: candidateEmail,
    candidate_name: ctx.candidate?.name || 'Candidate',
    company: ctx.company,
    level: ctx.level,
    round: ctx.round,
    test_style: ctx.testStyle || 'faang_bar_raiser',
    question: ctx.question,
    messages: messages,
    candidateCode: ctx.candidateCode,
    whiteboardNotes: ctx.whiteboardNotes,
    language: ctx.language,
    scorecard: scorecard,
    duration_minutes: durationMinutes,
    created_at: createdAt
  };

  // 1. LocalStorage Instant Cache
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existingList: FullInterviewSessionPayload[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [payload, ...existingList.filter(item => item.id !== interviewId)].slice(0, 30);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage interview cache error:', err);
  }

  // 2. Cloudflare R2 + Supabase Storage via Render Backend
  try {
    const res = await fetch(`${API_BASE}/api/interview/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, interviewId, r2Key: data.r2_storage_key };
    }
  } catch (apiErr) {
    console.warn('Backend interview save error, falling back to direct Supabase sync:', apiErr);
  }

  // 3. Fallback direct Supabase metadata index
  try {
    const summaryRecord: StoredInterviewRecord = {
      id: interviewId,
      company: ctx.company,
      level: ctx.level,
      round: ctx.round,
      test_style: ctx.testStyle || 'faang_bar_raiser',
      question_title: ctx.question?.title || 'Mock Technical Interview',
      overall_score: scorecard.overallScore,
      hiring_decision: scorecard.hiringDecision || scorecard.hiringVerdict || 'HIRE',
      duration_minutes: durationMinutes,
      r2_storage_key: `interviews/${interviewId}.json`,
      created_at: createdAt
    };

    const { data } = await supabase
      .from('user_dsa_progress')
      .select('linked_profiles')
      .eq('user_email', candidateEmail)
      .single();

    const existingInterviews = data?.linked_profiles?.mock_interviews || [];
    const updatedInterviews = [summaryRecord, ...existingInterviews.filter((r: any) => r.id !== interviewId)].slice(0, 30);

    await supabase
      .from('user_dsa_progress')
      .upsert({
        user_email: candidateEmail,
        linked_profiles: { mock_interviews: updatedInterviews },
        updated_at: createdAt
      });
  } catch (sbErr) {
    console.warn('Direct Supabase interview sync error:', sbErr);
  }

  return { success: true, interviewId, r2Key: `interviews/${interviewId}.json` };
}

/**
 * Fetches all past interview scorecard records for the user.
 */
export async function getInterviewHistory(candidateName: string = 'Candidate'): Promise<StoredInterviewRecord[]> {
  const candidateEmail = candidateName.toLowerCase().replace(/\s+/g, '_');

  // 1. Try Backend API
  try {
    const res = await fetch(`${API_BASE}/api/interview/history?user_email=${encodeURIComponent(candidateEmail)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.interviews) && data.interviews.length > 0) {
        return data.interviews;
      }
    }
  } catch {}

  // 2. Try Supabase
  try {
    const { data } = await supabase
      .from('user_dsa_progress')
      .select('linked_profiles')
      .eq('user_email', candidateEmail)
      .single();

    if (data?.linked_profiles?.mock_interviews && Array.isArray(data.linked_profiles.mock_interviews)) {
      return data.linked_profiles.mock_interviews;
    }
  } catch {}

  // 3. Fallback to LocalStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const list: FullInterviewSessionPayload[] = JSON.parse(raw);
      return list.map(item => ({
        id: item.id,
        company: item.company,
        level: item.level,
        round: item.round,
        test_style: item.test_style,
        question_title: item.question?.title || 'Mock Technical Interview',
        overall_score: item.scorecard?.overallScore || 0,
        hiring_decision: item.scorecard?.hiringDecision || 'Strong Hire',
        duration_minutes: item.duration_minutes || 45,
        r2_storage_key: `interviews/${item.id}.json`,
        created_at: item.created_at
      }));
    }
  } catch {}

  return [];
}

/**
 * Fetches the complete session transcript & details by ID (from Cloudflare R2 or LocalStorage).
 */
export async function getInterviewSessionDetails(interviewId: string): Promise<FullInterviewSessionPayload | null> {
  // 1. Try Cloudflare R2 via Backend API
  try {
    const res = await fetch(`${API_BASE}/api/interview/${interviewId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.interview) return data.interview;
    }
  } catch {}

  // 2. Fallback to LocalStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const list: FullInterviewSessionPayload[] = JSON.parse(raw);
      const found = list.find(item => item.id === interviewId);
      if (found) return found;
    }
  } catch {}

  return null;
}
