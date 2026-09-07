# Smart India Hackathon 2026 - Problem Statement SIH26166

**Title**: Multi-modal, Sun angle and scale invariant image correspondence using Chandrayaan-2 optical images (OHRC, TMC and IIRS)
**Category**: Space Technology / Remote Sensing / AI-ML
**Organization / Domain**: ISRO / Planetary Science

## Background & Problem Description
Chandrayaan-2 orbiter carries multiple scientific payloads with vastly different spatial resolutions, spectral bands, and imaging geometries:
1. **OHRC**: Ultra-high resolution (0.25 m – 0.32 m), small swath, high detail, varied illumination.
2. **TMC-2**: Triplet stereo panchromatic (5.0 m resolution), wide swath (20 km), 3D DEM generation.
3. **IIRS**: Hyperspectral imaging (80 m resolution, 0.8–5.0 µm, 256 bands), mineralogy and hydration.

## Key Technical Challenges
1. **Multi-Scale Invariance**: Large scale disparities (~16x between TMC-2 and OHRC; >250x between IIRS and OHRC).
2. **Sun Angle & Illumination Invariance**: Drastic differences in solar elevation and azimuth angles create inverted or shifted shadow patterns across repeat orbits, confusing standard intensity-based matchers.
3. **Multi-Modal / Spectral Invariance**: Hyperspectral radiance and band absorption versus panchromatic surface reflectance.
4. **Spatial Uniformity & Sub-Pixel Precision**: Ensuring match points are evenly distributed across the scene to prevent localized warping distortions and achieving sub-pixel registration accuracy (RMSE < 1.0 pixel).

## Role of AI Layer in LUNA-MATCH
The AI Layer serves as the intelligent interface that:
1. Integrates with the Core ML Registration Engine without replacing its mathematical calculations.
2. Uses the **Qwen3-VL-8B-Instruct** Multimodal VLM for visual analysis, overlay interpretation, and qualitative alignment evaluation.
3. Utilizes a grounded **RAG** system to provide authoritative ISRO/planetary science context.
4. Orchestrates user queries, directs tool calls, and explains measured quantitative results (RMSE, Inlier Ratio, Sub-pixel accuracy) with strict scientific fidelity without hallucinations.
