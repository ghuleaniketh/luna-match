# LUNA-MATCH AI Engine & Frontend Integration Handoff

**Target Audience:** Frontend engineering team, backend developers, and system evaluators.  
**Repository:** `ghuleaniketh/luna-match` (Branch: `integration`)  
**Core Stack:** FastAPI, Python 3.12, PyTorch/SIFT Core Engine, Qwen-VL (via Groq/OpenAI compatible client), ChromaDB/RAG, Vite, React 19, Tailwind CSS.

---

## 1. Architectural Overview & Two-Stage Flow

To ensure sub-2-second user interaction times without sacrificing deep multimodal scientific evaluation, the registration pipeline and multimodal explanation are strictly decoupled into a **Two-Stage Flow** on the single endpoint `POST /orchestrate`.

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 User attaches 2 images                 │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
                                             ▼
                             Stage 1: Registration Intent
                     POST /orchestrate  (with source_image_b64 & ref)
                                             │
                        ┌────────────────────┴───────────────────┐
                        │  Core In-Process Registration Engine   │
                        │  - SIFT / Delaunay / ANMS Filtering    │
                        │  - MAGSAC++ Homography Matrix          │
                        │  - Lucas-Kanade Sub-pixel Refinement   │
                        └────────────────────┬───────────────────┘
                                             │  (~1.5s warm engine execution)
                                             ▼
                      Returns fast registration_result & metrics:
                      - Candidate matches, inliers, outliers, RMSE
                      - Base64 previews: registered, match points, overlay
                      - Templated text: "Registration complete (74 inliers...)"
                                             │
                  ┌──────────────────────────┴─────────────────────────────┐
                  │         User asks follow-up or clicks "Explain"        │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
                                             ▼
                             Stage 2: Explanation Intent
                     POST /orchestrate (with current_registration object)
                                             │
                        ┌────────────────────┴───────────────────┐
                        │       Multimodal Synthesis Layer       │
                        │       - RAG Lunar Knowledge Search     │
                        │       - Qwen3-VL Vision Engine         │
                        └────────────────────┬───────────────────┘
                                             │  (~16s VLM generation)
                                             ▼
                      Returns deep scientific interpretation:
                      - Inlier confidence analysis
                      - Morphological landmark & crater alignment
                      - Illumination / shadow angle disparities
                      - Grounded literature citations
```

### Key Performance Benefits
- **Stage 1 (Registration)** runs in **~1.5s** (warm engine time on 384×302 scenes; ~9s on large unscaled 1536×1024 rasters). The user sees alignment metrics and interactive visual overlays immediately without waiting for LLM inference.
- **Stage 2 (Explanation)** is on-demand. When the user requests an explanation or asks about reliability, the backend combines the existing registration metrics, the alignment overlay, and retrieved lunar mission literature to generate a detailed scientific breakdown.

---

## 2. Real Request & Response JSON Shapes

These examples are captured directly from actual test runs against `POST http://localhost:8000/orchestrate`.

### Stage 1: Registration-Only Call

#### Request
```json
POST /orchestrate
Content-Type: application/json

{
  "query": "Register these two lunar images and evaluate alignment.",
  "source_image_b64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "reference_image_b64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
}
```

#### Response (Received in ~1.5s - 2.0s)
```json
{
  "intent": "register_images",
  "text_response": "Registration complete (514 inliers, RMSE: 0.328 px, inlier ratio: 78.2%). Ask me to explain these results for a detailed scientific interpretation.",
  "registration_result": {
    "status": "success",
    "total_matches": 657,
    "inliers": 514,
    "outliers": 143,
    "inlier_ratio": 0.7823,
    "rmse": 0.3284,
    "subpixel_error": 0.3284,
    "subpixel_accuracy": true,
    "transformation_matrix": [
      [0.9821, -0.0124, 14.28],
      [0.0118,  0.9854, -8.62],
      [-0.00001, 0.00002, 1.0]
    ],
    "registered_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYAAAAE...",
    "match_points_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAwAAAAE...",
    "overlay_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYAAAAE...",
    "error_message": null
  },
  "sources": [],
  "tools_called": [
    "register_images"
  ]
}
```

