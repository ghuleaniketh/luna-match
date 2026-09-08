"""
Retriever and Grounding Engine for LUNA-MATCH RAG.
Finds authoritative lunar domain knowledge and formats grounded context with citations.
"""

from typing import List, Tuple, Dict, Any, Optional
from pathlib import Path

from app.config import settings
from app.rag.embeddings import EmbeddingModel
from app.rag.vectorstore import VectorStore
from app.rag.chunking import DocumentChunk


class LunarRAGRetriever:
    def __init__(
        self,
        index_dir: Optional[Path] = None,
        embedding_model: Optional[EmbeddingModel] = None,
        score_threshold: float = 0.25,
    ):
        self.index_dir = index_dir or settings.RAG_INDEX_DIR
        self.embedding_model = embedding_model or EmbeddingModel(settings.RAG_EMBEDDING_MODEL)
        self.vector_store = VectorStore(self.index_dir)
        self.score_threshold = score_threshold
        self._is_loaded = False

    def load(self) -> bool:
        """Load vector store index from disk."""
        self._is_loaded = self.vector_store.load()
        return self._is_loaded

    def retrieve(
        self,
        query: str,
        top_k: int = 4,
        score_threshold: Optional[float] = None,
    ) -> List[Tuple[DocumentChunk, float]]:
        """
        Retrieve relevant knowledge chunks for a query.
        Returns list of (DocumentChunk, score) filtered by similarity threshold.
        """
        if not self._is_loaded:
            self.load()

        threshold = score_threshold if score_threshold is not None else self.score_threshold
        query_vector = self.embedding_model.embed_query(query)
        results = self.vector_store.search(query_vector, top_k=top_k)

        # Filter by threshold
        filtered_results = []
        for chunk, score in results:
            if score < threshold:
                continue
            if not chunk.sensor:
                text = chunk.text.upper()
                for sensor in ("OHRC", "TMC-2", "IIRS"):
                    if sensor in text:
                        chunk.sensor = sensor
                        break
            filtered_results.append((chunk, score))
        return filtered_results

    def format_context_for_prompt(
        self, results: List[Tuple[DocumentChunk, float]]
    ) -> str:
        """
        Format retrieved chunks into clean, cited markdown context for Qwen3-VL/LLM.
        """
        if not results:
            return "No relevant domain knowledge documents found in the database."

        formatted_blocks = []
        for i, (chunk, score) in enumerate(results, 1):
            source_info = f"Document: {chunk.document_name}"
            if chunk.mission:
                source_info += f" | Mission: {chunk.mission}"
            if chunk.sensor:
                source_info += f" | Sensor: {chunk.sensor}"
            if chunk.section:
                source_info += f" | Section: {chunk.section}"
            if chunk.page:
                source_info += f" | Page: {chunk.page}"

            block = (
                f"--- [Knowledge Source {i}: {source_info} (Similarity: {score:.3f})] ---\n"
                f"{chunk.text}\n"
            )
            formatted_blocks.append(block)

        return "\n".join(formatted_blocks)

    def get_sources_metadata(
        self, results: List[Tuple[DocumentChunk, float]]
    ) -> List[Dict[str, Any]]:
        """Extract structured citations list for UI display."""
        sources = []
        for chunk, score in results:
            sources.append({
                "document": chunk.document_name,
                "mission": chunk.mission or "General Lunar Science",
                "sensor": chunk.sensor or "N/A",
                "section": chunk.section,
                "page": chunk.page,
                "score": round(score, 3),
                "source_path": chunk.source_path,
                "snippet": chunk.text[:150] + "..." if len(chunk.text) > 150 else chunk.text,
            })
        return sources


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Query Lunar RAG Knowledge Base")
    parser.add_argument("--query", "-q", type=str, required=True, help="Question to query")
    parser.add_argument("--top_k", "-k", type=int, default=3, help="Number of chunks to retrieve")
    args = parser.parse_args()

    retriever = LunarRAGRetriever()
    if not retriever.load():
        print("[Error] RAG Index is not built or empty. Run 'python -m app.rag.ingest' first.")
    else:
        results = retriever.retrieve(args.query, top_k=args.top_k)
        print(f"\nQuery: {args.query}")
        print(f"Retrieved {len(results)} chunks:\n")
        print(retriever.format_context_for_prompt(results))
