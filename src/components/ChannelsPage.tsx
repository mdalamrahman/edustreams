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

const CHANNEL_METADATA: Record<string, { tags: string[]; instructor: string; level: string }> = {
  'ch-dsa-01': {
    tags: ['Arrays & Hashing', 'Trees & Graphs', 'Dynamic Programming', 'Recursion'],
    instructor: 'Striver & Curated SDE Faculty',
    level: 'SDE-1 / SDE-2'
  },
  'ch-sd-02': {
    tags: ['SOLID Principles', 'Design Patterns', 'Concurrency & Locks', 'UML & OOP'],
    instructor: 'Staff Systems Architect',
    level: 'SDE-2 / Senior'
  },
  'ch-dbms-03': {
    tags: ['SQL Optimization', 'B+ Trees', 'ACID Transactions', 'MVCC & Isolation'],
    instructor: 'Database Internals Core',
    level: 'SDE-1 / SDE-2'
  },
  'ch-cn-04': {
    tags: ['TCP/IP Stack', 'Subnetting & Routing', 'HTTP/2 & HTTP/3', 'Socket Traces'],
    instructor: 'Network Protocol Specialist',
    level: 'Core SDE Fundamentals'
  },
  'ch-hld-05': {
    tags: ['Distributed Systems', 'Load Balancing & CDN', 'Kafka & Queues', 'Sharding'],
    instructor: 'Principal Architect & Neetcode',
    level: 'Staff / Principal'
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
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* 1. Mobile & Desktop Horizontal Channel Filter Bar */}
      <div className="relative -mx-2 sm:mx-0 px-2 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => navigate('/channels')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 touch-target ${
              isOverview
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'bg-[#0f131c] border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>All Channels</span>
          </button>

          {MOCK_CHANNELS.map((ch) => {
            const isActive = !isOverview && activeChannelId === ch.id;
            const count = channelCounts[ch.id] || ch.post_count || ch.total_videos || 0;
            return (
              <button
                key={ch.id}
                onClick={() => handleSelectChannel(ch.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 touch-target ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-bold'
                    : 'bg-[#0f131c] border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/20'
                }`}
              >
                <span>{ch.category_name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-slate-500 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {isOverview ? (
        /* Channel Hub Overview Cards (Obsidian Telemetry) */
        <div className="space-y-6 sm:space-y-8">
          {/* Hero Showcase Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090d16]/95 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl group">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl transition-opacity group-hover:opacity-100" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl transition-opacity group-hover:opacity-100" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex flex-wrap items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] sm:text-[11px] font-bold tracking-wide uppercase">
                  <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>CLOUD LECTURE PIPELINE // SYNCED AI TRANSCRIPTS &amp; NOTES</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight break-words">
                  SDETube Video Channels &amp; SDE Curricula
                </h2>
                <p className="text-xs sm:text-sm text-stitch-dim max-w-2xl leading-relaxed">
                  Curated multi-track video lecture streams ingested directly with synchronized AI transcripts, smart notes, and interactive quizzes.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 flex-shrink-0">
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#0e1320] border border-white/[0.08] text-center shadow-inner">
                  <div className="text-[11px] sm:text-xs font-mono font-bold text-cyan-400">Total Ingested</div>
                  <div className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
                    {Object.values(channelCounts).reduce((a, b) => a + b, 0) || '200+'} <span className="text-[10px] sm:text-xs text-slate-500 font-normal">Lectures</span>
                  </div>
                </div>
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#0e1320] border border-white/[0.08] text-center shadow-inner">
                  <div className="text-[11px] sm:text-xs font-mono font-bold text-purple-400">Learning Tracks</div>
                  <div className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
                    {MOCK_CHANNELS.length} <span className="text-[10px] sm:text-xs text-slate-500 font-normal">Tracks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Channels Grid (Responsive Grid 1-col on mobile, 2-col on tablet, 3-col on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {MOCK_CHANNELS.map((ch) => {
              const videoCount = channelCounts[ch.id] || ch.post_count || ch.total_videos || 0;
              const meta = CHANNEL_METADATA[ch.id] || { tags: ['SDE', 'Engineering'], level: 'SDE Prep' };
              return (
                <div
                  key={ch.id}
                  onClick={() => handleSelectChannel(ch.id)}
                  className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-4 sm:p-5 text-left transition-all relative overflow-hidden group hover:border-cyan-400/50 hover:bg-[#0f1422] shadow-xl flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 group-hover:scale-105 group-hover:border-cyan-400/50 transition-all text-cyan-400 flex-shrink-0">
                        {getChannelIcon(ch.icon)}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] sm:text-xs font-mono font-bold text-cyan-300">
                          {videoCount} Lectures
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-[10px] font-mono font-bold text-purple-300">
                          {meta.level}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors flex items-center justify-between gap-2">
                        <span className="truncate">{ch.category_name}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </h3>
                      <p className="text-xs text-stitch-dim line-clamp-2 leading-relaxed">{ch.description}</p>
                    </div>

                    {/* Topic Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {meta.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-[#070a12] text-slate-400 font-mono text-[10px] border border-white/[0.06]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
                    <span>Open Track Playlist</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* DEDICATED CHANNEL PAGE */
        <div className="space-y-5 sm:space-y-6">
          {/* Header & Back to Overview Navigation */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl border border-white/[0.08] bg-[#0c101a] shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/channels')}
                className="self-start p-2.5 sm:p-3 rounded-xl bg-stitch-surface hover:bg-stitch-card border border-white/[0.08] text-stitch-dim hover:text-white transition-all flex items-center gap-2 text-xs font-mono font-bold cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
                title="Back to All Channels"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Channels</span>
              </button>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex-shrink-0">
                    {getChannelIcon(activeChannelObj.icon)}
                  </div>
                  <h2 className="text-base sm:text-xl font-bold text-white break-words">
                    {activeChannelObj.category_name || activeChannelObj.name} Workspace
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] sm:text-[11px] font-mono font-bold text-emerald-300">
                    {channelVideos.length} Ingested Videos
                  </span>
                </div>
                <p className="text-xs text-stitch-dim line-clamp-2">{activeChannelObj.description}</p>
              </div>
            </div>

            {/* Dedicated Search Bar */}
            <div className="relative w-full md:w-80 flex-shrink-0">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeChannelObj.category_name || 'channel'} lectures...`}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#070a12] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400 font-mono shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
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
                  <div className="p-3.5 sm:p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stitch-dim">
                      <span className="px-2 py-0.5 rounded bg-[#070a12] border border-white/[0.08] font-bold text-cyan-300">
                        Post #{v.telegram_message_id}
                      </span>
                      <span className="truncate max-w-[120px] sm:max-w-none">{v.sender_username || '@SDETubeBot'}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 break-words">
                      {v.title}
                    </h4>

                    <p className="text-xs text-stitch-dim line-clamp-2 sm:line-clamp-3 leading-relaxed whitespace-pre-line font-mono text-[11px] break-words">
                      {v.telegram_caption}
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-[#070a12] border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => handleWatchVideo(v)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedVideo(v);
                          setIsAskAIOpen(true);
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
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
                      className={`p-2 rounded-xl transition-all border cursor-pointer active:scale-95 ${
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
