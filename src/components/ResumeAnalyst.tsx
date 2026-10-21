// src/components/ResumeAnalyst.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Coins,
  RefreshCw,
  ExternalLink,
  Globe,
  Github,
  BookOpen,
  Cpu,
  Database,
  Flame,
  Clock,
  Play,
  Sliders,
  DollarSign,
  Building2,
  HelpCircle
} from 'lucide-react';
import {
  UnifiedResumeAnalysisResponse,
  runUnifiedResumeAnalysis,
  SAMPLE_RESUMES,
  SAMPLE_JOB_DESCRIPTIONS,
  extractResumeTextFromFile,
  LiveJobMatch,
  SkillRoiRecommendation,
  RoleTransitionPath,
  ResumeAnalysisResult
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

export type UnifiedStudioTab =
  | 'dashboard'
  | 'ats_scanner'
  | 'jobs'
  | 'roadmap'
  | 'transitions'
  | 'creator';

export const ResumeAnalyst: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL Tab Sync
  const initialTab = useMemo<UnifiedStudioTab>(() => {
    const t = searchParams.get('tab') || searchParams.get('mode');
    if (t === 'jobs' || t === 'compensation') return 'jobs';
    if (t === 'ats_scanner' || t === 'scanner' || t === 'ats') return 'ats_scanner';
    if (t === 'roadmap' || t === 'skills') return 'roadmap';
    if (t === 'transitions' || t === 'flashcards') return 'transitions';
    if (t === 'creator') return 'creator';
    return 'dashboard';
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<UnifiedStudioTab>(initialTab);
  const [includeSdeTubeData, setIncludeSdeTubeData] = useState<boolean>(true);
  const [simulatedSkills, setSimulatedSkills] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>(SAMPLE_RESUMES[0].preview);
  const [targetRole, setTargetRole] = useState<string>('Software Engineer');
  const [targetJobForScan, setTargetJobForScan] = useState<LiveJobMatch | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [analyzingStep, setAnalyzingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loadLatencyMs, setLoadLatencyMs] = useState<number>(42);
  const [walletBalance, setWalletBalance] = useState<number>(() => getUserWallet().balance);
  const [unifiedData, setUnifiedData] = useState<UnifiedResumeAnalysisResponse | null>(null);

  // Sync wallet
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

  // Update tab in URL when changed
  const handleTabChange = (tab: UnifiedStudioTab) => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    }, { replace: true });
  };

  // Initial Load / Run Analysis
  const executeAnalysis = useCallback(async (
    textToAnalyze: string,
    withSdeTube: boolean,
    force: boolean = false
  ) => {
    const startTime = performance.now();
    try {
      if (force) setIsRefreshing(true);
      else setIsAnalyzing(true);
      setError(null);

      const result = await runUnifiedResumeAnalysis({
        resumeText: textToAnalyze,
        includeSdeTubeData: withSdeTube,
        targetRole,
        targetJobDescription: targetJobForScan?.rawDescription,
        targetJobId: targetJobForScan?.id,
        forceRefresh: force
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLoadLatencyMs(elapsed);
      setUnifiedData(result);
    } catch (err: any) {
      console.error('Resume Analysis Error:', err);
      setError(err?.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setIsRefreshing(false);
      setAnalyzingStep(0);
    }
  }, [targetRole, targetJobForScan]);

  // Initial auto-run on mount
  useEffect(() => {
    executeAnalysis(resumeText, includeSdeTubeData, false);
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
      executeAnalysis(text, includeSdeTubeData, false);
    } catch (err: any) {
      console.warn('Text extraction warning:', err);
      setError('Could not extract text from file. Please paste text directly.');
    }
  }, [includeSdeTubeData, executeAnalysis]);

  // Toggle SDETube Verified Telemetry
  const handleToggleSdeTubeData = async (checked: boolean) => {
    setIncludeSdeTubeData(checked);
    await executeAnalysis(resumeText, checked, false);
  };

  // Toggle Simulated "What-If" Skill
  const handleToggleSimulatedSkill = (skillName: string) => {
    setSimulatedSkills(prev =>
      prev.includes(skillName) ? prev.filter(s => s !== skillName) : [...prev, skillName]
    );
  };

  // Calculate Marginal Boost from Simulated Skills
  const simulatedBoost = useMemo(() => {
    if (!unifiedData || simulatedSkills.length === 0) return 0;
    return simulatedSkills.reduce((sum, skillName) => {
      const rec = unifiedData.skillRoiRecommendations.find(r => r.skillName === skillName);
      return sum + (rec ? rec.marketValueDeltaLPA : 2.5);
    }, 0);
  }, [unifiedData, simulatedSkills]);

  // Total Projected Market Value (Base + SDETube + Simulated)
  const currentTotalLpa = useMemo(() => {
    if (!unifiedData) return 21.5;
    return Number((unifiedData.marketValuation.totalEstimatedValueLPA + simulatedBoost).toFixed(1));
  }, [unifiedData, simulatedBoost]);

  // Preload Sample Resume
  const handleLoadSample = (sampleId: string) => {
    const r = SAMPLE_RESUMES.find(s => s.id === sampleId) || SAMPLE_RESUMES[0];
    setResumeText(r.preview);
    setSelectedFile(null);
    executeAnalysis(r.preview, includeSdeTubeData, false);
  };

  // 1-Click "Scan Resume Against This Job" from Jobs Tab
  const handleScanAgainstJob = (job: LiveJobMatch) => {
    setTargetJobForScan(job);
    setActiveTab('ats_scanner');
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'ats_scanner');
      return next;
    }, { replace: true });
    executeAnalysis(resumeText, includeSdeTubeData, false);
  };

  // Studio Sub-Tabs Config
  const studioTabs = [
    {
      id: 'dashboard' as const,
      label: 'Market Valuation & ROI',
      icon: BarChart3,
      badge: `₹${currentTotalLpa} LPA`
    },
    {
      id: 'ats_scanner' as const,
      label: 'Deep ATS Scanner & Tailor',
      icon: FileCheck,
      badge: unifiedData ? `${unifiedData.atsAudit.overallScore}% ATS` : 'Audit'
    },
    {
      id: 'jobs' as const,
      label: 'Live FreeHire Jobs',
      icon: Briefcase,
      badge: unifiedData ? `${unifiedData.liveJobs.length} Live` : 'Jobs'
    },
    {
      id: 'roadmap' as const,
      label: 'Skill Growth Hub (3 Pillars)',
      icon: Layers,
      badge: 'SDETube + GitHub + Web'
    },
    {
      id: 'transitions' as const,
      label: 'Role Transitions & 3D Cards',
      icon: Target,
      badge: `${unifiedData?.roleTransitions.length || 2} Roles`
    },
    {
      id: 'creator' as const,
      label: 'AI Resume Creator',
      icon: Sparkles,
      badge: 'Live Paper'
    }
  ];

  return (
    <div className="space-y-6 max-w-[98%] xl:max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">

      {/* ========================================================================= */}
      {/* 1. PERSISTENT TOP VALUATION, CONTROL & TELEMETRY BAR                       */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090d16]/95 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Left: Active Resume Badge & File Switcher */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 font-mono text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span>AI CAREER VALUATION &bull; ATS STUDIO</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#111622] border border-white/[0.08] text-[10px] font-mono text-stitch-dim">
                REDIS PERSISTENCE &bull; FREEHIRE ATS SYNC
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0f1422] border border-white/[0.08] text-xs font-mono">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white truncate max-w-[160px] sm:max-w-[220px]">
                  {selectedFile ? selectedFile.name : 'Sample Resume (SDE-2 Full Stack)'}
                </span>
                <span className="text-[10px] text-stitch-dim">
                  ({unifiedData?.parsedCandidate.extractedYoe || 2.5} YOE &bull; {unifiedData?.parsedCandidate.resumeSkills.length || 12} Skills)
                </span>
              </div>

              <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-stitch-surface hover:bg-stitch-card border border-white/[0.08] hover:border-cyan-400/40 text-xs font-mono text-stitch-dim hover:text-white transition flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload PDF</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </label>

              <button
                type="button"
                onClick={() => handleLoadSample('sde2-fullstack')}
                className="text-[11px] font-mono text-stitch-dim hover:text-cyan-300 underline underline-offset-4"
              >
                Reset Demo
              </button>
            </div>
          </div>

          {/* Center: Interactive SDETube Telemetry Toggle Checkbox */}
          <div className="flex-shrink-0">
            <label className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 cursor-pointer hover:border-indigo-400 transition select-none shadow-lg shadow-indigo-950/20">
              <input
                type="checkbox"
                checked={includeSdeTubeData}
                onChange={(e) => handleToggleSdeTubeData(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
              <div>
                <div className="text-xs font-semibold text-indigo-200 flex items-center gap-2">
                  <span>Include SDETube Verified Telemetry</span>
                  <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                    includeSdeTubeData
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {includeSdeTubeData
                      ? `+₹${unifiedData?.marketValuation.sdeTubeBoostLPA || 2.4} LPA Boost Active`
                      : 'Resume-Only Mode'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 hidden sm:block">
                  Merges DSA/SQL solutions, HLD/LLD sandboxes &amp; AI mock interview scores
                </div>
              </div>
            </label>
          </div>

          {/* Right: Live Market Value Counter & Redis Status */}
          <div className="flex items-center gap-4 flex-shrink-0 justify-between lg:justify-end">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase font-bold text-stitch-dim tracking-wider">
                Current Market Valuation
              </div>
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-400">
                  ₹{currentTotalLpa} LPA
                </span>
                {simulatedBoost > 0 && (
                  <span className="text-xs font-mono font-bold text-amber-300 animate-pulse">
                    (+₹{simulatedBoost.toFixed(1)}L What-If)
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono text-stitch-dim">
                Confidence: <span className="text-cyan-300 font-bold">{unifiedData?.marketValuation.confidenceScore || 85}%</span> &bull; Top {100 - (unifiedData?.marketValuation.marketPercentile || 82)}%
              </div>
            </div>

            {/* Redis Cache Pill & Refresh */}
            <div className="flex flex-col items-end gap-1.5 pl-3 border-l border-white/[0.08]">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0b101c] border border-cyan-500/20 text-[10px] font-mono text-cyan-300">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>Redis {unifiedData?.fromCache ? `⚡ (<${loadLatencyMs}ms)` : 'Fresh'}</span>
              </div>
              <button
                type="button"
                onClick={() => executeAnalysis(resumeText, includeSdeTubeData, true)}
                disabled={isRefreshing}
                className="text-[10px] font-mono text-stitch-dim hover:text-white flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                title="Force refresh analysis from scratch"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Force Refresh</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Target Job Scanned Notice */}
      {targetJobForScan && (
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs font-mono text-purple-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>Targeting live job: <strong>{targetJobForScan.title}</strong> at <strong>{targetJobForScan.company}</strong></span>
          </div>
          <button
            type="button"
            onClick={() => setTargetJobForScan(null)}
            className="text-[10px] text-purple-400 hover:text-white underline cursor-pointer"
          >
            Clear Target Job
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. UNIFIED 5-TAB STUDIO NAVIGATION                                       */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-center">
        <div className="p-1.5 rounded-2xl bg-[#090d16]/95 border border-white/[0.08] flex flex-wrap items-center justify-center gap-1.5 shadow-2xl backdrop-blur-xl">
          {studioTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'text-stitch-dim hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stitch-dim'}`} />
                <span>{tab.label}</span>
                <span className={`hidden sm:inline-block px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  isActive
                    ? 'bg-black/30 text-cyan-200 border border-white/20'
                    : 'bg-[#111622] text-stitch-dim border border-white/[0.08]'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. STUDIO TAB VIEWS                                                       */}
      {/* ========================================================================= */}
      {isAnalyzing ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-purple-500/20 border-b-purple-400 animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>
          <div className="text-center font-mono">
            <p className="text-sm font-bold text-white">Synthesizing Unified Career Valuation &amp; ATS Scorecards...</p>
            <p className="text-xs text-stitch-dim mt-1">Cross-referencing live FreeHire market demand with SDETube telemetry</p>
          </div>
        </div>
      ) : unifiedData ? (
        <div>

          {/* TAB 1: MARKET VALUATION & WHAT-IF SKILL SIMULATOR */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Top Multi-Factor Formula Breakdown Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <span>Multi-Factor Valuation Engine Breakdown</span>
                    </h2>
                    <p className="text-xs text-stitch-dim">
                      Deterministic + AI-Calibrated CTC Model with verified proof-of-work multipliers
                    </p>
                  </div>
                  <div className="text-xs font-mono text-stitch-dim">
                    Formula: <span className="text-cyan-300">Base CTC &times; M(skills) &times; M(impact) &times; M(ATS) + Boost</span>
                  </div>
                </div>

                {/* 5 Factors Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-[#070a12] border border-white/[0.08]">
                    <span className="text-[10px] font-mono text-stitch-dim uppercase font-bold">1. Role &amp; YOE Anchor</span>
                    <div className="text-base font-bold text-white font-mono mt-1">
                      ₹{unifiedData.marketValuation.factors.roleAndYoeBaseLPA} LPA
                    </div>
                    <div className="text-[10px] text-cyan-300 font-mono mt-0.5">
                      {unifiedData.marketValuation.factors.seniorityLevel} ({unifiedData.marketValuation.factors.detectedYoe} YOE)
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#070a12] border border-white/[0.08]">
                    <span className="text-[10px] font-mono text-stitch-dim uppercase font-bold">2. Skill Multiplier</span>
                    <div className="text-base font-bold text-emerald-300 font-mono mt-1">
                      {unifiedData.marketValuation.factors.skillDemandMultiplier}x
                    </div>
                    <div className="text-[10px] text-stitch-dim mt-0.5">
                      {unifiedData.parsedCandidate.resumeSkills.length} High-Demand Tech
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#070a12] border border-white/[0.08]">
                    <span className="text-[10px] font-mono text-stitch-dim uppercase font-bold">3. Impact Multiplier</span>
                    <div className="text-base font-bold text-cyan-300 font-mono mt-1">
                      {unifiedData.marketValuation.factors.impactQuantificationMultiplier}x
                    </div>
                    <div className="text-[10px] text-stitch-dim mt-0.5">
                      Google XYZ Metrics Density
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#070a12] border border-white/[0.08]">
                    <span className="text-[10px] font-mono text-stitch-dim uppercase font-bold">4. ATS Multiplier</span>
                    <div className="text-base font-bold text-purple-300 font-mono mt-1">
                      {unifiedData.marketValuation.factors.atsReadabilityMultiplier}x
                    </div>
                    <div className="text-[10px] text-stitch-dim mt-0.5">
                      {unifiedData.atsAudit.overallScore}% Machine Parse Score
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#070a12] border border-emerald-500/30 bg-emerald-950/10">
                    <span className="text-[10px] font-mono text-emerald-300 uppercase font-bold">5. SDETube Boost</span>
                    <div className="text-base font-bold text-emerald-400 font-mono mt-1">
                      {includeSdeTubeData ? `+₹${unifiedData.marketValuation.sdeTubeBoostLPA} LPA` : '₹0.0 LPA'}
                    </div>
                    <div className="text-[10px] text-emerald-300/80 font-mono mt-0.5">
                      {includeSdeTubeData ? `+${unifiedData.marketValuation.factors.sdeTubeVerifiedBonusPct}% Telemetry` : 'Disabled (Checkbox)'}
                    </div>
                  </div>
                </div>

                {/* 4 Market Tier Readiness Progress Bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#080c16] border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-amber-300">Tier-1 Product / FAANG</span>
                      <span className="text-stitch-dim">₹{unifiedData.marketValuation.tierBenchmarks.tier1ProductLPA.min}L–₹{unifiedData.marketValuation.tierBenchmarks.tier1ProductLPA.max}L</span>
                    </div>
                    <div className="w-full bg-[#111622] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${unifiedData.marketValuation.tierBenchmarks.tier1ProductLPA.readinessPct}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-mono text-stitch-dim flex justify-between">
                      <span>Readiness:</span>
                      <span className="text-white font-bold">{unifiedData.marketValuation.tierBenchmarks.tier1ProductLPA.readinessPct}%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#080c16] border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-purple-300">High-Growth Unicorn</span>
                      <span className="text-stitch-dim">₹{unifiedData.marketValuation.tierBenchmarks.tier2UnicornLPA.min}L–₹{unifiedData.marketValuation.tierBenchmarks.tier2UnicornLPA.max}L</span>
                    </div>
                    <div className="w-full bg-[#111622] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${unifiedData.marketValuation.tierBenchmarks.tier2UnicornLPA.readinessPct}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-mono text-stitch-dim flex justify-between">
                      <span>Readiness:</span>
                      <span className="text-white font-bold">{unifiedData.marketValuation.tierBenchmarks.tier2UnicornLPA.readinessPct}%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#080c16] border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-emerald-300">Global Remote (USD)</span>
                      <span className="text-stitch-dim">${(unifiedData.marketValuation.tierBenchmarks.globalRemoteUSD.min / 1000).toFixed(0)}k–${(unifiedData.marketValuation.tierBenchmarks.globalRemoteUSD.max / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="w-full bg-[#111622] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${unifiedData.marketValuation.tierBenchmarks.globalRemoteUSD.readinessPct}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-mono text-stitch-dim flex justify-between">
                      <span>Readiness:</span>
                      <span className="text-white font-bold">{unifiedData.marketValuation.tierBenchmarks.globalRemoteUSD.readinessPct}%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#080c16] border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-cyan-300">Enterprise / IT Services</span>
                      <span className="text-stitch-dim">₹{unifiedData.marketValuation.tierBenchmarks.enterpriseServiceLPA.min}L–₹{unifiedData.marketValuation.tierBenchmarks.enterpriseServiceLPA.max}L</span>
                    </div>
                    <div className="w-full bg-[#111622] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${unifiedData.marketValuation.tierBenchmarks.enterpriseServiceLPA.readinessPct}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-mono text-stitch-dim flex justify-between">
                      <span>Readiness:</span>
                      <span className="text-white font-bold">{unifiedData.marketValuation.tierBenchmarks.enterpriseServiceLPA.readinessPct}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive "What-If" Skill Value Simulator */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-6 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Interactive "What-If" Skill Arbitrage Simulator</span>
                    </h3>
                    <p className="text-xs text-stitch-dim">
                      Test adding high-ROI skills to see your real-time LPA jump and unlocked FreeHire job count
                    </p>
                  </div>
                  {simulatedSkills.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSimulatedSkills([])}
                      className="text-xs font-mono text-amber-400 hover:text-white underline cursor-pointer"
                    >
                      Clear {simulatedSkills.length} Simulated Skills
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {unifiedData.skillRoiRecommendations.slice(0, 6).map((rec) => {
                    const isChecked = simulatedSkills.includes(rec.skillName);
                    return (
                      <div
                        key={rec.skillName}
                        onClick={() => handleToggleSimulatedSkill(rec.skillName)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-950/20'
                            : 'bg-[#080c16] border-white/[0.08] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // handled by parent onClick
                              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                            />
                            <div>
                              <div className="text-sm font-bold text-white">{rec.skillName}</div>
                              <span className="text-[10px] font-mono text-stitch-dim">{rec.category}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                            +₹{rec.marketValueDeltaLPA} LPA
                          </span>
                        </div>

                        <p className="text-[11px] text-stitch-dim mt-2.5 line-clamp-2 leading-relaxed">
                          {rec.whyItMatters}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[11px] font-mono">
                          <span className="text-stitch-dim">ATS Boost: <strong className="text-cyan-300">+{rec.atsScoreDeltaPct}%</strong></span>
                          <span className="text-stitch-dim">Unlocks: <strong className="text-white">{rec.unlockedJobsCount} Jobs</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: UNIFIED DEEP ATS SCANNER & BULLET FIXER */}
          {activeTab === 'ats_scanner' && (
            <div className="space-y-6">
              
              {/* 6-Pillar Score Ring & Overview */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Deterministic 6-Pillar ATS Audit</span>
                    </span>
                    <span className="text-xs font-mono text-stitch-dim">100-Point Machine Scale</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    Overall ATS Pass Probability: {unifiedData.atsAudit.overallScore}%
                  </h2>
                  <p className="text-xs text-stitch-dim max-w-xl">
                    Evaluated against standard Greenhouse, Lever, and Workday parsing engines. Every detected blocker is ranked with evidence-gated fixes.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('creator')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold transition shadow-lg shadow-purple-950/40 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Open Live Paper ATS Creator</span>
                  </button>
                </div>
              </div>

              {/* 6 Category Sub-scores */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="p-4 rounded-xl bg-[#080c16] border border-white/[0.08] text-center">
                  <span className="text-[10px] font-mono text-stitch-dim uppercase font-bold">Parseability</span>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {unifiedData.atsAudit.subScores.parseabilityAndFormatting}/15
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Single-Column</span>
                </div>

                <div className="p-4 rounded-xl bg-[#080c16] border border-white/[0.08] text-center">
                  <span className="text-[10px] font-mono text-stitch-dim uppercase font-bold">Keywords</span>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {unifiedData.atsAudit.subScores.keywordAndSkillMatch}/30
                  </div>
                  <span className="text-[10px] text-cyan-300 font-mono">Core Stack</span>
                </div>

                <div className="p-4 rounded-xl bg-[#080c16] border border-white/[0.08] text-center">
                  <span className="text-[10px] font-mono text-stitch-dim uppercase font-bold">XYZ Metrics</span>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {unifiedData.atsAudit.subScores.impactAndQuantification}/25
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono">Numbers &amp; Scale</span>
                </div>

                <div className="p-4 rounded-xl bg-[#080c16] border border-white/[0.08] text-center">
                  <span className="text-[10px] font-mono text-stitch-dim uppercase font-bold">Action Verbs</span>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {unifiedData.atsAudit.subScores.actionVerbsAndTone}/10
                  </div>
                  <span className="text-[10px] text-stitch-dim font-mono">Active Voice</span>
                </div>

                <div className="p-4 rounded-xl bg-[#080c16] border border-white/[0.08] text-center">
                  <span className="text-[10px] font-mono text-stitch-dim uppercase font-bold">Brevity</span>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {unifiedData.atsAudit.subScores.brevityAndStructure}/10
                  </div>
                  <span className="text-[10px] text-stitch-dim font-mono">Word Length</span>
                </div>

                <div className="p-4 rounded-xl bg-[#080c16] border border-emerald-500/30 text-center bg-emerald-950/10">
                  <span className="text-[10px] font-mono text-emerald-300 uppercase font-bold">Evidence</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {unifiedData.atsAudit.subScores.evidenceVerification}/10
                  </div>
                  <span className="text-[10px] text-emerald-300 font-mono">SDETube Proof</span>
                </div>
              </div>

              {/* Interactive Bullet-by-Bullet Fixer */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Evidence-Gated XYZ Bullet Rewriter (AI Calibrated)</span>
                </h3>
                <p className="text-xs text-stitch-dim">
                  Bullets from your resume analyzed against FAANG bar-raiser impact standards.
                </p>

                <div className="space-y-3.5 pt-2">
                  {unifiedData.atsAudit.bulletAudits.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#080c16] border border-white/[0.08] space-y-3 hover:border-cyan-400/30 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-stitch-dim">
                          Section: <strong>{item.section}</strong> &bull; Issue: <span className="text-rose-400">{item.issue}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          item.score === 'strong' ? 'bg-emerald-500/20 text-emerald-300' :
                          item.score === 'moderate' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-rose-500/20 text-rose-300'
                        }`}>
                          {item.score.toUpperCase()}
                        </span>
                      </div>

                      {/* Original Bullet */}
                      <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04] text-xs font-mono text-slate-300">
                        <span className="text-stitch-dim select-none mr-2">Original:</span>
                        {item.originalBullet}
                      </div>

                      {/* AI Suggested XYZ Rewrite */}
                      <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono text-cyan-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-cyan-400 uppercase font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Recommended XYZ Rewrite:</span>
                          </span>
                          <span className="text-[10px] text-stitch-dim">Action + Metric + Tech</span>
                        </div>
                        <p className="leading-relaxed">{item.aiSuggestedRewrite}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: LIVE MATCHING JOBS (FREEHIRE API) */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                    <span>Live FreeHire Engineering Feed &bull; Per-Job ATS Scoring</span>
                  </h2>
                  <p className="text-xs text-stitch-dim">
                    Real live engineering jobs ranked against your active skills with guaranteed 404-free application links.
                  </p>
                </div>
                <div className="text-xs font-mono text-stitch-dim">
                  Sorted by: <span className="text-cyan-300 font-bold">Highest ATS Match %</span>
                </div>
              </div>

              {/* Job Cards */}
              <div className="space-y-4">
                {unifiedData.liveJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-5 sm:p-6 rounded-2xl bg-[#0c101a] border border-white/[0.08] hover:border-cyan-400/40 transition-all shadow-xl space-y-4 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                            {job.salaryRangeText}
                          </span>
                          {job.remote && (
                            <span className="px-2 py-0.5 rounded bg-[#111622] text-stitch-dim font-mono text-[11px] border border-white/[0.08]">
                              Remote
                            </span>
                          )}
                          <span className="text-[11px] font-mono text-stitch-dim">
                            Posted {job.postedAt} &bull; via {job.source}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                          {job.title}
                        </h3>

                        <div className="text-xs font-mono text-stitch-dim flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-stitch-dim" />
                          <span className="text-white font-semibold">{job.company}</span>
                          <span>&bull;</span>
                          <span>{job.location}</span>
                        </div>
                      </div>

                      {/* Right: ATS Match Score Gauge */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
                          {job.atsMatchScore}%
                        </div>
                        <div className="text-[10px] font-mono text-stitch-dim">ATS Match Score</div>
                      </div>
                    </div>

                    <p className="text-xs text-stitch-dim leading-relaxed">
                      {job.rawDescription}
                    </p>

                    {/* Matched vs Missing Skills */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-mono text-stitch-dim mr-1">Matched:</span>
                        {job.matchedSkills.map((m, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium flex items-center gap-1 ${
                              m.fromSdeTube
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                            <span>{m.name}</span>
                            {m.fromSdeTube && <span className="text-[9px] text-amber-300">⚡</span>}
                          </span>
                        ))}
                      </div>

                      {job.missingSkills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-mono text-stitch-dim mr-1">Missing for 100%:</span>
                          {job.missingSkills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-mono"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.05]">
                      <button
                        type="button"
                        onClick={() => handleScanAgainstJob(job)}
                        className="px-4 py-2 rounded-xl bg-stitch-surface hover:bg-stitch-card border border-white/[0.08] hover:border-cyan-400/40 text-xs font-mono font-bold text-cyan-300 hover:text-white transition flex items-center gap-2 cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Scan Resume Against This Job</span>
                      </button>

                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-mono font-black text-xs transition shadow-lg shadow-emerald-500/20 hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Apply on FreeHire</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: SKILL GROWTH HUB (3 PILLARS: SDETUBE + GITHUB + WEB) */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    <span>Skill Acquisition Hub &bull; 3 Pillars of Mastery</span>
                  </h2>
                  <p className="text-xs text-stitch-dim">
                    Every missing skill resolved across SDETube Native Sandboxes, GitHub Proof-of-Work Repos, and Curated Web Resources.
                  </p>
                </div>
              </div>

              {/* 3-Column Learning Cards */}
              <div className="space-y-6">
                {unifiedData.skillRoiRecommendations.map((rec) => (
                  <div
                    key={rec.skillName}
                    className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-5 sm:p-7 shadow-xl space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg font-bold text-white">{rec.skillName}</h3>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                            +₹{rec.marketValueDeltaLPA} LPA Boost
                          </span>
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-xs text-stitch-dim mt-1">{rec.whyItMatters}</p>
                      </div>

                      <div className="text-right text-xs font-mono text-stitch-dim flex-shrink-0">
                        Est. Study: <strong className="text-white">{rec.estimatedHoursToLearn} hrs</strong> &bull; Unlocks: <strong className="text-cyan-300">{rec.unlockedJobsCount} FreeHire Jobs</strong>
                      </div>
                    </div>

                    {/* 3 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      {/* Column 1: SDETube Ecosystem */}
                      <div className="p-4 rounded-xl bg-[#080c16] border border-indigo-500/20 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-300">
                          <Cpu className="w-4 h-4 text-indigo-400" />
                          <span>Pillar 1: SDETube Ecosystem</span>
                        </div>
                        <p className="text-[11px] text-stitch-dim">Native video lessons, book chapters, and interactive judges.</p>

                        <div className="space-y-2 pt-1">
                          {rec.learningResources.sdeTube.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => navigate(item.routeUrl)}
                              className="w-full p-2.5 rounded-lg bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-500/30 text-left transition text-xs font-mono text-indigo-200 flex items-center justify-between group cursor-pointer"
                            >
                              <div className="truncate pr-2">
                                <span className="text-[9px] uppercase font-bold text-indigo-400 block">{item.type}</span>
                                <span className="text-white text-[11px] font-semibold">{item.title}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Column 2: GitHub Proof-of-Work */}
                      <div className="p-4 rounded-xl bg-[#080c16] border border-white/[0.08] space-y-3">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-300">
                          <Github className="w-4 h-4 text-emerald-400" />
                          <span>Pillar 2: GitHub Proof-of-Work</span>
                        </div>
                        <p className="text-[11px] text-stitch-dim">Open-source blueprints and capstone micro-project specs.</p>

                        <div className="space-y-2 pt-1">
                          {rec.learningResources.github.map((gh, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-2 text-xs font-mono">
                              <a
                                href={gh.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-cyan-300 hover:text-white flex items-center gap-1 text-[11px]"
                              >
                                <span>{gh.repoName}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <p className="text-[10px] text-stitch-dim leading-relaxed">{gh.description}</p>
                              
                              <div className="p-2 rounded bg-stitch-surface border border-white/[0.04] text-[10px] text-emerald-300">
                                <strong>Capstone Spec:</strong> {gh.capstoneProjectIdea}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Column 3: Best of the Internet */}
                      <div className="p-4 rounded-xl bg-[#080c16] border border-white/[0.08] space-y-3">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                          <Globe className="w-4 h-4 text-cyan-400" />
                          <span>Pillar 3: Best of the Web</span>
                        </div>
                        <p className="text-[11px] text-stitch-dim">Official docs, MIT courses, and engineering blogs.</p>

                        <div className="space-y-2 pt-1">
                          {rec.learningResources.internet.map((net, idx) => (
                            <a
                              key={idx}
                              href={net.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-lg bg-black/40 hover:bg-white/[0.04] border border-white/[0.06] block transition text-xs font-mono group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-stitch-dim font-bold uppercase">{net.provider}</span>
                                <ExternalLink className="w-3 h-3 text-stitch-dim group-hover:text-cyan-300" />
                              </div>
                              <div className="text-[11px] font-semibold text-white mt-0.5">{net.title}</div>
                            </a>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 5: ROLE TRANSITIONS & 3D FLASHCARDS */}
          {activeTab === 'transitions' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    <span>Role Transition Matrix &bull; Vertical &amp; Horizontal Pivots</span>
                  </h2>
                  <p className="text-xs text-stitch-dim">
                    High-probability career moves calibrated against your current skill graph with 30-60-90 day execution milestones.
                  </p>
                </div>
              </div>

              {/* Role Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {unifiedData.roleTransitions.map((path, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#0c101a] border border-white/[0.08] shadow-xl space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
                          {path.transitionType}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1.5">{path.targetRoleTitle}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold font-mono text-emerald-400">
                          +₹{path.valueJumpLPA} LPA
                        </span>
                        <div className="text-[10px] font-mono text-stitch-dim">Projected Jump</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#080c16] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                      <span>Target Band: <strong>₹{path.projectedMarketValueLPA.min}L–₹{path.projectedMarketValueLPA.max}L</strong></span>
                      <span className="text-cyan-300">Readiness: <strong>{path.currentReadinessPct}%</strong></span>
                    </div>

                    {/* Bridge Skills */}
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="text-stitch-dim text-[11px]">Required Bridge Skills:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {path.requiredBridgeSkills.map((bSkill, bIdx) => (
                          <span
                            key={bIdx}
                            className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px]"
                          >
                            {bSkill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 30-60-90 Day Roadmap */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                      <span className="text-[11px] font-mono font-bold text-white uppercase">30-60-90 Day Execution:</span>
                      <div className="space-y-2">
                        {path.roadmapPhases.map((phase, pIdx) => (
                          <div key={pIdx} className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] text-[11px] font-mono space-y-1">
                            <div className="flex items-center justify-between font-bold text-cyan-300">
                              <span>{phase.days}: {phase.focus}</span>
                              <span className="text-[10px] text-emerald-400">{phase.sdeTubeVerificationTarget}</span>
                            </div>
                            <ul className="text-stitch-dim text-[10px] space-y-0.5 list-disc list-inside">
                              {phase.actionItems.map((ai, aiIdx) => (
                                <li key={aiIdx}>{ai}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 6: AI ATS RESUME CREATOR (LIVE PAPER PREVIEW) */}
          {activeTab === 'creator' && (
            <AtsResumeCreatorView
              analysisContext={null}
            />
          )}

        </div>
      ) : null}

    </div>
  );
};

export default ResumeAnalyst;
