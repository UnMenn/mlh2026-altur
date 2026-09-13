import librosa
import whisper

print("Loading Whisper...")
model = whisper.load_model("base")


def transcribe_mono_audio(file_path):
    """
    Load an audio file, convert it to mono, and return its transcription.
    """
    try:
        # Load the audio and combine channels into mono automatically.
        data, sr = librosa.load(file_path, sr=16000, mono=True)

        # Transcribe and extract the text.
        text = model.transcribe(data, language="es")["text"]
        return text

    except Exception as e:
        print(f"Error processing file: {e}")
        return None
