import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { supabaseAdmin } from './lib/supabaseAdminClient';

export function AuthGate({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const check = async () => {
      const { data } = await supabaseAdmin.auth.getUser();
      setAllowed(data.user?.app_metadata?.role === 'admin');
    };
    void check();
    const { data } = supabaseAdmin.auth.onAuthStateChange(() => { setTimeout(() => { void check(); }, 0); });
    return () => data.subscription.unsubscribe();
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!sent) {
      const { error } = await supabaseAdmin.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
      setMessage(error ? error.message : 'Check your email for the sign-in code.');
      if (!error) setSent(true);
    } else {
      const { data, error } = await supabaseAdmin.auth.verifyOtp({ email, token: code, type: 'email' });
      setAllowed(data.user?.app_metadata?.role === 'admin');
      setMessage(error?.message || (data.user?.app_metadata?.role === 'admin' ? '' : 'Administrator access is required.'));
    }
  }
  if (allowed) return <>{children}</>;
  return <main style={{ maxWidth: 420, margin: '80px auto', padding: 24 }}>
    <h1>Administrator sign in</h1><form onSubmit={submit}>
      <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      {sent && <label>Code<input required autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value)} /></label>}
      <button type="submit">{sent ? 'Verify code' : 'Send code'}</button>
    </form><p role="status">{message}</p>
  </main>;
}
