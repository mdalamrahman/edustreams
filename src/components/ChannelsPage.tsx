import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ChevronRight, 
  ArrowLeft, 
  Search, 
  X, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  Code2, 
  Cpu, 
  Database, 
  Network, 
  Layers 
} from 'lucide-react';
import { MOCK_CHANNELS, MOCK_VIDEOS } from '../lib/supabase';
import { useAppContext } from '../lib/AppContext';
import { Video } from '../lib/types';

export const getChannelIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Code2': return <Code2 className="w-6 h-6" />;
    case 'Cpu': return <Cpu className="w-6 h-6" />;
    case 'Database': return <Database className="w-6 h-6" />;
    case 'Network': return <Network className="w-6 h-6" />;
    case 'Layers': return <Layers className="w-6 h-6" />;
    default: return <BookOpen className="w-6 h-6" />;
  }
};

export const ChannelsPage: React.FC = () => {
  const { channelId: paramChannelId } = useParams<{ channelId?: string }>();
  const navigate = useNavigate();
  const {
    dynamicVideos,
    selectedVideo,
    setSelectedVideo,
    selectedChannelId,
    setSelectedChannelId,
    channelCounts,
    completedLectures,
    toggleLectureComplete,
    openVideoWithBilling,
    setIsAskAIOpen,
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');

  const activeChannelId = paramChannelId || selectedChannelId || MOCK_CHANNELS[0].id;
  const isOverview = !paramChannelId;

  const activeChannelObj = useMemo(() => {
    return MOCK_CHANNELS.find((c) => c.id === activeChannelId) || MOCK_CHANNELS[0];
  }, [activeChannelId]);

  const channelVideos = useMemo(() => {
    const list = dynamicVideos.length > 0 ? dynamicVideos : MOCK_VIDEOS;
    return list.filter((v) => v.channel_id === activeChannelId);
  }, [dynamicVideos, activeChannelId]);

  const searchFilteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return channelVideos;
    const q = searchQuery.toLowerCase();
    return channelVideos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        (v.telegram_caption && v.telegram_caption.toLowerCase().includes(q))
    );
  }, [channelVideos, searchQuery]);

  const handleSelectChannel = (chId: string) => {
    setSelectedChannelId(chId);
    navigate(`/channel/${chId}`);
  };

  const handleWatchVideo = (v: Video) => {
    const ok = openVideoWithBilling(v, 'channels');
    if (ok) {
      navigate(`/lesson/${encodeURIComponent(v.id)}`);
    }
  };

  return (
    <div className="space-y-6">
      {isOverview ? (
        /* Channel Hub Overview Cards */
        <div className="space-y-8">
          {/* Hero Showcase Banner */}
          <div className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950 border border-sky-700/60 text-sky-300 font-mono text-[11px] font-bold w-fit">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>CLOUD HD LECTURE CHANNELS &bull; SYNCED AI NOTES</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                  SDETube Video Channels & SDE Curricula
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                  Curated multi-track video lecture streams ingested directly with synchronized AI transcripts, smart notes, and interactive quizzes.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                  <div className="text-xs font-bold text-sky-400">Total Ingested</div>
                  <div className="text-xl font-black text-slate-100 font-mono mt-0.5">
                    {Object.values(channelCounts).reduce((a, b) => a + b, 0) || '200+'} <span className="text-xs text-slate-500">Lectures</span>
                  </div>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                  <div className="text-xs font-bold text-indigo-400">Learning Tracks</div>
                  <div className="text-xl font-black text-slate-100 font-mono mt-0.5">
                    {MOCK_CHANNELS.length} <span className="text-xs text-slate-500">Tracks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Channels Grid (Expansive Widescreen 4-Column Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_CHANNELS.map((ch) => {
              const videoCount = channelCounts[ch.id] || ch.total_videos || 0;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChannel(ch.id)}
                  className="glass-panel p-6 rounded-3xl text-left transition-all relative overflow-hidden group border border-slate-800/80 hover:border-sky-500/80 hover:bg-sky-950/20 shadow-xl flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 group-hover:scale-110 group-hover:bg-sky-950/60 group-hover:border-sky-700/60 transition-all text-sky-300">
                        {getChannelIcon(ch.icon)}
                      </div>
                      <span className="px-3 py-1 rounded-full bg-sky-950 border border-sky-700/60 text-xs font-mono font-bold text-sky-300">
                        {videoCount} Lectures
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 mb-2 group-hover:text-sky-300 transition-colors flex items-center justify-between">
                      <span>{ch.category_name}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{ch.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-sky-400">
                    <span>Open Track Playlist</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* DEDICATED CHANNEL PAGE */
        <div className="space-y-6">
          {/* Header & Back to Overview Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-xl">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/channels')}
                className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer shadow-sm"
                title="Back to All Channels"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Channels</span>
              </button>

              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/40">
                    {getChannelIcon(activeChannelObj.icon)}
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">{activeChannelObj.name} Workspace</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-[11px] font-mono font-bold text-emerald-300">
                    {channelVideos.length} Ingested Videos
                  </span>
                </div>
                <p className="text-xs text-slate-400">{activeChannelObj.description}</p>
              </div>
            </div>

            {/* Dedicated Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeChannelObj.name} lectures...`}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-950 border border-indigo-500/40 text-xs text-slate-100 focus:outline-none focus:border-indigo-400 font-sans shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
                        onClick={() => handleWatchVideo(v)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedVideo(v);
                          setIsAskAIOpen(true);
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI</span>
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLectureComplete(v.id);
                      }}
                      className={`p-1.5 rounded-lg transition-all border cursor-pointer ${
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
  );
};
