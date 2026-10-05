import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { sendAssistantMessage } from '../api';

export default function ChatView({ repoData }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      id: 1,
      text: 'Ask me about this repository analysis. I will use the current scan context to answer.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isSending) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: question,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);
    try {
      const result = await sendAssistantMessage({ url: repoData.url, context: repoData, message: question });
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: result.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: `I couldn't reach the assistant service: ${error.message}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsSending(false);
    }
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
            disabled={isSending || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2.5 rounded-lg transition-all shadow-md shadow-indigo-600/30 shrink-0"
          >
            {isSending ? <span className="px-1 text-xs">…</span> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
