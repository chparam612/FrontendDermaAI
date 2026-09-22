import { PredictRequest, PredictResponse } from '../types';

export class ContractValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(`Contract Validation Error on field '${field}': ${message}`);
    this.name = 'ContractValidationError';
  }
}

export const REQUIRED_CONCEPT_KEYS = [
  'ulceration_crust',
  'hair',
  'vasculature',
  'erythema',
  'pigmented',
  'gel_fluid',
  'skin_markings',
] as const;

export function validatePredictRequest(data: unknown): PredictRequest {
  if (!data || typeof data !== 'object') {
    throw new ContractValidationError('request', 'Request must be a non-null object');
  }

  const req = data as Record<string, unknown>;

  if (!req.clinical_image) {
    throw new ContractValidationError('clinical_image', 'clinical_image is required');
  }

  // Ensure clinical_image is a File or File-like object (with name and size)
  if (
    typeof req.clinical_image !== 'object' ||
    typeof (req.clinical_image as { name?: unknown }).name !== 'string' ||
    typeof (req.clinical_image as { size?: unknown }).size !== 'number'
  ) {
    throw new ContractValidationError(
      'clinical_image',
      'clinical_image must be a valid File'
    );
  }

  if (req.dermoscopic_image !== undefined && req.dermoscopic_image !== null) {
    if (
      typeof req.dermoscopic_image !== 'object' ||
      typeof (req.dermoscopic_image as { name?: unknown }).name !== 'string' ||
      typeof (req.dermoscopic_image as { size?: unknown }).size !== 'number'
    ) {
      throw new ContractValidationError(
        'dermoscopic_image',
        'dermoscopic_image must be a valid File when provided'
      );
    }
  }

  if (req.skin_tone !== undefined && req.skin_tone !== null) {
    if (typeof req.skin_tone !== 'number' || Number.isNaN(req.skin_tone)) {
      throw new ContractValidationError(
        'skin_tone',
        'skin_tone must be a number when provided'
      );
    }
    if (req.skin_tone < 0 || req.skin_tone > 5) {
      throw new ContractValidationError(
        'skin_tone',
        'skin_tone must be in the range [0, 5]'
      );
    }
  }

  return {
    clinical_image: req.clinical_image as File,
    ...(req.dermoscopic_image ? { dermoscopic_image: req.dermoscopic_image as File } : {}),
    ...(req.skin_tone !== undefined && req.skin_tone !== null
      ? { skin_tone: req.skin_tone as number }
      : {}),
  };
}

export function validatePredictResponse(data: unknown): PredictResponse {
  if (!data || typeof data !== 'object') {
    throw new ContractValidationError('response', 'Response must be a non-null object');
  }

  const res = data as Record<string, unknown>;

  // 1. predicted_class -> string
  if (typeof res.predicted_class !== 'string') {
    throw new ContractValidationError(
      'predicted_class',
      `Expected string, received ${typeof res.predicted_class}`
    );
  }

  // 2. confidence -> number
  if (typeof res.confidence !== 'number' || Number.isNaN(res.confidence)) {
    throw new ContractValidationError(
      'confidence',
      `Expected valid number, received ${typeof res.confidence}`
    );
  }

  // 3. malignant_probability -> number
  if (
    typeof res.malignant_probability !== 'number' ||
    Number.isNaN(res.malignant_probability)
  ) {
    throw new ContractValidationError(
      'malignant_probability',
      `Expected valid number, received ${typeof res.malignant_probability}`
    );
  }

  // 4. per_class_probs -> Record<string, number>
  if (!res.per_class_probs || typeof res.per_class_probs !== 'object' || Array.isArray(res.per_class_probs)) {
    throw new ContractValidationError(
      'per_class_probs',
      'per_class_probs must be an object (Record<string, number>)'
    );
  }

  const probs = res.per_class_probs as Record<string, unknown>;
  for (const [key, value] of Object.entries(probs)) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new ContractValidationError(
        `per_class_probs.${key}`,
        `Probability for class '${key}' must be a number, received ${typeof value}`
      );
    }
  }

  // 5. concept_scores -> required seven numeric fields
  if (!res.concept_scores || typeof res.concept_scores !== 'object' || Array.isArray(res.concept_scores)) {
    throw new ContractValidationError(
      'concept_scores',
      'concept_scores must be an object containing the seven required concept scores'
    );
  }

  const concepts = res.concept_scores as Record<string, unknown>;
  for (const conceptKey of REQUIRED_CONCEPT_KEYS) {
    const val = concepts[conceptKey];
    if (typeof val !== 'number' || Number.isNaN(val)) {
      throw new ContractValidationError(
        `concept_scores.${conceptKey}`,
        `Required concept score '${conceptKey}' is missing or not a number`
      );
    }
  }

  // 6. explainability_overlay -> string
  if (typeof res.explainability_overlay !== 'string') {
    throw new ContractValidationError(
      'explainability_overlay',
      `Expected string, received ${typeof res.explainability_overlay}`
    );
  }

  // 7. model_version -> string
  if (typeof res.model_version !== 'string') {
    throw new ContractValidationError(
      'model_version',
      `Expected string, received ${typeof res.model_version}`
    );
  }

  return {
    predicted_class: res.predicted_class,
    confidence: res.confidence,
    malignant_probability: res.malignant_probability,
    per_class_probs: res.per_class_probs as Record<string, number>,
    concept_scores: {
      ulceration_crust: concepts.ulceration_crust as number,
      hair: concepts.hair as number,
      vasculature: concepts.vasculature as number,
      erythema: concepts.erythema as number,
      pigmented: concepts.pigmented as number,
      gel_fluid: concepts.gel_fluid as number,
      skin_markings: concepts.skin_markings as number,
    },
    explainability_overlay: res.explainability_overlay,
    model_version: res.model_version,
  };
}
