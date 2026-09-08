"""
Vector Store module for LUNA-MATCH RAG.
Provides persistent indexing and similarity search using FAISS (or NumPy fallback).
"""

import json
from pathlib import Path
from typing import List, Tuple, Optional
import numpy as np

from app.rag.chunking import DocumentChunk


class VectorStore:
    def __init__(self, index_dir: Path):
        self.index_dir = Path(index_dir)
        self.index_dir.mkdir(parents=True, exist_ok=True)
        self.faiss_path = self.index_dir / "faiss_index.bin"
        self.meta_path = self.index_dir / "chunks_metadata.json"
        self.chunks: List[DocumentChunk] = []
        self.index = None
        self.embeddings: Optional[np.ndarray] = None
        self._has_faiss = False

        try:
            import faiss
            self._has_faiss = True
        except ImportError:
            self._has_faiss = False

    def build_index(self, chunks: List[DocumentChunk], embeddings: np.ndarray):
        """Build vector index from document chunks and normalized embeddings."""
        self.chunks = chunks
        self.embeddings = embeddings.astype(np.float32)
        num_items, dimension = embeddings.shape

        if self._has_faiss and num_items > 0:
            import faiss
            # Inner Product on normalized vectors is equivalent to Cosine Similarity
            self.index = faiss.IndexFlatIP(dimension)
            self.index.add(self.embeddings)
        else:
            self.index = None

    def search(self, query_vector: np.ndarray, top_k: int = 4) -> List[Tuple[DocumentChunk, float]]:
        """
        Search for the most similar chunks given a query embedding.
        Returns list of (DocumentChunk, similarity_score).
        """
        if not self.chunks or (self.embeddings is None and self.index is None):
            return []

        query_vector = query_vector.reshape(1, -1).astype(np.float32)

        if self._has_faiss and self.index is not None:
            scores, indices = self.index.search(query_vector, min(top_k, len(self.chunks)))
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if 0 <= idx < len(self.chunks):
                    results.append((self.chunks[idx], float(score)))
            return results
        elif self.embeddings is not None:
            # Fallback: NumPy cosine similarity
            sims = np.dot(self.embeddings, query_vector.T).flatten()
            top_indices = np.argsort(sims)[::-1][:min(top_k, len(self.chunks))]
            results = []
            for idx in top_indices:
                results.append((self.chunks[idx], float(sims[idx])))
            return results

        return []

    def save(self):
        """Save index and metadata to disk."""
        # Save metadata
        metadata_list = [chunk.to_dict() for chunk in self.chunks]
        with open(self.meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata_list, f, indent=2, ensure_ascii=False)

        # Save FAISS index or raw numpy embeddings
        if self._has_faiss and self.index is not None:
            import faiss
            faiss.write_index(self.index, str(self.faiss_path))
        elif self.embeddings is not None:
            np.save(str(self.index_dir / "embeddings.npy"), self.embeddings)

    def load(self) -> bool:
        """Load index and metadata from disk. Returns True if successful."""
        if not self.meta_path.exists():
            return False

        with open(self.meta_path, "r", encoding="utf-8") as f:
            metadata_list = json.load(f)
            chunks = []
            for item in metadata_list:
                chunk = DocumentChunk.from_dict(item)
                if not chunk.sensor and chunk.text:
                    t_low = chunk.text.lower()
                    if "iirs" in t_low or "imaging infra-red" in t_low:
                        chunk.sensor = "IIRS"
                    elif "ohrc" in t_low:
                        chunk.sensor = "OHRC"
                    elif "tmc" in t_low or "tmc-2" in t_low:
                        chunk.sensor = "TMC-2"
                chunks.append(chunk)
            self.chunks = chunks

        if self._has_faiss and self.faiss_path.exists():
            import faiss
            self.index = faiss.read_index(str(self.faiss_path))
            return True
        elif (self.index_dir / "embeddings.npy").exists():
            self.embeddings = np.load(str(self.index_dir / "embeddings.npy"))
            return True

        return len(self.chunks) > 0
