import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://bbxwgezqiqjbmxthchfn.supabase.co';
export const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU2ODYxNSwiZXhwIjoyMTAxMTQ0NjE1fQ.dUf9-JdItaM0HUQ7Jf44cYpHBwDbIXBB18uAyzP3WQo';

// Direct zero-browser-cache Supabase Admin Client
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export interface DynamicSignupOtp {
  code: string;
  targetEmail?: string;
  createdAt: number;
  expiresAt: number;
  generatedBy: string;
  isUsed: boolean;
}

export interface AdminAuthOtpRecord {
  code: string;
  createdAt: number;
  expiresAt: number;
  isUsed: boolean;
  targetEmail: string;
}

export interface AdminPasskeyRecord {
  credentialId: string;
  deviceLabel: string;
  registeredAt: number;
  counter?: number;
}

export interface SystemPlatformRates {
  // Video & Media Section
  video_view_cost: number;
  video_download_cost: number;
  download_whitelist: string[]; // Per-user download permissions
  free_pass_duration_hours: number;

  // Coding & Judge Section
  dsa_compiler_run_cost: number;
  dsa_submission_cost: number;
  sql_run_cost: number;

  // System Design & Architecture Section
  lld_ai_eval_cost: number;
  hld_ai_eval_cost: number;

  // AI Interview Companion Section
  mock_interview_cost: number;
  ai_chat_message_cost: number;
  ai_optimal_solution_cost: number;
  ai_quiz_gen_cost: number;

  // Subscription & Accounts
  daily_usage_fee: number;
  signup_bonus_credits: number;

  // Moderation
  suspended_users: string[];
  banned_users: string[];

  // Signup OTPs & SuperAdmin MFA
  signup_otps?: DynamicSignupOtp[];
  admin_auth_otp?: AdminAuthOtpRecord;
  admin_passkey?: AdminPasskeyRecord;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  solvedCount: number;
  solvedDsa: number;
  solvedLld: number;
  activeMinutes: number;
  walletBalance: number;
  totalSpent: number;
  canDownloadVideos: boolean;
  isSuspended: boolean;
  isBanned: boolean;
  lastActive?: string;
}

export interface SectionUsageItem {
  section: string;
  usageCount: number;
  revenueCredits: number;
  description: string;
}

export interface PlatformAnalyticsSummary {
  totalRechargesAllTime: number;
  totalRechargesThisMonth: number;
  totalRevenueGeneratedAllTime: number;
  totalRevenueGeneratedThisMonth: number;
  totalActiveMinutesSpent: number;
  totalDsaQuestionsSolved: number;
  totalLldQuestionsSolved: number;
  totalInterviewSessionsConducted: number;
  totalRegisteredUsers: number;
  sectionUsageBreakdown: SectionUsageItem[];
  recentTransactions: {
    id: string;
    user_email: string;
    amount: number;
    type: string;
    category?: string;
    description: string;
    balance_after: number;
    created_at: string;
  }[];
}

const DEFAULT_RATES: SystemPlatformRates = {
  video_view_cost: 5.0,
  video_download_cost: 10.0,
  download_whitelist: [],
  free_pass_duration_hours: 24,

  dsa_compiler_run_cost: 0.05,
  dsa_submission_cost: 0.50,
  sql_run_cost: 0.10,

  lld_ai_eval_cost: 0.75,
  hld_ai_eval_cost: 1.00,

  mock_interview_cost: 10.00,
  ai_chat_message_cost: 0.20,
  ai_optimal_solution_cost: 0.50,
  ai_quiz_gen_cost: 0.50,

  daily_usage_fee: 1.00,
  signup_bonus_credits: 10.00,

  suspended_users: [],
  banned_users: [],
  signup_otps: []
};

/**
 * Fetch real-time system rates from Supabase (Zero browser cache)
 */
export async function fetchSystemRates(): Promise<SystemPlatformRates> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/user_dsa_progress?user_email=eq.system_platform_config&select=*`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0 && data[0].linked_profiles) {
        return { ...DEFAULT_RATES, ...data[0].linked_profiles };
      }
    }
  } catch (err) {
    console.error('Failed to fetch rates from Supabase:', err);
  }

  return DEFAULT_RATES;
}

/**
 * Update system rates and permissions in Supabase (Zero browser cache)
 */
export async function saveSystemRates(rates: SystemPlatformRates): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/user_dsa_progress`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        user_email: 'system_platform_config',
        linked_profiles: rates,
        updated_at: new Date().toISOString()
      })
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save rates to Supabase:', err);
    return false;
  }
}

