import { useState, useCallback, useRef } from 'react';
import { runCorrespondence } from '../api/lunaMatch';

export const PIPELINE_STAGES = [
  { id: 1, name: 'Preprocess', shortDesc: 'Adaptive CLAHE & Gradient Normalization', icon: 'Sliders' },
  { id: 2, name: 'Feature Extraction', shortDesc: 'Dense Multi-scale Keypoint Descriptors', icon: 'Sparkles' },
  { id: 3, name: 'Correspondence', shortDesc: 'Sinkhorn Coarse-to-Fine Matching', icon: 'Layers' },
  { id: 4, name: 'Geometric Verification', shortDesc: 'Robust Homography & Outlier Pruning', icon: 'CheckCircle2' },
  { id: 5, name: 'Sub-pixel Refinement', shortDesc: 'Sub-pixel Patch Optimization (<0.5px)', icon: 'Crosshair' },
];

export function usePipelineState() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'completed' | 'error'
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const startPipeline = useCallback(async (sourceImg, referenceImg) => {
    if (!sourceImg || !referenceImg) return;

    setStatus('processing');
    setCurrentStageIndex(0);
    setError(null);

    // Staged animation timers simulating each pipeline step
    const stageDuration = 600; // ms per stage visual step
    let stage = 0;

    const stageInterval = setInterval(() => {
      stage += 1;
      if (stage < PIPELINE_STAGES.length) {
        setCurrentStageIndex(stage);
      } else {
        clearInterval(stageInterval);
      }
    }, stageDuration);

    try {
      // Execute the API call
      const res = await runCorrespondence(sourceImg, referenceImg, { delay: stageDuration * PIPELINE_STAGES.length });
      clearInterval(stageInterval);
      setCurrentStageIndex(PIPELINE_STAGES.length - 1);
      setResults(res);
      setStatus('completed');
    } catch (err) {
      clearInterval(stageInterval);
      setError(err.message || 'Error occurred during correspondence matching');
      setStatus('error');
    }
  }, []);

  const resetPipeline = useCallback(() => {
    setStatus('idle');
    setCurrentStageIndex(0);
    setResults(null);
    setError(null);
  }, []);

  return {
    status,
    currentStageIndex,
    currentStage: PIPELINE_STAGES[currentStageIndex],
    stages: PIPELINE_STAGES,
    results,
    error,
    startPipeline,
    resetPipeline,
    isProcessing: status === 'processing',
    isCompleted: status === 'completed',
  };
}
