import React, { useEffect, useRef, useState } from 'react';
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
  ArrowRight,
  VolumeX,
  Mic,
  MicOff
} from 'lucide-react';
import HealthGauge from '../components/HealthGauge';
import { sendAssistantMessage } from '../api';

export default function DashboardView({ repoData, setCurrentView, analysisHistory = [], onRestoreAnalysis }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  const askAssistantByVoice = async (question) => {
    setIsAsking(true);
    setVoiceMessage(`You asked: “${question}” — getting an answer about ${repoData.name}…`);
    try {
      const result = await sendAssistantMessage({ url: repoData.url, context: repoData, message: question });
      const answer = result.response || 'I could not get an answer for that question.';
      setVoiceMessage(`Assistant: ${answer}`);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(answer);
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      setVoiceMessage(`Assistant request failed: ${error.message}`);
    } finally {
      setIsAsking(false);
    }
  };

  const toggleVoiceAssistant = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceMessage('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    if (!('speechSynthesis' in window)) {
      setVoiceMessage('Voice playback is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => { setIsListening(true); setVoiceMessage('Listening… Ask what problems were found or how to fix them.'); };
    recognition.onresult = (event) => {
      const question = event.results?.[0]?.[0]?.transcript?.trim();
      setIsListening(false);
      if (question) askAssistantByVoice(question);
      else setVoiceMessage('I did not catch that. Press the microphone and try again.');
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceMessage(event.error === 'not-allowed' ? 'Microphone permission is blocked. Allow microphone access in your browser.' : 'Could not hear that. Check your microphone and try again.');
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setVoiceMessage('Starting microphone…');
    try { recognition.start(); }
    catch { setIsListening(false); setVoiceMessage('Microphone could not start. Please try again.'); }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Repository Analysis</h1>
          <p className="text-xs text-slate-400 mt-1">Repository health estimates and code structure insights.</p>
          {repoData.isSample && <p className="mt-2 inline-flex rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">Sample dashboard data — analyze a repository for live results</p>}
        </div>

        <button 
          onClick={() => setCurrentView('issues')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-2"
        >
          <span>View All Issues</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-5">
        <div>
          <h2 className="text-sm font-bold text-white">Voice AI assistant</h2>
          <p className="mt-1 text-xs text-slate-400">Ask aloud about problems in this scan; the assistant answers using this repository’s findings.</p>
          {voiceMessage && <p aria-live="polite" className="mt-2 text-xs text-indigo-300">{voiceMessage}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={toggleVoiceAssistant} disabled={isAsking} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50">
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isListening ? 'Stop listening' : 'Ask by voice'}
          </button>
          {isSpeaking && <button type="button" onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"><VolumeX className="h-4 w-4" />Stop reply</button>}
        </div>
      </section>

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
            <span>{repoData.isSample ? 'Estimated Lines of Code:' : 'Lines in scanned files:'}</span>
              <span className="font-mono font-bold text-indigo-300">{repoData.linesOfCode}</span>
          </div>
        </div>
      </div>

      {analysisHistory.length > 0 && <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">Saved Repository Analyses</h2>
            <p className="mt-1 text-xs text-slate-400">Your recent scans are stored in the local SQLite database.</p>
          </div>
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">{analysisHistory.length} recent</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {analysisHistory.map(item => <button
            key={item.id}
            type="button"
            onClick={() => onRestoreAnalysis?.(item.result)}
            className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left transition-colors hover:border-indigo-500/60"
          >
            <span className="block truncate text-xs font-semibold text-slate-200">{item.name}</span>
            <span className="mt-1 block truncate font-mono text-[10px] text-slate-500">{item.url}</span>
            <span className="mt-2 block text-[10px] text-slate-400">{new Date(item.createdAt * 1000).toLocaleString()}</span>
          </button>)}
        </div>
      </section>}
    </div>
  );
}
