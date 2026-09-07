"""Core ML API Interface Module."""
from app.core_api.client import (
    BaseCoreMLClient,
    HttpCoreMLClient,
    RegistrationResult,
)
from app.core_api.mock_client import MockCoreMLClient
from app.config import settings


def get_core_ml_client() -> BaseCoreMLClient:
    """Factory to retrieve appropriate Core ML engine client."""
    if settings.CORE_ML_USE_MOCK:
        return MockCoreMLClient()
    return HttpCoreMLClient()


__all__ = [
    "BaseCoreMLClient",
    "HttpCoreMLClient",
    "MockCoreMLClient",
    "RegistrationResult",
    "get_core_ml_client",
]
