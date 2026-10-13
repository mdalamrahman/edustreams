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
        /* Channel Hub Overview Cards (Obsidian Telemetry) */
        <div className="space-y-8">
          {/* Hero Showcase Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090d16]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl group">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl transition-opacity group-hover:opacity-100" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl transition-opacity group-hover:opacity-100" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[11px] font-bold tracking-wide uppercase">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>● CLOUD LECTURE PIPELINE // SYNCED AI NOTES &amp; TRANSCRIPTS</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  SDETube Video Channels &amp; SDE Curricula
                </h2>
                <p className="text-xs sm:text-sm text-stitch-dim max-w-2xl leading-relaxed">
                  Curated multi-track video lecture streams ingested directly with synchronized AI transcripts, smart notes, and interactive quizzes.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-3 rounded-xl bg-[#0e1320] border border-white/[0.08] text-center shadow-inner">
                  <div className="text-xs font-mono font-bold text-cyan-400">Total Ingested</div>
                  <div className="text-xl font-black text-white font-mono mt-0.5">
                    {Object.values(channelCounts).reduce((a, b) => a + b, 0) || '200+'} <span className="text-xs text-slate-500 font-normal">Lectures</span>
                  </div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-[#0e1320] border border-white/[0.08] text-center shadow-inner">
                  <div className="text-xs font-mono font-bold text-purple-400">Learning Tracks</div>
                  <div className="text-xl font-black text-white font-mono mt-0.5">
                    {MOCK_CHANNELS.length} <span className="text-xs text-slate-500 font-normal">Tracks</span>
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
                  className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-6 text-left transition-all relative overflow-hidden group hover:border-cyan-400/50 hover:bg-[#0f1422] shadow-xl flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 group-hover:scale-105 group-hover:border-cyan-400/50 transition-all text-cyan-400">
                        {getChannelIcon(ch.icon)}
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#070a12] border border-white/[0.08] text-xs font-mono font-bold text-cyan-300">
                        {videoCount} Lectures
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                      <span>{ch.category_name}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs text-stitch-dim line-clamp-3 leading-relaxed">{ch.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-white/[0.08] bg-[#0c101a] shadow-xl">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/channels')}
                className="p-3 rounded-xl bg-stitch-surface hover:bg-stitch-card border border-white/[0.08] text-stitch-dim hover:text-white transition-all flex items-center gap-2 text-xs font-mono font-bold cursor-pointer shadow-sm"
                title="Back to All Channels"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Channels</span>
              </button>

              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {getChannelIcon(activeChannelObj.icon)}
                  </div>
                  <h2 className="text-xl font-bold text-white">{activeChannelObj.name} Workspace</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-300">
                    {channelVideos.length} Ingested Videos
                  </span>
                </div>
                <p className="text-xs text-stitch-dim">{activeChannelObj.description}</p>
              </div>
            </div>

            {/* Dedicated Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeChannelObj.name} lectures...`}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#070a12] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400 font-mono shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
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
                  className={`rounded-2xl overflow-hidden border transition-all flex flex-col justify-between group bg-[#0c101a] ${
                    isCurrent
                      ? 'border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'border-white/[0.08] hover:border-cyan-400/40'
                  }`}
                >
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stitch-dim">
                      <span className="px-2 py-0.5 rounded bg-[#070a12] border border-white/[0.08] font-bold text-cyan-300">
                        Post #{v.telegram_message_id}
                      </span>
                      <span>{v.sender_username || '@SDETubeBot'}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {v.title}
                    </h4>

                    <p className="text-xs text-stitch-dim line-clamp-3 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                      {v.telegram_caption}
                    </p>
                  </div>

                  <div className="p-4 bg-[#070a12] border-t border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleWatchVideo(v)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedVideo(v);
                          setIsAskAIOpen(true);
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold transition-all cursor-pointer"
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
                          ? 'bg-emerald-950 border-emerald-500/50 text-emerald-400 shadow-sm shadow-emerald-500/20'
                          : 'bg-[#0e1422] border-white/[0.08] text-slate-500 hover:text-white hover:border-cyan-400/40'
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
