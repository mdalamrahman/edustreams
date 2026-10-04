import React, { useState, useCallback, useEffect } from 'react';
import {
  Upload,
  FileText,
  Brain,
  Target,
  TrendingUp,
  BarChart3,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Check,
  Zap,
  Briefcase,
  Layers,
  Award,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Coins
} from 'lucide-react';
import {
  ResumeAnalysisResult,
  SAMPLE_RESUMES,
  SAMPLE_JOB_DESCRIPTIONS,
  extractResumeTextFromFile,
  analyzeResumeWithMistral
} from '../lib/resumeAnalyzerService';
import {
  canAffordAction,
  deductCredits,
  getUserWallet,
  PRICING_CONFIG
} from '../lib/billing';
import { AnalysisDashboardView } from './resume/AnalysisDashboardView';
import { FlashCardsView } from './resume/FlashCardsView';
import { AtsDeepDiveView } from './resume/AtsDeepDiveView';
import { CareerRoadmapView } from './resume/CareerRoadmapView';
import { ResumePreviewView } from './resume/ResumePreviewView';
import { AtsResumeCreatorView } from './resume/AtsResumeCreatorView';

type AnalystTab = 'dashboard' | 'creator' | 'flashcards' | 'ats_deep_dive' | 'career_roadmap' | 'preview';

