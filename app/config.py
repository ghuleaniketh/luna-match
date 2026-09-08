"""
Central configuration for LUNA-MATCH AI Layer.
Loads environment variables and provides typed settings.
"""

from pathlib import Path
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory for the project
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Project metadata
    PROJECT_NAME: str = "LUNA-MATCH AI Layer"
    PROJECT_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # VLM Configuration
    VLM_MODEL: str = "Qwen/Qwen3-VL-8B-Instruct"
    # Backend: local Qwen3-VL, OpenAI-compatible API, Groq-hosted VLM, or offline demo.
    VLM_BACKEND: Literal["openai", "groq", "transformers", "mock"] = "mock"
    VLM_BASE_URL: str = "https://api.openai.com/v1"
    VLM_API_KEY: str = ""
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_API_KEY: str = ""
    # Recommended Groq multimodal/default model for image-aware chat.
    # If using a different Groq model, override it in your local .env file.
    GROQ_MODEL: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    VLM_MAX_TOKENS: int = 2048       # max_new_tokens for generation

    # Qwen3-VL recommended VL generation hyperparameters
    VLM_TEMPERATURE: float = 0.7    # Qwen3-VL VL default
    VLM_TOP_P: float = 0.8          # Qwen3-VL VL default
    VLM_TOP_K: int = 20             # Qwen3-VL VL default
    VLM_REPETITION_PENALTY: float = 1.0  # Qwen3-VL VL default

    # RAG Configuration
    RAG_EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    RAG_INDEX_DIR: Path = BASE_DIR / "data" / "index"
    KNOWLEDGE_DIR: Path = BASE_DIR / "knowledge"
    RAG_DATA_DIR: Path = BASE_DIR / "data"
    RAG_TOP_K: int = 4
    RAG_SCORE_THRESHOLD: float = 0.35

    # Core ML API Configuration
    CORE_ML_API_URL: str = "http://localhost:8001"
    CORE_ML_USE_MOCK: bool = True
    CORE_ML_TIMEOUT_SECONDS: int = 60

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000


settings = Settings()
