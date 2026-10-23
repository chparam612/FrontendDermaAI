import {
  ApiError,
  type HealthResponse,
  type ModelInfoResponse,
  type PredictRequest,
  type PredictResponse,
} from './types';

const DEFAULT_TIMEOUT_MS = 60_000; // 60 seconds

export function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_BASE_URL;
  if (!url) {
    return 'http://127.0.0.1:8000';
  }
  return url.replace(/\/+$/, '');
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') {
    return fallback;
  }
  const obj = data as Record<string, unknown>;
  if (typeof obj.detail === 'string') {
    return obj.detail;
  }
  if (Array.isArray(obj.detail)) {
    const messages = obj.detail.map((item) => {
      if (typeof item === 'object' && item !== null && 'msg' in item) {
        const fieldLoc = Array.isArray((item as { loc?: unknown[] }).loc)
          ? (item as { loc: unknown[] }).loc.filter((part) => part !== 'body').join('.')
          : '';
        const msg = String((item as { msg: string }).msg);
        return fieldLoc ? `${fieldLoc}: ${msg}` : msg;
      }
      return JSON.stringify(item);
    });
    return messages.join('; ');
  }
  if (typeof obj.message === 'string') {
    return obj.message;
  }
  return fallback;
}

function extractDisclaimer(data: unknown): string | undefined {
  if (
    data &&
    typeof data === 'object' &&
    'disclaimer' in data &&
    typeof (data as Record<string, unknown>).disclaimer === 'string'
  ) {
    return (data as Record<string, unknown>).disclaimer as string;
  }
  return undefined;
}

async function executeRequest<T>(
  url: string,
  options: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  customFetch?: typeof fetch
): Promise<T> {
  const fetchFn = customFetch || fetch;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetchFn(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorBody: unknown = null;
      try {
        errorBody = await response.json();
      } catch {
        try {
          errorBody = { detail: await response.text() };
        } catch {
          errorBody = null;
        }
      }

      const defaultMsg = `Request failed with HTTP status ${response.status} (${response.statusText})`;
      const message = extractErrorMessage(errorBody, defaultMsg);
      const disclaimer = extractDisclaimer(errorBody);
      throw new ApiError(response.status, message, disclaimer);
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }

    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(
        408,
        `Request timed out after ${Math.round(timeoutMs / 1000)} seconds. Inference or server processing took too long.`
      );
    }

    if (err instanceof TypeError) {
      throw new ApiError(
        0,
        `Unable to reach backend API at ${url}. Please verify the server is running and CORS allows requests from this origin.`
      );
    }

    const fallbackMsg = err instanceof Error ? err.message : 'Unknown network or request error occurred.';
    throw new ApiError(0, fallbackMsg);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Perform model diagnostic inference on lesion imagery.
 * POST /api/predict
 */
export async function predict(
  req: PredictRequest,
  options?: { timeoutMs?: number; fetchFn?: typeof fetch }
): Promise<PredictResponse> {
  const baseUrl = getBaseUrl();
  const form = new FormData();

  form.append('dermoscopic_image', req.dermoscopic_image);

  if (req.clinical_image) {
    form.append('clinical_image', req.clinical_image);
  }

  if (req.skin_tone !== undefined && req.skin_tone !== null) {
    form.append('skin_tone', String(req.skin_tone));
  }

  return executeRequest<PredictResponse>(
    `${baseUrl}/api/predict`,
    {
      method: 'POST',
      body: form,
    },
    options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    options?.fetchFn
  );
}

/**
 * Query service health and active model provenance.
 * GET /api/health
 */
export async function getHealth(options?: {
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}): Promise<HealthResponse> {
  const baseUrl = getBaseUrl();
  return executeRequest<HealthResponse>(
    `${baseUrl}/api/health`,
    { method: 'GET' },
    options?.timeoutMs ?? 5_000,
    options?.fetchFn
  );
}

/**
 * Query active model metadata, class lists, limitations, and regulatory disclaimer.
 * GET /api/model-info
 */
export async function getModelInfo(options?: {
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}): Promise<ModelInfoResponse> {
  const baseUrl = getBaseUrl();
  return executeRequest<ModelInfoResponse>(
    `${baseUrl}/api/model-info`,
    { method: 'GET' },
    options?.timeoutMs ?? 5_000,
    options?.fetchFn
  );
}
