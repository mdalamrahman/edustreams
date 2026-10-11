import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Video, QuizQuestion } from './types';
import { MOCK_CHANNELS, MOCK_VIDEOS, supabase } from './supabase';
import { checkAndAutoLogin, signOutStudent } from './auth';
import { startSessionHeartbeat } from './session';
import { recordRealActivity, markProblemSolved } from './analytics';
import { fetchCatalog, TELEGRAM_BACKEND_URL } from './telegram';
import { requestMistralQuiz } from './mistral';
import { handleVideoViewBilling, canAffordAction, deductCredits, syncWalletWithDatabase, PRICING_CONFIG } from './billing';
import { getRealtimeTranscriptStatus } from './redis';

const sanitizeCaption = (cap?: string) => {
  if (!cap) return '';
  return cap
    .replace(/Follow Now:\s*https?:\/\/[^\s\n]+/gi, '')
    .replace(/https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+/gi, '')
    .trim();
};

const getInitialVideo = (): Video => {
  if (typeof window === 'undefined') return MOCK_VIDEOS[0];
  try {
    const saved = localStorage.getItem('edustream_last_selected_video');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id) return parsed;
    }
  } catch {}
  return MOCK_VIDEOS[0];
};

const getInitialChannel = (): string => {
  if (typeof window === 'undefined') return MOCK_CHANNELS[0].id;
  try {
    const saved = localStorage.getItem('edustream_last_selected_channel');
    if (saved) return saved;
  } catch {}
  return MOCK_CHANNELS[0].id;
};

export interface AppContextValue {
  // Auth
  user: any;
  setUser: (u: any) => void;
  authChecking: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (v: boolean) => void;
  revokedSessionMessage: string;
  setRevokedSessionMessage: (msg: string) => void;
  signOut: () => Promise<void>;

  // Video Catalog
  dynamicVideos: Video[];
  setDynamicVideos: React.Dispatch<React.SetStateAction<Video[]>>;
  selectedVideo: Video;
  setSelectedVideo: (v: Video) => void;
  selectedChannelId: string;
  setSelectedChannelId: (id: string) => void;
  channelViewMode: 'overview' | 'detail';
  setChannelViewMode: (m: 'overview' | 'detail') => void;
  catalogLoading: boolean;
  channelCounts: Record<string, number>;

  // Video Artifacts & Quizzes
  videoArtifacts: any;
  setVideoArtifacts: React.Dispatch<React.SetStateAction<any>>;
  activeVideoQuiz: QuizQuestion[];
  setActiveVideoQuiz: (q: QuizQuestion[]) => void;
  quizLoading: boolean;
  isGeneratingMoreQuiz: boolean;
  handleAttemptMoreQuestions: () => Promise<void>;
  lessonSubTab: 'quiz' | 'code';
  setLessonSubTab: (tab: 'quiz' | 'code') => void;

  // Lecture Completion Tracking
  completedLectures: Set<string>;
  toggleLectureComplete: (videoId: string) => void;
  handleAutoComplete: (videoId: string) => void;

