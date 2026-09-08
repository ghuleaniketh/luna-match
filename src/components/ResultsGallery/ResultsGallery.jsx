import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Target, Activity, Layers, Zap,
  ChevronRight, Download, Info, Eye
} from 'lucide-react';

function MetricCard({ label, value, unit = '', good = true, tooltip = '' }) {
  return (
    <div className="relative bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 group">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">{label}</span>
        {tooltip && (
          <div className="relative">
            <Info className="w-3 h-3 text-slate-600 cursor-help" />
            <div className="absolute right-0 bottom-5 w-52 bg-slate-800 border border-slate-700 rounded-lg p-2 text-[10px] text-slate-300 z-10 hidden group-hover:block shadow-xl leading-relaxed">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-end gap-1.5 mt-1">
        <span className={`text-2xl font-bold tabular-nums ${good ? 'text-emerald-400' : 'text-orange-400'}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-slate-500 mb-1 font-mono">{unit}</span>}
      </div>
      <div className={`h-0.5 rounded-full mt-1 ${good ? 'bg-emerald-500/30' : 'bg-orange-500/30'}`} />
    </div>
  );
}

function ImageTab({ label, src, fallbackLabel }) {
  if (!src) return (
    <div className="w-full h-48 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-600 text-xs font-mono">
      {fallbackLabel || 'No image available'}
    </div>
  );
  return (
    <img
      src={src}
      alt={label}
      className="w-full h-48 object-cover rounded-xl border border-slate-800"
    />
  );
}

export default function ResultsGallery({ result, isVisible }) {
  const [activeTab, setActiveTab] = useState('registered');

  if (!isVisible || !result) return null;

  const { metrics = {}, aiExplanation = '', sources = [], pipelineLogs = [] } = result;

  const rmseGood = metrics.rmse != null && metrics.rmse < 0.5;
  const inlierGood = metrics.inlier_ratio != null && metrics.inlier_ratio > 0.6;

  const tabs = [
    { id: 'registered', label: 'Registered', icon: <Layers className="w-3 h-3" /> },
    { id: 'overlay', label: 'Overlay', icon: <Eye className="w-3 h-3" /> },
    { id: 'matches', label: 'Match Points', icon: <Target className="w-3 h-3" /> },
  ];

  const tabImages = {
    registered: { src: result.registeredImage, fallback: 'Reference image (registration target)' },
    overlay: { src: result.overlayImage, fallback: 'Overlay not yet generated' },
    matches: { src: result.matchPointsImage, fallback: 'Match visualization not yet generated' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mt-8 space-y-6"
    >
      {/* Status Banner */}
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border ${
          result.success
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
            : 'bg-red-950/40 border-red-800/60 text-red-300'
        }`}
      >
        {result.success ? (
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
        ) : (
          <XCircle className="w-5 h-5 shrink-0 text-red-400" />
        )}
        <div>
          <p className="text-sm font-semibold">
            {result.success ? 'Registration Successful — Sub-pixel Precision Achieved' : 'Registration Failed'}
          </p>
          <p className="text-xs opacity-70 font-mono mt-0.5">
            Job {result.jobId}{result.timestamp ? ` · ${new Date(result.timestamp).toLocaleTimeString()}` : ''}
          </p>
        </div>
        {result.success && (
          <button className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/50 border border-emerald-700/50 transition-colors cursor-pointer">
            <Download className="w-3 h-3" /> Export
          </button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard
          label="RMSE"
          value={metrics.rmse?.toFixed(3) ?? '—'}
          unit="px"
          good={rmseGood}
          tooltip="Root Mean Square Error in pixels. Values < 0.5 px indicate sub-pixel accuracy."
        />
        <MetricCard
          label="Inlier Ratio"
          value={metrics.inlier_ratio == null ? '—' : `${(metrics.inlier_ratio * 100).toFixed(1)}%`}
          good={inlierGood}
          tooltip="Fraction of RANSAC-verified inlier matches. > 60% is considered reliable."
        />
        <MetricCard
          label="Inliers"
          value={metrics.inliers ?? '—'}
          good={metrics.inliers != null && metrics.inliers > 100}
          tooltip="Number of geometrically consistent match points after RANSAC outlier rejection."
        />
        <MetricCard
          label="Total Matches"
          value={metrics.total_matches ?? '—'}
          good={true}
          tooltip="Total candidate correspondences detected before geometric verification."
        />
        <MetricCard
          label="Sub-pixel"
          value={metrics.subpixel_accuracy == null ? '—' : metrics.subpixel_accuracy ? 'YES' : 'NO'}
          good={metrics.subpixel_accuracy === true}
          tooltip="Whether final RMSE is below 0.5 pixels after Lucas-Kanade refinement."
        />
      </div>

      {/* Image Tabs */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex border-b border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'text-cyan-400 border-b-2 border-cyan-500 bg-cyan-950/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ImageTab
                label={activeTab}
                src={tabImages[activeTab]?.src}
                fallbackLabel={tabImages[activeTab]?.fallback}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* AI Explanation */}
      {aiExplanation && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200">AI Analysis</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono ml-auto">
              Qwen3-VL + RAG
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{aiExplanation}</p>
          {sources.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {sources.map((s, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono"
                >
                  {s.sensor || s.source || `source-${i + 1}`}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pipeline Log */}
      {pipelineLogs.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-200">Pipeline Execution Log</h3>
          </div>
          <div className="space-y-2.5">
            {pipelineLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 text-[10px] font-bold flex items-center justify-center">
                    {log.step}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200">{log.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">{log.durationMs}ms</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{log.info}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
