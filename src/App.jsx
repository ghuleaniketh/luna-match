import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Hero from './components/Hero/Hero';
import Convergence from './components/Convergence/Convergence';
import AboutImages from './components/AboutImages/AboutImages';
import AnalysisWorkspace from './components/AnalysisWorkspace/AnalysisWorkspace';
import ChatPanel from './components/Chatbot/ChatPanel';
import ChatToggle from './components/Chatbot/ChatToggle';
import SiteLoader from './components/ui/SiteLoader';
import Footer from './components/Footer/Footer';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatImages, setChatImages] = useState({ source: null, reference: null });

  return (
    <div className="relative flex min-h-screen flex-col bg-[#09090b] text-zinc-100">
      <SiteLoader />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden space-grid">
        <video className="absolute inset-0 h-full w-full object-cover opacity-100" src="/backgoundvideo.mp4" autoPlay muted loop playsInline />
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/75 via-[#09090b]/55 to-[#09090b]/90" />
      </div>

      <main className="relative z-10 flex-1">
        <Hero />
        <Convergence />
        <AboutImages />
        <AnalysisWorkspace onImagesChange={setChatImages} />
      </main>
      <Footer />

      <AnimatePresence>
        {isChatOpen && (
          <ChatPanel
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            sourceImage={chatImages.source}
            referenceImage={chatImages.reference}
          />
        )}
      </AnimatePresence>
      <ChatToggle isOpen={isChatOpen} onToggle={() => setIsChatOpen((open) => !open)} />
    </div>
  );
}
