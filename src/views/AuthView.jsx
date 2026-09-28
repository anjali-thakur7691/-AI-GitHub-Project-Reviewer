import React, { useState } from 'react';
import { Github, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AuthView({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('anjali.thakur@example.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 text-slate-100">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Form (Screen 2 matching screenshot) */}
        <div className="p-8 md:p-10 flex flex-col justify-between space-y-6">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-mono font-bold text-white text-sm shadow-md">
                &lt;/&gt;
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">CodeLens AI</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">
              {isSignUp ? 'Create an Account' : 'Welcome Back!'}
            </h2>
            <p className="text-xs text-slate-400">
              {isSignUp ? 'Start securing your repositories today' : 'Login to your account to continue'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                    <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="text-indigo-400 hover:underline">Forgot password?</a>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 rounded-lg transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <span>{isSignUp ? 'Sign Up' : 'Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <span className="relative bg-slate-900 px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">OR</span>
            </div>

            {/* GitHub OAuth Button */}
            <button
              onClick={onLoginSuccess}
              type="button"
              className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2.5"
            >
              <Github className="w-4 h-4" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-800/60">
            {isSignUp ? (
              <span>Already have an account? <button onClick={() => setIsSignUp(false)} className="text-indigo-400 font-semibold hover:underline">Login</button></span>
            ) : (
              <span>Don't have an account? <button onClick={() => setIsSignUp(true)} className="text-indigo-400 font-semibold hover:underline">Sign Up</button></span>
            )}
          </div>
        </div>

        {/* Right Side: Graphic Illustration (Matching panel 2 in screenshot) */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-10 border-l border-slate-800 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl"></div>

          <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-6 ring-1 ring-indigo-500/30">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <div className="text-center max-w-xs space-y-2">
            <h3 className="text-xl font-extrabold text-white">Better Code.</h3>
            <h3 className="text-xl font-extrabold text-indigo-400">Safer Projects.</h3>
            <h3 className="text-xl font-extrabold text-purple-400">Smarter Developers.</h3>
            <p className="text-xs text-slate-400 pt-3 leading-relaxed">
              Automated AI code reviews and real-time security scanning for modern engineering teams.
            </p>
          </div>

          <div className="mt-8 space-y-2 text-left w-full max-w-xs">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Detect OWASP Top 10 vulnerabilities</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>One-click AI Code Refactoring</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Executive Security Reports</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
