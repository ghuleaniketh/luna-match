"""
FastAPI application for LUNA-MATCH AI Layer.
Exposes endpoints for RAG retrieval, VLM explanation, and Core ML integration.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from app.config import settings
from app.rag.retriever import LunarRAGRetriever

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="AI Layer for Chandrayaan-2 Multi-modal Lunar Image Registration (SIH26166)",
)

retriever = LunarRAGRetriever()


class RAGQueryRequest(BaseModel):
    query: str
    top_k: int = 4
    score_threshold: Optional[float] = None


class RAGQueryResponse(BaseModel):
    query: str
    total_retrieved: int
    context: str
    sources: List[Dict[str, Any]]


@app.on_event("startup")
async def startup_event():
    retriever.load()


@app.get("/")
def read_root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "online",
        "rag_indexed": retriever._is_loaded,
    }


@app.post("/rag/query", response_model=RAGQueryResponse)
def query_rag(request: RAGQueryRequest):
    if not retriever._is_loaded:
        loaded = retriever.load()
        if not loaded:
            raise HTTPException(status_code=500, detail="RAG index not loaded or empty")

    results = retriever.retrieve(
        query=request.query,
        top_k=request.top_k,
        score_threshold=request.score_threshold,
    )
    context = retriever.format_context_for_prompt(results)
    sources = retriever.get_sources_metadata(results)

    return RAGQueryResponse(
        query=request.query,
        total_retrieved=len(results),
        context=context,
        sources=sources,
    )
