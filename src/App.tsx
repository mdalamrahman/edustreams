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
  Sparkles
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
import { useDevice } from './lib/device';
import { supabase, MOCK_CHANNELS, MOCK_VIDEOS } from './lib/supabase';
import { getCurrentStudent, signOutStudent } from './lib/auth';
import { Video, QuizQuestion } from './lib/types';
import { fetchCatalog, TELEGRAM_BACKEND_URL } from './lib/telegram';
import { requestMistralQuiz } from './lib/mistral';

export function App() {
  const { isMobile } = useDevice();
  const [activeTab, setActiveTab] = useState<'channels' | 'lesson' | 'analytics' | 'settings'>('channels');
  const [selectedChannelId, setSelectedChannelId] = useState<string>(MOCK_CHANNELS[0].id);
  const [selectedVideo, setSelectedVideo] = useState<Video>(MOCK_VIDEOS[0]);
  const [lessonSubTab, setLessonSubTab] = useState<'quiz' | 'code'>('code');
  const [showMobileGating, setShowMobileGating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAskAIOpen, setIsAskAIOpen] = useState<boolean>(false);

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Video-specific Quiz State
  const [activeVideoQuiz, setActiveVideoQuiz] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);

  useEffect(() => {
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

  // Dynamic Real Velocity Analytics State
  const [totalSolved, setTotalSolved] = useState<number>(12);
  const [totalActiveMins, setTotalActiveMins] = useState<number>(24.0);
  const [correctAttempts, setCorrectAttempts] = useState<number>(10);
  const [timeBreakdown, setTimeBreakdown] = useState({
    lecturesMins: 45,
    quizzesMins: 20,
    codingMins: 35
  });

  // Storage Manager State
  const [cacheUsageBytes, setCacheUsageBytes] = useState<number>(1.4 * 1024 * 1024 * 1024);
  const [cacheQuotaBytes, setCacheQuotaBytes] = useState<number>(12 * 1024 * 1024 * 1024);

  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then((estimate) => {
        if (estimate.usage) setCacheUsageBytes(estimate.usage);
        if (estimate.quota) setCacheQuotaBytes(estimate.quota);
      });
    }
  }, []);

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
              sender_username: '@EduStreamBot',
              title: (v.file_name || `Video ${v.msg_id}`).replace(/\.(mp4|mkv|webm|avi|mov|flv)$/i, ''),
              telegram_caption: v.caption || `📌 [Telegram Post #${v.msg_id} | Size: ${v.size_mb} MB]\nFile: ${v.file_name}`,
              duration_seconds: v.duration || 0,
              transcript: `Ingested from Telegram Post #${v.msg_id} (${v.file_name}). Stream powered by Telethon MTProto.`,
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

  // Dynamically generate Mistral AI quiz tailored specifically to selectedVideo title & transcript
  useEffect(() => {
    if (selectedVideo) {
      if (selectedVideo.quiz_json && selectedVideo.quiz_json.length > 0) {
        setActiveVideoQuiz(selectedVideo.quiz_json);
      } else {
        setQuizLoading(true);
        const chObj = MOCK_CHANNELS.find((c) => c.id === selectedVideo.channel_id);
        requestMistralQuiz(selectedVideo.title, selectedVideo.transcript, chObj?.name || 'DSA')
          .then((questions) => {
            setActiveVideoQuiz(questions);
            selectedVideo.quiz_json = questions;
          })
          .catch(() => {
            setActiveVideoQuiz([]);
          })
          .finally(() => setQuizLoading(false));
      }
    }
  }, [selectedVideo?.id, selectedVideo?.title]);

  const activeVideos = dynamicVideos.length > 0 ? dynamicVideos : MOCK_VIDEOS;
  const filteredVideos = activeVideos.filter((v) => v.channel_id === selectedChannelId);

  const searchFilteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return filteredVideos;
    const q = searchQuery.toLowerCase();
    return activeVideos.filter((v) =>
      v.title.toLowerCase().includes(q) ||
      (v.telegram_caption || '').toLowerCase().includes(q) ||
      (v.transcript || '').toLowerCase().includes(q) ||
      (v.sender_username || '').toLowerCase().includes(q)
    );
  }, [searchQuery, filteredVideos, activeVideos]);

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
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

  const handleQuestionSolved = (timeTakenSeconds: number, isCorrect: boolean) => {
    const mins = Math.max(0.5, Number((timeTakenSeconds / 60).toFixed(1)));
    setTotalSolved((prev) => prev + 1);
    setTotalActiveMins((prev) => Number((prev + mins).toFixed(1)));
    if (isCorrect) setCorrectAttempts((prev) => prev + 1);

    if (lessonSubTab === 'code') {
      setTimeBreakdown((prev) => ({ ...prev, codingMins: Math.round(prev.codingMins + mins) }));
    } else {
      setTimeBreakdown((prev) => ({ ...prev, quizzesMins: Math.round(prev.quizzesMins + mins) }));
    }
  };

  const accuracyPercent = Math.round((correctAttempts / Math.max(totalSolved, 1)) * 100);

  const getChannelIcon = (icon: string) => {
    switch (icon) {
      case 'code-2': return <Code2 className="w-5 h-5 text-indigo-400" />;
      case 'cpu': return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'database': return <Database className="w-5 h-5 text-emerald-400" />;
      default: return <Network className="w-5 h-5 text-sky-400" />;
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-mono text-slate-400">Verifying Supabase Authentication...</p>
      </div>
    );
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

  const activeCodingQuestion = activeVideoQuiz.find((q) => q.type === 'CODING');
  const activeMCQs = activeVideoQuiz.filter((q) => q.type === 'MCQ');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
        
        {/* VIEW 1: TELEGRAM CHANNELS GRID & VIDEO FEED */}
        {activeTab === 'channels' && (
          <div className="space-y-8">
            
            {/* Top Channels Selection Cards */}
            <div>
              <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Telegram Course Channels
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MOCK_CHANNELS.map((ch) => {
                  const isSelected = ch.id === selectedChannelId;
                  const videoCount = channelCounts[ch.id] || ch.total_videos;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleSelectChannel(ch.id)}
                      className={`glass-panel p-5 rounded-2xl text-left transition-all relative overflow-hidden group ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-xl' 
                          : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform">
                          {getChannelIcon(ch.icon)}
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono font-bold text-slate-400">
                          {videoCount} Videos
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-100 mb-1 group-hover:text-indigo-400 transition-colors">
                        {ch.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{ch.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Video Search & Feed Grid */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-400 fill-current" />
                    Ingested Video Feed (Oldest Message #6704 First)
                  </h3>
                  <p className="text-xs text-slate-400">Stream directly via Render Telethon MTProto Proxy</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search lectures by topic..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Videos Grid */}
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
                          <span>{v.sender_username || '@EduStreamBot'}</span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                          {v.title}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                          {v.telegram_caption}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-900/60 border-t border-slate-800/60 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedVideo(v);
                            setActiveTab('lesson');
                          }}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Watch Lecture</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedVideo(v);
                            setIsAskAIOpen(true);
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-bold transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Ask AI</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: LESSON WORKSPACE (VIDEO PLAYER + MISTRAL QUIZ & LEETCODE WORKSPACE) */}
        {activeTab === 'lesson' && (
          <div className="space-y-6">
            
            {/* Top Workspace Navigation Tabs */}
            <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
              <div className="flex space-x-2">
                <button
                  onClick={handleOpenCodeTab}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                    lessonSubTab === 'code'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span>LeetCode Code Workspace</span>
                </button>

                <button
                  onClick={() => setLessonSubTab('quiz')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                    lessonSubTab === 'quiz'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Mistral AI MCQ Quiz</span>
                </button>
              </div>

              <button
                onClick={() => setIsAskAIOpen(true)}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all border border-purple-400/30"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Ask AI Teaching Assistant</span>
              </button>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Video Player with Next/Prev & Ask AI Controls */}
              <div className="lg:col-span-7 space-y-6">
                <VideoPlayer
                  video={selectedVideo}
                  onNextLecture={handleNextLecture}
                  onPrevLecture={handlePrevLecture}
                  hasNextLecture={hasNextLecture}
                  hasPrevLecture={hasPrevLecture}
                  onOpenAskAI={() => setIsAskAIOpen(true)}
                />
                <ResourceCard
                  attachments={selectedVideo.attachments || []}
                  channelId={selectedVideo.channel_id}
                  messageId={selectedVideo.telegram_message_id}
                />
              </div>

              {/* Right Column: Code Editor or Video-Specific Mistral Quiz Module */}
              <div className="lg:col-span-5 h-[640px]">
                {lessonSubTab === 'code' ? (
                  <CodeWorkspace
                    question={activeCodingQuestion}
                    onCodeExecuted={handleQuestionSolved}
                  />
                ) : (
                  <QuizModule
                    questions={activeMCQs}
                    onQuizSubmitted={handleQuestionSolved}
                  />
                )}
              </div>

            </div>

          </div>
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
      />

    </div>
  );
}
