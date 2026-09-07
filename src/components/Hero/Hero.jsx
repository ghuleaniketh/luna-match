import { motion } from "framer-motion";
import MoonModel from "./MoonModel";
import { Button } from "../ui/button";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-between overflow-hidden text-white">
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
          <Button
            as="a"
            href="#demo"
            size="sm"
            variant="outline"
            className="hidden rounded-full sm:inline-flex"
          >
            Launch
          </Button>
        </motion.nav>
      </header>

      {/* Hero 2-Column Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto w-full min-h-screen px-6 sm:px-10 md:px-16 pt-24 pb-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Left Column: Headline & Content */}
          <div className="lg:col-span-7 max-w-2xl z-10 relative lg:pl-6">
            <h1 className="whitespace-nowrap text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-white">
              LUNA-MATCH
            </h1>

            <div className="relative mt-3 sm:mt-4">
            <p className="max-w-xl text-base sm:text-lg text-white/70 leading-relaxed">
              LUNA-MATCH finds the same lunar feature across images captured
              under different sun angles, scales, and sensors — where standard
              matching fails.
            </p>
            </div>
          </div>

          {/* Right Column: 3D Moon Model (shifted further to the right) */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end relative min-h-[420px] h-[450px] sm:h-[540px] lg:h-[620px] w-full lg:translate-x-12">
            {/* Glow behind moon */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
            <motion.img
              src="/Satellite.png"
              alt="Satellite approaching the moon"
              className="pointer-events-none absolute right-0 top-0 z-20 w-24 drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] sm:right-0 sm:top-0 sm:w-28 md:w-32 lg:right-0 lg:top-0"
              animate={{ y: [0, -8, 0], rotate: [-12, -10, -12] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute right-24 top-28 z-30 h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_18px_6px_rgba(103,232,249,0.7)] sm:right-32 sm:top-36 md:right-36"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.15, 0.8] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="w-full h-full relative z-10">
              <MoonModel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
