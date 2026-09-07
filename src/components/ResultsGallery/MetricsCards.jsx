import React from 'react';
import { Target, Gauge, ShieldCheck, Activity, Cpu, RotateCw, GitCompare } from 'lucide-react';

export default function MetricsCards({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Match Count & Inliers */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider">Correspondences</span>
          <Target className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-100">{metrics.matchCount}</span>
          <span className="text-xs text-emerald-400 font-semibold">{metrics.inlierRatio} inliers</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Verified pairs after USAC-MAGSAC filtering
        </p>
      </div>

      {/* Metric 2: Registration Error (RMSE) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider">Registration Error</span>
          <Gauge className="w-4 h-4 text-teal-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-cyan-400">{metrics.registrationError}</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Sub-pixel optical ridge alignment precision
        </p>
      </div>

      {/* Metric 3: Confidence Score */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group hover:border-orange-500/40 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider">Verification Confidence</span>
          <ShieldCheck className="w-4 h-4 text-orange-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-orange-400">{metrics.confidence}%</span>
          <span className="text-xs text-emerald-400 font-mono">HIGH</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Ground-truth region match probability
        </p>
      </div>

      {/* Metric 4: Transformation Model */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group hover:border-blue-500/40 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider">Warp Model</span>
          <GitCompare className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <span className="text-base font-bold text-slate-100 line-clamp-1">{metrics.transformationType}</span>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
            <span>Rot: {metrics.rotationOffset}</span>
            <span>Scale: {metrics.scaleFactor}</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {metrics.ransacIterations} RANSAC sample iterations
        </p>
      </div>
    </div>
  );
}
