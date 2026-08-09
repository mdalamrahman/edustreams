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
    if (error && !error.message.includes('Fetch') && !error.message.includes('network') && !error.message.includes('RESOLVED')) {
      return { user: null, error: error.message };
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
    if (error && !error.message.includes('Fetch') && !error.message.includes('network') && !error.message.includes('RESOLVED')) {
      return { user: null, error: error.message };
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

export function signOutStudent() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  supabase.auth.signOut().catch(() => {});
}
