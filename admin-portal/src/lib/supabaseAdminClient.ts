import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://bbxwgezqiqjbmxthchfn.supabase.co';
export const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU2ODYxNSwiZXhwIjoyMTAxMTQ0NjE1fQ.dUf9-JdItaM0HUQ7Jf44cYpHBwDbIXBB18uAyzP3WQo';

// Direct, zero-browser-cache Supabase Admin Client
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export interface SystemPlatformRates {
  video_view_cost: number;
  allow_video_download: boolean;
  video_download_cost: number;
  mock_interview_cost: number;
  free_pass_duration_hours: number;
  suspended_users: string[];
  banned_users: string[];
}

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  solvedCount: number;
  activeMinutes: number;
  walletBalance: number;
  isSuspended: boolean;
  isBanned: boolean;
  moderationReason?: string;
  activeDevicesCount: number;
  lastActive?: string;
}

export interface AdminTopupRecord {
  id: string;
  user_email: string;
  amount: number;
  method: string;
  txn_id?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

/**
 * Fetch real-time system rates from Supabase (Zero browser cache)
 */
export async function fetchSystemRates(): Promise<SystemPlatformRates> {
  const defaultRates: SystemPlatformRates = {
    video_view_cost: 5.0,
    allow_video_download: true,
    video_download_cost: 10.0,
    mock_interview_cost: 50.0,
    free_pass_duration_hours: 24,
    suspended_users: [],
    banned_users: []
  };

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
        return { ...defaultRates, ...data[0].linked_profiles };
      }
    }
  } catch (err) {
    console.error('Failed to fetch rates from Supabase:', err);
  }

  return defaultRates;
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
 * Fetch all registered users with progress, wallet balances, and moderation status from Supabase
 */
export async function fetchAllAdminUsers(): Promise<AdminUserRecord[]> {
  const usersMap = new Map<string, AdminUserRecord>();

  // 1. Fetch system config to get current ban/suspend lists
  const currentRates = await fetchSystemRates();
  const suspendedSet = new Set((currentRates.suspended_users || []).map(e => e.toLowerCase()));
  const bannedSet = new Set((currentRates.banned_users || []).map(e => e.toLowerCase()));

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

        const totalSolved = (r.solved_sde?.length || 0) + (r.solved_a2z?.length || 0) + (r.solved_blind75?.length || 0) + (r.solved_mik?.length || 0);
        usersMap.set(email, {
          id: r.user_id || `usr-${email.replace(/[^a-z0-9]/g, '')}`,
          email: email,
          name: email.includes('mdalamrahman4') ? 'SuperAdmin (MD ALAM RAHMAN)' : (r.linked_profiles?.name || email.split('@')[0]),
          createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Active',
          solvedCount: totalSolved,
          activeMinutes: Math.round(r.active_mins || 0),
          walletBalance: 0, // Will be computed from ledger
          isSuspended: suspendedSet.has(email),
          isBanned: bannedSet.has(email),
          activeDevicesCount: 1,
          lastActive: r.updated_at ? new Date(r.updated_at).toLocaleString() : undefined
        });
      }
    }
  } catch (err) {
    console.error('Failed to fetch user_dsa_progress:', err);
  }

  // 3. Fetch latest transactions to compute exact wallet balances
  try {
    const txRes = await fetch(`${SUPABASE_URL}/rest/v1/billing_transactions?select=user_email,balance_after,created_at&order=created_at.desc`, {
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
        if (!email || seenEmails.has(email)) continue;
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
            activeMinutes: 0,
            walletBalance: Number(tx.balance_after || 0),
            isSuspended: suspendedSet.has(email),
            isBanned: bannedSet.has(email),
            activeDevicesCount: 1
          });
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch billing balances:', err);
  }

  // Ensure primary admin account exists
  if (!usersMap.has('mdalamrahman4@gmail.com')) {
    usersMap.set('mdalamrahman4@gmail.com', {
      id: 'usr-mdalamrahman4',
      email: 'mdalamrahman4@gmail.com',
      name: 'SuperAdmin (MD ALAM RAHMAN)',
      createdAt: '2026-08-01',
      solvedCount: 418,
      activeMinutes: 1200,
      walletBalance: 10000,
      isSuspended: false,
      isBanned: false,
      activeDevicesCount: 1
    });
  }

  return Array.from(usersMap.values());
}

/**
 * Ban or suspend a user account in Supabase (Zero browser cache)
 */
export async function moderateUserInSupabase(
  email: string,
  action: 'suspend' | 'unsuspend' | 'ban' | 'unban',
  reason: string = 'Administrative action'
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
 * Delete a user and their data from Supabase
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

    return true;
  } catch (err) {
    console.error('Failed to delete user from Supabase:', err);
    return false;
  }
}

/**
 * Adjust credits for a user in Supabase ledger (Zero browser cache)
 */
export async function adjustUserCreditsInSupabase(
  email: string,
  amount: number,
  adminNotes: string = 'SuperAdmin Manual Grant'
): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  try {
    // 1. Get current balance from latest transaction
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

    // 2. Insert new transaction in Supabase
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
    console.error('Failed to adjust credits in Supabase:', err);
    return false;
  }
}
