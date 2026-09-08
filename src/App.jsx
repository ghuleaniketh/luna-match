import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Hero from './components/Hero/Hero';
import DemoWorkspace from './components/DemoWorkspace/DemoWorkspace';
import PipelineVisualizer from './components/PipelineVisualizer/PipelineVisualizer';
import ChatPanel from './components/Chatbot/ChatPanel';
import ChatToggle from './components/Chatbot/ChatToggle';

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  // Track images selected in DemoWorkspace so ChatPanel can include them in queries
  const [chatImages, setChatImages] = useState({ source: null, reference: null });

  const handleImagesChange = (source, reference) => {
    setChatImages({ source, reference });
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative space-grid">
      <main className="flex-1">
        {/* Hero section with 3D moon */}
        <Hero />

        {/* Interactive Demo Workspace */}
        <DemoWorkspace onImagesChange={handleImagesChange} />

        {/* 5-Stage Pipeline Visualizer */}
        <section id="pipeline" className="py-16 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3 block">
              Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">5-Stage AI Pipeline</h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              From raw multi-sensor input to sub-pixel aligned output — end-to-end.
            </p>
          </div>
          <PipelineVisualizer />
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-6 sm:px-10 md:px-16 max-w-5xl mx-auto text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3 block">About</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">SIH 2026 · Problem SIH26166</h2>
          <p className="text-slate-400 max-w-3xl mx-auto text-sm sm:text-base leading-relaxed">
            LUNA-MATCH is developed for Smart India Hackathon 2026 to solve multi-modal, sun-angle and scale-invariant
            image correspondence using Chandrayaan-2 optical imagery (OHRC, TMC-2, IIRS). The system combines a deep
            Core ML registration engine with a Qwen3-VL multimodal AI Layer featuring RAG-grounded explanations,
            enabling both automated precision registration and natural-language scientific interpretation.
          </p>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'RMSE', value: '< 0.42 px', sub: 'Sub-pixel accuracy' },
              { label: 'Sensors', value: '3', sub: 'OHRC · TMC-2 · IIRS' },
              { label: 'Knowledge', value: '7 Domains', sub: 'RAG Knowledge Base' },
              { label: 'Tests', value: '20 Passed', sub: 'Automated test suite' },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <div className="text-2xl font-black text-cyan-400">{stat.value}</div>
                <div className="text-xs font-mono uppercase text-slate-500 mt-1">{stat.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 font-mono">
        LUNA-MATCH · SIH26166 · Chandrayaan-2 Multimodal Image Correspondence · Built for Smart India Hackathon 2026
      </footer>

      {/* Floating Chatbot */}
      <AnimatePresence>
        {chatOpen && (
          <ChatPanel
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
            sourceImage={chatImages.source}
            referenceImage={chatImages.reference}
          />
        )}
      </AnimatePresence>
      <ChatToggle isOpen={chatOpen} onToggle={() => setChatOpen((prev) => !prev)} />
import Convergence from './components/Convergence/Convergence';
import AboutImages from './components/AboutImages/AboutImages';
import AnalysisWorkspace from './components/AnalysisWorkspace/AnalysisWorkspace';
import ChatPanel from './components/Chatbot/ChatPanel';
import ChatToggle from './components/Chatbot/ChatToggle';
import SiteLoader from './components/ui/SiteLoader';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#09090b] text-zinc-100">
      <SiteLoader />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden space-grid"
      >
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-100"
          src="/backgoundvideo.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/75 via-[#09090b]/55 to-[#09090b]/90" />
      </div>

      <main className="relative z-10 flex-1">
        <Hero />
        <Convergence />
        <AboutImages />
        <AnalysisWorkspace />
      </main>

      <AnimatePresence>
        {isChatOpen && (
          <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        )}
      </AnimatePresence>
      <ChatToggle
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((open) => !open)}
      />
    </div>
  );
}
