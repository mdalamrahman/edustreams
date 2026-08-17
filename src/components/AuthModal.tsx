import React, { useState, useEffect } from 'react';
import { KeyRound, Mail, Lock, UserPlus, LogIn, ShieldAlert, X, CheckCircle2, Tv, Sparkles, Clock, Fingerprint, ShieldCheck, Zap, Shield, ArrowRight, RefreshCw } from 'lucide-react';
import { signUpStudent, signInStudent, verifyEmailOtp, resendVerificationEmail, signInWithGoogle } from '../lib/auth';
import { verifyStudentPasskey } from '../lib/passkey';
import { isWebAuthnSupported, authenticateWithWebAuthn } from '../lib/webauthn';
import { TurnstileCaptcha } from './TurnstileCaptcha';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: any) => void;
  isFullPage?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  isFullPage = false
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify_otp'>('signin');
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
      setSupportsBiometrics(isWebAuthnSupported());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWebAuthnBiometricLogin = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('Scanning Windows Hello / Touch ID / Hardware Passkey...');

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
      } catch {}

      setSuccessMsg(`🛡️ Authenticated via Supabase Biometric Passkey!`);
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
    ? "min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/50 via-slate-950 to-slate-950"
    : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn";

  return (
    <div className={containerClass}>
      
      {/* Brand Header for Full Page Login */}
      {isFullPage && (
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-2xl shadow-indigo-500/30 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Tv className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight gradient-text">SDETube AI Portal</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Private Educational Matrix & High-Performance SDE Video Learning Platform
          </p>
        </div>
      )}

      <div className="relative w-full max-w-md glass-panel rounded-2xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl">
        
        {/* Close Button (only if modal mode) */}
        {!isFullPage && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-700/60 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
            {mode === 'verify_otp' ? <Mail className="w-6 h-6 text-amber-400" /> : <KeyRound className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 gradient-text">
            {mode === 'verify_otp' 
              ? 'Verify Your Email OTP' 
              : mode === 'signin' 
              ? 'Sign In to Access Portal' 
              : 'Create Student Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'verify_otp'
              ? `Enter the 6-digit verification code sent to ${email || 'your email'}`
              : mode === 'signin' 
              ? 'Enter your credentials or use Supabase Passkey.' 
              : 'Enter your details and 10-minute dynamic passkey to register.'}
          </p>
        </div>

        {/* Mode Selector Tabs (only if not verify_otp) */}
        {mode !== 'verify_otp' ? (
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5 font-mono text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md'
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
            className="mb-4 text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
          >
            <span>← Back to Sign In</span>
          </button>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-xs text-red-200 flex items-start gap-2 animate-shake">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Supabase Hardware / Biometric Passkey Quick Sign-In Option */}
        {mode === 'signin' && supportsBiometrics && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleWebAuthnBiometricLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 hover:from-purple-900 hover:to-indigo-900 border border-purple-600/50 text-purple-200 hover:text-white font-bold text-xs shadow-md shadow-purple-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Fingerprint className="w-4 h-4 text-purple-300" />
              <span>Sign In with Supabase Passkey (Windows Hello / Touch ID)</span>
            </button>
          </div>
        )}

        {/* 1. VIEW: EMAIL OTP VERIFICATION */}
        {mode === 'verify_otp' ? (
          <form onSubmit={handleVerifyEmailOtpSubmit} className="space-y-4">
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
                  className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-amber-500/60 rounded-xl text-sm font-mono tracking-widest text-center text-amber-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Check your inbox or spam folder for the confirmation OTP from Supabase Auth.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Didn't receive code? Resend Email OTP</span>
              </button>
            </div>
          </form>
        ) : (
          /* 2. VIEW: REGULAR SIGN IN & SIGN UP FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {mode === 'signup' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-indigo-300">
                    Dynamic Supabase Authorization Passkey <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> 10-Min Validity
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
                  Enter the dynamic passkey generated by Admin (synced directly in Supabase).
                </p>
              </div>
            )}

            {/* Cloudflare Turnstile Captcha Widget */}
            <TurnstileCaptcha 
              onVerify={(token) => setCaptchaToken(token)} 
              onExpire={() => setCaptchaToken('')}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
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
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-slate-900 px-2 text-slate-500 font-bold">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

          </form>
        )}

      </div>

      {isFullPage && (
        <div className="mt-8 text-center text-xs text-slate-500 font-mono">
          <span>Protected by Supabase Auth, WebAuthn Level 3 & PostgreSQL RLS</span>
        </div>
      )}

    </div>
  );
};
