export interface AudioAnalysisResponse {
  filename: string;
  prediction: "synthetic" | "real";
  synthetic_probability: number;
  channel_status: "suspicious" | "safe";
}

interface BackendAudioResponse {
  is_synthetic: boolean;
  confidence: number;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

function fileToBase64(
  file: File,
): Promise<string> {
  return new Promise(
    (resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;

        if (
          typeof result !== "string"
        ) {
          reject(
            new Error(
              "No se pudo convertir el archivo a Base64.",
            ),
          );

          return;
        }

        const base64 =
          result.split(",")[1];

        if (!base64) {
          reject(
            new Error(
              "El archivo no contiene Base64 válido.",
            ),
          );

          return;
        }

        resolve(base64);
      };

      reader.onerror = () => {
        reject(
          new Error(
            "No se pudo leer el archivo de audio.",
          ),
        );
      };

      reader.readAsDataURL(file);
    },
  );
}

export async function analyzeAudio(
  file: File,
): Promise<AudioAnalysisResponse> {
  if (
    !file.name
      .toLowerCase()
      .endsWith(".wav")
  ) {
    throw new Error(
      "El backend solo acepta archivos WAV.",
    );
  }

  const audioBase64 =
    await fileToBase64(file);

  const callId =
    file.name.replace(
      /\.wav$/i,
      "",
    );

  const response =
    await fetch(
      `${API_BASE_URL}/detect`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          call_id: callId,
          audio_base64: audioBase64,
          sample_rate: 8000,
          channels: 2,
        }),
      },
    );

  if (!response.ok) {
    const detail =
      await response.text();

    throw new Error(
      `Gemini API ${response.status}: ${detail}`,
    );
  }

  const data: BackendAudioResponse =
    await response.json();

  return {
    filename: file.name,

    prediction:
      data.is_synthetic
        ? "synthetic"
        : "real",

    synthetic_probability:
      data.confidence,

    channel_status:
      data.is_synthetic
        ? "suspicious"
        : "safe",
  };
}