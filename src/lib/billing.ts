/**
 * SDETube Comprehensive Billing & Credits System
 * Synchronized with Database (SQLite backend on Render + client fallback cache)
 * Manages user wallet balances, pricing rules, transactions, UPI top-up requests,
 * daily platform usage fees, and insufficient balance gatekeeping.
 */

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://edustream-backend-90vm.onrender.com';
import {
  storeUsagePriceInRedis,
  getCachedPricingConfigFromRedis,
  cachePricingConfigInRedis
} from './redis';

export const PRICING_CONFIG = {
  SIGNUP_FREE_CREDITS: 10.00,        // Free ₹10 credits upon opening an account
  DAILY_USAGE_FEE: 1.00,             // ₹1 per day usage fee after logging in
  VIDEO_FIRST_TIME: 2.00,            // ₹2 for opening each video for the first time
  VIDEO_SUBSEQUENT: 1.00,            // ₹1 from subsequent times
  AI_CHAT_MESSAGE: 0.20,             // 20 paise (₹0.20) per AI LLM chat response
  AI_CODE_REVIEW_DSA: 0.50,          // 50 paise (₹0.50) per senior AI Code Review
  AI_OPTIMAL_SOLUTION_GEN: 0.50,     // 50 paise (₹0.50) per AI optimal solution generation
  AI_QUIZ_GEN_BATCH: 0.50,           // 50 paise (₹0.50) per on-demand AI quiz batch generation
  AI_EVALUATION_HLD: 1.00,           // ₹1 for AI evaluation of HLD
  AI_EVALUATION_LLD: 0.75,           // ₹0.75 (75 paise) for AI evaluation of LLD
  AI_MOCK_INTERVIEW: 10.00,          // ₹10 for full-length AI Mock Interview with Bar Raiser
  COMPILER_RUN_DSA_LLD: 0.05,        // 5 paise (₹0.05) per compiler run
  CODE_SUBMIT_DSA_LLD: 0.50,         // 50 paise (₹0.50) per submission / judge
  SQL_RUN_JUDGE: 0.10,               // 10 paise (₹0.10) per SQL run
  CLOUD_CODE_SAVE: 0.05,             // 5 paise (₹0.05) per cloud code sync
  LLD_DIAGRAM_VIEW: 0.20,            // 20 paise (₹0.20) per SDETube LLD architecture diagram render
  HLD_EXCALIDRAW_DRAWING: 0.00,      // Free on Excalidraw
  HLD_STUDIO_PLATFORM_DRAWING: 0.50, // 50 paise (₹0.50) if our Architecture Studio platform is used
  DESIGN_DIAGRAM_RENDER: 0.20,       // 20 paise (₹0.20) Standard Diagram Render
  AI_DESIGN_STUDIO: 0.60,            // 60 paise (₹0.60, 3x cost) AI-Powered Interactive Studio Diagram
  NODE_AI_GUIDE_QUERY: 0.10,         // 10 paise (₹0.10) per node AI contextual query
  ANALYTICS_AI_REFRESH: 1.00,        // ₹1 for analytics AI diagnostic refresh
  AI_RESUME_ANALYSIS: 1.50,          // ₹1.50 for full SDETube AI resume scan + ATS scoring + 18 3D flashcards
  AI_RESUME_TAILOR: 1.00,            // ₹1.00 for AI resume tailoring/modifying against target JD
  AI_RESUME_BULLET_ENHANCE: 0.20,    // 20 paise (₹0.20) per Google XYZ formula bullet polish
};

export async function fetchLivePlatformPricing(): Promise<typeof PRICING_CONFIG> {
  try {
    // 1. Check Upstash Redis cache first (5-minute TTL)
    const cached = await getCachedPricingConfigFromRedis().catch(() => null);
    if (cached) {
      Object.assign(PRICING_CONFIG, cached);
      return PRICING_CONFIG;
    }

    // 2. Fetch from database (Supabase)
    const res = await fetch(`https://bbxwgezqiqjbmxthchfn.supabase.co/rest/v1/user_dsa_progress?user_email=eq.system_platform_config&select=*`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU2ODYxNSwiZXhwIjoyMTAxMTQ0NjE1fQ.dUf9-JdItaM0HUQ7Jf44cYpHBwDbIXBB18uAyzP3WQo',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0 && data[0].linked_profiles) {
        const p = data[0].linked_profiles;
        if (p.video_view_cost !== undefined) {
          PRICING_CONFIG.VIDEO_FIRST_TIME = Number(p.video_view_cost);
          PRICING_CONFIG.VIDEO_SUBSEQUENT = Number(p.video_view_cost);
        }
        if (p.dsa_compiler_run_cost !== undefined) PRICING_CONFIG.COMPILER_RUN_DSA_LLD = Number(p.dsa_compiler_run_cost);
        if (p.dsa_submission_cost !== undefined) PRICING_CONFIG.CODE_SUBMIT_DSA_LLD = Number(p.dsa_submission_cost);
        if (p.sql_run_cost !== undefined) PRICING_CONFIG.SQL_RUN_JUDGE = Number(p.sql_run_cost);
        if (p.lld_ai_eval_cost !== undefined) PRICING_CONFIG.AI_EVALUATION_LLD = Number(p.lld_ai_eval_cost);
        if (p.hld_ai_eval_cost !== undefined) PRICING_CONFIG.AI_EVALUATION_HLD = Number(p.hld_ai_eval_cost);
        if (p.mock_interview_cost !== undefined) PRICING_CONFIG.AI_MOCK_INTERVIEW = Number(p.mock_interview_cost);
        if (p.ai_chat_message_cost !== undefined) PRICING_CONFIG.AI_CHAT_MESSAGE = Number(p.ai_chat_message_cost);
        if (p.ai_optimal_solution_cost !== undefined) PRICING_CONFIG.AI_OPTIMAL_SOLUTION_GEN = Number(p.ai_optimal_solution_cost);
        if (p.ai_quiz_gen_cost !== undefined) PRICING_CONFIG.AI_QUIZ_GEN_BATCH = Number(p.ai_quiz_gen_cost);
        if (p.daily_usage_fee !== undefined) PRICING_CONFIG.DAILY_USAGE_FEE = Number(p.daily_usage_fee);
        if (p.signup_bonus_credits !== undefined) PRICING_CONFIG.SIGNUP_FREE_CREDITS = Number(p.signup_bonus_credits);

        // Cache in Redis with 5-minute TTL to keep sync with DB
        await cachePricingConfigInRedis({ ...PRICING_CONFIG }).catch(() => {});
      }
    }
  } catch {}
  return PRICING_CONFIG;
}

