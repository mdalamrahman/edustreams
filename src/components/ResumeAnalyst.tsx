import { assessResume } from '../lib/atsEvidence';
// src/components/ResumeAnalyst.tsx
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
  HelpCircle,
  MapPin
} from 'lucide-react';
import {
  UnifiedResumeAnalysisResponse,
  runUnifiedResumeAnalysis,
  extractResumeTextFromFile,
  LiveJobMatch,
  SkillRoiRecommendation,
  RoleTransitionPath,
  ResumeAnalysisResult,
  UserLocationPreferences,
  DEFAULT_LOCATION_PREFERENCES,
  INDIA_CITY_MULTIPLIERS,
  DualMarketValuation,
  COUNTRY_CONFIGS,
  CountryCode
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
  const [locationPrefs, setLocationPrefs] = useState<UserLocationPreferences>(DEFAULT_LOCATION_PREFERENCES);
  const [jobsLaneFilter, setJobsLaneFilter] = useState<'domestic' | 'outside' | 'all'>('domestic');
  const [simulatedSkills, setSimulatedSkills] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('Software Engineer');
  const [targetJobForScan, setTargetJobForScan] = useState<LiveJobMatch | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [analyzingStep, setAnalyzingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [loadLatencyMs, setLoadLatencyMs] = useState<number>(0);
  const [walletBalance, setWalletBalance] = useState<number>(() => getUserWallet().balance);
  const [unifiedData, setUnifiedData] = useState<UnifiedResumeAnalysisResponse | null>(null);

  const uploadGeneration = useRef(0);
  const analysisGeneration = useRef(0);
  const uploadedText = useRef('');
  const currentLocation = useRef(locationPrefs);
  const [jobDescription, setJobDescription] = useState('');
  const ats = useMemo(() => resumeText ? assessResume(resumeText, jobDescription) : null, [resumeText, jobDescription]);
  const valuation = unifiedData && (unifiedData.parsedCandidate.resumeSkills.length > 0 || unifiedData.parsedCandidate.extractedYoe > 0)
    ? unifiedData.dualValuation : null;

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
    force: boolean = false,
    locOverride?: UserLocationPreferences,
    simBoostOverride?: number
  ) => {
    if (!textToAnalyze.trim() || textToAnalyze !== uploadedText.current) return;
    const request = ++analysisGeneration.current;
    setUnifiedData(null);
    const startTime = performance.now();
    try {
      if (force) setIsRefreshing(true);
      else setIsAnalyzing(true);
      setError(null);

      const activeLoc = locOverride || currentLocation.current;
      const activeSimBoost = simBoostOverride ?? 0;

      const result = await runUnifiedResumeAnalysis({
        resumeText: textToAnalyze,
        includeSdeTubeData: withSdeTube,
        targetRole,
        targetJobDescription: targetJobForScan?.cleanFullText || targetJobForScan?.cleanSummary || targetJobForScan?.rawDescription,
        targetJobId: targetJobForScan?.id,
        locationPreferences: activeLoc,
        simulatedSkillsBoost: activeSimBoost,
        forceRefresh: force
      });

      if (request !== analysisGeneration.current) return;
      const elapsed = Math.round(performance.now() - startTime);
      setLoadLatencyMs(elapsed);
      setUnifiedData(result);
    } catch (err: any) {
      if (request !== analysisGeneration.current) return;
      setError(err?.message || 'Failed to analyze resume. Please try again.');
    } finally {
      if (request === analysisGeneration.current) {
        setIsAnalyzing(false);
        setIsRefreshing(false);
        setAnalyzingStep(0);
      }
    }
  }, [targetRole, targetJobForScan, locationPrefs]);

  function resetUpload() {
    uploadGeneration.current++;
    analysisGeneration.current++;
    uploadedText.current = '';
    setResumeText('');
    setSelectedFile(null);
    setUnifiedData(null);
    setSimulatedSkills([]);
    setIsAnalyzing(false);
    setIsRefreshing(false);
    setError(null);
  }

  const handleFileSelect = async (file: File) => {
    resetUpload();
    const generation = uploadGeneration.current;
    if (!/\.(pdf|txt|md)$/i.test(file.name) || file.size > 10 * 1024 * 1024) {
      setError('Upload a PDF, TXT, or Markdown file up to 10 MB.');
      return;
    }
    try {
      const text = (await extractResumeTextFromFile(file, { requireReadableText: true })).trim();
      if (generation !== uploadGeneration.current) return;
      if (!/\p{L}{2,}/u.test(text) || text.split(/\s+/).length < 5) throw new Error('No readable resume text');
      uploadedText.current = text;
      setSelectedFile(file);
      setResumeText(text);
      void executeAnalysis(text, includeSdeTubeData, false, currentLocation.current, 0);
    } catch {
      if (generation === uploadGeneration.current) setError('Could not read this resume. Upload a text-based PDF, TXT, or Markdown file.');
    }
  };

  const activeCountryConfig = COUNTRY_CONFIGS[locationPrefs.countryCode] || COUNTRY_CONFIGS.IN;

  const handleCountryChange = (newCountryCode: CountryCode) => {
    const nextConfig = COUNTRY_CONFIGS[newCountryCode] || COUNTRY_CONFIGS.IN;
    const next: UserLocationPreferences = {
      ...locationPrefs,
      countryCode: newCountryCode,
      countryName: nextConfig.name,
      currencySymbol: nextConfig.currencySymbol,
      currencyUnit: nextConfig.unitLabel,
      preferredCity: nextConfig.cities[0].name,
    };
    currentLocation.current = next;
    setLocationPrefs(next);
    executeAnalysis(resumeText, includeSdeTubeData, false, next, simulatedBoost);
  };

  // Update Location Preferences & Trigger Fast Refresh
  const updateLocationPrefs = (updates: Partial<UserLocationPreferences>) => {
    const next: UserLocationPreferences = { ...locationPrefs, ...updates };
    currentLocation.current = next;
    setLocationPrefs(next);
    executeAnalysis(resumeText, includeSdeTubeData, false, next, simulatedBoost);
  };

  // Toggle SDETube Verified Telemetry
  const handleToggleSdeTubeData = async (checked: boolean) => {
    setIncludeSdeTubeData(checked);
    await executeAnalysis(resumeText, checked, false, locationPrefs, simulatedBoost);
  };

  // Toggle Simulated "What-If" Skill
  const handleToggleSimulatedSkill = (skillName: string) => {
    setSimulatedSkills(prev => {
      const next = prev.includes(skillName) ? prev.filter(s => s !== skillName) : [...prev, skillName];
      const newBoost = next.reduce((sum, name) => {
        const rec = unifiedData?.skillRoiRecommendations.find(r => r.skillName === name);
        return sum + (rec?.marketValueDeltaLPA ?? 0);
      }, 0);
      executeAnalysis(resumeText, includeSdeTubeData, false, locationPrefs, newBoost);
      return next;
    });
  };

  // Calculate Marginal Boost from Simulated Skills
  const simulatedBoost = useMemo(() => {
    if (!unifiedData || simulatedSkills.length === 0) return 0;
    return simulatedSkills.reduce((sum, skillName) => {
      const rec = unifiedData.skillRoiRecommendations.find(r => r.skillName === skillName);
      return sum + (rec?.marketValueDeltaLPA ?? 0);
    }, 0);
  }, [unifiedData, simulatedSkills]);

  // Filtered Jobs based on 2-Lane Location Preferences
  const displayedJobs = useMemo(() => {
    if (!unifiedData) return [];
    if (jobsLaneFilter === 'domestic') {
      return (unifiedData.domesticJobs && unifiedData.domesticJobs.length > 0)
        ? unifiedData.domesticJobs
        : unifiedData.liveJobs;
    }
    if (jobsLaneFilter === 'outside') {
      return (unifiedData.outsideCountryJobs && unifiedData.outsideCountryJobs.length > 0)
        ? unifiedData.outsideCountryJobs
        : unifiedData.liveJobs;
    }
    return unifiedData.liveJobs;
  }, [unifiedData, jobsLaneFilter]);

  // 1-Click "Scan Resume Against This Job" from Jobs Tab
  const handleScanAgainstJob = (job: LiveJobMatch) => {
    setTargetJobForScan(job);
    setJobDescription(job.cleanFullText || job.rawDescription || job.cleanSummary || '');
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
      badge: valuation ? `${valuation.domestic.currencySymbol}${valuation.domestic.totalEstimatedValue} ${valuation.domestic.unitLabel}` : ''
    },
    {
      id: 'ats_scanner' as const,
      label: 'Deep ATS Scanner & Tailor',
      icon: FileCheck,
      badge: ats ? 'Audit' : ''
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
      badge: unifiedData ? `${unifiedData.roleTransitions.length} Roles` : ''
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
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090d16]/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

        {/* Top Control Grid: 3-column / 12-col layout */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-center">
          
          {/* 1. Resume Upload & Active File Pill (3 cols) */}
          <div className="lg:col-span-3 flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5">
            <div className="truncate mr-2">
              <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="truncate">{selectedFile ? selectedFile.name : 'Upload your resume'}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {unifiedData ? `${unifiedData.parsedCandidate.resumeSkills.length} skills detected` : 'PDF, TXT, or Markdown'}
              </div>
            </div>
            <label className="px-2.5 py-1 text-xs font-mono font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer shrink-0 transition flex items-center gap-1">
              <Upload className="w-3 h-3" />
              <span>Upload resume</span>
              <input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ''; if (file) void handleFileSelect(file); }}
                className="hidden"
              />
            </label>
          </div>

          {selectedFile && <button type="button" className="text-xs text-slate-300 underline" onClick={resetUpload}>Remove resume</button>}

          {/* 2. Country, Domestic City & Remote Filter (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-2">
            {/* Country Selector */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">
                Target Country
              </label>
              <select
                value={locationPrefs.countryCode}
                onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {Object.values(COUNTRY_CONFIGS).map((cfg) => (
                  <option key={cfg.code} value={cfg.code}>
                    {cfg.flag} {cfg.name} ({cfg.currencySymbol}{cfg.unitLabel})
                  </option>
                ))}
              </select>
            </div>

            {/* Within-Country City / Hub Selector */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">
                Preferred Hub / City
              </label>
              <select
                value={locationPrefs.preferredCity}
                onChange={(e) => updateLocationPrefs({ preferredCity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {activeCountryConfig.cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.label || city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Mode / Remote Filter for FreeHire & Valuation */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">
                Work Mode
              </label>
              <select
                value={locationPrefs.preferDomesticRemote ? 'domestic_remote' : locationPrefs.workModeFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'domestic_remote') {
                    updateLocationPrefs({ preferDomesticRemote: true, workModeFilter: 'remote' });
                  } else {
                    updateLocationPrefs({ preferDomesticRemote: false, workModeFilter: val as any });
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">🏢 {locationPrefs.preferredCity} + Remote</option>
                <option value="domestic_remote">🏠 Remote in {activeCountryConfig.name}</option>
                <option value="hybrid">🔄 Hybrid ({locationPrefs.preferredCity})</option>
                <option value="onsite">📍 In-Office ({locationPrefs.preferredCity})</option>
              </select>
            </div>
          </div>

          {/* 3. SDETube Telemetry Checkbox Toggle (4 cols) */}
          <div className="lg:col-span-4 flex items-center justify-between gap-2.5">
            <label className="flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-950/60 border border-indigo-500/40 cursor-pointer hover:border-indigo-400 transition select-none flex-1">
              <input
                type="checkbox"
                checked={includeSdeTubeData}
                onChange={(e) => handleToggleSdeTubeData(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
              <div className="truncate">
                <div className="text-xs font-semibold text-indigo-200 flex items-center gap-1.5 truncate">
                  <span className="truncate">SDETube Activity</span>
                  {unifiedData?.fromCache && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono flex-shrink-0">
                      ⚡ Redis
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {includeSdeTubeData ? 'Include account activity when available' : 'Resume-only estimate'}
                </div>
              </div>
            </label>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => executeAnalysis(resumeText, includeSdeTubeData, true, locationPrefs, simulatedBoost)}
              disabled={!resumeText || isRefreshing || isAnalyzing}
              className="p-2.5 rounded-xl bg-[#0f1422] border border-white/[0.08] text-stitch-dim hover:text-white transition disabled:opacity-50 cursor-pointer flex-shrink-0"
              title="Force refresh analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4 pt-4 border-t border-slate-800/80">
          <section className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4">
            <h2 className="text-sm text-emerald-300 font-semibold">In-Country Value ({locationPrefs.preferredCity})</h2>
            {valuation ? <p className="mt-2 text-white">Estimated range {valuation.domestic.currencySymbol}{valuation.domestic.range.min}?{valuation.domestic.range.max} {valuation.domestic.unitLabel}</p>
              : <p className="mt-2 text-sm text-slate-400">{!resumeText ? 'Upload your resume to see an estimate.' : isAnalyzing || isRefreshing ? 'Calculating estimate?' : 'Estimate unavailable'}</p>}
          </section>
          <section className="bg-slate-950/80 border border-sky-500/30 rounded-xl p-4">
            <h2 className="text-sm text-sky-300 font-semibold">Outside-Country Value (Global Remote)</h2>
            {valuation ? <p className="mt-2 text-white">Estimated annual value ${valuation.outsideCountry.globalRemoteUSD.totalMedianUSD.toLocaleString()}</p>
              : <p className="mt-2 text-sm text-slate-400">{!resumeText ? 'Upload your resume to see an estimate.' : isAnalyzing || isRefreshing ? 'Calculating estimate?' : 'Estimate unavailable'}</p>}
          </section>
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
      {activeTab === 'ats_scanner' && ats ? (
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4">
          <h2 className="text-xl font-bold">Resume parseability and quality</h2>
          <ul className="space-y-2 text-sm">
            {ats.checks.map(check => <li key={check.label}>{check.label}: {check.detail}</li>)}
          </ul>
          <label className="block text-sm" htmlFor="ats-job-description">Job description (optional)</label>
          <textarea id="ats-job-description" className="w-full rounded-lg bg-slate-950 p-3 min-h-28" value={jobDescription} onChange={event => setJobDescription(event.target.value)} />
          {ats.match && <div className="space-y-2">
            <h3 className="font-semibold">Estimated job requirement coverage: {ats.match.score}%</h3>
            <ul className="space-y-2 text-sm">
              {ats.match.requirements.map(item => <li key={item.term}><strong>{item.term}</strong> {item.evidence ? `? ${item.evidence}` : '? Evidence not found'}</li>)}
            </ul>
          </div>}
        </section>
      ) : null}
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
          {activeTab === 'dashboard' && valuation && (
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

          {/* TAB 3: LIVE MATCHING JOBS (FREEHIRE API) */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                    <span>Live FreeHire Engineering Feed &bull; 2-Lane Location Scored</span>
                  </h2>
                  <p className="text-xs text-stitch-dim">
                    Real live engineering jobs ranked against your active skills with guaranteed 404-free application links.
                  </p>
                </div>
                <div className="text-xs font-mono text-stitch-dim">
                  Priority: <span className="text-cyan-300 font-bold">{locationPrefs.preferredCity} &amp; Remote</span>
                </div>
              </div>

              {/* 2-Lane Location Filter Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[#080c16] border border-white/[0.08]">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setJobsLaneFilter('domestic')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      jobsLaneFilter === 'domestic'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-stitch-dim hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>In-Country ({locationPrefs.preferredCity} &amp; Remote) ({unifiedData.domesticJobs?.length || 0})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobsLaneFilter('outside')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      jobsLaneFilter === 'outside'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                        : 'text-stitch-dim hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    <span>Outside-Country (Global Remote &amp; Hubs) ({unifiedData.outsideCountryJobs?.length || 0})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobsLaneFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      jobsLaneFilter === 'all'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-stitch-dim hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>All Matches ({unifiedData.liveJobs.length})</span>
                  </button>
                </div>
                <div className="text-xs font-mono text-stitch-dim px-2">
                  Showing {displayedJobs.length} Live Positions
                </div>
              </div>

              {/* Job Cards */}
              <div className="space-y-4">
                {displayedJobs.map((job) => {
                  const isExpanded = expandedJobId === job.id;
                  const displaySalary = job.salaryRangeText || job.salaryText || 'Competitive Market Pay';
                  const displayPosted = job.postedAtFormatted || job.postedAt || 'Recently';
                  const displaySource = job.source || 'FreeHire';
                  const displayMode = job.workMode ? job.workMode.toUpperCase() : (job.remote ? 'REMOTE' : 'ONSITE');
                  const atsColor =
                    job.atsMatchScore >= 75
                      ? 'text-emerald-400'
                      : job.atsMatchScore >= 50
                      ? 'text-amber-400'
                      : 'text-rose-400';

                  return (
                    <div
                      key={job.id}
                      className="p-5 sm:p-6 rounded-2xl bg-[#0c101a] border border-white/[0.08] hover:border-cyan-400/40 transition-all shadow-xl space-y-4 group"
                    >
                      {/* Top Row: Badges, Role & ATS Match Score */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                              {displaySalary}
                            </span>
                            {job.isPreferredCityMatch && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] border border-emerald-500/30 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-400" />
                                <span>{locationPrefs.preferredCity} Priority</span>
                              </span>
                            )}
                            {job.isDomesticRemote && (
                              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[11px] border border-indigo-500/30">
                                Domestic Remote
                              </span>
                            )}
                            {job.remote && !job.isDomesticRemote && (
                              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[11px] border border-sky-500/30">
                                Global Remote
                              </span>
                            )}
                            {job.seniorityLevel && (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700/60">
                                {job.seniorityLevel} ({job.requiredMinYoe !== undefined ? `${job.requiredMinYoe}+ YOE` : ''})
                              </span>
                            )}
                            <span className="text-[11px] font-mono text-stitch-dim">
                              Posted {displayPosted} &bull; via {displaySource}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                            {job.title}
                          </h3>

                          <div className="text-xs font-mono text-stitch-dim flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-stitch-dim" />
                            <span className="text-white font-semibold">{job.company}</span>
                            <span>&bull;</span>
                            <span>{job.location} ({displayMode})</span>
                          </div>
                        </div>

                        {/* Right: ATS Match Score Gauge */}
                        <div className="text-right flex-shrink-0">
                          <div className={`text-2xl sm:text-3xl font-black font-mono ${atsColor}`}>
                            {job.atsMatchScore}%
                          </div>
                          <div className="text-[10px] font-mono text-stitch-dim">ATS Match Score</div>
                        </div>
                      </div>

                      {/* Seniority Gap Warning Banner (e.g., for CLANX 7+ YOE role) */}
                      {job.seniorityGapWarning && (
                        <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
                          <span className="font-semibold">⚠️ {job.seniorityGapWarning}</span>
                          <span className="text-[11px] text-amber-400/80 font-mono">Seniority penalty applied</span>
                        </div>
                      )}

                      {/* Sanitized Description Summary & Expandable Structured Sections (NO RAW HTML TAGS!) */}
                      <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
                        {!isExpanded ? (
                          <p>{job.cleanSummary || job.rawDescription?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 320) || 'No description provided.'}</p>
                        ) : (
                          <div className="space-y-3">
                            {job.structuredSections && job.structuredSections.length > 0 ? (
                              job.structuredSections.map((sec, idx) => (
                                <div key={idx}>
                                  <div className="text-xs font-semibold text-indigo-300 mb-1">{sec.heading}</div>
                                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                                    {sec.bullets.map((b, bIdx) => (
                                      <li key={bIdx}>{b}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))
                            ) : (
                              <p className="whitespace-pre-wrap">{job.cleanFullText || job.cleanSummary || job.rawDescription?.replace(/<[^>]+>/g, ' ').trim()}</p>
                            )}
                          </div>
                        )}
                        {((job.structuredSections && job.structuredSections.length > 0) || (job.cleanFullText && job.cleanFullText.length > 320) || (job.rawDescription && job.rawDescription.length > 320)) && (
                          <button
                            type="button"
                            onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                            className="mt-2 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer block"
                          >
                            {isExpanded ? '▲ Show Less' : '▼ View Full Structured Requirements & Interview Process'}
                          </button>
                        )}
                      </div>

                      {/* Matched vs Missing Skills */}
                      <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-mono text-stitch-dim mr-1">Matched:</span>
                          {job.matchedSkills.map((m, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium flex items-center gap-1 ${
                                m.fromSdeTube || m.proofLevel === 'sdetube'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              }`}
                            >
                              <Check className="w-2.5 h-2.5" />
                              <span>{m.name}</span>
                              {(m.fromSdeTube || m.proofLevel === 'sdetube') && <span className="text-[9px] text-amber-300">⚡</span>}
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
                                + Learn {s}
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
                  );
                })}
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
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{rec.skillName}</h3>
                          <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            <span>+₹{rec.marketValueDeltaLPA} LPA ({locationPrefs.preferredCity})</span>
                          </span>
                          <span className="px-2.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold flex items-center gap-1">
                            <Globe className="w-3 h-3 text-sky-400" />
                            <span>+${(rec.globalRoiUSD || Math.round(rec.marketValueDeltaLPA * 3500)).toLocaleString()} / yr Global</span>
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
              key={selectedFile?.name + String(uploadGeneration.current)}
              baseResumeText={resumeText}
              jobDescription={jobDescription}
            />
          )}

        </div>
      ) : !resumeText ? <p className="py-10 text-center text-slate-400">Upload your resume to start analysis.</p> : null}

    </div>
  );
};

export default ResumeAnalyst;