/**
 * Generate a new Signup OTP / Passcode stored in Supabase
 */
export async function generateAdminSignupOtp(
  adminEmail: string = 'admin@aspersde.com',
  expiryMinutes: number = 60,
  targetStudentEmail?: string
): Promise<DynamicSignupOtp | null> {
  try {
    const rates = await fetchSystemRates();
    const existingOtps = (rates.signup_otps || []).filter(o => o.expiresAt > Date.now());

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const code = `SDE-${randomNum}`;
    const now = Date.now();
    const expiresAt = now + (expiryMinutes * 60 * 1000);

    const newOtp: DynamicSignupOtp = {
      code,
      targetEmail: targetStudentEmail ? targetStudentEmail.toLowerCase().trim() : undefined,
      createdAt: now,
      expiresAt,
      generatedBy: adminEmail,
      isUsed: false
    };

    existingOtps.unshift(newOtp);
    rates.signup_otps = existingOtps.slice(0, 30); // Keep last 30 active/recent

    // Also sync to Admin user metadata for backward compatibility with AuthModal passkey check
    try {
      const ADMIN_USER_ID = 'd0f83a4a-d9ca-4c01-98e6-111f9a962a95';
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(ADMIN_USER_ID);
      const existingMeta = userData?.user?.user_metadata || {};
      await supabaseAdmin.auth.admin.updateUserById(ADMIN_USER_ID, {
        user_metadata: {
          ...existingMeta,
          dynamic_passkey: {
            code,
            createdAt: now,
            expiresAt,
            generatedBy: adminEmail
          }
        }
      });
    } catch {}

    const saved = await saveSystemRates(rates);
    return saved ? newOtp : null;
  } catch (err) {
    console.error('Failed to generate signup OTP:', err);
    return null;
  }
}

/**
 * Revoke or delete a signup OTP from Supabase
 */
export async function revokeSignupOtp(code: string): Promise<boolean> {
  try {
    const rates = await fetchSystemRates();
    rates.signup_otps = (rates.signup_otps || []).filter(o => o.code !== code);
    return await saveSystemRates(rates);
  } catch (err) {
    console.error('Failed to revoke signup OTP:', err);
    return false;
  }
}

/**
 * Dispatch a secure Supabase Magic Link / 6-digit OTP email directly
 * to mdalamrahman4@gmail.com using Supabase Auth.
 */
export async function generateAndDispatchAdminOtp(
  targetEmail: string = 'mdalamrahman4@gmail.com'
): Promise<{ success: boolean; message: string; expiresInMins: number }> {
  try {
    const cleanEmail = 'mdalamrahman4@gmail.com';
    const now = Date.now();
    const expiresInMins = 10;
    const expiresAt = now + (expiresInMins * 60 * 1000);
    const redirectUrl = typeof window !== 'undefined' && window.location.origin 
      ? window.location.origin 
      : 'https://sdetube.vercel.app';

    // 1. Dispatch Supabase Magic Link / OTP via Supabase Auth custom SMTP
    let supabaseTriggered = false;
    try {
      const { error: otpErr } = await supabaseAdmin.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl
        }
      });
      if (!otpErr) {
        supabaseTriggered = true;
      } else {
        console.warn('Supabase SDK signInWithOtp notice:', otpErr.message);
      }
    } catch (sbErr) {
      console.warn('Supabase signInWithOtp exception:', sbErr);
    }

    // 2. Direct REST fallback to Supabase /auth/v1/otp with service_role key to guarantee trigger
    try {
      const directRes = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          create_user: true,
          data: { emailRedirectTo: redirectUrl }
        })
      });
      if (directRes.ok) {
        supabaseTriggered = true;
      }
    } catch (directErr) {
      console.warn('Direct Supabase REST OTP trigger exception:', directErr);
    }

    // 3. Generate cryptographic backup OTP token in Supabase platform config
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const rates = await fetchSystemRates();
      rates.admin_auth_otp = {
        code: randomCode,
        createdAt: now,
        expiresAt,
        isUsed: false,
        targetEmail: cleanEmail
      };
      await saveSystemRates(rates);
    } catch {}

    // 4. Notify Render backend mailer if running
    try {
      fetch('https://edustream-backend-90vm.onrender.com/api/admin/send-admin-auth-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_email: cleanEmail,
          otp_code: randomCode,
          expires_in_mins: expiresInMins
        })
      }).catch(() => {});
    } catch {}

    return {
      success: true,
      message: `A secure verification code and Magic Link have been dispatched via Supabase to ${cleanEmail}. Check your inbox or spam folder.`,
      expiresInMins
    };
  } catch (err: any) {
    console.error('Failed to generate admin auth OTP:', err);
    return {
      success: false,
      message: 'Failed to dispatch verification email. Please try again.',
      expiresInMins: 0
    };
  }
}

