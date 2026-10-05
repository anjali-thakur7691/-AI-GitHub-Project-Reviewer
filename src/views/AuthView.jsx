import React, { useState } from 'react';
import { Github, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, Eye, EyeOff, UserRound, ArrowLeft } from 'lucide-react';
import { loginAccount, registerAccount } from '../api';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthView({ onLoginSuccess, onBackHome }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (signUp) => {
    setIsSignUp(signUp);
    setError('');
    setNotice('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    const cleanEmail = email.trim().toLowerCase();

    if (isSignUp && !name.trim()) return setError('Please enter your name.');
    if (!cleanEmail || !password || (isSignUp && !confirmPassword)) return setError('Please complete all required fields.');
    if (!emailPattern.test(cleanEmail)) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (isSignUp && password !== confirmPassword) return setError('Passwords do not match.');

    setIsSubmitting(true);
    try {
      const result = isSignUp
        ? await registerAccount({ name: name.trim(), email: cleanEmail, password })
        : await loginAccount({ email: cleanEmail, password });
      setNotice(isSignUp ? 'Account created. Opening your dashboard...' : 'Login successful. Opening your dashboard...');
      window.setTimeout(() => onLoginSuccess(result.user), 650);
    } catch (requestError) {
      setError(requestError.message || 'Could not connect to the authentication service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 text-slate-100">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 md:p-10 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-mono font-bold text-white text-sm shadow-md">&lt;/&gt;</div>
                <span className="font-extrabold text-lg tracking-tight text-white">CodeLens AI</span>
              </div>
              <button type="button" onClick={onBackHome} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
              </button>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">{isSignUp ? 'Create an Account' : 'Welcome Back!'}</h2>
            <p className="text-xs text-slate-400">{isSignUp ? 'Start securing your repositories today' : 'Login to your account to continue'}</p>
            {!isSignUp && <p className="mt-2 text-[11px] text-indigo-300">Demo: demo@codelens.ai / CodeLensDemo123</p>}

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              {isSignUp && <div>
                <label htmlFor="auth-name" className="block text-xs font-semibold text-slate-300 mb-1.5">Name</label>
                <div className="relative"><UserRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input id="auth-name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>}

              <div>
                <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-300 mb-1.5">Email address</label>
                <div className="relative"><Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input id="auth-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative"><Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input id="auth-password" type={showPassword ? 'text' : 'password'} autoComplete={isSignUp ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500" />
                  <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"><span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>

              {isSignUp && <div>
                <label htmlFor="auth-confirm" className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative"><Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input id="auth-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>}

              {!isSignUp && <div className="flex justify-end text-xs"><button type="button" onClick={() => { setError(''); setNotice('Password reset is not configured yet. For the demo account, use the displayed demo credentials.'); }} className="text-indigo-400 hover:underline">Forgot Password?</button></div>}

              {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</p>}
              {notice && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">{notice}</p>}

              <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-xs py-3 rounded-lg transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2">
                <span>{isSubmitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Login'}</span><ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {!isSignUp && <>
              <div className="relative my-6 text-center"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div><span className="relative bg-slate-900 px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">OR</span></div>
              <button type="button" onClick={() => setNotice('GitHub sign-in is not configured in this local demo. Use email login or create an account.')} className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2.5"><Github className="w-4 h-4" /><span>Continue with GitHub</span></button>
            </>}
          </div>

          <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-800/60">
            {isSignUp ? <span>Already have an account? <button type="button" onClick={() => switchMode(false)} className="text-indigo-400 font-semibold hover:underline">Login</button></span> : <span>Don't have an account? <button type="button" onClick={() => switchMode(true)} className="text-indigo-400 font-semibold hover:underline">Sign Up</button></span>}
          </div>
        </div>

        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-10 border-l border-slate-800 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl" />
          <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-6 ring-1 ring-indigo-500/30"><ShieldCheck className="w-10 h-10" /></div>
          <div className="text-center max-w-xs space-y-2"><h3 className="text-xl font-extrabold text-white">Better Code.</h3><h3 className="text-xl font-extrabold text-indigo-400">Safer Projects.</h3><h3 className="text-xl font-extrabold text-purple-400">Smarter Developers.</h3><p className="text-xs text-slate-400 pt-3 leading-relaxed">Repository insights, context-aware AI assistance, and security pattern checks for engineering teams.</p></div>
          <div className="mt-8 space-y-2 text-left w-full max-w-xs"><div className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>Common source-pattern checks</span></div><div className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>Context-aware review suggestions</span></div><div className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>Exportable PDF reports</span></div></div>
        </div>
      </div>
    </div>
  );
}
