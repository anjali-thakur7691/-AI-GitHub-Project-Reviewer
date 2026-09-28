import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Code2, ShieldAlert } from 'lucide-react';

export default function ChatView({ repoData }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: 'What is the biggest security issue in this project?',
      time: '2:45 PM'
    },
    {
      id: 2,
      sender: 'ai',
      text: `The biggest security issue in this project is the hardcoded API key found in /config/database.ts at line 12. This can lead to unauthorized access to your services if the code is exposed.\n\nOther important findings:\n1. 3 potential injection vulnerabilities.\n2. 2 outdated dependencies.\n3. 1 missing input validation.`,
      time: '2:45 PM'
    }
  ]);

  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Generate intelligent AI response based on input query
    setTimeout(() => {
      let replyText = `I have analyzed ${repoData.name} regarding your query. `;
      const query = input.toLowerCase();

      if (query.includes('performance') || query.includes('slow')) {
        replyText += `The main performance bottleneck detected is an inefficient O(N^2) loop in /lib/dataProcessor.js line 45. Replacing it with a Hash Map will improve execution time significantly.`;
      } else if (query.includes('test') || query.includes('coverage')) {
        replyText += `Current test coverage for ${repoData.name} is 76%. We recommend adding unit tests for the /api routes and component render states to hit 85%+.`;
      } else if (query.includes('fix') || query.includes('solve')) {
        replyText += `You can navigate to the "Code Review & Issues" tab in the sidebar, select any issue, and click "Apply Fix" to auto-refactor the code with environment variables or try/catch error handling.`;
      } else {
        replyText += `Repository overview: 1,248 files analyzed, Health Score is ${repoData.healthScore}/100. Overall code quality is high (91/100), but security requires attention due to hardcoded secrets.`;
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 700);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      {/* Header matching Screen 8 */}
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>AI Chat Assistant</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Get answers about your repository, code, and more.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Context: {repoData.name}</span>
        </div>
      </div>

      {/* Messages Scroll Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-md ${
              msg.sender === 'user'
                ? 'bg-indigo-600'
                : 'bg-gradient-to-tr from-purple-600 to-indigo-600'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed shadow-lg ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
            }`}>
              <p className="whitespace-pre-line">{msg.text}</p>
              <span className={`text-[10px] block mt-1 ${msg.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-500'}`}>
                {msg.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input Bar matching Panel 8 screenshot */}
      <form onSubmit={handleSend} className="shrink-0 pt-4 border-t border-slate-800">
        <div className="relative bg-slate-900 border border-slate-700/80 rounded-xl p-2 flex items-center gap-2 shadow-2xl focus-within:border-indigo-500 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this repository..."
            className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none px-3 font-sans"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-lg transition-all shadow-md shadow-indigo-600/30 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
