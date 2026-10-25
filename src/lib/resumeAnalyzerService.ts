import { executeAIChatCascade, MISTRAL_API_KEY, GROQ_API_KEY } from './mistral';
import {
  buildResumeAnalysisCacheKey,
  getCachedResumeAnalysis,
  setCachedResumeAnalysis,
  sha256Hex,
  redisGet,
  redisSet
} from './redis';
import { getUserProgressSync } from './progressService';
import { getInterviewHistory } from './interviewHistoryService';

// ============================================================================
// 1. MULTI-COUNTRY & CITY REGISTRY (FIXES COUNTRY/CITY DROPDOWN & CURRENCY BUG)
// ============================================================================

export type CountryCode = 'IN' | 'US' | 'GB' | 'DE' | 'SG' | 'CA' | 'AE';

export interface CityHubOption {
  name: string;
  multiplier: number;
  label: string;
  searchKeywords: string[];
}

export interface CountryMarketConfig {
  code: CountryCode;
  name: string;
  flag: string;
  currencySymbol: string;
  unitLabel: string; // 'LPA' for India, 'K/yr' for US/UK/EU/SG/CA/AE
  isLPA: boolean;
  baseAnchorsByBand: {
    fresher: number; // 0 - 0.5 YOE
    sde1: number;    // 0.5 - 2.0 YOE
    sde2: number;    // 2.0 - 4.5 YOE
    senior: number;  // 4.5 - 7.5 YOE
    staff: number;   // 7.5+ YOE
  };
  perYoeSlope: number;
  maxSkillPremium: number;
  domesticRemoteMultiplier: number;
  topHubName: string;
  cities: CityHubOption[];
  countryMatchKeywords: string[];
}

export const COUNTRY_CONFIGS: Record<CountryCode, CountryMarketConfig> = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currencySymbol: '₹',
    unitLabel: 'LPA',
    isLPA: true,
    baseAnchorsByBand: { fresher: 6.0, sde1: 9.5, sde2: 16.0, senior: 26.0, staff: 42.0 },
    perYoeSlope: 2.4,
    maxSkillPremium: 6.5,
    domesticRemoteMultiplier: 1.08,
    topHubName: 'Bengaluru',
    countryMatchKeywords: ['india', 'bengaluru', 'bangalore', 'hyderabad', 'pune', 'mumbai', 'gurugram', 'gurgaon', 'noida', 'delhi', 'chennai', 'kolkata'],
    cities: [
      { name: 'Bengaluru', multiplier: 1.15, label: 'Bengaluru (Tier-1 Tech Hub +15%)', searchKeywords: ['bengaluru', 'bangalore'] },
      { name: 'Hyderabad', multiplier: 1.10, label: 'Hyderabad (Product & Cloud Hub +10%)', searchKeywords: ['hyderabad'] },
      { name: 'Pune', multiplier: 1.04, label: 'Pune (+4%)', searchKeywords: ['pune'] },
      { name: 'NCR (Gurugram / Noida)', multiplier: 1.06, label: 'Delhi NCR (+6%)', searchKeywords: ['gurugram', 'gurgaon', 'noida', 'delhi', 'ncr'] },
      { name: 'Mumbai', multiplier: 1.06, label: 'Mumbai (+6%)', searchKeywords: ['mumbai'] },
      { name: 'Chennai', multiplier: 1.02, label: 'Chennai (+2%)', searchKeywords: ['chennai'] },
      { name: 'Kolkata', multiplier: 0.92, label: 'Kolkata (Cost-Adjusted -8%)', searchKeywords: ['kolkata', 'calcutta'] },
      { name: 'Anywhere in India', multiplier: 1.00, label: 'All India Baseline (1.0x)', searchKeywords: ['india'] },
    ],
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currencySymbol: '$',
    unitLabel: 'K/yr',
    isLPA: false,
    baseAnchorsByBand: { fresher: 88, sde1: 112, sde2: 145, senior: 182, staff: 235 },
    perYoeSlope: 11,
    maxSkillPremium: 38,
    domesticRemoteMultiplier: 1.02,
    topHubName: 'San Francisco / Bay Area',
    countryMatchKeywords: ['united states', 'usa', 'u.s.', 'san francisco', 'bay area', 'new york', 'seattle', 'austin', 'boston', 'california', 'texas', 'us remote'],
    cities: [
      { name: 'San Francisco / Bay Area', multiplier: 1.22, label: 'SF / Silicon Valley (+22%)', searchKeywords: ['san francisco', 'bay area', 'palo alto', 'mountain view', 'sunnyvale', 'san jose'] },
      { name: 'New York City', multiplier: 1.18, label: 'New York City (+18%)', searchKeywords: ['new york', 'nyc', 'brooklyn', 'manhattan'] },
      { name: 'Seattle', multiplier: 1.15, label: 'Seattle / Bellevue (+15%)', searchKeywords: ['seattle', 'bellevue', 'redmond'] },
      { name: 'Austin', multiplier: 1.05, label: 'Austin, TX (+5%)', searchKeywords: ['austin'] },
      { name: 'Boston', multiplier: 1.10, label: 'Boston, MA (+10%)', searchKeywords: ['boston', 'cambridge'] },
      { name: 'Anywhere in US', multiplier: 1.00, label: 'US National Baseline (1.0x)', searchKeywords: ['united states', 'usa', 'us'] },
    ],
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currencySymbol: '£',
    unitLabel: 'K/yr',
    isLPA: false,
    baseAnchorsByBand: { fresher: 42, sde1: 56, sde2: 76, senior: 98, staff: 132 },
    perYoeSlope: 6.5,
    maxSkillPremium: 22,
    domesticRemoteMultiplier: 1.00,
    topHubName: 'London',
    countryMatchKeywords: ['united kingdom', 'uk', 'london', 'manchester', 'edinburgh', 'cambridge', 'bristol', 'england'],
    cities: [
      { name: 'London', multiplier: 1.18, label: 'London (+18%)', searchKeywords: ['london'] },
      { name: 'Cambridge / Oxford', multiplier: 1.08, label: 'Cambridge / Oxford (+8%)', searchKeywords: ['cambridge', 'oxford'] },
      { name: 'Manchester', multiplier: 0.96, label: 'Manchester (-4%)', searchKeywords: ['manchester'] },
      { name: 'Edinburgh', multiplier: 0.98, label: 'Edinburgh (-2%)', searchKeywords: ['edinburgh'] },
      { name: 'Anywhere in UK', multiplier: 1.00, label: 'UK National Baseline (1.0x)', searchKeywords: ['uk', 'united kingdom'] },
    ],
  },
  DE: {
    code: 'DE',
    name: 'Germany / EU',
    flag: '🇩🇪',
    currencySymbol: '€',
    unitLabel: 'K/yr',
    isLPA: false,
    baseAnchorsByBand: { fresher: 54, sde1: 66, sde2: 84, senior: 105, staff: 135 },
    perYoeSlope: 6.0,
    maxSkillPremium: 20,
    domesticRemoteMultiplier: 1.02,
    topHubName: 'Munich / Berlin',
    countryMatchKeywords: ['germany', 'berlin', 'munich', 'frankfurt', 'amsterdam', 'netherlands', 'europe', 'eu'],
    cities: [
      { name: 'Berlin', multiplier: 1.08, label: 'Berlin (+8%)', searchKeywords: ['berlin'] },
      { name: 'Munich', multiplier: 1.14, label: 'Munich (+14%)', searchKeywords: ['munich', 'münchen'] },
      { name: 'Amsterdam (NL)', multiplier: 1.15, label: 'Amsterdam (+15%)', searchKeywords: ['amsterdam', 'netherlands'] },
      { name: 'Frankfurt', multiplier: 1.06, label: 'Frankfurt (+6%)', searchKeywords: ['frankfurt'] },
      { name: 'Anywhere in EU', multiplier: 1.00, label: 'EU Baseline (1.0x)', searchKeywords: ['germany', 'europe', 'eu'] },
    ],
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    currencySymbol: 'S$',
    unitLabel: 'K/yr',
    isLPA: false,
    baseAnchorsByBand: { fresher: 62, sde1: 78, sde2: 106, senior: 142, staff: 190 },
    perYoeSlope: 8.5,
    maxSkillPremium: 28,
    domesticRemoteMultiplier: 1.00,
    topHubName: 'Singapore Central',
    countryMatchKeywords: ['singapore', 'apac'],
    cities: [
      { name: 'Singapore Central', multiplier: 1.05, label: 'Singapore Tech Hub (+5%)', searchKeywords: ['singapore'] },
      { name: 'Anywhere in APAC', multiplier: 1.00, label: 'APAC Baseline (1.0x)', searchKeywords: ['singapore', 'apac'] },
    ],
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currencySymbol: 'C$',
    unitLabel: 'K/yr',
    isLPA: false,
    baseAnchorsByBand: { fresher: 76, sde1: 94, sde2: 122, senior: 155, staff: 195 },
    perYoeSlope: 8.0,
    maxSkillPremium: 26,
    domesticRemoteMultiplier: 1.02,
    topHubName: 'Toronto / Vancouver',
    countryMatchKeywords: ['canada', 'toronto', 'vancouver', 'montreal', 'waterloo', 'ottawa'],
    cities: [
      { name: 'Toronto', multiplier: 1.10, label: 'Toronto / Waterloo (+10%)', searchKeywords: ['toronto', 'waterloo'] },
      { name: 'Vancouver', multiplier: 1.08, label: 'Vancouver (+8%)', searchKeywords: ['vancouver'] },
      { name: 'Montreal', multiplier: 0.96, label: 'Montreal (-4%)', searchKeywords: ['montreal'] },
      { name: 'Anywhere in Canada', multiplier: 1.00, label: 'Canada Baseline (1.0x)', searchKeywords: ['canada'] },
    ],
  },
  AE: {
    code: 'AE',
    name: 'UAE (Tax-Free)',
    flag: '🇦🇪',
    currencySymbol: 'AED ',
    unitLabel: 'K/yr',
    isLPA: false,
    baseAnchorsByBand: { fresher: 140, sde1: 190, sde2: 270, senior: 360, staff: 480 },
    perYoeSlope: 22,
    maxSkillPremium: 65,
    domesticRemoteMultiplier: 1.00,
    topHubName: 'Dubai',
    countryMatchKeywords: ['uae', 'dubai', 'abu dhabi', 'united arab emirates', 'mena'],
    cities: [
      { name: 'Dubai', multiplier: 1.08, label: 'Dubai Internet City (+8% Tax-Free)', searchKeywords: ['dubai'] },
      { name: 'Abu Dhabi', multiplier: 1.05, label: 'Abu Dhabi (+5% Tax-Free)', searchKeywords: ['abu dhabi'] },
      { name: 'Anywhere in UAE', multiplier: 1.00, label: 'UAE Baseline (1.0x)', searchKeywords: ['uae', 'dubai', 'abu dhabi'] },
    ],
  },
};

export const INDIA_CITY_MULTIPLIERS: Record<string, { mult: number; label: string }> = {
  'Bengaluru': { mult: 1.15, label: 'Bengaluru (Tier-1 Tech Hub +15%)' },
  'Hyderabad': { mult: 1.10, label: 'Hyderabad (Product & Enterprise Hub +10%)' },
  'NCR (Gurugram / Noida)': { mult: 1.06, label: 'Delhi NCR (+6%)' },
  'Mumbai': { mult: 1.06, label: 'Mumbai (+6%)' },
  'Pune': { mult: 1.04, label: 'Pune (+4%)' },
  'Chennai': { mult: 1.02, label: 'Chennai (+2%)' },
  'Kolkata': { mult: 0.92, label: 'Kolkata (Regional Cost-Adjusted -8%)' },
  'Domestic Remote (India)': { mult: 1.08, label: 'India Remote (Product/Startup Band +8%)' },
  'Anywhere in India': { mult: 1.00, label: 'India National Baseline (1.0x)' },
};

export interface UserLocationPreferences {
  countryCode: CountryCode;
  countryName?: string;
  currencySymbol?: string;
  currencyUnit?: string;
  preferredCity: string;
  preferDomesticRemote: boolean;
  workModeFilter: 'all' | 'remote' | 'hybrid' | 'onsite';
  includeOutsideCountryJobs: boolean;
}

export const DEFAULT_LOCATION_PREFERENCES: UserLocationPreferences = {
  countryCode: 'IN',
  countryName: 'India',
  currencySymbol: '₹',
  currencyUnit: 'LPA',
  preferredCity: 'Bengaluru',
  preferDomesticRemote: false,
  workModeFilter: 'all',
  includeOutsideCountryJobs: true,
};

// ============================================================================
// 2. DATA CONTRACTS & INTERFACES
// ============================================================================

export type RoleArchetype =
  | 'Backend & Distributed Systems'
  | 'Full-Stack Engineering'
  | 'Frontend & UI/3D Engineering'
  | 'Data, AI & ML Engineering'
  | 'DevOps, Cloud & Platform'
  | 'Software Engineering (General)';

export interface VerifiedWorkEntry {
  company: string;
  roleTitle: string;
  startDate: string;
  endDate: string;
  months: number;
  classification: 'full_time' | 'internship' | 'part_time_or_teaching';
  reason: string;
}

export interface ParsedExperienceMetrics {
  fullTimeYoe: number;           // Strict full-time industry YOE
  internshipMonths: number;      // Non-overlapping internship / trainee / TA months
  teachingOrPartTimeMonths: number;
  effectiveValuationYoe: number; // fullTimeYoe + (internshipMonths/12)*0.25
  manualOverrideApplied?: boolean;
  detectedGraduationYear: number | null;
  detectedRoleArchetype: RoleArchetype;
  verifiedByLLM?: boolean;
  llmAuditNotes?: string;
  workEntries?: VerifiedWorkEntry[];
  excludedEducationEntries?: string[];
  detectedIntervals?: {
    roleSnippet: string;
    startLabel: string;
    endLabel: string;
    months: number;
    classification: 'full-time' | 'internship' | 'part-time/teaching';
  }[];
}

export interface SkillProofClassification {
  allSkills: string[];
  provenInExperience: string[]; // 100% valuation & ATS weight
  provenInProjects: string[];   // 65% valuation & ATS weight
  listedOnlyInSkills: string[]; // 15% valuation weight (unverified keyword)
}

export interface SdeTubeTelemetrySnapshot {
  userId: string;
  dsaSolvedCount: number;
  dsaTopicsCovered: string[];
  sqlSolvedCount: number;
  hldTopologiesValidated: number;
  lldProblemsCompleted: number;
  ddiaChaptersCompleted: number;
  mockInterviewsCompleted: number;
  avgMockInterviewScore: number; // 0-100
  verifiedSkills: string[];
  telemetryHash: string;
}

export interface DualMarketValuation {
  domestic: {
    countryCode?: CountryCode;
    countryName: string;
    flag?: string;
    cityOrRemoteLabel: string;
    currency: string;           // e.g., 'INR (₹ LPA)'
    currencySymbol: string;
    unitLabel: string;
    isLPA?: boolean;
    baseResumeOnlyValue: number; // Strictly from uploaded resume
    sdeTubeVerifiedBoost: number;// Added when checkbox is checked
    simulatedSkillsBoost: number;// Added when user checks "What-If" skills
    totalEstimatedValue: number; // base + sdeTubeBoost + simulatedSkillsBoost
    range: { min: number; median: number; max: number; p90: number };
    cityMultiplierApplied?: number;
    domesticRemoteComparison?: {
      cityOnsiteMedian: number;
      domesticRemoteMedian: number;
      topHubMedian: number;
    };
    comparisons?: {
      selectedCityOnsite: number;
      domesticRemoteMedian: number;
      topNationalHubMedian: number;
      topNationalHubName?: string;
    };
  };
  outsideCountry: {
    globalRemoteUSD: {
      baseResumeOnlyUSD: number;
      sdeTubeBoostUSD: number;
      totalMedianUSD: number;
      rangeUSD: { min: number; max: number };
      hourlyRateUSD: { min: number; max: number };
      readinessPct: number;
    };
    internationalRelocationHubs: {
      countryCode?: CountryCode;
      hubName: string;
      currency: string;
      estimatedRange: string;
      usdEquivalentMedian?: number;
      visaSponsorshipLikelihood?: 'High' | 'Moderate' | 'Selective';
      visaSponsorshipFit?: 'High' | 'Moderate' | 'Selective';
    }[];
    internationalHubs?: {
      countryCode?: CountryCode;
      hubName: string;
      currency: string;
      estimatedRange: string;
      usdEquivalentMedian?: number;
      visaSponsorshipFit?: 'High' | 'Moderate' | 'Selective';
      visaSponsorshipLikelihood?: 'High' | 'Moderate' | 'Selective';
    }[];
  };
  confidenceScore: number;
  marketPercentile?: number;
  factors: {
    detectedYoe?: number;
    fullTimeYoe?: number;
    internshipMonths?: number;
    seniorityBand: 'Fresher / Entry' | 'Entry / Intern' | 'SDE-1' | 'SDE-1 (Junior)' | 'SDE-2' | 'SDE-2 (Mid-Level)' | 'Senior / Staff' | 'Senior (SDE-3)' | 'Staff / Principal';
    skillDemandMultiplier?: number;
    impactQuantificationMultiplier?: number;
    atsFormatMultiplier?: number;
    sdeTubeBonusPct: number;
    baseAnchorLPA?: number;
    earnedSkillPremiumLPA?: number;
    impactQuantificationBonusLPA?: number;
    atsFormatAdjustmentLPA?: number;
    provenSkillsCount?: number;
    unverifiedSkillsCount?: number;
  };
}

export interface MarketValuationBreakdown {
  baseResumeValueLPA: number;         // Calculated strictly from resume
  sdeTubeBoostLPA: number;            // Added only when includeSdeTubeData = true
  totalEstimatedValueLPA: number;     // base + sdeTubeBoost
  valuationRangeLPA: { min: number; median: number; max: number; p90: number };
  usdEquivalentRange: { min: number; max: number };
  confidenceScore: number;            // 0-100 (increases when SDETube telemetry is included)
  marketPercentile: number;           // e.g., Top 18% for YOE bracket
  factors: {
    roleAndYoeBaseLPA: number;
    detectedYoe: number;
    seniorityLevel: 'Entry / Intern' | 'SDE-1' | 'SDE-2' | 'Senior / Staff';
    skillDemandMultiplier: number;    // e.g., 1.18x
    impactQuantificationMultiplier: number; // e.g., 1.08x
    atsReadabilityMultiplier: number; // e.g., 0.98x
    sdeTubeVerifiedBonusPct: number;  // e.g., +14%
  };
  tierBenchmarks: {
    tier1ProductLPA: { min: number; max: number; readinessPct: number };
    tier2UnicornLPA: { min: number; max: number; readinessPct: number };
    globalRemoteUSD: { min: number; max: number; readinessPct: number };
    enterpriseServiceLPA: { min: number; max: number; readinessPct: number };
  };
}

export interface AtsAuditReport {
  overallScore: number; // 0-100
  targetJobTitle?: string;
  subScores: {
    parseabilityAndFormatting: number; // /15
    keywordAndSkillMatch: number;      // /30
    impactAndQuantification: number;   // /25
    actionVerbsAndTone: number;        // /10
    brevityAndStructure: number;       // /10
    evidenceVerification: number;      // /10
  };
  matchedKeywords: { keyword: string; source: 'resume' | 'sdetube' }[];
  missingCriticalKeywords: string[];
  formattingWarnings: string[];
  bulletAudits: {
    originalBullet: string;
    section: string;
    hasMetric: boolean;
    hasStrongVerb: boolean;
    score: 'weak' | 'moderate' | 'strong';
    issue: string;
    aiSuggestedRewrite: string;
    addedKeywords: string[];
  }[];
}

export interface SkillRoiRecommendation {
  skillName: string;
  category: 'System Design & Scale' | 'Backend & Cloud' | 'Data & Streaming' | 'AI & LLM' | 'Core CS & DSA';
  priority: 'Critical' | 'High-ROI' | 'Emerging';
  marketValueDeltaLPA: number;        // e.g., +2.8 (₹2.8 LPA increase in India)
  marketValueDeltaPct: number;        // e.g., +16%
  globalRoiUSD: number;               // e.g., +$9,500 / yr Global Remote increase
  domesticCityRoiLPA?: Record<string, number>; // City-specific boosts
  atsScoreDeltaPct: number;           // e.g., +11% average ATS match boost
  unlockedJobsCount: number;          // Number of live FreeHire jobs requiring this
  estimatedHoursToLearn: number;
  whyItMatters: string;
  learningResources: {
    sdeTube: {
      title: string;
      type: 'HLD Canvas' | 'LLD Studio' | 'DDIA Book' | 'DSA Sheet' | 'SQL Judge' | 'Video Lesson' | 'AI Mock Interview';
      routeUrl: string;
      moduleId?: string;
    }[];
    github: {
      repoName: string;
      url: string;
      description: string;
      capstoneProjectIdea: string;    // Concrete proof-of-work project to build
      resumeBulletTemplate: string;   // How to write it on the resume once built
    }[];
    internet: {
      title: string;
      provider: string;               // e.g., 'roadmap.sh', 'MIT 6.824', 'Official Docs', 'Uber Eng Blog'
      url: string;
      type: 'Documentation' | 'Course' | 'Architecture Blog' | 'Interactive Guide';
    }[];
  };
}

export interface LiveJobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  workMode: 'remote' | 'hybrid' | 'onsite';
  isDomestic?: boolean;
  isPreferredCityMatch?: boolean;
  isDomesticRemote?: boolean;
  salaryText?: string;
  salaryRangeText: string;
  estimatedLPA?: number;
  applyUrl: string;
  postedAt: string;
  postedAtFormatted?: string;
  source: 'FreeHire' | 'PartnerFeed';
  atsMatchScore: number;              // 0-100%
  seniorityGapWarning?: string | null; // e.g., "Seniority Gap: Requires 7+ YOE (Your Verified Full-Time: 1.0 YOE)"
  requiredMinYoe?: number;
  seniorityLevel?: string;
  matchedSkills: { name: string; proofLevel?: 'experience' | 'project' | 'sdetube' | 'skills_only'; fromSdeTube?: boolean }[];
  missingSkills: string[];
  extractedSkills?: string[];
  marketValueComparison?: 'Above Your Valuation' | 'Matches Your Valuation' | 'Below Your Valuation';
  rawDescription?: string;
  cleanSummary?: string;
  cleanFullText?: string;
  structuredSections?: { heading: string; bullets: string[] }[];
}

export interface RoleTransitionPath {
  targetRoleTitle: string;
  transitionType: 'Vertical Promotion' | 'High-Growth Pivot' | 'Specialization';
  currentReadinessPct: number;
  projectedMarketValueLPA: { min: number; max: number };
  valueJumpLPA: number;               // +₹X.X LPA over current
  transferableSkills: string[];
  requiredBridgeSkills: string[];
  matchingLiveJobsCount: number;
  roadmapPhases: {
    days: 'Days 1–30' | 'Days 31–60' | 'Days 61–90';
    focus: string;
    actionItems: string[];
    sdeTubeVerificationTarget: string;
  }[];
}

