/**
 * LUNA-MATCH API abstraction layer.
 * Uses the production registration job API as the only source of result data.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://lunarcoreengine.onrender.com').replace(/\/$/, '');
const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 120000;

async function parseResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res;
}

async function getJSON(path) {
  const res = await parseResponse(await fetch(`${BASE_URL}${path}`));
  return res.json();
}

async function postJSON(path, body) {
  const res = await parseResponse(await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
  return res.json();
}

function dataUriToBlob(dataUri, fallbackName) {
  if (dataUri instanceof Blob) return dataUri;
  if (typeof dataUri !== 'string' || !dataUri.startsWith('data:')) {
    throw new Error(`Invalid image supplied for ${fallbackName}`);
  }

  const [metadata, encoded] = dataUri.split(',');
  const mimeType = metadata.match(/data:(.*?);base64/)?.[1] || 'application/octet-stream';
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  return new File([bytes], fallbackName, { type: mimeType });
}

async function registerImages(sourceImg, referenceImg) {
  const formData = new FormData();
  formData.append('img_a', dataUriToBlob(sourceImg, 'source-image'));
  formData.append('img_b', dataUriToBlob(referenceImg, 'reference-image'));

  const res = await parseResponse(await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    body: formData,
  }));
  return res.json();
}

async function waitForJob(jobId) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    const status = await getJSON(`/jobs/${encodeURIComponent(jobId)}`);
    if (status.status === 'DONE') return status;
    if (['FAILED', 'ERROR'].includes(status.status)) {
      throw new Error(`Registration job ${status.status.toLowerCase()}`);
    }
    await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error('Registration timed out while waiting for the backend');
}

function previewUrl(jobId, kind) {
  return `${BASE_URL}/jobs/${encodeURIComponent(jobId)}/preview?kind=${kind}`;
}

function normalizeSummary(jobId, sourceImg, referenceImg, summary) {
  const apiMetrics = summary.metrics || {};
  const quality = summary.quality_assessment || {};
  const metrics = {
    rmse: apiMetrics.rmse_px ?? apiMetrics.rmse ?? null,
    inlier_ratio: apiMetrics.inlier_ratio ?? null,
    inliers: apiMetrics.n_inliers ?? apiMetrics.inliers ?? null,
    total_matches: apiMetrics.total_matches ?? apiMetrics.n_matches ?? null,
    subpixel_accuracy: apiMetrics.subpixel_accuracy ?? null,
    subpixel_error: apiMetrics.subpixel_error ?? null,
    sdi: apiMetrics.sdi ?? null,
    grade: quality.grade,
    confidence_label: quality.confidence_label,
  };

  return {
    success: true,
    jobId,
    timestamp: summary.timestamp || null,
    sessionId: jobId,
    sourceImage: sourceImg,
    referenceImage: referenceImg,
    registeredImage: previewUrl(jobId, 'checkerboard'),
    overlayImage: previewUrl(jobId, 'residual'),
    matchPointsImage: previewUrl(jobId, 'tiepoints'),
    metrics,
    aiExplanation: quality.reasoning || '',
    warnings: quality.warnings || [],
    qualityAssessment: quality,
    sources: summary.sources || [],
    pipelineLogs: summary.pipeline_logs || [],
  };
}

export async function checkHealth() {
  try {
    return await getJSON('/health');
  } catch {
    return null;
  }
}

export async function sendChat(query, _sourceImage = null, _referenceImage = null, options = {}) {
  if (!options.jobId) {
    throw new Error('Complete an image registration before starting result chat.');
  }

  const result = await postJSON('/chat', {
    job_id: options.jobId,
    session_id: options.sessionId || options.jobId,
    message: query,
  });

  return {
    text_response: result.reply || '',
    sources: result.sources || [],
    sessionId: result.session_id || options.sessionId || options.jobId,
  };
}

export async function getChatHistory(jobId) {
  return getJSON(`/chat/${encodeURIComponent(jobId)}/history`);
}

export async function runCorrespondence(sourceImg, referenceImg) {
  const registration = await registerImages(sourceImg, referenceImg);
  const jobId = registration.job_id;
  if (!jobId) throw new Error('Registration response did not include a job ID');

  await waitForJob(jobId);
  const summary = await getJSON(`/jobs/${encodeURIComponent(jobId)}/summary`);
  return normalizeSummary(jobId, sourceImg, referenceImg, summary);
}
