import React from 'react';
import Hero from './components/Hero/Hero';
import Convergence from './components/Convergence/Convergence';
import AnalysisWorkspace from './components/AnalysisWorkspace/AnalysisWorkspace';

export default function App() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#030712] text-slate-100">
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/60 via-[#030712]/40 to-[#030712]/75" />
      </div>

      <main className="relative z-10 flex-1">
        <Hero />
        <Convergence />
        <AnalysisWorkspace />
      </main>
    </div>
  );
}
