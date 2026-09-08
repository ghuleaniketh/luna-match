import { Paperclip, Send, X } from 'lucide-react';
import { useRef } from 'react';

export default function ChatInput({
  value,
  onChange,
  onSend,
  attachments = [],
  attachment = null,
  onAttach,
  onRemoveAttachment,
  disabled = false
}) {
  const fileInputRef = useRef(null);
  const effectiveAttachments = attachments.length > 0 ? attachments : (attachment ? [attachment] : []);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  const canSend = !disabled && (Boolean(value.trim()) || effectiveAttachments.length >= 2);

  return (
    <div className="border-t border-white/10 bg-[#080f1d]/95 p-3">
      {effectiveAttachments.length > 0 && (
        <div className="mb-2 flex flex-col gap-1.5">
          {effectiveAttachments.map((att, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-1.5">
              <img src={att.preview} alt={`Attachment ${idx + 1}`} className="h-9 w-9 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-cyan-950/80 px-1 py-0.5 text-[9px] font-mono text-cyan-300 border border-cyan-400/30">
                    {idx === 0 ? 'Image 1 (Source)' : 'Image 2 (Ref)'}
                  </span>
                  <p className="truncate text-[11px] text-slate-200">{att.name}</p>
                </div>
                <p className="text-[9px] text-cyan-300/70">
                  {effectiveAttachments.length >= 2 ? 'Ready for paired registration' : 'Attach 2nd image or type prompt'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveAttachment(idx)}
                className="rounded-md p-1 text-slate-500 hover:bg-white/10 hover:text-slate-200"
                aria-label="Remove attachment"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-[#030712] p-2 focus-within:border-cyan-400/50">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.[0]) {
              onAttach(event.target.files[0]);
              event.target.value = '';
            }
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={effectiveAttachments.length >= 2}
          className="mb-0.5 rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/10 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Attach lunar image"
        >
          <Paperclip size={16} />
        </button>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={
            effectiveAttachments.length >= 2
              ? 'Click send to register or type custom query...'
              : 'Ask LUNA AI about your lunar images...'
          }
          className="max-h-24 min-h-8 flex-1 resize-none bg-transparent px-1 py-1.5 text-xs leading-relaxed text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          className="mb-0.5 rounded-lg bg-cyan-400 p-2 text-[#030712] transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </div>
      <p className="mt-2 text-center text-[10px] text-slate-600">Connected to In-Process LUNA-MATCH Core Engine & Qwen-VL</p>
    </div>
  );
}
