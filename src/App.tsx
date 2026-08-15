import React, { useState, useEffect, useMemo } from 'react';
import { 
  Code2, 
  Cpu, 
  Database, 
  Network, 
  Play, 
  Trash2, 
  HardDrive, 
  HelpCircle, 
  ChevronRight, 
  Layers, 
  Send,
  Search,
  X,
  Sparkles,
  ArrowLeft,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { VideoPlayer } from './components/VideoPlayer';
import { CodeWorkspace } from './components/CodeWorkspace';
import { QuizModule } from './components/QuizModule';
import { ResourceCard } from './components/ResourceCard';
import { VelocityTracker } from './components/VelocityTracker';
import { DiagnosticCard } from './components/DiagnosticCard';
import { MobileGatedOverlay } from './components/MobileGatedOverlay';
import { AuthModal } from './components/AuthModal';
import { AskAIChatModal } from './components/AskAIChatModal';
import { LoadingScreen } from './components/LoadingScreen';
import { SDESheetExplorer } from './components/SDESheetExplorer';
import { LeetCodeWorkspaceModal } from './components/LeetCodeWorkspaceModal';
import { AINotesAndSimulation } from './components/AINotesAndSimulation';
import { SDEProblem } from './lib/sdeSheetData';
import { useDevice } from './lib/device';
import { supabase, MOCK_CHANNELS, MOCK_VIDEOS } from './lib/supabase';
import { getCurrentStudent, signOutStudent } from './lib/auth';
import { Video, QuizQuestion } from './lib/types';
import { fetchCatalog, TELEGRAM_BACKEND_URL } from './lib/telegram';
import { requestMistralQuiz } from './lib/mistral';

const sanitizeCaption = (cap?: string) => {
  if (!cap) return '';
  return cap
    .replace(/Follow Now:\s*https?:\/\/[^\s\n]+/gi, '')
    .replace(/https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+/gi, '')
    .trim();
};

export function App() {
  const { isMobile } = useDevice();
  const [activeTab, setActiveTab] = useState<'channels' | 'lesson' | 'sde_sheet' | 'code' | 'quiz' | 'analytics' | 'settings'>('channels');
  const [channelViewMode, setChannelViewMode] = useState<'overview' | 'detail'>('overview');
  const [selectedChannelId, setSelectedChannelId] = useState<string>(MOCK_CHANNELS[0].id);
  const [selectedVideo, setSelectedVideo] = useState<Video>(MOCK_VIDEOS[0]);
  const [lessonSubTab, setLessonSubTab] = useState<'quiz' | 'code'>('code');
  const [showMobileGating, setShowMobileGating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAskAIOpen, setIsAskAIOpen] = useState<boolean>(false);
  const [askAIMode, setAskAIMode] = useState<'video' | 'notes' | 'quiz' | 'code' | undefined>(undefined);
  const [sdeFullscreenProblem, setSdeFullscreenProblem] = useState<SDEProblem | null>(null);

  const openAskAIWithMode = (mode?: 'video' | 'notes' | 'quiz' | 'code') => {
    setAskAIMode(mode);
    setIsAskAIOpen(true);
  };

  // Lecture completion tracking
  const [completedLectures, setCompletedLectures] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('edustream_completed_lectures');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const toggleLectureComplete = (videoId: string) => {
    setCompletedLectures(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId); else next.add(videoId);
      localStorage.setItem('edustream_completed_lectures', JSON.stringify([...next]));
      return next;
    });
  };

  const handleAutoComplete = (videoId: string) => {
    if (!completedLectures.has(videoId)) {
      setCompletedLectures(prev => {
        const next = new Set(prev);
        next.add(videoId);
        localStorage.setItem('edustream_completed_lectures', JSON.stringify([...next]));
        return next;
      });
    }
  };

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Video-specific Quiz State
  const [activeVideoQuiz, setActiveVideoQuiz] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [isGeneratingMoreQuiz, setIsGeneratingMoreQuiz] = useState<boolean>(false);

  const handleAttemptMoreQuestions = async () => {
    if (!selectedVideo) return;
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

  useEffect(() => {
    // Clear legacy transcript/notes caches from localStorage so everything is freshly generated from real transcripts
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('edustream_transcript_') || key.startsWith('edustream_ainotes_') || key.startsWith('edustream_quiz_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}

    // Restore student session on mount
    const student = getCurrentStudent();
    if (student) {
      setUser(student);
      setAuthChecking(false);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
        }
      }).catch((err) => {
        console.warn('[EduStream Auth] Remote Supabase notice:', err);
      }).finally(() => {
        setAuthChecking(false);
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real Dynamic Velocity Analytics State (persisted in localStorage)
  const [totalSolved, setTotalSolved] = useState<number>(() => {
    const saved = localStorage.getItem('edustream_total_solved');
    return saved ? parseInt(saved, 10) : 0;
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

  // Storage Manager State
  const [cacheUsageBytes, setCacheUsageBytes] = useState<number>(0);
  const [cacheQuotaBytes, setCacheQuotaBytes] = useState<number>(12 * 1024 * 1024 * 1024);

  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then((estimate) => {
        if (estimate.usage) setCacheUsageBytes(estimate.usage);
        if (estimate.quota) setCacheQuotaBytes(estimate.quota);
      });
    }
  }, []);

  // Save student progress to localStorage
  useEffect(() => {
    localStorage.setItem('edustream_total_solved', totalSolved.toString());
    localStorage.setItem('edustream_active_mins', totalActiveMins.toString());
    localStorage.setItem('edustream_correct_attempts', correctAttempts.toString());
    localStorage.setItem('edustream_time_breakdown', JSON.stringify(timeBreakdown));
  }, [totalSolved, totalActiveMins, correctAttempts, timeBreakdown]);

  // Dynamic video catalog from backend API
  const [dynamicVideos, setDynamicVideos] = useState<Video[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [channelCounts, setChannelCounts] = useState<Record<string, number>>({});

  // Fetch real video catalog from backend on mount
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
          if (firstChannelVideos.length > 0) {
            setSelectedVideo(firstChannelVideos[0]);
          }
        }
      })
      .catch((err) => {
        console.warn('[EduStream] Using fallback catalog:', err);
      })
      .finally(() => setCatalogLoading(false));
  }, []);

  // Dynamically fetch transcript + AI artifacts (MCQs, Notes, Coding, Simulator) generated from REAL transcript
  const [videoArtifacts, setVideoArtifacts] = useState<any>(null);

  useEffect(() => {
    if (!selectedVideo) return;

    let isMounted = true;
    let pollTimer: any = null;

    const cleanTitle = (selectedVideo.title || 'Lecture').replace(/\.(mp4|mkv|webm|avi|mov)$/i, '');
    const durationMins = Math.max(5, Math.round((selectedVideo.duration_seconds || 900) / 60));
    const channelId = selectedVideo.channel_id || 'ch-sd-02';
    const msgId = selectedVideo.telegram_message_id || 6004;
    const localKey = `edustream_artifacts_${channelId}_${msgId}`;

    // Instant Pre-hydration from Local / Browser Storage (0ms instant load for any previously viewed lecture)
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
      console.warn('[EduStream Local Cache Notice]:', e);
    }

    if (!hasLocalComplete) {
      setQuizLoading(true);
      setActiveVideoQuiz([]);
      setVideoArtifacts(null);
    }

    const pollStatus = () => {
      const statusUrl = `${TELEGRAM_BACKEND_URL}/api/transcript/status/${channelId}/${msgId}?title=${encodeURIComponent(cleanTitle)}&duration=${durationMins}`;

      fetch(statusUrl)
        .then((r) => r.json())
        .then((statusData) => {
          if (!isMounted) return;
          if (statusData) {
            if (statusData.status === 'completed' || (typeof statusData.progress_percent === 'number' && statusData.progress_percent >= 100)) {
              // Background task is finished! Fetch complete artifacts
              fetchArtifacts();
            } else {
              setVideoArtifacts((prev: any) => {
                if (prev && prev.notes && prev.transcript) {
                  return prev; // Keep completed artifacts visible
                }
                return {
                  ...(prev || {}),
                  ...statusData,
                };
              });
              if (!hasLocalComplete) {
                setQuizLoading(true);
              }
              pollTimer = setTimeout(pollStatus, 1500);
            }
          }
        })
        .catch((err) => {
          console.warn('[EduStream Status Poll Notice]:', err);
          if (isMounted) pollTimer = setTimeout(pollStatus, 2500);
        });
    };

    const fetchArtifacts = () => {
      const url = `${TELEGRAM_BACKEND_URL}/api/transcript/${channelId}/${msgId}?title=${encodeURIComponent(cleanTitle)}&duration=${durationMins}`;

      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          if (!isMounted) return;
          if (data) {
            if ((data.status === 'completed' || data.notes) && data.transcript) {
              const normalizedMCQs = (data.mcqs || []).map((m: any, idx: number) => ({
                id: m.id || `mcq-${idx + 1}`,
                type: 'MCQ' as const,
                question: m.question || `Question ${idx + 1}`,
                options: Array.isArray(m.options) ? m.options : ['Option A', 'Option B', 'Option C', 'Option D'],
                correct_answer: typeof m.correct_answer === 'number' ? m.correct_answer : 0,
                explanation: m.explanation || ''
              }));
              const completeObj = { ...data, mcqs: normalizedMCQs };
              setVideoArtifacts(completeObj);
              if (data.transcript) {
                selectedVideo.transcript = data.transcript;
              }
              setActiveVideoQuiz(normalizedMCQs);
              selectedVideo.quiz_json = normalizedMCQs;
              setQuizLoading(false);

              // Persist into localStorage for instant 0ms access across reloads
              try {
                localStorage.setItem(localKey, JSON.stringify(completeObj));
                localStorage.setItem(`edustream_artifacts_${selectedVideo.id}`, JSON.stringify(completeObj));
                localStorage.setItem(`edustream_artifacts_${cleanTitle}`, JSON.stringify(completeObj));
                localStorage.setItem(`edustream_transcript_${selectedVideo.id || cleanTitle}_v3`, data.transcript);
              } catch (storageErr) {
                console.warn('[EduStream Local Storage Notice]:', storageErr);
              }
            } else if (data.status === 'processing') {
              setVideoArtifacts((prev: any) => {
                if (prev && prev.notes && prev.transcript) {
                  return prev; // Never overwrite completed state
                }
                return {
                  ...(prev || {}),
                  ...data,
                };
              });
              if (!hasLocalComplete) {
                setQuizLoading(true);
              }
              pollTimer = setTimeout(pollStatus, 1500);
            } else {
              setQuizLoading(false);
            }
          }
        })
        .catch((err) => {
          console.warn('[EduStream Artifact Fetch Notice]:', err);
          if (isMounted) {
            pollTimer = setTimeout(pollStatus, 2500);
          }
        });
    };

    fetchArtifacts();

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [selectedVideo?.id, selectedVideo?.title, selectedVideo?.channel_id, selectedVideo?.telegram_message_id]);

  const activeVideos = dynamicVideos.length > 0 ? dynamicVideos : MOCK_VIDEOS;
  const filteredVideos = activeVideos.filter((v) => v.channel_id === selectedChannelId);

  const searchFilteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return filteredVideos;
    const q = searchQuery.toLowerCase();
    return filteredVideos.filter((v) =>
      v.title.toLowerCase().includes(q) ||
      (v.telegram_caption || '').toLowerCase().includes(q) ||
      (v.transcript || '').toLowerCase().includes(q) ||
      (v.sender_username || '').toLowerCase().includes(q)
    );
  }, [searchQuery, filteredVideos]);

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
    setChannelViewMode('detail');
    setSearchQuery('');
    const matchingVideos = activeVideos.filter((v) => v.channel_id === channelId);
    if (matchingVideos.length > 0) {
      setSelectedVideo(matchingVideos[0]);
    }
  };

  const handleNextLecture = () => {
    const currentList = filteredVideos.length > 0 ? filteredVideos : MOCK_VIDEOS;
    const currentIndex = currentList.findIndex((v) => v.id === selectedVideo.id);
    if (currentIndex >= 0 && currentIndex < currentList.length - 1) {
      setSelectedVideo(currentList[currentIndex + 1]);
    }
  };

  const handlePrevLecture = () => {
    const currentList = filteredVideos.length > 0 ? filteredVideos : MOCK_VIDEOS;
    const currentIndex = currentList.findIndex((v) => v.id === selectedVideo.id);
    if (currentIndex > 0) {
      setSelectedVideo(currentList[currentIndex - 1]);
    }
  };

  const currentList = filteredVideos.length > 0 ? filteredVideos : activeVideos;
  const currentIndex = currentList.findIndex((v) => v.id === selectedVideo.id);
  const hasNextLecture = currentIndex >= 0 && currentIndex < currentList.length - 1;
  const hasPrevLecture = currentIndex > 0;

  const handleOpenCodeTab = () => {
    if (isMobile) {
      setShowMobileGating(true);
    } else {
      setLessonSubTab('code');
    }
  };

  const handleSelectVideoByTopic = (topicName: string) => {
    const list = dynamicVideos.length > 0 ? dynamicVideos : MOCK_VIDEOS;
    const cleanTopic = topicName.toLowerCase().replace(/[^\w\s]/gi, ' ').trim();
    const topicWords = cleanTopic.split(/\s+/).filter(w => w.length > 2);

    let match = list.find(v => {
      const vTitle = v.title.toLowerCase();
      return topicWords.some(w => vTitle.includes(w));
    });

    if (!match) {
      match = list.find(v => v.channel_id === 'ch-dsa-01') || list[0];
    }

    if (match) {
      setSelectedVideo(match);
      setSelectedChannelId(match.channel_id);
      setActiveTab('lesson');
    }
  };

  const handleOpenCodingFullscreen = (problem: SDEProblem) => {
    if (isMobile) {
      setShowMobileGating(true);
      return;
    }
    setSdeFullscreenProblem(problem);
  };

  const handleQuestionSolved = (timeTakenSeconds: number, isCorrect: boolean) => {
    const mins = Math.max(0.5, Number((timeTakenSeconds / 60).toFixed(1)));
    setTotalSolved((prev) => prev + 1);
    setTotalActiveMins((prev) => Number((prev + mins).toFixed(1)));
    if (isCorrect) setCorrectAttempts((prev) => prev + 1);

    if (lessonSubTab === 'code') {
      setTimeBreakdown((prev: { lecturesMins: number; quizzesMins: number; codingMins: number }) => ({ ...prev, codingMins: Math.round(prev.codingMins + mins) }));
    } else {
      setTimeBreakdown((prev: { lecturesMins: number; quizzesMins: number; codingMins: number }) => ({ ...prev, quizzesMins: Math.round(prev.quizzesMins + mins) }));
    }
  };

  const accuracyPercent = totalSolved > 0 ? Math.round((correctAttempts / totalSolved) * 100) : 0;

  const getChannelIcon = (icon: string) => {
    switch (icon) {
      case 'code-2': return <Code2 className="w-5 h-5 text-indigo-400" />;
      case 'cpu': return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'database': return <Database className="w-5 h-5 text-emerald-400" />;
      default: return <Network className="w-5 h-5 text-sky-400" />;
    }
  };

  if (authChecking || catalogLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <AuthModal
        isOpen={true}
        isFullPage={true}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />
    );
  }

  const rawMCQs = activeVideoQuiz.length > 0 ? activeVideoQuiz : (videoArtifacts?.mcqs || []);
  const activeMCQs: QuizQuestion[] = rawMCQs.map((q: any, idx: number) => ({
    id: q.id || `mcq-${idx + 1}`,
    type: 'MCQ' as const,
    question: q.question || `Question ${idx + 1}`,
    options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
    correct_answer: typeof q.correct_answer === 'number' ? q.correct_answer : 0,
    explanation: q.explanation || ''
  }));

  const activeCodingQuestion: QuizQuestion | undefined = videoArtifacts?.coding_problem
    ? {
        id: 'code-1',
        type: 'CODING' as const,
        question: videoArtifacts.coding_problem.problem_statement || videoArtifacts.coding_problem.title || 'Lecture Challenge',
        starter_code: videoArtifacts.coding_problem.starter_code_cpp || videoArtifacts.coding_problem.starter_code_python,
        solution_code: videoArtifacts.coding_problem.solution_code_cpp,
        explanation: videoArtifacts.coding_problem.title
      }
    : activeVideoQuiz.find((q) => q.type === 'CODING');
  const activeChannelObj = MOCK_CHANNELS.find((c) => c.id === selectedChannelId) || MOCK_CHANNELS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'channels') setChannelViewMode('overview');
        }}
        selectedChannel={selectedChannelId}
        setSelectedChannel={handleSelectChannel}
        user={user}
        onSignOut={() => {
          signOutStudent();
          setUser(null);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: TELEGRAM CHANNELS OVERVIEW & DEDICATED CHANNEL PAGES */}
        {activeTab === 'channels' && (
          <div>
            {channelViewMode === 'overview' ? (
              /* Channel Hub Overview Cards */
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    Telegram Course Channels Hub
                  </h2>
                  <p className="text-xs text-slate-400">Click any channel card to open its dedicated lecture page and search bar</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {MOCK_CHANNELS.map((ch) => {
                    const videoCount = channelCounts[ch.id] || ch.total_videos || 0;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => handleSelectChannel(ch.id)}
                        className="glass-panel p-6 rounded-2xl text-left transition-all relative overflow-hidden group border border-slate-800/80 hover:border-indigo-500/80 hover:bg-indigo-950/20 shadow-xl"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform">
                            {getChannelIcon(ch.icon)}
                          </div>
                          <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 text-xs font-mono font-bold text-indigo-300">
                            {videoCount} Lectures
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-100 mb-1.5 group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                          <span>{ch.category_name}</span>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{ch.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* DEDICATED CHANNEL PAGE (e.g. LLD Page, DSA Page, DBMS Page, CN Page) */
              <div className="space-y-6">
                
                {/* Header & Back to Overview Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-xl">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setChannelViewMode('overview')}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 transition-all flex items-center gap-1.5 text-xs font-bold"
                      title="Back to All Channels"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Channels</span>
                    </button>

                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/40">
                          {getChannelIcon(activeChannelObj.icon)}
                        </div>
                        <h2 className="text-lg font-bold text-slate-100">{activeChannelObj.name} Workspace</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-[11px] font-mono font-bold text-emerald-300">
                          {filteredVideos.length} Ingested Videos
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{activeChannelObj.description}</p>
                    </div>
                  </div>

                  {/* Dedicated Search Bar for this specific channel page */}
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search ${activeChannelObj.name} lectures by topic or post #...`}
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-xs text-slate-100 focus:outline-none focus:border-indigo-400 font-sans shadow-inner"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Videos Grid for this Dedicated Channel */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {searchFilteredVideos.map((v) => {
                    const isCurrent = v.id === selectedVideo.id;
                    return (
                      <div
                        key={v.id}
                        className={`glass-panel rounded-2xl overflow-hidden border transition-all flex flex-col justify-between group ${
                          isCurrent
                            ? 'border-indigo-500 shadow-lg shadow-indigo-500/10'
                            : 'border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800/60 font-bold text-indigo-300">
                              Post #{v.telegram_message_id}
                            </span>
                            <span>{v.sender_username || '@SDETubeBot'}</span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                            {v.title}
                          </h4>

                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                            {v.telegram_caption}
                          </p>
                        </div>

                        <div className="p-4 bg-slate-900/60 border-t border-slate-800/60 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedVideo(v);
                                setActiveTab('lesson');
                              }}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Watch</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedVideo(v);
                                setIsAskAIOpen(true);
                              }}
                              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-bold transition-all"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>AI</span>
                            </button>
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); toggleLectureComplete(v.id); }}
                            className={`p-1.5 rounded-lg transition-all border ${
                              completedLectures.has(v.id)
                                ? 'bg-emerald-950 border-emerald-600 text-emerald-400 shadow-sm shadow-emerald-500/20'
                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                            }`}
                            title={completedLectures.has(v.id) ? 'Mark as incomplete' : 'Mark as completed'}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>
        )}

        {/* VIEW 2: LECTURE WORKSPACE (VIDEO PLAYER + SDE STUDY NOTES SIDE-BY-SIDE) */}
        {activeTab === 'lesson' && (
          <div className="space-y-6">
            
            {/* Top Workspace Lecture Banner */}
            <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-indigo-300 font-mono font-bold px-3 py-1 rounded-xl bg-indigo-950 border border-indigo-700/50">
                  Lecture: {selectedVideo.title}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline font-mono">
                  Channel: {activeChannelObj.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAskAIWithMode('notes')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-bold transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ask AI on Notes</span>
                </button>

                <button
                  onClick={() => setActiveTab('code')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Open Coding IDE</span>
                </button>
              </div>
            </div>

            {/* Split Screen Grid: Left Video, Right Algomaster SDE Notes & Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Video Player with Next/Prev Controls */}
              <div className="lg:col-span-6 xl:col-span-6 space-y-6">
                <VideoPlayer
                  video={selectedVideo}
                  videoArtifacts={videoArtifacts}
                  onNextLecture={handleNextLecture}
                  onPrevLecture={handlePrevLecture}
                  hasNextLecture={hasNextLecture}
                  hasPrevLecture={hasPrevLecture}
                  onOpenAskAI={() => openAskAIWithMode('video')}
                  onAutoComplete={handleAutoComplete}
                />
                <ResourceCard
                  attachments={selectedVideo.attachments || []}
                  channelId={selectedVideo.channel_id}
                  messageId={selectedVideo.telegram_message_id}
                />
              </div>

              {/* Right Column: Algomaster SDE Notes & Interactive Simulation */}
              <div className="lg:col-span-6 xl:col-span-6 min-h-[500px]">
                <AINotesAndSimulation
                  video={selectedVideo}
                  videoArtifacts={videoArtifacts}
                  isLoading={catalogLoading}
                  onOpenAskAI={openAskAIWithMode}
                />
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2.2: DEDICATED SDE CODING IDE WORKSPACE */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-indigo-300 font-mono font-bold px-3 py-1 rounded-xl bg-indigo-950 border border-indigo-700/50">
                  Coding Challenge: {videoArtifacts?.coding_problem?.title || selectedVideo.title}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('lesson')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Video</span>
              </button>
            </div>

            <div className="h-[750px]">
              <CodeWorkspace
                codingProblem={videoArtifacts?.coding_problem}
                question={activeCodingQuestion}
                allCodingQuestions={activeVideoQuiz.filter(q => q.type === 'CODING')}
                isLoading={quizLoading}
                progressPercent={videoArtifacts?.progress_percent}
                currentPart={videoArtifacts?.current_part}
                totalParts={videoArtifacts?.total_parts}
                stage={videoArtifacts?.stage}
                estimatedSecondsLeft={videoArtifacts?.estimated_seconds_left}
                onCodeExecuted={handleQuestionSolved}
              />
            </div>
          </div>
        )}

        {/* VIEW 2.4: DEDICATED MCQ QUIZ ARENA */}
        {activeTab === 'quiz' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-amber-300 font-mono font-bold px-3 py-1 rounded-xl bg-amber-950 border border-amber-700/50">
                  Quiz Assessment: {selectedVideo.title}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('lesson')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Video</span>
              </button>
            </div>

            <QuizModule
              questions={activeMCQs}
              videoTitle={selectedVideo.title}
              durationSeconds={selectedVideo.duration_seconds}
              progressPercent={videoArtifacts?.progress_percent}
              currentPart={videoArtifacts?.current_part}
              totalParts={videoArtifacts?.total_parts}
              stage={videoArtifacts?.stage}
              estimatedSecondsLeft={videoArtifacts?.estimated_seconds_left}
              onQuizSubmitted={handleQuestionSolved}
              onAttemptMoreQuestions={handleAttemptMoreQuestions}
              isGeneratingMore={isGeneratingMoreQuiz}
            />
          </div>
        )}

        {/* VIEW 2.5: SDE SHEET EXPLORER WITH 191 PROBLEMS */}
        {activeTab === 'sde_sheet' && (
          <SDESheetExplorer
            onSelectVideoByTopic={handleSelectVideoByTopic}
            onOpenCodingFullscreen={handleOpenCodingFullscreen}
          />
        )}

        {/* VIEW 3: DYNAMIC VELOCITY ANALYTICS & MISTRAL DIAGNOSTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <VelocityTracker
              totalSolved={totalSolved}
              totalActiveMins={totalActiveMins}
              accuracyPercent={accuracyPercent}
              timeBreakdown={timeBreakdown}
            />

            <DiagnosticCard
              totalSolved={totalSolved}
              totalMins={totalActiveMins}
              accuracyPercent={accuracyPercent}
            />
          </div>
        )}

      </main>

      {/* Fullscreen LeetCode Monaco Workspace for SDE Sheet Problems */}
      {sdeFullscreenProblem && (
        <LeetCodeWorkspaceModal
          problemTitle={sdeFullscreenProblem.name}
          initialLanguage="python"
          codingProblem={{
            title: sdeFullscreenProblem.name,
            problem_statement: `### ${sdeFullscreenProblem.name}\n\n**Category:** ${sdeFullscreenProblem.category}  \n**Difficulty:** ${sdeFullscreenProblem.difficulty}  \n**Top Companies:** ${sdeFullscreenProblem.companies.join(', ')}  \n**Importance:** ${sdeFullscreenProblem.rating}\n\n#### Problem Description\nImplement an optimal solution for **${sdeFullscreenProblem.name}**. Analyze the Time & Space complexity.\n\n#### Practice Links\n- [LeetCode Challenge](${sdeFullscreenProblem.leetcode})\n- [GeeksforGeeks Practice](${sdeFullscreenProblem.gfg})`,
            starter_code_python: `# TiliTube SDE Arena: ${sdeFullscreenProblem.name}\n# Difficulty: ${sdeFullscreenProblem.difficulty} | Companies: ${sdeFullscreenProblem.companies.slice(0, 3).join(', ')}\n\nclass Solution:\n    def solve(self) -> None:\n        # Write your optimal algorithm here\n        pass\n\nif __name__ == "__main__":\n    sol = Solution()\n    sol.solve()\n    print("Code executed successfully on TiliTube Cloud Engine.")\n`,
            starter_code_cpp: `// TiliTube SDE Arena: ${sdeFullscreenProblem.name}\n// Difficulty: ${sdeFullscreenProblem.difficulty}\n\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // Optimal C++ Solution\n    }\n};\n\nint main() {\n    Solution sol;\n    sol.solve();\n    cout << "Success: Problem executed on TiliTube Cloud Compiler." << endl;\n    return 0;\n}\n`
          }}
          onClose={() => setSdeFullscreenProblem(null)}
          onCodeExecuted={handleQuestionSolved}
        />
      )}

      {/* Floating Circular Ask AI Assistant Action Button at Bottom-Right */}
      <button
        onClick={() => openAskAIWithMode()}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-2xl shadow-purple-600/60 border-2 border-purple-300/40 flex items-center justify-center transition-all duration-300 hover:scale-110 group cursor-pointer"
        title="Ask AI Teaching Assistant"
      >
        <Sparkles className="w-7 h-7 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
        <span className="absolute right-16 bg-slate-900 border border-slate-800 text-slate-100 text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
          Ask AI Teaching Assistant
        </span>
      </button>

      {/* Mobile Coding Access Policy Overlay Modal */}
      {showMobileGating && (
        <MobileGatedOverlay
          onDismiss={() => setShowMobileGating(false)}
          onSwitchToQuiz={() => {
            setShowMobileGating(false);
            setLessonSubTab('quiz');
          }}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
        }}
      />

      {/* Ask AI Teaching Assistant Chatbot Drawer */}
      <AskAIChatModal
        isOpen={isAskAIOpen}
        onClose={() => setIsAskAIOpen(false)}
        video={selectedVideo}
        videoArtifacts={videoArtifacts}
        initialMode={askAIMode}
        activeMCQ={activeVideoQuiz && activeVideoQuiz.length > 0 ? activeVideoQuiz[0] : undefined}
        codingProblem={videoArtifacts?.coding_problem}
      />

    </div>
  );
}
