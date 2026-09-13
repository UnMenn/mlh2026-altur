from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import torch
torch.set_num_threads(1)

from contextlib import asynccontextmanager
from backend.tiger_database import db

from backend.routers import (
  audio_router, database_router
)

# Hypertable Architecture for Call Telemetry
@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.close()

app = FastAPI(title="Hackathon MTY - Audio Analysis", lifespan=lifespan)

# CORS for connection with Frontend React App
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

router = APIRouter()

router.include_router(audio_router.router, tags=["Audio Analysis"])
router.include_router(database_router.router, tags=["Database Telemetry"])
app.include_router(router)

@app.get("/")
async def root():
  return {"message": "API de análisis de audio funcionando"}

@app.get("/api/health")
def health():
  return {"status": "ok"}

if __name__ == "__main__":
  uvicorn.run(
    "main:app",
    host="0.0.0.0",
    port=8000,
    reload=True,
  )
