import { StudentUser } from './auth';
import { supabaseAdmin } from './supabase';

export interface DynamicPasskey {
  code: string;
  createdAt: number;
  expiresAt: number;
  generatedBy: string;
}

export interface DevicePasskeyCredential {
  email: string;
  userId: string;
  deviceName: string;
  savedAt: number;
  deviceToken: string;
}

const PASSKEY_STORAGE_KEY = 'sdetube_dynamic_auth_passkey';
const DEVICE_PASSKEY_STORAGE_KEY = 'sdetube_saved_device_passkey';
const MASTER_ADMIN_KEY = 'Zerocheck@8100648132';
const ADMIN_USER_ID = 'd0f83a4a-d9ca-4c01-98e6-111f9a962a95';

/**
 * Generates a new dynamic 6-digit authorization passkey valid for exactly 10 minutes (600 seconds),
 * and syncs it globally directly into Supabase Auth so students on ANY device in the world can use it.
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

  // 1. Local Cache for Instant Admin UI Feedback
  try {
    localStorage.setItem(PASSKEY_STORAGE_KEY, JSON.stringify(passkeyObj));
  } catch {}

  // 2. Global Sync directly to Supabase Auth
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
    console.warn('[Passkey Supabase Sync notice]:', err);
  }

  return passkeyObj;
}

/**
 * Synchronous local reader with auto-deletion of expired keys.
 */
export function getActivePasskey(): { passkey: DynamicPasskey | null; remainingSeconds: number; isExpired: boolean } {
  try {
    const raw = localStorage.getItem(PASSKEY_STORAGE_KEY);
    if (!raw) {
      return { passkey: null, remainingSeconds: 0, isExpired: true };
    }

    const passkey: DynamicPasskey = JSON.parse(raw);
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((passkey.expiresAt - now) / 1000));
    
    // Auto-delete immediately once 10 minutes are up
    if (remaining <= 0 || now >= passkey.expiresAt) {
      localStorage.removeItem(PASSKEY_STORAGE_KEY);
      return { passkey: null, remainingSeconds: 0, isExpired: true };
    }

    return { passkey, remainingSeconds: remaining, isExpired: false };
  } catch {
    try { localStorage.removeItem(PASSKEY_STORAGE_KEY); } catch {}
    return { passkey: null, remainingSeconds: 0, isExpired: true };
  }
}

/**
 * Asynchronously syncs the global active passkey directly from Supabase for any device.
 */
export async function syncGlobalActivePasskey(): Promise<{ passkey: DynamicPasskey | null; remainingSeconds: number; isExpired: boolean }> {
  try {
    const { data } = await supabaseAdmin.auth.admin.getUserById(ADMIN_USER_ID);
    const passkey: DynamicPasskey | null = data?.user?.user_metadata?.dynamic_passkey || null;

    if (passkey?.expiresAt) {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((passkey.expiresAt - now) / 1000));

      if (remaining <= 0 || now >= passkey.expiresAt) {
        // Expired -> Purge from Supabase immediately so it is never stored
        const existingMeta = data?.user?.user_metadata || {};
        await supabaseAdmin.auth.admin.updateUserById(ADMIN_USER_ID, {
          user_metadata: { ...existingMeta, dynamic_passkey: null }
        });
        localStorage.removeItem(PASSKEY_STORAGE_KEY);
        return { passkey: null, remainingSeconds: 0, isExpired: true };
      }

      localStorage.setItem(PASSKEY_STORAGE_KEY, JSON.stringify(passkey));
      return { passkey, remainingSeconds: remaining, isExpired: false };
    }
  } catch (err) {
    console.warn('[Sync Global Passkey Notice]:', err);
  }

  return getActivePasskey();
}

/**
 * Verifies whether an entered student registration passkey is valid and unexpired (within 10-min window).
 * Queries Supabase globally so ANY student on ANY phone/laptop can authenticate.
 */
