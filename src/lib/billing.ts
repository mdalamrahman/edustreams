/**
 * SDETube Comprehensive Billing & Credits System
 * Synchronized with Database (SQLite backend on Render + client fallback cache)
 * Manages user wallet balances, pricing rules, transactions, UPI top-up requests,
 * daily platform usage fees, and insufficient balance gatekeeping.
 */

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://edustream-backend-90vm.onrender.com';

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
  COMPILER_RUN_DSA_LLD: 0.05,        // 5 paise (₹0.05) per compiler run
  CODE_SUBMIT_DSA_LLD: 0.20,         // 20 paise (₹0.20) per submission / judge
  SQL_RUN_JUDGE: 0.10,               // 10 paise (₹0.10) per SQL run
  LLD_DIAGRAM_VIEW: 0.20,            // 20 paise (₹0.20) per Kroki LLD architecture diagram render
  HLD_EXCALIDRAW_DRAWING: 0.00,      // Free on Excalidraw
  HLD_STUDIO_PLATFORM_DRAWING: 0.50, // 50 paise (₹0.50) if our Architecture Studio platform is used
  ANALYTICS_AI_REFRESH: 1.00,        // ₹1 for analytics AI diagnostic refresh
};

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
  | 'LLD_DIAGRAM'
  | 'COMPILER_RUN'
  | 'CODE_SUBMIT'
  | 'SQL_RUN'
  | 'HLD_STUDIO_DRAW'
  | 'ANALYTICS_REFRESH'
  | 'UPI_TOPUP'
  | 'ADMIN_MANUAL_GRANT';

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
  studioUsedToday?: string; // Date studio usage was charged
  createdAt: string;
  updatedAt: string;
}

const WALLETS_STORAGE_KEY = 'sdetube_billing_wallets';
const TRANSACTIONS_STORAGE_KEY = 'sdetube_billing_transactions';
const TOPUPS_STORAGE_KEY = 'sdetube_billing_topups';

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

export function getAllTransactions(): BillingTransaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTransactions(list: BillingTransaction[]) {
  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(list.slice(0, 500)));
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
  } catch {}
}

/**
 * Synchronizes user wallet directly with persistent Database.
 */
export async function syncWalletWithDatabase(email?: string): Promise<UserWallet> {
  const userEmail = getActiveEmail(email);
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
          studioUsedToday: data.wallet.studioUsedToday,
          createdAt: data.wallet.createdAt,
          updatedAt: data.wallet.updatedAt,
        };
        const wallets = getAllWallets();
        wallets[userEmail] = wallet;
        saveAllWallets(wallets);
        emitWalletUpdate(wallet);
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

    // Sync with backend database asynchronously
    syncWalletWithDatabase(userEmail).catch(() => {});
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
  saveTransactions(allTx);
  emitWalletUpdate(wallet);

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
 * Handles video view billing: ₹2.00 for first time opening a video, ₹1.00 for subsequent times.
 * Syncs viewed history & balance with database.
 */
export function handleVideoViewBilling(
  videoId: string, 
  videoTitle: string, 
  email?: string
): { success: boolean; newBalance: number; cost: number; error?: string } {
  const userEmail = getActiveEmail(email);
  const wallets = getAllWallets();
  const wallet = getUserWallet(userEmail);

  const isFirstTime = !wallet.viewedVideoIds.includes(videoId);
  const cost = isFirstTime ? PRICING_CONFIG.VIDEO_FIRST_TIME : PRICING_CONFIG.VIDEO_SUBSEQUENT;

  if (wallet.balance < cost) {
    return {
      success: false,
      newBalance: wallet.balance,
      cost,
      error: `INSUFFICIENT_CREDITS: Opening this video requires ₹${cost.toFixed(2)}. Your current balance is ₹${wallet.balance.toFixed(2)}.`
    };
  }

  // Optimistic update
  wallet.balance = parseFloat((wallet.balance - cost).toFixed(4));
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
    description: `📺 ${isFirstTime ? 'First-time Video Access' : 'Video Re-watch'}: ${videoTitle.slice(0, 40)}`,
    balanceAfter: wallet.balance,
    timestamp: new Date().toISOString()
  };

  const allTx = getAllTransactions();
  allTx.unshift(tx);
  saveTransactions(allTx);
  emitWalletUpdate(wallet);

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
    cost
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
  saveTransactions(allTx);
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
