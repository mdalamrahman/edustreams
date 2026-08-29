import { StudentUser } from './auth';
import { supabaseAdmin } from './supabase';

export interface DynamicPasskey {
  code: string;
  createdAt: number;
  expiresAt: number;
  generatedBy: string;
}

const MASTER_ADMIN_KEY = 'Zerocheck@8100648132';
const ADMIN_USER_ID = 'd0f83a4a-d9ca-4c01-98e6-111f9a962a95';

// Purge any legacy browser passkey cache
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('sdetube_dynamic_auth_passkey');
    localStorage.removeItem('sdetube_saved_device_passkey');
  } catch {}
}

/**
 * Generates a dynamic 6-digit authorization passkey valid for 10 minutes (600s),
 * stored strictly and exclusively in Supabase Auth user_metadata.
 */
export async function generateDynamicPasskey(adminEmail: string = 'mdalamrahman4@gmail.com'): Promise<DynamicPasskey> {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const code = `SDE-${randomNum}`;
  const now = Date.now();
  const expiresAt = now + (10 * 60 * 1000); // 10 minutes from now

  const passkeyObj: DynamicPasskey = {
    code,
    createdAt: now,
    expiresAt,
    generatedBy: adminEmail
  };

  try {
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(ADMIN_USER_ID);
    const existingMeta = userData?.user?.user_metadata || {};
    
    await supabaseAdmin.auth.admin.updateUserById(ADMIN_USER_ID, {
      user_metadata: {
        ...existingMeta,
        dynamic_passkey: passkeyObj
      }
    });
  } catch (err) {
    console.warn('[Passkey Supabase Sync Error]:', err);
  }

  return passkeyObj;
}

/**
 * Fetches the active passkey directly from Supabase Auth in real-time.
 * Automatically purges from Supabase if expired.
 */
export async function syncGlobalActivePasskey(): Promise<{ passkey: DynamicPasskey | null; remainingSeconds: number; isExpired: boolean }> {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(ADMIN_USER_ID);
    if (error) {
      console.warn('[Supabase Passkey Read Error]:', error);
      return { passkey: null, remainingSeconds: 0, isExpired: true };
    }

    const passkey: DynamicPasskey | null = data?.user?.user_metadata?.dynamic_passkey || null;

    if (passkey?.expiresAt) {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((passkey.expiresAt - now) / 1000));

      if (remaining <= 0 || now >= passkey.expiresAt) {
        // Expired -> Purge from Supabase immediately
        try {
          const existingMeta = data?.user?.user_metadata || {};
          await supabaseAdmin.auth.admin.updateUserById(ADMIN_USER_ID, {
            user_metadata: { ...existingMeta, dynamic_passkey: null }
          });
        } catch {}
        return { passkey: null, remainingSeconds: 0, isExpired: true };
      }

      return { passkey, remainingSeconds: remaining, isExpired: false };
    }
  } catch (err) {
    console.warn('[Sync Global Passkey Error]:', err);
  }

  return { passkey: null, remainingSeconds: 0, isExpired: true };
}

/**
 * Verifies student registration passkey strictly against Supabase Auth.
 */
export async function verifyStudentPasskey(enteredCode: string): Promise<{ valid: boolean; error?: string }> {
  const cleanInput = (enteredCode || '').trim().toUpperCase();

  if (!cleanInput) {
    return { valid: false, error: 'Authorization Code is required for new student registrations.' };
  }

  // Master Admin Override
  if (cleanInput === MASTER_ADMIN_KEY.toUpperCase() || cleanInput === 'ZEROCHECK@6289943543') {
    return { valid: true };
  }

  try {
    // 1. Check system_platform_config signup_otps array first
    try {
      const res = await fetch(`https://bbxwgezqiqjbmxthchfn.supabase.co/rest/v1/user_dsa_progress?user_email=eq.system_platform_config&select=*`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU2ODYxNSwiZXhwIjoyMTAxMTQ0NjE1fQ.dUf9-JdItaM0HUQ7Jf44cYpHBwDbIXBB18uAyzP3WQo',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0 && rows[0].linked_profiles?.signup_otps) {
          const otps: any[] = rows[0].linked_profiles.signup_otps;
          const matched = otps.find(o => {
            const code = (o.code || '').toUpperCase();
            const numeric = code.replace('SDE-', '');
            return (cleanInput === code || cleanInput === numeric) && o.expiresAt > Date.now();
          });
          if (matched) {
            return { valid: true };
          }
        }
      }
    } catch {}

    // 2. Read directly from Supabase Auth admin metadata
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(ADMIN_USER_ID);
    
    if (error) {
      console.warn('[Supabase Passkey Verification Error]:', error);
      return { valid: false, error: 'Failed to verify passkey with Supabase Auth.' };
    }

    const passkey: DynamicPasskey | null = data?.user?.user_metadata?.dynamic_passkey || null;

    if (!passkey?.code || !passkey?.expiresAt) {
      return { 
        valid: false, 
        error: 'No active authorization passkey found in Supabase. Please request a fresh passkey from Admin.' 
      };
    }

    const now = Date.now();
    const remaining = Math.max(0, Math.floor((passkey.expiresAt - now) / 1000));

    // Expiration check
    if (remaining <= 0 || now >= passkey.expiresAt) {
      try {
        const existingMeta = data?.user?.user_metadata || {};
        await supabaseAdmin.auth.admin.updateUserById(ADMIN_USER_ID, {
          user_metadata: { ...existingMeta, dynamic_passkey: null }
        });
      } catch {}

      return {
        valid: false,
        error: 'This authorization passkey has EXPIRED. Please request a fresh passkey from Admin.'
      };
    }

    // Match code check
    const targetCode = passkey.code.toUpperCase();
    const targetNumeric = targetCode.replace('SDE-', '');

    if (cleanInput === targetCode || cleanInput === targetNumeric) {
      return { valid: true };
    } else {
      return {
        valid: false,
        error: 'Invalid Authorization Passkey. Please check the code provided by Admin.'
      };
    }
  } catch (err: any) {
    return { 
      valid: false, 
      error: err?.message || 'Error communicating with Supabase Passkey service.' 
    };
  }
}
