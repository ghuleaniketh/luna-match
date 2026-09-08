import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Sliders,
  Sparkles,
  Layers,
  CheckCircle2,
  Crosshair,
  Check,
  Loader2
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';

const ICON_MAP = {
  Sliders,
  Sparkles,
  Layers,
  CheckCircle2,
  Crosshair,
};

export default function PipelineVisualizer({ stages, currentStageIndex, status }) {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.15 });
  const isProcessing = status === 'processing';
  const isCompleted = status === 'completed';

  return (
    <motion.section
      ref={sectionRef}
      id="pipeline"
      className="font-sans py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden rounded-3xl border-slate-800 p-6 shadow-2xl sm:p-8">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-40 bg-cyan-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-slate-100">Neural Correspondence Pipeline</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-300 mt-1">
              5-Stage Multi-Illumination Invariant Feature Matching & High-Precision Homography
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-300">Status:</span>
            {isProcessing && (
              <Badge className="animate-pulse gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Stage {currentStageIndex + 1} of {stages.length}: {stages[currentStageIndex]?.name}
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="success" className="gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Pipeline Verified & Aligned
              </Badge>
            )}
            {status === 'idle' && (
              <Badge variant="muted">
                Awaiting Execution
              </Badge>
            )}
          </div>
        </div>
        <Separator className="mb-6" />

        {/* 5-Stage Stepper Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
          {stages.map((stage, idx) => {
            const IconComponent = ICON_MAP[stage.icon] || Sparkles;
            const isCurrent = isProcessing && currentStageIndex === idx;
            const isDone = isCompleted || (isProcessing && currentStageIndex > idx);
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
                    <span className="text-[11px] font-medium tracking-wide text-slate-300">
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
                    <h4 className={`text-sm font-semibold ${isCurrent ? 'text-cyan-100' : isDone ? 'text-slate-100' : 'text-slate-300'}`}>
                      {stage.name}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
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
      </Card>
    </motion.section>
  );
}
