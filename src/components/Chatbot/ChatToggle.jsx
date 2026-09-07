import React from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from '../ui/button';

export default function ChatToggle({ isOpen, onToggle }) {
  return (
    <Button
      onClick={onToggle}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl transition-all duration-300 cursor-pointer group ${
        isOpen
          ? 'border-white/15 bg-[#07101e] text-slate-200'
          : 'border-cyan-300/30 bg-cyan-400 text-slate-950 font-bold glow-cyan hover:bg-cyan-300 active:scale-95'
      variant={isOpen ? 'secondary' : 'default'}
      className={`group fixed bottom-6 right-6 z-50 rounded-2xl p-4 shadow-2xl transition-all duration-300 ${
        isOpen
          ? 'border-slate-700 bg-slate-800 text-slate-200'
          : 'bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-slate-950 glow-cyan hover:scale-105 active:scale-95'
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
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-orange-400 ring-2 ring-cyan-400" />
          </div>
          <span className="text-xs font-bold tracking-wide">Ask LUNA AI</span>
        </>
      )}
    </Button>
  );
}
