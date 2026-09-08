"""
Knowledge Ingestion Pipeline for LUNA-MATCH RAG.
Discovers documents in the knowledge repository, chunks them, computes embeddings,
and persists the FAISS vector index.
"""

from pathlib import Path
from typing import List
import time

from app.config import settings
from app.rag.chunking import DocumentChunk, DocumentChunker
from app.rag.embeddings import EmbeddingModel
from app.rag.vectorstore import VectorStore


def ingest_knowledge_base(
    knowledge_dir: Path = settings.KNOWLEDGE_DIR,
    index_dir: Path = settings.RAG_INDEX_DIR,
    chunk_size: int = 450,
    chunk_overlap: int = 80,
    additional_dirs: List[Path] | None = None,
) -> int:
    """
    Ingest all markdown, text, and PDF documents from knowledge_dir into index_dir.
    Returns total number of chunks indexed.
    """
    knowledge_dir = Path(knowledge_dir)
    index_dir = Path(index_dir)
    index_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("[LUNA-MATCH] RAG INGESTION PIPELINE")
    print("=" * 60)
    source_dirs = [Path(knowledge_dir)]
    for source_dir in additional_dirs or [settings.RAG_DATA_DIR]:
        source_dir = Path(source_dir)
        if source_dir not in source_dirs and source_dir.exists():
            source_dirs.append(source_dir)
    print("Scanning directories:")
    for source_dir in source_dirs:
        print(f"  - {source_dir.resolve()}")

    chunker = DocumentChunker(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    all_chunks: List[DocumentChunk] = []

    # Supported file formats
    patterns = ["**/*.md", "**/*.txt", "**/*.pdf"]
    doc_files: List[Path] = []
    for source_dir in source_dirs:
        for pattern in patterns:
            doc_files.extend(source_dir.glob(pattern))
    doc_files = sorted({path.resolve() for path in doc_files})

    if not doc_files:
        print(f"[Warning] No documents found in {knowledge_dir} matching {patterns}")
        return 0

    print(f"Found {len(doc_files)} knowledge document(s):")
    for doc in doc_files:
        print(f"  - {doc}")

    # Chunk all documents
    for doc_path in doc_files:
        file_chunks = chunker.chunk_file(doc_path)
        all_chunks.extend(file_chunks)
        print(f"    -> Parsed {len(file_chunks)} chunk(s) from '{doc_path.name}'")

    print("-" * 60)
    print(f"Total chunks extracted: {len(all_chunks)}")

    if not all_chunks:
        print("[Error] No chunks could be extracted.")
        return 0

    # Compute dense embeddings
    print("Loading embedding model and encoding chunks...")
    start_time = time.time()
    embedding_model = EmbeddingModel(settings.RAG_EMBEDDING_MODEL)
    texts = [chunk.text for chunk in all_chunks]
    embeddings = embedding_model.embed_texts(texts, batch_size=8)
    duration = time.time() - start_time
    print(f"Generated {embeddings.shape[0]} embeddings of dimension {embeddings.shape[1]} in {duration:.2f}s")

    # Build and persist VectorStore
    print("Building FAISS vector index and persisting to disk...")
    vector_store = VectorStore(index_dir)
    vector_store.build_index(all_chunks, embeddings)
    vector_store.save()

    print(f"[SUCCESS] Persisted index to: {index_dir.resolve()}")
    print("=" * 60)
    return len(all_chunks)


if __name__ == "__main__":
    ingest_knowledge_base()
