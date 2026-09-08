"""
Core ML API Client & Schema Definition.
Provides an abstract base interface and HTTP client to communicate with the Core ML teammate's engine.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Union
from pathlib import Path
from pydantic import BaseModel, Field
from PIL import Image
import requests

from app.config import settings


class RegistrationResult(BaseModel):
    """Standardized schema for Core ML registration output."""
    status: str = Field(description="Execution status: 'success' or 'failed'")
    registered_image: Optional[str] = Field(None, description="Base64 data URI or path of aligned warped image")
    match_points_image: Optional[str] = Field(None, description="Base64 data URI or path of match point visualization")
    overlay_image: Optional[str] = Field(None, description="Base64 data URI or path of registration overlay")
    transformation_matrix: Optional[list] = Field(None, description="3x3 homography or 2x3 affine transformation matrix")
    total_matches: int = Field(0, description="Total putative keypoint matches before RANSAC")
    inliers: int = Field(0, description="Number of geometrically consistent RANSAC inliers")
    outliers: int = Field(0, description="Number of rejected spurious matches")
    inlier_ratio: float = Field(0.0, description="Inliers / Total Matches (0.0 to 1.0)")
    rmse: float = Field(0.0, description="Root Mean Square Error in pixels")
    subpixel_error: float = Field(0.0, description="Sub-pixel error offset in pixels")
    subpixel_accuracy: bool = Field(False, description="True if RMSE < 0.5 pixels")
    error_message: Optional[str] = Field(None, description="Failure reason if status is 'failed'")

    def to_metrics_dict(self) -> Dict[str, Any]:
        """Extract clean numerical metrics dictionary for VLM explanation and UI."""
        return {
            "status": self.status,
            "total_matches": self.total_matches,
            "inliers": self.inliers,
            "outliers": self.outliers,
            "inlier_ratio": round(self.inlier_ratio, 4),
            "inlier_ratio_percent": f"{round(self.inlier_ratio * 100, 2)}%",
            "rmse": round(self.rmse, 3),
            "subpixel_error": round(self.subpixel_error, 3),
            "subpixel_accuracy": self.subpixel_accuracy,
        }


class BaseCoreMLClient(ABC):
    """Abstract interface for Core ML Registration Engine."""

    @abstractmethod
    def register(
        self,
        source_image: Union[str, Path, Image.Image],
        reference_image: Union[str, Path, Image.Image],
        config: Optional[Dict[str, Any]] = None,
    ) -> RegistrationResult:
        """Register source image to reference coordinate frame."""
        pass


class HttpCoreMLClient(BaseCoreMLClient):
    """
    HTTP Client connecting to the live Core ML engine teammate API.
    Can be configured via CORE_ML_API_URL.
    """

    def __init__(
        self,
        api_url: str = settings.CORE_ML_API_URL,
        timeout: int = settings.CORE_ML_TIMEOUT_SECONDS,
    ):
        self.api_url = api_url.rstrip("/")
        self.timeout = timeout

    def register(
        self,
        source_image: Union[str, Path, Image.Image],
        reference_image: Union[str, Path, Image.Image],
        config: Optional[Dict[str, Any]] = None,
    ) -> RegistrationResult:
        from app.vlm.client import encode_image_to_base64

        payload = {
            "source_image": encode_image_to_base64(source_image),
            "reference_image": encode_image_to_base64(reference_image),
            "config": config or {},
        }

        try:
            response = requests.post(
                f"{self.api_url}/register",
                json=payload,
                timeout=self.timeout,
            )
            response.raise_for_status()
            data = response.json()
            return RegistrationResult(**data)
        except Exception as e:
            return RegistrationResult(
                status="failed",
                error_message=f"Error connecting to Core ML API ({self.api_url}): {str(e)}",
            )
