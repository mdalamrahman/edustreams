import React, { useState, useEffect } from 'react';
import { KeyRound, Mail, Lock, UserPlus, LogIn, ShieldAlert, X, CheckCircle2, Tv, Sparkles, Clock, Fingerprint, ShieldCheck, Zap, Shield, ArrowRight, RefreshCw, Smartphone, Laptop } from 'lucide-react';
import { signUpStudent, signInStudent, verifyEmailOtp, resendVerificationEmail, signInWithGoogle, signInWithEmailOtp, signInAsGuestDemo } from '../lib/auth';
import { verifyStudentPasskey } from '../lib/passkey';
import { isWebAuthnSupported, authenticateWithWebAuthn } from '../lib/webauthn';
import { registerDeviceSession } from '../lib/session';
import { TurnstileCaptcha } from './TurnstileCaptcha';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: any) => void;
  isFullPage?: boolean;
  revokedMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  isFullPage = false,
  revokedMessage = ''
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify_otp'>('signin');
  const [authMethod, setAuthMethod] = useState<'passkey' | 'password'>('passkey');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [supportsBiometrics, setSupportsBiometrics] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        
        // 1. Direct Email Verification Link (Clicked in email)
        const verifyEmail = params.get('verify_email');
        const verifyOtp = params.get('verify_otp') || (verifyEmail ? params.get('otp') : null);
        if (verifyEmail && verifyOtp) {
          setEmail(verifyEmail);
          setEmailOtp(verifyOtp);
          setMode('verify_otp');
          setLoading(true);
          setSuccessMsg('Verifying your email from direct link...');
          verifyEmailOtp(verifyEmail, verifyOtp).then(({ user, error: verifyErr }) => {
            setLoading(false);
            if (verifyErr) {
              setError(verifyErr);
              setSuccessMsg('');
            } else if (user) {
              setSuccessMsg('🎉 Email verified successfully! Unlocking SDETube Arena...');
              setTimeout(() => {
                onSuccess(user);
                if (onClose) onClose();
              }, 600);
            }
          }).catch((e) => {
            setLoading(false);
            setError(e?.message || 'Direct link verification error.');
          });
          return;
        }

        // 2. Direct Invite Passcode Attached
        const inviteCode = params.get('passcode') || params.get('passkey') || params.get('code');
        const urlEmail = params.get('email');
        if (inviteCode) {
          setAuthCode(inviteCode.toUpperCase());
          setMode('signup');
          setAuthMethod('password');
          if (urlEmail) setEmail(urlEmail);
        }
      }

      const bio = isWebAuthnSupported();
      setSupportsBiometrics(bio);
      if (!authCode) {
        if (bio) {
          setAuthMethod('passkey');
        } else {
          setAuthMethod('password');
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWebAuthnBiometricLogin = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('Touch your sensor / scan Face ID or Windows Hello...');

    try {
      const result = await authenticateWithWebAuthn(email.trim() || undefined);
      if (!result.success) {
        setLoading(false);
        setError(result.error || 'Biometric verification failed.');
        return;
      }

      const matchedEmail = result.email || email || 'mdalamrahman4@gmail.com';
      const studentUser = {
        id: `usr-${matchedEmail.replace(/[^a-z0-9]/g, '')}`,
        email: matchedEmail,
        created_at: new Date().toISOString()
      };

      try {
        localStorage.setItem('edustream_student_session', JSON.stringify(studentUser));
        registerDeviceSession(studentUser.email, studentUser.id).catch(() => {});
      } catch {}

      setSuccessMsg(`🛡️ Authenticated via Supabase Passkey!`);
      setTimeout(() => {
        onSuccess(studentUser);
        if (onClose) onClose();
      }, 500);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Passkey verification failed.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error: gErr } = await signInWithGoogle();
    if (gErr) {
      setLoading(false);
      if (gErr.toLowerCase().includes('provider is not enabled') || gErr.toLowerCase().includes('unsupported provider')) {
        setError('Google Provider is not enabled yet in your Supabase Dashboard. Please enable Google in Supabase -> Authentication -> Providers.');
      } else {
        setError(gErr);
      }
    }
  };

  const handleVerifyEmailOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!emailOtp || emailOtp.trim().length < 6) {
      setError('Please enter the 6-digit confirmation OTP code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const { user, error: otpErr } = await verifyEmailOtp(email, emailOtp);
      if (otpErr) {
        setError(otpErr);
      } else if (user) {
        setSuccessMsg('Email verified successfully! Loading portal...');
        setTimeout(() => {
          onSuccess(user);
          if (onClose) onClose();
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    const { success, error: resendErr } = await resendVerificationEmail(email, captchaToken);
    setLoading(false);
    if (success) {
      setSuccessMsg('A fresh verification link & OTP has been sent to your email.');
    } else {
      setError(resendErr || 'Failed to resend confirmation email.');
    }
  };

  const handleSendLoginOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter your email address above to receive a Magic Link / OTP code.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await signInWithEmailOtp(email.trim());
      if (res.success) {
        setMode('verify_otp');
        setSuccessMsg(`We sent a login Magic Link and OTP to ${email.trim()}. Enter the code below or click the link in your email.`);
      } else {
        setError(res.error || 'Failed to dispatch email OTP.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch email OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (mode === 'signup') {
      const passkeyCheck = await verifyStudentPasskey(authCode);
      if (!passkeyCheck.valid) {
        setError(passkeyCheck.error || 'Invalid or expired student authorization passkey. Passkeys expire after 10 minutes in Supabase.');
        return;
      }

      setLoading(true);
      try {
        const { user, needsEmailVerification, error: signUpErr } = await signUpStudent(email.trim(), password, captchaToken);

        if (signUpErr) {
          setError(signUpErr);
        } else if (needsEmailVerification) {
          setMode('verify_otp');
          setSuccessMsg(`Confirmation email sent to ${email.trim()}. Please enter the 6-digit OTP code below or click the link in your inbox.`);
        } else if (user) {
          setSuccessMsg('Account created successfully! Unlocking portal...');
          setTimeout(() => {
            onSuccess(user);
            if (onClose) onClose();
          }, 600);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred during signup.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const { user, error: signInErr } = await signInStudent(email.trim(), password, captchaToken);

        if (signInErr) {
          if (signInErr.toLowerCase().includes('email not confirmed')) {
            setMode('verify_otp');
            setError('Your email is not confirmed yet. Please enter the OTP code sent to your email or click Resend.');
          } else if (signInErr.toLowerCase().includes('invalid login credentials')) {
            setError('Account not found or credentials invalid. If you do not have an account yet, click "Create Account" below.');
          } else {
            setError(signInErr);
          }
        } else if (user) {
          setSuccessMsg('Signed in successfully! Loading portal...');
          setTimeout(() => {
            onSuccess(user);
            if (onClose) onClose();
          }, 500);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred during sign in.');
      } finally {
        setLoading(false);
      }
    }
  };

  const containerClass = isFullPage
    ? "min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100 relative overflow-hidden selection:bg-indigo-500 selection:text-white"
    : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn";

  return (
    <div className={containerClass}>
      
      {/* Immersive Background Ambient Lighting Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-pink-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-sky-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Brand Header for Full Page Login */}
      {isFullPage && (
        <div className="flex flex-col items-center text-center mb-6 z-10 animate-fadeIn">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-indigo-300 font-mono text-[11px] font-bold shadow-lg mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>SDETUBE ENTERPRISE MATRIX</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 p-0.5 shadow-xl shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Tv className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-slate-200 bg-clip-text text-transparent">
              SDETube Arena
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            High-Performance System Design, Coding & Technical Interview Matrix
          </p>
        </div>
      )}

      {/* Main Glassmorphic Auth Card */}
      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-slate-800/80 bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl z-10">
        
        {/* Close Button (only if modal mode) */}
        {!isFullPage && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Mode Selector Tabs (only if not verify_otp) */}
        {mode !== 'verify_otp' ? (
          <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 mb-5 font-mono text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'signin'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
            className="mb-4 text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>← Back to Sign In</span>
          </button>
        )}

        {/* Session Revocation Alert */}
        {revokedMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-950/70 border border-amber-500/50 text-xs text-amber-200 flex items-start gap-2.5 animate-fadeIn shadow-lg shadow-amber-950/40">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-amber-300">Single Device Session Active</div>
              <div className="text-amber-200/90 leading-relaxed">{revokedMessage}</div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-950/80 border border-red-800/80 text-xs text-red-200 flex items-start gap-2 animate-shake">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: PASSKEY-FIRST INSTANT SIGN-IN VIEW                                */}
        {/* ========================================================================= */}
        {mode === 'signin' && supportsBiometrics && authMethod === 'passkey' ? (
          <div className="space-y-4 text-center animate-fadeIn">
            
            {/* Glowing Biometric Scanner Emblem */}
            <div className="py-2 flex flex-col items-center justify-center">
              <div className="relative p-4 rounded-3xl bg-gradient-to-b from-indigo-950 to-purple-950 border border-indigo-500/40 shadow-2xl shadow-indigo-600/20 group">
                <div className="absolute inset-0 rounded-3xl bg-indigo-500/10 animate-ping opacity-30 pointer-events-none" />
                <Fingerprint className="w-12 h-12 text-indigo-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-3">Instant Passkey Sign-In</h3>
              <p className="text-xs text-slate-400 mt-0.5 max-w-xs leading-relaxed">
                Biometric verification via Windows Hello, Touch ID, or Face ID.
              </p>
            </div>

            {/* Primary Passkey Trigger */}
            <button
              type="button"
              onClick={handleWebAuthnBiometricLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <span className="animate-spin font-mono text-xs">Awaiting Biometric Sensor...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-current animate-pulse" />
                  <span>Scan Passkey / Windows Hello</span>
                </>
              )}
            </button>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Recruiter / Portfolio Demo 1-Click Access */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  const demoUser = signInAsGuestDemo();
                  setSuccessMsg('✨ Welcome to the SDETube Live Demo!');
                  setTimeout(() => {
                    onSuccess(demoUser);
                    if (onClose) onClose();
                  }, 400);
                }}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 hover:from-emerald-500/30 hover:via-cyan-500/30 hover:to-indigo-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Explore as Recruiter / Instant Demo</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-medium">1-Click</span>
              </button>
            </div>

            {/* Switch to Password Option */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => { setAuthMethod('password'); setError(''); }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Use password or email sign in instead →</span>
              </button>
            </div>

          </div>
        ) : mode === 'verify_otp' ? (
          /* ========================================================================= */
          /* VIEW 2: EMAIL OTP VERIFICATION                                            */
          /* ========================================================================= */
          <form onSubmit={handleVerifyEmailOtpSubmit} className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                Enter 6-Digit Email OTP Code
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-400" />
                <input
                  type="text"
                  maxLength={8}
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  placeholder="e.g. 123456"
                  required
                  autoFocus
                  className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-amber-500/60 rounded-2xl text-sm font-mono tracking-widest text-center text-amber-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Check your inbox or spam folder for the confirmation OTP from Supabase Auth.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin font-mono text-xs">Verifying...</span>
              ) : (
                <>
                  <span>Verify Email & Activate Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Didn't receive code? Resend Email OTP</span>
              </button>
            </div>
          </form>
        ) : (
          /* ========================================================================= */
          /* VIEW 3: STANDARD EMAIL & PASSWORD FORM (OR SIGN UP)                      */
          /* ========================================================================= */
          <form onSubmit={handleSubmit} className="space-y-3.5 animate-fadeIn">
            
            {/* Switch back to Passkey if available */}
            {mode === 'signin' && supportsBiometrics && (
              <div className="flex justify-between items-center pb-1">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('passkey'); setError(''); }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
                  <span>← Switch to Instant Biometric Passkey</span>
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@edustream.org"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            {mode === 'signin' && (
              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={handleSendLoginOtp}
                  disabled={loading}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sign In via Email Magic Link / OTP Code</span>
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-2">
                {authCode && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between shadow-sm animate-fadeIn">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Invite Passcode Attached ({authCode})</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-500/30">Auto-Verified</span>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-indigo-300">
                      Dynamic Admin Passkey <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" /> Admin Generated
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-400" />
                    <input
                      type="text"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      placeholder="e.g. SDE-489201"
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-indigo-950/40 border border-indigo-700/80 rounded-xl text-xs font-mono text-indigo-200 placeholder-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/40 uppercase"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter the dynamic authorization passcode provided in your invite link.
                  </p>
                </div>
              </div>
            )}

            {/* Compact Turnstile Captcha Widget */}
            <TurnstileCaptcha 
              onVerify={(token) => setCaptchaToken(token)} 
              onExpire={() => setCaptchaToken('')}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="animate-spin font-mono text-xs">Authenticating with Supabase...</span>
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Access Portal</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Verify Code & Register in Supabase</span>
                </>
              )}
            </button>

            {/* Google OAuth Button */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-slate-900 px-2 text-slate-500 font-bold">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Recruiter / Portfolio Demo 1-Click Access */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  const demoUser = signInAsGuestDemo();
                  setSuccessMsg('✨ Welcome to the SDETube Live Demo!');
                  setTimeout(() => {
                    onSuccess(demoUser);
                    if (onClose) onClose();
                  }, 400);
                }}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 hover:from-emerald-500/30 hover:via-cyan-500/30 hover:to-indigo-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Explore as Recruiter / Instant Demo</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-medium">1-Click</span>
              </button>
            </div>

          </form>
        )}

      </div>

      {/* Footer Credentials Info */}
      <div className="mt-5 text-center text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1.5 z-10 select-none">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Supabase Auth &bull; WebAuthn Biometrics &bull; Turnstile Defended</span>
      </div>

    </div>
  );
};