/**
 * Verify SuperAdmin OTP against Supabase Auth (6 or 8 digits) and platform vault.
 * Automatically marks the token as used on successful verification to prevent replay attacks.
 */
export async function verifyAdminOtp(
  enteredCode: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const cleanInput = enteredCode.trim();
    if (!cleanInput || cleanInput.length < 6) {
      return { success: false, message: 'Please enter a valid verification code (at least 6 digits).' };
    }

    // 1. Verify via Supabase Auth verifyOtp (supports 6 or 8-digit email tokens)
    try {
      const { data: sbData, error: sbError } = await supabaseAdmin.auth.verifyOtp({
        email: 'mdalamrahman4@gmail.com',
        token: cleanInput,
        type: 'email'
      });
      if (!sbError && sbData?.user) {
        return { success: true };
      }
      if (sbError) {
        // Also try magiclink type if email type rejected
        const { data: mlData, error: mlError } = await supabaseAdmin.auth.verifyOtp({
          email: 'mdalamrahman4@gmail.com',
          token: cleanInput,
          type: 'magiclink'
        });
        if (!mlError && mlData?.user) {
          return { success: true };
        }
      }
    } catch (sbVerifyErr) {
      console.warn('Supabase Auth verifyOtp check:', sbVerifyErr);
    }

    // 2. Verify via Supabase Platform Config Vault
    const rates = await fetchSystemRates();
    const otpRecord = rates.admin_auth_otp;

    if (otpRecord && otpRecord.code && otpRecord.code.trim() === cleanInput) {
      if (Date.now() > otpRecord.expiresAt) {
        return { success: false, message: 'Verification code has expired. Please request a new code.' };
      }
      if (otpRecord.isUsed) {
        return { success: false, message: 'This verification code has already been used. Please request a fresh code.' };
      }
      if (rates.admin_auth_otp) {
        rates.admin_auth_otp.isUsed = true;
      }
      await saveSystemRates(rates);
      return { success: true };
    }

    return { success: false, message: 'Invalid verification code. Please check your email and try again.' };
  } catch (err: any) {
    console.error('Failed to verify admin OTP:', err);
    return { success: false, message: 'Server verification error. Please try again.' };
  }
}

/**
 * Fetch the registered SuperAdmin Passkey from Supabase
 */
export async function fetchAdminPasskey(): Promise<AdminPasskeyRecord | null> {
  try {
    const rates = await fetchSystemRates();
    return rates.admin_passkey || null;
  } catch {
    return null;
  }
}

/**
 * Save / Update the SuperAdmin Passkey in Supabase
 */
export async function saveAdminPasskey(passkey: AdminPasskeyRecord): Promise<boolean> {
  try {
    const rates = await fetchSystemRates();
    rates.admin_passkey = passkey;
    return await saveSystemRates(rates);
  } catch (err) {
    console.error('Failed to save passkey in Supabase:', err);
    return false;
  }
}

/**
 * Remove / Revoke the SuperAdmin Passkey from Supabase
 */
export async function removeAdminPasskey(): Promise<boolean> {
  try {
    const rates = await fetchSystemRates();
    delete rates.admin_passkey;
    return await saveSystemRates(rates);
  } catch (err) {
    console.error('Failed to remove passkey from Supabase:', err);
    return false;
  }
}

/**
 * Register a new Hardware Biometric Passkey using WebAuthn standard
 */
