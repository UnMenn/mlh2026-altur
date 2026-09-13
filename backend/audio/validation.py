import io
import wave


def validate_wav(wav_bytes: bytes, EXPECTED_SAMPLE_RATE: int, EXPECTED_CHANNELS: int) -> None:
    if not wav_bytes:
        raise ValueError("Audio payload is empty")

    try:
        with wave.open(io.BytesIO(wav_bytes), "rb") as wav:
            channels = wav.getnchannels()
            sample_rate = wav.getframerate()

    except (wave.Error, EOFError):
        raise ValueError("Audio is not a valid WAV file")

    if sample_rate != EXPECTED_SAMPLE_RATE:
        raise ValueError(
            f"Audio must be 8 kHz, received {sample_rate} Hz"
        )

    if channels != EXPECTED_CHANNELS:
        raise ValueError(
            f"Audio must be stereo, received {channels} channels"
        )

