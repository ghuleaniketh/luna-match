import { motion } from "framer-motion";
import MoonModel from "./MoonModel";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#030712] text-white flex flex-col justify-between">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        src="/backgoundvideo.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-[#030712]/60 to-[#030712]" />

      {/* Floating 80% width Nav */}
      <header className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-[80%] max-w-6xl flex items-center justify-between px-6 sm:px-8 py-3 rounded-full bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-sm"
        >
          {/* Brand Logo & Name */}
          <a href="#" className="flex items-center gap-2.5 group">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] group-hover:scale-125 transition-transform" />
            <span className="font-semibold tracking-wider text-xs sm:text-sm uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              LUNA-MATCH
            </span>
          </a>

          {/* Nav Links */}
          <div className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm text-white/70">
            <a
              href="#demo"
              className="transition-colors hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            >
              Demo
            </a>
            <a
              href="#pipeline"
              className="transition-colors hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            >
              Pipeline
            </a>
            <a
              href="#about"
              className="transition-colors hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            >
              About
            </a>
          </div>

          {/* Quick CTA */}
          <a
            href="#demo"
            className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all hover:scale-105 active:scale-95"
          >
            Launch
          </a>
        </motion.nav>
      </header>

      {/* Hero 2-Column Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto w-full min-h-screen px-6 sm:px-10 md:px-16 pt-24 pb-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Left Column: Headline & Content */}
          <div className="lg:col-span-7 max-w-2xl z-10 relative lg:pl-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-white">
              LUNA-MATCH
            </h1>

            {/* Floating 2D satellite positioned under LUNA-MATCH */}
            <div className="relative mt-6 sm:mt-8 flex items-center">
              <motion.img
                src="/Satellite.png"
                alt="Satellite"
                className="pointer-events-none w-20 sm:w-28 md:w-32 drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
                animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <p className="mt-6 max-w-xl text-base sm:text-lg text-white/70 leading-relaxed">
              LUNA-MATCH finds the same lunar feature across images captured
              under different sun angles, scales, and sensors — where standard
              matching fails.
            </p>
          </div>

          {/* Right Column: 3D Moon Model (shifted further to the right) */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end relative min-h-[420px] h-[450px] sm:h-[540px] lg:h-[620px] w-full lg:translate-x-12">
            {/* Glow behind moon */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="w-full h-full relative z-10">
              <MoonModel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
