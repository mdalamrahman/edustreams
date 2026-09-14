import React, { useState, useEffect, useMemo } from 'react';
import { 
  Code2, 
  Cpu, 
  Database, 
  Network, 
  Play, 
  Trash2, 
  HardDrive, 
  HelpCircle, 
  ChevronRight, 
  Layers, 
  Send,
  Search,
  X,
  Sparkles,
  ArrowLeft,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { Navbar, AppTab } from './components/Navbar';
import { useSEO } from './lib/useSEO';
import { trackPageView } from './lib/analyticsTracker';
import { NotFoundPage } from './components/NotFoundPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsPage } from './components/TermsPage';
import { ThankYouPage } from './components/ThankYouPage';
import { ContactPage } from './components/ContactPage';
import { Footer } from './components/Footer';
import { StickyMobileCTA } from './components/StickyMobileCTA';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { VideoPlayer } from './components/VideoPlayer';
import { CodeWorkspace } from './components/CodeWorkspace';
import { QuizModule } from './components/QuizModule';
import { ResourceCard } from './components/ResourceCard';
import { VelocityTracker } from './components/VelocityTracker';
import { DiagnosticCard } from './components/DiagnosticCard';
import { MobileGatedOverlay } from './components/MobileGatedOverlay';
import { AuthModal } from './components/AuthModal';
import { AskAIChatModal } from './components/AskAIChatModal';
import { LoadingScreen } from './components/LoadingScreen';
import { SDESheetExplorer, findMatchingDsaVideo } from './components/SDESheetExplorer';
import { CompanyDSAProblems } from './components/CompanyDSAProblems';
import { LeetCodeWorkspaceModal } from './components/LeetCodeWorkspaceModal';
import { LeetCodeSQLWorkspaceModal } from './components/LeetCodeSQLWorkspaceModal';
import { isSqlProblem } from './lib/sqlJudge';
import { AINotesAndSimulation } from './components/AINotesAndSimulation';
import { SystemDesignHub } from './components/SystemDesignHub';
import { LLDHub } from './components/LLDHub';
import { HLDHub } from './components/HLDHub';
import { POTDModal } from './components/POTDModal';
import { DashboardLandingPage } from './components/DashboardLandingPage';
import { SDEProblem, DSAProblem, SDE_SHEET_DATA, SDE_SHEET_191_DATA, A2Z_DSA_SHEET_474_DATA, SDETUBE_79_SHEET_DATA, BLIND_75_SHEET_DATA, CODESTORYWITHMIK_SHEET_DATA } from './lib/dsaSheetsData';
import { useDevice } from './lib/device';
import { supabase, MOCK_CHANNELS, MOCK_VIDEOS } from './lib/supabase';
import { getCurrentStudent, signOutStudent, checkAndAutoLogin } from './lib/auth';
import { startSessionHeartbeat } from './lib/session';
import { recordRealActivity, markProblemSolved } from './lib/analytics';
import { Video, QuizQuestion } from './lib/types';
import { fetchCatalog, TELEGRAM_BACKEND_URL } from './lib/telegram';
import { requestMistralQuiz } from './lib/mistral';
import { handleVideoViewBilling, canAffordAction, deductCredits, syncWalletWithDatabase, PRICING_CONFIG } from './lib/billing';
import { InsufficientCreditsModal } from './components/InsufficientCreditsModal';
import { WalletTopupModal } from './components/WalletTopupModal';
import { UserProfileModal } from './components/UserProfileModal';
import { DeveloperProfilePage } from './components/DeveloperProfilePage';
import { InterviewCompanion } from './components/InterviewCompanion';

const sanitizeCaption = (cap?: string) => {
  if (!cap) return '';
  return cap
    .replace(/Follow Now:\s*https?:\/\/[^\s\n]+/gi, '')
    .replace(/https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+/gi, '')
    .trim();
};

const getInitialTab = (): AppTab => {
  if (typeof window === 'undefined') return 'dashboard';
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  const pathname = window.location.pathname || '';

  // Route any direct admin requests to dedicated Vercel Admin Portal
  if (pathname.startsWith('/admin') || hash.startsWith('#/admin')) {
    window.location.href = 'https://sdetube.vercel.app/';
    return 'dashboard';
  }

  const params = new URLSearchParams(search);
  const qTab = params.get('tab');
  if (qTab && ['dashboard', 'channels', 'lesson', 'sde_sheet', 'dsa_problems', 'lld', 'hld', 'system_design', 'interview', 'analytics', 'profile', 'settings', 'privacy', 'terms', 'thank_you', 'contact', 'not_found'].includes(qTab)) {
    return qTab as AppTab;
  }

  if (hash.startsWith('#/privacy') || pathname.startsWith('/privacy')) return 'privacy';
  if (hash.startsWith('#/terms') || pathname.startsWith('/terms')) return 'terms';
  if (hash.startsWith('#/thank-you') || pathname.startsWith('/thank-you') || hash.startsWith('#/conversion') || pathname.startsWith('/conversion')) return 'thank_you';
  if (hash.startsWith('#/contact') || pathname.startsWith('/contact')) return 'contact';
  if (hash.startsWith('#/404') || pathname.startsWith('/404')) return 'not_found';
  if (hash.startsWith('#/dsa-problems') || hash.startsWith('#/company') || pathname.startsWith('/dsa-problems') || pathname.startsWith('/company')) return 'dsa_problems';
  if (hash.startsWith('#/problem/') || hash.startsWith('#/dsa-sheets') || hash.startsWith('#/sde-sheet') || pathname.startsWith('/dsa-sheets') || pathname.startsWith('/sde-sheet')) return 'sde_sheet';
  if (hash.startsWith('#/lld') || pathname.startsWith('/lld')) return 'lld';
  if (hash.startsWith('#/hld') || pathname.startsWith('/hld') || hash.startsWith('#/system-design') || pathname.startsWith('/system-design')) return 'hld';
  if (hash.startsWith('#/interview') || pathname.startsWith('/interview')) return 'interview';
  if (hash.startsWith('#/profile') || hash.startsWith('#/user/') || pathname.startsWith('/profile')) return 'profile';
  if (hash.startsWith('#/analytics') || pathname.startsWith('/analytics')) return 'analytics';
  if (hash.startsWith('#/channels') || pathname.startsWith('/channels') || hash.startsWith('#/channel/')) return 'channels';
  if (hash.startsWith('#/lesson') || hash.startsWith('#/video') || pathname.startsWith('/lesson') || pathname.startsWith('/video')) return 'lesson';

  // Unknown hash route fallback -> 404
  if (hash && hash !== '#/' && hash !== '#/dashboard' && hash !== '#') {
    return 'not_found';
  }

  return 'dashboard';
};

const getInitialChannel = (): string => {
  if (typeof window === 'undefined') return MOCK_CHANNELS[0].id;
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  const pathname = window.location.pathname || '';
  const params = new URLSearchParams(search);
  const qCh = params.get('channel');
  if (qCh) return qCh;
  if (hash.startsWith('#/channel/')) return hash.replace('#/channel/', '').trim();
  if (pathname.startsWith('/channel/')) return pathname.replace('/channel/', '').trim();
  return MOCK_CHANNELS[0].id;
};

const getInitialChannelViewMode = (): 'overview' | 'detail' => {
  if (typeof window === 'undefined') return 'overview';
  const hash = window.location.hash || '';
  const pathname = window.location.pathname || '';
  if (hash.startsWith('#/channel/') || pathname.startsWith('/channel/')) return 'detail';
  return 'overview';
};

const getInitialVideo = (): Video => {
  if (typeof window === 'undefined') return MOCK_VIDEOS[0];
  try {
    const saved = localStorage.getItem('edustream_last_selected_video');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id) return parsed;
    }
  } catch {}
  return MOCK_VIDEOS[0];
};