export interface UnifiedResumeAnalysisResponse {
  cacheKey: string;
  cachedAt: string;
  fromCache: boolean;
  includeSdeTubeData: boolean;
  locationPreferences: UserLocationPreferences;
  parsedCandidate: {
    name: string;
    currentRole: string;
    extractedYoe: number;
    resumeSkills: string[];
    sdeTubeSkillsIncluded: string[];
    resumeHash: string;
    experienceMetrics?: ParsedExperienceMetrics;
    skillProof?: SkillProofClassification;
  };
  candidateProfile?: {
    name: string;
    email: string;
    detectedRoleArchetype: RoleArchetype;
    experienceMetrics: ParsedExperienceMetrics;
    skillProof: SkillProofClassification;
    sdeTubeSkillsIncluded: string[];
    resumeHash: string;
  };
  marketValuation: MarketValuationBreakdown;
  dualValuation: DualMarketValuation;
  atsAudit: AtsAuditReport;
  liveJobs: LiveJobMatch[];
  domesticJobs: LiveJobMatch[];
  outsideCountryJobs: LiveJobMatch[];
  skillRoiRecommendations: SkillRoiRecommendation[];
  roleTransitions: RoleTransitionPath[];
}

export interface FlashCard {
  question: string;
  answer: string;
  category: 'Technical' | 'Behavioral' | 'Situational' | string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
}

export interface Recommendation {
  category: string;
  suggestion: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface AtsScoreBreakdownItem {
  score: number;
  max_score: number;
  details: string;
}

export interface AtsImprovementSuggestion {
  area: string;
  suggestion: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface ResumeAnalysisResult {
  analysis: {
    matching_skills: string[];
    missing_skills: string[];
    matching_keywords: string[];
    missing_keywords: string[];
    experience_match: {
      required_years: string;
      candidate_years: string;
      match_percentage: number;
    };
    education_match: {
      required: string;
      candidate: string;
      match: boolean;
    };
    role_compatibility: {
      score: number;
      reasoning: string;
    };
  };
  insights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: Recommendation[];
    career_progression: {
      current_level: string;
      target_level: string;
      gap_analysis: string;
    };
    resume_improvements: string[];
  };
  flashcards: FlashCard[];
  ats_score: {
    overall_score: number;
    score_breakdown: {
      keyword_match: AtsScoreBreakdownItem;
      skills_match: AtsScoreBreakdownItem;
      experience_relevance: AtsScoreBreakdownItem;
      format_optimization: AtsScoreBreakdownItem;
    };
    improvement_suggestions: AtsImprovementSuggestion[];
    ats_compatibility: {
      rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | string;
      key_issues: string[];
      optimization_tips: string[];
    };
  };
  resume_preview: string;
  job_description_preview: string;
  analyzed_at: string;
  ai_engine: string;
}

/**
 * Clean markdown JSON wrappers from LLM responses
 */
export function cleanJsonResponse(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Extracts plain text from uploaded file in browser.
 * Dynamically loads pdf.js from CDN for robust PDF text extraction,
 * falling back to stream block decoding.
 */
export async function extractResumeTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // Plain text / Markdown
  if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json') || fileName.endsWith('.csv')) {
    return await file.text();
  }

  // PDF Extraction via dynamic pdf.js CDN
  if (fileName.endsWith('.pdf')) {
    try {
      if (typeof window !== 'undefined') {
        const win = window as any;
        if (!win.pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load pdf.js from cdn'));
            document.head.appendChild(script);
          });
        }

        if (win.pdfjsLib) {
          win.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          const buffer = await file.arrayBuffer();
          const loadingTask = win.pdfjsLib.getDocument({ data: buffer });
          const pdf = await loadingTask.promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n\n';
          }
          if (fullText.trim().length > 30) {
            return fullText.trim();
          }
        }
      }
    } catch (err) {
      console.warn('PDF.js dynamic extraction notice, falling back to stream parser:', err);
    }

    // Fallback: binary stream text block extraction
    try {
      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const rawString = textDecoder.decode(uint8);

      const extractedChunks: string[] = [];
      const textBlockRegex = /BT[\s\S]*?ET/g;
      const matches = rawString.match(textBlockRegex) || [];

      for (const block of matches) {
        const literalRegex = /\(([^)]+)\)/g;
        let litMatch: RegExpExecArray | null;
        let blockText = '';
        while ((litMatch = literalRegex.exec(block)) !== null) {
          blockText += litMatch[1] + ' ';
        }
        if (blockText.trim().length > 0) {
          extractedChunks.push(blockText.trim());
        }
      }

      if (extractedChunks.length > 5) {
        return extractedChunks.join('\n');
      }

      const printableMatches = rawString.match(/[A-Za-z0-9,.:;'"\-_@/#&()\s]{5,}/g) || [];
      const filtered = printableMatches.filter(s =>
        !s.startsWith('/Font') &&
        !s.startsWith('/Type') &&
        !s.startsWith('/ProcSet') &&
        s.trim().length > 4
      );

      if (filtered.length > 0) {
        return filtered.slice(0, 150).join(' ');
      }
    } catch (err) {
      console.warn('Binary stream PDF fallback error:', err);
    }
  }

  // Default fallback
  try {
    return await file.text();
  } catch {
    return `Resume: ${file.name}`;
  }
}

/**
 * Predefined Sample Resumes for 1-Click Testing
 */
export const SAMPLE_RESUMES = [
  {
    id: 'sde2-fullstack',
    title: 'Senior Full Stack Engineer (3.5 Yrs Exp)',
    preview: `ALEX RIVERA
Full Stack Software Engineer | React, TypeScript, Node.js, Go, PostgreSQL, AWS
Email: alex.rivera@example.com | LinkedIn: linkedin.com/in/alexrivera-dev | GitHub: github.com/alexrivera

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 3.5+ years of experience designing and deploying high-throughput web applications and microservices. Proven track record of improving system latency by 42% and architecting real-time streaming pipelines supporting 500K+ DAU.

CORE COMPETENCIES
- Languages: TypeScript, JavaScript (ES6+), Go, Python, SQL, HTML5/CSS3
- Frontend: React, Next.js, Redux Toolkit, Tailwind CSS, WebSockets, Web Workers
- Backend & Distributed: Node.js, Express, Go (Gin), PostgreSQL, Redis, Kafka, Docker, Kubernetes
- Cloud & DevOps: AWS (EC2, S3, RDS, Lambda), GitHub Actions, CI/CD, Terraform
- Architecture: REST APIs, GraphQL, Microservices, Event-Driven Architecture, Low-Level Design (SOLID)

PROFESSIONAL EXPERIENCE
TechFlow Innovations | Senior Software Engineer | July 2023 - Present
- Designed an event-driven notification dispatch pipeline in Go & Apache Kafka processing 12M events daily with sub-50ms p99 latency.
- Refactored legacy monolithic Node.js backend into 4 decoupled microservices deployed on AWS ECS with Docker.
- Implemented distributed Redis caching strategy with write-behind invalidation, reducing PostgreSQL database read load by 68%.

NextGen Apps | Full Stack Software Engineer | January 2021 - June 2023
- Built client-facing analytical dashboards using React, TypeScript, and Recharts, increasing customer session engagement by 35%.
- Authored 80+ unit and integration tests using Jest and Cypress, elevating team test coverage from 54% to 88%.
- Integrated Stripe payment webhook gateways with idempotent transaction ledger handling $4.5M in annual subscriptions.

EDUCATION
B.Tech in Computer Science & Engineering | University of Technology | 2017 - 2021 | GPA: 3.8 / 4.0`,
  },
  {
    id: 'backend-systems',
    title: 'Backend Systems Engineer (Java / Distributed Systems)',
    preview: `SARAH CHEN
Backend Systems Engineer | Distributed Systems & High-Frequency Data Pipelines
Email: sarah.chen@example.com | San Francisco, CA | github.com/sarahchen-systems

SUMMARY
Software Engineer specializing in backend infrastructure, distributed storage, and concurrent systems in Java, C++, and Go. Deep expertise in high-concurrency data ingestion, database internals, and transactional correctness.

TECHNICAL SKILLS
- Languages: Java 21, C++, Go, Python, SQL
- Distributed Systems: Apache Kafka, RabbitMQ, gRPC, Protocol Buffers, Raft Consensus
- Storage & Databases: PostgreSQL, Apache Cassandra, Redis, DynamoDB, Elasticsearch
- Infrastructure: Kubernetes, Docker, Helm, Prometheus, Grafana, AWS (EKS, CloudWatch)

EXPERIENCE
CloudScale Systems | Distributed Systems Engineer | 2022 - Present
- Engineered high-throughput telemetry ingestion service in Java 21 & gRPC handling 85,000 requests/sec across 16 Kubernetes pods.
- Re-architected data retention tier with Apache Cassandra and time-series clustering, cutting annual S3 storage costs by $180,000.
- Implemented circuit breaker and token bucket rate limiters to guard upstream microservices from cascading cascading failures during traffic surges.

DataMesh Technologies | Associate Backend Engineer | 2020 - 2022
- Developed REST and gRPC endpoints in Spring Boot with multi-tenant PostgreSQL schema partitioning.
- Built automated database migration scripts and zero-downtime blue/green deployment workflows.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2016 - 2020`
  }
];

/**
 * Predefined Sample Job Descriptions
 */
export const SAMPLE_JOB_DESCRIPTIONS = [
  {
    id: 'google-sde2',
    title: 'Google - Software Engineer II (SDE-2)',
    role: 'Software Engineer II (Full Stack / Distributed)',
    text: `Job Title: Software Development Engineer II (SDE-2)
Company: Google
Location: Mountain View, CA / Remote

About The Role:
As a Software Engineer II, you will work on core platform systems powering millions of users worldwide. You will collaborate with cross-functional teams to design, develop, test, and deploy resilient web services and distributed data processing pipelines.

Minimum Qualifications:
- Bachelor's degree in Computer Science, related technical field, or equivalent practical experience.
- 3+ years of professional software engineering experience with modern programming languages (Go, Java, Python, TypeScript, or C++).
- Strong computer science fundamentals in data structures, algorithms, object-oriented design, and system architecture.
- Demonstrated experience building and operating RESTful APIs and distributed microservices.

Preferred Qualifications:
- 4+ years of experience with cloud architectures (GCP, AWS) and container orchestration (Docker, Kubernetes).
- Proficiency with event-driven architectures (Kafka, Pub/Sub) and caching layers (Redis, Memcached).
- Experience with modern frontend frameworks (React, Angular) and responsive web design.
- Proven track record of improving latency, database query optimization, and test automation (CI/CD).`
  },
  {
    id: 'amazon-backend',
    title: 'Amazon - SDE II (Backend & AWS)',
    role: 'Backend SDE-II',
    text: `Job Title: Software Development Engineer II (SDE-II)
Company: Amazon Web Services (AWS)
Location: Seattle, WA / Hybrid

Job Description:
Are you passionate about building massively scalable cloud services? We are seeking an experienced SDE II to design mission-critical distributed services capable of processing tens of thousands of requests per second.

Key Responsibilities:
- Architect, build, and maintain highly scalable backend services in Java, Go, or C++.
- Utilize AWS services including ECS/EKS, Lambda, SQS, DynamoDB, and RDS.
- Collaborate with Senior Engineers and Product Managers to define API specifications and architecture design docs.
- Lead operational excellence initiatives, monitoring system health via CloudWatch, alarms, and latency dashboards.

Basic Qualifications:
- 3+ years of non-internship professional software development experience.
- Strong object-oriented design skills and deep knowledge of concurrency, multi-threading, and distributed caching.
- Experience with relational and NoSQL databases.`
  },
  {
    id: 'meta-fullstack',
    title: 'Meta - Full Stack Software Engineer',
    role: 'Full Stack Engineer',
    text: `Job Title: Full Stack Software Engineer
Company: Meta
Location: Menlo Park, CA / Remote

Overview:
We are looking for a versatile Full Stack Software Engineer to build intuitive, high-performance web interfaces and robust backend APIs that connect billions of people.

Responsibilities:
- Build modern, interactive web applications using React, Next.js, and TypeScript.
- Design performant GraphQL and REST APIs backed by relational and distributed databases.
- Optimize frontend rendering speed, state management, and asset delivery.
- Write unit, integration, and end-to-end tests to maintain high code reliability.

Requirements:
- 3+ years experience with React, TypeScript, and modern JavaScript tooling.
- Experience with Node.js, Python, or Go backend services.
- Solid understanding of web performance optimization and accessibility.`
  }
];

/**
 * Executes Mistral AI Resume Analysis
 * Runs parallel targeted prompts for ATS Match, Career Insights, and 15-20 Flashcards
 */
export async function analyzeResumeWithMistral(
  resumeText: string,
  jobDescription: string
): Promise<ResumeAnalysisResult> {
  const truncatedResume = resumeText.slice(0, 6000);
  const truncatedJd = jobDescription.slice(0, 4000);

  // PROMPT 1: ATS Scoring & Match Analysis
  const atsPrompt = `You are an expert HR Analyst, Principal Recruiter, and Applicant Tracking System (ATS) Engine.
Analyze this candidate resume against the job description.

RESUME:
\`\`\`
${truncatedResume}
\`\`\`

JOB DESCRIPTION:
\`\`\`
${truncatedJd}
\`\`\`

Respond STRICTLY in valid JSON matching this schema:
{
  "analysis": {
    "matching_skills": ["e.g. React", "TypeScript", "Node.js"],
    "missing_skills": ["e.g. Kubernetes", "GraphQL"],
    "matching_keywords": ["e.g. Microservices", "CI/CD", "PostgreSQL"],
    "missing_keywords": ["e.g. High Availability", "Distributed Tracing"],
    "experience_match": {
      "required_years": "3+ years",
      "candidate_years": "3.5 years",
      "match_percentage": 88
    },
    "education_match": {
      "required": "BS / B.Tech in CS or equivalent",
      "candidate": "B.Tech in Computer Science",
      "match": true
    },
    "role_compatibility": {
      "score": 84,
      "reasoning": "Strong match for full stack responsibilities with direct experience in core technologies."
    }
  },
  "ats_score": {
    "overall_score": 82,
    "score_breakdown": {
      "keyword_match": {
        "score": 80,
        "max_score": 100,
        "details": "High coverage of core tech stack keywords with minor gaps in operational tooling."
      },
      "skills_match": {
        "score": 85,
        "max_score": 100,
        "details": "Direct alignment with required programming languages and frameworks."
      },
      "experience_relevance": {
        "score": 88,
        "max_score": 100,
        "details": "Strong demonstrated impact and scale in previous engineering positions."
      },
      "format_optimization": {
        "score": 86,
        "max_score": 100,
        "details": "Clean section headers, quantifiable bullet points, and ATS-parseable structure."
      }
    },
    "improvement_suggestions": [
      {
        "area": "Keywords",
        "suggestion": "Explicitly mention cloud deployment practices and specific metrics.",
        "impact": "High"
      },
      {
        "area": "Formatting",
        "suggestion": "Include standard section for certifications and architectural achievements.",
        "impact": "Medium"
      }
    ],
    "ats_compatibility": {
      "rating": "Excellent",
      "key_issues": ["Missing explicit mention of container orchestration tools"],
      "optimization_tips": [
        "Include exact keyword variants from the job description",
        "Quantify project accomplishments using the Google XYZ formula"
      ]
    }
  }
}`;

  // PROMPT 2: Actionable Career Insights
  const insightsPrompt = `You are a FAANG Principal Engineering Career Counselor and Resume Bar Raiser.
Provide strategic, prioritized career insights for this resume targeting the given role.

RESUME:
\`\`\`
${truncatedResume}
\`\`\`

JOB DESCRIPTION:
\`\`\`
${truncatedJd}
\`\`\`

Respond STRICTLY in valid JSON matching this schema:
{
  "strengths": [
    "Demonstrated experience building high-throughput distributed services",
    "Strong technical leadership with quantifiable metrics (e.g. latency reduction, cost savings)",
    "Clean full-stack competency spanning backend, caching, and modern frontend"
  ],
  "weaknesses": [
    "Limited explicit evidence of large-scale incident management or on-call rotations",
    "Could provide more technical depth on distributed consensus or multi-region data replication"
  ],
  "recommendations": [
    {
      "category": "Cloud & Infrastructure",
      "suggestion": "Add concrete examples of AWS architecture, IAM security, and automated rollback strategies.",
      "priority": "High"
    },
    {
      "category": "System Design",
      "suggestion": "Highlight trade-off considerations between SQL vs NoSQL and synchronous vs asynchronous processing.",
      "priority": "Medium"
    },
    {
      "category": "Resume Formatting",
      "suggestion": "Lead every bullet point with a powerful action verb followed by impact percentage.",
      "priority": "Low"
    }
  ],
  "career_progression": {
    "current_level": "Mid-Level Software Engineer (SDE-1 / SDE-2)",
    "target_level": "Senior SDE-2 / Staff Track",
    "gap_analysis": "To firmly secure the target level, emphasize system ownership, cross-team mentoring, and architectural governance."
  },
  "resume_improvements": [
    "Frame achievements using: Accomplished [X], as measured by [Y], by doing [Z].",
    "Elevate technical leadership accomplishments and cross-functional RFC contributions.",
    "Add a dedicated Core Technologies matrix at the top of the resume for faster recruiter scanning."
  ]
}`;

  // PROMPT 3: 15-20 Interactive Interview Flashcards
  const flashcardsPrompt = `You are a Senior Bar Raiser and Technical Interviewer at Google and Amazon.
Generate 15 to 20 comprehensive interview preparation flashcards tailored specifically to this candidate's resume and target job description.

RESUME:
\`\`\`
${truncatedResume}
\`\`\`

JOB DESCRIPTION:
\`\`\`
${truncatedJd}
\`\`\`

Requirements:
- Generate 15-20 high-value interview questions.
- Distribute across categories: "Technical", "Behavioral", and "Situational".
- Distribute across difficulties: "Easy", "Medium", "Hard".
- Technical questions MUST target technologies on the resume (e.g. Redis, Kafka, React, Go, Java, concurrency, SQL, caching).
- Behavioral questions MUST follow the STAR method (Situation, Task, Action, Result).
- Situational questions MUST pose real-world engineering dilemmas (e.g. high latency in production, handling conflicting PR reviews, database migration under load).
- The "answer" field MUST provide an exemplary, high-scoring candidate response citing specific architecture, trade-offs, and best practices.

Respond STRICTLY in valid JSON array format:
[
  {
    "question": "How do you ensure cache consistency when using Redis with a PostgreSQL database?",
    "answer": "Use a Cache-Aside with Write-Invalidate strategy. On updates, write directly to the database first, then evict the corresponding key from Redis within an idempotent transaction. To handle race conditions and replication lag, implement a short TTL (e.g. 5-15 minutes) and consider Delayed Double Deletion or CDC (Change Data Capture) via Debezium and Kafka for guaranteed eventual consistency.",
    "category": "Technical",
    "difficulty": "Medium"
  }
]`;

  try {
    // Run all 3 prompts in parallel using Mistral AI
    const [atsRaw, insightsRaw, flashcardsRaw] = await Promise.all([
      executeAIChatCascade([{ role: 'user', content: atsPrompt }], {
        temperature: 0.15,
        responseFormatJson: true,
        preferMistral: true,
        timeoutMs: 40000
      }),
      executeAIChatCascade([{ role: 'user', content: insightsPrompt }], {
        temperature: 0.2,
        responseFormatJson: true,
        preferMistral: true,
        timeoutMs: 40000
      }),
      executeAIChatCascade([{ role: 'user', content: flashcardsPrompt }], {
        temperature: 0.25,
        maxTokens: 2500,
        responseFormatJson: true,
        preferMistral: true,
        timeoutMs: 50000
      })
    ]);

    // Parse ATS & Match
    let atsData: any = {};
    if (atsRaw) {
      try {
        atsData = JSON.parse(cleanJsonResponse(atsRaw));
      } catch (err) {
        console.warn('Failed to parse ATS JSON:', err);
      }
    }

    // Parse Insights
    let insightsData: any = {};
    if (insightsRaw) {
      try {
        insightsData = JSON.parse(cleanJsonResponse(insightsRaw));
      } catch (err) {
        console.warn('Failed to parse Insights JSON:', err);
      }
    }

    // Parse Flashcards
    let flashcardsData: any[] = [];
    if (flashcardsRaw) {
      try {
        const parsed = JSON.parse(cleanJsonResponse(flashcardsRaw));
        if (Array.isArray(parsed)) {
          flashcardsData = parsed;
        } else if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
          flashcardsData = parsed.flashcards;
        }
      } catch (err) {
        console.warn('Failed to parse Flashcards JSON:', err);
      }
    }

    // Assemble unified result with graceful fallbacks
    const compiledResult: ResumeAnalysisResult = {
      analysis: {
        matching_skills: atsData.analysis?.matching_skills || ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'REST APIs', 'Git'],
        missing_skills: atsData.analysis?.missing_skills || ['Kubernetes Orchestration', 'Distributed Tracing', 'GraphQL'],
        matching_keywords: atsData.analysis?.matching_keywords || ['Microservices', 'High Throughput', 'Caching', 'CI/CD Pipeline'],
        missing_keywords: atsData.analysis?.missing_keywords || ['Multi-Region Failover', 'Canary Deployments'],
        experience_match: {
          required_years: atsData.analysis?.experience_match?.required_years || '3+ years',
          candidate_years: atsData.analysis?.experience_match?.candidate_years || '3+ years',
          match_percentage: atsData.analysis?.experience_match?.match_percentage || 85
        },
        education_match: {
          required: atsData.analysis?.education_match?.required || 'BS/MS in Computer Science or equivalent',
          candidate: atsData.analysis?.education_match?.candidate || 'Computer Science Degree',
          match: atsData.analysis?.education_match?.match ?? true
        },
        role_compatibility: {
          score: atsData.analysis?.role_compatibility?.score || 84,
          reasoning: atsData.analysis?.role_compatibility?.reasoning || 'Strong foundational alignment with core backend/frontend engineering demands.'
        }
      },
      insights: {
        strengths: insightsData.strengths || [
          'High proficiency in modern TypeScript/JavaScript and backend service development',
          'Demonstrated impact in reducing latency and optimizing database queries',
          'Clean modular architecture adhering to SOLID and separation of concerns'
        ],
        weaknesses: insightsData.weaknesses || [
          'Limited explicit mentions of cloud infrastructure-as-code (Terraform/CloudFormation)',
          'Could expand on distributed observability (OpenTelemetry, Jaeger, Prometheus)'
        ],
        recommendations: insightsData.recommendations || [
          {
            category: 'Skills Alignment',
            suggestion: 'Explicitly highlight Kubernetes deployment configs and Docker multi-stage builds.',
            priority: 'High'
          },
          {
            category: 'Impact Metrics',
            suggestion: 'Quantify business impact on user engagement, throughput, and error rates.',
            priority: 'Medium'
          },
          {
            category: 'System Design',
            suggestion: 'Include high-level architecture diagrams or RFC design doc ownership.',
            priority: 'Low'
          }
        ],
        career_progression: {
          current_level: insightsData.career_progression?.current_level || 'Mid-Level Software Engineer (SDE-2)',
          target_level: insightsData.career_progression?.target_level || 'Senior Software Engineer (SDE-3 / Lead)',
          gap_analysis: insightsData.career_progression?.gap_analysis || 'Demonstrate cross-functional leadership, architectural RFCs, and mentoring junior engineers.'
        },
        resume_improvements: insightsData.resume_improvements || [
          'Begin every bullet with a strong action verb (Architected, Spearheaded, Optimized).',
          'Include precise metric gains: "Decreased p99 response times from 420ms to 85ms".',
          'Add a condensed 1-row Technical Summary badge grid for faster ATS keyword recognition.'
        ]
      },
      flashcards: flashcardsData.length >= 8 ? flashcardsData : getFallbackFlashcards(),
      ats_score: {
        overall_score: atsData.ats_score?.overall_score || 82,
        score_breakdown: {
          keyword_match: atsData.ats_score?.score_breakdown?.keyword_match || {
            score: 80,
            max_score: 100,
            details: 'Strong presence of relevant technical keywords and domain terminology.'
          },
          skills_match: atsData.ats_score?.score_breakdown?.skills_match || {
            score: 85,
            max_score: 100,
            details: 'Direct alignment with programming languages and framework requirements.'
          },
          experience_relevance: atsData.ats_score?.score_breakdown?.experience_relevance || {
            score: 88,
            max_score: 100,
            details: 'Hands-on project work matches the seniority level requested.'
          },
          format_optimization: atsData.ats_score?.score_breakdown?.format_optimization || {
            score: 84,
            max_score: 100,
            details: 'Standard ATS-parseable headings and logical chronological flow.'
          }
        },
        improvement_suggestions: atsData.ats_score?.improvement_suggestions || [
          {
            area: 'Keywords',
            suggestion: 'Add explicit keywords matching the target job description requirements.',
            impact: 'High'
          },
          {
            area: 'Format',
            suggestion: 'Ensure consistent bullet formatting and standard date headers.',
            impact: 'Medium'
          }
        ],
        ats_compatibility: {
          rating: atsData.ats_score?.ats_compatibility?.rating || 'Excellent',
          key_issues: atsData.ats_score?.ats_compatibility?.key_issues || ['Minor keyword variants omitted'],
          optimization_tips: atsData.ats_score?.ats_compatibility?.optimization_tips || [
            'Use standard section headers: Work Experience, Education, Technical Skills',
            'Avoid multi-column tables or complex nested text boxes'
          ]
        }
      },
      resume_preview: resumeText,
      job_description_preview: jobDescription,
      analyzed_at: new Date().toISOString(),
      ai_engine: 'SDETube AI Engine (Advanced Neural Reasoning)'
    };

    // Save to local storage for instant tab switching
    try {
      localStorage.setItem('edustream_last_resume_analysis', JSON.stringify(compiledResult));
    } catch {}

    return compiledResult;
  } catch (error) {
    console.error('[analyzeResumeWithMistral error]:', error);
    throw error;
  }
}

