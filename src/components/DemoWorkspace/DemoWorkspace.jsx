import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DEMO_PAIRS } from '../../data/demoPairs';
import ImageDropzone from './ImageDropzone';
import RunAnalysisButton from './RunAnalysisButton';
import ResultsGallery from '../ResultsGallery/ResultsGallery';
import { runCorrespondence } from '../../api/lunaMatch';

export default function DemoWorkspace({ onImagesChange }) {
  const [sourceImage, setSourceImage] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const [selectedDemoId, setSelectedDemoId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState(null);

  const handleSelectDemo = (demo) => {
    setSelectedDemoId(demo.id);
    setSourceImage(demo.sourceImage);
    setReferenceImage(demo.referenceImage);
    setIsCompleted(false);
    setResult(null);
    onImagesChange?.(demo.sourceImage, demo.referenceImage);
  };

  const handleSourceChange = (img) => {
    setSourceImage(img);
    setIsCompleted(false);
    setResult(null);
    onImagesChange?.(img, referenceImage);
  };

  const handleReferenceChange = (img) => {
    setReferenceImage(img);
    setIsCompleted(false);
    setResult(null);
    onImagesChange?.(sourceImage, img);
  };

  const handleRun = async () => {
    if (!sourceImage || !referenceImage) return;
    setIsProcessing(true);
    setResult(null);
    try {
      const res = await runCorrespondence(sourceImage, referenceImage);
      setResult(res);
      setIsCompleted(true);
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setIsCompleted(false);
    setResult(null);
    setSelectedDemoId(null);
    setSourceImage(null);
    setReferenceImage(null);
    onImagesChange?.(null, null);
  };

  return (
    <section id="demo" className="relative py-20 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-10 text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3 block">
          Live Demonstration
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white">
          Lunar Image Correspondence Engine
        </h2>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Select a benchmark test pair or upload your own Chandrayaan-2 images (OHRC / TMC-2 / IIRS).
          The AI Orchestrator will register them with sub-pixel precision.
        </p>
      </div>

      {/* Workspace Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
        <ImageDropzone
          sourceImage={sourceImage}
          referenceImage={referenceImage}
          onSourceChange={handleSourceChange}
          onReferenceChange={handleReferenceChange}
          selectedDemoId={selectedDemoId}
          onSelectDemo={handleSelectDemo}
        />

        <div className="mt-8">
          <RunAnalysisButton
            onRun={handleRun}
            onReset={handleReset}
            isProcessing={isProcessing}
            isCompleted={isCompleted}
            disabled={!sourceImage || !referenceImage}
          />
        </div>

        <AnimatePresence>
          <ResultsGallery result={result} isVisible={isCompleted && !!result} />
        </AnimatePresence>
      </div>
    </section>
  );
}