export function App() {
  const { isMobile } = useDevice();
  const [activeTab, setActiveTab] = useState<AppTab>(getInitialTab);
  const [returnTarget, setReturnTarget] = useState<'channels' | 'sde_sheet'>('channels');
  const [channelViewMode, setChannelViewMode] = useState<'overview' | 'detail'>(getInitialChannelViewMode);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(getInitialChannel);
  const [selectedVideo, setSelectedVideo] = useState<Video>(getInitialVideo);
  const [dynamicVideos, setDynamicVideos] = useState<Video[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [channelCounts, setChannelCounts] = useState<Record<string, number>>({});
  const [lessonSubTab, setLessonSubTab] = useState<'quiz' | 'code'>('code');
  const [showMobileGating, setShowMobileGating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAskAIOpen, setIsAskAIOpen] = useState<boolean>(false);
  const [askAIMode, setAskAIMode] = useState<'video' | 'notes' | 'quiz' | 'code' | undefined>(undefined);
  const [askAITimestamp, setAskAITimestamp] = useState<number | undefined>(undefined);
  const [sdeFullscreenProblem, setSdeFullscreenProblem] = useState<SDEProblem | DSAProblem | null>(null);
  const [sdeFullscreenVideo, setSdeFullscreenVideo] = useState<Video | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [activeSqlProblem, setActiveSqlProblem] = useState<{ title: string; problem?: SDEProblem | DSAProblem } | null>(null);
  const [isPotdModalOpen, setIsPotdModalOpen] = useState<boolean>(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isInsufficientCreditsOpen, setIsInsufficientCreditsOpen] = useState<boolean>(false);
  const [insufficientMeta, setInsufficientMeta] = useState<{ cost: number; action: string }>({ cost: 2.0, action: 'Accessing Video Lecture' });

  // Dynamic SEO Metadata (Requirement 2, 3, 8)
  useSEO({
    activeTab,
    selectedVideo,
    activeProblem: sdeFullscreenProblem || (activeSqlProblem ? activeSqlProblem.problem : null),
  });

  // Track Page Views (Requirement 18)
  useEffect(() => {
    trackPageView(`/#/${activeTab}`, document.title);
  }, [activeTab]);

  const handleOpenPotdDirectly = () => {
    setIsPotdModalOpen(true);
  };

  const handleOpenVideoWithBilling = (v: Video, destination: 'channels' | 'sde_sheet' = 'channels') => {
    const billRes = handleVideoViewBilling(v.id, v.title, user?.email);
    if (!billRes.success) {
      setInsufficientMeta({
        cost: billRes.cost,
        action: `Unlocking Video Lecture (${billRes.cost === 2 ? 'First-time: ₹2.00 (24h Pass)' : 'Re-watch: ₹1.00 (24h Pass)'}): ${v.title}`
      });
      setIsInsufficientCreditsOpen(true);
      return;
    }
    setSelectedVideo(v);
    setReturnTarget(destination);
    navigateTo('lesson', { videoId: v.id });
  };

  const openAskAIWithMode = (mode?: 'video' | 'notes' | 'quiz' | 'code', timestamp?: number) => {
    window.dispatchEvent(new CustomEvent('sdetube_pause_video'));
    setAskAIMode(mode);
    setAskAITimestamp(timestamp);
    setIsAskAIOpen(true);
  };

  // URL Hash-Based Navigation & Page Stubs for Browser Back/Forward Support
  const navigateTo = (tab: AppTab, extra?: { channelId?: string; videoId?: string }) => {
    if (tab !== 'lesson') {
      window.dispatchEvent(new CustomEvent('sdetube_pause_video'));
    }
    let hash = `#/${
      tab === 'dashboard' ? 'dashboard' :
      tab === 'sde_sheet' ? 'dsa-sheets' :
      tab === 'dsa_problems' ? 'dsa-problems' :
      tab === 'lld' ? 'lld' :
      tab === 'hld' ? 'hld' :
      tab === 'system_design' ? 'system-design' :
      tab === 'interview' ? 'interview' :
      tab === 'profile' ? 'profile' :
      tab === 'thank_you' ? 'thank-you' :
      tab === 'not_found' ? '404' :
      tab
    }`;
    if (tab === 'channels' && extra?.channelId) {
      hash = `#/channel/${extra.channelId}`;
    } else if (tab === 'lesson' && extra?.videoId) {
      hash = `#/lesson/${encodeURIComponent(extra.videoId)}`;
    }
    setActiveTab(tab);
    if (tab === 'channels') {
      if (extra?.channelId) {
        setSelectedChannelId(extra.channelId);
        setChannelViewMode('detail');
      } else {
        setChannelViewMode('overview');
      }
    }
  };

  // Synchronize state on browser back/forward or hash change
  useEffect(() => {
    const handleHashSync = () => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const pathname = window.location.pathname || '';
      const urlParams = new URLSearchParams(search);

      // Check query param 'tab' first
      const queryTab = urlParams.get('tab');
      const queryChannel = urlParams.get('channel');
      const queryMsg = urlParams.get('msg');
      const queryVideo = urlParams.get('video');

      if (queryChannel || queryMsg || queryVideo) {
        const list = dynamicVideos.length > 0 ? dynamicVideos : MOCK_VIDEOS;
        const found = list.find(v => 
          (queryMsg && v.telegram_message_id === Number(queryMsg)) || 
          (queryVideo && (v.id === queryVideo || v.title.toLowerCase().includes(queryVideo.toLowerCase()))) ||
          (queryChannel && v.channel_id === queryChannel)
        );
        if (found) {
          setSelectedVideo(found);
          if (found.channel_id) setSelectedChannelId(found.channel_id);
        }
      }

      if (queryTab && ['dashboard', 'channels', 'lesson', 'sde_sheet', 'dsa_problems', 'lld', 'hld', 'system_design', 'interview', 'analytics', 'profile', 'settings'].includes(queryTab)) {
        setActiveTab(queryTab as any);
        return;
      }

      if (hash.startsWith('#/problem/')) {
        const pIdStr = hash.replace('#/problem/', '').trim();
        const allProbs: DSAProblem[] = [
          ...SDE_SHEET_191_DATA,
          ...A2Z_DSA_SHEET_474_DATA,
          ...SDETUBE_79_SHEET_DATA,
          ...BLIND_75_SHEET_DATA,
          ...CODESTORYWITHMIK_SHEET_DATA
        ];
        let found = allProbs.find((p) => 
          p.id.toString() === pIdStr || 
          p.slug === pIdStr ||
          (p.slug && pIdStr.toLowerCase() === p.slug.toLowerCase()) ||
          p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === pIdStr.toLowerCase().replace(/[^a-z0-9]/g, '')
        );

        if (!found && pIdStr) {
          const cleanName = pIdStr.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          found = {
            id: 9999,
            sheetType: 'sde',
            category: 'Algorithms',
            name: cleanName,
            difficulty: 'Medium',
            rating: '5.0 / 5',
            leetcode: `https://leetcode.com/problems/${pIdStr}/`,
            gfg: `https://www.geeksforgeeks.org/problems/${pIdStr}/1`,
            companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
            slug: pIdStr
          };
        }

        if (found) {
          if (isSqlProblem(found) || isSqlProblem(pIdStr)) {
            setActiveSqlProblem({ title: found.name, problem: found });
          } else {
            setSdeFullscreenProblem(found);
            const list = dynamicVideos.length > 0 ? dynamicVideos : MOCK_VIDEOS;
            const pName = found.name.toLowerCase().replace(/[^\w\s]/gi, ' ').trim();
            const pWords = pName.split(/\s+/).filter(w => w.length > 2);
            const matched = list.find((v) => {
              const vTitle = v.title.toLowerCase();
              return pWords.every(w => vTitle.includes(w)) || vTitle.includes(pName);
            }) || list.find(v => v.channel_id === 'ch-dsa-01') || list[0];
            setSdeFullscreenVideo(matched || null);
            setActiveTab('sde_sheet');
          }
        }
      } else {
        setSdeFullscreenProblem(null);
        if (hash === '#/potd') {
          setIsPotdModalOpen(true);
        } else if (hash.startsWith('#/dashboard') || pathname === '/dashboard') {
          setActiveTab('dashboard');
        } else if (hash.startsWith('#/channel/') || pathname.startsWith('/channel/')) {
          const chId = hash.replace('#/channel/', '').replace('/channel/', '');
          setSelectedChannelId(chId);
          setChannelViewMode('detail');
          setActiveTab('channels');
        } else if (hash.startsWith('#/lesson/') || hash.startsWith('#/video/') || pathname.startsWith('/lesson/') || pathname.startsWith('/video/')) {
          const vidId = decodeURIComponent(hash.replace(/^#\/(lesson|video)\//, '').replace(/^\/(lesson|video)\//, ''));
          const list = dynamicVideos.length > 0 ? dynamicVideos : MOCK_VIDEOS;
          const found = list.find((v) => v.id === vidId || v.title === vidId || String(v.telegram_message_id) === vidId);
          if (found) setSelectedVideo(found);
          setActiveTab('lesson');
        } else if (hash.startsWith('#/dsa-problems') || hash.startsWith('#/company') || pathname.startsWith('/dsa-problems') || pathname.startsWith('/company')) {
          setActiveTab('dsa_problems');
        } else if (hash.startsWith('#/dsa-sheets') || hash.startsWith('#/sde-sheet') || pathname.startsWith('/dsa-sheets') || pathname.startsWith('/sde-sheet')) {
          setActiveTab('sde_sheet');
        } else if (hash.startsWith('#/lld') || pathname.startsWith('/lld')) {
          setActiveTab('lld');
        } else if (hash.startsWith('#/hld') || pathname.startsWith('/hld')) {
          setActiveTab('hld');
        } else if (hash.startsWith('#/system-design') || pathname.startsWith('/system-design')) {
          setActiveTab('hld');
        } else if (hash.startsWith('#/interview') || pathname.startsWith('/interview')) {
          setActiveTab('interview');
        } else if (hash.startsWith('#/profile') || hash.startsWith('#/user/') || pathname.startsWith('/profile')) {
          setActiveTab('profile');
        } else if (hash.startsWith('#/analytics') || pathname.startsWith('/analytics')) {
          setActiveTab('analytics');
        } else if (hash.startsWith('#/channels') || pathname.startsWith('/channels')) {
          setActiveTab('channels');
          setChannelViewMode('overview');
        } else if (hash.startsWith('#/privacy') || pathname.startsWith('/privacy')) {
          setActiveTab('privacy');
        } else if (hash.startsWith('#/terms') || pathname.startsWith('/terms')) {
          setActiveTab('terms');
        } else if (hash.startsWith('#/thank-you') || pathname.startsWith('/thank-you') || hash.startsWith('#/conversion') || pathname.startsWith('/conversion')) {
          setActiveTab('thank_you');
        } else if (hash.startsWith('#/contact') || pathname.startsWith('/contact')) {
          setActiveTab('contact');
        } else if (hash.startsWith('#/admin') || pathname.startsWith('/admin')) {
          window.location.href = 'https://sdetube.vercel.app/';
          return;
        } else if (hash.startsWith('#/404') || pathname.startsWith('/404')) {
          setActiveTab('not_found');
        } else if (hash && hash !== '#/' && hash !== '#/dashboard' && hash !== '#') {
          setActiveTab('not_found');
        } else {
          setActiveTab('dashboard');
        }
      }
    };

    window.addEventListener('popstate', handleHashSync);
    window.addEventListener('hashchange', handleHashSync);
    handleHashSync();

    const onOpenSql = (e: any) => {
      const prob = e.detail?.problem;
      if (prob) {
        setActiveSqlProblem({ title: prob.name, problem: prob });
      }
    };
    window.addEventListener('sdetube_open_sql_arena', onOpenSql);

    return () => {
      window.removeEventListener('popstate', handleHashSync);
      window.removeEventListener('hashchange', handleHashSync);
      window.removeEventListener('sdetube_open_sql_arena', onOpenSql);
    };
  }, [dynamicVideos]);

  // Synchronize state with URL hash and query so reloading preserves exact page and lecture
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Pause any background video if coding modal or fullscreen problem is open
    if (sdeFullscreenProblem || isSqlModalOpen || activeSqlProblem || isPotdModalOpen) {
      const videos = document.querySelectorAll('video');
      videos.forEach(v => {
        try { v.pause(); } catch {}
      });
    }

    if (sdeFullscreenProblem) {
      const problemSlug = sdeFullscreenProblem.slug || sdeFullscreenProblem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const targetHash = `#/problem/${problemSlug}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', targetHash);
      }
      return;
    }

    if (activeSqlProblem) {
      const problemSlug = activeSqlProblem.problem?.slug || activeSqlProblem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const targetHash = `#/problem/${problemSlug}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', targetHash);
      }
      return;
    }

    if (selectedVideo) {
      try {
        localStorage.setItem('edustream_last_selected_video', JSON.stringify(selectedVideo));
      } catch {}
    }
    if (selectedChannelId) {
      try {
        localStorage.setItem('edustream_last_selected_channel', selectedChannelId);
      } catch {}
    }

    let targetHash = '#/' + (
      activeTab === 'sde_sheet' ? 'dsa-sheets' :
      activeTab === 'dsa_problems' ? 'dsa-problems' :
      activeTab === 'system_design' ? 'system-design' :
      activeTab === 'thank_you' ? 'thank-you' :
      activeTab === 'not_found' ? '404' :
      activeTab
    );
    if (activeTab === 'lesson' && selectedVideo) {
      targetHash = `#/lesson/${selectedVideo.channel_id || 'ch'}/${selectedVideo.telegram_message_id || selectedVideo.id}`;
    } else if (activeTab === 'channels' && channelViewMode === 'detail' && selectedChannelId) {
      targetHash = `#/channel/${selectedChannelId}`;
    }

    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash);
    }
  }, [activeTab, selectedVideo, selectedChannelId, channelViewMode, sdeFullscreenProblem, isSqlModalOpen, isPotdModalOpen]);

  // Lecture completion tracking
  const [completedLectures, setCompletedLectures] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('edustream_completed_lectures');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const toggleLectureComplete = (videoId: string) => {
    setCompletedLectures(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId); else next.add(videoId);
      localStorage.setItem('edustream_completed_lectures', JSON.stringify([...next]));
      return next;
    });
  };

  const handleAutoComplete = (videoId: string) => {
    if (!completedLectures.has(videoId)) {
      setCompletedLectures(prev => {
        const next = new Set(prev);
        next.add(videoId);
        localStorage.setItem('edustream_completed_lectures', JSON.stringify([...next]));
        return next;
      });
    }
  };

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [revokedSessionMessage, setRevokedSessionMessage] = useState<string>('');

  // Video-specific Quiz State
  const [activeVideoQuiz, setActiveVideoQuiz] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [isGeneratingMoreQuiz, setIsGeneratingMoreQuiz] = useState<boolean>(false);

  const handleAttemptMoreQuestions = async () => {
    if (!selectedVideo) return;

    if (!canAffordAction(PRICING_CONFIG.AI_QUIZ_GEN_BATCH, user?.email)) {
      setInsufficientMeta({
        cost: PRICING_CONFIG.AI_QUIZ_GEN_BATCH,
        action: `Generating AI Quiz Question Batch (50 paise): ${selectedVideo.title}`
      });
      setIsInsufficientCreditsOpen(true);
      return;
    }

    deductCredits(
      PRICING_CONFIG.AI_QUIZ_GEN_BATCH,
      'AI_QUIZ_GEN',
      `📝 AI Quiz Batch Generation (50p): ${selectedVideo.title}`,
      user?.email
    );

    setIsGeneratingMoreQuiz(true);
    try {
      const chObj = MOCK_CHANNELS.find((c) => c.id === selectedVideo.channel_id);
      const newQuestions = await requestMistralQuiz(
        `${selectedVideo.title} (Batch #${Math.floor(Math.random() * 1000)})`,
        selectedVideo.transcript,
        chObj?.name || 'DSA'
      );
      if (newQuestions && newQuestions.length > 0) {
        setActiveVideoQuiz(newQuestions);
      }
    } catch (err) {
      console.warn('[Attempt More Notice]:', err);
    } finally {
      setIsGeneratingMoreQuiz(false);
    }
  };

  const handleQuizSubmitted = (timeTakenSeconds: number, isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAttempts((prev) => prev + 1);
      setTotalSolved((prev) => prev + 1);
    }
    const mins = Math.max(0.1, Number((timeTakenSeconds / 60).toFixed(1)));
    setTotalActiveMins((prev) => Number((prev + mins).toFixed(1)));
    setTimeBreakdown((prev: any) => ({
      ...prev,
      quizzesMins: Number(((prev?.quizzesMins || 0) + mins).toFixed(1))
    }));
  };

  useEffect(() => {
    // Clear legacy transcript/notes caches from localStorage so everything is freshly generated from real transcripts
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('edustream_transcript_') || key.startsWith('edustream_ainotes_') || key.startsWith('edustream_quiz_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}

    // Restore student session on mount with automatic device passkey autologin
    checkAndAutoLogin().then((student) => {
      if (student) {
        setUser(student);
      }
    }).catch((err) => {
      console.warn('[EduStream Auth] Remote Supabase notice:', err);
    }).finally(() => {
      setAuthChecking(false);
    });

    // Check if invite passcode or direct email verification link was opened
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const inviteCode = params.get('passcode') || params.get('passkey') || params.get('code') || params.get('otp') || params.get('verify_email');
      if (inviteCode) {
        setIsAuthModalOpen(true);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && session.user.email_confirmed_at) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1 Active Session Per Device Live Heartbeat & Revocation Monitor
  useEffect(() => {
    if (!user?.email) return;

    // Sync persistent wallet & transactions from database
    syncWalletWithDatabase(user.email).catch(() => {});

    const cleanup = startSessionHeartbeat(user.email, (msg) => {
      console.warn('[EduStream Session] Revoked from another device:', msg);
      setRevokedSessionMessage(msg);
      signOutStudent();
      setUser(null);
    });

    return () => cleanup();
  }, [user?.email]);

  // Real Dynamic Velocity Analytics State (persisted in localStorage & synced across SDE Sheet)
  const [totalSolved, setTotalSolved] = useState<number>(() => {
    try {
      const sdeSolved = JSON.parse(localStorage.getItem('sdestream_solved_problems') || '[]');
      const generalSolved = parseInt(localStorage.getItem('edustream_total_solved') || '0', 10);
      const sdeCount = Array.isArray(sdeSolved) ? sdeSolved.length : 0;
      return Math.max(sdeCount, generalSolved);
    } catch {
      return 0;
    }
  });

  const [totalActiveMins, setTotalActiveMins] = useState<number>(() => {
    const saved = localStorage.getItem('edustream_active_mins');
    return saved ? parseFloat(saved) : 0.0;
  });

  const [correctAttempts, setCorrectAttempts] = useState<number>(() => {
    const saved = localStorage.getItem('edustream_correct_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [timeBreakdown, setTimeBreakdown] = useState(() => {
    const saved = localStorage.getItem('edustream_time_breakdown');
    return saved ? JSON.parse(saved) : { lecturesMins: 0, quizzesMins: 0, codingMins: 0 };
  });

  // Re-sync analytics values whenever activeTab changes or on mount
  useEffect(() => {
    try {
      const sdeSolved1 = JSON.parse(localStorage.getItem('sdetube_sde_sheet_solved_ids') || '[]');
      const sdeSolved2 = JSON.parse(localStorage.getItem('sdestream_solved_problems') || '[]');
      const combinedSolvedSet = new Set([
        ...(Array.isArray(sdeSolved1) ? sdeSolved1 : []),
        ...(Array.isArray(sdeSolved2) ? sdeSolved2 : [])
      ]);
      const sdeCount = combinedSolvedSet.size;
      const generalSolved = parseInt(localStorage.getItem('edustream_total_solved') || '0', 10);
      const combinedSolved = Math.max(sdeCount, generalSolved);
      setTotalSolved(combinedSolved);

      const activeMins = parseFloat(localStorage.getItem('edustream_active_mins') || '0');
      setTotalActiveMins(activeMins);

      const timeBreakdownSaved = localStorage.getItem('edustream_time_breakdown');
      if (timeBreakdownSaved) {
        setTimeBreakdown(JSON.parse(timeBreakdownSaved));
      } else if (activeMins > 0 || combinedSolved > 0) {
        const estimatedCodingMins = combinedSolved * 15;
        const total = Math.max(activeMins, estimatedCodingMins);
        setTimeBreakdown({
          lecturesMins: Math.round(total * 0.3),
          quizzesMins: Math.round(total * 0.1),
          codingMins: Math.round(total * 0.6)
        });
      }

      const savedCorrect = parseInt(localStorage.getItem('edustream_correct_attempts') || '0', 10);
      setCorrectAttempts(Math.max(combinedSolved, savedCorrect));
    } catch {}
  }, [activeTab]);

  const handleQuestionSolved = (timeTakenSeconds?: number, isCorrect?: boolean) => {
    const mins = Math.max(0.5, Number(((timeTakenSeconds || 60) / 60).toFixed(1)));
    const correct = isCorrect !== false;

    if (correct) {
      const target = sdeFullscreenProblem?.id || sdeFullscreenProblem?.name || selectedVideo?.title || 'Problem';
      const targetSlug = sdeFullscreenProblem?.slug || sdeFullscreenProblem?.leetcode || sdeFullscreenProblem?.name;
      markProblemSolved(target, mins, targetSlug);
      setTotalSolved((prev) => prev + 1);
      setCorrectAttempts((prev) => prev + 1);
    } else {
      const actType = (lessonSubTab === 'code' || sdeFullscreenProblem) ? 'coding' : 'quiz';
      recordRealActivity(actType, mins, 0, false);
    }

    setTotalActiveMins((prev) => Number((prev + mins).toFixed(1)));

    const actType = (lessonSubTab === 'code' || sdeFullscreenProblem) ? 'coding' : 'quiz';
    if (actType === 'coding') {
      setTimeBreakdown((prev: { lecturesMins: number; quizzesMins: number; codingMins: number }) => ({ 
        ...prev, 
        codingMins: Math.round(prev.codingMins + mins) 
      }));
    } else {
      setTimeBreakdown((prev: { lecturesMins: number; quizzesMins: number; codingMins: number }) => ({ 
        ...prev, 
        quizzesMins: Math.round(prev.quizzesMins + mins) 
      }));
    }
  };

  const accuracyPercent = useMemo(() => {
    const totalAttempts = parseInt(localStorage.getItem('edustream_total_attempts') || '0', 10);
    const validSolved = Math.max(totalSolved, correctAttempts);
    if (validSolved === 0) return 0;
    if (totalAttempts === 0) return 100;
    return Math.min(100, Math.round((validSolved / Math.max(validSolved, totalAttempts)) * 100));
  }, [totalSolved, correctAttempts]);

  // Fetch real video catalog from backend on mount
  useEffect(() => {
    setCatalogLoading(true);
    fetchCatalog()
      .then((data: any) => {
        const channels = data?.channels || {};
        const allVideos: Video[] = [];
        const counts: Record<string, number> = {};

        const channelNameToId: Record<string, string> = {
          'DSA': 'ch-dsa-01',
          'System Design': 'ch-sd-02',
          'DBMS': 'ch-dbms-03',
          'Computer Networks': 'ch-cn-04',
          'High Level Design': 'ch-hld-05',
        };

        for (const [chName, chData] of Object.entries(channels) as [string, any][]) {
          const channelId = channelNameToId[chName] || chName;
          const videos = chData?.videos || [];
          counts[channelId] = chData?.count || videos.length;

          for (const v of videos) {
            allVideos.push({
              id: `tg-${channelId}-${v.msg_id}`,
              channel_id: channelId,
              telegram_file_id: v.file_id || '',
              telegram_message_id: v.msg_id,
              sender_username: '@SDETubeBot',
              title: (v.file_name || `Lecture ${v.msg_id}`).replace(/\.(mp4|mkv|webm|avi|mov|flv)$/i, ''),
              telegram_caption: sanitizeCaption(v.caption) || `📌 [SDETube Lecture #${v.msg_id} | Size: ${v.size_mb} MB]\nFile: ${v.file_name}`,
              duration_seconds: v.duration || 0,
              transcript: `SDETube Lecture #${v.msg_id} (${v.file_name}). Stream powered by SDETube Cloud Engine.`,
              thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
              stream_url: `${TELEGRAM_BACKEND_URL}${v.stream_url}`,
              created_at: v.date || new Date().toISOString(),
              quiz_json: [],
              attachments: [],
            });
          }
        }

        if (allVideos.length > 0) {
          setDynamicVideos(allVideos);
          setChannelCounts(counts);
          const firstChannelVideos = allVideos.filter(v => v.channel_id === selectedChannelId);
          if (firstChannelVideos.length > 0) {
            setSelectedVideo(firstChannelVideos[0]);
          }
        }
      })
      .catch((err) => {
        console.warn('[EduStream] Using fallback catalog:', err);
      })
      .finally(() => setCatalogLoading(false));
  }, []);

  // Dynamically fetch transcript + AI artifacts (MCQs, Notes, Coding, Simulator) generated from REAL transcript
  const [videoArtifacts, setVideoArtifacts] = useState<any>(null);

  useEffect(() => {
    if (!selectedVideo) return;

    let isMounted = true;
    let pollTimer: any = null;

    const cleanTitle = (selectedVideo.title || 'Lecture').replace(/\.(mp4|mkv|webm|avi|mov)$/i, '');
    const durationMins = Math.max(5, Math.round((selectedVideo.duration_seconds || 900) / 60));
    const channelId = selectedVideo.channel_id || 'ch-sd-02';
    const msgId = selectedVideo.telegram_message_id || 6004;
    const localKey = `edustream_artifacts_${channelId}_${msgId}`;

    // Instant Pre-hydration from Local / Browser Storage (0ms instant load for any previously viewed lecture)
    let hasLocalComplete = false;
    try {
      const cachedRaw = localStorage.getItem(localKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached && cached.transcript && cached.notes) {
          hasLocalComplete = true;
          setVideoArtifacts(cached);
          selectedVideo.transcript = cached.transcript;
          if (cached.mcqs && cached.mcqs.length > 0) {
            setActiveVideoQuiz(cached.mcqs);
            selectedVideo.quiz_json = cached.mcqs;
            setQuizLoading(false);
          }
        }
      }
    } catch (e) {
      console.warn('[EduStream Local Cache Notice]:', e);
    }

    if (!hasLocalComplete) {
      setQuizLoading(true);
      setActiveVideoQuiz([]);
      setVideoArtifacts(null);
    }

    let pollAttempts = 0;
    const maxPollAttempts = 4;

    const pollStatus = () => {
      if (pollAttempts >= maxPollAttempts) return;
      pollAttempts += 1;
      const statusUrl = `${TELEGRAM_BACKEND_URL}/api/transcript/status/${channelId}/${msgId}?title=${encodeURIComponent(cleanTitle)}&duration=${durationMins}`;

      fetch(statusUrl, { signal: AbortSignal.timeout(3500) })
        .then((r) => r.json())
        .then((statusData) => {
          if (!isMounted) return;
          if (statusData) {
            if (statusData.status === 'completed' || (typeof statusData.progress_percent === 'number' && statusData.progress_percent >= 100)) {
              // Background task is finished! Fetch complete artifacts
              fetchArtifacts();
            } else {
              setVideoArtifacts((prev: any) => {
                if (prev && prev.notes && prev.transcript) {
                  return prev; // Keep completed artifacts visible
                }
                return {
                  ...(prev || {}),
                  ...statusData,
                };
              });
              if (!hasLocalComplete) {
                setQuizLoading(true);
              }
              pollTimer = setTimeout(pollStatus, 3000);
            }
          }
        })
        .catch(() => {
          // Silent catch if backend is sleeping or unreachable
        });
    };

    const fetchArtifacts = () => {
      const url = `${TELEGRAM_BACKEND_URL}/api/transcript/${channelId}/${msgId}?title=${encodeURIComponent(cleanTitle)}&duration=${durationMins}`;

      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          if (!isMounted) return;
          if (data) {
            if ((data.status === 'completed' || data.notes) && data.transcript) {
              const normalizedMCQs = (data.mcqs || []).map((m: any, idx: number) => ({
                id: m.id || `mcq-${idx + 1}`,
                type: 'MCQ' as const,
                question: m.question || `Question ${idx + 1}`,
                options: Array.isArray(m.options) ? m.options : ['Option A', 'Option B', 'Option C', 'Option D'],
                correct_answer: typeof m.correct_answer === 'number' ? m.correct_answer : 0,
                explanation: m.explanation || ''
              }));
              const completeObj = { ...data, mcqs: normalizedMCQs };
              setVideoArtifacts(completeObj);
              if (data.transcript) {
                selectedVideo.transcript = data.transcript;
              }
              setActiveVideoQuiz(normalizedMCQs);
              selectedVideo.quiz_json = normalizedMCQs;
              setQuizLoading(false);

              // Persist into localStorage for instant 0ms access across reloads
              try {
                localStorage.setItem(localKey, JSON.stringify(completeObj));
                localStorage.setItem(`edustream_artifacts_${selectedVideo.id}`, JSON.stringify(completeObj));
                localStorage.setItem(`edustream_artifacts_${cleanTitle}`, JSON.stringify(completeObj));
                localStorage.setItem(`edustream_transcript_${selectedVideo.id || cleanTitle}_v3`, data.transcript);
              } catch (storageErr) {
                console.warn('[EduStream Local Storage Notice]:', storageErr);
              }
            } else if (data.status === 'processing') {
              setVideoArtifacts((prev: any) => {
                if (prev && prev.notes && prev.transcript) {
                  return prev; // Never overwrite completed state
                }
                return {
                  ...(prev || {}),
                  ...data,
                };
              });
              if (!hasLocalComplete) {
                setQuizLoading(true);
              }
              pollTimer = setTimeout(pollStatus, 1500);
            } else {
              setQuizLoading(false);
            }
          }
        })
        .catch((err) => {
          console.warn('[EduStream Artifact Fetch Notice]:', err);
          if (isMounted) {
            pollTimer = setTimeout(pollStatus, 2500);
          }
        });
    };

    fetchArtifacts();

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [selectedVideo?.id, selectedVideo?.title, selectedVideo?.channel_id, selectedVideo?.telegram_message_id]);

  const activeVideos = dynamicVideos.length > 0 ? dynamicVideos : MOCK_VIDEOS;
  const filteredVideos = activeVideos.filter((v) => v.channel_id === selectedChannelId);

  const searchFilteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return filteredVideos;
    const q = searchQuery.toLowerCase();
    return filteredVideos.filter((v) =>
      v.title.toLowerCase().includes(q) ||
      (v.telegram_caption || '').toLowerCase().includes(q) ||
      (v.transcript || '').toLowerCase().includes(q) ||
      (v.sender_username || '').toLowerCase().includes(q)
    );
  }, [searchQuery, filteredVideos]);

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
    setChannelViewMode('detail');
    setSearchQuery('');
    const matchingVideos = activeVideos.filter((v) => v.channel_id === channelId);
    if (matchingVideos.length > 0) {
      setSelectedVideo(matchingVideos[0]);
    }
    navigateTo('channels', { channelId });
  };

  const handleNextLecture = () => {
    const currentList = filteredVideos.length > 0 ? filteredVideos : MOCK_VIDEOS;
    const currentIndex = currentList.findIndex((v) => v.id === selectedVideo.id);
    if (currentIndex >= 0 && currentIndex < currentList.length - 1) {
      const nextVid = currentList[currentIndex + 1];
      handleOpenVideoWithBilling(nextVid, returnTarget);
    }
  };

  const handlePrevLecture = () => {
    const currentList = filteredVideos.length > 0 ? filteredVideos : MOCK_VIDEOS;
    const currentIndex = currentList.findIndex((v) => v.id === selectedVideo.id);
    if (currentIndex > 0) {
      const prevVid = currentList[currentIndex - 1];
      handleOpenVideoWithBilling(prevVid, returnTarget);
    }
  };

  const currentList = filteredVideos.length > 0 ? filteredVideos : activeVideos;
  const currentIndex = currentList.findIndex((v) => v.id === selectedVideo.id);
  const hasNextLecture = currentIndex >= 0 && currentIndex < currentList.length - 1;
  const hasPrevLecture = currentIndex > 0;

  const handleOpenCodeTab = () => {
    if (isMobile) {
      setShowMobileGating(true);
    } else {
      setLessonSubTab('code');
    }
  };

  const handleSelectVideoByTopic = (topicName: string) => {
    const allVideos = dynamicVideos.length > 0 ? dynamicVideos : MOCK_VIDEOS;
    // Strictly search ONLY within the DSA channel ('ch-dsa-01')
    const dsaVideos = allVideos.filter(v => v.channel_id === 'ch-dsa-01');
    const match = findMatchingDsaVideo(topicName, dsaVideos);

    // Only open if a real, valid Telegram DSA video match exists
    if (match) {
      handleOpenVideoWithBilling(match, 'sde_sheet');
    }
  };

  const handleOpenCodingFullscreen = (problem: SDEProblem | DSAProblem) => {
    // Immediately pause any active background video playback
    window.dispatchEvent(new CustomEvent('sdetube_pause_video'));

    if (isMobile) {
      setShowMobileGating(true);
      return;
    }

    const targetSlug = (problem.name && (problem.name.toLowerCase().includes('floor in bst') || problem.name.toLowerCase().includes('floor in a binary search tree')))
      ? 'floor-in-bst'
      : (problem.slug || problem.id);

    // Detect if problem is an SQL/Database question and open SQL compiler arena
    if (isSqlProblem(problem)) {
      setActiveSqlProblem({ title: problem.name, problem });
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (window.location.hash !== `#/problem/${targetSlug}`) {
        window.history.pushState(null, '', `#/problem/${targetSlug}`);
      }
      return;
    }

    const allVideos = dynamicVideos.length > 0 ? dynamicVideos : MOCK_VIDEOS;
    // Strictly match ONLY against the DSA channel ('ch-dsa-01')
    const dsaVideos = allVideos.filter(v => v.channel_id === 'ch-dsa-01');
    const matched = findMatchingDsaVideo(problem.name, dsaVideos);

    setSdeFullscreenProblem(problem);
    setSdeFullscreenVideo(matched || null);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (window.location.hash !== `#/problem/${targetSlug}`) {
      window.history.pushState(null, '', `#/problem/${targetSlug}`);
    }
  };

  const getChannelIcon = (icon: string) => {
    switch (icon) {
      case 'code-2': return <Code2 className="w-5 h-5 text-indigo-400" />;
      case 'cpu': return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'database': return <Database className="w-5 h-5 text-emerald-400" />;
      case 'layers': return <Layers className="w-5 h-5 text-amber-400" />;
      default: return <Network className="w-5 h-5 text-sky-400" />;
    }
  };

  if (authChecking || catalogLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <AuthModal
        isOpen={true}
        isFullPage={true}
        revokedMessage={revokedSessionMessage}
        onSuccess={(loggedUser) => {
          setRevokedSessionMessage('');
          setUser(loggedUser);
        }}
      />
    );
  }

