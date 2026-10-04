import React, { useState } from 'react';
import {
  FileText,
  Briefcase,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { ResumeAnalysisResult } from '../../lib/resumeAnalyzerService';

interface ResumePreviewViewProps {
  data: ResumeAnalysisResult;
}

export const ResumePreviewView: React.FC<ResumePreviewViewProps> = ({ data }) => {
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedJd, setCopiedJd] = useState(false);

  const handleCopyResume = () => {
    navigator.clipboard.writeText(data.resume_preview || '');
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  const handleCopyJd = () => {
    navigator.clipboard.writeText(data.job_description_preview || '');
    setCopiedJd(true);
    setTimeout(() => setCopiedJd(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Parsed Resume Column */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-slate-100">Parsed Resume Content</h3>
            </div>
            <button
              onClick={handleCopyResume}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold font-mono transition-all cursor-pointer"
            >
              {copiedResume ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedResume ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-line max-h-[500px] overflow-y-auto">
            {data.resume_preview || 'No resume text available.'}
          </div>

          <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
            {data.resume_preview?.length || 0} characters &bull; Text extracted for SDETube AI ATS Engine
          </div>
        </div>

        {/* Target Job Description Column */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100">Target Job Description</h3>
            </div>
            <button
              onClick={handleCopyJd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold font-mono transition-all cursor-pointer"
            >
              {copiedJd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedJd ? 'Copied!' : 'Copy JD'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-line max-h-[500px] overflow-y-auto">
            {data.job_description_preview || 'No job description text provided.'}
          </div>

          <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
            {data.job_description_preview?.length || 0} characters &bull; Target criteria comparison benchmark
          </div>
        </div>

      </div>
    </div>
  );
};
