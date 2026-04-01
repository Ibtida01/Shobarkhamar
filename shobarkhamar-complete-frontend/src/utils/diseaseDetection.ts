// Real disease detection — calls Shobarkhamar backend API

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export interface DetectionResult {
  isHealthy: boolean;
  disease?: string;
  confidence: number;
  symptoms: string[];
  treatment: {
    immediate: string[];
    medication: string[];
    prevention: string[];
  };
  severity: "low" | "medium" | "high";
  raw?: object; // full API response for debugging
}

function getToken(): string | null {
  // Adjust this key to wherever your app stores the JWT
  return localStorage.getItem("access_token");
}

function mapSeverity(severity: string): "low" | "medium" | "high" {
  const s = severity?.toUpperCase();
  if (s === "CRITICAL" || s === "HIGH") return "high";
  if (s === "MEDIUM") return "medium";
  return "low";
}

/** Map raw API response → DetectionResult */
function mapApiResponse(data: any): DetectionResult {
  const primary = data.primary_prediction;
  const isHealthy: boolean = data.is_healthy ?? false;

  return {
    isHealthy,
    disease: isHealthy ? undefined : primary.disease_name,
    confidence: Math.round((primary.confidence ?? 0) * 100),
    severity: mapSeverity(primary.severity),
    // API doesn't return per-image symptoms/treatment — leave empty for now
    // so the rest of your UI still renders without crashing
    symptoms: [],
    treatment: { immediate: [], medication: [], prevention: [] },
    raw: data,
  };
}

export async function detectDisease(
  type: "fish" | "poultry",
  imageFile: File
): Promise<DetectionResult> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated. Please log in.");

  const endpoint =
    type === "poultry"
      ? `${API_BASE}/detection/poultry/predict`
      : `${API_BASE}/detection/fish/predict`;

  const form = new FormData();
  form.append("file", imageFile);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${response.status}`);
  }

  const data = await response.json();
  return mapApiResponse(data);
}