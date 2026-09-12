from fastapi import FastAPI

from backend.api.detect import router as detect_router

app = FastAPI(
    title="MLH2026 Altur API",
    version="0.0.0",
)

# Register API routes
app.include_router(detect_router)