---

### Stage 2: Explanation Follow-Up Call

#### Request
Pass `current_registration` containing the `registration_result` from Stage 1. Images do not need to be re-uploaded if `current_registration` already has the `overlay_image`.
```json
POST /orchestrate
Content-Type: application/json

{
  "query": "Is this registration reliable and how accurate is the alignment?",
  "current_registration": {
    "status": "success",
    "total_matches": 657,
    "inliers": 514,
    "outliers": 143,
    "inlier_ratio": 0.7823,
    "rmse": 0.3284,
    "subpixel_error": 0.3284,
    "subpixel_accuracy": true,
    "overlay_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYAAAAE..."
  }
}
```

#### Response (Received in ~16s)
```json
{
  "intent": "explain_registration",
  "text_response": "Based on the visual data and the Core ML engine outputs, here is the comprehensive evaluation of the lunar image registration.\n\n### 1. Metrics Summary\n* **Status:** `success`\n* **Total Matches:** 657\n* **Inliers:** 514\n* **Inlier Ratio:** 78.23%\n* **RMSE (Root Mean Square Error):** 0.328 pixels\n* **Sub-pixel Accuracy:** `True` (0.328 px error)\n\n### 2. Visual Overlay Inspection\nThe checkerboard alignment overlay demonstrates excellent boundary continuity across the crater rim features. The transition between the source and reference tiles shows no perceptible shearing or double edges, confirming tight spatial registration.\n\n### 3. Scientific Interpretation\n* **Inlier Ratio (> 70%):** An inlier ratio of 78.23% indicates exceptionally high confidence. The MAGSAC++ estimator converged on a consistent geometric model without degeneration.\n* **Sub-pixel Accuracy (< 0.5 px):** The achieved RMSE of 0.328 pixels satisfies ISRO Chandrayaan-2 planetary mapping precision standards for high-resolution DEM generation.",
  "registration_result": {
    "status": "success",
    "total_matches": 657,
    "inliers": 514,
    "outliers": 143,
    "inlier_ratio": 0.7823,
    "rmse": 0.3284,
    "subpixel_error": 0.3284,
    "subpixel_accuracy": true
  },
  "sources": [
    {
      "document": "Image Registration Metrics",
      "mission": "General Lunar Science",
      "sensor": "Core Registration / Metrics",
      "section": "A. Root Mean Square Error (RMSE)",
      "score": 0.709,
      "snippet": "[Image Registration Metrics | A. Root Mean Square Error (RMSE)]: - Definition: The standard scientific metric measuring residual geometric displacement..."
    }
  ],
  "tools_called": [
    "explain_registration"
  ]
}
```

---

## 3. What Is Already Wired and Tested vs. Outstanding Work

### Already Completed & Verified (Branch `integration`)

1. **In-Process Core Engine Integration**:
   - `app/core_api/real_client.py` links directly to `luna_core.pipeline.orchestrator.LunaMatchPipeline`. No HTTP latency between AI layer and engine.
   - Outputs valid Base64 PNG data URIs for `registered_image`, `match_points_image`, and `overlay_image` (tested and verified with PIL `Image.verify()` and `.load()`).

2. **Backend Intent Dispatching & Performance**:
   - `app/orchestrator/agent.py`: `REGISTER_IMAGES` returns in ~1.5s (engine-only, no VLM).
   - `EXPLAIN_REGISTRATION`: Triggered automatically on follow-up questions when `current_registration` is passed.
   - VLM latency reduced from ~55s down to ~16–18s by capping `VLM_MAX_TOKENS = 600`, resizing VLM base64 images to `max_dim = 768`, and removing redundant image comparisons.

3. **Frontend API Client (`src/api/lunaMatch.js`)**:
   - `orchestrate()` supports `query`, `source_image_b64`, `reference_image_b64`, and `current_registration`.
   - `runCorrespondence()` routes real base64 image pairs through `/orchestrate` and maps structured metrics (`matches`, `inliers`, `ratio`, `rmse`, `subpixel`, `transform`).

