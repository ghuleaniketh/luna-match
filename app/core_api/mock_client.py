"""
Mock Core ML Client for LUNA-MATCH AI Layer.
Generates realistic structural registration results, aligned warps, overlays,
and metrics without duplicating the teammate's proprietary ML engine.
"""

from typing import Dict, Any, Optional, Union
from pathlib import Path
import io
import base64
from PIL import Image, ImageDraw, ImageOps
import numpy as np

from app.core_api.client import BaseCoreMLClient, RegistrationResult


def _load_pil(img: Union[str, Path, Image.Image]) -> Image.Image:
    """Load input into RGB PIL Image."""
    if isinstance(img, (str, Path)):
        return Image.open(img).convert("RGB")
    elif isinstance(img, Image.Image):
        return img.convert("RGB")
    raise ValueError(f"Unsupported image type: {type(img)}")


def _pil_to_base64(img: Image.Image) -> str:
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    encoded = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


class MockCoreMLClient(BaseCoreMLClient):
    """
    Realistic Mock Registration Client.
    Provides valid image warps, side-by-side tie-point visualizations,
    alpha overlays, and JSON metrics for isolated testing.
    """

    def register(
        self,
        source_image: Union[str, Path, Image.Image],
        reference_image: Union[str, Path, Image.Image],
        config: Optional[Dict[str, Any]] = None,
    ) -> RegistrationResult:
        config = config or {}

        # Allow forced failure for testing error handling
        if config.get("force_failure", False):
            return RegistrationResult(
                status="failed",
                error_message="Core ML Engine: Insufficient inliers (RANSAC consensus failed below threshold).",
                total_matches=14,
                inliers=3,
                outliers=11,
                inlier_ratio=0.214,
                rmse=4.82,
                subpixel_accuracy=False,
            )

        src_pil = _load_pil(source_image)
        ref_pil = _load_pil(reference_image)

        # Target size matching reference
        w_ref, h_ref = ref_pil.size

        # 1. Generate Registered (Warped) Source Image
        # Resize source to reference frame dimensions
        registered_pil = src_pil.resize((w_ref, h_ref), Image.Resampling.BILINEAR)

        # 2. Generate 50/50 Overlay Image (False Color / Alpha Blend)
        overlay_pil = Image.blend(ref_pil, registered_pil, alpha=0.5)

        # 3. Generate Match-Points Side-by-Side Visualization
        combined_w = src_pil.width + ref_pil.width
        max_h = max(src_pil.height, ref_pil.height)
        match_viz = Image.new("RGB", (combined_w, max_h), color=(20, 20, 25))
        match_viz.paste(src_pil, (0, 0))
        match_viz.paste(ref_pil, (src_pil.width, 0))

        draw = ImageDraw.Draw(match_viz)
        np.random.seed(42)  # Deterministic visualization points
        num_points = 24
        for _ in range(num_points):
            pt1_x = int(np.random.uniform(0.1, 0.9) * src_pil.width)
            pt1_y = int(np.random.uniform(0.1, 0.9) * src_pil.height)
            # Corresponding point with minor displacement
            pt2_x = src_pil.width + int(np.random.uniform(0.1, 0.9) * ref_pil.width)
            pt2_y = int(pt1_y + np.random.uniform(-10, 10))

            # Draw green match line
            draw.line([(pt1_x, pt1_y), (pt2_x, pt2_y)], fill=(50, 220, 120), width=1)
            draw.ellipse([(pt1_x - 3, pt1_y - 3), (pt1_x + 3, pt1_y + 3)], fill=(255, 80, 80))
            draw.ellipse([(pt2_x - 3, pt2_y - 3), (pt2_x + 3, pt2_y + 3)], fill=(80, 180, 255))

        # 4. Assemble realistic metrics
        matrix = [
            [0.9982, -0.0145, 12.4],
            [0.0145, 0.9982, -8.6],
            [0.0, 0.0, 1.0],
        ]

        return RegistrationResult(
            status="success",
            registered_image=_pil_to_base64(registered_pil),
            match_points_image=_pil_to_base64(match_viz),
            overlay_image=_pil_to_base64(overlay_pil),
            transformation_matrix=matrix,
            total_matches=542,
            inliers=428,
            outliers=114,
            inlier_ratio=0.7896,
            rmse=0.42,
            subpixel_error=0.18,
            subpixel_accuracy=True,
            error_message=None,
        )
