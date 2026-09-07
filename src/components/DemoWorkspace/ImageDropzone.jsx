import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { DEMO_PAIRS } from '../../data/demoPairs';

export default function ImageDropzone({
  sourceImage,
  referenceImage,
  onSourceChange,
  onReferenceChange,
  selectedDemoId,
  onSelectDemo
}) {
  const sourceInputRef = useRef(null);
  const refInputRef = useRef(null);

  const handleFileUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'source') onSourceChange(event.target.result);
        else onReferenceChange(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Demo Selector Pills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Select Benchmark Test Pairs:</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">4 competition scenarios</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DEMO_PAIRS.map((demo) => {
            const isSelected = selectedDemoId === demo.id;
            return (
              <button
                key={demo.id}
                onClick={() => onSelectDemo(demo)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                      {demo.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {demo.difficulty}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-200 line-clamp-1">{demo.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-tight">{demo.description}</p>
                </div>

                {isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-cyan-900/60 flex items-center justify-between text-[11px] text-cyan-400 font-mono">
                    <span>Active benchmark</span>
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Side-by-side Upload Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Image Dropzone */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Source Image (Target Orbit)
            </label>
            <span className="text-xs text-slate-500 font-mono">JPG, PNG, TIFF</span>
          </div>

          <div
            onClick={() => sourceInputRef.current?.click()}
            className="relative flex-1 min-h-[260px] rounded-2xl border-2 border-dashed border-cyan-500/30 bg-slate-950/70 hover:bg-slate-900/50 hover:border-cyan-400/60 transition-all cursor-pointer overflow-hidden flex items-center justify-center group"
          >
            {sourceImage ? (
              <div className="w-full h-full relative group">
                <img src={sourceImage} alt="Source Lunar Surface" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  <span className="text-xs font-medium text-slate-200">Click to replace source image</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-300">Drop Source Image Here</p>
                <p className="text-xs text-slate-500 mt-1">or click to browse local files</p>
              </div>
            )}
            <input
              type="file"
              ref={sourceInputRef}
              onChange={(e) => handleFileUpload(e, 'source')}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Reference Image Dropzone */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              Reference Image (Base Catalog)
            </label>
            <span className="text-xs text-slate-500 font-mono">JPG, PNG, GeoTIFF</span>
          </div>

          <div
            onClick={() => refInputRef.current?.click()}
            className="relative flex-1 min-h-[260px] rounded-2xl border-2 border-dashed border-orange-500/30 bg-slate-950/70 hover:bg-slate-900/50 hover:border-orange-400/60 transition-all cursor-pointer overflow-hidden flex items-center justify-center group"
          >
            {referenceImage ? (
              <div className="w-full h-full relative group">
                <img src={referenceImage} alt="Reference Lunar Surface" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-orange-400 animate-spin" />
                  <span className="text-xs font-medium text-slate-200">Click to replace reference image</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="w-12 h-12 mx-auto rounded-xl bg-orange-950/60 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-300">Drop Reference Image Here</p>
                <p className="text-xs text-slate-500 mt-1">or click to browse local files</p>
              </div>
            )}
            <input
              type="file"
              ref={refInputRef}
              onChange={(e) => handleFileUpload(e, 'reference')}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
