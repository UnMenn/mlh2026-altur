from __future__ import annotations

import numpy as np
import torch
from silero_vad import load_silero_vad, get_speech_timestamps


SAMPLE_RATE = 8000

VAD_THRESHOLD = 0.5
MIN_SPEECH_MS = 150
MIN_SILENCE_MS = 300
SPEECH_PAD_MS = 50

# Post-processing:
#
# If the same speaker has a short gap, we can merge the two
# speech regions when the other speaker is not talking.
#
# This is intentionally smaller than MIN_SILENCE_MS because
# Silero has already decided where speech regions end.
MERGE_GAP_MS = 300

_vad_model = load_silero_vad()


def detect_turns(
    caller_audio: np.ndarray,
    agent_audio: np.ndarray,
) -> dict:
    """
    Detect conversational turns from stereo audio.

    Channel 0 = caller / left
    Channel 1 = agent / right

    The two channels are processed independently with Silero VAD.
    The resulting speech regions are then post-processed together
    using activity on the opposite channel.

    Returns:

        {
            "turns": [
                {
                    "channel": 1,
                    "start": 0.30,
                    "end": 7.66,
                },
                ...
            ]
        }
    """

    caller_turns = _detect_channel(
        caller_audio,
        channel=0,
    )

    agent_turns = _detect_channel(
        agent_audio,
        channel=1,
    )

    turns = caller_turns + agent_turns

    turns.sort(key=lambda turn: turn["start"])

    turns = _post_process_turns(turns)

    return {
        "turns": turns,
    }


def _detect_channel(
    audio: np.ndarray,
    channel: int,
) -> list[dict]:
    """
    Detect speech regions for one isolated channel.
    """

    audio = _prepare_audio(audio)

    if audio.size == 0:
        return []

    speech_timestamps = get_speech_timestamps(
        torch.from_numpy(audio),
        _vad_model,
        sampling_rate=SAMPLE_RATE,
        threshold=VAD_THRESHOLD,
        min_speech_duration_ms=MIN_SPEECH_MS,
        min_silence_duration_ms=MIN_SILENCE_MS,
        speech_pad_ms=SPEECH_PAD_MS,
        return_seconds=False,
    )

    turns = []

    for segment in speech_timestamps:
        start = segment["start"] / SAMPLE_RATE
        end = segment["end"] / SAMPLE_RATE

        turns.append(
            {
                "channel": channel,
                "start": round(start, 2),
                "end": round(end, 2),
            }
        )

    return turns


def _post_process_turns(
    turns: list[dict],
) -> list[dict]:
    """
    Post-process independently detected channel segments.

    The important rule is:

        Same speaker + short gap + other speaker silent
            -> merge

    But:

        Same speaker + short gap + other speaker active
            -> keep separate

    This uses the stereo nature of the recording to avoid blindly
    merging conversational turns.
    """

    if not turns:
        return []

    # Work on each channel independently.
    channel_0 = [
        turn for turn in turns
        if turn["channel"] == 0
    ]

    channel_1 = [
        turn for turn in turns
        if turn["channel"] == 1
    ]

    channel_0 = _merge_channel_turns(
        channel_0,
        channel_1,
    )

    channel_1 = _merge_channel_turns(
        channel_1,
        channel_0,
    )

    result = channel_0 + channel_1

    result.sort(key=lambda turn: turn["start"])

    return result


def _merge_channel_turns(turns: list[dict], other_channel_turns: list[dict]) -> list[dict]:
    if len(turns) <= 1:
        return turns

    merged = [dict(turns[0])]

    for current in turns[1:]:
        previous = merged[-1]

        gap = current["start"] - previous["end"]

        if gap < 0:
            # Overlap. Do not merge based on gap.
            merged.append(dict(current))
            continue

        gap_ms = gap * 1000

        if (
            gap_ms <= MERGE_GAP_MS
            and not _other_channel_active(
                start=previous["end"],
                end=current["start"],
                turns=other_channel_turns,
            )
        ):
            # Same speaker continued after a short pause.
            previous["end"] = current["end"]
        else:
            merged.append(dict(current))

    return merged


def _other_channel_active(start: float, end: float, turns: list[dict],) -> bool:
    """
    Return True if the opposite channel has speech overlapping
    the specified interval.
    """

    if end <= start:
        return False

    for turn in turns:

        if (
            turn["start"] < end
            and turn["end"] > start
        ):
            return True

    return False


def _prepare_audio(audio: np.ndarray) -> np.ndarray:
    """
    Convert audio to float32 mono samples in [-1, 1].
    """

    audio = np.asarray(audio)

    if audio.ndim != 1:
        raise ValueError(
            f"Expected mono 1-D audio, got shape {audio.shape}"
        )

    if audio.dtype == np.int16:
        return audio.astype(np.float32) / 32768.0

    if np.issubdtype(audio.dtype, np.floating):
        return np.clip(
            audio.astype(np.float32),
            -1.0,
            1.0,
        )

    raise ValueError(
        f"Unsupported audio dtype: {audio.dtype}"
    )

