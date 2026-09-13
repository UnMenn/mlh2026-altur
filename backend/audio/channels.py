import io
import wave

import numpy as np


def extract_channels(wav_bytes: bytes) -> tuple[np.ndarray, np.ndarray]:

    try:
        with wave.open(io.BytesIO(wav_bytes), "rb") as wav:
            channels = wav.getnchannels()
            sample_width = wav.getsampwidth()
            frames = wav.readframes(wav.getnframes())

    except (wave.Error, EOFError):
        raise ValueError("Invalid WAV file")

    if channels != 2:
        raise ValueError("Expected stereo audio")

    if sample_width != 2:
        raise ValueError(
            "Only 16-bit PCM WAV audio is currently supported"
        )

    # 16-bit PCM → NumPy int16
    samples = np.frombuffer(frames, dtype=np.int16)

    # WAV stereo samples are interleaved:
    stereo = samples.reshape(-1, 2)

    caller_audio = stereo[:, 0]
    agent_audio = stereo[:, 1]

    return caller_audio, agent_audio

