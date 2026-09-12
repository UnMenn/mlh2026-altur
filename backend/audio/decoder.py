import base64
import binascii


def decode_base64_wav(audio: str) -> bytes:
    if not audio:
        raise ValueError("Audio payload is empty")

    # Support data URI format
    if audio.startswith("data:"):
        try:
            _, audio = audio.split(",", 1)
        except ValueError:
            raise ValueError("Invalid audio data URI")

    try:
        return base64.b64decode(audio, validate=True)
    except (binascii.Error, ValueError):
        raise ValueError("Audio is not valid Base64")

