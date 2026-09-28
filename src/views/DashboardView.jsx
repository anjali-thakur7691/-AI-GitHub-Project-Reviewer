import React from 'react';
import { 
  Github, 
  Star, 
  GitFork, 
  Clock, 
  Folder, 
  FileCode, 
  ChevronRight, 
  ShieldAlert, 
  CheckCircle, 
  Activity,
  ArrowRight
} from 'lucide-react';
import HealthGauge from '../components/HealthGauge';

export default function DashboardView({ repoData, setCurrentView }) {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Repository Analysis</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time health breakdown and code structure insights.</p>
        </div>

        <button 
          onClick={() => setCurrentView('issues')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-2"
        >
          <span>View All Issues</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Repo Info & File Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Repo Info Card (Panel 3 matching screenshot) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                <Github className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{repoData.name}</h2>
                <a 
                  href={repoData.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                >
                  {repoData.url}
                </a>
              </div>
            </div>

            <p className="text-sm text-slate-300 font-normal leading-relaxed">
              {repoData.description}
            </p>
          </div>

          {/* Stats Badges (Matching panel 3 in screenshot) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Language</span>
              <span className="text-xs font-bold text-indigo-300 mt-0.5 inline-block">{repoData.primaryLanguage}</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Stars</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-slate-200">{repoData.stars}</span>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Forks</span>
              <div className="flex items-center gap-1 mt-0.5">
                <GitFork className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-200">{repoData.forks}</span>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Updated</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">{repoData.updated}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Repository Structure File Tree Panel */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Repository Structure</span>
            <span className="text-[10px] font-normal text-indigo-400">{repoData.totalFiles} files</span>
          </h3>

          <div className="space-y-1.5 font-mono text-xs max-h-56 overflow-y-auto pr-1">
            {repoData.structure.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 transition-colors cursor-pointer text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-indigo-400" />
                  <span>{item.name}</span>
                </div>
                <span className="text-[10px] text-slate-500">{item.items.length} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Project Health Score & Programming Languages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Health Score Card (Panel 3 Radial Gauge + Breakdown) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Project Health Score</h3>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Radial Circle Gauge */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80">
              <HealthGauge score={repoData.healthScore} size={135} strokeWidth={11} />
              <span className="text-xs text-slate-400 font-medium mt-3">Overall Code Score</span>
            </div>

            {/* Score Breakdown Metrics */}
            <div className="sm:col-span-7 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Code Quality</span>
                  <span className="font-bold text-emerald-400">{repoData.scoreBreakdown.codeQuality}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${repoData.scoreBreakdown.codeQuality}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Security</span>
                  <span className="font-bold text-amber-400">{repoData.scoreBreakdown.security}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${repoData.scoreBreakdown.security}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Performance</span>
                  <span className="font-bold text-indigo-400">{repoData.scoreBreakdown.performance}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${repoData.scoreBreakdown.performance}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Maintainability</span>
                  <span className="font-bold text-purple-400">{repoData.scoreBreakdown.maintainability}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${repoData.scoreBreakdown.maintainability}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Testing</span>
                  <span className="font-bold text-blue-400">{repoData.scoreBreakdown.testing}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${repoData.scoreBreakdown.testing}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Languages Breakdown Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Languages Breakdown</h3>

          {/* Segmented Multi-Color Progress Bar */}
          <div className="space-y-4">
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
              {repoData.languages.map((lang, idx) => (
                <div 
                  key={idx}
                  style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                  className="h-full transition-all"
                  title={`${lang.name}: ${lang.percentage}%`}
                />
              ))}
            </div>

            <div className="space-y-2.5 pt-2">
              {repoData.languages.map((lang, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color }}></div>
                    <span className="font-medium text-slate-300">{lang.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-400">{lang.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Total Lines of Code:</span>
            <span className="font-mono font-bold text-indigo-300">{repoData.linesOfCode}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
