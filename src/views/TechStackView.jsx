import React from 'react';
import { Cpu, Github, Sparkles, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function TechStackView({ setCurrentView }) {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Cpu className="w-4 h-4" /> Architecture & Technology
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">CodeLens AI</h1>
        <p className="text-lg text-indigo-400 font-semibold">Smarter Code. Safer Future.</p>
      </div>

      {/* 4 Feature Columns matching Panel 9 in image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-3 hover:border-indigo-500/50 transition-all shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 mx-auto flex items-center justify-center">
            <Github className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Analyze GitHub Repository</h3>
          <p className="text-xs text-slate-400">Deep structural AST parsing & metric extraction.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-3 hover:border-purple-500/50 transition-all shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">AI Review & Suggestions</h3>
          <p className="text-xs text-slate-400">Contextual code reviews powered by LLM models.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-3 hover:border-emerald-500/50 transition-all shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Fix Issues with AI</h3>
          <p className="text-xs text-slate-400">One-click automated code refactoring & security fixes.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-3 hover:border-blue-500/50 transition-all shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Generate Report in PDF</h3>
          <p className="text-xs text-slate-400">Executive PDF security audits for compliance.</p>
        </div>
      </div>

      {/* Built With Tech Grid matching screenshot panel 9 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Built With</h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
            <span className="text-3xl">🐍</span>
            <h4 className="text-xs font-bold text-white">Python</h4>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
            <span className="text-3xl">⚡</span>
            <h4 className="text-xs font-bold text-white">FastAPI</h4>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
            <span className="text-3xl">🌐</span>
            <h4 className="text-xs font-bold text-white">HTML5</h4>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
            <span className="text-3xl">🎨</span>
            <h4 className="text-xs font-bold text-white">CSS3</h4>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
            <span className="text-3xl">📜</span>
            <h4 className="text-xs font-bold text-white">JavaScript</h4>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
            <span className="text-3xl">🐘</span>
            <h4 className="text-xs font-bold text-white">PostgreSQL</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