export async function isUserAllowedToDownloadVideo(userEmail?: string | null): Promise<boolean> {
  if (!userEmail) return false;
  const cleanEmail = userEmail.toLowerCase().trim();
  if (cleanEmail.includes('mdalamrahman4') || cleanEmail.includes('admin@aspersde')) return true;

  try {
    const res = await fetch(`https://bbxwgezqiqjbmxthchfn.supabase.co/rest/v1/user_dsa_progress?user_email=eq.system_platform_config&select=*`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHdnZXpxaXFqYm14dGhjaGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU2ODYxNSwiZXhwIjoyMTAxMTQ0NjE1fQ.dUf9-JdItaM0HUQ7Jf44cYpHBwDbIXBB18uAyzP3WQo',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0 && data[0].linked_profiles?.download_whitelist) {
        const list: string[] = data[0].linked_profiles.download_whitelist;
        return list.map(e => e.toLowerCase().trim()).includes(cleanEmail);
      }
    }
  } catch {}
  return false;
}

export const UPI_CONFIG = {
  PAYEE_NAME: 'md alam rahman',
  PAYEE_UPI_ID: 'mdalamrahman6@ptyes',
  ACCOUNT_LABEL: 'SDETube Platform Top-up'
};

export type BillingActionType =
  | 'SIGNUP_BONUS'
  | 'DAILY_LOGIN'
  | 'VIDEO_FIRST_TIME'
  | 'VIDEO_SUBSEQUENT'
  | 'AI_CHAT'
  | 'AI_CODE_REVIEW'
  | 'AI_OPTIMAL_SOLUTION'
  | 'AI_QUIZ_GEN'
  | 'AI_EVALUATION_HLD'
  | 'AI_EVALUATION_LLD'
  | 'AI_MOCK_INTERVIEW'
  | 'LLD_DIAGRAM'
  | 'COMPILER_RUN'
  | 'CODE_SUBMIT'
  | 'SQL_RUN'
  | 'CLOUD_CODE_SAVE'
  | 'HLD_STUDIO_DRAW'
  | 'ANALYTICS_REFRESH'
  | 'AI_RESUME_ANALYSIS'
  | 'AI_RESUME_TAILOR'
  | 'AI_RESUME_BULLET_ENHANCE'
  | 'UPI_TOPUP'
  | 'ADMIN_MANUAL_GRANT'
  | 'BUG_BOUNTY'
  | 'STANDARD_DIAGRAM'
  | 'AI_DESIGN_STUDIO'
  | 'AI_ARCH_CRITIQUE'
  | 'STUDIO_COMPILER_RUN';

export interface BillingTransaction {
  id: string;
  userId: string;
  userEmail: string;
  amount: number; // positive for credit, negative for debit
  type: 'CREDIT' | 'DEBIT';
  category: BillingActionType;
  description: string;
  balanceAfter: number;
  timestamp: string;
}

export interface TopupRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  amount: number;
  upiId: string;
  transactionId: string; // UTR or Txn No
  payeeDetails: string;
  screenshotUrl?: string;
  screenshotBase64?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface UserWallet {
  userId: string;
  userEmail: string;
  balance: number;
  lastDailyChargeDate?: string;
  viewedVideoIds: string[]; // Set of video IDs previously charged
  videoAccessPasses?: Record<string, number>; // Map of videoId -> last charged timestamp (epoch ms)
  studioUsedToday?: string; // Date studio usage was charged
  createdAt: string;
  updatedAt: string;
}

const WALLETS_STORAGE_KEY = 'sdetube_billing_wallets';
const TRANSACTIONS_STORAGE_KEY = 'sdetube_billing_transactions';
const TOPUPS_STORAGE_KEY = 'sdetube_billing_topups';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// Helper to notify other UI components of wallet changes
export function emitWalletUpdate(wallet: UserWallet) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sdetube_wallet_updated', { detail: wallet }));
  }
}

