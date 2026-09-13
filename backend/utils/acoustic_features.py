from pathlib import Path
import json
import warnings

import librosa
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")


# ============================================================
# CONFIGURATION
# ============================================================

AUDIO_DIR = Path("audio")
TURNS_DIR = Path("turns")
MANIFEST_PATH = Path("manifest.csv")
OUTPUT_PATH = Path("acoustic_features.csv")

TARGET_CHANNEL = 0

SAMPLE_RATE = 16000

N_MFCC = 13
N_FFT = 2048
HOP_LENGTH = 512


# ============================================================
# UTILS
# ============================================================

def safe_statistic(values):
    """Return mean, std, min, max and range for an array."""
    values = np.asarray(values, dtype=np.float64)
    values = values[np.isfinite(values)]

    if len(values) == 0:
        return {
            "mean": np.nan,
            "std": np.nan,
            "min": np.nan,
            "max": np.nan,
            "range": np.nan,
        }

    return {
        "mean": float(np.mean(values)),
        "std": float(np.std(values)),
        "min": float(np.min(values)),
        "max": float(np.max(values)),
        "range": float(np.max(values) - np.min(values)),
    }


def percentile_features(values, prefix):
    """Calculate percentile-based features."""
    values = np.asarray(values, dtype=np.float64)
    values = values[np.isfinite(values)]

    if len(values) == 0:
        return {
            f"{prefix}_p25": np.nan,
            f"{prefix}_median": np.nan,
            f"{prefix}_p75": np.nan,
        }

    return {
        f"{prefix}_p25": float(np.percentile(values, 25)),
        f"{prefix}_median": float(np.percentile(values, 50)),
        f"{prefix}_p75": float(np.percentile(values, 75)),
    }


def load_channel_segments(json_path, channel=0):
    """Load start/end intervals for the requested channel."""
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    segments = []

    for turn in data.get("turns", []):
        if turn.get("channel") != channel:
            continue

        start = float(turn["start"])
        end = float(turn["end"])

        if end > start:
            segments.append((start, end))

    return segments


def extract_segments(y, sr, segments):
    """Extract and concatenate the requested time intervals."""
    chunks = []

    for start, end in segments:
        start_sample = max(0, int(start * sr))
        end_sample = min(len(y), int(end * sr))

        if end_sample <= start_sample:
            continue

        chunks.append(y[start_sample:end_sample])

    if not chunks:
        return np.array([], dtype=np.float32)

    return np.concatenate(chunks)


# ============================================================
# ACOUSTIC FEATURES
# ============================================================

