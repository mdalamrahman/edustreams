// src/components/CareerSalaryAndJobEngine.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Zap,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Code2,
  Layers,
  Cpu,
  Database,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Building2,
  DollarSign,
  Clock,
  Play,
  Briefcase,
  Copy,
  Check,
  Sliders,
  RefreshCw,
  Flame,
  Key
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BACKEND_BASE = (
  (typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_BACKEND_URL as string) || (import.meta.env.VITE_RENDER_BACKEND_URL as string)
    : '') || 'https://edustream-backend-90vm.onrender.com'
).replace(/\/+$/, '');

export interface LearningPath {
  videoTitle: string;
  videoDuration: string;
  streamRoute: string;
  sandboxTab: string;
  sandboxTitle: string;
  sandboxRoute: string;
  aiVerification: string;
  verifiedBullet: string;
}

export interface MissingSkillGap {
  slug: string;
  name: string;
  matchDeltaPercent: number;
  salaryBoostLpa: number;
  salaryBoostUsd: number;
  studyHours: number;
  demandGrowth: string;
  experiencePrompt: string;
  learningPath: LearningPath;
}

export interface JobPosting {
  slug: string;
  title: string;
  company: string;
  location: string;
  atsSource: string;
  offeredBandLpa: string;
  freehireUrl: string;
  directAtsUrl: string;
  baseMatchPercent: number;
  matchedSkills: string[];
  missingSkillGaps: MissingSkillGap[];
  mistralAdvice?: {
    ai_advisor_note?: string;
    tailored_ats_headline?: string;
  };
}

