import { useRef, useState } from "react";
import { UploadCloud, X, Sparkles, Loader2 } from "lucide-react";

function ImageBox({ label, image, onSelect, onClear }) {
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    onSelect(URL.createObjectURL(file));
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => !image && inputRef.current?.click()}
      className="relative flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] transition-colors hover:border-cyan-400/40"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {image ? (
        <>
          <img
            src={image}
            alt={label}
            className="h-full w-full rounded-2xl object-cover"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white/80 hover:text-white"
            aria-label={`Clear ${label}`}
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <div className="flex cursor-pointer flex-col items-center gap-2 text-white/50">
          <UploadCloud size={24} />
          <span className="text-sm">{label}</span>
          <span className="text-xs text-white/30">Click or drag an image</span>
        </div>
      )}
    </div>
  );
}

// Placeholder for the real backend call — swap this out once ready.
async function runCorrespondence(image1, image2) {
  await new Promise((r) => setTimeout(r, 1800));
  return {
    matches: 128,
    inliers: 96,
    rmse: 1.42,
    transform: "Homography",
  };
}

export default function AnalysisWorkspace() {
  const [imageOne, setImageOne] = useState(null);
  const [imageTwo, setImageTwo] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);

  const canRun = imageOne && imageTwo && !isRunning;

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    const data = await runCorrespondence(imageOne, imageTwo);
    setResult(data);
    setIsRunning(false);
  };

  return (
    <section
      id="analyze"
      className="relative px-8 py-28 text-white md:px-16"
    >
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-sm text-cyan-400">Run your own</p>
        <h2 className="text-3xl font-semibold leading-tight md:text-5xl">
          Upload two images
        </h2>
        <p className="mt-4 max-w-md text-white/60">
          Add two images of the same lunar region and LUNA-MATCH will find
          the correspondence between them.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          <ImageBox
            label="Image 1"
            image={imageOne}
            onSelect={setImageOne}
            onClear={() => setImageOne(null)}
          />
          <ImageBox
            label="Image 2"
            image={imageTwo}
            onSelect={setImageTwo}
            onClear={() => setImageTwo(null)}
          />
        </div>

        <div className="mt-8">
          <button
            onClick={handleRun}
            disabled={!canRun}
            className={`flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium transition-all ${
              !canRun
                ? "cursor-not-allowed bg-white/5 text-white/25"
                : "bg-gradient-to-r from-cyan-400 to-orange-400 text-[#030712] hover:scale-105"
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Find Correspondence
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Metric label="Matches" value={result.matches} />
            <Metric label="Inliers" value={result.inliers} />
            <Metric label="RMSE" value={result.rmse} />
            <Metric label="Model" value={result.transform} />
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 text-xl font-medium">{value}</p>
    </div>
  );
}