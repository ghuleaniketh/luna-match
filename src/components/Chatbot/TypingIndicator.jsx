import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/25 bg-cyan-950/70 text-cyan-300">
        <Bot size={14} />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.045] px-3.5 py-3">
        {[0, 1, 2].map((index) => (
          <span key={index} className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300" style={{ animationDelay: `${index * 140}ms` }} />
        ))}
        <span className="ml-1 text-[10px] text-slate-500">LUNA AI is thinking</span>
      </div>
    </div>
  );
}
