#!/usr/bin/env python3
"""
LUNA-MATCH — Qwen3-VL-8B-Instruct Quick Start Script
======================================================
Runs the official Qwen3-VL-8B-Instruct model locally using HuggingFace Transformers.

Prerequisites:
    pip install git+https://github.com/huggingface/transformers
    pip install accelerate qwen-vl-utils torch torchvision

Usage:
    # Text-only mode (no images)
    python run_qwen3vl.py --text "What is OHRC resolution?"

    # Single image mode
    python run_qwen3vl.py --image path/to/lunar.png --text "Describe this lunar surface."

    # Two images (source + reference) for comparison
    python run_qwen3vl.py --source path/to/source.png --reference path/to/reference.png

    # Use a URL image (Qwen3-VL supports URLs natively)
    python run_qwen3vl.py --image-url "https://example.com/moon.jpg" --text "Analyze this image."

    # Run full LUNA-MATCH RAG+VLM pipeline (requires the full app to be set up)
    python run_qwen3vl.py --luna-mode --text "Is this registration reliable?"
"""

import argparse
import sys
import time

# ── Qwen3-VL recommended VL hyperparameters ──────────────────────────────────
VL_GENERATION_KWARGS = dict(
    do_sample=True,
    top_p=0.8,
    top_k=20,
    temperature=0.7,
    repetition_penalty=1.0,
    max_new_tokens=2048,
)

MODEL_NAME = "Qwen/Qwen3-VL-8B-Instruct"
SYSTEM_PROMPT = (
    "You are LUNA-MATCH AI, a scientific assistant specializing in Chandrayaan-2 lunar imagery "
    "(OHRC, TMC-2, IIRS), planetary science, and image registration analysis. "
    "Provide precise, grounded, technical responses. Do not hallucinate numbers or sensor specs."
)


def load_model():
    """Load Qwen3-VL model and processor exactly as the official quickstart specifies."""
    try:
        from transformers import Qwen3VLForConditionalGeneration, AutoProcessor
    except ImportError:
        print("[ERROR] Qwen3VLForConditionalGeneration not found.")
        print("Install the latest transformers:")
        print("  pip install git+https://github.com/huggingface/transformers")
        print("  pip install accelerate qwen-vl-utils")
        sys.exit(1)

    print(f"[+] Loading {MODEL_NAME} …")
    print("    dtype=auto  | device_map=auto")
    print("    (First run downloads ~16 GB — subsequent runs use cache)")
    t0 = time.time()

    model = Qwen3VLForConditionalGeneration.from_pretrained(
        MODEL_NAME,
        dtype="auto",
        device_map="auto",
    )
    processor = AutoProcessor.from_pretrained(MODEL_NAME)

    elapsed = time.time() - t0
    print(f"[+] Model loaded in {elapsed:.1f}s  |  device: {model.device}\n")
    return model, processor


def build_messages(text: str, image_paths=None, image_urls=None):
    """Build the role-based message list Qwen3-VL expects."""
    from PIL import Image

    user_content = []

    # Add image(s) first (before text, as recommended)
    if image_paths:
        for path in image_paths:
            pil_img = Image.open(path).convert("RGB")
            user_content.append({"type": "image", "image": pil_img})

    if image_urls:
        for url in image_urls:
            user_content.append({"type": "image", "image": url})

    user_content.append({"type": "text", "text": text})

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]


def run_inference(model, processor, messages):
    """Run model inference using apply_chat_template (official pattern)."""
    import torch

    print("[+] Preparing inputs with apply_chat_template …")
    inputs = processor.apply_chat_template(
        messages,
        tokenize=True,
        add_generation_prompt=True,
        return_dict=True,
        return_tensors="pt",
    )
    inputs = inputs.to(model.device)

    input_token_count = inputs["input_ids"].shape[1]
    print(f"    Input tokens: {input_token_count}")

    print(f"[+] Generating (top_p=0.8, top_k=20, temp=0.7, max_new_tokens={VL_GENERATION_KWARGS['max_new_tokens']}) …")
    t0 = time.time()

    import torch
    with torch.no_grad():
        generated_ids = model.generate(**inputs, **VL_GENERATION_KWARGS)

    # Trim the input token prefix — return only newly generated tokens
    generated_ids_trimmed = [
        out_ids[len(in_ids):]
        for in_ids, out_ids in zip(inputs["input_ids"], generated_ids)
    ]

    output_texts = processor.batch_decode(
        generated_ids_trimmed,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=False,
    )

    elapsed = time.time() - t0
    new_tokens = generated_ids_trimmed[0].shape[0]
    print(f"    Generated {new_tokens} tokens in {elapsed:.1f}s  ({new_tokens/elapsed:.1f} tok/s)\n")

    return output_texts[0].strip()


