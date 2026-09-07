import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ChevronDown, ChevronUp, CircleHelp, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import RegistrationResultCard from './RegistrationResultCard';
import TypingIndicator from './TypingIndicator';

const SUGGESTED_QUESTIONS = [
  'What is LUNA-MATCH?',
  'Explain image registration',
  'What is OHRC?',
  'What is TMC-2?',
  'What does RMSE mean?',
  'Why are some matches rejected?'
];

const QUICK_ACTIONS = ['Explain Result', 'Analyze Matches', 'Explain RMSE', 'Compare Images'];

const INITIAL_MESSAGES = [
  {
    id: 'welcome',
    sender: 'bot',
    text: "Hello! I'm LUNA AI.\n\nI can help you understand lunar imagery, registration results, and the LUNA-MATCH pipeline. Choose a topic below or ask a question to begin.",
    timestamp: 'Ready now'
  }
];

const MOCK_REPLIES = {
  registration: 'Image registration aligns two views of the same lunar region so their features share a common coordinate system. LUNA-MATCH is designed to compare source and reference imagery despite differences in illumination, scale, and sensor characteristics.',
  rmse: 'RMSE, or root mean square error, summarizes the average distance between corresponding points after geometric alignment. Lower values generally indicate tighter registration, but it should be interpreted alongside inlier ratio and visual inspection.',
  ohrc: 'OHRC is the Orbiter High Resolution Camera on Chandrayaan-2. It provides high-resolution lunar surface imagery that can serve as a source or reference in a registration workflow.',
  matches: 'Candidate matches are filtered through geometric verification. Matches that do not agree with the estimated transformation are treated as outliers, which helps keep the registered result reliable.',
  default: 'This is a frontend preview response. The LUNA AI interface is ready to connect to your future chatbot backend for lunar image registration questions.'
};

export default function ChatPanel({ isOpen, onClose, onSendMessage, onImageAttach }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const responseTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isMinimized) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isMinimized]);

  useEffect(() => () => {
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
  }, [attachment]);

  const handleSend = (text = inputText) => {
    const query = text.trim();
    if (!query || isTyping) return;

    onSendMessage?.(query);
    setMessages((current) => [...current, createMessage('user', query)]);
    setInputText('');
    setIsTyping(true);

    responseTimerRef.current = window.setTimeout(() => {
      setMessages((current) => [...current, createMessage('bot', getMockReply(query))]);
      setIsTyping(false);
    }, 700);
  };

  const handleAttach = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const nextAttachment = { name: file.name, preview: URL.createObjectURL(file) };
    setAttachment((current) => {
      if (current?.preview) URL.revokeObjectURL(current.preview);
      return nextAttachment;
    });
    onImageAttach?.(file);
  };

  const removeAttachment = () => {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    setAttachment(null);
  };

  const askQuestion = (question) => setInputText(question);

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
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-950/70 text-cyan-300">
            <Bot size={18} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#050b17]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-semibold tracking-wide text-slate-100">LUNA AI</h2>
              <span className="hidden rounded border border-cyan-400/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-cyan-300/80 sm:inline">Assistant</span>
            </div>
            <p className="truncate text-[11px] text-slate-500"><span className="text-emerald-400">●</span> Lunar Image Registration Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <HeaderButton label={isMinimized ? 'Expand assistant' : 'Minimize assistant'} onClick={() => setIsMinimized((current) => !current)}>
            {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </HeaderButton>
          <HeaderButton label="Close assistant" onClick={onClose}><X size={16} /></HeaderButton>
        </div>
      </header>

      <AnimatePresence initial={false}>
        {!isMinimized && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-600">
                <CircleHelp size={12} className="text-cyan-400/70" />
                Mission support channel
              </div>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    <ChatMessage message={message} />
                    {message.id === 'welcome' && messages.length === 1 && <SuggestedQuestions onSelect={askQuestion} />}
                    {message.showResult && <RegistrationResultCard onViewRegistered={() => askQuestion('Show the registered image')} onViewMatches={() => askQuestion('Show the match points')} />}
                  </div>
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-white/10 bg-[#07101e]/80 px-3 pt-2.5">
              <div className="flex gap-1.5 overflow-x-auto pb-2 [scrollbar-width:none]">
                {QUICK_ACTIONS.map((action) => <button key={action} type="button" onClick={() => askQuestion(action)} className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-slate-400 transition-colors hover:border-cyan-400/30 hover:text-cyan-200">{action}</button>)}
              </div>
            </div>
            <ChatInput value={inputText} onChange={setInputText} onSend={() => handleSend()} attachment={attachment} onAttach={handleAttach} onRemoveAttachment={removeAttachment} disabled={isTyping} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

function SuggestedQuestions({ onSelect }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 pl-9">
      {SUGGESTED_QUESTIONS.map((question) => <button key={question} type="button" onClick={() => onSelect(question)} className="rounded-lg border border-white/10 bg-white/[0.025] px-2.5 py-2 text-left text-[10px] leading-snug text-slate-400 transition-colors hover:border-cyan-400/35 hover:bg-cyan-950/30 hover:text-cyan-100">{question}</button>)}
    </div>
  );
}

function HeaderButton({ label, onClick, children }) {
  return <button type="button" onClick={onClick} aria-label={label} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-100">{children}</button>;
}

function createMessage(sender, text) {
  return { id: `${sender}-${Date.now()}-${Math.random()}`, sender, text, timestamp: sender === 'user' ? 'Just now' : 'Preview response' };
}

function getMockReply(query) {
  const normalized = query.toLowerCase();
  if (normalized.includes('rmse') || normalized.includes('error')) return MOCK_REPLIES.rmse;
  if (normalized.includes('ohrc')) return MOCK_REPLIES.ohrc;
  if (normalized.includes('match') || normalized.includes('reject')) return MOCK_REPLIES.matches;
  if (normalized.includes('registration')) return MOCK_REPLIES.registration;
  return MOCK_REPLIES.default;
}
