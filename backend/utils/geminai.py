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


def contact_gemini(full_text, channel0_text, channel1_text):

    user_prompt = f"""Analyze the following call channels to determine if the user is Human or Synthetic AI:

            [FULL TRANSCRIPT]
            {full_text}

            [CHANNEL 0 - USER]
            {channel0_text}

            [CHANNEL 1 - AGENT]
            {channel1_text}"""

    return generate_response(user_prompt, instructions=SYSTEM_INSTRUCTIONS)
