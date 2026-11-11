/**
 * API client module with typed functions for backend endpoints.
 * Includes retry logic with exponential backoff and user-friendly error
 * message mapping for all backend error codes.
 */

import {
  PredictRequest,
  PredictResponse,
  StatsResponse,
  BatchResponse,
  ModelId,
  ModelInfo,
  ModelsResponse,
} from "./types";

// Strip trailing slashes so a URL pasted with "/" doesn't produce "//predict" (404).
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

// ---------------------------------------------------------------------------
// Error handling helpers
// ---------------------------------------------------------------------------

const SLEEPING_SERVER_MESSAGE =
  "The server is waking up. It runs on a free hosting tier that sleeps after inactivity, so the first request can take 30 to 60 seconds. Please wait a minute and click Analyze again.";

/**
 * Ping GET /health. Returns true when the backend answers OK, false otherwise.
 * Never throws. Used to wake a sleeping free-tier server and to detect when it is up.
 */
export async function pingBackend(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Mapping from backend error codes to user-friendly messages.
 */
const ERROR_CODE_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Invalid review format. Please try again.",
  EMPTY_REVIEW: "Review text is empty. Please enter a review.",
  MODEL_NOT_FOUND: "Selected model not available. Try another.",
  FILE_TOO_LARGE: "File is too large (max 5MB). Please use a smaller file.",
  MISSING_COLUMN: "CSV must have a 'reviewText' column.",
  INTERNAL_ERROR: "Backend error. Please try again in a few moments.",
};

/**
 * Map a backend HTTP status + error code to a user-friendly error message.
 * Never exposes raw HTTP text or stack traces.
 */
function createUserError(
  status: number,
  code?: string,
  detail?: string
): Error {
  if (code && ERROR_CODE_MESSAGES[code]) {
    return new Error(ERROR_CODE_MESSAGES[code]);
  }
  if (status === 413) return new Error(ERROR_CODE_MESSAGES.FILE_TOO_LARGE);
  if (status === 422) return new Error(ERROR_CODE_MESSAGES.VALIDATION_ERROR);
  if (status === 502 || status === 503 || status === 504)
    return new Error(SLEEPING_SERVER_MESSAGE);
  if (status >= 500)
    return new Error(ERROR_CODE_MESSAGES.INTERNAL_ERROR);
  if (status === 400 && detail) return new Error(detail);
  return new Error("Something went wrong. Please try again.");
}

/**
 * Determine whether a failed request should be retried.
 * We retry on network errors and 5xx responses only.
 * Validation/400/413 errors fail immediately.
 */
function isRetryable(error: unknown, status?: number): boolean {
  if (status !== undefined) {
    // Do NOT retry client errors
    return status >= 500;
  }
  // Network-level errors (TypeError from fetch, connection refused, etc.)
  return error instanceof TypeError;
}

/**
 * Retry an async function with exponential backoff.
 *
 * @param fn       - Async function to execute
 * @param maxRetries - Maximum number of retries (default 2)
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      // Extract status if this is a typed fetch error we annotated
      const status = (err as { status?: number }).status;
      if (!isRetryable(err, status)) {
        // Not retryable — propagate immediately
        throw err;
      }
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s
        const delayMs = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  // All retries exhausted. A browser reports a CORS block the same way as a dead
  // server, so name the likely causes instead of blaming the user's internet.
  throw new Error(
    `${SLEEPING_SERVER_MESSAGE} If it still fails after a few minutes, check that the backend at ${API_BASE} is running and allows this site's origin (ALLOW_ORIGINS).`
  );
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Analyze a single review for sentiment, aspects, and reliability.
 * POST /predict
 *
 * @param review - The review text to analyze (10–5000 characters)
 * @param model  - Optional model to use: "lr" (default), "nb", or "transformer" when offered by GET /models
 * @returns Promise<PredictResponse>
 * @throws Error with user-friendly message on failure
 */
export async function analyzeReview(
  review: string,
  model?: ModelId
): Promise<PredictResponse> {
  return retryWithBackoff(async () => {
    const request: PredictRequest = {
      review,
      ...(model && { model }),
    };

    let response: Response;
    try {
      response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
    } catch (networkErr) {
      // Annotate with no status so isRetryable returns true
      throw networkErr;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const err = createUserError(response.status, body.code, body.detail);
      // Attach status so retryWithBackoff can inspect it
      (err as unknown as { status: number }).status = response.status;
      throw err;
    }

    return response.json() as Promise<PredictResponse>;
  });
}

/**
 * TF-IDF models every deployment has; used when GET /models cannot be reached.
 */
export const FALLBACK_MODELS: ModelInfo[] = [
  { id: "lr", name: "Logistic Regression (TF-IDF)", is_default: true, calibrated: false },
  { id: "nb", name: "Multinomial Naive Bayes (TF-IDF)", is_default: false, calibrated: false },
];

/**
 * List the models this deployment can serve.
 * GET /models
 *
 * Never throws: if the backend is unreachable or older than this endpoint,
 * the always-available TF-IDF models are returned so the analyzer still works.
 */
export async function fetchModels(): Promise<ModelInfo[]> {
  try {
    const response = await fetch(`${API_BASE}/models`);
    if (!response.ok) return FALLBACK_MODELS;
    const body = (await response.json()) as ModelsResponse;
    return body.models.length > 0 ? body.models : FALLBACK_MODELS;
  } catch {
    console.warn(`Could not load ${API_BASE}/models; showing the default models only.`);
    return FALLBACK_MODELS;
  }
}

/**
 * Retrieve statistics about the dataset and models.
 * GET /stats
 *
 * @returns Promise<StatsResponse>
 * @throws Error with user-friendly message on failure
 */
export async function fetchStats(): Promise<StatsResponse> {
  return retryWithBackoff(async () => {
    let response: Response;
    try {
      response = await fetch(`${API_BASE}/stats`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
    } catch (networkErr) {
      throw networkErr;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const err = createUserError(response.status, body.code, body.detail);
      (err as unknown as { status: number }).status = response.status;
      throw err;
    }

    return response.json() as Promise<StatsResponse>;
  });
}

/**
 * Alias kept for backwards compatibility with existing dashboard page
 * that imports getStats().
 */
export const getStats = fetchStats;

/**
 * Upload and process a batch of reviews from a CSV file.
 * POST /batch
 *
 * @param file - CSV file with "reviewText" column
 * @returns Promise<BatchResponse>
 * @throws Error with user-friendly message on failure
 */
export async function uploadBatch(file: File): Promise<BatchResponse> {
  return retryWithBackoff(async () => {
    const formData = new FormData();
    formData.append("file", file);

    let response: Response;
    try {
      response = await fetch(`${API_BASE}/batch`, {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type — browser sets multipart/form-data with boundary
      });
    } catch (networkErr) {
      throw networkErr;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const err = createUserError(response.status, body.code, body.detail);
      (err as unknown as { status: number }).status = response.status;
      throw err;
    }

    return response.json() as Promise<BatchResponse>;
  });
}
