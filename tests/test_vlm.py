"""
Automated Test Suite for LUNA-MATCH VLM Abstraction (Phase 3).
Validates multimodal client abstraction, base64 encoding, prompts, and vision engine routines.
"""

from pathlib import Path
import pytest
from PIL import Image
import numpy as np

from app.vlm.client import (
    BaseVLMClient,
    MockVLMClient,
    OpenAIVLMClient,
    encode_image_to_base64,
    get_vlm_client,
)
from app.vlm.vision import LunarVisionEngine


@pytest.fixture
def sample_lunar_images(tmp_path):
    """Create dummy synthetic lunar images for testing."""
    img1_path = tmp_path / "source_lunar.png"
    img2_path = tmp_path / "reference_lunar.png"
    overlay_path = tmp_path / "overlay_lunar.png"

    # Create dummy 100x100 grayscale image
    arr1 = np.full((100, 100, 3), 128, dtype=np.uint8)
    arr2 = np.full((100, 100, 3), 140, dtype=np.uint8)
    arr_overlay = np.full((100, 100, 3), 135, dtype=np.uint8)

    Image.fromarray(arr1).save(img1_path)
    Image.fromarray(arr2).save(img2_path)
    Image.fromarray(arr_overlay).save(overlay_path)

    return img1_path, img2_path, overlay_path


def test_base64_image_encoding(sample_lunar_images):
    """Test image encoding to standard data URI."""
    img1_path, _, _ = sample_lunar_images
    data_url = encode_image_to_base64(img1_path)
    assert data_url.startswith("data:image/png;base64,")
    assert len(data_url) > 50

    # Test PIL Image encoding
    pil_img = Image.new("RGB", (50, 50), color="gray")
    pil_url = encode_image_to_base64(pil_img)
    assert pil_url.startswith("data:image/png;base64,")


def test_vlm_factory_mock():
    """Test factory returns Mock client when configured."""
    client = get_vlm_client()
    assert isinstance(client, BaseVLMClient)


def test_single_image_analysis(sample_lunar_images):
    """Test single lunar image description."""
    img1_path, _, _ = sample_lunar_images
    vision = LunarVisionEngine(client=MockVLMClient())

    response = vision.analyze_image(
        image=img1_path,
        user_question="Describe this image.",
    )

    assert "Surface Morphology" in response
    assert "Illumination" in response
    assert "Scale" in response or "Resolution" in response
    assert "Landmark" in response


def test_two_image_comparison(sample_lunar_images):
    """Test descriptive comparison between source and reference lunar images."""
    img1_path, img2_path, _ = sample_lunar_images
    vision = LunarVisionEngine(client=MockVLMClient())

    response = vision.compare_images(
        source_image=img1_path,
        reference_image=img2_path,
        user_question="Describe the visible terrain and explain whether the two images appear to show the same general region.",
    )

    assert "Terrain & Regional Overlap" in response or "Overlap" in response
    assert "Disparity" in response or "Scale" in response
    assert "Illumination" in response or "Sun Angle" in response


def test_explain_registration_grounding(sample_lunar_images):
    """Test registration explanation combines metrics, visual overlay, and RAG context."""
    img1_path, img2_path, overlay_path = sample_lunar_images
    vision = LunarVisionEngine(client=MockVLMClient())

    metrics = {
        "status": "success",
        "inliers": 428,
        "inlier_ratio": 0.789,
        "rmse": 0.42,
        "subpixel_accuracy": True,
    }

    response = vision.explain_registration(
        source_image=img1_path,
        reference_image=img2_path,
        overlay_image=overlay_path,
        metrics=metrics,
        user_question="Is this registration reliable?",
        rag_context="OHRC provides 0.25-0.32m resolution while TMC-2 provides 5m stereo.",
    )

    # Must preserve exact metrics
    assert "428" in response
    assert "0.42" in response
    assert "78.9" in response
    assert "sub-pixel" in response.lower() or "subpixel" in response.lower()
    assert "overlay" in response.lower() or "inspection" in response.lower()
