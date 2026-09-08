import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, Compass, ZoomIn } from "lucide-react";
import { Badge } from "../ui/badge";

const CROPS = {
  source: [
    {
      id: "rim",
      name: "Crater Rim & Ridge",
      tag: "Low-Angle Shadow Boundary",
      description:
        "Long shadows emphasize steep scarp relief and high-frequency crater lip morphology under oblique illumination.",
      origin: "26% 28%",
      scale: 3.2,
      rect: { x: 16, y: 18, w: 20, h: 20 },
    },
    {
      id: "peak",
      name: "Central Peak Complex",
      tag: "Topographic Invariance",
      description:
        "Uplifted central peaks create dramatic geometric displacement challenges across distinct sensor orbital passes.",
      origin: "50% 50%",
      scale: 3.4,
      rect: { x: 40, y: 40, w: 20, h: 20 },
    },
    {
      id: "ejecta",
      name: "Ejecta Rays & Floor",
      tag: "Micro-texture & Albedo",
      description:
        "High phase-angle grain texture and subtle micro-craters used for dense sub-pixel correspondence verification.",
      origin: "74% 68%",
      scale: 3.2,
      rect: { x: 64, y: 58, w: 20, h: 20 },
    },
  ],
  reference: [
    {
      id: "rim",
      name: "Crater Rim & Ridge",
      tag: "High-Sun Albedo Contrast",
      description:
        "Direct overhead solar lighting minimizes shadow occlusion, exposing true reflectance and mineral boundary gradients.",
      origin: "26% 28%",
      scale: 3.2,
      rect: { x: 16, y: 18, w: 20, h: 20 },
    },
    {
      id: "peak",
      name: "Central Peak Complex",
      tag: "Peak Illumination",
      description:
        "Central uplift structure fully illuminated without occluding shadow masks, enabling keypoint invariant association.",
      origin: "50% 50%",
      scale: 3.4,
      rect: { x: 40, y: 40, w: 20, h: 20 },
    },
    {
      id: "ejecta",
      name: "Ejecta Rays & Floor",
      tag: "Radial Ray Dispersal",
      description:
        "Bright optical rays radiating outward from the impact center clearly distinguish compositional boundaries.",
      origin: "74% 68%",
      scale: 3.2,
      rect: { x: 64, y: 58, w: 20, h: 20 },
    },
  ],
};

