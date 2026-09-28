import React, { useState } from 'react';
import { ArrowLeft, Check, Copy, Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FixSuggestionView({ issue, onBack, onApplyFix }) {
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(issue?.applied || false);

  if (!issue) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(issue.improvedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    setApplied(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (onApplyFix) {
      onApplyFix(issue.id);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to issues</span>
      </button>

      {/* Main Container (Matching Panel 5 screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Explanations */}
        <div className="lg:col-span-5 space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>HIGH SEVERITY SECURITY ISSUE</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{issue.title}</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              File: <span className="text-indigo-300">{issue.file}</span> • Line: <span className="text-indigo-300">{issue.line}</span>
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Problem */}
            <div className="space-y-1.5 border-l-2 border-rose-500 pl-3">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Problem</h3>
              <p className="text-slate-300 leading-relaxed font-normal">{issue.problem}</p>
            </div>

            {/* Why it matters */}
            <div className="space-y-1.5 border-l-2 border-amber-500 pl-3">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Why it matters</h3>
              <p className="text-slate-300 leading-relaxed font-normal">{issue.whyItMatters}</p>
            </div>

            {/* Suggested Fix */}
            <div className="space-y-1.5 border-l-2 border-emerald-500 pl-3">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Suggested Fix</h3>
              <p className="text-slate-300 leading-relaxed font-normal">{issue.suggestedFix}</p>
            </div>
          </div>

          {/* Action buttons matching screenshot */}
          <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
            <button
              onClick={handleApply}
              disabled={applied}
              className={`flex-1 font-semibold text-xs py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
                applied
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {applied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Fix Applied!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Apply Fix</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopy}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-xs px-4 py-3 rounded-lg transition-all flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Code Comparison (Side-by-side / split code diff matching Screen 5) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Code Comparison</h2>

          {/* Original Code Block */}
          <div className="bg-slate-950 border border-rose-950/80 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-rose-950/40 border-b border-rose-900/60 px-4 py-2 flex items-center justify-between text-xs text-rose-300 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Original Code (Vulnerable)
              </span>
              <span className="text-[10px] text-rose-400 font-bold">BEFORE</span>
            </div>
            <pre className="p-4 font-mono text-xs text-rose-200 overflow-x-auto bg-[#0a0608]">
              <code>{issue.originalCode}</code>
            </pre>
          </div>

          {/* Improved Code Block */}
          <div className="bg-slate-950 border border-emerald-950/80 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-emerald-950/40 border-b border-emerald-900/60 px-4 py-2 flex items-center justify-between text-xs text-emerald-300 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Improved Code (AI Fix)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">AFTER</span>
            </div>
            <pre className="p-4 font-mono text-xs text-emerald-200 overflow-x-auto bg-[#040a07]">
              <code>{issue.improvedCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
