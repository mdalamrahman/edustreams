import React, { useState, useEffect, useRef } from 'react';
import { 
  FileEdit, 
  X, 
  Minimize2, 
  Maximize2, 
  Clock, 
  Cloud, 
  Save, 
  GripHorizontal, 
  Eye, 
  EyeOff,
  RefreshCw,
  Download
} from 'lucide-react';
import { Video } from '../lib/types';
import { getCurrentStudent } from '../lib/auth';
import { 
  fetchVideoNotes, 
  saveVideoNotes, 
  downloadVideoNotesAsTxt, 
  getLocalVideoNotes 
} from '../lib/videoNotesService';

interface FloatingVideoNotesOverlayProps {
  video: Video;
  currentTime?: number;
  onClose: () => void;
  onSeek?: (seconds: number) => void;
}

export const FloatingVideoNotesOverlay: React.FC<FloatingVideoNotesOverlayProps> = ({
  video,
  currentTime = 0,
  onClose,
  onSeek
}) => {
  const student = getCurrentStudent();
  const userEmail = student?.email;

  const [notes, setNotes] = useState<string>(() => getLocalVideoNotes(video.id, userEmail));
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncedToR2, setIsSyncedToR2] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isSemiTransparent, setIsSemiTransparent] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const overlayRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimerRef = useRef<any>(null);
  const notesRef = useRef<string>(notes);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Load latest notes from cloud
  useEffect(() => {
    let isCancelled = false;
    const initial = getLocalVideoNotes(video.id, userEmail);
    setNotes(initial);

    fetchVideoNotes(video.id, userEmail).then((cloudNotes) => {
      if (!isCancelled && cloudNotes) {
        setNotes(cloudNotes);
        setIsSyncedToR2(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [video.id, userEmail]);

  // Listen for sync events from Main Tab
  useEffect(() => {
    const handleSyncEvent = (e: any) => {
      if (e.detail?.videoId === video.id && e.detail?.content !== undefined) {
        setNotes(e.detail.content);
        setIsSyncedToR2(true);
      }
    };
    window.addEventListener('sdetube_video_notes_updated', handleSyncEvent);
    return () => window.removeEventListener('sdetube_video_notes_updated', handleSyncEvent);
  }, [video.id]);

  // Periodic Auto-Sync to Cloudflare R2 every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (notesRef.current && notesRef.current.trim()) {
        saveVideoNotes(video.id, notesRef.current, userEmail).then((res) => {
          if (res.syncedToR2) {
            setIsSyncedToR2(true);
          }
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [video.id, userEmail]);

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from header handle
    if ((e.target as HTMLElement).closest('button, textarea, input')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 380, e.clientX - dragOffset.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 200, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    setIsSyncedToR2(false);

    try {
      localStorage.setItem(`sdetube_video_notes_${video.id}`, val);
    } catch {}

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      const res = await saveVideoNotes(video.id, val, userEmail);
      setIsSaving(false);
      if (res.syncedToR2) setIsSyncedToR2(true);
    }, 1500);
  };

  const handleManualSync = async () => {
    setIsSaving(true);
    const res = await saveVideoNotes(video.id, notes, userEmail);
    setIsSaving(false);
    if (res.syncedToR2) setIsSyncedToR2(true);
  };

  const formatTimestamp = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const insertTimestamp = () => {
    const textarea = textareaRef.current;
    const timeStr = `[${formatTimestamp(currentTime)}] `;
    if (!textarea) {
      const updated = notes + (notes.endsWith('\n') || !notes ? '' : '\n') + timeStr;
      setNotes(updated);
      saveVideoNotes(video.id, updated, userEmail);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const updated = notes.substring(0, start) + timeStr + notes.substring(end);
    setNotes(updated);
    setIsSyncedToR2(false);
    saveVideoNotes(video.id, updated, userEmail);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + timeStr.length;
    }, 50);
  };

  return (
    <div
      ref={overlayRef}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9999
      }}
      className={`w-80 sm:w-96 rounded-2xl border shadow-2xl transition-opacity duration-200 pointer-events-auto select-none ${
        isSemiTransparent 
          ? 'bg-slate-950/65 backdrop-blur-md border-amber-500/40 text-slate-100' 
          : 'bg-slate-950/95 backdrop-blur-xl border-amber-500/50 text-slate-100'
      }`}
    >
      {/* Draggable Header */}
      <div 
        onMouseDown={handleMouseDown}
        className="p-3 px-3.5 bg-slate-900/90 border-b border-slate-800 rounded-t-2xl flex items-center justify-between cursor-move"
      >
        <div className="flex items-center space-x-2">
          <GripHorizontal className="w-4 h-4 text-slate-500" />
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-300">
            <FileEdit className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs text-slate-100 truncate max-w-[140px]">
            Notes Overlay
          </span>
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono">
            {isSyncedToR2 ? 'R2' : 'Local'}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Transparency Toggle */}
          <button
            onClick={() => setIsSemiTransparent(!isSemiTransparent)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            title={isSemiTransparent ? 'Opaque Background' : 'Transparent Background (See video through notes)'}
          >
            {isSemiTransparent ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {/* Minimize / Maximize */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            title={isMinimized ? 'Expand Notes' : 'Minimize Notes'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-red-900 text-slate-300 hover:text-white text-xs transition-colors"
            title="Close Notes Overlay"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body Area */}
      {!isMinimized && (
        <div className="p-3 space-y-2.5">
          {/* Quick Toolbar */}
          <div className="flex items-center justify-between gap-1 text-[11px]">
            <button
              onClick={insertTimestamp}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 font-bold transition-all cursor-pointer"
              title={`Insert timestamp ${formatTimestamp(currentTime)}`}
            >
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>@ {formatTimestamp(currentTime)}</span>
            </button>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleManualSync}
                disabled={isSaving}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-all cursor-pointer disabled:opacity-50"
                title="Sync now to Cloudflare R2"
              >
                {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                <span>{isSaving ? 'Syncing' : 'Sync'}</span>
              </button>

              <button
                onClick={() => downloadVideoNotesAsTxt(video.title, notes)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                title="Download .txt"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Notes Textarea */}
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={handleNotesChange}
            placeholder="Type notes while watching... (Auto-saved to R2 every 1 min)"
            className="w-full h-44 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-xs font-sans focus:outline-none focus:border-amber-500 placeholder-slate-500 leading-relaxed resize-none custom-scrollbar select-text"
          />

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Cloud className="w-3 h-3 text-emerald-400" />
              <span>{isSyncedToR2 ? 'Synced to Cloudflare R2' : 'Saving locally...'}</span>
            </span>
            <span>{notes.length} chars</span>
          </div>
        </div>
      )}
    </div>
  );
};
