import type {
  ApiError,
  BatchPredictionResponse,
  ModelInfoResponse,
  PolicyInput,
  SinglePredictionResponse,
} from "./types";

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorBody: ApiError | null = null;
    try {
      errorBody = (await response.json()) as ApiError;
    } catch {
      // Non-JSON error body; fall through to generic message.
    }
    throw new Error(errorBody?.error ?? errorBody?.detail ?? `Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

/** Score a single policy through the Next.js API route. */
export async function predictSingle(policy: PolicyInput): Promise<SinglePredictionResponse> {
  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ policy }),
  });
  return handleResponse<SinglePredictionResponse>(response);
}

/** Score a batch of policies through the Next.js API route. */
export async function predictBatch(policies: PolicyInput[]): Promise<BatchPredictionResponse> {
  const response = await fetch(`${API_BASE}/predict/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ policies }),
  });
  return handleResponse<BatchPredictionResponse>(response);
}

/** Fetch model metadata and saved metrics. */
export async function fetchModelInfo(): Promise<ModelInfoResponse> {
  const response = await fetch(`${API_BASE}/model-info`, {
    method: "GET",
    next: { revalidate: 60 },
  });
  return handleResponse<ModelInfoResponse>(response);
}