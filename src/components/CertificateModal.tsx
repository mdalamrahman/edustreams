import React, { useRef } from 'react';
import {
  X,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  Award,
  ShieldCheck,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export interface CertificateData {
  id: string;
  studentName: string;
  trackTitle: string;
  trackCategory: string;
  completionPercentage: number;
  issueDate: string;
  verificationCode: string;
  totalProblemsSolved: number;
  grade: 'Distinction' | 'Honors' | 'Merit';
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateData | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificate
}) => {
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareLinkedIn = () => {
    const text = encodeURIComponent(
      `🎉 Excited to share that I have earned the Official Certificate of Mastery in "${certificate.trackTitle}" from SDETube! Verified ID: ${certificate.verificationCode}. Check out my software engineering portfolio!`
    );
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://sdetube.vercel.app')}&summary=${text}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header Toolbar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Official SDETube Certificate of Mastery</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[10px] font-mono font-bold">
                  VERIFIED
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">Verification Code: {certificate.verificationCode}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={handleShareLinkedIn}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-900/30"
              title="Share to LinkedIn"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share to LinkedIn</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex items-center justify-center bg-slate-950/60 custom-scrollbar">
          <div
            ref={certRef}
            className="relative w-full max-w-3xl aspect-[1.414/1] bg-gradient-to-br from-[#0c1322] via-[#090d16] to-[#05070d] text-slate-100 rounded-3xl border-4 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.15)] p-6 sm:p-12 flex flex-col justify-between overflow-hidden print:m-0 print:border-none print:shadow-none"
          >
            {/* Background Luxury Guilloché Geometry */}
            <div className="absolute inset-2 border border-amber-500/30 rounded-2xl pointer-events-none" />
            <div className="absolute inset-4 border-2 border-dashed border-amber-500/20 rounded-xl pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            {/* Corner Decorative Ornaments */}
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-amber-400/80" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-amber-400/80" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-amber-400/80" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-amber-400/80" />

            {/* Certificate Header */}
            <div className="text-center relative z-10 space-y-1">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-sm font-black tracking-[0.25em] text-amber-400 uppercase font-mono">
                  SDETUBE VERIFIED CREDENTIAL
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 uppercase drop-shadow-sm">
                Certificate of Mastery
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-sans tracking-wide">
                This document certifies that the named candidate has demonstrated algorithmic and architectural excellence
              </p>
            </div>

            {/* Candidate & Achievement Body */}
            <div className="text-center relative z-10 my-4 space-y-3">
              <p className="text-xs text-amber-300/80 font-mono uppercase tracking-widest">Proudly Presented To</p>
              
              <div className="inline-block relative">
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide border-b-2 border-amber-400/40 pb-1 px-8">
                  {certificate.studentName}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                For successfully fulfilling the rigorous technical curriculum, video lectures, and live code executions for:
              </p>

              <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 max-w-lg mx-auto shadow-inner">
                <h3 className="text-sm sm:text-base font-bold text-amber-300 tracking-wide font-mono">
                  {certificate.trackTitle}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Completed with <strong className="text-emerald-400">{certificate.completionPercentage}% Mastery</strong> ({certificate.totalProblemsSolved} problems solved & validated)
                </p>
              </div>
            </div>

            {/* Certificate Footer & Signatures */}
            <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-wrap items-end justify-between gap-4">
              {/* Left: Issue Date & Verification */}
              <div className="space-y-1 text-left">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Date of Issue</p>
                <p className="text-xs font-bold text-slate-200 font-mono">{certificate.issueDate}</p>
                <p className="text-[9px] text-amber-400/80 font-mono tracking-tight">ID: {certificate.verificationCode}</p>
              </div>

              {/* Center: Official Holographic Gold Seal */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 p-0.5 shadow-xl shadow-amber-500/20 flex items-center justify-center animate-pulse">
                  <div className="w-full h-full rounded-full bg-slate-950 border border-amber-300/60 flex flex-col items-center justify-center text-center p-1">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-[7px] font-black text-amber-300 font-mono uppercase tracking-tighter mt-0.5">
                      SEAL OF EXCELLENCE
                    </span>
                    <span className="text-[6px] text-slate-400 font-mono">SDETUBE</span>
                  </div>
                </div>
              </div>

              {/* Right: Signature of Chief Curriculum Architect */}
              <div className="space-y-1 text-right">
                <div className="font-serif italic text-base sm:text-lg text-amber-300 font-bold tracking-wider">
                  Md Alam Rahman
                </div>
                <div className="w-36 h-0.5 bg-slate-700 ml-auto" />
                <p className="text-[10px] text-slate-400 font-bold">Chief Systems Architect</p>
                <p className="text-[9px] text-slate-500 font-mono">SDETube Engineering Council</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
