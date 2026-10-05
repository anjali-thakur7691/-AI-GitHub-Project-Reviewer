import React from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  FileText, 
  MessageSquare, 
  Settings, 
  ShieldAlert, 
  Sparkles,
  ChevronRight,
  Bot
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, activeRepo }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'repositories', label: 'Repositories', icon: FolderGit2 },
    { id: 'issues', label: 'Code Review & Issues', icon: Sparkles },
    { id: 'security', label: 'Security Scan', icon: ShieldAlert },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0d111a] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div 
          onClick={() => setCurrentView('landing')}
          className="p-4 flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-all border-b border-slate-800/60"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-[0px] shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5 text-white" aria-hidden="true" />
            🧑‍💻
          </div>
          <div>
            <h1 className="font-bold text-xs text-white tracking-tight leading-snug">AI GitHub Project Reviewer</h1>
            <span className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">Security & Review</span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="p-3 space-y-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'issues' && currentView === 'fix-suggestion');
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile at Bottom */}
      <div className="p-4 border-t border-slate-800/80 bg-[#090c13]/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm ring-2 ring-indigo-500/30">
            AT
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-200 truncate">Anjali Thakur</h4>
            <span className="text-[10px] bg-slate-800 text-indigo-300 font-medium px-2 py-0.5 rounded-full inline-block mt-0.5 border border-indigo-500/20">
              Free Plan
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
