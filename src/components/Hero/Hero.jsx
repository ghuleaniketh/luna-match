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
          className="flex w-fit max-w-[calc(100vw-2rem)] items-center gap-6 rounded-full border border-white/10 bg-slate-950/40 px-5 py-3 text-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-xl sm:gap-8 sm:px-7"
        >
          {/* Brand Logo & Name */}
          <a href="#overview" className="group shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 sm:text-sm">
              LUNA-MATCH
            </span>
          </a>

          {/* Nav Links */}
          <div className="hidden items-center gap-5 text-xs text-white/70 sm:flex sm:text-sm">
            <a
              href="#overview"
              className="transition-colors hover:text-blue-300"
            >
              Overview
            </a>
            <a
              href="#pipeline"
              className="transition-colors hover:text-blue-300"
            >
              Pipeline
            </a>
            <a
              href="#imagery"
              className="hidden transition-colors hover:text-blue-300 sm:block"
            >
              Imagery
            </a>
          </div>

          {/* Quick CTA */}
          <Button
            as="a"
            href="#analyze"
            size="sm"
            variant="outline"
            className="hidden shrink-0 rounded-full sm:inline-flex"
          >
            Live
          </Button>
        </motion.nav>
      </header>

      {/* Hero 2-Column Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto w-full min-h-screen px-6 sm:px-10 md:px-16 pt-24 pb-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Left Column: Headline & Content */}
          <div className="lg:col-span-7 max-w-2xl z-10 relative lg:pl-6">
            <h1 className="whitespace-nowrap text-5xl font-black leading-none tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
              LUNA-MATCH
            </h1>

            <div className="relative mt-3 sm:mt-4">
            <p className="max-w-xl text-base leading-relaxed text-slate-300/85 sm:text-lg">
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
            <div className="w-full h-full relative z-10">
              <MoonModel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
