"""
Automated Test Suite for Orchestrator & Tool Routing (Phase 5).
Validates intent classification, tool dispatching, and response structure.
"""

import pytest
from PIL import Image
import numpy as np

from app.orchestrator.agent import LunaMatchOrchestrator, IntentType, AgentResponse
from app.orchestrator.tools import LunarTools
from app.core_api.client import RegistrationResult


@pytest.fixture
def orchestrator():
    return LunaMatchOrchestrator()


@pytest.fixture
def test_images(tmp_path):
    img1 = tmp_path / "img1.png"
    img2 = tmp_path / "img2.png"
    Image.fromarray(np.full((80, 80, 3), 100, dtype=np.uint8)).save(img1)
    Image.fromarray(np.full((80, 80, 3), 150, dtype=np.uint8)).save(img2)
    return img1, img2


def test_intent_classification(orchestrator, test_images):
    """Test intent classification across different conversation contexts."""
    img1, img2 = test_images

    # 1. RAG query
    intent = orchestrator.classify_intent("What is OHRC?")
    assert intent == IntentType.RAG_KNOWLEDGE

    # 2. Single image description
    intent = orchestrator.classify_intent("Describe this crater", has_source=True, has_reference=False)
    assert intent == IntentType.ANALYZE_IMAGE

    # 3. Two-image comparison
    intent = orchestrator.classify_intent("Compare the two scenes", has_source=True, has_reference=True)
    assert intent == IntentType.COMPARE_IMAGES

    # 4. Image registration
    intent = orchestrator.classify_intent("Register these two images", has_source=True, has_reference=True)
    assert intent == IntentType.REGISTER_IMAGES

    # 5. Explain existing registration
    intent = orchestrator.classify_intent("Is this registration reliable?", has_registration_result=True)
    assert intent == IntentType.EXPLAIN_REGISTRATION


def test_orchestrator_rag_processing(orchestrator):
    """Test processing a scientific domain question."""
    response: AgentResponse = orchestrator.process("What is the difference between OHRC and TMC-2?")

    assert response.intent == IntentType.RAG_KNOWLEDGE
    assert "search_lunar_knowledge" in response.tools_called
    assert len(response.sources) > 0


def test_orchestrator_registration_flow(orchestrator, test_images):
    """Test full registration workflow routing."""
    img1, img2 = test_images
    response: AgentResponse = orchestrator.process(
        query="Register these two images and evaluate the result.",
        source_image=img1,
        reference_image=img2,
    )

    assert response.intent == IntentType.REGISTER_IMAGES
    assert "register_images" in response.tools_called
    assert "explain_registration" in response.tools_called
    assert response.registration_result is not None
    assert response.registration_result["status"] == "success"
    assert "RMSE" in response.text_response or "0.42" in response.text_response
