import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Compass, ArrowRight, Satellite, ShieldCheck } from 'lucide-react';
import { createLunarSvg } from '../../data/demoPairs';

export default function Hero({ onExploreDemo }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isAutoPulsing, setIsAutoPulsing] = useState(true);

  // Auto swing slider smoothly on hero landing if not interacted
  useEffect(() => {
    if (!isAutoPulsing) return;
    const interval = setInterval(() => {
      setSliderPos((prev) => {
        const time = Date.now() / 1500;
        return 50 + Math.sin(time) * 28;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoPulsing]);

  const beforeImg = createLunarSvg('Raw Orbit NAC (Phase 15°)', 20, 6, -10);
  const afterImg = createLunarSvg('Co-Registered Reference (Phase 75°)', 140, 6, 20);

  return (
    <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80 bg-gradient-to-b from-[#020617] via-[#050b1a] to-[#030712]">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide uppercase shadow-lg shadow-cyan-950/50 mb-6"
          >
            <Satellite className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            ISRO / NASA Lunar Vision Challenge
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            v2.4 Engine
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-100 to-cyan-400 tracking-tight"
          >
            LUNA-MATCH
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 font-light mt-4 leading-relaxed"
          >
            Autonomous Deep Lunar Image Correspondence & Multi-Illumination Surface Registration Engine
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-8"
          >
            <button
              onClick={onExploreDemo}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Launch Interactive Demo</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <a
              href="#pipeline"
              className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium flex items-center gap-2 transition-all hover:border-slate-600"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Explore Architecture</span>
            </a>
          </motion.div>
        </div>

        {/* Interactive Before / After showcase preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="max-w-4xl mx-auto relative rounded-2xl p-1 bg-gradient-to-b from-cyan-500/30 via-slate-800/40 to-slate-900/80 border border-slate-700/50 shadow-2xl backdrop-blur-xl"
        >
          <div className="bg-slate-950/90 rounded-xl overflow-hidden p-4 sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">LIVE_HOMOGRAPHY_REGISTRATION.SIM</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-cyan-400 bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-800/40 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> RMSE: 0.38px
                </span>
                <span className="text-orange-400 bg-orange-950/40 px-2.5 py-1 rounded border border-orange-800/40">
                  Phase Invariance: 98.4%
                </span>
              </div>
            </div>

            {/* Split Comparison Slider Frame */}
            <div
              className="relative h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden select-none cursor-ew-resize border border-slate-800 group"
              onMouseDown={() => setIsAutoPulsing(false)}
              onTouchStart={() => setIsAutoPulsing(false)}
              onMouseMove={(e) => {
                if (isAutoPulsing) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = ((e.clientX - rect.left) / rect.width) * 100;
                setSliderPos(Math.max(5, Math.min(95, pos)));
              }}
            >
              {/* Background Reference Image (Right Side) */}
              <img
                src={afterImg}
                alt="Registered Reference Target"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-md border border-orange-500/30 text-orange-400 text-xs font-mono">
                Reference Image (Sun Elev. 75°)
              </div>

              {/* Foreground Source Image (Clipped Left Side) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={beforeImg}
                  alt="Raw Low-Sun Source"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-md border border-cyan-500/30 text-cyan-400 text-xs font-mono">
                  Source Image (Sun Elev. 15°)
                </div>
              </div>

              {/* Slider Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_12px_#22d3ee] z-20 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-lg text-cyan-400">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                </div>
              </div>

              {/* Drag instruction overlay badge */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                ⇄ Drag or hover slider to inspect correspondence alignment
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
