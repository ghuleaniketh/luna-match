import React, { useState, useRef, useEffect } from 'react';
import { Eye, MoveHorizontal } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export default function BeforeAfterSlider({ sourceImage, registeredImage, label = "Aligned Correspondence Comparison" }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showDifferenceMode, setShowDifferenceMode] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <Card className="flex h-full flex-col rounded-2xl border-slate-800/80 bg-slate-900/60 p-5 shadow-none">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h4 className="font-semibold text-sm text-slate-100">{label}</h4>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setShowDifferenceMode(!showDifferenceMode)}
            className={`cursor-pointer font-mono ${
              showDifferenceMode
                ? 'border-orange-500/40 bg-orange-950/60 text-orange-400'
                : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showDifferenceMode ? 'Blend Mode: Difference' : 'Split Slider Mode'}
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative flex-1 min-h-[320px] rounded-xl overflow-hidden select-none cursor-ew-resize border border-slate-800 bg-black group"
      >
        {/* If in difference blend mode */}
        {showDifferenceMode ? (
          <div className="relative w-full h-full">
            <img src={registeredImage} alt="Base" className="absolute inset-0 w-full h-full object-cover" />
            <img
              src={sourceImage}
              alt="Source Blend"
              className="absolute inset-0 w-full h-full object-cover mix-blend-difference opacity-90 filter contrast-150"
            />
            <Badge variant="warning" className="absolute left-3 top-3 bg-black/80 font-mono text-[11px]">
              Registration Residual Map (Zero delta = Dark)
            </Badge>
          </div>
        ) : (
          <>
            {/* Background Registered/Target Image (Right Side) */}
            <img
              src={registeredImage}
              alt="Registered Aligned Surface"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <Badge variant="warning" className="absolute right-3 top-3 z-10 bg-slate-950/80 font-mono text-[11px]">
              Target Reference
            </Badge>

            {/* Foreground Source Image (Clipped Left Side) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={sourceImage}
                alt="Source Image"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{ width: '100%', maxWidth: 'none' }}
              />
              <Badge className="absolute left-3 top-3 z-10 bg-slate-950/80 font-mono text-[11px]">
                Source Orbit
              </Badge>
            </div>

            {/* Slider Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-20 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-lg text-cyan-400">
                <MoveHorizontal className="w-3.5 h-3.5" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 mt-3 font-mono">
        <span>Offset: {sliderPosition.toFixed(0)}%</span>
        <span>Drag to verify sub-pixel ridge alignment</span>
      </div>
    </Card>
  );
}
