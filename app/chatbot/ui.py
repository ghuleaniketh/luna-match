"""
Streamlit Web Interface for LUNA-MATCH AI Layer.
Combines Multimodal Visual Understanding (Qwen3-VL), Grounded RAG, and Core ML Registration Engine.
"""

import streamlit as st
from PIL import Image
from pathlib import Path
import io
import base64
import json

from app.config import settings
from app.orchestrator.agent import LunaMatchOrchestrator, IntentType, AgentResponse
from app.core_api.client import RegistrationResult
from app.rag.retriever import LunarRAGRetriever

# Page configuration
st.set_page_config(
    page_title="LUNA-MATCH | AI Registration Layer",
    page_icon="🌙",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for modern space theme
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        color: #94a3b8;
        font-size: 0.95rem;
        margin-bottom: 1.5rem;
    }
    .metric-box {
        background-color: #1e293b;
        border-radius: 8px;
        padding: 12px;
        border: 1px solid #334155;
        text-align: center;
    }
    .metric-value {
        font-size: 1.4rem;
        font-weight: 700;
        color: #38bdf8;
    }
    .metric-label {
        font-size: 0.8rem;
        color: #94a3b8;
        text-transform: uppercase;
    }
    .citation-box {
        background-color: #0f172a;
        border-left: 3px solid #38bdf8;
        padding: 8px 12px;
        margin-top: 8px;
        font-size: 0.85rem;
        border-radius: 0 6px 6px 0;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_resource
def get_orchestrator():
    return LunaMatchOrchestrator()


def base64_to_image(b64_str: str) -> Image.Image:
    if "," in b64_str:
        b64_str = b64_str.split(",")[1]
    image_bytes = base64.b64decode(b64_str)
    return Image.open(io.BytesIO(image_bytes))


# Session State Initialization
if "messages" not in st.session_state:
    st.session_state.messages = []
if "registration_result" not in st.session_state:
    st.session_state.registration_result = None
if "source_image" not in st.session_state:
    st.session_state.source_image = None
if "reference_image" not in st.session_state:
    st.session_state.reference_image = None


# Header
st.markdown('<div class="main-header">🌙 LUNA-MATCH AI Layer</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="sub-header">SIH 2026 (SIH26166) | Multi-modal, Sun Angle & Scale Invariant Lunar Image Correspondence (Chandrayaan-2 OHRC, TMC-2, IIRS)</div>',
    unsafe_allow_html=True
)

orchestrator = get_orchestrator()

# Sidebar Controls
with st.sidebar:
    st.header("⚙️ Configuration & Diagnostics")
    st.info(f"**VLM Model**: `{settings.VLM_MODEL}`\n\n**VLM Backend**: `{settings.VLM_BACKEND}`\n\n**Embedding**: `{settings.RAG_EMBEDDING_MODEL.split('/')[-1]}`")

    st.subheader("📁 Sample Lunar Data")
    sample_src_path = Path("data/sample_images/source_ohrc_sample.png")
    sample_ref_path = Path("data/sample_images/reference_tmc2_sample.png")

    if sample_src_path.exists() and sample_ref_path.exists():
        if st.button("📥 Load Sample Lunar Images (OHRC / TMC-2)", use_container_width=True):
            st.session_state.source_image = Image.open(sample_src_path)
            st.session_state.reference_image = Image.open(sample_ref_path)
            st.session_state.registration_result = None
            st.success("Loaded sample images!")
            st.rerun()

    if st.button("🗑️ Reset All State", use_container_width=True):
        st.session_state.messages = []
        st.session_state.registration_result = None
        st.session_state.source_image = None
        st.session_state.reference_image = None
        st.rerun()

    st.markdown("---")
    st.markdown("### 📚 Quick Knowledge Queries")
    quick_q = st.selectbox(
        "Ask Pre-defined Question:",
        [
            "",
            "What is OHRC?",
            "What is TMC-2?",
            "What is IIRS?",
            "What is the difference between OHRC and TMC-2?",
            "What does RMSE mean in image registration?",
            "Why is uniform distribution of match points important?",
            "What does sub-pixel accuracy mean?",
        ]
    )
    if quick_q:
        st.session_state.messages.append({"role": "user", "content": quick_q})
        with st.spinner("Retrieving grounded planetary knowledge..."):
            resp = orchestrator.process(query=quick_q)
            st.session_state.messages.append({
                "role": "assistant",
                "content": resp.text_response,
                "sources": resp.sources,
            })
        st.rerun()


# Top Section: Image Upload & Registration Workspace
col_left, col_right = st.columns(2)

with col_left:
    st.subheader("1️⃣ Source Image (Sensed)")
    src_file = st.file_uploader("Upload Source Lunar Image", type=["png", "jpg", "jpeg", "tif"], key="src_upload")
    if src_file:
        st.session_state.source_image = Image.open(src_file)

    if st.session_state.source_image:
        st.image(st.session_state.source_image, caption="Source Lunar Frame", use_container_width=True)

with col_right:
    st.subheader("2️⃣ Reference Image (Base)")
    ref_file = st.file_uploader("Upload Reference Lunar Image", type=["png", "jpg", "jpeg", "tif"], key="ref_upload")
    if ref_file:
        st.session_state.reference_image = Image.open(ref_file)

    if st.session_state.reference_image:
        st.image(st.session_state.reference_image, caption="Reference Lunar Frame", use_container_width=True)


# Action Buttons
st.markdown("---")
btn_col1, btn_col2, btn_col3, _ = st.columns([1.5, 1.5, 1.5, 3])

with btn_col1:
    register_clicked = st.button("⚡ Register Images", type="primary", use_container_width=True, disabled=not (st.session_state.source_image and st.session_state.reference_image))

with btn_col2:
    compare_clicked = st.button("🔍 Compare Scenes", use_container_width=True, disabled=not (st.session_state.source_image and st.session_state.reference_image))

with btn_col3:
    analyze_clicked = st.button("👁️ Analyze Source", use_container_width=True, disabled=not st.session_state.source_image)


# Handle Action Button Triggers
if register_clicked:
    with st.spinner("Core ML Engine performing SIFT, RANSAC, Homography, and Sub-pixel Warping..."):
        resp = orchestrator.process(
            query="Register these two images and evaluate the registration quality.",
            source_image=st.session_state.source_image,
            reference_image=st.session_state.reference_image,
        )
        if resp.registration_result:
            st.session_state.registration_result = resp.registration_result
            st.session_state.messages.append({
                "role": "assistant",
                "content": resp.text_response,
                "sources": resp.sources,
            })
            st.rerun()

elif compare_clicked:
    with st.spinner("Qwen3-VL comparing visual scale, illumination, and scene overlap..."):
        resp = orchestrator.process(
            query="Compare these two images descriptively.",
            source_image=st.session_state.source_image,
            reference_image=st.session_state.reference_image,
        )
        st.session_state.messages.append({
            "role": "assistant",
            "content": resp.text_response,
            "sources": resp.sources,
        })
        st.rerun()

elif analyze_clicked:
    with st.spinner("Qwen3-VL analyzing surface morphology and illumination..."):
        resp = orchestrator.process(
            query="Describe this lunar image in detail.",
            source_image=st.session_state.source_image,
        )
        st.session_state.messages.append({
            "role": "assistant",
            "content": resp.text_response,
            "sources": resp.sources,
        })
        st.rerun()


# Registration Output Display
if st.session_state.registration_result:
    reg = st.session_state.registration_result
    st.markdown("### 📊 Measured Registration Results (Core ML Engine Ground Truth)")

    # Metrics Dashboard Cards
    m_col1, m_col2, m_col3, m_col4, m_col5, m_col6 = st.columns(6)
    with m_col1:
        st.markdown(f'<div class="metric-box"><div class="metric-label">Status</div><div class="metric-value" style="color:#4ade80;">{reg.get("status", "N/A").upper()}</div></div>', unsafe_allow_html=True)
    with m_col2:
        st.markdown(f'<div class="metric-box"><div class="metric-label">Total Matches</div><div class="metric-value">{reg.get("total_matches", 0)}</div></div>', unsafe_allow_html=True)
    with m_col3:
        st.markdown(f'<div class="metric-box"><div class="metric-label">Inliers</div><div class="metric-value">{reg.get("inliers", 0)}</div></div>', unsafe_allow_html=True)
    with m_col4:
        inlier_pct = f"{round(reg.get('inlier_ratio', 0) * 100, 1)}%"
        st.markdown(f'<div class="metric-box"><div class="metric-label">Inlier Ratio</div><div class="metric-value">{inlier_pct}</div></div>', unsafe_allow_html=True)
    with m_col5:
        rmse_val = f"{round(reg.get('rmse', 0), 3)} px"
        st.markdown(f'<div class="metric-box"><div class="metric-label">RMSE</div><div class="metric-value">{rmse_val}</div></div>', unsafe_allow_html=True)
    with m_col6:
        sub_px = "✅ YES" if reg.get("subpixel_accuracy") else "❌ NO"
        st.markdown(f'<div class="metric-box"><div class="metric-label">Sub-Pixel</div><div class="metric-value">{sub_px}</div></div>', unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Visualization Columns
    viz_col1, viz_col2, viz_col3 = st.columns(3)
    with viz_col1:
        st.caption("🎯 Registered (Warped) Source")
        if reg.get("registered_image"):
            st.image(base64_to_image(reg["registered_image"]), use_container_width=True)

    with viz_col2:
        st.caption("📌 Tie-Point Matches (RANSAC Inliers)")
        if reg.get("match_points_image"):
            st.image(base64_to_image(reg["match_points_image"]), use_container_width=True)

    with viz_col3:
        st.caption("✨ Alignment Overlay (50% Blend)")
        if reg.get("overlay_image"):
            st.image(base64_to_image(reg["overlay_image"]), use_container_width=True)


# Chat Conversation Interface
st.markdown("---")
st.subheader("💬 Multimodal Assistant & Registration Interpretation")

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])
        if msg.get("sources"):
            st.markdown("**📚 Retrieved Grounded Sources:**")
            for src in msg["sources"]:
                st.markdown(
                    f'<div class="citation-box"><b>{src["document"]}</b> | <i>{src["sensor"]}</i> | Section: {src["section"]} (Similarity: {src["score"]})<br>{src["snippet"]}</div>',
                    unsafe_allow_html=True
                )