def run_luna_mode(text: str, image_paths=None):
    """
    Full LUNA-MATCH pipeline mode:
    RAG retrieval → context injection → Qwen3-VL generation.
    Requires the full app to be configured (data/index/ must exist).
    """
    print("[+] LUNA-MATCH pipeline mode: running RAG retrieval first …")
    try:
        import sys, os
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from app.rag.retriever import LunarRAGRetriever
        retriever = LunarRAGRetriever()
        retriever.load()
        results = retriever.retrieve(text, top_k=3)
        rag_context = retriever.format_context_for_prompt(results)
        sources = retriever.get_sources_metadata(results)
        print(f"    Retrieved {len(results)} knowledge chunks")
        for s in sources:
            print(f"    - [{s.get('sensor', '?')}] {s.get('source', '?')}")
        print()

        augmented_text = (
            f"Retrieved Knowledge:\n{rag_context}\n\n"
            f"User Question: {text}\n\n"
            "Answer precisely using the retrieved knowledge above. Cite sensor/mission sources."
        )
    except Exception as e:
        print(f"    [WARN] RAG not available ({e}), running VLM-only.")
        augmented_text = text
        sources = []

    return augmented_text, sources


def main():
    parser = argparse.ArgumentParser(
        description="Qwen3-VL-8B-Instruct Quick Start for LUNA-MATCH",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--text", "-t", default="Describe what you see.", help="Text prompt")
    parser.add_argument("--image", "-i", nargs="+", help="Path(s) to local image file(s)")
    parser.add_argument("--source", help="Path to source lunar image (for comparison)")
    parser.add_argument("--reference", help="Path to reference lunar image (for comparison)")
    parser.add_argument("--image-url", nargs="+", dest="image_url", help="URL(s) of image(s)")
    parser.add_argument("--luna-mode", action="store_true", help="Enable LUNA-MATCH RAG pipeline")
    parser.add_argument("--max-tokens", type=int, default=2048, help="Max new tokens to generate")
    parser.add_argument("--temperature", type=float, default=0.7, help="Sampling temperature")
    args = parser.parse_args()

    # Update generation kwargs from CLI args
    VL_GENERATION_KWARGS["max_new_tokens"] = args.max_tokens
    VL_GENERATION_KWARGS["temperature"] = args.temperature

    # Collect image paths
    image_paths = []
    if args.image:
        image_paths.extend(args.image)
    if args.source:
        image_paths.append(args.source)
    if args.reference:
        image_paths.append(args.reference)

    # Adapt prompt for comparison mode
    text = args.text
    if args.source and args.reference and text == "Describe what you see.":
        text = (
            "Compare the two lunar images. "
            "Identify differences in scale, illumination, and which features "
            "would serve as reliable tie-points for image registration."
        )

    # LUNA-MATCH RAG pipeline mode
    sources = []
    if args.luna_mode:
        text, sources = run_luna_mode(text, image_paths or None)

    # Load model
    model, processor = load_model()

    # Build messages
    messages = build_messages(
        text=text,
        image_paths=image_paths or None,
        image_urls=args.image_url or None,
    )

    # Run inference
    output = run_inference(model, processor, messages)

    # Display output
    print("=" * 72)
    print("QWEN3-VL OUTPUT")
    print("=" * 72)
    print(output)
    print("=" * 72)

    if sources:
        print("\nRAG Sources:")
        for s in sources:
            print(f"  [{s.get('sensor', '?')}] {s.get('source', '?')}")

    return output


if __name__ == "__main__":
    main()
