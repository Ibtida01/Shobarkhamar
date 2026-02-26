// ============================================================
// API Service — connects React frontend to FastAPI backend
// All routes live under /api/v1/  (proxied by vite.config.ts)
// ============================================================

const BASE_URL = '/api/v1';

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
    // Pydantic validation errors return detail as an array of objects
    if (Array.isArray(error.detail)) {
      const messages = error.detail.map((e: { msg?: string; loc?: string[] }) => {
        const field = e.loc ? e.loc[e.loc.length - 1] : '';
        return field ? `${field}: ${e.msg}` : e.msg;
      }).join(', ');
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

// Matches TokenResponse schema from backend exactly
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

// Backend expects JSON body (not form data) for both auth endpoints
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone,
      address: payload.address,
    }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });
  return handleResponse<AuthResponse>(res);
}

// ─────────────────────────────────────────────────────────────
// FARMS  (needed to get farm_id before creating a diagnosis)
// ─────────────────────────────────────────────────────────────

export interface Farm {
  farm_id: string;
  farm_name: string;   // backend uses farm_name, not name
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

// GET /api/v1/farms returns { farms: [...], total: N } — not a plain array
export async function getFarms(): Promise<Farm[]> {
  const res = await fetch(`${BASE_URL}/farms`, { headers: authHeaders() });
  const data = await handleResponse<FarmListResponse>(res);
  return data.farms;
}

// ─────────────────────────────────────────────────────────────
// DIAGNOSIS / DETECTION
//
// Full endpoint paths:
//   POST /api/v1/detection/analyze        ← step 1: create diagnosis (JSON)
//   POST /api/v1/detection/{id}/images    ← step 2: upload image (multipart)
//   GET  /api/v1/detection/history        ← fetch past diagnoses
// ─────────────────────────────────────────────────────────────

// Matches TargetSpecies enum in backend
export type TargetSpecies = 'fish' | 'poultry';

// Matches DiagnosisCreate schema exactly
export interface DiagnosisCreate {
  farm_id: string;                    // required — UUID of the user's farm
  target_species: TargetSpecies;      // "FISH" or "POULTRY" (uppercase — matches backend enum)
  unit_id?: string;                   // optional
  symptoms_text?: string;             // optional free-text symptoms
  symptom_ids?: string[];             // optional list of symptom UUIDs
}

// Matches DiseaseResponse nested inside DiagnosisResponse
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

// Matches DiagnosisResponse schema exactly
export interface DiagnosisResponse {
  diagnosis_id: string;
  user_id: string;
  farm_id: string;
  unit_id?: string;
  target_species: TargetSpecies;
  status: string;                     // DiagnosisStatus enum from backend
  symptoms_text?: string;
  final_disease_id?: string;
  created_at: string;
  updated_at: string;
  images: { diagnosis_image_id: string; image_url: string; captured_at: string }[];
  final_disease?: DiseaseResult;      // populated after AI analysis completes
}

export interface ImageUploadResponse {
  diagnosis_image_id: string;
  image_url: string;
  diagnosis_id: string;
  captured_at: string;
}

/**
 * Step 1: Create a diagnosis record
 * Requires farm_id — call getFarms() first to let user pick one
 */
export async function createDiagnosis(data: DiagnosisCreate): Promise<DiagnosisResponse> {
  const res = await fetch(`${BASE_URL}/detection/analyze`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<DiagnosisResponse>(res);
}

/**
 * Step 2: Upload the image for an existing diagnosis
 */
export async function uploadDiagnosisImage(
  diagnosisId: string,
  file: File
): Promise<ImageUploadResponse> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE_URL}/detection/${diagnosisId}/images`, {
    method: 'POST',
    headers: authHeaders(), // ← do NOT set Content-Type with FormData
    body: form,
  });
  return handleResponse<ImageUploadResponse>(res);
}

/**
 * Full flow used by Detection component:
 *   1. Create diagnosis  →  get diagnosis_id
 *   2. Upload image
 *   3. Return result
 */
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

  await uploadDiagnosisImage(diagnosis.diagnosis_id, file);

  return diagnosis;
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

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────

export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch('/health');
  return handleResponse(res);
}