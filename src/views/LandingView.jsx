import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  FileText, 
  ArrowRight, 
  Github, 
  CheckCircle2,
  Cpu
} from 'lucide-react';

export default function LandingView({ onAnalyze, onGetStarted }) {
  const [url, setUrl] = useState('https://github.com/vercel/next.js');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#080b13] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/60 bg-[#0b0e17]/80 backdrop-blur-md sticky top-0 z-30 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
            🧑‍💻
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">AI GitHub Project Reviewer</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#home" className="hover:text-indigo-400 transition-colors">Home</a>
          <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
          <a href="#about" className="hover:text-indigo-400 transition-colors">About</a>
          <a href="#contact" className="hover:text-indigo-400 transition-colors">Contact</a>
        </nav>

        <button 
          onClick={onGetStarted}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-all shadow-md shadow-indigo-600/30"
        >
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative px-8 pt-16 pb-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Glow Effects */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Left Hero Content */}
        <div className="lg:col-span-7 space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Automated Code Security</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            🧑‍💻 AI GitHub <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Project Reviewer
            </span> <br />
            Code Review & Security Assistant
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-xl font-normal leading-relaxed">
            Paste a GitHub repository, and let AI GitHub Project Reviewer analyze, understand, secure and help you improve your code – automatically.
          </p>

          {/* Search Box Form */}
          <form onSubmit={handleSubmit} className="mt-8 bg-slate-900/90 p-2 rounded-xl border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="flex-1 flex items-center gap-3 px-3">
              <Github className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter GitHub repository URL (e.g. https://github.com/username/repo)"
                className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none font-mono py-2"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm px-6 py-3 rounded-lg transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 shrink-0"
            >
              <span>Analyze Repository</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Hero Graphics */}
        <div className="lg:col-span-5 relative z-10">
          <div className="relative rounded-2xl bg-slate-900 border border-slate-700 p-4 shadow-2xl overflow-hidden">
            <div className="h-72 rounded-xl bg-[#0d1117] p-4 flex flex-col justify-between border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <span className="font-mono text-xs text-slate-400 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5" /> next.js / main
                </span>
              </div>

              <div className="font-mono text-xs space-y-2 py-4 text-slate-300">
                <p className="text-indigo-400">&gt; 🧑‍💻 AI GitHub Project Reviewer scanning...</p>
                <p className="text-slate-400">&gt; Found 1,248 files (312,456 lines of code)</p>
                <p className="text-amber-400">&gt; [WARN] Hardcoded API Key detected in database.ts</p>
                <p className="text-emerald-400">&gt; AI Fix generated: process.env.API_KEY</p>
              </div>

              <div className="flex items-center justify-between bg-indigo-950/40 p-3 rounded-lg border border-indigo-500/20">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Health Score: 86/100</span>
                </div>
                <span className="text-[11px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded">AI READY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="mt-auto border-t border-slate-800 bg-[#090c13] py-16 px-8 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Cpu className="w-4 h-4" /> Built With Modern Tech Stack
            </div>
            <h2 className="text-3xl font-extrabold text-white">🧑‍💻 AI GitHub Project Reviewer</h2>
            <p className="text-sm text-indigo-400 mt-1 font-semibold">Smarter Code. Safer Future.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-200">🐍 Python</div>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-200">⚡ FastAPI</div>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-200">🌐 HTML5</div>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-200">🎨 CSS3</div>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-200">📜 JavaScript / TS</div>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-200">🐘 PostgreSQL</div>
          </div>
        </div>
      </section>
    </div>
  );
}