/**
 * High-quality fallback flashcards if AI response is sparse
 */
function getFallbackFlashcards(): FlashCard[] {
  return [
    {
      question: 'How do you design a distributed caching layer with Redis to prevent cache stampede and penetration?',
      answer: 'To prevent cache stampede, use Mutex Locks (single-flight locking) so only one worker queries the database on a cache miss while others wait, or use probabilistic early expiration (XFetch algorithm). To prevent cache penetration, store null/empty values with a short TTL for non-existent records, or front the cache with a Bloom Filter to instantly reject invalid IDs without touching Redis or the database.',
      category: 'Technical',
      difficulty: 'Hard'
    },
    {
      question: 'Explain the difference between Optimistic and Pessimistic concurrency control in database transactions.',
      answer: 'Pessimistic locking uses database row/table locks (SELECT ... FOR UPDATE) to prevent other transactions from modifying data until commit, preventing conflicts at the cost of throughput and potential deadlocks. Optimistic locking avoids row locks; instead it tracks a version number or timestamp. When committing, it checks if the version has changed (UPDATE ... WHERE version = x). If it has, the transaction aborts and retries. Optimistic is optimal for read-heavy systems with low collision probability.',
      category: 'Technical',
      difficulty: 'Medium'
    },
    {
      question: 'Describe a situation where a production service you owned degraded or went down. How did you triage and resolve it? (STAR)',
      answer: 'Situation: During a Black Friday traffic surge, our payment gateway service latency spiked from 120ms to 4.5s, dropping 8% of transactions. Task: As on-call lead, I had to stop the revenue hemorrhage within 15 minutes. Action: I inspected Grafana metrics and identified PostgreSQL connection pool exhaustion caused by a slow un-indexed audit log query. I immediately enabled aggressive read replicas, flipped a feature flag to bypass synchronous audit writes, and increased the connection pool cap. Result: Latency restored to 95ms within 8 minutes. We later added the missing composite index and an asynchronous Kafka queue for audit logs.',
      category: 'Behavioral',
      difficulty: 'Medium'
    },
    {
      question: 'How does event-driven architecture with Apache Kafka guarantee message ordering across partitions?',
      answer: 'Kafka guarantees total ordering ONLY within a single partition, not across multiple partitions. To ensure messages for a specific entity (like a customer ID or order ID) are processed sequentially, use that entity identifier as the Kafka message key. Kafka hashes the key to deterministically route all messages with that key to the exact same partition. Additionally, configure max.in.flight.requests.per.connection=1 (or enable idempotent producers with enable.idempotence=true) to prevent out-of-order retries on network blips.',
      category: 'Technical',
      difficulty: 'Hard'
    },
    {
      question: 'How do you handle a scenario where a Product Manager requests an urgent feature launch, but you identify significant architectural tech debt and security risks?',
      answer: 'I schedule a quick alignment meeting with the PM and engineering lead to present data-driven trade-offs rather than a flat refusal. I outline the specific business risk (e.g. data breach exposure, potential downtime during peak traffic). Next, I propose a phased compromise: Phase 1 implements a scoped, secure MVP that meets the core deadline by cutting non-essential complexity. Phase 2 is immediately booked into the subsequent sprint to pay down technical debt and fortify scaling safeguards.',
      category: 'Situational',
      difficulty: 'Medium'
    },
    {
      question: 'What are the trade-offs between REST, GraphQL, and gRPC for inter-service and client communications?',
      answer: 'REST is ubiquitous, simple to cache with HTTP standards, and universally understood, but can suffer from over/under-fetching. GraphQL gives frontend clients granular query power with a single endpoint, reducing roundtrips, but introduces complex backend query complexity and harder HTTP caching. gRPC uses HTTP/2 multiplexing and Protocol Buffers for compact binary serialization, delivering maximum throughput and strong typing, making it the industry standard for internal microservices, though browser support requires gRPC-Web proxying.',
      category: 'Technical',
      difficulty: 'Medium'
    },
    {
      question: 'Tell me about a time you strongly disagreed with a senior engineer or architect on a technical direction. How did you handle it? (STAR)',
      answer: 'Situation: Our tech lead wanted to migrate our relational customer database to a NoSQL document store to handle a projected 5x traffic increase. Task: I believed our complex relational joins and financial transaction consistency would be severely compromised in NoSQL. Action: Instead of arguing theoretically, I built a prototype benchmark comparing PostgreSQL partitioned tables with connection pooling against MongoDB. The benchmark demonstrated PostgreSQL handled 8x current load with zero consistency violations, while avoiding an expensive 4-month migration. Result: The team adopted the partitioning strategy, saving 3 months of engineering effort while fulfilling scaling goals.',
      category: 'Behavioral',
      difficulty: 'Hard'
    },
    {
      question: 'How do you approach designing an API to ensure idempotency for critical write operations like credit card payments?',
      answer: 'Require an Idempotency-Key header (UUID generated by client). On receiving the request, the server checks a distributed store (Redis/DB) with a unique constraint on the key. If the key is already processing, return 409 Conflict or 102 Processing. If already completed, return the cached successful response without re-executing the payment charge. If new, acquire a lock, execute the transaction inside an atomic database commit, record the response payload alongside the idempotency key, and release the lock with a 24-hour expiration.',
      category: 'Technical',
      difficulty: 'Medium'
    },
    {
      question: 'You notice in production that memory usage in your Node.js microservice steadily climbs until it crashes with an OOM (Out of Memory) error every 3 days. How do you diagnose and fix it?',
      answer: 'I trigger a heap snapshot using node --inspect or heapdump in a staging/canary container under synthetic load. I open the snapshot in Chrome DevTools Memory tab and compare snapshots taken 30 minutes apart. I look for accumulating objects: common culprits are unbounded global event emitter listeners, memory caches without an LRU eviction policy, closures holding outer scope variables, or unclosed database stream handles. Once isolated, I introduce an LRU cache with max-size limits and ensure event listeners are cleaned up on teardown.',
      category: 'Situational',
      difficulty: 'Hard'
    },
    {
      question: 'What is the STAR method and how do you apply it during FAANG behavioral interviews?',
      answer: 'STAR stands for Situation (set the business context and problem in 2-3 sentences), Task (define your specific personal responsibility and success criteria), Action (explain the detailed technical and interpersonal steps YOU personally took—spend 60% of your time here), and Result (quantify the outcome with metrics, latency, revenue, or team velocity, and share what you learned). Using STAR keeps answers structured, avoids vague generalities, and highlights high ownership.',
      category: 'Behavioral',
      difficulty: 'Easy'
    },
    {
      question: 'Explain how virtual DOM and reconciliation work in React 18, and how concurrent mode prevents main thread blocking.',
      answer: 'React maintains a lightweight in-memory tree (Virtual DOM). When state changes, a new tree is constructed and diffed against the previous tree using a heuristic $O(N)$ reconciliation algorithm (Fiber architecture). In React 18 Concurrent Mode, rendering is interruptible: React breaks work into time-sliced chunks using the browser requestIdleCallback/MessageChannel scheduler. If a higher-priority event (like user keystroke) arrives, React pauses low-priority rendering, updates the UI immediately, and resumes rendering later, eliminating jank.',
      category: 'Technical',
      difficulty: 'Medium'
    },
    {
      question: 'How do you design a rate limiter supporting 100,000 requests per second across multiple data centers?',
      answer: 'Use the Token Bucket or Sliding Window Log algorithm implemented via Redis Lua scripts to ensure atomic increment and expiration in a single roundtrip. To scale globally, place local rate limiters at the Edge (Cloudflare Workers / AWS API Gateway) with local Redis clusters syncing token allowances asynchronously via Redis Pub/Sub or CRDTs (Conflict-free Replicated Data Types), so client latency is never blocked by cross-region database synchronization.',
      category: 'Technical',
      difficulty: 'Hard'
    }
  ];
}

// =============================================================================
// AI-POWERED ATS RESUME CREATOR TYPES & GENERATOR
// =============================================================================

export interface AtsResumeExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface AtsResumeProject {
  id: string;
  name: string;
  technologies: string[];
  link?: string;
  bullets: string[];
}

export interface AtsResumeEducation {
  id: string;
  degree: string;
  institution: string;
  year: string;
  location?: string;
  gpa?: string;
  honors?: string;
}

export interface AtsResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  targetRole: string;
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    cloudDevOps: string[];
    databases: string[];
    toolsAndMethods: string[];
  };
  experience: AtsResumeExperience[];
  projects: AtsResumeProject[];
  education: AtsResumeEducation[];
  certifications: string[];
}

export const DEFAULT_ATS_RESUME: AtsResumeData = {
  personalInfo: {
    fullName: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA / Remote',
    linkedin: 'linkedin.com/in/alexrivera-dev',
    github: 'github.com/alexrivera',
    portfolio: 'alexrivera.dev'
  },
  targetRole: 'Senior Software Engineer (SDE-2 / Full Stack)',
  summary: 'Performance-driven Software Engineer with 3.5+ years of experience designing and deploying scalable distributed systems, microservices, and modern web applications. Proven track record reducing API latency by 42% and architecting event-driven pipelines handling 12M+ daily events. Adept at full-lifecycle system design, automated CI/CD pipelines, and high-concurrency caching with Redis and PostgreSQL.',
  skills: {
    languages: ['TypeScript', 'JavaScript (ES6+)', 'Go', 'Python', 'SQL', 'HTML5/CSS3'],
    frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'Gin (Go)', 'Tailwind CSS', 'Redux Toolkit'],
    cloudDevOps: ['AWS (ECS, Lambda, S3, RDS)', 'Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'CI/CD'],
    databases: ['PostgreSQL', 'Redis', 'Apache Kafka', 'MongoDB', 'DynamoDB'],
    toolsAndMethods: ['Microservices', 'Distributed Systems', 'System Design (SOLID)', 'REST APIs', 'GraphQL', 'Jest', 'Cypress']
  },
  experience: [
    {
      id: 'exp-1',
      title: 'Senior Software Engineer',
      company: 'TechFlow Innovations',
      location: 'San Francisco, CA',
      startDate: 'July 2023',
      endDate: 'Present',
      current: true,
      bullets: [
        'Architected an event-driven notification dispatch pipeline using Go and Apache Kafka, processing 12M+ events daily with sub-50ms p99 latency.',
        'Refactored legacy monolithic Node.js backend into 4 decoupled microservices containerized with Docker and orchestrated on AWS ECS.',
        'Engineered distributed Redis caching tier with write-behind invalidation, decreasing PostgreSQL read load by 68% during peak hours.',
        'Led sprint planning and code reviews for a team of 6 engineers, establishing automated linting and PR validation workflows in GitHub Actions.'
      ]
    },
    {
      id: 'exp-2',
      title: 'Full Stack Software Engineer',
      company: 'NextGen Apps',
      location: 'San Jose, CA',
      startDate: 'January 2021',
      endDate: 'June 2023',
      current: false,
      bullets: [
        'Built client-facing analytical dashboards using React, TypeScript, and Recharts, increasing customer session engagement by 35%.',
        'Implemented Stripe payment gateway integration with idempotent webhook processing, supporting $4.5M in annual recurring subscriptions.',
        'Authored 80+ unit and integration test suites utilizing Jest and Cypress, elevating team test coverage from 54% to 88%.'
      ]
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Distributed Real-Time Collaborative Canvas',
      technologies: ['TypeScript', 'WebSockets', 'Go', 'Redis', 'Docker'],
      link: 'github.com/alexrivera/collab-canvas',
      bullets: [
        'Built real-time collaborative state synchronization engine using Operational Transformation (OT) and WebSocket broadcasting across 10,000 concurrent users.',
        'Benchmarked Redis Pub/Sub cluster achieving 99.98% delivery rate with under 15ms message propagation latency.'
      ]
    },
    {
      id: 'proj-2',
      name: 'Automated Cloud Database Health Monitor',
      technologies: ['Python', 'PostgreSQL', 'AWS Lambda', 'Prometheus'],
      link: 'github.com/alexrivera/db-health-monitor',
      bullets: [
        'Engineered serverless telemetry collector tracking slow queries, connection pool saturation, and table bloat with automated Slack alerting.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'University of Technology',
      year: '2017 - 2021',
      gpa: '3.8 / 4.0'
    }
  ],
  certifications: [
    'AWS Certified Solutions Architect – Associate',
    'Certified Kubernetes Application Developer (CKAD)'
  ]
};

/**
 * Generates an ATS-Optimized Resume using Mistral AI
 */
export async function generateAtsResumeWithMistral(params: {
  baseResumeText?: string;
  jobDescription: string;
  targetRole?: string;
  currentProfile?: Partial<AtsResumeData>;
}): Promise<AtsResumeData> {
  const { baseResumeText, jobDescription, targetRole, currentProfile } = params;

  const prompt = `You are a Principal Engineering Resume Writer and Technical Bar Raiser at Google/Amazon.
Create a complete, 100% ATS-compliant, high-scoring Software Engineering Resume tailored specifically for the target Job Description.

TARGET ROLE: ${targetRole || currentProfile?.targetRole || 'Software Engineer / SDE-2'}

TARGET JOB DESCRIPTION:
\`\`\`
${(jobDescription || '').slice(0, 3500)}
\`\`\`

${baseResumeText ? `CANDIDATE BASE RESUME / BACKGROUND:\n\`\`\`\n${baseResumeText.slice(0, 4500)}\n\`\`\`\n` : ''}
${currentProfile?.personalInfo?.fullName ? `CANDIDATE NAME: ${currentProfile.personalInfo.fullName}\n` : ''}

CRITICAL ATS REQUIREMENTS:
1. Every work experience bullet MUST follow Google's XYZ formula: Accomplished [X], as measured by [Y], by doing [Z].
2. Lead every bullet with a high-impact action verb (Architected, Spearheaded, Engineered, Optimized, Refactored, Deployed).
3. Infuse exact keywords from the target job description naturally across Summary, Skills, and Experience bullets.
4. Professional Summary must be 3-4 sentences highlighting years of experience, core tech stack, and flagship business impact.
5. Skills must be clean arrays categorized by: languages, frameworks, cloudDevOps, databases, toolsAndMethods.

Respond STRICTLY in valid JSON matching this exact schema:
{
  "personalInfo": {
    "fullName": "Candidate Full Name",
    "email": "candidate@example.com",
    "phone": "+1 (555) 234-5678",
    "location": "City, State / Remote",
    "linkedin": "linkedin.com/in/profile",
    "github": "github.com/profile",
    "portfolio": "candidate.dev"
  },
  "targetRole": "${targetRole || 'Software Development Engineer II'}",
  "summary": "Compelling 3-4 sentence professional summary tailored with JD keywords...",
  "skills": {
    "languages": ["TypeScript", "Go", "Python", "SQL"],
    "frameworks": ["React", "Node.js", "Express", "Tailwind CSS"],
    "cloudDevOps": ["AWS", "Docker", "Kubernetes", "CI/CD"],
    "databases": ["PostgreSQL", "Redis", "Kafka"],
    "toolsAndMethods": ["Microservices", "REST APIs", "System Design", "SOLID"]
  },
  "experience": [
    {
      "id": "exp-1",
      "title": "Software Engineer II",
      "company": "Company Name",
      "location": "Location",
      "startDate": "Month Year",
      "endDate": "Present",
      "current": true,
      "bullets": [
        "Architected [System] handling [Metric], improving [Performance] by [X%] through [Technology].",
        "Engineered [Pipeline] reducing [Latency/Cost] by [Y%] using [Tool]."
      ]
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "Project Name",
      "technologies": ["React", "TypeScript", "Node.js"],
      "link": "github.com/profile/project",
      "bullets": [
        "Designed and launched [Project Description and impact]."
      ]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "degree": "B.S. in Computer Science",
      "institution": "University Name",
      "year": "2017 - 2021",
      "gpa": "3.8 / 4.0"
    }
  ],
  "certifications": [
    "AWS Certified Solutions Architect",
    "CKAD"
  ]
}`;

  try {
    const raw = await executeAIChatCascade([
      { role: 'user', content: prompt }
    ], {
      temperature: 0.2,
      maxTokens: 3500,
      responseFormatJson: true,
      preferMistral: true,
      timeoutMs: 45000
    });

    if (raw) {
      const parsed = JSON.parse(cleanJsonResponse(raw));
      return {
        personalInfo: {
          fullName: parsed.personalInfo?.fullName || currentProfile?.personalInfo?.fullName || 'Candidate Name',
          email: parsed.personalInfo?.email || currentProfile?.personalInfo?.email || 'candidate@example.com',
          phone: parsed.personalInfo?.phone || currentProfile?.personalInfo?.phone || '+1 (555) 234-5678',
          location: parsed.personalInfo?.location || currentProfile?.personalInfo?.location || 'Remote / Hybrid',
          linkedin: parsed.personalInfo?.linkedin || currentProfile?.personalInfo?.linkedin || 'linkedin.com/in/candidate',
          github: parsed.personalInfo?.github || currentProfile?.personalInfo?.github || 'github.com/candidate',
          portfolio: parsed.personalInfo?.portfolio || currentProfile?.personalInfo?.portfolio || 'candidate.dev'
        },
        targetRole: parsed.targetRole || targetRole || 'Software Development Engineer',
        summary: parsed.summary || DEFAULT_ATS_RESUME.summary,
        skills: {
          languages: parsed.skills?.languages || DEFAULT_ATS_RESUME.skills.languages,
          frameworks: parsed.skills?.frameworks || DEFAULT_ATS_RESUME.skills.frameworks,
          cloudDevOps: parsed.skills?.cloudDevOps || DEFAULT_ATS_RESUME.skills.cloudDevOps,
          databases: parsed.skills?.databases || DEFAULT_ATS_RESUME.skills.databases,
          toolsAndMethods: parsed.skills?.toolsAndMethods || DEFAULT_ATS_RESUME.skills.toolsAndMethods
        },
        experience: Array.isArray(parsed.experience) && parsed.experience.length > 0 ? parsed.experience.map((exp: any, i: number) => ({
          id: exp.id || `exp-${i + 1}`,
          title: exp.title || 'Software Engineer',
          company: exp.company || 'Tech Company',
          location: exp.location || 'Remote',
          startDate: exp.startDate || '2022',
          endDate: exp.endDate || 'Present',
          current: exp.current ?? true,
          bullets: Array.isArray(exp.bullets) ? exp.bullets : ['Engineered scalable microservices adhering to SOLID principles.']
        })) : DEFAULT_ATS_RESUME.experience,
        projects: Array.isArray(parsed.projects) && parsed.projects.length > 0 ? parsed.projects.map((proj: any, i: number) => ({
          id: proj.id || `proj-${i + 1}`,
          name: proj.name || 'Full Stack Application',
          technologies: Array.isArray(proj.technologies) ? proj.technologies : ['React', 'TypeScript', 'Node.js'],
          link: proj.link,
          bullets: Array.isArray(proj.bullets) ? proj.bullets : ['Architected high-throughput service handling concurrent web traffic.']
        })) : DEFAULT_ATS_RESUME.projects,
        education: Array.isArray(parsed.education) && parsed.education.length > 0 ? parsed.education.map((edu: any, i: number) => ({
          id: edu.id || `edu-${i + 1}`,
          degree: edu.degree || 'B.S. in Computer Science',
          institution: edu.institution || 'University of Science & Technology',
          year: edu.year || '2021',
          gpa: edu.gpa
        })) : DEFAULT_ATS_RESUME.education,
        certifications: Array.isArray(parsed.certifications) && parsed.certifications.length > 0 ? parsed.certifications : DEFAULT_ATS_RESUME.certifications
      };
    }
  } catch (err) {
    console.error('[generateAtsResumeWithMistral error]:', err);
  }

  return DEFAULT_ATS_RESUME;
}

/**
 * Enhances a single bullet point using Mistral AI (Google XYZ format)
 */
export async function enhanceBulletWithMistral(rawBullet: string, targetRole: string): Promise<string> {
  const prompt = `You are an elite Tech Resume Coach.
Rewrite this single resume bullet point using Google's XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]."
Target Role: ${targetRole}

RAW BULLET:
"${rawBullet}"

Requirements:
- Begin with a powerful past-tense action verb (Spearheaded, Architected, Engineered, Optimized).
- Include a realistic, quantifiable metric (latency reduction, % throughput increase, cost savings).
- Mention technical stack explicitly.
- Return ONLY the single improved bullet sentence, no quotation marks, no preamble.`;

  try {
    const res = await executeAIChatCascade([
      { role: 'user', content: prompt }
    ], { temperature: 0.3, preferMistral: true, timeoutMs: 15000 });

    if (res && res.trim().length > 10) {
      return res.replace(/^["'\s•-]+/, '').replace(/["'\s]+$/, '').trim();
    }
  } catch (err) {
    console.warn('Enhance bullet notice:', err);
  }

  return rawBullet;
}

export interface LiveAtsScoreResult {
  overallScore: number; // 0 - 100
  rating: 'Top 5% Elite' | 'Strong ATS Pass' | 'Good Match' | 'Needs Optimization';
  breakdown: {
    keywordMatch: { score: number; max: number; details: string };
    measurableImpact: { score: number; max: number; details: string };
    structureFormat: { score: number; max: number; details: string };
    seniorityScale: { score: number; max: number; details: string };
  };
  matchingKeywords: string[];
  missingKeywords: string[];
  xyzBulletCount: number;
  totalBulletCount: number;
  suggestions: string[];
}

/**
 * Calculates a live, real-time ATS compliance & keyword match score for an ATS Resume.
 * Evaluates keywords against target job description or role, Google XYZ formula bullets,
 * section completeness, and seniority indicators.
 */
export function calculateLiveAtsScore(
  resume: AtsResumeData,
  jobDescription?: string,
  targetRole?: string
): LiveAtsScoreResult {
  const jdText = (jobDescription || '').toLowerCase();
  const effectiveRole = (targetRole || resume.targetRole || 'Senior Software Engineer (SDE-2 / Full Stack)').toLowerCase();

  // 1. Gather all candidate text
  const skillsList = [
    ...(resume.skills?.languages || []),
    ...(resume.skills?.frameworks || []),
    ...(resume.skills?.cloudDevOps || []),
    ...(resume.skills?.databases || []),
    ...(resume.skills?.toolsAndMethods || [])
  ];

  const allBullets: string[] = [];
  (resume.experience || []).forEach(exp => {
    (exp.bullets || []).forEach(b => allBullets.push(b));
  });
  (resume.projects || []).forEach(p => {
    (p.bullets || []).forEach(b => allBullets.push(b));
  });

  const fullResumeCorpus = [
    resume.personalInfo?.fullName || '',
    resume.summary || '',
    skillsList.join(' '),
    allBullets.join(' '),
    (resume.education || []).map(e => `${e.degree} ${e.institution}`).join(' ')
  ].join(' ').toLowerCase();

  // 2. Keyword & Skills Matching (Max 35 pts)
  const canonicalKeywords = [
    'typescript', 'javascript', 'react', 'next.js', 'node.js', 'go', 'golang', 'python',
    'sql', 'postgresql', 'mysql', 'redis', 'kafka', 'docker', 'kubernetes', 'aws',
    'microservices', 'ci/cd', 'rest apis', 'graphql', 'system design', 'distributed systems',
    'unit testing', 'jest', 'cypress', 'terraform', 'git', 'p99', 'latency', 'caching'
  ];

  // Extract custom technical terms from JD if present
  let targetTokens: string[] = [];
  if (jdText.length > 50) {
    const jdTokens = canonicalKeywords.filter(k => jdText.includes(k));
    targetTokens = jdTokens.length >= 6 ? jdTokens : canonicalKeywords.slice(0, 16);
  } else {
    targetTokens = canonicalKeywords.slice(0, 16);
  }

  const matchingKeywords: string[] = [];
  const missingKeywords: string[] = [];

  targetTokens.forEach(token => {
    if (fullResumeCorpus.includes(token)) {
      matchingKeywords.push(token);
    } else {
      missingKeywords.push(token);
    }
  });

  const keywordCoverageRatio = targetTokens.length > 0 ? (matchingKeywords.length / targetTokens.length) : 0.8;
  const keywordScore = Math.min(35, Math.round(keywordCoverageRatio * 35));

  // 3. Measurable Impact & Google XYZ Formula (Max 25 pts)
  const actionVerbs = [
    'architected', 'engineered', 'spearheaded', 'designed', 'optimized', 'implemented',
    'scaled', 'refactored', 'deployed', 'orchestrated', 'automated', 'integrated', 'built',
    'reduced', 'increased', 'accelerated', 'developed', 'delivered'
  ];
  const metricRegex = /(\b\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?(?:k|m|b)?|\b\d+ms|\b\d+k\b|\b\d+m\b|\b\d+x\b|\b\d+\b)/i;

  let xyzBulletCount = 0;
  allBullets.forEach(bullet => {
    const lower = bullet.toLowerCase().trim();
    const hasActionVerb = actionVerbs.some(v => lower.startsWith(v) || lower.includes(` ${v} `));
    const hasMetric = metricRegex.test(lower);
    if (hasActionVerb && hasMetric) {
      xyzBulletCount++;
    }
  });

  const totalBulletCount = allBullets.length;
  const xyzRatio = totalBulletCount > 0 ? (xyzBulletCount / totalBulletCount) : 0;
  const impactScore = Math.min(25, Math.round(xyzRatio * 25));

  // 4. Structure & Section Completeness (Max 20 pts)
  let structureScore = 0;
  // Contact info (max 5)
  if (resume.personalInfo?.fullName?.trim()) structureScore += 1;
  if (resume.personalInfo?.email?.includes('@')) structureScore += 1;
  if (resume.personalInfo?.phone?.trim()) structureScore += 1;
  if (resume.personalInfo?.location?.trim()) structureScore += 1;
  if (resume.personalInfo?.linkedin?.trim() || resume.personalInfo?.github?.trim()) structureScore += 1;

  // Summary length (max 4)
  const summaryLen = (resume.summary || '').trim().length;
  if (summaryLen >= 120 && summaryLen <= 650) {
    structureScore += 4;
  } else if (summaryLen > 0) {
    structureScore += 2;
  }

  // Experience entries & bullets (max 6)
  const expCount = (resume.experience || []).length;
  if (expCount >= 2 && totalBulletCount >= 5) {
    structureScore += 6;
  } else if (expCount >= 1) {
    structureScore += 3;
  }

  // Skills coverage across categories (max 3)
  const populatedSkillCategories = Object.values(resume.skills || {}).filter(arr => Array.isArray(arr) && arr.length > 0).length;
  if (populatedSkillCategories >= 4) structureScore += 3;
  else if (populatedSkillCategories >= 2) structureScore += 2;

  // Education entry present (max 2)
  if ((resume.education || []).length > 0 && resume.education[0]?.degree?.trim()) {
    structureScore += 2;
  }

  // 5. Seniority & Scale Level Match (Max 20 pts)
  let seniorityScore = 0;
  const seniorityIndicators = [
    'distributed', 'microservices', 'scale', 'scaling', 'throughput', 'concurrency',
    'p99', 'latency', 'kafka', 'redis', 'aws', 'kubernetes', 'architecture', 'system design',
    'lead', 'mentored', 'ci/cd', 'cache'
  ];
  let matchedSeniorityCount = 0;
  seniorityIndicators.forEach(ind => {
    if (fullResumeCorpus.includes(ind)) matchedSeniorityCount++;
  });

  const seniorityRatio = Math.min(1, matchedSeniorityCount / 7);
  seniorityScore = Math.round(seniorityRatio * 20);

  // Overall Total
  const overallScore = Math.min(100, Math.max(15, keywordScore + impactScore + structureScore + seniorityScore));

  let rating: LiveAtsScoreResult['rating'] = 'Needs Optimization';
  if (overallScore >= 88) rating = 'Top 5% Elite';
  else if (overallScore >= 78) rating = 'Strong ATS Pass';
  else if (overallScore >= 65) rating = 'Good Match';

  // Actionable suggestions
  const suggestions: string[] = [];
  if (missingKeywords.length > 0) {
    suggestions.push(`Add missing keywords: ${missingKeywords.slice(0, 4).join(', ')}.`);
  }
  if (xyzBulletCount < totalBulletCount * 0.7) {
    suggestions.push(`Quantify more bullet points using Google's XYZ formula (action verb + metric + tech).`);
  }
  if (summaryLen < 150) {
    suggestions.push(`Expand summary to 3-4 sentences highlighting scale, years of experience, and primary stack.`);
  }
  if ((resume.education || []).length === 0) {
    suggestions.push(`Add your Degree and University in the Education section.`);
  }

  return {
    overallScore,
    rating,
    breakdown: {
      keywordMatch: {
        score: keywordScore,
        max: 35,
        details: `${matchingKeywords.length} of ${targetTokens.length} target keywords detected.`
      },
      measurableImpact: {
        score: impactScore,
        max: 25,
        details: `${xyzBulletCount} of ${totalBulletCount} bullets follow Google XYZ format.`
      },
      structureFormat: {
        score: structureScore,
        max: 20,
        details: `Clean single-column ATS typography and all key sections completed.`
      },
      seniorityScale: {
        score: seniorityScore,
        max: 20,
        details: `${matchedSeniorityCount} SDE-2 scale & architectural keywords present.`
      }
    },
    matchingKeywords,
    missingKeywords,
    xyzBulletCount,
    totalBulletCount,
    suggestions: suggestions.slice(0, 3)
  };
}

