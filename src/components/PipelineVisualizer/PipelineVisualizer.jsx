import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  Sparkles,
  Layers,
  CheckCircle2,
  Crosshair,
  Check,
  Loader2
} from 'lucide-react';

const ICON_MAP = {
  Sliders,
  Sparkles,
  Layers,
  CheckCircle2,
  Crosshair,
};

export default function PipelineVisualizer({ stages, currentStageIndex, status }) {
  const isProcessing = status === 'processing';
  const isCompleted = status === 'completed';

  return (
    <section id="pipeline" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-40 bg-cyan-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <h3 className="text-xl font-bold text-slate-100">Neural Correspondence Pipeline</h3>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              5-Stage Multi-Illumination Invariant Feature Matching & High-Precision Homography
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Status:</span>
            {isProcessing && (
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Stage {currentStageIndex + 1} of {stages.length}: {stages[currentStageIndex]?.name}
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                <Check className="w-3.5 h-3.5" />
                Pipeline Verified & Aligned
              </span>
            )}
            {status === 'idle' && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                Awaiting Execution
              </span>
            )}
          </div>
        </div>

        {/* 5-Stage Stepper Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
          {stages.map((stage, idx) => {
            const IconComponent = ICON_MAP[stage.icon] || Sparkles;
            const isCurrent = isProcessing && currentStageIndex === idx;
            const isDone = isCompleted || (isProcessing && currentStageIndex > idx);
            const isPending = !isDone && !isCurrent;

            return (
              <div
                key={stage.id}
                className={`relative rounded-2xl p-4 transition-all duration-300 border flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/80 ring-1 ring-cyan-400/50 scale-[1.02]'
                    : isDone
                    ? 'bg-slate-900/90 border-emerald-500/40 text-slate-200'
                    : 'bg-slate-900/30 border-slate-800/80 text-slate-500 opacity-60'
                }`}
              >
                <div>
                  {/* Top indicator & Step number */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">
                      STAGE 0{stage.id}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isCurrent
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400 animate-pulse'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : isCurrent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : stage.id}
                    </div>
                  </div>

                  {/* Icon and Title */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`p-1.5 rounded-lg ${isCurrent ? 'bg-cyan-950 text-cyan-400' : isDone ? 'bg-emerald-950/60 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <h4 className={`text-sm font-bold ${isCurrent ? 'text-cyan-200' : isDone ? 'text-slate-100' : 'text-slate-400'}`}>
                      {stage.name}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    {stage.shortDesc}
                  </p>
                </div>

                {/* Progress bar line for the stage */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
                  <motion.div
                    className={`h-full ${
                      isDone
                        ? 'bg-emerald-500 w-full'
                        : isCurrent
                        ? 'bg-cyan-400'
                        : 'bg-transparent w-0'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: isDone ? '100%' : isCurrent ? '75%' : '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
