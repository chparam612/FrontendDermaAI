import { PredictRequest, PredictResponse } from '../types';
import { validatePredictRequest, validatePredictResponse } from './validation';

export interface ApiClientOptions {
  baseUrl?: string;
  fetchFn?: typeof fetch;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly responseBody?: unknown
  ) {
    super(`API Error ${status} (${statusText}): ${JSON.stringify(responseBody)}`);
    this.name = 'ApiError';
  }
}

export class DermatologyApiClient {
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;

  constructor(options?: ApiClientOptions) {
    this.baseUrl = (options?.baseUrl || '').replace(/\/$/, '');
    this.fetchFn = options?.fetchFn || fetch;
  }

  /**
   * Dispatches a clinical image analysis prediction request.
   * Encapsulates multipart/form-data construction.
   * Validates both request and response against the canonical API contract.
   *
   * @param request - PredictRequest containing required clinical_image and optional dermoscopic_image/skin_tone
   * @returns Promise<PredictResponse>
   */
  async predict(request: PredictRequest): Promise<PredictResponse> {
    // 1. Validate request upfront against the contract
    const validatedRequest = validatePredictRequest(request);

    // 2. Build multipart/form-data payload
    const formData = new FormData();
    formData.append('clinical_image', validatedRequest.clinical_image);

    if (validatedRequest.dermoscopic_image !== undefined) {
      formData.append('dermoscopic_image', validatedRequest.dermoscopic_image);
    }

    if (validatedRequest.skin_tone !== undefined) {
      formData.append('skin_tone', validatedRequest.skin_tone.toString());
    }

    // 3. Dispatch POST request
    const endpoint = `${this.baseUrl}/predict`;
    const response = await this.fetchFn(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      throw new ApiError(response.status, response.statusText, errorBody);
    }

    // 4. Parse JSON and validate response against canonical contract
    const json = await response.json();
    return validatePredictResponse(json);
  }
}

// Default client instance and convenience helper function
const defaultClient = new DermatologyApiClient();

export async function predict(
  request: PredictRequest,
  options?: ApiClientOptions
): Promise<PredictResponse> {
  const client = options ? new DermatologyApiClient(options) : defaultClient;
  return client.predict(request);
}
