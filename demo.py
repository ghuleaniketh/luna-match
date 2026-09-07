"""
🌙 LUNA-MATCH: Interactive AI Layer Demo for Hackathon Judges
Demonstrates Grounded Planetary Knowledge RAG, Qwen3-VL Vision Reasoning,
and Core ML Image Registration Interpretation.
"""

import time
from pathlib import Path

from app.orchestrator.agent import LunaMatchOrchestrator
from app.rag.retriever import LunarRAGRetriever

PROJECT_ROOT = Path(__file__).resolve().parent

BANNER = """
================================================================================
          🌙 LUNA-MATCH : AI-POWERED LUNAR IMAGE REGISTRATION
          Smart India Hackathon 2026 | Problem Statement: SIH26166
   Chandrayaan-2 (OHRC, TMC-2, IIRS) Multi-modal, Sun Angle & Scale Invariance
================================================================================
"""

SAMPLE_QUERIES = [
    ("1", "What is OHRC?", "Sensor specifications & 0.25m ultra-high resolution"),
    ("2", "What is TMC-2?", "Triplet stereo imaging & 3D DEM generation"),
    ("3", "What is IIRS?", "Hyperspectral infrared & lunar hydration mapping"),
    ("4", "What is the difference between OHRC and TMC-2?", "Cross-sensor resolution & swath comparison"),
    ("5", "What does RMSE mean in image registration?", "Mathematical formula & scientific precision criteria"),
    ("6", "Why is uniform distribution of match points important?", "Preventing localized warping & homography bias"),
    ("7", "What does sub-pixel accuracy mean?", "Sub-pixel feature localization in lunar remote sensing"),
    ("8", "Simulate Full Registration Workflow", "Core ML Registration -> Metrics -> Qwen3-VL Grounded Report"),
]


def print_box(title: str, content: str, border_char: str = "-"):
    print("\n" + border_char * 75)
    print(f"  {title}")
    print(border_char * 75)
    print(content)
    print(border_char * 75 + "\n")


def run_demo():
    print(BANNER)
    print("[*] Initializing Grounded Lunar RAG Retriever...")
    try:
        retriever = LunarRAGRetriever()
        if not retriever.load():
            print("[!] Index not found. Auto-ingesting knowledge base...")
            from app.rag.ingest import ingest_knowledge_base
            ingest_knowledge_base()
            if not retriever.load():
                raise RuntimeError("The RAG index could not be loaded after ingestion.")

        orchestrator = LunaMatchOrchestrator()
    except Exception as exc:
        print(f"[!] Demo startup failed: {exc}")
        print("    Install requirements with: python -m pip install -r requirements.txt")
        return

    print("[+] RAG Knowledge Base Loaded Successfully (29 authoritative chunks indexed)!\n")

    while True:
        print("\n" + "=" * 75)
        print("  SELECT A DEMO QUERY FOR THE JUDGES (or type 'custom' / 'exit'):")
        print("=" * 75)
        for num, q, desc in SAMPLE_QUERIES:
            print(f"  [{num}] {q.ljust(48)} -> {desc}")
        print("  [C] Type your own custom question")
        print("  [Q] Quit Demo")
        print("-" * 75)

        try:
            choice = input("\nEnter choice [1-8, C, Q]: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting LUNA-MATCH Demo.\n")
            break

        if choice.lower() in ["q", "exit", "quit"]:
            print("\nExiting LUNA-MATCH Demo. Good luck with the judging session! 🚀\n")
            break

        query = None
        is_registration_sim = False

        if choice == "1":
            query = "What is OHRC?"
        elif choice == "2":
            query = "What is TMC-2?"
        elif choice == "3":
            query = "What is IIRS?"
        elif choice == "4":
            query = "What is the difference between OHRC and TMC-2?"
        elif choice == "5":
            query = "What does RMSE mean in image registration?"
        elif choice == "6":
            query = "Why is uniform distribution of match points important?"
        elif choice == "7":
            query = "What does sub-pixel accuracy mean?"
        elif choice == "8":
            is_registration_sim = True
        elif choice.lower() in ["c", "custom"]:
            query = input("\nEnter your custom question: ").strip()
            if not query:
                continue
        else:
            print("[!] Invalid option. Please select 1-8, C, or Q.")
            continue

        # Registration Simulation Flow
        if is_registration_sim:
            print("\n[*] Running End-to-End Image Registration Demo...")
            sample_dir = PROJECT_ROOT / "data" / "sample_images"
            sample_src = sample_dir / "source_ohrc_sample.png"
            sample_ref = sample_dir / "reference_tmc2_sample.png"

            if not sample_src.exists():
                from data.sample_images.generate_samples import create_sample_lunar_images
                create_sample_lunar_images(sample_dir)

            print(f"  -> Loading Source (OHRC): {sample_src}")
            print(f"  -> Loading Reference (TMC-2): {sample_ref}")
            print("  -> Executing Core ML Engine (SIFT + RANSAC + Sub-pixel refinement)...")
            time.sleep(1)

            resp = orchestrator.process(
                query="Register these two images and evaluate the registration quality.",
                source_image=sample_src,
                reference_image=sample_ref,
            )

            reg = resp.registration_result
            metrics_summary = (
                f"  STATUS           : {reg['status'].upper()}\n"
                f"  TOTAL MATCHES    : {reg['total_matches']}\n"
                f"  INLIER COUNT     : {reg['inliers']}\n"
                f"  INLIER RATIO     : {reg['inlier_ratio'] * 100:.2f}%\n"
                f"  RMSE (PIXELS)    : {reg['rmse']} px\n"
                f"  SUB-PIXEL ACC.   : {'ACHIEVED (< 0.5 px)' if reg['subpixel_accuracy'] else 'NOT ACHIEVED'}"
            )
            print_box("CORE ML MEASURED REGISTRATION METRICS (Ground Truth)", metrics_summary, border_char="=")

            print_box("QWEN3-VL MULTIMODAL INTERPRETATION & EXPLANATION", resp.text_response, border_char="*")

            if resp.sources:
                print("📚 GROUNDED KNOWLEDGE CITATIONS:")
                for i, src in enumerate(resp.sources, 1):
                    print(f"   [{i}] {src['document']} | Sensor: {src['sensor']} | Section: {src['section']} (Score: {src['score']})")

        # RAG / Text Query Flow
        elif query:
            print(f"\n[*] Querying LUNA-MATCH AI Engine: '{query}'")
            print("  -> Retrieving relevant knowledge chunks from FAISS vector store...")
            time.sleep(0.5)

            results = retriever.retrieve(query, top_k=3)
            context = retriever.format_context_for_prompt(results)
            sources = retriever.get_sources_metadata(results)

            print_box("RETRIEVED GROUNDED CONTEXT FROM ISRO/MISSION CORPUS", context)

            print("📚 SOURCES & CITATIONS ATTRIBUTION:")
            for i, src in enumerate(sources, 1):
                print(f"   [{i}] Document: {src['document']} | Sensor: {src['sensor']} | Section: {src['section']} (Similarity: {src['score']})")
                print(f"       Snippet: {src['snippet']}\n")


if __name__ == "__main__":
    run_demo()
