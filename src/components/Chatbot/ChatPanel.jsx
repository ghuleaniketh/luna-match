import { AnimatePresence, motion } from 'framer-motion';
import { Bot, BookOpen, ChevronDown, ChevronUp, CircleHelp, Cpu, Eye, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { checkHealth, sendChat } from '../../api/lunaMatch';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import RegistrationResultCard from './RegistrationResultCard';
import TypingIndicator from './TypingIndicator';

const SUGGESTED_QUESTIONS = ['What is OHRC resolution?', 'Explain RMSE in registration', 'How does RANSAC work?', 'What is sub-pixel accuracy?'];
const QUICK_ACTIONS = ['Explain Result', 'Analyze Matches', 'Explain RMSE', 'Compare Images'];
const INTENT_BADGE = {
  rag_knowledge: { label: 'RAG', icon: <BookOpen size={12} />, color: 'text-emerald-400 bg-emerald-950 border-emerald-800' },
  analyze_image: { label: 'VLM', icon: <Eye size={12} />, color: 'text-purple-400 bg-purple-950 border-purple-800' },
  register_images: { label: 'Registration', icon: <Cpu size={12} />, color: 'text-cyan-400 bg-cyan-950 border-cyan-800' },
  explain_registration: { label: 'VLM+RAG', icon: <Sparkles size={12} />, color: 'text-orange-400 bg-orange-950 border-orange-800' },
  compare_images: { label: 'Compare', icon: <Eye size={12} />, color: 'text-blue-400 bg-blue-950 border-blue-800' },
  general_chat: { label: 'Chat', icon: <Bot size={12} />, color: 'text-slate-400 bg-slate-800 border-slate-700' },
};

function createMessage(sender, text, extra = {}) {
  return { id: `${sender}-${Date.now()}-${Math.random()}`, sender, text, timestamp: sender === 'user' ? 'Just now' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), ...extra };
}

export default function ChatPanel({ isOpen, onClose, sourceImage = null, referenceImage = null }) {
  const [messages, setMessages] = useState([
    createMessage('bot', "Hello! I'm LUNA AI.\n\nI can answer lunar science questions, explain registration results, and analyze the images selected in the workspace.", { id: 'welcome', timestamp: 'Ready now' }),
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen || backendOnline !== null) return;
    checkHealth().then((data) => setBackendOnline(data?.status === 'ok' || data?.status === 'online'));
  }, [isOpen, backendOnline]);

  useEffect(() => {
    if (isOpen && !isMinimized) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (text = inputText) => {
    const query = text.trim();
    if (!query || isTyping) return;

    setMessages((current) => [...current, createMessage('user', query)]);
    setInputText('');
    setIsTyping(true);

    try {
      const result = await sendChat(query, attachment?.dataUrl || sourceImage, referenceImage);
      setMessages((current) => [...current, createMessage('bot', result.text_response, {
        intent: result.intent,
        sources: result.sources || [],
        registrationResult: result.registration_result,
      })]);
      setBackendOnline(true);
    } catch (error) {
      setBackendOnline(false);
      setMessages((current) => [...current, createMessage('bot', `I could not reach the LUNA-MATCH backend. ${error.message}`)]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAttach = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setAttachment({ name: file.name, preview: URL.createObjectURL(file), dataUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    setAttachment(null);
  };

  if (!isOpen) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`fixed right-4 top-4 z-50 flex w-[min(460px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#050b17]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl ${isMinimized ? 'bottom-auto h-auto' : 'bottom-4 h-[min(720px,calc(100vh-2rem))]'}`}
      aria-label="LUNA AI assistant"
    >
      <header className="flex items-center justify-between border-b border-white/10 bg-white/[0.035] px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-950/70 text-cyan-300"><Bot size={18} /></div>
          <div className="min-w-0">
            <div className="flex items-center gap-2"><h2 className="truncate text-sm font-semibold tracking-wide text-slate-100">LUNA AI</h2><span className="rounded border border-cyan-400/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-cyan-300/80">Assistant</span></div>
            <p className="truncate text-[11px] text-slate-500"><span className={backendOnline ? 'text-emerald-400' : 'text-yellow-400'}>●</span> {backendOnline === null ? 'Connecting to backend' : backendOnline ? 'Backend online' : 'Backend unavailable'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1"><HeaderButton label={isMinimized ? 'Expand assistant' : 'Minimize assistant'} onClick={() => setIsMinimized((current) => !current)}>{isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</HeaderButton><HeaderButton label="Close assistant" onClick={onClose}><X size={16} /></HeaderButton></div>
      </header>

      <AnimatePresence initial={false}>
        {!isMinimized && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-600"><CircleHelp size={12} className="text-cyan-400/70" /> Mission support channel</div>
            <div className="space-y-4">
              {messages.map((message) => <div key={message.id}><ChatMessage message={message} /><MessageMeta message={message} /></div>)}
              {messages.length === 1 && <SuggestedQuestions onSelect={handleSend} />}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="border-t border-white/10 bg-[#07101e]/80 px-3 pt-2.5"><div className="flex gap-1.5 overflow-x-auto pb-2 [scrollbar-width:none]">{QUICK_ACTIONS.map((action) => <button key={action} type="button" onClick={() => handleSend(action)} className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-slate-400 transition-colors hover:border-cyan-400/30 hover:text-cyan-200">{action}</button>)}</div></div>
          <ChatInput value={inputText} onChange={setInputText} onSend={() => handleSend()} attachment={attachment} onAttach={handleAttach} onRemoveAttachment={removeAttachment} disabled={isTyping} />
        </motion.div>}
      </AnimatePresence>
    </motion.aside>
  );
}

function MessageMeta({ message }) {
  const badge = message.intent ? INTENT_BADGE[message.intent] : null;
  return <>{badge && <div className="ml-9 mt-1 flex items-center gap-1 text-[10px] font-mono"><span className={`flex items-center gap-1 rounded border px-1.5 py-0.5 ${badge.color}`}>{badge.icon}{badge.label}</span>{message.sources?.slice(0, 2).map((source, index) => <span key={index} className="rounded border border-white/10 px-1.5 py-0.5 text-slate-600">{source.sensor || source.document || 'source'}</span>)}</div>}{message.registrationResult && <RegistrationResultCard result={message.registrationResult} />}</>;
}

function SuggestedQuestions({ onSelect }) {
  return <div className="mt-4 grid grid-cols-2 gap-2 pl-9">{SUGGESTED_QUESTIONS.map((question) => <button key={question} type="button" onClick={() => onSelect(question)} className="rounded-lg border border-white/10 bg-white/[0.025] px-2.5 py-2 text-left text-[10px] leading-snug text-slate-400 transition-colors hover:border-cyan-400/35 hover:bg-cyan-950/30 hover:text-cyan-100">{question}</button>)}</div>;
}

function HeaderButton({ label, onClick, children }) {
  return <button type="button" onClick={onClick} aria-label={label} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-100">{children}</button>;
}
