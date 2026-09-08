"""
Modular VLM Client Interface for Qwen/Qwen3-VL-8B-Instruct.
Supports OpenAI-compatible endpoints (vLLM / OpenRouter / Groq / OpenAI),
local HuggingFace Transformers, and offline deterministic Mocking.
"""

from abc import ABC, abstractmethod
from typing import List, Union, Optional, Dict, Any
from pathlib import Path
import base64
import io
import re
from PIL import Image

from app.config import settings
from app.vlm.prompts import SYSTEM_PROMPT


def clean_vlm_response(text: str) -> str:
    """Remove hidden reasoning markup before exposing a model response to callers."""
    cleaned = re.sub(r"<think>.*?(?:</think>|$)", "", text, flags=re.IGNORECASE | re.DOTALL)
    return cleaned.strip()


def encode_image_to_base64(image: Union[str, Path, Image.Image]) -> str:
    """Convert an image path or PIL Image to a base64 JPEG/PNG data URL."""
    output_format = "PNG"
    if isinstance(image, (str, Path)):
        if isinstance(image, str) and image.startswith("data:image/"):
            try:
                _, encoded_data = image.split(",", 1)
                image = Image.open(io.BytesIO(base64.b64decode(encoded_data))).convert("RGB")
                output_format = "JPEG"
            except (ValueError, OSError):
                return image
        if isinstance(image, Image.Image):
            pass
        else:
            image_path = Path(image)
            if not image_path.exists():
                raise FileNotFoundError(f"Image not found at: {image_path}")
            with Image.open(image_path) as loaded_image:
                image = loaded_image.convert("RGB")
            output_format = "PNG" if image_path.suffix.lower() == ".png" else "JPEG"
    if isinstance(image, Image.Image):
        normalized = image.convert("RGB")
        normalized.thumbnail((768, 768), Image.Resampling.LANCZOS)
        buffered = io.BytesIO()
        if output_format == "PNG":
            normalized.save(buffered, format="PNG", optimize=True)
        else:
            normalized.save(buffered, format="JPEG", quality=75, optimize=True)
        encoded = base64.b64encode(buffered.getvalue()).decode("utf-8")
        mime = "png" if output_format == "PNG" else "jpeg"
        return f"data:image/{mime};base64,{encoded}"
    else:
        raise ValueError(f"Unsupported image type: {type(image)}")


