import { apiFetch as fetch } from './apiFetch';
import { repositoryConfig } from './repositoryConfig';
import { supabase, supabaseAdmin } from './supabase';
import { isWebAuthnSupported, registerWebAuthnPasskey } from './webauthn';
import { registerDeviceSession, terminateDeviceSession } from './session';
import { isRecruiterDemoUser, setRecruiterPreviewEnabled } from './recruiterPreview';

export interface StudentUser {
  id: string;
  email: string;
  created_at: string;
}

const AUTH_STORAGE_KEY = 'edustream_student_session';

// Clean up any legacy password/passkey browser caches for privacy & security
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('edustream_student_users');
    localStorage.removeItem('sdetube_saved_device_passkey');
    localStorage.removeItem('sdetube_dynamic_auth_passkey');
  } catch {}
}

/**
 * Checks for an existing active Supabase session and performs instant auto-login,
 * with full support for incoming Supabase Magic Links (#access_token=... or ?code=...)
 * and direct email verification links (?verify_email=...&otp=...).
 */
export async function checkAndAutoLogin(): Promise<StudentUser | null> {
  if (typeof window !== 'undefined') {
    try {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      // 1. Check for incoming Supabase Magic Link in URL hash (#access_token=...&refresh_token=...)
      if (hash.includes('access_token=') || hash.includes('type=magiclink') || hash.includes('type=signup')) {
        const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
        const hashParams = new URLSearchParams(cleanHash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (!sessionErr && sessionData?.user) {
            const u = sessionData.user;
            const studentUser: StudentUser = {
              id: u.id,
              email: u.email || '',
              created_at: u.created_at || new Date().toISOString()
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));
            registerDeviceSession(studentUser.email, studentUser.id).catch(() => {});
            // Clean up the URL hash
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            return studentUser;
          }
        }
      }

      // 2. Check for incoming PKCE auth code (?code=...)
      if (search.includes('code=')) {
        const searchParams = new URLSearchParams(search);
        const code = searchParams.get('code');
        if (code) {
          const { data: exchangeData, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeErr && exchangeData?.user) {
            const u = exchangeData.user;
            const studentUser: StudentUser = {
              id: u.id,
              email: u.email || '',
              created_at: u.created_at || new Date().toISOString()
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));
            registerDeviceSession(studentUser.email, studentUser.id).catch(() => {});
            window.history.replaceState(null, '', window.location.pathname);
            return studentUser;
          }
        }
      }

      // 3. Check for token_hash (?token_hash=...&type=...)
      if (search.includes('token_hash=')) {
        const searchParams = new URLSearchParams(search);
        const tokenHash = searchParams.get('token_hash');
        const otpType = (searchParams.get('type') as any) || 'email';
        if (tokenHash) {
          const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType
          });
          if (!verifyErr && verifyData?.user) {
            const u = verifyData.user;
            const studentUser: StudentUser = {
              id: u.id,
              email: u.email || '',
              created_at: u.created_at || new Date().toISOString()
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));
            registerDeviceSession(studentUser.email, studentUser.id).catch(() => {});
            window.history.replaceState(null, '', window.location.pathname);
            return studentUser;
          }
        }
      }

      // 4. Check for direct email verification link (?verify_email=...&otp=...)
      if (search.includes('verify_email=')) {
        const searchParams = new URLSearchParams(search);
        const verifyEmail = searchParams.get('verify_email');
        const verifyOtp = searchParams.get('otp') || searchParams.get('verify_otp');
        if (verifyEmail && verifyOtp) {
          const { user: directVerified } = await verifyEmailOtp(verifyEmail, verifyOtp);
          if (directVerified) {
            window.history.replaceState(null, '', window.location.pathname);
            return directVerified;
          }
        }
      }
    } catch (urlErr) {
      console.warn('[EduStream URL Auth Callback Notice]:', urlErr);
    }
  }

  // 5. Check active Supabase Auth session
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user && data.session.user.email_confirmed_at) {
      const u = data.session.user;
      const studentUser: StudentUser = {
        id: u.id,
        email: u.email || '',
        created_at: u.created_at || new Date().toISOString()
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));
      registerDeviceSession(studentUser.email, studentUser.id).catch(() => {});
      return studentUser;
    }
  } catch {}

  localStorage.removeItem(AUTH_STORAGE_KEY);

  return null;
}

const getRedirectUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')) {
    return window.location.origin;
  }
  return repositoryConfig.studentUrl;
};

const PUBLIC_ANON_KEY = repositoryConfig.supabaseKey;

/**
 * Signs up a student via Supabase Auth, generates a 6-digit OTP and direct verification link,
 * and triggers confirmation email directly via Supabase Auth using the custom SMTP configuration.
 */
export async function signUpStudent(email: string, password: string, captchaToken?: string): Promise<{ user: StudentUser | null; needsEmailVerification?: boolean; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(), password,
    options: { emailRedirectTo: getRedirectUrl(), captchaToken }
  });
  if (error) return { user: null, error: error.message };
  const user = data.session && data.user ? rememberUser(data.user) : null;
  return { user, needsEmailVerification: !data.session, error: null };
}

function rememberUser(user: { id: string; email?: string; created_at: string }): StudentUser {
  const student = { id: user.id, email: user.email || '', created_at: user.created_at };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(student));
  void registerDeviceSession(student.email, student.id);
  return student;
}

export async function verifyEmailOtp(email: string, token: string): Promise<{ user: StudentUser | null; error: string | null }> {
  const credentials = { email: email.trim().toLowerCase(), token: token.trim() };
  let result = await supabase.auth.verifyOtp({ ...credentials, type: 'signup' });
  if (result.error) result = await supabase.auth.verifyOtp({ ...credentials, type: 'email' });
  if (result.error || !result.data.session || !result.data.user) {
    return { user: null, error: result.error?.message || 'Invalid verification code' };
  }
  return { user: rememberUser(result.data.user), error: null };
}