def extract_features(y, sr):
    """Extract acoustic features from channel 0."""

    features = {}

    if len(y) == 0:
        return features

    # --------------------------------------------------------
    # Basic audio statistics
    # --------------------------------------------------------

    duration = len(y) / sr

    rms = librosa.feature.rms(
        y=y,
        frame_length=N_FFT,
        hop_length=HOP_LENGTH,
    )[0]

    features["voice_duration_s"] = float(duration)
    features["rms_mean"] = float(np.mean(rms))
    features["rms_std"] = float(np.std(rms))

    rms_percentiles = percentile_features(rms, "rms")
    features.update(rms_percentiles)

    # --------------------------------------------------------
    # Fundamental frequency (F0)
    # --------------------------------------------------------

    f0, voiced_flag, voiced_probs = librosa.pyin(
        y,
        fmin=librosa.note_to_hz("C2"),
        fmax=librosa.note_to_hz("C7"),
        sr=sr,
        frame_length=N_FFT,
        hop_length=HOP_LENGTH,
    )

    f0_voiced = f0[np.isfinite(f0)]

    f0_stats = safe_statistic(f0_voiced)

    features["f0_mean"] = f0_stats["mean"]
    features["f0_std"] = f0_stats["std"]
    features["f0_min"] = f0_stats["min"]
    features["f0_max"] = f0_stats["max"]
    features["f0_range"] = f0_stats["range"]

    f0_percentiles = percentile_features(f0_voiced, "f0")
    features.update(f0_percentiles)

    if len(f0) > 0:
        features["voiced_ratio"] = float(
            np.mean(np.isfinite(f0))
        )
    else:
        features["voiced_ratio"] = np.nan

    # --------------------------------------------------------
    # Spectral features
    # --------------------------------------------------------

    spectral_centroid = librosa.feature.spectral_centroid(
        y=y,
        sr=sr,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
    )[0]

    spectral_bandwidth = librosa.feature.spectral_bandwidth(
        y=y,
        sr=sr,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
    )[0]

    spectral_rolloff = librosa.feature.spectral_rolloff(
        y=y,
        sr=sr,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
    )[0]

    spectral_flatness = librosa.feature.spectral_flatness(
        y=y,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
    )[0]

    spectral_features = {
        "spectral_centroid": spectral_centroid,
        "spectral_bandwidth": spectral_bandwidth,
        "spectral_rolloff": spectral_rolloff,
        "spectral_flatness": spectral_flatness,
    }

    for name, values in spectral_features.items():
        stats = safe_statistic(values)

        features[f"{name}_mean"] = stats["mean"]
        features[f"{name}_std"] = stats["std"]
        features[f"{name}_min"] = stats["min"]
        features[f"{name}_max"] = stats["max"]

    # --------------------------------------------------------
    # Spectral contrast
    # --------------------------------------------------------

    nyquist = sr / 2.0
    # Reducir el número de bandas si el sample rate es bajo (ej. 8000 Hz) para no exceder Nyquist
    n_bands = 3 if sr <= 8000 else 6
    fmin = min(100.0, nyquist / 4.0)

    try:
        spectral_contrast = librosa.feature.spectral_contrast(
        y=y,
        sr=sr,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
    )
    except Exception:
        # Fallback seguro si las bandas superan el límite del buffer pequeño
        spectral_contrast = librosa.feature.spectral_contrast(
        y=y,
        sr=sr,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
    )

    for i in range(spectral_contrast.shape[0]):
        stats = safe_statistic(spectral_contrast[i])

        features[f"spectral_contrast_{i + 1}_mean"] = stats["mean"]
        features[f"spectral_contrast_{i + 1}_std"] = stats["std"]

    # --------------------------------------------------------
    # MFCC
    # --------------------------------------------------------

    mfcc = librosa.feature.mfcc(
        y=y,
        sr=sr,
        n_mfcc=N_MFCC,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
    )

    for i in range(N_MFCC):
        stats = safe_statistic(mfcc[i])

        features[f"mfcc_{i + 1}_mean"] = stats["mean"]
        features[f"mfcc_{i + 1}_std"] = stats["std"]

    # --------------------------------------------------------
    # Zero crossing rate
    # --------------------------------------------------------

    zero_crossing_rate = librosa.feature.zero_crossing_rate(
        y,
        frame_length=N_FFT,
        hop_length=HOP_LENGTH,
    )[0]

    features["zero_crossing_rate_mean"] = float(
        np.mean(zero_crossing_rate)
    )

    features["zero_crossing_rate_std"] = float(
        np.std(zero_crossing_rate)
    )

    # --------------------------------------------------------
    # Spectral flux
    # --------------------------------------------------------

    spectral_flux = librosa.onset.onset_strength(
        y=y,
        sr=sr,
        hop_length=HOP_LENGTH,
    )

    flux_stats = safe_statistic(spectral_flux)

    features["spectral_flux_mean"] = flux_stats["mean"]
    features["spectral_flux_std"] = flux_stats["std"]

    # --------------------------------------------------------
    # Chroma
    # --------------------------------------------------------

    chroma = librosa.feature.chroma_stft(
        y=y,
        sr=sr,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
    )

    for i in range(chroma.shape[0]):
        features[f"chroma_{i + 1}_mean"] = float(
            np.mean(chroma[i])
        )

        features[f"chroma_{i + 1}_std"] = float(
            np.std(chroma[i])
        )

    return features


