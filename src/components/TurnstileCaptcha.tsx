import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export const TURNSTILE_SITE_KEY = '0x4AAAAAAESxCOr_QJKWgIJZ';

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (err?: any) => void;
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
}

export const TurnstileCaptcha: React.FC<TurnstileCaptchaProps> = ({
  onVerify,
  onExpire,
  onError,
  theme = 'dark',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let checkInterval: any = null;
    let isCancelled = false;

    const initTurnstile = () => {
      const turnstile = (window as any).turnstile;
      if (!turnstile || !containerRef.current) return false;

      try {
        if (widgetIdRef.current) {
          try {
            turnstile.remove(widgetIdRef.current);
          } catch {}
          widgetIdRef.current = null;
        }

        const id = turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: theme,
          size: 'normal',
          callback: (token: string) => {
            if (!isCancelled) {
              onVerify(token);
            }
          },
          'expired-callback': () => {
            if (!isCancelled && onExpire) {
              onExpire();
            }
          },
          'error-callback': (err: any) => {
            if (!isCancelled && onError) {
              onError(err);
            }
          }
        });

        widgetIdRef.current = id;
        setIsLoaded(true);
        return true;
      } catch (e) {
        console.warn('[Cloudflare Turnstile Render Error]:', e);
        return false;
      }
    };

    if (!initTurnstile()) {
      checkInterval = setInterval(() => {
        if (initTurnstile()) {
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      isCancelled = true;
      if (checkInterval) clearInterval(checkInterval);
      if (widgetIdRef.current && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
        } catch {}
      }
    };
  }, [theme]);

  return (
    <div className={`flex flex-col items-center justify-center my-3 ${className}`}>
      <div 
        ref={containerRef} 
        className="min-h-[65px] min-w-[300px] flex items-center justify-center rounded-xl overflow-hidden shadow-inner"
      />
      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-1 select-none">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        <span>Cloudflare Turnstile Bot Defense Active</span>
      </div>
    </div>
  );
};