export async function verifyStudentPasskey(enteredCode: string): Promise<{ valid: boolean; error?: string }> {
  const cleanInput = (enteredCode || '').trim().toUpperCase();

  if (!cleanInput) {
    return { valid: false, error: 'Authorization Code is required for new student registrations.' };
  }

  // Master Admin Override
  if (cleanInput === MASTER_ADMIN_KEY.toUpperCase()) {
    return { valid: true };
  }

  try {
    // 1. Fetch Global Live Passkey directly from Supabase
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(ADMIN_USER_ID);
    
    if (error) {
      console.warn('[Supabase Passkey Read Error]:', error);
    }

    const passkey: DynamicPasskey | null = data?.user?.user_metadata?.dynamic_passkey || null;

    if (passkey?.code && passkey?.expiresAt) {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((passkey.expiresAt - now) / 1000));

      // Expired Check
      if (remaining <= 0 || now >= passkey.expiresAt) {
        // Auto-purge from Supabase immediately so no expired codes are stored
        try {
          const existingMeta = data?.user?.user_metadata || {};
          await supabaseAdmin.auth.admin.updateUserById(ADMIN_USER_ID, {
            user_metadata: { ...existingMeta, dynamic_passkey: null }
          });
          localStorage.removeItem(PASSKEY_STORAGE_KEY);
        } catch {}

        return {
          valid: false,
          error: 'This authorization passkey has EXPIRED (10-minute validity exceeded) and has been deleted. Please request a fresh passkey from Admin.'
        };
      }

      // Valid Active Passkey Check
      const targetCode = passkey.code.toUpperCase();
      const targetNumeric = targetCode.replace('SDE-', '');

      if (cleanInput === targetCode || cleanInput === targetNumeric) {
        return { valid: true };
      } else {
        return {
          valid: false,
          error: `Invalid Authorization Passkey. Please check the code provided by Admin (e.g. ${targetCode.slice(0, 4)}***).`
        };
      }
    }
  } catch (err: any) {
    console.warn('[Passkey Verification Network Fallback]:', err);
  }

  // 2. Fallback to Local Storage Verification
  const { passkey: localKey, remainingSeconds, isExpired } = getActivePasskey();

  if (localKey && !isExpired && remainingSeconds > 0) {
    const targetCode = localKey.code.toUpperCase();
    const targetNumeric = targetCode.replace('SDE-', '');
    if (cleanInput === targetCode || cleanInput === targetNumeric) {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'Invalid Authorization Passkey. Please check the 6-digit code provided by Admin.'
    };
  }

  return { 
    valid: false, 
    error: 'No active authorization passkey found. Please ask the Admin to click "Generate New (10m)" in the Admin Dashboard.' 
  };
}

/* ========================================================================= */
/* DEVICE PASSKEY / 1-CLICK TRUSTED DEVICE FAST LOGIN                       */
/* ========================================================================= */

function getDeviceName(): string {
  if (typeof navigator === 'undefined') return 'Desktop Device';
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Macintosh|Mac OS/i.test(ua)) return 'MacBook / macOS';
  if (/Linux/i.test(ua)) return 'Linux Workstation';
  if (/iPhone|iPad/i.test(ua)) return 'Apple iOS Device';
  if (/Android/i.test(ua)) return 'Android Device';
  return 'Trusted Browser Device';
}

/**
 * Saves a device passkey credential to local device storage for 1-click passwordless sign-in.
 */
export function saveDevicePasskey(email: string, user: StudentUser): DevicePasskeyCredential {
  const credential: DevicePasskeyCredential = {
    email: email.trim().toLowerCase(),
    userId: user.id,
    deviceName: getDeviceName(),
    savedAt: Date.now(),
    deviceToken: `dpk_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
  };

  try {
    localStorage.setItem(DEVICE_PASSKEY_STORAGE_KEY, JSON.stringify(credential));
  } catch {}

  return credential;
}

/**
 * Retrieves the saved device passkey if available on this device.
 */
export function getSavedDevicePasskey(): DevicePasskeyCredential | null {
  try {
    const raw = localStorage.getItem(DEVICE_PASSKEY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Removes the saved device passkey from this device.
 */
export function removeSavedDevicePasskey(): void {
  try {
    localStorage.removeItem(DEVICE_PASSKEY_STORAGE_KEY);
  } catch {}
}
