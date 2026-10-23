import { describe, it, expect, vi } from 'vitest';
import { predict, getHealth, getModelInfo } from './apiClient';
import { ApiError } from './types';

function createDummyFile(name = 'test.jpg', mime = 'image/jpeg'): File {
  return new File(['dummy-bytes'], name, { type: mime });
}

describe('apiClient', () => {
  it('successfully executes predict request and returns PredictResponse', async () => {
    const mockResponseData = {
      predicted_class: 'BCC',
      confidence: 0.896,
      malignant_probability: 0.931,
      per_class_probs: { BCC: 0.896, NV: 0.052 },
      concept_scores: null,
      explainability_overlay: 'data:image/png;base64,abc',
      model_version: 'exp2c-panderm-vit-base-v1',
      disclaimer: 'RESEARCH / DECISION-SUPPORT PROTOTYPE ONLY.',
      inference_ms: 154.2,
      input_note: 'Dermoscopic images only',
      skin_tone: null,
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponseData,
    });

    const file = createDummyFile('dermoscopic.jpg');
    const result = await predict(
      {
        dermoscopic_image: file,
        clinical_image: null,
        skin_tone: 3,
      },
      { fetchFn: mockFetch as unknown as typeof fetch }
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [callUrl, callInit] = mockFetch.mock.calls[0];
    expect(callUrl).toContain('/api/predict');
    expect(callInit.method).toBe('POST');
    expect(callInit.body).toBeInstanceOf(FormData);
    expect(result.predicted_class).toBe('BCC');
    expect(result.confidence).toBe(0.896);
  });

  it('handles HTTP 400 error and extracts backend detail and disclaimer', async () => {
    const mockErrorPayload = {
      detail: "Uploaded file in 'dermoscopic_image' is corrupted or not a valid image: cannot identify image file.",
      disclaimer: 'RESEARCH / DECISION-SUPPORT PROTOTYPE ONLY.',
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => mockErrorPayload,
    });

    const file = createDummyFile('bad.jpg');
    await expect(
      predict({ dermoscopic_image: file }, { fetchFn: mockFetch as unknown as typeof fetch })
    ).rejects.toThrow(ApiError);

    try {
      await predict({ dermoscopic_image: file }, { fetchFn: mockFetch as unknown as typeof fetch });
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(400);
      expect(apiErr.message).toBe(mockErrorPayload.detail);
      expect(apiErr.disclaimer).toBe(mockErrorPayload.disclaimer);
    }
  });

  it('handles HTTP 422 validation error with structured array detail', async () => {
    const mock422Payload = {
      detail: [
        {
          loc: ['body', 'dermoscopic_image'],
          msg: 'Field required',
          type: 'missing',
        },
      ],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      json: async () => mock422Payload,
    });

    const file = createDummyFile('derm.jpg');
    try {
      await predict({ dermoscopic_image: file }, { fetchFn: mockFetch as unknown as typeof fetch });
      expect.fail('Should have thrown ApiError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(422);
      expect(apiErr.message).toContain('dermoscopic_image: Field required');
    }
  });

  it('handles timeout when request exceeds configured timeout threshold', async () => {
    const mockFetch = vi.fn().mockImplementation((_url, init) => {
      return new Promise((_, reject) => {
        init.signal.addEventListener('abort', () => {
          const abortError = new DOMException('The operation was aborted', 'AbortError');
          reject(abortError);
        });
      });
    });

    const file = createDummyFile('derm.jpg');
    try {
      await predict(
        { dermoscopic_image: file },
        { timeoutMs: 50, fetchFn: mockFetch as unknown as typeof fetch }
      );
      expect.fail('Should have timed out');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(408);
      expect(apiErr.message).toContain('timed out');
    }
  });

  it('handles network failure with readable connectivity guidance', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const file = createDummyFile('derm.jpg');
    try {
      await predict({ dermoscopic_image: file }, { fetchFn: mockFetch as unknown as typeof fetch });
      expect.fail('Should have failed with network error');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(0);
      expect(apiErr.message).toContain('Unable to reach backend API');
      expect(apiErr.message).toContain('CORS');
    }
  });

  it('queries getHealth successfully', async () => {
    const mockHealth = {
      status: 'ok',
      model_version: 'exp2c-panderm-vit-base-v1',
      device: 'cpu',
      checkpoint_sha256: '137c79912024',
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockHealth,
    });

    const health = await getHealth({ fetchFn: mockFetch as unknown as typeof fetch });
    expect(health.status).toBe('ok');
    expect(health.device).toBe('cpu');
    expect(health.checkpoint_sha256).toBe('137c79912024');
  });

  it('queries getModelInfo successfully', async () => {
    const mockInfo = {
      model_version: 'exp2c-panderm-vit-base-v1',
      classes: ['BCC', 'MEL'],
      malignant_classes: ['BCC', 'MEL'],
      provenance: {
        split_sha256: 'a4346dcf4d91a8bf6382a26c42618be327975de7f17596ce1fddfbcf1e160c36',
        experiment_name: 'exp2c_panderm_uniform',
        seed: 42,
      },
      limitations: 'Research prototype.',
      disclaimer: 'RESEARCH / DECISION-SUPPORT PROTOTYPE ONLY.',
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockInfo,
    });

    const info = await getModelInfo({ fetchFn: mockFetch as unknown as typeof fetch });
    expect(info.model_version).toBe('exp2c-panderm-vit-base-v1');
    expect(info.classes).toEqual(['BCC', 'MEL']);
  });
});