class BaseVLMClient(ABC):
    """Abstract base class for VLM inference backends."""

    @abstractmethod
    def generate(
        self,
        prompt: str,
        images: Optional[List[Union[str, Path, Image.Image]]] = None,
        system_prompt: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> str:
        """Generate multimodal or text-only completion."""
        pass


class OpenAIVLMClient(BaseVLMClient):
    """
    OpenAI-compatible VLM Client.
    Connects to vLLM, HuggingFace TGI, OpenRouter, or OpenAI endpoints serving Qwen3-VL.
    """

    def __init__(
        self,
        model: str = settings.VLM_MODEL,
        base_url: str = settings.VLM_BASE_URL,
        api_key: str = settings.VLM_API_KEY,
    ):
        self.model = model
        self.base_url = base_url
        self.api_key = api_key or "dummy-key-for-local-vllm"
        self._client = None

    @property
    def client(self):
        if self._client is None:
            from openai import OpenAI
            self._client = OpenAI(
                base_url=self.base_url,
                api_key=self.api_key,
            )
        return self._client

    def generate(
        self,
        prompt: str,
        images: Optional[List[Union[str, Path, Image.Image]]] = None,
        system_prompt: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> str:
        sys_prompt = system_prompt or SYSTEM_PROMPT
        max_tokens = max_tokens or settings.VLM_MAX_TOKENS
        temperature = temperature if temperature is not None else settings.VLM_TEMPERATURE

        content: List[Dict[str, Any]] = []

        # Add images as base64 data URLs
        if images:
            for img in images:
                base64_url = encode_image_to_base64(img)
                content.append({
                    "type": "image_url",
                    "image_url": {"url": base64_url}
                })

        # Add user text prompt
        content.append({"type": "text", "text": prompt})

        messages = [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": content},
        ]

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                reasoning_effort="none",
            )
            return clean_vlm_response(response.choices[0].message.content or "")
        except Exception as e:
            return f"[Error communicating with VLM API endpoint ({self.base_url})]: {str(e)}"


class TransformersVLMClient(BaseVLMClient):
    """
    Official Qwen3-VL-8B-Instruct local inference client using HuggingFace Transformers.

    Uses:
    - Qwen3VLForConditionalGeneration  (correct class for Qwen3-VL)
    - processor.apply_chat_template()  (official message format)
    - dtype="auto", device_map="auto"  (as recommended by Qwen team)
    - Recommended VL hyperparameters:  top_p=0.8, top_k=20, temperature=0.7,
                                       repetition_penalty=1.0, presence_penalty=1.5

    Install prerequisites:
        pip install git+https://github.com/huggingface/transformers
        pip install accelerate qwen-vl-utils
    """

    def __init__(self, model_name: str = settings.VLM_MODEL):
        self.model_name = model_name
        self._model = None
        self._processor = None
        # Generation kwargs sourced from settings (overridable via .env)
        self._gen_kwargs_base = dict(
            do_sample=True,
            top_p=settings.VLM_TOP_P,
            top_k=settings.VLM_TOP_K,
            temperature=settings.VLM_TEMPERATURE,
            repetition_penalty=settings.VLM_REPETITION_PENALTY,
        )

    def _load(self):
        """Lazy-load model and processor on first call."""
        if self._model is not None:
            return

        try:
            from transformers import Qwen3VLForConditionalGeneration, AutoProcessor
        except ImportError:
            raise ImportError(
                "Qwen3VLForConditionalGeneration not found. "
                "Install the latest transformers:\n"
                "  pip install git+https://github.com/huggingface/transformers\n"
                "  pip install accelerate qwen-vl-utils"
            )

        print(f"[TransformersVLMClient] Loading {self.model_name} with dtype=auto, device_map=auto …")
        print("[TransformersVLMClient] This may take several minutes on first run (model download ~16 GB).")

        # Exactly as the official Qwen3-VL quickstart recommends
        self._model = Qwen3VLForConditionalGeneration.from_pretrained(
            self.model_name,
            dtype="auto",          # fp16 on CUDA, fp32/bf16 on CPU as appropriate
            device_map="auto",     # auto-shards across available GPUs / CPU
        )
        self._processor = AutoProcessor.from_pretrained(self.model_name)
        print(f"[TransformersVLMClient] Model loaded on device: {self._model.device}")

    def _build_messages(
        self,
        prompt: str,
        images: Optional[List[Union[str, Path, Image.Image]]],
        system_prompt: str,
    ) -> List[Dict[str, Any]]:
        """
        Build the role-based message list in the format Qwen3-VL expects.
        Images are embedded directly as PIL Images in the content list.
        """
        messages = []

        # System message
        messages.append({"role": "system", "content": system_prompt})

        # User message: interleave images + text exactly as in the official example
        user_content: List[Dict[str, Any]] = []

        if images:
            for img in images:
                if isinstance(img, (str, Path)):
                    pil_img = Image.open(img).convert("RGB")
                elif isinstance(img, Image.Image):
                    pil_img = img.convert("RGB")
                else:
                    continue
                user_content.append({"type": "image", "image": pil_img})

        user_content.append({"type": "text", "text": prompt})
        messages.append({"role": "user", "content": user_content})

        return messages

    def generate(
        self,
        prompt: str,
        images: Optional[List[Union[str, Path, Image.Image]]] = None,
        system_prompt: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> str:
        self._load()
        import torch

        sys_prompt = system_prompt or SYSTEM_PROMPT
        max_new_tokens = max_tokens or settings.VLM_MAX_TOKENS

        messages = self._build_messages(prompt, images, sys_prompt)

        # apply_chat_template: tokenize + add generation prompt in one call
        # (exactly as shown in the official Qwen3-VL quickstart)
        inputs = self._processor.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=True,
            return_dict=True,
            return_tensors="pt",
        )
        inputs = inputs.to(self._model.device)

        # Build generation kwargs; allow per-call temperature override
        gen_kwargs = dict(self._gen_kwargs_base)
        if temperature is not None:
            gen_kwargs["temperature"] = temperature
        gen_kwargs["max_new_tokens"] = max_new_tokens

        with torch.no_grad():
            generated_ids = self._model.generate(**inputs, **gen_kwargs)

        # Trim prompt tokens — keep only newly generated tokens
        generated_ids_trimmed = [
            out_ids[len(in_ids):]
            for in_ids, out_ids in zip(inputs["input_ids"], generated_ids)
        ]

        output_texts = self._processor.batch_decode(
            generated_ids_trimmed,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=False,
        )
        return output_texts[0].strip() if output_texts else ""


class MockVLMClient(BaseVLMClient):
    """
    Deterministic Mock VLM Client for offline testing, CI/CD, and environments without GPU.
    Generates structured, grounded responses respecting all LUNA-MATCH rules.
    """

    def generate(
        self,
        prompt: str,
        images: Optional[List[Union[str, Path, Image.Image]]] = None,
        system_prompt: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> str:
        prompt_lower = prompt.lower()
        num_images = len(images) if images else 0

        # Scenario 1: Single Image Analysis
        if (num_images == 1 and ("analyze" in prompt_lower or "describe" in prompt_lower or "surface morphology" in prompt_lower)) or "lunar remote sensing image" in prompt_lower:
            return (
                "### [Lunar Terrain Visual Analysis]\n\n"
                "**1. Surface Morphology**:\n"
                "The image reveals complex lunar surface morphology dominated by a well-preserved primary impact crater with sharp rim crests, "
                "surrounding radial ejecta, and smaller secondary crater pits across the terrain.\n\n"
                "**2. Illumination & Shadows**:\n"
                "Illumination arrives from the upper-left at an oblique solar angle. Distinct shadows are cast along the eastern inner crater walls, "
                "providing pronounced relief contrast.\n\n"
                "**3. Scale & Resolution Assessment**:\n"
                "The crisp clarity of sub-meter textural features suggests high-resolution planetary imaging consistent with Chandrayaan-2 OHRC (0.25-0.32m) "
                "or LROC NAC (0.5m).\n\n"
                "**4. Registration Landmark Value**:\n"
                "The central crater crest, ridge intersections, and high-contrast boulder distributions provide excellent candidates for tie-point registration."
            )

        # Scenario 2: Two-Image Comparison
        elif num_images >= 2 and ("compare" in prompt_lower or "scale disparity" in prompt_lower):
            return (
                "### [Lunar Image Comparison]\n\n"
                "**1. Terrain & Regional Overlap**:\n"
                "Both frames appear to depict the same lunar highland terrain characterized by multiple degraded impact craters "
                "and prominent rim features.\n\n"
                "**2. Scale & Detail Disparity**:\n"
                "Image 1 demonstrates higher ground sampling resolution with micro-scale surface textures (resembling OHRC detail), "
                "whereas Image 2 captures a broader regional perspective with smoother gradients (resembling TMC-2 or contextual coverage).\n\n"
                "**3. Illumination & Shadow Geometry**:\n"
                "The images exhibit distinct solar elevation angles. Image 1 features low-angle grazing illumination with long shadows "
                "highlighting subtle rim slopes, while Image 2 shows higher solar elevation with reduced shadow extent.\n\n"
                "**4. Keypoint Matching Feasibility**:\n"
                "The central prominent crater and the distinct crater triplet in the upper quadrant offer robust visual landmarks for feature correspondence."
            )

        # Scenario 3: Registration Explanation with Metrics
        elif (
            ("metrics" in prompt_lower or "rmse" in prompt_lower or "inlier" in prompt_lower)
            and "retrieved knowledge sources:" not in prompt_lower
        ):
            return (
                "### [Registration Interpretation Report]\n\n"
                "**1. Measured Core ML Metrics**:\n"
                "- **Status**: Success\n"
                "- **Inliers**: 428\n"
                "- **Inlier Ratio**: 78.9%\n"
                "- **RMSE**: 0.42 pixels\n"
                "- **Sub-Pixel Accuracy**: Achieved (< 0.5 px)\n\n"
                "**2. Visual Overlay Inspection**:\n"
                "Visual inspection of the aligned overlay indicates precise spatial alignment. "
                "The prominent crater rims, ejecta blankets, and ridge lines in the source frame align "
                "consistently with corresponding features in the reference image without observable shear or ghosting.\n\n"
                "**3. Scientific Context & Reliability**:\n"
                "An RMSE of 0.42 pixels represents true sub-pixel precision, which is optimal for scientific lunar fusion "
                "(e.g., co-registering OHRC sub-meter imagery with TMC-2 3D DEMs). The inlier ratio of 78.9% demonstrates "
                "that the RANSAC algorithm successfully rejected putative false matches and resolved illumination disparities."
            )

        elif not images and "retrieved knowledge sources:" in prompt_lower:
            source_blocks = re.findall(
                r"--- \[Knowledge Source \d+: (.*?)\] ---\s*\n(.*?)(?=\n--- \[Knowledge Source|\Z)",
                prompt,
                flags=re.DOTALL,
            )
            if source_blocks:
                facts = []
                citations = []
                for source, text in source_blocks[:3]:
                    normalized_text = re.sub(r"\s+", " ", text).strip()
                    facts.append(f"- {normalized_text}")
                    citations.append(source.split(" (Similarity:", 1)[0])
                return (
                    "Based on the retrieved LUNA-MATCH knowledge base:\n\n"
                    + "\n".join(facts)
                    + "\n\nSources: "
                    + "; ".join(citations)
                )
            return "I could not find a matching source in the indexed lunar knowledge base."

        # Fallback text response
        else:
            return (
                "I am the LUNA-MATCH AI Assistant. I can analyze lunar images, compare source and reference scenes, "
                "retrieve authoritative ISRO/Chandrayaan-2 scientific context, and interpret Core ML registration metrics."
            )


def get_vlm_client() -> BaseVLMClient:
    """Factory function returning the configured VLM client backend."""
    backend = settings.VLM_BACKEND.lower()
    if backend == "openai":
        return OpenAIVLMClient()
    elif backend == "groq":
        return OpenAIVLMClient(
            model=settings.GROQ_MODEL,
            base_url=settings.GROQ_BASE_URL,
            api_key=settings.GROQ_API_KEY,
        )
    elif backend == "transformers":
        return TransformersVLMClient()
    elif backend == "mock":
        return MockVLMClient()
    else:
        print(f"[Warning] Unknown VLM_BACKEND '{backend}', falling back to MockVLMClient.")
        return MockVLMClient()
