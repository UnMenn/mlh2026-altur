from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import torch
torch.set_num_threads(1)

from backend.routers import (
  audio_router,
)

app = FastAPI(title="Hackathon MTY - Audio Analysis")

# CORS for connection with Frontend React App
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

router = APIRouter(prefix="/api")

router.include_router(audio_router.router, tags=["Audio Analysis"])
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
