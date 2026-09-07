import { DEMO_PAIRS } from '../data/demoPairs';

/**
 * LunaMatch API abstraction layer
 * Ready to plug into real backend endpoint POST /api/v1/match
 */
export async function runCorrespondence(sourceImg, referenceImg, options = {}) {
  // Simulate network latency / model inference time
  await new Promise((resolve) => setTimeout(resolve, options.delay || 2400));

  // Determine if it matches any known demo pair or custom uploaded images
  const matchingDemo = DEMO_PAIRS.find(p => p.sourceImage === sourceImg || p.referenceImage === referenceImg) || DEMO_PAIRS[0];

  return {
    success: true,
    jobId: 'job_' + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    isSameLocation: true,
    sourceImage: sourceImg,
    referenceImage: referenceImg,
    registeredImage: matchingDemo.referenceImage, // registered target align
    matchPoints: matchingDemo.groundTruthPoints,
    metrics: matchingDemo.mockMetrics,
    pipelineLogs: [
      { step: 1, name: 'Preprocess', status: 'completed', durationMs: 240, info: 'Adaptive CLAHE & Sobel lunar gradient enhancement computed' },
      { step: 2, name: 'Feature Extraction', status: 'completed', durationMs: 520, info: 'Detected 2,048 multi-scale Keypoints via LunaNet-Transformer' },
      { step: 3, name: 'Correspondence', status: 'completed', durationMs: 680, info: 'Coarse-to-fine Sinkhorn dual-softmax matching algorithm' },
      { step: 4, name: 'Geometric Verification', status: 'completed', durationMs: 410, info: 'Adaptive USAC-MAGSAC homography matrix fitted' },
      { step: 5, name: 'Sub-pixel Refinement', status: 'completed', durationMs: 350, info: 'Sub-pixel optical flow warp optimization (<0.4px precision)' }
    ]
  };
}
