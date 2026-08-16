import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  DownloadCloud, 
  CheckCircle2, 
  Maximize, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  Send,
  SkipForward,
  SkipBack,
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  BookOpen,
  X
} from 'lucide-react';
import { AINotesAndSimulation } from './AINotesAndSimulation';
import { AIProcessingStatusCard } from './AIProcessingStatusCard';
import { Video } from '../lib/types';
import { getStreamUrl, TELEGRAM_BACKEND_URL } from '../lib/telegram';

interface VideoPlayerProps {
  video: Video;
  videoArtifacts?: any;
  onNextLecture?: () => void;
  onPrevLecture?: () => void;
  hasNextLecture?: boolean;
  hasPrevLecture?: boolean;
  onOpenAskAI?: (mode?: 'video' | 'notes' | 'quiz' | 'code', timestamp?: number) => void;
  onAutoComplete?: (videoId: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  videoArtifacts,
  onNextLecture,
  onPrevLecture,
  hasNextLecture = true,
  hasPrevLecture = true,
  onOpenAskAI,
  onAutoComplete
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration_seconds || 1200);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isCachedOffline, setIsCachedOffline] = useState(false);
  const [isCaching, setIsCaching] = useState(false);
  const [activeTab, setActiveTab] = useState<'caption' | 'transcript' | 'notes_sim'>('caption');
  const [streamError, setStreamError] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [dynamicTranscript, setDynamicTranscript] = useState<string>('');
  const [loadingTranscript, setLoadingTranscript] = useState<boolean>(false);
  const [autoCompleted, setAutoCompleted] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState<boolean>(false);
  const [confirmInput, setConfirmInput] = useState<string>('');
  const hideControlsTimer = useRef<any>(null);

  const triggerShowControls = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  const handleToggleFullscreen = () => {
    const videoEl = videoRef.current as any;
    const containerEl = containerRef.current as any;

    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      return;
    }

    if (videoEl?.webkitEnterFullscreen) {
      // iOS Safari native video fullscreen
      videoEl.webkitEnterFullscreen();
    } else if (containerEl?.requestFullscreen) {
      containerEl.requestFullscreen().catch(() => {
        if (videoEl?.requestFullscreen) videoEl.requestFullscreen().catch(() => {});
      });
    } else if (containerEl?.webkitRequestFullscreen) {
      containerEl.webkitRequestFullscreen();
    } else if (videoEl?.requestFullscreen) {
      videoEl.requestFullscreen().catch(() => {});
    }
  };

  // Build the real Telegram stream URL from channel_id + message_id via HF backend
  const streamSrc = getStreamUrl(video.channel_id, video.telegram_message_id || 0);

  // Reset player state strictly when video changes
  useEffect(() => {
    setStreamError(false);
    setIsLoadingStream(true);
    setIsPlaying(false);
    setCurrentTime(0);
    
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [video.id]);

  useEffect(() => {
    if ('caches' in window && streamSrc) {
      caches.open('edustream-video-v1').then(async (cache) => {
        const match = await cache.match(streamSrc);
        if (match) setIsCachedOffline(true);
        else setIsCachedOffline(false);
      });
    }
  }, [streamSrc]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleVideoError = () => {
    console.warn(`[EduStream] Telegram stream error for: ${video.title} (msg #${video.telegram_message_id})`);
    console.warn(`[EduStream] Stream URL: ${streamSrc}`);
    setStreamError(true);
    setIsLoadingStream(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoadingStream(false);
            setStreamError(false);
          })
          .catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                  setIsLoadingStream(false);
                })
                .catch(() => handleVideoError());
            }
          });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);

  const handleDownloadVideoFile = async () => {
    setIsDownloadingVideo(true);
    const cleanName = `${(video.title || 'lecture').replace(/[^\w\s.-]/gi, '')}.mp4`;
    const downloadEndpoint = (video.channel_id && video.telegram_message_id)
      ? `${TELEGRAM_BACKEND_URL}/api/download/${video.channel_id}/${video.telegram_message_id}?file_name=${encodeURIComponent(cleanName)}`
      : streamSrc;

    try {
      const response = await fetch(downloadEndpoint);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = cleanName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } else {
        throw new Error('Direct fetch failed');
      }
    } catch (e) {
      const a = document.createElement('a');
      a.href = downloadEndpoint;
      a.download = cleanName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsDownloadingVideo(false);
    }
  };

  const handleReconnect = () => {
    setStreamError(false);
    setIsLoadingStream(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Auto-complete lecture when ≥70% of video duration watched & track active study time
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    let lastTracked = Date.now();

    const handleTimeUpdate = () => {
      const dur = video.duration_seconds || videoEl.duration || 0;
      if (dur > 0 && videoEl.currentTime >= dur * 0.7 && !autoCompleted) {
        setAutoCompleted(true);
        if (onAutoComplete) onAutoComplete(video.id);
      }

      // Track active watch minutes every 5 seconds of playback
      const now = Date.now();
      if (!videoEl.paused && now - lastTracked >= 5000) {
        const deltaMins = (now - lastTracked) / 60000;
        lastTracked = now;
        try {
          const currentMins = parseFloat(localStorage.getItem('edustream_active_mins') || '0') + deltaMins;
          localStorage.setItem('edustream_active_mins', currentMins.toFixed(2));
          const bd = JSON.parse(localStorage.getItem('edustream_time_breakdown') || '{"lecturesMins":0,"quizzesMins":0,"codingMins":0}');
          bd.lecturesMins = Number((bd.lecturesMins + deltaMins).toFixed(2));
          localStorage.setItem('edustream_time_breakdown', JSON.stringify(bd));
        } catch {}
      }
    };
    videoEl.addEventListener('timeupdate', handleTimeUpdate);
    return () => videoEl.removeEventListener('timeupdate', handleTimeUpdate);
  }, [video.id, autoCompleted, onAutoComplete, video.duration_seconds]);

  // Quick Check: If transcript / payload exists, render immediately; otherwise show realtime progress across all tabs
  useEffect(() => {
    const cleanTitle = (video.title || 'Lecture').replace(/\.(mp4|mkv|webm|avi|mov)$/i, '');
    const durationMins = Math.max(5, Math.round((video.duration_seconds || 900) / 60));
    const cacheKey = `edustream_transcript_${video.id || cleanTitle}_v3`;

    // 1. Instant Memory / Props Check
    if (videoArtifacts?.transcript && videoArtifacts.transcript.length > 50) {
      setDynamicTranscript(videoArtifacts.transcript);
      setLoadingTranscript(false);
      try { localStorage.setItem(cacheKey, videoArtifacts.transcript); } catch {}
      return;
    }

    if (video.transcript && video.transcript.length > 50 && !video.transcript.includes('Ingested from')) {
      setDynamicTranscript(video.transcript);
      setLoadingTranscript(false);
      try { localStorage.setItem(cacheKey, video.transcript); } catch {}
      return;
    }

    // 2. Instant Local Storage Check
    const savedTranscript = localStorage.getItem(cacheKey);
    if (savedTranscript && !savedTranscript.includes('Section 1: Core Principles & Definitions') && savedTranscript.length > 50) {
      setDynamicTranscript(savedTranscript);
      setLoadingTranscript(false);
      return;
    }

    // 3. Fast Backend / Cloudflare R2 / SQLite Check
    setLoadingTranscript(true);
    let isCancelled = false;
    let pollInterval: any = null;

    const fetchTranscript = async () => {
      try {
        const url = `${TELEGRAM_BACKEND_URL}/api/transcript/${video.channel_id}/${video.telegram_message_id}?title=${encodeURIComponent(cleanTitle)}&duration=${durationMins}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        
        if (!isCancelled && data?.transcript && data.transcript.length > 50) {
          setDynamicTranscript(data.transcript);
          setLoadingTranscript(false);
          try { localStorage.setItem(cacheKey, data.transcript); } catch {}
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (err) {
        console.warn('[EduStream Fast Transcript Notice]:', err);
      }
    };

    fetchTranscript();

    // Poll status while loading to update live progress bar
    pollInterval = setInterval(async () => {
      if (isCancelled) return;
      try {
        const statusUrl = `${TELEGRAM_BACKEND_URL}/api/transcript/status/${video.channel_id}/${video.telegram_message_id}?title=${encodeURIComponent(cleanTitle)}&duration=${durationMins}`;
        const resp = await fetch(statusUrl);
        if (resp.ok) {
          const statusData = await resp.json();
          if (statusData?.transcript && statusData.transcript.length > 50) {
            setDynamicTranscript(statusData.transcript);
            setLoadingTranscript(false);
            try { localStorage.setItem(cacheKey, statusData.transcript); } catch {}
            clearInterval(pollInterval);
          }
        }
      } catch {}
    }, 3000);

    return () => {
      isCancelled = true;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [video.id, video.title, video.channel_id, video.telegram_message_id, video.duration_seconds, videoArtifacts?.transcript, video.transcript]);

  const handleRegenerateTranscript = () => {
    setShowRegenModal(false);
    setConfirmInput('');
    const cleanTitle = (video.title || 'Lecture').replace(/\.(mp4|mkv|webm|avi|mov)$/i, '');
    const durationMins = Math.max(5, Math.round((video.duration_seconds || 900) / 60));
    const cacheKey = `edustream_transcript_${video.id || cleanTitle}_v2`;

    // Clear local storage cache
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(`edustream_transcript_${video.id || cleanTitle}`);
    setLoadingTranscript(true);

    const url = `${TELEGRAM_BACKEND_URL}/api/transcript/${video.channel_id}/${video.telegram_message_id}?title=${encodeURIComponent(cleanTitle)}&duration=${durationMins}&force=true`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data?.transcript) {
          setDynamicTranscript(data.transcript);
          localStorage.setItem(cacheKey, data.transcript);
        }
      })
      .catch((err) => console.warn('[Regenerate Transcript Notice]:', err))
      .finally(() => setLoadingTranscript(false));
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      
      {/* Video Title Bar & Navigation Controls */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700 text-[11px] font-mono font-bold text-indigo-300">
              Post #{video.telegram_message_id}
            </span>
            <span className="text-[11px] font-mono text-slate-400">{video.sender_username || '@EduStreamBot'}</span>
          </div>
          <h2 className="text-base font-bold text-slate-100 line-clamp-1">{video.title}</h2>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {onPrevLecture && (
            <button
              onClick={onPrevLecture}
              disabled={!hasPrevLecture}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                hasPrevLecture
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
              }`}
              title="Previous Lecture"
            >
              <SkipBack className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>
          )}

          {onNextLecture && (
            <button
              onClick={onNextLecture}
              disabled={!hasNextLecture}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                hasNextLecture
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
              }`}
              title="Next Lecture"
            >
              <span>Next</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenAskAI && (
            <button
              onClick={() => onOpenAskAI('video', currentTime)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30 transition-all border border-purple-400/30 cursor-pointer"
              title="Ask AI Teaching Assistant about this lecture"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
              <span>Ask AI</span>
            </button>
          )}

          <button
            onClick={handleToggleFullscreen}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-md active:scale-95"
            title="Toggle Fullscreen Video"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>

          <button
            onClick={handleDownloadVideoFile}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 transition-all shadow-md"
            title="Download Video File directly to disk"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport — REAL TELEGRAM VIDEO via Telethon MTProto Stream */}
      <div
        ref={containerRef}
        onClick={triggerShowControls}
        onMouseMove={triggerShowControls}
        className="relative aspect-video bg-black group overflow-hidden select-none"
      >
        {streamError || !streamSrc ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 text-slate-300 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-indigo-950 border-2 border-indigo-600 flex items-center justify-center text-indigo-400 mb-4 animate-pulse">
              <WifiOff className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-100 mb-1">SDETube Cloud Video Stream</p>
            <p className="text-xs text-slate-400 mb-1 max-w-md">
              Lecture: <span className="font-mono text-indigo-300 font-bold">{video.title}</span>
            </p>
            <button
              onClick={handleReconnect}
              className="mt-3 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={streamSrc}
              controls={false}
              crossOrigin="anonymous"
              playsInline
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={() => {
                if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
              }}
              onLoadedMetadata={() => {
                setIsLoadingStream(false);
                if (videoRef.current) setDuration(videoRef.current.duration);
              }}
              onError={(e) => {
                console.warn('Video Stream error:', e);
                setIsLoadingStream(false);
              }}
              className="w-full h-full object-contain"
            />

            {isLoadingStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-mono text-indigo-300 font-bold">SDETube Streaming Bytes...</span>
                </div>
              </div>
            )}

            {!isPlaying && !streamError && !isLoadingStream && (
              <>
                {/* Center Play Circle */}
                <div
                  className="absolute inset-0 bg-slate-950/20 flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/50 transition-transform transform hover:scale-110">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                </div>

                {/* Floating Ask AI Button on Top Right (Shows only when Video is Paused) */}
                <div className="absolute top-4 right-4 z-40 animate-fadeIn pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const curSecs = videoRef.current?.currentTime || currentTime || 0;
                      if (onOpenAskAI) {
                        onOpenAskAI('video', curSecs);
                      }
                    }}
                    className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 hover:bg-purple-950 text-purple-200 hover:text-white border border-purple-500/60 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 group cursor-pointer"
                    title={`Ask AI regarding paused timestamp (${formatTime(currentTime)})`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
                    <span className="text-xs font-bold font-mono">Ask AI @ {formatTime(currentTime)}</span>
                  </button>
                </div>
              </>
            )}

            {/* Overlay Video Controls (Mobile-aware touch toggle & hover) */}
            <div className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent transition-all duration-300 ${
              showControls || !isPlaying ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto'
            }`}>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-3"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                    className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>

                  <span className="text-[11px] sm:text-xs text-slate-300 font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="flex items-center space-x-0.5 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-0.5 text-xs text-slate-300">
                    {[1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={(e) => { e.stopPropagation(); handleSpeedChange(speed); }}
                        className={`px-1.5 py-0.5 rounded font-mono text-[11px] sm:text-xs ${playbackSpeed === speed ? 'bg-indigo-600 text-white font-bold' : 'hover:text-slate-100'}`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFullscreen(); }}
                    className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-indigo-600 text-slate-200 hover:text-white transition-colors border border-slate-700"
                    title="Fullscreen"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs Below Player */}
      <div className="p-4 bg-slate-900/80 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('caption')}
              className={`flex items-center space-x-1.5 text-xs font-bold transition-all ${
                activeTab === 'caption'
                  ? 'text-sky-400 border-b-2 border-sky-400 pb-1'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Lecture Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex items-center space-x-1.5 text-xs font-bold transition-all ${
                activeTab === 'transcript'
                  ? 'text-purple-400 border-b-2 border-purple-400 pb-1'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Speech Transcript</span>
            </button>

            <button
              onClick={() => setActiveTab('notes_sim')}
              className={`flex items-center space-x-1.5 text-xs font-bold transition-all ${
                activeTab === 'notes_sim'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 pb-1'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Notes & Simulation</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" /> {Math.round((video.duration_seconds || 0) / 60)} Mins
          </span>
        </div>

        {activeTab === 'caption' ? (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-900/40 text-xs text-slate-200 leading-relaxed">
            <div className="flex items-center space-x-2 text-sky-400 font-semibold mb-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>SDETube Course Module:</span>
            </div>
            <p className="whitespace-pre-line text-slate-300 font-sans">{video.telegram_caption || 'No description available for this lecture.'}</p>
          </div>
        ) : activeTab === 'transcript' ? (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-900/40 text-xs text-slate-300 font-mono leading-relaxed relative">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-purple-900/30">
              <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                SDETube Speech-to-Text Verbatim Transcript
              </span>
              <button
                onClick={() => setShowRegenModal(true)}
                disabled={loadingTranscript}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-300 font-bold transition-all text-[11px]"
                title="Force regenerate transcript and AI content (Requires 'i am sure' typing)"
              >
                <RefreshCw className={`w-3 h-3 ${loadingTranscript ? 'animate-spin' : ''}`} />
                <span>{loadingTranscript ? 'Regenerating...' : 'Regenerate Transcript'}</span>
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto whitespace-pre-line leading-relaxed pr-1">
              {loadingTranscript ? (
                <AIProcessingStatusCard 
                  videoTitle={video.title || 'Lecture'} 
                  durationSeconds={video.duration_seconds || 900} 
                  progressPercent={videoArtifacts?.progress_percent}
                  currentPart={videoArtifacts?.current_part}
                  totalParts={videoArtifacts?.total_parts}
                  stage={videoArtifacts?.stage}
                  estimatedSecondsLeft={videoArtifacts?.estimated_seconds_left}
                />
              ) : (
                videoArtifacts?.transcript || dynamicTranscript || (video.transcript && !video.transcript.includes('Ingested from') ? video.transcript : 'SDETube AI Speech Engine processing verbatim lecture transcript...')
              )}
            </div>
          </div>
        ) : (
          <AINotesAndSimulation video={video} videoArtifacts={videoArtifacts} isLoading={loadingTranscript} onOpenAskAI={onOpenAskAI} />
        )}
      </div>

      {/* Regeneration Confirmation Modal ("i am sure") */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Token Preservation Warning</span>
              </div>
              <button
                onClick={() => { setShowRegenModal(false); setConfirmInput(''); }}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Regenerating transcript will consume AI API tokens and overwrite existing stored notes, quiz, and coding problems.
              <br /><br />
              To confirm regeneration, please type <strong className="text-amber-300 font-mono">i am sure</strong> below:
            </p>

            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Type 'i am sure' here"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-500"
            />

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => { setShowRegenModal(false); setConfirmInput(''); }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleRegenerateTranscript}
                disabled={confirmInput.trim().toLowerCase() !== 'i am sure'}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  confirmInput.trim().toLowerCase() === 'i am sure'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                Force Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
