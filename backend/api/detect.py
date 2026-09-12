import base64
import binascii

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.audio.decoder import decode_base64_wav
from backend.audio.validation import validate_wav
from backend.audio.channels import extract_channels
from backend.audio.turns import detect_turns

router = APIRouter()


class DetectRequest(BaseModel):
    audio: str


@router.post("/detect")
def detect(request: DetectRequest):
    try:
        wav_bytes = decode_base64_wav(request.audio)
        validate_wav(wav_bytes)
        caller_audio, agent_audio = extract_channels(wav_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    return detect_turns(
        caller_audio,
        agent_audio,
    )