  // Modals & Panels
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (v: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (v: boolean) => void;
  isInsufficientCreditsOpen: boolean;
  setIsInsufficientCreditsOpen: (v: boolean) => void;
  insufficientMeta: { cost: number; action: string };
  setInsufficientMeta: (m: { cost: number; action: string }) => void;
  isAskAIOpen: boolean;
  setIsAskAIOpen: (v: boolean) => void;
  askAIMode: 'video' | 'notes' | 'quiz' | 'code' | undefined;
  setAskAIMode: (m: 'video' | 'notes' | 'quiz' | 'code' | undefined) => void;
  askAITimestamp: number | undefined;
  setAskAITimestamp: (ts: number | undefined) => void;
  openAskAIWithMode: (mode?: 'video' | 'notes' | 'quiz' | 'code', timestamp?: number) => void;
  isPotdModalOpen: boolean;
  setIsPotdModalOpen: (v: boolean) => void;
  showMobileGating: boolean;
  setShowMobileGating: (v: boolean) => void;

  // Analytics
  totalSolved: number;
  totalActiveMins: number;
  correctAttempts: number;
  timeBreakdown: { lecturesMins: number; quizzesMins: number; codingMins: number };
  accuracyPercent: number;
  handleQuizSubmitted: (timeTakenSeconds: number, isCorrect: boolean) => void;
  handleQuestionSolved: (timeTakenSeconds?: number, isCorrect?: boolean) => void;

  // Billing Actions
  openVideoWithBilling: (v: Video, destination?: 'channels' | 'sde_sheet') => boolean;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return ctx;
}

export const useAppContext = useApp;

export function AppContextProvider({ children }: { children: ReactNode }) {
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [revokedSessionMessage, setRevokedSessionMessage] = useState<string>('');

  // Catalog State
  const [dynamicVideos, setDynamicVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video>(getInitialVideo);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(getInitialChannel);
  const [channelViewMode, setChannelViewMode] = useState<'overview' | 'detail'>('overview');
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [channelCounts, setChannelCounts] = useState<Record<string, number>>({});

  // Artifacts & Quizzes
  const [videoArtifacts, setVideoArtifacts] = useState<any>(null);
  const [activeVideoQuiz, setActiveVideoQuiz] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [isGeneratingMoreQuiz, setIsGeneratingMoreQuiz] = useState<boolean>(false);
  const [lessonSubTab, setLessonSubTab] = useState<'quiz' | 'code'>('code');

  // Modals
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isInsufficientCreditsOpen, setIsInsufficientCreditsOpen] = useState<boolean>(false);
  const [insufficientMeta, setInsufficientMeta] = useState<{ cost: number; action: string }>({
    cost: 2.0,
    action: 'Accessing Video Lecture',
  });
  const [isAskAIOpen, setIsAskAIOpen] = useState<boolean>(false);
  const [askAIMode, setAskAIMode] = useState<'video' | 'notes' | 'quiz' | 'code' | undefined>(undefined);
  const [askAITimestamp, setAskAITimestamp] = useState<number | undefined>(undefined);
  const [isPotdModalOpen, setIsPotdModalOpen] = useState<boolean>(false);
  const [showMobileGating, setShowMobileGating] = useState<boolean>(false);

  // Lecture Completion Tracking
  const [completedLectures, setCompletedLectures] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('edustream_completed_lectures');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleLectureComplete = (videoId: string) => {
    setCompletedLectures((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      localStorage.setItem('edustream_completed_lectures', JSON.stringify([...next]));
      return next;
    });
  };

  const handleAutoComplete = (videoId: string) => {
    if (!completedLectures.has(videoId)) {
      setCompletedLectures((prev) => {
        const next = new Set(prev);
        next.add(videoId);
        localStorage.setItem('edustream_completed_lectures', JSON.stringify([...next]));
        return next;
      });
    }
  };

  // Analytics State
  const [totalSolved, setTotalSolved] = useState<number>(() => {
    try {
      const sdeSolved = JSON.parse(localStorage.getItem('sdestream_solved_problems') || '[]');
      const generalSolved = parseInt(localStorage.getItem('edustream_total_solved') || '0', 10);
      const sdeCount = Array.isArray(sdeSolved) ? sdeSolved.length : 0;
      return Math.max(sdeCount, generalSolved);
    } catch {
      return 0;
    }
  });

  const [totalActiveMins, setTotalActiveMins] = useState<number>(() => {
    const saved = localStorage.getItem('edustream_active_mins');
    return saved ? parseFloat(saved) : 0.0;
  });

  const [correctAttempts, setCorrectAttempts] = useState<number>(() => {
    const saved = localStorage.getItem('edustream_correct_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [timeBreakdown, setTimeBreakdown] = useState(() => {
    const saved = localStorage.getItem('edustream_time_breakdown');
    return saved ? JSON.parse(saved) : { lecturesMins: 0, quizzesMins: 0, codingMins: 0 };
  });

  // Re-sync analytics values
  const refreshAnalyticsFromStorage = () => {
    try {
      const sdeSolved1 = JSON.parse(localStorage.getItem('sdetube_sde_sheet_solved_ids') || '[]');
      const sdeSolved2 = JSON.parse(localStorage.getItem('sdestream_solved_problems') || '[]');
      const combinedSolvedSet = new Set([
        ...(Array.isArray(sdeSolved1) ? sdeSolved1 : []),
        ...(Array.isArray(sdeSolved2) ? sdeSolved2 : [])
      ]);
      const sdeCount = combinedSolvedSet.size;
      const generalSolved = parseInt(localStorage.getItem('edustream_total_solved') || '0', 10);
      const combinedSolved = Math.max(sdeCount, generalSolved);
      setTotalSolved(combinedSolved);

      const activeMins = parseFloat(localStorage.getItem('edustream_active_mins') || '0');
      setTotalActiveMins(activeMins);

      const timeBreakdownSaved = localStorage.getItem('edustream_time_breakdown');
      if (timeBreakdownSaved) {
        setTimeBreakdown(JSON.parse(timeBreakdownSaved));
      } else if (activeMins > 0 || combinedSolved > 0) {
        const estimatedCodingMins = combinedSolved * 15;
        const total = Math.max(activeMins, estimatedCodingMins);
        setTimeBreakdown({
          lecturesMins: Math.round(total * 0.3),
          quizzesMins: Math.round(total * 0.1),
          codingMins: Math.round(total * 0.6)
        });
      }

      const savedCorrect = parseInt(localStorage.getItem('edustream_correct_attempts') || '0', 10);
      setCorrectAttempts(Math.max(combinedSolved, savedCorrect));
    } catch {}
  };

  useEffect(() => {
    refreshAnalyticsFromStorage();
  }, []);

  const handleQuizSubmitted = (timeTakenSeconds: number, isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAttempts((prev) => prev + 1);
      setTotalSolved((prev) => prev + 1);
    }
    const mins = Math.max(0.1, Number((timeTakenSeconds / 60).toFixed(1)));
    setTotalActiveMins((prev) => Number((prev + mins).toFixed(1)));
    setTimeBreakdown((prev: any) => ({
      ...prev,
      quizzesMins: Number(((prev?.quizzesMins || 0) + mins).toFixed(1))
    }));
  };

  const handleQuestionSolved = (timeTakenSeconds?: number, isCorrect?: boolean) => {
    const mins = Math.max(0.5, Number(((timeTakenSeconds || 60) / 60).toFixed(1)));
    const correct = isCorrect !== false;

    if (correct) {
      const target = selectedVideo?.title || 'Problem';
      markProblemSolved(target, mins);
      setTotalSolved((prev) => prev + 1);
      setCorrectAttempts((prev) => prev + 1);
    } else {
      recordRealActivity('coding', mins, 0, false);
    }

    setTotalActiveMins((prev) => Number((prev + mins).toFixed(1)));
    setTimeBreakdown((prev: { lecturesMins: number; quizzesMins: number; codingMins: number }) => ({
      ...prev,
      codingMins: Math.round(prev.codingMins + mins)
    }));
  };

  const accuracyPercent = useMemo(() => {
    const totalAttempts = parseInt(localStorage.getItem('edustream_total_attempts') || '0', 10);
    const validSolved = Math.max(totalSolved, correctAttempts);
    if (validSolved === 0) return 0;
    if (totalAttempts === 0) return 100;
    return Math.min(100, Math.round((validSolved / Math.max(validSolved, totalAttempts)) * 100));
  }, [totalSolved, correctAttempts]);

  // Auth restore & heartbeat
  useEffect(() => {
    checkAndAutoLogin().then((student) => {
      if (student) {
        setUser(student);
      }
    }).catch((err) => {
      console.warn('[SDETube Auth] notice:', err);
    }).finally(() => {
      setAuthChecking(false);
    });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const inviteCode = params.get('passcode') || params.get('passkey') || params.get('code') || params.get('otp') || params.get('verify_email');
      if (inviteCode) {
        setIsAuthModalOpen(true);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && session.user.email_confirmed_at) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.email) return;

    syncWalletWithDatabase(user.email).catch(() => {});

    const cleanup = startSessionHeartbeat(user.email, (msg) => {
      console.warn('[SDETube Session] Revoked from another device:', msg);
      setRevokedSessionMessage(msg);
      signOutStudent();
      setUser(null);
    });

    return () => cleanup();
  }, [user?.email]);

