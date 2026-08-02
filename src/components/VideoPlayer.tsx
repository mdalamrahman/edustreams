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
  WifiOff
} from 'lucide-react';
import { Video } from '../lib/types';
import { getStreamUrl, TELEGRAM_BACKEND_URL } from '../lib/telegram';

interface VideoPlayerProps {
  video: Video;
  onNextLecture?: () => void;
  onPrevLecture?: () => void;
  hasNextLecture?: boolean;
  hasPrevLecture?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onNextLecture,
  onPrevLecture,
  hasNextLecture = true,
  hasPrevLecture = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration_seconds || 1200);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isCachedOffline, setIsCachedOffline] = useState(false);
  const [isCaching, setIsCaching] = useState(false);
  const [activeTab, setActiveTab] = useState<'caption' | 'transcript'>('caption');
  const [streamError, setStreamError] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(true);

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

  const toggleOfflineCache = async () => {
    if (isCachedOffline || isCaching || !streamSrc) return;
    setIsCaching(true);
    try {
      if ('caches' in window) {
        const cache = await caches.open('edustream-video-v1');
        const response = await fetch(streamSrc);
        if (response.ok) {
          await cache.put(streamSrc, response);
          setIsCachedOffline(true);
        }
      }
    } catch (err) {
      console.warn('Offline cache error:', err);
    } finally {
      setIsCaching(false);
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

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      
      {/* Top Header Bar with Next / Prev Navigation */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 truncate min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 flex-shrink-0">
            Post #{video.telegram_message_id || 101}
          </span>
          <h2 className="text-sm font-bold text-slate-100 truncate">{video.title}</h2>
        </div>

        {/* Prev / Next Navigation Controls */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {onPrevLecture && (
            <button
              onClick={onPrevLecture}
              disabled={!hasPrevLecture}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                hasPrevLecture
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
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
              <span>Next Lecture</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={toggleOfflineCache}
            disabled={isCachedOffline || isCaching}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isCachedOffline
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700'
            }`}
          >
            {isCachedOffline ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>{isCaching ? 'Saving...' : 'Offline'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Video Viewport — REAL TELEGRAM VIDEO via HF Telethon Backend */}
      <div className="relative aspect-video bg-black group">
        {streamError || !streamSrc ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 text-slate-300 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-indigo-950 border-2 border-indigo-600 flex items-center justify-center text-indigo-400 mb-4 animate-pulse">
              <WifiOff className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-100 mb-1">Telegram MTProto Video Stream</p>
            <p className="text-xs text-slate-400 mb-1 max-w-md">
              Target: <span className="font-mono text-indigo-300 font-bold">{video.title}</span> (Post #{video.telegram_message_id})
            </p>
            <p className="text-[11px] text-slate-500 mb-1 max-w-sm font-mono">
              Backend: {TELEGRAM_BACKEND_URL}
            </p>
            <p className="text-[11px] text-slate-500 mb-4 max-w-sm">
              {!streamSrc
                ? 'No stream URL available — missing channel or message ID.'
                : 'Connection to Render Telethon backend failed. The instance may be spinning up from inactivity.'}
            </p>
            <button
              onClick={handleReconnect}
              disabled={!streamSrc}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reconnect Telegram Stream</span>
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              key={streamSrc}
              poster={video.thumbnail_url}
              className="w-full h-full object-cover"
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                setIsLoadingStream(false);
                if (videoRef.current && videoRef.current.duration) {
                  setDuration(videoRef.current.duration);
                }
              }}
              onEnded={() => {
                setIsPlaying(false);
                if (onNextLecture && hasNextLecture) onNextLecture();
              }}
              onError={handleVideoError}
            >
              <source src={streamSrc} type="video/mp4" />
            </video>

            {/* Loading indicator */}
            {isLoadingStream && (
              <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin"></div>
                  <p className="text-xs text-slate-300 font-mono">Connecting to Telegram...</p>
                </div>
              </div>
            )}

            {!isPlaying && !streamError && !isLoadingStream && (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer" onClick={togglePlay}>
                <div className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/50 transition-transform transform hover:scale-110">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              </div>
            )}

            {/* Overlay Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-3"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button onClick={togglePlay} className="text-slate-200 hover:text-white transition-colors">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  <button onClick={() => setIsMuted(!isMuted)} className="text-slate-200 hover:text-white transition-colors">
                    {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  <span className="text-xs text-slate-300 font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 text-xs text-slate-300">
                    {[1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`px-1.5 py-0.5 rounded font-mono ${playbackSpeed === speed ? 'bg-indigo-600 text-white font-bold' : 'hover:text-slate-100'}`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                  {/* Render Backend connection indicator */}
                  <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400" title={`Streaming via ${TELEGRAM_BACKEND_URL}`}>
                    <Wifi className="w-3 h-3" />
                    <span className="hidden xl:inline">Render Live</span>
                  </div>

                  <button
                    onClick={() => videoRef.current?.requestFullscreen()}
                    className="text-slate-300 hover:text-white transition-colors"
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
              <span>Telegram Post Caption</span>
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
              <span>Whisper Transcript</span>
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
              <span>Telegram Channel Post ({video.sender_username || '@EduStreamBot'}):</span>
            </div>
            <p className="whitespace-pre-line text-slate-300 font-sans">{video.telegram_caption || 'No caption available.'}</p>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-900/40 text-xs text-slate-300 font-mono leading-relaxed max-h-32 overflow-y-auto">
            {video.transcript || 'Groq whisper-large-v3 transcript processing...'}
          </div>
        )}
      </div>
    </div>
  );
};
