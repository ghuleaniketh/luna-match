// Benchmark pairs for the LUNA-MATCH demo workspace.
// Only "illumination" uses real LROC imagery right now — the rest are
// placeholders until more real pairs are sourced.

export const demoPairs = [
  {
    id: "illumination",
    label: "Different Illumination",
    description:
      "Same crater ejecta, two sun angles (68° vs 8°) — LROC NAC imagery",
    source: "/moon1.png",
    reference: "/image.png",
    comingSoon: false,
  },
  {
    id: "scale",
    label: "Scale Difference",
    description: "Same region, two zoom levels",
    source: null,
    reference: null,
    comingSoon: true,
  },
  {
    id: "multimodal",
    label: "Multi-Modal Sensor",
    description: "Same region, two different sensors",
    source: null,
    reference: null,
    comingSoon: true,
  },
  {
    id: "noise",
    label: "Sensor Noise & Blur",
    description: "Clean vs degraded version of the same image",
    source: null,
    reference: null,
    comingSoon: true,
  },
];