// Get active user email from session
function getActiveEmail(overrideEmail?: string): string {
  if (overrideEmail && overrideEmail.trim()) return overrideEmail.trim().toLowerCase();
  try {
    const raw = localStorage.getItem('edustream_student_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email) return parsed.email.toLowerCase();
    }
  } catch {}
  return 'student@sdetube.com';
}

function getAllWallets(): Record<string, UserWallet> {
  try {
    const raw = localStorage.getItem(WALLETS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllWallets(wallets: Record<string, UserWallet>) {
  try {
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets));
  } catch {}
}

import { supabaseAdmin } from './supabase';

export function getAllTransactions(): BillingTransaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Returns all billing transactions for a specific user, with automatic seed initialization if empty.
 */
export function getUserTransactions(email?: string): BillingTransaction[] {
  const userEmail = getActiveEmail(email).toLowerCase();
  const all = getAllTransactions();
  let userTx = all.filter(t => (t.userEmail || '').toLowerCase() === userEmail);

  if (userTx.length === 0) {
    // If empty, check if any transactions exist or seed welcome bonus
    if (all.length > 0) {
      userTx = all;
    } else {
      const wallet = getUserWallet(userEmail);
      const initialTx: BillingTransaction = {
        id: `tx-init-${Date.now()}`,
        userId: wallet.userId,
        userEmail,
        amount: PRICING_CONFIG.SIGNUP_FREE_CREDITS,
        type: 'CREDIT',
        category: 'SIGNUP_BONUS',
        description: '🎁 Welcome Bonus: Free ₹10.00 Credits on account registration',
        balanceAfter: wallet.balance,
        timestamp: new Date(Date.now() - 3600000).toISOString()
      };
      all.unshift(initialTx);
      saveTransactions(all, wallet);
      userTx = [initialTx];
    }
  }

  return userTx;
}

/**
 * Saves transactions to local cache and syncs directly with Supabase Auth user metadata.
 */
function saveTransactions(list: BillingTransaction[], userWallet?: UserWallet) {
  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(list.slice(0, 500)));
    if (list.length > 0 && userWallet) {
      syncTransactionToSupabase(list[0], userWallet);
    }
  } catch {}
}

export function getAllTopupRequests(): TopupRequest[] {
  try {
    const raw = localStorage.getItem(TOPUPS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTopupRequests(list: TopupRequest[]) {
  try {
    localStorage.setItem(TOPUPS_STORAGE_KEY, JSON.stringify(list));
    if (list.length > 0) {
      syncTopupToSupabase(list[0]);
    }
  } catch {}
}

/**
 * Persists a transaction and wallet state directly to Supabase Database & Auth metadata for 100% durable storage.
 */
export async function syncTransactionToSupabase(tx: BillingTransaction, wallet: UserWallet): Promise<void> {
  try {
    // 1. Direct PostgreSQL Table Insert (if table exists)
    try {
      await supabaseAdmin.from('billing_transactions').upsert({
        id: tx.id,
        user_id: tx.userId,
        user_email: tx.userEmail,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        description: tx.description,
        balance_after: tx.balanceAfter,
        timestamp: tx.timestamp
      });
    } catch {}

    // 2. Direct Auth User Metadata Sync
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    if (!usersData?.users) return;

    const user = usersData.users.find(u => (u.email || '').toLowerCase() === (wallet.userEmail || '').toLowerCase());
    if (!user) return;

    const existingMeta = user.user_metadata || {};
    const existingTx: BillingTransaction[] = Array.isArray(existingMeta.billing_transactions) ? existingMeta.billing_transactions : [];
    const updatedTx = [tx, ...existingTx.filter(t => t.id !== tx.id)].slice(0, 500);

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...existingMeta,
        billing_wallet: wallet,
        billing_transactions: updatedTx
      }
    });
  } catch (err) {
    console.warn('[Supabase Transaction Sync Notice]:', err);
  }
}

/**
 * Persists top-up request to Supabase Database & Auth metadata for 100% durable storage.
 */
export async function syncTopupToSupabase(topup: TopupRequest): Promise<void> {
  try {
    // 1. Direct PostgreSQL Table Insert
    try {
      await supabaseAdmin.from('topup_requests').upsert({
        id: topup.id,
        user_id: topup.userId,
        user_email: topup.userEmail,
        amount: topup.amount,
        transaction_id: topup.transactionId,
        status: topup.status,
        created_at: topup.createdAt
      });
    } catch {}

    // 2. Direct Auth User Metadata Sync
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    if (!usersData?.users) return;

    const user = usersData.users.find(u => (u.email || '').toLowerCase() === (topup.userEmail || '').toLowerCase());
    if (!user) return;

    const existingMeta = user.user_metadata || {};
    const existingTopups: TopupRequest[] = Array.isArray(existingMeta.billing_topups) ? existingMeta.billing_topups : [];
    const updatedTopups = [topup, ...existingTopups.filter(t => t.id !== topup.id)];

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...existingMeta,
        billing_topups: updatedTopups
      }
    });
  } catch (err) {
    console.warn('[Supabase Topup Sync Notice]:', err);
  }
}