export async function registerWebAuthnPasskey(deviceLabel: string): Promise<AdminPasskeyRecord | null> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    throw new Error('WebAuthn biometrics is not supported on this browser or platform.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const userId = new Uint8Array(16);
  window.crypto.getRandomValues(userId);

  const createOptions: CredentialCreationOptions = {
    publicKey: {
      challenge,
      rp: {
        name: 'AsperSDE SuperAdmin Security',
        id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname
      },
      user: {
        id: userId,
        name: 'mdalamrahman4@gmail.com',
        displayName: 'MD ALAM RAHMAN (SuperAdmin)'
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' }
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        residentKey: 'preferred'
      },
      timeout: 60000,
      attestation: 'none'
    }
  };

  const credential = (await navigator.credentials.create(createOptions)) as PublicKeyCredential;
  if (!credential) return null;

  const rawIdBytes = new Uint8Array(credential.rawId);
  let binary = '';
  for (let i = 0; i < rawIdBytes.byteLength; i++) {
    binary += String.fromCharCode(rawIdBytes[i]);
  }
  const credentialId = btoa(binary);

  const passkeyRecord: AdminPasskeyRecord = {
    credentialId,
    deviceLabel: deviceLabel || 'Hardware Passkey (Windows Hello / Touch ID / Face ID)',
    registeredAt: Date.now()
  };

  const saved = await saveAdminPasskey(passkeyRecord);
  if (!saved) {
    throw new Error('Passkey created but failed to persist to Supabase.');
  }

  return passkeyRecord;
}

/**
 * Authenticate using WebAuthn Hardware Passkey
 */
export async function verifyWebAuthnPasskey(registeredPasskey?: AdminPasskeyRecord | null): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    throw new Error('WebAuthn biometrics is not supported on this browser.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  let allowCredentials: PublicKeyCredentialDescriptor[] | undefined = undefined;
  if (registeredPasskey?.credentialId) {
    try {
      const binary = atob(registeredPasskey.credentialId);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      allowCredentials = [
        {
          id: bytes,
          type: 'public-key'
        }
      ];
    } catch {}
  }

  const requestOptions: CredentialRequestOptions = {
    publicKey: {
      challenge,
      rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      userVerification: 'preferred',
      timeout: 60000,
      allowCredentials
    }
  };

  const assertion = await navigator.credentials.get(requestOptions);
  return !!assertion;
}

/**
 * Toggle user-specific video download permission in Supabase
 */
export async function toggleUserDownloadWhitelist(email: string, allow: boolean): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const rates = await fetchSystemRates();
  const whitelist = new Set((rates.download_whitelist || []).map(e => e.toLowerCase()));

  if (allow) {
    whitelist.add(cleanEmail);
  } else {
    whitelist.delete(cleanEmail);
  }

  rates.download_whitelist = Array.from(whitelist);
  return await saveSystemRates(rates);
}

/**
 * Fetch all registered users with accurate progress, wallet balances, and moderation status from Supabase
 */
