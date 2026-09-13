const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

export interface HistorialAudio {
  time: string;
  call_id: string;
  synthetic_probability: number;
  channel_status: string;
  segments_count: number;
}

export interface HistorialResumen {
  total_calls: number;
  suspicious_calls: number;
  avg_probability: number;
}

export async function obtenerHistorial(
  limit = 50,
): Promise<HistorialAudio[]> {
  const response = await fetch(
    `${API_BASE_URL}/telemetry?limit=${limit}`,
  );

  if (!response.ok) {
    const detail = await response.text();

    throw new Error(
      `History API ${response.status}: ${detail}`,
    );
  }

  return response.json();
}

export async function obtenerResumenHistorial(): Promise<HistorialResumen> {
  const response = await fetch(
    `${API_BASE_URL}/metrics/summary`,
  );

  if (!response.ok) {
    const detail = await response.text();

    throw new Error(
      `Metrics API ${response.status}: ${detail}`,
    );
  }

  return response.json();
}