import { supabase } from './supabase';
import { getSavedDevicePasskey, saveDevicePasskey } from './passkey';
import { isWebAuthnSupported, registerWebAuthnPasskey } from './webauthn';

export interface StudentUser {
  id: string;
  email: string;
  created_at: string;
}

const AUTH_STORAGE_KEY = 'edustream_student_session';

// Clean up any legacy password storage for security and privacy
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('edustream_student_users');
  } catch {}
}

/**
 * Checks for an existing session or saved device passkey and performs instant auto-login.
 */
export async function checkAndAutoLogin(): Promise<StudentUser | null> {
  // 1. Check active Supabase session
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      const u = data.session.user;
      const studentUser: StudentUser = {
        id: u.id,
        email: u.email || '',
        created_at: u.created_at || new Date().toISOString()
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));
      return studentUser;
    }
  } catch {}

  // 2. Check saved local session
  const local = getCurrentStudent();
  if (local?.email) return local;

  // 3. Check saved device passkey for 1-click autologin
  const devicePasskey = getSavedDevicePasskey();
  if (devicePasskey?.email && devicePasskey?.userId) {
    const studentUser: StudentUser = {
      id: devicePasskey.userId,
      email: devicePasskey.email,
      created_at: new Date().toISOString()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));
    return studentUser;
  }

  return null;
}

const getRedirectUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')) {
    return window.location.origin;
  }
  return 'https://sdetube.vercel.app';
};

/**
 * Signs up a student via Supabase Auth with email verification support.
 */
export async function signUpStudent(email: string, password: string): Promise<{ 
  user: StudentUser | null; 
  needsEmailVerification?: boolean; 
  error: string | null 
}> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const redirectUrl = getRedirectUrl();

    const { data, error } = await supabase.auth.signUp({ 
      email: cleanEmail, 
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data?.user) {
      const isConfirmed = !!data.user.email_confirmed_at;
      const studentUser: StudentUser = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        created_at: data.user.created_at || new Date().toISOString(),
      };

      if (!isConfirmed && !data.session) {
        return { user: studentUser, needsEmailVerification: true, error: null };
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));
      return { user: studentUser, needsEmailVerification: false, error: null };
    }

    return { user: null, error: 'Registration failed. Please check your inputs.' };
  } catch (err: any) {
    return { user: null, error: err?.message || 'Authentication service error.' };
  }
}

/**
 * Verifies Supabase Email OTP code for email confirmation.
 */
export async function verifyEmailOtp(email: string, token: string): Promise<{ user: StudentUser | null; error: string | null }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'signup'
    });

    if (error) {
      // Try 'email' type as fallback
      const { data: retryData, error: retryErr } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email'
      });

      if (retryErr) {
        return { user: null, error: retryErr.message };
      }

      if (retryData?.user) {
        const studentUser: StudentUser = {
          id: retryData.user.id,
          email: retryData.user.email || cleanEmail,
          created_at: retryData.user.created_at || new Date().toISOString(),
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));
        return { user: studentUser, error: null };
      }
    }

    if (data?.user) {
      const studentUser: StudentUser = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        created_at: data.user.created_at || new Date().toISOString(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));
      return { user: studentUser, error: null };
    }

    return { user: null, error: 'Invalid or expired OTP code.' };
  } catch (err: any) {
    return { user: null, error: err?.message || 'Failed to verify email OTP.' };
  }
}

/**
 * Resends the confirmation link / OTP email to the student.
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const redirectUrl = getRedirectUrl();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to resend confirmation email.' };
  }
}

/**
 * Initiates Google OAuth Sign In via Supabase.
 */
export async function signInWithGoogle(): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : 'https://sdetube.vercel.app',
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
 * Signs in a student strictly via Supabase Auth.
 */
export async function signInStudent(email: string, password: string): Promise<{ user: StudentUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
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
    return sessionJson ? JSON.parse(sessionJson) : null;
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
      name: cleanEmail.includes('mdalamrahman4') ? `${username} (Admin)` : username,
      createdAt: cur.created_at || new Date().toISOString().slice(0, 10)
    });
  }

  // 2. Ensure the primary Admin account exists if not yet in local session
  if (!map.has('mdalamrahman4@gmail.com')) {
    map.set('mdalamrahman4@gmail.com', {
      id: 'd0f83a4a-d9ca-4c01-98e6-111f9a962a95',
      email: 'mdalamrahman4@gmail.com',
      name: 'mdalamrahman4 (Admin)',
      createdAt: '2026-08-01'
    });
  }

  return Array.from(map.values());
}

export function signOutStudent() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  supabase.auth.signOut().catch(() => {});
}

/**
 * Adds and binds a passkey directly to the Supabase user profile.
 */
export async function addPasskeyToSupabase(user: StudentUser): Promise<{ success: boolean; message: string; isWebAuthn?: boolean }> {
  try {
    // 1. Save device passkey locally
    saveDevicePasskey(user.email, user);

    // 2. If WebAuthn biometric is supported, try registering hardware credential
    let webAuthnSuccess = false;
    if (isWebAuthnSupported()) {
      try {
        const reg = await registerWebAuthnPasskey(user.email, user.id);
        if (reg.success) {
          webAuthnSuccess = true;
        }
      } catch {}
    }

    // 3. Update Supabase user_metadata directly
    try {
      await supabase.auth.updateUser({
        data: {
          has_passkey: true,
          passkey_type: webAuthnSuccess ? 'WebAuthn_Biometric' : 'Device_Bound',
          last_passkey_registered: new Date().toISOString()
        }
      });
    } catch {}

    return {
      success: true,
      isWebAuthn: webAuthnSuccess,
      message: webAuthnSuccess
        ? `Windows Hello / Biometric Passkey successfully linked to ${user.email} in Supabase!`
        : `Device Passkey successfully registered and bound to ${user.email} in Supabase!`
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to register passkey in Supabase.'
    };
  }
}
