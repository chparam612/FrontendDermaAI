export interface ProvenanceReport {
  source: string;
  model_architecture: string;
  experiment_name: string;
  seed: number;
  split_file: string;
  split_sha256: string;
  modality_evaluated: string;
  total_test_samples: number;
}

export interface OverallTestMetrics {
  source: string;
  macro_f1: number;
  seed43_replicate_macro_f1?: number;
  accuracy: number;
  balanced_accuracy: number;
  weighted_f1: number;
  macro_auroc: number;
}

export interface MalignantVsBenignMetrics {
  source: string;
  malignant_classes: string[];
  sensitivity: number;
  specificity: number;
  false_negative_count: number;
  false_positive_count: number;
  true_positive_count: number;
  true_negative_count: number;
  total_malignant: number;
  total_benign: number;
}

export interface ClassMetric {
  recall: number;
  f1_score: number;
  precision: number;
  support: number;
  is_tail_class: boolean;
}

export interface PerClassMetrics {
  source: string;
  classes: Record<string, ClassMetric>;
}

export interface SubgroupMetric {
  sample_count: number;
  accuracy: number;
  balanced_accuracy: number;
  macro_f1: number;
  low_confidence: boolean;
}

export interface SkinToneSubgroupMetrics {
  source: string;
  subgroups: Record<string, SubgroupMetric>;
  accuracy_disparity: number;
  balanced_accuracy_disparity: number;
  disparity_caveat: string;
}

export interface CaveatsReport {
  source: string;
  single_run: string;
  seed_variance: string;
  internal_test_split: string;
  tail_class_supports: Record<string, number>;
  published_benchmark_incomparability: string;
  clinical_decision_support_only: string;
}

export interface ReportSummaryPayload {
  status: string;
  provenance: ProvenanceReport;
  overall_test_metrics: OverallTestMetrics;
  malignant_vs_benign_metrics: MalignantVsBenignMetrics;
  per_class_metrics: PerClassMetrics;
  skin_tone_subgroup_metrics: SkinToneSubgroupMetrics;
  caveats: CaveatsReport;
}