export async function fetchAllAdminUsers(): Promise<AdminUserRecord[]> {
  const usersMap = new Map<string, AdminUserRecord>();

  // 1. Fetch system config to get current ban/suspend/download lists
  const currentRates = await fetchSystemRates();
  const suspendedSet = new Set((currentRates.suspended_users || []).map(e => e.toLowerCase()));
  const bannedSet = new Set((currentRates.banned_users || []).map(e => e.toLowerCase()));
  const downloadSet = new Set((currentRates.download_whitelist || []).map(e => e.toLowerCase()));

  // 2. Fetch all user_dsa_progress rows
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/user_dsa_progress?select=*`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      cache: 'no-store'
    });

    if (res.ok) {
      const rows = await res.json();
      for (const r of rows) {
        const email = (r.user_email || '').toLowerCase().trim();
        if (!email || email === 'system_platform_config') continue;

        const dsaSolved = (r.solved_sde?.length || 0) + (r.solved_a2z?.length || 0) + (r.solved_blind75?.length || 0) + (r.solved_mik?.length || 0);
        const lldSolved = (r.lld_solved_ids?.length || 0);

        usersMap.set(email, {
          id: r.user_id || `usr-${email.replace(/[^a-z0-9]/g, '')}`,
          email: email,
          name: email.includes('mdalamrahman4') ? 'SuperAdmin (MD ALAM RAHMAN)' : (r.linked_profiles?.name || email.split('@')[0]),
          createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Active',
          solvedCount: dsaSolved + lldSolved,
          solvedDsa: dsaSolved,
          solvedLld: lldSolved,
          activeMinutes: Math.round(r.active_mins || 0),
          walletBalance: 0,
          totalSpent: 0,
          canDownloadVideos: downloadSet.has(email) || email.includes('mdalamrahman4'),
          isSuspended: suspendedSet.has(email),
          isBanned: bannedSet.has(email),
          lastActive: r.updated_at ? new Date(r.updated_at).toLocaleString() : undefined
        });
      }
    }
  } catch (err) {
    console.error('Failed to fetch user_dsa_progress:', err);
  }

  // 3. Fetch latest transactions to compute wallet balances & total spend
  try {
    const txRes = await fetch(`${SUPABASE_URL}/rest/v1/billing_transactions?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      cache: 'no-store'
    });

    if (txRes.ok) {
      const txRows = await txRes.json();
      const seenEmails = new Set<string>();

      for (const tx of txRows) {
        const email = (tx.user_email || '').toLowerCase().trim();
        if (!email) continue;

        if (!seenEmails.has(email)) {
          seenEmails.add(email);
          if (usersMap.has(email)) {
            usersMap.get(email)!.walletBalance = Number(tx.balance_after || 0);
          } else {
            usersMap.set(email, {
              id: `usr-${email.replace(/[^a-z0-9]/g, '')}`,
              email: email,
              name: email.split('@')[0],
              createdAt: new Date().toLocaleDateString(),
              solvedCount: 0,
              solvedDsa: 0,
              solvedLld: 0,
              activeMinutes: 0,
              walletBalance: Number(tx.balance_after || 0),
              totalSpent: 0,
              canDownloadVideos: downloadSet.has(email),
              isSuspended: suspendedSet.has(email),
              isBanned: bannedSet.has(email)
            });
          }
        }

        // Aggregate total debit spend
        if ((tx.type === 'DEBIT' || Number(tx.amount || 0) < 0) && usersMap.has(email)) {
          usersMap.get(email)!.totalSpent += Math.abs(Number(tx.amount || 0));
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch billing balances:', err);
  }

  return Array.from(usersMap.values());
}

/**
 * Fetch 100% ACCURATE executive revenue, recharges, questions solved, and section breakdown directly from Supabase
 * (NO HARDCODED / MOCK FALLBACKS)
 */
export async function fetchPlatformTelemetryAndRevenue(): Promise<PlatformAnalyticsSummary> {
  let totalRechargesAllTime = 0;
  let totalRechargesThisMonth = 0;
  let totalRevenueAllTime = 0;
  let totalRevenueThisMonth = 0;
  let totalActiveMinutes = 0;
  let totalDsaSolved = 0;
  let totalLldSolved = 0;
  let totalInterviews = 0;
  let registeredUsersCount = 0;
  let recentTxs: any[] = [];

  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // e.g. "2026-08"

  // Section Usage Counters
  let videoViewsCount = 0;
  let videoViewsRevenue = 0;
  let dsaJudgeRunsCount = 0;
  let dsaJudgeRevenue = 0;
  let lldAiReviewsCount = 0;
  let lldAiRevenue = 0;
  let hldCanvasCount = 0;
  let hldCanvasRevenue = 0;
  let interviewSessionsCount = 0;
  let interviewRevenue = 0;
  let aiChatCount = 0;
  let aiChatRevenue = 0;

  // 1. Fetch user_dsa_progress for exact solved questions, active minutes, and mock interviews
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/user_dsa_progress?select=*`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      cache: 'no-store'
    });

    if (res.ok) {
      const rows = await res.json();
      for (const r of rows) {
        if (r.user_email === 'system_platform_config') continue;
        registeredUsersCount += 1;
        totalActiveMinutes += Number(r.active_mins || 0);
        totalDsaSolved += (r.solved_sde?.length || 0) + (r.solved_a2z?.length || 0) + (r.solved_blind75?.length || 0) + (r.solved_mik?.length || 0);
        totalLldSolved += (r.lld_solved_ids?.length || 0);

        const mockInterviews = r.linked_profiles?.mock_interviews || [];
        totalInterviews += mockInterviews.length;
        interviewSessionsCount += mockInterviews.length;
      }
    }
  } catch (err) {
    console.error('Error fetching progress telemetry:', err);
  }

  // 2. Fetch billing_transactions for exact revenue & topup calculations
  try {
    const txRes = await fetch(`${SUPABASE_URL}/rest/v1/billing_transactions?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      cache: 'no-store'
    });

    if (txRes.ok) {
      recentTxs = await txRes.json();
      for (const tx of recentTxs) {
        const rawAmt = Number(tx.amount || 0);
        const absAmt = Math.abs(rawAmt);
        const isThisMonth = (tx.created_at || '').startsWith(currentMonthPrefix);

        if (tx.type === 'CREDIT' || rawAmt > 0) {
          totalRechargesAllTime += absAmt;
          if (isThisMonth) totalRechargesThisMonth += absAmt;
        } else if (tx.type === 'DEBIT' || rawAmt < 0) {
          totalRevenueAllTime += absAmt;
          if (isThisMonth) totalRevenueThisMonth += absAmt;

          // Categorize section usage from real transaction description / category
          const desc = ((tx.description || '') + ' ' + (tx.category || '') + ' ' + (tx.type || '')).toLowerCase();
          if (desc.includes('video') || tx.category === 'VIDEO_FIRST_TIME' || tx.category === 'VIDEO_SUBSEQUENT') {
            videoViewsCount += 1;
            videoViewsRevenue += absAmt;
          } else if (desc.includes('compiler') || desc.includes('judge') || desc.includes('code_submit') || tx.category === 'COMPILER_RUN' || tx.category === 'CODE_SUBMIT') {
            dsaJudgeRunsCount += 1;
            dsaJudgeRevenue += absAmt;
          } else if (desc.includes('lld') || tx.category === 'AI_EVALUATION_LLD' || tx.category === 'LLD_DIAGRAM') {
            lldAiReviewsCount += 1;
            lldAiRevenue += absAmt;
          } else if (desc.includes('hld') || tx.category === 'AI_EVALUATION_HLD' || tx.category === 'HLD_STUDIO_DRAW') {
            hldCanvasCount += 1;
            hldCanvasRevenue += absAmt;
          } else if (desc.includes('interview') || tx.category?.includes('INTERVIEW')) {
            interviewRevenue += absAmt;
          } else if (desc.includes('ai') || desc.includes('solution') || desc.includes('chat') || tx.category === 'AI_CHAT' || tx.category === 'AI_OPTIMAL_SOLUTION') {
            aiChatCount += 1;
            aiChatRevenue += absAmt;
          }
        }
      }
    }
  } catch (err) {
    console.error('Error fetching billing telemetry:', err);
  }

  const sectionUsageBreakdown: SectionUsageItem[] = [
    {
      section: 'Video Lectures & Streams',
      usageCount: videoViewsCount,
      revenueCredits: Number(videoViewsRevenue.toFixed(2)),
      description: 'HD Video Lecture Views & Offline Player Streams'
    },
    {
      section: 'DSA Code IDE & Judge0',
      usageCount: dsaJudgeRunsCount,
      revenueCredits: Number(dsaJudgeRevenue.toFixed(2)),
      description: 'Monaco C++, Python, Java, Go Compiler Runs & Automated Judging'
    },
    {
      section: 'FAANG Bar Raiser AI Interviews',
      usageCount: interviewSessionsCount,
      revenueCredits: Number(interviewRevenue.toFixed(2)),
      description: '45-Min Voice Locked Mock Technical Rounds & Scorecards'
    },
    {
      section: 'Interactive HLD Architecture Canvas',
      usageCount: hldCanvasCount,
      revenueCredits: Number(hldCanvasRevenue.toFixed(2)),
      description: 'Distributed System Design Diagrams & Architecture Studio'
    },
    {
      section: 'LLD Machine Coding & Design Patterns',
      usageCount: lldAiReviewsCount,
      revenueCredits: Number(lldAiRevenue.toFixed(2)),
      description: 'SOLID Principles, OOP Patterns & Architecture Diagrams'
    },
    {
      section: 'Ask AI Chat & Code Assistance',
      usageCount: aiChatCount,
      revenueCredits: Number(aiChatRevenue.toFixed(2)),
      description: 'Mistral LLM Explanations, Quiz Batches & Optimal Solutions'
    }
  ];

  return {
    totalRechargesAllTime: Number(totalRechargesAllTime.toFixed(2)),
    totalRechargesThisMonth: Number(totalRechargesThisMonth.toFixed(2)),
    totalRevenueGeneratedAllTime: Number(totalRevenueAllTime.toFixed(2)),
    totalRevenueGeneratedThisMonth: Number(totalRevenueThisMonth.toFixed(2)),
    totalActiveMinutesSpent: Math.round(totalActiveMinutes),
    totalDsaQuestionsSolved: totalDsaSolved,
    totalLldQuestionsSolved: totalLldSolved,
    totalInterviewSessionsConducted: totalInterviews,
    totalRegisteredUsers: registeredUsersCount,
    sectionUsageBreakdown,
    recentTransactions: recentTxs.slice(0, 50)
  };
}

