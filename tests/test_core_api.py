"""
Automated Test Suite for Core ML Client and Mock Engine (Phase 4).
Validates schema contracts, image warp/overlay generation, and metric integrity.
"""

import pytest
from PIL import Image
import numpy as np

from app.core_api.client import RegistrationResult
from app.core_api.mock_client import MockCoreMLClient
from app.core_api import get_core_ml_client


@pytest.fixture
def synthetic_images(tmp_path):
    """Create test images."""
    src_path = tmp_path / "src.png"
    ref_path = tmp_path / "ref.png"

    Image.fromarray(np.full((120, 120, 3), 100, dtype=np.uint8)).save(src_path)
    Image.fromarray(np.full((120, 120, 3), 150, dtype=np.uint8)).save(ref_path)

    return src_path, ref_path


def test_mock_registration_success(synthetic_images):
    """Test standard successful registration."""
    src, ref = synthetic_images
    client = MockCoreMLClient()

    result: RegistrationResult = client.register(source_image=src, reference_image=ref)

    assert result.status == "success"
    assert result.inliers == 428
    assert result.total_matches == 542
    assert result.rmse == 0.42
    assert result.subpixel_accuracy is True
    assert result.registered_image.startswith("data:image/png;base64,")
    assert result.overlay_image.startswith("data:image/png;base64,")
    assert result.match_points_image.startswith("data:image/png;base64,")

    metrics = result.to_metrics_dict()
    assert metrics["inlier_ratio_percent"] == "78.96%"
    assert metrics["subpixel_accuracy"] is True


def test_mock_registration_forced_failure(synthetic_images):
    """Test handling of degraded or failed registration."""
    src, ref = synthetic_images
    client = MockCoreMLClient()

    result = client.register(
        source_image=src,
        reference_image=ref,
        config={"force_failure": True},
    )

    assert result.status == "failed"
    assert result.error_message is not None
    assert result.subpixel_accuracy is False
    assert result.rmse > 2.0


def test_core_ml_factory():
    """Test factory instantiates BaseCoreMLClient."""
    client = get_core_ml_client()
    assert isinstance(client, MockCoreMLClient)