function getDomainFallbackMCQs(title: string, category: string): QuizQuestion[] {
  const clean = (title || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  if (clean.includes('srp') || clean.includes('single responsibility') || clean.includes('ocp') || clean.includes('open closed') || clean.includes('solid') || clean.includes('design') || clean.includes('lld') || cat.includes('design')) {
    return [
      {
        id: 'lld-mcq-1',
        type: 'MCQ',
        question: 'What is the core motivation for adhering to the Single Responsibility Principle (SRP)?',
        options: [
          'A class should have only one reason to change, minimizing coupling and testing complexity.',
          'A class must contain only a single method.',
          'All database queries should be placed in the UI model.',
          'Every variable must be declared static.'
        ],
        correct_answer: 0,
        explanation: 'SRP states that a class should encapsulate a single actor responsibility so that business changes do not break unrelated features.'
      },
      {
        id: 'lld-mcq-2',
        type: 'MCQ',
        question: 'How does the Open-Closed Principle (OCP) prevent regression bugs during feature expansion?',
        options: [
          'By making all class fields public.',
          'Classes remain open for extension via polymorphism/interfaces, but closed for modification.',
          'By preventing inheritance completely.',
          'By writing all logic inside a single monolithic switch statement.'
        ],
        correct_answer: 1,
        explanation: 'OCP ensures existing, tested code is not modified when new features are added—new behavior is introduced by implementing existing interfaces.'
      },
      {
        id: 'lld-mcq-3',
        type: 'MCQ',
        question: 'In the Strategy Design Pattern, what is the role of the Context class?',
        options: [
          'It executes hardcoded if-else logic.',
          'It maintains a reference to a Strategy interface and delegates the algorithm dynamically at runtime.',
          'It acts as the database driver.',
          'It destroys child objects when memory is low.'
        ],
        correct_answer: 1,
        explanation: 'The Context class delegates execution to interchangeable Strategy implementations without knowing their concrete details.'
      },
      {
        id: 'lld-mcq-4',
        type: 'MCQ',
        question: 'Why should database persistence and email notification NOT reside in an Invoice entity class?',
        options: [
          'It is illegal syntax in object-oriented programming.',
          'It couples domain business logic with I/O mechanisms, creating 3 separate reasons to change (SRP violation).',
          'It makes the code execute 10x slower.',
          'Email addresses cannot be represented as strings.'
        ],
        correct_answer: 1,
        explanation: 'Mixing calculation, SQL persistence, and emailing causes the Invoice class to change whenever DB schema or email format changes, violating SRP.'
      }
    ];
  }

  if (cat.includes('network') || clean.includes('cn') || clean.includes('tcp') || clean.includes('osi') || clean.includes('ip')) {
    return [
      {
        id: 'cn-mcq-1',
        type: 'MCQ',
        question: 'What occurs during the TCP 3-Way Handshake before data transmission begins?',
        options: [
          'SYN -> SYN-ACK -> ACK packet exchange establishing sequence numbers and connection state.',
          'Direct UDP datagram burst without acknowledgement.',
          'DNS query resolution and SSL key generation only.',
          'HTTP GET request followed by 200 OK.'
        ],
        correct_answer: 0,
        explanation: 'TCP guarantees reliable connection establishment by synchronizing sequence numbers via SYN, SYN-ACK, and ACK.'
      },
      {
        id: 'cn-mcq-2',
        type: 'MCQ',
        question: 'Which layer of the OSI model is responsible for end-to-end flow control and error recovery?',
        options: [
          'Network Layer (Layer 3)',
          'Transport Layer (Layer 4)',
          'Data Link Layer (Layer 2)',
          'Physical Layer (Layer 1)'
        ],
        correct_answer: 1,
        explanation: 'The Transport Layer (TCP/UDP) handles end-to-end communication, segmentation, flow control, and error recovery.'
      }
    ];
  }

  if (cat.includes('dbms') || clean.includes('sql') || clean.includes('transaction') || clean.includes('acid') || clean.includes('index')) {
    return [
      {
        id: 'dbms-mcq-1',
        type: 'MCQ',
        question: 'In ACID transaction properties, what does "Isolation" guarantee?',
        options: [
          'Concurrent transactions execute without interfering with one another, preventing dirty reads.',
          'All database files are stored on isolated physical SSDs.',
          'Every transaction must complete within 1 second.',
          'The database cannot be accessed via network sockets.'
        ],
        correct_answer: 0,
        explanation: 'Isolation ensures that concurrent transactions result in a system state equivalent to serial execution.'
      },
      {
        id: 'dbms-mcq-2',
        type: 'MCQ',
        question: 'Why are B+ Trees preferred over binary search trees for disk-based database indexing?',
        options: [
          'High fan-out minimizes disk I/O seeks, and sequential leaf node linking enables fast range queries.',
          'B+ Trees only use CPU cache and zero disk space.',
          'Binary search trees cannot store integer keys.',
          'B+ Trees eliminate the need for primary keys.'
        ],
        correct_answer: 0,
        explanation: 'B+ Tree nodes contain many keys (high fan-out), keeping tree depth small to minimize costly disk reads, while linked leaves accelerate range scans.'
      }
    ];
  }

  return [];
}

  const activeChannelObj = MOCK_CHANNELS.find((c) => c.id === selectedChannelId) || MOCK_CHANNELS[0];
  const fallbackDomainMCQs = getDomainFallbackMCQs(selectedVideo.title, activeChannelObj?.name || '');

  const rawMCQs = (activeVideoQuiz && activeVideoQuiz.length > 0)
    ? activeVideoQuiz
    : (videoArtifacts?.mcqs && videoArtifacts.mcqs.length > 0)
    ? videoArtifacts.mcqs
    : fallbackDomainMCQs;

  const activeMCQs: QuizQuestion[] = rawMCQs.map((q: any, idx: number) => ({
    id: q.id || `mcq-${idx + 1}`,
    type: 'MCQ' as const,
    question: q.question || `Question ${idx + 1}`,
    options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
    correct_answer: typeof q.correct_answer === 'number' ? q.correct_answer : 0,
    explanation: q.explanation || ''
  }));

  const activeCodingQuestion: QuizQuestion | undefined = videoArtifacts?.coding_problem
    ? {
        id: 'code-1',
        type: 'CODING' as const,
        question: videoArtifacts.coding_problem.problem_statement || videoArtifacts.coding_problem.title || 'Lecture Challenge',
        starter_code: videoArtifacts.coding_problem.starter_code_cpp || videoArtifacts.coding_problem.starter_code_python,
        solution_code: videoArtifacts.coding_problem.solution_code_cpp,
        explanation: videoArtifacts.coding_problem.title
      }
    : activeVideoQuiz.find((q) => q.type === 'CODING');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      
      {/* Navbar with Hamburger Drawer */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          navigateTo(tab);
        }}
        selectedChannel={selectedChannelId}
        setSelectedChannel={handleSelectChannel}
        user={user}
        onOpenPotd={handleOpenPotdDirectly}
        onOpenSqlWorkspace={() => setIsSqlModalOpen(true)}
        onOpenAskAI={() => setIsAskAIOpen(true)}
        onOpenWallet={() => setIsWalletModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onSignOut={() => {
          signOutStudent();
          setUser(null);
        }}
      />

      {/* Main Content Area: Uniform Expansive Full Horizontal Width for All Laptop Views */}
      <main className="flex-1 w-full max-w-[98%] px-2 sm:px-4 lg:px-6 mx-auto py-6">
        
        {/* VIEW 0: POST-LOGIN STUDENT DASHBOARD / COMMAND CENTER */}
        {activeTab === 'dashboard' && (
          <DashboardLandingPage
            user={user}
            onNavigate={navigateTo}
            onOpenSdeProblem={handleOpenCodingFullscreen}
            onOpenSqlWorkspace={() => setIsSqlModalOpen(true)}
            onOpenAskAI={() => setIsAskAIOpen(true)}
          />
        )}

        {/* VIEW 1: TELEGRAM CHANNELS OVERVIEW & DEDICATED CHANNEL PAGES */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            {channelViewMode === 'overview' ? (
              /* Channel Hub Overview Cards */
              <div className="space-y-8">
                
                {/* Hero Showcase Banner */}
                <div className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/30 shadow-2xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950 border border-sky-700/60 text-sky-300 font-mono text-[11px] font-bold w-fit">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>CLOUD HD LECTURE CHANNELS &bull; SYNCED AI NOTES</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                        SDETube Video Channels & SDE Curricula
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                        Curated multi-track video lecture streams ingested directly with synchronized AI transcripts, smart notes, and interactive quizzes.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                        <div className="text-xs font-bold text-sky-400">Total Ingested</div>
                        <div className="text-xl font-black text-slate-100 font-mono mt-0.5">
                          {Object.values(channelCounts).reduce((a, b) => a + b, 0) || '200+'} <span className="text-xs text-slate-500">Lectures</span>
                        </div>
                      </div>
                      <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                        <div className="text-xs font-bold text-indigo-400">Learning Tracks</div>
                        <div className="text-xl font-black text-slate-100 font-mono mt-0.5">
                          {MOCK_CHANNELS.length} <span className="text-xs text-slate-500">Tracks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Channels Grid (Expansive Widescreen 4-Column Layout) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {MOCK_CHANNELS.map((ch) => {
                    const videoCount = channelCounts[ch.id] || ch.total_videos || 0;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => handleSelectChannel(ch.id)}
                        className="glass-panel p-6 rounded-3xl text-left transition-all relative overflow-hidden group border border-slate-800/80 hover:border-sky-500/80 hover:bg-sky-950/20 shadow-xl flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 group-hover:scale-110 group-hover:bg-sky-950/60 group-hover:border-sky-700/60 transition-all text-sky-300">
                              {getChannelIcon(ch.icon)}
                            </div>
                            <span className="px-3 py-1 rounded-full bg-sky-950 border border-sky-700/60 text-xs font-mono font-bold text-sky-300">
                              {videoCount} Lectures
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-100 mb-2 group-hover:text-sky-300 transition-colors flex items-center justify-between">
                            <span>{ch.category_name}</span>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{ch.description}</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-sky-400">
                          <span>Open Track Playlist</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* DEDICATED CHANNEL PAGE (e.g. LLD Page, DSA Page, DBMS Page, CN Page) */
              <div className="space-y-6">
                
                {/* Header & Back to Overview Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-xl">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setChannelViewMode('overview');
                        navigateTo('channels');
                      }}
                      className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer shadow-sm"
                      title="Back to All Channels"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>All Channels</span>
                    </button>

                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/40">
                          {getChannelIcon(activeChannelObj.icon)}
                        </div>
                        <h2 className="text-xl font-bold text-slate-100">{activeChannelObj.name} Workspace</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-[11px] font-mono font-bold text-emerald-300">
                          {filteredVideos.length} Ingested Videos
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{activeChannelObj.description}</p>
                    </div>
                  </div>

                  {/* Dedicated Search Bar for this specific channel page */}
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search ${activeChannelObj.name} lectures...`}
                      className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-950 border border-indigo-500/40 text-xs text-slate-100 focus:outline-none focus:border-indigo-400 font-sans shadow-inner"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Videos Grid: 4-Column Widescreen Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {searchFilteredVideos.map((v) => {
                    const isCurrent = v.id === selectedVideo.id;
                    return (
                      <div
                        key={v.id}
                        className={`glass-panel rounded-2xl overflow-hidden border transition-all flex flex-col justify-between group ${
                          isCurrent
                            ? 'border-indigo-500 shadow-lg shadow-indigo-500/10'
                            : 'border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800/60 font-bold text-indigo-300">
                              Post #{v.telegram_message_id}
                            </span>
                            <span>{v.sender_username || '@SDETubeBot'}</span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                            {v.title}
                          </h4>

                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                            {v.telegram_caption}
                          </p>
                        </div>

                        <div className="p-4 bg-slate-900/60 border-t border-slate-800/60 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                handleOpenVideoWithBilling(v, 'channels');
                              }}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Watch</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedVideo(v);
                                setIsAskAIOpen(true);
                              }}
                              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-bold transition-all cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>AI</span>
                            </button>
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); toggleLectureComplete(v.id); }}
                            className={`p-1.5 rounded-lg transition-all border cursor-pointer ${
                              completedLectures.has(v.id)
                                ? 'bg-emerald-950 border-emerald-600 text-emerald-400 shadow-sm shadow-emerald-500/20'
                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                            }`}
                            title={completedLectures.has(v.id) ? 'Mark as incomplete' : 'Mark as completed'}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>
        )}

        {/* VIEW 2: LECTURE WORKSPACE (VIDEO PLAYER + SDE STUDY NOTES SIDE-BY-SIDE) */}
        {activeTab === 'lesson' && (
          <div className="space-y-6">
            
            {/* Top Workspace Lecture Banner with Back Button & Contextual Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-xl">
              
              <div className="flex items-center space-x-3">
                {/* Back Button returning to previous page */}
                <button
                  onClick={() => {
                    if (window.history.length > 1) {
                      window.history.back();
                    } else {
                      navigateTo(returnTarget);
                    }
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all shadow-sm active:scale-95 cursor-pointer"
                  title="Return to previous screen"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to {returnTarget === 'sde_sheet' ? 'SDE Sheet' : 'Channels'}</span>
                </button>

                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-xs text-indigo-300 font-mono font-bold px-3 py-1 rounded-xl bg-indigo-950 border border-indigo-700/50 truncate max-w-sm">
                    {selectedVideo.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAskAIWithMode('notes')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ask AI</span>
                </button>

                {/* Mode Selector: SQL Arena for DBMS/SQL, Coding IDE for DSA/LLD, MCQ Quiz for Computer Networks */}
                {(activeChannelObj?.id === 'ch-dbms-03' ||
                  Boolean(activeChannelObj?.name && (activeChannelObj.name.toLowerCase().includes('dbms') || activeChannelObj.name.toLowerCase().includes('sql') || activeChannelObj.name.toLowerCase().includes('database'))) ||
                  selectedVideo.title.toLowerCase().includes('sql') ||
                  selectedVideo.title.toLowerCase().includes('dbms') ||
                  selectedVideo.title.toLowerCase().includes('query') ||
                  selectedVideo.title.toLowerCase().includes('join') ||
                  selectedVideo.title.toLowerCase().includes('database')) ? (
                  <button
                    onClick={() => setIsSqlModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 border border-cyan-400/40 cursor-pointer"
                  >
                    <Database className="w-4 h-4 text-cyan-200" />
                    <span>Open SQL Compiler</span>
                  </button>
                ) : (activeChannelObj?.id === 'ch-dsa-01' || 
                     activeChannelObj?.id === 'ch-sys-design' ||
                     Boolean(activeChannelObj?.name && (activeChannelObj.name.toLowerCase().includes('system design') || activeChannelObj.name.toLowerCase().includes('lld') || activeChannelObj.name.toLowerCase().includes('design') || activeChannelObj.name.toLowerCase().includes('dsa'))) ||
                     selectedVideo.title.toLowerCase().includes('dsa') ||
                     selectedVideo.title.toLowerCase().includes('array') ||
                     selectedVideo.title.toLowerCase().includes('tree') ||
                     selectedVideo.title.toLowerCase().includes('graph') ||
                     selectedVideo.title.toLowerCase().includes('solid') ||
                     selectedVideo.title.toLowerCase().includes('srp') ||
                     selectedVideo.title.toLowerCase().includes('ocp') ||
                     selectedVideo.title.toLowerCase().includes('pattern') ||
                     selectedVideo.title.toLowerCase().includes('design') ||
                     selectedVideo.title.toLowerCase().includes('leetcode') ||
                     Boolean(videoArtifacts?.coding_problem)) ? (
                  <button
                    onClick={() => {
                      const cleanName = selectedVideo.title.replace(/\.(mp4|mkv)$/i, '').replace(/_/g, ' ');
                      const matchedProblem = SDE_SHEET_DATA.find(p => 
                        p.name.toLowerCase().includes(cleanName.toLowerCase()) || 
                        cleanName.toLowerCase().includes(p.name.toLowerCase())
                      ) || {
                        id: 999,
                        sheetType: 'sde' as const,
                        category: activeChannelObj?.name || 'System Design & LLD',
                        name: cleanName,
                        leetcode: 'https://leetcode.com',
                        gfg: 'https://www.geeksforgeeks.org',
                        companies: ['Amazon', 'Microsoft', 'Google', 'Meta'],
                        difficulty: 'Medium' as const,
                        rating: '5.0 / 5 (Must Do)'
                      };
                      handleOpenCodingFullscreen(matchedProblem);
                    }}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 border border-indigo-400/40 cursor-pointer"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Open Coding IDE</span>
                  </button>
                ) : (
                  <button
                    onClick={() => openAskAIWithMode('quiz')}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    <span>Practice MCQ Quiz</span>
                  </button>
                )}
              </div>
            </div>

            {/* Split Screen Grid: Left Video, Right Algomaster SDE Notes & Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Video Player with Next/Prev Controls */}
              <div className="lg:col-span-6 xl:col-span-6 space-y-6">
                <VideoPlayer
                  video={selectedVideo}
                  videoArtifacts={videoArtifacts}
                  onNextLecture={handleNextLecture}
                  onPrevLecture={handlePrevLecture}
                  hasNextLecture={hasNextLecture}
                  hasPrevLecture={hasPrevLecture}
                  onOpenAskAI={(mode, timestamp) => openAskAIWithMode(mode || 'video', timestamp)}
                  onAutoComplete={handleAutoComplete}
                />
                <ResourceCard
                  attachments={selectedVideo.attachments || []}
                  channelId={selectedVideo.channel_id}
                  messageId={selectedVideo.telegram_message_id}
                />
              </div>

              {/* Right Column: MCQ Quiz Primary View with SDE Study Notes & Simulation Tabs */}
              <div className="lg:col-span-6 xl:col-span-6 min-h-[500px]">
                <AINotesAndSimulation
                  video={selectedVideo}
                  videoArtifacts={videoArtifacts}
                  questions={activeMCQs}
                  isLoading={catalogLoading}
                  onOpenAskAI={openAskAIWithMode}
                  onQuizSubmitted={handleQuizSubmitted}
                  onAttemptMoreQuestions={handleAttemptMoreQuestions}
                  isGeneratingMoreQuiz={isGeneratingMoreQuiz}
                />
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2.5: DSA SHEETS HUB WITH 744 PROBLEMS ACROSS 3 CURRICULA */}
        {activeTab === 'sde_sheet' && (
          <SDESheetExplorer
            onSelectVideoByTopic={handleSelectVideoByTopic}
            onOpenVideo={(v) => handleOpenVideoWithBilling(v, 'sde_sheet')}
            onOpenCodingFullscreen={handleOpenCodingFullscreen}
            userEmail={user?.email}
            dsaVideos={dynamicVideos.length > 0 ? dynamicVideos.filter(v => v.channel_id === 'ch-dsa-01') : MOCK_VIDEOS.filter(v => v.channel_id === 'ch-dsa-01')}
          />
        )}

        {/* VIEW 2.6: COMPANY-WISE & TIMEFRAME-WISE DSA PROBLEMS (3,400+ PROBLEMS, 659 COMPANIES) */}
        {activeTab === 'dsa_problems' && (
          <CompanyDSAProblems
            onOpenCodingWorkspace={handleOpenCodingFullscreen}
          />
        )}

        {/* VIEW 2.8: LLD DESIGN & OOP STUDIO */}
        {activeTab === 'lld' && (
          <LLDHub />
        )}

        {/* VIEW 2.9: HLD ARCHITECTURE & SYSTEM DESIGN HUB */}
        {(activeTab === 'hld' || activeTab === 'system_design') && (
          <HLDHub />
        )}

        {/* VIEW 2.95: SDE MULTI-ROUND AI MOCK INTERVIEW COMPANION */}
        {activeTab === 'interview' && (
          <div className="h-[calc(100vh-100px)] min-h-[640px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            <InterviewCompanion
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          </div>
        )}

        {/* VIEW 3: DYNAMIC VELOCITY ANALYTICS & MISTRAL DIAGNOSTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <VelocityTracker
              totalSolved={totalSolved}
              totalActiveMins={totalActiveMins}
              accuracyPercent={accuracyPercent}
              timeBreakdown={timeBreakdown}
            />

            <DiagnosticCard
              totalSolved={totalSolved}
              totalMins={totalActiveMins}
              accuracyPercent={accuracyPercent}
            />
          </div>
        )}

        {/* VIEW 4: LEETCODE-INSPIRED FULL DEVELOPER PROFILE, HEATMAP & CERTIFICATES */}
        {activeTab === 'profile' && (
          <DeveloperProfilePage
            user={user}
            onOpenProblem={(pNameOrSlug) => {
              const allProbs = [
                ...SDE_SHEET_191_DATA,
                ...A2Z_DSA_SHEET_474_DATA,
                ...SDETUBE_79_SHEET_DATA,
                ...BLIND_75_SHEET_DATA,
                ...CODESTORYWITHMIK_SHEET_DATA
              ];
              const match = allProbs.find(p => p.name.toLowerCase() === pNameOrSlug.toLowerCase() || p.slug === pNameOrSlug) || allProbs[0];
              handleOpenCodingFullscreen(match);
            }}
            onOpenWallet={() => setIsWalletModalOpen(true)}
            onNavigateToTab={navigateTo}
          />
        )}

        {/* VIEW 5: PRIVACY POLICY (GDPR & CCPA COMPLIANT) */}
        {activeTab === 'privacy' && (
          <PrivacyPolicyPage onBackToHome={() => navigateTo('dashboard')} />
        )}

        {/* VIEW 6: TERMS AND CONDITIONS OF SERVICE */}
        {activeTab === 'terms' && (
          <TermsPage onBackToHome={() => navigateTo('dashboard')} />
        )}

        {/* VIEW 7: THANK YOU / ACTION CONVERSION RECEIPT */}
        {activeTab === 'thank_you' && (
          <ThankYouPage onNavigateHome={() => navigateTo('dashboard')} onNavigateTab={navigateTo} />
        )}

        {/* VIEW 8: CONTACT FORM & BUSINESS OFFICE */}
        {activeTab === 'contact' && (
          <ContactPage onBackToHome={() => navigateTo('dashboard')} onNavigateToThankYou={() => navigateTo('thank_you')} />
        )}

        {/* VIEW 9: CUSTOM 404 NOT FOUND FALLBACK */}
        {activeTab === 'not_found' && (
          <NotFoundPage onNavigateHome={() => navigateTo('dashboard')} onNavigateTab={navigateTo} />
        )}

      </main>

      {/* Fullscreen LeetCode Monaco Workspace for SDE Sheet Problems */}
      {sdeFullscreenProblem && (
        <LeetCodeWorkspaceModal
          problemTitle={sdeFullscreenProblem.name}
          initialLanguage="cpp"
          matchingVideo={sdeFullscreenVideo || undefined}
          transcript={sdeFullscreenVideo?.telegram_caption}
          codingProblem={sdeFullscreenProblem}
          onClose={() => {
            setSdeFullscreenProblem(null);
            setSdeFullscreenVideo(null);
            if (window.location.hash.startsWith('#/problem/')) {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.hash = '#/sde-sheet';
              }
            }
          }}
          onCodeExecuted={handleQuestionSolved}
        />
      )}

      {/* Fullscreen In-Browser WebAssembly SQL Arena for DBMS Lectures & Database Problems */}
      {(isSqlModalOpen || activeSqlProblem) && (
        <LeetCodeSQLWorkspaceModal
          problemTitle={activeSqlProblem?.title || selectedVideo?.title || 'DBMS SQL Challenge'}
          transcript={videoArtifacts?.transcript || selectedVideo?.telegram_caption}
          notes={videoArtifacts?.notes}
          codingProblem={activeSqlProblem?.problem}
          onClose={() => {
            setIsSqlModalOpen(false);
            setActiveSqlProblem(null);
            if (window.location.hash.startsWith('#/problem/')) {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.hash = '#/sde-sheet';
              }
            }
          }}
          onCodeExecuted={handleQuestionSolved}
        />
      )}

      {/* Floating Circular Ask AI Assistant Action Button ONLY on lesson workspace page */}
      {activeTab === 'lesson' && !sdeFullscreenProblem && !isSqlModalOpen && (
        <button
          onClick={() => openAskAIWithMode()}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-2xl shadow-purple-600/60 border-2 border-purple-300/40 flex items-center justify-center transition-all duration-300 hover:scale-110 group cursor-pointer"
          title="Ask AI Teaching Assistant"
        >
          <Sparkles className="w-7 h-7 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
          <span className="absolute right-16 bg-slate-900 border border-slate-800 text-slate-100 text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
            Ask AI
          </span>
        </button>
      )}

      {/* Mobile Coding Access Policy Overlay Modal */}
      {showMobileGating && (
        <MobileGatedOverlay
          onDismiss={() => setShowMobileGating(false)}
          onSwitchToQuiz={() => {
            setShowMobileGating(false);
            setLessonSubTab('quiz');
          }}
        />
      )}

      {/* Dual POTD Challenge Modal (SDETube Curated + Official LeetCode POTD) */}
      {isPotdModalOpen && (
        <POTDModal
          onClose={() => setIsPotdModalOpen(false)}
          onSolveSdeProblem={handleOpenCodingFullscreen}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        revokedMessage={revokedSessionMessage}
        onSuccess={(loggedUser) => {
          setRevokedSessionMessage('');
          setUser(loggedUser);
        }}
      />

      {/* Ask AI Teaching Assistant Chatbot Drawer */}
      <AskAIChatModal
        isOpen={isAskAIOpen}
        onClose={() => {
          setIsAskAIOpen(false);
          setAskAITimestamp(undefined);
        }}
        video={selectedVideo}
        videoArtifacts={videoArtifacts}
        initialMode={askAIMode}
        currentTimestamp={askAITimestamp}
        activeMCQ={activeVideoQuiz && activeVideoQuiz.length > 0 ? activeVideoQuiz[0] : undefined}
        codingProblem={videoArtifacts?.coding_problem}
      />

      {/* Insufficient Credits Gatekeeper Modal */}
      <InsufficientCreditsModal
        isOpen={isInsufficientCreditsOpen}
        onClose={() => setIsInsufficientCreditsOpen(false)}
        onOpenRecharge={() => {
          setIsInsufficientCreditsOpen(false);
          setIsWalletModalOpen(true);
        }}
        requiredCost={insufficientMeta.cost}
        actionName={insufficientMeta.action}
      />

      {/* Wallet Top-up Modal */}
      <WalletTopupModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        initialAmount={50}
      />

      {/* Comprehensive Developer Profile & 365-Day Heatmap Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onOpenWallet={() => {
          setIsProfileModalOpen(false);
          setIsWalletModalOpen(true);
        }}
      />


      {/* Production Structured Footer with Business Address & Schema details */}
      <Footer onNavigate={navigateTo} />

      {/* Persistent Sticky Mobile Action CTA Bar */}
      {!sdeFullscreenProblem && !isSqlModalOpen && (
        <StickyMobileCTA
          onOpenPotd={handleOpenPotdDirectly}
          onNavigateToSdeSheet={() => navigateTo('sde_sheet')}
          onOpenAskAI={() => openAskAIWithMode()}
          onNavigateToAnalytics={() => navigateTo('analytics')}
          activeTab={activeTab}
        />
      )}

      {/* Lightweight GDPR/ePrivacy Cookie Consent Banner */}
      <CookieConsentBanner onNavigateToPrivacy={() => navigateTo('privacy')} />

    </div>
  );
}
