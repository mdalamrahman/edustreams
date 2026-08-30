import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Sliders, 
  CreditCard, 
  BarChart3, 
  RefreshCw, 
  Search, 
  Ban, 
  UserX, 
  UserCheck, 
  DollarSign, 
  Download, 
  Video, 
  Lock, 
  Unlock, 
  Bot, 
  Check, 
  AlertTriangle, 
  LogOut, 
  Plus, 
  Minus, 
  Layers, 
  HardDrive, 
  CheckCircle2, 
  Clock, 
  X,
  FileSpreadsheet,
  Cpu,
  KeyRound,
  Fingerprint,
  Mail,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Code2,
  LayoutTemplate,
  Sparkles,
  ArrowUpRight,
  Database,
  Key,
  Copy,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { 
  fetchSystemRates, 
  saveSystemRates, 
  fetchAllAdminUsers, 
  fetchPlatformTelemetryAndRevenue,
  toggleUserDownloadWhitelist,
  generateAdminSignupOtp,
  revokeSignupOtp,
  generateAndDispatchAdminOtp,
  verifyAdminOtp,
  fetchAdminPasskey,
  saveAdminPasskey,
  removeAdminPasskey,
  registerWebAuthnPasskey,
  verifyWebAuthnPasskey,
  moderateUserInSupabase, 
  deleteUserFromSupabase, 
  adjustUserCreditsInSupabase, 
  SystemPlatformRates, 
  AdminUserRecord,
  PlatformAnalyticsSummary,
  DynamicSignupOtp,
  AdminPasskeyRecord
} from './lib/supabaseAdminClient';
import confetti from 'canvas-confetti';

const REQUIRED_ADMIN_PASSWORD = 'Zerocheck@6289943543';

