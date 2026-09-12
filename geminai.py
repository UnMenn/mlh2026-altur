import csv
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load variables from .env file into os.environ
load_dotenv()

# Client automatically reads os.getenv("GEMINI_API_KEY")
client = genai.Client()

SYSTEM_INSTRUCTIONS = """You are an expert NLP auditor analyzing call transcripts to classify whether the USER (Channel 0) is a HUMAN or a SYNTHETIC AI voice.

Evaluation Criteria:
1. Synthetic/AI Indicators:
   - High repetition of phrases or robotic, unnatural verbatim looping.
   - Overuse of template/stiff vocabulary (e.g., heavy reliance on "referencia", "claro", "marina", "cuenta").
   - Rigid or overly formal turn-taking despite customer frustration or interruptions.

2. Human Indicators:
   - Natural conversational flow, informal filler words, spontaneous phrasing (e.g., "quiero", "cargo", "hace", "verde", "pues").
   - Dynamic emotional tone, slight disfluencies, or direct issue reporting.

Output Format Requirements:
- State clearly at the top:
  * Classification: [HUMAN] or [SYNTHETIC AI]
  * Confidence: [High / Medium / Low]
- Provide a brief justification listing specific flags or patterns detected in the conversation (especially repetitive phrasing or vocabulary usage)."""


def generate_response(messages, instructions=None):
    """Generate a response using Gemini."""
    response = client.models.generate_content(
        model="gemini-3.6-flash",  # Updated to valid model
        contents=messages,
        config=types.GenerateContentConfig(
            system_instruction=instructions,
            temperature=0.7,
        ),
    )  # Removed trailing comma
    return response.text


if __name__ == "__main__":

    TRANSCRIPT_DIR = r"C:\Users\calvo\dev\mlh2026-altur\data\SF_transcripts.csv"

    # Define the explicit headers matching your CSV schema
    FIELDNAMES = [
        "FILE_NAME",
        "TRANSCRIPT_JSON",
        "FULL_TEXT",
        "CHANNEL0_TEXT",
        "CHANNEL1_TEXT",
        "TRANSCRIBED_AT",
    ]

    with open(TRANSCRIPT_DIR, "r", encoding="utf-8-sig", newline="") as f:
        # Pass fieldnames explicitly so line 1 is treated as data, not header
        reader = csv.DictReader(f, fieldnames=FIELDNAMES)
        rows = list(reader)

    # Access columns directly
    # test specific file
    file_name_to_test = "call_5a7a7e3c9588.wav"
    row = next((r for r in rows if r.get(
        "FILE_NAME") == file_name_to_test), None)
    if row:
        print("FILE:", row.get("FILE_NAME"))
        print("FULL TEXT:", row.get("FULL_TEXT"))
        print("\n")
        print("CHANNEL 0:", row.get("CHANNEL0_TEXT"))
        print("\n")
        print("CHANNEL 1:", row.get("CHANNEL1_TEXT"))
        print("\n")

        user_prompt = f"""Analyze the following call channels to determine if the user is Human or Synthetic AI:

            [FULL TRANSCRIPT]
            {row.get('FULL_TEXT')}

            [CHANNEL 0 - USER]
            {row.get('CHANNEL0_TEXT')}

            [CHANNEL 1 - AGENT]
            {row.get('CHANNEL1_TEXT')}"""

        print(generate_response(user_prompt, instructions=SYSTEM_INSTRUCTIONS))

        # Example: use a specific transcript column as input to Gemini
        print("-" * 40)
