import React from 'react';
import { FileText, Download, FileArchive, FileCode, Paperclip } from 'lucide-react';
import { Attachment } from '../lib/types';
import { getDownloadUrl } from '../lib/telegram';

interface ResourceCardProps {
  attachments: Attachment[];
  channelId?: string;    // Frontend channel ID (e.g., 'ch-dsa-01')
  messageId?: number;    // Telegram message ID for the parent video
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ attachments, channelId, messageId }) => {
  if (!attachments || attachments.length === 0) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-400" />;
      case 'zip':
      case 'rar':
        return <FileArchive className="w-5 h-5 text-amber-400" />;
      case 'sql':
      case 'code':
        return <FileCode className="w-5 h-5 text-emerald-400" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-400" />;
      default:
        return <Paperclip className="w-5 h-5 text-purple-400" />;
    }
  };

  const getBadgeColor = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return 'bg-red-950/80 border-red-800 text-red-300';
      case 'zip':
      case 'rar':
        return 'bg-amber-950/80 border-amber-800 text-amber-300';
      case 'sql':
        return 'bg-emerald-950/80 border-emerald-800 text-emerald-300';
      case 'docx':
        return 'bg-blue-950/80 border-blue-800 text-blue-300';
      default:
        return 'bg-purple-950/80 border-purple-800 text-purple-300';
    }
  };

  /**
   * Builds the real download URL via the HF Telethon backend.
   * If channelId and messageId are provided, constructs a proper URL.
   * Falls back to the attachment's original download_url field otherwise.
   */
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const resolveDownloadUrl = (att: Attachment): string => {
    if (channelId && messageId) {
      return getDownloadUrl(channelId, messageId, att.file_name);
    }
    return att.download_url || '#';
  };

  const handleDownload = async (e: React.MouseEvent, att: Attachment) => {
    e.preventDefault();
    const url = resolveDownloadUrl(att);
    if (!url || url === '#') return;

    setDownloadingId(att.id);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = att.file_name || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: direct anchor trigger without page redirection
      const a = document.createElement('a');
      a.href = url;
      a.download = att.file_name || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-2">
          <Paperclip className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100">TiliTube Study Attachments & Notes</h3>
        </div>
        <span className="text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          {attachments.length} Resources
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3 truncate mr-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0">
                {getFileIcon(att.file_type)}
              </div>
              <div className="truncate">
                <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                  {att.file_name}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{att.caption || 'Attached lecture document'}</p>
                <div className="flex items-center space-x-2 mt-1.5">
                  <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${getBadgeColor(att.file_type)}`}>
                    .{att.file_type}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {formatFileSize(att.file_size_bytes)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => handleDownload(e, att)}
              disabled={downloadingId === att.id}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all shadow-sm flex-shrink-0"
              title="Download to computer directly"
            >
              <Download className={`w-3.5 h-3.5 ${downloadingId === att.id ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{downloadingId === att.id ? 'Saving...' : 'Download'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
