import { CheckCircle2, ExternalLink, Image as ImageIcon, ShieldCheck } from 'lucide-react';

const MOCK_RESULT = {
  matches: '542',
  inliers: '428',
  ratio: '78.9%',
  rmse: '0.42 px',
  subpixel: '0.18 px'
};

export default function RegistrationResultCard({ onViewRegistered, onViewMatches }) {
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
        <Metric label="Candidate matches" value={MOCK_RESULT.matches} />
        <Metric label="Inliers" value={MOCK_RESULT.inliers} />
        <Metric label="Inlier ratio" value={MOCK_RESULT.ratio} />
        <Metric label="RMSE" value={MOCK_RESULT.rmse} />
        <Metric label="Sub-pixel error" value={MOCK_RESULT.subpixel} />
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">Example UI data for the future registration response.</p>

      <div className="mt-3 flex gap-2">
        <ResultAction onClick={onViewRegistered} icon={<ImageIcon size={12} />} label="Registered image" />
        <ResultAction onClick={onViewMatches} icon={<ExternalLink size={12} />} label="Match points" />
      </div>
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
