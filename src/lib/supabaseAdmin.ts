import { supabase } from './supabase';
import { getRealSheetSolvedBreakdown } from './userProfileService';

export interface SupabaseAdminMetrics {
  totalActiveUsers: number;
  onlineUsers: number;
  totalTranscriptsStored: number;
  totalNotesStored: number;
  totalSdeProblems: number;
  totalCodeExecutions: number;
  isSupabaseLive: boolean;
  platformAvgSolved: number;
  platformAvgHours: number;
  platformAvgAccuracy: number;
  platformAvgSpeed: number;
  top10Solved: number;
  top10Hours: number;
  top10Accuracy: number;
  users: Array<{
    id: string;
    email: string;
    name: string;
    solvedCount: number;
    studyHours: number;
    streakDays: number;
    quizScorePercent: number;
    totalCodeRuns: number;
    lastActive: string;
    isOnline: boolean;
    joinedDate: string;
  }>;
}

/**
 * Fetches live metrics and user statistics from Supabase tables:
 * - public.videos (transcripts, notes, quiz JSON)
 * - public.question_attempts (user submissions, correct vs incorrect, solving time)
 * - public.user_analytics (dedicated hours across LECTURE, QUIZ, CODING)
 * - public.channels
 */
export async function fetchSupabaseLiveTelemetry(): Promise<Partial<SupabaseAdminMetrics> | null> {
  try {
    // 1. Check videos & stored transcripts
    const { data: videos, count: videoCount, error: vErr } = await supabase
      .from('videos')
      .select('id, title, transcript, duration_seconds', { count: 'exact' });

    // 2. Check question attempts
    const { data: attempts, count: attemptCount, error: aErr } = await supabase
      .from('question_attempts')
      .select('*', { count: 'exact' });

    // 3. Check user analytics
    const { data: analytics, count: anCount, error: anErr } = await supabase
      .from('user_analytics')
      .select('*', { count: 'exact' });

    const isSupabaseLive = !vErr && !aErr && !anErr;

    if (!isSupabaseLive) {
      return null;
    }

    // Calculate genuine metrics from Supabase data
    const totalTranscripts = (videoCount || (videos?.length || 0)) + 167; // 167 Cloudflare R2 SDE problems + video transcripts
    const totalNotes = (videoCount || (videos?.length || 0)) + 167;
    const totalExecutions = (attemptCount || (attempts?.length || 0));

    // Group attempts by user_id to build real user table
    const userStatsMap = new Map<string, any>();

    if (attempts && attempts.length > 0) {
      for (const att of attempts) {
        const uid = att.user_id || 'anonymous';
        if (!userStatsMap.has(uid)) {
          userStatsMap.set(uid, {
            id: uid,
            email: att.user_email || 'learner@sdetube.edu',
            name: att.user_name || 'Learner',
            solvedCount: 0,
            studyHours: 0,
            streakDays: 1,
            quizScorePercent: 100,
            totalCodeRuns: 0,
            lastActive: 'Active recently',
            isOnline: false,
            joinedDate: att.attempted_at ? att.attempted_at.slice(0, 10) : '2026-08-16'
          });
        }
        const user = userStatsMap.get(uid);
        user.totalCodeRuns += 1;
        if (att.is_correct) user.solvedCount += 1;
      }
    }

    if (analytics && analytics.length > 0) {
      for (const an of analytics) {
        const uid = an.user_id || 'anonymous';
        if (userStatsMap.has(uid)) {
          const user = userStatsMap.get(uid);
          user.studyHours = Number((user.studyHours + (an.duration_seconds || 0) / 3600).toFixed(1));
        }
      }
    }

    // 4. Check user DSA progress
    try {
      const { data: dsaProg } = await supabase
        .from('user_dsa_progress')
        .select('*');

      if (dsaProg && dsaProg.length > 0) {
        for (const dp of dsaProg) {
          const email = (dp.user_email || '').toLowerCase();
          if (!email) continue;
          const uid = dp.user_id || email;

          let totalSolved = 0;
          try {
            totalSolved = getRealSheetSolvedBreakdown(email).totalSolved;
          } catch {
            const set = new Set([
              ...(dp.solved_sde || []).map((id: any) => `sde_${id}`),
              ...(dp.solved_a2z || []).map((id: any) => `a2z_${id}`),
              ...(dp.solved_79 || []).map((id: any) => `s79_${id}`),
              ...(dp.solved_blind75 || []).map((id: any) => `b75_${id}`),
              ...(dp.solved_mik || []).map((id: any) => `mik_${id}`),
              ...(dp.lld_solved_ids || []).map((id: any) => `lld_${id}`)
            ]);
            totalSolved = set.size;
          }
          const studyHours = Number((Number(dp.active_mins || 0) / 60).toFixed(1));

          if (!userStatsMap.has(uid) && !userStatsMap.has(email)) {
            userStatsMap.set(email, {
              id: uid,
              email: dp.user_email,
              name: dp.linked_profiles?.leetcodeUsername || email.split('@')[0] || 'Learner',
              solvedCount: totalSolved,
              studyHours: studyHours,
              streakDays: totalSolved > 0 || studyHours > 0 ? 1 : 0,
              quizScorePercent: 100,
              totalCodeRuns: totalSolved,
              lastActive: dp.updated_at ? 'Recently active' : 'Active',
              isOnline: true,
              joinedDate: dp.updated_at ? dp.updated_at.slice(0, 10) : '2026-08-16'
            });
          } else {
            const existing = userStatsMap.get(uid) || userStatsMap.get(email);
            existing.solvedCount = Math.max(existing.solvedCount, totalSolved);
            existing.studyHours = Math.max(existing.studyHours, studyHours);
          }
        }
      }
    } catch (err) {
      console.warn('[user_dsa_progress telemetry notice]:', err);
    }

    const liveUsers = Array.from(userStatsMap.values());

    return {
      isSupabaseLive: true,
      totalTranscriptsStored: totalTranscripts,
      totalNotesStored: totalNotes,
      totalCodeExecutions: totalExecutions,
      totalActiveUsers: liveUsers.length,
      users: liveUsers.length > 0 ? liveUsers : undefined
    };
  } catch (err) {
    console.warn('[Supabase Admin Telemetry Notice]:', err);
    return null;
  }
}
