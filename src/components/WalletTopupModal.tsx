import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  QrCode, 
  Check, 
  Copy, 
  Upload, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { 
  getUserWallet, 
  getAllTransactions, 
  getAllTopupRequests, 
  submitTopupRequest, 
  generateUpiPaymentUrl, 
  syncWalletWithDatabase,
  fetchTransactionsFromDatabase,
  fetchTopupsFromDatabase,
  UPI_CONFIG, 
  PRICING_CONFIG, 
  UserWallet, 
  BillingTransaction, 
  TopupRequest 
} from '../lib/billing';

interface WalletTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  initialAmount?: number;
}

export const WalletTopupModal: React.FC<WalletTopupModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  initialAmount = 100
}) => {
  const [wallet, setWallet] = useState<UserWallet>(() => getUserWallet(userEmail));
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [userRequests, setUserRequests] = useState<TopupRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'recharge' | 'history' | 'pricing'>('recharge');

  // Recharge Form State
  const [amount, setAmount] = useState<number>(initialAmount);
  const [customAmountStr, setCustomAmountStr] = useState<string>(initialAmount.toString());
  const [transactionId, setTransactionId] = useState('');
  const [payeeDetails, setPayeeDetails] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const quickAmounts = [20, 50, 100, 200, 500, 1000];

  const refreshData = async (fetchFromDb: boolean = true) => {
    const w = getUserWallet(userEmail);
    setWallet(w);
    const targetEmail = (userEmail || w.userEmail).toLowerCase();
    setTransactions(getAllTransactions().filter(t => t.userEmail.toLowerCase() === targetEmail));
    setUserRequests(getAllTopupRequests().filter(r => r.userEmail.toLowerCase() === targetEmail));

    if (!fetchFromDb) return;

    // Live sync with database (only on explicit user modal open or refresh)
    try {
      const syncedW = await syncWalletWithDatabase(userEmail);
      setWallet(syncedW);
      const [tx, reqs] = await Promise.all([
        fetchTransactionsFromDatabase(targetEmail),
        fetchTopupsFromDatabase(targetEmail)
      ]);
      setTransactions(tx.filter(t => t.userEmail.toLowerCase() === targetEmail));
      setUserRequests(reqs.filter(r => r.userEmail.toLowerCase() === targetEmail));
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      refreshData(true);
      setSubmittedSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen, userEmail]);

  useEffect(() => {
    // Only update local state synchronously when wallet updates; NEVER trigger DB sync loop
    const handleWalletUpdated = () => refreshData(false);
    window.addEventListener('sdetube_wallet_updated', handleWalletUpdated);
    return () => window.removeEventListener('sdetube_wallet_updated', handleWalletUpdated);
  }, [userEmail]);

  if (!isOpen) return null;

  const upiPaymentUri = generateUpiPaymentUrl(amount);
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPaymentUri)}&bgcolor=020617&color=c084fc&margin=10`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_CONFIG.PAYEE_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage('Screenshot image must be under 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setErrorMessage('Please enter the 12-digit UPI Reference / UTR / Transaction No.');
      return;
    }
    if (!payeeDetails.trim()) {
      setErrorMessage('Please enter your Payee Name, Phone, or UPI ID.');
      return;
    }
    if (amount <= 0) {
      setErrorMessage('Recharge amount must be at least ₹1.00');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      submitTopupRequest({
        amount,
        transactionId: transactionId.trim(),
        payeeDetails: payeeDetails.trim(),
        screenshotUrl: screenshotBase64 || undefined,
        userEmail: wallet.userEmail
      });

      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setTransactionId('');
      setPayeeDetails('');
      setScreenshotBase64(null);
      refreshData();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to submit topup request. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-950 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with Live Wallet Balance */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-300">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-950 border border-purple-700/60 text-purple-300 font-bold">
                  SDETube Wallet
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">Billing & Credits Management</h3>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Balance Pill */}
            <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900 border border-purple-500/40 shadow-inner flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Balance:</span>
              <span className="text-base font-black font-mono text-emerald-400">₹{wallet.balance.toFixed(2)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 pt-2">
          <button
            onClick={() => setActiveTab('recharge')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'recharge'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>UPI Top-up & Recharge</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Transactions & Requests ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pricing'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pricing Card</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* TAB 1: RECHARGE FORM */}
          {activeTab === 'recharge' && (
            <div className="space-y-6">
              
              {submittedSuccess ? (
                <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3 animate-scaleUp">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-100">Top-up Request Submitted!</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Your recharge request for <strong className="text-emerald-400 font-mono">₹{amount.toFixed(2)}</strong> has been logged. Admin will review the transaction details and credit your wallet shortly!
                  </p>
                  <button
                    onClick={() => setSubmittedSuccess(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md"
                  >
                    Submit Another Top-up
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Column: QR Code & Payee Details */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 text-center">
                    <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-purple-400" />
                      <span>Scan to Pay via Any UPI App</span>
                    </div>

                    {/* QR Code Container */}
                    <div className="p-2.5 rounded-2xl bg-slate-950 border border-purple-500/40 shadow-2xl">
                      <img
                        src={qrCodeImageUrl}
                        alt="UPI Payment QR Code"
                        className="w-44 h-44 rounded-xl object-contain mx-auto"
                      />
                    </div>

                    {/* Payee Info & Copy UPI ID */}
                    <div className="w-full space-y-1.5 text-xs text-left bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Payee Name:</span>
                        <strong className="text-slate-200 uppercase">{UPI_CONFIG.PAYEE_NAME}</strong>
                      </div>
                      
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span>UPI ID:</span>
                        <div className="flex items-center gap-1">
                          <code className="text-purple-300 font-mono font-bold text-[10px]">{UPI_CONFIG.PAYEE_UPI_ID}</code>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span>Amount:</span>
                        <strong className="text-emerald-400 font-mono font-bold">₹{amount.toFixed(2)}</strong>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500">Supported: GPay, PhonePe, Paytm, BHIM & All Banks</p>
                  </div>

                  {/* Right Column: Top-up Proof Form */}
                  <form onSubmit={handleSubmitRecharge} className="md:col-span-7 space-y-4">
                    
                    {/* Amount Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Select Top-up Amount (₹)
                      </label>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {quickAmounts.map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setAmount(amt);
                              setCustomAmountStr(amt.toString());
                            }}
                            className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                              amount === amt 
                                ? 'bg-purple-600 text-white border-purple-400 shadow-md' 
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={customAmountStr}
                        onChange={(e) => {
                          setCustomAmountStr(e.target.value);
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > 0) setAmount(val);
                        }}
                        placeholder="Or enter custom amount in ₹"
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>

                    {/* Transaction / UTR Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        UPI Reference / UTR / Transaction No. <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. 423987129034 (12-digit UTR)"
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>

                    {/* Payee Details */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Your Payee Name / Phone / UPI ID <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={payeeDetails}
                        onChange={(e) => setPayeeDetails(e.target.value)}
                        placeholder="e.g. John Doe / 9876543210 / john@okaxis"
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Optional Screenshot */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Payment Screenshot / Receipt <span className="text-slate-500 text-[10px]">(Optional)</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-purple-300 hover:file:bg-slate-700 cursor-pointer"
                      />
                      {screenshotBase64 && (
                        <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-purple-500/40">
                          <img src={screenshotBase64} alt="Proof" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {errorMessage && (
                      <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSubmitting ? 'Submitting Verification...' : `Submit ₹${amount.toFixed(2)} Top-up Request`}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRANSACTIONS & TOPUP REQUESTS */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              
              {/* User's Top-up Requests */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending & Processed Top-up Requests</span>
                </h4>

                {userRequests.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-500">
                    No top-up requests recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userRequests.map((req) => (
                      <div key={req.id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-400">₹{req.amount.toFixed(2)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60' :
                              req.status === 'PENDING' ? 'bg-amber-950 text-amber-300 border border-amber-700/60' :
                              'bg-rose-950 text-rose-400 border border-rose-700/60'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">UTR: {req.transactionId}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transactions Ledger */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Wallet Deductions & Activity Ledger</span>
                </h4>

                {transactions.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-500">
                    No transactions recorded yet.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {transactions.slice(0, 30).map((tx) => (
                      <div key={tx.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs hover:bg-slate-900 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg ${tx.amount > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                            {tx.amount > 0 ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-200 truncate max-w-sm">{tx.description}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{new Date(tx.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <span className={`font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {tx.amount > 0 ? `+₹${tx.amount.toFixed(3)}` : `-₹${Math.abs(tx.amount).toFixed(3)}`}
                          </span>
                          <p className="text-[10px] text-slate-500 font-mono">Bal: ₹{tx.balanceAfter.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: TRANSPARENT PRICING CARD */}
          {activeTab === 'pricing' && (
            <div className="space-y-3 font-sans">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">Platform Service Rates</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">🎁 New Account Signup Bonus</span>
                  <strong className="text-emerald-400 font-mono">+₹10.00 Free</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">📅 Daily Usage Charge</span>
                  <strong className="text-slate-200 font-mono">₹1.00 / day</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">📺 First-time Video Access (24h Pass)</span>
                  <strong className="text-slate-200 font-mono">₹2.00 (Free for 24h)</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">📺 Video Re-watch (24h Pass)</span>
                  <strong className="text-slate-200 font-mono">₹1.00 (Free for 24h)</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">🤖 AI Teaching Assistant Chat</span>
                  <strong className="text-slate-200 font-mono">20 Paise (₹0.20) / response</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">🔍 DSA AI Code Review & Feedback</span>
                  <strong className="text-slate-200 font-mono">50 Paise (₹0.50)</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">💡 AI Optimal Solution Generator</span>
                  <strong className="text-slate-200 font-mono">50 Paise (₹0.50)</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">📝 AI Quiz Generation Batch</span>
                  <strong className="text-slate-200 font-mono">50 Paise (₹0.50)</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">🏛️ HLD AI Architecture Review</span>
                  <strong className="text-slate-200 font-mono">₹1.00</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">🧩 LLD AI OOP Evaluation</span>
                  <strong className="text-slate-200 font-mono">₹0.75 (75 Paise)</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">⚡ DSA / LLD Compiler Run</span>
                  <strong className="text-slate-200 font-mono">5 Paise (₹0.05)</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">🎯 DSA / LLD Test Submission</span>
                  <strong className="text-slate-200 font-mono">50 Paise (₹0.50)</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">🗄️ SQL Judge Query Run</span>
                  <strong className="text-slate-200 font-mono">10 Paise (₹0.10)</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">🎨 Excalidraw Whiteboarding</span>
                  <strong className="text-emerald-400 font-mono">100% Free</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">🏗️ Architecture Studio Node Drag</span>
                  <strong className="text-slate-200 font-mono">50 Paise (₹0.50)</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">📊 Analytics AI Report Refresh</span>
                  <strong className="text-slate-200 font-mono">₹1.00</strong>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
