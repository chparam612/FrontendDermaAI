/**
 * TypeScript contract interfaces for SkinCancerTracker FastAPI inference service.
 * Hand-checked against ..\SkinCancerTracker\api\schemas.py and api\app.py.
 */

export interface HealthResponse {
  status: string;
  model_version: string;
  device: string;
  checkpoint_sha256: string;
}

export interface ProvenanceInfo {
  split_sha256: string;
  experiment_name: string;
  seed: number;
}

export interface ModelInfoResponse {
  model_version: string;
  classes: string[];
  malignant_classes: string[];
  provenance: ProvenanceInfo;
  limitations: string;
  disclaimer: string;
}

export interface PredictRequest {
  dermoscopic_image: File;
  clinical_image?: File | null;
  skin_tone?: number | null;
}

export interface PredictResponse {
  predicted_class: string;
  confidence: number;
  malignant_probability: number;
  per_class_probs: Record<string, number>;
  concept_scores: Record<string, number> | null;
  explainability_overlay: string | null;
  model_version: string;
  disclaimer: string;
  inference_ms: number;
  input_note: string;
  skin_tone?: number | null;
}

export interface ErrorResponse {
  detail: string | Array<{ loc: (string | number)[]; msg: string; type: string }>;
  disclaimer?: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly disclaimer?: string;

  constructor(status: number, message: string, disclaimer?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.disclaimer = disclaimer;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
