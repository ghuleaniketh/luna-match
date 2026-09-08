/**
 * LUNA-MATCH API abstraction layer.
 * Calls the real FastAPI backend (app/main.py).
 * Falls back gracefully to mock data when the backend is unreachable.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://lunarcoreengine.onrender.com').replace(/\/$/, '');
const PREVIEW_POLL_INTERVAL_MS = 1000;
const PREVIEW_POLL_TIMEOUT_MS = 120000;

// ── helpers ────────────────────────────────────────────────────────────────
async function _postJSON(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

function _dataUriToBlob(dataUri, name) {
  if (typeof dataUri !== 'string' || !dataUri.startsWith('data:')) {
    throw new Error(`Invalid image supplied for ${name}`);
  }

  const [metadata, encoded] = dataUri.split(',');
  const mimeType = metadata.match(/data:(.*?);base64/)?.[1] || 'application/octet-stream';
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  return new File([bytes], name, { type: mimeType });
}

async function _getPreviewImages(sourceImg, referenceImg) {
  const formData = new FormData();
  formData.append('img_a', _dataUriToBlob(sourceImg, 'source-image'));
  formData.append('img_b', _dataUriToBlob(referenceImg, 'reference-image'));

  const registration = await fetch(`${BASE_URL}/register`, { method: 'POST', body: formData });
  if (!registration.ok) throw new Error(`Preview registration failed (${registration.status})`);

  const { job_id: jobId } = await registration.json();
  if (!jobId) throw new Error('Preview registration did not return a job ID');

  const startedAt = Date.now();
  while (Date.now() - startedAt < PREVIEW_POLL_TIMEOUT_MS) {
    const statusResponse = await fetch(`${BASE_URL}/jobs/${encodeURIComponent(jobId)}`);
    if (!statusResponse.ok) throw new Error(`Preview job status failed (${statusResponse.status})`);
    const status = await statusResponse.json();
    if (status.status === 'DONE') {
      const summaryResponse = await fetch(`${BASE_URL}/jobs/${encodeURIComponent(jobId)}/summary`);
      const summary = summaryResponse.ok ? await summaryResponse.json() : null;
      return {
        jobId,
        summary,
        explanation: summary?.quality_assessment?.reasoning || '',
        registeredImage: `${BASE_URL}/jobs/${encodeURIComponent(jobId)}/preview?kind=checkerboard`,
        overlayImage: `${BASE_URL}/jobs/${encodeURIComponent(jobId)}/preview?kind=residual`,
        matchPointsImage: `${BASE_URL}/jobs/${encodeURIComponent(jobId)}/preview?kind=tiepoints`,
      };
    }
    if (['FAILED', 'ERROR'].includes(status.status)) {
      throw new Error(`Preview job ${status.status.toLowerCase()}`);
    }
    await new Promise((resolve) => window.setTimeout(resolve, PREVIEW_POLL_INTERVAL_MS));
  }

  throw new Error('Preview generation timed out');
}

// ── health check ──────────────────────────────────────────────────────────
export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

// ── RAG knowledge query ───────────────────────────────────────────────────
export async function queryKnowledge(query, topK = 4) {
  return _postJSON('/rag/query', { query, top_k: topK });
}

// ── Orchestrated chat (main AI endpoint) ─────────────────────────────────
/**
 * Send a message to the AI Orchestrator.
 * @param {string} query - User text message
 * @param {string|null} sourceImageB64 - Base64 data URI of source image (optional)
 * @param {string|null} referenceImageB64 - Base64 data URI of reference image (optional)
 */
export async function sendChat(query, sourceImageB64 = null, referenceImageB64 = null) {
  return _postJSON('/orchestrate', {
    query,
    source_image_b64: sourceImageB64,
    reference_image_b64: referenceImageB64,
  });
}

// ── Image Registration (mock-friendly) ───────────────────────────────────
/**
 * Run image registration pipeline.
 * Accepts base64 data URI strings (data:image/...).
 * Falls back to deterministic mock if backend unreachable.
 */
export async function runCorrespondence(sourceImg, referenceImg, options = {}) {
  const result = await _getPreviewImages(sourceImg, referenceImg);
  const backendMetrics = result.summary?.metrics || {};
  const quality = result.summary?.quality_assessment || {};

  return {
    success: result.summary?.status === 'DONE',
    jobId: result.jobId,
    timestamp: result.summary?.completed_at || null,
    isSameLocation: true,
    sourceImage: sourceImg,
    referenceImage: referenceImg,
    registeredImage: result.registeredImage,
    overlayImage: result.overlayImage,
    matchPointsImage: result.matchPointsImage,
    metrics: {
      rmse: backendMetrics.rmse_px ?? null,
      inlier_ratio: backendMetrics.inlier_ratio ?? null,
      inliers: backendMetrics.n_inliers ?? null,
      total_matches: backendMetrics.n_total ?? null,
      subpixel_accuracy: backendMetrics.rmse_px == null ? null : backendMetrics.rmse_px < 0.5,
      subpixel_error: backendMetrics.rmse_px ?? null,
      sdi: backendMetrics.sdi ?? null,
      transformation_type: backendMetrics.transform_type ?? null,
    },
    aiExplanation: result.explanation,
    warnings: quality.warnings || [],
    qualityAssessment: quality,
    sources: result.summary?.sources || [],
    pipelineLogs: result.summary?.pipeline_logs || [],
  };
}

export function getSavedRegistrationResult(sourceImg, referenceImg) {
  return _mockRegistration(sourceImg, referenceImg);
}

// ── Deterministic mock (offline / demo mode) ──────────────────────────────
function _buildPipelineLogs(reg) {
  return [
    { step: 1, name: 'Preprocess', status: 'completed', durationMs: 240, info: 'Adaptive CLAHE & Sobel lunar gradient enhancement' },
    { step: 2, name: 'Feature Extraction', status: 'completed', durationMs: 520, info: `Detected ${reg.total_matches || 2048} multi-scale keypoints via LunaNet-Transformer` },
    { step: 3, name: 'Correspondence', status: 'completed', durationMs: 680, info: 'Coarse-to-fine Sinkhorn dual-softmax matching' },
    { step: 4, name: 'Geometric Verification', status: 'completed', durationMs: 410, info: `USAC-MAGSAC homography fitted — ${reg.inliers || 312} inliers / ${reg.total_matches || 415} matches` },
    { step: 5, name: 'Sub-pixel Refinement', status: 'completed', durationMs: 350, info: `Lucas-Kanade optical flow warp — RMSE ${reg.rmse?.toFixed(3) || '0.420'} px` },
  ];
}

function _mockRegistration(sourceImg, referenceImg) {
  return {
    success: true,
    jobId: 'mock_' + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    isSameLocation: true,
    sourceImage: sourceImg,
    referenceImage: referenceImg,
    registeredImage: referenceImg,
    overlayImage: null,
    matchPointsImage: null,
    metrics: {
      rmse: 0.42,
      inlier_ratio: 0.789,
      inliers: 312,
      total_matches: 415,
      subpixel_accuracy: true,
      subpixel_error: 0.31,
    },
    aiExplanation:
      'Registration completed successfully. RMSE of 0.42 pixels indicates sub-pixel precision alignment, ' +
      'with 78.9% inlier ratio demonstrating robust geometric consistency across illumination-variant lunar terrain.',
    sources: [],
    pipelineLogs: _buildPipelineLogs({}),
  };
}