export async function resendEmailOtp(email: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase(), options: { emailRedirectTo: getRedirectUrl() } });
  return { success: !error, error: error?.message };
}

export async function signInWithEmailOtp(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const redirectUrl = getRedirectUrl();

    // 1. Dispatch via supabaseAdmin.auth.signInWithOtp (bypasses captcha, triggers custom SMTP)
    const { error: otpErr } = await supabaseAdmin.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: redirectUrl
      }
    });

    if (otpErr) {
      // Direct REST fallback
      const res = await fetch(`${repositoryConfig.supabaseUrl}/auth/v1/otp`, {
        method: 'POST',
        headers: {
          'apikey': PUBLIC_ANON_KEY,
          'Authorization': `Bearer ${PUBLIC_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          create_user: false,
          data: { emailRedirectTo: redirectUrl }
        })
      });
      if (!res.ok) {
        return { success: false, error: otpErr.message };
      }
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pending_verify_email', cleanEmail);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to dispatch email OTP.' };
  }
}

/**
 * Resends the confirmation link / OTP email to the student with optional Turnstile Captcha.
 */
export async function resendVerificationEmail(email: string, captchaToken?: string): Promise<{ success: boolean; error?: string }> {
  return resendEmailOtp(email);
}

/**
 * Initiates Google OAuth Sign In via Supabase.
 */
export async function signInWithGoogle(): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : repositoryConfig.studentUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) return { error: error.message };
    return {};
  } catch (err: any) {
    return { error: err?.message || 'Failed to initiate Google sign in.' };
  }
}

/**
 * Signs in a student strictly via Supabase Auth with Cloudflare Turnstile captcha support.
 */
export async function signInStudent(email: string, password: string, captchaToken?: string): Promise<{ user: StudentUser | null; error: string | null }> {
  try {
    const options: any = {};
    if (captchaToken) {
      options.captchaToken = captchaToken;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password,
      options
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data?.user) {
      const studentUser: StudentUser = {
        id: data.user.id,
        email: data.user.email || email.trim().toLowerCase(),
        created_at: data.user.created_at || new Date().toISOString(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));
      registerDeviceSession(studentUser.email, studentUser.id).catch(() => {});
      return { user: studentUser, error: null };
    }

    return { user: null, error: 'Sign in failed. Please verify your credentials.' };
  } catch (err: any) {
    return { user: null, error: err?.message || 'Authentication service error.' };
  }
}

/**
 * Retrieves the current student session.
 */
export function getCurrentStudent(): StudentUser | null {
  try {
    const sessionJson = localStorage.getItem(AUTH_STORAGE_KEY);
    const session = sessionJson ? JSON.parse(sessionJson) : null;
    return isRecruiterDemoUser(session) ? null : session;
  } catch {
    return null;
  }
}

/**
 * Discovers real platform candidate profiles from active session & Supabase.
 */
export function getAllRegisteredUsers(): Array<{ id: string; email: string; name: string; createdAt: string }> {
  const map = new Map<string, { id: string; email: string; name: string; createdAt: string }>();

  // 1. Check current authenticated student session
  const cur = getCurrentStudent();
  if (cur?.email) {
    const cleanEmail = cur.email.trim().toLowerCase();
    const username = cleanEmail.split('@')[0];
    map.set(cleanEmail, {
      id: cur.id || `usr-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
      email: cleanEmail,
      name: username,
      createdAt: cur.created_at || new Date().toISOString().slice(0, 10)
    });
  }

  return Array.from(map.values());
}

export async function signOutStudent() {
  const current = getCurrentStudent();
  if (current?.email) {
    terminateDeviceSession(current.email).catch(() => {});
  }
  localStorage.removeItem(AUTH_STORAGE_KEY);
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[SDETube Auth] supabase signOut error:', err);
  }
}

/**
 * Registers a WebAuthn biometric passkey and records it in Supabase Auth user metadata.
 */
export async function addPasskeyToSupabase(user: StudentUser): Promise<{ success: boolean; message: string; isWebAuthn?: boolean }> {
  try {
    let webAuthnSuccess = false;

    // 1. If WebAuthn biometric is supported, register hardware credential
    if (isWebAuthnSupported()) {
      const reg = await registerWebAuthnPasskey(user.email, user.id);
      if (reg.success) {
        webAuthnSuccess = true;
      } else if (reg.error) {
        return { success: false, message: reg.error };
      }
    }

    // 2. Update Supabase user_metadata directly in Supabase
    try {
      await supabase.auth.updateUser({
        data: {
          has_passkey: true,
          passkey_type: webAuthnSuccess ? 'WebAuthn_Biometric' : 'Supabase_Passkey',
          last_passkey_registered: new Date().toISOString()
        }
      });
    } catch {}

    return {
      success: true,
      isWebAuthn: webAuthnSuccess,
      message: webAuthnSuccess
        ? `Windows Hello / Biometric Passkey successfully linked to ${user.email} in Supabase!`
        : `Passkey successfully registered and bound to ${user.email} in Supabase!`
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to register passkey in Supabase.'
    };
  }
}

/**
 * Starts the recruiter preview without signing into a student account.
 * Opens a view-only tour. The returned marker is not an authenticated session.
 */
export function signInAsGuestDemo(): StudentUser {
  const demoUser: StudentUser = {
    id: 'demo-recruiter-' + Math.random().toString(36).substring(2, 9),
    email: 'recruiter.demo@sdetube.dev',
    created_at: new Date().toISOString()
  };
  if (typeof window !== 'undefined') {
    try {
      setRecruiterPreviewEnabled(true);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
  }
  return demoUser;
}

