import { Bot, User } from 'lucide-react';

function MessageText({ text }) {
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, index) => {
        if (line.startsWith('• ')) {
          return (
            <p key={`${line}-${index}`} className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>{line.slice(2)}</span>
            </p>
          );
        }

        if (line.endsWith(':') && line.length < 48) {
          return <p key={`${line}-${index}`} className="font-semibold text-slate-100">{line}</p>;
        }

        return line ? <p key={`${line}-${index}`}>{line}</p> : <span key={`${line}-${index}`} className="block h-1" />;
      })}
    </div>
  );
}

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${isUser ? 'border-cyan-300/50 bg-cyan-400 text-[#030712]' : 'border-cyan-400/25 bg-cyan-950/70 text-cyan-300'}`}>
        {isUser ? <User size={13} /> : <Bot size={14} />}
      </div>
      <div className={`max-w-[84%] rounded-2xl px-3.5 py-3 text-[12px] leading-relaxed ${isUser ? 'rounded-tr-sm bg-cyan-400 font-medium text-[#030712]' : 'rounded-tl-sm border border-white/10 bg-white/[0.045] text-slate-300'}`}>
        <MessageText text={message.text} />
        <p className={`mt-2 text-[10px] font-mono ${isUser ? 'text-slate-700' : 'text-slate-500'}`}>{message.timestamp}</p>
      </div>
    </div>
  );
}