export const ResumeAnalyst: React.FC = () => {
  const [mainMode, setMainMode] = useState<'analyst' | 'creator'>('analyst');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzingStep, setAnalyzingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(() => getUserWallet().balance);
  const [analysisData, setAnalysisData] = useState<ResumeAnalysisResult | null>(() => {
    try {
      const saved = localStorage.getItem('edustream_last_resume_analysis');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [activeSubTab, setActiveSubTab] = useState<AnalystTab>('dashboard');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    const syncWallet = () => {
      try {
        setWalletBalance(getUserWallet().balance);
      } catch {}
    };
    syncWallet();
    window.addEventListener('edustream_wallet_updated', syncWallet);
    return () => window.removeEventListener('edustream_wallet_updated', syncWallet);
  }, []);

  // File selection
  const handleFileSelect = useCallback(async (file: File) => {
    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.pdf') && !ext.endsWith('.txt') && !ext.endsWith('.md')) {
      setError('Please select a PDF or plain text (.txt, .md) file.');
      return;
    }
    setError(null);
    setSelectedFile(file);
    try {
      const text = await extractResumeTextFromFile(file);
      setResumeText(text);
    } catch (err: any) {
      console.warn('Text extraction warning:', err);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Preload Sample Demo Resume & Job Description
  const handleLoadSample = (sampleResumeId: string, sampleJdId: string) => {
    const r = SAMPLE_RESUMES.find(s => s.id === sampleResumeId) || SAMPLE_RESUMES[0];
    const j = SAMPLE_JOB_DESCRIPTIONS.find(s => s.id === sampleJdId) || SAMPLE_JOB_DESCRIPTIONS[0];
    setResumeText(r.preview);
    setJobDescription(j.text);
    setSelectedFile(null);
    setInputMode('paste');
    setError(null);
  };

  // Main Analyze Trigger
  const handleAnalyze = async () => {
    let textToAnalyze = resumeText.trim();

    if (!textToAnalyze && selectedFile) {
      try {
        textToAnalyze = await extractResumeTextFromFile(selectedFile);
        setResumeText(textToAnalyze);
      } catch (err) {
        setError('Could not extract text from file. Please paste text directly.');
        return;
      }
    }

    if (!textToAnalyze) {
      setError('Please upload a resume or paste your resume text.');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please provide the target job description.');
      return;
    }

    const cost = PRICING_CONFIG.AI_RESUME_ANALYSIS || 1.50;
    if (!canAffordAction(cost)) {
      setError(`Insufficient credits. Full SDETube AI Resume Scan + 18 3D Flashcards requires ₹${cost.toFixed(2)}. Please top up your wallet.`);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalyzingStep(1);

    // Deduct usage fee
    deductCredits(
      cost,
      'AI_RESUME_ANALYSIS',
      'SDETube AI Resume Analysis + 3D Interview Flashcards'
    );
    try {
      setWalletBalance(getUserWallet().balance);
    } catch {}

    // Animate progress steps
    const stepInterval = setInterval(() => {
      setAnalyzingStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 1800);

    try {
      // Execute SDETube AI Analysis
      const result = await analyzeResumeWithMistral(textToAnalyze, jobDescription.trim());
      setAnalysisData(result);
      setActiveSubTab('dashboard');
    } catch (err: any) {
      console.error('Resume Analysis Error:', err);
      setError(err?.message || 'Failed to analyze resume. Please verify AI API configuration and try again.');
    } finally {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setAnalyzingStep(0);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setSelectedFile(null);
    setResumeText('');
    setJobDescription('');
    setError(null);
    setActiveSubTab('dashboard');
  };

  const subTabs = [
    { id: 'dashboard' as const, label: 'Analysis Dashboard', icon: BarChart3 },
    { id: 'creator' as const, label: 'AI ATS Resume Creator', icon: Sparkles, badge: 'AI Builder' },
    { id: 'flashcards' as const, label: 'Interview Flashcards (3D)', icon: Brain, badge: `${analysisData?.flashcards?.length || 15} Qs` },
    { id: 'ats_deep_dive' as const, label: 'ATS Deep Dive', icon: TrendingUp },
    { id: 'career_roadmap' as const, label: 'Career Progression', icon: Target },
    { id: 'preview' as const, label: 'Resume & JD Preview', icon: FileText }
  ];

  return (
    <div className="space-y-8 max-w-[98%] xl:max-w-7xl mx-auto px-2 sm:px-4 py-6">
      
      {/* ========================================================================= */}
      {/* 0. TOP MODE SELECTOR (SCANNER vs AI RESUME CREATOR)                       */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-center">
        <div className="p-1 rounded-2xl bg-slate-900/95 border border-slate-800 flex items-center shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMainMode('analyst')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mainMode === 'analyst'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Resume Scanner & Match Insights</span>
          </button>
          <button
            type="button"
            onClick={() => setMainMode('creator')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mainMode === 'creator'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI ATS Resume Creator</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-purple-900/80 text-purple-200 text-[10px] font-mono">
              Live Paper Preview
            </span>
          </button>
        </div>
      </div>

      {mainMode === 'creator' ? (
        <AtsResumeCreatorView
          analysisContext={analysisData}
        />
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. TOP HERO SECTION                                                       */}
          {/* ========================================================================= */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>SDETube AI Intelligence</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-mono">
                ATS Compatibility &bull; 3D Flashcards
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 tracking-tight">
              Resume Analyst & ATS Match Engine
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Scan your resume against any target Job Description with SDETube AI. Get instant ATS scoring, keyword alignment, career progression gap analysis, and 15–20 tailored 3D interview preparation flashcards.
            </p>
          </div>

          {/* Right Action: Wallet Balance + Reset Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-amber-300 flex items-center gap-2 shadow-inner">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Credits: ₹{walletBalance.toFixed(2)}</span>
            </div>
            {analysisData && (
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-purple-400" />
                <span>Analyze New Resume</span>
              </button>
            )}
          </div>
        </div>

        {/* Feature Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>ATS Pass Scoring</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Brain className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>15-20 3D Flashcards</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>Skills & Keyword Gap</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Target className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Google XYZ Rewrites</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE: UPLOAD STATE vs ANALYSIS RESULTS                       */}
      {/* ========================================================================= */}
      {!analysisData ? (
        
        /* ---------------- UPLOAD & INPUT FORM ---------------- */
        <div className="space-y-6">
          
          {/* Quick 1-Click Preset Demos */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>1-Click Fast Demo Presets:</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Load authentic sample resumes & job descriptions instantly
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleLoadSample('sde2-fullstack', 'google-sde2')}
                className="p-3.5 rounded-2xl bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/60 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                    Google SDE-II (Full Stack)
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[11px] text-slate-400">3.5 Yrs Exp &bull; React, Node.js, Go, Kafka</p>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('backend-systems', 'amazon-backend')}
                className="p-3.5 rounded-2xl bg-slate-950 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/60 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300">
                    Amazon Backend (AWS / Java)
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[11px] text-slate-400">4 Yrs Exp &bull; Java, Distributed Systems, Cassandra</p>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('sde2-fullstack', 'meta-fullstack')}
                className="p-3.5 rounded-2xl bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/60 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                    Meta Full Stack (React / TS)
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[11px] text-slate-400">Web Performance &bull; TypeScript, GraphQL, Next.js</p>
              </button>
            </div>
          </div>

          {/* Direct CTA to ATS Resume Creator */}
          <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>Looking to craft an ATS-compliant resume from scratch with AI bullet rewriting & live PDF preview?</span>
            </div>
            <button
              type="button"
              onClick={() => setMainMode('creator')}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-md shadow-purple-600/20"
            >
              <span>Open ATS Resume Creator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form Grid: Left Resume Upload/Paste, Right Job Description */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: RESUME INPUT */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>Candidate Resume</span>
                  </label>

                  {/* Toggle Mode */}
                  <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setInputMode('upload')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        inputMode === 'upload'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('paste')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        inputMode === 'paste'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Paste Text
                    </button>
                  </div>
                </div>

                {inputMode === 'upload' ? (
                  /* Drag & Drop Zone */
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[260px] ${
                      isDragging
                        ? 'border-purple-400 bg-purple-950/30'
                        : selectedFile
                        ? 'border-emerald-500/60 bg-emerald-950/20'
                        : 'border-slate-700 hover:border-purple-500/60 bg-slate-950/40 hover:bg-slate-950/80'
                    }`}
                  >
                    <input
                      type="file"
                      id="resume-file-input"
                      accept=".pdf,.txt,.md"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="resume-file-input" className="cursor-pointer w-full flex flex-col items-center">
                      <div className={`p-4 rounded-2xl mb-3 transition-transform ${
                        selectedFile ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {selectedFile ? <FileCheck className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                      </div>

                      {selectedFile ? (
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-emerald-300 font-mono">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click or drop another file to change
                          </p>
                          {resumeText && (
                            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-[10px] font-mono text-emerald-300">
                              ✓ Text Extracted ({resumeText.length} chars)
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-200">
                            Drag & drop your resume here
                          </p>
                          <p className="text-xs text-slate-400">
                            Supports PDF (.pdf) and Plain Text (.txt, .md)
                          </p>
                          <span className="inline-block mt-3 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-purple-400">
                            Browse Files
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                ) : (
                  /* Plain Textarea */
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your raw resume text here (Summary, Skills, Work Experience, Education, Projects)..."
                    className="w-full h-64 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono leading-relaxed resize-none shadow-inner"
                  />
                )}
              </div>

              {resumeText && (
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Resume parsed: {resumeText.length} chars</span>
                  <button
                    onClick={() => { setResumeText(''); setSelectedFile(null); }}
                    className="text-slate-500 hover:text-rose-400 underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: JOB DESCRIPTION INPUT */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    <span>Target Job Description (JD)</span>
                  </label>

                  <div className="flex items-center gap-1">
                    {SAMPLE_JOB_DESCRIPTIONS.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setJobDescription(s.text)}
                        className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 text-[10px] font-mono text-slate-400 hover:text-indigo-300 transition-all cursor-pointer"
                      >
                        {s.id.split('-')[0].toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description you're applying for (Job Title, Responsibilities, Minimum & Preferred Qualifications)..."
                  className="w-full h-64 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-none shadow-inner"
                />
              </div>

              {jobDescription && (
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>JD length: {jobDescription.length} chars</span>
                  <button
                    onClick={() => setJobDescription('')}
                    className="text-slate-500 hover:text-rose-400 underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Analyze CTA Button */}
          <div className="text-center pt-2">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 mx-auto min-w-[280px]"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Analyzing with SDETube AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Analyze Resume with SDETube AI</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-200 text-xs font-mono border border-purple-400/40">
                    ₹{PRICING_CONFIG.AI_RESUME_ANALYSIS?.toFixed(2) || '1.50'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Animated Progress Steps when Analyzing */}
          {isAnalyzing && (
            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-slate-900/90 shadow-2xl max-w-xl mx-auto space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping"></span>
                  <span>Executing SDETube AI Multi-Pass Pipeline</span>
                </span>
                <span className="text-purple-400">Step {analyzingStep || 1} of 4</span>
              </div>

              <div className="space-y-2">
                {[
                  { step: 1, label: 'Extracting candidate text & structural tokens' },
                  { step: 2, label: 'Querying SDETube AI for ATS scoring & keyword alignment' },
                  { step: 3, label: 'Running career progression & gap analysis' },
                  { step: 4, label: 'Generating 15-20 customized 3D interview flashcards' }
                ].map(item => (
                  <div key={item.step} className="flex items-center gap-3 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      analyzingStep > item.step
                        ? 'bg-emerald-600 text-white'
                        : analyzingStep === item.step
                        ? 'bg-purple-600 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {analyzingStep > item.step ? '✓' : item.step}
                    </div>
                    <span className={analyzingStep >= item.step ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      ) : (

        /* ---------------- ANALYSIS RESULTS TABS & VIEWS ---------------- */
        <div className="space-y-6 animate-fadeIn">
          
          {/* Sub-Tabs Navigation Bar */}
          <div className="glass-panel p-2 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl flex flex-wrap items-center justify-between gap-2">
            
            <div className="flex flex-wrap items-center gap-1">
              {subTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeSubTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${
                        isActive ? 'bg-purple-900 text-purple-200' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* AI Engine Status Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-purple-300">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{analysisData.ai_engine || 'SDETube AI Engine'}</span>
            </div>

          </div>

          {/* Render Active View */}
          <div>
            {activeSubTab === 'dashboard' && (
              <AnalysisDashboardView
                data={analysisData}
                onNavigateToFlashcards={() => setActiveSubTab('flashcards')}
                onNavigateToCreator={() => setActiveSubTab('creator')}
              />
            )}

            {activeSubTab === 'creator' && (
              <AtsResumeCreatorView
                analysisContext={analysisData}
              />
            )}

            {activeSubTab === 'flashcards' && (
              <FlashCardsView
                flashcards={analysisData.flashcards}
              />
            )}

            {activeSubTab === 'ats_deep_dive' && (
              <AtsDeepDiveView
                data={analysisData}
              />
            )}

            {activeSubTab === 'career_roadmap' && (
              <CareerRoadmapView
                data={analysisData}
              />
            )}

            {activeSubTab === 'preview' && (
              <ResumePreviewView
                data={analysisData}
              />
            )}
          </div>

        </div>

      )}
        </>
      )}

    </div>
  );
};