/**
 * Fetches durable transactions directly from Supabase for the current user.
 */
export async function fetchTransactionsFromSupabase(email?: string): Promise<BillingTransaction[]> {
  const userEmail = getActiveEmail(email);
  try {
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    if (!usersData?.users) return getAllTransactions();

    const user = usersData.users.find(u => u.email?.toLowerCase() === userEmail);
    if (!user) return getAllTransactions();

    const meta = user.user_metadata || {};
    if (meta.billing_wallet) {
      const wallets = getAllWallets();
      wallets[userEmail] = meta.billing_wallet;
      saveAllWallets(wallets);
      emitWalletUpdate(meta.billing_wallet);
    }

    if (Array.isArray(meta.billing_transactions) && meta.billing_transactions.length > 0) {
      saveTransactions(meta.billing_transactions);
      return meta.billing_transactions;
    }
  } catch (err) {
    console.warn('[Supabase Transactions Fetch Notice]:', err);
  }
  return getAllTransactions();
}

/**
 * Checks if a specific video is currently within its active 24-hour free access window.
 */
export function isVideoFreeWithin24h(videoId: string, email?: string): boolean {
  const userEmail = getActiveEmail(email);
  const wallets = getAllWallets();
  const wallet = wallets[userEmail] || getUserWallet(userEmail);
  const passes = wallet.videoAccessPasses || {};
  const lastPaid = passes[videoId] || 0;
  const elapsed = Date.now() - lastPaid;
  return elapsed >= 0 && elapsed < TWENTY_FOUR_HOURS_MS;
}

/**
 * Returns remaining hours of free access for a video, or 0 if expired/not unlocked.
 */
export function getVideoAccessRemainingHours(videoId: string, email?: string): number {
  const userEmail = getActiveEmail(email);
  const wallets = getAllWallets();
  const wallet = wallets[userEmail] || getUserWallet(userEmail);
  const passes = wallet.videoAccessPasses || {};
  const lastPaid = passes[videoId] || 0;
  const elapsed = Date.now() - lastPaid;
  if (elapsed >= 0 && elapsed < TWENTY_FOUR_HOURS_MS) {
    return Number(((TWENTY_FOUR_HOURS_MS - elapsed) / (3600 * 1000)).toFixed(1));
  }
  return 0;
}

const _walletSyncThrottles: Record<string, number> = {};

/**
 * Synchronizes user wallet directly with persistent Supabase & Database.
 */
export async function syncWalletWithDatabase(email?: string): Promise<UserWallet> {
  const userEmail = getActiveEmail(email);
  const now = Date.now();
  const lastSync = _walletSyncThrottles[userEmail] || 0;
  if (now - lastSync < 10000) {
    return getUserWallet(userEmail);
  }
  _walletSyncThrottles[userEmail] = now;

  // 1. Sync directly from Supabase first
  try {
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    if (usersData?.users) {
      const user = usersData.users.find(u => u.email?.toLowerCase() === userEmail);
      if (user?.user_metadata?.billing_wallet) {
        const cloudWallet = user.user_metadata.billing_wallet as UserWallet;
        const wallets = getAllWallets();
        const prevBal = wallets[userEmail]?.balance;
        wallets[userEmail] = cloudWallet;
        saveAllWallets(wallets);
        if (prevBal !== cloudWallet.balance) {
          emitWalletUpdate(cloudWallet);
        }
        if (Array.isArray(user.user_metadata.billing_transactions)) {
          localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(user.user_metadata.billing_transactions));
        }
        return cloudWallet;
      }
    }
  } catch (err) {
    console.warn('[Supabase Wallet Sync Notice]:', err);
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/billing/wallet?email=${encodeURIComponent(userEmail)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.wallet) {
        const wallet: UserWallet = {
          userId: data.wallet.userId,
          userEmail: data.wallet.userEmail,
          balance: Number(data.wallet.balance),
          lastDailyChargeDate: data.wallet.lastDailyChargeDate,
          viewedVideoIds: Array.isArray(data.wallet.viewedVideoIds) ? data.wallet.viewedVideoIds : [],
          videoAccessPasses: typeof data.wallet.videoAccessPasses === 'object' && data.wallet.videoAccessPasses ? data.wallet.videoAccessPasses : {},
          studioUsedToday: data.wallet.studioUsedToday,
          createdAt: data.wallet.createdAt,
          updatedAt: data.wallet.updatedAt,
        };
        const wallets = getAllWallets();
        const prevBal = wallets[userEmail]?.balance;
        wallets[userEmail] = wallet;
        saveAllWallets(wallets);
        if (prevBal !== wallet.balance) {
          emitWalletUpdate(wallet);
        }
        return wallet;
      }
    }
  } catch (err) {
    console.warn('[Billing DB Sync Notice]:', err);
  }
  return getUserWallet(userEmail);
}

/**
 * Retrieves the current user's wallet from local cache and schedules background DB sync.
 */