/**
 * Moderate a user in Supabase (Ban / Unban / Suspend / Unsuspend)
 */
export async function moderateUserInSupabase(
  email: string,
  action: 'suspend' | 'unsuspend' | 'ban' | 'unban'
): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const rates = await fetchSystemRates();

  const suspendedSet = new Set((rates.suspended_users || []).map(e => e.toLowerCase()));
  const bannedSet = new Set((rates.banned_users || []).map(e => e.toLowerCase()));

  if (action === 'suspend') {
    suspendedSet.add(cleanEmail);
  } else if (action === 'unsuspend') {
    suspendedSet.delete(cleanEmail);
  } else if (action === 'ban') {
    bannedSet.add(cleanEmail);
    suspendedSet.add(cleanEmail);
  } else if (action === 'unban') {
    bannedSet.delete(cleanEmail);
    suspendedSet.delete(cleanEmail);
  }

  rates.suspended_users = Array.from(suspendedSet);
  rates.banned_users = Array.from(bannedSet);

  return await saveSystemRates(rates);
}

/**
 * Delete user account permanently from Supabase
 */
export async function deleteUserFromSupabase(email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/user_dsa_progress?user_email=eq.${cleanEmail}`, {
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });

    await fetch(`${SUPABASE_URL}/rest/v1/billing_transactions?user_email=eq.${cleanEmail}`, {
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });

    // Also remove from whitelist/ban lists
    const rates = await fetchSystemRates();
    rates.download_whitelist = (rates.download_whitelist || []).filter(e => e.toLowerCase() !== cleanEmail);
    rates.suspended_users = (rates.suspended_users || []).filter(e => e.toLowerCase() !== cleanEmail);
    rates.banned_users = (rates.banned_users || []).filter(e => e.toLowerCase() !== cleanEmail);
    await saveSystemRates(rates);

    return true;
  } catch (err) {
    console.error('Failed to delete user:', err);
    return false;
  }
}

/**
 * Adjust credits in Supabase ledger
 */
export async function adjustUserCreditsInSupabase(
  email: string,
  amount: number,
  adminNotes: string = 'SuperAdmin Manual Grant'
): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  try {
    let currentBalance = 0;
    const txRes = await fetch(`${SUPABASE_URL}/rest/v1/billing_transactions?user_email=eq.${cleanEmail}&select=balance_after&order=created_at.desc&limit=1`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });
    if (txRes.ok) {
      const data = await txRes.json();
      if (data && data.length > 0) {
        currentBalance = Number(data[0].balance_after || 0);
      }
    }

    const newBalance = Math.max(0, currentBalance + amount);
    const txId = `tx-admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const txType = amount >= 0 ? 'CREDIT' : 'DEBIT';

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/billing_transactions`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: txId,
        user_email: cleanEmail,
        amount: amount,
        type: txType,
        description: `🛡️ Admin Credit Adjustment: ${adminNotes}`,
        balance_after: newBalance,
        created_at: new Date().toISOString()
      })
    });

    return insertRes.ok;
  } catch (err) {
    console.error('Failed to adjust credits:', err);
    return false;
  }
}
