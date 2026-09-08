
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import WebsiteLoader from './components/Loader/WebsiteLoader';
import Hero from './components/Hero/Hero';
import Convergence from './components/Convergence/Convergence';
import AboutImages from './components/AboutImages/AboutImages';
import AnalysisWorkspace from './components/AnalysisWorkspace/AnalysisWorkspace';
import ChatPanel from './components/Chatbot/ChatPanel';
import ChatToggle from './components/Chatbot/ChatToggle';
import SiteLoader from './components/ui/SiteLoader';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 1200);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

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

      <footer className="relative z-10 border-t border-white/10 bg-[#070a12]/80 px-6 py-10 backdrop-blur-md sm:px-10 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <a href="#overview" className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                LUNA-MATCH
              </a>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
                Finding the same place on the Moon, even when the light, scale, and sensor change.
              </p>
              <div className="mt-5 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.65)]" />
                Mission ready
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600">The mission</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Multimodal lunar image correspondence for Chandrayaan-2 data.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                Built for Smart India Hackathon 2026 · SIH26166
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-5 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 LUNA-MATCH</span>
            <span className="font-mono uppercase tracking-[0.14em]">Chandrayaan-2 · Lunar intelligence</span>
          </div>
        </div>
      </footer>

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