export function getUserWallet(email?: string): UserWallet {
  const userEmail = getActiveEmail(email);
  const wallets = getAllWallets();
  let wallet = wallets[userEmail];

  const todayStr = new Date().toISOString().slice(0, 10);

  if (!wallet) {
    // Initialize with free ₹10 bonus credits in local cache
    wallet = {
      userId: `usr-${Date.now()}`,
      userEmail,
      balance: PRICING_CONFIG.SIGNUP_FREE_CREDITS,
      lastDailyChargeDate: todayStr,
      viewedVideoIds: [],
      videoAccessPasses: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    wallets[userEmail] = wallet;
    saveAllWallets(wallets);

    const initialTx: BillingTransaction = {
      id: `tx-${Date.now()}`,
      userId: wallet.userId,
      userEmail,
      amount: PRICING_CONFIG.SIGNUP_FREE_CREDITS,
      type: 'CREDIT',
      category: 'SIGNUP_BONUS',
      description: '🎁 Welcome Bonus: Free ₹10.00 Credits for new account',
      balanceAfter: wallet.balance,
      timestamp: new Date().toISOString()
    };
    const allTx = getAllTransactions();
    allTx.unshift(initialTx);
    saveTransactions(allTx);
  }

  return wallet;
}

/**
 * Checks if the user has sufficient balance for an action.
 */
export function canAffordAction(requiredAmount: number, email?: string): boolean {
  const wallet = getUserWallet(email);
  return wallet.balance >= requiredAmount;
}

/**
 * Deducts credits for a platform activity and syncs atomically with backend Database.
 */
export function deductCredits(
  amount: number,
  category: BillingActionType,
  description: string,
  email?: string
): { success: boolean; newBalance: number; error?: string } {
  const userEmail = getActiveEmail(email);
  const wallets = getAllWallets();
  const wallet = getUserWallet(userEmail);

  if (wallet.balance < amount) {
    return {
      success: false,
      newBalance: wallet.balance,
      error: 'INSUFFICIENT_CREDITS'
    };
  }

  // Optimistic deduction in cache
  wallet.balance = parseFloat((wallet.balance - amount).toFixed(4));
  wallet.updatedAt = new Date().toISOString();
  wallets[userEmail] = wallet;
  saveAllWallets(wallets);

  const tx: BillingTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId: wallet.userId,
    userEmail,
    amount: -amount,
    type: 'DEBIT',
    category,
    description,
    balanceAfter: wallet.balance,
    timestamp: new Date().toISOString()
  };

  const allTx = getAllTransactions();
  allTx.unshift(tx);
  saveTransactions(allTx, wallet);
  emitWalletUpdate(wallet);

  // Store price of each usage in Upstash Redis with 5-minute TTL keeping sync with DB
  storeUsagePriceInRedis({
    userEmail,
    category,
    price: amount,
    description,
    balanceAfter: wallet.balance,
    metadata: { txId: tx.id },
    syncWithDb: false
  }).catch((err) => {
    console.warn('[Redis Usage Price Store Notice]:', err);
  });

  // Sync with persistent SQLite Database
  fetch(`${BACKEND_URL}/api/billing/deduct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail,
      amount,
      category,
      description
    })
  }).then(async (res) => {
    if (res.ok) {
      const data = await res.json();
      if (data.wallet) {
        wallet.balance = Number(data.wallet.balance);
        wallets[userEmail] = wallet;
        saveAllWallets(wallets);
        emitWalletUpdate(wallet);
      }
    }
  }).catch((err) => {
    console.warn('[Billing Deduct DB Notice]:', err);
  });

  return {
    success: true,
    newBalance: wallet.balance
  };
}

/**
 * Handles video view billing: 24-hour full access pass upon unlocking (₹2.00 first time, ₹1.00 re-watch).
 * Within 24 hours of unlocking, the same video is 100% FREE to open.
 * Syncs viewed history, 24h passes, and balance with database.
 */
export function handleVideoViewBilling(
  videoId: string, 
  videoTitle: string, 
  email?: string
): { success: boolean; newBalance: number; cost: number; isFreeWithin24h?: boolean; remainingHours?: number; error?: string } {
  const userEmail = getActiveEmail(email);
  const wallets = getAllWallets();
  const wallet = getUserWallet(userEmail);

  if (!wallet.videoAccessPasses) {
    wallet.videoAccessPasses = {};
  }

  // 1. Check if video is within active 24-hour free access window
  if (isVideoFreeWithin24h(videoId, userEmail)) {
    const remaining = getVideoAccessRemainingHours(videoId, userEmail);
    return {
      success: true,
      newBalance: wallet.balance,
      cost: 0.0,
      isFreeWithin24h: true,
      remainingHours: remaining
    };
  }

  // 2. 24h pass expired or never viewed
  const isFirstTime = !wallet.viewedVideoIds.includes(videoId);
  const cost = isFirstTime ? PRICING_CONFIG.VIDEO_FIRST_TIME : PRICING_CONFIG.VIDEO_SUBSEQUENT;

  if (wallet.balance < cost) {
    return {
      success: false,
      newBalance: wallet.balance,
      cost,
      isFreeWithin24h: false,
      error: `INSUFFICIENT_CREDITS: Unlocking this video requires ₹${cost.toFixed(2)} for 24-hour full access. Your current balance is ₹${wallet.balance.toFixed(2)}.`
    };
  }

  // Optimistic update
  wallet.balance = parseFloat((wallet.balance - cost).toFixed(4));
  wallet.videoAccessPasses[videoId] = Date.now();
  if (isFirstTime) {
    wallet.viewedVideoIds.push(videoId);
  }
  wallet.updatedAt = new Date().toISOString();
  wallets[userEmail] = wallet;
  saveAllWallets(wallets);

  const tx: BillingTransaction = {
    id: `tx-${Date.now()}`,
    userId: wallet.userId,
    userEmail,
    amount: -cost,
    type: 'DEBIT',
    category: isFirstTime ? 'VIDEO_FIRST_TIME' : 'VIDEO_SUBSEQUENT',
    description: `📺 ${isFirstTime ? 'First-time Video Access (24h Pass)' : 'Video Re-watch (24h Pass)'}: ${videoTitle.slice(0, 40)}`,
    balanceAfter: wallet.balance,
    timestamp: new Date().toISOString()
  };

  const allTx = getAllTransactions();
  allTx.unshift(tx);
  saveTransactions(allTx, wallet);
  emitWalletUpdate(wallet);

  // Store price of video view usage in Upstash Redis with 5-minute TTL keeping sync with DB
  storeUsagePriceInRedis({
    userEmail,
    category: isFirstTime ? 'VIDEO_FIRST_TIME' : 'VIDEO_SUBSEQUENT',
    price: cost,
    description: `📺 Video Access (24h Pass): ${videoTitle.slice(0, 40)}`,
    balanceAfter: wallet.balance,
    metadata: { videoId, isFirstTime, txId: tx.id },
    syncWithDb: false
  }).catch((err) => {
    console.warn('[Redis Video Usage Price Store Notice]:', err);
  });

  // Sync with persistent SQLite Database
  fetch(`${BACKEND_URL}/api/billing/video-view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail,
      video_id: videoId,
      video_title: videoTitle
    })
  }).then(async (res) => {
    if (res.ok) {
      const data = await res.json();
      if (data.wallet) {
        wallet.balance = Number(data.wallet.balance);
        if (data.wallet.videoAccessPasses) {
          wallet.videoAccessPasses = data.wallet.videoAccessPasses;
        }
        wallets[userEmail] = wallet;
        saveAllWallets(wallets);
        emitWalletUpdate(wallet);
      }
    }
  }).catch((err) => {
    console.warn('[Video Billing DB Notice]:', err);
  });

  return {
    success: true,
    newBalance: wallet.balance,
    cost,
    isFreeWithin24h: false,
    remainingHours: 24.0
  };
}

