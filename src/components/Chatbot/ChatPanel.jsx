import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, X, BookOpen, Cpu, Eye } from 'lucide-react';
import { sendChat, checkHealth } from '../../api/lunaMatch';
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
    text: "Hello! I'm Luna-Copilot — your AI assistant for the LUNA-MATCH Chandrayaan-2 image correspondence engine. Ask me about illumination invariance, RMSE, sub-pixel accuracy, OHRC/TMC-2/IIRS sensors, or upload images for live analysis!",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    intent: null,
  },
];

const SUGGESTED_QUESTIONS = [
  'What is OHRC resolution?',
  'Explain RMSE in registration',
  'How does RANSAC work?',
  'What is sub-pixel accuracy?',
];

const INTENT_BADGE = {
  rag_knowledge: { label: 'RAG', icon: <BookOpen className="w-3 h-3" />, color: 'text-emerald-400 bg-emerald-950 border-emerald-800' },
  analyze_image: { label: 'VLM', icon: <Eye className="w-3 h-3" />, color: 'text-purple-400 bg-purple-950 border-purple-800' },
  register_images: { label: 'Registration', icon: <Cpu className="w-3 h-3" />, color: 'text-cyan-400 bg-cyan-950 border-cyan-800' },
  explain_registration: { label: 'VLM+RAG', icon: <Sparkles className="w-3 h-3" />, color: 'text-orange-400 bg-orange-950 border-orange-800' },
  compare_images: { label: 'Compare', icon: <Eye className="w-3 h-3" />, color: 'text-blue-400 bg-blue-950 border-blue-800' },
  general_chat: { label: 'Chat', icon: <Bot className="w-3 h-3" />, color: 'text-slate-400 bg-slate-800 border-slate-700' },
};

export default function ChatPanel({ isOpen, onClose, sourceImage = null, referenceImage = null }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null); // null=checking, true, false
  const messagesEndRef = useRef(null);

  // Check backend health when panel opens
  useEffect(() => {
    if (isOpen && backendOnline === null) {
      checkHealth().then((data) => {
        setBackendOnline(data?.status === 'online');
      });
    }
  }, [isOpen, backendOnline]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const appendBotMessage = (text, intent = null, sources = []) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        sender: 'bot',
        text,
        intent,
        sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setIsTyping(false);
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const result = await sendChat(query, sourceImage, referenceImage);
      appendBotMessage(result.text_response, result.intent, result.sources || []);
      setBackendOnline(true);
    } catch (err) {
      // Graceful fallback with keyword-based mock
      setBackendOnline(false);
      const q = query.toLowerCase();
      let fallback =
        'Our architecture uses self-attention transformers trained on synthetic DEM lunar terrain for illumination-invariant descriptors.';
      if (q.includes('ohrc'))
        fallback =
          'OHRC (Orbiter High Resolution Camera) is the most powerful camera on Chandrayaan-2, achieving 0.25 m/pixel resolution at 100 km altitude with a 3 km swath width — enabling detection of objects as small as 25 cm on the lunar surface.';
      else if (q.includes('tmc') || q.includes('terrain'))
        fallback =
          'TMC-2 (Terrain Mapping Camera-2) operates in panchromatic mode with 5 m/pixel resolution and 20 km swath. Its three-lens "triplet stereo" configuration generates Digital Elevation Models (DEMs) of the lunar terrain.';
      else if (q.includes('iirs') || q.includes('spectr'))
        fallback =
          'IIRS (Imaging Infrared Spectrometer) maps the Moon in 256 spectral bands from 0.8–5.0 µm with 80 m/pixel spatial resolution — ideal for mapping OH/H₂O ice deposits and mineralogy.';
      else if (q.includes('rmse') || q.includes('error'))
        fallback =
          'RMSE (Root Mean Square Error) measures registration accuracy in pixels. An RMSE < 0.5 pixels is considered sub-pixel accuracy. LUNA-MATCH achieves RMSE ≈ 0.42 px via Lucas-Kanade optical flow refinement.';
      else if (q.includes('ransac'))
        fallback =
          'RANSAC (Random Sample Consensus) is a robust estimation algorithm used to find the best geometric transformation between matched keypoints while rejecting outlier (incorrectly matched) points.';
      else if (q.includes('sub-pixel') || q.includes('subpixel'))
        fallback =
          'Sub-pixel accuracy means the registration error is smaller than one pixel — typically < 0.5 px. It is achieved through iterative Lucas-Kanade optical flow patch refinement after initial RANSAC alignment.';
      appendBotMessage(fallback, 'rag_knowledge', []);
    }
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
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[560px] bg-slate-950/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-2xl z-50 flex flex-col overflow-hidden ring-1 ring-cyan-500/20"
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
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Luna-Copilot{' '}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                AI Model
              </span>
            </h4>
            <p className={`text-[11px] font-mono ${backendOnline === false ? 'text-yellow-400' : 'text-emerald-400'}`}>
              {backendOnline === null ? '◌ Connecting…' : backendOnline ? '● Online & Ready' : '● Offline Mode (Mock)'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => {
          const badge = msg.intent ? INTENT_BADGE[msg.intent] : null;
          return (
            <div key={msg.id} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-slate-950 font-bold'
                    : 'bg-slate-800 text-cyan-400 border border-slate-700'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className="flex flex-col gap-1 max-w-[78%]">
                {badge && (
                  <span
                    className={`self-start flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-mono ${badge.color}`}
                  >
                    {badge.icon} {badge.label}
                  </span>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right font-mono ${
                      msg.sender === 'user' ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                {/* Source citations */}
                {msg.sources?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {msg.sources.slice(0, 3).map((s, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500 font-mono"
                      >
                        {s.sensor || s.source || 'knowledge'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-900/30 overflow-x-auto whitespace-nowrap flex gap-1.5 no-scrollbar">
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 hover:border-cyan-500/40 transition-colors shrink-0 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Luna-Copilot anything…"
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-sans"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
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
