import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ChevronRight, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Filter,
  ArrowLeft
} from 'lucide-react';

export default function IssuesView({ repoData, onSelectIssue, setCurrentView }) {
  const [activeTab, setActiveTab] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'All', label: 'All' },
    { id: 'Issues', label: 'Issues (8)' },
    { id: 'Security', label: 'Security (3)' },
    { id: 'Code Quality', label: 'Code Quality (5)' },
    { id: 'Performance', label: 'Performance (2)' },
    { id: 'Maintainability', label: 'Maintainability (8)' },
  ];

  const filteredIssues = repoData.issues.filter(issue => {
    const matchesTab = activeTab === 'All' || activeTab === 'Issues' || issue.category === activeTab;
    const matchesSeverity = severityFilter === 'All' || issue.severity === severityFilter;
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          issue.file.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'High':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">● High</span>;
      case 'Medium':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">● Medium</span>;
      default:
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">● Low</span>;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header (Matching Panel 4 screenshot) */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white tracking-tight">Code Review & Issues</h1>
      </div>

      {/* Category Tabs Bar (Matching Panel 4 in screenshot) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Options & Search Bar (Panel 4) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        {/* Severity Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['All', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                severityFilter === sev
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Issues List Cards (Matching Panel 4 in screenshot) */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">No issues found matching your filters.</p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onSelectIssue(issue)}
              className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl transition-all cursor-pointer flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* Left Severity Indicator */}
                <div className="shrink-0">
                  {issue.severity === 'High' && <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">HIGH</span>}
                  {issue.severity === 'Medium' && <span className="bg-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">MEDIUM</span>}
                  {issue.severity === 'Low' && <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">LOW</span>}
                </div>

                {/* Issue Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {issue.title}
                    </h3>
                    {issue.applied && (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Fixed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {issue.file} <span className="text-slate-500">• Line {issue.line}</span>
                  </p>
                </div>
              </div>

              {/* Right Badges & Navigation Arrow */}
              <div className="flex items-center gap-3">
                <span className="bg-slate-800 text-slate-300 text-[11px] font-medium px-2.5 py-1 rounded-md border border-slate-700">
                  {issue.category}
                </span>
                {getSeverityBadge(issue.severity)}
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