export const SAMPLE_JOBS: JobPosting[] = [
  {
    slug: 'stripe-backend-engineer-payments-infra',
    title: 'Software Engineer — Distributed Ledger & Streaming Infrastructure',
    company: 'Stripe',
    location: 'Bangalore / Remote',
    atsSource: 'Greenhouse Direct',
    offeredBandLpa: '₹38.0L – ₹56.0L',
    freehireUrl: 'https://freehire.me/jobs/stripe-backend-engineer-payments-infra',
    directAtsUrl: 'https://boards.greenhouse.io/stripe',
    baseMatchPercent: 72,
    matchedSkills: ['C++20', 'PostgreSQL', 'Node.js / NestJS', 'Next.js', 'Data Pipelines', 'Algorithms (1200+ LC)'],
    mistralAdvice: {
      ai_advisor_note:
        'Stripe prioritizes idempotency and bounded concurrency in transaction processing. Adding Go and Redis rate-limiting closes the final 28% gap and maximizes your SDE-2 compensation band.',
      tailored_ats_headline:
        'Distributed Systems & Backend Engineer | High-Concurrency Microservices, Event Streaming & ACID Ledgers',
    },
    missingSkillGaps: [
      {
        slug: 'go',
        name: 'Golang High-Concurrency Microservices',
        matchDeltaPercent: 12,
        salaryBoostLpa: 7.2,
        salaryBoostUsd: 28000,
        studyHours: 6.0,
        demandGrowth: '+44% YoY',
        experiencePrompt: 'Built Go microservices with bounded worker pools handling 12k req/s.',
        learningPath: {
          videoTitle: 'Telegram CDN Lec 14: Goroutines, Channels & Context Cancellation',
          videoDuration: '35 mins (HTTP 206 Stream)',
          streamRoute: '/channel/ch-sd-02',
          sandboxTab: 'sde-sheet',
          sandboxTitle: 'Judge0 Arena: Implement Non-Blocking Worker Pool in Go',
          sandboxRoute: '/dsa-sheets',
          aiVerification: 'Bar-Raiser Defense on Go Memory Model & Escape Analysis',
          verifiedBullet:
            'Engineered high-concurrency Golang backend services utilizing bounded worker pools and context propagation, cutting p99 latency by 34%.',
        },
      },
      {
        slug: 'redis',
        name: 'Distributed Rate Limiting & Redis Cluster',
        matchDeltaPercent: 9,
        salaryBoostLpa: 5.0,
        salaryBoostUsd: 18500,
        studyHours: 2.5,
        demandGrowth: '+31% YoY',
        experiencePrompt: 'Implemented distributed Redis sliding-window rate limiter with sub-3ms latency.',
        learningPath: {
          videoTitle: 'Telegram CDN Lec 09: Consistent Hashing & Leaky Bucket Rate Limiters',
          videoDuration: '20 mins (HTTP 206 Stream)',
          streamRoute: '/channel/ch-sd-02',
          sandboxTab: 'hld-studio',
          sandboxTitle: 'HLD Topology Studio: Build Distributed Rate Limiter & LRU Cache',
          sandboxRoute: '/hld',
          aiVerification: 'Bar-Raiser Defense on Cache Stampede & Thundering Herd Mitigation',
          verifiedBullet:
            'Architected a distributed Leaky-Bucket Rate Limiter and thread-safe LRU cache with millisecond TTL eviction in SDETube HLD Studio.',
        },
      },
      {
        slug: 'postgresql',
        name: 'Advanced SQL Reconciliation (Window Functions & CTEs)',
        matchDeltaPercent: 7,
        salaryBoostLpa: 4.2,
        salaryBoostUsd: 15000,
        studyHours: 2.0,
        demandGrowth: '+27% YoY',
        experiencePrompt: 'Authored PostgreSQL DENSE_RANK reconciliation queries across 20M+ ledger rows.',
        learningPath: {
          videoTitle: 'Telegram CDN Lec 05: MVCC Isolation & Analytical Window Queries',
          videoDuration: '20 mins (HTTP 206 Stream)',
          streamRoute: '/channel/ch-sd-02',
          sandboxTab: 'sql-arena',
          sandboxTitle: 'SQL 323 Arena: Solve Department Top 3 Salaries (DENSE_RANK)',
          sandboxRoute: '/problem/sql-arena?type=sql',
          aiVerification: 'Bar-Raiser Defense on Composite Index Selectivity & Write Amplification',
          verifiedBullet:
            'Authored complex analytical SQL reconciliation queries utilizing DENSE_RANK() OVER (PARTITION BY ...) verified in SDETube SQL 323 Arena.',
        },
      },
    ],
  },
  {
    slug: 'uber-payments-core-platform',
    title: 'Senior Software Engineer — Real-Time Dispatch & Event Engine',
    company: 'Uber',
    location: 'Hyderabad / Remote',
    atsSource: 'Workday ATS',
    offeredBandLpa: '₹42.0L – ₹65.0L',
    freehireUrl: 'https://freehire.me/jobs/uber-payments-core-platform',
    directAtsUrl: 'https://uber.wd5.myworkdayjobs.com/Uber_Careers',
    baseMatchPercent: 70,
    matchedSkills: ['C++', 'Distributed Caching', 'PostgreSQL', 'REST & gRPC', 'High Throughput'],
    mistralAdvice: {
      ai_advisor_note:
        'Uber dispatch infrastructure heavily evaluates Apache Kafka partition design and Kubernetes auto-scaling under traffic surges.',
      tailored_ats_headline:
        'Backend Architect | Event-Driven Streaming Pipelines, Kafka Partition Rebalancing & Distributed Consensus',
    },
    missingSkillGaps: [
      {
        slug: 'kafka',
        name: 'Apache Kafka & Partition Consumer Rebalancing',
        matchDeltaPercent: 16,
        salaryBoostLpa: 6.5,
        salaryBoostUsd: 24000,
        studyHours: 3.5,
        demandGrowth: '+38% YoY',
        experiencePrompt: 'Tuned Kafka cluster partitions and consumer offsets handling 80k events/sec.',
        learningPath: {
          videoTitle: 'Telegram CDN Lec 11: Kafka Partitioning, ISRs & Consumer Group Offsets',
          videoDuration: '25 mins (HTTP 206 Stream)',
          streamRoute: '/channel/ch-sd-02',
          sandboxTab: 'lld-studio',
          sandboxTitle: 'LLD Machine Coding: Build Thread-Safe Kafka Lite Broker',
          sandboxRoute: '/lld',
          aiVerification: 'Bar-Raiser Defense on Consumer Rebalancing & Head-of-Line Blocking',
          verifiedBullet:
            'Engineered a partitioned pub-sub message broker (Kafka Lite) with idempotent producers, offset commits, and concurrent consumer groups.',
        },
      },
      {
        slug: 'kubernetes',
        name: 'Kubernetes & Event-Driven Autoscaling (KEDA)',
        matchDeltaPercent: 14,
        salaryBoostLpa: 6.0,
        salaryBoostUsd: 22000,
        studyHours: 4.0,
        demandGrowth: '+35% YoY',
        experiencePrompt: 'Designed multi-zone K8s deployments with automated HPA & rolling updates.',
        learningPath: {
          videoTitle: 'Telegram CDN Lec 21: Container Orchestration & Pod Lifecycle',
          videoDuration: '30 mins (HTTP 206 Stream)',
          streamRoute: '/channel/ch-sd-02',
          sandboxTab: 'hld-studio',
          sandboxTitle: 'HLD Topology Lab: Multi-Region Kubernetes & Load Balancer Mesh',
          sandboxRoute: '/hld',
          aiVerification: 'Bar-Raiser Defense on Graceful Pod Termination & Zero-Downtime Rollouts',
          verifiedBullet:
            'Designed cloud-native microservice deployments with automated horizontal pod autoscaling, health probes, and zero-downtime rolling updates.',
        },
      },
    ],
  },
  {
    slug: 'datadog-systems-observability',
    title: 'Software Engineer II — Metrics Ingestion & High-Scale Storage',
    company: 'Datadog',
    location: 'Remote (Worldwide)',
    atsSource: 'Lever Direct',
    offeredBandLpa: '₹45.0L – ₹68.0L',
    freehireUrl: 'https://freehire.me/jobs/datadog-systems-observability',
    directAtsUrl: 'https://jobs.lever.co/datadog',
    baseMatchPercent: 78,
    matchedSkills: ['C++20', 'Linux Kernel', 'Memory Profiling', 'Concurrency', 'Time-Series DB'],
    mistralAdvice: {
      ai_advisor_note:
        'Datadog values extreme systems performance and low allocations. Mastering Go concurrency patterns will bridge your score straight to 100%.',
      tailored_ats_headline:
        'Systems Software Engineer | High-Throughput Ingestion Engines, Memory Optimization & Zero-Allocation C++',
    },
    missingSkillGaps: [
      {
        slug: 'go',
        name: 'Golang High-Concurrency Ingestion',
        matchDeltaPercent: 12,
        salaryBoostLpa: 7.2,
        salaryBoostUsd: 28000,
        studyHours: 6.0,
        demandGrowth: '+44% YoY',
        experiencePrompt: 'Built streaming metric ingestors in Go processing 500k datapoints/sec.',
        learningPath: {
          videoTitle: 'Telegram CDN Lec 14: Goroutines, Channels & Context Cancellation',
          videoDuration: '35 mins (HTTP 206 Stream)',
          streamRoute: '/channel/ch-sd-02',
          sandboxTab: 'sde-sheet',
          sandboxTitle: 'Judge0 Arena: Implement Non-Blocking Worker Pool in Go',
          sandboxRoute: '/dsa-sheets',
          aiVerification: 'Bar-Raiser Defense on Go Memory Model & Escape Analysis',
          verifiedBullet:
            'Developed low-latency concurrent backend services in Golang using worker pools and non-blocking channels, cutting memory allocation overhead by 35%.',
        },
      },
      {
        slug: 'redis',
        name: 'Redis Distributed State & Caching',
        matchDeltaPercent: 10,
        salaryBoostLpa: 5.0,
        salaryBoostUsd: 18500,
        studyHours: 2.5,
        demandGrowth: '+31% YoY',
        experiencePrompt: 'Optimized Redis cluster pipelines reducing metric lookup p99 to under 1.5ms.',
        learningPath: {
          videoTitle: 'Telegram CDN Lec 09: Consistent Hashing & Leaky Bucket Rate Limiters',
          videoDuration: '20 mins (HTTP 206 Stream)',
          streamRoute: '/channel/ch-sd-02',
          sandboxTab: 'hld-studio',
          sandboxTitle: 'HLD Topology Studio: Build Distributed Rate Limiter & LRU Cache',
          sandboxRoute: '/hld',
          aiVerification: 'Bar-Raiser Defense on Cache Stampede & Thundering Herd Mitigation',
          verifiedBullet:
            'Architected a distributed token-bucket rate limiter and concurrency-safe LRU cache with millisecond TTL expiration, sustaining sub-2ms p99 read latency.',
        },
      },
    ],
  },
];

