"""
FastAPI application for LUNA-MATCH AI Layer.
Exposes endpoints for RAG retrieval, VLM explanation, orchestrated chat,
and Core ML registration integration.
"""

import base64
import io
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.config import settings
from app.rag.retriever import LunarRAGRetriever
from app.orchestrator.agent import LunaMatchOrchestrator
from app.orchestrator.tools import LunarTools

# ── Application ──────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="AI Layer for Chandrayaan-2 Multi-modal Lunar Image Registration (SIH26166)",
)

# ── CORS — allow Vite dev server (5173) and any local origin ─────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Singletons (lazy-initialised on first use) ────────────────────────────────
_retriever: Optional[LunarRAGRetriever] = None
_tools: Optional[LunarTools] = None
_orchestrator: Optional[LunaMatchOrchestrator] = None


def get_retriever() -> LunarRAGRetriever:
    global _retriever
    if _retriever is None:
        _retriever = LunarRAGRetriever()
        _retriever.load()
    return _retriever


def get_tools() -> LunarTools:
    global _tools
    if _tools is None:
        _tools = LunarTools(retriever=get_retriever())
    return _tools


def get_orchestrator() -> LunaMatchOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = LunaMatchOrchestrator(tools=get_tools())
    return _orchestrator


# ── Request / Response Schemas ────────────────────────────────────────────────
class RAGQueryRequest(BaseModel):
    query: str
    top_k: int = 4
    score_threshold: Optional[float] = None


class RAGQueryResponse(BaseModel):
    query: str
    total_retrieved: int
    context: str
    sources: List[Dict[str, Any]]


class ChatRequest(BaseModel):
    query: str
    source_image_b64: Optional[str] = None   # base64 data URI or plain base64
    reference_image_b64: Optional[str] = None


class ChatResponse(BaseModel):
    intent: str
    text_response: str
    registration_result: Optional[Dict[str, Any]] = None
    sources: List[Dict[str, Any]] = []
    tools_called: List[str] = []


# ── Helpers ───────────────────────────────────────────────────────────────────
def _b64_to_pil(b64_string: Optional[str]):
    """Convert a base64 data URI or raw base64 string to a PIL Image."""
    if not b64_string:
        return None
    try:
        from PIL import Image
        if b64_string.startswith("data:"):
            # Strip data URI header
            header, data = b64_string.split(",", 1)
        else:
            data = b64_string
        img_bytes = base64.b64decode(data)
        return Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception:
        return None


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    # Pre-warm singletons so first request isn't slow
    try:
        get_retriever()
        get_orchestrator()
    except Exception as exc:
        print(f"[WARN] startup pre-warm error (non-fatal): {exc}")


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/", tags=["health"])
@app.get("/health", tags=["health"])
def health():
    r = get_retriever()
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "online",
        "rag_indexed": r._is_loaded,
    }


# ── RAG Endpoint ──────────────────────────────────────────────────────────────
@app.post("/rag/query", response_model=RAGQueryResponse, tags=["rag"])
def query_rag(request: RAGQueryRequest):
    r = get_retriever()
    if not r._is_loaded:
        loaded = r.load()
        if not loaded:
            raise HTTPException(status_code=500, detail="RAG index not loaded or empty")

    results = r.retrieve(
        query=request.query,
        top_k=request.top_k,
        score_threshold=request.score_threshold,
    )
    context = r.format_context_for_prompt(results)
    sources = r.get_sources_metadata(results)

    return RAGQueryResponse(
        query=request.query,
        total_retrieved=len(results),
        context=context,
        sources=sources,
    )


# ── Orchestrate (Main Chat) Endpoint ──────────────────────────────────────────
@app.post("/orchestrate", response_model=ChatResponse, tags=["chat"])
def orchestrate(request: ChatRequest):
    """
    Main AI entry point. Accepts a text query + optional base64 images.
    Returns intent-classified, tool-routed response with optional registration metrics.
    """
    orch = get_orchestrator()

    source_img = _b64_to_pil(request.source_image_b64)
    reference_img = _b64_to_pil(request.reference_image_b64)

    try:
        response = orch.process(
            query=request.query,
            source_image=source_img,
            reference_image=reference_img,
        )
        return ChatResponse(
            intent=response.intent.value,
            text_response=response.text_response,
            registration_result=response.registration_result,
            sources=response.sources,
            tools_called=response.tools_called,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Orchestrator error: {str(exc)}")


# ── Register Images Endpoint (direct, no chat) ────────────────────────────────
@app.post("/register", tags=["registration"])
async def register_images(
    source: UploadFile = File(..., description="Source lunar image"),
    reference: UploadFile = File(..., description="Reference lunar image"),
):
    """
    Directly trigger image registration pipeline.
    Returns metrics, registered image (base64), and match-point overlay.
    """
    from PIL import Image as PILImage

    try:
        src_bytes = await source.read()
        ref_bytes = await reference.read()
        src_img = PILImage.open(io.BytesIO(src_bytes)).convert("RGB")
        ref_img = PILImage.open(io.BytesIO(ref_bytes)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not decode images: {exc}")

    tools = get_tools()
    try:
        result = tools.register_images(source_image=src_img, reference_image=ref_img)
        return JSONResponse(content=result.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(exc)}")


# ── Analyze Single Image ──────────────────────────────────────────────────────
@app.post("/analyze", tags=["vision"])
async def analyze_image(
    image: UploadFile = File(..., description="Lunar image to analyze"),
    question: str = Form("Describe this lunar surface image."),
):
    """Analyze a single lunar image via Qwen3-VL and return a description."""
    from PIL import Image as PILImage

    try:
        img_bytes = await image.read()
        img = PILImage.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not decode image: {exc}")

    tools = get_tools()
    try:
        description = tools.analyze_image(image=img, question=question)
        return {"description": description}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"VLM analysis error: {str(exc)}")
