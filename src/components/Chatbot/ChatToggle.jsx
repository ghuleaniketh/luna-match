import React from 'react';
import { Bot, X } from 'lucide-react';

export default function ChatToggle({ isOpen, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl transition-all duration-300 cursor-pointer group ${
        isOpen
          ? 'border-white/15 bg-[#07101e] text-slate-200'
          : 'border-blue-300/40 bg-blue-500 text-white font-semibold glow-cyan hover:bg-blue-400 active:scale-95'
      }`}
      aria-label="Toggle AI Assistant"
    >
      {isOpen ? (
        <>
          <X className="w-5 h-5 text-slate-200" />
          <span className="pr-1 text-xs font-medium">Close LUNA AI</span>
        </>
      ) : (
        <>
          <div className="relative">
            <Bot className="w-5 h-5 text-slate-950" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-amber-300 ring-2 ring-blue-500" />
          </div>
          <span className="text-xs font-bold tracking-wide">Ask LUNA AI</span>
        </>
      )}
    </button>
  );
}
