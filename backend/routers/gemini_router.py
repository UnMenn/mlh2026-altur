import base64
import binascii
import traceback

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from backend.tiger_database import db
from backend.audio.channels import extract_channels
from backend.audio.validation import validate_wav
from backend.utils.snowflake_connection import snowflake_connection
from backend.utils.geminai import contact_gemini
from backend.utils.transcript import transcribe_mono_audio

router = APIRouter()


class AudioRequest(BaseModel):
    call_id: str
    audio_base64: str
    sample_rate: int
    channels: int


@router.post("/gemini-response")
async def get_gemini_response(
    background_tasks: BackgroundTasks,
    request: AudioRequest,
):
    EXPECTED_SAMPLE_RATE = 8000
    EXPECTED_CHANNELS = 2

    # -----------------------------
    # Validate request parameters
    # -----------------------------

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
        # -----------------------------
        # Decode Base64
        # -----------------------------

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

        print("1. Base64 decoded")

        # -----------------------------
        # Validate WAV
        # -----------------------------

        validate_wav(
            wav_bytes,
            request.sample_rate,
            request.channels,
        )

        print("2. WAV validated")

        # -----------------------------
        # Extract channels + transcript
        # -----------------------------

        (
            _,
            _,
            full_text_path,
            channel0_text_path,
            channel1_text_path,
        ) = extract_channels(
            wav_bytes,
            request.call_id,
        )

        print("3. Channels extracted")

        full_text = transcribe_mono_audio(full_text_path)
        channel0_text = transcribe_mono_audio(channel0_text_path)
        channel1_text = transcribe_mono_audio(channel1_text_path)

        # -----------------------------
        # Snowflake
        # -----------------------------

        snowflake_connection(request.call_id)

        print("4. Snowflake connection done")

        # -----------------------------
        # Gemini
        # -----------------------------

        gemini_response = contact_gemini(
            full_text,
            channel0_text,
            channel1_text,
        )

        print("5. Gemini response received")
        print("GEMINI:", gemini_response)

        # -----------------------------
        # Telemetry
        # -----------------------------

        background_tasks.add_task(
            db.log_call_telemetry,
            filename=request.call_id,
            probability=0.5,
            status="no",
            segments_count=2,
        )

        print("6. Returning response")

        return {
            "full_text": full_text,
            "channel0_text": channel0_text,
            "channel1_text": channel1_text,
            "gemini_response": gemini_response,
        }

    # Preserve intentional HTTP errors
    except HTTPException:
        raise

    # Catch unexpected errors
    except Exception as e:
        print("\n========== GEMINI ENDPOINT ERROR ==========")
        traceback.print_exc()
        print("============================================\n")

        raise HTTPException(
            status_code=500,
            detail=(
                f"Internal error processing audio: "
                f"{type(e).__name__}: {str(e)}"
            ),
        )
