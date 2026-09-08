import { Paperclip, Send, X } from 'lucide-react';
import { useRef } from 'react';

export default function ChatInput({ value, onChange, onSend, attachment, onAttach, onRemoveAttachment, disabled = false }) {
  const fileInputRef = useRef(null);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-white/10 bg-[#080f1d]/95 p-3">
      {attachment && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2">
          <img src={attachment.preview} alt="Selected lunar image" className="h-10 w-10 rounded-md object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-slate-200">{attachment.name}</p>
            <p className="text-[10px] text-cyan-300/70">Ready for image context</p>
          </div>
          <button type="button" onClick={onRemoveAttachment} className="rounded-md p-1 text-slate-500 hover:bg-white/10 hover:text-slate-200" aria-label="Remove attachment">
            <X size={14} />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-[#030712] p-2 focus-within:border-cyan-400/50">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => onAttach(event.target.files?.[0])} />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="mb-0.5 rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/10 hover:text-cyan-300" aria-label="Attach lunar image">
          <Paperclip size={16} />
        </button>
        <textarea value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={handleKeyDown} disabled={disabled} rows={1} placeholder="Ask LUNA AI about your lunar images..." className="max-h-24 min-h-8 flex-1 resize-none bg-transparent px-1 py-1.5 text-xs leading-relaxed text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-50" />
        <button type="button" onClick={onSend} disabled={disabled || !value.trim()} className="mb-0.5 rounded-lg bg-cyan-400 p-2 text-[#030712] transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Send message">
          <Send size={15} />
        </button>
      </div>
      <p className="mt-2 text-center text-[10px] text-slate-600">Images are sent to the configured LUNA-MATCH AI service with your message.</p>
    </div>
  );
}
