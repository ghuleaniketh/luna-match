import { useState } from 'react';
import { CheckCircle2, ExternalLink, Image as ImageIcon, Layers, ShieldCheck } from 'lucide-react';

const MOCK_RESULT = {
  matches: '542',
  inliers: '428',
  ratio: '78.9%',
  rmse: '0.42 px',
  subpixel: '0.18 px'
};

export default function RegistrationResultCard({ result, onViewRegistered, onViewMatches }) {
  const [activePreview, setActivePreview] = useState(null);

  const displayResult = result ? {
    matches: result.total_matches ?? result.matches ?? '0',
    inliers: result.inliers ?? '0',
    ratio: typeof result.inlier_ratio === 'number' ? `${(result.inlier_ratio * 100).toFixed(1)}%` : (result.ratio || '0%'),
    rmse: typeof result.rmse === 'number' ? `${result.rmse.toFixed(3)} px` : (result.rmse || '0 px'),
    subpixel: typeof result.subpixel_error === 'number' ? `${result.subpixel_error.toFixed(3)} px` : (result.subpixel || 'N/A')
  } : MOCK_RESULT;

  const hasRegisteredImage = Boolean(result?.registered_image);
  const hasMatchPointsImage = Boolean(result?.match_points_image);
  const hasOverlayImage = Boolean(result?.overlay_image);

  const handleToggle = (type, fallbackFn) => {
    if ((type === 'registered' && hasRegisteredImage) ||
        (type === 'matches' && hasMatchPointsImage) ||
        (type === 'overlay' && hasOverlayImage)) {
      setActivePreview((prev) => (prev === type ? null : type));
    } else if (fallbackFn) {
      fallbackFn();
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-950/20 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300/70">Registration result</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-100">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Registration completed
          </p>
        </div>
        <ShieldCheck size={16} className="text-cyan-300" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-white/10 py-3 text-xs">
        <Metric label="Candidate matches" value={displayResult.matches} />
        <Metric label="Inliers" value={displayResult.inliers} />
        <Metric label="Inlier ratio" value={displayResult.ratio} />
        <Metric label="RMSE" value={displayResult.rmse} />
        <Metric label="Sub-pixel error" value={displayResult.subpixel} />
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
        {result ? 'Computed in-process by LUNA-MATCH Core Engine.' : 'Example UI data for the future registration response.'}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <ResultAction
          active={activePreview === 'registered'}
          onClick={() => handleToggle('registered', onViewRegistered)}
          icon={<ImageIcon size={12} />}
          label="Registered image"
        />
        <ResultAction
          active={activePreview === 'matches'}
          onClick={() => handleToggle('matches', onViewMatches)}
          icon={<ExternalLink size={12} />}
          label="Match points"
        />
        {hasOverlayImage && (
          <ResultAction
            active={activePreview === 'overlay'}
            onClick={() => handleToggle('overlay')}
            icon={<Layers size={12} />}
            label="Overlay comparison"
          />
        )}
      </div>

      {activePreview && (
        <div className="mt-3 overflow-hidden rounded-lg border border-cyan-400/30 bg-black/90 p-2">
          <div className="flex items-center justify-between pb-1.5 text-[10px] font-mono text-cyan-300">
            <span>
              {activePreview === 'registered' ? 'Registered Warped Image' : activePreview === 'matches' ? 'Keypoint Correspondences' : 'Overlay Alignment'}
            </span>
            <button
              type="button"
              onClick={() => setActivePreview(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <img
            src={
              activePreview === 'registered'
                ? result.registered_image
                : activePreview === 'matches'
                ? result.match_points_image
                : result.overlay_image
            }
            alt={activePreview}
            className="w-full max-h-64 rounded object-contain"
          />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className="mt-0.5 font-mono text-slate-200">{value}</p>
    </div>
  );
}

function ResultAction({ onClick, icon, label }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-200">
      {icon}
      {label}
    </button>
  );
}