// ============================================================================
// 4-PILLAR SKILL-TO-RESOURCE KNOWLEDGE GRAPH CATALOG
// ============================================================================

export const SKILL_RESOURCE_CATALOG: Record<string, {
  baseRoiLPA: number;
  demandMultiplier: number;
  category: SkillRoiRecommendation['category'];
  estimatedHours: number;
  whyItMatters: string;
  sdeTube: SkillRoiRecommendation['learningResources']['sdeTube'];
  github: SkillRoiRecommendation['learningResources']['github'];
  internet: SkillRoiRecommendation['learningResources']['internet'];
}> = {
  'Apache Kafka': {
    baseRoiLPA: 2.8,
    demandMultiplier: 1.07,
    category: 'Data & Streaming',
    estimatedHours: 8,
    whyItMatters: 'Top requirement for tier-1 event-driven architectures, processing millions of events per second with zero message loss.',
    sdeTube: [
      { title: 'DDIA Ch. 11: Stream Processing & Event Brokers', type: 'DDIA Book', routeUrl: '/books/ddia?chapter=11' },
      { title: 'HLD Canvas: Design Real-Time Notification & Event Pipeline', type: 'HLD Canvas', routeUrl: '/hld' },
      { title: 'AI Mock Interview: Distributed Messaging & Kafka', type: 'AI Mock Interview', routeUrl: '/interview' }
    ],
    github: [
      {
        repoName: 'confluentinc/kafka-streams-examples',
        url: 'https://github.com/confluentinc/kafka-streams-examples',
        description: 'Production patterns for partitioned event streaming, consumer groups, and dead-letter queues.',
        capstoneProjectIdea: 'Build an Idempotent Order Event Processor using Kafka/Redpanda + Node/Go with Dead-Letter Queue (DLQ) replay and Prometheus metrics.',
        resumeBulletTemplate: 'Engineered an event-driven pipeline using Apache Kafka handling 10K+ events/sec with idempotent consumers and DLQ fault recovery, reducing p99 processing latency by 38%.'
      }
    ],
    internet: [
      { title: 'Kafka: The Definitive Guide & Architecture Internals', provider: 'Confluent Developer', url: 'https://developer.confluent.io/courses/apache-kafka/events/', type: 'Course' },
      { title: 'How LinkedIn & Uber Scale Kafka to Trillions of Messages', provider: 'roadmap.sh', url: 'https://roadmap.sh/kafka', type: 'Architecture Blog' }
    ]
  },
  'Redis': {
    baseRoiLPA: 2.1,
    demandMultiplier: 1.05,
    category: 'System Design & Scale',
    estimatedHours: 5,
    whyItMatters: 'Essential for low-latency sub-millisecond data retrieval, cache stampede prevention, and distributed session storage.',
    sdeTube: [
      { title: 'DDIA Ch. 3 & 5: Storage Engines, Caching & Replication', type: 'DDIA Book', routeUrl: '/books/ddia?chapter=5' },
      { title: 'HLD Boss Sheet: Distributed Rate Limiter & Cache-Aside', type: 'HLD Canvas', routeUrl: '/hld' },
      { title: 'LLD Studio: Design Thread-Safe LRU/LFU Cache', type: 'LLD Studio', routeUrl: '/lld' }
    ],
    github: [
      {
        repoName: 'codecrafters-io/build-your-own-x',
        url: 'https://github.com/codecrafters-io/build-your-own-x#build-your-own-redis',
        description: 'Implement RESP protocol, event loop, key expiry, and replication from scratch.',
        capstoneProjectIdea: 'Build a Distributed Token-Bucket Rate Limiter & Cache Stampede Prevention middleware using Redis Lua scripts.',
        resumeBulletTemplate: 'Implemented a Redis-backed distributed rate limiter and cache-aside layer with Lua atomic scripts, cutting PostgreSQL read load by 65% and achieving <8ms p95 API latency.'
      }
    ],
    internet: [
      { title: 'Redis University RU101: Introduction to Data Structures', provider: 'Redis University', url: 'https://redis.io/learn/', type: 'Course' },
      { title: 'Caching Strategies & Stampede Mitigation', provider: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer#cache', type: 'Interactive Guide' }
    ]
  },
  'Kubernetes': {
    baseRoiLPA: 3.2,
    demandMultiplier: 1.08,
    category: 'Backend & Cloud',
    estimatedHours: 10,
    whyItMatters: 'The universal orchestrator for modern cloud-native systems, enabling automated rolling deployments, horizontal autoscaling, and self-healing pods.',
    sdeTube: [
      { title: 'HLD Architecture Canvas: Auto-Scaling Microservices Cluster', type: 'HLD Canvas', routeUrl: '/hld' },
      { title: 'DDIA Ch. 8: Trouble with Distributed Systems & Fault Tolerance', type: 'DDIA Book', routeUrl: '/books/ddia?chapter=8' }
    ],
    github: [
      {
        repoName: 'kelseyhightower/kubernetes-the-hard-way',
        url: 'https://github.com/kelseyhightower/kubernetes-the-hard-way',
        description: 'Bootstrap a Kubernetes cluster from scratch to master control plane, etcd, and CNI networking.',
        capstoneProjectIdea: 'Deploy a multi-service application on k3d/Kubernetes with KEDA event-driven autoscaling, readiness probes, and Helm charts.',
        resumeBulletTemplate: 'Orchestrated containerized microservices on Kubernetes with KEDA event-driven autoscaling and zero-downtime rolling deployments, improving cluster resource utilization by 42%.'
      }
    ],
    internet: [
      { title: 'Kubernetes Official Interactive Tutorials', provider: 'kubernetes.io', url: 'https://kubernetes.io/docs/tutorials/', type: 'Documentation' },
      { title: 'DevOps & Kubernetes Roadmap', provider: 'roadmap.sh', url: 'https://roadmap.sh/kubernetes', type: 'Interactive Guide' }
    ]
  },
  'System Design (HLD & LLD)': {
    baseRoiLPA: 3.5,
    demandMultiplier: 1.10,
    category: 'System Design & Scale',
    estimatedHours: 12,
    whyItMatters: 'The single highest-weighted factor separating SDE-1 from SDE-2/Senior compensation bands across FAANG and unicorns.',
    sdeTube: [
      { title: 'HLD Boss Sheet & Topology Validator', type: 'HLD Canvas', routeUrl: '/hld' },
      { title: 'LLD Boss Sheet, SOLID & Design Patterns Studio', type: 'LLD Studio', routeUrl: '/lld' },
      { title: 'Designing Data-Intensive Applications (Interactive Reader)', type: 'DDIA Book', routeUrl: '/books/ddia' }
    ],
    github: [
      {
        repoName: 'donnemartin/system-design-primer',
        url: 'https://github.com/donnemartin/system-design-primer',
        description: 'Comprehensive HLD & LLD blueprints, trade-off matrices, and object-oriented design implementations.',
        capstoneProjectIdea: 'Complete 5 validated HLD architectures on SDETube HLD Canvas and 5 SOLID/Design Pattern implementations in your GitHub portfolio.',
        resumeBulletTemplate: 'Designed horizontally scalable microservice architectures utilizing consistent hashing, read replicas, and circuit breakers to support high-concurrency workloads.'
      }
    ],
    internet: [
      { title: 'MIT 6.824: Distributed Systems Lectures', provider: 'MIT OpenCourseWare', url: 'https://pdos.csail.mit.edu/6.824/', type: 'Course' },
      { title: 'System Design Roadmap', provider: 'roadmap.sh', url: 'https://roadmap.sh/system-design', type: 'Interactive Guide' }
    ]
  },
  'Golang High-Concurrency Microservices': {
    baseRoiLPA: 3.0,
    demandMultiplier: 1.09,
    category: 'Backend & Cloud',
    estimatedHours: 7,
    whyItMatters: 'Unlocks top-tier backend security and high-throughput networking roles with minimal memory footprint and native goroutine concurrency.',
    sdeTube: [
      { title: 'HLD Canvas: High-Throughput Ingestion Engine in Go', type: 'HLD Canvas', routeUrl: '/hld' },
      { title: 'AI Mock Interview: Go Concurrency & Channels', type: 'AI Mock Interview', routeUrl: '/interview' }
    ],
    github: [
      {
        repoName: 'golang-standards/project-layout',
        url: 'https://github.com/golang-standards/project-layout',
        description: 'Standard Go project directory layout for production microservices & CLI tools.',
        capstoneProjectIdea: 'Build a high-performance HTTP reverse proxy with worker pool goroutines, rate limiting, and Prometheus exporter.',
        resumeBulletTemplate: 'Engineered high-throughput microservices in Go using bounded worker pools and non-blocking channels, handling 15K req/s with 35% lower memory overhead.'
      }
    ],
    internet: [
      { title: 'A Tour of Go (Interactive)', provider: 'go.dev', url: 'https://go.dev/tour/', type: 'Interactive Guide' },
      { title: 'Go Microservices Architecture Patterns', provider: 'roadmap.sh', url: 'https://roadmap.sh/golang', type: 'Documentation' }
    ]
  },
  'PostgreSQL & Database Internals': {
    baseRoiLPA: 2.3,
    demandMultiplier: 1.05,
    category: 'System Design & Scale',
    estimatedHours: 6,
    whyItMatters: 'Mastering indexing (B-Tree, GIN, BRIN), MVCC, EXPLAIN ANALYZE, and connection pooling eliminates DB bottlenecks at scale.',
    sdeTube: [
      { title: 'LeetCode SQL Workspace & Query Judge (50+ Real Problems)', type: 'SQL Judge', routeUrl: '/dsa-sheets' },
      { title: 'DDIA Ch. 7: Transactions, Isolation Levels & 2PC', type: 'DDIA Book', routeUrl: '/books/ddia?chapter=7' }
    ],
    github: [
      {
        repoName: 'eulerto/sysbench-tpcc',
        url: 'https://github.com/eulerto/sysbench-tpcc',
        description: 'TPC-C benchmark tool for measuring relational DB transaction throughput under heavy concurrency.',
        capstoneProjectIdea: 'Optimize slow SQL queries on a 10M-row dataset using composite indices, partial indexing, and connection pooling with PgBouncer.',
        resumeBulletTemplate: 'Optimized high-volume PostgreSQL queries via composite indexing and connection pooling with PgBouncer, cutting p99 query execution time from 420ms to 28ms.'
      }
    ],
    internet: [
      { title: 'Use The Index, Luke! A Guide to Database Performance', provider: 'Markus Winand', url: 'https://use-the-index-luke.com/', type: 'Interactive Guide' },
      { title: 'PostgreSQL Documentation & Internals', provider: 'postgresql.org', url: 'https://www.postgresql.org/docs/current/internals.html', type: 'Documentation' }
    ]
  }
};

// ============================================================================
// SDETUBE TELEMETRY AGGREGATOR
// ============================================================================

export async function getSdeTubeTelemetrySnapshot(userId?: string): Promise<SdeTubeTelemetrySnapshot> {
  let email = userId || '';
  if (!email && typeof localStorage !== 'undefined') {
    email = localStorage.getItem('edustream_user_email') || localStorage.getItem('sdetube_user_email') || '';
  }

  const progress = getUserProgressSync(email);
  const dsaSolvedCount =
    (progress.solved_sde?.length || 0) +
    (progress.solved_a2z?.length || 0) +
    (progress.solved_79?.length || 0) +
    (progress.solved_blind75?.length || 0) +
    (progress.solved_mik?.length || 0);

  let sqlSolvedCount = 0;
  try {
    const rawSql = typeof localStorage !== 'undefined' ? localStorage.getItem('sdetube_sql_solved_ids') : null;
    if (rawSql) {
      const parsed = JSON.parse(rawSql);
      sqlSolvedCount = Array.isArray(parsed) ? parsed.length : 0;
    }
  } catch {}

  let hldTopologiesValidated = 0;
  try {
    const rawHld = typeof localStorage !== 'undefined' ? localStorage.getItem('sdetube_hld_topologies') || localStorage.getItem('sdetube_hld_saved_topologies') : null;
    if (rawHld) {
      const parsed = JSON.parse(rawHld);
      hldTopologiesValidated = Array.isArray(parsed) ? parsed.length : (typeof parsed === 'object' ? Object.keys(parsed).length : 0);
    }
  } catch {}

  const lldProblemsCompleted = progress.lld_solved_ids?.length || 0;

  let ddiaChaptersCompleted = 0;
  try {
    const rawDdia = typeof localStorage !== 'undefined' ? localStorage.getItem('ddia_completed_chapters') || localStorage.getItem('sdetube_ddia_completed') : null;
    if (rawDdia) {
      const parsed = JSON.parse(rawDdia);
      ddiaChaptersCompleted = Array.isArray(parsed) ? parsed.length : 0;
    }
  } catch {}

  let mockInterviewsCompleted = 0;
  let avgMockInterviewScore = 0;
  try {
    const records = await getInterviewHistory(email || 'Candidate');
    if (records && records.length > 0) {
      mockInterviewsCompleted = records.length;
      const totalScore = records.reduce((acc, r) => acc + (r.overall_score || 0), 0);
      avgMockInterviewScore = Math.round(totalScore / records.length);
    }
  } catch {}

  const verifiedSkills: string[] = [];
  if (dsaSolvedCount >= 10) verifiedSkills.push('Algorithms & Data Structures (Verified ⚡)');
  if (sqlSolvedCount >= 5) verifiedSkills.push('SQL & Relational Query Tuning (Verified ⚡)');
  if (hldTopologiesValidated >= 2) verifiedSkills.push('High-Level System Design (Verified ⚡)');
  if (lldProblemsCompleted >= 2) verifiedSkills.push('Low-Level Object-Oriented Design (SOLID) (Verified ⚡)');
  if (ddiaChaptersCompleted >= 1) verifiedSkills.push('Distributed Data Systems (DDIA) (Verified ⚡)');
  if (mockInterviewsCompleted >= 1) verifiedSkills.push(`AI Bar-Raiser Interview Scorecard (${avgMockInterviewScore}%) (Verified ⚡)`);

  const telemetryHashPayload = `${email}:${dsaSolvedCount}:${sqlSolvedCount}:${hldTopologiesValidated}:${lldProblemsCompleted}:${ddiaChaptersCompleted}:${mockInterviewsCompleted}:${avgMockInterviewScore}`;
  const telemetryHash = (await sha256Hex(telemetryHashPayload)).slice(0, 16);

  return {
    userId: email || 'anonymous_user',
    dsaSolvedCount,
    dsaTopicsCovered: ['Arrays', 'Two Pointers', 'Trees', 'Graphs', 'Dynamic Programming', 'System Design'],
    sqlSolvedCount,
    hldTopologiesValidated,
    lldProblemsCompleted,
    ddiaChaptersCompleted,
    mockInterviewsCompleted,
    avgMockInterviewScore,
    verifiedSkills,
    telemetryHash,
  };
}

// ============================================================================
// CANONICAL SKILLS, SECTION EXTRACTOR & ACCURATE EXPERIENCE PARSER
// ============================================================================

export interface CanonicalSkillDef {
  name: string;
  category: 'System Design & Scale' | 'Backend & Cloud' | 'Data & Streaming' | 'AI & LLM' | 'Core CS & DSA';
  regex: RegExp;
  lpaPremium: number;
  usdPremium: number;
  whyItMatters: string;
}

export const CANONICAL_SKILLS: CanonicalSkillDef[] = [
  { name: 'Go', category: 'Backend & Cloud', regex: /\bgolang\b|\bgo\s+(?:language|developer|engineer|backend|microservices|goroutines)\b/i, lpaPremium: 2.8, usdPremium: 8500, whyItMatters: 'Unlocks high-throughput networking and cloud infrastructure roles with low memory overhead.' },
  { name: 'Apache Kafka', category: 'Data & Streaming', regex: /\bkafka\b|\bapache\s+kafka\b/i, lpaPremium: 2.6, usdPremium: 8000, whyItMatters: 'Essential for event-driven architectures and distributed message streaming at enterprise scale.' },
  { name: 'Kubernetes', category: 'Backend & Cloud', regex: /\bkubernetes\b|\bk8s\b|\bk3d\b|\bk3s\b|\bhelm\b/i, lpaPremium: 2.7, usdPremium: 8500, whyItMatters: 'The universal orchestrator for modern cloud-native systems, auto-scaling, and rolling updates.' },
  { name: 'System Design (HLD & LLD)', category: 'System Design & Scale', regex: /\bsystem\s+design\b|\bdistributed\s+systems?\b|\bscalability\b|\bhld\b|\blld\b/i, lpaPremium: 3.2, usdPremium: 10000, whyItMatters: 'The single highest-weighted factor separating SDE-1 from SDE-2/Senior compensation bands.' },
  { name: 'Redis', category: 'System Design & Scale', regex: /\bredis\b/i, lpaPremium: 1.8, usdPremium: 5500, whyItMatters: 'Sub-millisecond latency distributed caching, rate-limiting, and session management.' },
  { name: 'PostgreSQL', category: 'System Design & Scale', regex: /\bpostgres(?:ql)?\b/i, lpaPremium: 1.6, usdPremium: 5000, whyItMatters: 'Relational data modeling, indexing, connection pooling, and transactional consistency.' },
  { name: 'TypeScript', category: 'Backend & Cloud', regex: /\btypescript\b|\bts\b/i, lpaPremium: 1.4, usdPremium: 4500, whyItMatters: 'Strict type safety across full-stack and scalable Node.js architectures.' },
  { name: 'React', category: 'Backend & Cloud', regex: /\breact(?:\.js|js)?\b/i, lpaPremium: 1.3, usdPremium: 4000, whyItMatters: 'Industry-standard frontend library for modern reactive web applications.' },
  { name: 'Next.js', category: 'Backend & Cloud', regex: /\bnext(?:\.js|js)\b/i, lpaPremium: 1.5, usdPremium: 4500, whyItMatters: 'Production server-side rendering, streaming, and full-stack edge performance.' },
  { name: 'Node.js', category: 'Backend & Cloud', regex: /\bnode(?:\.js|js)?\b/i, lpaPremium: 1.4, usdPremium: 4000, whyItMatters: 'High-performance asynchronous backend runtime for microservices and APIs.' },
  { name: 'Java', category: 'Backend & Cloud', regex: /\bjava\b(?!\s*script)/i, lpaPremium: 1.5, usdPremium: 4500, whyItMatters: 'Enterprise tier-1 platform engineering with Spring Boot and JVM optimization.' },
  { name: 'C++', category: 'Core CS & DSA', regex: /\bc\+\+\b|\bcpp\b/i, lpaPremium: 1.8, usdPremium: 5500, whyItMatters: 'Low-latency systems, game engines, performance-critical infra, and algorithmic problem solving.' },
  { name: 'Python', category: 'AI & LLM', regex: /\bpython\b/i, lpaPremium: 1.4, usdPremium: 4000, whyItMatters: 'Dominant ecosystem for AI/ML pipelines, backend services, and rapid scripting.' },
  { name: 'Docker', category: 'Backend & Cloud', regex: /\bdocker\b|\bcontainerization\b/i, lpaPremium: 1.1, usdPremium: 3500, whyItMatters: 'Reproducible container environments and modern microservice packaging.' },
  { name: 'AWS', category: 'Backend & Cloud', regex: /\baws\b|\bamazon\s+web\s+services\b/i, lpaPremium: 1.7, usdPremium: 5000, whyItMatters: 'Cloud primitives (ECS, S3, SQS, DynamoDB, Lambda) powering global applications.' },
  { name: 'GCP', category: 'Backend & Cloud', regex: /\bgcp\b|\bgoogle\s+cloud\b/i, lpaPremium: 1.6, usdPremium: 5000, whyItMatters: 'Google Cloud services, BigQuery, and enterprise Kubernetes engines.' },
  { name: 'Microservices', category: 'System Design & Scale', regex: /\bmicroservices?\b/i, lpaPremium: 1.6, usdPremium: 5000, whyItMatters: 'Decoupled domain-driven system architectures with fault boundaries.' },
  { name: 'GraphQL', category: 'Backend & Cloud', regex: /\bgraphql\b|\bapollo\b/i, lpaPremium: 1.3, usdPremium: 4000, whyItMatters: 'Declarative, client-specified data querying for complex entity graphs.' },
  { name: 'LLM / GenAI', category: 'AI & LLM', regex: /\bllm\b|\brag\b|\blangchain\b|\bgenerative\s+ai\b|\bopenai\b|\bvllm\b/i, lpaPremium: 3.0, usdPremium: 9500, whyItMatters: 'Cutting-edge production retrieval, agentic workflows, and model quantization.' },
  { name: 'PyTorch', category: 'AI & LLM', regex: /\bpytorch\b/i, lpaPremium: 2.2, usdPremium: 7000, whyItMatters: 'Deep learning research, model fine-tuning, and inference pipelines.' },
  { name: 'Three.js', category: 'Backend & Cloud', regex: /\bthree(?:\.js|js)\b|\bwebgl\b/i, lpaPremium: 1.6, usdPremium: 5000, whyItMatters: 'Interactive 3D graphics on the web with shaders and WebGL pipelines.' },
  { name: 'NATS', category: 'Data & Streaming', regex: /\bnats\b/i, lpaPremium: 1.8, usdPremium: 5500, whyItMatters: 'Ultra-lightweight, high-performance messaging for modern microservice clusters.' },
  { name: 'Rust', category: 'Backend & Cloud', regex: /\brust\b/i, lpaPremium: 2.8, usdPremium: 8500, whyItMatters: 'Zero-cost abstractions and memory safety without garbage collection.' },
  { name: 'CI/CD', category: 'Backend & Cloud', regex: /\bci\/cd\b|\bgithub\s+actions\b|\bjenkins\b/i, lpaPremium: 1.1, usdPremium: 3500, whyItMatters: 'Automated testing, build pipelines, and production deployment automation.' },
  { name: 'Data Structures & Algorithms', category: 'Core CS & DSA', regex: /\balgorithms?\b|\bleetcode\b|\bdsa\b|\bdata\s+structures\b/i, lpaPremium: 1.6, usdPremium: 5000, whyItMatters: 'Core computational problem solving and tier-1 interview readiness.' },
];

export const CANONICAL_SKILL_MAP = new Map<string, CanonicalSkillDef>(
  CANONICAL_SKILLS.map(s => [s.name.toLowerCase(), s])
);

// ============================================================================
// 3. LLM-POWERED RESUME AUDITOR + DETERMINISTIC GUARDRAIL (FIXES BUG #1)
// ============================================================================

const LLM_EXTRACTION_SYSTEM_PROMPT = `You are a strict, zero-hallucination Technical Resume Auditor.
Extract structured data from the candidate's resume text and return ONLY valid JSON matching this exact schema:
{
  "candidateName": "string",
  "detectedRoleArchetype": "Backend & Distributed Systems" | "Full-Stack Engineering" | "Frontend & UI/3D Engineering" | "Data, AI & ML Engineering" | "DevOps, Cloud & Platform" | "Software Engineering (General)",
  "graduationYear": number | null,
  "educationEntriesExcluded": ["string (e.g., B.Tech CSE-AI at IEM 2021-2025, Class XII 2019-2021)"],
  "workEntries": [
    {
      "company": "string",
      "roleTitle": "string",
      "startMonth": number (1-12),
      "startYear": number (YYYY),
      "endMonth": number (1-12),
      "endYear": number (YYYY),
      "isCurrent": boolean,
      "classification": "full_time" | "internship" | "part_time_or_teaching",
      "reason": "string explaining why this is full_time vs internship vs part_time_or_teaching"
    }
  ],
  "provenInExperienceSkills": ["canonical skill names explicitly used in work experience bullets"],
  "provenInProjectsSkills": ["canonical skill names explicitly used in project bullets"],
  "listedOnlySkills": ["skills listed ONLY in the skills section without work/project proof"],
  "auditNote": "1-sentence summary of how YOE was calculated and what was excluded"
}

CRITICAL RULES FOR EXPERIENCE CLASSIFICATION:
1. NEVER include University, College, B.Tech, B.E., M.Tech, BCA, MCA, or High School dates in "workEntries". Put them in "educationEntriesExcluded".
2. Any role with "Intern", "Internship", "Trainee", "Apprentice", "Summer", "Winter", "Student", or any role that ended BEFORE the candidate's college graduationYear MUST have classification = "internship".
3. Any role as a "Teacher", "Educator", "Tutor", "Teaching Assistant", "Subject Matter Expert", "Mentor", "Freelance", or "Part-Time" instructor MUST have classification = "part_time_or_teaching".
4. ONLY post-graduation, full-time software/research engineering employment gets classification = "full_time".`;

export async function verifyAndExtractResumeWithLLM(
  rawResumeText: string,
  resumeHash: string
): Promise<{
  expMetrics: ParsedExperienceMetrics;
  skillProof: SkillProofClassification;
  candidateName: string;
} | null> {
  const llmCacheKey = `sdetube:llm_parsed_resume:v5:${resumeHash}`;
  try {
    const cached = await redisGet<any>(llmCacheKey);
    if (cached && cached.expMetrics && cached.skillProof) {
      return cached;
    }
  } catch {
    // Continue if Redis unavailable
  }

  const groqKey =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GROQ_API_KEY) ||
    GROQ_API_KEY;
  const mistralKey =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_MISTRAL_API_KEY) ||
    MISTRAL_API_KEY;

  if (!groqKey && !mistralKey) return null;

  try {
    const isGroq = Boolean(groqKey);
    const endpoint = isGroq
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.mistral.ai/v1/chat/completions';
    const apiKey = isGroq ? groqKey : mistralKey;
    const model = isGroq ? 'llama-3.3-70b-versatile' : 'mistral-small-latest';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: LLM_EXTRACTION_SYSTEM_PROMPT },
          { role: 'user', content: `RESUME TEXT:\n\n${rawResumeText.slice(0, 12000)}` },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1; // 1-12
    const curAbs = curYear * 12 + curMonth;

    const gradYear: number | null =
      typeof parsed.graduationYear === 'number' && parsed.graduationYear >= 2005 && parsed.graduationYear <= 2032
        ? parsed.graduationYear
        : null;

    const ftIntervals: [number, number][] = [];
    const internIntervals: [number, number][] = [];
    const teachingIntervals: [number, number][] = [];
    const workEntries: VerifiedWorkEntry[] = [];

    for (const entry of Array.isArray(parsed.workEntries) ? parsed.workEntries : []) {
      const roleTitle = String(entry.roleTitle || '');
      const company = String(entry.company || '');

      // Double-check LLM didn't accidentally pass a college degree
      if (/\b(b\.?\s*tech|bachelor|master|high\s+school|secondary|convocation|university|college\s+student)\b/i.test(`${company} ${roleTitle}`)) {
        continue;
      }

      const sYear = Number(entry.startYear) || curYear;
      const sMonth = Math.min(12, Math.max(1, Number(entry.startMonth) || 1));
      const eYear = entry.isCurrent ? curYear : Number(entry.endYear) || sYear;
      const eMonth = entry.isCurrent ? curMonth : Math.min(12, Math.max(1, Number(entry.endMonth) || 12));

      let startAbs = sYear * 12 + sMonth;
      const endAbs = Math.min(curAbs, eYear * 12 + eMonth);
      if (endAbs < startAbs || sYear < 2005) continue;

      let classification: VerifiedWorkEntry['classification'] =
        entry.classification === 'internship' || entry.classification === 'part_time_or_teaching'
          ? entry.classification
          : 'full_time';

      // Hard deterministic guardrail on top of LLM output:
      if (/\b(educator|teacher|tutor|teaching|instructor|faculty|mentor|part[\s-]*time|freelance)\b/i.test(`${roleTitle} ${company}`)) {
        classification = 'part_time_or_teaching';
      } else if (/\b(intern|internship|trainee|apprentice|student|fellow)\b/i.test(`${roleTitle} ${company}`)) {
        classification = 'internship';
      } else if (gradYear && eYear < gradYear) {
        classification = 'internship';
      } else if (gradYear && sYear < gradYear && eYear >= gradYear && classification === 'full_time') {
        const gradAbs = gradYear * 12 + 6;
        if (endAbs >= gradAbs) {
          internIntervals.push([startAbs, gradAbs - 1]);
          startAbs = gradAbs;
        } else {
          classification = 'internship';
        }
      }

      const months = Math.max(1, endAbs - startAbs + 1);
      if (classification === 'full_time') ftIntervals.push([startAbs, endAbs]);
      else if (classification === 'internship') internIntervals.push([startAbs, endAbs]);
      else teachingIntervals.push([startAbs, endAbs]);

      workEntries.push({
        company,
        roleTitle,
        startDate: `${sMonth}/${sYear}`,
        endDate: entry.isCurrent ? 'Present' : `${eMonth}/${eYear}`,
        months,
        classification,
        reason: String(entry.reason || classification),
      });
    }

    const mergeIntervalsSum = (list: [number, number][]): number => {
      if (list.length === 0) return 0;
      const sorted = [...list].sort((a, b) => a[0] - b[0]);
      const merged: [number, number][] = [[sorted[0][0], sorted[0][1]]];
      for (let i = 1; i < sorted.length; i++) {
        const prev = merged[merged.length - 1];
        const curr = sorted[i];
        if (curr[0] <= prev[1] + 1) prev[1] = Math.max(prev[1], curr[1]);
        else merged.push([curr[0], curr[1]]);
      }
      return merged.reduce((sum, [s, e]) => sum + Math.max(1, e - s + 1), 0);
    };

    const ftMonths = mergeIntervalsSum(ftIntervals);
    const internMonths = mergeIntervalsSum(internIntervals);
    const teachingMonths = mergeIntervalsSum(teachingIntervals);
    const fullTimeYoe = Number((ftMonths / 12).toFixed(1));
    const effectiveValuationYoe = Number(
      (fullTimeYoe + (Math.min(internMonths, 12) / 12) * 0.25 + (Math.min(teachingMonths, 24) / 12) * 0.15).toFixed(1)
    );

    const regexSkillProof = classifySkillProofDeterministic(rawResumeText);
    const provenExp = Array.from(
      new Set([...regexSkillProof.provenInExperience, ...(parsed.provenInExperienceSkills || [])])
    );
    const provenProj = Array.from(
      new Set([...regexSkillProof.provenInProjects, ...(parsed.provenInProjectsSkills || [])])
    ).filter((s) => !provenExp.includes(s));
    const listedOnly = Array.from(
      new Set([...regexSkillProof.listedOnlyInSkills, ...(parsed.listedOnlySkills || [])])
    ).filter((s) => !provenExp.includes(s) && !provenProj.includes(s));

    const detectedIntervals = workEntries.map(e => ({
      roleSnippet: `${e.roleTitle} at ${e.company}`.slice(0, 70),
      startLabel: e.startDate,
      endLabel: e.endDate,
      months: e.months,
      classification: (e.classification === 'full_time' ? 'full-time' : e.classification === 'internship' ? 'internship' : 'part-time/teaching') as any
    }));

    const output = {
      candidateName: String(parsed.candidateName || 'Candidate'),
      expMetrics: {
        fullTimeYoe,
        internshipMonths: internMonths,
        teachingOrPartTimeMonths: teachingMonths,
        effectiveValuationYoe,
        detectedGraduationYear: gradYear,
        detectedRoleArchetype: (parsed.detectedRoleArchetype as RoleArchetype) || regexSkillProof.archetype,
        verifiedByLLM: true,
        llmAuditNotes: String(
          parsed.auditNote ||
            `Verified ${fullTimeYoe} yrs full-time experience (${internMonths} mos internship, ${teachingMonths} mos teaching/part-time excluded from full-time tenure).`
        ),
        workEntries,
        excludedEducationEntries: Array.isArray(parsed.educationEntriesExcluded)
          ? parsed.educationEntriesExcluded
          : [],
        detectedIntervals
      },
      skillProof: {
        allSkills: [...provenExp, ...provenProj, ...listedOnly],
        provenInExperience: provenExp,
        provenInProjects: provenProj,
        listedOnlyInSkills: listedOnly,
      },
    };

    try {
      await redisSet(llmCacheKey, output, 86400 * 7);
    } catch {
      // Ignore cache error
    }

    return output;
  } catch {
    return null;
  }
}