export default function AboutImages() {
  const [selectedSourceCrop, setSelectedSourceCrop] = useState(CROPS.source[0]);
  const [selectedRefCrop, setSelectedRefCrop] = useState(CROPS.reference[0]);

  return (
    <section id="imagery" className="relative overflow-hidden px-6 py-20 text-white sm:px-8 md:px-12 lg:px-16 md:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-400/25 bg-stone-950/65 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-stone-300 backdrop-blur-md">
            <Scan className="h-3.5 w-3.5 text-sky-300/80" />
            Dataset Inspection
          </div>

          <h2 className="mt-4 font-serif text-3xl font-semibold tracking-[-0.02em] text-stone-100 sm:text-4xl lg:text-5xl">
            Source <span className="font-normal text-sky-300/90">&</span> Reference Imagery
          </h2>

          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-stone-400 sm:text-base">
            Inspect the high-resolution lunar orbital observations used in our
            benchmark. Click any crop thumbnail below each view to inspect
            corresponding regional topography under extreme lighting
            disparities.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Source Image Card (Chandrayaan-2 / Cyan Theme) */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 sm:text-lg">
                  Source Observation (Chandrayaan-2)
                </h3>
              </div>
              <Badge
                variant="outline"
                className="border-cyan-500/40 bg-cyan-950/50 font-mono text-[11px] text-cyan-300"
              >
                Low Sun 18°
              </Badge>
            </div>

            {/* Main Image with Interactive Highlight Box */}
            <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950 shadow-2xl shadow-black/60">
              <img
                src="/moon1.jpg"
                alt="Chandrayaan-2 Source Lunar Surface"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

              {/* Bounding box for selected crop */}
              {selectedSourceCrop && (
                <motion.div
                  layoutId="source-crop-box"
                  className="absolute rounded-lg border-2 border-cyan-400 bg-cyan-400/20 shadow-[0_0_16px_rgba(6,182,212,0.6)]"
                  style={{
                    left: `${selectedSourceCrop.rect.x}%`,
                    top: `${selectedSourceCrop.rect.y}%`,
                    width: `${selectedSourceCrop.rect.w}%`,
                    height: `${selectedSourceCrop.rect.h}%`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}

              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/80 px-2.5 py-1 text-[11px] font-mono text-slate-300 backdrop-blur-md">
                <Compass className="h-3.5 w-3.5 text-cyan-400" />
                OHRC Sensor • 0.32m/px
              </div>
            </div>

            {/* Fanning Out Crop Thumbnails */}
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <ZoomIn className="h-3.5 w-3.5" /> Select Region of Interest:
                </span>
                <span>3 Benchmark Crops</span>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {CROPS.source.map((crop, idx) => {
                  const isSelected = selectedSourceCrop?.id === crop.id;
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => setSelectedSourceCrop(crop)}
                      className={`group relative flex flex-col items-center rounded-xl border p-2 text-left transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50"
                          : "border-white/10 bg-white/[0.02] hover:border-cyan-500/40 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-950">
                        <img
                          src="/moon1.jpg"
                          alt={crop.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          style={{
                            transform: `scale(${crop.scale})`,
                            transformOrigin: crop.origin,
                          }}
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg" />
                        <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-0.5 font-mono text-[9px] font-bold text-cyan-300">
                          0{idx + 1}
                        </span>
                      </div>
                      <span className="mt-2 truncate w-full text-center text-[11px] font-semibold text-slate-200 group-hover:text-cyan-200">
                        {crop.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Enlarged Preview of Selected Region */}
            <AnimatePresence mode="wait">
              {selectedSourceCrop && (
                <motion.div
                  key={selectedSourceCrop.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-4 shadow-xl backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-cyan-400/40 bg-slate-900 shadow-inner sm:h-32 sm:w-32">
                      <img
                        src="/moon1.jpg"
                        alt={selectedSourceCrop.name}
                        className="h-full w-full object-cover"
                        style={{
                          transform: `scale(${selectedSourceCrop.scale * 1.25})`,
                          transformOrigin: selectedSourceCrop.origin,
                        }}
                      />
                      <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-xl pointer-events-none" />
                    </div>
                    <div className="flex-1">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                        {selectedSourceCrop.tag}
                      </span>
                      <h4 className="text-sm font-bold text-white sm:text-base">
                        {selectedSourceCrop.name}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">
                        {selectedSourceCrop.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reference Image Card (LRO / Orange Theme) */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 sm:text-lg">
                  Reference Observation (LRO)
                </h3>
              </div>
              <Badge
                variant="outline"
                className="border-orange-500/40 bg-orange-950/50 font-mono text-[11px] text-orange-300"
              >
                High Sun 68°
              </Badge>
            </div>

            {/* Main Image with Interactive Highlight Box */}
            <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-orange-500/30 bg-slate-950 shadow-2xl shadow-black/60">
              <img
                src="/image.png"
                alt="LRO Reference Lunar Surface"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

              {/* Bounding box for selected crop */}
              {selectedRefCrop && (
                <motion.div
                  layoutId="ref-crop-box"
                  className="absolute rounded-lg border-2 border-orange-400 bg-orange-400/20 shadow-[0_0_16px_rgba(249,115,22,0.6)]"
                  style={{
                    left: `${selectedRefCrop.rect.x}%`,
                    top: `${selectedRefCrop.rect.y}%`,
                    width: `${selectedRefCrop.rect.w}%`,
                    height: `${selectedRefCrop.rect.h}%`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}

              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/80 px-2.5 py-1 text-[11px] font-mono text-slate-300 backdrop-blur-md">
                <Compass className="h-3.5 w-3.5 text-orange-400" />
                LROC NAC Sensor • 0.50m/px
              </div>
            </div>

            {/* Fanning Out Crop Thumbnails */}
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-orange-400">
                  <ZoomIn className="h-3.5 w-3.5" /> Select Region of Interest:
                </span>
                <span>3 Benchmark Crops</span>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {CROPS.reference.map((crop, idx) => {
                  const isSelected = selectedRefCrop?.id === crop.id;
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => setSelectedRefCrop(crop)}
                      className={`group relative flex flex-col items-center rounded-xl border p-2 text-left transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "border-orange-400 bg-orange-950/40 shadow-[0_0_15px_rgba(249,115,22,0.25)] ring-1 ring-orange-400/50"
                          : "border-white/10 bg-white/[0.02] hover:border-orange-500/40 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-950">
                        <img
                          src="/image.png"
                          alt={crop.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          style={{
                            transform: `scale(${crop.scale})`,
                            transformOrigin: crop.origin,
                          }}
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg" />
                        <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-0.5 font-mono text-[9px] font-bold text-orange-300">
                          0{idx + 1}
                        </span>
                      </div>
                      <span className="mt-2 truncate w-full text-center text-[11px] font-semibold text-slate-200 group-hover:text-orange-200">
                        {crop.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Enlarged Preview of Selected Region */}
            <AnimatePresence mode="wait">
              {selectedRefCrop && (
                <motion.div
                  key={selectedRefCrop.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-slate-950/90 p-4 shadow-xl backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-orange-400/40 bg-slate-900 shadow-inner sm:h-32 sm:w-32">
                      <img
                        src="/image.png"
                        alt={selectedRefCrop.name}
                        className="h-full w-full object-cover"
                        style={{
                          transform: `scale(${selectedRefCrop.scale * 1.25})`,
                          transformOrigin: selectedRefCrop.origin,
                        }}
                      />
                      <div className="absolute inset-0 border-2 border-orange-400/30 rounded-xl pointer-events-none" />
                    </div>
                    <div className="flex-1">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-orange-400">
                        {selectedRefCrop.tag}
                      </span>
                      <h4 className="text-sm font-bold text-white sm:text-base">
                        {selectedRefCrop.name}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">
                        {selectedRefCrop.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