4. **Frontend UI Components**:
   - `ChatInput.jsx`: Accepts two file attachments with visual badges (`Image 1 (Source)` / `Image 2 (Ref)`), thumbnails, clear buttons, and disabled-state handling.
   - `ChatPanel.jsx`:
     - Dispatches image pairs to `/orchestrate`.
     - Maintains `currentRegistration` in React state and automatically passes it when the user clicks quick actions (e.g. `Explain Result`, `Explain RMSE`) or asks follow-up questions.
     - Performs client-side canvas downscaling (max 1024px) before encoding base64, preventing multi-megabyte payloads and avoiding browser memory bloat.
   - `RegistrationResultCard.jsx`: Displays live numerical cards (Candidate matches, Inliers, Inlier ratio, RMSE, Sub-pixel accuracy) and includes expandable toggle previews for Registered Image, Match Points, and Overlay.
   - `AnalysisWorkspace.jsx`: Supports drag-and-drop / file selection for 2 images with client-side canvas downscaling and displays real registration results.

5. **Build & Symlink Deduplication**:
   - `vite.config.js`: Added `resolve.dedupe: ['react', 'react-dom']` to prevent React multi-instance crashes (`Cannot read properties of null (reading 'useState')`) caused by symlinked `node_modules`.
   - Production bundle compiles cleanly via `npm run build` in < 2 seconds.

---

### Outstanding / Future Frontend Work (Out of Scope for This Handoff)

1. **Persistent Session History**:
   - Currently, chat messages and `currentRegistration` state reside in React component memory. Refreshing the browser resets the chat session. If multi-session history is desired, wire messages to `localStorage` or a backend session store.
2. **Server-Sent Events (SSE) / Streaming**:
   - The `/orchestrate` endpoint currently returns a complete JSON response. If token-by-token streaming is desired for the explanation step, an SSE endpoint (e.g. `/orchestrate/stream`) can be added to stream VLM tokens progressively.
3. **Three.js Animation Throttling**:
   - The 3D canvas (`SpaceScene.jsx`, `MoonModel.jsx`) runs a continuous 60fps render loop. Adding an intersection observer or pausing `useFrame` when the Chat Assistant modal or Analysis Workspace is focused will save GPU cycles on low-end laptops.

---

## 4. Critical Warning Regarding Automated Headless Browser Testing

> [!WARNING]
> **Do not run automated headless Chrome / Playwright browser tests on memory-limited machines alongside dev servers.**

### What Happened
During testing on an 11 GB RAM / 4 GB Swap Linux machine:
- Spawning headless Chrome (`google-chrome-stable --headless=new`) alongside the Vite dev server, Uvicorn backend, Three.js 3D WebGL render loop, and Node CDP scripts completely consumed all available RAM and filled 100% of Swap (4.0 GB used).
- This triggered the Linux Kernel Out-Of-Memory (OOM) killer, which sent `SIGKILL` to `antigravity-ide` and dumped core.

### Testing Recommendations for Team Members
- **Backend Verification**: Always verify backend API endpoints via direct HTTP calls (`pytest`, `requests`, `fastapi.testclient.TestClient`, or `curl`).
- **Frontend Verification**: Test frontend components manually in your everyday desktop browser at `http://localhost:5173`.
- **Component Unit Testing**: Use Vitest / React Testing Library with JSDOM rather than full headless Chromium with WebGL rendering.

---

## 5. Quickstart: Running Backend & Frontend Locally

### Start Backend (Port 8000)
```bash
source /home/yesh/.venvs/luna-match/bin/activate
cd /run/media/yesh/NEXUS\ LAB/SIH26/ghuleaniketh-luna-match
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Verify health:
```bash
curl http://127.0.0.1:8000/health
```

### Start Frontend (Port 5173)
```bash
cd /run/media/yesh/NEXUS\ LAB/SIH26/ghuleaniketh-luna-match
npm run dev
```
Open `http://127.0.0.1:5173` in your browser.
