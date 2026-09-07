import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import MoonModel from "../Hero/MoonModel";

export default function Convergence() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.4 });

  const lineTransition = { duration: 1.4, ease: "easeInOut" };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#030712] px-8 py-28 text-white md:px-16"
    >
      {/* Heading */}
      <div className="relative z-20 mx-auto max-w-2xl">
        <p className="mb-3 text-sm text-cyan-400">How it works</p>
        <h2 className="text-3xl font-semibold leading-tight md:text-5xl">
          Two views. One match.
        </h2>
        <p className="mt-4 max-w-md text-white/60">
          LUNA-MATCH takes two images of the same lunar surface — captured
          from different viewpoints or sun angles — and resolves them as a
          single, verified correspondence.
        </p>
      </div>

      {/* Convergence diagram */}
      <div className="relative mt-16 h-[420px] w-full md:mt-20 md:h-[520px]">
        {/* Connecting lines */}
        <svg
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          className="absolute inset-0 z-10 h-full w-full"
        >
          <defs>
            <linearGradient id="beam1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="beam2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          <motion.path
            d="M500,150 L895,300"
            stroke="url(#beam1)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={lineTransition}
          />
          <motion.path
            d="M500,450 L895,300"
            stroke="url(#beam2)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ ...lineTransition, delay: 0.15 }}
          />
        </svg>

        {/* Satellite 1 */}
        <motion.img
          src="/Satellite.png"
          alt=""
          className="absolute left-1/2 top-[18%] z-20 w-24 -translate-x-1/2 rotate-[10deg] md:w-32"
          initial={{ opacity: 0, y: -10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        />

        {/* Satellite 2 */}
        <motion.img
          src="/Satellite.png"
          alt=""
          className="absolute left-1/2 top-[68%] z-20 w-24 -translate-x-1/2 -rotate-[10deg] -scale-x-100 md:w-32"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        />

        {/* Static shared moon, kept fully within the diagram */}
        <div className="absolute right-[-32%] top-1/2 z-10 aspect-square w-[64%] -translate-y-1/2 md:right-[-27%] md:w-[54%]">
          <MoonModel autoRotate={false} />
        </div>
      </div>
    </section>
  );
}
