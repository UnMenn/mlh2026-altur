import argparse
import os
from pathlib import Path

import soundfile as sf
from dotenv import load_dotenv


def separate_channels(input_folder: Path, output_folder: Path) -> int:
    """Save both channels from every stereo WAV file as separate mono files."""
    audio_files = sorted(input_folder.glob("*.wav"))

    if not audio_files:
        raise FileNotFoundError(f"No WAV files found in {input_folder}")

    channel_folders = [
        output_folder / "channel0_audio",
        output_folder / "channel1_audio",
    ]
    for channel_folder in channel_folders:
        channel_folder.mkdir(parents=True, exist_ok=True)

    for input_path in audio_files:
        audio, sample_rate = sf.read(input_path, always_2d=True)
        if audio.shape[1] < 2:
            raise ValueError(
                f"{input_path.name} has {audio.shape[1]} channel(s); "
                "two channels are required."
            )

        for channel, channel_folder in enumerate(channel_folders):
            output_path = channel_folder / input_path.name
            sf.write(output_path, audio[:, channel], sample_rate)

    return len(audio_files)


def main() -> None:
    load_dotenv()
    data_dir = Path(os.getenv("DATA_DIR", "data"))

    parser = argparse.ArgumentParser(
        description="Extract both channels from each WAV file into separate folders."
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=data_dir / "audio",
        dest="input_folder",
        help="Folder containing source WAV files.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=data_dir,
        dest="output_folder",
        help="Parent folder for channel0_audio and channel1_audio.",
    )
    args = parser.parse_args()

    count = separate_channels(args.input_folder, args.output_folder)
    print(
        f"Wrote {count} file(s) to "
        f"{args.output_folder / 'channel0_audio'} and "
        f"{args.output_folder / 'channel1_audio'}"
    )


if __name__ == "__main__":
    main()
