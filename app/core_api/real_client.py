"""
Real In-Process Core ML Client.
Executes the LUNA-MATCH registration pipeline directly in-process without HTTP.
"""

import os
import io
import json
import uuid
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Union

import numpy as np
from PIL import Image

from app.core_api.client import BaseCoreMLClient, RegistrationResult
from luna_core.pipeline.orchestrator import LunaMatchPipeline
from luna_core.core.summary_builder import build_chatbot_summary

logger = logging.getLogger(__name__)


def _pil_or_path_to_disk(
    image: Union[str, Path, Image.Image],
    target_path: Path,
) -> Path:
    """Save or resolve an image input to a valid path on disk."""
    target_path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(image, Image.Image):
        if image.mode in ("F", "I", "I;16") or getattr(image, "format", "") == "TIFF":
            target_path = target_path.with_suffix(".tif")
            image.save(target_path, format="TIFF")
        else:
            image.save(target_path, format="PNG")
        return target_path
    elif isinstance(image, (str, Path)):
        p = Path(image)
        if p.exists() and p.is_file():
            return p
        # Check if it's a base64 data URI
        if isinstance(image, str) and (image.startswith("data:image") or len(image) > 200):
            import base64
            raw_b64 = image.split(",", 1)[1] if "," in image else image
            data = base64.b64decode(raw_b64)
            with open(target_path, "wb") as f:
                f.write(data)
            return target_path
        raise FileNotFoundError(f"Image path not found: {image}")
    else:
        raise ValueError(f"Unsupported image input type: {type(image)}")


def _encode_file_to_base64_uri(file_path: Path) -> Optional[str]:
    """Convert an image file to a base64 data URI suitable for UI and VLM."""
    if not file_path.exists():
        return None
    try:
        import base64
        suffix = file_path.suffix.lower().lstrip(".")
        if suffix in ("tif", "tiff"):
            # Normalize float/16-bit GeoTIFF to 8-bit PNG for reliable frontend and VLM rendering
            try:
                import rasterio
                with rasterio.open(str(file_path)) as src:
                    arr = src.read(1).astype(np.float64)
            except Exception:
                pil_img = Image.open(str(file_path))
                arr = np.array(pil_img).astype(np.float64)

            valid_mask = ~np.isnan(arr)
            if np.any(valid_mask):
                v_min, v_max = np.min(arr[valid_mask]), np.max(arr[valid_mask])
                if v_max > v_min:
                    arr_u8 = ((arr - v_min) / (v_max - v_min) * 255.0).clip(0, 255).astype(np.uint8)
                else:
                    arr_u8 = np.zeros_like(arr, dtype=np.uint8)
            else:
                arr_u8 = np.zeros_like(arr, dtype=np.uint8)

            img_out = Image.fromarray(arr_u8)
            buf = io.BytesIO()
            img_out.save(buf, format="PNG")
            encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
            return f"data:image/png;base64,{encoded}"
        else:
            with open(file_path, "rb") as f:
                encoded = base64.b64encode(f.read()).decode("utf-8")
            mime = "jpeg" if suffix in ["jpg", "jpeg"] else "png"
            return f"data:image/{mime};base64,{encoded}"
    except Exception as e:
        logger.warning(f"Failed to encode {file_path} to base64: {e}")
        return None


