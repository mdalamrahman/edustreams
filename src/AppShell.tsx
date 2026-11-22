import { repositoryConfig } from './lib/repositoryConfig';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { StickyMobileCTA } from './components/StickyMobileCTA';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { AuthModal } from './components/AuthModal';
import { WalletTopupModal } from './components/WalletTopupModal';
import { InsufficientCreditsModal } from './components/InsufficientCreditsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AskAIChatModal } from './components/AskAIChatModal';
import { POTDModal } from './components/POTDModal';
import { MobileGatedOverlay } from './components/MobileGatedOverlay';
import { useAppContext } from './lib/AppContext';
import { trackPageView } from './lib/analyticsTracker';
import { useSEO } from './lib/useSEO';
import { LoadingScreen } from './components/LoadingScreen';

const PUBLIC_ROUTES = [
  '/',
  '/channels',
  '/dsa-sheets',
  '/sde-sheet',
  '/dsa-problems',
  '/lld',
  '/hld',
  '/system-design',
  '/privacy',
  '/terms',
  '/contact',
  '/thank-you',
  '/thank_you',
  '/conversion',
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    user,
    isRecruiterPreview,
    exitRecruiterPreview,
    setUser,
    authChecking,
    isAuthModalOpen,
    setIsAuthModalOpen,
    revokedSessionMessage,
    setRevokedSessionMessage,
    isWalletModalOpen,
    setIsWalletModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isInsufficientCreditsOpen,
    setIsInsufficientCreditsOpen,
    insufficientMeta,
    isAskAIOpen,
    setIsAskAIOpen,
    askAIMode,
    askAITimestamp,
    setAskAITimestamp,
    isPotdModalOpen,
    setIsPotdModalOpen,
    showMobileGating,
    setShowMobileGating,
    setLessonSubTab,
    selectedVideo,
    videoArtifacts,
    activeVideoQuiz,
  } = useAppContext();

  const location = useLocation();
  const navigate = useNavigate();

  // Route any direct admin requests to dedicated Vercel Admin Portal
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      window.location.href = `${repositoryConfig.studentUrl}/`;
    }
  }, [location.pathname]);

  // Page tracking on route change
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  // Dynamic SEO
  useSEO({
    activeTab: location.pathname.slice(1).replace(/\//g, '_') || 'dashboard',
    selectedVideo,
  });

  // Global custom event listeners
  useEffect(() => {
    const onOpenWallet = () => { if (user) setIsWalletModalOpen(true); else setIsAuthModalOpen(true); };
    const onOpenAuth = () => setIsAuthModalOpen(true);
    const onOpenPotd = () => setIsPotdModalOpen(true);

    window.addEventListener('sdetube_open_wallet', onOpenWallet);
    window.addEventListener('sdetube_open_auth', onOpenAuth);
    window.addEventListener('sdetube_open_potd', onOpenPotd);

    return () => {
      window.removeEventListener('sdetube_open_wallet', onOpenWallet);
      window.removeEventListener('sdetube_open_auth', onOpenAuth);
      window.removeEventListener('sdetube_open_potd', onOpenPotd);
    };
  }, [user, setIsWalletModalOpen, setIsAuthModalOpen, setIsPotdModalOpen]);

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  // 1. Initial auth initialization state
  if (authChecking) {
    return <LoadingScreen />;
  }

  // 2. Strict Route Protection: gate unauthenticated access to all non-public pages
  if (!user && !isRecruiterPreview && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <AuthModal
          isOpen={true}
          isFullPage={true}
          revokedMessage={revokedSessionMessage}
          onSuccess={(loggedUser) => {
            setRevokedSessionMessage('');
            setUser(loggedUser);
            setIsAuthModalOpen(false);
          }}
        />
        <CookieConsentBanner />
      </div>
    );
  }

  const isFullscreenWorkspace = location.pathname.startsWith('/problem/') || location.pathname.startsWith('/studio');

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      {isRecruiterPreview && <aside aria-label="Recruiter preview" className="mx-auto mt-3 flex w-[96%] flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-400/25 bg-cyan-950/40 px-4 py-3 text-sm text-cyan-100">
        <p><strong>Recruiter preview</strong><span className="ml-2 text-cyan-100/75">View-only tour. Sign in to solve questions, start interviews, and save your progress.</span></p>
        <div className="flex shrink-0 items-center gap-3"><button onClick={() => setIsAuthModalOpen(true)} className="rounded-lg bg-cyan-300 px-3 py-2 font-bold text-slate-950">Sign in to participate</button><button onClick={() => { exitRecruiterPreview(); navigate('/'); }} className="px-2 py-2 text-cyan-100 underline underline-offset-4">Exit preview</button></div>
      </aside>}

      <main className="flex-1 max-w-[98%] mx-auto w-full px-2 sm:px-4 lg:px-6 py-4 pb-20 sm:pb-6">
        {children}
      </main>

      {!isFullscreenWorkspace && <Footer />}

      {!isFullscreenWorkspace && <StickyMobileCTA />}

      <CookieConsentBanner />

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        revokedMessage={revokedSessionMessage}
        onSuccess={(loggedUser) => {
          setRevokedSessionMessage('');
          setUser(loggedUser);
        }}
      />

      {user && <WalletTopupModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        initialAmount={50}
      />}

      {user && <InsufficientCreditsModal
        isOpen={isInsufficientCreditsOpen}
        onClose={() => setIsInsufficientCreditsOpen(false)}
        onOpenRecharge={() => {
          setIsInsufficientCreditsOpen(false);
          setIsWalletModalOpen(true);
        }}
        requiredCost={insufficientMeta.cost}
        actionName={insufficientMeta.action}
      />}

      {user && <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onOpenWallet={() => {
          setIsProfileModalOpen(false);
          setIsWalletModalOpen(true);
        }}
      />}

      {isPotdModalOpen && (
        <POTDModal
          onClose={() => setIsPotdModalOpen(false)}
          onSolveSdeProblem={(prob) => {
            setIsPotdModalOpen(false);
            const slug = (prob as any).slug || prob.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            navigate(`/problem/${slug}${prob.category === 'GFG POTD' ? '?source=gfg' : ''}`);
          }}
        />
      )}

      {user && <AskAIChatModal
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
      />}

      {showMobileGating && (
        <MobileGatedOverlay
          onDismiss={() => setShowMobileGating(false)}
          onSwitchToQuiz={() => {
            setShowMobileGating(false);
            setLessonSubTab('quiz');
          }}
        />
      )}
    </div>
  );
}
