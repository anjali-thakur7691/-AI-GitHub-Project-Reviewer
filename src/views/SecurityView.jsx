import React from 'react';
import { ShieldAlert, AlertOctagon, AlertTriangle, ShieldCheck, ChevronRight, Lock } from 'lucide-react';

export default function SecurityView({ repoData, onSelectFinding }) {
  const { counts, tools, findings } = repoData.securityScan;
  const highShare = counts.total ? (counts.high / counts.total) * 100 : 0;
  const mediumShare = counts.total ? (counts.medium / counts.total) * 100 : 0;
  const lowShare = counts.total ? (counts.low / counts.total) * 100 : 0;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center ring-1 ring-indigo-500/30">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security Scan</h1>
          <p className="text-xs text-slate-400 mt-0.5">Built-in source-pattern checks for common secrets and risky code patterns.</p>
          {repoData.isSample && <p className="mt-2 inline-flex rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">Sample findings — run a repository scan for live results</p>}
        </div>
      </div>

      {/* Top 3 Metric Cards (Matching Screen 6) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* High Severity */}
        <div className="bg-slate-900 border border-rose-900/50 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block">High Severity</span>
            <span className="text-3xl font-extrabold text-white">{counts.high}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-xl border border-rose-500/20">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        {/* Medium Severity */}
        <div className="bg-slate-900 border border-amber-900/50 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">Medium Severity</span>
            <span className="text-3xl font-extrabold text-white">{counts.medium}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xl border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Low Severity */}
        <div className="bg-slate-900 border border-blue-900/50 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">Low Severity</span>
            <span className="text-3xl font-extrabold text-white">{counts.low}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xl border border-blue-500/20">
            <Lock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Grid: Scan Details List & Severity Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scan Details List */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Scan Details</h2>

          <div className="space-y-3">
            {tools.map((tool, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold">{tool.name}</span>
                </div>
                <span className="bg-slate-800 text-indigo-300 font-bold px-2.5 py-1 rounded-md text-[11px]">
                  {tool.count} {tool.name === 'Repository files examined' ? 'files' : 'matches'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Distribution Donut Chart */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Severity Distribution</h2>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3.8"
                />
                {/* High (30%) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="3.8"
                  strokeDasharray={`${highShare}, 100`}
                />
                {/* Medium (50%) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3.8"
                  strokeDasharray={`${mediumShare}, 100`}
                  strokeDashoffset={-highShare}
                />
                {/* Low (20%) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.8"
                  strokeDasharray={`${lowShare}, 100`}
                  strokeDashoffset={-(highShare + mediumShare)}
                />
              </svg>
              {/* Donut Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-white">{counts.total}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>High ({counts.high})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>Medium ({counts.medium})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span>Low ({counts.low})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Findings List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Security Findings</h2>

        <div className="space-y-3">
          {findings.length === 0 ? <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-300">No security-pattern matches were found in the files scanned. This is a heuristic scan, so it does not replace a full security audit.</p> : findings.map((item, idx) => (
            <button
              key={idx} 
              type="button"
              onClick={() => onSelectFinding?.(item)}
              className="w-full text-left p-4 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                  item.severity === 'High' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {item.severity}
                </span>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.file} • Line {item.line}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-slate-800 text-indigo-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-700">
                  {item.tag}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
