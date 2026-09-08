"""
Agent Orchestrator for LUNA-MATCH AI Layer.
Classifies user intent and coordinates RAG retrieval, Core ML registration,
and Qwen3-VL multimodal interpretation without redundant tool calls.
"""

from enum import Enum
from typing import Dict, Any, Optional, Union, List
from pathlib import Path
from pydantic import BaseModel, Field
from PIL import Image

from app.orchestrator.tools import LunarTools
from app.core_api import RegistrationResult


class IntentType(str, Enum):
    RAG_KNOWLEDGE = "rag_knowledge"
    ANALYZE_IMAGE = "analyze_image"
    COMPARE_IMAGES = "compare_images"
    REGISTER_IMAGES = "register_images"
    EXPLAIN_REGISTRATION = "explain_registration"
    GENERAL_CHAT = "general_chat"


class AgentResponse(BaseModel):
    intent: IntentType
    text_response: str
    registration_result: Optional[Dict[str, Any]] = None
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    tools_called: List[str] = Field(default_factory=list)


class LunaMatchOrchestrator:
    def __init__(self, tools: Optional[LunarTools] = None):
        self.tools = tools or LunarTools()

    def classify_intent(
        self,
        query: str,
        has_source: bool = False,
        has_reference: bool = False,
        has_registration_result: bool = False,
    ) -> IntentType:
        """
        Structured intent classifier deciding which system components to invoke.
        """
        q_lower = query.lower().strip()

        # 1. Registration action requested
        if ("register" in q_lower or "align" in q_lower or "registration" in q_lower) and has_source and has_reference and not has_registration_result:
            return IntentType.REGISTER_IMAGES

        # 2. Explanation of existing registration result
        if has_registration_result and ("reliable" in q_lower or "result" in q_lower or "rmse" in q_lower or "inlier" in q_lower or "align" in q_lower or "accurate" in q_lower or "why" in q_lower or "overlay" in q_lower):
            return IntentType.EXPLAIN_REGISTRATION

        # 3. Two images uploaded and comparison requested
        if has_source and has_reference and ("compare" in q_lower or "difference" in q_lower or "overlap" in q_lower or "same region" in q_lower or "scale" in q_lower):
            return IntentType.COMPARE_IMAGES

        # 4. Single image uploaded and analysis requested
        if has_source and not has_reference and ("describe" in q_lower or "analyze" in q_lower or "what is in" in q_lower or "crater" in q_lower or "tell me about" in q_lower or "image" in q_lower):
            return IntentType.ANALYZE_IMAGE

        # 5. Scientific / mission domain question
        rag_keywords = [
            "what is", "tell me about", "difference between", "ohrc", "tmc", "iirs",
            "chandrayaan", "isro", "lro", "lroc", "rmse", "ransac", "sub-pixel",
            "subpixel", "uniform", "distribution", "resolution", "swath", "band"
        ]
        if any(kw in q_lower for kw in rag_keywords):
            return IntentType.RAG_KNOWLEDGE

        # 6. Fallback general query
        return IntentType.GENERAL_CHAT

    def process(
        self,
        query: str,
        source_image: Optional[Union[str, Path, Image.Image]] = None,
        reference_image: Optional[Union[str, Path, Image.Image]] = None,
        current_registration: Optional[RegistrationResult] = None,
    ) -> AgentResponse:
        """
        Main orchestration entry point. Routes user query to specialized tools.
        """
        has_source = source_image is not None
        has_ref = reference_image is not None
        has_reg = current_registration is not None

        intent = self.classify_intent(
            query=query,
            has_source=has_source,
            has_reference=has_ref,
            has_registration_result=has_reg,
        )

        tools_called: List[str] = []

        # Intent 1: RAG Knowledge Query
        if intent == IntentType.RAG_KNOWLEDGE:
            tools_called.append("search_lunar_knowledge")
            rag_output = self.tools.search_lunar_knowledge(query, top_k=3)
            # Use Qwen3-VL/LLM to synthesize grounded answer
            prompt = (
                f"You are the LUNA-MATCH AI Assistant. Answer the user's scientific question using ONLY the retrieved knowledge below.\n\n"
                f"Retrieved Knowledge Sources:\n{rag_output['context']}\n\n"
                f"User Question: {query}\n\n"
                f"Provide a clear, authoritative explanation with source attributions."
            )
            text_resp = self.tools.vision_engine.client.generate(prompt=prompt)
            if text_resp.startswith("[Error communicating with VLM API endpoint"):
                text_resp = (
                    "The VLM synthesis service is temporarily unavailable. "
                    "Here is the retrieved knowledge:\n\n" + rag_output["context"]
                )
            return AgentResponse(
                intent=intent,
                text_response=text_resp,
                sources=rag_output["sources"],
                tools_called=tools_called,
            )

        # Intent 2: Single Image Analysis
        elif intent == IntentType.ANALYZE_IMAGE:
            tools_called.append("analyze_image")
            text_resp = self.tools.analyze_image(image=source_image, question=query)
            return AgentResponse(
                intent=intent,
                text_response=text_resp,
                tools_called=tools_called,
            )

        # Intent 3: Image Comparison
        elif intent == IntentType.COMPARE_IMAGES:
            tools_called.append("compare_images")
            text_resp = self.tools.compare_images(
                source_image=source_image,
                reference_image=reference_image,
                question=query,
            )
            return AgentResponse(
                intent=intent,
                text_response=text_resp,
                tools_called=tools_called,
            )

        # Intent 4: Perform Image Registration
        elif intent == IntentType.REGISTER_IMAGES:
            tools_called.append("register_images")
            reg_result: RegistrationResult = self.tools.register_images(
                source_image=source_image,
                reference_image=reference_image,
            )

            # Optionally explain registration result immediately
            tools_called.append("explain_registration")
            explanation = self.tools.explain_registration(
                source_image=source_image,
                reference_image=reference_image,
                overlay_image=reg_result.overlay_image,
                metrics=reg_result.to_metrics_dict(),
                question=query,
                rag_query="Root Mean Square Error RMSE inlier ratio subpixel accuracy",
            )

            return AgentResponse(
                intent=intent,
                text_response=explanation["explanation"],
                registration_result=reg_result.model_dump(),
                sources=explanation["sources"],
                tools_called=tools_called,
            )

        # Intent 5: Explain Existing Registration Result
        elif intent == IntentType.EXPLAIN_REGISTRATION:
            tools_called.append("explain_registration")
            explanation = self.tools.explain_registration(
                source_image=source_image,
                reference_image=reference_image,
                overlay_image=current_registration.overlay_image if current_registration else None,
                metrics=current_registration.to_metrics_dict() if current_registration else None,
                question=query,
                rag_query="image registration RMSE inlier ratio sub-pixel accuracy",
            )
            return AgentResponse(
                intent=intent,
                text_response=explanation["explanation"],
                registration_result=current_registration.model_dump() if current_registration else None,
                sources=explanation["sources"],
                tools_called=tools_called,
            )

        # Intent 6: General Chat
        else:
            text_resp = (
                "Hello! I am the LUNA-MATCH AI Assistant. You can upload Chandrayaan-2 lunar images (OHRC, TMC-2, IIRS) "
                "to compare scenes, run scientific sub-pixel registration, inspect alignment overlays, or ask any planetary science questions."
            )
            return AgentResponse(
                intent=intent,
                text_response=text_resp,
                tools_called=tools_called,
            )
