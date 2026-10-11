import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CONSENT_STORAGE_KEY, CookieConsentPreferences } from '../lib/analyticsTracker';

interface CookieConsentBannerProps {
  onNavigateToPrivacy?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onNavigateToPrivacy,
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  const [showDetails, setShowDetails] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!stored) {
        // Delay slightly for smooth page entry
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // Listen for footer "Cookie Preferences" re-open requests
  useEffect(() => {
    const handleReopen = () => {
      setIsVisible(true);
      setShowDetails(true);
    };
    window.addEventListener('sdetube_open_cookie_preferences', handleReopen);
    return () => window.removeEventListener('sdetube_open_cookie_preferences', handleReopen);
  }, []);

  const saveConsent = (analytics: boolean) => {
    const pref: CookieConsentPreferences = {
      essential: true,
      analytics,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(pref));
      if (analytics && typeof (window as any).gtag === 'function') {
        (window as any).gtag('consent', 'update', {
          'analytics_storage': 'granted',
        });
      }
      window.dispatchEvent(new CustomEvent('sdetube_consent_updated', { detail: pref }));
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 p-5 rounded-3xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl backdrop-blur-2xl text-slate-100 animate-fadeIn"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400">
              <Cookie className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>Privacy & Cookie Preferences</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-mono text-[10px] font-bold">
                  GDPR Ready
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                We use strictly essential local storage to save your code submissions and learning streaks.
              </p>
            </div>
          </div>
          <button
            onClick={() => saveConsent(false)}
            className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Reject non-essential and close"
            aria-label="Reject non-essential and close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Detailed Options Drawer */}
        {showDetails && (
          <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
            {/* Essential */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200">Essential Data (Required)</span>
                <p className="text-[11px] text-slate-400">Session authentication, passkey telemetry, and solved problem tracking.</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold">
                Always On
              </span>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200">Performance Telemetry</span>
                <p className="text-[11px] text-slate-400">Anonymous page view metrics and crash logs to improve code compilers.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{showDetails ? 'Hide Preferences' : 'Customize'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => saveConsent(false)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Essential Only
            </button>
            <button
              onClick={() => saveConsent(true)}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </div>

        {/* Legal Link */}
        <div className="text-[10px] text-slate-500 text-center">
          Read our{' '}
          <button
            onClick={() => {
              if (onNavigateToPrivacy) onNavigateToPrivacy();
              navigate('/privacy');
            }}
            className="text-indigo-400 hover:underline cursor-pointer"
          >
            Privacy Policy
          </button>{' '}
          and{' '}
          <button
            onClick={() => {
              window.location.hash = '#/terms';
            }}
            className="text-indigo-400 hover:underline cursor-pointer"
          >
            Terms of Service
          </button>
          .
        </div>
      </div>
    </div>
  );
};