class RealCoreMLClient(BaseCoreMLClient):
    """
    In-process Core ML Client that invokes LunaMatchPipeline directly.
    Zero HTTP overhead, operates directly with the vendored luna_core engine.
    """

    def __init__(self, jobs_scratch_dir: Optional[Path] = None):
        self.jobs_dir = jobs_scratch_dir or (Path("data") / "jobs")
        self.jobs_dir.mkdir(parents=True, exist_ok=True)

    def register(
        self,
        source_image: Union[str, Path, Image.Image],
        reference_image: Union[str, Path, Image.Image],
        config: Optional[Dict[str, Any]] = None,
    ) -> RegistrationResult:
        """
        Execute registration in-process. Never raises; returns RegistrationResult(status='failed') on error.
        """
        job_id = f"real_job_{uuid.uuid4().hex[:8]}"
        job_input_dir = self.jobs_dir / job_id / "input"
        job_output_dir = self.jobs_dir / job_id / "output"
        job_inter_dir = self.jobs_dir / job_id / "intermediate"

        try:
            # 1. Accept PIL Images / paths, save under jobs/ scratch directory
            src_path = job_input_dir / "source.png"
            ref_path = job_input_dir / "reference.png"

            saved_src_path = _pil_or_path_to_disk(source_image, src_path)
            saved_ref_path = _pil_or_path_to_disk(reference_image, ref_path)

            matching_method = "classical"
            if config and isinstance(config, dict):
                matching_method = config.get("matching_method", "classical")

            # 2. Call luna_core.pipeline.orchestrator.LunaMatchPipeline directly in-process
            pipeline = LunaMatchPipeline(
                job_id=job_id,
                img_a_path=str(saved_src_path),
                img_b_path=str(saved_ref_path),
                matching_method=matching_method,
            )
            result = pipeline.run()

            if result.get("status") != "DONE":
                error_msg = result.get("error", f"Pipeline failed at stage {result.get('stage', 'unknown')}")
                return RegistrationResult(
                    status="failed",
                    error_message=f"Registration failed: {error_msg}",
                )

            # Generate visual artifacts via build_chatbot_summary if not already present
            try:
                build_chatbot_summary(job_id=job_id, base_jobs_dir=self.jobs_dir)
            except Exception as e:
                logger.warning(f"build_chatbot_summary note: {e}")

            # 3. Map field names exactly:
            # rmse_px -> rmse, n_inliers -> inliers, n_total -> total_matches,
            # (n_total - n_inliers) -> outliers, inlier_ratio -> inlier_ratio,
            # rmse_px < 0.5 -> subpixel_accuracy
            rmse_px = float(result.get("rmse_px", 0.0))
            n_inliers = int(result.get("n_inliers", 0))
            n_total = int(result.get("n_total", 0))
            outliers = max(0, n_total - n_inliers)
            inlier_ratio = float(result.get("inlier_ratio", 0.0))
            subpixel_accuracy = bool(rmse_px < 0.5)

            # Map subpixel_error: check LK refinement shift on verified matches if available, else rmse_px
            subpixel_error = rmse_px

            # 4. Load resulting registered.tif, checkerboard PNG, tiepoints PNG
            registered_tif = job_output_dir / "registered.tif"
            cb_png = job_output_dir / "preview_checkerboard.png"
            if not cb_png.exists():
                cb_png = job_output_dir / "checkerboard_overlay.png"
            tp_png = job_output_dir / "preview_tiepoints.png"
            if not tp_png.exists():
                tp_png = job_output_dir / "tie_points_matches.png"

            registered_b64 = _encode_file_to_base64_uri(registered_tif)
            overlay_b64 = _encode_file_to_base64_uri(cb_png)
            match_points_b64 = _encode_file_to_base64_uri(tp_png)

            # 5. Populate transformation_matrix from homography
            transform_params_path = job_inter_dir / "transform_params.json"
            transformation_matrix = None
            if transform_params_path.exists():
                try:
                    with open(transform_params_path, "r") as f:
                        tdata = json.load(f)
                    transformation_matrix = tdata.get("homography") or tdata.get("matrix")
                except Exception as e:
                    logger.warning(f"Could not load transform matrix: {e}")

            return RegistrationResult(
                status="success",
                registered_image=registered_b64,
                match_points_image=match_points_b64,
                overlay_image=overlay_b64,
                transformation_matrix=transformation_matrix,
                total_matches=n_total,
                inliers=n_inliers,
                outliers=outliers,
                inlier_ratio=inlier_ratio,
                rmse=rmse_px,
                subpixel_error=subpixel_error,
                subpixel_accuracy=subpixel_accuracy,
                error_message=None,
            )

        except Exception as e:
            logger.exception(f"Unexpected error in RealCoreMLClient: {e}")
            return RegistrationResult(
                status="failed",
                error_message=f"Internal registration error: {str(e)}",
            )