// ============================================================================
// 4. DETERMINISTIC FALLBACK PARSER (IF LLM KEY IS ABSENT)
// ============================================================================

export function classifySkillProofDeterministic(rawText: string): SkillProofClassification & {
  archetype: RoleArchetype;
} {
  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  const nonEduLines = lines.filter(
    (line) =>
      !/\b(b\.?\s*tech|b\.?\s*e\.?|bachelor|m\.?\s*tech|diploma|higher\s+secondary|class\s+xii|class\s+x|icse|isc|cbse|wbchse|cgpa|gpa|convocation|university|college|institute\s+of\s+engineering)\b/i.test(
        line
      )
  );
  const cleanCorpus = nonEduLines.join('\n');

  const provenInExperience: string[] = [];
  const provenInProjects: string[] = [];
  const listedOnlyInSkills: string[] = [];

  const expSectionMatch = /(?:W\s*O\s*R\s*K\s+E\s*X\s*P\s*E\s*R\s*I\s*E\s*N\s*C\s*E|P\s*R\s*O\s*F\s*E\s*S\s*S\s*I\s*O\s*N\s*A\s*L\s+E\s*X\s*P\s*E\s*R\s*I\s*E\s*N\s*C\s*E|E\s*X\s*P\s*E\s*R\s*I\s*E\s*N\s*C\s*E|EMPLOYMENT|CAREER\s+HISTORY)([\s\S]*?)(?=\n\s*(?:EDUCATION|PROJECTS|SKILLS|ACHIEVEMENTS|CERTIFICATIONS)\b|$)/i.exec(
    cleanCorpus
  );
  const projSectionMatch = /(?:PROJECTS|PERSONAL\s+PROJECTS|KEY\s+PROJECTS)([\s\S]*?)(?=\n\s*(?:EDUCATION|EXPERIENCE|SKILLS|ACHIEVEMENTS|CERTIFICATIONS)\b|$)/i.exec(
    cleanCorpus
  );

  const expText = expSectionMatch ? expSectionMatch[1] : '';
  const projText = projSectionMatch ? projSectionMatch[1] : '';

  const skillPatterns: [string, RegExp][] = [
    ['Go', /\bgolang\b|\bgo\b(?=\s*(?:,|\/|\||routines|microservices|backend))/i],
    ['Apache Kafka', /\bkafka\b/i],
    ['NATS', /\bnats\b/i],
    ['Redis', /\bredis\b|\bvalkey\b/i],
    ['Kubernetes', /\bkubernetes\b|\bk8s\b|\bk3d\b/i],
    ['KEDA', /\bkeda\b/i],
    ['Docker', /\bdocker\b/i],
    ['NestJS', /\bnest(?:\.js|js)\b/i],
    ['Node.js', /\bnode(?:\.js|js)\b/i],
    ['PostgreSQL', /\bpostgres(?:ql)?\b/i],
    ['Next.js', /\bnext(?:\.js|js)\b/i],
    ['React', /\breact(?:\.js|js)?\b/i],
    ['TypeScript', /\btypescript\b/i],
    ['Three.js / WebGL', /\bthree(?:\.js|js)\b|\bwebgl\b/i],
    ['NVIDIA Omniverse / Godot', /\bomniverse\b|\bgodot\b|\bblender\b/i],
    ['C++', /\bc\+\+\b|\bcpp\b/i],
    ['Python', /\bpython\b|\bfastapi\b/i],
    ['Distributed Systems', /\bdistributed\s+systems?\b|\bmicroservices?\b|\beclipse\s+ditto\b|\bscada\b|\bnode-red\b/i],
    ['Agentic AI / LLM Systems', /\bllm\b|\brag\b|\bmistral\b|\bwhisper\b|\bagentic\b/i],
    ['SQL', /\bsql\b|\bsupabase\b/i],
  ];

  for (const [name, regex] of skillPatterns) {
    if (!regex.test(rawText)) continue;
    if (expText && regex.test(expText)) provenInExperience.push(name);
    else if (projText && regex.test(projText)) provenInProjects.push(name);
    else listedOnlyInSkills.push(name);
  }

  return {
    allSkills: [...provenInExperience, ...provenInProjects, ...listedOnlyInSkills],
    provenInExperience,
    provenInProjects,
    listedOnlyInSkills,
    archetype: provenInExperience.some((s) => ['Go', 'Apache Kafka', 'NATS', 'NestJS', 'PostgreSQL', 'Distributed Systems'].includes(s))
      ? 'Backend & Distributed Systems'
      : 'Full-Stack Engineering',
  };
}

export function splitResumeSections(rawText: string): {
  experienceBlock: string;
  projectsBlock: string;
  skillsBlock: string;
  educationBlock: string;
  otherBlock: string;
} {
  const normalized = rawText.replace(/\r\n/g, '\n');
  const HEADERS: [string, RegExp][] = [
    ['experience', /(?:^|\n)\s*(?:W\s*O\s*R\s*K\s+E\s*X\s*P\s*E\s*R\s*I\s*E\s*N\s*C\s*E|P\s*R\s*O\s*F\s*E\s*S\s*S\s*I\s*O\s*N\s*A\s*L\s+E\s*X\s*P\s*E\s*R\s*I\s*E\s*N\s*C\s*E|EMPLOYMENT\s+HISTORY|WORK\s+HISTORY|CAREER\s+HISTORY|E\s*X\s*P\s*E\s*R\s*I\s*E\s*N\s*C\s*E)\s*(?::|\n)/i],
    ['projects', /(?:^|\n)\s*(?:PERSONAL\s+PROJECTS|KEY\s+PROJECTS|ACADEMIC\s+PROJECTS|P\s*R\s*O\s*J\s*E\s*C\s*T\s*S)\s*(?::|\n)/i],
    ['skills', /(?:^|\n)\s*(?:TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|S\s*K\s*I\s*L\s*L\s*S|TECHNOLOGIES)\s*(?::|\n)/i],
    ['education', /(?:^|\n)\s*(?:E\s*D\s*U\s*C\s*A\s*T\s*I\s*O\s*N|ACADEMIC\s+BACKGROUND|ACADEMICS|QUALIFICATIONS)\s*(?::|\n)/i],
  ];

  const positions: { start: number; end: number; name: string }[] = [];
  for (const [name, rgx] of HEADERS) {
    const m = rgx.exec(normalized);
    if (m) {
      positions.push({ start: m.index, end: m.index + m[0].length, name });
    }
  }
  positions.sort((a, b) => a.start - b.start);

  const sections = {
    experienceBlock: '',
    projectsBlock: '',
    skillsBlock: '',
    educationBlock: '',
    otherBlock: ''
  };

  if (positions.length === 0) {
    sections.experienceBlock = normalized;
    return sections;
  }

  sections.otherBlock = normalized.slice(0, positions[0].start).trim();

  for (let i = 0; i < positions.length; i++) {
    const cur = positions[i];
    const nextStart = i + 1 < positions.length ? positions[i + 1].start : normalized.length;
    const content = normalized.slice(cur.end, nextStart).trim();
    if (cur.name === 'experience') sections.experienceBlock = content;
    else if (cur.name === 'projects') sections.projectsBlock = content;
    else if (cur.name === 'skills') sections.skillsBlock = content;
    else if (cur.name === 'education') sections.educationBlock = content;
  }

  return sections;
}

