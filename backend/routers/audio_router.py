from pydantic import BaseModel
from backend.audio.turns import detect_turns
from backend.audio.channels import extract_channels
from backend.audio.validation import validate_wav
from backend.audio.decoder import decode_base64_wav
from fastapi import FastAPI, APIRouter, File, HTTPException, UploadFile
from fastapi import FastAPI, APIRouter, File, HTTPException, UploadFile, BackgroundTasks
from backend.utils.audio_processor import extract_segments_from_turns, extract_features_from_numpy
from backend.utils.snowflake_connection import snowflake_connection
from pathlib import Path
import joblib
import binascii
import base64

"""
Main pipeline
"""

# Definir la ruta absoluta o relativa al archivo del modelo
MODEL_PATH = Path(__file__).resolve().parent.parent / \
    "acoustic_logistic_regression.model"
model = joblib.load(MODEL_PATH)


# Inicializamos el router para este módulo específico
router = APIRouter()


class AudioRequest(BaseModel):
    call_id: str
    audio_base64: str
    sample_rate: int
    channels: int


@router.post("/detect")
async def process_audio(background_tasks: BackgroundTasks, request: AudioRequest):
    EXPECTED_SAMPLE_RATE = 8000
    EXPECTED_CHANNELS = 2

    if request.sample_rate != EXPECTED_SAMPLE_RATE:
        raise HTTPException(
            status_code=400,
            detail=f"Sample rate inválido. Se esperaba {EXPECTED_SAMPLE_RATE} Hz.",
        )

    if request.channels != EXPECTED_CHANNELS:
        raise HTTPException(
            status_code=400,
            detail=f"Número de canales inválido. Se esperaban {EXPECTED_CHANNELS}.",
        )

    try:
        # Decode Base64 -> WAV bytes
        try:
            wav_bytes = base64.b64decode(
                request.audio_base64,
                validate=True,
            )
        except (binascii.Error, ValueError) as e:
            raise HTTPException(
                status_code=400,
                detail=f"audio_base64 inválido: {str(e)}",
            )

        # Validate WAV
        validate_wav(
            wav_bytes,
            request.sample_rate,
            request.channels,
        )

        # Separate stereo channels
        caller_audio, agent_audio = extract_channels(
            wav_bytes, request.call_id)

        # Detect conversation turns
        turns_result = detect_turns(
            caller_audio,
            agent_audio,
        )

        # Keep only caller/channel 0 segments
        channel_0_segments = [
            (t["start"], t["end"])
            for t in turns_result["turns"]
            if t["channel"] == 0
        ]

        # Concatenate caller segments
        processed_audio = extract_segments_from_turns(
            caller_audio,
            EXPECTED_SAMPLE_RATE,
            channel_0_segments,
        )

        conn = snowflake_connection(request.call_id)

        # Extract features
        X_input = extract_features_from_numpy(
            processed_audio,
            sr=EXPECTED_SAMPLE_RATE,
        )

        # Model prediction
        prediction = int(model.predict(X_input)[0])
        synthetic_probability = float(
            model.predict_proba(X_input)[0][1]
        )

        background_tasks.add_task(
            db.log_call_telemetry,
            filename=request.call_id,
            probability=synthetic_probability,
            status=str(prediction),
            segments_count=len(channel_0_segments)
        )

        return {
            "is_synthetic": prediction == 1,
            "confidence": round(synthetic_probability, 2),
        }

    except HTTPException:
        raise

    except ValueError as ve:
        raise HTTPException(
            status_code=400,
            detail=str(ve),
        )

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail=f"Error interno procesando el audio: {str(e)}",
        )
