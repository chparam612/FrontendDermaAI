import { http, HttpResponse, delay } from 'msw';
import fixtures from './fixtures.json';
import type { HealthResponse, ModelInfoResponse, PredictResponse } from '../types';

export const handlers = [
  http.get('*/api/health', async () => {
    await delay(50);
    const health: HealthResponse = {
      status: 'ok',
      model_version: 'exp2c-panderm-vit-base-v1',
      device: 'cpu',
      checkpoint_sha256: '137c79912024',
    };
    return HttpResponse.json(health);
  }),

  http.get('*/api/model-info', async () => {
    await delay(80);
    const modelInfo: ModelInfoResponse = {
      model_version: 'exp2c-panderm-vit-base-v1',
      classes: [
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
      ],
      malignant_classes: ['BCC', 'MEL', 'SCCKA', 'MAL_OTH', 'AKIEC'],
      provenance: {
        split_sha256: 'a4346dcf4d91a8bf6382a26c42618be327975de7f17596ce1fddfbcf1e160c36',
        experiment_name: 'exp2c_panderm_uniform',
        seed: 42,
      },
      limitations:
        'This model is a research prototype trained on a single internal partition of the MILK10k dataset. Tail diagnostic classes (e.g. MAL_OTH, INF, VASC, DF) have low test support (n <= 17) with high variance. Dermoscopic images only are utilized; clinical close-ups and skin tone metadata are ignored by this model arm. Not evaluated or approved for clinical diagnostic workflows.',
      disclaimer: 'RESEARCH / DECISION-SUPPORT PROTOTYPE ONLY. Not a diagnostic device.',
    };
    return HttpResponse.json(modelInfo);
  }),

  http.post('*/api/predict', async ({ request }) => {
    await delay(150);
    try {
      const formData = await request.formData();
      const dermImage = formData.get('dermoscopic_image');
      if (!dermImage) {
        return HttpResponse.json(
          {
            detail: "Missing required multipart field 'dermoscopic_image'.",
            disclaimer: 'RESEARCH / DECISION-SUPPORT PROTOTYPE ONLY. Not a diagnostic device.',
          },
          { status: 400 }
        );
      }

      const skinToneVal = formData.get('skin_tone');
      const skinTone = skinToneVal !== null ? Number(skinToneVal) : null;

      // Select fixture (benign, malignant, or null_explanation)
      const selected = (formData.get('mock_variant') === 'null_explanation')
        ? fixtures.null_explanation
        : fixtures.malignant;

      const response: PredictResponse = {
        ...selected,
        skin_tone: skinTone,
      };

      return HttpResponse.json(response);
    } catch {
      const response: PredictResponse = fixtures.malignant;
      return HttpResponse.json(response);
    }
  }),
];