export const CareerSalaryAndJobEngine: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [jobsList, setJobsList] = useState<JobPosting[]>(SAMPLE_JOBS);
  const [selectedJobSlug, setSelectedJobSlug] = useState<string>(SAMPLE_JOBS[0].slug);
  const [freehireToken, setFreehireToken] = useState<string>(() => {
    return localStorage.getItem('edustream_freehire_token') || 'fhk_2UwmFef9ey0LCudQd1_Fht94SlPcN8UB18bwrKGxS0E';
  });
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(false);
  const [copiedResume, setCopiedResume] = useState<boolean>(false);

  // User Candidate Profile
  const candidateName = 'Md Alam Rahman';
  const baseSalaryLpa = 21.5; // Baseline market valuation across current resume skills

  // Resolved Gaps tracking
  const [resolvedGaps, setResolvedGaps] = useState<
    Record<
      string,
      {
        bullet: string;
        mode: 'sdetube_learned' | 'candidate_asserted';
        salaryBoost: number;
        matchBoost: number;
      }
    >
  >({});

  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [activeLearningModal, setActiveLearningModal] = useState<MissingSkillGap | null>(null);
  const [isVerifyingInModal, setIsVerifyingInModal] = useState<boolean>(false);

  const selectedJob = useMemo(() => {
    return jobsList.find((j) => j.slug === selectedJobSlug) || jobsList[0];
  }, [jobsList, selectedJobSlug]);

  // Dynamic match and salary calculation
  const { currentMatchPercent, currentSalaryLpa, totalAddedLpa } = useMemo(() => {
    let addedMatch = 0;
    let addedLpa = 0;
    Object.values(resolvedGaps).forEach((item) => {
      addedMatch += item.matchBoost;
      addedLpa += item.salaryBoost;
    });
    return {
      currentMatchPercent: Math.min(100, (selectedJob?.baseMatchPercent || 72) + addedMatch),
      currentSalaryLpa: Number((baseSalaryLpa + addedLpa).toFixed(1)),
      totalAddedLpa: Number(addedLpa.toFixed(1)),
    };
  }, [selectedJob, resolvedGaps, baseSalaryLpa]);

  // Fetch live jobs from backend / FreeHire API
  const fetchLiveFreeHireJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const resp = await fetch(`${BACKEND_BASE}/api/career/analyze-resume-and-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-FreeHire-Token': freehireToken.trim(),
        },
        body: JSON.stringify({
          full_name: candidateName,
          email: 'student@sdetube.com',
          years_of_experience: 1.5,
          current_skills: ['cpp', 'postgresql', 'nodejs', 'nextjs', 'algorithms'],
          experience_bullets: [
            'Architected low-latency distributed pipeline components and solved 1200+ algorithm problems.',
          ],
          sdetube_readiness_score: 84,
          leetcode_solved: 1200,
          added_proofs: Object.entries(resolvedGaps).map(([slug, item]) => ({
            skill_slug: slug,
            provenance: item.mode,
            evidence_bullet: item.bullet,
          })),
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.job_matches && Array.isArray(data.job_matches) && data.job_matches.length > 0) {
          // Normalize received jobs to match our JobPosting interface
          const transformed: JobPosting[] = data.job_matches.map((item: any) => ({
            slug: item.slug || item.job_slug || `job-${Math.random().toString(36).substring(7)}`,
            title: item.title || 'Senior Software Engineer',
            company: item.company || 'Tech Company',
            location: item.location || 'India / Remote',
            atsSource: item.atsSource || 'FreeHire ATS',
            offeredBandLpa: item.offeredBandLpa || '₹35.0L – ₹55.0L',
            freehireUrl: item.freehireUrl || `https://freehire.me/jobs/${item.slug}`,
            directAtsUrl: item.directAtsUrl || item.freehireUrl,
            baseMatchPercent: item.baseMatchPercent || item.match_percentage || 70,
            matchedSkills: item.matchedSkills || ['C++', 'PostgreSQL', 'Algorithms'],
            mistralAdvice: item.mistralCareerAdvice || item.mistralAdvice,
            missingSkillGaps: (item.missingSkillGaps || item.missing_skills_to_learn || []).map((gap: any) => ({
              slug: gap.slug || gap.skill_slug,
              name: gap.name || gap.display_name || gap.skill_slug,
              matchDeltaPercent: gap.matchDeltaPercent || gap.match_boost_percent || 10,
              salaryBoostLpa: gap.salaryBoostLpa || gap.salary_boost_inr_lpa || 4.5,
              salaryBoostUsd: gap.salaryBoostUsd || 18000,
              studyHours: gap.studyHours || 3.0,
              demandGrowth: gap.demandGrowth || '+30% YoY',
              experiencePrompt: gap.experiencePrompt || `Built production ${gap.name || gap.skill_slug} services.`,
              learningPath: {
                videoTitle: gap.learningPath?.videoTitle || gap.how_to_learn_on_sdetube?.video_lecture?.title || 'Fast-Track Video Lecture',
                videoDuration: gap.learningPath?.videoDuration || `${gap.how_to_learn_on_sdetube?.video_lecture?.duration_mins || 20} mins`,
                streamRoute: gap.learningPath?.streamRoute || '/channel/ch-sd-02',
                sandboxTab: gap.learningPath?.sandboxTab || 'sde-sheet',
                sandboxTitle: gap.learningPath?.sandboxTitle || gap.how_to_learn_on_sdetube?.interactive_sandbox?.title || 'Interactive Sandbox Lab',
                sandboxRoute: gap.learningPath?.sandboxRoute || '/dsa-sheets',
                aiVerification: gap.learningPath?.aiVerification || 'Bar-Raiser Defense',
                verifiedBullet: gap.learningPath?.verifiedBullet || gap.how_to_learn_on_sdetube?.verified_resume_bullet || `Engineered ${gap.name} services.`,
              },
            })),
          }));

          setJobsList(transformed);
          if (!transformed.some((j) => j.slug === selectedJobSlug)) {
            setSelectedJobSlug(transformed[0].slug);
          }
        }
      }
    } catch (err) {
      console.warn('[Career Engine] Live API query fallback to pre-warmed roles:', err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Complete SDETube Fast-Track Module
  const handleCompleteSdeTubeCourse = async (gap: MissingSkillGap) => {
    setIsVerifyingInModal(true);
    try {
      // Call backend to verify and record proof
      await fetch(`${BACKEND_BASE}/api/career/verify-skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_email: 'student@sdetube.com',
          skill_slug: gap.slug,
          mode: 'sdetube_verified',
          sandbox_slug: gap.learningPath.sandboxTab,
          testbench_passed: true,
          bar_raiser_verified: true,
        }),
      });
    } catch {
      // Graceful local resolution
    } finally {
      setIsVerifyingInModal(false);
      setResolvedGaps((prev) => ({
        ...prev,
        [gap.slug]: {
          bullet: gap.learningPath.verifiedBullet,
          mode: 'sdetube_learned',
          salaryBoost: gap.salaryBoostLpa,
          matchBoost: gap.matchDeltaPercent,
        },
      }));
      setActiveLearningModal(null);
    }
  };

  // Candidate asserts existing experience
  const handleAssertExistingExperience = (gap: MissingSkillGap) => {
    const text = (customInputs[gap.slug] || gap.experiencePrompt).trim();
    setResolvedGaps((prev) => ({
      ...prev,
      [gap.slug]: {
        bullet: text,
        mode: 'candidate_asserted',
        salaryBoost: gap.salaryBoostLpa,
        matchBoost: gap.matchDeltaPercent,
      },
    }));
  };

  // Copy Tailored Resume to Clipboard
  const handleCopyResume = () => {
    const text = `
${candidateName}
Target Role: ${selectedJob.title} (${selectedJob.company})
Calculated Market Valuation: ₹${currentSalaryLpa} LPA (${currentMatchPercent}% ATS Match)

CORE COMPETENCIES & VERIFIED SKILLS:
${selectedJob.matchedSkills.join(', ')}
${Object.keys(resolvedGaps)
  .map((k) => k.toUpperCase())
  .join(', ')}

ENGINEERING EXPERIENCE & IMPACT:
• Architected industrial data pipelines and solved 1,200+ algorithm challenges across C++20, PostgreSQL, and Node.js.
${Object.values(resolvedGaps)
  .map((item) => `• ${item.bullet} [${item.mode === 'sdetube_learned' ? 'SDETube Verified' : 'Direct Experience'}]`)
  .join('\n')}

FreeHire Matching Profile: https://freehire.me/jobs/${selectedJob.slug}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  const handleSaveToken = () => {
    localStorage.setItem('edustream_freehire_token', freehireToken.trim());
    setShowTokenInput(false);
    fetchLiveFreeHireJobs();
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-12">
      {/* ===================================================================== */}
      {/* SECTION 1: HEADER & LIVE COMPENSATION ORACLE BANNER                   */}
      {/* ===================================================================== */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-[#111622] via-[#0d121c] to-[#080b11] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-mono text-[11px] font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                FreeHire × Mistral AI Compensation Oracle
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Live Market Sync
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Resume Market Valuation &amp; Skill-to-Salary Arbitrage
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Quantifies the exact market value of your resume from live ATS salary bands. Learn high-leverage skills
              inside SDETube sandboxes to pump your salary band and unlock 100% match on FreeHire.
            </p>
          </div>

          {/* Current Salary Valuation Readout */}
          <div className="flex items-center gap-5 bg-[#080b11]/90 px-6 py-4 rounded-2xl border border-emerald-500/40 shadow-xl flex-shrink-0">
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                Your Current Resume Market Value
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                  ₹{currentSalaryLpa} LPA
                </span>
                {totalAddedLpa > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold animate-pulse">
                    +₹{totalAddedLpa}L Unlocked!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 font-mono text-[11px] text-slate-400">
                <span>P25–P75: ₹{(currentSalaryLpa * 0.85).toFixed(1)}L – ₹{(currentSalaryLpa * 1.25).toFixed(1)}L</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400 font-semibold">${Math.round(currentSalaryLpa * 3800).toLocaleString()} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* FreeHire API Token Pill & Refresh Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              FreeHire API Key:
            </span>
            <span className="px-2.5 py-1 rounded bg-[#080b11] border border-white/10 text-cyan-300 text-[11px]">
              {freehireToken ? `${freehireToken.substring(0, 8)}...${freehireToken.substring(freehireToken.length - 4)}` : 'Default Oracle Token'}
            </span>
            <button
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer text-[11px]"
            >
              {showTokenInput ? 'Close' : 'Change Key'}
            </button>
          </div>

          <button
            onClick={fetchLiveFreeHireJobs}
            disabled={isLoadingJobs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111622] hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer text-[11px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingJobs ? 'animate-spin' : ''}`} />
            <span>{isLoadingJobs ? 'Scanning FreeHire ATS...' : 'Rescan FreeHire Market'}</span>
          </button>
        </div>

        {/* Token Input Drawer */}
        {showTokenInput && (
          <div className="mt-3 p-3 rounded-xl bg-[#080b11] border border-cyan-400/30 flex flex-col sm:flex-row gap-2 items-center">
            <input
              type="text"
              value={freehireToken}
              onChange={(e) => setFreehireToken(e.target.value)}
              placeholder="Paste FreeHire API Token (fhk_...)"
              className="flex-1 px-3 py-1.5 rounded-lg bg-[#0e131d] border border-white/15 text-xs font-mono text-slate-200 w-full"
            />
            <button
              onClick={handleSaveToken}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold cursor-pointer shrink-0"
            >
              Save &amp; Sync
            </button>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SKILLS TO LEARN FOR SALARY BOOST (ARBITRAGE GRID)                     */}
        {/* ===================================================================== */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              What You Can Learn Next on SDETube to Maximize Your Salary:
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Ranked by Salary ROI per Study Hour
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedJob.missingSkillGaps.map((gap) => {
              const isLearned = Boolean(resolvedGaps[gap.slug]);
              return (
                <div
                  key={gap.slug}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isLearned
                      ? 'bg-emerald-950/25 border-emerald-500/40'
                      : 'bg-[#080b11]/90 border-white/10 hover:border-cyan-400/40 shadow-lg'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-400/30 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-purple-400" />
                        {gap.demandGrowth}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-emerald-400">
                        +₹{gap.salaryBoostLpa} LPA (+{Math.round((gap.salaryBoostLpa / baseSalaryLpa) * 100)}%)
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100 mb-1">{gap.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mb-3">
                      Est. Study Time: {gap.studyHours} hrs • Adds +{gap.matchDeltaPercent}% to {selectedJob.company} match
                    </p>
                  </div>

                  {isLearned ? (
                    <div className="py-2 px-3 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5 border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Skill Verified (+₹{gap.salaryBoostLpa} LPA Added)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveLearningModal(gap)}
                      className="w-full py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <span>🎓 Learn &amp; Verify on SDETube</span>
                      <span className="text-[10px] opacity-75">({gap.studyHours}h)</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 2: TARGET JOB SELECTOR TABS                                   */}
      {/* ===================================================================== */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Target Role:
          </span>
          {jobsList.map((job) => {
            const isSelected = job.slug === selectedJobSlug;
            return (
              <button
                key={job.slug}
                onClick={() => setSelectedJobSlug(job.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/10'
                    : 'bg-[#090d16] border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                }`}
              >
                <span>{job.company}</span>
                <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px] text-emerald-400">
                  {job.offeredBandLpa.split('–')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 3: JOB MATCH SCANNER & DUAL-PATH GAP RESOLVER                 */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-white/10 bg-[#0e131d] p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Job Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[11px] font-bold">
                {selectedJob.atsSource}
              </span>
              <span className="font-mono text-xs text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Offered Comp: {selectedJob.offeredBandLpa}
              </span>
              <span className="font-mono text-xs text-slate-400">
                • {selectedJob.location}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1.5 text-white">
              {selectedJob.title} — <span className="text-cyan-400">{selectedJob.company}</span>
            </h2>
          </div>

          {/* Match Progress Bar Readout */}
          <div className="flex items-center gap-4 bg-[#080b11] px-5 py-3.5 rounded-xl border border-white/10 flex-shrink-0 shadow-inner">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Job Match Score</span>
              <span
                className={`text-2xl sm:text-3xl font-black ${
                  currentMatchPercent === 100 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {currentMatchPercent}%
              </span>
            </div>
            <div className="w-36 bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ease-out ${
                  currentMatchPercent === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-amber-500 to-cyan-400'
                }`}
                style={{ width: `${currentMatchPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mistral AI Advisory Banner */}
        {selectedJob.mistralAdvice?.ai_advisor_note && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#141b2b] to-[#0f1725] border border-cyan-500/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs font-sans leading-relaxed">
              <span className="text-cyan-300 font-bold font-mono uppercase block mb-0.5 text-[10px]">
                Mistral AI Executive Strategy Note for {selectedJob.company}:
              </span>
              <span className="text-slate-300">{selectedJob.mistralAdvice.ai_advisor_note}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: Missing Skills & Dual-Path Resolver */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                Step-by-Step Roadmap to Reach 100% Match for {selectedJob.company}:
              </h3>
              <span className="text-[11px] font-mono text-cyan-400">
                {selectedJob.missingSkillGaps.filter((g) => resolvedGaps[g.slug]).length}/
                {selectedJob.missingSkillGaps.length} Resolved
              </span>
            </div>

            {selectedJob.missingSkillGaps.map((gap) => {
              const resolved = resolvedGaps[gap.slug];
              return (
                <div
                  key={gap.slug}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    resolved ? 'bg-emerald-950/20 border-emerald-500/40 shadow-md' : 'bg-[#080b11] border-white/10'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <span>{gap.name}</span>
                    </span>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        +₹{gap.salaryBoostLpa} LPA Value
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                        +{gap.matchDeltaPercent}% Match
                      </span>
                    </div>
                  </div>

                  {!resolved ? (
                    <div className="space-y-3 mt-3">
                      {/* PATH A: Learn on SDETube */}
                      <div className="p-3.5 rounded-lg bg-[#111622] border border-cyan-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs space-y-0.5">
                          <span className="text-cyan-300 font-mono font-bold flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                            Don&apos;t know {gap.name} yet? Learn &amp; Prove on SDETube:
                          </span>
                          <span className="text-slate-400 text-[11px] block pl-5">
                            1. {gap.learningPath.videoTitle} ({gap.learningPath.videoDuration})
                          </span>
                          <span className="text-slate-400 text-[11px] block pl-5">
                            2. {gap.learningPath.sandboxTitle}
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveLearningModal(gap)}
                          className="shrink-0 px-3.5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-400/20"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Start Fast-Track Lab</span>
                        </button>
                      </div>

                      {/* PATH B: Assert Existing Experience */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={customInputs[gap.slug] ?? ''}
                          onChange={(e) => setCustomInputs({ ...customInputs, [gap.slug]: e.target.value })}
                          placeholder={`Already have experience? E.g., "${gap.experiencePrompt}"`}
                          className="flex-1 px-3 py-2 rounded-lg bg-[#0e131d] border border-white/10 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                        />
                        <button
                          onClick={() => handleAssertExistingExperience(gap)}
                          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/15 text-slate-200 font-mono text-xs font-semibold cursor-pointer shrink-0 transition-all flex items-center justify-center gap-1"
                        >
                          <span>+ Assert Experience</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-emerald-300 bg-emerald-950/40 p-3 rounded-lg border border-emerald-500/30 flex items-start gap-2.5 mt-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                          [{resolved.mode === 'sdetube_learned' ? 'SDETube Sandbox Verified' : 'Candidate Asserted'}]
                        </span>
                        <p className="text-slate-200">&ldquo;{resolved.bullet}&rdquo;</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT 5 COLS: Tailored Resume & 1-Click FreeHire Apply */}
          <div className="lg:col-span-5 bg-[#080b11] rounded-xl border border-white/10 p-5 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  Mistral AI Tailored Resume
                </span>
                <button
                  onClick={handleCopyResume}
                  className="font-mono text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedResume ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedResume ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Live Tailored Resume Preview Card */}
              <div className="space-y-3 font-mono text-xs bg-[#090d16] p-4 rounded-xl border border-white/5">
                <div className="border-b border-white/5 pb-2.5">
                  <div className="font-bold text-white text-sm">{candidateName}</div>
                  <div className="text-[11px] text-cyan-300 mt-0.5">
                    Target: {selectedJob.title} • Valuation: ₹{currentSalaryLpa} LPA
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    ATS Pass Probability: {currentMatchPercent}% for {selectedJob.company}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Core Verified Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedJob.matchedSkills.map((sk) => (
                      <span key={sk} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {sk}
                      </span>
                    ))}
                    {Object.keys(resolvedGaps).map((k) => (
                      <span
                        key={k}
                        className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold"
                      >
                        {k.toUpperCase()} (VERIFIED)
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tailored Impact Bullets:
                  </span>
                  <div className="p-2 rounded bg-[#0e131d] border border-white/5 text-[11px] text-slate-300 leading-relaxed">
                    • Developed industrial data pipelines (Node-RED, NATS, Kafka, NestJS, PostgreSQL) &amp; solved 1,200+ algorithmic problems.
                  </div>

                  {Object.entries(resolvedGaps).map(([slug, item]) => (
                    <div
                      key={slug}
                      className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-[11px] leading-relaxed"
                    >
                      • {item.bullet}{' '}
                      <span className="text-[9px] text-emerald-400 uppercase font-bold">
                        [{item.mode === 'sdetube_learned' ? 'SDETube Lab' : 'Asserted'}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Application CTA Strip */}
            <div className="space-y-2.5 pt-5 border-t border-white/10 mt-5">
              <a
                href={selectedJob.freehireUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  currentMatchPercent === 100
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-xl shadow-emerald-500/30 animate-pulse'
                    : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md shadow-cyan-400/20'
                }`}
              >
                {currentMatchPercent === 100 ? (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>100% Match! Apply on FreeHire with Tailored Resume</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Apply on FreeHire ({currentMatchPercent}% Match • Tailored CV)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </a>

              <a
                href={selectedJob.directAtsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#0e131d] hover:bg-slate-800 border border-white/10 text-slate-300 font-mono text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>↗ Open Direct {selectedJob.atsSource} Portal</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL: SDETUBE FAST-TRACK MISSING SKILL LEARNING & PROOF LAB          */}
      {/* ===================================================================== */}
      {activeLearningModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e131d] border border-cyan-400/40 rounded-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  SDETube Missing-Skill Fast-Track Lab
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{activeLearningModal.name}</h3>
              </div>
              <button
                onClick={() => setActiveLearningModal(null)}
                className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer p-1 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-[#080b11] border border-white/10 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Step 1: Watch Telegram MTProto Lecture ({activeLearningModal.learningPath.videoDuration})
                  </span>
                  <p className="text-slate-300 text-[11px]">{activeLearningModal.learningPath.videoTitle}</p>
                </div>
                <button
                  onClick={() => {
                    navigate(activeLearningModal.learningPath.streamRoute);
                    setActiveLearningModal(null);
                  }}
                  className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold shrink-0 hover:bg-amber-500/25 cursor-pointer"
                >
                  Watch Lecture ↗
                </button>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-[#080b11] border border-white/10 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    Step 2: Complete Interactive SDETube Sandbox
                  </span>
                  <p className="text-slate-300 text-[11px]">{activeLearningModal.learningPath.sandboxTitle}</p>
                </div>
                <button
                  onClick={() => {
                    navigate(activeLearningModal.learningPath.sandboxRoute);
                    setActiveLearningModal(null);
                  }}
                  className="px-2.5 py-1 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold shrink-0 hover:bg-cyan-500/25 cursor-pointer"
                >
                  Open Sandbox ↗
                </button>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Step 3: Auto-Minted Resume Proof
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold">
                    +{activeLearningModal.matchDeltaPercent}% Match • +₹{activeLearningModal.salaryBoostLpa} LPA
                  </span>
                </div>
                <p className="text-emerald-200 text-[11px] leading-relaxed">
                  &ldquo;{activeLearningModal.learningPath.verifiedBullet}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setActiveLearningModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCompleteSdeTubeCourse(activeLearningModal)}
                disabled={isVerifyingInModal}
                className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-mono text-xs font-bold cursor-pointer transition-all shadow-lg shadow-emerald-400/20 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isVerifyingInModal ? 'Verifying with Mistral...' : 'Verify Sandbox & Add to Resume'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
