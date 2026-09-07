import React from 'react';
import { MessageSquare, Bot, Sparkles, X } from 'lucide-react';

export default function ChatToggle({ isOpen, onToggle, unreadCount = 1 }) {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-3 cursor-pointer group ${
        isOpen
          ? 'bg-slate-800 text-slate-200 border border-slate-700'
          : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold glow-cyan hover:scale-105 active:scale-95'
      }`}
      aria-label="Toggle AI Assistant"
    >
      {isOpen ? (
        <>
          <X className="w-5 h-5 text-slate-200" />
          <span className="text-sm font-medium pr-1">Close AI Assistant</span>
        </>
      ) : (
        <>
          <div className="relative">
            <Bot className="w-5 h-5 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-400 rounded-full animate-ping" />
          </div>
          <span className="text-sm font-bold tracking-wide">Ask Luna-Copilot</span>
        </>
      )}
    </button>
  );
}
