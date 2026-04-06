// ============================================================
// API Service — connects React frontend to FastAPI backend
// All routes live under /api/v1/  (proxied by vite.config.ts)
// ============================================================

export const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:18000';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

// ---------- helpers ----------

export function getToken(): string | null {
  return localStorage.getItem('authToken');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
    if (Array.isArray(error.detail)) {
      const messages = error.detail
        .map((e: { msg?: string; loc?: string[] }) => {
          const field = e.loc ? e.loc[e.loc.length - 1] : '';
          return field ? `${field}: ${e.msg}` : e.msg;
        })
        .join(', ');
      throw new Error(messages);
    }
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthResponse>(res);
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthResponse>(res);
}

// ─────────────────────────────────────────────────────────────
// FARMS
// ─────────────────────────────────────────────────────────────

export interface Farm {
  farm_id: string;
  farm_name: string;
  farm_type: string;
  farm_status: string;
  address?: string;
  area_size?: number;
}

interface FarmListResponse {
  farms: Farm[];
  total: number;
}

export interface FarmCreate {
  farm_name: string;
  farm_type: 'FISH' | 'POULTRY' | 'MIXED';
  address?: string;
  area_size?: number;
}

export async function createFarm(data: FarmCreate): Promise<Farm> {
  const res = await fetch(`${BASE_URL}/farms`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Farm>(res);
}

export async function getFarms(): Promise<Farm[]> {
  const res = await fetch(`${BASE_URL}/farms`, { headers: authHeaders() });
  const data = await handleResponse<FarmListResponse>(res);
  return data.farms;
}

// ─────────────────────────────────────────────────────────────
// DIAGNOSIS / DETECTION
// ─────────────────────────────────────────────────────────────

export type TargetSpecies = 'fish' | 'poultry';

export interface DiagnosisCreate {
  farm_id: string;
  target_species: TargetSpecies;
  unit_id?: string;
  symptoms_text?: string;
  symptom_ids?: string[];
}

export interface AIResult {
  disease_code: string;
  disease_name: string;
  confidence: number;
  confidence_percent: number;
  severity: string;
  is_healthy: boolean;
  needs_treatment: boolean;
}

export interface DiseaseResult {
  disease_id?: string;
  name?: string;
  full_name?: string;
  confidence?: number;
  severity?: 'low' | 'medium' | 'high';
  treatment?: {
    immediate: string[];
    medication: string[];
    prevention: string[];
  };
}

export interface DiagnosisResponse {
  diagnosis_id: string;
  user_id: string;
  farm_id: string;
  unit_id?: string;
  target_species: TargetSpecies;
  status: string;
  symptoms_text?: string;
  final_disease_id?: string;
  ai_confidence?: number;
  ai_disease_code?: string;
  ai_result?: AIResult;
  created_at: string;
  updated_at: string;
  images: { diagnosis_image_id: string; image_url: string; captured_at: string }[];
  final_disease?: DiseaseResult;
}

export interface ImageUploadResponse {
  diagnosis_image_id: string;
  image_url: string;
  diagnosis_id: string;
  captured_at: string;
  diagnosis?: DiagnosisResponse;
}

export async function createDiagnosis(data: DiagnosisCreate): Promise<DiagnosisResponse> {
  const res = await fetch(`${BASE_URL}/detection/analyze`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<DiagnosisResponse>(res);
}

export async function uploadDiagnosisImage(
  diagnosisId: string,
  file: File,
  species: TargetSpecies = 'fish'
): Promise<ImageUploadResponse> {
  const form = new FormData();
  form.append('file', file);
  const endpoint = species.toLowerCase() === 'poultry'
    ? `${BASE_URL}/detection/${diagnosisId}/images/poultry`
    : `${BASE_URL}/detection/${diagnosisId}/images/fish`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  return handleResponse<ImageUploadResponse>(res);
}

export async function analyzeImage(
  file: File,
  species: TargetSpecies,
  farmId: string,
  symptomsText?: string
): Promise<DiagnosisResponse> {
  const diagnosis = await createDiagnosis({
    farm_id: farmId,
    target_species: species.toUpperCase() as TargetSpecies,
    symptoms_text: symptomsText,
    symptom_ids: [],
  });

  const uploadResult = await uploadDiagnosisImage(diagnosis.diagnosis_id, file, species);

  return uploadResult.diagnosis ?? diagnosis;
}

// ─────────────────────────────────────────────────────────────
// HISTORY
// ─────────────────────────────────────────────────────────────

export interface DiagnosisListResponse {
  diagnoses: DiagnosisResponse[];
  total: number;
}

export async function getHistory(skip = 0, limit = 100): Promise<DiagnosisListResponse> {
  const res = await fetch(`${BASE_URL}/detection/history?skip=${skip}&limit=${limit}`, {
    headers: authHeaders(),
  });
  return handleResponse<DiagnosisListResponse>(res);
}

export async function getDiagnosis(diagnosisId: string): Promise<DiagnosisResponse> {
  const res = await fetch(`${BASE_URL}/detection/${diagnosisId}`, {
    headers: authHeaders(),
  });
  return handleResponse<DiagnosisResponse>(res);
}

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────

export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch('/health');
  return handleResponse(res);
}

export async function logoutUser(): Promise<void> {
  const token = getToken();
  if (!token) return;
  try {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: authHeaders(),
    });
  } catch {
    // Ignore errors — client-side cleanup happens regardless
  } finally {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
  }
}
 
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem('authToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
    return data.access_token;
  } catch {
    return null;
  }
}