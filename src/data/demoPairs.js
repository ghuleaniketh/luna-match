// SVG data URIs for realistic lunar surface mock images
export const createLunarSvg = (title, lightAngle, craterCount = 5, colorShift = 0) => {
  const baseGray = 120 + colorShift;
  const craters = Array.from({ length: craterCount }).map((_, i) => {
    const cx = 80 + ((i * 110 + 45) % 240);
    const cy = 60 + ((i * 90 + 35) % 200);
    const r = 22 + ((i * 17) % 25);
    const dx = Math.cos((lightAngle * Math.PI) / 180) * 8;
    const dy = Math.sin((lightAngle * Math.PI) / 180) * 8;
    return `
      <!-- Crater ${i} -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgb(${baseGray - 35}, ${baseGray - 35}, ${baseGray - 30})" />
      <circle cx="${cx + dx}" cy="${cy + dy}" r="${r * 0.85}" fill="rgb(${baseGray + 40}, ${baseGray + 40}, ${baseGray + 45})" opacity="0.4" />
      <circle cx="${cx - dx * 0.7}" cy="${cy - dy * 0.7}" r="${r * 0.8}" fill="rgb(${baseGray - 65}, ${baseGray - 65}, ${baseGray - 60})" opacity="0.8" />
      <circle cx="${cx}" cy="${cy}" r="${r * 0.45}" fill="rgb(${baseGray - 25}, ${baseGray - 25}, ${baseGray - 20})" />
    `;
  }).join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <defs>
        <radialGradient id="grad-${lightAngle}-${craterCount}" cx="${30 + (lightAngle % 40)}%" cy="${30 + (lightAngle % 30)}%" r="80%">
          <stop offset="0%" stop-color="rgb(${baseGray + 35}, ${baseGray + 35}, ${baseGray + 40})" />
          <stop offset="100%" stop-color="rgb(${baseGray - 50}, ${baseGray - 50}, ${baseGray - 45})" />
        </radialGradient>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise"/>
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0"/>
          <feComposite in2="SourceGraphic" in="gl" operator="in" />
        </filter>
      </defs>
      <rect width="400" height="300" fill="url(#grad-${lightAngle}-${craterCount})" />
      ${craters}
      <!-- Terrain Ridge Lines -->
      <path d="M 20,150 Q 120,${130 + lightAngle / 4} 220,165 T 380,140" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3" stroke-dasharray="4,6" />
      <path d="M 40,220 Q 160,${200 - lightAngle / 5} 280,240 T 360,210" fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="4" />
      
      <!-- Label overlay in image -->
      <rect x="10" y="10" width="130" height="26" rx="6" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(6, 182, 212, 0.4)" stroke-width="1"/>
      <text x="18" y="27" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const DEMO_PAIRS = [
  {
    id: 'illumination-1',
    title: 'Tycho Crater Rim',
    label: 'Different Illumination',
    tag: 'Extreme Sun Angles',
    description: 'High phase angle variation (Morning sun 18° vs Afternoon sun 62°)',
    difficulty: 'Moderate',
    sourceImage: createLunarSvg('Source: Low Sun 18°', 25, 6, 5),
    referenceImage: createLunarSvg('Target: High Sun 62°', 135, 6, -10),
    groundTruthPoints: [
      { id: 1, source: [120, 85], reference: [122, 88], confidence: 0.98, label: 'Crater A Ridge' },
      { id: 2, source: [240, 110], reference: [238, 115], confidence: 0.94, label: 'Central Peak' },
      { id: 3, source: [180, 195], reference: [184, 192], confidence: 0.96, label: 'Secondary Rim' },
      { id: 4, source: [310, 175], reference: [308, 179], confidence: 0.91, label: 'Ejecta Blanket' },
      { id: 5, source: [85, 220], reference: [88, 224], confidence: 0.95, label: 'Terrace Wall' },
      { id: 6, source: [210, 60], reference: [214, 62], confidence: 0.89, label: 'North Edge' },
      { id: 7, source: [330, 80], reference: [327, 85], confidence: 0.93, label: 'Crater B Rim' }
    ],
    mockMetrics: {
      matchCount: 842,
      inlierRatio: '96.4%',
      transformationType: 'Homography (8-DOF)',
      registrationError: '0.42 px (RMSE)',
      confidence: 97.8,
      rotationOffset: '+2.4°',
      scaleFactor: '1.02x',
      inliers: 812,
      ransacIterations: 45
    }
  },
  {
    id: 'scale-diff-2',
    title: 'Mare Imbrium Basin',
    label: 'Scale Difference',
    tag: 'Altitude Disparity',
    description: 'Orbiter altitude disparity: 50km high-res NAC vs 120km WAC sensor context',
    difficulty: 'Hard',
    sourceImage: createLunarSvg('Source: NAC 50km Zoom', 45, 4, 15),
    referenceImage: createLunarSvg('Target: WAC 120km Wide', 40, 7, 0),
    groundTruthPoints: [
      { id: 1, source: [95, 100], reference: [140, 120], confidence: 0.92, label: 'Rima Hadley' },
      { id: 2, source: [210, 140], reference: [220, 155], confidence: 0.97, label: 'Promontorium' },
      { id: 3, source: [310, 190], reference: [290, 185], confidence: 0.88, label: 'Mons Bradley' },
      { id: 4, source: [160, 240], reference: [180, 230], confidence: 0.91, label: 'Mare Floor Basalt' },
      { id: 5, source: [280, 70], reference: [265, 90], confidence: 0.86, label: 'Ejecta Ray' }
    ],
    mockMetrics: {
      matchCount: 628,
      inlierRatio: '91.8%',
      transformationType: 'Affine + Non-rigid TPM',
      registrationError: '0.68 px (RMSE)',
      confidence: 93.4,
      rotationOffset: '-5.1°',
      scaleFactor: '2.38x',
      inliers: 576,
      ransacIterations: 82
    }
  },
  {
    id: 'multimodal-3',
    title: 'Shackleton South Pole',
    label: 'Multi-Modal',
    tag: 'Optical vs SAR / LiDAR',
    description: 'Permanently Shadowed Region (PSR): Optical imaging matched with Mini-RF SAR radar',
    difficulty: 'Extreme',
    sourceImage: createLunarSvg('Source: SAR Radar (Ch-2)', 90, 5, -20),
    referenceImage: createLunarSvg('Target: LROC Optical (NAC)', 20, 5, 25),
    groundTruthPoints: [
      { id: 1, source: [110, 130], reference: [112, 126], confidence: 0.89, label: 'PSR Ridge A' },
      { id: 2, source: [225, 95], reference: [220, 102], confidence: 0.85, label: 'Peak of Eternal Light' },
      { id: 3, source: [260, 210], reference: [255, 215], confidence: 0.93, label: 'South Rim Crest' },
      { id: 4, source: [140, 230], reference: [146, 225], confidence: 0.87, label: 'Micro-crater Chain' }
    ],
    mockMetrics: {
      matchCount: 495,
      inlierRatio: '88.3%',
      transformationType: 'Deep Cross-Modal Warp',
      registrationError: '0.89 px (RMSE)',
      confidence: 89.2,
      rotationOffset: '+12.7°',
      scaleFactor: '0.97x',
      inliers: 437,
      ransacIterations: 110
    }
  },
  {
    id: 'degraded-4',
    title: 'Aristarchus Plateau',
    label: 'Sensor Noise & Blur',
    tag: 'Dust & Low SNR',
    description: 'Downlink compression artifacts matched with clear archival survey map',
    difficulty: 'Moderate',
    sourceImage: createLunarSvg('Source: Compressed Downlink', 55, 6, -5),
    referenceImage: createLunarSvg('Target: Calibrated Map', 60, 6, 5),
    groundTruthPoints: [
      { id: 1, source: [130, 90], reference: [129, 91], confidence: 0.99, label: 'Plateau Graben' },
      { id: 2, source: [245, 135], reference: [244, 137], confidence: 0.95, label: 'Pyroclastic Deposit' },
      { id: 3, source: [170, 210], reference: [172, 208], confidence: 0.97, label: 'Vallis Schröteri' },
      { id: 4, source: [305, 160], reference: [306, 162], confidence: 0.94, label: 'Cobra Head Vent' },
      { id: 5, source: [90, 180], reference: [92, 178], confidence: 0.92, label: 'West Scarp' }
    ],
    mockMetrics: {
      matchCount: 915,
      inlierRatio: '98.1%',
      transformationType: 'Affine Homography',
      registrationError: '0.31 px (RMSE)',
      confidence: 99.1,
      rotationOffset: '+0.3°',
      scaleFactor: '1.00x',
      inliers: 898,
      ransacIterations: 28
    }
  }
];
