import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import LandingView from './views/LandingView';
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import IssuesView from './views/IssuesView';
import FixSuggestionView from './views/FixSuggestionView';
import SecurityView from './views/SecurityView';
import ReportView from './views/ReportView';
import ChatView from './views/ChatView';
import TechStackView from './views/TechStackView';

import { initialRepoData } from './data/mockData';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [repoData, setRepoData] = useState(initialRepoData);
  const [selectedIssue, setSelectedIssue] = useState(initialRepoData.issues[0]);
  const [repoUrl, setRepoUrl] = useState('https://github.com/vercel/next.js');

  // Handle repository analysis trigger
  const handleAnalyze = (url) => {
    setRepoUrl(url);
    const repoParts = url.replace('https://github.com/', '').split('/');
    const repoName = repoParts[1] || repoParts[0] || 'custom-repo';

    setRepoData(prev => ({
      ...prev,
      name: repoName,
      url: url,
      description: `Analysis breakdown for ${repoName} repository.`,
    }));

    setCurrentView('dashboard');
  };

  // Handle fixing an issue and updating project health score dynamically
  const handleApplyFix = (issueId) => {
    setRepoData(prev => {
      const updatedIssues = prev.issues.map(iss => 
        iss.id === issueId ? { ...iss, applied: true } : iss
      );
      return {
        ...prev,
        healthScore: Math.min(100, prev.healthScore + 6),
        scoreBreakdown: {
          ...prev.scoreBreakdown,
          security: Math.min(100, prev.scoreBreakdown.security + 11)
        },
        issues: updatedIssues
      };
    });
  };

  const handleSelectIssue = (issue) => {
    setSelectedIssue(issue);
    setCurrentView('fix-suggestion');
  };

  // Render view router
  const renderMainView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingView 
            onAnalyze={handleAnalyze} 
            onGetStarted={() => setCurrentView('auth')} 
          />
        );

      case 'auth':
        return (
          <AuthView 
            onLoginSuccess={() => setCurrentView('dashboard')} 
          />
        );

      case 'dashboard':
        return (
          <DashboardView 
            repoData={repoData} 
            setCurrentView={setCurrentView} 
          />
        );

      case 'repositories':
        return (
          <DashboardView 
            repoData={repoData} 
            setCurrentView={setCurrentView} 
          />
        );

      case 'issues':
        return (
          <IssuesView 
            repoData={repoData} 
            onSelectIssue={handleSelectIssue} 
            setCurrentView={setCurrentView} 
          />
        );

      case 'fix-suggestion':
        return (
          <FixSuggestionView 
            issue={selectedIssue} 
            onBack={() => setCurrentView('issues')} 
            onApplyFix={handleApplyFix} 
          />
        );

      case 'security':
        return (
          <SecurityView 
            repoData={repoData} 
            onSelectFinding={(item) => {
              const matched = repoData.issues.find(i => i.title.toLowerCase().includes(item.title.toLowerCase()));
              if (matched) setSelectedIssue(matched);
              setCurrentView('fix-suggestion');
            }} 
          />
        );

      case 'reports':
        return (
          <ReportView 
            repoData={repoData} 
          />
        );

      case 'chat':
        return (
          <ChatView 
            repoData={repoData} 
          />
        );

      case 'tech-stack':
        return (
          <TechStackView 
            setCurrentView={setCurrentView} 
          />
        );

      case 'settings':
        return (
          <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 text-xs text-slate-300">
              <p>API Integration Key: <span className="font-mono text-indigo-400">cl_live_9988223311</span></p>
              <p>Scan Sensitivity Level: <span className="font-bold text-emerald-400">Strict (OWASP Top 10)</span></p>
              <p>PDF Export Format: <span className="font-bold text-slate-200">Executive Briefing</span></p>
            </div>
          </div>
        );

      default:
        return <DashboardView repoData={repoData} setCurrentView={setCurrentView} />;
    }
  };

  // If on landing page or auth page, hide sidebar/navbar for full screen immersion
  if (currentView === 'landing' || currentView === 'auth') {
    return renderMainView();
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sidebar matching reference UI */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        activeRepo={repoData.name} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          repoUrl={repoUrl} 
          setRepoUrl={setRepoUrl} 
          onAnalyze={handleAnalyze} 
        />

        {/* Dynamic View */}
        <main className="flex-1 overflow-y-auto">
          {renderMainView()}
        </main>
      </div>
    </div>
  );
}
