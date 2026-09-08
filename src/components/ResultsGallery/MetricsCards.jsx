import React from 'react';
import { Target, Gauge, ShieldCheck, GitCompare } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

export default function MetricsCards({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Correspondences"
        icon={<Target className="h-4 w-4 text-sky-300" />}
        className="hover:border-sky-400/35"
      >
        <span className="text-3xl font-extrabold text-slate-100">{metrics.matchCount}</span>
        <Badge variant="success" className="px-2 py-0.5 text-[10px]">
          {metrics.inlierRatio} inliers
        </Badge>
        <p className="mt-2 text-xs text-slate-400">Verified pairs after USAC-MAGSAC filtering</p>
      </MetricCard>

      <MetricCard
        label="Registration Error"
        icon={<Gauge className="h-4 w-4 text-slate-300" />}
        className="hover:border-sky-400/35"
      >
        <span className="text-3xl font-semibold text-sky-300">{metrics.registrationError}</span>
        <p className="mt-2 text-xs text-slate-400">Sub-pixel optical ridge alignment precision</p>
      </MetricCard>

      <MetricCard
        label="Verification Confidence"
        icon={<ShieldCheck className="h-4 w-4 text-orange-300" />}
        className="hover:border-orange-400/35"
      >
        <span className="text-3xl font-semibold text-orange-300">{metrics.confidence}%</span>
        <Badge variant="success" className="px-2 py-0.5 font-mono text-[10px]">HIGH</Badge>
        <p className="mt-2 text-xs text-slate-400">Ground-truth region match probability</p>
      </MetricCard>

      <MetricCard
        label="Warp Model"
        icon={<GitCompare className="h-4 w-4 text-slate-300" />}
        className="hover:border-slate-500/50"
      >
        <span className="line-clamp-1 text-base font-bold text-slate-100">
          {metrics.transformationType}
        </span>
        <div className="mt-1 flex items-center gap-3 font-mono text-xs text-slate-400">
          <span>Rot: {metrics.rotationOffset}</span>
          <span>Scale: {metrics.scaleFactor}</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">{metrics.ransacIterations} RANSAC sample iterations</p>
      </MetricCard>
    </div>
  );
}

function MetricCard({ label, icon, className, children }) {
  return (
    <Card className={`group relative overflow-hidden rounded-2xl border-slate-800 bg-slate-900/70 p-4 shadow-none transition-all ${className}`}>
      <div className="mb-2 flex items-center justify-between text-slate-400">
        <span className="font-mono text-xs uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="flex flex-wrap items-baseline gap-2">{children}</div>
    </Card>
  );
}
