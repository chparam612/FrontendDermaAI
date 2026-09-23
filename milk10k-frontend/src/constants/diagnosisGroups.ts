/**
 * Diagnosis class groups: Malignant vs Benign.
 * Single source of truth for clinical classification across MILK10k frontend components.
 */

export const MALIGNANT_CLASSES = new Set([
  'BCC',
  'MEL',
  'SCCKA',
  'AKIEC',
  'MAL_OTH',
]);

export const BENIGN_CLASSES = new Set([
  'NV',
  'BKL',
  'DF',
  'VASC',
  'BEN_OTH',
  'INF',
]);

/**
 * 5 rarest (tail) diagnostic classes in the MILK10k dataset:
 * MAL_OTH, DF, INF, VASC, BEN_OTH.
 */
export const TAIL_CLASSES = [
  'MAL_OTH',
  'DF',
  'INF',
  'VASC',
  'BEN_OTH',
] as const;

export type TailClass = typeof TAIL_CLASSES[number];
