/**
 * SDETube Privacy-First Analytics & Event Tracking Engine
 * Supports Google Analytics 4 (GA4), cookieless telemetry, and respects GDPR cookie consent preferences.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const CONSENT_STORAGE_KEY = 'sdetube_cookie_consent';

export interface CookieConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export function getStoredCookieConsent(): CookieConsentPreferences | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function hasAnalyticsConsent(): boolean {
  // If Do Not Track is enabled in the browser, strictly honor it
  if (typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || (window as any).doNotTrack === '1')) {
    return false;
  }
  const consent = getStoredCookieConsent();
  // In privacy-preserving mode, default to false until user grants consent
  return consent ? consent.analytics === true : false;
}

export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined') return;

  const resolvedTitle = title || document.title;

  if (hasAnalyticsConsent() && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_title: resolvedTitle,
      page_location: window.location.href,
      page_path: path,
    });
  }

  // Internal dispatch for session analytics
  window.dispatchEvent(new CustomEvent('sdetube_page_view', {
    detail: { path, title: resolvedTitle, timestamp: Date.now() }
  }));
}

export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  if (hasAnalyticsConsent() && typeof window.gtag === 'function') {
    window.gtag('event', eventName, parameters);
  }

  // Broadcast event for live in-app diagnostic trackers
  window.dispatchEvent(new CustomEvent('sdetube_telemetry_event', {
    detail: { event: eventName, parameters, timestamp: Date.now() }
  }));
}

// Preset High-Value Conversion Events
export const AnalyticsEvents = {
  PROBLEM_SOLVED: (problemTitle: string, difficulty: string, language: string) => {
    trackEvent('problem_solved', {
      problem_title: problemTitle,
      difficulty,
      programming_language: language,
    });
  },
  POTD_COMPLETED: (platform: 'sdetube' | 'leetcode' | 'gfg', problemName: string) => {
    trackEvent('potd_completed', {
      platform,
      problem_name: problemName,
    });
  },
  MOCK_INTERVIEW_STARTED: (role: string, round: string) => {
    trackEvent('mock_interview_started', {
      target_role: role,
      round_name: round,
    });
  },
  WALLET_TOPPED_UP: (amount: number, currency: string = 'INR') => {
    trackEvent('wallet_topped_up', {
      value: amount,
      currency,
    });
  },
  LESSON_STARTED: (videoTitle: string, channelId: string) => {
    trackEvent('lesson_started', {
      video_title: videoTitle,
      channel_id: channelId,
    });
  }
};
