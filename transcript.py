import os
import glob
import pandas as pd
from dotenv import load_dotenv
from transformers import pipeline
import soundfile as sf
import librosa
from transformers import logging

logging.set_verbosity_error()

# 1. Configure data directories
load_dotenv()
DATA_DIR = os.getenv("DATA_DIR")
AUDIO_FOLDER = os.path.join(DATA_DIR, "audio")
OUTPUT_CSV = os.path.join(DATA_DIR, "transcripts.csv")

if not AUDIO_FOLDER:
    raise ValueError(
        "Audio file was not found. Please set the 'audio' variable in the .env file.")


# 2. Load the Whisper model for automatic speech recognition
print("Loading the Whisper model (openai/whisper-tiny)...")
transcriber = pipeline("automatic-speech-recognition",
                       model="openai/whisper-tiny")

# 3. Search for all audio files (.wav)
# Search in lowercase and uppercase to avoid extension errors
audio_files = []
for ext in ("*.wav"):
    audio_files.extend(glob.glob(os.path.join(AUDIO_FOLDER, ext)))

if not audio_files:
    print(
        f"No audio files found in the folder: {AUDIO_FOLDER}")
    exit()

print(f"Found {len(audio_files)} audio files to process.")
results = []

# 4. Loop to transcribe each file
for i, file_path in enumerate(audio_files, start=1):
    file_name = os.path.basename(file_path)
    print(
        f" [{i}/{len(audio_files)}] -> Transcribing (Both Channels): {file_name}...")

    try:
        # 1. Load the audio
        data, samplerate = librosa.load(file_path, sr=16000, mono=False)

        # Check whether the file actually has 2 channels
        if len(data.shape) > 1 and data.shape[0] >= 2:
            # Separate the channels
            canal_0 = data[0, :]
            canal_1 = data[1, :]

            # Transcribe Channel 0 (supports long audio > 30s)
            print(f"    [Channel 0] Processing...")
            output_0 = transcriber(
                {"raw": canal_0, "sampling_rate": samplerate},
                chunk_length_s=30,
                return_timestamps=True,
                generate_kwargs={"language": "spanish"}
            )
            text_canal_0 = output_0["text"]

            # Transcribe Channel 1 (supports long audio > 30s)
            print(f"    [Channel 1] Processing...")
            output_1 = transcriber(
                {"raw": canal_1, "sampling_rate": samplerate},
                chunk_length_s=30,
                return_timestamps=True,
                generate_kwargs={"language": "spanish"}
            )
            text_canal_1 = output_1["text"]
        else:
            # If the audio is mono for any reason, transcribe it normally
            print(f"Mono audio detected. Copying text to both channels.")
            output_mono = transcriber(
                {"raw": data, "sampling_rate": samplerate},
                chunk_length_s=30,
                return_timestamps=True,
                generate_kwargs={"language": "spanish"}
            )
            text_canal_0 = output_mono["text"]
            text_canal_1 = output_mono["text"]

        # 2. Crear un DataFrame temporal con la fila actual
        row_df = pd.DataFrame([{
            "FILE_NAME": file_name,
            "TEXT_CANAL_0": text_canal_0,
            "TEXT_CANAL_1": text_canal_1
        }])

        # 3. Guardar inmediatamente en el CSV en modo Append ('a')
        # Si es el primer archivo (i == 1) escribe los encabezados, si no, los ignora
        header_needed = not os.path.exists(OUTPUT_CSV)
        row_df.to_csv(OUTPUT_CSV, mode='a', index=False,
                      header=header_needed, encoding='utf-8')
        print(f"    ✅ Saved to CSV.")

    except Exception as e:
        print(f"Error processing {file_name}: {e}")


print(
    f"\nAll available processes completed successfully! File updated at: '{OUTPUT_CSV}'")
