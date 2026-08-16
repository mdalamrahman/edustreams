import { supabase } from './supabase';

export interface StudentUser {
  id: string;
  email: string;
  created_at: string;
}

const AUTH_STORAGE_KEY = 'edustream_student_session';
const USERS_STORAGE_KEY = 'edustream_student_users';

export async function signUpStudent(email: string, password: string): Promise<{ user: StudentUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data?.user) {
      const studentUser: StudentUser = {
        id: data.user.id,
        email: data.user.email || email,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));
      return { user: studentUser, error: null };
    }
    if (error) {
      const msg = (error.message || '').toLowerCase();
      // If error is genuine Supabase user error (e.g. Password too short, invalid format), return it.
      // If error is network/fetch/DNS resolution error due to demo URL, fall through to local session.
      const isNetworkErr = msg.includes('fetch') || msg.includes('network') || msg.includes('resolved') || msg.includes('failed to fetch');
      if (!isNetworkErr) {
        return { user: null, error: error.message };
      }
    }
  } catch (err: any) {
    console.warn('[EduStream Auth] Supabase endpoint notice:', err);
  }

  // Fallback local session management when remote Supabase URL is not configured
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  const users: Record<string, string> = usersJson ? JSON.parse(usersJson) : {};

  if (users[email.toLowerCase()]) {
    return { user: null, error: 'User already registered with this email. Please sign in instead.' };
  }

  users[email.toLowerCase()] = password;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  const studentUser: StudentUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: email.toLowerCase(),
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));

  return { user: studentUser, error: null };
}

export async function signInStudent(email: string, password: string): Promise<{ user: StudentUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data?.user) {
      const studentUser: StudentUser = {
        id: data.user.id,
        email: data.user.email || email,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));
      return { user: studentUser, error: null };
    }
    if (error) {
      const msg = (error.message || '').toLowerCase();
      const isNetworkErr = msg.includes('fetch') || msg.includes('network') || msg.includes('resolved') || msg.includes('failed to fetch');
      if (!isNetworkErr) {
        return { user: null, error: error.message };
      }
    }
  } catch (err: any) {
    console.warn('[EduStream Auth] Supabase endpoint notice:', err);
  }

  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  const users: Record<string, string> = usersJson ? JSON.parse(usersJson) : {};

  const savedPassword = users[email.toLowerCase()];
  if (savedPassword && savedPassword !== password) {
    return { user: null, error: 'Invalid password. Please check your credentials.' };
  }

  if (!savedPassword) {
    users[email.toLowerCase()] = password;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  const studentUser: StudentUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: email.toLowerCase(),
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(studentUser));

  return { user: studentUser, error: null };
}

export function getCurrentStudent(): StudentUser | null {
  try {
    const sessionJson = localStorage.getItem(AUTH_STORAGE_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  } catch {
    return null;
  }
}

export function getAllRegisteredUsers(): Array<{ id: string; email: string; name: string; createdAt: string }> {
  const map = new Map<string, { id: string; email: string; name: string; createdAt: string }>();

  // 1. Check local registered user storage
  try {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    if (usersJson) {
      const users: Record<string, string> = JSON.parse(usersJson);
      for (const [email] of Object.entries(users)) {
        const cleanEmail = email.trim().toLowerCase();
        const username = cleanEmail.split('@')[0];
        map.set(cleanEmail, {
          id: `usr-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
          email: cleanEmail,
          name: cleanEmail.includes('mdalamrahman4') ? `${username} (Admin)` : username,
          createdAt: '2026-08-16'
        });
      }
    }
  } catch {}

  // 2. Check current student session
  const cur = getCurrentStudent();
  if (cur?.email) {
    const cleanEmail = cur.email.trim().toLowerCase();
    const username = cleanEmail.split('@')[0];
    if (!map.has(cleanEmail)) {
      map.set(cleanEmail, {
        id: cur.id || `usr-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
        email: cleanEmail,
        name: cleanEmail.includes('mdalamrahman4') ? `${username} (Admin)` : username,
        createdAt: cur.created_at || new Date().toISOString().slice(0, 10)
      });
    }
  }

  // 3. Ensure Admin account is registered in list
  const adminEmail = 'mdalamrahman4@gmail.com';
  if (!map.has(adminEmail)) {
    map.set(adminEmail, {
      id: 'usr-admin-1',
      email: adminEmail,
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