/**
 * Manually adds or adjusts credits for any user (Admin function).
 * Syncs with Database.
 */
export function adminAddCredits(
  targetEmail: string,
  amount: number,
  adminNotes: string = 'Admin Manual Grant'
): UserWallet {
  const cleanEmail = targetEmail.trim().toLowerCase();
  const wallets = getAllWallets();
  let wallet = wallets[cleanEmail] || getUserWallet(cleanEmail);

  wallet.balance = parseFloat((wallet.balance + amount).toFixed(4));
  wallet.updatedAt = new Date().toISOString();
  wallets[cleanEmail] = wallet;
  saveAllWallets(wallets);

  const tx: BillingTransaction = {
    id: `tx-${Date.now()}`,
    userId: wallet.userId,
    userEmail: cleanEmail,
    amount,
    type: amount >= 0 ? 'CREDIT' : 'DEBIT',
    category: 'ADMIN_MANUAL_GRANT',
    description: `🛡️ Admin Credit Adjustment: ${adminNotes}`,
    balanceAfter: wallet.balance,
    timestamp: new Date().toISOString()
  };

  const allTx = getAllTransactions();
  allTx.unshift(tx);
  saveTransactions(allTx, wallet);
  emitWalletUpdate(wallet);

  // Sync to database
  fetch(`${BACKEND_URL}/api/billing/admin/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: cleanEmail,
      amount,
      admin_notes: adminNotes
    })
  }).catch((e) => console.warn('[Admin Adjust DB Notice]:', e));

  return wallet;
}

/**
 * Automatically credits bounty reward (e.g. ₹1.00 for verified testcase issue reports)
 * to user wallet and syncs atomically with SQLite and cloud.
 */
export function creditUserReward(
  amount: number = 1.00,
  description: string = '🎉 Verified Issue Bounty: ₹1.00 credited for finding and resolving testcase issue',
  email?: string
): { success: boolean; newBalance: number; wallet: UserWallet } {
  const userEmail = getActiveEmail(email);
  const wallets = getAllWallets();
  let wallet = wallets[userEmail] || getUserWallet(userEmail);

  const newBalance = Math.round((wallet.balance + amount) * 10000) / 10000;
  wallet.balance = newBalance;
  wallet.updatedAt = new Date().toISOString();

  wallets[userEmail] = wallet;
  saveAllWallets(wallets);

  const tx: BillingTransaction = {
    id: `tx-bounty-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: wallet.userId,
    userEmail,
    amount,
    type: 'CREDIT',
    category: 'BUG_BOUNTY',
    description,
    balanceAfter: newBalance,
    timestamp: new Date().toISOString()
  };

  const allTx = getAllTransactions();
  allTx.unshift(tx);
  saveTransactions(allTx, wallet);
  emitWalletUpdate(wallet);

  // Sync to database
  fetch(`${BACKEND_URL}/api/billing/credit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail,
      amount,
      category: 'BUG_BOUNTY',
      description
    })
  }).catch((e) => console.warn('[Credit Reward DB Notice]:', e));

  return { success: true, newBalance, wallet };
}

/**
 * Consolidated idempotent bug bounty claim for problem / testcase / driver repairs.
 * Ensures reward is credited only once per problem per user across all report channels.
 */
export function claimReportBounty(
  problemSlug: string,
  problemTitle: string,
  issueType: 'testcase' | 'driver' | 'problem' = 'testcase',
  email?: string
): { success: boolean; rewardedAmount: number; newBalance?: number; alreadyClaimed: boolean } {
  const activeEmail = getActiveEmail(email);
  const bountyClaimKey = `edustream_bounty_claimed_${problemSlug}_${activeEmail}`;
  const legacyTestcaseKey = `edustream_bounty_claimed_testcase_${problemSlug}_${activeEmail}`;
  const legacyDriverKey = `edustream_bounty_claimed_driver_${problemSlug}_${activeEmail}`;

  try {
    if (
      localStorage.getItem(bountyClaimKey) ||
      localStorage.getItem(legacyTestcaseKey) ||
      localStorage.getItem(legacyDriverKey)
    ) {
      return { success: true, rewardedAmount: 0, alreadyClaimed: true };
    }
  } catch {}

  const description = `🎉 Bug Bounty: ₹1.00 credited for finding and auto-resolving ${issueType} issue in ${problemTitle}`;
  const credit = creditUserReward(1.00, description, activeEmail);

  try {
    localStorage.setItem(bountyClaimKey, '1');
    localStorage.setItem(legacyTestcaseKey, '1');
    localStorage.setItem(legacyDriverKey, '1');
  } catch {}

  // Sync claim with server ledger in background
  try {
    fetch(`${BACKEND_URL}/api/bounty/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_slug: problemSlug,
        category: issueType,
        email: activeEmail,
        problem_title: problemTitle
      })
    }).catch(() => {});
  } catch {}

  return {
    success: true,
    rewardedAmount: 1.00,
    newBalance: credit.newBalance,
    alreadyClaimed: false
  };
}

