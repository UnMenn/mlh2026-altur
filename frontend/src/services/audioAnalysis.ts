export interface AudioAnalysisResponse {
  filename: string;
  prediction: "synthetic" | "real" | string;
  synthetic_probability: number;
  channel_status: "suspicious" | "safe" | string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function analyzeAudio(
  file: File
): Promise<AudioAnalysisResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/process`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error analyzing audio: ${response.status}`
    );
  }

  return response.json();
}