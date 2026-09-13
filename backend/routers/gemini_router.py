import base64
import binascii
from backend.tiger_database import db
from fastapi import APIRouter, BackgroundTasks, HTTPException, BackgroundTasks
from pydantic import BaseModel
from backend.audio.channels import extract_channels
from backend.audio.turns import detect_turns
from backend.audio.validation import validate_wav
from backend.utils import snowflake_connection
from backend.utils.audio_processor import extract_segments_from_turns
from backend.utils.geminai import contact_gemini
router = APIRouter()


class AudioRequest(BaseModel):
    call_id: str
    audio_base64: str
    sample_rate: int
    channels: int


@router.get("/gemini-response")
async def get_gemini_response(background_tasks: BackgroundTasks, request: AudioRequest):
    EXPECTED_SAMPLE_RATE = 8000
    EXPECTED_CHANNELS = 2

    if request.sample_rate != EXPECTED_SAMPLE_RATE:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sample rate. Expected {EXPECTED_SAMPLE_RATE} Hz.",
        )

    if request.channels != EXPECTED_CHANNELS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid channel count. Expected {EXPECTED_CHANNELS}.",
        )

    try:
        try:
            wav_bytes = base64.b64decode(
                request.audio_base64,
                validate=True,
            )
        except (binascii.Error, ValueError) as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid audio_base64: {str(e)}",
            )

        # Validate WAV
        validate_wav(
            wav_bytes,
            request.sample_rate,
            request.channels,
        )

        # Separate stereo channels
        _, _, full_text, channel0_text, channel1_text = extract_channels(
            wav_bytes, request.call_id)

        snowflake_connection(request.call_id)

        try:
            gemini_response = contact_gemini(
                full_text, channel0_text, channel1_text)

            background_tasks.add_task(
                db.log_call_telemetry,
                filename=request.call_id,
                probability=0.5,
                status="no",
                segments_count=2
            )

            return {
                "full_text": full_text,
                "channel0_text": channel0_text,
                "channel1_text": channel1_text,
                "gemini_response": gemini_response
            }
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error contacting Gemini API: {str(e)}")

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail=f"Internal error processing audio: {str(e)}",
        )
