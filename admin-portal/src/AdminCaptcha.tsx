import { useEffect, useRef, useState } from 'react';

type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

export function AdminCaptcha({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let widget: string | undefined;
    let api: Turnstile | undefined;
    const sitekey = String(import.meta.env.VITE_TURNSTILE_SITE_KEY || '');
    onToken('');
    setError('');
    if (!sitekey) {
      setError('Security verification is not configured. Please contact support.');
      return;
    }
    let script = document.querySelector<HTMLScriptElement>('script[data-admin-turnstile]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.dataset.adminTurnstile = 'true';
      document.head.appendChild(script);
    }
    const fail = () => {
      if (!(window as Window & { turnstile?: Turnstile }).turnstile) script?.remove();
      if (active) { onToken(''); setError('Security verification failed. Please retry.'); }
    };
    script.addEventListener('error', fail);
    const interval = window.setInterval(() => {
      api = (window as Window & { turnstile?: Turnstile }).turnstile;
      if (!api || !container.current || widget !== undefined) return;
      try {
        widget = api.render(container.current, {
          sitekey, theme: 'dark', size: 'flexible',
          callback: (token: string) => { if (active) { setError(''); onToken(token); } },
          'expired-callback': () => { if (active) { onToken(''); setError('Security verification expired. Please retry.'); } },
          'error-callback': fail,
        });
        window.clearInterval(interval);
      } catch { fail(); }
    }, 100);
    const timeout = window.setTimeout(() => { if (widget === undefined) fail(); }, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      script?.removeEventListener('error', fail);
      if (widget !== undefined) api?.remove(widget);
    };
  }, [retry, onToken]);
  return <div aria-label="Security verification">
    <div ref={container} className="min-h-[65px] w-full" />
    {error && <p role="alert" className="mt-2 text-sm text-red-200">{error}</p>}
    {error && <button type="button" className="mt-2 text-sm text-indigo-300 underline" onClick={() => setRetry(value => value + 1)}>Retry security verification</button>}
  </div>;
}
