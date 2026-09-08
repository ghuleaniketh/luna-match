import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Radar } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import MoonModel from "../Hero/MoonModel";
import SatelliteModel from "../Hero/SatelliteModel";

const STEPS = [
  {
    number: "01",
    title: "Capture",
    description:
      "Multi-mission orbital sensors acquire imagery across varying illumination, angles, and resolutions.",
  },
  {
    number: "02",
    title: "Match",
    description:
      "Deep feature extractors detect invariant surface keypoints despite extreme radiometric shifts.",
  },
  {
    number: "03",
    title: "Register",
    description:
      "Robust geometric estimators compute high-precision alignment matrices into a common coordinate frame.",
  },
  {
    number: "04",
    title: "Analyze",
    description:
      "Unified multi-temporal data reveals morphological changes, topography, and surface properties.",
  },
];

export default function Convergence() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.2 });
  const [activeStep, setActiveStep] = useState(0);

  const lineTransition = { duration: 1.4, ease: "easeInOut" };

  return (
    <section
      id="overview"
      ref={sectionRef}
      className="relative overflow-hidden px-6 py-20 text-white sm:px-8 md:px-12 lg:px-16 md:py-28"
    >
      <div className="relative mx-auto flex w-full max-w-[1500px] flex-col justify-center lg:h-[620px] lg:flex-row lg:items-center">
        {/* Left-side Info Panel */}
        <motion.div
          className="z-30 mb-12 flex w-full flex-col justify-center sm:max-w-lg lg:absolute lg:left-0 lg:top-1/2 lg:mb-0 lg:max-w-[380px] xl:max-w-[420px] lg:-translate-y-1/2"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-xs font-normal text-slate-300">
            Pipeline Architecture
          </div>

          <h2 className="mt-2 text-3xl font-medium tracking-normal text-slate-100 sm:text-4xl lg:text-4xl">
            LUNA<span className="text-sky-200">-MATCH</span>
          </h2>

          <h3 className="mt-1.5 text-base font-normal text-slate-200 sm:text-lg">
            Bringing Different Views Together
          </h3>

          <p className="mt-3 text-xs leading-relaxed text-slate-300/90 sm:text-sm">
            Satellites orbiting the Moon observe the surface under varying
            lighting, perspectives, and sensor resolutions. LUNA-MATCH bridges
            these multi-mission datasets, performing sub-pixel geometric
            registration to align distinct observations into a unified spatial
            frame.
          </p>

          {/* 4 Steps */}
          <div className="mt-6 space-y-3">
            {STEPS.map((step, idx) => (
              <button
                type="button"
                key={step.number}
                onClick={() => setActiveStep(idx)}
                className={`block w-full text-left transition-colors ${
                  activeStep === idx ? "text-slate-100" : "text-slate-400"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Badge
                    variant="outline"
                    className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-normal ${
                      activeStep === idx
                        ? "border-blue-400/50 bg-blue-950/40 text-blue-200"
                        : "border-slate-600/80 bg-slate-900/30 text-slate-300"
                    }`}
                  >
                    {step.number}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-medium sm:text-sm">
                      {step.title}
                    </h4>
                    <p className="mt-0.5 text-[11px] leading-relaxed sm:text-xs">
                      {step.description}
                    </p>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <Separator className="my-2.5 bg-white/10" />
                )}
              </button>
            ))}
          </div>

          {/* Tagline Callout */}
          <Card className="mt-6 rounded-xl border border-slate-700/80 bg-slate-950/20 p-3.5 shadow-none backdrop-blur-none sm:p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-600 bg-slate-900/40 text-sky-200">
                <Radar className="h-5 w-5" />
              </div>
              <p className="text-xs font-normal leading-relaxed text-slate-200 sm:text-sm">
                {STEPS[activeStep].title}: {STEPS[activeStep].description}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Convergence Diagram (Centered in page width) */}
        <div className="relative h-[480px] w-full sm:h-[520px] lg:h-full">
          {/* Connecting lines */}
          <svg
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-20 h-full w-full"
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
              d="M500,150 L1000,300"
              stroke="url(#beam1)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={lineTransition}
            />
            <motion.path
              d="M500,450 L1000,300"
              stroke="url(#beam2)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ ...lineTransition, delay: 0.15 }}
            />
            <circle cx="1000" cy="300" r="5" fill="#f8fafc" />
          </svg>

          {/* Top Satellite (Chandrayaan-2 / Cyan) Info Label */}
          <motion.div
            className="pointer-events-none absolute left-[calc(50%+3.5rem)] top-[4%] z-30 max-w-[150px] sm:left-[calc(50%+4.5rem)] sm:top-[6%] sm:max-w-[210px] md:left-[calc(50%+5.5rem)] md:top-[8%] md:max-w-[260px] lg:left-[calc(50%+6rem)] lg:top-[10%]"
            initial={{ opacity: 0, x: 14 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 14 }}
            transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
          >
            <div>
              <h4 className="font-sans text-[11px] font-semibold tracking-normal text-sky-200 sm:text-xs md:text-sm">
                Chandrayaan-2 (Source Image)
              </h4>
            </div>
            <p className="mt-0.5 text-[10px] font-medium text-slate-200 sm:text-[11px] md:text-xs">
              OHRC / TMC-2 / IIRS
            </p>
            <p className="mt-0.5 text-[9px] leading-relaxed text-slate-400 sm:text-[10px] md:text-[11px]">
              Different angle, resolution and illumination
            </p>
          </motion.div>

          {/* Satellite 1 (Centered on the page) */}
          <motion.img
            src="/Satellite.png"
            alt="Chandrayaan-2 satellite"
            className="absolute left-1/2 top-[18%] z-20 w-28 -translate-x-1/2 rotate-[10deg] sm:w-32 md:w-36 lg:w-40"
            initial={{ opacity: 0, y: -10 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
          />

          {/* Satellite 2 (Centered on the page) */}
          <motion.div
            role="img"
            aria-label="LRO satellite"
            className="absolute left-1/2 top-[68%] z-20 aspect-square w-28 -translate-x-1/2 -rotate-[10deg] -scale-x-100 sm:w-32 md:w-36 lg:w-40"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <SatelliteModel />
          </motion.div>

          {/* Bottom Satellite (LRO / Orange) Info Label */}
          <motion.div
            className="pointer-events-none absolute bottom-[4%] left-[calc(50%+3.5rem)] z-30 max-w-[150px] sm:bottom-[6%] sm:left-[calc(50%+4.5rem)] sm:max-w-[210px] md:bottom-auto md:left-[calc(50%+5.5rem)] md:top-[70%] md:max-w-[260px] lg:left-[calc(50%+6rem)] lg:top-[70%]"
            initial={{ opacity: 0, x: 14 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 14 }}
            transition={{ duration: 0.6, delay: 1.4, ease: "easeOut" }}
          >
            <div>
              <h4 className="font-sans text-[11px] font-semibold tracking-normal text-amber-200 sm:text-xs md:text-sm">
                LRO (Reference Image)
              </h4>
            </div>
            <p className="mt-0.5 text-[10px] font-medium text-slate-200 sm:text-[11px] md:text-xs">
              NAC (High Resolution)
            </p>
            <p className="mt-0.5 text-[9px] leading-relaxed text-slate-400 sm:text-[10px] md:text-[11px]">
              Different viewpoint and conditions
            </p>
          </motion.div>

          {/* Static shared moon, positioned to reveal only its left half */}
          <div className="absolute right-[-32%] top-1/2 z-10 aspect-square w-[64%] -translate-y-1/2 md:right-[-32%] md:w-[54%]">
            <MoonModel autoRotate={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
