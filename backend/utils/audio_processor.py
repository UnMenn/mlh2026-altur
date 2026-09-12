import numpy as np
import pandas as pd
import librosa
from backend.utils.acoustic_features import extract_features

def extract_segments_from_turns(y: np.ndarray, sr: int, segments: list[tuple[float, float]]) -> np.ndarray:
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

def extract_features_from_numpy(y: np.ndarray, sr: int) -> pd.DataFrame:
    if y.dtype == np.int16:
        y = y.astype(np.float32) / 32768.0
    elif not np.issubdtype(y.dtype, np.floating):
        y = y.astype(np.float32)

    TARGET_TRAIN_SR = 16000
    if sr != TARGET_TRAIN_SR:
        y = librosa.resample(y, orig_sr=sr, target_sr=TARGET_TRAIN_SR)
        sr = TARGET_TRAIN_SR

    features = extract_features(y, sr)
    if not features:
        raise RuntimeError("No se pudieron extraer características acústicas.")
        
    df = pd.DataFrame([features])
    
    # Asegurar que 'voice_duration_s' se excluya si el modelo no fue entrenado con ella
    metadata_columns = {
        "anon_id", "label", "split", "channel", 
        "num_segments", "total_segment_duration_s", "voice_duration_s"
    }
    feature_columns = [col for col in df.columns if col not in metadata_columns]
    
    return df[feature_columns]