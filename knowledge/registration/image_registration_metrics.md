# Lunar Image Registration Concepts and Evaluation Metrics

**Domain**: Planetary Image Processing & Computer Vision
**Key Standards**: Photogrammetry, Feature Correspondence, Geometric Alignment

## 1. The Core Registration Pipeline
In planetary remote sensing, registering a Source (Sensed) image to a Reference (Base) image involves finding corresponding physical ground features across different resolutions, lighting geometries, and sensor modalities:
1. **Feature Extraction**: Detecting stable salient points using interest point detectors (e.g., SIFT, ORB, SuperPoint, LoFTR).
2. **Feature Description**: Computing illumination- and scale-invariant descriptors for candidate keypoints.
3. **Feature Matching**: Establishing initial putative candidate correspondences using nearest-neighbor search with ratio tests (e.g., Lowe's ratio test).
4. **Outlier Rejection (RANSAC)**: Applying Random Sample Consensus to filter out spurious false matches caused by repetitive lunar terrain, shadow shifts, or noise.
5. **Uniform Match-Point Selection**: Filtering keypoints to ensure balanced spatial coverage across the entire image grid rather than dense clustering in a single high-contrast crater.
6. **Sub-Pixel Refinement**: Optimizing keypoint coordinate precision to sub-pixel accuracy (< 0.5 pixels) via quadratic Taylor expansion or cross-correlation.
7. **Transformation Estimation & Warping**: Computing the optimal geometric transformation model (Rigid, Similarity, Affine, Homography/Projective, or Thin-Plate Spline) to warp the source image into the reference coordinate frame.

---

## 2. Quantitative Evaluation Metrics

### A. Root Mean Square Error (RMSE)
- **Definition**: The standard scientific metric measuring the geometric deviation between corresponding ground points after applying the computed transformation.
- **Formula**:
  $$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^{N} \|\mathbf{x}_i^{\text{ref}} - T(\mathbf{x}_i^{\text{src}})\|^2}$$
  where $\mathbf{x}_i^{\text{ref}}$ is the reference coordinate, $\mathbf{x}_i^{\text{src}}$ is the source coordinate, and $T(\cdot)$ is the estimated transformation matrix.
- **Scientific Interpretation**:
  - $\text{RMSE} < 0.5 \text{ pixels}$: Excellent alignment with true sub-pixel precision.
  - $0.5 \le \text{RMSE} \le 1.0 \text{ pixels}$: High-quality registration, scientifically reliable for multi-sensor fusion.
  - $1.0 < \text{RMSE} \le 2.0 \text{ pixels}$: Acceptable for broad contextual overlays, but shows slight visual or geometric discrepancy.
  - $\text{RMSE} > 2.0 \text{ pixels}$: Suboptimal or degraded registration; warrants re-estimation or manual inspection.

### B. Inliers and Inlier Ratio
- **Total Matches**: The total count of raw putative correspondences found before outlier filtering.
- **Inlier Count**: The number of geometrically consistent match points that satisfy the RANSAC transformation model within a defined epipolar/reprojection distance threshold (typically 1–3 pixels).
- **Inlier Ratio**:
  $$\text{Inlier Ratio} = \frac{\text{Number of Inliers}}{\text{Total Matches}}$$
- **Scientific Interpretation**:
  - Inlier Ratio $\ge 60\%$: Robust, highly confident geometric match.
  - Inlier Ratio $30\% - 59\%$: Moderately confident; RANSAC isolated valid structure amidst noise/shadow variations.
  - Inlier Ratio $< 30\%$: Low confidence; high risk of degenerate geometric fitting (e.g., collinear points or local minima).

### C. Sub-Pixel Accuracy
- **Definition**: The ability to localize corresponding physical features and alignment error to fractions of a pixel (e.g., 0.1 to 0.4 pixels), overcoming the discrete grid resolution limit of the camera detector.
- **Importance in Lunar Science**: Vital for sub-meter hazard mapping (OHRC), seamless stereo DTM height calculations (TMC-2), and high-confidence spectral band extraction (IIRS).

### D. Uniform Distribution of Match Points
- **Importance**:
  - If 500 match points are all clustered inside a single crater rim in the top-left corner, the estimated transformation matrix will be severely biased (lever-arm effect), causing significant rotational drift and warping distortion in the bottom-right region.
  - A uniform spatial grid distribution ensures that the transformation parameters are well-conditioned across all image quadrants, preventing geometric divergence and local deformation.
