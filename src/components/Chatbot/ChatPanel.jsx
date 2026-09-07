import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

const MotionCard = motion(Card);

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'bot',
    text: "Hello! I'm Luna-Copilot, your assistant for the LUNA-MATCH Lunar Correspondence Engine. Ask me anything about illumination invariance, keypoint transformers, or homography models!",
    timestamp: '12:00'
  }
];

const SUGGESTED_QUESTIONS = [
  "How do you handle shadow changes?",
  "What is the Homography RMSE error?",
  "Can you match SAR to optical images?",
  "Explain the 5-stage pipeline"
];

export default function ChatPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Mock response intelligence based on query keywords
    setTimeout(() => {
      let reply = "Our architecture uses self-attention transformers trained on synthetic DEM lunar terrain to produce illumination-invariant descriptors.";
      const q = query.toLowerCase();

      if (q.includes('shadow') || q.includes('illumination')) {
        reply = "Luna-Match utilizes Phase-Angle Normalized Feature Embeddings (PAN-FE). Even when crater shadows invert 180°, structural crater rim geometries are matched using high-order curvature gradients.";
      } else if (q.includes('rmse') || q.includes('error') || q.includes('precision')) {
        reply = "Our sub-pixel refinement stage achieves an average RMSE of <0.42 pixels by deploying iterative Lucas-Kanade optical flow on local image patches.";
      } else if (q.includes('sar') || q.includes('optical') || q.includes('modal')) {
        reply = "Yes! For permanently shadowed regions (PSR) like the Lunar South Pole (Shackleton), our cross-modal weights align synthetic aperture radar (SAR) backscatter with laser altimeter (LOLA/LiDAR) topology.";
      } else if (q.includes('pipeline') || q.includes('stages')) {
        reply = "The pipeline consists of: (1) CLAHE Preprocessing, (2) Deep LunaNet Keypoint Extraction, (3) Sinkhorn Optimal Transport Correspondence, (4) USAC-MAGSAC Geometric Verification, and (5) Sub-pixel Patch Refinement.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <MotionCard
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      className="fixed bottom-24 right-6 z-50 flex h-[520px] w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border-slate-800 bg-slate-950/95 shadow-2xl ring-1 ring-cyan-500/20"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Luna-Copilot <Badge className="px-1.5 py-0.5 text-[10px]">AI Model</Badge>
            </h4>
            <p className="text-[11px] text-emerald-400 font-mono">● Online & Ready</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 cursor-pointer"
          aria-label="Close assistant"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                msg.sender === 'user' ? 'bg-cyan-600 text-slate-950 font-bold' : 'bg-slate-800 text-cyan-400 border border-slate-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}
            >
              <p>{msg.text}</p>
              <span className={`block text-[10px] mt-1 text-right font-mono ${msg.sender === 'user' ? 'text-slate-800' : 'text-slate-500'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

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
          <Button
            type="button"
            size="sm"
            variant="outline"
            key={i}
            onClick={() => handleSend(q)}
            className="h-auto shrink-0 cursor-pointer rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] hover:border-cyan-500/40 hover:bg-slate-800"
          >
            {q}
          </Button>
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
        <Input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about correspondence models..."
          className="h-9 flex-1 rounded-xl px-3.5 py-2 text-xs font-sans"
        />
        <Button
          type="submit"
          disabled={!inputText.trim()}
          size="icon"
          className="h-9 w-9 cursor-pointer rounded-xl"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </MotionCard>
  );
}
