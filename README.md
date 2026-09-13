# SONDA

> SONDA analyzes call audio to estimate whether a voice is likely human or synthetic, while also using conversation context to identify signals that may require additional attention.

## Inspiration

For a long time, hearing someone's voice has been a way to recognize and trust who is behind a call. However, with the rise of AI-generated and cloned voices, hearing a voice that sounds human is no longer always enough.

This led us to ask one question:

**What if we used artificial intelligence to solve a problem created by artificial intelligence?**

A person can listen to a call and think it sounds completely real, but an AI system can analyze acoustic and conversational signals that are difficult for us to perceive.

After **36 hours of work during the hackathon**, that question became **SONDA**.

Our goal is to help Altur add an extra layer of security and trust to every call.

---

## What it does

**SONDA analyzes call audio to detect whether a voice is likely human or shows signs of being synthetic.**

Users can upload one or multiple audio files to the platform. SONDA processes each call individually and provides a result including:

- Human vs. synthetic voice prediction
- Probability that the voice is synthetic
- Audio-analysis signals
- Conversation/transcription analysis
- Flags for context or conversational inconsistencies

We wanted the result to be more than just a technical number. Our goal was to present the information in a simple and understandable way, helping users quickly identify calls that may require additional attention.

To develop our solution, we worked with the **300 calls provided by Altur**, using artificial intelligence to identify signals that may be difficult to detect with the human ear alone.

SONDA is not meant to be just another AI voice detector. We want it to become an additional layer of trust for companies that rely on voice interactions.

---

## How we built it

We divided SONDA into two complementary parts:

1. **Audio analysis**
2. **Conversation and context analysis**

### 1. Audio analysis

The call audio is processed as a signal rather than simply being evaluated by how it sounds to a person.

Our pipeline can separate the available audio channels and analyze the speakers independently. This allows us to preserve information about each side of the conversation instead of treating the recording as a single undifferentiated audio stream.

The analysis considers characteristics such as:

- **Spectral characteristics** — how energy is distributed across frequencies
- **Temporal characteristics** — changes in the signal over time
- **Voice dynamics** — variation in speech and vocal behavior
- **Prosodic patterns** — rhythm, timing and other speech characteristics
- **Channel-level behavior** — differences between the speakers/channels
- **Turn-taking patterns** — how speakers alternate during the conversation
- **Audio consistency** — signals that may indicate synthetic or manipulated speech

The objective is not to rely on a single characteristic. Instead, SONDA combines multiple signals to estimate whether the voice presents characteristics associated with synthetic speech.

### 2. Transcription and conversation analysis

Acoustic analysis alone does not tell the whole story.

We also transcribe the audio and send the resulting conversation to **Gemini** with instructions to evaluate the context of the interaction.

Gemini is used as an additional analysis layer to determine whether:

- The conversation makes contextual sense
- The interaction contains inconsistencies
- There are suspicious or unusual conversational patterns
- There are other flags that deserve attention

This gives SONDA two complementary perspectives:

**What does the audio sound like?**
→ Acoustic analysis

**Does the conversation make sense in context?**
→ Transcription + Gemini analysis

Together, these signals provide a more complete view of the call.

---
## Installation

### Bash (Mac / Linux)

1. Create the virtual environment:
```bash
python3 -m venv env
```

2. Activate the environment:
```bash
source env/bin/activate
```

3. Install the dependencies:
```bash
pip install -r requirements.txt
```

### Windows

1. Create the virtual environment:
```bash
python -m venv env
```

2. Activate the environment:
```bash
.\env\Scripts\activate
```

3. Install the dependencies:
```bash
pip install -r requirements.txt

```

### Frontend

In frontend/src

```bash
npm i
```

---
## How to run

1. On root directory

```bash
uvicorn backend.app:app --reload
```

  1.1. On Data Directory
  ```bash
  python scripts/check_endpoint.py --url http://localhost:8000/detect --split val --n 20
  ```
2. In frontend/src
```bash
  npm run dev
  ```

---

## Architecture

```text
                         ┌─────────────────────┐
                         │      User / UI      │
                         │  React + TypeScript │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       FastAPI       │
                         │        Backend      │
                         └──────────┬──────────┘
                                    │
                       ┌────────────┴────────────┐
                       │                         │
                       ▼                         ▼
              ┌─────────────────┐      ┌─────────────────┐
              │  Audio Pipeline │      │   Transcription │
              │                 │      │                 │
              │ • Validation    │      │ • Channel 0     │
              │ • Channels      │      │ • Channel 1     │
              │ • Turn detection│      │ • Full text     │
              │ • Audio signals │      └────────┬────────┘
              └────────┬────────┘               │
                       │                        ▼
                       │               ┌─────────────────┐
                       │               │      Gemini     │
                       │               │ Context / Flags │
                       │               └────────┬────────┘
                       │                        │
                       └────────────┬───────────┘
                                    ▼
                         ┌─────────────────────┐
                         │  Prediction + Flags │
                         │                     │
                         │ • Synthetic score   │
                         │ • Analysis status   │
                         │ • Context flags     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       Results       │
                         │     in the UI       │
                         └─────────────────────┘

```
---
## Developers

- Ricardo Calvo
- Salvador Vaquero
- Esmeralda Ramos
- Ambar Sánchez