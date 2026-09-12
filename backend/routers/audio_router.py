from fastapi import APIRouter, File, HTTPException, UploadFile
from backend.utils.audio_processor import extract_segments_from_turns, extract_features_from_numpy
from pathlib import Path
import joblib

# Definir la ruta absoluta o relativa al archivo del modelo
MODEL_PATH = Path(__file__).resolve().parent.parent / "acoustic_logistic_regression.model"
model = joblib.load(MODEL_PATH)

from backend.audio.decoder import decode_base64_wav
from backend.audio.validation import validate_wav
from backend.audio.channels import extract_channels
from backend.audio.turns import detect_turns

# Inicializamos el router para este módulo específico
router = APIRouter()

@router.post("/process")
async def process_audio(file: UploadFile = File(...)):
    if not file.filename.endswith(".wav"):
        raise HTTPException(
            status_code=400, detail="Formato inválido. Se requiere un archivo .wav"
        )

    try:
        print(f"Procesando archivo: {file.filename}")
        # 1. Leer y decodificar el payload base64 / bytes
        wav_bytes = await file.read()
        print(f"Archivo WAV recibido: {file.filename}, tamaño: {len(wav_bytes)} bytes")
        #wav_bytes = decode_base64_wav(raw_data)
        
        # 2. Validar formato (8 kHz, estéreo)
        EXPECTED_SAMPLE_RATE = 8000
        EXPECTED_CHANNELS = 2
        
        # 3. Separar canales estéreo (Canal 0 = caller, Canal 1 = agent)
        validate_wav(wav_bytes, EXPECTED_SAMPLE_RATE, EXPECTED_CHANNELS)
        print("Archivo WAV validado correctamente.")
        caller_audio, agent_audio = extract_channels(wav_bytes)
        
        # 4. Detectar turnos usando Silero VAD
        print("Detectando turnos de conversación...", flush=True)
        turns_result = detect_turns(caller_audio, agent_audio)
        print(f"Turnos detectados: {len(turns_result.get('turns', []))}", flush=True)
        
        # 5. Filtrar y extraer únicamente los segmentos del canal 0 (caller)
        channel_0_segments = [
            (t["start"], t["end"]) 
            for t in turns_result["turns"] 
            if t["channel"] == 0
        ]
        
        print(f"Segmentos detectados en el canal 0: {channel_0_segments}")
        # Concatenar las porciones de audio correspondientes al canal 0
        processed_audio = extract_segments_from_turns(caller_audio, EXPECTED_SAMPLE_RATE, channel_0_segments)
        

        X_input = extract_features_from_numpy(processed_audio, sr=EXPECTED_SAMPLE_RATE)

        prediction = int(model.predict(X_input)[0])
        probability = float(model.predict_proba(X_input)[0][1])

        fraud_risk_score = probability

        return {
            "filename": file.filename,
            "prediction": "synthetic" if prediction == 1 else "human",
            "synthetic_probability": fraud_risk_score,
            "channel_status": (
                "suspicious" if fraud_risk_score > 0.5 else "normal"
            ),
        }

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error interno procesando el audio: {str(e)}"
        )
      