/**
 * Server-authenticated bug bounty claim with dual-scope defect and rate locks.
 */
export async function claimReportBountyServer(
  problemSlug: string,
  problemTitle: string,
  issueType: 'testcase' | 'driver' | 'problem' = 'testcase',
  testInput: string = '',
  proposedOutput: string = '',
  email?: string
): Promise<{ success: boolean; rewardedAmount: number; newBalance?: number; alreadyClaimed: boolean }> {
  const activeEmail = getActiveEmail(email);
  try {
    const res = await fetch(`${BACKEND_URL}/api/bounty/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_slug: problemSlug,
        category: issueType,
        test_input: testInput,
        proposed_expected_output: proposedOutput,
        problem_title: problemTitle,
        email: activeEmail
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.newBalance !== undefined) {
        const wallets = getAllWallets();
        if (wallets[activeEmail]) {
          wallets[activeEmail].balance = data.newBalance;
          saveAllWallets(wallets);
        }
      }
      return {
        success: true,
        rewardedAmount: data.rewardedAmount !== undefined ? data.rewardedAmount : 1.0,
        newBalance: data.newBalance,
        alreadyClaimed: Boolean(data.alreadyClaimed)
      };
    } else if (res.status === 409) {
      return { success: true, rewardedAmount: 0, alreadyClaimed: true };
    }
  } catch {}

  return claimReportBounty(problemSlug, problemTitle, issueType, email);
}

/**
 * Submits a new UPI recharge top-up request to Database.
 */
export function submitTopupRequest(payload: {
  amount: number;
  transactionId: string;
  payeeDetails: string;
  screenshotUrl?: string;
  userEmail?: string;
  userName?: string;
}): TopupRequest {
  const userEmail = getActiveEmail(payload.userEmail);
  const requests = getAllTopupRequests();

  const newReq: TopupRequest = {
    id: `topup-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId: `usr-${Date.now()}`,
    userEmail,
    userName: payload.userName || userEmail.split('@')[0],
    amount: payload.amount,
    upiId: UPI_CONFIG.PAYEE_UPI_ID,
    transactionId: payload.transactionId.trim(),
    payeeDetails: payload.payeeDetails.trim(),
    screenshotUrl: payload.screenshotUrl,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  requests.unshift(newReq);
  saveTopupRequests(requests);

  // Sync to backend SQLite database
  fetch(`${BACKEND_URL}/api/billing/topup-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail,
      user_name: payload.userName || userEmail.split('@')[0],
      amount: payload.amount,
      transaction_id: payload.transactionId.trim(),
      payee_details: payload.payeeDetails.trim(),
      screenshot_url: payload.screenshotUrl
    })
  }).then(async (res) => {
    if (res.ok) {
      const data = await res.json();
      if (data.topup?.id) {
        newReq.id = data.topup.id;
        saveTopupRequests(requests);
      }
    }
  }).catch((e) => console.warn('[Topup DB Submit Notice]:', e));

  return newReq;
}

/**
 * Fetches all topup requests from Database for user or admin.
 */
export async function fetchTopupsFromDatabase(email?: string): Promise<TopupRequest[]> {
  try {
    const url = email 
      ? `${BACKEND_URL}/api/billing/topups?email=${encodeURIComponent(email)}`
      : `${BACKEND_URL}/api/billing/topups`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.topups)) {
        saveTopupRequests(data.topups);
        return data.topups;
      }
    }
  } catch (e) {
    console.warn('[Fetch Topups DB Notice]:', e);
  }
  return getAllTopupRequests();
}

/**
 * Fetches all transaction records from Database.
 */
export async function fetchTransactionsFromDatabase(email?: string): Promise<BillingTransaction[]> {
  try {
    const url = email 
      ? `${BACKEND_URL}/api/billing/transactions?email=${encodeURIComponent(email)}`
      : `${BACKEND_URL}/api/billing/transactions`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.transactions)) {
        saveTransactions(data.transactions);
        return data.transactions;
      }
    }
  } catch (e) {
    console.warn('[Fetch Transactions DB Notice]:', e);
  }
  return getAllTransactions();
}

/**
 * Approves a top-up request in Database (Admin function).
 */
export function approveTopupRequest(requestId: string, adminEmail?: string): boolean {
  const requests = getAllTopupRequests();
  const req = requests.find(r => r.id === requestId);
  if (!req || req.status !== 'PENDING') return false;

  req.status = 'APPROVED';
  req.reviewedAt = new Date().toISOString();
  req.adminNotes = `Approved by ${adminEmail || 'Super Admin'}`;
  saveTopupRequests(requests);

  // Credit user's wallet
  adminAddCredits(req.userEmail, req.amount, `UPI Recharge Approved (Txn ID: ${req.transactionId})`);

  // Sync to database
  fetch(`${BACKEND_URL}/api/billing/admin/review-topup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request_id: requestId,
      status: 'APPROVED',
      admin_email: adminEmail,
      admin_notes: `Approved by ${adminEmail || 'Super Admin'}`
    })
  }).catch((e) => console.warn('[Approve Topup DB Notice]:', e));

  return true;
}

