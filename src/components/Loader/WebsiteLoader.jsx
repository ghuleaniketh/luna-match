import React from 'react';
import { motion } from 'framer-motion';

export default function WebsiteLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030712] select-none"
    >
      {/* Ambient background glow */}
      <div className="absolute h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Main Loader Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center justify-center gap-6"
      >
        <div className="relative flex items-center justify-center">
          {/* Glowing pulse ring around loader */}
          <div className="absolute -inset-4 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
          
          <img
            src="/loader.gif"
            alt="Loading Luna Match"
            className="relative h-28 w-28 sm:h-36 sm:w-36 object-contain rounded-2xl drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          />
        </div>

        {/* Branding & Status */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase bg-gradient-to-r from-cyan-400 via-slate-200 to-slate-400 bg-clip-text text-transparent">
            LUNA-MATCH
          </span>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs text-slate-400 font-mono tracking-wider">
              INITIALIZING LUNAR SYSTEM...
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