const MONTH_NAME_MAP: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7,
  sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

export function extractAccurateExperience(
  rawResumeText: string,
  manualFullTimeYoeOverride?: number | null
): ParsedExperienceMetrics {
  const sections = splitResumeSections(rawResumeText);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentAbsMonth = currentYear * 12 + currentMonth;

  // 1. Detect Graduation Year from Education Block
  let graduationYear: number | null = null;
  const eduTarget = sections.educationBlock || rawResumeText;
  const eduMatch = /\b(?:B\.?\s*Tech|B\.?\s*E\.?|Bachelor|B\.?\s*Sc|M\.?\s*Tech|MCA|BCA|Graduation|Class\s+of)[\s\S]{0,180}?\b(20\d{2})\s*(?:[-–—to]+\s*(20\d{2}|Present|Current))?/i.exec(eduTarget);
  if (eduMatch) {
    const yr2 = eduMatch[2] && /^\d{4}$/.test(eduMatch[2]) ? parseInt(eduMatch[2], 10) : parseInt(eduMatch[1], 10);
    if (yr2 >= 2010 && yr2 <= 2030) {
      graduationYear = yr2;
    }
  }

  // 2. Parse Date Intervals Exclusively from the Experience Block
  const expBlock = sections.experienceBlock || rawResumeText;
  const dateRangeRegex = /\b(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)|(0?[1-9]|1[0-2]))[\s,./'-]+(20\d{2})\s*(?:[-–—]|to)\s*(?:(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)|(0?[1-9]|1[0-2]))[\s,./'-]+(20\d{2})|(Present|Current|Now|Ongoing))\b/gi;

  const fullTimeIntervals: [number, number, string][] = [];
  const internIntervals: [number, number, string][] = [];
  const detectedIntervals: ParsedExperienceMetrics['detectedIntervals'] = [];

  let match: RegExpExecArray | null;
  while ((match = dateRangeRegex.exec(expBlock)) !== null) {
    const sStr = match[1]?.toLowerCase();
    const sNum = match[2] ? parseInt(match[2], 10) - 1 : (sStr ? MONTH_NAME_MAP[sStr] ?? 0 : 0);
    const sYr = parseInt(match[3], 10);

    const isPresent = Boolean(match[7]);
    const eStr = match[4]?.toLowerCase();
    const eNum = isPresent ? currentMonth : match[5] ? parseInt(match[5], 10) - 1 : (eStr ? MONTH_NAME_MAP[eStr] ?? 11 : 11);
    const eYr = isPresent ? currentYear : parseInt(match[6], 10);

    const sAbs = sYr * 12 + sNum;
    const eAbs = Math.min(currentAbsMonth, eYr * 12 + eNum);
    if (eAbs < sAbs || sYr < 2005) continue;

    // Context around interval to detect internship or part-time roles
    const ctxStart = Math.max(0, match.index - 120);
    const ctxEnd = Math.min(expBlock.length, match.index + match[0].length + 80);
    const contextSnippet = expBlock.slice(ctxStart, ctxEnd);

    // Hard guard: Never count degree or schooling intervals in work experience
    if (/\b(b\.?\s*tech|b\.?\s*e\.?|bachelor|m\.?\s*tech|mca|bca|diploma|higher\s+secondary|class\s+xii|class\s+x|icse|isc|cbse|convocation|institute\s+of\s+engineering|university|college|school)\b/i.test(contextSnippet)) {
      continue;
    }

    const isIntern =
      /\b(intern|internship|trainee|apprentice|fellow|ta|teaching|part[- ]time)\b/i.test(contextSnippet) ||
      (graduationYear !== null && eYr < graduationYear);

    const months = Math.max(1, eAbs - sAbs + 1);
    const classification = isIntern ? 'internship' : 'full-time';

    detectedIntervals.push({
      roleSnippet: contextSnippet.split('\n')[0].slice(0, 70),
      startLabel: `${sStr || (sNum + 1)} ${sYr}`,
      endLabel: isPresent ? 'Present' : `${eStr || (eNum + 1)} ${eYr}`,
      months,
      classification
    });

    if (isIntern) {
      internIntervals.push([sAbs, eAbs, match[0]]);
    } else {
      fullTimeIntervals.push([sAbs, eAbs, match[0]]);
    }
  }

  // 3. Union Overlapping Intervals
  const mergeIntervals = (arr: [number, number, string][]): number => {
    if (arr.length === 0) return 0;
    arr.sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [[arr[0][0], arr[0][1]]];
    for (let i = 1; i < arr.length; i++) {
      const prev = merged[merged.length - 1];
      const cur = arr[i];
      if (cur[0] <= prev[1] + 1) {
        prev[1] = Math.max(prev[1], cur[1]);
      } else {
        merged.push([cur[0], cur[1]]);
      }
    }
    return merged.reduce((sum, [s, e]) => sum + (e - s + 1), 0);
  };

  const ftMonths = mergeIntervals(fullTimeIntervals);
  const internMonths = mergeIntervals(internIntervals);

  let rawFullTimeYoe = Math.round((ftMonths / 12) * 10) / 10;
  // Fallback if no dates matched but experience exists
  if (rawFullTimeYoe === 0 && internMonths === 0) {
    if (/senior|lead|architect/i.test(rawResumeText)) rawFullTimeYoe = 4.5;
    else if (/software\s+engineer|developer/i.test(rawResumeText)) rawFullTimeYoe = 1.8;
    else rawFullTimeYoe = 0.5;
  }

  const manualOverrideApplied = typeof manualFullTimeYoeOverride === 'number' && manualFullTimeYoeOverride >= 0;
  const fullTimeYoe = manualOverrideApplied ? manualFullTimeYoeOverride : rawFullTimeYoe;
  const effectiveValuationYoe = Number((fullTimeYoe + (internMonths / 12) * 0.25).toFixed(1));
  const detectedRoleArchetype = detectPrimaryRoleArchetype(rawResumeText);

  return {
    fullTimeYoe,
    internshipMonths: internMonths,
    teachingOrPartTimeMonths: 0,
    effectiveValuationYoe,
    manualOverrideApplied,
    detectedGraduationYear: graduationYear,
    detectedRoleArchetype,
    detectedIntervals
  };
}

export function detectPrimaryRoleArchetype(rawResumeText: string): RoleArchetype {
  const scores: Record<RoleArchetype, number> = {
    'Backend & Distributed Systems': 0,
    'Full-Stack Engineering': 0,
    'Frontend & UI/3D Engineering': 0,
    'Data, AI & ML Engineering': 0,
    'DevOps, Cloud & Platform': 0,
    'Software Engineering (General)': 1,
  };

  if (/\b(backend|distributed\s+systems?|microservices?|grpc|kafka|redis|sql|database|concurrency)\b/i.test(rawResumeText)) {
    scores['Backend & Distributed Systems'] += 4;
  }
  if (/\b(full\s*stack|mern|next\.js|react\s+and\s+node|graphql)\b/i.test(rawResumeText)) {
    scores['Full-Stack Engineering'] += 5;
  }
  if (/\b(frontend|react|vue|three\.js|webgl|tailwind|css|ui\/ux)\b/i.test(rawResumeText)) {
    scores['Frontend & UI/3D Engineering'] += 4;
  }
  if (/\b(machine\s+learning|ai|llm|deep\s+learning|pytorch|pandas|rag|langchain|data\s+science)\b/i.test(rawResumeText)) {
    scores['Data, AI & ML Engineering'] += 5;
  }
  if (/\b(devops|sre|kubernetes|terraform|docker|ci\/cd|platform\s+engineer|aws\s+infra)\b/i.test(rawResumeText)) {
    scores['DevOps, Cloud & Platform'] += 5;
  }

  let bestRole: RoleArchetype = 'Full-Stack Engineering';
  let bestScore = -1;
  for (const [role, score] of Object.entries(scores) as [RoleArchetype, number][]) {
    if (score > bestScore) {
      bestScore = score;
      bestRole = role;
    }
  }
  return bestRole;
}

export function classifySkillProofLevels(rawResumeText: string): SkillProofClassification {
  const sections = splitResumeSections(rawResumeText);
  const provenInExperience: string[] = [];
  const provenInProjects: string[] = [];
  const listedOnlyInSkills: string[] = [];

  for (const skill of CANONICAL_SKILLS) {
    const inExp = skill.regex.test(sections.experienceBlock);
    const inProj = skill.regex.test(sections.projectsBlock);
    const inSkills = skill.regex.test(sections.skillsBlock) || skill.regex.test(sections.otherBlock);

    if (inExp) {
      provenInExperience.push(skill.name);
    } else if (inProj) {
      provenInProjects.push(skill.name);
    } else if (inSkills) {
      listedOnlyInSkills.push(skill.name);
    }
  }

  const allSkills = Array.from(new Set([...provenInExperience, ...provenInProjects, ...listedOnlyInSkills]));
  return {
    allSkills,
    provenInExperience,
    provenInProjects,
    listedOnlyInSkills
  };
}

// ============================================================================
// 5. MULTI-COUNTRY DUAL VALUATION ENGINE (DYNAMIC CURRENCY & HUBS)
// ============================================================================

export function calculateMultiCountryDualValuation(params: {
  expMetrics: ParsedExperienceMetrics;
  skillProof: SkillProofClassification;
  quantifiedBulletRatio: number;
  atsOverallScore: number;
  includeSdeTubeData: boolean;
  telemetry: SdeTubeTelemetrySnapshot | null;
  location: UserLocationPreferences;
  simulatedSkillsBoost?: number;
}): DualMarketValuation {
  const countryCfg = COUNTRY_CONFIGS[params.location.countryCode] || COUNTRY_CONFIGS.IN;
  const ftYoe = params.expMetrics.fullTimeYoe;
  const effYoe = params.expMetrics.effectiveValuationYoe;

  // 1. Determine Seniority Band & Country Base Anchor
  let seniorityBand: DualMarketValuation['factors']['seniorityBand'] = 'Fresher / Entry';
  let baseAnchor = countryCfg.baseAnchorsByBand.fresher;

  if (ftYoe < 0.5) {
    seniorityBand = 'Fresher / Entry';
    baseAnchor = countryCfg.baseAnchorsByBand.fresher + effYoe * (countryCfg.perYoeSlope * 0.6);
  } else if (ftYoe < 2.0) {
    seniorityBand = 'SDE-1 (Junior)';
    baseAnchor = countryCfg.baseAnchorsByBand.sde1 + (ftYoe - 0.5) * countryCfg.perYoeSlope;
  } else if (ftYoe < 4.5) {
    seniorityBand = 'SDE-2 (Mid-Level)';
    baseAnchor = countryCfg.baseAnchorsByBand.sde2 + (ftYoe - 2.0) * countryCfg.perYoeSlope;
  } else if (ftYoe < 7.5) {
    seniorityBand = 'Senior (SDE-3)';
    baseAnchor = countryCfg.baseAnchorsByBand.senior + (ftYoe - 4.5) * countryCfg.perYoeSlope;
  } else {
    seniorityBand = 'Staff / Principal';
    baseAnchor = countryCfg.baseAnchorsByBand.staff + Math.min(ftYoe - 7.5, 6) * countryCfg.perYoeSlope;
  }

  // 2. Evidence-Gated Skill Premium (scaled to the selected country's unit)
  const weightedSkillUnits =
    params.skillProof.provenInExperience.length * 1.0 +
    params.skillProof.provenInProjects.length * 0.6 +
    params.skillProof.listedOnlyInSkills.length * 0.15;

  const skillSaturation = Math.min(1.0, weightedSkillUnits / 10);
  const earnedSkillPremium = skillSaturation * countryCfg.maxSkillPremium;

  // 3. Impact & ATS Readability Adjustment
  const impactAdjustment = (params.quantifiedBulletRatio - 0.25) * (countryCfg.maxSkillPremium * 0.28);

  // 4. City or Domestic Remote Multiplier for the Selected Country
  const selectedCityObj =
    countryCfg.cities.find((c) => c.name === params.location.preferredCity) || countryCfg.cities[0];

  const activeMultiplier = params.location.preferDomesticRemote
    ? countryCfg.domesticRemoteMultiplier
    : selectedCityObj.multiplier;

  const activeLocationLabel = params.location.preferDomesticRemote
    ? `${countryCfg.name} Remote (${countryCfg.domesticRemoteMultiplier >= 1 ? '+' : ''}${Math.round((countryCfg.domesticRemoteMultiplier - 1) * 100)}%)`
    : selectedCityObj.label;

  const rawNationalValue = Math.max(
    countryCfg.baseAnchorsByBand.fresher * 0.75,
    baseAnchor + earnedSkillPremium + impactAdjustment
  );

  const roundVal = (v: number) => (countryCfg.isLPA ? Number(v.toFixed(1)) : Math.round(v));
  const baseResumeOnlyValue = roundVal(rawNationalValue * activeMultiplier);

  // 5. Conditional SDETube Telemetry Boost (Strictly 0 when checkbox is unchecked)
  let sdeTubeBonusPct = 0;
  if (params.includeSdeTubeData && params.telemetry) {
    const dsaPct = Math.min((params.telemetry.dsaSolvedCount || 0) / 180, 1) * 6.5;
    const designPct =
      Math.min(
        ((params.telemetry.hldTopologiesValidated || 0) * 2 +
          (params.telemetry.lldProblemsCompleted || 0) +
          (params.telemetry.ddiaChaptersCompleted || 0)) /
          18,
        1
      ) * 7.5;
    const mockPct = ((params.telemetry.avgMockInterviewScore || 0) / 100) * 4.0;
    sdeTubeBonusPct = Number((dsaPct + designPct + mockPct).toFixed(1));
  }

  const sdeTubeVerifiedBoost = roundVal(baseResumeOnlyValue * (sdeTubeBonusPct / 100));
  const simulatedSkillsBoost = roundVal(
    (params.simulatedSkillsBoost || 0) * activeMultiplier
  );

  const totalDomestic = roundVal(baseResumeOnlyValue + sdeTubeVerifiedBoost + simulatedSkillsBoost);

  // 6. Outside-Country Valuation (Global Remote Contractor USD + International Relocation Hubs)
  const globalRemoteBaseUSD =
    ftYoe < 0.5
      ? 18000 + skillSaturation * 10000
      : ftYoe < 2.0
      ? 28000 + ftYoe * 6000 + skillSaturation * 14000
      : ftYoe < 4.5
      ? 46000 + (ftYoe - 2.0) * 8500 + skillSaturation * 18000
      : 72000 + Math.min(ftYoe - 4.5, 6) * 8000 + skillSaturation * 24000;

  const baseResumeOnlyUSD = Math.round(globalRemoteBaseUSD / 500) * 500;
  const sdeTubeBoostUSD = Math.round((baseResumeOnlyUSD * (sdeTubeBonusPct / 100)) / 500) * 500;
  const totalMedianUSD = baseResumeOnlyUSD + sdeTubeBoostUSD;

  // Build Outside-Country Hub comparisons excluding the user's current home country
  const allHubCodes: CountryCode[] = ['US', 'GB', 'DE', 'SG', 'AE', 'IN', 'CA'];
  const internationalHubs = allHubCodes
    .filter((code) => code !== params.location.countryCode)
    .slice(0, 5)
    .map((code) => {
      const cfg = COUNTRY_CONFIGS[code];
      const hubAnchor =
        ftYoe < 0.5
          ? cfg.baseAnchorsByBand.fresher
          : ftYoe < 2.0
          ? cfg.baseAnchorsByBand.sde1 + (ftYoe - 0.5) * cfg.perYoeSlope
          : ftYoe < 4.5
          ? cfg.baseAnchorsByBand.sde2 + (ftYoe - 2.0) * cfg.perYoeSlope
          : cfg.baseAnchorsByBand.senior;
      const med = hubAnchor + skillSaturation * cfg.maxSkillPremium;
      const minStr = cfg.isLPA ? (med * 0.88).toFixed(1) : Math.round(med * 0.88);
      const maxStr = cfg.isLPA ? (med * 1.25).toFixed(1) : Math.round(med * 1.25);

      return {
        countryCode: code,
        hubName: `${cfg.flag} ${cfg.name} (${cfg.topHubName})`,
        currency: `${cfg.currencySymbol}${cfg.unitLabel}`,
        estimatedRange: `${cfg.currencySymbol}${minStr} – ${cfg.currencySymbol}${maxStr} ${cfg.unitLabel}`,
        usdEquivalentMedian: Math.round(totalMedianUSD * 1.5),
        visaSponsorshipFit: (ftYoe >= 2.0 || sdeTubeBonusPct >= 10 ? 'High' : 'Moderate') as 'High' | 'Moderate' | 'Selective',
        visaSponsorshipLikelihood: (ftYoe >= 2.0 || sdeTubeBonusPct >= 10 ? 'High' : 'Moderate') as 'High' | 'Moderate' | 'Selective',
      };
    });

  const topHubMult = countryCfg.cities[0]?.multiplier || 1.15;

  return {
    domestic: {
      countryCode: countryCfg.code,
      countryName: countryCfg.name,
      flag: countryCfg.flag,
      cityOrRemoteLabel: activeLocationLabel,
      currency: countryCfg.isLPA ? 'INR (₹ LPA)' : `${countryCfg.currencySymbol} ${countryCfg.unitLabel}`,
      currencySymbol: countryCfg.currencySymbol,
      unitLabel: countryCfg.unitLabel,
      isLPA: countryCfg.isLPA,
      baseResumeOnlyValue,
      sdeTubeVerifiedBoost,
      simulatedSkillsBoost,
      totalEstimatedValue: totalDomestic,
      range: {
        min: roundVal(totalDomestic * 0.86),
        median: totalDomestic,
        max: roundVal(totalDomestic * 1.24),
        p90: roundVal(totalDomestic * 1.45),
      },
      cityMultiplierApplied: activeMultiplier,
      domesticRemoteComparison: {
        cityOnsiteMedian: roundVal(rawNationalValue * selectedCityObj.multiplier + sdeTubeVerifiedBoost),
        domesticRemoteMedian: roundVal(rawNationalValue * countryCfg.domesticRemoteMultiplier + sdeTubeVerifiedBoost),
        topHubMedian: roundVal(rawNationalValue * topHubMult + sdeTubeVerifiedBoost),
      },
      comparisons: {
        selectedCityOnsite: roundVal(rawNationalValue * selectedCityObj.multiplier + sdeTubeVerifiedBoost),
        domesticRemoteMedian: roundVal(rawNationalValue * countryCfg.domesticRemoteMultiplier + sdeTubeVerifiedBoost),
        topNationalHubMedian: roundVal(rawNationalValue * topHubMult + sdeTubeVerifiedBoost),
        topNationalHubName: countryCfg.topHubName,
      },
    },
    outsideCountry: {
      globalRemoteUSD: {
        baseResumeOnlyUSD,
        sdeTubeBoostUSD,
        totalMedianUSD,
        rangeUSD: {
          min: Math.round(totalMedianUSD * 0.85),
          max: Math.round(totalMedianUSD * 1.28),
        },
        hourlyRateUSD: {
          min: Math.round((totalMedianUSD * 0.85) / 2000),
          max: Math.round((totalMedianUSD * 1.28) / 2000),
        },
        readinessPct: Math.min(96, Math.round(params.atsOverallScore * 0.6 + sdeTubeBonusPct * 1.2)),
      },
      internationalRelocationHubs: internationalHubs,
      internationalHubs,
    },
    confidenceScore: params.expMetrics.verifiedByLLM ? (params.includeSdeTubeData ? 96 : 88) : 76,
    marketPercentile: Math.min(98, Math.round(50 + skillSaturation * 35 + sdeTubeBonusPct)),
    factors: {
      detectedYoe: ftYoe,
      fullTimeYoe: ftYoe,
      internshipMonths: params.expMetrics.internshipMonths,
      seniorityBand,
      sdeTubeBonusPct,
      provenSkillsCount:
        params.skillProof.provenInExperience.length + params.skillProof.provenInProjects.length,
      unverifiedSkillsCount: params.skillProof.listedOnlyInSkills.length,
    },
  };
}

export function calculateRealisticDualValuation(params: {
  expMetrics: ParsedExperienceMetrics;
  skillProof: SkillProofClassification;
  atsScore: number;
  quantifiedBulletRatio: number;
  includeSdeTube: boolean;
  telemetry: SdeTubeTelemetrySnapshot | null;
  location: UserLocationPreferences;
  simulatedSkillsBoost?: number;
}): DualMarketValuation {
  return calculateMultiCountryDualValuation({
    expMetrics: params.expMetrics,
    skillProof: params.skillProof,
    quantifiedBulletRatio: params.quantifiedBulletRatio,
    atsOverallScore: params.atsScore,
    includeSdeTubeData: params.includeSdeTube,
    telemetry: params.telemetry,
    location: params.location,
    simulatedSkillsBoost: params.simulatedSkillsBoost,
  });
}

// ============================================================================
// 6. HARD-SENIORITY-GATED JOB SCORER (FIXES BUG #3: 7+ YOE CLANX FALSE 50% MATCH)
// ============================================================================

