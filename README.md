# 🌙 LUNA-MATCH: AI Layer

> **Smart India Hackathon 2026 (SIH26166)**:  
> *Multi-modal, Sun angle and scale invariant image correspondence using Chandrayaan-2 optical images (OHRC, TMC and IIRS)*

---

## 🏛️ System Architecture

```text
                         USER
                           |
                           v
                     CHATBOT / UI
                           |
                           v
                    QWEN3-VL-8B
                         VLM
                    /             \
                   /               \
                  v                 v
                 RAG          ORCHESTRATOR
                                   |
                                   v
                              CORE ML API
                                   |
                                   v
                          REGISTRATION ENGINE
                                   |
                                   v
                                RESULTS
                                   |
                     +-------------+-------------+
                     |                           |
                     v                           v
              Registered Image              JSON Metrics
              Match Points                  RMSE
              Overlay                       Inlier Count
                                            Inlier Ratio
                                            Sub-pixel Accuracy
                     |                           |
                     +-------------+-------------+
                                   |
                                   v
                           QWEN3-VL-8B
                         RESULT INTERPRETATION
                                   |
                                   v
                            FINAL RESPONSE
```

### Core Architectural Principle
- **Core ML Registration Engine**: The absolute ground truth for feature detection (SIFT/ORB/SuperPoint), RANSAC outlier filtering, spatial homogenization, transformation matrices, RMSE, inlier ratio, and sub-pixel registration accuracy.
- **AI Layer**: Responsible for multimodal visual perception (**Qwen/Qwen3-VL-8B-Instruct**), grounded scientific domain retrieval (**RAG**), tool orchestration, natural language explanation, and UI presentation without hallucinating metrics.

---

## 📂 Project Structure

```text
d:/luna-match-main/
│
├── app/
│   ├── config.py                  # Typed settings (Pydantic BaseSettings)
│   ├── main.py                    # FastAPI server entrypoint
│   │
│   ├── vlm/                       # Modular VLM client & vision layer
│   │   ├── client.py              # Base / OpenAI-compatible / Transformers / Mock clients
│   │   ├── vision.py              # Visual question answering & overlay explanation
│   │   └── prompts.py             # Grounded system prompts
│   │
│   ├── rag/                       # Grounded Planetary Knowledge RAG
│   │   ├── chunking.py            # Markdown/PDF chunker with metadata retention
│   │   ├── embeddings.py          # Sentence-transformers embedding wrapper
│   │   ├── vectorstore.py         # FAISS vector store with disk persistence
│   │   ├── retriever.py           # Top-K retrieval with citation formatting
│   │   └── ingest.py              # Knowledge ingestion CLI
│   │
│   ├── orchestrator/              # Intent classification and tool routing
│   │   ├── agent.py               # Orchestrator agent
│   │   └── tools.py               # Clean Python tool interfaces
│   │
│   ├── core_api/                  # Core ML Engine interface
│   │   ├── client.py              # Abstract & HTTP Core ML client
│   │   └── mock_client.py         # Structural mock client for isolated testing
│   │
│   └── chatbot/
│       └── ui.py                  # Streamlit application
│
├── knowledge/                     # Authoritative Lunar & Mission Knowledge Base
│   ├── isro/                      # Chandrayaan-2 mission overview & objectives
│   ├── ohrc/                      # Orbiter High Resolution Camera specs (0.25-0.32m)
│   ├── tmc2/                      # Terrain Mapping Camera-2 specs (5m, Triplet Stereo)
│   ├── iirs/                      # Imaging Infrared Spectrometer (0.8-5.0um hyperspectral)
│   ├── lro/                       # LROC Narrow Angle Camera reference (0.5m)
│   ├── registration/              # SIFT/ORB, RANSAC, RMSE, Inlier Ratio, Sub-pixel accuracy
│   └── sih/                       # SIH26166 problem statement details
│
├── data/
│   ├── index/                     # Persistent FAISS index & metadata
│   └── sample_images/             # Lunar test imagery
│
├── tests/
│   └── test_rag.py                # Automated RAG unit & integration tests
│
├── .env.example
├── requirements.txt
└── README.md
```

---

## 🚀 Quick Start (Phase 1 & Phase 2)

### 1. Ingest Lunar Knowledge Base
Build and persist the local vector embeddings into `data/index/`:
```bash
python -m app.rag.ingest
```

### 2. Query the Knowledge Base (CLI)
Test retrieval and ground truth extraction directly from the command line:
```bash
python -m app.rag.retriever --query "What is OHRC?"
python -m app.rag.retriever --query "What does RMSE mean in image registration?"
python -m app.rag.retriever --query "Why is uniform distribution of match points important?"
```

### 3. Run the Interactive Judge Demo
For a zero-setup walkthrough of the AI layer, run this from the repository root:
```bash
python demo.py
```

Choose options `1`-`7` for cited ISRO/RAG explanations or option `8` to run the
end-to-end registration simulation with measured RMSE, inlier ratio, and a
grounded multimodal interpretation. Press `Q` to exit.

### 4. Run Automated Unit Tests
```bash
pytest tests/test_rag.py -v
```

### 5. Start FastAPI Backend
```bash
uvicorn app.main:app --reload --port 8000
```
Interactive API docs available at: `http://localhost:8000/docs`.
