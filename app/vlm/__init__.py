"""VLM module for LUNA-MATCH AI Layer."""
from app.vlm.client import (
    BaseVLMClient,
    OpenAIVLMClient,
    TransformersVLMClient,
    MockVLMClient,
    get_vlm_client,
    encode_image_to_base64,
)
from app.vlm.vision import LunarVisionEngine
from app.vlm.prompts import (
    SYSTEM_PROMPT,
    SINGLE_IMAGE_ANALYSIS_PROMPT,
    IMAGE_COMPARISON_PROMPT,
    REGISTRATION_EXPLANATION_PROMPT,
)

__all__ = [
    "BaseVLMClient",
    "OpenAIVLMClient",
    "TransformersVLMClient",
    "MockVLMClient",
    "get_vlm_client",
    "encode_image_to_base64",
    "LunarVisionEngine",
    "SYSTEM_PROMPT",
    "SINGLE_IMAGE_ANALYSIS_PROMPT",
    "IMAGE_COMPARISON_PROMPT",
    "REGISTRATION_EXPLANATION_PROMPT",
]
