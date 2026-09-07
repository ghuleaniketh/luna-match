"""
Tool definitions for LUNA-MATCH AI Layer Orchestrator.
Exposes clean Python tool interfaces for RAG, Core ML, and VLM operations.
"""

from typing import Dict, Any, Optional, Union, List
from pathlib import Path
from PIL import Image

from app.rag.retriever import LunarRAGRetriever
from app.vlm.vision import LunarVisionEngine
from app.core_api import get_core_ml_client, RegistrationResult


class LunarTools:
    def __init__(
        self,
        retriever: Optional[LunarRAGRetriever] = None,
        vision_engine: Optional[LunarVisionEngine] = None,
    ):
        self.retriever = retriever or LunarRAGRetriever()
        self.vision_engine = vision_engine or LunarVisionEngine()
        self.core_ml_client = get_core_ml_client()

    def search_lunar_knowledge(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        """
        Search authoritative lunar and registration knowledge base.
        Returns formatted context string and structured sources.
        """
        results = self.retriever.retrieve(query, top_k=top_k)
        context = self.retriever.format_context_for_prompt(results)
        sources = self.retriever.get_sources_metadata(results)
        return {
            "query": query,
            "context": context,
            "sources": sources,
            "total_found": len(results),
        }

    def analyze_image(
        self,
        image: Union[str, Path, Image.Image],
        question: Optional[str] = None,
    ) -> str:
        """Analyze a single lunar image using Qwen3-VL."""
        return self.vision_engine.analyze_image(image=image, user_question=question)

    def compare_images(
        self,
        source_image: Union[str, Path, Image.Image],
        reference_image: Union[str, Path, Image.Image],
        question: Optional[str] = None,
    ) -> str:
        """Descriptively compare source and reference images before registration."""
        return self.vision_engine.compare_images(
            source_image=source_image,
            reference_image=reference_image,
            user_question=question,
        )

    def register_images(
        self,
        source_image: Union[str, Path, Image.Image],
        reference_image: Union[str, Path, Image.Image],
        config: Optional[Dict[str, Any]] = None,
    ) -> RegistrationResult:
        """Execute image registration via Core ML engine."""
        return self.core_ml_client.register(
            source_image=source_image,
            reference_image=reference_image,
            config=config,
        )

    def explain_registration(
        self,
        source_image: Optional[Union[str, Path, Image.Image]] = None,
        reference_image: Optional[Union[str, Path, Image.Image]] = None,
        overlay_image: Optional[Union[str, Path, Image.Image]] = None,
        metrics: Optional[Dict[str, Any]] = None,
        question: Optional[str] = None,
        rag_query: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Synthesize registration explanation combining Core ML metrics, visual overlay, and RAG knowledge.
        """
        rag_context = None
        sources = []
        if rag_query:
            rag_res = self.search_lunar_knowledge(rag_query, top_k=2)
            rag_context = rag_res["context"]
            sources = rag_res["sources"]

        explanation = self.vision_engine.explain_registration(
            source_image=source_image,
            reference_image=reference_image,
            overlay_image=overlay_image,
            metrics=metrics,
            user_question=question,
            rag_context=rag_context,
        )

        return {
            "explanation": explanation,
            "metrics": metrics,
            "sources": sources,
        }
