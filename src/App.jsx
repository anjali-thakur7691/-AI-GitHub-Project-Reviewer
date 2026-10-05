import React, { useEffect, useState } from 'react';
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
import { analyzeRepository, getAnalysisHistory, getBackendHealth, getCurrentUser, getDefaultAnalysis, logoutAccount } from './api';

import { initialRepoData } from './data/mockData';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [repoData, setRepoData] = useState(initialRepoData);
  const [selectedIssue, setSelectedIssue] = useState(initialRepoData.issues[0]);
  const [repoUrl, setRepoUrl] = useState('https://github.com/vercel/next.js');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [aiConfigured, setAiConfigured] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  useEffect(() => {
    getDefaultAnalysis()
      .then(data => {
        setRepoData(data);
        setSelectedIssue(data.issues?.[0] || null);
        if (data.url) setRepoUrl(data.url);
      })
      .catch(() => {
        // Keep the local sample view available if the API is temporarily offline.
      });
    getCurrentUser().then(({ user }) => {
      setCurrentUser(user);
      if (user) getAnalysisHistory().then(({ analyses }) => setAnalysisHistory(analyses)).catch(() => {});
    }).catch(() => setCurrentUser(null));
    getBackendHealth().then(({ aiConfigured: configured }) => setAiConfigured(configured)).catch(() => setAiConfigured(false));
  }, []);

  // Send repository URLs to the Python analyzer and render its response.
  const handleAnalyze = async (url) => {
    setAnalysisError('');
    setIsAnalyzing(true);
    setRepoUrl(url);
    try {
      const analysis = await analyzeRepository(url);
      setRepoData(analysis);
      setSelectedIssue(analysis.issues?.[0] || null);
      if (currentUser) getAnalysisHistory().then(({ analyses }) => setAnalysisHistory(analyses)).catch(() => {});
      setCurrentView('dashboard');
    } catch (error) {
      setAnalysisError(error.message || 'Repository analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    try { await logoutAccount(); } catch { /* Clear the local view even if the session has expired. */ }
    setCurrentUser(null);
    setAnalysisHistory([]);
    setCurrentView('landing');
  };

  // Handle fixing an issue and updating project health score dynamically
  const handleApplyFix = (issueId) => {
    setRepoData(prev => {
      const updatedIssues = prev.issues.map(issue => issue.id === issueId ? { ...issue, applied: true } : issue);
      return { ...prev, issues: updatedIssues };
    });
    setSelectedIssue(prev => prev?.id === issueId ? { ...prev, applied: true } : prev);
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
            isAnalyzing={isAnalyzing}
            analysisError={analysisError}
          />
        );

      case 'auth':
        return (
          <AuthView 
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              getAnalysisHistory().then(({ analyses }) => setAnalysisHistory(analyses)).catch(() => setAnalysisHistory([]));
              setCurrentView('dashboard');
            }}
            onBackHome={() => setCurrentView('landing')}
          />
        );

      case 'dashboard':
        return (
          <DashboardView 
            repoData={repoData} 
            setCurrentView={setCurrentView} 
            analysisHistory={analysisHistory}
            onRestoreAnalysis={(analysis) => {
              setRepoData(analysis);
              setSelectedIssue(analysis.issues?.[0] || null);
              setRepoUrl(analysis.url);
              setCurrentView('dashboard');
            }}
          />
        );

      case 'repositories':
        return (
          <DashboardView 
            repoData={repoData} 
            setCurrentView={setCurrentView} 
            analysisHistory={analysisHistory}
            onRestoreAnalysis={(analysis) => {
              setRepoData(analysis);
              setSelectedIssue(analysis.issues?.[0] || null);
              setRepoUrl(analysis.url);
              setCurrentView('dashboard');
            }}
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
              <p>AI Assistant: <span className={`font-bold ${aiConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>{aiConfigured ? 'Gemini connected' : 'Context demo mode'}</span></p>
              <p>API keys are read by the backend from the <span className="font-mono text-indigo-400">GEMINI_API_KEY</span> environment variable.</p>
              <p>Scan Method: <span className="font-bold text-emerald-400">Built-in source-pattern heuristics</span></p>
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
          isAnalyzing={isAnalyzing}
          analysisError={analysisError}
          user={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic View */}
        <main className="flex-1 overflow-y-auto">
          {renderMainView()}
        </main>
      </div>
    </div>
  );
}
