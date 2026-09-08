"""
Automated Test Suite for LUNA-MATCH Independent RAG Pipeline (Phase 2).
Validates chunking, embeddings, vector indexing, metadata attribution, and grounding recall.
"""

from pathlib import Path
import pytest
import numpy as np

from app.rag.chunking import DocumentChunker, DocumentChunk
from app.rag.embeddings import EmbeddingModel
from app.rag.vectorstore import VectorStore
from app.rag.retriever import LunarRAGRetriever
from app.rag.ingest import ingest_knowledge_base
from app.config import settings


@pytest.fixture(scope="session")
def setup_rag_index():
    """Ensure persistent RAG index is built and return loaded retriever."""
    if not (settings.RAG_INDEX_DIR / "faiss_index.bin").exists():
        num_chunks = ingest_knowledge_base(
            knowledge_dir=settings.KNOWLEDGE_DIR,
            index_dir=settings.RAG_INDEX_DIR,
        )
        assert num_chunks > 0, "Ingestion must index at least 1 chunk."

    retriever = LunarRAGRetriever(index_dir=settings.RAG_INDEX_DIR)
    loaded = retriever.load()
    assert loaded, "Retriever must load index successfully."
    return retriever


def test_chunking_metadata():
    """Test chunker correctly extracts sections and metadata."""
    chunker = DocumentChunker(chunk_size=300, chunk_overlap=50)
    sample_md = """# Orbiter High Resolution Camera (OHRC)
**Mission**: Chandrayaan-2
## Technical Specifications
OHRC has a ground resolution of 0.25m to 0.32m.
## Illumination
OHRC handles low Sun angles.
"""
    test_file = Path("knowledge/ohrc/sample_ohrc.md")
    chunks = chunker.chunk_markdown(sample_md, test_file)

    assert len(chunks) >= 2
    assert chunks[0].sensor == "OHRC"
    assert chunks[0].mission == "Chandrayaan-2"
    assert any("0.25m" in c.text for c in chunks)


def test_embedding_normalization():
    """Test that embedding vectors are unit normalized for cosine similarity."""
    model = EmbeddingModel()
    vec = model.embed_query("Chandrayaan-2 OHRC")
    norm = np.linalg.norm(vec)
    assert np.isclose(norm, 1.0, atol=1e-3), f"Vector norm was {norm}, expected ~1.0"


def test_query_ohrc(setup_rag_index):
    """Test retrieval for 'What is OHRC?'"""
    retriever = setup_rag_index
    results = retriever.retrieve("What is OHRC?", top_k=3)
    assert len(results) > 0

    top_chunk, score = results[0]
    assert score > 0.4
    assert top_chunk.sensor == "OHRC"
    text_corpus = " ".join([c.text for c, _ in results])
    assert "0.25" in text_corpus or "resolution" in text_corpus.lower()
    assert "chandrayaan" in text_corpus.lower() or "ohrc" in text_corpus.lower()


def test_query_tmc2(setup_rag_index):
    """Test retrieval for 'What is TMC-2?'"""
    retriever = setup_rag_index
    results = retriever.retrieve("What is TMC-2?", top_k=3)
    assert len(results) > 0

    top_chunk, score = results[0]
    assert top_chunk.sensor == "TMC-2"
    text_corpus = " ".join([c.text for c, _ in results])
    assert "5" in text_corpus or "stereo" in text_corpus.lower() or "dem" in text_corpus.lower()


def test_query_iirs(setup_rag_index):
    """Test retrieval for 'What is IIRS?'"""
    retriever = setup_rag_index
    results = retriever.retrieve("What is IIRS?", top_k=3)
    assert len(results) > 0

    top_chunk, score = results[0]
    assert top_chunk.sensor == "IIRS"
    text_corpus = " ".join([c.text for c, _ in results])
    assert "infrared" in text_corpus.lower() or "hyperspectral" in text_corpus.lower() or "mineral" in text_corpus.lower()


def test_query_rmse_meaning(setup_rag_index):
    """Test retrieval for 'What does RMSE mean in image registration?'"""
    retriever = setup_rag_index
    results = retriever.retrieve("What does RMSE mean in image registration?", top_k=3)
    assert len(results) > 0

    text_corpus = " ".join([c.text for c, _ in results])
    assert "rmse" in text_corpus.lower() or "root mean square" in text_corpus.lower()
    assert "pixel" in text_corpus.lower() or "error" in text_corpus.lower()


def test_query_uniform_distribution(setup_rag_index):
    """Test retrieval for 'Why is uniform distribution of match points important?'"""
    retriever = setup_rag_index
    results = retriever.retrieve("Why is uniform distribution of match points important?", top_k=3)
    assert len(results) > 0

    text_corpus = " ".join([c.text for c, _ in results])
    assert "uniform" in text_corpus.lower()
    assert "distortion" in text_corpus.lower() or "cluster" in text_corpus.lower() or "biased" in text_corpus.lower() or "lever-arm" in text_corpus.lower()


def test_query_subpixel_accuracy(setup_rag_index):
    """Test retrieval for 'What does sub-pixel accuracy mean?'"""
    retriever = setup_rag_index
    results = retriever.retrieve("What does sub-pixel accuracy mean?", top_k=3)
    assert len(results) > 0

    text_corpus = " ".join([c.text for c, _ in results])
    assert "sub-pixel" in text_corpus.lower() or "subpixel" in text_corpus.lower()


def test_formatted_context_grounding(setup_rag_index):
    """Test that context formatting includes source documents and sensor metadata."""
    retriever = setup_rag_index
    results = retriever.retrieve("What is the difference between OHRC and TMC-2?", top_k=3)
    formatted = retriever.format_context_for_prompt(results)

    assert "Knowledge Source" in formatted
    assert "Document:" in formatted
    assert "Similarity:" in formatted
