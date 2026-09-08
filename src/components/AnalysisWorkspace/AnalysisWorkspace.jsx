import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { UploadCloud, X, Sparkles, Loader2, Check, Circle, Eye } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { runCorrespondence } from "../../api/lunaMatch";

function ImageBox({ label, image, onSelect, onClear }) {
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1024;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        onSelect(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => !image && inputRef.current?.click()}
      className="relative flex h-64 flex-col items-center justify-center rounded-xl border-dashed border-zinc-800 bg-zinc-950/40 p-0 transition-colors hover:border-blue-400/50"
    >
      <Input
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
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute right-2 top-2 h-8 w-8 rounded-full border-white/20 bg-black/70 p-0 text-white/80 hover:text-white"
            aria-label={`Clear ${label}`}
          >
            <X size={14} />
          </Button>
        </>
      ) : (
        <div className="flex cursor-pointer flex-col items-center gap-2 text-zinc-500">
          <UploadCloud size={24} />
          <Badge variant="outline">{label}</Badge>
          <span className="text-xs text-zinc-600">Click or drag an image</span>
        </div>
      )}
    </Card>
  );
}

export default function AnalysisWorkspace() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.15 });
  const [imageOne, setImageOne] = useState(null);
  const [imageTwo, setImageTwo] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [analysisPhase, setAnalysisPhase] = useState("");
  const [activeWorkspaceView, setActiveWorkspaceView] = useState("matches");

  const canRun = imageOne && imageTwo && !isRunning;

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    setAnalysisPhase("Detecting keypoints & computing homography...");
    try {
      const data = await runCorrespondence(imageOne, imageTwo);
      setAnalysisPhase("Complete");
      setResult(data);
    } catch (err) {
      console.error("AnalysisWorkspace registration error:", err);
      setAnalysisPhase("Registration failed");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      id="analyze"
      className="relative px-8 py-28 text-white md:px-16"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-sm text-cyan-400">Run your own</p>
        <h2 className="text-3xl font-semibold leading-tight md:text-5xl">
          Upload two images
        </h2>
        <p className="mt-4 max-w-md text-white/60">
          Add two images of the same lunar region and LUNA-MATCH will find
          the correspondence between them in-process.
        </p>

        <Card className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border-zinc-800 bg-zinc-950/60 px-4 py-3 shadow-none">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
              {imageOne ? <Check size={12} /> : <Circle size={9} />}
            </span>
            Source image
          </div>
          <div className="hidden h-4 w-px bg-zinc-800 sm:block" />
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
              {imageTwo ? <Check size={12} /> : <Circle size={9} />}
            </span>
            Reference image
          </div>
          <Badge variant={canRun ? "success" : "muted"} className="ml-auto">
            {canRun ? "Ready to compare" : "Waiting for both images"}
          </Badge>
        </Card>

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
          <Button
            onClick={handleRun}
            disabled={!canRun}
            variant="gradient"
            size="lg"
            className="rounded-full"
          >
            {isRunning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {analysisPhase || "Analyzing..."}
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Find Correspondence
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Metric label="Matches" value={result.matches ?? result.metrics?.matches ?? "0"} />
              <Metric label="Inliers" value={result.inliers ?? result.metrics?.inliers ?? "0"} />
              <Metric label="RMSE" value={result.rmse ?? result.metrics?.rmse ?? "N/A"} />
              <Metric label="Model" value={result.transform ?? result.metrics?.transform ?? "Homography"} />
            </div>

            {(result.matchPointsImage || result.registeredImage || result.overlayImage) && (
              <Card className="overflow-hidden rounded-2xl border-white/10 bg-zinc-950/80 p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Visual Alignment Output</h3>
                    <p className="text-xs text-white/50">Computed in-process by LUNA-MATCH Core Engine</p>
                  </div>
                  <div className="flex gap-2">
                    {result.matchPointsImage && (
                      <Button
                        variant={activeWorkspaceView === "matches" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveWorkspaceView("matches")}
                        className="text-xs"
                      >
                        Match Points
                      </Button>
                    )}
                    {result.registeredImage && (
                      <Button
                        variant={activeWorkspaceView === "registered" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveWorkspaceView("registered")}
                        className="text-xs"
                      >
                        Registered Warped
                      </Button>
                    )}
                    {result.overlayImage && (
                      <Button
                        variant={activeWorkspaceView === "overlay" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveWorkspaceView("overlay")}
                        className="text-xs"
                      >
                        Overlay
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-center bg-black/60 p-2 rounded-xl">
                  <img
                    src={
                      activeWorkspaceView === "matches"
                        ? result.matchPointsImage
                        : activeWorkspaceView === "registered"
                        ? result.registeredImage
                        : result.overlayImage
                    }
                    alt={activeWorkspaceView}
                    className="max-h-96 w-auto rounded-lg object-contain"
                  />
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}

function Metric({ label, value }) {
  return (
    <Card className="rounded-xl border-white/10 bg-white/[0.02] p-4 shadow-none">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 text-xl font-medium">{value}</p>
    </Card>
  );
}