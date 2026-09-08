"""Core ML API Interface Module."""
from app.core_api.client import (
    BaseCoreMLClient,
    HttpCoreMLClient,
    RegistrationResult,
)
from app.core_api.mock_client import MockCoreMLClient
from app.core_api.real_client import RealCoreMLClient
from app.config import settings


def get_core_ml_client() -> BaseCoreMLClient:
    """Factory to retrieve appropriate Core ML engine client."""
    backend = getattr(settings, "CORE_ML_BACKEND", None)
    if backend == "real":
        return RealCoreMLClient()
    elif backend == "http":
        return HttpCoreMLClient()
    elif backend == "mock":
        return MockCoreMLClient()

    if settings.CORE_ML_USE_MOCK:
        return MockCoreMLClient()
    return HttpCoreMLClient()


__all__ = [
    "BaseCoreMLClient",
    "HttpCoreMLClient",
    "MockCoreMLClient",
    "RealCoreMLClient",
    "RegistrationResult",
    "get_core_ml_client",
]
