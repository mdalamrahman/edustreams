import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { AdminCaptcha } from './AdminCaptcha';
import { supabaseAdmin } from './lib/supabaseAdminClient';

export function AuthGate({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaAttempt, setCaptchaAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const { data: session } = await supabaseAdmin.auth.getSession();
        if (!active) return;
        if (!session.session) { setAllowed(false); return; }
        const { data } = await supabaseAdmin.auth.getUser();
        if (active) setAllowed(data.user?.app_metadata?.role === 'admin');
      } catch {
        if (active) { setHasError(true); setMessage('Unable to check your session. Please sign in again.'); }
      } finally {
        if (active) setChecking(false);
      }
    };
    void check();
    const { data } = supabaseAdmin.auth.onAuthStateChange(() => { setTimeout(() => { void check(); }, 0); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    if (!sent && !captchaToken) {
      setHasError(true); setMessage('Please complete security verification first.'); return;
    }
    setPending(true); setHasError(false); setMessage('');
    try {
      if (!sent) {
        const { error } = await supabaseAdmin.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: { shouldCreateUser: false, emailRedirectTo: window.location.origin, captchaToken },
        });
        if (error) throw error;
        setSent(true); setMessage('Sign-in email sent. Use the secure link or enter the verification code below.');
      } else {
        const { data, error } = await supabaseAdmin.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'email' });
        if (error) throw error;
        if (data.user?.app_metadata?.role !== 'admin') {
          await supabaseAdmin.auth.signOut({ scope: 'local' });
          throw new Error('This account does not have administrator access.');
        }
        setAllowed(true);
      }
    } catch (error) {
      setHasError(true);
      setMessage(error instanceof Error ? error.message : 'Sign-in failed. Please try again.');
    } finally {
      if (!sent) { setCaptchaToken(''); setCaptchaAttempt(value => value + 1); }
      setPending(false);
    }
  }
  if (allowed) return <>{children}</>;
  return <main className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 font-sans">
    <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-9 shadow-2xl" aria-labelledby="admin-sign-in-heading">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></div>
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-300">SDETube administration</p>
      <h1 id="admin-sign-in-heading" className="text-2xl font-bold tracking-tight text-white">{checking ? 'Checking your session' : 'Administrator sign in'}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">Use your registered administrator email to securely access platform management.</p>
      {checking ? <p role="status" className="mt-8 flex items-center gap-3 text-sm text-slate-300"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />Verifying your session…</p> : <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-slate-200">Email address</label>
          <div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" aria-hidden="true" />
            <input id="admin-email" type="email" autoComplete="email" required disabled={sent || pending} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-70" />
          </div>
        </div>
        {sent && <div><label htmlFor="admin-code" className="mb-2 block text-sm font-semibold text-slate-200">Verification code</label><input id="admin-code" required autoComplete="one-time-code" inputMode="numeric" autoFocus disabled={pending} value={code} onChange={e => setCode(e.target.value)} placeholder="Enter your email code" className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400" /></div>}
        {!sent && <AdminCaptcha key={captchaAttempt} onToken={setCaptchaToken} />}
        {message && <p role={hasError ? 'alert' : 'status'} className={`rounded-xl border p-3 text-sm leading-6 ${hasError ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-200'}`}>{message}</p>}
        <button disabled={pending || (!sent && !captchaToken)} type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-wait disabled:opacity-60">{pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}{pending ? 'Please wait…' : sent ? 'Verify and sign in' : 'Send sign-in email'}{!pending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}</button>
        {sent && <button type="button" disabled={pending} onClick={() => { setSent(false); setCode(''); setMessage(''); setHasError(false); }} className="flex w-full items-center justify-center gap-2 py-2 text-sm text-slate-300 hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Use a different email</button>}
      </form>}
      <p className="mt-7 border-t border-slate-800 pt-5 text-xs leading-5 text-slate-500">Access is limited to authorized administrators. Your permissions are verified securely after sign-in.</p>
    </section>
  </main>;
}
