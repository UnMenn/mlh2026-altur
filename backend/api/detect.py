import base64
import binascii

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.audio.decoder import decode_base64_wav
from backend.audio.validation import validate_wav
from backend.audio.channels import extract_channels

router = APIRouter()


class DetectRequest(BaseModel):
    audio: str


@router.post("/detect")
def detect(request: DetectRequest):
    # Base64 → WAV bytes
    try:
        wav_bytes = decode_base64_wav(request.audio)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    # Validate WAV format
    try:
        validate_wav(wav_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    # Extract caller and agent channels
    try:
        caller_audio, agent_audio = extract_channels(wav_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    # TODO Add correct format for altur
    return {
        "status": "ready",
        "message": "Audio validated successfully",
        "caller_samples": len(caller_audio),
        "agent_samples": len(agent_audio),
    }