  // Video catalog loading
  useEffect(() => {
    setCatalogLoading(true);
    fetchCatalog()
      .then((data: any) => {
        const channels = data?.channels || {};
        const allVideos: Video[] = [];
        const counts: Record<string, number> = {};

        const channelNameToId: Record<string, string> = {
          'DSA': 'ch-dsa-01',
          'System Design': 'ch-sd-02',
          'DBMS': 'ch-dbms-03',
          'Computer Networks': 'ch-cn-04',
          'High Level Design': 'ch-hld-05',
        };

        for (const [chName, chData] of Object.entries(channels) as [string, any][]) {
          const channelId = channelNameToId[chName] || chName;
          const videos = chData?.videos || [];
          counts[channelId] = chData?.count || videos.length;

          for (const v of videos) {
            allVideos.push({
              id: `tg-${channelId}-${v.msg_id}`,
              channel_id: channelId,
              telegram_file_id: v.file_id || '',
              telegram_message_id: v.msg_id,
              sender_username: '@SDETubeBot',
              title: (v.file_name || `Lecture ${v.msg_id}`).replace(/\.(mp4|mkv|webm|avi|mov|flv)$/i, ''),
              telegram_caption: sanitizeCaption(v.caption) || `📌 [SDETube Lecture #${v.msg_id} | Size: ${v.size_mb} MB]\nFile: ${v.file_name}`,
              duration_seconds: v.duration || 0,
              transcript: `SDETube Lecture #${v.msg_id} (${v.file_name}). Stream powered by SDETube Cloud Engine.`,
              thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
              stream_url: `${TELEGRAM_BACKEND_URL}${v.stream_url}`,
              created_at: v.date || new Date().toISOString(),
              quiz_json: [],
              attachments: [],
            });
          }
        }

        if (allVideos.length > 0) {
          setDynamicVideos(allVideos);
          setChannelCounts(counts);
          const firstChannelVideos = allVideos.filter(v => v.channel_id === selectedChannelId);
          if (firstChannelVideos.length > 0 && selectedVideo.id === MOCK_VIDEOS[0].id) {
            setSelectedVideo(firstChannelVideos[0]);
          }
        }
      })
      .catch((err) => {
        console.warn('[SDETube] Using fallback catalog:', err);
      })
      .finally(() => setCatalogLoading(false));
  }, []);

