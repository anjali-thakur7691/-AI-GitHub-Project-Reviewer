import React, { useState } from 'react';
import { Search, Github, User, ArrowRight, Sparkles } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, repoUrl, setRepoUrl, onAnalyze }) {
  const [inputUrl, setInputUrl] = useState(repoUrl || 'https://github.com/vercel/next.js');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputUrl) {
      setRepoUrl(inputUrl);
      onAnalyze(inputUrl);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0d111a]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input Box matching Dashboard screenshot top bar */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-2xl flex items-center gap-2">
        <div className="relative flex-1">
          <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="w-full bg-slate-900/90 border border-slate-700/80 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <span>Analyze</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Right Navbar Actions */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setCurrentView('landing')}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
        >
          Landing Page
        </button>
        <button 
          onClick={() => setCurrentView('tech-stack')}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Tech Stack</span>
        </button>
        <button 
          onClick={() => setCurrentView('auth')}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
        >
          <User className="w-3.5 h-3.5 text-indigo-400" />
          <span>Account</span>
        </button>
      </div>
    </header>
  );
}