/**
 * Rejects a top-up request in Database (Admin function).
 */
export function rejectTopupRequest(requestId: string, reason?: string): boolean {
  const requests = getAllTopupRequests();
  const req = requests.find(r => r.id === requestId);
  if (!req || req.status !== 'PENDING') return false;

  req.status = 'REJECTED';
  req.reviewedAt = new Date().toISOString();
  req.adminNotes = reason || 'Payment verification rejected';
  saveTopupRequests(requests);

  // Sync to database
  fetch(`${BACKEND_URL}/api/billing/admin/review-topup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request_id: requestId,
      status: 'REJECTED',
      admin_notes: reason || 'Payment verification rejected'
    })
  }).catch((e) => console.warn('[Reject Topup DB Notice]:', e));

  return true;
}

/**
 * Fetches all wallets, topups, and transactions from backend Database for Admin Dashboard.
 */
export async function fetchAdminBillingData(): Promise<{
  wallets: UserWallet[];
  topups: TopupRequest[];
  transactions: BillingTransaction[];
}> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/billing/admin/all-data`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.wallets)) {
        const walletsMap: Record<string, UserWallet> = {};
        for (const w of data.wallets) {
          walletsMap[w.userEmail] = w;
        }
        saveAllWallets(walletsMap);
      }
      if (Array.isArray(data.topups)) {
        saveTopupRequests(data.topups);
      }
      if (Array.isArray(data.transactions)) {
        saveTransactions(data.transactions);
      }
      return {
        wallets: data.wallets || [],
        topups: data.topups || [],
        transactions: data.transactions || []
      };
    }
  } catch (e) {
    console.warn('[Admin Billing DB Fetch Notice]:', e);
  }
  return {
    wallets: Object.values(getAllWallets()),
    topups: getAllTopupRequests(),
    transactions: getAllTransactions()
  };
}

/**
 * Generates dynamic UPI Deep Link URI.
 */
export function generateUpiPaymentUrl(amount: number): string {
  const pa = encodeURIComponent(UPI_CONFIG.PAYEE_UPI_ID);
  const pn = encodeURIComponent(UPI_CONFIG.PAYEE_NAME);
  const am = amount.toFixed(2);
  const tn = encodeURIComponent(`SDETube Recharge Rs ${amount}`);
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
}

/**
 * Executes atomic server-side wallet credit deduction via Supabase RPC with pessimistic locking.
 */
export async function deductCreditsAtomic(
  userId: string,
  amount: number,
  actionType: BillingActionType | string,
  description: string,
  idempotencyKey?: string
): Promise<{ success: boolean; balance?: number; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin.rpc('deduct_wallet_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_action_type: actionType,
      p_description: description,
      p_idempotency_key: idempotencyKey || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    });

    if (error) {
      console.warn('[Supabase deduct_wallet_credits RPC Error]:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.success !== true) {
      return { success: false, error: data?.error || 'Payment failed', balance: data?.balance };
    }

    return { success: true, balance: data.balance };
  } catch (err: any) {
    console.warn('[Supabase RPC Exception]:', err);
    return { success: false, error: String(err?.message || err) };
  }
}