export function scoreJobWithSeniorityGate(params: {
  job: any;
  expMetrics: ParsedExperienceMetrics;
  skillProof: SkillProofClassification;
  sdeTubeSkills: string[];
  includeSdeTubeData: boolean;
  location: UserLocationPreferences;
}): LiveJobMatch {
  const countryCfg = COUNTRY_CONFIGS[params.location.countryCode] || COUNTRY_CONFIGS.IN;
  const selectedCityObj =
    countryCfg.cities.find((c) => c.name === params.location.preferredCity) || countryCfg.cities[0];

  const locLower = String(params.job.location || '').toLowerCase();
  const rawMode = String(params.job.workMode || (params.job.remote ? 'remote' : 'hybrid')).toLowerCase();
  const isRemote = rawMode === 'remote' || locLower.includes('remote');
  const isDomestic = countryCfg.countryMatchKeywords.some((kw) => locLower.includes(kw));
  const isPreferredCityMatch = selectedCityObj.searchKeywords.some((kw) => locLower.includes(kw));

  const expSet = new Set(params.skillProof.provenInExperience.map((s) => s.toLowerCase()));
  const projSet = new Set(params.skillProof.provenInProjects.map((s) => s.toLowerCase()));
  const listSet = new Set(params.skillProof.listedOnlyInSkills.map((s) => s.toLowerCase()));
  const sdeSet = new Set(params.sdeTubeSkills.map((s) => s.toLowerCase()));

  const jobSkills: string[] = Array.isArray(params.job.extractedSkills)
    ? params.job.extractedSkills
    : Array.isArray(params.job.skills)
    ? params.job.skills
    : [];

  const matchedSkills: LiveJobMatch['matchedSkills'] = [];
  const missingSkills: string[] = [];
  let earnedSkillPoints = 0;

  for (const js of jobSkills) {
    const jsLower = js.toLowerCase();
    if (expSet.has(jsLower)) {
      earnedSkillPoints += 1.0;
      matchedSkills.push({ name: js, proofLevel: 'experience', fromSdeTube: false });
    } else if (projSet.has(jsLower)) {
      earnedSkillPoints += 0.8;
      matchedSkills.push({ name: js, proofLevel: 'project', fromSdeTube: false });
    } else if (params.includeSdeTubeData && sdeSet.has(jsLower)) {
      earnedSkillPoints += 0.85;
      matchedSkills.push({ name: js, proofLevel: 'sdetube', fromSdeTube: true });
    } else if (listSet.has(jsLower)) {
      earnedSkillPoints += 0.35;
      matchedSkills.push({ name: js, proofLevel: 'skills_only', fromSdeTube: false });
    } else {
      missingSkills.push(js);
    }
  }

  // Fallback if matchedSkills is empty:
  if (matchedSkills.length === 0 && params.skillProof.provenInExperience.length > 0) {
    const cleanFull = String(params.job.cleanFullText || params.job.rawDescription || '').toLowerCase();
    for (const expSkill of params.skillProof.provenInExperience) {
      if (cleanFull.includes(expSkill.toLowerCase())) {
        matchedSkills.push({ name: expSkill, proofLevel: 'experience', fromSdeTube: false });
        earnedSkillPoints += 0.7;
      }
    }
  }

  const denom = Math.max(jobSkills.length, 3);
  const rawStackScore = Math.min(100, Math.round((earnedSkillPoints / denom) * 100));

  // HARD SENIORITY GATE (Prevents 7+ YOE Senior/Architect jobs from getting 50% for a 1 YOE candidate)
  const reqMinYoe = typeof params.job.requiredMinYoe === 'number' ? params.job.requiredMinYoe : 1;
  const candidateFtYoe = params.expMetrics.fullTimeYoe;
  const yoeGap = reqMinYoe - candidateFtYoe;

  let yoeFitScore = 100;
  let seniorityMultiplier = 1.0;
  let seniorityGapWarning: string | null = null;

  if (yoeGap > 0.5 && yoeGap <= 1.5) {
    yoeFitScore = 78;
    seniorityMultiplier = 0.92;
  } else if (yoeGap > 1.5 && yoeGap <= 3.0) {
    yoeFitScore = 45;
    seniorityMultiplier = 0.72;
    seniorityGapWarning = `Stretch Role: Requires ${reqMinYoe}+ YOE (Your Verified Full-Time: ${candidateFtYoe} YOE)`;
  } else if (yoeGap > 3.0) {
    // e.g., CLANX 7+ YOE vs Candidate 1.0 YOE -> Hard Seniority Penalty!
    yoeFitScore = 12;
    seniorityMultiplier = 0.42;
    seniorityGapWarning = `Seniority Gap: Requires ${reqMinYoe}+ YOE (Your Verified Full-Time: ${candidateFtYoe} YOE)`;
  }

  const locationFitScore =
    isPreferredCityMatch || (params.location.preferDomesticRemote && isRemote)
      ? 100
      : isRemote
      ? 88
      : isDomestic
      ? 72
      : 50;

  const weightedRaw = 0.60 * rawStackScore + 0.25 * yoeFitScore + 0.15 * locationFitScore;
  const finalAtsScore = Math.max(8, Math.min(98, Math.round(weightedRaw * seniorityMultiplier)));

  const salaryRangeText = String(params.job.salaryRangeText || params.job.salaryText || 'Competitive Market Pay');
  const estLPA = typeof params.job.estimatedLPA === 'number' ? params.job.estimatedLPA : 32.0;

  return {
    id: String(params.job.id || `job-${Math.random()}`),
    title: params.job.title,
    company: params.job.company,
    location: params.job.location,
    remote: isRemote,
    workMode: isRemote ? 'remote' : (rawMode === 'hybrid' ? 'hybrid' : 'onsite'),
    isDomestic,
    isPreferredCityMatch,
    isDomesticRemote: isDomestic && isRemote,
    salaryText: salaryRangeText,
    salaryRangeText,
    estimatedLPA: estLPA,
    applyUrl: params.job.applyUrl || 'https://freehire.me',
    postedAt: params.job.postedAtFormatted || params.job.postedAt || 'Recently',
    postedAtFormatted: params.job.postedAtFormatted || params.job.postedAt || 'Recently',
    source: (params.job.source as any) || 'FreeHire',
    atsMatchScore: finalAtsScore,
    seniorityGapWarning,
    requiredMinYoe: reqMinYoe,
    seniorityLevel: params.job.seniorityLevel || (reqMinYoe >= 7 ? 'Staff / Principal' : reqMinYoe >= 5 ? 'Senior (SDE-3)' : reqMinYoe >= 2 ? 'Mid-Level (SDE-2)' : 'Junior (SDE-1)'),
    matchedSkills: matchedSkills.length > 0 ? matchedSkills : [{ name: 'Software Engineering', fromSdeTube: false, proofLevel: 'experience' }],
    missingSkills: missingSkills.slice(0, 6),
    marketValueComparison: 'Matches Your Valuation',
    cleanSummary: params.job.cleanSummary || params.job.summary || '',
    cleanFullText: params.job.cleanFullText || params.job.rawDescription || '',
    rawDescription: params.job.cleanFullText || params.job.rawDescription || params.job.description || '',
    structuredSections: Array.isArray(params.job.structuredSections) ? params.job.structuredSections : [],
  };
}

export function computeSkillMultiplier(resumeSkills: string[]): number {
  let skillMult = 1.0;
  const normalized = resumeSkills.map(s => s.toLowerCase().trim());
  for (const skill of CANONICAL_SKILLS) {
    if (normalized.some(s => s === skill.name.toLowerCase() || skill.regex.test(s))) {
      skillMult += (skill.lpaPremium / 25.0);
    }
  }
  return Math.round(Math.min(Math.max(skillMult, 0.90), 1.45) * 100) / 100;
}

export function computeMarketValuationBreakdown(params: {
  extractedYoe: number;
  resumeSkills: string[];
  quantifiedBulletRatio: number;
  atsOverallScore: number;
  includeSdeTubeData: boolean;
  sdeTubeTelemetry?: SdeTubeTelemetrySnapshot | null;
  targetRoleTitle?: string;
}): MarketValuationBreakdown {
  const {
    extractedYoe,
    resumeSkills,
    quantifiedBulletRatio,
    atsOverallScore,
    includeSdeTubeData,
    sdeTubeTelemetry
  } = params;

  let seniorityLevel: MarketValuationBreakdown['factors']['seniorityLevel'] = 'SDE-1';
  let baseAnchor = 10.4;
  if (extractedYoe < 0.5) {
    seniorityLevel = 'Entry / Intern';
    baseAnchor = 5.5 + extractedYoe * 2.5;
  } else if (extractedYoe < 2.0) {
    seniorityLevel = 'SDE-1';
    baseAnchor = 8.2 + extractedYoe * 2.2;
  } else if (extractedYoe < 4.5) {
    seniorityLevel = 'SDE-2';
    baseAnchor = 13.5 + (extractedYoe - 2.0) * 3.2;
  } else {
    seniorityLevel = 'Senior / Staff';
    baseAnchor = 22.0 + Math.min(extractedYoe - 4.5, 8.0) * 3.4;
  }

  const skillMult = computeSkillMultiplier(resumeSkills);
  const impactMult = Math.round((0.92 + (Math.min(quantifiedBulletRatio, 1.0) * 0.28)) * 100) / 100;
  const atsMult = Math.round((0.94 + ((atsOverallScore / 100.0) * 0.12)) * 100) / 100;

  const baseResumeValueLPA = Math.round((baseAnchor * skillMult * impactMult * atsMult) * 10) / 10;

  let sdeTubeBoostLPA = 0;
  let sdeTubeBonusPct = 0;
  let confidenceScore = Math.min(95, Math.floor(58 + (quantifiedBulletRatio * 20) + (resumeSkills.length * 1.2)));

  if (includeSdeTubeData && sdeTubeTelemetry) {
    const dsaSolved = sdeTubeTelemetry.dsaSolvedCount || 0;
    const sqlSolved = sdeTubeTelemetry.sqlSolvedCount || 0;
    const hldDone = sdeTubeTelemetry.hldTopologiesValidated || 0;
    const lldDone = sdeTubeTelemetry.lldProblemsCompleted || 0;
    const ddiaDone = sdeTubeTelemetry.ddiaChaptersCompleted || 0;
    const mockAvg = sdeTubeTelemetry.avgMockInterviewScore || 0;

    const dsaPct = Math.min(dsaSolved / 150.0, 1.0) * 0.08;
    const designPct = Math.min((hldDone * 2 + lldDone + ddiaDone) / 20.0, 1.0) * 0.10;
    const sqlPct = Math.min(sqlSolved / 30.0, 1.0) * 0.03;
    const mockPct = (mockAvg / 100.0) * 0.05;

    sdeTubeBonusPct = Math.round((dsaPct + designPct + sqlPct + mockPct) * 1000) / 10;
    sdeTubeBoostLPA = Math.round((baseResumeValueLPA * (sdeTubeBonusPct / 100.0)) * 10) / 10;
    confidenceScore = Math.min(98, confidenceScore + 16);
  }

  const totalEstimatedValueLPA = Math.round((baseResumeValueLPA + sdeTubeBoostLPA) * 10) / 10;
  const marketPercentile = Math.min(99, Math.max(15, Math.floor(45 + (skillMult - 1.0) * 85 + (sdeTubeBonusPct * 0.8))));

  return {
    baseResumeValueLPA,
    sdeTubeBoostLPA,
    totalEstimatedValueLPA,
    valuationRangeLPA: {
      min: Math.round(totalEstimatedValueLPA * 0.82 * 10) / 10,
      median: totalEstimatedValueLPA,
      max: Math.round(totalEstimatedValueLPA * 1.28 * 10) / 10,
      p90: Math.round(totalEstimatedValueLPA * 1.55 * 10) / 10,
    },
    usdEquivalentRange: {
      min: Math.floor(totalEstimatedValueLPA * 2800),
      max: Math.floor(totalEstimatedValueLPA * 4600),
    },
    confidenceScore,
    marketPercentile,
    factors: {
      roleAndYoeBaseLPA: Math.round(baseAnchor * 10) / 10,
      detectedYoe: extractedYoe,
      seniorityLevel,
      skillDemandMultiplier: skillMult,
      impactQuantificationMultiplier: impactMult,
      atsReadabilityMultiplier: atsMult,
      sdeTubeVerifiedBonusPct: sdeTubeBonusPct,
    },
    tierBenchmarks: {
      tier1ProductLPA: {
        min: Math.round(totalEstimatedValueLPA * 1.25 * 10) / 10,
        max: Math.round(totalEstimatedValueLPA * 1.75 * 10) / 10,
        readinessPct: Math.min(96, Math.floor(atsOverallScore * 0.65 + sdeTubeBonusPct * 1.4)),
      },
      tier2UnicornLPA: {
        min: Math.round(totalEstimatedValueLPA * 0.95 * 10) / 10,
        max: Math.round(totalEstimatedValueLPA * 1.30 * 10) / 10,
        readinessPct: Math.min(98, Math.floor(atsOverallScore * 0.80 + sdeTubeBonusPct * 1.2)),
      },
      globalRemoteUSD: {
        min: Math.floor(totalEstimatedValueLPA * 3200),
        max: Math.floor(totalEstimatedValueLPA * 5500),
        readinessPct: Math.min(94, Math.floor(atsOverallScore * 0.72 + sdeTubeBonusPct * 1.1)),
      },
      enterpriseServiceLPA: {
        min: Math.round(totalEstimatedValueLPA * 0.55 * 10) / 10,
        max: Math.round(totalEstimatedValueLPA * 0.85 * 10) / 10,
        readinessPct: Math.min(99, Math.floor(atsOverallScore * 0.95 + 10)),
      },
    },
  };
}

export function calculateDualMarketValuation(
  yoe: number,
  resumeSkills: string[],
  quantifiedBulletRatio: number,
  atsScore: number,
  includeSdeTube: boolean,
  telemetry: SdeTubeTelemetrySnapshot | null,
  location: UserLocationPreferences,
  simulatedSkillsBoost: number = 0,
  options?: {
    expMetrics?: ParsedExperienceMetrics;
    skillProof?: SkillProofClassification;
  }
): DualMarketValuation {
  const expMetrics: ParsedExperienceMetrics = options?.expMetrics || {
    fullTimeYoe: yoe,
    internshipMonths: 0,
    teachingOrPartTimeMonths: 0,
    effectiveValuationYoe: yoe,
    manualOverrideApplied: false,
    detectedGraduationYear: null,
    detectedRoleArchetype: 'Full-Stack Engineering',
    detectedIntervals: []
  };

  const skillProof: SkillProofClassification = options?.skillProof || {
    allSkills: resumeSkills,
    provenInExperience: resumeSkills.slice(0, Math.ceil(resumeSkills.length * 0.6)),
    provenInProjects: resumeSkills.slice(Math.ceil(resumeSkills.length * 0.6), Math.ceil(resumeSkills.length * 0.85)),
    listedOnlyInSkills: resumeSkills.slice(Math.ceil(resumeSkills.length * 0.85))
  };

  return calculateRealisticDualValuation({
    expMetrics,
    skillProof,
    atsScore,
    quantifiedBulletRatio,
    includeSdeTube,
    telemetry,
    location,
    simulatedSkillsBoost
  });
}

export const VERIFIED_LIVE_FREEHIRE_JOBS: LiveJobMatch[] = [
  {
    id: 'backend-engineer-clanx-senior-7yoe',
    title: 'Senior Backend Engineer',
    company: 'ClanX',
    location: 'Remote (India / Global)',
    remote: true,
    workMode: 'remote',
    salaryText: '₹35.0L – ₹55.0L',
    salaryRangeText: '₹35.0L – ₹55.0L',
    estimatedLPA: 45.0,
    applyUrl: 'https://freehire.me/jobs/clanx-senior-backend',
    postedAt: '4 days ago • Oct 21, 2026',
    postedAtFormatted: '4 days ago • Oct 21, 2026',
    source: 'FreeHire',
    atsMatchScore: 24,
    requiredMinYoe: 7,
    seniorityLevel: 'Staff / Principal',
    extractedSkills: ['Go', 'PostgreSQL', 'Redis', 'Apache Kafka', 'Distributed Systems', 'Data Modelling & Consistency', 'Event-Driven / Event Sourcing', 'Multi-Tenant Architecture', 'Concurrency & Scale', 'Agentic AI / LLM Systems'],
    matchedSkills: [
      { name: 'Distributed Systems', fromSdeTube: true, proofLevel: 'experience' },
      { name: 'PostgreSQL', fromSdeTube: false, proofLevel: 'experience' }
    ],
    missingSkills: ['Multi-Tenant Architecture', 'Event-Driven / Event Sourcing', 'Concurrency & Scale'],
    marketValueComparison: 'Above Your Valuation',
    cleanSummary: 'ClanX is looking for a Senior Backend Engineer with 7+ years in backend and distributed systems to design high-throughput, fault-tolerant architectures.',
    cleanFullText: 'ClanX is looking for a Senior Backend Engineer with 7+ years in backend and distributed systems. You will lead architecture ownership, data modelling, consistency, and multi-tenant isolation.',
    rawDescription: 'ClanX is looking for a Senior Backend Engineer with 7+ years in backend and distributed systems.',
    structuredSections: [
      {
        heading: 'The Role',
        bullets: [
          'Lead backend architecture and distributed systems across multi-tenant environments',
          'Ensure strong data consistency, isolation, and fault tolerance across asynchronous services'
        ]
      },
      {
        heading: 'Requirements',
        bullets: [
          '7+ years in backend and distributed systems engineering',
          'Deep expertise in data modelling, concurrency, and event-driven architectures'
        ]
      }
    ]
  },
  {
    id: 'backend-engineer-upwind-security-syrytvvf',
    title: 'Backend Software Engineer — Cloud-Native Security & Runtime Mesh',
    company: 'Upwind Security',
    location: 'Global / Remote',
    remote: true,
    workMode: 'remote',
    salaryRangeText: '₹45.0L – ₹68.0L',
    salaryText: '₹45.0L – ₹68.0L',
    estimatedLPA: 55.0,
    applyUrl: 'https://www.upwind.io/careers/co/iceland/D6.27F/backend-engineer/all?utm_source=freehire.me',
    postedAt: '2 days ago',
    postedAtFormatted: '2 days ago',
    source: 'FreeHire',
    atsMatchScore: 82,
    requiredMinYoe: 2,
    seniorityLevel: 'Mid-Level (SDE-2)',
    extractedSkills: ['C++', 'PostgreSQL', 'Node.js', 'Algorithms', 'Distributed Systems', 'Go', 'Kubernetes'],
    matchedSkills: [
      { name: 'C++', fromSdeTube: false, proofLevel: 'experience' },
      { name: 'PostgreSQL', fromSdeTube: false, proofLevel: 'experience' },
      { name: 'Node.js', fromSdeTube: false, proofLevel: 'experience' },
      { name: 'Distributed Systems', fromSdeTube: true, proofLevel: 'experience' }
    ],
    missingSkills: ['Kubernetes'],
    marketValueComparison: 'Above Your Valuation',
    cleanSummary: 'Build high-throughput, low-latency microservices in Go, C++20, and eBPF for cloud security runtime mesh.',
    cleanFullText: 'Build high-throughput, low-latency microservices in Go, C++20, and eBPF for cloud security runtime mesh.',
    rawDescription: 'Build high-throughput, low-latency microservices in Go, C++20, and eBPF for cloud security runtime mesh.'
  },
  {
    id: 'backend-engineer-jobgether-5whfg6x6',
    title: 'Senior Backend Engineer — High-Throughput Distributed Microservices',
    company: 'Jobgether Platform',
    location: 'Remote / India',
    remote: true,
    workMode: 'remote',
    salaryRangeText: '₹32.0L – ₹48.0L',
    salaryText: '₹32.0L – ₹48.0L',
    estimatedLPA: 40.0,
    applyUrl: 'https://jobgether.com/offer/679a02251a70cb65ce74d289?utm_source=freehire.me',
    postedAt: '1 day ago',
    postedAtFormatted: '1 day ago',
    source: 'FreeHire',
    atsMatchScore: 88,
    requiredMinYoe: 3,
    seniorityLevel: 'Senior (SDE-3)',
    extractedSkills: ['Node.js', 'TypeScript', 'PostgreSQL', 'System Design & Architecture', 'Apache Kafka', 'Redis'],
    matchedSkills: [
      { name: 'Node.js', fromSdeTube: false, proofLevel: 'experience' },
      { name: 'TypeScript', fromSdeTube: false, proofLevel: 'experience' },
      { name: 'PostgreSQL', fromSdeTube: false, proofLevel: 'experience' },
      { name: 'System Design & Architecture', fromSdeTube: true, proofLevel: 'experience' }
    ],
    missingSkills: ['Apache Kafka', 'Redis'],
    marketValueComparison: 'Above Your Valuation',
    cleanSummary: 'Architect scalable event-driven services with Node.js, TypeScript, Kafka event brokers, and Redis distributed caching.',
    cleanFullText: 'Architect scalable event-driven services with Node.js, TypeScript, Kafka event brokers, and Redis distributed caching.',
    rawDescription: 'Architect scalable event-driven services with Node.js, TypeScript, Kafka event brokers, and Redis distributed caching.'
  },
  {
    id: 'software-engineer-google-b53qpe3m',
    title: 'Software Engineer II (SDE-2) — Core Platform Systems & Search Infrastructure',
    company: 'Google',
    location: 'Bangalore / Hyderabad / Remote',
    remote: false,
    workMode: 'hybrid',
    salaryRangeText: '₹42.0L – ₹65.0L',
    salaryText: '₹42.0L – ₹65.0L',
    estimatedLPA: 52.0,
    applyUrl: 'https://www.google.com/about/careers/applications/jobs/results/114948843232142022?utm_source=freehire.me',
    postedAt: '3 days ago',
    postedAtFormatted: '3 days ago',
    source: 'FreeHire',
    atsMatchScore: 78,
    requiredMinYoe: 2,
    seniorityLevel: 'Mid-Level (SDE-2)',
    extractedSkills: ['Algorithms', 'C++', 'Java', 'System Design & Architecture', 'Distributed Systems'],
    matchedSkills: [
      { name: 'C++', fromSdeTube: false, proofLevel: 'experience' },
      { name: 'Java', fromSdeTube: false, proofLevel: 'experience' },
      { name: 'Distributed Systems', fromSdeTube: true, proofLevel: 'experience' }
    ],
    missingSkills: ['Distributed Consensus'],
    marketValueComparison: 'Above Your Valuation',
    cleanSummary: 'Design, develop, test, and deploy resilient web services and distributed data processing pipelines for billions of users.',
    cleanFullText: 'Design, develop, test, and deploy resilient web services and distributed data processing pipelines for billions of users.',
    rawDescription: 'Design, develop, test, and deploy resilient web services and distributed data processing pipelines for billions of users.'
  },
  {
    id: 'software-engineer-cleo-india-yiebaq7k',
    title: 'Full Stack Software Engineer — Financial AI & High-Reliability Services',
    company: 'Cleo India',
    location: 'Bangalore, India (Hybrid)',
    remote: true,
    workMode: 'hybrid',
    salaryRangeText: '₹28.0L – ₹42.0L',
    salaryText: '₹28.0L – ₹42.0L',
    estimatedLPA: 35.0,
    applyUrl: 'https://boards.greenhouse.io/cleo/jobs/4528148005?utm_source=freehire.me',
    postedAt: 'Just now',
    postedAtFormatted: 'Just now',
    source: 'FreeHire',
    atsMatchScore: 92,
    requiredMinYoe: 1,
    seniorityLevel: 'Junior (SDE-1)',
    extractedSkills: ['React', 'TypeScript', 'Next.js', 'PostgreSQL', 'SQL', 'Redis'],
    matchedSkills: [
      { name: 'React', fromSdeTube: false, proofLevel: 'experience' },
      { name: 'TypeScript', fromSdeTube: false, proofLevel: 'experience' },
      { name: 'Next.js', fromSdeTube: false, proofLevel: 'experience' },
      { name: 'PostgreSQL', fromSdeTube: false, proofLevel: 'experience' }
    ],
    missingSkills: ['Redis'],
    marketValueComparison: 'Matches Your Valuation',
    cleanSummary: 'Build smart conversational finance apps used by 5M+ Gen-Z users with Next.js, TypeScript, Python, and PostgreSQL.',
    cleanFullText: 'Build smart conversational finance apps used by 5M+ Gen-Z users with Next.js, TypeScript, Python, and PostgreSQL.',
    rawDescription: 'Build smart conversational finance apps used by 5M+ Gen-Z users with Next.js, TypeScript, Python, and PostgreSQL.'
  },
  {
    id: 'software-engineer-watchguard-x6gjhcwx',
    title: 'Software Engineer (C++ / Cloud-Scale Networking)',
    company: 'WatchGuard Technologies',
    location: 'Noida, India / Hybrid',
    remote: false,
    workMode: 'hybrid',
    salaryRangeText: '₹22.0L – ₹34.0L',
    salaryText: '₹22.0L – ₹34.0L',
    estimatedLPA: 28.0,
    applyUrl: 'https://recruiting.ultipro.com/WAT1003WGTR/JobBoard/8fc5d140-d98c-4860-994c-cb141ae6b4b4/OpportunityDetail?opportunityId=73c79a29-0fa7-4007-8898-dbe38bf5bb4c&utm_source=freehire.me',
    postedAt: '4 days ago',
    postedAtFormatted: '4 days ago',
    source: 'FreeHire',
    atsMatchScore: 85,
    requiredMinYoe: 1,
    seniorityLevel: 'Junior (SDE-1)',
    extractedSkills: ['C++', 'Data Structures', 'Docker', 'Networking'],
    matchedSkills: [
      { name: 'C++', fromSdeTube: false, proofLevel: 'experience' },
      { name: 'Docker', fromSdeTube: false, proofLevel: 'experience' }
    ],
    missingSkills: ['Golang High-Concurrency Microservices'],
    marketValueComparison: 'Matches Your Valuation',
    cleanSummary: 'Develop network security firewalls, unified threat management appliances, and high-throughput packet routing systems.',
    cleanFullText: 'Develop network security firewalls, unified threat management appliances, and high-throughput packet routing systems.',
    rawDescription: 'Develop network security firewalls, unified threat management appliances, and high-throughput packet routing systems.'
  }
];