# Chat Input Box
user_prompt = st.chat_input("Ask a question about the registration result, lunar images, or mission science...")
if user_prompt:
    st.session_state.messages.append({"role": "user", "content": user_prompt})
    with st.chat_message("user"):
        st.markdown(user_prompt)

    # Generate assistant response
    with st.chat_message("assistant"):
        with st.spinner("Reasoning with Qwen3-VL and lunar domain knowledge..."):
            current_reg_obj = None
            if st.session_state.registration_result:
                current_reg_obj = RegistrationResult(**st.session_state.registration_result)

            response: AgentResponse = orchestrator.process(
                query=user_prompt,
                source_image=st.session_state.source_image,
                reference_image=st.session_state.reference_image,
                current_registration=current_reg_obj,
            )

            st.markdown(response.text_response)

            if response.sources:
                st.markdown("**📚 Retrieved Grounded Sources:**")
                for src in response.sources:
                    st.markdown(
                        f'<div class="citation-box"><b>{src["document"]}</b> | <i>{src["sensor"]}</i> | Section: {src["section"]} (Similarity: {src["score"]})<br>{src["snippet"]}</div>',
                        unsafe_allow_html=True
                    )

            st.session_state.messages.append({
                "role": "assistant",
                "content": response.text_response,
                "sources": response.sources,
            })
