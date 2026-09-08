"""
Document Chunking and Metadata Extraction Module.
Splits text and markdown documents while preserving rich metadata.
"""

from dataclasses import dataclass, field
from pathlib import Path
import re
from typing import Dict, List, Optional, Any


@dataclass
class DocumentChunk:
    chunk_id: str
    text: str
    source_path: str
    document_name: str
    section: str = "General"
    sensor: Optional[str] = None
    mission: Optional[str] = None
    page: Optional[int] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "text": self.text,
            "source_path": self.source_path,
            "document_name": self.document_name,
            "section": self.section,
            "sensor": self.sensor,
            "mission": self.mission,
            "page": self.page,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DocumentChunk":
        return cls(**data)


class DocumentChunker:
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 80):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def detect_mission_and_sensor(self, text: str, file_path: Path) -> tuple[Optional[str], Optional[str]]:
        path_str = str(file_path).lower().replace("\\", "/")
        text_lower = text.lower()

        # Detect mission (prioritize path)
        mission = None
        if "chandrayaan" in path_str or "isro" in path_str:
            mission = "Chandrayaan-2"
        elif "lro" in path_str:
            mission = "LRO (Lunar Reconnaissance Orbiter)"
        elif "chandrayaan-2" in text_lower or "chandrayaan2" in text_lower:
            mission = "Chandrayaan-2"
        elif "lro" in text_lower or "lroc" in text_lower:
            mission = "LRO (Lunar Reconnaissance Orbiter)"

        # Detect sensor (prioritize path over text)
        sensor = None
        if "/ohrc/" in path_str or "ohrc" in file_path.stem.lower():
            sensor = "OHRC"
        elif "/tmc2/" in path_str or "tmc2" in file_path.stem.lower() or "tmc-2" in file_path.stem.lower():
            sensor = "TMC-2"
        elif "/iirs/" in path_str or "iirs" in file_path.stem.lower():
            sensor = "IIRS"
        elif "/lro/" in path_str or "lroc" in file_path.stem.lower() or "nac" in file_path.stem.lower():
            sensor = "LROC NAC"
        elif "/registration/" in path_str or "registration" in file_path.stem.lower():
            sensor = "Core Registration / Metrics"
        elif "/sih/" in path_str or "sih" in file_path.stem.lower():
            sensor = "SIH26166 Multi-Modal Problem"
        elif "orbiter high resolution camera" in text_lower:
            sensor = "OHRC"
        elif "imaging infrared spectrometer" in text_lower:
            sensor = "IIRS"
        elif "terrain mapping camera" in text_lower:
            sensor = "TMC-2"
        elif "narrow angle camera" in text_lower:
            sensor = "LROC NAC"

        return mission, sensor

    def chunk_markdown(self, content: str, file_path: Path) -> List[DocumentChunk]:
        chunks: List[DocumentChunk] = []
        mission, sensor = self.detect_mission_and_sensor(content, file_path)
        doc_name = file_path.stem.replace("_", " ").title()

        # Split into sections based on markdown headings
        sections = re.split(r"(^#{1,3}\s+.+$)", content, flags=re.MULTILINE)
        current_section = "Overview"
        current_text = ""

        section_blocks: List[tuple[str, str]] = []

        for item in sections:
            item = item.strip()
            if not item:
                continue
            if item.startswith("#"):
                if current_text:
                    section_blocks.append((current_section, current_text))
                    current_text = ""
                current_section = item.lstrip("#").strip()
            else:
                current_text += "\n\n" + item if current_text else item

        if current_text:
            section_blocks.append((current_section, current_text))

        # Chunk each section
        chunk_idx = 0
        for sec_name, sec_text in section_blocks:
            paragraphs = [p.strip() for p in sec_text.split("\n\n") if p.strip()]
            buffer = ""

            for para in paragraphs:
                if len(buffer) + len(para) < self.chunk_size:
                    buffer = (buffer + "\n\n" + para) if buffer else para
                else:
                    if buffer:
                        chunk_id = f"{file_path.stem}_{chunk_idx}"
                        # Include contextual header prefix for rich dense embedding matching
                        header_prefix = f"[{doc_name} | {sec_name} | {sensor or 'Lunar Science'}]: "
                        full_chunk_text = header_prefix + buffer.strip()
                        chunks.append(
                            DocumentChunk(
                                chunk_id=chunk_id,
                                text=full_chunk_text,
                                source_path=str(file_path),
                                document_name=doc_name,
                                section=sec_name,
                                sensor=sensor,
                                mission=mission,
                                page=None,
                            )
                        )
                        chunk_idx += 1
                        # Retain overlap from end of buffer
                        overlap_start = max(0, len(buffer) - self.chunk_overlap)
                        buffer = buffer[overlap_start:] + "\n\n" + para
                    else:
                        buffer = para

            if buffer.strip():
                chunk_id = f"{file_path.stem}_{chunk_idx}"
                header_prefix = f"[{doc_name} | {sec_name} | {sensor or 'Lunar Science'}]: "
                full_chunk_text = header_prefix + buffer.strip()
                chunks.append(
                    DocumentChunk(
                        chunk_id=chunk_id,
                        text=full_chunk_text,
                        source_path=str(file_path),
                        document_name=doc_name,
                        section=sec_name,
                        sensor=sensor,
                        mission=mission,
                        page=None,
                    )
                )
                chunk_idx += 1

        return chunks

    def chunk_pdf(self, file_path: Path) -> List[DocumentChunk]:
        chunks: List[DocumentChunk] = []
        try:
            from pypdf import PdfReader
            reader = PdfReader(str(file_path))
            doc_name = file_path.stem.replace("_", " ").title()
            chunk_idx = 0

            for page_num, page in enumerate(reader.pages, start=1):
                page_text = page.extract_text() or ""
                page_text = page_text.strip()
                if not page_text:
                    continue

                mission, sensor = self.detect_mission_and_sensor(page_text, file_path)
                
                # Split page text into chunks
                words = page_text.split()
                step = 100
                overlap = 20
                for i in range(0, len(words), step - overlap):
                    chunk_words = words[i:i + step]
                    chunk_text = " ".join(chunk_words)
                    if len(chunk_text.strip()) > 30:
                        chunk_id = f"{file_path.stem}_p{page_num}_{chunk_idx}"
                        chunks.append(
                            DocumentChunk(
                                chunk_id=chunk_id,
                                text=chunk_text,
                                source_path=str(file_path),
                                document_name=doc_name,
                                section=f"Page {page_num}",
                                sensor=sensor,
                                mission=mission,
                                page=page_num,
                            )
                        )
                        chunk_idx += 1
        except Exception as e:
            print(f"[Warning] Failed to parse PDF {file_path}: {e}")
        return chunks

    def chunk_file(self, file_path: Path) -> List[DocumentChunk]:
        suffix = file_path.suffix.lower()
        if suffix in [".md", ".txt"]:
            try:
                content = file_path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                content = file_path.read_text(encoding="latin-1", errors="ignore")
            return self.chunk_markdown(content, file_path)
        elif suffix == ".pdf":
            return self.chunk_pdf(file_path)
        return []
