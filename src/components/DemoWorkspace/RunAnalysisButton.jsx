import React from 'react';
import { Play, Loader2, Sparkles, Check, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RunAnalysisButton({
  onRun,
  onReset,
  isProcessing,
  isCompleted,
  disabled
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
      {isCompleted ? (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={onReset}
          className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
        >
          <RotateCcw className="w-5 h-5 text-cyan-400" />
          <span>Reset & Test Another Pair</span>
        </motion.button>
      ) : (
        <button
          onClick={onRun}
          disabled={disabled || isProcessing}
          className={`px-10 py-4 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer shadow-xl text-base ${
            disabled
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              : isProcessing
              ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-cyan-100 shadow-cyan-600/30 cursor-wait'
              : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-cyan-500/30 hover:scale-105 active:scale-95 glow-cyan'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-cyan-300" />
              <span>Executing Neural Pipeline...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Run Lunar Correspondence Engine</span>
              <Play className="w-4 h-4 fill-current ml-1" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
