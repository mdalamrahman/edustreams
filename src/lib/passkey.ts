export interface DynamicPasskey {
  code: string;
  createdAt: number;
  expiresAt: number;
  generatedBy: string;
}

const PASSKEY_STORAGE_KEY = 'sdetube_dynamic_auth_passkey';
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
 */
export function getActivePasskey(): { passkey: DynamicPasskey | null; remainingSeconds: number; isExpired: boolean } {
  try {
    const raw = localStorage.getItem(PASSKEY_STORAGE_KEY);
    if (!raw) {
      // Auto-initialize a fresh 10-min passkey if none exists
      const initial = generateDynamicPasskey();
      return { passkey: initial, remainingSeconds: 600, isExpired: false };
    }

    const passkey: DynamicPasskey = JSON.parse(raw);
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((passkey.expiresAt - now) / 1000));
    const isExpired = remaining <= 0;

    return { passkey, remainingSeconds: remaining, isExpired };
  } catch {
    return { passkey: null, remainingSeconds: 0, isExpired: true };
  }
}

/**
 * Verifies whether an entered student registration passkey is valid and unexpired (within 10-min window).
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

  if (!passkey) {
    return { valid: false, error: 'No active authorization passkey found. Please request a new passkey from the Admin.' };
  }

  if (isExpired || remainingSeconds <= 0) {
    return { 
      valid: false, 
      error: 'This authorization passkey has EXPIRED (10-minute validity exceeded). Please request a fresh passkey from Admin.' 
    };
  }

  if (cleanInput !== passkey.code.toUpperCase() && cleanInput !== passkey.code.replace('SDE-', '').toUpperCase()) {
    return { valid: false, error: 'Invalid Authorization Passkey. Please check the 6-digit code provided by Admin.' };
  }

  return { valid: true };
}
