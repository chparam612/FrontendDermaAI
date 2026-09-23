import type { PredictRequest, PredictResponse } from './types';

export async function predict(req: PredictRequest): Promise<PredictResponse> {
  const form = new FormData();
  form.append("clinical_image", req.clinical_image);
  if (req.dermoscopic_image) form.append("dermoscopic_image", req.dermoscopic_image);
  if (req.skin_tone !== undefined) form.append("skin_tone", String(req.skin_tone));

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/predict`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Prediction failed: ${res.status}`);
  return res.json();
}
