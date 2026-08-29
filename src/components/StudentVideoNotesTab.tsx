import React, { useState, useEffect, useRef } from 'react';
import { 
  FileEdit, 
  Save, 
  Download, 
  Clock, 
  CheckCircle2, 
  Cloud, 
  RefreshCw, 
  Trash2, 
  Bold, 
  List, 
  Code, 
  Heading, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Video } from '../lib/types';
import { getCurrentStudent } from '../lib/auth';
import { 
  fetchVideoNotes, 
  saveVideoNotes, 
  downloadVideoNotesAsTxt, 
  getLocalVideoNotes 
} from '../lib/videoNotesService';

interface StudentVideoNotesTabProps {
  video: Video;
  currentTime?: number;
  onSeek?: (seconds: number) => void;
}

export const StudentVideoNotesTab: React.FC<StudentVideoNotesTabProps> = ({
  video,
  currentTime = 0,
  onSeek
}) => {
  const student = getCurrentStudent();
  const userEmail = student?.email;

  const [notes, setNotes] = useState<string>(() => getLocalVideoNotes(video.id, userEmail));
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncedToR2, setIsSyncedToR2] = useState<boolean>(true);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimerRef = useRef<any>(null);
  const notesRef = useRef<string>(notes);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Load from R2 / cache on video change
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

  // Listen for sync events from Floating Overlay
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

  // Periodic Auto-Sync to Cloudflare R2 every 1 minute (60,000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      if (notesRef.current && notesRef.current.trim()) {
        saveVideoNotes(video.id, notesRef.current, userEmail).then((res) => {
          if (res.syncedToR2) {
            setIsSyncedToR2(true);
            setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [video.id, userEmail]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    setIsSyncedToR2(false);

    // Save immediately to local storage
    try {
      localStorage.setItem(`sdetube_video_notes_${video.id}`, val);
    } catch {}

    // Debounced save to R2
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      const res = await saveVideoNotes(video.id, val, userEmail);
      setIsSaving(false);
      if (res.syncedToR2) {
        setIsSyncedToR2(true);
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }, 1500);
  };

  const handleManualSync = async () => {
    setIsSaving(true);
    const res = await saveVideoNotes(video.id, notes, userEmail);
    setIsSaving(false);
    if (res.syncedToR2) {
      setIsSyncedToR2(true);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const formatTimestamp = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const insertTimestamp = () => {
    const timeStr = `[${formatTimestamp(currentTime)}] `;
    insertTextAtCursor(timeStr);
  };

  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = notes;
    const updated = current.substring(0, start) + textToInsert + current.substring(end);
    setNotes(updated);
    setIsSyncedToR2(false);

    saveVideoNotes(video.id, updated, userEmail);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    }, 50);
  };

  const handleFormat = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = notes.substring(start, end) || 'text';
    const formatted = `${prefix}${selected}${suffix}`;
    const updated = notes.substring(0, start) + formatted + notes.substring(end);
    setNotes(updated);
    setIsSyncedToR2(false);
    saveVideoNotes(video.id, updated, userEmail);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = start + prefix.length + selected.length;
    }, 50);
  };

  const handleClearNotes = async () => {
    setNotes('');
    setShowClearConfirm(false);
    await saveVideoNotes(video.id, '', userEmail);
    setIsSyncedToR2(true);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs text-slate-200 space-y-3.5 shadow-xl animate-fadeIn">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <FileEdit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <span>Personal Study Notes</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono">
                Auto-saved
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Synced to Cloudflare R2 every 1 minute & cached locally for offline recall.
            </p>
          </div>
        </div>

        {/* Sync Status Badge & Action Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono">
            {isSaving ? (
              <>
                <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="text-amber-300">Syncing R2...</span>
              </>
            ) : isSyncedToR2 ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">R2 Synced ({lastSavedTime})</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300">Local Cache</span>
              </>
            )}
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSaving}
            className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-900/30 transition-all cursor-pointer disabled:opacity-50"
            title="Force sync now to Cloudflare R2"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync Now</span>
          </button>

          <button
            onClick={() => downloadVideoNotesAsTxt(video.title, notes)}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Download Notes as .txt"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-950/60 border border-slate-800 text-slate-400 hover:text-red-300 transition-all cursor-pointer"
            title="Clear Notes"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-between gap-3 text-red-200">
          <div className="flex items-center space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>Are you sure you want to clear all notes for this lecture?</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleClearNotes}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
            >
              Yes, Clear
            </button>
          </div>
        </div>
      )}

      {/* Formatting & Fast Action Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800/80">
        <button
          onClick={insertTimestamp}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 font-bold text-xs cursor-pointer transition-all"
          title={`Insert current video timestamp: ${formatTimestamp(currentTime)}`}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Insert @ {formatTimestamp(currentTime)}</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <button
          onClick={() => handleFormat('**', '**')}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          title="Bold (**text**)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleFormat('### ')}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          title="Heading (### )"
        >
          <Heading className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleFormat('- ')}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          title="Bullet Point (- )"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleFormat('```\n', '\n```')}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          title="Code Block"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Notes Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={handleNotesChange}
          placeholder="✍️ Type your personal insights, key algorithms, edge cases, formulas, or question timestamps here...&#10;&#10;Examples:&#10;• [04:15] Time Complexity proof using master theorem&#10;• [12:30] Corner case: when input array contains negative duplicates&#10;• Key insight: use two-pointer technique to achieve O(1) auxiliary space"
          className="w-full h-72 p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-sans focus:outline-none focus:border-amber-500 placeholder-slate-500 leading-relaxed resize-y custom-scrollbar"
        />

        <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-mono pointer-events-none">
          {notes.length} chars • {notes.split(/\s+/).filter(Boolean).length} words
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Tip: Hover over the video to open the draggable Notes Overlay even in fullscreen!</span>
        </span>
        <span className="font-mono text-slate-500">Auto-sync interval: 1 Min</span>
      </div>

    </div>
  );
};