# ============================================================
# PER-CALL PROCESSING
# ============================================================

def process_call(anon_id, label, split):
    """Process one complete call."""

    audio_path = AUDIO_DIR / f"{anon_id}.wav"
    json_path = TURNS_DIR / f"{anon_id}.json"

    if not audio_path.exists():
        print(f"[WARNING] Audio not found: {audio_path}")
        return None

    if not json_path.exists():
        print(f"[WARNING] JSON not found: {json_path}")
        return None

    try:
        segments = load_channel_segments(
            json_path,
            channel=TARGET_CHANNEL,
        )

        if not segments:
            print(
                f"[WARNING] No channel {TARGET_CHANNEL}: {anon_id}"
            )
            return None

        y, sr = librosa.load(
            audio_path,
            sr=SAMPLE_RATE,
            mono=True,
        )

        channel_audio = extract_segments(
            y,
            sr,
            segments,
        )

        if len(channel_audio) == 0:
            print(
                f"[WARNING] Empty channel {TARGET_CHANNEL}: {anon_id}"
            )
            return None

        features = extract_features(
            channel_audio,
            sr,
        )

        # ----------------------------------------------------
        # Metadata
        # ----------------------------------------------------

        features = {
            "anon_id": anon_id,
            "label": label,
            "split": split,
            "channel": TARGET_CHANNEL,
            "num_segments": len(segments),
            "total_segment_duration_s": sum(
                end - start
                for start, end in segments
            ),
            **features,
        }

        return features

    except Exception as e:
        print(f"[ERROR] {anon_id}: {e}")
        return None


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 80)
    print("ACOUSTIC FEATURE EXTRACTION")
    print("=" * 80)

    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(
            f"Manifest not found: {MANIFEST_PATH}"
        )

    manifest = pd.read_csv(MANIFEST_PATH)

    required_columns = {
        "anon_id",
        "label",
        "split",
    }

    missing_columns = required_columns - set(manifest.columns)

    if missing_columns:
        raise ValueError(
            f"Missing columns in manifest: {missing_columns}"
        )

    print(f"Manifest rows: {len(manifest)}")
    print(f"Audio directory: {AUDIO_DIR}")
    print(f"Turns directory: {TURNS_DIR}")
    print(f"Target channel: {TARGET_CHANNEL}")
    print()

    results = []

    for i, row in manifest.iterrows():

        anon_id = str(row["anon_id"]).strip()
        label = str(row["label"]).strip().lower()
        split = str(row["split"]).strip().lower()

        print(
            f"[{i + 1}/{len(manifest)}] "
            f"{anon_id} | {label} | {split}"
        )

        result = process_call(
            anon_id=anon_id,
            label=label,
            split=split,
        )

        if result is not None:
            results.append(result)

    if not results:
        raise RuntimeError(
            "No acoustic features were generated."
        )

    df = pd.DataFrame(results)

    # --------------------------------------------------------
    # Reorder metadata columns
    # --------------------------------------------------------

    metadata_columns = [
        "anon_id",
        "label",
        "split",
        "channel",
        "num_segments",
        "total_segment_duration_s",
        "voice_duration_s",
    ]

    feature_columns = [
        column
        for column in df.columns
        if column not in metadata_columns
    ]

    df = df[
        metadata_columns + feature_columns
    ]

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    df.to_csv(
        OUTPUT_PATH,
        index=False,
    )

    print()
    print("=" * 80)
    print("DONE")
    print("=" * 80)

    print(f"Processed calls: {len(df)}")
    print(f"Output: {OUTPUT_PATH}")
    print(f"Features: {len(df.columns)}")
    print()

    print("Label distribution:")
    print(df["label"].value_counts())

    print()
    print("Split distribution:")
    print(df["split"].value_counts())


if __name__ == "__main__":
    main()