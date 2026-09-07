import React from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from '../ui/button';

export default function ChatToggle({ isOpen, onToggle, unreadCount = 1 }) {
  return (
    <Button
      onClick={onToggle}
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
    </Button>
  );
}
