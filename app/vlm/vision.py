"""
High-Level Multimodal Vision Layer for LUNA-MATCH.
Provides modular visual analysis, comparison, and registration interpretation routines.
"""

from typing import List, Union, Optional, Dict, Any
from pathlib import Path
from PIL import Image
import json

from app.vlm.client import BaseVLMClient, get_vlm_client
from app.vlm.prompts import (
    SINGLE_IMAGE_ANALYSIS_PROMPT,
    IMAGE_COMPARISON_PROMPT,
    REGISTRATION_EXPLANATION_PROMPT,
)


class LunarVisionEngine:
    def __init__(self, client: Optional[BaseVLMClient] = None):
        self.client = client or get_vlm_client()

    def analyze_image(
        self,
        image: Union[str, Path, Image.Image],
        user_question: Optional[str] = None,
    ) -> str:
        """
        Analyze an individual lunar image for morphology, illumination, and landmark value.
        """
        prompt = SINGLE_IMAGE_ANALYSIS_PROMPT
        if user_question:
            prompt += f"\n\nUser Question: {user_question}"

        return self.client.generate(prompt=prompt, images=[image])

    def compare_images(
        self,
        source_image: Union[str, Path, Image.Image],
        reference_image: Union[str, Path, Image.Image],
        user_question: Optional[str] = None,
    ) -> str:
        """
        Descriptively compare source and reference lunar images for scale, sun-angle, and overlap.
        """
        prompt = IMAGE_COMPARISON_PROMPT
        if user_question:
            prompt += f"\n\nUser Question: {user_question}"

        return self.client.generate(
            prompt=prompt,
            images=[source_image, reference_image],
        )

    def explain_registration(
        self,
        source_image: Optional[Union[str, Path, Image.Image]] = None,
        reference_image: Optional[Union[str, Path, Image.Image]] = None,
        overlay_image: Optional[Union[str, Path, Image.Image]] = None,
        metrics: Optional[Dict[str, Any]] = None,
        user_question: Optional[str] = None,
        rag_context: Optional[str] = None,
    ) -> str:
        """
        Explain Core ML registration results by combining factual metrics, visual overlay, and RAG context.
        """
        metrics_dict = metrics or {
            "status": "unknown",
            "inliers": 0,
            "inlier_ratio": 0.0,
            "rmse": 0.0,
            "subpixel_accuracy": False,
        }
        metrics_dict = {
            key: metrics_dict.get(key)
            for key in ("status", "total_matches", "inliers", "outliers", "inlier_ratio", "rmse", "subpixel_error", "subpixel_accuracy")
            if key in metrics_dict
        }
        metrics_json = json.dumps(metrics_dict, indent=2)
        question = user_question or "Is this image registration reliable and well aligned?"
        context = (rag_context or "No additional scientific literature retrieved.")[:3000]

        prompt = REGISTRATION_EXPLANATION_PROMPT.format(
            metrics_json=metrics_json,
            rag_context=context,
            user_question=question,
        )

        # Collect available images
        if overlay_image is not None:
            images = [overlay_image]
        else:
            images = [image for image in (source_image, reference_image) if image is not None]

        response = self.client.generate(
            prompt=prompt,
            images=images if images else None,
        )
        measured_summary = (
            f"Overlay inspection. Measured metrics: inliers={metrics_dict.get('inliers', 'n/a')}, "
            f"inlier_ratio={metrics_dict.get('inlier_ratio', 'n/a')}"
            f" ({metrics_dict.get('inlier_ratio', 0) * 100:.1f}%), "
            f"RMSE={metrics_dict.get('rmse', 'n/a')}, "
            f"subpixel_accuracy={metrics_dict.get('subpixel_accuracy', 'n/a')}."
        )
        if not any(str(value) in response for value in metrics_dict.values() if value is not None):
            return f"{measured_summary}\n\n{response}"
        return response

    def answer_visual_question(
        self,
        images: List[Union[str, Path, Image.Image]],
        question: str,
        rag_context: Optional[str] = None,
    ) -> str:
        """
        Answer arbitrary multimodal question over lunar images with optional RAG context.
        """
        prompt = question
        if rag_context:
            prompt = f"Retrieved Scientific Context:\n{rag_context}\n\nQuestion: {question}"

        return self.client.generate(prompt=prompt, images=images)
