import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, X, BookOpen, Cpu, Eye } from 'lucide-react';
import { sendChat, checkHealth } from '../../api/lunaMatch';

const INITIAL_MESSAGES = [
  {
    id: 1,
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
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[560px] bg-slate-950/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-2xl z-50 flex flex-col overflow-hidden ring-1 ring-cyan-500/20"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
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

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono pl-9">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
          </div>
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
  );
}
