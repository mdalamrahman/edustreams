import { StudentUser } from './auth';

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

/**
 * Generates a new dynamic 6-digit authorization passkey valid for exactly 10 minutes (600 seconds).
 */
export function generateDynamicPasskey(adminEmail: string = 'mdalamrahman4@gmail.com'): DynamicPasskey {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const code = `SDE-${randomNum}`;
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes

  const passkeyObj: DynamicPasskey = {
    code,
    createdAt: now,
    expiresAt,
    generatedBy: adminEmail
  };

  try {
    localStorage.setItem(PASSKEY_STORAGE_KEY, JSON.stringify(passkeyObj));
  } catch {}

  return passkeyObj;
}

/**
 * Retrieves the currently active dynamic passkey and calculates remaining validity.
 * Automatically DELETES the passkey from storage if 10 minutes have elapsed so it is never stored.
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
 * Verifies whether an entered student registration passkey is valid and unexpired (within 10-min window).
 * Automatically purges the code if expired.
 */
export function verifyStudentPasskey(enteredCode: string): { valid: boolean; error?: string } {
  const cleanInput = (enteredCode || '').trim().toUpperCase();

  if (!cleanInput) {
    return { valid: false, error: 'Authorization Code is required for new student registrations.' };
  }

  // Master Admin Override
  if (cleanInput === MASTER_ADMIN_KEY.toUpperCase()) {
    return { valid: true };
  }

  const { passkey, remainingSeconds, isExpired } = getActivePasskey();

  if (!passkey || isExpired || remainingSeconds <= 0) {
    // Ensure deleted
    try { localStorage.removeItem(PASSKEY_STORAGE_KEY); } catch {}
    return { 
      valid: false, 
      error: 'This authorization passkey has EXPIRED (10-minute validity exceeded) and has been deleted. Please request a fresh passkey from Admin.' 
    };
  }

  if (cleanInput !== passkey.code.toUpperCase() && cleanInput !== passkey.code.replace('SDE-', '').toUpperCase()) {
    return { valid: false, error: 'Invalid Authorization Passkey. Please check the 6-digit code provided by Admin.' };
  }

  return { valid: true };
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
