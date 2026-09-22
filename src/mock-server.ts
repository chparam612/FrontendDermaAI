import { PredictRequest, PredictResponse } from '../types';
import { validatePredictRequest, validatePredictResponse } from './validation';

/**
 * Standard 11 classes matching the model architecture.
 */
export const DERMATOLOGY_CLASSES = [
  'AKIEC',
  'BCC',
  'BEN_OTH',
  'BKL',
  'DF',
  'INF',
  'MAL_OTH',
  'MEL',
  'NV',
  'SCCKA',
  'VASC',
] as const;

/**
 * Deterministic mock response generator conforming strictly to PredictResponse.
 */
export function generateMockPredictResponse(
  predictedClass = 'BCC',
  confidence = 0.91,
  malignantProbability = 0.87
): PredictResponse {
  // Construct standard 11-class distribution
  const perClassProbs: Record<string, number> = {
    AKIEC: 0.01,
    BCC: 0.91,
    BEN_OTH: 0.01,
    BKL: 0.01,
    DF: 0.005,
    INF: 0.005,
    MAL_OTH: 0.01,
    MEL: 0.02,
    NV: 0.01,
    SCCKA: 0.015,
    VASC: 0.005,
  };

  // Adjust predicted class probability if customized
  if (predictedClass !== 'BCC') {
    perClassProbs[predictedClass] = confidence;
  }

  const response: PredictResponse = {
    predicted_class: predictedClass,
    confidence: confidence,
    malignant_probability: malignantProbability,
    per_class_probs: perClassProbs,
    concept_scores: {
      ulceration_crust: 0.72,
      hair: 0.15,
      vasculature: 0.81,
      erythema: 0.64,
      pigmented: 0.31,
      gel_fluid: 0.22,
      skin_markings: 0.57,
    },
    explainability_overlay:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    model_version: 'panderm-mock-v1.0',
  };

  // Validate to ensure mock response never deviates from canonical contract
  return validatePredictResponse(response);
}

/**
 * Mock prediction service handler implementing the API contract.
 */
export async function handleMockPredict(
  request: PredictRequest
): Promise<PredictResponse> {
  // Validate request satisfies contract
  validatePredictRequest(request);

  // Return strictly validated mock response
  return generateMockPredictResponse();
}

/**
 * Creates a mock fetch function that can simulate backend network responses for /predict.
 */
export function createMockFetch(options?: { delayMs?: number }): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (options?.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }

    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (url.endsWith('/predict') && init?.method === 'POST') {
      const body = init.body;
      if (!(body instanceof FormData)) {
        return new Response(
          JSON.stringify({ error: 'Expected multipart/form-data with clinical_image' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const clinicalImage = body.get('clinical_image');
      if (!clinicalImage || !(clinicalImage instanceof File || (typeof clinicalImage === 'object' && 'name' in clinicalImage))) {
        return new Response(
          JSON.stringify({ error: 'clinical_image is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const mockResponse = generateMockPredictResponse();
      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}
