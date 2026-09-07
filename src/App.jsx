import React, { useState } from 'react';
import Hero from './components/Hero/Hero';
import ImageDropzone from './components/DemoWorkspace/ImageDropzone';
import RunAnalysisButton from './components/DemoWorkspace/RunAnalysisButton';
import PipelineVisualizer from './components/PipelineVisualizer/PipelineVisualizer';
import BeforeAfterSlider from './components/ResultsGallery/BeforeAfterSlider';
import MatchPointOverlay from './components/ResultsGallery/MatchPointOverlay';
import MetricsCards from './components/ResultsGallery/MetricsCards';
import ChatToggle from './components/Chatbot/ChatToggle';
import ChatPanel from './components/Chatbot/ChatPanel';
import { DEMO_PAIRS } from './data/demoPairs';
import { usePipelineState } from './hooks/usePipelineState';
import { Sparkles, Moon, Satellite, ShieldCheck, Activity, Terminal, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [selectedDemo, setSelectedDemo] = useState(DEMO_PAIRS[0]);
  const [sourceImage, setSourceImage] = useState(DEMO_PAIRS[0].sourceImage);
  const [referenceImage, setReferenceImage] = useState(DEMO_PAIRS[0].referenceImage);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const {
    status,
    stages,
    currentStageIndex,
    results,
    startPipeline,
    resetPipeline,
    isProcessing,
    isCompleted
  } = usePipelineState();

  const handleSelectDemo = (demo) => {
    setSelectedDemo(demo);
    setSourceImage(demo.sourceImage);
    setReferenceImage(demo.referenceImage);
    resetPipeline();
  };

  const handleRun = async () => {
    await startPipeline(sourceImage, referenceImage);
    // Fire festive space confetti on matching success
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#38bdf8', '#f97316', '#ffffff']
      });
    } catch (e) {
      // ignore
    }
  };

  const scrollToWorkspace = () => {
    document.getElementById('demo-workspace')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative space-grid">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Moon className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-cyan-400">
                LUNA-MATCH
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                Vision Benchmark
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <a
              href="#demo-workspace"
              className="text-xs font-medium text-slate-300 hover:text-cyan-400 transition-colors hidden sm:block"
            >
              Workspace
            </a>
            <a
              href="#pipeline"
              className="text-xs font-medium text-slate-300 hover:text-cyan-400 transition-colors hidden sm:block"
            >
              Pipeline Architecture
            </a>
            {isCompleted && (
              <a
                href="#results"
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View Matches &rarr;
              </a>
            )}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-xs font-mono text-cyan-400 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Copilot</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero onExploreDemo={scrollToWorkspace} />

        {/* 2. Demo Workspace Section */}
        <section id="demo-workspace" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Interactive Lunar Match Workspace
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Select one of the benchmark test cases with challenging shadow differences or upload custom lunar orbiter imagery.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
            <ImageDropzone
              sourceImage={sourceImage}
              referenceImage={referenceImage}
              onSourceChange={(img) => {
                setSourceImage(img);
                resetPipeline();
              }}
              onReferenceChange={(img) => {
                setReferenceImage(img);
                resetPipeline();
              }}
              selectedDemoId={selectedDemo?.id}
              onSelectDemo={handleSelectDemo}
            />

            <div className="mt-8 border-t border-slate-800/80 pt-6">
              <RunAnalysisButton
                onRun={handleRun}
                onReset={resetPipeline}
                isProcessing={isProcessing}
                isCompleted={isCompleted}
                disabled={!sourceImage || !referenceImage}
              />
            </div>
          </div>
        </section>

        {/* 3. Pipeline Visualizer */}
        <PipelineVisualizer
          stages={stages}
          currentStageIndex={currentStageIndex}
          status={status}
        />

        {/* 4. Results Gallery (Rendered when completed) */}
        {isCompleted && results && (
          <section id="results" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <h3 className="text-2xl font-bold text-slate-100">Correspondence Registration Output</h3>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Successfully converged homography transform & keypoint matching
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  Job ID: {results.jobId}
                </span>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="mb-6">
              <MetricsCards metrics={results.metrics} />
            </div>

            {/* Side by side dual visualizers: Overlay & Comparison Slider */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MatchPointOverlay
                sourceImage={sourceImage}
                referenceImage={referenceImage}
                matchPoints={results.matchPoints}
              />

              <BeforeAfterSlider
                sourceImage={sourceImage}
                registeredImage={results.registeredImage}
                label="Registered Homography Overlay (Before vs After)"
              />
            </div>
          </section>
        )}
      </main>

      {/* Floating Chatbot Assistant */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
      <ChatToggle
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 LUNA-MATCH Lunar Vision Team. Built for Lunar Image Correspondence Challenge.</p>
          <div className="flex items-center gap-4 text-slate-400 font-mono">
            <span>Powered by Vite + Tailwind + Framer Motion</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
