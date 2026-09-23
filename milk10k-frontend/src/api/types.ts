export interface PredictRequest {
  clinical_image: File;
  dermoscopic_image?: File;
  skin_tone?: number;
}

export interface PredictResponse {
  predicted_class: string;
  confidence: number;
  malignant_probability: number;
  per_class_probs: Record<string, number>;
  concept_scores: {
    ulceration_crust: number;
    hair: number;
    vasculature: number;
    erythema: number;
    pigmented: number;
    gel_fluid: number;
    skin_markings: number;
  };
  explainability_overlay: string;
  model_version: string;
}
