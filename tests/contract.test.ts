import { describe, it, expect, vi } from 'vitest';
import { PredictRequest, PredictResponse } from '../types';
import {
  validatePredictRequest,
  validatePredictResponse,
  ContractValidationError,
  REQUIRED_CONCEPT_KEYS,
} from '../src/validation';
import {
  generateMockPredictResponse,
  handleMockPredict,
  createMockFetch,
} from '../src/mock-server';
import {
  DermatologyApiClient,
  predict,
  ApiError,
} from '../src/client';

// Helper to create mock File objects for testing
function createMockFile(name = 'sample.jpg', size = 1024, type = 'image/jpeg'): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
}

describe('Canonical API Contract Tests', () => {
  describe('1. Request Contract & Single-View Fallback', () => {
    it('supports single-view request with clinical_image only', () => {
      const clinicalImage = createMockFile('clinical.jpg');
      const req: PredictRequest = {
        clinical_image: clinicalImage,
      };

      const validated = validatePredictRequest(req);
      expect(validated.clinical_image).toBe(clinicalImage);
      expect(validated.dermoscopic_image).toBeUndefined();
      expect(validated.skin_tone).toBeUndefined();
    });

    it('supports dual-view request with clinical_image and dermoscopic_image', () => {
      const clinicalImage = createMockFile('clinical.jpg');
      const dermoscopicImage = createMockFile('dermoscopic.jpg');
      const req: PredictRequest = {
        clinical_image: clinicalImage,
        dermoscopic_image: dermoscopicImage,
      };

      const validated = validatePredictRequest(req);
      expect(validated.clinical_image).toBe(clinicalImage);
      expect(validated.dermoscopic_image).toBe(dermoscopicImage);
      expect(validated.skin_tone).toBeUndefined();
    });

    it('supports request with clinical_image and optional skin_tone', () => {
      const clinicalImage = createMockFile('clinical.jpg');
      const req: PredictRequest = {
        clinical_image: clinicalImage,
        skin_tone: 3,
      };

      const validated = validatePredictRequest(req);
      expect(validated.clinical_image).toBe(clinicalImage);
      expect(validated.skin_tone).toBe(3);
      expect(validated.dermoscopic_image).toBeUndefined();
    });

    it('supports request with all supported fields', () => {
      const clinicalImage = createMockFile('clinical.jpg');
      const dermoscopicImage = createMockFile('dermoscopic.jpg');
      const req: PredictRequest = {
        clinical_image: clinicalImage,
        dermoscopic_image: dermoscopicImage,
        skin_tone: 2,
      };

      const validated = validatePredictRequest(req);
      expect(validated.clinical_image).toBe(clinicalImage);
      expect(validated.dermoscopic_image).toBe(dermoscopicImage);
      expect(validated.skin_tone).toBe(2);
    });

    it('rejects request if clinical_image is missing', () => {
      expect(() => {
        validatePredictRequest({ skin_tone: 1 });
      }).toThrow(ContractValidationError);
    });

    it('rejects request if skin_tone is out of [0, 5] range', () => {
      const clinicalImage = createMockFile('clinical.jpg');
      expect(() => {
        validatePredictRequest({ clinical_image: clinicalImage, skin_tone: 6 });
      }).toThrow(ContractValidationError);

      expect(() => {
        validatePredictRequest({ clinical_image: clinicalImage, skin_tone: -1 });
      }).toThrow(ContractValidationError);
    });
  });

  describe('2. Response Contract Verification', () => {
    const validResponse: PredictResponse = {
      predicted_class: 'BCC',
      confidence: 0.92,
      malignant_probability: 0.88,
      per_class_probs: {
        AKIEC: 0.01,
        BCC: 0.92,
        BEN_OTH: 0.005,
        BKL: 0.01,
        DF: 0.005,
        INF: 0.005,
        MAL_OTH: 0.01,
        MEL: 0.02,
        NV: 0.01,
        SCCKA: 0.003,
        VASC: 0.002,
      },
      concept_scores: {
        ulceration_crust: 0.75,
        hair: 0.12,
        vasculature: 0.84,
        erythema: 0.65,
        pigmented: 0.3,
        gel_fluid: 0.2,
        skin_markings: 0.55,
      },
      explainability_overlay: 'data:image/png;base64,samplebase64overlaydata',
      model_version: 'panderm-v1.0',
    };

    it('validates a conformant PredictResponse', () => {
      const res = validatePredictResponse(validResponse);
      expect(res.predicted_class).toBe('BCC');
      expect(typeof res.confidence).toBe('number');
      expect(typeof res.malignant_probability).toBe('number');
      expect(typeof res.per_class_probs).toBe('object');
      expect(typeof res.concept_scores).toBe('object');
      expect(typeof res.explainability_overlay).toBe('string');
      expect(typeof res.model_version).toBe('string');
    });

    it('verifies all seven required concept score keys exist and are numeric', () => {
      const res = validatePredictResponse(validResponse);
      for (const key of REQUIRED_CONCEPT_KEYS) {
        expect(res.concept_scores[key]).toBeDefined();
        expect(typeof res.concept_scores[key]).toBe('number');
        expect(Number.isNaN(res.concept_scores[key])).toBe(false);
      }
      expect(Object.keys(res.concept_scores)).toEqual(
        expect.arrayContaining([...REQUIRED_CONCEPT_KEYS])
      );
    });

    it('fails if any concept score key is missing', () => {
      for (const missingKey of REQUIRED_CONCEPT_KEYS) {
        const invalidScores = { ...validResponse.concept_scores };
        delete (invalidScores as Record<string, unknown>)[missingKey];

        const malformedResponse = {
          ...validResponse,
          concept_scores: invalidScores,
        };

        expect(() => validatePredictResponse(malformedResponse)).toThrow(
          ContractValidationError
        );
      }
    });

    it('fails if numeric fields are not numbers', () => {
      // confidence as string
      expect(() => {
        validatePredictResponse({
          ...validResponse,
          confidence: '0.92' as unknown as number,
        });
      }).toThrow(ContractValidationError);

      // malignant_probability as percentage string
      expect(() => {
        validatePredictResponse({
          ...validResponse,
          malignant_probability: '88%' as unknown as number,
        });
      }).toThrow(ContractValidationError);

      // concept score as string
      expect(() => {
        validatePredictResponse({
          ...validResponse,
          concept_scores: {
            ...validResponse.concept_scores,
            hair: '0.12' as unknown as number,
          },
        });
      }).toThrow(ContractValidationError);
    });

    it('fails if per_class_probs is not an object of numbers', () => {
      expect(() => {
        validatePredictResponse({
          ...validResponse,
          per_class_probs: ['BCC', 0.9] as unknown as Record<string, number>,
        });
      }).toThrow(ContractValidationError);

      expect(() => {
        validatePredictResponse({
          ...validResponse,
          per_class_probs: {
            BCC: 'high' as unknown as number,
          },
        });
      }).toThrow(ContractValidationError);
    });
  });

  describe('3. Mock Server Conformance', () => {
    it('mock server implements canonical contract and supports single-view request', async () => {
      const clinicalImage = createMockFile('clinical.jpg');
      const response = await handleMockPredict({
        clinical_image: clinicalImage,
      });

      // Verify shape satisfies PredictResponse
      expect(typeof response.predicted_class).toBe('string');
      expect(typeof response.confidence).toBe('number');
      expect(typeof response.malignant_probability).toBe('number');
      expect(typeof response.explainability_overlay).toBe('string');
      expect(typeof response.model_version).toBe('string');
      expect(response.explainability_overlay).toMatch(/^data:image\/png;base64,/);

      // Verify all 7 concept keys
      for (const key of REQUIRED_CONCEPT_KEYS) {
        expect(typeof response.concept_scores[key]).toBe('number');
      }
    });

    it('mock server supports dual-view and skin_tone input', async () => {
      const response = await handleMockPredict({
        clinical_image: createMockFile('clinical.jpg'),
        dermoscopic_image: createMockFile('dermoscopic.jpg'),
        skin_tone: 4,
      });

      expect(response).toBeDefined();
      expect(response.predicted_class).toBeDefined();
    });

    it('generateMockPredictResponse produces valid contract output', () => {
      const res = generateMockPredictResponse('MEL', 0.85, 0.9);
      expect(res.predicted_class).toBe('MEL');
      expect(res.confidence).toBe(0.85);
      expect(res.malignant_probability).toBe(0.9);
      expect(res.per_class_probs['MEL']).toBe(0.85);
    });
  });

  describe('4. Real API Client Conformance', () => {
    it('constructs correct multipart FormData without optional fields for single-view', async () => {
      let sentFormData: FormData | null = null;

      const mockFetch: typeof fetch = async (input, init) => {
        sentFormData = init?.body as FormData;
        return new Response(JSON.stringify(generateMockPredictResponse()), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      };

      const client = new DermatologyApiClient({
        baseUrl: 'https://api.dermascan.example.com',
        fetchFn: mockFetch,
      });

      const clinicalImage = createMockFile('clinical.jpg');
      const result = await client.predict({
        clinical_image: clinicalImage,
      });

      expect(sentFormData).not.toBeNull();
      expect(sentFormData!.get('clinical_image')).toBe(clinicalImage);
      // Optional fields must NOT be appended when absent
      expect(sentFormData!.get('dermoscopic_image')).toBeNull();
      expect(sentFormData!.get('skin_tone')).toBeNull();

      expect(result.predicted_class).toBe('BCC');
    });

    it('constructs correct multipart FormData when dermoscopic_image and skin_tone are provided', async () => {
      let sentFormData: FormData | null = null;

      const mockFetch: typeof fetch = async (input, init) => {
        sentFormData = init?.body as FormData;
        return new Response(JSON.stringify(generateMockPredictResponse()), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      };

      const client = new DermatologyApiClient({
        baseUrl: 'https://api.dermascan.example.com',
        fetchFn: mockFetch,
      });

      const clinicalImage = createMockFile('clinical.jpg');
      const dermoscopicImage = createMockFile('dermoscopic.jpg');
      const result = await client.predict({
        clinical_image: clinicalImage,
        dermoscopic_image: dermoscopicImage,
        skin_tone: 5,
      });

      expect(sentFormData).not.toBeNull();
      expect(sentFormData!.get('clinical_image')).toBe(clinicalImage);
      expect(sentFormData!.get('dermoscopic_image')).toBe(dermoscopicImage);
      expect(sentFormData!.get('skin_tone')).toBe('5');

      expect(result.predicted_class).toBe('BCC');
    });

    it('client throws ContractValidationError when server returns malformed response', async () => {
      const mockFetch: typeof fetch = async () => {
        return new Response(
          JSON.stringify({
            predicted_class: 'BCC',
            // Missing confidence, malignant_probability, concept_scores, etc.
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      };

      const client = new DermatologyApiClient({ fetchFn: mockFetch });

      await expect(
        client.predict({ clinical_image: createMockFile() })
      ).rejects.toThrow(ContractValidationError);
    });

    it('client throws ApiError when server returns non-200 HTTP status', async () => {
      const mockFetch: typeof fetch = async () => {
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
          status: 500,
          statusText: 'Internal Server Error',
          headers: { 'Content-Type': 'application/json' },
        });
      };

      const client = new DermatologyApiClient({ fetchFn: mockFetch });

      await expect(
        client.predict({ clinical_image: createMockFile() })
      ).rejects.toThrow(ApiError);
    });

    it('convenience predict() function works with mock fetch interceptor', async () => {
      const mockFetch = createMockFetch();
      const res = await predict(
        { clinical_image: createMockFile() },
        { baseUrl: 'http://localhost/api', fetchFn: mockFetch }
      );

      expect(res.predicted_class).toBe('BCC');
      expect(res.confidence).toBeGreaterThan(0);
    });
  });
});