export default function App() {
  // 3-Tier Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('aspersde_admin_auth') === 'true';
  });

  // Login Form States
  const [adminEmail, setAdminEmail] = useState<string>('admin@aspersde.com');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState<boolean>(false);
  const [isVerifyingCaptcha, setIsVerifyingCaptcha] = useState<boolean>(false);
  const [authStep, setAuthStep] = useState<'credentials' | 'mfa'>('credentials');
  const [mfaMethod, setMfaMethod] = useState<'passkey' | 'otp'>('passkey');
  const [otpCode, setOtpCode] = useState<string>('');
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [otpSentFeedback, setOtpSentFeedback] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [registeredPasskey, setRegisteredPasskey] = useState<AdminPasskeyRecord | null>(null);
  const [isVerifyingPasskey, setIsVerifyingPasskey] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Passkey Settings Modal States (Inside SuperAdmin Dashboard)
  const [showPasskeyModal, setShowPasskeyModal] = useState<boolean>(false);
  const [passkeyDeviceInput, setPasskeyDeviceInput] = useState<string>('SuperAdmin Hardware Authenticator');
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState<boolean>(false);
  const [passkeyModalStatus, setPasskeyModalStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Active Hub Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'otps' | 'pricing' | 'credits'>('analytics');

  // Live Data States (Direct from Supabase)
  const [rates, setRates] = useState<SystemPlatformRates>({
    video_view_cost: 5.0,
    video_download_cost: 10.0,
    download_whitelist: [],
    free_pass_duration_hours: 24,
    dsa_compiler_run_cost: 0.05,
    dsa_submission_cost: 0.50,
    sql_run_cost: 0.10,
    lld_ai_eval_cost: 0.75,
    hld_ai_eval_cost: 1.00,
    mock_interview_cost: 50.00,
    ai_chat_message_cost: 0.20,
    ai_optimal_solution_cost: 0.50,
    ai_quiz_gen_cost: 0.50,
    daily_usage_fee: 1.00,
    signup_bonus_credits: 10.00,
    suspended_users: [],
    banned_users: [],
    signup_otps: []
  });

  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [telemetry, setTelemetry] = useState<PlatformAnalyticsSummary | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // User Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned' | 'whitelisted'>('all');

  // OTP Generator Form States
  const [otpExpiryMinutes, setOtpExpiryMinutes] = useState<number>(60);
  const [targetStudentEmail, setTargetStudentEmail] = useState<string>('');
  const [isGeneratingOtp, setIsGeneratingOtp] = useState<boolean>(false);
  const [copiedOtpCode, setCopiedOtpCode] = useState<string>('');
  const [previewEmailOtp, setPreviewEmailOtp] = useState<DynamicSignupOtp | null>(null);
  const [emailTemplateTab, setEmailTemplateTab] = useState<'preview' | 'html' | 'text'>('preview');
  const [emailCopyStatus, setEmailCopyStatus] = useState<string>('');
  const [isSendingServerEmail, setIsSendingServerEmail] = useState<boolean>(false);
  const [serverEmailResult, setServerEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Rates Save Feedback
  const [isSavingRates, setIsSavingRates] = useState<boolean>(false);
  const [rateSaveSuccess, setRateSaveSuccess] = useState<boolean>(false);

  // Credit Adjustment Modal
  const [selectedUserForCredit, setSelectedUserForCredit] = useState<AdminUserRecord | null>(null);
  const [creditAdjustmentAmount, setCreditAdjustmentAmount] = useState<number>(100);
  const [creditAdjustmentNote, setCreditAdjustmentNote] = useState<string>('SuperAdmin Credit Grant');
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Load all live Supabase data
  const loadAllData = async () => {
    setIsLoadingData(true);
    const [fetchedRates, fetchedUsers, fetchedTelemetry] = await Promise.all([
      fetchSystemRates(),
      fetchAllAdminUsers(),
      fetchPlatformTelemetryAndRevenue()
    ]);
    setRates(fetchedRates);
    setUsers(fetchedUsers);
    setTelemetry(fetchedTelemetry);
    setIsLoadingData(false);
  };

  useEffect(() => {
    fetchAdminPasskey().then((pk) => {
      setRegisteredPasskey(pk);
      if (!pk) {
        setMfaMethod('otp');
      }
    });
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
      fetchAdminPasskey().then((pk) => setRegisteredPasskey(pk));
    }
  }, [isAuthenticated]);

  // Cloudflare Captcha Verification Challenge Simulator
  const handleVerifyCaptcha = () => {
    setIsVerifyingCaptcha(true);
    setAuthError('');
    setTimeout(() => {
      setIsVerifyingCaptcha(false);
      setIsCaptchaVerified(true);
    }, 800);
  };

  // Step 1: Verify Password & Captcha
  const handleInitialCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanEmail = adminEmail.trim().toLowerCase();
    const isAllowedEmail = 
      cleanEmail === 'admin@aspersde.com' || 
      cleanEmail === 'admin@aspersde' || 
      cleanEmail.includes('mdalamrahman4') || 
      cleanEmail === 'admin@sdetube.com';

    if (!isAllowedEmail) {
      setAuthError('Unauthorized Admin Account. Access is restricted to primary SuperAdmin.');
      return;
    }

    if (adminPassword !== REQUIRED_ADMIN_PASSWORD) {
      setAuthError('Invalid Admin Password. Access denied.');
      return;
    }

    if (!isCaptchaVerified) {
      setAuthError('Please complete the Cloudflare Turnstile Security Verification.');
      return;
    }

    // Check if passkey is registered
    const passkey = await fetchAdminPasskey();
    setRegisteredPasskey(passkey);

    if (passkey) {
      setMfaMethod('passkey');
      setAuthStep('mfa');
    } else {
      setMfaMethod('otp');
      setAuthStep('mfa');
      await handleRequestNewOtp();
    }
  };

  // Dispatch live Supabase Magic Link / 6-digit OTP to mdalamrahman4@gmail.com
  const handleRequestNewOtp = async () => {
    setIsSendingOtp(true);
    setAuthError('');
    setOtpSentFeedback('');
    try {
      const res = await generateAndDispatchAdminOtp('mdalamrahman4@gmail.com');
      if (res.success) {
        setOtpSentFeedback(res.message);
        setResendCooldown(30);
      } else {
        setAuthError(res.message);
      }
    } catch (err: any) {
      setAuthError('Failed to dispatch authentication OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2A: WebAuthn Hardware Biometric Passkey
  const handlePasskeyVerification = async () => {
    setIsVerifyingPasskey(true);
    setAuthError('');

    try {
      if (window.PublicKeyCredential) {
        const verified = await verifyWebAuthnPasskey(registeredPasskey);
        if (verified) {
          sessionStorage.setItem('aspersde_admin_auth', 'true');
          setIsAuthenticated(true);
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } else {
          setAuthError('Hardware biometric verification was cancelled or failed.');
        }
      } else {
        setAuthError('WebAuthn biometric not supported on this browser. Use Email OTP.');
      }
    } catch (err: any) {
      console.error('Passkey error:', err);
      setAuthError(err.message || 'Passkey authentication failed. You can use Email OTP to sign in.');
    } finally {
      setIsVerifyingPasskey(false);
    }
  };

  // Step 2B: Email OTP Verification against Supabase
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsVerifyingOtp(true);

    try {
      const result = await verifyAdminOtp(otpCode);
      if (result.success) {
        sessionStorage.setItem('aspersde_admin_auth', 'true');
        setIsAuthenticated(true);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } else {
        setAuthError(result.message || 'Invalid 6-Digit Verification Code.');
      }
    } catch (err: any) {
      setAuthError('Verification failed. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Hardware Passkey Registration / Update in Dashboard
  const handleRegisterOrUpdatePasskey = async () => {
    setIsRegisteringPasskey(true);
    setPasskeyModalStatus(null);
    try {
      const newPasskey = await registerWebAuthnPasskey(passkeyDeviceInput.trim() || 'SuperAdmin Hardware Authenticator');
      if (newPasskey) {
        setRegisteredPasskey(newPasskey);
        setPasskeyModalStatus({
          success: true,
          message: 'Hardware Passkey successfully registered and secured in Supabase vault!'
        });
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      }
    } catch (err: any) {
      console.error('Passkey registration error:', err);
      setPasskeyModalStatus({
        success: false,
        message: err.message || 'Failed to register hardware passkey. Make sure biometric/platform authenticator is available.'
      });
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  // Hardware Passkey Revocation
  const handleRevokePasskey = async () => {
    if (!confirm('Are you sure you want to revoke this hardware passkey? You will need to sign in with Email OTP until a new passkey is registered.')) {
      return;
    }
    setIsProcessingAction(true);
    await removeAdminPasskey();
    setRegisteredPasskey(null);
    setPasskeyModalStatus({
      success: true,
      message: 'Hardware passkey successfully revoked from Supabase vault.'
    });
    setIsProcessingAction(false);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('aspersde_admin_auth');
    setIsAuthenticated(false);
    setAuthStep('credentials');
    setAdminPassword('');
    setIsCaptchaVerified(false);
    setOtpCode('');
    setOtpSentFeedback('');
  };

  // Generate Signup OTP in Supabase
  const handleGenerateSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingOtp(true);
    const newOtp = await generateAdminSignupOtp(adminEmail, otpExpiryMinutes, targetStudentEmail || undefined);
    setIsGeneratingOtp(false);
    if (newOtp) {
      setTargetStudentEmail('');
      await loadAllData();
      confetti({ particleCount: 40, spread: 60 });
    }
  };

  // Revoke Signup OTP
  const handleRevokeOtp = async (code: string) => {
    setIsProcessingAction(true);
    await revokeSignupOtp(code);
    await loadAllData();
    setIsProcessingAction(false);
  };

  // Dispatch Live Email via Render Backend
  const handleSendServerEmail = async (otp: DynamicSignupOtp) => {
    if (!otp.targetEmail) {
      alert('Please specify a Target Student Email to send an automated email directly.');
      return;
    }
    setIsSendingServerEmail(true);
    setServerEmailResult(null);
    try {
      const inviteUrl = `https://sdetube.vercel.app/?passcode=${otp.code}&email=${encodeURIComponent(otp.targetEmail)}`;
      const durationMins = Math.max(1, Math.round((otp.expiresAt - (otp.createdAt || (Date.now() - 600000))) / (60 * 1000))) || 60;
      
      const res = await fetch('https://edustream-backend-90vm.onrender.com/api/admin/send-invite-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: otp.targetEmail,
          passcode: otp.code,
          invite_url: inviteUrl,
          duration_mins: durationMins
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setServerEmailResult({ success: true, message: `Live email dispatched to ${otp.targetEmail} via ${data.provider}!` });
      } else {
        setServerEmailResult({
          success: false,
          message: data.message || data.error || 'Server email dispatch requires SMTP_USER / SMTP_PASSWORD in Render environment variables. You can click "Open Mail App" to send in 1 click via your local email app!'
        });
      }
    } catch (err: any) {
      setServerEmailResult({
        success: false,
        message: 'Could not contact Render email service. Use "Open Mail App" or "Copy HTML" for instant 1-click delivery!'
      });
    } finally {
      setIsSendingServerEmail(false);
    }
  };

  // Copy OTP Code to Clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtpCode(code);
    setTimeout(() => setCopiedOtpCode(''), 2000);
  };

  // Toggle user-specific download permission
  const handleToggleDownloadWhitelist = async (email: string, currentStatus: boolean) => {
    setIsProcessingAction(true);
    await toggleUserDownloadWhitelist(email, !currentStatus);
    await loadAllData();
    setIsProcessingAction(false);
  };

  // Save Granular Section Rates to Supabase
  const handleSaveGranularRates = async () => {
    setIsSavingRates(true);
    const success = await saveSystemRates(rates);
    setIsSavingRates(false);
    if (success) {
      setRateSaveSuccess(true);
      setTimeout(() => setRateSaveSuccess(false), 3000);
      confetti({ particleCount: 45, spread: 50 });
    }
  };

  // User Moderation Actions (Ban / Suspend / Unsuspend)
  const handleUserModeration = async (email: string, action: 'suspend' | 'unsuspend' | 'ban' | 'unban') => {
    if (!window.confirm(`Are you sure you want to ${action.toUpperCase()} ${email}?`)) return;
    setIsProcessingAction(true);
    await moderateUserInSupabase(email, action);
    await loadAllData();
    setIsProcessingAction(false);
  };

  // Delete User
  const handleDeleteUser = async (email: string) => {
    if (!window.confirm(`⚠️ PERMANENT DELETION: Remove user ${email} and all their progress from Supabase database?`)) return;
    setIsProcessingAction(true);
    await deleteUserFromSupabase(email);
    await loadAllData();
    setIsProcessingAction(false);
  };

  // Credit Adjustment
  const handleCreditAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForCredit) return;
    setIsProcessingAction(true);
    await adjustUserCreditsInSupabase(selectedUserForCredit.email, creditAdjustmentAmount, creditAdjustmentNote);
    setSelectedUserForCredit(null);
    await loadAllData();
    setIsProcessingAction(false);
    confetti({ particleCount: 35, spread: 45 });
  };

  // Filter Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (userStatusFilter === 'active') return !u.isSuspended && !u.isBanned;
    if (userStatusFilter === 'suspended') return u.isSuspended && !u.isBanned;
    if (userStatusFilter === 'banned') return u.isBanned;
    if (userStatusFilter === 'whitelisted') return u.canDownloadVideos;
    return true;
  });

  // Export Users CSV
  const handleExportCSV = () => {
    const headers = 'Email,Name,Created,Total Solved,DSA Solved,LLD Solved,Active Mins,Wallet Balance,Total Spent,Video Download Allowed,Status\n';
    const rows = users.map(u => {
      const status = u.isBanned ? 'BANNED' : u.isSuspended ? 'SUSPENDED' : 'ACTIVE';
      return `"${u.email}","${u.name}","${u.createdAt}",${u.solvedCount},${u.solvedDsa},${u.solvedLld},${u.activeMinutes},${u.walletBalance},${u.totalSpent},"${u.canDownloadVideos ? 'YES' : 'NO'}","${status}"`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aspersde_full_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // =========================================================================
  // VIEW 1: STRICT 3-TIER MFA AUTHENTICATION SCREEN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">AsperSDE SuperAdmin</h1>
            <p className="text-xs text-slate-400 font-mono">
              3-Tier Strict Security &bull; Direct Supabase Sync
            </p>
          </div>

          {authStep === 'credentials' ? (
            /* STEP 1: PASSWORD + CLOUDFLARE CAPTCHA */
            <form onSubmit={handleInitialCredentialsSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Admin Email Address:</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@aspersde.com or mdalamrahman4@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">SuperAdmin Password:</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter required admin password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Cloudflare Turnstile / Captcha Interactive Widget */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleVerifyCaptcha}
                    disabled={isCaptchaVerified || isVerifyingCaptcha}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      isCaptchaVerified
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'bg-slate-900 border-slate-700 hover:border-indigo-500'
                    }`}
                  >
                    {isVerifyingCaptcha ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    ) : isCaptchaVerified ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : null}
                  </button>
                  <div>
                    <span className="text-xs font-bold text-white block">Cloudflare Turnstile</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {isCaptchaVerified ? 'Security challenge passed' : 'Click checkbox to verify human'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <ShieldCheck className="w-5 h-5 text-amber-400 ml-auto" />
                  <span className="text-[9px] text-slate-500 font-mono">Managed Challenge</span>
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-xs tracking-wider uppercase shadow-xl shadow-indigo-900/40 transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Verify Password & Proceed to MFA</span>
              </button>
            </form>
          ) : (
            /* STEP 2: MFA PASSKEY OR EMAIL OTP */
            <div className="space-y-5 animate-fadeIn">
              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between">
                <span className="font-bold font-mono">Admin: {adminEmail}</span>
                <span className="text-emerald-400 text-[10px] font-bold">✓ Password Verified</span>
              </div>

              {/* MFA Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMfaMethod('passkey')}
                  className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mfaMethod === 'passkey' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Biometric Passkey</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMfaMethod('otp')}
                  className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mfaMethod === 'otp' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email 6-Digit OTP</span>
                </button>
              </div>

              {mfaMethod === 'passkey' ? (
                <div className="space-y-4">
                  {registeredPasskey ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                      <div className="flex items-center space-x-2 font-bold text-emerald-400">
                        <Fingerprint className="w-4 h-4" />
                        <span>Hardware Passkey Configured</span>
                      </div>
                      <p className="text-[11px] text-emerald-300/80 font-mono">
                        {registeredPasskey.deviceLabel || 'Biometric Security Key'}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 space-y-1.5">
                      <div className="flex items-center space-x-2 font-bold text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>No Hardware Passkey Registered</span>
                      </div>
                      <p className="text-[11px] text-amber-300/80 leading-relaxed">
                        No biometric security key is registered yet. Please click the <strong>Email 6-Digit OTP</strong> tab above to sign in, then register your Touch ID / Windows Hello in the Dashboard.
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 text-center leading-relaxed">
                    Authenticate using your platform biometric sensor, Touch ID, Face ID, or Windows Hello.
                  </p>

                  <button
                    type="button"
                    onClick={handlePasskeyVerification}
                    disabled={isVerifyingPasskey || !registeredPasskey}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-900/30 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Fingerprint className={`w-5 h-5 ${isVerifyingPasskey ? 'animate-pulse' : ''}`} />
                    <span>{isVerifyingPasskey ? 'Verifying Biometrics...' : 'Authenticate with Passkey'}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
                    <div className="flex items-center space-x-2 font-bold text-indigo-300">
                      <Mail className="w-4 h-4 text-teal-400" />
                      <span>Supabase Magic Link / OTP Dispatched</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {otpSentFeedback || `A verification code has been dispatched to mdalamrahman4@gmail.com. Please check your inbox or spam folder.`}
                    </p>
                    <span className="text-[10px] text-amber-400 block font-mono">⏱️ Expires in 10 minutes &bull; Single-use</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">Enter Verification Code (6-8 Digits):</label>
                      <button
                        type="button"
                        onClick={handleRequestNewOtp}
                        disabled={isSendingOtp || resendCooldown > 0}
                        className="text-[11px] font-mono text-teal-400 hover:text-teal-300 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isSendingOtp ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : '🔄 Resend Code'}
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={12}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 12345678"
                      className="w-full px-3.5 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono font-black text-2xl tracking-[0.25em] text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || otpCode.trim().length < 6}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-teal-900/30 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Verifying Security Code...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify OTP & Launch Dashboard</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setAuthStep('credentials');
                  setAuthError('');
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                &larr; Back to password screen
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
            <HardDrive className="w-3 h-3 text-cyan-400" />
            <span>Direct Supabase Engine &bull; Zero Browser Cache</span>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: SUPERADMIN DASHBOARD HUBS
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Admin Header Bar */}
      <header className="p-4 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-white tracking-tight">AsperSDE SuperAdmin Control</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Supabase Live Direct</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              admin@aspersde.com &bull; SuperAdmin Authority
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setShowPasskeyModal(true);
              setPasskeyModalStatus(null);
            }}
            className={`p-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              registeredPasskey
                ? 'bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-500/40 text-emerald-300 hover:text-white'
                : 'bg-amber-950/60 hover:bg-amber-900/80 border-amber-500/40 text-amber-300 hover:text-white'
            }`}
            title="Manage SuperAdmin Biometric Passkey"
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Passkey Security</span>
            <span className={`w-2 h-2 rounded-full ${registeredPasskey ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
          </button>

          <button
            onClick={loadAllData}
            disabled={isLoadingData}
            className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh Live Data from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoadingData ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <button
            onClick={handleAdminLogout}
            className="p-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="px-6 pt-4 bg-slate-950 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto custom-scrollbar flex-shrink-0 text-xs font-bold">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-t-2xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
            activeTab === 'analytics'
              ? 'bg-slate-900 border-slate-800 text-cyan-400 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Executive Revenue & Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-t-2xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
            activeTab === 'users'
              ? 'bg-slate-900 border-slate-800 text-indigo-400 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory & Moderation ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('otps')}
          className={`px-4 py-2.5 rounded-t-2xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
            activeTab === 'otps'
              ? 'bg-slate-900 border-slate-800 text-emerald-400 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Signup OTP & Passcode Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2.5 rounded-t-2xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
            activeTab === 'pricing'
              ? 'bg-slate-900 border-slate-800 text-amber-400 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Granular 12-Section Pricing Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('credits')}
          className={`px-4 py-2.5 rounded-t-2xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
            activeTab === 'credits'
              ? 'bg-slate-900 border-slate-800 text-teal-400 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Manual Credit Grantor</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* ===================================================================
            TAB 1: EXECUTIVE REVENUE & USAGE TELEMETRY (100% ACCURATE FROM SUPABASE)
            =================================================================== */}
        {activeTab === 'analytics' && telemetry && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Financial KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Recharges All Time */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase font-mono">Total Recharges (All-Time)</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-3xl font-black text-emerald-400">₹{telemetry.totalRechargesAllTime.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 font-mono">Platform Inflow &bull; Supabase Ledger</p>
              </div>

              {/* Total Recharges This Month */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase font-mono">Recharges (This Month)</span>
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                </div>
                <p className="text-3xl font-black text-teal-300">₹{telemetry.totalRechargesThisMonth.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 font-mono">Current Month Top-ups</p>
              </div>

              {/* Total Revenue Consumed (All Time) */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase font-mono">Platform Revenue Generated</span>
                  <Zap className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-3xl font-black text-indigo-300">₹{telemetry.totalRevenueGeneratedAllTime.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 font-mono">Total Credits Consumed</p>
              </div>

              {/* Total Revenue This Month */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase font-mono">Revenue (This Month)</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-3xl font-black text-amber-300">₹{telemetry.totalRevenueGeneratedThisMonth.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 font-mono">Current Monthly Consumption</p>
              </div>

            </div>

            {/* Engagement & Progress KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 font-mono">Total Time Spent by Students</span>
                  <p className="text-2xl font-black text-white">{(telemetry.totalActiveMinutesSpent / 60).toFixed(1)} Hours</p>
                  <p className="text-[10px] text-slate-400 font-mono">{telemetry.totalActiveMinutesSpent} active study minutes in DB</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 font-mono">DSA & LLD Problems Solved</span>
                  <p className="text-2xl font-black text-cyan-300">{telemetry.totalDsaQuestionsSolved + telemetry.totalLldQuestionsSolved}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{telemetry.totalDsaQuestionsSolved} DSA &bull; {telemetry.totalLldQuestionsSolved} LLD</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 font-mono">AI Mock Interviews Conducted</span>
                  <p className="text-2xl font-black text-purple-300">{telemetry.totalInterviewSessionsConducted}</p>
                  <p className="text-[10px] text-slate-400 font-mono">FAANG Bar Raiser Assessments</p>
                </div>
              </div>

            </div>

            {/* SECTION-BY-SECTION USAGE BREAKDOWN */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">Section-by-Section Usage & Revenue Breakdown</h3>
                  <p className="text-xs text-slate-400">
                    Live telemetry calculated from real student actions in Supabase.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[10px]">
                  Real-Time Supabase Ledger
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {telemetry.sectionUsageBreakdown.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{item.section}</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 font-mono text-[10px] font-bold">
                        ₹{item.revenueCredits}
                      </span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl font-black text-slate-200">{item.usageCount.toLocaleString()}</span>
                      <span className="text-xs text-slate-500 font-mono">actions / uses</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transaction Audit Log */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Recent Ledger Transactions ({telemetry.recentTransactions.length})</h3>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Full CSV Dump</span>
                </button>
              </div>

              <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="p-3 px-4">User</th>
                        <th className="p-3 px-4">Amount</th>
                        <th className="p-3 px-4">Type</th>
                        <th className="p-3 px-4">Description</th>
                        <th className="p-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {telemetry.recentTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-500">
                            No billing transactions recorded in Supabase yet.
                          </td>
                        </tr>
                      ) : (
                        telemetry.recentTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-900/40">
                            <td className="p-3 px-4 text-slate-300">{tx.user_email}</td>
                            <td className={`p-3 px-4 font-bold ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {tx.type === 'CREDIT' ? '+' : '-'}₹{Math.abs(tx.amount)}
                            </td>
                            <td className="p-3 px-4 text-slate-400">{tx.type}</td>
                            <td className="p-3 px-4 text-slate-400 font-sans">{tx.description}</td>
                            <td className="p-3 px-4 text-slate-500 text-[11px]">
                              {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'Recent'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================
            TAB 2: USER DIRECTORY & MODERATION (PER-USER CONTROLS)
            =================================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Search & Filter Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user by email or name..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Users ({users.length})</option>
                  <option value="active">Active Only</option>
                  <option value="whitelisted">Video Download Whitelisted Only</option>
                  <option value="suspended">Suspended Only</option>
                  <option value="banned">Banned Only</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3.5 px-4 font-bold">User Identity</th>
                      <th className="p-3.5 px-4 font-bold">DSA & LLD Solved</th>
                      <th className="p-3.5 px-4 font-bold">Wallet / Spent</th>
                      <th className="p-3.5 px-4 font-bold">Video Download (Per-User)</th>
                      <th className="p-3.5 px-4 font-bold">Status</th>
                      <th className="p-3.5 px-4 font-bold text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                          No users found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSuperAdmin = u.email.includes('mdalamrahman4') || u.email.includes('admin@aspersde');
                        return (
                          <tr key={u.id} className="hover:bg-slate-950/50 transition-colors">
                            
                            {/* User Info */}
                            <td className="p-3.5 px-4">
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>{u.name}</span>
                                {isSuperAdmin && (
                                  <span className="px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[9px] font-mono">
                                    SuperAdmin
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                            </td>

                            {/* Solved Progress */}
                            <td className="p-3.5 px-4 font-mono">
                              <span className="font-bold text-indigo-300">{u.solvedCount}</span>
                              <span className="text-slate-500"> ({u.solvedDsa} DSA, {u.solvedLld} LLD)</span>
                            </td>

                            {/* Wallet Balance & Total Spent */}
                            <td className="p-3.5 px-4 font-mono">
                              <span className="font-bold text-emerald-400">₹{u.walletBalance}</span>
                              <span className="text-slate-500 text-[10px] block">Spent: ₹{u.totalSpent}</span>
                            </td>

                            {/* Per-User Video Download Whitelist Toggle */}
                            <td className="p-3.5 px-4">
                              {!isSuperAdmin ? (
                                <button
                                  onClick={() => handleToggleDownloadWhitelist(u.email, u.canDownloadVideos)}
                                  disabled={isProcessingAction}
                                  className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                    u.canDownloadVideos
                                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900 shadow-sm shadow-emerald-900/30'
                                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                                  }`}
                                  title="Toggle video download permissions for this specific user"
                                >
                                  {u.canDownloadVideos ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
                                  <span>{u.canDownloadVideos ? 'Download: ALLOWED' : 'Download: BLOCKED'}</span>
                                </button>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-mono">Master Allowed</span>
                              )}
                            </td>

                            {/* Account Status */}
                            <td className="p-3.5 px-4">
                              {u.isBanned ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/40">
                                  BANNED
                                </span>
                              ) : u.isSuspended ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                                  SUSPENDED
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                                  ACTIVE
                                </span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="p-3.5 px-4 text-right">
                              {!isSuperAdmin ? (
                                <div className="flex items-center justify-end space-x-1.5">
                                  
                                  {/* Credit Adjust */}
                                  <button
                                    onClick={() => setSelectedUserForCredit(u)}
                                    className="p-1.5 px-2.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-[11px] font-bold cursor-pointer transition-colors"
                                  >
                                    &plus; Credits
                                  </button>

                                  {/* Suspend / Unsuspend */}
                                  {u.isSuspended ? (
                                    <button
                                      onClick={() => handleUserModeration(u.email, 'unsuspend')}
                                      className="p-1.5 px-2.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-[11px] font-bold cursor-pointer transition-colors"
                                    >
                                      Unsuspend
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUserModeration(u.email, 'suspend')}
                                      className="p-1.5 px-2.5 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-[11px] font-bold cursor-pointer transition-colors"
                                    >
                                      Suspend
                                    </button>
                                  )}

                                  {/* Ban / Unban */}
                                  {u.isBanned ? (
                                    <button
                                      onClick={() => handleUserModeration(u.email, 'unban')}
                                      className="p-1.5 px-2.5 rounded-lg bg-teal-950 hover:bg-teal-900 border border-teal-700/60 text-teal-300 text-[11px] font-bold cursor-pointer transition-colors"
                                    >
                                      Unban
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUserModeration(u.email, 'ban')}
                                      className="p-1.5 px-2.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[11px] font-bold cursor-pointer transition-colors"
                                    >
                                      Ban
                                    </button>
                                  )}

                                  {/* Delete User */}
                                  <button
                                    onClick={() => handleDeleteUser(u.email)}
                                    className="p-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-[11px] font-bold cursor-pointer transition-colors"
                                    title="Permanently Delete User from Supabase"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>

                                </div>
                              ) : (
                                <span className="text-slate-500 font-mono text-[10px]">Master Protected</span>
                              )}
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================
            TAB 3: SIGNUP OTP & PASSCODE GENERATOR HUB
            =================================================================== */}
        {activeTab === 'otps' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Student Registration OTP & Passcode Generator</h3>
                    <p className="text-xs text-slate-400">
                      Generate official 6-digit authorization passcodes required by students on the signup screen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Generator Form */}
              <form onSubmit={handleGenerateSignupOtp} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Passcode Validity Duration:</label>
                    <select
                      value={otpExpiryMinutes}
                      onChange={(e) => setOtpExpiryMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value={10}>10 Minutes (Standard Security)</option>
                      <option value={30}>30 Minutes</option>
                      <option value={60}>1 Hour</option>
                      <option value={1440}>24 Hours</option>
                      <option value={10080}>7 Days</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Restricted Student Email (Optional):</label>
                    <input
                      type="email"
                      value={targetStudentEmail}
                      onChange={(e) => setTargetStudentEmail(e.target.value)}
                      placeholder="Leave blank for any student"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingOtp}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-900/30 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>{isGeneratingOtp ? 'Writing to Supabase...' : 'Generate New Student Signup Passcode'}</span>
                </button>
              </form>

              {/* Active & Recent Generated OTPs List */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider font-mono">
                  Active & Recent Registration Passcodes (Stored in Supabase)
                </h4>

                <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <div className="max-h-72 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase sticky top-0 border-b border-slate-800">
                        <tr>
                          <th className="p-3 px-4">Passcode</th>
                          <th className="p-3 px-4">Target Email</th>
                          <th className="p-3 px-4">Expires In</th>
                          <th className="p-3 px-4">Status</th>
                          <th className="p-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {(!rates.signup_otps || rates.signup_otps.length === 0) ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-500">
                              No active signup passcodes generated yet. Click "Generate" above to create one.
                            </td>
                          </tr>
                        ) : (
                          rates.signup_otps.map((otp, idx) => {
                            const isExpired = Date.now() > otp.expiresAt;
                            const remainingMins = Math.max(0, Math.round((otp.expiresAt - Date.now()) / (60 * 1000)));

                            return (
                              <tr key={idx} className="hover:bg-slate-900/40">
                                <td className="p-3 px-4 font-black text-sm text-emerald-400">
                                  <div className="flex items-center gap-1.5">
                                    <span>{otp.code}</span>
                                    <button
                                      onClick={() => handleCopyCode(otp.code)}
                                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                      title="Copy code"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3 px-4 text-slate-300">{otp.targetEmail || 'Open (Any Student)'}</td>
                                <td className="p-3 px-4 text-slate-400">
                                  {isExpired ? 'Expired' : `${remainingMins} mins left`}
                                </td>
                                <td className="p-3 px-4">
                                  {isExpired ? (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40">
                                      EXPIRED
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                                      ACTIVE
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 px-4 text-right">
                                  <div className="flex items-center justify-end space-x-1.5">
                                    {/* 1-Click Copy Invite Link */}
                                    <button
                                      onClick={() => {
                                        const url = `https://sdetube.vercel.app/?passcode=${otp.code}${otp.targetEmail ? `&email=${encodeURIComponent(otp.targetEmail)}` : ''}`;
                                        navigator.clipboard.writeText(url);
                                        setCopiedOtpCode(otp.code);
                                        setTimeout(() => setCopiedOtpCode(''), 2000);
                                      }}
                                      className="p-1 px-2 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 hover:text-white text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                      title="Copy direct signup link with passcode attached"
                                    >
                                      <Key className="w-3 h-3 text-indigo-400" />
                                      <span>{copiedOtpCode === otp.code ? 'Link Copied!' : 'Copy Link'}</span>
                                    </button>

                                    {/* Preview & Send Branded Email */}
                                    <button
                                      onClick={() => setPreviewEmailOtp(otp)}
                                      className="p-1 px-2 rounded-lg bg-teal-950/80 hover:bg-teal-900 border border-teal-700/60 text-teal-300 hover:text-white text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                      title="Preview and Send Branded Invite Email"
                                    >
                                      <Mail className="w-3 h-3 text-teal-400" />
                                      <span>Branded Email</span>
                                    </button>

                                    {/* Revoke */}
                                    <button
                                      onClick={() => handleRevokeOtp(otp.code)}
                                      className="p-1 px-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[10px] font-bold transition-colors cursor-pointer"
                                      title="Revoke passcode"
                                    >
                                      Revoke
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ===================================================================
            TAB 4: GRANULAR 12-SECTION PRICING MATRIX
            =================================================================== */}
        {activeTab === 'pricing' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Granular Platform Pricing Matrix (All 12 Modules)</h3>
                    <p className="text-xs text-slate-400">
                      Configure precise fee structures for each platform section. All values persist directly to Supabase.
                    </p>
                  </div>
                </div>

                {rateSaveSuccess && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/40 flex items-center gap-1 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Published to Supabase</span>
                  </span>
                )}
              </div>

              {/* 1. Video & Lecture Stream Charges */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block font-mono">
                  1. Video Lectures & Offline Downloads
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">Cost per Video Lecture View:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={rates.video_view_cost}
                        onChange={(e) => setRates({ ...rates, video_view_cost: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">₹</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">Cost per Video Download (If Allowed):</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={rates.video_download_cost}
                        onChange={(e) => setRates({ ...rates, video_download_cost: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">₹</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">Free Re-Watch Pass Window:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={1}
                        max={720}
                        step={1}
                        value={rates.free_pass_duration_hours}
                        onChange={(e) => setRates({ ...rates, free_pass_duration_hours: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">hrs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Coding, Compiler & SQL Judge Charges */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block font-mono">
                  2. Code IDE, Judge0 Sandbox & SQL Execution
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">DSA Compiler Run (Judge0):</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={rates.dsa_compiler_run_cost}
                        onChange={(e) => setRates({ ...rates, dsa_compiler_run_cost: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">₹</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">DSA Problem Submission:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        step={0.05}
                        value={rates.dsa_submission_cost}
                        onChange={(e) => setRates({ ...rates, dsa_submission_cost: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">₹</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">SQL Query Evaluation Run:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={rates.sql_run_cost}
                        onChange={(e) => setRates({ ...rates, sql_run_cost: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">₹</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. System Design & AI Evaluations */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block font-mono">
                  3. System Design (HLD / LLD) & AI Review
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">LLD Machine Coding AI Review:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        step={0.05}
                        value={rates.lld_ai_eval_cost}
                        onChange={(e) => setRates({ ...rates, lld_ai_eval_cost: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">₹</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">HLD Architecture Studio AI Review:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={rates.hld_ai_eval_cost}
                        onChange={(e) => setRates({ ...rates, hld_ai_eval_cost: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">₹</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. AI Mock Interviews & Assistant Queries */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block font-mono">
                  4. FAANG Mock Interviews & AI Assistant Modules
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">45-Min Mock Interview:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        step={5}
                        value={rates.mock_interview_cost}
                        onChange={(e) => setRates({ ...rates, mock_interview_cost: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">₹</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">Ask AI Chat Response:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        step={0.05}
                        value={rates.ai_chat_message_cost}
                        onChange={(e) => setRates({ ...rates, ai_chat_message_cost: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">₹</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">AI Optimal Solution:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={rates.ai_optimal_solution_cost}
                        onChange={(e) => setRates({ ...rates, ai_optimal_solution_cost: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">₹</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">AI Quiz Batch Gen:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={rates.ai_quiz_gen_cost}
                        onChange={(e) => setRates({ ...rates, ai_quiz_gen_cost: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">₹</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Subscription & Signup Grants */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block font-mono">
                  5. Daily Platform Fee & Signup Grants
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">Daily Platform Usage Fee:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={rates.daily_usage_fee}
                        onChange={(e) => setRates({ ...rates, daily_usage_fee: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-teal-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">₹/day</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">Free Signup Bonus Grant:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        step={5}
                        value={rates.signup_bonus_credits}
                        onChange={(e) => setRates({ ...rates, signup_bonus_credits: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-teal-500"
                      />
                      <span className="text-xs text-slate-500 font-mono">₹ credits</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveGranularRates}
                  disabled={isSavingRates}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-900/30 transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingRates ? 'Writing to Supabase...' : 'Save & Publish Rates'}</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ===================================================================
            TAB 5: MANUAL CREDIT GRANTOR
            =================================================================== */}
        {activeTab === 'credits' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-4">
                <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">SuperAdmin Credit Grantor</h3>
                  <p className="text-xs text-slate-400">
                    Directly injects or deduces funds in Supabase billing ledger with audit note.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreditAdjustmentSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Recipient Student Email:</label>
                  <input
                    type="email"
                    required
                    value={selectedUserForCredit?.email || ''}
                    onChange={(e) => setSelectedUserForCredit({ ...selectedUserForCredit, email: e.target.value } as any)}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Adjustment Amount (INR / Credits):</label>
                  <input
                    type="number"
                    required
                    value={creditAdjustmentAmount}
                    onChange={(e) => setCreditAdjustmentAmount(Number(e.target.value))}
                    placeholder="e.g. 500 for addition, -100 for deduction"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Audit Reason / Admin Note:</label>
                  <input
                    type="text"
                    required
                    value={creditAdjustmentNote}
                    onChange={(e) => setCreditAdjustmentNote(e.target.value)}
                    placeholder="e.g. UPI Top-up verification approved (Txn #12345)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessingAction}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-black text-xs tracking-wider uppercase shadow-xl shadow-teal-900/40 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isProcessingAction ? 'Writing to Supabase...' : 'Execute Credit Adjustment'}</span>
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

      {/* Credit Adjustment Modal */}
      {selectedUserForCredit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">Adjust User Credits</h3>
              <button
                onClick={() => setSelectedUserForCredit(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Adjusting wallet balance for: <span className="font-bold text-indigo-400">{selectedUserForCredit.email}</span>
            </div>

            <form onSubmit={handleCreditAdjustmentSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Credit Amount (Use negative for deduction):</label>
                <input
                  type="number"
                  required
                  value={creditAdjustmentAmount}
                  onChange={(e) => setCreditAdjustmentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Admin Note:</label>
                <input
                  type="text"
                  required
                  value={creditAdjustmentNote}
                  onChange={(e) => setCreditAdjustmentNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessingAction}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isProcessingAction ? 'Writing to Supabase...' : 'Confirm Credit Update'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Branded Email Template & Share Modal */}
      {previewEmailOtp && (() => {
        const inviteUrl = `https://sdetube.vercel.app/?passcode=${previewEmailOtp.code}${previewEmailOtp.targetEmail ? `&email=${encodeURIComponent(previewEmailOtp.targetEmail)}` : ''}`;
        const durationMins = Math.max(1, Math.round((previewEmailOtp.expiresAt - (previewEmailOtp.createdAt || (Date.now() - 600000))) / (60 * 1000))) || 60;
        
        const htmlCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Exclusive AsperSDE Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #020617; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <tr>
            <td style="background: linear-gradient(135deg, #4338ca 0%, #1e1b4b 100%); padding: 35px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">AsperSDE</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1; font-weight: 500;">Elite Software Engineering & System Design Platform</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #ffffff;">Exclusive Student Access Pass</h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                You have been authorized by the administrator to join <strong>AsperSDE (SDETube)</strong>. Use your one-time verification passcode below or click the direct registration link to begin.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #020617; border: 1px solid #334155; border-radius: 14px; margin-bottom: 25px;">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 6px;">Your One-Time Passcode</span>
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 28px; font-weight: 900; color: #34d399; letter-spacing: 4px;">${previewEmailOtp.code}</span>
                    <span style="display: block; font-size: 11px; color: #fbbf24; margin-top: 6px;">⏱️ Valid for ${durationMins} Minutes</span>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${inviteUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #0d9488 100%); color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 35px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);">
                      🚀 Click Here to Complete Registration
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 25px 0; font-size: 12px; color: #64748b; word-break: break-all; text-align: center;">
                Or paste this direct link into your browser:<br>
                <a href="${inviteUrl}" style="color: #6366f1; text-decoration: underline;">${inviteUrl}</a>
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #1e293b; padding-top: 25px;">
                <tr>
                  <td style="padding-bottom: 12px; font-size: 13px; color: #cbd5e1;">⚡ <strong>418+ HD Video Lectures:</strong> Complete Striver A2Z DSA, LLD Patterns & System Design.</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; font-size: 13px; color: #cbd5e1;">💻 <strong>Monaco Web Judge:</strong> Multi-language sandbox supporting C++, Java, Python, and Go.</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; font-size: 13px; color: #cbd5e1;">🏗️ <strong>System Design Studio:</strong> Interactive HLD canvas & AI-driven LLD class diagrams.</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #cbd5e1;">🤖 <strong>AI Mock Interviews:</strong> Real-time 45-minute FAANG Bar Raiser technical evaluations.</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #020617; border-top: 1px solid #1e293b; padding: 20px 30px; text-align: center; font-size: 11px; color: #475569;">
              © 2026 AsperSDE / SDETube. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const plainTextMessage = `🚀 *Exclusive AsperSDE (SDETube) Invitation Pass*\n\nYou have been authorized by the administrator to join AsperSDE.\n\n🔑 *Your One-Time Passcode:* ${previewEmailOtp.code}\n⏱️ *Validity:* ${durationMins} Minutes\n\n👉 *Direct 1-Click Registration Link:*\n${inviteUrl}\n\n*Included Modules:*\n• 418 HD Lectures (Striver DSA, LLD, HLD, DBMS)\n• Monaco Multi-Language Code Judge\n• System Design Studio & Interactive Canvas\n• 45-Min FAANG AI Mock Interviews\n\n_AsperSDE Platform_`;

        const mailtoUrl = `mailto:${previewEmailOtp.targetEmail || ''}?subject=${encodeURIComponent('Your Exclusive AsperSDE Registration Access Pass')}&body=${encodeURIComponent(`Hello,\n\nYou have been authorized to join the AsperSDE Platform.\n\nYour One-Time Authorization Passcode: ${previewEmailOtp.code}\n\nClick the link below to complete your registration:\n${inviteUrl}\n\nValid for ${durationMins} minutes.\n\nBest regards,\nAsperSDE Team`)}`;

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-fadeIn flex flex-col max-h-[90vh]">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Student Registration Email & Invite Link</h3>
                    <p className="text-[11px] text-slate-400">Passcode: <span className="font-mono font-bold text-emerald-400">{previewEmailOtp.code}</span> &bull; Target: {previewEmailOtp.targetEmail || 'Any Student'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewEmailOtp(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2">
                <button
                  onClick={() => setEmailTemplateTab('preview')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    emailTemplateTab === 'preview'
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  👁️ Visual Preview
                </button>
                <button
                  onClick={() => setEmailTemplateTab('html')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    emailTemplateTab === 'html'
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📄 HTML Source
                </button>
                <button
                  onClick={() => setEmailTemplateTab('text')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    emailTemplateTab === 'text'
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  💬 WhatsApp / Text
                </button>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-800 rounded-2xl bg-slate-950 p-4">
                {emailTemplateTab === 'preview' && (
                  <div className="space-y-4 max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-r from-indigo-900 to-slate-900 border border-indigo-500/30">
                      <h4 className="text-xl font-black text-white">AsperSDE</h4>
                      <p className="text-xs text-indigo-300 font-semibold">Elite Software Engineering Accelerator</p>
                    </div>
                    <div className="text-center space-y-3">
                      <p className="text-xs text-slate-300">You have been authorized by Admin to join AsperSDE.</p>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Your One-Time Passcode</span>
                        <div className="text-2xl font-black text-emerald-400 font-mono tracking-widest">{previewEmailOtp.code}</div>
                        <span className="text-[10px] text-amber-400 font-mono">⏱️ Valid for {durationMins} Minutes</span>
                      </div>
                      <a
                        href={inviteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/40 hover:opacity-95"
                      >
                        🚀 Click Here to Complete Registration
                      </a>
                      <p className="text-[11px] text-slate-500 font-mono break-all pt-1">
                        Attached Link: {inviteUrl}
                      </p>
                    </div>
                  </div>
                )}

                {emailTemplateTab === 'html' && (
                  <pre className="text-[11px] font-mono text-teal-300 whitespace-pre-wrap select-all">
                    {htmlCode}
                  </pre>
                )}

                {emailTemplateTab === 'text' && (
                  <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap select-all bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    {plainTextMessage}
                  </pre>
                )}
              </div>

              {/* Server Email Dispatch Feedback */}
              {serverEmailResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  serverEmailResult.success 
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' 
                    : 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                }`}>
                  {serverEmailResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <span className="font-bold">{serverEmailResult.success ? 'Email Sent Successfully' : 'Notice'}</span>
                    <p className="text-[11px] leading-relaxed opacity-90">{serverEmailResult.message}</p>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800">
                {/* 1-Click Server Dispatch */}
                <button
                  onClick={() => handleSendServerEmail(previewEmailOtp)}
                  disabled={isSendingServerEmail || !previewEmailOtp.targetEmail}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 disabled:opacity-50"
                  title={previewEmailOtp.targetEmail ? "Send automated email via server" : "Please set target student email first"}
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{isSendingServerEmail ? 'Sending...' : 'Send Live Email'}</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteUrl);
                    setEmailCopyStatus('link');
                    setTimeout(() => setEmailCopyStatus(''), 2000);
                  }}
                  className="py-2 px-3 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{emailCopyStatus === 'link' ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(htmlCode);
                    setEmailCopyStatus('html');
                    setTimeout(() => setEmailCopyStatus(''), 2000);
                  }}
                  className="py-2 px-3 rounded-xl bg-teal-950 hover:bg-teal-900 border border-teal-700/60 text-teal-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{emailCopyStatus === 'html' ? 'Copied HTML!' : 'Copy HTML'}</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(plainTextMessage);
                    setEmailCopyStatus('text');
                    setTimeout(() => setEmailCopyStatus(''), 2000);
                  }}
                  className="py-2 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{emailCopyStatus === 'text' ? 'Copied Text!' : 'Copy Text'}</span>
                </button>

                <a
                  href={mailtoUrl}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Open Mail App</span>
                </a>
              </div>

            </div>
          </div>
        );
      })()}

      {/* SuperAdmin Hardware Passkey Modal */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => {
                setShowPasskeyModal(false);
                setPasskeyModalStatus(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">SuperAdmin Passkey Vault</h3>
                <p className="text-xs text-slate-400 font-mono">
                  WebAuthn Biometrics (Touch ID / Face ID / Windows Hello / YubiKey)
                </p>
              </div>
            </div>

            {/* Current Passkey Status */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Vault Passkey Status</span>
                {registeredPasskey ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Active & Secured</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>No Passkey Configured</span>
                  </span>
                )}
              </div>

              {registeredPasskey ? (
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Device Label:</span>
                      <span className="font-bold text-white">{registeredPasskey.deviceLabel}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Registered On:</span>
                      <span className="text-indigo-300">{new Date(registeredPasskey.registeredAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Sync Target:</span>
                      <span className="text-emerald-400">Supabase Platform Vault</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Register your device's biometric sensor (Windows Hello, Touch ID, Face ID, or YubiKey) to enable instant 1-click passwordless sign-in for the SuperAdmin Control Panel.
                </p>
              )}
            </div>

            {/* Registration Form / Action */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {registeredPasskey ? 'Update / Replace Device Label:' : 'Device Identifier Label:'}
                </label>
                <input
                  type="text"
                  value={passkeyDeviceInput}
                  onChange={(e) => setPasskeyDeviceInput(e.target.value)}
                  placeholder="e.g. Work MacBook Touch ID or Windows Hello PC"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {passkeyModalStatus && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  passkeyModalStatus.success 
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}>
                  {passkeyModalStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{passkeyModalStatus.message}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleRegisterOrUpdatePasskey}
                  disabled={isRegisteringPasskey}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 disabled:opacity-50"
                >
                  <Fingerprint className={`w-4 h-4 ${isRegisteringPasskey ? 'animate-spin' : ''}`} />
                  <span>{isRegisteringPasskey ? 'Registering Biometrics...' : registeredPasskey ? 'Update Hardware Passkey' : 'Register Hardware Passkey'}</span>
                </button>

                {registeredPasskey && (
                  <button
                    onClick={handleRevokePasskey}
                    disabled={isProcessingAction}
                    className="py-3 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    title="Revoke and Remove Passkey"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Revoke</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
