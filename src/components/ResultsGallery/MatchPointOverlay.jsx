import React, { useState } from 'react';
import { Target } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export default function MatchPointOverlay({ sourceImage, referenceImage, matchPoints = [] }) {
  const [hoveredPointId, setHoveredPointId] = useState(null);
  const [minConfidence, setMinConfidence] = useState(0.85);
  const [showConnectors, setShowConnectors] = useState(true);

  const filteredPoints = matchPoints.filter(p => p.confidence >= minConfidence);

  return (
    <Card className="flex h-full flex-col rounded-2xl border-slate-800/80 bg-slate-900/60 p-5 shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-400" />
          <h4 className="font-semibold text-sm text-slate-100">Dual-Image Keypoint Correspondence</h4>
          <Badge className="font-mono">
            {filteredPoints.length} inliers
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <label className="flex items-center gap-2 text-slate-400">
            <span>Confidence &gt; {minConfidence.toFixed(2)}</span>
            <input
              type="range"
              min="0.80"
              max="0.98"
              step="0.02"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-20 accent-cyan-400 cursor-pointer"
            />
          </label>

          <Button
            type="button"
            size="sm"
            onClick={() => setShowConnectors(!showConnectors)}
            className={`cursor-pointer ${
              showConnectors ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showConnectors ? 'Lines ON' : 'Lines OFF'}
          </Button>
        </div>
      </div>

      {/* Side-by-side Dual Image Canvas with SVG Link Overlays */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex-1 min-h-[320px] flex flex-col justify-center">
        <div className="grid grid-cols-2 h-full relative">
          {/* Left: Source Image */}
          <div className="relative border-r border-slate-800/80">
            <img src={sourceImage} alt="Source Orbit" className="w-full h-full object-cover" />
            <Badge className="absolute left-3 top-3 bg-slate-950/80 px-2 py-0.5 font-mono text-[10px]">
              Source Keypoints
            </Badge>
          </div>

          {/* Right: Reference Image */}
          <div className="relative">
            <img src={referenceImage} alt="Reference Base" className="w-full h-full object-cover" />
            <Badge variant="warning" className="absolute right-3 top-3 px-2 py-0.5 font-mono text-[10px]">
              Reference Keypoints
            </Badge>
          </div>

          {/* Global SVG Overlay for Match Lines and Feature Keypoint Rings */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 800 300"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="matchLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {filteredPoints.map((pt) => {
              // Scale coordinates assuming 400x300 original box per half
              const sx = (pt.source[0] / 400) * 400;
              const sy = (pt.source[1] / 300) * 300;
              const rx = 400 + (pt.reference[0] / 400) * 400;
              const ry = (pt.reference[1] / 300) * 300;

              const isHovered = hoveredPointId === pt.id;

              return (
                <g key={pt.id} className="transition-all">
                  {/* Connecting correspondence vector */}
                  {showConnectors && (
                    <line
                      x1={sx}
                      y1={sy}
                      x2={rx}
                      y2={ry}
                      stroke={isHovered ? '#38bdf8' : 'url(#matchLineGrad)'}
                      strokeWidth={isHovered ? 2.5 : 1.2}
                      strokeDasharray={isHovered ? 'none' : '3,3'}
                      opacity={hoveredPointId ? (isHovered ? 1 : 0.2) : 0.7}
                    />
                  )}

                  {/* Left point (Source) */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={isHovered ? 6 : 4}
                    fill="#06b6d4"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    className="cursor-pointer pointer-events-auto"
                    onMouseEnter={() => setHoveredPointId(pt.id)}
                    onMouseLeave={() => setHoveredPointId(null)}
                  />

                  {/* Right point (Reference) */}
                  <circle
                    cx={rx}
                    cy={ry}
                    r={isHovered ? 6 : 4}
                    fill="#f97316"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    className="cursor-pointer pointer-events-auto"
                    onMouseEnter={() => setHoveredPointId(pt.id)}
                    onMouseLeave={() => setHoveredPointId(null)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
       </div>

      {/* Point details footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
        {hoveredPointId ? (
          <span className="text-cyan-300">
            Selected Point #{hoveredPointId}: {matchPoints.find(p => p.id === hoveredPointId)?.label} (Score: {((matchPoints.find(p => p.id === hoveredPointId)?.confidence || 0) * 100).toFixed(1)}%)
          </span>
        ) : (
          <span>Hover over keypoints to isolate correspondence lines</span>
        )}
        <span className="text-slate-500">LunaNet-Transformer Descriptor</span>
      </div>
    </Card>
  );
}
