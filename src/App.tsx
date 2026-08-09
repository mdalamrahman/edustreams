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
  X
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
import { useDevice } from './lib/device';
import { supabase, MOCK_CHANNELS, MOCK_VIDEOS } from './lib/supabase';
import { getCurrentStudent, signOutStudent } from './lib/auth';
import { Video } from './lib/types';
import { fetchCatalog, TELEGRAM_BACKEND_URL } from './lib/telegram';

export function App() {
  const { isMobile } = useDevice();
  const [activeTab, setActiveTab] = useState<'channels' | 'lesson' | 'analytics' | 'settings'>('channels');
  const [selectedChannelId, setSelectedChannelId] = useState<string>(MOCK_CHANNELS[0].id);
  const [selectedVideo, setSelectedVideo] = useState<Video>(MOCK_VIDEOS[0]);
  const [lessonSubTab, setLessonSubTab] = useState<'quiz' | 'code'>('code');
  const [showMobileGating, setShowMobileGating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

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

  // Velocity Tracker State
  const [totalSolved, setTotalSolved] = useState<number>(8);
  const [totalActiveMins, setTotalActiveMins] = useState<number>(18.5);
  const [correctAttempts, setCorrectAttempts] = useState<number>(7);

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

        // Map backend channel names to frontend channel IDs
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
          // Select the first video from the first channel
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

  // Use dynamic videos if available, otherwise fall back to MOCK_VIDEOS
  const activeVideos = dynamicVideos.length > 0 ? dynamicVideos : MOCK_VIDEOS;

  const filteredVideos = activeVideos.filter((v) => v.channel_id === selectedChannelId);

  // Search filter: matches title, caption, transcript, sender
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
    setTotalSolved((prev) => prev + 1);
    setTotalActiveMins((prev) => prev + timeTakenSeconds / 60);
    if (isCorrect) setCorrectAttempts((prev) => prev + 1);
  };

  const handleClearCache = async () => {
    if ('caches' in window) {
      await caches.delete('edustream-video-v1');
      setCacheUsageBytes(0);
      alert('Offline video CacheStorage (edustream-video-v1) has been cleared.');
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedChannel={selectedChannelId}
        setSelectedChannel={handleSelectChannel}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={() => {
          signOutStudent();
          setUser(null);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: CHANNELS & TELEGRAM INGESTION FEED */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl overflow-hidden">
              <div className="pt-1">
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">Telethon MTProto Ingestion Engine</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text py-1 leading-snug">
                  Private Educational Telegram Portal
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Automated MTProto chunk streaming, Whisper STT, attachment downloads, and AI diagnostics.
                </p>
              </div>

              <div className="flex items-center space-x-2 font-mono text-xs text-slate-300 flex-shrink-0">
                <span className="px-3.5 py-1.5 rounded-xl bg-indigo-950 border border-indigo-700/60 text-indigo-300 font-bold shadow-md">
                  4 Telegram Groups Active
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lectures by title, topic, transcript, or Telegram caption..."
                  className="w-full pl-11 pr-10 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-xs text-slate-400 mt-2 ml-1">
                  Found <span className="text-indigo-400 font-bold">{searchFilteredVideos.length}</span> lectures matching "<span className="text-slate-200">{searchQuery}</span>" across all channels
                </p>
              )}
            </div>

            {/* 4 Telegram Channel Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {MOCK_CHANNELS.map((ch) => {
                const isSelected = ch.id === selectedChannelId;
                const channelVideos = activeVideos.filter((v) => v.channel_id === ch.id);
                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      handleSelectChannel(ch.id);
                    }}
                    className={`glass-panel p-5 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 shadow-xl shadow-indigo-600/20'
                        : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        {getChannelIcon(ch.icon)}
                      </div>
                      <span className="text-[11px] font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                        ID: {ch.telegram_channel_id}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 mb-1">{ch.category_name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{ch.description}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-bold text-indigo-400">
                      <span>{channelVideos.length} Ingested Video Lectures</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ingested Videos Feed for Selected Channel */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  {searchQuery ? (
                    <>Search Results</>  
                  ) : (
                    <>Lectures: <span className="text-indigo-400 font-extrabold">{MOCK_CHANNELS.find((c) => c.id === selectedChannelId)?.category_name}</span></>
                  )}
                </h2>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                  {(searchQuery ? searchFilteredVideos : filteredVideos).length} Lectures
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(searchQuery ? searchFilteredVideos : filteredVideos).map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => {
                      setSelectedVideo(vid);
                      setActiveTab('lesson');
                    }}
                    className="glass-panel rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/60 cursor-pointer transition-all group shadow-xl flex flex-col"
                  >
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video bg-black flex-shrink-0">
                      <img src={vid.thumbnail_url} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90" />
                      <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/90 font-mono text-[11px] text-slate-200">
                        {Math.round(vid.duration_seconds / 60)}m
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800 font-mono text-[11px] font-bold text-sky-300">
                            Post #{vid.telegram_message_id}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{vid.sender_username || '@EduStreamBot'}</span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                          {vid.title}
                        </h3>
                      </div>

                      {/* Telegram Message Caption Card Preview */}
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-sky-900/40 text-[11px]">
                        <div className="flex items-center space-x-1.5 text-sky-400 font-bold mb-1">
                          <Send className="w-3 h-3" />
                          <span>Telegram Post Caption:</span>
                        </div>
                        <p className="line-clamp-2 text-slate-300 leading-relaxed font-sans">{vid.telegram_caption}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2.5 mt-auto">
                        <span>{vid.attachments?.length || 0} Ingested Attachments (.pdf, .zip)</span>
                        <span className="text-indigo-400 font-bold">Watch & Practice &rarr;</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: SPLIT-SCREEN LESSON WORKSPACE */}
        {activeTab === 'lesson' && (
          <div className="space-y-6">
            
            {/* Top Workspace Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    Channel: {MOCK_CHANNELS.find((c) => c.id === selectedVideo.channel_id)?.category_name}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    Telegram Message #{selectedVideo.telegram_message_id}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">{selectedVideo.title}</h1>
              </div>

              {/* Sub tab selector for right workspace side */}
              <div className="flex items-center space-x-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setLessonSubTab('quiz')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    lessonSubTab === 'quiz' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>MCQ Quiz</span>
                </button>

                <button
                  onClick={handleOpenCodeTab}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    lessonSubTab === 'code' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Monaco Editor</span>
                  {isMobile && <span className="text-[10px] text-amber-400 font-mono">(Gated)</span>}
                </button>
              </div>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Video Player with Next/Prev Controls */}
              <div className="lg:col-span-7 space-y-6">
                <VideoPlayer
                  video={selectedVideo}
                  onNextLecture={handleNextLecture}
                  onPrevLecture={handlePrevLecture}
                  hasNextLecture={hasNextLecture}
                  hasPrevLecture={hasPrevLecture}
                />
                <ResourceCard
                  attachments={selectedVideo.attachments || []}
                  channelId={selectedVideo.channel_id}
                  messageId={selectedVideo.telegram_message_id}
                />
              </div>

              {/* Right Column: Code Editor or Quiz Module */}
              <div className="lg:col-span-5 h-[640px]">
                {lessonSubTab === 'code' ? (
                  <CodeWorkspace
                    question={selectedVideo.quiz_json.find((q) => q.type === 'CODING')}
                    onCodeExecuted={handleQuestionSolved}
                  />
                ) : (
                  <QuizModule
                    questions={selectedVideo.quiz_json.filter((q) => q.type === 'MCQ')}
                    onQuizSubmitted={handleQuestionSolved}
                  />
                )}
              </div>

            </div>

          </div>
        )}

        {/* VIEW 3: VELOCITY ANALYTICS & MISTRAL DIAGNOSTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <VelocityTracker
              totalSolved={totalSolved}
              totalActiveMins={totalActiveMins}
              accuracyPercent={accuracyPercent}
              timeBreakdown={{
                lecturesMins: 45,
                quizzesMins: 20,
                codingMins: 35
              }}
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

      {/* Auth Modal with Mandatory Authorization Code Gated Signup */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
        }}
      />

    </div>
  );
}
