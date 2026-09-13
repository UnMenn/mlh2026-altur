import io
import wave

from pathlib import Path
import numpy as np


def extract_channels(wav_bytes: bytes, call_id: str) -> tuple[np.ndarray, np.ndarray]:

    project_root = Path(__file__).resolve().parents[2]
    output_dir = project_root / "data" / "input"
    output_dir.mkdir(parents=True, exist_ok=True)

    stereo_path = output_dir / f"{call_id}_stereo.wav"
    caller_path = output_dir / f"{call_id}_caller.wav"
    agent_path = output_dir / f"{call_id}_agent.wav"

    try:
        with wave.open(io.BytesIO(wav_bytes), "rb") as wav:
            channels = wav.getnchannels()
            sample_width = wav.getsampwidth()
            frames = wav.readframes(wav.getnframes())
            framerate = wav.getframerate()

    except (wave.Error, EOFError):
        raise ValueError("Invalid WAV file")

    if channels != 2:
        raise ValueError("Expected stereo audio")

    if sample_width != 2:
        raise ValueError(
            "Only 16-bit PCM WAV audio is currently supported"
        )

    # 1. Save the original full stereo file directly
    stereo_path.write_bytes(wav_bytes)

    samples = np.frombuffer(frames, dtype=np.int16)

    # WAV stereo samples are interleaved:
    stereo = samples.reshape(-1, 2)

    caller_audio = stereo[:, 0]
    agent_audio = stereo[:, 1]

    def write_mono_wav(path: Path, audio_data: np.ndarray):
        with wave.open(str(path), "wb") as wav_out:
            wav_out.setnchannels(1)  # Mono
            wav_out.setsampwidth(2)  # 16-bit
            wav_out.setframerate(framerate)
            wav_out.writeframes(audio_data.tobytes())

    write_mono_wav(caller_path, caller_audio)
    write_mono_wav(agent_path, agent_audio)

    print(f"Files saved in: {output_dir}")

    return caller_audio, agent_audio