  // Save selected video & channel to localStorage
  useEffect(() => {
    if (selectedVideo) {
      try {
        localStorage.setItem('edustream_last_selected_video', JSON.stringify(selectedVideo));
      } catch {}
    }
    if (selectedChannelId) {
      try {
        localStorage.setItem('edustream_last_selected_channel', selectedChannelId);
      } catch {}
    }
  }, [selectedVideo, selectedChannelId]);

  // Video artifacts polling
  useEffect(() => {
    if (!selectedVideo) return;

    let isMounted = true;
    let pollTimer: any = null;

    const cleanTitle = (selectedVideo.title || 'Lecture').replace(/\.(mp4|mkv|webm|avi|mov)$/i, '');
    const durationMins = Math.max(5, Math.round((selectedVideo.duration_seconds || 900) / 60));
    const channelId = selectedVideo.channel_id || 'ch-sd-02';
    const msgId = selectedVideo.telegram_message_id || 6004;
    const localKey = `edustream_artifacts_${channelId}_${msgId}`;

    let hasLocalComplete = false;
    try {
      const cachedRaw = localStorage.getItem(localKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached && cached.transcript && cached.notes) {
          hasLocalComplete = true;
          setVideoArtifacts(cached);
          selectedVideo.transcript = cached.transcript;
          if (cached.mcqs && cached.mcqs.length > 0) {
            setActiveVideoQuiz(cached.mcqs);
            selectedVideo.quiz_json = cached.mcqs;
            setQuizLoading(false);
          }
        }
      }
    } catch (e) {
      console.warn('[SDETube Local Cache Notice]:', e);
    }

    if (!hasLocalComplete) {
      setQuizLoading(true);
      setActiveVideoQuiz([]);
      setVideoArtifacts(null);
    }

    let pollAttempts = 0;
    const maxPollAttempts = 80;

    const pollStatus = async () => {
      if (pollAttempts >= maxPollAttempts || !isMounted) return;
      pollAttempts += 1;

      try {
        const redisStatus = await getRealtimeTranscriptStatus(`${channelId}_${msgId}`, channelId, msgId, cleanTitle);
        if (redisStatus && isMounted) {
          if (redisStatus.status === 'completed' || redisStatus.hasArtifacts || redisStatus.progressPercent >= 100) {
            fetchArtifacts();
          } else {
            setVideoArtifacts((prev: any) => {
              if (prev && prev.notes && prev.transcript) return prev;
              return {
                ...(prev || {}),
                status: redisStatus.status,
                progress_percent: redisStatus.progressPercent,
                stage: redisStatus.stage,
                current_part: redisStatus.currentPart,
                total_parts: redisStatus.totalParts,
                estimated_seconds_left: redisStatus.estimatedSecondsLeft
              };
            });
            if (isMounted && pollAttempts < maxPollAttempts) {
              pollTimer = setTimeout(pollStatus, 2500);
            }
          }
        }
      } catch {
        if (isMounted && pollAttempts < maxPollAttempts) {
          pollTimer = setTimeout(pollStatus, 3000);
        }
      }
    };

    const fetchArtifacts = async () => {
      try {
        const res = await fetch(`${TELEGRAM_BACKEND_URL}/api/artifacts/${channelId}/${msgId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data && isMounted) {
          setVideoArtifacts(data);
          try {
            localStorage.setItem(localKey, JSON.stringify(data));
          } catch {}
          if (data.mcqs && data.mcqs.length > 0) {
            setActiveVideoQuiz(data.mcqs);
            selectedVideo.quiz_json = data.mcqs;
          }
          if (data.transcript) {
            selectedVideo.transcript = data.transcript;
          }
          setQuizLoading(false);
        }
      } catch (err) {
        console.warn('[SDETube Artifact Fetch]:', err);
      }
    };

    pollStatus();

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [selectedVideo]);

  // Quiz generation
  const handleAttemptMoreQuestions = async () => {
    if (!selectedVideo) return;

    if (!canAffordAction(PRICING_CONFIG.AI_QUIZ_GEN_BATCH, user?.email)) {
      setInsufficientMeta({
        cost: PRICING_CONFIG.AI_QUIZ_GEN_BATCH,
        action: `Generating AI Quiz Question Batch (50 paise): ${selectedVideo.title}`
      });
      setIsInsufficientCreditsOpen(true);
      return;
    }

    deductCredits(
      PRICING_CONFIG.AI_QUIZ_GEN_BATCH,
      'AI_QUIZ_GEN',
      `📝 AI Quiz Batch Generation (50p): ${selectedVideo.title}`,
      user?.email
    );

    setIsGeneratingMoreQuiz(true);
    try {
      const chObj = MOCK_CHANNELS.find((c) => c.id === selectedVideo.channel_id);
      const newQuestions = await requestMistralQuiz(
        `${selectedVideo.title} (Batch #${Math.floor(Math.random() * 1000)})`,
        selectedVideo.transcript,
        chObj?.name || 'DSA'
      );
      if (newQuestions && newQuestions.length > 0) {
        setActiveVideoQuiz(newQuestions);
      }
    } catch (err) {
      console.warn('[Attempt More Notice]:', err);
    } finally {
      setIsGeneratingMoreQuiz(false);
    }
  };

  const openAskAIWithMode = (mode?: 'video' | 'notes' | 'quiz' | 'code', timestamp?: number) => {
    window.dispatchEvent(new CustomEvent('sdetube_pause_video'));
    setAskAIMode(mode);
    setAskAITimestamp(timestamp);
    setIsAskAIOpen(true);
  };

  const openVideoWithBilling = (v: Video, destination: 'channels' | 'sde_sheet' = 'channels'): boolean => {
    const billRes = handleVideoViewBilling(v.id, v.title, user?.email);
    if (!billRes.success) {
      setInsufficientMeta({
        cost: billRes.cost,
        action: `Unlocking Video Lecture (${billRes.cost === 2 ? 'First-time: ₹2.00 (24h Pass)' : 'Re-watch: ₹1.00 (24h Pass)'}): ${v.title}`
      });
      setIsInsufficientCreditsOpen(true);
      return false;
    }
    setSelectedVideo(v);
    return true;
  };

  const handleSignOut = async () => {
    await signOutStudent();
    setUser(null);
  };

  const value: AppContextValue = {
    user,
    setUser,
    authChecking,
    isAuthModalOpen,
    setIsAuthModalOpen,
    revokedSessionMessage,
    setRevokedSessionMessage,
    signOut: handleSignOut,

    dynamicVideos,
    setDynamicVideos,
    selectedVideo,
    setSelectedVideo,
    selectedChannelId,
    setSelectedChannelId,
    channelViewMode,
    setChannelViewMode,
    catalogLoading,
    channelCounts,

    videoArtifacts,
    setVideoArtifacts,
    activeVideoQuiz,
    setActiveVideoQuiz,
    quizLoading,
    isGeneratingMoreQuiz,
    handleAttemptMoreQuestions,
    lessonSubTab,
    setLessonSubTab,

    completedLectures,
    toggleLectureComplete,
    handleAutoComplete,

    isWalletModalOpen,
    setIsWalletModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isInsufficientCreditsOpen,
    setIsInsufficientCreditsOpen,
    insufficientMeta,
    setInsufficientMeta,
    isAskAIOpen,
    setIsAskAIOpen,
    askAIMode,
    setAskAIMode,
    askAITimestamp,
    setAskAITimestamp,
    openAskAIWithMode,
    isPotdModalOpen,
    setIsPotdModalOpen,
    showMobileGating,
    setShowMobileGating,

    totalSolved,
    totalActiveMins,
    correctAttempts,
    timeBreakdown,
    accuracyPercent,
    handleQuizSubmitted,
    handleQuestionSolved,

    openVideoWithBilling,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
