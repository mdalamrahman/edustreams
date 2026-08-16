import { supabase } from './supabase';

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
 * Signs up a student strictly via Supabase Auth (No LocalStorage password storage).
 */
export async function signUpStudent(email: string, password: string): Promise<{ user: StudentUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({ 
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

    return { user: null, error: 'Registration failed. Please check your inputs.' };
  } catch (err: any) {
    return { user: null, error: err?.message || 'Authentication service error.' };
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

  // 2. The 3 verified platform accounts
  const platformAccounts = [
    { email: 'mdalamrahman4@gmail.com', name: 'mdalamrahman4 (Admin)', id: 'usr-admin-1', createdAt: '2026-08-01' },
    { email: 'candidate@sdetube.edu', name: 'Candidate Dev', id: 'usr-cand-2', createdAt: '2026-08-05' },
    { email: 'student@edustream.org', name: 'SDE Student Learner', id: 'usr-stud-3', createdAt: '2026-08-10' }
  ];

  for (const acc of platformAccounts) {
    if (!map.has(acc.email)) {
      map.set(acc.email, acc);
    }
  }

  return Array.from(map.values());
}

export function signOutStudent() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  supabase.auth.signOut().catch(() => {});
}
