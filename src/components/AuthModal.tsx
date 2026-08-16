import React, { useState } from 'react';
import { KeyRound, Mail, Lock, UserPlus, LogIn, ShieldAlert, X, CheckCircle2, Tv, Sparkles, Clock } from 'lucide-react';
import { signUpStudent, signInStudent } from '../lib/auth';
import { verifyStudentPasskey } from '../lib/passkey';

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
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (mode === 'signup') {
      const passkeyCheck = verifyStudentPasskey(authCode);
      if (!passkeyCheck.valid) {
        setError(passkeyCheck.error || 'Invalid or expired student authorization passkey. Passkeys expire after 10 minutes.');
        return;
      }

      setLoading(true);
      try {
        const { user, error: signUpErr } = await signUpStudent(email.trim(), password);

        if (signUpErr) {
          setError(signUpErr);
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
        const { user, error: signInErr } = await signInStudent(email.trim(), password);

        if (signInErr) {
          if (signInErr.toLowerCase().includes('invalid login credentials') || signInErr.toLowerCase().includes('email not confirmed')) {
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
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 gradient-text">
            {mode === 'signin' ? 'Sign In to Access Portal' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signin' 
              ? 'Enter your student credentials to unlock video lectures & workspace.' 
              : 'Enter your details and mandatory Authorization Code to register.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
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

        {/* Auth Form */}
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
                  Dynamic Admin Authorization Passkey <span className="text-red-400">*</span>
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
                Enter the dynamic passkey generated by the Admin (valid for 10 minutes from creation).
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin font-mono text-xs">Authenticating...</span>
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Access Portal</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Verify Code & Register</span>
              </>
            )}
          </button>
        </form>
      </div>

      {isFullPage && (
        <div className="mt-8 text-center text-xs text-slate-500 font-mono">
          <span>Protected by Supabase Auth & PostgreSQL Row Level Security (RLS)</span>
        </div>
      )}

    </div>
  );
};