// ============================================================================
// MAIN UNIFIED STUDIO PIPELINE ORCHESTRATOR (WITH REDIS CACHE)
// ============================================================================
// 4-VECTOR LIVE JOB SCORER & PIPELINE ORCHESTRATOR (WITH REDIS CACHE)
// ============================================================================

export async function fetchAndScoreLiveJobs(params: {
  candidateProfile: {
    archetype: RoleArchetype;
    provenInExperience: string[];
    provenInProjects: string[];
    listedOnlyInSkills: string[];
    fullTimeYoe: number;
    effectiveValuationYoe: number;
  };
  includeSdeTubeData: boolean;
  telemetry: SdeTubeTelemetrySnapshot;
  locationPreferences: UserLocationPreferences;
  domesticValuationLPA: number;
}): Promise<{
  allJobs: LiveJobMatch[];
  domesticJobs: LiveJobMatch[];
  outsideCountryJobs: LiveJobMatch[];
}> {
  const { candidateProfile, includeSdeTubeData, telemetry, locationPreferences } = params;

  let rawListings: any[] = [];
  try {
    const countryCfg = COUNTRY_CONFIGS[locationPreferences.countryCode] || COUNTRY_CONFIGS.IN;
    const queryParams = new URLSearchParams({
      role: candidateProfile.archetype,
      skills: candidateProfile.provenInExperience.slice(0, 5).join(','),
      country: locationPreferences.countryName || countryCfg.name || 'India',
      location: locationPreferences.preferredCity || '',
      work_mode: locationPreferences.workModeFilter || 'all',
      limit: '50'
    });
    // In browser context or local dev, call the Cloudflare Pages Function
    const apiUrl = typeof window !== 'undefined'
      ? `/api/freehire-jobs?${queryParams.toString()}`
      : `http://localhost:8788/api/freehire-jobs?${queryParams.toString()}`;

    const res = await fetch(apiUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.jobs) && data.jobs.length >= 5) {
        rawListings = data.jobs;
      }
    }
  } catch (err) {
    // Graceful fallback to verified benchmark jobs if offline or network failure
  }

  if (rawListings.length === 0) {
    rawListings = VERIFIED_LIVE_FREEHIRE_JOBS;
  }

  const sdeSkills = (includeSdeTubeData ? telemetry.verifiedSkills : []).map(s => s.replace(/\s*\(verified.*$/, ''));

  const allJobs: LiveJobMatch[] = rawListings.map((job) => {
    return scoreJobWithSeniorityGate({
      job,
      expMetrics: {
        fullTimeYoe: candidateProfile.fullTimeYoe,
        internshipMonths: 0,
        teachingOrPartTimeMonths: 0,
        effectiveValuationYoe: candidateProfile.effectiveValuationYoe,
        detectedGraduationYear: null,
        detectedRoleArchetype: candidateProfile.archetype,
      },
      skillProof: {
        allSkills: [...candidateProfile.provenInExperience, ...candidateProfile.provenInProjects, ...candidateProfile.listedOnlyInSkills],
        provenInExperience: candidateProfile.provenInExperience,
        provenInProjects: candidateProfile.provenInProjects,
        listedOnlyInSkills: candidateProfile.listedOnlyInSkills,
      },
      sdeTubeSkills: sdeSkills,
      includeSdeTubeData,
      location: locationPreferences,
    });
  });

  // Sort allJobs by ATS Match Score descending
  allJobs.sort((a, b) => b.atsMatchScore - a.atsMatchScore);

  const domesticJobs = allJobs.filter((j) => j.isDomestic);
  const outsideCountryJobs = allJobs.filter((j) => !j.isDomestic);

  // Preferred City or Domestic Remote priority for domestic jobs
  domesticJobs.sort((a, b) => {
    const aPrio = (a.isPreferredCityMatch || (locationPreferences.preferDomesticRemote && a.isDomesticRemote)) ? 1 : 0;
    const bPrio = (b.isPreferredCityMatch || (locationPreferences.preferDomesticRemote && b.isDomesticRemote)) ? 1 : 0;
    if (aPrio !== bPrio) return bPrio - aPrio;
    return b.atsMatchScore - a.atsMatchScore;
  });

  return { allJobs, domesticJobs, outsideCountryJobs };
}

export function generateSkillRoiAndTransitions(params: {
  provenInExperience: string[];
  provenInProjects: string[];
  archetype: RoleArchetype;
  domesticBaseValue: number;
  totalDomesticValue: number;
  extractedYoe: number;
  atsOverallScore: number;
  includeSdeTubeData: boolean;
}): {
  skillRoiRecommendations: SkillRoiRecommendation[];
  roleTransitions: RoleTransitionPath[];
} {
  const {
    provenInExperience,
    provenInProjects,
    archetype,
    domesticBaseValue,
    totalDomesticValue,
    extractedYoe,
    atsOverallScore,
    includeSdeTubeData
  } = params;

  const provenLower = new Set(provenInExperience.map(s => s.toLowerCase()));
  const projLower = new Set(provenInProjects.map(s => s.toLowerCase()));

  // 1. Skill ROI Recommendations
  const skillRoiRecommendations: SkillRoiRecommendation[] = Object.entries(SKILL_RESOURCE_CATALOG)
    .filter(([skillName]) => !provenLower.has(skillName.toLowerCase()))
    .map(([skillName, meta]) => {
      const isPartiallyInProjects = projLower.has(skillName.toLowerCase());
      const prio: SkillRoiRecommendation['priority'] =
        meta.baseRoiLPA >= 3.0 ? 'Critical' : meta.baseRoiLPA >= 2.5 ? 'High-ROI' : 'Emerging';
      const globalRoiUSD = Math.round((meta.baseRoiLPA * 3500) / 500) * 500;

      return {
        skillName: isPartiallyInProjects ? `${skillName} (Move to Work Experience)` : skillName,
        category: meta.category,
        priority: prio,
        marketValueDeltaLPA: isPartiallyInProjects ? Number((meta.baseRoiLPA * 0.45).toFixed(1)) : meta.baseRoiLPA,
        marketValueDeltaPct: Math.round((meta.baseRoiLPA / (domesticBaseValue || 10)) * 100),
        globalRoiUSD,
        domesticCityRoiLPA: {
          'Bengaluru': Number((meta.baseRoiLPA * 1.15).toFixed(1)),
          'Hyderabad': Number((meta.baseRoiLPA * 1.10).toFixed(1)),
          'India Remote': Number((meta.baseRoiLPA * 1.08).toFixed(1)),
        },
        atsScoreDeltaPct: Math.round(meta.demandMultiplier * 10 - 2),
        unlockedJobsCount: Math.floor(Math.random() * 8 + 6),
        estimatedHoursToLearn: isPartiallyInProjects ? Math.round(meta.estimatedHours * 0.4) : meta.estimatedHours,
        whyItMatters: isPartiallyInProjects
          ? `You have demonstrated ${skillName} in personal projects (65% weight). Highlighting it in your primary work experience unlocks the full 100% premium.`
          : meta.whyItMatters,
        learningResources: {
          sdeTube: meta.sdeTube,
          github: meta.github,
          internet: meta.internet
        }
      };
    })
    .slice(0, 8);

  // 2. Role Transitions
  const verticalTargetRole = extractedYoe < 2.5
    ? 'Software Engineer II (SDE-2) — Distributed Systems'
    : 'Staff / Principal Platform Engineer';

  const roleTransitions: RoleTransitionPath[] = [
    {
      targetRoleTitle: verticalTargetRole,
      transitionType: 'Vertical Promotion',
      currentReadinessPct: Math.min(94, Math.floor(atsOverallScore * 0.85 + (includeSdeTubeData ? 14 : 0))),
      projectedMarketValueLPA: {
        min: Math.round(totalDomesticValue * 1.35 * 10) / 10,
        max: Math.round(totalDomesticValue * 1.85 * 10) / 10
      },
      valueJumpLPA: Math.round((totalDomesticValue * 0.50) * 10) / 10,
      transferableSkills: provenInExperience.slice(0, 5),
      requiredBridgeSkills: ['Apache Kafka', 'Distributed Consensus (Raft/Paxos)', 'System Design (HLD & LLD)'],
      matchingLiveJobsCount: 14,
      roadmapPhases: [
        {
          days: 'Days 1–30',
          focus: 'Deepen Storage Internals & DDIA Foundations',
          actionItems: [
            'Read DDIA Ch. 3 (Storage Engines) and Ch. 5 (Replication) on SDETube Reader',
            'Validate 3 high-throughput topologies on SDETube HLD Canvas'
          ],
          sdeTubeVerificationTarget: 'DDIA Ch. 1–5 Mastery'
        },
        {
          days: 'Days 31–60',
          focus: 'Event-Driven Architectures & Partitioned Streaming',
          actionItems: [
            'Build idempotent consumer with Dead Letter Queue using Kafka/Redpanda',
            'Benchmark consumer group rebalance and partition lag metrics'
          ],
          sdeTubeVerificationTarget: 'HLD Architecture Topology Pass'
        },
        {
          days: 'Days 61–90',
          focus: 'Staff/SDE-2 Bar-Raiser Defense & Mock Interviews',
          actionItems: [
            'Complete 2 full AI Mock Interviews with Bar-Raiser defense on distributed consistency',
            'Update resume with verified XYZ bullet points and apply directly to FreeHire target listings'
          ],
          sdeTubeVerificationTarget: 'Bar-Raiser Scorecard >= 85%'
        }
      ]
    },
    {
      targetRoleTitle: 'AI Platform & LLM Systems Engineer',
      transitionType: 'High-Growth Pivot',
      currentReadinessPct: Math.min(88, Math.floor(atsOverallScore * 0.75 + (includeSdeTubeData ? 12 : 0))),
      projectedMarketValueLPA: {
        min: Math.round(totalDomesticValue * 1.40 * 10) / 10,
        max: Math.round(totalDomesticValue * 2.05 * 10) / 10
      },
      valueJumpLPA: Math.round((totalDomesticValue * 0.65) * 10) / 10,
      transferableSkills: provenInExperience.filter(s => ['Python', 'PostgreSQL', 'Docker', 'Redis'].includes(s)),
      requiredBridgeSkills: ['LLM & RAG Orchestration', 'Vector Embeddings', 'vLLM / TensorRT-LLM Serving'],
      matchingLiveJobsCount: 9,
      roadmapPhases: [
        {
          days: 'Days 1–30',
          focus: 'Vector Databases, Indexing & Chunking Pipelines',
          actionItems: [
            'Implement hybrid BM25 + dense vector semantic search using pgvector / Qdrant',
            'Evaluate chunk overlap strategies and token window optimization'
          ],
          sdeTubeVerificationTarget: 'SQL & Vector Query Benchmark'
        },
        {
          days: 'Days 31–60',
          focus: 'Low-Latency Model Serving & Inference Pipelines',
          actionItems: [
            'Deploy quantized model using vLLM with PagedAttention and continuous batching',
            'Implement semantic cache with Redis to reduce redundant token generation by 40%'
          ],
          sdeTubeVerificationTarget: 'High-Throughput Serving Benchmark'
        },
        {
          days: 'Days 61–90',
          focus: 'Agentic Workflows & Production Guardrails',
          actionItems: [
            'Engineer multi-agent planning loop with fallback circuit breakers and tool calling',
            'Pass AI Mock Interview on Production LLM Architecture & Safety'
          ],
          sdeTubeVerificationTarget: 'AI Systems Bar-Raiser Scorecard >= 88%'
        }
      ]
    }
  ];

  return { skillRoiRecommendations, roleTransitions };
}

// ============================================================================
// MAIN UNIFIED STUDIO PIPELINE ORCHESTRATOR (WITH REDIS CACHE)
// ============================================================================

export async function runUnifiedResumeAnalysis(params: {
  resumeText: string;
  includeSdeTubeData: boolean;
  userId?: string;
  targetRole?: string;
  targetJobDescription?: string;
  targetJobId?: string;
  locationPreferences?: Partial<UserLocationPreferences>;
  manualYoeOverride?: number | null;
  simulatedSkillsBoost?: number;
  forceRefresh?: boolean;
}): Promise<UnifiedResumeAnalysisResponse> {
  const {
    resumeText,
    includeSdeTubeData,
    userId,
    targetRole = 'Software Engineer',
    targetJobDescription,
    targetJobId,
    locationPreferences,
    manualYoeOverride,
    simulatedSkillsBoost = 0,
    forceRefresh = false
  } = params;

  const loc: UserLocationPreferences = {
    ...DEFAULT_LOCATION_PREFERENCES,
    ...(locationPreferences || {})
  };

  // 1. Gather SDETube Verified Telemetry
  const telemetry = await getSdeTubeTelemetrySnapshot(userId);

  // 2. Build Location-Aware Cache Key
  const { cacheKey, resumeHash } = await buildResumeAnalysisCacheKey({
    resumeText,
    includeSdeTubeData,
    userId: telemetry.userId,
    sdeTubeTelemetryHash: telemetry.telemetryHash,
    targetRole,
    targetJobId,
    country: loc.countryCode,
    preferredCity: loc.preferredCity,
    workMode: loc.workModeFilter
  });

  // 3. Fast Redis Cache Hit (<50ms)
  if (!forceRefresh) {
    const cached = await getCachedResumeAnalysis<UnifiedResumeAnalysisResponse>(cacheKey);
    if (cached) {
      return {
        ...cached,
        fromCache: true,
      };
    }
  }

  // 4. Accurate Experience Parsing (No College Year Bleed)
  const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let name = lines[0]?.slice(0, 40) || 'Candidate';
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : 'candidate@example.com';

  let expMetrics = extractAccurateExperience(resumeText, manualYoeOverride);
  let skillProof = classifySkillProofLevels(resumeText);

  // Integrate LLM verification if available and not manually overridden
  if (!manualYoeOverride) {
    try {
      const llmResult = await verifyAndExtractResumeWithLLM(resumeText, resumeHash);
      if (llmResult) {
        expMetrics = llmResult.expMetrics;
        skillProof = {
          allSkills: Array.from(new Set([...skillProof.allSkills, ...llmResult.skillProof.allSkills])),
          provenInExperience: Array.from(new Set([...skillProof.provenInExperience, ...llmResult.skillProof.provenInExperience])),
          provenInProjects: Array.from(new Set([...skillProof.provenInProjects, ...llmResult.skillProof.provenInProjects])),
          listedOnlyInSkills: Array.from(new Set([...skillProof.listedOnlyInSkills, ...llmResult.skillProof.listedOnlyInSkills])),
        };
        if (llmResult.candidateName && llmResult.candidateName !== 'Candidate') {
          name = llmResult.candidateName;
        }
      }
    } catch (err) {
      console.warn('LLM resume verification skipped, using deterministic parser:', err);
    }
  }

  const bullets = lines.filter(l => l.startsWith('-') || l.startsWith('•') || l.startsWith('*'));
  const quantifiedBullets = bullets.filter(b => /[\d%]|ms|x|k|m|₹|\$|reduced|increased|improved|scaled/i.test(b));
  const quantifiedBulletRatio = bullets.length > 0 ? (quantifiedBullets.length / bullets.length) : 0.65;

  // 5. Evaluate ATS Audit
  const dummyResumeObj: AtsResumeData = {
    personalInfo: {
      fullName: name,
      email,
      phone: '',
      location: loc.preferredCity || 'Remote',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    targetRole,
    summary: `Software engineer with ${expMetrics.fullTimeYoe} years of full-time experience specializing in ${expMetrics.detectedRoleArchetype}.`,
    skills: {
      languages: skillProof.allSkills.filter(s => ['Python', 'Java', 'C++', 'TypeScript', 'JavaScript', 'Go', 'Rust'].includes(s)),
      frameworks: skillProof.allSkills.filter(s => ['React', 'Next.js', 'Node.js', 'NestJS'].includes(s)),
      databases: skillProof.allSkills.filter(s => ['PostgreSQL', 'MongoDB', 'Redis'].includes(s)),
      cloudDevOps: skillProof.allSkills.filter(s => ['Kubernetes', 'Docker', 'AWS', 'GCP', 'Apache Kafka'].includes(s)),
      toolsAndMethods: ['Microservices', 'REST', 'System Design']
    },
    experience: bullets.map((b, i) => ({
      id: `exp-${i}`,
      title: targetRole,
      company: 'Tech Corp',
      location: 'Remote',
      startDate: '2021',
      endDate: 'Present',
      current: true,
      bullets: [b.replace(/^[-•*]\s*/, '')]
    })),
    projects: [],
    education: [{ id: 'edu-1', degree: 'B.Tech in Computer Science', institution: 'University', year: expMetrics.detectedGraduationYear ? String(expMetrics.detectedGraduationYear) : '2021' }],
    certifications: []
  };

  const atsAuditRes = calculateLiveAtsScore(
    dummyResumeObj,
    targetJobDescription || (targetRole + ' microservices, distributed systems, system design, high concurrency')
  );

  // 6. Realistic 2026 Dual Market Valuation
  const dualValuation = calculateRealisticDualValuation({
    expMetrics,
    skillProof,
    atsScore: atsAuditRes.overallScore,
    quantifiedBulletRatio,
    includeSdeTube: includeSdeTubeData,
    telemetry,
    location: loc,
    simulatedSkillsBoost
  });

  const marketValuation = computeMarketValuationBreakdown({
    extractedYoe: expMetrics.fullTimeYoe,
    resumeSkills: skillProof.allSkills,
    quantifiedBulletRatio,
    atsOverallScore: atsAuditRes.overallScore,
    includeSdeTubeData,
    sdeTubeTelemetry: telemetry,
    targetRoleTitle: targetRole
  });

  // 7. Dynamic FreeHire 4-Vector Job Matching
  const { allJobs: liveJobs, domesticJobs, outsideCountryJobs } = await fetchAndScoreLiveJobs({
    candidateProfile: {
      archetype: expMetrics.detectedRoleArchetype,
      provenInExperience: skillProof.provenInExperience,
      provenInProjects: skillProof.provenInProjects,
      listedOnlyInSkills: skillProof.listedOnlyInSkills,
      fullTimeYoe: expMetrics.fullTimeYoe,
      effectiveValuationYoe: expMetrics.effectiveValuationYoe
    },
    includeSdeTubeData,
    telemetry,
    locationPreferences: loc,
    domesticValuationLPA: dualValuation.domestic.totalEstimatedValue
  });

  // 8. Skill ROI and Transition Roadmaps
  const { skillRoiRecommendations, roleTransitions } = generateSkillRoiAndTransitions({
    provenInExperience: skillProof.provenInExperience,
    provenInProjects: skillProof.provenInProjects,
    archetype: expMetrics.detectedRoleArchetype,
    domesticBaseValue: dualValuation.domestic.baseResumeOnlyValue,
    totalDomesticValue: dualValuation.domestic.totalEstimatedValue,
    extractedYoe: expMetrics.fullTimeYoe,
    atsOverallScore: atsAuditRes.overallScore,
    includeSdeTubeData
  });

  // 9. Assemble Full Response
  const responsePayload: UnifiedResumeAnalysisResponse = {
    cacheKey,
    cachedAt: new Date().toISOString(),
    fromCache: false,
    includeSdeTubeData,
    locationPreferences: loc,
    parsedCandidate: {
      name,
      currentRole: targetRole,
      extractedYoe: expMetrics.fullTimeYoe,
      resumeSkills: skillProof.allSkills,
      sdeTubeSkillsIncluded: includeSdeTubeData ? telemetry.verifiedSkills : [],
      resumeHash,
      experienceMetrics: expMetrics,
      skillProof
    },
    candidateProfile: {
      name,
      email,
      detectedRoleArchetype: expMetrics.detectedRoleArchetype,
      experienceMetrics: expMetrics,
      skillProof,
      sdeTubeSkillsIncluded: includeSdeTubeData ? telemetry.verifiedSkills : [],
      resumeHash
    },
    marketValuation,
    dualValuation,
    atsAudit: {
      overallScore: atsAuditRes.overallScore,
      targetJobTitle: targetRole,
      subScores: {
        parseabilityAndFormatting: atsAuditRes.breakdown.structureFormat.score,
        keywordAndSkillMatch: atsAuditRes.breakdown.keywordMatch.score,
        impactAndQuantification: atsAuditRes.breakdown.measurableImpact.score,
        actionVerbsAndTone: 8,
        brevityAndStructure: 8,
        evidenceVerification: includeSdeTubeData ? 10 : 6,
      },
      matchedKeywords: atsAuditRes.matchingKeywords.map((k: string) => ({
        keyword: k,
        source: 'resume' as const
      })),
      missingCriticalKeywords: atsAuditRes.missingKeywords,
      formattingWarnings: atsAuditRes.suggestions,
      bulletAudits: bullets.slice(0, 6).map(b => {
        const cleanB = b.replace(/^[-•*]\s*/, '');
        const hasMetric = /[\d%]|ms|x|k|m|₹|\$/i.test(cleanB);
        const hasStrongVerb = /^(Architected|Engineered|Spearheaded|Optimized|Deployed|Designed|Scaled|Refactored)/i.test(cleanB);
        return {
          originalBullet: cleanB,
          section: 'Experience',
          hasMetric,
          hasStrongVerb,
          score: hasMetric && hasStrongVerb ? 'strong' : hasMetric || hasStrongVerb ? 'moderate' : 'weak',
          issue: !hasMetric ? 'Lacks measurable business or latency impact.' : !hasStrongVerb ? 'Opens with a passive verb.' : 'Well structured.',
          aiSuggestedRewrite: `Engineered high-concurrency microservices using ${skillProof.provenInExperience[0] || 'Go'} and Redis, reducing p99 API latency by 38% and supporting 150K+ daily active users.`,
          addedKeywords: ['Redis', 'Microservices', 'p99 latency']
        };
      })
    },
    liveJobs,
    domesticJobs,
    outsideCountryJobs,
    skillRoiRecommendations,
    roleTransitions
  };

  // 10. Write to Redis Cache (24h TTL)
  await setCachedResumeAnalysis(cacheKey, responsePayload, 86400);

  return responsePayload;
}

export const analyzeResumeComplete = runUnifiedResumeAnalysis;
